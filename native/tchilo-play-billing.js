/**
 * Tchilo Play Billing — compras na app Android
 * Product IDs (criar na Play Console → Produtos de compra única, tipo consumível):
 *   moedas_70 → 70 | moedas_280 → 280 | moedas_700 → 700 | moedas_1400 → 1400
 *   moedas_2450 → 2450 | moedas_3500 → 3500 | moedas_4900 → 4900
 *   anuncio_1d, anuncio_3d, anuncio_7d, anuncio_14d, anuncio_30d → anúncios (1 US$ por dia)
 *   tchilo_plus → plano Plus (ver tchilo-premium.js)
 *
 * Site/browser continua a usar Paddle.
 */
(function () {
  'use strict';
  if (window.__tchiloPlayBillingV1) return;
  window.__tchiloPlayBillingV1 = true;

  /** productId Play → número de moedas */
  var PLAY_PACKS = {
    moedas_70: 70,
    moedas_280: 280,
    moedas_700: 700,
    moedas_1400: 1400,
    moedas_2450: 2450,
    moedas_3500: 3500,
    moedas_4900: 4900
  };

  /** dias de anúncio → productId Play (1 US$ por dia) */
  var PLAY_AD_PACKS = {
    1: 'anuncio_1d',
    3: 'anuncio_3d',
    7: 'anuncio_7d',
    14: 'anuncio_14d',
    30: 'anuncio_30d'
  };

  function isNativeAndroid() {
    try {
      if (!window.Capacitor) return false;
      if (typeof window.Capacitor.isNativePlatform === 'function' && !window.Capacitor.isNativePlatform()) {
        return false;
      }
      var p =
        (window.Capacitor.getPlatform && window.Capacitor.getPlatform()) ||
        (window.Capacitor.platform) ||
        '';
      return String(p).toLowerCase() === 'android';
    } catch (e) {
      return false;
    }
  }

  function toast(msg) {
    try {
      if (typeof showToast === 'function') showToast(msg);
      else if (window.tchiloToast) window.tchiloToast(msg);
      else alert(msg);
    } catch (e) {}
  }

  function uid() {
    try {
      if (typeof getSession === 'function') {
        var s = getSession();
        if (s && (s.id || s.username)) return s.id || s.username;
      }
      var raw = localStorage.getItem('tchilo_session');
      if (raw) {
        var o = JSON.parse(raw);
        return o.id || o.username || 'anon';
      }
    } catch (e) {}
    return 'anon';
  }

  function getCoins() {
    try {
      var n = parseInt(localStorage.getItem('tchilo_coins_' + uid()) || '0', 10);
      return isNaN(n) ? 0 : Math.max(0, n);
    } catch (e) {
      return 0;
    }
  }

  function setCoins(n) {
    try {
      localStorage.setItem('tchilo_coins_' + uid(), String(Math.max(0, n | 0)));
    } catch (e) {}
    try {
      window.dispatchEvent(new CustomEvent('tchilo-coins-updated', { detail: { coins: n } }));
    } catch (e2) {}
  }

  function creditCoins(amount) {
    var next = getCoins() + (amount | 0);
    setCoins(next);
    try {
      if (window.tchiloCloud && typeof window.tchiloCloud.syncNormalized === 'function') {
        window.tchiloCloud.syncNormalized('coins', { balance: next, user: uid() });
      }
    } catch (e) {}
    return next;
  }

  async function getNativePurchases() {
    try {
      if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.NativePurchases) {
        return window.Capacitor.Plugins.NativePurchases;
      }
    } catch (e) {}
    try {
      var mod = await import('@capgo/native-purchases');
      return mod.NativePurchases || mod.default || mod;
    } catch (e2) {}
    return null;
  }

  /**
   * Compra pack de moedas via Google Play
   * @param {{ coins: number, playProductId?: string }} pack
   */
  async function buyCoinsPlay(pack) {
    if (!isNativeAndroid()) {
      return { ok: false, reason: 'not_android' };
    }
    var productId = (pack && pack.playProductId) || 'moedas_70';
    var coins = PLAY_PACKS[productId] || (pack && pack.coins) || 70;

    var NP = await getNativePurchases();
    if (!NP || typeof NP.purchaseProduct !== 'function') {
      toast('Compras Google Play ainda a configurar. Atualiza a app e tenta de novo.');
      console.warn('Tchilo Play Billing: plugin NativePurchases não disponível');
      return { ok: false, reason: 'no_plugin' };
    }

    try {
      toast('A abrir Google Play…');
      var result = await NP.purchaseProduct({
        productIdentifier: productId,
        productType: 'INAPP',
        quantity: 1
      });

      /* sucesso */
      creditCoins(coins);
      toast('Recebeste ' + coins + ' moedas!');

      /* consumir para poder comprar de novo (consumable) */
      try {
        if (typeof NP.consumePurchase === 'function' && result && result.purchaseToken) {
          await NP.consumePurchase({ purchaseToken: result.purchaseToken, productIdentifier: productId });
        } else if (typeof NP.finishTransaction === 'function') {
          await NP.finishTransaction({ productIdentifier: productId, isConsumable: true });
        }
      } catch (ce) {
        console.warn('consume', ce);
      }

      return { ok: true, coins: coins, result: result };
    } catch (e) {
      var msg = (e && (e.message || e.errorMessage)) || String(e || '');
      if (/cancel|user.?cancel|canceled/i.test(msg)) {
        toast('Compra cancelada');
        return { ok: false, reason: 'cancel' };
      }
      console.warn('Play purchase error', e);
      toast('Não foi possível concluir a compra. Tenta de novo.');
      return { ok: false, reason: 'error', error: e };
    }
  }

  /**
   * Compra de anúncio via Google Play (consumível).
   * @param {number} days 1, 3, 7, 14 ou 30
   * @returns {Promise<{ok:boolean}>}
   */
  async function buyAdPlay(days) {
    if (!isNativeAndroid()) return { ok: false, reason: 'not_android' };
    var productId = PLAY_AD_PACKS[days];
    if (!productId) return { ok: false, reason: 'bad_days' };
    var NP = await getNativePurchases();
    if (!NP || typeof NP.purchaseProduct !== 'function') {
      toast('Compras Google Play ainda a configurar. Atualiza a app e tenta de novo.');
      return { ok: false, reason: 'no_plugin' };
    }
    try {
      toast('A abrir Google Play…');
      var result = await NP.purchaseProduct({ productIdentifier: productId, productType: 'INAPP', quantity: 1 });
      try {
        if (typeof NP.consumePurchase === 'function' && result && result.purchaseToken) {
          await NP.consumePurchase({ purchaseToken: result.purchaseToken, productIdentifier: productId });
        }
      } catch (ce) {
        console.warn('consume ad', ce);
      }
      return { ok: true, result: result, productId: productId };
    } catch (e) {
      var msg = (e && (e.message || e.errorMessage)) || String(e || '');
      toast(/cancel/i.test(msg) ? 'Compra cancelada' : 'Não foi possível concluir a compra. Tenta de novo.');
      return { ok: false, reason: /cancel/i.test(msg) ? 'cancel' : 'error' };
    }
  }

  /** arredonda para o pacote Play disponível (1, 3, 7, 14, 30) */
  function snapAdDays(d) {
    var tiers = [1, 3, 7, 14, 30];
    d = parseInt(d, 10) || 1;
    for (var i = 0; i < tiers.length; i++) if (tiers[i] >= d) return tiers[i];
    return 30;
  }

  /** compra o anúncio no Play e ativa-o na base de dados. cb(ok) no fim. */
  async function playAdPurchase(adId, days, cb) {
    days = snapAdDays(days);
    var r = await buyAdPlay(days);
    if (!r.ok) {
      if (cb) cb(false);
      return r;
    }
    try {
      var SB = window.SB || window.tchiloSupabase || window.supabaseClient;
      if (SB && adId) {
        var starts = new Date();
        var ends = new Date(starts.getTime() + days * 86400000);
        var token = (r.result && (r.result.purchaseToken || r.result.transactionId || r.result.orderId)) || r.productId;
        await SB.from('ads')
          .update({
            status: 'active',
            days: days,
            reach_min: days * 800,
            reach_max: days * 1000,
            starts_at: starts.toISOString(),
            ends_at: ends.toISOString(),
            paddle_txn: String(token).slice(0, 120),
            updated_at: new Date().toISOString()
          })
          .eq('id', adId)
          .eq('status', 'pending');
      }
      toast('Anúncio pago e publicado!');
    } catch (e) {
      console.warn('activate ad (play)', e);
    }
    if (cb) cb(true);
    return r;
  }

  window.tchiloSnapAdDays = snapAdDays;
  window.tchiloPlayAdPurchase = playAdPurchase;
  window.tchiloBuyAdPlay = buyAdPlay;
  window.tchiloAdPlayDays = [1, 3, 7, 14, 30];
  window.tchiloBuyCoinsPlay = buyCoinsPlay;
  window.tchiloPlayBillingReady = true;
  window.tchiloIsNativeAndroid = isNativeAndroid;

  /* Patch do saldo: na app Android usa Play em vez de Paddle */
  function patchSaldoBuy() {
    if (!isNativeAndroid()) return;
    /* intercepta cliques em comprar no sheet de moedas */
    document.addEventListener(
      'click',
      function (e) {
        if (!isNativeAndroid()) return;
        var btn =
          e.target &&
          e.target.closest &&
          e.target.closest(
            '#tchiloCoinsSheet [data-a="buy"], #tchiloSaldoSheet [data-a="buy"], #tchiloCoinsSheet button.buy, #tchiloSaldoSheet button.buy, [data-tchilo-buy-coins]'
          );
        if (!btn) return;
        e.preventDefault();
        e.stopPropagation();
        var coins = parseInt(btn.getAttribute('data-coins') || '70', 10) || 70;
        var pid = btn.getAttribute('data-play-id') || 'moedas_70';
        buyCoinsPlay({ coins: coins, playProductId: pid });
      },
      true
    );
  }

  patchSaldoBuy();
  setTimeout(patchSaldoBuy, 800);
})();

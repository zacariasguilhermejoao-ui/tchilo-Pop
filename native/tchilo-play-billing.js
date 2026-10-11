/**
 * Tchilo Play Billing — compras na app Android
 * Product IDs (criar na Play Console → One-time products):
 *   moedas_70  → 70 moedas
 *
 * Site/browser continua a usar Paddle.
 */
(function () {
  'use strict';
  if (window.__tchiloPlayBillingV1) return;
  window.__tchiloPlayBillingV1 = true;

  /** productId Play → número de moedas */
  var PLAY_PACKS = {
    moedas_70: 70
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
    var coins = (pack && pack.coins) || PLAY_PACKS[productId] || 70;

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

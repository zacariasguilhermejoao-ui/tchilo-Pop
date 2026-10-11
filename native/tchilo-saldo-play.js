/**
 * Liga o Saldo ao Google Play na app Android
 * (sobrepõe o bloqueio antigo "isNative → return")
 */
(function () {
  'use strict';
  if (window.__tchiloSaldoPlayV1) return;
  window.__tchiloSaldoPlayV1 = true;

  function isNative() {
    try {
      if (window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()) {
        return true;
      }
    } catch (e) {}
    return false;
  }

  function patchOpenCoins() {
    if (typeof window.tchiloOpenSaldo !== 'function' && typeof window.openSaldo !== 'function') return;

    /* Re-abrir sheet de moedas com botão sempre visível na app */
    var origOpen = null;
    try {
      /* força CSS: não esconder botão comprar */
      var st = document.getElementById('tchiloSaldoPlayCSS');
      if (!st) {
        st = document.createElement('style');
        st.id = 'tchiloSaldoPlayCSS';
        (document.head || document.documentElement).appendChild(st);
      }
      st.textContent =
        'body.tchilo-native-store #tchiloCoinsSheet .tc-foot,' +
        'body.tchilo-native-store #tchiloCoinsSheet .tc-buy,' +
        '#tchiloCoinsSheet .tc-foot,#tchiloCoinsSheet .tc-buy{' +
        'display:block!important;visibility:visible!important;opacity:1!important;}';
    } catch (e) {}
  }

  function wireBuyButton() {
    var sheet = document.getElementById('tchiloCoinsSheet');
    if (!sheet) return;

    /* garantir footer com botão */
    if (!sheet.querySelector('.tc-buy, [data-a="buy"]')) {
      var foot = sheet.querySelector('.tc-foot');
      if (!foot) {
        foot = document.createElement('div');
        foot.className = 'tc-foot';
        foot.style.cssText =
          'position:fixed;left:0;right:0;bottom:0;padding:12px 16px calc(12px + env(safe-area-inset-bottom));background:var(--paper,#F6F1E7);';
        sheet.appendChild(foot);
      }
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'tc-buy';
      btn.setAttribute('data-a', 'buy');
      btn.setAttribute('data-coins', '70');
      btn.setAttribute('data-play-id', 'moedas_70');
      btn.setAttribute('data-tchilo-buy-coins', '1');
      btn.textContent = isNative() ? 'Comprar com Google Play' : 'Recarregar';
      btn.style.cssText =
        'width:100%;padding:16px;border:0;border-radius:16px;background:#0B0B0C;color:#fff;font-weight:900;font-size:16px;';
      foot.appendChild(btn);
    } else {
      var b = sheet.querySelector('.tc-buy, [data-a="buy"]');
      if (b) {
        b.setAttribute('data-coins', '70');
        b.setAttribute('data-play-id', 'moedas_70');
        b.setAttribute('data-tchilo-buy-coins', '1');
        if (isNative()) b.textContent = 'Comprar com Google Play';
      }
    }
  }

  document.addEventListener(
    'click',
    function (e) {
      if (!isNative()) return;
      var btn =
        e.target &&
        e.target.closest &&
        e.target.closest('#tchiloCoinsSheet [data-a="buy"], #tchiloCoinsSheet .tc-buy, [data-tchilo-buy-coins]');
      if (!btn) return;
      e.preventDefault();
      e.stopPropagation();
      if (typeof window.tchiloBuyCoinsPlay === 'function') {
        window.tchiloBuyCoinsPlay({
          coins: parseInt(btn.getAttribute('data-coins') || '70', 10) || 70,
          playProductId: btn.getAttribute('data-play-id') || 'moedas_70'
        });
      } else {
        try {
          if (typeof showToast === 'function') showToast('Play Billing a carregar…');
        } catch (err) {}
      }
    },
    true
  );

  patchOpenCoins();
  setInterval(function () {
    if (document.getElementById('tchiloCoinsSheet') && document.getElementById('tchiloCoinsSheet').classList.contains('open')) {
      wireBuyButton();
    }
  }, 800);
})();

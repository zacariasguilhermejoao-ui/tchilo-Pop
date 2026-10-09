/**
 * Política de loja v1
 * - App Android (Play) = grátis
 * - Premium + Selo verificado = só no site (tchilopop.com)
 * - Web continua com Paddle normalmente
 */
(function () {
  'use strict';
  if (window.__tchiloStorePolicyV1) return;
  window.__tchiloStorePolicyV1 = true;

  var SITE = 'https://tchilopop.com';

  function isNativePlayApp() {
    try {
      if (window.Capacitor) {
        if (typeof window.Capacitor.isNativePlatform === 'function' && window.Capacitor.isNativePlatform()) {
          var p =
            typeof window.Capacitor.getPlatform === 'function'
              ? window.Capacitor.getPlatform()
              : '';
          if (p === 'android' || p === 'ios') return true;
          return true;
        }
      }
    } catch (e) {}
    try {
      var ua = navigator.userAgent || '';
      /* WebView Android típico */
      if (/Android/i.test(ua) && /\bwv\b|; wv\)/i.test(ua)) return true;
    } catch (e2) {}
    return false;
  }

  window.tchiloIsNativeStoreApp = isNativePlayApp;

  function toast(msg) {
    try {
      if (typeof showToast === 'function') showToast(String(msg));
      else alert(String(msg));
    } catch (e) {}
  }

  function openSite(path) {
    var url = SITE + (path || '/');
    try {
      if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Browser) {
        window.Capacitor.Plugins.Browser.open({ url: url });
        return;
      }
    } catch (e) {}
    try {
      window.open(url, '_blank');
    } catch (e2) {
      try {
        location.href = url;
      } catch (e3) {}
    }
  }

  /**
   * Se estiver na app da loja, bloqueia checkout in-app e manda ao site.
   * @returns {boolean} true = bloqueou (não continuar Paddle na app)
   */
  function blockInAppPurchase(kind) {
    if (!isNativePlayApp()) return false;
    var label = kind === 'verified' ? 'Selo verificado' : 'Tchilo Premium';
    toast(label + ' compra-se em tchilopop.com — a app é grátis.');
    openSite(kind === 'verified' ? '/?verified=1' : '/?premium=1');
    return true;
  }

  window.tchiloBlockInAppPurchase = blockInAppPurchase;

  /* Patch Premium */
  function patchPremium() {
    if (typeof window.tchiloOpenPremium !== 'function') return;
    if (window.tchiloOpenPremium.__storePolicy) return;
    var orig = window.tchiloOpenPremium;
    window.tchiloOpenPremium = function () {
      /* ainda mostra o ecrã informativo; o botão pagar é que bloqueia */
      return orig.apply(this, arguments);
    };
    window.tchiloOpenPremium.__storePolicy = true;
  }

  /* Interceptar cliques em botões .pay dentro dos sheets */
  document.addEventListener(
    'click',
    function (e) {
      if (!isNativePlayApp()) return;
      var btn = e.target && e.target.closest ? e.target.closest('button.pay, [data-a="pay"]') : null;
      if (!btn) return;
      var inPrem = btn.closest('#tchiloPremiumSheet');
      var inVer = btn.closest('#tchiloVerifiedSheet');
      if (!inPrem && !inVer) return;
      e.preventDefault();
      e.stopPropagation();
      blockInAppPurchase(inVer ? 'verified' : 'premium');
    },
    true
  );

  setTimeout(patchPremium, 500);
  setTimeout(patchPremium, 2000);
})();

/**
 * Política de loja v2 (Play-safe)
 * - App nativa = grátis, SEM checkout e SEM link para pagar no site
 * - Premium / Selo: compra só no browser (tchilopop.com)
 * - Na app: pode ver estado "já ativo" se a conta comprou no site
 */
(function () {
  'use strict';
  if (window.__tchiloStorePolicyV2) return;
  window.__tchiloStorePolicyV2 = true;
  window.__tchiloStorePolicyV1 = true;

  function isNativeStoreApp() {
    try {
      if (window.Capacitor) {
        if (
          typeof window.Capacitor.isNativePlatform === 'function' &&
          window.Capacitor.isNativePlatform()
        ) {
          return true;
        }
      }
    } catch (e) {}
    try {
      var ua = navigator.userAgent || '';
      if (/Android/i.test(ua) && /\bwv\b|; wv\)/i.test(ua)) return true;
    } catch (e2) {}
    return false;
  }

  window.tchiloIsNativeStoreApp = isNativeStoreApp;

  /** Sempre bloqueia compra na app (sem abrir site) */
  function blockInAppPurchase() {
    if (!isNativeStoreApp()) return false;
    return true;
  }
  window.tchiloBlockInAppPurchase = blockInAppPurchase;

  function injectHideCSS() {
    if (!isNativeStoreApp()) return;
    var st = document.getElementById('tchilo-store-policy-css');
    if (!st) {
      st = document.createElement('style');
      st.id = 'tchilo-store-policy-css';
      (document.head || document.documentElement).appendChild(st);
    }
    st.textContent =
      /* Esconder botões de pagar / preços de checkout */
      '#tchiloPremiumSheet button.pay,' +
      '#tchiloPremiumSheet [data-a="pay"],' +
      '#tchiloPremiumSheet .tp-price,' +
      '#tchiloVerifiedSheet button.pay,' +
      '#tchiloVerifiedSheet [data-a="pay"],' +
      '#tchiloVerifiedSheet .tv-price{' +
      'display:none!important;}' +
      /* Nota informativa (sem link de pagamento) */
      '#tchiloPremiumSheet .tchilo-store-note,' +
      '#tchiloVerifiedSheet .tchilo-store-note{display:block!important;}';
  }

  function addNote(sheetSel, text) {
    try {
      var sheet = document.querySelector(sheetSel);
      if (!sheet || !sheet.classList.contains('open')) return;
      if (sheet.querySelector('.tchilo-store-note')) return;
      var scroll = sheet.querySelector('.tp-scroll, .tv-scroll') || sheet;
      var note = document.createElement('p');
      note.className = 'tchilo-store-note';
      note.setAttribute('role', 'status');
      note.style.cssText =
        'text-align:center;font-size:13px;font-weight:600;opacity:.7;line-height:1.45;margin:12px 0 8px;padding:0 8px;';
      note.textContent = text;
      /* inserir antes do botão fechar se existir */
      var closeBtn = sheet.querySelector('button.close, [data-a="close"]');
      if (closeBtn && closeBtn.parentNode) {
        closeBtn.parentNode.insertBefore(note, closeBtn);
      } else {
        scroll.appendChild(note);
      }
    } catch (e) {}
  }

  function scrubSheets() {
    if (!isNativeStoreApp()) return;
    injectHideCSS();
    try {
      document
        .querySelectorAll(
          '#tchiloPremiumSheet button.pay, #tchiloPremiumSheet [data-a="pay"],' +
            '#tchiloVerifiedSheet button.pay, #tchiloVerifiedSheet [data-a="pay"]'
        )
        .forEach(function (btn) {
          try {
            btn.style.display = 'none';
            btn.setAttribute('disabled', 'true');
            btn.onclick = function (e) {
              if (e) {
                e.preventDefault();
                e.stopPropagation();
              }
              return false;
            };
          } catch (err) {}
        });
    } catch (e) {}
    addNote(
      '#tchiloPremiumSheet',
      'A app é gratuita. O Tchilo Premium gere-se na conta no site, no browser.'
    );
    addNote(
      '#tchiloVerifiedSheet',
      'A app é gratuita. O selo verificado gere-se na conta no site, no browser.'
    );
  }

  /* Bloquear clique em pagar (fallback) */
  document.addEventListener(
    'click',
    function (e) {
      if (!isNativeStoreApp()) return;
      var btn = e.target && e.target.closest ? e.target.closest('button.pay, [data-a="pay"]') : null;
      if (!btn) return;
      if (!btn.closest('#tchiloPremiumSheet, #tchiloVerifiedSheet')) return;
      e.preventDefault();
      e.stopPropagation();
    },
    true
  );

  /* Quando abrem os sheets, limpar CTAs de compra */
  function watchOpen() {
    if (!isNativeStoreApp()) return;
    try {
      new MutationObserver(function () {
        scrubSheets();
      }).observe(document.body || document.documentElement, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class']
      });
    } catch (e) {}
  }

  injectHideCSS();
  scrubSheets();
  watchOpen();
  setTimeout(scrubSheets, 600);
  setTimeout(scrubSheets, 2000);
})();

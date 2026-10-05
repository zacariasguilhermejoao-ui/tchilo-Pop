/**
 * tchilo-Pop — ícone Feed = texto "Fee" (design pedido pelo user)
 * v4
 */
(function () {
  "use strict";
  if (window.__tchiloFeedIconV4) return;
  window.__tchiloFeedIconV4 = true;
  window.__tchiloFeedIconV3 = true;
  window.__tchiloFeedIconV2 = true;

  var FEE_HTML =
    '<span class="nav-text-icon nav-fee" aria-hidden="true">Fee</span>';

  function injectCSS() {
    if (document.getElementById('tchiloFeeIconCSS')) return;
    var st = document.createElement('style');
    st.id = 'tchiloFeeIconCSS';
    st.textContent =
      '.nav-item .nav-text-icon.nav-fee,.nav-fee{' +
      'display:inline-flex!important;align-items:center;justify-content:center;' +
      'width:auto;min-width:36px;height:32px;line-height:1;' +
      'font:900 20px "Segoe Script","Apple Chancery",cursive,Inter,system-ui,sans-serif!important;' +
      'letter-spacing:-0.02em;color:currentColor;' +
      'user-select:none;-webkit-user-select:none;' +
      'opacity:1!important;visibility:visible!important;}' +
      '.nav-item[data-screen="feed"] svg.nav-feed-icon,' +
      '.nav-item[data-screen="feed"] > svg{display:none!important;}';
    (document.head || document.documentElement).appendChild(st);
  }

  function apply() {
    try {
      injectCSS();
      var btn = document.querySelector('.navbar .nav-item[data-screen="feed"]');
      if (!btn) return;

      /* remove house / other svgs — keep only Fee */
      btn.querySelectorAll('svg, .nav-feed-icon').forEach(function (n) {
        try { n.remove(); } catch (e) {}
      });

      if (!btn.querySelector('.nav-fee')) {
        var dot = btn.querySelector('.dot');
        if (dot) dot.insertAdjacentHTML('beforebegin', FEE_HTML);
        else btn.insertAdjacentHTML('afterbegin', FEE_HTML);
      }

      btn.setAttribute('data-custom-feed-icon', '1');
      btn.setAttribute('aria-label', 'Feed');
    } catch (e) {}
  }

  function boot() {
    apply();
    setTimeout(apply, 300);
    setTimeout(apply, 1000);
    setTimeout(apply, 2000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();

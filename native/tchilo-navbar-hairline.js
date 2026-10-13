/**
 * Tchilo — linha acima da navbar (feed/reels/notifs/perfil) a 0.5px
 * v1 — anula border-top:1px do index e qualquer override
 */
(function () {
  'use strict';
  if (window.__tchiloNavbarHairlineV1) return;
  window.__tchiloNavbarHairlineV1 = true;

  var CSS =
    'html body .navbar,' +
    'html body nav.navbar,' +
    'html body #appFrame > .navbar,' +
    'html body #appFrame .navbar,' +
    'html body .app > .navbar,' +
    'html body footer.navbar{' +
    'border-top:0.5px solid var(--line, rgba(11,11,12,.14))!important;' +
    'border-top-width:0.5px!important;' +
    'border-top-style:solid!important;' +
    'border-top-color:var(--line, rgba(11,11,12,.14))!important;' +
    'border-bottom:none!important;' +
    'border-bottom-width:0!important;' +
    'box-shadow:none!important;' +
    'outline:none!important;}' +
    /* desktop: laterais também 0.5px (index mete 3px) */
    '@media (min-width:761px){' +
    'html body .navbar, html body nav.navbar{' +
    'border-left-width:0.5px!important;' +
    'border-right-width:0.5px!important;' +
    'border-left-style:solid!important;' +
    'border-right-style:solid!important;' +
    'border-left-color:var(--line, rgba(11,11,12,.14))!important;' +
    'border-right-color:var(--line, rgba(11,11,12,.14))!important;}' +
    '}';

  function inject() {
    var st = document.getElementById('tchiloNavbarHairlineCSS');
    if (!st) {
      st = document.createElement('style');
      st.id = 'tchiloNavbarHairlineCSS';
      (document.head || document.documentElement).appendChild(st);
    }
    st.textContent = CSS;
    /* re-append to end so it wins cascade order */
    try {
      document.head.appendChild(st);
    } catch (e) {}
  }

  function forceEl() {
    try {
      var list = document.querySelectorAll('.navbar, nav.navbar');
      for (var i = 0; i < list.length; i++) {
        var nav = list[i];
        nav.style.setProperty('border-top-width', '0.5px', 'important');
        nav.style.setProperty('border-top-style', 'solid', 'important');
        nav.style.setProperty(
          'border-top-color',
          getComputedStyle(document.documentElement).getPropertyValue('--line').trim() ||
            'rgba(11,11,12,0.14)',
          'important'
        );
        nav.style.setProperty('border-bottom-width', '0', 'important');
        nav.style.setProperty('box-shadow', 'none', 'important');
      }
    } catch (e) {}
  }

  function run() {
    inject();
    forceEl();
  }

  run();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  }
  [50, 200, 600, 1500, 4000].forEach(function (ms) {
    setTimeout(run, ms);
  });

  try {
    new MutationObserver(function () {
      forceEl();
    }).observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class']
    });
  } catch (e) {}
})();

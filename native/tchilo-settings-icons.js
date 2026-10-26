/**
 * tchilo-settings-icons v33
 * Ícones das definições na mesma família (círculo cheio + símbolo)
 * + Toggle switches pretos quando ligados
 * + Botão voltar sempre visível em Guardados e subpáginas
 */
(function () {
  'use strict';
  if (window.__TCHILO_SI_V34) return;
  window.__TCHILO_SI_V34 = true;
  window.__TCHILO_SI_V33 = true;
  window.__TCHILO_SI_V32 = true;
  window.__TCHILO_SI_V31 = true;
  window.__TCHILO_SI_V30 = true;
  window.__TCHILO_SI_V29 = true;
  window.__TCHILO_SI_V26 = true;

  var BASE = 'native/settings-icons/';
  var VER = '?v=3d1';

  /* Família única: círculo cheio + símbolo na cor do fundo (igual a "Tempo e bem-estar") */
  function fam(inner) {
    return (
      '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" aria-hidden="true" data-fam="1">' +
      '<circle cx="12" cy="12" r="10" fill="currentColor"/>' +
      '<g transform="translate(5.04 5.04) scale(.58)" style="color:var(--paper,#fff)" stroke="currentColor" ' +
      'stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">' +
      inner +
      '</g></svg>'
    );
  }

  var G = {
    badge:
      '<path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="m9 12 2 2 4-4"/>',
    megaphone:
      '<path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>',
    user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    bell: '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>',
    plus: '<circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/>',
    bookmark: '<path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>',
    lock: '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    doc: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8"/>',
    globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
    contrast: '<circle cx="12" cy="12" r="9"/><path d="M12 3v18" /><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor"/>',
    sliders:
      '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',
    star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
    pencil: '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>',
    help: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>'
  };

  var ICONS = {
    'selo verificado': fam(G.badge),
    'gestor de anuncios': fam(G.megaphone),
    'meus anuncios': fam(G.megaphone),
    'anuncios': fam(G.megaphone),
    'conta': fam(G.user),
    'notificacoes': fam(G.bell),
    'notifications': fam(G.bell),
    'stories': fam(G.plus),
    'guardados': fam(G.bookmark),
    'privacidade e visibilidade': fam(G.lock),
    'privacidade': fam(G.lock),
    'legal': fam(G.doc),
    'idioma': fam(G.globe),
    'tema': fam(G.contrast),
    'conta avancada': fam(G.sliders),
    'avancada': fam(G.sliders),
    'tchilo premium': fam(G.star),
    'editar perfil': fam(G.pencil),
    'palavra-passe e seguranca': fam(G.lock),
    'suporte': fam(G.help)
  };

  /* ícones de contorno (subpáginas) → mesma família */
  function famPass(root) {
    if (!root || !root.querySelectorAll) return;
    root.querySelectorAll('.settings-item .si-icon svg').forEach(function (sv) {
      if (sv.getAttribute('data-fam')) return;
      var first = sv.firstElementChild;
      if (
        first &&
        first.tagName.toLowerCase() === 'circle' &&
        first.getAttribute('r') === '10' &&
        /currentcolor/i.test(first.getAttribute('fill') || '')
      ) {
        sv.setAttribute('data-fam', '1');
        return;
      }
      if ((sv.getAttribute('viewBox') || '') !== '0 0 24 24') return;
      var host = sv.parentNode;
      var inner = sv.innerHTML;
      host.innerHTML = fam(inner);
    });
  }

  function injectCSS() {
    if (document.getElementById('tchilo-si-css-v34')) return;
    var st = document.createElement('style');
    st.id = 'tchilo-si-css-v34';
    st.textContent =
      '#screen-settings .settings-item .si-icon,' +
      '[id^="screen-settings"] .settings-item .si-icon,' +
      '.settings-list .settings-item .si-icon,' +
      '#tchiloAdsMgrBtn .si-icon{' +
      'width:32px!important;height:32px!important;min-width:32px!important;' +
      'display:flex!important;align-items:center!important;justify-content:center!important;' +
      'flex-shrink:0!important;overflow:visible!important;}' +
      '#screen-settings .settings-item .si-icon img,' +
      '[id^="screen-settings"] .settings-item .si-icon img,' +
      '.settings-list .settings-item .si-icon img,' +
      '#tchiloAdsMgrBtn .si-icon img{' +
      'display:block!important;visibility:visible!important;opacity:1!important;' +
      'width:28px!important;height:28px!important;object-fit:contain!important;' +
      'pointer-events:none!important;}' +
      '#screen-settings .settings-item .si-icon svg,' +
      '[id^="screen-settings"] .settings-item .si-icon svg,' +
      '.settings-list .settings-item .si-icon svg,' +
      '#tchiloAdsMgrBtn .si-icon svg{' +
      'display:block!important;visibility:visible!important;opacity:1!important;' +
      'width:28px!important;height:28px!important;}' +

      /* Toggle switch — ligado = preto */
      '.settings-toggle{' +
      'width:48px!important;height:28px!important;border-radius:14px!important;' +
      'border:none!important;background:color-mix(in srgb, var(--ink) 18%, transparent)!important;' +
      'position:relative!important;flex-shrink:0!important;' +
      'transition:background .2s ease!important;' +
      'display:block!important;box-sizing:border-box!important;' +
      '}' +
      '.settings-toggle::after{' +
      'content:""!important;position:absolute!important;top:3px!important;left:3px!important;' +
      'width:22px!important;height:22px!important;border-radius:50%!important;' +
      'background:#fff!important;box-shadow:0 1px 3px rgba(0,0,0,.22)!important;' +
      'transition:transform .2s ease!important;' +
      'mask:none!important;-webkit-mask:none!important;opacity:1!important;' +
      'transform:translateX(0)!important;' +
      '}' +
      '.settings-toggle.on{' +
      'background:var(--ink,#0B0B0C)!important;border-color:transparent!important;' +
      '}' +
      '.settings-toggle.on::after{' +
      'transform:translateX(20px)!important;background:#fff!important;opacity:1!important;' +
      '}' +
      '.settings-toggle:active{transform:none!important;}' +

      /* Botão VOLTAR */
      '#screen-saved .screen-header .back-btn,' +
      '#screen-settings .screen-header .back-btn,' +
      '[id^="screen-settings-"] .screen-header .back-btn,' +
      '#screen-notifs .screen-header .back-btn{' +
      'display:flex!important;visibility:visible!important;opacity:1!important;' +
      'width:36px!important;height:36px!important;min-width:36px!important;' +
      'border:0!important;background:transparent!important;box-shadow:none!important;' +
      'border-radius:50%!important;flex-shrink:0!important;cursor:pointer!important;' +
      '}';
    document.head.appendChild(st);
  }

  function labelOf(btn) {
    try {
      var span = btn.querySelector('span');
      if (span && span.textContent) return span.textContent.trim();
      return (btn.textContent || '').trim().split('\n')[0].trim();
    } catch (e) {
      return '';
    }
  }

  function applyIn(root) {
    if (!root) return;
    root.querySelectorAll('.settings-item').forEach(function (btn) {
      if (btn.hasAttribute('data-own-icon')) return; /* linha com ícone próprio */
      var label = labelOf(btn);
      if (!label) return;
      var key = label
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
      var html = ICONS[key];
      if (!html) {
        for (var k in ICONS) {
          if (key.indexOf(k) !== -1 || k.indexOf(key) === 0) {
            html = ICONS[k];
            break;
          }
        }
      }
      if (!html && key.indexOf('anuncio') !== -1) html = ICONS['meus anuncios'];
      if (!html) return;
      var box = btn.querySelector('.si-icon');
      if (!box) return;
      if (box.getAttribute('data-si') === key + '-v34') return;
      box.innerHTML = html;
      box.setAttribute('data-si', key + '-v34');
      box.removeAttribute('style');
    });
  }

  function ensureBackButtons() {
    var selectors = [
      '#screen-saved .screen-header .back-btn',
      '#screen-settings .screen-header .back-btn',
      '[id^="screen-settings-"] .screen-header .back-btn',
      '#screen-notifs .screen-header .back-btn'
    ];
    selectors.forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (btn) {
        btn.style.display = 'flex';
        btn.style.visibility = 'visible';
        btn.style.opacity = '1';
        btn.removeAttribute('aria-hidden');
        btn.setAttribute('aria-label', 'Voltar');
      });
    });
  }

  function forceAdsIcon() {
    var btn = document.getElementById('tchiloAdsMgrBtn');
    if (!btn) return;
    var box = btn.querySelector('.si-icon');
    if (!box) return;
    var html = ICONS['meus anuncios'];
    if (!html) return;
    if (box.getAttribute('data-si') === 'meus anuncios-v34' && box.querySelector('svg')) return;
    box.innerHTML = html;
    box.setAttribute('data-si', 'meus anuncios-v34');
    box.setAttribute('data-tchilo-ads', 'fam');
  }

  function run() {
    injectCSS();
    ensureBackButtons();
    var roots = document.querySelectorAll(
      '#screen-settings, [id^="screen-settings-"], #screen-settings .settings-list'
    );
    if (!roots.length) applyIn(document.getElementById('screen-settings'));
    roots.forEach(applyIn);
    applyIn(document.getElementById('screen-settings'));
    document.querySelectorAll('[id^="screen-settings-"]').forEach(applyIn);
    var ads = document.getElementById('tchiloAdsMgrBtn');
    if (ads) applyIn(ads.parentNode || document);
    forceAdsIcon();
    famPass(document.getElementById('screen-settings'));
    document.querySelectorAll('[id^="screen-settings-"]').forEach(famPass);
  }

  run();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  [200, 800, 2000].forEach(function (ms) {
    setTimeout(run, ms);
  });

  if (typeof window.goTo === 'function' && !window.goTo.__siV33) {
    var g = window.goTo;
    window.goTo = function (name) {
      var r = g.apply(this, arguments);
      if (name && (String(name).indexOf('settings') === 0 || name === 'saved' || name === 'notifs')) {
        setTimeout(run, 40);
        setTimeout(ensureBackButtons, 60);
      }
      return r;
    };
    window.goTo.__siV33 = true;
  }
})();

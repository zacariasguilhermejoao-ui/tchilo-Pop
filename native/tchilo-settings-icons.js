/**
 * tchilo-settings-icons v33
 * Ícones 3D novos (PNG) nas definições principais
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

  function img(file) {
    return (
      '<img src="' +
      BASE +
      file +
      VER +
      '" alt="" width="28" height="28" decoding="async" ' +
      'style="width:28px;height:28px;object-fit:contain;display:block;pointer-events:none;" />'
    );
  }

  var S =
    'viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" ' +
    'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"';

  function svg(paths) {
    return '<svg ' + S + '>' + paths + '</svg>';
  }

  var ICONS = {
    /* === Ícones 3D novos === */
    'selo verificado': img('selo-verificado-3d.png'),
    'gestor de anuncios': img('meus-anuncios-3d.png'),
    'meus anuncios': img('meus-anuncios-3d.png'),
    'meus anuncios': img('meus-anuncios-3d.png'),
    'anuncios': img('meus-anuncios-3d.png'),
    'conta': img('conta-3d.png'),
    'notificacoes': img('notificacoes-3d.png'),
    'notifications': img('notificacoes-3d.png'),
    'stories': img('stories-3d.png'),
    'guardados': img('guardados-3d.png'),
    'privacidade e visibilidade': img('privacidade-visibilidade-3d.png'),
    'privacidade': img('privacidade-visibilidade-3d.png'),
    'legal': img('legal-3d.png'),
    'idioma': img('idioma-3d.png'),
    'tema': img('tema-3d.png'),
    'conta avancada': img('conta-avancada-3d.png'),
    'avancada': img('conta-avancada-3d.png'),

    /* fallbacks SVG (itens sem PNG novo) */
    'tchilo premium': svg(
      '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>'
    ),
    'editar perfil': svg(
      '<path d="M12 20h9"/>' +
      '<path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>'
    ),
    'palavra-passe e seguranca': svg(
      '<rect x="5" y="11" width="14" height="10" rx="2"/>' +
      '<path d="M8 11V7a4 4 0 0 1 8 0v4"/>'
    ),
    'suporte': svg(
      '<circle cx="12" cy="12" r="10"/>' +
      '<path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>' +
      '<path d="M12 17h.01"/>'
    )
  };

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
    if (box.getAttribute('data-si') === 'meus anuncios-v34' && box.querySelector('img')) return;
    box.innerHTML = html;
    box.setAttribute('data-si', 'meus anuncios-v34');
    box.setAttribute('data-tchilo-ads', '3d');
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

/**
 * tchilo-settings-icons v27
 * Ícones profissionais (estilo Lucide/Feather) só em Definições e subpáginas
 */
(function () {
  'use strict';
  if (window.__TCHILO_SI_V27) return;
  window.__TCHILO_SI_V27 = true;
  window.__TCHILO_SI_V26 = true;

  var S =
    'viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" ' +
    'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"';

  function svg(paths) {
    return '<svg ' + S + '>' + paths + '</svg>';
  }

  /* Mapa label (PT + EN) → SVG profissional */
  var ICONS = {
    /* —— lista principal —— */
    'tchilo premium': svg(
      '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>'
    ),
    'selo verificado':
      '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">' +
      '<circle cx="12" cy="12" r="10" fill="#1D9BF0"/>' +
      '<path d="M8 12.5l2.5 2.5 5.5-5.5" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>' +
      '</svg>',
    'gestor de anúncios': svg(
      '<path d="M3 11v2a1 1 0 0 0 1 1h1.5L11 18V6L5.5 10H4a1 1 0 0 0-1 1z"/>' +
      '<path d="M15.5 8.5a5 5 0 0 1 0 7"/>' +
      '<path d="M18 6a8.5 8.5 0 0 1 0 12"/>'
    ),
    'meus anúncios': svg(
      '<path d="M3 11v2a1 1 0 0 0 1 1h1.5L11 18V6L5.5 10H4a1 1 0 0 0-1 1z"/>' +
      '<path d="M15.5 8.5a5 5 0 0 1 0 7"/>' +
      '<path d="M18 6a8.5 8.5 0 0 1 0 12"/>'
    ),
    'conta': svg(
      '<circle cx="12" cy="8" r="4"/>' +
      '<path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>'
    ),
    'notificações': svg(
      '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>' +
      '<path d="M13.73 21a2 2 0 0 1-3.46 0"/>'
    ),
    'notifications': svg(
      '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>' +
      '<path d="M13.73 21a2 2 0 0 1-3.46 0"/>'
    ),
    'stories': svg(
      '<circle cx="12" cy="12" r="9"/>' +
      '<circle cx="12" cy="12" r="5"/>' +
      '<path d="M12 9v6M9 12h6"/>'
    ),
    'guardados': svg(
      '<path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>'
    ),
    'privacidade e visibilidade': svg(
      '<rect x="5" y="11" width="14" height="10" rx="2"/>' +
      '<path d="M8 11V7a4 4 0 0 1 8 0v4"/>'
    ),
    'legal': svg(
      '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>' +
      '<path d="M14 2v6h6M8 13h8M8 17h5"/>'
    ),
    'idioma': svg(
      '<circle cx="12" cy="12" r="10"/>' +
      '<path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>'
    ),
    'tema': svg(
      '<circle cx="12" cy="12" r="4"/>' +
      '<path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>'
    ),

    /* —— Conta —— */
    'editar perfil': svg(
      '<path d="M12 20h9"/>' +
      '<path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>'
    ),
    'palavra-passe e segurança': svg(
      '<path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.78 7.78 5.5 5.5 0 0 1 7.78-7.78zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>'
    ),
    'conta avançada': svg(
      '<circle cx="12" cy="12" r="3"/>' +
      '<path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>'
    ),

    /* —— Notificações —— */
    'gostos': svg(
      '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>'
    ),
    'comentários': svg(
      '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>'
    ),
    'novos seguidores': svg(
      '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>' +
      '<circle cx="9" cy="7" r="4"/>' +
      '<path d="M19 8v6M22 11h-6"/>'
    ),

    /* —— Stories toggles —— */
    'novos stories de quem sigo': svg(
      '<circle cx="12" cy="12" r="9"/>' +
      '<path d="M12 8v8M8 12h8"/>'
    ),
    'respostas aos meus stories': svg(
      '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>'
    ),
    'stories de amigos': svg(
      '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>' +
      '<circle cx="9" cy="7" r="4"/>' +
      '<path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>'
    ),

    /* —— Privacidade extras (se existirem) —— */
    'conta privada': svg(
      '<rect x="5" y="11" width="14" height="10" rx="2"/>' +
      '<path d="M8 11V7a4 4 0 0 1 8 0v4"/>'
    ),
    'mostrar email': svg(
      '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>' +
      '<path d="M22 6l-10 7L2 6"/>'
    ),
    'contas bloqueadas': svg(
      '<circle cx="12" cy="12" r="10"/>' +
      '<path d="M4.93 4.93l14.14 14.14"/>'
    ),
    'atividade': svg(
      '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>'
    ),

    /* —— Legal —— */
    'termos de uso': svg(
      '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>' +
      '<path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>'
    ),
    'política de privacidade': svg(
      '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>'
    ),
    'comunidade': svg(
      '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>' +
      '<circle cx="9" cy="7" r="4"/>' +
      '<path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>'
    ),
    'cookies': svg(
      '<circle cx="12" cy="12" r="10"/>' +
      '<circle cx="8.5" cy="10" r="1.2" fill="currentColor" stroke="none"/>' +
      '<circle cx="15" cy="9" r="1" fill="currentColor" stroke="none"/>' +
      '<circle cx="10" cy="15" r="1.1" fill="currentColor" stroke="none"/>' +
      '<circle cx="15.5" cy="14.5" r="0.9" fill="currentColor" stroke="none"/>'
    ),

    /* —— Avançado —— */
    'descarregar os meus dados': svg(
      '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>' +
      '<path d="M7 10l5 5 5-5M12 15V3"/>'
    ),
    'desativar conta': svg(
      '<circle cx="12" cy="12" r="10"/>' +
      '<path d="M10 15V9M14 15V9"/>'
    ),
    'eliminar conta': svg(
      '<path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z"/>' +
      '<path d="M10 11v6M14 11v6"/>'
    ),
    'terminar sessão': svg(
      '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>' +
      '<path d="M16 17l5-5-5-5M21 12H9"/>'
    )
  };

  function injectCSS() {
    if (document.getElementById('si-v27-css')) return;
    var st = document.createElement('style');
    st.id = 'si-v27-css';
    st.textContent =
      '#screen-settings .settings-item .si-icon,' +
      '[id^="screen-settings"] .settings-item .si-icon,' +
      '.settings-list .settings-item .si-icon{' +
      'width:24px!important;height:24px!important;min-width:24px!important;' +
      'border:0!important;border-radius:0!important;background:transparent!important;' +
      'display:inline-flex!important;align-items:center!important;justify-content:center!important;' +
      'padding:0!important;flex-shrink:0!important;overflow:visible!important;' +
      'color:var(--ink,#0B0B0C)!important;}' +
      '#screen-settings .settings-item .si-icon svg,' +
      '[id^="screen-settings"] .settings-item .si-icon svg,' +
      '.settings-list .settings-item .si-icon svg{' +
      'display:block!important;visibility:visible!important;opacity:1!important;' +
      'width:22px!important;height:22px!important;}' +
      '#screen-settings .settings-item .si-icon img,' +
      '[id^="screen-settings"] .settings-item .si-icon img{display:none!important;}';
    (document.head || document.documentElement).appendChild(st);
  }

  function labelOf(btn) {
    var spans = btn.querySelectorAll('span');
    for (var i = 0; i < spans.length; i++) {
      var t = (spans[i].textContent || '').trim();
      if (t && t !== '›' && t.length > 1 && !/^\d+$/.test(t)) return t;
    }
    return (btn.textContent || '').replace(/›/g, '').trim().split('\n')[0].trim();
  }

  function applyIn(root) {
    if (!root) return;
    root.querySelectorAll('.settings-item').forEach(function (btn) {
      var label = labelOf(btn);
      if (!label) return;
      var key = label.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      /* tentar match exacto e parcial */
      var html = ICONS[key];
      if (!html) {
        for (var k in ICONS) {
          if (key.indexOf(k) === 0 || k.indexOf(key) === 0) {
            html = ICONS[k];
            break;
          }
        }
      }
      if (!html) return;
      var box = btn.querySelector('.si-icon');
      if (!box) {
        /* language/theme rows may not have si-icon — skip */
        return;
      }
      if (box.getAttribute('data-si') === key) return;
      box.innerHTML = html;
      box.setAttribute('data-si', key);
    });
  }

  function run() {
    injectCSS();
    /* só ecrãs de definições */
    var roots = document.querySelectorAll(
      '#screen-settings, [id^="screen-settings-"], #screen-settings .settings-list'
    );
    if (!roots.length) {
      applyIn(document.getElementById('screen-settings'));
    }
    roots.forEach(applyIn);
    applyIn(document.getElementById('screen-settings'));
    document.querySelectorAll('[id^="screen-settings-"]').forEach(applyIn);
  }

  run();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  [200, 800, 2000].forEach(function (ms) {
    setTimeout(run, ms);
  });

  /* reaplicar ao entrar em definições */
  if (typeof window.goTo === 'function' && !window.goTo.__siV27) {
    var g = window.goTo;
    window.goTo = function (name) {
      var r = g.apply(this, arguments);
      if (name && String(name).indexOf('settings') === 0) setTimeout(run, 40);
      return r;
    };
    window.goTo.__siV27 = true;
  }
})();

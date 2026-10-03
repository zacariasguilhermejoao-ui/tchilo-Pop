/**
 * Tchilo — ícones PNG nas definições (pack Drive)
 * v5 — matching robusto, CSS forte, aplica em todos os itens
 */
(function () {
  'use strict';
  if (window.__tchiloSettingsIconsV5) return;
  window.__tchiloSettingsIconsV5 = true;

  var KEYS = [
    'conta', 'legal', 'notificacoes', 'stories', 'guardados',
    'privacidade', 'idioma', 'tema', 'avancado', 'premium',
    'selo', 'anuncios', 'suporte'
  ];

  function loadScript(src) {
    return new Promise(function (resolve) {
      var s = document.createElement('script');
      s.src = src;
      s.onload = function () { resolve(); };
      s.onerror = function () { resolve(); };
      (document.head || document.documentElement).appendChild(s);
    });
  }

  function loadAllIcons() {
    return Promise.all(KEYS.map(function (k) {
      return loadScript('native/settings-icons/' + k + '.js?v=5');
    }));
  }

  var LABELS = {
    conta: ['conta', 'account', 'a minha conta', 'my account'],
    notificacoes: ['notificações', 'notificacoes', 'notifications', 'notificação'],
    stories: ['stories', 'story'],
    guardados: ['guardados', 'saved', 'itens guardados', 'saved items'],
    privacidade: ['privacidade', 'privacy', 'privacidade e visibilidade', 'privacidade da conta'],
    legal: ['legal', 'termos', 'políticas', 'policies'],
    idioma: ['idioma', 'language', 'língua', 'lingua'],
    tema: ['tema', 'theme', 'aparência', 'aparencia', 'appearance'],
    avancado: ['avançado', 'avancado', 'advanced', 'avançadas', 'avancadas'],
    premium: ['tchilo premium', 'premium', 'assinatura', 'subscription'],
    selo: ['selo verificado', 'selo', 'verified', 'verificação', 'verificacao', 'badge'],
    anuncios: ['anúncios', 'anuncios', 'gestor de anúncios', 'gestor de anuncios', 'ads', 'publicidade'],
    suporte: ['suporte', 'support', 'ajuda', 'help', 'contacto', 'contato']
  };

  function injectCSS() {
    var st = document.getElementById('tchiloSettingsIconsCSS');
    if (!st) {
      st = document.createElement('style');
      st.id = 'tchiloSettingsIconsCSS';
      document.head.appendChild(st);
    }
    st.textContent =
      '#screen-settings .settings-item .si-icon,' +
      '#screen-settings-legal .settings-item .si-icon,' +
      '.settings-list .settings-item .si-icon{' +
      'width:42px!important;height:42px!important;min-width:42px!important;min-height:42px!important;' +
      'border-radius:12px!important;display:inline-flex!important;align-items:center!important;' +
      'justify-content:center!important;overflow:hidden!important;flex-shrink:0!important;' +
      'padding:0!important;margin:0 12px 0 0!important;background:transparent!important;}' +
      '#screen-settings .settings-item .si-icon img.tchilo-si,' +
      '#screen-settings-legal .settings-item .si-icon img.tchilo-si,' +
      '.settings-list .settings-item .si-icon img.tchilo-si{' +
      'width:28px!important;height:28px!important;object-fit:contain!important;display:block!important;' +
      'pointer-events:none!important;}' +
      '#screen-settings .settings-item .si-icon svg,' +
      '#screen-settings-legal .settings-item .si-icon svg,' +
      '.settings-list .settings-item .si-icon svg,' +
      '#screen-settings .settings-item > svg,' +
      '.settings-item .icon svg{display:none!important;}' +
      '#screen-settings .settings-item .icon:not(.si-icon),' +
      '.settings-item > .icon:not(.si-icon){display:none!important;}';
  }

  function labelOf(btn) {
    try {
      var spans = btn.querySelectorAll('span, div, p, label');
      for (var i = 0; i < spans.length; i++) {
        var t = (spans[i].textContent || '').trim();
        if (t && t !== '›' && t !== '>' && t.length < 60 && t.length > 1) return t;
      }
      var all = (btn.textContent || '').replace(/[›>]/g, ' ').trim();
      if (all) return all.split(/\s{2,}|\n/)[0].trim();
    } catch (e) {}
    return '';
  }

  function norm(s) {
    return String(s || '').trim().toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  function keyForLabel(label) {
    var L = norm(label);
    if (!L) return null;
    for (var key in LABELS) {
      var arr = LABELS[key] || [];
      for (var i = 0; i < arr.length; i++) {
        var a = norm(arr[i]);
        if (a === L || L.indexOf(a) === 0 || a.indexOf(L) === 0) return key;
      }
    }
    if (/premium|assinatura/.test(L)) return 'premium';
    if (/selo|verif|badge/.test(L)) return 'selo';
    if (/anun|ads|publicid/.test(L)) return 'anuncios';
    if (/suporte|support|ajuda|help/.test(L)) return 'suporte';
    if (/notif/.test(L)) return 'notificacoes';
    if (/priv/.test(L)) return 'privacidade';
    if (/guard|saved/.test(L)) return 'guardados';
    if (/idioma|language|lingua/.test(L)) return 'idioma';
    if (/tema|theme|aparenc/.test(L)) return 'tema';
    if (/legal|termo|politic/.test(L)) return 'legal';
    if (/stor/.test(L)) return 'stories';
    if (/avanc|advanced/.test(L)) return 'avancado';
    if (/^conta$|account/.test(L)) return 'conta';
    return null;
  }

  function applyIcon(btn, key) {
    var ICONS = window.__TCHILO_SETTINGS_ICONS || {};
    if (!key || !ICONS[key]) return;
    try {
      var oldIcons = btn.querySelectorAll('.icon:not(.si-icon), > svg, .settings-icon');
      for (var i = 0; i < oldIcons.length; i++) {
        if (!oldIcons[i].classList.contains('si-icon')) oldIcons[i].style.display = 'none';
      }
    } catch (e) {}
    var box = btn.querySelector('.si-icon');
    if (!box) {
      box = document.createElement('div');
      box.className = 'si-icon';
      btn.insertBefore(box, btn.firstChild);
    }
    box.style.cssText = 'background:transparent;width:42px;height:42px;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;';
    var img = box.querySelector('img.tchilo-si');
    if (!img) {
      box.innerHTML = '';
      img = document.createElement('img');
      img.className = 'tchilo-si';
      img.alt = '';
      img.decoding = 'async';
      box.appendChild(img);
    }
    if (img.getAttribute('data-key') !== key) {
      img.src = ICONS[key];
      img.setAttribute('data-key', key);
    }
  }

  function applyAll() {
    injectCSS();
    var sels = [
      '#screen-settings .settings-item',
      '#screen-settings-legal .settings-item',
      '.settings-list .settings-item',
      '#screen-settings button.settings-item',
      '[id*="settings"] .settings-item'
    ];
    var seen = {};
    for (var s = 0; s < sels.length; s++) {
      var btns;
      try { btns = document.querySelectorAll(sels[s]); } catch (e) { continue; }
      for (var i = 0; i < btns.length; i++) {
        if (seen[btns[i]]) continue;
        seen[btns[i]] = 1;
        var key = keyForLabel(labelOf(btns[i]));
        if (key) applyIcon(btns[i], key);
      }
    }
  }

  function boot() {
    loadAllIcons().then(function () {
      applyAll();
      setTimeout(applyAll, 100);
      setTimeout(applyAll, 400);
      setTimeout(applyAll, 1000);
      setTimeout(applyAll, 2500);
    });
  }

  boot();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  }
  setTimeout(boot, 600);

  if (typeof window.goTo === 'function' && !window.goTo.__settingsIconsV5) {
    var g = window.goTo;
    window.goTo = function () {
      var r = g.apply(this, arguments);
      setTimeout(applyAll, 30);
      setTimeout(applyAll, 200);
      setTimeout(applyAll, 600);
      return r;
    };
    window.goTo.__settingsIconsV5 = true;
  }

  try {
    var obs = new MutationObserver(function () { applyAll(); });
    function watch() {
      ['screen-settings', 'screen-settings-legal'].forEach(function (id) {
        var el = document.getElementById(id);
        if (el && !el.__siObs) {
          el.__siObs = true;
          obs.observe(el, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style'] });
        }
      });
    }
    watch();
    setTimeout(watch, 800);
  } catch (e) {}
})();

/**
 * Tchilo — ícones PNG nas definições (pack Drive)
 * v2
 */
(function () {
  'use strict';
  if (window.__tchiloSettingsIconsV2) return;
  window.__tchiloSettingsIconsV2 = true;

  var KEYS = ['conta','notificacoes','stories','guardados','privacidade','legal','idioma','tema','avancado','premium','selo','anuncios','suporte'];

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
    var base = 'native/settings-icons/';
    return Promise.all(KEYS.map(function (k) {
      return loadScript(base + k + '.js?v=1');
    }));
  }

  var LABELS = {
    conta: ['Conta', 'Account'],
    notificacoes: ['Notificações', 'Notifications', 'Notificacoes'],
    stories: ['Stories'],
    guardados: ['Guardados', 'Saved'],
    privacidade: ['Privacidade', 'Privacy', 'Privacidade e visibilidade'],
    legal: ['Legal'],
    idioma: ['Idioma', 'Language'],
    tema: ['Tema', 'Theme'],
    avancado: ['Avançado', 'Advanced', 'Avancado'],
    premium: ['Tchilo Premium', 'Premium'],
    selo: ['Selo verificado', 'Selo', 'Verified'],
    anuncios: ['Anúncios', 'Anuncios', 'Gestor de anúncios', 'Gestor de anuncios', 'Ads'],
    suporte: ['Suporte', 'Support', 'Ajuda']
  };

  function injectCSS() {
    var st = document.getElementById('tchiloSettingsIconsCSS');
    if (!st) {
      st = document.createElement('style');
      st.id = 'tchiloSettingsIconsCSS';
      document.head.appendChild(st);
    }
    st.textContent =
      '.settings-item .si-icon{width:42px!important;height:42px!important;border-radius:12px!important;' +
      'display:inline-flex!important;align-items:center!important;justify-content:center!important;' +
      'overflow:hidden!important;flex-shrink:0!important;padding:0!important;background:transparent!important;}' +
      '.settings-item .si-icon img{width:30px!important;height:30px!important;object-fit:contain!important;display:block!important;}' +
      '.settings-item .si-icon svg{display:none!important;}';
  }

  function labelOf(btn) {
    try {
      var spans = btn.querySelectorAll('span');
      for (var i = 0; i < spans.length; i++) {
        var t = (spans[i].textContent || '').trim();
        if (t && t !== '›' && t.length < 48) return t;
      }
    } catch (e) {}
    return '';
  }

  function keyForLabel(label) {
    var L = String(label || '').trim().toLowerCase();
    for (var key in LABELS) {
      var arr = LABELS[key] || [];
      for (var i = 0; i < arr.length; i++) {
        if (arr[i].toLowerCase() === L) return key;
      }
    }
    if (L.indexOf('premium') >= 0) return 'premium';
    if (L.indexOf('selo') >= 0 || L.indexOf('verif') >= 0) return 'selo';
    if (L.indexOf('anún') >= 0 || L.indexOf('anun') >= 0 || L.indexOf('ads') >= 0) return 'anuncios';
    if (L.indexOf('suporte') >= 0 || L.indexOf('support') >= 0 || L.indexOf('ajuda') >= 0) return 'suporte';
    if (L.indexOf('notif') >= 0) return 'notificacoes';
    if (L.indexOf('priv') >= 0) return 'privacidade';
    if (L.indexOf('guard') >= 0 || L.indexOf('saved') >= 0) return 'guardados';
    if (L.indexOf('idioma') >= 0 || L.indexOf('language') >= 0) return 'idioma';
    if (L.indexOf('tema') >= 0 || L.indexOf('theme') >= 0) return 'tema';
    if (L.indexOf('legal') >= 0) return 'legal';
    if (L.indexOf('stor') >= 0) return 'stories';
    if (L.indexOf('avanç') >= 0 || L.indexOf('avanc') >= 0 || L.indexOf('advanced') >= 0) return 'avancado';
    if (L === 'conta' || L.indexOf('account') === 0) return 'conta';
    return null;
  }

  function applyIcon(btn, key) {
    var ICONS = window.__TCHILO_SETTINGS_ICONS || {};
    if (!key || !ICONS[key]) return;
    var box = btn.querySelector('.si-icon');
    if (!box) {
      box = document.createElement('div');
      box.className = 'si-icon';
      btn.insertBefore(box, btn.firstChild);
    }
    box.style.background = 'transparent';
    var img = box.querySelector('img.tchilo-si');
    if (!img) {
      img = document.createElement('img');
      img.className = 'tchilo-si';
      img.alt = '';
      box.innerHTML = '';
      box.appendChild(img);
    }
    if (img.getAttribute('data-key') !== key) {
      img.src = ICONS[key];
      img.setAttribute('data-key', key);
    }
  }

  function applyAll() {
    injectCSS();
    var btns = document.querySelectorAll('#screen-settings .settings-item, #screen-settings-legal .settings-item, .settings-list .settings-item');
    for (var i = 0; i < btns.length; i++) {
      var key = keyForLabel(labelOf(btns[i]));
      if (key) applyIcon(btns[i], key);
    }
  }

  function boot() {
    loadAllIcons().then(function () {
      applyAll();
      setTimeout(applyAll, 200);
      setTimeout(applyAll, 800);
    });
  }

  boot();
  setTimeout(boot, 500);

  if (typeof window.goTo === 'function' && !window.goTo.__settingsIconsV2) {
    var g = window.goTo;
    window.goTo = function () {
      var r = g.apply(this, arguments);
      setTimeout(applyAll, 50);
      setTimeout(applyAll, 300);
      return r;
    };
    window.goTo.__settingsIconsV2 = true;
  }
})();

/**
 * Tchilo — ícones PNG nas definições (pack Drive)
 * v6 — PNG válidos + matching completo
 */
(function () {
  'use strict';
  if (window.__tchiloSettingsIconsV6) return;
  window.__tchiloSettingsIconsV6 = true;

  var KEYS = [
    'conta', 'legal', 'notificacoes', 'stories', 'guardados',
    'privacidade', 'idioma', 'tema', 'avancado', 'premium',
    'selo', 'anuncios', 'suporte'
  ];

  function loadScript(src) {
    return new Promise(function (resolve) {
      var s = document.createElement('script');
      s.src = src;
      s.onload = function () { resolve(true); };
      s.onerror = function () { resolve(false); };
      (document.head || document.documentElement).appendChild(s);
    });
  }

  function loadAllIcons() {
    return Promise.all(KEYS.map(function (k) {
      return loadScript('native/settings-icons/' + k + '.js?v=6');
    }));
  }

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
      'padding:0!important;margin:0 12px 0 0!important;background:transparent!important;border:none!important;}' +
      '#screen-settings .settings-item .si-icon img.tchilo-si,' +
      '#screen-settings-legal .settings-item .si-icon img.tchilo-si,' +
      '.settings-list .settings-item .si-icon img.tchilo-si{' +
      'width:28px!important;height:28px!important;object-fit:contain!important;display:block!important;' +
      'pointer-events:none!important;}' +
      '#screen-settings .settings-item .si-icon svg,' +
      '#screen-settings-legal .settings-item .si-icon svg,' +
      '.settings-list .settings-item .si-icon svg{display:none!important;}' +
      '#screen-settings .settings-item > svg,' +
      '#screen-settings .settings-item .icon:not(.si-icon),' +
      '.settings-item > .icon:not(.si-icon){display:none!important;}';
  }

  function labelOf(btn) {
    try {
      var spans = btn.querySelectorAll('span');
      for (var i = 0; i < spans.length; i++) {
        var t = (spans[i].textContent || '').trim();
        if (t && t !== '›' && t !== '>' && t.length < 60 && t.length > 1) {
          if (/^(portugu|classic|clássico|ingles|english)/i.test(t) && spans.length > 1) continue;
          return t;
        }
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
    if (/gestor|anuncio|anuncios|\bads\b/.test(L)) return 'anuncios';
    if (/tchilo premium|^premium$|assinatura/.test(L)) return 'premium';
    if (/selo|verificado|verified|badge/.test(L)) return 'selo';
    if (/^conta$|^account$|a minha conta/.test(L)) return 'conta';
    if (/notif/.test(L)) return 'notificacoes';
    if (/^stories$|story/.test(L)) return 'stories';
    if (/guard|saved/.test(L)) return 'guardados';
    if (/priv/.test(L)) return 'privacidade';
    if (/^legal$|termos|politicas/.test(L)) return 'legal';
    if (/suporte|support|ajuda|help/.test(L)) return 'suporte';
    if (/idioma|language|lingua/.test(L)) return 'idioma';
    if (/^tema$|theme|aparenc/.test(L)) return 'tema';
    if (/avanc|advanced|conta avanc/.test(L)) return 'avancado';
    return null;
  }

  function applyIcon(btn, key) {
    var ICONS = window.__TCHILO_SETTINGS_ICONS || {};
    if (!key || !ICONS[key]) return false;
    try {
      var oldIcons = btn.querySelectorAll('.icon:not(.si-icon), > svg, .settings-icon, [class*="icon-"]');
      for (var i = 0; i < oldIcons.length; i++) {
        if (!oldIcons[i].classList.contains('si-icon')) {
          oldIcons[i].style.setProperty('display', 'none', 'important');
        }
      }
    } catch (e) {}
    var box = btn.querySelector('.si-icon');
    if (!box) {
      box = document.createElement('div');
      box.className = 'si-icon';
      btn.insertBefore(box, btn.firstChild);
    }
    box.style.cssText = 'background:transparent!important;width:42px;height:42px;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;border:none;';
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
    return true;
  }

  function applyAll() {
    injectCSS();
    var sels = [
      '#screen-settings .settings-item',
      '#screen-settings-legal .settings-item',
      '.settings-list .settings-item',
      '#screen-settings button',
      '[id*="settings"] .settings-item'
    ];
    var seen = [];
    for (var s = 0; s < sels.length; s++) {
      var btns;
      try { btns = document.querySelectorAll(sels[s]); } catch (e) { continue; }
      for (var i = 0; i < btns.length; i++) {
        if (seen.indexOf(btns[i]) >= 0) continue;
        seen.push(btns[i]);
        var lab = labelOf(btns[i]);
        var key = keyForLabel(lab);
        if (key) applyIcon(btns[i], key);
      }
    }
  }

  function boot() {
    loadAllIcons().then(function () {
      applyAll();
      setTimeout(applyAll, 150);
      setTimeout(applyAll, 500);
      setTimeout(applyAll, 1200);
      setTimeout(applyAll, 3000);
    });
  }

  boot();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  setTimeout(boot, 700);

  if (typeof window.goTo === 'function' && !window.goTo.__settingsIconsV6) {
    var g = window.goTo;
    window.goTo = function () {
      var r = g.apply(this, arguments);
      setTimeout(applyAll, 40);
      setTimeout(applyAll, 250);
      setTimeout(applyAll, 700);
      return r;
    };
    window.goTo.__settingsIconsV6 = true;
  }

  try {
    var obs = new MutationObserver(function () { setTimeout(applyAll, 50); });
    function watch() {
      ['screen-settings', 'screen-settings-legal'].forEach(function (id) {
        var el = document.getElementById(id);
        if (el && !el.__siObs6) {
          el.__siObs6 = true;
          obs.observe(el, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style'] });
        }
      });
    }
    watch();
    setTimeout(watch, 900);
  } catch (e) {}
})();

/** tchilo-settings-icons v24 — settings screen ONLY, never touch feed/topbar/back */
(function () {
  if (window.__TCHILO_SI_V24) return;
  window.__TCHILO_SI_V24 = true;
  window.__TCHILO_SETTINGS_ICONS = window.__TCHILO_SETTINGS_ICONS || {};

  var B = 'https://tchilopop.com/native/settings-icons/';
  var V = '24';
  var K = ['tema','legal','premium','suporte','idioma','avancado','anuncios','conta','guardados','notificacoes','privacidade','selo','stories'];

  function isSettingsScreen() {
    try {
      if (document.getElementById('screen-feed') && document.getElementById('screen-feed').classList.contains('active')) return false;
      var h = ((location.hash || '') + (location.pathname || '') + (location.href || '')).toLowerCase();
      if (/#\/?feed|#\/?home|#\/?reels|#\/?explore|#\/?search|#\/?inbox|#\/?chat|#\/?profile/.test(h) && !/settings|definic|config/.test(h)) return false;
      if (/settings|definicoes|definições|config|prefs|preferenc/.test(h)) return true;
      var active = document.querySelector('.screen.active, [class*="screen"][class*="active"]');
      if (active) {
        var id = (active.id || active.className || '').toLowerCase();
        if (/settings|definic|config|prefs/.test(id)) return true;
        if (/feed|reels|inbox|chat|profile|camera|story|home/.test(id) && !/settings/.test(id)) return false;
      }
      var body = (document.body && document.body.innerText) || '';
      var hits = 0;
      if (/tchilo premium/i.test(body)) hits++;
      if (/privacidade/i.test(body)) hits++;
      if (/idioma/i.test(body)) hits++;
      if (/conta avan/i.test(body)) hits++;
      if (/gestor de an[uú]ncios/i.test(body)) hits++;
      if (/defini/i.test(body) && hits >= 2) return true;
      return hits >= 3;
    } catch (e) { return false; }
  }

  function keyForLabel(t) {
    if (!t) return null;
    t = (t + '').toLowerCase();
    try { t = t.normalize('NFD').replace(/[\u0300-\u036f]/g, ''); } catch (e) {}
    t = t.trim();
    if (/premium|tchilo premium/.test(t)) return 'premium';
    if (/suporte|support|ajuda|help/.test(t)) return 'suporte';
    if (/tema|theme|aparencia|appearance/.test(t)) return 'tema';
    if (/idioma|language|lingua/.test(t)) return 'idioma';
    if (/^legal$|termos|terms/.test(t) && !/privacidade/.test(t)) return 'legal';
    if (/conta avancada|advanced|avancad/.test(t)) return 'avancado';
    if (/gestor de anuncios|anuncios|ads manager|anuncio/.test(t)) return 'anuncios';
    if (/^conta$|account/.test(t) && !/avancad/.test(t)) return 'conta';
    if (/guardados|saved|favoritos|bookmarks/.test(t)) return 'guardados';
    if (/notificacoes|notifications|alertas/.test(t)) return 'notificacoes';
    if (/privacidade|privacy|visibilidade/.test(t)) return 'privacidade';
    if (/selo|verificado|verified|badge/.test(t)) return 'selo';
    if (/^stories$|historias/.test(t)) return 'stories';
    return null;
  }

  function isBackOrNav(el) {
    if (!el) return true;
    try {
      if (el.closest && (
        el.closest('.topbar') ||
        el.closest('[class*="topbar"]') ||
        el.closest('[class*="navbar"]') ||
        el.closest('nav') ||
        el.closest('#screen-feed') ||
        el.closest('[class*="feed"]') ||
        el.closest('video') ||
        el.closest('[class*="story"]') ||
        el.closest('[class*="reel"]')
      )) return true;
      var aria = ((el.getAttribute && el.getAttribute('aria-label')) || '') + ' ' + ((el.title) || '');
      if (/voltar|back|fechar|close|anterior/i.test(aria)) return true;
      var r = el.getBoundingClientRect ? el.getBoundingClientRect() : null;
      if (r && r.top < 100 && r.left < 72) return true;
    } catch (e) {}
    return false;
  }

  function paint(el, key) {
    var uri = window.__TCHILO_SETTINGS_ICONS[key];
    if (!uri || uri.length < 80) return false;
    if (isBackOrNav(el)) return false;
    if (el.classList && el.classList.contains('si-done') && el.getAttribute('data-si') === key) return true;
    try {
      el.classList.add('si-icon', 'si-done');
      el.setAttribute('data-si', key);
      el.style.setProperty('background', 'transparent', 'important');
      el.style.setProperty('background-color', 'transparent', 'important');
      el.style.setProperty('background-image', 'none', 'important');
      el.style.setProperty('width', '28px', 'important');
      el.style.setProperty('height', '28px', 'important');
      el.style.setProperty('min-width', '28px', 'important');
      el.style.setProperty('min-height', '28px', 'important');
      el.style.setProperty('display', 'inline-flex', 'important');
      el.style.setProperty('align-items', 'center', 'important');
      el.style.setProperty('justify-content', 'center', 'important');
      el.style.setProperty('overflow', 'hidden', 'important');
      el.style.setProperty('border-radius', '8px', 'important');
      el.style.setProperty('padding', '0', 'important');
      el.style.setProperty('flex-shrink', '0', 'important');
      while (el.firstChild) el.removeChild(el.firstChild);
      var img = document.createElement('img');
      img.src = uri;
      img.alt = '';
      img.width = 24; img.height = 24;
      img.decoding = 'async';
      img.style.cssText = 'width:24px!important;height:24px!important;object-fit:contain!important;display:block!important;pointer-events:none!important;';
      el.appendChild(img);
      return true;
    } catch (e) { return false; }
  }

  function isIconBox(el) {
    if (!el || el.nodeType !== 1) return false;
    if (el.classList && el.classList.contains('si-done')) return false;
    if (isBackOrNav(el)) return false;
    var r = el.getBoundingClientRect ? el.getBoundingClientRect() : null;
    if (!r || r.width < 12 || r.width > 52 || r.height < 12 || r.height > 52) return false;
    if (r.top < 100 && r.left < 72) return false;
    var tag = (el.tagName || '').toLowerCase();
    if (tag === 'svg' || tag === 'img') return true;
    if (tag === 'span' || tag === 'div' || tag === 'i') {
      try {
        var st = getComputedStyle(el);
        var bg = st.backgroundColor || '';
        if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') return true;
        if (parseFloat(st.borderRadius) > 0 && r.width >= 16 && r.width <= 44) return true;
      } catch (e) {}
      if (!el.children || el.children.length === 0) return true;
    }
    return false;
  }

  function findIconNear(textEl) {
    var row = textEl;
    for (var up = 0; up < 5 && row; up++) {
      var kids = row.children ? Array.prototype.slice.call(row.children) : [];
      for (var i = 0; i < kids.length; i++) {
        if (isIconBox(kids[i])) return kids[i];
        var nested = kids[i].querySelector && kids[i].querySelector('svg,img,span,div,i');
        if (nested && isIconBox(nested)) return nested;
      }
      var prev = row.previousElementSibling;
      if (prev) {
        if (isIconBox(prev)) return prev;
        var p2 = prev.querySelector && prev.querySelector('svg,img,span,div,i');
        if (p2 && isIconBox(p2)) return p2;
      }
      row = row.parentElement;
    }
    return null;
  }

  function applyAll() {
    if (!isSettingsScreen()) return;
    var map = window.__TCHILO_SETTINGS_ICONS;
    if (!map || Object.keys(map).length < 3) return;
    var root = document.querySelector('#screen-settings, .screen-settings, [id*="settings"], .screen.active') || document.body;
    var nodes = root.querySelectorAll('div,span,li,a,button,p,label');
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      if (n.children && n.children.length > 6) continue;
      if (isBackOrNav(n)) continue;
      var text = (n.innerText || n.textContent || '').trim().split('\n')[0].trim();
      if (!text || text.length < 2 || text.length > 48) continue;
      var key = keyForLabel(text);
      if (!key || !map[key]) continue;
      var host = findIconNear(n);
      if (host) paint(host, key);
    }
  }

  function injectCSS() {
    if (document.getElementById('si-v24-css')) return;
    var st = document.createElement('style');
    st.id = 'si-v24-css';
    st.textContent = '.si-icon,.si-done{background:transparent!important;background-color:transparent!important;background-image:none!important;flex-shrink:0!important;}.si-icon img,.si-done img{width:24px!important;height:24px!important;object-fit:contain!important;display:block!important;}.si-icon svg,.si-done svg{display:none!important;}';
    (document.head || document.documentElement).appendChild(st);
  }

  var loaded = 0;
  function onReady() {
    loaded++;
    if (loaded < K.length) return;
    injectCSS();
    applyAll();
    if (!window.__TCHILO_SI_OBS24) {
      window.__TCHILO_SI_OBS24 = true;
      var timer = null;
      try {
        new MutationObserver(function () {
          if (!isSettingsScreen()) return;
          clearTimeout(timer);
          timer = setTimeout(applyAll, 150);
        }).observe(document.documentElement, { childList: true, subtree: true });
      } catch (e) {}
      var g = window.goTo;
      if (typeof g === 'function') {
        window.goTo = function () {
          var r = g.apply(this, arguments);
          setTimeout(function () { if (isSettingsScreen()) applyAll(); }, 120);
          setTimeout(function () { if (isSettingsScreen()) applyAll(); }, 500);
          return r;
        };
      }
      window.addEventListener('hashchange', function () { setTimeout(applyAll, 200); });
      window.addEventListener('popstate', function () { setTimeout(applyAll, 200); });
    }
  }

  K.forEach(function (k) {
    var s = document.createElement('script');
    s.src = B + k + '.js?v=' + V;
    s.async = true;
    s.onload = onReady;
    s.onerror = onReady;
    (document.head || document.documentElement).appendChild(s);
  });

  setTimeout(applyAll, 900);
  setTimeout(applyAll, 2200);
})();

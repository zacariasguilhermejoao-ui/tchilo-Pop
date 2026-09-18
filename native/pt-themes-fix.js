/**
 * tchilo-Pop — temas do criar post em português + UI limpa
 * Corrige "EPIC NIGHT" → "Noite Épica". Sem nomes nas cores.
 */
(function () {
  'use strict';

  var PT_MAP = [
    ['EPIC NIGHT', 'NOITE ÉPICA'],
    ['Epic Night', 'Noite Épica'],
    ['epic night', 'noite épica'],
    ['NEW POST', 'NOVO POST'],
    ['NEW STORY', 'NOVO STORY'],
    ['SHARE', 'PARTILHAR'],
    ['DUET', 'DUETO']
  ];

  function injectCSS() {
    if (document.getElementById('tchiloThemeFxCSS')) return;
    var st = document.createElement('style');
    st.id = 'tchiloThemeFxCSS';
    st.textContent =
      '#themeSection{margin:8px 0 14px;}' +
      '#themeSection .tchilo-theme-label{' +
      'font:800 12px Inter,system-ui,sans-serif;color:var(--muted,#6b6b70);' +
      'letter-spacing:.04em;text-transform:uppercase;margin:0 0 10px;}' +
      '#themeSection .color-picks{' +
      'display:flex;gap:10px;overflow-x:auto;-webkit-overflow-scrolling:touch;' +
      'padding:4px 2px 8px;scrollbar-width:none;}' +
      '#themeSection .color-picks::-webkit-scrollbar{display:none;}' +
      '#themeSection .color-pick{' +
      'flex:0 0 auto;width:52px;height:52px;border-radius:16px;' +
      'border:2.5px solid transparent;position:relative;' +
      'box-shadow:0 4px 14px rgba(0,0,0,.12);' +
      'transition:transform .18s ease,box-shadow .18s,border-color .18s;}' +
      '#themeSection .color-pick.active{' +
      'transform:scale(1.08);border-color:var(--ink,#0B0B0C);' +
      'box-shadow:0 0 0 3px rgba(200,245,96,.55),0 8px 20px rgba(0,0,0,.18);}' +
      /* esconder nomes das cores se ainda existirem no DOM */
      '#themeSection .color-pick .tchilo-tn{display:none!important;}' +
      '#createTitle::placeholder{color:var(--muted,#6b6b70);opacity:.85;}';
    document.head.appendChild(st);
  }

  function fixPlaceholders() {
    var title = document.getElementById('createTitle');
    if (title) {
      title.placeholder = 'Texto grande (ex: NOITE ÉPICA)';
      if (/epic\s*night/i.test(title.value || '')) {
        title.value = title.value.replace(/epic\s*night/gi, 'NOITE ÉPICA');
        try {
          if (typeof updateStamp === 'function') updateStamp();
        } catch (e) {}
      }
    }
    var storyTitle = document.getElementById('storyThemeTitle');
    if (storyTitle && /epic/i.test(storyTitle.placeholder || '')) {
      storyTitle.placeholder = 'Texto grande (ex: BOA VIBE)';
    }
  }

  function enhanceColorPicks() {
    var sec = document.getElementById('themeSection');
    if (!sec) return;

    if (!sec.querySelector('.tchilo-theme-label')) {
      var lab = document.createElement('div');
      lab.className = 'tchilo-theme-label';
      lab.textContent = 'Escolhe o tema da publicação';
      var picks = sec.querySelector('.color-picks');
      if (picks) sec.insertBefore(lab, picks);
      else sec.insertBefore(lab, sec.firstChild);
    }

    // remove nomes das cores
    sec.querySelectorAll('.color-pick .tchilo-tn').forEach(function (n) {
      try {
        n.remove();
      } catch (e) {}
    });
    sec.querySelectorAll('.color-pick').forEach(function (el) {
      el.removeAttribute('title');
    });
  }

  function walkTextNodes(root) {
    if (!root) return;
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    var node;
    while ((node = walker.nextNode())) {
      var t = node.nodeValue;
      if (!t || (t.indexOf('Epic') < 0 && t.indexOf('EPIC') < 0 && t.indexOf('epic') < 0)) continue;
      var next = t;
      PT_MAP.forEach(function (pair) {
        if (next.indexOf(pair[0]) >= 0) next = next.split(pair[0]).join(pair[1]);
      });
      if (next !== t) node.nodeValue = next;
    }
  }

  function patchUpdateStamp() {
    if (typeof window.updateStamp !== 'function' || window.updateStamp.__pt) return;
    var orig = window.updateStamp;
    window.updateStamp = function () {
      var titleEl = document.getElementById('createTitle');
      if (titleEl && !String(titleEl.value || '').trim()) {
        var stamp = document.getElementById('createStamp');
        if (stamp) stamp.innerHTML = 'NOVO<br>POST';
        return;
      }
      var r = orig.apply(this, arguments);
      walkTextNodes(document.getElementById('createStamp'));
      return r;
    };
    window.updateStamp.__pt = true;
  }

  function forcePtInVisibleUI() {
    walkTextNodes(document.body);
    document.querySelectorAll('input[placeholder], textarea[placeholder]').forEach(function (el) {
      var p = el.getAttribute('placeholder') || '';
      var next = p;
      PT_MAP.forEach(function (pair) {
        if (next.indexOf(pair[0]) >= 0) next = next.split(pair[0]).join(pair[1]);
      });
      if (next !== p) el.setAttribute('placeholder', next);
    });
  }

  function onCreateScreen() {
    injectCSS();
    fixPlaceholders();
    enhanceColorPicks();
    patchUpdateStamp();
    forcePtInVisibleUI();
  }

  function hookGoTo() {
    if (typeof window.goTo !== 'function' || window.goTo.__ptThemes) return;
    var orig = window.goTo;
    window.goTo = function (screen) {
      var r = orig.apply(this, arguments);
      if (screen === 'create' || screen === 'screen-create') {
        setTimeout(onCreateScreen, 40);
        setTimeout(onCreateScreen, 200);
      }
      setTimeout(forcePtInVisibleUI, 80);
      return r;
    };
    window.goTo.__ptThemes = true;
  }

  function boot() {
    injectCSS();
    fixPlaceholders();
    enhanceColorPicks();
    patchUpdateStamp();
    forcePtInVisibleUI();
    hookGoTo();
    setTimeout(function () {
      onCreateScreen();
      hookGoTo();
    }, 600);
    try {
      new MutationObserver(function () {
        forcePtInVisibleUI();
      }).observe(document.body, { childList: true, subtree: true, characterData: true });
    } catch (e) {}
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();

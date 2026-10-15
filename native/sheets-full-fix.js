/**
 * tchilo-Pop — sheets: manter bottom sheets (como o modal de Presentes já existente)
 * v5 — NÃO cria estilo novo. Só desfaz full-screen forçado e deixa o swipe funcionar.
 * O visual e comportamento de referência é o #tchiloGiftSheet que já existe.
 */
(function () {
  'use strict';
  if (window.__tchiloSheetsFullV5) return;
  window.__tchiloSheetsFullV5 = true;

  function injectCSS() {
    if (document.getElementById('tchilo-sheets-full-css-v5')) return;
    var st = document.createElement('style');
    st.id = 'tchilo-sheets-full-css-v5';
    /* Só reverte full-screen forçado nos .sheet; não redesenha o look */
    st.textContent = [
      '#commentSheet.sheet.open{',
      '  align-items:flex-end!important;justify-content:center!important;',
      '  background:rgba(11,11,12,.48)!important;',
      '}',
      '#commentSheet .sheet-panel{',
      '  width:100%!important;max-width:480px!important;',
      '  max-height:min(82vh,720px)!important;height:auto!important;',
      '  border-radius:18px 18px 0 0!important;',
      '}',
      '#tchiloModalHost:not(.tm-full){align-items:flex-end!important;justify-content:center!important;}',
      '#tchiloModalHost:not(.tm-full) .tm-sheet{',
      '  width:100%!important;max-width:480px!important;',
      '  max-height:min(78vh,640px)!important;height:auto!important;',
      '  border-radius:18px 18px 0 0!important;',
      '}',
      '#tchiloModalHost.tm-full .tm-sheet{',
      '  width:100%!important;max-width:none!important;max-height:none!important;height:100%!important;',
      '  border-radius:0!important;',
      '}',
      '#tchiloModalHost.tm-full .tm-handle{display:none!important;}',
      '.menu-sheet .sheet-panel,#shareSheet .sheet-panel,#reportSheet .sheet-panel,',
      '#postMenuSheet .sheet-panel,#reelMenuSheet .sheet-panel,#storyMenuSheet .sheet-panel{',
      '  max-height:min(58vh,460px)!important;',
      '}'
    ].join('');
    document.head.appendChild(st);
  }

  function ensureCommentBack() {
    var title = document.querySelector('#commentSheet .sheet-title');
    if (!title || title.querySelector('.tchilo-sheet-back')) return;
    title.style.display = 'flex';
    title.style.alignItems = 'center';
    title.style.gap = '10px';
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'tchilo-sheet-back';
    btn.setAttribute('aria-label', 'Voltar');
    btn.style.cssText =
      'width:36px;height:36px;border-radius:12px;border:1.5px solid rgba(11,11,12,.12);' +
      'background:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;padding:0;';
    btn.innerHTML =
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    btn.onclick = function (e) {
      e.preventDefault();
      e.stopPropagation();
      try { if (typeof window.closeComments === 'function') window.closeComments(); } catch (err) {}
    };
    title.insertBefore(btn, title.firstChild);
  }

  function patchModalFull() {
    if (typeof window.tchiloModalOpen !== 'function' || window.tchiloModalOpen.__sheetsFullV5) return;
    var orig = window.tchiloModalOpen;
    window.tchiloModalOpen = function (opts) {
      opts = opts || {};
      var r = orig.apply(this, arguments);
      setTimeout(function () {
        var h = document.getElementById('tchiloModalHost');
        if (!h) return;
        var forceFull = opts.fullScreen === true;
        var forceSheet = opts.fullScreen === false;
        if (forceSheet) h.classList.remove('tm-full');
        else if (forceFull) h.classList.add('tm-full');
        else h.classList.remove('tm-full');
      }, 0);
      return r;
    };
    window.tchiloModalOpen.__sheetsFullV5 = true;
  }

  function patchOpenComments() {
    if (typeof window.openComments !== 'function' || window.openComments.__sheetsFullV5) return;
    var orig = window.openComments;
    window.openComments = function () {
      var r = orig.apply(this, arguments);
      setTimeout(ensureCommentBack, 30);
      return r;
    };
    window.openComments.__sheetsFullV5 = true;
  }

  function forceStoryCreateFull(el) {
    if (!el) return;
    el.classList.add('is-open', 'open');
    el.style.setProperty('display', 'flex', 'important');
    el.style.setProperty('align-items', 'stretch', 'important');
    el.style.setProperty('justify-content', 'stretch', 'important');
    el.style.setProperty('background', 'var(--paper)', 'important');
    el.style.setProperty('inset', '0', 'important');
    el.style.setProperty('z-index', '200', 'important');
    el.style.visibility = 'visible';
    el.style.pointerEvents = 'auto';
    var panel = el.firstElementChild;
    if (panel) {
      panel.style.setProperty('width', '100%', 'important');
      panel.style.setProperty('height', '100%', 'important');
      panel.style.setProperty('max-width', 'none', 'important');
      panel.style.setProperty('border-radius', '0', 'important');
      panel.style.setProperty('border', '0', 'important');
      panel.style.setProperty('box-shadow', 'none', 'important');
    }
  }

  function hideStoryCreate(el) {
    if (!el) el = document.getElementById('storyCreateSheet');
    if (!el) return;
    el.classList.remove('is-open', 'open');
    el.style.setProperty('display', 'none', 'important');
    el.style.visibility = 'hidden';
    el.style.pointerEvents = 'none';
  }

  function patchStoryCreateSheet() {
    window.openStoryCreateSheet = function () {
      forceStoryCreateFull(document.getElementById('storyCreateSheet'));
    };
    window.closeStoryCreateSheet = function () {
      hideStoryCreate();
    };
    hideStoryCreate();
  }

  function boot() {
    injectCSS();
    patchModalFull();
    patchOpenComments();
    ensureCommentBack();
    patchStoryCreateSheet();
  }

  boot();
  [100, 500, 1500].forEach(function (ms) { setTimeout(boot, ms); });
})();

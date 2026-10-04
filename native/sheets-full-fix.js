/**
 * tchilo-Pop — sheets: ecrã completo no que é conteúdo; meio ecrã só em menus rápidos
 *
 * FULL: comentários, criar story, stickers/GIFs, modais com corpo longo
 * BOTTOM (faz sentido): ⋯ post/reel/story, partilhar, denunciar, confirmar, music use (2 opções)
 */
(function () {
  'use strict';
  if (window.__tchiloSheetsFullFix) return;
  window.__tchiloSheetsFullFix = true;

  function injectCSS() {
    var old = document.getElementById('tchiloSheetsFullCSS');
    if (old) old.remove();
    var st = document.createElement('style');
    st.id = 'tchiloSheetsFullCSS';
    st.textContent = [
      /* —— Comentários: ecrã completo —— */
      '#commentSheet.sheet.open{align-items:stretch!important;justify-content:stretch!important;background:var(--paper,#F6F1E7)!important;}',
      '#commentSheet .sheet-panel{',
      '  width:100%!important;max-width:none!important;max-height:none!important;height:100%!important;',
      '  border-radius:0!important;border:0!important;border-bottom:0!important;',
      '  box-shadow:none!important;display:flex!important;flex-direction:column!important;',
      '  padding:0!important;padding-top:env(safe-area-inset-top)!important;',
      '}',
      '#commentSheet .sheet-handle{display:none!important;}',
      '#commentSheet .sheet-title{',
      '  margin:0!important;padding:14px 16px!important;border-bottom:2.5px solid var(--ink,#0B0B0C)!important;',
      '  font-size:20px!important;display:flex!important;align-items:center!important;gap:10px!important;',
      '}',
      '#commentSheet .sheet-list{flex:1!important;min-height:0!important;padding:12px 16px!important;}',
      '#commentSheet .sheet-input-bar{',
      '  border-top:2.5px solid var(--ink,#0B0B0C)!important;',
      '  padding:10px 14px calc(10px + env(safe-area-inset-bottom))!important;background:var(--paper,#F6F1E7)!important;',
      '}',

      /* —— Criar story: ecrã completo —— */
      '#storyCreateSheet{align-items:stretch!important;justify-content:stretch!important;background:var(--paper,#F6F1E7)!important;}',
      '#storyCreateSheet[style*="flex"],#storyCreateSheet.open{display:flex!important;}',
      '#storyCreateSheet > div{',
      '  width:100%!important;max-width:none!important;max-height:none!important;height:100%!important;',
      '  border-radius:0!important;margin:0!important;border:0!important;',
      '  padding:16px 16px calc(20px + env(safe-area-inset-bottom))!important;',
      '  overflow:auto!important;',
      '}',

      /* —— Stickers / GIFs: ecrã completo —— */
      '#tchiloSGSheet{',
      '  left:0!important;right:0!important;top:0!important;bottom:0!important;',
      '  max-height:none!important;height:100%!important;border-radius:0!important;',
      '  border-left:0!important;border-right:0!important;border-top:0!important;',
      '}',

      /* —— Modal genérico com conteúdo: full quando .tm-full —— */
      '#tchiloModalHost.tm-full{align-items:stretch!important;justify-content:stretch!important;padding:0!important;}',
      '#tchiloModalHost.tm-full .tm-backdrop{display:none!important;}',
      '#tchiloModalHost.tm-full .tm-sheet{',
      '  width:100%!important;max-width:none!important;max-height:none!important;height:100%!important;',
      '  border-radius:0!important;border:0!important;box-shadow:none!important;',
      '  padding-bottom:env(safe-area-inset-bottom)!important;',
      '}',
      '#tchiloModalHost.tm-full .tm-handle{display:none!important;}',
      '#tchiloModalHost.tm-full .tm-head{',
      '  padding:14px 18px!important;padding-top:calc(14px + env(safe-area-inset-top))!important;',
      '  border-bottom:2.5px solid var(--ink,#0B0B0C)!important;',
      '}',

      /* Menus rápidos (⋯, partilhar, denunciar) — mantêm meio ecrã, painel mais limpo */
      '.menu-sheet .sheet-panel,',
      '#shareSheet .sheet-panel,',
      '#reportSheet .sheet-panel,',
      '#postMenuSheet .sheet-panel,',
      '#reelMenuSheet .sheet-panel,',
      '#storyMenuSheet .sheet-panel{',
      '  max-height:min(52vh,420px)!important;',
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
      'width:36px;height:36px;border-radius:12px;border:2.5px solid var(--ink,#0B0B0C);' +
      'background:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;padding:0;';
    btn.innerHTML =
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    btn.onclick = function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (typeof closeComments === 'function') closeComments();
    };
    title.insertBefore(btn, title.firstChild);
  }

  function patchModalFull() {
    if (typeof window.tchiloModalOpen !== 'function' || window.tchiloModalOpen.__sheetsFull) return;
    var orig = window.tchiloModalOpen;
    window.tchiloModalOpen = function (opts) {
      opts = opts || {};
      var host = document.getElementById('tchiloModalHost');
      var body = opts.bodyHtml || '';
      var longBody = body.length > 80 || /attach-sheet|grid|tm-option|interest/i.test(body);
      var manyBtns = (opts.buttons || []).length > 3;
      var forceFull = opts.fullScreen === true || longBody || manyBtns;
      var forceSheet = opts.fullScreen === false;

      var r = orig.apply(this, arguments);

      setTimeout(function () {
        var h = document.getElementById('tchiloModalHost');
        if (!h) return;
        if (forceSheet) h.classList.remove('tm-full');
        else if (forceFull) h.classList.add('tm-full');
        else h.classList.remove('tm-full');
      }, 0);

      return r;
    };
    window.tchiloModalOpen.__sheetsFull = true;

    if (typeof window.tchiloModalClose === 'function' && !window.tchiloModalClose.__sheetsFull) {
      var oc = window.tchiloModalClose;
      window.tchiloModalClose = function () {
        var h = document.getElementById('tchiloModalHost');
        if (h) h.classList.remove('tm-full');
        return oc.apply(this, arguments);
      };
      window.tchiloModalClose.__sheetsFull = true;
    }
  }

  function patchOpenComments() {
    if (typeof window.openComments !== 'function' || window.openComments.__sheetsFull) return;
    var orig = window.openComments;
    window.openComments = function () {
      var r = orig.apply(this, arguments);
      setTimeout(ensureCommentBack, 30);
      return r;
    };
    window.openComments.__sheetsFull = true;
  }

  function boot() {
    injectCSS();
    patchModalFull();
    patchOpenComments();
    ensureCommentBack();
  }

  boot();
  [200, 800, 2000].forEach(function (ms) {
    setTimeout(boot, ms);
  });
})();

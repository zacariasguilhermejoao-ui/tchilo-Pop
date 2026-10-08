/**
 * Tchilo header UI v3
 * 1) Linha fina no .screen-header
 * 2) Botão voltar profissional
 * 3) Botão + do avatar BEM FORA da foto
 */
(function () {
  'use strict';
  if (window.__tchiloHeaderUiV3) return;
  window.__tchiloHeaderUiV3 = true;
  window.__tchiloHeaderUiV2 = true;

  var BACK_SVG =
    '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" ' +
    'stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M19 12H5"/>' +
    '<path d="M12 19l-7-7 7-7"/>' +
    '</svg>';

  function injectCSS() {
    var st = document.getElementById('tchilo-header-ui-css');
    if (!st) {
      st = document.createElement('style');
      st.id = 'tchilo-header-ui-css';
      (document.head || document.documentElement).appendChild(st);
    }
    st.textContent =
      '.screen-header,' +
      '.screen > .screen-header,' +
      '[id^="screen-"] > .screen-header{' +
      'border-bottom-width:1px!important;' +
      'border-bottom-style:solid!important;' +
      'border-bottom-color:var(--line,rgba(0,0,0,.12))!important;}' +
      '.profile-header{' +
      'border-bottom:none!important;' +
      'border-bottom-width:0!important;' +
      'box-shadow:none!important;' +
      'overflow:visible!important;}' +
      '.profile-stats,.profile-actions{' +
      'border:none!important;box-shadow:none!important;}' +
      '.back-btn{' +
      'width:40px!important;height:40px!important;' +
      'border:0!important;border-radius:50%!important;' +
      'background:transparent!important;' +
      'display:inline-flex!important;align-items:center!important;justify-content:center!important;' +
      'cursor:pointer!important;color:var(--ink,#0B0B0C)!important;' +
      'flex-shrink:0!important;padding:0!important;}' +
      '.back-btn svg{' +
      'width:22px!important;height:22px!important;' +
      'display:block!important;stroke:currentColor!important;}' +
      /* Pais sem clip */
      '#profileBody,.profile-header,#screen-profile,' +
      '.profile-avatar,#profileBody .profile-avatar,' +
      '.profile-header .profile-avatar{' +
      'overflow:visible!important;}' +
      '.profile-avatar{' +
      'position:relative!important;}' +
      /* + bem fora do círculo (canto inferior direito) */
      '#tchiloProfileAvatarPlus,' +
      '#tchiloProfileAvatarPlus.tchilo-av-add,' +
      'button#tchiloProfileAvatarPlus{' +
      'position:absolute!important;' +
      'right:-12px!important;' +
      'bottom:-10px!important;' +
      'left:auto!important;' +
      'top:auto!important;' +
      'z-index:20!important;' +
      'width:32px!important;' +
      'height:32px!important;' +
      'min-width:32px!important;' +
      'min-height:32px!important;' +
      'border-radius:50%!important;' +
      'background:#0B0B0C!important;' +
      'color:#fff!important;' +
      'border:3px solid var(--paper,#F6F1E7)!important;' +
      'box-shadow:0 2px 6px rgba(0,0,0,.25)!important;' +
      'display:flex!important;' +
      'align-items:center!important;' +
      'justify-content:center!important;' +
      'padding:0!important;' +
      'margin:0!important;' +
      'cursor:pointer!important;' +
      'animation:none!important;' +
      'transform:none!important;' +
      'overflow:visible!important;}' +
      '#tchiloProfileAvatarPlus svg,' +
      '#tchiloProfileAvatarPlus.tchilo-av-add svg{' +
      'width:16px!important;' +
      'height:16px!important;' +
      'stroke:#fff!important;' +
      'color:#fff!important;' +
      'display:block!important;}';
  }

  function placePlusOutside() {
    try {
      var btn = document.getElementById('tchiloProfileAvatarPlus');
      if (!btn) return;
      var av = btn.closest('.profile-avatar');
      if (av) {
        av.style.overflow = 'visible';
        av.style.position = 'relative';
      }
      var hdr = btn.closest('.profile-header');
      if (hdr) hdr.style.overflow = 'visible';
      var body = document.getElementById('profileBody');
      if (body) body.style.overflowX = 'visible';

      btn.style.setProperty('position', 'absolute', 'important');
      btn.style.setProperty('right', '-12px', 'important');
      btn.style.setProperty('bottom', '-10px', 'important');
      btn.style.setProperty('left', 'auto', 'important');
      btn.style.setProperty('top', 'auto', 'important');
      btn.style.setProperty('z-index', '20', 'important');
      btn.style.setProperty('width', '32px', 'important');
      btn.style.setProperty('height', '32px', 'important');
      btn.style.setProperty('background', '#0B0B0C', 'important');
      btn.style.setProperty('color', '#fff', 'important');
      btn.style.setProperty('border', '3px solid #F6F1E7', 'important');
      btn.style.setProperty('border-radius', '50%', 'important');
      btn.style.setProperty('display', 'flex', 'important');
      btn.style.setProperty('align-items', 'center', 'important');
      btn.style.setProperty('justify-content', 'center', 'important');
    } catch (e) {}
  }

  function patchBackButtons(root) {
    root = root || document;
    try {
      root.querySelectorAll('.back-btn').forEach(function (btn) {
        if (btn.getAttribute('data-tchilo-back') === '1') {
          if (!btn.querySelector('svg path[d^="M19"]')) btn.innerHTML = BACK_SVG;
          return;
        }
        btn.innerHTML = BACK_SVG;
        btn.setAttribute('data-tchilo-back', '1');
        btn.setAttribute('aria-label', btn.getAttribute('aria-label') || 'Voltar');
      });
    } catch (e) {}
  }

  function run() {
    injectCSS();
    patchBackButtons(document);
    placePlusOutside();
  }

  run();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  }
  [150, 500, 1200, 2500].forEach(function (ms) {
    setTimeout(run, ms);
  });

  if (typeof window.goTo === 'function' && !window.goTo.__headerUiV3) {
    var g = window.goTo;
    window.goTo = function () {
      var r = g.apply(this, arguments);
      setTimeout(run, 30);
      setTimeout(run, 150);
      return r;
    };
    window.goTo.__headerUiV3 = true;
  }

  if (typeof window.renderProfile === 'function' && !window.renderProfile.__headerUiV3) {
    var rp = window.renderProfile;
    window.renderProfile = function () {
      var r = rp.apply(this, arguments);
      setTimeout(run, 40);
      setTimeout(placePlusOutside, 80);
      return r;
    };
    window.renderProfile.__headerUiV3 = true;
  }

  try {
    new MutationObserver(function () {
      setTimeout(function () {
        patchBackButtons();
        placePlusOutside();
      }, 40);
    }).observe(document.body || document.documentElement, {
      childList: true,
      subtree: true
    });
  } catch (e) {}
})();

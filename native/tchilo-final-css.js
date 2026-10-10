/**
 * CSS final v4
 * - linhas de cabeçalho 1px
 * - linhas entre posts do feed 1px (não 3px)
 * - perfil NUNCA visível sem .active (evita dividir feed/notifs)
 */
(function () {
  'use strict';
  if (window.__tchiloFinalCssV4) return;
  window.__tchiloFinalCssV4 = true;
  window.__tchiloFinalCssV3 = true;
  window.__tchiloFinalCssV2 = true;
  window.__tchiloFinalCssV1 = true;

  var st = document.getElementById('tchilo-final-css');
  if (!st) {
    st = document.createElement('style');
    st.id = 'tchilo-final-css';
    (document.head || document.documentElement).appendChild(st);
  }

  st.textContent =
    /* ===== PERFIL: só visível com .active ===== */
    'html body #screen-profile:not(.active){' +
    'display:none!important;' +
    'visibility:hidden!important;' +
    'pointer-events:none!important;' +
    'height:0!important;' +
    'max-height:0!important;' +
    'min-height:0!important;' +
    'overflow:hidden!important;' +
    'flex:0 0 0!important;' +
    'opacity:0!important;}' +
    'html body #screen-profile.active{' +
    'display:flex!important;' +
    'visibility:visible!important;' +
    'pointer-events:auto!important;' +
    'opacity:1!important;}' +
    /* Cabeçalhos: linha fina 1px */
    '.screen-header,' +
    '.screen > .screen-header,' +
    '[id^="screen-"] > .screen-header,' +
    '[id^="screen-settings"] > .screen-header{' +
    'border-bottom:1px solid var(--line,rgba(0,0,0,.12))!important;' +
    'border-bottom-width:1px!important;' +
    'box-shadow:none!important;}' +
    /* Posts do feed: separador fino */
    '#feedList .post,' +
    '#screen-feed .post,' +
    '.feed-list .post,' +
    '.post{' +
    'border-bottom:1px solid var(--line,rgba(0,0,0,.12))!important;' +
    'border-bottom-width:1px!important;' +
    'border-bottom-style:solid!important;}' +
    '#feedList .post:last-child,' +
    '#screen-feed .post:last-child{border-bottom-width:1px!important;}' +
    /* Avatar + */
    '.profile-header,.profile-avatar,#profileBody .profile-avatar,' +
    '#profileBody,.profile-header .profile-avatar{overflow:visible!important;}' +
    '.profile-avatar{position:relative!important;}' +
    '#tchiloProfileAvatarPlus,' +
    '#tchiloProfileAvatarPlus.tchilo-av-add,' +
    'button#tchiloProfileAvatarPlus,' +
    '.tchilo-av-add{' +
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
    'box-shadow:0 2px 6px rgba(0,0,0,.22)!important;' +
    'display:flex!important;' +
    'align-items:center!important;' +
    'justify-content:center!important;' +
    'padding:0!important;margin:0!important;' +
    'animation:none!important;transition:none!important;transform:none!important;}' +
    '#tchiloProfileAvatarPlus svg,.tchilo-av-add svg{' +
    'width:16px!important;height:16px!important;' +
    'stroke:#fff!important;color:#fff!important;display:block!important;}' +
    '#profileBody .profile-actions button[data-tchilo-live],' +
    '#profileBody button[data-tchilo-live],' +
    'button.profile-btn[data-tchilo-live]{' +
    'background:#e11d48!important;' +
    'color:#fff!important;' +
    'border:2px solid #e11d48!important;}' +
    '#storiesBar .tchilo-play-badge,#storiesBar .tchilo-feed-play,' +
    '.story-card .tchilo-play-badge,.story-card .tchilo-feed-play{' +
    'display:none!important;visibility:hidden!important;}';

  /* Limpar display inline residual no perfil se não estiver ativo */
  function clearProfileInline() {
    try {
      var sp = document.getElementById('screen-profile');
      if (sp && !sp.classList.contains('active')) {
        sp.style.removeProperty('display');
        sp.style.removeProperty('visibility');
        sp.style.removeProperty('height');
        sp.style.removeProperty('max-height');
        sp.style.removeProperty('flex');
        sp.style.removeProperty('overflow');
        sp.style.removeProperty('opacity');
      }
    } catch (e) {}
  }
  clearProfileInline();
  setTimeout(clearProfileInline, 200);
  setTimeout(clearProfileInline, 1000);
  try {
    if (typeof window.goTo === 'function' && !window.goTo.__finalCssProfileHide) {
      var g = window.goTo;
      window.goTo = function (s) {
        var r = g.apply(this, arguments);
        if (s !== 'profile') setTimeout(clearProfileInline, 0);
        return r;
      };
      window.goTo.__finalCssProfileHide = true;
    }
  } catch (e2) {}
})();

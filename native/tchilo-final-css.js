/**
 * CSS final v3
 * - linhas de cabeçalho 1px
 * - linhas entre posts do feed 1px (não 3px)
 */
(function () {
  'use strict';
  if (window.__tchiloFinalCssV3) return;
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
})();

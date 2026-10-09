/**
 * CSS final v2
 * - + perfil, Live, badges stories
 * - linhas de cabeçalho 1px em TODAS as páginas (Definições e subpáginas)
 */
(function () {
  'use strict';
  if (window.__tchiloFinalCssV2) return;
  window.__tchiloFinalCssV2 = true;
  window.__tchiloFinalCssV1 = true;

  var st = document.getElementById('tchilo-final-css');
  if (!st) {
    st = document.createElement('style');
    st.id = 'tchilo-final-css';
    (document.head || document.documentElement).appendChild(st);
  }

  st.textContent =
    /* Cabeçalhos: linha fina 1px em todas as screens (incl. settings-*) */
    '.screen-header,' +
    '.screen > .screen-header,' +
    '[id^="screen-"] > .screen-header,' +
    '#screen-settings > .screen-header,' +
    '#screen-settings-account > .screen-header,' +
    '#screen-settings-advanced > .screen-header,' +
    '#screen-settings-language > .screen-header,' +
    '#screen-settings-legal > .screen-header,' +
    '#screen-settings-notifications > .screen-header,' +
    '#screen-settings-privacy > .screen-header,' +
    '#screen-settings-stories > .screen-header,' +
    '#screen-settings-theme > .screen-header,' +
    '#screen-privacy > .screen-header,' +
    '#screen-about > .screen-header,' +
    '#screen-terms > .screen-header,' +
    '#screen-community > .screen-header,' +
    '#screen-child > .screen-header,' +
    '#screen-editprofile > .screen-header,' +
    '#screen-saved > .screen-header,' +
    '#screen-search > .screen-header,' +
    '#screen-messages > .screen-header,' +
    '#screen-notifs > .screen-header,' +
    '#screen-profile > .screen-header{' +
    'border-bottom:1px solid var(--line,rgba(0,0,0,.12))!important;' +
    'border-bottom-width:1px!important;' +
    'border-bottom-style:solid!important;' +
    'box-shadow:none!important;}' +
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
    'background-color:#0B0B0C!important;' +
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
    'background-color:#e11d48!important;' +
    'color:#fff!important;' +
    'border:2px solid #e11d48!important;' +
    'animation:none!important;transition:none!important;}' +
    '#storiesBar .tchilo-play-badge,#storiesBar .tchilo-feed-play,' +
    '.story-card .tchilo-play-badge,.story-card .tchilo-feed-play{' +
    'display:none!important;visibility:hidden!important;}';
})();

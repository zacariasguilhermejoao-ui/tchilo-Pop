/** Light paper theme for create flow, story compose, login — black icons */
(function () {
  'use strict';
  if (window.__TCHILO_LIGHT_CREATE_V2) return;
  window.__TCHILO_LIGHT_CREATE_V2 = true;
  window.__TCHILO_LIGHT_CREATE_V1 = true;

  var PAPER = 'var(--paper,#F3F1E9)';
  var INK = 'var(--ink,#0B0B0C)';

  var css =
    /* ===== CREATE / MEDIA PICKER ===== */
    '#tchiloMediaPicker{background:' + PAPER + '!important;color:' + INK + '!important}' +
    '#tchiloMediaPicker .mp-top{background:' + PAPER + '!important;color:' + INK + '!important}' +
    '#tchiloMediaPicker .mp-icon-btn{background:transparent!important;color:' + INK + '!important;border:0!important;box-shadow:none!important}' +
    '#tchiloMediaPicker .mp-icon-btn svg{stroke:' + INK + '!important;color:' + INK + '!important}' +
    '#tchiloMediaPicker .mp-top-title{color:' + INK + '!important}' +
    '#tchiloMediaPicker .mp-modes{background:transparent!important;}' +
    '#tchiloMediaPicker .mp-mode{background:transparent!important;border:0!important;box-shadow:none!important;color:rgba(11,11,12,.28)!important;}' +
    '#tchiloMediaPicker .mp-mode.on{color:' + INK + '!important;}' +
    '#tchiloMediaPicker .mp-chip{display:none!important;background:transparent!important;color:' + INK + '!important;border:0!important;box-shadow:none!important}' +
    '#tchiloMediaPicker .mp-chip.on{background:' + INK + '!important;color:#fff!important}' +
    '#tchiloMediaPicker .mp-publish{background:' + INK + '!important;color:#fff!important;border:0!important;box-shadow:none!important}' +
    '#tchiloMediaPicker .mp-action{background:transparent!important;color:' + INK + '!important;border:0!important;box-shadow:none!important;border-radius:0!important}' +
    '#tchiloMediaPicker .mp-action svg{stroke:' + INK + '!important}' +
    '#tchiloMediaPicker .mp-section{color:rgba(11,11,12,.55)!important}' +
    '#tchiloMediaPicker .mp-grid{background:rgba(11,11,12,.06)!important;gap:2px!important}' +
    '#tchiloMediaPicker .mp-cell{background:rgba(11,11,12,.04)!important;border:0!important;box-shadow:none!important}' +
    '#tchiloMediaPicker .mp-cell.cam{background:rgba(11,11,12,.06)!important;color:' + INK + '!important}' +
    '#tchiloMediaPicker .mp-cell.cam svg{stroke:' + INK + '!important}' +
    '#tchiloMediaPicker .mp-empty{color:rgba(11,11,12,.5)!important}' +
    '#tchiloMediaPicker .mp-empty button{background:' + INK + '!important;color:#fff!important;border:0!important;box-shadow:none!important}' +
    '#tchiloMediaPicker .mp-theme-preview{color:' + INK + '!important}' +
    '#tchiloMediaPicker .mp-theme-input{background:#fff!important;color:' + INK + '!important;border:1px solid rgba(11,11,12,.1)!important;box-shadow:none!important}' +
    '#tchiloMediaPicker .mp-theme-input::placeholder{color:rgba(11,11,12,.4)!important}' +
    '#tchiloMediaPicker .mp-preview{background:rgba(11,11,12,.04)!important}' +
    '#tchiloMediaPicker .mp-side button{background:rgba(11,11,12,.08)!important;color:' + INK + '!important;border:0!important;box-shadow:none!important}' +
    '#tchiloMediaPicker .mp-side button svg{stroke:' + INK + '!important}' +
    '#tchiloMediaPicker .mp-caption-bar{background:' + PAPER + '!important;border-top:1px solid rgba(11,11,12,.08)!important}' +
    '#tchiloMediaPicker .mp-caption{background:#fff!important;color:' + INK + '!important;border:1px solid rgba(11,11,12,.1)!important;box-shadow:none!important}' +
    '#tchiloMediaPicker .mp-caption::placeholder{color:rgba(11,11,12,.4)!important}' +
    '#tchiloMediaPicker .mp-story-preview{background:rgba(11,11,12,.04)!important}' +
    '#tchiloMediaPicker .mp-pub{color:' + INK + '!important}' +
    '#tchiloMediaPicker .mp-ring{border-color:rgba(11,11,12,.12)!important;border-top-color:' + INK + '!important}' +
    '#tchiloMediaPicker .mp-pct{color:' + INK + '!important}' +
    '#tchiloMediaPicker .mp-pub-label{color:rgba(11,11,12,.55)!important}' +
    '#tchiloMediaPicker #mpMusicChip{background:rgba(11,11,12,.06)!important;color:' + INK + '!important}' +

    /* ===== LOGIN / SIGNUP — paper theme, black icons (do not restyle .login-button layout) ===== */
    '.login-gate{background:' + PAPER + '!important;color:' + INK + '!important}' +
    '.login-gate .login-welcome,.login-gate .login-scroll{color:' + INK + '!important}' +
    '.login-gate .login-panel,.login-gate .signup-panel-wide{background:' + PAPER + '!important;color:' + INK + '!important;border:0!important;box-shadow:none!important}' +
    '.login-gate .login-panel h2,.login-gate .signup-panel-wide h2{color:' + INK + '!important}' +
    '.login-gate .login-input,.login-gate select.login-input{' +
    'background:#fff!important;color:' + INK + '!important;border:1px solid rgba(11,11,12,.12)!important;box-shadow:none!important}' +
    '.login-gate .login-input::placeholder{color:rgba(11,11,12,.4)!important}' +
    '.login-gate .login-back,.login-gate .login-forgot{color:' + INK + '!important}' +
    '.login-gate .signup-kicker,.login-gate label{color:rgba(11,11,12,.55)!important}' +
    '.login-gate .signup-progress span{background:rgba(11,11,12,.1)!important}' +
    '.login-gate .signup-progress span.active{background:' + INK + '!important}' +
    '.login-gate svg,.login-gate .login-logo-img{color:' + INK + '!important}' +

    /* ===== generic white-on-white fix for create screens ===== */
    '#screen-create{background:' + PAPER + '!important;color:' + INK + '!important}' +
    '#screen-create .screen-header{background:' + PAPER + '!important;color:' + INK + '!important}' +
    '#screen-create .back-btn{color:' + INK + '!important;background:transparent!important;border:0!important;box-shadow:none!important}' +
    '#screen-create .back-btn svg{stroke:' + INK + '!important}' +
    '#storyThemeSheet,#storyCreateSheet{background:' + PAPER + '!important;color:' + INK + '!important}' +
    '#storyThemeSheet .screen-header,#storyCreateSheet .screen-header{color:' + INK + '!important}' +
    '#storyThemeSheet .back-btn svg,#storyCreateSheet .back-btn svg{stroke:' + INK + '!important}';

  var s = document.createElement('style');
  s.id = 'tchilo-light-create-css';
  s.textContent = css;
  (document.head || document.documentElement).appendChild(s);
})();

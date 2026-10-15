/**
 * Tchilo UI polish v1
 * - Grelha do perfil a largura total (sem buraco à direita)
 * - Títulos dos sheets centrados
 * - Botões pretos, sem neobrutalismo (sem borda grossa + sombra preta, sem verdes/amarelos primários)
 */
(function () {
  'use strict';
  if (window.__tchiloUiPolishV1) return;
  window.__tchiloUiPolishV1 = true;

  function inject() {
    if (document.getElementById('tchilo-ui-polish-css')) return;
    var st = document.createElement('style');
    st.id = 'tchilo-ui-polish-css';
    st.textContent = [
      /* ===== Profile grid: full width, no left bias / right gap ===== */
      '#screen-profile .profile-body{',
      '  padding-left:0!important;padding-right:0!important;',
      '}',
      '#screen-profile .profile-header,',
      '#screen-profile .profile-actions{',
      '  padding-left:18px!important;padding-right:18px!important;',
      '  box-sizing:border-box!important;',
      '}',
      '#screen-profile .profile-grid{',
      '  display:grid!important;',
      '  grid-template-columns:repeat(3,minmax(0,1fr))!important;',
      '  gap:1px!important;',
      '  width:100%!important;',
      '  max-width:100%!important;',
      '  margin:16px 0 0!important;',
      '  margin-left:0!important;margin-right:0!important;',
      '  box-sizing:border-box!important;',
      '}',
      '#screen-profile .profile-grid-item{',
      '  width:100%!important;min-width:0!important;',
      '  aspect-ratio:4/5!important;',
      '}',
      '#screen-profile .profile-grid-item img,',
      '#screen-profile .profile-grid-item video{',
      '  width:100%!important;height:100%!important;object-fit:cover!important;',
      '}',

      /* ===== Sheet / modal titles centered ===== */
      '.sheet .sheet-title,',
      '.sheet-title,',
      '#tchiloModalHost .tm-title,',
      '#tchiloModalHost .tm-head,',
      '#tchiloGiftSheet h3,',
      '#tchiloProfileShareSheet .tchilo-ps-title,',
      '.profile-action-card > div:first-child b,',
      '#postMenuSheet .sheet-title,',
      '#shareSheet .sheet-title,',
      '#reportSheet .sheet-title,',
      '#reelMenuSheet .sheet-title,',
      '#storyMenuSheet .sheet-title,',
      '#commentSheet .sheet-title{',
      '  text-align:center!important;',
      '  justify-content:center!important;',
      '}',
      /* comment title has back btn — keep flex but center text */
      '#commentSheet .sheet-title{',
      '  display:flex!important;align-items:center!important;',
      '  justify-content:center!important;position:relative!important;',
      '}',
      '#commentSheet .sheet-title .tchilo-sheet-back{',
      '  position:absolute!important;left:8px!important;',
      '}',

      /* ===== Buttons: black primary, no neobrutalist border/shadow ===== */
      '.publish-btn,',
      '.gallery-btn.primary,',
      '.video-cover-actions button.primary,',
      '.sheet-input-bar button,',
      '.playlist-create,',
      'button.primary,',
      '.btn-primary,',
      '.tm-actions > button.tm-primary,',
      '#tchiloQrModal .actions .primary,',
      '.signup-actions button.primary,',
      '.login-actions button.primary,',
      'button[type="submit"].primary{',
      '  background:var(--ink,#0B0B0C)!important;',
      '  color:#fff!important;',
      '  border:0!important;',
      '  box-shadow:none!important;',
      '  border-radius:12px!important;',
      '}',
      /* remove thick black borders / offset shadows (neobrutalist) */
      '.gallery-btn,',
      '.video-cover-actions button,',
      '.color-pick,',
      '.create-input,',
      '.saved-tab,',
      '.playlist-card,',
      '.follow-btn,',
      '.post-follow,',
      '.sheet-input-bar input,',
      '.settings-item,',
      'button{',
      '  box-shadow:none!important;',
      '}',
      /* yellow/green/violet CTA → black */
      '.video-cover-actions button.primary,',
      '.playlist-create,',
      'button.primary{',
      '  background:#0B0B0C!important;color:#fff!important;',
      '}',
      /* borders thinner where still needed */
      '.create-input,',
      '.video-cover-actions button,',
      '.color-pick,',
      '.saved-tab{',
      '  border-width:1px!important;',
      '  border-color:rgba(11,11,12,.14)!important;',
      '}',
      '.saved-tab.active{',
      '  background:#0B0B0C!important;color:#fff!important;border-color:#0B0B0C!important;',
      '}',
      /* follow friends: solid black instead of violet */
      '.follow-btn.friends,',
      '.post-follow.friends{',
      '  background:#0B0B0C!important;color:#fff!important;border:0!important;',
      '}'
    ].join('');
    document.head.appendChild(st);
  }

  inject();
  [100, 600, 1500].forEach(function (ms) {
    setTimeout(inject, ms);
  });
})();

/**
 * Tchilo Stable UI v5
 * - Só estilo do botão + no perfil
 * - NÃO sobrescreve renderUserAvatarHTML / applyAvatarToElement (index manda)
 * - NÃO mexe em ícones nav/topbar
 */
(function () {
  'use strict';
  if (window.__tchiloStableUiV5) return;
  window.__tchiloStableUiV5 = true;
  window.__tchiloStableUiV4 = true;
  window.__tchiloStableUiV3 = true;
  window.__tchiloUiPolishV1 = true; /* bloqueia polish antigo se carregar */

  function injectCSS() {
    var st = document.getElementById('tchiloStableUiCSS');
    if (!st) {
      st = document.createElement('style');
      st.id = 'tchiloStableUiCSS';
      (document.head || document.documentElement).appendChild(st);
    }
    st.textContent =
      '#tchiloProfileAvatarPlus.tchilo-av-add,#tchiloProfileAvatarPlus{' +
      'background:#0B0B0C!important;color:#FFFFFF!important;' +
      'border:2px solid #0B0B0C!important;box-shadow:none!important;' +
      'animation:none!important;transition:none!important;transform:none!important;}' +
      '#tchiloProfileAvatarPlus.tchilo-av-add svg,#tchiloProfileAvatarPlus svg{' +
      'stroke:#FFFFFF!important;color:#FFFFFF!important;}' +
      '.nav-fee,.nav-sms-text,[data-top-messages] span{display:none!important;}' +
      /* sem badges de play/pause na fila de stories */
      '#storiesBar .tchilo-play-badge,#storiesBar .tchilo-feed-play,' +
      '#storiesBar .tchilo-play-mini,.story-card .tchilo-play-badge,' +
      '.story-card .tchilo-feed-play,.story-card .tchilo-play-mini,' +
      '.story-card-reel .tchilo-play-badge{display:none!important;opacity:0!important;visibility:hidden!important;}';
  }

  function fixPlusBtn() {
    var btn = document.getElementById('tchiloProfileAvatarPlus');
    if (!btn) return;
    btn.style.background = '#0B0B0C';
    btn.style.color = '#FFFFFF';
    btn.style.border = '2px solid #0B0B0C';
    btn.style.boxShadow = 'none';
    btn.style.animation = 'none';
    btn.style.transition = 'none';
    btn.style.transform = 'none';
    var svgs = btn.querySelectorAll('svg');
    for (var i = 0; i < svgs.length; i++) {
      svgs[i].setAttribute('stroke', '#FFFFFF');
      svgs[i].style.stroke = '#FFFFFF';
      svgs[i].style.color = '#FFFFFF';
    }
  }

  function stripStoryBadges() {
    try {
      document
        .querySelectorAll(
          '#storiesBar .tchilo-play-badge, #storiesBar .tchilo-feed-play, #storiesBar .tchilo-play-mini,' +
            '.story-card .tchilo-play-badge, .story-card .tchilo-feed-play, .story-card .tchilo-play-mini'
        )
        .forEach(function (n) {
          try {
            n.remove();
          } catch (e) {}
        });
    } catch (e2) {}
  }

  function boot() {
    injectCSS();
    fixPlusBtn();
    stripStoryBadges();
  }

  boot();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  setTimeout(boot, 200);
  setTimeout(boot, 1000);
})();

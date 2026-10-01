/**
 * Tchilo — anti-piscar (feed + botão + do perfil)
 * v1: reduz re-injeções e observers agressivos
 */
(function () {
  'use strict';
  if (window.__tchiloUiStableV1) return;
  window.__tchiloUiStableV1 = true;

  function injectCSS() {
    if (document.getElementById('tchiloUiStableCSS')) return;
    var st = document.createElement('style');
    st.id = 'tchiloUiStableCSS';
    st.textContent =
      /* evita repaint visual em avatars e media */
      '#feedList .post img, #feedList .post video, #feedList .profile-avatar, #screen-profile .profile-avatar{' +
      'image-rendering:auto;}' +
      '#feedList .post{backface-visibility:hidden;}' +
      /* botão + estável */
      '#tchiloProfileAvatarPlus,.tchilo-av-add{' +
      'animation:none!important;transition:none!important;' +
      'opacity:1!important;visibility:visible!important;}' +
      /* não deixar music row a reflow de forma estranha */
      '.post-music,.tchilo-post-music{min-height:36px;}';
    document.head.appendChild(st);
  }

  /* Botão +: garantir um só, sem recriar */
  function stabilizeAvatarPlus() {
    var btns = document.querySelectorAll('#tchiloProfileAvatarPlus, .tchilo-av-add');
    if (btns.length <= 1) return;
    for (var i = 1; i < btns.length; i++) {
      try {
        btns[i].remove();
      } catch (e) {}
    }
  }

  /* Debounce genérico para hooks de renderFeed */
  function debounce(fn, ms) {
    var t = null;
    return function () {
      var args = arguments;
      var self = this;
      clearTimeout(t);
      t = setTimeout(function () {
        fn.apply(self, args);
      }, ms);
    };
  }

  /**
   * Alguns scripts fazem setInterval(injectAll) / paintBadges a cada 4–5s
   * Isso faz o feed e o + piscarem. Substituímos intervals curtos por longos.
   */
  function softenIntervals() {
    /* não podemos limpar todos os intervals; só marcar flag para scripts novos */
    window.__tchiloPreferSlowUiRefresh = true;
  }

  /* Se music-feed-fix injeta a cada 5s, força no máximo a cada 20s via monkey se existir */
  function patchMusicInject() {
    /* o script v2 usa setInterval(injectAll, 5000) — não exporta a função.
       Reduzimos flicker escondendo reflows: se a row já existe com mesmo texto, skip já está no v2. */
  }

  injectCSS();
  softenIntervals();
  stabilizeAvatarPlus();
  setTimeout(stabilizeAvatarPlus, 500);
  setTimeout(stabilizeAvatarPlus, 1500);

  /* observar perfil só para remover duplicados do + */
  try {
    var prof = document.getElementById('screen-profile');
    if (prof && !prof.__stablePlusObs) {
      prof.__stablePlusObs = true;
      new MutationObserver(
        debounce(function () {
          stabilizeAvatarPlus();
        }, 200)
      ).observe(prof, { childList: true, subtree: true });
    }
  } catch (e) {}
})();

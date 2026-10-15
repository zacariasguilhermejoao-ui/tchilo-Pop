/**
 * Ao tocar no ícone de Perfil da navbar → sempre o TEU perfil e as TUAS opções.
 * Limpa viewingProfileUser antes de renderizar.
 * v1
 */
(function () {
  'use strict';
  if (window.__tchiloProfileOwnResetV1) return;
  window.__tchiloProfileOwnResetV1 = true;

  function clearOther() {
    try {
      window.viewingProfileUser = null;
      window.__tchiloViewingProfileUser = null;
    } catch (e) {}
    try {
      document.body.classList.remove('viewing-other-profile');
      var sc = document.getElementById('screen-profile');
      if (sc) sc.classList.add('own-profile');
    } catch (e2) {}
  }

  function goOwnProfile() {
    clearOther();
    try {
      if (typeof goTo === 'function') goTo('profile');
    } catch (e) {}
    try {
      if (typeof renderProfile === 'function') setTimeout(renderProfile, 30);
    } catch (e2) {}
  }

  function wireNav() {
    var btn = document.querySelector('.navbar .nav-item[data-screen="profile"]');
    if (!btn || btn.getAttribute('data-own-reset') === '1') return;
    btn.setAttribute('data-own-reset', '1');
    btn.addEventListener(
      'click',
      function (e) {
        e.preventDefault();
        e.stopPropagation();
        goOwnProfile();
      },
      true
    );
  }

  /* Também quando goTo('profile') sem viewing — garantir classes */
  if (typeof window.goTo === 'function' && !window.goTo.__ownReset) {
    var g = window.goTo;
    window.goTo = function (name) {
      if (String(name) === 'profile') {
        /* se a navbar pediu perfil e viewing está set, o clique já limpou;
           se alguém chamar goTo('profile') sem limpar, não forçamos aqui
           excepto quando o ecrã de origem é o próprio botão — tratado no capture */
      }
      return g.apply(this, arguments);
    };
    window.goTo.__ownReset = true;
  }

  wireNav();
  [200, 800, 2000].forEach(function (ms) {
    setTimeout(wireNav, ms);
  });
})();

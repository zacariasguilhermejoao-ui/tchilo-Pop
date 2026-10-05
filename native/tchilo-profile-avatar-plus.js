/**
 * Tchilo — botão + no avatar
 * v3 — o botão já vem no HTML do renderProfile; este script só liga o click se faltar
 * e NÃO reinjecta / NÃO observa / NÃO usa setInterval (era isso que fazia piscar)
 */
(function () {
  'use strict';
  if (window.__tchiloAvatarPlusV3) return;
  window.__tchiloAvatarPlusV3 = true;
  window.__tchiloAvatarPlusV2 = true;

  function openPicker(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    var editInput = document.getElementById('editAvatarInput');
    if (editInput) {
      try {
        editInput.value = '';
        editInput.click();
        return;
      } catch (err) {}
    }
    if (typeof goTo === 'function') goTo('editprofile');
  }

  function bindOnce() {
    var btn = document.getElementById('tchiloProfileAvatarPlus');
    if (!btn || btn.__bound) return;
    btn.__bound = true;
    btn.addEventListener('click', openPicker);
  }

  /* Se o HTML ainda não tiver o botão (perfil antigo em cache), cria uma vez — sem loop */
  function ensureOnce() {
    bindOnce();
    var btn = document.getElementById('tchiloProfileAvatarPlus');
    if (btn) return;
    var av = document.querySelector('#screen-profile .profile-avatar');
    if (!av) return;
    var sess = null;
    try {
      sess = typeof getSession === 'function' ? getSession() : null;
    } catch (e) {}
    var viewing = window.viewingProfileUser;
    var own =
      sess &&
      sess.username &&
      (!viewing || String(viewing).toLowerCase() === String(sess.username).toLowerCase());
    if (!own) return;
    btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'tchiloProfileAvatarPlus';
    btn.className = 'tchilo-av-add';
    btn.setAttribute('aria-label', 'Adicionar foto');
    btn.innerHTML =
      '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>';
    btn.__bound = true;
    btn.addEventListener('click', openPicker);
    av.appendChild(btn);
  }

  if (typeof window.renderProfile === 'function' && !window.renderProfile.__avatarPlusV3) {
    var orig = window.renderProfile;
    window.renderProfile = function () {
      var r = orig.apply(this, arguments);
      /* só binding — o botão já está no HTML; não remove/recria */
      requestAnimationFrame(bindOnce);
      return r;
    };
    window.renderProfile.__avatarPlusV3 = true;
  }

  setTimeout(ensureOnce, 300);
  setTimeout(bindOnce, 600);
})();

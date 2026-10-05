/**
 * Tchilo — botão + no avatar v3
 * O botão já é gerado no renderProfile (index). Aqui só faz bind do click.
 * Sem setInterval, sem MutationObserver, sem recriar o DOM.
 */
(function () {
  'use strict';
  if (window.__tchiloAvatarPlusV3) return;
  window.__tchiloAvatarPlusV3 = true;

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

  if (typeof window.renderProfile === 'function' && !window.renderProfile.__avatarPlusV3) {
    var orig = window.renderProfile;
    window.renderProfile = function () {
      var r = orig.apply(this, arguments);
      requestAnimationFrame(bindOnce);
      return r;
    };
    window.renderProfile.__avatarPlusV3 = true;
  }

  setTimeout(bindOnce, 400);
})();

/**
 * Tchilo — botão + no avatar v4
 * Posiciona FORA da foto e faz bind do click.
 */
(function () {
  'use strict';
  if (window.__tchiloAvatarPlusV4) return;
  window.__tchiloAvatarPlusV4 = true;
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

  function placeOutside(btn) {
    if (!btn) return;
    var av = btn.closest('.profile-avatar');
    if (av) {
      av.style.setProperty('overflow', 'visible', 'important');
      av.style.setProperty('position', 'relative', 'important');
    }
    var hdr = btn.closest('.profile-header');
    if (hdr) hdr.style.setProperty('overflow', 'visible', 'important');

    btn.style.setProperty('position', 'absolute', 'important');
    btn.style.setProperty('right', '-12px', 'important');
    btn.style.setProperty('bottom', '-10px', 'important');
    btn.style.setProperty('left', 'auto', 'important');
    btn.style.setProperty('top', 'auto', 'important');
    btn.style.setProperty('z-index', '20', 'important');
    btn.style.setProperty('width', '32px', 'important');
    btn.style.setProperty('height', '32px', 'important');
    btn.style.setProperty('background', '#0B0B0C', 'important');
    btn.style.setProperty('color', '#fff', 'important');
    btn.style.setProperty('border', '3px solid #F6F1E7', 'important');
    btn.style.setProperty('border-radius', '50%', 'important');
    btn.style.setProperty('display', 'flex', 'important');
    btn.style.setProperty('align-items', 'center', 'important');
    btn.style.setProperty('justify-content', 'center', 'important');
  }

  function bindOnce() {
    var btn = document.getElementById('tchiloProfileAvatarPlus');
    if (!btn) return;
    placeOutside(btn);
    if (btn.__bound) return;
    btn.__bound = true;
    btn.addEventListener('click', openPicker);
  }

  if (typeof window.renderProfile === 'function' && !window.renderProfile.__avatarPlusV4) {
    var orig = window.renderProfile;
    window.renderProfile = function () {
      var r = orig.apply(this, arguments);
      requestAnimationFrame(bindOnce);
      setTimeout(bindOnce, 80);
      return r;
    };
    window.renderProfile.__avatarPlusV4 = true;
  }

  setTimeout(bindOnce, 200);
  setTimeout(bindOnce, 800);
})();

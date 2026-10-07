/**
 * Tchilo UI Unlock v3 — leve (sem observer/interval pesados)
 */
(function () {
  'use strict';
  if (window.__tchiloUiUnlockV3) return;
  window.__tchiloUiUnlockV3 = true;

  function hasSession() {
    try {
      var raw = localStorage.getItem('tchilo_session');
      if (!raw) return false;
      var o = JSON.parse(raw);
      return !!(o && (o.id || o.username || o.email));
    } catch (e) {
      return false;
    }
  }

  function unlock() {
    if (!hasSession()) return;
    try {
      document.body.classList.add('tchilo-session-on');
      document.body.classList.remove('tchilo-logged-out', 'login-locked', 'legal-screen-open', 'tchilo-no-bottom-nav');
      var g = document.getElementById('loginGate');
      if (g) {
        g.classList.add('hidden');
        g.style.setProperty('display', 'none', 'important');
        g.style.setProperty('pointer-events', 'none', 'important');
      }
      var sv = document.getElementById('storyViewer');
      if (sv && !sv.classList.contains('open')) {
        sv.style.setProperty('display', 'none', 'important');
        sv.style.setProperty('pointer-events', 'none', 'important');
      }
      var nav = document.querySelector('.navbar');
      if (nav) {
        nav.style.setProperty('display', 'flex', 'important');
        nav.style.setProperty('pointer-events', 'auto', 'important');
      }
    } catch (e) {}
  }

  window.tchiloUiUnlock = unlock;
  unlock();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', unlock);
  setTimeout(unlock, 200);
  setTimeout(unlock, 1000);
})();

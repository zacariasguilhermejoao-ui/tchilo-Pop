/** Tchilo login session stick v7 */
(function () {
  'use strict';
  if (window.__tchiloLoginSessionFixV7) return;
  window.__tchiloLoginSessionFixV7 = true;

  function markJust() {
    window.__tchiloJustLoggedIn = true;
    try { clearTimeout(window.__tchiloJustLoggedInTimer); } catch (e) {}
    window.__tchiloJustLoggedInTimer = setTimeout(function () {
      window.__tchiloJustLoggedIn = false;
    }, 12000);
  }

  function localSession() {
    try {
      var s = JSON.parse(localStorage.getItem('tchilo_session') || 'null');
      return s && s.id ? s : null;
    } catch (e) {
      return null;
    }
  }

  function forceHide() {
    try {
      var g = document.getElementById('loginGate');
      if (g) {
        g.classList.add('hidden');
        g.style.setProperty('display', 'none', 'important');
      }
      document.body.classList.remove('login-locked');
      document.body.style.overflow = '';
    } catch (e) {}
    try {
      if (typeof bootApp === 'function') bootApp();
    } catch (e2) {}
  }

  function guard(fnName) {
    var orig = window[fnName];
    if (typeof orig !== 'function' || orig.__v7) return;
    window[fnName] = function () {
      if (window.__tchiloLoggingOut) return orig.apply(this, arguments);
      if (window.__tchiloJustLoggedIn) {
        console.warn('[login] blocked', fnName);
        return;
      }
      if (fnName === 'showLoginGate' || fnName === 'clearSession') {
        var s = localSession();
        if (s && s.id) {
          console.warn('[login] blocked', fnName, '(local session)');
          if (fnName === 'showLoginGate') forceHide();
          return;
        }
      }
      return orig.apply(this, arguments);
    };
    window[fnName].__v7 = true;
  }

  function patchLogin() {
    if (typeof window.tchiloSupabaseLogin !== 'function' || window.tchiloSupabaseLogin.__v7) return;
    var prev = window.tchiloSupabaseLogin;
    window.tchiloSupabaseLogin = async function (identifier, password) {
      markJust();
      try {
        var r = await prev.apply(this, arguments);
        markJust();
        forceHide();
        return r;
      } catch (e) {
        window.__tchiloJustLoggedIn = false;
        throw e;
      }
    };
    window.tchiloSupabaseLogin.__v7 = true;
  }

  function patchSync() {
    if (typeof window.tchiloSyncAuthSession !== 'function' || window.tchiloSyncAuthSession.__v7) return;
    var prev = window.tchiloSyncAuthSession;
    window.tchiloSyncAuthSession = async function () {
      try {
        await prev.apply(this, arguments);
      } catch (e) {
        console.warn('[login] sync', e);
        if (localSession()) forceHide();
      }
      if (localSession()) forceHide();
    };
    window.tchiloSyncAuthSession.__v7 = true;
  }

  function run() {
    guard('showLoginGate');
    guard('showLoginHome');
    guard('clearSession');
    patchLogin();
    patchSync();
  }

  run();
  setTimeout(run, 200);
  setTimeout(run, 1000);
  setTimeout(run, 3000);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  }
})();

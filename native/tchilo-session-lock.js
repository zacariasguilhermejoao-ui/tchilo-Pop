/**
 * Tchilo — trava de sessão
 * v1: ver perfil de outra pessoa NUNCA troca a conta logada
 */
(function () {
  'use strict';
  if (window.__tchiloSessionLockV1) return;
  window.__tchiloSessionLockV1 = true;

  function toast(msg) {
    try {
      if (typeof showToast === 'function') showToast(String(msg));
    } catch (e) {}
  }

  function readSession() {
    try {
      if (typeof getSession === 'function') return getSession();
    } catch (e) {}
    try {
      return JSON.parse(localStorage.getItem('tchilo_session') || 'null');
    } catch (e2) {
      return null;
    }
  }

  function writeSession(s) {
    try {
      if (typeof setSession === 'function') setSession(s);
      else localStorage.setItem('tchilo_session', JSON.stringify(s));
    } catch (e) {}
  }

  /* Guarda a identidade real ao arrancar */
  var locked = null;
  try {
    var s0 = readSession();
    if (s0 && (s0.username || s0.id || s0.email)) {
      locked = {
        username: s0.username || null,
        id: s0.id || null,
        email: s0.email || null
      };
      window.__tchiloLockedSession = locked;
    }
  } catch (e) {}

  function sameIdentity(a, b) {
    if (!a || !b) return false;
    if (a.id && b.id && String(a.id) === String(b.id)) return true;
    if (a.username && b.username && String(a.username).toLowerCase() === String(b.username).toLowerCase())
      return true;
    if (a.email && b.email && String(a.email).toLowerCase() === String(b.email).toLowerCase())
      return true;
    return false;
  }

  /* setSession: se já há sessão locked, não permitir trocar username/id silenciosamente */
  function patchSetSession() {
    if (typeof window.setSession !== 'function') return;
    if (window.setSession.__sessionLock) return;
    var orig = window.setSession;
    window.setSession = function (next) {
      var cur = locked || readSession();
      if (cur && next && (cur.username || cur.id)) {
        /* logout explícito */
        if (next === null || next === undefined) {
          locked = null;
          window.__tchiloLockedSession = null;
          return orig.apply(this, arguments);
        }
        /* login novo (outro user) só se for após logout ou se IDs baterem */
        if (!sameIdentity(cur, next) && (cur.username || cur.id)) {
          /* Se o next parece só “view profile” mal gravado — bloquear */
          console.warn('[Tchilo] bloqueada troca de sessão', cur.username, '→', next.username);
          toast('Sessão protegida — não foi trocada a conta');
          return cur;
        }
      }
      if (next && (next.username || next.id)) {
        locked = {
          username: next.username || null,
          id: next.id || null,
          email: next.email || null
        };
        window.__tchiloLockedSession = locked;
      }
      return orig.apply(this, arguments);
    };
    window.setSession.__sessionLock = true;
  }

  /* viewingProfileUser nunca sobrescreve session.username */
  function patchViewingProfile() {
    try {
      Object.defineProperty(window, 'viewingProfileUser', {
        configurable: true,
        enumerable: true,
        get: function () {
          return window.__tchiloViewingProfileUser || null;
        },
        set: function (v) {
          window.__tchiloViewingProfileUser = v || null;
          /* NÃO tocar na sessão */
        }
      });
    } catch (e) {
      /* fallback */
    }
  }

  /* openUserProfile: só visualização */
  function patchOpenUserProfile() {
    if (typeof window.openUserProfile !== 'function') return;
    if (window.openUserProfile.__sessionLock) return;
    var orig = window.openUserProfile;
    window.openUserProfile = function (username) {
      var sess = readSession();
      window.__tchiloViewingProfileUser = username || null;
      var r = orig.apply(this, arguments);
      /* garantir sessão intacta */
      var after = readSession();
      if (sess && after && sess.username && after.username !== sess.username) {
        writeSession(sess);
        toast('Sessão restaurada');
      }
      return r;
    };
    window.openUserProfile.__sessionLock = true;
  }

  /* Se URL é /u/alguem — NÃO fazer login como essa pessoa */
  function guardUrlProfile() {
    try {
      var m = String(location.pathname || '').match(/^\/u\/([^\/]+)/i);
      if (!m) return;
      var user = decodeURIComponent(m[1]);
      window.__tchiloViewingProfileUser = user;
      var sess = readSession();
      if (sess && sess.username && sess.username.toLowerCase() !== user.toLowerCase()) {
        /* estamos só a VER o perfil */
        window.viewingProfileUser = user;
      }
    } catch (e) {}
  }

  function boot() {
    patchSetSession();
    patchViewingProfile();
    patchOpenUserProfile();
    guardUrlProfile();
  }

  boot();
  setTimeout(boot, 300);
  setTimeout(boot, 1000);
})();

/* LOGIN + CLICK FIX v14 */
(function () {
  'use strict';
  if (window.__tchiloLoginSessionFixV14) return;
  window.__tchiloLoginSessionFixV14 = true;
  window.__tchiloLoginSessionFixV13 = true;

  var JUST_MS = 90000;

  function markJust() {
    window.__tchiloJustLoggedIn = true;
    try { clearTimeout(window.__tchiloJustLoggedInTimer); } catch (e) {}
    window.__tchiloJustLoggedInTimer = setTimeout(function () {
      window.__tchiloJustLoggedIn = false;
    }, JUST_MS);
  }

  function localSession() {
    try {
      var s = JSON.parse(localStorage.getItem('tchilo_session') || 'null');
      return s && (s.id || s.username || s.email) ? s : null;
    } catch (e) {
      return null;
    }
  }

  function writeSession(obj) {
    try {
      if (!obj) return;
      var safe = {};
      for (var k in obj) if (k !== 'password') safe[k] = obj[k];
      localStorage.setItem('tchilo_session', JSON.stringify(safe));
      if (typeof setSession === 'function') {
        try { setSession(safe); } catch (e) {}
      }
    } catch (e) {
      try { localStorage.setItem('tchilo_session', JSON.stringify(obj)); } catch (e2) {}
    }
  }

  function injectClickCss() {
    if (document.getElementById('tchilo-click-fix-v14')) return;
    var st = document.createElement('style');
    st.id = 'tchilo-click-fix-v14';
    st.textContent =
      '#storyViewer:not(.open),.story-viewer:not(.open){' +
      'display:none!important;pointer-events:none!important;visibility:hidden!important;z-index:-1!important;opacity:0!important;}' +
      '.login-gate.hidden,#loginGate.hidden,body.tchilo-session-on .login-gate,body.tchilo-session-on #loginGate{' +
      'display:none!important;pointer-events:none!important;visibility:hidden!important;z-index:-1!important;}' +
      'body.tchilo-session-on .navbar,body.tchilo-session-on .navbar *,' +
      'body.tchilo-session-on .topbar,body.tchilo-session-on .topbar *,' +
      'body.tchilo-session-on .nav-item,body.tchilo-session-on .nav-post,' +
      'body.tchilo-session-on .icon-btn,body.tchilo-session-on .logo-img{' +
      'pointer-events:auto!important;cursor:pointer!important;}' +
      'body.tchilo-session-on .navbar{' +
      'display:flex!important;opacity:1!important;visibility:visible!important;transform:none!important;}' +
      'body.tchilo-session-on.tchilo-logged-out .navbar{' +
      'display:flex!important;pointer-events:auto!important;opacity:1!important;visibility:visible!important;}' +
      '.sheet:not(.open),.profile-action-sheet:not(.open){pointer-events:none!important;}';
    (document.head || document.documentElement).appendChild(st);
  }

  function restoreAppChrome() {
    injectClickCss();
    try {
      var b = document.body;
      if (!localSession()) return;
      b.classList.remove('login-locked', 'legal-screen-open', 'legal-from-login', 'tchilo-logged-out', 'tchilo-no-bottom-nav');
      b.classList.add('tchilo-session-on');
      b.style.overflow = '';
      b.style.position = '';
      b.style.pointerEvents = '';
      b.style.touchAction = '';
      b.style.width = '';
      b.style.height = '';
    } catch (e) {}

    try {
      var g = document.getElementById('loginGate');
      if (g) {
        g.classList.add('hidden');
        g.style.setProperty('display', 'none', 'important');
        g.style.setProperty('pointer-events', 'none', 'important');
        g.style.setProperty('visibility', 'hidden', 'important');
        g.style.setProperty('z-index', '-1', 'important');
      }
    } catch (e2) {}

    try {
      var sv = document.getElementById('storyViewer');
      if (sv && !sv.classList.contains('open')) {
        sv.style.setProperty('display', 'none', 'important');
        sv.style.setProperty('pointer-events', 'none', 'important');
        sv.style.setProperty('z-index', '-1', 'important');
        sv.style.setProperty('opacity', '0', 'important');
      }
    } catch (e3) {}

    try {
      var nav = document.querySelector('.navbar');
      if (nav) {
        nav.style.setProperty('display', 'flex', 'important');
        nav.style.setProperty('pointer-events', 'auto', 'important');
        nav.style.setProperty('opacity', '1', 'important');
        nav.style.setProperty('visibility', 'visible', 'important');
        nav.style.setProperty('transform', 'none', 'important');
      }
      document.querySelectorAll('.nav-item,.nav-post,.icon-btn,.logo-img,.topbar').forEach(function (el) {
        el.style.pointerEvents = 'auto';
        el.style.cursor = 'pointer';
      });
    } catch (e4) {}

    try {
      if (typeof window.tchiloUiUnlock === 'function') window.tchiloUiUnlock();
    } catch (e5) {}
  }

  function forceHideGate() {
    restoreAppChrome();
    try { if (typeof bootApp === 'function') bootApp(); } catch (e) {}
    try { if (typeof goTo === 'function') goTo('feed'); } catch (e2) {}
    try {
      if (typeof renderFeed === 'function') renderFeed();
      if (typeof renderStories === 'function') renderStories();
    } catch (e3) {}
    setTimeout(restoreAppChrome, 0);
    setTimeout(restoreAppChrome, 100);
    setTimeout(function () {
      restoreAppChrome();
      try { if (typeof renderFeed === 'function') renderFeed(); } catch (e4) {}
    }, 400);
    setTimeout(restoreAppChrome, 1200);
  }

  /* FORCE click on nav/topbar icons */
  function handleNavClick(e) {
    try {
      var t = e.target;
      if (!t || !t.closest) return;
      var btn = t.closest('.nav-item, .nav-post, .icon-btn, .logo-img, button[data-screen]');
      if (!btn) return;

      restoreAppChrome();

      var screen = btn.getAttribute('data-screen');
      var oc = btn.getAttribute('onclick') || '';

      /* Force navigation so nothing can block it */
      if (screen === 'feed' || /onNavFeed/.test(oc)) {
        e.preventDefault();
        e.stopPropagation();
        if (typeof window.onNavFeed === 'function') window.onNavFeed();
        else if (typeof window.goTo === 'function') window.goTo('feed');
        return;
      }
      if (screen === 'profile' || /goTo\(['\"]profile['\"]\)/.test(oc)) {
        e.preventDefault();
        e.stopPropagation();
        window.viewingProfileUser = null;
        if (typeof window.goTo === 'function') window.goTo('profile');
        return;
      }
      if (screen === 'notifs' || /goTo\(['\"]notifs['\"]\)/.test(oc)) {
        e.preventDefault();
        e.stopPropagation();
        if (typeof window.goTo === 'function') window.goTo('notifs');
        return;
      }
      if (screen === 'messages' || /goTo\(['\"]messages['\"]\)/.test(oc)) {
        e.preventDefault();
        e.stopPropagation();
        if (typeof window.goTo === 'function') window.goTo('messages');
        return;
      }
      if (screen === 'reels' || /goTo\(['\"]reels['\"]\)/.test(oc)) {
        e.preventDefault();
        e.stopPropagation();
        if (typeof window.goTo === 'function') window.goTo('reels');
        return;
      }
      if (/goTo\(['\"]create['\"]\)/.test(oc) || (btn.classList && btn.classList.contains('nav-post'))) {
        e.preventDefault();
        e.stopPropagation();
        if (typeof window.goTo === 'function') window.goTo('create');
        return;
      }
      if (screen && typeof window.goTo === 'function') {
        e.preventDefault();
        e.stopPropagation();
        window.goTo(screen);
      }
    } catch (err) {}
  }

  function installClickForce() {
    if (window.__tchiloClickForceV14) return;
    window.__tchiloClickForceV14 = true;
    document.addEventListener('click', handleNavClick, true);
    document.addEventListener('touchend', function (e) {
      /* small delay so click also fires; only unlock on touch */
      restoreAppChrome();
    }, true);
  }

  function fallbackProfile(user) {
    var meta = (user && user.user_metadata) || {};
    var uname = meta.username || meta.user_name || ('user_' + String((user && user.id) || '').slice(0, 8));
    return {
      id: user.id,
      username: uname,
      display_name: meta.display_name || meta.full_name || uname,
      avatar_url: meta.avatar_url || null,
      is_private: false,
      anonymous_mode: false
    };
  }

  async function safeProfile(user) {
    if (!user) return fallbackProfile({ id: 'unknown', user_metadata: {} });
    var SB = window.tchiloSupabase;
    var profile = null;
    try {
      if (typeof window.tchiloEnsureProfile === 'function') {
        profile = await window.tchiloEnsureProfile(user);
      }
    } catch (e) {}
    if (!profile && SB) {
      try {
        var pr = await SB.from('profiles').select('*').eq('id', user.id).maybeSingle();
        profile = pr && pr.data;
      } catch (e2) {}
    }
    if (!profile) profile = fallbackProfile(user);
    return profile;
  }

  function applyUser(user, profile) {
    if (!profile) profile = fallbackProfile(user);
    var sess = {
      id: profile.id || user.id,
      username: profile.username || fallbackProfile(user).username,
      email: (user && user.email) || '',
      displayName: profile.display_name || profile.username || '',
      avatar: profile.avatar_url || null,
      privateAccount: !!profile.is_private,
      anonymousMode: !!profile.anonymous_mode
    };
    writeSession(sess);
    markJust();
    forceHideGate();
    return sess;
  }

  async function resolveEmail(identifier) {
    identifier = String(identifier || '').trim().toLowerCase();
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier)) return identifier;
    var SB = window.tchiloSupabase;
    if (!SB) return null;
    try {
      var pr = await SB.from('profiles').select('id,username,email').eq('username', identifier).maybeSingle();
      if (pr && pr.data && pr.data.email) return String(pr.data.email).toLowerCase();
    } catch (e) {}
    return null;
  }

  function installGuards() {
    if (typeof window.showLoginGate === 'function' && !window.showLoginGate.__v14) {
      var _sg = window.showLoginGate;
      window.showLoginGate = function () {
        if (window.__tchiloJustLoggedIn && !window.__tchiloLoggingOut) {
          forceHideGate();
          return;
        }
        if (localSession() && !window.__tchiloLoggingOut) {
          forceHideGate();
          return;
        }
        return _sg.apply(this, arguments);
      };
      window.showLoginGate.__v14 = true;
      window.showLoginGate.__raw = _sg;
    }
    if (typeof window.clearSession === 'function' && !window.clearSession.__v14) {
      var _cs = window.clearSession;
      window.clearSession = function () {
        if (window.__tchiloJustLoggedIn && !window.__tchiloLoggingOut) return;
        return _cs.apply(this, arguments);
      };
      window.clearSession.__v14 = true;
    }
    if (typeof window.hideLoginGate === 'function' && !window.hideLoginGate.__v14) {
      window.hideLoginGate = function () { forceHideGate(); };
      window.hideLoginGate.__v14 = true;
    }
  }

  function installLogin() {
    window.tchiloSupabaseLogin = async function (identifier, password) {
      identifier = String(identifier || '').trim().toLowerCase();
      password = String(password || '');
      if (!identifier || !password) throw new Error('Preenche os dois campos.');
      var SB = window.tchiloSupabase;
      if (!SB || !SB.auth) throw new Error('Servico de autenticacao indisponivel. Recarrega a pagina.');

      var email = identifier;
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier)) {
        email = await resolveEmail(identifier);
        if (!email) throw new Error('Para entrar, usa o email da conta (ex: teu@gmail.com), nao o @username.');
      }

      var res = await SB.auth.signInWithPassword({ email: email, password: password });
      if (res.error) {
        var msg = res.error.message || 'Nao foi possivel iniciar sessao.';
        if (/invalid login|invalid credentials|invalid_credentials/i.test(msg))
          msg = 'Email ou palavra-passe incorretos.';
        if (/email not confirmed/i.test(msg))
          msg = 'Confirma o teu email antes de entrar.';
        throw new Error(msg);
      }
      var user = res.data && res.data.user;
      if (!user) throw new Error('Nao foi possivel iniciar sessao.');

      markJust();
      writeSession({
        id: user.id,
        username: (user.user_metadata && user.user_metadata.username) || ('user_' + String(user.id).slice(0, 8)),
        email: user.email || email,
        displayName: (user.user_metadata && user.user_metadata.display_name) || '',
        avatar: null,
        privateAccount: false,
        anonymousMode: false
      });
      forceHideGate();

      var profile = await safeProfile(user);
      applyUser(user, profile);
      return res.data;
    };

    window.tchiloLogin = async function (e) {
      if (e && e.preventDefault) e.preventDefault();
      var identifierEl = document.getElementById('loginIdentifier');
      var passwordEl = document.getElementById('loginPassword');
      var identifier = (identifierEl && identifierEl.value) || '';
      var password = passwordEl ? passwordEl.value : '';
      var error = document.getElementById('loginError');
      if (error) error.textContent = '';
      if (!String(identifier).trim() || !password) {
        if (error) error.textContent = 'Preenche os dois campos.';
        return;
      }
      var btn =
        (e && e.target && e.target.querySelector &&
          (e.target.querySelector('button[type="submit"]') || e.target.querySelector('.login-button'))) ||
        document.querySelector('#accessPanel button[type="submit"]');
      try {
        if (typeof tchiloSetLoading === 'function') tchiloSetLoading(btn, true);
      } catch (e1) {}
      try {
        await window.tchiloSupabaseLogin(identifier, password);
      } catch (err) {
        console.error('[login-v14]', err);
        if (error) error.textContent = (err && err.message) || 'Nao foi possivel iniciar sessao.';
      } finally {
        try {
          if (typeof tchiloSetLoading === 'function') tchiloSetLoading(btn, false);
        } catch (e3) {}
      }
    };
  }

  function installSync() {
    window.tchiloSyncAuthSession = async function () {
      try {
        if (window.__tchiloPasswordRecoveryActive) return;
        if (typeof tchiloIsPasswordRecoveryUrl === 'function' && tchiloIsPasswordRecoveryUrl()) return;
      } catch (e) {}
      var SB = window.tchiloSupabase;
      if (!SB || !SB.auth) {
        if (localSession()) forceHideGate();
        return;
      }
      try {
        var out = await SB.auth.getSession();
        var session = out && out.data && out.data.session;
        if (session && session.user) {
          var profile = await safeProfile(session.user);
          applyUser(session.user, profile);
          return;
        }
        if (window.__tchiloJustLoggedIn || localSession()) {
          forceHideGate();
          return;
        }
        window.__tchiloLoggingOut = true;
        try {
          if (typeof window.showLoginGate.__raw === 'function') window.showLoginGate.__raw();
        } catch (e2) {}
        window.__tchiloLoggingOut = false;
      } catch (err) {
        if (localSession()) forceHideGate();
      }
    };
  }

  function run() {
    injectClickCss();
    installClickForce();
    installGuards();
    installLogin();
    installSync();
    if (localSession()) restoreAppChrome();
  }

  run();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  setTimeout(run, 50);
  setTimeout(run, 300);
  setTimeout(run, 1000);
  setTimeout(run, 2500);
  setInterval(function () {
    if (localSession()) restoreAppChrome();
  }, 5000);
})();

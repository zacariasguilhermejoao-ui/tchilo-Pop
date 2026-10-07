/* LOGIN FIX v13 + legal navbar */
(function () {
  'use strict';
  if (window.__tchiloLoginSessionFixV13) return;
  window.__tchiloLoginSessionFixV13 = true;
  window.__tchiloLoginSessionFixV12 = true;

  var JUST_MS = 60000;

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

  function restoreAppChrome() {
    try {
      var b = document.body;
      b.classList.remove('login-locked');
      b.classList.remove('legal-screen-open');
      b.classList.remove('legal-from-login');
      b.classList.remove('tchilo-logged-out');
      b.classList.remove('tchilo-no-bottom-nav');
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
        g.setAttribute('aria-hidden', 'true');
      }
    } catch (e2) {}

    try {
      var nav = document.querySelector('.navbar');
      if (nav) {
        nav.style.setProperty('display', 'flex', 'important');
        nav.style.setProperty('pointer-events', 'auto', 'important');
        nav.style.setProperty('opacity', '1', 'important');
        nav.style.setProperty('visibility', 'visible', 'important');
        nav.style.setProperty('transform', 'none', 'important');
        nav.style.removeProperty('height');
        nav.style.removeProperty('max-height');
        nav.removeAttribute('data-legal-hidden');
      }
      document.querySelectorAll('.navbar .nav-item, .navbar .nav-post, .topbar .icon-btn, .topbar-icons .icon-btn, .logo-img').forEach(function (el) {
        el.style.pointerEvents = 'auto';
        el.style.cursor = 'pointer';
      });
      var topbar = document.querySelector('.topbar');
      if (topbar) {
        topbar.style.pointerEvents = 'auto';
        topbar.style.removeProperty('display');
      }
      var feed = document.getElementById('feedList');
      if (feed) {
        feed.style.pointerEvents = 'auto';
        feed.style.visibility = 'visible';
      }
    } catch (e3) {}

    try {
      if (typeof window.tchiloUiUnlock === 'function') window.tchiloUiUnlock();
    } catch (e4) {}
  }

  function forceHideGate() {
    restoreAppChrome();
    try {
      if (typeof bootApp === 'function') bootApp();
    } catch (e) {}
    try {
      if (typeof goTo === 'function') goTo('feed');
    } catch (e2) {}
    try {
      if (typeof renderFeed === 'function') renderFeed();
      if (typeof renderStories === 'function') renderStories();
    } catch (e3) {}
    setTimeout(restoreAppChrome, 0);
    setTimeout(restoreAppChrome, 100);
    setTimeout(function () {
      restoreAppChrome();
      try {
        if (typeof renderFeed === 'function') renderFeed();
      } catch (e4) {}
    }, 400);
    setTimeout(restoreAppChrome, 1200);
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
    try {
      if (typeof showToast === 'function') showToast('Ola, ' + sess.username + '!');
    } catch (e) {}
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
    if (typeof window.showLoginGate === 'function' && !window.showLoginGate.__v13) {
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
      window.showLoginGate.__v13 = true;
      window.showLoginGate.__raw = _sg;
    }
    if (typeof window.clearSession === 'function' && !window.clearSession.__v13) {
      var _cs = window.clearSession;
      window.clearSession = function () {
        if (window.__tchiloJustLoggedIn && !window.__tchiloLoggingOut) return;
        return _cs.apply(this, arguments);
      };
      window.clearSession.__v13 = true;
    }
    if (typeof window.hideLoginGate === 'function' && !window.hideLoginGate.__v13) {
      window.hideLoginGate = function () {
        forceHideGate();
      };
      window.hideLoginGate.__v13 = true;
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
        if (!email) {
          throw new Error('Para entrar, usa o email da conta (ex: teu@gmail.com), nao o @username.');
        }
      }

      var res = await SB.auth.signInWithPassword({ email: email, password: password });
      if (res.error) {
        var msg = res.error.message || 'Nao foi possivel iniciar sessao.';
        if (/invalid login|invalid credentials|invalid_credentials/i.test(msg)) {
          msg = 'Email ou palavra-passe incorretos.';
        }
        if (/email not confirmed/i.test(msg)) {
          msg = 'Confirma o teu email antes de entrar.';
        }
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
        console.error('[login-v13]', err);
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
})();

/* Legal navbar minimal */
(function () {
  'use strict';
  if (window.__tchiloLegalNavV13) return;
  window.__tchiloLegalNavV13 = true;
  var LEGAL = { terms: 1, privacy: 1, child: 1, community: 1, about: 1 };
  function injectCss() {
    if (document.getElementById('tchilo-legal-navbar-fix')) return;
    var style = document.createElement('style');
    style.id = 'tchilo-legal-navbar-fix';
    style.textContent =
      'body.legal-screen-open:not(.tchilo-session-on) .navbar,' +
      'body.legal-from-login:not(.tchilo-session-on) .navbar{display:none!important;pointer-events:none!important;}';
    (document.head || document.documentElement).appendChild(style);
  }
  function boot() {
    injectCss();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();

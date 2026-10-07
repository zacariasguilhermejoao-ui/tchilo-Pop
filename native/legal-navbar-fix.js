/* LOGIN FIX v12 + legal navbar — sem ecran branco, icones clicaveis */
(function () {
  'use strict';
  if (window.__tchiloLoginSessionFixV12) return;
  window.__tchiloLoginSessionFixV12 = true;
  window.__tchiloLoginSessionFixV11 = true;

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

  /* Restaura UI completa apos login — critico */
  function restoreAppChrome() {
    try {
      document.body.classList.remove('login-locked');
      document.body.classList.remove('legal-screen-open');
      document.body.classList.remove('legal-from-login');
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.pointerEvents = '';
      document.body.style.touchAction = '';
    } catch (e) {}

    try {
      var g = document.getElementById('loginGate');
      if (g) {
        g.classList.add('hidden');
        g.style.setProperty('display', 'none', 'important');
        g.style.pointerEvents = 'none';
        g.setAttribute('aria-hidden', 'true');
      }
    } catch (e2) {}

    /* Navbar + topbar + stories visiveis e clicaveis */
    try {
      var nav = document.querySelector('.navbar');
      if (nav) {
        nav.style.removeProperty('display');
        nav.style.removeProperty('visibility');
        nav.style.removeProperty('pointer-events');
        nav.style.removeProperty('opacity');
        nav.style.removeProperty('height');
        nav.style.removeProperty('max-height');
        nav.style.removeProperty('transform');
        nav.removeAttribute('data-legal-hidden');
        nav.style.pointerEvents = 'auto';
      }
      var topbar = document.querySelector('.topbar');
      if (topbar) {
        topbar.style.removeProperty('display');
        topbar.style.removeProperty('visibility');
        topbar.style.removeProperty('pointer-events');
        topbar.style.pointerEvents = 'auto';
      }
      var stories = document.querySelector('.stories');
      if (stories) {
        stories.style.removeProperty('display');
        stories.style.removeProperty('visibility');
        stories.style.removeProperty('pointer-events');
      }
      /* Todos os botoes da nav clicaveis */
      document.querySelectorAll('.navbar .nav-item, .navbar .nav-post, .topbar-icons .icon-btn, .topbar .icon-btn').forEach(function (el) {
        el.style.pointerEvents = 'auto';
        el.style.cursor = 'pointer';
      });
    } catch (e3) {}
  }

  function forceHideGate() {
    restoreAppChrome();
    try {
      if (typeof bootApp === 'function') bootApp();
    } catch (e) {
      console.warn('[login-v12] bootApp', e);
    }
    /* Garantir feed visivel */
    try {
      if (typeof goTo === 'function') goTo('feed');
    } catch (e2) {}
    try {
      if (typeof renderFeed === 'function') renderFeed();
      if (typeof renderStories === 'function') renderStories();
    } catch (e3) {}
    /* Segunda passagem apos bootApp (pode ter reaplicado classes) */
    setTimeout(restoreAppChrome, 0);
    setTimeout(restoreAppChrome, 100);
    setTimeout(function () {
      restoreAppChrome();
      try {
        if (typeof renderFeed === 'function') renderFeed();
      } catch (e4) {}
    }, 400);
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
    if (typeof window.showLoginGate === 'function' && !window.showLoginGate.__v12) {
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
      window.showLoginGate.__v12 = true;
      window.showLoginGate.__raw = _sg;
    }

    if (typeof window.clearSession === 'function' && !window.clearSession.__v12) {
      var _cs = window.clearSession;
      window.clearSession = function () {
        if (window.__tchiloJustLoggedIn && !window.__tchiloLoggingOut) return;
        return _cs.apply(this, arguments);
      };
      window.clearSession.__v12 = true;
    }

    if (typeof window.hideLoginGate === 'function' && !window.hideLoginGate.__v12) {
      var _hg = window.hideLoginGate;
      window.hideLoginGate = function () {
        forceHideGate();
      };
      window.hideLoginGate.__v12 = true;
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
      try {
        if (typeof tchiloClearFieldErrors === 'function') {
          tchiloClearFieldErrors(document.getElementById('accessPanel') || document);
        }
      } catch (e0) {}
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
        console.error('[login-v12]', err);
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
    if (localSession()) {
      restoreAppChrome();
    }
  }

  run();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  setTimeout(run, 50);
  setTimeout(run, 300);
  setTimeout(run, 1000);
  setTimeout(run, 2500);
})();

/* Legal navbar — so esconde nav em paginas legais, NUNCA apos login */
(function () {
  'use strict';
  if (window.__tchiloLegalNavV12) return;
  window.__tchiloLegalNavV12 = true;

  var LEGAL_SCREENS = { terms: 1, privacy: 1, child: 1, community: 1, about: 1 };

  function injectCss() {
    if (document.getElementById('tchilo-legal-navbar-fix')) return;
    var style = document.createElement('style');
    style.id = 'tchilo-legal-navbar-fix';
    style.textContent =
      'body.legal-screen-open .navbar,body.legal-from-login .navbar,' +
      'body.legal-screen-open .topbar,body.legal-from-login .topbar,' +
      'body.legal-screen-open .stories,body.legal-from-login .stories{' +
      'display:none!important;visibility:hidden!important;pointer-events:none!important;}' +
      'body.legal-screen-open .screen.active,body.legal-from-login .screen.active{padding-bottom:0!important;}';
    (document.head || document.documentElement).appendChild(style);
  }

  function isLegalScreen(name) {
    if (!name) return false;
    return !!LEGAL_SCREENS[String(name).replace(/^screen-/, '')];
  }

  function hideNav() {
    document.body.classList.add('legal-screen-open');
  }

  function showNav() {
    document.body.classList.remove('legal-screen-open');
    document.body.classList.remove('legal-from-login');
    try {
      var nav = document.querySelector('.navbar');
      if (nav) {
        nav.style.removeProperty('display');
        nav.style.removeProperty('pointer-events');
        nav.removeAttribute('data-legal-hidden');
      }
    } catch (e) {}
  }

  function syncNavWithScreen() {
    /* Nunca esconder nav se ha sessao e login gate fechado */
    try {
      var gate = document.getElementById('loginGate');
      var gateOpen = gate && !gate.classList.contains('hidden') && gate.style.display !== 'none';
      if (!gateOpen) {
        var active = document.querySelector('.screen.active');
        var name = active && active.id ? active.id.replace(/^screen-/, '') : '';
        if (isLegalScreen(name) || document.body.classList.contains('legal-from-login')) {
          hideNav();
          return;
        }
        showNav();
        return;
      }
    } catch (e) {}
    hideNav();
  }

  function boot() {
    injectCss();
    if (typeof window.goTo === 'function' && !window.goTo.__legalNavV12) {
      var orig = window.goTo;
      window.goTo = function (name) {
        var r = orig.apply(this, arguments);
        try {
          setTimeout(syncNavWithScreen, 0);
        } catch (e) {}
        return r;
      };
      window.goTo.__legalNavV12 = true;
    }
    syncNavWithScreen();
    setTimeout(syncNavWithScreen, 400);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();

/* LOGIN FIX v10 — loaded early with legal-navbar-fix */
/**
 * Tchilo login session v10
 * Problema: login processa e volta a Entrar/Criar conta
 * Solucao: gravar sessao + esconder gate imediatamente
 */
(function () {
  'use strict';
  if (window.__tchiloLoginSessionFixV10) return;
  window.__tchiloLoginSessionFixV10 = true;
  window.__tchiloLoginSessionFixV9 = true;
  window.__tchiloLoginSessionFixV8 = true;

  var JUST_MS = 30000;

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

  function forceHideGate() {
    try {
      var g = document.getElementById('loginGate');
      if (g) {
        g.classList.add('hidden');
        g.style.setProperty('display', 'none', 'important');
        g.setAttribute('aria-hidden', 'true');
      }
      document.body.classList.remove('login-locked');
      document.body.style.overflow = '';
      document.body.style.position = '';
    } catch (e) {}
    try {
      if (typeof bootApp === 'function') bootApp();
    } catch (e2) {}
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
    try {
      if (typeof renderFeed === 'function') renderFeed();
      if (typeof renderStories === 'function') renderStories();
      if (typeof renderProfile === 'function') renderProfile();
    } catch (e2) {}
    return sess;
  }

  function installGuards() {
    if (typeof window.showLoginGate === 'function' && !window.showLoginGate.__v10) {
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
      window.showLoginGate.__v10 = true;
      window.showLoginGate.__raw = _sg;
    }

    if (typeof window.clearSession === 'function' && !window.clearSession.__v10) {
      var _cs = window.clearSession;
      window.clearSession = function () {
        if (window.__tchiloJustLoggedIn && !window.__tchiloLoggingOut) return;
        return _cs.apply(this, arguments);
      };
      window.clearSession.__v10 = true;
    }

    if (typeof window.hideLoginGate === 'function' && !window.hideLoginGate.__v10) {
      var _hg = window.hideLoginGate;
      window.hideLoginGate = function () {
        forceHideGate();
        try { return _hg.apply(this, arguments); } catch (e) {}
      };
      window.hideLoginGate.__v10 = true;
    }
  }

  function installLogin() {
    window.tchiloSupabaseLogin = async function (identifier, password) {
      identifier = String(identifier || '').trim().toLowerCase();
      password = String(password || '');
      if (!identifier || !password) throw new Error('Preenche os dois campos.');
      var SB = window.tchiloSupabase;
      if (!SB || !SB.auth) throw new Error('Servico de autenticacao indisponivel. Recarrega a pagina.');

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier)) {
        throw new Error('Para entrar, usa o email da conta (nao o nome de utilizador).');
      }

      var res = await SB.auth.signInWithPassword({ email: identifier, password: password });
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
        email: user.email || identifier,
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
    window.tchiloSupabaseLogin.__v10 = true;
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
          else {
            var g = document.getElementById('loginGate');
            if (g) {
              g.classList.remove('hidden');
              g.style.removeProperty('display');
            }
            document.body.classList.add('login-locked');
          }
        } catch (e2) {}
        window.__tchiloLoggingOut = false;
      } catch (err) {
        if (localSession()) forceHideGate();
      }
    };
    window.tchiloSyncAuthSession.__v10 = true;
  }

  function run() {
    installGuards();
    installLogin();
    installSync();
    if (localSession()) forceHideGate();
  }

  run();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  setTimeout(run, 50);
  setTimeout(run, 300);
  setTimeout(run, 1000);
  setTimeout(run, 2500);
})();

/*
 * Fix definitivo: Termos / Privacidade / Seguranca infantil / Diretrizes
 */
(function () {
  'use strict';

  var LEGAL_SCREENS = {
    terms: 1,
    privacy: 1,
    child: 1,
    community: 1,
    about: 1
  };

  function injectCss() {
    if (document.getElementById('tchilo-legal-navbar-fix')) return;
    var style = document.createElement('style');
    style.id = 'tchilo-legal-navbar-fix';
    style.textContent = [
      'body.legal-screen-open .navbar,',
      'body.legal-from-login .navbar,',
      'body.legal-screen-open .topbar,',
      'body.legal-from-login .topbar,',
      'body.legal-screen-open .stories,',
      'body.legal-from-login .stories {',
      '  display: none !important;',
      '  visibility: hidden !important;',
      '  pointer-events: none !important;',
      '  opacity: 0 !important;',
      '  transform: translateY(120%) !important;',
      '  height: 0 !important;',
      '  max-height: 0 !important;',
      '  overflow: hidden !important;',
      '}',
      'body.legal-screen-open .screen.active,',
      'body.legal-from-login .screen.active {',
      '  padding-bottom: 0 !important;',
      '}'
    ].join('\n');
    (document.head || document.documentElement).appendChild(style);
  }

  function isLegalScreen(name) {
    if (!name) return false;
    name = String(name).replace(/^screen-/, '');
    return !!LEGAL_SCREENS[name];
  }

  function getActiveScreenName() {
    var active = document.querySelector('.screen.active');
    if (!active || !active.id) return '';
    return active.id.replace(/^screen-/, '');
  }

  function hideNav() {
    document.body.classList.add('legal-screen-open');
    var nav = document.querySelector('.navbar');
    if (nav) {
      nav.style.setProperty('display', 'none', 'important');
      nav.setAttribute('data-legal-hidden', '1');
    }
    var topbar = document.querySelector('.topbar');
    if (topbar) topbar.style.setProperty('display', 'none', 'important');
    var stories = document.querySelector('.stories');
    if (stories) stories.style.setProperty('display', 'none', 'important');
  }

  function showNav() {
    document.body.classList.remove('legal-screen-open');
    document.body.classList.remove('legal-from-login');
    var nav = document.querySelector('.navbar');
    if (nav) {
      nav.style.removeProperty('display');
      nav.removeAttribute('data-legal-hidden');
    }
    var topbar = document.querySelector('.topbar');
    if (topbar) topbar.style.removeProperty('display');
    var stories = document.querySelector('.stories');
    if (stories) stories.style.removeProperty('display');
  }

  function syncNavWithScreen() {
    var name = getActiveScreenName();
    if (isLegalScreen(name) || document.body.classList.contains('legal-from-login')) {
      hideNav();
      return;
    }
    var gate = document.getElementById('loginGate');
    var gateOpen = gate && !gate.classList.contains('hidden');
    if (gateOpen) {
      hideNav();
      return;
    }
    showNav();
  }

  function patchGoTo() {
    if (typeof window.goTo !== 'function' || window.goTo.__legalNavPatched) return;
    var orig = window.goTo;
    window.goTo = function (name) {
      var result = orig.apply(this, arguments);
      try {
        if (isLegalScreen(name)) hideNav();
        else if (!document.body.classList.contains('legal-from-login')) {
          var gate = document.getElementById('loginGate');
          if (!gate || gate.classList.contains('hidden')) showNav();
        }
        setTimeout(syncNavWithScreen, 0);
        setTimeout(syncNavWithScreen, 50);
      } catch (e) {}
      return result;
    };
    window.goTo.__legalNavPatched = true;
  }

  function patchLegalFromLogin() {
    window.openLegalFromLogin = function (name) {
      try {
        window.legalReturnScreen = 'login';
      } catch (e) {}
      document.body.classList.add('legal-from-login');
      var gate = document.getElementById('loginGate');
      if (gate) gate.classList.add('hidden');
      document.body.style.overflow = '';
      hideNav();
      if (typeof window.goTo === 'function') window.goTo(name);
      setTimeout(hideNav, 0);
      setTimeout(hideNav, 50);
      setTimeout(hideNav, 200);
    };

    window.legalBack = function () {
      var ret = window.legalReturnScreen;
      if (ret === 'login') {
        document.querySelectorAll('.screen').forEach(function (s) {
          s.classList.remove('active');
        });
        var gate = document.getElementById('loginGate');
        if (gate) gate.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        document.body.classList.remove('legal-from-login');
        document.body.classList.remove('legal-screen-open');
        hideNav();
        try {
          if (typeof playLoginVideo === 'function') playLoginVideo();
        } catch (e) {}
        try {
          window.legalReturnScreen = 'settings';
        } catch (e2) {}
      } else {
        document.body.classList.remove('legal-from-login');
        if (typeof window.goTo === 'function') {
          window.goTo(ret || 'settings-legal');
        }
        setTimeout(syncNavWithScreen, 0);
      }
    };
  }

  function observeScreens() {
    try {
      var root = document.getElementById('appFrame') || document.body;
      var obs = new MutationObserver(function () {
        syncNavWithScreen();
      });
      obs.observe(root, {
        attributes: true,
        subtree: true,
        attributeFilter: ['class']
      });
    } catch (e) {}
  }

  function patch() {
    injectCss();
    patchGoTo();
    patchLegalFromLogin();
    syncNavWithScreen();
  }

  function boot() {
    patch();
    observeScreens();
    setTimeout(patch, 400);
    setTimeout(patch, 1200);
    setTimeout(syncNavWithScreen, 100);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();

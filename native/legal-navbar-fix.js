/* LOGIN + STABILITY v15 — sem storm de bootApp apos login */
(function () {
  'use strict';
  if (window.__tchiloLoginSessionFixV15) return;
  window.__tchiloLoginSessionFixV15 = true;
  window.__tchiloLoginSessionFixV14 = true;

  var JUST_MS = 90000;
  var hideOnce = false;

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

  function injectCss() {
    if (document.getElementById('tchilo-stable-v15')) return;
    var st = document.createElement('style');
    st.id = 'tchilo-stable-v15';
    st.textContent =
      '#storyViewer:not(.open),.story-viewer:not(.open){' +
      'display:none!important;pointer-events:none!important;z-index:-1!important;}' +
      '.login-gate.hidden,#loginGate.hidden,body.tchilo-session-on #loginGate{' +
      'display:none!important;pointer-events:none!important;z-index:-1!important;}' +
      'body.tchilo-session-on .navbar,body.tchilo-session-on .navbar *,' +
      'body.tchilo-session-on .topbar,body.tchilo-session-on .topbar *,' +
      'body.tchilo-session-on .nav-item,body.tchilo-session-on .nav-post,' +
      'body.tchilo-session-on .icon-btn{pointer-events:auto!important;cursor:pointer!important;}' +
      'body.tchilo-session-on .navbar{display:flex!important;opacity:1!important;visibility:visible!important;}';
    (document.head || document.documentElement).appendChild(st);
  }

  function restoreChrome() {
    injectCss();
    if (!localSession()) return;
    try {
      var b = document.body;
      b.classList.remove('login-locked', 'legal-screen-open', 'legal-from-login', 'tchilo-logged-out', 'tchilo-no-bottom-nav');
      b.classList.add('tchilo-session-on');
      b.style.overflow = '';
      b.style.position = '';
      b.style.pointerEvents = '';
    } catch (e) {}
    try {
      var g = document.getElementById('loginGate');
      if (g) {
        g.classList.add('hidden');
        g.style.setProperty('display', 'none', 'important');
        g.style.setProperty('pointer-events', 'none', 'important');
      }
    } catch (e2) {}
    try {
      var sv = document.getElementById('storyViewer');
      if (sv && !sv.classList.contains('open')) {
        sv.style.setProperty('display', 'none', 'important');
        sv.style.setProperty('pointer-events', 'none', 'important');
      }
    } catch (e3) {}
    try {
      var nav = document.querySelector('.navbar');
      if (nav) {
        nav.style.setProperty('display', 'flex', 'important');
        nav.style.setProperty('pointer-events', 'auto', 'important');
      }
    } catch (e4) {}
  }

  function forceHideGate() {
    restoreChrome();
    if (hideOnce) return;
    hideOnce = true;
    try {
      if (typeof bootApp === 'function') bootApp();
    } catch (e) {}
    try {
      if (typeof goTo === 'function') {
        var orig = window.goTo._orig || window.goTo;
        /* chamar original se existir para evitar loops de router */
        if (window.goTo._orig) window.goTo._orig.call(window, 'feed');
        else goTo('feed');
      }
    } catch (e2) {}
    try {
      if (typeof renderFeed === 'function') renderFeed();
    } catch (e3) {}
    /* Uma unica limpeza extra — sem storm */
    setTimeout(restoreChrome, 300);
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
    var profile = null;
    try {
      if (typeof window.tchiloEnsureProfile === 'function') {
        profile = await window.tchiloEnsureProfile(user);
      }
    } catch (e) {}
    if (!profile && window.tchiloSupabase) {
      try {
        var pr = await window.tchiloSupabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
        profile = pr && pr.data;
      } catch (e2) {}
    }
    return profile || fallbackProfile(user);
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
    if (typeof window.showLoginGate === 'function' && !window.showLoginGate.__v15) {
      var _sg = window.showLoginGate;
      window.showLoginGate = function () {
        if (window.__tchiloJustLoggedIn && !window.__tchiloLoggingOut) {
          restoreChrome();
          return;
        }
        if (localSession() && !window.__tchiloLoggingOut) {
          restoreChrome();
          return;
        }
        return _sg.apply(this, arguments);
      };
      window.showLoginGate.__v15 = true;
      window.showLoginGate.__raw = _sg;
    }
    if (typeof window.hideLoginGate === 'function' && !window.hideLoginGate.__v15) {
      window.hideLoginGate = function () { forceHideGate(); };
      window.hideLoginGate.__v15 = true;
    }
    if (typeof window.clearSession === 'function' && !window.clearSession.__v15) {
      var _cs = window.clearSession;
      window.clearSession = function () {
        if (window.__tchiloJustLoggedIn && !window.__tchiloLoggingOut) return;
        hideOnce = false;
        return _cs.apply(this, arguments);
      };
      window.clearSession.__v15 = true;
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
        if (!email) throw new Error('Para entrar, usa o email da conta.');
      }

      var res = await SB.auth.signInWithPassword({ email: email, password: password });
      if (res.error) {
        var msg = res.error.message || 'Nao foi possivel iniciar sessao.';
        if (/invalid login|invalid credentials|invalid_credentials/i.test(msg))
          msg = 'Email ou palavra-passe incorretos.';
        throw new Error(msg);
      }
      var user = res.data && res.data.user;
      if (!user) throw new Error('Nao foi possivel iniciar sessao.');

      markJust();
      hideOnce = false;
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
        console.error('[login-v15]', err);
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
      } catch (e) {}
      var SB = window.tchiloSupabase;
      if (!SB || !SB.auth) {
        if (localSession()) restoreChrome();
        return;
      }
      try {
        var out = await SB.auth.getSession();
        var session = out && out.data && out.data.session;
        if (session && session.user) {
          if (localSession()) {
            restoreChrome();
            return;
          }
          var profile = await safeProfile(session.user);
          applyUser(session.user, profile);
          return;
        }
        if (window.__tchiloJustLoggedIn || localSession()) {
          restoreChrome();
          return;
        }
      } catch (err) {
        if (localSession()) restoreChrome();
      }
    };
  }

  /* Clique nos icones — sem preventDefault agressivo se onclick existe */
  function onNav(e) {
    try {
      var t = e.target;
      if (!t || !t.closest) return;
      var btn = t.closest('.nav-item, .nav-post');
      if (!btn) return;
      restoreChrome();
      var screen = btn.getAttribute('data-screen');
      var oc = btn.getAttribute('onclick') || '';
      if (!screen && !oc) return;
      /* Se ja tem onclick, so garante chrome; deixa o handler nativo */
      if (oc) return;
      if (screen && typeof window.goTo === 'function') {
        e.preventDefault();
        if (screen === 'feed' && typeof window.onNavFeed === 'function') window.onNavFeed();
        else if (screen === 'profile') {
          window.viewingProfileUser = null;
          window.goTo('profile');
        } else window.goTo(screen);
      }
    } catch (err) {}
  }

  function run() {
    injectCss();
    installGuards();
    installLogin();
    installSync();
    document.addEventListener('click', onNav, true);
    if (localSession()) {
      restoreChrome();
      if (!hideOnce) forceHideGate();
    }
  }

  run();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  setTimeout(run, 100);
  setTimeout(run, 800);
})();

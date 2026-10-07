/**
 * Tchilo login session v9
 * Problema: login processa e volta a Entrar/Criar conta
 * Solucao: gravar sessao + esconder gate imediatamente; nunca expulsar nos 20s apos login
 */
(function () {
  'use strict';
  if (window.__tchiloLoginSessionFixV9) return;
  window.__tchiloLoginSessionFixV9 = true;
  window.__tchiloLoginSessionFixV8 = true;

  var JUST_MS = 20000;

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
      var safe = Object.assign({}, obj);
      delete safe.password;
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
    var uname = meta.username || meta.user_name || ('user_' + String(user.id || '').slice(0, 8));
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
    } catch (e) {
      console.warn('[login-v9] ensureProfile', e && e.message);
    }
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
    if (typeof window.showLoginGate === 'function' && !window.showLoginGate.__v9) {
      var _sg = window.showLoginGate;
      window.showLoginGate = function () {
        if (window.__tchiloJustLoggedIn && !window.__tchiloLoggingOut) {
          console.warn('[login-v9] bloqueado showLoginGate (login recente)');
          forceHideGate();
          return;
        }
        if (localSession() && !window.__tchiloLoggingOut) {
          console.warn('[login-v9] bloqueado showLoginGate (ha sessao local)');
          forceHideGate();
          return;
        }
        return _sg.apply(this, arguments);
      };
      window.showLoginGate.__v9 = true;
      window.showLoginGate.__raw = _sg;
    }

    if (typeof window.showLoginHome === 'function' && !window.showLoginHome.__v9) {
      var _sh = window.showLoginHome;
      window.showLoginHome = function () {
        if (window.__tchiloJustLoggedIn && !window.__tchiloLoggingOut) return;
        if (localSession() && !window.__tchiloLoggingOut) return;
        return _sh.apply(this, arguments);
      };
      window.showLoginHome.__v9 = true;
    }

    if (typeof window.clearSession === 'function' && !window.clearSession.__v9) {
      var _cs = window.clearSession;
      window.clearSession = function () {
        if (window.__tchiloJustLoggedIn && !window.__tchiloLoggingOut) {
          console.warn('[login-v9] bloqueado clearSession');
          return;
        }
        return _cs.apply(this, arguments);
      };
      window.clearSession.__v9 = true;
    }

    if (typeof window.hideLoginGate === 'function' && !window.hideLoginGate.__v9) {
      var _hg = window.hideLoginGate;
      window.hideLoginGate = function () {
        forceHideGate();
        try { return _hg.apply(this, arguments); } catch (e) {}
      };
      window.hideLoginGate.__v9 = true;
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
        throw new Error('Para entrar, usa o email da conta (nao o nome de utilizador).');
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
    window.tchiloSupabaseLogin.__v9 = true;
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
        if (window.__tchiloJustLoggedIn) {
          if (localSession()) forceHideGate();
          return;
        }
        var local = localSession();
        if (local && local.id) {
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
        console.error('[login-v9] sync', err);
        if (localSession()) forceHideGate();
      }
    };
    window.tchiloSyncAuthSession.__v9 = true;
  }

  function installAuthListener() {
    var SB = window.tchiloSupabase;
    if (!SB || !SB.auth || window.__tchiloAuthListenerV9) return;
    try {
      SB.auth.onAuthStateChange(function (event) {
        if (event === 'SIGNED_IN') {
          markJust();
          setTimeout(function () {
            try {
              if (typeof window.tchiloSyncAuthSession === 'function') window.tchiloSyncAuthSession();
            } catch (e) {}
          }, 50);
        }
        if (event === 'SIGNED_OUT') {
          if (window.__tchiloJustLoggedIn) {
            console.warn('[login-v9] ignorar SIGNED_OUT logo apos login');
            return;
          }
        }
      });
      window.__tchiloAuthListenerV9 = true;
    } catch (e) {}
  }

  function run() {
    installGuards();
    installLogin();
    installSync();
    installAuthListener();
    if (localSession()) forceHideGate();
  }

  run();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  setTimeout(run, 50);
  setTimeout(run, 200);
  setTimeout(run, 800);
  setTimeout(function () {
    run();
    installAuthListener();
  }, 1500);
})();

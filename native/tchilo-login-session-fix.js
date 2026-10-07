/**
 * Tchilo login session v8 — override completo em runtime
 * Corrige: login processa e volta a Entrar/Criar conta
 * Não depende do patch do index.html
 */
(function () {
  'use strict';
  if (window.__tchiloLoginSessionFixV8) return;
  window.__tchiloLoginSessionFixV8 = true;

  function markJust() {
    window.__tchiloJustLoggedIn = true;
    try { clearTimeout(window.__tchiloJustLoggedInTimer); } catch (e) {}
    window.__tchiloJustLoggedInTimer = setTimeout(function () {
      window.__tchiloJustLoggedIn = false;
    }, 15000);
  }

  function localSession() {
    try {
      var s = JSON.parse(localStorage.getItem('tchilo_session') || 'null');
      return s && s.id ? s : null;
    } catch (e) {
      return null;
    }
  }

  function writeSession(obj) {
    try {
      if (typeof setSession === 'function') setSession(obj);
      else localStorage.setItem('tchilo_session', JSON.stringify(obj));
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
      }
      document.body.classList.remove('login-locked');
      document.body.style.overflow = '';
    } catch (e) {}
    try {
      if (typeof bootApp === 'function') bootApp();
    } catch (e2) {}
  }

  function forceShowGate() {
    try {
      var g = document.getElementById('loginGate');
      if (g) {
        g.classList.remove('hidden');
        g.style.removeProperty('display');
      }
      document.body.classList.add('login-locked');
      document.body.style.overflow = 'hidden';
      if (typeof showLoginHome === 'function' && !showLoginHome.__v8) {
        var _h = showLoginHome;
        // call original home if not guarded
      }
      if (typeof showLoginHome === 'function') {
        try { showLoginHome.__raw ? showLoginHome.__raw() : null; } catch (e) {}
      }
    } catch (e) {}
  }

  async function safeProfile(user) {
    if (!user) return null;
    var SB = window.tchiloSupabase;
    var profile = null;
    try {
      if (typeof window.tchiloEnsureProfile === 'function') {
        profile = await window.tchiloEnsureProfile(user);
      }
    } catch (e) {
      console.warn('[v8] ensureProfile', e && e.message);
    }
    if (!profile && SB) {
      try {
        var pr = await SB.from('profiles').select('*').eq('id', user.id).maybeSingle();
        profile = pr && pr.data;
      } catch (e2) {}
    }
    if (!profile) {
      var meta = user.user_metadata || {};
      profile = {
        id: user.id,
        username: meta.username || ('user_' + String(user.id).slice(0, 8)),
        display_name: meta.display_name || '',
        avatar_url: null,
        is_private: false,
        anonymous_mode: false
      };
    }
    return profile;
  }

  function applyUser(user, profile) {
    var sess = {
      id: profile.id || user.id,
      username: profile.username,
      email: user.email || '',
      displayName: profile.display_name || profile.username,
      avatar: profile.avatar_url || null,
      privateAccount: !!profile.is_private,
      anonymousMode: !!profile.anonymous_mode
    };
    writeSession(sess);
    markJust();
    forceHideGate();
    try {
      if (typeof showToast === 'function') showToast('Olá, ' + sess.username + '!');
    } catch (e) {}
    return sess;
  }

  /* ---- Guards: nunca voltar ao login se acabámos de entrar ou há sessão ---- */
  function installGuards() {
    if (typeof window.showLoginGate === 'function' && !window.showLoginGate.__v8) {
      var _sg = window.showLoginGate;
      window.showLoginGate = function () {
        if (window.__tchiloLoggingOut) return _sg.apply(this, arguments);
        if (window.__tchiloJustLoggedIn) {
          console.warn('[v8] block showLoginGate (just logged in)');
          return;
        }
        if (localSession()) {
          console.warn('[v8] block showLoginGate (has session)');
          forceHideGate();
          return;
        }
        return _sg.apply(this, arguments);
      };
      window.showLoginGate.__v8 = true;
      window.showLoginGate.__raw = _sg;
    }

    if (typeof window.showLoginHome === 'function' && !window.showLoginHome.__v8) {
      var _sh = window.showLoginHome;
      window.showLoginHome = function () {
        if (window.__tchiloJustLoggedIn && !window.__tchiloLoggingOut) {
          console.warn('[v8] block showLoginHome');
          return;
        }
        return _sh.apply(this, arguments);
      };
      window.showLoginHome.__v8 = true;
      window.showLoginHome.__raw = _sh;
    }

    if (typeof window.clearSession === 'function' && !window.clearSession.__v8) {
      var _cs = window.clearSession;
      window.clearSession = function () {
        if (window.__tchiloJustLoggedIn && !window.__tchiloLoggingOut) {
          console.warn('[v8] block clearSession');
          return;
        }
        return _cs.apply(this, arguments);
      };
      window.clearSession.__v8 = true;
    }
  }

  /* ---- Override login completo ---- */
  function installLogin() {
    window.tchiloSupabaseLogin = async function (identifier, password) {
      identifier = String(identifier || '').trim().toLowerCase();
      password = String(password || '');
      if (!identifier || !password) throw new Error('Preenche os dois campos.');
      var SB = window.tchiloSupabase;
      if (!SB || !SB.auth) throw new Error('Serviço de autenticação indisponível.');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier)) {
        throw new Error('Para entrar, usa o email da conta (não o nome de utilizador).');
      }

      var res = await SB.auth.signInWithPassword({ email: identifier, password: password });
      if (res.error) {
        var msg = res.error.message || 'Não foi possível iniciar sessão.';
        if (/invalid login|invalid credentials/i.test(msg)) msg = 'Email ou palavra-passe incorretos.';
        if (/email not confirmed/i.test(msg)) msg = 'Confirma o teu email antes de entrar.';
        throw new Error(msg);
      }
      var user = res.data && res.data.user;
      if (!user) throw new Error('Não foi possível iniciar sessão.');

      markJust();
      var profile = await safeProfile(user);
      applyUser(user, profile);
      return res.data;
    };
    window.tchiloSupabaseLogin.__v8 = true;
  }

  /* ---- Override sync: nunca expulsar se há sessão local/supabase ---- */
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
        if (window.__tchiloJustLoggedIn) return;
        var local = localSession();
        if (local && local.id) {
          forceHideGate();
          return;
        }
        /* Sem sessão de todo */
        window.__tchiloLoggingOut = true;
        try { localStorage.removeItem('tchilo_session'); } catch (e) {}
        window.__tchiloLoggingOut = false;
        if (typeof window.showLoginGate.__raw === 'function') {
          window.showLoginGate.__raw();
        } else {
          try {
            var g = document.getElementById('loginGate');
            if (g) {
              g.classList.remove('hidden');
              g.style.removeProperty('display');
            }
            document.body.classList.add('login-locked');
          } catch (e2) {}
        }
      } catch (err) {
        console.error('[v8] sync error', err);
        if (localSession()) forceHideGate();
      }
    };
    window.tchiloSyncAuthSession.__v8 = true;
  }

  function run() {
    installGuards();
    installLogin();
    installSync();
  }

  run();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  }
  setTimeout(run, 50);
  setTimeout(run, 300);
  setTimeout(run, 1000);
  setTimeout(run, 2500);

  try {
    var mo = new MutationObserver(function () {
      installGuards();
    });
    mo.observe(document.documentElement, { childList: true, subtree: true });
  } catch (e) {}
})();

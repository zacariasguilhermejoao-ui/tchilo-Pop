/**
 * Tchilo — sessão de login persistente (v6)
 * Evita: processar login → voltar ao ecrã Entrar/Criar conta.
 * Causa típica: tchiloSyncAuthSession() sem sessão Supabase ou perfil em falta
 * chama clearSession()+showLoginGate() logo após um login bem-sucedido.
 */
(function () {
  'use strict';
  if (window.__tchiloLoginSessionFixV6) return;
  window.__tchiloLoginSessionFixV6 = true;

  var JUST_MS = 8000;

  function markJustLoggedIn() {
    window.__tchiloJustLoggedIn = true;
    try {
      clearTimeout(window.__tchiloJustLoggedInTimer);
    } catch (e) {}
    window.__tchiloJustLoggedInTimer = setTimeout(function () {
      window.__tchiloJustLoggedIn = false;
    }, JUST_MS);
  }

  function readLocalSession() {
    try {
      var raw = localStorage.getItem('tchilo_session');
      if (!raw) return null;
      var s = JSON.parse(raw);
      return s && s.id ? s : null;
    } catch (e) {
      return null;
    }
  }

  function writeLocalSession(user) {
    try {
      if (typeof setSession === 'function') {
        setSession(user);
      } else {
        localStorage.setItem('tchilo_session', JSON.stringify(user));
      }
    } catch (e) {}
  }

  function forceHideGate() {
    try {
      var gate = document.getElementById('loginGate');
      if (gate) {
        gate.classList.add('hidden');
        gate.style.setProperty('display', 'none', 'important');
      }
      document.body.style.overflow = '';
      document.body.classList.remove('login-locked');
    } catch (e) {}
    try {
      if (typeof bootApp === 'function') bootApp();
    } catch (e2) {}
  }

  /* Nunca voltar ao login logo após sucesso ou com sessão local válida */
  function patchShowLoginGate() {
    if (typeof window.showLoginGate !== 'function') return;
    if (window.showLoginGate.__v6) return;
    var orig = window.showLoginGate;
    window.showLoginGate = function () {
      if (window.__tchiloLoggingOut) {
        return orig.apply(this, arguments);
      }
      if (window.__tchiloJustLoggedIn) {
        console.warn('[login] blocked showLoginGate (just logged in)');
        return;
      }
      var local = readLocalSession();
      if (local && local.id) {
        console.warn('[login] blocked showLoginGate (local session exists)');
        forceHideGate();
        return;
      }
      return orig.apply(this, arguments);
    };
    window.showLoginGate.__v6 = true;
  }

  function patchShowLoginHome() {
    if (typeof window.showLoginHome !== 'function') return;
    if (window.showLoginHome.__v6) return;
    var orig = window.showLoginHome;
    window.showLoginHome = function () {
      if (window.__tchiloJustLoggedIn && !window.__tchiloLoggingOut) {
        console.warn('[login] blocked showLoginHome (just logged in)');
        return;
      }
      return orig.apply(this, arguments);
    };
    window.showLoginHome.__v6 = true;
  }

  function patchClearSession() {
    if (typeof window.clearSession !== 'function') return;
    if (window.clearSession.__v6) return;
    var orig = window.clearSession;
    window.clearSession = function () {
      if (window.__tchiloJustLoggedIn && !window.__tchiloLoggingOut) {
        console.warn('[login] blocked clearSession (just logged in)');
        return;
      }
      return orig.apply(this, arguments);
    };
    window.clearSession.__v6 = true;
  }

  async function safeEnsureProfile(user) {
    if (!user) return null;
    var SB = window.tchiloSupabase;
    if (!SB) return null;
    try {
      if (typeof window.tchiloEnsureProfile === 'function') {
        var p = await window.tchiloEnsureProfile(user);
        if (p) return p;
      }
    } catch (e) {
      console.warn('[login] ensureProfile', e && e.message ? e.message : e);
    }
    try {
      var pr = await SB.from('profiles').select('*').eq('id', user.id).maybeSingle();
      if (pr && pr.data) return pr.data;
    } catch (e2) {}
    var meta = user.user_metadata || {};
    return {
      id: user.id,
      username: meta.username || ('user_' + String(user.id).slice(0, 8)),
      display_name: meta.display_name || meta.username || '',
      avatar_url: null,
      is_private: false,
      anonymous_mode: false
    };
  }

  function applySessionFromUser(user, profile) {
    profile = profile || {};
    var sess = {
      id: profile.id || user.id,
      username: profile.username || (user.user_metadata && user.user_metadata.username) || ('user_' + String(user.id).slice(0, 8)),
      email: user.email || '',
      displayName: profile.display_name || profile.username || '',
      avatar: profile.avatar_url || null,
      privateAccount: !!profile.is_private,
      anonymousMode: !!profile.anonymous_mode
    };
    writeLocalSession(sess);
    markJustLoggedIn();
    forceHideGate();
    try {
      if (typeof showToast === 'function') showToast('Olá, ' + sess.username + '!');
    } catch (e) {}
    return sess;
  }

  /* Login robusto — nunca falha só porque o perfil RLS atrasa */
  function patchSupabaseLogin() {
    if (typeof window.tchiloSupabaseLogin !== 'function') return;
    if (window.tchiloSupabaseLogin.__v6) return;
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
        if (/invalid login/i.test(msg) || /invalid credentials/i.test(msg)) {
          msg = 'Email ou palavra-passe incorretos.';
        } else if (/email not confirmed/i.test(msg)) {
          msg = 'Confirma o email antes de entrar (vê a caixa de entrada).';
        }
        throw new Error(msg);
      }
      var user = res.data && res.data.user;
      if (!user) throw new Error('Não foi possível iniciar sessão.');

      var profile = await safeEnsureProfile(user);
      applySessionFromUser(user, profile);
      return res.data;
    };
    window.tchiloSupabaseLogin.__v6 = true;
  }

  /* Sync: se houver user Supabase, aplica sessão; se falhar perfil, não faz logout */
  function patchSyncAuth() {
    if (typeof window.tchiloSyncAuthSession !== 'function') return;
    if (window.tchiloSyncAuthSession.__v6) return;
    window.tchiloSyncAuthSession = async function () {
      if (window.__tchiloPasswordRecoveryActive) return;
      try {
        if (typeof tchiloIsPasswordRecoveryUrl === 'function' && tchiloIsPasswordRecoveryUrl()) return;
      } catch (e) {}

      var SB = window.tchiloSupabase;
      if (!SB || !SB.auth) return;

      try {
        var out = await SB.auth.getSession();
        var session = out && out.data && out.data.session;
        if (session && session.user) {
          var profile = await safeEnsureProfile(session.user);
          applySessionFromUser(session.user, profile);
          return;
        }
        /* Sem sessão Supabase */
        if (window.__tchiloJustLoggedIn) {
          console.warn('[login] sync: sem sessão supabase mas just logged in — manter');
          return;
        }
        var local = readLocalSession();
        if (local && local.id) {
          /* Manter sessão local; tentar refresh em silêncio mais tarde */
          forceHideGate();
          return;
        }
        /* Realmente sem sessão */
        try {
          if (typeof clearSession === 'function' && clearSession.__v6) {
            /* chamar original */
            window.__tchiloLoggingOut = true;
            localStorage.removeItem('tchilo_session');
            window.__tchiloLoggingOut = false;
          } else if (typeof clearSession === 'function') {
            clearSession();
          }
        } catch (e3) {}
        if (typeof showLoginGate === 'function' && !showLoginGate.__v6) {
          showLoginGate();
        } else {
          try {
            var gate = document.getElementById('loginGate');
            if (gate) {
              gate.classList.remove('hidden');
              gate.style.removeProperty('display');
            }
            document.body.classList.add('login-locked');
            if (typeof showLoginHome === 'function' && !showLoginHome.__v6) showLoginHome();
          } catch (e4) {}
        }
      } catch (err) {
        console.error('[login] sync error', err);
        /* Não expulsar o utilizador por erro de rede */
        var local2 = readLocalSession();
        if (local2 && local2.id) forceHideGate();
      }
    };
    window.tchiloSyncAuthSession.__v6 = true;
  }

  function patchAuthStateChange() {
    var SB = window.tchiloSupabase;
    if (!SB || !SB.auth || SB.auth.__v6AuthPatch) return;
    try {
      SB.auth.onAuthStateChange(function (event, session) {
        if (event === 'SIGNED_OUT') {
          if (window.__tchiloJustLoggedIn && !window.__tchiloLoggingOut) {
            console.warn('[login] ignored SIGNED_OUT right after login');
            return;
          }
          return; /* o handler original já trata */
        }
        if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED') && session && session.user) {
          markJustLoggedIn();
          safeEnsureProfile(session.user).then(function (profile) {
            applySessionFromUser(session.user, profile);
          });
        }
      });
      SB.auth.__v6AuthPatch = true;
    } catch (e) {}
  }

  function run() {
    patchShowLoginGate();
    patchShowLoginHome();
    patchClearSession();
    patchSupabaseLogin();
    patchSyncAuth();
    patchAuthStateChange();
  }

  run();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  }
  setTimeout(run, 100);
  setTimeout(run, 500);
  setTimeout(run, 1500);
  setTimeout(run, 3000);
})();

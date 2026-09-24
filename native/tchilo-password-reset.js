/**
 * Tchilo — link de redefinir senha (email) abre SEMPRE a página de nova palavra-passe.
 * Nunca entra direto na conta / feed.
 */
(function () {
  'use strict';
  if (window.__tchiloPasswordResetPage) return;
  window.__tchiloPasswordResetPage = true;

  function isRecoveryUrl() {
    try {
      if (typeof tchiloIsPasswordRecoveryUrl === 'function' && tchiloIsPasswordRecoveryUrl()) return true;
    } catch (e) {}
    try {
      var hash = window.location.hash || '';
      var search = window.location.search || '';
      var full = hash + '&' + search;
      if (/(?:^|[&#?])type=recovery(?:&|$)/i.test(full)) return true;
      if (/type=recovery/i.test(full)) return true;
      /* path dedicado */
      var path = (window.location.pathname || '').toLowerCase();
      if (path.indexOf('reset-password') >= 0 || path.indexOf('redefinir') >= 0) return true;
      if (sessionStorage.getItem('tchilo_password_recovery') === '1') return true;
    } catch (e) {}
    return false;
  }

  function markRecovery() {
    try {
      window.__tchiloPasswordRecoveryActive = true;
      sessionStorage.setItem('tchilo_password_recovery', '1');
    } catch (e) {}
  }

  function clearRecoveryMark() {
    try {
      window.__tchiloPasswordRecoveryActive = false;
      sessionStorage.removeItem('tchilo_password_recovery');
    } catch (e) {}
  }

  function showResetPage() {
    markRecovery();
    try {
      /* Bloqueia ecrãs da app */
      document.querySelectorAll('.screen').forEach(function (s) {
        s.classList.remove('active');
      });
      var gate = document.getElementById('loginGate');
      if (gate) {
        gate.classList.remove('hidden');
        gate.style.setProperty('display', 'flex', 'important');
        gate.style.setProperty('visibility', 'visible', 'important');
        gate.style.setProperty('opacity', '1', 'important');
        gate.style.setProperty('z-index', '10000', 'important');
      }
      document.body.style.overflow = 'hidden';
      document.body.classList.add('tchilo-recovery-mode');

      if (typeof showLoginPanel === 'function') {
        showLoginPanel('recover-new');
      } else {
        /* fallback manual */
        ['accessPanel', 'signupPanel', 'recoverPanel'].forEach(function (id) {
          var el = document.getElementById(id);
          if (el) {
            el.classList.remove('active');
            el.style.setProperty('display', 'none', 'important');
          }
        });
        var rnp = document.getElementById('recoverNewPassPanel');
        if (rnp) {
          rnp.classList.add('active');
          rnp.style.setProperty('display', 'block', 'important');
          rnp.style.setProperty('visibility', 'visible', 'important');
          rnp.removeAttribute('hidden');
        }
      }

      try {
        if (typeof showToast === 'function') showToast('Escolhe a tua nova palavra-passe');
      } catch (e) {}
    } catch (e) {
      console.warn('Tchilo reset page', e);
    }
  }

  function injectCSS() {
    if (document.getElementById('tchiloResetCSS')) return;
    var st = document.createElement('style');
    st.id = 'tchiloResetCSS';
    st.textContent =
      'body.tchilo-recovery-mode #appFrame > .navbar,' +
      'body.tchilo-recovery-mode .navbar{' +
      'display:none!important;}' +
      'body.tchilo-recovery-mode #loginGate{' +
      'display:flex!important;visibility:visible!important;opacity:1!important;z-index:10000!important;}' +
      'body.tchilo-recovery-mode #recoverNewPassPanel{' +
      'display:block!important;visibility:visible!important;opacity:1!important;}' +
      'body.tchilo-recovery-mode #accessPanel,' +
      'body.tchilo-recovery-mode #signupPanel,' +
      'body.tchilo-recovery-mode #recoverPanel{' +
      'display:none!important;}';
    (document.head || document.documentElement).appendChild(st);
  }

  function patchSyncAuth() {
    if (typeof window.tchiloSyncAuthSession !== 'function') return;
    if (window.tchiloSyncAuthSession.__resetPatch) return;
    var orig = window.tchiloSyncAuthSession;
    window.tchiloSyncAuthSession = async function () {
      if (isRecoveryUrl() || window.__tchiloPasswordRecoveryActive) {
        showResetPage();
        return;
      }
      return orig.apply(this, arguments);
    };
    window.tchiloSyncAuthSession.__resetPatch = true;
  }

  function patchSubmitNewPassword() {
    if (typeof window.submitNewPassword !== 'function') return;
    if (window.submitNewPassword.__resetPatch) return;
    var orig = window.submitNewPassword;
    window.submitNewPassword = async function (e) {
      var r = await orig.apply(this, arguments);
      clearRecoveryMark();
      try {
        document.body.classList.remove('tchilo-recovery-mode');
      } catch (err) {}
      /* limpa tokens da URL */
      try {
        if (window.history && window.history.replaceState) {
          window.history.replaceState(null, '', window.location.pathname || '/');
        }
      } catch (err) {}
      return r;
    };
    window.submitNewPassword.__resetPatch = true;
  }

  async function ensureRecoverySession() {
    /* Garante que o Supabase processa o token do link */
    try {
      var SB = window.tchiloSupabase;
      if (!SB) return;
      var hash = window.location.hash || '';
      if (hash.indexOf('access_token') >= 0) {
        /* client já deve detetar na init; só reforçamos */
        await SB.auth.getSession();
      }
    } catch (e) {}
  }

  function boot() {
    injectCSS();

    if (isRecoveryUrl()) {
      markRecovery();
      showResetPage();
      ensureRecoverySession().then(function () {
        showResetPage();
      });
    }

    patchSyncAuth();
    patchSubmitNewPassword();

    setTimeout(function () {
      patchSyncAuth();
      patchSubmitNewPassword();
      if (isRecoveryUrl() || window.__tchiloPasswordRecoveryActive) showResetPage();
    }, 300);

    setTimeout(function () {
      if (isRecoveryUrl() || window.__tchiloPasswordRecoveryActive) showResetPage();
    }, 1200);

    /* Se o Supabase disparar SIGNED_IN com type recovery já tratado no index;
       aqui só reforçamos o UI. */
    try {
      if (window.tchiloSupabase && window.tchiloSupabase.auth) {
        window.tchiloSupabase.auth.onAuthStateChange(function (event) {
          if (event === 'PASSWORD_RECOVERY' || isRecoveryUrl()) {
            showResetPage();
          }
        });
      }
    } catch (e) {}
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();

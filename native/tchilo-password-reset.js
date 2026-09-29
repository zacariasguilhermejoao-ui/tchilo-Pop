/**
 * Tchilo — recuperação de senha
 * 1) Link do email abre SEMPRE o ecrã de nova palavra-passe (nunca o feed)
 * 2) Caminho /redefinir-senha
 * 3) No app nativo, o mesmo link pode abrir o APK via App Links (domínio tchilopop.com)
 */
(function () {
  'use strict';
  if (window.__tchiloPasswordResetV4) return;
  window.__tchiloPasswordResetV4 = true;

  var RESET_PATHS = ['/redefinir-senha', '/reset-password', '/recuperar-senha'];

  function isRecoveryUrl() {
    try {
      var hash = window.location.hash || '';
      var search = window.location.search || '';
      var path = (window.location.pathname || '').toLowerCase();
      var full = hash + '&' + search;
      if (/(?:^|[&#?])type=recovery(?:&|$)/i.test(full)) return true;
      if (/type=recovery/i.test(full)) return true;
      for (var i = 0; i < RESET_PATHS.length; i++) {
        if (path.indexOf(RESET_PATHS[i]) === 0) return true;
      }
      if (sessionStorage.getItem('tchilo_password_recovery') === '1') return true;
      if (window.__tchiloPasswordRecoveryActive) return true;
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
        gate.style.setProperty('pointer-events', 'auto', 'important');
      }
      document.body.style.overflow = 'hidden';
      document.body.classList.add('tchilo-recovery-mode');

      if (typeof showLoginPanel === 'function') {
        showLoginPanel('recover-new');
      } else {
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
        }
      }

      /* Impede auto-login / ir ao feed enquanto recupera */
      try {
        if (typeof goTo === 'function' && !goTo.__recoveryBlock) {
          var origGo = goTo._orig || goTo;
          window.goTo = function (name) {
            if (
              window.__tchiloPasswordRecoveryActive &&
              name !== 'access' &&
              name !== 'login'
            ) {
              showResetPage();
              return;
            }
            return origGo.apply(this, arguments);
          };
          window.goTo.__recoveryBlock = true;
          window.goTo._orig = origGo;
        }
      } catch (e2) {}
    } catch (e) {
      console.warn('[Tchilo] showResetPage', e);
    }
  }

  function injectCSS() {
    if (document.getElementById('tchiloRecoveryCSS')) return;
    var st = document.createElement('style');
    st.id = 'tchiloRecoveryCSS';
    st.textContent =
      'body.tchilo-recovery-mode .screen{display:none!important;}' +
      'body.tchilo-recovery-mode #loginGate{display:flex!important;visibility:visible!important;opacity:1!important;z-index:10000!important;}' +
      'body.tchilo-recovery-mode #recoverNewPassPanel{display:block!important;}' +
      'body.tchilo-recovery-mode #accessPanel,' +
      'body.tchilo-recovery-mode #signupPanel,' +
      'body.tchilo-recovery-mode #recoverPanel{display:none!important;}';
    (document.head || document.documentElement).appendChild(st);
  }

  function patchSyncAuth() {
    if (typeof window.tchiloSyncAuthSession === 'function' && !window.tchiloSyncAuthSession.__resetPatchV4) {
      var orig = window.tchiloSyncAuthSession;
      window.tchiloSyncAuthSession = async function () {
        if (isRecoveryUrl() || window.__tchiloPasswordRecoveryActive) {
          showResetPage();
          return;
        }
        return orig.apply(this, arguments);
      };
      window.tchiloSyncAuthSession.__resetPatchV4 = true;
    }
  }

  function patchSubmitNewPassword() {
    if (typeof window.submitNewPassword !== 'function') return;
    if (window.submitNewPassword.__resetPatchV4) return;
    var orig = window.submitNewPassword;
    window.submitNewPassword = async function (e) {
      var r = await orig.apply(this, arguments);
      clearRecoveryMark();
      try {
        document.body.classList.remove('tchilo-recovery-mode');
      } catch (err) {}
      try {
        if (window.history && window.history.replaceState) {
          window.history.replaceState(null, '', window.location.pathname || '/');
        }
      } catch (err2) {}
      return r;
    };
    window.submitNewPassword.__resetPatchV4 = true;
  }

  /** redirectTo do email: página de nova senha */
  function patchResetEmailRedirect() {
    if (typeof window.submitPasswordRecovery !== 'function') return;
    if (window.submitPasswordRecovery.__resetRedirectV4) return;
    var orig = window.submitPasswordRecovery;
    window.submitPasswordRecovery = async function (e) {
      if (e && e.preventDefault) e.preventDefault();
      var errEl = document.getElementById('recoverError');
      var btn = document.getElementById('recoverSubmitBtn');
      var emailEl = document.getElementById('recoverEmail');
      var email = (emailEl && emailEl.value ? emailEl.value : '').trim().toLowerCase();
      if (errEl) {
        errEl.style.color = '#ff5c7a';
        errEl.textContent = '';
      }
      if (!email || email.indexOf('@') < 0) {
        if (errEl) errEl.textContent = 'Indica um email válido.';
        return;
      }
      if (btn) {
        btn.disabled = true;
        btn.textContent = 'A enviar…';
      }
      try {
        var SB = window.tchiloSupabase;
        if (!SB) throw new Error('Auth indisponível');
        var origin = location.origin || 'https://tchilopop.com';
        var redirectTo = origin + '/redefinir-senha';
        var res = await SB.auth.resetPasswordForEmail(email, { redirectTo: redirectTo });
        if (res.error) throw res.error;
        if (errEl) {
          errEl.style.color = '#2ecc71';
          errEl.textContent =
            'Enviámos um link para o teu email. Abre o link e define a nova palavra-passe.';
        }
        try {
          if (typeof showToast === 'function') showToast('Email de recuperação enviado');
        } catch (t) {}
      } catch (err) {
        if (errEl) errEl.textContent = (err && err.message) || 'Falha ao enviar o email';
      } finally {
        if (btn) {
          btn.disabled = false;
          btn.textContent = 'Enviar link de recuperação';
        }
      }
    };
    window.submitPasswordRecovery.__resetRedirectV4 = true;
  }

  async function ensureRecoverySession() {
    try {
      var SB = window.tchiloSupabase;
      if (!SB) return;
      var hash = window.location.hash || '';
      if (hash.indexOf('access_token') >= 0 || hash.indexOf('type=recovery') >= 0) {
        await SB.auth.getSession();
      }
    } catch (e) {}
  }

  function blockSignedInToFeed() {
    try {
      var SB = window.tchiloSupabase;
      if (!SB || !SB.auth || SB.auth.__tchiloRecoveryListen) return;
      SB.auth.__tchiloRecoveryListen = true;
      SB.auth.onAuthStateChange(function (event) {
        if (
          event === 'PASSWORD_RECOVERY' ||
          isRecoveryUrl() ||
          window.__tchiloPasswordRecoveryActive
        ) {
          showResetPage();
        }
      });
    } catch (e) {}
  }

  function boot() {
    injectCSS();
    patchResetEmailRedirect();
    patchSyncAuth();
    patchSubmitNewPassword();
    blockSignedInToFeed();

    if (isRecoveryUrl()) {
      markRecovery();
      showResetPage();
      ensureRecoverySession().then(function () {
        showResetPage();
      });
    }

    setTimeout(function () {
      patchResetEmailRedirect();
      patchSyncAuth();
      patchSubmitNewPassword();
      blockSignedInToFeed();
      if (isRecoveryUrl() || window.__tchiloPasswordRecoveryActive) showResetPage();
    }, 400);

    setTimeout(function () {
      if (isRecoveryUrl() || window.__tchiloPasswordRecoveryActive) showResetPage();
    }, 1500);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();

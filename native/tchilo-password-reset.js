/**
 * Tchilo — recuperação de senha v5
 * Email → /redefinir-senha → ecrã "nova palavra-passe" (nunca feed / aviso solto)
 */
(function () {
  'use strict';
  if (window.__tchiloPasswordResetV5) return;
  window.__tchiloPasswordResetV5 = true;
  window.__tchiloPasswordResetV4 = true;

  var RESET_PATHS = ['/redefinir-senha', '/reset-password', '/recuperar-senha'];
  var SITE = 'https://tchilopop.com';
  var REDIRECT = SITE + '/redefinir-senha';

  function isRecoveryUrl() {
    try {
      var hash = window.location.hash || '';
      var search = window.location.search || '';
      var path = (window.location.pathname || '').toLowerCase();
      var full = hash + '&' + search + '&' + path;
      if (/type=recovery/i.test(full)) return true;
      if (/access_token=/i.test(full) && /type=recovery/i.test(full)) return true;
      if (/error_code=otp_expired|error=access_denied/i.test(full)) return true;
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

  function parseHashParams() {
    var out = {};
    try {
      var h = (window.location.hash || '').replace(/^#/, '');
      h.split('&').forEach(function (part) {
        var kv = part.split('=');
        if (kv[0]) out[decodeURIComponent(kv[0])] = decodeURIComponent(kv.slice(1).join('=') || '');
      });
    } catch (e) {}
    try {
      var q = (window.location.search || '').replace(/^\?/, '');
      q.split('&').forEach(function (part) {
        var kv = part.split('=');
        if (kv[0] && out[kv[0]] == null) {
          out[decodeURIComponent(kv[0])] = decodeURIComponent(kv.slice(1).join('=') || '');
        }
      });
    } catch (e2) {}
    return out;
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
    if (typeof window.tchiloSyncAuthSession === 'function' && !window.tchiloSyncAuthSession.__resetPatchV5) {
      var orig = window.tchiloSyncAuthSession;
      window.tchiloSyncAuthSession = async function () {
        if (isRecoveryUrl() || window.__tchiloPasswordRecoveryActive) {
          showResetPage();
          return;
        }
        return orig.apply(this, arguments);
      };
      window.tchiloSyncAuthSession.__resetPatchV5 = true;
    }
  }

  function patchSubmitNewPassword() {
    if (typeof window.submitNewPassword !== 'function') return;
    if (window.submitNewPassword.__resetPatchV5) return;
    var orig = window.submitNewPassword;
    window.submitNewPassword = async function (e) {
      await ensureRecoverySession();
      var r = await orig.apply(this, arguments);
      clearRecoveryMark();
      try {
        document.body.classList.remove('tchilo-recovery-mode');
      } catch (err) {}
      try {
        if (window.history && window.history.replaceState) {
          window.history.replaceState(null, '', '/');
        }
      } catch (err2) {}
      return r;
    };
    window.submitNewPassword.__resetPatchV5 = true;
  }

  /** Sempre redirectTo = tchilopop.com/redefinir-senha */
  function patchResetEmailRedirect() {
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
        var redirectTo = REDIRECT;
        try {
          if (location.hostname && location.hostname.indexOf('tchilopop.com') >= 0) {
            redirectTo = location.origin + '/redefinir-senha';
          }
        } catch (e0) {}
        var res = await SB.auth.resetPasswordForEmail(email, { redirectTo: redirectTo });
        if (res.error) throw res.error;
        if (errEl) {
          errEl.style.color = '#2ecc71';
          errEl.textContent =
            'Enviámos um link para o teu email. Abre o link — vais entrar direto no ecrã para definir a nova senha.';
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
    window.submitPasswordRecovery.__resetRedirectV5 = true;
  }

  async function ensureRecoverySession() {
    try {
      var SB = window.tchiloSupabase;
      if (!SB) return false;
      var params = parseHashParams();

      if (params.error || params.error_code) {
        markRecovery();
        showResetPage();
        var errEl = document.getElementById('recoverNewPassError');
        if (errEl) {
          errEl.textContent =
            'Este link expirou ou já foi usado. Pede um novo link de recuperação.';
        }
        return false;
      }

      if (params.access_token && params.refresh_token) {
        try {
          await SB.auth.setSession({
            access_token: params.access_token,
            refresh_token: params.refresh_token
          });
        } catch (e) {
          console.warn('[Tchilo] setSession recovery', e);
        }
      }

      var sess = await SB.auth.getSession();
      return !!(sess && sess.data && sess.data.session);
    } catch (e) {
      return false;
    }
  }

  function blockSignedInToFeed() {
    try {
      var SB = window.tchiloSupabase;
      if (!SB || !SB.auth || SB.auth.__tchiloRecoveryListenV5) return;
      SB.auth.__tchiloRecoveryListenV5 = true;
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
      if (isRecoveryUrl() || window.__tchiloPasswordRecoveryActive) {
        showResetPage();
        ensureRecoverySession();
      }
    }, 1200);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();

/**
 * Tchilo — recuperação de senha v6
 * Um toque no link → ecrã "Nova palavra-passe" de imediato
 */
(function () {
  'use strict';
  if (window.__tchiloPasswordResetV6) return;
  window.__tchiloPasswordResetV6 = true;

  var RESET_PATHS = ['/redefinir-senha', '/reset-password', '/recuperar-senha'];
  var REDIRECT_DEFAULT = 'https://tchilopop.com/redefinir-senha';

  function isRecoveryUrl() {
    try {
      var hash = window.location.hash || '';
      var search = window.location.search || '';
      var path = (window.location.pathname || '').toLowerCase();
      var full = hash + '&' + search + '&' + path;
      if (/type=recovery/i.test(full)) return true;
      if (/access_token=/i.test(full) && /refresh_token=/i.test(full)) return true;
      if (/error_code=otp_expired|error=access_denied/i.test(full)) return true;
      for (var i = 0; i < RESET_PATHS.length; i++) {
        if (path.indexOf(RESET_PATHS[i]) === 0) return true;
      }
      if (sessionStorage.getItem('tchilo_password_recovery') === '1') return true;
      if (window.__tchiloPasswordRecoveryActive) return true;
      try {
        if (sessionStorage.getItem('tchilo_recovery_hash')) return true;
      } catch (e0) {}
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
      sessionStorage.removeItem('tchilo_recovery_hash');
      sessionStorage.removeItem('tchilo_recovery_search');
    } catch (e) {}
  }

  function parseParams() {
    var out = {};
    function eat(str) {
      String(str || '')
        .replace(/^[#?]/, '')
        .split('&')
        .forEach(function (part) {
          if (!part) return;
          var kv = part.split('=');
          var k = decodeURIComponent(kv[0] || '');
          if (!k) return;
          out[k] = decodeURIComponent(kv.slice(1).join('=') || '');
        });
    }
    try {
      eat(window.location.hash);
      eat(window.location.search);
    } catch (e) {}
    try {
      eat(sessionStorage.getItem('tchilo_recovery_hash') || '');
      eat(sessionStorage.getItem('tchilo_recovery_search') || '');
    } catch (e2) {}
    return out;
  }

  function injectCSS() {
    if (document.getElementById('tchiloRecoveryCSS')) return;
    var st = document.createElement('style');
    st.id = 'tchiloRecoveryCSS';
    st.textContent =
      'body.tchilo-recovery-mode .screen{display:none!important;}' +
      'body.tchilo-recovery-mode #loginGate{' +
      'display:flex!important;visibility:visible!important;opacity:1!important;' +
      'z-index:2147483000!important;pointer-events:auto!important;}' +
      'body.tchilo-recovery-mode #recoverNewPassPanel{' +
      'display:block!important;visibility:visible!important;opacity:1!important;}' +
      'body.tchilo-recovery-mode #accessPanel,' +
      'body.tchilo-recovery-mode #signupPanel,' +
      'body.tchilo-recovery-mode #recoverPanel,' +
      'body.tchilo-recovery-mode #loginWelcome{' +
      'display:none!important;visibility:hidden!important;}';
    (document.head || document.documentElement).appendChild(st);
  }

  /** Abre JÁ o formulário de nova senha */
  function showResetPage() {
    markRecovery();
    injectCSS();
    try {
      document.body.classList.add('tchilo-recovery-mode');
      document.body.style.overflow = 'hidden';
    } catch (e) {}

    try {
      document.querySelectorAll('.screen').forEach(function (s) {
        s.classList.remove('active');
      });
    } catch (e2) {}

    var gate = document.getElementById('loginGate');
    if (gate) {
      gate.classList.remove('hidden');
      gate.removeAttribute('hidden');
      gate.style.setProperty('display', 'flex', 'important');
      gate.style.setProperty('visibility', 'visible', 'important');
      gate.style.setProperty('opacity', '1', 'important');
      gate.style.setProperty('z-index', '2147483000', 'important');
      gate.style.setProperty('pointer-events', 'auto', 'important');
    }

    ['accessPanel', 'signupPanel', 'recoverPanel', 'loginWelcome'].forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      el.classList.remove('active');
      el.style.setProperty('display', 'none', 'important');
      try {
        el.setAttribute('hidden', '');
      } catch (e3) {}
    });

    var rnp = document.getElementById('recoverNewPassPanel');
    if (rnp) {
      rnp.classList.add('active');
      rnp.removeAttribute('hidden');
      rnp.style.setProperty('display', 'block', 'important');
      rnp.style.setProperty('visibility', 'visible', 'important');
      rnp.style.setProperty('opacity', '1', 'important');
      try {
        var inp = document.getElementById('recoverNewPass');
        if (inp) setTimeout(function () {
          try {
            inp.focus();
          } catch (e4) {}
        }, 80);
      } catch (e5) {}
    } else if (typeof showLoginPanel === 'function') {
      try {
        showLoginPanel('recover-new');
      } catch (e6) {}
    }

    /* Não deixar ir ao feed */
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
    } catch (e7) {}
  }

  async function ensureRecoverySession() {
    try {
      var SB = window.tchiloSupabase;
      if (!SB) return false;
      var params = parseParams();

      if (params.error || params.error_code) {
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

  function patchSyncAuth() {
    if (typeof window.tchiloSyncAuthSession !== 'function') return;
    if (window.tchiloSyncAuthSession.__resetPatchV6) return;
    var orig = window.tchiloSyncAuthSession;
    window.tchiloSyncAuthSession = async function () {
      if (isRecoveryUrl() || window.__tchiloPasswordRecoveryActive) {
        showResetPage();
        return;
      }
      return orig.apply(this, arguments);
    };
    window.tchiloSyncAuthSession.__resetPatchV6 = true;
  }

  function patchSubmitNewPassword() {
    if (typeof window.submitNewPassword !== 'function') return;
    if (window.submitNewPassword.__resetPatchV6) return;
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
    window.submitNewPassword.__resetPatchV6 = true;
  }

  /** Pedir email: redirectTo fixo para /redefinir-senha */
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
        var redirectTo = REDIRECT_DEFAULT;
        try {
          if (location.hostname && /tchilopop\.com$/i.test(location.hostname)) {
            redirectTo = location.origin + '/redefinir-senha';
          }
        } catch (e0) {}
        var res = await SB.auth.resetPasswordForEmail(email, { redirectTo: redirectTo });
        if (res.error) throw res.error;
        if (errEl) {
          errEl.style.color = '#2ecc71';
          errEl.textContent =
            'Email enviado. Abre o link — abre direto o ecrã para defineires a nova senha.';
        }
        try {
          if (typeof showToast === 'function') showToast('Email enviado');
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
    window.submitPasswordRecovery.__resetRedirectV6 = true;
  }

  function listenAuth() {
    try {
      var SB = window.tchiloSupabase;
      if (!SB || !SB.auth || SB.auth.__tchiloRecoveryListenV6) return;
      SB.auth.__tchiloRecoveryListenV6 = true;
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

  function watchDom() {
    if (window.__tchiloRecoveryDomWatch) return;
    window.__tchiloRecoveryDomWatch = true;
    try {
      new MutationObserver(function () {
        if (window.__tchiloPasswordRecoveryActive || isRecoveryUrl()) {
          var rnp = document.getElementById('recoverNewPassPanel');
          if (rnp && !rnp.classList.contains('active')) showResetPage();
        }
      }).observe(document.documentElement, { childList: true, subtree: true });
    } catch (e) {}
  }

  function boot() {
    injectCSS();
    patchResetEmailRedirect();
    patchSyncAuth();
    patchSubmitNewPassword();
    listenAuth();
    watchDom();

    if (isRecoveryUrl()) {
      markRecovery();
      showResetPage();
      ensureRecoverySession().then(function () {
        showResetPage();
      });
    }
  }

  /* Executa já — não espera DOMContentLoaded se o body já existe */
  boot();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      boot();
      if (isRecoveryUrl()) showResetPage();
    });
  }
  setTimeout(boot, 50);
  setTimeout(function () {
    boot();
    if (isRecoveryUrl() || window.__tchiloPasswordRecoveryActive) showResetPage();
  }, 300);
  setTimeout(function () {
    if (isRecoveryUrl() || window.__tchiloPasswordRecoveryActive) showResetPage();
  }, 1000);
  setTimeout(function () {
    if (isRecoveryUrl() || window.__tchiloPasswordRecoveryActive) showResetPage();
  }, 2500);

  try {
    window.addEventListener('hashchange', function () {
      if (isRecoveryUrl()) {
        markRecovery();
        showResetPage();
        ensureRecoverySession();
      }
    });
  } catch (e) {}

  window.tchiloShowPasswordReset = showResetPage;
})();

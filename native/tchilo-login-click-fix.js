/**
 * Tchilo — só os botões da HOME "Entrar" / "Criar conta".
 * NÃO toca no formulário (submit), NÃO limpa campos, NÃO intercepta #accessPanel.
 */
(function () {
  'use strict';
  if (window.__tchiloLoginClickFixV4) return;
  window.__tchiloLoginClickFixV4 = true;

  function injectCSS() {
    if (document.getElementById('tchiloLoginClickCSS')) return;
    var st = document.createElement('style');
    st.id = 'tchiloLoginClickCSS';
    st.textContent =
      '.login-gate{z-index:99999!important;pointer-events:auto!important;}' +
      '.login-gate .login-actions button,' +
      '.login-gate > .login-card > button,' +
      '.login-gate button.login-create{' +
      'pointer-events:auto!important;cursor:pointer!important;touch-action:manipulation!important;}' +
      '#loginError,.login-error{color:#ff6b6b!important;font-size:13px!important;min-height:18px;margin:6px 0;}' +
      '.field-invalid{border-color:#ff6b6b!important;box-shadow:0 0 0 2px rgba(255,107,107,.25)!important;}';
    (document.head || document.documentElement).appendChild(st);
  }

  function openPanel(name) {
    try {
      if (typeof showLoginPanel === 'function') {
        showLoginPanel(name);
        return;
      }
    } catch (e) {}
  }

  function isInsideLoginForm(el) {
    if (!el || !el.closest) return false;
    return !!(
      el.closest('form.login-form') ||
      el.closest('#accessPanel') ||
      el.closest('#signupPanel') ||
      el.closest('#recoverPanel') ||
      el.closest('#recoverNewPassPanel') ||
      el.closest('.login-panel')
    );
  }

  function bindHomeButtons() {
    var gate = document.querySelector('.login-gate') || document.getElementById('loginGate');
    if (!gate) return;

    var homeBtns = gate.querySelectorAll(
      '.login-actions button, .login-actions a, button.login-create'
    );
    if (!homeBtns.length) {
      homeBtns = gate.querySelectorAll('button[type="button"][onclick*="showLoginPanel"], a[onclick*="showLoginPanel"]');
    }

    homeBtns.forEach(function (btn) {
      if (btn.__tchiloBoundV4) return;
      if (btn.type === 'submit') return;
      if (isInsideLoginForm(btn)) return;
      if (btn.classList && btn.classList.contains('login-button')) return;

      var oc = btn.getAttribute('onclick') || '';
      var label = (btn.textContent || '').trim().toLowerCase();
      var target = null;

      if (
        oc.indexOf("showLoginPanel('access')") >= 0 ||
        oc.indexOf('showLoginPanel("access")') >= 0 ||
        label === 'entrar'
      ) {
        target = 'access';
      } else if (
        oc.indexOf("showLoginPanel('signup')") >= 0 ||
        oc.indexOf('showLoginPanel("signup")') >= 0 ||
        label.indexOf('criar conta') >= 0
      ) {
        target = 'signup';
      }

      if (!target) return;

      btn.__tchiloBoundV4 = true;
      btn.addEventListener(
        'click',
        function (e) {
          if (isInsideLoginForm(btn)) return;
          e.preventDefault();
          e.stopPropagation();
          openPanel(target);
        },
        false
      );
    });
  }

  function patchLogin() {
    if (typeof window.tchiloSupabaseLogin !== 'function') return;
    if (window.tchiloSupabaseLogin.__v4) return;
    window.tchiloSupabaseLogin = async function (identifier, password) {
      identifier = String(identifier || '').trim().toLowerCase();
      password = String(password || '');
      if (!identifier || !password) throw new Error('Preenche os dois campos.');

      var email = identifier;
      var SB = window.tchiloSupabase;
      if (!SB || !SB.auth) throw new Error('Serviço de autenticação indisponível.');

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier)) {
        throw new Error('Para entrar, usa o email da conta (não o nome de utilizador).');
      }

      var res = await SB.auth.signInWithPassword({ email: email, password: password });
      if (res.error) throw res.error;
      var user = res.data && res.data.user;
      if (!user) throw new Error('Não foi possível iniciar sessão.');

      var profile = null;
      try {
        if (typeof window.tchiloEnsureProfile === 'function') {
          profile = await window.tchiloEnsureProfile(user);
        }
      } catch (pe) {
        console.warn('ensureProfile', pe);
      }
      if (!profile) {
        var pr = await SB.from('profiles').select('*').eq('id', user.id).maybeSingle();
        profile = pr.data;
      }
      if (!profile) {
        profile = {
          id: user.id,
          username: (user.user_metadata && user.user_metadata.username) || ('user_' + String(user.id).slice(0, 8)),
          display_name: (user.user_metadata && user.user_metadata.display_name) || '',
          avatar_url: null,
          is_private: false,
          anonymous_mode: false
        };
      }

      if (typeof setSession === 'function') {
        setSession({
          id: profile.id,
          username: profile.username,
          email: user.email || email,
          displayName: profile.display_name || profile.username,
          avatar: profile.avatar_url || null,
          privateAccount: !!profile.is_private,
          anonymousMode: !!profile.anonymous_mode
        });
      }
      if (typeof hideLoginGate === 'function') hideLoginGate();
      if (typeof showToast === 'function') showToast('Olá, ' + (profile.username || '') + '!');
      return res.data;
    };
    window.tchiloSupabaseLogin.__v4 = true;
  }

  function patchShowLoginPanel() {
    if (typeof window.tchiloClearLoginFields === 'function' && !window.tchiloClearLoginFields.__v4) {
      var clearOrig = window.tchiloClearLoginFields;
      window.tchiloClearLoginFields = function () {
        if (window.__tchiloLoginSubmitting) return;
        return clearOrig.apply(this, arguments);
      };
      window.tchiloClearLoginFields.__v4 = true;
    }

    if (typeof window.tchiloLogin === 'function' && !window.tchiloLogin.__v4) {
      var loginOrig = window.tchiloLogin;
      window.tchiloLogin = async function (e) {
        window.__tchiloLoginSubmitting = true;
        try {
          return await loginOrig.apply(this, arguments);
        } finally {
          setTimeout(function () {
            window.__tchiloLoginSubmitting = false;
          }, 800);
        }
      };
      window.tchiloLogin.__v4 = true;
    }
  }

  function run() {
    injectCSS();
    bindHomeButtons();
    patchLogin();
    patchShowLoginPanel();
  }

  run();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  }
  setTimeout(run, 300);
  setTimeout(run, 1000);
  setTimeout(run, 2500);

  try {
    var mo = new MutationObserver(function () {
      bindHomeButtons();
      patchLogin();
      patchShowLoginPanel();
    });
    mo.observe(document.documentElement, { childList: true, subtree: true });
  } catch (e) {}
})();

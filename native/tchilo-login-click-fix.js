/**
 * Tchilo login buttons v5
 * Abre painéis Entrar / Criar conta de forma fiável.
 * NÃO interfere com o submit do formulário.
 */
(function () {
  'use strict';
  if (window.__tchiloLoginClickFixV5) return;
  window.__tchiloLoginClickFixV5 = true;

  function injectCSS() {
    if (document.getElementById('tchiloLoginClickCSS')) return;
    var st = document.createElement('style');
    st.id = 'tchiloLoginClickCSS';
    st.textContent =
      '.login-gate,.login-gate *{pointer-events:auto!important;}' +
      '.login-choice,.login-choice button,.login-create{' +
      'pointer-events:auto!important;cursor:pointer!important;touch-action:manipulation!important;' +
      'position:relative;z-index:20!important;}' +
      '.login-gate.panel-open #accessPanel.active,' +
      '.login-gate.panel-open #signupPanel.active,' +
      '.login-gate.panel-open #recoverPanel.active,' +
      '.login-gate.panel-open #recoverNewPassPanel.active{' +
      'display:block!important;visibility:visible!important;opacity:1!important;}' +
      '.login-gate.panel-open #loginWelcome{display:none!important;}' +
      '#loginError,.login-error{color:#ff6b6b!important;font-size:13px!important;min-height:18px;margin:6px 0;}' +
      '.field-invalid{border-color:#ff6b6b!important;}';
    (document.head || document.documentElement).appendChild(st);
  }

  function openPanelDirect(name) {
    var gate = document.getElementById('loginGate') || document.querySelector('.login-gate');
    var map = {
      access: 'accessPanel',
      signup: 'signupPanel',
      recover: 'recoverPanel',
      'recover-new': 'recoverNewPassPanel'
    };
    var targetId = map[name] || 'accessPanel';

    /* Preferir a função oficial */
    try {
      if (typeof window.showLoginPanel === 'function') {
        window.showLoginPanel(name);
        return true;
      }
    } catch (e) {
      console.warn('[login] showLoginPanel error', e);
    }

    /* Fallback DOM direto */
    try {
      var welcome = document.getElementById('loginWelcome');
      if (welcome) {
        welcome.classList.remove('is-visible');
        welcome.setAttribute('hidden', '');
        welcome.style.setProperty('display', 'none', 'important');
      }
      ['accessPanel', 'signupPanel', 'recoverPanel', 'recoverNewPassPanel'].forEach(function (id) {
        var el = document.getElementById(id);
        if (!el) return;
        var on = id === targetId;
        el.classList.toggle('active', on);
        el.style.setProperty('display', on ? 'block' : 'none', 'important');
        el.style.setProperty('visibility', on ? 'visible' : 'hidden', 'important');
        el.style.setProperty('opacity', on ? '1' : '0', 'important');
        if (on) el.removeAttribute('hidden');
      });
      if (gate) {
        gate.classList.add('panel-open');
        gate.classList.toggle('signup-open', name === 'signup' || name === 'recover');
      }
      return true;
    } catch (e2) {
      console.warn('[login] openPanelDirect fail', e2);
      return false;
    }
  }

  function isFormControl(el) {
    if (!el || !el.closest) return false;
    if (el.type === 'submit') return true;
    if (el.classList && el.classList.contains('login-button')) return true;
    return !!(
      el.closest('form.login-form') ||
      el.closest('#accessPanel form') ||
      el.closest('#signupPanel form') ||
      el.closest('#recoverPanel form') ||
      el.closest('#recoverNewPassPanel form')
    );
  }

  function resolveTarget(el) {
    if (!el || !el.closest) return null;
    /* só botões da home dentro de .login-choice / loginWelcome */
    var btn = el.closest('button, a, [role="button"]');
    if (!btn) return null;
    if (isFormControl(btn)) return null;

    var inChoice = btn.closest('.login-choice') || btn.closest('#loginWelcome');
    if (!inChoice && !(btn.classList && btn.classList.contains('login-create'))) {
      /* permitir Voltar a entrar etc via onclick */
      var oc0 = btn.getAttribute('onclick') || '';
      if (oc0.indexOf('showLoginPanel') < 0) return null;
    }

    var oc = (btn.getAttribute('onclick') || '') + '';
    var label = (btn.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();

    if (
      oc.indexOf("showLoginPanel('access')") >= 0 ||
      oc.indexOf('showLoginPanel("access")') >= 0 ||
      label === 'entrar' ||
      label.indexOf('voltar a entrar') >= 0
    ) {
      return 'access';
    }
    if (
      oc.indexOf("showLoginPanel('signup')") >= 0 ||
      oc.indexOf('showLoginPanel("signup")') >= 0 ||
      label.indexOf('criar conta') >= 0
    ) {
      return 'signup';
    }
    if (
      oc.indexOf("showLoginPanel('recover')") >= 0 ||
      oc.indexOf('showLoginPanel("recover")') >= 0
    ) {
      return 'recover';
    }
    return null;
  }

  function onDocClick(e) {
    var target = resolveTarget(e.target);
    if (!target) return;
    e.preventDefault();
    e.stopPropagation();
    openPanelDirect(target);
  }

  function bindInlineFallback() {
    var gate = document.getElementById('loginGate') || document.querySelector('.login-gate');
    if (!gate) return;
    var btns = gate.querySelectorAll(
      '.login-choice button, #loginWelcome button, button.login-create, button[onclick*="showLoginPanel"]'
    );
    btns.forEach(function (btn) {
      if (btn.__tchiloV5) return;
      if (isFormControl(btn)) return;
      btn.__tchiloV5 = true;
      btn.style.pointerEvents = 'auto';
      btn.style.cursor = 'pointer';
      btn.addEventListener(
        'click',
        function (e) {
          var t = resolveTarget(btn);
          if (!t) return;
          e.preventDefault();
          e.stopPropagation();
          openPanelDirect(t);
        },
        false
      );
    });
  }

  /* Hardening auth — não quebra se perfil atrasar */
  function patchLogin() {
    if (typeof window.tchiloSupabaseLogin !== 'function') return;
    if (window.tchiloSupabaseLogin.__v5) return;
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
      if (res.error) throw res.error;
      var user = res.data && res.data.user;
      if (!user) throw new Error('Não foi possível iniciar sessão.');
      var profile = null;
      try {
        if (typeof window.tchiloEnsureProfile === 'function') {
          profile = await window.tchiloEnsureProfile(user);
        }
      } catch (pe) {}
      if (!profile) {
        try {
          var pr = await SB.from('profiles').select('*').eq('id', user.id).maybeSingle();
          profile = pr.data;
        } catch (e) {}
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
          email: user.email || identifier,
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
    window.tchiloSupabaseLogin.__v5 = true;
  }

  function patchSubmitGuard() {
    if (typeof window.tchiloClearLoginFields === 'function' && !window.tchiloClearLoginFields.__v5) {
      var clearOrig = window.tchiloClearLoginFields;
      window.tchiloClearLoginFields = function () {
        if (window.__tchiloLoginSubmitting) return;
        return clearOrig.apply(this, arguments);
      };
      window.tchiloClearLoginFields.__v5 = true;
    }
    if (typeof window.tchiloLogin === 'function' && !window.tchiloLogin.__v5) {
      var loginOrig = window.tchiloLogin;
      window.tchiloLogin = async function (e) {
        window.__tchiloLoginSubmitting = true;
        try {
          return await loginOrig.apply(this, arguments);
        } finally {
          setTimeout(function () {
            window.__tchiloLoginSubmitting = false;
          }, 1000);
        }
      };
      window.tchiloLogin.__v5 = true;
    }
  }

  function run() {
    injectCSS();
    bindInlineFallback();
    patchLogin();
    patchSubmitGuard();
  }

  /* Delegação no documento (captura) — funciona mesmo se o DOM for recriado */
  document.addEventListener('click', onDocClick, true);

  run();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  }
  setTimeout(run, 200);
  setTimeout(run, 800);
  setTimeout(run, 2000);

  try {
    var mo = new MutationObserver(function () {
      bindInlineFallback();
      patchLogin();
      patchSubmitGuard();
    });
    mo.observe(document.documentElement, { childList: true, subtree: true });
  } catch (e) {}
})();

/**
 * Tchilo — Editar perfil moderno
 * - Remove cores do avatar e anéis grossos
 * - Remove campos de senha e botão de confirmação de email do Editar perfil
 * - Palavra-passe: Conta → Palavra-passe e segurança (alterar / esqueci)
 */
(function () {
  'use strict';

  function $(id) { return document.getElementById(id); }

  function injectStyles() {
    if ($('tchilo-edit-profile-modern-css')) return;
    var s = document.createElement('style');
    s.id = 'tchilo-edit-profile-modern-css';
    s.textContent = [
      '#screen-editprofile .avatar-colors,',
      '#screen-editprofile label[for="avatarColors"],',
      '#screen-editprofile .edit-form > label:nth-of-type(1) { }',
      '/* esconder bloco cores */',
      '#avatarColors, #screen-editprofile .avatar-colors { display: none !important; }',
      '#screen-editprofile label { }',
      /* avatar preview limpo, sem anel grosso */',
      '#editAvatarPreview, .edit-avatar-preview {',
      '  width: 96px !important; height: 96px !important;',
      '  border-radius: 50% !important;',
      '  border: none !important;',
      '  box-shadow: 0 0 0 1px rgba(0,0,0,.08) !important;',
      '  margin: 8px auto 16px !important;',
      '  overflow: hidden !important;',
      '  background: #f2f2f4 !important;',
      '}',
      '#editAvatarPreview img { width: 100%; height: 100%; object-fit: cover; display: block; }',
      /* botões foto modernos (sem dashed grosso) */',
      '#screen-editprofile .gallery-btn {',
      '  border: 1px solid rgba(11,11,12,.12) !important;',
      '  border-style: solid !important;',
      '  background: #fff !important;',
      '  border-radius: 14px !important;',
      '  padding: 14px 16px !important;',
      '  font-weight: 600 !important;',
      '  color: var(--ink,#0B0B0C) !important;',
      '  box-shadow: none !important;',
      '  margin: 0 0 10px !important;',
      '}',
      '#removeAvatarBtn {',
      '  border: 1px solid rgba(11,11,12,.1) !important;',
      '  background: #f4f4f5 !important;',
      '  color: #555 !important;',
      '}',
      '#screen-editprofile .edit-form {',
      '  padding: 12px 20px 32px !important;',
      '  max-width: 480px;',
      '  margin: 0 auto;',
      '}',
      '#screen-editprofile .edit-form label {',
      '  display: block;',
      '  font-size: 13px;',
      '  font-weight: 600;',
      '  color: #666;',
      '  margin: 14px 0 6px;',
      '}',
      '#screen-editprofile .edit-form input,',
      '#screen-editprofile .edit-form textarea {',
      '  border: none !important;',
      '  background: #f2f2f4 !important;',
      '  border-radius: 12px !important;',
      '  padding: 14px 16px !important;',
      '  width: 100%;',
      '  box-sizing: border-box;',
      '  font-size: 16px;',
      '}',
      '#screen-editprofile .settings-save {',
      '  margin-top: 20px !important;',
      '  border-radius: 14px !important;',
      '  border: none !important;',
      '}',
      /* ecrã segurança */',
      '#screen-settings-security .sec-card {',
      '  margin: 16px;',
      '  padding: 0;',
      '  border-radius: 16px;',
      '  background: #fff;',
      '  border: 1px solid rgba(0,0,0,.06);',
      '  overflow: hidden;',
      '}',
      '#screen-settings-security .sec-item {',
      '  display: flex; align-items: center; gap: 12px;',
      '  width: 100%; padding: 16px 18px;',
      '  border: 0; background: transparent; text-align: left;',
      '  font-size: 16px; font-weight: 600; color: var(--ink,#0B0B0C);',
      '  border-bottom: 1px solid rgba(0,0,0,.06);',
      '  cursor: pointer;',
      '}',
      '#screen-settings-security .sec-item:last-child { border-bottom: 0; }',
      '#screen-settings-security .sec-item span.desc {',
      '  display: block; font-size: 13px; font-weight: 400; color: #888; margin-top: 2px;',
      '}',
      '#screen-settings-security .sec-hint {',
      '  margin: 12px 20px; font-size: 13px; color: #888; line-height: 1.4;',
      '}',
    ].join('\n');
    (document.head || document.documentElement).appendChild(s);
  }

  function hideEditProfileExtras() {
    var form = $('editProfileForm');
    if (!form) return;

    /* cores do avatar */
    var colors = $('avatarColors');
    if (colors) {
      colors.style.display = 'none';
      var prev = colors.previousElementSibling;
      if (prev && prev.tagName === 'LABEL' && /cor|avatar|color/i.test(prev.textContent || '')) {
        prev.style.display = 'none';
      }
    }
    form.querySelectorAll('label').forEach(function (lab) {
      var t = (lab.textContent || '').trim();
      if (/^Cor do avatar$/i.test(t)) lab.style.display = 'none';
      if (/Nova palavra-passe|Confirmar nova palavra-passe/i.test(t)) lab.style.display = 'none';
    });

    ['editNewPassword', 'editNewPassword2'].forEach(function (id) {
      var el = $(id);
      if (el) {
        el.style.display = 'none';
        el.value = '';
        el.setAttribute('tabindex', '-1');
      }
    });

    /* botão confirmação email */
    form.querySelectorAll('button').forEach(function (btn) {
      var t = (btn.textContent || '').trim();
      if (/confirmação de email|confirm.*email|Enviar confirmação/i.test(t)) {
        btn.style.display = 'none';
      }
    });

    /* modernizar gallery-btn (já via CSS) */
    form.querySelectorAll('.gallery-btn').forEach(function (b) {
      b.style.borderStyle = 'solid';
      b.style.borderWidth = '1px';
    });
  }

  function ensureSecurityScreen() {
    if ($('screen-settings-security')) return;
    var div = document.createElement('div');
    div.className = 'screen';
    div.id = 'screen-settings-security';
    div.innerHTML =
      '<div class="screen-header">' +
      '<button class="back-btn" type="button" onclick="goTo(\'settings-account\')">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M15 18l-6-6 6-6"/></svg>' +
      '</button><h1>Palavra-passe e segurança</h1></div>' +
      '<p class="sec-hint">Gere a segurança da conta aqui. A alteração de perfil (nome, foto, bio) fica em Editar perfil.</p>' +
      '<div class="sec-card">' +
      '<button type="button" class="sec-item" id="tchiloBtnChangePass">' +
      '<div><b>Alterar palavra-passe</b><span class="desc">Define uma nova palavra-passe</span></div></button>' +
      '<button type="button" class="sec-item" id="tchiloBtnForgotPass">' +
      '<div><b>Esqueci a palavra-passe</b><span class="desc">Enviamos um link de recuperação para o teu email</span></div></button>' +
      '</div>';
    var account = $('screen-settings-account');
    if (account && account.parentNode) {
      account.parentNode.insertBefore(div, account.nextSibling);
    } else {
      document.body.appendChild(div);
    }

    var changeBtn = $('tchiloBtnChangePass');
    var forgotBtn = $('tchiloBtnForgotPass');
    if (changeBtn) changeBtn.addEventListener('click', tchiloChangePasswordFlow);
    if (forgotBtn) forgotBtn.addEventListener('click', tchiloForgotPasswordFlow);
  }

  async function tchiloChangePasswordFlow() {
    var SB = window.tchiloSupabase;
    var session = typeof getSession === 'function' ? getSession() : null;
    if (!session) {
      if (typeof showToast === 'function') showToast('Sessão não encontrada');
      return;
    }
    var np = null;
    var np2 = null;
    if (typeof tchiloPrompt === 'function') {
      np = await tchiloPrompt({
        title: 'Nova palavra-passe',
        message: 'Mínimo 8 caracteres',
        type: 'password'
      });
      if (np === null) return;
      np2 = await tchiloPrompt({
        title: 'Confirmar palavra-passe',
        message: 'Repete a nova palavra-passe',
        type: 'password'
      });
      if (np2 === null) return;
    } else {
      np = window.prompt('Nova palavra-passe (mín. 8)');
      if (np === null) return;
      np2 = window.prompt('Confirmar palavra-passe');
      if (np2 === null) return;
    }
    if (String(np).length < 8) {
      if (typeof showToast === 'function') showToast('Mínimo 8 caracteres');
      return;
    }
    if (String(np) !== String(np2)) {
      if (typeof showToast === 'function') showToast('As palavras-passe não coincidem');
      return;
    }
    try {
      if (SB && SB.auth) {
        var r = await SB.auth.updateUser({ password: String(np) });
        if (r.error) throw r.error;
        if (typeof showToast === 'function') showToast('Palavra-passe atualizada');
        return;
      }
    } catch (e) {
      console.warn(e);
      if (typeof showToast === 'function') showToast((e && e.message) || 'Não foi possível alterar');
      return;
    }
    /* fallback local antigo */
    if (typeof openChangePassword === 'function' && openChangePassword._tchiloOriginal) {
      return openChangePassword._tchiloOriginal();
    }
  }

  async function tchiloForgotPasswordFlow() {
    var SB = window.tchiloSupabase;
    var session = typeof getSession === 'function' ? getSession() : null;
    var email = (session && session.email) || '';
    if (!email && typeof tchiloPrompt === 'function') {
      email = await tchiloPrompt({
        title: 'Email da conta',
        message: 'Indica o email para recuperação',
        defaultValue: ''
      });
      if (email === null) return;
    }
    email = String(email || '').trim().toLowerCase();
    if (!email) {
      if (typeof showToast === 'function') showToast('Email necessário');
      return;
    }
    try {
      if (!SB || !SB.auth) throw new Error('Auth indisponível');
      var redirectTo = (window.location && window.location.origin) || 'https://tchilopop.com';
      var r = await SB.auth.resetPasswordForEmail(email, { redirectTo: redirectTo });
      if (r.error) throw r.error;
      if (typeof showToast === 'function') {
        showToast('Enviámos um email de recuperação para ' + email);
      }
    } catch (e) {
      console.warn(e);
      if (typeof showToast === 'function') showToast((e && e.message) || 'Não foi possível enviar o email');
    }
  }

  function patchOpenChangePassword() {
    if (typeof window.openChangePassword !== 'function') {
      window.openChangePassword = function () {
        ensureSecurityScreen();
        if (typeof goTo === 'function') goTo('settings-security');
      };
      return;
    }
    if (window.openChangePassword._tchiloSec) return;
    window.openChangePassword._tchiloOriginal = window.openChangePassword;
    window.openChangePassword = function () {
      ensureSecurityScreen();
      if (typeof goTo === 'function') goTo('settings-security');
      else window.openChangePassword._tchiloOriginal();
    };
    window.openChangePassword._tchiloSec = true;
  }

  /* permitir goTo settings-security */
  function patchGoToAllow() {
    /* a app usa mapa de ecrãs; injetamos o ecrã no DOM — goTo costuma aceitar qualquer id screen-X */
  }

  function boot() {
    injectStyles();
    hideEditProfileExtras();
    ensureSecurityScreen();
    patchOpenChangePassword();

    var obs = new MutationObserver(function () {
      hideEditProfileExtras();
    });
    if (document.body) obs.observe(document.body, { childList: true, subtree: true });

    /* quando abre editar perfil */
    var origLoad = window.loadEditProfileForm;
    if (typeof origLoad === 'function' && !origLoad._tchiloMod) {
      window.loadEditProfileForm = function () {
        var r = origLoad.apply(this, arguments);
        hideEditProfileExtras();
        return r;
      };
      window.loadEditProfileForm._tchiloMod = true;
    }
  }

  window.tchiloChangePasswordFlow = tchiloChangePasswordFlow;
  window.tchiloForgotPasswordFlow = tchiloForgotPasswordFlow;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(boot, 400); });
  } else {
    setTimeout(boot, 400);
  }
})();

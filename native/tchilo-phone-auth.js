/**
 * Tchilo — número de telefone (v1)
 *
 * Criar conta, entrar, recuperar a conta e validar o número, tudo com SMS (OTP).
 * Usa a autenticação por telefone do Supabase (signInWithOtp / verifyOtp / updateUser).
 * O envio do SMS é feito pelo Twilio Verify, configurado no painel do Supabase:
 *   Authentication → Sign In / Providers → Phone → SMS provider = Twilio Verify.
 * Não há segredos neste ficheiro.
 *
 * Peças:
 *  - window.tchiloPhone: utilitários (países, E.164, erros, envio/verificação) usados
 *    também pelo assistente de registo (#tsu) do index.
 *  - Entrar (#accessPanel): separador "Telemóvel" → palavra-passe ou código SMS.
 *  - Recuperar (#recoverPanel): separador "Telemóvel" → código SMS → nova palavra-passe.
 *  - Definições → Conta → "Número de telefone": adicionar / alterar e verificar.
 */
(function () {
  'use strict';
  if (window.__tchiloPhoneAuthV1) return;
  window.__tchiloPhoneAuthV1 = true;

  /* ---------- utilitários ---------- */
  function $(id) { return document.getElementById(id); }
  function sb() { return window.tchiloSupabase || null; }

  function tr(k) {
    try { return typeof t === 'function' ? t(k) : k; } catch (e) { return k; }
  }

  function toast(k) {
    try { if (typeof showToast === 'function') showToast(tr(k)); } catch (e) {}
  }

  function show(id, on) {
    var el = $(id);
    if (el) el.style.display = on ? '' : 'none';
  }

  function setText(id, txt) {
    var el = $(id);
    if (el) el.textContent = txt;
  }

  /* ---------- países e números ---------- */
  var FALLBACK_DIALS = {
    AO: '244', PT: '351', BR: '55', MZ: '258', CV: '238', ST: '239', GW: '245',
    US: '1', GB: '44', FR: '33', ES: '34', IT: '39', DE: '49', ZA: '27', CN: '86'
  };
  var PRIORITY = ['AO', 'PT', 'BR', 'MZ', 'CV', 'ST', 'GW'];
  var TZ = {
    'Africa/Luanda': 'AO', 'Europe/Lisbon': 'PT', 'Atlantic/Madeira': 'PT', 'Atlantic/Azores': 'PT',
    'America/Sao_Paulo': 'BR', 'America/Fortaleza': 'BR', 'America/Manaus': 'BR', 'Africa/Maputo': 'MZ',
    'Atlantic/Cape_Verde': 'CV', 'Africa/Bissau': 'GW', 'Africa/Sao_Tome': 'ST'
  };

  function dials() { return window.tchiloDials || FALLBACK_DIALS; }

  function countryName(cc) {
    try { return new Intl.DisplayNames(['pt'], { type: 'region' }).of(cc) || cc; } catch (e) { return cc; }
  }

  function guessCc() {
    var d = dials(), cc = null;
    try { cc = TZ[Intl.DateTimeFormat().resolvedOptions().timeZone] || null; } catch (e) {}
    if (!cc) {
      try {
        var l = (navigator.languages && navigator.languages[0]) || navigator.language || '';
        var m = l.match(/[-_]([A-Za-z]{2})$/);
        if (m) cc = m[1].toUpperCase();
      } catch (e2) {}
    }
    return cc && d[cc] ? cc : 'AO';
  }

  function countryList() {
    var d = dials();
    var list = Object.keys(d).map(function (cc) { return { cc: cc, dial: d[cc], name: countryName(cc) }; });
    list.sort(function (a, b) { return a.name.localeCompare(b.name, 'pt'); });
    var first = [];
    PRIORITY.forEach(function (cc) {
      var i = list.findIndex(function (x) { return x.cc === cc; });
      if (i >= 0) first.push(list.splice(i, 1)[0]);
    });
    return first.concat(list);
  }

  function fillSelect(sel, cc) {
    if (!sel) return;
    if (!sel.options.length) {
      sel.innerHTML = countryList().map(function (c) {
        return '<option value="' + c.cc + '">' + c.name.replace(/&/g, '&amp;').replace(/</g, '&lt;') + ' (+' + c.dial + ')</option>';
      }).join('');
    }
    var want = cc && dials()[cc] ? cc : guessCc();
    sel.value = want;
  }

  /* devolve { ok, phone:'+244923456789' } ou { ok:false, error } */
  function parse(cc, raw) {
    var s = String(raw || '').trim();
    var digits = s.replace(/\D/g, '');
    var full;
    if (s.charAt(0) === '+') {
      full = digits;
    } else {
      var dial = dials()[cc] || '';
      full = dial + digits.replace(/^0+/, '');
    }
    if (!/^[1-9]\d{6,14}$/.test(full)) return { ok: false, error: 'Número de telefone inválido.' };
    return { ok: true, phone: '+' + full };
  }

  function mask(p) {
    var s = String(p || '').replace(/\D/g, '');
    if (s.length < 7) return '+' + s;
    return '+' + s.slice(0, 3) + ' ' + new Array(s.length - 5 + 1).join('*') + ' ' + s.slice(-2);
  }

  /* ---------- erros em português ---------- */
  function friendlyError(e, fallback) {
    var m = String((e && (e.message || e.msg)) || '');
    var c = String((e && (e.code || e.error_code)) || '');
    var x = (c + ' ' + m).toLowerCase();
    if (/unsupported phone provider|phone.?provider|provider.*disabled|phone.*(login|signup|sign.?in).*(disabled|not enabled)|sms.*disabled/.test(x)) {
      return 'O acesso por telemóvel ainda não está disponível. Usa o e-mail.';
    }
    if (/rate.?limit|too many|over_[a-z_]*rate|seconds/.test(x)) {
      return 'Aguarda alguns instantes antes de pedires um novo código.';
    }
    if (/signups not allowed|user not found|otp_disabled|user_not_found/.test(x)) {
      return 'Não encontrámos uma conta com este número.';
    }
    if (/invalid.*phone|phone.*invalid|invalid_phone/.test(x)) {
      return 'Número de telefone inválido.';
    }
    if (/phone_exists|already.*(registered|exists|in use)|already been registered/.test(x)) {
      return 'Este número já está associado a outra conta.';
    }
    if (/invalid login credentials|invalid_credentials/.test(x)) {
      return 'Número ou palavra-passe incorretos.';
    }
    if (/expired|invalid.*(token|otp|code)|token.*invalid|otp_expired/.test(x)) {
      return 'Código inválido ou expirado. Verifica-o ou recebe um novo código.';
    }
    if (/sms_send_failed|failed to send|twilio/.test(x)) {
      return 'Não foi possível enviar o SMS. Tenta novamente daqui a pouco.';
    }
    return fallback || 'Algo correu mal. Tenta novamente.';
  }

  function err2text(e, fallback) { return tr(friendlyError(e, fallback)); }

  /* ---------- chamadas ao Supabase ---------- */
  function sendOtp(phone, create) {
    var c = sb();
    if (!c) return Promise.resolve({ error: new Error('Sem ligação') });
    return c.auth.signInWithOtp({ phone: phone, options: { channel: 'sms', shouldCreateUser: !!create } });
  }

  function verifyOtp(phone, token, type) {
    var c = sb();
    if (!c) return Promise.resolve({ error: new Error('Sem ligação') });
    return c.auth.verifyOtp({ phone: phone, token: token, type: type || 'sms' });
  }

  function onlyDigits(s) { return String(s || '').replace(/\D/g, ''); }

  window.tchiloPhone = {
    parse: parse, mask: mask, fillSelect: fillSelect, guessCc: guessCc,
    friendlyError: friendlyError, tr: tr, sendOtp: sendOtp, verifyOtp: verifyOtp
  };

  /* ---------- CSS ---------- */
  function injectCSS() {
    if ($('tchiloPhoneCSS')) return;
    var sys = 'system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif';
    var arrow = "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%239B9BA3' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'><path d='M6 9l6 6 6-6'/></svg>\")";
    var st = document.createElement('style');
    st.id = 'tchiloPhoneCSS';
    st.textContent = [
      /* separador E-mail | Telemóvel */
      '.ph-modes{display:flex;gap:8px;margin:0 0 16px}',
      '.ph-mode{flex:1;height:42px;border-radius:999px;border:1.5px solid rgba(11,11,12,.14);background:transparent;color:var(--ink,#0B0B0C);font:600 15px ' + sys + ';cursor:pointer;-webkit-tap-highlight-color:transparent}',
      '.ph-mode.on{background:var(--ink,#0B0B0C);border-color:var(--ink,#0B0B0C);color:var(--paper,#fff)}',
      '.ph-links{display:flex;flex-direction:column;align-items:center}',
      '.ph-links a{cursor:pointer}',
      /* listas de países */
      'html body #loginGate select.login-input,html body #loginGate.panel-open select.login-input,select.tp-in,#tsu select.tsu-in{-webkit-appearance:none;appearance:none;background-repeat:no-repeat!important;background-position:right 16px center!important;background-image:' + arrow + '!important;padding-right:44px!important}',
      /* definições: número de telefone */
      '#tp-body .tp-box{padding:6px 16px 0}',
      '#tp-body .tp-in{display:block;width:100%;height:52px;margin:0 0 12px;padding:0 16px;border:0;border-radius:12px;background:#F3F3F5;color:var(--ink,#0B0B0C);font:500 16px ' + sys + ';box-sizing:border-box}',
      '#tp-body .tp-err{min-height:20px;margin:0 0 8px;font:500 13.5px ' + sys + ';color:#E11D48}',
      '#tp-body .tp-err.ok{color:#15803D}',
      '#tp-body .tp-btn{display:block;width:100%;height:50px;border:0;border-radius:999px;background:var(--ink,#0B0B0C);color:var(--paper,#fff);font:700 16px ' + sys + ';cursor:pointer;margin:4px 0 0}',
      '#tp-body .tp-btn:disabled{opacity:.5}',
      '#tp-body .tp-link{display:block;margin:14px auto 0;border:0;background:transparent;color:var(--ink,#0B0B0C);font:600 15px ' + sys + ';padding:8px 12px;cursor:pointer}',
      '#tp-body .tp-link:disabled{opacity:.5}',
      '#tp-body .tm-note,#screen-settings-phone .tm-note{padding:10px 16px 0;font:400 12.5px/1.4 ' + sys + ';color:var(--muted,#6B6B70)}',
      '#screen-settings-phone .settings-item .tm-value,#screen-settings-account .settings-item .tm-value{flex:0 0 auto;font-size:14px;font-weight:500;color:var(--muted,#6B6B70)}'
    ].join('\n');
    (document.head || document.documentElement).appendChild(st);
  }

  /* ---------- cooldown de reenvio ---------- */
  function startCooldown(state, linkEl, idleText) {
    clearInterval(state.t);
    state.cool = 30;
    function paint() {
      if (!linkEl) return;
      if (state.cool > 0) {
        linkEl.textContent = tr(idleText) + ' (' + state.cool + 's)';
        linkEl.setAttribute('data-wait', '1');
        if (linkEl.tagName === 'BUTTON') linkEl.disabled = true;
      } else {
        linkEl.textContent = tr(idleText);
        linkEl.removeAttribute('data-wait');
        if (linkEl.tagName === 'BUTTON') linkEl.disabled = false;
      }
    }
    paint();
    state.t = setInterval(function () {
      state.cool--;
      if (state.cool <= 0) clearInterval(state.t);
      paint();
    }, 1000);
  }

  /* =====================================================================
   * ENTRAR (#accessPanel)
   * ===================================================================== */
  var LG = { phone: false, sub: 'pass', step: 'num', num: '', busy: false, cool: 0, t: null };

  function loginBtn() { return document.querySelector('#accessPanel button[type="submit"]'); }
  function loginErr(msg, ok) {
    var e = $('loginError');
    if (!e) return;
    e.textContent = msg || '';
    e.style.color = ok ? '#15803D' : '';
  }

  function applyLogin() {
    var p = LG.phone, num = LG.step === 'num';
    show('loginIdentifier', !p);
    show('phBox', p && num);
    show('loginPassword', !p || (num && LG.sub === 'pass'));
    show('phCode', p && !num);
    show('phAlt', p && num);
    show('phResend', p && !num);
    var em = $('phModeEmail'), ph = $('phModePhone');
    if (em) em.classList.toggle('on', !p);
    if (ph) ph.classList.toggle('on', p);
    var b = loginBtn();
    if (b) {
      b.disabled = false;
      b.textContent = tr(!p ? 'Entrar' : (num ? (LG.sub === 'pass' ? 'Entrar' : 'Receber código') : 'Confirmar'));
    }
    var alt = $('phAlt');
    if (alt) alt.textContent = tr(LG.sub === 'pass' ? 'Entrar com código SMS' : 'Entrar com palavra-passe');
    var pw = $('loginPassword');
    if (pw) pw.setAttribute('autocomplete', 'current-password');
  }

  function resetLogin(toPhone, prefillPhone) {
    clearInterval(LG.t);
    LG = { phone: !!toPhone, sub: 'pass', step: 'num', num: '', busy: false, cool: 0, t: null };
    fillSelect($('phCc'), guessCc());
    var n = $('phNum'); if (n) n.value = '';
    var c = $('phCode'); if (c) c.value = '';
    loginErr('');
    if (toPhone && prefillPhone) {
      var s = onlyDigits(prefillPhone);
      var d = dials(), match = null;
      Object.keys(d).forEach(function (cc) {
        if (s.indexOf(d[cc]) === 0 && (!match || d[cc].length > d[match].length)) match = cc;
      });
      if (match) { $('phCc').value = match; n.value = s.slice(d[match].length); }
    }
    applyLogin();
  }

  async function phoneLoginSubmit(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (LG.busy) return;
    var b = loginBtn();
    loginErr('');
    var c = sb();
    if (!c) { loginErr(tr('Sem ligação ao servidor. Tenta novamente.')); return; }

    if (LG.step === 'code') {
      var code = onlyDigits($('phCode').value);
      if (code.length < 4) { loginErr(tr('Digita o código que recebeste por SMS.')); return; }
      LG.busy = true; if (b) b.disabled = true;
      var v = await verifyOtp(LG.num, code, 'sms').catch(function (x) { return { error: x }; });
      LG.busy = false; if (b) b.disabled = false;
      if (v.error || !(v.data && v.data.session)) {
        loginErr(err2text(v.error || {}, 'Código inválido ou expirado. Verifica-o ou recebe um novo código.'));
        return;
      }
      afterLogin();
      return;
    }

    var r = parse($('phCc').value, $('phNum').value);
    if (!r.ok) { loginErr(tr(r.error)); return; }

    if (LG.sub === 'pass') {
      var pw = $('loginPassword').value;
      if (!pw) { loginErr(tr('Preenche os dois campos.')); return; }
      LG.busy = true; if (b) b.disabled = true;
      var res = await c.auth.signInWithPassword({ phone: r.phone, password: pw }).catch(function (x) { return { error: x }; });
      LG.busy = false; if (b) b.disabled = false;
      if (res.error || !(res.data && res.data.session)) {
        loginErr(err2text(res.error || {}, 'Não foi possível iniciar sessão. Tenta novamente.'));
        return;
      }
      afterLogin();
      return;
    }

    /* código SMS */
    LG.busy = true; if (b) b.disabled = true;
    var s = await sendOtp(r.phone, false).catch(function (x) { return { error: x }; });
    LG.busy = false; if (b) b.disabled = false;
    if (s.error) { loginErr(err2text(s.error, 'Não foi possível enviar o SMS. Tenta novamente.')); return; }
    LG.num = r.phone;
    LG.step = 'code';
    $('phCode').value = '';
    applyLogin();
    loginErr(tr('Enviámos um código por SMS para') + ' ' + mask(r.phone) + '.', true);
    startCooldown(LG, $('phResend'), 'Receber novo código');
    setTimeout(function () { var cEl = $('phCode'); if (cEl) cEl.focus(); }, 60);
  }

  function afterLogin() {
    window.__tchiloJustLoggedIn = true;
    setTimeout(function () { window.__tchiloJustLoggedIn = false; }, 4000);
    try { if (typeof tchiloSyncAuthSession === 'function') tchiloSyncAuthSession(); } catch (e) {}
  }

  async function loginResend(ev) {
    if (ev && ev.preventDefault) ev.preventDefault();
    if (!LG.num || LG.cool > 0 || LG.busy) return false;
    LG.busy = true;
    var s = await sendOtp(LG.num, false).catch(function (x) { return { error: x }; });
    LG.busy = false;
    if (s.error) { loginErr(err2text(s.error, 'Não foi possível enviar o SMS. Tenta novamente.')); return false; }
    $('phCode').value = '';
    loginErr(tr('Enviámos um novo código por SMS.'), true);
    startCooldown(LG, $('phResend'), 'Receber novo código');
    return false;
  }

  function wireLogin() {
    var form = document.querySelector('#accessPanel form.login-form');
    if (!form || $('phModes')) return;
    var modes = document.createElement('div');
    modes.className = 'ph-modes'; modes.id = 'phModes';
    modes.innerHTML =
      '<button type="button" class="ph-mode on" id="phModeEmail">' + tr('E-mail') + '</button>' +
      '<button type="button" class="ph-mode" id="phModePhone">' + tr('Telemóvel') + '</button>';
    form.insertBefore(modes, form.firstChild);

    var box = document.createElement('div');
    box.id = 'phBox'; box.style.display = 'none';
    box.innerHTML =
      '<select class="login-input" id="phCc" aria-label="País"></select>' +
      '<input class="login-input" id="phNum" type="tel" inputmode="tel" autocomplete="tel-national" maxlength="16" aria-label="Número de telefone" placeholder="' + tr('Número de telefone') + '">';
    var pw = $('loginPassword');
    form.insertBefore(box, pw);

    var code = document.createElement('input');
    code.className = 'login-input'; code.id = 'phCode'; code.type = 'text';
    code.setAttribute('inputmode', 'numeric'); code.setAttribute('autocomplete', 'one-time-code');
    code.maxLength = 8; code.setAttribute('aria-label', 'Código SMS');
    code.placeholder = tr('Código recebido por SMS'); code.style.display = 'none';
    form.insertBefore(code, $('loginError'));

    var links = document.createElement('div');
    links.className = 'ph-links';
    links.innerHTML =
      '<a class="login-forgot" href="#" id="phAlt" style="display:none"></a>' +
      '<a class="login-forgot" href="#" id="phResend" style="display:none"></a>';
    form.parentNode.insertBefore(links, form.nextSibling);

    $('phModeEmail').addEventListener('click', function () { resetLogin(false); });
    $('phModePhone').addEventListener('click', function () { resetLogin(true); });
    $('phAlt').addEventListener('click', function (ev) {
      ev.preventDefault();
      LG.sub = LG.sub === 'pass' ? 'sms' : 'pass';
      loginErr(''); applyLogin();
    });
    $('phResend').addEventListener('click', loginResend);
    $('phNum').addEventListener('input', function () { this.value = this.value.replace(/[^\d\s+]/g, ''); });
    $('phCode').addEventListener('input', function () { this.value = this.value.replace(/\D/g, ''); });
    applyLogin();
  }

  /* =====================================================================
   * RECUPERAR (#recoverPanel)
   * ===================================================================== */
  var RG = { phone: false, step: 'num', num: '', busy: false, cool: 0, t: null };
  var RC_TEXT_EMAIL = '';

  function recoverBtn() { return $('recoverSubmitBtn'); }
  function recoverErr(msg, ok) {
    var e = $('recoverError');
    if (!e) return;
    e.textContent = msg || '';
    e.style.color = ok ? '#15803D' : '';
  }

  function applyRecover() {
    var p = RG.phone, num = RG.step === 'num';
    show('recoverEmail', !p);
    show('rcBox', p && num);
    show('rcCode', p && !num);
    show('rcResend', p && !num);
    var em = $('rcModeEmail'), ph = $('rcModePhone');
    if (em) em.classList.toggle('on', !p);
    if (ph) ph.classList.toggle('on', p);
    var re = $('recoverEmail');
    if (re) re.required = !p; /* campo escondido com "required" bloquearia o envio */
    var b = recoverBtn();
    if (b) {
      b.disabled = false;
      b.textContent = tr(!p ? 'Enviar link de recuperação' : (num ? 'Receber código' : 'Continuar'));
    }
    var tx = $('rcText');
    if (tx) {
      tx.textContent = !p ? RC_TEXT_EMAIL
        : tr(num ? 'Indica o número da tua conta. Vamos enviar um código por SMS para criares uma nova palavra-passe.'
                 : 'Digita o código que enviámos por SMS.');
    }
  }

  function resetRecover(toPhone) {
    clearInterval(RG.t);
    RG = { phone: !!toPhone, step: 'num', num: '', busy: false, cool: 0, t: null };
    fillSelect($('rcCc'), guessCc());
    var n = $('rcNum'); if (n) n.value = '';
    var c = $('rcCode'); if (c) c.value = '';
    recoverErr('');
    applyRecover();
  }

  async function phoneRecoverSubmit(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (RG.busy) return;
    recoverErr('');
    var b = recoverBtn();

    if (RG.step === 'code') {
      var code = onlyDigits($('rcCode').value);
      if (code.length < 4) { recoverErr(tr('Digita o código que recebeste por SMS.')); return; }
      RG.busy = true; if (b) b.disabled = true;
      /* impede que a app entre na conta: queremos o ecrã da nova palavra-passe */
      window.__tchiloPasswordRecoveryActive = true;
      var v = await verifyOtp(RG.num, code, 'sms').catch(function (x) { return { error: x }; });
      RG.busy = false; if (b) b.disabled = false;
      if (v.error || !(v.data && v.data.session)) {
        window.__tchiloPasswordRecoveryActive = false;
        recoverErr(err2text(v.error || {}, 'Código inválido ou expirado. Verifica-o ou recebe um novo código.'));
        return;
      }
      try { showLoginPanel('recover-new'); } catch (e1) {}
      toast('Escolhe a tua nova palavra-passe');
      return;
    }

    var r = parse($('rcCc').value, $('rcNum').value);
    if (!r.ok) { recoverErr(tr(r.error)); return; }
    RG.busy = true; if (b) b.disabled = true;
    var s = await sendOtp(r.phone, false).catch(function (x) { return { error: x }; });
    RG.busy = false; if (b) b.disabled = false;
    if (s.error) { recoverErr(err2text(s.error, 'Não foi possível enviar o SMS. Tenta novamente.')); return; }
    RG.num = r.phone;
    RG.step = 'code';
    $('rcCode').value = '';
    applyRecover();
    recoverErr(tr('Enviámos um código por SMS para') + ' ' + mask(r.phone) + '.', true);
    startCooldown(RG, $('rcResend'), 'Receber novo código');
    setTimeout(function () { var cEl = $('rcCode'); if (cEl) cEl.focus(); }, 60);
  }

  async function recoverResend(ev) {
    if (ev && ev.preventDefault) ev.preventDefault();
    if (!RG.num || RG.cool > 0 || RG.busy) return false;
    RG.busy = true;
    var s = await sendOtp(RG.num, false).catch(function (x) { return { error: x }; });
    RG.busy = false;
    if (s.error) { recoverErr(err2text(s.error, 'Não foi possível enviar o SMS. Tenta novamente.')); return false; }
    $('rcCode').value = '';
    recoverErr(tr('Enviámos um novo código por SMS.'), true);
    startCooldown(RG, $('rcResend'), 'Receber novo código');
    return false;
  }

  function wireRecover() {
    var form = document.querySelector('#recoverPanel form.login-form');
    if (!form || $('rcModes')) return;
    var p = document.querySelector('#recoverPanel > p');
    if (p) { p.id = 'rcText'; RC_TEXT_EMAIL = p.textContent; }

    var modes = document.createElement('div');
    modes.className = 'ph-modes'; modes.id = 'rcModes';
    modes.innerHTML =
      '<button type="button" class="ph-mode on" id="rcModeEmail">' + tr('E-mail') + '</button>' +
      '<button type="button" class="ph-mode" id="rcModePhone">' + tr('Telemóvel') + '</button>';
    form.insertBefore(modes, form.firstChild);

    var box = document.createElement('div');
    box.id = 'rcBox'; box.style.display = 'none';
    box.innerHTML =
      '<select class="login-input" id="rcCc" aria-label="País"></select>' +
      '<input class="login-input" id="rcNum" type="tel" inputmode="tel" autocomplete="tel-national" maxlength="16" aria-label="Número de telefone" placeholder="' + tr('Número de telefone') + '">';
    form.insertBefore(box, $('recoverError'));

    var code = document.createElement('input');
    code.className = 'login-input'; code.id = 'rcCode'; code.type = 'text';
    code.setAttribute('inputmode', 'numeric'); code.setAttribute('autocomplete', 'one-time-code');
    code.maxLength = 8; code.setAttribute('aria-label', 'Código SMS');
    code.placeholder = tr('Código recebido por SMS'); code.style.display = 'none';
    form.insertBefore(code, $('recoverError'));

    var links = document.createElement('div');
    links.className = 'ph-links';
    links.innerHTML = '<a class="login-forgot" href="#" id="rcResend" style="display:none"></a>';
    form.parentNode.insertBefore(links, form.nextSibling);

    $('rcModeEmail').addEventListener('click', function () { resetRecover(false); });
    $('rcModePhone').addEventListener('click', function () { resetRecover(true); });
    $('rcResend').addEventListener('click', recoverResend);
    $('rcNum').addEventListener('input', function () { this.value = this.value.replace(/[^\d\s+]/g, ''); });
    $('rcCode').addEventListener('input', function () { this.value = this.value.replace(/\D/g, ''); });
    applyRecover();
  }

  /* envolve as funções existentes, só desvia quando o modo telemóvel está ativo */
  function wrapGlobals() {
    if (typeof window.tchiloLogin === 'function' && !window.tchiloLogin.__ph) {
      var origLogin = window.tchiloLogin;
      var wl = function (e) {
        if (LG.phone) return phoneLoginSubmit(e);
        return origLogin.apply(this, arguments);
      };
      wl.__ph = true;
      window.tchiloLogin = wl;
    }
    if (typeof window.submitPasswordRecovery === 'function' && !window.submitPasswordRecovery.__ph) {
      var origRec = window.submitPasswordRecovery;
      var wr = function (e) {
        if (RG.phone) return phoneRecoverSubmit(e);
        return origRec.apply(this, arguments);
      };
      wr.__ph = true;
      window.submitPasswordRecovery = wr;
    }
    if (typeof window.showLoginPanel === 'function' && !window.showLoginPanel.__ph) {
      var origShow = window.showLoginPanel;
      var ws = function (panel) {
        var r = origShow.apply(this, arguments);
        try {
          if (panel === 'access') resetLogin(false);
          if (panel === 'recover') resetRecover(false);
        } catch (e) {}
        return r;
      };
      try { Object.keys(origShow).forEach(function (k) { ws[k] = origShow[k]; }); } catch (e2) {}
      ws.__ph = true;
      window.showLoginPanel = ws;
    }
  }

  /* abre o painel Entrar já no modo telemóvel (usado pelo assistente de registo) */
  window.tchiloPhoneLoginOpen = function (phone) {
    try { showLoginPanel('access'); } catch (e) {}
    resetLogin(true, phone || '');
  };

  /* =====================================================================
   * DEFINIÇÕES → CONTA → NÚMERO DE TELEFONE
   * ===================================================================== */
  var P = { step: 'form', phone: '', verified: false, hasPhone: false, cool: 0, t: null, busy: false, changing: false };

  async function currentUser() {
    try {
      var c = sb();
      if (!c) return null;
      var r = await c.auth.getUser();
      return (r && r.data && r.data.user) || null;
    } catch (e) { return null; }
  }

  async function refreshRow() {
    var el = $('tp-row-value');
    if (!el) return;
    var u = await currentUser();
    var ok = !!(u && u.phone && u.phone_confirmed_at);
    el.textContent = tr(ok ? 'Verificado' : (u && u.phone ? 'Por verificar' : 'Adicionar'));
  }

  function setMsg(msg, ok) {
    var e = $('tpErr');
    if (!e) return;
    e.textContent = msg || '';
    e.classList.toggle('ok', !!ok);
  }

  function renderPhonePage() {
    var body = $('tp-body');
    if (!body) return;
    injectCSS();
    clearInterval(P.t);
    currentUser().then(function (u) {
      P.verified = !!(u && u.phone && u.phone_confirmed_at);
      P.hasPhone = !!(u && u.phone);
      P.step = 'form';
      P.changing = false;
      P.phone = '';
      paintPhonePage(u);
    });
  }

  function paintPhonePage(u) {
    var body = $('tp-body');
    if (!body) return;
    var note = '<p class="tm-note">' + tr('Usamos o teu número para entrares na conta e a recuperares. Não é visível para os outros utilizadores.') + '</p>';
    if (P.step === 'code') {
      body.innerHTML =
        '<p class="tm-note" id="tpSentTo">' + tr('Enviámos um código por SMS para') + ' ' + mask(P.phone) + '.</p>' +
        '<div class="tp-box">' +
        '<input class="tp-in" id="tpCode" type="text" inputmode="numeric" autocomplete="one-time-code" maxlength="8" aria-label="Código SMS" placeholder="' + tr('Código recebido por SMS') + '">' +
        '<div class="tp-err" id="tpErr"></div>' +
        '<button class="tp-btn" type="button" data-tp="verify">' + tr('Verificar') + '</button>' +
        '<button class="tp-link" type="button" data-tp="resend" id="tpResend">' + tr('Receber novo código') + '</button>' +
        '<button class="tp-link" type="button" data-tp="cancel">' + tr('Cancelar') + '</button>' +
        '</div>';
      return;
    }
    if (P.verified && !P.changing) {
      body.innerHTML =
        '<div class="settings-item" data-own-icon="1" style="cursor:default"><span>' + tr('Número verificado') + '</span>' +
        '<span class="tm-value">' + mask(u && u.phone) + '</span></div>' +
        '<button class="settings-item" type="button" data-own-icon="1" data-tp="change"><span>' + tr('Alterar número') + '</span><div class="chev">›</div></button>' +
        note;
      return;
    }
    body.innerHTML =
      '<p class="tm-note">' + tr(P.hasPhone && !P.verified ? 'O teu número ainda não está verificado. Indica-o para receberes o código por SMS.' : 'Adiciona o teu número para o validares com um código por SMS.') + '</p>' +
      '<div class="tp-box">' +
      '<select class="tp-in" id="tpCc" aria-label="País"></select>' +
      '<input class="tp-in" id="tpNum" type="tel" inputmode="tel" autocomplete="tel-national" maxlength="16" aria-label="Número de telefone" placeholder="' + tr('Número de telefone') + '">' +
      '<div class="tp-err" id="tpErr"></div>' +
      '<button class="tp-btn" type="button" data-tp="send">' + tr('Enviar código') + '</button>' +
      (P.changing ? '<button class="tp-link" type="button" data-tp="cancel">' + tr('Cancelar') + '</button>' : '') +
      '</div>' + note;
    fillSelect($('tpCc'), guessCc());
  }

  async function phoneAction(act) {
    if (P.busy) return;
    if (act === 'change') { P.changing = true; P.step = 'form'; paintPhonePage(null); return; }
    if (act === 'cancel') { renderPhonePage(); return; }
    var c = sb();
    if (!c) { setMsg(tr('Sem ligação ao servidor. Tenta novamente.')); return; }

    if (act === 'send' || act === 'resend') {
      var phone = P.phone;
      if (act === 'send') {
        var r = parse($('tpCc').value, $('tpNum').value);
        if (!r.ok) { setMsg(tr(r.error)); return; }
        phone = r.phone;
      }
      if (act === 'resend' && P.cool > 0) return;
      P.busy = true;
      var res = await c.auth.updateUser({ phone: phone }).catch(function (x) { return { error: x }; });
      P.busy = false;
      if (res.error) { setMsg(err2text(res.error, 'Não foi possível enviar o SMS. Tenta novamente.')); return; }
      P.phone = phone;
      if (act === 'send') {
        P.step = 'code';
        paintPhonePage(null);
        startCooldown(P, $('tpResend'), 'Receber novo código');
        var cEl = $('tpCode'); if (cEl) cEl.focus();
      } else {
        setMsg(tr('Enviámos um novo código por SMS.'), true);
        startCooldown(P, $('tpResend'), 'Receber novo código');
      }
      return;
    }

    if (act === 'verify') {
      var code = onlyDigits(($('tpCode') || {}).value);
      if (code.length < 4) { setMsg(tr('Digita o código que recebeste por SMS.')); return; }
      P.busy = true;
      var v = await verifyOtp(P.phone, code, 'phone_change').catch(function (x) { return { error: x }; });
      P.busy = false;
      if (v.error) { setMsg(err2text(v.error, 'Código inválido ou expirado. Verifica-o ou recebe um novo código.')); return; }
      toast('Número verificado');
      refreshRow();
      renderPhonePage();
    }
  }

  function wirePhonePage() {
    var scr = $('screen-settings-phone');
    if (!scr || scr.__tpWired) return;
    scr.__tpWired = true;
    scr.addEventListener('click', function (ev) {
      var b = ev.target.closest ? ev.target.closest('[data-tp]') : null;
      if (b) { ev.preventDefault(); phoneAction(b.getAttribute('data-tp')); }
    });
    scr.addEventListener('input', function (ev) {
      var t0 = ev.target;
      if (t0 && t0.id === 'tpNum') t0.value = t0.value.replace(/[^\d\s+]/g, '');
      if (t0 && t0.id === 'tpCode') t0.value = t0.value.replace(/\D/g, '');
    });
  }

  window.tchiloOpenPhoneSettings = function () {
    if (window.tchiloRequireOnline && !window.tchiloRequireOnline()) return;
    try { goTo('settings-phone'); } catch (e) {}
    renderPhonePage();
  };

  function hookGoTo() {
    if (typeof window.goTo !== 'function' || window.goTo.__tpWrapped) return;
    var orig = window.goTo;
    var wrapped = function (name) {
      var r = orig.apply(this, arguments);
      try {
        if (name === 'settings-account') refreshRow();
        if (name === 'settings-phone') renderPhonePage();
      } catch (e) {}
      return r;
    };
    try { Object.keys(orig).forEach(function (k) { wrapped[k] = orig[k]; }); } catch (e2) {}
    wrapped.__tpWrapped = true;
    window.goTo = wrapped;
  }

  /* ---------- arranque ---------- */
  function boot() {
    injectCSS();
    wireLogin();
    wireRecover();
    wirePhonePage();
    wrapGlobals();
    hookGoTo();
  }

  boot();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  [400, 1500, 3500].forEach(function (ms) { setTimeout(boot, ms); });
})();

/**
 * tchilo-Pop — olho para mostrar / ocultar palavra-passe
 */
(function () {
  'use strict';

  var EYE_OPEN =
    '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/>' +
    '<circle cx="12" cy="12" r="3"/>' +
    '</svg>';

  var EYE_OFF =
    '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 19c-7 0-11-7-11-7a18.45 18.45 0 0 1 5.06-5.94"/>' +
    '<path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 7 11 7a18.5 18.5 0 0 1-2.16 3.19"/>' +
    '<path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/>' +
    '<line x1="1" y1="1" x2="23" y2="23"/>' +
    '</svg>';

  function injectCSS() {
    if (document.getElementById('tchiloPwToggleCSS')) return;
    var st = document.createElement('style');
    st.id = 'tchiloPwToggleCSS';
    st.textContent =
      '.tchilo-pw-wrap{position:relative;display:block;width:100%;}' +
      '.tchilo-pw-wrap input.login-input,' +
      '.tchilo-pw-wrap input[type="password"],' +
      '.tchilo-pw-wrap input[type="text"]{' +
      'width:100%;padding-right:48px!important;box-sizing:border-box;}' +
      '.tchilo-pw-toggle{' +
      'position:absolute;right:10px;top:50%;transform:translateY(-50%);' +
      'width:36px;height:36px;border:0;border-radius:50%;' +
      'background:transparent;color:inherit;opacity:.75;' +
      'display:flex;align-items:center;justify-content:center;' +
      'cursor:pointer;padding:0;z-index:2;}' +
      '.tchilo-pw-toggle:active{opacity:1;}' +
      '.login-card .tchilo-pw-toggle{color:#fff;}' +
      '#screen-editprofile .tchilo-pw-toggle{color:var(--ink,#0B0B0C);}';
    document.head.appendChild(st);
  }

  function enhance(input) {
    if (!input || input.dataset.pwToggle === '1') return;
    if (input.type !== 'password' && input.type !== 'text') return;
    // só campos de senha (ou que já eram password)
    var id = (input.id || '') + ' ' + (input.name || '') + ' ' + (input.autocomplete || '') + ' ' + (input.placeholder || '');
    if (input.type === 'text' && !/pass|senha|palavra/i.test(id) && input.dataset.wasPassword !== '1') return;

    input.dataset.pwToggle = '1';

    var wrap = document.createElement('div');
    wrap.className = 'tchilo-pw-wrap';
    input.parentNode.insertBefore(wrap, input);
    wrap.appendChild(input);

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'tchilo-pw-toggle';
    btn.setAttribute('aria-label', 'Mostrar palavra-passe');
    btn.innerHTML = EYE_OPEN;
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      var show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      input.dataset.wasPassword = '1';
      btn.innerHTML = show ? EYE_OFF : EYE_OPEN;
      btn.setAttribute('aria-label', show ? 'Ocultar palavra-passe' : 'Mostrar palavra-passe');
      try {
        input.focus();
      } catch (err) {}
    });
    wrap.appendChild(btn);
  }

  function scan() {
    injectCSS();
    var ids = [
      'loginPassword',
      'signupPassword',
      'signupPassword2',
      'recoverNewPass',
      'recoverNewPass2',
      'editNewPassword',
      'editNewPassword2'
    ];
    ids.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) enhance(el);
    });
    document.querySelectorAll('input[type="password"]').forEach(enhance);
  }

  function boot() {
    scan();
    setTimeout(scan, 400);
    setTimeout(scan, 1200);
    // quando painéis de login mudam
    try {
      var gate = document.querySelector('.login-gate, #loginGate, .login-card');
      if (gate && !gate.__pwObs) {
        gate.__pwObs = true;
        new MutationObserver(function () {
          scan();
        }).observe(gate, { childList: true, subtree: true, attributes: true });
      }
    } catch (e) {}
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();

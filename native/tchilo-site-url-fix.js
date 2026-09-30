/**
 * Tchilo — corrige Site URL errada (github.io → tchilopop.com)
 * O index ainda tinha TCHILO_SITE_URL = github.io/tchilo-Pop/
 * Isso fazia o email de recuperação abrir no sítio errado.
 */
(function () {
  'use strict';
  if (window.__tchiloSiteUrlFix) return;
  window.__tchiloSiteUrlFix = true;

  var CORRECT = 'https://tchilopop.com';

  try {
    window.TCHILO_SITE_URL = CORRECT;
  } catch (e) {}

  try {
    /* sobrescreve const global se estiver no escopo window */
    Object.defineProperty(window, 'TCHILO_SITE_URL', {
      value: CORRECT,
      writable: true,
      configurable: true
    });
  } catch (e2) {
    window.TCHILO_SITE_URL = CORRECT;
  }

  /* Patch resetPasswordForEmail para NUNCA usar github.io */
  function patchSB() {
    var SB = window.tchiloSupabase;
    if (!SB || !SB.auth || SB.auth.__siteUrlFixed) return;
    var orig = SB.auth.resetPasswordForEmail.bind(SB.auth);
    SB.auth.resetPasswordForEmail = function (email, opts) {
      opts = opts || {};
      var rt = opts.redirectTo || '';
      if (
        !rt ||
        /github\.io/i.test(rt) ||
        /zacariasguilhermejoao/i.test(rt) ||
        rt === '/' ||
        rt.indexOf('tchilopop.com') < 0
      ) {
        opts.redirectTo = CORRECT + '/redefinir-senha';
      } else if (rt.indexOf('/redefinir-senha') < 0) {
        opts.redirectTo = rt.replace(/\/?$/, '') + '/redefinir-senha';
      }
      return orig(email, opts);
    };
    SB.auth.__siteUrlFixed = true;
  }

  patchSB();
  setTimeout(patchSB, 200);
  setTimeout(patchSB, 1000);
  setTimeout(patchSB, 3000);
})();

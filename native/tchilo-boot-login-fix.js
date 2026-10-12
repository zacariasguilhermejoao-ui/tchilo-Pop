/* tchilo-boot-login-fix — boot único + login clicável (app/browser) */
(function(){
  if (window.__tchiloBootLoginFix) return;
  window.__tchiloBootLoginFix = true;

  /* CSS: botões Entrar/Criar conta sempre clicáveis */
  try {
    var st = document.createElement('style');
    st.id = 'tchilo-login-click-fix';
    st.textContent = [
      '#loginGate,#loginGate *{pointer-events:auto!important}',
      '#loginGate .login-video,#loginGate .login-video-overlay{pointer-events:none!important}',
      '#loginGate .login-choice button,#loginGate .login-create,#loginGate button[onclick*="showLoginPanel"]{pointer-events:auto!important;z-index:5!important;position:relative!important;touch-action:manipulation!important}',
      '#loginGate.hidden,#loginGate.hidden *{pointer-events:none!important}',
      'body:not(.tchilo-session-on) #tchiloBusy{display:none!important;pointer-events:none!important}'
    ].join('');
    (document.head || document.documentElement).appendChild(st);
  } catch (e) {}

  /* showLoginPanel: esconder busy antes de abrir painel */
  var _show = window.showLoginPanel;
  if (typeof _show === 'function') {
    window.showLoginPanel = function(panel) {
      try { if (typeof tchiloHideBusy === 'function') tchiloHideBusy(); } catch (e) {}
      return _show.apply(this, arguments);
    };
  }

  /* bootApp: uma só execução completa */
  function wrapBoot() {
    var old = window.bootApp;
    if (typeof old !== 'function' || old.__tchiloSingleBoot) return;
    var wrapped = function() {
      if (window.__tchiloBootOnce) {
        try { return old.apply(this, arguments); } catch (e) { console.error(e); }
        return;
      }
      window.__tchiloBootOnce = true;
      try { return old.apply(this, arguments); } catch (e) { console.error(e); }
    };
    wrapped.__tchiloSingleBoot = true;
    window.bootApp = wrapped;
  }
  wrapBoot();
  setTimeout(wrapBoot, 0);
  setTimeout(wrapBoot, 500);
})();

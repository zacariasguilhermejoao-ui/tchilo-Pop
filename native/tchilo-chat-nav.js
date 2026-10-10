/**
 * Tchilo chat nav
 * botão voltar funcional · deslizar para a direita sai da conversa
 */
(function () {
  'use strict';
  if (window.__tchiloChatNavV1) return;
  window.__tchiloChatNavV1 = true;

  function close() {
    try {
      if (typeof window.closeChat === 'function') {
        window.closeChat();
      } else {
        var cs = document.getElementById('chatScreen');
        if (cs) cs.classList.remove('open');
        window.currentChatUser = null;
        if (typeof renderMessages === 'function') renderMessages();
      }
    } catch (e) {
      try {
        var s = document.getElementById('chatScreen');
        if (s) {
          s.classList.remove('open');
          s.style.display = 'none';
        }
      } catch (e2) {}
    }
    try {
      document.body.classList.remove('tchilo-chat-open');
    } catch (e3) {}
  }

  window.tchiloCloseChat = close;

  function injectCSS() {
    var st = document.getElementById('tchiloChatNavCSS');
    if (!st) {
      st = document.createElement('style');
      st.id = 'tchiloChatNavCSS';
      (document.head || document.documentElement).appendChild(st);
    }
    st.textContent =
      'html body #chatScreen .chat-header .back-btn,' +
      'html body #chatScreen button.back-btn{' +
      'pointer-events:auto!important;z-index:30!important;position:relative!important;' +
      'min-width:40px!important;min-height:40px!important;' +
      'display:inline-flex!important;align-items:center!important;justify-content:center!important;' +
      'background:transparent!important;border:0!important;cursor:pointer!important;}' +
      'html body #chatScreen.open{display:flex!important;}' +
      'html body #chatScreen:not(.open){display:none!important;}';
  }

  function wireBack() {
    var screen = document.getElementById('chatScreen');
    if (!screen) return;
    var btn =
      screen.querySelector('.chat-header .back-btn') ||
      screen.querySelector('button.back-btn') ||
      screen.querySelector('.chat-header button');
    if (!btn || btn.__navBackV1) return;
    btn.__navBackV1 = true;
    btn.setAttribute('aria-label', 'Voltar');
    btn.addEventListener(
      'click',
      function (e) {
        e.preventDefault();
        e.stopPropagation();
        close();
      },
      true
    );
    btn.addEventListener(
      'touchend',
      function (e) {
        e.preventDefault();
        e.stopPropagation();
        close();
      },
      { capture: true, passive: false }
    );
  }

  function wireSwipe() {
    var screen = document.getElementById('chatScreen');
    if (!screen || screen.__navSwipeV1) return;
    screen.__navSwipeV1 = true;

    var startX = 0,
      startY = 0,
      tracking = false,
      dx = 0;

    screen.addEventListener(
      'touchstart',
      function (e) {
        if (!screen.classList.contains('open')) return;
        var t = e.touches && e.touches[0];
        if (!t) return;
        /* começa perto da borda esquerda (gesto iOS) ou em qualquer sítio horizontal */
        if (t.clientX > 48 && t.clientX > window.innerWidth * 0.25) {
          tracking = false;
          return;
        }
        startX = t.clientX;
        startY = t.clientY;
        dx = 0;
        tracking = true;
      },
      { passive: true }
    );

    screen.addEventListener(
      'touchmove',
      function (e) {
        if (!tracking) return;
        var t = e.touches && e.touches[0];
        if (!t) return;
        dx = t.clientX - startX;
        var dy = Math.abs(t.clientY - startY);
        if (dy > 40 && dy > Math.abs(dx)) {
          tracking = false;
          screen.style.transform = '';
          return;
        }
        if (dx > 0) {
          screen.style.transition = 'none';
          screen.style.transform = 'translateX(' + Math.min(dx, window.innerWidth) + 'px)';
        }
      },
      { passive: true }
    );

    function end() {
      if (!tracking) {
        screen.style.transform = '';
        return;
      }
      tracking = false;
      screen.style.transition = 'transform .22s ease';
      if (dx > 80) {
        screen.style.transform = 'translateX(100%)';
        setTimeout(function () {
          screen.style.transform = '';
          screen.style.transition = '';
          close();
        }, 200);
      } else {
        screen.style.transform = '';
        setTimeout(function () {
          screen.style.transition = '';
        }, 220);
      }
      dx = 0;
    }

    screen.addEventListener('touchend', end, { passive: true });
    screen.addEventListener('touchcancel', end, { passive: true });
  }

  function init() {
    injectCSS();
    wireBack();
    wireSwipe();
  }

  init();
  [200, 800, 2000].forEach(function (ms) {
    setTimeout(init, ms);
  });
  try {
    new MutationObserver(function () {
      wireBack();
    }).observe(document.body || document.documentElement, {
      childList: true,
      subtree: true
    });
  } catch (e) {}
})();

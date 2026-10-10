/**
 * Chat msg actions v2 — hold 1s · swipe · sem Cancelar
 */
(function () {
  'use strict';
  if (window.__tchiloChatMsgActionsV2) return;
  window.__tchiloChatMsgActionsV2 = true;

  var HOLD_MS = 1000;

  function injectCSS() {
    var st = document.getElementById('tchiloChatMsgActCSS');
    if (!st) {
      st = document.createElement('style');
      st.id = 'tchiloChatMsgActCSS';
      (document.head || document.documentElement).appendChild(st);
    }
    st.textContent =
      '#tchiloMsgActSheet{position:fixed;inset:0;z-index:2147483645;display:none;align-items:flex-end;justify-content:center;background:rgba(11,11,12,.4);}' +
      '#tchiloMsgActSheet.open{display:flex!important;}' +
      '#tchiloMsgActSheet .panel{width:100%;max-width:420px;background:var(--paper,#F6F1E7);border-radius:20px 20px 0 0;' +
      'padding:12px 14px calc(16px + env(safe-area-inset-bottom));box-shadow:0 -8px 28px rgba(0,0,0,.12);transition:transform .2s;}' +
      '#tchiloMsgActSheet .handle{width:40px;height:4px;background:#c8c5bc;border-radius:2px;margin:4px auto 12px;}' +
      '#tchiloMsgActSheet button{display:block;width:100%;text-align:left;padding:14px 12px;border:0;' +
      'border-bottom:1px solid rgba(11,11,12,.06);background:transparent;font:700 15px system-ui,sans-serif;color:#0B0B0C;cursor:pointer;}' +
      '#tchiloMsgActSheet button.danger{color:#c62828;}' +
      '#tchiloMsgActSheet button:last-child{border-bottom:0;}' +
      '#chatBody .bubble{touch-action:manipulation;-webkit-user-select:none;user-select:none;}';
  }

  function getThread() {
    try {
      if (typeof getChats !== 'function' || !window.currentChatUser) return null;
      return getChats()[window.currentChatUser] || null;
    } catch (e) {
      return null;
    }
  }

  function saveThread(thread) {
    try {
      var chats = getChats();
      chats[window.currentChatUser] = thread;
      if (typeof saveChats === 'function') saveChats(chats);
      if (window.tchiloCloud && typeof window.tchiloCloud.syncNormalized === 'function') {
        window.tchiloCloud.syncNormalized('chats', chats);
      }
    } catch (e) {}
  }

  function closeSheet() {
    var el = document.getElementById('tchiloMsgActSheet');
    if (el) el.classList.remove('open');
  }

  function openActions(index, isMine) {
    injectCSS();
    var sheet = document.getElementById('tchiloMsgActSheet');
    if (!sheet) {
      sheet = document.createElement('div');
      sheet.id = 'tchiloMsgActSheet';
      document.body.appendChild(sheet);
    }
    var html =
      '<div class="panel"><div class="handle"></div>' +
      '<button type="button" data-a="me">Apagar para mim</button>';
    if (isMine) {
      html += '<button type="button" class="danger" data-a="all">Apagar para todos</button>';
    }
    html += '</div>';
    sheet.innerHTML = html;

    sheet.onclick = function (e) {
      if (e.target === sheet) {
        closeSheet();
        return;
      }
      var b = e.target.closest('[data-a]');
      if (!b) return;
      var a = b.getAttribute('data-a');
      var thread = getThread();
      if (!thread || index < 0 || index >= thread.length) {
        closeSheet();
        return;
      }
      if (a === 'me' || a === 'all') {
        thread.splice(index, 1);
        saveThread(thread);
        try {
          if (typeof renderChatBody === 'function') renderChatBody();
        } catch (err) {}
        try {
          if (typeof showToast === 'function') showToast('Mensagem apagada');
        } catch (e2) {}
      }
      closeSheet();
    };

    var panel = sheet.querySelector('.panel');
    var startY = 0,
      dy = 0;
    if (panel && !panel.__swipe) {
      panel.__swipe = true;
      panel.addEventListener(
        'touchstart',
        function (e) {
          if (e.touches[0]) startY = e.touches[0].clientY;
          dy = 0;
        },
        { passive: true }
      );
      panel.addEventListener(
        'touchmove',
        function (e) {
          if (!e.touches[0]) return;
          dy = e.touches[0].clientY - startY;
          if (dy > 0) panel.style.transform = 'translateY(' + dy + 'px)';
        },
        { passive: true }
      );
      panel.addEventListener(
        'touchend',
        function () {
          if (dy > 70) closeSheet();
          panel.style.transform = '';
          dy = 0;
        },
        { passive: true }
      );
    }

    sheet.classList.add('open');
  }

  function bindBubbles() {
    var body = document.getElementById('chatBody');
    if (!body || body.__msgActBoundV2) return;
    body.__msgActBoundV2 = true;

    var timer = null;
    var startX = 0,
      startY = 0;
    var target = null;

    function clear() {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      target = null;
    }

    body.addEventListener(
      'touchstart',
      function (e) {
        var bubble = e.target.closest && e.target.closest('.bubble');
        if (!bubble) return;
        var t = e.touches && e.touches[0];
        if (!t) return;
        startX = t.clientX;
        startY = t.clientY;
        target = bubble;
        timer = setTimeout(function () {
          if (!target) return;
          var bubbles = body.querySelectorAll('.bubble');
          var idx = -1;
          for (var i = 0; i < bubbles.length; i++) {
            if (bubbles[i] === target) {
              idx = i;
              break;
            }
          }
          if (idx < 0) return;
          openActions(idx, target.classList.contains('me'));
          try {
            if (navigator.vibrate) navigator.vibrate(10);
          } catch (err) {}
        }, HOLD_MS);
      },
      { passive: true }
    );
    body.addEventListener(
      'touchmove',
      function (e) {
        if (!timer) return;
        var t = e.touches && e.touches[0];
        if (!t) return;
        if (Math.abs(t.clientX - startX) > 12 || Math.abs(t.clientY - startY) > 12) clear();
      },
      { passive: true }
    );
    body.addEventListener('touchend', clear, { passive: true });
    body.addEventListener('touchcancel', clear, { passive: true });
  }

  function patchRender() {
    if (typeof window.renderChatBody !== 'function') return;
    if (window.renderChatBody.__msgActV2) return;
    var orig = window.renderChatBody;
    window.renderChatBody = function () {
      var r = orig.apply(this, arguments);
      setTimeout(function () {
        var body = document.getElementById('chatBody');
        if (body) body.__msgActBoundV2 = false;
        bindBubbles();
      }, 30);
      return r;
    };
    window.renderChatBody.__msgActV2 = true;
  }

  injectCSS();
  bindBubbles();
  patchRender();
  setTimeout(patchRender, 600);
  setTimeout(bindBubbles, 800);
})();

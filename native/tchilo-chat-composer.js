/**
 * Tchilo — compositor de chat sempre visível
 * + Anexar, GIF, Figurinhas, Áudio, Enviar
 * v1
 */
(function () {
  'use strict';
  if (window.__tchiloChatComposerV1) return;
  window.__tchiloChatComposerV1 = true;

  function toast(msg) {
    try {
      if (typeof showToast === 'function') showToast(String(msg));
    } catch (e) {}
  }

  function injectCSS() {
    var st = document.getElementById('tchiloChatComposerCSS');
    if (!st) {
      st = document.createElement('style');
      st.id = 'tchiloChatComposerCSS';
      document.head.appendChild(st);
    }
    st.textContent =
      '#chatScreen.chat-screen.open{' +
      'display:flex!important;flex-direction:column!important;' +
      'z-index:2147483000!important;position:fixed!important;inset:0!important;}' +
      '#chatScreen .chat-input-bar,' +
      '#chatScreen .tchilo-chat-bar{' +
      'display:flex!important;align-items:center!important;gap:8px!important;' +
      'padding:10px 12px calc(10px + env(safe-area-inset-bottom,0px))!important;' +
      'border-top:3px solid var(--line,#E6E2D6)!important;' +
      'background:var(--paper,#F3F1E9)!important;' +
      'flex-shrink:0!important;visibility:visible!important;opacity:1!important;' +
      'position:relative!important;z-index:20!important;min-height:56px!important;}' +
      '#chatScreen .chat-input-bar input,' +
      '#chatScreen #chatInput{' +
      'display:block!important;flex:1!important;visibility:visible!important;' +
      'opacity:1!important;min-height:42px!important;' +
      'border:2.5px solid var(--ink,#0B0B0C)!important;border-radius:20px!important;' +
      'padding:10px 14px!important;font:500 14px Inter,system-ui,sans-serif!important;' +
      'background:#fff!important;color:var(--ink,#0B0B0C)!important;}' +
      '#chatScreen .chat-send,' +
      '#chatScreen .chat-attach-btn,' +
      '#chatScreen .tchilo-chat-tool{' +
      'display:inline-flex!important;align-items:center!important;justify-content:center!important;' +
      'visibility:visible!important;opacity:1!important;flex-shrink:0!important;' +
      'width:42px!important;height:42px!important;border-radius:50%!important;' +
      'border:2.5px solid var(--ink,#0B0B0C)!important;background:var(--paper,#F3F1E9)!important;' +
      'cursor:pointer!important;color:var(--ink,#0B0B0C)!important;}' +
      '#chatScreen .chat-send{background:var(--mint,#7DFFB3)!important;}' +
      'body.tchilo-chat-open .navbar,' +
      'body.tchilo-chat-open nav.navbar{' +
      'display:none!important;visibility:hidden!important;}' +
      '#tchiloStickerSheet,#tchiloGifSheet{' +
      'position:fixed;inset:0;z-index:2147483600;display:none;' +
      'align-items:flex-end;justify-content:center;background:rgba(0,0,0,.45);}' +
      '#tchiloStickerSheet.open,#tchiloGifSheet.open{display:flex!important;}' +
      '#tchiloStickerSheet .panel,#tchiloGifSheet .panel{' +
      'width:100%;max-width:480px;max-height:70vh;overflow:auto;' +
      'background:var(--paper,#F3F1E9);border-radius:20px 20px 0 0;' +
      'border:3px solid var(--ink,#0B0B0C);border-bottom:0;padding:14px 12px 20px;}' +
      '#tchiloStickerSheet .grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;}' +
      '#tchiloStickerSheet .grid button{' +
      'aspect-ratio:1;border:2.5px solid var(--ink,#0B0B0C);border-radius:14px;' +
      'background:#fff;cursor:pointer;font-size:28px;}' +
      '#tchiloGifSheet .gif-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;}' +
      '#tchiloGifSheet .gif-grid img{width:100%;border-radius:12px;border:2px solid var(--ink);cursor:pointer;}' +
      '#tchiloGifSheet input{width:100%;padding:10px 12px;border:2.5px solid var(--ink);' +
      'border-radius:12px;margin-bottom:10px;font:600 14px Inter,system-ui,sans-serif;}';
  }

  function markChatOpen(on) {
    try {
      document.body.classList.toggle('tchilo-chat-open', !!on);
    } catch (e) {}
  }

  function ensureComposer() {
    injectCSS();
    var screen = document.getElementById('chatScreen');
    if (!screen) return;

    var bar = screen.querySelector('.chat-input-bar');
    if (!bar) {
      bar = document.createElement('div');
      bar.className = 'chat-input-bar tchilo-chat-bar';
      bar.innerHTML =
        '<button type="button" class="chat-attach-btn" id="chatAttachBtn" aria-label="Anexar">+</button>' +
        '<button type="button" class="tchilo-chat-tool" id="tchiloChatGifBtn" aria-label="GIF">GIF</button>' +
        '<button type="button" class="tchilo-chat-tool" id="tchiloChatStickerBtn" aria-label="Figurinhas">★</button>' +
        '<input type="text" id="chatInput" placeholder="Mensagem…"/>' +
        '<button type="button" class="tchilo-chat-tool" id="tchiloChatAudioBtn" aria-label="Áudio">🎙</button>' +
        '<button type="button" class="chat-send" aria-label="Enviar">➤</button>';
      screen.appendChild(bar);
    }

    /* garantir input e botões mesmo se o HTML original perdeu filhos */
    if (!document.getElementById('chatInput')) {
      var inp = document.createElement('input');
      inp.type = 'text';
      inp.id = 'chatInput';
      inp.placeholder = 'Mensagem…';
      bar.appendChild(inp);
    }
    if (!document.getElementById('chatAttachBtn')) {
      var at = document.createElement('button');
      at.type = 'button';
      at.className = 'chat-attach-btn';
      at.id = 'chatAttachBtn';
      at.textContent = '+';
      bar.insertBefore(at, bar.firstChild);
    }

    /* ferramentas extra */
    if (!document.getElementById('tchiloChatGifBtn')) {
      var g = document.createElement('button');
      g.type = 'button';
      g.className = 'tchilo-chat-tool';
      g.id = 'tchiloChatGifBtn';
      g.textContent = 'GIF';
      g.setAttribute('aria-label', 'GIF');
      var input = document.getElementById('chatInput');
      if (input) bar.insertBefore(g, input);
      else bar.appendChild(g);
    }
    if (!document.getElementById('tchiloChatStickerBtn')) {
      var s = document.createElement('button');
      s.type = 'button';
      s.className = 'tchilo-chat-tool';
      s.id = 'tchiloChatStickerBtn';
      s.innerHTML =
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="3" width="18" height="18" rx="4"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><circle cx="9" cy="10" r="1.2" fill="currentColor"/><circle cx="15" cy="10" r="1.2" fill="currentColor"/></svg>';
      s.setAttribute('aria-label', 'Figurinhas');
      var input2 = document.getElementById('chatInput');
      if (input2) bar.insertBefore(s, input2);
      else bar.appendChild(s);
    }
    if (!document.getElementById('tchiloChatAudioBtn')) {
      var a = document.createElement('button');
      a.type = 'button';
      a.className = 'tchilo-chat-tool';
      a.id = 'tchiloChatAudioBtn';
      a.innerHTML =
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>';
      a.setAttribute('aria-label', 'Áudio');
      var send = bar.querySelector('.chat-send');
      if (send) bar.insertBefore(a, send);
      else bar.appendChild(a);
    }

    wireButtons();
    bar.style.display = 'flex';
  }

  function wireButtons() {
    var attach = document.getElementById('chatAttachBtn');
    if (attach && !attach.__wiredV1) {
      attach.__wiredV1 = true;
      attach.onclick = function (e) {
        e.preventDefault();
        if (typeof openChatAttachMenu === 'function') openChatAttachMenu();
        else toast('Anexar indisponível');
      };
    }
    var send = document.querySelector('#chatScreen .chat-send');
    if (send && !send.__wiredV1) {
      send.__wiredV1 = true;
      send.onclick = function (e) {
        e.preventDefault();
        if (typeof sendChat === 'function') sendChat();
      };
    }
    var input = document.getElementById('chatInput');
    if (input && !input.__wiredV1) {
      input.__wiredV1 = true;
      input.onkeydown = function (e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          if (typeof sendChat === 'function') sendChat();
        }
      };
    }
    var gif = document.getElementById('tchiloChatGifBtn');
    if (gif && !gif.__wiredV1) {
      gif.__wiredV1 = true;
      gif.onclick = function (e) {
        e.preventDefault();
        openGifSheet();
      };
    }
    var st = document.getElementById('tchiloChatStickerBtn');
    if (st && !st.__wiredV1) {
      st.__wiredV1 = true;
      st.onclick = function (e) {
        e.preventDefault();
        openStickerSheet();
      };
    }
    var au = document.getElementById('tchiloChatAudioBtn');
    if (au && !au.__wiredV1) {
      au.__wiredV1 = true;
      au.onclick = function (e) {
        e.preventDefault();
        if (typeof startChatAudioRecord === 'function') startChatAudioRecord();
        else toast('Áudio indisponível');
      };
    }
  }

  function sendStickerOrGif(payload) {
    if (!window.currentChatUser) {
      toast('Abre uma conversa');
      return;
    }
    try {
      if (typeof getChats === 'function' && typeof saveChats === 'function') {
        var chats = getChats();
        if (!chats[currentChatUser]) chats[currentChatUser] = [];
        chats[currentChatUser].push({
          from: 'me',
          text: payload.text || '',
          type: payload.type || 'sticker',
          mediaUrl: payload.url || null,
          createdAt: Date.now()
        });
        saveChats(chats);
        if (typeof renderChatBody === 'function') renderChatBody();
        /* cloud best-effort */
        try {
          if (window.tchiloCloud && typeof window.tchiloCloud.sendMessage === 'function') {
            window.tchiloCloud.sendMessage(currentChatUser, payload.text || '', payload);
          }
        } catch (e2) {}
        return;
      }
    } catch (e) {}
    /* fallback: meter no input e enviar */
    var input = document.getElementById('chatInput');
    if (input) {
      input.value = payload.text || payload.url || '';
      if (typeof sendChat === 'function') sendChat();
    }
  }

  function openStickerSheet() {
    injectCSS();
    var sheet = document.getElementById('tchiloStickerSheet');
    if (!sheet) {
      sheet = document.createElement('div');
      sheet.id = 'tchiloStickerSheet';
      document.body.appendChild(sheet);
    }
    /* Figurinhas SVG (sem emoji) — pack Tchilo */
    var stickers = [
      { id: 'heart', svg: '<svg viewBox="0 0 64 64"><path fill="#FF2D5C" d="M32 56S8 40 8 24a12 12 0 0 1 24-4 12 12 0 0 1 24 4c0 16-24 32-24 32z"/></svg>' },
      { id: 'star', svg: '<svg viewBox="0 0 64 64"><path fill="#C8F560" stroke="#0B0B0C" stroke-width="3" d="M32 8l6 18h18l-14 12 6 18-16-10-16 10 6-18L8 26h18z"/></svg>' },
      { id: 'fire', svg: '<svg viewBox="0 0 64 64"><path fill="#FF8A3D" d="M32 8s8 10 8 20c0 6-4 10-8 10s-8-4-8-10c0-10 8-20 8-20z"/><path fill="#FF2D5C" d="M32 28c6 0 12 6 12 14a12 12 0 1 1-24 0c0-8 6-14 12-14z"/></svg>' },
      { id: 'ok', svg: '<svg viewBox="0 0 64 64"><circle fill="#7DFFB3" stroke="#0B0B0C" stroke-width="3" cx="32" cy="32" r="26"/><path fill="none" stroke="#0B0B0C" stroke-width="5" stroke-linecap="round" d="M18 33l10 10 18-20"/></svg>' },
      { id: 'wow', svg: '<svg viewBox="0 0 64 64"><circle fill="#9ED7FF" stroke="#0B0B0C" stroke-width="3" cx="32" cy="32" r="26"/><circle cx="22" cy="28" r="4" fill="#0B0B0C"/><circle cx="42" cy="28" r="4" fill="#0B0B0C"/><ellipse cx="32" cy="42" rx="8" ry="6" fill="#0B0B0C"/></svg>' },
      { id: 'lol', svg: '<svg viewBox="0 0 64 64"><circle fill="#F800A0" stroke="#0B0B0C" stroke-width="3" cx="32" cy="32" r="26"/><path fill="none" stroke="#0B0B0C" stroke-width="3" d="M20 26c2-4 6-4 8 0M36 26c2-4 6-4 8 0"/><path fill="#0B0B0C" d="M18 36c2 10 26 10 28 0H18z"/></svg>' },
      { id: 'tchilo', svg: '<svg viewBox="0 0 64 64"><circle cx="16" cy="32" r="12" fill="#18E8B0"/><circle cx="32" cy="32" r="12" fill="#F800A0"/><circle cx="48" cy="32" r="12" fill="#7800F8"/></svg>' },
      { id: 'bolt', svg: '<svg viewBox="0 0 64 64"><path fill="#FFD45C" stroke="#0B0B0C" stroke-width="3" d="M36 6L16 34h14L28 58l24-32H38L36 6z"/></svg>' }
    ];
    sheet.innerHTML =
      '<div class="panel"><div style="font:900 18px Inter,sans-serif;margin-bottom:12px">Figurinhas</div>' +
      '<div class="grid">' +
      stickers
        .map(function (s) {
          return (
            '<button type="button" data-st="' +
            s.id +
            '">' +
            s.svg +
            '</button>'
          );
        })
        .join('') +
      '</div>' +
      '<button type="button" style="margin-top:12px;width:100%;padding:12px;border-radius:12px;border:2px solid #0B0B0C;font-weight:800;background:transparent" data-close="1">Fechar</button></div>';
    sheet.classList.add('open');
    sheet.onclick = function (e) {
      if (e.target === sheet || e.target.getAttribute('data-close')) sheet.classList.remove('open');
    };
    sheet.querySelectorAll('[data-st]').forEach(function (b) {
      b.onclick = function () {
        var id = b.getAttribute('data-st');
        var item = stickers.find(function (x) {
          return x.id === id;
        });
        if (!item) return;
        /* data URL do SVG */
        var url =
          'data:image/svg+xml;utf8,' + encodeURIComponent(item.svg);
        sendStickerOrGif({ type: 'sticker', url: url, text: '' });
        sheet.classList.remove('open');
        toast('Figurinha enviada');
      };
    });
  }

  function openGifSheet() {
    injectCSS();
    var sheet = document.getElementById('tchiloGifSheet');
    if (!sheet) {
      sheet = document.createElement('div');
      sheet.id = 'tchiloGifSheet';
      document.body.appendChild(sheet);
    }
    sheet.innerHTML =
      '<div class="panel">' +
      '<div style="font:900 18px Inter,sans-serif;margin-bottom:8px">GIF</div>' +
      '<input type="search" id="tchiloGifSearch" placeholder="Pesquisar GIF…"/>' +
      '<div class="gif-grid" id="tchiloGifGrid"><p style="grid-column:1/-1;font-weight:700;opacity:.7">Escreve para pesquisar (Tenor)</p></div>' +
      '<button type="button" style="margin-top:12px;width:100%;padding:12px;border-radius:12px;border:2px solid #0B0B0C;font-weight:800;background:transparent" data-close="1">Fechar</button>' +
      '</div>';
    sheet.classList.add('open');
    sheet.onclick = function (e) {
      if (e.target === sheet || e.target.getAttribute('data-close')) sheet.classList.remove('open');
    };

    var timer = null;
    var search = document.getElementById('tchiloGifSearch');
    var grid = document.getElementById('tchiloGifGrid');
    function runSearch(q) {
      q = String(q || '').trim();
      if (!q) return;
      grid.innerHTML = '<p style="grid-column:1/-1;font-weight:700">A pesquisar…</p>';
      /* Tenor public demo client — fallback se falhar: avisar */
      var url =
        'https://tenor.googleapis.com/v2/search?q=' +
        encodeURIComponent(q) +
        '&key=AIzaSyAyimkuYQYF_FXVALexPuGQct5MHBgsydA&client_key=tchilo_web&limit=16';
      fetch(url)
        .then(function (r) {
          return r.json();
        })
        .then(function (data) {
          var results = (data && data.results) || [];
          if (!results.length) {
            grid.innerHTML =
              '<p style="grid-column:1/-1;font-weight:700">Sem resultados</p>';
            return;
          }
          grid.innerHTML = results
            .map(function (g) {
              var media =
                (g.media_formats && (g.media_formats.gif || g.media_formats.tinygif)) ||
                {};
              var src = media.url || '';
              if (!src) return '';
              return (
                '<img src="' +
                src +
                '" alt="gif" data-gif="' +
                src +
                '"/>'
              );
            })
            .join('');
          grid.querySelectorAll('[data-gif]').forEach(function (img) {
            img.onclick = function () {
              sendStickerOrGif({
                type: 'gif',
                url: img.getAttribute('data-gif'),
                text: ''
              });
              sheet.classList.remove('open');
              toast('GIF enviado');
            };
          });
        })
        .catch(function () {
          grid.innerHTML =
            '<p style="grid-column:1/-1;font-weight:700">Pesquisa GIF indisponível agora. Podes anexar um GIF pela galeria (+).</p>';
        });
    }
    if (search) {
      search.addEventListener('input', function () {
        clearTimeout(timer);
        timer = setTimeout(function () {
          runSearch(search.value);
        }, 400);
      });
    }
  }

  function patchOpenChat() {
    if (typeof window.openChat !== 'function') return;
    if (window.openChat.__composerV1) return;
    var orig = window.openChat;
    window.openChat = function () {
      var r = orig.apply(this, arguments);
      markChatOpen(true);
      ensureComposer();
      setTimeout(ensureComposer, 50);
      setTimeout(ensureComposer, 200);
      return r;
    };
    window.openChat.__composerV1 = true;
  }

  function patchCloseChat() {
    if (typeof window.closeChat !== 'function') return;
    if (window.closeChat.__composerV1) return;
    var orig = window.closeChat;
    window.closeChat = function () {
      markChatOpen(false);
      return orig.apply(this, arguments);
    };
    window.closeChat.__composerV1 = true;
  }

  function boot() {
    injectCSS();
    patchOpenChat();
    patchCloseChat();
    var screen = document.getElementById('chatScreen');
    if (screen && screen.classList.contains('open')) {
      markChatOpen(true);
      ensureComposer();
    }
  }

  boot();
  setTimeout(boot, 400);
  setTimeout(boot, 1200);

  try {
    var cs = document.getElementById('chatScreen');
    if (cs && !cs.__composerObs) {
      cs.__composerObs = true;
      new MutationObserver(function () {
        if (cs.classList.contains('open')) {
          markChatOpen(true);
          ensureComposer();
        } else markChatOpen(false);
      }).observe(cs, { attributes: true, attributeFilter: ['class'] });
    }
  } catch (e) {}
})();

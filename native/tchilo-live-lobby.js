/**
 * Tchilo Live Lobby v1
 * - Ícone LIVE do feed → lista de pessoas em direto
 * - Botão LIVE em cima → configurar a tua live
 * - Ver live: comentar, gosto, presente (35 moedas)
 */
(function () {
  'use strict';
  if (window.__tchiloLiveLobbyV1) return;
  window.__tchiloLiveLobbyV1 = true;

  var GIFT_COST = 35;
  var GIFT_SVG =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28" fill="none" aria-hidden="true">' +
    '<rect x="4.5" y="10.5" width="15" height="10.5" rx="2.4" fill="#7A00FF"/>' +
    '<rect x="2.5" y="7" width="19" height="4.6" rx="1.8" fill="#FF0A8C"/>' +
    '<rect x="10.4" y="7" width="3.2" height="14" fill="#20F2BC"/>' +
    '<path d="M12 7C9.5 7 7.2 6.6 7.2 4.9C7.2 3.3 9.7 3 12 7Z" fill="#20F2BC"/>' +
    '<path d="M12 7C14.5 7 16.8 6.6 16.8 4.9C16.8 3.3 14.3 3 12 7Z" fill="#20F2BC"/>' +
    '<path d="M10.4 7v3.9h3.2V7z" fill="#20F2BC"/>' +
    '</svg>';

  var LIVE_PILL =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="56 176 400 160" width="72" height="28">' +
    '<rect x="56" y="176" width="400" height="160" rx="80" fill="#000"/>' +
    '<circle cx="148" cy="256" r="26" fill="#fff"/>' +
    '<text x="290" y="284" text-anchor="middle" font-family="Arial,sans-serif" font-weight="800" font-size="84" fill="#fff">LIVE</text></svg>';

  function toast(msg) {
    try {
      if (typeof showToast === 'function') showToast(String(msg));
      else alert(String(msg));
    } catch (e) {}
  }

  function sessionUser() {
    try {
      if (typeof getSession === 'function') return getSession();
      return JSON.parse(localStorage.getItem('tchilo_session') || 'null');
    } catch (e) {
      return null;
    }
  }

  function uid() {
    var s = sessionUser();
    return (s && (s.id || s.user_id || s.uid)) || '';
  }

  function myName() {
    try {
      if (typeof getUsername === 'function') return String(getUsername() || '');
      var s = sessionUser();
      return String((s && (s.username || s.name)) || 'Tu');
    } catch (e) {
      return 'Tu';
    }
  }

  function getCoins() {
    try {
      var n = parseInt(localStorage.getItem('tchilo_coins_' + (uid() || 'local')) || '0', 10);
      return isNaN(n) ? 0 : Math.max(0, n);
    } catch (e) {
      return 0;
    }
  }

  function setCoins(n) {
    try {
      localStorage.setItem('tchilo_coins_' + (uid() || 'local'), String(Math.max(0, n | 0)));
    } catch (e) {}
  }

  function sb() {
    try {
      var c = window.supabaseClient || window.sb || window.supabase;
      if (!c) return null;
      return c.from ? c : c.client || null;
    } catch (e) {
      return null;
    }
  }

  function injectCSS() {
    if (document.getElementById('tchiloLiveLobbyCSS')) return;
    var st = document.createElement('style');
    st.id = 'tchiloLiveLobbyCSS';
    st.textContent =
      '#tchiloLiveLobby{position:fixed;inset:0;z-index:2147483600;display:none;flex-direction:column;background:#0B0B0C;color:#fff;}' +
      '#tchiloLiveLobby.open{display:flex!important;}' +
      '#tchiloLiveLobby .ll-top{display:flex;align-items:center;gap:10px;padding:12px 14px;padding-top:calc(12px + env(safe-area-inset-top));}' +
      '#tchiloLiveLobby .ll-back{width:40px;height:40px;border:0;border-radius:50%;background:rgba(255,255,255,.1);color:#fff;font-size:20px;cursor:pointer;}' +
      '#tchiloLiveLobby .ll-title{flex:1;text-align:center;font-weight:900;font-size:18px;}' +
      '#tchiloLiveLobby .ll-go{border:0;background:transparent;padding:4px;cursor:pointer;display:flex;align-items:center;}' +
      '#tchiloLiveLobby .ll-scroll{flex:1;overflow-y:auto;padding:8px 14px calc(24px + env(safe-area-inset-bottom));}' +
      '#tchiloLiveLobby .ll-empty{text-align:center;opacity:.6;padding:48px 20px;font-weight:600;line-height:1.5;}' +
      '#tchiloLiveLobby .ll-card{display:flex;align-items:center;gap:12px;padding:12px;margin-bottom:10px;border-radius:16px;background:rgba(255,255,255,.08);border:0;width:100%;text-align:left;color:#fff;cursor:pointer;}' +
      '#tchiloLiveLobby .ll-av{width:52px;height:52px;border-radius:50%;object-fit:cover;background:#333;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-weight:900;}' +
      '#tchiloLiveLobby .ll-av img{width:100%;height:100%;border-radius:50%;object-fit:cover;}' +
      '#tchiloLiveLobby .ll-meta b{display:block;font-size:15px;}' +
      '#tchiloLiveLobby .ll-meta span{font-size:12px;opacity:.65;}' +
      '#tchiloLiveLobby .ll-badge{margin-left:auto;background:#e11d48;color:#fff;font-size:10px;font-weight:900;padding:4px 8px;border-radius:999px;letter-spacing:.04em;}' +
      /* Viewer */
      '#tchiloLiveWatch{position:fixed;inset:0;z-index:2147483610;display:none;flex-direction:column;background:#0B0B0C;color:#fff;}' +
      '#tchiloLiveWatch.open{display:flex!important;}' +
      '#tchiloLiveWatch .lw-stage{flex:1;position:relative;background:#111;display:flex;align-items:center;justify-content:center;}' +
      '#tchiloLiveWatch .lw-stage .hint{opacity:.4;font-weight:700;text-align:center;padding:20px;}' +
      '#tchiloLiveWatch .lw-top{position:absolute;top:0;left:0;right:0;display:flex;align-items:center;gap:10px;padding:12px 14px;padding-top:calc(12px + env(safe-area-inset-top));background:linear-gradient(to bottom,rgba(0,0,0,.65),transparent);z-index:2;}' +
      '#tchiloLiveWatch .lw-close{width:36px;height:36px;border:0;border-radius:50%;background:rgba(0,0,0,.45);color:#fff;font-size:18px;cursor:pointer;}' +
      '#tchiloLiveWatch .lw-host{font-weight:800;font-size:15px;}' +
      '#tchiloLiveWatch .lw-live{background:#e11d48;font-size:10px;font-weight:900;padding:3px 7px;border-radius:6px;margin-left:8px;}' +
      '#tchiloLiveWatch .lw-comments{position:absolute;left:0;right:80px;bottom:70px;max-height:40%;overflow-y:auto;padding:0 12px;z-index:2;pointer-events:none;}' +
      '#tchiloLiveWatch .lw-comments div{background:rgba(0,0,0,.35);display:inline-block;padding:6px 10px;border-radius:12px;margin:4px 0;font-size:13px;max-width:90%;pointer-events:none;}' +
      '#tchiloLiveWatch .lw-comments b{margin-right:6px;}' +
      '#tchiloLiveWatch .lw-bar{display:flex;align-items:center;gap:8px;padding:10px 12px;padding-bottom:calc(10px + env(safe-area-inset-bottom));background:rgba(0,0,0,.75);}' +
      '#tchiloLiveWatch .lw-bar input{flex:1;border:0;border-radius:999px;padding:12px 14px;background:rgba(255,255,255,.12);color:#fff;font-size:14px;outline:none;}' +
      '#tchiloLiveWatch .lw-bar button{border:0;background:rgba(255,255,255,.12);color:#fff;width:44px;height:44px;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:18px;}' +
      '#tchiloLiveWatch .lw-bar .gift{background:transparent;}';
    document.head.appendChild(st);
  }

  function openMyLiveSetup() {
    try {
      if (typeof window.tchiloOpenLiveSetup === 'function') {
        window.tchiloOpenLiveSetup();
        return;
      }
    } catch (e) {}
    try {
      if (typeof window.openSetup === 'function') {
        window.openSetup();
        return;
      }
    } catch (e2) {}
    toast('Preparar live');
  }

  async function fetchLives() {
    var list = [];
    var client = sb();
    if (client) {
      try {
        var res = await client
          .from('live_sessions')
          .select('id, host_user_id, host_username, title, viewers, started_at, is_live')
          .eq('is_live', true)
          .order('started_at', { ascending: false })
          .limit(50);
        if (res && res.data) list = res.data;
      } catch (e) {}
    }
    /* local fallback (testes) */
    try {
      var local = JSON.parse(localStorage.getItem('tchilo_active_lives') || '[]');
      if (Array.isArray(local) && local.length) {
        list = list.concat(local);
      }
    } catch (e2) {}
    return list;
  }

  async function openLobby() {
    injectCSS();
    var root = document.getElementById('tchiloLiveLobby');
    if (!root) {
      root = document.createElement('div');
      root.id = 'tchiloLiveLobby';
      document.body.appendChild(root);
    }

    root.innerHTML =
      '<div class="ll-top">' +
      '<button type="button" class="ll-back" data-a="close" aria-label="Fechar">×</button>' +
      '<div class="ll-title">Em direto</div>' +
      '<button type="button" class="ll-go" data-a="go" title="Iniciar a tua LIVE" aria-label="Iniciar LIVE">' +
      LIVE_PILL +
      '</button></div>' +
      '<div class="ll-scroll" id="llScroll"><div class="ll-empty">A carregar…</div></div>';

    root.classList.add('open');
    try {
      document.body.style.overflow = 'hidden';
    } catch (e) {}

    root.onclick = function (e) {
      var t = e.target.closest('[data-a]');
      if (!t) return;
      var a = t.getAttribute('data-a');
      if (a === 'close') {
        root.classList.remove('open');
        try {
          document.body.style.overflow = '';
        } catch (err) {}
        return;
      }
      if (a === 'go') {
        openMyLiveSetup();
        return;
      }
      if (a === 'watch') {
        openWatch({
          host_username: t.getAttribute('data-user') || 'criador',
          id: t.getAttribute('data-id') || '',
          title: t.getAttribute('data-title') || ''
        });
      }
    };

    var scroll = root.querySelector('#llScroll');
    var lives = await fetchLives();
    if (!lives.length) {
      scroll.innerHTML =
        '<div class="ll-empty">Ninguém em direto neste momento.<br><br>Toca no ícone <b>LIVE</b> em cima para começares a tua.</div>';
      return;
    }

    scroll.innerHTML = lives
      .map(function (L) {
        var name = L.host_username || L.username || 'user';
        var title = L.title || 'Em direto';
        var av = (name.charAt(0) || '?').toUpperCase();
        return (
          '<button type="button" class="ll-card" data-a="watch" data-user="' +
          String(name).replace(/"/g, '') +
          '" data-id="' +
          String(L.id || '') +
          '" data-title="' +
          String(title).replace(/"/g, '') +
          '">' +
          '<div class="ll-av">' +
          av +
          '</div>' +
          '<div class="ll-meta"><b>@' +
          name +
          '</b><span>' +
          title +
          '</span></div>' +
          '<span class="ll-badge">AO VIVO</span></button>'
        );
      })
      .join('');
  }

  function openWatch(live) {
    injectCSS();
    var root = document.getElementById('tchiloLiveWatch');
    if (!root) {
      root = document.createElement('div');
      root.id = 'tchiloLiveWatch';
      document.body.appendChild(root);
    }

    var likes = 0;
    var host = live.host_username || 'criador';

    root.innerHTML =
      '<div class="lw-stage">' +
      '<div class="lw-top">' +
      '<button type="button" class="lw-close" data-a="close">×</button>' +
      '<span class="lw-host">@' +
      host +
      '</span><span class="lw-live">AO VIVO</span></div>' +
      '<div class="hint">Transmissão de @' +
      host +
      '</div>' +
      '<div class="lw-comments" id="lwComments"></div></div>' +
      '<div class="lw-bar">' +
      '<input type="text" id="lwInput" placeholder="Comentar…" maxlength="200" autocomplete="off"/>' +
      '<button type="button" data-a="like" aria-label="Gosto">♥</button>' +
      '<button type="button" class="gift" data-a="gift" aria-label="Presente">' +
      GIFT_SVG +
      '</button>' +
      '<button type="button" data-a="send" aria-label="Enviar">➤</button></div>';

    root.classList.add('open');

    function addComment(name, text) {
      var box = root.querySelector('#lwComments');
      if (!box) return;
      var row = document.createElement('div');
      row.innerHTML = '<b>' + name + '</b>' + text;
      box.appendChild(row);
      box.scrollTop = box.scrollHeight;
    }

    root.onclick = function (e) {
      var t = e.target.closest('[data-a]');
      if (!t) return;
      var a = t.getAttribute('data-a');
      if (a === 'close') {
        root.classList.remove('open');
        return;
      }
      if (a === 'like') {
        likes += 1;
        toast('♥ ' + likes);
        try {
          var client = sb();
          if (client) {
            client.from('live_likes').insert({
              live_id: live.id || null,
              host_username: host,
              user_id: uid() || null
            });
          }
        } catch (err) {}
        return;
      }
      if (a === 'gift') {
        var coins = getCoins();
        if (coins < GIFT_COST) {
          toast('Precisas de ' + GIFT_COST + ' moedas');
          return;
        }
        if (!confirm('Enviar presente a @' + host + ' por ' + GIFT_COST + ' moedas?')) return;
        setCoins(coins - GIFT_COST);
        addComment(myName(), 'enviou um presente 🎁');
        toast('Presente enviado (−' + GIFT_COST + ')');
        try {
          var c2 = sb();
          if (c2) {
            c2.from('gifts').insert({
              from_user_id: uid() || null,
              to_username: host,
              coins: GIFT_COST,
              kind: 'live_gift',
              post_id: live.id || null
            });
          }
        } catch (err2) {}
        return;
      }
      if (a === 'send') {
        var inp = root.querySelector('#lwInput');
        var text = (inp && inp.value || '').trim();
        if (!text) return;
        addComment(myName(), text);
        if (inp) inp.value = '';
        try {
          var c3 = sb();
          if (c3) {
            c3.from('live_comments').insert({
              live_id: live.id || null,
              host_username: host,
              user_id: uid() || null,
              username: myName(),
              body: text
            });
          }
        } catch (err3) {}
      }
    };

    var inp = root.querySelector('#lwInput');
    if (inp) {
      inp.addEventListener('keydown', function (ev) {
        if (ev.key === 'Enter') {
          ev.preventDefault();
          var sendBtn = root.querySelector('[data-a="send"]');
          if (sendBtn) sendBtn.click();
        }
      });
    }
  }

  window.tchiloOpenLiveLobby = openLobby;
  window.openLiveLobby = openLobby;

  /* Override: ícone LIVE do feed abre lobby, não setup direto */
  window.tchiloOpenLiveFromFeed = openLobby;
})();

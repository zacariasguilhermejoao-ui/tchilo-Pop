/**
 * Tchilo — Em direto (v2)
 *
 * Ícone LIVE do feed → lista das lives a decorrer (tabela public.lives, status = 'live').
 *  - Sem lives: "Ninguém está em direto neste momento."
 *  - Botão "Iniciar live" no topo → fecha a lista e abre a configuração da tua live
 *    (window.tchiloOpenLiveSetup, do script de live).
 *  - Tocar numa live → ver em direto (Cloudflare Realtime SFU através da edge function
 *    live-sfu: create_session → subscribe → renegotiate), contador de espectadores
 *    (rpc lives_inc_viewers) e deteção de fim da live.
 *
 * NOTA: os ids/classes não contêm a palavra "live" de propósito — o script
 * "tchilo-live-hide-js" do index esconde elementos com "live" no id/classe.
 */
(function () {
  'use strict';
  if (window.__tchiloDiretoV2) return;
  window.__tchiloDiretoV2 = true;

  var POLL_LIST_MS = 8000;
  var POLL_WATCH_MS = 5000;

  /* ---------- utilitários ---------- */
  function tr(k) {
    try { return typeof t === 'function' ? t(k) : k; } catch (e) { return k; }
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function toast(msg) {
    try { if (typeof showToast === 'function') showToast(tr(msg)); } catch (e) {}
  }

  function client() { return window.tchiloSupabase || null; }

  function sessionUser() {
    try { return typeof getSession === 'function' ? getSession() : null; } catch (e) { return null; }
  }

  function myId() {
    var s = sessionUser();
    return (s && (s.id || s.user_id || s.uid)) || '';
  }

  function blockedList() {
    try {
      return (typeof getBlocked === 'function' ? (getBlocked() || []) : []).map(function (u) {
        return String(u).toLowerCase();
      });
    } catch (e) { return []; }
  }

  function fnUrl() {
    var c = client();
    var base = (c && c.supabaseUrl) || window.TCHILO_SUPABASE_URL || '';
    try { if (!base && typeof TCHILO_SUPABASE_URL !== 'undefined') base = TCHILO_SUPABASE_URL; } catch (e) {}
    return String(base).replace(/\/$/, '') + '/functions/v1/live-sfu';
  }

  function apiKey() {
    var c = client();
    var k = (c && c.supabaseKey) || window.TCHILO_SUPABASE_KEY || '';
    try { if (!k && typeof TCHILO_SUPABASE_KEY !== 'undefined') k = TCHILO_SUPABASE_KEY; } catch (e) {}
    return k;
  }

  async function accessToken() {
    try {
      var c = client();
      if (!c) return null;
      var r = await c.auth.getSession();
      return (r && r.data && r.data.session && r.data.session.access_token) || null;
    } catch (e) { return null; }
  }

  async function callApi(action, payload) {
    var token = await accessToken();
    if (!token) throw new Error('Sem sessão');
    var res = await fetch(fnUrl(), {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/json',
        apikey: apiKey()
      },
      body: JSON.stringify(Object.assign({ action: action }, payload || {}))
    });
    var data = await res.json().catch(function () { return {}; });
    if (!res.ok || data.error) throw new Error(data.error || ('Erro ' + res.status));
    return data;
  }

  var ARROW =
    '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.2" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>';

  /* ---------- CSS ---------- */
  function injectCSS() {
    if (document.getElementById('tkDiretoCSS')) return;
    var sys = 'system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif';
    var st = document.createElement('style');
    st.id = 'tkDiretoCSS';
    st.textContent = [
      '#tkDireto{position:fixed;inset:0;z-index:2147483000;display:none;flex-direction:column;background:var(--paper,#fff);color:var(--ink,#0B0B0C);font-family:' + sys + ';}',
      '#tkDireto.open{display:flex;}',
      '#tkDireto .td-top{display:flex;align-items:center;gap:6px;min-height:56px;padding:6px 12px 6px 8px;padding-top:calc(6px + env(safe-area-inset-top));}',
      '#tkDireto .td-back{width:44px;height:44px;border:0;background:transparent;color:inherit;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;-webkit-tap-highlight-color:transparent;}',
      '#tkDireto .td-back:active{background:rgba(0,0,0,.07);}',
      '#tkDireto .td-title{flex:1;margin:0;font-size:22px;font-weight:800;letter-spacing:-.01em;}',
      '#tkDireto .td-go{border:0;background:var(--ink,#0B0B0C);color:var(--paper,#fff);font:700 14px ' + sys + ';padding:10px 16px;border-radius:999px;cursor:pointer;-webkit-tap-highlight-color:transparent;}',
      '#tkDireto .td-go:active{opacity:.8;}',
      '#tkDireto .td-scroll{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding-bottom:calc(24px + env(safe-area-inset-bottom));}',
      '#tkDireto .td-row{display:flex;align-items:center;gap:14px;width:100%;padding:12px 16px;border:0;background:transparent;color:inherit;text-align:left;font-family:inherit;cursor:pointer;-webkit-tap-highlight-color:transparent;}',
      '#tkDireto .td-row:active{background:rgba(0,0,0,.05);}',
      '#tkDireto .td-av{width:52px;height:52px;border-radius:50%;flex-shrink:0;overflow:hidden;background:#ECECEC;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:20px;}',
      '#tkDireto .td-av img{width:100%;height:100%;object-fit:cover;display:block;}',
      '#tkDireto .td-meta{flex:1;min-width:0;}',
      '#tkDireto .td-meta b{display:block;font-size:16px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
      '#tkDireto .td-meta span{display:block;font-size:13.5px;color:var(--muted,#6B6B70);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:1px;}',
      '#tkDireto .td-side{flex-shrink:0;text-align:right;font-size:12px;color:var(--muted,#6B6B70);}',
      '#tkDireto .td-side i{display:inline-flex;align-items:center;gap:6px;font-style:normal;font-weight:700;color:#E11D48;}',
      '#tkDireto .td-side i::before{content:"";width:7px;height:7px;border-radius:50%;background:#E11D48;}',
      '#tkDireto .td-side em{display:block;font-style:normal;margin-top:2px;}',
      '#tkDireto .td-msg{padding:64px 28px;text-align:center;}',
      '#tkDireto .td-msg b{display:block;font-size:17px;font-weight:700;}',
      '#tkDireto .td-msg span{display:block;margin-top:8px;font-size:14px;line-height:1.45;color:var(--muted,#6B6B70);}',
      '#tkDireto .td-msg button{margin-top:18px;border:0;background:transparent;color:inherit;font:700 15px ' + sys + ';padding:10px 14px;cursor:pointer;}',
      '#tkDireto .td-sk{display:flex;align-items:center;gap:14px;padding:12px 16px;}',
      '#tkDireto .td-sk .tk-skel-circle{width:52px;height:52px;flex-shrink:0;}',
      '#tkDireto .td-sk>div:last-child{flex:1;display:flex;flex-direction:column;gap:9px;}',
      /* ver */
      '#tkDiretoVer{position:fixed;inset:0;z-index:2147483001;display:none;flex-direction:column;background:#000;color:#fff;font-family:' + sys + ';}',
      '#tkDiretoVer.open{display:flex;}',
      '#tkDiretoVer video{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;background:#000;}',
      '#tkDiretoVer .tv-top{position:relative;z-index:2;display:flex;align-items:center;gap:10px;padding:8px 12px 28px 8px;padding-top:calc(8px + env(safe-area-inset-top));background:linear-gradient(180deg,rgba(0,0,0,.6),rgba(0,0,0,0));}',
      '#tkDiretoVer .tv-x{width:44px;height:44px;border:0;background:transparent;color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;}',
      '#tkDiretoVer .tv-who{flex:1;min-width:0;font-size:16px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
      '#tkDiretoVer .tv-badge{flex-shrink:0;display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:800;padding:5px 10px;border-radius:999px;background:#E11D48;}',
      '#tkDiretoVer .tv-count{flex-shrink:0;font-size:13px;font-weight:600;opacity:.9;}',
      '#tkDiretoVer .tv-state{position:relative;z-index:2;flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:24px;text-align:center;font-size:16px;font-weight:600;}',
      '#tkDiretoVer .tv-state button{border:0;background:#fff;color:#000;font:700 15px ' + sys + ';padding:11px 20px;border-radius:999px;cursor:pointer;}',
      '#tkDiretoVer .tv-bottom{position:absolute;left:0;right:0;bottom:0;z-index:2;padding:40px 16px calc(18px + env(safe-area-inset-bottom));background:linear-gradient(0deg,rgba(0,0,0,.65),rgba(0,0,0,0));font-size:15px;font-weight:600;}'
    ].join('\n');
    (document.head || document.documentElement).appendChild(st);
  }

  /* ---------- lista ---------- */
  var listTimer = null;
  var listReq = 0;

  function skeletonRows() {
    var one =
      '<div class="td-sk"><div class="tk-skel-circle"></div><div>' +
      '<div class="tk-skel-line" style="width:45%;height:14px"></div>' +
      '<div class="tk-skel-line" style="width:70%"></div></div></div>';
    return one + one + one + one;
  }

  async function fetchLives() {
    var c = client();
    if (!c) throw new Error('Sem ligação');
    var res = await c
      .from('lives')
      .select('id,user_id,username,display_name,title,viewer_count,started_at,publisher_session_id,video_track_name,audio_track_name')
      .eq('status', 'live')
      .order('started_at', { ascending: false })
      .limit(50);
    if (res && res.error) throw new Error(res.error.message || 'Erro');
    var rows = (res && res.data) || [];
    var me = myId();
    var blocked = blockedList();
    rows = rows.filter(function (r) {
      if (me && r.user_id === me) return false;
      return blocked.indexOf(String(r.username || '').toLowerCase()) < 0;
    });
    /* avatares (melhor esforço) */
    var ids = rows.map(function (r) { return r.user_id; }).filter(Boolean);
    if (ids.length) {
      try {
        var pr = await c.from('profiles').select('id,avatar_url').in('id', ids);
        var map = {};
        ((pr && pr.data) || []).forEach(function (p) { map[p.id] = p.avatar_url; });
        rows.forEach(function (r) { r.avatar_url = map[r.user_id] || ''; });
      } catch (e) {}
    }
    return rows;
  }

  function renderList(rows) {
    var box = document.getElementById('tdScroll');
    if (!box) return;
    box._rows = rows;
    if (!rows.length) {
      box.innerHTML =
        '<div class="td-msg"><b>' + esc(tr('Ninguém está em direto neste momento.')) + '</b>' +
        '<span>' + esc(tr('Quando alguém começar uma live, aparece aqui.')) + '</span></div>';
      return;
    }
    box.innerHTML = rows.map(function (r, i) {
      var name = r.username || 'user';
      var av = r.avatar_url
        ? '<img src="' + esc(r.avatar_url) + '" alt="" loading="lazy">'
        : esc((name.charAt(0) || '?').toUpperCase());
      var title = r.title ? esc(r.title) : esc(tr('Em direto'));
      return '<button type="button" class="td-row" data-i="' + i + '">' +
        '<div class="td-av">' + av + '</div>' +
        '<div class="td-meta"><b>@' + esc(name) + '</b><span>' + title + '</span></div>' +
        '<div class="td-side"><i>' + esc(tr('Ao vivo')) + '</i>' +
        '<em>' + (r.viewer_count | 0) + ' ' + esc(tr('a ver')) + '</em></div></button>';
    }).join('');
  }

  function renderError() {
    var box = document.getElementById('tdScroll');
    if (!box) return;
    box._rows = null;
    box.innerHTML =
      '<div class="td-msg"><b>' + esc(tr('Não foi possível carregar as lives.')) + '</b>' +
      '<button type="button" data-a="retry">' + esc(tr('Tentar novamente')) + '</button></div>';
  }

  function isLobbyOpen() {
    var r = document.getElementById('tkDireto');
    return !!(r && r.classList.contains('open'));
  }

  async function loadList(showSkeleton) {
    var box = document.getElementById('tdScroll');
    if (!box) return;
    var req = ++listReq;
    if (showSkeleton) box.innerHTML = skeletonRows();
    try {
      var rows = await fetchLives();
      if (req !== listReq || !isLobbyOpen()) return;
      renderList(rows);
    } catch (e) {
      if (req !== listReq || !isLobbyOpen()) return;
      if (showSkeleton || !box._rows) renderError();
    }
  }

  function closeLobby() {
    var root = document.getElementById('tkDireto');
    if (root) root.classList.remove('open');
    if (listTimer) { clearInterval(listTimer); listTimer = null; }
    listReq++;
  }

  function startMyLive() {
    closeLobby();
    var fn = window.tchiloOpenLiveSetup || window.openSetup;
    if (typeof fn === 'function') {
      try { fn(); return; } catch (e) {}
    }
    toast('Não foi possível abrir a configuração da live');
  }

  function openLobby() {
    if (window.tchiloRequireOnline && !window.tchiloRequireOnline()) return;
    injectCSS();
    var root = document.getElementById('tkDireto');
    if (!root) {
      root = document.createElement('div');
      root.id = 'tkDireto';
      document.body.appendChild(root);
      root.addEventListener('click', function (ev) {
        var el = ev.target.closest ? ev.target.closest('[data-a],.td-row') : null;
        if (!el) return;
        if (el.classList.contains('td-row')) {
          var box = document.getElementById('tdScroll');
          var live = box && box._rows && box._rows[+el.getAttribute('data-i')];
          if (live) watch(live);
          return;
        }
        var a = el.getAttribute('data-a');
        if (a === 'close') closeLobby();
        else if (a === 'go') startMyLive();
        else if (a === 'retry') loadList(true);
      });
    }
    root.innerHTML =
      '<div class="td-top">' +
      '<button type="button" class="td-back" data-a="close" aria-label="' + esc(tr('Voltar')) + '">' + ARROW + '</button>' +
      '<h1 class="td-title">' + esc(tr('Em direto')) + '</h1>' +
      '<button type="button" class="td-go" data-a="go">' + esc(tr('Iniciar live')) + '</button>' +
      '</div><div class="td-scroll" id="tdScroll"></div>';
    root.classList.add('open');
    loadList(true);
    if (listTimer) clearInterval(listTimer);
    listTimer = setInterval(function () {
      var viewer = document.getElementById('tkDiretoVer');
      if (isLobbyOpen() && !(viewer && viewer.classList.contains('open'))) loadList(false);
    }, POLL_LIST_MS);
  }

  /* ---------- ver uma live ---------- */
  var W = null; /* estado do visualizador */

  async function waitIce(pc) {
    if (pc.iceGatheringState === 'complete') return;
    await new Promise(function (resolve) {
      var done = false;
      function finish() {
        if (done) return;
        done = true;
        try { pc.removeEventListener('icegatheringstatechange', onChange); } catch (e) {}
        resolve();
      }
      function onChange() { if (pc.iceGatheringState === 'complete') finish(); }
      try { pc.addEventListener('icegatheringstatechange', onChange); } catch (e) {}
      setTimeout(finish, 2500);
    });
  }

  function viewerRoot() {
    var root = document.getElementById('tkDiretoVer');
    if (!root) {
      root = document.createElement('div');
      root.id = 'tkDiretoVer';
      document.body.appendChild(root);
      root.addEventListener('click', function (ev) {
        var el = ev.target.closest ? ev.target.closest('[data-a]') : null;
        if (!el) return;
        var a = el.getAttribute('data-a');
        if (a === 'close') stopWatching();
        else if (a === 'retry' && W) { var l = W.live; stopWatching(true); watch(l); }
      });
    }
    return root;
  }

  function setState(html) {
    var box = document.getElementById('tvState');
    if (!box) return;
    box.innerHTML = html;
    box.style.display = html ? 'flex' : 'none';
  }

  function viewerRpc(delta, liveId) {
    try {
      var c = client();
      if (c && c.rpc && liveId) {
        var p = c.rpc('lives_inc_viewers', { p_live_id: liveId, p_delta: delta });
        if (p && p.catch) p.catch(function () {});
      }
    } catch (e) {}
  }

  function cleanupMedia() {
    if (!W) return;
    try { if (W.pc) { W.pc.ontrack = null; W.pc.close(); } } catch (e) {}
    W.pc = null;
    try {
      var v = document.getElementById('tvVideo');
      if (v) { v.pause(); v.srcObject = null; }
    } catch (e2) {}
  }

  function liveEnded() {
    if (!W || W.ended) return;
    W.ended = true;
    cleanupMedia();
    setState('<div>' + esc(tr('A live terminou.')) + '</div><button type="button" data-a="close">' + esc(tr('Fechar')) + '</button>');
    var ref = W;
    setTimeout(function () { if (W === ref) stopWatching(); }, 3000);
  }

  async function pollWatch() {
    var me = W;
    if (!me || me.ended) return;
    try {
      var r = await client().from('lives').select('status,viewer_count,title').eq('id', me.live.id).maybeSingle();
      if (W !== me) return;
      var row = r && r.data;
      if (!row || row.status !== 'live') { liveEnded(); return; }
      var cnt = document.getElementById('tvCount');
      if (cnt) cnt.textContent = (row.viewer_count | 0) + ' ' + tr('a ver');
    } catch (e) {}
  }

  function stopWatching(silent) {
    if (!W) return;
    var w = W;
    if (w.timer) clearInterval(w.timer);
    cleanupMedia();
    if (w.joined) { w.joined = false; viewerRpc(-1, w.live.id); }
    W = null;
    var root = document.getElementById('tkDiretoVer');
    if (root) { root.classList.remove('open'); root.innerHTML = ''; }
    if (!silent && isLobbyOpen()) loadList(false);
  }

  async function watch(live) {
    injectCSS();
    if (W) stopWatching(true);
    var name = live.username || 'user';
    var root = viewerRoot();
    root.innerHTML =
      '<video id="tvVideo" playsinline autoplay></video>' +
      '<div class="tv-top"><button type="button" class="tv-x" data-a="close" aria-label="' + esc(tr('Fechar')) + '">' + ARROW + '</button>' +
      '<div class="tv-who">@' + esc(name) + '</div>' +
      '<span class="tv-badge">' + esc(tr('Ao vivo')) + '</span>' +
      '<span class="tv-count" id="tvCount">' + (live.viewer_count | 0) + ' ' + esc(tr('a ver')) + '</span></div>' +
      '<div class="tv-state" id="tvState"><div>' + esc(tr('A ligar…')) + '</div></div>' +
      (live.title ? '<div class="tv-bottom">' + esc(live.title) + '</div>' : '');
    root.classList.add('open');

    var me = { live: live, pc: null, joined: false, ended: false, timer: null };
    W = me;

    try {
      if (!live.publisher_session_id) throw new Error('Live sem sessão');
      if (typeof RTCPeerConnection === 'undefined') throw new Error('Sem WebRTC');

      var pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.cloudflare.com:3478' }],
        bundlePolicy: 'max-bundle'
      });
      me.pc = pc;
      var stream = null;
      pc.ontrack = function (ev) {
        if (W !== me) return;
        var v = document.getElementById('tvVideo');
        if (!v) return;
        if (ev.streams && ev.streams[0]) {
          stream = ev.streams[0];
        } else {
          if (!stream) stream = new MediaStream();
          try { stream.addTrack(ev.track); } catch (e) {}
        }
        v.srcObject = stream;
        var p = v.play();
        if (p && p.catch) p.catch(function () {});
        if (ev.track && ev.track.kind === 'video') setState('');
      };

      var sess = await callApi('create_session', {});
      if (W !== me) return;
      var sid = sess.sessionId;
      var tracks = [
        { location: 'remote', sessionId: live.publisher_session_id, trackName: live.audio_track_name || 'mic' },
        { location: 'remote', sessionId: live.publisher_session_id, trackName: live.video_track_name || 'camera' }
      ];
      var sub = await callApi('subscribe', { sessionId: sid, tracks: tracks });
      if (W !== me) return;
      var failed = (sub.tracks || []).some(function (t0) { return t0 && t0.errorCode; });
      if (failed) throw new Error('Live sem imagem');

      var offer = sub.sessionDescription || sub.offer;
      if (!offer || !offer.sdp) throw new Error('Sem oferta');
      await pc.setRemoteDescription(offer);
      var answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      await waitIce(pc);
      if (W !== me) return;
      await callApi('renegotiate', {
        sessionId: sid,
        sessionDescription: { type: pc.localDescription.type, sdp: pc.localDescription.sdp }
      });
      if (W !== me) return;

      me.joined = true;
      viewerRpc(1, live.id);
      me.timer = setInterval(pollWatch, POLL_WATCH_MS);
    } catch (err) {
      if (W !== me) return;
      cleanupMedia();
      setState('<div>' + esc(tr('Não foi possível ligar a esta live.')) + '</div>' +
        '<button type="button" data-a="retry">' + esc(tr('Tentar novamente')) + '</button>');
    }
  }

  window.addEventListener('pagehide', function () {
    if (W && W.joined) { W.joined = false; viewerRpc(-1, W.live.id); }
  });

  /* ---------- exportar ---------- */
  window.tchiloOpenLiveLobby = openLobby;
  window.openLiveLobby = openLobby;
  window.tchiloOpenLiveFromFeed = openLobby;
})();

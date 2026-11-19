/**
 * Tchilo — abrir links partilhados (post ou perfil).
 * Um link como tchilopop.com/u/ana, /p/ID ou /post/ID chega aqui guardado em sessionStorage
 * (a página 404.html e as páginas públicas guardam o caminho antes de abrir a app).
 * Depois do login, este script abre o perfil ou o post certo.
 */
(function () {
  'use strict';
  if (window.__tchiloOpenLink) return;
  window.__tchiloOpenLink = true;

  var KEY = 'tchilo_open_path';

  function readPath() {
    try { return sessionStorage.getItem(KEY) || sessionStorage.getItem('tchilo_spa_path') || ''; } catch (e) { return ''; }
  }
  function clearPath() {
    try { sessionStorage.removeItem(KEY); sessionStorage.removeItem('tchilo_spa_path'); } catch (e) {}
  }
  function parse(p) {
    p = String(p || '').split('?')[0].split('#')[0];
    var m = /^\/u\/([^\/]+)\/?$/.exec(p);
    if (m) return { type: 'user', v: decodeURIComponent(m[1]).replace(/^@/, '') };
    m = /^\/(?:p|post)\/([^\/]+)\/?$/.exec(p);
    if (m) return { type: 'post', v: decodeURIComponent(m[1]) };
    return null;
  }
  function toast(m) { try { if (typeof showToast === 'function') showToast(m); } catch (e) {} }

  function ready() {
    try {
      return typeof goTo === 'function' && typeof getSession === 'function' && !!getSession() &&
        typeof openUserProfile === 'function' && typeof getPosts === 'function' && !!window.tchiloSupabase;
    } catch (e) { return false; }
  }

  async function selectPosts(builder) {
    var SB = window.tchiloSupabase;
    var r = await builder(SB.from('posts').select('*, profiles:user_id(id,username,display_name,avatar_url,is_private)'));
    if (r && r.error) r = await builder(SB.from('posts').select('*'));
    return r && !r.error ? r.data : null;
  }
  function mergePosts(rows) {
    var list = getPosts() || [];
    var have = {};
    list.forEach(function (p) { have[p.id] = 1; });
    var added = 0;
    (rows || []).forEach(function (row) {
      var p = null;
      try { p = normalizeCloudPost(row, null); } catch (e) {}
      if (!p || have[p.id]) return;
      try {
        if (p.isPrivate && typeof isFriend === 'function' && !isFriend(p.username) && p.username !== (getSession() || {}).username) return;
      } catch (e) {}
      list.push(p); have[p.id] = 1; added++;
    });
    if (added) { try { save(KEYS.posts, list); } catch (e) {} }
    return added;
  }

  async function openPost(id) {
    var found = (getPosts() || []).filter(function (p) { return String(p.id) === String(id); })[0];
    if (!found) {
      var rows = null;
      try { rows = await selectPosts(function (q) { return q.eq('id', id).limit(1); }); } catch (e) {}
      mergePosts(rows);
      found = (getPosts() || []).filter(function (p) { return String(p.id) === String(id); })[0];
    }
    if (!found) { toast('Este post não está disponível'); return; }
    if (typeof openProfilePostViewer === 'function') openProfilePostViewer(found.id);
  }

  async function openUser(name) {
    try {
      var SB = window.tchiloSupabase;
      var pr = await SB.from('profiles').select('id,username,is_private').eq('username', name).maybeSingle();
      var prof = pr && pr.data;
      if (prof && prof.id) {
        var rows = await selectPosts(function (q) { return q.eq('user_id', prof.id).order('created_at', { ascending: false }).limit(30); });
        mergePosts(rows);
      }
    } catch (e) {}
    openUserProfile(name);
  }

  var running = false;
  async function tryOpen() {
    if (running) return;
    var target = parse(readPath());
    if (!target) { if (readPath()) clearPath(); return; }
    if (!ready()) return;
    running = true;
    clearPath();
    try {
      if (target.type === 'post') await openPost(target.v);
      else await openUser(target.v);
    } catch (e) {
      toast('Não foi possível abrir o link');
    } finally { running = false; }
  }

  window.tchiloOpenLink = { tryOpen: tryOpen, parse: parse };
  var tries = 0;
  (function loop() {
    tryOpen();
    if (readPath() && ++tries < 60) setTimeout(loop, 500);
  })();
})();

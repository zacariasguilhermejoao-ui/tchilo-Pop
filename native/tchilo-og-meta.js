/**
 * Tchilo — Open Graph / partilha (título + imagem no link)
 * v1
 */
(function () {
  'use strict';
  if (window.__tchiloOgMetaV1) return;
  window.__tchiloOgMetaV1 = true;

  var ORIGIN = 'https://tchilopop.com';
  var DEFAULT_IMG = ORIGIN + '/icon-512.png';
  var DEFAULT_TITLE = 'Tchilo';
  var DEFAULT_DESC = 'Tchilo — partilha fotos, vídeos, stories e mensagens.';

  function origin() {
    try {
      if (location.origin && /^https?:/.test(location.origin)) return location.origin;
    } catch (e) {}
    return ORIGIN;
  }

  function ensureMeta() {
    var head = document.head || document.getElementsByTagName('head')[0];
    if (!head) return;

    function set(attr, key, val) {
      if (!val) return;
      var sel = attr === 'property'
        ? 'meta[property="' + key + '"]'
        : 'meta[name="' + key + '"]';
      var el = document.querySelector(sel);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        head.appendChild(el);
      }
      el.setAttribute('content', String(val));
    }

    function setLink(rel, href) {
      var el = document.querySelector('link[rel="' + rel + '"]');
      if (!el) {
        el = document.createElement('link');
        el.setAttribute('rel', rel);
        head.appendChild(el);
      }
      el.setAttribute('href', href);
    }

    window.tchiloSetOg = function (opts) {
      opts = opts || {};
      var title = opts.title || DEFAULT_TITLE;
      var desc = opts.description || DEFAULT_DESC;
      var img = opts.image || DEFAULT_IMG;
      var url = opts.url || location.href;
      var type = opts.type || 'website';

      document.title = title;

      set('property', 'og:site_name', 'Tchilo');
      set('property', 'og:type', type);
      set('property', 'og:title', title);
      set('property', 'og:description', desc);
      set('property', 'og:url', url);
      set('property', 'og:image', img);
      set('property', 'og:locale', 'pt_PT');

      set('name', 'twitter:card', 'summary_large_image');
      set('name', 'twitter:title', title);
      set('name', 'twitter:description', desc);
      set('name', 'twitter:image', img);

      set('name', 'description', desc);
      setLink('canonical', url);
    };

    window.tchiloSetOg({
      title: DEFAULT_TITLE,
      description: DEFAULT_DESC,
      image: DEFAULT_IMG,
      url: origin() + '/'
    });
  }

  function absUrl(u) {
    if (!u) return '';
    u = String(u);
    if (/^https?:\/\//i.test(u)) return u;
    if (u.indexOf('//') === 0) return 'https:' + u;
    if (u.charAt(0) === '/') return origin() + u;
    return u;
  }

  function fromPost(post) {
    if (!post) return;
    var img = '';
    try {
      if (post.image) img = post.image;
      else if (post.mediaUrl) img = post.mediaUrl;
      else if (post.thumbnail) img = post.thumbnail;
      else if (post.thumb) img = post.thumb;
      else if (post.media && post.media[0]) {
        var m = post.media[0];
        img = m.thumb || m.thumbnail || m.url || m.src || '';
      }
    } catch (e) {}
    var caption = (post.caption || post.text || '').trim();
    if (caption.length > 140) caption = caption.slice(0, 137) + '…';
    var user = post.username || post.user || 'Tchilo';
    var title = '@' + user + ' no Tchilo';
    var desc = caption || ('Publicação de @' + user + ' no Tchilo');
    var url =
      typeof window.tchiloPublicPostUrl === 'function'
        ? window.tchiloPublicPostUrl(post.id)
        : origin() + '/p/' + encodeURIComponent(post.id);
    window.tchiloSetOg({
      title: title,
      description: desc,
      image: absUrl(img) || DEFAULT_IMG,
      url: url,
      type: 'article'
    });
  }

  function fromProfile(username, avatar, bio) {
    var user = username || '';
    var title = user ? '@' + user + ' · Tchilo' : 'Perfil · Tchilo';
    var desc = bio || (user ? 'Perfil de @' + user + ' no Tchilo' : 'Perfil no Tchilo');
    var url =
      typeof window.tchiloPublicProfileUrl === 'function'
        ? window.tchiloPublicProfileUrl(user)
        : origin() + '/u/' + encodeURIComponent(user);
    window.tchiloSetOg({
      title: title,
      description: desc,
      image: absUrl(avatar) || DEFAULT_IMG,
      url: url,
      type: 'profile'
    });
  }

  window.tchiloOgFromPost = fromPost;
  window.tchiloOgFromProfile = fromProfile;

  function patchOpenPost() {
    if (typeof window.openProfilePostViewer !== 'function') return;
    if (window.openProfilePostViewer.__og) return;
    var orig = window.openProfilePostViewer;
    window.openProfilePostViewer = function (postId) {
      try {
        var posts = typeof getPosts === 'function' ? getPosts() : [];
        var p = posts.find(function (x) {
          return x.id === postId;
        });
        if (p) fromPost(p);
      } catch (e) {}
      return orig.apply(this, arguments);
    };
    window.openProfilePostViewer.__og = true;
  }

  function patchProfile() {
    if (typeof window.renderProfile !== 'function') return;
    if (window.renderProfile.__og) return;
    var orig = window.renderProfile;
    window.renderProfile = function () {
      var r = orig.apply(this, arguments);
      try {
        var user = window.viewingProfileUser;
        if (!user && typeof getSession === 'function') {
          var s = getSession();
          user = s && s.username;
        }
        var avatar = '';
        var bio = '';
        try {
          if (typeof getProfiles === 'function') {
            var all = getProfiles() || {};
            var pr = all[user] || {};
            avatar = pr.avatar || pr.photo || '';
            bio = pr.bio || pr.about || '';
          }
        } catch (e) {}
        if (user) fromProfile(user, avatar, bio);
      } catch (e2) {}
      return r;
    };
    window.renderProfile.__og = true;
  }

  function boot() {
    ensureMeta();
    patchOpenPost();
    patchProfile();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  setTimeout(boot, 400);
  setTimeout(boot, 1500);
})();

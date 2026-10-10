/**
 * Tchilo Presentes no post v2
 * - Ícone à ESQUERDA do botão Seguir/Seguido/Amigos
 * - Só em posts de quem segues, te segue ou Amigos
 * - 35 moedas
 */
(function () {
  'use strict';
  if (window.__tchiloGiftsV2) return;
  window.__tchiloGiftsV2 = true;
  window.__tchiloGiftsV1 = true;

  var COST = 35;

  var GIFT_SVG =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">' +
    '<rect x="4.5" y="10.5" width="15" height="10.5" rx="2.4" fill="#7A00FF"/>' +
    '<rect x="2.5" y="7" width="19" height="4.6" rx="1.8" fill="#FF0A8C"/>' +
    '<rect x="10.4" y="7" width="3.2" height="14" fill="#20F2BC"/>' +
    '<path d="M12 7C9.5 7 7.2 6.6 7.2 4.9C7.2 3.3 9.7 3 12 7Z" fill="#20F2BC"/>' +
    '<path d="M12 7C14.5 7 16.8 6.6 16.8 4.9C16.8 3.3 14.3 3 12 7Z" fill="#20F2BC"/>' +
    '<path d="M10.4 7v3.9h3.2V7z" fill="#20F2BC"/>' +
    '</svg>';

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
    return (s && (s.id || s.user_id || s.uid)) || 'local';
  }

  function myUsername() {
    try {
      if (typeof getUsername === 'function') return String(getUsername() || '').toLowerCase();
      var s = sessionUser();
      return String((s && (s.username || s.user_name)) || '').toLowerCase();
    } catch (e) {
      return '';
    }
  }

  function getCoins() {
    try {
      var n = parseInt(localStorage.getItem('tchilo_coins_' + uid()) || '0', 10);
      return isNaN(n) ? 0 : Math.max(0, n);
    } catch (e) {
      return 0;
    }
  }

  function setCoins(n) {
    try {
      localStorage.setItem('tchilo_coins_' + uid(), String(Math.max(0, n | 0)));
    } catch (e) {}
  }

  function nameInList(list, u) {
    if (!list || !u) return false;
    try {
      for (var i = 0; i < list.length; i++) {
        var x = list[i];
        var n = String(
          typeof x === 'string' ? x : (x && (x.username || x.user_name || x.name)) || ''
        ).toLowerCase();
        if (n === u) return true;
      }
    } catch (e) {}
    return false;
  }

  function canGift(username, followBtn) {
    if (!username) return false;
    var me = myUsername();
    var u = String(username).replace(/^@/, '').toLowerCase();
    if (!u || (me && u === me)) return false;

    /* Pelo estado do botão Seguir no post */
    if (followBtn) {
      if (followBtn.classList.contains('following') || followBtn.classList.contains('friends')) {
        return true;
      }
      var txt = (followBtn.textContent || '').trim().toLowerCase();
      if (
        txt === 'seguido' ||
        txt === 'seguindo' ||
        txt === 'a seguir' ||
        txt === 'amigos' ||
        txt === 'following' ||
        txt === 'friends'
      ) {
        return true;
      }
    }

    try {
      if (typeof isFriend === 'function' && isFriend(username)) return true;
      if (typeof isFriend === 'function' && isFriend(u)) return true;
      if (typeof isFollowing === 'function' && isFollowing(username)) return true;
      if (typeof isFollowing === 'function' && isFollowing(u)) return true;
    } catch (e) {}

    try {
      if (typeof isFollowedBy === 'function' && isFollowedBy(username)) return true;
    } catch (e2) {}

    try {
      if (typeof getFollowers === 'function' && nameInList(getFollowers(), u)) return true;
      if (typeof getFollowing === 'function' && nameInList(getFollowing(), u)) return true;
    } catch (e3) {}

    /* storage local comum */
    try {
      var keys = [
        'tchilo_following',
        'following',
        'tchilo_followers_' + uid(),
        'followers',
        'tchilo_following_' + uid()
      ];
      for (var k = 0; k < keys.length; k++) {
        var raw = localStorage.getItem(keys[k]);
        if (!raw) continue;
        var arr = JSON.parse(raw);
        if (nameInList(arr, u)) return true;
      }
    } catch (e4) {}

    return false;
  }

  function injectCSS() {
    var st = document.getElementById('tchiloGiftsCSS');
    if (!st) {
      st = document.createElement('style');
      st.id = 'tchiloGiftsCSS';
      (document.head || document.documentElement).appendChild(st);
    }
    st.textContent =
      '.tchilo-gift-btn{' +
      'display:inline-flex!important;align-items:center;justify-content:center;' +
      'width:36px!important;height:36px!important;min-width:36px!important;' +
      'padding:0!important;margin:0 6px 0 0!important;' +
      'border:0!important;border-radius:50%!important;' +
      'background:transparent!important;cursor:pointer!important;' +
      'vertical-align:middle;flex-shrink:0;visibility:visible!important;opacity:1!important;' +
      'position:relative;z-index:2;}' +
      '.tchilo-gift-btn svg{width:22px!important;height:22px!important;display:block!important;}' +
      '.tchilo-gift-btn:active{transform:scale(.92);}' +
      /* garantir linha do header com follow + gift */
      '.post-user,.post-meta,.post-header{' +
      'display:flex;align-items:center;}' +
      '.post-follow{flex-shrink:0;}';
  }

  function extractUsername(postEl, follow) {
    var u = '';
    try {
      u =
        postEl.getAttribute('data-username') ||
        postEl.getAttribute('data-user') ||
        '';
    } catch (e) {}
    if (!u && follow) {
      var oc = follow.getAttribute('onclick') || '';
      var m = oc.match(/toggleFollow\(['"]([^'"]+)['"]/);
      if (m) u = m[1];
    }
    if (!u) {
      try {
        var a = postEl.querySelector(
          '[data-username], .post-user b, .post-meta b, .post-author, a[href*="@"]'
        );
        if (a) {
          u =
            a.getAttribute('data-username') ||
            (a.textContent || '').replace(/^@/, '').trim().split(/\s/)[0];
        }
      } catch (e2) {}
    }
    return String(u || '').replace(/^@/, '').trim();
  }

  function findPostId(postEl) {
    return (
      postEl.getAttribute('data-post-id') ||
      postEl.getAttribute('data-id') ||
      postEl.id ||
      ''
    );
  }

  function sendGift(username, postId, btn) {
    var coins = getCoins();
    if (coins < COST) {
      toast('Precisas de ' + COST + ' moedas (tens ' + coins + ')');
      return;
    }
    if (!confirm('Enviar presente a @' + username + ' por ' + COST + ' moedas?')) return;

    setCoins(coins - COST);

    try {
      var key = 'tchilo_gifts_sent_' + uid();
      var list = JSON.parse(localStorage.getItem(key) || '[]');
      list.unshift({ to: username, post_id: postId, coins: COST, at: Date.now() });
      localStorage.setItem(key, JSON.stringify(list.slice(0, 200)));
    } catch (e) {}

    try {
      var client = window.supabaseClient || window.sb || window.supabase;
      var c = client && (client.from ? client : client.client);
      if (c && c.from) {
        c.from('gifts')
          .insert({
            from_user_id: uid() === 'local' ? null : uid(),
            to_username: username,
            post_id: postId || null,
            coins: COST,
            kind: 'post_gift'
          })
          .then(function () {})
          .catch(function () {});
      }
    } catch (e2) {}

    toast('Presente enviado a @' + username + ' (−' + COST + ' moedas)');
    try {
      btn.style.transform = 'scale(1.15)';
      setTimeout(function () {
        btn.style.transform = '';
      }, 180);
    } catch (e3) {}
  }

  function attachToPost(postEl) {
    if (!postEl) return;
    if (postEl.querySelector('.tchilo-gift-btn')) return;

    var follow =
      postEl.querySelector('button.post-follow, .post-follow, button.follow-btn') || null;
    if (!follow) return;

    var username = extractUsername(postEl, follow);
    if (!canGift(username, follow)) return;

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'tchilo-gift-btn';
    btn.setAttribute('aria-label', 'Enviar presente');
    btn.setAttribute('title', 'Presente · ' + COST + ' moedas');
    btn.innerHTML = GIFT_SVG;
    btn.addEventListener(
      'click',
      function (e) {
        e.preventDefault();
        e.stopPropagation();
        sendGift(username, findPostId(postEl), btn);
      },
      true
    );

    /* À ESQUERDA do botão Seguir */
    if (follow.parentNode) {
      follow.parentNode.insertBefore(btn, follow);
    }
  }

  function scan() {
    injectCSS();
    try {
      var roots = document.querySelectorAll(
        '#feedList .post, #screen-feed .post, .feed-list .post'
      );
      if (!roots.length) {
        roots = document.querySelectorAll('.post');
      }
      for (var i = 0; i < roots.length; i++) attachToPost(roots[i]);
    } catch (e) {}
  }

  injectCSS();
  scan();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scan);
  }
  [200, 600, 1500, 3500].forEach(function (ms) {
    setTimeout(scan, ms);
  });

  try {
    var feed = document.getElementById('feedList') || document.body;
    if (feed && !feed.__tchiloGiftsObs) {
      feed.__tchiloGiftsObs = true;
      var t = null;
      new MutationObserver(function () {
        if (t) clearTimeout(t);
        t = setTimeout(scan, 80);
      }).observe(feed, { childList: true, subtree: true });
    }
  } catch (e) {}

  /* Re-scan quando o feed for re-renderizado */
  try {
    if (typeof window.renderFeed === 'function' && !window.renderFeed.__tchiloGifts) {
      var rf = window.renderFeed;
      window.renderFeed = function () {
        var r = rf.apply(this, arguments);
        setTimeout(scan, 50);
        setTimeout(scan, 300);
        return r;
      };
      window.renderFeed.__tchiloGifts = true;
    }
  } catch (e2) {}

  window.tchiloCanGift = canGift;
  window.tchiloSendPostGift = sendGift;
})();

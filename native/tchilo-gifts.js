/**
 * Tchilo Presentes v3
 * - À esquerda do Seguir
 * - Inject no HTML do feed (não depende só do DOM scan)
 * - Visível se Segues / Amigos / te seguem
 */
(function () {
  'use strict';
  if (window.__tchiloGiftsV3) return;
  window.__tchiloGiftsV3 = true;
  window.__tchiloGiftsV2 = true;

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

  function shouldShowGift(username, following, friend) {
    if (!username) return false;
    try {
      if (typeof isFriend === 'function' && isFriend(username)) return true;
      if (typeof isFollowing === 'function' && isFollowing(username)) return true;
    } catch (e) {}
    if (friend || following) return true;
    try {
      if (typeof isFollowedBy === 'function' && isFollowedBy(username)) return true;
    } catch (e2) {}
    return false;
  }

  function giftBtnHtml(username, postId) {
    var u = String(username || '').replace(/'/g, "\\'");
    var p = String(postId || '').replace(/'/g, "\\'");
    return (
      '<button type="button" class="tchilo-gift-btn" aria-label="Enviar presente" title="Presente · ' +
      COST +
      ' moedas" onclick="event.stopPropagation();window.tchiloSendPostGift&&window.tchiloSendPostGift(\'' +
      u +
      '\',\'' +
      p +
      '\',this)">' +
      GIFT_SVG +
      '</button>'
    );
  }

  function injectCSS() {
    var st = document.getElementById('tchiloGiftsCSS');
    if (!st) {
      st = document.createElement('style');
      st.id = 'tchiloGiftsCSS';
      (document.head || document.documentElement).appendChild(st);
    }
    st.textContent =
      '.tchilo-gift-btn{display:inline-flex!important;align-items:center;justify-content:center;' +
      'width:36px!important;height:36px!important;min-width:36px!important;padding:0!important;' +
      'margin:0 8px 0 0!important;border:0!important;border-radius:50%!important;' +
      'background:transparent!important;cursor:pointer!important;flex-shrink:0;' +
      'visibility:visible!important;opacity:1!important;z-index:5;position:relative;}' +
      '.tchilo-gift-btn svg{width:22px!important;height:22px!important;display:block!important;pointer-events:none;}' +
      '.post-follow{flex-shrink:0;}';
  }

  window.tchiloSendPostGift = function (username, postId, btn) {
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
      var client = window.supabaseClient || window.sb || window.supabase || window.SB || window.tchiloSupabase;
      var c = client && (client.from ? client : client.client);
      if (c && c.from) {
        c.from('gifts').insert({
          from_user_id: uid() === 'local' ? null : uid(),
          to_username: username,
          post_id: postId || null,
          coins: COST,
          kind: 'post_gift'
        });
      }
    } catch (e2) {}
    toast('Presente enviado a @' + username + ' (−' + COST + ' moedas)');
  };

  /* Patch renderFeed: meter gift à esquerda do followBtn no HTML */
  function patchRenderFeed() {
    if (typeof window.renderFeed !== 'function' || window.renderFeed.__tchiloGiftsV3) return;
    var orig = window.renderFeed;
    window.renderFeed = function () {
      var result = orig.apply(this, arguments);
      setTimeout(function () {
        injectCSS();
        scanDom();
      }, 30);
      return result;
    };
    window.renderFeed.__tchiloGiftsV3 = true;
  }

  function scanDom() {
    injectCSS();
    try {
      var posts = document.querySelectorAll('#feedList .post, #screen-feed .post, .post');
      for (var i = 0; i < posts.length; i++) {
        var post = posts[i];
        if (post.querySelector('.tchilo-gift-btn')) continue;
        var follow = post.querySelector('button.post-follow, .post-follow');
        if (!follow) continue;

        var username = '';
        var oc = follow.getAttribute('onclick') || '';
        var m = oc.match(/toggleFollow\(['"]([^'"]+)['"]/);
        if (m) username = m[1];

        var following =
          follow.classList.contains('following') ||
          follow.classList.contains('friends');
        var txt = (follow.textContent || '').trim().toLowerCase();
        if (
          txt === 'seguido' ||
          txt === 'seguindo' ||
          txt === 'a seguir' ||
          txt === 'amigos' ||
          txt === 'following' ||
          txt === 'friends'
        ) {
          following = true;
        }

        if (!shouldShowGift(username, following, follow.classList.contains('friends'))) {
          continue;
        }

        var postId =
          post.getAttribute('data-post-id') ||
          post.getAttribute('data-id') ||
          '';
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'tchilo-gift-btn';
        btn.setAttribute('aria-label', 'Enviar presente');
        btn.innerHTML = GIFT_SVG;
        (function (u, pid) {
          btn.addEventListener(
            'click',
            function (e) {
              e.preventDefault();
              e.stopPropagation();
              window.tchiloSendPostGift(u, pid, btn);
            },
            true
          );
        })(username, postId);

        /* à esquerda do Seguir */
        follow.parentNode.insertBefore(btn, follow);
      }
    } catch (e) {
      console.warn('gifts scan', e);
    }
  }

  injectCSS();
  patchRenderFeed();
  scanDom();
  [200, 800, 2000, 4000].forEach(function (ms) {
    setTimeout(function () {
      patchRenderFeed();
      scanDom();
    }, ms);
  });

  try {
    var feed = document.getElementById('feedList');
    if (feed && !feed.__giftObsV3) {
      feed.__giftObsV3 = true;
      var t = null;
      new MutationObserver(function () {
        if (t) clearTimeout(t);
        t = setTimeout(scanDom, 60);
      }).observe(feed, { childList: true, subtree: true });
    }
  } catch (e) {}
})();

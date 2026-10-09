/**
 * Tchilo Presentes no post v1
 * - Ícone ao lado de Seguir/Seguindo
 * - Só se segues ou te seguem (ou Amigos)
 * - Custa 35 moedas
 */
(function () {
  'use strict';
  if (window.__tchiloGiftsV1) return;
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

  function canGift(username) {
    if (!username) return false;
    var me = myUsername();
    var u = String(username).toLowerCase();
    if (!u || (me && u === me)) return false;
    try {
      if (typeof isFriend === 'function' && isFriend(username)) return true;
      if (typeof isFollowing === 'function' && isFollowing(username)) return true;
    } catch (e) {}
    /* te segue? */
    try {
      if (typeof getFollowers === 'function') {
        var fl = getFollowers() || [];
        if (fl.some(function (x) {
          return String(x).toLowerCase() === u || String((x && x.username) || '').toLowerCase() === u;
        })) return true;
      }
    } catch (e2) {}
    try {
      if (typeof isFollowedBy === 'function' && isFollowedBy(username)) return true;
    } catch (e3) {}
    /* fallback local follows inverse */
    try {
      var raw = localStorage.getItem('tchilo_followers_' + uid()) || localStorage.getItem('followers') || '[]';
      var arr = JSON.parse(raw);
      if (Array.isArray(arr) && arr.some(function (x) {
        return String(x).toLowerCase() === u || String((x && x.username) || '').toLowerCase() === u;
      })) return true;
    } catch (e4) {}
    return false;
  }

  function injectCSS() {
    if (document.getElementById('tchiloGiftsCSS')) return;
    var st = document.createElement('style');
    st.id = 'tchiloGiftsCSS';
    st.textContent =
      '.tchilo-gift-btn{' +
      'display:inline-flex;align-items:center;justify-content:center;' +
      'width:36px;height:36px;min-width:36px;padding:0;margin-left:6px;' +
      'border:0;border-radius:50%;background:transparent;cursor:pointer;' +
      'vertical-align:middle;flex-shrink:0;}' +
      '.tchilo-gift-btn svg{width:22px;height:22px;display:block;}' +
      '.tchilo-gift-btn:active{transform:scale(.92);}' +
      '.post-follow,.follow-btn{vertical-align:middle;}' +
      '.tchilo-gift-wrap{display:inline-flex;align-items:center;gap:2px;}';
    document.head.appendChild(st);
  }

  function findAuthor(postEl) {
    try {
      var u =
        postEl.getAttribute('data-username') ||
        postEl.getAttribute('data-user') ||
        '';
      if (u) return u;
      var a = postEl.querySelector('[data-username], .post-user b, .post-meta b, .post-author');
      if (a) {
        return a.getAttribute('data-username') || (a.textContent || '').replace('@', '').trim();
      }
    } catch (e) {}
    return '';
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
    if (!canGift(username)) {
      toast('Só podes enviar presente a quem segues ou te segue');
      return;
    }
    var coins = getCoins();
    if (coins < COST) {
      toast('Precisas de ' + COST + ' moedas (tens ' + coins + ')');
      return;
    }
    if (!confirm('Enviar presente a @' + username + ' por ' + COST + ' moedas?')) return;

    setCoins(coins - COST);

    /* registo local */
    try {
      var key = 'tchilo_gifts_sent_' + uid();
      var list = JSON.parse(localStorage.getItem(key) || '[]');
      list.unshift({
        to: username,
        post_id: postId,
        coins: COST,
        at: Date.now()
      });
      localStorage.setItem(key, JSON.stringify(list.slice(0, 200)));
    } catch (e) {}

    /* Supabase se existir */
    try {
      if (window.supabaseClient || window.sb || window.supabase) {
        var client = window.supabaseClient || window.sb || window.supabase;
        var c = client.from ? client : client.client || client;
        if (c && c.from) {
          c.from('gifts')
            .insert({
              from_user_id: uid(),
              to_username: username,
              post_id: postId || null,
              coins: COST,
              kind: 'post_gift'
            })
            .then(function () {})
            .catch(function () {});
          c.from('coin_balances')
            .upsert({ user_id: uid(), balance: getCoins(), updated_at: new Date().toISOString() })
            .then(function () {})
            .catch(function () {});
        }
      }
    } catch (e2) {}

    toast('Presente enviado a @' + username + ' (−' + COST + ' moedas)');
    try {
      btn.style.transform = 'scale(1.2)';
      setTimeout(function () {
        btn.style.transform = '';
      }, 200);
    } catch (e3) {}
  }

  function attachToPost(postEl) {
    if (!postEl || postEl.querySelector('.tchilo-gift-btn')) return;

    var follow =
      postEl.querySelector('.post-follow, button.follow-btn, .follow-btn') ||
      null;
    if (!follow) return;

    var username = findAuthor(postEl);
    if (!username) {
      /* tentar pelo onclick do follow */
      var oc = follow.getAttribute('onclick') || '';
      var m = oc.match(/toggleFollow\(['"]([^'"]+)['"]/);
      if (m) username = m[1];
    }
    if (!canGift(username)) return;

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'tchilo-gift-btn';
    btn.setAttribute('aria-label', 'Enviar presente');
    btn.setAttribute('title', 'Presente · ' + COST + ' moedas');
    btn.innerHTML = GIFT_SVG;
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      sendGift(username, findPostId(postEl), btn);
    });

    if (follow.parentNode) {
      follow.parentNode.insertBefore(btn, follow.nextSibling);
    }
  }

  function scan() {
    injectCSS();
    try {
      document.querySelectorAll('#feedList .post, .feed-list .post, .post').forEach(attachToPost);
    } catch (e) {}
  }

  scan();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scan);
  }
  [400, 1200, 3000].forEach(function (ms) {
    setTimeout(scan, ms);
  });
  try {
    new MutationObserver(function () {
      scan();
    }).observe(document.getElementById('feedList') || document.body || document.documentElement, {
      childList: true,
      subtree: true
    });
  } catch (e) {}

  window.tchiloCanGift = canGift;
  window.tchiloSendPostGift = sendGift;
})();

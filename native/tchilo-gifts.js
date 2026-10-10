/**
 * Tchilo Presentes v4
 * - Ícone colado à esquerda do Seguir/Seguido
 * - Clique abre tipos de presente (não envia logo)
 */
(function () {
  'use strict';
  if (window.__tchiloGiftsV4) return;
  window.__tchiloGiftsV4 = true;

  var COST_DEFAULT = 35;

  /* Tipos placeholder — depois substitui pelos reais */
  var GIFT_TYPES = [
    { id: 'gift_basic', name: 'Presente', coins: 35 }
  ];

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

  function injectCSS() {
    var st = document.getElementById('tchiloGiftsCSS');
    if (!st) {
      st = document.createElement('style');
      st.id = 'tchiloGiftsCSS';
      (document.head || document.documentElement).appendChild(st);
    }
    st.textContent =
      /* grupo gift + seguir colados à direita */
      '.tchilo-gf-wrap{' +
      'display:inline-flex!important;align-items:center!important;' +
      'gap:4px!important;margin-left:auto!important;flex-shrink:0!important;}' +
      '.tchilo-gf-wrap .post-follow{margin-left:0!important;}' +
      '.tchilo-gift-btn{' +
      'display:inline-flex!important;align-items:center;justify-content:center;' +
      'width:34px!important;height:34px!important;min-width:34px!important;' +
      'padding:0!important;margin:0!important;border:0!important;' +
      'border-radius:50%!important;background:transparent!important;' +
      'cursor:pointer!important;flex-shrink:0;visibility:visible!important;opacity:1!important;}' +
      '.tchilo-gift-btn svg{width:22px!important;height:22px!important;display:block!important;pointer-events:none;}' +
      /* sheet tipos */
      '#tchiloGiftSheet{position:fixed;inset:0;z-index:2147483640;display:none;align-items:flex-end;justify-content:center;background:rgba(11,11,12,.45);}' +
      '#tchiloGiftSheet.open{display:flex!important;}' +
      '#tchiloGiftSheet .panel{width:100%;max-width:480px;background:var(--paper,#F6F1E7);color:var(--ink,#0B0B0C);' +
      'border-radius:20px 20px 0 0;padding:16px 16px calc(16px + env(safe-area-inset-bottom));}' +
      '#tchiloGiftSheet .handle{width:40px;height:4px;background:#ccc;border-radius:2px;margin:0 auto 12px;}' +
      '#tchiloGiftSheet h3{margin:0 0 6px;font-size:18px;font-weight:900;text-align:center;}' +
      '#tchiloGiftSheet .sub{text-align:center;font-size:13px;opacity:.6;margin-bottom:14px;}' +
      '#tchiloGiftSheet .grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;}' +
      '#tchiloGiftSheet .gitem{border:2px solid rgba(11,11,12,.1);border-radius:14px;background:#fff;padding:14px 8px;text-align:center;cursor:pointer;}' +
      '#tchiloGiftSheet .gitem .ic{display:flex;justify-content:center;margin-bottom:6px;}' +
      '#tchiloGiftSheet .gitem b{display:block;font-size:13px;}' +
      '#tchiloGiftSheet .gitem span{font-size:12px;opacity:.65;font-weight:700;}' +
      '#tchiloGiftSheet .cancel{width:100%;margin-top:14px;padding:14px;border:0;border-radius:14px;' +
      'background:#fff;color:#0B0B0C;font-weight:900;font-size:15px;border:2px solid rgba(11,11,12,.12);cursor:pointer;}';
  }

  function closeGiftSheet() {
    var el = document.getElementById('tchiloGiftSheet');
    if (el) el.classList.remove('open');
  }

  function sendGift(username, postId, gift) {
    var cost = (gift && gift.coins) || COST_DEFAULT;
    var coins = getCoins();
    if (coins < cost) {
      toast('Precisas de ' + cost + ' moedas (tens ' + coins + ')');
      return;
    }
    setCoins(coins - cost);
    try {
      var key = 'tchilo_gifts_sent_' + uid();
      var list = JSON.parse(localStorage.getItem(key) || '[]');
      list.unshift({
        to: username,
        post_id: postId,
        gift_id: gift && gift.id,
        coins: cost,
        at: Date.now()
      });
      localStorage.setItem(key, JSON.stringify(list.slice(0, 200)));
    } catch (e) {}
    try {
      var client =
        window.supabaseClient || window.sb || window.supabase || window.SB || window.tchiloSupabase;
      var c = client && (client.from ? client : client.client);
      if (c && c.from) {
        c.from('gifts').insert({
          from_user_id: uid() === 'local' ? null : uid(),
          to_username: username,
          post_id: postId || null,
          coins: cost,
          kind: (gift && gift.id) || 'post_gift'
        });
      }
    } catch (e2) {}
    closeGiftSheet();
    toast('Presente enviado a @' + username + ' (−' + cost + ' moedas)');
  }

  window.tchiloOpenGiftSheet = function (username, postId) {
    injectCSS();
    var sheet = document.getElementById('tchiloGiftSheet');
    if (!sheet) {
      sheet = document.createElement('div');
      sheet.id = 'tchiloGiftSheet';
      document.body.appendChild(sheet);
    }
    sheet.innerHTML =
      '<div class="panel">' +
      '<div class="handle"></div>' +
      '<h3>Enviar presente</h3>' +
      '<div class="sub">Para @' +
      String(username || '').replace(/</g, '') +
      ' · Saldo: ' +
      getCoins() +
      ' moedas</div>' +
      '<div class="grid" id="tchiloGiftGrid"></div>' +
      '<button type="button" class="cancel" data-a="close">Cancelar</button></div>';

    var grid = sheet.querySelector('#tchiloGiftGrid');
    GIFT_TYPES.forEach(function (g) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'gitem';
      b.innerHTML =
        '<div class="ic">' +
        GIFT_SVG +
        '</div><b>' +
        g.name +
        '</b><span>' +
        g.coins +
        ' moedas</span>';
      b.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        sendGift(username, postId, g);
      };
      grid.appendChild(b);
    });

    sheet.onclick = function (e) {
      if (e.target === sheet || (e.target.closest && e.target.closest('[data-a="close"]'))) {
        closeGiftSheet();
      }
    };
    sheet.classList.add('open');
  };

  window.tchiloSendPostGift = function (username, postId) {
    window.tchiloOpenGiftSheet(username, postId);
  };

  function shouldShow(username, follow) {
    if (!username) return false;
    if (follow) {
      if (follow.classList.contains('following') || follow.classList.contains('friends')) return true;
      var txt = (follow.textContent || '').trim().toLowerCase();
      if (
        txt === 'seguido' ||
        txt === 'seguindo' ||
        txt === 'a seguir' ||
        txt === 'amigos' ||
        txt === 'following' ||
        txt === 'friends'
      )
        return true;
    }
    try {
      if (typeof isFriend === 'function' && isFriend(username)) return true;
      if (typeof isFollowing === 'function' && isFollowing(username)) return true;
    } catch (e) {}
    return false;
  }

  function scan() {
    injectCSS();
    try {
      document.querySelectorAll('#feedList .post, #screen-feed .post, .post').forEach(function (post) {
        if (post.querySelector('.tchilo-gift-btn')) return;
        var follow = post.querySelector('button.post-follow, .post-follow');
        if (!follow) return;

        var username = '';
        var oc = follow.getAttribute('onclick') || '';
        var m = oc.match(/toggleFollow\(['"]([^'"]+)['"]/);
        if (m) username = m[1];
        if (!shouldShow(username, follow)) return;

        var postId =
          post.getAttribute('data-post-id') || post.getAttribute('data-id') || '';

        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'tchilo-gift-btn';
        btn.setAttribute('aria-label', 'Presente');
        btn.innerHTML = GIFT_SVG;
        btn.addEventListener(
          'click',
          function (e) {
            e.preventDefault();
            e.stopPropagation();
            window.tchiloOpenGiftSheet(username, postId);
          },
          true
        );

        /* Envolver gift + follow para ficarem juntos à direita */
        var wrap = document.createElement('span');
        wrap.className = 'tchilo-gf-wrap';
        follow.parentNode.insertBefore(wrap, follow);
        wrap.appendChild(btn);
        wrap.appendChild(follow);
      });
    } catch (e) {
      console.warn('gifts scan', e);
    }
  }

  injectCSS();
  scan();
  [200, 800, 2000, 4000].forEach(function (ms) {
    setTimeout(scan, ms);
  });

  try {
    if (typeof window.renderFeed === 'function' && !window.renderFeed.__giftsV4) {
      var rf = window.renderFeed;
      window.renderFeed = function () {
        var r = rf.apply(this, arguments);
        setTimeout(scan, 40);
        setTimeout(scan, 250);
        return r;
      };
      window.renderFeed.__giftsV4 = true;
    }
  } catch (e) {}

  try {
    var feed = document.getElementById('feedList');
    if (feed && !feed.__giftObsV4) {
      feed.__giftObsV4 = true;
      var t = null;
      new MutationObserver(function () {
        if (t) clearTimeout(t);
        t = setTimeout(scan, 60);
      }).observe(feed, { childList: true, subtree: true });
    }
  } catch (e2) {}
})();

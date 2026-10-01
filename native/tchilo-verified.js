/**
 * Tchilo — Selo verificado (mensal, $2 via Paddle)
 * v2 — menos refresh (evita piscar o feed)
 */
(function () {
  'use strict';
  if (window.__tchiloVerifiedV2) return;
  window.__tchiloVerifiedV2 = true;
  window.__tchiloVerifiedV1 = true;

  var PADDLE_TOKEN = 'live_05be77c7629150c894e94e62559';
  var PRICE_ID = 'pri_01m3ww7f3xp4vmh2yjbbxtzfam';
  var PRODUCT_ID = 'pro_01m3ww2g14vv94gzbr2yqkk7h6';
  var PRICE_LABEL = 'Selo verificado';
  var PRICE_AMOUNT = '2 USD / mês';
  var cache = {};

  function toast(msg) {
    try {
      if (typeof showToast === 'function') showToast(String(msg));
    } catch (e) {}
  }
  function SB() {
    return window.tchiloSupabase || window.supabaseClient || null;
  }
  function sessionUser() {
    try {
      if (typeof getSession === 'function') return getSession();
      return JSON.parse(localStorage.getItem('tchilo_session') || 'null');
    } catch (e) {
      return null;
    }
  }
  async function currentUid() {
    if (window.__tchiloCloudUserId) return window.__tchiloCloudUserId;
    var s = SB();
    if (!s) return null;
    try {
      var auth = await s.auth.getSession();
      var uid =
        auth && auth.data && auth.data.session && auth.data.session.user && auth.data.session.user.id;
      if (uid) window.__tchiloCloudUserId = uid;
      return uid || null;
    } catch (e) {
      return null;
    }
  }
  function isStillValid(until) {
    if (!until) return true;
    try {
      return new Date(until).getTime() > Date.now();
    } catch (e) {
      return true;
    }
  }
  async function fetchVerified(username) {
    if (!username) return false;
    var key = String(username).toLowerCase();
    if (cache[key] && cache[key].at && Date.now() - cache[key].at < 120000) {
      return !!(cache[key].verified && isStillValid(cache[key].until));
    }
    var s = SB();
    if (!s) return false;
    try {
      var r = await s
        .from('profiles')
        .select('is_verified,verified_until')
        .ilike('username', username)
        .maybeSingle();
      if (r.data) {
        var ok = !!(r.data.is_verified && isStillValid(r.data.verified_until));
        cache[key] = { verified: ok, until: r.data.verified_until, at: Date.now() };
        return ok;
      }
    } catch (e2) {}
    return false;
  }
  async function isMeVerified() {
    var sess = sessionUser();
    if (!sess) return false;
    if (sess.isVerified && isStillValid(sess.verifiedUntil)) return true;
    var uid = await currentUid();
    var s = SB();
    if (!s || !uid) return fetchVerified(sess.username);
    try {
      var r = await s.from('profiles').select('is_verified,verified_until').eq('id', uid).maybeSingle();
      if (r.data) {
        var ok = !!(r.data.is_verified && isStillValid(r.data.verified_until));
        if (ok) {
          sess.isVerified = true;
          sess.verifiedUntil = r.data.verified_until;
          try {
            if (typeof setSession === 'function') setSession(sess);
          } catch (e) {}
        }
        return ok;
      }
    } catch (e4) {}
    return fetchVerified(sess.username);
  }
  function badgeSvg(size) {
    size = size || 16;
    return (
      '<svg class="tchilo-verif-badge" width="' +
      size +
      '" height="' +
      size +
      '" viewBox="0 0 24 24" aria-label="Verificado">' +
      '<circle cx="12" cy="12" r="11" fill="#1D9BF0"/>' +
      '<path d="M7.5 12.2l2.8 2.8 6.2-6.4" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>' +
      '</svg>'
    );
  }
  function injectCSS() {
    if (document.getElementById('tchiloVerifiedCSS')) return;
    var st = document.createElement('style');
    st.id = 'tchiloVerifiedCSS';
    st.textContent =
      '.tchilo-verif-badge{display:inline-block;vertical-align:middle;margin-left:4px;flex-shrink:0;}' +
      '.tchilo-name-with-badge{display:inline-flex;align-items:center;gap:2px;}' +
      '#tchiloVerifiedSheet{position:fixed;inset:0;z-index:2147483640;display:none;align-items:flex-end;justify-content:center;background:rgba(11,11,12,.55);}' +
      '#tchiloVerifiedSheet.open{display:flex!important;}' +
      '#tchiloVerifiedSheet .panel{width:100%;max-width:480px;background:var(--paper,#F3F1E9);color:var(--ink,#0B0B0C);border-radius:22px 22px 0 0;padding:18px 16px calc(22px + env(safe-area-inset-bottom));border:3px solid var(--ink,#0B0B0C);border-bottom:0;}' +
      '#tchiloVerifiedSheet h2{margin:0 0 6px;font-family:Anton,Impact,sans-serif;font-size:24px;text-align:center;}' +
      '#tchiloVerifiedSheet .sub{text-align:center;opacity:.7;font-size:13px;margin:0 0 14px;font-weight:600;}' +
      '#tchiloVerifiedSheet .benefits{list-style:none;padding:0;margin:0 0 16px;}' +
      '#tchiloVerifiedSheet .benefits li{padding:10px 12px;margin:0 0 8px;border-radius:14px;border:2px solid var(--ink,#0B0B0C);background:#fff;font-weight:700;font-size:14px;}' +
      '#tchiloVerifiedSheet .price{text-align:center;font-size:26px;font-weight:900;margin:0 0 4px;}' +
      '#tchiloVerifiedSheet .price-note{text-align:center;font-size:12px;opacity:.6;margin:0 0 16px;}' +
      '#tchiloVerifiedSheet .pay{width:100%;padding:14px;border-radius:14px;font-weight:900;font-size:16px;border:2.5px solid var(--ink,#0B0B0C);background:#1D9BF0;color:#fff;box-shadow:3px 3px 0 var(--ink,#0B0B0C);cursor:pointer;}' +
      '#tchiloVerifiedSheet .close{width:100%;margin-top:10px;padding:12px;border-radius:14px;font-weight:800;border:2px solid var(--ink,#0B0B0C);background:transparent;cursor:pointer;}' +
      '#tchiloVerifiedSheet .active-badge{text-align:center;padding:12px;border-radius:14px;font-weight:800;background:#D6F0FF;border:2px solid var(--ink,#0B0B0C);margin-bottom:12px;}';
    document.head.appendChild(st);
  }
  function loadPaddle() {
    return new Promise(function (resolve, reject) {
      if (window.Paddle && window.Paddle.Checkout) return resolve(window.Paddle);
      var s = document.createElement('script');
      s.src = 'https://cdn.paddle.com/paddle/v2/paddle.js';
      s.async = true;
      s.onload = function () {
        resolve(window.Paddle);
      };
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }
  async function openCheckout() {
    var sess = sessionUser();
    if (!sess) {
      toast('Inicia sessão primeiro');
      return;
    }
    toast('A abrir pagamento…');
    try {
      var Paddle = await loadPaddle();
      if (!window.__tchiloPaddleInited) {
        Paddle.Initialize({ token: PADDLE_TOKEN });
        window.__tchiloPaddleInited = true;
      }
      var uid = await currentUid();
      Paddle.Checkout.open({
        items: [{ priceId: PRICE_ID, quantity: 1 }],
        customer: sess.email ? { email: sess.email } : undefined,
        customData: {
          user_id: uid || '',
          username: sess.username || '',
          product: 'verified_badge',
          product_id: PRODUCT_ID
        },
        settings: {
          successUrl: (location.origin || 'https://tchilopop.com') + '/?verified=1',
          displayMode: 'overlay'
        }
      });
    } catch (err) {
      toast('Erro ao abrir pagamento');
    }
  }
  async function openVerifiedSheet() {
    injectCSS();
    var sheet = document.getElementById('tchiloVerifiedSheet');
    if (!sheet) {
      sheet = document.createElement('div');
      sheet.id = 'tchiloVerifiedSheet';
      document.body.appendChild(sheet);
    }
    var on = await isMeVerified();
    sheet.innerHTML =
      '<div class="panel"><h2>Selo verificado ' +
      badgeSvg(22) +
      '</h2><p class="sub">Mostra autenticidade no perfil e no feed</p>' +
      (on ? '<div class="active-badge">Selo ativo nesta conta</div>' : '') +
      '<ul class="benefits"><li>Selo azul junto ao nome</li><li>Visível no perfil e no feed</li><li>Renovação mensal</li></ul>' +
      '<div class="price">' +
      PRICE_AMOUNT +
      '</div><p class="price-note">' +
      PRICE_LABEL +
      ' · mensal via Paddle</p>' +
      (on
        ? '<button type="button" class="close" data-a="close">Fechar</button>'
        : '<button type="button" class="pay" data-a="pay">Obter selo verificado</button><button type="button" class="close" data-a="close">Agora não</button>') +
      '</div>';
    sheet.classList.add('open');
    sheet.onclick = function (e) {
      if (e.target === sheet) sheet.classList.remove('open');
    };
    sheet.querySelectorAll('[data-a]').forEach(function (b) {
      b.onclick = function (e) {
        e.preventDefault();
        if (b.getAttribute('data-a') === 'close') sheet.classList.remove('open');
        if (b.getAttribute('data-a') === 'pay') openCheckout();
      };
    });
  }
  window.tchiloOpenVerified = openVerifiedSheet;

  function injectSettings() {
    var list = document.querySelector('#screen-settings .settings-list');
    if (!list || document.getElementById('settings-verified-item')) return;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'settings-item';
    btn.id = 'settings-verified-item';
    btn.innerHTML =
      '<div class="si-icon" style="background:#1D9BF0;color:#fff">' +
      badgeSvg(18) +
      '</div><span>Selo verificado</span><div class="chev">›</div>';
    btn.onclick = function (e) {
      e.preventDefault();
      openVerifiedSheet();
    };
    var prem = document.getElementById('settings-premium-item');
    if (prem && prem.parentNode) prem.parentNode.insertBefore(btn, prem.nextSibling);
    else if (list.firstChild) list.insertBefore(btn, list.firstChild);
    else list.appendChild(btn);
  }

  function wrapNameEl(el, username) {
    if (!el || el.querySelector('.tchilo-verif-badge')) return;
    fetchVerified(username).then(function (ok) {
      if (!ok || !el || el.querySelector('.tchilo-verif-badge')) return;
      var span = document.createElement('span');
      span.className = 'tchilo-name-with-badge';
      while (el.firstChild) span.appendChild(el.firstChild);
      span.insertAdjacentHTML('beforeend', badgeSvg(15));
      el.appendChild(span);
    });
  }

  var paintQueued = false;
  function paintBadges() {
    if (paintQueued) return;
    paintQueued = true;
    requestAnimationFrame(function () {
      paintQueued = false;
      injectCSS();
      try {
        var nameEl =
          document.querySelector('#screen-profile .profile-display-name') ||
          document.querySelector('#screen-profile h1');
        var user = window.viewingProfileUser || (sessionUser() && sessionUser().username);
        if (nameEl && user) wrapNameEl(nameEl, user);
      } catch (e) {}
      document.querySelectorAll('#feedList .post').forEach(function (post) {
        var userEl = post.querySelector('.user-tap') || post.querySelector('.post-user');
        if (!userEl) return;
        var u =
          userEl.getAttribute('data-user') ||
          (userEl.textContent || '').replace(/^@/, '').trim().split(/\s/)[0];
        if (u) wrapNameEl(userEl, u);
      });
    });
  }

  function boot() {
    injectCSS();
    injectSettings();
    paintBadges();
  }
  boot();
  setTimeout(boot, 800);
  /* SEM setInterval de 4s — causava piscar */

  if (typeof window.renderFeed === 'function' && !window.renderFeed.__verifiedV2) {
    var rf = window.renderFeed;
    window.renderFeed = function () {
      var r = rf.apply(this, arguments);
      setTimeout(paintBadges, 100);
      return r;
    };
    window.renderFeed.__verifiedV2 = true;
  }
  if (typeof window.goTo === 'function' && !window.goTo.__verifiedV2) {
    var g = window.goTo;
    window.goTo = function (name) {
      var r = g.apply(this, arguments);
      if (name === 'settings') setTimeout(injectSettings, 40);
      if (name === 'profile' || name === 'feed') setTimeout(paintBadges, 80);
      return r;
    };
    window.goTo.__verifiedV2 = true;
  }
})();

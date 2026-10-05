/**
 * Tchilo — Selo verificado (mensal, $2 via Paddle)
 * v4 — ícones SVG profissionais (sem emoji)
 */
(function () {
  'use strict';
  if (window.__tchiloVerifiedV4) return;
  window.__tchiloVerifiedV4 = true;
  window.__tchiloVerifiedV3 = true;
  window.__tchiloVerifiedV2 = true;
  window.__tchiloVerifiedV1 = true;

  var PADDLE_TOKEN = 'live_05be77c7629150c894e94e62559';
  var PRICE_ID = 'pri_01m3ww7f3xp4vmh2yjbbxtzfam';
  var PRODUCT_ID = 'pro_01m3ww2g14vv94gzbr2yqkk7h6';
  var PRICE_LABEL = 'Selo verificado';
  var PRICE_AMOUNT = '2 USD / mês';
  var cache = {};

  var ICO = {
    check:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>',
    shield:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l8 4v5c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V7l8-4z"/><path d="M9 12l2 2 4-4"/></svg>',
    briefcase:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M3 13h18"/></svg>',
    refresh:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-2.6-6.4"/><path d="M21 3v6h-6"/></svg>'
  };

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
    var old = document.getElementById('tchiloVerifiedCSS');
    if (old) old.remove();
    var st = document.createElement('style');
    st.id = 'tchiloVerifiedCSS';
    st.textContent =
      '.tchilo-verif-badge{display:inline-block;vertical-align:middle;margin-left:4px;flex-shrink:0;}' +
      '.tchilo-name-with-badge{display:inline-flex;align-items:center;gap:2px;}' +
      '#tchiloVerifiedSheet{position:fixed;inset:0;z-index:2147483640;display:none;flex-direction:column;background:var(--paper,#F6F1E7);color:var(--ink,#0B0B0C);overflow:hidden;}' +
      '#tchiloVerifiedSheet.open{display:flex!important;}' +
      '#tchiloVerifiedSheet .tv-top{display:flex;align-items:center;gap:10px;padding:12px 16px;padding-top:calc(12px + env(safe-area-inset-top));border-bottom:2.5px solid var(--ink,#0B0B0C);background:var(--paper,#F6F1E7);flex-shrink:0;}' +
      '#tchiloVerifiedSheet .tv-back{width:40px;height:40px;border-radius:12px;border:2.5px solid var(--ink,#0B0B0C);background:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;}' +
      '#tchiloVerifiedSheet .tv-top h1{margin:0;font-family:Anton,Impact,sans-serif;font-size:22px;letter-spacing:.02em;flex:1;}' +
      '#tchiloVerifiedSheet .tv-scroll{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:20px 18px calc(28px + env(safe-area-inset-bottom));}' +
      '#tchiloVerifiedSheet .tv-hero{text-align:center;padding:8px 0 20px;}' +
      '#tchiloVerifiedSheet .tv-hero-badge{width:72px;height:72px;margin:0 auto 14px;border-radius:50%;background:#1D9BF0;display:flex;align-items:center;justify-content:center;border:3px solid var(--ink,#0B0B0C);box-shadow:4px 4px 0 var(--ink,#0B0B0C);}' +
      '#tchiloVerifiedSheet .tv-hero h2{margin:0 0 8px;font-family:Anton,Impact,sans-serif;font-size:28px;line-height:1.1;}' +
      '#tchiloVerifiedSheet .tv-hero p{margin:0 auto;max-width:320px;font-size:14.5px;line-height:1.45;font-weight:600;opacity:.75;}' +
      '#tchiloVerifiedSheet .tv-card{background:#fff;border:2.5px solid var(--ink,#0B0B0C);border-radius:18px;padding:16px;margin:0 0 14px;box-shadow:3px 3px 0 rgba(11,11,12,.08);}' +
      '#tchiloVerifiedSheet .tv-card h3{margin:0 0 12px;font-size:13px;font-weight:900;text-transform:uppercase;letter-spacing:.06em;opacity:.55;}' +
      '#tchiloVerifiedSheet .tv-row{display:flex;gap:12px;align-items:flex-start;padding:12px 0;border-top:1.5px solid #ebe8e0;}' +
      '#tchiloVerifiedSheet .tv-row:first-of-type{border-top:0;padding-top:0;}' +
      '#tchiloVerifiedSheet .tv-row:last-child{padding-bottom:0;}' +
      '#tchiloVerifiedSheet .tv-ico{width:40px;height:40px;border-radius:12px;background:#E8F5FE;border:2px solid var(--ink,#0B0B0C);display:flex;align-items:center;justify-content:center;flex-shrink:0;}' +
      '#tchiloVerifiedSheet .tv-ico svg{width:20px;height:20px;display:block;color:#1D9BF0;}' +
      '#tchiloVerifiedSheet .tv-row b{display:block;font-size:14.5px;font-weight:800;margin-bottom:3px;}' +
      '#tchiloVerifiedSheet .tv-row span{display:block;font-size:13px;line-height:1.4;font-weight:600;opacity:.7;}' +
      '#tchiloVerifiedSheet .tv-price-box{text-align:center;padding:18px 16px;background:linear-gradient(180deg,#E8F5FE 0%,#fff 100%);border:2.5px solid var(--ink,#0B0B0C);border-radius:18px;margin:0 0 14px;}' +
      '#tchiloVerifiedSheet .tv-price-box .amt{font-size:32px;font-weight:900;letter-spacing:-.02em;}' +
      '#tchiloVerifiedSheet .tv-price-box .amt small{font-size:15px;font-weight:700;opacity:.65;}' +
      '#tchiloVerifiedSheet .tv-price-box .note{margin:8px 0 0;font-size:12.5px;font-weight:600;opacity:.65;line-height:1.4;}' +
      '#tchiloVerifiedSheet .tv-trust{font-size:12px;font-weight:600;opacity:.55;text-align:center;margin:0 0 16px;line-height:1.4;}' +
      '#tchiloVerifiedSheet .tv-actions{display:flex;flex-direction:column;gap:10px;}' +
      '#tchiloVerifiedSheet .pay{width:100%;padding:16px;border-radius:16px;font-weight:900;font-size:16px;border:2.5px solid var(--ink,#0B0B0C);background:#1D9BF0;color:#fff;box-shadow:3px 3px 0 var(--ink,#0B0B0C);cursor:pointer;}' +
      '#tchiloVerifiedSheet .pay:active{transform:scale(.98);}' +
      '#tchiloVerifiedSheet .close{width:100%;padding:14px;border-radius:16px;font-weight:800;font-size:15px;border:2.5px solid var(--ink,#0B0B0C);background:#fff;cursor:pointer;color:var(--ink,#0B0B0C);}' +
      '#tchiloVerifiedSheet .active-badge{text-align:center;padding:14px;border-radius:14px;font-weight:800;background:#D6F0FF;border:2.5px solid var(--ink,#0B0B0C);margin-bottom:14px;font-size:15px;}';
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
    var meOk = false;
    try {
      meOk = await isMeVerified();
    } catch (e) {}

    var heroBadge =
      '<div class="tv-hero-badge">' +
      '<svg width="36" height="36" viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="#fff"/><path d="M7.5 12.2l2.8 2.8 6.2-6.4" fill="none" stroke="#1D9BF0" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
      '</div>';

    sheet.innerHTML =
      '<div class="tv-top">' +
      '<button type="button" class="tv-back" data-a="close" aria-label="Voltar">' +
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
      '</button>' +
      '<h1>Selo verificado</h1>' +
      '</div>' +
      '<div class="tv-scroll">' +
      '<div class="tv-hero">' +
      heroBadge +
      '<h2>Mostra que és tu</h2>' +
      '<p>O selo azul confirma a autenticidade da tua conta no perfil e em todas as publicações do feed.</p>' +
      '</div>' +
      (meOk ? '<div class="active-badge">O teu selo verificado está ativo</div>' : '') +
      '<div class="tv-card">' +
      '<h3>O que ganhas</h3>' +
      '<div class="tv-row"><div class="tv-ico">' +
      ICO.check +
      '</div><div><b>Selo azul junto ao nome</b><span>Identificação clara no perfil, no feed e nas conversas — os outros reconhecem a conta oficial.</span></div></div>' +
      '<div class="tv-row"><div class="tv-ico">' +
      ICO.shield +
      '</div><div><b>Mais confiança</b><span>Reduz confusão com contas semelhantes e ajuda a comunidade a saber com quem está a interagir.</span></div></div>' +
      '<div class="tv-row"><div class="tv-ico">' +
      ICO.briefcase +
      '</div><div><b>Presença profissional</b><span>Ideal para criadores, marcas e perfis públicos que querem uma imagem consistente no Tchilo.</span></div></div>' +
      '<div class="tv-row"><div class="tv-ico">' +
      ICO.refresh +
      '</div><div><b>Renovação mensal</b><span>Mantém o selo ativo enquanto a subscrição estiver válida. Podes cancelar quando quiseres.</span></div></div>' +
      '</div>' +
      (meOk
        ? '<div class="tv-actions"><button type="button" class="close" data-a="close">Voltar às definições</button></div>'
        : '<div class="tv-price-box">' +
          '<div class="amt">2 USD <small>/ mês</small></div>' +
          '<p class="note">Subscrição mensal · pagamento seguro via Paddle<br>Merchant of Record · fatura e apoio ao pagamento pelo Paddle</p>' +
          '</div>' +
          '<p class="tv-trust">Ao continuares, aceitas os Termos de uso e a política de reembolso aplicável às compras digitais.</p>' +
          '<div class="tv-actions">' +
          '<button type="button" class="pay" data-a="pay">Obter selo verificado</button>' +
          '<button type="button" class="close" data-a="close">Agora não</button>' +
          '</div>') +
      '</div>';

    sheet.classList.add('open');
    try {
      document.body.style.overflow = 'hidden';
    } catch (e) {}
    function closeSheet() {
      sheet.classList.remove('open');
      try {
        document.body.style.overflow = '';
      } catch (e2) {}
    }
    sheet.querySelectorAll('[data-a]').forEach(function (b) {
      b.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        var a = b.getAttribute('data-a');
        if (a === 'close') closeSheet();
        if (a === 'pay') openCheckout();
      };
    });
  }
  window.tchiloOpenVerified = openVerifiedSheet;

  function injectSettings() {
    var btn = document.getElementById('settings-verified-item');
    if (btn) {
      if (!btn.__tchiloBound) {
        btn.__tchiloBound = true;
        btn.onclick = function (e) {
          e.preventDefault();
          openVerifiedSheet();
        };
      }
      return;
    }
    var list = document.querySelector('#screen-settings .settings-list');
    if (!list) return;
    btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'settings-item';
    btn.id = 'settings-verified-item';
    btn.innerHTML =
      '<div class="si-icon" style="background:#1D9BF0;color:#fff">' +
      badgeSvg(18) +
      '</div><span>Selo verificado</span><div class="chev">›</div>';
    btn.__tchiloBound = true;
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

  if (typeof window.renderFeed === 'function' && !window.renderFeed.__verifiedV3) {
    var rf = window.renderFeed;
    window.renderFeed = function () {
      var r = rf.apply(this, arguments);
      setTimeout(paintBadges, 100);
      return r;
    };
    window.renderFeed.__verifiedV3 = true;
  }
  if (typeof window.goTo === 'function' && !window.goTo.__verifiedV3) {
    var g = window.goTo;
    window.goTo = function (name) {
      var r = g.apply(this, arguments);
      if (name === 'settings') setTimeout(injectSettings, 40);
      if (name === 'profile' || name === 'feed') setTimeout(paintBadges, 80);
      return r;
    };
    window.goTo.__verifiedV3 = true;
  }
})();

/**
 * Tchilo Premium — definições + pagamento Paddle
 * v1
 */
(function () {
  'use strict';
  if (window.__tchiloPremiumV1) return;
  window.__tchiloPremiumV1 = true;

  var PADDLE_TOKEN = 'live_05be77c7629150c894e94e62559';
  var PRICE_ID = 'pri_01m2ztke3vf0v4xwj13t0hbdav';
  var PRICE_LABEL = 'Tchilo Premium';
  var PRICE_AMOUNT = '3 USD';

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

  function SB() {
    return window.tchiloSupabase || window.supabaseClient || null;
  }

  async function currentUid() {
    if (window.__tchiloCloudUserId) return window.__tchiloCloudUserId;
    var s = SB();
    if (!s) return null;
    try {
      var auth = await s.auth.getSession();
      var uid =
        auth &&
        auth.data &&
        auth.data.session &&
        auth.data.session.user &&
        auth.data.session.user.id;
      if (uid) window.__tchiloCloudUserId = uid;
      return uid || null;
    } catch (e) {
      return null;
    }
  }

  async function isPremium() {
    try {
      var sess = sessionUser();
      if (sess && (sess.isPremium || sess.premium)) return true;
    } catch (e) {}
    try {
      if (localStorage.getItem('tchilo_premium') === '1') return true;
    } catch (e2) {}
    var s = SB();
    var uid = await currentUid();
    if (!s || !uid) return false;
    try {
      var r = await s
        .from('profiles')
        .select('is_premium,premium')
        .eq('id', uid)
        .maybeSingle();
      if (r.data && (r.data.is_premium || r.data.premium)) return true;
    } catch (e3) {}
    try {
      var r2 = await s
        .from('user_settings')
        .select('is_premium,premium')
        .eq('user_id', uid)
        .maybeSingle();
      if (r2.data && (r2.data.is_premium || r2.data.premium)) return true;
    } catch (e4) {}
    return false;
  }

  function markPremiumLocal(on) {
    try {
      localStorage.setItem('tchilo_premium', on ? '1' : '0');
    } catch (e) {}
    try {
      var sess = sessionUser();
      if (sess) {
        sess.isPremium = !!on;
        sess.premium = !!on;
        if (typeof setSession === 'function') setSession(sess);
        else localStorage.setItem('tchilo_session', JSON.stringify(sess));
      }
    } catch (e2) {}
  }

  function loadPaddle() {
    return new Promise(function (resolve, reject) {
      if (window.Paddle && window.Paddle.Checkout) {
        resolve(window.Paddle);
        return;
      }
      var existing = document.querySelector('script[src*="paddle"]');
      if (existing) {
        existing.addEventListener('load', function () {
          resolve(window.Paddle);
        });
        existing.addEventListener('error', reject);
        setTimeout(function () {
          if (window.Paddle) resolve(window.Paddle);
        }, 1500);
        return;
      }
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
      if (!Paddle) {
        toast('Não foi possível carregar o pagamento');
        return;
      }
      if (!window.__tchiloPaddleInited) {
        try {
          Paddle.Initialize({ token: PADDLE_TOKEN });
          window.__tchiloPaddleInited = true;
        } catch (e) {
          console.warn('Paddle init', e);
        }
      }
      var uid = await currentUid();
      var email = (sess.email || '').trim();
      Paddle.Checkout.open({
        items: [{ priceId: PRICE_ID, quantity: 1 }],
        customer: email ? { email: email } : undefined,
        customData: {
          user_id: uid || '',
          username: sess.username || '',
          product: 'tchilo_premium'
        },
        settings: {
          successUrl: (location.origin || 'https://tchilopop.com') + '/?premium=1',
          displayMode: 'overlay'
        }
      });
    } catch (err) {
      console.warn('checkout', err);
      toast('Erro ao abrir o pagamento');
    }
  }

  function ensureCSS() {
    if (document.getElementById('tchiloPremiumCSS')) return;
    var st = document.createElement('style');
    st.id = 'tchiloPremiumCSS';
    st.textContent =
      '#tchiloPremiumSheet{position:fixed;inset:0;z-index:2147483640;display:none;' +
      'align-items:flex-end;justify-content:center;background:rgba(11,11,12,.55);}' +
      '#tchiloPremiumSheet.open{display:flex!important;}' +
      '#tchiloPremiumSheet .panel{width:100%;max-width:480px;background:var(--paper,#F3F1E9);' +
      'color:var(--ink,#0B0B0C);border-radius:22px 22px 0 0;padding:18px 16px calc(22px + env(safe-area-inset-bottom));' +
      'border:3px solid var(--ink,#0B0B0C);border-bottom:0;box-shadow:0 -10px 40px rgba(0,0,0,.28);}' +
      '#tchiloPremiumSheet h2{margin:0 0 6px;font-family:Anton,Impact,sans-serif;font-size:26px;text-align:center;}' +
      '#tchiloPremiumSheet .sub{text-align:center;opacity:.7;font-size:13px;margin:0 0 14px;font-weight:600;}' +
      '#tchiloPremiumSheet .benefits{list-style:none;padding:0;margin:0 0 16px;}' +
      '#tchiloPremiumSheet .benefits li{padding:10px 12px;margin:0 0 8px;border-radius:14px;' +
      'border:2px solid var(--ink,#0B0B0C);background:#fff;font-weight:700;font-size:14px;}' +
      '#tchiloPremiumSheet .price{text-align:center;font-size:28px;font-weight:900;margin:0 0 4px;}' +
      '#tchiloPremiumSheet .price-note{text-align:center;font-size:12px;opacity:.6;margin:0 0 16px;}' +
      '#tchiloPremiumSheet .pay{width:100%;padding:14px;border-radius:14px;font-weight:900;font-size:16px;' +
      'border:2.5px solid var(--ink,#0B0B0C);background:var(--yellow,#C8F560);color:var(--ink,#0B0B0C);' +
      'box-shadow:3px 3px 0 var(--ink,#0B0B0C);cursor:pointer;}' +
      '#tchiloPremiumSheet .close{width:100%;margin-top:10px;padding:12px;border-radius:14px;font-weight:800;' +
      'border:2px solid var(--ink,#0B0B0C);background:transparent;cursor:pointer;}' +
      '#tchiloPremiumSheet .active-badge{text-align:center;padding:12px;border-radius:14px;font-weight:800;' +
      'background:var(--mint,#7DFFB3);border:2px solid var(--ink,#0B0B0C);margin-bottom:12px;}' +
      '#settings-premium-item{display:flex!important;}';
    document.head.appendChild(st);
  }

  async function openPremiumSheet() {
    ensureCSS();
    var sheet = document.getElementById('tchiloPremiumSheet');
    if (!sheet) {
      sheet = document.createElement('div');
      sheet.id = 'tchiloPremiumSheet';
      document.body.appendChild(sheet);
    }
    var prem = await isPremium();
    sheet.innerHTML =
      '<div class="panel" role="dialog" aria-label="Tchilo Premium">' +
      '<h2>Tchilo Premium</h2>' +
      '<p class="sub">Mais temas, figurinhas e recursos exclusivos</p>' +
      (prem
        ? '<div class="active-badge">Plano ativo</div>'
        : '') +
      '<ul class="benefits">' +
      '<li>Temas exclusivos (Neon, Retro, Halloween, Gótico…)</li>' +
      '<li>Criar figurinhas nas conversas</li>' +
      '<li>Mais opções de personalização</li>' +
      '<li>Apoias o desenvolvimento do Tchilo</li>' +
      '</ul>' +
      '<div class="price">' +
      PRICE_AMOUNT +
      '</div>' +
      '<p class="price-note">Pagamento único · ' +
      PRICE_LABEL +
      '</p>' +
      (prem
        ? '<button type="button" class="close" data-a="close">Fechar</button>'
        : '<button type="button" class="pay" data-a="pay">Pagar Premium</button>' +
          '<button type="button" class="close" data-a="close">Agora não</button>') +
      '</div>';
    sheet.classList.add('open');
    sheet.onclick = function (e) {
      if (e.target === sheet) sheet.classList.remove('open');
    };
    sheet.querySelectorAll('[data-a]').forEach(function (b) {
      b.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        var a = b.getAttribute('data-a');
        if (a === 'close') sheet.classList.remove('open');
        if (a === 'pay') openCheckout();
      };
    });
  }

  window.tchiloOpenPremium = openPremiumSheet;
  window.tchiloIsPremium = isPremium;

  function injectSettingsItem() {
    var list =
      document.querySelector('#screen-settings .settings-list') ||
      document.querySelector('#screen-settings .settings-body');
    if (!list) return;
    if (document.getElementById('settings-premium-item')) return;

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'settings-item';
    btn.id = 'settings-premium-item';
    btn.innerHTML =
      '<div class="si-icon" style="background:var(--yellow,#C8F560)">' +
      '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M12 3l2.5 6.5L21 10l-5 4.2L17.5 21 12 17.5 6.5 21 8 14.2 3 10l6.5-.5L12 3z"/>' +
      '</svg></div>' +
      '<span>Tchilo Premium</span>' +
      '<div class="chev">›</div>';
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      openPremiumSheet();
    });

    /* Inserir no topo da lista */
    if (list.firstChild) list.insertBefore(btn, list.firstChild);
    else list.appendChild(btn);
  }

  function handleSuccessQuery() {
    try {
      var q = location.search || '';
      if (q.indexOf('premium=1') >= 0) {
        markPremiumLocal(true);
        toast('Obrigado! Premium em ativação');
        try {
          history.replaceState(null, '', location.pathname);
        } catch (e) {}
      }
    } catch (e2) {}
  }

  function boot() {
    ensureCSS();
    injectSettingsItem();
    handleSuccessQuery();
  }

  boot();
  setTimeout(boot, 400);
  setTimeout(boot, 1200);
  setInterval(injectSettingsItem, 4000);

  /* Ao abrir definições */
  if (typeof window.goTo === 'function' && !window.goTo.__premiumHook) {
    var g = window.goTo;
    window.goTo = function (name) {
      var r = g.apply(this, arguments);
      if (name === 'settings') setTimeout(injectSettingsItem, 50);
      return r;
    };
    window.goTo.__premiumHook = true;
  }
})();

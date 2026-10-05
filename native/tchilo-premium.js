/**
 * Tchilo Premium — definições + pagamento Paddle
 * v2 — ecrã completo + copy profissional
 */
(function () {
  'use strict';
  if (window.__tchiloPremiumV2) return;
  window.__tchiloPremiumV2 = true;
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
        auth && auth.data && auth.data.session && auth.data.session.user && auth.data.session.user.id;
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
      var r = await s.from('profiles').select('is_premium,premium').eq('id', uid).maybeSingle();
      if (r.data && (r.data.is_premium || r.data.premium)) return true;
    } catch (e3) {}
    try {
      var r2 = await s.from('user_settings').select('is_premium,premium').eq('user_id', uid).maybeSingle();
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
    var old = document.getElementById('tchiloPremiumCSS');
    if (old) old.remove();
    var st = document.createElement('style');
    st.id = 'tchiloPremiumCSS';
    st.textContent =
      '#tchiloPremiumSheet{position:fixed;inset:0;z-index:2147483640;display:none;flex-direction:column;background:var(--paper,#F6F1E7);color:var(--ink,#0B0B0C);overflow:hidden;}' +
      '#tchiloPremiumSheet.open{display:flex!important;}' +
      '#tchiloPremiumSheet .tp-top{display:flex;align-items:center;gap:10px;padding:12px 16px;padding-top:calc(12px + env(safe-area-inset-top));border-bottom:2.5px solid var(--ink,#0B0B0C);background:var(--paper,#F6F1E7);flex-shrink:0;}' +
      '#tchiloPremiumSheet .tp-back{width:40px;height:40px;border-radius:12px;border:2.5px solid var(--ink,#0B0B0C);background:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;}' +
      '#tchiloPremiumSheet .tp-top h1{margin:0;font-family:Anton,Impact,sans-serif;font-size:22px;flex:1;}' +
      '#tchiloPremiumSheet .tp-scroll{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:20px 18px calc(28px + env(safe-area-inset-bottom));}' +
      '#tchiloPremiumSheet .tp-hero{text-align:center;padding:8px 0 20px;}' +
      '#tchiloPremiumSheet .tp-hero-icon{width:72px;height:72px;margin:0 auto 14px;border-radius:18px;background:var(--yellow,#C8F560);display:flex;align-items:center;justify-content:center;border:3px solid var(--ink,#0B0B0C);box-shadow:4px 4px 0 var(--ink,#0B0B0C);font-size:32px;}' +
      '#tchiloPremiumSheet .tp-hero h2{margin:0 0 8px;font-family:Anton,Impact,sans-serif;font-size:28px;}' +
      '#tchiloPremiumSheet .tp-hero p{margin:0 auto;max-width:320px;font-size:14.5px;line-height:1.45;font-weight:600;opacity:.75;}' +
      '#tchiloPremiumSheet .tp-card{background:#fff;border:2.5px solid var(--ink,#0B0B0C);border-radius:18px;padding:16px;margin:0 0 14px;box-shadow:3px 3px 0 rgba(11,11,12,.08);}' +
      '#tchiloPremiumSheet .tp-card h3{margin:0 0 12px;font-size:13px;font-weight:900;text-transform:uppercase;letter-spacing:.06em;opacity:.55;}' +
      '#tchiloPremiumSheet .tp-row{display:flex;gap:12px;align-items:flex-start;padding:12px 0;border-top:1.5px solid #ebe8e0;}' +
      '#tchiloPremiumSheet .tp-row:first-of-type{border-top:0;padding-top:0;}' +
      '#tchiloPremiumSheet .tp-ico{width:40px;height:40px;border-radius:12px;background:#F5FFD6;border:2px solid var(--ink,#0B0B0C);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:18px;}' +
      '#tchiloPremiumSheet .tp-row b{display:block;font-size:14.5px;font-weight:800;margin-bottom:3px;}' +
      '#tchiloPremiumSheet .tp-row span{display:block;font-size:13px;line-height:1.4;font-weight:600;opacity:.7;}' +
      '#tchiloPremiumSheet .tp-price{text-align:center;padding:18px 16px;background:linear-gradient(180deg,#F5FFD6 0%,#fff 100%);border:2.5px solid var(--ink,#0B0B0C);border-radius:18px;margin:0 0 14px;}' +
      '#tchiloPremiumSheet .tp-price .amt{font-size:32px;font-weight:900;}' +
      '#tchiloPremiumSheet .tp-price .amt small{font-size:15px;font-weight:700;opacity:.65;}' +
      '#tchiloPremiumSheet .tp-price .note{margin:8px 0 0;font-size:12.5px;font-weight:600;opacity:.65;line-height:1.4;}' +
      '#tchiloPremiumSheet .tp-trust{font-size:12px;font-weight:600;opacity:.55;text-align:center;margin:0 0 16px;}' +
      '#tchiloPremiumSheet .pay{width:100%;padding:16px;border-radius:16px;font-weight:900;font-size:16px;border:2.5px solid var(--ink,#0B0B0C);background:var(--yellow,#C8F560);color:var(--ink,#0B0B0C);box-shadow:3px 3px 0 var(--ink,#0B0B0C);cursor:pointer;margin-bottom:10px;}' +
      '#tchiloPremiumSheet .close{width:100%;padding:14px;border-radius:16px;font-weight:800;border:2.5px solid var(--ink,#0B0B0C);background:#fff;cursor:pointer;}' +
      '#tchiloPremiumSheet .active-badge{text-align:center;padding:14px;border-radius:14px;font-weight:800;background:var(--mint,#7DFFB3);border:2.5px solid var(--ink,#0B0B0C);margin-bottom:14px;}' +
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
    var prem = false;
    try {
      prem = await isPremium();
    } catch (e) {}

    sheet.innerHTML =
      '<div class="tp-top">' +
      '<button type="button" class="tp-back" data-a="close" aria-label="Voltar">' +
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
      '</button>' +
      '<h1>Tchilo Premium</h1>' +
      '</div>' +
      '<div class="tp-scroll">' +
      '<div class="tp-hero">' +
      '<div class="tp-hero-icon">★</div>' +
      '<h2>Desbloqueia o Tchilo completo</h2>' +
      '<p>Temas exclusivos, figurinhas e personalização avançada para a tua conta.</p>' +
      '</div>' +
      (prem ? '<div class="active-badge">Premium ativo na tua conta</div>' : '') +
      '<div class="tp-card">' +
      '<h3>Incluído no Premium</h3>' +
      '<div class="tp-row"><div class="tp-ico">🎨</div><div><b>Temas exclusivos</b><span>Neon, Retro, Halloween, Gótico e outros estilos que não estão no plano gratuito.</span></div></div>' +
      '<div class="tp-row"><div class="tp-ico">✨</div><div><b>Figurinhas nas conversas</b><span>Cria e usa figurinhas personalizadas nas mensagens.</span></div></div>' +
      '<div class="tp-row"><div class="tp-ico">⚙</div><div><b>Mais personalização</b><span>Opções extra para deixar o Tchilo com a tua cara.</span></div></div>' +
      '<div class="tp-row"><div class="tp-ico">♥</div><div><b>Apoias o produto</b><span>A tua assinatura ajuda a manter e evoluir a rede.</span></div></div>' +
      '</div>' +
      (prem
        ? '<button type="button" class="close" data-a="close">Voltar às definições</button>'
        : '<div class="tp-price"><div class="amt">3 USD <small>· pagamento único</small></div>' +
          '<p class="note">Pagamento seguro via Paddle · Merchant of Record</p></div>' +
          '<p class="tp-trust">Ao continuares, aceitas os Termos de uso e a política de reembolso das compras digitais.</p>' +
          '<button type="button" class="pay" data-a="pay">Ativar Premium</button>' +
          '<button type="button" class="close" data-a="close">Agora não</button>') +
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
  window.tchiloOpenPremium = openPremiumSheet;
  window.tchiloIsPremium = isPremium;

  function injectSettingsItem() {
    var existing = document.getElementById('settings-premium-item');
    if (existing) {
      if (!existing.__tchiloBound) {
        existing.__tchiloBound = true;
        existing.addEventListener('click', function (e) {
          e.preventDefault();
          openPremiumSheet();
        });
      }
      window.tchiloOpenPremium = openPremiumSheet;
      return;
    }
    var existing = document.getElementById('settings-premium-item');
    if (existing) {
      if (!existing.__tchiloBound) {
        existing.__tchiloBound = true;
        existing.addEventListener('click', function (e) {
          e.preventDefault();
          openPremiumSheet();
        });
      }
      window.tchiloOpenPremium = openPremiumSheet;
      return;
    }
    var existing = document.getElementById('settings-premium-item');
    if (existing) {
      if (!existing.__tchiloBound) {
        existing.__tchiloBound = true;
        existing.addEventListener('click', function (e) {
          e.preventDefault();
          openPremiumSheet();
        });
      }
      window.tchiloOpenPremium = openPremiumSheet;
      return;
    }
    var existing = document.getElementById('settings-premium-item');
    if (existing) {
      if (!existing.__tchiloBound) {
        existing.__tchiloBound = true;
        existing.addEventListener('click', function (e) {
          e.preventDefault();
          openPremiumSheet();
        });
      }
      window.tchiloOpenPremium = openPremiumSheet;
      return;
    }
    var existing = document.getElementById('settings-premium-item');
    if (existing) {
      if (!existing.__tchiloBound) {
        existing.__tchiloBound = true;
        existing.addEventListener('click', function (e) {
          e.preventDefault();
          openPremiumSheet();
        });
      }
      window.tchiloOpenPremium = openPremiumSheet;
      return;
    }
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

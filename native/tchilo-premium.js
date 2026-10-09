/**
 * Tchilo Premium — definições + pagamento Paddle
 * v3 — igual verified, botões visíveis + copy profissional
 */
(function () {
  'use strict';
  if (window.__tchiloPremiumV3) return;
  window.__tchiloPremiumV3 = true;
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
  function isPremiumUser() {
    try {
      if (typeof window.tchiloIsPremium === 'function') return !!window.tchiloIsPremium();
      var s = sessionUser();
      return !!(s && (s.premium || s.isPremium || s.tchilo_premium));
    } catch (e) {
      return false;
    }
  }

  function injectCSS() {
    if (document.getElementById('tchiloPremiumCSS')) return;
    var st = document.createElement('style');
    st.id = 'tchiloPremiumCSS';
    st.textContent =
      '#tchiloPremiumSheet{position:fixed;inset:0;z-index:2147483640;display:none;flex-direction:column;background:var(--paper,#F6F1E7);color:var(--ink,#0B0B0C);overflow:hidden;}' +
      '#tchiloPremiumSheet.open{display:flex!important;}' +
      '#tchiloPremiumSheet .tp-top{display:flex;align-items:center;gap:10px;padding:12px 16px;padding-top:calc(12px + env(safe-area-inset-top));border-bottom:1px solid var(--line,rgba(0,0,0,.12));background:var(--paper,#F6F1E7);flex-shrink:0;}' +
      '#tchiloPremiumSheet .tp-back{width:40px;height:40px;border-radius:12px;border:0;background:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;color:var(--ink,#0B0B0C);}' +
      '#tchiloPremiumSheet .tp-top h1{margin:0;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;font-size:22px;font-weight:800;flex:1;}' +
      '#tchiloPremiumSheet .tp-scroll{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:20px 18px calc(28px + env(safe-area-inset-bottom));}' +
      '#tchiloPremiumSheet .tp-hero{text-align:center;padding:8px 0 20px;}' +
      '#tchiloPremiumSheet .tp-hero-icon{width:72px;height:72px;margin:0 auto 14px;border-radius:50%;background:var(--ink,#0B0B0C);color:#fff;display:flex;align-items:center;justify-content:center;border:0;font-size:32px;line-height:1;}' +
      '#tchiloPremiumSheet .tp-hero h2{margin:0 0 8px;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;font-size:28px;font-weight:800;line-height:1.1;}' +
      '#tchiloPremiumSheet .tp-hero p{margin:0 auto;max-width:320px;font-size:14.5px;line-height:1.45;font-weight:600;opacity:.75;}' +
      '#tchiloPremiumSheet .tp-card{background:#fff;border:0;border-radius:18px;padding:16px;margin:0 0 14px;box-shadow:none;}' +
      '#tchiloPremiumSheet .tp-card h3{margin:0 0 12px;font-size:13px;font-weight:900;text-transform:uppercase;letter-spacing:.06em;opacity:.55;}' +
      '#tchiloPremiumSheet .tp-row{display:flex;gap:12px;align-items:flex-start;padding:12px 0;border-top:1px solid rgba(11,11,12,.08);}' +
      '#tchiloPremiumSheet .tp-row:first-of-type{border-top:0;padding-top:0;}' +
      '#tchiloPremiumSheet .tp-ico{width:40px;height:40px;border-radius:12px;background:#F5FFD6;border:2px solid var(--ink,#0B0B0C);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:18px;}' +
      '#tchiloPremiumSheet .tp-row b{display:block;font-size:14.5px;font-weight:800;margin-bottom:3px;color:var(--ink,#0B0B0C);}' +
      '#tchiloPremiumSheet .tp-row span{display:block;font-size:13px;line-height:1.4;font-weight:600;opacity:.7;color:var(--ink,#0B0B0C);}' +
      '#tchiloPremiumSheet .tp-price{text-align:center;padding:18px 16px;background:#fff;border:0;border-radius:18px;margin:0 0 14px;}' +
      '#tchiloPremiumSheet .tp-price .amt{font-size:32px;font-weight:900;color:var(--ink,#0B0B0C);}' +
      '#tchiloPremiumSheet .tp-price .amt small{font-size:15px;font-weight:700;opacity:.65;}' +
      '#tchiloPremiumSheet .tp-price .note{margin:8px 0 0;font-size:12.5px;font-weight:600;opacity:.65;line-height:1.4;}' +
      '#tchiloPremiumSheet .tp-trust{font-size:12px;font-weight:600;opacity:.55;text-align:center;margin:0 0 16px;}' +
      '#tchiloPremiumSheet .pay{width:100%;padding:16px;border-radius:16px;font-weight:900;font-size:16px;border:0;background:var(--ink,#0B0B0C)!important;color:#FFFFFF!important;box-shadow:none;cursor:pointer;margin-bottom:10px;}' +
      '#tchiloPremiumSheet .pay:active{transform:scale(.98);}' +
      '#tchiloPremiumSheet .close{width:100%;padding:14px;border-radius:16px;font-weight:800;font-size:15px;border:2px solid rgba(11,11,12,.12);background:#fff!important;cursor:pointer;color:var(--ink,#0B0B0C)!important;}' +
      '#tchiloPremiumSheet .active-badge{text-align:center;padding:14px;border-radius:14px;font-weight:800;background:var(--mint,#7DFFB3);border:0;margin-bottom:14px;font-size:15px;color:var(--ink,#0B0B0C);}' +
      '#settings-premium-item{display:flex!important;}';
    document.head.appendChild(st);
  }

  function loadPaddle() {
    return new Promise(function (resolve, reject) {
      if (window.Paddle) return resolve(window.Paddle);
      var existing = document.querySelector('script[src*="paddle"]');
      if (existing) {
        existing.addEventListener('load', function () { resolve(window.Paddle); });
        existing.addEventListener('error', reject);
        setTimeout(function () { if (window.Paddle) resolve(window.Paddle); }, 2000);
        return;
      }
      var s = document.createElement('script');
      s.src = 'https://cdn.paddle.com/paddle/v2/paddle.js';
      s.async = true;
      s.onload = function () { resolve(window.Paddle); };
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  async function openCheckout() {
    var sess = sessionUser();
    if (!sess) {
      toast('Inicia sessão para ativar o Premium');
      return;
    }
    try {
      var Paddle = await loadPaddle();
      if (!Paddle) throw new Error('Paddle indisponível');
      try {
        Paddle.Initialize({ token: PADDLE_TOKEN });
      } catch (eInit) {}
      Paddle.Checkout.open({
        items: [{ priceId: PRICE_ID, quantity: 1 }],
        customer: sess.email ? { email: sess.email } : undefined,
        settings: { successUrl: window.location.origin + '/?premium=ok' }
      });
    } catch (e) {
      console.warn('premium checkout', e);
      toast('Não foi possível abrir o pagamento. Tenta de novo.');
    }
  }

  function ensureSheet() {
    var sheet = document.getElementById('tchiloPremiumSheet');
    if (sheet) return sheet;
    sheet = document.createElement('div');
    sheet.id = 'tchiloPremiumSheet';
    document.body.appendChild(sheet);
    return sheet;
  }

  function openSheet() {
    injectCSS();
    var sheet = ensureSheet();
    var prem = isPremiumUser();
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
      '<div class="tp-row"><div class="tp-ico">⚡</div><div><b>Experiência avançada</b><span>Mais opções de personalização e prioridade em novidades do Tchilo.</span></div></div>' +
      '</div>' +
      (prem
        ? '<div class="tp-trust">Obrigado por apoiares o Tchilo.</div><button type="button" class="close" data-a="close">Fechar</button>'
        : '<div class="tp-price"><div class="amt">' +
          PRICE_AMOUNT +
          ' <small>/ mês</small></div><p class="note">Pagamento seguro via Paddle. Podes cancelar quando quiseres.</p></div>' +
          '<p class="tp-trust">Pagamento processado de forma segura por Paddle.</p>' +
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

    sheet.onclick = function (ev) {
      var t = ev.target.closest('[data-a]');
      if (!t) return;
      var a = t.getAttribute('data-a');
      if (a === 'close') closeSheet();
      if (a === 'pay') openCheckout();
    };
  }

  window.tchiloOpenPremium = openSheet;
  window.openPremium = openSheet;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectCSS);
  } else {
    injectCSS();
  }
})();

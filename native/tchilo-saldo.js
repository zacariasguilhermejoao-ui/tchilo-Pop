/**
 * Tchilo Saldo / Moedas v2
 * - 70 moedas = 1,00 US$ (Paddle)
 * - App nativa: sem checkout e sem indicar site
 */
(function () {
  'use strict';
  if (window.__tchiloSaldoV2) return;
  window.__tchiloSaldoV2 = true;
  window.__tchiloSaldoV1 = true;

  var PADDLE_TOKEN = 'live_05be77c7629150c894e94e62559';
  var PRICE_ID = 'pri_01m4ffv5kzncw9hby17j3f2sj9';
  var PRODUCT_ID = 'pro_01m4ffpaz24pteczc2w3s6cf5s';

  var PACKS = [{ coins: 70, label: '1,00 US$', priceId: PRICE_ID, featured: true }];

  var COIN_SVG =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="28" height="28" fill="none" aria-hidden="true">' +
    '<defs>' +
    '<linearGradient id="tAro" x1="90" y1="40" x2="430" y2="470" gradientUnits="userSpaceOnUse">' +
    '<stop offset="0" stop-color="#FF8CC6"/><stop offset="0.5" stop-color="#FF0A8C"/><stop offset="1" stop-color="#B0006B"/></linearGradient>' +
    '<linearGradient id="tMio" x1="100" y1="50" x2="420" y2="460" gradientUnits="userSpaceOnUse">' +
    '<stop offset="0" stop-color="#C4006E"/><stop offset="1" stop-color="#FF4DA6"/></linearGradient>' +
    '<linearGradient id="tBri" x1="120" y1="60" x2="300" y2="260" gradientUnits="userSpaceOnUse">' +
    '<stop offset="0" stop-color="#fff" stop-opacity="0.7"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>' +
    '</defs>' +
    '<g transform="translate(0 8)">' +
    '<circle cx="256" cy="248" r="236" fill="url(#tAro)"/>' +
    '<circle cx="256" cy="248" r="222" stroke="#8A0052" stroke-opacity="0.55" stroke-width="16" stroke-dasharray="3 7.2"/>' +
    '<circle cx="256" cy="248" r="202" fill="url(#tAro)"/>' +
    '<circle cx="256" cy="248" r="202" stroke="#fff" stroke-opacity="0.55" stroke-width="3"/>' +
    '<circle cx="256" cy="248" r="184" fill="url(#tMio)"/>' +
    '<circle cx="256" cy="248" r="184" stroke="#7A0045" stroke-opacity="0.6" stroke-width="5"/>' +
    '<path d="M104 190A160 160 0 0 1 238 92" stroke="url(#tBri)" stroke-width="14" stroke-linecap="round"/>' +
    '<g transform="translate(256 248) scale(1.05) translate(-178.5 -240)" stroke-linecap="round" stroke-linejoin="round">' +
    '<g stroke="#6B003C" stroke-opacity="0.45" stroke-width="56" transform="translate(0 9)">' +
    '<path d="M164 136V300Q164 344 208 344H236"/><path d="M121 208H231"/></g>' +
    '<g stroke="#fff" stroke-width="56">' +
    '<path d="M164 136V300Q164 344 208 344H236"/><path d="M121 208H231"/></g></g></g></svg>';

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

  function isNativeApp() {
    try {
      if (typeof window.tchiloIsNativeStoreApp === 'function') return window.tchiloIsNativeStoreApp();
      if (window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()) return true;
    } catch (e) {}
    return false;
  }

  function injectCSS() {
    if (document.getElementById('tchiloSaldoCSS')) return;
    var st = document.createElement('style');
    st.id = 'tchiloSaldoCSS';
    st.textContent =
      '#tchiloSaldoSheet{position:fixed;inset:0;z-index:2147483640;display:none;flex-direction:column;background:var(--paper,#F6F1E7);color:var(--ink,#0B0B0C);}' +
      '#tchiloSaldoSheet.open{display:flex!important;}' +
      '#tchiloSaldoSheet .ts-top{display:flex;align-items:center;gap:10px;padding:12px 16px;padding-top:calc(12px + env(safe-area-inset-top));border-bottom:1px solid var(--line,rgba(0,0,0,.12));flex-shrink:0;}' +
      '#tchiloSaldoSheet .ts-back{width:40px;height:40px;border:0;border-radius:50%;background:transparent;display:flex;align-items:center;justify-content:center;cursor:pointer;}' +
      '#tchiloSaldoSheet .ts-top h1{margin:0;font-size:20px;font-weight:800;flex:1;text-align:center;}' +
      '#tchiloSaldoSheet .ts-top .ts-sp{width:40px;}' +
      '#tchiloSaldoSheet .ts-scroll{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:20px 18px calc(28px + env(safe-area-inset-bottom));}' +
      '#tchiloSaldoSheet .ts-hero{text-align:center;padding:12px 0 20px;}' +
      '#tchiloSaldoSheet .ts-hero .label{font-size:13px;font-weight:600;opacity:.55;margin-bottom:6px;}' +
      '#tchiloSaldoSheet .ts-hero .amt{font-size:40px;font-weight:900;letter-spacing:-.02em;}' +
      '#tchiloSaldoSheet .ts-coins-pill{display:inline-flex;align-items:center;gap:8px;margin-top:12px;padding:8px 14px;border-radius:999px;background:#fff;border:1px solid rgba(11,11,12,.08);font-weight:700;font-size:14px;}' +
      '#tchiloSaldoSheet .ts-card{background:#fff;border-radius:16px;padding:4px 0;margin:0 0 14px;}' +
      '#tchiloSaldoSheet .ts-row{display:flex;align-items:center;gap:14px;width:100%;padding:14px 16px;border:0;background:transparent;text-align:left;font:600 15px system-ui,-apple-system,sans-serif;color:var(--ink,#0B0B0C);cursor:pointer;}' +
      '#tchiloSaldoSheet .ts-row + .ts-row{border-top:0.5px solid rgba(11,11,12,.08);}' +
      '#tchiloSaldoSheet .ts-ico{width:40px;height:40px;border-radius:12px;background:transparent;display:flex;align-items:center;justify-content:center;flex-shrink:0;}' +
      '#tchiloSaldoSheet .ts-row span.sub{display:block;font-size:12.5px;font-weight:600;opacity:.55;margin-top:2px;}' +
      '#tchiloSaldoSheet .ts-chev{margin-left:auto;opacity:.35;font-size:18px;}' +
      '#tchiloCoinsSheet{position:fixed;inset:0;z-index:2147483641;display:none;flex-direction:column;background:var(--paper,#F6F1E7);color:var(--ink,#0B0B0C);}' +
      '#tchiloCoinsSheet.open{display:flex!important;}' +
      '#tchiloCoinsSheet .tc-top{display:flex;align-items:center;gap:10px;padding:12px 16px;padding-top:calc(12px + env(safe-area-inset-top));border-bottom:1px solid var(--line,rgba(0,0,0,.12));}' +
      '#tchiloCoinsSheet .tc-back{width:40px;height:40px;border:0;border-radius:50%;background:transparent;cursor:pointer;}' +
      '#tchiloCoinsSheet .tc-top h1{margin:0;font-size:20px;font-weight:800;flex:1;text-align:center;}' +
      '#tchiloCoinsSheet .tc-scroll{flex:1;overflow-y:auto;padding:18px 16px calc(100px + env(safe-area-inset-bottom));}' +
      '#tchiloCoinsSheet .tc-bal{background:#fff;border-radius:16px;padding:16px;margin-bottom:16px;}' +
      '#tchiloCoinsSheet .tc-bal .l{font-size:13px;font-weight:600;opacity:.55;}' +
      '#tchiloCoinsSheet .tc-bal .v{display:flex;align-items:center;gap:10px;margin-top:8px;font-size:28px;font-weight:900;}' +
      '#tchiloCoinsSheet .tc-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;}' +
      '#tchiloCoinsSheet .tc-pack{background:#fff;border:2px solid transparent;border-radius:14px;padding:14px 8px;text-align:center;cursor:pointer;}' +
      '#tchiloCoinsSheet .tc-pack.on{border-color:var(--ink,#0B0B0C);background:#FFF5FA;}' +
      '#tchiloCoinsSheet .tc-pack .c{display:flex;align-items:center;justify-content:center;gap:4px;font-weight:900;font-size:16px;}' +
      '#tchiloCoinsSheet .tc-pack .p{margin-top:6px;font-size:12px;font-weight:700;opacity:.65;}' +
      '#tchiloCoinsSheet .tc-foot{position:fixed;left:0;right:0;bottom:0;padding:12px 16px calc(12px + env(safe-area-inset-bottom));background:var(--paper,#F6F1E7);}' +
      '#tchiloCoinsSheet .tc-buy{width:100%;padding:16px;border:0;border-radius:16px;background:var(--ink,#0B0B0C);color:#fff;font-weight:900;font-size:16px;cursor:pointer;}' +
      'body.tchilo-native-store #tchiloCoinsSheet .tc-foot,body.tchilo-native-store #tchiloCoinsSheet .tc-buy{display:none!important;}' +
      '#tchiloSaldoWelcome{position:fixed;inset:0;z-index:2147483645;display:none;align-items:flex-end;justify-content:center;background:rgba(11,11,12,.45);}' +
      '#tchiloSaldoWelcome.open{display:flex!important;}' +
      '#tchiloSaldoWelcome .box{width:min(100%,420px);background:#fff;border-radius:22px 22px 0 0;padding:24px 20px calc(20px + env(safe-area-inset-bottom));color:#0B0B0C;}' +
      '#tchiloSaldoWelcome h2{margin:12px 0 16px;font-size:22px;font-weight:900;text-align:center;}' +
      '#tchiloSaldoWelcome .item{display:flex;gap:12px;margin-bottom:14px;}' +
      '#tchiloSaldoWelcome .item b{display:block;font-size:15px;}' +
      '#tchiloSaldoWelcome .item span{display:block;font-size:13px;opacity:.65;line-height:1.4;margin-top:2px;}' +
      '#tchiloSaldoWelcome .ok{width:100%;margin-top:8px;padding:14px;border:0;border-radius:14px;background:#FF0A8C;color:#fff;font-weight:900;font-size:16px;cursor:pointer;}';
    document.head.appendChild(st);
  }

  function loadPaddle() {
    return new Promise(function (resolve, reject) {
      if (window.Paddle) return resolve(window.Paddle);
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

  async function buyPack(pack) {
    if (isNativeApp()) return;
    var sess = sessionUser();
    if (!sess) {
      toast('Inicia sessão para comprar moedas');
      return;
    }
    try {
      var Paddle = await loadPaddle();
      try {
        Paddle.Initialize({ token: PADDLE_TOKEN });
      } catch (e0) {}
      Paddle.Checkout.open({
        items: [{ priceId: pack.priceId || PRICE_ID, quantity: 1 }],
        customer: sess.email ? { email: sess.email } : undefined,
        customData: {
          tchilo_gift: 'coins',
          coins: String(pack.coins),
          user_id: String(uid())
        },
        settings: {
          successUrl: (window.location.origin || '') + '/?coins=ok&n=' + pack.coins
        }
      });
    } catch (e) {
      console.warn('coins checkout', e);
      toast('Não foi possível abrir o pagamento. Tenta de novo.');
    }
  }

  function closeAll() {
    ['tchiloSaldoSheet', 'tchiloCoinsSheet', 'tchiloSaldoWelcome'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.classList.remove('open');
    });
    try {
      document.body.style.overflow = '';
    } catch (e) {}
  }

  function showWelcomeIfNeeded() {
    try {
      if (localStorage.getItem('tchilo_saldo_welcome') === '1') return;
    } catch (e) {}
    var w = document.getElementById('tchiloSaldoWelcome');
    if (!w) {
      w = document.createElement('div');
      w.id = 'tchiloSaldoWelcome';
      w.innerHTML =
        '<div class="box">' +
        '<div style="text-align:center">' +
        COIN_SVG.replace('width="28"', 'width="56"').replace('height="28"', 'height="56"') +
        '</div>' +
        '<h2>Boas-vindas ao Saldo</h2>' +
        '<div class="item"><div>' +
        '<b>As tuas Moedas Tchilo</b>' +
        '<span>Usa moedas para enviar presentes nas LIVEs e apoiar criadores.</span></div></div>' +
        '<div class="item"><div>' +
        '<b>Recarrega quando quiseres</b>' +
        '<span>Recarrega moedas de forma segura para enviar presentes nas LIVEs.</span></div></div>' +
        '<button type="button" class="ok" data-w="ok">Entendi</button></div>';
      document.body.appendChild(w);
      w.addEventListener('click', function (e) {
        if (e.target === w || (e.target.closest && e.target.closest('[data-w="ok"]'))) {
          try {
            localStorage.setItem('tchilo_saldo_welcome', '1');
          } catch (err) {}
          w.classList.remove('open');
        }
      });
    }
    w.classList.add('open');
  }

  function openCoins() {
    injectCSS();
    try {
      if (isNativeApp()) document.body.classList.add('tchilo-native-store');
    } catch (eN) {}
    var sheet = document.getElementById('tchiloCoinsSheet');
    if (!sheet) {
      sheet = document.createElement('div');
      sheet.id = 'tchiloCoinsSheet';
      document.body.appendChild(sheet);
    }
    var coins = getCoins();
    var selected = PACKS[0];

    sheet.innerHTML =
      '<div class="tc-top">' +
      '<button type="button" class="tc-back" data-a="back" aria-label="Voltar">' +
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
      '</button><h1>Obter Moedas</h1><div style="width:40px"></div></div>' +
      '<div class="tc-scroll">' +
      '<div class="tc-bal"><div class="l">Saldo em moedas</div>' +
      '<div class="v">' +
      COIN_SVG +
      '<span>' +
      coins +
      '</span></div></div>' +
      '<div style="font-weight:800;margin:0 0 10px;font-size:14px;opacity:.7">Recarregar</div>' +
      '<div class="tc-grid" id="tcGrid"></div></div>' +
      (isNativeApp()
        ? ''
        : '<div class="tc-foot"><button type="button" class="tc-buy" data-a="buy">Recarregar</button></div>');

    var grid = sheet.querySelector('#tcGrid');
    PACKS.forEach(function (p) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'tc-pack on';
      b.innerHTML =
        '<div class="c">' +
        COIN_SVG.replace('width="28"', 'width="18"').replace('height="28"', 'height="18"') +
        ' ' +
        p.coins +
        '</div><div class="p">' +
        p.label +
        '</div>';
      b.onclick = function () {
        selected = p;
      };
      grid.appendChild(b);
    });

    sheet.onclick = function (e) {
      var t = e.target.closest('[data-a]');
      if (!t) return;
      var a = t.getAttribute('data-a');
      if (a === 'back') {
        sheet.classList.remove('open');
        return;
      }
      if (a === 'buy') buyPack(selected);
    };

    sheet.classList.add('open');
  }

  function openSaldo() {
    injectCSS();
    try {
      if (isNativeApp()) document.body.classList.add('tchilo-native-store');
    } catch (eN) {}
    var sheet = document.getElementById('tchiloSaldoSheet');
    if (!sheet) {
      sheet = document.createElement('div');
      sheet.id = 'tchiloSaldoSheet';
      document.body.appendChild(sheet);
    }
    var coins = getCoins();
    sheet.innerHTML =
      '<div class="ts-top">' +
      '<button type="button" class="ts-back" data-a="close" aria-label="Voltar">' +
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
      '</button><h1>Saldo</h1><div class="ts-sp"></div></div>' +
      '<div class="ts-scroll">' +
      '<div class="ts-hero">' +
      '<div class="label">Moedas Tchilo</div>' +
      '<div class="amt">' +
      coins +
      '</div>' +
      '<div class="ts-coins-pill">' +
      COIN_SVG +
      '<span>' +
      coins +
      ' moedas</span></div></div>' +
      '<div class="ts-card">' +
      '<button type="button" class="ts-row" data-a="coins">' +
      '<div class="ts-ico">' +
      COIN_SVG +
      '</div><div><b>Obter Moedas</b><span class="sub">Recarrega para enviar presentes nas LIVEs</span></div>' +
      '<span class="ts-chev">›</span></button>' +
      '<button type="button" class="ts-row" data-a="tx">' +
      '<div class="ts-ico">' +
      COIN_SVG +
      '</div>' +
      '<div><b>Transações</b><span class="sub">Histórico de compras e envios</span></div>' +
      '<span class="ts-chev">›</span></button>' +
      '</div>' +
      '<p style="text-align:center;font-size:11px;opacity:.45;margin-top:20px;line-height:1.4">O saldo de moedas não é um produto financeiro. Valores apenas para uso no Tchilo.</p>' +
      '</div>';

    sheet.classList.add('open');
    try {
      document.body.style.overflow = 'hidden';
    } catch (e) {}

    sheet.onclick = function (e) {
      var t = e.target.closest('[data-a]');
      if (!t) return;
      var a = t.getAttribute('data-a');
      if (a === 'close') {
        closeAll();
        return;
      }
      if (a === 'coins') {
        openCoins();
        return;
      }
      if (a === 'tx') toast('Ainda sem transações');
    };

    showWelcomeIfNeeded();
  }

  window.tchiloOpenSaldo = openSaldo;
  window.openSaldo = openSaldo;

  try {
    var q = new URLSearchParams(window.location.search || '');
    if (q.get('coins') === 'ok') {
      var add = parseInt(q.get('n') || '70', 10);
      if (!isNaN(add) && add > 0) {
        setCoins(getCoins() + add);
        toast('+' + add + ' moedas adicionadas');
      }
      try {
        history.replaceState(null, '', window.location.pathname || '/');
      } catch (e) {}
    }
  } catch (e2) {}
})();

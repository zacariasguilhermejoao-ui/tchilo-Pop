/**
 * tchilo-Pop — boot crítico + loaders
 * Aplica Fee/SMS/lupa, Premium e Gestor de Anúncios de imediato.
 */
(function () {
  'use strict';

  var V = 'v=20260922critboot';

  /* —— CSS crítico (anti-flash + topbar limpa) —— */
  function injectCriticalCSS() {
    var st = document.getElementById('tchiloCriticalCSS');
    if (!st) {
      st = document.createElement('style');
      st.id = 'tchiloCriticalCSS';
      (document.head || document.documentElement).appendChild(st);
    }
    st.textContent =
      '#feedList .post,#feedList video{animation:none!important}' +
      '#galleryBtn,#faceFxOpenBtn{display:none!important}' +
      '.toast.busy,#toast.busy{display:none!important}' +
      /* Fee */
      '.nav-item .nav-text-icon.nav-fee{display:inline-flex;align-items:center;justify-content:center;width:36px;height:32px;font:900 19px Inter,system-ui,sans-serif;letter-spacing:-.04em;color:currentColor}' +
      /* SMS texto */
      '.nav-sms-text{display:inline-flex;align-items:center;justify-content:center;font:900 18px Inter,system-ui,sans-serif!important;letter-spacing:.03em;color:currentColor;border:none!important;background:none!important}' +
      /* Topbar sem caixa */
      '#screen-feed .topbar-icons .icon-btn,.topbar-icons .icon-btn{' +
      'width:auto!important;height:auto!important;min-width:0!important;' +
      'border:0!important;border-radius:0!important;background:transparent!important;' +
      'box-shadow:none!important;padding:4px!important}' +
      '#screen-feed .topbar-icons .icon-btn svg,.topbar-icons .icon-btn svg{width:26px!important;height:26px!important}' +
      /* Premium + Ads botões sempre visíveis quando injectados */
      '#tchiloPremiumBtn{display:flex!important;align-items:center;gap:12px;width:calc(100% - 36px);margin:12px 18px 4px;padding:14px;border:3px solid var(--ink,#0B0B0C);border-radius:16px;background:linear-gradient(135deg,#c8f560 0%,#9ee0ff 100%);color:var(--ink,#0B0B0C);font:800 14px Inter,system-ui,sans-serif;text-align:left;cursor:pointer;box-shadow:4px 4px 0 var(--ink,#0B0B0C)}' +
      '#tchiloPremiumBtn .prem-icon{width:42px;height:42px;border-radius:12px;border:2.5px solid var(--ink,#0B0B0C);background:#fff;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0}' +
      '#tchiloPremiumBtn .prem-text{flex:1;min-width:0}' +
      '#tchiloPremiumBtn .prem-text b{display:block;font-size:15px}' +
      '#tchiloPremiumBtn .prem-text span{display:block;font-size:12px;font-weight:700;opacity:.75;margin-top:2px}' +
      '#tchiloAdsMgrBtn{display:flex!important;align-items:center;gap:12px;width:100%;border:0;background:none;padding:14px 18px;text-align:left;font:700 15px Inter,system-ui,sans-serif;color:var(--ink,#0B0B0C);cursor:pointer;border-bottom:1px solid rgba(0,0,0,.06)}' +
      '#tchiloAdsMgrBtn .si-icon{width:36px;height:36px;border-radius:10px;background:#c8f560;border:2px solid var(--ink,#0B0B0C);display:flex;align-items:center;justify-content:center;font-weight:900;flex-shrink:0}' +
      '#tchiloAdsMgrBtn .chev{margin-left:auto;opacity:.5;font-size:18px}' +
      /* Gestor overlay */
      '#tchiloAdsPro{display:none;position:fixed;inset:0;z-index:9999;background:var(--paper,#F7F6F2);color:var(--ink,#0B0B0C);flex-direction:column}' +
      '#tchiloAdsPro.open{display:flex!important}';
  }

  /* —— Ícones nav de imediato —— */
  function applyNavNow() {
    try {
      var feedBtn =
        document.querySelector('.navbar .nav-item[data-screen="feed"]') ||
        document.querySelector('.navbar .nav-item[onclick*="onNavFeed"]');
      if (feedBtn && !feedBtn.querySelector('.nav-fee')) {
        feedBtn.querySelectorAll('svg,.nav-text-icon').forEach(function (n) {
          try { n.remove(); } catch (e) {}
        });
        var fee = document.createElement('span');
        fee.className = 'nav-text-icon nav-fee';
        fee.setAttribute('aria-hidden', 'true');
        fee.textContent = 'Fee';
        var dot = feedBtn.querySelector('.dot');
        if (dot) feedBtn.insertBefore(fee, dot);
        else feedBtn.insertBefore(fee, feedBtn.firstChild);
      }

      var icons = document.querySelector('#screen-feed .topbar-icons');
      if (icons) {
        icons.querySelectorAll('.icon-btn').forEach(function (el) {
          el.style.setProperty('border', 'none', 'important');
          el.style.setProperty('background', 'transparent', 'important');
          el.style.setProperty('box-shadow', 'none', 'important');
          el.style.setProperty('border-radius', '0', 'important');
          var svg = el.querySelector('svg');
          if (svg) {
            svg.style.setProperty('width', '26px', 'important');
            svg.style.setProperty('height', '26px', 'important');
          }
        });
        var smsBtn = icons.querySelector('[data-top-messages]');
        if (!smsBtn) {
          smsBtn = document.createElement('div');
          smsBtn.className = 'icon-btn';
          smsBtn.setAttribute('data-top-messages', '1');
          smsBtn.setAttribute('aria-label', 'Mensagens');
          smsBtn.onclick = function (e) {
            e.preventDefault();
            e.stopPropagation();
            if (typeof goTo === 'function') goTo('messages');
          };
          icons.appendChild(smsBtn);
        }
        if (!smsBtn.querySelector('.nav-sms-text')) {
          smsBtn.querySelectorAll('svg,.nav-sms-circle,.nav-sms-icon').forEach(function (n) {
            try { n.remove(); } catch (e2) {}
          });
          var sms = document.createElement('span');
          sms.className = 'nav-sms-text';
          sms.textContent = 'SMS';
          smsBtn.insertBefore(sms, smsBtn.firstChild);
        }
        smsBtn.style.setProperty('border', 'none', 'important');
        smsBtn.style.setProperty('background', 'transparent', 'important');
      }
    } catch (e) {}
  }

  /* —— Premium botão de imediato —— */
  function injectPremiumNow() {
    try {
      var list = document.querySelector('#screen-settings .settings-list');
      if (!list) return;
      if (document.getElementById('tchiloPremiumBtn')) return;
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.id = 'tchiloPremiumBtn';
      btn.innerHTML =
        '<div class="prem-icon" aria-hidden="true">★</div>' +
        '<div class="prem-text"><b data-prem-title>Tchilo Premium</b><span data-prem-sub>$3 · Ativar</span></div>' +
        '<span class="chev" style="font-size:18px;opacity:.6">›</span>';
      btn.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (typeof window.tchiloOpenPremiumCheckout === 'function') {
          window.tchiloOpenPremiumCheckout();
        } else {
          loadScriptOnce('native/paddle-premium.js', 'data-tchilo-paddle').then(function () {
            if (typeof window.tchiloOpenPremiumCheckout === 'function') {
              window.tchiloOpenPremiumCheckout();
            } else {
              alert('A carregar pagamento… tenta de novo em 1 segundo.');
            }
          });
        }
      };
      if (list.firstChild) list.insertBefore(btn, list.firstChild);
      else list.appendChild(btn);
    } catch (e) {}
  }

  /* —— Gestor de Anúncios de imediato —— */
  function injectAdsBtnNow() {
    try {
      var list = document.querySelector('#screen-settings .settings-list');
      if (!list) return;
      var btn = document.getElementById('tchiloAdsMgrBtn');
      if (!btn) {
        btn = document.createElement('button');
        btn.type = 'button';
        btn.id = 'tchiloAdsMgrBtn';
        btn.className = 'settings-item';
        btn.innerHTML =
          '<div class="si-icon">A</div><span>Gestor de Anúncios</span><div class="chev">›</div>';
        var after = document.getElementById('tchiloPremiumBtn');
        if (after && after.nextSibling) list.insertBefore(btn, after.nextSibling);
        else if (after) list.insertBefore(btn, after.nextSibling);
        else if (list.firstChild) list.insertBefore(btn, list.firstChild);
        else list.appendChild(btn);
      }
      btn.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        openAdsNow();
      };
    } catch (e) {}
  }

  function loadScriptOnce(src, attr) {
    return new Promise(function (resolve) {
      if (attr && document.querySelector('script[' + attr + ']')) {
        resolve(true);
        return;
      }
      var full = src + (src.indexOf('?') >= 0 ? '&' : '?') + V;
      var s = document.createElement('script');
      s.src = full;
      s.async = false;
      if (attr) s.setAttribute(attr, '1');
      s.onload = function () { resolve(true); };
      s.onerror = function () { resolve(false); };
      (document.head || document.documentElement).appendChild(s);
    });
  }

  function openAdsNow() {
    if (typeof window.tchiloOpenAdsPro === 'function') {
      window.tchiloOpenAdsPro();
      return;
    }
    if (typeof window.tchiloOpenAdsManager === 'function') {
      window.tchiloOpenAdsManager();
      return;
    }
    /* carregar pro e abrir */
    var paths = [
      'native/tchilo-ads-pro.js',
      'https://tchilopop.com/native/tchilo-ads-pro.js',
      'https://zacariasguilhermejoao-ui.github.io/tchilo-Pop/native/tchilo-ads-pro.js'
    ];
    var i = 0;
    function tryNext() {
      if (i >= paths.length) {
        alert('Não foi possível abrir o Gestor de Anúncios. Verifica a internet e faz hard refresh.');
        return;
      }
      var src = paths[i++];
      loadScriptOnce(src, i === 1 ? 'data-tchilo-ads-pro' : 'data-tchilo-ads-pro-' + i).then(function (ok) {
        if (typeof window.tchiloOpenAdsPro === 'function') {
          window.tchiloOpenAdsPro();
        } else if (typeof window.tchiloOpenAdsManager === 'function') {
          window.tchiloOpenAdsManager();
        } else {
          tryNext();
        }
      });
    }
    tryNext();
  }

  window.tchiloOpenAdsManager = window.tchiloOpenAdsManager || openAdsNow;
  window.__tchiloOpenAdsNow = openAdsNow;

  /* captura global no botão (mesmo se outro script reescrever) */
  document.addEventListener(
    'click',
    function (e) {
      var t = e.target;
      if (!t || !t.closest) return;
      var btn = t.closest('#tchiloAdsMgrBtn');
      if (btn) {
        e.preventDefault();
        e.stopPropagation();
        openAdsNow();
      }
    },
    true
  );

  function loadExtra(src, attr) {
    if (document.querySelector('script[' + attr + ']')) return;
    var s = document.createElement('script');
    s.src = src + (src.indexOf('?') >= 0 ? '&' : '?') + V;
    s.async = false;
    s.setAttribute(attr, '1');
    (document.head || document.documentElement).appendChild(s);
  }

  function loadDeferred(src, attr) {
    if (document.querySelector('script[' + attr + ']')) return;
    var s = document.createElement('script');
    s.src = src + (src.indexOf('?') >= 0 ? '&' : '?') + V;
    s.defer = true;
    s.setAttribute(attr, '1');
    (document.head || document.documentElement).appendChild(s);
  }

  function silenceBusyOnly() {
    try {
      if (typeof showToast === 'function' && !window.__tchiloRealShowToast) {
        window.__tchiloRealShowToast = showToast;
      }
      if (typeof window.tchiloShowBusy === 'function') {
        window.tchiloShowBusy = function () {};
      }
    } catch (e) {}
  }

  function bootUI() {
    injectCriticalCSS();
    applyNavNow();
    injectPremiumNow();
    injectAdsBtnNow();
  }

  function bootScripts() {
    /* críticos em ordem, sem defer */
    loadExtra('native/paddle-premium.js', 'data-tchilo-paddle');
    loadExtra('native/tchilo-ads-pro.js', 'data-tchilo-ads-pro');
    loadExtra('native/tchilo-ads-force.js', 'data-tchilo-ads-force');
    loadExtra('native/tchilo-ads-ui.js', 'data-tchilo-ads-ui');
    loadExtra('native/nav-layout.js', 'data-tchilo-nav-layout');

    /* resto */
    loadDeferred('native/fx-live-patch.js', 'data-tchilo-fx-live');
    loadDeferred('native/paddle-ad-guard.js', 'data-tchilo-paddle-guard');
    loadDeferred('native/tchilo-theme-premium-gate.js', 'data-tchilo-theme-gate');
    loadDeferred('native/tchilo-ads.js', 'data-tchilo-ads');
    loadDeferred('native/tchilo-ads-draft.js', 'data-tchilo-ads-draft');
    loadDeferred('native/tchilo-ads-analytics.js', 'data-tchilo-ads-analytics');
    loadDeferred('native/tchilo-ads-preview.js', 'data-tchilo-ads-preview');
    loadDeferred('native/tchilo-stickers-gifs.js', 'data-tchilo-sg');
    loadDeferred('native/tchilo-sticker-create.js', 'data-tchilo-sc');
    loadDeferred('native/tchilo-stickers-custom-hook.js', 'data-tchilo-sc-hook');
    loadDeferred('native/tchilo-theme-retro.js', 'data-tchilo-retro');
    loadDeferred('native/tchilo-theme-halloween.js', 'data-tchilo-halloween');
    loadDeferred('native/tchilo-theme-gothic.js', 'data-tchilo-gothic');
    loadDeferred('native/tchilo-themes-pack.js', 'data-tchilo-themes-pack');
    loadDeferred('native/gal-thumb.js', 'data-tchilo-gal-thumb');
    loadDeferred('native/feed-video-thumbs.js', 'data-tchilo-vid-thumbs');
    loadDeferred('native/chat-audio-fix.js', 'data-tchilo-chat-audio');
    loadDeferred('native/chat-send-fix.js', 'data-tchilo-chat-send');
    [
      ['native/deezer-fetch.js', 'data-tchilo-deezer'],
      ['native/music-android-patch.js', 'data-tchilo-music-patch'],
      ['native/boot-fast.js', 'data-tchilo-boot-fast'],
      ['native/android-media-fix.js', 'data-tchilo-android-media'],
      ['native/pt-themes-fix.js', 'data-tchilo-pt-themes'],
      ['native/feed-music-fix.js', 'data-tchilo-feed-music-fix'],
      ['native/reels-fast.js', 'data-tchilo-reels-fast'],
      ['native/reels-follow-fix.js', 'data-tchilo-reels-follow'],
      ['native/offline-cache.js', 'data-tchilo-offline-cache'],
      ['native/password-toggle.js', 'data-tchilo-pw-toggle']
    ].forEach(function (x) {
      loadDeferred(x[0], x[1]);
    });
  }

  /* patch goTo settings para injectar já */
  function patchGoTo() {
    if (typeof window.goTo !== 'function' || window.goTo.__critBoot) return;
    var orig = window.goTo;
    window.goTo = function (s) {
      var r = orig.apply(this, arguments);
      if (s === 'settings' || s === 'feed') {
        setTimeout(bootUI, 0);
        setTimeout(bootUI, 50);
      }
      return r;
    };
    window.goTo.__critBoot = true;
  }

  function boot() {
    silenceBusyOnly();
    bootUI();
    bootScripts();
    patchGoTo();
  }

  /* corre JÁ — não espera DOMContentLoaded se já há DOM */
  injectCriticalCSS();
  bootUI();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
  setInterval(bootUI, 2000);
  setTimeout(bootUI, 100);
  setTimeout(bootUI, 400);
  setTimeout(bootUI, 1000);
})();

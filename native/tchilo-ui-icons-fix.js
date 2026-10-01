/**
 * Tchilo — SMS no topbar + lupa estavel
 * v4 — sem setInterval / sem reordenar o DOM periodicamente (causava icones a mexer)
 */
(function () {
  'use strict';
  if (window.__tchiloUiIconsFixV4) return;
  window.__tchiloUiIconsFixV4 = true;
  window.__tchiloUiIconsFixV3 = true;
  window.__tchiloUiIconsFixV2 = true;
  window.__tchiloUiIconsFixV1 = true;

  var placed = false;

  function injectCSS() {
    var st = document.getElementById('tchiloUiIconsCSS');
    if (!st) {
      st = document.createElement('style');
      st.id = 'tchiloUiIconsCSS';
      document.head.appendChild(st);
    }
    st.textContent =
      '#screen-feed .topbar-icons,' +
      '.topbar-icons{' +
      'display:flex!important;align-items:center!important;gap:16px!important;' +
      'position:relative!important;}' +
      '#screen-feed .topbar-icons .icon-btn,' +
      '.topbar-icons .icon-btn{' +
      'width:auto!important;height:auto!important;min-width:0!important;' +
      'border:0!important;border-radius:0!important;' +
      'background:transparent!important;box-shadow:none!important;' +
      'padding:4px!important;display:inline-flex!important;' +
      'align-items:center!important;justify-content:center!important;' +
      'cursor:pointer!important;' +
      'position:static!important;transform:none!important;' +
      'transition:none!important;animation:none!important;}' +
      '#screen-feed .topbar-icons .icon-btn svg,' +
      '.topbar-icons .icon-btn svg{' +
      'width:28px!important;height:28px!important;display:block!important;' +
      'stroke-width:2.4!important;' +
      'transform:none!important;transition:none!important;animation:none!important;}' +
      '.topbar-icons .nav-sms-text,' +
      '.topbar-icons .topbar-sms,' +
      '.topbar-sms,' +
      '[data-top-messages] .nav-sms-text{' +
      'display:inline-flex!important;align-items:center!important;justify-content:center!important;' +
      'font:900 20px Inter,system-ui,sans-serif!important;' +
      'letter-spacing:.03em!important;line-height:1!important;' +
      'color:var(--ink,#0B0B0C)!important;' +
      'border:0!important;background:none!important;box-shadow:none!important;' +
      'padding:4px 2px!important;cursor:pointer!important;' +
      'opacity:1!important;visibility:visible!important;' +
      'user-select:none;-webkit-user-select:none;' +
      'transform:none!important;transition:none!important;animation:none!important;}' +
      '[data-top-messages]{' +
      'display:inline-flex!important;align-items:center!important;' +
      'opacity:1!important;visibility:visible!important;' +
      'pointer-events:auto!important;' +
      'position:static!important;transform:none!important;' +
      'transition:none!important;animation:none!important;}';
  }

  function openMessages(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    try {
      if (typeof goTo === 'function') goTo('messages');
    } catch (err) {}
  }

  function fixTopbarIcons() {
    var bar =
      document.querySelector('#screen-feed .topbar-icons') ||
      document.querySelector('.topbar .topbar-icons') ||
      document.querySelector('.topbar-icons');
    if (!bar) return false;

    var searchBtn =
      bar.querySelector('.icon-btn[onclick*="search"]') ||
      bar.querySelector('[onclick*="search"]') ||
      null;
    if (!searchBtn) {
      var candidates = bar.querySelectorAll('.icon-btn');
      for (var i = 0; i < candidates.length; i++) {
        if (candidates[i].querySelector('svg circle') && !candidates[i].getAttribute('data-top-messages')) {
          searchBtn = candidates[i];
          break;
        }
      }
    }
    if (searchBtn) {
      searchBtn.querySelectorAll('svg').forEach(function (svg) {
        svg.setAttribute('width', '28');
        svg.setAttribute('height', '28');
        svg.style.setProperty('width', '28px', 'important');
        svg.style.setProperty('height', '28px', 'important');
        svg.style.setProperty('transform', 'none', 'important');
      });
    }

    var sms =
      bar.querySelector('[data-top-messages]') ||
      bar.querySelector('.topbar-sms');

    if (!sms) {
      sms = document.createElement('button');
      sms.type = 'button';
      sms.className = 'icon-btn topbar-sms';
      sms.setAttribute('data-top-messages', '1');
      sms.setAttribute('aria-label', 'Mensagens');
      sms.innerHTML = '<span class="nav-sms-text">SMS</span>';
      sms.addEventListener('click', openMessages);
      // Colocar UMA vez: SMS antes da lupa, e nunca mais mover
      if (searchBtn && searchBtn.parentNode === bar) {
        bar.insertBefore(sms, searchBtn);
      } else {
        bar.appendChild(sms);
      }
    } else {
      // Ja existe: so garantir visibilidade, NAO reordenar
      sms.style.setProperty('display', 'inline-flex', 'important');
      sms.style.setProperty('visibility', 'visible', 'important');
      sms.style.setProperty('opacity', '1', 'important');
      sms.style.setProperty('transform', 'none', 'important');
      if (!sms.querySelector('.nav-sms-text')) {
        sms.innerHTML = '<span class="nav-sms-text">SMS</span>';
      }
      if (!sms.__tchiloSmsBound) {
        sms.addEventListener('click', openMessages);
        sms.__tchiloSmsBound = true;
      }
    }

    return true;
  }

  function runOnce() {
    injectCSS();
    if (fixTopbarIcons()) placed = true;
  }

  runOnce();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runOnce);
  }
  // Poucas tentativas iniciais (DOM pode carregar tarde) — SEM setInterval
  setTimeout(runOnce, 150);
  setTimeout(runOnce, 600);
  setTimeout(function () {
    if (!placed) runOnce();
  }, 1500);
})();

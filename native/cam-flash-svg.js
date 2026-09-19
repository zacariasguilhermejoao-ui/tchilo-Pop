/**
 * tchilo-Pop — overlay: flash SVG profissional (sem emoji)
 */
(function () {
  'use strict';

  var FLASH_SVG =
    '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">' +
    '<path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"/></svg>';
  var FLIP_SVG =
    '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/>' +
    '<path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>';

  var torchOn = false;

  function injectCSS() {
    if (document.getElementById('tchiloFlashCSS')) return;
    var st = document.createElement('style');
    st.id = 'tchiloFlashCSS';
    st.textContent =
      '#tchiloCam .icon,#tchiloCamFlash{width:44px;height:44px;border:0;border-radius:50%;' +
      'background:rgba(255,255,255,.2);color:#fff;display:flex;align-items:center;justify-content:center;padding:0;}' +
      '#tchiloCamFlash.flash-on{background:#c8f560;color:#111;}' +
      '#tchiloCam .icon svg,#tchiloCamFlash svg{display:block;pointer-events:none;}' +
      '#tchiloCam [data-emoji-flash],#tchiloCam .flash-emoji{display:none!important;}';
    document.head.appendChild(st);
  }

  async function toggleTorch() {
    torchOn = !torchOn;
    var btn = document.getElementById('tchiloCamFlash');
    if (btn) btn.classList.toggle('flash-on', torchOn);
    var stream = null;
    try {
      var v = document.getElementById('tchiloCamVideo');
      stream = v && v.srcObject;
    } catch (e) {}
    if (!stream) return;
    var track = stream.getVideoTracks && stream.getVideoTracks()[0];
    if (!track) return;
    try {
      var caps = track.getCapabilities ? track.getCapabilities() : {};
      if (caps && caps.torch) {
        await track.applyConstraints({ advanced: [{ torch: torchOn }] });
      }
    } catch (e2) {
      torchOn = false;
      if (btn) btn.classList.remove('flash-on');
    }
  }

  function ensureFlashBtn() {
    injectCSS();
    var root = document.getElementById('tchiloCam');
    if (!root) return;
    var top = root.querySelector('.top');
    if (!top) return;

    var flipTop = document.getElementById('tchiloCamFlipTop');
    if (flipTop && !flipTop.querySelector('svg')) {
      flipTop.innerHTML = FLIP_SVG;
      flipTop.setAttribute('aria-label', 'Inverter');
    }
    var flipBot = document.getElementById('tchiloCamFlip');
    if (flipBot && !flipBot.querySelector('svg')) {
      flipBot.innerHTML = FLIP_SVG;
      flipBot.setAttribute('aria-label', 'Inverter');
    }

    top.querySelectorAll('button').forEach(function (b) {
      var txt = (b.textContent || '').trim();
      if (/^[\u26A1\uD83D\uDD26\uD83D\uDCA1\u2728\uD83D\uDD06]$/.test(txt) && b.id !== 'tchiloCamFlash') {
        b.style.display = 'none';
      }
    });

    var flash = document.getElementById('tchiloCamFlash');
    if (!flash) {
      flash = document.createElement('button');
      flash.type = 'button';
      flash.id = 'tchiloCamFlash';
      flash.className = 'icon';
      flash.setAttribute('aria-label', 'Flash');
      flash.title = 'Flash';
      flash.innerHTML = FLASH_SVG;
      if (flipTop && flipTop.parentNode) {
        flipTop.parentNode.insertBefore(flash, flipTop);
      } else {
        top.appendChild(flash);
      }
    } else if (!flash.querySelector('svg')) {
      flash.innerHTML = FLASH_SVG;
    }
    flash.onclick = function (e) {
      e.preventDefault();
      e.stopPropagation();
      toggleTorch();
    };
  }

  function boot() {
    injectCSS();
    ensureFlashBtn();
    try {
      new MutationObserver(function () {
        if (document.getElementById('tchiloCam')) ensureFlashBtn();
      }).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style'] });
    } catch (e) {}
    [300, 1000, 2500].forEach(function (ms) {
      setTimeout(ensureFlashBtn, ms);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();

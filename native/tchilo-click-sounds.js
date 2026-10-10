/**
 * Tchilo — sons curtos nativos (Web Audio)
 * gosto · guardar · mensagem · lupa pesquisa
 */
(function () {
  'use strict';
  if (window.__tchiloClickSoundsV1) return;
  window.__tchiloClickSoundsV1 = true;

  var ctx = null;
  var unlocked = false;

  function getCtx() {
    if (ctx) return ctx;
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      return ctx;
    } catch (e) {
      return null;
    }
  }

  function unlock() {
    var c = getCtx();
    if (!c) return;
    if (c.state === 'suspended') {
      try {
        c.resume();
      } catch (e) {}
    }
    unlocked = true;
  }

  document.addEventListener('touchstart', unlock, { once: true, passive: true });
  document.addEventListener('click', unlock, { once: true, passive: true });

  /**
   * tone: frequência base, duration ms, type, volume
   */
  function beep(opts) {
    try {
      var c = getCtx();
      if (!c) return;
      if (c.state === 'suspended') c.resume();

      var o = c.createOscillator();
      var g = c.createGain();
      o.type = opts.type || 'sine';
      o.frequency.value = opts.freq || 600;

      var now = c.currentTime;
      var dur = (opts.dur || 0.06);
      var vol = opts.vol != null ? opts.vol : 0.08;

      g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime(vol, now + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, now + dur);

      o.connect(g);
      g.connect(c.destination);
      o.start(now);
      o.stop(now + dur + 0.02);
    } catch (e) {}
  }

  function playLike() {
    /* pop curto agradável */
    beep({ freq: 720, dur: 0.05, type: 'sine', vol: 0.07 });
    setTimeout(function () {
      beep({ freq: 980, dur: 0.05, type: 'sine', vol: 0.05 });
    }, 40);
  }

  function playSave() {
    beep({ freq: 520, dur: 0.07, type: 'triangle', vol: 0.07 });
  }

  function playMessage() {
    beep({ freq: 640, dur: 0.06, type: 'sine', vol: 0.07 });
    setTimeout(function () {
      beep({ freq: 800, dur: 0.05, type: 'sine', vol: 0.05 });
    }, 50);
  }

  function playSearch() {
    beep({ freq: 880, dur: 0.045, type: 'sine', vol: 0.06 });
  }

  window.tchiloSound = {
    like: playLike,
    save: playSave,
    message: playMessage,
    search: playSearch
  };

  function isLikeTarget(el) {
    if (!el) return false;
    if (el.closest && el.closest('.post-like, [data-action="like"], .like-btn, button.like')) return true;
    var t = (el.getAttribute && (el.getAttribute('aria-label') || el.getAttribute('title') || '')) || '';
    if (/gosto|like|curtir/i.test(t)) return true;
    /* SVG path common in like buttons - class on parent */
    var btn = el.closest && el.closest('button, [role="button"], .post-actions span, .post-actions div');
    if (!btn) return false;
    var cls = (btn.className && String(btn.className)) || '';
    if (/like|gosto|heart/i.test(cls)) return true;
    var html = '';
    try {
      html = btn.innerHTML || '';
    } catch (e) {}
    /* thumbs / heart icons near count */
    if (btn.closest && btn.closest('.post-actions')) {
      var idx = -1;
      try {
        var acts = btn.closest('.post-actions');
        var kids = acts ? acts.querySelectorAll('button, [role="button"], span[onclick], div[onclick]') : [];
        for (var i = 0; i < kids.length; i++) if (kids[i] === btn || kids[i].contains(el)) idx = i;
        if (idx === 0) return true; /* primeiro costuma ser like */
      } catch (e2) {}
    }
    return false;
  }

  function isSaveTarget(el) {
    if (!el) return false;
    if (el.closest && el.closest('.post-save, [data-action="save"], .save-btn, .bookmark, button.save')) return true;
    var t = (el.getAttribute && (el.getAttribute('aria-label') || el.getAttribute('title') || '')) || '';
    if (/guardar|salvar|save|bookmark|favorit/i.test(t)) return true;
    var btn = el.closest && el.closest('button, [role="button"]');
    if (!btn) return false;
    var cls = (btn.className && String(btn.className)) || '';
    if (/save|bookmark|guardar/i.test(cls)) return true;
    return false;
  }

  function isMessageTarget(el) {
    if (!el) return false;
    if (el.closest && el.closest('[data-nav="messages"], [data-screen="messages"], .nav-msg, #btnMessages, .topbar-msg')) return true;
    var t = (el.getAttribute && (el.getAttribute('aria-label') || el.getAttribute('title') || '')) || '';
    if (/mensagem|message|chat|sms|inbox/i.test(t)) return true;
    /* topbar right icons: message often before search */
    var a = el.closest && el.closest('a, button, [role="button"], .topbar-icon, .icon-btn');
    if (!a) return false;
    var oc = (a.getAttribute && (a.getAttribute('onclick') || '')) || '';
    if (/message|mensagem|chat|goTo\(['"]messages/i.test(oc)) return true;
    if (/goTo\(['"]dm|openMessages|openChat/i.test(oc)) return true;
    return false;
  }

  function isSearchTarget(el) {
    if (!el) return false;
    if (el.closest && el.closest('[data-nav="search"], [data-screen="search"], #btnSearch, .topbar-search, .search-btn')) return true;
    var t = (el.getAttribute && (el.getAttribute('aria-label') || el.getAttribute('title') || '')) || '';
    if (/pesquis|search|lupa|buscar/i.test(t)) return true;
    var a = el.closest && el.closest('a, button, [role="button"], .topbar-icon, .icon-btn');
    if (!a) return false;
    var oc = (a.getAttribute && (a.getAttribute('onclick') || '')) || '';
    if (/search|pesquis|goTo\(['"]search/i.test(oc)) return true;
    /* lupa SVG: circle + line */
    try {
      if (a.querySelector && a.querySelector('svg circle') && /search|pesquis/i.test(a.outerHTML || '')) return true;
    } catch (e) {}
    return false;
  }

  document.addEventListener(
    'click',
    function (e) {
      var el = e.target;
      if (!el) return;
      try {
        if (isLikeTarget(el)) {
          playLike();
          return;
        }
        if (isSaveTarget(el)) {
          playSave();
          return;
        }
        if (isMessageTarget(el)) {
          playMessage();
          return;
        }
        if (isSearchTarget(el)) {
          playSearch();
          return;
        }
      } catch (err) {}
    },
    true
  );

  /* também nos handlers conhecidos */
  function patchFns() {
    ['toggleLike', 'toggleSave', 'likePost', 'savePost'].forEach(function (name) {
      try {
        if (typeof window[name] !== 'function' || window[name].__sound) return;
        var orig = window[name];
        window[name] = function () {
          if (name.toLowerCase().indexOf('like') >= 0) playLike();
          else playSave();
          return orig.apply(this, arguments);
        };
        window[name].__sound = true;
      } catch (e) {}
    });
  }
  patchFns();
  setTimeout(patchFns, 800);
  setTimeout(patchFns, 2500);
})();

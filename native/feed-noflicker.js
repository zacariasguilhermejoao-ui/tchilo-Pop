/**
 * tchilo-Pop — anti-piscar + sem barras pretas de toast + PT placeholders
 * + carrega nav-layout (mensagens no topo, reels em baixo)
 */
(function () {
  'use strict';

  var lastSig = '';
  var lastRenderAt = 0;
  var pending = null;
  var MIN_MS = 600;

  function loadNavLayout() {
    if (document.querySelector('script[data-tchilo-nav-layout]')) return;
    var s = document.createElement('script');
    s.src = 'native/nav-layout.js';
    s.async = true;
    s.setAttribute('data-tchilo-nav-layout', '1');
    document.head.appendChild(s);
  }

  function injectCSS() {
    var st = document.getElementById('tchiloNoFlickerCSS');
    if (!st) {
      st = document.createElement('style');
      st.id = 'tchiloNoFlickerCSS';
      document.head.appendChild(st);
    }
    st.textContent =
      '#feedList .post-media{background:#e8e6de!important;}' +
      '#feedList .post-media img,#feedList .post-media video{' +
      'background:#e8e6de!important;transition:none!important;}' +
      '#feedList .post{animation:none!important;}' +
      '#screen-feed .topbar{background:var(--paper,#F3F1E9)!important;}' +
      '#screen-feed,#feedList{background:var(--paper,#F3F1E9)!important;}' +
      '.toast,#toast,.toast.show{' +
      'display:none!important;opacity:0!important;visibility:hidden!important;' +
      'pointer-events:none!important;height:0!important;max-height:0!important;' +
      'padding:0!important;margin:0!important;border:none!important;' +
      'transform:none!important;font-size:0!important;line-height:0!important;}' +
      '#tchiloBusy.tchilo-busy,#tchiloBusy.tchilo-busy.show,.tchilo-busy.show{' +
      'display:none!important;opacity:0!important;visibility:hidden!important;}';
  }

  function killToastEl() {
    var t = document.getElementById('toast');
    if (t) {
      t.classList.remove('show');
      t.style.cssText =
        'display:none!important;opacity:0!important;visibility:hidden!important;height:0!important;padding:0!important;';
      t.textContent = '';
    }
    var busy = document.getElementById('tchiloBusy');
    if (busy) {
      busy.classList.remove('show');
      busy.style.display = 'none';
    }
  }

  function silenceToasts() {
    var noop = function () {
      killToastEl();
    };
    try {
      window.showToast = noop;
    } catch (e) {}
    try {
      Object.defineProperty(window, 'showToast', {
        configurable: true,
        enumerable: true,
        writable: true,
        value: noop
      });
    } catch (e2) {
      window.showToast = noop;
    }
    try {
      window.tchiloShowBusy = function () {};
      window.tchiloHideBusy = function () {
        killToastEl();
      };
    } catch (e3) {}
    killToastEl();
  }

  var silenceTimer = setInterval(silenceToasts, 400);
  setTimeout(function () {
    clearInterval(silenceTimer);
    silenceToasts();
    setInterval(function () {
      if (typeof window.showToast === 'function') {
        var src = '';
        try {
          src = Function.prototype.toString.call(window.showToast);
        } catch (e) {}
        if (src.indexOf("getElementById('toast')") >= 0 || src.indexOf('classList.add') >= 0) {
          silenceToasts();
        }
      }
    }, 2000);
  }, 8000);

  function watchToastDom() {
    var t = document.getElementById('toast');
    if (!t || t.__watched) return;
    t.__watched = true;
    try {
      new MutationObserver(function () {
        if (t.classList.contains('show') || (t.textContent && t.textContent.trim())) {
          killToastEl();
        }
      }).observe(t, { attributes: true, childList: true, characterData: true, subtree: true });
    } catch (e) {}
  }

  function portuguesePlaceholders() {
    var title = document.getElementById('createTitle');
    if (title) title.setAttribute('placeholder', 'Texto grande (ex: NOITE ÉPICA)');
    document.querySelectorAll('input[placeholder], textarea[placeholder]').forEach(function (el) {
      var p = el.getAttribute('placeholder') || '';
      if (/EPIC\s*NIGHT/i.test(p)) {
        el.setAttribute('placeholder', p.replace(/EPIC\s*NIGHT/gi, 'NOITE ÉPICA'));
      }
    });
  }

  function feedSignature() {
    try {
      var posts = typeof getPosts === 'function' ? getPosts() : [];
      if (!Array.isArray(posts)) return '';
      var parts = [];
      for (var i = 0; i < Math.min(posts.length, 80); i++) {
        var p = posts[i];
        if (!p) continue;
        parts.push(
          String(p.id) +
            ':' +
            String(p.username || '') +
            ':' +
            String(p.displayName || '') +
            ':' +
            String(p.likes || 0) +
            ':' +
            String(p.comments || 0)
        );
      }
      return parts.join('|') + '#' + posts.length;
    } catch (e) {
      return String(Date.now());
    }
  }

  function wrapRenderFeed() {
    if (typeof window.renderFeed !== 'function') return;
    if (window.renderFeed.__noflicker) return;

    var orig = window.renderFeed;
    window.renderFeed = function (force) {
      var now = Date.now();
      var sig = feedSignature();

      if (!force && sig && sig === lastSig) {
        var feed = document.getElementById('feedList');
        if (feed && feed.querySelector('.post[data-id]')) return;
      }

      if (!force && now - lastRenderAt < MIN_MS) {
        if (pending) clearTimeout(pending);
        pending = setTimeout(function () {
          pending = null;
          window.renderFeed(true);
        }, MIN_MS - (now - lastRenderAt));
        return;
      }

      lastRenderAt = now;
      lastSig = sig;
      return orig.apply(this, arguments);
    };
    window.renderFeed.__noflicker = true;
  }

  function patchNamesInPlace(posts) {
    if (!Array.isArray(posts)) return;
    var byId = {};
    posts.forEach(function (p) {
      if (p && p.id) byId[String(p.id)] = p;
    });
    document.querySelectorAll('#feedList .post[data-id]').forEach(function (el) {
      var id = el.getAttribute('data-id');
      var p = byId[id];
      if (!p) return;
      var name =
        p.displayName && String(p.displayName).indexOf('user_') !== 0
          ? p.displayName
          : p.username || '';
      if (!name || name === 'Utilizador' || name.indexOf('user_') === 0) return;
      var b = el.querySelector('.post-user .who b');
      if (b && b.textContent !== name) b.textContent = name;
      var capB = el.querySelector('.post-caption > b');
      if (capB && capB.textContent !== name) capB.textContent = name;
    });
  }

  function softenFeedNames() {
    if (window.__tchiloNamesSoftened) return;
    window.__tchiloNamesSoftened = true;
    if (typeof window.save === 'function' && !window.save.__nfHook) {
      var origSave = window.save;
      window.save = function (key, val) {
        var r = origSave.apply(this, arguments);
        try {
          if (typeof KEYS !== 'undefined' && key === KEYS.posts && Array.isArray(val)) {
            patchNamesInPlace(val);
            lastSig = feedSignature();
          }
        } catch (e) {}
        return r;
      };
      window.save.__nfHook = true;
    }
  }

  function boot() {
    injectCSS();
    silenceToasts();
    watchToastDom();
    portuguesePlaceholders();
    wrapRenderFeed();
    softenFeedNames();
    loadNavLayout();
    setTimeout(function () {
      silenceToasts();
      watchToastDom();
      portuguesePlaceholders();
      wrapRenderFeed();
      injectCSS();
      loadNavLayout();
    }, 300);
    setTimeout(silenceToasts, 1000);
    setTimeout(silenceToasts, 2500);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();

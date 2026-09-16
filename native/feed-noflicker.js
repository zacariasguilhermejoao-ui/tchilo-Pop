/**
 * tchilo-Pop — para o piscar do feed e o flash verde (mint)
 * + desativa barras pretas de toast
 * + placeholders em português
 */
(function () {
  'use strict';

  var lastSig = '';
  var lastRenderAt = 0;
  var pending = null;
  var MIN_MS = 600;

  function injectCSS() {
    if (document.getElementById('tchiloNoFlickerCSS')) return;
    var st = document.createElement('style');
    st.id = 'tchiloNoFlickerCSS';
    st.textContent =
      '#feedList .post-media{background:#e8e6de!important;}' +
      '#feedList .post-media img,#feedList .post-media video{' +
      'background:#e8e6de!important;transition:none!important;}' +
      '#feedList .post{animation:none!important;}' +
      '#screen-feed .topbar{background:var(--paper,#F3F1E9)!important;}' +
      '#screen-feed,#feedList{background:var(--paper,#F3F1E9)!important;}' +
      /* barras pretas de notificação / toast — escondidas */
      '.toast,#toast,.toast.show,.snackbar{display:none!important;opacity:0!important;visibility:hidden!important;pointer-events:none!important;height:0!important;padding:0!important;margin:0!important;}';
    document.head.appendChild(st);
  }

  function silenceToasts() {
    // showToast deixa de mostrar barras pretas (mantém a função para não quebrar o código)
    window.showToast = function (msg) {
      try {
        if (typeof console !== 'undefined' && console.log) {
          console.log('[Tchilo]', msg);
        }
      } catch (e) {}
    };
    var el = document.getElementById('toast');
    if (el) {
      el.classList.remove('show');
      el.style.display = 'none';
      el.textContent = '';
    }
  }

  function portuguesePlaceholders() {
    var title = document.getElementById('createTitle');
    if (title) {
      title.setAttribute('placeholder', 'Texto grande (ex: NOITE ÉPICA)');
    }
    var cap = document.getElementById('createCaption');
    if (cap) {
      var ph = cap.getAttribute('placeholder') || '';
      if (/hashtag/i.test(ph) && !/legenda/i.test(ph)) {
        cap.setAttribute('placeholder', 'Escreve a legenda… usa #hashtags');
      }
    }
    // corrige exemplos em inglês noutros inputs visíveis
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
        if (feed && feed.querySelector('.post[data-id]')) {
          return;
        }
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
      var span = el.querySelector('.post-user .who span');
      if (span && p.username) {
        var rest = span.textContent.replace(/^@[^·]*/, '@' + p.username);
        if (span.textContent !== rest) span.textContent = rest;
      }
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

  function disableStoriesScrollFight() {
    var st = document.getElementById('tchiloFeedStoriesScrollCSS');
    if (st) {
      st.textContent +=
        '#screen-feed.active,#screen-feed .topbar,#feedList.feed{background:var(--paper,#F3F1E9)!important;}';
    }
  }

  function boot() {
    injectCSS();
    silenceToasts();
    portuguesePlaceholders();
    wrapRenderFeed();
    softenFeedNames();
    disableStoriesScrollFight();
    setTimeout(function () {
      silenceToasts();
      portuguesePlaceholders();
      wrapRenderFeed();
      softenFeedNames();
      injectCSS();
    }, 400);
    setTimeout(function () {
      silenceToasts();
      portuguesePlaceholders();
      wrapRenderFeed();
    }, 1500);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();

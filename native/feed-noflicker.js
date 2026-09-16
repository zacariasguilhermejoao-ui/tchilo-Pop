/**
 * tchilo-Pop — para o piscar do feed e o flash verde (mint)
 * 1) Debounce + fingerprint em renderFeed (não recria o DOM se os posts são os mesmos)
 * 2) feed-names atualiza só o texto, sem re-render completo
 * 3) Fundo neutro no media (sem mint a piscar)
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
      /* fundo neutro — evita flash mint (#2EE6A6) ao repor imagens */
      '#feedList .post-media{background:#e8e6de!important;}' +
      '#feedList .post-media img,#feedList .post-media video{' +
      'background:#e8e6de!important;transition:none!important;}' +
      '#feedList .post{animation:none!important;}' +
      '#feedList .post-media .stamp{/* posts só texto mantêm cor via classe no parent */}' +
      /* topbar estável */
      '#screen-feed .topbar{background:var(--paper,#F3F1E9)!important;}' +
      '#screen-feed,#feedList{background:var(--paper,#F3F1E9)!important;}';
    document.head.appendChild(st);
  }

  function feedSignature() {
    try {
      var posts = typeof getPosts === 'function' ? getPosts() : [];
      if (!Array.isArray(posts)) return '';
      // ids + usernames + likes/comments — se igual, não vale a pena re-pintar
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

      // Se o DOM já tem os mesmos posts e não é force → não reescrever
      if (!force && sig && sig === lastSig) {
        var feed = document.getElementById('feedList');
        if (feed && feed.querySelector('.post[data-id]')) {
          return;
        }
      }

      // Debounce: agrupa chamadas rápidas (cloud + names + goTo)
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

  /** Atualiza nomes no DOM sem destruir imagens */
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
    // Substitui o renderFeed completo do feed-names por update in-place
    if (window.__tchiloNamesSoftened) return;
    window.__tchiloNamesSoftened = true;

    // Quando alguém chamar renderFeed logo após resolve de nomes, o debounce cobre.
    // Extra: se existir resolveAllFeedNames no closure, não há API pública —
    // observamos saves via hook em save se existir.
    if (typeof window.save === 'function' && !window.save.__nfHook) {
      var origSave = window.save;
      window.save = function (key, val) {
        var r = origSave.apply(this, arguments);
        try {
          if (typeof KEYS !== 'undefined' && key === KEYS.posts && Array.isArray(val)) {
            patchNamesInPlace(val);
            // atualiza fingerprint para o próximo renderFeed não repintar à toa
            lastSig = feedSignature();
          }
        } catch (e) {}
        return r;
      };
      window.save.__nfHook = true;
    }
  }

  function disableStoriesScrollFight() {
    // O script feed-stories-scroll pode forçar reflows; garante fundo paper
    var st = document.getElementById('tchiloFeedStoriesScrollCSS');
    if (st) {
      st.textContent +=
        '#screen-feed.active,#screen-feed .topbar,#feedList.feed{background:var(--paper,#F3F1E9)!important;}';
    }
  }

  function boot() {
    injectCSS();
    wrapRenderFeed();
    softenFeedNames();
    disableStoriesScrollFight();
    setTimeout(function () {
      wrapRenderFeed();
      softenFeedNames();
      injectCSS();
    }, 400);
    setTimeout(wrapRenderFeed, 1500);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();

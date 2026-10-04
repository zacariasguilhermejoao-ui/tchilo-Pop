/**
 * Tchilo — Story viewer UI (nível Instagram)
 * - Media a ecrã inteiro (cover)
 * - Música: chip fino no topo
 * - Reply bar + coração profissional
 * - Enviar reply como mensagem ao autor
 */
(function () {
  'use strict';
  if (window.__tchiloStoryUiPro) return;
  window.__tchiloStoryUiPro = true;

  var HEART_OUT =
    '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/></svg>';
  var HEART_ON =
    '<svg viewBox="0 0 24 24" width="26" height="26" fill="#FF3B5C" stroke="#FF3B5C" stroke-width="1.2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/></svg>';

  function injectCSS() {
    var old = document.getElementById('tchiloStoryUiProCSS');
    if (old) old.remove();
    var st = document.createElement('style');
    st.id = 'tchiloStoryUiProCSS';
    st.textContent = [
      /* Full-bleed stage */
      '#storyViewer.story-viewer{',
      '  position:fixed!important;inset:0!important;z-index:200!important;',
      '  background:#000!important;display:none;flex-direction:column;',
      '}',
      '#storyViewer.story-viewer.open{display:flex!important;}',
      '#storyViewer .story-viewer-progress{',
      '  position:absolute;left:10px;right:10px;top:calc(8px + env(safe-area-inset-top));',
      '  z-index:20;display:flex;gap:3px;height:2.5px;margin:0!important;',
      '}',
      '#storyViewer .story-viewer-progress .seg{',
      '  flex:1;background:rgba(255,255,255,.35);border-radius:2px;overflow:hidden;height:2.5px;',
      '}',
      '#storyViewer .story-viewer-progress .seg i{display:block;height:100%;width:0;background:#fff;}',
      '#storyViewer .story-viewer-top{',
      '  position:absolute;left:0;right:0;top:calc(18px + env(safe-area-inset-top));',
      '  z-index:20;padding:8px 12px 8px 14px!important;margin:0;',
      '  background:linear-gradient(180deg,rgba(0,0,0,.45) 0%,rgba(0,0,0,0) 100%);',
      '  padding-bottom:28px!important;',
      '}',
      '#storyViewer .story-viewer-top .avatar{',
      '  width:32px!important;height:32px!important;font-size:11px!important;',
      '  border:1.5px solid #fff!important;',
      '}',
      '#storyViewer .story-viewer-top b{',
      '  font-size:13px!important;font-weight:700!important;letter-spacing:.01em;',
      '  text-shadow:0 1px 3px rgba(0,0,0,.45);',
      '}',
      '#storyViewer .story-viewer-close,#storyViewer .story-viewer-more{',
      '  color:#fff!important;text-shadow:0 1px 3px rgba(0,0,0,.4);',
      '}',
      /* Media full screen */
      '#storyViewer .story-viewer-body{',
      '  position:absolute!important;inset:0!important;padding:0!important;',
      '  margin:0!important;width:100%!important;height:100%!important;',
      '  display:flex!important;align-items:center;justify-content:center;',
      '  overflow:hidden!important;z-index:1;',
      '}',
      '#storyViewer .story-viewer-body.has-media .story-media,',
      '#storyViewer .story-viewer-body .story-media{',
      '  position:absolute!important;inset:0!important;',
      '  width:100%!important;height:100%!important;',
      '  max-width:none!important;max-height:none!important;',
      '  object-fit:cover!important;border-radius:0!important;',
      '  background:#000!important;display:block!important;',
      '}',
      '#storyViewer .story-viewer-body .big:not(.story-text-extra){',
      '  position:relative;z-index:3;padding:24px;text-align:center;',
      '  text-shadow:0 2px 12px rgba(0,0,0,.35);',
      '}',
      '#storyViewer .story-text-extra{',
      '  position:absolute!important;left:16px;right:16px;',
      '  bottom:calc(88px + env(safe-area-inset-bottom))!important;',
      '  z-index:8;margin:0!important;padding:0!important;',
      '  background:none!important;font-size:15px!important;font-weight:600!important;',
      '  line-height:1.35;color:#fff!important;',
      '  text-shadow:0 1px 8px rgba(0,0,0,.55);',
      '}',
      /* Music chip — thin, top */
      '#storyMusicChip{',
      '  display:none;align-items:center;gap:6px;',
      '  position:absolute;left:14px;right:14px;',
      '  top:calc(58px + env(safe-area-inset-top));',
      '  z-index:21;pointer-events:none;',
      '  max-width:72%;',
      '}',
      '#storyMusicChip.on{display:flex;}',
      '#storyMusicChip .smc-ico{',
      '  flex-shrink:0;opacity:.95;filter:drop-shadow(0 1px 2px rgba(0,0,0,.4));',
      '}',
      '#storyMusicChip .smc-txt{',
      '  font-size:11.5px;font-weight:500;letter-spacing:.02em;',
      '  color:rgba(255,255,255,.92);',
      '  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;',
      '  text-shadow:0 1px 4px rgba(0,0,0,.5);',
      '  line-height:1.2;',
      '}',
      /* Bottom reply bar */
      '#storyReplyBar{',
      '  position:absolute;left:0;right:0;bottom:0;z-index:25;',
      '  display:flex;align-items:center;gap:10px;',
      '  padding:10px 12px calc(12px + env(safe-area-inset-bottom));',
      '  background:linear-gradient(0deg,rgba(0,0,0,.55) 0%,rgba(0,0,0,.2) 70%,rgba(0,0,0,0) 100%);',
      '}',
      '#storyReplyBar input{',
      '  flex:1;min-width:0;height:42px;border-radius:22px;',
      '  border:1.5px solid rgba(255,255,255,.55);',
      '  background:rgba(255,255,255,.12);',
      '  color:#fff;padding:0 16px;',
      '  font:500 14px Inter,system-ui,sans-serif;',
      '  outline:none;backdrop-filter:blur(8px);',
      '  -webkit-backdrop-filter:blur(8px);',
      '}',
      '#storyReplyBar input::placeholder{color:rgba(255,255,255,.65);font-weight:500;}',
      '#storyReplyBar input:focus{border-color:rgba(255,255,255,.85);background:rgba(255,255,255,.16);}',
      '#storyReplySend{',
      '  display:none;align-items:center;justify-content:center;',
      '  height:42px;padding:0 14px;border-radius:22px;',
      '  border:0;background:#fff;color:#0B0B0C;',
      '  font:700 13px Inter,system-ui,sans-serif;cursor:pointer;flex-shrink:0;',
      '}',
      '#storyReplySend.on{display:flex;}',
      '#storyLikeBtn.story-viewer-like{',
      '  position:static!important;right:auto!important;bottom:auto!important;',
      '  width:42px!important;height:42px!important;',
      '  border:1.5px solid rgba(255,255,255,.55)!important;',
      '  border-radius:50%!important;',
      '  background:rgba(255,255,255,.1)!important;',
      '  color:#fff!important;flex-shrink:0;',
      '  backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);',
      '  box-shadow:none!important;',
      '}',
      '#storyLikeBtn.story-viewer-like svg{width:22px!important;height:22px!important;}',
      '#storyLikeBtn.story-viewer-like.liked{',
      '  background:rgba(255,59,92,.18)!important;',
      '  border-color:rgba(255,59,92,.85)!important;',
      '  color:#FF3B5C!important;',
      '}',
      '#storyLikeBtn.story-viewer-like.liked svg{fill:#FF3B5C!important;stroke:#FF3B5C!important;}',
      /* Hit zones above chrome */
      '#storyViewer .story-hit-left,#storyViewer .story-hit-right{z-index:4;}'
    ].join('');
    document.head.appendChild(st);
  }

  function ensureChrome() {
    var viewer = document.getElementById('storyViewer');
    if (!viewer) return;

    if (!document.getElementById('storyMusicChip')) {
      var chip = document.createElement('div');
      chip.id = 'storyMusicChip';
      chip.innerHTML =
        '<svg class="smc-ico" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>' +
        '<span class="smc-txt" id="storyMusicChipTxt"></span>';
      viewer.appendChild(chip);
    }

    if (!document.getElementById('storyReplyBar')) {
      var bar = document.createElement('div');
      bar.id = 'storyReplyBar';
      bar.innerHTML =
        '<input type="text" id="storyReplyInput" placeholder="Enviar mensagem…" maxlength="500" autocomplete="off" />' +
        '<button type="button" id="storyReplySend" aria-label="Enviar">Enviar</button>';
      viewer.appendChild(bar);

      // Move like button into bar (professional placement)
      var like = document.getElementById('storyLikeBtn');
      if (like && like.parentNode !== bar) {
        bar.appendChild(like);
      }

      var input = document.getElementById('storyReplyInput');
      var send = document.getElementById('storyReplySend');
      function syncSend() {
        var on = !!(input && input.value && input.value.trim());
        if (send) send.classList.toggle('on', on);
      }
      if (input) {
        input.addEventListener('input', syncSend);
        input.addEventListener('focus', function () {
          try {
            if (typeof storyPaused !== 'undefined') window.storyPaused = true;
            clearTimeout(window.storyTimer);
          } catch (e) {}
        });
        input.addEventListener('keydown', function (e) {
          if (e.key === 'Enter') {
            e.preventDefault();
            sendStoryReply();
          }
        });
      }
      if (send) send.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        sendStoryReply();
      };
    } else {
      var like2 = document.getElementById('storyLikeBtn');
      var bar2 = document.getElementById('storyReplyBar');
      if (like2 && bar2 && like2.parentNode !== bar2) bar2.appendChild(like2);
    }

    paintHeart();
  }

  function paintHeart() {
    var btn = document.getElementById('storyLikeBtn');
    if (!btn) return;
    var on = btn.classList.contains('liked');
    btn.innerHTML = on ? HEART_ON : HEART_OUT;
  }

  function getMusicFromStory(s) {
    if (!s) return null;
    var m = s.musicMeta || s.music || null;
    if (!m) return null;
    if (typeof m === 'string') {
      var t = m.replace(/^♪\s*/, '').trim();
      var parts = t.split(' · ');
      return { title: parts[0] || t, artist: parts[1] || '' };
    }
    return {
      title: m.title || 'Música',
      artist: m.artist || ''
    };
  }

  function updateMusicChip(s) {
    var chip = document.getElementById('storyMusicChip');
    var txt = document.getElementById('storyMusicChipTxt');
    if (!chip || !txt) return;
    var m = getMusicFromStory(s);
    if (!m || !m.title) {
      chip.classList.remove('on');
      txt.textContent = '';
      return;
    }
    // Short & thin: title only, or title · artist if short
    var line = m.title;
    if (m.artist && (m.title + m.artist).length < 36) {
      line = m.title + ' · ' + m.artist;
    }
    txt.textContent = line;
    chip.classList.add('on');
  }

  function sendStoryReply() {
    var input = document.getElementById('storyReplyInput');
    var text = input && input.value ? input.value.trim() : '';
    if (!text) return;
    var s =
      window.activeStoryItems &&
      window.activeStoryItems[window.activeStoryIndex];
    if (!s || !s.name) {
      if (typeof showToast === 'function') showToast('Não foi possível enviar');
      return;
    }
    var me = null;
    try {
      if (typeof getSession === 'function') me = getSession();
    } catch (e) {}
    if (me && me.username && String(me.username).toLowerCase() === String(s.name).toLowerCase()) {
      if (typeof showToast === 'function') showToast('É o teu story');
      input.value = '';
      document.getElementById('storyReplySend') &&
        document.getElementById('storyReplySend').classList.remove('on');
      return;
    }

    // Persist chat message (compatible with existing local + cloud patterns)
    try {
      var key = 'tchilo_chat_' + String(s.name).toLowerCase();
      var list = [];
      try {
        list = JSON.parse(localStorage.getItem(key) || '[]');
      } catch (e2) {
        list = [];
      }
      if (!Array.isArray(list)) list = [];
      list.push({
        id: 'sr_' + Date.now(),
        from: 'me',
        text: text,
        type: 'story_reply',
        storyUser: s.name,
        createdAt: Date.now()
      });
      localStorage.setItem(key, JSON.stringify(list));
    } catch (e3) {}

    if (input) input.value = '';
    var sendBtn = document.getElementById('storyReplySend');
    if (sendBtn) sendBtn.classList.remove('on');

    if (typeof showToast === 'function') showToast('Mensagem enviada');

    // Open chat with author (optional soft handoff)
    try {
      if (typeof closeStory === 'function') closeStory();
      setTimeout(function () {
        if (typeof startChatWith === 'function') startChatWith(s.name);
        else if (typeof openChat === 'function') openChat(s.name);
      }, 180);
    } catch (e4) {}
  }

  function patchToggleLike() {
    if (typeof window.toggleStoryLike !== 'function' || window.toggleStoryLike.__pro) return;
    var orig = window.toggleStoryLike;
    window.toggleStoryLike = function () {
      var r = orig.apply(this, arguments);
      // Force professional red (no random pastel)
      var btn = document.getElementById('storyLikeBtn');
      if (btn) {
        btn.style.removeProperty('--story-like-color');
        paintHeart();
      }
      return r;
    };
    window.toggleStoryLike.__pro = true;
  }

  function patchRenderActiveStory() {
    if (typeof window.renderActiveStory !== 'function' || window.renderActiveStory.__pro) return;
    var orig = window.renderActiveStory;
    window.renderActiveStory = function () {
      var r = orig.apply(this, arguments);
      ensureChrome();
      paintHeart();
      try {
        var s =
          window.activeStoryItems &&
          window.activeStoryItems[window.activeStoryIndex];
        updateMusicChip(s);
      } catch (e) {}
      // Ensure media full bleed after render inserts nodes
      try {
        var body = document.getElementById('storyViewerBody');
        if (body) {
          body.querySelectorAll('.story-media').forEach(function (el) {
            el.style.objectFit = 'cover';
            el.style.width = '100%';
            el.style.height = '100%';
            el.style.position = 'absolute';
            el.style.inset = '0';
          });
        }
      } catch (e2) {}
      return r;
    };
    window.renderActiveStory.__pro = true;
  }

  function boot() {
    injectCSS();
    ensureChrome();
    paintHeart();
    patchToggleLike();
    patchRenderActiveStory();
  }

  boot();
  [200, 800, 2000].forEach(function (ms) {
    setTimeout(boot, ms);
  });
})();

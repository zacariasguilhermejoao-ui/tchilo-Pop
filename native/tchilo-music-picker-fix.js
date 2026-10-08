/**
 * tchilo — corrige seletor de músicas (estilo, z-index, seleção, capas)
 * perf: setInterval 20s
 */
(function () {
  'use strict';
  if (window.__tchiloMusicPickerFixV1) return;
  window.__tchiloMusicPickerFixV1 = true;

  function injectCSS() {
    var id = 'tchiloMusicPickerFixCSS';
    var old = document.getElementById(id);
    if (old) old.remove();
    var st = document.createElement('style');
    st.id = id;
    st.textContent =
      '#tchiloPostMusicSheet{z-index:2147483000!important;background:rgba(11,11,12,.55)!important;}' +
      '#tchiloPostMusicSheet .panel{border:3px solid var(--ink,#0B0B0C)!important;background:var(--paper,#F3F1E9)!important;}' +
      '#tchiloPostMusicSheet .head b{font-family:Anton,Impact,sans-serif!important;font-size:22px!important;font-weight:400!important;}' +
      '#tchiloPostMusicSheet .track{border:2.5px solid var(--ink,#0B0B0C)!important;box-shadow:none!important;border-radius:14px!important;cursor:pointer!important;pointer-events:auto!important;}' +
      '#tchiloPostMusicSheet .track:active{opacity:.92;}' +
      '#tchiloPostMusicSheet .cover,#tchiloPostMusicSheet .track img{width:48px!important;height:48px!important;border-radius:10px!important;border:2px solid var(--ink,#0B0B0C)!important;object-fit:cover!important;}' +
      '#tchiloPostMusicSheet .playbtn{background:var(--yellow,#C8F560)!important;color:var(--ink,#0B0B0C)!important;pointer-events:auto!important;}' +
      '#tchiloPostMusicSheet .favbtn{pointer-events:auto!important;}' +
      '#tchiloPostMusicSheet .tab.on{background:var(--yellow,#C8F560)!important;}' +
      '#tchiloPostMusicSheet .list,#pmList{pointer-events:auto!important;}' +
      '#postMusicBtn,.tchilo-music-btn{display:flex!important;visibility:visible!important;opacity:1!important;}';
    document.head.appendChild(st);
  }

  function patchOpen() {
    if (typeof window.tchiloOpenPostMusic !== 'function') return false;
    if (window.tchiloOpenPostMusic.__pickerFix) return true;
    var orig = window.tchiloOpenPostMusic;
    window.tchiloOpenPostMusic = function () {
      injectCSS();
      try {
        orig.apply(this, arguments);
      } catch (e) {}
      setTimeout(function () {
        var el = document.getElementById('tchiloPostMusicSheet');
        if (!el) return;
        if (!el.classList.contains('open')) {
          el.classList.add('open');
          try {
            var tab = document.getElementById('pmTabDestaque');
            if (tab) tab.click();
            else {
              var search = document.getElementById('pmSearch');
              if (search) {
                search.value = '';
                search.dispatchEvent(new Event('input', { bubbles: true }));
              }
            }
          } catch (e2) {}
        }
      }, 30);
    };
    window.tchiloOpenPostMusic.__pickerFix = true;
    return true;
  }

  function bindSelect() {
    if (window.__tchiloMusicSelectBound) return;
    window.__tchiloMusicSelectBound = true;
    document.addEventListener(
      'click',
      function (e) {
        var row = e.target && e.target.closest && e.target.closest('#pmList .track, #tchiloMusicListRich .track');
        if (!row) return;
        if (e.target.closest('.playbtn, .favbtn, .me-play')) return;
        setTimeout(function () {
          if (window._pendingMusic || window._pendingMusicMeta) return;
          var titleEl = row.querySelector('.t, .title, b');
          var artistEl = row.querySelector('.a, .artist, span');
          var img = row.querySelector('img');
          if (!titleEl) return;
          var title = (titleEl.textContent || '').trim();
          var artist = artistEl ? (artistEl.textContent || '').trim() : '';
          if (!title) return;
          window._pendingMusicMeta = {
            title: title,
            artist: artist,
            preview: '',
            cover: img ? img.src : '',
            id: row.getAttribute('data-id') || null
          };
          window._pendingMusic = title + (artist ? ' · ' + artist : '');
          try {
            if (typeof window.updateMusicBtn === 'function') window.updateMusicBtn();
          } catch (err) {}
          try {
            if (typeof window.tchiloUpdatePostMusicBtn === 'function') window.tchiloUpdatePostMusicBtn();
          } catch (err2) {}
          var sheet = document.getElementById('tchiloPostMusicSheet');
          if (sheet) sheet.classList.remove('open');
          var fb = document.getElementById('tchiloMusicFallback');
          if (fb) fb.remove();
          try {
            if (typeof showToast === 'function') showToast('Música selecionada');
          } catch (err3) {}
        }, 120);
      },
      true
    );
  }

  function boot() {
    injectCSS();
    patchOpen();
    bindSelect();
  }
  boot();
  setTimeout(boot, 400);
  setTimeout(boot, 1200);
  setInterval(function () {
    injectCSS();
    patchOpen();
  }, 20000); /* perf: era 3s */
})();

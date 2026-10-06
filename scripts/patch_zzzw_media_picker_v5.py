#!/usr/bin/env python3
from pathlib import Path
import re
p = Path("native/tchilo-media-picker.js")
t = p.read_text(encoding="utf-8", errors="replace")
o = t
t = t.replace("Tchilo Create Flow v4 - POST/STORY/TEMA large tabs + flat icons", "Tchilo Create Flow v5 — pro icons, hide tabs, music chip")
if "__TCHILO_MEDIA_PICKER_V5" not in t:
    t = t.replace(
        "if (window.__TCHILO_MEDIA_PICKER_V4) return;\n  window.__TCHILO_MEDIA_PICKER_V4 = true;",
        "if (window.__TCHILO_MEDIA_PICKER_V5) return;\n  window.__TCHILO_MEDIA_PICKER_V5 = true;\n  window.__TCHILO_MEDIA_PICKER_V4 = true;",
    )
t = t.replace(
    "svg('<path d=\"M4 8h3l2-2h6l2 2h3v11H4z\"/><circle cx=\"12\" cy=\"13\" r=\"3.5\"/>')",
    "svg('<path d=\"M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z\"/><circle cx=\"12\" cy=\"13\" r=\"4\"/>')",
)
t = t.replace(
    "svg('<rect x=\"3\" y=\"3\" width=\"7\" height=\"7\" rx=\"1\"/><rect x=\"14\" y=\"3\" width=\"7\" height=\"7\" rx=\"1\"/><rect x=\"3\" y=\"14\" width=\"7\" height=\"7\" rx=\"1\"/><rect x=\"14\" y=\"14\" width=\"7\" height=\"7\" rx=\"1\"/>')",
    "svg('<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\" ry=\"2\"/><circle cx=\"8.5\" cy=\"8.5\" r=\"1.5\"/><polyline points=\"21 15 16 10 5 21\"/>')",
)
old = "'<div id=\"mpMusicChip\" style=\"display:none;margin-bottom:8px;padding:8px 12px;border-radius:999px;background:rgba(11,11,12,.06);font:600 13px system-ui,sans-serif\"></div><textarea class=\"mp-caption\" id=\"mpCaption\""
new = "'<div class=\"mp-music-chip\" id=\"mpMusicChip\" style=\"display:none\">'+'<img class=\"mp-music-cover\" id=\"mpMusicCover\" alt=\"\"/>'+'<div class=\"mp-music-meta\"><b id=\"mpMusicTitle\">Música</b><span id=\"mpMusicArtist\"></span></div>'+'<button type=\"button\" class=\"mp-music-x\" id=\"mpMusicClear\" data-a=\"music-clear\">×</button>'+'</div>'+'<textarea class=\"mp-caption\" id=\"mpCaption\""
if old in t:
    t = t.replace(old, new, 1)
    print("chip")
if "mp-modes-hidden" not in t:
    t = t.replace(
        "'#tchiloMediaPicker .mp-hidden{position:fixed;left:-9999px;width:1px;height:1px;opacity:0;}'",
        "'#tchiloMediaPicker .mp-hidden{position:fixed;left:-9999px;width:1px;height:1px;opacity:0;}','#tchiloMediaPicker .mp-modes.mp-modes-hidden{display:none!important;}','#tchiloMediaPicker .mp-music-chip{display:flex;align-items:center;gap:10px;margin-bottom:8px;padding:8px 10px;border-radius:12px;background:rgba(11,11,12,.06);cursor:pointer;}','#tchiloMediaPicker .mp-music-cover{width:36px;height:36px;border-radius:8px;object-fit:cover;background:#ddd;}','#tchiloMediaPicker .mp-music-meta{flex:1;min-width:0;display:flex;flex-direction:column;}','#tchiloMediaPicker .mp-music-meta b{font:700 13px system-ui,sans-serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}','#tchiloMediaPicker .mp-music-meta span{font:500 11px system-ui,sans-serif;opacity:.55;}','#tchiloMediaPicker .mp-music-x{width:28px;height:28px;border:0;border-radius:50%;background:rgba(11,11,12,.08);font:700 16px/1 system-ui,sans-serif;cursor:pointer;}'",
    )
H = (
"  var selectedMusic=null,composeAudio=null;\n"
"  function stopComposeAudio(){if(composeAudio){try{composeAudio.pause()}catch(e){}composeAudio=null}}\n"
"  function playComposeMusic(meta){stopComposeAudio();if(!meta||!meta.preview)return;try{composeAudio=new Audio(meta.preview);composeAudio.loop=true;composeAudio.volume=.85;composeAudio.play().catch(function(){})}catch(e){}}\n"
"  function paintMusicChip(meta){selectedMusic=meta||null;if(meta){window._pendingMusic=(meta.title||'')+(meta.artist?' · '+meta.artist:'');window._pendingMusicMeta=meta}else{window._pendingMusic=null;window._pendingMusicMeta=null}var el=document.getElementById('mpMusicChip');if(!el)return;if(!meta){el.style.display='none';return}el.style.display='flex';var cov=document.getElementById('mpMusicCover');if(cov){if(meta.cover){cov.src=meta.cover;cov.style.display=''}else{cov.removeAttribute('src');cov.style.display='none'}}var ti=document.getElementById('mpMusicTitle');if(ti)ti.textContent=meta.title||'Música';var ar=document.getElementById('mpMusicArtist');if(ar)ar.textContent=meta.artist||''}\n"
"  function clearMusic(){stopComposeAudio();paintMusicChip(null)}\n"
"  function applyMusic(meta,play){if(!meta)return;paintMusicChip(meta);if(play!==false)playComposeMusic(meta)}\n"
"  function openMusicSheet(){try{if(selected[0]&&typeof window.tchiloSyncCreateMediaForMusic==='function')window.tchiloSyncCreateMediaForMusic(selected[0])}catch(e){}if(typeof window.tchiloOpenCreateMusic==='function')window.tchiloOpenCreateMusic(selected[0]);else if(typeof window.tchiloOpenPostMusic==='function')window.tchiloOpenPostMusic()}\n"
"  function autoAttachMusic(){if(selectedMusic&&selectedMusic.preview){playComposeMusic(selectedMusic);paintMusicChip(selectedMusic);return}var meta=window._pendingMusicMeta;if(meta&&meta.preview){applyMusic(meta,true);return}var tracks=window.__lastPmTracks||[];if(tracks.length&&tracks[0]&&tracks[0].preview){var t0=tracks[0];applyMusic({id:t0.id,title:t0.title,artist:t0.artist||'',preview:t0.preview||'',cover:t0.cover||''},true);return}try{var cb='tchiloMP_'+Date.now();window[cb]=function(data){try{delete window[cb]}catch(e2){}var list=(data&&data.data)||[];if(!list.length||selectedMusic)return;if(STEP!=='compose'&&STEP!=='story')return;var x=list[0];applyMusic({id:x.id||'',title:x.title||'Música',artist:(x.artist&&x.artist.name)||'',preview:x.preview||'',cover:(x.album&&(x.album.cover_medium||x.album.cover))||''},true)};var s=document.createElement('script');s.src='https://api.deezer.com/chart/0/tracks?limit=10&output=jsonp&callback='+cb;document.head.appendChild(s)}catch(e4){}}\n"
"  function onMusicSelectedEvent(ev){var d=(ev&&ev.detail)||{};var meta=d.meta||window._pendingMusicMeta;if(!meta)return;applyMusic(meta,true)}\n"
)
if "var selectedMusic=null" not in t and "var selectedMusic = null" not in t:
    t = t.replace("  var MODE_ORDER = ['post', 'story', 'theme'];\n", "  var MODE_ORDER = ['post', 'story', 'theme'];\n" + H, 1)
    print("helpers")
NEW_SS = """  function setStep(step) {
    STEP = step;
    document.querySelectorAll('#tchiloMediaPicker .mp-step').forEach(function (el) {
      el.classList.toggle('on', el.getAttribute('data-step') === step);
    });
    var pubBtn = $('mpPublishBtn');
    if (pubBtn) {
      pubBtn.style.display = (step === 'compose' || step === 'story' || step === 'theme') ? '' : 'none';
    }
    var modes = $('mpModes');
    if (modes) {
      if (step === 'hub') modes.classList.remove('mp-modes-hidden');
      else modes.classList.add('mp-modes-hidden');
    }
    if (step === 'publishing' || step === 'hub') {
      try { stopComposeAudio(); } catch (e0) {}
    }
    try { syncModeTabs(); } catch (e) {}
  }"""
for OLD in [
"""  function setStep(step) {
    try { syncModeTabs(); } catch (e) {}
    STEP = step;
    document.querySelectorAll('#tchiloMediaPicker .mp-step').forEach(function (el) {
      el.classList.toggle('on', el.getAttribute('data-step') === step);
    });
    var pubBtn = $('mpPublishBtn');
    if (pubBtn) {
      pubBtn.style.display = (step === 'compose' || step === 'story' || step === 'theme') ? '' : 'none';
    }
    try { syncModeTabs(); } catch (e) {}
  }""",
"""  function setStep(step) {
    STEP = step;
    document.querySelectorAll('#tchiloMediaPicker .mp-step').forEach(function (el) {
      el.classList.toggle('on', el.getAttribute('data-step') === step);
    });
    var pubBtn = $('mpPublishBtn');
    if (pubBtn) {
      pubBtn.style.display = (step === 'compose' || step === 'story' || step === 'theme') ? '' : 'none';
    }
    try { syncModeTabs(); } catch (e) {}
  }""",
]:
    if OLD in t:
        t = t.replace(OLD, NEW_SS, 1)
        print("setStep")
        break
t = t.replace(
"""  function goAfterPick() {
    if (!selected.length) return;
    if (MODE === 'story') {
      paintStory();
      setStep('story');
    } else {
      paintCompose();
      setStep('compose');
    }
  }""",
"""  function goAfterPick() {
    if (!selected.length) return;
    if (MODE === 'story') {
      paintStory();
      setStep('story');
    } else {
      paintCompose();
      setStep('compose');
    }
    try { autoAttachMusic(); } catch (e) {}
  }""")
m = re.search(r"    if \(a === 'music'\) \{[\s\S]*?return;\n    \}", t)
if m and "music-clear" not in m.group(0):
    t = t[:m.start()] + "    if (a === 'music-clear') { clearMusic(); return; }\n    if (a === 'music') { openMusicSheet(); return; }" + t[m.end():]
    print("music")
t = t.replace(
"""  function boot() {
    ensureDOM();
    wirePlus();
  }""",
"""  function boot() {
    ensureDOM();
    wirePlus();
    if (!window.__mpMusicEvt) {
      window.__mpMusicEvt = true;
      window.addEventListener('tchilo-music-selected', onMusicSelectedEvent);
      document.addEventListener('click', function (e) {
        var chip = e.target && e.target.closest && e.target.closest('.mp-music-chip');
        if (!chip || !chip.closest('#tchiloMediaPicker')) return;
        if (e.target.closest('.mp-music-x') || e.target.closest('[data-a=\"music-clear\"]')) return;
        e.preventDefault(); e.stopPropagation(); openMusicSheet();
      }, true);
    }
  }""")
t = t.replace(
"""  function closePicker(restoreScroll) {
    var el = $('tchiloMediaPicker');
    if (el) el.classList.remove('open');
    if (restoreScroll !== false) {
      try { document.body.style.overflow = ''; } catch (e) {}
    }
  }""",
"""  function closePicker(restoreScroll) {
    var el = $('tchiloMediaPicker');
    if (el) el.classList.remove('open');
    try { stopComposeAudio(); } catch (e) {}
    if (restoreScroll !== false) {
      try { document.body.style.overflow = ''; } catch (e) {}
    }
  }""")
t = t.replace("if (!existing.querySelector('#mpModes')) {", "if (!existing.querySelector('#mpModes') || !existing.querySelector('#mpMusicClear')) {")
t = t.replace("if ($('tchilo-mp-css')) return;", "var _ocs=$('tchilo-mp-css'); if(_ocs) try{_ocs.remove();}catch(_e){}")
if t != o:
    p.write_text(t, encoding="utf-8")
    print("WRITTEN", len(t))
else:
    print("NO CHANGE")

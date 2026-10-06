#!/usr/bin/env python3
"""Restore tchilo-media-picker.js if PLACEHOLDER, then apply compose v6 surgical fixes."""
from pathlib import Path
import urllib.request, re

mp = Path("native/tchilo-media-picker.js")
need = (not mp.exists()) or mp.read_text(encoding="utf-8", errors="replace").strip() in ("PLACEHOLDER", "")
if need:
    urls = [
        "https://raw.githubusercontent.com/zacariasguilhermejoao-ui/tchilo-Pop/d9eef54094bb2fc06cfb6fd009f39f156e873e56/native/tchilo-media-picker.js",
        "https://cdn.jsdelivr.net/gh/zacariasguilhermejoao-ui/tchilo-Pop@d9eef54094bb2fc06cfb6fd009f39f156e873e56/native/tchilo-media-picker.js",
    ]
    ok = False
    for u in urls:
        try:
            print("fetch", u)
            data = urllib.request.urlopen(u, timeout=30).read()
            if len(data) > 10000 and b"PLACEHOLDER" not in data[:20]:
                mp.write_bytes(data)
                print("restored", len(data))
                ok = True
                break
        except Exception as e:
            print("fail", u, e)
    if not ok:
        print("RESTORE FAILED")
        raise SystemExit(1)

t = mp.read_text(encoding="utf-8", errors="replace")
o = t

t = t.replace(
    "if (window.__TCHILO_MEDIA_PICKER_V3) return;\n  window.__TCHILO_MEDIA_PICKER_V3 = true;\n  window.__TCHILO_MEDIA_PICKER_V2 = true;",
    "if (window.__TCHILO_MEDIA_PICKER_V6) return;\n  window.__TCHILO_MEDIA_PICKER_V6 = true;\n  window.__TCHILO_MEDIA_PICKER_V3 = true;\n  window.__TCHILO_MEDIA_PICKER_V2 = true;",
)

old_play = "function playComposeMusic(meta){stopComposeAudio();if(!meta||!meta.preview)return;try{composeAudio=new Audio(meta.preview);composeAudio.loop=true;composeAudio.volume=.85;composeAudio.play().catch(function(){})}catch(e){}}"
new_play = "function playComposeMusic(meta){stopComposeAudio();if(!meta||!meta.preview)return;try{composeAudio=new Audio(meta.preview);composeAudio.loop=true;composeAudio.volume=.9;composeAudio.preload='auto';var chip=document.getElementById('mpMusicChip');function mark(ok){if(!chip)return;if(ok)chip.classList.remove('paused');else chip.classList.add('paused')}composeAudio.onplaying=function(){mark(true)};composeAudio.onpause=function(){mark(false)};function tryPlay(){if(!composeAudio)return;var pr=composeAudio.play();if(pr&&pr.then)pr.then(function(){mark(true)}).catch(function(){mark(false)})}tryPlay();setTimeout(tryPlay,120);setTimeout(tryPlay,400);setTimeout(tryPlay,900)}catch(e){}}"
if old_play in t:
    t = t.replace(old_play, new_play)
    print("play")

t = t.replace("background:rgba(0,0,0,.45)", "background:#fff")
t = t.replace("backdrop-filter:blur(8px);}", "box-shadow:0 2px 10px rgba(0,0,0,.18);}")
t = t.replace("stroke:currentColor;fill:none;}", "stroke:#0B0B0C;fill:none;}")

if "mp-music-float{position" not in t:
    css = (
        "'#tchiloMediaPicker .mp-music-float{position:absolute;top:12px;left:50%;transform:translateX(-50%);z-index:6;"
        "display:flex;align-items:center;gap:8px;max-width:min(86%,320px);padding:8px 12px;border-radius:999px;"
        "background:rgba(0,0,0,.55);backdrop-filter:blur(12px);color:#fff;cursor:pointer;}',"
        "'#tchiloMediaPicker .mp-music-float-title{font:600 13px system-ui,sans-serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:180px;}',"
        "'#tchiloMediaPicker .mp-eq{display:flex;align-items:flex-end;gap:2px;height:14px;}',"
        "'#tchiloMediaPicker .mp-eq i{width:3px;background:#fff;border-radius:1px;animation:mpEq .9s ease-in-out infinite;transform-origin:bottom;}',"
        "'#tchiloMediaPicker .mp-eq i:nth-child(1){height:6px;}','#tchiloMediaPicker .mp-eq i:nth-child(2){height:12px;animation-delay:.15s;}',"
        "'#tchiloMediaPicker .mp-eq i:nth-child(3){height:8px;animation-delay:.3s;}','#tchiloMediaPicker .mp-eq i:nth-child(4){height:14px;animation-delay:.45s;}',"
        "'@keyframes mpEq{0%,100%{transform:scaleY(.4)}50%{transform:scaleY(1)}}',"
        "'#tchiloMediaPicker .mp-music-float.paused .mp-eq i{animation:none;opacity:.45;}',"
        "'#tchiloMediaPicker .mp-music-float .mp-music-x{border:0!important;background:transparent!important;color:#fff!important;padding:0!important;width:22px!important;height:22px!important;border-radius:0!important;display:flex;align-items:center;justify-content:center;cursor:pointer;}',"
        "'#tchiloMediaPicker .mp-caption-bar.open{display:block!important;}',"
    )
    t = t.replace(
        "'#tchiloMediaPicker .mp-modes.mp-modes-hidden{display:none!important;}'",
        css + "'#tchiloMediaPicker .mp-modes.mp-modes-hidden{display:none!important;}'",
    )
    print("css")

old_html = (
    "'<div class=\"mp-side\">' +\n"
    "      '<button type=\"button\" data-a=\"music\" title=\"Música\">' + svg('<path d=\"M9 18V5l12-2v13\"/><circle cx=\"6\" cy=\"18\" r=\"3\"/><circle cx=\"18\" cy=\"16\" r=\"3\"/>') + '</button>' +\n"
    "      '<button type=\"button\" data-a=\"crop\" title=\"Cortar\">' + svg('<path d=\"M6 3v15h15\"/><path d=\"M3 6h15v15\"/>') + '</button>' +\n"
    "      '</div>' +\n"
    "      '<div class=\"mp-caption-bar\">' +\n"
    "      '<div class=\"mp-music-chip\" id=\"mpMusicChip\" style=\"display:none\">'+'<img class=\"mp-music-cover\" id=\"mpMusicCover\" alt=\"\"/>'+'<div class=\"mp-music-meta\"><b id=\"mpMusicTitle\">Música</b><span id=\"mpMusicArtist\"></span></div>'+'<button type=\"button\" class=\"mp-music-x\" id=\"mpMusicClear\" data-a=\"music-clear\">×</button>'+'</div>'+'<textarea class=\"mp-caption\" id=\"mpCaption\" rows=\"2\" placeholder=\"Escreve uma descrição…\"></textarea>' +\n"
    "      '</div></div></div>'"
)
new_html = (
    "'<div class=\"mp-music-float\" id=\"mpMusicChip\" style=\"display:none\">' +\n"
    "      '<span class=\"mp-eq\"><i></i><i></i><i></i><i></i></span>' +\n"
    "      '<span class=\"mp-music-float-title\" id=\"mpMusicTitle\">Música</span>' +\n"
    "      '<button type=\"button\" class=\"mp-music-x\" data-a=\"music-clear\" id=\"mpMusicClear\">' +\n"
    "      '<svg viewBox=\"0 0 24 24\" width=\"14\" height=\"14\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.5\" stroke-linecap=\"round\"><path d=\"M18 6L6 18M6 6l12 12\"/></svg></button></div>' +\n"
    "      '<div class=\"mp-side\">' +\n"
    "      '<button type=\"button\" data-a=\"music\" title=\"Música\">' + svg('<path d=\"M9 18V5l12-2v13\"/><circle cx=\"6\" cy=\"18\" r=\"3\"/><circle cx=\"18\" cy=\"16\" r=\"3\"/>') + '</button>' +\n"
    "      '<button type=\"button\" data-a=\"crop\" title=\"Cortar\">' + svg('<path d=\"M6 3v15h15\"/><path d=\"M3 6h15v15\"/>') + '</button>' +\n"
    "      '<button type=\"button\" data-a=\"caption\" title=\"Texto\"><span class=\"mp-aa\">Aa</span></button>' +\n"
    "      '</div>' +\n"
    "      '<div class=\"mp-caption-bar\" id=\"mpCaptionBar\" style=\"display:none\">' +\n"
    "      '<textarea class=\"mp-caption\" id=\"mpCaption\" rows=\"2\" placeholder=\"Escreve uma descrição…\"></textarea>' +\n"
    "      '</div></div></div>'"
)
if old_html in t:
    t = t.replace(old_html, new_html)
    print("html")
else:
    print("html pattern miss")

old_paint = "function paintMusicChip(meta){selectedMusic=meta||null;if(meta){window._pendingMusic=(meta.title||'')+(meta.artist?' · '+meta.artist:'');window._pendingMusicMeta=meta}else{window._pendingMusic=null;window._pendingMusicMeta=null}var el=document.getElementById('mpMusicChip');if(!el)return;if(!meta){el.style.display='none';return}el.style.display='flex';var cov=document.getElementById('mpMusicCover');if(cov){if(meta.cover){cov.src=meta.cover;cov.style.display=''}else{cov.removeAttribute('src');cov.style.display='none'}}var ti=document.getElementById('mpMusicTitle');if(ti)ti.textContent=meta.title||'Música';var ar=document.getElementById('mpMusicArtist');if(ar)ar.textContent=meta.artist||''}"
new_paint = "function paintMusicChip(meta){selectedMusic=meta||null;if(meta){window._pendingMusic=(meta.title||'')+(meta.artist?' · '+meta.artist:'');window._pendingMusicMeta=meta}else{window._pendingMusic=null;window._pendingMusicMeta=null}var el=document.getElementById('mpMusicChip');if(!el)return;if(!meta){el.style.display='none';el.classList.add('paused');return}el.style.display='flex';el.classList.remove('paused');var ti=document.getElementById('mpMusicTitle');if(ti)ti.textContent=meta.title||'Música'}"
if old_paint in t:
    t = t.replace(old_paint, new_paint)
    print("paint")

if "a === 'caption'" not in t:
    t = t.replace(
        "if (a === 'music-clear') { clearMusic(); return; }",
        "if (a === 'music-clear') { clearMusic(); return; }\n"
        "    if (a === 'caption') { var bar=$('mpCaptionBar'); if(bar){ var open=bar.classList.toggle('open'); bar.style.display=open?'block':'none'; if(open){ var c=$('mpCaption'); if(c) setTimeout(function(){try{c.focus()}catch(e){}},40);} } return; }",
    )
    print("caption")

if "setTimeout(function(){ try{ if(selectedMusic) playComposeMusic" not in t:
    t = t.replace(
        "try { autoAttachMusic(); } catch (e) {}\n  }",
        "try { autoAttachMusic(); } catch (e) {}\n"
        "    setTimeout(function(){ try{ if(selectedMusic) playComposeMusic(selectedMusic); else autoAttachMusic(); }catch(e2){} }, 180);\n"
        "    setTimeout(function(){ try{ if(selectedMusic) playComposeMusic(selectedMusic); }catch(e3){} }, 500);\n"
        "    setTimeout(function(){ try{ if(selectedMusic) playComposeMusic(selectedMusic); }catch(e4){} }, 1100);\n  }",
    )
    print("retry")

t = t.replace("v.muted = false;", "v.muted = true;")

if "existing.querySelector('.mp-music-float')" not in t:
    t = t.replace(
        "function ensureDOM() {\n    injectCSS();\n    if ($('tchiloMediaPicker')) return;",
        "function ensureDOM() {\n    injectCSS();\n    var existing = $('tchiloMediaPicker');\n"
        "    if (existing) {\n"
        "      if (!existing.querySelector('.mp-music-float') || !existing.querySelector('#mpCaptionBar')) {\n"
        "        try { existing.remove(); } catch (eR) {}\n"
        "      } else { return; }\n"
        "    }",
    )
    print("ensure")

t = t.replace("st.id = 'tchilo-mp-css';", "st.id = 'tchilo-mp-css-v6';")
t = t.replace("closest('.mp-music-chip')", "closest('.mp-music-float,.mp-music-chip')")

if t != o:
    mp.write_text(t, encoding="utf-8")
    print("WRITTEN", len(t))
else:
    print("no changes")

idx = Path("index.html")
it = idx.read_text(encoding="utf-8", errors="replace")
nt = re.sub(r"tchilo-media-picker\\.js\\?v=\\d+", "tchilo-media-picker.js?v=10", it)
if "tchilo-compose-music-v6.js" not in nt:
    nt = nt.replace(
        'native/tchilo-media-picker.js?v=10" defer></script>',
        'native/tchilo-media-picker.js?v=10" defer></script>\n<script src="native/tchilo-compose-music-v6.js?v=1" defer></script>',
    )
if nt != it:
    idx.write_text(nt, encoding="utf-8")
    print("index ok")

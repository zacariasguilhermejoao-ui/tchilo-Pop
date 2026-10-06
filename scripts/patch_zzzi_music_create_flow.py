#!/usr/bin/env python3
from pathlib import Path
import re

pm = Path('native/post-music-feed.js')
if pm.exists():
    t = pm.read_text(encoding='utf-8', errors='replace')
    orig = t
    old = (
        "function isPhotoOnlyCreate() {\n"
        "    var items = getCreateItems();\n"
        "    if (!items.length) return false;\n"
        "    var hasVideo = items.some(function (m) {\n"
        "      return m && m.type === 'video';\n"
        "    });\n"
        "    var hasImage = items.some(function (m) {\n"
        "      return m && m.type === 'image';\n"
        "    });\n"
        "    return hasImage && !hasVideo;\n"
        "  }"
    )
    new = (
        "function isPhotoOnlyCreate() {\n"
        "    var items = getCreateItems();\n"
        "    if (!items.length && window.__tchiloCreateFlowActive && window.createMediaData && window.createMediaData.items) {\n"
        "      items = window.createMediaData.items;\n"
        "    }\n"
        "    if (!items.length && window.__tchiloPendingMedia) {\n"
        "      items = [window.__tchiloPendingMedia];\n"
        "    }\n"
        "    if (!items.length) return false;\n"
        "    var hasVideo = items.some(function (m) {\n"
        "      return m && m.type === 'video';\n"
        "    });\n"
        "    var hasImage = items.some(function (m) {\n"
        "      return m && (m.type === 'image' || !m.type);\n"
        "    });\n"
        "    if (window.__tchiloCreateFlowActive && hasImage && !hasVideo) return true;\n"
        "    return hasImage && !hasVideo;\n"
        "  }"
    )
    if old in t:
        t = t.replace(old, new, 1)
        print('isPhotoOnlyCreate patched')
    elif '__tchiloCreateFlowActive' in t:
        print('isPhotoOnlyCreate already')
    else:
        print('isPhotoOnlyCreate miss')

    if 'tchilo-music-selected' not in t:
        t = t.replace(
            "if (typeof showToast === 'function') showToast('Música adicionada');",
            "if (typeof showToast === 'function') showToast('Música adicionada');\n"
            "    try { window.dispatchEvent(new CustomEvent('tchilo-music-selected', { detail: { label: window._pendingMusic, meta: window._pendingMusicMeta } })); } catch (e) {}",
            1,
        )
        print('selectTrack event')

    if t != orig:
        pm.write_text(t, encoding='utf-8')
        print('post-music written')

mp = Path('native/tchilo-media-picker.js')
if mp.exists():
    js = mp.read_text(encoding='utf-8', errors='replace')
    orig = js

    if 'tchiloSyncCreateMediaForMusic' not in js:
        needle = "function paintCompose() {\n    var box = $('mpComposePreview');\n    if (!box || !selected[0]) return;\n    box.innerHTML = '';"
        if needle in js:
            js = js.replace(
                needle,
                needle
                + "\n    try { if (typeof window.tchiloSyncCreateMediaForMusic === 'function') window.tchiloSyncCreateMediaForMusic(selected[0]); } catch (eSync) {}",
                1,
            )
            print('paintCompose sync')

    if 'tchiloOpenCreateMusic(selected[0])' not in js:
        js = re.sub(
            r"if \(a === 'music'\) \{[\s\S]*?return;\n    \}",
            "if (a === 'music') {\n"
            "      if (typeof window.tchiloOpenCreateMusic === 'function') window.tchiloOpenCreateMusic(selected[0]);\n"
            "      else if (typeof window.tchiloOpenPostMusic === 'function') {\n"
            "        try { if (typeof window.tchiloSyncCreateMediaForMusic === 'function') window.tchiloSyncCreateMediaForMusic(selected[0]); } catch (e) {}\n"
            "        window.tchiloOpenPostMusic();\n"
            "      }\n"
            "      return;\n    }",
            js,
            count=1,
        )
        print('music handler')

    if 'mpMusicChip' not in js:
        js = js.replace(
            '<textarea class="mp-caption" id="mpCaption"',
            '<div id="mpMusicChip" style="display:none;margin-bottom:8px;padding:8px 12px;border-radius:999px;background:rgba(255,255,255,.1);font:600 13px system-ui,sans-serif"></div>'
            '<textarea class="mp-caption" id="mpCaption"',
            1,
        )
        js = js.replace(
            'function boot() { ensureDOM(); wirePlus(); }',
            "function updateMusicChip() {\n"
            "    var chip = $('mpMusicChip');\n"
            "    if (!chip) return;\n"
            "    if (window._pendingMusic) { chip.style.display = 'block'; chip.textContent = '♪ ' + String(window._pendingMusic).slice(0, 48); }\n"
            "    else { chip.style.display = 'none'; chip.textContent = ''; }\n"
            "  }\n"
            "  window.addEventListener('tchilo-music-selected', updateMusicChip);\n"
            "  function boot() { ensureDOM(); wirePlus(); updateMusicChip(); }",
            1,
        )
        print('music chip')

    if js != orig:
        mp.write_text(js, encoding='utf-8')
        print('picker written')
    else:
        print('picker unchanged')

idx = Path('index.html')
if idx.exists():
    h = idx.read_text(encoding='utf-8', errors='replace')
    h2 = re.sub(r'tchilo-create-bridge\.js\?v=\d+', 'tchilo-create-bridge.js?v=2', h)
    h2 = re.sub(r'tchilo-media-picker\.js\?v=\d+', 'tchilo-media-picker.js?v=5', h2)
    if h2 != h:
        idx.write_text(h2, encoding='utf-8')
        print('index bumped')

#!/usr/bin/env python3
"""Relax photo-only music gate for create flow; wire picker music UI."""
from pathlib import Path
import re

# 1) post-music-feed: allow create flow
pm = Path('native/post-music-feed.js')
if pm.exists():
    t = pm.read_text(encoding='utf-8', errors='replace')
    orig = t
    old = '''function isPhotoOnlyCreate() {
    var items = getCreateItems();
    if (!items.length) return false;
    var hasVideo = items.some(function (m) {
      return m && m.type === 'video';
    });
    var hasImage = items.some(function (m) {
      return m && m.type === 'image';
    });
    return hasImage && !hasVideo;
  }'''
    new = '''function isPhotoOnlyCreate() {
    var items = getCreateItems();
    if (!items.length && window.__tchiloCreateFlowActive && window.createMediaData && window.createMediaData.items) {
      items = window.createMediaData.items;
    }
    if (!items.length && window.__tchiloPendingMedia) {
      items = [window.__tchiloPendingMedia];
    }
    if (!items.length) return false;
    var hasVideo = items.some(function (m) {
      return m && m.type === 'video';
    });
    var hasImage = items.some(function (m) {
      return m && (m.type === 'image' || !m.type);
    });
    if (window.__tchiloCreateFlowActive && hasImage && !hasVideo) return true;
    return hasImage && !hasVideo;
  }'''
    if old in t:
        t = t.replace(old, new, 1)
        print('isPhotoOnlyCreate patched')
    elif '__tchiloCreateFlowActive' in t and 'isPhotoOnlyCreate' in t:
        print('isPhotoOnlyCreate already enhanced')
    else:
        print('isPhotoOnlyCreate pattern miss')

    # ensure selectTrack dispatches event
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

# 2) media picker: sync media + music chip + call bridge music with item
mp = Path('native/tchilo-media-picker.js')
if not mp.exists():
    raise SystemExit(0)
js = mp.read_text(encoding='utf-8', errors='replace')
orig = js

# After paintCompose, sync for music
if 'tchiloSyncCreateMediaForMusic' not in js:
    js = js.replace(
        '''function paintCompose() {
    var box = $('mpComposePreview');
    if (!box || !selected[0]) return;
    box.innerHTML = '';''',
        '''function paintCompose() {
    var box = $('mpComposePreview');
    if (!box || !selected[0]) return;
    box.innerHTML = '';
    try {
      if (typeof window.tchiloSyncCreateMediaForMusic === 'function') window.tchiloSyncCreateMediaForMusic(selected[0]);
    } catch (eSync) {}''',
        1,
    )
    print('paintCompose sync')

# music handler passes selected[0]
if "a === 'music'" in js:
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

# inject music chip UI in caption bar if missing
if 'mpMusicChip' not in js and 'mp-caption-bar' in js:
    js = js.replace(
        '<textarea class="mp-caption" id="mpCaption"',
        '<div id="mpMusicChip" style="display:none;margin-bottom:8px;padding:8px 12px;border-radius:999px;background:rgba(255,255,255,.1);font:600 13px system-ui,sans-serif"></div>' +
        '<textarea class="mp-caption" id="mpCaption"',
        1,
    )
    # listen for music selected
    if 'tchilo-music-selected' not in js:
        js = js.replace(
            'function boot() { ensureDOM(); wirePlus(); }',
            '''function updateMusicChip() {
    var chip = $('mpMusicChip');
    if (!chip) return;
    if (window._pendingMusic) {
      chip.style.display = 'block';
      chip.textContent = '♪ ' + String(window._pendingMusic).slice(0, 48);
    } else {
      chip.style.display = 'none';
      chip.textContent = '';
    }
  }
  window.addEventListener('tchilo-music-selected', updateMusicChip);
  function boot() { ensureDOM(); wirePlus(); updateMusicChip(); }''',
            1,
        )
    print('music chip')

# on publish ensure _pendingMusic not cleared before publishPostCore reads it
# (publishPostCore already reads then clears — OK)

if js != orig:
    mp.write_text(js, encoding='utf-8')
    print('picker written')
else:
    print('picker unchanged')

# bump bridge cache in index
idx = Path('index.html')
if idx.exists():
    h = idx.read_text(encoding='utf-8', errors='replace')
    h2 = re.sub(r'tchilo-create-bridge\.js\?v=\d+', 'tchilo-create-bridge.js?v=2', h)
    h2 = re.sub(r'tchilo-media-picker\.js\?v=\d+', 'tchilo-media-picker.js?v=5', h2)
    if 'tchilo-create-bridge.js' not in h2:
        h2 = h2.replace(
            '</body>',
            '<script src="native/tchilo-create-bridge.js?v=2" defer></script>\n</body>',
            1,
        )
    if h2 != h:
        idx.write_text(h2, encoding='utf-8')
        print('index bumped')
"""

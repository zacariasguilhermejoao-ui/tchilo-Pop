#!/usr/bin/env python3
"""Wire create bridge + update media picker crop/music/camera."""
from pathlib import Path
import re

# --- bump / inject bridge script in index ---
p = Path('index.html')
if p.exists():
    html = p.read_text(encoding='utf-8', errors='replace')
    orig = html
    tag = '<script src="native/tchilo-create-bridge.js?v=1" defer></script>'
    if 'tchilo-create-bridge.js' not in html:
        if 'tchilo-media-picker.js' in html:
            html = re.sub(
                r'(<script src="native/tchilo-media-picker\.js[^>]+></script>)',
                r'\1\n' + tag,
                html,
                count=1,
            )
        else:
            html = html.replace('</body>', tag + '\n</body>', 1)
        print('bridge script added')
    # ensure picker v3
    html = re.sub(
        r'native/tchilo-media-picker\.js\?v=\d+',
        'native/tchilo-media-picker.js?v=4',
        html,
    )
    if html != orig:
        p.write_text(html, encoding='utf-8')
        print('index updated')
    else:
        print('index ok')

# --- patch media picker for crop/music/camera flags ---
mp = Path('native/tchilo-media-picker.js')
if not mp.exists():
    print('no picker')
    raise SystemExit(0)

js = mp.read_text(encoding='utf-8', errors='replace')
orig_js = js

# Ensure create flow flag when opening picker / camera
if '__tchiloCreateFlowActive' not in js:
    js = js.replace(
        "function openPicker(opts) {",
        "function openPicker(opts) {\n    window.__tchiloCreateFlowActive = true;",
        1,
    )
    js = js.replace(
        "function closePicker(restore) {",
        "function closePicker(restore) {\n    if (restore !== false) window.__tchiloCreateFlowActive = false;",
        1,
    )
    print('flags added')

# Replace crop toast with real editor
old_crop = "if (a === 'crop') { toast('Cortar'); return; }"
new_crop = "if (a === 'crop') { if (typeof window.tchiloOpenCreateCrop === 'function') window.tchiloOpenCreateCrop(selected[0]); else toast('Cortar'); return; }"
if old_crop in js:
    js = js.replace(old_crop, new_crop, 1)
    print('crop wired')
else:
    # alternate compact form
    js = re.sub(
        r"if \(a === 'crop'\) \{ toast\('Cortar'\); return; \}",
        "if (a === 'crop') { if (typeof window.tchiloOpenCreateCrop === 'function') window.tchiloOpenCreateCrop(selected[0]); else toast('Cortar'); return; }",
        js,
        count=1,
    )
    print('crop wired (regex)')

# Music
old_music = """if (a === 'music') {
      toast('Música');
      try {
        if (typeof openMusicPicker === 'function') openMusicPicker();
        else if (typeof window.tchiloOpenMusic === 'function') window.tchiloOpenMusic();
      } catch (err) {}
      return;
    }"""
new_music = """if (a === 'music') {
      if (typeof window.tchiloOpenCreateMusic === 'function') window.tchiloOpenCreateMusic();
      else {
        try { if (typeof openMusicPicker === 'function') openMusicPicker(); } catch (err) {}
      }
      return;
    }"""
if "a === 'music'" in js and 'tchiloOpenCreateMusic' not in js:
    js = re.sub(
        r"if \(a === 'music'\) \{[\s\S]*?return;\n    \}",
        new_music,
        js,
        count=1,
    )
    print('music wired')

# Camera should set flag and prefer effects camera
if "async function openCameraEffects" in js and 'CreateFlowActive' not in js[js.find('openCameraEffects'):js.find('openCameraEffects')+400]:
    js = js.replace(
        'async function openCameraEffects() {',
        'async function openCameraEffects() {\n    window.__tchiloCreateFlowActive = true;',
        1,
    )
    print('camera flag')

if js != orig_js:
    mp.write_text(js, encoding='utf-8')
    print('picker patched', len(js))
else:
    print('picker unchanged')

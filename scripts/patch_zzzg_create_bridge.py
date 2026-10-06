#!/usr/bin/env python3
from pathlib import Path
import re

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
    html = re.sub(
        r'native/tchilo-media-picker\.js\?v=\d+',
        'native/tchilo-media-picker.js?v=4',
        html,
    )
    if html != orig:
        p.write_text(html, encoding='utf-8')
        print('index updated')

mp = Path('native/tchilo-media-picker.js')
if not mp.exists():
    raise SystemExit(0)
js = mp.read_text(encoding='utf-8', errors='replace')
orig = js

if "if (a === 'crop') {\n      toast('Cortar');\n      return;\n    }" in js:
    js = js.replace(
        "if (a === 'crop') {\n      toast('Cortar');\n      return;\n    }",
        "if (a === 'crop') {\n      if (typeof window.tchiloOpenCreateCrop === 'function') window.tchiloOpenCreateCrop(selected[0]);\n      else toast('Cortar');\n      return;\n    }",
        1,
    )
    print('crop ok')

if 'tchiloOpenCreateMusic' not in js and "a === 'music'" in js:
    js = re.sub(
        r"if \(a === 'music'\) \{[\s\S]*?return;\n    \}",
        "if (a === 'music') {\n      if (typeof window.tchiloOpenCreateMusic === 'function') window.tchiloOpenCreateMusic();\n      else { try { if (typeof openMusicPicker === 'function') openMusicPicker(); } catch (err) {} }\n      return;\n    }",
        js,
        count=1,
    )
    print('music ok')

if 'window.__tchiloCreateFlowActive = true' not in js:
    js = js.replace(
        'function openPicker(opts) {\n    opts = opts || {};',
        'function openPicker(opts) {\n    window.__tchiloCreateFlowActive = true;\n    opts = opts || {};',
        1,
    )
    js = js.replace(
        'function closePicker(restoreScroll) {\n    var el = $(\'tchiloMediaPicker\');',
        'function closePicker(restoreScroll) {\n    if (restoreScroll !== false) window.__tchiloCreateFlowActive = false;\n    var el = $(\'tchiloMediaPicker\');',
        1,
    )
    print('flags ok')

if 'window.__tchiloCreateFlowActive = true' not in js[js.find('openCameraEffects'):js.find('openCameraEffects')+120]:
    js = js.replace(
        'openCameraEffects() {\n    // Prefer in-app camera with effects',
        'openCameraEffects() {\n    window.__tchiloCreateFlowActive = true;\n    // Prefer in-app camera with effects',
        1,
    )
    print('cam flag ok')

if js != orig:
    mp.write_text(js, encoding='utf-8')
    print('picker written', len(js))
else:
    print('picker unchanged')

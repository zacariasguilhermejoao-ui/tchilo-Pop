#!/usr/bin/env python3
"""Force tchilo-media-picker.js v4 - POST/STORY/TEMA large + flat."""
from pathlib import Path
import re

mp = Path('native/tchilo-media-picker.js')
if not mp.exists():
    raise SystemExit(0)
t = mp.read_text(encoding='utf-8', errors='replace')
orig = t

if '__TCHILO_MEDIA_PICKER_V4' not in t:
    t = t.replace(
        "if (window.__TCHILO_MEDIA_PICKER_V3) return;\n  window.__TCHILO_MEDIA_PICKER_V3 = true;",
        "if (window.__TCHILO_MEDIA_PICKER_V4) return;\n  window.__TCHILO_MEDIA_PICKER_V4 = true;\n  window.__TCHILO_MEDIA_PICKER_V3 = true;",
        1,
    )
    t = t.replace(' * Tchilo Create Flow v3\n', ' * Tchilo Create Flow v4 - POST/STORY/TEMA large tabs + flat icons\n', 1)

t = t.replace('font:800 22px/1.1 system-ui,-apple-system,sans-serif;', 'font:800 28px/1 system-ui,-apple-system,sans-serif;', 1)
t = t.replace(
    'letter-spacing:0.04em;text-transform:uppercase;padding:6px 10px;cursor:pointer;transition:color .15s ease;}',
    'letter-spacing:0.06em;text-transform:uppercase;padding:8px 12px;cursor:pointer;transition:color .15s ease;flex-shrink:0;}',
    1,
)
t = t.replace(
    "'#tchiloMediaPicker .mp-actions{display:flex;gap:12px;padding:12px 14px;flex-shrink:0;}',",
    "'#tchiloMediaPicker .mp-actions{display:flex;gap:0;padding:8px 8px 4px;flex-shrink:0;}',",
    1,
)
t = t.replace(
    "'padding:16px 10px;border-radius:0;border:0;background:transparent;color:var(--ink,#0B0B0C);cursor:pointer;',\n      'font:600 13px system-ui,sans-serif;box-shadow:none;}'",
    "'padding:14px 8px;border-radius:0;border:0;background:transparent!important;color:var(--ink,#0B0B0C);cursor:pointer;',\n      'font:600 13px system-ui,sans-serif;box-shadow:none!important;}'",
    1,
)

if "if (!existing.querySelector('#mpModes'))" not in t:
    t = t.replace(
        "  function ensureDOM() {\n    injectCSS();\n    if ($('tchiloMediaPicker')) return;\n",
        "  function ensureDOM() {\n    injectCSS();\n    var existing = $('tchiloMediaPicker');\n    if (existing) {\n      if (!existing.querySelector('#mpModes')) {\n        try { existing.remove(); } catch (e) {}\n      } else {\n        try { bindModeTabs(); } catch (e2) {}\n        try { syncModeTabs(); } catch (e3) {}\n        return;\n      }\n    }\n",
        1,
    )

if t.count('bindModeTabs()') < 3:
    t = t.replace(
        '    themeBg = THEME_COLORS[0].bg;\n  }\n\n  function setStep(step) {',
        '    themeBg = THEME_COLORS[0].bg;\n    try { bindModeTabs(); } catch (e) {}\n    try { syncModeTabs(); } catch (e2) {}\n  }\n\n  function setStep(step) {',
        1,
    )

if "var themeBtn = $('mpThemeBtn');" in t:
    t2, n = re.subn(
        r'  function setStep\(step\) \{[\s\S]*?\n  \}\n\n  function formatDur',
        "  function setStep(step) {\n    STEP = step;\n    document.querySelectorAll('#tchiloMediaPicker .mp-step').forEach(function (el) {\n      el.classList.toggle('on', el.getAttribute('data-step') === step);\n    });\n    var pubBtn = $('mpPublishBtn');\n    if (pubBtn) {\n      pubBtn.style.display = (step === 'compose' || step === 'story' || step === 'theme') ? '' : 'none';\n    }\n    try { syncModeTabs(); } catch (e) {}\n  }\n\n  function formatDur",
        t,
        count=1,
    )
    if n:
        t = t2
        print('setStep fixed')

if t != orig:
    mp.write_text(t, encoding='utf-8')
    print('media-picker patched', len(t))
else:
    print('media-picker already up to date')

idx = Path('index.html')
if idx.exists():
    ht = idx.read_text(encoding='utf-8', errors='replace')
    ht2 = re.sub(r'tchilo-light-create\.css\.js\?v=\d+', 'tchilo-light-create.css.js?v=2', ht)
    ht2 = re.sub(r'tchilo-media-picker\.js\?v=\d+', 'tchilo-media-picker.js?v=8', ht2)
    if ht2 != ht:
        idx.write_text(ht2, encoding='utf-8')
        print('index cache bumped')
    else:
        print('index ok')

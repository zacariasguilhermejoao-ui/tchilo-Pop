#!/usr/bin/env python3
"""LAST: force restore media-picker + v5 surgical + hide modes on compose."""
from pathlib import Path
import urllib.request
import runpy
import re

url = "https://raw.githubusercontent.com/zacariasguilhermejoao-ui/tchilo-Pop/a9e590a5/native/tchilo-media-picker.js"
dest = Path("native/tchilo-media-picker.js")
print("FORCE download base...")
data = urllib.request.urlopen(url, timeout=60).read()
if len(data) < 20000:
    raise SystemExit("base too small %d" % len(data))
dest.write_bytes(data)
print("base", len(data))

s = Path("scripts/patch_zzzw_media_picker_v5.py")
if s.exists() and s.stat().st_size > 500:
    runpy.run_path(str(s))

t = dest.read_text(encoding="utf-8", errors="replace")
NEW = """  function setStep(step) {
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
m = re.search(r"  function setStep\(step\) \{[\s\S]*?\n  \}\n\n  function formatDur", t)
if m:
    t = t[:m.start()] + NEW + "\n\n  function formatDur" + t[m.end():]
    dest.write_text(t, encoding="utf-8")
    print("setStep hide modes OK")
else:
    # fallback: inject modes hide after STEP = step
    if "mp-modes-hidden" not in t or "modes.classList.add('mp-modes-hidden')" not in t:
        t = t.replace(
            "    STEP = step;\n    document.querySelectorAll('#tchiloMediaPicker .mp-step')",
            "    STEP = step;\n    var __modes = $('mpModes'); if (__modes) { if (step === 'hub') __modes.classList.remove('mp-modes-hidden'); else __modes.classList.add('mp-modes-hidden'); }\n    document.querySelectorAll('#tchiloMediaPicker .mp-step')",
            1,
        )
        dest.write_text(t, encoding="utf-8")
        print("setStep inject fallback")
    else:
        print("setStep pattern miss")

final = dest.stat().st_size
print("FINAL", final)
if final < 20000:
    raise SystemExit("still broken")

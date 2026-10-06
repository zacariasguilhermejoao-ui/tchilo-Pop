#!/usr/bin/env python3
from pathlib import Path
import re
p = Path("native/tchilo-media-picker.js")
if not p.exists():
    raise SystemExit(0)
t = p.read_text(encoding="utf-8", errors="replace")
o = t
# Replace entire setStep function
NEW = '''  function setStep(step) {
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
  }'''
m = re.search(r"  function setStep\(step\) \{[\s\S]*?\n  \}\n\n  function formatDur", t)
if m:
    t = t[:m.start()] + NEW + "\n\n  function formatDur" + t[m.end():]
    print("setStep replaced")
else:
    print("setStep pattern miss")
if "mp-modes-hidden" not in t:
    t = t.replace(
        "'#tchiloMediaPicker .mp-hidden{position:fixed;left:-9999px;width:1px;height:1px;opacity:0;}'",
        "'#tchiloMediaPicker .mp-hidden{position:fixed;left:-9999px;width:1px;height:1px;opacity:0;}','#tchiloMediaPicker .mp-modes.mp-modes-hidden{display:none!important;}'",
    )
    print("css hide")
if t != o:
    p.write_text(t, encoding="utf-8")
    print("written", len(t))
else:
    print("no change")

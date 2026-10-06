#!/usr/bin/env python3
from pathlib import Path
p = Path("native/tchilo-media-picker.js")
if not p.exists():
    raise SystemExit(0)
t = p.read_text(encoding="utf-8", errors="replace")
o = t

# Null-safe themeBtn/storyBtn + hide modes
old1 = """    var title = $('mpTitle');
    var themeBtn = $('mpThemeBtn');
    var storyBtn = $('mpStoryBtn');
    var pubBtn = $('mpPublishBtn');

    themeBtn.style.display = step === 'hub' ? '' : 'none';
    storyBtn.style.display = step === 'hub' ? '' : 'none';
    pubBtn.style.display = (step === 'compose' || step === 'story' || step === 'theme') ? '' : 'none';

    if (step === 'hub') title.textContent = MODE === 'story' ? 'Story' : 'Criar';
    if (step === 'theme') title.textContent = 'Tema';
    if (step === 'compose') title.textContent = 'Nova publicação';
    if (step === 'story') title.textContent = 'Novo story';
    if (step === 'publishing') title.textContent = 'Publicar';

    storyBtn.classList.toggle('on', MODE === 'story');"""

new1 = """    var pubBtn = $('mpPublishBtn');
    if (pubBtn) {
      pubBtn.style.display = (step === 'compose' || step === 'story' || step === 'theme') ? '' : 'none';
    }
    var modesEl = $('mpModes');
    if (modesEl) {
      if (step === 'hub') modesEl.classList.remove('mp-modes-hidden');
      else modesEl.classList.add('mp-modes-hidden');
    }
    if (step === 'publishing' || step === 'hub') {
      try { stopComposeAudio(); } catch (e0) {}
    }"""

if old1 in t:
    t = t.replace(old1, new1, 1)
    print("setStep body fixed")
elif "modesEl.classList.add('mp-modes-hidden')" not in t and "modes.classList.add('mp-modes-hidden')" not in t:
    # inject after STEP = step;
    if "    STEP = step;" in t:
        t = t.replace(
            "    STEP = step;",
            "    STEP = step;\n    var modesEl = $('mpModes'); if (modesEl) { if (step === 'hub') modesEl.classList.remove('mp-modes-hidden'); else modesEl.classList.add('mp-modes-hidden'); }",
            1,
        )
        print("injected modes hide")
    # null-safe themeBtn
    t = t.replace("    themeBtn.style.display", "    if (themeBtn) themeBtn.style.display")
    t = t.replace("    storyBtn.style.display", "    if (storyBtn) storyBtn.style.display")
    t = t.replace("    storyBtn.classList.toggle", "    if (storyBtn) storyBtn.classList.toggle")
    print("null-safe buttons")
else:
    print("already has modes hide")

if t != o:
    p.write_text(t, encoding="utf-8")
    print("written", len(t))
else:
    print("no change")

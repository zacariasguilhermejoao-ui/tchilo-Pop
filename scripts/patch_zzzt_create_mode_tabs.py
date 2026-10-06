#!/usr/bin/env python3
"""Create hub: POST/STORY/TEMA large tabs + remove soft UI on actions."""
from pathlib import Path
import re

mp = Path('native/tchilo-media-picker.js')
if not mp.exists():
    raise SystemExit(0)

t = mp.read_text(encoding='utf-8', errors='replace')
orig = t

# --- CSS: mode tabs + flat actions ---
old_title = "'#tchiloMediaPicker .mp-top-title{flex:1;text-align:center;font:700 16px system-ui,-apple-system,sans-serif;}',"
new_tabs_css = """'#tchiloMediaPicker .mp-modes{flex:1;display:flex;align-items:center;justify-content:center;gap:0;min-width:0;overflow:hidden;touch-action:pan-y;}',
      '#tchiloMediaPicker .mp-mode{border:0;background:transparent;color:rgba(11,11,12,.28);font:800 22px/1.1 system-ui,-apple-system,sans-serif;',
      'letter-spacing:0.04em;text-transform:uppercase;padding:6px 10px;cursor:pointer;transition:color .15s ease;}',
      '#tchiloMediaPicker .mp-mode.on{color:var(--ink,#0B0B0C);}',
      '#tchiloMediaPicker .mp-top-title{display:none;}',"""
if old_title in t:
    t = t.replace(old_title, new_tabs_css, 1)
    print('tabs css')
elif '.mp-modes' not in t:
    t = t.replace(
        "'#tchiloMediaPicker .mp-top{display:flex;align-items:center;gap:8px;padding:10px 12px;',",
        "'#tchiloMediaPicker .mp-top{display:flex;align-items:center;gap:6px;padding:10px 12px;',\n"
        + new_tabs_css,
        1,
    )
    print('tabs css alt')

# remove soft chip style usage in top (keep class for publish area if needed)
# flatten actions - no soft card look
t = t.replace(
    "'#tchiloMediaPicker .mp-action{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;',\n"
    "      'padding:18px 10px;border-radius:16px;border:0;background:rgba(11,11,12,.05);color:var(--ink,#0B0B0C);cursor:pointer;',\n"
    "      'font:600 13px system-ui,sans-serif;}',",
    "'#tchiloMediaPicker .mp-action{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;',\n"
    "      'padding:16px 10px;border-radius:0;border:0;background:transparent;color:var(--ink,#0B0B0C);cursor:pointer;',\n"
    "      'font:600 13px system-ui,sans-serif;box-shadow:none;}',",
)
# hide old chips
if "#tchiloMediaPicker .mp-chip{display:none" not in t:
    t = t.replace(
        "'#tchiloMediaPicker .mp-chip{border:0;border-radius:999px;padding:8px 14px;font:600 13px system-ui,sans-serif;',",
        "'#tchiloMediaPicker .mp-chip{display:none!important;border:0;border-radius:999px;padding:8px 14px;font:600 13px system-ui,sans-serif;',",
        1,
    )

# flatten icon btn soft bg
t = t.replace(
    "'#tchiloMediaPicker .mp-icon-btn{width:40px;height:40px;border:0;border-radius:50%;background:rgba(11,11,12,.06);',",
    "'#tchiloMediaPicker .mp-icon-btn{width:40px;height:40px;border:0;border-radius:50%;background:transparent;',",
)

# --- HTML: replace title + chips with mode tabs ---
old_top = (
    "'<div class=\"mp-top-title\" id=\"mpTitle\">Criar</div>' +\n"
    "      '<button type=\"button\" class=\"mp-chip\" data-a=\"theme\" id=\"mpThemeBtn\">Tema</button>' +\n"
    "      '<button type=\"button\" class=\"mp-chip\" data-a=\"story-mode\" id=\"mpStoryBtn\">Story</button>' +"
)
new_top = (
    "'<div class=\"mp-modes\" id=\"mpModes\">' +\n"
    "      '<button type=\"button\" class=\"mp-mode on\" data-mode=\"post\" id=\"mpModePost\">POST</button>' +\n"
    "      '<button type=\"button\" class=\"mp-mode\" data-mode=\"story\" id=\"mpModeStory\">STORY</button>' +\n"
    "      '<button type=\"button\" class=\"mp-mode\" data-mode=\"theme\" id=\"mpModeTheme\">TEMA</button>' +\n"
    "      '</div>' +\n"
    "      '<div class=\"mp-top-title\" id=\"mpTitle\" style=\"display:none\">POST</div>' +"
)
if old_top in t:
    t = t.replace(old_top, new_top, 1)
    print('top html')
else:
    # try looser
    if 'id="mpModes"' not in t and 'id=\"mpTitle\">Criar' in t:
        t = t.replace(
            "'<div class=\"mp-top-title\" id=\"mpTitle\">Criar</div>' +",
            new_top,
            1,
        )
        # remove chip buttons lines if still present
        t = t.replace(
            "'<button type=\"button\" class=\"mp-chip\" data-a=\"theme\" id=\"mpThemeBtn\">Tema</button>' +\n      ",
            '',
            1,
        )
        t = t.replace(
            "'<button type=\"button\" class=\"mp-chip\" data-a=\"story-mode\" id=\"mpStoryBtn\">Story</button>' +\n      ",
            '',
            1,
        )
        print('top html loose')
    else:
        print('top html miss')

# --- JS: setCreateMode + swipe + click ---
mode_js = r'''
  var MODE_ORDER = ['post', 'story', 'theme'];

  function syncModeTabs() {
    var modes = document.querySelectorAll('#mpModes .mp-mode');
    modes.forEach(function (b) {
      var m = b.getAttribute('data-mode');
      b.classList.toggle('on', m === MODE || (MODE === 'post' && m === 'post' && STEP !== 'theme') || (STEP === 'theme' && m === 'theme'));
    });
    // when on theme step, highlight TEMA
    if (STEP === 'theme') {
      modes.forEach(function (b) {
        b.classList.toggle('on', b.getAttribute('data-mode') === 'theme');
      });
    } else {
      modes.forEach(function (b) {
        b.classList.toggle('on', b.getAttribute('data-mode') === MODE);
      });
    }
    var title = $('mpTitle');
    if (title) {
      title.textContent = STEP === 'theme' ? 'TEMA' : MODE === 'story' ? 'STORY' : 'POST';
    }
  }

  function setCreateMode(mode) {
    if (mode === 'theme') {
      MODE = 'post';
      setStep('theme');
      try { syncThemePreview(); } catch (e) {}
      syncModeTabs();
      return;
    }
    MODE = mode === 'story' ? 'story' : 'post';
    if (STEP === 'theme' || STEP === 'compose' || STEP === 'story') {
      selected = [];
      setStep('hub');
      try { loadRecent(false); } catch (e2) {}
    }
    syncModeTabs();
  }

  function bindModeTabs() {
    var host = $('mpModes');
    if (!host || host.__bound) return;
    host.__bound = true;
    host.querySelectorAll('.mp-mode').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        setCreateMode(btn.getAttribute('data-mode'));
      });
    });
    // swipe
    var sx = 0;
    host.addEventListener(
      'touchstart',
      function (e) {
        if (!e.touches || !e.touches[0]) return;
        sx = e.touches[0].clientX;
      },
      { passive: true }
    );
    host.addEventListener(
      'touchend',
      function (e) {
        if (!e.changedTouches || !e.changedTouches[0]) return;
        var dx = e.changedTouches[0].clientX - sx;
        if (Math.abs(dx) < 40) return;
        var cur = STEP === 'theme' ? 'theme' : MODE;
        var i = MODE_ORDER.indexOf(cur);
        if (i < 0) i = 0;
        if (dx < 0 && i < MODE_ORDER.length - 1) setCreateMode(MODE_ORDER[i + 1]);
        else if (dx > 0 && i > 0) setCreateMode(MODE_ORDER[i - 1]);
      },
      { passive: true }
    );
  }
'''

if 'function setCreateMode' not in t:
    # insert before openPicker or after var MODE
    if 'var MODE = \'post\'' in t:
        t = t.replace(
            "var MODE = 'post'; // post | story",
            "var MODE = 'post'; // post | story | theme\n" + mode_js,
            1,
        )
        print('mode js')
    else:
        t = t.replace("'use strict';", "'use strict';\n" + mode_js, 1)
        print('mode js alt')

# replace old story-mode / theme handlers to use setCreateMode
old_theme = """if (a === 'theme') {
      MODE = 'post';
      setStep('theme');
      syncThemePreview();
      return;
    }
    if (a === 'story-mode') {
      MODE = MODE === 'story' ? 'post' : 'story';
      $('mpStoryBtn').classList.toggle('on', MODE === 'story');
      $('mpTitle').textContent = MODE === 'story' ? 'Story' : 'Criar';
      toast(MODE === 'story' ? 'Modo Story' : 'Modo Post');
      return;
    }"""
new_theme = """if (a === 'theme') {
      setCreateMode('theme');
      return;
    }
    if (a === 'story-mode') {
      setCreateMode(MODE === 'story' ? 'post' : 'story');
      return;
    }"""
if old_theme in t:
    t = t.replace(old_theme, new_theme, 1)
    print('handlers')
else:
    # partial
    if "$('mpStoryBtn')" in t:
        t = t.replace(
            "MODE = MODE === 'story' ? 'post' : 'story';\n      $('mpStoryBtn').classList.toggle('on', MODE === 'story');\n      $('mpTitle').textContent = MODE === 'story' ? 'Story' : 'Criar';\n      toast(MODE === 'story' ? 'Modo Story' : 'Modo Post');",
            "setCreateMode(MODE === 'story' ? 'post' : 'story');",
            1,
        )
        print('handlers partial')

# call bindModeTabs on open / ensureDOM
if 'bindModeTabs()' not in t:
    if 'function ensureDOM' in t:
        t = t.replace(
            'if ($(\'tchiloMediaPicker\')) return;',
            "if ($('tchiloMediaPicker')) { try { bindModeTabs(); syncModeTabs(); } catch (e) {} return; }",
            1,
        )
    # after root append
    if "document.body.appendChild(root)" in t:
        t = t.replace(
            'document.body.appendChild(root);',
            "document.body.appendChild(root);\n    try { bindModeTabs(); syncModeTabs(); } catch (eBind) {}",
            1,
        )
        print('bind on create')
    elif 'appendChild(root)' in t:
        t = t.replace(
            'appendChild(root);',
            "appendChild(root);\n    try { bindModeTabs(); syncModeTabs(); } catch (eBind) {}",
            1,
        )
        print('bind on create2')

# when setStep is called, sync tabs
if 'function setStep' in t and 'syncModeTabs()' not in t[t.find('function setStep'):t.find('function setStep')+250]:
    t = re.sub(
        r'(function setStep\([^)]*\) \{)',
        r'\1\n    try { syncModeTabs(); } catch (e) {}',
        t,
        count=1,
    )
    print('setStep sync')

if t != orig:
    mp.write_text(t, encoding='utf-8')
    print('picker written', len(t))
else:
    print('unchanged')

# index bump
idx = Path('index.html')
if idx.exists():
    h = idx.read_text(encoding='utf-8', errors='replace')
    h2 = re.sub(r'tchilo-media-picker\.js\?v=\d+', 'tchilo-media-picker.js?v=7', h)
    if h2 != h:
        idx.write_text(h2, encoding='utf-8')
        print('index v7')
"""

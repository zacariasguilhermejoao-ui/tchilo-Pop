#!/usr/bin/env python3
from pathlib import Path

p = Path('native/post-music-feed.js')
if not p.exists():
    raise SystemExit(0)
t = p.read_text(encoding='utf-8', errors='replace')
o = t

# stopSheetPreview — also reset cover-play
old_stop = """document.querySelectorAll('#pmList .playbtn.playing, #meMusicList .me-play.playing').forEach(function (b) {
      b.classList.remove('playing');
      b.innerHTML = svgPlay();
    });"""
new_stop = """document.querySelectorAll('#pmList .playbtn.playing, #pmList .cover-play.playing, #meMusicList .me-play.playing').forEach(function (b) {
      b.classList.remove('playing');
      if (b.classList.contains('cover-play')) {
        var ico = b.querySelector('.cover-ico');
        if (ico) ico.innerHTML = svgPlay();
      } else {
        b.innerHTML = svgPlay();
      }
    });"""
if old_stop in t:
    t = t.replace(old_stop, new_stop, 1)
    print('stop ok')
elif 'cover-play.playing' not in t:
    t = t.replace(
        "#pmList .playbtn.playing, #meMusicList .me-play.playing",
        "#pmList .playbtn.playing, #pmList .cover-play.playing, #meMusicList .me-play.playing",
        1,
    )
    print('stop selector')

# togglePreview — update cover-ico not whole button
old_play = """btn.classList.add('playing');
    btn.innerHTML = svgPause();"""
new_play = """btn.classList.add('playing');
    if (btn.classList.contains('cover-play')) {
      var ico = btn.querySelector('.cover-ico');
      if (ico) ico.innerHTML = svgPause();
    } else {
      btn.innerHTML = svgPause();
    }"""
if old_play in t:
    t = t.replace(old_play, new_play, 1)
    print('toggle ok')

if t != o:
    p.write_text(t, encoding='utf-8')
    print('written')
else:
    print('unchanged')

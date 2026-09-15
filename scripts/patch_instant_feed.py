#!/usr/bin/env python3
"""Feed instant: show local cache immediately, refresh cloud in background."""
from pathlib import Path

p = Path("index.html")
html = p.read_text(encoding="utf-8", errors="replace")
changed = False

# 1) renderFeed: if empty but loading, show subtle loading instead of empty void
old_empty = """  if (!posts.length) {
    feed.innerHTML = '<div class="empty"><b>O teu feed está vazio</b>Quando existirem publicações públicas, elas aparecerão aqui.</div>';
    return;
  }"""

new_empty = """  if (!posts.length) {
    if (window.__publicFeedLoading) {
      feed.innerHTML = '<div class="empty" style="opacity:.85"><b>A atualizar…</b>A carregar publicações.</div>';
    } else {
      feed.innerHTML = '<div class="empty"><b>O teu feed está vazio</b>Quando existirem publicações públicas, elas aparecerão aqui.</div>';
    }
    return;
  }"""

if old_empty in html:
    html = html.replace(old_empty, new_empty, 1)
    changed = True
    print("empty/loading state patched")
elif "A atualizar" in html:
    print("empty state already patched")
else:
    print("WARNING: empty block not found")

# 2) bootApp: render cache first, then background cloud (never block UI)
old_boot_tail = """  renderStories();
  renderSuggestions();
  updateAnonBanner();
  renderFeed();
  setupFeedChromeAutoHide();
  var lastScreen = 'feed';
  try {
    lastScreen = localStorage.getItem('tchilo_last_screen') || 'feed';
  } catch (e) {}
  var allowedScreens = {
    feed:1, search:1, messages:1, notifs:1, profile:1, create:1, saved:1,
    settings:1, 'settings-account':1, 'settings-notifications':1, 'settings-stories':1,
    editprofile:1
  };
  if (!allowedScreens[lastScreen]) lastScreen = 'feed';
  goTo(lastScreen);
}"""

new_boot_tail = """  renderStories();
  renderSuggestions();
  updateAnonBanner();
  /* Cache local primeiro — posts aparecem já, sem esperar pela rede */
  try { renderFeed(); } catch (eR) {}
  setupFeedChromeAutoHide();
  var lastScreen = 'feed';
  try {
    lastScreen = localStorage.getItem('tchilo_last_screen') || 'feed';
  } catch (e) {}
  var allowedScreens = {
    feed:1, search:1, messages:1, notifs:1, profile:1, create:1, saved:1,
    settings:1, 'settings-account':1, 'settings-notifications':1, 'settings-stories':1,
    editprofile:1
  };
  if (!allowedScreens[lastScreen]) lastScreen = 'feed';
  goTo(lastScreen);
  /* Rede em segundo plano — não apaga o que já está no ecrã */
  setTimeout(function(){
    try {
      if (typeof loadPublicFeedFromSupabase === 'function') {
        loadPublicFeedFromSupabase(true);
      }
    } catch (eL) {}
  }, 50);
}"""

if old_boot_tail in html:
    html = html.replace(old_boot_tail, new_boot_tail, 1)
    changed = True
    print("bootApp instant feed patched")
elif "Cache local primeiro" in html:
    print("bootApp already patched")
else:
    print("WARNING: bootApp tail not found")

# 3) goTo feed: render instant, load cloud without wiping
old_goto_feed = "if (name === 'feed') { resetFeedChrome(); renderFeed(); setupFeedChromeAutoHide(); setTimeout(function(){ loadPublicFeedFromSupabase(true); }, 0); }"
new_goto_feed = "if (name === 'feed') { resetFeedChrome(); try{renderFeed();}catch(e){} setupFeedChromeAutoHide(); setTimeout(function(){ try{loadPublicFeedFromSupabase(false);}catch(e){} }, 120); }"

if old_goto_feed in html:
    html = html.replace(old_goto_feed, new_goto_feed, 1)
    changed = True
    print("goTo feed patched")
elif "loadPublicFeedFromSupabase(false)" in html:
    print("goTo feed already patched")
else:
    print("WARNING: goTo feed line not found")

# 4) loadPublicFeedFromSupabase: after merge, only re-render if feed active; keep posts visible during load
old_load_guard = "async function loadPublicFeedFromSupabase(force) {\n  if (__publicFeedLoading || (__publicFeedLoaded && !force) || !window.tchiloSupabase) return;\n  __publicFeedLoading = true;"

new_load_guard = "async function loadPublicFeedFromSupabase(force) {\n  if (__publicFeedLoading || (__publicFeedLoaded && !force) || !window.tchiloSupabase) return;\n  __publicFeedLoading = true;\n  /* Se já há posts em cache, o ecrã já os mostra — não limpar */"

if old_load_guard in html:
    html = html.replace(old_load_guard, new_load_guard, 1)
    changed = True
    print("loadPublicFeed guard note added")

# 5) init: if already logged in, paint feed ASAP before full boot
old_init = """function init() {
  playLoginVideo();
  const session = getSession();
  if (session && session.username) {
    hideLoginGate();
  } else {
    document.body.style.overflow = 'hidden';
    document.body.classList.add('login-locked');
  }
}"""

new_init = """function init() {
  playLoginVideo();
  const session = getSession();
  if (session && session.username) {
    /* Pintar cache do feed o mais cedo possível */
    try {
      var early = (typeof getPosts === 'function') ? getPosts() : [];
      if (early && early.length && typeof renderFeed === 'function') {
        var fl = document.getElementById('feedList');
        if (fl && !fl.dataset.earlyPaint) {
          fl.dataset.earlyPaint = '1';
          renderFeed();
        }
      }
    } catch (eEarly) {}
    hideLoginGate();
  } else {
    document.body.style.overflow = 'hidden';
    document.body.classList.add('login-locked');
  }
}"""

if old_init in html:
    html = html.replace(old_init, new_init, 1)
    changed = True
    print("init early paint patched")
elif "earlyPaint" in html:
    print("init already patched")
else:
    print("WARNING: init not found")

if changed:
    p.write_text(html, encoding="utf-8")
    print("index.html updated")
else:
    print("No changes")

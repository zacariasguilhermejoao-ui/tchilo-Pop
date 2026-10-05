#!/usr/bin/env python3
"""Put Iniciar Live into renderProfile HTML; stop inject loops in live scripts."""
from pathlib import Path
import re

# --- index.html: static Live in renderProfile ---
p = Path("index.html")
html = p.read_text(encoding="utf-8", errors="replace")

old = (
    ": ('<button class=\"profile-btn\" onclick=\"goTo(\\'create\\')\">Nova publicação</button>')"
)
new = (
    ": ('<button class=\"profile-btn\" type=\"button\" data-tchilo-live=\"1\" "
    "onclick=\"typeof tchiloOpenLiveSetup===\\'function\\'&&tchiloOpenLiveSetup()\" "
    "style=\"background:#e11d48;color:#fff;border-color:#e11d48\">Iniciar Live</button>' + "
    "'<button class=\"profile-btn\" type=\"button\" onclick=\"goTo(\\'create\\')\">Nova publicação</button>')"
)

if "data-tchilo-live=\"1\"" in html and "Iniciar Live</button>' +" in html:
    print("index live already static")
elif old in html:
    html = html.replace(old, new, 1)
    p.write_text(html, encoding="utf-8")
    print("index renderProfile patched")
else:
    # try alternate quote styles
    m = re.search(
        r": \('\s*<button class=\"profile-btn\" onclick=\"goTo\('create'\)">Nova publicação</button>'\s*\)",
        html,
    )
    if m:
        html = html[: m.start()] + new + html[m.end() :]
        p.write_text(html, encoding="utf-8")
        print("index renderProfile regex patched")
    else:
        print("index pattern miss")

# --- tchilo-live.js: remove interval + aggressive observer ---
lp = Path("native/tchilo-live.js")
if lp.exists():
    s = lp.read_text(encoding="utf-8")
    s2 = s
    s2 = s2.replace("  setInterval(injectProfileButton, 1500);\n", "  /* no setInterval — evita piscar */\n")
    # soft observer: only if button missing
    old_obs = """  var obs = new MutationObserver(function () {
    injectProfileButton();
  });
  function startObs() {
    var body = document.getElementById("profileBody");
    if (body) obs.observe(body, { childList: true, subtree: true });
    injectProfileButton();
    tryOpenLiveFromUrl();
  }"""
    new_obs = """  function startObs() {
    injectProfileButton();
    tryOpenLiveFromUrl();
    /* reatacha só quando o perfil é reconstruído (sem loop) */
    if (typeof window.renderProfile === "function" && !window.renderProfile.__liveBtn) {
      var rp = window.renderProfile;
      window.renderProfile = function () {
        var r = rp.apply(this, arguments);
        setTimeout(injectProfileButton, 50);
        return r;
      };
      window.renderProfile.__liveBtn = true;
    }
  }"""
    if old_obs in s2:
        s2 = s2.replace(old_obs, new_obs)
        print("live observer fixed")
    else:
        print("live observer pattern miss")
    if s2 != s:
        lp.write_text(s2, encoding="utf-8")
        print("live.js wrote")

# --- profile-menu-fix.js: remove setInterval ---
mp = Path("native/profile-menu-fix.js")
if mp.exists():
    s = mp.read_text(encoding="utf-8")
    s2 = s.replace(
        "  setInterval(run, 2500);\n",
        "  /* sem setInterval — evita Live a piscar */\n",
    )
    # fixLiveInject already no-ops if present — keep
    if s2 != s:
        mp.write_text(s2, encoding="utf-8")
        print("menu-fix interval removed")
    else:
        print("menu-fix no interval or already")

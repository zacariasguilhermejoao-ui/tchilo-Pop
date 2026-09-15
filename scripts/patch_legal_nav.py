#!/usr/bin/env python3
"""Patch index.html so Terms/Privacy never show the bottom navbar."""
from pathlib import Path

p = Path("index.html")
html = p.read_text(encoding="utf-8", errors="replace")
changed = False

old = """function openLegalFromLogin(name) {
  legalReturnScreen = 'login';
  document.getElementById('loginGate').classList.add('hidden');
  document.body.style.overflow = '';
  // show app frame screens
  goTo(name);
}
function legalBack() {
  if (legalReturnScreen === 'login') {
    document.querySelectorAll('.screen').forEach(function(s){ s.classList.remove('active'); });
    document.getElementById('loginGate').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    playLoginVideo();
    legalReturnScreen = 'settings';
  } else {
    goTo(legalReturnScreen || 'settings-legal');
  }
}"""

new = """function openLegalFromLogin(name) {
  legalReturnScreen = 'login';
  document.body.classList.add('legal-from-login');
  document.body.classList.add('legal-screen-open');
  document.getElementById('loginGate').classList.add('hidden');
  document.body.style.overflow = '';
  var __nav = document.querySelector('.navbar'); if (__nav) { __nav.style.setProperty('display','none','important'); }
  var __tb = document.querySelector('.topbar'); if (__tb) { __tb.style.setProperty('display','none','important'); }
  var __st = document.querySelector('.stories'); if (__st) { __st.style.setProperty('display','none','important'); }
  goTo(name);
  setTimeout(function(){ var n=document.querySelector('.navbar'); if(n) n.style.setProperty('display','none','important'); }, 0);
  setTimeout(function(){ var n=document.querySelector('.navbar'); if(n) n.style.setProperty('display','none','important'); }, 50);
}
function legalBack() {
  if (legalReturnScreen === 'login') {
    document.querySelectorAll('.screen').forEach(function(s){ s.classList.remove('active'); });
    document.getElementById('loginGate').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    document.body.classList.remove('legal-from-login');
    document.body.classList.remove('legal-screen-open');
    playLoginVideo();
    legalReturnScreen = 'settings';
  } else {
    document.body.classList.remove('legal-from-login');
    document.body.classList.remove('legal-screen-open');
    var __nav = document.querySelector('.navbar'); if (__nav) { __nav.style.removeProperty('display'); }
    var __tb = document.querySelector('.topbar'); if (__tb) { __tb.style.removeProperty('display'); }
    var __st = document.querySelector('.stories'); if (__st) { __st.style.removeProperty('display'); }
    goTo(legalReturnScreen || 'settings-legal');
  }
}"""

if old in html:
    html = html.replace(old, new, 1)
    changed = True
    print("Patched openLegalFromLogin/legalBack")
elif "legal-screen-open" in html and "openLegalFromLogin" in html:
    print("Functions already patched")
else:
    print("WARNING: original openLegalFromLogin block not found")

css = """<style id=\"tchilo-hide-nav-legal\">
body.legal-screen-open .navbar, body.legal-from-login .navbar,
body.legal-screen-open .topbar, body.legal-from-login .topbar,
body.legal-screen-open .stories, body.legal-from-login .stories {
  display:none!important;visibility:hidden!important;pointer-events:none!important;opacity:0!important;
}
#appFrame:has(#screen-terms.active) .navbar,
#appFrame:has(#screen-privacy.active) .navbar,
#appFrame:has(#screen-child.active) .navbar,
#appFrame:has(#screen-community.active) .navbar,
#appFrame:has(#screen-about.active) .navbar {
  display:none!important;visibility:hidden!important;
}
</style>
"""

if "tchilo-hide-nav-legal" not in html and "</head>" in html:
    html = html.replace("</head>", css + "</head>", 1)
    changed = True
    print("Injected CSS")

marker = """if (name === 'terms' || name === 'privacy' || name === 'child' || name === 'community' || name === 'about') {
    if (legalReturnScreen !== 'login') legalReturnScreen = 'settings-legal';
  }"""

replacement = """if (name === 'terms' || name === 'privacy' || name === 'child' || name === 'community' || name === 'about') {
    if (legalReturnScreen !== 'login') legalReturnScreen = 'settings-legal';
    document.body.classList.add('legal-screen-open');
    var __n = document.querySelector('.navbar'); if (__n) __n.style.setProperty('display','none','important');
    var __t = document.querySelector('.topbar'); if (__t) __t.style.setProperty('display','none','important');
    var __s = document.querySelector('.stories'); if (__s) __s.style.setProperty('display','none','important');
  } else if (document.body.classList.contains('legal-screen-open') && legalReturnScreen !== 'login') {
    document.body.classList.remove('legal-screen-open');
  }"""

if marker in html and "document.body.classList.add('legal-screen-open')" not in html[html.find("function goTo"):html.find("function goTo")+2500]:
    html = html.replace(marker, replacement, 1)
    changed = True
    print("Patched goTo")

for src in ["native/legal-navbar-fix.js", "native/feed-names-fix.js"]:
    if src not in html and "</body>" in html:
        html = html.replace("</body>", f'<script src="{src}"></script>\n</body>', 1)
        changed = True
        print("Injected", src)

if changed:
    p.write_text(html, encoding="utf-8")
    print("index.html updated")
else:
    print("No changes needed")

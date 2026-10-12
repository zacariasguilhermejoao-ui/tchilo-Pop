#!/usr/bin/env python3
"""Patch index.html: single boot + clickable login buttons."""
from pathlib import Path

p = Path("index.html")
html = p.read_text(encoding="utf-8", errors="replace")
orig = html
changed = []

# 1) unlock spam
old_unlock = """  unlock();
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',unlock);
  setTimeout(unlock,100);
  setTimeout(unlock,500);
  setTimeout(unlock,1500);
  setTimeout(unlock,3000);
  setInterval(function(){if(hasSession())unlock();},4000);
})();"""
new_unlock = """  unlock();
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',unlock);
  /* Uma única verificação extra após paint — sem spam de unlock */
  setTimeout(unlock,300);
})();"""
if old_unlock in html:
    html = html.replace(old_unlock, new_unlock, 1)
    changed.append("unlock-spam")

# 2) onPointer ignore login
old_op = """  function onPointer(e){
    try{
      var t=e.target;
      if(!t||!t.closest)return;
      var btn=t.closest('.nav-item,.nav-post,.icon-btn,.logo-img,button[data-screen]');
      if(!btn)return;
      unlock();"""
new_op = """  function onPointer(e){
    try{
      var t=e.target;
      if(!t||!t.closest)return;
      /* Nunca interferir com o ecrã de login/registo */
      if(t.closest('#loginGate,.login-gate,#tsu'))return;
      var btn=t.closest('.nav-item,.nav-post,.icon-btn,.logo-img,button[data-screen]');
      if(!btn)return;
      unlock();"""
if old_op in html:
    html = html.replace(old_op, new_op, 1)
    changed.append("onPointer")

# 3) bootApp remove duplicate cloud load
old_boot = """  if (!allowedScreens[lastScreen]) lastScreen = 'feed';
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
new_boot = """  if (!allowedScreens[lastScreen]) lastScreen = 'feed';
  goTo(lastScreen);
  /* Cloud refresh fica a cargo do wrapper de bootApp (uma só vez). */
}"""
if old_boot in html:
    html = html.replace(old_boot, new_boot, 1)
    changed.append("bootApp-tail")

# 4) wrapper single boot
old_w = """  const oldBoot=window.bootApp;
  if(typeof oldBoot==='function'){
    window.bootApp=async function(){
      if(!state.loading){
        state.loading=true;
        /* stories carregam já em paralelo, sem esperar pelo resto */
        try{ loadCloudStories().then(function(){ try{renderStories();}catch(e){} }).catch(function(){}); }catch(e){}
        try{await loadCloudPosts();await loadCloudUserData();initTchiloRealtime();}
        finally{state.loading=false;}
      }
      try{oldBoot();}catch(e){console.error(e);}
    };
  }"""
new_w = """  const oldBoot=window.bootApp;
  if(typeof oldBoot==='function'){
    window.bootApp=async function(){
      /* Boot único: UI local primeiro, cloud uma vez, sem segundo ciclo */
      if(window.__tchiloBootOnce){
        try{oldBoot();}catch(e){console.error(e);}
        return;
      }
      window.__tchiloBootOnce=true;
      if(!state.loading){
        state.loading=true;
        try{ loadCloudStories().then(function(){ try{renderStories();}catch(e){} }).catch(function(){}); }catch(e){}
        try{await loadCloudPosts();await loadCloudUserData();initTchiloRealtime();}
        finally{state.loading=false;}
      }
      try{oldBoot();}catch(e){console.error(e);}
    };
  }"""
if old_w in html:
    html = html.replace(old_w, new_w, 1)
    changed.append("wrapper")

# 5) CSS
if "tchilo-login-click-fix" not in html:
    css = """
<style id=\"tchilo-login-click-fix\">
#loginGate, #loginGate * { pointer-events: auto !important; }
#loginGate .login-video,
#loginGate .login-video-overlay { pointer-events: none !important; }
#loginGate .login-choice button,
#loginGate .login-create,
#loginGate button[onclick*=\"showLoginPanel\"] {
  pointer-events: auto !important;
  z-index: 5 !important;
  position: relative !important;
  touch-action: manipulation !important;
  -webkit-tap-highlight-color: transparent;
}
#loginGate.hidden, #loginGate.hidden * { pointer-events: none !important; }
body:not(.tchilo-session-on) #tchiloBusy { display: none !important; pointer-events: none !important; }
</style>
"""
    if "</head>" in html:
        html = html.replace("</head>", css + "\n</head>", 1)
        changed.append("css-head")
    else:
        html = html.replace('<div class="login-gate" id="loginGate">', css + '\n<div class="login-gate" id="loginGate">', 1)
        changed.append("css-body")

# 6) showLoginPanel
old_s = """function showLoginPanel(panel) {
  if (panel === 'signup' && typeof window.tsuOpen === 'function') { try { window.tsuOpen(); } catch(e) { console.error(e); } return; }
  try { playLoginVideo(); } catch (e) {}"""
new_s = """function showLoginPanel(panel) {
  try { if (typeof tchiloHideBusy === 'function') tchiloHideBusy(); } catch(e) {}
  if (panel === 'signup' && typeof window.tsuOpen === 'function') { try { window.tsuOpen(); } catch(e) { console.error(e); } return; }
  try { playLoginVideo(); } catch (e) {}"""
if old_s in html:
    html = html.replace(old_s, new_s, 1)
    changed.append("showLoginPanel")

if html == orig:
    print("NO_CHANGES")
else:
    p.write_text(html, encoding="utf-8")
    print("CHANGED:", ",".join(changed))
    print("SIZE:", len(html))

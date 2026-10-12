#!/usr/bin/env python3
"""Patch index.html: single boot + clickable login + keep credentials on login attempt."""
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

# 6) showLoginPanel - hide busy + DO NOT clear fields on access
old_s1 = """function showLoginPanel(panel) {
  try { if (typeof tchiloHideBusy === 'function') tchiloHideBusy(); } catch(e) {}
  if (panel === 'signup' && typeof window.tsuOpen === 'function') { try { window.tsuOpen(); } catch(e) { console.error(e); } return; }
  try { playLoginVideo(); } catch (e) {}
  if (panel === 'access') { try { tchiloClearLoginFields(); } catch(e){} }"""

old_s0 = """function showLoginPanel(panel) {
  if (panel === 'signup' && typeof window.tsuOpen === 'function') { try { window.tsuOpen(); } catch(e) { console.error(e); } return; }
  try { playLoginVideo(); } catch (e) {}
  if (panel === 'access') { try { tchiloClearLoginFields(); } catch(e){} }"""

new_s = """function showLoginPanel(panel) {
  try { if (typeof tchiloHideBusy === 'function') tchiloHideBusy(); } catch(e) {}
  if (panel === 'signup' && typeof window.tsuOpen === 'function') { try { window.tsuOpen(); } catch(e) { console.error(e); } return; }
  try { playLoginVideo(); } catch (e) {}
  /* NÃO limpar email/password ao abrir Entrar — só limpar erro visual */
  if (panel === 'access') {
    try {
      var err = document.getElementById('loginError');
      if (err) err.textContent = '';
      tchiloClearFieldErrors(document.getElementById('accessPanel') || document);
    } catch(e){}
  }"""

if old_s1 in html:
    html = html.replace(old_s1, new_s, 1)
    changed.append("showLoginPanel-keep-fields")
elif old_s0 in html:
    html = html.replace(old_s0, new_s, 1)
    changed.append("showLoginPanel-keep-fields")
elif "NÃO limpar email/password ao abrir Entrar" not in html:
    import re
    pat = r"if \(panel === 'access'\) \{ try \{ tchiloClearLoginFields\(\); \} catch\(e\)\{\} \}"
    if re.search(pat, html):
        html = re.sub(pat, """if (panel === 'access') {
    try {
      var err = document.getElementById('loginError');
      if (err) err.textContent = '';
      tchiloClearFieldErrors(document.getElementById('accessPanel') || document);
    } catch(e){}
  }""", html, count=1)
        changed.append("showLoginPanel-keep-fields-re")

# 7) showLoginGate - only clear fields when logging out
old_gate = """  document.getElementById('loginGate').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  document.body.classList.add('login-locked');
  tchiloClearLoginFields();
  showLoginHome();
  playLoginVideo();
}"""
new_gate = """  document.getElementById('loginGate').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  document.body.classList.add('login-locked');
  /* Só limpar campos no logout explícito — não após tentativa de login falhada */
  if (window.__tchiloLoggingOut) {
    try { tchiloClearLoginFields(); } catch(e){}
  } else {
    try {
      var err = document.getElementById('loginError');
      if (err) err.textContent = '';
    } catch(e){}
  }
  showLoginHome();
  playLoginVideo();
}"""
if old_gate in html:
    html = html.replace(old_gate, new_gate, 1)
    changed.append("showLoginGate-keep-fields")

# 8) After failed login, restore fields if emptied
old_login_catch = """  }catch(err){
    console.error(err);
    error.textContent=err?.message||'Não foi possível iniciar sessão.';
    tchiloMarkInvalid(identifierEl);
    tchiloMarkInvalid(passwordEl);
  }finally{
    tchiloSetLoading(btn, false);
  }
}"""
new_login_catch = """  }catch(err){
    console.error(err);
    error.textContent=err?.message||'Não foi possível iniciar sessão.';
    tchiloMarkInvalid(identifierEl);
    tchiloMarkInvalid(passwordEl);
    /* Manter o que o utilizador escreveu — nunca limpar após erro */
    try {
      if (identifierEl && !identifierEl.value && identifier) identifierEl.value = identifier;
      if (passwordEl && !passwordEl.value && password) passwordEl.value = password;
    } catch(eR){}
  }finally{
    tchiloSetLoading(btn, false);
  }
}"""
if old_login_catch in html:
    html = html.replace(old_login_catch, new_login_catch, 1)
    changed.append("login-error-keep-fields")

if html == orig:
    print("NO_CHANGES")
else:
    p.write_text(html, encoding="utf-8")
    print("CHANGED:", ",".join(changed))
    print("SIZE:", len(html))

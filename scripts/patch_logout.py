#!/usr/bin/env python3
"""Make logout reliably clear session and show login gate."""
from pathlib import Path

p = Path("index.html")
html = p.read_text(encoding="utf-8", errors="replace")
changed = False

old = """async function logout() {
  try { await tchiloSupabase.auth.signOut(); } catch(e) { console.error(e); }
  clearSession();
  tchiloClearLoginFields();
  showLoginGate();
  showToast('Sessão terminada.');
}"""

new = """async function logout() {
  try {
    window.__tchiloLoggingOut = true;
  } catch (e0) {}
  try { clearSession(); } catch (e1) {}
  try {
    if (typeof tchiloClearLoginFields === 'function') tchiloClearLoginFields();
  } catch (e2) {}
  try {
    if (window.tchiloSupabase && window.tchiloSupabase.auth) {
      await window.tchiloSupabase.auth.signOut({ scope: 'global' });
    }
  } catch (e3) {
    console.warn('Tchilo signOut:', e3 && e3.message ? e3.message : e3);
  }
  /* Limpar chaves Supabase no storage (evita reentrar sozinho) */
  try {
    var keys = [];
    for (var i = 0; i < localStorage.length; i++) {
      var k = localStorage.key(i);
      if (k && (k.indexOf('sb-') === 0 || k.indexOf('supabase') >= 0)) keys.push(k);
    }
    keys.forEach(function(k){ try { localStorage.removeItem(k); } catch (e) {} });
  } catch (e4) {}
  try { clearSession(); } catch (e5) {}
  try {
    document.querySelectorAll('.screen').forEach(function(s){ s.classList.remove('active'); });
  } catch (e6) {}
  try { showLoginGate(); } catch (e7) {}
  try {
    if (typeof playLoginVideo === 'function') playLoginVideo();
  } catch (e8) {}
  try { showToast('Sessão terminada.'); } catch (e9) {}
  setTimeout(function(){
    try { window.__tchiloLoggingOut = false; } catch (e) {}
  }, 1500);
}"""

if old in html:
    html = html.replace(old, new, 1)
    changed = True
    print("logout function replaced")
elif "__tchiloLoggingOut" in html:
    print("logout already patched")
else:
    print("WARNING: original logout block not found")

# Guard tchiloSyncAuthSession / onAuthStateChange from re-login during logout
old_auth = "tchiloSupabase.auth.onAuthStateChange((event,session)=>{\n  if(event==='SIGNED_OUT'){ clearSession(); showLoginGate(); return; }\n  if((event==='SIGNED_IN' || event==='INITIAL_SESSION') && session?.user){\n    setTimeout(()=>tchiloSyncAuthSession(),0);\n  }"

new_auth = "tchiloSupabase.auth.onAuthStateChange((event,session)=>{\n  if(event==='SIGNED_OUT'){ clearSession(); showLoginGate(); return; }\n  if(window.__tchiloLoggingOut){ return; }\n  if((event==='SIGNED_IN' || event==='INITIAL_SESSION') && session?.user){\n    setTimeout(()=>tchiloSyncAuthSession(),0);\n  }"

if old_auth in html:
    html = html.replace(old_auth, new_auth, 1)
    changed = True
    print("onAuthStateChange guarded")
elif "__tchiloLoggingOut" in html and "onAuthStateChange" in html:
    print("onAuthStateChange already guarded or different")
else:
    print("WARNING: onAuthStateChange block not found exactly")

if changed:
    p.write_text(html, encoding="utf-8")
    print("index.html updated")
else:
    print("No changes")

#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Patch index.html login - must remove profile throw and guard gate."""
from pathlib import Path

p = Path('index.html')
h = p.read_text(encoding='utf-8')
orig = len(h)
changed = []

# 1) Kill the exact profile-required throw (UTF-8)
THROW = "if(profileError || !profile) throw new Error('Perfil da conta n\u00e3o encontrado.');"
# Also try the literal as stored in file
if 'profileError || !profile' in h and 'throw new Error' in h:
    lines = h.split('\n')
    out = []
    for line in lines:
        if 'profileError || !profile' in line and 'throw' in line and 'Perfil' in line:
            out.append(
                "if(profileError || !profile){"
                "var meta=data.user.user_metadata||{};"
                "profile={id:data.user.id,username:meta.username||('user_'+String(data.user.id).slice(0,8)),"
                "display_name:meta.display_name||'',avatar_url:null,is_private:false,anonymous_mode:false};"
                "window.__tchiloJustLoggedIn=true;"
                "setTimeout(function(){window.__tchiloJustLoggedIn=false;},30000);"
                "}"
            )
            changed.append('throw-kill')
        else:
            out.append(line)
    h = '\n'.join(out)

# 2) After successful auth, mark just logged in before setSession in login
# Insert before setSession in login function if not present
if '__tchiloJustLoggedIn=true' not in h:
    # mark right after signIn success path - before profile select
    needle = "if(error) throw error;\n  const {data:profile,error:profileError}"
    if needle in h:
        h = h.replace(
            needle,
            "if(error) throw error;\n"
            "  window.__tchiloJustLoggedIn=true;try{clearTimeout(window.__tchiloJustLoggedInTimer);}catch(_t){}\n"
            "  window.__tchiloJustLoggedInTimer=setTimeout(function(){window.__tchiloJustLoggedIn=false;},30000);\n"
            "  const {data:profile,error:profileError}",
            1,
        )
        changed.append('mark-just')
    else:
        needle2 = "if(error) throw error;"
        # only first occurrence inside login - do once after function start
        idx = h.find('async function tchiloSupabaseLogin')
        if idx >= 0:
            sub = h[idx:idx+800]
            if 'if(error) throw error;' in sub and '__tchiloJustLoggedIn' not in sub:
                h = h[:idx] + sub.replace(
                    'if(error) throw error;',
                    'if(error) throw error;\n  window.__tchiloJustLoggedIn=true;setTimeout(function(){window.__tchiloJustLoggedIn=false;},30000);',
                    1,
                ) + h[idx+800:]
                changed.append('mark-just-2')

# 3) showLoginGate guard
old_sg = (
    "function showLoginGate() {\n"
    "  document.getElementById('loginGate').classList.remove('hidden');\n"
    "  document.body.style.overflow = 'hidden';\n"
    "  document.body.classList.add('login-locked');\n"
    "  tchiloClearLoginFields();\n"
    "  showLoginHome();\n"
    "  playLoginVideo();\n"
    "}"
)
new_sg = (
    "function showLoginGate() {\n"
    "  if(window.__tchiloJustLoggedIn && !window.__tchiloLoggingOut) return;\n"
    "  try{var ls=JSON.parse(localStorage.getItem('tchilo_session')||'null');"
    "if(ls&&(ls.id||ls.username)&&!window.__tchiloLoggingOut){"
    "try{document.getElementById('loginGate').classList.add('hidden');"
    "document.body.classList.remove('login-locked');document.body.style.overflow='';}catch(e){}return;}}catch(e2){}\n"
    "  document.getElementById('loginGate').classList.remove('hidden');\n"
    "  document.body.style.overflow = 'hidden';\n"
    "  document.body.classList.add('login-locked');\n"
    "  tchiloClearLoginFields();\n"
    "  showLoginHome();\n"
    "  playLoginVideo();\n"
    "}"
)
if old_sg in h and 'if(window.__tchiloJustLoggedIn && !window.__tchiloLoggingOut) return;' not in h:
    h = h.replace(old_sg, new_sg, 1)
    changed.append('gate')

# 4) SIGNED_OUT
old_so = (
    "if(event==='SIGNED_OUT'){\n"
    "    window.__tchiloPasswordRecoveryActive = false;\n"
    "    clearSession(); showLoginGate(); return;\n"
    "  }"
)
new_so = (
    "if(event==='SIGNED_OUT'){\n"
    "    window.__tchiloPasswordRecoveryActive = false;\n"
    "    if(window.__tchiloJustLoggedIn) return;\n"
    "    clearSession(); showLoginGate(); return;\n"
    "  }"
)
if old_so in h:
    h = h.replace(old_so, new_so, 1)
    changed.append('signed_out')

# 5) sync soft profile
if "const profile=await tchiloEnsureProfile(session.user);" in h:
    h = h.replace(
        "const profile=await tchiloEnsureProfile(session.user);",
        "let profile=null;try{profile=await tchiloEnsureProfile(session.user);}catch(eP){}"
        "if(!profile){const meta=session.user.user_metadata||{};"
        "profile={id:session.user.id,username:meta.username||('user_'+String(session.user.id).slice(0,8)),"
        "display_name:meta.display_name||'',avatar_url:null,is_private:false,anonymous_mode:false};}",
        1,
    )
    changed.append('sync')

# 6) sync else
needle = "    } else {\n      clearSession();\n      showLoginGate();\n    }"
repl = (
    "    } else {\n"
    "      if(window.__tchiloJustLoggedIn) return;\n"
    "      try{var ls=JSON.parse(localStorage.getItem('tchilo_session')||'null');"
    "if(ls&&(ls.id||ls.username)){hideLoginGate();return;}}catch(eL){}\n"
    "      clearSession();\n"
    "      showLoginGate();\n"
    "    }"
)
if needle in h:
    h = h.replace(needle, repl, 1)
    changed.append('sync_else')

# 7) ensureProfile soft
if "if(readError) throw readError;" in h:
    h = h.replace("if(readError) throw readError;", "if(readError) {/* soft */}", 1)
    changed.append('readErr')
if "if(createError) throw createError;\n  return created;" in h:
    h = h.replace(
        "if(createError) throw createError;\n  return created;",
        "if(createError){return {id:user.id,username:username,display_name:displayName,avatar_url:null,is_private:false,anonymous_mode:false};}\n  return created;",
        1,
    )
    changed.append('createErr')

p.write_text(h, encoding='utf-8')
print('changed:', changed)
print('size', orig, '->', len(h))
print('perfil left', any('Perfil da conta' in line and 'throw' in line for line in h.split('\n')))
print('justLogged', '__tchiloJustLoggedIn' in h)
if not changed:
    print('WARNING: no changes applied')
    # force a no-op touch so we see the script ran
    pass

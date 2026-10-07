#!/usr/bin/env python3
"""Patch index.html login flow - remove profile requirement, guard gate."""
import re, pathlib
p = pathlib.Path('index.html')
h = p.read_text(encoding='utf-8')
orig = len(h)
changed = []

if "Perfil da conta" in h and "__tchiloJustLoggedIn=true" not in h:
    h2, n = re.subn(
        r"const \{data:profile,error:profileError\}=await tchiloSupabase\.from\('profiles'\)\.select\('\*'\)\.eq\('id',data\.user\.id\)\.maybeSingle\(\);\s*"
        r"if\(profileError \|\| !profile\) throw new Error\('Perfil da conta[^']*'\);\s*"
        r"setSession\(\{id:profile\.id,username:profile\.username,email:data\.user\.email\|\|'',[\^)]+\}\);\s*"
        r"hideLoginGate\(\);\s*"
        r"showToast\('Ol[^']+'\+profile\.username\+'!'\);",
        """window.__tchiloJustLoggedIn=true;try{clearTimeout(window.__tchiloJustLoggedInTimer);}catch(e){}window.__tchiloJustLoggedInTimer=setTimeout(function(){window.__tchiloJustLoggedIn=false;},30000);
  var profile=null;
  try{var pr=await tchiloSupabase.from('profiles').select('*').eq('id',data.user.id).maybeSingle();profile=pr&&pr.data;}catch(e1){}
  if(!profile){try{profile=await tchiloEnsureProfile(data.user);}catch(e2){}}
  if(!profile){var meta=data.user.user_metadata||{};profile={id:data.user.id,username:meta.username||('user_'+String(data.user.id).slice(0,8)),display_name:meta.display_name||'',avatar_url:null,is_private:false,anonymous_mode:false};}
  setSession({id:profile.id,username:profile.username,email:data.user.email||'',displayName:profile.display_name||profile.username,avatar:profile.avatar_url||null,privateAccount:!!profile.is_private,anonymousMode:!!profile.anonymous_mode});
  try{var g=document.getElementById('loginGate');if(g){g.classList.add('hidden');g.style.setProperty('display','none','important');}document.body.classList.remove('login-locked');document.body.style.overflow='';}catch(e3){}
  hideLoginGate();
  try{showToast('Ol\xe1, '+profile.username+'!');}catch(e4){}""",
        h,
        count=1,
    )
    if n:
        h = h2
        changed.append('login')
    else:
        for t in [
            "if(profileError || !profile) throw new Error('Perfil da conta n\xe3o encontrado.');",
            "if(profileError || !profile) throw new Error('Perfil da conta n\u00e3o encontrado.');",
        ]:
            pass
        # unicode form
        t = "if(profileError || !profile) throw new Error('Perfil da conta n\xe3o encontrado.');"
        # actual file uses UTF-8
        import unicodedata
        for line in h.split('\n'):
            if 'profileError || !profile' in line and 'throw' in line:
                h = h.replace(line, "if(profileError || !profile){var meta=data.user.user_metadata||{};profile={id:data.user.id,username:meta.username||('user_'+String(data.user.id).slice(0,8)),display_name:meta.display_name||'',avatar_url:null,is_private:false,anonymous_mode:false}; window.__tchiloJustLoggedIn=true;setTimeout(function(){window.__tchiloJustLoggedIn=false;},30000);}", 1)
                changed.append('throw-kill')
                break

old_sg = """function showLoginGate() {
  document.getElementById('loginGate').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  document.body.classList.add('login-locked');
  tchiloClearLoginFields();
  showLoginHome();
  playLoginVideo();
}"""
new_sg = """function showLoginGate() {
  if(window.__tchiloJustLoggedIn && !window.__tchiloLoggingOut) return;
  try{var ls=JSON.parse(localStorage.getItem('tchilo_session')||'null');if(ls&&(ls.id||ls.username)&&!window.__tchiloLoggingOut){try{document.getElementById('loginGate').classList.add('hidden');document.body.classList.remove('login-locked');document.body.style.overflow='';}catch(e){}return;}}catch(e2){}
  document.getElementById('loginGate').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  document.body.classList.add('login-locked');
  tchiloClearLoginFields();
  showLoginHome();
  playLoginVideo();
}"""
if old_sg in h and 'if(window.__tchiloJustLoggedIn && !window.__tchiloLoggingOut) return;' not in h:
    h = h.replace(old_sg, new_sg, 1)
    changed.append('gate')

old_so = "if(event==='SIGNED_OUT'){\n    window.__tchiloPasswordRecoveryActive = false;\n    clearSession(); showLoginGate(); return;\n  }"
new_so = "if(event==='SIGNED_OUT'){\n    window.__tchiloPasswordRecoveryActive = false;\n    if(window.__tchiloJustLoggedIn) return;\n    clearSession(); showLoginGate(); return;\n  }"
if old_so in h:
    h = h.replace(old_so, new_so, 1)
    changed.append('signed_out')

if "const profile=await tchiloEnsureProfile(session.user);" in h:
    h = h.replace(
        "const profile=await tchiloEnsureProfile(session.user);",
        "let profile=null;try{profile=await tchiloEnsureProfile(session.user);}catch(eP){}if(!profile){const meta=session.user.user_metadata||{};profile={id:session.user.id,username:meta.username||('user_'+String(session.user.id).slice(0,8)),display_name:meta.display_name||'',avatar_url:null,is_private:false,anonymous_mode:false};}",
        1,
    )
    changed.append('sync')

needle = "    } else {\n      clearSession();\n      showLoginGate();\n    }"
repl = "    } else {\n      if(window.__tchiloJustLoggedIn) return;\n      try{var ls=JSON.parse(localStorage.getItem('tchilo_session')||'null');if(ls&&(ls.id||ls.username)){hideLoginGate();return;}}catch(eL){}\n      clearSession();\n      showLoginGate();\n    }"
if needle in h:
    h = h.replace(needle, repl, 1)
    changed.append('sync_else')

if "if(readError) throw readError;" in h:
    h = h.replace("if(readError) throw readError;", "if(readError) {/* soft */}", 1)
    changed.append('readErr')
if "if(createError) throw createError;" in h:
    h = h.replace(
        "if(createError) throw createError;\n  return created;",
        "if(createError){return {id:user.id,username:username,display_name:displayName,avatar_url:null,is_private:false,anonymous_mode:false};}\n  return created;",
        1,
    )
    changed.append('createErr')

p.write_text(h, encoding='utf-8')
print('changed:', changed)
print('size', orig, '->', len(h))
print('perfil left', 'Perfil da conta' in h)
print('justLogged', '__tchiloJustLoggedIn' in h)

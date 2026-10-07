#!/usr/bin/env python3
"""
Surgical fix: login no longer bounces back to Entrar/Criar conta.
Replaces tchiloSupabaseLogin, tchiloSyncAuthSession, onAuthStateChange in index.html.
Also wires session fix script and corrects site URL.
"""
from pathlib import Path
import re

p = Path("index.html")
html = p.read_text(encoding="utf-8", errors="replace")
orig = html

NEW_LOGIN = r'''async function tchiloSupabaseLogin(identifier,password){
  let email=String(identifier||'').trim().toLowerCase();
  password=String(password||'');
  if(!isValidEmail(email)){
    throw new Error('Para entrar, usa o email da conta (não o nome de utilizador).');
  }
  if(!password){ throw new Error('Preenche a palavra-passe.'); }
  const {data,error}=await tchiloSupabase.auth.signInWithPassword({email,password});
  if(error){
    var msg=error.message||'Não foi possível iniciar sessão.';
    if(/invalid login|invalid credentials/i.test(msg)) msg='Email ou palavra-passe incorretos.';
    if(/email not confirmed/i.test(msg)) msg='Confirma o teu email antes de entrar.';
    throw new Error(msg);
  }
  const user=data&&data.user;
  if(!user) throw new Error('Não foi possível iniciar sessão.');
  window.__tchiloJustLoggedIn=true;
  setTimeout(function(){ window.__tchiloJustLoggedIn=false; },10000);
  var profile=null;
  try{ profile=await tchiloEnsureProfile(user); }catch(e){ console.warn('ensureProfile',e); }
  if(!profile){
    try{
      var pr=await tchiloSupabase.from('profiles').select('*').eq('id',user.id).maybeSingle();
      profile=pr&&pr.data;
    }catch(e2){}
  }
  if(!profile){
    var meta=user.user_metadata||{};
    profile={id:user.id,username:meta.username||('user_'+String(user.id).slice(0,8)),display_name:meta.display_name||'',avatar_url:null,is_private:false,anonymous_mode:false};
  }
  setSession({id:profile.id,username:profile.username,email:user.email||email,displayName:profile.display_name||profile.username,avatar:profile.avatar_url||null,privateAccount:!!profile.is_private,anonymousMode:!!profile.anonymous_mode});
  hideLoginGate();
  showToast('Olá, '+profile.username+'!');
}'''

NEW_SYNC = r'''async function tchiloSyncAuthSession(){
  if (tchiloIsPasswordRecoveryUrl() || window.__tchiloPasswordRecoveryActive) {
    try {
      document.getElementById('loginGate')?.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
      showLoginPanel('recover-new');
    } catch(e) {}
    return;
  }
  try {
    const {data:{session}} = await tchiloSupabase.auth.getSession();
    if(session?.user){
      var profile=null;
      try{ profile=await tchiloEnsureProfile(session.user); }catch(e){ console.warn('sync ensureProfile',e); }
      if(!profile){
        try{
          var pr=await tchiloSupabase.from('profiles').select('*').eq('id',session.user.id).maybeSingle();
          profile=pr&&pr.data;
        }catch(e2){}
      }
      if(!profile){
        var meta=session.user.user_metadata||{};
        profile={id:session.user.id,username:meta.username||('user_'+String(session.user.id).slice(0,8)),display_name:meta.display_name||'',avatar_url:null,is_private:false,anonymous_mode:false};
      }
      setSession({
        id: profile.id,
        username: profile.username,
        email: session.user.email || '',
        displayName: profile.display_name || profile.username,
        avatar: profile.avatar_url || null,
        privateAccount: !!profile.is_private,
        anonymousMode: !!profile.anonymous_mode
      });
      hideLoginGate();
    } else {
      if (window.__tchiloJustLoggedIn) return;
      var local=null;
      try{ local=getSession(); }catch(e){}
      if(local && local.id){
        hideLoginGate();
        return;
      }
      clearSession();
      showLoginGate();
    }
  } catch(err){
    console.error('Supabase session error:', err);
    try{
      var local2=getSession();
      if(local2 && local2.id) hideLoginGate();
    }catch(e3){}
  }
}'''

NEW_AUTH = r'''tchiloSupabase.auth.onAuthStateChange((event,session)=>{
  if(event==='SIGNED_OUT'){
    if(window.__tchiloJustLoggedIn && !window.__tchiloLoggingOut){
      console.warn('[auth] ignore SIGNED_OUT during login');
      return;
    }
    window.__tchiloPasswordRecoveryActive = false;
    clearSession(); showLoginGate(); return;
  }
  if(event==='PASSWORD_RECOVERY' || tchiloIsPasswordRecoveryUrl()){
    window.__tchiloPasswordRecoveryActive = true;
    setTimeout(()=>{
      try {
        document.getElementById('loginGate')?.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        showLoginPanel('recover-new');
        showToast('Escolhe a tua nova palavra-passe');
      } catch(e) {}
    },0);
    return;
  }
  if((event==='SIGNED_IN' || event==='INITIAL_SESSION' || event==='TOKEN_REFRESHED') && session?.user){
    if(window.__tchiloPasswordRecoveryActive || tchiloIsPasswordRecoveryUrl()) return;
    window.__tchiloJustLoggedIn=true;
    setTimeout(function(){ window.__tchiloJustLoggedIn=false; },10000);
    setTimeout(()=>tchiloSyncAuthSession(),0);
  }
});'''

html2, n1 = re.subn(
    r'async function tchiloSupabaseLogin\(identifier,password\)\{.*?\n\}',
    NEW_LOGIN,
    html,
    count=1,
    flags=re.S,
)
html2, n2 = re.subn(
    r'async function tchiloSyncAuthSession\(\)\{.*?\n\}',
    NEW_SYNC,
    html2,
    count=1,
    flags=re.S,
)
html2, n3 = re.subn(
    r'tchiloSupabase\.auth\.onAuthStateChange\(\(event,session\)=>\{.*?\}\);',
    NEW_AUTH,
    html2,
    count=1,
    flags=re.S,
)

html2 = html2.replace(
    "const TCHILO_SITE_URL = 'https://zacariasguilhermejoao-ui.github.io/tchilo-Pop/'",
    "const TCHILO_SITE_URL = 'https://tchilopop.com/",
)
# fix quote if broken
html2 = html2.replace(
    "const TCHILO_SITE_URL = 'https://tchilopop.com/",
    "const TCHILO_SITE_URL = 'https://tchilopop.com/'",
)

if 'tchilo-login-session-fix.js' not in html2:
    tag = '<script src="native/tchilo-login-session-fix.js?v=7"></script>\n'
    if 'tchilo-login-click-fix.js' in html2:
        html2 = re.sub(
            r'(<script src="native/tchilo-login-click-fix\.js[^"]*"[^>]*>\s*</script>)',
            r'\1\n' + tag,
            html2,
            count=1,
        )
    elif 'media-editor.js' in html2:
        html2 = re.sub(
            r'(<script src="native/media-editor\.js[^"]*"[^>]*>\s*</script>)',
            r'\1\n' + tag,
            html2,
            count=1,
        )
else:
    html2 = re.sub(
        r'tchilo-login-session-fix\.js(\?v=\d+)?',
        'tchilo-login-session-fix.js?v=7',
        html2,
    )

html2 = re.sub(
    r'tchilo-login-click-fix\.js(\?v=\d+)?',
    'tchilo-login-click-fix.js?v=5',
    html2,
)

GUARD = '''
/* v7 login guards */
(function(){
  if(window.__tchiloLoginGuardV7) return;
  window.__tchiloLoginGuardV7=true;
  var _show=window.showLoginGate;
  if(typeof _show==='function'){
    window.showLoginGate=function(){
      if(window.__tchiloJustLoggedIn && !window.__tchiloLoggingOut) return;
      try{
        var s=typeof getSession==='function'?getSession():null;
        if(s&&s.id&&!window.__tchiloLoggingOut){ try{hideLoginGate();}catch(e){} return; }
      }catch(e){}
      return _show.apply(this,arguments);
    };
  }
  var _home=window.showLoginHome;
  if(typeof _home==='function'){
    window.showLoginHome=function(){
      if(window.__tchiloJustLoggedIn && !window.__tchiloLoggingOut) return;
      return _home.apply(this,arguments);
    };
  }
})();
'''

if '__tchiloLoginGuardV7' not in html2:
    if 'native/media-editor.js' in html2:
        html2 = html2.replace(
            '<script src="native/media-editor.js',
            '<script>' + GUARD + '</script>\n<script src="native/media-editor.js',
            1,
        )

print('replacements: login=%d sync=%d auth=%d' % (n1, n2, n3))
if html2 != orig:
    p.write_text(html2, encoding='utf-8')
    print('index.html UPDATED', abs(len(html2) - len(orig)), 'bytes delta')
else:
    print('NO CHANGE')

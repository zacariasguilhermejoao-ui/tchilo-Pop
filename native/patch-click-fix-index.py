#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Inject permanent click-fix into index.html head+body."""
from pathlib import Path

p = Path('index.html')
h = p.read_text(encoding='utf-8')

MARKER = 'tchilo-click-fix-v1'
if MARKER in h:
    print('already injected')
    raise SystemExit(0)

CSS = '''
<style id="tchilo-click-fix-v1">
/* CRITICAL: overlays nunca bloqueiam a app */
#storyViewer:not(.open),
.story-viewer:not(.open){
  display:none!important;
  pointer-events:none!important;
  visibility:hidden!important;
  z-index:-1!important;
  opacity:0!important;
}
.login-gate.hidden,
#loginGate.hidden{
  display:none!important;
  pointer-events:none!important;
  visibility:hidden!important;
  z-index:-1!important;
}
body.tchilo-session-on .login-gate,
body.tchilo-session-on #loginGate{
  display:none!important;
  pointer-events:none!important;
  visibility:hidden!important;
  z-index:-1!important;
}
/* Chrome sempre clicavel com sessao */
body.tchilo-session-on .navbar,
body.tchilo-session-on .navbar *,
body.tchilo-session-on .topbar,
body.tchilo-session-on .topbar *,
body.tchilo-session-on .nav-item,
body.tchilo-session-on .nav-post,
body.tchilo-session-on .icon-btn,
body.tchilo-session-on .logo-img{
  pointer-events:auto!important;
  cursor:pointer!important;
}
body.tchilo-session-on .navbar{
  display:flex!important;
  opacity:1!important;
  visibility:visible!important;
  transform:none!important;
  height:auto!important;
  max-height:none!important;
}
body.tchilo-session-on.tchilo-logged-out .navbar{
  display:flex!important;
  pointer-events:auto!important;
  opacity:1!important;
  visibility:visible!important;
}
.sheet:not(.open),
.profile-action-sheet:not(.open),
#tchiloModalHost[aria-hidden="true"]{
  pointer-events:none!important;
}
</style>
'''

JS = '''
<script id="tchilo-click-fix-js-v1">
(function(){
  function hasSession(){
    try{
      var raw=localStorage.getItem('tchilo_session');
      if(!raw)return false;
      var o=JSON.parse(raw);
      return !!(o&&(o.id||o.username||o.email));
    }catch(e){return false;}
  }
  function unlock(){
    try{
      if(!hasSession())return;
      document.body.classList.add('tchilo-session-on');
      document.body.classList.remove('tchilo-logged-out','login-locked','legal-screen-open','legal-from-login','tchilo-no-bottom-nav');
      document.body.style.overflow='';
      document.body.style.position='';
      document.body.style.pointerEvents='';
      var g=document.getElementById('loginGate');
      if(g){g.classList.add('hidden');g.style.setProperty('display','none','important');g.style.setProperty('pointer-events','none','important');}
      var sv=document.getElementById('storyViewer');
      if(sv&&!sv.classList.contains('open')){
        sv.style.setProperty('display','none','important');
        sv.style.setProperty('pointer-events','none','important');
        sv.style.setProperty('z-index','-1','important');
      }
      var nav=document.querySelector('.navbar');
      if(nav){
        nav.style.setProperty('display','flex','important');
        nav.style.setProperty('pointer-events','auto','important');
        nav.style.setProperty('opacity','1','important');
        nav.style.setProperty('visibility','visible','important');
      }
    }catch(e){}
  }
  /* Clique forçado nos icones — mesmo se algo cobrir, captura na fase capture */
  function onPointer(e){
    try{
      var t=e.target;
      if(!t||!t.closest)return;
      var btn=t.closest('.nav-item,.nav-post,.icon-btn,.logo-img,button[data-screen]');
      if(!btn)return;
      unlock();
      /* deixa o onclick normal correr; se nao houver, forca */
      var oc=btn.getAttribute('onclick');
      if(oc&&typeof window.goTo==='function'){
        /* nao interfere se onclick existir */
        return;
      }
      var screen=btn.getAttribute('data-screen');
      if(screen&&typeof window.goTo==='function'){
        e.preventDefault();
        e.stopPropagation();
        if(screen==='feed'&&typeof window.onNavFeed==='function')window.onNavFeed();
        else if(screen==='profile'){window.viewingProfileUser=null;window.goTo('profile');}
        else window.goTo(screen);
      }
    }catch(err){}
  }
  document.addEventListener('click',onPointer,true);
  document.addEventListener('touchend',onPointer,true);
  unlock();
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',unlock);
  setTimeout(unlock,100);
  setTimeout(unlock,500);
  setTimeout(unlock,1500);
  setTimeout(unlock,3000);
  setInterval(function(){if(hasSession())unlock();},4000);
})();
</script>
'''

# Inject CSS after <head>
if '<head>' in h:
    h = h.replace('<head>', '<head>' + CSS, 1)
elif '<head ' in h:
    import re
    h = re.sub(r'(<head[^>]*>)', r'\1' + CSS, h, count=1)
else:
    print('NO HEAD')
    raise SystemExit(1)

# Inject JS right after <body>
if '<body>' in h:
    h = h.replace('<body>', '<body>' + JS, 1)
elif '<body ' in h:
    import re
    h = re.sub(r'(<body[^>]*>)', r'\1' + JS, h, count=1)
else:
    print('NO BODY')
    raise SystemExit(1)

p.write_text(h, encoding='utf-8')
print('injected click-fix, size', len(h))

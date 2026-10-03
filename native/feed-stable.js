/** tchilo-Pop feed-stable v23 - same-origin icons only */
(function(){
  if(window.__TCHILO_SI_V23)return;
  window.__TCHILO_SI_V23=true;
  window.__TCHILO_SETTINGS_ICONS=window.__TCHILO_SETTINGS_ICONS||{};
  var B='https://tchilopop.com/native/settings-icons/';
  var V='23';
  var K=['tema','legal','premium','suporte','idioma','avancado','anuncios','conta','guardados','notificacoes','privacidade','selo','stories'];

  function isSettingsScreen(){
    try{
      var body=(document.body&&document.body.innerText)||'';
      var hits=0;
      if(/tchilo premium/i.test(body))hits++;
      if(/notifica/i.test(body))hits++;
      if(/privacidade/i.test(body))hits++;
      if(/idioma/i.test(body))hits++;
      if(/conta avan/i.test(body))hits++;
      if(/defini/i.test(body)&&hits>=2)return true;
      var h=((location.hash||'')+(location.href||'')).toLowerCase();
      return hits>=3||/settings|definic|config/.test(h);
    }catch(e){return false;}
  }
  function keyForLabel(t){
    if(!t)return null;
    t=(t+'').toLowerCase();
    try{t=t.normalize('NFD').replace(/[\u0300-\u036f]/g,'');}catch(e){}
    t=t.trim();
    if(/premium/.test(t))return 'premium';
    if(/suporte|support|ajuda/.test(t))return 'suporte';
    if(/tema|theme|aparencia/.test(t))return 'tema';
    if(/idioma|language|lingua/.test(t))return 'idioma';
    if(/^legal$|termos/.test(t)&&!/privacidade/.test(t))return 'legal';
    if(/avancad|advanced/.test(t))return 'avancado';
    if(/anuncios|ads manager|anuncio/.test(t))return 'anuncios';
    if(/^conta$|account/.test(t)&&!/avancad/.test(t))return 'conta';
    if(/guardados|saved|favoritos/.test(t))return 'guardados';
    if(/notificacoes|notifications/.test(t))return 'notificacoes';
    if(/privacidade|privacy|visibilidade/.test(t))return 'privacidade';
    if(/selo|verificado|verified|badge/.test(t))return 'selo';
    if(/^stories$|historias/.test(t))return 'stories';
    return null;
  }
  function paint(el,key){
    var uri=window.__TCHILO_SETTINGS_ICONS[key];
    if(!uri||uri.length<40)return false;
    if(el.getAttribute&&el.getAttribute('data-si')===key)return true;
    try{
      el.setAttribute('data-si',key);
      el.classList.add('si-icon','si-done');
      el.style.setProperty('background','transparent','important');
      el.style.setProperty('background-color','transparent','important');
      el.style.setProperty('background-image','none','important');
      el.style.setProperty('width','28px','important');
      el.style.setProperty('height','28px','important');
      el.style.setProperty('min-width','28px','important');
      el.style.setProperty('min-height','28px','important');
      el.style.setProperty('display','inline-flex','important');
      el.style.setProperty('align-items','center','important');
      el.style.setProperty('justify-content','center','important');
      el.style.setProperty('overflow','hidden','important');
      el.style.setProperty('border-radius','8px','important');
      el.style.setProperty('padding','0','important');
      var svgs=el.querySelectorAll('svg');
      for(var i=0;i<svgs.length;i++)svgs[i].style.setProperty('display','none','important');
      var old=el.querySelectorAll('img.si-img');
      for(var j=0;j<old.length;j++)old[j].remove();
      var img=document.createElement('img');
      img.className='si-img';img.alt='';img.src=uri;
      img.style.cssText='width:24px!important;height:24px!important;object-fit:contain!important;display:block!important;pointer-events:none!important;';
      el.appendChild(img);
      return true;
    }catch(e){return false;}
  }
  function isIconCandidate(el){
    if(!el||!el.getBoundingClientRect)return false;
    try{
      var r=el.getBoundingClientRect();
      if(r.width<10||r.width>64||r.height<10||r.height>64)return false;
      var st=window.getComputedStyle(el);
      var bg=st.backgroundColor||'';
      if(/rgb\(/.test(bg)&&bg!=='rgba(0, 0, 0, 0)'&&bg!=='transparent')return true;
      if(el.querySelector&&(el.querySelector('svg')||el.querySelector('img')))return true;
      if(el.tagName==='IMG'||el.tagName==='SVG'||el.tagName==='I')return true;
      var br=parseFloat(st.borderRadius)||0;
      if(br>=4&&r.width>=16&&r.width<=48)return true;
      return false;
    }catch(e){return false;}
  }
  function findIconNear(textEl){
    try{
      var row=textEl;
      for(var up=0;up<6&&row;up++){
        var kids=row.children||[];
        for(var i=0;i<kids.length;i++){
          if(kids[i]===textEl)continue;
          if(isIconCandidate(kids[i]))return kids[i];
          var nested=kids[i].querySelectorAll('div,span,i,svg,img');
          for(var j=0;j<Math.min(nested.length,12);j++){
            if(isIconCandidate(nested[j]))return nested[j];
          }
        }
        var prev=row.previousElementSibling;
        if(prev&&isIconCandidate(prev))return prev;
        if(prev){
          var pn=prev.querySelectorAll('div,span,i,svg,img');
          for(var k=0;k<pn.length;k++)if(isIconCandidate(pn[k]))return pn[k];
        }
        row=row.parentElement;
      }
    }catch(e){}
    return null;
  }
  function applyAll(){
    if(!isSettingsScreen())return;
    if(Object.keys(window.__TCHILO_SETTINGS_ICONS).length<1)return;
    var nodes=document.querySelectorAll('div,span,li,a,button,p,label');
    for(var i=0;i<nodes.length;i++){
      var n=nodes[i];
      if(n.children&&n.children.length>8)continue;
      if(n.closest&&(n.closest('video')||n.closest('[class*="feed"]')||n.closest('[class*="Feed"]')))continue;
      var text=(n.innerText||n.textContent||'').trim().split('\n')[0].trim();
      if(!text||text.length<2||text.length>56)continue;
      var key=keyForLabel(text);
      if(!key||!window.__TCHILO_SETTINGS_ICONS[key])continue;
      var host=findIconNear(n);
      if(host)paint(host,key);
    }
  }
  function injectCSS(){
    if(document.getElementById('si-v23-css'))return;
    var st=document.createElement('style');
    st.id='si-v23-css';
    st.textContent='.si-icon,.si-done{background:transparent!important;background-color:transparent!important;background-image:none!important;}.si-icon img,.si-done img{width:24px!important;height:24px!important;object-fit:contain!important;display:block!important;}.si-icon svg,.si-done svg{display:none!important;}';
    (document.head||document.documentElement).appendChild(st);
  }
  injectCSS();
  K.forEach(function(k){
    var s=document.createElement('script');
    s.src=B+k+'.js?v='+V;
    s.async=true;
    s.onload=function(){applyAll();};
    s.onerror=function(){try{console.warn('[Tchilo] icon fail',k);}catch(e){}};
    (document.head||document.documentElement).appendChild(s);
  });
  setTimeout(applyAll,600);
  setTimeout(applyAll,1500);
  setTimeout(applyAll,3000);
  setTimeout(applyAll,6000);
  if(!window.__TCHILO_SI_OBS23){
    window.__TCHILO_SI_OBS23=true;
    var timer=null;
    try{
      new MutationObserver(function(){
        clearTimeout(timer);
        timer=setTimeout(function(){if(isSettingsScreen())applyAll();},150);
      }).observe(document.documentElement,{childList:true,subtree:true});
    }catch(e){}
    var g=window.goTo;
    if(typeof g==='function'){
      window.goTo=function(){
        var r=g.apply(this,arguments);
        setTimeout(function(){if(isSettingsScreen())applyAll();},200);
        setTimeout(function(){if(isSettingsScreen())applyAll();},800);
        return r;
      };
    }
    window.addEventListener('hashchange',function(){setTimeout(applyAll,300);});
    window.addEventListener('popstate',function(){setTimeout(applyAll,300);});
  }
})();

(function(){
  'use strict';
  function add(src){
    try{
      var name=src.split('?')[0].split('/').pop();
      var existing=document.querySelector('script[src*="'+name+'"]');
      if(existing){
        var cur=existing.getAttribute('src')||'';
        if(cur===src)return;
        var oldV=(cur.match(/[?&]v=([^&]+)/)||[])[1];
        var newV=(src.match(/[?&]v=([^&]+)/)||[])[1];
        if(oldV&&newV&&oldV!==newV)existing.remove();
        else return;
      }
      var s=document.createElement('script');
      s.src=src;s.async=true;
      (document.body||document.documentElement).appendChild(s);
    }catch(e){}
  }
  function load(){
    add('native/tchilo-product-copy.js?v=2');
    add('native/tchilo-legal-links.js?v=1');
    add('native/tchilo-session-lock.js?v=1');
    add('native/tchilo-public-profile-bridge.js?v=1');
    add('native/tchilo-site-url-fix.js?v=1');
    add('native/tchilo-no-busy-select.js?v=1');
    add('native/tchilo-ui-stable.js?v=1');
    add('native/tchilo-hide-nav.js?v=3');
    add('native/tchilo-chat-composer.js?v=1');
    add('native/tchilo-password-reset.js?v=6');
    add('native/tchilo-router.js?v=3');
    add('native/tchilo-public-urls.js?v=1');
    add('native/tchilo-og-meta.js?v=1');
    add('native/tchilo-avatar-cloud.js?v=4');
    add('native/tchilo-avatar-viewer.js?v=1');
    add('native/tchilo-premium.js?v=1');
    add('native/paddle-premium.js?v=1');
    add('native/paddle-ad-guard.js?v=1');
    add('native/tchilo-theme-premium-gate.js?v=1');
    add('native/tchilo-verified.js?v=2');
    add('native/tchilo-reels-open-fix.js?v=6');
    add('native/tchilo-feed-video-ui.js?v=1');
    add('native/music-catalog-fix.js?v=1');
    add('native/tchilo-music-picker-fix.js?v=1');
    add('native/tchilo-music-sheet.js?v=1');
    add('native/tchilo-music-feed-fix.js?v=3');
    add('native/tchilo-publish-fix.js?v=5');
    add('native/tchilo-video-pick.js?v=6');
    add('native/tchilo-deeplink.js?v=2');
    add('native/tchilo-profile-share.js?v=10');
    add('native/tchilo-profile-boost.js?v=1');
    add('native/tchilo-ads-ui.js?v=5');
    add('native/tchilo-ads-force.js?v=2');
    add('native/tchilo-ads-pro.js?v=2');
    add('native/tchilo-create-buttons.js?v=4');
    add('native/tchilo-cloud-force.js?v=1');
    add('native/tchilo-name-sync.js?v=1');
    add('native/tchilo-cloud-hydrate.js?v=3');
    add('native/tchilo-feed-to-reels.js?v=2');
    add('native/tchilo-reels-icon.js?v=2');
    add('native/tchilo-share-target.js?v=1');
    add('native/nav-layout.js?v=2');
    add('native/tchilo-ui-icons-fix.js?v=3');
    add('native/reels-follow-fix.js?v=2');
    add('native/tchilo-profile-avatar-plus.js?v=1');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',load);
  else load();
  setTimeout(load,400);
  setTimeout(load,1200);
})();

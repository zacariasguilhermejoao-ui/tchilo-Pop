/** tchilo-Pop loaders v21 - settings icons inlined */
(function(){
  if(window.__TCHILO_SI_V20)return;
  window.__TCHILO_SI_V20=true;
  window.__TCHILO_SETTINGS_ICONS=window.__TCHILO_SETTINGS_ICONS||{};

  var B='https://raw.githubusercontent.com/zacariasguilhermejoao-ui/tchilo-Pop/main/native/settings-icons/';
  var B2='https://tchilopop.com/native/settings-icons/';
  var V='20';
  var K=['tema','legal','premium','suporte','idioma','avancado','anuncios','conta','guardados','notificacoes','privacidade','selo','stories'];

  function isSettingsScreen(){
    try{
      var h=(location.hash||'')+(location.pathname||'')+(location.href||'');
      h=h.toLowerCase();
      if(/settings|definicoes|definições|config|prefs|preferenc/.test(h))return true;
      var titles=document.querySelectorAll('h1,h2,[class*="title"],[class*="Title"],header');
      for(var i=0;i<titles.length;i++){
        var t=(titles[i].innerText||titles[i].textContent||'').toLowerCase();
        if(/defini|settings|configura/.test(t))return true;
      }
      var body=(document.body&&document.body.innerText)||'';
      var hits=0;
      if(/tchilo premium/i.test(body))hits++;
      if(/notifica/i.test(body))hits++;
      if(/privacidade/i.test(body))hits++;
      if(/idioma/i.test(body))hits++;
      if(/conta avan/i.test(body))hits++;
      return hits>=3;
    }catch(e){return false;}
  }

  function keyForLabel(t){
    if(!t)return null;
    t=(t+'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim();
    if(/premium|tchilo premium/.test(t))return 'premium';
    if(/suporte|support|ajuda|help/.test(t))return 'suporte';
    if(/tema|theme|aparencia|appearance/.test(t))return 'tema';
    if(/idioma|language|lingua/.test(t))return 'idioma';
    if(/^legal$|termos|terms/.test(t)&&!/privacidade/.test(t))return 'legal';
    if(/conta avancada|advanced|avancad/.test(t))return 'avancado';
    if(/gestor de anuncios|anuncios|ads manager|anuncio/.test(t))return 'anuncios';
    if(/^conta$|account/.test(t)&&!/avancad/.test(t))return 'conta';
    if(/guardados|saved|favoritos|bookmarks/.test(t))return 'guardados';
    if(/notificacoes|notifications|alertas/.test(t))return 'notificacoes';
    if(/privacidade|privacy|visibilidade/.test(t))return 'privacidade';
    if(/selo|verificado|verified|badge/.test(t))return 'selo';
    if(/^stories$|historias/.test(t))return 'stories';
    return null;
  }

  function paint(el,key){
    var uri=window.__TCHILO_SETTINGS_ICONS[key];
    if(!uri||uri.length<80)return false;
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
      for(var i=0;i<svgs.length;i++)svgs[i].style.display='none';
      var imgs=el.querySelectorAll('img.si-img');
      for(var j=0;j<imgs.length;j++)imgs[j].remove();
      var img=document.createElement('img');
      img.className='si-img';
      img.alt='';
      img.src=uri;
      img.style.cssText='width:24px!important;height:24px!important;object-fit:contain!important;display:block!important;pointer-events:none!important;';
      el.appendChild(img);
      return true;
    }catch(e){return false;}
  }

  function isIconCandidate(el){
    if(!el||!el.getBoundingClientRect)return false;
    try{
      var r=el.getBoundingClientRect();
      if(r.width<12||r.width>56||r.height<12||r.height>56)return false;
      var st=window.getComputedStyle(el);
      var bg=st.backgroundColor||'';
      if(/rgb\(/.test(bg)&&bg!=='rgba(0, 0, 0, 0)'&&bg!=='transparent')return true;
      if(el.querySelector&&(el.querySelector('svg')||el.querySelector('img')))return true;
      if(el.tagName==='IMG'||el.tagName==='SVG')return true;
      return false;
    }catch(e){return false;}
  }

  function findIconNear(textEl){
    try{
      var row=textEl;
      for(var up=0;up<5&&row;up++){
        var kids=row.children||[];
        for(var i=0;i<kids.length;i++){
          if(isIconCandidate(kids[i]))return kids[i];
          var nested=kids[i].querySelectorAll('div,span,i,svg,img');
          for(var j=0;j<nested.length;j++){
            if(isIconCandidate(nested[j]))return nested[j];
          }
        }
        var prev=row.previousElementSibling;
        if(prev&&isIconCandidate(prev))return prev;
        row=row.parentElement;
      }
      var p=textEl.parentElement;
      if(p){
        var all=p.querySelectorAll('div,span');
        for(var k=0;k<all.length;k++){
          if(isIconCandidate(all[k]))return all[k];
        }
      }
    }catch(e){}
    return null;
  }

  function applyAll(){
    if(!isSettingsScreen())return;
    var map=window.__TCHILO_SETTINGS_ICONS;
    if(!map||Object.keys(map).length<3)return;
    var nodes=document.querySelectorAll('div,span,li,a,button,p,label');
    for(var i=0;i<nodes.length;i++){
      var n=nodes[i];
      if(n.children&&n.children.length>6)continue;
      if(n.closest&&(n.closest('[class*="feed"]')||n.closest('[class*="Feed"]')||n.closest('video')||n.closest('[class*="post-"]')))continue;
      var text=(n.innerText||n.textContent||'').trim().split('\n')[0].trim();
      if(!text||text.length<2||text.length>48)continue;
      var key=keyForLabel(text);
      if(!key||!map[key])continue;
      var host=findIconNear(n);
      if(host)paint(host,key);
    }
  }

  function injectCSS(){
    if(document.getElementById('si-v20-css'))return;
    var st=document.createElement('style');
    st.id='si-v20-css';
    st.textContent='.si-icon,.si-done{background:transparent!important;background-color:transparent!important;background-image:none!important;}.si-icon img,.si-done img{width:24px!important;height:24px!important;object-fit:contain!important;display:block!important;}.si-icon svg,.si-done svg{display:none!important;}';
    (document.head||document.documentElement).appendChild(st);
  }

  var loaded=0;
  function onReady(){
    loaded++;
    if(loaded<K.length)return;
    injectCSS();
    applyAll();
    if(!window.__TCHILO_SI_OBS){
      window.__TCHILO_SI_OBS=true;
      var timer=null;
      try{
        new MutationObserver(function(){
          if(!isSettingsScreen())return;
          clearTimeout(timer);
          timer=setTimeout(applyAll,120);
        }).observe(document.documentElement,{childList:true,subtree:true});
      }catch(e){}
      var g=window.goTo;
      if(typeof g==='function'){
        window.goTo=function(){
          var r=g.apply(this,arguments);
          setTimeout(function(){if(isSettingsScreen())applyAll();},100);
          setTimeout(function(){if(isSettingsScreen())applyAll();},500);
          return r;
        };
      }
      window.addEventListener('hashchange',function(){setTimeout(applyAll,200);});
      window.addEventListener('popstate',function(){setTimeout(applyAll,200);});
    }
  }

  function loadOne(k){
    var s=document.createElement('script');
    s.src=B+k+'.js?v='+V;
    s.async=true;
    s.onload=onReady;
    s.onerror=function(){
      var s2=document.createElement('script');
      s2.src=B2+k+'.js?v='+V;
      s2.async=true;
      s2.onload=onReady;s2.onerror=onReady;
      (document.head||document.documentElement).appendChild(s2);
    };
    (document.head||document.documentElement).appendChild(s);
  }

  K.forEach(loadOne);
  setTimeout(applyAll,800);
  setTimeout(applyAll,2000);
  setTimeout(applyAll,4000);
})();
(function () {
  'use strict';
  function add(src) {
    try {
      var name = src.split('?')[0].split('/').pop();
      var existing = document.querySelector('script[src*="' + name + '"]');
      if (existing) {
        var cur = existing.getAttribute('src') || '';
        if (cur === src) return;
        else if (cur.split('?')[0].split('/').pop() === name) {
          var oldV = (cur.match(/[?&]v=([^&]+)/) || [])[1];
          var newV = (src.match(/[?&]v=([^&]+)/) || [])[1];
          if (oldV && newV && oldV !== newV) existing.remove();
          else return;
        } else return;
      }
      var s = document.createElement('script');
      s.src = src;
      s.async = true;
      (document.body || document.documentElement).appendChild(s);
    } catch (e) {}
  }
  function load() {
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
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', load);
  else load();
  setTimeout(load, 400);
  setTimeout(load, 1200);
})();

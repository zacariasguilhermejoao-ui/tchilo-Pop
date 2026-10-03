(function(){
  if(window.__TCHILO_SI_V11)return;
  window.__TCHILO_SI_V11=true;
  window.__TCHILO_SETTINGS_ICONS=window.__TCHILO_SETTINGS_ICONS||{};
  var B='https://tchilopop.com/native/settings-icons/';
  var V='11';
  var K=['tema','legal','premium','suporte','idioma','avancado','anuncios','conta','guardados','notificacoes','privacidade','selo','stories'];
  function keyForLabel(t){
    if(!t)return null;
    t=(t+'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim();
    if(/premium|tchilo premium/.test(t))return 'premium';
    if(/suporte|support|ajuda|help/.test(t))return 'suporte';
    if(/tema|theme|aparencia|appearance/.test(t))return 'tema';
    if(/idioma|language|lingua/.test(t))return 'idioma';
    if(/legal|termos|terms/.test(t)&&!/privacidade/.test(t))return 'legal';
    if(/conta avancada|advanced|avancad/.test(t))return 'avancado';
    if(/gestor de anuncios|anuncios|ads manager|anuncio/.test(t))return 'anuncios';
    if(/\bconta\b|account/.test(t)&&!/avancad/.test(t))return 'conta';
    if(/guardados|saved|favoritos|bookmarks/.test(t))return 'guardados';
    if(/notificacoes|notifications|alertas/.test(t))return 'notificacoes';
    if(/privacidade|privacy|visibilidade/.test(t))return 'privacidade';
    if(/selo|verificado|verified|badge/.test(t))return 'selo';
    if(/stories|historias/.test(t))return 'stories';
    return null;
  }
  function paint(el,key){
    var uri=window.__TCHILO_SETTINGS_ICONS[key];
    if(!uri||uri.length<80)return false;
    try{
      el.classList.add('si-icon','si-done');
      el.style.cssText='display:inline-flex!important;align-items:center!important;justify-content:center!important;width:28px!important;height:28px!important;min-width:28px!important;min-height:28px!important;border-radius:8px!important;overflow:hidden!important;background:transparent!important;background-color:transparent!important;background-image:none!important;padding:0!important;margin:0!important;flex-shrink:0!important;';
      while(el.firstChild)el.removeChild(el.firstChild);
      var img=document.createElement('img');
      img.src=uri;img.alt='';img.width=24;img.height=24;
      img.style.cssText='width:24px!important;height:24px!important;object-fit:contain!important;display:block!important;pointer-events:none!important;';
      el.appendChild(img);
      return true;
    }catch(e){return false;}
  }
  function isIconBox(el){
    if(!el||el.nodeType!==1)return false;
    if(el.classList&&el.classList.contains('si-done'))return false;
    var r=el.getBoundingClientRect?el.getBoundingClientRect():null;
    if(r&&(r.width<14||r.width>48||r.height<14||r.height>48))return false;
    var tag=(el.tagName||'').toLowerCase();
    if(tag==='svg'||tag==='img')return true;
    if(tag==='span'||tag==='div'||tag==='i'){
      var st=window.getComputedStyle?getComputedStyle(el):null;
      if(st){
        var bg=st.backgroundColor||'';
        if(bg&&bg!=='rgba(0, 0, 0, 0)'&&bg!=='transparent')return true;
        if((st.borderRadius||'').indexOf('px')>=0&&r&&r.width>=18&&r.width<=40)return true;
      }
      if(el.children&&el.children.length===0)return true;
    }
    return false;
  }
  function findIconNear(textNode){
    var row=textNode;
    for(var up=0;up<6&&row;up++){
      var kids=row.children?Array.prototype.slice.call(row.children):[];
      for(var i=0;i<kids.length;i++){
        if(isIconBox(kids[i]))return kids[i];
        var nested=kids[i].querySelector&&kids[i].querySelector('svg,img,span,div,i');
        if(nested&&isIconBox(nested))return nested;
      }
      var prev=row.previousElementSibling;
      if(prev&&isIconBox(prev))return prev;
      if(prev){
        var p2=prev.querySelector&&prev.querySelector('svg,img,span,div,i');
        if(p2&&isIconBox(p2))return p2;
      }
      row=row.parentElement;
    }
    return null;
  }
  function applyAll(){
    var map=window.__TCHILO_SETTINGS_ICONS;
    if(!map||Object.keys(map).length<3)return;
    var nodes=document.querySelectorAll('div,span,li,a,button,p,label');
    for(var i=0;i<nodes.length;i++){
      var n=nodes[i];
      if(n.children&&n.children.length>8)continue;
      var text=(n.innerText||n.textContent||'').trim().split('\n')[0].trim();
      if(!text||text.length<2||text.length>55)continue;
      var key=keyForLabel(text);
      if(!key||!map[key])continue;
      var host=findIconNear(n);
      if(host)paint(host,key);
    }
  }
  function injectCSS(){
    if(document.getElementById('si-v11-css'))return;
    var st=document.createElement('style');
    st.id='si-v11-css';
    st.textContent='.si-icon,.si-done{background:transparent!important;background-color:transparent!important;background-image:none!important;}.si-icon img,.si-done img{width:24px!important;height:24px!important;object-fit:contain!important;display:block!important;}.si-icon svg,.si-done svg{display:none!important;}';
    (document.head||document.documentElement).appendChild(st);
  }
  var loaded=0;
  function onOne(){
    loaded++;
    if(loaded>=K.length){
      injectCSS();
      applyAll();
      if(!window.__TCHILO_SI_OBS){
        window.__TCHILO_SI_OBS=true;
        try{new MutationObserver(function(){applyAll();}).observe(document.documentElement,{childList:true,subtree:true});}catch(e){}
        var g=window.goTo;
        if(typeof g==='function'){
          window.goTo=function(){var r=g.apply(this,arguments);setTimeout(applyAll,80);setTimeout(applyAll,400);return r;};
        }
      }
    }
  }
  K.forEach(function(k){
    var s=document.createElement('script');
    s.src=B+k+'.js?v='+V;
    s.async=true;
    s.onload=onOne;s.onerror=onOne;
    (document.head||document.documentElement).appendChild(s);
  });
  setTimeout(applyAll,600);
  setTimeout(applyAll,1500);
  setTimeout(applyAll,3000);
})();

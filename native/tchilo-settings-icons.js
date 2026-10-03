(function(){
  if(window.__TCHILO_SI_V10)return;
  window.__TCHILO_SI_V10=true;
  window.__TCHILO_SETTINGS_ICONS=window.__TCHILO_SETTINGS_ICONS||{};
  var B='https://zacariasguilhermejoao-ui.github.io/tchilo-Pop/native/settings-icons/';
  var V='10';
  var K=['tema','legal','premium','suporte','idioma','avancado','anuncios','conta','guardados','notificacoes','privacidade','selo','stories'];
  function keyForLabel(t){
    if(!t)return null;
    t=(t+'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim();
    if(/premium|tchilo premium/.test(t))return 'premium';
    if(/suporte|support|ajuda|help/.test(t))return 'suporte';
    if(/tema|theme|aparencia|appearance/.test(t))return 'tema';
    if(/idioma|language|lingua/.test(t))return 'idioma';
    if(/legal|termos|terms/.test(t)&&!/privacidade$/.test(t))return 'legal';
    if(/conta avancada|advanced|avancad/.test(t))return 'avancado';
    if(/gestor de anuncios|anuncios|ads manager/.test(t))return 'anuncios';
    if(/\bconta\b|account/.test(t)&&!/avancad/.test(t))return 'conta';
    if(/guardados|saved|favoritos|bookmarks/.test(t))return 'guardados';
    if(/notificacoes|notifications|alertas/.test(t))return 'notificacoes';
    if(/privacidade|privacy/.test(t))return 'privacidade';
    if(/selo|verificado|verified|badge/.test(t))return 'selo';
    if(/stories|historias/.test(t))return 'stories';
    return null;
  }
  function applyIcon(el,key){
    var uri=window.__TCHILO_SETTINGS_ICONS[key];
    if(!uri||uri.length<100)return false;
    while(el.firstChild)el.removeChild(el.firstChild);
    el.classList.add('si-icon');
    el.style.cssText='display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;min-width:24px;min-height:24px;overflow:hidden;background:transparent!important;';
    var img=document.createElement('img');
    img.src=uri;img.alt='';img.width=24;img.height=24;
    img.style.cssText='width:24px;height:24px;object-fit:contain;display:block;pointer-events:none;';
    el.appendChild(img);return true;
  }
  function findHost(row){
    var s=row.querySelector('svg');if(s)return s.parentElement||s;
    var i=row.querySelector('img');if(i)return i.parentElement||i;
    return row.children[0]||null;
  }
  function applyAll(){
    var map=window.__TCHILO_SETTINGS_ICONS;
    if(!map||Object.keys(map).length<3)return;
    var nodes=document.querySelectorAll('div,span,li,a,button,p');
    for(var i=0;i<nodes.length;i++){
      var n=nodes[i];if(n.children.length>5)continue;
      var text=(n.innerText||n.textContent||'').trim().split('\n')[0];
      if(!text||text.length<2||text.length>50)continue;
      var key=keyForLabel(text);if(!key||!map[key])continue;
      var host=findHost(n);
      if(host&&!host.classList.contains('si-done')){if(applyIcon(host,key))host.classList.add('si-done');}
      var prev=n.previousElementSibling;
      if(prev&&!prev.classList.contains('si-done')&&prev.children.length<=2){if(applyIcon(prev,key))prev.classList.add('si-done');}
    }
  }
  function injectCSS(){
    if(document.getElementById('si-v10-css'))return;
    var st=document.createElement('style');st.id='si-v10-css';
    st.textContent='.si-icon img{width:24px!important;height:24px!important;object-fit:contain!important;display:block!important;}.si-icon svg{display:none!important;}';
    (document.head||document.documentElement).appendChild(st);
  }
  var loaded=0;
  function onOne(){loaded++;if(loaded>=K.length){injectCSS();applyAll();
    if(!window.__TCHILO_SI_OBS){window.__TCHILO_SI_OBS=true;
      try{new MutationObserver(function(){applyAll();}).observe(document.documentElement,{childList:true,subtree:true});}catch(e){}
      var g=window.goTo;if(typeof g==='function'){window.goTo=function(){var r=g.apply(this,arguments);setTimeout(applyAll,50);setTimeout(applyAll,300);return r;};}
    }
  }}
  K.forEach(function(k){var s=document.createElement('script');s.src=B+k+'.js?v='+V;s.async=true;s.onload=onOne;s.onerror=onOne;(document.head||document.documentElement).appendChild(s);});
  setTimeout(applyAll,800);setTimeout(applyAll,2000);
})();

/**
 * Tchilo compose music UI overlay v6 — runtime fix
 */
(function () {
  if (window.__TCHILO_COMPOSE_MUSIC_V6) return;
  window.__TCHILO_COMPOSE_MUSIC_V6 = true;

  function inject() {
    if (document.getElementById('tchilo-compose-v6-css')) return;
    var st = document.createElement('style');
    st.id = 'tchilo-compose-v6-css';
    st.textContent = [
      '#tchiloMediaPicker .mp-music-chip{display:none!important;}',
      '#tchiloMediaPicker .mp-caption-bar:not(.open){display:none!important;}',
      '#tchiloMediaPicker .mp-caption-bar.open{display:block!important;}',
      '#tchiloMediaPicker .mp-side button{background:#fff!important;color:#0B0B0C!important;box-shadow:0 2px 10px rgba(0,0,0,.18)!important;backdrop-filter:none!important;}',
      '#tchiloMediaPicker .mp-side button svg{stroke:#0B0B0C!important;}',
      '#tchiloMediaPicker .mp-music-float{position:absolute;top:12px;left:50%;transform:translateX(-50%);z-index:6;',
      'display:flex;align-items:center;gap:8px;max-width:min(86%,320px);padding:8px 12px;border-radius:999px;',
      'background:rgba(0,0,0,.55);backdrop-filter:blur(12px);color:#fff;cursor:pointer;}',
      '#tchiloMediaPicker .mp-music-float-title{font:600 13px system-ui,sans-serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:180px;}',
      '#tchiloMediaPicker .mp-eq{display:flex;align-items:flex-end;gap:2px;height:14px;}',
      '#tchiloMediaPicker .mp-eq i{width:3px;background:#fff;border-radius:1px;animation:mpEqV6 .9s ease-in-out infinite;transform-origin:bottom;}',
      '#tchiloMediaPicker .mp-eq i:nth-child(1){height:6px;}#tchiloMediaPicker .mp-eq i:nth-child(2){height:12px;animation-delay:.15s;}',
      '#tchiloMediaPicker .mp-eq i:nth-child(3){height:8px;animation-delay:.3s;}#tchiloMediaPicker .mp-eq i:nth-child(4){height:14px;animation-delay:.45s;}',
      '@keyframes mpEqV6{0%,100%{transform:scaleY(.4)}50%{transform:scaleY(1)}}',
      '#tchiloMediaPicker .mp-music-float.paused .mp-eq i{animation:none;opacity:.45;}',
      '#tchiloMediaPicker .mp-music-float .mp-music-x{border:0!important;background:transparent!important;color:#fff!important;',
      'padding:0!important;width:22px!important;height:22px!important;border-radius:0!important;font:700 16px/1 system-ui,sans-serif;cursor:pointer;}'
    ].join('');
    (document.head || document.documentElement).appendChild(st);
  }

  var composeAudio = null;
  function stopA(){if(composeAudio){try{composeAudio.pause()}catch(e){}composeAudio=null}}
  function playA(url){
    stopA(); if(!url) return;
    try{
      composeAudio = new Audio(url); composeAudio.loop=true; composeAudio.volume=.9; composeAudio.preload='auto';
      var chip=document.getElementById('mpMusicFloatV6');
      function mark(ok){ if(!chip) return; chip.classList.toggle('paused', !ok); }
      composeAudio.onplaying=function(){mark(true)}; composeAudio.onpause=function(){mark(false)};
      function tryPlay(){ if(!composeAudio) return; var p=composeAudio.play(); if(p&&p.then) p.then(function(){mark(true)}).catch(function(){mark(false)}); }
      tryPlay(); setTimeout(tryPlay,150); setTimeout(tryPlay,500); setTimeout(tryPlay,1000);
    }catch(e){}
  }

  function ensureFloat(root){
    var body = root.querySelector('.mp-compose-body') || root.querySelector('#mpStepCompose');
    if(!body) return null;
    var el = document.getElementById('mpMusicFloatV6');
    if(el) return el;
    el = document.createElement('div');
    el.id = 'mpMusicFloatV6';
    el.className = 'mp-music-float';
    el.style.display = 'none';
    el.innerHTML = '<span class="mp-eq"><i></i><i></i><i></i><i></i></span><span class="mp-music-float-title" id="mpMusicFloatTitle">Música</span><button type="button" class="mp-music-x" id="mpMusicFloatX" aria-label="Remover">✕</button>';
    body.appendChild(el);
    el.addEventListener('click', function(e){
      if(e.target.closest('#mpMusicFloatX')) return;
      e.preventDefault(); e.stopPropagation();
      try{ if(typeof window.tchiloOpenCreateMusic==='function') window.tchiloOpenCreateMusic(); else if(typeof window.tchiloOpenPostMusic==='function') window.tchiloOpenPostMusic(); }catch(err){}
    });
    document.getElementById('mpMusicFloatX').addEventListener('click', function(e){
      e.preventDefault(); e.stopPropagation();
      stopA(); el.style.display='none'; el.classList.add('paused');
      try{ window._pendingMusicMeta=null; window._pendingMusic=null; }catch(err){}
    });
    return el;
  }

  function ensureAa(root){
    var side = root.querySelector('.mp-side');
    if(!side || side.querySelector('[data-a="caption"]')) return;
    var btn = document.createElement('button');
    btn.type='button'; btn.setAttribute('data-a','caption'); btn.title='Texto';
    btn.innerHTML='<span class="mp-aa" style="font:800 15px/1 system-ui,sans-serif;color:#0B0B0C">Aa</span>';
    side.appendChild(btn);
    btn.addEventListener('click', function(e){
      e.preventDefault(); e.stopPropagation();
      var bar = root.querySelector('#mpCaptionBar') || root.querySelector('.mp-caption-bar');
      if(!bar) return;
      var open = bar.classList.toggle('open');
      bar.style.display = open ? 'block' : 'none';
      if(open){ var ta=bar.querySelector('textarea'); if(ta) setTimeout(function(){try{ta.focus()}catch(x){}},40); }
    });
  }

  function showMusic(meta){
    var root = document.getElementById('tchiloMediaPicker');
    if(!root) return;
    inject();
    var el = ensureFloat(root);
    ensureAa(root);
    if(!el || !meta) return;
    el.style.display='flex';
    el.classList.remove('paused');
    var ti=document.getElementById('mpMusicFloatTitle');
    if(ti) ti.textContent = meta.title || 'Música';
    if(meta.preview) playA(meta.preview);
  }

  function onMusic(ev){
    var d=(ev&&ev.detail)||{};
    var meta=d.meta||window._pendingMusicMeta;
    if(meta) showMusic(meta);
  }

  function watchCompose(){
    var root = document.getElementById('tchiloMediaPicker');
    if(!root || !root.classList.contains('open')) return;
    inject();
    ensureFloat(root);
    ensureAa(root);
    root.querySelectorAll('.mp-music-chip').forEach(function(el){ el.style.display='none'; });
    root.querySelectorAll('.mp-caption-bar').forEach(function(bar){
      if(!bar.classList.contains('open')) bar.style.display='none';
    });
    root.querySelectorAll('.mp-side button').forEach(function(b){
      b.style.background='#fff'; b.style.boxShadow='0 2px 10px rgba(0,0,0,.18)';
    });
    var meta = window._pendingMusicMeta;
    if(meta && meta.preview){
      var step = root.querySelector('#mpStepCompose.on, #mpStepStory.on');
      if(step) showMusic(meta);
    }
  }

  window.addEventListener('tchilo-music-selected', onMusic);
  document.addEventListener('touchstart', function(){ if(composeAudio&&composeAudio.paused&&window._pendingMusicMeta) playA(window._pendingMusicMeta.preview); }, {passive:true});
  setInterval(watchCompose, 400);
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', function(){ inject(); watchCompose(); });
  else { inject(); watchCompose(); }
})();

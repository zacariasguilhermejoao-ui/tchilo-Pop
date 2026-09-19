(function(){try{if(!document.querySelector('script[data-tchilo-open-cam-now]')){var s=document.createElement('script');s.src='native/open-cam-now.js?v=3';s.setAttribute('data-tchilo-open-cam-now','1');(document.head||document.documentElement).appendChild(s);}}catch(e){}})();
/** tchilo-Pop camera + 4 acessórios (ícones + overlay na cara) */
(function(){
'use strict';
var HOLD_MS=280,stream=null,mediaRecorder=null,recordedChunks=[],recording=false,holdTimer=null,pressStart=0,facingMode='user',flashOn=false,fxIndex=0,imgs={},landmarker=null,lmReady=false,lmFailed=false,lastLm=null,lastDetect=0,loopOn=false;
var ICON_FLASH='<svg viewBox="0 0 24 24" width="22" height="22" fill="none"><path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" fill="currentColor" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/></svg>';
var ICON_FLASH_OFF='<svg viewBox="0 0 24 24" width="22" height="22" fill="none"><path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" fill="currentColor" opacity=".45"/><path d="M4 4l16 16" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>';
var ICON_FLIP='<svg viewBox="0 0 24 24" width="22" height="22" fill="none"><path d="M16 3l4 4-4 4" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M20 7H9a5 5 0 000 10h2" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><path d="M8 21l-4-4 4-4" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 17h11a5 5 0 000-10h-2" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>';
var ICON_CLOSE='<svg viewBox="0 0 24 24" width="20" height="20" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>';

/* Só os 4 acessórios novos */
var FX=[
  {id:'none',label:'Normal',file:null},
  {label:'Óculos estrela',file:'oculos-estrela-rosa.png',anchor:'eyes',scale:2.5,oy:0},
  {label:'Cat-eye prata',file:'oculos-cat-eye-prata.png',anchor:'eyes',scale:2.45,oy:0},
  {label:'Chifres pretos',file:'chifres-pretos.png',anchor:'forehead',scale:1.55,oy:-0.32},
  {label:'Corrente ouro',file:'colar-corrente-dourado.png',anchor:'neck',scale:1.35,oy:0.12}
];

function asset(file){var A=window.TchiloFxPngAssets||{};return A[file]||null;}
function loadImgs(){FX.forEach(function(fx){if(!fx.file||imgs[fx.file])return;var src=asset(fx.file);if(!src)return;var im=new Image();im.onload=function(){imgs[fx.file]=im;};im.src=src;});}

function hideGal(){if(!document.getElementById('tchiloHideGal2')){var st=document.createElement('style');st.id='tchiloHideGal2';st.textContent='#galleryBtn,#faceFxOpenBtn{display:none!important;}#screen-create .gallery-btn:not(#tchiloOpenCamBtn):not(.tchilo-keep):not(#removeMediaBtn){display:none!important;}#tchiloFaceFx{display:none!important;visibility:hidden!important;pointer-events:none!important;}';document.head.appendChild(st);}}

function ensureUI(){var existing=document.getElementById('tchiloCam');if(existing){var f=document.getElementById('tchiloCamFlash'),flip=document.getElementById('tchiloCamFlip'),flipTop=document.getElementById('tchiloCamFlipTop'),close=document.getElementById('tchiloCamClose');if(f&&!f.querySelector('svg')){f.innerHTML=flashOn?ICON_FLASH:ICON_FLASH_OFF;}if(flip&&!flip.querySelector('svg'))flip.innerHTML=ICON_FLIP;if(flipTop&&!flipTop.querySelector('svg'))flipTop.innerHTML=ICON_FLIP;if(close&&!close.querySelector('svg'))close.innerHTML=ICON_CLOSE;buildChips();return;}
var root=document.createElement('div');root.id='tchiloCam';root.innerHTML='<style>#tchiloCam{display:none;position:fixed;inset:0;z-index:99999;background:#000;flex-direction:column;font-family:system-ui,sans-serif;}#tchiloCam.open{display:flex!important;}#tchiloCam .stage{position:relative;flex:1;min-height:0;overflow:hidden;background:#111;}#tchiloCam video,#tchiloCam canvas{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;}#tchiloCam video{transform:scaleX(-1);z-index:0;}#tchiloCam.cam-env video{transform:none;}#tchiloCam canvas{z-index:2;pointer-events:none;}#tchiloCam .top{position:absolute;top:0;left:0;right:0;z-index:5;padding:calc(12px + env(safe-area-inset-top)) 14px 8px;display:flex;justify-content:space-between;align-items:center;gap:10px;}#tchiloCam .icon{width:44px;height:44px;border:0;border-radius:50%;background:rgba(0,0,0,.45);color:#fff;display:inline-flex;align-items:center;justify-content:center;padding:0;cursor:pointer;}#tchiloCam .icon svg{display:block;pointer-events:none;}#tchiloCam .icon.on{background:rgba(200,245,96,.95);color:#111;}#tchiloCam .bot{position:absolute;bottom:0;left:0;right:0;z-index:5;padding:8px 0 calc(20px + env(safe-area-inset-bottom));background:linear-gradient(0deg,rgba(0,0,0,.8),transparent);display:flex;flex-direction:column;align-items:center;gap:10px;}#tchiloCam .track{display:flex;align-items:center;gap:10px;width:100%;padding:0 36%;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none;height:80px;}#tchiloCam .track::-webkit-scrollbar{display:none;}#tchiloCam .chip{flex:0 0 64px;width:64px;height:64px;border-radius:50%;border:2.5px solid rgba(255,255,255,.4);background:rgba(0,0,0,.45);overflow:hidden;padding:0;scroll-snap-align:center;opacity:.75;cursor:pointer;color:#fff;font-size:10px;font-weight:800;}#tchiloCam .chip.active{opacity:1;border-color:#c8f560;transform:scale(1.1);}#tchiloCam .chip img{width:100%;height:100%;object-fit:contain;display:block;background:rgba(255,255,255,.08);}#tchiloCam .chip.none{font-size:11px;}#tchiloCam .acts{display:flex;align-items:center;justify-content:center;gap:28px;}#tchiloCam .shut{width:76px;height:76px;border-radius:50%;border:5px solid #fff;background:#fff;position:relative;touch-action:none;}#tchiloCam.recording .shut{background:#ff3b5c;border-color:#ff3b5c;}#tchiloCam .shut::after{content:"";position:absolute;inset:6px;border-radius:50%;background:#fff;}#tchiloCam.recording .shut::after{inset:18px;border-radius:6px;}#tchiloCam .flip{width:48px;height:48px;border-radius:50%;border:0;background:rgba(0,0,0,.45);color:#fff;display:inline-flex;align-items:center;justify-content:center;padding:0;cursor:pointer;}#tchiloCam .flip svg{display:block;pointer-events:none;}#tchiloCam .hint{color:rgba(255,255,255,.9);font-size:12px;font-weight:600;text-align:center;padding:0 12px;}</style><div class="stage"><video id="tchiloCamVideo" playsinline muted autoplay></video><canvas id="tchiloCamCanvas"></canvas><div class="top"><button type="button" class="icon" id="tchiloCamClose" aria-label="Fechar">'+ICON_CLOSE+'</button><div style="display:flex;gap:10px;"><button type="button" class="icon" id="tchiloCamFlash" aria-label="Flash">'+ICON_FLASH_OFF+'</button><button type="button" class="icon" id="tchiloCamFlipTop" aria-label="Inverter">'+ICON_FLIP+'</button></div></div></div><div class="bot"><div class="hint" id="tchiloCamHint">Toque foto · Mantém vídeo · Escolhe efeito</div><div class="track" id="tchiloCamFxTrack"></div><div class="acts"><div style="width:48px"></div><button type="button" class="shut" id="tchiloCamShutter" aria-label="Capturar"></button><button type="button" class="flip" id="tchiloCamFlip" aria-label="Inverter">'+ICON_FLIP+'</button></div></div>';
document.body.appendChild(root);
document.getElementById('tchiloCamClose').onclick=function(e){e.preventDefault();closeCam();};
document.getElementById('tchiloCamFlip').onclick=function(e){e.preventDefault();flipCam();};
document.getElementById('tchiloCamFlipTop').onclick=function(e){e.preventDefault();flipCam();};
document.getElementById('tchiloCamFlash').onclick=function(e){e.preventDefault();toggleFlash();};
bindShutter();buildChips();}

function updateFlashBtn(){var btn=document.getElementById('tchiloCamFlash');if(!btn)return;btn.innerHTML=flashOn?ICON_FLASH:ICON_FLASH_OFF;btn.classList.toggle('on',flashOn);}
function toggleFlash(){flashOn=!flashOn;updateFlashBtn();applyTorch();}
function applyTorch(){if(!stream)return;var track=stream.getVideoTracks()[0];if(!track)return;try{var caps=track.getCapabilities?track.getCapabilities():{};if(caps&&caps.torch){track.applyConstraints({advanced:[{torch:flashOn}]}).catch(function(){});}else if(flashOn){setHint('Flash nao disponivel nesta camera');setTimeout(function(){setHint('Toque foto · Mantém vídeo · Escolhe efeito');},1800);}}catch(e){}}

function buildChips(){var track=document.getElementById('tchiloCamFxTrack');if(!track)return;loadImgs();track.innerHTML='';FX.forEach(function(fx,i){var b=document.createElement('button');b.type='button';b.className='chip'+(i===fxIndex?' active':'')+(!fx.file?' none':'');b.title=fx.label;if(fx.file){var src=asset(fx.file);if(src){var img=document.createElement('img');img.src=src;img.alt=fx.label;b.appendChild(img);}else b.textContent=(fx.label||'').slice(0,8);}else b.textContent='Normal';b.onclick=function(){fxIndex=i;lastLm=null;track.querySelectorAll('.chip').forEach(function(c,j){c.classList.toggle('active',j===i);});if(i>0&&!lmReady&&!lmFailed)setHint('A carregar deteccao facial…');else if(i>0&&lmFailed)setHint('Deteccao facial indisponivel');else if(i>0)setHint('Efeito: '+fx.label);else setHint('Toque foto · Mantém vídeo · Escolhe efeito');};track.appendChild(b);});}

function bindShutter(){var btn=document.getElementById('tchiloCamShutter');if(!btn||btn.__b)return;btn.__b=true;btn.addEventListener('pointerdown',function(e){e.preventDefault();pressStart=Date.now();holdTimer=setTimeout(startRec,HOLD_MS);});btn.addEventListener('pointerup',function(e){e.preventDefault();clearTimeout(holdTimer);if(recording)stopRec();else if(Date.now()-pressStart<HOLD_MS+80)takePhoto();});btn.addEventListener('pointercancel',function(){clearTimeout(holdTimer);if(recording)stopRec();});}

function pt(L,i,w,h){var p=L[i];if(!p)return{x:w/2,y:h/2};return{x:p.x*w,y:p.y*h};}
function dist(a,b){return Math.hypot(a.x-b.x,a.y-b.y);}

function drawFx(ctx,landmarks,w,h){
  var fx=FX[fxIndex];
  if(!fx||!fx.file||!landmarks||!landmarks.length)return;
  var im=imgs[fx.file];
  if(!im||!im.complete||!im.naturalWidth){
    var src=asset(fx.file);
    if(src&&!imgs[fx.file]){var ni=new Image();ni.onload=function(){imgs[fx.file]=ni;};ni.src=src;}
    return;
  }
  var L=landmarks[0];
  var left=pt(L,33,w,h),right=pt(L,263,w,h),top=pt(L,10,w,h),chin=pt(L,152,w,h);
  var cheekL=pt(L,234,w,h),cheekR=pt(L,454,w,h);
  var eyeW=dist(left,right)||1;
  var faceW=dist(cheekL,cheekR)||eyeW*2.1;
  var faceH=dist(top,chin)||faceW*1.25;
  var angle=Math.atan2(right.y-left.y,right.x-left.x);
  var midEyes={x:(left.x+right.x)/2,y:(left.y+right.y)/2};
  var faceCenter={x:(cheekL.x+cheekR.x)/2,y:(top.y+chin.y)/2};
  var cx=midEyes.x,cy=midEyes.y,tw=faceW*(fx.scale||2);
  if(fx.anchor==='forehead'){
    cx=top.x; cy=top.y+faceH*(fx.oy||-0.28); tw=faceW*(fx.scale||1.5);
  } else if(fx.anchor==='neck'){
    cx=chin.x; cy=chin.y+faceH*(fx.oy||0.1); tw=faceW*(fx.scale||1.3);
  } else if(fx.anchor==='face'){
    cx=faceCenter.x; cy=faceCenter.y+faceH*(fx.oy||0); tw=faceW*(fx.scale||1.85);
  } else {
    cy=midEyes.y+faceW*(fx.oy||0); tw=eyeW*(fx.scale||2.4);
  }
  var th=tw*(im.naturalHeight/Math.max(1,im.naturalWidth));
  ctx.save();
  ctx.translate(cx,cy);
  ctx.rotate(angle);
  ctx.drawImage(im,-tw/2,-th/2,tw,th);
  ctx.restore();
}

async function ensureLm(){
  if(landmarker){lmReady=true;return landmarker;}
  if(lmFailed)return null;
  try{
    var vision=await import('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/+esm');
    var fileset=await vision.FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm');
    var opts={baseOptions:{modelAssetPath:'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',delegate:'GPU'},runningMode:'VIDEO',numFaces:1};
    try{landmarker=await vision.FaceLandmarker.createFromOptions(fileset,opts);}
    catch(e){opts.baseOptions.delegate='CPU';landmarker=await vision.FaceLandmarker.createFromOptions(fileset,opts);}
    lmReady=true;lmFailed=false;
    setHint('Efeitos prontos · Escolhe um');
  }catch(e2){
    console.warn('[tchilo-cam] landmarker',e2);
    lmFailed=true;
    setHint('Sem deteccao facial (rede/modelo)');
  }
  return landmarker;
}

function paintLoop(){
  if(!loopOn)return;
  requestAnimationFrame(paintLoop);
  var root=document.getElementById('tchiloCam');
  if(!root||!root.classList.contains('open'))return;
  var video=document.getElementById('tchiloCamVideo'),canvas=document.getElementById('tchiloCamCanvas');
  if(!video||!canvas||video.readyState<2)return;
  var w=video.videoWidth||640,h=video.videoHeight||480;
  if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
  var ctx=canvas.getContext('2d');
  ctx.clearRect(0,0,w,h);
  if(fxIndex===0)return;
  var now=performance.now();
  if(landmarker&&now-lastDetect>25){
    lastDetect=now;
    try{
      var res=landmarker.detectForVideo(video,now);
      if(res&&res.faceLandmarks&&res.faceLandmarks.length)lastLm=res.faceLandmarks;
    }catch(e){}
  }
  if(!lastLm)return;
  ctx.save();
  if(facingMode==='user'){ctx.translate(w,0);ctx.scale(-1,1);}
  drawFx(ctx,lastLm,w,h);
  ctx.restore();
}

async function startCamera(){
  stopStream();
  var video=document.getElementById('tchiloCamVideo');
  if(!video)return;
  setHint('A abrir camera…');
  flashOn=false;updateFlashBtn();
  try{
    stream=await navigator.mediaDevices.getUserMedia({audio:true,video:{facingMode:{ideal:facingMode},width:{ideal:1280},height:{ideal:720}}});
  }catch(e1){
    try{stream=await navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:{ideal:facingMode}}});}
    catch(e2){setHint('Permite a camera nas definicoes');return;}
  }
  video.srcObject=stream;video.muted=true;
  video.setAttribute('playsinline','');video.setAttribute('webkit-playsinline','');
  try{await video.play();}catch(e3){}
  setHint('Toque foto · Mantém vídeo · Escolhe efeito');
  loadImgs();buildChips();ensureLm();
}

function stopStream(){
  if(mediaRecorder&&mediaRecorder.state!=='inactive'){try{mediaRecorder.stop();}catch(e){}}
  mediaRecorder=null;recording=false;
  if(stream){
    try{stream.getVideoTracks().forEach(function(t){try{t.applyConstraints({advanced:[{torch:false}]});}catch(e0){}});}catch(e1){}
    stream.getTracks().forEach(function(t){try{t.stop();}catch(e){}});
    stream=null;
  }
  var root=document.getElementById('tchiloCam');
  if(root)root.classList.remove('recording');
}

function setHint(t){var el=document.getElementById('tchiloCamHint');if(el)el.textContent=t||'';}

function takePhoto(){
  var video=document.getElementById('tchiloCamVideo'),overlay=document.getElementById('tchiloCamCanvas');
  if(!video||video.readyState<2)return;
  var w=video.videoWidth||720,h=video.videoHeight||1280,out=document.createElement('canvas');
  out.width=w;out.height=h;
  var ctx=out.getContext('2d');
  if(facingMode==='user'){ctx.translate(w,0);ctx.scale(-1,1);}
  ctx.drawImage(video,0,0,w,h);
  if(overlay&&overlay.width){
    ctx.setTransform(1,0,0,1,0,0);
    if(facingMode==='user'){ctx.translate(w,0);ctx.scale(-1,1);}
    ctx.drawImage(overlay,0,0,w,h);
  }
  out.toBlob(function(blob){
    if(!blob)return;
    var file;
    try{file=new File([blob],'tchilo-cam.jpg',{type:'image/jpeg'});}
    catch(e){file=blob;file.name='tchilo-cam.jpg';}
    deliver(file,URL.createObjectURL(blob),'image');
  },'image/jpeg',0.92);
}

function startRec(){
  if(!stream||recording)return;
  recordedChunks=[];
  try{mediaRecorder=new MediaRecorder(stream);}catch(e){return;}
  mediaRecorder.ondataavailable=function(ev){if(ev.data&&ev.data.size)recordedChunks.push(ev.data);};
  mediaRecorder.onstop=function(){
    var blob=new Blob(recordedChunks,{type:mediaRecorder.mimeType||'video/webm'});
    recording=false;
    var root=document.getElementById('tchiloCam');
    if(root)root.classList.remove('recording');
    if(!blob.size)return;
    var file;
    try{file=new File([blob],'tchilo-cam.webm',{type:blob.type});}
    catch(e2){file=blob;file.name='tchilo-cam.webm';}
    deliver(file,URL.createObjectURL(blob),'video');
  };
  mediaRecorder.start(200);recording=true;
  var root=document.getElementById('tchiloCam');
  if(root)root.classList.add('recording');
  setHint('A gravar…');
}

function stopRec(){if(mediaRecorder&&mediaRecorder.state!=='inactive'){try{mediaRecorder.stop();}catch(e){}}}

function deliver(file,url,mediaType){
  closeCam();
  try{window.createMediaData={src:url,type:mediaType,file:file};window.createMediaFiles=[file];}catch(e){}
  if(typeof window.tchiloDeliverFaceFxPhoto==='function'&&mediaType==='image'){
    try{window.tchiloDeliverFaceFxPhoto(file,url);return;}catch(e2){}
  }
  if(typeof window.tchiloOpenMediaEditor==='function'){
    try{window.tchiloOpenMediaEditor({mode:'post',mediaType:mediaType,src:url,file:file});return;}catch(e3){}
  }
  try{if(typeof goTo==='function')goTo('create');}catch(e4){}
}

function flipCam(){
  facingMode=facingMode==='user'?'environment':'user';
  var root=document.getElementById('tchiloCam');
  if(root)root.classList.toggle('cam-env',facingMode==='environment');
  lastLm=null;startCamera();
}

function openCam(){
  hideGal();
  var old=document.getElementById('tchiloCam');
  if(old&&!old.querySelector('#tchiloCamFlash')){try{old.remove();}catch(e){}}
  ensureUI();loadImgs();buildChips();
  var root=document.getElementById('tchiloCam');
  if(!root)return;
  root.classList.add('open');
  root.style.cssText='display:flex!important;z-index:99999;position:fixed;inset:0;';
  document.body.style.overflow='hidden';
  startCamera();
  loopOn=true;paintLoop();
  setTimeout(buildChips,400);
  setTimeout(buildChips,1200);
}

function closeCam(){
  loopOn=false;stopStream();clearTimeout(holdTimer);
  var root=document.getElementById('tchiloCam');
  if(root){root.classList.remove('open','recording');root.style.display='none';}
  document.body.style.overflow='';
}

function ensureBtn(){
  hideGal();
  var screen=document.getElementById('screen-create');
  if(!screen)return;
  var btn=document.getElementById('tchiloOpenCamBtn');
  if(!btn){
    btn=document.createElement('button');
    btn.type='button';btn.id='tchiloOpenCamBtn';btn.className='gallery-btn tchilo-keep';
    btn.innerHTML='<span>Foto ou vídeo</span>';
    btn.style.cssText='display:inline-flex!important;align-items:center;justify-content:center;width:calc(100% - 32px);max-width:340px;margin:12px 16px;padding:14px 18px;border:2px solid var(--ink,#0B0B0C);border-radius:16px;background:var(--mint,#c8f560);color:var(--ink,#0B0B0C);font-weight:800;font-size:15px;z-index:50;';
    var preview=document.getElementById('createPreview');
    if(preview&&preview.parentNode)preview.parentNode.insertBefore(btn,preview.nextSibling);
    else screen.insertBefore(btn,screen.firstChild);
  }
  btn.onclick=function(e){e.preventDefault();e.stopPropagation();openCam();};
}

window.tchiloOpenCamera=openCam;
window.tchiloCloseCamera=closeCam;

function boot(){
  hideGal();loadImgs();ensureLm();ensureBtn();
  if(typeof window.goTo==='function'&&!window.goTo.__tchiloCamOk){
    var orig=window.goTo;
    window.goTo=function(s){var r=orig.apply(this,arguments);if(s==='create')setTimeout(ensureBtn,80);return r;};
    window.goTo.__tchiloCamOk=true;
  }
  setTimeout(ensureBtn,400);
  setTimeout(ensureBtn,1200);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();

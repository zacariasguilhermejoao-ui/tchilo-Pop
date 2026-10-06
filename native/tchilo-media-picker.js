/**
 * Tchilo Create Flow v3
 * + → Hub (voltar / tema / story + câmara + galeria + recentes)
 * Tema → escrever + fundo + publicar
 * Post → composição (descrição, música, cortar) → Publicar + progresso
 * Story → layout story → publicar
 */
(function () {
  'use strict';
  if (window.__TCHILO_MEDIA_PICKER_V6) return;
  window.__TCHILO_MEDIA_PICKER_V6 = true;
  window.__TCHILO_MEDIA_PICKER_V3 = true;
  window.__TCHILO_MEDIA_PICKER_V2 = true;

  var MODE = 'post'; // post | story | theme

  var MODE_ORDER = ['post', 'story', 'theme'];
  var selectedMusic=null,composeAudio=null;
  function stopComposeAudio(){if(composeAudio){try{composeAudio.pause()}catch(e){}composeAudio=null}}
  function playComposeMusic(meta){stopComposeAudio();if(!meta||!meta.preview)return;try{composeAudio=new Audio(meta.preview);composeAudio.loop=true;composeAudio.volume=.9;composeAudio.preload='auto';var chip=document.getElementById('mpMusicChip');function mark(ok){if(!chip)return;if(ok)chip.classList.remove('paused');else chip.classList.add('paused')}composeAudio.onplaying=function(){mark(true)};composeAudio.onpause=function(){mark(false)};function tryPlay(){if(!composeAudio)return;var pr=composeAudio.play();if(pr&&pr.then)pr.then(function(){mark(true)}).catch(function(){mark(false)})}tryPlay();setTimeout(tryPlay,120);setTimeout(tryPlay,400);setTimeout(tryPlay,900)}catch(e){}}
  function paintMusicChip(meta){selectedMusic=meta||null;if(meta){window._pendingMusic=(meta.title||'')+(meta.artist?' · '+meta.artist:'');window._pendingMusicMeta=meta}else{window._pendingMusic=null;window._pendingMusicMeta=null}var el=document.getElementById('mpMusicChip');if(!elareturn;if(!meta){el.style.display='none';el.classList.add('paused');return}el.style.display='flex';el.classList.remove('paused');var ti=document.getElementById('mpMusicTitle');if(ti)ti.textContent=meta.title||'Música"}
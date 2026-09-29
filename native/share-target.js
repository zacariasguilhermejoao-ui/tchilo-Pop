/* Tchilo Pop Share Target — routes shared content into the real post/story/chat flows. */
(function () {
  'use strict';
  if (window.__tchiloShareTargetBoot) return;
  window.__tchiloShareTargetBoot = true;
  var lastKey = '';
  var pending = null;

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]);
    });
  }
  function toast(message) {
    try {
      if (typeof window.showToast === 'function') window.showToast(message);
      else if (typeof window.__tchiloRealShowToast === 'function') window.__tchiloRealShowToast(message);
    } catch (e) {}
  }
  function getPlugin() {
    var C = window.Capacitor;
    if (!C) return null;
    try {
      if (C.Plugins && C.Plugins.TchiloShareTarget) return C.Plugins.TchiloShareTarget;
      if (typeof C.registerPlugin === 'function') return C.registerPlugin('TchiloShareTarget');
    } catch (e) {}
    return null;
  }
  function itemToBlob(item) {
    if (item.dataUrl && /^data:/i.test(item.dataUrl)) {
      var parts = item.dataUrl.split(',');
      var mime = ((parts[0].match(/data:([^;]+)/i) || [])[1]) || item.mimeType || 'application/octet-stream';
      var raw = atob(parts[1] || '');
      var bytes = new Uint8Array(raw.length);
      for (var i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
      return new Blob([bytes], { type: mime });
    }
    if (item.text) return new Blob([item.text], { type: 'text/plain;charset=utf-8' });
    return new Blob([], { type: item.mimeType || 'application/octet-stream' });
  }
  function itemToFile(item) {
    var blob = itemToBlob(item);
    var name = item.fileName || (item.mimeType && item.mimeType.indexOf('image/') === 0 ? 'partilhado.jpg' : item.mimeType && item.mimeType.indexOf('video/') === 0 ? 'partilhado.mp4' : 'ficheiro-partilhado');
    try { return new File([blob], name, { type: blob.type || item.mimeType || 'application/octet-stream', lastModified: Date.now() }); }
    catch (e) { blob.name = name; return blob; }
  }
  function mediaType(item) { return /^video\//i.test(item.mimeType || '') ? 'video' : 'image'; }

  function routeAction(action, item) {
    var file = itemToFile(item);
    var type = mediaType(item);
    if (action === 'post' || action === 'story') {
      if (!/^image\//i.test(item.mimeType || '') && !/^video\//i.test(item.mimeType || '')) {
        toast('Este tipo de ficheiro não pode ser publicado como foto ou vídeo.');
        return;
      }
      if (typeof window.tchiloOpenMediaEditor !== 'function') {
        toast('O editor de publicações ainda não está disponível. Atualiza o app e tenta novamente.');
        return;
      }
      var url = URL.createObjectURL(file);
      window.tchiloOpenMediaEditor({ mode: action === 'post' ? 'post' : 'story', mediaType: type, src: url, file: file });
      return;
    }
    if (action === 'message') {
      var blob = file instanceof Blob ? file : itemToBlob(item);
      window.__tchiloChatPending = {
        blob: blob,
        fileName: file.name || item.fileName || 'ficheiro-partilhado',
        mime: file.type || item.mimeType || 'application/octet-stream',
        kind: /^image\//i.test(file.type || item.mimeType || '') ? 'image' : /^video\//i.test(file.type || item.mimeType || '') ? 'video' : 'file',
        fileSize: blob.size
      };
      try {
        if (typeof window.goTo === 'function') window.goTo('messages');
        else if (typeof window.openMessages === 'function') window.openMessages();
      } catch (e) {}
      toast('Anexo preparado. Abre a conversa da pessoa e toca em Enviar para partilhar o ficheiro.');
      return;
    }
  }

  function openChooser(item) {
    pending = item;
    var isMedia = /^image\//i.test(item.mimeType || '') || /^video\//i.test(item.mimeType || '');
    var old = document.getElementById('tchilo-share-target-modal');
    if (old) old.remove();
    var modal = document.createElement('div');
    modal.id = 'tchilo-share-target-modal';
    modal.style.cssText = 'position:fixed;inset:0;z-index:2147483647;background:rgba(0,0,0,.72);display:flex;align-items:flex-end;justify-content:center;font:16px system-ui,sans-serif;color:#fff';
    var preview = '';
    if (isMedia && item.dataUrl && /^data:image\//i.test(item.dataUrl)) {
      preview = '<img alt="Pré-visualização" src="' + item.dataUrl + '" style="max-width:100%;max-height:30vh;border-radius:12px;object-fit:contain">';
    } else if (isMedia && item.dataUrl && /^data:video\//i.test(item.dataUrl)) {
      preview = '<video controls playsinline src="' + item.dataUrl + '" style="max-width:100%;max-height:30vh;border-radius:12px"></video>';
    }
    var actions = isMedia
      ? [['post','Publicar no feed'],['story','Publicar no story'],['message','Enviar por mensagem']]
      : [['message','Enviar por mensagem']];
    modal.innerHTML = '<section style="box-sizing:border-box;width:min(100%,520px);background:#15171b;border-radius:22px 22px 0 0;padding:22px 18px calc(22px + env(safe-area-inset-bottom));display:grid;gap:13px;max-height:90dvh;overflow:auto"><div style="width:38px;height:4px;border-radius:9px;background:#555;justify-self:center"></div><h2 style="margin:4px 0;font-size:21px">Partilhar no Tchilo</h2><div style="color:#aeb4bf;font-size:14px;overflow-wrap:anywhere">' + esc(item.fileName || item.text || 'Conteúdo recebido') + '</div>' + preview + actions.map(function(a){return '<button data-action="'+a[0]+'" style="border:0;border-radius:12px;padding:15px;background:'+(a[0]==='post'?'#19b86a':'#252a32')+';color:white;font-size:16px;font-weight:650;text-align:left">'+a[1]+'　›</button>';}).join('') + '<button data-action="cancel" style="border:1px solid #454a53;border-radius:12px;padding:13px;background:transparent;color:#ddd">Cancelar</button></section>';
    modal.addEventListener('click', function(e) {
      var b = e.target.closest('button[data-action]');
      if (!b) return;
      var action = b.getAttribute('data-action');
      if (action === 'cancel') { modal.remove(); return; }
      modal.remove();
      routeAction(action, pending);
    });
    document.body.appendChild(modal);
  }
  async function checkIncoming() {
    var p = getPlugin();
    if (!p || typeof p.getPendingShare !== 'function') return;
    try {
      var result = await p.getPendingShare();
      var item = result && result.item;
      if (!item || !item.id || item.id === lastKey) return;
      lastKey = item.id;
      openChooser(item);
    } catch (e) { console.warn('[Tchilo Share Target]', e); }
  }
  function boot() {
    checkIncoming();
    document.addEventListener('visibilitychange', function(){ if (!document.hidden) checkIncoming(); });
    window.addEventListener('focus', checkIncoming);
    try {
      var App = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App;
      if (App && App.addListener) App.addListener('appStateChange', function(s){ if (s && s.isActive) checkIncoming(); });
    } catch (e) {}
  }
  window.tchiloCheckIncomingShare = checkIncoming;
  window.tchiloRouteIncomingShare = routeAction;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
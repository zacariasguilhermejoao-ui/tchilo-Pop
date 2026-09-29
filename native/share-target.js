/* Tchilo Pop Share Target — incoming share UI for Capacitor native apps. */
(function () {
  'use strict';
  if (window.__tchiloShareTargetBoot) return;
  window.__tchiloShareTargetBoot = true;
  var pending = null;
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]); }); }
  function getPlugin() {
    var C = window.Capacitor;
    if (!C) return null;
    try {
      if (C.Plugins && C.Plugins.TchiloShareTarget) return C.Plugins.TchiloShareTarget;
      if (typeof C.registerPlugin === 'function') return C.registerPlugin('TchiloShareTarget');
    } catch (e) {}
    return null;
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
    if (isMedia && item.dataUrl && /^data:(image|video)\//i.test(item.dataUrl)) {
      preview = /^data:image\//i.test(item.dataUrl)
        ? '<img alt="Pré-visualização" src="' + item.dataUrl + '" style="max-width:100%;max-height:32vh;border-radius:12px;object-fit:contain">'
        : '<video controls playsinline src="' + item.dataUrl + '" style="max-width:100%;max-height:32vh;border-radius:12px"></video>';
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
      try {
        sessionStorage.setItem('tchilo_incoming_share', JSON.stringify({ action: action, item: pending, receivedAt: Date.now() }));
      } catch (e) {}
      window.dispatchEvent(new CustomEvent('tchilo:share-action', { detail: { action: action, item: pending } }));
      modal.remove();
      if (typeof window.tchiloHandleIncomingShare === 'function') {
        window.tchiloHandleIncomingShare(action, pending);
      } else {
        var message = action === 'message' ? 'Escolhe um destinatário na área de mensagens para concluir o envio.' : 'O conteúdo foi recebido. Abre o editor correspondente para concluir a publicação.';
        try { if (typeof window.showToast === 'function') window.showToast(message); } catch (e) {}
      }
    });
    document.body.appendChild(modal);
  }
  var lastKey = '';
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
    document.addEventListener('resume', checkIncoming);
    try {
      var App = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App;
      if (App && App.addListener) App.addListener('appStateChange', function(s){ if (s && s.isActive) checkIncoming(); });
    } catch (e) {}
  }
  window.tchiloCheckIncomingShare = checkIncoming;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
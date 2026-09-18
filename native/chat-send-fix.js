/**
 * tchilo-Pop — envio de mensagens de texto fiável
 */
(function () {
  'use strict';

  function toast(msg) {
    try {
      if (typeof window.__tchiloRealShowToast === 'function') {
        window.__tchiloRealShowToast(msg);
        return;
      }
      if (typeof showToast === 'function') showToast(msg);
    } catch (e) {
      try {
        alert(msg);
      } catch (e2) {}
    }
  }

  async function sendTextReliable() {
    var input = document.getElementById('chatInput');
    var text = (input && input.value ? input.value : '').trim();
    var pending = window.__tchiloChatPending;

    if (typeof currentChatUser === 'undefined' || !currentChatUser) {
      toast('Abre uma conversa primeiro');
      return;
    }
    if (!text && !pending) {
      toast('Escreve uma mensagem');
      return;
    }

    var btn = document.querySelector('.chat-send');
    try {
      if (typeof tchiloSetLoading === 'function') tchiloSetLoading(btn, true);
    } catch (e) {}

    try {
      var chats = typeof getChats === 'function' ? getChats() : {};
      if (!chats[currentChatUser]) {
        chats[currentChatUser] =
          typeof defaultChatSeed === 'function' ? defaultChatSeed(currentChatUser) : [];
      }

      var msg = {
        from: 'me',
        text: text || '',
        createdAt: Date.now(),
        type: 'text'
      };

      if (pending && pending.blob) {
        if (typeof tchiloUploadChatFile === 'function') {
          var uploaded = await tchiloUploadChatFile(
            pending.blob,
            pending.fileName,
            pending.mime
          );
          msg.type = pending.kind || 'file';
          msg.mediaUrl = uploaded.url;
          msg.mediaType = uploaded.mime || pending.mime;
          msg.fileName = pending.fileName || uploaded.fileName;
          msg.fileSize = pending.fileSize != null ? pending.fileSize : pending.blob.size || 0;
          msg.storagePath = uploaded.path || null;
        } else {
          // fallback local blob
          msg.type = pending.kind || 'file';
          msg.mediaUrl = URL.createObjectURL(pending.blob);
          msg.mediaType = pending.mime;
          msg.fileName = pending.fileName;
        }
        try {
          if (typeof clearChatAttachment === 'function') clearChatAttachment();
          else window.__tchiloChatPending = null;
        } catch (e3) {
          window.__tchiloChatPending = null;
        }
      }

      chats[currentChatUser].push(msg);
      if (typeof saveChats === 'function') saveChats(chats);
      if (input) input.value = '';
      if (typeof renderChatBody === 'function') renderChatBody();

      // sync cloud (não bloqueia a UI se falhar)
      try {
        if (window.tchiloCloud && typeof window.tchiloCloud.syncNormalized === 'function') {
          window.tchiloCloud.syncNormalized('chats', chats).catch(function () {});
        }
      } catch (e4) {}

      // tentar insert direto na tabela messages (texto)
      try {
        var SB = window.tchiloSupabase;
        if (SB && text) {
          var uid = window.__tchiloCloudUserId;
          if (!uid) {
            try {
              var auth = await SB.auth.getSession();
              uid =
                auth &&
                auth.data &&
                auth.data.session &&
                auth.data.session.user &&
                auth.data.session.user.id;
            } catch (e5) {}
          }
          if (uid) {
            var row = {
              sender_id: uid,
              receiver_username: currentChatUser,
              recipient_username: currentChatUser,
              content: text,
              message_type: msg.type || 'text',
              media_url: msg.mediaUrl || null,
              media_type: msg.mediaType || null,
              created_at: new Date().toISOString()
            };
            SB.from('messages').insert(row).then(function () {}).catch(function () {});
          }
        }
      } catch (e6) {}
    } catch (err) {
      console.warn('sendChat fix', err);
      toast((err && err.message) || 'Não foi possível enviar');
    } finally {
      try {
        if (typeof tchiloSetLoading === 'function') tchiloSetLoading(btn, false);
      } catch (e7) {}
    }
  }

  function patch() {
    // preservar showToast real antes de ser silenciado
    if (typeof showToast === 'function' && !window.__tchiloRealShowToast) {
      window.__tchiloRealShowToast = showToast;
    }

    window.sendChat = sendTextReliable;

    // Enter no input
    var input = document.getElementById('chatInput');
    if (input && !input.__sendFix) {
      input.__sendFix = true;
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          sendTextReliable();
        }
      });
    }

    var btn = document.querySelector('.chat-send');
    if (btn && !btn.__sendFix) {
      btn.__sendFix = true;
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        sendTextReliable();
      });
    }
  }

  function boot() {
    patch();
    [300, 1000, 2500].forEach(function (ms) {
      setTimeout(patch, ms);
    });
    if (typeof window.openChat === 'function' && !window.openChat.__sendFix) {
      var oc = window.openChat;
      window.openChat = function () {
        var r = oc.apply(this, arguments);
        setTimeout(patch, 50);
        setTimeout(patch, 200);
        return r;
      };
      window.openChat.__sendFix = true;
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();

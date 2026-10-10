/**
 * Tchilo — sincronizar mensagens de chat com Supabase
 */
(function () {
  'use strict';
  if (window.__tchiloChatSupabaseV1) return;
  window.__tchiloChatSupabaseV1 = true;

  function SB() {
    return window.tchiloSupabase || window.SB || window.supabaseClient || window.sb || null;
  }

  function myUser() {
    try {
      if (typeof getSession === 'function') return getSession();
      return JSON.parse(localStorage.getItem('tchilo_session') || 'null');
    } catch (e) {
      return null;
    }
  }

  async function insertMessage(toUsername, msg) {
    var client = SB();
    if (!client || !client.from) return;
    var me = myUser();
    if (!me) return;
    var row = {
      sender_username: me.username || null,
      receiver_username: toUsername || null,
      sender_id: me.id || null,
      text: (msg && msg.text) || '',
      body: (msg && msg.text) || '',
      content: (msg && msg.text) || '',
      type: (msg && msg.type) || 'text',
      media_url: (msg && msg.mediaUrl) || null,
      created_at: new Date((msg && msg.createdAt) || Date.now()).toISOString()
    };
    try {
      await client.from('messages').insert(row);
    } catch (e1) {
      try {
        /* schema alternativo */
        await client.from('messages').insert({
          from_username: row.sender_username,
          to_username: row.receiver_username,
          user_id: row.sender_id,
          message: row.text,
          text: row.text,
          type: row.type,
          media_url: row.media_url
        });
      } catch (e2) {
        console.warn('Tchilo chat supabase insert', e2);
      }
    }
  }

  window.tchiloSaveChatMessageCloud = insertMessage;

  function patchSendChat() {
    if (typeof window.sendChat !== 'function') return;
    if (window.sendChat.__cloudV1) return;
    var orig = window.sendChat;
    window.sendChat = async function () {
      var before = null;
      try {
        if (typeof getChats === 'function' && window.currentChatUser) {
          var t = getChats()[window.currentChatUser] || [];
          before = t.length;
        }
      } catch (e) {}
      var r = await orig.apply(this, arguments);
      try {
        if (typeof getChats === 'function' && window.currentChatUser) {
          var thread = getChats()[window.currentChatUser] || [];
          if (before != null && thread.length > before) {
            var last = thread[thread.length - 1];
            if (last && last.from === 'me') {
              insertMessage(window.currentChatUser, last);
            }
          }
        }
        if (window.tchiloCloud && typeof window.tchiloCloud.syncNormalized === 'function') {
          window.tchiloCloud.syncNormalized('chats', getChats());
        }
      } catch (e2) {}
      return r;
    };
    window.sendChat.__cloudV1 = true;
  }

  /* location / sticker / gif também */
  function patchHelpers() {
    ['sendChatLocation', 'sendStickerOrGif'].forEach(function (name) {
      try {
        if (typeof window[name] !== 'function' || window[name].__cloudV1) return;
        var o = window[name];
        window[name] = async function () {
          var r = await o.apply(this, arguments);
          try {
            if (window.currentChatUser && typeof getChats === 'function') {
              var thread = getChats()[window.currentChatUser] || [];
              var last = thread[thread.length - 1];
              if (last && last.from === 'me') insertMessage(window.currentChatUser, last);
            }
          } catch (e) {}
          return r;
        };
        window[name].__cloudV1 = true;
      } catch (e) {}
    });
  }

  patchSendChat();
  patchHelpers();
  setTimeout(patchSendChat, 600);
  setTimeout(patchHelpers, 800);
  setTimeout(patchSendChat, 2500);
})();

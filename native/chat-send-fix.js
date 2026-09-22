/**
 * tchilo-Pop — envio e gravação fiável de mensagens
 */
(function () {
  "use strict";

  function toast(msg) {
    try {
      if (typeof window.__tchiloRealShowToast === "function") {
        window.__tchiloRealShowToast(msg);
        return;
      }
      if (typeof showToast === "function") showToast(msg);
    } catch (e) {
      try {
        alert(msg);
      } catch (e2) {}
    }
  }

  function myUsername() {
    try {
      if (typeof getSession === "function") {
        var s = getSession();
        if (s && s.username) return String(s.username);
      }
      if (window.session && window.session.username) return String(window.session.username);
    } catch (e) {}
    return "";
  }

  async function myUserId() {
    try {
      if (window.__tchiloCloudUserId) return window.__tchiloCloudUserId;
      var SB = window.SB || window.tchiloSupabase;
      if (SB && SB.auth) {
        var auth = await SB.auth.getSession();
        var u =
          auth &&
          auth.data &&
          auth.data.session &&
          auth.data.session.user &&
          auth.data.session.user.id;
        if (u) {
          window.__tchiloCloudUserId = u;
          return u;
        }
      }
      if (typeof getSession === "function") {
        var s = getSession();
        if (s && (s.id || s.user_id)) return s.id || s.user_id;
      }
    } catch (e) {}
    return null;
  }

  function getChatsSafe() {
    try {
      if (typeof getChats === "function") return getChats() || {};
    } catch (e) {}
    try {
      var raw = localStorage.getItem("tchilo_chats");
      if (raw) return JSON.parse(raw) || {};
    } catch (e2) {}
    return {};
  }

  function saveChatsSafe(chats) {
    try {
      if (typeof saveChats === "function") {
        saveChats(chats);
        return;
      }
    } catch (e) {}
    try {
      localStorage.setItem("tchilo_chats", JSON.stringify(chats));
    } catch (e2) {}
  }

  async function persistMessageCloud(toUsername, msg) {
    var SB = window.SB || window.tchiloSupabase;
    if (!SB) return false;
    var uid = await myUserId();
    var me = myUsername();
    if (!uid || !toUsername) return false;

    var iso =
      msg.createdAt != null
        ? new Date(msg.createdAt).toISOString()
        : new Date().toISOString();

    var candidates = [
      {
        sender_id: uid,
        receiver_username: toUsername,
        recipient_username: toUsername,
        content: msg.text || "",
        message_type: msg.type || "text",
        media_url: msg.mediaUrl || null,
        media_type: msg.mediaType || null,
        created_at: iso
      },
      {
        sender_id: uid,
        receiver_username: toUsername,
        content: msg.text || "",
        created_at: iso
      },
      {
        sender_id: uid,
        recipient_username: toUsername,
        content: msg.text || "",
        created_at: iso
      },
      {
        user_id: uid,
        username: toUsername,
        content: msg.text || "",
        created_at: iso
      },
      {
        sender_id: uid,
        sender_username: me,
        receiver_username: toUsername,
        content: msg.text || "",
        text: msg.text || "",
        created_at: iso
      }
    ];

    for (var i = 0; i < candidates.length; i++) {
      try {
        var res = await SB.from("messages").insert(candidates[i]).select("id").maybeSingle();
        if (!res.error) return true;
      } catch (e) {}
    }
    for (var j = 0; j < candidates.length; j++) {
      try {
        var r2 = await SB.from("messages").insert(candidates[j]);
        if (!r2.error) return true;
      } catch (e2) {}
    }
    return false;
  }

  async function pullThread(other) {
    var SB = window.SB || window.tchiloSupabase;
    if (!SB || !other) return;
    var me = myUsername();
    var uid = await myUserId();
    if (!me && !uid) return;

    var rows = [];
    var tries = [
      function () {
        return SB.from("messages")
          .select("*")
          .or(
            "receiver_username.eq." +
              me +
              ",recipient_username.eq." +
              me +
              ",receiver_username.eq." +
              other +
              ",recipient_username.eq." +
              other
          )
          .order("created_at", { ascending: true })
          .limit(200);
      },
      function () {
        return SB.from("messages")
          .select("*")
          .eq("receiver_username", other)
          .order("created_at", { ascending: true })
          .limit(100);
      },
      function () {
        return SB.from("messages")
          .select("*")
          .eq("sender_id", uid)
          .order("created_at", { ascending: true })
          .limit(100);
      }
    ];

    for (var i = 0; i < tries.length; i++) {
      try {
        var res = await tries[i]();
        if (!res.error && res.data && res.data.length) {
          rows = res.data;
          break;
        }
      } catch (e) {}
    }
    if (!rows.length) return;

    var chats = getChatsSafe();
    if (!chats[other]) chats[other] = [];
    var existingKeys = {};
    chats[other].forEach(function (m) {
      if (!m) return;
      existingKeys[(m.createdAt || "") + "|" + (m.text || "") + "|" + (m.from || "")] = true;
    });

    rows.forEach(function (r) {
      var text = r.content || r.body || r.text || "";
      var ts = r.created_at ? new Date(r.created_at).getTime() : Date.now();
      var fromMe =
        (uid && r.sender_id === uid) ||
        (me && r.sender_username && String(r.sender_username) === me);
      var recv = r.receiver_username || r.recipient_username || r.username || "";
      var from = fromMe ? "me" : "them";

      if (from === "me" && recv && recv !== other) return;
      if (from === "them" && recv && recv !== me) return;

      var k = ts + "|" + text + "|" + from;
      if (existingKeys[k]) return;
      existingKeys[k] = true;
      chats[other].push({
        from: from,
        text: text,
        createdAt: ts,
        type: r.message_type || r.type || "text",
        mediaUrl: r.media_url || null,
        mediaType: r.media_type || null,
        _synced: true,
        _cloudId: r.id || null
      });
    });

    chats[other].sort(function (a, b) {
      return (a.createdAt || 0) - (b.createdAt || 0);
    });
    saveChatsSafe(chats);
    try {
      if (
        typeof currentChatUser !== "undefined" &&
        currentChatUser === other &&
        typeof renderChatBody === "function"
      ) {
        renderChatBody();
      }
    } catch (e3) {}
  }

  async function sendTextReliable() {
    var input = document.getElementById("chatInput");
    var text = (input && input.value ? input.value : "").trim();
    var pending = window.__tchiloChatPending;

    if (typeof currentChatUser === "undefined" || !currentChatUser) {
      toast("Abre uma conversa primeiro");
      return;
    }
    if (!text && !pending) {
      toast("Escreve uma mensagem");
      return;
    }

    var btn = document.querySelector(".chat-send");
    try {
      if (typeof tchiloSetLoading === "function") tchiloSetLoading(btn, true);
    } catch (e) {}

    try {
      var chats = getChatsSafe();
      if (!chats[currentChatUser]) {
        chats[currentChatUser] =
          typeof defaultChatSeed === "function"
            ? defaultChatSeed(currentChatUser)
            : [];
      }

      var msg = {
        from: "me",
        text: text || "",
        createdAt: Date.now(),
        type: "text",
        _synced: false
      };

      if (pending && pending.blob) {
        if (typeof tchiloUploadChatFile === "function") {
          var uploaded = await tchiloUploadChatFile(
            pending.blob,
            pending.fileName,
            pending.mime
          );
          msg.type = pending.kind || "file";
          msg.mediaUrl = uploaded.url;
          msg.mediaType = uploaded.mime || pending.mime;
          msg.fileName = pending.fileName || uploaded.fileName;
          msg.fileSize =
            pending.fileSize != null ? pending.fileSize : pending.blob.size || 0;
          msg.storagePath = uploaded.path || null;
        } else {
          msg.type = pending.kind || "file";
          msg.mediaUrl = URL.createObjectURL(pending.blob);
          msg.mediaType = pending.mime;
          msg.fileName = pending.fileName;
        }
        try {
          if (typeof clearChatAttachment === "function") clearChatAttachment();
          else window.__tchiloChatPending = null;
        } catch (e3) {
          window.__tchiloChatPending = null;
        }
      }

      chats[currentChatUser].push(msg);
      saveChatsSafe(chats);

      if (input) input.value = "";
      try {
        if (typeof renderChatBody === "function") renderChatBody();
        else if (typeof renderChat === "function") renderChat();
      } catch (e4) {}

      var ok = await persistMessageCloud(currentChatUser, msg);
      if (ok) {
        msg._synced = true;
        saveChatsSafe(chats);
      } else {
        console.warn("[tchilo] cloud message save failed — run messages SQL if needed");
      }

      try {
        if (
          window.tchiloCloud &&
          typeof window.tchiloCloud.syncNormalized === "function"
        ) {
          await window.tchiloCloud.syncNormalized("chats", chats);
        }
      } catch (e5) {}
    } catch (err) {
      console.warn("sendChat", err);
      toast((err && err.message) || "Não foi possível enviar");
    } finally {
      try {
        if (typeof tchiloSetLoading === "function") tchiloSetLoading(btn, false);
      } catch (e7) {}
    }
  }

  function patch() {
    if (typeof showToast === "function" && !window.__tchiloRealShowToast) {
      window.__tchiloRealShowToast = showToast;
    }
    window.sendChat = sendTextReliable;

    var input = document.getElementById("chatInput");
    if (input && !input.__sendFix2) {
      input.__sendFix2 = true;
      input.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
          e.preventDefault();
          sendTextReliable();
        }
      });
    }

    var btn = document.querySelector(".chat-send");
    if (btn && !btn.__sendFix2) {
      btn.__sendFix2 = true;
      btn.addEventListener(
        "click",
        function (e) {
          e.preventDefault();
          e.stopPropagation();
          sendTextReliable();
        },
        true
      );
    }
  }

  function patchOpenChat() {
    if (typeof window.openChat !== "function" || window.openChat.__persistFix)
      return;
    var oc = window.openChat;
    window.openChat = function (name) {
      var r = oc.apply(this, arguments);
      setTimeout(patch, 40);
      setTimeout(function () {
        if (name) pullThread(String(name));
        else if (typeof currentChatUser !== "undefined" && currentChatUser)
          pullThread(String(currentChatUser));
      }, 120);
      return r;
    };
    window.openChat.__persistFix = true;
  }

  function boot() {
    patch();
    patchOpenChat();
    [300, 1000, 2500].forEach(function (ms) {
      setTimeout(function () {
        patch();
        patchOpenChat();
      }, ms);
    });
  }

  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();

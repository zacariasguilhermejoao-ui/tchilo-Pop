/**
 * Tchilo — liga device_tokens + send-push (like, comentário, mensagem)
 */
(function () {
  'use strict';
  if (window.__tchiloPushWire) return;
  window.__tchiloPushWire = true;

  function getActor() {
    try {
      var s = typeof getSession === 'function' ? getSession() : null;
      if (!s) {
        try {
          s = JSON.parse(localStorage.getItem('tchilo_session') || 'null');
        } catch (e) {}
      }
      return {
        username: (s && s.username) || '',
        name: (s && (s.displayName || s.display_name || s.name || s.username)) || '',
        id: (s && (s.id || s.userId)) || window.__tchiloCloudUserId || null
      };
    } catch (e) {
      return { username: '', name: '', id: null };
    }
  }

  async function resolveCloudUserId() {
    if (window.__tchiloCloudUserId) return window.__tchiloCloudUserId;
    try {
      var SB = window.tchiloSupabase;
      if (!SB) return null;
      var auth = await SB.auth.getSession();
      var uid =
        auth &&
        auth.data &&
        auth.data.session &&
        auth.data.session.user &&
        auth.data.session.user.id;
      if (uid) window.__tchiloCloudUserId = uid;
      return uid || null;
    } catch (e) {
      return null;
    }
  }

  async function resolveUserIdByUsername(username) {
    if (!username) return null;
    try {
      var SB = window.tchiloSupabase;
      if (!SB) return null;
      var { data } = await SB.from('profiles')
        .select('id')
        .ilike('username', username)
        .maybeSingle();
      return data && data.id ? data.id : null;
    } catch (e) {
      return null;
    }
  }

  async function saveDeviceToken(token, platform) {
    if (!token) return;
    try {
      localStorage.setItem('tchilo_fcm_token', token);
    } catch (e) {}
    try {
      var SB = window.tchiloSupabase;
      if (!SB) return;
      var uid = await resolveCloudUserId();
      if (!uid) return;
      var row = {
        user_id: uid,
        token: String(token),
        platform: platform || 'web',
        updated_at: new Date().toISOString()
      };
      var { error } = await SB.from('device_tokens').upsert(row, {
        onConflict: 'token'
      });
      if (error) {
        /* fallback sem unique constraint */
        await SB.from('device_tokens').insert(row).catch(function () {});
      }
    } catch (e) {
      console.warn('Tchilo device_tokens', e);
    }
  }

  /** Chama Edge Function send-push */
  async function sendPush(payload) {
    try {
      if (!payload || !payload.recipient_user_id) return;
      var me = await resolveCloudUserId();
      if (me && String(me) === String(payload.recipient_user_id)) return;

      var SB = window.tchiloSupabase;
      if (!SB || !SB.functions || typeof SB.functions.invoke !== 'function') {
        /* fallback HTTP */
        var base =
          (SB && SB.supabaseUrl) ||
          (window.__TCHILO_SUPABASE_URL) ||
          '';
        if (!base) return;
        var key =
          (window.__TCHILO_SUPABASE_ANON_KEY) ||
          localStorage.getItem('tchilo_supabase_anon') ||
          '';
        var session = null;
        try {
          var s = await SB.auth.getSession();
          session = s && s.data && s.data.session;
        } catch (e) {}
        var headers = {
          'Content-Type': 'application/json',
          apikey: key || ''
        };
        if (session && session.access_token) {
          headers.Authorization = 'Bearer ' + session.access_token;
        }
        await fetch(base.replace(/\/$/, '') + '/functions/v1/send-push', {
          method: 'POST',
          headers: headers,
          body: JSON.stringify(payload)
        });
        return;
      }

      await SB.functions.invoke('send-push', { body: payload });
    } catch (e) {
      console.warn('Tchilo send-push', e);
    }
  }

  window.tchiloSendPush = sendPush;
  window.tchiloSaveDeviceToken = saveDeviceToken;

  function postOwnerId(post) {
    if (!post) return null;
    return post.userId || post.user_id || post.owner_id || post.authorId || null;
  }

  function findPost(id) {
    try {
      var posts = typeof getPosts === 'function' ? getPosts() : [];
      return (posts || []).find(function (p) {
        return p && String(p.id) === String(id);
      });
    } catch (e) {
      return null;
    }
  }

  function wireLike() {
    if (typeof window.toggleLike !== 'function' || window.toggleLike.__pushWired) return;
    var orig = window.toggleLike;
    window.toggleLike = function (id, btn) {
      var wasLiked = false;
      try {
        var likes = typeof getLikes === 'function' ? getLikes() : {};
        wasLiked = !!likes[id];
      } catch (e) {}
      var r = orig.apply(this, arguments);
      /* só notifica quando passa a liked (não no unlike) */
      if (!wasLiked) {
        try {
          var post = findPost(id);
          var recipient = postOwnerId(post);
          var actor = getActor();
          if (recipient) {
            sendPush({
              type: 'like',
              recipient_user_id: recipient,
              actor_username: actor.username,
              actor_name: actor.name,
              data: { post_id: String(id), url: '/feed' }
            });
          }
        } catch (e) {}
      }
      return r;
    };
    window.toggleLike.__pushWired = true;
  }

  function wireComment() {
    if (typeof window.sendComment !== 'function' || window.sendComment.__pushWired) return;
    var orig = window.sendComment;
    window.sendComment = function () {
      var postId = window.currentCommentPostId;
      var r = orig.apply(this, arguments);
      try {
        var post = findPost(postId);
        var recipient = postOwnerId(post);
        var actor = getActor();
        if (recipient) {
          sendPush({
            type: 'comment',
            recipient_user_id: recipient,
            actor_username: actor.username,
            actor_name: actor.name,
            data: { post_id: String(postId || ''), url: '/notificacoes' }
          });
        }
      } catch (e) {}
      return r;
    };
    window.sendComment.__pushWired = true;
  }

  function wireChat() {
    if (typeof window.sendChat !== 'function' || window.sendChat.__pushWired) return;
    var orig = window.sendChat;
    window.sendChat = async function () {
      var other = window.currentChatUser;
      var r = await orig.apply(this, arguments);
      try {
        if (other) {
          var recipient = await resolveUserIdByUsername(other);
          var actor = getActor();
          if (recipient) {
            sendPush({
              type: 'message',
              recipient_user_id: recipient,
              actor_username: actor.username,
              actor_name: actor.name,
              data: { url: '/mensagens' }
            });
          }
        }
      } catch (e) {}
      return r;
    };
    window.sendChat.__pushWired = true;
  }

  function wireCapacitorToken() {
    try {
      var Cap = window.Capacitor;
      if (!Cap || !Cap.Plugins || !Cap.Plugins.PushNotifications) return;
      var Push = Cap.Plugins.PushNotifications;
      Push.addListener('registration', function (token) {
        var t = token && token.value ? token.value : String(token || '');
        var platform =
          Cap.getPlatform && Cap.getPlatform() === 'ios' ? 'ios' : 'android';
        saveDeviceToken(t, platform);
      });
      Push.requestPermissions().then(function (perm) {
        if (perm && (perm.receive === 'granted' || perm.receive === 'prompt')) {
          Push.register().catch(function () {});
        }
      });
    } catch (e) {}
  }

  function boot() {
    wireLike();
    wireComment();
    wireChat();
    wireCapacitorToken();
    /* re-tenta depois dos scripts principais */
    setTimeout(function () {
      wireLike();
      wireComment();
      wireChat();
      wireCapacitorToken();
      /* se já houver token local, grava */
      try {
        var t = localStorage.getItem('tchilo_fcm_token');
        if (t) saveDeviceToken(t, 'android');
      } catch (e) {}
    }, 1500);
    setTimeout(function () {
      wireLike();
      wireComment();
      wireChat();
    }, 4000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();

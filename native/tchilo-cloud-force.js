/**
 * Tchilo cloud-force v2
 * Grava na Supabase: likes, saves, comments, follows, messages
 * (UI local continua rápida; a fonte de verdade é a cloud)
 */
(function () {
  'use strict';
  if (window.__tchiloCloudForceV2) return;
  window.__tchiloCloudForceV2 = true;
  window.__tchiloCloudForceV1 = true;

  function SB() {
    return (
      window.tchiloSupabase ||
      window.SB ||
      window.supabaseClient ||
      window.supabase ||
      null
    );
  }

  async function uid() {
    if (window.__tchiloCloudUserId) return window.__tchiloCloudUserId;
    var s = SB();
    if (!s) return null;
    try {
      var a = await s.auth.getSession();
      var id =
        a && a.data && a.data.session && a.data.session.user && a.data.session.user.id;
      if (id) {
        window.__tchiloCloudUserId = id;
        return id;
      }
    } catch (e) {}
    try {
      var sess = sessionUser();
      if (sess && (sess.id || sess.user_id)) return sess.id || sess.user_id;
    } catch (e2) {}
    return null;
  }

  function sessionUser() {
    try {
      if (typeof getSession === 'function') return getSession();
      return JSON.parse(localStorage.getItem('tchilo_session') || 'null');
    } catch (e) {
      return null;
    }
  }

  async function resolveUserIdByUsername(username) {
    var s = SB();
    if (!s || !username) return null;
    try {
      var r = await s.from('profiles').select('id').eq('username', username).maybeSingle();
      if (r.data && r.data.id) return r.data.id;
    } catch (e) {}
    return null;
  }

  async function notify(targetUserId, type, message, postId) {
    var s = SB();
    var me = await uid();
    var sess = sessionUser();
    if (!s || !targetUserId || !me || targetUserId === me) return;
    try {
      await s.from('notifications').insert({
        user_id: targetUserId,
        actor_id: me,
        actor_username: sess && sess.username,
        type: type,
        post_id: postId || null,
        message: message || type,
        read: false
      });
    } catch (e) {
      console.warn('notif', e);
    }
  }

  window.tchiloCloudLike = async function (postId, liked) {
    var s = SB();
    var me = await uid();
    if (!s || !me || !postId) return false;
    try {
      if (liked) {
        var ins = await s.from('likes').upsert(
          { user_id: me, post_id: String(postId), created_at: new Date().toISOString() },
          { onConflict: 'user_id,post_id' }
        );
        if (ins.error) {
          await s.from('likes').insert({ user_id: me, post_id: String(postId) });
        }
        try {
          var p = await s
            .from('posts')
            .select('user_id,likes_count')
            .eq('id', postId)
            .maybeSingle();
          if (p.data && p.data.user_id) {
            await notify(p.data.user_id, 'like', 'gostou da tua publicação', postId);
            if (typeof p.data.likes_count === 'number') {
              await s
                .from('posts')
                .update({ likes_count: (p.data.likes_count || 0) + 1 })
                .eq('id', postId);
            }
          }
        } catch (e) {}
      } else {
        await s.from('likes').delete().eq('user_id', me).eq('post_id', String(postId));
      }
      return true;
    } catch (e) {
      console.warn('cloud like', e);
      return false;
    }
  };

  window.tchiloCloudSave = async function (postId, saved) {
    var s = SB();
    var me = await uid();
    if (!s || !me || !postId) return false;
    try {
      if (saved) {
        var ins = await s.from('saved_posts').upsert(
          { user_id: me, post_id: String(postId), created_at: new Date().toISOString() },
          { onConflict: 'user_id,post_id' }
        );
        if (ins.error) {
          /* fallback nome da tabela */
          var ins2 = await s.from('saves').upsert(
            { user_id: me, post_id: String(postId), created_at: new Date().toISOString() },
            { onConflict: 'user_id,post_id' }
          );
          if (ins2.error) {
            await s.from('saved_posts').insert({ user_id: me, post_id: String(postId) });
          }
        }
      } else {
        try {
          await s.from('saved_posts').delete().eq('user_id', me).eq('post_id', String(postId));
        } catch (e) {}
        try {
          await s.from('saves').delete().eq('user_id', me).eq('post_id', String(postId));
        } catch (e2) {}
      }
      return true;
    } catch (e) {
      console.warn('cloud save', e);
      return false;
    }
  };

  window.tchiloCloudComment = async function (postId, text) {
    var s = SB();
    var me = await uid();
    if (!s || !me || !postId || !text) return null;
    try {
      var row = {
        post_id: String(postId),
        user_id: me,
        content: String(text).trim(),
        body: String(text).trim(),
        created_at: new Date().toISOString()
      };
      var r = await s.from('comments').insert(row).select('*').maybeSingle();
      if (r.error) {
        delete row.body;
        r = await s.from('comments').insert(row).select('*').maybeSingle();
        if (r.error) throw r.error;
      }
      try {
        var p = await s
          .from('posts')
          .select('user_id,comments_count')
          .eq('id', postId)
          .maybeSingle();
        if (p.data && p.data.user_id) {
          await notify(p.data.user_id, 'comment', 'comentou: ' + text.slice(0, 80), postId);
          if (typeof p.data.comments_count === 'number') {
            await s
              .from('posts')
              .update({ comments_count: (p.data.comments_count || 0) + 1 })
              .eq('id', postId);
          }
        }
      } catch (e) {}
      return r.data;
    } catch (e) {
      console.warn('cloud comment', e);
      return null;
    }
  };

  window.tchiloCloudFollow = async function (targetUsername, following) {
    var s = SB();
    var me = await uid();
    if (!s || !me || !targetUsername) return false;
    var tid = await resolveUserIdByUsername(targetUsername);
    if (!tid) return false;
    try {
      if (following) {
        await s.from('follows').upsert(
          { follower_id: me, following_id: tid, created_at: new Date().toISOString() },
          { onConflict: 'follower_id,following_id' }
        );
        await notify(tid, 'follow', 'começou a seguir-te');
      } else {
        await s.from('follows').delete().eq('follower_id', me).eq('following_id', tid);
      }
      return true;
    } catch (e) {
      console.warn('cloud follow', e);
      return false;
    }
  };

  window.tchiloCloudMessage = async function (toUsername, payload) {
    var s = SB();
    var me = await uid();
    if (!s || !me || !toUsername) return null;
    var rid = await resolveUserIdByUsername(toUsername);
    var row = {
      sender_id: me,
      recipient_id: rid,
      recipient_username: toUsername,
      content: (payload && payload.text) || '',
      media_url: (payload && payload.mediaUrl) || null,
      media_type: (payload && payload.mediaType) || null,
      file_name: (payload && payload.fileName) || null,
      created_at: new Date().toISOString()
    };
    try {
      var r = await s.from('messages').insert(row).select('*').maybeSingle();
      if (r.error) {
        delete row.recipient_id;
        r = await s.from('messages').insert(row).select('*').maybeSingle();
        if (r.error) throw r.error;
      }
      return r.data;
    } catch (e) {
      console.warn('cloud message', e);
      return null;
    }
  };

  function patchLikes() {
    if (typeof window.toggleLike === 'function' && !window.toggleLike.__cloudV2) {
      var orig = window.toggleLike;
      window.toggleLike = function (id, btn) {
        var likes = typeof getLikes === 'function' ? getLikes() : {};
        var willLike = !likes[id];
        var r = orig.apply(this, arguments);
        try {
          window.tchiloCloudLike(id, willLike);
        } catch (e) {}
        return r;
      };
      window.toggleLike.__cloudV2 = true;
      window.toggleLike.__cloud = true;
    }
  }

  function patchSaves() {
    if (typeof window.toggleSave === 'function' && !window.toggleSave.__cloudV2) {
      var orig = window.toggleSave;
      window.toggleSave = function (id, btn) {
        var saves = typeof getSaves === 'function' ? getSaves() : {};
        var willSave = !saves[id];
        var r = orig.apply(this, arguments);
        try {
          window.tchiloCloudSave(id, willSave);
        } catch (e) {}
        return r;
      };
      window.toggleSave.__cloudV2 = true;
    }
  }

  function patchComments() {
    if (typeof window.sendComment === 'function' && !window.sendComment.__cloudV2) {
      var orig = window.sendComment;
      window.sendComment = async function () {
        var input = document.getElementById('commentInput');
        var text = input && input.value ? input.value.trim() : '';
        var postId = window.currentCommentPostId;
        var r = await orig.apply(this, arguments);
        if (text && postId) {
          try {
            await window.tchiloCloudComment(postId, text);
          } catch (e) {}
        }
        return r;
      };
      window.sendComment.__cloudV2 = true;
    }
  }

  function patchChat() {
    if (typeof window.sendChat === 'function' && !window.sendChat.__cloud) {
      var orig = window.sendChat;
      window.sendChat = async function () {
        var input = document.getElementById('chatInput');
        var text = input && input.value ? input.value.trim() : '';
        var pending = window.__tchiloChatPending;
        var other = window.currentChatUser;
        var r = await orig.apply(this, arguments);
        if (other) {
          var payload = { text: text };
          if (pending) {
            payload.mediaUrl = pending.url;
            payload.mediaType = pending.mime || pending.kind;
            payload.fileName = pending.fileName;
          }
          await window.tchiloCloudMessage(other, payload);
        }
        return r;
      };
      window.sendChat.__cloud = true;
    }
  }

  function patchFollow() {
    if (typeof window.toggleFollow === 'function' && !window.toggleFollow.__cloud) {
      var orig = window.toggleFollow;
      window.toggleFollow = function (username) {
        var was = typeof isFollowing === 'function' ? isFollowing(username) : false;
        var r = orig.apply(this, arguments);
        var now = typeof isFollowing === 'function' ? isFollowing(username) : !was;
        window.tchiloCloudFollow(username, now);
        return r;
      };
      window.toggleFollow.__cloud = true;
    }
  }

  function boot() {
    patchLikes();
    patchSaves();
    patchComments();
    patchChat();
    patchFollow();
  }
  boot();
  setTimeout(boot, 400);
  setTimeout(boot, 1500);
  setInterval(boot, 30000);

  console.log('[Tchilo] cloud-force v2: likes/saves/comments → Supabase');
})();

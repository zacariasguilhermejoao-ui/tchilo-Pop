/**
 * Tchilo — força gravação real na Supabase
 * likes, mensagens, comentários, views, follows, notificações
 * perf: setInterval 30s
 */
(function () {
  'use strict';
  if (window.__tchiloCloudForceV1) return;
  window.__tchiloCloudForceV1 = true;

  function SB() {
    return window.tchiloSupabase || window.SB || null;
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
          var p = await s.from('posts').select('user_id,likes_count').eq('id', postId).maybeSingle();
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

  window.tchiloCloudView = async function (postId) {
    var s = SB();
    var me = await uid();
    if (!s || !postId) return;
    try {
      await s.from('post_views').insert({
        user_id: me,
        post_id: String(postId),
        viewed_at: new Date().toISOString()
      });
      try {
        var p = await s.from('posts').select('views_count').eq('id', postId).maybeSingle();
        if (p.data && typeof p.data.views_count === 'number') {
          await s
            .from('posts')
            .update({ views_count: (p.data.views_count || 0) + 1 })
            .eq('id', postId);
        }
      } catch (e) {}
    } catch (e) {}
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
        created_at: new Date().toISOString()
      };
      var r = await s.from('comments').insert(row).select('*').maybeSingle();
      if (r.error) throw r.error;
      try {
        var p = await s.from('posts').select('user_id,comments_count').eq('id', postId).maybeSingle();
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
      }
      if (r.error) throw r.error;
      if (rid) await notify(rid, 'message', (payload && payload.text) || 'enviou-te uma mensagem');
      return r.data;
    } catch (e) {
      console.warn('cloud message', e);
      return null;
    }
  };

  window.tchiloCloudLoadMessages = async function (otherUsername) {
    var s = SB();
    var me = await uid();
    if (!s || !me || !otherUsername) return [];
    var rid = await resolveUserIdByUsername(otherUsername);
    try {
      var r1 = await s
        .from('messages')
        .select('*')
        .eq('sender_id', me)
        .eq('recipient_username', otherUsername)
        .order('created_at', { ascending: true })
        .limit(200);
      var rows = (r1.data || []).slice();
      if (rid) {
        var r2 = await s
          .from('messages')
          .select('*')
          .eq('sender_id', rid)
          .eq('recipient_id', me)
          .order('created_at', { ascending: true })
          .limit(200);
        rows = rows.concat(r2.data || []);
      }
      rows.sort(function (a, b) {
        return new Date(a.created_at) - new Date(b.created_at);
      });
      return rows;
    } catch (e) {
      console.warn('load messages', e);
      return [];
    }
  };

  function patchLikes() {
    if (typeof window.toggleLike === 'function' && !window.toggleLike.__cloud) {
      var orig = window.toggleLike;
      window.toggleLike = function (id, btn) {
        var likes = typeof getLikes === 'function' ? getLikes() : {};
        var willLike = !likes[id];
        var r = orig.apply(this, arguments);
        window.tchiloCloudLike(id, willLike);
        return r;
      };
      window.toggleLike.__cloud = true;
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
        var was =
          typeof isFollowing === 'function' ? isFollowing(username) : false;
        var r = orig.apply(this, arguments);
        var now =
          typeof isFollowing === 'function' ? isFollowing(username) : !was;
        window.tchiloCloudFollow(username, now);
        return r;
      };
      window.toggleFollow.__cloud = true;
    }
  }

  function boot() {
    patchLikes();
    patchChat();
    patchFollow();
  }
  boot();
  setTimeout(boot, 500);
  setTimeout(boot, 2000);
  setInterval(boot, 30000); /* perf: era 5s */

  console.log('[Tchilo] cloud-force ativo');
})();

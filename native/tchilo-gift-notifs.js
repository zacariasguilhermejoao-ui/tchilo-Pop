/**
 * Notificações de presentes
 * Frase: "@Nome enviou-te o presente Coração (10 moedas)."
 */
(function () {
  'use strict';
  if (window.__tchiloGiftNotifsV1) return;
  window.__tchiloGiftNotifsV1 = true;

  function myUsername() {
    try {
      if (typeof getSession === 'function') {
        var s = getSession();
        if (s && s.username) return String(s.username);
      }
    } catch (e) {}
    try {
      var s2 = JSON.parse(localStorage.getItem('tchilo_session') || 'null');
      return (s2 && s2.username) || '';
    } catch (e2) {
      return '';
    }
  }

  function myId() {
    try {
      if (typeof getSession === 'function') {
        var s = getSession();
        return (s && (s.id || s.user_id)) || '';
      }
    } catch (e) {}
    return '';
  }

  function loadList() {
    try {
      return JSON.parse(localStorage.getItem('tchilo_notifications') || '[]') || [];
    } catch (e) {
      return [];
    }
  }

  function saveList(list) {
    try {
      localStorage.setItem('tchilo_notifications', JSON.stringify((list || []).slice(0, 200)));
    } catch (e) {}
  }

  /** Frase organizada */
  function giftMessage(fromName, giftName, coins) {
    var who = String(fromName || 'Alguém').replace(/^@/, '');
    var gift = String(giftName || 'presente');
    var n = coins != null ? coins : '';
    if (n !== '' && n !== null) {
      return '@' + who + ' enviou-te o presente ' + gift + ' (' + n + ' moedas).';
    }
    return '@' + who + ' enviou-te o presente ' + gift + '.';
  }

  window.tchiloGiftNotifMessage = giftMessage;

  function pushLocalNotif(msg, meta) {
    var list = loadList();
    list.unshift({
      type: 'gift',
      message: msg,
      text: msg,
      createdAt: Date.now(),
      from: meta && meta.from,
      gift_name: meta && meta.gift_name,
      coins: meta && meta.coins
    });
    saveList(list);
    try {
      var badge = document.getElementById('badge-notif');
      if (badge) badge.classList.remove('hide');
    } catch (e) {}
    try {
      if (typeof mergeIncomingNotification === 'function') {
        mergeIncomingNotification({
          type: 'gift',
          message: msg,
          content: msg,
          created_at: new Date().toISOString()
        });
      }
    } catch (e2) {}
  }

  /** Chamado pelo emissor: notifica o destinatário (local + Supabase se possível) */
  window.tchiloNotifyGiftReceived = function (toUsername, fromUsername, giftName, coins) {
    var msg = giftMessage(fromUsername, giftName, coins);

    /* se o destinatário és tu (teste local), grava já */
    var me = myUsername();
    if (me && toUsername && String(me).toLowerCase() === String(toUsername).toLowerCase()) {
      pushLocalNotif(msg, {
        from: fromUsername,
        gift_name: giftName,
        coins: coins
      });
    }

    /* inbox por username (para quando o destinatário abrir a app no mesmo browser / sync futuro) */
    try {
      var key = 'tchilo_gift_inbox_' + String(toUsername || '').toLowerCase();
      var inbox = JSON.parse(localStorage.getItem(key) || '[]');
      inbox.unshift({
        from: fromUsername,
        gift_name: giftName,
        coins: coins,
        message: msg,
        at: Date.now()
      });
      localStorage.setItem(key, JSON.stringify(inbox.slice(0, 100)));
    } catch (e) {}

    /* Supabase notifications (se a tabela existir) */
    try {
      var SB = window.tchiloSupabase || window.SB || window.supabaseClient;
      if (SB && SB.from) {
        /* tenta resolver user_id do destinatário pelo username */
        SB.from('profiles')
          .select('id')
          .eq('username', toUsername)
          .maybeSingle()
          .then(function (res) {
            var rid = res && res.data && res.data.id;
            if (!rid) return;
            return SB.from('notifications').insert({
              user_id: rid,
              type: 'gift',
              message: msg,
              content: msg,
              actor_username: fromUsername,
              meta: { gift_name: giftName, coins: coins }
            });
          })
          .catch(function () {});
      }
    } catch (e3) {}
  };

  /** Ao abrir a app, puxar inbox local do teu username */
  function pullMyInbox() {
    var me = myUsername();
    if (!me) return;
    try {
      var key = 'tchilo_gift_inbox_' + me.toLowerCase();
      var inbox = JSON.parse(localStorage.getItem(key) || '[]');
      if (!inbox.length) return;
      inbox.forEach(function (item) {
        if (!item || !item.message) return;
        pushLocalNotif(item.message, item);
      });
      localStorage.setItem(key, '[]');
    } catch (e) {}
  }

  function timeAgo(ts) {
    var d = Date.now() - (ts || 0);
    if (d < 60000) return 'agora';
    if (d < 3600000) return Math.floor(d / 60000) + ' min';
    if (d < 86400000) return Math.floor(d / 3600000) + ' h';
    return Math.floor(d / 86400000) + ' d';
  }

  function renderGiftAware() {
    var listEl = document.getElementById('notifList');
    if (!listEl) return;
    var list = loadList();
    if (!list.length) return;

    /* se ainda está o empty stub, preencher */
    var empty = listEl.querySelector('.empty');
    if (empty || !listEl.querySelector('.notif-item')) {
      listEl.innerHTML = list
        .map(function (n) {
          var msg = n.message || n.text || 'Nova atividade';
          return (
            '<div class="notif-item">' +
            '<div class="notif-text">' +
            msg.replace(/@([\w.]+)/g, '<b>@$1</b>') +
            '<div class="notif-time">' +
            timeAgo(n.createdAt) +
            '</div></div></div>'
          );
        })
        .join('');
    }
  }

  function patchRenderNotifs() {
    if (typeof window.renderNotifs !== 'function') return;
    if (window.renderNotifs.__giftNotifs) return;
    var orig = window.renderNotifs;
    window.renderNotifs = function () {
      try {
        orig.apply(this, arguments);
      } catch (e) {}
      pullMyInbox();
      renderGiftAware();
    };
    window.renderNotifs.__giftNotifs = true;
  }

  pullMyInbox();
  patchRenderNotifs();
  setTimeout(patchRenderNotifs, 500);
  setTimeout(function () {
    pullMyInbox();
    renderGiftAware();
  }, 1200);
})();

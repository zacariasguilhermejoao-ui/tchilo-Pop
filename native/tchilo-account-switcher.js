/**
 * Tchilo — seletor de contas no perfil
 * Ícone no canto superior esquerdo → modal com contas guardadas + "Entrar com outra conta"
 * Troca de conta: termina sessão atual e entra na selecionada (tokens Supabase por conta).
 */
(function () {
  'use strict';
  if (window.__tchiloAccountSwitcherV1) return;
  window.__tchiloAccountSwitcherV1 = true;

  var SAVED_KEY = 'tchilo_saved_accounts';
  var AUTH_MAP_KEY = 'tchilo_auth_by_user';
  var SB_AUTH_KEY = 'sb-edgngwoxhdxcvyzpqjbj-auth-token';
  var ICON_URL = 'PLACEHOLDER_ICON';

  function toast(msg) {
    try {
      if (typeof showToast === 'function') showToast(String(msg));
      else if (typeof window.tchiloToast === 'function') window.tchiloToast(String(msg));
    } catch (e) {}
  }

  function readSession() {
    try {
      if (typeof getSession === 'function') return getSession();
    } catch (e) {}
    try {
      return JSON.parse(localStorage.getItem('tchilo_session') || 'null');
    } catch (e2) {
      return null;
    }
  }

  function writeSession(s) {
    try {
      if (typeof setSession === 'function') setSession(s);
      else localStorage.setItem('tchilo_session', JSON.stringify(s));
    } catch (e) {}
  }

  function loadSaved() {
    try {
      var a = JSON.parse(localStorage.getItem(SAVED_KEY) || '[]');
      return Array.isArray(a) ? a : [];
    } catch (e) {
      return [];
    }
  }

  function saveSaved(list) {
    try {
      localStorage.setItem(SAVED_KEY, JSON.stringify(list || []));
    } catch (e) {}
  }

  function loadAuthMap() {
    try {
      var o = JSON.parse(localStorage.getItem(AUTH_MAP_KEY) || '{}');
      return o && typeof o === 'object' ? o : {};
    } catch (e) {
      return {};
    }
  }

  function saveAuthMap(map) {
    try {
      localStorage.setItem(AUTH_MAP_KEY, JSON.stringify(map || {}));
    } catch (e) {}
  }

  function snapshotCurrentAuth(userId) {
    if (!userId) return;
    try {
      var raw = localStorage.getItem(SB_AUTH_KEY);
      if (!raw) return;
      var map = loadAuthMap();
      map[String(userId)] = raw;
      saveAuthMap(map);
    } catch (e) {}
  }

  function upsertAccount(sess) {
    if (!sess || !(sess.id || sess.username)) return;
    var list = loadSaved();
    var id = sess.id ? String(sess.id) : '';
    var uname = (sess.username || '').toLowerCase();
    var filtered = list.filter(function (a) {
      if (id && a.id && String(a.id) === id) return false;
      if (uname && a.username && String(a.username).toLowerCase() === uname) return false;
      return true;
    });
    filtered.unshift({
      id: sess.id || null,
      username: sess.username || '',
      email: sess.email || '',
      displayName: sess.displayName || sess.username || '',
      avatar: sess.avatar || null
    });
    if (filtered.length > 8) filtered = filtered.slice(0, 8);
    saveSaved(filtered);
    if (sess.id) snapshotCurrentAuth(sess.id);
  }

  function isOwnProfile() {
    try {
      var s = readSession();
      var me = s && (s.username || s.user);
      if (!me) return false;
      var view = window.viewingProfileUser || window.__tchiloViewingProfileUser;
      if (!view) return true;
      return String(view).toLowerCase() === String(me).toLowerCase();
    } catch (e) {
      return !!readSession();
    }
  }

  function ensureCSS() {
    if (document.getElementById('tchiloAccountSwitcherCSS')) return;
    var st = document.createElement('style');
    st.id = 'tchiloAccountSwitcherCSS';
    st.textContent =
      '#tchiloAccSwitchBtn{' +
      'position:relative;width:40px;height:40px;border:0;border-radius:50%;' +
      'background:transparent;display:inline-flex;align-items:center;justify-content:center;' +
      'cursor:pointer;padding:0;flex-shrink:0;margin-right:4px;}' +
      '#tchiloAccSwitchBtn img{width:26px;height:26px;display:block;object-fit:contain;}' +
      'html[data-theme="dark"] #tchiloAccSwitchBtn img,' +
      'html.dark #tchiloAccSwitchBtn img,' +
      'body.dark #tchiloAccSwitchBtn img,' +
      '[data-theme="dark"] #tchiloAccSwitchBtn img{filter:invert(1);}' +
      '#screen-profile .screen-header{display:flex;align-items:center;gap:4px;}' +
      '#tchiloAccSwitchModal{position:fixed;inset:0;z-index:2147483600;display:none;' +
      'align-items:flex-end;justify-content:center;background:rgba(11,11,12,.48);}' +
      '#tchiloAccSwitchModal.open{display:flex!important;}' +
      '#tchiloAccSwitchModal .panel{width:min(100%,430px);max-height:78vh;overflow:auto;' +
      'background:var(--paper,#fff);color:var(--ink,#0B0B0C);border-radius:18px 18px 0 0;' +
      'padding:14px 16px 28px;box-shadow:0 -8px 40px rgba(0,0,0,.18);}' +
      '#tchiloAccSwitchModal .handle{width:40px;height:4px;border-radius:2px;' +
      'background:rgba(128,128,128,.35);margin:2px auto 14px;}' +
      '#tchiloAccSwitchModal .title{font-size:16px;font-weight:700;margin:0 0 12px;text-align:center;}' +
      '#tchiloAccSwitchModal .acc-row{display:flex;align-items:center;gap:12px;padding:10px 8px;' +
      'border-radius:12px;cursor:pointer;border:0;background:transparent;width:100%;text-align:left;' +
      'color:inherit;font:inherit;}' +
      '#tchiloAccSwitchModal .acc-row:active,#tchiloAccSwitchModal .acc-row:hover{background:rgba(128,128,128,.1);}' +
      '#tchiloAccSwitchModal .acc-av{width:44px;height:44px;border-radius:50%;object-fit:cover;' +
      'background:rgba(128,128,128,.2);flex-shrink:0;display:flex;align-items:center;justify-content:center;' +
      'font-weight:700;font-size:16px;overflow:hidden;}' +
      '#tchiloAccSwitchModal .acc-av img{width:100%;height:100%;object-fit:cover;}' +
      '#tchiloAccSwitchModal .acc-meta{flex:1;min-width:0;}' +
      '#tchiloAccSwitchModal .acc-name{font-weight:650;font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}' +
      '#tchiloAccSwitchModal .acc-user{font-size:13px;opacity:.65;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}' +
      '#tchiloAccSwitchModal .acc-check{width:22px;height:22px;flex-shrink:0;color:#18E8B0;}' +
      '#tchiloAccSwitchModal .divider{height:1px;background:rgba(128,128,128,.18);margin:10px 0;}' +
      '#tchiloAccSwitchModal .other-btn{display:flex;align-items:center;justify-content:center;gap:8px;' +
      'width:100%;padding:14px 12px;border-radius:14px;border:1.5px solid rgba(128,128,128,.25);' +
      'background:transparent;color:inherit;font-weight:650;font-size:15px;cursor:pointer;}' +
      '#tchiloAccSwitchModal .other-btn:active{opacity:.85;}' +
      '#tchiloAccSwitchModal .empty{text-align:center;opacity:.6;padding:12px 8px;font-size:14px;}';
    (document.head || document.documentElement).appendChild(st);
  }

  function ensureModal() {
    if (document.getElementById('tchiloAccSwitchModal')) return;
    var el = document.createElement('div');
    el.id = 'tchiloAccSwitchModal';
    el.innerHTML =
      '<div class="panel" role="dialog" aria-modal="true" aria-label="Contas">' +
      '<div class="handle"></div>' +
      '<div class="title">Contas neste dispositivo</div>' +
      '<div id="tchiloAccSwitchList"></div>' +
      '<div class="divider"></div>' +
      '<button type="button" class="other-btn" id="tchiloAccSwitchOther">Entrar com outra conta</button>' +
      '</div>';
    document.body.appendChild(el);
    el.addEventListener('click', function (e) {
      if (e.target === el) closeModal();
    });
    var other = document.getElementById('tchiloAccSwitchOther');
    if (other) {
      other.addEventListener('click', function () {
        closeModal();
        loginWithOtherAccount();
      });
    }
  }

  function avatarHtml(acc) {
    if (acc.avatar) {
      return '<div class="acc-av"><img src="' + String(acc.avatar).replace(/"/g, '') + '" alt=""></div>';
    }
    var letter = (acc.displayName || acc.username || '?').charAt(0).toUpperCase();
    return '<div class="acc-av">' + letter + '</div>';
  }

  function renderList() {
    var listEl = document.getElementById('tchiloAccSwitchList');
    if (!listEl) return;
    var sess = readSession();
    var list = loadSaved();
    if (sess && (sess.id || sess.username)) {
      upsertAccount(sess);
      list = loadSaved();
    }
    if (!list.length) {
      listEl.innerHTML = '<div class="empty">Nenhuma conta guardada ainda</div>';
      return;
    }
    var html = '';
    list.forEach(function (acc) {
      var isCurrent =
        sess &&
        ((sess.id && acc.id && String(sess.id) === String(acc.id)) ||
          (sess.username &&
            acc.username &&
            String(sess.username).toLowerCase() === String(acc.username).toLowerCase()));
      var check = isCurrent
        ? '<svg class="acc-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>'
        : '<span class="acc-check"></span>';
      html +=
        '<button type="button" class="acc-row" data-id="' +
        String(acc.id || '').replace(/"/g, '') +
        '" data-user="' +
        String(acc.username || '').replace(/"/g, '') +
        '">' +
        avatarHtml(acc) +
        '<div class="acc-meta"><div class="acc-name">' +
        escapeHtml(acc.displayName || acc.username || 'Conta') +
        '</div><div class="acc-user">@' +
        escapeHtml(acc.username || '') +
        '</div></div>' +
        check +
        '</button>';
    });
    listEl.innerHTML = html;
    listEl.querySelectorAll('.acc-row').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.getAttribute('data-id');
        var user = btn.getAttribute('data-user');
        switchToAccount(id, user);
      });
    });
  }

  function escapeHtml(s) {
    return String(s || '')
      .replace(/&/g, '&')
      .replace(/</g, '<')
      .replace(/>/g, '>')
      .replace(/"/g, '"');
  }

  function openModal() {
    ensureCSS();
    ensureModal();
    renderList();
    var m = document.getElementById('tchiloAccSwitchModal');
    if (m) m.classList.add('open');
  }

  function closeModal() {
    var m = document.getElementById('tchiloAccSwitchModal');
    if (m) m.classList.remove('open');
  }

  async function loginWithOtherAccount() {
    var sess = readSession();
    if (sess && sess.id) snapshotCurrentAuth(sess.id);

    try {
      if (window.tchiloSupabase && window.tchiloSupabase.auth) {
        await window.tchiloSupabase.auth.signOut({ scope: 'local' });
      }
    } catch (e) {}

    try {
      if (typeof clearSession === 'function') clearSession();
      else localStorage.removeItem('tchilo_session');
    } catch (e2) {}

    try {
      window.__tchiloLockedSession = null;
    } catch (e3) {}

    toast('Entra com outra conta');
    setTimeout(function () {
      try {
        location.reload();
      } catch (e6) {}
    }, 400);
  }

  async function switchToAccount(id, username) {
    var sess = readSession();
    if (
      sess &&
      ((id && sess.id && String(sess.id) === String(id)) ||
        (username &&
          sess.username &&
          String(sess.username).toLowerCase() === String(username).toLowerCase()))
    ) {
      closeModal();
      return;
    }

    if (sess && sess.id) snapshotCurrentAuth(sess.id);

    var map = loadAuthMap();
    var tokenRaw = id && map[String(id)] ? map[String(id)] : null;

    if (!tokenRaw) {
      toast('Sessão desta conta não está guardada. Entra de novo.');
      closeModal();
      var list = loadSaved();
      var acc = list.find(function (a) {
        return (id && String(a.id) === String(id)) || (username && a.username === username);
      });
      try {
        sessionStorage.setItem('tchilo_prefill_email', (acc && acc.email) || '');
      } catch (e) {}
      await loginWithOtherAccount();
      return;
    }

    closeModal();
    toast('A mudar de conta…');

    try {
      localStorage.setItem(SB_AUTH_KEY, tokenRaw);
    } catch (e) {}

    try {
      if (window.tchiloSupabase && window.tchiloSupabase.auth) {
        var parsed = null;
        try {
          parsed = JSON.parse(tokenRaw);
        } catch (eP) {}
        if (parsed) {
          var at = parsed.access_token || (parsed.currentSession && parsed.currentSession.access_token);
          var rt = parsed.refresh_token || (parsed.currentSession && parsed.currentSession.refresh_token);
          if (at && rt) {
            await window.tchiloSupabase.auth.setSession({ access_token: at, refresh_token: rt });
          }
        }
      }
    } catch (e2) {
      console.warn('[Tchilo] setSession auth', e2);
    }

    var list = loadSaved();
    var acc = list.find(function (a) {
      return (id && String(a.id) === String(id)) || (username && a.username === username);
    });
    if (acc) {
      writeSession({
        id: acc.id,
        username: acc.username,
        email: acc.email || '',
        displayName: acc.displayName || acc.username,
        avatar: acc.avatar || null,
        privateAccount: false,
        anonymousMode: false
      });
    }

    try {
      window.__tchiloLockedSession = acc
        ? { username: acc.username, id: acc.id, email: acc.email }
        : null;
      window.viewingProfileUser = null;
      window.__tchiloViewingProfileUser = null;
    } catch (e3) {}

    setTimeout(function () {
      try {
        location.reload();
      } catch (e4) {}
    }, 350);
  }

  function injectButton() {
    ensureCSS();
    var header = document.querySelector('#screen-profile .screen-header');
    if (!header) return;

    var existing = document.getElementById('tchiloAccSwitchBtn');
    var own = isOwnProfile() && !!readSession();

    if (!own) {
      if (existing) existing.style.display = 'none';
      return;
    }

    if (existing) {
      existing.style.display = '';
      return;
    }

    var btn = document.createElement('button');
    btn.id = 'tchiloAccSwitchBtn';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Mudar de conta');
    btn.innerHTML = '<img src="' + ICON_URL + '" alt="" width="26" height="26">';
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      openModal();
    });

    var back = header.querySelector('.back-btn');
    if (back && back.parentNode === header) {
      header.insertBefore(btn, back);
    } else {
      header.insertBefore(btn, header.firstChild);
    }
  }

  function patchSetSession() {
    if (typeof window.setSession !== 'function') return;
    if (window.setSession.__accSwitch) return;
    var orig = window.setSession;
    window.setSession = function (user) {
      var r = orig.apply(this, arguments);
      try {
        if (user && (user.id || user.username)) {
          upsertAccount(user);
          snapshotCurrentAuth(user.id);
        }
      } catch (e) {}
      return r;
    };
    window.setSession.__accSwitch = true;
  }

  function boot() {
    patchSetSession();
    injectButton();
    try {
      var s = readSession();
      if (s && s.id) {
        upsertAccount(s);
        snapshotCurrentAuth(s.id);
      }
    } catch (e) {}
  }

  boot();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  setTimeout(boot, 300);
  setTimeout(boot, 1200);

  if (typeof window.goTo === 'function' && !window.goTo.__accSwitch) {
    var g = window.goTo;
    window.goTo = function () {
      var r = g.apply(this, arguments);
      setTimeout(injectButton, 50);
      setTimeout(injectButton, 200);
      return r;
    };
    window.goTo.__accSwitch = true;
  }

  try {
    var obs = new MutationObserver(function () {
      injectButton();
    });
    obs.observe(document.documentElement, { childList: true, subtree: true });
  } catch (e) {}
})();

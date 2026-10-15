/**
 * Tchilo — seletor de contas no perfil v4
 * Ícone no header do perfil — SEM MutationObserver
 */
(function () {
  'use strict';
  if (window.__tchiloAccountSwitcherV4) return;
  window.__tchiloAccountSwitcherV4 = true;
  window.__tchiloAccountSwitcherV3 = true;
  window.__tchiloAccountSwitcherV2 = true;
  window.__tchiloAccountSwitcherV1 = true;

  var SAVED_KEY = 'tchilo_saved_accounts';
  var AUTH_MAP_KEY = 'tchilo_auth_by_user';
  var SB_AUTH_KEY = 'sb-edgngwoxhdxcvyzpqjbj-auth-token';

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
      'background:transparent;display:inline-flex!important;align-items:center;justify-content:center;' +
      'cursor:pointer;padding:0;flex-shrink:0;margin-right:4px;z-index:5;' +
      'visibility:visible!important;opacity:1!important;}' +
      '#tchiloAccSwitchBtn svg{width:26px;height:26px;display:block;color:var(--ink,#0B0B0C);}' +
      '#tchiloAccountSwitchBtn{display:none!important;}' +
      '#tchiloAccSwitchModal{position:fixed;inset:0;z-index:2147483600;display:none;' +
      'align-items:flex-end;justify-content:center;background:rgba(11,11,12,.48);}' +
      '#tchiloAccSwitchModal.open{display:flex!important;}' +
      '#tchiloAccSwitchModal .panel{width:min(100%,430px);max-height:78vh;overflow:auto;' +
      'background:var(--paper,#fff);color:var(--ink,#0B0B0C);border-radius:18px 18px 0 0;' +
      'padding:14px 16px 28px;}' +
      '#tchiloAccSwitchModal .handle{width:40px;height:4px;border-radius:2px;' +
      'background:rgba(128,128,128,.35);margin:2px auto 14px;}' +
      '#tchiloAccSwitchModal .title{font-size:16px;font-weight:700;margin:0 0 12px;text-align:center;}' +
      '#tchiloAccSwitchModal .acc-row{display:flex;align-items:center;gap:12px;padding:10px 8px;' +
      'border-radius:12px;cursor:pointer;border:0;background:transparent;width:100%;text-align:left;color:inherit;font:inherit;}' +
      '#tchiloAccSwitchModal .acc-av{width:44px;height:44px;border-radius:50%;object-fit:cover;' +
      'background:rgba(128,128,128,.2);flex-shrink:0;display:flex;align-items:center;justify-content:center;' +
      'font-weight:700;font-size:16px;overflow:hidden;}' +
      '#tchiloAccSwitchModal .acc-av img{width:100%;height:100%;object-fit:cover;}' +
      '#tchiloAccSwitchModal .acc-meta{flex:1;min-width:0;}' +
      '#tchiloAccSwitchModal .acc-name{font-weight:650;font-size:15px;}' +
      '#tchiloAccSwitchModal .acc-user{font-size:13px;opacity:.65;}' +
      '#tchiloAccSwitchModal .acc-check{width:24px;height:24px;flex-shrink:0;}' +
      '#tchiloAccSwitchModal .divider{height:1px;background:rgba(128,128,128,.18);margin:10px 0;}' +
      '#tchiloAccSwitchModal .other-btn{display:flex;align-items:center;justify-content:center;' +
      'width:100%;padding:14px 12px;border-radius:14px;border:1.5px solid rgba(128,128,128,.25);' +
      'background:transparent;color:inherit;font-weight:650;font-size:15px;cursor:pointer;}' +
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

  function escapeHtml(s) {
    return String(s || '')
      .replace(/&/g, '&')
      .replace(/</g, '<')
      .replace(/>/g, '>')
      .replace(/"/g, '"');
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
        ? '<svg class="acc-check" viewBox="0 0 1024 1024" fill="none"><path d="M170 540L400 770L854 254" stroke="#18E8B0" stroke-width="96" stroke-linecap="round" stroke-linejoin="round"/></svg>'
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
        switchToAccount(btn.getAttribute('data-id'), btn.getAttribute('data-user'));
      });
    });
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
        (username && sess.username && String(sess.username).toLowerCase() === String(username).toLowerCase()))
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
    } catch (e2) {}
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
      window.__tchiloLockedSession = acc ? { username: acc.username, id: acc.id, email: acc.email } : null;
      window.viewingProfileUser = null;
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
    if (!header) return false;

    var existing = document.getElementById('tchiloAccSwitchBtn');
    var own = isOwnProfile() && !!readSession();

    if (!own) {
      if (existing) existing.style.display = 'none';
      return false;
    }

    if (existing) {
      existing.style.display = 'inline-flex';
      existing.style.visibility = 'visible';
      existing.style.opacity = '1';
      /* garantir que está no header */
      if (existing.parentNode !== header) {
        header.insertBefore(existing, header.firstChild);
      }
      return true;
    }

    var btn = document.createElement('button');
    btn.id = 'tchiloAccSwitchBtn';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Mudar de conta');
    btn.innerHTML =
      '<svg viewBox="0 0 1024 1024" width="26" height="26" fill="none" aria-hidden="true">' +
      '<circle cx="512" cy="401" r="100" stroke="currentColor" stroke-width="52"/>' +
      '<path d="M305 723V690A111 111 0 0 1 416 579H606A111 111 0 0 1 718 690V723Z" stroke="currentColor" stroke-width="52" stroke-linejoin="round"/>' +
      '<path d="M512 102A410 410 0 1 1 125 650" stroke="currentColor" stroke-width="64" stroke-linecap="round"/>' +
      '<path d="M233 703L127 652L76 762" stroke="currentColor" stroke-width="64" stroke-linecap="round" stroke-linejoin="round"/>' +
      '</svg>';
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      openModal();
    });
    header.insertBefore(btn, header.firstChild);
    return true;
  }

  function scheduleInject() {
    injectButton();
    setTimeout(injectButton, 80);
    setTimeout(injectButton, 250);
    setTimeout(injectButton, 600);
  }

  function boot() {
    scheduleInject();
    try {
      var s = readSession();
      if (s && s.id) {
        upsertAccount(s);
        snapshotCurrentAuth(s.id);
      }
    } catch (e) {}
  }

  boot();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  }
  setTimeout(boot, 800);
  setTimeout(boot, 2000);

  /* Ao ir para o perfil, mete o ícone (sem observer) */
  if (typeof window.goTo === 'function' && !window.goTo.__accSwitchV4) {
    var g = window.goTo;
    window.goTo = function () {
      var args = arguments;
      var r = g.apply(this, args);
      var name = String(args[0] || '');
      if (name === 'profile' || name.indexOf('profile') !== -1) {
        scheduleInject();
      }
      return r;
    };
    window.goTo.__accSwitchV4 = true;
  }

  if (typeof window.renderProfile === 'function' && !window.renderProfile.__accSwitchV4) {
    var rp = window.renderProfile;
    window.renderProfile = function () {
      var r = rp.apply(this, arguments);
      scheduleInject();
      return r;
    };
    window.renderProfile.__accSwitchV4 = true;
  }

  /* Clique no tab Perfil da navbar */
  document.addEventListener(
    'click',
    function (e) {
      var t = e.target;
      if (!t || !t.closest) return;
      var nav = t.closest('.nav-item[data-screen="profile"]');
      if (nav) scheduleInject();
    },
    true
  );

  window.tchiloOpenAccountSwitcher = openModal;
})();

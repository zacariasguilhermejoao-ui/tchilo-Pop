/**
 * Tchilo — menu do perfil
 * v21 — seletor + menu ⋯ SÓ no próprio perfil; em perfis de outros só partilhar
 */
(function () {
  'use strict';
  if (window.__tchiloProfileShareV21) return;
  window.__tchiloProfileShareV21 = true;
  window.__tchiloProfileShareV20 = true;

  function loadScript(src) {
    try {
      if (document.querySelector('script[src*="' + src.split('?')[0] + '"]')) return;
      var s = document.createElement('script');
      s.src = src;
      s.async = true;
      (document.head || document.documentElement).appendChild(s);
    } catch (e) {}
  }

  try {
    var sAcc = document.createElement('script');
    sAcc.src = 'native/tchilo-account-switcher.js?v=8';
    sAcc.async = true;
    (document.head || document.documentElement).appendChild(sAcc);
  } catch (eAcc) {}

  try {
    loadScript('native/tchilo-no-header-line.js?v=6');
  } catch (e2) {}

  var IC_QR =
    '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
    '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>' +
    '<path d="M14 14h3v3h-3zM20 14v6M14 20h6"/>' +
    '</svg>';

  var IC = {
    share:
      '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' +
      '<circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/>' +
      '<path d="M8.5 13.5l7 4M15.5 6.5l-7 4"/>' +
      '</svg>',
    qr: IC_QR,
    settings:
      '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      '<circle cx="12" cy="12" r="3"/>' +
      '<path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>' +
      '</svg>',
    close:
      '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round">' +
      '<path d="M6 6l12 12M18 6L6 18"/>' +
      '</svg>',
    more:
      '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">' +
      '<path d="M4 7h16M4 12h16M4 17h16"/>' +
      '</svg>'
  };

  function toast(msg) {
    try {
      if (typeof showToast === 'function') showToast(String(msg));
      else alert(String(msg));
    } catch (e) {}
  }

  function sessionUser() {
    try {
      if (typeof getSession === 'function') return getSession();
    } catch (e) {}
    try {
      return JSON.parse(localStorage.getItem('tchilo_session') || 'null');
    } catch (e2) {
      return null;
    }
  }

  function currentProfileUsername() {
    try {
      if (window.viewingProfileUser) return String(window.viewingProfileUser);
    } catch (e) {}
    try {
      var s = sessionUser();
      return (s && (s.username || s.user || s.name)) || '';
    } catch (e2) {
      return '';
    }
  }

  function isOwnProfile() {
    try {
      var s = sessionUser();
      var me = s && (s.username || s.user);
      if (!me) return !window.viewingProfileUser;
      var view = window.viewingProfileUser;
      if (!view) return true;
      return String(view).toLowerCase() === String(me).toLowerCase();
    } catch (e) {
      return !window.viewingProfileUser;
    }
  }

  function profileUrl(user) {
    var u = String(user || '').replace(/^@/, '');
    var origin = (window.location && window.location.origin) || 'https://tchilopop.com';
    return origin + '/?u=' + encodeURIComponent(u);
  }

  function copyText(text) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(
          function () { toast('Link copiado'); },
          function () { toast('Não foi possível copiar'); }
        );
        return;
      }
    } catch (e) {}
    try {
      var ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      toast('Link copiado');
    } catch (e2) {
      toast('Não foi possível copiar');
    }
  }

  function shareNative(url, title) {
    try {
      if (navigator.share) {
        navigator.share({ title: title || 'Tchilo', url: url }).catch(function () {});
        return;
      }
    } catch (e) {}
    copyText(url);
  }

  function ensureCSS() {
    if (document.getElementById('tchiloProfileShareCSS')) return;
    var st = document.createElement('style');
    st.id = 'tchiloProfileShareCSS';
    st.textContent =
      '#tchiloProfileShareSheet{position:fixed;inset:0;z-index:2147483000;display:none;align-items:flex-end;justify-content:center;background:rgba(11,11,12,.42);}' +
      '#tchiloProfileShareSheet.open{display:flex!important;}' +
      '#tchiloProfileShareSheet .tchilo-ps-panel{width:min(100%,430px);background:var(--paper,#F6F1E7);border-radius:22px 22px 0 0;padding:12px 16px 28px;color:var(--ink,#0B0B0C);}' +
      '#tchiloProfileShareSheet .tchilo-ps-handle{width:40px;height:4px;border-radius:4px;background:rgba(11,11,12,.18);margin:4px auto 12px;}' +
      '#tchiloProfileShareSheet .tchilo-ps-title{text-align:center;font:700 16px system-ui,-apple-system,sans-serif;margin:0 0 10px;}' +
      '#tchiloProfileShareSheet .opt{display:flex;align-items:center;gap:12px;width:100%;padding:14px 10px;border:0;background:transparent;text-align:left;font:500 15px system-ui,sans-serif;cursor:pointer;color:inherit;border-radius:12px;}' +
      '#tchiloProfileShareSheet .opt:active{background:rgba(11,11,12,.06);}' +
      '#tchiloProfileShareSheet .opt .ic{width:28px;display:flex;align-items:center;justify-content:center;}' +
      '#tchiloProfileShareSheet .cancel{width:100%;margin-top:8px;padding:14px;border:0;border-radius:14px;background:rgba(11,11,12,.06);font:700 15px system-ui,sans-serif;cursor:pointer;}' +
      '#screen-profile .screen-header{border:0!important;border-bottom:none!important;box-shadow:none!important;display:flex!important;align-items:center!important;}' +
      '#screen-profile.own-profile .screen-header .back-btn,' +
      'body:not(.viewing-other-profile) #screen-profile .screen-header .back-btn{' +
      'display:none!important;}' +
      /* menu ⋯ e seletor: SÓ no próprio perfil */
      '#screen-profile:not(.own-profile) #tchiloProfileMoreBtn,' +
      'body.viewing-other-profile #tchiloProfileMoreBtn,' +
      '#screen-profile:not(.own-profile) #tchiloAccountSwitchBtn,' +
      'body.viewing-other-profile #tchiloAccountSwitchBtn{' +
      'display:none!important;visibility:hidden!important;pointer-events:none!important;}' +
      '#tchiloProfileMoreBtn{margin-left:auto;display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;border:0;background:transparent;border-radius:50%;cursor:pointer;color:var(--ink);}' +
      'body.viewing-other-profile #screen-profile .tchilo-profile-share-btn{display:inline-flex!important;}';
    document.head.appendChild(st);
  }

  function closeSheet() {
    var el = document.getElementById('tchiloProfileShareSheet');
    if (el) el.classList.remove('open');
  }

  function openSheet() {
    /* Só no próprio perfil */
    if (!isOwnProfile()) {
      /* em perfil alheio: partilhar URL simples */
      var user = currentProfileUsername();
      shareNative(profileUrl(user), 'Tchilo @' + user);
      return;
    }
    ensureCSS();
    var user = currentProfileUsername();
    var url = profileUrl(user);
    var wrap = document.getElementById('tchiloProfileShareSheet');
    if (!wrap) {
      wrap = document.createElement('div');
      wrap.id = 'tchiloProfileShareSheet';
      document.body.appendChild(wrap);
    }
    wrap.innerHTML =
      '<div class="tchilo-ps-panel">' +
      '<div class="tchilo-ps-handle"></div>' +
      '<div class="tchilo-ps-title">Opções</div>' +
      '<button type="button" class="opt" data-act="settings"><span class="ic">' +
      IC.settings +
      '</span><span>Definições</span></button>' +
      '<button type="button" class="opt" data-act="share"><span class="ic">' +
      IC.share +
      '</span><span>Partilhar URL</span></button>' +
      '<button type="button" class="opt" data-act="qr"><span class="ic">' +
      IC.qr +
      '</span><span>Código QR</span></button>' +
      '<button type="button" class="cancel" data-a="close">Cancelar</button></div>';

    wrap.classList.add('open');
    wrap.onclick = function (e) {
      if (e.target === wrap) closeSheet();
    };
    wrap.querySelectorAll('.opt, .cancel').forEach(function (b) {
      b.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var act = b.getAttribute('data-act');
        if (b.classList.contains('cancel') || b.getAttribute('data-a') === 'close') {
          closeSheet();
          return;
        }
        if (act === 'share') {
          shareNative(url, 'Tchilo @' + user);
          closeSheet();
          return;
        }
        if (act === 'settings') {
          closeSheet();
          try {
            if (typeof goTo === 'function') goTo('settings');
            else if (typeof window.goTo === 'function') window.goTo('settings');
          } catch (err) {}
          return;
        }
        if (act === 'qr') {
          closeSheet();
          try {
            if (typeof window.tchiloShowQr === 'function') window.tchiloShowQr(url);
            else copyText(url);
          } catch (err2) {
            copyText(url);
          }
        }
      });
    });
  }

  window.tchiloOpenProfileShare = openSheet;
  window.openProfileShareSheet = openSheet;

  function polishProfileHeader() {
    ensureCSS();
    var screen = document.getElementById('screen-profile');
    if (!screen) return;
    var header = screen.querySelector('.screen-header');
    if (!header) return;

    var own = isOwnProfile();
    if (own) {
      screen.classList.add('own-profile');
      document.body.classList.remove('viewing-other-profile');
      var back = header.querySelector('.back-btn');
      if (back) {
        back.style.setProperty('display', 'none', 'important');
        back.setAttribute('aria-hidden', 'true');
      }
    } else {
      screen.classList.remove('own-profile');
      document.body.classList.add('viewing-other-profile');
    }

    header.style.setProperty('border-bottom', 'none', 'important');
    header.style.setProperty('box-shadow', 'none', 'important');

    /* Seletor de contas: só próprio perfil */
    var oldAcc = document.getElementById('tchiloAccountSwitchBtn');
    if (oldAcc) {
      if (own) {
        oldAcc.style.display = '';
        oldAcc.style.visibility = '';
        oldAcc.style.pointerEvents = '';
      } else {
        oldAcc.style.setProperty('display', 'none', 'important');
        oldAcc.style.setProperty('visibility', 'hidden', 'important');
        oldAcc.style.setProperty('pointer-events', 'none', 'important');
      }
    }

    var btn = document.getElementById('tchiloProfileMoreBtn');
    if (own) {
      if (!btn) {
        btn = document.createElement('button');
        btn.type = 'button';
        btn.id = 'tchiloProfileMoreBtn';
        btn.className = 'tchilo-profile-more';
        btn.setAttribute('aria-label', 'Menu');
        btn.innerHTML = IC.more;
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          openSheet();
        });
        header.appendChild(btn);
      } else {
        btn.innerHTML = IC.more;
        btn.style.display = 'inline-flex';
        btn.style.visibility = 'visible';
        btn.style.pointerEvents = 'auto';
      }
    } else {
      if (btn) {
        btn.style.setProperty('display', 'none', 'important');
        btn.style.setProperty('visibility', 'hidden', 'important');
        btn.style.setProperty('pointer-events', 'none', 'important');
      }
    }
  }

  polishProfileHeader();
  setTimeout(polishProfileHeader, 400);
  setTimeout(polishProfileHeader, 1500);
  if (typeof window.renderProfile === 'function' && !window.renderProfile.__shareMenuV21) {
    var rp = window.renderProfile;
    window.renderProfile = function () {
      var r = rp.apply(this, arguments);
      setTimeout(polishProfileHeader, 40);
      setTimeout(polishProfileHeader, 200);
      return r;
    };
    window.renderProfile.__shareMenuV21 = true;
    window.renderProfile.__shareMenuV20 = true;
    window.renderProfile.__shareMenu = true;
  }
})();

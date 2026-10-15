/**
 * Tchilo — menu do perfil
 * v18 — carrega seletor de contas + tranca ícone mensagem + 3 traços
 */
(function () {
  'use strict';
  if (window.__tchiloProfileShareV18) return;
  window.__tchiloProfileShareV18 = true;
  window.__tchiloProfileShareV17 = true;
  window.__tchiloProfileShareV16 = true;
  window.__tchiloProfileShareV15 = true;
  window.__tchiloProfileShareV14 = true;

  function loadScript(src) {
    var base = src.split('?')[0];
    var exists = false;
    document.querySelectorAll('script[src]').forEach(function (el) {
      if ((el.getAttribute('src') || '').indexOf(base) !== -1) exists = true;
    });
    if (exists) return;
    var s = document.createElement('script');
    s.src = src;
    s.async = true;
    (document.head || document.documentElement).appendChild(s);
  }

  /* Seletor de contas */
  if (!window.__tchiloAccountSwitcherV2 && !window.__tchiloAccountSwitcherV1) {
    loadScript('native/tchilo-account-switcher.js?v=3');
  }
  /* Tranca do ícone de mensagem do index */
  if (!window.__tchiloMsgIconLockV2) {
    loadScript('native/tchilo-msg-icon-lock.js?v=2');
  }
  /* Reforçar remoção de riscos (caso cache antigo do index) */
  if (!window.__tchiloNoHeaderLineV5) {
    loadScript('native/tchilo-no-header-line.js?v=5');
  }

  var openGuardUntil = 0;

  var IC_QR =
    '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">' +
    '<rect x="2" y="2" width="8" height="8" rx="1.2" fill="none" stroke="currentColor" stroke-width="2"/>' +
    '<rect x="14" y="2" width="8" height="8" rx="1.2" fill="none" stroke="currentColor" stroke-width="2"/>' +
    '<rect x="2" y="14" width="8" height="8" rx="1.2" fill="none" stroke="currentColor" stroke-width="2"/>' +
    '<rect x="4.2" y="4.2" width="3.6" height="3.6" rx="0.6" fill="currentColor"/>' +
    '<rect x="16.2" y="4.2" width="3.6" height="3.6" rx="0.6" fill="currentColor"/>' +
    '<rect x="4.2" y="16.2" width="3.6" height="3.6" rx="0.6" fill="currentColor"/>' +
    '<circle cx="14.5" cy="17" r="1.4" fill="#18E8B0"/>' +
    '<circle cx="18" cy="17" r="1.4" fill="#F800A0"/>' +
    '<circle cx="21.5" cy="17" r="1.4" fill="#7800F8"/>' +
    '</svg>';

  var IC = {
    link:
      '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M10 13a5 5 0 0 0 7.07.07l1.76-1.76a5 5 0 0 0-7.07-7.07L10.5 5.5"/>' +
      '<path d="M14 11a5 5 0 0 0-7.07-.07L5.17 12.7a5 5 0 0 0 7.07 7.07L13.5 18.5"/>' +
      '</svg>',
    share:
      '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' +
      '<circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/>' +
      '<path d="M8.5 13.5l7 4M15.5 6.5l-7 4"/>' +
      '</svg>',
    qr: IC_QR,
    settings:
      '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      '<circle cx="12" cy="12" r="3"/>' +
      '<path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>' +
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
    } catch (e) {
      try { alert(String(msg)); } catch (e2) {}
    }
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
      if (!me) return true;
      var view = window.viewingProfileUser;
      if (!view) return true;
      return String(view).toLowerCase() === String(me).toLowerCase();
    } catch (e) {
      return true;
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
      '#tchiloProfileShareSheet .tchilo-ps-handle{width:40px;height:4px;border-radius:4px;background:rgba(11,11,12,.18);margin:4px auto 14px;}' +
      '#tchiloProfileShareSheet h3,#tchiloProfileShareSheet .tchilo-ps-user{display:none!important;}' +
      '#tchiloProfileShareSheet .opt{display:flex;align-items:center;gap:14px;width:100%;padding:14px 10px;border:0;border-bottom:0.5px solid rgba(11,11,12,.08);background:transparent;text-align:left;font:600 16px system-ui,-apple-system,sans-serif;color:var(--ink,#0B0B0C);cursor:pointer;}' +
      '#tchiloProfileShareSheet .opt:last-child{border-bottom:0;}' +
      '#tchiloProfileShareSheet .opt .ic{width:28px;height:28px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}' +
      '#tchiloProfileShareSheet .opt-close{opacity:.7;}' +
      '.tchilo-profile-more{margin-left:auto;width:40px;height:40px;border:0;border-radius:8px;background:transparent;display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--ink,#0B0B0C);}' +
      '#screen-profile .screen-header{border:0!important;border-bottom:none!important;box-shadow:none!important;display:flex!important;align-items:center!important;}' +
      '#screen-profile.own-profile .screen-header .back-btn,' +
      'body:not(.viewing-other-profile) #screen-profile .screen-header .back-btn{' +
      'display:none!important;visibility:hidden!important;width:0!important;height:0!important;padding:0!important;margin:0!important;overflow:hidden!important;}' +
      '#tchiloAccSwitchBtn{display:inline-flex!important;visibility:visible!important;opacity:1!important;}' +
      '#tchiloAccountSwitchBtn{display:none!important;}' +
      '#tchiloQrModal{position:fixed;inset:0;z-index:2147483647;display:none;align-items:center;justify-content:center;background:rgba(11,11,12,.72);padding:20px;}' +
      '#tchiloQrModal.open{display:flex!important;}' +
      '#tchiloQrModal .card{background:var(--paper,#F3F1E9);color:var(--ink,#0B0B0C);border-radius:20px;padding:18px;max-width:360px;width:100%;}' +
      '#tchiloQrModal .qr-title{font-size:20px;font-weight:800;text-align:center;margin:0 0 6px;}' +
      '#tchiloQrModal .qr-user{text-align:center;font-weight:700;opacity:.55;margin:0 0 12px;font-size:13px;}' +
      '#tchiloQrModal .actions{display:flex;flex-direction:column;gap:10px;margin-top:14px;}' +
      '#tchiloQrModal .actions button{padding:13px;border-radius:14px;font-weight:700;cursor:pointer;border:0;font-size:15px;}' +
      '#tchiloQrModal .actions .primary{background:var(--ink,#0B0B0C);color:#fff;}' +
      '#tchiloQrModal .actions .ghost{background:rgba(11,11,12,.06);color:var(--ink,#0B0B0C);}';
    document.head.appendChild(st);
  }

  function closeSheet() {
    if (Date.now() < openGuardUntil) return;
    var el = document.getElementById('tchiloProfileShareSheet');
    if (!el) return;
    el.classList.remove('open');
    try { el.remove(); } catch (e) {}
  }

  function closeQr() {
    var modal = document.getElementById('tchiloQrModal');
    if (modal) modal.classList.remove('open');
  }

  function openQrModal(username, url) {
    ensureCSS();
    var modal = document.getElementById('tchiloQrModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'tchiloQrModal';
      document.body.appendChild(modal);
    }
    modal.innerHTML =
      '<div class="card" role="dialog">' +
      '<div class="qr-title">QR do perfil</div>' +
      '<div class="qr-user">@' + String(username || '').replace(/</g, '') + '</div>' +
      '<div id="tchiloQrMount" style="min-height:220px;display:flex;align-items:center;justify-content:center;font-weight:700">A gerar QR…</div>' +
      '<div class="actions">' +
      '<button type="button" class="primary" data-q="copy">Copiar link</button>' +
      '<button type="button" class="ghost" data-q="close">Fechar</button>' +
      '</div></div>';
    modal.classList.add('open');
    modal.onclick = function (e) { if (e.target === modal) closeQr(); };
    modal.querySelectorAll('[data-q]').forEach(function (btn) {
      btn.onclick = function (e) {
        e.stopPropagation();
        var q = btn.getAttribute('data-q');
        if (q === 'close') closeQr();
        if (q === 'copy') { copyText(url); closeQr(); }
      };
    });
    try {
      var mount = document.getElementById('tchiloQrMount');
      if (mount && typeof QRCode !== 'undefined') {
        mount.innerHTML = '';
        new QRCode(mount, { text: url, width: 200, height: 200 });
      } else if (mount) {
        mount.innerHTML =
          '<img alt="QR" style="width:200px;height:200px" src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' +
          encodeURIComponent(url) + '"/>';
      }
    } catch (e) {}
  }

  function openSheet() {
    ensureCSS();
    openGuardUntil = Date.now() + 900;
    var user = currentProfileUsername();
    var url = profileUrl(user);
    var wrap = document.getElementById('tchiloProfileShareSheet');
    if (wrap) wrap.remove();
    wrap = document.createElement('div');
    wrap.id = 'tchiloProfileShareSheet';
    wrap.className = 'open';
    wrap.innerHTML =
      '<div class="tchilo-ps-panel" role="dialog" aria-label="Menu do perfil">' +
      '<div class="tchilo-ps-handle"></div>' +
      '<button type="button" class="opt" data-act="settings"><span class="ic">' + IC.settings + '</span><span>Definições</span></button>' +
      '<button type="button" class="opt" data-act="copy"><span class="ic">' + IC.link + '</span><span>Copiar link</span></button>' +
      '<button type="button" class="opt" data-act="share"><span class="ic">' + IC.share + '</span><span>Partilhar URL</span></button>' +
      '<button type="button" class="opt" data-act="qr"><span class="ic">' + IC.qr + '</span><span>QR code do perfil</span></button>' +
      '<button type="button" class="opt opt-close" data-act="close"><span class="ic">' + IC.close + '</span><span>Fechar</span></button>' +
      '</div>';
    document.body.appendChild(wrap);
    wrap.addEventListener('click', function (e) {
      if (e.target === wrap) { e.preventDefault(); e.stopPropagation(); closeSheet(); }
    }, true);
    wrap.querySelectorAll('[data-act]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        openGuardUntil = 0;
        var act = btn.getAttribute('data-act');
        if (act === 'close') return closeSheet();
        if (act === 'copy') { copyText(url); closeSheet(); return; }
        if (act === 'share') { shareNative(url, 'Tchilo @' + user); closeSheet(); return; }
        if (act === 'qr') {
          closeSheet();
          setTimeout(function () { openQrModal(user, url); }, 80);
          return;
        }
        if (act === 'settings') {
          closeSheet();
          setTimeout(function () {
            if (typeof goTo === 'function') goTo('settings');
            else if (typeof window.goTo === 'function') window.goTo('settings');
          }, 40);
        }
      }, true);
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

    var oldAcc = document.getElementById('tchiloAccountSwitchBtn');
    if (oldAcc) oldAcc.remove();

    var btn = document.getElementById('tchiloProfileMoreBtn');
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
      btn.setAttribute('aria-label', 'Menu');
    }
  }

  polishProfileHeader();
  setTimeout(polishProfileHeader, 400);
  setTimeout(polishProfileHeader, 1500);
  if (typeof window.renderProfile === 'function' && !window.renderProfile.__shareMenuV18) {
    var rp = window.renderProfile;
    window.renderProfile = function () {
      var r = rp.apply(this, arguments);
      setTimeout(polishProfileHeader, 40);
      return r;
    };
    window.renderProfile.__shareMenuV18 = true;
    window.renderProfile.__shareMenu = true;
  }
})();

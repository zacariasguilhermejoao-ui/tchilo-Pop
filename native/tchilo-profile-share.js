/**
 * Tchilo — menu do perfil (3 traços)
 * v22
 * - Próprio perfil: Definições, Partilhar URL, QR
 * - Perfil visitado: Copiar link, Partilhar, Mensagem, Seguir/Deixar, Denunciar, Bloquear
 * Ícones: reutiliza os do app + Lucide-style (copy, link, ban, flag, message)
 */
(function () {
  'use strict';
  if (window.__tchiloProfileShareV24) return;
  window.__tchiloProfileShareV24 = true;
  window.__tchiloProfileShareV23 = true;
  window.__tchiloProfileShareV22 = true;
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

  /* Ícones SVG (estilo Lucide / já usados no index) */
  var IC = {
    more:
      '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">' +
      '<path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    settings:
      '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      '<circle cx="12" cy="12" r="3"/>' +
      '<path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
    share:
      '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' +
      '<circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/>' +
      '<path d="M8.5 13.5l7 4M15.5 6.5l-7 4"/></svg>',
    qr:
      '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>' +
      '<path d="M14 14h3v3h-3zM20 14v6M14 20h6"/></svg>',
    /* Lucide copy */
    copy:
      '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      '<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>' +
      '<path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>',
    /* Lucide link */
    link:
      '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>' +
      '<path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
    /* message — balão (estilo index) */
    message:
      '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22z"/></svg>',
    /* user-plus / follow — do post menu */
    follow:
      '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M2 21a8 8 0 0 1 13.292-6"/><circle cx="10" cy="8" r="5"/>' +
      '<path d="M19 16v6"/><path d="M22 19h-6"/></svg>',
    /* user-minus / unfollow */
    unfollow:
      '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>' +
      '<circle cx="9" cy="7" r="4"/><path d="M22 11h-6"/></svg>',
    /* flag — denunciar (já no index) */
    report:
      '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>' +
      '<line x1="4" x2="4" y1="22" y2="15"/></svg>',
    /* ban — bloquear (já no index) */
    block:
      '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      '<circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/></svg>',
    scan:
      '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/>' +
      '<path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/>' +
      '<rect x="7" y="7" width="10" height="10" rx="1"/></svg>'
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
          function () { fallbackCopy(text); }
        );
        return;
      }
    } catch (e) {}
    fallbackCopy(text);
  }

  function fallbackCopy(text) {
    try {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;left:-9999px;top:0';
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
        navigator.share({ title: title || 'Tchilo', url: url, text: title || '' }).catch(function () {
          copyText(url);
        });
        return;
      }
    } catch (e) {}
    copyText(url);
  }

  function isFollowingUser(username) {
    try {
      if (typeof isFollowing === 'function') return !!isFollowing(username);
    } catch (e) {}
    try {
      var list = typeof getFollowing === 'function' ? getFollowing() : [];
      return list.indexOf(username) >= 0;
    } catch (e2) {
      return false;
    }
  }

  function ensureCSS() {
    if (document.getElementById('tchiloProfileShareCSS')) return;
    var st = document.createElement('style');
    st.id = 'tchiloProfileShareCSS';
    st.textContent =
      '#tchiloProfileShareSheet{position:fixed;inset:0;z-index:2147483000;display:none;align-items:flex-end;justify-content:center;background:rgba(11,11,12,.42);}' +
      '#tchiloProfileShareSheet.open{display:flex!important;}' +
      '#tchiloProfileShareSheet .tchilo-ps-panel{width:min(100%,430px);background:var(--paper,#F6F1E7);border-radius:22px 22px 0 0;padding:12px 16px calc(28px + env(safe-area-inset-bottom));color:var(--ink,#0B0B0C);}' +
      '#tchiloProfileShareSheet .tchilo-ps-handle{width:40px;height:4px;border-radius:4px;background:rgba(11,11,12,.18);margin:4px auto 12px;}' +
      '#tchiloProfileShareSheet .tchilo-ps-title{text-align:center;font:700 16px system-ui,-apple-system,sans-serif;margin:0 0 10px;}' +
      '#tchiloProfileShareSheet .opt{display:flex;align-items:center;gap:12px;width:100%;padding:14px 10px;border:0;background:transparent;text-align:left;font:500 15px system-ui,sans-serif;cursor:pointer;color:inherit;border-radius:12px;}' +
      '#tchiloProfileShareSheet .opt:active{background:rgba(11,11,12,.06);}' +
      '#tchiloProfileShareSheet .opt.danger{color:#c62828;}' +
      '#tchiloProfileShareSheet .opt .ic{width:28px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}' +
      '#tchiloProfileShareSheet .cancel{width:100%;margin-top:8px;padding:14px;border:0;border-radius:14px;background:rgba(11,11,12,.06);font:700 15px system-ui,sans-serif;cursor:pointer;color:inherit;}' +
      '#screen-profile .screen-header{border:0!important;border-bottom:none!important;box-shadow:none!important;display:flex!important;align-items:center!important;}' +
      '#screen-profile.own-profile .screen-header .back-btn,' +
      'body:not(.viewing-other-profile) #screen-profile .screen-header .back-btn{display:none!important;}' +
      /* seletor de contas: só próprio perfil */
      '#screen-profile:not(.own-profile) #tchiloAccountSwitchBtn,' +
      'body.viewing-other-profile #tchiloAccountSwitchBtn,' +
      'body.viewing-other-profile #tchiloAccSwitchBtn,' +
      '#screen-profile:not(.own-profile) #tchiloAccSwitchBtn,' +
      '#screen-profile:not(.own-profile) #tchiloAccountSwitchBtn{' +
      'display:none!important;visibility:hidden!important;opacity:0!important;pointer-events:none!important;}' +
      /* menu 3 traços: sempre visível no header do perfil */
      '#tchiloProfileMoreBtn{margin-left:auto;display:inline-flex!important;align-items:center;justify-content:center;width:40px;height:40px;border:0;background:transparent;border-radius:50%;cursor:pointer;color:var(--ink);visibility:visible!important;pointer-events:auto!important;}' +
      'body.viewing-other-profile #screen-profile .tchilo-profile-share-btn{display:inline-flex!important;}';
    document.head.appendChild(st);
  }

  function closeSheet() {
    var el = document.getElementById('tchiloProfileShareSheet');
    if (el) el.classList.remove('open');
  }

  function optHtml(act, icon, label, danger) {
    return (
      '<button type="button" class="opt' +
      (danger ? ' danger' : '') +
      '" data-act="' +
      act +
      '"><span class="ic">' +
      icon +
      '</span><span>' +
      label +
      '</span></button>'
    );
  }

  function openSheet() {
    ensureCSS();
    var user = currentProfileUsername();
    if (!user) {
      toast('Perfil indisponível');
      return;
    }
    var url = profileUrl(user);
    var own = isOwnProfile();
    var wrap = document.getElementById('tchiloProfileShareSheet');
    if (!wrap) {
      wrap = document.createElement('div');
      wrap.id = 'tchiloProfileShareSheet';
      document.body.appendChild(wrap);
    }

    var body = '';
    if (own) {
      body =
        optHtml('settings', IC.settings, 'Definições') +
        optHtml('share', IC.share, 'Partilhar URL') +
        optHtml('copy', IC.copy, 'Copiar link') +
        optHtml('qr', IC.qr, 'O meu código QR') +
        optHtml('scan', IC.scan, 'Ler QR');
    } else {
      var following = isFollowingUser(user);
      body =
        optHtml('copy', IC.copy, 'Copiar link do perfil') +
        optHtml('share', IC.share, 'Partilhar perfil') +
        optHtml('message', IC.message, 'Enviar mensagem') +
        optHtml(
          following ? 'unfollow' : 'follow',
          following ? IC.unfollow : IC.follow,
          following ? 'Deixar de seguir' : 'Seguir @' + user
        ) +
        optHtml('scan', IC.scan, 'Ler QR de um perfil') +
        optHtml('report', IC.report, 'Denunciar @' + user) +
        optHtml('block', IC.block, 'Bloquear @' + user, true);
    }

    wrap.innerHTML =
      '<div class="tchilo-ps-panel">' +
      '<div class="tchilo-ps-handle"></div>' +
      '<div class="tchilo-ps-title">Opções</div>' +
      body +
      '<button type="button" class="cancel" data-a="close">Cancelar</button></div>';

    wrap.classList.add('open');
    wrap.onclick = function (e) {
      if (e.target === wrap) closeSheet();
    };

    wrap.querySelectorAll('.opt, .cancel').forEach(function (b) {
      b.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (b.classList.contains('cancel') || b.getAttribute('data-a') === 'close') {
          closeSheet();
          return;
        }
        var act = b.getAttribute('data-act');
        handleAction(act, user, url);
      });
    });
  }

  function handleAction(act, user, url) {
    if (act === 'copy') {
      copyText(url);
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
      setTimeout(function () {
        try {
          if (typeof window.tchiloShowQr === 'function') window.tchiloShowQr(url);
          else {
            /* fallback visual */
            var img =
              'https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=' +
              encodeURIComponent(url);
            if (typeof tchiloModalOpen === 'function') {
              tchiloModalOpen({
                title: 'Código QR',
                bodyHtml: '<div style="text-align:center"><img src="' + img + '" width="200" height="200" alt="QR" style="border-radius:12px"/></div>',
                buttons: [{ label: 'Fechar', value: true, primary: true }]
              });
            } else {
              copyText(url);
            }
          }
        } catch (err2) {
          copyText(url);
        }
      }, 60);
      return;
    }
    if (act === 'scan') {
      closeSheet();
      setTimeout(function () {
        try {
          if (typeof window.tchiloScanQr === 'function') window.tchiloScanQr();
          else if (typeof showToast === 'function') showToast('Leitor de QR indisponível');
        } catch (eSc) {}
      }, 60);
      return;
    }
    if (act === 'message') {
      closeSheet();
      try {
        if (typeof startChatWith === 'function') startChatWith(user);
        else if (typeof window.startChatWith === 'function') window.startChatWith(user);
        else toast('Mensagens indisponíveis');
      } catch (eMsg) {
        toast('Não foi possível abrir a conversa');
      }
      return;
    }
    if (act === 'follow' || act === 'unfollow') {
      closeSheet();
      try {
        if (typeof toggleFollow === 'function') toggleFollow(user);
        if (typeof renderProfile === 'function') renderProfile();
        if (typeof renderFeed === 'function') renderFeed();
        toast(act === 'follow' ? 'A seguir @' + user : 'Deixaste de seguir @' + user);
      } catch (eFol) {
        toast('Não foi possível atualizar');
      }
      return;
    }
    if (act === 'report') {
      closeSheet();
      try {
        if (typeof openReport === 'function') openReport('user', user);
        else toast('Denúncia enviada sobre @' + user);
      } catch (eRep) {
        toast('Não foi possível denunciar');
      }
      return;
    }
    if (act === 'block') {
      closeSheet();
      (async function () {
        try {
          var ok = true;
          if (typeof tchiloConfirm === 'function') {
            ok = await tchiloConfirm({
              title: 'Bloquear @' + user + '?',
              message: 'Deixas de ver as publicações desta conta. Podes desbloquear nas definições.',
              confirmText: 'Bloquear',
              cancelText: 'Cancelar',
              danger: true
            });
          }
          if (!ok) return;
          if (typeof blockUser === 'function') blockUser(user);
          if (typeof renderFeed === 'function') renderFeed();
          try {
            if (typeof closeOtherProfile === 'function') closeOtherProfile();
            else if (typeof goTo === 'function') {
              window.viewingProfileUser = null;
              goTo('feed');
            }
          } catch (eBack) {}
        } catch (eBlk) {
          toast('Não foi possível bloquear');
        }
      })();
      return;
    }
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
      try { window.viewingProfileUser = null; } catch (e0) {}
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

    /* Seletor: só próprio perfil */
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

    /* Menu 3 traços: SEMPRE no perfil (próprio ou visitado) */
    var btn = document.getElementById('tchiloProfileMoreBtn');
    if (!btn) {
      btn = document.createElement('button');
      btn.type = 'button';
      btn.id = 'tchiloProfileMoreBtn';
      btn.className = 'tchilo-profile-more';
      btn.setAttribute('aria-label', 'Opções');
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
  }

  polishProfileHeader();
  setTimeout(polishProfileHeader, 400);
  setTimeout(polishProfileHeader, 1500);
  if (typeof window.renderProfile === 'function' && !window.renderProfile.__shareMenuV24) {
    var rp = window.renderProfile;
    window.renderProfile = function () {
      var r = rp.apply(this, arguments);
      setTimeout(polishProfileHeader, 40);
      setTimeout(polishProfileHeader, 200);
      return r;
    };
    window.renderProfile.__shareMenuV24 = true;
    window.renderProfile.__shareMenuV21 = true;
    window.renderProfile.__shareMenuV20 = true;
    window.renderProfile.__shareMenu = true;
  }
})();

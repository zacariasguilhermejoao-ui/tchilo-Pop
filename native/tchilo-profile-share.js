/**
 * Tchilo — menu ⋯ no perfil: copiar link, partilhar, QR
 * v6 — fix: não usar classe .sheet (CSS global tem display:none)
 */
(function () {
  'use strict';
  if (window.__tchiloProfileShareV6) return;
  window.__tchiloProfileShareV6 = true;

  var openGuardUntil = 0;

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
    return null;
  }

  function currentProfileUsername() {
    try {
      if (typeof viewingProfileUser !== 'undefined' && viewingProfileUser) {
        return String(viewingProfileUser);
      }
    } catch (e) {}
    try {
      var el = document.querySelector(
        '#screen-profile .profile-username, #screen-profile .username, #screen-profile [data-username]'
      );
      if (el) {
        var u = el.getAttribute('data-username') || (el.textContent || '').replace(/^@/, '').trim();
        if (u) return u;
      }
    } catch (e2) {}
    var s = sessionUser();
    return s && s.username ? String(s.username) : '';
  }

  function profileUrl(username) {
    var u = encodeURIComponent(String(username || '').trim());
    var origin = location.origin || 'https://tchilopop.com';
    if (!u) return origin + '/perfil';
    return origin + '/u/' + u;
  }

  function copyText(text) {
    function ok() { toast('Link copiado'); }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).then(ok).catch(function () {
        fallbackCopy(text);
      });
    }
    fallbackCopy(text);
  }

  function fallbackCopy(text) {
    try {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      toast('Link copiado');
    } catch (e) {
      toast('Não foi possível copiar');
    }
  }

  function shareNative(url, title) {
    if (navigator.share) {
      navigator.share({ title: title || 'Tchilo', url: url }).catch(function () {
        copyText(url);
      });
    } else {
      copyText(url);
    }
  }

  function ensureCSS() {
    var old = document.getElementById('tchiloProfileShareCSS');
    if (old) old.remove();
    var st = document.createElement('style');
    st.id = 'tchiloProfileShareCSS';
    st.textContent =
      '#screen-profile .screen-header{position:relative!important;overflow:visible!important;}' +
      '#tchiloProfileMoreBtn,button#tchiloProfileMoreBtn,.tchilo-profile-more{' +
      'position:absolute!important;right:10px!important;top:50%!important;' +
      'transform:translateY(-50%)!important;width:44px!important;height:44px!important;' +
      'min-width:44px!important;min-height:44px!important;' +
      'border-radius:12px!important;border:2px solid currentColor!important;' +
      'background:transparent!important;color:inherit!important;' +
      'display:flex!important;align-items:center!important;justify-content:center!important;' +
      'cursor:pointer!important;z-index:200!important;padding:0!important;' +
      'pointer-events:auto!important;opacity:1!important;visibility:visible!important;}' +
      '#tchiloProfileShareSheet{' +
      'position:fixed!important;inset:0!important;z-index:2147483646!important;' +
      'display:none;align-items:flex-end!important;justify-content:center!important;' +
      'background:rgba(0,0,0,.55)!important;pointer-events:auto!important;}' +
      '#tchiloProfileShareSheet.open{display:flex!important;}' +
      '#tchiloProfileShareSheet .tchilo-ps-panel{' +
      'display:block!important;visibility:visible!important;opacity:1!important;' +
      'width:100%!important;max-width:480px!important;background:#fff!important;color:#0B0B0C!important;' +
      'border-radius:22px 22px 0 0!important;padding:18px 16px 28px!important;' +
      'border:3px solid #0B0B0C!important;border-bottom:none!important;' +
      'box-shadow:0 -8px 40px rgba(0,0,0,.35)!important;' +
      'pointer-events:auto!important;position:relative!important;inset:auto!important;z-index:2!important;}' +
      '#tchiloProfileShareSheet .tchilo-ps-panel h3{' +
      'margin:0 0 14px!important;font-size:18px!important;font-weight:900!important;text-align:center!important;color:#0B0B0C!important;}' +
      '#tchiloProfileShareSheet .opt{' +
      'display:flex!important;align-items:center!important;gap:12px!important;width:100%!important;' +
      'padding:14px 12px!important;margin:0 0 8px!important;border-radius:14px!important;' +
      'border:2px solid #0B0B0C!important;background:#fff!important;font-weight:800!important;' +
      'font-size:15px!important;cursor:pointer!important;color:#0B0B0C!important;text-align:left!important;}' +
      '#tchiloProfileShareSheet .opt .ic{display:inline-flex;width:28px;justify-content:center;}' +
      '#tchiloQrModal{position:fixed!important;inset:0!important;z-index:2147483647!important;display:none;' +
      'align-items:center!important;justify-content:center!important;background:rgba(0,0,0,.7)!important;padding:20px!important;}' +
      '#tchiloQrModal.open{display:flex!important;}' +
      '#tchiloQrModal .card{background:#0B0B0C;color:#fff;border-radius:18px;padding:18px;max-width:360px;width:100%;}' +
      '#tchiloQrModal .actions{display:flex;flex-direction:column;gap:8px;margin-top:12px;}' +
      '#tchiloQrModal .actions button{padding:12px;border-radius:12px;font-weight:800;cursor:pointer;border:2px solid #c8f560;}' +
      '#tchiloQrModal .actions .primary{background:#c8f560;color:#0B0B0C;}' +
      '#tchiloQrModal .actions .ghost{background:transparent;color:#c8f560;}';
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
    var qrSrc =
      'https://api.qrserver.com/v1/create-qr-code/?size=400x400&margin=12&color=0B0B0C&bgcolor=C8F560&data=' +
      encodeURIComponent(url);
    modal.innerHTML =
      '<div class="card" role="dialog">' +
      '<div style="text-align:center;font-weight:800;margin-bottom:10px">@' +
      String(username || '').replace(/</g, '') +
      '</div>' +
      '<img alt="QR" src="' + qrSrc + '" style="width:100%;border-radius:12px;background:#c8f560"/>' +
      '<div class="actions">' +
      '<button type="button" class="primary" data-q="copy">Copiar link</button>' +
      '<button type="button" class="ghost" data-q="close">Fechar</button>' +
      '</div></div>';
    modal.classList.add('open');
    modal.onclick = function (e) {
      if (e.target === modal) closeQr();
    };
    modal.querySelectorAll('[data-q]').forEach(function (b) {
      b.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        var a = b.getAttribute('data-q');
        if (a === 'close') return closeQr();
        if (a === 'copy') return copyText(url);
      };
    });
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
      '<div class="tchilo-ps-panel" role="dialog" aria-label="Partilhar perfil">' +
      '<h3>Partilhar perfil</h3>' +
      (user
        ? '<p style="text-align:center;margin:0 0 12px;font-size:13px;opacity:.7;word-break:break-all">@' +
          String(user).replace(/</g, '') +
          '</p>'
        : '') +
      '<button type="button" class="opt" data-act="copy"><span class="ic">🔗</span><span>Copiar link</span></button>' +
      '<button type="button" class="opt" data-act="share"><span class="ic">📤</span><span>Partilhar URL</span></button>' +
      '<button type="button" class="opt" data-act="qr"><span class="ic">▦</span><span>QR code do perfil</span></button>' +
      '<button type="button" class="opt" data-act="close"><span class="ic">✕</span><span>Fechar</span></button>' +
      '</div>';

    document.body.appendChild(wrap);

    wrap.addEventListener(
      'click',
      function (e) {
        if (e.target === wrap) {
          e.preventDefault();
          e.stopPropagation();
          closeSheet();
        }
      },
      true
    );

    wrap.querySelectorAll('[data-act]').forEach(function (btn) {
      btn.addEventListener(
        'click',
        function (e) {
          e.preventDefault();
          e.stopPropagation();
          openGuardUntil = 0;
          var act = btn.getAttribute('data-act');
          if (act === 'close') return closeSheet();
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
          if (act === 'qr') {
            closeSheet();
            setTimeout(function () {
              openQrModal(user, url);
            }, 80);
          }
        },
        true
      );
    });
  }

  window.tchiloOpenProfileShare = openSheet;

  function isMoreButton(el) {
    if (!el || !el.closest) return null;
    if (el.id === 'tchiloProfileMoreBtn') return el;
    var b = el.closest('#tchiloProfileMoreBtn');
    if (b) return b;
    if (el.classList && el.classList.contains('tchilo-profile-more')) return el;
    return null;
  }

  function bindBtn(btn) {
    if (!btn || btn.__tchiloShareBoundV6) return;
    btn.__tchiloShareBoundV6 = true;
    btn.type = 'button';
    function fire(e) {
      try {
        e.preventDefault();
        e.stopPropagation();
        if (e.stopImmediatePropagation) e.stopImmediatePropagation();
      } catch (err) {}
      openSheet();
    }
    btn.addEventListener('pointerup', function (e) {
      if (e.button != null && e.button !== 0) return;
      fire(e);
    }, true);
    btn.addEventListener('click', function (e) { fire(e); }, true);
  }

  function ensureHeaderBtn() {
    ensureCSS();
    var screen = document.getElementById('screen-profile');
    if (!screen) return;
    var header = screen.querySelector('.screen-header');
    if (!header) return;
    var btn = document.getElementById('tchiloProfileMoreBtn');
    if (!btn) {
      btn = document.createElement('button');
      btn.type = 'button';
      btn.id = 'tchiloProfileMoreBtn';
      btn.className = 'tchilo-profile-more';
      btn.setAttribute('aria-label', 'Mais opções');
      btn.innerHTML =
        '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">' +
        '<circle cx="5" cy="12" r="2.2"/><circle cx="12" cy="12" r="2.2"/><circle cx="19" cy="12" r="2.2"/>' +
        '</svg>';
      header.appendChild(btn);
    }
    bindBtn(btn);
  }

  if (!window.__tchiloProfileShareClickV6) {
    window.__tchiloProfileShareClickV6 = true;
    function onPointer(e) {
      var t = e.target;
      if (!t) return;
      var btn = isMoreButton(t);
      if (!btn) return;
      try {
        e.preventDefault();
        e.stopPropagation();
        if (e.stopImmediatePropagation) e.stopImmediatePropagation();
      } catch (err) {}
      openSheet();
    }
    document.addEventListener('pointerup', onPointer, true);
    document.addEventListener('click', onPointer, true);
  }

  function boot() { ensureHeaderBtn(); }
  boot();
  setTimeout(boot, 200);
  setTimeout(boot, 800);
  setTimeout(boot, 2000);
  setInterval(boot, 3000);

  function patchRenderProfile() {
    if (typeof window.renderProfile !== 'function') return;
    if (window.renderProfile.__sharePatchV6) return;
    var rp = window.renderProfile;
    window.renderProfile = function () {
      var r = rp.apply(this, arguments);
      setTimeout(ensureHeaderBtn, 20);
      setTimeout(ensureHeaderBtn, 150);
      setTimeout(ensureHeaderBtn, 400);
      return r;
    };
    window.renderProfile.__sharePatchV6 = true;
  }
  patchRenderProfile();
  setTimeout(patchRenderProfile, 500);
  setTimeout(patchRenderProfile, 2000);
})();

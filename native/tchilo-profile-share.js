/**
 * Tchilo — menu ⋯ no perfil: copiar link, partilhar, QR
 * v8 — QR com logotipo Tchilo (t + 3 pontos) no centro
 */
(function () {
  'use strict';
  if (window.__tchiloProfileShareV8) return;
  window.__tchiloProfileShareV8 = true;
  window.__tchiloProfileShareV7 = true;
  window.__tchiloProfileShareV6 = true;

  var openGuardUntil = 0;

  var IC = {
    link:
      '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M10 13a5 5 0 0 0 7.07.07l1.76-1.76a5 5 0 0 0-7.07-7.07L10.5 5.5"/>' +
      '<path d="M14 11a5 5 0 0 0-7.07-.07L5.17 12.7a5 5 0 0 0 7.07 7.07L13.5 18.5"/>' +
      '</svg>',
    share:
      '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<circle cx="18" cy="5" r="2.5"/>' +
      '<circle cx="6" cy="12" r="2.5"/>' +
      '<circle cx="18" cy="19" r="2.5"/>' +
      '<path d="M8.5 13.5l7 4M15.5 6.5l-7 4"/>' +
      '</svg>',
    qr:
      '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4z"/>' +
      '<path d="M14 14h2v2h-2zM18 14h2v2h-2zM14 18h2v2h-2zM18 18h2v2h-2z"/>' +
      '</svg>',
    close:
      '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true">' +
      '<path d="M6 6l12 12M18 6L6 18"/>' +
      '</svg>',
    more:
      '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">' +
      '<circle cx="5" cy="12" r="2.2"/><circle cx="12" cy="12" r="2.2"/><circle cx="19" cy="12" r="2.2"/>' +
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
      'border-radius:12px!important;border:2.5px solid var(--ink,#0B0B0C)!important;' +
      'background:var(--paper,#F3F1E9)!important;color:var(--ink,#0B0B0C)!important;' +
      'display:flex!important;align-items:center!important;justify-content:center!important;' +
      'cursor:pointer!important;z-index:200!important;padding:0!important;' +
      'pointer-events:auto!important;opacity:1!important;visibility:visible!important;' +
      'box-shadow:3px 3px 0 var(--ink,#0B0B0C)!important;}' +
      '#tchiloProfileShareSheet{' +
      'position:fixed!important;inset:0!important;z-index:2147483646!important;' +
      'display:none;align-items:flex-end!important;justify-content:center!important;' +
      'background:rgba(11,11,12,.5)!important;pointer-events:auto!important;}' +
      '#tchiloProfileShareSheet.open{display:flex!important;}' +
      '#tchiloProfileShareSheet .tchilo-ps-panel{' +
      'display:block!important;visibility:visible!important;opacity:1!important;' +
      'width:100%!important;max-width:480px!important;' +
      'background:var(--paper,#F3F1E9)!important;color:var(--ink,#0B0B0C)!important;' +
      'border-radius:22px 22px 0 0!important;padding:14px 16px calc(22px + env(safe-area-inset-bottom))!important;' +
      'border:3px solid var(--ink,#0B0B0C)!important;border-bottom:none!important;' +
      'box-shadow:0 -10px 40px rgba(0,0,0,.28)!important;' +
      'pointer-events:auto!important;position:relative!important;inset:auto!important;z-index:2!important;' +
      'font-family:Inter,system-ui,sans-serif!important;}' +
      '#tchiloProfileShareSheet .tchilo-ps-handle{' +
      'width:40px!important;height:4px!important;border-radius:2px!important;' +
      'background:#c8c4b8!important;margin:0 auto 12px!important;}' +
      '#tchiloProfileShareSheet .tchilo-ps-panel h3{' +
      'margin:0 0 4px!important;font-family:Anton,Impact,sans-serif!important;' +
      'font-size:22px!important;font-weight:400!important;letter-spacing:.02em!important;' +
      'text-align:center!important;color:var(--ink,#0B0B0C)!important;}' +
      '#tchiloProfileShareSheet .tchilo-ps-user{' +
      'text-align:center!important;margin:0 0 14px!important;font-size:13px!important;' +
      'font-weight:600!important;opacity:.55!important;}' +
      '#tchiloProfileShareSheet .opt{' +
      'display:flex!important;align-items:center!important;gap:14px!important;width:100%!important;' +
      'padding:14px 14px!important;margin:0 0 10px!important;border-radius:16px!important;' +
      'border:2.5px solid var(--ink,#0B0B0C)!important;background:#fff!important;' +
      'font-weight:800!important;font-size:15px!important;cursor:pointer!important;' +
      'color:var(--ink,#0B0B0C)!important;text-align:left!important;' +
      'box-shadow:3px 3px 0 var(--ink,#0B0B0C)!important;' +
      'transition:transform .08s ease,box-shadow .08s ease!important;}' +
      '#tchiloProfileShareSheet .opt:active{' +
      'transform:translate(2px,2px)!important;box-shadow:1px 1px 0 var(--ink,#0B0B0C)!important;}' +
      '#tchiloProfileShareSheet .opt .ic{' +
      'display:inline-flex!important;align-items:center!important;justify-content:center!important;' +
      'width:40px!important;height:40px!important;min-width:40px!important;' +
      'border-radius:12px!important;border:2px solid var(--ink,#0B0B0C)!important;' +
      'background:var(--yellow,#C8F560)!important;color:var(--ink,#0B0B0C)!important;}' +
      '#tchiloProfileShareSheet .opt .ic svg{display:block;}' +
      '#tchiloProfileShareSheet .opt.opt-close{' +
      'background:var(--paper,#F3F1E9)!important;margin-top:4px!important;}' +
      '#tchiloProfileShareSheet .opt.opt-close .ic{background:#fff!important;}' +
      '#tchiloQrModal{position:fixed!important;inset:0!important;z-index:2147483647!important;display:none;' +
      'align-items:center!important;justify-content:center!important;background:rgba(11,11,12,.72)!important;padding:20px!important;}' +
      '#tchiloQrModal.open{display:flex!important;}' +
      '#tchiloQrModal .card{background:var(--paper,#F3F1E9);color:var(--ink,#0B0B0C);border-radius:20px;' +
      'padding:18px;max-width:360px;width:100%;border:3px solid var(--ink,#0B0B0C);' +
      'box-shadow:6px 6px 0 var(--ink,#0B0B0C);font-family:Inter,system-ui,sans-serif;}' +
      '#tchiloQrModal .card .qr-title{font-family:Anton,Impact,sans-serif;font-size:20px;text-align:center;margin:0 0 6px;}' +
      '#tchiloQrModal .card .qr-user{text-align:center;font-weight:700;opacity:.55;margin:0 0 12px;font-size:13px;}' +
      '#tchiloQrModal .actions{display:flex;flex-direction:column;gap:10px;margin-top:14px;}' +
      '#tchiloQrModal .actions button{padding:13px;border-radius:14px;font-weight:800;cursor:pointer;' +
      'border:2.5px solid var(--ink,#0B0B0C);font-size:15px;box-shadow:3px 3px 0 var(--ink,#0B0B0C);}' +
      '#tchiloQrModal .actions .primary{background:var(--yellow,#C8F560);color:var(--ink,#0B0B0C);}' +
      '#tchiloQrModal .actions .ghost{background:#fff;color:var(--ink,#0B0B0C);}';
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

  function roundRectPath(ctx, x, y, w, h, r) {
    r = Math.min(r || 0, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function drawTchiloLogo(ctx, cx, cy, size) {
    ctx.save();
    ctx.translate(cx, cy);
    var s = size;
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.5, 0, Math.PI * 2);
    ctx.fillStyle = '#F6F1E7';
    ctx.fill();
    ctx.fillStyle = '#0B0B0C';
    var sw = s * 0.15;
    var sh = s * 0.58;
    var sx = -s * 0.2;
    var sy = -s * 0.26;
    roundRectPath(ctx, sx, sy, sw, sh, sw * 0.45);
    ctx.fill();
    roundRectPath(ctx, -s * 0.26, -s * 0.1, s * 0.36, s * 0.13, sw * 0.4);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(sx + sw / 2, sy + sw * 0.15, sw * 0.55, 0, Math.PI * 2);
    ctx.fill();
    var colors = ['#18E8B0', '#F800A0', '#7800F8'];
    var dr = s * 0.07;
    for (var i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(s * 0.04 + i * dr * 2.4, s * 0.04, dr, 0, Math.PI * 2);
      ctx.fillStyle = colors[i];
      ctx.fill();
    }
    ctx.restore();
  }

  function buildBrandedQr(profileLink, username, cb) {
    var size = 720;
    var img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = function () {
      try {
        var c = document.createElement('canvas');
        c.width = size;
        c.height = size + 110;
        var ctx = c.getContext('2d');
        ctx.fillStyle = '#0B0B0C';
        ctx.fillRect(0, 0, c.width, c.height);
        var pad = 28;
        roundRectPath(ctx, pad, pad, size - pad * 2, size - pad * 2, 32);
        ctx.fillStyle = '#C8F560';
        ctx.fill();
        var qrPad = 56;
        ctx.drawImage(img, qrPad, qrPad, size - qrPad * 2, size - qrPad * 2);
        var badge = size * 0.24;
        var bx = size / 2;
        var by = size / 2;
        ctx.beginPath();
        ctx.arc(bx, by, badge * 0.56, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(bx, by, badge * 0.56, 0, Math.PI * 2);
        ctx.strokeStyle = '#0B0B0C';
        ctx.lineWidth = 5;
        ctx.stroke();
        drawTchiloLogo(ctx, bx, by, badge);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '700 28px Inter, system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('@' + String(username || ''), size / 2, size + 36);
        ctx.font = '600 18px Inter, system-ui, sans-serif';
        ctx.fillStyle = '#C8F560';
        ctx.fillText('Tchilo', size / 2, size + 68);
        cb(null, c);
      } catch (e) {
        cb(e);
      }
    };
    img.onerror = function () {
      cb(new Error('QR fail'));
    };
    img.src =
      'https://api.qrserver.com/v1/create-qr-code/?size=500x500&margin=10&color=0B0B0C&bgcolor=C8F560&data=' +
      encodeURIComponent(profileLink);
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
      '<button type="button" class="primary" data-q="download">Descarregar QR</button>' +
      '<button type="button" class="ghost" data-q="copy">Copiar link</button>' +
      '<button type="button" class="ghost" data-q="close">Fechar</button>' +
      '</div></div>';
    modal.classList.add('open');
    window.__tchiloQrCanvas = null;
    modal.onclick = function (e) {
      if (e.target === modal) closeQr();
    };
    var mount = document.getElementById('tchiloQrMount');
    buildBrandedQr(url, username, function (err, canvas) {
      if (!mount) return;
      if (err || !canvas) {
        var fallback =
          'https://api.qrserver.com/v1/create-qr-code/?size=400x400&margin=12&color=0B0B0C&bgcolor=C8F560&data=' +
          encodeURIComponent(url);
        mount.innerHTML =
          '<img alt="QR" src="' + fallback + '" style="width:100%;border-radius:14px;border:2.5px solid #0B0B0C"/>';
        return;
      }
      window.__tchiloQrCanvas = canvas;
      mount.innerHTML = '';
      canvas.style.width = '100%';
      canvas.style.height = 'auto';
      canvas.style.borderRadius = '14px';
      mount.appendChild(canvas);
    });
    modal.querySelectorAll('[data-q]').forEach(function (b) {
      b.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        var a = b.getAttribute('data-q');
        if (a === 'close') return closeQr();
        if (a === 'copy') return copyText(url);
        if (a === 'download' && window.__tchiloQrCanvas) {
          try {
            var aEl = document.createElement('a');
            aEl.download = 'tchilo-' + (username || 'perfil') + '-qr.png';
            aEl.href = window.__tchiloQrCanvas.toDataURL('image/png');
            document.body.appendChild(aEl);
            aEl.click();
            setTimeout(function () {
              try { document.body.removeChild(aEl); } catch (e2) {}
            }, 200);
          } catch (err) {
            toast('Não foi possível descarregar');
          }
        }
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
      '<div class="tchilo-ps-handle" aria-hidden="true"></div>' +
      '<h3>Partilhar perfil</h3>' +
      (user
        ? '<p class="tchilo-ps-user">@' + String(user).replace(/</g, '') + '</p>'
        : '') +
      '<button type="button" class="opt" data-act="copy"><span class="ic">' + IC.link + '</span><span>Copiar link</span></button>' +
      '<button type="button" class="opt" data-act="share"><span class="ic">' + IC.share + '</span><span>Partilhar URL</span></button>' +
      '<button type="button" class="opt" data-act="qr"><span class="ic">' + IC.qr + '</span><span>QR code do perfil</span></button>' +
      '<button type="button" class="opt opt-close" data-act="close"><span class="ic">' + IC.close + '</span><span>Fechar</span></button>' +
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
    if (!btn || btn.__tchiloShareBoundV8) return;
    btn.__tchiloShareBoundV8 = true;
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
      btn.innerHTML = IC.more;
      header.appendChild(btn);
    } else if (btn.innerHTML.indexOf('svg') < 0) {
      btn.innerHTML = IC.more;
    }
    bindBtn(btn);
  }

  if (!window.__tchiloProfileShareClickV8) {
    window.__tchiloProfileShareClickV8 = true;
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
    if (window.renderProfile.__sharePatchV8) return;
    var rp = window.renderProfile;
    window.renderProfile = function () {
      var r = rp.apply(this, arguments);
      setTimeout(ensureHeaderBtn, 20);
      setTimeout(ensureHeaderBtn, 150);
      setTimeout(ensureHeaderBtn, 400);
      return r;
    };
    window.renderProfile.__sharePatchV8 = true;
  }
  patchRenderProfile();
  setTimeout(patchRenderProfile, 500);
  setTimeout(patchRenderProfile, 2000);
})();

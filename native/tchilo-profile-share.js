/**
 * Tchilo — menu ⋯ no perfil: copiar link, partilhar, QR
 * v10 — QR com 3 pontos personalizados (ciano, rosa, roxo), sem imagem
 */
(function () {
  'use strict';
  if (window.__tchiloProfileShareV10) return;
  window.__tchiloProfileShareV10 = true;

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
    close:
      '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round">' +
      '<path d="M6 6l12 12M18 6L6 18"/>' +
      '</svg>',
    more:
      '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">' +
      '<circle cx="5" cy="12" r="2.2"/><circle cx="12" cy="12" r="2.2"/><circle cx="19" cy="12" r="2.2"/>' +
      '</svg>'
  };

  function toast(msg) {
    try {
      if (typeof showToast === 'function') showToast(String(msg));
      else alert(String(msg));
    } catch (e) {
      try {
        alert(String(msg));
      } catch (e2) {}
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
    function ok() {
      toast('Link copiado');
    }
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
      'border-radius:12px!important;border:0!important;' +
      'background:var(--paper,#F3F1E9)!important;color:var(--ink,#0B0B0C)!important;' +
      'display:flex!important;align-items:center!important;justify-content:center!important;' +
      'cursor:pointer!important;z-index:200!important;padding:0!important;' +
      'pointer-events:auto!important;opacity:1!important;visibility:visible!important;' +
      'box-shadow:none!important;}' +
      '#tchiloProfileShareSheet{' +
      'position:fixed!important;inset:0!important;z-index:2147483646!important;' +
      'display:none;align-items:flex-end!important;justify-content:center!important;' +
      'background:rgba(11,11,12,.5)!important;}' +
      '#tchiloProfileShareSheet.open{display:flex!important;}' +
      '#tchiloProfileShareSheet .tchilo-ps-panel{' +
      'width:100%!important;max-width:480px!important;' +
      'background:var(--paper,#F3F1E9)!important;color:var(--ink,#0B0B0C)!important;' +
      'border-radius:22px 22px 0 0!important;padding:14px 16px calc(22px + env(safe-area-inset-bottom))!important;' +
      'border:0!important;border-top:0.5px solid rgba(11,11,12,.12)!important;' +
      'box-shadow:0 -10px 40px rgba(0,0,0,.28)!important;}' +
      '#tchiloProfileShareSheet .tchilo-ps-handle{' +
      'width:40px;height:4px;border-radius:2px;background:#c8c4b8;margin:0 auto 12px;}' +
      '#tchiloProfileShareSheet .tchilo-ps-panel h3{' +
      'margin:0 0 4px;font-family:system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, "Helvetica Neue", Arial, sans-serif;font-size:22px;text-align:center;}' +
      '#tchiloProfileShareSheet .tchilo-ps-user{' +
      'text-align:center;margin:0 0 14px;font-size:13px;font-weight:600;opacity:.55;}' +
      '#tchiloProfileShareSheet .opt{display:flex;align-items:center;gap:14px;width:100%;padding:14px 4px;margin:0;border:0;border-bottom:0.5px solid rgba(11,11,12,.08);border-radius:0;background:transparent;box-shadow:none;text-align:left;font:400 16px system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;color:var(--ink,#0B0B0C);cursor:pointer;}' +
      '#tchiloProfileShareSheet .opt .ic{display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;min-width:24px;border-radius:0;border:0;background:transparent;color:var(--ink,#0B0B0C);}' +
      '#tchiloProfileShareSheet .opt.opt-close{background:transparent;}' +
      '#tchiloQrModal{position:fixed;inset:0;z-index:2147483647;display:none;' +
      'align-items:center;justify-content:center;background:rgba(11,11,12,.72);padding:20px;}' +
      '#tchiloQrModal.open{display:flex!important;}' +
      '#tchiloQrModal .card{background:var(--paper,#F3F1E9);color:var(--ink,#0B0B0C);border-radius:20px;' +
      'padding:18px;max-width:360px;width:100%;border:0;' +
      'box-shadow:0 12px 40px rgba(0,0,0,.2);}' +
      '#tchiloQrModal .qr-title{font-family:system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, "Helvetica Neue", Arial, sans-serif;font-size:20px;text-align:center;margin:0 0 6px;}' +
      '#tchiloQrModal .qr-user{text-align:center;font-weight:700;opacity:.55;margin:0 0 12px;font-size:13px;}' +
      '#tchiloQrModal .actions{display:flex;flex-direction:column;gap:10px;margin-top:14px;}' +
      '#tchiloQrModal .actions button{padding:13px;border-radius:14px;font-weight:800;cursor:pointer;' +
      'border:0;font-size:15px;box-shadow:none;font-weight:600;}' +
      '#tchiloQrModal .actions .primary{background:var(--ink,#0B0B0C);color:#fff;}' +
      '#tchiloQrModal .actions .ghost{background:rgba(11,11,12,.06);color:var(--ink,#0B0B0C);}';
    document.head.appendChild(st);
  }

  function closeSheet() {
    if (Date.now() < openGuardUntil) return;
    var el = document.getElementById('tchiloProfileShareSheet');
    if (!el) return;
    el.classList.remove('open');
    try {
      el.remove();
    } catch (e) {}
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

  /** 3 pontos Tchilo no centro do QR (ciano, rosa, roxo) — sem imagem */
  function drawThreeDots(ctx, cx, cy, size) {
    var colors = ['#18E8B0', '#F800A0', '#7800F8'];
    var r = size * 0.14;
    var gap = size * 0.38;
    var startX = cx - gap;
    ctx.save();
    /* fundo circular claro */
    ctx.beginPath();
    ctx.arc(cx, cy, size * 0.42, 0, Math.PI * 2);
    ctx.fillStyle = '#F6F1E7';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx, cy, size * 0.42, 0, Math.PI * 2);
    ctx.strokeStyle = '#0B0B0C';
    ctx.lineWidth = Math.max(3, size * 0.04);
    ctx.stroke();
    for (var i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(startX + i * gap, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = colors[i];
      ctx.fill();
      ctx.beginPath();
      ctx.arc(startX + i * gap, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = '#0B0B0C';
      ctx.lineWidth = Math.max(1.5, size * 0.02);
      ctx.stroke();
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
        drawThreeDots(ctx, size / 2, size / 2, size * 0.22);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '700 28px system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('@' + String(username || ''), size / 2, size + 36);
        ctx.font = '600 18px system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif';
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
      '<div class="qr-user">@' +
      String(username || '').replace(/</g, '') +
      '</div>' +
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
          '<img alt="QR" src="' +
          fallback +
          '" style="width:100%;border-radius:12px;border:0"/>';
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
              try {
                document.body.removeChild(aEl);
              } catch (e2) {}
            }, 200);
            toast('QR guardado');
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
      '<div class="tchilo-ps-handle"></div>' +
      '<h3>Partilhar perfil</h3>' +
      (user ? '<p class="tchilo-ps-user">@' + String(user).replace(/</g, '') + '</p>' : '') +
      '<button type="button" class="opt" data-act="copy"><span class="ic">' +
      IC.link +
      '</span><span>Copiar link</span></button>' +
      '<button type="button" class="opt" data-act="share"><span class="ic">' +
      IC.share +
      '</span><span>Partilhar URL</span></button>' +
      '<button type="button" class="opt" data-act="qr"><span class="ic">' +
      IC.qr +
      '</span><span>QR code do perfil</span></button>' +
      '<button type="button" class="opt opt-close" data-act="close"><span class="ic">' +
      IC.close +
      '</span><span>Fechar</span></button>' +
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
    }
    btn.onclick = function (e) {
      e.preventDefault();
      e.stopPropagation();
      openSheet();
    };
  }

  if (!window.__tchiloProfileShareClickV10) {
    window.__tchiloProfileShareClickV10 = true;
    document.addEventListener(
      'click',
      function (e) {
        var t = e.target;
        if (!t) return;
        var btn =
          t.id === 'tchiloProfileMoreBtn'
            ? t
            : t.closest && t.closest('#tchiloProfileMoreBtn');
        if (btn) {
          e.preventDefault();
          e.stopPropagation();
          openSheet();
        }
      },
      true
    );
  }

  function boot() {
    ensureHeaderBtn();
  }
  boot();
  setTimeout(boot, 200);
  setTimeout(boot, 800);
  setTimeout(boot, 2000);
  setInterval(boot, 3000);

  if (typeof window.renderProfile === 'function' && !window.renderProfile.__sharePatchV10) {
    var rp = window.renderProfile;
    window.renderProfile = function () {
      var r = rp.apply(this, arguments);
      setTimeout(ensureHeaderBtn, 30);
      setTimeout(ensureHeaderBtn, 200);
      return r;
    };
    window.renderProfile.__sharePatchV10 = true;
  }
})();

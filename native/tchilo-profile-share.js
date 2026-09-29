/**
 * Tchilo — menu ⋯ no perfil: copiar link, partilhar, QR, descarregar
 * v4 — abertura fiável ao toque
 */
(function () {
  'use strict';
  if (window.__tchiloProfileShareV4) return;
  window.__tchiloProfileShareV4 = true;

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
      navigator
        .share({
          title: title || 'Tchilo',
          text: 'Vê o meu perfil no Tchilo',
          url: url
        })
        .catch(function () {
          copyText(url);
        });
      return;
    }
    copyText(url);
  }

  function qrImageUrl(data, size) {
    size = size || 512;
    return (
      'https://api.qrserver.com/v1/create-qr-code/?size=' +
      size +
      'x' +
      size +
      '&margin=12&color=0B0B0C&bgcolor=C8F560&data=' +
      encodeURIComponent(data)
    );
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function buildBrandedQrCanvas(profileLink, username, cb) {
    var size = 720;
    var img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = function () {
      try {
        var c = document.createElement('canvas');
        c.width = size;
        c.height = size + 120;
        var ctx = c.getContext('2d');
        ctx.fillStyle = '#0B0B0C';
        ctx.fillRect(0, 0, c.width, c.height);
        var pad = 36;
        roundRect(ctx, pad, pad, size - pad * 2, size - pad * 2, 28);
        ctx.fillStyle = '#c8f560';
        ctx.fill();
        var qrPad = 70;
        ctx.drawImage(img, qrPad, qrPad, size - qrPad * 2, size - qrPad * 2);
        var b = 72;
        var bx = (size - b) / 2;
        var by = (size - b) / 2;
        roundRect(ctx, bx, by, b, b, 16);
        ctx.fillStyle = '#0B0B0C';
        ctx.fill();
        ctx.fillStyle = '#c8f560';
        ctx.font = 'bold 40px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('T', size / 2, size / 2 + 2);
        ctx.fillStyle = '#ffffff';
        ctx.font = '700 28px system-ui, sans-serif';
        ctx.fillText('@' + String(username || ''), size / 2, size + 28);
        ctx.font = '600 18px system-ui, sans-serif';
        ctx.fillStyle = '#c8f560';
        ctx.fillText('Tchilo', size / 2, size + 58);
        cb(null, c);
      } catch (e) {
        cb(e);
      }
    };
    img.onerror = function () {
      cb(new Error('QR fail'));
    };
    img.src = qrImageUrl(profileLink, 500);
  }

  function downloadCanvas(c, filename) {
    try {
      var a = document.createElement('a');
      a.download = filename || 'tchilo-qr.png';
      a.href = c.toDataURL('image/png');
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      setTimeout(function () {
        try {
          document.body.removeChild(a);
        } catch (e) {}
      }, 200);
      toast('QR guardado');
    } catch (e) {
      toast('Não foi possível descarregar');
    }
  }

  function ensureCSS() {
    var old = document.getElementById('tchiloProfileShareCSS');
    if (old) old.remove();
    var st = document.createElement('style');
    st.id = 'tchiloProfileShareCSS';
    st.textContent =
      '#screen-profile .screen-header{position:relative!important;}' +
      '#tchiloProfileMoreBtn{' +
      'position:absolute!important;right:10px!important;top:50%!important;' +
      'transform:translateY(-50%)!important;width:44px!important;height:44px!important;' +
      'border-radius:12px!important;border:2px solid currentColor!important;' +
      'background:transparent!important;color:inherit!important;' +
      'display:flex!important;align-items:center!important;justify-content:center!important;' +
      'cursor:pointer!important;z-index:50!important;padding:0!important;' +
      'pointer-events:auto!important;opacity:1!important;visibility:visible!important;' +
      '-webkit-tap-highlight-color:transparent;}' +
      '#tchiloProfileShareSheet{' +
      'position:fixed!important;inset:0!important;z-index:2147483000!important;' +
      'display:none;align-items:flex-end!important;justify-content:center!important;' +
      'background:rgba(0,0,0,.55)!important;pointer-events:auto!important;}' +
      '#tchiloProfileShareSheet.open{display:flex!important;}' +
      '#tchiloProfileShareSheet .sheet{' +
      'width:100%!important;max-width:480px!important;background:#fff!important;color:#0B0B0C!important;' +
      'border-radius:22px 22px 0 0!important;padding:18px 16px 28px!important;' +
      'border:3px solid #0B0B0C!important;border-bottom:none!important;' +
      'box-shadow:0 -8px 40px rgba(0,0,0,.35)!important;}' +
      '#tchiloProfileShareSheet .sheet h3{' +
      'margin:0 0 14px!important;font-size:18px!important;font-weight:900!important;text-align:center!important;color:#0B0B0C!important;}' +
      '#tchiloProfileShareSheet .opt{' +
      'display:flex!important;align-items:center!important;gap:12px!important;width:100%!important;' +
      'padding:14px 12px!important;margin:0 0 8px!important;border-radius:14px!important;' +
      'border:2px solid #0B0B0C!important;background:#fff!important;font-weight:800!important;' +
      'font-size:15px!important;cursor:pointer!important;text-align:left!important;color:#0B0B0C!important;' +
      'pointer-events:auto!important;-webkit-appearance:none;appearance:none;}' +
      '#tchiloProfileShareSheet .opt .ic{' +
      'width:40px!important;height:40px!important;border-radius:12px!important;background:#c8f560!important;' +
      'color:#0B0B0C!important;display:flex!important;align-items:center!important;justify-content:center!important;' +
      'flex:0 0 auto!important;}' +
      '#tchiloQrModal{' +
      'position:fixed!important;inset:0!important;z-index:2147483010!important;display:none;' +
      'align-items:center!important;justify-content:center!important;background:rgba(0,0,0,.75)!important;' +
      'padding:20px!important;pointer-events:auto!important;}' +
      '#tchiloQrModal.open{display:flex!important;}' +
      '#tchiloQrModal .card{' +
      'background:#0B0B0C!important;color:#fff!important;border-radius:20px!important;padding:18px!important;' +
      'max-width:360px!important;width:100%!important;border:3px solid #c8f560!important;text-align:center!important;}' +
      '#tchiloQrModal canvas,#tchiloQrModal img{max-width:100%!important;height:auto!important;border-radius:12px!important;}' +
      '#tchiloQrModal .actions{display:flex!important;flex-direction:column!important;gap:8px!important;margin-top:14px!important;}' +
      '#tchiloQrModal button{' +
      'padding:12px!important;border-radius:14px!important;border:2px solid #c8f560!important;' +
      'font-weight:800!important;cursor:pointer!important;font-size:14px!important;pointer-events:auto!important;}' +
      '#tchiloQrModal .primary{background:#c8f560!important;color:#0B0B0C!important;}' +
      '#tchiloQrModal .ghost{background:transparent!important;color:#c8f560!important;}';
    (document.head || document.documentElement).appendChild(st);
  }

  var IC_LINK =
    '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M10 13a5 5 0 0 0 7.5.5l2-2a5 5 0 0 0-7-7l-1.2 1.2"/><path d="M14 11a5 5 0 0 0-7.5-.5l-2 2a5 5 0 0 0 7 7l1.2-1.2"/></svg>';
  var IC_SHARE =
    '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="M8.5 13.5l7 4M15.5 6.5l-7 4"/></svg>';
  var IC_QR =
    '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4z"/><path d="M14 14h2v2h-2zM18 14h2v2h-2zM14 18h2v2h-2zM18 18h2v2h-2z"/></svg>';
  var IC_CLOSE =
    '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M6 6l12 12M18 6L6 18"/></svg>';

  function closeSheet() {
    var el = document.getElementById('tchiloProfileShareSheet');
    if (el) el.classList.remove('open');
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
      '<div id="tchiloQrMount" style="min-height:200px;display:flex;align-items:center;justify-content:center;color:#fff">A gerar QR…</div>' +
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
    buildBrandedQrCanvas(url, username, function (err, canvas) {
      if (!mount) return;
      if (err || !canvas) {
        mount.innerHTML =
          '<img alt="QR" src="' + qrImageUrl(url, 400) + '" style="width:100%;border-radius:12px"/>';
        return;
      }
      window.__tchiloQrCanvas = canvas;
      mount.innerHTML = '';
      canvas.style.width = '100%';
      canvas.style.height = 'auto';
      mount.appendChild(canvas);
    });

    modal.querySelectorAll('[data-q]').forEach(function (b) {
      b.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        var a = b.getAttribute('data-q');
        if (a === 'close') return closeQr();
        if (a === 'copy') return copyText(url);
        if (a === 'download') {
          if (window.__tchiloQrCanvas) {
            downloadCanvas(
              window.__tchiloQrCanvas,
              'tchilo-' + (username || 'perfil') + '-qr.png'
            );
          } else {
            window.open(qrImageUrl(url, 512), '_blank');
          }
        }
      };
    });
  }

  function openSheet() {
    ensureCSS();
    var user = currentProfileUsername();
    var url = profileUrl(user);

    var wrap = document.getElementById('tchiloProfileShareSheet');
    if (wrap) wrap.remove();

    wrap = document.createElement('div');
    wrap.id = 'tchiloProfileShareSheet';
    wrap.className = 'open';
    wrap.innerHTML =
      '<div class="sheet" role="dialog" aria-label="Partilhar perfil">' +
      '<h3>Partilhar perfil</h3>' +
      (user
        ? '<p style="text-align:center;margin:0 0 12px;font-size:13px;opacity:.7;word-break:break-all">@' +
          String(user).replace(/</g, '') +
          '</p>'
        : '') +
      '<button type="button" class="opt" data-act="copy"><span class="ic">' +
      IC_LINK +
      '</span><span>Copiar link</span></button>' +
      '<button type="button" class="opt" data-act="share"><span class="ic">' +
      IC_SHARE +
      '</span><span>Partilhar URL</span></button>' +
      '<button type="button" class="opt" data-act="qr"><span class="ic">' +
      IC_QR +
      '</span><span>QR code do perfil</span></button>' +
      '<button type="button" class="opt" data-act="close"><span class="ic">' +
      IC_CLOSE +
      '</span><span>Fechar</span></button>' +
      '</div>';

    document.body.appendChild(wrap);

    wrap.addEventListener(
      'click',
      function (e) {
        if (e.target === wrap) closeSheet();
      },
      true
    );

    wrap.querySelectorAll('[data-act]').forEach(function (btn) {
      btn.addEventListener(
        'click',
        function (e) {
          e.preventDefault();
          e.stopPropagation();
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
  window.tchiloProfileShareUrl = function (username) {
    return profileUrl(username || currentProfileUsername());
  };

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
      btn.setAttribute('aria-label', 'Mais opções');
      btn.innerHTML =
        '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">' +
        '<circle cx="5" cy="12" r="2.2"/><circle cx="12" cy="12" r="2.2"/><circle cx="19" cy="12" r="2.2"/>' +
        '</svg>';
      header.appendChild(btn);
    }

    /* repor handler sempre (renderProfile pode clonar nós) */
    btn.onclick = function (e) {
      e.preventDefault();
      e.stopPropagation();
      openSheet();
    };
    btn.ontouchend = function (e) {
      e.preventDefault();
      e.stopPropagation();
      openSheet();
    };
  }

  /* Delegação global — funciona mesmo se o botão for recriado */
  if (!window.__tchiloProfileShareClick) {
    window.__tchiloProfileShareClick = true;
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
    document.addEventListener(
      'touchend',
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
  setInterval(boot, 2500);

  if (typeof window.renderProfile === 'function' && !window.renderProfile.__sharePatchV4) {
    var rp = window.renderProfile;
    window.renderProfile = function () {
      var r = rp.apply(this, arguments);
      setTimeout(ensureHeaderBtn, 20);
      setTimeout(ensureHeaderBtn, 150);
      setTimeout(ensureHeaderBtn, 400);
      return r;
    };
    window.renderProfile.__sharePatchV4 = true;
  }
})();

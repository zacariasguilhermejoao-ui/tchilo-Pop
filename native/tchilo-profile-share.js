/**
 * Tchilo — partilha de perfil: menu ⋯, copiar link, QR code, descarregar QR
 * Sem emojis — ícones SVG / tipografia Tchilo
 */
(function () {
  'use strict';
  if (window.__tchiloProfileShareV3) return;
  window.__tchiloProfileShareV3 = true;

  function toast(msg) {
    try {
      if (typeof showToast === 'function') showToast(String(msg));
    } catch (e) {
      try {
        console.log('[Tchilo]', msg);
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
    if (!u) return (location.origin || 'https://tchilopop.com') + '/perfil';
    return (location.origin || 'https://tchilopop.com') + '/u/' + u;
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).then(function () {
        toast('Link copiado');
        return text;
      }).catch(function () {
        return fallbackCopy(text);
      });
    }
    return Promise.resolve(fallbackCopy(text));
  }

  function fallbackCopy(text) {
    try {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;left:-9999px;top:0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      toast('Link copiado');
    } catch (e) {
      toast('Não foi possível copiar');
    }
    return text;
  }

  function shareNative(url, title) {
    if (navigator.share) {
      return navigator
        .share({
          title: title || 'Tchilo',
          text: 'Vê o meu perfil no Tchilo',
          url: url
        })
        .catch(function () {});
    }
    return copyText(url);
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
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast('QR guardado');
    } catch (e) {
      toast('Não foi possível descarregar');
    }
  }

  var IC_LINK =
    '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M10 13a5 5 0 0 0 7.5.5l2-2a5 5 0 0 0-7-7l-1.2 1.2"/><path d="M14 11a5 5 0 0 0-7.5-.5l-2 2a5 5 0 0 0 7 7l1.2-1.2"/></svg>';
  var IC_SHARE =
    '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="M8.5 13.5l7 4M15.5 6.5l-7 4"/></svg>';
  var IC_QR =
    '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4z"/><path d="M14 14h2v2h-2zM18 14h2v2h-2zM14 18h2v2h-2zM18 18h2v2h-2z"/></svg>';
  var IC_CLOSE =
    '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M6 6l12 12M18 6L6 18"/></svg>';

  function ensureCSS() {
    if (document.getElementById('tchiloProfileShareCSS')) return;
    var st = document.createElement('style');
    st.id = 'tchiloProfileShareCSS';
    st.textContent =
      '#screen-profile .screen-header{position:relative;}' +
      '#tchiloProfileMoreBtn{' +
      'position:absolute;right:12px;top:50%;transform:translateY(-50%);' +
      'width:42px;height:42px;border-radius:12px;border:2px solid var(--ink,#0B0B0C);' +
      'background:var(--paper,#fff);color:var(--ink,#0B0B0C);display:flex!important;' +
      'align-items:center;justify-content:center;cursor:pointer;z-index:20;padding:0;}' +
      '#tchiloProfileShareSheet{' +
      'position:fixed;inset:0;z-index:12000;display:none;align-items:flex-end;' +
      'justify-content:center;background:rgba(0,0,0,.45);}' +
      '#tchiloProfileShareSheet.open{display:flex!important;}' +
      '#tchiloProfileShareSheet .sheet{' +
      'width:100%;max-width:480px;background:var(--paper,#fff);color:var(--ink,#0B0B0C);' +
      'border-radius:22px 22px 0 0;padding:18px 16px 28px;border:3px solid #0B0B0C;border-bottom:none;}' +
      '#tchiloProfileShareSheet .sheet h3{margin:0 0 14px;font-size:18px;font-weight:900;text-align:center;}' +
      '#tchiloProfileShareSheet .opt{' +
      'display:flex;align-items:center;gap:12px;width:100%;padding:14px 12px;margin:0 0 8px;' +
      'border-radius:14px;border:2px solid #0B0B0C;background:#fff;font-weight:800;font-size:15px;' +
      'cursor:pointer;text-align:left;color:#0B0B0C;}' +
      '#tchiloProfileShareSheet .opt .ic{' +
      'width:40px;height:40px;border-radius:12px;background:#c8f560;color:#0B0B0C;display:flex;' +
      'align-items:center;justify-content:center;flex:0 0 auto;}' +
      '#tchiloQrModal{' +
      'position:fixed;inset:0;z-index:12050;display:none;align-items:center;justify-content:center;' +
      'background:rgba(0,0,0,.72);padding:20px;}' +
      '#tchiloQrModal.open{display:flex!important;}' +
      '#tchiloQrModal .card{' +
      'background:#0B0B0C;color:#fff;border-radius:20px;padding:18px;max-width:360px;width:100%;' +
      'border:3px solid #c8f560;text-align:center;}' +
      '#tchiloQrModal canvas,#tchiloQrModal img{max-width:100%;height:auto;border-radius:12px;}' +
      '#tchiloQrModal .actions{display:flex;flex-direction:column;gap:8px;margin-top:14px;}' +
      '#tchiloQrModal button{padding:12px;border-radius:14px;border:2px solid #c8f560;font-weight:800;cursor:pointer;font-size:14px;}' +
      '#tchiloQrModal .primary{background:#c8f560;color:#0B0B0C;}' +
      '#tchiloQrModal .ghost{background:transparent;color:#c8f560;}';
    (document.head || document.documentElement).appendChild(st);
  }

  function ensureSheet() {
    if (document.getElementById('tchiloProfileShareSheet')) return;
    var wrap = document.createElement('div');
    wrap.id = 'tchiloProfileShareSheet';
    wrap.innerHTML =
      '<div class="sheet" role="dialog" aria-label="Partilhar perfil">' +
      '<h3>Partilhar perfil</h3>' +
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
    wrap.addEventListener('click', function (e) {
      if (e.target === wrap) closeSheet();
    });
    wrap.querySelectorAll('[data-act]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var act = btn.getAttribute('data-act');
        var user = currentProfileUsername();
        var url = profileUrl(user);
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
          openQrModal(user, url);
        }
      });
    });
    document.body.appendChild(wrap);
  }

  function openSheet() {
    ensureCSS();
    ensureSheet();
    document.getElementById('tchiloProfileShareSheet').classList.add('open');
  }

  function closeSheet() {
    var el = document.getElementById('tchiloProfileShareSheet');
    if (el) el.classList.remove('open');
  }

  function openQrModal(username, url) {
    ensureCSS();
    var modal = document.getElementById('tchiloQrModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'tchiloQrModal';
      modal.innerHTML =
        '<div class="card">' +
        '<div id="tchiloQrMount" style="min-height:200px;display:flex;align-items:center;justify-content:center">A gerar QR…</div>' +
        '<div class="actions">' +
        '<button type="button" class="primary" data-q="download">Descarregar QR</button>' +
        '<button type="button" class="ghost" data-q="copy">Copiar link</button>' +
        '<button type="button" class="ghost" data-q="close">Fechar</button>' +
        '</div></div>';
      modal.addEventListener('click', function (e) {
        if (e.target === modal) closeQr();
      });
      document.body.appendChild(modal);
    }
    modal.classList.add('open');
    var mount = document.getElementById('tchiloQrMount');
    mount.innerHTML = 'A gerar QR…';
    window.__tchiloQrCanvas = null;
    window.__tchiloQrUrl = url;

    buildBrandedQrCanvas(url, username, function (err, canvas) {
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
        var a = b.getAttribute('data-q');
        if (a === 'close') return closeQr();
        if (a === 'copy') return copyText(url);
        if (a === 'download') {
          if (window.__tchiloQrCanvas) {
            downloadCanvas(window.__tchiloQrCanvas, 'tchilo-' + (username || 'perfil') + '-qr.png');
          } else {
            var w = window.open(qrImageUrl(url, 512), '_blank');
            if (!w) toast('Abre o QR e guarda a imagem');
          }
        }
      };
    });
  }

  function closeQr() {
    var modal = document.getElementById('tchiloQrModal');
    if (modal) modal.classList.remove('open');
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
      btn.setAttribute('aria-label', 'Mais opções');
      btn.innerHTML =
        '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">' +
        '<circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/>' +
        '</svg>';
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        openSheet();
      });
      header.appendChild(btn);
    }
    btn.style.display = 'flex';
  }

  function boot() {
    ensureHeaderBtn();
    ensureSheet();
  }

  window.tchiloProfileShareUrl = function (username) {
    return profileUrl(username || currentProfileUsername());
  };
  window.tchiloOpenProfileShare = openSheet;

  boot();
  setTimeout(boot, 200);
  setTimeout(boot, 800);
  setTimeout(boot, 2000);
  setInterval(boot, 3000);

  if (typeof window.renderProfile === 'function' && !window.renderProfile.__sharePatchV3) {
    var rp = window.renderProfile;
    window.renderProfile = function () {
      var r = rp.apply(this, arguments);
      setTimeout(ensureHeaderBtn, 30);
      setTimeout(ensureHeaderBtn, 200);
      return r;
    };
    window.renderProfile.__sharePatchV3 = true;
  }
})();

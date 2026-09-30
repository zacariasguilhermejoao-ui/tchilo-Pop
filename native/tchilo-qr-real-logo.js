/**
 * tchilo — força QR com a imagem real do logo (não desenho)
 */
(function () {
  'use strict';
  if (window.__tchiloQrRealLogoV1) return;
  window.__tchiloQrRealLogoV1 = true;

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

  function buildWithRealLogo(profileLink, username, cb) {
    var size = 720;
    var qrImg = new Image();
    var logoImg = new Image();
    var qrOk = false;
    var logoOk = false;
    var logoFail = false;

    function compose() {
      if (!qrOk) return;
      if (!logoOk && !logoFail) return;
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
        ctx.drawImage(qrImg, qrPad, qrPad, size - qrPad * 2, size - qrPad * 2);
        var badge = size * 0.26;
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
        if (logoOk && logoImg.width) {
          var lw = badge * 0.95;
          ctx.save();
          ctx.beginPath();
          ctx.arc(bx, by, badge * 0.52, 0, Math.PI * 2);
          ctx.clip();
          ctx.drawImage(logoImg, bx - lw / 2, by - lw / 2, lw, lw);
          ctx.restore();
        }
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
    }

    qrImg.crossOrigin = 'anonymous';
    qrImg.onload = function () { qrOk = true; compose(); };
    qrImg.onerror = function () { cb(new Error('QR fail')); };
    qrImg.src =
      'https://api.qrserver.com/v1/create-qr-code/?size=500x500&margin=10&color=0B0B0C&bgcolor=C8F560&data=' +
      encodeURIComponent(profileLink);

    logoImg.onload = function () { logoOk = true; compose(); };
    logoImg.onerror = function () { logoFail = true; compose(); };
    logoImg.src = window.TCHILO_LOGO_DATA || '';
  }

  var obs = new MutationObserver(function () {
    var mount = document.getElementById('tchiloQrMount');
    if (!mount || mount.__realLogo) return;
    if (!window.TCHILO_LOGO_DATA) return;
    mount.__realLogo = true;

    var card = mount.closest('.card');
    var userEl = card && card.querySelector('.qr-user');
    var username = userEl ? (userEl.textContent || '').replace(/^@/, '').trim() : '';
    var origin = location.origin || 'https://tchilopop.com';
    var url = username ? origin + '/u/' + encodeURIComponent(username) : origin + '/perfil';

    mount.innerHTML = '<div style="padding:20px;font-weight:700">A gerar QR…</div>';
    buildWithRealLogo(url, username, function (err, canvas) {
      if (err || !canvas) return;
      window.__tchiloQrCanvas = canvas;
      mount.innerHTML = '';
      canvas.style.width = '100%';
      canvas.style.height = 'auto';
      canvas.style.borderRadius = '14px';
      mount.appendChild(canvas);
    });
  });
  try {
    obs.observe(document.documentElement, { childList: true, subtree: true });
  } catch (e) {}
})();

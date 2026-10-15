/**
 * Tchilo QR — mostrar + ler (BarcodeDetector ou jsQR)
 * v2
 */
(function () {
  'use strict';
  if (window.__tchiloQrV2) return;
  window.__tchiloQrV2 = true;
  window.__tchiloQrV1 = true;

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      if (document.querySelector('script[src="' + src + '"]')) {
        resolve();
        return;
      }
      var s = document.createElement('script');
      s.src = src;
      s.onload = function () { resolve(); };
      s.onerror = function () { reject(); };
      document.head.appendChild(s);
    });
  }

  function ensureQRCodeLib() {
    if (window.QRCode) return Promise.resolve();
    return loadScript('https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js').catch(function () {});
  }

  function ensureJsQR() {
    if (window.jsQR) return Promise.resolve();
    return loadScript('https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js').catch(function () {});
  }

  var scanStream = null;
  var scanRaf = null;

  function stopScan() {
    if (scanRaf) {
      try { cancelAnimationFrame(scanRaf); } catch (e) {}
      scanRaf = null;
    }
    if (scanStream) {
      try {
        scanStream.getTracks().forEach(function (t) { t.stop(); });
      } catch (e) {}
      scanStream = null;
    }
  }

  function closeModal() {
    stopScan();
    var m = document.getElementById('tchiloQrModal');
    if (m) {
      m.style.display = 'none';
      m.classList.remove('open');
    }
  }

  function ensureModal() {
    var m = document.getElementById('tchiloQrModal');
    if (m) return m;
    m = document.createElement('div');
    m.id = 'tchiloQrModal';
    m.setAttribute('role', 'dialog');
    m.style.cssText =
      'position:fixed;inset:0;z-index:2147483700;display:none;align-items:center;justify-content:center;' +
      'background:rgba(11,11,12,.55);padding:20px;box-sizing:border-box;';
    m.innerHTML =
      '<div class="card" style="width:min(100%,340px);background:var(--paper,#fff);color:var(--ink,#0B0B0C);' +
      'border-radius:20px;padding:20px 18px 16px;text-align:center;' +
      'font-family:system-ui,-apple-system,BlinkMacSystemFont,\'Segoe UI\',Roboto,sans-serif;' +
      'box-shadow:0 12px 40px rgba(0,0,0,.2);">' +
      '<div id="tchiloQrTitle" style="font:700 16px system-ui,-apple-system,sans-serif;margin-bottom:12px">Código QR</div>' +
      '<div id="tchiloQrBox" style="display:flex;justify-content:center;min-height:200px;align-items:center;flex-direction:column;gap:8px"></div>' +
      '<div id="tchiloQrHint" style="font-size:12px;opacity:.65;margin:10px 0 14px;word-break:break-all"></div>' +
      '<div class="actions" style="display:flex;flex-direction:column;gap:8px">' +
      '<button type="button" class="primary" id="tchiloQrPrimary" style="padding:14px;border:0;border-radius:12px;background:#0B0B0C;color:#fff;font:600 14px system-ui,-apple-system,sans-serif">Copiar link</button>' +
      '<button type="button" class="ghost" id="tchiloQrClose" style="padding:14px;border:0;border-radius:12px;background:rgba(11,11,12,.06);font:600 14px system-ui,-apple-system,sans-serif">Fechar</button>' +
      '</div></div>';
    document.body.appendChild(m);
    m.addEventListener('click', function (e) {
      if (e.target === m) closeModal();
    });
    return m;
  }

  window.tchiloShowQr = function (url) {
    url = String(url || '').trim();
    if (!url) return;
    stopScan();
    var m = ensureModal();
    var box = document.getElementById('tchiloQrBox');
    var title = document.getElementById('tchiloQrTitle');
    var hint = document.getElementById('tchiloQrHint');
    var primary = document.getElementById('tchiloQrPrimary');
    if (title) title.textContent = 'O meu código QR';
    if (hint) hint.textContent = url;
    if (box) box.innerHTML = '<span style="opacity:.5;font-size:13px">A gerar…</span>';
    if (primary) {
      primary.textContent = 'Copiar link';
      primary.onclick = function () {
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(url).then(function () {
              if (typeof showToast === 'function') showToast('Link copiado');
            });
          }
        } catch (e) {}
      };
    }
    document.getElementById('tchiloQrClose').onclick = closeModal;
    m.style.display = 'flex';
    m.classList.add('open');

    ensureQRCodeLib().then(function () {
      if (!box) return;
      box.innerHTML = '';
      if (window.QRCode) {
        try {
          var holder = document.createElement('div');
          box.appendChild(holder);
          new QRCode(holder, {
            text: url,
            width: 200,
            height: 200,
            colorDark: '#0B0B0C',
            colorLight: '#ffffff',
            correctLevel: window.QRCode.CorrectLevel ? window.QRCode.CorrectLevel.M : 1
          });
          return;
        } catch (e) {}
      }
      var img = document.createElement('img');
      img.alt = 'QR';
      img.width = 200;
      img.height = 200;
      img.style.borderRadius = '12px';
      img.src =
        'https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=8&data=' +
        encodeURIComponent(url);
      box.appendChild(img);
    });
  };

  function handleScanned(text) {
    text = String(text || '').trim();
    if (!text) return;
    stopScan();
    closeModal();
    var user = null;
    try {
      var u = new URL(text, location.origin);
      user = u.searchParams.get('u') || u.searchParams.get('user');
      if (!user) {
        var m = u.pathname.match(/\/(?:u|@)\/?([^/]+)/);
        if (m) user = m[1];
      }
    } catch (e) {
      if (/^@?[a-zA-Z0-9_.]{2,32}$/.test(text)) user = text.replace(/^@/, '');
    }
    if (user) {
      try {
        if (typeof openUserProfile === 'function') openUserProfile(user);
        else location.href = '/?u=' + encodeURIComponent(user);
      } catch (e2) {
        location.href = '/?u=' + encodeURIComponent(user);
      }
    } else if (/^https?:\/\//i.test(text)) {
      try { location.href = text; } catch (e3) {}
    } else if (typeof showToast === 'function') {
      showToast('QR não reconhecido');
    }
  }

  function loopDetect(video, canvas) {
    var ctx = canvas.getContext('2d', { willReadFrequently: true });
    function tick() {
      if (!scanStream || !video || video.readyState < 2) {
        scanRaf = requestAnimationFrame(tick);
        return;
      }
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      try {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        if (window.jsQR) {
          var img = ctx.getImageData(0, 0, canvas.width, canvas.height);
          var code = window.jsQR(img.data, img.width, img.height, { inversionAttempts: 'dontInvert' });
          if (code && code.data) {
            handleScanned(code.data);
            return;
          }
        }
      } catch (e) {}
      scanRaf = requestAnimationFrame(tick);
    }
    scanRaf = requestAnimationFrame(tick);
  }

  window.tchiloScanQr = function () {
    stopScan();
    var m = ensureModal();
    var box = document.getElementById('tchiloQrBox');
    var title = document.getElementById('tchiloQrTitle');
    var hint = document.getElementById('tchiloQrHint');
    var primary = document.getElementById('tchiloQrPrimary');
    if (title) title.textContent = 'Ler QR';
    if (hint) hint.textContent = 'Aponta a câmara ao código QR do perfil';
    if (box) {
      box.innerHTML =
        '<video id="tchiloQrVideo" playsinline muted autoplay style="width:100%;max-height:300px;border-radius:12px;background:#000;object-fit:cover"></video>' +
        '<canvas id="tchiloQrCanvas" style="display:none"></canvas>';
    }
    if (primary) {
      primary.textContent = 'Cancelar';
      primary.onclick = function () {
        stopScan();
        closeModal();
      };
    }
    document.getElementById('tchiloQrClose').onclick = function () {
      stopScan();
      closeModal();
    };
    m.style.display = 'flex';
    m.classList.add('open');

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      if (hint) hint.textContent = 'Câmara não disponível neste dispositivo';
      return;
    }

    ensureJsQR().then(function () {
      return navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false
      });
    }).then(function (stream) {
      scanStream = stream;
      var video = document.getElementById('tchiloQrVideo');
      var canvas = document.getElementById('tchiloQrCanvas');
      if (!video) return;
      video.srcObject = stream;
      video.setAttribute('playsinline', 'true');
      video.play().catch(function () {});
      if (window.BarcodeDetector) {
        try {
          var det = new window.BarcodeDetector({ formats: ['qr_code'] });
          var iv = setInterval(function () {
            if (!scanStream) {
              clearInterval(iv);
              return;
            }
            det.detect(video).then(function (codes) {
              if (codes && codes[0] && codes[0].rawValue) {
                clearInterval(iv);
                handleScanned(codes[0].rawValue);
              }
            }).catch(function () {});
          }, 400);
          return;
        } catch (e) {}
      }
      if (canvas) loopDetect(video, canvas);
      else if (hint) hint.textContent = 'Leitor limitado neste browser. Tenta Chrome ou actualiza o Safari.';
    }).catch(function (err) {
      if (hint) {
        hint.textContent =
          'Não foi possível abrir a câmara. Verifica a permissão e tenta de novo.';
      }
      if (typeof showToast === 'function') showToast('Câmara indisponível');
    });
  };
})();

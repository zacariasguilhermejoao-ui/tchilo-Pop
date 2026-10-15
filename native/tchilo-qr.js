/**
 * Tchilo QR — mostrar código e ler QR de perfis
 * v1
 */
(function () {
  'use strict';
  if (window.__tchiloQrV1) return;
  window.__tchiloQrV1 = true;

  function ensureLib(cb) {
    if (window.QRCode) {
      cb();
      return;
    }
    var s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
    s.onload = function () { cb(); };
    s.onerror = function () {
      /* fallback: API image */
      cb();
    };
    document.head.appendChild(s);
  }

  function closeModal() {
    var m = document.getElementById('tchiloQrModal');
    if (m) {
      m.style.display = 'none';
      m.classList.remove('open');
    }
    stopScan();
  }

  function ensureModal() {
    var m = document.getElementById('tchiloQrModal');
    if (m) return m;
    m = document.createElement('div');
    m.id = 'tchiloQrModal';
    m.style.cssText =
      'position:fixed;inset:0;z-index:2147483700;display:none;align-items:center;justify-content:center;' +
      'background:rgba(11,11,12,.55);padding:20px;box-sizing:border-box;';
    m.innerHTML =
      '<div class="card" style="width:min(100%,340px);background:var(--paper,#fff);color:var(--ink,#0B0B0C);' +
      'border-radius:20px;padding:20px 18px 16px;text-align:center;box-shadow:0 12px 40px rgba(0,0,0,.2);">' +
      '<div id="tchiloQrTitle" style="font:700 16px system-ui,sans-serif;margin-bottom:12px">Código QR</div>' +
      '<div id="tchiloQrBox" style="display:flex;justify-content:center;min-height:200px;align-items:center"></div>' +
      '<div id="tchiloQrHint" style="font-size:12px;opacity:.65;margin:10px 0 14px;word-break:break-all"></div>' +
      '<div class="actions" style="display:flex;flex-direction:column;gap:8px">' +
      '<button type="button" class="primary" id="tchiloQrCopy" style="padding:14px;border:0;border-radius:12px;background:#0B0B0C;color:#fff;font:600 14px system-ui,sans-serif">Copiar link</button>' +
      '<button type="button" class="ghost" id="tchiloQrClose" style="padding:14px;border:0;border-radius:12px;background:rgba(11,11,12,.06);font:600 14px system-ui,sans-serif">Fechar</button>' +
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
    var m = ensureModal();
    var box = document.getElementById('tchiloQrBox');
    var title = document.getElementById('tchiloQrTitle');
    var hint = document.getElementById('tchiloQrHint');
    if (title) title.textContent = 'Código QR';
    if (hint) hint.textContent = url;
    if (box) box.innerHTML = '';
    m.style.display = 'flex';
    m.classList.add('open');

    document.getElementById('tchiloQrClose').onclick = closeModal;
    document.getElementById('tchiloQrCopy').onclick = function () {
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(url).then(function () {
            if (typeof showToast === 'function') showToast('Link copiado');
          });
        }
      } catch (e) {}
    };

    ensureLib(function () {
      if (!box) return;
      box.innerHTML = '';
      if (window.QRCode) {
        try {
          new QRCode(box, {
            text: url,
            width: 200,
            height: 200,
            colorDark: '#0B0B0C',
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.M
          });
          return;
        } catch (e) {}
      }
      /* fallback API */
      var img = document.createElement('img');
      img.alt = 'QR';
      img.width = 200;
      img.height = 200;
      img.style.borderRadius = '12px';
      img.src =
        'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' +
        encodeURIComponent(url);
      box.appendChild(img);
    });
  };

  var scanStream = null;
  var scanTimer = null;

  function stopScan() {
    if (scanTimer) {
      clearInterval(scanTimer);
      scanTimer = null;
    }
    if (scanStream) {
      try {
        scanStream.getTracks().forEach(function (t) {
          t.stop();
        });
      } catch (e) {}
      scanStream = null;
    }
  }

  function handleScanned(text) {
    stopScan();
    closeModal();
    text = String(text || '').trim();
    if (!text) return;
    /* extrair username de URL tchilo */
    var user = null;
    try {
      var u = new URL(text, location.origin);
      user = u.searchParams.get('u') || u.searchParams.get('user');
      if (!user && u.pathname) {
        var m = u.pathname.match(/\/u\/([^/]+)/) || u.pathname.match(/\/@?([a-zA-Z0-9_.]+)/);
        if (m) user = m[1];
      }
    } catch (e) {
      if (/^[a-zA-Z0-9_.]{2,32}$/.test(text.replace(/^@/, ''))) user = text.replace(/^@/, '');
    }
    if (user) {
      try {
        if (typeof openUserProfile === 'function') openUserProfile(user);
        else if (typeof window.openUserProfile === 'function') window.openUserProfile(user);
        else location.href = '/?u=' + encodeURIComponent(user);
      } catch (e2) {
        location.href = '/?u=' + encodeURIComponent(user);
      }
    } else if (text.indexOf('http') === 0) {
      try {
        location.href = text;
      } catch (e3) {}
    } else if (typeof showToast === 'function') {
      showToast('QR não reconhecido');
    }
  }

  window.tchiloScanQr = function () {
    var m = ensureModal();
    var box = document.getElementById('tchiloQrBox');
    var title = document.getElementById('tchiloQrTitle');
    var hint = document.getElementById('tchiloQrHint');
    if (title) title.textContent = 'Ler QR';
    if (hint) hint.textContent = 'Aponta a câmara ao código QR do perfil';
    if (box) {
      box.innerHTML =
        '<video id="tchiloQrVideo" playsinline muted style="width:100%;max-height:280px;border-radius:12px;background:#000"></video>' +
        '<canvas id="tchiloQrCanvas" style="display:none"></canvas>';
    }
    m.style.display = 'flex';
    m.classList.add('open');
    document.getElementById('tchiloQrClose').onclick = function () {
      stopScan();
      closeModal();
    };
    document.getElementById('tchiloQrCopy').textContent = 'Cancelar';
    document.getElementById('tchiloQrCopy').onclick = function () {
      stopScan();
      closeModal();
    };

    /* BarcodeDetector API (Chrome/Android) */
    var video = document.getElementById('tchiloQrVideo');
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      if (hint) hint.textContent = 'Câmara não disponível neste dispositivo';
      return;
    }
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment' }, audio: false })
      .then(function (stream) {
        scanStream = stream;
        if (video) {
          video.srcObject = stream;
          video.play();
        }
        if (window.BarcodeDetector) {
          var det = new window.BarcodeDetector({ formats: ['qr_code'] });
          scanTimer = setInterval(function () {
            if (!video || video.readyState < 2) return;
            det
              .detect(video)
              .then(function (codes) {
                if (codes && codes[0] && codes[0].rawValue) {
                  handleScanned(codes[0].rawValue);
                }
              })
              .catch(function () {});
          }, 500);
        } else {
          if (hint)
            hint.textContent =
              'Leitor nativo indisponível. Pede à pessoa para partilhar o link, ou usa um leitor de QR do sistema.';
        }
      })
      .catch(function () {
        if (hint) hint.textContent = 'Permissão de câmara negada';
      });
  };
})();

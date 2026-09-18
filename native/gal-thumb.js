/**
 * tchilo-Pop — miniatura da foto recente no botão da galeria
 */
(function () {
  "use strict";
  var KEY = "tchiloGalThumb";

  function setThumb(btn, src) {
    if (!btn) return;
    btn.innerHTML = "";
    if (src) {
      var img = document.createElement("img");
      img.src = src;
      img.alt = "Galeria";
      img.style.cssText = "width:100%;height:100%;object-fit:cover;display:block;border-radius:10px;";
      btn.appendChild(img);
    } else {
      btn.textContent = "▦";
    }
  }

  function loadThumb(btn) {
    try {
      var src = localStorage.getItem(KEY);
      if (src) setThumb(btn, src);
      else setThumb(btn, null);
    } catch (e) {
      setThumb(btn, null);
    }
  }

  function saveFromFile(file) {
    if (!file) return;
    if ((file.type || "").indexOf("image") === 0) {
      var r = new FileReader();
      r.onload = function () {
        var im = new Image();
        im.onload = function () {
          var c = document.createElement("canvas");
          c.width = 128;
          c.height = 128;
          var ctx = c.getContext("2d");
          var s = Math.min(im.width, im.height);
          ctx.drawImage(im, (im.width - s) / 2, (im.height - s) / 2, s, s, 0, 0, 128, 128);
          try {
            var data = c.toDataURL("image/jpeg", 0.75);
            localStorage.setItem(KEY, data);
            var btn = document.getElementById("tscGal");
            setThumb(btn, data);
          } catch (e) {}
        };
        im.src = r.result;
      };
      r.readAsDataURL(file);
      return;
    }
    if ((file.type || "").indexOf("video") === 0) {
      try {
        var url = URL.createObjectURL(file);
        var v = document.createElement("video");
        v.muted = true;
        v.playsInline = true;
        v.preload = "metadata";
        v.onloadeddata = function () {
          try {
            v.currentTime = 0.15;
          } catch (e0) {}
        };
        v.onseeked = function () {
          try {
            var c = document.createElement("canvas");
            c.width = 96;
            c.height = 96;
            c.getContext("2d").drawImage(v, 0, 0, 96, 96);
            var data = c.toDataURL("image/jpeg", 0.7);
            localStorage.setItem(KEY, data);
            setThumb(document.getElementById("tscGal"), data);
          } catch (e1) {}
          try {
            URL.revokeObjectURL(url);
          } catch (e2) {}
        };
        v.src = url;
      } catch (e3) {}
    }
  }

  function styleBtn(btn) {
    if (!btn || btn.__galThumbStyled) return;
    btn.__galThumbStyled = true;
    btn.style.cssText =
      "width:48px;height:48px;border-radius:12px;border:2px solid #fff;" +
      "background:rgba(255,255,255,.15);overflow:hidden;padding:0;" +
      "display:flex;align-items:center;justify-content:center;color:#fff;font-size:18px;";
  }

  function hookFile(input) {
    if (!input || input.__galThumbHooked) return;
    input.__galThumbHooked = true;
    input.addEventListener("change", function () {
      var f = input.files && input.files[0];
      if (f) saveFromFile(f);
    });
  }

  function tick() {
    var btn = document.getElementById("tscGal");
    var input = document.getElementById("tscFile");
    if (btn) {
      styleBtn(btn);
      if (!btn.__galThumbLoaded) {
        btn.__galThumbLoaded = true;
        loadThumb(btn);
      }
    }
    if (input) hookFile(input);
  }

  setInterval(tick, 400);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", tick);
  else tick();
})();

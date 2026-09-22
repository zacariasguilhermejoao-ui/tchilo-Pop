/**
 * tchilo-Pop — Gestor de Anuncios com mapa real (Leaflet + Nominatim)
 * Pesquisa mundial, pin no mapa, raio da zona, geo nativa
 */
(function () {
  "use strict";

  var PRICE_AD = "pri_01m31nb48pzvs976yz2nd1wtbp";
  var PADDLE_TOKEN = "live_05be77c7629150c894e94e62559";
  var map = null;
  var marker = null;
  var circle = null;
  var searchTimer = null;

  var draft = {
    step: 1,
    mediaUrl: null,
    mediaType: null,
    title: "",
    body: "",
    objective: "click",
    link: "",
    days: 3,
    ageMin: 18,
    ageMax: 45,
    // localizacao real
    targetLat: null,
    targetLng: null,
    targetRadiusKm: 25,
    targetLabel: "",
    targetCountry: "",
    targetScope: "zone" // world | country | zone
  };

  function esc(s) {
    var amp = String.fromCharCode(38);
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      if (c === "&") return amp + "amp;";
      if (c === "<") return amp + "lt;";
      if (c === ">") return amp + "gt;";
      if (c === '"') return amp + "quot;";
      return amp + "#39;";
    });
  }

  function meId() {
    try {
      if (typeof getSession === "function") {
        var s = getSession();
        if (s && (s.id || s.user_id)) return String(s.id || s.user_id);
        if (s && s.user && s.user.id) return String(s.user.id);
      }
    } catch (e) {}
    return "";
  }

  function meName() {
    try {
      if (typeof getSession === "function") {
        var s = getSession();
        if (s && s.username) return String(s.username);
      }
    } catch (e) {}
    return "tu";
  }

  function ensureLeaflet(cb) {
    if (window.L) {
      cb && cb();
      return;
    }
    if (!document.getElementById("leafletCSS")) {
      var link = document.createElement("link");
      link.id = "leafletCSS";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }
    var s = document.createElement("script");
    s.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    s.onload = function () {
      cb && cb();
    };
    s.onerror = function () {
      alert("Nao foi possivel carregar o mapa. Verifica a internet.");
    };
    document.head.appendChild(s);
  }

  function ensureCSS() {
    if (document.getElementById("tchiloAdsProCSS")) return;
    var st = document.createElement("style");
    st.id = "tchiloAdsProCSS";
    st.textContent =
      "#tchiloAdsPro{display:none;position:fixed;inset:0;z-index:9999;background:#F7F6F2;color:#0B0B0C;flex-direction:column;font-family:Inter,system-ui,sans-serif}" +
      "#tchiloAdsPro.open{display:flex!important}" +
      "#tchiloAdsPro .ap-top{display:flex;align-items:center;gap:10px;padding:calc(12px + env(safe-area-inset-top)) 14px 12px;border-bottom:2.5px solid #0B0B0C;flex-shrink:0}" +
      "#tchiloAdsPro .ap-top h1{flex:1;margin:0;font:800 17px Inter,sans-serif}" +
      "#tchiloAdsPro .ap-back,#tchiloAdsPro .ap-x{width:40px;height:40px;border:2.5px solid #0B0B0C;border-radius:50%;background:#FFE566;font:900 18px Inter,sans-serif;cursor:pointer}" +
      "#tchiloAdsPro .ap-body{flex:1;overflow:auto;padding:14px 14px calc(28px + env(safe-area-inset-bottom))}" +
      "#tchiloAdsPro .ap-card{border:2.5px solid #0B0B0C;border-radius:16px;padding:14px;margin-bottom:12px;background:#fff}" +
      "#tchiloAdsPro .ap-card h2{margin:0 0 6px;font:800 15px Inter,sans-serif}" +
      "#tchiloAdsPro .ap-card p{margin:0;font:600 13px Inter,sans-serif;opacity:.75}" +
      "#tchiloAdsPro .ap-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}" +
      "#tchiloAdsPro .ap-btn{display:flex;flex-direction:column;align-items:flex-start;gap:6px;padding:16px;border:2.5px solid #0B0B0C;border-radius:16px;background:#fff;cursor:pointer;text-align:left;font:inherit;color:inherit;box-shadow:3px 3px 0 #0B0B0C}" +
      "#tchiloAdsPro .ap-btn.primary{background:#c8f560}" +
      "#tchiloAdsPro .ap-btn b{font:900 15px Inter,sans-serif}" +
      "#tchiloAdsPro .ap-btn span{font:600 12px Inter,sans-serif;opacity:.7}" +
      "#tchiloAdsPro label.ap-lab{display:block;font:800 11px Inter,sans-serif;text-transform:uppercase;opacity:.65;margin:12px 0 6px}" +
      "#tchiloAdsPro input,#tchiloAdsPro textarea,#tchiloAdsPro select{width:100%;box-sizing:border-box;padding:12px;border:2.5px solid #0B0B0C;border-radius:12px;font:600 14px Inter,sans-serif;background:#fff}" +
      "#tchiloAdsPro textarea{min-height:90px}" +
      "#tchiloAdsPro .ap-chips{display:flex;flex-wrap:wrap;gap:8px}" +
      "#tchiloAdsPro .ap-chip{padding:8px 12px;border:2px solid #0B0B0C;border-radius:999px;font:800 12px Inter,sans-serif;background:#fff;cursor:pointer}" +
      "#tchiloAdsPro .ap-chip.on{background:#c8f560}" +
      "#tchiloAdsPro .ap-reach{padding:12px;border:2.5px dashed #0B0B0C;border-radius:14px;background:#f1ecff;font:700 13px Inter,sans-serif;margin:12px 0}" +
      "#tchiloAdsPro .ap-pay{width:100%;margin-top:8px;padding:14px;border:3px solid #0B0B0C;border-radius:16px;background:#c8f560;font:900 15px Inter,sans-serif;box-shadow:4px 4px 0 #0B0B0C;cursor:pointer}" +
      "#tchiloAdsPro .ap-steps{display:flex;gap:6px;margin-bottom:14px}" +
      "#tchiloAdsPro .ap-step{flex:1;height:4px;border-radius:4px;background:rgba(0,0,0,.12)}" +
      "#tchiloAdsPro .ap-step.on{background:#0B0B0C}" +
      "#tchiloAdsPro .ap-preview{border:2.5px solid #0B0B0C;border-radius:16px;overflow:hidden;background:#fff;margin-top:12px}" +
      "#tchiloAdsPro .pv-head{display:flex;align-items:center;gap:10px;padding:10px 12px}" +
      "#tchiloAdsPro .pv-av{width:36px;height:36px;border-radius:50%;background:#c8f560;border:2px solid #0B0B0C;display:flex;align-items:center;justify-content:center;font:900 14px Inter,sans-serif}" +
      "#tchiloAdsPro .pv-media{min-height:140px;background:#111;color:#fff;display:flex;align-items:center;justify-content:center}" +
      "#tchiloAdsPro .pv-media img,#tchiloAdsPro .pv-media video{width:100%;max-height:240px;object-fit:cover;display:block}" +
      "#tchiloAdsPro .pv-cap{padding:10px 12px;font:600 14px Inter,sans-serif}" +
      "#tchiloAdsPro .pv-cta{margin:0 12px 12px;padding:11px;border:2.5px solid #0B0B0C;border-radius:12px;background:#c8f560;font:900 13px Inter,sans-serif;text-align:center}" +
      "#apMap{height:240px;border:2.5px solid #0B0B0C;border-radius:14px;margin-top:8px;z-index:1}" +
      "#apSearchResults{list-style:none;margin:6px 0 0;padding:0;max-height:160px;overflow:auto;border:2px solid #0B0B0C;border-radius:12px;background:#fff;display:none}" +
      "#apSearchResults li{padding:10px 12px;border-bottom:1px solid #eee;font:600 13px Inter,sans-serif;cursor:pointer}" +
      "#apSearchResults li:active{background:#c8f560}" +
      "#apLocLabel{margin-top:8px;font:700 13px Inter,sans-serif;line-height:1.35}";
    document.head.appendChild(st);
  }

  function destroyMap() {
    try {
      if (map) {
        map.remove();
      }
    } catch (e) {}
    map = null;
    marker = null;
    circle = null;
  }

  function root() {
    var el = document.getElementById("tchiloAdsPro");
    if (el) return el;
    el = document.createElement("div");
    el.id = "tchiloAdsPro";
    el.innerHTML =
      "<div class=\"ap-top\">" +
      "<button type=\"button\" class=\"ap-back\" id=\"apBack\">\u2190</button>" +
      "<h1 id=\"apTitle\">Anuncios</h1>" +
      "<button type=\"button\" class=\"ap-x\" id=\"apClose\">\u00d7</button></div>" +
      "<div class=\"ap-body\" id=\"apBody\"></div>";
    document.body.appendChild(el);
    el.querySelector("#apClose").onclick = close;
    el.querySelector("#apBack").onclick = function () {
      if (draft.step > 1 && el.dataset.view === "create") {
        draft.step--;
        renderCreate();
      } else if (el.dataset.view === "create" || el.dataset.view === "manage") {
        renderHub();
      } else close();
    };
    return el;
  }

  function open() {
    ensureCSS();
    var el = root();
    el.classList.add("open");
    renderHub();
  }

  function close() {
    destroyMap();
    var el = document.getElementById("tchiloAdsPro");
    if (el) el.classList.remove("open");
  }

  function setTitle(t) {
    var h = document.getElementById("apTitle");
    if (h) h.textContent = t;
  }

  function bodyEl() {
    return document.getElementById("apBody");
  }

  function reachText(days) {
    var d = Math.max(1, Math.min(30, parseInt(days, 10) || 1));
    return d + " dias = $" + d + " · alcance estimado de " + d * 800 + " a " + d * 1000 + " pessoas";
  }

  function renderHub() {
    destroyMap();
    root().dataset.view = "hub";
    setTitle("Gestor de Anuncios");
    bodyEl().innerHTML =
      "<div class=\"ap-grid\">" +
      "<button type=\"button\" class=\"ap-btn primary\" id=\"apGoCreate\"><b>Fazer anuncio</b><span>Foto · Mapa real · Pagamento</span></button>" +
      "<button type=\"button\" class=\"ap-btn\" id=\"apGoManage\"><b>Gerir anuncios</b><span>Metricas e estado</span></button></div>" +
      "<div class=\"ap-card\" style=\"margin-top:14px\"><h2>Localizacao real</h2><p>Pesquisa qualquer pais, cidade ou bairro. Marca a zona no mapa e define o raio. O app usa a localizacao do utilizador para entregar o anuncio.</p></div>";
    document.getElementById("apGoCreate").onclick = function () {
      draft.step = 1;
      renderCreate();
    };
    document.getElementById("apGoManage").onclick = renderManage;
  }

  function stepsHtml() {
    return (
      "<div class=\"ap-steps\">" +
      [1, 2, 3, 4]
        .map(function (i) {
          return "<div class=\"ap-step" + (i <= draft.step ? " on" : "") + "\"></div>";
        })
        .join("") +
      "</div>"
    );
  }

  function renderCreate() {
    root().dataset.view = "create";
    setTitle("Criar anuncio");
    if (draft.step !== 3) destroyMap();
    if (draft.step === 1) renderStep1();
    else if (draft.step === 2) renderStep2();
    else if (draft.step === 3) renderStep3();
    else renderStep4();
  }

  function renderStep1() {
    bodyEl().innerHTML =
      stepsHtml() +
      "<div class=\"ap-card\"><h2>Conteudo</h2><p>Carrega foto/video e escreve o texto.</p></div>" +
      "<label class=\"ap-lab\">Titulo</label><input id=\"apTitleIn\" maxlength=\"80\" placeholder=\"Titulo\" value=\"" +
      esc(draft.title) +
      "\"/>" +
      "<label class=\"ap-lab\">Descricao</label><textarea id=\"apBodyIn\" maxlength=\"500\">" +
      esc(draft.body) +
      "</textarea>" +
      "<label class=\"ap-lab\">Media</label><input id=\"apMediaFile\" type=\"file\" accept=\"image/*,video/*\"/>" +
      "<button type=\"button\" class=\"ap-pay\" id=\"apNext1\" style=\"margin-top:16px\">Continuar</button>";
    document.getElementById("apNext1").onclick = function () {
      draft.title = (document.getElementById("apTitleIn").value || "").trim();
      draft.body = (document.getElementById("apBodyIn").value || "").trim();
      var f = document.getElementById("apMediaFile");
      if (f && f.files && f.files[0]) {
        try {
          draft.mediaUrl = URL.createObjectURL(f.files[0]);
          draft.mediaType = f.files[0].type.indexOf("video") >= 0 ? "video" : "image";
        } catch (e) {}
      }
      if (!draft.body && !draft.mediaUrl) {
        alert("Escreve uma descricao ou escolhe uma media");
        return;
      }
      draft.step = 2;
      renderCreate();
    };
  }

  function renderStep2() {
    bodyEl().innerHTML =
      stepsHtml() +
      "<div class=\"ap-card\"><h2>Objectivo</h2></div>" +
      "<div class=\"ap-chips\" id=\"apObj\">" +
      "<button type=\"button\" class=\"ap-chip" +
      (draft.objective === "click" ? " on" : "") +
      "\" data-v=\"click\">Clique (site)</button>" +
      "<button type=\"button\" class=\"ap-chip" +
      (draft.objective === "message" ? " on" : "") +
      "\" data-v=\"message\">Mensagem no Tchilo</button></div>" +
      "<label class=\"ap-lab\">Link (so Clique)</label>" +
      "<input id=\"apLink\" type=\"url\" placeholder=\"https://exemplo.com\" value=\"" +
      esc(draft.link) +
      "\"/>" +
      "<button type=\"button\" class=\"ap-pay\" id=\"apNext2\" style=\"margin-top:16px\">Continuar</button>";
    document.querySelectorAll("#apObj .ap-chip").forEach(function (c) {
      c.onclick = function () {
        document.querySelectorAll("#apObj .ap-chip").forEach(function (x) {
          x.classList.remove("on");
        });
        c.classList.add("on");
        draft.objective = c.getAttribute("data-v");
      };
    });
    document.getElementById("apNext2").onclick = function () {
      draft.link = (document.getElementById("apLink").value || "").trim();
      var on = document.querySelector("#apObj .ap-chip.on");
      draft.objective = (on && on.getAttribute("data-v")) || "click";
      if (draft.objective === "click" && !draft.link) {
        alert("Indica o link do site");
        return;
      }
      draft.step = 3;
      renderCreate();
    };
  }

  function setTarget(lat, lng, label, country) {
    draft.targetLat = lat;
    draft.targetLng = lng;
    draft.targetLabel = label || "";
    draft.targetCountry = country || "";
    draft.targetScope = "zone";
    var lab = document.getElementById("apLocLabel");
    if (lab) {
      lab.textContent =
        "Zona: " +
        (label || lat.toFixed(4) + ", " + lng.toFixed(4)) +
        " · raio " +
        draft.targetRadiusKm +
        " km";
    }
    updateMapPin();
  }

  function updateMapPin() {
    if (!map || !window.L || draft.targetLat == null) return;
    var latlng = [draft.targetLat, draft.targetLng];
    if (!marker) {
      marker = L.marker(latlng, { draggable: true }).addTo(map);
      marker.on("dragend", function () {
        var p = marker.getLatLng();
        setTarget(p.lat, p.lng, draft.targetLabel || "Ponto no mapa", draft.targetCountry);
      });
    } else {
      marker.setLatLng(latlng);
    }
    if (circle) {
      circle.setLatLng(latlng);
      circle.setRadius(draft.targetRadiusKm * 1000);
    } else {
      circle = L.circle(latlng, {
        radius: draft.targetRadiusKm * 1000,
        color: "#0B0B0C",
        weight: 2,
        fillColor: "#c8f560",
        fillOpacity: 0.25
      }).addTo(map);
    }
    map.setView(latlng, Math.min(14, map.getZoom() || 12));
  }

  function initMap() {
    ensureLeaflet(function () {
      var el = document.getElementById("apMap");
      if (!el || !window.L) return;
      destroyMap();
      var startLat = draft.targetLat;
      var startLng = draft.targetLng;
      if (startLat == null) {
        var g = window.tchiloGeo && window.tchiloGeo.get && window.tchiloGeo.get();
        if (g) {
          startLat = g.lat;
          startLng = g.lng;
        } else {
          startLat = -8.84;
          startLng = 13.23;
        }
      }
      map = L.map("apMap").setView([startLat, startLng], 12);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap"
      }).addTo(map);
      map.on("click", function (e) {
        setTarget(e.latlng.lat, e.latlng.lng, "Zona no mapa", draft.targetCountry);
        reverseGeocode(e.latlng.lat, e.latlng.lng);
      });
      if (draft.targetLat != null) updateMapPin();
      setTimeout(function () {
        try {
          map.invalidateSize();
        } catch (e) {}
      }, 200);
    });
  }

  function reverseGeocode(lat, lng) {
    fetch(
      "https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=" +
        encodeURIComponent(lat) +
        "&lon=" +
        encodeURIComponent(lng),
      { headers: { Accept: "application/json" } }
    )
      .then(function (r) {
        return r.json();
      })
      .then(function (j) {
        if (!j) return;
        var label = j.display_name || "Zona no mapa";
        var country = (j.address && (j.address.country || "")) || "";
        setTarget(lat, lng, label, country);
      })
      .catch(function () {});
  }

  function searchPlaces(q) {
    var list = document.getElementById("apSearchResults");
    if (!list) return;
    if (!q || q.length < 2) {
      list.style.display = "none";
      list.innerHTML = "";
      return;
    }
    fetch(
      "https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=8&q=" +
        encodeURIComponent(q),
      { headers: { Accept: "application/json" } }
    )
      .then(function (r) {
        return r.json();
      })
      .then(function (arr) {
        if (!arr || !arr.length) {
          list.innerHTML = "<li>Nenhum resultado</li>";
          list.style.display = "block";
          return;
        }
        list.innerHTML = arr
          .map(function (item, idx) {
            return (
              "<li data-i=\"" +
              idx +
              "\">" +
              esc(item.display_name) +
              "</li>"
            );
          })
          .join("");
        list.style.display = "block";
        list.__results = arr;
        list.querySelectorAll("li").forEach(function (li) {
          li.onclick = function () {
            var i = parseInt(li.getAttribute("data-i"), 10);
            var item = list.__results[i];
            if (!item) return;
            var lat = parseFloat(item.lat);
            var lng = parseFloat(item.lon);
            var country =
              (item.address && item.address.country) || "";
            setTarget(lat, lng, item.display_name, country);
            list.style.display = "none";
            if (map) map.setView([lat, lng], 13);
          };
        });
      })
      .catch(function () {
        list.innerHTML = "<li>Erro na pesquisa</li>";
        list.style.display = "block";
      });
  }

  function renderStep3() {
    bodyEl().innerHTML =
      stepsHtml() +
      "<h2 style=\"margin:0 0 10px;font:800 16px Inter,sans-serif\">Localizacao real</h2>" +
      "<div class=\"ap-card\"><p>Pesquisa pais, provincia, cidade ou bairro. Ou toca no mapa para marcar a zona. Arrasta o pino e ajusta o raio.</p></div>" +
      "<div class=\"ap-chips\" id=\"apScope\">" +
      "<button type=\"button\" class=\"ap-chip" +
      (draft.targetScope === "world" ? " on" : "") +
      "\" data-v=\"world\">Todo o mundo</button>" +
      "<button type=\"button\" class=\"ap-chip" +
      (draft.targetScope === "zone" ? " on" : "") +
      "\" data-v=\"zone\">Zona no mapa</button></div>" +
      "<label class=\"ap-lab\">Pesquisar local</label>" +
      "<input id=\"apSearch\" type=\"search\" placeholder=\"Ex: Luanda, Lisboa, Sao Paulo, bairro...\" autocomplete=\"off\"/>" +
      "<ul id=\"apSearchResults\"></ul>" +
      "<div id=\"apMap\"></div>" +
      "<div id=\"apLocLabel\">" +
      (draft.targetLabel
        ? "Zona: " + esc(draft.targetLabel) + " · raio " + draft.targetRadiusKm + " km"
        : "Toca no mapa ou pesquisa um local") +
      "</div>" +
      "<label class=\"ap-lab\">Raio da zona (km)</label>" +
      "<input type=\"range\" id=\"apRadius\" min=\"1\" max=\"500\" value=\"" +
      draft.targetRadiusKm +
      "\"/>" +
      "<div style=\"font:700 13px Inter,sans-serif;margin-top:4px\" id=\"apRadiusVal\">" +
      draft.targetRadiusKm +
      " km</div>" +
      "<button type=\"button\" class=\"ap-pay\" id=\"apUseMyLoc\" style=\"background:#ffe566;margin-top:12px\">Usar a minha localizacao</button>" +
      "<button type=\"button\" class=\"ap-pay\" id=\"apNext3\" style=\"margin-top:10px\">Continuar</button>";

    document.querySelectorAll("#apScope .ap-chip").forEach(function (c) {
      c.onclick = function () {
        document.querySelectorAll("#apScope .ap-chip").forEach(function (x) {
          x.classList.remove("on");
        });
        c.classList.add("on");
        draft.targetScope = c.getAttribute("data-v");
        if (draft.targetScope === "world") {
          draft.targetLat = null;
          draft.targetLng = null;
          draft.targetLabel = "Todo o mundo";
          var lab = document.getElementById("apLocLabel");
          if (lab) lab.textContent = "Alcance: todo o mundo";
        }
      };
    });

    var search = document.getElementById("apSearch");
    search.oninput = function () {
      clearTimeout(searchTimer);
      var q = search.value;
      searchTimer = setTimeout(function () {
        searchPlaces(q);
      }, 350);
    };

    var rad = document.getElementById("apRadius");
    rad.oninput = function () {
      draft.targetRadiusKm = parseInt(rad.value, 10) || 25;
      document.getElementById("apRadiusVal").textContent = draft.targetRadiusKm + " km";
      if (circle) circle.setRadius(draft.targetRadiusKm * 1000);
      var lab = document.getElementById("apLocLabel");
      if (lab && draft.targetLat != null) {
        lab.textContent =
          "Zona: " +
          (draft.targetLabel || "") +
          " · raio " +
          draft.targetRadiusKm +
          " km";
      }
    };

    document.getElementById("apUseMyLoc").onclick = function () {
      var geo = window.tchiloGeo;
      if (!geo || !geo.getOnce) {
        alert("Localizacao ainda a carregar. Tenta de novo.");
        return;
      }
      geo.getOnce().then(function (pos) {
        if (!pos) {
          alert("Permite a localizacao nas definicoes do telemovel.");
          return;
        }
        draft.targetScope = "zone";
        document.querySelectorAll("#apScope .ap-chip").forEach(function (x) {
          x.classList.toggle("on", x.getAttribute("data-v") === "zone");
        });
        setTarget(pos.lat, pos.lng, "A minha localizacao", "");
        reverseGeocode(pos.lat, pos.lng);
        if (map) map.setView([pos.lat, pos.lng], 14);
      });
    };

    document.getElementById("apNext3").onclick = function () {
      if (draft.targetScope !== "world" && (draft.targetLat == null || draft.targetLng == null)) {
        alert("Pesquisa um local ou toca no mapa para marcar a zona (ou escolhe Todo o mundo).");
        return;
      }
      draft.step = 4;
      renderCreate();
    };

    setTimeout(initMap, 50);
  }

  function renderStep4() {
    destroyMap();
    var media =
      draft.mediaUrl
        ? draft.mediaType === "video"
          ? "<video src=\"" + esc(draft.mediaUrl) + "\" muted playsinline controls></video>"
          : "<img src=\"" + esc(draft.mediaUrl) + "\" alt=\"\">"
        : "Pre-visualizacao";
    var locLine =
      draft.targetScope === "world"
        ? "Todo o mundo"
        : (draft.targetLabel || "Zona") + " · " + draft.targetRadiusKm + " km";
    bodyEl().innerHTML =
      stepsHtml() +
      "<h2 style=\"margin:0 0 10px;font:800 16px Inter,sans-serif\">Duracao e pagamento</h2>" +
      "<div class=\"ap-card\"><p>Local: <b>" +
      esc(locLine) +
      "</b></p></div>" +
      "<label class=\"ap-lab\">Dias (1-30)</label>" +
      "<input type=\"number\" id=\"apDays\" min=\"1\" max=\"30\" value=\"" +
      draft.days +
      "\"/>" +
      "<div class=\"ap-reach\" id=\"apReach\">" +
      reachText(draft.days) +
      "</div>" +
      "<div class=\"ap-preview\">" +
      "<div class=\"pv-head\"><div class=\"pv-av\">" +
      esc((meName().charAt(0) || "T").toUpperCase()) +
      "</div><div><b>@" +
      esc(meName()) +
      "</b><div style=\"font:800 10px Inter,sans-serif\">Anuncio</div></div></div>" +
      "<div class=\"pv-media\">" +
      media +
      "</div>" +
      "<div class=\"pv-cap\"><b>@" +
      esc(meName()) +
      "</b> " +
      esc(draft.title || draft.body || "O teu anuncio") +
      "</div>" +
      "<div class=\"pv-cta\">" +
      (draft.objective === "message" ? "Enviar mensagem" : "Saber mais") +
      "</div></div>" +
      "<button type=\"button\" class=\"ap-pay\" id=\"apPay\">Pagar e publicar</button>";
    var daysEl = document.getElementById("apDays");
    daysEl.oninput = function () {
      draft.days = Math.max(1, Math.min(30, parseInt(daysEl.value, 10) || 1));
      daysEl.value = String(draft.days);
      document.getElementById("apReach").textContent = reachText(draft.days);
      document.getElementById("apPay").textContent = "Pagar $" + draft.days + " e publicar";
    };
    document.getElementById("apPay").textContent = "Pagar $" + draft.days + " e publicar";
    document.getElementById("apPay").onclick = pay;
  }

  async function pay() {
    var uid = meId();
    if (!uid) {
      alert("Inicia sessao");
      return;
    }
    var days = Math.max(1, Math.min(30, draft.days || 1));
    var SB = window.SB || window.tchiloSupabase;
    var adId = null;
    if (SB) {
      try {
        var row = {
          user_id: uid,
          status: "pending",
          ad_type: draft.objective === "message" ? "message" : "click",
          body: draft.body || draft.title || "",
          media_url: draft.mediaUrl || null,
          media_type: draft.mediaType || null,
          link_url: draft.objective === "click" ? draft.link : null,
          days: days,
          reach_min: days * 800,
          reach_max: days * 1000,
          impressions: 0,
          clicks: 0,
          conversations: 0,
          target_lat: draft.targetScope === "world" ? null : draft.targetLat,
          target_lng: draft.targetScope === "world" ? null : draft.targetLng,
          target_radius_km: draft.targetScope === "world" ? null : draft.targetRadiusKm,
          target_label: draft.targetLabel || null,
          target_country: draft.targetCountry || null
        };
        var ins = await SB.from("ads").insert(row).select("id").single();
        if (ins && ins.data) adId = ins.data.id;
        if (ins && ins.error) console.warn("[ads] insert", ins.error);
      } catch (e) {
        console.warn("[ads] insert", e);
      }
    }
    openPaddle(adId, days);
  }

  function openPaddle(adId, days) {
    function doOpen() {
      try {
        if (!window.__tchiloPaddleInited && window.Paddle) {
          Paddle.Initialize({ token: PADDLE_TOKEN });
          window.__tchiloPaddleInited = true;
        }
        Paddle.Checkout.open({
          items: [{ priceId: PRICE_AD, quantity: days }],
          settings: { displayMode: "overlay", theme: "light", locale: "pt" },
          customData: {
            app: "tchilo",
            kind: "ad",
            ad_id: adId || "",
            user_id: meId() || "",
            days: String(days)
          }
        });
      } catch (e) {
        alert("Nao foi possivel abrir o pagamento");
      }
    }
    if (window.Paddle && window.Paddle.Checkout) {
      doOpen();
      return;
    }
    var s = document.createElement("script");
    s.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
    s.onload = doOpen;
    s.onerror = function () {
      alert("Erro ao carregar Paddle");
    };
    document.head.appendChild(s);
  }

  async function renderManage() {
    destroyMap();
    root().dataset.view = "manage";
    setTitle("Gerir anuncios");
    bodyEl().innerHTML = "<div class=\"ap-card\"><p>A carregar...</p></div>";
    var SB = window.SB || window.tchiloSupabase;
    var uid = meId();
    if (!SB || !uid) {
      bodyEl().innerHTML =
        "<div class=\"ap-card\"><p>Inicia sessao para ver os anuncios.</p></div>" +
        "<button type=\"button\" class=\"ap-pay\" id=\"apBackHub\">Voltar</button>";
      document.getElementById("apBackHub").onclick = renderHub;
      return;
    }
    try {
      var res = await SB.from("ads").select("*").eq("user_id", uid).order("created_at", { ascending: false });
      var rows = (res && res.data) || [];
      if (!rows.length) {
        bodyEl().innerHTML =
          "<div class=\"ap-card\"><h2>Sem anuncios</h2><p>Ainda nao criaste nenhum.</p></div>" +
          "<button type=\"button\" class=\"ap-pay\" id=\"apNew\">Fazer anuncio</button>";
        document.getElementById("apNew").onclick = function () {
          draft.step = 1;
          renderCreate();
        };
        return;
      }
      bodyEl().innerHTML = rows
        .map(function (a) {
          var loc =
            a.target_label ||
            (a.target_lat != null ? a.target_lat + ", " + a.target_lng : "Global");
          return (
            "<div class=\"ap-card\"><h2>" +
            esc(a.body || "Anuncio") +
            "</h2><p>Estado: <b>" +
            esc(a.status || "-") +
            "</b> · " +
            (a.days || 0) +
            " dias · " +
            esc(loc) +
            "</p></div>"
          );
        })
        .join("");
    } catch (e) {
      bodyEl().innerHTML =
        "<div class=\"ap-card\"><p>Erro ao carregar. Corre o SQL de localizacao no Supabase.</p></div>";
    }
  }

  window.tchiloOpenAdsPro = open;
  window.tchiloOpenAdsManager = open;
  window.tchiloOpenAdCreate = function () {
    open();
    setTimeout(function () {
      draft.step = 1;
      renderCreate();
    }, 40);
  };

  function hookBtn() {
    var btn = document.getElementById("tchiloAdsMgrBtn");
    if (btn) {
      btn.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        open();
      };
    }
  }

  setInterval(hookBtn, 1000);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", hookBtn);
  else hookBtn();
})();

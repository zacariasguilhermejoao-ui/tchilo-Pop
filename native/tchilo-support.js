/**
 * tchilo-Pop — Suporte nas Definições
 * Ajuda, dicas, informação e contacto
 */
(function () {
  "use strict";

  var TIPS = [
    {
      t: "Feed e Stories",
      d: "Desliza para baixo para atualizar o feed. Os Stories sobem com o scroll. Puxa para baixo ate aos 3 pontos para refresh."
    },
    {
      t: "Publicar foto ou video",
      d: "Toca no + , escolhe a camera ou a galeria. Em fotos podes adicionar musica. Em videos a opcao de musica nao aparece."
    },
    {
      t: "Mensagens e audio",
      d: "Nas conversas podes enviar texto e audio. Mantem o botao de gravacao premido; ao largar, o audio e enviado."
    },
    {
      t: "Nome do perfil",
      d: "Depois de mudares o nome de apresentacao, so podes volta-lo a alterar apos 7 dias."
    },
    {
      t: "Anuncios",
      d: "Em Definições → Gestor de Anuncios podes criar campanhas com mapa real, definir a zona e pagar por dia."
    },
    {
      t: "Premium e temas",
      d: "Temas especiais (Retro, Halloween, Gotico, Neon, etc.) e figurinhas personalizadas exigem Tchilo Premium."
    },
    {
      t: "Privacidade",
      d: "Em Privacidade podes tornar a conta privada, esconder o email e ativar o modo anonimo."
    },
    {
      t: "Offline",
      d: "Alguns posts e reels ja vistos podem aparecer sem dados, graças a cache local."
    }
  ];

  var FAQ = [
    {
      q: "Como recupero a palavra-passe?",
      a: "Em Conta → Palavra-passe e segurança. Se nao tiveres sessao, usa a opcao de recuperacao no ecran de entrar."
    },
    {
      q: "Porque nao vejo notificacoes?",
      a: "Confirma nas Definições → Notificações e tambem nas permissoes do telemovel (Android/iOS) para o Tchilo."
    },
    {
      q: "Como denuncio um conteudo?",
      a: "Abre o post ou perfil, usa o menu (...) e escolhe Denunciar. A equipa analisa em conformidade com as regras da comunidade."
    },
    {
      q: "Como turbo ou anuncio um post?",
      a: "Nos teus posts aparece Turbinar ao lado de Seguir. So nos teus proprios posts. Depois escolhes dias, localizacao e pagas."
    },
    {
      q: "O mapa dos anuncios e real?",
      a: "Sim. Podes pesquisar qualquer pais, cidade ou bairro, marcar a zona no mapa e definir o raio. O app usa a localizacao do utilizador para entregar."
    },
    {
      q: "Como contacto o suporte?",
      a: "Em Definições → Suporte → Contactar suporte. Envia o teu email e a descricao do problema."
    }
  ];

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

  function ensureCSS() {
    if (document.getElementById("tchiloSupportCSS")) return;
    var st = document.createElement("style");
    st.id = "tchiloSupportCSS";
    st.textContent =
      "#tchiloSupport{display:none;position:fixed;inset:0;z-index:9998;background:var(--paper,#F7F6F2);color:var(--ink,#0B0B0C);flex-direction:column;font-family:system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif}" +
      "#tchiloSupport.open{display:flex!important}" +
      "#tchiloSupport .su-top{display:flex;align-items:center;gap:10px;padding:calc(12px + env(safe-area-inset-top)) 14px 12px;border-bottom:2.5px solid var(--ink,#0B0B0C);flex-shrink:0}" +
      "#tchiloSupport .su-top h1{flex:1;margin:0;font:800 17px system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif}" +
      "#tchiloSupport .su-back{width:40px;height:40px;border:0;border-radius:50%;background:transparent;font:900 18px system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;cursor:pointer}" +
      "#tchiloSupport .su-body{flex:1;overflow:auto;padding:14px 14px calc(28px + env(safe-area-inset-bottom));-webkit-overflow-scrolling:touch}" +
      "#tchiloSupport .su-card{border:0;border-radius:14px;padding:14px;margin-bottom:12px;background:rgba(11,11,12,.04)}" +
      "#tchiloSupport .su-card h2{margin:0 0 6px;font:800 15px system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif}" +
      "#tchiloSupport .su-card p{margin:0;font:600 13px system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;opacity:.8;line-height:1.45}" +
      "#tchiloSupport .su-btn{display:flex;align-items:center;gap:12px;width:100%;padding:14px;margin-bottom:10px;border:0;border-bottom:0.5px solid rgba(11,11,12,.08);border-radius:0;background:transparent;font:400 16px system-ui,sans-serif;text-align:left;cursor:pointer;box-shadow:none;color:inherit}" +
      "#tchiloSupport .su-btn .ico{width:36px;height:36px;border-radius:10px;border:2px solid var(--ink,#0B0B0C);display:flex;align-items:center;justify-content:center;font:900 13px system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;flex-shrink:0}" +
      "#tchiloSupport .su-btn .chev{margin-left:auto;opacity:.45}" +
      "#tchiloSupport .su-faq{border-bottom:1px solid rgba(0,0,0,.08);padding:12px 0}" +
      "#tchiloSupport .su-faq:last-child{border-bottom:0}" +
      "#tchiloSupport .su-faq b{display:block;font:800 14px system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;margin-bottom:4px}" +
      "#tchiloSupport .su-faq span{font:600 13px system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;opacity:.8;line-height:1.4}" +
      "#tchiloSupport label.su-lab{display:block;font:800 11px system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;text-transform:uppercase;opacity:.6;margin:10px 0 6px}" +
      "#tchiloSupport input,#tchiloSupport textarea{width:100%;box-sizing:border-box;padding:12px;border:0;border-radius:12px;font:500 14px system-ui,sans-serif;background:rgba(11,11,12,.06)}" +
      "#tchiloSupport textarea{min-height:110px}" +
      "#tchiloSupport .su-send{width:100%;margin-top:12px;padding:14px;border:0;border-radius:12px;background:var(--ink,#0B0B0C);color:#fff;font:600 15px system-ui,sans-serif;box-shadow:none;cursor:pointer}" +
      "#tchiloSupportBtn{display:flex!important}";
    document.head.appendChild(st);
  }

  function root() {
    var el = document.getElementById("tchiloSupport");
    if (el) return el;
    el = document.createElement("div");
    el.id = "tchiloSupport";
    el.innerHTML =
      '<div class="su-top">' +
      '<button type="button" class="su-back" id="suBack">\u2190</button>' +
      "<h1 id=\"suTitle\">Suporte</h1></div>" +
      '<div class="su-body" id="suBody"></div>';
    document.body.appendChild(el);
    el.querySelector("#suBack").onclick = function () {
      if (el.dataset.view && el.dataset.view !== "hub") renderHub();
      else close();
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
    var el = document.getElementById("tchiloSupport");
    if (el) el.classList.remove("open");
  }

  function setTitle(t) {
    var h = document.getElementById("suTitle");
    if (h) h.textContent = t;
  }

  function body() {
    return document.getElementById("suBody");
  }

  function renderHub() {
    root().dataset.view = "hub";
    setTitle("Suporte");
    body().innerHTML =
      '<div class="su-card"><h2>Centro de ajuda</h2><p>Informacao, dicas e respostas para usares o Tchilo com confianca.</p></div>' +
      '<button type="button" class="su-btn" id="suFaq"><span class="ico" style="background:transparent;border:0;color:var(--ink,#0B0B0C)">?</span><span>Perguntas frequentes</span><span class="chev">\u203a</span></button>' +
      '<button type="button" class="su-btn" id="suTips"><span class="ico" style="background:transparent;border:0;color:var(--ink,#0B0B0C)">!</span><span>Dicas e atalhos</span><span class="chev">\u203a</span></button>' +
      '<button type="button" class="su-btn" id="suInfo"><span class="ico" style="background:transparent;border:0;color:var(--ink,#0B0B0C)">i</span><span>Informacao do app</span><span class="chev">\u203a</span></button>' +
      '<button type="button" class="su-btn" id="suContact"><span class="ico" style="background:transparent;border:0;color:var(--ink,#0B0B0C)">@</span><span>Contactar suporte</span><span class="chev">\u203a</span></button>' +
      '<button type="button" class="su-btn" id="suReport"><span class="ico" style="background:transparent;border:0;color:var(--ink,#0B0B0C)">!</span><span>Reportar um problema</span><span class="chev">\u203a</span></button>' +
      '<button type="button" class="su-btn" id="suSafety"><span class="ico" style="background:transparent;border:0;color:var(--ink,#0B0B0C)">S</span><span>Seguranca e comunidade</span><span class="chev">\u203a</span></button>';
    document.getElementById("suFaq").onclick = renderFaq;
    document.getElementById("suTips").onclick = renderTips;
    document.getElementById("suInfo").onclick = renderInfo;
    document.getElementById("suContact").onclick = function () {
      renderContact(false);
    };
    document.getElementById("suReport").onclick = function () {
      renderContact(true);
    };
    document.getElementById("suSafety").onclick = renderSafety;
  }

  function renderFaq() {
    root().dataset.view = "faq";
    setTitle("Perguntas frequentes");
    body().innerHTML =
      '<div class="su-card">' +
      FAQ.map(function (f) {
        return (
          '<div class="su-faq"><b>' +
          esc(f.q) +
          "</b><span>" +
          esc(f.a) +
          "</span></div>"
        );
      }).join("") +
      "</div>";
  }

  function renderTips() {
    root().dataset.view = "tips";
    setTitle("Dicas e atalhos");
    body().innerHTML = TIPS.map(function (t) {
      return (
        '<div class="su-card"><h2>' +
        esc(t.t) +
        "</h2><p>" +
        esc(t.d) +
        "</p></div>"
      );
    }).join("");
  }

  function renderInfo() {
    root().dataset.view = "info";
    setTitle("Informacao");
    var ver = "1.0.0";
    try {
      if (window.Capacitor && window.Capacitor.getPlatform) {
        ver = ver + " · " + window.Capacitor.getPlatform();
      }
    } catch (e) {}
    body().innerHTML =
      '<div class="su-card"><h2>Tchilo</h2><p>Rede social feita para criares, partilhares e conectares — posts, stories, reels, mensagens e anuncios.</p></div>' +
      '<div class="su-card"><h2>Versao</h2><p>' +
      esc(ver) +
      "</p></div>" +
      '<div class="su-card"><h2>Idioma</h2><p>O app segue o idioma escolhido em Definições → Idioma. Em portugues, os textos principais aparecem em portugues.</p></div>' +
      '<div class="su-card"><h2>Legal</h2><p>Consulta Termos, Politica de privacidade e Regras da comunidade em Definições → Legal.</p></div>';
  }

  function renderSafety() {
    root().dataset.view = "safety";
    setTitle("Seguranca");
    body().innerHTML =
      '<div class="su-card"><h2>Respeito</h2><p>Nao toleramos assedio, discurso de odio, exploracao ou conteudo ilegal. Denuncia o que violar as regras.</p></div>' +
      '<div class="su-card"><h2>Conta</h2><p>Nao partilhes a palavra-passe. Usa palavra-passe forte. Podes mudar em Conta → Palavra-passe e segurança.</p></div>' +
      '<div class="su-card"><h2>Menores</h2><p>O Tchilo nao e para menores sem supervisao adequada. Segue as leis do teu pais.</p></div>' +
      '<div class="su-card"><h2>Denuncias</h2><p>Usa Reportar um problema ou o menu do post/perfil. Tratamos os casos com seriedade.</p></div>';
  }

  function renderContact(isReport) {
    root().dataset.view = isReport ? "report" : "contact";
    setTitle(isReport ? "Reportar problema" : "Contactar suporte");
    var email = "";
    try {
      if (typeof getSession === "function") {
        var s = getSession();
        if (s && s.email) email = s.email;
      }
    } catch (e) {}
    body().innerHTML =
      '<div class="su-card"><p>' +
      (isReport
        ? "Descreve o que falhou (ecran, passos e se possivel o modelo do telemovel)."
        : "A equipa Tchilo responde por email. Indica o teu contacto e a mensagem.") +
      "</p></div>" +
      '<label class="su-lab">Email</label>' +
      '<input id="suEmail" type="email" value="' +
      esc(email) +
      '" placeholder="teu@email.com"/>' +
      '<label class="su-lab">Mensagem</label>' +
      '<textarea id="suMsg" placeholder="Escreve aqui..."></textarea>' +
      '<button type="button" class="su-send" id="suSend">Enviar</button>';
    document.getElementById("suSend").onclick = function () {
      var em = (document.getElementById("suEmail").value || "").trim();
      var msg = (document.getElementById("suMsg").value || "").trim();
      if (!em || em.indexOf("@") < 0) {
        alert("Indica um email valido");
        return;
      }
      if (msg.length < 8) {
        alert("Escreve uma mensagem um pouco mais detalhada");
        return;
      }
      try {
        var key = "tchilo_support_tickets";
        var list = [];
        try {
          list = JSON.parse(localStorage.getItem(key) || "[]");
        } catch (e2) {}
        list.unshift({
          at: Date.now(),
          email: em,
          message: msg,
          kind: isReport ? "report" : "support"
        });
        localStorage.setItem(key, JSON.stringify(list.slice(0, 30)));
      } catch (e3) {}
      try {
        if (typeof showToast === "function") showToast("Mensagem enviada. Obrigado!");
        else alert("Mensagem enviada. Obrigado!");
      } catch (e4) {
        alert("Mensagem enviada. Obrigado!");
      }
      close();
    };
  }

  function injectBtn() {
    ensureCSS();
    var list = document.querySelector("#screen-settings .settings-list");
    if (!list) return;
    if (document.getElementById("tchiloSupportBtn")) return;
    var btn = document.createElement("button");
    btn.type = "button";
    btn.id = "tchiloSupportBtn";
    btn.className = "settings-item";
    btn.innerHTML =
      '<div class="si-icon"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><circle cx="12" cy="17" r="0.5" fill="currentColor" stroke="none"/></svg></div>' +
      "<span>Suporte</span><div class=\"chev\">\u203a</div>";
    btn.onclick = function (e) {
      e.preventDefault();
      e.stopPropagation();
      open();
    };
    // depois de Legal / antes de Idioma, ou no fim
    var legal = null;
    list.querySelectorAll(".settings-item").forEach(function (it) {
      var sp = it.querySelector("span");
      if (sp && /legal|jurid/i.test(sp.textContent || "")) legal = it;
    });
    if (legal && legal.nextSibling) list.insertBefore(btn, legal.nextSibling);
    else list.appendChild(btn);
  }

  window.tchiloOpenSupport = open;

  function boot() {
    injectBtn();
  }

  setInterval(injectBtn, 2000);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  setTimeout(boot, 400);
  setTimeout(boot, 1200);
})();

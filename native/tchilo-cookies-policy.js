/**
 * tchilo-Pop — Política de Cookies
 * Ecrã legal + entrada em Definições → Legal
 */
(function () {
  "use strict";

  function ensureCSS() {
    if (document.getElementById("tchiloCookiesCSS")) return;
    var st = document.createElement("style");
    st.id = "tchiloCookiesCSS";
    st.textContent =
      "#screen-cookies.screen{display:none;flex-direction:column;height:100%;background:var(--paper,#F7F6F2)}" +
      "#screen-cookies.screen.active{display:flex!important}" +
      "#screen-cookies .legal-body{flex:1;overflow:auto;padding:16px 18px calc(40px + env(safe-area-inset-bottom));-webkit-overflow-scrolling:touch}" +
      "#screen-cookies .legal-body h3{font-family:Anton,Inter,sans-serif;font-size:18px;margin:18px 0 8px;color:var(--ink,#0B0B0C)}" +
      "#screen-cookies .legal-body p{margin-bottom:10px;color:#333;font:600 14px/1.45 Inter,system-ui,sans-serif}" +
      "#screen-cookies .legal-body ul{margin:0 0 12px 18px;padding:0;color:#333;font:600 14px/1.45 Inter,system-ui,sans-serif}" +
      "#screen-cookies .legal-body li{margin-bottom:6px}";
    document.head.appendChild(st);
  }

  function ensureScreen() {
    if (document.getElementById("screen-cookies")) return;
    var el = document.createElement("div");
    el.className = "screen";
    el.id = "screen-cookies";
    el.innerHTML =
      '<div class="screen-header">' +
      '<button class="back-btn" type="button" id="cookiesBackBtn">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 18l-6-6 6-6"/></svg>' +
      "</button>" +
      "<h1>Cookies</h1></div>" +
      '<div class="legal-body">' +
      "<h3>Política de Cookies do Tchilo</h3>" +
      "<p>Esta Política de Cookies explica o que são cookies e tecnologias semelhantes, como o Tchilo as utiliza e que opções tens.</p>" +

      "<h3>1. O que são cookies e armazenamento local</h3>" +
      "<p>Cookies são pequenos ficheiros guardados no teu dispositivo. O Tchilo também usa tecnologias semelhantes, como <b>localStorage</b>, <b>sessionStorage</b> e identificadores do dispositivo (em apps nativas Android/iOS), para manter a sessão, preferências e funcionamento do serviço.</p>" +

      "<h3>2. Porque usamos estas tecnologias</h3>" +
      "<p>Utilizamos cookies e armazenamento local para:</p>" +
      "<ul>" +
      "<li><b>Essenciais:</b> manter a sessão iniciada, segurança, autenticação e funcionamento básico da app.</li>" +
      "<li><b>Preferências:</b> idioma, tema, definições de privacidade e escolhas que fazes na app.</li>" +
      "<li><b>Desempenho e cache:</b> carregar o feed, reels e conteúdos mais depressa, inclusive alguns conteúdos já vistos offline.</li>" +
      "<li><b>Funcionalidade:</b> rascunhos, tickets de suporte locais, estado de anúncios e funcionalidades que dependem do teu dispositivo.</li>" +
      "</ul>" +

      "<h3>3. Tipos que o Tchilo pode usar</h3>" +
      "<p><b>3.1. Estritamente necessários</b> — sem estes, a app não funciona corretamente (login, sessão, segurança).</p>" +
      "<p><b>3.2. Preferências</b> — guardam as tuas escolhas (idioma, tema, notificações no dispositivo).</p>" +
      "<p><b>3.3. Desempenho / técnicos</b> — ajudam a medir e melhorar estabilidade, tempos de carga e erros (de forma limitada e orientada ao serviço).</p>" +
      "<p><b>3.4. Parceiros de pagamento</b> — quando usas Tchilo Premium ou anúncios pagos, o processador de pagamentos (por exemplo Paddle) pode usar cookies ou armazenamento próprios no fluxo de checkout, sujeitos à política desse fornecedor.</p>" +

      "<h3>4. Dados típicos associados</h3>" +
      "<ul>" +
      "<li>Identificador de sessão e estado de autenticação</li>" +
      "<li>Preferências de interface (idioma, tema)</li>" +
      "<li>Dados técnicos de funcionamento (versão da app, erros locais)</li>" +
      "<li>Cache de conteúdos para desempenho</li>" +
      "</ul>" +
      "<p>Não usamos cookies de publicidade de terceiros para seguir a tua navegação noutros sites fora do Tchilo com o objetivo de perfilagem de marketing externo, salvo se no futuro isso for introduzido e comunicado de forma clara.</p>" +

      "<h3>5. Duração</h3>" +
      "<p>Alguns dados duram só enquanto a sessão está aberta (sessionStorage). Outros permanecem no dispositivo até os apagares, terminares sessão de forma que limpe o armazenamento, ou até expirarem (por exemplo preferências e cache).</p>" +

      "<h3>6. Como gerir ou apagar</h3>" +
      "<p>Podes:</p>" +
      "<ul>" +
      "<li>Terminar sessão na app</li>" +
      "<li>Limpar dados do site/app nas definições do browser ou do sistema (Android/iOS)</li>" +
      "<li>Desinstalar a aplicação (remove dados locais da app, salvo cópias em servidores se a tua conta estiver na nuvem)</li>" +
      "</ul>" +
      "<p>Nota: se desativares armazenamento essencial, funcionalidades como login e feed podem deixar de funcionar.</p>" +

      "<h3>7. Base legal e privacidade</h3>" +
      "<p>O uso de tecnologias estritamente necessárias baseia-se no interesse legítimo de prestar o serviço e, quando aplicável, na execução do contrato contigo. Preferências e funcionalidades não essenciais podem depender do teu consentimento ou das opções que escolhes na app. Para mais detalhes sobre dados pessoais, consulta a <b>Política de privacidade</b>.</p>" +

      "<h3>8. Atualizações</h3>" +
      "<p>Podemos atualizar esta Política de Cookies. A data de atualização aparece em baixo. O uso continuado após alterações relevantes pode implicar a aceitação da nova versão, conforme a lei aplicável.</p>" +

      "<h3>9. Contacto</h3>" +
      "<p>Para questões sobre cookies e privacidade: usa <b>Definições → Suporte → Contactar suporte</b> ou o email indicado nos documentos legais da app.</p>" +
      '<p style="margin-top:20px;color:var(--muted);font-size:12px">Última atualização: setembro 2026</p>' +
      "</div>";
    document.body.appendChild(el);
    el.querySelector("#cookiesBackBtn").onclick = function () {
      if (typeof legalBack === "function") legalBack();
      else if (typeof goTo === "function") goTo("settings-legal");
    };
  }

  function openCookies() {
    ensureCSS();
    ensureScreen();
    if (typeof goTo === "function") {
      try {
        goTo("cookies");
        return;
      } catch (e) {}
    }
    // fallback manual
    document.querySelectorAll(".screen.active").forEach(function (s) {
      s.classList.remove("active");
    });
    var el = document.getElementById("screen-cookies");
    if (el) el.classList.add("active");
  }

  function patchGoTo() {
    if (typeof window.goTo !== "function" || window.goTo.__cookies) return;
    var orig = window.goTo;
    window.goTo = function (name) {
      if (name === "cookies") {
        ensureCSS();
        ensureScreen();
        var r = orig.apply(this, arguments);
        var el = document.getElementById("screen-cookies");
        if (el) {
          document.querySelectorAll(".screen.active").forEach(function (s) {
            if (s.id !== "screen-cookies") s.classList.remove("active");
          });
          el.classList.add("active");
        }
        return r;
      }
      return orig.apply(this, arguments);
    };
    window.goTo.__cookies = true;
  }

  function injectLegalBtn() {
    ensureCSS();
    var list = document.querySelector("#screen-settings-legal .settings-list");
    if (!list) return;
    if (document.getElementById("tchiloCookiesLegalBtn")) return;
    var btn = document.createElement("button");
    btn.type = "button";
    btn.id = "tchiloCookiesLegalBtn";
    btn.className = "settings-item";
    btn.innerHTML =
      '<div class="si-icon" style="background:#fff">' +
      '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      '<circle cx="12" cy="12" r="9"/>' +
      '<path d="M8 12h.01M12 12h.01M16 12h.01"/>' +
      "</svg></div>" +
      "<span>Política de cookies</span><div class=\"chev\">\u203a</div>";
    btn.onclick = function (e) {
      e.preventDefault();
      e.stopPropagation();
      openCookies();
    };
    // depois da privacidade, se existir
    var after = null;
    list.querySelectorAll(".settings-item").forEach(function (it) {
      var sp = it.querySelector("span");
      if (sp && /privacidade|privacy/i.test(sp.textContent || "")) after = it;
    });
    if (after && after.nextSibling) list.insertBefore(btn, after.nextSibling);
    else list.appendChild(btn);
  }

  window.tchiloOpenCookiesPolicy = openCookies;

  function boot() {
    ensureCSS();
    ensureScreen();
    patchGoTo();
    injectLegalBtn();
  }

  setInterval(function () {
    patchGoTo();
    injectLegalBtn();
  }, 2000);

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  setTimeout(boot, 400);
  setTimeout(boot, 1200);
})();

/**
 * Tchilo — copy de produto real (remove texto de protótipo/demo na UI)
 * v1
 */
(function () {
  'use strict';
  if (window.__tchiloProductCopyV1) return;
  window.__tchiloProductCopyV1 = true;

  function setMeta() {
    try {
      document.title = 'Tchilo — Rede social';
      function ensure(attr, key, val) {
        var sel = 'meta[' + attr + '="' + key + '"]';
        var el = document.querySelector(sel);
        if (!el) {
          el = document.createElement('meta');
          el.setAttribute(attr, key);
          document.head.appendChild(el);
        }
        el.setAttribute('content', val);
      }
      ensure('name', 'description', 'Tchilo é a rede social para fotos, vídeos, stories, reels e mensagens. Contas e conteúdos na nuvem.');
      ensure('property', 'og:title', 'Tchilo — Rede social');
      ensure('property', 'og:description', 'Partilha fotos, vídeos, stories e mensagens no Tchilo.');
      ensure('property', 'og:site_name', 'Tchilo');
      ensure('property', 'og:url', 'https://tchilopop.com/');
      ensure('name', 'twitter:title', 'Tchilo');
      ensure('name', 'twitter:description', 'Rede social para fotos, vídeos, stories, reels e mensagens.');
    } catch (e) {}
  }

  function fixLegalBodies() {
    try {
      document.querySelectorAll('.legal-body, #screen-about .legal-body, [id*="about"] .legal-body').forEach(function (el) {
        var h = el.innerHTML || '';
        if (h.indexOf('Protótipo') >= 0 || h.indexOf('protótipo') >= 0 || h.indexOf('demonstração') >= 0) {
          el.innerHTML =
            '<h3>Tchilo</h3>' +
            '<p>Rede social para partilhar fotos, vídeos, stories, reels e mensagens.</p>' +
            '<p>As contas e o conteúdo são guardados na nuvem, para poderes usar a mesma conta noutro dispositivo.</p>' +
            '<h3>Funcionalidades</h3>' +
            '<p>Feed, stories, reels, mensagens, perfil, privacidade e Tchilo Premium.</p>' +
            '<h3>Contacto</h3>' +
            '<p>suporte@tchilopop.com · parcerias@tchilopop.com · privacidade@tchilopop.com</p>';
        }
      });
    } catch (e) {}

    try {
      document.querySelectorAll('p, .legal-body p, #screen-privacy p').forEach(function (p) {
        var t = p.textContent || '';
        if (/versão de demonstração|localStorage|Protótipo web/i.test(t)) {
          if (/localStorage|demonstração/i.test(t)) {
            p.textContent =
              'Recolhemos dados de conta (como nome de utilizador e email) e o conteúdo que publicas (posts, comentários, mensagens). Os dados de conta e conteúdo são guardados nos nossos serviços na nuvem para sincronizar entre dispositivos.';
          } else if (/Protótipo/i.test(t)) {
            p.textContent =
              'Tchilo é a rede social com feed, stories, reels, mensagens, explorar e definições de conta.';
          }
        }
      });
    } catch (e2) {}
  }

  function boot() {
    setMeta();
    fixLegalBodies();
  }

  boot();
  setTimeout(boot, 500);
  setTimeout(boot, 2000);

  if (typeof window.goTo === 'function' && !window.goTo.__productCopy) {
    var g = window.goTo;
    window.goTo = function (name) {
      var r = g.apply(this, arguments);
      setTimeout(fixLegalBodies, 50);
      return r;
    };
    window.goTo.__productCopy = true;
  }
})();

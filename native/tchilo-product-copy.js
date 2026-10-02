/**
 * Tchilo — copy de produto real (remove protótipo/demo/localStorage na UI)
 * v2
 */
(function () {
  'use strict';
  if (window.__tchiloProductCopyV2) return;
  window.__tchiloProductCopyV2 = true;
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
    } catch (e) {}
  }

  function replaceBadText(root) {
    if (!root) return;
    try {
      var walk = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
      var nodes = [];
      while (walk.nextNode()) nodes.push(walk.currentNode);
      nodes.forEach(function (n) {
        var t = n.nodeValue;
        if (!t) return;
        if (!/protótipo|prototipo|demonstração|demonstracao|localStorage/i.test(t)) return;
        var next = t
          .replace(/Protótipo web com feed, stories, reels, mensagens, explorar e definições completas\.?/gi,
            'Tchilo é a rede social com feed, stories, reels, mensagens, explorar e definições de conta.')
          .replace(/Nesta versão de demonstração, os dados ficam guardados localmente no teu dispositivo \(localStorage\)\.?/gi,
            'Os dados de conta e o conteúdo são guardados nos nossos serviços na nuvem, para sincronizar entre dispositivos.')
          .replace(/versão de demonstração/gi, 'serviço')
          .replace(/\(localStorage\)/gi, '')
          .replace(/localStorage/gi, 'armazenamento do dispositivo')
          .replace(/protótipo/gi, 'produto')
          .replace(/Protótipo/g, 'Tchilo');
        if (next !== t) n.nodeValue = next;
      });
    } catch (e) {}
  }

  function fixLegalBodies() {
    try {
      document.querySelectorAll('.legal-body').forEach(function (el) {
        var h = el.innerHTML || '';
        if (/Protótipo|protótipo|demonstração|localStorage/i.test(h)) {
          if (/App social|Sobre/i.test(h) || el.closest('#screen-about')) {
            el.innerHTML =
              '<h3>Tchilo</h3>' +
              '<p>Rede social para partilhar fotos, vídeos, stories, reels e mensagens.</p>' +
              '<p>As contas e o conteúdo são guardados na nuvem, para poderes usar a mesma conta noutro dispositivo.</p>' +
              '<h3>Contacto</h3>' +
              '<p>suporte@tchilopop.com · privacidade@tchilopop.com</p>';
          } else {
            replaceBadText(el);
          }
        }
      });
    } catch (e) {}
    replaceBadText(document.body);
  }

  function boot() {
    setMeta();
    fixLegalBodies();
  }

  boot();
  setTimeout(boot, 400);
  setTimeout(boot, 1500);

  if (typeof window.goTo === 'function' && !window.goTo.__productCopyV2) {
    var g = window.goTo;
    window.goTo = function (name) {
      var r = g.apply(this, arguments);
      setTimeout(fixLegalBodies, 40);
      return r;
    };
    window.goTo.__productCopyV2 = true;
  }
})();

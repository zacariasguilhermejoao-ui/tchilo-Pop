/**
 * Tchilo — lista Legal completa com páginas oficiais
 * Termos, Privacidade, Reembolso, Cookies, FAQ, Contacto
 * v1
 */
(function () {
  'use strict';
  if (window.__tchiloLegalLinksV1) return;
  window.__tchiloLegalLinksV1 = true;

  var ORIGIN = 'https://tchilopop.com';

  function origin() {
    try {
      if (location.origin && location.origin.indexOf('http') === 0) return location.origin;
    } catch (e) {}
    return ORIGIN;
  }

  var PAGES = [
    { id: 'terms', label: 'Termos de uso', path: '/termos/' },
    { id: 'privacy', label: 'Política de privacidade', path: '/privacidade/' },
    { id: 'refund', label: 'Política de reembolso', path: '/reembolso/' },
    { id: 'cookies', label: 'Política de cookies', path: '/cookies/' },
    { id: 'community', label: 'Diretrizes da comunidade', path: '/comunidade/' },
    { id: 'child', label: 'Segurança de menores', path: '/menores/' },
    { id: 'about', label: 'Sobre o Tchilo', path: '/sobre/' },
    { id: 'faq', label: 'FAQ', path: '/faq/' },
    { id: 'contact', label: 'Contacto', path: '/contacto/' }
  ];

  function openLegalPage(path) {
    var url = origin() + path;
    try {
      /* app nativa Capacitor: abrir no browser do sistema se disponível */
      if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Browser) {
        window.Capacitor.Plugins.Browser.open({ url: url });
        return;
      }
    } catch (e) {}
    try {
      location.href = url;
    } catch (e2) {
      window.open(url, '_blank');
    }
  }

  window.tchiloOpenLegal = openLegalPage;

  function iconSvg() {
    return (
      '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M7 3h8l4 4v14H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"/>' +
      '<path d="M15 3v5h4M8 12h8M8 16h6"/></svg>'
    );
  }

  function ensureLegalList() {
    var screen = document.getElementById('screen-settings-legal');
    if (!screen) return;
    var list = screen.querySelector('.settings-list');
    if (!list) return;

    /* reconstruir lista oficial */
    if (list.getAttribute('data-tchilo-legal') === '1') return;
    list.setAttribute('data-tchilo-legal', '1');
    list.innerHTML = '';

    PAGES.forEach(function (p) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'settings-item';
      btn.setAttribute('data-legal', p.id);
      btn.innerHTML =
        '<div class="si-icon" style="background:#fff">' +
        iconSvg() +
        '</div><span>' +
        p.label +
        '</span><div class="chev">›</div>';
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        openLegalPage(p.path);
      });
      list.appendChild(btn);
    });
  }

  /* Patch goTo para páginas legais → URL real */
  function patchGoTo() {
    if (typeof window.goTo !== 'function') return;
    if (window.goTo.__legalLinks) return;
    var orig = window.goTo;
    var map = {
      terms: '/termos/',
      privacy: '/privacidade/',
      child: '/menores/',
      community: '/comunidade/',
      about: '/sobre/',
      cookies: '/cookies/',
      refund: '/reembolso/',
      reembolso: '/reembolso/',
      faq: '/faq/',
      contact: '/contacto/',
      contacto: '/contacto/'
    };
    window.goTo = function (name) {
      var n = String(name || '');
      if (map[n]) {
        openLegalPage(map[n]);
        return;
      }
      var r = orig.apply(this, arguments);
      if (n === 'settings-legal' || n === 'settings') {
        setTimeout(ensureLegalList, 30);
        setTimeout(ensureLegalList, 150);
      }
      return r;
    };
    window.goTo.__legalLinks = true;
  }

  function patchOpenLegalFromLogin() {
    if (typeof window.openLegalFromLogin !== 'function') return;
    if (window.openLegalFromLogin.__legalLinks) return;
    window.openLegalFromLogin = function (name) {
      var map = {
        terms: '/termos/',
        privacy: '/privacidade/',
        child: '/menores/',
        community: '/comunidade/',
        about: '/sobre/',
        cookies: '/cookies/',
        refund: '/reembolso/'
      };
      if (map[name]) {
        openLegalPage(map[name]);
        return;
      }
      openLegalPage('/termos/');
    };
    window.openLegalFromLogin.__legalLinks = true;
  }

  function boot() {
    patchGoTo();
    patchOpenLegalFromLogin();
    ensureLegalList();
  }

  boot();
  setTimeout(boot, 400);
  setTimeout(boot, 1200);

  try {
    var legal = document.getElementById('screen-settings-legal');
    if (legal && !legal.__legalObs) {
      legal.__legalObs = true;
      new MutationObserver(function () {
        if (legal.classList.contains('active') || legal.style.display !== 'none') {
          ensureLegalList();
        }
      }).observe(legal, { attributes: true, attributeFilter: ['class', 'style'] });
    }
  } catch (e) {}
})();

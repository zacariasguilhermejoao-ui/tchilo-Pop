/**
 * Tchilo — traços finos (1px) + ícones pretos
 * Remove bordas/círculos pretos grossos e troca azul por preto.
 */
(function () {
  if (document.getElementById('tchilo-thin-borders')) return;
  var s = document.createElement('style');
  s.id = 'tchilo-thin-borders';
  s.textContent = [
    '/* === Bordas e traços: 1px === */',
    '.icon-btn, button.icon-btn, .topbar .icon-btn {',
    '  border-width: 1px !important;',
    '  border-style: solid !important;',
    '  border-color: var(--ink, #0B0B0C) !important;',
    '}',
    '.saved-remove, button.saved-remove {',
    '  border: 1px solid var(--ink, #0B0B0C) !important;',
    '  color: var(--ink, #0B0B0C) !important;',
    '  background: var(--paper, #fff) !important;',
    '  box-shadow: none !important;',
    '}',
    '.saved-tab {',
    '  border-width: 0 !important;',
    '}',
    '.saved-tabs { border-bottom-width: 1px !important; }',
    '.follow-btn, button.follow-btn {',
    '  border-width: 1px !important;',
    '}',
    '.msg-item, .saved-card {',
    '  border-bottom-width: 1px !important;',
    '  border-bottom-style: solid !important;',
    '  border-bottom-color: #e8e8e8 !important;',
    '}',
    '/* botões circulares / pills com traço grosso */',
    'button, .btn, .chip, .pill, .tab, .segment {',
    '  /* não forçar tudo — só onde há ink grosso */',
    '}',
    '[style*="border:2px solid"], [style*="border: 2px solid"],',
    '[style*="border:2.5px solid"], [style*="border: 2.5px solid"],',
    '[style*="border:3px solid"], [style*="border: 3px solid"] {',
    '  /* inline styles difíceis; cobrimos classes abaixo */',
    '}',
    /* classes comuns com border ink 2/3px */',
    '.avatar, .user-avatar, .story-ring, .story-avatar {',
    '  /* anéis de story: manter legível mas mais fino */',
    '}',
    '.story-ring, .story-item .ring, .stories .ring {',
    '  border-width: 1.5px !important;',
    '}',
    /* inputs e cards */',
    'input, select, textarea, .login-input, .search-input, .compose-input {',
    '  border-width: 1px !important;',
    '}',
    '.card, .sheet, .modal, .playlist-card, .notif-item {',
    '  border-width: 1px !important;',
    '}',
    /* nav / topbar */',
    '.topbar, .bottom-nav, .tabbar {',
    '  border-top-width: 1px !important;',
    '  border-bottom-width: 1px !important;',
    '}',
    /* === Ícones: preto em vez de azul === */',
    '.icon-btn svg, .icon-btn svg * {',
    '  stroke: var(--ink, #0B0B0C) !important;',
    '  fill: none !important;',
    '}',
    '.icon-btn svg [fill]:not([fill="none"]), .icon-btn svg solid {',
    '  fill: var(--ink, #0B0B0C) !important;',
    '}',
    '.saved-remove, .saved-remove * {',
    '  color: var(--ink, #0B0B0C) !important;',
    '  -webkit-text-fill-color: var(--ink, #0B0B0C) !important;',
    '}',
    /* links/botões de ação azuis iOS → preto */',
    'button.saved-remove,',
    '.post-actions .act,',
    '.post-actions .act svg,',
    '.post-actions .act svg * {',
    '  color: var(--ink, #0B0B0C) !important;',
    '  stroke: var(--ink, #0B0B0C) !important;',
    '}',
    /* SVGs de UI com stroke grosso */',
    '.icon-btn svg, .topbar svg, .bottom-nav svg, .tabbar svg,',
    '.nav-icon svg, .header svg, .sheet-head svg, .back-btn svg {',
    '  stroke-width: 1.5 !important;',
    '}',
    '.icon-btn svg *, .topbar svg *, .bottom-nav svg *, .tabbar svg * {',
    '  stroke-width: 1.5 !important;',
    '}',
    /* azul explícito → preto (ícones e texto de ação) */',
    '.saved-remove, a.action-link, button.linkish,',
    '[style*="color:#007AFF"], [style*="color: #007AFF"],',
    '[style*="color:#0A84FF"], [style*="color: #0A84FF"],',
    '[style*="color:rgb(0, 122, 255)"] {',
    '  color: var(--ink, #0B0B0C) !important;',
    '}',
    /* follow e similares com borda grossa */',
    '.follow-btn {',
    '  border: 1px solid var(--ink, #0B0B0C) !important;',
    '  box-shadow: none !important;',
    '}',
    /* lista amigos / sugestões */',
    '.msg-item { border-bottom: 1px solid #e8e8e8 !important; }',
    /* tabs genéricas com 2.5px */',
    '.saved-tab, .feed-tab, .profile-tab, .segmented button {',
    '  border-width: 1px !important;',
    '}',
    /* círculos de fechar / plus */',
    'button.close, .close-btn, .icon-close, .btn-circle {',
    '  border-width: 1px !important;',
    '  border-color: var(--ink, #0B0B0C) !important;',
    '  color: var(--ink, #0B0B0C) !important;',
    '}',
    /* bottom nav icons black */',
    '.bottom-nav svg, .bottom-nav svg *, .tabbar svg, .tabbar svg * {',
    '  stroke: var(--ink, #0B0B0C) !important;',
    '  color: var(--ink, #0B0B0C) !important;',
    '}',
    '.bottom-nav .active svg, .bottom-nav .active svg * {',
    '  stroke: var(--ink, #0B0B0C) !important;',
    '}',
  ].join('\n');
  (document.head || document.documentElement).appendChild(s);

  /* Afinar stroke-width em SVGs inline já no DOM */
  function thinSvgs(root) {
    try {
      (root || document).querySelectorAll('svg [stroke-width], svg[stroke-width]').forEach(function (el) {
        var sw = el.getAttribute('stroke-width');
        if (!sw) return;
        var n = parseFloat(sw);
        if (n >= 2 && n <= 4) el.setAttribute('stroke-width', '1.5');
      });
      /* ícones com fill/stroke azul */
      (root || document).querySelectorAll('svg [stroke], svg [fill]').forEach(function (el) {
        var st = (el.getAttribute('stroke') || '').toLowerCase();
        var fl = (el.getAttribute('fill') || '').toLowerCase();
        if (/#007aff|#0a84ff|rgb\(0,\s*122,\s*255\)|blue/.test(st)) {
          el.setAttribute('stroke', '#0B0B0C');
        }
        if (/#007aff|#0a84ff|rgb\(0,\s*122,\s*255\)|blue/.test(fl) && fl !== 'none') {
          el.setAttribute('fill', '#0B0B0C');
        }
      });
    } catch (e) {}
  }

  thinSvgs(document);
  var obs = new MutationObserver(function (muts) {
    muts.forEach(function (m) {
      m.addedNodes && m.addedNodes.forEach(function (n) {
        if (n.nodeType === 1) thinSvgs(n);
      });
    });
  });
  if (document.body) obs.observe(document.body, { childList: true, subtree: true });
  else document.addEventListener('DOMContentLoaded', function () {
    thinSvgs(document);
    obs.observe(document.body, { childList: true, subtree: true });
  });
})();

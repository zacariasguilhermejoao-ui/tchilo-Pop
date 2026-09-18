/**
 * tchilo-Pop — círculos de efeitos com ÍCONES neon (estilo filtro)
 * Gato = orelhas + bigodes + nariz coração com glow rosa
 */
(function () {
  'use strict';

  /* Gato neon — igual à referência: orelhas, bigodes, coração */
  var CAT_NEON =
    '<svg viewBox="0 0 64 64" width="44" height="44">' +
    '<defs>' +
    '<filter id="neonP" x="-50%" y="-50%" width="200%" height="200%">' +
    '<feGaussianBlur stdDeviation="2.2" result="b"/>' +
    '<feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>' +
    '</filter>' +
    '</defs>' +
    '<g filter="url(#neonP)" fill="none" stroke="#ff4de8" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">' +
    /* orelha esq */
    '<path d="M14 28c2-14 8-20 14-16" stroke="#fff" stroke-width="3.5"/>' +
    '<path d="M18 26c2-8 5-12 8-9" stroke="#fff" stroke-width="2.2"/>' +
    /* orelha dir */
    '<path d="M50 28c-2-14-8-20-14-16" stroke="#fff" stroke-width="3.5"/>' +
    '<path d="M46 26c-2-8-5-12-8-9" stroke="#fff" stroke-width="2.2"/>' +
    /* bigodes esq */
    '<path d="M28 40 L12 36" stroke="#fff" stroke-width="2.5"/>' +
    '<path d="M28 44 L10 44" stroke="#fff" stroke-width="2.5"/>' +
    '<path d="M28 48 L12 52" stroke="#fff" stroke-width="2.5"/>' +
    /* bigodes dir */
    '<path d="M36 40 L52 36" stroke="#fff" stroke-width="2.5"/>' +
    '<path d="M36 44 L54 44" stroke="#fff" stroke-width="2.5"/>' +
    '<path d="M36 48 L52 52" stroke="#fff" stroke-width="2.5"/>' +
    '</g>' +
    /* nariz coração */
    '<path filter="url(#neonP)" d="M32 46c-3-2.5-5-4.5-5-7 0-2 1.5-3.5 3.5-3.5 1.2 0 2.2.6 3.5 2.2 1.3-1.6 2.3-2.2 3.5-2.2 2 0 3.5 1.5 3.5 3.5 0 2.5-2 4.5-5 7l-2 1.5z" fill="#fff" stroke="#ff4de8" stroke-width="1"/>' +
    '</svg>';

  var DOG_NEON =
    '<svg viewBox="0 0 64 64" width="44" height="44">' +
    '<defs><filter id="neonD" x="-40%" y="-40%" width="180%" height="180%">' +
    '<feGaussianBlur stdDeviation="1.8" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>' +
    '<g filter="url(#neonD)">' +
    '<path d="M10 30c1-12 8-18 14-12 2 8-1 18-4 22" fill="none" stroke="#c4a484" stroke-width="4" stroke-linecap="round"/>' +
    '<path d="M54 30c-1-12-8-18-14-12-2 8 1 18 4 22" fill="none" stroke="#c4a484" stroke-width="4" stroke-linecap="round"/>' +
    '<ellipse cx="32" cy="40" rx="7" ry="5.5" fill="#1a1a1a" stroke="#fff" stroke-width="1.5"/>' +
    '<ellipse cx="30" cy="38" rx="1.8" ry="1.2" fill="rgba(255,255,255,.5)"/>' +
    '</g></svg>';

  var ICONS = {
    none:
      '<svg viewBox="0 0 64 64" width="36" height="36"><circle cx="32" cy="32" r="14" fill="none" stroke="#fff" stroke-width="3"/><path d="M22 22l20 20M42 22L22 42" stroke="#fff" stroke-width="3" stroke-linecap="round"/></svg>',
    normal:
      '<svg viewBox="0 0 64 64" width="36" height="36"><circle cx="32" cy="28" r="12" fill="#f5d0b0"/><circle cx="27" cy="26" r="2" fill="#333"/><circle cx="37" cy="26" r="2" fill="#333"/><path d="M26 34c2 3 10 3 12 0" stroke="#333" stroke-width="2" fill="none" stroke-linecap="round"/></svg>',
    glasses:
      '<svg viewBox="0 0 64 64" width="40" height="40"><circle cx="20" cy="32" r="11" fill="rgba(100,160,255,.35)" stroke="#fff" stroke-width="3"/><circle cx="44" cy="32" r="11" fill="rgba(100,160,255,.35)" stroke="#fff" stroke-width="3"/><path d="M31 32h2" stroke="#fff" stroke-width="3"/></svg>',
    sunglasses:
      '<svg viewBox="0 0 64 64" width="40" height="40"><ellipse cx="20" cy="32" rx="12" ry="10" fill="#111" stroke="#fff" stroke-width="2"/><ellipse cx="44" cy="32" rx="12" ry="10" fill="#111" stroke="#fff" stroke-width="2"/><path d="M32 32h0" stroke="#fff" stroke-width="3"/></svg>',
    hat:
      '<svg viewBox="0 0 64 64" width="40" height="40"><ellipse cx="32" cy="42" rx="24" ry="6" fill="#1a1a1a"/><path d="M18 40c0-16 8-26 14-26s14 10 14 26" fill="#2d2d2d"/><rect x="16" y="36" width="32" height="5" rx="1" fill="#c8f560"/></svg>',
    crown:
      '<svg viewBox="0 0 64 64" width="40" height="40"><path d="M10 44L14 20l10 12 8-18 8 18 10-12 4 24z" fill="#f5c542"/><circle cx="32" cy="22" r="3.5" fill="#ff4d6d"/><circle cx="18" cy="28" r="2.5" fill="#5b8cff"/><circle cx="46" cy="28" r="2.5" fill="#ff4d6d"/></svg>',
    ears: CAT_NEON,
    cat: CAT_NEON,
    dog: DOG_NEON,
    mustache:
      '<svg viewBox="0 0 64 64" width="40" height="40"><path d="M32 34c-6 2-14 0-18 6 6-2 12 0 18-2 6 2 12 0 18 2-4-6-12-4-18-6z" fill="#2a1a12"/></svg>',
    hearts:
      '<svg viewBox="0 0 64 64" width="36" height="36"><path d="M32 48C20 38 10 30 10 20c0-6 5-10 10-10 4 0 7 2 12 8 5-6 8-8 12-8 5 0 10 4 10 10 0 10-10 18-22 28z" fill="#ff4d6d"/></svg>',
    freckles:
      '<svg viewBox="0 0 64 64" width="36" height="36"><circle cx="32" cy="32" r="16" fill="#f5d0b0"/><circle cx="24" cy="34" r="2" fill="#8B5A2B"/><circle cx="38" cy="34" r="2" fill="#8B5A2B"/><circle cx="30" cy="38" r="1.5" fill="#8B5A2B"/></svg>',
    blush:
      '<svg viewBox="0 0 64 64" width="36" height="36"><circle cx="32" cy="32" r="16" fill="#f5d0b0"/><ellipse cx="20" cy="36" rx="7" ry="5" fill="rgba(255,120,140,.55)"/><ellipse cx="44" cy="36" rx="7" ry="5" fill="rgba(255,120,140,.55)"/></svg>',
    flower:
      '<svg viewBox="0 0 64 64" width="36" height="36"><g transform="translate(32 32)">' +
      '<ellipse cx="0" cy="-12" rx="7" ry="10" fill="#ff6b8a"/><ellipse cx="0" cy="-12" rx="7" ry="10" fill="#ffd166" transform="rotate(60)"/>' +
      '<ellipse cx="0" cy="-12" rx="7" ry="10" fill="#9b5de5" transform="rotate(120)"/><circle r="7" fill="#ffe66d"/></g></svg>',
    tears:
      '<svg viewBox="0 0 64 64" width="36" height="36"><path d="M28 20c0 10 4 20 4 20s4-10 4-20" fill="rgba(120,200,255,.85)"/></svg>',
    pinklips:
      '<svg viewBox="0 0 64 64" width="36" height="36"><path d="M18 32c4-8 24-8 28 0-4 10-24 10-28 0z" fill="#ff508c"/></svg>',
    redlips:
      '<svg viewBox="0 0 64 64" width="36" height="36"><path d="M18 32c4-8 24-8 28 0-4 10-24 10-28 0z" fill="#c81432"/></svg>',
    gloss:
      '<svg viewBox="0 0 64 64" width="36" height="36"><path d="M18 32c4-8 24-8 28 0-4 10-24 10-28 0z" fill="rgba(255,120,160,.7)"/></svg>',
    heartface:
      '<svg viewBox="0 0 64 64" width="36" height="36"><path d="M32 48C20 38 10 30 10 20c0-6 5-10 10-10 4 0 7 2 12 8 5-6 8-8 12-8 5 0 10 4 10 10 0 10-10 18-22 28z" fill="#ff3d7a"/></svg>',
    blushpro:
      '<svg viewBox="0 0 64 64" width="36" height="36"><ellipse cx="18" cy="36" rx="8" ry="6" fill="rgba(255,107,157,.6)"/><ellipse cx="46" cy="36" rx="8" ry="6" fill="rgba(255,107,157,.6)"/></svg>',
    hairtint:
      '<svg viewBox="0 0 64 64" width="36" height="36"><ellipse cx="32" cy="24" rx="18" ry="14" fill="rgba(180,60,255,.55)"/></svg>',
    hatpro:
      '<svg viewBox="0 0 64 64" width="40" height="40"><ellipse cx="32" cy="44" rx="26" ry="7" fill="#111"/><ellipse cx="32" cy="28" rx="14" ry="16" fill="#222"/><rect x="16" y="36" width="32" height="5" fill="#c8f560"/></svg>',
    beanie:
      '<svg viewBox="0 0 64 64" width="40" height="40"><path d="M14 40c0-18 8-28 18-28s18 10 18 28" fill="#6B3DFF"/><rect x="12" y="36" width="40" height="8" rx="2" fill="#5a32d9"/><circle cx="32" cy="12" r="5" fill="#fff"/></svg>',
    sparkle:
      '<svg viewBox="0 0 64 64" width="36" height="36"><path d="M32 8l3 16 16 3-16 3-3 16-3-16-16-3 16-3z" fill="#fff"/></svg>',
    base:
      '<svg viewBox="0 0 64 64" width="36" height="36"><circle cx="32" cy="28" r="12" fill="#f5d0b0"/><circle cx="27" cy="26" r="2" fill="#333"/><circle cx="37" cy="26" r="2" fill="#333"/></svg>'
  };

  function resolveIcon(label) {
    var t = String(label || '')
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
    if (!t || t === 'nenhum' || t === 'none') return ICONS.none;
    if (t === 'normal' || t === 'original' || t === 'base') return ICONS.normal || ICONS.base;
    if (t.indexOf('cao') >= 0 || t === 'dog') return ICONS.dog;
    if (t.indexOf('gato') >= 0 || t === 'cat') return ICONS.cat;
    if (t.indexOf('escuro') >= 0 || t.indexOf('sunglass') >= 0) return ICONS.sunglasses;
    if (t.indexOf('oculos') >= 0 || t.indexOf('glass') >= 0) return ICONS.glasses;
    if (t.indexOf('chapeu') >= 0 || t === 'hat') return ICONS.hat;
    if (t.indexOf('coroa') >= 0 || t === 'crown') return ICONS.crown;
    if (t.indexOf('orelha') >= 0 || t === 'ears') return ICONS.ears;
    if (t.indexOf('bigode') >= 0 || t.indexOf('mustache') >= 0) return ICONS.mustache;
    if (t.indexOf('corac') >= 0 || t.indexOf('heart') >= 0) return ICONS.hearts;
    if (t.indexOf('sarda') >= 0 || t.indexOf('freckle') >= 0) return ICONS.freckles;
    if (t.indexOf('blush') >= 0) return ICONS.blush;
    if (t.indexOf('flor') >= 0 || t.indexOf('flower') >= 0) return ICONS.flower;
    if (t.indexOf('lagrima') >= 0 || t.indexOf('tear') >= 0) return ICONS.tears;
    if (t.indexOf('labios rosa') >= 0 || t.indexOf('pink') >= 0) return ICONS.pinklips;
    if (t.indexOf('labios red') >= 0 || t.indexOf('red') >= 0) return ICONS.redlips;
    if (t.indexOf('gloss') >= 0) return ICONS.gloss;
    if (t.indexOf('coracao face') >= 0 || t.indexOf('heartface') >= 0) return ICONS.heartface;
    if (t.indexOf('blush pro') >= 0) return ICONS.blushpro;
    if (t.indexOf('cabelo') >= 0 || t.indexOf('hair') >= 0) return ICONS.hairtint;
    if (t.indexOf('chapeu pro') >= 0 || t.indexOf('hatpro') >= 0) return ICONS.hatpro;
    if (t.indexOf('gorro') >= 0 || t.indexOf('beanie') >= 0) return ICONS.beanie;
    if (t.indexOf('brilho') >= 0 || t.indexOf('sparkle') >= 0) return ICONS.sparkle;
    return null;
  }

  function injectCSS() {
    if (document.getElementById('tchiloFxChipIconCSS')) return;
    var st = document.createElement('style');
    st.id = 'tchiloFxChipIconCSS';
    st.textContent =
      '#tchiloFxChips .fx-chip,#tchiloFxProBar .fx-chip,#tchiloCamFxTrack .fx-3d-item{' +
      'width:64px!important;height:64px!important;min-width:64px!important;' +
      'border-radius:50%!important;padding:0!important;overflow:visible!important;' +
      'display:flex!important;align-items:center!important;justify-content:center!important;' +
      'font-size:0!important;line-height:0!important;color:transparent!important;' +
      'background:rgba(255,255,255,.1)!important;}' +
      '#tchiloFxChips .fx-chip.active,#tchiloFxProBar .fx-chip.active,#tchiloCamFxTrack .fx-3d-item.active{' +
      'border-color:#ff4de8!important;background:rgba(255,77,232,.15)!important;' +
      'box-shadow:0 0 0 3px rgba(255,77,232,.35)!important;}' +
      '#tchiloFxChips .fx-chip svg,#tchiloFxProBar .fx-chip svg,#tchiloCamFxTrack .fx-3d-item svg{' +
      'display:block;pointer-events:none;overflow:visible;}' +
      '#tchiloCamFxTrack .fx-3d-item{flex:0 0 64px!important;transform:scale(.88)!important;opacity:.75!important;}' +
      '#tchiloCamFxTrack .fx-3d-item.active{transform:scale(1.12)!important;opacity:1!important;}' +
      '#tchiloFxFilters .fx-chip,#tchiloCamFilters .fx-fchip{font-size:12px!important;line-height:1.2!important;color:#fff!important;' +
      'width:auto!important;height:auto!important;min-width:0!important;border-radius:999px!important;padding:7px 12px!important;}';
    document.head.appendChild(st);
  }

  function applyIcon(btn) {
    if (!btn || btn.__fxIcon) return;
    var label = (btn.getAttribute('data-label') || btn.textContent || '').trim();
    if (!label) return;
    var icon = resolveIcon(label);
    if (!icon) return;
    btn.setAttribute('data-label', label);
    btn.setAttribute('aria-label', label);
    btn.title = label;
    btn.innerHTML = icon;
    btn.__fxIcon = true;
  }

  function scan() {
    injectCSS();
    document
      .querySelectorAll(
        '#tchiloFxChips .fx-chip, #tchiloFxProBar .fx-chip, #tchiloCamFxTrack .fx-3d-item'
      )
      .forEach(applyIcon);
  }

  function boot() {
    scan();
    setTimeout(scan, 400);
    setTimeout(scan, 1200);
    setTimeout(scan, 3000);
    try {
      new MutationObserver(function () {
        scan();
      }).observe(document.body, { childList: true, subtree: true });
    } catch (e) {}
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();

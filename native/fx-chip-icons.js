/**
 * tchilo-Pop — círculos de efeitos com ÍCONES (não texto)
 * Ex.: cão = orelhas + nariz; gato = orelhas; óculos = armação, etc.
 */
(function () {
  'use strict';

  /* SVG mini ícones 64x64, visual claro no círculo */
  var ICONS = {
    none:
      '<svg viewBox="0 0 64 64" width="36" height="36"><circle cx="32" cy="32" r="14" fill="none" stroke="#fff" stroke-width="3"/><path d="M22 22l20 20M42 22L22 42" stroke="#fff" stroke-width="3" stroke-linecap="round"/></svg>',
    normal:
      '<svg viewBox="0 0 64 64" width="36" height="36"><circle cx="32" cy="28" r="12" fill="#f5d0b0"/><circle cx="27" cy="26" r="2" fill="#333"/><circle cx="37" cy="26" r="2" fill="#333"/><path d="M26 34c2 3 10 3 12 0" stroke="#333" stroke-width="2" fill="none" stroke-linecap="round"/></svg>',
    glasses:
      '<svg viewBox="0 0 64 64" width="40" height="40"><circle cx="20" cy="32" r="11" fill="rgba(100,160,255,.35)" stroke="#1a1a1a" stroke-width="3"/><circle cx="44" cy="32" r="11" fill="rgba(100,160,255,.35)" stroke="#1a1a1a" stroke-width="3"/><path d="M31 32h2" stroke="#1a1a1a" stroke-width="3"/><path d="M9 30h-2M55 30h2" stroke="#1a1a1a" stroke-width="2"/></svg>',
    sunglasses:
      '<svg viewBox="0 0 64 64" width="40" height="40"><ellipse cx="20" cy="32" rx="12" ry="10" fill="#111" stroke="#222" stroke-width="2"/><ellipse cx="44" cy="32" rx="12" ry="10" fill="#111" stroke="#222" stroke-width="2"/><path d="M32 32h0M8 30h-1M56 30h1" stroke="#111" stroke-width="3"/><path d="M16 28l4 2M40 28l4 2" stroke="rgba(255,255,255,.25)" stroke-width="2"/></svg>',
    hat:
      '<svg viewBox="0 0 64 64" width="40" height="40"><ellipse cx="32" cy="42" rx="24" ry="6" fill="#1a1a1a"/><path d="M18 40c0-16 8-26 14-26s14 10 14 26" fill="#2d2d2d"/><rect x="16" y="36" width="32" height="5" rx="1" fill="#c8f560"/></svg>',
    crown:
      '<svg viewBox="0 0 64 64" width="40" height="40"><path d="M10 44L14 20l10 12 8-18 8 18 10-12 4 24z" fill="#f5c542" stroke="#c9920a" stroke-width="1"/><circle cx="32" cy="22" r="3.5" fill="#ff4d6d"/><circle cx="18" cy="28" r="2.5" fill="#5b8cff"/><circle cx="46" cy="28" r="2.5" fill="#ff4d6d"/></svg>',
    ears:
      '<svg viewBox="0 0 64 64" width="40" height="40"><path d="M16 40C10 20 18 8 24 14c2 8 0 20-2 26z" fill="#ff8fab"/><path d="M48 40C54 20 46 8 40 14c-2 8 0 20 2 26z" fill="#ff8fab"/><path d="M18 36c2-8 4-14 5-18" fill="#ffc2d1"/><path d="M46 36c-2-8-4-14-5-18" fill="#ffc2d1"/></svg>',
    cat:
      '<svg viewBox="0 0 64 64" width="40" height="40">' +
      '<path d="M14 36L20 8l12 20z" fill="#f5a623"/><path d="M50 36L44 8L32 28z" fill="#f5a623"/>' +
      '<path d="M18 30L22 14l6 12z" fill="#ff9aa8"/><path d="M46 30L42 14l-6 12z" fill="#ff9aa8"/>' +
      '<circle cx="32" cy="40" r="14" fill="#f5d0b0"/>' +
      '<circle cx="26" cy="38" r="2" fill="#333"/><circle cx="38" cy="38" r="2" fill="#333"/>' +
      '<path d="M32 42l-3 4h6z" fill="#ff6b8a"/>' +
      '<path d="M14 44h10M40 44h10" stroke="#444" stroke-width="1.5" fill="none"/>' +
      '</svg>',
    dog:
      '<svg viewBox="0 0 64 64" width="40" height="40">' +
      /* orelha esq */
      '<path d="M8 28c0-2 2-16 10-14 4 6 2 18-2 22-4 2-8-2-8-8z" fill="#8d6e63"/>' +
      '<path d="M12 30c1-6 3-12 5-12 1 4 0 12-2 14z" fill="#d7ccc8"/>' +
      /* orelha dir */
      '<path d="M56 28c0-2-2-16-10-14-4 6-2 18 2 22 4 2 8-2 8-8z" fill="#8d6e63"/>' +
      '<path d="M52 30c-1-6-3-12-5-12-1 4 0 12 2 14z" fill="#d7ccc8"/>' +
      /* cara */
      '<ellipse cx="32" cy="36" rx="16" ry="15" fill="#c4a484"/>' +
      /* focinho */
      '<ellipse cx="32" cy="42" rx="9" ry="7" fill="#b08968"/>' +
      /* nariz */
      '<ellipse cx="32" cy="40" rx="5" ry="4" fill="#1a1a1a"/>' +
      '<ellipse cx="30" cy="38.5" rx="1.5" ry="1" fill="rgba(255,255,255,.45)"/>' +
      /* olhos */
      '<circle cx="25" cy="32" r="2.2" fill="#222"/><circle cx="39" cy="32" r="2.2" fill="#222"/>' +
      '</svg>',
    mustache:
      '<svg viewBox="0 0 64 64" width="40" height="40"><path d="M32 34c-6 2-14 0-18 6 6-2 12 0 18-2 6 2 12 0 18 2-4-6-12-4-18-6z" fill="#2a1a12"/><circle cx="32" cy="28" r="3" fill="#f5d0b0"/></svg>',
    hearts:
      '<svg viewBox="0 0 64 64" width="36" height="36"><path d="M32 48C20 38 10 30 10 20c0-6 5-10 10-10 4 0 7 2 12 8 5-6 8-8 12-8 5 0 10 4 10 10 0 10-10 18-22 28z" fill="#ff4d6d"/></svg>',
    freckles:
      '<svg viewBox="0 0 64 64" width="36" height="36"><circle cx="32" cy="32" r="16" fill="#f5d0b0"/><circle cx="24" cy="34" r="2" fill="#8B5A2B"/><circle cx="30" cy="38" r="1.5" fill="#8B5A2B"/><circle cx="38" cy="34" r="2" fill="#8B5A2B"/><circle cx="34" cy="30" r="1.5" fill="#8B5A2B"/><circle cx="26" cy="28" r="1.5" fill="#8B5A2B"/></svg>',
    blush:
      '<svg viewBox="0 0 64 64" width="36" height="36"><circle cx="32" cy="32" r="16" fill="#f5d0b0"/><ellipse cx="20" cy="36" rx="7" ry="5" fill="rgba(255,120,140,.55)"/><ellipse cx="44" cy="36" rx="7" ry="5" fill="rgba(255,120,140,.55)"/><circle cx="26" cy="28" r="2" fill="#333"/><circle cx="38" cy="28" r="2" fill="#333"/></svg>',
    flower:
      '<svg viewBox="0 0 64 64" width="36" height="36"><g transform="translate(32 32)">' +
      '<ellipse cx="0" cy="-12" rx="7" ry="10" fill="#ff6b8a" transform="rotate(0)"/>' +
      '<ellipse cx="0" cy="-12" rx="7" ry="10" fill="#ffd166" transform="rotate(60)"/>' +
      '<ellipse cx="0" cy="-12" rx="7" ry="10" fill="#9b5de5" transform="rotate(120)"/>' +
      '<ellipse cx="0" cy="-12" rx="7" ry="10" fill="#00bbf9" transform="rotate(180)"/>' +
      '<ellipse cx="0" cy="-12" rx="7" ry="10" fill="#ff6b8a" transform="rotate(240)"/>' +
      '<ellipse cx="0" cy="-12" rx="7" ry="10" fill="#ffd166" transform="rotate(300)"/>' +
      '<circle r="7" fill="#ffe66d"/></g></svg>',
    tears:
      '<svg viewBox="0 0 64 64" width="36" height="36"><circle cx="32" cy="28" r="14" fill="#f5d0b0"/><circle cx="26" cy="26" r="2" fill="#333"/><circle cx="38" cy="26" r="2" fill="#333"/><path d="M26 34c0 6 2 12 2 12s2-6 2-12" fill="rgba(120,200,255,.8)"/><path d="M38 34c0 6 2 12 2 12s2-6 2-12" fill="rgba(120,200,255,.8)"/></svg>',
    /* pro */
    pinklips:
      '<svg viewBox="0 0 64 64" width="36" height="36"><path d="M18 32c4-8 24-8 28 0-4 10-24 10-28 0z" fill="#ff508c"/><path d="M24 30c4-2 12-2 16 0" stroke="rgba(255,255,255,.5)" stroke-width="2" fill="none"/></svg>',
    redlips:
      '<svg viewBox="0 0 64 64" width="36" height="36"><path d="M18 32c4-8 24-8 28 0-4 10-24 10-28 0z" fill="#c81432"/></svg>',
    gloss:
      '<svg viewBox="0 0 64 64" width="36" height="36"><path d="M18 32c4-8 24-8 28 0-4 10-24 10-28 0z" fill="rgba(255,120,160,.7)"/><path d="M24 28c4-2 12-2 16 0" stroke="rgba(255,255,255,.7)" stroke-width="2" fill="none"/></svg>',
    heartface:
      '<svg viewBox="0 0 64 64" width="36" height="36"><path d="M20 36c-6-5-10-9-10-14 0-4 3-7 7-7 3 0 5 1 8 5 3-4 5-5 8-5 4 0 7 3 7 7 0 5-4 9-10 14l-5 4z" fill="#ff3d7a" transform="translate(8 4) scale(.9)"/></svg>',
    blushpro:
      '<svg viewBox="0 0 64 64" width="36" height="36"><circle cx="32" cy="32" r="16" fill="#f5d0b0"/><ellipse cx="18" cy="36" rx="8" ry="6" fill="rgba(255,107,157,.5)"/><ellipse cx="46" cy="36" rx="8" ry="6" fill="rgba(255,107,157,.5)"/></svg>',
    hairtint:
      '<svg viewBox="0 0 64 64" width="36" height="36"><ellipse cx="32" cy="24" rx="18" ry="14" fill="rgba(180,60,255,.55)"/><circle cx="32" cy="40" r="12" fill="#f5d0b0"/></svg>',
    hatpro:
      '<svg viewBox="0 0 64 64" width="40" height="40"><ellipse cx="32" cy="44" rx="26" ry="7" fill="#111"/><ellipse cx="32" cy="28" rx="14" ry="16" fill="#222"/><rect x="16" y="36" width="32" height="5" fill="#c8f560"/></svg>',
    beanie:
      '<svg viewBox="0 0 64 64" width="40" height="40"><path d="M14 40c0-18 8-28 18-28s18 10 18 28" fill="#6B3DFF"/><rect x="12" y="36" width="40" height="8" rx="2" fill="#5a32d9"/><circle cx="32" cy="12" r="5" fill="#fff"/></svg>',
    sparkle:
      '<svg viewBox="0 0 64 64" width="36" height="36"><path d="M32 8l3 16 16 3-16 3-3 16-3-16-16-3 16-3z" fill="#fff" stroke="#ffd166" stroke-width="1"/></svg>',
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
      /* face-effects chips */
      '#tchiloFxChips .fx-chip,#tchiloFxProBar .fx-chip,#tchiloCamFxTrack .fx-3d-item{' +
      'width:64px!important;height:64px!important;min-width:64px!important;' +
      'border-radius:50%!important;padding:0!important;overflow:hidden!important;' +
      'display:flex!important;align-items:center!important;justify-content:center!important;' +
      'font-size:0!important;line-height:0!important;color:transparent!important;' +
      'background:rgba(255,255,255,.12)!important;}' +
      '#tchiloFxChips .fx-chip.active,#tchiloFxProBar .fx-chip.active,#tchiloCamFxTrack .fx-3d-item.active{' +
      'border-color:#c8f560!important;background:rgba(200,245,96,.22)!important;' +
      'box-shadow:0 0 0 3px rgba(200,245,96,.35)!important;}' +
      '#tchiloFxChips .fx-chip svg,#tchiloFxProBar .fx-chip svg,#tchiloCamFxTrack .fx-3d-item svg{' +
      'display:block;pointer-events:none;}' +
      '#tchiloCamFxTrack .fx-3d-item{flex:0 0 64px!important;transform:scale(.85)!important;opacity:.7!important;}' +
      '#tchiloCamFxTrack .fx-3d-item.active{transform:scale(1.1)!important;opacity:1!important;}' +
      /* filtros de cor mantêm texto */
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

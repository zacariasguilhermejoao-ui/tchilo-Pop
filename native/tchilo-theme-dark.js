/**
 * Tchilo — tema escuro.
 * O tema claro continua exatamente igual. No escuro, este script lê as regras de CSS que a app já tem
 * (incluindo as que outros scripts injetam) e cria uma cópia com as cores invertidas, com as mesmas
 * regras do tema claro: fundos claros passam a escuros, texto preto passa a claro, botões pretos com
 * letra branca passam a claros com letra escura. Fotos, vídeos e cores da marca não mudam.
 */
(function () {
  'use strict';
  if (window.tchiloDarkTheme) return;

  var ROOT = document.documentElement;
  var GEN_ID = 'tchilo-dark-gen';
  var INK = '#F2F2F0';
  var MUTED = '#A0A0A6';
  var ON_INK = '#0B0B0C';
  /* zonas que têm de ficar escuras em qualquer tema (vídeo, câmara, histórias...) */
  var KEEP = /(reel|viewer|video|story|stories|camera|live|player|lightbox|stage|canvas|scrim|backdrop|splash|record|editor|crop|media-picker|cover|hero|post-media|feed-video|poster|toast|call-|\bcall\b|music-|sticker|gif|swatch)/i;

  function isDark() { return ROOT.getAttribute('data-theme') === 'dark'; }

  /* ——— cores ——— */
  function clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }
  var NAMED = { white: [255, 255, 255, 1], black: [0, 0, 0, 1] };
  function parseColor(s) {
    s = String(s).trim().toLowerCase();
    if (NAMED[s]) return { r: NAMED[s][0], g: NAMED[s][1], b: NAMED[s][2], a: 1 };
    var m = /^#([0-9a-f]{3,8})$/.exec(s);
    if (m) {
      var h = m[1];
      if (h.length === 3 || h.length === 4) h = h.split('').map(function (c) { return c + c; }).join('');
      if (h.length !== 6 && h.length !== 8) return null;
      return { r: parseInt(h.substr(0, 2), 16), g: parseInt(h.substr(2, 2), 16), b: parseInt(h.substr(4, 2), 16), a: h.length === 8 ? parseInt(h.substr(6, 2), 16) / 255 : 1 };
    }
    m = /^rgba?\(\s*([\d.]+)\s*[, ]\s*([\d.]+)\s*[, ]\s*([\d.]+)\s*(?:[,/]\s*([\d.]+%?)\s*)?\)$/.exec(s);
    if (m) {
      var a = m[4] == null ? 1 : (m[4].slice(-1) === '%' ? parseFloat(m[4]) / 100 : parseFloat(m[4]));
      return { r: +m[1], g: +m[2], b: +m[3], a: a };
    }
    return null;
  }
  function hsl(c) {
    var r = c.r / 255, g = c.g / 255, b = c.b / 255;
    var mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, h = 0, s = 0, d = mx - mn;
    if (d) {
      s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
      if (mx === r) h = (g - b) / d + (g < b ? 6 : 0);
      else if (mx === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      h /= 6;
    }
    return { h: h, s: s, l: l };
  }
  function fromHsl(h, s, l, a) {
    function f(p, q, t) {
      if (t < 0) t += 1; if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    }
    var r, g, b;
    if (!s) { r = g = b = l; }
    else {
      var q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
      r = f(p, q, h + 1 / 3); g = f(p, q, h); b = f(p, q, h - 1 / 3);
    }
    return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255), a: a };
  }
  function fmt(c) {
    if (c.a < 0.995) return 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',' + (Math.round(c.a * 1000) / 1000) + ')';
    function x(n) { return ('0' + n.toString(16)).slice(-2); }
    return '#' + x(c.r) + x(c.g) + x(c.b);
  }
  function grey(l, a) { var v = Math.round(clamp(l, 0, 1) * 255); return { r: v, g: v, b: v, a: a }; }
  function isInkLike(c) { return Math.abs(c.r - 11) < 8 && Math.abs(c.g - 11) < 8 && Math.abs(c.b - 12) < 8; }

  /* fundo */
  function mapBg(c, ctx) {
    if (c.a < 0.02) return null;
    var h = hsl(c);
    if (h.s < 0.16) {
      if (h.l >= 0.78) {
        if (c.a < 0.8 && h.l > 0.95) return null;           /* véu branco translúcido: mantém */
        return fmt(grey(clamp(0.085 + (1 - h.l), 0.06, 0.3), c.a));
      }
      if (h.l <= 0.22) {
        if (c.a < 0.9) return isInkLike(c) ? fmt({ r: 242, g: 242, b: 240, a: c.a }) : null; /* véus pretos: mantém */
        return fmt({ r: 242, g: 242, b: 240, a: c.a });       /* preto sólido → claro */
      }
      return null;
    }
    if (h.l >= 0.88) return fmt(fromHsl(h.h, h.s * 0.45, 0.17, c.a)); /* tons claros coloridos → escuros */
    return null;
  }
  /* texto, ícones (fill/stroke) */
  function mapText(c, ctx) {
    if (c.a < 0.02) return null;
    var h = hsl(c);
    if (h.s >= 0.16) return null;
    if (h.l <= 0.28) return fmt({ r: 242, g: 242, b: 240, a: c.a });
    if (h.l < 0.72) return fmt({ r: 160, g: 160, b: 166, a: c.a });
    if (h.l >= 0.9 && ctx.onInk) return fmt({ r: 11, g: 11, b: 12, a: c.a });
    return null;
  }
  /* contornos */
  function mapBorder(c, ctx) {
    if (c.a < 0.02) return null;
    var h = hsl(c);
    if (h.s >= 0.16) return null;
    if (h.l >= 0.78) {
      if (c.a < 0.8 && h.l > 0.95) return null;
      return fmt(grey(clamp(0.12 + (1 - h.l) * 1.2, 0.1, 0.4), c.a));
    }
    if (h.l <= 0.22) {
      if (c.a < 0.9) return isInkLike(c) ? fmt({ r: 242, g: 242, b: 240, a: c.a }) : null;
      return fmt({ r: 242, g: 242, b: 240, a: c.a });
    }
    return null;
  }

  var COLOR_TOKEN = /#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)|\b(?:white|black)\b/g;
  function mapValue(value, mapper, ctx) {
    var changed = false;
    var out = value.replace(COLOR_TOKEN, function (tok) {
      var c = parseColor(tok);
      if (!c) return tok;
      var m = mapper(c, ctx);
      if (m) { changed = true; return m; }
      return tok;
    });
    return changed ? out : null;
  }

  /* ——— leitura de declarações ——— */
  function splitTop(str, sep) {
    var out = [], depth = 0, q = '', cur = '';
    for (var i = 0; i < str.length; i++) {
      var ch = str[i];
      if (q) { cur += ch; if (ch === q && str[i - 1] !== '\\') q = ''; continue; }
      if (ch === '"' || ch === "'") { q = ch; cur += ch; continue; }
      if (ch === '(' || ch === '[') depth++;
      if (ch === ')' || ch === ']') depth--;
      if (ch === sep && depth === 0) { out.push(cur); cur = ''; continue; }
      cur += ch;
    }
    if (cur.trim()) out.push(cur);
    return out;
  }
  function parseDecls(text) {
    return splitTop(text, ';').map(function (d) {
      var i = d.indexOf(':');
      if (i < 0) return null;
      var prop = d.slice(0, i).trim().toLowerCase();
      var val = d.slice(i + 1).trim();
      var imp = /!important\s*$/i.test(val);
      val = val.replace(/\s*!important\s*$/i, '');
      return { prop: prop, val: val, imp: imp };
    }).filter(Boolean);
  }
  function kindOf(prop) {
    if (prop === 'background' || prop === 'background-color') return 'bg';
    if (prop === 'background-image') return 'bgimg';
    if (prop === 'color' || prop === 'fill' || prop === 'stroke') return 'text';
    if (prop === 'border' || prop === 'outline' || /^border(-(top|bottom|left|right))?(-color)?$/.test(prop) || prop === 'outline-color') return 'border';
    return '';
  }
  function bgIsInk(val) {
    if (/var\(\s*--ink\b/.test(val)) return true;
    var toks = val.match(COLOR_TOKEN);
    if (!toks) return false;
    for (var i = 0; i < toks.length; i++) {
      var c = parseColor(toks[i]);
      if (c && c.a >= 0.9 && hsl(c).s < 0.16 && hsl(c).l <= 0.22) return true;
    }
    return false;
  }
  /* devolve as declarações a mudar para o escuro (texto CSS) ou '' */
  function darkDecls(declText, keepZone) {
    if (keepZone) return '';
    var decls = parseDecls(declText), ctx = { onInk: false }, i;
    for (i = 0; i < decls.length; i++) {
      var k = kindOf(decls[i].prop);
      if (k === 'bg' && bgIsInk(decls[i].val)) ctx.onInk = true;
    }
    var out = [];
    for (i = 0; i < decls.length; i++) {
      var d = decls[i], kind = kindOf(d.prop), nv = null;
      if (!kind || /var\(/.test(d.val) && !/(#|rgb|white|black)/i.test(d.val.replace(/var\([^)]*\)/g, ''))) continue;
      if (kind === 'bg') nv = mapValue(d.val, mapBg, ctx);
      else if (kind === 'bgimg') { if (/gradient\(/.test(d.val)) nv = mapValue(d.val, mapBg, ctx); }
      else if (kind === 'text') nv = mapValue(d.val, mapText, ctx);
      else if (kind === 'border') nv = mapValue(d.val, mapBorder, ctx);
      if (nv) out.push(d.prop + ':' + nv + ' !important');
    }
    return out.join(';');
  }

  /* ——— folhas de estilo ——— */
  function prefixSelector(sel) {
    return splitTop(sel, ',').map(function (s) {
      s = s.trim();
      if (!s) return '';
      if (/^html\b/.test(s)) return s.replace(/^html/, 'html[data-theme="dark"]');
      if (/^:root\b/.test(s)) return s.replace(/^:root/, ':root[data-theme="dark"]');
      return 'html[data-theme="dark"] ' + s;
    }).filter(Boolean).join(',');
  }
  function bodyOfRule(rule) {
    var t = rule.cssText;
    var a = t.indexOf('{'), b = t.lastIndexOf('}');
    return a >= 0 && b > a ? t.slice(a + 1, b) : '';
  }
  function genRules(rules, out) {
    for (var i = 0; i < rules.length; i++) {
      var r = rules[i];
      try {
        if (r.type === 1) {
          var sel = r.selectorText || '';
          if (sel.indexOf('[data-theme') >= 0) continue;
          var d = darkDecls(bodyOfRule(r), KEEP.test(sel));
          if (d) out.push(prefixSelector(sel) + '{' + d + '}');
        } else if (r.type === 4 && r.cssRules) {
          var inner = [];
          genRules(r.cssRules, inner);
          if (inner.length) out.push('@media ' + r.conditionText + '{' + inner.join('') + '}');
        } else if (r.type === 12 && r.cssRules) {
          var inner2 = [];
          genRules(r.cssRules, inner2);
          if (inner2.length) out.push('@supports ' + r.conditionText + '{' + inner2.join('') + '}');
        }
      } catch (e) {}
    }
  }
  var done = new WeakMap();      /* <style> já convertida → <style> escura */
  var genCount = 0;
  function convertSheet(ownerNode) {
    if (!ownerNode || ownerNode.id === GEN_ID || (ownerNode.id || '').indexOf('tchilo-dark-gen') === 0) return;
    var sheet = ownerNode.sheet;
    if (!sheet) return;
    var rules;
    try { rules = sheet.cssRules; } catch (e) { return; }
    var key = rules.length;
    if (done.has(ownerNode) && done.get(ownerNode).key === key) return;
    var out = [];
    genRules(rules, out);
    var st = done.has(ownerNode) ? done.get(ownerNode).el : null;
    if (!st) {
      st = document.createElement('style');
      st.id = GEN_ID + '-' + (++genCount);
      (document.head || ROOT).appendChild(st);
    }
    st.textContent = out.join('\n');
    done.set(ownerNode, { el: st, key: key });
  }
  function convertAll() {
    var nodes = document.querySelectorAll('style, link[rel="stylesheet"]');
    for (var i = 0; i < nodes.length; i++) convertSheet(nodes[i]);
  }
  function dropGenerated() {
    var gens = document.querySelectorAll('style[id^="' + GEN_ID + '"]');
    for (var i = 0; i < gens.length; i++) gens[i].parentNode.removeChild(gens[i]);
    done = new WeakMap();
  }

  /* ——— estilos inline (style="...") ——— */
  var INLINE_SEL = '[style*="#"], [style*="rgb"], [style*="white"], [style*="black"]';
  function convertInline(el) {
    if (!el.getAttribute || el.hasAttribute('data-dk-orig')) return;
    var st = el.getAttribute('style');
    if (!st) return;
    if (el.closest && el.closest('video, canvas, #reelsViewer, #mediaViewer, .story-viewer, .theme-swatch')) return;
    if (el.classList && el.classList.contains('theme-swatch')) return;
    var d = darkDecls(st, false);
    if (!d) return;
    el.setAttribute('data-dk-orig', st);
    el.setAttribute('style', st.replace(/;?\s*$/, ';') + d);
  }
  function convertInlineIn(root) {
    if (!root || root.nodeType !== 1) return;
    if (root.matches && root.matches(INLINE_SEL)) convertInline(root);
    var list = root.querySelectorAll ? root.querySelectorAll(INLINE_SEL) : [];
    for (var i = 0; i < list.length; i++) convertInline(list[i]);
  }
  function restoreInline() {
    var list = document.querySelectorAll('[data-dk-orig]');
    for (var i = 0; i < list.length; i++) {
      list[i].setAttribute('style', list[i].getAttribute('data-dk-orig'));
      list[i].removeAttribute('data-dk-orig');
    }
  }

  /* ——— observador (estilos e elementos novos criados por outros scripts) ——— */
  var obs = null, timer = 0, pendingNodes = [];
  function schedule() {
    if (timer) return;
    timer = setTimeout(function () {
      timer = 0;
      if (!isDark()) { pendingNodes = []; return; }
      convertAll();
      var nodes = pendingNodes; pendingNodes = [];
      for (var i = 0; i < nodes.length; i++) convertInlineIn(nodes[i]);
    }, 120);
  }
  function startObserver() {
    if (obs || !window.MutationObserver) return;
    obs = new MutationObserver(function (muts) {
      if (!isDark()) return;
      for (var i = 0; i < muts.length; i++) {
        var added = muts[i].addedNodes;
        for (var j = 0; j < added.length; j++) {
          var n = added[j];
          if (n.nodeType !== 1) continue;
          if (n.id && n.id.indexOf(GEN_ID) === 0) continue;
          pendingNodes.push(n);
        }
      }
      schedule();
    });
    obs.observe(document.documentElement, { childList: true, subtree: true });
  }

  /* ——— barra de estado ——— */
  function chrome(dark) {
    try {
      var m = document.querySelector('meta[name="theme-color"]');
      if (!m) { m = document.createElement('meta'); m.name = 'theme-color'; (document.head || ROOT).appendChild(m); }
      m.content = dark ? '#141416' : '#ffffff';
    } catch (e) {}
    try {
      var C = window.Capacitor, SB = C && C.Plugins && C.Plugins.StatusBar;
      if (SB && SB.setStyle) SB.setStyle({ style: dark ? 'DARK' : 'LIGHT' });
    } catch (e) {}
  }

  function apply() {
    if (isDark()) {
      convertAll();
      convertInlineIn(document.body || ROOT);
      startObserver();
      chrome(true);
    } else {
      dropGenerated();
      restoreInline();
      chrome(false);
    }
  }

  window.tchiloDarkTheme = { apply: apply, refresh: function () { if (isDark()) { convertAll(); convertInlineIn(document.body || ROOT); } } };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', apply);
  else apply();
  window.addEventListener('load', function () { if (isDark()) { convertAll(); convertInlineIn(document.body); } });
})();

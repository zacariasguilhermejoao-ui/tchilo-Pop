/**
 * Tchilo — «Ver tradução» (como no Facebook/Instagram)
 * 1) Deteta o idioma do texto no próprio telemóvel (grátis, sem enviar nada).
 * 2) Se for diferente do idioma da app, mostra «Ver tradução» por baixo do post, comentário ou legenda.
 * 3) Ao tocar, pede a tradução à função "translate" do Supabase (que guarda cache) e mostra o texto,
 *    com «Ver original» para voltar. A tradução também fica em cache no telemóvel.
 */
(function () {
  'use strict';
  if (window.tchiloTranslate) return;

  var CACHE_KEY = 'tchilo_tr_v1';
  var CACHE_MAX = 400;
  var MIN_CHARS = 14;
  var MAX_CHARS = 2000;

  /* ——— texto da interface (nos 5 idiomas da app) ——— */
  var L = {
    pt: { see: 'Ver tradução', orig: 'Ver original', busy: 'A traduzir…', fail: 'Não foi possível traduzir agora' },
    en: { see: 'See translation', orig: 'See original', busy: 'Translating…', fail: 'Could not translate right now' },
    fr: { see: 'Voir la traduction', orig: "Voir l'original", busy: 'Traduction…', fail: 'Traduction impossible pour le moment' },
    it: { see: 'Vedi traduzione', orig: "Vedi l'originale", busy: 'Traduzione…', fail: 'Impossibile tradurre ora' },
    zh: { see: '查看翻译', orig: '查看原文', busy: '翻译中…', fail: '暂时无法翻译' }
  };
  function appLang() {
    try {
      if (typeof getLanguage === 'function') return getLanguage();
      var l = localStorage.getItem('tchilo_language');
      return l === 'en' || l === 'fr' || l === 'it' || l === 'zh' ? l : 'pt';
    } catch (e) { return 'pt'; }
  }
  function tr(k) { var p = L[appLang()] || L.pt; return p[k]; }

  /* ——— deteção de idioma (no telemóvel) ——— */
  function words(s) { return s.split(/\s+/).filter(Boolean); }
  var SW = {
    pt: 'de a o e que do da em um uma para com não nao os as no na se por mais mas foi como ele ela são sao está esta isso meu minha você voce vc muito também tambem já ja eu tu tens tenho vai ao dos das nos nas até quando sobre ser tem pra né bom dia boa noite tudo bem hoje aqui onde porque ainda só nosso nossa dele dela seu sua estou estamos deus amor obrigado obrigada vamos fazer',
    en: 'the and of to in is you that it for on with as are this be at or have from by not but what all we can your my was if they will me so just like love good great thank thanks happy new day today its our who how out up about more one when were been has had do does did',
    fr: "le la les de des du un une et est en que qui pour dans pas sur avec ce cette je tu il elle nous vous ils au aux mais ou où plus très tres merci bonjour bien tout c'est mon ma mes son sa ses être avoir fait comme aussi ça ici suis sont j'ai n'est",
    es: 'el la los las de del un una y que en es por con para no se lo su al más mas pero como muy está esta este gracias hola buen día todo bien hoy yo tú mi te qué también ya son ser tiene cuando estoy porque',
    it: 'il lo la i gli le di del della un una e che in è per con non si sono come ma più anche questo questa ciao grazie buon giorno tutto bene oggi mi ti ci al alla nel nella molto ho hai ha siamo qui perché'
  };
  var SET = {};
  Object.keys(SW).forEach(function (k) {
    SET[k] = {};
    words(SW[k]).forEach(function (w) { SET[k][w] = 1; });
  });

  function clean(text) {
    return String(text || '')
      .replace(/https?:\/\/\S+|www\.\S+/gi, ' ')
      .replace(/[@#]\S+/g, ' ')
      .replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}]/gu, ' ')
      .replace(/[0-9]+/g, ' ')
      .trim();
  }
  /** devolve o código do idioma ('pt','en','fr','es','it','zh','ja','ko','ru','ar') ou '' se não houver certeza */
  function detect(text) {
    var t = clean(text);
    if (t.length < MIN_CHARS) return '';
    var letters = t.replace(/[\s\p{P}\p{S}]/gu, '');
    if (letters.length < 8) return '';
    var n = letters.length;
    function ratio(re) { var m = letters.match(re); return m ? m.length / n : 0; }
    if (ratio(/[\u3040-\u30ff]/g) > 0.2) return 'ja';
    if (ratio(/[\uac00-\ud7af]/g) > 0.3) return 'ko';
    if (ratio(/[\u4e00-\u9fff]/g) > 0.3) return 'zh';
    if (ratio(/[\u0400-\u04ff]/g) > 0.4) return 'ru';
    if (ratio(/[\u0600-\u06ff]/g) > 0.4) return 'ar';
    var toks = t.toLowerCase().replace(/[.,;:!?¿¡"“”()\[\]{}…]/g, ' ').split(/\s+/).filter(Boolean);
    if (toks.length < 3) return '';
    var score = { pt: 0, en: 0, fr: 0, es: 0, it: 0 };
    toks.forEach(function (w) {
      Object.keys(score).forEach(function (k) { if (SET[k][w]) score[k]++; });
    });
    var low = t.toLowerCase();
    if (/[ãõ]/.test(low)) score.pt += 2;
    if (/ç/.test(low)) { score.pt += 1; score.fr += 1; }
    if (/[ñ¿¡]/.test(low)) score.es += 3;
    if (/[œ]|\b(c'est|j'ai|n'est|qu')/.test(low)) score.fr += 2;
    var order = Object.keys(score).sort(function (a, b) { return score[b] - score[a]; });
    var top = order[0], sec = order[1];
    var needHits = toks.length <= 6 ? 2 : 3;
    if (score[top] < needHits) return '';
    if (score[top] < score[sec] * 1.4 + 0.01) return '';
    return top;
  }

  /* ——— cache no telemóvel ——— */
  function hash(s) {
    var h = 5381;
    for (var i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
    return (h >>> 0).toString(36) + '.' + s.length;
  }
  function cacheGet(k) {
    try { var o = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}'); return o[k] || null; } catch (e) { return null; }
  }
  function cacheSet(k, v) {
    try {
      var o = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
      o[k] = v;
      var keys = Object.keys(o);
      if (keys.length > CACHE_MAX) keys.slice(0, keys.length - CACHE_MAX).forEach(function (x) { delete o[x]; });
      localStorage.setItem(CACHE_KEY, JSON.stringify(o));
    } catch (e) {}
  }

  /* ——— pedir a tradução ——— */
  var inflight = {};
  async function translate(text, target) {
    var key = hash(target + '|' + text);
    var c = cacheGet(key);
    if (c) return c;
    if (inflight[key]) return inflight[key];
    inflight[key] = (async function () {
      var SB = window.tchiloSupabase;
      if (!SB || !SB.functions || typeof SB.functions.invoke !== 'function') throw new Error('offline');
      var r = await SB.functions.invoke('translate', { body: { text: text, target: target } });
      if (r.error || !r.data || typeof r.data.translated !== 'string') throw new Error((r.error && r.error.message) || 'sem resposta');
      var out = { t: r.data.translated, s: r.data.source || '' };
      cacheSet(key, out);
      return out;
    })();
    try { return await inflight[key]; } finally { delete inflight[key]; }
  }

  /* ——— interface ——— */
  function css() {
    if (document.getElementById('tchiloTranslateCSS')) return;
    var st = document.createElement('style');
    st.id = 'tchiloTranslateCSS';
    st.textContent =
      '.tt-btn{display:block;margin:4px 0 0;padding:4px 0;border:0;background:transparent;color:var(--muted,#606060);font:700 13px system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;cursor:pointer;-webkit-appearance:none;appearance:none;text-align:left}' +
      '.tt-btn[disabled]{opacity:.6}';
    document.head.appendChild(st);
  }

  /* onde está o texto em cada tipo de elemento */
  function bodyOf(el) {
    if (el.classList.contains('post-caption')) {
      if (!el.__ttBody) {
        var nameEl = el.querySelector('b.user-tap');
        var span = document.createElement('span');
        span.className = 'tt-body';
        var nodes = [];
        var n = nameEl ? nameEl.nextSibling : el.firstChild;
        while (n) { nodes.push(n); n = n.nextSibling; }
        nodes.forEach(function (x) { span.appendChild(x); });
        el.appendChild(span);
        el.__ttBody = span;
      }
      return el.__ttBody;
    }
    return el;
  }
  var SELECTORS = '.post-caption, .reel-meta span, .tcu-text, .pp-cap, .media-viewer-caption';

  function enhance(el) {
    if (el.__ttDone) return;
    if (el.closest && el.closest('.tt-btn')) return;
    var body = bodyOf(el);
    var text = (body.textContent || '').trim();
    if (text.length < MIN_CHARS || text.length > MAX_CHARS) { el.__ttDone = true; return; }
    var src = detect(text);
    var target = appLang();
    if (!src || src === target) { el.__ttDone = true; return; }
    el.__ttDone = true;

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'tt-btn';
    btn.textContent = tr('see');
    var state = 'orig', originalHTML = body.innerHTML, translated = null;
    btn.addEventListener('click', async function (ev) {
      ev.stopPropagation();
      ev.preventDefault();
      if (state === 'trans') {
        body.innerHTML = originalHTML;
        state = 'orig';
        btn.textContent = tr('see');
        return;
      }
      if (translated == null) {
        btn.disabled = true;
        btn.textContent = tr('busy');
        try {
          var res = await translate(text, target);
          if (res.s && res.s.toLowerCase().slice(0, 2) === target) {
            btn.remove();          /* já estava no teu idioma */
            return;
          }
          translated = res.t;
        } catch (e) {
          btn.disabled = false;
          btn.textContent = tr('see');
          try { if (typeof showToast === 'function') showToast(tr('fail')); } catch (x) {}
          return;
        }
        btn.disabled = false;
      }
      body.textContent = (el.classList.contains('post-caption') ? ' ' : '') + translated;
      state = 'trans';
      btn.textContent = tr('orig');
    });
    var host = el.classList.contains('post-caption') ? el : body;
    host.insertAdjacentElement('afterend', btn);
    if (el.classList.contains('post-caption')) { /* o botão fica por baixo da legenda */ }
  }

  function scan(root) {
    if (!root || root.nodeType !== 1) return;
    if (root.matches && root.matches(SELECTORS)) enhance(root);
    var list = root.querySelectorAll ? root.querySelectorAll(SELECTORS) : [];
    for (var i = 0; i < list.length; i++) enhance(list[i]);
  }

  var timer = 0, pending = [];
  function schedule() {
    if (timer) return;
    timer = setTimeout(function () {
      timer = 0;
      var nodes = pending; pending = [];
      css();
      for (var i = 0; i < nodes.length; i++) scan(nodes[i]);
    }, 200);
  }
  function start() {
    css();
    scan(document.body);
    if (!window.MutationObserver) return;
    new MutationObserver(function (muts) {
      for (var i = 0; i < muts.length; i++) {
        var a = muts[i].addedNodes;
        for (var j = 0; j < a.length; j++) {
          var n = a[j];
          if (n.nodeType !== 1 || (n.classList && n.classList.contains('tt-btn'))) continue;
          pending.push(n);
        }
      }
      if (pending.length) schedule();
    }).observe(document.body, { childList: true, subtree: true });
  }

  window.tchiloTranslate = { detect: detect, translate: translate, scan: scan };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();

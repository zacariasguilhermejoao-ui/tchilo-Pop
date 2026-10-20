/**
 * Tchilo — definições extra (v1)
 *
 * Páginas: Tempo e bem-estar, Reprodução e dados, Acessibilidade,
 *          Ajuda e suporte, Contas bloqueadas.
 *
 * Tudo aqui tem efeito real:
 *  - Tempo e bem-estar: mede o tempo com a app aberta (por conta e por dia) e avisa
 *    com lembrete de pausa / limite diário.
 *  - Reels automáticos + Poupança de dados: ligados ao observer dos Reels e à
 *    pré-carga de média (ver tchiloReelsAutoplayOn / tchiloDataSaverOn).
 *  - Libertar espaço: apaga a cache de média (Cache Storage "tchilo-media*").
 *  - Acessibilidade: classes no <html> (reduzir movimento, mais contraste).
 *  - Contas bloqueadas: lista e desbloqueia com as mesmas funções do index.
 *  - Ajuda: abre as páginas públicas do site (faq, contacto, preços, reembolso).
 */
(function () {
  'use strict';
  if (window.__tchiloSettingsMoreV1) return;
  window.__tchiloSettingsMoreV1 = true;

  var DEFAULTS = {
    autoplayReels: true,
    dataSaver: false,
    reduceMotion: false,
    highContrast: false,
    breakEvery: 0,
    dailyLimit: 0
  };
  var SCREENS = { wellbeing: 1, playback: 1, accessibility: 1, help: 1, blocked: 1 };

  /* ---------- utilitários ---------- */
  function byId(id) { return document.getElementById(id); }

  function tr(k) {
    try { return typeof t === 'function' ? t(k) : k; } catch (e) { return k; }
  }

  function toast(msg) {
    try { if (typeof showToast === 'function') showToast(tr(msg)); } catch (e) {}
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function allSettings() {
    try { return typeof getAppSettings === 'function' ? (getAppSettings() || {}) : {}; }
    catch (e) { return {}; }
  }

  function pref(key) {
    var s = allSettings();
    return s[key] !== undefined ? s[key] : DEFAULTS[key];
  }

  function setPref(key, val) {
    try {
      var s = allSettings();
      s[key] = val;
      if (typeof saveAppSettings === 'function') saveAppSettings(s);
    } catch (e) {}
  }

  function fmtDur(ms) {
    var m = Math.floor(ms / 60000);
    if (m < 1) return tr('Menos de 1 min');
    if (m < 60) return m + ' min';
    var h = Math.floor(m / 60), r = m % 60;
    return r ? h + ' h ' + r + ' min' : h + ' h';
  }

  function fmtBytes(b) {
    if (b < 1024) return b + ' B';
    if (b < 1048576) return Math.round(b / 1024) + ' KB';
    var mb = b / 1048576;
    return (mb < 10 ? mb.toFixed(1) : String(Math.round(mb))).replace('.', ',') + ' MB';
  }

  /* ---------- CSS ---------- */
  function injectCSS() {
    if (document.getElementById('tchilo-settings-more-css')) return;
    var sys = 'system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif';
    var st = document.createElement('style');
    st.id = 'tchilo-settings-more-css';
    st.textContent = [
      '.si-l{display:block;font-weight:inherit}',
      '.settings-item .lang-dot{flex:0 0 26px!important;width:26px!important;height:26px!important}',
      '.si-sub{display:block;font-style:normal;font-size:12.5px;line-height:1.35;font-weight:400;color:var(--muted);margin-top:2px}',
      '.settings-item .tm-value{flex:0 0 auto;font-size:14px;font-weight:500;color:var(--muted)}',
      '.tm-note{padding:10px 16px 0;font:400 12.5px/1.4 ' + sys + ';color:var(--muted)}',
      '.tm-empty{padding:48px 24px;text-align:center;color:var(--muted);font:500 15px ' + sys + '}',
      '.settings-item .tm-unblock{flex:0 0 auto;font:600 14px ' + sys + ';color:var(--ink);background:transparent;border:0;padding:8px 0 8px 12px;cursor:pointer;-webkit-tap-highlight-color:transparent}',
      'html.tk-reduce-motion *,html.tk-reduce-motion *::before,html.tk-reduce-motion *::after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important;scroll-behavior:auto!important}',
      'html.tk-high-contrast{--muted:color-mix(in srgb,var(--ink) 78%,var(--paper));--line:color-mix(in srgb,var(--ink) 32%,transparent)}',
      'html.tk-high-contrast .settings-item .chev{opacity:1}'
    ].join('\n');
    (document.head || document.documentElement).appendChild(st);
  }

  /* ---------- preferências aplicadas à app ---------- */
  function applyPrefs() {
    try {
      var h = document.documentElement;
      h.classList.toggle('tk-reduce-motion', !!pref('reduceMotion'));
      h.classList.toggle('tk-high-contrast', !!pref('highContrast'));
    } catch (e) {}
  }

  /* usados pelo index (Reels) e pela pré-carga de média */
  window.tchiloDataSaverOn = function () { return !!pref('dataSaver'); };
  window.tchiloReelsAutoplayOn = function () {
    return !!pref('autoplayReels') && !pref('dataSaver');
  };

  function setOn(id, on) {
    var el = byId(id);
    if (el) el.classList.toggle('on', !!on);
  }

  function renderToggles() {
    ['autoplayReels', 'dataSaver', 'reduceMotion', 'highContrast'].forEach(function (k) {
      setOn('tm-tog-' + k, pref(k));
    });
  }

  function renderPicks() {
    var nodes = document.querySelectorAll('[data-pick]');
    for (var i = 0; i < nodes.length; i++) {
      var p = nodes[i].getAttribute('data-pick').split(':');
      nodes[i].classList.toggle('on', String(pref(p[0])) === p[1]);
    }
  }

  var TOGGLE_MSG = {
    autoplayReels: ['Reels automáticos ligados', 'Reels automáticos desligados'],
    dataSaver: ['Poupança de dados ligada', 'Poupança de dados desligada'],
    reduceMotion: ['Movimento reduzido', 'Animações normais'],
    highContrast: ['Mais contraste ligado', 'Contraste normal']
  };

  window.tchiloMoreToggle = function (key) {
    if (!Object.prototype.hasOwnProperty.call(DEFAULTS, key)) return;
    var next = !pref(key);
    setPref(key, next);
    applyPrefs();
    renderToggles();
    var m = TOGGLE_MSG[key];
    if (m) toast(next ? m[0] : m[1]);
  };

  /* ---------- tempo e bem-estar ---------- */
  var lastTick = Date.now();
  var breakAcc = 0;       /* ms seguidos desde o último lembrete */
  var hiddenAt = 0;
  var snoozeMs = 0;       /* tempo extra concedido ao carregar "Continuar" */
  var snoozeDay = '';

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function dayStr(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }

  function username() {
    try {
      var s = typeof getSession === 'function' ? getSession() : null;
      return s && s.username ? String(s.username) : '';
    } catch (e) { return ''; }
  }

  function usageKey() {
    var u = username();
    return u ? 'tchilo_usage_' + u + '_' + dayStr(new Date()) : '';
  }

  function readUsage() {
    var k = usageKey();
    if (!k) return 0;
    try { return parseInt(localStorage.getItem(k) || '0', 10) || 0; } catch (e) { return 0; }
  }

  function addUsage(ms) {
    var k = usageKey();
    if (!k) return 0;
    var v = readUsage() + ms;
    try { localStorage.setItem(k, String(v)); } catch (e) {}
    return v;
  }

  /* apaga registos de tempo com mais de 14 dias */
  function pruneUsage() {
    try {
      var limit = Date.now() - 14 * 86400000;
      var drop = [];
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        var m = k && /^tchilo_usage_.*_(\d{4})-(\d{2})-(\d{2})$/.exec(k);
        if (m && new Date(+m[1], +m[2] - 1, +m[3]).getTime() < limit) drop.push(k);
      }
      drop.forEach(function (k) { localStorage.removeItem(k); });
    } catch (e) {}
  }

  var modalOpen = false;

  function openNotice(opts, done) {
    /* usa o modal da app; se estiver ocupado, tenta no próximo tick */
    if (typeof tchiloModalOpen !== 'function') { toast(opts.message); return false; }
    if (window.__tchiloModalState) return false;
    modalOpen = true;
    var p;
    try { p = tchiloModalOpen(opts); } catch (e) { modalOpen = false; return false; }
    Promise.resolve(p).then(function (v) { modalOpen = false; if (done) done(v); },
                            function () { modalOpen = false; });
    return true;
  }

  function showBreak(mins) {
    var shown = openNotice({
      title: tr('Hora de uma pausa'),
      message: tr('Já estás na Tchilo há algum tempo. Que tal descansar a vista um bocadinho?'),
      cancelValue: true,
      buttons: [{ label: tr('Continuar'), value: true, primary: true }]
    });
    if (!shown) breakAcc = mins * 60000; /* tenta de novo no próximo tick */
  }

  function showLimit(usedMs) {
    var shown = openNotice({
      title: tr('Limite diário atingido'),
      message: tr('Hoje já atingiste o limite de tempo que definiste na Tchilo.') + ' (' + fmtDur(usedMs) + ')',
      cancelValue: false,
      buttons: [
        { label: tr('Agora não'), value: false },
        { label: tr('Mais 15 min'), value: true, primary: true }
      ]
    }, function () {
      /* nos dois casos o aviso só volta a aparecer depois de mais 15 min de uso */
      snoozeMs += 15 * 60000;
    });
    return shown;
  }

  function tick() {
    var now = Date.now();
    var dt = now - lastTick;
    lastTick = now;
    if (document.hidden || dt <= 0) return;
    if (dt > 15000) dt = 5000; /* ignora saltos (app suspensa) */
    var today = dayStr(new Date());
    if (snoozeDay !== today) { snoozeDay = today; snoozeMs = 0; }
    var used = addUsage(dt);
    breakAcc += dt;

    var scr = byId('screen-settings-wellbeing');
    if (scr && scr.classList.contains('active')) renderWellbeing();
    if (modalOpen || window.__tchiloModalState) return;

    var lim = Number(pref('dailyLimit')) || 0;
    var every = Number(pref('breakEvery')) || 0;
    if (lim > 0 && used >= lim * 60000 + snoozeMs) { showLimit(used); return; }
    if (every > 0 && breakAcc >= every * 60000) { breakAcc = 0; showBreak(every); }
  }

  function renderWellbeing() {
    var el = byId('tm-today');
    if (el) el.textContent = fmtDur(readUsage());
  }

  var PICK_MSG = {
    breakEvery: function (v) { return v ? 'Lembrete de pausa guardado' : 'Lembrete de pausa desligado'; },
    dailyLimit: function (v) { return v ? 'Limite diário guardado' : 'Sem limite diário'; }
  };

  window.tchiloMorePick = function (key, val) {
    if (key !== 'breakEvery' && key !== 'dailyLimit') return;
    val = Number(val) || 0;
    setPref(key, val);
    if (key === 'breakEvery') breakAcc = 0;
    if (key === 'dailyLimit') snoozeMs = 0;
    renderPicks();
    toast(PICK_MSG[key](val));
  };

  /* ---------- libertar espaço ---------- */
  function mediaCacheStats() {
    var res = { count: 0, bytes: 0, known: true };
    if (!('caches' in window)) return Promise.resolve(res);
    return caches.keys().then(function (names) {
      var chain = Promise.resolve();
      names.forEach(function (name) {
        if (!/^tchilo-media/.test(name)) return;
        chain = chain.then(function () {
          return caches.open(name).then(function (c) {
            return c.keys().then(function (reqs) {
              var inner = Promise.resolve();
              reqs.forEach(function (req) {
                res.count++;
                inner = inner.then(function () {
                  return c.match(req).then(function (r) {
                    if (!r) return;
                    var len = parseInt(r.headers.get('content-length') || '0', 10);
                    if (len) { res.bytes += len; return; }
                    return r.blob().then(function (b) {
                      if (b && b.size) res.bytes += b.size; else res.known = false;
                    });
                  }).catch(function () { res.known = false; });
                });
              });
              return inner;
            });
          });
        });
      });
      return chain.then(function () { return res; });
    }).catch(function () { return res; });
  }

  function statsText(s) {
    if (!s.count) return '0 KB';
    if (s.bytes > 0) return fmtBytes(s.bytes) + (s.known ? '' : '+');
    return s.count + (s.count === 1 ? ' ficheiro' : ' ficheiros');
  }

  function renderCache() {
    var el = byId('tm-cache-size');
    if (!el) return;
    mediaCacheStats().then(function (s) { el.textContent = statsText(s); });
  }

  window.tchiloClearMediaCache = function () {
    if (!('caches' in window)) { toast('Este dispositivo não guarda cache'); return; }
    var ask = (typeof tchiloConfirm === 'function')
      ? tchiloConfirm({
          title: tr('Libertar espaço'),
          message: tr('Vai apagar os vídeos e imagens guardados neste dispositivo. Voltam a ser descarregados quando precisares. A tua conta e as tuas publicações não são afetadas.'),
          confirmText: tr('Libertar'),
          cancelText: tr('Cancelar')
        })
      : Promise.resolve(true);
    Promise.resolve(ask).then(function (ok) {
      if (!ok) return;
      return mediaCacheStats().then(function (before) {
        return caches.keys().then(function (names) {
          return Promise.all(names.filter(function (n) { return /^tchilo-media/.test(n); })
            .map(function (n) { return caches.delete(n); }));
        }).then(function () {
          renderCache();
          if (before.count) { try { if (typeof showToast === 'function') showToast(tr('Espaço libertado') + ': ' + statsText(before)); } catch (e) {} }
          else toast('Não havia nada para apagar');
        });
      });
    }).catch(function () { toast('Não foi possível libertar espaço'); });
  };

  /* ---------- contas bloqueadas ---------- */
  function renderBlocked() {
    var box = byId('tm-blocked-list');
    if (!box) return;
    var list = [];
    try { list = typeof getBlocked === 'function' ? (getBlocked() || []) : []; } catch (e) {}
    if (!list.length) {
      box.innerHTML = '<div class="tm-empty">' + esc(tr('Não tens contas bloqueadas.')) + '</div>';
      return;
    }
    box.innerHTML = list.map(function (u) {
      return '<div class="settings-item" style="cursor:default"><span>@' + esc(u) + '</span>' +
        '<button type="button" class="tm-unblock" data-user="' + esc(u) + '">' + esc(tr('Desbloquear')) + '</button></div>';
    }).join('');
  }

  function unblock(u) {
    try {
      var list = getBlocked() || [];
      if (list.indexOf(u) >= 0) {
        setBlocked(list.filter(function (x) { return x !== u; }));
        try { renderSettingsToggles(); } catch (e1) {}
        try { renderFeed(); } catch (e2) {}
        try { if (typeof showToast === 'function') showToast(tr('Desbloqueaste') + ' @' + u); } catch (e3) {}
      }
    } catch (e) {}
    renderBlocked();
  }

  document.addEventListener('click', function (ev) {
    var t = ev.target;
    var b = t && t.closest ? t.closest('.tm-unblock') : null;
    if (b) { ev.preventDefault(); unblock(b.getAttribute('data-user')); }
  });

  /* ---------- ajuda: páginas públicas do site ---------- */
  function webBase() {
    try {
      if (typeof window.tchiloLegalUrl === 'function') {
        return window.tchiloLegalUrl('terms').replace(/termos\/$/, '');
      }
    } catch (e) {}
    return 'https://tchilopop.com/';
  }

  window.tchiloOpenWeb = function (path) {
    if (navigator.onLine === false) { toast('Esta funcionalidade precisa de internet. Verifica o Wi-Fi ou os dados móveis e tenta novamente.'); return; }
    var u = webBase() + String(path || '');
    try {
      if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Browser) {
        window.Capacitor.Plugins.Browser.open({ url: u });
        return;
      }
    } catch (e) {}
    try { window.open(u, '_blank', 'noopener,noreferrer'); }
    catch (e2) { location.href = u; }
  };

  function renderVersion() {
    var el = byId('tm-version');
    if (!el) return;
    var plat = 'Web';
    try {
      if (window.Capacitor && typeof window.Capacitor.getPlatform === 'function') {
        var pl = window.Capacitor.getPlatform();
        plat = pl === 'android' ? 'Android' : (pl === 'ios' ? 'iOS' : 'Web');
      }
    } catch (e) {}
    el.textContent = (window.TCHILO_BUILD || '—') + ' · ' + plat;
  }

  /* ---------- navegação ---------- */
  function onNav(name) {
    applyPrefs();
    var n = String(name || '');
    if (n.indexOf('settings-') !== 0) return;
    var key = n.slice(9);
    if (!SCREENS[key]) return;
    renderToggles();
    renderPicks();
    if (key === 'wellbeing') renderWellbeing();
    if (key === 'playback') renderCache();
    if (key === 'blocked') renderBlocked();
    if (key === 'help') renderVersion();
  }

  function hookGoTo() {
    if (typeof window.goTo !== 'function' || window.goTo.__tmWrapped) return;
    var orig = window.goTo;
    var wrapped = function (name) {
      var r = orig.apply(this, arguments);
      try { onNav(name); } catch (e) {}
      return r;
    };
    try {
      Object.keys(orig).forEach(function (k) { wrapped[k] = orig[k]; });
    } catch (e) {}
    wrapped.__tmWrapped = true;
    window.goTo = wrapped;
  }

  /* ---------- arranque ---------- */
  function boot() {
    injectCSS();
    applyPrefs();
    hookGoTo();
  }

  boot();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  [400, 1500, 3500].forEach(function (ms) { setTimeout(boot, ms); });

  pruneUsage();
  setInterval(tick, 5000);

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      hiddenAt = Date.now();
    } else {
      lastTick = Date.now();
      /* 5 min fora da app contam como pausa */
      if (hiddenAt && Date.now() - hiddenAt >= 5 * 60000) breakAcc = 0;
      hiddenAt = 0;
      applyPrefs();
    }
  });
})();

/**
 * Tchilo — NÃO mostrar animação dos 3 pontos ao selecionar foto/vídeo
 * v1
 *
 * Causa: showToast('Foto selecionada' / 'Vídeo pronto...') abria tchiloShowBusy()
 * a ecrã inteiro e muitas vezes não chamava tchiloHideBusy().
 */
(function () {
  'use strict';
  if (window.__tchiloNoBusySelectV1) return;
  window.__tchiloNoBusySelectV1 = true;

  var busyTimer = null;

  function hideBusyNow() {
    try {
      if (typeof tchiloHideBusy === 'function') tchiloHideBusy();
    } catch (e) {}
    try {
      var el = document.getElementById('tchiloBusy');
      if (el) {
        el.classList.remove('show');
        el.style.display = 'none';
        el.setAttribute('aria-hidden', 'true');
      }
    } catch (e2) {}
    /* limpar botões galeria presos em loading */
    try {
      ['galleryBtn', 'tchiloBtnGal', 'tchiloBtnCam', 'mediaInput'].forEach(function (id) {
        var b = document.getElementById(id);
        if (!b) return;
        b.classList.remove('tchilo-btn-loading');
        b.disabled = false;
        if (b.dataset && b.dataset.tchiloOriginal) {
          b.innerHTML = b.dataset.tchiloOriginal;
          delete b.dataset.tchiloOriginal;
        }
      });
      document.querySelectorAll('.tchilo-btn-loading').forEach(function (b) {
        /* não mexer no publish durante upload real */
        if (b.classList.contains('publish-btn')) return;
        b.classList.remove('tchilo-btn-loading');
        b.disabled = false;
      });
    } catch (e3) {}
  }

  function isSelectMsg(msg) {
    var m = String(msg || '').toLowerCase();
    return /foto selecionada|vídeo selecionado|video selecionado|fotos selecionadas|pronto a publicar|vídeo pronto|video pronto|foto pronta|reel pronto|selecionad/.test(
      m
    );
  }

  function isLongProcessMsg(msg) {
    var m = String(msg || '').toLowerCase();
    /* só processos longos reais — NÃO seleção de galeria */
    return /a publicar|a enviar|a carregar|a baixar|a aplicar|vinheta|transferência/.test(m);
  }

  /* 1) showToast: seleção NÃO abre busy */
  function patchToast() {
    if (typeof window.showToast !== 'function') return;
    if (window.showToast.__noBusySelect) return;
    var orig = window.showToast;
    window.showToast = function (msg) {
      if (isSelectMsg(msg)) {
        hideBusyNow();
        /* toast normal curto, sem overlay */
        try {
          var t = document.getElementById('toast');
          if (t) {
            t.textContent = msg;
            t.classList.add('show');
            clearTimeout(t._timer);
            t._timer = setTimeout(function () {
              t.classList.remove('show');
            }, 1600);
          }
        } catch (e) {}
        return;
      }
      var r = orig.apply(this, arguments);
      /* se for processo longo, auto-esconder busy ao fim de 12s por segurança */
      if (isLongProcessMsg(msg)) {
        clearTimeout(busyTimer);
        busyTimer = setTimeout(hideBusyNow, 12000);
      }
      return r;
    };
    window.showToast.__noBusySelect = true;
  }

  /* 2) tchiloShowBusy: nunca ficar para sempre */
  function patchShowBusy() {
    if (typeof window.tchiloShowBusy !== 'function') return;
    if (window.tchiloShowBusy.__noBusySelect) return;
    var orig = window.tchiloShowBusy;
    window.tchiloShowBusy = function () {
      /* Se o ecrã de criar post está ativo e só se selecionou media, não mostrar */
      try {
        var create = document.getElementById('screen-create');
        var activeCreate =
          create &&
          (create.classList.contains('active') || create.style.display === 'block');
        if (activeCreate) {
          /* permitir busy só no publish-btn loading, não overlay global na seleção */
          var pub = document.querySelector('.publish-btn.tchilo-btn-loading');
          if (!pub) {
            hideBusyNow();
            return;
          }
        }
      } catch (e) {}
      var r = orig.apply(this, arguments);
      clearTimeout(busyTimer);
      busyTimer = setTimeout(hideBusyNow, 10000);
      return r;
    };
    window.tchiloShowBusy.__noBusySelect = true;
  }

  /* 3) onMediaPicked: sempre esconder busy no fim */
  function patchOnMediaPicked() {
    if (typeof window.onMediaPicked !== 'function') return;
    if (window.onMediaPicked.__noBusySelect) return;
    var orig = window.onMediaPicked;
    window.onMediaPicked = function (event) {
      hideBusyNow();
      var r = orig.apply(this, arguments);
      hideBusyNow();
      setTimeout(hideBusyNow, 50);
      setTimeout(hideBusyNow, 300);
      setTimeout(hideBusyNow, 800);
      return r;
    };
    window.onMediaPicked.__noBusySelect = true;
  }

  /* 4) input change na galeria */
  function wireMediaInput() {
    var input = document.getElementById('mediaInput');
    if (!input || input.__noBusySelect) return;
    input.__noBusySelect = true;
    input.addEventListener(
      'change',
      function () {
        hideBusyNow();
        setTimeout(hideBusyNow, 100);
        setTimeout(hideBusyNow, 500);
      },
      true
    );
  }

  /* 5) tchiloSetLoading na galeria = nunca */
  function patchSetLoading() {
    if (typeof window.tchiloSetLoading !== 'function') return;
    if (window.tchiloSetLoading.__noBusySelect) return;
    var orig = window.tchiloSetLoading;
    window.tchiloSetLoading = function (btn, on) {
      if (
        btn &&
        (btn.id === 'galleryBtn' ||
          btn.id === 'tchiloBtnGal' ||
          btn.id === 'tchiloBtnCam' ||
          btn.id === 'faceFxOpenBtn')
      ) {
        try {
          btn.classList.remove('tchilo-btn-loading');
          btn.disabled = false;
          if (btn.dataset && btn.dataset.tchiloOriginal) {
            btn.innerHTML = btn.dataset.tchiloOriginal;
            delete btn.dataset.tchiloOriginal;
          }
        } catch (e) {}
        if (on) hideBusyNow();
        return;
      }
      return orig.apply(this, arguments);
    };
    window.tchiloSetLoading.__noBusySelect = true;
  }

  function boot() {
    patchToast();
    patchShowBusy();
    patchOnMediaPicked();
    patchSetLoading();
    wireMediaInput();
    hideBusyNow();
  }

  boot();
  setTimeout(boot, 300);
  setTimeout(boot, 1000);
  setTimeout(boot, 2500);
  /* segurança: se busy ficar visível sem publish a decorrer, limpar */
  setInterval(function () {
    try {
      var el = document.getElementById('tchiloBusy');
      if (!el) return;
      var shown =
        el.classList.contains('show') ||
        el.style.display === 'flex' ||
        window.getComputedStyle(el).display === 'flex';
      if (!shown) return;
      var publishing = document.querySelector('.publish-btn.tchilo-btn-loading');
      if (!publishing) hideBusyNow();
    } catch (e) {}
  }, 4000);
})();

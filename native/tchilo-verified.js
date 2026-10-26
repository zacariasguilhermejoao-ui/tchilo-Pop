/**
 * Tchilo — Selo verificado loader v5
 * Carrega a lógica completa + força linha fina no cabeçalho
 */
(function () {
  'use strict';
  if (window.__tchiloVerifiedLoaderV5) return;
  window.__tchiloVerifiedLoaderV5 = true;

  /* Linha fina + botões premium legíveis (reforço) */
  var st = document.getElementById('tchiloVerifiedBorderCSS');
  if (!st) {
    st = document.createElement('style');
    st.id = 'tchiloVerifiedBorderCSS';
    (document.head || document.documentElement).appendChild(st);
  }
  st.textContent =
    '#tchiloVerifiedSheet .tv-top,' +
    '#tchiloPremiumSheet .tp-top{' +
    'border-bottom:1px solid var(--line,rgba(0,0,0,.12))!important;' +
    'border-bottom-width:1px!important;' +
    'box-shadow:none!important;}' +
    /* botão de voltar igual ao do resto da app (preto, sem azul do iOS) */
    '#tchiloVerifiedSheet .tv-back,#tchiloPremiumSheet .tp-back,#tchiloCoinsSheet .tc-back,#tchiloSaldoSheet .ts-back,' +
    '#tchiloAdsPro .ap-back,#tchiloSupport .su-back{' +
    'color:var(--ink,#0B0B0C)!important;width:36px!important;height:36px!important;padding:0!important;' +
    'background:transparent!important;border:0!important;border-radius:50%!important;box-shadow:none!important;' +
    '-webkit-appearance:none;appearance:none;display:flex!important;align-items:center;justify-content:center;}' +
    '#tchiloVerifiedSheet .tv-back svg,#tchiloPremiumSheet .tp-back svg,#tchiloCoinsSheet .tc-back svg,' +
    '#tchiloSaldoSheet .ts-back svg,#tchiloAdsPro .ap-back svg,#tchiloSupport .su-back svg{' +
    'width:18px!important;height:18px!important;color:inherit!important;stroke:currentColor!important;stroke-width:2.5!important;}' +
    '#tchiloPremiumSheet .pay{' +
    'background:#0B0B0C!important;color:#FFFFFF!important;}' +
    '#tchiloPremiumSheet .close{' +
    'background:#fff!important;color:#0B0B0C!important;' +
    'border:2px solid rgba(11,11,12,.12)!important;}';

  /* Se a app já tiver tchiloOpenVerified (index/outro script), não recarregar */
  if (typeof window.tchiloOpenVerified === 'function') return;

  var SRC =
    'https://cdn.jsdelivr.net/gh/zacariasguilhermejoao-ui/tchilo-Pop@b453b004a643bbdcdb1e454b05eb2f2039a03bae/native/tchilo-verified.js';
  var s = document.createElement('script');
  s.src = SRC;
  s.async = true;
  s.onload = function () {
    /* reaplicar linha fina após o script antigo (tinha 2.5px) */
    st.textContent = st.textContent;
  };
  (document.head || document.documentElement).appendChild(s);
})();

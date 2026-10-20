/**
 * Ícone SMS do topo = SVG exacto do index (balão 3 pontos)
 * v8 — DESLIGADO de propósito.
 *
 * Antes este script (v7) reescrevia o ícone e o estilo do botão de mensagens a cada
 * mudança na página, e entrava em conflito com o bloqueio que já existe no próprio
 * index.html (tchilo-icon-lock-js / tchilo-icon-owner-js): um repunha o ícone, o outro
 * mudava-o de novo, em ciclo. O dono do ícone é só o index; este ficheiro não mexe em nada.
 */
(function () {
  'use strict';
  window.__tchiloMsgIconLockV7 = true;
})();

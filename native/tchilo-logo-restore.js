/**
 * NO-OP — não mexe no logo/live-icon do index.html
 * O index é a fonte da verdade para o ícone do topbar.
 */
(function () {
  'use strict';
  if (window.__tchiloLogoRestoreV3) return;
  window.__tchiloLogoRestoreV3 = true;
  /* intencionalmente vazio: não altera src, size, onclick nem estilo do .logo-img */
})();

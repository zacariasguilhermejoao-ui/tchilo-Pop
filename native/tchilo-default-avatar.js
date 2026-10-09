/** NO-OP — fallback de avatar só no index */
(function () {
  'use strict';
  if (window.__tchiloDefaultAvatarNoop) return;
  window.__tchiloDefaultAvatarNoop = true;
  window.__tchiloDefaultAvatarV1 = true;
})();

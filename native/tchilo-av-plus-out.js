/**
 * Tchilo — + fora do círculo, tamanho legível
 */
(function () {
  if (window.__tchiloAvPlusOutV2) return;
  window.__tchiloAvPlusOutV2 = true;
  var st = document.createElement('style');
  st.id = 'tchiloAvPlusOutCSS';
  st.textContent =
    '.profile-avatar{overflow:visible!important;position:relative!important;}' +
    '.tchilo-av-add{right:-12px!important;bottom:-12px!important;z-index:20!important;' +
    'width:36px!important;height:36px!important;display:flex!important;' +
    'visibility:visible!important;opacity:1!important;animation:none!important;}';
  (document.head || document.documentElement).appendChild(st);
  function fix() {
    document.querySelectorAll('.profile-avatar').forEach(function (el) {
      try {
        el.style.overflow = 'visible';
      } catch (e) {}
    });
  }
  fix();
  setTimeout(fix, 400);
  setTimeout(fix, 1200);
})();

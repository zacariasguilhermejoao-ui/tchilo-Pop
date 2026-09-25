/**
 * Tchilo — + fora do círculo (override)
 */
(function () {
  if (window.__tchiloAvPlusOut) return;
  window.__tchiloAvPlusOut = true;
  var st = document.createElement('style');
  st.id = 'tchiloAvPlusOutCSS';
  st.textContent =
    '.profile-avatar{overflow:visible!important;position:relative!important;}' +
    '.tchilo-av-add{right:-10px!important;bottom:-10px!important;z-index:9!important;' +
    'width:34px!important;height:34px!important;animation:none!important;}';
  (document.head || document.documentElement).appendChild(st);
  function fix() {
    document.querySelectorAll('.profile-avatar').forEach(function (el) {
      try {
        el.style.overflow = 'visible';
      } catch (e) {}
    });
  }
  fix();
  setTimeout(fix, 300);
  setTimeout(fix, 1000);
  setInterval(fix, 2000);
})();

/** tchilo-Pop — face-fx-pro desativado (efeitos PNG tomam o lugar) */
(function () {
  'use strict';
  function hide() {
    var pro = document.getElementById('tchiloFxProBar');
    if (pro) pro.style.display = 'none';
    var labels = document.querySelectorAll('#tchiloFaceFx .fx-bottom > div');
    labels.forEach(function (el) {
      if (/lentes\s*pro/i.test(el.textContent || '')) el.style.display = 'none';
    });
  }
  function boot() {
    hide();
    setInterval(hide, 1500);
    try {
      new MutationObserver(hide).observe(document.body, { childList: true, subtree: true });
    } catch (e) {}
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();

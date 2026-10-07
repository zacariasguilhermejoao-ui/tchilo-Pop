/** media-editor bootstrap — loads full editor from known-good commit */
(function () {
  'use strict';
  if (window.__tchiloMediaEditorBoot) return;
  window.__tchiloMediaEditorBoot = true;
  var SHA = 'acac5780f3459d23c0c9dd06e46340567fbb685b';
  var URL = 'https://raw.githubusercontent.com/zacariasguilhermejoao-ui/tchilo-Pop/' + SHA + '/native/media-editor.js';
  var s = document.createElement('script');
  s.src = URL + '?t=' + Date.now();
  s.async = false;
  s.onerror = function () {
    console.warn('[tchilo] media-editor load failed');
  };
  (document.head || document.documentElement).appendChild(s);
})();

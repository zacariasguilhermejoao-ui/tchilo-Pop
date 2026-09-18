(function () {
  "use strict";
  function load(src, next) {
    var s = document.createElement("script");
    s.src = src;
    s.onload = next;
    s.onerror = next;
    document.head.appendChild(s);
  }
  load("native/sf-body-0.js?v=3", function () {
    load("native/sf-body-1.js?v=3");
  });
})();

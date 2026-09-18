(function () {
  "use strict";
  function load(src, next) {
    var s = document.createElement("script");
    s.src = src;
    s.onload = next;
    s.onerror = function () { console.error("fail", src); next(); };
    document.head.appendChild(s);
  }
  load("native/sf-body-0.js?v=4", function () {
    load("native/sf-body-1.js?v=4", function () {
      load("native/sf-body-2.js?v=4");
    });
  });
})();

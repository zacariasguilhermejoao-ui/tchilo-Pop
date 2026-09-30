(function(){
  'use strict';
  try {
    var parts = window.__TCHILO_LOGO_B64_PARTS || [];
    if (!parts.length) return;
    var b64 = parts.join('');
    window.__TCHILO_LOGO_DATA_URL = 'data:image/png;base64,' + b64;
    var im = new Image();
    im.onload = function(){ window.__tchiloLogoImageCache = im; };
    im.src = window.__TCHILO_LOGO_DATA_URL;
  } catch (e) {}
})();

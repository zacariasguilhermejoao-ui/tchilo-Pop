/** Tchilo logo real (PNG do utilizador) para o QR — usa ficheiro estático */
(function () {
  var logoUrl = (location.origin || '') + '/native/tchilo-logo.png';
  window.TCHILO_LOGO_DATA = logoUrl;
  try {
    var img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = logoUrl;
  } catch (e) {}
})();

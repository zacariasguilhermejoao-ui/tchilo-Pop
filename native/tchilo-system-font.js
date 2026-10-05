(function(){
  /* Tchilo: force native system UI font (San Francisco / Roboto / Segoe UI / etc.) */
  if (document.getElementById("tchiloSystemFont")) return;
  var st = document.createElement("style");
  st.id = "tchiloSystemFont";
  st.textContent =
    "html,body,#appFrame,.app,.screen,button,input,textarea,select,.btn,.act,.nav,.topbar,.bubble," +
    ".post,.profile,.sheet,.modal,.panel,.chip,.tab,.label,.caption,.msg,.composer{" +
    "font-family:system-ui,-apple-system,BlinkMacSystemFont,\"Segoe UI\",Roboto,Oxygen,Ubuntu,Cantarell,\"Helvetica Neue\",Arial,sans-serif!important}" +
    "/* keep Anton only for intentional display titles */";
  (document.head || document.documentElement).appendChild(st);
})();

/** Monta logotipo real Tchilo */
(function(){
  function join(){
    var p=window.__TCHILO_LOGO_P;
    if(!p)return false;
    for(var i=0;i<6;i++){if(typeof p[i]!=="string")return false;}
    window.TCHILO_LOGO_DATA="data:image/png;base64,"+p.join("");
    return true;
  }
  if(!join()){var n=0;var t=setInterval(function(){n++;if(join()||n>50)clearInterval(t);},80);}
})();

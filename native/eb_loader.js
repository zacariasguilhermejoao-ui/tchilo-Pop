(function(){
  var n=13, parts=[], done=0;
  function finish(){
    window.TchiloFxPngAssets=window.TchiloFxPngAssets||{};
    window.TchiloFxPngAssets["oculos_estrela_neon.png"]="data:image/webp;base64,"+parts.join("");
  }
  for(var i=0;i<n;i++){
    (function(i){
      var x=new XMLHttpRequest();
      x.open("GET","native/eb"+i+".txt?v=3",true);
      x.onload=function(){ parts[i]=x.responseText||""; if(++done===n) finish(); };
      x.onerror=function(){ parts[i]=""; if(++done===n) finish(); };
      x.send();
    })(i);
  }
})();

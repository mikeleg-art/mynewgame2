(function(){
  var cs=getComputedStyle(document.documentElement);
  var CELL=parseFloat(cs.getPropertyValue("--cell")),GAP=parseFloat(cs.getPropertyValue("--gap"));
  var MINI=parseFloat(cs.getPropertyValue("--mini")),MGAP=parseFloat(cs.getPropertyValue("--mgap"));
  var pitch=CELL+GAP,mpitch=MINI+MGAP,LIFT=Math.max(48,CELL*1.35);
  var grid=document.querySelector("#grid").getBoundingClientRect();
  function pev(type,x,y){return new PointerEvent(type,{bubbles:true,cancelable:true,clientX:x,clientY:y,pointerId:1,pointerType:"mouse",isPrimary:true});}
  var slots=[].slice.call(document.querySelectorAll(".slot"));
  var scoreEl=document.getElementById("score");
  var placed=0,cleared=0,startScore=parseInt(scoreEl.textContent,10)||0;
  for(var step=0;step<60;step++){
    var si=-1,i;
    for(i=0;i<3;i++){if(slots[i].querySelector(".piece")){si=i;break;}}
    if(si<0)break;
    var before=parseInt(scoreEl.textContent,10)||0;
    var piece=slots[si].querySelector(".piece");
    var gems=[].slice.call(piece.querySelectorAll(".gem"));
    if(gems.length===0)break;
    var wC=1,hC=1;
    gems.forEach(function(g){
      wC=Math.max(wC,Math.round(g.offsetLeft/mpitch)+1);
      hC=Math.max(hC,Math.round(g.offsetTop/mpitch)+1);
    });
    var W=wC*pitch-GAP,H=hC*pitch-GAP;
    var sr=slots[si].getBoundingClientRect();
    var sx=sr.left+sr.width/2,sy=sr.top+sr.height/2;
    var cands=[];
    for(var r=0;r<=8-hC;r++)for(var c=0;c<=8-wC;c++)cands.push([r,c]);
    cands.sort(function(){return Math.random()-0.5;});
    var okPlace=false;
    for(var t=0;t<cands.length;t++){
      var rr=cands[t][0],cc=cands[t][1];
      var px=grid.left+cc*pitch+W/2;
      var py=grid.top+rr*pitch+H+LIFT;
      slots[si].dispatchEvent(pev("pointerdown",sx,sy));
      window.dispatchEvent(pev("pointermove",px,py));
      var oks=document.querySelectorAll("#previewLayer .ptile.ok").length;
      if(oks===gems.length){
        window.dispatchEvent(pev("pointerup",px,py));
        placed++;okPlace=true;
        var after=parseInt(scoreEl.textContent,10)||0;
        if(after>before+gems.length)cleared++;
        break;
      }
      window.dispatchEvent(pev("pointercancel",px,py));
    }
    if(!okPlace)break;
  }
  return JSON.stringify({placed:placed,clears:cleared,scoreStart:startScore,scoreNow:scoreEl.textContent,theme:document.body.getAttribute("data-theme"),dyingGems:document.querySelectorAll("#grid .gem.dying").length});
})()
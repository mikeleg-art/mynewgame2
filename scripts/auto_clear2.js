(function(){
  var cs=getComputedStyle(document.documentElement);
  var CELL=parseFloat(cs.getPropertyValue("--cell")),GAP=parseFloat(cs.getPropertyValue("--gap"));
  var pitch=CELL+GAP,LIFT=Math.max(48,CELL*1.35);
  var grid=document.querySelector("#grid").getBoundingClientRect();
  function pev(type,x,y){return new PointerEvent(type,{bubbles:true,cancelable:true,clientX:x,clientY:y,pointerId:1,pointerType:"mouse",isPrimary:true});}
  var slots=[].slice.call(document.querySelectorAll(".slot"));
  var cells=[].slice.call(document.querySelectorAll("#grid .cell"));
  function occupancy(){
    var occ=[];
    for(var i=0;i<64;i++){occ.push(cells[i].querySelector(".gem:not(.dying)")?1:0);}
    return occ;
  }
  function tryPlace(si,rr,cc,wC,hC,gemCount){
    var W=wC*pitch-GAP,H=hC*pitch-GAP;
    var sr=slots[si].getBoundingClientRect();
    var px=grid.left+cc*pitch+W/2;
    var py=grid.top+rr*pitch+H+LIFT;
    slots[si].dispatchEvent(pev("pointerdown",sr.left+sr.width/2,sr.top+sr.height/2));
    window.dispatchEvent(pev("pointermove",px,py));
    var oks=document.querySelectorAll("#previewLayer .ptile.ok").length;
    if(oks===gemCount){window.dispatchEvent(pev("pointerup",px,py));return true;}
    window.dispatchEvent(pev("pointercancel",px,py));
    return false;
  }
  function pieceDims(piece){
    var gems=[].slice.call(piece.querySelectorAll(".gem"));
    if(gems.length===0)return null;
    var cells2=[];
    gems.forEach(function(g){
      cells2.push([Math.round(g.offsetTop/g2p(g)),Math.round(g.offsetLeft/g2p(g))]);
    });
    function g2p(g){return 1;}
    return {n:gems.length,gems:gems};
  }
  var scoreEl=document.getElementById("score");
  var log=[],clears=0;
  for(var step=0;step<30;step++){
    var occ=occupancy();
    var bestRow=0,bestFill=-1,ri,ci;
    for(ri=0;ri<8;ri++){var f=0;for(ci=0;ci<8;ci++)f+=occ[ri*8+ci];if(f>bestFill&&f<8){bestFill=f;bestRow=ri;}}
    var placed=false;
    for(var si=0;si<3&&!placed;si++){
      var piece=slots[si].querySelector(".piece");
      if(!piece)continue;
      var pg=[].slice.call(piece.querySelectorAll(".gem"));
      var mp=parseFloat(cs.getPropertyValue("--mini"))+parseFloat(cs.getPropertyValue("--mgap"));
      var cs2=getComputedStyle(document.documentElement);
      var mp2=parseFloat(cs2.getPropertyValue("--mini"))+parseFloat(cs2.getPropertyValue("--mgap"));
      var wC=1,hC=1,cellList=[];
      pg.forEach(function(g){
        var gr=Math.round(g.offsetTop/mp2),gc=Math.round(g.offsetLeft/mp2);
        wC=Math.max(wC,gc+1);hC=Math.max(hC,gr+1);
        cellList.push([gr,gc]);
      });
      for(var cc=0;cc<=8-wC&&!placed;cc++){
        var covered=false,valid=true;
        for(var k=0;k<cellList.length;k++){
          var rAbs=bestRow,cAbs=cc+cellList[k][1];
          if(cellList[k][0]===0){if(occ[bestRow*8+cAbs]===0)covered=true;}
          else{var r2=bestRow+cellList[k][0];if(r2>7||occ[r2*8+cAbs])valid=false;}
        }
        if(!covered||!valid)continue;
        if(tryPlace(si,bestRow,cc,wC,hC,pg.length)){
          placed=true;
          var dying=document.querySelectorAll("#grid .gem.dying").length;
          if(dying>0){clears++;log.push("CLEAR! dying="+dying);}
          break;
        }
      }
    }
    if(!placed){
      for(var si2=0;si2<3&&!placed;si2++){
        var piece2=slots[si2].querySelector(".piece");
        if(!piece2)continue;
        var pg2=[].slice.call(piece2.querySelectorAll(".gem"));
        var cs3=getComputedStyle(document.documentElement);
        var mp3=parseFloat(cs3.getPropertyValue("--mini"))+parseFloat(cs3.getPropertyValue("--mgap"));
        var wC2=1,hC2=1;
        pg2.forEach(function(g){wC2=Math.max(wC2,Math.round(g.offsetLeft/mp3)+1);hC2=Math.max(hC2,Math.round(g.offsetTop/mp3)+1);});
        for(var rr=0;rr<=8-hC2&&!placed;rr++)for(var cc2=0;cc2<=8-wC2&&!placed;cc2++){
          if(tryPlace(si2,rr,cc2,wC2,hC2,pg2.length)){placed=true;}
        }
      }
    }
    if(!placed)break;
  }
  return JSON.stringify({clears:clears,score:scoreEl.textContent,theme:document.body.getAttribute("data-theme"),log:log});
})()
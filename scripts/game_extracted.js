(function(){
'use strict';
/* ============ constants & data ============ */
var CELLN=40,GAPN=5,MININ=16,MGIN=2;
var grid=[],score=0,best=0,bestPrev=0,combo=0,over=false,pid=0;
var tray=[null,null,null];
var K_BEST='cp_best',K_MUTE='cp_mute';

var GEM_FX={
  rose:['#ffd9e6','#ff8ab4','#ffffff'],
  amethyst:['#e6d2ff','#ab74f7','#ffffff'],
  aqua:['#cdf2ff','#5ccbf1','#ffffff'],
  citrine:['#ffedb0','#ffc44d','#ffffff'],
  mint:['#d2f8e6','#63dda8','#ffffff'],
  coral:['#ffd4c4','#ff8b68','#ffffff'],
  sapphire:['#d0dbff','#718ff7','#ffffff']
};
var GEM_KEYS=Object.keys(GEM_FX);
var GEM_PRE={
  rose:'rgba(255,138,180,.5)',amethyst:'rgba(171,116,247,.5)',aqua:'rgba(92,203,241,.5)',
  citrine:'rgba(255,196,77,.55)',mint:'rgba(99,221,168,.5)',coral:'rgba(255,139,104,.5)',
  sapphire:'rgba(113,143,247,.5)'
};
var THEMES=['rose','amethyst','aqua','citrine','mint','opal'];
var THEME_NAME={rose:'Rose Quartz Garden',amethyst:'Amethyst Dream',aqua:'Aquamarine Lagoon',
  citrine:'Citrine Sunrise',mint:'Mint Crystal Cave',opal:'Opal Night'};
var TG_HEAD={rose:'#ffcfe0',amethyst:'#dcc5ff',aqua:'#c2e9fb',citrine:'#ffe4a8',mint:'#c4f2dc',opal:'#2c2350'};
var themeIdx=0;

/* ============ shape library (Block Blast style) ============ */
var SHAPES=(function(){
  var S=[];
  function add(cells,wt){
    var w=0,h=0;
    cells.forEach(function(rc){if(rc[1]+1>w)w=rc[1]+1;if(rc[0]+1>h)h=rc[0]+1;});
    S.push({cells:cells,w:w,h:h,wt:wt});
  }
  add([[0,0]],3);
  add([[0,0],[0,1]],2.4); add([[0,0],[1,0]],2.4);
  add([[0,0],[0,1],[0,2]],2.2); add([[0,0],[1,0],[2,0]],2.2);
  add([[0,0],[0,1],[0,2],[0,3]],1.5); add([[0,0],[1,0],[2,0],[3,0]],1.5);
  add([[0,0],[0,1],[0,2],[0,3],[0,4]],.9); add([[0,0],[1,0],[2,0],[3,0],[4,0]],.9);
  add([[0,0],[0,1],[1,0],[1,1]],2.6);
  add([[0,0],[0,1],[0,2],[1,0],[1,1],[1,2]],.9);
  add([[0,0],[0,1],[1,0],[1,1],[2,0],[2,1]],.9);
  add([[0,0],[0,1],[0,2],[1,0],[1,1],[1,2],[2,0],[2,1],[2,2]],.7);
  add([[0,0],[1,0],[1,1]],1.7); add([[0,0],[0,1],[1,1]],1.7);
  add([[0,0],[0,1],[1,0]],1.7); add([[0,1],[1,0],[1,1]],1.7);
  add([[0,0],[1,0],[2,0],[2,1],[2,2]],.9); add([[0,0],[0,1],[0,2],[1,2],[2,2]],.9);
  add([[0,2],[1,2],[2,0],[2,1],[2,2]],.9); add([[0,0],[0,1],[0,2],[1,0],[2,0]],.9);
  add([[0,0],[0,1],[0,2],[1,1]],1.1); add([[1,0],[1,1],[1,2],[0,1]],1.1);
  add([[0,0],[1,0],[2,0],[1,1]],1.1); add([[0,1],[1,0],[1,1],[2,1]],1.1);
  add([[0,1],[0,2],[1,0],[1,1]],.8); add([[0,0],[0,1],[1,1],[1,2]],.8);
  add([[0,0],[1,0],[1,1],[2,1]],.8); add([[0,1],[1,0],[1,1],[2,0]],.8);
  add([[0,1],[1,0],[1,1],[1,2],[2,1]],.7);
  return S;
})();
function randShape(){
  var tot=0,i;for(i=0;i<SHAPES.length;i++)tot+=SHAPES[i].wt;
  var r=Math.random()*tot;
  for(i=0;i<SHAPES.length;i++){r-=SHAPES[i].wt;if(r<=0)return SHAPES[i];}
  return SHAPES[0];
}
function randColor(){return GEM_KEYS[(Math.random()*GEM_KEYS.length)|0];}
function newPiece(){pid++;return {shape:randShape(),color:randColor(),id:pid};}

/* ============ dom refs ============ */
var gridEl=document.getElementById('grid');
var previewLayer=document.createElement('div');previewLayer.id='previewLayer';
var slotEls=[].slice.call(document.querySelectorAll('.slot'));
var scoreEl=document.getElementById('score'),bestEl=document.getElementById('best');
var dragLayer=document.getElementById('dragLayer');
var bgA=document.getElementById('bgA'),bgB=document.getElementById('bgB');
var toastEl=document.getElementById('toast'),comboEl=document.getElementById('combo'),flashEl=document.getElementById('flash');
var appEl=document.getElementById('app');
var overEl=document.getElementById('over'),finalScoreEl=document.getElementById('finalScore');
var finalBestEl=document.getElementById('finalBest'),newBestEl=document.getElementById('newBest');
var againBtn=document.getElementById('againBtn'),sndBtn=document.getElementById('sndBtn');

/* ============ telegram & haptics ============ */
var tg=null;
try{tg=(window.Telegram&&window.Telegram.WebApp)?window.Telegram.WebApp:null;}catch(e){tg=null;}
function initTelegram(){
  if(!tg)return;
  try{
    tg.ready();tg.expand();
    if(tg.setHeaderColor)tg.setHeaderColor(TG_HEAD[THEMES[themeIdx]]);
    if(tg.setBackgroundColor)tg.setBackgroundColor(TG_HEAD[THEMES[themeIdx]]);
    if(tg.enableClosingConfirmation)tg.enableClosingConfirmation();
  }catch(e){}
}
function haptic(kind){
  try{
    if(tg&&tg.HapticFeedback){
      if(kind==='success')tg.HapticFeedback.notificationOccurred('success');
      else if(kind==='heavy')tg.HapticFeedback.impactOccurred('heavy');
      else if(kind==='medium')tg.HapticFeedback.impactOccurred('medium');
      else tg.HapticFeedback.impactOccurred('light');
    }else if(navigator.vibrate){navigator.vibrate(kind==='light'?10:(kind==='medium'?22:38));}
  }catch(e){}
}

/* ============ storage ============ */
function lsGet(k){try{return localStorage.getItem(k);}catch(e){return null;}}
function lsSet(k,v){try{localStorage.setItem(k,v);}catch(e){}}

/* ============ sound (WebAudio synth, no assets) ============ */
var AC=null,muted=lsGet(K_MUTE)==='1';
function ac(){
  if(!AC){try{AC=new (window.AudioContext||window.webkitAudioContext)();}catch(e){return null;}}
  if(AC&&AC.state==='suspended')AC.resume();
  return AC;
}
function tone(f,dur,type,vol,delay,slideTo){
  if(muted)return;var a=ac();if(!a)return;
  var t0=a.currentTime+(delay||0);
  var o=a.createOscillator(),g=a.createGain();
  o.type=type||'sine';o.frequency.setValueAtTime(f,t0);
  if(slideTo)o.frequency.exponentialRampToValueAtTime(slideTo,t0+dur);
  g.gain.setValueAtTime(0.0001,t0);
  g.gain.exponentialRampToValueAtTime(vol||.15,t0+0.015);
  g.gain.exponentialRampToValueAtTime(0.0001,t0+dur);
  o.connect(g);g.connect(a.destination);
  o.start(t0);o.stop(t0+dur+0.05);
}
function sndPlace(){tone(300+Math.random()*80,.1,'triangle',.14,0,520);}
function sndClear(lines,cmb){
  var base=[523.25,659.25,783.99,1046.5,1318.5,1568,2093];
  var n=Math.min(base.length,lines+2),i;
  for(i=0;i<n;i++)tone(base[i],.16,'triangle',.15,i*0.055);
  if(cmb>1)tone(base[Math.min(base.length-1,n)],.3,'sine',.12,n*0.055);
}
function sndOver(){[392,329.63,261.63,196].forEach(function(f,i){tone(f,.22,'sine',.14,i*0.16);});}
function applyMute(){sndBtn.classList.toggle('muted',muted);}
/* ============ board build & render ============ */
var cellEls=[];
function buildCells(){
  for(var r=0;r<8;r++)for(var c=0;c<8;c++){
    var d=document.createElement('div');
    d.className='cell';
    gridEl.appendChild(d);
    cellEls.push(d);
  }
  gridEl.appendChild(previewLayer);
}
function renderBoard(){
  for(var r=0;r<8;r++)for(var c=0;c<8;c++){
    var idx=r*8+c,cellEl=cellEls[idx],v=grid[r][c];
    var gem=cellEl.querySelector('.gem:not(.dying)');
    if(v){
      if(!gem){
        gem=document.createElement('div');
        gem.className='gem g-'+v+' pop';
        gem.style.setProperty('--td',(Math.random()*2).toFixed(2)+'s');
        gem.dataset.c=v;
        cellEl.appendChild(gem);
      }else if(gem.dataset.c!==v){
        gem.className='gem g-'+v+' pop';
        gem.style.setProperty('--td',(Math.random()*2).toFixed(2)+'s');
        gem.dataset.c=v;
      }
    }else if(gem){gem.remove();}
  }
}
function pieceEl(p,cell,gap){
  var el=document.createElement('div');
  el.className='piece';
  var pitch=cell+gap;
  el.style.width=(p.shape.w*pitch-gap)+'px';
  el.style.height=(p.shape.h*pitch-gap)+'px';
  p.shape.cells.forEach(function(rc){
    var g=document.createElement('div');
    g.className='gem g-'+p.color;
    g.style.left=(rc[1]*pitch)+'px';
    g.style.top=(rc[0]*pitch)+'px';
    g.style.width=cell+'px';
    g.style.height=cell+'px';
    g.style.setProperty('--td',(Math.random()*2).toFixed(2)+'s');
    el.appendChild(g);
  });
  return el;
}
function refreshTray(){
  tray.forEach(function(p,i){
    var slot=slotEls[i];
    slot.innerHTML='';
    slot.classList.remove('no-fit');
    if(!p)return;
    slot.appendChild(pieceEl(p,MININ,MGIN));
    if(!canPlaceAnywhere(p.shape))slot.classList.add('no-fit');
  });
}

/* ============ placement rules ============ */
function canPlace(shape,row,col){
  for(var i=0;i<shape.cells.length;i++){
    var r=row+shape.cells[i][0],c=col+shape.cells[i][1];
    if(r<0||r>7||c<0||c>7)return false;
    if(grid[r][c])return false;
  }
  return true;
}
function canPlaceAnywhere(shape){
  for(var r=0;r<=8-shape.h;r++)for(var c=0;c<=8-shape.w;c++){
    if(canPlace(shape,r,c))return true;
  }
  return false;
}
function anyMoves(){
  return tray.some(function(p){return p&&canPlaceAnywhere(p.shape);});
}
function findLines(){
  var rows=[],cols=[],r,c,full;
  for(r=0;r<8;r++){full=true;for(c=0;c<8;c++)if(!grid[r][c]){full=false;break;}if(full)rows.push(r);}
  for(c=0;c<8;c++){full=true;for(r=0;r<8;r++)if(!grid[r][c]){full=false;break;}if(full)cols.push(c);}
  return {rows:rows,cols:cols,n:rows.length+cols.length};
}

/* ============ layout sizing ============ */
function layout(){
  var vw=Math.min(document.documentElement.clientWidth,520);
  var maxBoardW=vw-28-18;
  var b=Math.max(232,Math.min(maxBoardW,(window.innerHeight-130)/1.6,412));
  GAPN=Math.max(3,Math.round(b/8*0.09));
  CELLN=Math.floor((b-GAPN*7)/8);
  MININ=Math.max(12,Math.round(CELLN*0.42));
  MGIN=Math.max(2,Math.round(MININ*0.12));
  var rs=document.documentElement.style;
  rs.setProperty('--cell',CELLN+'px');
  rs.setProperty('--gap',GAPN+'px');
  rs.setProperty('--mini',MININ+'px');
  rs.setProperty('--mgap',MGIN+'px');
  resizeFx();
}
function cellCenter(r,c){
  var gr=gridEl.getBoundingClientRect();
  return {x:gr.left+c*(CELLN+GAPN)+CELLN/2,y:gr.top+r*(CELLN+GAPN)+CELLN/2};
}

/* ============ drag & drop ============ */
var drag=null;
function onDown(e,i){
  if(over||drag)return;
  var p=tray[i];
  if(!p)return;
  e.preventDefault();
  var ghost=pieceEl(p,CELLN,GAPN);
  ghost.classList.add('ghost');
  dragLayer.appendChild(ghost);
  drag={i:i,p:p,ghost:ghost,valid:false,row:0,col:0};
  slotEls[i].classList.add('lifting');
  ac();
  moveDrag(e);
}
function moveDrag(e){
  if(!drag)return;
  if(e.cancelable)e.preventDefault();
  var pitch=CELLN+GAPN;
  var W=drag.p.shape.w*pitch-GAPN;
  var H=drag.p.shape.h*pitch-GAPN;
  var LIFT=Math.max(48,CELLN*1.35);
  var x=e.clientX-W/2;
  var y=e.clientY-H-LIFT;
  drag.ghost.style.transform='translate('+x+'px,'+y+'px)';
  var gr=gridEl.getBoundingClientRect();
  var col=Math.round((x-gr.left)/pitch);
  var row=Math.round((y-gr.top)/pitch);
  drag.row=row;drag.col=col;
  drag.valid=canPlace(drag.p.shape,row,col);
  showPreview(drag.p,row,col,drag.valid);
}
function showPreview(p,row,col,valid){
  previewLayer.innerHTML='';
  p.shape.cells.forEach(function(rc){
    var r=row+rc[0],c=col+rc[1];
    if(r<0||r>7||c<0||c>7)return;
    var t=document.createElement('div');
    t.className='ptile '+(valid?'ok':'bad');
    if(valid)t.style.setProperty('--pre',GEM_PRE[p.color]);
    t.style.left=(c*(CELLN+GAPN))+'px';
    t.style.top=(r*(CELLN+GAPN))+'px';
    t.style.width=CELLN+'px';
    t.style.height=CELLN+'px';
    previewLayer.appendChild(t);
  });
}
function onUp(){
  if(!drag)return;
  var d=drag;drag=null;
  previewLayer.innerHTML='';
  var slot=slotEls[d.i];
  slot.classList.remove('lifting');
  if(!over&&d.valid&&canPlace(d.p.shape,d.row,d.col)){
    d.ghost.remove();
    placePiece(d.i,d.row,d.col);
  }else{
    var sr=slot.getBoundingClientRect();
    d.ghost.style.transition='transform .18s ease,opacity .18s ease';
    d.ghost.style.opacity='.35';
    var gx=sr.left+sr.width/2-d.ghost.offsetWidth/2;
    var gy=sr.top+sr.height/2-d.ghost.offsetHeight/2;
    d.ghost.style.transform='translate('+gx+'px,'+gy+'px) scale('+(MININ/Math.max(1,CELLN)).toFixed(2)+')';
    setTimeout(function(){d.ghost.remove();},210);
  }
}
function onCancel(){
  if(!drag)return;
  previewLayer.innerHTML='';
  slotEls[drag.i].classList.remove('lifting');
  drag.ghost.remove();
  drag=null;
}

/* ============ place & clear ============ */
function placePiece(i,row,col){
  var p=tray[i];
  tray[i]=null;
  p.shape.cells.forEach(function(rc){grid[row+rc[0]][col+rc[1]]=p.color;});
  score+=p.shape.cells.length;
  renderBoard();
  sndPlace();haptic('light');
  var cl=findLines();
  if(cl.n>0)doClear(cl);else combo=0;
  if(!tray[0]&&!tray[1]&&!tray[2])tray=[newPiece(),newPiece(),newPiece()];
  refreshTray();updateHUD(false);
  if(!anyMoves())setTimeout(gameOver,800);
}
function doClear(cl){
  combo++;
  var lines=cl.n;
  var map={};
  cl.rows.forEach(function(r){for(var c=0;c<8;c++)map[r*8+c]=grid[r][c];});
  cl.cols.forEach(function(c){for(var r=0;r<8;r++)map[r*8+c]=grid[r][c];});
  var gained=10*lines*lines+10*(combo-1)*lines;
  score+=gained;
  var delay=0;
  Object.keys(map).forEach(function(k){
    var idx=+k,r=(idx/8)|0,c=idx%8,color=map[k];
    var gem=cellEls[idx].querySelector('.gem:not(.dying)');
    if(gem){
      gem.classList.add('dying');
      (function(g){setTimeout(function(){g.remove();},430);})(gem);
    }
    grid[r][c]=null;
    var ctr=cellCenter(r,c);
    var colsFx=GEM_FX[color]||GEM_FX.rose;
    (function(xx,yy,cc,dd){
      setTimeout(function(){burstAt(xx,yy,cc,10+lines*3,1+lines*0.15);},dd);
    })(ctr.x,ctr.y,colsFx,delay);
    delay+=16;
  });
  if(combo>=2)comboBanner(combo);
  var pc=cellCenter(cl.rows.length?cl.rows[0]:4,cl.cols.length?cl.cols[0]:4);
  popupAt(pc.x,pc.y,'+'+gained);
  if(lines>=2)flash();
  if(lines>=2||combo>=2)shake();
  rotateTheme();
  sndClear(lines,combo);
  haptic(lines>=2?'heavy':'medium');
}
/* ============ canvas particles (crystal shards & sparkles) ============ */
var cv=document.getElementById('fx'),cx=cv.getContext('2d'),parts=[],DPR=1;
function resizeFx(){
  DPR=Math.min(2,window.devicePixelRatio||1);
  cv.width=window.innerWidth*DPR;
  cv.height=window.innerHeight*DPR;
  cx.setTransform(DPR,0,0,DPR,0,0);
}
function burstAt(x,y,colors,n,power){
  n=n||12;power=power||1;
  for(var i=0;i<n;i++){
    parts.push({
      x:x,y:y,
      vx:(Math.random()-.5)*6.5*power,
      vy:-(Math.random()*5+2.2)*power,
      g:.22+Math.random()*.08,
      s:2.5+Math.random()*4.5,
      rot:Math.random()*Math.PI,
      vr:(Math.random()-.5)*.35,
      life:1,decay:.014+Math.random()*.022,
      color:colors[(Math.random()*colors.length)|0],
      shape:['shard','spark','dot'][(Math.random()*3)|0]
    });
  }
}
function drawShard(s){
  cx.beginPath();cx.moveTo(0,-s*1.4);cx.lineTo(s*.75,0);cx.lineTo(0,s*1.4);cx.lineTo(-s*.75,0);
  cx.closePath();cx.fill();
}
function drawSpark(s){
  cx.beginPath();cx.moveTo(0,-s*1.5);
  cx.quadraticCurveTo(s*.18,-s*.18,s*1.5,0);
  cx.quadraticCurveTo(s*.18,s*.18,0,s*1.5);
  cx.quadraticCurveTo(-s*.18,s*.18,-s*1.5,0);
  cx.quadraticCurveTo(-s*.18,-s*.18,0,-s*1.5);
  cx.closePath();cx.fill();
}
function loop(){
  cx.clearRect(0,0,window.innerWidth,window.innerHeight);
  var i,p;
  for(i=parts.length-1;i>=0;i--){
    p=parts[i];
    p.x+=p.vx;p.y+=p.vy;p.vy+=p.g;p.rot+=p.vr;p.life-=p.decay;
    if(p.life<=0){parts.splice(i,1);continue;}
    cx.save();cx.translate(p.x,p.y);cx.rotate(p.rot);
    cx.globalAlpha=Math.max(0,Math.min(1,p.life));
    cx.fillStyle=p.color;
    if(p.shape==='shard')drawShard(p.s);
    else if(p.shape==='spark')drawSpark(p.s);
    else{cx.beginPath();cx.arc(0,0,p.s*.5,0,6.2832);cx.fill();}
    cx.restore();
  }
  requestAnimationFrame(loop);
}

/* ============ popups, combo, flash, shake ============ */
function popupAt(x,y,text){
  var el=document.createElement('div');
  el.className='pop-score';
  el.textContent=text;
  el.style.left=x+'px';
  el.style.top=y+'px';
  document.body.appendChild(el);
  setTimeout(function(){el.remove();},1000);
}
function comboBanner(n){
  comboEl.textContent='COMBO x'+n;
  comboEl.classList.remove('go');
  void comboEl.offsetWidth;
  comboEl.classList.add('go');
}
function flash(){
  flashEl.classList.remove('go');
  void flashEl.offsetWidth;
  flashEl.classList.add('go');
}
function shake(){
  appEl.classList.remove('shake');
  void appEl.offsetWidth;
  appEl.classList.add('shake');
}

/* ============ theme rotation ============ */
function applyTheme(t){
  document.body.setAttribute('data-theme',t);
  var layers=[bgA,bgB],cur=null,nxt=null;
  layers.forEach(function(l){if(l.classList.contains('on'))cur=l;else nxt=l;});
  nxt.className='bg bg-'+t+' on';
  if(cur)cur.classList.remove('on');
  try{
    if(tg&&tg.setHeaderColor)tg.setHeaderColor(TG_HEAD[t]);
    if(tg&&tg.setBackgroundColor)tg.setBackgroundColor(TG_HEAD[t]);
  }catch(e){}
}
var toastTimer=null;
function toast(txt){
  toastEl.textContent=txt;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer=setTimeout(function(){toastEl.classList.remove('show');},1500);
}
function rotateTheme(){
  themeIdx=(themeIdx+1)%THEMES.length;
  applyTheme(THEMES[themeIdx]);
  toast(THEME_NAME[THEMES[themeIdx]]);
}

/* ============ hud, best score, game over ============ */
function updateHUD(skipBump){
  scoreEl.textContent=score;
  if(score>best){best=score;lsSet(K_BEST,String(best));}
  bestEl.textContent=best;
  if(!skipBump){
    scoreEl.classList.remove('bump');
    void scoreEl.offsetWidth;
    scoreEl.classList.add('bump');
  }
}
function gameOver(){
  if(over)return;
  over=true;
  sndOver();haptic('heavy');
  finalScoreEl.textContent=score;
  finalBestEl.textContent='Best: '+best;
  if(score>0&&score>=best&&best>bestPrev)newBestEl.classList.add('show');
  else newBestEl.classList.remove('show');
  setTimeout(function(){overEl.classList.add('show');},150);
}
function restart(){
  over=false;score=0;combo=0;bestPrev=best;
  grid=[];
  for(var r=0;r<8;r++)grid.push([null,null,null,null,null,null,null,null]);
  tray=[newPiece(),newPiece(),newPiece()];
  overEl.classList.remove('show');
  previewLayer.innerHTML='';
  renderBoard();refreshTray();updateHUD(true);
}

/* ============ floating decor ============ */
function buildDeco(){
  var deco=document.getElementById('deco');
  for(var i=0;i<14;i++){
    var d=document.createElement('div');
    var sparkle=Math.random()<.4;
    d.className=sparkle?'deco-s':'deco-d';
    var s=sparkle?(6+Math.random()*10):(14+Math.random()*30);
    d.style.width=s+'px';
    d.style.height=s+'px';
    d.style.left=(Math.random()*96)+'%';
    d.style.top=(Math.random()*96)+'%';
    d.style.setProperty('--dur',(6+Math.random()*6).toFixed(1)+'s');
    d.style.setProperty('--del',(-Math.random()*6).toFixed(1)+'s');
    deco.appendChild(d);
  }
}

/* ============ init & events ============ */
best=parseInt(lsGet(K_BEST)||'0',10)||0;
applyMute();
layout();
buildCells();
buildDeco();
restart();
initTelegram();
requestAnimationFrame(loop);

slotEls.forEach(function(s,i){
  s.addEventListener('pointerdown',function(e){onDown(e,i);});
});
window.addEventListener('pointermove',moveDrag,{passive:false});
window.addEventListener('pointerup',onUp);
window.addEventListener('pointercancel',onCancel);
window.addEventListener('resize',layout);
document.addEventListener('contextmenu',function(e){e.preventDefault();});
document.addEventListener('touchmove',function(e){if(drag&&e.cancelable)e.preventDefault();},{passive:false});
sndBtn.addEventListener('click',function(e){
  e.stopPropagation();
  muted=!muted;
  lsSet(K_MUTE,muted?'1':'0');
  applyMute();
  if(!muted)tone(660,.08,'triangle',.12);
});
againBtn.addEventListener('click',function(){restart();});
})();
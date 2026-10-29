'use strict';
// 전투 화면의 그림을 모두 이 파일에서 그립니다: 바닥·길·바위 질감, 성문, 입구, 영웅 토큰, 적·보스 실루엣, 파편·피해 숫자·보스 연출.
// 나중에 그림 파일로 바꾸려면 config.images에 경로만 적으면 됩니다(비워 두면 코드로 그린 기본 그림). 크기 기준은 아래 config 주석 참고.
// 무거운 그림(바닥·영웅 토큰·적 스프라이트)은 배율마다 한 번만 오프스크린 캔버스에 그려 두고 매 프레임 drawImage로 붙입니다.
const BattleArt=(()=>{
const W=Battlefield.width,H=Battlefield.height,C=Battlefield.cell,cols=Battlefield.cols,rows=Battlefield.rows;
const config={
  images:{
    ground:'assets/battle/ground.webp',  // 바닥 타일(정사각형 336px = tile의 3배, 화면에서 tile px로 이음새 없이 반복)
    road:'assets/battle/road.webp',    // 길 타일(정사각형 336px, tile px로 이음새 없이 반복)
    rock:'assets/battle/rock.webp',    // 바위 한 칸(56×56의 3배 168×168, 투명 배경)
    castle:'assets/battle/castle.webp',  // 성문(56×168의 3배 168×504, 투명 배경) — 성채 칸 3개 크기
    entry:'assets/battle/entry.webp',   // 적 입구(56×112의 3배 168×336, 투명 배경) — 입구 칸 2개 크기
    enemy:'assets/battle/enemy.webp',   // 일반 적(40×40의 3배 120×120, 오른쪽을 보는 그림)
    boss:'assets/battle/boss.webp'     // 보스(76×76의 3배 228×228)
  },
  tile:112,
  size:{enemy:40,boss:76},
  bossName:'심연의 군주',
  classColors:{guardian:'#6f9fe3',warrior:'#e4795f',assassin:'#a97fe0',lancer:'#e6bb4e',archer:'#78c77c',mage:'#58c6ea',healer:'#f1a9c9',support:'#e9dc8e'}
};
const canvasOf=(w,h)=>{const c=document.createElement('canvas');c.width=Math.ceil(w);c.height=Math.ceil(h);return c};
function rng(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function rr(g,x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath()}
function glow(g,x,y,rad,c0,c1='rgba(0,0,0,0)'){const q=g.createRadialGradient(x,y,0,x,y,rad);q.addColorStop(0,c0);q.addColorStop(1,c1);g.fillStyle=q;g.fillRect(x-rad,y-rad,rad*2,rad*2)}
const box=kind=>{const l=Battlefield.cells.filter(c=>c.blocked===kind);if(!l.length)return null;const x0=Math.min(...l.map(c=>c.col))*C,y0=Math.min(...l.map(c=>c.row))*C,x1=(Math.max(...l.map(c=>c.col))+1)*C,y1=(Math.max(...l.map(c=>c.row))+1)*C;return{x:x0,y:y0,w:x1-x0,h:y1-y0}};
// ---- 그림 파일 불러오기 (config.images) ----
const files={};let version=0;
function sprite(name){const url=config.images[name];if(!url)return null;let im=files[name];if(!im||im.dataset.url!==url){im=files[name]=new Image();im.dataset.url=url;im.onload=()=>{version++};im.src=url}return im.complete&&im.naturalWidth?im:null}
// ---- 캐시: 배율(scale)이나 그림 파일이 바뀌면 비웁니다 ----
let cache={},cacheScale=0,cacheVersion=-1;
function prepare(s){sprite('ground');sprite('road');sprite('rock');sprite('castle');sprite('entry');sprite('enemy');sprite('boss');if(s!==cacheScale||version!==cacheVersion){cache={};cacheScale=s;cacheVersion=version}}
const cached=(key,make)=>cache[key]||(cache[key]=make());
// ================= 지형 =================
function groundLayer(g,r){const sp=sprite('ground');if(sp){for(let y=0;y<H;y+=config.tile)for(let x=0;x<W;x+=config.tile)g.drawImage(sp,x,y,config.tile,config.tile);return}
const gr=g.createLinearGradient(0,0,0,H);gr.addColorStop(0,'#24433a');gr.addColorStop(1,'#1a332e');g.fillStyle=gr;g.fillRect(0,0,W,H);
const tones=['rgba(104,152,82,.20)','rgba(12,32,30,.32)','rgba(138,176,112,.10)','rgba(74,116,72,.20)'];for(let k=0;k<80;k++)glow(g,r()*W,r()*H,26+r()*52,tones[k%4]);
for(let k=0;k<1600;k++){g.fillStyle=r()<.5?'rgba(0,0,0,.15)':'rgba(190,232,170,.07)';const z=1+r()*1.6;g.fillRect(r()*W,r()*H,z,z)}
g.lineWidth=1.2;g.lineCap='round';for(let k=0;k<300;k++){const x=r()*W,y=r()*H;g.strokeStyle=r()<.5?'rgba(104,160,88,.6)':'rgba(58,108,68,.6)';g.beginPath();for(let b=-1;b<=1;b++){g.moveTo(x+b*2,y);g.lineTo(x+b*3.4+(r()-.5)*2,y-4-r()*4)}g.stroke()}
for(let k=0;k<70;k++){const x=r()*W,y=r()*H;g.fillStyle='rgba(0,0,0,.25)';g.beginPath();g.ellipse(x+1,y+1.5,3+r()*2,2,0,0,7);g.fill();g.fillStyle=r()<.5?'#6d7d72':'#58665f';g.beginPath();g.ellipse(x,y,3+r()*2,2+r(),0,0,7);g.fill()}
for(let k=0;k<26;k++){const x=r()*W,y=r()*H,c=['#e8d98a','#d9a0c4','#a9c8ee'][k%3];g.fillStyle=c;for(let p=0;p<4;p++){g.beginPath();g.arc(x+Math.cos(p*1.57)*2,y+Math.sin(p*1.57)*2,1.3,0,7);g.fill()}g.fillStyle='#f6eec0';g.beginPath();g.arc(x,y,.9,0,7);g.fill()}}
function roadLayer(g,r){const road=Battlefield.cells.filter(c=>c.terrain==='melee'),path=new Path2D();road.forEach(c=>path.rect(c.col*C,c.row*C,C,C));
g.save();g.shadowColor='rgba(0,0,0,.6)';g.shadowBlur=14;g.fillStyle='#34322a';g.fill(path);g.restore();
g.save();g.clip(path);const sp=sprite('road');
if(sp){for(let y=0;y<H;y+=config.tile)for(let x=0;x<W;x+=config.tile)g.drawImage(sp,x,y,config.tile,config.tile)}
else{g.fillStyle='#3d392e';g.fillRect(0,0,W,H);const pal=['#7d7561','#6f6855','#88816c','#655f4e','#756e5b'];
for(let y=0,row=0;y<H;y+=14,row++){let x=-r()*14;while(x<W){const w=12+r()*9;g.fillStyle=pal[(r()*pal.length)|0];rr(g,x+1,y+1,w-2,12,3.5);g.fill();g.strokeStyle='rgba(205,198,170,.28)';g.lineWidth=1;g.beginPath();g.moveTo(x+3,y+2);g.lineTo(x+w-3,y+2);g.stroke();g.fillStyle='rgba(0,0,0,.18)';g.fillRect(x+3,y+10,w-6,2);x+=w}}
for(let k=0;k<160;k++){g.fillStyle=r()<.6?'rgba(88,128,70,.55)':'rgba(40,40,30,.4)';g.beginPath();g.arc(r()*W,r()*H,1+r()*1.6,0,7);g.fill()}
g.lineCap='round';g.lineJoin='round';g.strokeStyle='rgba(222,210,170,.07)';g.lineWidth=22;Battlefield.lanes.forEach(l=>{g.beginPath();l.forEach((p,i)=>i?g.lineTo(...p):g.moveTo(...p));g.stroke()})}
g.restore();
// 길 가장자리: 연석과 이끼
const open=(c,r)=>c>=0&&r>=0&&c<cols&&r<rows&&Battlefield.cells[r*cols+c].terrain!=='melee';
for(const cell of road){const x=cell.col*C,y=cell.row*C;
for(const [dc,dr] of [[0,-1],[0,1],[-1,0],[1,0]]){if(!open(cell.col+dc,cell.row+dr))continue;const horiz=dr!==0;
for(let k=0;k<C;k+=9){const w=8+r()*1.5,ox=horiz?x+k:(dc<0?x:x+C-5),oy=horiz?(dr<0?y:y+C-5):y+k;g.fillStyle='rgba(0,0,0,.28)';rr(g,horiz?ox:ox+(dc<0?1:-1),horiz?oy+(dr<0?1.5:-1.5):oy,horiz?w:5,horiz?5:w,2);g.fill();g.fillStyle=r()<.5?'#948c76':'#867e69';rr(g,ox,oy,horiz?w:5,horiz?5:w,2);g.fill();g.strokeStyle='rgba(235,228,200,.25)';g.lineWidth=.8;g.stroke()}
for(let k=0;k<5;k++){const ox=horiz?x+r()*C:(dc<0?x-2:x+C+2),oy=horiz?(dr<0?y-2:y+C+2):y+r()*C;glow(g,ox,oy,6+r()*5,'rgba(86,132,70,.4)')}}}}
function rockAt(g,cell,r){const cx=cell.x,cy=cell.y,sp=sprite('rock');g.fillStyle='rgba(0,0,0,.36)';g.beginPath();g.ellipse(cx+3,cy+15,23,9,0,0,7);g.fill();
if(sp){g.drawImage(sp,cell.col*C,cell.row*C,C,C);return}
const body=(bx,by,sx,sy,seed)=>{const q=rng(seed),n=9,pts=[];for(let k=0;k<n;k++){const a=k/n*Math.PI*2,rad=(k%2?.82:1)*(.88+q()*.24);pts.push([bx+Math.cos(a)*sx*rad,by+Math.sin(a)*sy*rad])}
const mid=(a,b)=>[(a[0]+b[0])/2,(a[1]+b[1])/2],p=new Path2D(),m0=mid(pts[n-1],pts[0]);p.moveTo(...m0);for(let k=0;k<n;k++){const m=mid(pts[k],pts[(k+1)%n]);p.quadraticCurveTo(...pts[k],...m)}p.closePath();
const gr=g.createLinearGradient(bx-sx,by-sy,bx+sx*.8,by+sy);gr.addColorStop(0,'#aeb9ad');gr.addColorStop(.5,'#6d7b74');gr.addColorStop(1,'#35413f');g.fillStyle=gr;g.fill(p);
g.save();g.clip(p);glow(g,bx-sx*.35,by-sy*.55,sx*.7,'rgba(110,160,86,.55)');g.strokeStyle='rgba(20,30,28,.55)';g.lineWidth=1.1;g.beginPath();g.moveTo(bx+sx*.1,by-sy*.2);g.lineTo(bx+sx*.28,by+sy*.25);g.lineTo(bx+sx*.1,by+sy*.55);g.moveTo(bx-sx*.4,by+sy*.05);g.lineTo(bx-sx*.15,by+sy*.35);g.stroke();g.strokeStyle='rgba(235,245,230,.35)';g.beginPath();g.moveTo(bx-sx*.7,by-sy*.1);g.lineTo(bx-sx*.25,by-sy*.7);g.lineTo(bx+sx*.3,by-sy*.8);g.stroke();g.restore();g.strokeStyle='#202b29';g.lineWidth=1.4;g.stroke(p)};
body(cx+10,cy+11,10,7,cell.id*7+3);body(cx-2,cy+2,19,15,cell.id*13+5)}
function gateLayer(g){const b=box('castle');if(!b)return;const sp=sprite('castle');if(sp){g.drawImage(sp,b.x,b.y,b.w,b.h);return}
const x=b.x,y=b.y,w=b.w,h=b.h,my=y+h/2;glow(g,x+4,my,78,'rgba(255,190,100,.30)');
const wall=g.createLinearGradient(x,0,x+w,0);wall.addColorStop(0,'#a09a88');wall.addColorStop(1,'#625d52');g.fillStyle='#000a';g.fillRect(x+7,y+1,w-7,h);g.fillStyle=wall;g.fillRect(x+9,y,w-9,h);
g.strokeStyle='rgba(20,18,14,.35)';g.lineWidth=1;for(let yy=y+8,i=0;yy<y+h;yy+=8,i++){g.beginPath();g.moveTo(x+9,yy);g.lineTo(x+w,yy);g.stroke();for(let xx=x+9+(i%2)*8;xx<x+w;xx+=16){g.beginPath();g.moveTo(xx,yy-8);g.lineTo(xx,yy);g.stroke()}}
g.fillStyle='#8c8b82';for(let yy=y+6;yy<y+h-8;yy+=15){g.fillStyle='rgba(0,0,0,.35)';g.fillRect(x+4,yy+2,10,10);g.fillStyle='#9a988c';g.fillRect(x+3,yy,10,10);g.fillStyle='rgba(255,255,255,.2)';g.fillRect(x+3,yy,10,2)}
// 성문: 석조 아치 + 활짝 열린 불빛 + 쇠창살
const gy=my-40;g.fillStyle='#2b2620';rr(g,x,gy-3,30,86,6);g.fill();const inner=g.createLinearGradient(x,0,x+28,0);inner.addColorStop(0,'#1c1410');inner.addColorStop(1,'#8a5a2a');g.fillStyle=inner;rr(g,x+2,gy,26,80,5);g.fill();
glow(g,x+24,my,26,'rgba(255,210,130,.55)');g.strokeStyle='#4a4038';g.lineWidth=2;for(let k=0;k<5;k++){g.beginPath();g.moveTo(x+4+k*5.5,gy+2);g.lineTo(x+4+k*5.5,gy+78);g.stroke()}g.beginPath();g.moveTo(x+2,gy+16);g.lineTo(x+28,gy+16);g.moveTo(x+2,gy+62);g.lineTo(x+28,gy+62);g.stroke();
g.strokeStyle='#bdb59c';g.lineWidth=2.4;rr(g,x+.5,gy-2,29,84,6);g.stroke();
for(const ty of [gy-12,gy+92]){glow(g,x+8,ty,18,'rgba(255,170,70,.55)');g.fillStyle='#ffd27a';g.beginPath();g.arc(x+8,ty,2.8,0,7);g.fill();g.fillStyle='#fff3c8';g.beginPath();g.arc(x+8,ty,1.2,0,7);g.fill()}
// 양쪽 탑
for(const cy of [y+16,y+h-16]){const cx=x+27;g.fillStyle='rgba(0,0,0,.4)';g.beginPath();g.arc(cx+2,cy+3,17,0,7);g.fill();const t=g.createRadialGradient(cx-5,cy-5,2,cx,cy,17);t.addColorStop(0,'#c4bea9');t.addColorStop(1,'#6d675a');g.fillStyle=t;g.beginPath();g.arc(cx,cy,16,0,7);g.fill();g.strokeStyle='#2b2822';g.lineWidth=1.6;g.stroke();
const roof=g.createRadialGradient(cx-3,cy-3,1,cx,cy,11);roof.addColorStop(0,'#b86a5e');roof.addColorStop(1,'#5c2f2f');g.fillStyle=roof;g.beginPath();g.arc(cx,cy,11,0,7);g.fill();g.strokeStyle='rgba(30,10,10,.55)';g.lineWidth=1;for(let k=0;k<8;k++){g.beginPath();g.moveTo(cx,cy);g.lineTo(cx+Math.cos(k*.785)*11,cy+Math.sin(k*.785)*11);g.stroke()}g.fillStyle='#e6c26a';g.beginPath();g.arc(cx,cy,2,0,7);g.fill()}}
function entryLayer(g){const b=box('entry');if(!b)return;const sp=sprite('entry');if(sp){g.drawImage(sp,b.x,b.y,b.w,b.h);return}
const cy=b.y+b.h/2;glow(g,0,cy,84,'rgba(170,40,70,.35)');g.save();g.beginPath();g.rect(0,b.y-14,70,b.h+28);g.clip();const p=g.createRadialGradient(0,cy,0,0,cy,50);p.addColorStop(0,'#000');p.addColorStop(.6,'#1b0b21');p.addColorStop(1,'rgba(60,18,60,0)');g.fillStyle=p;g.beginPath();g.ellipse(0,cy,42,60,0,0,7);g.fill();
g.lineWidth=2;for(const [rad,c] of [[26,'rgba(190,80,120,.55)'],[36,'rgba(130,60,150,.45)'],[46,'rgba(110,50,120,.3)']]){g.strokeStyle=c;g.beginPath();g.ellipse(0,cy,rad*.72,rad*1.2,0,-1.6,1.6);g.stroke()}g.restore();
for(const sy of [b.y-6,b.y+b.h+6]){for(let k=0;k<3;k++){g.fillStyle='#262b2a';g.beginPath();g.moveTo(2+k*11,sy+(sy<cy?10:-10));g.lineTo(8+k*11,sy+(sy<cy?-8-k*2:8+k*2));g.lineTo(15+k*11,sy+(sy<cy?10:-10));g.closePath();g.fill();g.strokeStyle='#59635e';g.lineWidth=1;g.stroke()}}}
function vignette(g){const v=g.createRadialGradient(W/2,H/2,H*.38,W/2,H/2,W*.62);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(4,10,12,.5)');g.fillStyle=v;g.fillRect(0,0,W,H)}
function background(s){return cached('bg',()=>{const cv=canvasOf(W*s,H*s),g=cv.getContext('2d'),r=rng(20240611);g.scale(s,s);groundLayer(g,r);roadLayer(g,r);entryLayer(g);for(const c of Battlefield.cells)if(c.blocked==='rock')rockAt(g,c,r);gateLayer(g);vignette(g);return cv})}
// ================= 격자 (배치할 때만) =================
let gridPath=null;
function drawGrid(g,alpha,avail){if(!gridPath){gridPath=new Path2D();for(let c=0;c<=cols;c++){gridPath.moveTo(c*C+.5,0);gridPath.lineTo(c*C+.5,H)}for(let r=0;r<=rows;r++){gridPath.moveTo(0,r*C+.5);gridPath.lineTo(W,r*C+.5)}}
g.save();g.globalAlpha=alpha;for(const c of avail){const road=c.terrain==='melee';g.fillStyle=road?'rgba(236,192,96,.20)':'rgba(128,210,220,.18)';g.fillRect(c.col*C+2,c.row*C+2,C-4,C-4);g.strokeStyle=road?'rgba(236,200,120,.55)':'rgba(130,214,224,.5)';g.lineWidth=1;g.strokeRect(c.col*C+2.5,c.row*C+2.5,C-5,C-5)}
g.strokeStyle='rgba(236,232,204,.2)';g.lineWidth=1;g.stroke(gridPath);g.restore()}
// ================= 영웅 =================
const R=27;
function classColor(i){return config.classColors[types[i].classId]||types[i].color}
function token(i,s){const art=portraits[i];if(!(art.complete&&art.naturalWidth))return null;return cached('t'+i,()=>{const pad=6,size=(R+pad)*2,cv=canvasOf(size*s,size*s),g=cv.getContext('2d'),c=size/2;g.scale(s,s);
g.save();g.shadowColor='rgba(0,0,0,.55)';g.shadowBlur=6;g.shadowOffsetY=3;g.fillStyle='#10181a';g.beginPath();g.arc(c,c,R-1,0,7);g.fill();g.restore();
g.save();g.beginPath();g.arc(c,c,R-2,0,7);g.clip();const full=fullBodyPortraits.has(i),crop=art.naturalWidth*(full?1:.65);g.drawImage(art,(art.naturalWidth-crop)/2,art.naturalHeight*(full?0:.07),crop,crop,c-R+2,c-R+2,(R-2)*2,(R-2)*2);glow(g,c-9,c-12,26,'rgba(255,255,255,.16)');g.restore();
g.lineWidth=3.2;g.strokeStyle=classColor(i);g.beginPath();g.arc(c,c,R-1.6,0,7);g.stroke();g.lineWidth=1;g.strokeStyle='#0b1112';g.beginPath();g.arc(c,c,R+.2,0,7);g.stroke();g.strokeStyle='rgba(255,255,255,.35)';g.beginPath();g.arc(c,c,R-3.6,0,7);g.stroke();
return cv})}
function bar(g,x,y,w,h,ratio,fill){ratio=Math.max(0,Math.min(1,ratio));g.fillStyle='rgba(8,12,14,.85)';rr(g,x-1,y-1,w+2,h+2,(h+2)/2);g.fill();if(ratio>0){g.fillStyle=fill;rr(g,x,y,Math.max(h,w*ratio),h,h/2);g.fill();g.fillStyle='rgba(255,255,255,.25)';g.fillRect(x+1,y+.5,Math.max(0,w*ratio-2),h/3)}}
const hpColor=r=>r>.6?'#8fd18a':r>.3?'#e6c35c':'#e07a68';
function drawHero(g,u,s){const i=u.type,tok=token(i,s),pad=6,size=(R+pad)*2;
if(tok)g.drawImage(tok,u.x-size/2,u.y-size/2,size,size);else{g.fillStyle='#10181a';g.beginPath();g.arc(u.x,u.y,R-1,0,7);g.fill();g.lineWidth=3;g.strokeStyle=classColor(i);g.stroke()}
if(u.hurt>0){g.globalAlpha=Math.min(1,u.hurt/.15)*.55;g.fillStyle='#ff5a4a';g.beginPath();g.arc(u.x,u.y,R-2,0,7);g.fill();g.globalAlpha=1}
bar(g,u.x-22,u.y+R+3,44,5,u.hp/u.max,hpColor(u.hp/u.max))}
// ================= 적·보스 실루엣 (64×64 도안, 왼쪽→오른쪽을 봄) =================
function ghoulShape(g){const b=g.createLinearGradient(0,8,0,60);b.addColorStop(0,'#665772');b.addColorStop(1,'#2b2433');g.lineJoin='round';
g.fillStyle=b;g.strokeStyle='#a592b4';g.lineWidth=1.8;g.beginPath();g.moveTo(8,58);g.quadraticCurveTo(4,36,17,27);g.quadraticCurveTo(22,17,33,17);g.lineTo(34,7);g.lineTo(40,15);g.lineTo(46,9);g.lineTo(46,19);g.quadraticCurveTo(57,22,57,31);g.lineTo(50,33);g.lineTo(55,38);g.lineTo(46,40);g.quadraticCurveTo(50,48,46,52);g.lineTo(50,58);g.lineTo(42,58);g.lineTo(36,50);g.lineTo(29,58);g.lineTo(21,50);g.lineTo(14,58);g.closePath();g.fill();g.stroke();
g.strokeStyle='#2b2433';g.lineWidth=5;g.lineCap='round';g.beginPath();g.moveTo(37,38);g.quadraticCurveTo(46,44,53,50);g.stroke();g.strokeStyle='#a592b4';g.lineWidth=1.6;g.stroke();g.strokeStyle='#e9e3d2';g.lineWidth=1.6;for(let k=0;k<3;k++){g.beginPath();g.moveTo(51+k*2,49+k*2.4);g.lineTo(56+k*2,53+k*2.6);g.stroke()}
glow(g,45,25,9,'rgba(255,190,70,.9)');g.fillStyle='#fff0b8';g.beginPath();g.ellipse(45,25,3,2,0,0,7);g.fill();g.fillStyle='#2b2433';g.fillRect(50,31,6,1.4)}
function bossShape(g){g.lineJoin='round';g.lineCap='round';const cape=g.createLinearGradient(0,18,0,64);cape.addColorStop(0,'#5a1c2a');cape.addColorStop(1,'#1c0a12');
g.fillStyle=cape;g.strokeStyle='#b0637a';g.lineWidth=1.8;g.beginPath();g.moveTo(32,22);g.lineTo(52,30);g.lineTo(62,62);g.lineTo(52,58);g.lineTo(46,63);g.lineTo(39,58);g.lineTo(32,63);g.lineTo(25,58);g.lineTo(18,63);g.lineTo(12,58);g.lineTo(2,62);g.lineTo(12,30);g.closePath();g.fill();g.stroke();
g.fillStyle='#3a2a3e';g.strokeStyle='#a592b4';for(const sx of [-1,1]){g.beginPath();g.moveTo(32+sx*13,26);g.lineTo(32+sx*25,14);g.lineTo(32+sx*22,32);g.lineTo(32+sx*14,36);g.closePath();g.fill();g.stroke()}
g.fillStyle='#463549';g.beginPath();g.moveTo(22,32);g.lineTo(42,32);g.lineTo(44,52);g.lineTo(20,52);g.closePath();g.fill();g.stroke();g.strokeStyle='rgba(224,120,120,.55)';g.lineWidth=1.2;g.beginPath();g.moveTo(32,34);g.lineTo(32,50);g.moveTo(26,38);g.lineTo(38,38);g.stroke();
g.fillStyle='#4e3c52';g.strokeStyle='#a592b4';g.lineWidth=1.8;g.beginPath();g.arc(32,22,10,0,7);g.fill();g.stroke();
g.fillStyle='#d9c7a4';g.strokeStyle='#6b5a45';g.lineWidth=1.4;for(const sx of [-1,1]){g.beginPath();g.moveTo(32+sx*7,16);g.quadraticCurveTo(32+sx*16,12,32+sx*14,1);g.quadraticCurveTo(32+sx*10,9,32+sx*4,13);g.closePath();g.fill();g.stroke()}
g.fillStyle='#e0b45a';g.beginPath();g.moveTo(25,13);g.lineTo(27,8);g.lineTo(30,12);g.lineTo(32,6);g.lineTo(34,12);g.lineTo(37,8);g.lineTo(39,13);g.closePath();g.fill();
for(const sx of [-1,1]){glow(g,32+sx*4.2,22,7,'rgba(255,60,50,.95)');g.fillStyle='#ffd6c0';g.beginPath();g.ellipse(32+sx*4.2,22,2.4,1.6,sx*.3,0,7);g.fill()}}
function enemyBase(boss,s){return cached('e'+boss,()=>{const size=boss?config.size.boss:config.size.enemy,pad=7,dim=size+pad*2,cv=canvasOf(dim*s,dim*s),g=cv.getContext('2d'),im=sprite(boss?'boss':'enemy');g.scale(s,s);
if(im)g.drawImage(im,pad,pad,size,size);else{g.translate(pad,pad);g.scale(size/64,size/64);(boss?bossShape:ghoulShape)(g)}return cv})}
function enemyVariant(boss,s,color,amount){return cached('v'+boss+color+amount,()=>{const base=enemyBase(boss,s),cv=canvasOf(base.width,base.height),g=cv.getContext('2d');g.drawImage(base,0,0);g.globalCompositeOperation='source-atop';g.globalAlpha=amount;g.fillStyle=color;g.fillRect(0,0,cv.width,cv.height);return cv})}
const ease=t=>1-Math.pow(1-Math.max(0,Math.min(1,t)),3);
function drawEnemy(g,e,now,s){const boss=!!e.boss,size=boss?config.size.boss:config.size.enemy,dim=size+14,age=e.age||0;
const dx=e.x-(e.px===undefined?e.x:e.px);if(Math.abs(dx)>.05)e.face=dx>0?1:-1;e.px=e.x;
const sc=boss?.55+.45*ease(age/.9):1,a=Math.min(1,age/.25+(boss?1:0)),bob=Math.sin(now*9+e.id*1.7)*(boss?.8:1.5),tint=enemyTint(e,null);
let spr=e.hitFlash>0?enemyVariant(boss,s,'#ffffff',.8):tint?enemyVariant(boss,s,tint,.5):enemyBase(boss,s);
g.globalAlpha=.34*a;g.fillStyle='#000';g.beginPath();g.ellipse(e.x,e.y+size*.4,size*.38*sc,size*.11*sc,0,0,7);g.fill();g.globalAlpha=a;
g.save();g.translate(e.x,e.y+bob);if(!boss&&e.face<0)g.scale(-1,1);g.scale(sc,sc);g.rotate(Math.sin(now*9+e.id)*.05);g.drawImage(spr,-dim/2,-dim/2,dim,dim);g.restore();
if(e.freeze>0){g.globalAlpha=.9;g.strokeStyle='#e8f8ff';g.fillStyle='rgba(190,230,255,.28)';g.lineWidth=2;rr(g,e.x-size*.42,e.y-size*.42,size*.84,size*.84,5);g.fill();g.stroke()}
g.globalAlpha=1;const bw=boss?58:30,by=e.y-size/2-(boss?7:5);bar(g,e.x-bw/2,by,bw,boss?6:4,e.hp/e.max,boss?'#d9645a':'#d58f79');
const es=enemyStatus(e);if(es.length){g.font='11px sans-serif';g.textAlign='center';es.forEach(([t,c],n)=>{g.fillStyle=c;g.fillText(t,e.x+(n-(es.length-1)/2)*13,by-5)})}}
// ================= 전투 효과: 피해 숫자 · 파편 · 보스 등장 · 성문 피격 =================
let floats=[],parts=[],bossFx={t:0,max:2.4},shake=0,gateHit=0;
const MAX_FLOATS=48,MAX_PARTS=220,rand=(a,b)=>a+Math.random()*(b-a);
function floater(x,y,text,color,size=14,life=.85){if(floats.length>=MAX_FLOATS)floats.shift();floats.push({x:x+rand(-7,7),y,text,color,size,life,max:life})}
function burst(x,y,n,colors,speed,life,size){for(let k=0;k<n&&parts.length<MAX_PARTS;k++){const a=Math.random()*Math.PI*2,v=rand(.35,1)*speed;parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-speed*.25,rot:rand(0,6.3),vr:rand(-9,9),size:rand(.6,1)*size,life:rand(.6,1)*life,max:life,color:colors[(Math.random()*colors.length)|0],kind:Math.random()<.35?1:0})}}
function dust(x,y,n,r,life){for(let k=0;k<n&&parts.length<MAX_PARTS;k++){const a=Math.random()*Math.PI*2;parts.push({x:x+Math.cos(a)*r*.4,y:y+Math.sin(a)*r*.3,vx:Math.cos(a)*r*.9,vy:Math.sin(a)*r*.5,rot:0,vr:0,size:rand(6,12),life,max:life,color:'#b8a98c',kind:2})}}
// 매 단계(step)마다: 피해 감지(깜빡임·숫자)
function observe(dt){for(const e of enemies){e.age=(e.age||0)+dt;if(e.hitFlash>0)e.hitFlash-=dt;if(e.lastHp===undefined)e.lastHp=e.hp;const d=e.lastHp-e.hp;e.lastHp=e.hp;if(d>.01){e.hitFlash=.11;e.acc=(e.acc||0)+d}
e.numCd=(e.numCd||0)-dt;if(e.acc>0&&(e.numCd<=0||e.hp<=0)){const big=e.acc>=e.max*.12;const sz=e.boss?config.size.boss:config.size.enemy;floater(e.x+sz/2+6,e.y-sz/2+4,String(Math.max(1,Math.round(e.acc))),big?'#ffd36a':e.boss?'#ffb09e':'#fff4d6',big?18:14);e.acc=0;e.numCd=.22}}
for(const u of units){if(u.hurt>0)u.hurt-=dt;if(u.lastHp===undefined)u.lastHp=u.hp;if(u.lastHp-u.hp>.01)u.hurt=.15;u.lastHp=u.hp}}
function death(e){if(e.acc>0){floater(e.x+(e.boss?config.size.boss:config.size.enemy)/2+6,e.y-14,String(Math.max(1,Math.round(e.acc))),'#ffd36a',18);e.acc=0}
const big=e.boss;burst(e.x,e.y,big?44:13,big?['#3a2a3e','#5a1c2a','#a592b4','#e0b45a']:['#2b2433','#665772','#a592b4'],big?190:130,big?1.1:.75,big?9:6);
burst(e.x,e.y,big?18:5,['#ffcf70','#ff8a50'],big?170:110,big?.8:.5,big?4:2.6);dust(e.x,e.y+4,big?5:2,big?40:18,.55);
if(big){shake=Math.max(shake,5);fx.push({x:e.x,y:e.y,r:150,life:.7,max:.7,color:'#ffcf70',burst:true})}}
function bossEntrance(e){bossFx.t=bossFx.max;shake=8;dust(e.x+10,e.y,10,70,.9);burst(e.x,e.y,22,['#5a1c2a','#a592b4','#ff6a50'],150,.9,7);fx.push({x:e.x,y:e.y,r:200,life:.9,max:.9,color:'#e0645c',burst:true})}
function castleHit(amount){gateHit=.4;shake=Math.max(shake,3.5);const b=box('castle');if(b)floater(b.x-12,b.y+b.h/2-18,'성채 -'+amount,'#ff8a78',17,1.1)}
function update(dt){floats=floats.filter(f=>(f.life-=dt)>0);for(const p of parts){p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;if(p.kind===2){p.vx*=1-3*dt;p.vy*=1-3*dt}else{p.vy+=260*dt;p.vx*=1-1.6*dt;p.rot+=p.vr*dt}}parts=parts.filter(p=>p.life>0);
if(bossFx.t>0)bossFx.t=Math.max(0,bossFx.t-dt);shake=Math.max(0,shake-dt*16);if(gateHit>0)gateHit-=dt}
function reset(){floats=[];parts=[];bossFx.t=0;shake=0;gateHit=0}
const shakeOffset=()=>shake>.05?[(Math.random()-.5)*shake*2,(Math.random()-.5)*shake*2]:[0,0];
function drawFx(g){
for(const p of parts){const k=p.life/p.max;g.globalAlpha=p.kind===2?k*.35:Math.min(1,k*1.6);g.fillStyle=p.color;
if(p.kind===2){g.beginPath();g.arc(p.x,p.y,p.size*(1.6-k*.6),0,7);g.fill()}else if(p.kind===1){g.beginPath();g.arc(p.x,p.y,p.size*.5,0,7);g.fill()}
else{const c=Math.cos(p.rot)*p.size,sn=Math.sin(p.rot)*p.size;g.beginPath();g.moveTo(p.x+c,p.y+sn);g.lineTo(p.x-sn*.6,p.y+c*.6);g.lineTo(p.x-c*.7,p.y-sn*.7);g.closePath();g.fill()}}
g.globalAlpha=1;g.textAlign='center';g.lineJoin='round';g.lineWidth=3;g.strokeStyle='rgba(0,0,0,.8)';
for(const f of floats){const t=1-f.life/f.max,pop=t<.12?1.35-t/.12*.35:1;g.globalAlpha=Math.min(1,f.life/f.max*2.2);g.font='bold '+Math.round(f.size*pop)+'px sans-serif';const y=f.y-t*26;g.strokeText(f.text,f.x,y);g.fillStyle=f.color;g.fillText(f.text,f.x,y)}g.globalAlpha=1;
if(gateHit>0){const b=box('castle');if(b){g.globalAlpha=gateHit/.4*.45;g.fillStyle='#ff4a3a';g.fillRect(b.x,b.y,b.w,b.h);g.globalAlpha=1}}}
// 보스 등장 연출: 붉은 테두리 + 띠 배너. 일시정지 중에는 update가 멈추므로 같이 멈춥니다.
function drawBanner(g){if(bossFx.t<=0)return;const p=1-bossFx.t/bossFx.max,a=Math.max(0,Math.min(1,p/.12,(1-p)/.22));
const v=g.createRadialGradient(W/2,H/2,H*.3,W/2,H/2,W*.62);v.addColorStop(0,'rgba(120,10,16,0)');v.addColorStop(1,'rgba(150,12,20,'+(.42*a)+')');g.fillStyle=v;g.fillRect(0,0,W,H);
const y=H*.3,bg=g.createLinearGradient(0,0,W,0);bg.addColorStop(0,'rgba(18,4,8,0)');bg.addColorStop(.2,'rgba(18,4,8,.86)');bg.addColorStop(.8,'rgba(18,4,8,.86)');bg.addColorStop(1,'rgba(18,4,8,0)');g.globalAlpha=a;g.fillStyle=bg;g.fillRect(0,y-38,W,76);
g.fillStyle='rgba(224,100,92,.8)';g.fillRect(W*.15,y-38,W*.7,1.5);g.fillRect(W*.15,y+36.5,W*.7,1.5);
const slide=(1-ease(p/.25))*70;g.textAlign='center';g.fillStyle='#e0645c';g.font='bold 13px sans-serif';g.fillText('— B O S S —',W/2-slide,y-12);g.lineWidth=4;g.lineJoin='round';g.strokeStyle='#14080b';g.font='bold 32px serif';g.strokeText(config.bossName,W/2+slide,y+22);g.fillStyle='#f4dcaa';g.fillText(config.bossName,W/2+slide,y+22);g.globalAlpha=1}
return {config,prepare,background,drawGrid,token,drawHero,drawEnemy,drawFx,drawBanner,observe,death,bossEntrance,castleHit,update,reset,shakeOffset,classColor,width:W,height:H};
})();

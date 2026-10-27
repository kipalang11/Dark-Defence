'use strict';
// One grid drives both terrain rendering and deployment validation.
const Battlefield=(grid=>{
  const {cell,cols,rows}=grid,width=cols*cell,height=rows*cell;
  const obstacles=new Set(grid.obstacles);
  function road(c,r){return ((r===3||r===4)&&c<=5)||(c>=4&&c<=5&&r>=3&&r<=7)||((r===6||r===7)&&c>=4&&c<=11)||(c>=10&&c<=11&&r>=3&&r<=7)||(c>=10&&r>=3&&r<=5)}
  const cells=Array.from({length:cols*rows},(_,id)=>{const c=id%cols,r=Math.floor(id/cols),onRoad=road(c,r);return {id,col:c,row:r,x:(c+.5)*cell,y:(r+.5)*cell,terrain:onRoad?'melee':'ranged',blocked:onRoad&&c===0?'entry':onRoad&&c===cols-1?'castle':obstacles.has(c+','+r)?'rock':null}});
  const lanes=[0,1,2].map(i=>[[0,196+i*28],[308-i*28,196+i*28],[308-i*28,364+i*28],[588+i*28,364+i*28],[588+i*28,196+i*28],[728,196+i*56],[width,196+i*56]]);
  const lengths=lanes.map(points=>points.slice(1).map((p,i)=>Math.hypot(p[0]-points[i][0],p[1]-points[i][1])));
  const totals=lengths.map(parts=>parts.reduce((a,b)=>a+b,0));
  function position(distance,lane=0){lane=Number.isInteger(lane)&&lane>=0&&lane<lanes.length?lane:0;const points=lanes[lane];let d=Math.max(0,distance);for(let i=0;i<lengths[lane].length;i++){const length=lengths[lane][i];if(d<=length)return {x:points[i][0]+(points[i+1][0]-points[i][0])*d/length,y:points[i][1]+(points[i+1][1]-points[i][1])*d/length};d-=length}const end=points[points.length-1];return {x:end[0],y:end[1]}}
  function cellAt(x,y){return Number.isFinite(x)&&Number.isFinite(y)&&x>=0&&y>=0&&x<width&&y<height?Math.floor(y/cell)*cols+Math.floor(x/cell):-1}
  function canvasPoint(clientX,clientY,rect){const scale=Math.min(rect.width/width,rect.height/height);if(!scale)return null;const x=(clientX-rect.left-(rect.width-width*scale)/2)/scale,y=(clientY-rect.top-(rect.height-height*scale)/2)/scale;return x>=0&&y>=0&&x<width&&y<height?{x,y}:null}
  return {cell,cols,rows,width,height,cells,lanes,lengths,totals,position,cellAt,canvasPoint};
})(typeof ASHWARD_DATA!=='undefined'?ASHWARD_DATA.battlefield:require('../data/battlefield.json'));
if(typeof module!=='undefined')module.exports=Battlefield;


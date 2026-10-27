'use strict';
// Save key 'ashward-v1' and its shape are shared with existing players and backups: never rename.
let save={gold:BALANCE.start.gold,levels:[],best:0};
try{const previous=JSON.parse(localStorage.getItem('ashward-v1'));if(previous&&Array.isArray(previous.levels))save=previous}catch(e){}
// Keep the six original indices stable so old collections and upgrades survive.
const oldLevels=save.levels;
const oldOwned=Array.isArray(save.owned)?save.owned:oldLevels.map((level,i)=>i<2||level>1);
const numberOr=(n,fallback)=>Number.isFinite(n)&&n>=0?n:fallback;
save.levels=types.map((_,i)=>Math.max(1,numberOr(oldLevels[i],1)));
save.owned=types.map((_,i)=>i<2||Boolean(oldOwned[i]));
save.gold=numberOr(save.gold,BALANCE.start.gold);save.best=numberOr(save.best,0);
save.stones=numberOr(save.stones,BALANCE.start.stones);save.summons=numberOr(save.summons,0);
save.shards=types.map((_,i)=>numberOr(save.shards?.[i],0));
save.awaken=types.map((_,i)=>Math.min(5,numberOr(save.awaken?.[i],0)));
save.favorites=Array.isArray(save.favorites)?save.favorites.filter(i=>Number.isInteger(i)&&i>=0&&i<types.length):[];
save.version=3;
function persist(){try{localStorage.setItem('ashward-v1',JSON.stringify(save))}catch(e){notice('저장 공간을 사용할 수 없습니다. 현재 진행은 이 창에서만 유지됩니다.')}}

'use strict';
// Hero order in data/heroes.json is the save and backup index: never reorder, only append.
const heroClasses=ASHWARD_DATA.heroClasses;
const types=ASHWARD_DATA.heroes.map(({id,newHero,fullBodyPortrait,...stats})=>{const h={...stats};h.className=heroClasses[h.classId].name;h.deployment=heroClasses[h.classId].deployment;return h});
const artNames=ASHWARD_DATA.heroes.map(h=>h.id);
const legacyRoster=types.map((_,i)=>i).filter(i=>types[i].legacy),mainRoster=types.map((_,i)=>i).filter(i=>!legacyRoster.includes(i)),newRoster=ASHWARD_DATA.heroes.map((h,i)=>h.newHero?i:-1).filter(i=>i>=0);
const fullBodyPortraits=new Set(ASHWARD_DATA.heroes.map((h,i)=>h.fullBodyPortrait?i:-1).filter(i=>i>=0));
const portraits=artNames.map((_,i)=>{const img=new Image();img.src=portraitUrl(i);return img});
function rangeAt(i,kind='range',awakening=save.awaken[i]){const h=types[i],base=kind==='range'?h.range:(h.ability&&h.ability[kind])||h.range;return Math.round((base||0)*(1+BALANCE.awaken.bonusPerStage*awakening)*10)/10}
function placementLabel(i){return types[i].deployment==='melee'?'근접 · 길목':'원거리 · 길 밖'}
// Extra illustrations per hero (e.g. awakened skins). Key = hero id, art 0 is always the base art from assets/<id>.webp.
// Example: kael:[{label:'각성 스킨',url:'assets/skins/kael-awakened.webp',awaken:5}] — shown once save.awaken reaches `awaken`.
const extraArts={};
const heroArts=i=>[{label:'기본',url:fullArtUrl(i),awaken:0},...(extraArts[artNames[i]]||[])];

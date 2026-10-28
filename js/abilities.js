'use strict';
// Hero abilities. Every number lives in data/heroes.json (hero.ability); battle.js calls the hooks below.
// Battle-only state (u.hits, e.markTime, zones ...) stays in memory and is never saved.
let zones=[];
const AURA_TYPES=new Set(['guardAura','hasteAura','powerAura','ward']);
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const ab=u=>types[u.type].ability||{};
const abR=(u,kind='radius')=>rangeAt(u.type,kind);
const live=e=>e.hp>0&&!e.escaped;
function popup(x,y,text,color){fx.push({x,y:y-30,text,color,life:.9,max:.9})}
function ring(x,y,r,color,life=.5){fx.push({x,y,r,life,max:life,color,ring:true})}
function beam(a,b,color,life=.25,zig=false){const f={x:a.x,y:a.y,tx:b.x,ty:b.y,life,max:life,color};if(zig){f.pts=[[a.x,a.y]];for(let k=1;k<5;k++)f.pts.push([a.x+(b.x-a.x)*k/5+(Math.random()-.5)*14,a.y+(b.y-a.y)*k/5+(Math.random()-.5)*14]);f.pts.push([b.x,b.y])}fx.push(f)}
function unitPower(u){const t=types[u.type],base=t.dmg*(1+BALANCE.level.powerPerLevel*(save.levels[u.type]-1))*(1+BALANCE.awaken.bonusPerStage*save.awaken[u.type]);return base*(1+auraBonus(u,'powerAura'))}
function auraBonus(u,type){return Math.max(0,...units.filter(v=>v!==u&&v.hp>0&&ab(v).type===type&&dist(v,u)<=abR(v)).map(v=>ab(v).bonus))}
function hasteMul(u){return 1-auraBonus(u,'hasteAura')}
function damageEnemy(e,amount,u){if(!live(e))return 0;amount*=e.markTime>0?1+e.markBonus:1;e.hp-=amount;if(e.hp<=0&&!e.killer)e.killer=u||null;return amount}
function hurtUnit(u,amount,e){let m=1;for(const v of units)if(v!==u&&v.hp>0&&ab(v).type==='guardAura'&&dist(v,u)<=abR(v))m*=1-ab(v).reduction;if(u.shieldTime>0)m*=1-u.shieldRed;u.hp-=amount*m;const a=ab(u);if(e&&u.hp>0&&a.type==='thorns'){damageEnemy(e,unitPower(u)*a.factor,u);beam(u,e,'#f0d9a0',.2);popup(e.x,e.y,'반격','#f0d9a0')}}
function addPool(x,y,r,left,dps,u){const near=zones.find(z=>z.kind==='swamp'&&z.owner===u&&Math.hypot(z.x-x,z.y-y)<18);if(near){near.left=left;return}zones.push({kind:'swamp',x,y,r,left,max:left,dps,owner:u})}
// Called once per battle step before units act: timers, zones, passive fields.
function abilityUpdate(dt){for(const e of enemies)e.fieldSlow=0;
for(const u of units){if(u.hp<=0)continue;const a=ab(u);if(u.shieldTime>0)u.shieldTime-=dt;if(u.regenTime>0){u.regenTime-=dt;u.hp=Math.min(u.max,u.hp+u.regenPer*dt)}if(u.wardCd>0)u.wardCd-=dt;
if(a.type==='frostField'){const r=rangeAt(u.type);for(const e of enemies)if(live(e)&&dist(u,e)<=r)e.fieldSlow=Math.max(e.fieldSlow,a.slow)}
if(a.type==='manaPulse'){u.pulse=(u.pulse||0)+dt;if(u.pulse>=a.interval){u.pulse=0;mana=Math.min(BALANCE.mana.max,mana+a.mana);ring(u.x,u.y,60,'#d9c98a',.7);popup(u.x,u.y,'♪ 마나 +'+a.mana,'#d9c98a')}}}
for(const z of zones){z.left-=dt;if(z.kind==='swamp'){for(const e of enemies)if(live(e)&&Math.hypot(e.x-z.x,e.y-z.y)<=z.r)damageEnemy(e,z.dps*dt,z.owner)}else if(z.left<=0){ring(z.x,z.y,z.r,'#e8c27a',.5);for(const e of enemies)if(live(e)&&Math.hypot(e.x-z.x,e.y-z.y)<=z.r)damageEnemy(e,z.dmg,z.owner)}}
zones=zones.filter(z=>z.left>0&&units.includes(z.owner))}
// Per-enemy status timers (poison, burn, mark, stacks, blind, freeze).
function tickEnemy(e,dt){if(e.poisonTime>0){e.hp-=e.poisonDps*Math.min(dt,e.poisonTime);e.poisonTime=Math.max(0,e.poisonTime-dt)}if(e.burnTime>0){e.hp-=e.burnDps*Math.min(dt,e.burnTime);e.burnTime=Math.max(0,e.burnTime-dt)}for(const k of ['markTime','stackTime','blind','freeze'])if(e[k]>0)e[k]=Math.max(0,e[k]-dt);if(!(e.stackTime>0))e.stacks=0}
function enemySpeedFactor(e){if(e.freeze>0)return 0;let f=1;if(e.stacks>0)f*=1-Math.min(.85,e.stacks*e.stackPer);if(e.fieldSlow)f*=1-e.fieldSlow;return Math.max(.1,f)}
const canAttack=e=>!(e.freeze>0||e.blind>0);
function blastAround(e,radius,amount,u,color){ring(e.x,e.y,radius,color,.45);for(const v of enemies)if(v!==e&&live(v)&&dist(v,e)<=radius)damageEnemy(v,amount,u)}
// Basic attack of a non-healer unit. `list` = enemies in range, front-most first.
function strike(u,e,power,list){const a=ab(u),t=types[u.type];let dmg=power;u.hits=(u.hits||0)+1;
if(a.type==='execute'&&e.hp/e.max<=a.threshold){dmg*=1+a.bonus;popup(e.x,e.y,'처형!','#c9a0f0');ring(e.x,e.y,22,'#d86a6a',.4)}
if(a.type==='ambush'&&!e.ambushed){e.ambushed=true;dmg*=a.factor;popup(e.x,e.y,'암습!','#c8c4e8');ring(e.x,e.y,26,'#1a1a28',.4)}
const dealt=damageEnemy(e,dmg,u);beam(u,e,t.color,.2);
switch(a.type){
case 'blast':blastAround(e,abR(u),power*a.factor,u,'#e8a070');break;
case 'mark':if(u.hits%a.every===0){e.markTime=a.seconds;e.markBonus=a.bonus;popup(e.x,e.y,'☾ 표식','#f0e08a')}break;
case 'frostStack':e.stacks=Math.min(a.max,(e.stacks||0)+1);e.stackTime=a.seconds;e.stackPer=a.perStack;break;
case 'blind':if(Math.random()<a.chance){e.blind=a.seconds;popup(e.x,e.y,'? 실명','#d9b27a');ring(e.x,e.y,28,'#b89a62',.5)}break;
case 'leech':u.hp=Math.min(u.max,u.hp+dealt*a.ratio);if(dealt>0)popup(u.x,u.y,'♥','#d97090');break;
case 'echo':if(Math.random()<a.chance&&live(e)){damageEnemy(e,power*a.factor,u);beam({x:u.x+8,y:u.y-8},e,'#d9b4f0',.35);popup(u.x,u.y,'환영','#d9b4f0')}break;
case 'chain':{let from=e,hit=new Set([e]),d=power;for(let k=1;k<a.targets;k++){const next=enemies.filter(v=>live(v)&&!hit.has(v)&&dist(v,from)<=abR(u)).sort((x,y)=>dist(x,from)-dist(y,from))[0];if(!next)break;d*=a.factor;damageEnemy(next,d,u);beam(from,next,'#bfe6ff',.3,true);hit.add(next);from=next}break}
case 'pierce':{const near=enemies.filter(v=>v!==e&&live(v)&&dist(v,e)<=abR(u)).sort((x,y)=>dist(x,e)-dist(y,e)).slice(0,a.targets);near.forEach(v=>{damageEnemy(v,power*a.factor,u);beam(e,v,'#8fe3e8',.3)});break}
case 'meteor':if(u.hits%a.every===0){zones.push({kind:'meteor',x:e.x,y:e.y,r:abR(u),left:a.delay,max:a.delay,dmg:power*a.factor,owner:u});popup(e.x,e.y,'★ 성좌 낙하','#b9c8f0')}break;
case 'swamp':addPool(e.x,e.y,abR(u),a.seconds,power*a.perSecond,u);break;
case 'allyLeech':{const ally=units.filter(v=>v.hp>0&&v.hp<v.max).sort((x,y)=>x.hp/x.max-y.hp/y.max)[0];if(ally){ally.hp=Math.min(ally.max,ally.hp+dealt*a.ratio);beam(u,ally,'#f0dc9a',.3)}break}
case 'tide':{e.d=Math.max(0,e.d-a.push*(e.boss?a.bossFactor:1));Object.assign(e,pos(e.d,e.lane));blastAround(e,abR(u),power*a.factor,u,'#79bccc');popup(e.x,e.y,'≈ 파도','#9ad8ec');break}
case 'freeze':if(u.hits%a.every===0){e.freeze=e.boss?a.bossSeconds:a.seconds;popup(e.x,e.y,'❄ 빙결','#bfe6ff');ring(e.x,e.y,24,'#d8f2ff',.5)}break;
case 'burn':e.burnTime=a.seconds;e.burnDps=power*a.perSecond;e.burnLife=a.seconds;e.burnRadius=abR(u);break;
case 'poison':e.poisonTime=a.seconds;e.poisonDps=power*a.perSecond;break}}
// Healer action: `target` is the lowest-ratio ally in range.
function healHit(u,target,power){const a=ab(u);let amount=power;if(a.type==='regen'){amount=power*a.instant;target.regenTime=a.seconds;target.regenPer=power*a.perSecond;popup(target.x,target.y,'❦ 재생','#9ad79a')}
target.hp=Math.min(target.max,target.hp+amount);
if(a.type==='chainHeal'){const second=units.filter(v=>v!==target&&v.hp>0&&v.hp<v.max&&dist(v,u)<=rangeAt(u.type)).sort((x,y)=>x.hp/x.max-y.hp/y.max)[0];if(second){second.hp=Math.min(second.max,second.hp+power*a.factor);beam(target,second,'#e0d4f8',.3)}}
if(a.type==='shield'){target.shieldTime=a.seconds;target.shieldRed=a.reduction;popup(target.x,target.y,'♔ 가호','#f0dc9a')}
beam(u,target,'#b5e1bd',.3)}
// Unit just died: Aurelia-style ward revives it once per cooldown.
function reviveWards(){for(const u of units){if(u.hp>0)continue;const w=units.find(v=>v!==u&&v.hp>0&&ab(v).type==='ward'&&!(v.wardCd>0)&&dist(v,u)<=abR(v));if(!w)continue;const a=ab(w);u.hp=u.max*a.hpRatio;w.wardCd=a.cooldown;ring(u.x,u.y,44,'#f4e4a8',.8);popup(u.x,u.y,'✧ 되살아남','#f4e4a8');beam(w,u,'#f4e4a8',.5)}}
// Enemy died (hp <= 0): burn spreads, Pyra-style kill blast.
function onEnemyDeath(e){if(e.burnTime>0)for(const v of enemies)if(v!==e&&live(v)&&dist(v,e)<=e.burnRadius){v.burnTime=e.burnLife;v.burnDps=e.burnDps;v.burnLife=e.burnLife;v.burnRadius=e.burnRadius;beam(e,v,'#f0a060',.3)}
const k=e.killer;if(k&&k.hp>0&&ab(k).type==='deathBlast'){const a=ab(k);blastAround(e,abR(k),unitPower(k)*a.factor,k,'#f0a060');popup(e.x,e.y,'폭주!','#f0a060')}}
// Small status/buff glyphs drawn near enemies and units.
function enemyStatus(e){const s=[];if(e.markTime>0)s.push(['☾','#f0e08a']);if(e.burnTime>0)s.push(['♨','#f08a4a']);if(e.poisonTime>0)s.push(['☠','#8fd06a']);if(e.blind>0)s.push(['?','#d9b27a']);if(e.freeze>0)s.push(['❄','#d8f2ff']);if(e.stacks>0)s.push(['●'.repeat(e.stacks),'#8fc8ff']);return s}
function enemyTint(e,fallback){return e.freeze>0?'#bfe6f5':e.burnTime>0?'#d98a55':e.poisonTime>0?'#7fae6a':e.blind>0?'#c9b27a':(e.stacks>0||e.fieldSlow)?'#8fb0c0':fallback}
function unitStatus(u){const s=[];if(auraBonus(u,'powerAura')>0)s.push(['▲','#e6b866']);if(auraBonus(u,'hasteAura')>0)s.push(['≫','#70beb6']);if(units.some(v=>v!==u&&v.hp>0&&ab(v).type==='guardAura'&&dist(v,u)<=abR(v)))s.push(['◈','#d9b878']);if(u.shieldTime>0)s.push(['♔','#f0dc9a']);if(u.regenTime>0)s.push(['❦','#9ad79a']);return s}
function abilityRadiusNote(i){const a=types[i].ability||{};if(!a.radius)return '';return '<br>'+(AURA_TYPES.has(a.type)?'아군 강화 범위 ':'효과 반경 ')+rangeAt(i,'radius')}

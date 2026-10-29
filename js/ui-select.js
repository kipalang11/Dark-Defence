'use strict';
// Game-style dropdown. Every <select> stays in the page as the source of truth (value, change event, disabled, options);
// a button + popup list is drawn on top, so battle.js/collection.js keep reading $('filter').value etc. unchanged.
(()=>{
const esc=s=>s.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const icon=o=>o&&heroClasses[o.value]?`<i class="cls-icon ${o.value}" aria-hidden="true"></i>`:'';
const menu=document.createElement('ul');menu.className='gmenu';menu.setAttribute('role','listbox');menu.tabIndex=-1;menu.hidden=true;document.body.appendChild(menu);
let cur=null,act=-1;
function mark(n){let items=[...menu.children];act=Math.max(0,Math.min(items.length-1,n));items.forEach((li,k)=>li.classList.toggle('active',k===act));if(items[act]){menu.setAttribute('aria-activedescendant',items[act].id);items[act].scrollIntoView({block:'nearest'})}}
function place(){let r=cur.btn.getBoundingClientRect(),vh=innerHeight,vw=innerWidth,below=vh-r.bottom-8,above=r.top-8,up=below<Math.min(menu.scrollHeight,240)&&above>below,room=Math.max(120,up?above:below);menu.style.maxHeight=room+'px';menu.style.minWidth=r.width+'px';let w=menu.offsetWidth,h=Math.min(menu.scrollHeight,room);menu.style.left=Math.max(8,Math.min(r.left,vw-w-8))+'px';menu.style.top=(up?r.top-h-4:r.bottom+4)+'px'}
function open(sel,btn){if(sel.disabled)return;if(cur)close(false);cur={sel,btn};menu.innerHTML=[...sel.options].map((o,k)=>`<li role="option" id="gm${k}" data-k="${k}" aria-selected="${o.selected}" class="${o.selected?'on':''}">${icon(o)}<span>${esc(o.textContent)}</span></li>`).join('');menu.hidden=false;btn.setAttribute('aria-expanded','true');place();mark(sel.selectedIndex);menu.focus({preventScroll:true})}
function close(refocus=true){if(!cur)return;let {btn}=cur;cur=null;menu.hidden=true;btn.setAttribute('aria-expanded','false');if(refocus)btn.focus({preventScroll:true})}
function pick(k){if(!cur)return;let {sel}=cur;close();if(sel.selectedIndex!==k){sel.selectedIndex=k;sel.dispatchEvent(new Event('change',{bubbles:true}))}}
menu.onclick=e=>{let li=e.target.closest('li');if(li)pick(+li.dataset.k)};
menu.onpointermove=e=>{let li=e.target.closest('li');if(li&&+li.dataset.k!==act)mark(+li.dataset.k)};
menu.onkeydown=e=>{let k=e.key;if(k==='ArrowDown'||k==='ArrowUp'||k==='Home'||k==='End'){e.preventDefault();mark(k==='Home'?0:k==='End'?menu.children.length-1:act+(k==='ArrowDown'?1:-1))}else if(k==='Enter'||k===' '){e.preventDefault();pick(act)}else if(k==='Escape'||k==='Tab'){e.preventDefault();close()}};
document.addEventListener('pointerdown',e=>{if(cur&&!menu.contains(e.target)&&!cur.btn.contains(e.target))close(false)},true);
addEventListener('resize',()=>close(false));addEventListener('scroll',e=>{if(cur&&!menu.contains(e.target))close(false)},true);
function enhance(sel){
  let btn=document.createElement('button');btn.type='button';btn.className='gselect';btn.setAttribute('aria-haspopup','listbox');btn.setAttribute('aria-expanded','false');btn.setAttribute('aria-label',sel.getAttribute('aria-label')||'');
  sel.classList.add('native-select');sel.tabIndex=-1;sel.setAttribute('aria-hidden','true');sel.after(btn);
  const sync=()=>{let o=sel.selectedOptions[0];btn.innerHTML=icon(o)+'<span>'+esc(o?o.textContent:'')+'</span><i class="caret" aria-hidden="true"></i>';btn.disabled=sel.disabled};
  new MutationObserver(sync).observe(sel,{childList:true,subtree:true,attributes:true,attributeFilter:['disabled']});sel.addEventListener('change',sync);
  btn.onclick=()=>cur&&cur.btn===btn?close():open(sel,btn);
  btn.onkeydown=e=>{if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();open(sel,btn)}};
  sync();
}
document.querySelectorAll('select').forEach(enhance);
// iOS Safari only applies :active (pressed glow) when some touch listener exists.
document.addEventListener('touchstart',()=>{},{passive:true});
})();

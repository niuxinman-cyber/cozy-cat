(()=>{
'use strict';
const STYLE_ID='cozy-world-style';
const EQUIPPED_KEY='cozyWorldEquippedV1';
const KNOWN_KEY='cozyWorldKnownUnlocksV1';
const METRICS_KEY='cozyWorldMetricsV1';
const $=(s,r=document)=>r.querySelector(s);
const clamp=(v,min=0,max=100)=>Math.max(min,Math.min(max,Number(v)||0));
const parse=(v,f)=>{try{return v?JSON.parse(v):f}catch(_){return f}};
const dayKey=(d=new Date())=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const pick=a=>a[Math.floor(Math.random()*a.length)];
const getNum=(key,f)=>{const n=Number(localStorage.getItem(key));return Number.isFinite(n)?n:f};
let lastInput=Date.now(),ambientTimer=0,lastAmbientAt=0;

const ITEMS=[
  {id:'yarn',emoji:'🧶',name:'毛线球',kind:'words',need:20,rule:'累计认识 20 个不同单词'},
  {id:'fish',emoji:'🐟',name:'小鱼玩具',kind:'words',need:60,rule:'累计认识 60 个不同单词'},
  {id:'books',emoji:'📚',name:'小书堆',kind:'words',need:120,rule:'累计认识 120 个不同单词'},
  {id:'teddy',emoji:'🧸',name:'小熊玩偶',kind:'streak',need:7,rule:'连续签到 7 天'},
  {id:'lamp',emoji:'🌙',name:'星星夜灯',kind:'reviews',need:5,rule:'完成复习 5 天'},
  {id:'plant',emoji:'🪴',name:'小绿植',kind:'words',need:200,rule:'累计认识 200 个不同单词'}
];

function ensureStyle(){
  if(document.getElementById(STYLE_ID))return;
  const link=document.createElement('link');link.id=STYLE_ID;link.rel='stylesheet';link.href='./cozy-world.css';document.head.appendChild(link);
}
function partOfDay(d=new Date()){
  const m=d.getHours()*60+d.getMinutes();
  if(m>=360&&m<660)return'morning';
  if(m>=660&&m<1080)return'day';
  if(m>=1080&&m<1350)return'evening';
  return'night';
}
function partLabel(p){return{morning:'🌤️ 早晨',day:'☀️ 白天',evening:'🌇 傍晚',night:'🌙 夜晚'}[p]||''}
function applyDaypart(){
  const p=partOfDay();
  document.body.classList.remove('world-morning','world-day','world-evening','world-night');
  document.body.classList.add('world-'+p);document.body.dataset.worldPeriod=p;
  const chip=$('#worldDaypartChip');if(chip)chip.textContent=partLabel(p);
  const theme=$('meta[name="theme-color"]');if(theme)theme.content={morning:'#f7efe6',day:'#f7efe6',evening:'#ead7c6',night:'#313548'}[p];
}
function installDaypartChip(){
  const room=$('.room');if(!room||$('#worldDaypartChip'))return;
  const chip=document.createElement('div');chip.id='worldDaypartChip';chip.className='world-daypart-chip';chip.textContent=partLabel(partOfDay());room.appendChild(chip);
}
function learningSeen(){const x=parse(localStorage.getItem('cozyLearningV4'),{});return Array.isArray(x?.seen)?x.seen.length:0}
function metrics(){const m=parse(localStorage.getItem(METRICS_KEY),{})||{};m.reviewDays=Array.isArray(m.reviewDays)?m.reviewDays:[];return m}
function saveMetrics(m){localStorage.setItem(METRICS_KEY,JSON.stringify(m))}
function progressFor(item){if(item.kind==='words')return learningSeen();if(item.kind==='streak')return getNum('cozy10CheckinStreak',0);if(item.kind==='reviews')return metrics().reviewDays.length;return 0}
function knownUnlocks(){const x=parse(localStorage.getItem(KNOWN_KEY),[]);return Array.isArray(x)?x.filter(id=>ITEMS.some(i=>i.id===id)):[]}
function isUnlocked(item){return knownUnlocks().includes(item.id)||progressFor(item)>=item.need}
function equipped(){
  const raw=localStorage.getItem(EQUIPPED_KEY);
  if(raw===null){const defaults=ITEMS.filter(isUnlocked).map(i=>i.id);saveEquipped(defaults);return defaults}
  const x=parse(raw,[]);return Array.isArray(x)?x.filter(id=>ITEMS.some(i=>i.id===id)):[]
}
function saveEquipped(list){localStorage.setItem(EQUIPPED_KEY,JSON.stringify([...new Set(list)]))}
function toast(text){const el=$('#toast');if(!el)return;el.textContent=text;el.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>el.classList.remove('show'),2200)}
function decorFor(item){const d=document.createElement('div');d.className='world-decor';d.dataset.item=item.id;d.textContent=item.emoji;d.setAttribute('aria-hidden','true');return d}
function renderRoomDecor(){
  const room=$('.room');if(!room)return;
  room.querySelectorAll('.world-decor').forEach(x=>x.remove());
  const ids=equipped();
  for(const id of ids){const item=ITEMS.find(x=>x.id===id);if(item&&isUnlocked(item))room.appendChild(decorFor(item))}
  const lamp=ITEMS.find(i=>i.id==='lamp');document.body.classList.toggle('world-lamp-on',ids.includes('lamp')&&lamp&&isUnlocked(lamp));
}
function maybeUnlockNotice(unlockedIds){
  const known=parse(localStorage.getItem(KNOWN_KEY),null);
  if(!Array.isArray(known)){localStorage.setItem(KNOWN_KEY,JSON.stringify(unlockedIds));return}
  const fresh=unlockedIds.filter(x=>!known.includes(x));
  localStorage.setItem(KNOWN_KEY,JSON.stringify([...new Set([...known,...unlockedIds])]));
  if(fresh.length){const names=fresh.map(id=>ITEMS.find(x=>x.id===id)?.name).filter(Boolean);toast(`猫窝解锁：${names.join('、')} ✨`)}
}
function renderCollection(){
  const grid=$('#worldCollectionGrid');if(!grid)return;
  const eq=equipped(),unlockedIds=ITEMS.filter(isUnlocked).map(i=>i.id);maybeUnlockNotice(unlockedIds);
  grid.innerHTML='';
  for(const item of ITEMS){
    const p=progressFor(item),open=isUnlocked(item),on=eq.includes(item.id),progressText=open&&p<item.need?'已永久解锁':`${Math.min(p,item.need)} / ${item.need}`;
    const card=document.createElement('div');card.className='world-collect-card'+(open?' is-open':' is-locked');
    card.innerHTML=`<div class="world-collect-emoji">${open?item.emoji:'🔒'}</div><div class="world-collect-name">${open?item.name:'???'}</div><div class="world-collect-rule">${item.rule}</div><div class="world-collect-progress">${progressText}</div><button type="button" ${open?'':'disabled'}>${open?(on?'收起来':'放进猫窝'):'还没解锁'}</button>`;
    const btn=card.querySelector('button');if(open)btn.addEventListener('click',()=>{let list=equipped();list=on?list.filter(x=>x!==item.id):[...list,item.id];saveEquipped(list);renderCollection();renderRoomDecor();toast(on?`${item.name}收好啦`:`${item.name}已经放进猫窝 ♡`)});
    grid.appendChild(card);
  }
}
function installCollection(){
  const catPage=$('.page[data-page="cat"]');if(!catPage||$('#worldCollectionCard'))return;
  const section=document.createElement('section');section.id='worldCollectionCard';section.className='card section world-collection';
  section.innerHTML='<div class="small-title">🎁 猫窝收藏</div><div class="helper">学单词、连续签到和坚持复习都会解锁猫猫用品。解锁后可以自己决定要不要摆进房间里。♡</div><div id="worldCollectionGrid" class="world-collection-grid"></div>';
  catPage.appendChild(section);renderCollection();
}
function installReviewTracker(){
  const label=$('#quizScoreLabel');if(!label)return;
  let last=label.textContent.trim();
  const check=()=>{const text=label.textContent.trim();if(text.startsWith('复习完成')&&!last.startsWith('复习完成')){const m=metrics(),today=dayKey();if(!m.reviewDays.includes(today)){m.reviewDays.push(today);saveMetrics(m);renderCollection()}}last=text};
  new MutationObserver(check).observe(label,{childList:true,subtree:true,characterData:true});
}
function snapshot(){return{mood:clamp(getNum('cozy9Mood',80)),full:clamp(getNum('cozy9Fullness',60)),fish:clamp(getNum('cozy9Fish',30)),part:partOfDay(),state:$('#cat')?.dataset.catState||'idle'}}
const LINES={
  hungry:['猫猫盯着饭碗看了三秒，又回头看了看你。','摸摸当然很好……但是猫猫觉得饭饭也非常重要。','它路过饭碗的时候，故意把脚步放得特别重。'],
  veryLow:['猫猫今天安静得有点过分，不过你在这里，它还是往你这边挪了一点点。','它把自己团成小小一团，听见你动静时耳朵轻轻抬了一下。'],
  low:['猫猫今天有一点蔫，但还是愿意待在你旁边。','它没怎么闹腾，只是安安静静看着你。'],
  sleepy:['猫猫的眼皮已经快撑不住啦。','它努力睁了一下眼睛，然后决定还是困比较重要。','猫猫把今天剩下的精神都存起来了。'],
  morning:['早呀。猫猫已经醒了一会儿，还假装自己没有等你。','早上的第一件事：伸懒腰。第二件事：看看你来了没有。'],
  day:['猫猫占住了今天最舒服的位置，批准你在旁边学习。','它看起来没什么大事要做，所以决定陪你待一会儿。'],
  evening:['天慢慢暗下来啦，猫猫开始挑今晚最舒服的姿势。','傍晚的房间变暖了一点，猫猫也跟着懒洋洋的。'],
  night:['这么晚还在呀？猫猫把夜班陪读的位置留给你了。','夜里安静下来以后，连呼噜声都显得特别清楚。','猫猫看看你，又看看外面：今晚也别学得太晚哦。']
};
function contextLine(){const s=snapshot();if(s.full<=28)return pick(LINES.hungry);if(s.mood<20)return pick(LINES.veryLow);if(s.mood<40)return pick(LINES.low);if(s.state==='sleep'||s.fish>=75)return pick(LINES.sleepy);return pick(LINES[s.part]||LINES.day)}
function speak(text){const e=$('#speech');if(e)e.innerHTML=text}
function runFx(kind){
  const wrap=$('#catWrap'),room=$('.room');if(!wrap||!room)return;
  wrap.classList.remove('world-peek','world-wiggle','world-settle');void wrap.offsetWidth;wrap.classList.add('world-'+kind);setTimeout(()=>wrap.classList.remove('world-'+kind),1200);
  const fx=document.createElement('div');fx.className='world-fx';fx.textContent=kind==='settle'?'…':snapshot().state==='sleep'?'Z':'♡';room.appendChild(fx);setTimeout(()=>fx.remove(),1700);
}
function ambientPool(){
  const s=snapshot();
  if(s.full<=28)return[{fx:'peek',text:'猫猫从饭碗那边回来，眼神非常有暗示性。'},{fx:'wiggle',text:'它在原地转了半圈，最后还是决定守着饭碗。'}];
  if(s.state==='sleep'||s.fish>=75)return[{fx:'settle',text:'猫猫在睡梦里轻轻动了动爪子。'},{fx:'settle',text:'呼……猫猫睡得很认真。'}];
  if(s.mood<40)return[{fx:'settle',text:'猫猫安静地趴了一会儿，尾巴尖轻轻动了一下。'},{fx:'peek',text:'它偷偷看了你一眼，又装作什么都没发生。'}];
  const base=[{fx:'peek',text:'猫猫突然抬头看了你一眼。'},{fx:'wiggle',text:'它换了一个自认为更舒服的姿势。'},{fx:'settle',text:'猫猫盯着窗外发了一小会儿呆。'},{fx:'peek',text:'它好像听见了什么，认真观察了两秒。'},{fx:'wiggle',text:'猫猫伸了个小懒腰，然后继续陪你。'}];
  if(s.part==='night')base.push({fx:'settle',text:'夜里太安静了，猫猫打了一个很小的哈欠。'});
  return base;
}
function fireAmbient(){
  if(document.hidden||!$('.page[data-page="home"]')?.classList.contains('active'))return;
  if(Date.now()-lastInput<35000||Date.now()-lastAmbientAt<90000)return;
  const event=pick(ambientPool());if(!event)return;lastAmbientAt=Date.now();speak(event.text||contextLine());runFx(event.fx);
}
function scheduleAmbient(first=false){clearTimeout(ambientTimer);const delay=first?50000+Math.random()*40000:120000+Math.random()*180000;ambientTimer=setTimeout(()=>{fireAmbient();scheduleAmbient(false)},delay)}
function installContextTouches(){
  const active=()=>{lastInput=Date.now()};document.addEventListener('pointerdown',active,true);document.addEventListener('keydown',active,true);
  const contextualAfter=(selector,delay=140)=>{$(selector)?.addEventListener('click',()=>setTimeout(()=>{const s=snapshot();let extra='';if(s.full<=28)extra='它蹭了蹭你，又很明显地看了一眼饭碗。';else if(s.mood<40)extra='被你碰到以后，它看起来稍微有精神了一点。';else if(s.part==='night')extra='夜里的摸摸好像特别容易让猫猫呼噜。';if(extra){const b=$('#speech');if(b&&!b.querySelector('.world-context-line'))b.insertAdjacentHTML('beforeend',`<span class="world-context-line">${extra}</span>`) }},delay));};
  contextualAfter('#petBtn');contextualAfter('#cat');
}
function observeProgress(){
  ['profileWords','profileStreak','learnedCount'].forEach(id=>{const e=document.getElementById(id);if(e)new MutationObserver(()=>renderCollection()).observe(e,{childList:true,subtree:true,characterData:true})});
  window.addEventListener('storage',e=>{if(['cozyLearningV4','cozy10CheckinStreak',EQUIPPED_KEY,METRICS_KEY].includes(e.key)){renderCollection();renderRoomDecor()}});
}
function init(){
  ensureStyle();installDaypartChip();applyDaypart();installCollection();installReviewTracker();installContextTouches();observeProgress();renderRoomDecor();renderCollection();scheduleAmbient(true);
  setInterval(applyDaypart,60000);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,900),{once:true});else setTimeout(init,900);
})();

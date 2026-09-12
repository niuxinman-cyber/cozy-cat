const COZY_CAT_SPRITE = './assets/cat-sprite.webp';
const COZY_CAT_FRAMES = Object.freeze({idle:0,happy:1,hungry:2,sleep:3,eat:4,celebrate:5});
const COZY_CAT_STATE_CLASSES = Object.keys(COZY_CAT_FRAMES).map(name => `state-${name}`);
let cozyCatActionTimer = 0;
let cozyCatActionLocked = false;
let cozyCatCurrentState = '';

function cozyCatReadNumber(key,fallback){
  const n=Number(localStorage.getItem(key));
  return Number.isFinite(n)?n:fallback;
}
function cozyCatInventory(){
  try{return {milk:0,chicken:0,cake:0,beef:0,...JSON.parse(localStorage.getItem('cozy9Inventory')||'{}')}}
  catch(_){return {milk:0,chicken:0,cake:0,beef:0}}
}
function cozyCatBaseState(){
  const mood=cozyCatReadNumber('cozy9Mood',80);
  const full=cozyCatReadNumber('cozy9Fullness',60);
  const fish=cozyCatReadNumber('cozy9Fish',30);
  if(full<=28)return 'hungry';
  if(fish>=82)return 'sleep';
  if(mood>=85)return 'happy';
  return 'idle';
}
function cozyCatSetState(name){
  const img=document.getElementById('cat');
  const wrap=document.getElementById('catWrap');
  if(!img||!wrap||!(name in COZY_CAT_FRAMES))return;
  cozyCatCurrentState=name;
  COZY_CAT_STATE_CLASSES.forEach(cls=>wrap.classList.remove(cls));
  wrap.classList.add(`state-${name}`);
  const shift=-(COZY_CAT_FRAMES[name]*16.6666667)+'%';
  img.style.setProperty('--cat-shift',shift);
  if(img.getAttribute('src')!==COZY_CAT_SPRITE)img.setAttribute('src',COZY_CAT_SPRITE);
  img.dataset.catState=name;
}
function cozyCatSyncBase(){if(!cozyCatActionLocked)cozyCatSetState(cozyCatBaseState())}
function cozyCatPlay(name,duration=1500){
  clearTimeout(cozyCatActionTimer);
  cozyCatActionLocked=true;
  cozyCatSetState(name);
  cozyCatActionTimer=setTimeout(()=>{cozyCatActionLocked=false;cozyCatSyncBase()},duration);
}
function cozyCatTodayKey(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function cozyCatEnsureStyles(){
  if(document.querySelector('link[data-cozy-cat-anim]'))return;
  const link=document.createElement('link');link.rel='stylesheet';link.href='./cat-anim.css?v=13';link.dataset.cozyCatAnim='1';document.head.appendChild(link);
}
function cozyCatInit(){
  const img=document.getElementById('cat'),wrap=document.getElementById('catWrap');
  if(!img||!wrap)return;
  cozyCatEnsureStyles();
  const preload=new Image();preload.src=COZY_CAT_SPRITE;
  cozyCatSyncBase();
  const srcGuard=new MutationObserver(()=>{if(img.getAttribute('src')!==COZY_CAT_SPRITE)img.setAttribute('src',COZY_CAT_SPRITE)});
  srcGuard.observe(img,{attributes:true,attributeFilter:['src']});
  const statusTargets=['moodNum','foodNum','fishNum'].map(id=>document.getElementById(id)).filter(Boolean);
  if(statusTargets.length){const obs=new MutationObserver(()=>setTimeout(cozyCatSyncBase,0));statusTargets.forEach(el=>obs.observe(el,{childList:true,subtree:true,characterData:true}))}
  document.addEventListener('click',event=>{
    const t=event.target instanceof Element?event.target:null;if(!t)return;
    const feed=t.closest('[data-feed]'),quick=t.closest('#quickFeedBtn');
    if(feed){const inv=cozyCatInventory();event.__cozyCanFeed=(inv[feed.dataset.feed]||0)>0}
    else if(quick){event.__cozyCanFeed=Object.values(cozyCatInventory()).some(v=>Number(v)>0)}
    if(t.closest('#checkinBtn'))event.__cozyCanCheckin=localStorage.getItem('cozy10LastCheckin')!==cozyCatTodayKey();
  },true);
  document.addEventListener('click',event=>{
    const t=event.target instanceof Element?event.target:null;if(!t)return;
    if(t.closest('#petBtn')||t.closest('#cat')){cozyCatPlay('happy',1450);return}
    if((t.closest('[data-feed]')||t.closest('#quickFeedBtn'))&&event.__cozyCanFeed){setTimeout(()=>cozyCatPlay('eat',1750),610);return}
    if(t.closest('#checkinBtn')&&event.__cozyCanCheckin)setTimeout(()=>cozyCatPlay('celebrate',1650),80);
  });
  const learned=document.getElementById('learnedCount');
  if(learned){let last=Number(learned.textContent)||0;new MutationObserver(()=>{const now=Number(learned.textContent)||0;if(last<20&&now===20)cozyCatPlay('celebrate',1700);last=now}).observe(learned,{childList:true,subtree:true,characterData:true})}
  const quiz=document.getElementById('quizScoreLabel');
  if(quiz){let done=false;new MutationObserver(()=>{const text=quiz.textContent.trim();const now=text.startsWith('完成')||text.startsWith('复习完成');if(now&&!done)cozyCatPlay('celebrate',1700);done=now}).observe(quiz,{childList:true,subtree:true,characterData:true})}
  window.addEventListener('storage',cozyCatSyncBase);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(cozyCatInit,0),{once:true});else setTimeout(cozyCatInit,0);

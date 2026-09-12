(()=>{
'use strict';
const $=(s,r=document)=>r.querySelector(s);
const pick=a=>a[Math.floor(Math.random()*a.length)];
let lastInput=Date.now(),timer=0,lastMoment=0,running=false;

function installStyle(){
  if(document.getElementById('cat-moments-style'))return;
  const s=document.createElement('style');s.id='cat-moments-style';s.textContent=`
.cat-wrap.cat-life-look{animation:catLifeLook 1.25s ease-in-out!important}
.cat-wrap.cat-life-wiggle{animation:catLifeWiggle 1.35s ease-in-out!important}
.cat-wrap.cat-life-stretch{animation:catLifeStretch 1.45s ease-in-out!important}
.cat-wrap.cat-life-dream{animation:catLifeDream 1.55s ease-in-out!important}
@keyframes catLifeLook{0%,100%{transform:translateY(0) rotate(0)}28%{transform:translateY(-8px) rotate(-1.6deg)}58%{transform:translateY(-6px) rotate(1.2deg)}78%{transform:translateY(-3px) rotate(-.5deg)}}
@keyframes catLifeWiggle{0%,100%{transform:translateY(0) rotate(0)}22%{transform:translateY(-3px) rotate(-2deg)}46%{transform:translateY(-7px) rotate(1.8deg)}70%{transform:translateY(-3px) rotate(-1deg)}}
@keyframes catLifeStretch{0%,100%{transform:translateY(0) rotate(0)}30%{transform:translateY(-9px) rotate(-1deg)}56%{transform:translateY(-5px) rotate(1deg)}78%{transform:translateY(-2px) rotate(0)}}
@keyframes catLifeDream{0%,100%{transform:translateY(0) rotate(0)}35%{transform:translateY(-4px) rotate(-.8deg)}68%{transform:translateY(-2px) rotate(.7deg)}}
.cat-life-fx{position:absolute;left:50%;top:43%;z-index:8;pointer-events:none;font-size:24px;font-weight:900;color:#ef9eb0;text-shadow:0 2px 7px rgba(87,61,50,.15);animation:catLifeFloat 1.8s ease-out forwards}
.world-night .cat-life-fx{color:#f4d3a4}
@keyframes catLifeFloat{0%{opacity:0;transform:translate(38px,12px)}18%{opacity:1}75%{opacity:.92}100%{opacity:0;transform:translate(58px,-44px)}}
@media(prefers-reduced-motion:reduce){.cat-wrap.cat-life-look,.cat-wrap.cat-life-wiggle,.cat-wrap.cat-life-stretch,.cat-wrap.cat-life-dream,.cat-life-fx{animation:none!important}}
`;
  document.head.appendChild(s);
}
function snapshot(){
  return{state:$('#cat')?.dataset.catState||'idle',full:Number(localStorage.getItem('cozy9Fullness')||60),mood:Number(localStorage.getItem('cozy9Mood')||80),fish:Number(localStorage.getItem('cozy9Fish')||30)};
}
function pool(){
  const x=snapshot();
  if(x.state==='sleep'||x.fish>=75)return[
    {kind:'dream',fx:'Z',text:'猫猫在睡梦里轻轻动了动，好像梦见了什么。'},
    {kind:'dream',fx:'…',text:'呼……它换了个更舒服的睡姿。'}
  ];
  if(x.full<=28)return[
    {kind:'look',fx:'!',text:'猫猫忽然抬头看你，又很认真地看了一眼饭碗。'},
    {kind:'wiggle',fx:'…',text:'它在垫子上动了动，似乎正在考虑怎么提醒你开饭。'}
  ];
  if(x.mood<40)return[
    {kind:'look',fx:'♡',text:'猫猫偷偷抬头看了你一眼，又安静地趴回去了。'},
    {kind:'wiggle',fx:'…',text:'它轻轻换了个姿势，还是决定待在你旁边。'}
  ];
  return[
    {kind:'look',fx:'♡',text:'猫猫突然抬头看了你一眼。'},
    {kind:'wiggle',fx:'♪',text:'它轻轻晃了晃，重新找了个舒服的位置。'},
    {kind:'stretch',fx:'✦',text:'猫猫伸了个小懒腰，然后继续陪你。'},
    {kind:'look',fx:'?',text:'它好像听见了什么，认真观察了两秒。'}
  ];
}
function onHome(){return !document.hidden&&$('.page[data-page="home"]')?.classList.contains('active')}
function busy(){const w=$('#catWrap');return !w||running||w.classList.contains('petting')||w.classList.contains('state-eat')||w.classList.contains('state-celebrate')||w.classList.contains('world-peek')||w.classList.contains('world-wiggle')||w.classList.contains('world-settle')}
function speak(text){const e=$('#speech');if(e)e.innerHTML=text}
function moment(){
  if(!onHome()||busy()||Date.now()-lastInput<15000||Date.now()-lastMoment<35000)return false;
  const item=pick(pool()),wrap=$('#catWrap'),room=$('.room');if(!item||!wrap||!room)return false;
  running=true;lastMoment=Date.now();
  const cls='cat-life-'+item.kind;wrap.classList.add(cls);speak(item.text);
  const fx=document.createElement('div');fx.className='cat-life-fx';fx.textContent=item.fx;room.appendChild(fx);
  setTimeout(()=>{wrap.classList.remove(cls);fx.remove();running=false},1750);
  return true;
}
function schedule(first=false){
  clearTimeout(timer);
  const delay=first?22000+Math.random()*12000:48000+Math.random()*42000;
  timer=setTimeout(()=>{const fired=moment();schedule(!fired)},delay);
}
function active(){lastInput=Date.now()}
function init(){
  installStyle();document.addEventListener('pointerdown',active,true);document.addEventListener('keydown',active,true);
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){lastInput=Date.now();schedule(true)}});
  schedule(true);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,1200),{once:true});else setTimeout(init,1200);
})();

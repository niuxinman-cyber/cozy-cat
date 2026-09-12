// Core application logic preserved from the pre-animation app.js.
// The lightweight app.js loader imports this file after loading the cat animation layer.

(async()=>{
try{if(!window.COZY_WORDS) await import('./words.js?v=10');}catch(_){}

const FALLBACK=[
{id:'f001',w:'die Bedeutung',m:'意义，重要性',ex:'Die Bedeutung guter Sprachkenntnisse wird oft unterschätzt.',topic:'校园'},
{id:'f002',w:'die Entwicklung',m:'发展，进程',ex:'Die technische Entwicklung verändert unseren Alltag.',topic:'图表'},
{id:'f003',w:'die Gesellschaft',m:'社会',ex:'In der modernen Gesellschaft spielt Bildung eine große Rolle.',topic:'讨论'},
{id:'f004',w:'die Herausforderung',m:'挑战',ex:'Ein Studium im Ausland ist für viele eine große Herausforderung.',topic:'校园'},
{id:'f005',w:'die Möglichkeit',m:'可能性，机会',ex:'Online-Kurse bieten neue Möglichkeiten zum Lernen.',topic:'讨论'},
{id:'f006',w:'die Voraussetzung',m:'前提，条件',ex:'Gute Sprachkenntnisse sind eine wichtige Voraussetzung für das Studium.',topic:'校园'},
{id:'f007',w:'berücksichtigen',m:'考虑，顾及',ex:'Bei der Planung muss man viele Faktoren berücksichtigen.',topic:'书面语'},
{id:'f008',w:'zunehmen',m:'增加，增长',ex:'Die Zahl der Studierenden nimmt jedes Jahr zu.',topic:'图表'},
{id:'f009',w:'verringern',m:'减少，降低',ex:'Neue Maßnahmen können die Kosten deutlich verringern.',topic:'图表'},
{id:'f010',w:'sich auswirken auf',m:'对……产生影响',ex:'Stress kann sich negativ auf die Gesundheit auswirken.',topic:'讨论'},
{id:'f011',w:'die Maßnahme',m:'措施',ex:'Die Stadt plant neue Maßnahmen zum Klimaschutz.',topic:'书面语'},
{id:'f012',w:'verfügen über',m:'拥有，具备',ex:'Viele Hochschulen verfügen über moderne Labore.',topic:'校园'},
{id:'f013',w:'ermöglichen',m:'使……成为可能',ex:'Digitale Medien ermöglichen flexibleres Lernen.',topic:'校园'},
{id:'f014',w:'der Beitrag',m:'贡献',ex:'Jeder kann einen kleinen Beitrag zum Umweltschutz leisten.',topic:'讨论'},
{id:'f015',w:'sich eignen für',m:'适合……',ex:'Diese Methode eignet sich gut für Gruppenarbeit.',topic:'校园'},
{id:'f016',w:'nachhaltig',m:'可持续的',ex:'Nachhaltige Lösungen werden immer wichtiger.',topic:'环保'},
{id:'f017',w:'in Anspruch nehmen',m:'占用；利用',ex:'Die Vorbereitung auf die Prüfung nimmt viel Zeit in Anspruch.',topic:'书面语'},
{id:'f018',w:'stattfinden',m:'举行，发生',ex:'Die Veranstaltung findet nächste Woche statt.',topic:'校园'},
{id:'f019',w:'überwiegen',m:'占优势，更多',ex:'In diesem Fall überwiegen die Vorteile.',topic:'讨论'},
{id:'f020',w:'die Anforderung',m:'要求',ex:'Die Anforderungen im Beruf sind sehr unterschiedlich.',topic:'职场'}
];
const WORDS=(window.COZY_WORDS&&window.COZY_WORDS.length>=20)?window.COZY_WORDS:FALLBACK;
const FOOD={milk:{emoji:'🥛',name:'牛奶',full:8,mood:3},chicken:{emoji:'🍗',name:'鸡腿',full:14,mood:5},cake:{emoji:'🍰',name:'蛋糕',full:10,mood:8},beef:{emoji:'🥩',name:'牛肉',full:18,mood:6}};
const MILESTONES=[[5,'milk'],[10,'chicken'],[15,'cake'],[20,'beef']];
const REVIEW_INTERVALS=[1,3,7,14,30];
const PET=['你一摸，小猫就把脑袋往你手心里顶了顶。♡','呼噜呼噜……这一摸看起来很专业。','小猫眯起眼睛：再摸五分钟也不是不可以。','它把两只前爪往前伸了一点，决定继续赖着。','摸摸成功！猫猫看起来精神了一点。'];
const WORK=['认真工作模式已开启。猫猫负责看起来比你更忙。','假装工作 +1。键盘不用敲太响，气势到了就行。','猫猫判断：当前页面看起来非常专业，批准继续摸鱼。','今天的办公哲学：动作可以慢，窗口必须多。'];
const EVENTS=[
['猫猫今天早上抢到了窗边最暖的一小块阳光，晒得完全不想动。','心情 +3',3,0,0],['猫猫偷偷把不存在的毛线球藏起来了，然后一脸无辜地看着你。','摸鱼值 +3',1,0,3],['猫猫做梦梦到了一大盘鸡腿，醒来以后认真检查了一遍零食柜。','饱腹感 -2，心情 +2',2,-2,0],['猫猫今天决定做你的学习监督员：你勾一个单词，它就满意一点。','心情 +2',2,0,0],['猫猫在软垫上换了七个姿势，最后发现第一个姿势最舒服。','摸鱼值 +2',1,0,2],['猫猫听见你打开网页，立刻装作自己已经在这里等很久了。','心情 +3',3,0,0],['猫猫今天特别黏人，决定把离你最近的位置占住。','心情 +4',4,0,0],['猫猫盯着德语单词看了十秒，然后非常坚定地选择了睡觉。','摸鱼值 +4',1,0,4]
].map(([text,effect,mood,full,fish])=>({text,effect,mood,full,fish}));
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const dayKey=(d=new Date())=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const offsetDate=(base,n)=>{const d=new Date(base+'T12:00:00');d.setDate(d.getDate()+n);return dayKey(d)};
const offset=n=>offsetDate(dayKey(),n);
const hash=s=>{let h=2166136261;for(const c of s){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return Math.abs(h)};
const seededShuffle=(arr,seedText)=>{const a=[...arr];let seed=hash(seedText)||1;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};for(let i=a.length-1;i>0;i--){const j=Math.floor(rand()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const sample=(a,n)=>{a=[...a];for(let i=a.length-1;i;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a.slice(0,n)};
const clamp=v=>Math.max(0,Math.min(100,Number(v)||0));
const safeParse=(s,f)=>{try{return s?JSON.parse(s):f}catch(_){return f}};
const inv=()=>safeParse(localStorage.getItem('cozy9Inventory'),{milk:0,chicken:0,cake:0,beef:0});

function loadLearning(){
  let data=safeParse(localStorage.getItem('cozyLearningV4'),null);
  if(!data||data.version!==4) data={version:4,daily:{},reviews:{},seen:[]};
  data.daily ||= {}; data.reviews ||= {}; data.seen ||= [];
  const today=dayKey();
  if(!data.daily[today]){
    const oldLearned=safeParse(localStorage.getItem('cozy9Learned-'+today),[]);
    const oldClaimed=safeParse(localStorage.getItem('cozy9Claimed-'+today),[]);
    data.daily[today]={batch:1,learned:{'1':Array.isArray(oldLearned)?oldLearned:[]},claimed:{'1':Array.isArray(oldClaimed)?oldClaimed:[]},tested:[]};
  }
  const d=data.daily[today];
  d.batch ||= 1; d.learned ||= {}; d.claimed ||= {}; d.tested ||= [];
  d.learned[String(d.batch)] ||= []; d.claimed[String(d.batch)] ||= [];
  return data;
}
const learning=loadLearning();
const todayData=()=>learning.daily[dayKey()];
const currentBatch=()=>todayData().batch;
function batchWords(batch=currentBatch()){
  const shuffled=seededShuffle(WORDS,dayKey());
  const start=((batch-1)*20)%shuffled.length;
  const result=[];for(let i=0;i<20;i++) result.push(shuffled[(start+i)%shuffled.length]);
  return result;
}
const currentWords=()=>batchWords();
const currentLearned=()=>todayData().learned[String(currentBatch())] || (todayData().learned[String(currentBatch())]=[]);
const currentClaimed=()=>todayData().claimed[String(currentBatch())] || (todayData().claimed[String(currentBatch())]=[]);

const state={mood:+(localStorage.getItem('cozy9Mood')||80),full:+(localStorage.getItem('cozy9Fullness')||60),fish:+(localStorage.getItem('cozy9Fish')||30),inventory:inv(),lastCheckin:localStorage.getItem('cozy10LastCheckin')||'',streak:+(localStorage.getItem('cozy10CheckinStreak')||0),quizRewarded:localStorage.getItem('cozy10QuizReward-'+dayKey())==='1',quiz:[],qi:0,score:0,locked:false,quizMode:'new',correctIds:[],wrongIds:[]};
function normalizeState(){state.mood=clamp(state.mood);state.full=clamp(state.full);state.fish=clamp(state.fish)}
function save(){normalizeState();localStorage.setItem('cozy9Mood',state.mood);localStorage.setItem('cozy9Fullness',state.full);localStorage.setItem('cozy9Fish',state.fish);localStorage.setItem('cozy9Inventory',JSON.stringify(state.inventory));localStorage.setItem('cozy10LastCheckin',state.lastCheckin);localStorage.setItem('cozy10CheckinStreak',state.streak);localStorage.setItem('cozyLearningV4',JSON.stringify(learning));localStorage.setItem('cozy9Learned-'+dayKey(),JSON.stringify(currentLearned()));localStorage.setItem('cozy9Claimed-'+dayKey(),JSON.stringify(currentClaimed()))}
const HOUR=60*60*1000;
function loadNeedsMeta(){
  const now=Date.now();let n=safeParse(localStorage.getItem('cozy11Needs'),{})||{};
  const last=Number(n.lastActivity)||now;n.lastActivity=last;
  n.nextFull=Number(n.nextFull)||last+3*HOUR;
  n.nextMood=Number(n.nextMood)||last+9*HOUR;
  n.nextFish=Number(n.nextFish)||last+4*HOUR;
  n.petTimes=Array.isArray(n.petTimes)?n.petTimes.map(Number).filter(Number.isFinite):[];
  n.batchFocus=Array.isArray(n.batchFocus)?n.batchFocus:[];
  n.quizFocus=Array.isArray(n.quizFocus)?n.quizFocus:[];
  n.reviewFocusDay=String(n.reviewFocusDay||'');n.returnBonusDay=String(n.returnBonusDay||'');
  return n;
}
const needs=loadNeedsMeta();
function saveNeedsMeta(){needs.petTimes=needs.petTimes.slice(-20);needs.batchFocus=needs.batchFocus.slice(-120);needs.quizFocus=needs.quizFocus.slice(-120);localStorage.setItem('cozy11Needs',JSON.stringify(needs))}
function markCatActivity(now=Date.now()){
  needs.lastActivity=now;needs.nextFull=now+3*HOUR;needs.nextMood=now+9*HOUR;needs.nextFish=now+4*HOUR;saveNeedsMeta();
}
function applyPassiveNeeds(now=Date.now()){
  let changed=false;
  if(now>=needs.nextFull){const steps=Math.floor((now-needs.nextFull)/HOUR)+1;state.full=clamp(state.full-steps);needs.nextFull+=steps*HOUR;changed=true}
  if(now>=needs.nextFish){const steps=Math.floor((now-needs.nextFish)/(2*HOUR))+1;state.fish=clamp(state.fish+steps*3);needs.nextFish+=steps*2*HOUR;changed=true}
  let guard=0;while(now>=needs.nextMood&&guard++<10000){state.mood=clamp(state.mood-1);const age=needs.nextMood-needs.lastActivity;needs.nextMood+=age>=24*HOUR?2*HOUR:3*HOUR;changed=true}
  saveNeedsMeta();return changed;
}
function maybeReturnBonus(awayMs){if(awayMs<6*HOUR||needs.returnBonusDay===dayKey())return false;state.mood=clamp(state.mood+3);needs.returnBonusDay=dayKey();saveNeedsMeta();return true}
function catMoodLine(){if(state.mood<20)return'猫猫缩成一小团，今天不太想动。<br>不过你回来以后，它悄悄抬头看了你一眼。';if(state.mood<40)return'猫猫今天有点蔫，安安静静地趴着。<br>好像已经等你一阵子啦。';if(state.mood<70)return'猫猫今天有一点安静，<br>听见你回来以后尾巴轻轻动了一下。';return'听见你回来，小猫立刻抬起头看你。♡'}
function applyFocusOnce(bucket,token,amount){const list=needs[bucket];if(list.includes(token))return false;list.push(token);state.fish=clamp(state.fish-amount);saveNeedsMeta();return true}
function speech(t){const e=$('#speech');if(e)e.innerHTML=t}
function toast(t){const e=$('#toast');if(!e)return; e.textContent=t;e.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>e.classList.remove('show'),1800)}
function animate(c){const e=$('#catWrap');if(!e)return;e.classList.remove('petting','eating');void e.offsetWidth;e.classList.add(c);setTimeout(()=>e.classList.remove(c),900)}
function hearts(){const cat=$('#cat');if(!cat)return;const r=cat.getBoundingClientRect();if(!r.width)return;for(let i=0;i<7;i++){const h=document.createElement('div');h.textContent='♥';Object.assign(h.style,{position:'fixed',zIndex:'1004',pointerEvents:'none',color:i%2?'#f3a1b5':'#ef7fa1',fontSize:(20+Math.random()*14)+'px',left:(r.left+r.width*(.25+Math.random()*.5))+'px',top:(r.top+r.height*(.38+Math.random()*.18))+'px',filter:'drop-shadow(0 2px 3px rgba(173,70,100,.18))'});document.body.appendChild(h);h.animate([{transform:'translate(0,8px) scale(.7)',opacity:0},{opacity:1,offset:.18},{transform:`translate(${(Math.random()-.5)*54}px,-${70+Math.random()*55}px) scale(1.15)`,opacity:0}],{duration:950+Math.random()*350,delay:i*55,easing:'ease-out',fill:'forwards'});setTimeout(()=>h.remove(),1500)}}
function flyFood(k,source){
  const cat=$('#cat'); if(!cat)return;
  const cr=cat.getBoundingClientRect();
  if(!cr.width)return;
  const sr=source?.getBoundingClientRect?.();
  const sx=sr&&sr.width?sr.left+sr.width/2:innerWidth/2, sy=sr&&sr.height?sr.top+sr.height/2:innerHeight*.78;
  const tx=cr.left+cr.width*.52, ty=cr.top+cr.height*.55;
  const f=document.createElement('div');f.textContent=FOOD[k].emoji;Object.assign(f.style,{position:'fixed',left:sx+'px',top:sy+'px',zIndex:'1005',fontSize:'44px',pointerEvents:'none',transform:'translate(-50%,-50%)'});document.body.appendChild(f);
  const dx=tx-sx,dy=ty-sy;
  f.animate([{transform:'translate(-50%,-50%) scale(.8)',opacity:.2},{transform:`translate(calc(-50% + ${dx*.5}px),calc(-50% + ${dy*.35-42}px)) scale(1.15)`,opacity:1,offset:.55},{transform:`translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px)) scale(.45)`,opacity:0}],{duration:850,easing:'cubic-bezier(.22,.7,.2,1)',fill:'forwards'});
  setTimeout(()=>f.remove(),900);
}
function catStatusText(){if(state.full<=28)return'饿坏啦';if(state.mood<20)return'很失落';if(state.mood<40)return'有点蔫';if(state.fish>=75)return'睡着了';if(state.mood<70)return'有点安静';if(state.full>=75)return'吃饱啦';if(state.mood>=80)return'很开心';return'在等你'}
function renderStatus(){normalizeState();[['mood',state.mood],['food',state.full],['fish',state.fish]].forEach(([k,v])=>{const n=$('#'+k+'Num'),b=$('#'+(k==='food'?'food':k)+'Bar');if(n)n.textContent=Math.round(v)+'%';if(b)b.style.width=v+'%'});const pm=$('#profileMood');if(pm)pm.textContent=catStatusText()}
function renderInventory(){for(const k of Object.keys(FOOD)){const C=k[0].toUpperCase()+k.slice(1);['#count'+C,'#sheetCount'+C,'#mini'+C].forEach(s=>{const e=$(s);if(e)e.textContent=state.inventory[k]||0})}const p=$('#profileInventory');if(p)p.textContent=Object.values(state.inventory).reduce((a,b)=>a+b,0)}
function dueReviews(){const today=dayKey();return Object.entries(learning.reviews).filter(([,r])=>r&&r.due&&r.due<=today).map(([id])=>WORDS.find(w=>w.id===id)).filter(Boolean)}
function installStudyTools(){
  const page=$('.page[data-page="study"] .card.section'); if(!page)return;
  const title=page.querySelector('.section-title'); if(title) title.textContent='📘 TestDaF 单词学习';
  const helper=title?.nextElementSibling; if(helper) helper.textContent='每组 20 个新词；完成小测后可以继续下一组。旧词会按节奏回来复习。♡';
  if(!$('#studyTools')){
    const box=document.createElement('div');box.id='studyTools';box.innerHTML=`<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:12px 0"><button id="newWordsTab" class="subbtn checkin-btn" type="button" style="margin:0">📘 第 <span id="batchNum">1</span> 组新词</button><button id="reviewBtn" class="subbtn event-btn" type="button" style="margin:0">🧠 今日复习 <span id="reviewCount">0</span></button></div><div id="batchNote" class="helper" style="margin-bottom:10px"></div>`;
    const prog=page.querySelector('.progress');page.insertBefore(box,prog);
    $('#reviewBtn').addEventListener('click',()=>startQuiz('review'));
  }
  if(!$('#nextBatchBtn')){
    const b=document.createElement('button');b.id='nextBatchBtn';b.className='subbtn checkin-btn';b.type='button';b.style.display='none';b.textContent='✨ 继续下一组 20 个新词';
    const note=$('#remainingNote');note.insertAdjacentElement('afterend',b);b.addEventListener('click',nextBatch);
  }
}
function renderWords(){
  installStudyTools();
  const words=currentWords(), learned=currentLearned(); const box=$('#wordList'); if(!box)return; box.innerHTML='';
  words.forEach((w,i)=>{const d=document.createElement('label');d.className='word-card';d.innerHTML=`<input type="checkbox" ${learned.includes(i)?'checked':''}><div class="word-main"><div class="de">${w.w}</div><div class="cn">${w.m}</div><div class="meta2">${w.topic} · ${w.ex}</div></div>`;d.querySelector('input').addEventListener('change',()=>toggle(i));box.appendChild(d)});
  $('#learnedCount').textContent=learned.length;$('#progressFill').style.width=(learned.length/20*100)+'%';$('#remainingNote').textContent=learned.length===20?'这组 20 个词完成啦！去做小测吧 ♡':`……这组还有 ${20-learned.length} 个单词等着你！♡`;
  $('#batchNum').textContent=currentBatch();$('#reviewCount').textContent=dueReviews().length;$('#batchNote').textContent=`词库 ${WORDS.length} 词 · 今天第 ${currentBatch()} 组 · 已累计见过 ${learning.seen.length} 个不同单词`;
  const tested=todayData().tested.includes(currentBatch());$('#nextBatchBtn').style.display=(learned.length===20&&tested)?'block':'none';
  const pw=$('#profileWords');if(pw)pw.textContent=learning.seen.length;const sw=$('#sumWords');if(sw)sw.textContent=`${learned.length} / 20 · 第${currentBatch()}组`;
}
function rewards(){const learned=currentLearned(),claimed=currentClaimed();for(const [n,k] of MILESTONES){if(learned.length>=n&&!claimed.includes(n)){state.inventory[k]=(state.inventory[k]||0)+1;claimed.push(n);toast(`学习奖励 +1：${FOOD[k].emoji} ${FOOD[k].name}`);speech(`太棒啦！这组学到 ${n} 个词了，<br>小猫得到了一份${FOOD[k].name}！`)}}renderInventory();save()}
function toggle(i){const learned=currentLearned();const p=learned.indexOf(i);if(p>=0)learned.splice(p,1);else{learned.push(i);const id=currentWords()[i]?.id;if(id&&!learning.seen.includes(id))learning.seen.push(id)}state.mood=clamp(state.mood+.8);if(p<0&&learned.length===20){const token=dayKey()+':'+currentBatch();if(applyFocusOnce('batchFocus',token,8))toast('学完这一组：摸鱼值 -8 ✨')}renderWords();rewards();renderStatus();renderSummary();save()}
function pet(){const now=Date.now();needs.petTimes=needs.petTimes.filter(t=>now-t<15*60*1000);const tier=Math.min(needs.petTimes.length,3),moodGain=[8,5,2,0][tier],fishDrop=[2,1,1,0][tier];needs.petTimes.push(now);saveNeedsMeta();state.mood=clamp(state.mood+moodGain);state.fish=clamp(state.fish-fishDrop);const extra=moodGain?`<br>心情 +${moodGain}${fishDrop?`，摸鱼值 -${fishDrop}`:''}`:'<br>它已经被摸得很满足啦，再摸也只负责呼噜。';speech(PET[Math.floor(Math.random()*PET.length)]+extra);animate('petting');hearts();renderStatus();renderSummary();save()}
function work(){state.fish=clamp(state.fish+10);state.full=clamp(state.full-2);speech(WORK[Math.floor(Math.random()*WORK.length)]);renderStatus();renderSummary();save()}
function page(n){$$('.page').forEach(x=>x.classList.toggle('active',x.dataset.page===n));$$('[data-nav]').forEach(x=>x.classList.toggle('active',x.dataset.nav===n));scrollTo({top:0,behavior:'smooth'})}
function feed(k,source){if(!(state.inventory[k]>0)){toast('这个奖励还没有哦，先去学单词吧');return}state.inventory[k]--;state.full=clamp(state.full+FOOD[k].full);state.mood=clamp(state.mood+FOOD[k].mood);state.fish=clamp(state.fish-4);closeReward();page('home');setTimeout(()=>{flyFood(k,source);setTimeout(()=>{animate('eating');hearts()},560)},80);speech(`${FOOD[k].emoji} ${FOOD[k].name}送达！小猫认真开饭啦。<br>摸鱼值 -4`);renderInventory();renderStatus();renderSummary();save()}
function quickFeed(){const k=['beef','chicken','cake','milk'].find(x=>state.inventory[x]>0);if(!k){speech('先完成今天的德福词，<br>给小猫赚点好吃的吧！');toast('零食柜还是空的～');return}feed(k,$('#quickFeedBtn'))}
function renderCheckin(){const done=state.lastCheckin===dayKey();$('#checkinState').textContent=done?'今天已签到':'今天还没签到';$('#streakNumber').textContent=state.streak;$('#checkinBtn').disabled=done;$('#checkinBtn').textContent=done?'今天已经签到啦 ♡':'今日签到 ♡';$('#profileStreak').textContent=state.streak+' 天';$('#sumCheckin').textContent=done?'已签到':'未签到'}
function checkin(){if(state.lastCheckin===dayKey())return toast('今天已经签到过啦 ♡');state.streak=state.lastCheckin===offset(-1)?state.streak+1:1;state.lastCheckin=dayKey();state.inventory.milk++;let b='🥛 牛奶 +1';if(state.streak%14===0){state.inventory.beef++;b+='，🥩 牛肉 +1'}else if(state.streak%7===0){state.inventory.cake++;b+='，🍰 蛋糕 +1'}else if(state.streak%3===0){state.inventory.chicken++;b+='，🍗 鸡腿 +1'}state.mood=clamp(state.mood+2);speech('签到成功！<br>'+b+'。小猫已经记住你今天来过啦。♡');toast('签到成功：'+b);renderCheckin();renderInventory();renderStatus();renderSummary();save()}
function eventObj(){return EVENTS[hash('event-'+dayKey())%EVENTS.length]}
function event(){const e=eventObj();$('#dailyEventText').textContent=e.text;$('#dailyEventEffect').textContent='今日效果：'+e.effect;const k='cozy10EventApplied-'+dayKey();if(localStorage.getItem(k)!=='1'){state.mood=clamp(state.mood+e.mood);state.full=clamp(state.full+e.full);state.fish=clamp(state.fish+e.fish);localStorage.setItem(k,'1');save();renderStatus();renderSummary()}speech(e.text)}
function openQuiz(){$('#quizOverlay').classList.add('show')}function closeQuiz(){$('#quizOverlay').classList.remove('show')}function openReward(){$('#rewardOverlay').classList.add('show')}function closeReward(){$('#rewardOverlay').classList.remove('show')}
function startQuiz(mode='new'){
  state.quizMode=mode;state.qi=0;state.score=0;state.correctIds=[];state.wrongIds=[];
  let pool=mode==='review'?dueReviews():currentWords();
  if(mode==='new'&&currentLearned().length<20){toast('先把这组 20 个词都勾完，再来小测吧 ♡');return}
  if(mode==='review'&&!pool.length){toast('今天没有到期复习的词，猫猫准你休息一下～');return}
  state.quiz=sample(pool,mode==='review'?Math.min(10,pool.length):5).map(w=>{const wrong=sample(WORDS.filter(x=>x.id!==w.id&&x.m!==w.m),3).map(x=>x.m);return{...w,a:w.m,o:sample([w.m,...wrong],4)}});
  const title=$('#quizOverlay .sheet-title');if(title)title.textContent=mode==='review'?'🧠 今日复习':'📝 第 '+currentBatch()+' 组小测验';openQuiz();showQ();
}
function showQ(){if(state.qi>=state.quiz.length)return finishQuiz();const q=state.quiz[state.qi];$('#quizScoreLabel').textContent=`第 ${state.qi+1} / ${state.quiz.length} 题 · 已答对 ${state.score} 题`;$('#quizProgressFill').style.width=(state.qi/state.quiz.length*100)+'%';state.locked=false;$('#quizStage').innerHTML=`<div class="quiz-q">${q.w}</div><div class="quiz-sub">请选择最合适的中文意思：</div><div class="quiz-options">${q.o.map((x,i)=>`<button class="quiz-option" type="button" data-i="${i}">${x}</button>`).join('')}</div>`;$$('[data-i]',$('#quizStage')).forEach((b,i)=>b.addEventListener('click',()=>answer(b,q.o[i],q.a,q.id)))}
function answer(btn,x,a,id){if(state.locked)return;state.locked=true;$$('.quiz-option',$('#quizStage')).forEach(b=>{if(b.textContent===a)b.classList.add('correct');else if(b===btn&&x!==a)b.classList.add('wrong');b.disabled=true});if(x===a){state.score++;state.correctIds.push(id);speech('答对啦！猫猫认真地点了点头。♡')}else{state.wrongIds.push(id);speech('差一点点～正确答案已经亮出来啦。')}setTimeout(()=>{state.qi++;showQ()},700)}
function scheduleNewBatchReviews(){const tomorrow=offset(1);for(const w of currentWords()){const r=learning.reviews[w.id]||{stage:0,correct:0,wrong:0};r.due=r.due||tomorrow;r.stage=Math.max(0,r.stage||0);learning.reviews[w.id]=r}for(const id of state.wrongIds){const r=learning.reviews[id]||{stage:0,correct:0,wrong:0};r.stage=0;r.due=tomorrow;r.wrong=(r.wrong||0)+1;learning.reviews[id]=r}for(const id of state.correctIds){const r=learning.reviews[id]||{stage:0,correct:0,wrong:0};r.correct=(r.correct||0)+1;r.due=r.due||tomorrow;learning.reviews[id]=r}}
function updateReviewSchedule(){const today=dayKey();for(const q of state.quiz){const r=learning.reviews[q.id]||{stage:0,correct:0,wrong:0};if(state.correctIds.includes(q.id)){r.stage=Math.min(4,(r.stage||0)+1);r.correct=(r.correct||0)+1;r.due=offsetDate(today,REVIEW_INTERVALS[r.stage])}else{r.stage=0;r.wrong=(r.wrong||0)+1;r.due=offsetDate(today,1)}learning.reviews[q.id]=r}}
function finishQuiz(){
  if(state.quizMode==='review'){
    updateReviewSchedule();$('#quizProgressFill').style.width='100%';$('#quizScoreLabel').textContent='复习完成 · '+state.score+' / '+state.quiz.length;$('#quizStage').innerHTML=`<div class="quiz-result"><div class="score-big">${state.score} / ${state.quiz.length}</div><div>${state.score===state.quiz.length?'全对！这些词记得很稳。':state.score>=Math.ceil(state.quiz.length*.6)?'不错，复习节奏继续保持。':'没关系，答错的词明天会更快回来。'}</div><div class="micro-note">答对的词会延长复习间隔；答错的词明天再见。</div><button class="subbtn event-btn" id="restartQuizBtn" type="button" style="max-width:240px">继续复习</button></div>`;$('#restartQuizBtn').addEventListener('click',()=>startQuiz('review'));
  }else{
    scheduleNewBatchReviews();if(!todayData().tested.includes(currentBatch()))todayData().tested.push(currentBatch());let k=null;if(state.score===5)k='cake';else if(state.score===4)k='chicken';else if(state.score>=3)k='milk';let t='答对 3 题以上就能领小奖励，再试一次吧。';if(!state.quizRewarded&&k){state.inventory[k]++;state.quizRewarded=true;localStorage.setItem('cozy10QuizReward-'+dayKey(),'1');t=`今天第一次小测奖励：${FOOD[k].emoji} ${FOOD[k].name} +1`}else if(state.quizRewarded)t='今天的小测奖励已经领过啦；但完成这一组后仍可开启下一组新词。';$('#quizProgressFill').style.width='100%';$('#quizScoreLabel').textContent='完成 · '+state.score+' / 5';$('#quizStage').innerHTML=`<div class="quiz-result"><div class="score-big">${state.score} / 5</div><div>${state.score===5?'全对！猫猫已经开始骄傲了。':state.score>=3?'不错呀，已经记住大部分了。':'答错的词已经加入复习队列。'}</div><div class="micro-note">${t}</div><button class="subbtn event-btn" id="restartQuizBtn" type="button" style="max-width:240px">再来 5 题</button></div>`;$('#restartQuizBtn').addEventListener('click',()=>startQuiz('new'));
  }
  if(state.quizMode==='review'){if(needs.reviewFocusDay!==dayKey()){state.fish=clamp(state.fish-8);needs.reviewFocusDay=dayKey();saveNeedsMeta();toast('完成复习：摸鱼值 -8 ✨')}}else{const token=dayKey()+':'+currentBatch();if(applyFocusOnce('quizFocus',token,10))toast('完成小测：摸鱼值 -10 ✨')}
  state.mood=clamp(state.mood+state.score);renderInventory();renderStatus();renderWords();renderSummary();save();
}
function nextBatch(){if(currentLearned().length<20||!todayData().tested.includes(currentBatch()))return toast('这组先学完并完成小测哦 ♡');todayData().batch++;todayData().learned[String(todayData().batch)] ||= [];todayData().claimed[String(todayData().batch)] ||= [];closeQuiz();renderWords();speech(`第 ${currentBatch()} 组 20 个新词来啦！<br>猫猫继续陪你。♡`);toast('新的 20 个词已经准备好啦！');save();scrollTo({top:0,behavior:'smooth'})}
function renderSummary(){$('#sumQuiz').textContent=state.quizRewarded?'已领取':'未领取';$('#sumCat').textContent=catStatusText()}

const cozyStartedAt=Date.now(),cozyAway=cozyStartedAt-needs.lastActivity;
const cozyPassiveChanged=applyPassiveNeeds(cozyStartedAt),cozyReturnBonus=maybeReturnBonus(cozyAway);
markCatActivity(cozyStartedAt);if(cozyPassiveChanged||cozyReturnBonus){renderStatus();renderSummary();save()}if(cozyAway>=6*HOUR)speech(catMoodLine());
let cozyLastInput=cozyStartedAt,cozyActiveSeconds=0;
function cozyUserActive(){cozyLastInput=Date.now();markCatActivity(cozyLastInput)}
document.addEventListener('pointerdown',cozyUserActive,true);document.addEventListener('keydown',cozyUserActive,true);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState!=='visible')return;const now=Date.now(),away=now-needs.lastActivity,changed=applyPassiveNeeds(now),bonus=maybeReturnBonus(away);markCatActivity(now);cozyLastInput=now;if(changed||bonus){renderStatus();renderSummary();save()}if(away>=6*HOUR)speech(catMoodLine())});
setInterval(()=>{const now=Date.now();let changed=applyPassiveNeeds(now);if(!document.hidden&&now-cozyLastInput<2*60*1000){cozyActiveSeconds+=60;if(cozyActiveSeconds>=600){cozyActiveSeconds=0;state.fish=clamp(state.fish-3);toast('陪猫学习 10 分钟：摸鱼值 -3 ✨');changed=true}}else cozyActiveSeconds=0;if(changed){renderStatus();renderSummary();save()}},60*1000);
$('#petBtn').addEventListener('click',pet);$('#cat').addEventListener('click',pet);$('#quickFeedBtn').addEventListener('click',quickFeed);$('#workBtn').addEventListener('click',work);$('#checkinBtn').addEventListener('click',checkin);$('#eventBtn').addEventListener('click',event);
['#toQuizBtn','#floatQuizBtn','#openQuizFromStudy'].forEach(s=>$(s)?.addEventListener('click',()=>startQuiz('new')));['#toRewardsBtn','#floatRewardsBtn','#openRewardsFromStudy'].forEach(s=>$(s)?.addEventListener('click',openReward));$('#closeQuizBtn').addEventListener('click',closeQuiz);$('#closeRewardBtn').addEventListener('click',closeReward);$('#startQuizBtn').addEventListener('click',()=>startQuiz('new'));$('#quizOverlay').addEventListener('click',e=>{if(e.target.id==='quizOverlay')closeQuiz()});$('#rewardOverlay').addEventListener('click',e=>{if(e.target.id==='rewardOverlay')closeReward()});$$('[data-feed]').forEach(b=>b.addEventListener('click',()=>feed(b.dataset.feed,b)));$$('[data-nav]').forEach(b=>b.addEventListener('click',()=>page(b.dataset.nav)));
renderStatus();renderWords();rewards();renderInventory();renderCheckin();event();renderSummary();save();
if('serviceWorker'in navigator)addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
})();

(async()=>{
'use strict';
try{if(!window.COZY_WORDS)await import('./words.js?v=10')}catch(err){console.error('study prep words load failed',err);return}

const words=Array.isArray(window.COZY_WORDS)?[...window.COZY_WORDS]:[];
if(words.length<20)return;
const safeParse=(s,f)=>{try{return s?JSON.parse(s):f}catch(_){return f}};
const dayKey=(d=new Date())=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const offsetDate=(base,n)=>{const d=new Date(base+'T12:00:00');d.setDate(d.getDate()+n);return dayKey(d)};
const hash=s=>{let h=2166136261;for(const c of s){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return Math.abs(h)};
const seededShuffle=(arr,seedText)=>{const a=[...arr];let seed=hash(seedText)||1;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};for(let i=a.length-1;i>0;i--){const j=Math.floor(rand()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};

let learning=safeParse(localStorage.getItem('cozyLearningV4'),null);
if(!learning||learning.version!==4)learning={version:4,daily:{},reviews:{},seen:[]};
learning.daily ||= {};learning.reviews ||= {};learning.seen=Array.isArray(learning.seen)?learning.seen:[];
const today=dayKey();
if(!learning.daily[today]){
  const oldLearned=safeParse(localStorage.getItem('cozy9Learned-'+today),[]);
  const oldClaimed=safeParse(localStorage.getItem('cozy9Claimed-'+today),[]);
  learning.daily[today]={batch:1,learned:{'1':Array.isArray(oldLearned)?oldLearned:[]},claimed:{'1':Array.isArray(oldClaimed)?oldClaimed:[]},tested:[]};
}
const todayData=learning.daily[today];
todayData.batch ||= 1;todayData.learned ||= {};todayData.claimed ||= {};todayData.tested ||= [];
todayData.learned[String(todayData.batch)] ||= [];todayData.claimed[String(todayData.batch)] ||= [];

// Older saves could remember a word in `seen` without having a review date.
// Recover those words gently instead of dumping the whole backlog into one day.
const knownIds=new Set(words.map(w=>w.id));
const missingReviews=learning.seen.filter(id=>knownIds.has(id)&&!learning.reviews[id]);
missingReviews.forEach((id,i)=>{
  learning.reviews[id]={stage:0,correct:0,wrong:0,due:offsetDate(today,1+Math.floor(i/10))};
});

const hasProgress=Object.values(todayData.learned).some(v=>Array.isArray(v)&&v.length>0)
  ||Object.values(todayData.claimed).some(v=>Array.isArray(v)&&v.length>0)
  ||todayData.tested.length>0;
const stored=Array.isArray(todayData.plannedWordOrder)?todayData.plannedWordOrder:[];
const storedValid=stored.length===words.length&&stored.every(id=>knownIds.has(id));
if(!storedValid){
  let desired;
  if(hasProgress){
    // Preserve the old order for a day that was already started before this upgrade.
    desired=seededShuffle(words,today);
  }else{
    const seen=new Set(learning.seen);
    const unseen=seededShuffle(words.filter(w=>!seen.has(w.id)),today+':unseen');
    const familiar=seededShuffle(words.filter(w=>seen.has(w.id)),today+':familiar');
    desired=[...unseen,...familiar];
  }
  todayData.plannedWordOrder=desired.map(w=>w.id);
}
localStorage.setItem('cozyLearningV4',JSON.stringify(learning));

// app-core performs its own deterministic daily shuffle. Build the inverse input
// so that its final order is exactly our persisted unseen-first plan.
const byId=new Map(words.map(w=>[w.id,w]));
const desired=todayData.plannedWordOrder.map(id=>byId.get(id)).filter(Boolean);
if(desired.length!==words.length)return;
const permutation=seededShuffle([...Array(words.length).keys()],today);
const input=new Array(words.length);
permutation.forEach((sourceIndex,outputIndex)=>{input[sourceIndex]=desired[outputIndex]});
window.COZY_WORDS=input;
})();

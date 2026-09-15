(()=>{
'use strict';
const $=(s,r=document)=>r.querySelector(s);
const safeParse=(s,f)=>{try{return s?JSON.parse(s):f}catch(_){return f}};
const dayKey=(d=new Date())=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const words=()=>Array.isArray(window.COZY_WORDS)?window.COZY_WORDS:[];
const learning=()=>{const x=safeParse(localStorage.getItem('cozyLearningV4'),{})||{};x.seen=Array.isArray(x.seen)?x.seen:[];x.reviews=x.reviews||{};return x};
const wordMap=()=>new Map(words().map(w=>[w.id,w]));

function statusFor(id,l){
  const r=l.reviews?.[id];
  if(!r||!r.due)return'已学习 · 等待复习安排';
  const stage=Math.max(0,Number(r.stage)||0)+1;
  if(String(r.due)<=dayKey())return`今天该复习 · 记忆阶段 ${stage}`;
  const p=String(r.due).split('-');
  return`下次复习 ${Number(p[1])}月${Number(p[2])}日 · 记忆阶段 ${stage}`;
}
function renderWordbook(query=''){
  const list=$('#wordbookList');if(!list)return;
  const l=learning(),map=wordMap();
  const all=l.seen.map(id=>map.get(id)).filter(Boolean).reverse();
  const q=String(query||'').trim().toLowerCase();
  const shown=q?all.filter(w=>`${w.w} ${w.m} ${w.topic} ${w.ex}`.toLowerCase().includes(q)):all;
  const count=$('#wordbookCountText');if(count)count.textContent=`已学 ${all.length} 个 · 当前显示 ${shown.length} 个`;
  list.innerHTML=shown.length?shown.map(w=>`<div class="word-card" style="display:block;margin-bottom:10px"><div class="word-main"><div class="de">${w.w}</div><div class="cn">${w.m}</div><div class="meta2">${w.topic} · ${w.ex}</div><div class="helper" style="margin-top:7px;font-size:11px">${statusFor(w.id,l)}</div></div></div>`).join(''):'<div class="center-note" style="padding:24px 8px">还没有找到对应的单词～</div>';
}
function installWordbook(){
  if($('#wordbookOverlay'))return;
  const o=document.createElement('div');o.id='wordbookOverlay';o.className='overlay';
  o.innerHTML=`<div class="sheet"><div class="sheet-handle"></div><div class="sheet-head"><div class="sheet-title">📚 我的已学词库</div><button class="close" id="closeWordbookBtn" type="button">✕</button></div><div class="helper" id="wordbookCountText" style="margin-bottom:10px"></div><input id="wordbookSearch" type="search" placeholder="搜索德语、中文、主题或例句" style="box-sizing:border-box;width:100%;border:1px solid #e7d8ca;border-radius:14px;padding:12px 14px;background:#fffaf5;color:#5f4b3e;font:inherit;outline:none;margin-bottom:12px"><div id="wordbookList" style="max-height:58vh;overflow:auto;padding-right:2px"></div></div>`;
  document.body.appendChild(o);
  $('#closeWordbookBtn').addEventListener('click',()=>o.classList.remove('show'));
  $('#wordbookSearch').addEventListener('input',e=>renderWordbook(e.target.value));
  o.addEventListener('click',e=>{if(e.target===o)o.classList.remove('show')});
}
function openWordbook(){installWordbook();const input=$('#wordbookSearch');if(input)input.value='';renderWordbook();$('#wordbookOverlay')?.classList.add('show')}
function refreshCounts(){
  const l=learning();
  const seen=$('#seenCount');if(seen)seen.textContent=l.seen.length;
  const note=$('#batchNote');
  if(note){const batch=$('#batchNum')?.textContent||'1';note.textContent=`词库 ${words().length} 词 · 今天第 ${batch} 组 · 新词优先不重复 · 已累计学习 ${l.seen.length} 个不同单词`}
}
function install(){
  const tools=$('#studyTools');if(!tools)return false;
  const page=$('.page[data-page="study"] .card.section');
  const title=page?.querySelector('.section-title');const helper=title?.nextElementSibling;
  if(helper)helper.textContent='今日新词每天更新，并优先给你没见过的词；到期旧词去「今日复习」，所有学过的词都会一直留在「已学词库」。♡';
  const grid=tools.firstElementChild;
  if(grid){grid.style.gridTemplateColumns='repeat(3,minmax(0,1fr))';grid.style.gap='8px'}
  const newBtn=$('#newWordsTab');
  if(newBtn){newBtn.style.padding='10px 6px';newBtn.innerHTML=`📘 今日新词<br><span style="font-size:11px;opacity:.78">第 <span id="batchNum">${$('#batchNum')?.textContent||1}</span> 组</span>`;newBtn.addEventListener('click',()=>$('#wordList')?.scrollIntoView({behavior:'smooth',block:'start'}))}
  const review=$('#reviewBtn');
  if(review){const n=$('#reviewCount')?.textContent||0;review.style.padding='10px 6px';review.innerHTML=`🧠 今日复习<br><span style="font-size:11px;opacity:.78"><span id="reviewCount">${n}</span> 个到期</span>`}
  if(!$('#wordbookBtn')&&grid){const b=document.createElement('button');b.id='wordbookBtn';b.className='subbtn';b.type='button';b.style.cssText='margin:0;padding:10px 6px;background:#efe7dd;color:#654f41';b.innerHTML='📚 已学词库<br><span style="font-size:11px;opacity:.78"><span id="seenCount">0</span> 个</span>';b.addEventListener('click',openWordbook);grid.appendChild(b)}
  refreshCounts();installWordbook();
  const profile=$('#profileWords');if(profile)new MutationObserver(refreshCounts).observe(profile,{childList:true,subtree:true,characterData:true});
  window.addEventListener('storage',e=>{if(e.key==='cozyLearningV4')refreshCounts()});
  return true;
}
let tries=0;const timer=setInterval(()=>{if(install()||++tries>40)clearInterval(timer)},100);
})();

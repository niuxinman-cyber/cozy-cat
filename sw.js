const CACHE = "cozy-cat-cute-v27";
const ASSETS = [
  "./", "./index.html", "./style.css", "./app.js", "./app-core.js", "./words.js", "./save-guard.js", "./legacy.html",
  "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./cat-anim.js", "./cat-anim.css", "./study-prep.js?v=1", "./study-library.js?v=1", "./cozy-world.js?v=2", "./cozy-world.css", "./cat-moments.js?v=1",
  "./assets/cat-idle.avif", "./assets/cat-happy.avif", "./assets/cat-hungry.avif",
  "./assets/cat-sleep.avif", "./assets/cat-eat.avif", "./assets/cat-celebrate.avif"
];

const LEARNING_MIGRATION_FIX = `(()=>{try{
  const marker='cozyV11LegacyLearningFixed';
  if(localStorage.getItem(marker)==='1') return;
  const now=new Date();
  const today=now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0')+'-'+String(now.getDate()).padStart(2,'0');
  const raw=localStorage.getItem('cozyLearningV4');
  if(!raw){localStorage.setItem(marker,'1');return;}
  const data=JSON.parse(raw);
  const day=data&&data.daily&&data.daily[today];
  const learned=day&&day.learned&&day.learned['1'];
  const tested=(day&&Array.isArray(day.tested))?day.tested:[];
  if(data&&data.version===4&&day&&Number(day.batch)===1&&Array.isArray(learned)&&learned.length===20&&tested.length===0){
    let h=2166136261;
    for(const c of today){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}
    h=Math.abs(h);
    data.seen=Array.isArray(data.seen)?data.seen:[];
    data.reviews=data.reviews||{};
    const tomorrowDate=new Date(now.getFullYear(),now.getMonth(),now.getDate()+1);
    const tomorrow=tomorrowDate.getFullYear()+'-'+String(tomorrowDate.getMonth()+1).padStart(2,'0')+'-'+String(tomorrowDate.getDate()).padStart(2,'0');
    for(const pos of learned){
      const i=Number(pos);
      if(!Number.isInteger(i)||i<0||i>19) continue;
      const oldIndex=(h+i)%40;
      const id='w'+String(oldIndex+1).padStart(4,'0');
      if(!data.seen.includes(id)) data.seen.push(id);
      const r=data.reviews[id]||{stage:0,correct:0,wrong:0};
      r.stage=Math.max(0,Number(r.stage)||0);
      r.due=r.due||tomorrow;
      data.reviews[id]=r;
    }
    day.learned['1']=[];
    day.claimed=day.claimed||{};
    day.claimed['1']=[];
    day.migrationFixedV11=true;
    localStorage.setItem('cozyLearningV4',JSON.stringify(data));
    localStorage.setItem('cozy9Learned-'+today,'[]');
    localStorage.setItem('cozy9Claimed-'+today,'[]');
  }
  localStorage.setItem(marker,'1');
}catch(_){}})();\n`;

async function decorateApp(response){
  if(!response||!response.ok)return response;
  const text=await response.text();
  const headers=new Headers(response.headers);
  headers.delete('content-length');headers.delete('content-encoding');headers.set('content-type','application/javascript; charset=utf-8');
  return new Response(LEARNING_MIGRATION_FIX+text,{status:response.status,statusText:response.statusText,headers});
}
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)));self.skipWaiting()});
self.addEventListener('activate',event=>{event.waitUntil((async()=>{const keys=await caches.keys();await Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)));await self.clients.claim();const windows=await self.clients.matchAll({type:'window',includeUncontrolled:true});for(const client of windows){try{await client.navigate(client.url)}catch(_){}}})())});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  if(event.request.mode==='navigate'){
    event.respondWith((async()=>{try{const response=await fetch(event.request,{cache:'no-store'});const copy=response.clone();caches.open(CACHE).then(cache=>cache.put('./index.html',copy));return response}catch(_){return(await caches.match('./index.html'))||Response.error()}})());return;
  }
  if(url.pathname.endsWith('/app.js')){
    event.respondWith((async()=>{try{return await decorateApp(await fetch(event.request,{cache:'no-store'}))}catch(_){const cached=(await caches.match(event.request))||(await caches.match('./app.js'));return cached?decorateApp(cached):Response.error()}})());return;
  }
  event.respondWith(fetch(event.request,{cache:'no-store'}).then(response=>{const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));return response}).catch(()=>caches.match(event.request)));
});

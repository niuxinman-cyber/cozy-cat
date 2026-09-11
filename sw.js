const CACHE = "cozy-cat-cute-v10";
const ASSETS = ["./", "./index.html", "./style.css", "./app.js", "./words.js", "./save-guard.js", "./legacy.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
    const windows = await self.clients.matchAll({type:"window", includeUncontrolled:true});
    for (const client of windows) {
      try { await client.navigate(client.url); } catch (_) {}
    }
  })());
});

self.addEventListener("fetch", event => {
  if(event.request.method !== "GET") return;
  if(event.request.mode === "navigate"){
    event.respondWith((async()=>{
      try{
        const response = await fetch(event.request,{cache:"no-store"});
        const copy = response.clone();
        caches.open(CACHE).then(cache=>cache.put("./index.html",copy));
        return response;
      }catch(_){
        return (await caches.match("./index.html")) || Response.error();
      }
    })());
    return;
  }
  event.respondWith(
    fetch(event.request,{cache:"no-store"}).then(response=>{
      const copy=response.clone();
      caches.open(CACHE).then(cache=>cache.put(event.request,copy));
      return response;
    }).catch(()=>caches.match(event.request))
  );
});

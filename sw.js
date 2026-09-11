const CACHE = "cozy-cat-cute-v6";
const ASSETS = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./save-guard.js"];
const SAVE_GUARD_SCRIPT = `<script src="./save-guard.js?v=6"></script>`;
const SAVE_GUARD_LOADER = `\n;(()=>{if(!document.querySelector('script[data-save-guard]')){const s=document.createElement('script');s.src='./save-guard.js?v=6';s.dataset.saveGuard='1';document.head.appendChild(s);}})();\n`;

async function decorateNavigationResponse(response) {
  if (!response || !response.ok) return response;
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) return response;

  const html = await response.text();
  const patched = html.includes("save-guard.js")
    ? html
    : html.replace("</head>", SAVE_GUARD_SCRIPT + "\n</head>");

  const headers = new Headers(response.headers);
  headers.delete("content-length");
  headers.delete("content-encoding");

  return new Response(patched, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

async function decorateAppScript(response) {
  if (!response || !response.ok) return response;
  const text = await response.text();
  const headers = new Headers(response.headers);
  headers.delete("content-length");
  headers.delete("content-encoding");
  headers.set("content-type", "application/javascript; charset=utf-8");
  return new Response(text + SAVE_GUARD_LOADER, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();

    const windows = await self.clients.matchAll({type: "window", includeUncontrolled: true});
    for (const client of windows) {
      try { await client.navigate(client.url); } catch (_) {}
    }
  })());
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  if (event.request.mode === "navigate") {
    event.respondWith((async () => {
      try {
        const response = await fetch(event.request, {cache: "no-store"});
        const cacheCopy = response.clone();
        caches.open(CACHE).then(cache => cache.put("./index.html", cacheCopy));
        return await decorateNavigationResponse(response);
      } catch (err) {
        const cached = await caches.match("./index.html");
        return await decorateNavigationResponse(cached);
      }
    })());
    return;
  }

  if (url.pathname.endsWith("/app.js")) {
    event.respondWith((async () => {
      try {
        const response = await fetch(event.request, {cache: "no-store"});
        return await decorateAppScript(response);
      } catch (err) {
        const cached = await caches.match(event.request);
        return cached ? decorateAppScript(cached) : Response.error();
      }
    })());
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
      const copy = response.clone();
      caches.open(CACHE).then(cache => cache.put(event.request, copy));
      return response;
    }))
  );
});

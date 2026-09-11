const CACHE = "cozy-cat-cute-v5";
const ASSETS = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./save-guard.js"];
const SAVE_GUARD_SCRIPT = `<script src="./save-guard.js"></script>`;

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

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();

    // Reload already-open windows once so the new save guard is applied immediately.
    const windows = await self.clients.matchAll({type: "window", includeUncontrolled: true});
    for (const client of windows) {
      try { await client.navigate(client.url); } catch (_) {}
    }
  })());
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

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

  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
      const copy = response.clone();
      caches.open(CACHE).then(cache => cache.put(event.request, copy));
      return response;
    }))
  );
});

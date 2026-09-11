const CACHE = "cozy-cat-cute-v4";
const ASSETS = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./save-guard.js"];

const HIDE_REMINDER_STYLE = `<style id="hide-mobile-reminder">
.page[data-page="me"] > .card.section:nth-of-type(3){display:none !important;}
</style>`;
const SAVE_GUARD_SCRIPT = `<script id="cozy-save-guard" src="./save-guard.js"></script>`;

async function decorateNavigationResponse(response) {
  if (!response || !response.ok) return response;
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) return response;

  let html = await response.text();
  if (!html.includes('id="hide-mobile-reminder"')) {
    html = html.replace("</head>", HIDE_REMINDER_STYLE + "\n</head>");
  }
  if (!html.includes('id="cozy-save-guard"')) {
    html = html.replace("</head>", SAVE_GUARD_SCRIPT + "\n</head>");
  }

  return new Response(html, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers
  });
}

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  if (event.request.mode === "navigate") {
    event.respondWith((async () => {
      try {
        const response = await fetch(event.request);
        const copy = response.clone();
        caches.open(CACHE).then(cache => cache.put("./index.html", copy));
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

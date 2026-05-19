/* ==========================================================================
   CYMOR BIBLE APP — SERVICE WORKER v1.3.1
   Strategy: Stale-While-Revalidate
   ========================================================================== */

const CACHE_NAME = "cymor-bible-cache-v1.3";

// Only include files that ACTUALLY exist in your root directory
const STATIC_ASSETS = [
  "./",
  "./index.html",
  "./bible.html",
  "./prayer.html",
  "./favorites.html",
  "./app.js",
  "./manifest.json",
  "./en_kjv.json",
  "./icon.svg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("⚙️ [Cymor SW] Pre-caching verified assets...");
      // Using map to catch specific file errors
      return Promise.all(
        STATIC_ASSETS.map(url => {
          return cache.add(url).catch(err => console.warn(`Skipped missing file: ${url}`));
        })
      );
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((k) => k !== CACHE_NAME && caches.delete(k)));
    }).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  // Strategy: Network-First for Bible Data (to allow updates), Cache-First for UI
  if (event.request.url.includes("en_kjv.json")) {
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return res;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request).then((res) => {
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, res.clone());
          return res;
        });
      });
    })
  );
});

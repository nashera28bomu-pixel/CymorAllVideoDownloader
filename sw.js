/* ==========================================================================
   CYMOR BIBLE APP — SERVICE WORKER v2.0.0
   Strategy: Stale-While-Revalidate + Update Notification
   ========================================================================== */

const CACHE_NAME = "cymor-bible-cache-v2.0";
const APP_VERSION = "2.0.0";

const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/bible.html",
  "/prayer.html",
  "/favorites.html",
  "/audio.html",
  "/playlist.html",
  "/trivia.html",
  "/styles.css",
  "/app.js",
  "/manifest.json",
  "/en_kjv.json",
  "/icon.svg"
];

/* ==========================================================================
   INSTALL — Pre-cache all v2.0 assets
   ========================================================================== */
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("⚙️ [Cymor SW v2.0] Pre-caching assets...");
      return Promise.all(
        STATIC_ASSETS.map(url =>
          cache.add(url).catch(err => console.warn(`Asset failed: ${url}`, err))
        )
      );
    }).then(() => self.skipWaiting())
  );
});

/* ==========================================================================
   ACTIVATE — Clear old caches and notify clients of v2.0 update
   ========================================================================== */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((k) => {
          if (k !== CACHE_NAME) {
            console.log(`🗑️ [Cymor SW] Deleting old cache: ${k}`);
            return caches.delete(k);
          }
        })
      );
    }).then(() => self.clients.claim()).then(() => {
      // Broadcast update notification to all open tabs
      self.clients.matchAll({ type: "window" }).then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: "CYMOR_UPDATE",
            version: APP_VERSION,
            message: "Cymor Bible v2.0 is here! Audio Bible, Music Center & Trivia are now available.",
            features: ["🎙 Audio Bible", "🎵 Music Playlist Center", "❓ Bible Trivia Game"]
          });
        });
      });
    })
  );
});

/* ==========================================================================
   FETCH — Stale-while-revalidate strategy
   ========================================================================== */
self.addEventListener("fetch", (event) => {
  // Network-first for Bible JSON (large, needs freshness)
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

  // Cache-first for all other assets
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const networkFetch = fetch(event.request).then((res) => {
        if (res && res.status === 200) {
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, res.clone()));
        }
        return res;
      }).catch(() => cached);
      return cached || networkFetch;
    })
  );
});

/* ==========================================================================
   PUSH — Handle push notifications (for future server-side pushes)
   ========================================================================== */
self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || "Cymor Bible";
  const options = {
    body: data.body || "You have a new update.",
    icon: "./icon.svg",
    badge: "./icon.svg",
    vibrate: [100, 50, 100],
    data: { url: data.url || "./index.html" }
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

/* ==========================================================================
   NOTIFICATION CLICK — Open the app on notification tap
   ========================================================================== */
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "./index.html";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(targetUrl) && "focus" in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(targetUrl);
    })
  );
});

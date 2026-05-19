/* ==========================================================================
   CYMOR BIBLE APP — SERVICE WORKER ENGINE
   File: sw.js • Strategy: Stale-While-Revalidate & Cache-First
   ========================================================================== */

const CACHE_NAME = "cymor-bible-cache-v1";

// Core assets required for complete offline standalone operations
const STATIC_ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.json",
  "./pages/bible.html",
  "./pages/prayer.html",
  "./pages/favorites.html",
  "./pages/settings.html",
  // Fallbacks & Fonts
  "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,500;0,600;1,400&display=swap"
];

/* ==========================================================================
   LIFECYCLE: INSTALLATION
   ========================================================================== */
// Pre-caches all essential UI shell resources immediately upon installation
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("⚙ [Service Worker] Pre-caching core application shell...");
      return cache.addAll(STATIC_ASSETS);
    }).then(() => {
      // Forces the waiting service worker to become the active service worker immediately
      return self.skipWaiting();
    })
  );
});

/* ==========================================================================
   LIFECYCLE: ACTIVATION
   ========================================================================== */
// Cleans up legacy cache versions to free up device storage space
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log(`⚙ [Service Worker] Purging legacy cache: ${cache}`);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => {
      // Allows the active service worker to immediately take control of all open clients
      return self.clients.claim();
    })
  );
});

/* ==========================================================================
   STRATEGY: INTERACTION INTERCEPTION & FETCH PIPELINE
   ========================================================================== */
self.addEventListener("fetch", (event) => {
  const requestUrl = new URL(event.request.url);

  // Strategy 1: Cache-First for the massive Bible JSON dataset
  // Since the Bible text is static, we serve it from cache instantly to save data.
  if (requestUrl.pathname.includes("en_jsv.json") || requestUrl.pathname.includes("en_kjv.json")) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(event.request).then((networkResponse) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        });
      })
    );
    return;
  }

  // Strategy 2: Stale-While-Revalidate for standard application assets
  // Serves the cached version instantly for speed, while updating the cache in the background.
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          // Only cache valid standard HTTP successes
          if (networkResponse.status === 200) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(() => {
          // Silent catch to handle network failure states gracefully offline
        });

        // Return the cached asset immediately, falling back to the network promise if empty
        return cachedResponse || fetchPromise;
      });
    })
  );
});

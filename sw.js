/* Cymor Bible — Service Worker
   Cache-first for the app shell + Bible text, network-first for anything dynamic.
   Register from cymor-shared.js: CYMOR.registerServiceWorker()
*/

const SHELL_CACHE = "cymor-shell-v1";
const VERSE_CACHE = "cymor-verses-v1";

const SHELL_FILES = [
  "./index.html",
  "./bible.html",
  "./trivia.html",
  "./prayer.html",
  "./settings.html",
  "./manifest.json",
  "./cymor-shared.js"
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL_FILES).catch(() => {}))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== SHELL_CACHE && k !== VERSE_CACHE)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = event.request.url;
  const isVerseApi = url.includes("jsdelivr.net/gh/wldeh/bible-api") || url.includes("bible-api.com");
  const isShellFile = SHELL_FILES.some((f) => url.endsWith(f.replace("./", "")));

  if (isVerseApi) {
    // Cache-first: scripture text never changes, so once fetched it's free to reuse forever offline.
    event.respondWith(
      caches.open(VERSE_CACHE).then((cache) =>
        cache.match(event.request).then(
          (cached) =>
            cached ||
            fetch(event.request).then((response) => {
              if (response.ok) cache.put(event.request, response.clone());
              return response;
            }).catch(() => cached)
        )
      )
    );
    return;
  }

  if (isShellFile || event.request.mode === "navigate") {
    event.respondWith(
      caches.match(event.request).then(
        (cached) =>
          cached ||
          fetch(event.request)
            .then((response) => {
              const copy = response.clone();
              caches.open(SHELL_CACHE).then((cache) => cache.put(event.request, copy));
              return response;
            })
            .catch(() => caches.match("./index.html"))
      )
    );
  }
});

// ---------- PUSH NOTIFICATIONS ----------
self.addEventListener("push", (event) => {
  let data = { title: "Cymor Bible", body: "You have a new message.", url: "./index.html" };
  try { data = Object.assign(data, event.data.json()); } catch (e) {}

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "./icons/icon-192.png",
      badge: "./icons/icon-192.png",
      data: { url: data.url }
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "./index.html";
  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(url) && "focus" in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});

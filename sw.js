"use strict";

// Caches the site's images (client logos, photos) so repeat visits load them instantly.
// Stale-while-revalidate: serve the cached copy right away and refresh it in the background,
// so a replaced image shows up on the next visit.
const IMAGE_CACHE = "images-v1";

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("images-") && key !== IMAGE_CACHE)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);
  const isOwnImage =
    request.method === "GET" &&
    url.origin === self.location.origin &&
    request.destination === "image";
  if (!isOwnImage) return;

  event.respondWith(
    caches.open(IMAGE_CACHE).then(async (cache) => {
      const cached = await cache.match(request);
      const refresh = fetch(request)
        .then((response) => {
          if (response.ok) cache.put(request, response.clone());
          return response;
        })
        .catch(() => cached);

      if (cached) {
        event.waitUntil(refresh);
        return cached;
      }
      return refresh;
    })
  );
});

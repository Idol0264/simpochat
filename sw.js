/* =========================================================
   SIMPOCHAT — SERVICE WORKER
   ========================================================= */

"use strict";

const CACHE_NAME = "simpochat-shell-v1";

const APP_SHELL = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.webmanifest",
  "./icons/simpochat-icon-512.png"
];

/* ---------------------------------------------------------
   INSTALL
   --------------------------------------------------------- */

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

/* ---------------------------------------------------------
   ACTIVATE
   --------------------------------------------------------- */

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys =>
        Promise.all(
          keys
            .filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

/* ---------------------------------------------------------
   FETCH
   --------------------------------------------------------- */

self.addEventListener("fetch", event => {

  const request = event.request;

  /*
   * Only handle normal GET requests.
   */
  if (request.method !== "GET") {
    return;
  }

  /*
   * Do not interfere with external requests,
   * APIs, Supabase, camera, uploads, etc.
   */
  const url = new URL(request.url);

  if (url.origin !== self.location.origin) {
    return;
  }

  /*
   * App navigation:
   * try the network first, then use the cached app.
   */
  if (request.mode === "navigate") {

    event.respondWith(
      fetch(request)
        .then(response => {

          const copy = response.clone();

          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(request, copy);
            });

          return response;

        })
        .catch(() =>
          caches.match("./index.html")
        )
    );

    return;
  }

  /*
   * Static files:
   * use cache first, then network.
   */
  event.respondWith(
    caches.match(request)
      .then(cachedResponse => {

        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request)
          .then(response => {

            if (
              response &&
              response.status === 200
            ) {

              const copy =
                response.clone();

              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(request, copy);
                });

            }

            return response;

          });

      })
  );

});

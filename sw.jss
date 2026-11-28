/* =========================================================
   SIMPOCHAT — SERVICE WORKER
   ========================================================= */

"use strict";

const CACHE_NAME = "simpochat-shell-v15";

const APP_SHELL = [
  "./",
  "./index.html",
  "./offline.html",
  "./styles.css?v=20261126-3",
  "./app.js?v=20261126-3",
  "./manifest.webmanifest",
  "./icons/simpochat-icon-192.png",
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
    (async () => {

      const controller =
        new AbortController();

      const timeoutId =
        setTimeout(
          () => controller.abort(),
          8000
        );

      try {

        const response =
          await fetch(request, {
            signal: controller.signal
          });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(
            "Poor internet connection."
          );
        }

        const copy =
          response.clone();

        const cache =
          await caches.open(CACHE_NAME);

        await cache.put(
          request,
          copy
        );

        return response;

      } catch (error) {

        clearTimeout(timeoutId);

        console.warn(
          "SimpoChat connection problem:",
          error
        );

        const offlinePage =
          await caches.match(
            "./offline.html"
          );

        if (offlinePage) {
          return offlinePage;
        }

        return new Response(
          `<!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport"
              content="width=device-width,
              initial-scale=1">
            <meta name="theme-color"
              content="#7040ff">
            <title>SimpoChat</title>
            <style>
              body {
                margin: 0;
                min-height: 100vh;
                display: grid;
                place-items: center;
                text-align: center;
                padding: 24px;
                box-sizing: border-box;
                color: white;
                font-family: system-ui, sans-serif;
                background:
                  linear-gradient(
                    145deg,
                    #44218f,
                    #100b20,
                    #080811
                  );
              }
              button {
                padding: 15px 28px;
                border: 0;
                border-radius: 14px;
                color: white;
                font-weight: 800;
                background: #7847ff;
              }
            </style>
          </head>
          <body>
            <main>
              <h1>Poor internet connection</h1>
              <p>Check your internet connection
                and try again.</p>
              <button onclick="location.reload()">
                Try Again
              </button>
            </main>
          </body>
          </html>`,
          {
            status: 200,
            headers: {
              "Content-Type":
                "text/html; charset=utf-8"
            }
          }
        );

      }

    })()
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

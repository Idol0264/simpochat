
/* SIMPOCHAT SERVICE WORKER */

"use strict";

const CACHE_NAME = "simpochat-shell-v16";

const APP_SHELL = [
  "./",
  "./index.html",
  "./offline.html",
  "./styles.css?v=20261127-2",
  "./app.js?v=20261127-2",
  "./manifest.webmanifest",
  "./icons/simpochat-icon-192.png",
  "./icons/simpochat-icon-512.png"
];

const OFFLINE_PAGE = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#7040ff">
<title>SimpoChat — Offline</title>
<style>
body {
  margin: 0;
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
  box-sizing: border-box;
  background: #100b20;
  color: white;
  font: 16px system-ui, sans-serif;
  text-align: center;
}
main { max-width: 360px; }
button {
  padding: 15px 28px;
  border: 0;
  border-radius: 14px;
  background: #7847ff;
  color: white;
  font-weight: 800;
}
</style>
</head>
<body>
<main>
<h1>You're offline</h1>
<p>SimpoChat can't connect right now.
Check your connection and try again.</p>
<button onclick="location.reload()">Try Again</button>
<p>SIMPOCHAT</p>
</main>
</body>
</html>`;

async function cacheFile(cache, url) {
  try {
    const response = await fetch(url, {
      cache: "reload"
    });

    if (response.ok) {
      await cache.put(url, response);
      return true;
    }
  } catch (error) {
    console.warn("Cache failed:", url, error);
  }

  return false;
}

/* INSTALL */

self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);

    // Cache the offline page first.
    const offlineCached =
      await cacheFile(cache, "./offline.html");

    // If offline.html cannot be downloaded,
    // store a built-in fallback instead.
    if (!offlineCached) {
      await cache.put(
        "./offline.html",
        new Response(OFFLINE_PAGE, {
          headers: {
            "Content-Type":
              "text/html; charset=utf-8"
          }
        })
      );
    }

    // Cache each app file independently.
    // One missing file must not cancel installation.
    await Promise.allSettled(
      APP_SHELL
        .filter(url => url !== "./offline.html")
        .map(url => cacheFile(cache, url))
    );

    await self.skipWaiting();
  })());
});

/* ACTIVATE */

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();

    await Promise.all(
      keys
        .filter(key =>
          key.startsWith("simpochat-shell-") &&
          key !== CACHE_NAME
        )
        .map(key => caches.delete(key))
    );

    await self.clients.claim();
  })());
});

/* FETCH */

self.addEventListener("fetch", event => {
  const request = event.request;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Do not intercept Supabase or CDN requests.
  if (url.origin !== self.location.origin) return;

  /* PAGE NAVIGATION */

  if (request.mode === "navigate") {
    event.respondWith((async () => {
      const controller = new AbortController();

      const timeout = setTimeout(
        () => controller.abort(),
        7000
      );

      try {
        const response = await fetch(request, {
          signal: controller.signal
        });

        clearTimeout(timeout);

        if (!response.ok) {
          throw new Error("Navigation failed");
        }

        const cache = await caches.open(CACHE_NAME);

        await cache.put(
          request,
          response.clone()
        );

        return response;

      } catch (error) {
        clearTimeout(timeout);

        console.warn(
          "SimpoChat navigation offline:",
          error
        );

        const offline =
          await caches.match("./offline.html");

        if (offline) return offline;

        return new Response(OFFLINE_PAGE, {
          status: 200,
          headers: {
            "Content-Type":
              "text/html; charset=utf-8"
          }
        });
      }
    })());

    return;
  }

  /* APP FILES */

  event.respondWith((async () => {
    const cached = await caches.match(request);

    if (cached) return cached;

    const response = await fetch(request);

    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);

      cache.put(
        request,
        response.clone()
      ).catch(() => {});
    }

    return response;
  })());
});

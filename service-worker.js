const CACHE_NAME = "sudoku-pwa-v1";

const APP_SHELL = [
    "./",
    "./index.html",
    "./manifest.json",
    "./icons/icon-192.png",
    "./icons/icon-512.png",
    "./icons/icon-512-maskable.png"
];

self.addEventListener("install", event => {

    event.waitUntil(

        caches.open(CACHE_NAME).then(cache => {

            return cache.addAll(APP_SHELL);

        }).then(() => {

            return self.skipWaiting();

        })

    );

});

self.addEventListener("activate", event => {

    event.waitUntil(

        caches.keys().then(cacheNames => {

            return Promise.all(

                cacheNames
                    .filter(name => name !== CACHE_NAME)
                    .map(name => caches.delete(name))

            );

        }).then(() => {

            return self.clients.claim();

        })

    );

});

self.addEventListener("fetch", event => {

    if (event.request.method !== "GET") {
        return;
    }

    const requestURL = new URL(event.request.url);

    if (requestURL.origin !== self.location.origin) {
        return;
    }

    if (event.request.mode === "navigate") {

        event.respondWith(

            fetch(event.request).then(response => {

                const responseCopy = response.clone();

                caches.open(CACHE_NAME).then(cache => {

                    cache.put("./index.html", responseCopy);

                });

                return response;

            }).catch(() => {

                return caches.match("./index.html");

            })

        );

        return;
    }

    event.respondWith(

        caches.match(event.request).then(cachedResponse => {

            if (cachedResponse) {
                return cachedResponse;
            }

            return fetch(event.request).then(response => {

                if (response && response.ok) {

                    const responseCopy = response.clone();

                    caches.open(CACHE_NAME).then(cache => {

                        cache.put(event.request, responseCopy);

                    });

                }

                return response;

            });

        })

    );

});
const FILES_TO_CACHE = [
    "/",
    "/db.js",
    "/index.js",
    "/styles.css",
    "/manifest.json",
];

const CACHE_NAME = "static-cache-v2";
const DATA_CACHE_NAME = "data-cache-v1";

// installation
self.addEventListener("install", function (evnt) {
    evnt.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log("files successfully cached");
            return cache.addAll(FILES_TO_CACHE);
        })
    );
    self.skipWaiting();
});

self.addEventListener("activate", function (evnt) {
    evnt.waitUntil(
        caches.keys().then(keyList => {
            return Promise.all(
                keyList.map(key => {
                    if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
                        console.log("removed old data from cache", key);
                        return caches.delete(key);
                    }
                })
            )
        })
    );
    self.clients.claim();
});

// fetching process
self.addEventListener("fetch", function (evnt) {
    if (evnt.request.url.includes("/api/")) {
        evnt.respondWith(
            caches.open(DATA_CACHE_NAME).then(cache => {
                return fetch(evnt.request)
                    .then(response => {
                        if (response.status === 200) {
                            cache.put(evnt.request.url, response.clone());
                        }
                        return response;
                    })
                    .catch(err => {
                        return cache.match(evnt.request);
                    });
            }).catch(err => {
                console.log(err)
            })
        );
        return;
    }
    evnt.respondWith(
        caches.open(CACHE_NAME).then(cache => {
            return cache.match(evt.request).then(response => {
                return response || fetch(evnt.request);
            });
        })
    );
});
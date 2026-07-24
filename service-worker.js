const CACHE_NAME = "ntu-vocabulary-v2";

const urlsToCache = [

    "./",

    "./index.html",

    "./app.js",

    "./manifest.json",

    "./icon.png"

];

//==========================
// 安裝
//==========================

self.addEventListener("install", event => {

    self.skipWaiting();

    event.waitUntil(

        caches.open(CACHE_NAME)

        .then(cache => {

            return cache.addAll(urlsToCache);

        })

    );

});

//==========================
// 啟用
//==========================

self.addEventListener("activate", event => {

    event.waitUntil(

        caches.keys().then(keys => {

            return Promise.all(

                keys.map(key => {

                    if(key !== CACHE_NAME){

                        return caches.delete(key);

                    }

                })

            );

        })

    );

    self.clients.claim();

});

//==========================
// 讀取
//==========================

self.addEventListener("fetch", event => {

    // Google Apps Script API 不快取
    if(event.request.url.includes("script.google.com")){

        return;

    }

    event.respondWith(

        caches.match(event.request)

        .then(response=>{

            return response || fetch(event.request);

        })

    );

});
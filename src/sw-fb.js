self.addEventListener('install', function() {
    self.skipWaiting();
});

self.addEventListener('push', function(e) {
    const payload = JSON.parse(e.data.text());
    const {content, title} = payload;

    e.waitUntil(
        self.registration.showNotification(title, {body: content})
    );
});

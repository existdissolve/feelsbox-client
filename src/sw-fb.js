self.addEventListener('install', function() {
    self.skipWaiting();
});

self.addEventListener('push', function(e) {
    const payload = JSON.parse(e.data.text());
    const {badge, content: body, icon, image, title} = payload;

    e.waitUntil(
        self.registration.showNotification(title, {
            badge,
            body,
            icon,
            image,
            title
        })
    );
});

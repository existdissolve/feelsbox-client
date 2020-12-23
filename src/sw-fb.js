self.addEventListener('install', function() {
    self.skipWaiting();
});

self.addEventListener('push', function(e) {
    const payload = JSON.parse(e.data.text());
    const {content: body, image, title} = payload;

    e.waitUntil(
        self.registration.showNotification(title, {
            badge: 'https://feelsbox-assets.s3.amazonaws.com/badge.png',
            body,
            icon: 'https://feelsbox-assets.s3.amazonaws.com/feelsbox.png',
            image,
            title
        })
    );
});

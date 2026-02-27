// FocusGrid Service Worker
// Handles background notifications via postMessage from main thread.
// This runs independently of the page, so notifications fire even when
// the tab is minimized or the browser window is not focused.

const CACHE_NAME = 'focusgrid-v1';

// Install — skip waiting so the new SW activates immediately
self.addEventListener('install', (event) => {
    self.skipWaiting();
});

// Activate — claim all clients
self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

// Message handler — main thread sends notification requests here
self.addEventListener('message', (event) => {
    if (!event.data) return;

    if (event.data.type === 'SHOW_NOTIFICATION') {
        const { title, options } = event.data;
        event.waitUntil(
            self.registration.showNotification(title, {
                ...options,
                icon: options?.icon || '/logo.png',
                badge: options?.badge || '/logo.png',
                vibrate: options?.vibrate || [200, 100, 200],
                tag: options?.tag || 'focusgrid-session',
                renotify: options?.renotify !== undefined ? options.renotify : !!options?.tag,
            })
        );
    }
});

// Notification click — bring the app to the foreground
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            for (const client of clientList) {
                if (client.url && 'focus' in client) {
                    return client.focus();
                }
            }
            if (self.clients.openWindow) {
                return self.clients.openWindow('/');
            }
        })
    );
});

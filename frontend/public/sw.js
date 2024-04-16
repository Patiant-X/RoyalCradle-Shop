/* eslint-disable no-undef */
/* eslint-disable no-restricted-globals */
self.addEventListener('push', (event) => {
  const data = event.data.json();
  const { title, data: innerData } = data;
  const options = {
    body:  innerData.message,
    icon: 'logo192.png',
    badge: 'logo192.png',
    vibrate: [200, 100, 200, 100, 200, 100, 200],
  };
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});


self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = new URL('/', self.location.origin).href;
  event.waitUntil(clients.matchAll({
    type: 'window',
    includeUncontrolled: true,
  }).then((windowClients) => {
    for (let i = 0; i < windowClients.length; i++) {
      const client = windowClients[i];
      if (client.url === urlToOpen && 'focus' in client) {
        return client.focus();
      }
    }
    if (clients.openWindow) {
      return clients.openWindow(urlToOpen);
    }
    return null;
  }));
});

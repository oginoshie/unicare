// sw.js
self.addEventListener('push', (event) => {
  console.log('Push received!');
});

// 通知を表示するためのリスナー
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  // 通知をクリックした時にアプリを開く処理
  event.waitUntil(clients.openWindow('/'));
});

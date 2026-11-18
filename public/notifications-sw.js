/*
 * Service worker mínimo da central de notificações (Clubinhos NIB).
 *
 * Só trata o clique em avisos exibidos pela página. Não intercepta `fetch` e
 * não guarda respostas autenticadas. Nenhum token ou conteúdo privado chega
 * aqui: o aviso carrega apenas o caminho interno da central, que é validado de
 * novo antes de abrir.
 */
const MESSAGE_OPEN = 'clubinho-notification-open';
const MESSAGE_VERSION = 1;
const ROUTE = '/notificacoes';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

function safePath(value) {
  if (typeof value !== 'string') return ROUTE;
  let url;
  try {
    url = new URL(value, self.location.origin);
  } catch {
    return ROUTE;
  }
  if (url.origin !== self.location.origin || url.pathname !== ROUTE || url.hash) return ROUTE;
  const keys = [...url.searchParams.keys()];
  if (!keys.length) return ROUTE;
  const id = url.searchParams.get('notification');
  if (keys.length === 1 && keys[0] === 'notification' && UUID.test(id || '')) {
    return `${ROUTE}?notification=${id}`;
  }
  return ROUTE;
}

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const path = safePath(event.notification.data && event.notification.data.path);
  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      const sameOrigin = windows.find((client) => new URL(client.url).origin === self.location.origin);
      if (sameOrigin) {
        await sameOrigin.focus();
        sameOrigin.postMessage({ type: MESSAGE_OPEN, version: MESSAGE_VERSION, path });
        return;
      }
      await self.clients.openWindow(path);
    })()
  );
});

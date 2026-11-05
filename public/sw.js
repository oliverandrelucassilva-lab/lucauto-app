// Service worker mínimo: deixa o app instalável. Não guarda contratos nem dados
// pessoais no aparelho (nada de cache de páginas ou de arquivos gerados).
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", () => {});

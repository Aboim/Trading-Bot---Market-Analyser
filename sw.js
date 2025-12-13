const CACHE_NAME = 'investmind-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json'
];

// Instala o Service Worker e cacheia os arquivos estáticos essenciais
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Ativa o SW e limpa caches antigos se necessário
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Intercepta requisições: tenta cache primeiro, depois rede (Cache First strategy for assets)
// Para APIs e outros, usa Network First (implícito pelo fetch no catch ou lógica condicional)
self.addEventListener('fetch', (event) => {
  // Não cacheia chamadas para a API do Gemini ou Google Search
  if (event.request.url.includes('generativelanguage.googleapis.com')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Retorna do cache se existir
      if (response) {
        return response;
      }
      
      // Se não, busca na rede
      return fetch(event.request).then((response) => {
        // Opcional: Aqui poderíamos cachear dinamicamente novas requisições
        // Mas para evitar cachear erros ou dados dinâmicos sensíveis, manteremos simples.
        return response;
      }).catch(() => {
        // Fallback offline se necessário (ex: página de "sem conexão")
        // Como é um app de dados em tempo real, o cache da UI já ajuda.
      });
    })
  );
});
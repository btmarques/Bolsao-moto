// Bolsão Moto: guarda o app e os dados para abrir rápido e funcionar com sinal fraco.
const CACHE='bolsao-moto-v1';
const CORE=['./','index.html','bolsoes.json','manifest.webmanifest','icon-180.png','icon-192.png','icon-512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=='GET'||u.hostname.includes('photon.komoot.io'))return; // busca de endereço sempre online
  if(u.hostname.includes('basemaps.cartocdn.com')){ // mapa: rede primeiro, cópia se cair o sinal
    e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open(CACHE+'-tiles').then(x=>x.put(e.request,c));return r}).catch(()=>caches.match(e.request)));return;}
  // app e dados: cópia local na hora, atualiza em segundo plano
  e.respondWith(caches.match(e.request).then(hit=>{
    const net=fetch(e.request).then(r=>{if(r.ok){const c=r.clone();caches.open(CACHE).then(x=>x.put(e.request,c))}return r}).catch(()=>hit);
    return hit||net;}));
});

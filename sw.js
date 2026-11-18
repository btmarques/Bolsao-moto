// Bolsão Moto: guarda o app e os dados para abrir rápido e funcionar com sinal fraco.
const CACHE='bolsao-moto-v5';
const CORE=['./','index.html','bolsoes.json','manifest.webmanifest','icon-180.png','icon-192.png','icon-512.png',
  'https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css',
  'https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=='GET'||u.hostname.includes('photon.komoot.io'))return; // busca de endereço sempre online
  if(u.hostname.includes('openfreemap.org')){ // mapa: rede primeiro, cópia se cair o sinal
    e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open(CACHE+'-tiles').then(x=>x.put(e.request,c));return r}).catch(()=>caches.match(e.request)));return;}
  // página e base de bolsões: busca a versão nova primeiro; sem internet, usa a cópia guardada
  const fresh=e.request.mode==='navigate'||u.pathname.endsWith('/')||u.pathname.endsWith('.html')||u.pathname.endsWith('bolsoes.json');
  if(fresh){e.respondWith(fetch(e.request,{cache:'no-store'}).then(r=>{if(r.ok){const c=r.clone();caches.open(CACHE).then(x=>x.put(e.request,c))}return r}).catch(()=>caches.match(e.request).then(h=>h||caches.match('index.html'))));return;}
  // bibliotecas e ícones: cópia local na hora, atualiza em segundo plano
  e.respondWith(caches.match(e.request).then(hit=>{
    const net=fetch(e.request).then(r=>{if(r.ok){const c=r.clone();caches.open(CACHE).then(x=>x.put(e.request,c))}return r}).catch(()=>hit);
    return hit||net;}));
});

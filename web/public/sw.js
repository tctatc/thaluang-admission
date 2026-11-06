/*
 * Service worker ของเว็บแอป
 *  - ไฟล์ใน assets/ (ชื่อมีแฮช ไม่เปลี่ยนเนื้อหา) → ใช้จากเครื่องก่อน เปิดแอปเร็วแม้เน็ตช้า
 *  - หน้า index.html → ถามเน็ตก่อนเสมอ (ได้เวอร์ชันล่าสุด) ไม่มีเน็ตค่อยใช้ชุดที่เก็บไว้
 *  - ไม่แตะคำขอไป Apps Script และไม่เก็บข้อมูลผู้สมัครใด ๆ ในเครื่อง
 */
const SHELL = 'tla-shell-v1';
const ASSETS = 'tla-assets-v1';
const FONTS = 'tla-fonts-v1';
const KEEP = [SHELL, ASSETS, FONTS];
const PRECACHE = ['./', './manifest.webmanifest', './college-logo.png', './icon-192.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(SHELL).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) if (!KEEP.includes(key)) await caches.delete(key);
    // assets เก่าจากเวอร์ชันก่อน ๆ สะสมเรื่อย ๆ — เก็บไว้แค่ 60 ไฟล์ล่าสุด
    const cache = await caches.open(ASSETS);
    const keys = await cache.keys();
    await Promise.all(keys.slice(0, Math.max(0, keys.length - 60)).map((key) => cache.delete(key)));
    await self.clients.claim();
  })());
});

async function networkFirst(request) {
  const cache = await caches.open(SHELL);
  try {
    const response = await fetch(request);
    if (response.ok) cache.put('./', response.clone());
    return response;
  } catch {
    return (await cache.match('./')) ?? Response.error();
  }
}

async function cacheFirst(request, name) {
  const cache = await caches.open(name);
  const hit = await cache.match(request);
  if (hit) return hit;
  const response = await fetch(request);
  if (response.ok || response.type === 'opaque') cache.put(request, response.clone());
  return response;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com') {
    event.respondWith(cacheFirst(request, FONTS));
    return;
  }
  if (url.origin !== self.location.origin) return;
  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request));
    return;
  }
  if (url.pathname.includes('/assets/')) event.respondWith(cacheFirst(request, ASSETS));
});

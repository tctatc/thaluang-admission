/**
 * ที่เก็บในเบราว์เซอร์แบบไม่ทำให้แอปล้ม (โหมดส่วนตัว/ปิดการเก็บข้อมูลเว็บ จะ throw แทนคืน null)
 */

export function readStore(storage: 'local' | 'session', key: string): string | null {
  try {
    return (storage === 'local' ? window.localStorage : window.sessionStorage).getItem(key);
  } catch {
    return null;
  }
}

export function writeStore(storage: 'local' | 'session', key: string, value: string): boolean {
  try {
    (storage === 'local' ? window.localStorage : window.sessionStorage).setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export function removeStore(storage: 'local' | 'session', key: string): void {
  try {
    (storage === 'local' ? window.localStorage : window.sessionStorage).removeItem(key);
  } catch {
    // ลบไม่ได้ไม่กระทบงานหลัก
  }
}

/* ---------- IndexedDB สำหรับไฟล์ในโหมดสาธิต (localStorage จุได้แค่ราว 5 MB) ---------- */

const DB_NAME = 'tla-demo-files';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore('files');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function withStore<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const request = run(db.transaction('files', mode).objectStore('files'));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export const fileStore = {
  put: (key: string, dataUrl: string) => withStore('readwrite', (store) => store.put(dataUrl, key)),
  get: (key: string) => withStore<string | undefined>('readonly', (store) => store.get(key) as IDBRequest<string | undefined>),
  remove: (key: string) => withStore('readwrite', (store) => store.delete(key)),
};

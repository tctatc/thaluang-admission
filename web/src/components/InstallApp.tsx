import { useEffect, useState } from 'react';
import { Download, Share } from 'lucide-react';
import { sheetIconClass, sheetRowClass } from './MobileNav';

interface InstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// เบราว์เซอร์ยิง beforeinstallprompt ครั้งเดียวตอนโหลดหน้า อาจก่อนปุ่มถูกวาด จึงดักไว้ตั้งแต่โหลดไฟล์นี้
let deferred: InstallPromptEvent | null = null;
const listeners = new Set<() => void>();
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferred = event as InstallPromptEvent;
    listeners.forEach((listener) => listener());
  });
  window.addEventListener('appinstalled', () => {
    deferred = null;
    listeners.forEach((listener) => listener());
  });
}

const standalone = () =>
  window.matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
// iPhone/iPad ไม่มีหน้าต่างติดตั้ง ต้องบอกให้กดแชร์เอง (iPadOS รุ่นใหม่รายงานตัวเป็น Mac ที่มีจอสัมผัส)
const isIos = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

/** ปุ่ม "ติดตั้งแอป" — ซ่อนเองเมื่อเปิดจากแอปที่ติดตั้งแล้ว หรือเบราว์เซอร์ติดตั้งไม่ได้ */
export function InstallApp({ variant = 'link', className }: { variant?: 'link' | 'sheet'; className?: string }) {
  const [, rerender] = useState(0);
  const [hint, setHint] = useState(false);
  useEffect(() => {
    const listener = () => rerender((n) => n + 1);
    listeners.add(listener);
    return () => { listeners.delete(listener); };
  }, []);

  if (standalone()) return null;
  const ios = !deferred && isIos();
  if (!deferred && !ios) return null;

  const install = async () => {
    if (!deferred) { setHint((v) => !v); return; }
    await deferred.prompt();
    await deferred.userChoice;
    deferred = null;
    rerender((n) => n + 1);
  };

  return (
    <div className={className}>
      <button type="button" onClick={install} aria-expanded={ios ? hint : undefined}
        className={variant === 'sheet' ? `${sheetRowClass} text-ink`
          : 'inline-flex min-h-11 items-center gap-2 rounded-control px-3 text-[15px] font-medium text-brand transition-colors hover:bg-brand-soft'}>
        {variant === 'sheet'
          ? <span aria-hidden="true" className={sheetIconClass}><Download className="size-5" /></span>
          : <Download className="size-4" aria-hidden="true" />}
        ติดตั้งเป็นแอปบนมือถือ
      </button>
      {hint && (
        <p className="mb-1 flex flex-wrap items-center gap-1 px-3 text-sm text-ink-muted">
          เปิดใน Safari กดปุ่มแชร์ <Share className="inline size-4" aria-label="แชร์" /> แล้วเลือก "เพิ่มไปยังหน้าจอโฮม"
        </p>
      )}
    </div>
  );
}

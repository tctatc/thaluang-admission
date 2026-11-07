import { useEffect, useRef, useState } from 'react';
import { ExternalLink, Maximize2, X } from 'lucide-react';
import { useFileUrl } from '../lib/media';
import { cn } from './ui';

/**
 * โปสเตอร์ในประกาศ: แสดงทั้งแผ่นไม่ครอป (ตัวหนังสือบนโปสเตอร์ต้องอ่านได้ครบ) แตะเพื่อดูภาพใหญ่
 * ใช้ขนาดจริงที่บันทึกไว้จองพื้นที่ล่วงหน้า หน้าไม่กระโดดตอนรูปโหลดเสร็จ
 */
export function Poster({ url, width, height, title, maxHeight = '28rem', className }: { url: string; width: number; height: number; title: string; maxHeight?: string; className?: string }) {
  const src = useFileUrl(url);
  const [open, setOpen] = useState(false);
  const ratio = width && height ? `${width} / ${height}` : '3 / 4';
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-label={`ดูโปสเตอร์ ${title} ขนาดใหญ่`}
        className={cn('group relative block w-full overflow-hidden rounded-control bg-sunken ring-1 ring-line', className)}>
        {src
          ? <img src={src} alt={`โปสเตอร์ ${title}`} width={width || undefined} height={height || undefined} loading="lazy" decoding="async"
            className="mx-auto block h-auto w-full object-contain transition-transform duration-300 group-hover:scale-[1.02]" style={{ maxHeight }} />
          : <span className="block w-full" style={{ aspectRatio: ratio, maxHeight }} />}
        <span aria-hidden="true" className="absolute bottom-2 right-2 inline-flex items-center gap-1.5 rounded-full bg-ink/75 px-3 py-1.5 text-sm font-medium text-ink-inverse">
          <Maximize2 className="size-4" />ดูภาพใหญ่
        </span>
      </button>
      {open && src && <Lightbox src={src} url={url} title={title} onClose={() => setOpen(false)} />}
    </>
  );
}

function Lightbox({ src, url, title, onClose }: { src: string; url: string; title: string; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);
  // รูปจาก Google Drive เปิดขนาดเต็มในแท็บใหม่ได้ (ซูมด้วยนิ้วบนมือถือ)
  const full = url.startsWith('idb:') ? src : url.replace(/sz=w\d+/, 'sz=w4000');
  return (
    <dialog ref={ref} aria-label={`โปสเตอร์ ${title}`} onCancel={(event) => { event.preventDefault(); onClose(); }} onClick={onClose}
      className="no-print fade-in m-0 h-dvh max-h-none w-screen max-w-none bg-ink p-0 backdrop:bg-ink">
      <div className="flex h-full flex-col">
        <div className="flex items-center gap-2 px-3 pb-2 pt-[calc(env(safe-area-inset-top)+0.5rem)] text-ink-inverse">
          <p className="min-w-0 flex-1 truncate px-1 font-medium">{title}</p>
          <a href={full} target="_blank" rel="noreferrer" onClick={(event) => event.stopPropagation()}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-control px-3 text-sm hover:bg-ink-inverse/10">
            <ExternalLink className="size-4" aria-hidden="true" />เปิดในแท็บใหม่
          </a>
          <button type="button" onClick={onClose} aria-label="ปิด" className="grid size-11 place-items-center rounded-control hover:bg-ink-inverse/10">
            <X className="size-6" aria-hidden="true" />
          </button>
        </div>
        <div className="grid min-h-0 flex-1 place-items-center px-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)]">
          <img src={src} alt={`โปสเตอร์ ${title}`} onClick={(event) => event.stopPropagation()} className="h-auto max-h-[calc(100dvh-5rem-env(safe-area-inset-top)-env(safe-area-inset-bottom))] w-auto max-w-full rounded-control object-contain" />
        </div>
      </div>
    </dialog>
  );
}

import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';

/**
 * กล่องโต้ตอบจาก <dialog> ของเบราว์เซอร์: ขังโฟกัสไว้ข้างใน กด Esc ปิดได้ และคืนโฟกัสให้ปุ่มเดิมเอง
 * มือถือเลื่อนขึ้นจากขอบล่าง (แบบแผ่นเมนู) จอใหญ่อยู่กลางจอ
 */
export function Dialog({ title, description, children, footer, onClose }: {
  title: string; description?: ReactNode; children?: ReactNode; footer: ReactNode; onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    dialog.showModal();
    // ปุ่มที่ติด data-autofocus ได้โฟกัสก่อน (เช่น "ยกเลิก" ในกล่องยืนยันการลบ)
    dialog.querySelector<HTMLElement>('[data-autofocus]')?.focus();
    return () => dialog.close();
  }, []);

  return (
    <dialog ref={ref} aria-labelledby="dialog-title" onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClick={(event) => { if (event.target === ref.current) onClose(); }}
      className="no-print sheet-up m-0 mt-auto max-h-[92dvh] w-full max-w-none overflow-hidden rounded-t-3xl bg-surface p-0 text-ink shadow-overlay backdrop:bg-ink/40 sm:m-auto sm:max-w-lg sm:rounded-card">
      <div className="flex max-h-[92dvh] flex-col">
        <div className="flex items-start gap-3 border-b border-line px-5 pb-3 pt-4">
          <div className="min-w-0 flex-1">
            <h2 id="dialog-title" className="text-lg text-brand-deep">{title}</h2>
            {description && <p className="mt-0.5 text-sm text-ink-muted">{description}</p>}
          </div>
          <button type="button" onClick={onClose} aria-label="ปิด" className="-mr-2 grid size-11 shrink-0 place-items-center rounded-control text-ink-muted hover:bg-sunken hover:text-ink">
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>
        {children && <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>}
        <div className="flex flex-wrap justify-end gap-2 border-t border-line bg-canvas px-5 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 sm:pb-3">{footer}</div>
      </div>
    </dialog>
  );
}

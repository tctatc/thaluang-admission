import { useRef, useState } from 'react';
import { BookOpen, Download, ExternalLink, FileText, Trash2, Upload, X } from 'lucide-react';
import { MANUAL_LABEL, MAX_MANUAL_BYTES, type ManualInfo, type ManualKind } from '@shared/model';
import { bangkokDateParts, thaiLongDate } from '@shared/thai';
import { api, errorMessage, type Manuals } from '../lib/api';
import { formatBytes } from '../lib/files';
import { readManualPdf, useFileUrl } from '../lib/media';
import { Dialog } from './Dialog';
import { Alert, Button, cn } from './ui';

/**
 * คู่มือ PDF หนึ่งฉบับ: เปิดอ่านในหน้าเว็บ ดาวน์โหลด และ (ผู้ดูแล) อัปโหลด/เปลี่ยน/ลบ
 * ระบบจริงเปิดผ่านตัวแสดง PDF ของ Google Drive ซึ่งใช้ได้บนมือถือด้วย
 * (เบราว์เซอร์มือถือส่วนใหญ่แสดง PDF ใน iframe เองไม่ได้)
 */
export function ManualPanel({ kind, info, manage }: {
  kind: ManualKind; info: ManualInfo | null;
  manage?: { token: string; onChange: (manuals: Manuals) => void };
}) {
  const [reading, setReading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const view = useFileUrl(info?.viewUrl ?? '');
  const download = useFileUrl(info?.downloadUrl ?? '');

  const upload = async (file: File | undefined) => {
    if (!file || !manage) return;
    setBusy(true);
    setError('');
    try {
      const dataBase64 = await readManualPdf(file);
      manage.onChange((await api.uploadManual(manage.token, kind, file.name, dataBase64)).manuals);
      setReading(false);
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const remove = async () => {
    if (!manage) return;
    setBusy(true);
    setError('');
    try {
      manage.onChange((await api.deleteManual(manage.token, kind)).manuals);
      setConfirmDelete(false);
      setReading(false);
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section aria-labelledby={`manual-${kind}`} className="rounded-card bg-surface p-4 shadow-card ring-1 ring-line sm:p-5">
      <div className="flex items-start gap-3">
        <span aria-hidden="true" className="grid size-12 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand"><BookOpen className="size-6" /></span>
        <div className="min-w-0 flex-1">
          <h2 id={`manual-${kind}`} className="text-lg text-brand-deep">{MANUAL_LABEL[kind]}</h2>
          {info ? (
            <p className="text-sm text-ink-muted [overflow-wrap:anywhere]">
              <FileText className="mr-1 inline size-4 align-[-3px]" aria-hidden="true" />{info.name}
              <span className="whitespace-nowrap" data-numeric> ขนาด {formatBytes(info.size)}</span>
              {info.updatedAt && <span className="block">ปรับปรุงเมื่อ {thaiLongDate(bangkokDateParts(info.updatedAt))}</span>}
            </p>
          ) : (
            <p className="text-sm text-ink-muted">{manage ? 'ยังไม่มีไฟล์คู่มือ อัปโหลดไฟล์ PDF เพื่อให้เปิดอ่านได้' : 'ยังไม่มีไฟล์คู่มือ PDF ดูวิธีใช้งานแบบย่อด้านล่างได้'}</p>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {info && (
          <>
            <Button onClick={() => setReading((v) => !v)} aria-expanded={reading} disabled={!view}
              icon={reading ? <X className="size-4" aria-hidden="true" /> : <BookOpen className="size-4" aria-hidden="true" />}>
              {reading ? 'ปิดคู่มือ' : 'เปิดคู่มือการใช้งาน'}
            </Button>
            <a href={download || undefined} download={info.name} target="_blank" rel="noreferrer"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-control bg-surface px-4 font-medium text-ink ring-1 ring-inset ring-line-strong hover:bg-sunken">
              <Download className="size-4" aria-hidden="true" />ดาวน์โหลด PDF
            </a>
          </>
        )}
        {manage && (
          <>
            <input ref={inputRef} type="file" accept="application/pdf,.pdf" className="sr-only" tabIndex={-1} aria-hidden="true"
              onChange={(event) => void upload(event.target.files?.[0])} />
            <Button variant="secondary" loading={busy} onClick={() => inputRef.current?.click()} icon={<Upload className="size-4" aria-hidden="true" />}>
              {info ? 'เปลี่ยนไฟล์' : 'อัปโหลด PDF'}
            </Button>
            {info && (
              <Button variant="ghost" className="text-danger hover:bg-danger-soft" disabled={busy} onClick={() => setConfirmDelete(true)} icon={<Trash2 className="size-4" aria-hidden="true" />}>
                ลบคู่มือ
              </Button>
            )}
          </>
        )}
      </div>
      {manage && <p className="mt-2 text-sm text-ink-muted">ไฟล์ PDF ไม่เกิน {MAX_MANUAL_BYTES / 1024 / 1024} MB เปลี่ยนไฟล์แล้วฉบับเก่าถูกลบให้อัตโนมัติ</p>}
      {error && <Alert tone="danger" className="mt-3">{error}</Alert>}

      {reading && view && (
        <div className="mt-4">
          <iframe src={view} title={MANUAL_LABEL[kind]} className={cn('h-[78dvh] w-full rounded-control bg-sunken ring-1 ring-line')} />
          <a href={view} target="_blank" rel="noreferrer" className="mt-2 inline-flex min-h-11 items-center gap-1.5 font-medium text-brand underline">
            <ExternalLink className="size-4" aria-hidden="true" />เปิดเต็มจอในแท็บใหม่
          </a>
        </div>
      )}

      {confirmDelete && info && (
        <Dialog title={`ลบ${MANUAL_LABEL[kind]}?`} description={`ไฟล์ ${info.name} จะหายจากหน้าเว็บทันที`} onClose={() => setConfirmDelete(false)}
          footer={<>
            <Button variant="secondary" onClick={() => setConfirmDelete(false)} data-autofocus>ยกเลิก</Button>
            <Button variant="danger" loading={busy} onClick={remove} icon={<Trash2 className="size-4" aria-hidden="true" />}>ลบคู่มือ</Button>
          </>}>
          <p>ถ้าจะอัปเดตเป็นฉบับใหม่ ใช้ "เปลี่ยนไฟล์" แทนได้เลย ไม่ต้องลบก่อน</p>
        </Dialog>
      )}
    </section>
  );
}

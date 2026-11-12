import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { ImagePlus, MessageCircle, Pencil, Pin, Plus, Trash2, X } from 'lucide-react';
import type { Announcement } from '@shared/model';
import { bangkokDateParts, thaiLongDate } from '@shared/thai';
import { useStaff } from '../../app/staff';
import { Alert, Button, Loading, Panel, TextField, cn } from '../../components/ui';
import { api, errorMessage, issuesOf } from '../../lib/api';
import { preparePoster, useFileUrl, type PreparedPoster } from '../../lib/media';
import { Dialog } from '../../components/Dialog';
import { Poster } from '../../components/Poster';

const blank: Partial<Announcement> = { title: '', body: '', pinned: false, published: true };

export function AnnouncementsPage() {
  const { staff, token } = useStaff();
  const [list, setList] = useState<Announcement[] | null>(null);
  const [editing, setEditing] = useState<Partial<Announcement> | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  /** โปสเตอร์ในฟอร์ม: picked = รูปใหม่ที่ย่อแล้ว, removed = กดเอาโปสเตอร์เดิมออก */
  const [picked, setPicked] = useState<PreparedPoster | null>(null);
  const [removed, setRemoved] = useState(false);
  const [posterBusy, setPosterBusy] = useState(false);
  const [deleting, setDeleting] = useState<Announcement | null>(null);

  /** null = ยังไม่รู้ (กำลังโหลด) */
  const [lineReady, setLineReady] = useState<boolean | null>(null);
  useEffect(() => {
    api.adminAnnouncements(token)
      .then((r) => { setList(r.announcements); setLineReady(Boolean(r.lineConfigured)); })
      .catch((e) => setError(errorMessage(e)));
  }, [token]);
  if (staff?.role !== 'admin') return <Navigate to="/staff" replace />;

  const open = (item: Partial<Announcement>) => { setEditing({ ...item }); setErrors({}); setError(''); setPicked(null); setRemoved(false); };
  const pick = async (file: File | undefined) => {
    if (!file) return;
    setPosterBusy(true);
    setErrors({});
    try {
      setPicked(await preparePoster(file));
      setRemoved(false);
    } catch (cause) {
      setErrors({ poster: errorMessage(cause) });
    } finally {
      setPosterBusy(false);
    }
  };
  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (!editing) return;
    setBusy('save');
    setErrors({});
    try {
      const { title, body, pinned, published, id } = editing;
      const poster = picked ? { image: { dataBase64: picked.dataBase64, width: picked.width, height: picked.height } } : removed ? { removeImage: true } : {};
      setList((await api.saveAnnouncement(token, { ...(id ? { id } : {}), title, body, pinned, published, ...poster } as Parameters<typeof api.saveAnnouncement>[1])).announcements);
      setEditing(null);
      setError('');
    } catch (cause) {
      setErrors(issuesOf(cause));
      setError(errorMessage(cause));
    } finally {
      setBusy('');
    }
  };
  const remove = async (item: Announcement) => {
    setBusy(item.id);
    try {
      setList((await api.deleteAnnouncement(token, item.id)).announcements);
      setDeleting(null);
    } catch (cause) {
      setError(errorMessage(cause));
      setDeleting(null);
    } finally {
      setBusy('');
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-brand-deep">ประกาศประชาสัมพันธ์</h1>
          <p className="text-sm text-ink-muted">ประกาศที่เผยแพร่จะขึ้นหน้าแรกทันที ปักหมุดไว้บนสุดได้</p>
          {lineReady === true && (
            <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-ok"><MessageCircle className="size-4" aria-hidden="true" />ประกาศที่เผยแพร่ครั้งแรกจะเด้งเข้ากลุ่ม LINE อัตโนมัติ (แก้ไขประกาศเดิมไม่ส่งซ้ำ)</p>
          )}
          {lineReady === false && (
            <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-warn"><MessageCircle className="size-4" aria-hidden="true" />ยังไม่ได้เชื่อม LINE ประกาศใหม่จึงยังไม่เด้งเข้ากลุ่ม (ตั้งค่า LINE_CHANNEL_TOKEN และ LINE_TO ใน Script Properties)</p>
          )}
        </div>
        {!editing && <Button onClick={() => open(blank)} icon={<Plus className="size-4" aria-hidden="true" />}>เพิ่มประกาศ</Button>}
      </div>
      {error && !editing && <Alert tone="danger">{error}</Alert>}

      {editing && (
        <Panel title={editing.id ? 'แก้ไขประกาศ' : 'ประกาศใหม่'}>
          <form onSubmit={save} className="space-y-4">
            <TextField label="หัวข้อ" required maxLength={150} value={editing.title ?? ''} error={errors.title}
              onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
            <div>
              <label htmlFor="ann-body" className="mb-1 block text-[15px] font-medium">เนื้อหา <span className="text-brand">*</span></label>
              <textarea id="ann-body" rows={6} maxLength={5000} value={editing.body ?? ''} onChange={(e) => setEditing({ ...editing, body: e.target.value })}
                className={cn('w-full rounded-control border bg-surface px-3 py-2 text-base focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20', errors.body ? 'border-danger' : 'border-line-strong')} />
              {errors.body ? <p className="mt-1 text-sm text-danger">{errors.body}</p> : <p className="mt-1 text-sm text-ink-muted">ขึ้นบรรทัดใหม่ได้ตามปกติ</p>}
            </div>
            <PosterField current={removed ? '' : editing.imageUrl ?? ''} picked={picked} busy={posterBusy} error={errors.poster}
              onPick={pick} onRemove={() => { setPicked(null); setRemoved(true); }} />
            <div className="flex flex-wrap gap-4">
              <label className="inline-flex min-h-11 items-center gap-2"><input type="checkbox" checked={editing.published !== false} onChange={(e) => setEditing({ ...editing, published: e.target.checked })} />เผยแพร่บนหน้าเว็บ</label>
              <label className="inline-flex min-h-11 items-center gap-2"><input type="checkbox" checked={editing.pinned === true} onChange={(e) => setEditing({ ...editing, pinned: e.target.checked })} />ปักหมุดไว้บนสุด</label>
            </div>
            {error && <Alert tone="danger">{error}</Alert>}
            <div className="flex gap-2">
              <Button type="submit" loading={busy === 'save'} disabled={posterBusy}>บันทึกประกาศ</Button>
              <Button variant="ghost" onClick={() => setEditing(null)}>ยกเลิก</Button>
            </div>
          </form>
        </Panel>
      )}

      {list === null ? <Loading /> : list.length === 0 ? (
        <p className="rounded-card bg-surface py-12 text-center text-ink-muted ring-1 ring-line">ยังไม่มีประกาศ</p>
      ) : (
        <ul className="space-y-3">
          {list.map((item) => (
            <li key={item.id} className="rounded-card bg-surface p-4 shadow-card ring-1 ring-line">
              <div className="flex flex-wrap items-start justify-between gap-3">
                {item.imageUrl && (
                  <div className="w-24 shrink-0 sm:w-28">
                    <Poster url={item.imageUrl} width={item.imageWidth} height={item.imageHeight} title={item.title} maxHeight="9rem" className="[&>span]:hidden" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2 font-semibold">
                    {item.pinned && <Pin className="size-4 text-gold-ink" aria-label="ปักหมุด" />}
                    {item.title}
                    {!item.published && <span className="rounded-full bg-sunken px-2 py-0.5 text-xs font-normal text-ink-muted">ฉบับร่าง ไม่แสดงบนเว็บ</span>}
                  </p>
                  <p className="text-sm text-ink-muted">{thaiLongDate(bangkokDateParts(item.updatedAt))}</p>
                  <p className="mt-2 whitespace-pre-line text-[15px]">{item.body}</p>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" onClick={() => open(item)} icon={<Pencil className="size-4" aria-hidden="true" />}>แก้ไข</Button>
                  <Button variant="ghost" className="text-danger hover:bg-danger-soft" onClick={() => setDeleting(item)} icon={<Trash2 className="size-4" aria-hidden="true" />}>ลบ</Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      {deleting && (
        <Dialog title={`ลบประกาศ "${deleting.title}"?`} description={deleting.imageUrl ? 'โปสเตอร์ของประกาศนี้ถูกลบไปด้วย' : 'ประกาศจะหายจากหน้าเว็บทันที'} onClose={() => setDeleting(null)}
          footer={<>
            <Button variant="secondary" onClick={() => setDeleting(null)} data-autofocus>ยกเลิก</Button>
            <Button variant="danger" loading={busy === deleting.id} onClick={() => remove(deleting)} icon={<Trash2 className="size-4" aria-hidden="true" />}>ลบประกาศ</Button>
          </>}>
          <p>ถ้าแค่ต้องการซ่อนชั่วคราว ให้กดแก้ไขแล้วเอาติ๊ก "เผยแพร่บนหน้าเว็บ" ออกแทน</p>
        </Dialog>
      )}
    </div>
  );
}

/** ช่องโปสเตอร์ในฟอร์มประกาศ: แสดงรูปที่จะใช้ เลือกใหม่ หรือเอาออก */
function PosterField({ current, picked, busy, error, onPick, onRemove }: {
  current: string; picked: PreparedPoster | null; busy: boolean; error?: string | undefined;
  onPick: (file: File | undefined) => void; onRemove: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const currentSrc = useFileUrl(current);
  const src = picked?.previewUrl ?? currentSrc;
  return (
    <div>
      <p className="mb-1 text-[15px] font-medium">โปสเตอร์ <span className="font-normal text-ink-muted">(ถ้ามี)</span></p>
      <div className="flex flex-wrap items-start gap-3 rounded-control bg-sunken p-3">
        {src
          ? <img src={src} alt="ตัวอย่างโปสเตอร์" className="h-40 w-auto max-w-[10rem] rounded-[8px] bg-surface object-contain ring-1 ring-line" />
          : <span className="grid h-40 w-28 place-items-center rounded-[8px] border-2 border-dashed border-line-strong text-center text-sm text-ink-muted">ยังไม่มี<br />โปสเตอร์</span>}
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <input ref={inputRef} type="file" accept="image/jpeg,image/png" className="sr-only" tabIndex={-1} aria-hidden="true"
            onChange={(event) => { onPick(event.target.files?.[0]); event.target.value = ''; }} />
          <Button variant="secondary" loading={busy} onClick={() => inputRef.current?.click()} icon={<ImagePlus className="size-4" aria-hidden="true" />} className="self-start">
            {src ? 'เปลี่ยนโปสเตอร์' : 'เลือกรูปโปสเตอร์'}
          </Button>
          {src && <Button variant="ghost" onClick={onRemove} icon={<X className="size-4" aria-hidden="true" />} className="self-start text-danger hover:bg-danger-soft">เอาโปสเตอร์ออก</Button>}
          {error
            ? <p className="text-sm text-danger">{error}</p>
            : <p className="text-sm text-ink-muted">JPG หรือ PNG ระบบย่อรูปให้โหลดเร็วบนมือถือ ผู้สมัครแตะดูภาพใหญ่ได้{picked ? ` (รูปใหม่ ${picked.width}×${picked.height} พิกเซล)` : ''}</p>}
        </div>
      </div>
    </div>
  );
}

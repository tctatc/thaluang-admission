import { useEffect, useState, type FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { Pencil, Pin, Plus, Trash2 } from 'lucide-react';
import type { Announcement } from '@shared/model';
import { bangkokDateParts, thaiLongDate } from '@shared/thai';
import { useStaff } from '../../app/staff';
import { Alert, Button, Loading, Panel, TextField, cn } from '../../components/ui';
import { api, errorMessage, issuesOf } from '../../lib/api';

const blank: Partial<Announcement> = { title: '', body: '', pinned: false, published: true };

export function AnnouncementsPage() {
  const { staff, token } = useStaff();
  const [list, setList] = useState<Announcement[] | null>(null);
  const [editing, setEditing] = useState<Partial<Announcement> | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');

  useEffect(() => { api.adminAnnouncements(token).then((r) => setList(r.announcements)).catch((e) => setError(errorMessage(e))); }, [token]);
  if (staff?.role !== 'admin') return <Navigate to="/staff" replace />;

  const open = (item: Partial<Announcement>) => { setEditing({ ...item }); setErrors({}); setError(''); };
  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (!editing) return;
    setBusy('save');
    setErrors({});
    try {
      setList((await api.saveAnnouncement(token, editing)).announcements);
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
    if (!window.confirm(`ลบประกาศ "${item.title}" ?`)) return;
    setBusy(item.id);
    try {
      setList((await api.deleteAnnouncement(token, item.id)).announcements);
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setBusy('');
    }
  };

  return (
    <div className="max-w-3xl space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-brand-deep">ประกาศประชาสัมพันธ์</h1>
          <p className="text-sm text-ink-muted">ประกาศที่เผยแพร่จะขึ้นหน้าแรกทันที ปักหมุดไว้บนสุดได้</p>
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
            <div className="flex flex-wrap gap-4">
              <label className="inline-flex min-h-11 items-center gap-2"><input type="checkbox" checked={editing.published !== false} onChange={(e) => setEditing({ ...editing, published: e.target.checked })} />เผยแพร่บนหน้าเว็บ</label>
              <label className="inline-flex min-h-11 items-center gap-2"><input type="checkbox" checked={editing.pinned === true} onChange={(e) => setEditing({ ...editing, pinned: e.target.checked })} />ปักหมุดไว้บนสุด</label>
            </div>
            {error && <Alert tone="danger">{error}</Alert>}
            <div className="flex gap-2">
              <Button type="submit" loading={busy === 'save'}>บันทึกประกาศ</Button>
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
                  <Button variant="ghost" className="text-danger hover:bg-danger-soft" loading={busy === item.id} onClick={() => remove(item)} icon={<Trash2 className="size-4" aria-hidden="true" />}>ลบ</Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

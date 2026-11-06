import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { LockKeyhole, Pencil, Search, Shuffle, Trash2, UserPlus } from 'lucide-react';
import { STAFF_ROLES, STAFF_ROLE_HINT, STAFF_ROLE_LABEL, type StaffAccount, type StaffRole } from '@shared/users';
import { checkNewPassword, PASSWORD_MIN } from '@shared/validate';
import { useStaff } from '../../app/staff';
import { Dialog } from '../../components/Dialog';
import { Alert, Button, Loading, TextField, cn, initialOf } from '../../components/ui';
import { api, errorMessage, issuesOf } from '../../lib/api';

/** รหัสผ่านสุ่ม 10 ตัว ตัดตัวที่อ่านสับสน (0/O, 1/l/I) ออก ให้จดส่งต่อง่าย */
function randomPassword(): string {
  const pool = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  for (;;) {
    const password = Array.from(crypto.getRandomValues(new Uint8Array(10)), (byte) => pool[byte % pool.length]).join('');
    if (!checkNewPassword('', password) && /\d/.test(password)) return password;
  }
}

const loginText = (iso: string) => iso === ''
  ? 'ยังไม่เคยเข้าสู่ระบบ'
  : `เข้าล่าสุด ${new Intl.DateTimeFormat('th-TH-u-nu-latn', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Bangkok' }).format(new Date(iso))}`;

/** รหัสที่เพิ่งตั้งให้ — ค้างไว้จนกดรับทราบ เพราะระบบเก็บแค่ค่าเข้ารหัส ดูย้อนหลังไม่ได้ */
interface Issued { displayName: string; username: string; password: string }
type Done = (users: StaffAccount[], message: string, issued?: Issued) => void;
type Open = { kind: 'create' } | { kind: 'edit' | 'password' | 'delete'; user: StaffAccount };

const roleTone = (role: StaffRole) => (role === 'admin' ? 'bg-brand-soft text-brand' : 'bg-sunken text-ink-muted');

export function UsersPage() {
  const { staff, token } = useStaff();
  const [users, setUsers] = useState<StaffAccount[] | null>(null);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState<Open | null>(null);
  const [message, setMessage] = useState('');
  const [issued, setIssued] = useState<Issued | null>(null);

  const load = useCallback(() => {
    setError('');
    api.listStaff(token).then((result) => setUsers(result.users)).catch((cause) => setError(errorMessage(cause)));
  }, [token]);
  useEffect(load, [load]);

  const close = useCallback(() => setOpen(null), []);
  const done: Done = useCallback((list, text, credential) => {
    setUsers(list);
    setMessage(text);
    setIssued(credential ?? null);
    setOpen(null);
  }, []);

  const shown = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return (users ?? [])
      .filter((u) => !needle || `${u.displayName} ${u.username}`.toLowerCase().includes(needle))
      .sort((a, b) => Number(b.role === 'admin') - Number(a.role === 'admin') || a.displayName.localeCompare(b.displayName, 'th'));
  }, [users, query]);

  if (staff?.role !== 'admin') return <Navigate to="/staff" replace />;
  if (error && !users) return <Alert tone="danger" title="โหลดรายชื่อผู้ใช้ไม่สำเร็จ">{error} <button type="button" className="underline" onClick={load}>ลองใหม่</button></Alert>;
  if (!users) return <Loading label="กำลังโหลดรายชื่อผู้ใช้" />;

  const activeAdmins = users.filter((u) => u.role === 'admin' && u.status === 'active').length;

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-brand-deep">จัดการผู้ใช้</h1>
          <p className="text-sm text-ink-muted">เพิ่มบัญชีเจ้าหน้าที่ ตั้งรหัสผ่าน และกำหนดสิทธิ์</p>
        </div>
        <Button onClick={() => setOpen({ kind: 'create' })} icon={<UserPlus className="size-4" aria-hidden="true" />}>เพิ่มผู้ใช้</Button>
      </div>

      {issued && (
        <Alert tone="ok" title={`ข้อมูลเข้าสู่ระบบของ ${issued.displayName}`}>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <p>ชื่อผู้ใช้ <strong className="font-semibold">{issued.username}</strong></p>
            <p>รหัสผ่าน <strong className="font-semibold tracking-wide">{issued.password}</strong></p>
            <Button variant="secondary" className="min-h-9 px-3 text-sm" onClick={() => setIssued(null)}>จดแล้ว ปิดข้อความนี้</Button>
          </div>
          <p className="mt-1 text-sm">ส่งให้เจ้าของบัญชีโดยตรง ปิดข้อความนี้แล้วดูย้อนหลังไม่ได้ เจ้าของบัญชีเปลี่ยนรหัสเองได้ที่ "บัญชีของฉัน"</p>
        </Alert>
      )}
      {message && !issued && <Alert tone="ok">{message}</Alert>}

      <section className="overflow-hidden rounded-card bg-surface shadow-card ring-1 ring-line">
        <div className="flex flex-wrap items-center gap-3 border-b border-line px-4 py-3">
          <label className="relative min-w-0 flex-1 sm:max-w-xs">
            <span className="sr-only">ค้นหาผู้ใช้</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted" aria-hidden="true" />
            <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ค้นหาชื่อหรือชื่อผู้ใช้"
              className="min-h-11 w-full rounded-control border border-line-strong bg-surface pl-9 pr-3 text-[15px] focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20" />
          </label>
          <p className="text-sm text-ink-muted" data-numeric>{users.length} บัญชี</p>
        </div>

        {shown.length === 0 ? (
          <p className="px-4 py-10 text-center text-ink-muted">ไม่พบผู้ใช้ที่ค้นหา</p>
        ) : (
          <ul className="divide-y divide-line">
            {shown.map((user) => {
              const self = user.username === staff.username;
              return (
                <li key={user.username} className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center">
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    <span aria-hidden="true" className={cn('grid size-10 shrink-0 place-items-center rounded-full text-base font-semibold', roleTone(user.role))}>
                      {initialOf(user.displayName)}
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <p className="font-medium">{user.displayName}</p>
                        <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', roleTone(user.role))}>{STAFF_ROLE_LABEL[user.role]}</span>
                        {user.status !== 'active' && <span className="rounded-full bg-danger-soft px-2 py-0.5 text-xs font-medium text-danger">ปิดการใช้งาน</span>}
                        {self && <span className="rounded-full bg-gold-soft px-2 py-0.5 text-xs font-medium text-gold-ink">คุณ</span>}
                      </div>
                      <p className="text-sm text-ink-muted">ชื่อผู้ใช้ {user.username}</p>
                      <p className="text-xs text-ink-muted" data-numeric>{loginText(user.lastLoginAt)}</p>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2 pl-13 sm:pl-0 [&>button]:whitespace-nowrap">
                    <Button variant="secondary" className="min-h-10 px-3 text-sm" onClick={() => setOpen({ kind: 'edit', user })} icon={<Pencil className="size-4" aria-hidden="true" />}>แก้ไข</Button>
                    <Button variant="secondary" className="min-h-10 px-3 text-sm" onClick={() => setOpen({ kind: 'password', user })} icon={<LockKeyhole className="size-4" aria-hidden="true" />}>
                      รีเซ็ตรหัสผ่าน
                    </Button>
                    {!self && (
                      <Button variant="ghost" className="min-h-10 px-3 text-sm text-danger hover:bg-danger-soft" onClick={() => setOpen({ kind: 'delete', user })}
                        aria-label={`ลบ ${user.displayName}`} icon={<Trash2 className="size-4" aria-hidden="true" />}>ลบ</Button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {activeAdmins === 1 && (
        <p className="text-sm text-ink-muted">มีผู้ดูแลระบบที่ใช้งานได้คนเดียว ระบบจึงไม่ให้ลดสิทธิ์ ปิด หรือลบบัญชีนั้น ควรมีผู้ดูแลสำรองอย่างน้อยอีก 1 คน</p>
      )}

      {(open?.kind === 'create' || open?.kind === 'edit') && (
        <UserFormDialog user={open.kind === 'edit' ? open.user : null} self={open.kind === 'edit' && open.user.username === staff.username} onClose={close} onDone={done} />
      )}
      {open?.kind === 'password' && <ResetPasswordDialog user={open.user} onClose={close} onDone={done} />}
      {open?.kind === 'delete' && <DeleteUserDialog user={open.user} onClose={close} onDone={done} />}
    </div>
  );
}

function PasswordInput({ id, value, onChange, error }: { id: string; value: string; onChange: (v: string) => void; error?: string | undefined }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-[15px] font-medium">รหัสผ่าน</label>
      <div className="flex gap-2">
        <input id={id} value={value} onChange={(e) => onChange(e.target.value)} autoComplete="new-password" spellCheck={false} maxLength={64}
          aria-invalid={Boolean(error)} aria-describedby={`${id}-hint`}
          className={cn('min-h-11 min-w-0 flex-1 rounded-control border bg-surface px-3 text-base tracking-wide focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20', error ? 'border-danger' : 'border-line-strong')} />
        <Button variant="secondary" onClick={() => onChange(randomPassword())} icon={<Shuffle className="size-4" aria-hidden="true" />}>สุ่มใหม่</Button>
      </div>
      <p id={`${id}-hint`} className={cn('mt-1 text-sm', error ? 'text-danger' : 'text-ink-muted')}>{error ?? `อย่างน้อย ${PASSWORD_MIN} ตัว มีตัวอักษรปน ไม่ใช่ตัวเลขล้วน`}</p>
    </div>
  );
}

function UserFormDialog({ user, self, onClose, onDone }: { user: StaffAccount | null; self: boolean; onClose: () => void; onDone: Done }) {
  const { token } = useStaff();
  const creating = user === null;
  const [username, setUsername] = useState(user?.username ?? '');
  const [displayName, setDisplayName] = useState(user?.displayName ?? '');
  const [role, setRole] = useState<StaffRole>(user?.role ?? 'staff');
  const [active, setActive] = useState((user?.status ?? 'active') === 'active');
  const [password, setPassword] = useState(() => (creating ? randomPassword() : ''));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    setErrors({});
    const account = { username, displayName, role, status: active ? 'active' as const : 'disabled' as const };
    try {
      const result = creating ? await api.createStaff(token, { ...account, password }) : await api.updateStaff(token, account);
      onDone(result.users, creating ? `เพิ่ม ${displayName} แล้ว` : `บันทึก ${displayName} แล้ว`,
        creating ? { displayName, username, password } : undefined);
    } catch (cause) {
      setErrors(issuesOf(cause));
      setError(errorMessage(cause));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog title={creating ? 'เพิ่มผู้ใช้' : `แก้ไข ${user.displayName}`} onClose={onClose}
      description={creating ? 'จดรหัสผ่านไว้ให้เจ้าของบัญชี ระบบไม่เก็บรหัสจริง ดูย้อนหลังไม่ได้' : `ชื่อผู้ใช้ ${user.username}`}
      footer={<>
        <Button variant="secondary" onClick={onClose}>ยกเลิก</Button>
        <Button type="submit" form="user-form" loading={busy}>{creating ? 'เพิ่มผู้ใช้' : 'บันทึก'}</Button>
      </>}>
      <form id="user-form" onSubmit={submit} noValidate className="space-y-4">
        {error && <Alert tone="danger">{error}</Alert>}
        <TextField label="ชื่อ-นามสกุล" value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={100} placeholder="เช่น นางสาวสมใจ ใจดี" error={errors.displayName} required />
        {creating && (
          <TextField label="ชื่อผู้ใช้ (ใช้เข้าสู่ระบบ)" value={username} autoCapitalize="none" spellCheck={false} maxLength={32} placeholder="เช่น somjai"
            onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ''))} error={errors.username} hint="a-z 0-9 . _ - ยาว 3–32 ตัว" required />
        )}
        {creating && <PasswordInput id="uf-password" value={password} onChange={setPassword} error={errors.password} />}

        <fieldset className="min-w-0">
          <legend className="mb-1 block text-[15px] font-medium">สิทธิ์การใช้งาน</legend>
          {self && <p className="mb-2 text-sm text-ink-muted">เปลี่ยนสิทธิ์ของตัวเองไม่ได้ ให้ผู้ดูแลคนอื่นทำแทน</p>}
          <div className="grid gap-2">
            {STAFF_ROLES.map((value) => (
              <label key={value} className={cn('flex min-h-14 items-center gap-3 rounded-control px-3 py-2 ring-1 transition-colors',
                role === value ? 'bg-brand-soft ring-brand' : 'ring-line hover:bg-sunken', self && 'cursor-not-allowed opacity-60')}>
                <input type="radio" name="uf-role" value={value} checked={role === value} disabled={self} onChange={() => setRole(value)} className="size-4" />
                <span className="min-w-0">
                  <span className="block font-medium">{STAFF_ROLE_LABEL[value]}</span>
                  <span className="block text-sm text-ink-muted">{STAFF_ROLE_HINT[value]}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        {!creating && !self && (
          <label className="flex min-h-11 items-center gap-3">
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="size-5" />
            <span>เปิดใช้งานบัญชีนี้ <span className="text-sm text-ink-muted">(ปิดแล้วเข้าสู่ระบบไม่ได้ แต่ประวัติการทำงานยังอยู่)</span></span>
          </label>
        )}
      </form>
    </Dialog>
  );
}

function ResetPasswordDialog({ user, onClose, onDone }: { user: StaffAccount; onClose: () => void; onDone: Done }) {
  const { token } = useStaff();
  const [password, setPassword] = useState(randomPassword);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const problem = checkNewPassword('', password);
    if (problem) { setError(problem); return; }
    setBusy(true);
    setError('');
    try {
      const result = await api.resetStaffPassword(token, user.username, password);
      onDone(result.users, `ตั้งรหัสผ่านใหม่ของ ${user.displayName} แล้ว`, { displayName: user.displayName, username: user.username, password });
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog title={`รีเซ็ตรหัสผ่าน ${user.displayName}`} onClose={onClose}
      description="รหัสเดิมใช้ไม่ได้ทันที ทุกเครื่องที่เข้าสู่ระบบด้วยบัญชีนี้จะถูกออกจากระบบ"
      footer={<>
        <Button variant="secondary" onClick={onClose}>ยกเลิก</Button>
        <Button type="submit" form="reset-password-form" loading={busy}>ตั้งรหัสผ่านใหม่</Button>
      </>}>
      <form id="reset-password-form" onSubmit={submit} noValidate>
        <PasswordInput id="rp-password" value={password} onChange={setPassword} error={error || undefined} />
      </form>
    </Dialog>
  );
}

function DeleteUserDialog({ user, onClose, onDone }: { user: StaffAccount; onClose: () => void; onDone: Done }) {
  const { token } = useStaff();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const confirm = async () => {
    setBusy(true);
    setError('');
    try {
      onDone((await api.deleteStaff(token, user.username)).users, `ลบบัญชี ${user.displayName} แล้ว`);
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog title={`ลบบัญชี ${user.displayName}?`} onClose={onClose}
      description={`ชื่อผู้ใช้ ${user.username} จะเข้าสู่ระบบไม่ได้อีก ใบสมัครที่เคยตรวจไว้ยังอยู่ครบ`}
      footer={<>
        <Button variant="secondary" onClick={onClose} data-autofocus>ยกเลิก</Button>
        <Button variant="danger" onClick={confirm} loading={busy} icon={<Trash2 className="size-4" aria-hidden="true" />}>ลบบัญชี</Button>
      </>}>
      {error ? <Alert tone="danger">{error}</Alert> : <p>การลบย้อนกลับไม่ได้ ถ้าแค่ต้องการพักบัญชี ให้กด "แก้ไข" แล้วปิดการใช้งานแทน</p>}
    </Dialog>
  );
}

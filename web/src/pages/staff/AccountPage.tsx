import { useState, type FormEvent } from 'react';
import { KeyRound } from 'lucide-react';
import { checkNewPassword, PASSWORD_MIN } from '@shared/validate';
import { useStaff } from '../../app/staff';
import { Alert, Button, Panel, TextField } from '../../components/ui';
import { errorMessage, issuesOf } from '../../lib/api';

/** บัญชีของฉัน: เปลี่ยนรหัสผ่านเอง (ทุกคนใช้ได้ ไม่เฉพาะผู้ดูแล) */
export function AccountPage() {
  const { staff, changePassword } = useStaff();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{ tone: 'ok' | 'danger'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const save = async (event: FormEvent) => {
    event.preventDefault();
    setMessage(null);
    const problem = checkNewPassword(current, next);
    const local: Record<string, string> = {};
    if (!current) local.currentPassword = 'กรอกรหัสผ่านเดิม';
    if (problem) local.newPassword = problem;
    else if (next !== confirm) local.confirm = 'รหัสผ่านใหม่ทั้งสองช่องไม่ตรงกัน';
    setErrors(local);
    if (Object.keys(local).length) return;

    setBusy(true);
    try {
      await changePassword(current, next);
      setCurrent('');
      setNext('');
      setConfirm('');
      setMessage({ tone: 'ok', text: 'เปลี่ยนรหัสผ่านแล้ว ครั้งหน้าเข้าระบบด้วยรหัสใหม่ เครื่องอื่นที่ล็อกอินค้างไว้ถูกออกจากระบบแล้ว' });
    } catch (cause) {
      setErrors(issuesOf(cause));
      setMessage({ tone: 'danger', text: errorMessage(cause) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={save} className="max-w-md space-y-5" noValidate>
      <div>
        <h1 className="text-2xl font-bold text-brand-deep">บัญชีของฉัน</h1>
        <p className="text-sm text-ink-muted">{staff?.displayName} · ชื่อผู้ใช้ <span className="font-medium text-ink">{staff?.username}</span></p>
      </div>
      <Panel title="เปลี่ยนรหัสผ่าน">
        <div className="space-y-4">
          {/* ช่องชื่อผู้ใช้ที่ซ่อนไว้ ให้ตัวจัดการรหัสผ่านของเบราว์เซอร์รู้ว่าเป็นรหัสของบัญชีไหน */}
          <input type="text" name="username" autoComplete="username" value={staff?.username ?? ''} readOnly hidden />
          <TextField label="รหัสผ่านเดิม" type="password" autoComplete="current-password" value={current}
            onChange={(e) => setCurrent(e.target.value)} error={errors.currentPassword} required />
          <TextField label="รหัสผ่านใหม่" type="password" autoComplete="new-password" value={next}
            onChange={(e) => setNext(e.target.value)} error={errors.newPassword} required
            hint={`อย่างน้อย ${PASSWORD_MIN} ตัว มีตัวอักษรปน ไม่ใช่ตัวเลขล้วน`} />
          <TextField label="พิมพ์รหัสผ่านใหม่อีกครั้ง" type="password" autoComplete="new-password" value={confirm}
            onChange={(e) => setConfirm(e.target.value)} error={errors.confirm} required />
        </div>
      </Panel>
      {message && <Alert tone={message.tone}>{message.text}</Alert>}
      <Button type="submit" loading={busy} icon={<KeyRound className="size-4" aria-hidden="true" />}>บันทึกรหัสผ่านใหม่</Button>
    </form>
  );
}

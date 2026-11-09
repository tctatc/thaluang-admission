import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, LogIn } from 'lucide-react';
import { useStaff } from '../../app/staff';
import { Alert, Button, TextField } from '../../components/ui';
import { apiMode, errorMessage } from '../../lib/api';
import { DEMO_STAFF } from '../../lib/demo';

export function LoginPage() {
  const { login } = useStaff();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  // ระหว่างพิมพ์รหัส โหลดโค้ดหน้าแรกของเจ้าหน้าที่ไว้ก่อน ล็อกอินเสร็จจะได้ไม่ต้องรอดาวน์โหลดเพิ่ม
  useEffect(() => { void import('./DashboardPage'); void import('./ApplicantsPage'); }, []);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login(username, password);
    } catch (cause) {
      setError(errorMessage(cause));
      setBusy(false);
    }
  };

  return (
    <div className="relative grid min-h-dvh place-items-center bg-brand-deep px-4 py-16">
      <Link to="/" className="absolute left-4 top-4 inline-flex min-h-11 items-center gap-2 rounded-control px-3 text-ink-inverse/80 transition-colors hover:bg-ink-inverse/10 hover:text-ink-inverse">
        <ArrowLeft className="size-4" aria-hidden="true" />กลับหน้าหลัก
      </Link>
      <div className="w-full max-w-sm">
        <img src={`${import.meta.env.BASE_URL}college-logo.png`} alt="" className="mx-auto size-20 rounded-full bg-surface p-1" />
        <h1 className="mt-4 text-center text-2xl font-bold text-ink-inverse">งานรับสมัคร (เจ้าหน้าที่)</h1>
        <form onSubmit={submit} className="mt-6 space-y-4 rounded-card bg-surface p-6 shadow-paper">
          {error && <Alert tone="danger">{error}</Alert>}
          <TextField label="ชื่อผู้ใช้" autoComplete="username" autoCapitalize="none" value={username} onChange={(e) => setUsername(e.target.value)} required />
          <TextField label="รหัสผ่าน" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <Button type="submit" loading={busy} className="w-full" icon={<LogIn className="size-4" aria-hidden="true" />}>เข้าสู่ระบบ</Button>
          {apiMode === 'demo' && (
            <div className="rounded-control bg-gold-soft p-3 text-sm text-gold-ink">
              <p className="font-medium">บัญชีโหมดสาธิต</p>
              {DEMO_STAFF.map((staff) => (
                <button key={staff.username} type="button" className="mt-1 block underline" onClick={() => { setUsername(staff.username); setPassword(staff.password); }}>
                  {staff.username} / {staff.password} ({staff.role === 'admin' ? 'ผู้ดูแล' : 'เจ้าหน้าที่'})
                </button>
              ))}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

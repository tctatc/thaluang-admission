import { useState, type FormEvent } from 'react';
import { LogIn } from 'lucide-react';
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
    <div className="grid min-h-dvh place-items-center bg-brand-deep px-4 py-10">
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

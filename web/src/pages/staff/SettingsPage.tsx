import { useState, type FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { checkStudentIdPattern, nextStudentId } from '@shared/numbering';
import type { Settings } from '@shared/model';
import { useStaff } from '../../app/staff';
import { Alert, Button, Panel, TextField, cn } from '../../components/ui';
import { api, errorMessage, issuesOf } from '../../lib/api';

export function SettingsPage() {
  const { staff, settings, programs, token, setSettings } = useStaff();
  const [form, setForm] = useState<Settings | null>(settings);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{ tone: 'ok' | 'danger'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  if (staff?.role !== 'admin') return <Navigate to="/staff" replace />;
  if (!form) return null;

  const set = <K extends keyof Settings>(key: K, value: Settings[K]) => setForm({ ...form, [key]: value });
  const patternProblem = checkStudentIdPattern(form.studentIdPattern);
  const sample = programs.find((p) => p.track === 'pvc');
  const example = !patternProblem && sample ? nextStudentId(form.studentIdPattern, { academicYear: form.academicYear, track: 'pvc', programCode: sample.code }, []) : '';

  const save = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    setErrors({});
    try {
      const result = await api.saveSettings(token, form);
      setSettings(result.settings);
      setForm(result.settings);
      setMessage({ tone: 'ok', text: 'บันทึกแล้ว หน้าเว็บผู้สมัครเปลี่ยนตามทันที' });
    } catch (cause) {
      setErrors(issuesOf(cause));
      setMessage({ tone: 'danger', text: errorMessage(cause) });
    } finally {
      setBusy(false);
    }
  };

  const area = (key: 'heroText' | 'details', label: string, hint: string, rows: number) => (
    <div>
      <label htmlFor={key} className="mb-1 block text-[15px] font-medium">{label}</label>
      <textarea id={key} rows={rows} value={form[key]} onChange={(e) => set(key, e.target.value)} maxLength={key === 'details' ? 4000 : 300}
        className={cn('w-full rounded-control border border-line-strong bg-surface px-3 py-2 text-base focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20')} />
      <p className="mt-1 text-sm text-ink-muted">{hint}</p>
    </div>
  );

  return (
    <form onSubmit={save} className="max-w-3xl space-y-5">
      <h1 className="text-2xl font-bold text-brand-deep">ตั้งค่าการรับสมัครและข้อความหน้าเว็บ</h1>

      <Panel title="การรับสมัคร">
        <div className="space-y-5">
          <TextField label="ปีการศึกษาที่เปิดรับ (พ.ศ.)" inputMode="numeric" maxLength={4} value={String(form.academicYear || '')}
            onChange={(e) => set('academicYear', Number(e.target.value.replace(/\D/g, '')) || 0)} error={errors.academicYear}
            hint="พิมพ์ลงหัวใบสมัคร และใช้นับเลขที่ใบสมัคร/รหัสนักศึกษา" />
          <label className="flex items-start gap-3 rounded-control bg-sunken p-3">
            <input type="checkbox" checked={form.applicationsOpen} onChange={(e) => set('applicationsOpen', e.target.checked)} className="mt-1 size-5" />
            <span><span className="font-medium">เปิดรับสมัคร</span><br /><span className="text-sm text-ink-muted">ปิดแล้วผู้สมัครใหม่ส่งใบสมัครไม่ได้ ผู้ที่สมัครแล้วยังตรวจสถานะ แนบเอกสาร และพิมพ์ใบสมัครได้</span></span>
          </label>
          <div>
            <TextField label="รูปแบบรหัสนักศึกษา" value={form.studentIdPattern} onChange={(e) => set('studentIdPattern', e.target.value)}
              error={errors.studentIdPattern ?? (patternProblem || undefined)}
              hint="{YY} ปี 2 หลัก · {YYYY} ปี 4 หลัก · {L} 2=ปวช. 3=ปวส. · {PP} รหัสสาขา · {NNN} เลขลำดับ (จำนวน N = จำนวนหลัก)" />
            {example && <p className="mt-2 text-sm">ตัวอย่างรหัสแรกของ ปวช. {sample!.name}: <span className="font-semibold" data-numeric>{example}</span></p>}
          </div>
        </div>
      </Panel>

      <Panel title="ข้อความหน้าแรก">
        <div className="space-y-5">
          <TextField label="หัวข้อใหญ่" maxLength={300} value={form.heroTitle} onChange={(e) => set('heroTitle', e.target.value)} />
          {area('heroText', 'ข้อความใต้หัวข้อ', 'ประโยคสั้น ๆ ชวนสมัคร', 3)}
          {area('details', 'รายละเอียดการรับสมัคร', 'กำหนดการ คุณสมบัติผู้สมัคร วันมอบตัว เบอร์ติดต่อ ขึ้นบรรทัดใหม่ได้ เว้นว่าง = ไม่แสดงส่วนนี้', 8)}
        </div>
      </Panel>

      {message && <Alert tone={message.tone}>{message.text}</Alert>}
      <div className="above-bottom-nav sticky -mx-4 border-t border-line bg-canvas/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-card sm:border">
        <Button type="submit" loading={busy} disabled={Boolean(patternProblem)}>บันทึกการตั้งค่า</Button>
      </div>
    </form>
  );
}

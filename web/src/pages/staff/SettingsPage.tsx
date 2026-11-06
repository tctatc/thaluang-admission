import { useState, type FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { checkStudentIdPattern, nextStudentId } from '@shared/numbering';
import { useStaff } from '../../app/staff';
import { Alert, Button, Panel, TextField } from '../../components/ui';
import { api, errorMessage, issuesOf } from '../../lib/api';

export function SettingsPage() {
  const { staff, settings, programs, token, setSettings } = useStaff();
  const [year, setYear] = useState(String(settings?.academicYear ?? ''));
  const [open, setOpen] = useState(settings?.applicationsOpen ?? true);
  const [pattern, setPattern] = useState(settings?.studentIdPattern ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{ tone: 'ok' | 'danger'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  if (staff?.role !== 'admin') return <Navigate to="/staff" replace />;

  const patternProblem = checkStudentIdPattern(pattern);
  const sample = programs.find((p) => p.track === 'pvc');
  const example = !patternProblem && sample && /^\d{4}$/.test(year)
    ? nextStudentId(pattern, { academicYear: Number(year), track: 'pvc', programCode: sample.code }, [])
    : '';

  const save = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    setErrors({});
    try {
      const result = await api.saveSettings(token, { academicYear: Number(year), applicationsOpen: open, studentIdPattern: pattern.trim() });
      setSettings(result.settings);
      setMessage({ tone: 'ok', text: 'บันทึกแล้ว มีผลกับผู้สมัครทันที' });
    } catch (cause) {
      setErrors(issuesOf(cause));
      setMessage({ tone: 'danger', text: errorMessage(cause) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-5">
      <h1 className="text-2xl font-bold text-brand-deep">ตั้งค่าการรับสมัคร</h1>
      <Panel>
        <form onSubmit={save} className="space-y-5">
          <TextField label="ปีการศึกษาที่เปิดรับ (พ.ศ.)" inputMode="numeric" maxLength={4} value={year} onChange={(e) => setYear(e.target.value)} error={errors.academicYear}
            hint="พิมพ์ลงหัวใบสมัคร และใช้นับเลขที่ใบสมัคร/รหัสนักศึกษา" />
          <label className="flex items-start gap-3 rounded-control bg-sunken p-3">
            <input type="checkbox" checked={open} onChange={(e) => setOpen(e.target.checked)} className="mt-1 size-5" />
            <span><span className="font-medium">เปิดรับสมัคร</span><br /><span className="text-sm text-ink-muted">ปิดแล้วผู้สมัครใหม่ส่งใบสมัครไม่ได้ ผู้ที่สมัครแล้วยังตรวจสถานะ แนบเอกสาร และพิมพ์ใบสมัครได้</span></span>
          </label>
          <div>
            <TextField label="รูปแบบรหัสนักศึกษา" value={pattern} onChange={(e) => setPattern(e.target.value)} error={errors.studentIdPattern ?? (patternProblem || undefined)}
              hint="{YY} ปี 2 หลัก · {YYYY} ปี 4 หลัก · {L} 2=ปวช. 3=ปวส. · {PP} รหัสสาขา · {NNN} เลขลำดับ (จำนวน N = จำนวนหลัก)" />
            {example && <p className="mt-2 text-sm">ตัวอย่างรหัสแรกของ ปวช. {sample!.name}: <span className="font-semibold" data-numeric>{example}</span></p>}
          </div>
          {message && <Alert tone={message.tone}>{message.text}</Alert>}
          <Button type="submit" loading={busy} disabled={Boolean(patternProblem)}>บันทึก</Button>
        </form>
      </Panel>
      <Alert tone="info" title="แก้รายชื่อสาขาวิชา">
        เปิดชีต <b>Programs</b> ในไฟล์ Google Sheets ของระบบ แต่ละแถวมีรหัสสาขา (2 หลัก ใช้ในรหัสนักศึกษา) ระดับ (pvc = ปวช., pvs = ปวส.) ชื่อสาขา และ TRUE/FALSE เปิดรับ
      </Alert>
    </div>
  );
}

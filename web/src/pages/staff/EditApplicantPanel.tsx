import { useState, type FormEvent } from 'react';
import { CHANNELS, CURRENT_LEVELS, INPUT_FIELDS, LEVELS, LEVEL_LABEL, PREFIXES, trackOf, type Applicant, type ApplicationInput, type Level } from '@shared/model';
import { PROVINCES } from '@shared/provinces';
import { useStaff } from '../../app/staff';
import { Alert, Button, Panel, SelectField, TextField, ThaiDateField } from '../../components/ui';
import { api, errorMessage, issuesOf } from '../../lib/api';

const LABEL: Partial<Record<keyof ApplicationInput, string>> = {
  firstName: 'ชื่อ', lastName: 'นามสกุล', nationalId: 'เลขบัตรประชาชน', phone: 'โทรศัพท์', email: 'อีเมล',
  fatherName: 'ชื่อ-สกุลบิดา', fatherAge: 'อายุบิดา', fatherJob: 'อาชีพบิดา', motherName: 'ชื่อ-สกุลมารดา', motherAge: 'อายุมารดา', motherJob: 'อาชีพมารดา',
  houseNo: 'บ้านเลขที่', moo: 'หมู่', soi: 'ซอย', road: 'ถนน', subdistrict: 'ตำบล', district: 'อำเภอ', postcode: 'รหัสไปรษณีย์',
  schoolName: 'โรงเรียนเดิม', schoolAddressNo: 'โรงเรียน ตั้งอยู่เลขที่', schoolSubdistrict: 'โรงเรียน ตำบล', schoolDistrict: 'โรงเรียน อำเภอ',
  gpa: 'ผลการเรียนเฉลี่ย', currentMajor: 'สาขาวิชาเดิม', referrer: 'ผู้แนะนำ',
};

/** แก้ข้อมูลที่ผู้สมัครกรอกผิด — server ตรวจด้วยกฎเดียวกับตอนสมัคร และบันทึกชื่อผู้แก้ไว้ */
export function EditApplicantPanel({ applicant, onDone }: { applicant: Applicant; onDone: (a: Applicant | null) => void }) {
  const { token, programs } = useStaff();
  const [form, setForm] = useState<ApplicationInput>(() => Object.fromEntries(INPUT_FIELDS.map((f) => [f, applicant[f]])) as unknown as ApplicationInput);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const track = LEVELS.includes(form.level as Level) ? trackOf(form.level as Level) : null;
  const options = programs.filter((p) => p.track === track).map((p) => ({ value: p.code, label: `${p.name}${p.active ? '' : ' (ปิดรับ)'}` }));
  const bind = (field: keyof ApplicationInput) => ({
    name: field, value: form[field], error: errors[field],
    onChange: (e: { target: { value: string } }) => setForm((f) => ({ ...f, [field]: e.target.value })),
  });

  const save = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    setErrors({});
    try {
      onDone((await api.updateApplicant(token, applicant.id, form)).applicant);
    } catch (cause) {
      setErrors(issuesOf(cause));
      setError(errorMessage(cause));
    } finally {
      setBusy(false);
    }
  };

  const text = (field: keyof ApplicationInput, extra: Record<string, unknown> = {}) => <TextField key={field} label={LABEL[field] ?? field} {...bind(field)} {...extra} />;

  return (
    <Panel title="แก้ไขข้อมูลผู้สมัคร">
      <form onSubmit={save} className="space-y-4" noValidate>
        <div className="grid gap-3 sm:grid-cols-2">
          <SelectField label="ระดับที่สมัคร" options={LEVELS.map((l) => ({ value: l, label: LEVEL_LABEL[l] }))} {...bind('level')} />
          {track === 'pvs'
            ? <SelectField label="สาขา ปวส." options={options} {...bind('programPvs')} />
            : <SelectField label="สาขา ปวช. ลำดับ 1" options={options} {...bind('programPvc1')} />}
          {track === 'pvc' && <SelectField label="สาขา ปวช. ลำดับ 2" placeholder="ไม่เลือก" options={options} {...bind('programPvc2')} />}
          <SelectField label="คำนำหน้า" options={PREFIXES} {...bind('prefix')} />
          {text('firstName')}
          {text('lastName')}
          {text('nationalId', { inputMode: 'numeric' })}
          <ThaiDateField label="วันเกิด" value={form.birthDate} onChange={(v) => setForm((f) => ({ ...f, birthDate: v }))} error={errors.birthDate} />
          {text('phone', { inputMode: 'tel' })}
          {text('email')}
          {(['fatherName', 'fatherAge', 'fatherJob', 'motherName', 'motherAge', 'motherJob', 'houseNo', 'moo', 'soi', 'road', 'subdistrict', 'district'] as const).map((f) => text(f))}
          <SelectField label="จังหวัด" options={PROVINCES} {...bind('province')} />
          {text('postcode', { inputMode: 'numeric' })}
          <SelectField label="ระดับชั้นปัจจุบัน" options={CURRENT_LEVELS} {...bind('currentLevel')} />
          {(['schoolName', 'schoolAddressNo', 'schoolSubdistrict', 'schoolDistrict'] as const).map((f) => text(f))}
          <SelectField label="จังหวัดโรงเรียน" options={PROVINCES} {...bind('schoolProvince')} />
          {text('gpa', { inputMode: 'decimal' })}
          {text('currentMajor')}
          <SelectField label="ช่องทางที่รู้จัก" options={CHANNELS} {...bind('channel')} />
          {text('referrer')}
        </div>
        {error && <Alert tone="danger">{error}</Alert>}
        <div className="flex gap-2">
          <Button type="submit" loading={busy}>บันทึกการแก้ไข</Button>
          <Button variant="ghost" onClick={() => onDone(null)}>ยกเลิก</Button>
        </div>
      </form>
    </Panel>
  );
}

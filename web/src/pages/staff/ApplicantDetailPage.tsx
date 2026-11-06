import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Check, Eye, IdCard, Pencil, Printer, X } from 'lucide-react';
import {
  DOC_INFO, DOC_KINDS, DOC_STATE_LABEL, ENROLLMENT_FIELDS, LEVEL_LABEL, STATUSES, STATUS_LABEL, firstChoice, fullName, programName, trackOf,
  type Applicant, type DocKind, type Enrollment, type Level, type Status,
} from '@shared/model';
import { bangkokDateKey, parseIsoDate, thaiLongDate } from '@shared/thai';
import { useStaff } from '../../app/staff';
import { Alert, Button, Panel, SelectField, StatusBadge, TextField, ThaiDateField, cn } from '../../components/ui';
import { api, errorMessage, issuesOf } from '../../lib/api';
import { base64ToBlob, formatBytes } from '../../lib/files';
import { ApplicationSheet } from '../../sheets/ApplicationSheet';
import { EnrollmentSheet } from '../../sheets/EnrollmentSheet';
import { ScaledSheet } from '../../sheets/parts';
import { EditApplicantPanel } from './EditApplicantPanel';

export function ApplicantDetailPage() {
  const { id } = useParams();
  const { applicants, programs, token, replace } = useStaff();
  const applicant = applicants.find((item) => item.id === id);
  const [photo, setPhoto] = useState('');
  const [sheet, setSheet] = useState<'application' | 'enrollment'>('application');
  const [editing, setEditing] = useState(false);
  const photoId = applicant?.documents.photo?.fileId;

  useEffect(() => {
    setPhoto('');
    if (!applicant || !photoId) return;
    api.getFile(token, applicant.id, 'photo').then((file) => setPhoto(`data:${file.mime};base64,${file.dataBase64}`)).catch(() => setPhoto(''));
  }, [applicant?.id, photoId, token]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!applicant) {
    return <Panel className="py-12 text-center"><p>ไม่พบใบสมัครนี้</p><Link to="/staff/applicants" className="mt-3 inline-block text-brand underline">กลับไปรายชื่อผู้สมัคร</Link></Panel>;
  }

  const birth = parseIsoDate(applicant.birthDate);
  const choices = applicant.level === 'pvc'
    ? [programName(programs, applicant.programPvc1), programName(programs, applicant.programPvc2)].filter(Boolean).map((name, i) => `${i + 1}. ${name}`).join('  ')
    : programName(programs, applicant.programPvs);

  return (
    <div className="space-y-5">
      <div className="no-print">
        <Link to="/staff/applicants" className="inline-flex min-h-11 items-center gap-1 text-brand hover:underline"><ArrowLeft className="size-4" aria-hidden="true" />รายชื่อผู้สมัคร</Link>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold text-brand-deep">{fullName(applicant)}</h1>
          <StatusBadge status={applicant.status} />
          <span className="text-ink-muted" data-numeric>{applicant.appNo}</span>
          {applicant.studentId && <span className="rounded-full bg-gold-soft px-3 py-0.5 font-semibold text-gold-ink" data-numeric>รหัส {applicant.studentId}</span>}
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="no-print space-y-5">
          {editing ? <EditApplicantPanel applicant={applicant} onDone={(next) => { if (next) replace(next); setEditing(false); }} /> : (
          <Panel title="ข้อมูลผู้สมัคร" action={<Button variant="ghost" onClick={() => setEditing(true)} icon={<Pencil className="size-4" aria-hidden="true" />}>แก้ไขข้อมูล</Button>}>
            <dl className="grid gap-x-6 gap-y-2 text-[15px] sm:grid-cols-2">
              <Item label="ระดับที่สมัคร">{LEVEL_LABEL[applicant.level as Level]}</Item>
              <Item label="สาขาที่เลือก">{choices}</Item>
              <Item label="เลขบัตรประชาชน"><span data-numeric>{applicant.nationalId}</span></Item>
              <Item label="วันเกิด">{birth ? thaiLongDate(birth) : '-'}</Item>
              <Item label="โทรศัพท์"><a href={`tel:${applicant.phone}`} className="text-brand underline" data-numeric>{applicant.phone}</a></Item>
              <Item label="อีเมล">{applicant.email || '-'}</Item>
              <Item label="โรงเรียนเดิม">{applicant.schoolName} ({applicant.currentLevel}) จ.{applicant.schoolProvince}</Item>
              <Item label="ผลการเรียนเฉลี่ย"><span data-numeric>{applicant.gpa}</span></Item>
              <Item label="ที่อยู่" wide>{[applicant.houseNo, applicant.moo && `ม.${applicant.moo}`, applicant.soi && `ซ.${applicant.soi}`, applicant.road && `ถ.${applicant.road}`, `ต.${applicant.subdistrict}`, `อ.${applicant.district}`, `จ.${applicant.province}`, applicant.postcode].filter(Boolean).join(' ')}</Item>
              <Item label="บิดา">{applicant.fatherName || '-'}{applicant.fatherAge && ` อายุ ${applicant.fatherAge}`}{applicant.fatherJob && ` (${applicant.fatherJob})`}</Item>
              <Item label="มารดา">{applicant.motherName || '-'}{applicant.motherAge && ` อายุ ${applicant.motherAge}`}{applicant.motherJob && ` (${applicant.motherJob})`}</Item>
              <Item label="รู้จักวิทยาลัยจาก">{applicant.channel}{applicant.referrer && ` · ผู้แนะนำ: ${applicant.referrer}`}</Item>
              <Item label="แก้ไขล่าสุด">{thaiLongDate(parseIsoDate(bangkokDateKey(applicant.updatedAt))!)} โดย {applicant.updatedBy}</Item>
            </dl>
          </Panel>
          )}

          <DocumentsPanel applicant={applicant} onChange={replace} />
          <StatusPanel applicant={applicant} onChange={replace} />
          {(applicant.status === 'passed' || applicant.status === 'enrolled') && <EnrollPanel applicant={applicant} onChange={replace} />}
        </div>

        <section className="space-y-3" aria-label="เอกสารสำหรับพิมพ์">
          <div className="no-print flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-control bg-sunken p-1" role="tablist">
              {([['application', 'ใบสมัคร'], ['enrollment', 'ใบมอบตัว']] as const).map(([key, label]) => (
                <button key={key} type="button" role="tab" aria-selected={sheet === key} disabled={key === 'enrollment' && !applicant.enrollment}
                  onClick={() => setSheet(key)} className={cn('min-h-10 rounded-[8px] px-4 text-[15px] font-medium disabled:opacity-40', sheet === key ? 'bg-surface text-brand shadow-card' : 'text-ink-muted')}>
                  {label}
                </button>
              ))}
            </div>
            <Button variant="secondary" onClick={() => window.print()} icon={<Printer className="size-4" aria-hidden="true" />}>พิมพ์</Button>
          </div>
          <div className="rounded-card bg-sunken p-3 ring-1 ring-line print:bg-transparent print:p-0 print:ring-0">
            <ScaledSheet className="print-area [&_.sheet]:shadow-paper">
              {sheet === 'enrollment' && applicant.enrollment
                ? <EnrollmentSheet applicant={applicant} programs={programs} photo={photo} />
                : <ApplicationSheet data={applicant} programs={programs} academicYear={applicant.academicYear} photo={photo} />}
            </ScaledSheet>
          </div>
        </section>
      </div>
    </div>
  );
}

function Item({ label, children, wide = false }: { label: string; children: ReactNode; wide?: boolean }) {
  return (
    <div className={wide ? 'sm:col-span-2' : ''}>
      <dt className="text-sm text-ink-muted">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

function DocumentsPanel({ applicant, onChange }: { applicant: Applicant; onChange: (a: Applicant) => void }) {
  const { token } = useStaff();
  const [viewing, setViewing] = useState<{ url: string; mime: string; name: string } | null>(null);
  const [fixing, setFixing] = useState<DocKind | null>(null);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => () => { if (viewing) URL.revokeObjectURL(viewing.url); }, [viewing]);

  const view = async (kind: DocKind) => {
    setBusy(`view-${kind}`);
    setError('');
    try {
      const file = await api.getFile(token, applicant.id, kind);
      setViewing({ url: URL.createObjectURL(base64ToBlob(file.dataBase64, file.mime)), mime: file.mime, name: DOC_INFO[kind].label });
      dialogRef.current?.showModal();
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setBusy('');
    }
  };

  const review = async (kind: DocKind, state: 'ok' | 'fix' | 'pending', reason = '') => {
    setBusy(`${state}-${kind}`);
    setError('');
    try {
      onChange((await api.reviewDocument(token, applicant.id, kind, state, reason)).applicant);
      setFixing(null);
      setNote('');
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setBusy('');
    }
  };

  return (
    <Panel title="ตรวจเอกสาร">
      {error && <Alert tone="danger" className="mb-3">{error}</Alert>}
      <ul className="divide-y divide-line">
        {DOC_KINDS.map((kind) => {
          const doc = applicant.documents[kind];
          return (
            <li key={kind} className="py-3">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <div className="min-w-0 flex-1 basis-56">
                  <p className="font-medium">{DOC_INFO[kind].label}{!DOC_INFO[kind].required && <span className="font-normal text-ink-muted"> (ถ้ามี)</span>}</p>
                  <p className={cn('text-sm', !doc ? 'text-ink-muted' : doc.state === 'ok' ? 'text-ok' : doc.state === 'fix' ? 'text-danger' : 'text-info')}>
                    {doc ? `${DOC_STATE_LABEL[doc.state]} · ${doc.mime === 'application/pdf' ? 'PDF' : 'รูปภาพ'} ${formatBytes(doc.size)}` : 'ยังไม่ส่ง'}
                    {doc?.state === 'fix' && ` · "${doc.note}"`}
                  </p>
                </div>
                {doc && (
                  <div className="flex flex-wrap gap-1.5">
                    <Button variant="ghost" loading={busy === `view-${kind}`} onClick={() => view(kind)} icon={<Eye className="size-4" aria-hidden="true" />}>ดู</Button>
                    {doc.state !== 'ok' && <Button variant="secondary" loading={busy === `ok-${kind}`} onClick={() => review(kind, 'ok')} icon={<Check className="size-4 text-ok" aria-hidden="true" />}>ผ่าน</Button>}
                    {doc.state !== 'fix' && <Button variant="secondary" onClick={() => { setFixing(kind); setNote(''); }} icon={<X className="size-4 text-danger" aria-hidden="true" />}>ขอแก้</Button>}
                    {doc.state === 'ok' && <Button variant="ghost" loading={busy === `pending-${kind}`} onClick={() => review(kind, 'pending')}>ยกเลิกผ่าน</Button>}
                  </div>
                )}
              </div>
              {fixing === kind && (
                <form className="mt-3 flex flex-wrap items-end gap-2" onSubmit={(event) => { event.preventDefault(); void review(kind, 'fix', note); }}>
                  <TextField label="บอกผู้สมัครว่าต้องแก้อะไร" className="min-w-0 flex-1 basis-64" value={note} onChange={(e) => setNote(e.target.value)} placeholder="เช่น ภาพเบลอ อ่านเลขบัตรไม่ได้" autoFocus required />
                  <Button type="submit" variant="danger" loading={busy === `fix-${kind}`} disabled={!note.trim()}>ส่งให้ผู้สมัครแก้</Button>
                  <Button variant="ghost" onClick={() => setFixing(null)}>ยกเลิก</Button>
                </form>
              )}
            </li>
          );
        })}
      </ul>

      <dialog ref={dialogRef} onClose={() => setViewing(null)} className="m-auto max-h-[92dvh] w-[min(960px,94vw)] rounded-card p-0 shadow-paper backdrop:bg-ink/60">
        {viewing && (
          <div className="flex max-h-[92dvh] flex-col">
            <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-2">
              <p className="font-medium">{viewing.name}</p>
              <div className="flex gap-1">
                <a href={viewing.url} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center px-3 text-brand underline">เปิดแท็บใหม่</a>
                <Button variant="ghost" onClick={() => dialogRef.current?.close()} aria-label="ปิด" icon={<X className="size-5" aria-hidden="true" />} />
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-auto bg-sunken">
              {viewing.mime === 'application/pdf'
                ? <iframe title={viewing.name} src={viewing.url} className="h-[80dvh] w-full" />
                : <img src={viewing.url} alt={viewing.name} className="mx-auto max-w-full" />}
            </div>
          </div>
        )}
      </dialog>
    </Panel>
  );
}

function StatusPanel({ applicant, onChange }: { applicant: Applicant; onChange: (a: Applicant) => void }) {
  const { token } = useStaff();
  const [status, setStatus] = useState<Status>(applicant.status);
  const [note, setNote] = useState(applicant.statusNote);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ tone: 'ok' | 'danger'; text: string } | null>(null);

  useEffect(() => { setStatus(applicant.status); setNote(applicant.statusNote); }, [applicant.status, applicant.statusNote]);

  if (applicant.status === 'enrolled') return null;

  const save = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      onChange((await api.setStatus(token, applicant.id, status, note)).applicant);
      setMessage({ tone: 'ok', text: applicant.email ? 'บันทึกแล้ว และส่งอีเมลแจ้งผู้สมัคร' : 'บันทึกแล้ว ผู้สมัครเห็นในหน้าตรวจสถานะ' });
    } catch (cause) {
      setMessage({ tone: 'danger', text: errorMessage(cause) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Panel title="สถานะใบสมัคร">
      <form onSubmit={save} className="space-y-4">
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="สถานะ">
          {STATUSES.filter((s) => s !== 'enrolled').map((s) => (
            <label key={s} className={cn('inline-flex min-h-11 items-center gap-2 rounded-control border-2 px-3', status === s ? 'border-brand bg-brand-soft' : 'border-line')}>
              <input type="radio" name="status" value={s} checked={status === s} onChange={() => setStatus(s)} />
              {STATUS_LABEL[s]}
            </label>
          ))}
        </div>
        <TextField label="ข้อความถึงผู้สมัคร" hint="ผู้สมัครเห็นข้อความนี้ในหน้าตรวจสถานะ เช่น วันนัดมอบตัว" value={note} onChange={(e) => setNote(e.target.value)} maxLength={300} />
        {message && <Alert tone={message.tone}>{message.text}</Alert>}
        <Button type="submit" loading={busy} disabled={status === applicant.status && note === applicant.statusNote}>บันทึกสถานะ</Button>
      </form>
    </Panel>
  );
}

function EnrollPanel({ applicant, onChange }: { applicant: Applicant; onChange: (a: Applicant) => void }) {
  const { token, programs } = useStaff();
  const blank = Object.fromEntries(ENROLLMENT_FIELDS.map((f) => [f, ''])) as unknown as Enrollment;
  const [form, setForm] = useState<Enrollment>(() => applicant.enrollment ?? {
    ...blank,
    admittedProgram: firstChoice(applicant),
    guardianName: applicant.fatherName || applicant.motherName,
    guardianRelation: applicant.fatherName ? 'บิดา' : applicant.motherName ? 'มารดา' : '',
    enrolledDate: bangkokDateKey(new Date().toISOString()),
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const track = trackOf(applicant.level as Level);
  const bind = (field: keyof Enrollment) => ({
    value: form[field], error: errors[field],
    onChange: (event: { target: { value: string } }) => setForm((f) => ({ ...f, [field]: event.target.value })),
  });

  const save = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    setErrors({});
    try {
      onChange((await api.enroll(token, applicant.id, form)).applicant);
    } catch (cause) {
      setErrors(issuesOf(cause));
      setError(errorMessage(cause));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Panel title={applicant.enrollment ? 'ข้อมูลการมอบตัว' : 'บันทึกการมอบตัว'}>
      {!applicant.studentId && <p className="mb-4 text-sm text-ink-muted">กดบันทึกแล้วระบบออกรหัสนักศึกษาให้อัตโนมัติ (แก้ข้อมูลภายหลังได้ รหัสไม่เปลี่ยน)</p>}
      <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
        <SelectField label="สาขาที่รับเข้า" required className="sm:col-span-2" placeholder="เลือกสาขา"
          options={programs.filter((p) => p.track === track).map((p) => ({ value: p.code, label: p.name }))} {...bind('admittedProgram')} />
        <TextField label="ชื่อ-สกุลผู้ปกครอง" required {...bind('guardianName')} />
        <TextField label="เกี่ยวข้องเป็น" required placeholder="บิดา / มารดา / ญาติ" {...bind('guardianRelation')} />
        <TextField label="โทรศัพท์ผู้ปกครอง" required inputMode="tel" maxLength={12} {...bind('guardianPhone')} />
        <TextField label="อาชีพผู้ปกครอง" {...bind('guardianJob')} />
        <TextField label="ที่อยู่ผู้ปกครอง" hint="เว้นว่างถ้าเหมือนนักศึกษา" className="sm:col-span-2" {...bind('guardianAddress')} />
        <TextField label="พยาน" {...bind('witnessName')} />
        <TextField label="ตำแหน่งพยาน" {...bind('witnessPosition')} />
        <ThaiDateField label="วันที่มอบตัว" required minAge={0} maxAge={1} futureYears={1} value={form.enrolledDate}
          onChange={(value) => setForm((f) => ({ ...f, enrolledDate: value }))} error={errors.enrolledDate} />
        <TextField label="หมายเหตุ" {...bind('note')} />
        {error && <Alert tone="danger" className="sm:col-span-2">{error}</Alert>}
        <div className="sm:col-span-2">
          <Button type="submit" loading={busy} icon={<IdCard className="size-4" aria-hidden="true" />}>
            {applicant.studentId ? 'บันทึกการแก้ไข' : 'บันทึกการมอบตัวและออกรหัสนักศึกษา'}
          </Button>
        </div>
      </form>
    </Panel>
  );
}

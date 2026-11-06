import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Check, FileUp, LogOut, Printer, RefreshCw, Search } from 'lucide-react';
import { DOC_INFO, DOC_KINDS, DOC_STATE_LABEL, type DocKind, type Status } from '@shared/model';
import type { PublicApplicant } from '@shared/service';
import { usePublicConfig } from '../app/App';
import { Alert, Button, Loading, Panel, StatusBadge, TextField, ThaiDateField, cn } from '../components/ui';
import { api, errorMessage, type Credentials } from '../lib/api';
import { formatBytes, prepareFile } from '../lib/files';
import { ApplicationSheet } from '../sheets/ApplicationSheet';
import { ScaledSheet } from '../sheets/parts';

const STEPS: { label: string; done: (status: Status) => boolean }[] = [
  { label: 'ส่งใบสมัคร', done: () => true },
  { label: 'ตรวจเอกสาร', done: (s) => s === 'passed' || s === 'not_passed' || s === 'enrolled' },
  { label: 'ประกาศผล', done: (s) => s === 'passed' || s === 'not_passed' || s === 'enrolled' },
  { label: 'มอบตัว', done: (s) => s === 'enrolled' },
];

export function StatusPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const incoming = location.state as (Credentials & { justSubmitted?: boolean }) | null;
  // เก็บเลขบัตร/วันเกิดไว้ในหน่วยความจำของหน้านี้เท่านั้น ออกจากหน้า = ต้องกรอกใหม่
  const [cred, setCred] = useState<Credentials | null>(incoming?.nationalId ? { nationalId: incoming.nationalId, birthDate: incoming.birthDate } : null);
  const [justSubmitted] = useState(Boolean(incoming?.justSubmitted));
  const [applicant, setApplicant] = useState<PublicApplicant | null>(null);
  const [photo, setPhoto] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // ล้าง state ของ router ทิ้ง ไม่ให้เลขบัตรค้างในประวัติเบราว์เซอร์
    if (incoming) navigate('.', { replace: true, state: null });
    // ตั้งใจรันครั้งเดียวตอนเปิดหน้า
  }, []);

  useEffect(() => {
    if (!cred) return;
    setLoading(true);
    setError('');
    api.lookup(cred)
      .then((result) => { setApplicant(result.applicant); setPhoto(result.photo); })
      .catch((cause) => { setError(errorMessage(cause)); setCred(null); })
      .finally(() => setLoading(false));
  }, [cred]);

  const signOut = () => { setApplicant(null); setPhoto(''); setCred(null); };

  if (loading) return <Loading label="กำลังเปิดใบสมัคร" />;
  if (!applicant || !cred) return <LookupForm error={error} onSubmit={setCred} />;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {justSubmitted && (
        <Alert tone="ok" title={`ส่งใบสมัครเรียบร้อย เลขที่ใบสมัคร ${applicant.appNo}`} className="no-print enter mb-6">
          ขั้นต่อไป แนบเอกสารด้านล่าง แล้วพิมพ์ใบสมัคร ลงชื่อผู้สมัคร และนำมายื่นพร้อมสำเนาเอกสารตามวันที่วิทยาลัยกำหนด
        </Alert>
      )}

      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className="no-print space-y-6">
          <Panel>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm text-ink-muted">เลขที่ใบสมัคร <span className="font-semibold text-ink" data-numeric>{applicant.appNo}</span></p>
                <h1 className="mt-1 text-2xl font-bold text-brand-deep">{applicant.prefix}{applicant.firstName} {applicant.lastName}</h1>
              </div>
              <StatusBadge status={applicant.status} />
            </div>
            <ol className="mt-5 grid grid-cols-4 gap-1" aria-label="ความคืบหน้า">
              {STEPS.map((step) => {
                const done = step.done(applicant.status);
                return (
                  <li key={step.label} className="text-center text-sm">
                    <span className={cn('mb-1 block h-1.5 rounded-full', done ? 'bg-brand' : 'bg-line')} />
                    <span className={done ? 'font-medium text-ink' : 'text-ink-muted'}>{step.label}</span>
                  </li>
                );
              })}
            </ol>
            {applicant.status === 'enrolled' && (
              <p className="mt-5 rounded-control bg-gold-soft px-4 py-3 text-gold-ink">รหัสนักศึกษาของคุณ <span className="text-xl font-bold" data-numeric>{applicant.studentId}</span></p>
            )}
            {applicant.statusNote && <Alert tone={applicant.status === 'not_passed' ? 'danger' : 'info'} title="ข้อความจากเจ้าหน้าที่" className="mt-5">{applicant.statusNote}</Alert>}
          </Panel>

          <Panel title="เอกสารแนบ" action={<span className="text-sm text-ink-muted">JPG, PNG, PDF ไม่เกิน 5 MB</span>}>
            <ul className="divide-y divide-line">
              {DOC_KINDS.map((kind) => (
                <DocumentRow key={kind} kind={kind} applicant={applicant} cred={cred} onUpdated={(next) => { setApplicant(next); if (kind === 'photo') api.lookup(cred).then((r) => setPhoto(r.photo)).catch(() => {}); }} />
              ))}
            </ul>
          </Panel>

          <Button variant="ghost" onClick={signOut} icon={<LogOut className="size-4" aria-hidden="true" />}>ออกจากหน้านี้ (เครื่องใช้ร่วมกันควรกด)</Button>
        </div>

        <PrintPanel applicant={applicant} photo={photo} />
      </div>
    </div>
  );
}

function LookupForm({ error, onSubmit }: { error: string; onSubmit: (cred: Credentials) => void }) {
  const [nationalId, setNationalId] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [missing, setMissing] = useState<Record<string, string>>({});
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const id = nationalId.replace(/\D/g, '');
    const next: Record<string, string> = {};
    if (id.length !== 13) next.nationalId = 'กรอกเลขบัตรประชาชนให้ครบ 13 หลัก';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) next.birthDate = 'เลือกวัน เดือน ปีเกิดให้ครบ';
    setMissing(next);
    if (Object.keys(next).length === 0) onSubmit({ nationalId: id, birthDate });
  };
  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <h1 className="text-2xl font-bold text-brand-deep">ตรวจสถานะ / พิมพ์ใบสมัคร</h1>
      <p className="mt-2 text-ink-muted">ใช้เลขบัตรประชาชนและวันเกิดที่กรอกตอนสมัคร ต้องตรงกันทั้งสองอย่าง</p>
      {error && <Alert tone="danger" className="mt-5">{error}</Alert>}
      <form onSubmit={submit} noValidate className="mt-6 space-y-5 rounded-card bg-surface p-6 shadow-card ring-1 ring-line">
        <TextField label="เลขบัตรประชาชน" required inputMode="numeric" autoComplete="off" maxLength={17} value={nationalId}
          onChange={(event) => setNationalId(event.target.value)} error={missing.nationalId} />
        <ThaiDateField label="วันเดือนปีเกิด" required value={birthDate} onChange={setBirthDate} error={missing.birthDate} />
        <Button type="submit" className="w-full" icon={<Search className="size-4" aria-hidden="true" />}>ค้นหาใบสมัคร</Button>
      </form>
    </div>
  );
}

function DocumentRow({ kind, applicant, cred, onUpdated }: {
  kind: DocKind; applicant: PublicApplicant; cred: Credentials; onUpdated: (applicant: PublicApplicant) => void;
}) {
  const info = DOC_INFO[kind];
  const doc = applicant.documents[kind];
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const closed = applicant.status === 'enrolled' || applicant.status === 'not_passed';
  const locked = closed || doc?.state === 'ok';

  const choose = async (file: File | undefined) => {
    if (!file) return;
    setError('');
    try {
      setBusy('กำลังเตรียมไฟล์');
      const prepared = await prepareFile(file, kind);
      setBusy(`กำลังส่ง ${formatBytes(prepared.bytes)}`);
      onUpdated((await api.upload(cred, kind, prepared.name, prepared.dataUrl)).applicant);
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setBusy('');
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const tone = !doc ? (info.required ? 'text-warn' : 'text-ink-muted') : doc.state === 'ok' ? 'text-ok' : doc.state === 'fix' ? 'text-danger' : 'text-info';
  return (
    <li className="flex flex-wrap items-center gap-x-4 gap-y-2 py-4">
      <div className="min-w-0 flex-1 basis-64">
        <p className="font-medium">{info.label}{!info.required && <span className="font-normal text-ink-muted"> (ถ้ามี)</span>}</p>
        <p className={cn('text-sm', tone)}>
          {doc ? <>{doc.state === 'ok' && <Check className="mr-1 inline size-4" aria-hidden="true" />}{DOC_STATE_LABEL[doc.state]} · ส่งแล้ว {formatBytes(doc.size)}</> : info.required ? 'ยังไม่ได้แนบ' : 'ไม่บังคับ'}
        </p>
        {doc?.state === 'fix' && <p className="mt-1 rounded-control bg-danger-soft px-3 py-1.5 text-sm text-danger">เจ้าหน้าที่แจ้ง: {doc.note}</p>}
        {!doc && <p className="text-sm text-ink-muted">{info.hint}</p>}
        {error && <p className="mt-1 text-sm text-danger" role="alert">{error}</p>}
      </div>
      {!locked && (
        <>
          <input ref={inputRef} type="file" className="sr-only" accept={info.imageOnly ? 'image/jpeg,image/png' : 'image/jpeg,image/png,application/pdf'}
            onChange={(event) => void choose(event.target.files?.[0])} aria-label={`เลือกไฟล์ ${info.label}`} />
          <Button variant={doc?.state === 'fix' || !doc ? 'primary' : 'secondary'} loading={Boolean(busy)} onClick={() => inputRef.current?.click()}
            icon={doc ? <RefreshCw className="size-4" aria-hidden="true" /> : <FileUp className="size-4" aria-hidden="true" />}>
            {busy || (doc ? 'ส่งไฟล์ใหม่' : 'แนบไฟล์')}
          </Button>
        </>
      )}
    </li>
  );
}

function PrintPanel({ applicant, photo }: { applicant: PublicApplicant; photo: string }) {
  const { config } = usePublicConfig();
  return (
    <section aria-label="ใบสมัคร" className="space-y-3">
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg text-brand-deep">ใบสมัคร (พร้อมพิมพ์)</h2>
          <p className="text-sm text-ink-muted">บันทึกเป็น PDF ได้จากหน้าต่างพิมพ์</p>
        </div>
        <Button onClick={() => window.print()} icon={<Printer className="size-4" aria-hidden="true" />}>พิมพ์ / บันทึก PDF</Button>
      </div>
      {!photo && <p className="no-print text-sm text-warn">ยังไม่มีรูปถ่าย แนบรูปถ่ายแล้วรูปจะขึ้นในกรอบบนใบสมัคร</p>}
      <div className="rounded-card bg-sunken p-3 ring-1 ring-line print:bg-transparent print:p-0 print:ring-0">
        <ScaledSheet className="print-area [&_.sheet]:shadow-paper">
          <ApplicationSheet data={applicant} programs={config?.programs ?? []} academicYear={applicant.academicYear} photo={photo} />
        </ScaledSheet>
      </div>
    </section>
  );
}

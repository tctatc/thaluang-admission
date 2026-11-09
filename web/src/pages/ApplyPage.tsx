import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, QrCode, Send } from 'lucide-react';
import {
  CHANNELS, CURRENT_LEVELS, LEVELS, LEVEL_LABEL, PREFIXES, emptyInput, trackOf,
  type ApplicationInput, type Level,
} from '@shared/model';
import { PROVINCES } from '@shared/provinces';
import { bangkokDateParts } from '@shared/thai';
import { normalizeInput, validateApplication } from '@shared/validate';
import { usePublicConfig } from '../app/App';
import { Alert, Button, Loading, SelectField, TextField, ThaiDateField, cn } from '../components/ui';
import { api, errorMessage, issuesOf } from '../lib/api';
import { readStore, removeStore, writeStore } from '../lib/storage';
import { ApplicationSheet } from '../sheets/ApplicationSheet';
import { ScaledSheet } from '../sheets/parts';

/** ร่างใบสมัครเก็บใน sessionStorage: รีเฟรชไม่หาย แต่ปิดแท็บแล้วลบ (เครื่องในห้องคอมของโรงเรียนใช้ร่วมกัน) */
const DRAFT_KEY = 'tla.apply.draft.v1';

function loadDraft(): ApplicationInput {
  try {
    const raw = readStore('session', DRAFT_KEY);
    return raw ? { ...emptyInput(), ...(JSON.parse(raw) as Partial<ApplicationInput>) } : emptyInput();
  } catch {
    return emptyInput();
  }
}

export function ApplyPage() {
  const { config, error: configError } = usePublicConfig();
  const navigate = useNavigate();
  const [input, setInput] = useState<ApplicationInput>(loadDraft);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');
  const [sending, setSending] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => { writeStore('session', DRAFT_KEY, JSON.stringify(input)); }, [input]);

  // มาจาก QR รายสาขา (#/apply?p=pvc:01): เลือกสาขาให้เลย — ปวส. มีสองประเภท ผู้สมัครต้องเลือกประเภทเอง
  const [params] = useSearchParams();
  const fromQr = params.get('p') ?? '';
  useEffect(() => {
    const [track, code] = fromQr.split(':');
    if (!code || (track !== 'pvc' && track !== 'pvs')) return;
    setInput((current) => track === 'pvc'
      ? { ...current, level: 'pvc', programPvc1: code, programPvs: '' }
      : { ...current, level: current.level === 'pvc' ? '' : current.level, programPvs: code, programPvc1: '', programPvc2: '' });
  }, [fromQr]);

  const programs = config?.programs ?? [];
  const track = LEVELS.includes(input.level as Level) ? trackOf(input.level as Level) : null;
  const programOptions = useMemo(
    () => programs.filter((program) => program.track === track).map((program) => ({ value: program.code, label: program.name })),
    [programs, track],
  );

  if (configError) return <div className="mx-auto max-w-3xl px-4 py-10"><Alert tone="danger" title="โหลดข้อมูลการรับสมัครไม่สำเร็จ">{configError}</Alert></div>;
  if (!config) return <Loading />;
  if (!config.applicationsOpen) {
    return <div className="mx-auto max-w-3xl px-4 py-10"><Alert tone="warn" title="ขณะนี้ปิดรับสมัครแล้ว">ผู้ที่สมัครไว้แล้วยังตรวจสถานะและพิมพ์ใบสมัครได้ที่เมนูตรวจสถานะ</Alert></div>;
  }

  const set = <K extends keyof ApplicationInput>(field: K) => (value: string) => {
    setInput((current) => ({ ...current, [field]: value }));
    if (errors[field]) setErrors(({ [field]: _gone, ...rest }) => rest);
  };
  const bind = (field: keyof ApplicationInput) => ({
    name: field,
    value: input[field],
    error: errors[field],
    onChange: (event: { target: { value: string } }) => set(field)(event.target.value),
  });

  const focusFirstError = (fields: string[]) => {
    window.requestAnimationFrame(() => {
      const form = formRef.current;
      const target = fields.map((field) => form?.querySelector<HTMLElement>(`[name="${field}"], [data-field="${field}"] select, [data-field="${field}"] input`)).find(Boolean);
      target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      target?.focus({ preventScroll: true });
    });
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitError('');
    const normalized = normalizeInput(input);
    const issues = validateApplication(normalized, programs, bangkokDateParts(new Date().toISOString()));
    if (issues.length) {
      const map: Record<string, string> = {};
      for (const issue of issues) map[issue.field] ??= issue.message;
      setErrors(map);
      focusFirstError(issues.map((issue) => issue.field));
      return;
    }
    setSending(true);
    try {
      await api.submit(normalized);
      removeStore('session', DRAFT_KEY);
      // ส่งเลขบัตร+วันเกิดผ่าน state ของ router (ไม่ใส่ใน URL) ให้หน้าถัดไปเปิดใบสมัครได้ทันที
      navigate('/status', { state: { nationalId: normalized.nationalId, birthDate: normalized.birthDate, justSubmitted: true } });
    } catch (cause) {
      const map = issuesOf(cause);
      setErrors(map);
      setSubmitError(errorMessage(cause));
      if (Object.keys(map).length) focusFirstError(Object.keys(map));
      else window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSending(false);
    }
  };

  const [qrTrack, qrCode] = fromQr.split(':');
  const qrProgram = programs.find((p) => p.track === qrTrack && p.code === qrCode);
  const errorCount = Object.keys(errors).length;
  const preview = <ApplicationSheet data={input} programs={programs} academicYear={config.academicYear} />;

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8">
      <div className="max-w-3xl">
        <h1 className="text-2xl font-bold text-brand-deep sm:text-3xl">ใบสมัครเข้ารับคัดเลือก (โควตา) ปีการศึกษา {config.academicYear}</h1>
        <p className="mt-2 text-ink-muted">หัวข้อเรียงตามข้อในใบสมัครกระดาษ กรอกแล้วข้อมูลขึ้นในใบสมัครทันที ช่องที่มี <span className="text-brand">*</span> ต้องกรอก</p>
      </div>
      {qrProgram && (
        <p className="mt-4 inline-flex max-w-3xl items-center gap-2 rounded-control bg-gold-soft px-4 py-2 text-gold-ink">
          <QrCode className="size-5 shrink-0" aria-hidden="true" />
          สมัครสาขา {qrProgram.track === 'pvc' ? 'ปวช.' : 'ปวส.'} {qrProgram.name} (เลือกให้แล้วจาก QR Code เปลี่ยนได้ในข้อ 6)
        </p>
      )}
      {submitError && <Alert tone="danger" title="ส่งใบสมัครไม่สำเร็จ" className="mt-5 max-w-3xl">{submitError}</Alert>}

      <div className="mt-6 grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)]">
        <form ref={formRef} onSubmit={submit} noValidate className="space-y-6">
          <Section title="ระดับที่ต้องการสมัคร" note="ตรงกับช่องติ๊กหัวใบสมัคร">
            <div data-field="level" role="radiogroup" aria-label="ระดับที่ต้องการสมัคร" className="grid gap-2 sm:grid-cols-3">
              {LEVELS.map((level) => (
                <label key={level} className={cn(
                  'flex min-h-14 items-center gap-3 rounded-control border-2 px-4 py-2 transition-colors',
                  input.level === level ? 'border-brand bg-brand-soft text-brand-deep' : 'border-line hover:border-line-strong',
                )}>
                  <input type="radio" name="level" value={level} checked={input.level === level} onChange={() => set('level')(level)} className="size-4" />
                  <span className="font-medium">{LEVEL_LABEL[level]}</span>
                </label>
              ))}
            </div>
            {errors.level && <p className="mt-2 text-sm text-danger">{errors.level}</p>}
          </Section>

          <Section title="1. ข้อมูลผู้สมัคร">
            <div className="grid gap-4 sm:grid-cols-[9rem_1fr_1fr]">
              <SelectField label="คำนำหน้า" required options={PREFIXES} {...bind('prefix')} />
              <TextField label="ชื่อ" required autoComplete="given-name" {...bind('firstName')} />
              <TextField label="นามสกุล" required autoComplete="family-name" {...bind('lastName')} />
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div data-field="birthDate">
                <ThaiDateField label="วันเดือนปีเกิด" required value={input.birthDate} onChange={set('birthDate')} error={errors.birthDate} />
              </div>
              <TextField label="เลขบัตรประชาชน" required inputMode="numeric" autoComplete="off" maxLength={17} placeholder="x-xxxx-xxxxx-xx-x"
                hint="ใช้ตรวจสถานะภายหลัง ไม่พิมพ์ลงใบสมัคร" {...bind('nationalId')} />
            </div>
          </Section>

          <Section title="2–3. บิดา มารดา" note="ไม่มีข้อมูลเว้นว่างได้">
            <div className="grid gap-4 sm:grid-cols-[1fr_6rem_1fr]">
              <TextField label="ชื่อ-สกุลบิดา" {...bind('fatherName')} />
              <TextField label="อายุ (ปี)" inputMode="numeric" maxLength={3} {...bind('fatherAge')} />
              <TextField label="อาชีพบิดา" {...bind('fatherJob')} />
              <TextField label="ชื่อ-สกุลมารดา" {...bind('motherName')} />
              <TextField label="อายุ (ปี)" inputMode="numeric" maxLength={3} {...bind('motherAge')} />
              <TextField label="อาชีพมารดา" {...bind('motherJob')} />
            </div>
          </Section>

          <Section title="4. ที่อยู่ปัจจุบันที่ติดต่อได้">
            <div className="grid gap-4 sm:grid-cols-4">
              <TextField label="บ้านเลขที่" required {...bind('houseNo')} />
              <TextField label="หมู่" inputMode="numeric" {...bind('moo')} />
              <TextField label="ซอย" {...bind('soi')} />
              <TextField label="ถนน" {...bind('road')} />
              <TextField label="ตำบล / แขวง" required className="sm:col-span-2" {...bind('subdistrict')} />
              <TextField label="อำเภอ / เขต" required className="sm:col-span-2" {...bind('district')} />
              <SelectField label="จังหวัด" required className="sm:col-span-2" options={PROVINCES} {...bind('province')} />
              <TextField label="รหัสไปรษณีย์" required inputMode="numeric" maxLength={5} autoComplete="postal-code" {...bind('postcode')} />
              <TextField label="เบอร์โทรศัพท์" required inputMode="tel" maxLength={12} autoComplete="tel" placeholder="08x-xxx-xxxx" {...bind('phone')} />
            </div>
          </Section>

          <Section title="5. การศึกษาปัจจุบัน">
            <div className="grid gap-4 sm:grid-cols-[10rem_1fr]">
              <SelectField label="ระดับชั้น" required options={CURRENT_LEVELS} {...bind('currentLevel')} />
              <TextField label="โรงเรียน" required placeholder="เช่น โรงเรียนแก่งคอย" {...bind('schoolName')} />
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-4">
              <TextField label="ตั้งอยู่เลขที่" {...bind('schoolAddressNo')} />
              <TextField label="ตำบล" {...bind('schoolSubdistrict')} />
              <TextField label="อำเภอ" {...bind('schoolDistrict')} />
              <SelectField label="จังหวัด" required options={PROVINCES} {...bind('schoolProvince')} />
            </div>
            {/* แถวแยก ให้ป้าย "ผลการเรียนเฉลี่ยสะสม *" อยู่บรรทัดเดียว ช่องสองข้างจึงสูงเท่ากัน */}
            <div className="mt-4 grid gap-4 sm:grid-cols-[13rem_1fr]">
              <TextField label="ผลการเรียนเฉลี่ยสะสม" required inputMode="decimal" maxLength={4} placeholder="เช่น 3.25" {...bind('gpa')} />
              <TextField label="สาขาวิชาเดิม" hint="ถ้าเรียนสายอาชีพอยู่" {...bind('currentMajor')} />
            </div>
          </Section>

          <Section title="6. สาขาวิชาที่ต้องการสมัคร">
            {track === null && <p className="text-ink-muted">เลือกระดับที่ต้องการสมัครด้านบนก่อน รายชื่อสาขาจะขึ้นตามระดับ</p>}
            {track === 'pvs' && <SelectField label="สาขาวิชา (ปวส.)" required options={programOptions} {...bind('programPvs')} />}
            {track === 'pvc' && (
              <div className="grid gap-4 sm:grid-cols-2">
                <SelectField label="สาขาวิชาลำดับที่ 1" required options={programOptions} {...bind('programPvc1')} />
                <SelectField label="สาขาวิชาลำดับที่ 2" placeholder="ไม่เลือก" options={programOptions.filter((option) => option.value !== input.programPvc1)} {...bind('programPvc2')} />
              </div>
            )}
          </Section>

          <Section title="ข้อมูลสำหรับวิทยาลัย" note="ไม่พิมพ์ลงใบสมัคร">
            <div className="grid gap-4 sm:grid-cols-2">
              <SelectField label="รู้จักวิทยาลัยจากช่องทางใด" required options={CHANNELS} {...bind('channel')} />
              <TextField label="ชื่อผู้แนะนำ / ครูแนะแนว" hint="ถ้ามี" {...bind('referrer')} />
              <TextField label="อีเมล" type="email" inputMode="email" autoComplete="email" hint="ถ้ามี — ใช้แจ้งผลการตรวจเอกสาร" className="sm:col-span-2" {...bind('email')} />
            </div>
            <label data-field="consent" className={cn('mt-5 flex items-start gap-3 rounded-control p-3', errors.consent ? 'bg-danger-soft' : 'bg-sunken')}>
              <input type="checkbox" name="consent" checked={input.consent === 'yes'} onChange={(event) => set('consent')(event.target.checked ? 'yes' : '')} className="mt-1 size-5 shrink-0" />
              <span>ข้าพเจ้ายืนยันว่าข้อมูลเป็นความจริง และยินยอมให้วิทยาลัยเก็บและใช้ข้อมูลนี้เพื่อการรับสมัครและการรับมอบตัวเท่านั้น</span>
            </label>
            {errors.consent && <p className="mt-1 text-sm text-danger">{errors.consent}</p>}
          </Section>

          <div className="no-print above-bottom-nav sticky z-10 -mx-4 flex flex-wrap items-center gap-3 border-t border-line bg-canvas/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-card sm:border sm:px-5">
            <Button type="submit" loading={sending} icon={<Send className="size-4" aria-hidden="true" />} className="min-h-12 px-6 text-base">ส่งใบสมัคร</Button>
            <Button variant="secondary" className="xl:hidden" onClick={() => setShowPreview((v) => !v)} icon={showPreview ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}>
              {showPreview ? 'ซ่อนตัวอย่าง' : 'ดูใบสมัคร'}
            </Button>
            {errorCount > 0 && <p className="text-sm text-danger" role="status">ยังมี {errorCount} ช่องที่ต้องแก้</p>}
          </div>
          {showPreview && <div className="xl:hidden"><PreviewFrame>{preview}</PreviewFrame></div>}
        </form>

        <aside className="sticky top-4 hidden xl:block" aria-label="ตัวอย่างใบสมัคร">
          <p className="mb-2 text-sm font-medium text-ink-muted">ตัวอย่างใบสมัครที่จะพิมพ์</p>
          <PreviewFrame>{preview}</PreviewFrame>
        </aside>
      </div>
    </div>
  );
}

function Section({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return (
    <section className="rounded-card bg-surface p-4 shadow-card ring-1 ring-line sm:p-6">
      <h2 className="mb-4 flex flex-wrap items-baseline gap-x-3 text-lg text-brand-deep">
        {title}
        {note && <span className="text-sm font-normal text-ink-muted">{note}</span>}
      </h2>
      {children}
    </section>
  );
}

function PreviewFrame({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-card bg-sunken p-3 ring-1 ring-line">
      <ScaledSheet className="[&_.sheet]:shadow-paper">{children}</ScaledSheet>
    </div>
  );
}

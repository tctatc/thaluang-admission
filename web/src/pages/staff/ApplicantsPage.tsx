import { useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FileSpreadsheet, FileText, Search } from 'lucide-react';
import {
  DOC_INFO, DOC_KINDS, LEVELS, LEVEL_LABEL, STATUSES, STATUS_LABEL, firstChoice, fullName, programName,
  type Applicant, type Status,
} from '@shared/model';
import { exportTable, toCsv, type ExportPreset } from '@shared/exportData';
import { bangkokDateParts } from '@shared/thai';
import { buildXlsx } from '@shared/xlsx';
import { useStaff } from '../../app/staff';
import { Button, StatusBadge, cn } from '../../components/ui';
import { downloadBlob } from '../../lib/files';

const control = 'min-h-11 rounded-control border border-line-strong bg-surface px-3 text-[15px]';

export function ApplicantsPage() {
  const { applicants, programs, settings } = useStaff();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const year = params.get('year') ?? String(settings?.academicYear ?? '');
  const level = params.get('level') ?? '';
  const program = params.get('program') ?? '';
  const status = params.get('status') ?? '';
  const q = params.get('q') ?? '';

  // ตัวกรองเก็บใน URL: กดย้อนกลับจากหน้ารายละเอียดแล้วตัวกรองยังอยู่ และส่งลิงก์ให้เพื่อนร่วมงานได้
  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    setParams(next, { replace: true });
  };

  const years = useMemo(() => [...new Set([settings?.academicYear ?? 0, ...applicants.map((a) => a.academicYear)])].filter(Boolean).sort((a, b) => b - a), [applicants, settings]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase().replace(/[\s-]/g, '');
    return applicants
      .filter((a) => !year || String(a.academicYear) === year)
      .filter((a) => !level || (level === 'pvc' ? a.level === 'pvc' : level === 'pvs' ? a.level !== 'pvc' : a.level === level))
      .filter((a) => {
        if (!program) return true;
        // รหัสสาขาซ้ำกันข้ามระดับได้ จึงกรองด้วย "ระดับ:รหัส"
        const [track, code] = program.split(':');
        return (track === 'pvc') === (a.level === 'pvc') && [a.programPvs, a.programPvc1, a.programPvc2].includes(code ?? '');
      })
      .filter((a) => !status || a.status === status)
      .filter((a) => !needle || `${a.appNo}${a.firstName}${a.lastName}${a.nationalId}${a.phone}${a.schoolName}${a.studentId}`.toLowerCase().replace(/[\s-]/g, '').includes(needle))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [applicants, year, level, program, status, q]);

  const download = (preset: ExportPreset, format: 'xlsx' | 'csv') => {
    const table = exportTable(filtered, programs, preset);
    const name = `${preset === 'registry' ? 'ทะเบียน-มอบตัว' : 'ผู้สมัคร'}-${year || 'ทุกปี'}`;
    if (format === 'csv') downloadBlob(new Blob([toCsv(table.headers, table.rows)], { type: 'text/csv;charset=utf-8' }), `${name}.csv`);
    else downloadBlob(new Blob([buildXlsx(name, table.headers, table.rows)], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), `${name}.xlsx`);
  };
  const enrolledCount = filtered.filter((a) => a.status === 'enrolled').length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-2xl font-bold text-brand-deep">ผู้สมัคร <span className="text-lg font-normal text-ink-muted" data-numeric>({filtered.length.toLocaleString('th-TH')} คน)</span></h1>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => download('full', 'xlsx')} disabled={!filtered.length} icon={<FileSpreadsheet className="size-4" aria-hidden="true" />}>Excel ตามตัวกรอง</Button>
          <Button variant="secondary" onClick={() => download('full', 'csv')} disabled={!filtered.length} icon={<FileText className="size-4" aria-hidden="true" />}>CSV</Button>
          <Button onClick={() => download('registry', 'xlsx')} disabled={!enrolledCount} title="เฉพาะผู้ที่มอบตัวแล้ว รูปแบบสำหรับนำเข้างานทะเบียน"
            icon={<FileSpreadsheet className="size-4" aria-hidden="true" />}>ส่งออกงานทะเบียน ({enrolledCount})</Button>
        </div>
      </div>

      <div className="grid gap-2 rounded-card bg-surface p-3 shadow-card ring-1 ring-line sm:grid-cols-2 lg:grid-cols-[1.6fr_repeat(4,1fr)]">
        <label className="relative">
          <span className="sr-only">ค้นหา</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted" aria-hidden="true" />
          <input type="search" value={q} onChange={(e) => setParam('q', e.target.value)} placeholder="ชื่อ เลขที่ใบสมัคร เลขบัตร เบอร์โทร โรงเรียน" className={cn(control, 'w-full pl-9')} />
        </label>
        <select aria-label="ปีการศึกษา" value={year} onChange={(e) => setParam('year', e.target.value)} className={control}>
          <option value="">ทุกปีการศึกษา</option>
          {years.map((y) => <option key={y} value={y}>ปีการศึกษา {y}</option>)}
        </select>
        <select aria-label="ระดับ" value={level} onChange={(e) => setParam('level', e.target.value)} className={control}>
          <option value="">ทุกระดับ</option>
          <option value="pvc">ปวช. ทั้งหมด</option>
          <option value="pvs">ปวส. ทั้งหมด</option>
          {LEVELS.filter((l) => l !== 'pvc').map((l) => <option key={l} value={l}>{LEVEL_LABEL[l]}</option>)}
        </select>
        <select aria-label="สาขาวิชา" value={program} onChange={(e) => setParam('program', e.target.value)} className={control}>
          <option value="">ทุกสาขา</option>
          {programs.map((p) => <option key={`${p.track}:${p.code}`} value={`${p.track}:${p.code}`}>{p.track === 'pvc' ? 'ปวช.' : 'ปวส.'} {p.name}</option>)}
        </select>
        <select aria-label="สถานะ" value={status} onChange={(e) => setParam('status', e.target.value)} className={control}>
          <option value="">ทุกสถานะ</option>
          {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
        </select>
      </div>

      <div className="overflow-x-auto rounded-card bg-surface shadow-card ring-1 ring-line">
        <table className="w-full min-w-[880px] text-left text-[15px]">
          <thead className="border-b border-line bg-sunken text-sm text-ink-muted">
            <tr>
              <th className="px-4 py-3 font-medium">เลขที่</th>
              <th className="px-4 py-3 font-medium">ชื่อ-นามสกุล</th>
              <th className="px-4 py-3 font-medium">ระดับ / สาขาอันดับ 1</th>
              <th className="px-4 py-3 font-medium">โรงเรียนเดิม</th>
              <th className="px-4 py-3 font-medium">เอกสาร</th>
              <th className="px-4 py-3 font-medium">สถานะ</th>
              <th className="px-4 py-3 font-medium">สมัครเมื่อ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {filtered.map((a) => (
              <tr key={a.id} onClick={() => navigate(`/staff/applicants/${a.id}`)} className="cursor-pointer transition-colors hover:bg-brand-soft/60">
                <td className="px-4 py-3 font-medium" data-numeric>
                  <Link to={`/staff/applicants/${a.id}`} onClick={(e) => e.stopPropagation()} className="text-brand hover:underline">{a.appNo}</Link>
                </td>
                <td className="px-4 py-3">{fullName(a)}</td>
                <td className="px-4 py-3">{a.level === 'pvc' ? 'ปวช.' : 'ปวส.'} {programName(programs, firstChoice(a))}</td>
                <td className="max-w-56 truncate px-4 py-3" title={a.schoolName}>{a.schoolName}</td>
                <td className="px-4 py-3"><DocSummary applicant={a} /></td>
                <td className="px-4 py-3"><StatusBadge status={a.status as Status} /></td>
                <td className="whitespace-nowrap px-4 py-3 text-ink-muted" data-numeric>{shortDate(a.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="px-4 py-12 text-center text-ink-muted">{applicants.length ? 'ไม่มีผู้สมัครที่ตรงกับตัวกรอง' : 'ยังไม่มีผู้สมัคร'}</p>}
      </div>
    </div>
  );
}

const shortDate = (iso: string) => {
  const p = bangkokDateParts(iso);
  return `${p.day}/${p.month}/${String(p.year + 543).slice(-2)}`;
};

/** เอกสารบังคับ: ผ่านกี่ชิ้น / ต้องแก้กี่ชิ้น / ยังไม่ส่งกี่ชิ้น */
function DocSummary({ applicant }: { applicant: Applicant }) {
  const required = DOC_KINDS.filter((kind) => DOC_INFO[kind].required);
  const ok = required.filter((kind) => applicant.documents[kind]?.state === 'ok').length;
  const fix = DOC_KINDS.filter((kind) => applicant.documents[kind]?.state === 'fix').length;
  const missing = required.filter((kind) => !applicant.documents[kind]).length;
  return (
    <span className="text-sm">
      <span className="text-ok">ผ่าน {ok}/{required.length}</span>
      {fix > 0 && <span className="text-danger"> · แก้ {fix}</span>}
      {missing > 0 && <span className="text-warn"> · ขาด {missing}</span>}
    </span>
  );
}


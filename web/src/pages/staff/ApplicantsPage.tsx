import { useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowDown, ArrowUp, ArrowUpDown, FileSpreadsheet, FileText, Search } from 'lucide-react';
import {
  DOC_INFO, DOC_KINDS, LEVELS, LEVEL_LABEL, STATUSES, STATUS_LABEL, firstChoice, fullName,
  type Applicant, type Program, type Status,
} from '@shared/model';
import { exportByProgram, exportTable, toCsv, type ExportPreset } from '@shared/exportData';
import { departmentsOf } from '@shared/admin';
import { bangkokDateParts, toArabicDigits } from '@shared/thai';
import { buildWorkbook, buildXlsx } from '@shared/xlsx';
import { useStaff } from '../../app/staff';
import { Button, StatusBadge, cn } from '../../components/ui';
import { downloadBlob } from '../../lib/files';

const control = 'min-h-11 w-full min-w-0 rounded-control border border-line-strong bg-surface px-3 text-base sm:text-[15px]';

type SortKey = 'appNo' | 'name' | 'program' | 'school' | 'status' | 'createdAt';

/** สาขาอันดับ 1 ของผู้สมัคร (รหัสสาขาซ้ำข้ามระดับได้ จึงต้องดูระดับด้วย) */
const choiceOf = (a: Applicant, programs: readonly Program[]) => {
  const track = a.level === 'pvc' ? 'pvc' : 'pvs';
  return programs.find((p) => p.track === track && p.code === firstChoice(a));
};

export function ApplicantsPage() {
  const { applicants, programs, settings } = useStaff();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const year = params.get('year') ?? String(settings?.academicYear ?? '');
  const level = params.get('level') ?? '';
  const program = params.get('program') ?? '';
  const status = params.get('status') ?? '';
  const department = params.get('dept') ?? '';
  const q = params.get('q') ?? '';
  const sort = (params.get('sort') ?? 'createdAt') as SortKey;
  const dir = params.get('dir') === 'asc' ? 1 : -1;

  // ตัวกรองเก็บใน URL: กดย้อนกลับจากหน้ารายละเอียดแล้วตัวกรองยังอยู่ และส่งลิงก์ให้เพื่อนร่วมงานได้
  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    setParams(next, { replace: true });
  };

  const years = useMemo(() => [...new Set([settings?.academicYear ?? 0, ...applicants.map((a) => a.academicYear)])].filter(Boolean).sort((a, b) => b - a), [applicants, settings]);

  const filtered = useMemo(() => {
    const squash = (value: string) => toArabicDigits(value).toLowerCase().replace(/[\s-]/g, '');
    const needle = squash(q.trim());
    const value = (a: Applicant): string => {
      switch (sort) {
        case 'appNo': return a.appNo;
        case 'name': return `${a.firstName} ${a.lastName}`;
        case 'program': return `${a.level === 'pvc' ? 'ปวช' : 'ปวส'} ${choiceOf(a, programs)?.name ?? ''}`;
        case 'school': return a.schoolName;
        case 'status': return String(STATUSES.indexOf(a.status));
        default: return a.createdAt;
      }
    };
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
      .filter((a) => !department || choiceOf(a, programs)?.department === department)
      .filter((a) => !needle || squash(`${a.appNo}${a.firstName}${a.lastName}${a.nationalId}${a.phone}${a.schoolName}${a.studentId}${choiceOf(a, programs)?.name ?? ''}${choiceOf(a, programs)?.department ?? ''}`).includes(needle))
      .sort((a, b) => dir * value(a).localeCompare(value(b), 'th') || b.createdAt.localeCompare(a.createdAt));
  }, [applicants, programs, year, level, program, status, department, q, sort, dir]);

  const sortBy = (key: SortKey) => {
    const next = new URLSearchParams(params);
    next.set('sort', key);
    next.set('dir', sort === key && dir === 1 ? 'desc' : 'asc');
    setParams(next, { replace: true });
  };
  const header = (key: SortKey, label: string) => (
    <th className="px-4 py-3 font-medium" aria-sort={sort === key ? (dir === 1 ? 'ascending' : 'descending') : 'none'}>
      <button type="button" onClick={() => sortBy(key)} className="inline-flex items-center gap-1 hover:text-ink">
        {label}
        {sort !== key ? <ArrowUpDown className="size-3.5 opacity-50" aria-hidden="true" /> : dir === 1 ? <ArrowUp className="size-3.5" aria-hidden="true" /> : <ArrowDown className="size-3.5" aria-hidden="true" />}
      </button>
    </th>
  );

  const download = (preset: ExportPreset, format: 'xlsx' | 'csv') => {
    const table = exportTable(filtered, programs, preset);
    const name = `${preset === 'registry' ? 'ทะเบียน-มอบตัว' : 'ผู้สมัคร'}-${year || 'ทุกปี'}`;
    if (format === 'csv') downloadBlob(new Blob([toCsv(table.headers, table.rows)], { type: 'text/csv;charset=utf-8' }), `${name}.csv`);
    else downloadBlob(new Blob([buildXlsx(name, table.headers, table.rows)], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), `${name}.xlsx`);
  };
  const downloadByProgram = () => {
    const name = `ผู้สมัคร-แยกสาขา-${year || 'ทุกปี'}`;
    downloadBlob(new Blob([buildWorkbook(exportByProgram(filtered, programs))], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), `${name}.xlsx`);
  };
  const enrolledCount = filtered.filter((a) => a.status === 'enrolled').length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-2xl font-bold text-brand-deep">ผู้สมัคร <span className="text-lg font-normal text-ink-muted" data-numeric>({filtered.length.toLocaleString('th-TH')} คน)</span></h1>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => download('full', 'xlsx')} disabled={!filtered.length} icon={<FileSpreadsheet className="size-4" aria-hidden="true" />}>Excel ตามตัวกรอง</Button>
          <Button variant="secondary" onClick={downloadByProgram} disabled={!filtered.length} title="หนึ่งชีตต่อหนึ่งสาขา เรียงตามโรงเรียนเดิม" icon={<FileSpreadsheet className="size-4" aria-hidden="true" />}>Excel แยกชีตตามสาขา</Button>
          <Button variant="secondary" onClick={() => download('full', 'csv')} disabled={!filtered.length} icon={<FileText className="size-4" aria-hidden="true" />}>CSV</Button>
          <Button onClick={() => download('registry', 'xlsx')} disabled={!enrolledCount} title="เฉพาะผู้ที่มอบตัวแล้ว รูปแบบสำหรับนำเข้างานทะเบียน"
            icon={<FileSpreadsheet className="size-4" aria-hidden="true" />}>ส่งออกงานทะเบียน ({enrolledCount})</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 rounded-card bg-surface p-3 shadow-card ring-1 ring-line sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-[1.6fr_repeat(5,1fr)]">
        <label className="relative col-span-2 min-w-0 sm:col-span-2 lg:col-span-3 xl:col-span-1">
          <span className="sr-only">ค้นหา</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted" aria-hidden="true" />
          <input type="search" value={q} onChange={(e) => setParam('q', e.target.value)} placeholder="ชื่อ นามสกุล โรงเรียน สาขา เลขบัตร" className={cn(control, 'w-full pl-9')} />
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
        <select aria-label="ประเภทวิชา" value={department} onChange={(e) => setParam('dept', e.target.value)} className={control}>
          <option value="">ทุกประเภทวิชา</option>
          {departmentsOf(programs).map((d) => <option key={d} value={d}>ประเภทวิชา{d}</option>)}
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

      {/* มือถือ: การ์ดทีละคน แตะทั้งการ์ดเพื่อเปิด */}
      <ul className="space-y-2 md:hidden">
        {filtered.map((a) => (
          <li key={a.id}>
            <Link to={`/staff/applicants/${a.id}`} className="block rounded-card bg-surface p-4 shadow-card ring-1 ring-line active:bg-brand-soft/60">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-brand" data-numeric>{a.appNo}</p>
                  <p className="truncate text-base font-semibold">{fullName(a)}</p>
                </div>
                <StatusBadge status={a.status as Status} />
              </div>
              <p className="mt-1 text-[15px]">{a.level === 'pvc' ? 'ปวช.' : 'ปวส.'} {choiceOf(a, programs)?.name}</p>
              <p className="truncate text-sm text-ink-muted">{a.schoolName}</p>
              <div className="mt-2 flex items-center justify-between gap-2 border-t border-line pt-2">
                <DocSummary applicant={a} />
                <span className="text-sm text-ink-muted" data-numeric>{shortDate(a.createdAt)}</span>
              </div>
            </Link>
          </li>
        ))}
        {filtered.length === 0 && <li className="rounded-card bg-surface px-4 py-12 text-center text-ink-muted ring-1 ring-line">{applicants.length ? 'ไม่มีผู้สมัครที่ตรงกับตัวกรอง' : 'ยังไม่มีผู้สมัคร'}</li>}
      </ul>

      <div className="hidden overflow-x-auto rounded-card bg-surface shadow-card ring-1 ring-line md:block">
        <table className="w-full min-w-[880px] text-left text-[15px]">
          <thead className="border-b border-line bg-sunken text-sm text-ink-muted">
            <tr>
              {header('appNo', 'เลขที่')}
              {header('name', 'ชื่อ-นามสกุล')}
              {header('program', 'ระดับ / สาขาอันดับ 1')}
              {header('school', 'โรงเรียนเดิม')}
              <th className="px-4 py-3 font-medium">เอกสาร</th>
              {header('status', 'สถานะ')}
              {header('createdAt', 'สมัครเมื่อ')}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {filtered.map((a) => (
              <tr key={a.id} onClick={() => navigate(`/staff/applicants/${a.id}`)} className="cursor-pointer transition-colors hover:bg-brand-soft/60">
                <td className="px-4 py-3 font-medium" data-numeric>
                  <Link to={`/staff/applicants/${a.id}`} onClick={(e) => e.stopPropagation()} className="text-brand hover:underline">{a.appNo}</Link>
                </td>
                <td className="px-4 py-3">{fullName(a)}</td>
                <td className="px-4 py-3">{a.level === 'pvc' ? 'ปวช.' : 'ปวส.'} {choiceOf(a, programs)?.name}</td>
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


import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { computeStats, schoolsByProgram, type Count } from '@shared/stats';
import { QuotaTable } from '../PublicDashboard';
import { THAI_MONTHS, parseIsoDate } from '@shared/thai';
import { useStaff } from '../../app/staff';
import { Button, Panel } from '../../components/ui';
import { api, apiMode, errorMessage } from '../../lib/api';

export function DashboardPage() {
  const { applicants, programs, settings, token, reload } = useStaff();
  const year = settings?.academicYear ?? 0;
  const stats = useMemo(() => computeStats(applicants, programs, year, new Date().toISOString()), [applicants, programs, year]);
  const schools = useMemo(() => schoolsByProgram(applicants, programs, year), [applicants, programs, year]);
  const [seeding, setSeeding] = useState(false);
  const [seedError, setSeedError] = useState('');

  const seed = async () => {
    setSeeding(true);
    try {
      await api.seedDemo(token);
      await reload();
    } catch (cause) {
      setSeedError(errorMessage(cause));
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-brand-deep">ภาพรวมการรับสมัคร ปีการศึกษา {year}</h1>
          <p className="text-sm text-ink-muted">อัปเดตเองทุก 10 วินาทีเมื่อมีผู้สมัครใหม่ · การรับสมัคร{settings?.applicationsOpen ? 'เปิดอยู่' : 'ปิดอยู่'}</p>
        </div>
        <Link to="/staff/applicants?status=submitted" className="inline-flex min-h-11 items-center rounded-control bg-brand px-4 font-medium text-ink-inverse hover:bg-brand-hover">
          ตรวจใบสมัครที่รออยู่ ({stats.waitingReview})
        </Link>
      </div>

      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ['ผู้สมัครทั้งหมด', stats.total],
          ['สมัครวันนี้', stats.today],
          ['รอตรวจสอบ', stats.waitingReview],
          ['มอบตัวแล้ว', stats.enrolled],
        ].map(([label, value]) => (
          <div key={label} className="rounded-card bg-surface px-4 py-3 shadow-card ring-1 ring-line">
            <dt className="text-sm text-ink-muted">{label}</dt>
            <dd className="text-3xl font-semibold text-brand-deep" data-numeric>{Number(value).toLocaleString('th-TH')}</dd>
          </div>
        ))}
      </dl>

      {stats.total === 0 ? (
        <Panel className="py-12 text-center">
          <p className="text-lg font-medium">ยังไม่มีผู้สมัครในปีการศึกษา {year}</p>
          <p className="mt-1 text-ink-muted">เมื่อมีคนส่งใบสมัคร ตัวเลขและกราฟจะขึ้นที่หน้านี้เอง</p>
          {apiMode === 'demo' && (
            <Button className="mt-5" variant="secondary" loading={seeding} onClick={seed} icon={<Sparkles className="size-4" aria-hidden="true" />}>เติมผู้สมัครตัวอย่าง 36 คน</Button>
          )}
          {seedError && <p className="mt-2 text-danger">{seedError}</p>}
        </Panel>
      ) : (
        <>
          <Panel title="ผู้สมัครรายวัน (30 วันล่าสุด)"><DailyChart daily={stats.daily} /></Panel>
          <div className="grid gap-6 lg:grid-cols-2">
            <Panel title="ตามสาขาวิชา (อันดับ 1)"><Bars data={stats.byProgram} /></Panel>
            <div className="space-y-6">
              <Panel title="ตามสถานะ"><Bars data={stats.byStatus} /></Panel>
              <Panel title="ตามระดับที่สมัคร"><Bars data={stats.byLevel} /></Panel>
            </div>
            <Panel title="ตามประเภทวิชา"><Bars data={stats.byDepartment} /></Panel>
            <Panel title="โรงเรียนเดิม (10 อันดับแรก)"><Bars data={stats.bySchool} /></Panel>
            <Panel title="จังหวัด (10 อันดับแรก)"><Bars data={stats.byProvince} /></Panel>
            <Panel title="ช่องทางที่รู้จักวิทยาลัย"><Bars data={stats.byChannel} /></Panel>
          </div>
          <Panel title="ผู้สมัครเทียบจำนวนรับ"><QuotaTable programs={stats.quota} /></Panel>
          <SchoolsByProgram groups={schools} />
        </>
      )}
    </div>
  );
}

function Bars({ data }: { data: Count[] }) {
  const max = Math.max(1, ...data.map((item) => item.value));
  if (data.length === 0) return <p className="text-ink-muted">ยังไม่มีข้อมูล</p>;
  return (
    <ul className="space-y-2.5">
      {data.map((item) => (
        <li key={item.label} className="grid grid-cols-[minmax(0,11rem)_1fr_2.5rem] items-center gap-3 text-[15px]">
          <span className="truncate" title={item.label}>{item.label}</span>
          <span className="h-3 overflow-hidden rounded-full bg-sunken" aria-hidden="true">
            <span className="block h-full origin-left rounded-full bg-brand transition-[width] duration-500" style={{ width: `${(item.value / max) * 100}%` }} />
          </span>
          <span className="text-right font-medium" data-numeric>{item.value}</span>
        </li>
      ))}
    </ul>
  );
}

function DailyChart({ daily }: { daily: { date: string; value: number }[] }) {
  const max = Math.max(1, ...daily.map((d) => d.value));
  const label = (key: string) => {
    const p = parseIsoDate(key)!;
    return `${p.day} ${THAI_MONTHS[p.month - 1]!.slice(0, 3)}.`;
  };
  return (
    <div>
      <div className="flex h-40 items-end gap-[3px]" role="img" aria-label={`ผู้สมัครรายวัน สูงสุด ${max} คนต่อวัน`}>
        {daily.map((day) => (
          <div key={day.date} className="group relative flex h-full flex-1 items-end">
            <div className="w-full rounded-t-[3px] bg-brand/85 transition-colors group-hover:bg-gold" style={{ height: `${day.value ? Math.max(4, (day.value / max) * 100) : 1.5}%` }} />
            <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 -translate-x-1/2 whitespace-nowrap rounded-control bg-ink px-2 py-0.5 text-xs text-ink-inverse opacity-0 group-hover:opacity-100">
              {label(day.date)}: {day.value} คน
            </span>
          </div>
        ))}
      </div>
      <div className="mt-1 flex justify-between text-xs text-ink-muted">
        <span>{label(daily[0]!.date)}</span><span>วันนี้</span>
      </div>
    </div>
  );
}

/** โรงเรียนเดิมของผู้สมัครแต่ละสาขา — เลือกสาขาแล้วดูว่ามาจากโรงเรียนไหนบ้าง (ใช้วางแผนออกแนะแนว) */
function SchoolsByProgram({ groups }: { groups: ReturnType<typeof schoolsByProgram> }) {
  const [key, setKey] = useState('');
  const current = groups.find((g) => g.key === key) ?? groups[0];
  if (!current) return null;
  return (
    <Panel
      title="โรงเรียนเดิมแยกตามสาขา"
      action={
        <select aria-label="สาขา" value={current.key} onChange={(e) => setKey(e.target.value)} className="min-h-11 rounded-control border border-line-strong bg-surface px-3 text-[15px]">
          {groups.map((g) => <option key={g.key} value={g.key}>{g.label} ({g.total})</option>)}
        </select>
      }
    >
      <table className="w-full text-left text-[15px]">
        <thead className="border-b border-line text-sm text-ink-muted">
          <tr><th className="w-12 py-2 font-medium">#</th><th className="py-2 font-medium">โรงเรียนเดิม</th><th className="w-24 py-2 text-right font-medium">จำนวน</th></tr>
        </thead>
        <tbody className="divide-y divide-line">
          {current.schools.map((school, index) => (
            <tr key={school.label}><td className="py-2 text-ink-muted" data-numeric>{index + 1}</td><td className="py-2">{school.label}</td><td className="py-2 text-right font-medium" data-numeric>{school.value} คน</td></tr>
          ))}
        </tbody>
      </table>
    </Panel>
  );
}

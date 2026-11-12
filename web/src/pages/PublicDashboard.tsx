import { useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Crown, GraduationCap, Users, Wrench } from 'lucide-react';
import type { ProgramCount, YearSummary } from '@shared/stats';
import { cn } from '../components/ui';
import { useHome } from '../lib/publicData';
import { CountUp, useAnimatedNumber } from '../lib/useAnimatedNumber';

const COLOR = { brand: 'var(--color-brand)', gold: 'var(--color-gold)', deep: 'var(--color-brand-deep)' };
/** สีแท่งอันดับ 1–5: ทอง แดง แดงเข้ม แล้วอ่อนลงสำหรับอันดับรอง */
const RANK_COLOR = [COLOR.gold, COLOR.brand, COLOR.deep, 'color-mix(in oklab, var(--color-brand) 55%, white)', 'color-mix(in oklab, var(--color-brand-deep) 50%, white)'];
type Filter = 'all' | 'pvc' | 'pvs';
const TRACK_SHORT = { pvc: 'ปวช.', pvs: 'ปวส.' } as const;

/**
 * ยอดผู้สมัครบนหน้าแรก — แสดงแค่ตัวเลขรวม ไม่มีข้อมูลรายคน
 * ข้อมูลมาจากชุดข้อมูลหน้าแรก (lib/publicData) ซึ่งแสดงชุดที่เก็บในเครื่องก่อนแล้วอัปเดตเอง
 */
export function PublicDashboard() {
  const { home, error } = useHome();
  const stats = home?.stats ?? null;
  const [year, setYear] = useState<number | null>(null);
  const [filter, setFilter] = useState<Filter>('all');

  const summary = useMemo(() => stats?.years.find((item) => item.year === year) ?? stats?.years[0] ?? null, [stats, year]);
  if (error && !stats) return null;
  if (!stats || !summary) return <DashboardSkeleton />;

  return (
    <section aria-labelledby="stats-heading" className="mx-auto max-w-6xl px-4 pt-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="stats-heading" className="text-2xl text-brand-deep">ยอดผู้สมัคร ปีการศึกษา {summary.year}</h2>
          <p className="text-ink-muted">นับจากสาขาที่ผู้สมัครเลือกเป็นอันดับ 1 · ตัวเลขอัปเดตเองเมื่อมีผู้สมัครใหม่</p>
        </div>
        {stats.years.length > 1 && (
          <div role="tablist" aria-label="ปีการศึกษา" className="inline-flex rounded-full bg-sunken p-1 ring-1 ring-line">
            {stats.years.map((item) => (
              <button key={item.year} type="button" role="tab" aria-selected={item.year === summary.year} onClick={() => setYear(item.year)}
                className={cn('min-h-10 rounded-full px-4 text-[15px] font-medium transition-[background-color,color,box-shadow] duration-200',
                  item.year === summary.year ? 'bg-brand text-ink-inverse shadow-[0_2px_0_var(--color-brand-active)]' : 'text-ink-muted hover:text-ink')}>
                {item.year}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* key = ปี: เปลี่ยนปีแล้วตัวเลขและกราฟเล่นใหม่จาก 0 */}
      <div key={summary.year} className="mt-6 space-y-5">
        <div className="enter-stagger grid gap-3 sm:grid-cols-3">
          <SummaryCard icon={<Users className="size-6" />} label="ผู้สมัครทั้งหมด" value={summary.total} unit="คน" tone="brand" />
          <SummaryCard icon={<Wrench className="size-6" />} label="ระดับ ปวช." value={summary.pvc} unit="คน" tone="gold" />
          <SummaryCard icon={<GraduationCap className="size-6" />} label="ระดับ ปวส." value={summary.pvs} unit="คน" tone="deep" />
        </div>

        {summary.total === 0 ? (
          <div className="rounded-card bg-surface px-6 py-10 text-center shadow-card ring-1 ring-line">
            <p className="text-lg font-medium">ยังไม่มีผู้สมัครในปีการศึกษา {summary.year}</p>
            <p className="mt-1 text-ink-muted">สมัครวันนี้ แล้วสาขาที่คุณเลือกจะขึ้นอันดับในกราฟนี้</p>
            <Link to="/apply" className="mt-4 inline-flex min-h-11 items-center rounded-control bg-brand px-5 font-medium text-ink-inverse hover:bg-brand-hover">เริ่มกรอกใบสมัคร</Link>
          </div>
        ) : (
          <>
            <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
              <Card title="สาขายอดนิยม" subtitle="5 อันดับที่มีผู้เลือกมากที่สุด"><Podium programs={summary.programs} /></Card>
              <Card title="สัดส่วนระดับที่สมัคร" subtitle="ชี้ที่วงเพื่อดูตัวเลข"><LevelDonut summary={summary} /></Card>
            </div>
            <Card
              title="จำนวนผู้สมัครแยกประเภทวิชา"
              subtitle="เรียงจากมากไปน้อย"
              action={
                <div role="tablist" aria-label="ระดับ" className="inline-flex rounded-full bg-sunken p-1 ring-1 ring-line">
                  {(['all', 'pvc', 'pvs'] as const).map((key) => (
                    <button key={key} type="button" role="tab" aria-selected={filter === key} onClick={() => setFilter(key)}
                      className={cn('min-h-9 rounded-full px-3.5 text-sm font-medium transition-colors', filter === key ? 'bg-surface text-brand shadow-card' : 'text-ink-muted hover:text-ink')}>
                      {key === 'all' ? 'ทั้งหมด' : TRACK_SHORT[key]}
                    </button>
                  ))}
                </div>
              }
            >
              <Ranking key={filter} programs={summary.programs.filter((p) => filter === 'all' || p.track === filter)} />
            </Card>
          </>
        )}
        <Card title="จำนวนรับ และที่นั่งคงเหลือ" subtitle="นับผู้สมัครที่เลือกสาขาเป็นอันดับ 1 · อัปเดตเองทุก 15 วินาที">
          <QuotaTable programs={summary.programs} />
        </Card>
      </div>
    </section>
  );
}

function Card({ title, subtitle, action, children }: { title: string; subtitle: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="enter rounded-card bg-surface p-5 shadow-card ring-1 ring-line sm:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg text-brand-deep">{title}</h3>
          <p className="text-sm text-ink-muted">{subtitle}</p>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function SummaryCard({ icon, label, value, unit, tone }: { icon: ReactNode; label: string; value: number; unit: string; tone: keyof typeof COLOR }) {
  const tile = {
    brand: 'from-[hsl(352_70%_44%)] to-brand-active text-ink-inverse shadow-brand/30',
    gold: 'from-[hsl(46_96%_60%)] to-[hsl(36_88%_46%)] text-brand-deep shadow-gold/40',
    deep: 'from-[hsl(350_45%_30%)] to-brand-deep text-gold shadow-brand-deep/30',
  }[tone];
  const card = { brand: 'from-brand-soft', gold: 'from-gold-soft', deep: 'from-sunken' }[tone];
  return (
    <div className={cn('group lift flex items-center gap-4 rounded-card bg-gradient-to-br to-surface p-4 shadow-card ring-1 ring-line', card)}>
      <span aria-hidden="true" className={cn('grid size-13 shrink-0 place-items-center rounded-2xl bg-gradient-to-br shadow-lg transition-transform duration-200 ease-out group-hover:-rotate-6 group-hover:scale-110', tile)}>
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-medium text-ink-muted">{label}</span>
        <span className="flex items-baseline gap-1.5">
          <strong data-numeric className="text-3xl font-semibold text-ink"><CountUp value={value} /></strong>
          <span className="text-ink-muted">{unit}</span>
        </span>
      </span>
    </div>
  );
}

/** แท่น 5 อันดับ วางแบบโพเดียม (4 · 2 · 1 · 3 · 5) อันดับ 1 อยู่กลาง แท่งเป็น 3 มิติแบบหน้าแดชบอร์ดระบบจองห้อง */
function Podium({ programs }: { programs: ProgramCount[] }) {
  const top = programs.filter((p) => p.value > 0).slice(0, 5);
  const max = top[0]?.value ?? 1;
  const order = [top[3], top[1], top[0], top[2], top[4]].filter((p): p is ProgramCount => Boolean(p));
  return (
    <div className="group/bars flex h-72 items-end justify-center gap-1.5 sm:gap-5">
      {order.map((program) => {
        const rank = top.indexOf(program) + 1;
        return (
          <Bar3D key={`${program.track}${program.code}`} rank={rank} label={program.name} track={TRACK_SHORT[program.track]} value={program.value}
            percent={Math.max(18, (program.value / max) * 100)} color={RANK_COLOR[rank - 1]!} delay={(5 - rank) * 60} />
        );
      })}
    </div>
  );
}

const DEPTH = 12;

function Bar3D({ rank, label, track, value, percent, color, delay }: { rank: number; label: string; track: string; value: number; percent: number; color: string; delay: number }) {
  const grow = useAnimatedNumber(1, { duration: 900, delay });
  return (
    <div className="group/bar flex h-full min-w-0 max-w-28 flex-1 flex-col items-center justify-end gap-2 transition-opacity duration-200 group-hover/bars:opacity-55 hover:opacity-100!"
      title={`อันดับ ${rank} ${track} ${label}: ${value} คน`}>
      {rank === 1 && <Crown className="size-6 text-gold-ink transition-transform duration-200 group-hover/bar:-translate-y-2 group-hover/bar:rotate-12" aria-hidden="true" />}
      <span data-numeric className="whitespace-nowrap text-base font-semibold text-ink transition-transform sm:text-lg duration-200 ease-out group-hover/bar:-translate-y-2 group-hover/bar:scale-125">
        <CountUp value={value} delay={delay} /> <span className="text-sm font-normal text-ink-muted">คน</span>
      </span>
      {/* shrink-0 + สัดส่วน 0.58: เหลือที่ให้มงกุฎ ตัวเลข และชื่อสาขา แท่งเท่ากันจึงสูงเท่ากันจริง ไม่โดนมงกุฎเบียด */}
      <div className="relative w-full max-w-20 shrink-0 transition-transform duration-200 ease-out group-hover/bar:-translate-y-2" style={{ height: `${percent * 0.58}%`, marginRight: DEPTH }}>
        <span aria-hidden="true" className="absolute -bottom-2 left-1 right-[-8px] h-2.5 rounded-full bg-ink/15 blur-[3px] transition-opacity duration-200 group-hover/bar:opacity-50" />
        <div className="absolute inset-0 origin-bottom" style={{ transform: `scaleY(${grow})` }}>
          <div className="absolute inset-0" style={{ background: `linear-gradient(90deg, ${color}, color-mix(in oklab, ${color} 78%, black))` }} />
          <div className="absolute bottom-full left-0 w-full origin-bottom-left" style={{ height: DEPTH, transform: 'skewX(-45deg)', background: `color-mix(in oklab, ${color} 62%, white)` }} />
          <div className="absolute left-full top-0 h-full origin-top-left" style={{ width: DEPTH, transform: 'skewY(-45deg)', background: `color-mix(in oklab, ${color} 55%, black)` }} />
          <div className="absolute inset-y-0 left-0 w-1.5 bg-white/25" />
          <span className={cn('absolute inset-x-0 top-2 text-center text-xl font-bold sm:text-2xl', rank === 1 ? 'text-brand-deep' : 'text-ink-inverse')} aria-hidden="true">{rank}</span>
        </div>
      </div>
      <span className="line-clamp-2 h-10 w-full shrink-0 text-center text-xs leading-5 text-ink-muted sm:text-sm transition-colors group-hover/bar:font-semibold group-hover/bar:text-ink">
        <span className="text-xs">{track}</span> {label}
      </span>
    </div>
  );
}

const DONUT_DEPTH = 9;
const DONUT_STEP = 0.5;
const DONUT_TILT = 0.62;

/** โดนัท 3 มิติ ปวช./ปวส.: บีบให้เอียงแล้วซ้อนชั้นสีเข้มเป็นความหนา ชี้ได้ทีละชิ้น */
function LevelDonut({ summary }: { summary: YearSummary }) {
  const [active, setActive] = useState<'pvc' | 'pvs' | null>(null);
  const sweep = useAnimatedNumber(1, { duration: 1100 });
  const items = [
    { key: 'pvc' as const, label: 'ปวช.', value: summary.pvc, color: COLOR.brand },
    { key: 'pvs' as const, label: 'ปวส.', value: summary.pvs, color: COLOR.gold },
  ];
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const ring = (layer: 'top' | 'side') => {
    let cursor = 0;
    return items.map((item) => {
      if (item.value === 0) return null;
      const length = (item.value / summary.total) * circumference * sweep;
      const offset = cursor * sweep;
      cursor += (item.value / summary.total) * circumference;
      const on = active === item.key;
      return (
        <circle key={item.key} cx="50" cy="50" r={radius} fill="none" strokeWidth="15"
          stroke={layer === 'side' ? `color-mix(in oklab, ${item.color} 60%, black)` : item.color}
          strokeDasharray={`${length} ${circumference}`} strokeDashoffset={-offset}
          onMouseEnter={layer === 'top' ? () => setActive(item.key) : undefined} onMouseLeave={layer === 'top' ? () => setActive(null) : undefined}
          className={layer === 'top' ? 'cursor-pointer transition-[transform,opacity] duration-200 ease-out' : 'transition-opacity duration-200'}
          style={{ transformOrigin: '50px 50px', transform: layer === 'top' && on ? 'scale(1.08)' : 'scale(1)', opacity: active !== null && !on ? 0.4 : 1 }} />
      );
    });
  };
  const layer = (drop: number) => ({ transform: `translateY(${drop - DONUT_DEPTH / 2}px) scaleY(${DONUT_TILT})` });
  const shown = items.find((item) => item.key === active);

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row lg:flex-col xl:flex-row">
      <div className="relative aspect-square w-52 shrink-0">
        <div className="absolute inset-0" aria-hidden="true">
          <span className="absolute inset-x-[8%] bottom-[14%] h-[18%] rounded-[50%] bg-ink/15 blur-md" />
          <div className="absolute inset-0" style={{ filter: 'blur(0.6px)' }}>
            {Array.from({ length: DONUT_DEPTH / DONUT_STEP }, (_, i) => DONUT_DEPTH - i * DONUT_STEP).map((drop) => (
              <svg key={drop} viewBox="0 0 100 100" className="pointer-events-none absolute inset-0 size-full" style={layer(drop)}>
                <g transform="rotate(-90 50 50)">{ring('side')}</g>
              </svg>
            ))}
          </div>
          <svg viewBox="0 0 100 100" className="absolute inset-0 size-full" style={layer(0)}>
            <g transform="rotate(-90 50 50)">{ring('top')}</g>
            <circle cx="50" cy="50" r={radius} fill="none" stroke="url(#level-gloss)" strokeWidth="15" pointerEvents="none" />
            <defs><linearGradient id="level-gloss" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="white" stopOpacity="0.35" /><stop offset="0.5" stopColor="white" stopOpacity="0" /></linearGradient></defs>
          </svg>
        </div>
        <p className="pointer-events-none absolute inset-0 grid place-content-center text-center" aria-live="polite">
          <span data-numeric className="text-3xl font-semibold text-ink">{shown ? shown.value.toLocaleString('th-TH') : <CountUp value={summary.total} />}</span>
          <span className="text-sm text-ink-muted">{shown ? `คน (${shown.label})` : 'คนทั้งหมด'}</span>
        </p>
      </div>
      <ul className="w-full space-y-2">
        {items.map((item) => (
          <li key={item.key}>
            <button type="button" onMouseEnter={() => setActive(item.key)} onMouseLeave={() => setActive(null)} onFocus={() => setActive(item.key)} onBlur={() => setActive(null)}
              className={cn('flex min-h-11 w-full items-center gap-3 rounded-control px-3 text-left transition-colors', active === item.key ? 'bg-sunken' : 'hover:bg-sunken')}>
              <span className="size-3.5 shrink-0 rounded-[4px]" style={{ background: item.color }} aria-hidden="true" />
              <span className="flex-1 font-medium">{item.label}</span>
              <span data-numeric className="text-ink-muted">
                <strong className="text-ink">{item.value.toLocaleString('th-TH')}</strong> คน · {Math.round((item.value / summary.total) * 100)}%
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** อันดับทุกประเภทวิชา: แถบนูนยืดจาก 0 ไล่ทีละแถว ชี้แถวไหนแถวอื่นจางลง */
function Ranking({ programs }: { programs: ProgramCount[] }) {
  const max = Math.max(1, ...programs.map((p) => p.value));
  if (programs.length === 0) return <p className="py-6 text-center text-ink-muted">ยังไม่มีสาขาในระดับนี้</p>;
  return (
    <ol className="group/rank grid grid-cols-[minmax(0,1fr)] gap-x-10 gap-y-3.5 md:grid-cols-2">
      {programs.map((program, index) => {
        const first = index === 0 && program.value > 0;
        return (
          <li key={`${program.track}${program.code}`} className="flex items-center gap-3 transition-opacity duration-200 group-hover/rank:opacity-55 hover:opacity-100!">
            <span aria-hidden="true" className={cn('grid size-8 shrink-0 place-items-center rounded-full text-sm font-semibold tabular-nums',
              first ? 'bg-gold text-brand-deep shadow-[0_2px_0_hsl(36_80%_36%)]' : 'bg-brand-soft text-brand')}>
              {index + 1}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-3">
                <span className="flex min-w-0 items-center gap-1.5 font-medium">
                  {first && <Crown className="size-4 shrink-0 text-gold-ink" aria-hidden="true" />}
                  <span className="shrink-0 text-xs text-ink-muted">{TRACK_SHORT[program.track]}</span>
                  <span className="truncate">{program.name}</span>
                </span>
                <span className="shrink-0 text-ink-muted"><strong data-numeric className="text-ink"><CountUp value={program.value} delay={index * 50} /></strong> คน</span>
              </div>
              <div className="mt-1.5 h-3 overflow-hidden rounded-full bg-sunken shadow-[inset_0_2px_3px_hsl(350_30%_15%/0.12)] ring-1 ring-inset ring-line">
                <div className="grow-x h-full origin-left rounded-full shadow-[inset_0_1px_0_hsl(0_0%_100%/0.45),inset_0_-2px_0_hsl(350_60%_15%/0.35)]"
                  style={{
                    transform: `scaleX(${program.value / max})`,
                    animationDelay: `${index * 50}ms`,
                    background: first ? 'linear-gradient(90deg, var(--color-gold), hsl(36 88% 46%))' : 'linear-gradient(90deg, hsl(352 70% 44%), var(--color-brand-active))',
                  }} />
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/** ตารางจำนวนรับ/สมัครแล้ว/คงเหลือ แยกตามประเภทวิชา — ใกล้เต็มและเต็มแล้วมีป้ายบอก ไม่ใช้สีอย่างเดียว */
export function QuotaTable({ programs }: { programs: ProgramCount[] }) {
  const departments = [...new Set(programs.map((p) => p.department || 'อื่น ๆ'))].sort((a, b) => a.localeCompare(b, 'th'));
  if (programs.length === 0) return <p className="py-6 text-center text-ink-muted">ยังไม่มีสาขาที่เปิดรับ</p>;
  const rows = (department: string) => programs.filter((p) => (p.department || 'อื่น ๆ') === department)
    .sort((a, b) => a.track.localeCompare(b.track) || a.code.localeCompare(b.code))
    .map((p) => {
      const left = p.quota > 0 ? Math.max(0, p.quota - p.value) : null;
      const ratio = p.quota > 0 ? Math.min(1, p.value / p.quota) : 0;
      const state = p.quota === 0 ? 'open' : p.value >= p.quota ? 'full' : ratio >= 0.8 ? 'near' : 'open';
      return { p, left, ratio, state };
    });
  const remaining = (left: number | null, state: string) => left === null ? '–' : state === 'full'
    ? <span className="rounded-full bg-danger-soft px-2 py-0.5 text-sm font-medium text-danger">เต็มแล้ว</span>
    : <span className={state === 'near' ? 'font-semibold text-warn' : 'font-semibold text-ok'}>{left}{state === 'near' ? ' (ใกล้เต็ม)' : ''}</span>;
  return (
    <>
    {/* มือถือ: รายการซ้อนกัน ชื่อสาขาได้เต็มบรรทัด ตัวเลขอยู่บรรทัดถัดไป */}
    <div className="-mx-5 sm:hidden">
      {departments.map((department) => (
        <section key={department}>
          <h3 className="bg-sunken px-5 py-2 text-sm font-semibold text-brand-deep">ประเภทวิชา{department}</h3>
          <ul className="divide-y divide-line">
            {rows(department).map(({ p, left, ratio, state }) => (
              <li key={`${p.track}${p.code}`} className="px-5 py-3">
                <p className="text-[15px]"><span className="text-xs text-ink-muted">{TRACK_SHORT[p.track]}</span> {p.name}</p>
                <div className="mt-1 flex items-baseline justify-between gap-3 text-sm text-ink-muted" data-numeric>
                  <span>สมัครแล้ว <strong className="text-base text-ink"><CountUp value={p.value} /></strong>{p.quota > 0 ? ` / รับ ${p.quota}` : ' (ไม่จำกัด)'}</span>
                  <span>เหลือ {remaining(left, state)}</span>
                </div>
                {p.quota > 0 && <Meter ratio={ratio} state={state} className="mt-1.5 h-2" />}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
    <div className="hidden sm:block">
      <table className="w-full text-left text-[15px]">
        <thead className="border-b border-line text-sm text-ink-muted">
          <tr>
            <th className="px-5 py-2 font-medium sm:px-3">สาขาวิชา</th>
            <th className="w-20 px-3 py-2 text-right font-medium">รับ</th>
            <th className="w-24 px-3 py-2 text-right font-medium">สมัครแล้ว</th>
            <th className="w-28 px-3 py-2 text-right font-medium">คงเหลือ</th>
            <th className="w-40 px-3 py-2 font-medium"><span className="sr-only">สัดส่วน</span></th>
          </tr>
        </thead>
        {departments.map((department) => (
          <tbody key={department} className="divide-y divide-line">
            <tr><th colSpan={5} className="bg-sunken px-3 py-2 text-sm font-semibold text-brand-deep">ประเภทวิชา{department}</th></tr>
            {rows(department).map(({ p, left, ratio, state }) => {
                return (
                  <tr key={`${p.track}${p.code}`}>
                    <td className="px-3 py-2.5"><span className="text-xs text-ink-muted">{TRACK_SHORT[p.track]}</span> {p.name}</td>
                    <td className="px-3 py-2.5 text-right" data-numeric>{p.quota > 0 ? p.quota : 'ไม่จำกัด'}</td>
                    <td className="px-3 py-2.5 text-right font-medium" data-numeric><CountUp value={p.value} /></td>
                    <td className="px-3 py-2.5 text-right" data-numeric>{remaining(left, state)}</td>
                    <td className="px-3 py-2.5">
                      {p.quota > 0 && <Meter ratio={ratio} state={state} className="h-2.5" />}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        ))}
      </table>
    </div>
    </>
  );
}

function Meter({ ratio, state, className }: { ratio: number; state: string; className: string }) {
  return (
    <div className={cn('overflow-hidden rounded-full bg-sunken ring-1 ring-inset ring-line', className)} aria-hidden="true">
      <div className={cn('grow-x h-full origin-left rounded-full', state === 'full' ? 'bg-danger' : state === 'near' ? 'bg-gold' : 'bg-ok')} style={{ transform: `scaleX(${ratio})` }} />
    </div>
  );
}

/** โครงร่างระหว่างรอข้อมูลครั้งแรก — กันหน้ากระโดดตอนกราฟโผล่ */
function DashboardSkeleton() {
  return (
    <section aria-label="กำลังโหลดยอดผู้สมัคร" aria-busy="true" className="mx-auto max-w-6xl px-4 pt-12">
      <div className="h-8 w-72 animate-pulse rounded-control bg-sunken" />
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {[0, 1, 2].map((i) => <div key={i} className="h-21 animate-pulse rounded-card bg-surface ring-1 ring-line" />)}
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <div className="h-96 animate-pulse rounded-card bg-surface ring-1 ring-line" />
        <div className="h-96 animate-pulse rounded-card bg-surface ring-1 ring-line" />
      </div>
    </section>
  );
}

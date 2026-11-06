import { LEVELS, LEVEL_LABEL, STATUSES, STATUS_LABEL, firstChoice, programName, type Applicant, type Program } from './model';
import { bangkokDateKey, isoFromParts, parseIsoDate } from './thai';

export interface Count { label: string; value: number }

export interface Stats {
  total: number;
  today: number;
  waitingReview: number;
  enrolled: number;
  byStatus: Count[];
  byLevel: Count[];
  byProgram: Count[];
  bySchool: Count[];
  byProvince: Count[];
  byChannel: Count[];
  byDepartment: Count[];
  /** จำนวนรับเทียบผู้สมัครรายสาขา (นับสาขาอันดับ 1) */
  quota: ProgramCount[];
  /** จำนวนผู้สมัครรายวัน 30 วันล่าสุด (เก่าไปใหม่) */
  daily: { date: string; value: number }[];
}

function tally(items: readonly string[], limit = Infinity): Count[] {
  const map = new Map<string, number>();
  for (const item of items) if (item) map.set(item, (map.get(item) ?? 0) + 1);
  return [...map.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label, 'th'))
    .slice(0, limit);
}

/** สรุปตัวเลขสำหรับแดชบอร์ด — นับเฉพาะปีการศึกษาที่ส่งเข้ามา */
export function computeStats(all: readonly Applicant[], programs: readonly Program[], academicYear: number, nowIso: string): Stats {
  const list = all.filter((item) => item.academicYear === academicYear);
  const todayKey = bangkokDateKey(nowIso);
  const dailyMap = new Map<string, number>();
  for (const item of list) {
    const key = bangkokDateKey(item.createdAt);
    dailyMap.set(key, (dailyMap.get(key) ?? 0) + 1);
  }
  const today = parseIsoDate(todayKey)!;
  const daily = Array.from({ length: 30 }, (_, index) => {
    const date = new Date(Date.UTC(today.year, today.month - 1, today.day - (29 - index)));
    const key = isoFromParts({ year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate() });
    return { date: key, value: dailyMap.get(key) ?? 0 };
  });

  return {
    total: list.length,
    today: dailyMap.get(todayKey) ?? 0,
    waitingReview: list.filter((item) => item.status === 'submitted').length,
    enrolled: list.filter((item) => item.status === 'enrolled').length,
    byStatus: STATUSES.map((status) => ({ label: STATUS_LABEL[status], value: list.filter((item) => item.status === status).length })),
    byLevel: LEVELS.map((level) => ({ label: LEVEL_LABEL[level], value: list.filter((item) => item.level === level).length })),
    byProgram: tally(list.map((item) => {
      const name = programName(programs, firstChoice(item));
      return name ? `${item.level === 'pvc' ? 'ปวช.' : 'ปวส.'} ${name}` : '';
    })),
    bySchool: tally(list.map((item) => item.schoolName), 10),
    byProvince: tally(list.map((item) => item.province), 10),
    byChannel: tally(list.map((item) => item.channel)),
    byDepartment: tally(list.map((item) => {
      const track = item.level === 'pvc' ? 'pvc' : 'pvs';
      return programs.find((p) => p.track === track && p.code === firstChoice(item))?.department ?? '';
    }).filter(Boolean).map((name) => `ประเภทวิชา${name}`)),
    quota: computePublicStats(all, programs, academicYear, nowIso).years.find((y) => y.year === academicYear)?.programs ?? [],
    daily,
  };
}

/* ---------- ยอดสรุปสำหรับหน้าแรก (สาธารณะ) ---------- */

export interface ProgramCount { track: 'pvc' | 'pvs'; code: string; name: string; department: string; quota: number; value: number }
export interface YearSummary { year: number; total: number; pvc: number; pvs: number; programs: ProgramCount[] }
export interface PublicStats { years: YearSummary[]; updatedAt: string }

/**
 * ตัวเลขที่เปิดให้ทุกคนเห็นบนหน้าแรก — มีแต่ยอดรวม ไม่มีชื่อ โรงเรียน หรือข้อมูลรายคน
 * นับตามสาขาที่เลือกเป็นอันดับ 1 (ความสนใจหลักของผู้สมัคร) และแสดงทุกสาขาที่เปิดรับแม้ยังไม่มีคนเลือก
 * ปีที่ไม่มีผู้สมัครเลยไม่ส่งออก ยกเว้นปีปัจจุบันที่ต้องมีเสมอ
 */
export function computePublicStats(all: readonly Applicant[], programs: readonly Program[], currentYear: number, nowIso: string): PublicStats {
  const years = [...new Set([currentYear, ...all.map((item) => item.academicYear)])].filter(Boolean).sort((a, b) => b - a);
  return {
    updatedAt: nowIso,
    years: years.map((year) => {
      const list = all.filter((item) => item.academicYear === year);
      const counts = new Map<string, ProgramCount>();
      for (const program of programs) {
        if (program.active) counts.set(`${program.track}:${program.code}`, { track: program.track, code: program.code, name: program.name, department: program.department, quota: program.quota, value: 0 });
      }
      for (const item of list) {
        const track = item.level === 'pvc' ? 'pvc' : 'pvs';
        const code = firstChoice(item);
        if (!code) continue;
        const key = `${track}:${code}`;
        const known = programs.find((p) => p.track === track && p.code === code);
        const entry = counts.get(key) ?? { track, code, name: known?.name || `สาขารหัส ${code}`, department: known?.department ?? '', quota: known?.quota ?? 0, value: 0 };
        entry.value += 1;
        counts.set(key, entry);
      }
      const pvc = list.filter((item) => item.level === 'pvc').length;
      return {
        year,
        total: list.length,
        pvc,
        pvs: list.length - pvc,
        programs: [...counts.values()].sort((a, b) => b.value - a.value || a.track.localeCompare(b.track) || a.name.localeCompare(b.name, 'th')),
      };
    }),
  };
}

/** โรงเรียนเดิมของผู้สมัครแต่ละสาขา (นับสาขาอันดับ 1) เรียงจากมากไปน้อย */
export function schoolsByProgram(all: readonly Applicant[], programs: readonly Program[], academicYear: number): { key: string; label: string; total: number; schools: Count[] }[] {
  const groups = new Map<string, string[]>();
  for (const item of all) {
    if (item.academicYear !== academicYear) continue;
    const track = item.level === 'pvc' ? 'pvc' : 'pvs';
    const key = `${track}:${firstChoice(item)}`;
    groups.set(key, [...(groups.get(key) ?? []), item.schoolName]);
  }
  return [...groups.entries()]
    .map(([key, schools]) => {
      const [track, code] = key.split(':') as ['pvc' | 'pvs', string];
      const name = programs.find((p) => p.track === track && p.code === code)?.name ?? `รหัส ${code}`;
      return { key, label: `${track === 'pvc' ? 'ปวช.' : 'ปวส.'} ${name}`, total: schools.length, schools: tally(schools) };
    })
    .sort((a, b) => b.total - a.total || a.label.localeCompare(b.label, 'th'));
}

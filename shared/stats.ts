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
    daily,
  };
}

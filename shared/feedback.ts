import { toArabicDigits } from './thai';
import { fail } from './service';

/**
 * แบบประเมินความพึงพอใจการสมัครออนไลน์
 * ผูกกับใบสมัคร 1 ใบ = 1 ชุดคำตอบ (ตอบใหม่ = แก้ของเดิม) จึงนับเป็นจำนวนผู้ตอบได้ตรง ๆ
 * สรุปผลแบบรายงานสถานศึกษา: ค่าเฉลี่ย (x̄) ส่วนเบี่ยงเบนมาตรฐาน (S.D.) และแปลผล 5 ระดับ
 */

export const FEEDBACK_ITEMS = [
  { key: 'ease', label: 'ระบบใช้งานง่าย เข้าใจได้ทันที' },
  { key: 'speed', label: 'กรอกและส่งใบสมัครได้รวดเร็ว' },
  { key: 'overall', label: 'ความพึงพอใจโดยรวมต่อการสมัครออนไลน์' },
] as const;
export type FeedbackKey = (typeof FEEDBACK_ITEMS)[number]['key'];

export const SCORE_LABEL: Record<number, string> = { 5: 'มากที่สุด', 4: 'มาก', 3: 'ปานกลาง', 2: 'น้อย', 1: 'น้อยที่สุด' };

export interface Feedback {
  applicantId: string;
  appNo: string;
  academicYear: number;
  level: string;
  ease: number;
  speed: number;
  overall: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export const FEEDBACK_COLUMNS = ['applicantId', 'appNo', 'academicYear', 'level', 'ease', 'speed', 'overall', 'comment', 'createdAt', 'updatedAt'] as const;

const score = (value: unknown): number => {
  const n = Number(toArabicDigits(String(value ?? '')));
  return Number.isInteger(n) && n >= 1 && n <= 5 ? n : 0;
};

/** ตรวจคำตอบ — ทุกข้อต้องเลือก 1–5 ข้อเสนอแนะไม่บังคับ */
export function normalizeFeedback(raw: unknown): Pick<Feedback, FeedbackKey | 'comment'> {
  const source = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const answers = { ease: score(source.ease), speed: score(source.speed), overall: score(source.overall) };
  const missing = FEEDBACK_ITEMS.filter((item) => answers[item.key] === 0);
  if (missing.length) fail('VALIDATION', 'กรุณาให้คะแนนให้ครบทุกข้อ', missing.map((item) => ({ field: item.key, message: 'เลือกคะแนน 1–5' })));
  const comment = typeof source.comment === 'string'
    ? source.comment.replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, '').trim().slice(0, 500)
    : '';
  return { ...answers, comment };
}

export function upsertFeedback(
  list: readonly Feedback[],
  applicant: { id: string; appNo: string; academicYear: number; level: string },
  raw: unknown,
  nowIso: string,
): { list: Feedback[]; saved: Feedback } {
  const answers = normalizeFeedback(raw);
  const existing = list.find((item) => item.applicantId === applicant.id);
  const saved: Feedback = {
    applicantId: applicant.id, appNo: applicant.appNo, academicYear: applicant.academicYear, level: applicant.level,
    ...answers, createdAt: existing?.createdAt ?? nowIso, updatedAt: nowIso,
  };
  return { list: existing ? list.map((item) => (item === existing ? saved : item)) : [...list, saved], saved };
}

/** แปลค่าเฉลี่ยตามเกณฑ์ที่ใช้ในรายงานสถานศึกษาทั่วไป */
export function interpretMean(mean: number): string {
  if (mean >= 4.51) return 'มากที่สุด';
  if (mean >= 3.51) return 'มาก';
  if (mean >= 2.51) return 'ปานกลาง';
  if (mean >= 1.51) return 'น้อย';
  return mean > 0 ? 'น้อยที่สุด' : '-';
}

export interface FeedbackItemSummary { key: FeedbackKey; label: string; mean: number; sd: number; level: string; counts: number[] }
export interface FeedbackSummary {
  count: number;
  items: FeedbackItemSummary[];
  /** ค่าเฉลี่ยรวมทุกข้อ */
  mean: number;
  sd: number;
  level: string;
  comments: { appNo: string; overall: number; comment: string; at: string }[];
}

const round2 = (n: number) => Math.round(n * 100) / 100;

function meanSd(values: readonly number[]): { mean: number; sd: number } {
  if (values.length === 0) return { mean: 0, sd: 0 };
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  // S.D. แบบกลุ่มตัวอย่าง (n - 1) ตามที่รายงานวิจัยในสถานศึกษาใช้กัน
  const sd = values.length > 1 ? Math.sqrt(values.reduce((a, b) => a + (b - mean) ** 2, 0) / (values.length - 1)) : 0;
  return { mean: round2(mean), sd: round2(sd) };
}

export function summarizeFeedback(list: readonly Feedback[], academicYear: number | null): FeedbackSummary {
  const rows = academicYear === null ? [...list] : list.filter((item) => item.academicYear === academicYear);
  const items = FEEDBACK_ITEMS.map((item) => {
    const values = rows.map((row) => row[item.key]);
    const { mean, sd } = meanSd(values);
    // counts[0] = 5 คะแนน ... counts[4] = 1 คะแนน (เรียงแบบตารางรายงาน)
    const counts = [5, 4, 3, 2, 1].map((s) => values.filter((v) => v === s).length);
    return { key: item.key, label: item.label, mean, sd, level: interpretMean(mean), counts };
  });
  const all = meanSd(rows.flatMap((row) => FEEDBACK_ITEMS.map((item) => row[item.key])));
  const comments = rows
    .filter((row) => row.comment)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .map((row) => ({ appNo: row.appNo, overall: row.overall, comment: row.comment, at: row.updatedAt }));
  return { count: rows.length, items, mean: all.mean, sd: all.sd, level: interpretMean(all.mean), comments };
}

export function parseFeedback(header: readonly unknown[], rows: readonly (readonly unknown[])[]): Feedback[] {
  const col = (row: readonly unknown[], name: string) => {
    const index = header.indexOf(name);
    return index === -1 ? '' : String(row[index] ?? '');
  };
  return rows
    .map((row) => ({
      applicantId: col(row, 'applicantId'), appNo: col(row, 'appNo'), academicYear: Number(col(row, 'academicYear')) || 0,
      level: col(row, 'level'), ease: score(col(row, 'ease')), speed: score(col(row, 'speed')), overall: score(col(row, 'overall')),
      comment: col(row, 'comment'), createdAt: col(row, 'createdAt'), updatedAt: col(row, 'updatedAt'),
    }))
    .filter((item) => item.applicantId !== '' && item.overall > 0);
}

export const feedbackToRow = (item: Feedback): string[] =>
  FEEDBACK_COLUMNS.map((column) => String(item[column] ?? ''));

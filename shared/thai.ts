/** ตัวช่วยเรื่องวันที่และตัวเลขไทย ใช้ได้ทั้งในเบราว์เซอร์และ Apps Script (ไม่พึ่ง Intl) */

const THAI_DIGITS = '๐๑๒๓๔๕๖๗๘๙';

export const THAI_MONTHS = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
] as const;

export function toThaiDigits(value: string | number): string {
  return String(value).replace(/[0-9]/g, (digit) => THAI_DIGITS[Number(digit)]!);
}

export interface DateParts { year: number; month: number; day: number }

/** อ่านวันที่ YYYY-MM-DD (ค.ศ.) — คืน null ถ้ารูปแบบผิดหรือไม่มีวันนี้จริง เช่น 31 เม.ย. */
export function parseIsoDate(iso: string): DateParts | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const probe = new Date(Date.UTC(year, month - 1, day));
  if (probe.getUTCFullYear() !== year || probe.getUTCMonth() !== month - 1 || probe.getUTCDate() !== day) return null;
  return { year, month, day };
}

export function isoFromParts(parts: DateParts): string {
  return `${parts.year}-${String(parts.month).padStart(2, '0')}-${String(parts.day).padStart(2, '0')}`;
}

/** วันที่ตามเวลาไทย (UTC+7 ไม่มีเวลาออมแสง) จาก ISO timestamp */
export function bangkokDateParts(isoTimestamp: string): DateParts {
  const shifted = new Date(new Date(isoTimestamp).getTime() + 7 * 3_600_000);
  return { year: shifted.getUTCFullYear(), month: shifted.getUTCMonth() + 1, day: shifted.getUTCDate() };
}

export function bangkokDateKey(isoTimestamp: string): string {
  return isoFromParts(bangkokDateParts(isoTimestamp));
}

/** "5 มีนาคม 2570" */
export function thaiLongDate(parts: DateParts): string {
  return `${parts.day} ${THAI_MONTHS[parts.month - 1]} ${parts.year + 543}`;
}

/** อายุเต็มปี ณ วันที่ today */
export function ageOn(birth: DateParts, today: DateParts): number {
  let age = today.year - birth.year;
  if (today.month < birth.month || (today.month === birth.month && today.day < birth.day)) age -= 1;
  return age;
}

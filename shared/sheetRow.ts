/**
 * แปลงข้อมูลกับแถวใน Google Sheets
 *
 * ช่องหลักแยกคอลัมน์ให้เจ้าหน้าที่เปิดอ่านในชีตได้ตรง ๆ ส่วนเอกสารแนบกับข้อมูลมอบตัวเก็บเป็น JSON
 * ชีตต้องตั้งรูปแบบเป็นข้อความ (setupSystem ทำให้) ไม่งั้นเลขบัตร/เบอร์โทรถูกแปลงเป็นตัวเลขแล้ว 0 หาย
 */

import {
  DEFAULT_SETTINGS, INPUT_FIELDS, STATUSES,
  type Applicant, type Program, type Settings, type Status, type Track,
} from './model';
import { checkStudentIdPattern } from './numbering';

export const SHEET_APPLICANTS = 'Applicants';
export const SHEET_PROGRAMS = 'Programs';
export const SHEET_SETTINGS = 'Settings';
export const SHEET_STAFF = 'Staff';
export const SHEET_AUDIT = 'Audit';

export const APPLICANT_COLUMNS = [
  'id', 'appNo', 'academicYear', 'status', 'statusNote', 'studentId',
  ...INPUT_FIELDS,
  'documentsJson', 'enrollmentJson', 'createdAt', 'updatedAt', 'updatedBy',
] as const;

export const PROGRAM_COLUMNS = ['code', 'track', 'name', 'active'] as const;
export const SETTINGS_COLUMNS = ['key', 'value', 'description'] as const;
export const STAFF_COLUMNS = ['username', 'displayName', 'role', 'status', 'passwordSalt', 'passwordHash', 'tokenVersion', 'lastLoginAt'] as const;
export const AUDIT_COLUMNS = ['at', 'actor', 'action', 'target', 'detail'] as const;

export function applicantToRow(applicant: Applicant): string[] {
  const record = applicant as unknown as Record<string, unknown>;
  return APPLICANT_COLUMNS.map((column) => {
    if (column === 'documentsJson') return JSON.stringify(applicant.documents);
    if (column === 'enrollmentJson') return applicant.enrollment ? JSON.stringify(applicant.enrollment) : '';
    const value = record[column];
    return value === undefined || value === null ? '' : String(value);
  });
}

function parseJson<T>(text: string, fallback: T): T {
  if (!text) return fallback;
  try { return JSON.parse(text) as T; } catch { return fallback; }
}

/** header = แถวหัวตารางจริงของชีต (ลำดับคอลัมน์ในชีตถูกสลับได้ ระบบหาจากชื่อ) */
export function rowToApplicant(header: readonly unknown[], row: readonly unknown[]): Applicant {
  const get = (column: string) => {
    const index = header.indexOf(column);
    const value = index === -1 ? '' : row[index];
    return value === undefined || value === null ? '' : String(value);
  };
  const out: Record<string, unknown> = {};
  for (const column of APPLICANT_COLUMNS) out[column] = get(column);
  out.academicYear = Number(out.academicYear) || 0;
  if (!STATUSES.includes(out.status as Status)) out.status = 'submitted';
  out.documents = parseJson(get('documentsJson'), {});
  out.enrollment = parseJson(get('enrollmentJson'), null);
  delete out.documentsJson;
  delete out.enrollmentJson;
  return out as unknown as Applicant;
}

export function missingColumns(header: readonly unknown[], required: readonly string[]): string[] {
  return required.filter((column) => !header.includes(column));
}

const truthy = (value: unknown) => value === true || /^(true|1|yes|ใช่|เปิด)$/i.test(String(value).trim());

export function parsePrograms(rows: readonly (readonly unknown[])[]): Program[] {
  return rows
    .map((row) => ({
      code: String(row[0] ?? '').trim(),
      track: String(row[1] ?? '').trim().toLowerCase() as Track,
      name: String(row[2] ?? '').trim(),
      active: truthy(row[3]),
    }))
    .filter((program) => /^[0-9A-Za-z]{1,4}$/.test(program.code) && (program.track === 'pvc' || program.track === 'pvs') && program.name !== '');
}

/** อ่านค่าตั้งค่าจากชีต — ค่าที่ผิดรูปใช้ค่าเริ่มต้นแทน และรายงานปัญหากลับไปให้ log */
export function parseSettings(rows: readonly (readonly unknown[])[]): { settings: Settings; problems: string[] } {
  const map = new Map(rows.map((row) => [String(row[0] ?? '').trim(), row[1]]));
  const problems: string[] = [];
  const settings: Settings = { ...DEFAULT_SETTINGS };

  if (map.has('academicYear')) {
    const year = Number(map.get('academicYear'));
    if (Number.isInteger(year) && year >= 2560 && year <= 2700) settings.academicYear = year;
    else problems.push('academicYear ต้องเป็นปี พ.ศ. เช่น 2570');
  }
  if (map.has('applicationsOpen')) settings.applicationsOpen = truthy(map.get('applicationsOpen'));
  if (map.has('studentIdPattern')) {
    const pattern = String(map.get('studentIdPattern')).trim();
    const problem = checkStudentIdPattern(pattern);
    if (problem) problems.push(`studentIdPattern: ${problem}`);
    else settings.studentIdPattern = pattern;
  }
  return { settings, problems };
}

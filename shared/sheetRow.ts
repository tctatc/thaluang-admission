/**
 * แปลงข้อมูลกับแถวใน Google Sheets
 *
 * ช่องหลักแยกคอลัมน์ให้เจ้าหน้าที่เปิดอ่านในชีตได้ตรง ๆ ส่วนเอกสารแนบกับข้อมูลมอบตัวเก็บเป็น JSON
 * ชีตต้องตั้งรูปแบบเป็นข้อความ (setupSystem ทำให้) ไม่งั้นเลขบัตร/เบอร์โทรถูกแปลงเป็นตัวเลขแล้ว 0 หาย
 */

import {
  DEFAULT_SETTINGS, INPUT_FIELDS, SETTING_TEXT_FIELDS, STATUSES,
  type Announcement, type Applicant, type ManualKind, type Program, type Settings, type Status, type StoredManual, type Track,
} from './model';
import { checkStudentIdPattern } from './numbering';

export const SHEET_APPLICANTS = 'Applicants';
export const SHEET_PROGRAMS = 'Programs';
export const SHEET_SETTINGS = 'Settings';
export const SHEET_STAFF = 'Staff';
export const SHEET_AUDIT = 'Audit';
export const SHEET_ANNOUNCEMENTS = 'Announcements';
export const SHEET_FEEDBACK = 'Feedback';
export const SHEET_BACKUP_FOLDER = 'สำรองข้อมูลอัตโนมัติ';

export const APPLICANT_COLUMNS = [
  'id', 'appNo', 'academicYear', 'status', 'statusNote', 'studentId',
  ...INPUT_FIELDS,
  'documentsJson', 'enrollmentJson', 'createdAt', 'updatedAt', 'updatedBy',
] as const;

export const PROGRAM_COLUMNS = ['code', 'track', 'name', 'active', 'department', 'quota'] as const;
export const ANNOUNCEMENT_COLUMNS = ['id', 'title', 'body', 'pinned', 'published', 'createdAt', 'updatedAt', 'imageFileId', 'imageUrl', 'imageWidth', 'imageHeight'] as const;
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

/** อ่านชีต Programs ด้วยชื่อหัวคอลัมน์ (ชีตรุ่นแรกไม่มี department/quota ก็ยังอ่านได้) */
export function parsePrograms(header: readonly unknown[], rows: readonly (readonly unknown[])[]): Program[] {
  const col = (row: readonly unknown[], name: string) => {
    const index = header.indexOf(name);
    return index === -1 ? '' : String(row[index] ?? '').trim();
  };
  return rows
    .map((row) => {
      const name = col(row, 'name');
      const quota = Number(col(row, 'quota'));
      return {
        code: col(row, 'code'),
        track: col(row, 'track').toLowerCase() as Track,
        name,
        active: truthy(col(row, 'active')),
        department: col(row, 'department') || name,
        quota: Number.isInteger(quota) && quota > 0 ? quota : 0,
      };
    })
    .filter((program) => /^[0-9A-Za-z]{1,4}$/.test(program.code) && (program.track === 'pvc' || program.track === 'pvs') && program.name !== '');
}

export function programToRow(program: Program): string[] {
  return [program.code, program.track, program.name, program.active ? 'TRUE' : 'FALSE', program.department, String(program.quota)];
}

export function parseAnnouncements(header: readonly unknown[], rows: readonly (readonly unknown[])[]): Announcement[] {
  const col = (row: readonly unknown[], name: string) => {
    const index = header.indexOf(name);
    return index === -1 ? '' : String(row[index] ?? '');
  };
  return rows
    .map((row) => ({
      id: col(row, 'id'), title: col(row, 'title'), body: col(row, 'body'),
      pinned: truthy(col(row, 'pinned')), published: truthy(col(row, 'published')),
      createdAt: col(row, 'createdAt'), updatedAt: col(row, 'updatedAt'),
      // ชีตรุ่นก่อนยังไม่มีคอลัมน์รูป อ่านได้เป็นประกาศไม่มีโปสเตอร์
      imageFileId: col(row, 'imageFileId'), imageUrl: col(row, 'imageUrl'),
      imageWidth: Number(col(row, 'imageWidth')) || 0, imageHeight: Number(col(row, 'imageHeight')) || 0,
    }))
    .filter((item) => item.id !== '' && item.title !== '');
}

export function announcementToRow(item: Announcement): string[] {
  return [item.id, item.title, item.body, item.pinned ? 'TRUE' : 'FALSE', item.published ? 'TRUE' : 'FALSE', item.createdAt, item.updatedAt,
    item.imageFileId, item.imageUrl, item.imageWidth ? String(item.imageWidth) : '', item.imageHeight ? String(item.imageHeight) : ''];
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
  for (const field of SETTING_TEXT_FIELDS) {
    const value = String(map.get(field) ?? '').trim();
    if (value) settings[field] = value;
  }
  return { settings, problems };
}

/** คู่มือเก็บในชีต Settings คีย์ manual.applicant / manual.staff เป็น JSON */
export const manualSettingKey = (kind: ManualKind): string => `manual.${kind}`;

export function parseManual(raw: unknown): StoredManual | null {
  try {
    const value = JSON.parse(String(raw ?? '')) as Partial<StoredManual>;
    if (!value || typeof value.fileId !== 'string' || value.fileId === '') return null;
    const mime = value.mime === 'image/jpeg' || value.mime === 'image/png' ? value.mime : 'application/pdf';
    return { fileId: value.fileId, name: String(value.name ?? 'คู่มือ.pdf'), size: Number(value.size) || 0, updatedAt: String(value.updatedAt ?? ''), mime };
  } catch {
    return null;
  }
}

/**
 * กฎของงานผู้ดูแล: ประเภทวิชา/สาขา/จำนวนรับ ประกาศ และข้อความหน้าเว็บ
 * ทั้ง Apps Script และโหมดสาธิตเรียกชุดเดียวกัน (ผู้เรียกฝั่ง server ครอบด้วยล็อกเอง)
 */

import { DEFAULT_SETTINGS, SETTING_TEXT_FIELDS, firstChoice, type Announcement, type Applicant, type Program, type Settings, type Track } from './model';
import { checkStudentIdPattern } from './numbering';
import { fail } from './service';
import { toArabicDigits } from './thai';
import type { Issue } from './validate';

const text = (value: unknown, max: number): string =>
  typeof value === 'string' ? value.replace(/[\u0000-\u0009\u000b-\u001f\u007f]/g, '').trim().slice(0, max) : '';

/**
 * ตรวจรายการสาขาทั้งชุดที่ผู้ดูแลแก้มา แล้วคืนรายการที่จัดรูปแล้ว
 * ลบสาขาที่มีผู้สมัครเลือกแล้วไม่ได้ (ข้อมูลเก่าจะไม่มีชื่อสาขาให้แสดง) ให้ปิดรับแทน
 */
export function normalizePrograms(raw: unknown, applicants: readonly Applicant[]): Program[] {
  if (!Array.isArray(raw)) fail('BAD_REQUEST', 'รูปแบบรายการสาขาไม่ถูกต้อง');
  if (raw.length > 200) fail('BAD_REQUEST', 'จำนวนสาขามากเกินไป');
  const issues: Issue[] = [];
  const seen = new Set<string>();
  const programs = raw.map((item, index): Program => {
    const source = (item && typeof item === 'object' ? item : {}) as Record<string, unknown>;
    const track = (source.track === 'pvs' ? 'pvs' : 'pvc') as Track;
    const program: Program = {
      track,
      code: toArabicDigits(text(source.code, 4)),
      name: text(source.name, 80),
      department: text(source.department, 60).replace(/^(แผนกวิชา|ประเภทวิชา)\s*/, ''),
      quota: Number(toArabicDigits(String(source.quota ?? '0'))),
      active: source.active !== false,
    };
    const at = (field: string, message: string) => issues.push({ field: `${index}.${field}`, message });
    if (!/^[0-9]{2}$/.test(program.code)) at('code', 'รหัสสาขาต้องเป็นตัวเลข 2 หลัก เช่น 01');
    if (program.name === '') at('name', 'กรอกชื่อสาขาวิชา');
    if (program.department === '') at('department', 'กรอกประเภทวิชา');
    if (!Number.isInteger(program.quota) || program.quota < 0 || program.quota > 9999) at('quota', 'จำนวนรับต้องเป็นจำนวนเต็ม 0–9999 (0 = ไม่จำกัด)');
    const key = `${track}:${program.code}`;
    if (seen.has(key)) at('code', `รหัส ${program.code} ซ้ำในระดับ ${track === 'pvc' ? 'ปวช.' : 'ปวส.'}`);
    seen.add(key);
    return program;
  });

  const used = new Set(applicants.flatMap((a) => {
    const track = a.level === 'pvc' ? 'pvc' : 'pvs';
    return [a.programPvs, a.programPvc1, a.programPvc2].filter(Boolean).map((code) => `${track}:${code}`);
  }));
  for (const key of used) {
    if (!seen.has(key)) {
      const [track, code] = key.split(':');
      issues.push({ field: 'list', message: `ลบสาขารหัส ${code} (${track === 'pvc' ? 'ปวช.' : 'ปวส.'}) ไม่ได้ เพราะมีผู้สมัครเลือกไว้แล้ว ให้ปิดรับแทน` });
    }
  }
  if (issues.length) fail('VALIDATION', issues[0]!.message, issues);
  return programs.sort((a, b) => a.track.localeCompare(b.track) || a.code.localeCompare(b.code));
}

export function departmentsOf(programs: readonly Program[]): string[] {
  return [...new Set(programs.map((p) => p.department).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'th'));
}

/** จำนวนผู้สมัครที่เลือกสาขานี้เป็นอันดับ 1 ในปีที่ระบุ — ใช้เทียบกับจำนวนรับ */
export function countFirstChoice(applicants: readonly Applicant[], program: Program, academicYear: number): number {
  return applicants.filter((a) =>
    a.academicYear === academicYear && (a.level === 'pvc') === (program.track === 'pvc') && firstChoice(a) === program.code,
  ).length;
}

export function saveAnnouncement(list: readonly Announcement[], raw: unknown, ctx: { nowIso: string; newId: () => string }): Announcement[] {
  const source = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const title = text(source.title, 150);
  const body = text(source.body, 5000);
  const issues: Issue[] = [];
  if (title === '') issues.push({ field: 'title', message: 'กรอกหัวข้อประกาศ' });
  if (body === '') issues.push({ field: 'body', message: 'กรอกเนื้อหาประกาศ' });
  if (issues.length) fail('VALIDATION', 'ประกาศยังไม่ครบ', issues);
  const id = typeof source.id === 'string' ? source.id : '';
  const existing = list.find((item) => item.id === id);
  if (id && !existing) fail('NOT_FOUND', 'ไม่พบประกาศนี้ อาจถูกลบไปแล้ว');
  const next: Announcement = {
    id: existing?.id ?? ctx.newId(),
    title,
    body,
    pinned: source.pinned === true,
    published: source.published !== false,
    createdAt: existing?.createdAt ?? ctx.nowIso,
    updatedAt: ctx.nowIso,
  };
  return existing ? list.map((item) => (item.id === next.id ? next : item)) : [next, ...list];
}

export function deleteAnnouncement(list: readonly Announcement[], id: unknown): Announcement[] {
  if (!list.some((item) => item.id === id)) fail('NOT_FOUND', 'ไม่พบประกาศนี้');
  return list.filter((item) => item.id !== id);
}

/** ประกาศที่ผู้สมัครเห็น: เฉพาะที่เผยแพร่ ปักหมุดขึ้นก่อน แล้วเรียงใหม่ไปเก่า */
export function publicAnnouncements(list: readonly Announcement[]): Announcement[] {
  return list.filter((item) => item.published).sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.createdAt.localeCompare(a.createdAt));
}

/** ตรวจค่าตั้งค่าที่ผู้ดูแลส่งมาทั้งชุด */
export function normalizeSettings(raw: unknown): Settings {
  const source = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const issues: Issue[] = [];
  const year = Number(toArabicDigits(String(source.academicYear ?? '')));
  if (!Number.isInteger(year) || year < 2560 || year > 2700) issues.push({ field: 'academicYear', message: 'ใส่ปี พ.ศ. เช่น 2570' });
  const pattern = text(source.studentIdPattern, 40);
  const problem = checkStudentIdPattern(pattern);
  if (problem) issues.push({ field: 'studentIdPattern', message: problem });
  const settings: Settings = { ...DEFAULT_SETTINGS, academicYear: year, applicationsOpen: source.applicationsOpen === true, studentIdPattern: pattern };
  for (const field of SETTING_TEXT_FIELDS) {
    const value = text(source[field], field === 'details' ? 4000 : 300);
    settings[field] = value || DEFAULT_SETTINGS[field];
  }
  if (issues.length) fail('VALIDATION', issues[0]!.message, issues);
  return settings;
}

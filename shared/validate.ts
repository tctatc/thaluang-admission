import {
  CHANNELS, CURRENT_LEVELS, ENROLLMENT_FIELDS, INPUT_FIELDS, LEVELS, PREFIXES, trackOf,
  type ApplicationInput, type Enrollment, type Level, type Program,
} from './model';
import { PROVINCES } from './provinces';
import { ageOn, parseIsoDate, toArabicDigits, type DateParts } from './thai';

export interface Issue { field: string; message: string }

/** เลขบัตรประชาชน 13 หลัก พร้อมตรวจหลักสุดท้าย (check digit) ตามสูตรกรมการปกครอง */
export function isValidThaiId(id: string): boolean {
  if (!/^\d{13}$/.test(id)) return false;
  let sum = 0;
  for (let i = 0; i < 12; i += 1) sum += Number(id[i]) * (13 - i);
  return (11 - (sum % 11)) % 10 === Number(id[12]);
}

export const isValidPhone = (phone: string): boolean => /^0\d{9}$/.test(phone);

const MAX_TEXT = 120;
// อักขระควบคุมไม่ควรมีในชื่อหรือที่อยู่ — ตัดทิ้งก่อนเก็บลงชีต
const CONTROL_CHARS = /[\u0000-\u001f\u007f]/g;

/** ตัดอักขระควบคุม/ช่องว่างซ้อน และแปลงเลขไทยเป็นอารบิก (คนที่ตั้งแป้นภาษาไทยมักพิมพ์ ๐๘๑... มา) */
const clean = (value: unknown): string =>
  typeof value === 'string' ? toArabicDigits(value.replace(CONTROL_CHARS, ' ').replace(/\s+/g, ' ').trim()).slice(0, MAX_TEXT) : '';

const digitsOnly = (value: string): string => value.replace(/\D/g, '');

/** จัดข้อมูลให้อยู่รูปเดียวกันก่อนตรวจ (ตัดช่องว่าง เอาขีดออกจากเลขบัตร/เบอร์โทร) */
export function normalizeInput(raw: unknown): ApplicationInput {
  const source = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const out = {} as Record<string, string>;
  for (const field of INPUT_FIELDS) out[field] = clean(source[field]);
  out.nationalId = digitsOnly(out.nationalId!);
  out.phone = digitsOnly(out.phone!);
  out.postcode = digitsOnly(out.postcode!);
  out.email = out.email!.toLowerCase();
  if (out.level === 'pvc') out.programPvs = '';
  else { out.programPvc1 = ''; out.programPvc2 = ''; }
  return out as unknown as ApplicationInput;
}

/**
 * ตรวจใบสมัครทั้งใบ คืนรายการปัญหาพร้อมชื่อช่อง เพื่อให้หน้าเว็บขึ้นข้อความใต้ช่องที่ผิด
 * ฝั่ง server เรียกฟังก์ชันเดียวกันนี้ซ้ำเสมอ ไม่เชื่อผลตรวจจากเบราว์เซอร์
 */
export function validateApplication(input: ApplicationInput, programs: readonly Program[], today: DateParts): Issue[] {
  const issues: Issue[] = [];
  const need = (field: keyof ApplicationInput, message: string) => {
    if (input[field] === '') issues.push({ field, message });
  };
  const oneOf = (field: keyof ApplicationInput, list: readonly string[], message: string) => {
    if (input[field] !== '' && !list.includes(input[field])) issues.push({ field, message });
  };

  need('level', 'เลือกระดับที่ต้องการสมัคร');
  oneOf('level', LEVELS, 'ระดับที่สมัครไม่ถูกต้อง');
  need('prefix', 'เลือกคำนำหน้าชื่อ');
  oneOf('prefix', PREFIXES, 'คำนำหน้าชื่อไม่ถูกต้อง');
  need('firstName', 'กรอกชื่อ');
  need('lastName', 'กรอกนามสกุล');

  if (input.nationalId === '') issues.push({ field: 'nationalId', message: 'กรอกเลขบัตรประชาชน 13 หลัก' });
  else if (input.nationalId.length !== 13) issues.push({ field: 'nationalId', message: `เลขบัตรประชาชนต้องมี 13 หลัก (ตอนนี้ ${input.nationalId.length} หลัก)` });
  else if (!isValidThaiId(input.nationalId)) issues.push({ field: 'nationalId', message: 'เลขบัตรประชาชนไม่ถูกต้อง ตรวจดูอีกครั้งว่าพิมพ์ครบและไม่สลับหลัก' });

  const birth = parseIsoDate(input.birthDate);
  if (!birth) issues.push({ field: 'birthDate', message: 'เลือกวัน เดือน ปีเกิดให้ครบ' });
  else {
    const age = ageOn(birth, today);
    if (age < 12 || age > 60) issues.push({ field: 'birthDate', message: 'ปีเกิดดูไม่ถูกต้อง ตรวจว่าเลือกปี พ.ศ. ถูก' });
  }

  if (input.phone === '') issues.push({ field: 'phone', message: 'กรอกเบอร์โทรศัพท์' });
  else if (!isValidPhone(input.phone)) issues.push({ field: 'phone', message: 'เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลัก ขึ้นต้นด้วย 0' });
  if (input.email !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.email)) {
    issues.push({ field: 'email', message: 'รูปแบบอีเมลไม่ถูกต้อง' });
  }

  for (const field of ['fatherAge', 'motherAge'] as const) {
    if (input[field] !== '' && (!/^\d{1,3}$/.test(input[field]) || Number(input[field]) < 15 || Number(input[field]) > 120)) {
      issues.push({ field, message: 'อายุต้องเป็นตัวเลขระหว่าง 15–120' });
    }
  }

  need('houseNo', 'กรอกบ้านเลขที่');
  need('subdistrict', 'กรอกตำบล');
  need('district', 'กรอกอำเภอ');
  need('province', 'เลือกจังหวัด');
  oneOf('province', PROVINCES, 'เลือกจังหวัดจากรายการ');
  if (input.postcode === '') issues.push({ field: 'postcode', message: 'กรอกรหัสไปรษณีย์' });
  else if (!/^\d{5}$/.test(input.postcode)) issues.push({ field: 'postcode', message: 'รหัสไปรษณีย์ต้องมี 5 หลัก' });

  need('currentLevel', 'เลือกระดับชั้นที่กำลังศึกษา');
  oneOf('currentLevel', CURRENT_LEVELS, 'ระดับชั้นไม่ถูกต้อง');
  need('schoolName', 'กรอกชื่อโรงเรียน');
  need('schoolProvince', 'เลือกจังหวัดของโรงเรียน');
  oneOf('schoolProvince', PROVINCES, 'เลือกจังหวัดจากรายการ');

  if (input.gpa === '') issues.push({ field: 'gpa', message: 'กรอกผลการเรียนเฉลี่ยสะสม' });
  else if (!/^\d(\.\d{1,2})?$/.test(input.gpa) || Number(input.gpa) > 4) {
    issues.push({ field: 'gpa', message: 'ผลการเรียนเฉลี่ยต้องอยู่ระหว่าง 0.00–4.00 เช่น 3.25' });
  }

  if (LEVELS.includes(input.level as Level)) {
    const track = trackOf(input.level as Level);
    const open = programs.filter((program) => program.active && program.track === track).map((program) => program.code);
    if (track === 'pvs') {
      if (input.programPvs === '') issues.push({ field: 'programPvs', message: 'เลือกสาขาวิชาที่ต้องการเรียน' });
      else if (!open.includes(input.programPvs)) issues.push({ field: 'programPvs', message: 'สาขานี้ไม่เปิดรับในระดับ ปวส.' });
    } else {
      if (input.programPvc1 === '') issues.push({ field: 'programPvc1', message: 'เลือกสาขาวิชาลำดับที่ 1' });
      else if (!open.includes(input.programPvc1)) issues.push({ field: 'programPvc1', message: 'สาขานี้ไม่เปิดรับในระดับ ปวช.' });
      if (input.programPvc2 !== '' && !open.includes(input.programPvc2)) issues.push({ field: 'programPvc2', message: 'สาขานี้ไม่เปิดรับในระดับ ปวช.' });
      if (input.programPvc2 !== '' && input.programPvc2 === input.programPvc1) issues.push({ field: 'programPvc2', message: 'ลำดับที่ 2 ต้องเป็นคนละสาขากับลำดับที่ 1' });
    }
  }

  need('channel', 'เลือกช่องทางที่รู้จักวิทยาลัย');
  oneOf('channel', CHANNELS, 'ช่องทางไม่ถูกต้อง');
  if (input.consent !== 'yes') issues.push({ field: 'consent', message: 'ต้องยินยอมให้วิทยาลัยใช้ข้อมูลเพื่อการรับสมัคร' });

  return issues;
}

export function normalizeEnrollment(raw: unknown): Enrollment {
  const source = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const out = {} as Record<string, string>;
  for (const field of ENROLLMENT_FIELDS) out[field] = clean(source[field]);
  out.guardianPhone = digitsOnly(out.guardianPhone!);
  return out as unknown as Enrollment;
}

export function validateEnrollment(e: Enrollment): Issue[] {
  const issues: Issue[] = [];
  if (e.guardianName === '') issues.push({ field: 'guardianName', message: 'กรอกชื่อผู้ปกครอง' });
  if (e.guardianRelation === '') issues.push({ field: 'guardianRelation', message: 'กรอกความเกี่ยวข้องกับนักศึกษา' });
  if (!isValidPhone(e.guardianPhone)) issues.push({ field: 'guardianPhone', message: 'เบอร์โทรผู้ปกครองต้องเป็นตัวเลข 10 หลัก' });
  if (!parseIsoDate(e.enrolledDate)) issues.push({ field: 'enrolledDate', message: 'เลือกวันที่มอบตัว' });
  return issues;
}

export const PASSWORD_MIN = 8;

/** กฎรหัสผ่านที่เจ้าหน้าที่ตั้งเอง — คืนข้อความผิดพลาด หรือ '' ถ้าใช้ได้ */
export function checkNewPassword(current: string, next: string): string {
  if (next.length < PASSWORD_MIN) return `รหัสผ่านใหม่ต้องยาวอย่างน้อย ${PASSWORD_MIN} ตัวอักษร`;
  if (next.length > 64) return 'รหัสผ่านใหม่ยาวเกิน 64 ตัวอักษร';
  if (next === current) return 'รหัสผ่านใหม่ต้องไม่ซ้ำรหัสเดิม';
  if (/^\d+$/.test(next)) return 'รหัสผ่านใหม่ต้องมีตัวอักษรปนด้วย ไม่ใช่ตัวเลขล้วน';
  return '';
}

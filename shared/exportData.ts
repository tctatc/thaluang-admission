import { LEVEL_LABEL, STATUS_LABEL, programName, type Applicant, type Level, type Program, type Status } from './model';
import { bangkokDateParts, parseIsoDate, thaiLongDate } from './thai';

export type ExportPreset = 'full' | 'registry';

export const EXPORT_PRESET_LABEL: Record<ExportPreset, string> = {
  full: 'รายชื่อผู้สมัครทั้งหมด (ทุกช่อง)',
  registry: 'นำเข้างานทะเบียน (ผู้มอบตัวแล้ว)',
};

type Column = [header: string, value: (a: Applicant, programs: readonly Program[]) => string];

/** วันที่แบบ วว/ดด/ปปปป (พ.ศ.) ตามที่ระบบทะเบียนของ สอศ. ส่วนใหญ่รับ */
const thaiSlashDate = (iso: string): string => {
  const parts = parseIsoDate(iso);
  return parts ? `${String(parts.day).padStart(2, '0')}/${String(parts.month).padStart(2, '0')}/${parts.year + 543}` : '';
};

const address = (a: Applicant) =>
  [a.houseNo && `${a.houseNo}`, a.moo && `หมู่ ${a.moo}`, a.soi && `ซ.${a.soi}`, a.road && `ถ.${a.road}`,
    a.subdistrict && `ต.${a.subdistrict}`, a.district && `อ.${a.district}`, a.province && `จ.${a.province}`, a.postcode]
    .filter(Boolean).join(' ');

const FULL: Column[] = [
  ['เลขที่ใบสมัคร', (a) => a.appNo],
  ['ปีการศึกษา', (a) => String(a.academicYear)],
  ['สถานะ', (a) => STATUS_LABEL[a.status as Status] ?? a.status],
  ['ประเภทการสมัคร', (a) => LEVEL_LABEL[a.level as Level] ?? a.level],
  ['สาขา ปวส.', (a, p) => programName(p, a.programPvs)],
  ['สาขา ปวช. ลำดับ 1', (a, p) => programName(p, a.programPvc1)],
  ['สาขา ปวช. ลำดับ 2', (a, p) => programName(p, a.programPvc2)],
  ['คำนำหน้า', (a) => a.prefix],
  ['ชื่อ', (a) => a.firstName],
  ['นามสกุล', (a) => a.lastName],
  ['เลขบัตรประชาชน', (a) => a.nationalId],
  ['วันเกิด', (a) => thaiSlashDate(a.birthDate)],
  ['โทรศัพท์', (a) => a.phone],
  ['อีเมล', (a) => a.email],
  ['ที่อยู่', address],
  ['จังหวัด', (a) => a.province],
  ['ชื่อบิดา', (a) => a.fatherName],
  ['อายุบิดา', (a) => a.fatherAge],
  ['อาชีพบิดา', (a) => a.fatherJob],
  ['ชื่อมารดา', (a) => a.motherName],
  ['อายุมารดา', (a) => a.motherAge],
  ['อาชีพมารดา', (a) => a.motherJob],
  ['ระดับชั้นปัจจุบัน', (a) => a.currentLevel],
  ['โรงเรียนเดิม', (a) => a.schoolName],
  ['จังหวัดโรงเรียน', (a) => a.schoolProvince],
  ['GPAX', (a) => a.gpa],
  ['สาขาเดิม', (a) => a.currentMajor],
  ['ช่องทางที่รู้จัก', (a) => a.channel],
  ['ผู้แนะนำ', (a) => a.referrer],
  ['วันที่สมัคร', (a) => thaiLongDate(bangkokDateParts(a.createdAt))],
  ['รหัสนักศึกษา', (a) => a.studentId],
];

/**
 * ชุดสำหรับงานทะเบียน — แยกคำนำหน้า/ชื่อ/สกุล วันเกิด วว/ดด/ปปปป และรหัสสาขา
 * ลำดับคอลัมน์จริงของ ศธ.02 ออนไลน์แต่ละวิทยาลัยต่างกัน ถ้าได้ไฟล์แม่แบบมา ปรับลำดับที่รายการนี้ที่เดียว
 */
const REGISTRY: Column[] = [
  ['รหัสนักศึกษา', (a) => a.studentId],
  ['เลขประจำตัวประชาชน', (a) => a.nationalId],
  ['คำนำหน้าชื่อ', (a) => a.prefix],
  ['ชื่อ', (a) => a.firstName],
  ['นามสกุล', (a) => a.lastName],
  ['วันเดือนปีเกิด', (a) => thaiSlashDate(a.birthDate)],
  ['ระดับการศึกษา', (a) => (a.level === 'pvc' ? 'ปวช.' : 'ปวส.')],
  ['รหัสสาขาวิชา', (a) => a.enrollment?.admittedProgram ?? ''],
  ['สาขาวิชา', (a, p) => programName(p, a.enrollment?.admittedProgram ?? '')],
  ['ปีการศึกษาที่เข้า', (a) => String(a.academicYear)],
  ['วุฒิเดิม', (a) => a.currentLevel],
  ['สถานศึกษาเดิม', (a) => a.schoolName],
  ['จังหวัดสถานศึกษาเดิม', (a) => a.schoolProvince],
  ['เกรดเฉลี่ยเดิม', (a) => a.gpa],
  ['บ้านเลขที่', (a) => a.houseNo],
  ['หมู่', (a) => a.moo],
  ['ซอย', (a) => a.soi],
  ['ถนน', (a) => a.road],
  ['ตำบล', (a) => a.subdistrict],
  ['อำเภอ', (a) => a.district],
  ['จังหวัด', (a) => a.province],
  ['รหัสไปรษณีย์', (a) => a.postcode],
  ['โทรศัพท์', (a) => a.phone],
  ['ชื่อบิดา', (a) => a.fatherName],
  ['อาชีพบิดา', (a) => a.fatherJob],
  ['ชื่อมารดา', (a) => a.motherName],
  ['อาชีพมารดา', (a) => a.motherJob],
  ['ชื่อผู้ปกครอง', (a) => a.enrollment?.guardianName ?? ''],
  ['ความเกี่ยวข้อง', (a) => a.enrollment?.guardianRelation ?? ''],
  ['โทรศัพท์ผู้ปกครอง', (a) => a.enrollment?.guardianPhone ?? ''],
  ['วันที่มอบตัว', (a) => thaiSlashDate(a.enrollment?.enrolledDate ?? '')],
];

export function exportTable(applicants: readonly Applicant[], programs: readonly Program[], preset: ExportPreset): { headers: string[]; rows: string[][] } {
  const columns = preset === 'registry' ? REGISTRY : FULL;
  const list = preset === 'registry'
    ? applicants.filter((item) => item.status === 'enrolled').sort((a, b) => a.studentId.localeCompare(b.studentId))
    : [...applicants].sort((a, b) => a.appNo.localeCompare(b.appNo));
  return {
    headers: columns.map(([header]) => header),
    rows: list.map((item) => columns.map(([, value]) => value(item, programs))),
  };
}

/**
 * CSV สำหรับ Excel ภาษาไทย: ใส่ BOM ให้ Excel อ่าน UTF-8 ถูก และขึ้นบรรทัดแบบ CRLF
 * กันสูตรแฝง (CSV injection): ค่าที่ขึ้นต้นด้วย = + - @ จะถูกเติม ' ข้างหน้า
 * ไม่งั้นชื่อที่ผู้สมัครพิมพ์ว่า =HYPERLINK(...) จะกลายเป็นสูตรในเครื่องเจ้าหน้าที่
 */
export function toCsv(headers: readonly string[], rows: readonly (readonly string[])[]): string {
  const cell = (raw: string) => {
    const value = /^[=+\-@\t\r]/.test(raw) ? `'${raw}` : raw;
    return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
  };
  return `﻿${[headers, ...rows].map((row) => row.map(cell).join(',')).join('\r\n')}\r\n`;
}

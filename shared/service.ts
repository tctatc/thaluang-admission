/**
 * กฎการทำงานของระบบรับสมัคร — ที่เดียวที่ตัดสินว่าอะไรทำได้/ไม่ได้
 *
 * ทั้ง Apps Script (ของจริง) และโหมดสาธิตในเบราว์เซอร์เรียกชุดเดียวกัน
 * แต่ละฝั่งแค่ส่ง Repo ของตัวเองมา (ชีต หรือ localStorage)
 * ผู้เรียกฝั่ง server ต้องครอบทุกฟังก์ชันที่เขียนข้อมูลด้วยล็อก เพราะมีการอ่านแล้วตัดสินใจ (เลขซ้ำ/สมัครซ้ำ)
 */

import {
  DOC_INFO, DOC_KINDS, DOC_STATES, STATUSES, firstChoice, trackOf,
  type Applicant, type DocKind, type DocMeta, type DocState, type Level, type Program, type Settings, type Status,
} from './model';
import { nextApplicationNo, nextStudentId } from './numbering';
import { bangkokDateParts } from './thai';
import { normalizeEnrollment, normalizeInput, validateApplication, validateEnrollment, type Issue } from './validate';

export interface Repo {
  list(): Applicant[];
  insert(applicant: Applicant): void;
  update(applicant: Applicant): void;
}

export interface Ctx { nowIso: string; newId: () => string; actor: string }

export type ErrorCode = 'BAD_REQUEST' | 'FORBIDDEN' | 'NOT_FOUND' | 'CONFLICT' | 'VALIDATION';

/** error ที่มีรหัสติดไป — รูปเดียวกับ appError_ ของ Apps Script หน้าเว็บจึงอ่านได้ทั้งสองโหมด */
export function fail(code: ErrorCode, message: string, issues?: Issue[]): never {
  const error = new Error(message) as Error & { appCode: string; appDetails?: Issue[] };
  error.appCode = code;
  if (issues) error.appDetails = issues;
  throw error;
}

export function getApplicant(repo: Repo, id: string): Applicant {
  const found = repo.list().find((item) => item.id === id);
  if (!found) fail('NOT_FOUND', 'ไม่พบใบสมัครนี้ อาจถูกลบไปแล้ว');
  return found;
}

export function submitApplication(repo: Repo, settings: Settings, programs: readonly Program[], raw: unknown, ctx: Ctx): Applicant {
  if (!settings.applicationsOpen) fail('FORBIDDEN', 'ขณะนี้ปิดรับสมัครแล้ว');
  const input = normalizeInput(raw);
  const issues = validateApplication(input, programs, bangkokDateParts(ctx.nowIso));
  if (issues.length) fail('VALIDATION', 'ข้อมูลยังไม่ครบหรือไม่ถูกต้อง', issues);

  const all = repo.list();
  const duplicate = all.find((item) => item.academicYear === settings.academicYear && item.nationalId === input.nationalId);
  if (duplicate) {
    fail('CONFLICT', `เลขบัตรประชาชนนี้สมัครปีการศึกษา ${settings.academicYear} ไปแล้ว (เลขที่ ${duplicate.appNo}) ดูสถานะหรือแนบเอกสารเพิ่มได้ที่หน้าตรวจสถานะ`);
  }

  const applicant: Applicant = {
    ...input,
    id: ctx.newId(),
    appNo: nextApplicationNo(all.map((item) => item.appNo), settings.academicYear),
    academicYear: settings.academicYear,
    status: 'submitted',
    statusNote: '',
    documents: {},
    enrollment: null,
    studentId: '',
    createdAt: ctx.nowIso,
    updatedAt: ctx.nowIso,
    updatedBy: ctx.actor,
  };
  repo.insert(applicant);
  return applicant;
}

/**
 * หาใบสมัครด้วยเลขบัตร + วันเกิด (ต้องตรงทั้งคู่)
 * ใช้แค่เลขบัตรไม่พอ: เลขบัตรของคนอื่นหาได้ไม่ยาก แล้วจะเปิดดูที่อยู่และเอกสารของเขาได้
 */
export function findByCredentials(repo: Repo, nationalIdRaw: unknown, birthDateRaw: unknown): Applicant | null {
  const nationalId = String(nationalIdRaw ?? '').replace(/\D/g, '');
  const birthDate = String(birthDateRaw ?? '').trim();
  if (nationalId.length !== 13 || birthDate === '') return null;
  const matches = repo.list().filter((item) => item.nationalId === nationalId && item.birthDate === birthDate);
  return matches.sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0] ?? null;
}

export type PublicDoc = Omit<DocMeta, 'fileId'>;
export type PublicApplicant = Omit<Applicant, 'documents' | 'updatedBy'> & { documents: Partial<Record<DocKind, PublicDoc>> };

/** ข้อมูลที่ส่งให้ผู้สมัครได้ — ตัดรหัสไฟล์และชื่อเจ้าหน้าที่ออก */
export function publicView(applicant: Applicant): PublicApplicant {
  const { documents, updatedBy: _hidden, ...rest } = applicant;
  const docs: Partial<Record<DocKind, PublicDoc>> = {};
  for (const kind of DOC_KINDS) {
    const doc = documents[kind];
    if (doc) {
      const { fileId: _fileId, ...visible } = doc;
      docs[kind] = visible;
    }
  }
  return { ...rest, documents: docs };
}

export function assertDocKind(kind: unknown): DocKind {
  if (!DOC_KINDS.includes(kind as DocKind)) fail('BAD_REQUEST', 'ประเภทเอกสารไม่ถูกต้อง');
  return kind as DocKind;
}

/** ตรวจก่อนอัปโหลดว่าแนบเอกสารชิ้นนี้ได้ไหม — เรียกก่อนเขียนไฟล์ลง Drive จะได้ไม่มีไฟล์ค้าง */
export function assertCanAttach(applicant: Applicant, kind: DocKind): void {
  if (applicant.status === 'enrolled' || applicant.status === 'not_passed') {
    fail('FORBIDDEN', 'ใบสมัครนี้ปิดแล้ว แก้ไขเอกสารไม่ได้ ติดต่อเจ้าหน้าที่หากจำเป็น');
  }
  // เอกสารที่เจ้าหน้าที่ตรวจผ่านแล้วห้ามสลับไฟล์ ไม่งั้นแก้เอกสารหลังตรวจได้
  if (applicant.documents[kind]?.state === 'ok') fail('CONFLICT', `${DOC_INFO[kind].label} ตรวจผ่านแล้ว ไม่ต้องส่งใหม่`);
}

/** บันทึกเอกสารที่อัปโหลดแล้ว — คืนรหัสไฟล์เก่าที่ถูกแทนที่ เพื่อให้ผู้เรียกลบทิ้ง */
export function attachDocument(
  repo: Repo, applicant: Applicant, kind: DocKind, file: Pick<DocMeta, 'fileId' | 'name' | 'mime' | 'size'>, ctx: Ctx,
): { applicant: Applicant; replacedFileId: string } {
  assertCanAttach(applicant, kind);
  const replacedFileId = applicant.documents[kind]?.fileId ?? '';
  const documents = { ...applicant.documents, [kind]: { ...file, uploadedAt: ctx.nowIso, state: 'pending' as DocState, note: '' } };
  const stillToFix = DOC_KINDS.some((key) => documents[key]?.state === 'fix');
  const next: Applicant = {
    ...applicant,
    documents,
    // ส่งเอกสารที่ถูกขอแก้ครบแล้ว กลับไปรอตรวจอัตโนมัติ เจ้าหน้าที่จะเห็นในคิวอีกครั้ง
    ...(applicant.status === 'needs_fix' && !stillToFix ? { status: 'submitted' as Status, statusNote: '' } : {}),
    updatedAt: ctx.nowIso,
    updatedBy: ctx.actor,
  };
  repo.update(next);
  return { applicant: next, replacedFileId };
}

export function reviewDocument(repo: Repo, id: string, kindRaw: unknown, stateRaw: unknown, noteRaw: unknown, ctx: Ctx): Applicant {
  const applicant = getApplicant(repo, id);
  const kind = assertDocKind(kindRaw);
  const doc = applicant.documents[kind];
  if (!doc) fail('NOT_FOUND', 'ผู้สมัครยังไม่ได้แนบเอกสารนี้');
  if (!DOC_STATES.includes(stateRaw as DocState)) fail('BAD_REQUEST', 'สถานะเอกสารไม่ถูกต้อง');
  const state = stateRaw as DocState;
  const note = String(noteRaw ?? '').trim().slice(0, 300);
  if (state === 'fix' && note === '') fail('VALIDATION', 'ระบุว่าต้องแก้อะไร ผู้สมัครจะเห็นข้อความนี้', [{ field: 'note', message: 'ระบุสิ่งที่ต้องแก้' }]);

  const next: Applicant = {
    ...applicant,
    documents: { ...applicant.documents, [kind]: { ...doc, state, note: state === 'fix' ? note : '' } },
    ...(state === 'fix' && applicant.status === 'submitted' ? { status: 'needs_fix' as Status } : {}),
    updatedAt: ctx.nowIso,
    updatedBy: ctx.actor,
  };
  repo.update(next);
  return next;
}

export function setStatus(repo: Repo, id: string, statusRaw: unknown, noteRaw: unknown, ctx: Ctx): Applicant {
  const applicant = getApplicant(repo, id);
  if (!STATUSES.includes(statusRaw as Status)) fail('BAD_REQUEST', 'สถานะไม่ถูกต้อง');
  const status = statusRaw as Status;
  if (status === 'enrolled') fail('BAD_REQUEST', 'บันทึกการมอบตัวผ่านแบบฟอร์มมอบตัว เพื่อให้ระบบออกรหัสนักศึกษา');
  if (applicant.status === 'enrolled') fail('CONFLICT', 'ผู้สมัครมอบตัวและได้รหัสนักศึกษาแล้ว เปลี่ยนสถานะไม่ได้');
  const note = String(noteRaw ?? '').trim().slice(0, 300);
  const next: Applicant = { ...applicant, status, statusNote: note, updatedAt: ctx.nowIso, updatedBy: ctx.actor };
  repo.update(next);
  return next;
}

export function enroll(repo: Repo, settings: Settings, programs: readonly Program[], id: string, raw: unknown, ctx: Ctx): Applicant {
  const applicant = getApplicant(repo, id);
  if (applicant.status !== 'passed' && applicant.status !== 'enrolled') {
    fail('CONFLICT', 'มอบตัวได้เฉพาะผู้ที่ผ่านการคัดเลือก');
  }
  const enrollment = normalizeEnrollment(raw);
  if (enrollment.admittedProgram === '') enrollment.admittedProgram = firstChoice(applicant);
  const track = trackOf(applicant.level as Level);
  const issues = validateEnrollment(enrollment);
  const program = programs.find((item) => item.code === enrollment.admittedProgram && item.track === track);
  if (!program) issues.push({ field: 'admittedProgram', message: 'เลือกสาขาที่รับเข้า' });
  if (issues.length) fail('VALIDATION', 'ข้อมูลมอบตัวยังไม่ครบ', issues);

  // แก้ข้อมูลมอบตัวภายหลังได้ แต่รหัสนักศึกษาที่ออกไปแล้วคงเดิม (กันเลขเปลี่ยนหลังแจ้งนักศึกษาไปแล้ว)
  const studentId = applicant.studentId || nextStudentId(
    settings.studentIdPattern,
    { academicYear: applicant.academicYear, track, programCode: program!.code },
    repo.list().map((item) => item.studentId).filter(Boolean),
  );
  const next: Applicant = { ...applicant, enrollment, studentId, status: 'enrolled', updatedAt: ctx.nowIso, updatedBy: ctx.actor };
  repo.update(next);
  return next;
}

/** เจ้าหน้าที่แก้ข้อมูลที่ผู้สมัครกรอกผิด — ตรวจด้วยกฎเดียวกับตอนสมัคร และกันเลขบัตรชนกับคนอื่น */
export function updateApplicant(repo: Repo, programs: readonly Program[], id: string, raw: unknown, ctx: Ctx): Applicant {
  const applicant = getApplicant(repo, id);
  const input = normalizeInput({ ...(raw && typeof raw === 'object' ? raw : {}), consent: 'yes' });
  // ผู้สมัครที่สมัครไว้ก่อนสาขาถูกปิด ยังต้องแก้ข้อมูลอื่นได้ จึงตรวจสาขากับรายการที่รวมสาขาที่ปิดแล้วด้วย
  const issues = validateApplication(input, programs.map((p) => ({ ...p, active: true })), bangkokDateParts(ctx.nowIso));
  if (issues.length) fail('VALIDATION', 'ข้อมูลยังไม่ครบหรือไม่ถูกต้อง', issues);
  const clash = repo.list().find((item) => item.id !== id && item.academicYear === applicant.academicYear && item.nationalId === input.nationalId);
  if (clash) fail('CONFLICT', `เลขบัตรนี้ซ้ำกับใบสมัคร ${clash.appNo}`, [{ field: 'nationalId', message: `ซ้ำกับใบสมัคร ${clash.appNo}` }]);
  const next: Applicant = { ...applicant, ...input, consent: applicant.consent, updatedAt: ctx.nowIso, updatedBy: ctx.actor };
  repo.update(next);
  return next;
}

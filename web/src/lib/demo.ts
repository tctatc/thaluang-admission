/**
 * หลังบ้านจำลองในเบราว์เซอร์ — ใช้ตอนยังไม่ได้ deploy Apps Script หรือเปิดสาธิตให้อาจารย์ดู
 *
 * ใช้กฎชุดเดียวกับ server (shared/service) ผลลัพธ์จึงตรงกับของจริง
 * ข้อมูลอยู่ใน localStorage/IndexedDB ของเครื่องนี้เท่านั้น ไม่มีใครอื่นเห็น
 */

import {
  CHANNELS, CURRENT_LEVELS, DEFAULT_SETTINGS, DOC_INFO, DOC_KINDS, SAMPLE_PROGRAMS, STATUSES,
  type Applicant, type DocKind, type Settings,
} from '@shared/model';
import { checkStudentIdPattern } from '@shared/numbering';
import { PROVINCES } from '@shared/provinces';
import {
  assertCanAttach, assertDocKind, attachDocument, enroll, fail, findByCredentials, getApplicant, publicView,
  reviewDocument, setStatus, submitApplication, type Ctx, type Repo,
} from '@shared/service';
import { checkUpload } from '@shared/files';
import type { Transport } from './api';
import { ApiError } from './errors';
import { fileStore, readStore, writeStore } from './storage';

const KEY_APPLICANTS = 'tla.demo.applicants.v1';
const KEY_SETTINGS = 'tla.demo.settings.v1';
const KEY_VERSION = 'tla.demo.version.v1';

/** บัญชีเจ้าหน้าที่ของโหมดสาธิต (หน้าเข้าสู่ระบบแสดงไว้ให้) */
export const DEMO_STAFF = [
  { username: 'admin', password: 'admin1234', displayName: 'ผู้ดูแลระบบ (สาธิต)', role: 'admin' as const },
  { username: 'staff', password: 'staff1234', displayName: 'เจ้าหน้าที่ทะเบียน (สาธิต)', role: 'staff' as const },
];

function load<T>(key: string, fallback: T): T {
  const raw = readStore('local', key);
  if (raw === null) return fallback;
  try { return JSON.parse(raw) as T; } catch { return fallback; }
}

function save(key: string, value: unknown): void {
  if (!writeStore('local', key, JSON.stringify(value))) {
    throw new ApiError('INTERNAL', 'เบราว์เซอร์นี้เก็บข้อมูลไม่ได้ (อาจเปิดโหมดส่วนตัวอยู่) โหมดสาธิตจึงบันทึกไม่ได้');
  }
}

function repo(): Repo {
  return {
    list: () => load<Applicant[]>(KEY_APPLICANTS, []),
    insert: (applicant) => save(KEY_APPLICANTS, [...load<Applicant[]>(KEY_APPLICANTS, []), applicant]),
    update: (applicant) => save(KEY_APPLICANTS, load<Applicant[]>(KEY_APPLICANTS, []).map((item) => (item.id === applicant.id ? applicant : item))),
  };
}

const settings = (): Settings => ({ ...DEFAULT_SETTINGS, ...load<Partial<Settings>>(KEY_SETTINGS, {}) });
const bump = () => save(KEY_VERSION, load<number>(KEY_VERSION, 0) + 1);
const ctx = (actor: string): Ctx => ({ nowIso: new Date().toISOString(), newId: () => `app_${crypto.randomUUID().slice(0, 16)}`, actor });

function staffFromToken(token: string) {
  const staff = DEMO_STAFF.find((item) => `demo:${item.username}` === token);
  if (!staff) throw new ApiError('UNAUTHENTICATED', 'กรุณาเข้าสู่ระบบใหม่');
  return staff;
}

async function photoOf(applicant: Applicant): Promise<string> {
  const photo = applicant.documents.photo;
  return photo ? (await fileStore.get(photo.fileId)) ?? '' : '';
}

type Handler = (payload: Record<string, unknown>, token: string) => unknown;

const handlers: Record<string, Handler> = {
  config: () => {
    const current = settings();
    return { academicYear: current.academicYear, applicationsOpen: current.applicationsOpen, programs: SAMPLE_PROGRAMS.filter((p) => p.active) };
  },
  submitApplication: (payload) => {
    const applicant = submitApplication(repo(), settings(), SAMPLE_PROGRAMS, payload, ctx('ผู้สมัคร'));
    bump();
    return { applicant: publicView(applicant) };
  },
  lookup: async (payload) => {
    const applicant = findByCredentials(repo(), payload.nationalId, payload.birthDate);
    if (!applicant) fail('NOT_FOUND', 'ไม่พบใบสมัคร ตรวจเลขบัตรประชาชนและวันเกิดให้ตรงกับที่กรอกตอนสมัคร');
    return { applicant: publicView(applicant), photo: await photoOf(applicant) };
  },
  uploadDocument: async (payload) => {
    const kind = assertDocKind(payload.kind);
    const applicant = findByCredentials(repo(), payload.nationalId, payload.birthDate);
    if (!applicant) fail('NOT_FOUND', 'ไม่พบใบสมัคร');
    assertCanAttach(applicant, kind);
    const dataUrl = String(payload.dataBase64 ?? '');
    const binary = atob(dataUrl.replace(/^data:[^,]*,/, ''));
    const check = checkUpload([...binary.slice(0, 8)].map((c) => c.charCodeAt(0)), binary.length, DOC_INFO[kind].imageOnly);
    if (check.problem) fail('VALIDATION', check.problem);
    const fileId = `${applicant.id}-${kind}-${Date.now()}`;
    await fileStore.put(fileId, `data:${check.mime};base64,${dataUrl.replace(/^data:[^,]*,/, '')}`);
    const result = attachDocument(repo(), applicant, kind, { fileId, name: String(payload.name ?? kind), mime: check.mime, size: binary.length }, ctx('ผู้สมัคร'));
    if (result.replacedFileId) await fileStore.remove(result.replacedFileId);
    bump();
    return { applicant: publicView(result.applicant) };
  },

  login: (payload) => {
    const staff = DEMO_STAFF.find((item) => item.username === String(payload.username).trim().toLowerCase() && item.password === payload.password);
    if (!staff) fail('BAD_REQUEST', 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
    return { token: `demo:${staff.username}`, staff: { username: staff.username, displayName: staff.displayName, role: staff.role } };
  },
  me: (_payload, token) => {
    const staff = staffFromToken(token);
    return { staff: { username: staff.username, displayName: staff.displayName, role: staff.role }, settings: settings(), programs: SAMPLE_PROGRAMS, dataVersion: load(KEY_VERSION, 0) };
  },
  applicants: (_payload, token) => {
    staffFromToken(token);
    return { applicants: repo().list(), dataVersion: load(KEY_VERSION, 0) };
  },
  getFile: async (payload, token) => {
    staffFromToken(token);
    const doc = getApplicant(repo(), String(payload.id)).documents[assertDocKind(payload.kind)];
    if (!doc) fail('NOT_FOUND', 'ผู้สมัครยังไม่ได้แนบเอกสารนี้');
    const dataUrl = await fileStore.get(doc.fileId);
    if (!dataUrl) fail('NOT_FOUND', 'ไฟล์ตัวอย่างนี้ไม่มีเนื้อไฟล์ (สร้างจากปุ่มเติมข้อมูลตัวอย่าง)');
    return { name: doc.name, mime: doc.mime, dataBase64: dataUrl.replace(/^data:[^,]*,/, '') };
  },
  reviewDocument: (payload, token) => {
    const staff = staffFromToken(token);
    const applicant = reviewDocument(repo(), String(payload.id), payload.kind, payload.state, payload.note, ctx(staff.username));
    bump();
    return { applicant };
  },
  setStatus: (payload, token) => {
    const staff = staffFromToken(token);
    const applicant = setStatus(repo(), String(payload.id), payload.status, payload.note, ctx(staff.username));
    bump();
    return { applicant };
  },
  enroll: (payload, token) => {
    const staff = staffFromToken(token);
    const applicant = enroll(repo(), settings(), SAMPLE_PROGRAMS, String(payload.id), payload.enrollment, ctx(staff.username));
    bump();
    return { applicant };
  },
  saveSettings: (payload, token) => {
    if (staffFromToken(token).role !== 'admin') fail('FORBIDDEN', 'เฉพาะผู้ดูแลระบบ');
    const pattern = String(payload.studentIdPattern ?? '').trim();
    const problem = checkStudentIdPattern(pattern);
    if (problem) fail('VALIDATION', problem, [{ field: 'studentIdPattern', message: problem }]);
    const year = Number(payload.academicYear);
    if (!Number.isInteger(year) || year < 2560 || year > 2700) fail('VALIDATION', 'ปีการศึกษาไม่ถูกต้อง', [{ field: 'academicYear', message: 'ใส่ปี พ.ศ. เช่น 2570' }]);
    save(KEY_SETTINGS, { academicYear: year, applicationsOpen: Boolean(payload.applicationsOpen), studentIdPattern: pattern });
    bump();
    return { settings: settings() };
  },
  seedDemo: (_payload, token) => {
    staffFromToken(token);
    const added = seed();
    bump();
    return { added };
  },
};

export function createDemoBackend(): Transport {
  return {
    mode: 'demo',
    async call<T>(action: string, payload: unknown = {}, token = ''): Promise<T> {
      const handler = handlers[action];
      if (!handler) throw new ApiError('BAD_REQUEST', `ไม่รู้จักคำสั่ง ${action}`);
      // หน่วงนิดหน่อยให้เห็นสถานะกำลังโหลดเหมือนใช้งานจริง
      await new Promise((resolve) => setTimeout(resolve, 180));
      try {
        // ส่งสำเนาไป ป้องกันโค้ดหน้าเว็บกับ "server" ถือ object ตัวเดียวกัน
        return structuredClone(await handler(structuredClone(payload ?? {}) as Record<string, unknown>, token)) as T;
      } catch (error) {
        if (error instanceof ApiError) throw error;
        const coded = error as Error & { appCode?: string; appDetails?: [] };
        throw new ApiError(coded.appCode ?? 'INTERNAL', coded.message, coded.appDetails ?? []);
      }
    },
    async version() {
      return { dataVersion: load<number>(KEY_VERSION, 0) };
    },
  };
}

/* ---------- ข้อมูลตัวอย่างสำหรับสาธิตแดชบอร์ด ---------- */

const FIRST = ['ธนากร', 'ศุภชัย', 'กิตติพัฒน์', 'ณัฐวุฒิ', 'พีรพัฒน์', 'อนันดา', 'ชลธิชา', 'วรรณิดา', 'สุธิดา', 'ปิยะพงษ์', 'ภาณุวัฒน์', 'ธีรเดช'];
const LAST = ['ใจดี', 'ศรีสุข', 'บุญมา', 'แก้วประเสริฐ', 'ทองคำ', 'วงศ์ใหญ่', 'สายสุวรรณ', 'พรหมมา', 'จันทร์หอม', 'มีสุข'];
const SCHOOLS: [string, string][] = [
  ['โรงเรียนแก่งคอย', 'สระบุรี'], ['โรงเรียนท่าหลวงวิทยาคม', 'ลพบุรี'], ['โรงเรียนเสาไห้"วิมลวิทยานุกูล"', 'สระบุรี'],
  ['โรงเรียนพัฒนานิคม', 'ลพบุรี'], ['โรงเรียนมวกเหล็กวิทยา', 'สระบุรี'], ['โรงเรียนหนองแค "สรกิจพิทยา"', 'สระบุรี'],
];

const pick = <T,>(list: readonly T[]): T => list[Math.floor(Math.random() * list.length)]!;

function fakeThaiId(): string {
  const digits = [String(1 + Math.floor(Math.random() * 8)), ...Array.from({ length: 11 }, () => String(Math.floor(Math.random() * 10)))];
  const sum = digits.reduce((total, digit, i) => total + Number(digit) * (13 - i), 0);
  return digits.join('') + String((11 - (sum % 11)) % 10);
}

function seed(): number {
  const store = repo();
  let added = 0;
  for (let i = 0; i < 36; i += 1) {
    const level = Math.random() < 0.6 ? 'pvc' : pick(['pvs_direct', 'pvs_cross'] as const);
    const pvc = SAMPLE_PROGRAMS.filter((p) => p.track === 'pvc');
    const first = pick(pvc).code;
    const [school, schoolProvince] = pick(SCHOOLS);
    const male = Math.random() < 0.65;
    const daysAgo = Math.floor(Math.random() * 24);
    const created = new Date(Date.now() - daysAgo * 86_400_000 - Math.random() * 36_000_000).toISOString();
    try {
      const applicant = submitApplication(store, { ...settings(), applicationsOpen: true }, SAMPLE_PROGRAMS, {
        level, prefix: male ? 'นาย' : 'นางสาว', firstName: pick(FIRST), lastName: pick(LAST), nationalId: fakeThaiId(),
        birthDate: `${level === 'pvc' ? 2011 : 2008}-0${1 + Math.floor(Math.random() * 9)}-1${Math.floor(Math.random() * 9)}`,
        phone: `08${Math.floor(10_000_000 + Math.random() * 89_999_999)}`, email: '',
        fatherName: `นาย${pick(FIRST)} ${pick(LAST)}`, fatherAge: String(40 + Math.floor(Math.random() * 15)), fatherJob: 'รับจ้าง',
        motherName: `นาง${pick(FIRST)} ${pick(LAST)}`, motherAge: String(38 + Math.floor(Math.random() * 15)), motherJob: 'ค้าขาย',
        houseNo: String(1 + Math.floor(Math.random() * 200)), moo: String(1 + Math.floor(Math.random() * 12)), soi: '', road: '',
        subdistrict: 'ตาลเดี่ยว', district: 'แก่งคอย', province: Math.random() < 0.75 ? 'สระบุรี' : pick(PROVINCES), postcode: '18110',
        currentLevel: level === 'pvc' ? 'ม.3' : pick(CURRENT_LEVELS.slice(1, 3)), schoolName: school, schoolAddressNo: '', schoolSubdistrict: '', schoolDistrict: '', schoolProvince,
        gpa: (2 + Math.random() * 2).toFixed(2), currentMajor: '',
        programPvs: pick(SAMPLE_PROGRAMS.filter((p) => p.track === 'pvs')).code, programPvc1: first,
        programPvc2: pick(pvc.filter((p) => p.code !== first)).code, channel: pick(CHANNELS), referrer: '', consent: 'yes',
      }, { nowIso: created, newId: () => `app_${crypto.randomUUID().slice(0, 16)}`, actor: 'ข้อมูลตัวอย่าง' });
      const documents: Applicant['documents'] = {};
      for (const kind of DOC_KINDS.slice(0, 4) as DocKind[]) {
        documents[kind] = { fileId: '', name: `${kind}.jpg`, mime: 'image/jpeg', size: 240_000, uploadedAt: created, state: 'pending', note: '' };
      }
      store.update({ ...applicant, documents, status: pick(STATUSES.slice(0, 4)) });
      added += 1;
    } catch {
      // เลขบัตรสุ่มซ้ำ (โอกาสน้อยมาก) ข้ามไป
    }
  }
  return added;
}

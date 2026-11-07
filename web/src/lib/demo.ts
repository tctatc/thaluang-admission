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
import { PROVINCES } from '@shared/provinces';
import {
  assertCanAttach, assertDocKind, attachDocument, enroll, fail, findByCredentials, getApplicant, publicView,
  reviewDocument, setStatus, submitApplication, updateApplicant, type Ctx, type Repo,
} from '@shared/service';
import { deleteAnnouncement, normalizePrograms, normalizeSettings, publicAnnouncements, saveAnnouncement } from '@shared/admin';
import { MANUAL_KINDS, NO_POSTER, type Announcement, type ManualInfo, type ManualKind, type PosterImage, type Program, type StoredManual } from '@shared/model';
import { checkManual, checkPoster, checkUpload } from '@shared/files';
import { checkNewPassword } from '@shared/validate';
import { normalizeStaffInput, staffChangeProblem, validateStaffInput, type StaffAccount } from '@shared/users';
import { computePublicStats } from '@shared/stats';
import type { Manuals, Transport } from './api';
import { ApiError } from './errors';
import { fileStore, readStore, writeStore } from './storage';

const KEY_APPLICANTS = 'tla.demo.applicants.v1';
const KEY_SETTINGS = 'tla.demo.settings.v1';
const KEY_VERSION = 'tla.demo.version.v1';
const KEY_PROGRAMS = 'tla.demo.programs.v3';
const KEY_ANNOUNCEMENTS = 'tla.demo.announcements.v1';
const KEY_STAFF = 'tla.demo.staff.v1';

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
const programs = (): Program[] => load<Program[]>(KEY_PROGRAMS, SAMPLE_PROGRAMS);
const announcements = (): Announcement[] => load<Omit<Announcement, keyof typeof NO_POSTER_FIELDS>[]>(KEY_ANNOUNCEMENTS, [{
  id: 'demo-1', title: 'เปิดรับสมัครนักเรียน นักศึกษา รอบโควตา', body: 'สมัครออนไลน์ได้ตลอด 24 ชั่วโมง กรอกใบสมัครแล้วพิมพ์นำมายื่นพร้อมเอกสาร\nสอบถามงานรับสมัคร ในวันและเวลาราชการ',
  pinned: true, published: true, createdAt: '2026-11-01T02:00:00.000Z', updatedAt: '2026-11-01T02:00:00.000Z',
}]).map((item) => ({ ...NO_POSTER_FIELDS, ...item }));
const NO_POSTER_FIELDS = { imageFileId: '', imageUrl: '', imageWidth: 0, imageHeight: 0 };
const KEY_MANUALS = 'tla.demo.manuals.v1';
/** ไฟล์โหมดสาธิตอยู่ใน IndexedDB หน้าเว็บอ่านผ่าน url แบบ idb:<key> (useFileUrl แปลงให้) */
const idbUrl = (key: string) => `idb:${key}`;
const manuals = (): Manuals => {
  const stored = load<Partial<Record<ManualKind, StoredManual | null>>>(KEY_MANUALS, {});
  const info = (m: StoredManual | null | undefined): ManualInfo | null => (m ? { ...m, mime: m.mime || 'application/pdf', viewUrl: idbUrl(m.fileId), downloadUrl: idbUrl(m.fileId) } : null);
  return { applicant: info(stored.applicant), staff: info(stored.staff) };
};

async function demoMedia(dataBase64: string, check: typeof checkPoster): Promise<{ key: string; mime: string; size: number }> {
  const base64 = dataBase64.replace(/^data:[^,]*,/, '');
  const binary = atob(base64);
  const result = check([...binary.slice(0, 8)].map((ch) => ch.charCodeAt(0)), binary.length);
  if (result.problem) fail('VALIDATION', result.problem);
  const key = `media_${crypto.randomUUID().slice(0, 12)}`;
  await fileStore.put(key, `data:${result.mime};base64,${base64}`);
  return { key, mime: result.mime, size: binary.length };
}

const bump = () => save(KEY_VERSION, load<number>(KEY_VERSION, 0) + 1);
const ctx = (actor: string): Ctx => ({ nowIso: new Date().toISOString(), newId: () => `app_${crypto.randomUUID().slice(0, 16)}`, actor });

function requireAdmin(token: string) {
  if (staffFromToken(token).role !== 'admin') fail('FORBIDDEN', 'เฉพาะผู้ดูแลระบบ');
}

/** บัญชีโหมดสาธิตเก็บในเบราว์เซอร์ (รหัสผ่านเป็นข้อความธรรมดา ใช้ทดลองเท่านั้น ระบบจริงเก็บแค่ HMAC) */
type DemoStaff = StaffAccount & { password: string; version: number };
const demoStaff = (): DemoStaff[] => load<DemoStaff[]>(KEY_STAFF, DEMO_STAFF.map((s) => ({ ...s, status: 'active', lastLoginAt: '', version: 1 })));
const saveStaff = (list: DemoStaff[]) => save(KEY_STAFF, list);
const account = ({ password: _p, version: _v, ...rest }: DemoStaff): StaffAccount => rest;
const accounts = () => ({ users: demoStaff().map(account) });

function staffFromToken(token: string) {
  const [, username, version] = token.split(':');
  const staff = demoStaff().find((item) => item.username === username);
  if (!staff || staff.status !== 'active' || String(staff.version) !== version) throw new ApiError('UNAUTHENTICATED', 'กรุณาเข้าสู่ระบบใหม่');
  return staff;
}

function updateDemoStaff(username: string, patch: Partial<DemoStaff>) {
  saveStaff(demoStaff().map((item) => (item.username === username ? { ...item, ...patch } : item)));
}

async function photoOf(applicant: Applicant): Promise<string> {
  const photo = applicant.documents.photo;
  return photo ? (await fileStore.get(photo.fileId)) ?? '' : '';
}

type Handler = (payload: Record<string, unknown>, token: string) => unknown;

const handlers: Record<string, Handler> = {
  config: () => {
    const current = settings();
    return {
      academicYear: current.academicYear, applicationsOpen: current.applicationsOpen, programs: programs().filter((p) => p.active),
      siteText: { heroTitle: current.heroTitle, heroText: current.heroText, details: current.details },
    };
  },
  submitApplication: (payload) => {
    const applicant = submitApplication(repo(), settings(), programs(), payload, ctx('ผู้สมัคร'));
    bump();
    return { applicant: publicView(applicant) };
  },
  home: () => ({
    dataVersion: load<number>(KEY_VERSION, 0),
    config: handlers.config!({}, ''),
    announcements: publicAnnouncements(announcements()),
    manual: manuals().applicant,
    stats: computePublicStats(repo().list(), programs(), settings().academicYear, new Date().toISOString()),
  }),
  staffBootstrap: (_payload, token) => {
    const staff = staffFromToken(token);
    return {
      staff: { username: staff.username, displayName: staff.displayName, role: staff.role },
      settings: settings(), programs: programs(), applicants: repo().list(), manuals: manuals(), dataVersion: load(KEY_VERSION, 0),
    };
  },
  publicStats: () => computePublicStats(repo().list(), programs(), settings().academicYear, new Date().toISOString()),
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
    const staff = demoStaff().find((item) => item.username === String(payload.username).trim().toLowerCase() && item.password === payload.password);
    if (!staff) fail('BAD_REQUEST', 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
    if (staff.status !== 'active') fail('FORBIDDEN', 'บัญชีนี้ถูกปิดการใช้งาน');
    updateDemoStaff(staff.username, { lastLoginAt: new Date().toISOString() });
    return { token: `demo:${staff.username}:${staff.version}`, staff: { username: staff.username, displayName: staff.displayName, role: staff.role } };
  },
  changePassword: (payload, token) => {
    const staff = staffFromToken(token);
    if (String(payload.currentPassword) !== staff.password) fail('VALIDATION', 'รหัสผ่านเดิมไม่ถูกต้อง', [{ field: 'currentPassword', message: 'รหัสผ่านเดิมไม่ถูกต้อง' }]);
    const problem = checkNewPassword(staff.password, String(payload.newPassword ?? ''));
    if (problem) fail('VALIDATION', problem, [{ field: 'newPassword', message: problem }]);
    updateDemoStaff(staff.username, { password: String(payload.newPassword), version: staff.version + 1 });
    return { token: `demo:${staff.username}:${staff.version + 1}` };
  },
  listStaff: (_payload, token) => { requireAdmin(token); return accounts(); },
  createStaff: (payload, token) => {
    requireAdmin(token);
    const input = normalizeStaffInput(payload);
    const password = String(payload.password ?? '');
    const issues = validateStaffInput(input, demoStaff(), true, password);
    if (issues.length) fail('VALIDATION', issues[0]!.message, issues);
    saveStaff([...demoStaff(), { ...input, status: 'active', lastLoginAt: '', password, version: 1 }]);
    return accounts();
  },
  updateStaff: (payload, token) => {
    requireAdmin(token);
    const actor = staffFromToken(token);
    const input = normalizeStaffInput(payload);
    const issues = validateStaffInput(input, [], false);
    if (issues.length) fail('VALIDATION', issues[0]!.message, issues);
    const problem = staffChangeProblem(demoStaff(), actor.username, input.username, { role: input.role, status: input.status });
    if (problem) fail('CONFLICT', problem);
    const current = demoStaff().find((item) => item.username === input.username)!;
    const kick = current.role !== input.role || current.status !== input.status;
    updateDemoStaff(input.username, { displayName: input.displayName, role: input.role, status: input.status, version: current.version + (kick ? 1 : 0) });
    return accounts();
  },
  resetStaffPassword: (payload, token) => {
    requireAdmin(token);
    const password = String(payload.password ?? '');
    const problem = checkNewPassword('', password);
    if (problem) fail('VALIDATION', problem, [{ field: 'password', message: problem }]);
    const current = demoStaff().find((item) => item.username === payload.username);
    if (!current) fail('NOT_FOUND', 'ไม่พบบัญชีนี้');
    updateDemoStaff(current.username, { password, version: current.version + 1 });
    return accounts();
  },
  deleteStaff: (payload, token) => {
    requireAdmin(token);
    const problem = staffChangeProblem(demoStaff(), staffFromToken(token).username, String(payload.username), null);
    if (problem) fail('CONFLICT', problem);
    saveStaff(demoStaff().filter((item) => item.username !== payload.username));
    return accounts();
  },
  me: (_payload, token) => {
    const staff = staffFromToken(token);
    return { staff: { username: staff.username, displayName: staff.displayName, role: staff.role }, settings: settings(), programs: programs(), dataVersion: load(KEY_VERSION, 0) };
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
    const applicant = enroll(repo(), settings(), programs(), String(payload.id), payload.enrollment, ctx(staff.username));
    bump();
    return { applicant };
  },
  saveSettings: (payload, token) => {
    requireAdmin(token);
    save(KEY_SETTINGS, normalizeSettings(payload));
    bump();
    return { settings: settings() };
  },
  savePrograms: (payload, token) => {
    requireAdmin(token);
    const next = normalizePrograms(payload.programs, repo().list());
    save(KEY_PROGRAMS, next);
    bump();
    return { programs: next };
  },
  announcements: () => ({ announcements: publicAnnouncements(announcements()) }),
  adminAnnouncements: (_payload, token) => { staffFromToken(token); return { announcements: announcements() }; },
  saveAnnouncement: async (payload, token) => {
    requireAdmin(token);
    const upload = payload.image as { dataBase64?: string; width?: number; height?: number } | undefined;
    let image: PosterImage | undefined;
    if (payload.removeImage === true) image = NO_POSTER;
    else if (upload?.dataBase64) {
      const media = await demoMedia(upload.dataBase64, checkPoster);
      image = { fileId: media.key, url: idbUrl(media.key), width: Number(upload.width) || 0, height: Number(upload.height) || 0 };
    }
    const old = announcements().find((item) => item.id === payload.id)?.imageFileId ?? '';
    const next = saveAnnouncement(announcements(), payload, { nowIso: new Date().toISOString(), newId: () => `ann_${crypto.randomUUID().slice(0, 12)}` }, image);
    save(KEY_ANNOUNCEMENTS, next);
    if (image !== undefined && old && old !== image.fileId) await fileStore.remove(old);
    bump();
    return { announcements: next };
  },
  deleteAnnouncement: async (payload, token) => {
    requireAdmin(token);
    const old = announcements().find((item) => item.id === payload.id)?.imageFileId ?? '';
    const next = deleteAnnouncement(announcements(), payload.id);
    save(KEY_ANNOUNCEMENTS, next);
    if (old) await fileStore.remove(old);
    bump();
    return { announcements: next };
  },
  uploadManual: async (payload, token) => {
    requireAdmin(token);
    const kind = payload.kind as ManualKind;
    if (!MANUAL_KINDS.includes(kind)) fail('BAD_REQUEST', 'ไม่รู้จักคู่มือชนิดนี้');
    const media = await demoMedia(String(payload.dataBase64 ?? ''), checkManual);
    const stored = load<Partial<Record<ManualKind, StoredManual | null>>>(KEY_MANUALS, {});
    const old = stored[kind]?.fileId;
    save(KEY_MANUALS, { ...stored, [kind]: { fileId: media.key, name: String(payload.name ?? 'คู่มือ.pdf'), size: media.size, updatedAt: new Date().toISOString(), mime: media.mime } });
    if (old) await fileStore.remove(old);
    bump();
    return { manuals: manuals() };
  },
  deleteManual: async (payload, token) => {
    requireAdmin(token);
    const kind = payload.kind as ManualKind;
    const stored = load<Partial<Record<ManualKind, StoredManual | null>>>(KEY_MANUALS, {});
    const old = stored[kind]?.fileId;
    save(KEY_MANUALS, { ...stored, [kind]: null });
    if (old) await fileStore.remove(old);
    bump();
    return { manuals: manuals() };
  },
  updateApplicant: (payload, token) => {
    const staff = staffFromToken(token);
    const applicant = updateApplicant(repo(), programs(), String(payload.id), payload.applicant, ctx(staff.username));
    bump();
    return { applicant };
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
    const pvc = programs().filter((p) => p.track === 'pvc');
    const first = pick(pvc).code;
    const [school, schoolProvince] = pick(SCHOOLS);
    const male = Math.random() < 0.65;
    const daysAgo = Math.floor(Math.random() * 24);
    const created = new Date(Date.now() - daysAgo * 86_400_000 - Math.random() * 36_000_000).toISOString();
    try {
      const applicant = submitApplication(store, { ...settings(), applicationsOpen: true }, programs(), {
        level, prefix: male ? 'นาย' : 'นางสาว', firstName: pick(FIRST), lastName: pick(LAST), nationalId: fakeThaiId(),
        birthDate: `${level === 'pvc' ? 2011 : 2008}-0${1 + Math.floor(Math.random() * 9)}-1${Math.floor(Math.random() * 9)}`,
        phone: `08${Math.floor(10_000_000 + Math.random() * 89_999_999)}`, email: '',
        fatherName: `นาย${pick(FIRST)} ${pick(LAST)}`, fatherAge: String(40 + Math.floor(Math.random() * 15)), fatherJob: 'รับจ้าง',
        motherName: `นาง${pick(FIRST)} ${pick(LAST)}`, motherAge: String(38 + Math.floor(Math.random() * 15)), motherJob: 'ค้าขาย',
        houseNo: String(1 + Math.floor(Math.random() * 200)), moo: String(1 + Math.floor(Math.random() * 12)), soi: '', road: '',
        subdistrict: 'ตาลเดี่ยว', district: 'แก่งคอย', province: Math.random() < 0.75 ? 'สระบุรี' : pick(PROVINCES), postcode: '18110',
        currentLevel: level === 'pvc' ? 'ม.3' : pick(CURRENT_LEVELS.slice(1, 3)), schoolName: school, schoolAddressNo: '', schoolSubdistrict: '', schoolDistrict: '', schoolProvince,
        gpa: (2 + Math.random() * 2).toFixed(2), currentMajor: '',
        programPvs: pick(programs().filter((p) => p.track === 'pvs')).code, programPvc1: first,
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

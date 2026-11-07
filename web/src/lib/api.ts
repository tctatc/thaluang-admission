/**
 * ชั้นคุยกับหลังบ้าน
 *
 * มีสองโหมด หน้าเว็บไม่ต้องรู้ว่าใช้โหมดไหน:
 *  - http: Apps Script จริง (ตั้ง VITE_API_URL ตอน build)
 *  - demo: จำลองในเบราว์เซอร์ ใช้กฎชุดเดียวกับ server (shared/service) ข้อมูลอยู่ในเครื่องนี้เท่านั้น
 *
 * เรื่องที่ต้องทำให้ถูกกับ Apps Script:
 *  1. Content-Type ต้องเป็น text/plain — ถ้าเป็น application/json เบราว์เซอร์จะยิง preflight
 *     ซึ่ง Apps Script ตอบไม่ได้ แล้วโดน CORS บล็อกทั้งที่ server ปกติ
 *  2. Apps Script ตอบ HTTP 200 เสมอ ต้องดูฟิลด์ ok ในเนื้อหา
 */

import type { Announcement, Applicant, DocKind, DocState, ManualInfo, ManualKind, Program, Settings, Status } from '@shared/model';
import type { StaffAccount, StaffAccountInput } from '@shared/users';
import type { PublicApplicant } from '@shared/service';
import type { PublicStats } from '@shared/stats';
import type { Issue } from '@shared/validate';
import { createDemoBackend } from './demo';
import { ApiError } from './errors';

export { ApiError };

export interface Transport {
  mode: 'http' | 'demo';
  call<T>(action: string, payload?: unknown, token?: string): Promise<T>;
  version(): Promise<{ dataVersion: number }>;
}

const TIMEOUT_MS = 60_000;

async function requestJson<T>(url: string, init: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), TIMEOUT_MS);
  let response: Response;
  try {
    response = await fetch(url, { ...init, signal: controller.signal });
  } catch (error) {
    const aborted = error instanceof DOMException && error.name === 'AbortError';
    throw new ApiError('NETWORK', aborted
      ? 'เซิร์ฟเวอร์ตอบช้าเกินไป อาจมีผู้สมัครพร้อมกันมาก กรุณาลองอีกครั้ง'
      : 'เชื่อมต่อไม่ได้ ตรวจอินเทอร์เน็ตแล้วลองอีกครั้ง');
  } finally {
    window.clearTimeout(timer);
  }
  let envelope: { ok: true; data: T } | { ok: false; error: { code: string; message: string; issues?: Issue[] } };
  try {
    envelope = JSON.parse(await response.text());
  } catch {
    throw new ApiError('NETWORK', 'เซิร์ฟเวอร์ตอบกลับในรูปแบบที่อ่านไม่ได้ ตรวจว่า URL ถูกต้องและ deploy ด้วยสิทธิ์ Anyone');
  }
  if (envelope.ok) return envelope.data;
  throw new ApiError(envelope.error.code, envelope.error.message || 'เกิดข้อผิดพลาด', envelope.error.issues ?? []);
}

function createHttpTransport(apiUrl: string): Transport {
  return {
    mode: 'http',
    call<T>(action: string, payload: unknown = {}, token = '') {
      return requestJson<T>(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action, token, payload }),
      });
    },
    version() {
      return requestJson(`${apiUrl}${apiUrl.includes('?') ? '&' : '?'}action=version`, { method: 'GET' });
    },
  };
}

const API_URL = (import.meta.env.VITE_API_URL ?? '').trim();
const transport: Transport = /^https:\/\/script\.google\.com\//.test(API_URL) ? createHttpTransport(API_URL) : createDemoBackend();
export const apiMode = transport.mode;

/* ---------- คำสั่งที่หน้าเว็บใช้ ---------- */

export interface SiteText { heroTitle: string; heroText: string; details: string }
export interface PublicConfig { academicYear: number; applicationsOpen: boolean; programs: Program[]; siteText: SiteText }
export interface HomeData { dataVersion: number; config: PublicConfig; announcements: Announcement[]; stats: PublicStats; manual?: ManualInfo | null }
export interface Manuals { applicant: ManualInfo | null; staff: ManualInfo | null }
/** ส่งพร้อมประกาศ: image = รูปใหม่ (base64 ที่ย่อแล้ว), removeImage = เอาโปสเตอร์ออก, ไม่ส่งทั้งคู่ = คงเดิม */
export interface PosterUpload { dataBase64: string; width: number; height: number }
export interface Credentials { nationalId: string; birthDate: string }
export interface StaffUser { username: string; displayName: string; role: 'admin' | 'staff' }

export const api = {
  version: () => transport.version(),
  config: () => transport.call<PublicConfig>('config'),
  home: () => transport.call<HomeData>('home'),
  publicStats: () => transport.call<PublicStats>('publicStats'),
  submit: (input: unknown) => transport.call<{ applicant: PublicApplicant }>('submitApplication', input),
  lookup: (cred: Credentials) => transport.call<{ applicant: PublicApplicant; photo: string }>('lookup', cred),
  upload: (cred: Credentials, kind: DocKind, name: string, dataBase64: string) =>
    transport.call<{ applicant: PublicApplicant }>('uploadDocument', { ...cred, kind, name, dataBase64 }),

  login: (username: string, password: string) => transport.call<{ token: string; staff: StaffUser }>('login', { username, password }),
  changePassword: (token: string, currentPassword: string, newPassword: string) =>
    transport.call<{ token: string }>('changePassword', { currentPassword, newPassword }, token),
  listStaff: (token: string) => transport.call<{ users: StaffAccount[] }>('listStaff', {}, token),
  createStaff: (token: string, account: StaffAccountInput & { password: string }) => transport.call<{ users: StaffAccount[] }>('createStaff', account, token),
  updateStaff: (token: string, account: StaffAccountInput) => transport.call<{ users: StaffAccount[] }>('updateStaff', account, token),
  resetStaffPassword: (token: string, username: string, password: string) => transport.call<{ users: StaffAccount[] }>('resetStaffPassword', { username, password }, token),
  deleteStaff: (token: string, username: string) => transport.call<{ users: StaffAccount[] }>('deleteStaff', { username }, token),
  staffBootstrap: (token: string) => transport.call<{ staff: StaffUser; settings: Settings; programs: Program[]; applicants: Applicant[]; manuals?: Manuals; dataVersion: number }>('staffBootstrap', {}, token),
  me: (token: string) => transport.call<{ staff: StaffUser; settings: Settings; programs: Program[]; dataVersion: number }>('me', {}, token),
  applicants: (token: string) => transport.call<{ applicants: Applicant[]; dataVersion: number }>('applicants', {}, token),
  getFile: (token: string, id: string, kind: DocKind) => transport.call<{ name: string; mime: string; dataBase64: string }>('getFile', { id, kind }, token),
  reviewDocument: (token: string, id: string, kind: DocKind, state: DocState, note: string) =>
    transport.call<{ applicant: Applicant }>('reviewDocument', { id, kind, state, note }, token),
  setStatus: (token: string, id: string, status: Status, note: string) => transport.call<{ applicant: Applicant }>('setStatus', { id, status, note }, token),
  enroll: (token: string, id: string, enrollment: unknown) => transport.call<{ applicant: Applicant }>('enroll', { id, enrollment }, token),
  saveSettings: (token: string, settings: Settings) => transport.call<{ settings: Settings }>('saveSettings', settings, token),
  seedDemo: (token: string) => transport.call<{ added: number }>('seedDemo', {}, token),
  announcements: () => transport.call<{ announcements: Announcement[] }>('announcements'),
  adminAnnouncements: (token: string) => transport.call<{ announcements: Announcement[] }>('adminAnnouncements', {}, token),
  saveAnnouncement: (token: string, item: Partial<Announcement> & { image?: PosterUpload; removeImage?: boolean }) =>
    transport.call<{ announcements: Announcement[] }>('saveAnnouncement', item, token),
  uploadManual: (token: string, kind: ManualKind, name: string, dataBase64: string) => transport.call<{ manuals: Manuals }>('uploadManual', { kind, name, dataBase64 }, token),
  deleteManual: (token: string, kind: ManualKind) => transport.call<{ manuals: Manuals }>('deleteManual', { kind }, token),
  deleteAnnouncement: (token: string, id: string) => transport.call<{ announcements: Announcement[] }>('deleteAnnouncement', { id }, token),
  savePrograms: (token: string, programs: Program[]) => transport.call<{ programs: Program[] }>('savePrograms', { programs }, token),
  updateApplicant: (token: string, id: string, applicant: unknown) => transport.call<{ applicant: Applicant }>('updateApplicant', { id, applicant }, token),
};

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'เกิดข้อผิดพลาด';
}

export function issuesOf(error: unknown): Record<string, string> {
  const map: Record<string, string> = {};
  if (error instanceof ApiError) for (const issue of error.issues) map[issue.field] ??= issue.message;
  return map;
}

import type { Issue } from './validate';
import { checkNewPassword } from './validate';

/**
 * กฎบัญชีเจ้าหน้าที่ (ใช้ทั้ง Apps Script และโหมดสาธิต)
 * กันสองเรื่องที่ทำให้ระบบล็อกตัวเอง: แก้สิทธิ์/ลบบัญชีตัวเอง และไม่เหลือผู้ดูแลที่ใช้งานได้เลย
 */

export const STAFF_ROLES = ['staff', 'admin'] as const;
export type StaffRole = (typeof STAFF_ROLES)[number];
export const STAFF_ROLE_LABEL: Record<StaffRole, string> = { staff: 'เจ้าหน้าที่', admin: 'ผู้ดูแลระบบ' };
export const STAFF_ROLE_HINT: Record<StaffRole, string> = {
  staff: 'ดูและตรวจใบสมัคร เปลี่ยนสถานะ รับมอบตัว ส่งออก Excel',
  admin: 'ทำได้ทุกอย่าง รวมถึงสาขา ประกาศ ตั้งค่า และจัดการผู้ใช้',
};

export type StaffStatus = 'active' | 'disabled';

export interface StaffAccount {
  username: string;
  displayName: string;
  role: StaffRole;
  status: StaffStatus;
  lastLoginAt: string;
}

export type StaffAccountInput = Pick<StaffAccount, 'username' | 'displayName' | 'role' | 'status'>;

const USERNAME = /^[a-z0-9._-]{3,32}$/;

export function normalizeStaffInput(raw: unknown): StaffAccountInput {
  const source = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  return {
    username: String(source.username ?? '').trim().toLowerCase(),
    displayName: String(source.displayName ?? '').replace(/\s+/g, ' ').trim().slice(0, 100),
    role: source.role === 'admin' ? 'admin' : 'staff',
    status: source.status === 'disabled' ? 'disabled' : 'active',
  };
}

/** ตรวจข้อมูลบัญชี — creating=true ต้องมีชื่อผู้ใช้ใหม่ที่ไม่ซ้ำ และรหัสผ่านแรกเข้า */
export function validateStaffInput(input: StaffAccountInput, existing: readonly StaffAccount[], creating: boolean, password = ''): Issue[] {
  const issues: Issue[] = [];
  if (creating) {
    if (!USERNAME.test(input.username)) issues.push({ field: 'username', message: 'ชื่อผู้ใช้ 3–32 ตัว ใช้ a-z 0-9 . _ - เท่านั้น' });
    else if (existing.some((u) => u.username === input.username)) issues.push({ field: 'username', message: `มีชื่อผู้ใช้ ${input.username} แล้ว` });
    const problem = checkNewPassword('', password);
    if (problem) issues.push({ field: 'password', message: problem });
  }
  if (!input.displayName) issues.push({ field: 'displayName', message: 'กรอกชื่อ-นามสกุล' });
  return issues;
}

/**
 * ตรวจการเปลี่ยนบัญชี target ของผู้ทำ actor — next = null คือการลบ
 * คืนข้อความเหตุผลที่ทำไม่ได้ หรือ '' ถ้าทำได้
 */
export function staffChangeProblem(list: readonly StaffAccount[], actor: string, target: string, next: Pick<StaffAccount, 'role' | 'status'> | null): string {
  const current = list.find((u) => u.username === target);
  if (!current) return 'ไม่พบบัญชีนี้';
  if (target === actor) {
    if (next === null) return 'ลบบัญชีของตัวเองไม่ได้ ให้ผู้ดูแลคนอื่นทำแทน';
    if (next.role !== current.role || next.status !== current.status) return 'เปลี่ยนสิทธิ์หรือปิดบัญชีของตัวเองไม่ได้ ให้ผู้ดูแลคนอื่นทำแทน';
  }
  const after = list
    .filter((u) => !(next === null && u.username === target))
    .map((u) => (u.username === target && next ? { ...u, ...next } : u));
  if (!after.some((u) => u.role === 'admin' && u.status === 'active')) return 'ต้องมีผู้ดูแลระบบที่ใช้งานได้อย่างน้อย 1 คน';
  return '';
}

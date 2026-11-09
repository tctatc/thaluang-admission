import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import type { Applicant, Program, Settings } from '@shared/model';
import { api, ApiError, type Manuals, type StaffUser } from '../lib/api';
import { readStore, removeStore, writeStore } from '../lib/storage';

/**
 * สถานะการเข้าสู่ระบบของเจ้าหน้าที่ + รายชื่อผู้สมัครที่อัปเดตเอง
 *
 * token เก็บใน sessionStorage (ปิดแท็บแล้วหลุด) เพราะเครื่องในห้องธุรการมักใช้ร่วมกันหลายคน
 * รายชื่อดึงใหม่เฉพาะเมื่อ dataVersion บน server เปลี่ยน — ถามทุก 10 วินาที ซึ่งเบามาก
 */

const TOKEN_KEY = 'tla.staff.token';
const POLL_MS = 10_000;

interface StaffState {
  token: string;
  staff: StaffUser | null;
  settings: Settings | null;
  programs: Program[];
  applicants: Applicant[];
  manuals: Manuals;
  setManuals(manuals: Manuals): void;
  loading: boolean;
  error: string;
  login(username: string, password: string): Promise<void>;
  logout(): void;
  /** เปลี่ยนรหัสแล้วเครื่องอื่นหลุด เครื่องนี้รับ token ใหม่ไปใช้ต่อ */
  changePassword(currentPassword: string, newPassword: string): Promise<void>;
  reload(): Promise<void>;
  /** ใส่ใบสมัครที่เพิ่งแก้ลงรายการทันที ไม่ต้องรอรอบดึงข้อมูลถัดไป */
  replace(applicant: Applicant): void;
  /** เอาใบสมัครที่เพิ่งลบออกจากรายการทันที */
  removeApplicant(id: string): void;
  setSettings(settings: Settings): void;
}

const StaffContext = createContext<StaffState | null>(null);

export function StaffProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState(() => readStore('session', TOKEN_KEY) ?? '');
  const [staff, setStaff] = useState<StaffUser | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [manuals, setManuals] = useState<Manuals>({ applicant: null, staff: null });
  const [loading, setLoading] = useState(Boolean(token));
  const [error, setError] = useState('');
  const version = useRef(-1);

  const logout = useCallback(() => {
    removeStore('session', TOKEN_KEY);
    setToken('');
    setStaff(null);
    setApplicants([]);
    version.current = -1;
  }, []);

  const handleError = useCallback((cause: unknown) => {
    if (cause instanceof ApiError && cause.code === 'UNAUTHENTICATED') logout();
    else setError(cause instanceof Error ? cause.message : 'โหลดข้อมูลไม่สำเร็จ');
  }, [logout]);

  const reload = useCallback(async () => {
    if (!token) return;
    try {
      // คำขอเดียว: ตรวจสิทธิ์และเปิดชีตครั้งเดียว (เดิมสองคำขอ ต่างคนต่างเปิดชีต)
      const data = await api.staffBootstrap(token);
      setStaff(data.staff);
      setSettings(data.settings);
      setPrograms(data.programs);
      setApplicants(data.applicants);
      if (data.manuals) setManuals(data.manuals);
      version.current = data.dataVersion;
      setError('');
    } catch (cause) {
      handleError(cause);
    } finally {
      setLoading(false);
    }
  }, [token, handleError]);

  useEffect(() => { void reload(); }, [reload]);

  useEffect(() => {
    if (!token) return;
    const timer = window.setInterval(async () => {
      if (document.hidden) return;
      try {
        const { dataVersion } = await api.version();
        if (dataVersion !== version.current) {
          // สาขา/จำนวนรับอาจถูกผู้ดูแลอีกเครื่องแก้ ดึงมาพร้อมกันเลย
          const data = await api.staffBootstrap(token);
          setPrograms(data.programs);
          setSettings(data.settings);
          setApplicants(data.applicants);
          if (data.manuals) setManuals(data.manuals);
          version.current = data.dataVersion;
        }
      } catch {
        // เน็ตสะดุดชั่วคราว รอรอบถัดไป ไม่ต้องรบกวนผู้ใช้
      }
    }, POLL_MS);
    return () => window.clearInterval(timer);
  }, [token]);

  const login = useCallback(async (username: string, password: string) => {
    const result = await api.login(username, password);
    writeStore('session', TOKEN_KEY, result.token);
    setLoading(true);
    setToken(result.token);
  }, []);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    const result = await api.changePassword(token, currentPassword, newPassword);
    writeStore('session', TOKEN_KEY, result.token);
    setToken(result.token);
  }, [token]);

  const removeApplicant = useCallback((id: string) => {
    setApplicants((list) => list.filter((item) => item.id !== id));
  }, []);

  const replace = useCallback((applicant: Applicant) => {
    setApplicants((list) => list.map((item) => (item.id === applicant.id ? applicant : item)));
  }, []);

  return (
    <StaffContext.Provider value={{ token, staff, settings, programs, applicants, manuals, setManuals, loading, error, login, logout, changePassword, reload, replace, removeApplicant, setSettings }}>
      {children}
    </StaffContext.Provider>
  );
}

export function useStaff(): StaffState {
  const value = useContext(StaffContext);
  if (!value) throw new Error('useStaff ต้องอยู่ใน StaffProvider');
  return value;
}

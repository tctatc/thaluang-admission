import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import type { Applicant, Program, Settings } from '@shared/model';
import { api, ApiError, type Manuals, type StaffData, type StaffUser } from '../lib/api';
import { readStore, removeStore, writeStore } from '../lib/storage';

/**
 * สถานะการเข้าสู่ระบบของเจ้าหน้าที่ + รายชื่อผู้สมัครที่อัปเดตเอง
 *
 * token เก็บใน sessionStorage (ปิดแท็บแล้วหลุด) เพราะเครื่องในห้องธุรการมักใช้ร่วมกันหลายคน
 * รายชื่อดึงใหม่เฉพาะเมื่อ dataVersion บน server เปลี่ยน — ถามทุก 10 วินาที ซึ่งเบามาก
 */

const TOKEN_KEY = 'tla.staff.token';
/**
 * ข้อมูลชุดล่าสุดของแท็บนี้ — เปิดหน้าใหม่ในแท็บเดิมแล้วขึ้นทันที แล้วค่อยดึงชุดใหม่เบื้องหลัง
 * เก็บใน sessionStorage (หายเมื่อปิดแท็บ) และล้างทิ้งตอนออกจากระบบ เพราะมีข้อมูลส่วนตัวผู้สมัคร
 */
const SNAPSHOT_KEY = 'tla.staff.snapshot';

type Snapshot = StaffData & { staff: StaffUser };

function readSnapshot(): Snapshot | null {
  try {
    const value = JSON.parse(readStore('session', SNAPSHOT_KEY) ?? 'null') as Snapshot | null;
    return value && value.staff && Array.isArray(value.applicants) ? value : null;
  } catch {
    return null;
  }
}
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
  const [snapshot] = useState(() => (token ? readSnapshot() : null));
  const [staff, setStaff] = useState<StaffUser | null>(snapshot?.staff ?? null);
  const [settings, setSettings] = useState<Settings | null>(snapshot?.settings ?? null);
  const [programs, setPrograms] = useState<Program[]>(snapshot?.programs ?? []);
  const [applicants, setApplicants] = useState<Applicant[]>(snapshot?.applicants ?? []);
  const [manuals, setManuals] = useState<Manuals>(snapshot?.manuals ?? { applicant: null, staff: null });
  // มีข้อมูลชุดเก่าของแท็บนี้ = แสดงเลย ไม่ต้องขึ้นหน้ากำลังโหลด
  const [loading, setLoading] = useState(Boolean(token) && !snapshot);
  const [error, setError] = useState('');
  const version = useRef(snapshot?.dataVersion ?? -1);
  /** login ส่งข้อมูลมาให้แล้ว ข้ามการโหลดซ้ำตอนเปลี่ยน token รอบนั้น */
  const primed = useRef(false);

  const apply = useCallback((data: StaffData & { staff?: StaffUser }) => {
    if (data.staff) setStaff(data.staff);
    setSettings(data.settings);
    setPrograms(data.programs);
    setApplicants(data.applicants);
    if (data.manuals) setManuals(data.manuals);
    version.current = data.dataVersion;
  }, []);

  // จำชุดล่าสุดไว้ทุกครั้งที่ข้อมูลเปลี่ยน
  useEffect(() => {
    if (!token || !staff || !settings) return;
    writeStore('session', SNAPSHOT_KEY, JSON.stringify({ staff, settings, programs, applicants, manuals, dataVersion: version.current }));
  }, [token, staff, settings, programs, applicants, manuals]);

  const logout = useCallback(() => {
    removeStore('session', TOKEN_KEY);
    removeStore('session', SNAPSHOT_KEY);
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
    if (primed.current) { primed.current = false; return; }
    try {
      // คำขอเดียว: ตรวจสิทธิ์และอ่านข้อมูลทั้งหมดในรอบเดียว
      apply(await api.staffBootstrap(token));
      setError('');
    } catch (cause) {
      handleError(cause);
    } finally {
      setLoading(false);
    }
  }, [token, handleError, apply]);

  useEffect(() => { void reload(); }, [reload]);

  useEffect(() => {
    if (!token) return;
    const timer = window.setInterval(async () => {
      if (document.hidden) return;
      try {
        const { dataVersion } = await api.version();
        if (dataVersion !== version.current) {
          // สาขา/จำนวนรับอาจถูกผู้ดูแลอีกเครื่องแก้ ดึงมาพร้อมกันเลย
          apply(await api.staffBootstrap(token));
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
    if (result.applicants && result.settings && result.programs && result.dataVersion !== undefined) {
      // ได้ข้อมูลมากับการล็อกอินแล้ว เข้าหน้าได้ทันที
      apply({ staff: result.staff, settings: result.settings, programs: result.programs, applicants: result.applicants, ...(result.manuals ? { manuals: result.manuals } : {}), dataVersion: result.dataVersion });
      primed.current = true;
      setLoading(false);
    } else {
      setLoading(true);
    }
    setToken(result.token);
  }, [apply]);

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

import { lazy, Suspense, useEffect } from 'react';
import { Link, NavLink, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { BarChart3, ClipboardCheck, ExternalLink, FileSearch, FlaskConical, Home, KeyRound, Layers, LogOut, Megaphone, PencilLine, QrCode, Settings as SettingsIcon, UserCog, Users } from 'lucide-react';
import { apiMode, type PublicConfig } from '../lib/api';
import { useHome } from '../lib/publicData';
import { cn, initialOf, Loading } from '../components/ui';
import { InstallApp } from '../components/InstallApp';
import { BottomNav, sheetRowClass, type MobileNavItem } from '../components/MobileNav';
import { HomePage } from '../pages/HomePage';
import { ApplyPage } from '../pages/ApplyPage';
import { StatusPage } from '../pages/StatusPage';
import { LoginPage } from '../pages/staff/LoginPage';
// หน้าเจ้าหน้าที่ (และไลบรารี QR) โหลดเมื่อเปิดใช้จริง ผู้สมัครบนมือถือจึงไม่ต้องดาวน์โหลดโค้ดส่วนนี้
const DashboardPage = lazy(() => import('../pages/staff/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const ApplicantsPage = lazy(() => import('../pages/staff/ApplicantsPage').then((m) => ({ default: m.ApplicantsPage })));
const ApplicantDetailPage = lazy(() => import('../pages/staff/ApplicantDetailPage').then((m) => ({ default: m.ApplicantDetailPage })));
const SettingsPage = lazy(() => import('../pages/staff/SettingsPage').then((m) => ({ default: m.SettingsPage })));
const ProgramsPage = lazy(() => import('../pages/staff/ProgramsPage').then((m) => ({ default: m.ProgramsPage })));
const AnnouncementsPage = lazy(() => import('../pages/staff/AnnouncementsPage').then((m) => ({ default: m.AnnouncementsPage })));
const AccountPage = lazy(() => import('../pages/staff/AccountPage').then((m) => ({ default: m.AccountPage })));
const UsersPage = lazy(() => import('../pages/staff/UsersPage').then((m) => ({ default: m.UsersPage })));
const QrPage = lazy(() => import('../pages/staff/QrPage').then((m) => ({ default: m.QrPage })));
import { StaffProvider, useStaff } from './staff';

export function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route path="apply" element={<ApplyPage />} />
        <Route path="status" element={<StatusPage />} />
      </Route>
      <Route path="staff" element={<StaffProvider><StaffLayout /></StaffProvider>}>
        <Route index element={<Suspense fallback={<Loading />}><DashboardPage /></Suspense>} />
        <Route path="applicants" element={<Suspense fallback={<Loading />}><ApplicantsPage /></Suspense>} />
        <Route path="applicants/:id" element={<Suspense fallback={<Loading />}><ApplicantDetailPage /></Suspense>} />
        <Route path="settings" element={<Suspense fallback={<Loading />}><SettingsPage /></Suspense>} />
        <Route path="programs" element={<Suspense fallback={<Loading />}><ProgramsPage /></Suspense>} />
        <Route path="announcements" element={<Suspense fallback={<Loading />}><AnnouncementsPage /></Suspense>} />
        <Route path="qr" element={<Suspense fallback={<Loading />}><QrPage /></Suspense>} />
        <Route path="users" element={<Suspense fallback={<Loading />}><UsersPage /></Suspense>} />
        <Route path="account" element={<Suspense fallback={<Loading />}><AccountPage /></Suspense>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

/** ค่าที่หน้าผู้สมัครทุกหน้าใช้ (ปีการศึกษา เปิด/ปิดรับ รายชื่อสาขา) มาจากชุดข้อมูลหน้าแรกชุดเดียว */
export function usePublicConfig(): { config: PublicConfig | null; error: string } {
  const { home, error } = useHome();
  return { config: home?.config ?? null, error };
}

function DemoBanner() {
  if (apiMode !== 'demo') return null;
  return (
    <p className="no-print flex items-center justify-center gap-2 bg-gold-soft px-4 py-1.5 text-center text-sm text-gold-ink">
      <FlaskConical className="size-4 shrink-0" aria-hidden="true" />
      โหมดสาธิต ข้อมูลเก็บในเบราว์เซอร์นี้เท่านั้น ยังไม่ส่งถึงวิทยาลัย
    </p>
  );
}

function Brand({ to, subtitle }: { to: string; subtitle: string }) {
  return (
    <Link to={to} className="flex min-w-0 items-center gap-3">
      <img src={`${import.meta.env.BASE_URL}college-logo.png`} alt="" className="size-11 shrink-0" />
      <span className="min-w-0 leading-tight">
        <span className="block truncate font-semibold text-brand-deep">วท.ท่าหลวงซิเมนต์ไทยอนุสรณ์</span>
        <span className="block truncate text-sm text-ink-muted">{subtitle}</span>
      </span>
    </Link>
  );
}

function PublicLayout() {
  const { pathname } = useLocation();
  // ห้ามเขียนแบบ () => window.scrollTo(...) เพราะ Chrome รุ่นใหม่คืน Promise แล้ว React ถือว่าเป็น cleanup ผิดรูปจนหน้าพัง
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  const link = ({ isActive }: { isActive: boolean }) =>
    cn('inline-flex min-h-11 items-center rounded-control px-3 text-[15px] font-medium transition-colors', isActive ? 'bg-brand-soft text-brand' : 'text-ink-muted hover:text-ink');
  return (
    <div className="flex min-h-dvh flex-col pb-[calc(var(--bottom-nav-height)+env(safe-area-inset-bottom))] md:pb-0">
      <DemoBanner />
      <header className="no-print sticky top-0 z-20 border-b-2 border-gold bg-surface/95 pt-[env(safe-area-inset-top)] backdrop-blur md:static md:bg-surface">
        <div className="mx-auto flex min-h-14 max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-1.5 md:py-2">
          <Brand to="/" subtitle="รับสมัครนักเรียน นักศึกษาออนไลน์" />
          <nav aria-label="เมนูหลัก" className="hidden gap-1 md:flex">
            <NavLink to="/apply" className={link}>สมัครเรียน</NavLink>
            <NavLink to="/status" className={link}>ตรวจสถานะ / พิมพ์ใบสมัคร</NavLink>
          </nav>
        </div>
      </header>
      <main className="flex-1"><Outlet /></main>
      <footer className="no-print border-t border-line bg-surface">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-4 text-sm text-ink-muted">
          <p>วิทยาลัยเทคนิคท่าหลวงซิเมนต์ไทยอนุสรณ์ · สังกัดสำนักงานคณะกรรมการการอาชีวศึกษา</p>
          <div className="flex flex-wrap items-center gap-1">
            <InstallApp />
            <Link to="/staff" className="inline-flex min-h-11 items-center px-3 underline hover:text-brand">สำหรับเจ้าหน้าที่</Link>
          </div>
        </div>
      </footer>
      <BottomNav
        label="เมนูหลัก (มือถือ)"
        left={[{ to: '/', label: 'หน้าแรก', icon: Home, end: true }]}
        center={{ to: '/apply', label: 'สมัครเรียน', icon: PencilLine }}
        right={[{ to: '/status', label: 'ตรวจสถานะ', icon: FileSearch }]}
      />
    </div>
  );
}

function StaffLayout() {
  const { token, staff, applicants, loading, logout, error } = useStaff();
  if (!token) return <><DemoBanner /><LoginPage /></>;
  if (loading || !staff) {
    return error ? <p className="p-8 text-center text-danger">{error}</p> : <Loading label="กำลังโหลดข้อมูลผู้สมัคร" />;
  }
  const admin = staff.role === 'admin';
  const pending = applicants.filter((a) => a.status === 'submitted').length;
  const link = ({ isActive }: { isActive: boolean }) =>
    cn('inline-flex min-h-11 items-center gap-2 rounded-control px-3 text-[15px] font-medium transition-colors', isActive ? 'bg-ink-inverse/15 text-ink-inverse' : 'text-ink-inverse/75 hover:text-ink-inverse');
  const more: MobileNavItem[] = [
    ...(admin ? [
      { to: '/staff/programs', label: 'ประเภทวิชา/สาขา และจำนวนรับ', icon: Layers },
      { to: '/staff/announcements', label: 'ประกาศ', icon: Megaphone },
      { to: '/staff/users', label: 'จัดการผู้ใช้', icon: UserCog },
      { to: '/staff/settings', label: 'ตั้งค่าการรับสมัคร', icon: SettingsIcon },
    ] : []),
    { to: '/staff/account', label: 'บัญชีของฉัน / เปลี่ยนรหัสผ่าน', icon: KeyRound },
    { to: '/', label: 'หน้าเว็บผู้สมัคร', icon: ExternalLink, end: true },
  ];
  const initial = initialOf(staff.displayName);
  return (
    <div className="flex min-h-dvh flex-col">
      <DemoBanner />
      {/* มือถือ: แถบบนสีอ่อนแบบระบบจองห้องประชุม (ชื่อระบบ + ปุ่มบัญชี) เมนูอยู่แถบล่าง */}
      <header className="no-print sticky top-0 z-20 border-b border-line bg-surface/95 pt-[env(safe-area-inset-top)] backdrop-blur md:hidden">
        <div className="flex min-h-14 items-center gap-2.5 px-4">
          <Link to="/staff" className="flex min-w-0 flex-1 items-center gap-2.5">
            <img src={`${import.meta.env.BASE_URL}college-logo.png`} alt="" className="size-9 shrink-0 rounded-full bg-surface ring-1 ring-line" />
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-ink">งานรับสมัครเรียน</span>
              <span className="block truncate text-xs text-ink-muted">วท.ท่าหลวงซิเมนต์ไทยอนุสรณ์</span>
            </span>
          </Link>
          <Link to="/staff/account" aria-label={`บัญชีของฉัน: ${staff.displayName}`} className="grid size-11 shrink-0 place-items-center rounded-control">
            <span aria-hidden="true" className="grid size-8 place-items-center rounded-full bg-brand-soft text-sm font-semibold text-brand">{initial}</span>
          </Link>
        </div>
      </header>
      <header className="no-print hidden bg-brand-deep text-ink-inverse md:block">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2">
          <Link to="/staff" className="flex min-h-11 items-center gap-3">
            <img src={`${import.meta.env.BASE_URL}college-logo.png`} alt="" className="size-10 rounded-full bg-surface p-0.5" />
            <span className="font-semibold">งานรับสมัคร</span>
          </Link>
          <nav aria-label="เมนูเจ้าหน้าที่" className="flex flex-1 flex-wrap gap-1">
            <NavLink end to="/staff" className={link}><BarChart3 className="size-4" aria-hidden="true" />ภาพรวม</NavLink>
            <NavLink to="/staff/applicants" className={link}><Users className="size-4" aria-hidden="true" />ผู้สมัคร</NavLink>
            <NavLink to="/staff/qr" className={link}><QrCode className="size-4" aria-hidden="true" />QR Code</NavLink>
            {admin && (
              <>
                <NavLink to="/staff/programs" className={link}><Layers className="size-4" aria-hidden="true" />ประเภทวิชา/สาขา</NavLink>
                <NavLink to="/staff/announcements" className={link}><Megaphone className="size-4" aria-hidden="true" />ประกาศ</NavLink>
                <NavLink to="/staff/users" className={link}><UserCog className="size-4" aria-hidden="true" />ผู้ใช้</NavLink>
                <NavLink to="/staff/settings" className={link}><SettingsIcon className="size-4" aria-hidden="true" />ตั้งค่า</NavLink>
              </>
            )}
          </nav>
          <div className="flex items-center gap-1 text-sm">
            <Link to="/" title="หน้าเว็บผู้สมัคร" aria-label="หน้าเว็บผู้สมัคร" className="inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-control px-3 text-ink-inverse/80 hover:bg-ink-inverse/10 hover:text-ink-inverse">
              <ExternalLink className="size-4" aria-hidden="true" /><span className="hidden 2xl:inline">หน้าเว็บผู้สมัคร</span>
            </Link>
            <Link to="/staff/account" title="บัญชีของฉัน / เปลี่ยนรหัสผ่าน" className="inline-flex min-h-11 max-w-44 items-center gap-1.5 rounded-control px-3 text-ink-inverse/80 hover:bg-ink-inverse/10 hover:text-ink-inverse">
              <KeyRound className="size-4 shrink-0" aria-hidden="true" /><span className="truncate">{staff.displayName}</span>
            </Link>
            <button type="button" onClick={logout} className="inline-flex min-h-11 items-center gap-1.5 rounded-control px-3 text-ink-inverse/80 hover:bg-ink-inverse/10 hover:text-ink-inverse">
              <LogOut className="size-4" aria-hidden="true" />ออกจากระบบ
            </button>
          </div>
        </div>
      </header>
      {/* เว้นที่ด้านล่างเท่าแถบเมนู + ขอบ iPhone บรรทัดสุดท้ายจะไม่ถูกบัง */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-[calc(var(--bottom-nav-height)+env(safe-area-inset-bottom)+1.5rem)] pt-4 md:py-6">
        {error && <p className="no-print mb-4 rounded-control bg-danger-soft px-4 py-2 text-danger">{error}</p>}
        <Outlet />
      </main>
      <BottomNav
        label="เมนูเจ้าหน้าที่ (มือถือ)"
        left={[
          { to: '/staff', label: 'ภาพรวม', icon: BarChart3, end: true },
          { to: '/staff/applicants', label: 'ผู้สมัคร', icon: Users },
        ]}
        center={{ to: '/staff/applicants?status=submitted', label: 'รอตรวจ', icon: ClipboardCheck, badge: pending }}
        right={[{ to: '/staff/qr', label: 'QR Code', icon: QrCode }]}
        more={more}
        moreFooter={
          <>
            <InstallApp variant="sheet" />
            <button type="button" onClick={logout} className={cn(sheetRowClass, 'text-danger')}>
              <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-xl bg-danger-soft text-danger"><LogOut className="size-5" /></span>ออกจากระบบ
            </button>
          </>
        }
      />
    </div>
  );
}

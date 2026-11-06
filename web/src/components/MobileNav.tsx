import { useCallback, useEffect, useRef, useState, type ComponentType, type ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronRight, LayoutGrid } from 'lucide-react';
import { cn } from './ui';

/** แบบเดียวกับระบบจองห้องประชุม: แถบล่าง 3–5 ช่อง ปุ่มงานหลักนูนอยู่ตรงกลาง ที่นิ้วโป้งเอื้อมถึงง่ายที่สุด */

type Icon = ComponentType<{ className?: string }>;
export interface MobileNavItem { to: string; label: string; icon: Icon; end?: boolean; badge?: number }

function Badge({ count, className }: { count: number; className?: string }) {
  return (
    <span aria-hidden="true" className={cn('grid h-[18px] min-w-[18px] place-items-center rounded-full bg-danger px-1 text-[11px] font-semibold leading-none text-ink-inverse ring-2 ring-surface', className)}>
      {count > 99 ? '99+' : count}
    </span>
  );
}

function BarLink({ item }: { item: MobileNavItem }) {
  return (
    <NavLink to={item.to} end={item.end ?? false}
      className={({ isActive }) => cn('flex flex-1 flex-col items-center justify-center gap-1 text-xs font-medium transition-colors duration-150',
        isActive ? 'text-brand' : 'text-ink-muted active:text-ink')}>
      {({ isActive }) => (
        <>
          <span aria-hidden="true" className={cn('relative grid h-7 w-12 place-items-center rounded-full transition-colors duration-150', isActive && 'bg-brand-soft')}>
            <item.icon className="size-5" />
            {item.badge ? <Badge count={item.badge} className="absolute -right-0.5 -top-1" /> : null}
          </span>
          {item.label}
          {item.badge ? <span className="sr-only">{` (${item.badge} รายการ)`}</span> : null}
        </>
      )}
    </NavLink>
  );
}

function CenterLink({ item }: { item: MobileNavItem }) {
  return (
    <NavLink to={item.to} end={item.end ?? false} className="group flex flex-1 flex-col items-center justify-end gap-1 pb-2 text-xs font-semibold text-brand">
      <span aria-hidden="true" className="relative -mt-5 grid size-12 place-items-center rounded-full bg-brand-gradient text-ink-inverse shadow-brand ring-4 ring-surface transition-transform duration-150 group-active:scale-95">
        <item.icon className="size-6" />
        {item.badge ? <Badge count={item.badge} className="absolute -right-1 -top-1" /> : null}
      </span>
      {item.label}
      {item.badge ? <span className="sr-only">{` (${item.badge} รายการ)`}</span> : null}
    </NavLink>
  );
}

/**
 * แถบเมนูด้านล่าง (ซ่อนบนจอคอม) — left/right ข้างละไม่เกิน 2 ช่อง + ปุ่มกลาง
 * ส่ง more มาด้วย = ช่องขวาสุดเป็น "เพิ่มเติม" เปิดแผ่นเมนูจากด้านล่าง
 */
export function BottomNav({ left, center, right = [], more, moreFooter, label = 'เมนูด้านล่าง' }: {
  left: MobileNavItem[]; center: MobileNavItem; right?: MobileNavItem[];
  more?: MobileNavItem[]; moreFooter?: ReactNode; label?: string;
}) {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  useEffect(() => { setOpen(false); }, [pathname]);
  const moreActive = more?.some((item) => (item.end ? pathname === item.to : pathname.startsWith(item.to))) ?? false;
  const moreBadge = more?.reduce((sum, item) => sum + (item.badge ?? 0), 0) ?? 0;
  const slots = left.length + 1 + right.length + (more ? 1 : 0);

  return (
    <>
      <nav aria-label={label} className="no-print fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
        <ul className="mx-auto grid h-[var(--bottom-nav-height)] max-w-lg" style={{ gridTemplateColumns: `repeat(${slots}, minmax(0, 1fr))` }}>
          {left.map((item) => <li key={item.to} className="flex"><BarLink item={item} /></li>)}
          <li className="flex"><CenterLink item={center} /></li>
          {right.map((item) => <li key={item.to} className="flex"><BarLink item={item} /></li>)}
          {more && (
            <li className="flex">
              <button type="button" onClick={() => setOpen(true)} aria-haspopup="dialog" aria-expanded={open}
                className={cn('flex flex-1 flex-col items-center justify-center gap-1 text-xs font-medium transition-colors duration-150',
                  moreActive || open ? 'text-brand' : 'text-ink-muted active:text-ink')}>
                <span aria-hidden="true" className={cn('relative grid h-7 w-12 place-items-center rounded-full transition-colors duration-150', (moreActive || open) && 'bg-brand-soft')}>
                  <LayoutGrid className="size-5" />
                  {moreBadge > 0 && <Badge count={moreBadge} className="absolute -right-0.5 -top-1" />}
                </span>
                เพิ่มเติม
              </button>
            </li>
          )}
        </ul>
      </nav>
      {open && more && <MoreSheet items={more} footer={moreFooter} onClose={close} />}
    </>
  );
}

/** แผ่นเมนูเลื่อนขึ้นจากด้านล่าง — โฟกัสอยู่ในแผ่น กด Esc/แตะพื้นหลังเพื่อปิด แล้วคืนโฟกัสให้ปุ่มเดิม */
function MoreSheet({ items, footer, onClose }: { items: MobileNavItem[]; footer?: ReactNode; onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const trigger = document.activeElement as HTMLElement | null;
    panelRef.current?.querySelector<HTMLElement>('a')?.focus();
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      trigger?.focus();
    };
  }, [onClose]);

  return (
    <div className="no-print fixed inset-0 z-40 md:hidden">
      <button type="button" aria-label="ปิดเมนูเพิ่มเติม" onClick={onClose} className="fade-in absolute inset-0 bg-ink/40" />
      <div ref={panelRef} role="dialog" aria-modal="true" aria-labelledby="more-sheet-title"
        className="sheet-up absolute inset-x-0 bottom-0 max-h-[85dvh] overflow-y-auto rounded-t-3xl bg-surface px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3 shadow-overlay">
        <span aria-hidden="true" className="mx-auto mb-3 block h-1.5 w-10 rounded-full bg-line-strong" />
        <h2 id="more-sheet-title" className="px-2 pb-2 text-base font-semibold text-ink">เมนูเพิ่มเติม</h2>
        <ul className="space-y-1">
          {items.map((item) => (
            <li key={item.to}>
              <NavLink to={item.to} end={item.end ?? false} onClick={onClose}
                className={({ isActive }) => cn('flex min-h-14 items-center gap-3 rounded-2xl px-3 text-[15px] font-medium transition-colors duration-150',
                  isActive ? 'bg-brand-soft text-brand' : 'text-ink active:bg-sunken')}>
                <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand"><item.icon className="size-5" /></span>
                <span className="flex-1">{item.label}</span>
                {item.badge ? <Badge count={item.badge} /> : null}
                <ChevronRight className="size-4 text-ink-muted" aria-hidden="true" />
              </NavLink>
            </li>
          ))}
        </ul>
        {footer && <div className="mt-2 space-y-1 border-t border-line pt-2">{footer}</div>}
      </div>
    </div>
  );
}

/** แถวในแผ่นเมนูสำหรับปุ่มที่ไม่ใช่ลิงก์ (ติดตั้งแอป ออกจากระบบ) — หน้าตาเดียวกับแถวเมนู */
export const sheetRowClass = 'flex min-h-14 w-full items-center gap-3 rounded-2xl px-3 text-left text-[15px] font-medium transition-colors duration-150 active:bg-sunken';
export const sheetIconClass = 'grid size-10 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand';

import { Megaphone } from 'lucide-react';
import { AnnouncementCard } from '../components/AnnouncementCard';
import { Alert, Loading } from '../components/ui';
import { useHome } from '../lib/publicData';

/** ประกาศทั้งหมดที่เผยแพร่ — ปักหมุดขึ้นก่อน แล้วใหม่ไปเก่า โปสเตอร์แสดงใหญ่กว่าหน้าแรก */
export function NewsPage() {
  const { home, error } = useHome();
  if (!home) return error ? <div className="mx-auto max-w-3xl px-4 py-10"><Alert tone="danger">{error}</Alert></div> : <Loading label="กำลังโหลดประกาศ" />;
  const list = home.announcements;
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="flex items-center gap-2 text-3xl font-bold text-brand-deep"><Megaphone className="size-7 text-brand" aria-hidden="true" />ประกาศ</h1>
      <p className="mt-1 text-ink-muted">ข่าวการรับสมัคร กำหนดการ และโปสเตอร์ประชาสัมพันธ์ของวิทยาลัย แตะที่โปสเตอร์เพื่อดูภาพใหญ่</p>
      {list.length === 0
        ? <p className="mt-6 rounded-card bg-surface px-4 py-12 text-center text-ink-muted ring-1 ring-line">ยังไม่มีประกาศ</p>
        : (
          <ul className="mt-6 space-y-4">
            {list.map((item) => <li key={item.id}><AnnouncementCard item={item} posterMaxHeight="42rem" /></li>)}
          </ul>
        )}
    </div>
  );
}

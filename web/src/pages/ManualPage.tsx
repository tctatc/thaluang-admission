import { BookOpen } from 'lucide-react';
import { APPLICANT_GUIDE, Guide } from '../components/Guide';
import { ManualPanel } from '../components/ManualPanel';
import { useHome } from '../lib/publicData';

/** คู่มือการใช้งานสำหรับผู้สมัคร: ไฟล์ PDF (ถ้าวิทยาลัยอัปโหลดไว้) + วิธีใช้แบบย่อ */
export function ManualPage() {
  const { home } = useHome();
  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <div>
        <h1 className="flex items-center gap-2 text-3xl font-bold text-brand-deep"><BookOpen className="size-7 text-brand" aria-hidden="true" />คู่มือการใช้งาน</h1>
        <p className="mt-1 text-ink-muted">วิธีสมัครเรียนออนไลน์ ตรวจสถานะ และแนบเอกสาร</p>
      </div>
      <ManualPanel kind="applicant" info={home?.manual ?? null} />
      <Guide title="วิธีใช้งานแบบย่อ" topics={APPLICANT_GUIDE} />
    </div>
  );
}

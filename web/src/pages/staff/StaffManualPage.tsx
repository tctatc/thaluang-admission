import { useStaff } from '../../app/staff';
import { Guide, STAFF_GUIDE } from '../../components/Guide';
import { ManualPanel } from '../../components/ManualPanel';

/** คู่มือเจ้าหน้าที่ — ทุกคนอ่านได้ ผู้ดูแลระบบจัดการไฟล์คู่มือทั้งสองฉบับได้ที่หน้านี้ */
export function StaffManualPage() {
  const { staff, token, manuals, setManuals } = useStaff();
  const manage = staff?.role === 'admin' ? { token, onChange: setManuals } : undefined;
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-deep">คู่มือการใช้งาน</h1>
        <p className="text-sm text-ink-muted">
          {manage ? 'อัปโหลดไฟล์ PDF หรือรูป แยกฉบับผู้สมัครกับเจ้าหน้าที่ ฉบับผู้สมัครขึ้นที่เมนู "คู่มือ" บนหน้าเว็บผู้สมัคร' : 'คู่มือและวิธีใช้งานระบบสำหรับเจ้าหน้าที่'}
        </p>
      </div>
      <ManualPanel kind="staff" info={manuals.staff} {...(manage ? { manage } : {})} />
      {manage && <ManualPanel kind="applicant" info={manuals.applicant} manage={manage} />}
      <Guide title="วิธีใช้งานแบบย่อสำหรับเจ้าหน้าที่" topics={STAFF_GUIDE} />
    </div>
  );
}

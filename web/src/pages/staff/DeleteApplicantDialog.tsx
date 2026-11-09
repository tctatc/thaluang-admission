import { useState, type FormEvent } from 'react';
import { Trash2 } from 'lucide-react';
import { fullName, type Applicant } from '@shared/model';
import { useStaff } from '../../app/staff';
import { Dialog } from '../../components/Dialog';
import { Alert, Button, TextField } from '../../components/ui';
import { api, errorMessage } from '../../lib/api';

/**
 * ลบใบสมัคร — ย้อนกลับเองไม่ได้ จึงให้พิมพ์เลขที่ใบสมัครยืนยัน (กันกดผิดแถว)
 * ข้อมูลยังกู้จากไฟล์สำรองรายวัน และเอกสารยังอยู่ในถังขยะ Drive 30 วัน
 */
export function DeleteApplicantDialog({ applicant, onClose, onDeleted }: { applicant: Applicant; onClose: () => void; onDeleted: () => void }) {
  const { token, removeApplicant } = useStaff();
  const [typed, setTyped] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const matches = typed.trim().toUpperCase() === applicant.appNo;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!matches) return;
    setBusy(true);
    setError('');
    try {
      await api.deleteApplicant(token, applicant.id, typed);
      removeApplicant(applicant.id);
      onDeleted();
    } catch (cause) {
      setError(errorMessage(cause));
      setBusy(false);
    }
  };

  return (
    <Dialog title={`ลบใบสมัคร ${applicant.appNo}?`} onClose={onClose}
      description={`${fullName(applicant)} เอกสารที่แนบไว้ถูกย้ายลงถังขยะ Google Drive ด้วย`}
      footer={<>
        <Button variant="secondary" onClick={onClose} data-autofocus>ยกเลิก</Button>
        <Button variant="danger" type="submit" form="delete-applicant" disabled={!matches} loading={busy} icon={<Trash2 className="size-4" aria-hidden="true" />}>ลบใบสมัคร</Button>
      </>}>
      <form id="delete-applicant" onSubmit={submit} className="space-y-3" noValidate>
        <p>ลบแล้วผู้สมัครตรวจสถานะไม่ได้ และต้องสมัครใหม่ ถ้าแค่ไม่ผ่านการคัดเลือก ให้เปลี่ยนสถานะแทนการลบ</p>
        <TextField label={`พิมพ์ ${applicant.appNo} เพื่อยืนยัน`} value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" autoCapitalize="characters" spellCheck={false} />
        {error && <Alert tone="danger">{error}</Alert>}
      </form>
    </Dialog>
  );
}

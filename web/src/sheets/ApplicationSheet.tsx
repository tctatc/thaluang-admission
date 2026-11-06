import type { ApplicationInput, Program } from '@shared/model';
import { programName } from '@shared/model';
import { THAI_MONTHS, bangkokDateParts, parseIsoDate } from '@shared/thai';
import { Box, Fill, Row } from './parts';

export interface ApplicationSheetData extends ApplicationInput {
  /** เวลาที่ส่งใบสมัคร — ยังไม่ส่ง (กำลังกรอก) ปล่อยว่าง ช่องวันที่ท้ายใบจะว่างไว้ */
  createdAt?: string;
}

const formatPhone = (phone: string) => (/^\d{10}$/.test(phone) ? `${phone.slice(0, 3)}-${phone.slice(3, 6)}-${phone.slice(6)}` : phone);

/**
 * ใบสมัครเข้ารับคัดเลือกเพื่อศึกษาต่อเป็นกรณีพิเศษ (โควตา)
 *
 * วางทุกบรรทัดตามตำแหน่งที่วัดจากไฟล์สแกนต้นฉบับ (A4 210×297 mm) ตัวเลขทั้งแผ่นเป็นเลขอารบิกตามข้อกำหนดของระบบ
 * ช่องลงชื่อพิมพ์ชื่อผู้สมัครให้เมื่อส่งใบสมัครแล้ว (ผู้สมัครเซ็นทับได้ตอนยื่น)
 */
export function ApplicationSheet({ data, programs, academicYear, photo }: {
  data: ApplicationSheetData;
  programs: readonly Program[];
  academicYear: number;
  photo?: string | undefined;
}) {
  const birth = parseIsoDate(data.birthDate);
  const signed = data.createdAt ? bangkokDateParts(data.createdAt) : null;
  const name = `${data.prefix}${data.firstName}${data.lastName ? ` ${data.lastName}` : ''}`.trim();
  const isPvc = data.level === 'pvc';

  return (
    <article className="sheet" aria-label="ใบสมัครเข้ารับคัดเลือกเพื่อศึกษาต่อเป็นกรณีพิเศษ (โควตา)">
      <img src={`${import.meta.env.BASE_URL}ovec-seal.png`} alt="ตราสำนักงานคณะกรรมการการอาชีวศึกษา" className="absolute" style={{ left: '9.5mm', top: '18.5mm', width: '26mm', height: '26mm' }} />

      <div className="absolute grid place-items-center border border-black text-center" style={{ left: '177mm', top: '13mm', width: '28.5mm', height: '28.5mm' }}>
        {photo ? (
          <img src={photo} alt="รูปถ่ายผู้สมัคร" className="h-full w-full object-cover" />
        ) : (
          <p className="self-start pt-[9mm] text-[11pt] leading-[1.35]">รูปถ่าย<br />ขนาด 1 นิ้ว</p>
        )}
      </div>

      <h1 className="absolute text-center text-[14.5pt] font-bold" style={{ left: '40mm', right: '28mm', top: '31mm' }}>
        ใบสมัครเข้ารับคัดเลือกเพื่อศึกษาต่อเป็นกรณีพิเศษ <span className="underline underline-offset-[1.2mm]">(โควตา)</span>
      </h1>
      <p className="absolute text-center text-[14.5pt] font-bold" style={{ left: '30mm', right: '18mm', top: '40.2mm' }}>
        วิทยาลัยเทคนิคท่าหลวงซิเมนต์ไทยอนุสรณ์ ประจำปีการศึกษา {academicYear}
      </p>

      {([['pvs_direct', 'ระดับ ปวส. ( สายตรง )', 59.5], ['pvs_cross', 'ระดับ ปวส. ( ม.6/ปวช. ต่างสาขา )', 68.3], ['pvc', 'ระดับ ปวช.', 77.1]] as const).map(([level, label, y]) => (
        <Row key={level} y={y} x={76.5} right={null} style={{ gap: '3mm' }}>
          <Box checked={data.level === level} />
          <span className="font-bold">{label}</span>
        </Row>
      ))}

      <Row y={93} x={18.5}>
        <span>1.&nbsp; ชื่อ-นามสกุล</span><Fill w={64} left>{name}</Fill>
        <span>เกิดวันที่</span><Fill w={13}>{birth ? String(birth.day) : ''}</Fill>
        <span>เดือน</span><Fill w={24}>{birth ? THAI_MONTHS[birth.month - 1] : ''}</Fill>
        <span>พ.ศ.</span><Fill grow>{birth ? String(birth.year + 543) : ''}</Fill>
      </Row>
      <Row y={101.8} x={18.5}>
        <span>2.&nbsp; ชื่อ-สกุลบิดา</span><Fill w={78} left>{data.fatherName}</Fill>
        <span>อายุ</span><Fill w={14}>{data.fatherAge}</Fill>
        <span>ปี&nbsp; อาชีพ</span><Fill grow>{data.fatherJob}</Fill>
      </Row>
      <Row y={110.5} x={18.5}>
        <span>3.&nbsp; ชื่อ-สกุลมารดา</span><Fill w={75} left>{data.motherName}</Fill>
        <span>อายุ</span><Fill w={14}>{data.motherAge}</Fill>
        <span>ปี&nbsp; อาชีพ</span><Fill grow>{data.motherJob}</Fill>
      </Row>
      <Row y={119.5} x={18.5}>
        <span>4.&nbsp; ที่อยู่ปัจจุบันที่สามารถติดต่อได้&nbsp;&nbsp; บ้านเลขที่</span><Fill w={15}>{data.houseNo}</Fill>
        <span>หมู่</span><Fill w={13}>{data.moo}</Fill>
        <span>ซอย</span><Fill w={22}>{data.soi}</Fill>
        <span>ถนน</span><Fill grow>{data.road}</Fill>
      </Row>
      <Row y={128.3} x={28.5}>
        <span>ตำบล</span><Fill w={48}>{data.subdistrict}</Fill>
        <span>อำเภอ</span><Fill w={47}>{data.district}</Fill>
        <span>จังหวัด</span><Fill grow>{data.province}</Fill>
      </Row>
      <Row y={137.3} x={28.5} right={60}>
        <span>รหัสไปรษณีย์</span><Fill w={25}>{data.postcode}</Fill>
        <span>หมายเลขโทรศัพท์</span><Fill grow>{formatPhone(data.phone)}</Fill>
      </Row>
      <Row y={146} x={18.5}>
        <span>5.&nbsp; กำลังศึกษาอยู่ในระดับชั้น</span><Fill w={22}>{data.currentLevel}</Fill>
        <span>โรงเรียน</span><Fill grow>{data.schoolName}</Fill>
      </Row>
      <Row y={155} x={28.5}>
        <span>ตั้งอยู่เลขที่</span><Fill w={20}>{data.schoolAddressNo}</Fill>
        <span>ตำบล</span><Fill w={28}>{data.schoolSubdistrict}</Fill>
        <span>อำเภอ</span><Fill w={28}>{data.schoolDistrict}</Fill>
        <span>จังหวัด</span><Fill grow>{data.schoolProvince}</Fill>
      </Row>
      <Row y={163.9} x={28.5}>
        <span>ผลการเรียนเฉลี่ยสะสม</span><Fill w={46}>{data.gpa}</Fill>
        <span>สาขาวิชา</span><Fill grow>{data.currentMajor}</Fill>
      </Row>
      <Row y={172.9} x={18.5}>
        <span>6.&nbsp; ต้องการสมัครเข้าเรียน&nbsp; ระดับ&nbsp; ปวส.&nbsp; สาขาวิชา</span><Fill grow>{isPvc ? '' : programName(programs, data.programPvs)}</Fill>
      </Row>
      <Row y={181.6} x={61.5}>
        <span>ระดับ&nbsp; ปวช.&nbsp; สาขาวิชาลำดับที่ 1.</span><Fill grow>{isPvc ? programName(programs, data.programPvc1) : ''}</Fill>
      </Row>
      <Row y={190.4} x={82}>
        <span>สาขาวิชาลำดับที่ 2.</span><Fill grow>{isPvc ? programName(programs, data.programPvc2) : ''}</Fill>
      </Row>

      <Row y={200.8} x={26.5} right={null}>
        <span>หลักฐานประกอบการสมัคร&nbsp;&nbsp;&nbsp; 1. เอกสารแสดงผลการเรียนเฉลี่ยสะสม 5 ภาคเรียน&nbsp; จำนวน 1 ฉบับ</span>
      </Row>
      <Row y={209.6} x={70.4} right={null}>
        <span>2. สำเนาบัตรประชาชน / สำเนาทะเบียนบ้าน&nbsp; จำนวน 1 ฉบับ</span>
      </Row>
      <Row y={218.5} x={70.4} right={null}>
        <span>3. สำเนาเกียรติบัตร/ใบรับรองความสามารถพิเศษ/ใบประกาศ (ถ้ามี)</span>
      </Row>

      <Row y={242.8} x={110} right={22}>
        <span>ลงชื่อ</span><Fill grow>{data.createdAt ? name : ''}</Fill>
        <span>ผู้สมัคร</span>
      </Row>
      <Row y={251.6} x={115.5} right={28}>
        <span>(</span><Fill grow>{data.createdAt ? name : ''}</Fill><span>)</span>
      </Row>
      <Row y={260.3} x={110} right={12}>
        <span>วันที่</span><Fill w={11}>{signed ? String(signed.day) : ''}</Fill>
        <span>เดือน</span><Fill w={25}>{signed ? THAI_MONTHS[signed.month - 1] : ''}</Fill>
        <span>พ.ศ.</span><Fill grow>{signed ? String(signed.year + 543) : ''}</Fill>
      </Row>
    </article>
  );
}

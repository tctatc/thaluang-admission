import type { ReactNode } from 'react';
import { LEVEL_LABEL, programName, type Applicant, type Level, type Program } from '@shared/model';
import { THAI_MONTHS, parseIsoDate, thaiLongDate, toThaiDigits } from '@shared/thai';
import { Fill } from './parts';

/**
 * ใบมอบตัว — แบบทั่วไปชั่วคราว ระหว่างรอแบบฟอร์มต้นฉบับของวิทยาลัย
 * ใช้ตัวอักษรและเส้นประชุดเดียวกับใบสมัคร เมื่อได้ต้นฉบับจะทำแผ่นใหม่แบบวัดตำแหน่งเหมือนใบสมัคร
 */

function Line({ children, indent = 0 }: { children: ReactNode; indent?: number }) {
  return <p className="flex items-baseline gap-x-[1.2mm] whitespace-nowrap" style={{ paddingLeft: `${indent}mm`, height: '8.6mm' }}>{children}</p>;
}

function Heading({ children }: { children: ReactNode }) {
  return <h2 className="mt-[2.5mm] mb-[0.5mm] text-[13pt] font-bold">{children}</h2>;
}

const formatPhone = (phone: string) => (/^\d{10}$/.test(phone) ? `${phone.slice(0, 3)}-${phone.slice(3, 6)}-${phone.slice(6)}` : phone);

export function EnrollmentSheet({ applicant, programs, photo }: { applicant: Applicant; programs: readonly Program[]; photo?: string }) {
  const e = applicant.enrollment;
  const birth = parseIsoDate(applicant.birthDate);
  const enrolled = e ? parseIsoDate(e.enrolledDate) : null;
  const name = `${applicant.prefix}${applicant.firstName} ${applicant.lastName}`;
  const address = [applicant.houseNo, applicant.moo && `หมู่ ${applicant.moo}`, applicant.soi && `ซ.${applicant.soi}`, applicant.road && `ถ.${applicant.road}`, `ต.${applicant.subdistrict}`, `อ.${applicant.district}`, `จ.${applicant.province}`, applicant.postcode].filter(Boolean).join(' ');

  return (
    <article className="sheet" style={{ padding: '14mm 16mm 12mm 20mm' }} aria-label="ใบมอบตัวนักเรียน นักศึกษา">
      <div className="absolute grid place-items-center border border-black text-center" style={{ right: '14mm', top: '13mm', width: '25mm', height: '30mm' }}>
        {photo ? <img src={photo} alt="รูปถ่ายนักศึกษา" className="h-full w-full object-cover" /> : <p className="text-[11pt] leading-[1.35]">รูปถ่าย<br />ขนาด ๑ นิ้ว</p>}
      </div>
      <img src={`${import.meta.env.BASE_URL}college-logo.png`} alt="ตราวิทยาลัยเทคนิคท่าหลวงซิเมนต์ไทยอนุสรณ์" className="mx-auto" style={{ width: '22mm', height: '22mm' }} />
      <h1 className="mt-[2mm] px-[26mm] text-center text-[15pt] font-bold">ใบมอบตัวนักเรียน นักศึกษา</h1>
      <p className="mb-[2mm] px-[26mm] text-center text-[13.5pt] font-bold">วิทยาลัยเทคนิคท่าหลวงซิเมนต์ไทยอนุสรณ์ ปีการศึกษา {toThaiDigits(applicant.academicYear)}</p>

      <Line>
        <span className="ml-auto">รหัสนักศึกษา</span><Fill w={34}>{applicant.studentId}</Fill>
        <span>เลขที่ใบสมัคร</span><Fill w={24}>{applicant.appNo}</Fill>
      </Line>

      <Heading>๑. ข้อมูลนักศึกษา</Heading>
      <Line>ชื่อ-นามสกุล<Fill grow left>{name}</Fill>เลขประจำตัวประชาชน<Fill w={36}>{applicant.nationalId}</Fill></Line>
      <Line>
        เกิดวันที่<Fill w={12}>{birth ? String(birth.day) : ''}</Fill>เดือน<Fill w={26}>{birth ? THAI_MONTHS[birth.month - 1] : ''}</Fill>
        พ.ศ.<Fill w={16}>{birth ? String(birth.year + 543) : ''}</Fill>โทรศัพท์<Fill grow>{formatPhone(applicant.phone)}</Fill>
      </Line>
      <Line>ระดับ<Fill w={52}>{LEVEL_LABEL[applicant.level as Level] ?? ''}</Fill>สาขาวิชาที่รับเข้า<Fill grow>{e ? programName(programs, e.admittedProgram) : ''}</Fill></Line>
      <Line>ที่อยู่ปัจจุบัน<Fill grow left>{address}</Fill></Line>
      <Line>จบจาก / กำลังศึกษาที่<Fill grow left>{applicant.schoolName}</Fill>ระดับ<Fill w={18}>{applicant.currentLevel}</Fill>เกรดเฉลี่ย<Fill w={14}>{applicant.gpa}</Fill></Line>

      <Heading>๒. ข้อมูลบิดา มารดา</Heading>
      <Line>ชื่อ-สกุลบิดา<Fill grow left>{applicant.fatherName}</Fill>อายุ<Fill w={12}>{applicant.fatherAge}</Fill>ปี อาชีพ<Fill w={34}>{applicant.fatherJob}</Fill></Line>
      <Line>ชื่อ-สกุลมารดา<Fill grow left>{applicant.motherName}</Fill>อายุ<Fill w={12}>{applicant.motherAge}</Fill>ปี อาชีพ<Fill w={34}>{applicant.motherJob}</Fill></Line>

      <Heading>๓. ผู้ปกครอง (ผู้มอบตัว)</Heading>
      <Line>ชื่อ-สกุล<Fill grow left>{e?.guardianName}</Fill>เกี่ยวข้องเป็น<Fill w={30}>{e?.guardianRelation}</Fill></Line>
      <Line>อาชีพ<Fill w={55}>{e?.guardianJob}</Fill>โทรศัพท์<Fill grow>{e ? formatPhone(e.guardianPhone) : ''}</Fill></Line>
      <Line>ที่อยู่<Fill grow left>{e?.guardianAddress}</Fill></Line>

      <p className="mt-[3mm] indent-[12mm] leading-[1.6]">
        ข้าพเจ้าขอมอบตัวนักเรียน นักศึกษาผู้มีนามข้างต้นเข้าศึกษาในวิทยาลัยเทคนิคท่าหลวงซิเมนต์ไทยอนุสรณ์
        และรับรองว่าจะควบคุมดูแลให้นักเรียน นักศึกษาปฏิบัติตามระเบียบข้อบังคับของวิทยาลัยโดยเคร่งครัด
        หากนักเรียน นักศึกษาประพฤติผิดระเบียบ ข้าพเจ้ายินดีให้วิทยาลัยดำเนินการตามระเบียบ
      </p>

      <div className="mt-[6mm] grid grid-cols-2 gap-x-[8mm] gap-y-[7mm]">
        {[
          { title: 'ผู้ปกครอง', name: e?.guardianName ?? '' },
          { title: 'นักเรียน นักศึกษา', name },
          { title: 'พยาน', name: e?.witnessName ?? '', position: e?.witnessPosition },
          { title: 'เจ้าหน้าที่ผู้รับมอบตัว', name: '' },
        ].map((sign) => (
          <div key={sign.title} className="text-center">
            <p className="flex items-baseline justify-center gap-x-[1.2mm] whitespace-nowrap">ลงชื่อ<Fill w={40} />{sign.title}</p>
            <p className="mt-[1.5mm] flex items-baseline justify-center">(<Fill w={48}>{sign.name}</Fill>)</p>
            {sign.position ? <p className="text-[11pt]">{sign.position}</p> : null}
          </div>
        ))}
      </div>

      <p className="absolute text-[11pt]" style={{ left: '20mm', bottom: '12mm' }}>
        วันที่มอบตัว {enrolled ? thaiLongDate(enrolled) : '..................................'}
        {e?.note ? `  หมายเหตุ: ${e.note}` : ''}
      </p>
    </article>
  );
}

import { describe, expect, it } from 'vitest';
import { SAMPLE_PROGRAMS, DEFAULT_SETTINGS, type Applicant } from '../model';
import { isValidThaiId, normalizeInput, validateApplication } from '../validate';
import { checkStudentIdPattern, nextApplicationNo, nextStudentId } from '../numbering';
import { checkUpload } from '../files';
import {
  attachDocument, enroll, findByCredentials, publicView, reviewDocument, setStatus, submitApplication, type Ctx, type Repo,
} from '../service';
import { applicantToRow, parseSettings, rowToApplicant, APPLICANT_COLUMNS } from '../sheetRow';
import { exportTable, toCsv } from '../exportData';
import { computeStats } from '../stats';
import { buildXlsx, columnName, crc32 } from '../xlsx';
import { ageOn, parseIsoDate, toThaiDigits } from '../thai';

// เลขบัตรทดสอบที่ check digit ถูก (ไม่ใช่ของคนจริง)
const VALID_ID = '1101700207030';

const goodInput = {
  level: 'pvc', prefix: 'นาย', firstName: 'สมชาย', lastName: 'ใจดี', nationalId: '1-1017-00207-03-0',
  birthDate: '2011-05-14', phone: '081-234-5678', email: '',
  fatherName: 'นายสมศักดิ์ ใจดี', fatherAge: '45', fatherJob: 'รับจ้าง', motherName: '', motherAge: '', motherJob: '',
  houseNo: '12/3', moo: '4', soi: '', road: 'มิตรภาพ', subdistrict: 'ตาลเดี่ยว', district: 'แก่งคอย', province: 'สระบุรี', postcode: '18110',
  currentLevel: 'ม.3', schoolName: 'โรงเรียนแก่งคอย', schoolAddressNo: '', schoolSubdistrict: '', schoolDistrict: '', schoolProvince: 'สระบุรี',
  gpa: '3.25', currentMajor: '', programPvs: '11', programPvc1: '01', programPvc2: '04',
  channel: 'เพื่อน / รุ่นพี่', referrer: '', consent: 'yes',
};

function memoryRepo(): Repo & { items: Applicant[] } {
  const items: Applicant[] = [];
  return {
    items,
    list: () => items,
    insert: (a) => { items.push(a); },
    update: (a) => { const i = items.findIndex((x) => x.id === a.id); items[i] = a; },
  };
}

let seq = 0;
const ctx = (nowIso = '2026-11-06T03:00:00.000Z', actor = 'ทดสอบ'): Ctx => ({ nowIso, newId: () => `app_${++seq}`, actor });
const TODAY = { year: 2026, month: 11, day: 6 };

describe('ตรวจข้อมูล', () => {
  it('เลขบัตร 13 หลักตรวจ check digit', () => {
    expect(isValidThaiId(VALID_ID)).toBe(true);
    expect(isValidThaiId('1101700207031')).toBe(false);
    expect(isValidThaiId('110170020703')).toBe(false);
  });

  it('ข้อมูลครบผ่าน และล้างขีดในเลขบัตร/เบอร์โทร', () => {
    const input = normalizeInput(goodInput);
    expect(input.nationalId).toBe(VALID_ID);
    expect(input.phone).toBe('0812345678');
    expect(input.programPvs).toBe(''); // สมัคร ปวช. ไม่เก็บสาขา ปวส.
    expect(validateApplication(input, SAMPLE_PROGRAMS, TODAY)).toEqual([]);
  });

  it('รายงานช่องที่ผิดพร้อมชื่อช่อง', () => {
    const input = normalizeInput({ ...goodInput, phone: '08123', postcode: '181', gpa: '4.5', programPvc2: '01', consent: '' });
    const fields = validateApplication(input, SAMPLE_PROGRAMS, TODAY).map((issue) => issue.field);
    expect(fields).toEqual(expect.arrayContaining(['phone', 'postcode', 'gpa', 'programPvc2', 'consent']));
  });

  it('สาขาต้องตรงระดับที่สมัคร', () => {
    const input = normalizeInput({ ...goodInput, level: 'pvs_direct', programPvs: '01' });
    expect(validateApplication(input, SAMPLE_PROGRAMS, TODAY).map((i) => i.field)).toContain('programPvs');
  });

  it('วันที่ที่ไม่มีจริงไม่ผ่าน', () => {
    expect(parseIsoDate('2011-02-30')).toBeNull();
    expect(ageOn({ year: 2010, month: 11, day: 7 }, TODAY)).toBe(15);
  });

  it('ตัวเลขไทย', () => expect(toThaiDigits('2570')).toBe('๒๕๗๐'));
});

describe('ออกเลข', () => {
  it('เลขที่ใบสมัครต่อจากเลขสูงสุดของปี', () => {
    expect(nextApplicationNo([], 2570)).toBe('Q70-0001');
    expect(nextApplicationNo(['Q70-0001', 'Q70-0007', 'Q69-0100'], 2570)).toBe('Q70-0008');
  });

  it('รหัสนักศึกษานับแยกตามสาขาและระดับ', () => {
    const ctxPvc = { academicYear: 2570, track: 'pvc' as const, programCode: '01' };
    expect(nextStudentId('{YY}{L}{PP}{NNN}', ctxPvc, [])).toBe('70201001');
    expect(nextStudentId('{YY}{L}{PP}{NNN}', ctxPvc, ['70201001', '70201002', '70204009'])).toBe('70201003');
    expect(nextStudentId('{YYYY}-{NNNN}', ctxPvc, ['2570-0009'])).toBe('2570-0010');
  });

  it('รูปแบบรหัสผิดถูกปฏิเสธ', () => {
    expect(checkStudentIdPattern('{YY}{PP}')).not.toBe('');
    expect(checkStudentIdPattern('{YY}{X}{NNN}')).not.toBe('');
    expect(() => nextStudentId('{NN}', { academicYear: 2570, track: 'pvc', programCode: '01' }, ['99'])).toThrow();
  });
});

describe('ไฟล์แนบ', () => {
  it('ดูชนิดจากไบต์ ไม่ดูนามสกุล', () => {
    expect(checkUpload([0xff, 0xd8, 0xff, 0xe0], 1000, true).problem).toBe('');
    expect(checkUpload([0x25, 0x50, 0x44, 0x46], 1000, true).problem).not.toBe(''); // รูปถ่ายห้าม PDF
    expect(checkUpload([0x4d, 0x5a, 0x90, 0x00], 1000, false).problem).not.toBe(''); // exe
    expect(checkUpload([0x89, 0x50, 0x4e, 0x47], 6 * 1024 * 1024, false).problem).not.toBe('');
  });
});

describe('ขั้นตอนการรับสมัคร', () => {
  it('สมัคร → ขอแก้เอกสาร → ส่งใหม่ → ผ่าน → มอบตัว', () => {
    const repo = memoryRepo();
    const app = submitApplication(repo, DEFAULT_SETTINGS, SAMPLE_PROGRAMS, goodInput, ctx());
    expect(app.appNo).toBe('Q70-0001');
    expect(() => submitApplication(repo, DEFAULT_SETTINGS, SAMPLE_PROGRAMS, goodInput, ctx())).toThrow(/สมัคร.*ไปแล้ว/);

    expect(findByCredentials(repo, VALID_ID, '2011-05-15')).toBeNull();
    expect(findByCredentials(repo, '1-1017-00207-03-0', '2011-05-14')?.id).toBe(app.id);

    const file = { fileId: 'drive1', name: 'id.jpg', mime: 'image/jpeg', size: 100 };
    attachDocument(repo, app, 'idCard', file, ctx());
    let current = reviewDocument(repo, app.id, 'idCard', 'fix', 'ภาพไม่ชัด', ctx());
    expect(current.status).toBe('needs_fix');
    expect(publicView(current).documents.idCard).not.toHaveProperty('fileId');

    const { applicant: afterFix, replacedFileId } = attachDocument(repo, current, 'idCard', { ...file, fileId: 'drive2' }, ctx());
    expect(replacedFileId).toBe('drive1');
    expect(afterFix.status).toBe('submitted');

    current = reviewDocument(repo, app.id, 'idCard', 'ok', '', ctx());
    expect(() => attachDocument(repo, current, 'idCard', file, ctx())).toThrow(/ตรวจผ่านแล้ว/);

    expect(() => enroll(repo, DEFAULT_SETTINGS, SAMPLE_PROGRAMS, app.id, {}, ctx())).toThrow(/ผ่านการคัดเลือก/);
    setStatus(repo, app.id, 'passed', '', ctx());
    const enrollment = { guardianName: 'นายสมศักดิ์ ใจดี', guardianRelation: 'บิดา', guardianPhone: '0899999999', enrolledDate: '2027-03-20' };
    const enrolled = enroll(repo, DEFAULT_SETTINGS, SAMPLE_PROGRAMS, app.id, { ...enrollment, admittedProgram: '04' }, ctx());
    expect(enrolled.studentId).toBe('70204001');
    // แก้ข้อมูลมอบตัวซ้ำ รหัสเดิมต้องไม่เปลี่ยน
    expect(enroll(repo, DEFAULT_SETTINGS, SAMPLE_PROGRAMS, app.id, { ...enrollment, admittedProgram: '01' }, ctx()).studentId).toBe('70204001');
    expect(() => setStatus(repo, app.id, 'not_passed', '', ctx())).toThrow();
  });

  it('ปิดรับสมัครแล้วส่งไม่ได้', () => {
    expect(() => submitApplication(memoryRepo(), { ...DEFAULT_SETTINGS, applicationsOpen: false }, SAMPLE_PROGRAMS, goodInput, ctx())).toThrow(/ปิดรับ/);
  });
});

describe('ชีตและการส่งออก', () => {
  const repo = memoryRepo();
  const app = submitApplication(repo, DEFAULT_SETTINGS, SAMPLE_PROGRAMS, goodInput, ctx());

  it('แปลงแถวไปกลับได้ครบ แม้ลำดับคอลัมน์ในชีตถูกสลับ', () => {
    const header = [...APPLICANT_COLUMNS].reverse();
    const row = [...applicantToRow(app)].reverse();
    expect(rowToApplicant(header, row)).toEqual(app);
  });

  it('ค่าตั้งค่าที่ผิดใช้ค่าเริ่มต้น', () => {
    const { settings, problems } = parseSettings([['academicYear', 'ปีหน้า'], ['studentIdPattern', '{YY}'], ['applicationsOpen', 'FALSE']]);
    expect(settings.academicYear).toBe(2570);
    expect(settings.applicationsOpen).toBe(false);
    expect(problems).toHaveLength(2);
  });

  it('CSV กันสูตรแฝงและใส่ BOM', () => {
    const csv = toCsv(['ชื่อ'], [['=HYPERLINK("x")'], ['ก,ข']]);
    expect(csv.startsWith('﻿')).toBe(true);
    expect(csv).toContain(`"'=HYPERLINK(""x"")"`);
    expect(csv).toContain('"ก,ข"');
  });

  it('ส่งออกทะเบียนเอาเฉพาะผู้มอบตัว', () => {
    expect(exportTable(repo.items, SAMPLE_PROGRAMS, 'registry').rows).toHaveLength(0);
    const full = exportTable(repo.items, SAMPLE_PROGRAMS, 'full');
    expect(full.rows[0]).toContain(VALID_ID);
  });

  it('xlsx เป็น zip ที่ถูกต้อง', () => {
    const bytes = buildXlsx('ผู้สมัคร', ['เลขบัตร'], [['0812345678']]);
    expect([...bytes.slice(0, 4)]).toEqual([0x50, 0x4b, 0x03, 0x04]);
    expect(crc32(new TextEncoder().encode('123456789'))).toBe(0xcbf43926);
    expect(columnName(0)).toBe('A');
    expect(columnName(27)).toBe('AB');
  });

  it('สถิตินับตามปีการศึกษา', () => {
    const stats = computeStats(repo.items, SAMPLE_PROGRAMS, 2570, '2026-11-06T05:00:00.000Z');
    expect(stats.total).toBe(1);
    expect(stats.today).toBe(1);
    expect(stats.byProgram[0]).toEqual({ label: 'ปวช. ช่างยนต์', value: 1 });
    expect(stats.daily).toHaveLength(30);
  });
});

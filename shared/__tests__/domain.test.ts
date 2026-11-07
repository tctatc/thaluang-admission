import { describe, expect, it } from 'vitest';
import { SAMPLE_PROGRAMS, DEFAULT_SETTINGS, type Applicant } from '../model';
import { staffChangeProblem, validateStaffInput, normalizeStaffInput, type StaffAccount } from '../users';
import { checkNewPassword, isValidThaiId, normalizeInput, validateApplication } from '../validate';
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
    const input = normalizeInput({ ...goodInput, level: 'pvs_direct', programPvs: '18' });
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

describe('ยอดสรุปหน้าแรก', () => {
  it('นับตามสาขาอันดับ 1 แยกปี และไม่มีข้อมูลรายคน', async () => {
    const { computePublicStats } = await import('../stats');
    const repo = memoryRepo();
    submitApplication(repo, DEFAULT_SETTINGS, SAMPLE_PROGRAMS, goodInput, ctx());
    submitApplication(repo, { ...DEFAULT_SETTINGS, academicYear: 2569 }, SAMPLE_PROGRAMS, { ...goodInput, level: 'pvs_direct', programPvs: '13' }, ctx());
    const stats = computePublicStats(repo.items, SAMPLE_PROGRAMS, 2570, '2026-11-06T05:00:00.000Z');
    expect(stats.years.map((y) => y.year)).toEqual([2570, 2569]);
    const y70 = stats.years[0]!;
    expect(y70).toMatchObject({ total: 1, pvc: 1, pvs: 0 });
    expect(y70.programs[0]).toMatchObject({ track: 'pvc', code: '01', name: 'ช่างยนต์', department: 'อุตสาหกรรม', quota: 20, value: 1 });
    expect(y70.programs).toHaveLength(SAMPLE_PROGRAMS.length); // สาขาที่ยังไม่มีคนเลือกก็แสดง
    expect(JSON.stringify(stats)).not.toContain(VALID_ID);
    expect(JSON.stringify(stats)).not.toContain('สมชาย');
  });
});

describe('งานผู้ดูแล (ประเภทวิชา/สาขา ประกาศ แก้ข้อมูล)', async () => {
  const admin = await import('../admin');
  const { exportByProgram } = await import('../exportData');
  const { buildWorkbook } = await import('../xlsx');
  const { parsePrograms, PROGRAM_COLUMNS } = await import('../sheetRow');
  const { updateApplicant } = await import('../service');

  it('เลขไทยที่กรอกมาถูกแปลงเป็นอารบิก', () => {
    const input = normalizeInput({ ...goodInput, phone: '๐๘๑-๒๓๔-๕๖๗๘', nationalId: '๑๑๐๑๗๐๐๒๐๗๐๓๐', gpa: '๓.๒๕' });
    expect(input.phone).toBe('0812345678');
    expect(input.nationalId).toBe(VALID_ID);
    expect(input.gpa).toBe('3.25');
  });

  it('ตรวจรายการสาขา: รหัสซ้ำ และห้ามลบสาขาที่มีผู้สมัคร', () => {
    const base = SAMPLE_PROGRAMS.map((p) => ({ ...p }));
    expect(() => admin.normalizePrograms([...base, { ...base[0]! }], [])).toThrow(/ซ้ำ/);
    expect(admin.normalizePrograms([{ code: '๐๙', track: 'pvc', name: 'ช่างซ่อม', department: 'แผนกวิชาช่างยนต์', quota: '๓๐' }], [])[0])
      .toMatchObject({ code: '09', department: 'ช่างยนต์', quota: 30 });
    const repo = memoryRepo();
    submitApplication(repo, DEFAULT_SETTINGS, SAMPLE_PROGRAMS, goodInput, ctx());
    expect(() => admin.normalizePrograms(base.filter((p) => !(p.track === 'pvc' && p.code === '01')), repo.items)).toThrow(/ลบสาขารหัส 01/);
  });

  it('ชีต Programs รุ่นแรก (ไม่มี department/quota) ยังอ่านได้', () => {
    const programs = parsePrograms(['code', 'track', 'name', 'active'], [['01', 'pvc', 'ช่างยนต์', 'TRUE']]);
    expect(programs[0]).toMatchObject({ department: 'ช่างยนต์', quota: 0 });
    expect(PROGRAM_COLUMNS).toContain('quota');
  });

  it('ประกาศ: เพิ่ม แก้ ลบ และหน้าเว็บเห็นเฉพาะที่เผยแพร่ ปักหมุดขึ้นก่อน', () => {
    const c = { nowIso: '2026-11-06T00:00:00.000Z', newId: () => `a${Math.random()}` };
    let list = admin.saveAnnouncement([], { title: 'เปิดรับสมัคร', body: 'รอบโควตา' }, c);
    list = admin.saveAnnouncement(list, { title: 'ร่าง', body: 'ยังไม่ประกาศ', published: false }, { ...c, nowIso: '2026-11-07T00:00:00.000Z' });
    list = admin.saveAnnouncement(list, { title: 'สำคัญ', body: 'ปักหมุด', pinned: true }, { ...c, nowIso: '2026-11-01T00:00:00.000Z' });
    expect(admin.publicAnnouncements(list).map((a) => a.title)).toEqual(['สำคัญ', 'เปิดรับสมัคร']);
    expect(() => admin.saveAnnouncement(list, { title: '' , body: 'x' }, c)).toThrow();
    expect(admin.deleteAnnouncement(list, list[0]!.id)).toHaveLength(2);
  });

  it('เจ้าหน้าที่แก้ข้อมูลผู้สมัครได้ แต่เลขบัตรห้ามชนคนอื่น', () => {
    const repo = memoryRepo();
    const a = submitApplication(repo, DEFAULT_SETTINGS, SAMPLE_PROGRAMS, goodInput, ctx());
    submitApplication(repo, DEFAULT_SETTINGS, SAMPLE_PROGRAMS, { ...goodInput, nationalId: '3100600123450' }, ctx());
    expect(updateApplicant(repo, SAMPLE_PROGRAMS, a.id, { ...a, schoolName: 'โรงเรียนใหม่' }, ctx()).schoolName).toBe('โรงเรียนใหม่');
    expect(() => updateApplicant(repo, SAMPLE_PROGRAMS, a.id, { ...a, nationalId: '3100600123450' }, ctx())).toThrow(/ซ้ำ/);
  });

  it('ส่งออกแยกชีตตามสาขา เรียงตามโรงเรียน', () => {
    const repo = memoryRepo();
    submitApplication(repo, DEFAULT_SETTINGS, SAMPLE_PROGRAMS, { ...goodInput, schoolName: 'ข โรงเรียน' }, ctx());
    submitApplication(repo, DEFAULT_SETTINGS, SAMPLE_PROGRAMS, { ...goodInput, nationalId: '3100600123450', schoolName: 'ก โรงเรียน' }, ctx());
    submitApplication(repo, DEFAULT_SETTINGS, SAMPLE_PROGRAMS, { ...goodInput, nationalId: '1234567890121', level: 'pvs_direct', programPvs: '06' }, ctx());
    const sheets = exportByProgram(repo.items, SAMPLE_PROGRAMS);
    expect(sheets.map((s) => s.name)).toEqual(['ปวช ช่างยนต์', 'ปวส ไฟฟ้า']);
    const school = sheets[0]!.headers.indexOf('โรงเรียนเดิม');
    expect(sheets[0]!.rows.map((r) => r[school])).toEqual(['ก โรงเรียน', 'ข โรงเรียน']);
    const bytes = new TextDecoder().decode(buildWorkbook(sheets));
    expect(bytes).toContain('xl/worksheets/sheet2.xml');
  });

  it('รหัสผ่านใหม่: ยาวพอ ไม่ซ้ำของเดิม ไม่ใช่ตัวเลขล้วน', () => {
    expect(checkNewPassword('old', 'short')).toMatch(/อย่างน้อย/);
    expect(checkNewPassword('samepass1', 'samepass1')).toMatch(/ซ้ำ/);
    expect(checkNewPassword('old', '12345678')).toMatch(/ตัวเลขล้วน/);
    expect(checkNewPassword('old', 'thaluang2569')).toBe('');
  });
});

describe('สาขาตามประกาศรับสมัครโควตา 2570', () => {
  it('ปวช. 13 สาขา รวม 215 คน, ปวส. 17 สาขา รวม 385 คน', () => {
    const of = (track: string) => SAMPLE_PROGRAMS.filter((p) => p.track === track);
    expect(of('pvc')).toHaveLength(13);
    expect(of('pvs')).toHaveLength(17);
    expect(of('pvc').reduce((n, p) => n + p.quota, 0)).toBe(215);
    expect(of('pvs').reduce((n, p) => n + p.quota, 0)).toBe(385);
  });
});

describe('บัญชีเจ้าหน้าที่', () => {
  const list: StaffAccount[] = [
    { username: 'admin', displayName: 'ผู้ดูแล', role: 'admin', status: 'active', lastLoginAt: '' },
    { username: 'staff1', displayName: 'ทะเบียน', role: 'staff', status: 'active', lastLoginAt: '' },
  ];
  it('ชื่อผู้ใช้ต้องถูกรูปแบบและไม่ซ้ำ รหัสแรกเข้าต้องผ่านกฎ', () => {
    const fields = (raw: object, pw: string) => validateStaffInput(normalizeStaffInput(raw), list, true, pw).map((i) => i.field);
    expect(fields({ username: 'Staff1', displayName: 'x' }, 'thaluang2569')).toEqual(['username']);
    expect(fields({ username: 'ab', displayName: 'x' }, 'thaluang2569')).toEqual(['username']);
    expect(fields({ username: 'staff2', displayName: '' }, '123')).toEqual(['password', 'displayName']);
    expect(fields({ username: 'staff2', displayName: 'ครูเอ' }, 'thaluang2569')).toEqual([]);
  });
  it('ห้ามลบ/ลดสิทธิ์ตัวเอง และต้องเหลือผู้ดูแลที่ใช้งานได้อย่างน้อย 1 คน', () => {
    expect(staffChangeProblem(list, 'admin', 'admin', null)).toMatch(/ตัวเอง/);
    expect(staffChangeProblem(list, 'admin', 'admin', { role: 'staff', status: 'active' })).toMatch(/ตัวเอง/);
    expect(staffChangeProblem(list, 'admin', 'staff1', null)).toBe('');
    expect(staffChangeProblem(list, 'admin', 'staff1', { role: 'admin', status: 'active' })).toBe('');
    const two: StaffAccount[] = [...list, { username: 'boss', displayName: 'ผอ.', role: 'admin', status: 'active', lastLoginAt: '' }];
    expect(staffChangeProblem(two, 'boss', 'admin', { role: 'staff', status: 'active' })).toBe('');
    expect(staffChangeProblem(list.map((u) => ({ ...u, role: 'admin' as const })), 'staff1', 'admin', { role: 'admin', status: 'disabled' })).toBe('');
    expect(staffChangeProblem([list[0]!, { ...list[1]!, role: 'admin', status: 'disabled' }], 'staff1', 'admin', null)).toMatch(/อย่างน้อย 1 คน/);
  });
});

describe('โปสเตอร์ประกาศและคู่มือ', async () => {
  const admin = await import('../admin');
  const { checkPoster, checkManual } = await import('../files');
  const { parseManual, parseAnnouncements, announcementToRow } = await import('../sheetRow');
  const { ANNOUNCEMENT_COLUMNS } = await import('../sheetRow');
  const { NO_POSTER } = await import('../model');
  const c = { nowIso: '2026-11-07T00:00:00.000Z', newId: () => 'a1' };
  const poster = { fileId: 'f1', url: 'https://x/f1', width: 1131, height: 1600 };

  it('แนบ คงไว้ เปลี่ยน และเอาโปสเตอร์ออกได้', () => {
    let list = admin.saveAnnouncement([], { title: 'รับสมัคร', body: 'รอบโควตา' }, c, poster);
    expect(list[0]).toMatchObject({ imageFileId: 'f1', imageWidth: 1131, imageHeight: 1600 });
    list = admin.saveAnnouncement(list, { id: 'a1', title: 'รับสมัคร (แก้)', body: 'รอบโควตา' }, c);
    expect(list[0]!.imageFileId).toBe('f1');
    list = admin.saveAnnouncement(list, { id: 'a1', title: 'รับสมัคร', body: 'x' }, c, NO_POSTER);
    expect(list[0]).toMatchObject({ imageFileId: '', imageUrl: '', imageWidth: 0 });
  });

  it('ชีตประกาศรุ่นก่อน (ไม่มีคอลัมน์รูป) ยังอ่านได้ และเขียนกลับครบทุกคอลัมน์', () => {
    const old = parseAnnouncements(['id', 'title', 'body', 'pinned', 'published', 'createdAt', 'updatedAt'], [['a', 'ข่าว', 'เนื้อหา', 'FALSE', 'TRUE', 'x', 'y']]);
    expect(old[0]).toMatchObject({ imageFileId: '', imageWidth: 0 });
    expect(announcementToRow(old[0]!)).toHaveLength(ANNOUNCEMENT_COLUMNS.length);
  });

  it('ตรวจชนิดไฟล์จากไบต์จริง: โปสเตอร์ = รูป, คู่มือ = PDF หรือรูป', () => {
    const jpg = [0xff, 0xd8, 0xff, 0xe0]; const pdf = [0x25, 0x50, 0x44, 0x46];
    expect(checkPoster(jpg, 1000).problem).toBe('');
    expect(checkPoster(pdf, 1000).problem).toMatch(/JPG/);
    expect(checkManual(pdf, 14 * 1024 * 1024).problem).toBe('');
    expect(checkManual(pdf, 16 * 1024 * 1024).problem).toMatch(/ใหญ่เกิน/);
    expect(checkManual(jpg, 1000).problem).toBe('');
    expect(checkManual([0x4d, 0x5a, 0, 0], 1000).problem).toMatch(/PDF/);
  });

  it('อ่านข้อมูลคู่มือจากชีต ค่าว่างหรือเสียถือว่าไม่มี', () => {
    expect(parseManual('{"fileId":"m1","name":"a.pdf","size":10,"updatedAt":"t"}')).toEqual({ fileId: 'm1', name: 'a.pdf', size: 10, updatedAt: 't', mime: 'application/pdf' });
    expect(parseManual('{"fileId":"m2","name":"a.png","size":10,"updatedAt":"t","mime":"image/png"}')!.mime).toBe('image/png');
    expect(parseManual('')).toBeNull();
    expect(parseManual('{oops')).toBeNull();
  });
});

describe('ชื่อสาขาต้องดูระดับด้วย', async () => {
  const { programName } = await import('../model');
  it('รหัสเดียวกันคนละระดับได้ชื่อคนละสาขา (ปวช. 12 / ปวส. 12)', () => {
    expect(programName(SAMPLE_PROGRAMS, '12', 'pvc')).toBe('การบัญชี');
    expect(programName(SAMPLE_PROGRAMS, '12', 'pvs')).toBe('เทคโนโลยีคอมพิวเตอร์');
    expect(programName(SAMPLE_PROGRAMS, '', 'pvs')).toBe('');
  });
});

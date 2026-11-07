/**
 * โครงข้อมูลของระบบรับสมัคร
 *
 * ช่องกรอกเรียงตามใบสมัครกระดาษ (ข้อ ๑–๖) เพื่อให้เจ้าหน้าที่เทียบกับต้นฉบับได้ทีละบรรทัด
 * ช่องที่กระดาษไม่มี (เลขบัตร อีเมล ช่องทางที่รู้จัก) ระบบใช้ภายในเท่านั้น ไม่พิมพ์ลงใบสมัคร
 */

/** ประเภทการสมัคร = ช่องติ๊ก 3 ช่องบนหัวใบสมัคร */
export const LEVELS = ['pvs_direct', 'pvs_cross', 'pvc'] as const;
export type Level = (typeof LEVELS)[number];

export const LEVEL_LABEL: Record<Level, string> = {
  pvs_direct: 'ปวส. (สายตรง)',
  pvs_cross: 'ปวส. (ม.6/ปวช. ต่างสาขา)',
  pvc: 'ปวช.',
};

/** กลุ่มหลักสูตร — ใช้เลือกรายชื่อสาขาและออกรหัสนักศึกษา */
export type Track = 'pvc' | 'pvs';
export const trackOf = (level: Level): Track => (level === 'pvc' ? 'pvc' : 'pvs');
export const TRACK_LABEL: Record<Track, string> = { pvc: 'ปวช.', pvs: 'ปวส.' };

export const PREFIXES = ['นาย', 'นางสาว', 'นาง', 'เด็กชาย', 'เด็กหญิง'] as const;

export const CURRENT_LEVELS = ['ม.3', 'ม.6', 'ปวช.3', 'กศน. ม.ต้น', 'กศน. ม.ปลาย', 'อื่น ๆ'] as const;

export const CHANNELS = [
  'ครูแนะแนว / ผู้แนะนำ',
  'วิทยาลัยออกแนะแนวที่โรงเรียน',
  'เพื่อน / รุ่นพี่',
  'ผู้ปกครอง / ญาติ',
  'Facebook / TikTok ของวิทยาลัย',
  'เว็บไซต์วิทยาลัย',
  'อื่น ๆ',
] as const;

/** ข้อมูลที่ผู้สมัครกรอก — เก็บเป็นข้อความทั้งหมด เลขที่ขึ้นต้นด้วย 0 จะได้ไม่หาย */
export interface ApplicationInput {
  level: string;
  prefix: string;
  firstName: string;
  lastName: string;
  nationalId: string;
  birthDate: string;
  phone: string;
  email: string;
  fatherName: string;
  fatherAge: string;
  fatherJob: string;
  motherName: string;
  motherAge: string;
  motherJob: string;
  houseNo: string;
  moo: string;
  soi: string;
  road: string;
  subdistrict: string;
  district: string;
  province: string;
  postcode: string;
  currentLevel: string;
  schoolName: string;
  schoolAddressNo: string;
  schoolSubdistrict: string;
  schoolDistrict: string;
  schoolProvince: string;
  gpa: string;
  currentMajor: string;
  programPvs: string;
  programPvc1: string;
  programPvc2: string;
  channel: string;
  referrer: string;
  consent: string;
}

export const INPUT_FIELDS = [
  'level', 'prefix', 'firstName', 'lastName', 'nationalId', 'birthDate', 'phone', 'email',
  'fatherName', 'fatherAge', 'fatherJob', 'motherName', 'motherAge', 'motherJob',
  'houseNo', 'moo', 'soi', 'road', 'subdistrict', 'district', 'province', 'postcode',
  'currentLevel', 'schoolName', 'schoolAddressNo', 'schoolSubdistrict', 'schoolDistrict', 'schoolProvince',
  'gpa', 'currentMajor', 'programPvs', 'programPvc1', 'programPvc2', 'channel', 'referrer', 'consent',
] as const satisfies readonly (keyof ApplicationInput)[];

export const emptyInput = (): ApplicationInput =>
  Object.fromEntries(INPUT_FIELDS.map((field) => [field, ''])) as unknown as ApplicationInput;

/** สถานะใบสมัคร เรียงตามขั้นตอนจริง */
export const STATUSES = ['submitted', 'needs_fix', 'passed', 'not_passed', 'enrolled'] as const;
export type Status = (typeof STATUSES)[number];

export const STATUS_LABEL: Record<Status, string> = {
  submitted: 'รอตรวจสอบ',
  needs_fix: 'เอกสารไม่ครบ / ต้องแก้ไข',
  passed: 'ผ่านการคัดเลือก',
  not_passed: 'ไม่ผ่านการคัดเลือก',
  enrolled: 'มอบตัวแล้ว',
};

/** เอกสารแนบ — ตามหลักฐานประกอบการสมัครท้ายใบสมัคร บวกรูปถ่ายที่ต้องติดหัวกระดาษ */
export const DOC_KINDS = ['photo', 'transcript', 'idCard', 'houseReg', 'certificate'] as const;
export type DocKind = (typeof DOC_KINDS)[number];

export const DOC_INFO: Record<DocKind, { label: string; hint: string; required: boolean; imageOnly: boolean }> = {
  photo: { label: 'รูปถ่ายหน้าตรง', hint: 'ขนาด 1 นิ้ว ชุดนักเรียน ไม่สวมหมวก — ใช้ติดบนใบสมัคร', required: true, imageOnly: true },
  transcript: { label: 'ใบแสดงผลการเรียน (รบ.) เฉลี่ยสะสม 5 ภาคเรียน', hint: 'ถ่ายให้เห็นเกรดเฉลี่ยชัดเจน', required: true, imageOnly: false },
  idCard: { label: 'สำเนาบัตรประจำตัวประชาชน', hint: 'ด้านหน้า เห็นเลข 13 หลักชัดเจน', required: true, imageOnly: false },
  houseReg: { label: 'สำเนาทะเบียนบ้าน', hint: 'หน้าที่มีชื่อผู้สมัคร', required: true, imageOnly: false },
  certificate: { label: 'เกียรติบัตร / ใบรับรองความสามารถพิเศษ', hint: 'ถ้ามี — รวมเป็นไฟล์ PDF เดียวได้', required: false, imageOnly: false },
};

export const DOC_STATES = ['pending', 'ok', 'fix'] as const;
export type DocState = (typeof DOC_STATES)[number];
export const DOC_STATE_LABEL: Record<DocState, string> = { pending: 'รอตรวจ', ok: 'ผ่าน', fix: 'ต้องส่งใหม่' };

export const MAX_FILE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_MIME = ['image/jpeg', 'image/png', 'application/pdf'] as const;

export interface DocMeta {
  /** รหัสไฟล์ใน Google Drive (โหมดสาธิต = คีย์ใน IndexedDB) — ไม่ส่งให้ฝั่งผู้สมัคร */
  fileId: string;
  name: string;
  mime: string;
  size: number;
  uploadedAt: string;
  state: DocState;
  note: string;
}

export interface Enrollment {
  /** สาขาที่รับเข้าจริง (อาจเป็นลำดับที่ 2 ของผู้สมัคร) */
  admittedProgram: string;
  guardianName: string;
  guardianRelation: string;
  guardianPhone: string;
  guardianJob: string;
  guardianAddress: string;
  witnessName: string;
  witnessPosition: string;
  enrolledDate: string;
  note: string;
}

export const ENROLLMENT_FIELDS = [
  'admittedProgram', 'guardianName', 'guardianRelation', 'guardianPhone', 'guardianJob', 'guardianAddress',
  'witnessName', 'witnessPosition', 'enrolledDate', 'note',
] as const satisfies readonly (keyof Enrollment)[];

export interface Applicant extends ApplicationInput {
  id: string;
  /** เลขที่ใบสมัคร เช่น Q70-0001 */
  appNo: string;
  academicYear: number;
  status: Status;
  /** ข้อความถึงผู้สมัคร แสดงในหน้าตรวจสถานะ */
  statusNote: string;
  documents: Partial<Record<DocKind, DocMeta>>;
  enrollment: Enrollment | null;
  studentId: string;
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
}

export interface Program {
  code: string;
  track: Track;
  name: string;
  active: boolean;
  /** ประเภทวิชาที่สาขานี้สังกัด ตามประกาศรับสมัคร เช่น "อุตสาหกรรม" (ไม่ต้องมีคำว่า "ประเภทวิชา") */
  department: string;
  /** จำนวนที่เปิดรับ (0 = ไม่จำกัด) */
  quota: number;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  pinned: boolean;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  /** โปสเตอร์ประกอบ (ไม่มี = '') — imageUrl เปิดได้ตรงจากเบราว์เซอร์ ไม่ต้องผ่าน API */
  imageFileId: string;
  imageUrl: string;
  /** ขนาดจริงของรูป ใช้จองพื้นที่ไว้ก่อนรูปโหลดเสร็จ หน้าจะได้ไม่กระโดด */
  imageWidth: number;
  imageHeight: number;
}

export interface PosterImage { fileId: string; url: string; width: number; height: number }
export const NO_POSTER: PosterImage = { fileId: '', url: '', width: 0, height: 0 };

/** คู่มือการใช้งาน (PDF) แยกฉบับผู้สมัครกับเจ้าหน้าที่ */
export const MANUAL_KINDS = ['applicant', 'staff'] as const;
export type ManualKind = (typeof MANUAL_KINDS)[number];
export const MANUAL_LABEL: Record<ManualKind, string> = { applicant: 'คู่มือสำหรับผู้สมัคร', staff: 'คู่มือสำหรับเจ้าหน้าที่' };
export interface StoredManual { fileId: string; name: string; size: number; updatedAt: string }
export interface ManualInfo extends StoredManual {
  /** เปิดอ่านในหน้าเว็บ (iframe) */
  viewUrl: string;
  downloadUrl: string;
}

export const MAX_POSTER_BYTES = 5 * 1024 * 1024;
export const MAX_MANUAL_BYTES = 15 * 1024 * 1024;

export interface Settings {
  /** ปีการศึกษา (พ.ศ.) ที่เปิดรับ */
  academicYear: number;
  applicationsOpen: boolean;
  /** รูปแบบรหัสนักศึกษา: {YY} {YYYY} {L} {PP} และ {NNN} (จำนวน N = จำนวนหลักเลขลำดับ) */
  studentIdPattern: string;
  /** ข้อความหน้าแรก — ผู้ดูแลแก้เองได้ในหน้าตั้งค่าเนื้อหา */
  heroTitle: string;
  heroText: string;
  /** รายละเอียดการรับสมัคร (กำหนดการ คุณสมบัติ) แสดงใต้ยอดผู้สมัคร ขึ้นบรรทัดใหม่ได้ */
  details: string;
}

export const DEFAULT_SETTINGS: Settings = {
  academicYear: 2570,
  applicationsOpen: true,
  studentIdPattern: '{YY}{L}{PP}{NNN}',
  heroTitle: 'สมัครเรียน ปวช. และ ปวส. ที่วิทยาลัยเทคนิคท่าหลวงซิเมนต์ไทยอนุสรณ์',
  heroText: 'กรอกใบสมัครบนเว็บ ระบบเติมข้อมูลลงใบสมัครฉบับจริงของวิทยาลัยให้ทันที พิมพ์ ลงชื่อ แล้วนำมายื่นได้เลย ไม่ต้องเขียนเอง',
  details: '',
};

export const SETTING_TEXT_FIELDS = ['heroTitle', 'heroText', 'details'] as const;

/** สาขาและจำนวนรับตามประกาศรับสมัครโควตา ปีการศึกษา 2570 (ปวช. รวม 215 คน, ปวส. รวม 385 คน) รหัส = ลำดับในประกาศ */
export const SAMPLE_PROGRAMS: Program[] = [
  { code: '01', track: 'pvc', name: 'ช่างยนต์', active: true, department: 'อุตสาหกรรม', quota: 20 },
  { code: '02', track: 'pvc', name: 'ยานยนต์ไฟฟ้า (ทวิภาคี)', active: true, department: 'อุตสาหกรรม', quota: 10 },
  { code: '03', track: 'pvc', name: 'ช่างกลโรงงาน', active: true, department: 'อุตสาหกรรม', quota: 30 },
  { code: '04', track: 'pvc', name: 'ช่างกลโรงงาน (ทวิภาคี)', active: true, department: 'อุตสาหกรรม', quota: 20 },
  { code: '05', track: 'pvc', name: 'ช่างซ่อมบำรุง', active: true, department: 'อุตสาหกรรม', quota: 10 },
  { code: '06', track: 'pvc', name: 'ช่างเชื่อมโลหะ (ทวิภาคี)', active: true, department: 'อุตสาหกรรม', quota: 10 },
  { code: '07', track: 'pvc', name: 'ช่างไฟฟ้า', active: true, department: 'อุตสาหกรรม', quota: 30 },
  { code: '08', track: 'pvc', name: 'อิเล็กทรอนิกส์', active: true, department: 'อุตสาหกรรม', quota: 10 },
  { code: '09', track: 'pvc', name: 'เมคคาทรอนิกส์และหุ่นยนต์ (ทวิภาคี)', active: true, department: 'อุตสาหกรรม', quota: 10 },
  { code: '10', track: 'pvc', name: 'ช่างเทคนิคคอมพิวเตอร์', active: true, department: 'อุตสาหกรรมดิจิทัลและเทคโนโลยีสารสนเทศ', quota: 10 },
  { code: '11', track: 'pvc', name: 'เทคโนโลยีธุรกิจดิจิทัล', active: true, department: 'อุตสาหกรรมดิจิทัลและเทคโนโลยีสารสนเทศ', quota: 20 },
  { code: '12', track: 'pvc', name: 'การบัญชี', active: true, department: 'พาณิชยกรรม', quota: 15 },
  { code: '13', track: 'pvc', name: 'การตลาด', active: true, department: 'พาณิชยกรรม', quota: 20 },
  { code: '01', track: 'pvs', name: 'เทคนิคเครื่องกล (ทวิภาคี)', active: true, department: 'อุตสาหกรรม', quota: 20 },
  { code: '02', track: 'pvs', name: 'เทคนิคยานยนต์ไฟฟ้า (ทวิภาคี)', active: true, department: 'อุตสาหกรรม', quota: 20 },
  { code: '03', track: 'pvs', name: 'เทคนิคการผลิต', active: true, department: 'อุตสาหกรรม', quota: 50 },
  { code: '04', track: 'pvs', name: 'เทคนิคการผลิต (ทวิภาคี)', active: true, department: 'อุตสาหกรรม', quota: 15 },
  { code: '05', track: 'pvs', name: 'เทคนิคโลหะ (ทวิภาคี)', active: true, department: 'อุตสาหกรรม', quota: 20 },
  { code: '06', track: 'pvs', name: 'ไฟฟ้า', active: true, department: 'อุตสาหกรรม', quota: 40 },
  { code: '07', track: 'pvs', name: 'ไฟฟ้า (ทวิภาคี)', active: true, department: 'อุตสาหกรรม', quota: 10 },
  { code: '08', track: 'pvs', name: 'เทคโนโลยีอิเล็กทรอนิกส์', active: true, department: 'อุตสาหกรรม', quota: 20 },
  { code: '09', track: 'pvs', name: 'เทคนิคอุตสาหกรรม', active: true, department: 'อุตสาหกรรม', quota: 30 },
  { code: '10', track: 'pvs', name: 'เทคนิคอุตสาหกรรม (ทวิภาคี)', active: true, department: 'อุตสาหกรรม', quota: 10 },
  { code: '11', track: 'pvs', name: 'เมคคาทรอนิกส์และหุ่นยนต์ (ทวิภาคี)', active: true, department: 'อุตสาหกรรม', quota: 20 },
  { code: '12', track: 'pvs', name: 'เทคโนโลยีคอมพิวเตอร์', active: true, department: 'อุตสาหกรรมดิจิทัลและเทคโนโลยีสารสนเทศ', quota: 20 },
  { code: '13', track: 'pvs', name: 'เทคโนโลยีธุรกิจดิจิทัล', active: true, department: 'อุตสาหกรรมดิจิทัลและเทคโนโลยีสารสนเทศ', quota: 30 },
  { code: '14', track: 'pvs', name: 'เทคโนโลยีธุรกิจดิจิทัล (ทวิภาคี)', active: true, department: 'อุตสาหกรรมดิจิทัลและเทคโนโลยีสารสนเทศ', quota: 10 },
  { code: '15', track: 'pvs', name: 'เทคโนโลยีสารสนเทศ', active: true, department: 'อุตสาหกรรมดิจิทัลและเทคโนโลยีสารสนเทศ', quota: 20 },
  { code: '16', track: 'pvs', name: 'การบัญชี', active: true, department: 'พาณิชยกรรม', quota: 25 },
  { code: '17', track: 'pvs', name: 'การตลาด', active: true, department: 'พาณิชยกรรม', quota: 25 },
];

export const fullName = (a: Pick<ApplicationInput, 'prefix' | 'firstName' | 'lastName'>): string =>
  `${a.prefix}${a.firstName} ${a.lastName}`.trim();

export const programName = (programs: readonly Program[], code: string): string =>
  programs.find((program) => program.code === code)?.name ?? '';

/** สาขาที่ผู้สมัครเลือกเป็นอันดับแรก (ใช้กับสถิติและรหัสนักศึกษา) */
export const firstChoice = (a: Pick<ApplicationInput, 'level' | 'programPvs' | 'programPvc1'>): string =>
  a.level === 'pvc' ? a.programPvc1 : a.programPvs;

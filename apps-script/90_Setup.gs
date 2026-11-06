/**
 * ติดตั้งระบบ — รันจาก Apps Script Editor (เลือกฟังก์ชันแล้วกด Run)
 *
 * setupSystem()            สร้าง/ซ่อมไฟล์ข้อมูล ชีต โฟลเดอร์ และกุญแจลับ รันซ้ำได้ ไม่ลบข้อมูลเดิม
 * addStaff()               เพิ่มเจ้าหน้าที่ (แก้ค่าในฟังก์ชันก่อนรัน) รหัสผ่านชั่วคราวขึ้นใน Execution log
 * resetStaffPassword()     ออกรหัสผ่านใหม่ และเตะ session เดิมออกทั้งหมด
 * loadPrograms2570()       เขียนทับสาขา/จำนวนรับ ตามประกาศรับสมัครโควตา ปีการศึกษา 2570 (30 สาขา)
 */

const SHEET_LAYOUT_ = [
  ['SHEET_APPLICANTS', 'APPLICANT_COLUMNS'],
  ['SHEET_PROGRAMS', 'PROGRAM_COLUMNS'],
  ['SHEET_SETTINGS', 'SETTINGS_COLUMNS'],
  ['SHEET_STAFF', 'STAFF_COLUMNS'],
  ['SHEET_AUDIT', 'AUDIT_COLUMNS'],
  ['SHEET_ANNOUNCEMENTS', 'ANNOUNCEMENT_COLUMNS'],
];

function setupSystem() {
  const props = scriptProps_();
  [PROP_SESSION_SECRET, PROP_PASSWORD_PEPPER].forEach(function (key) {
    if (!getProp_(key)) props.setProperty(key, Utilities.getUuid() + Utilities.getUuid());
  });

  // ลิงก์หน้าเว็บที่แนบในอีเมลถึงผู้สมัคร (ย้ายที่ฝากเว็บเมื่อไหร่ แก้ค่านี้ใน Script Properties)
  if (!getProp_(PROP_PUBLIC_SITE_URL)) props.setProperty(PROP_PUBLIC_SITE_URL, 'https://tctatc.github.io/thaluang-admission/');

  if (!getProp_(PROP_SPREADSHEET_ID)) {
    const book = SpreadsheetApp.create('ระบบรับสมัครเรียน - ข้อมูล');
    props.setProperty(PROP_SPREADSHEET_ID, book.getId());
  }
  if (!getProp_(PROP_DRIVE_FOLDER_ID)) {
    props.setProperty(PROP_DRIVE_FOLDER_ID, DriveApp.createFolder('ระบบรับสมัครเรียน - เอกสารผู้สมัคร').getId());
  }

  const book = openBook_();
  SHEET_LAYOUT_.forEach(function (pair) {
    const name = Domain[pair[0]];
    const columns = Domain[pair[1]];
    let sheet = book.getSheetByName(name);
    if (sheet === null) sheet = book.insertSheet(name);
    if (sheet.getMaxColumns() < columns.length) sheet.insertColumnsAfter(sheet.getMaxColumns(), columns.length - sheet.getMaxColumns());
    // ทุกช่องเป็นข้อความ ไม่งั้นเลขบัตร/เบอร์โทร/รหัสสาขา "01" ถูก Sheets แปลงเป็นตัวเลขแล้ว 0 หาย
    sheet.getRange(1, 1, sheet.getMaxRows(), sheet.getMaxColumns()).setNumberFormat('@');
    const width = Math.max(sheet.getLastColumn(), 1);
    const header = sheet.getLastRow() > 0 ? sheet.getRange(1, 1, 1, width).getValues()[0].filter(String) : [];
    const missing = Domain.missingColumns(header, columns);
    if (missing.length > 0) {
      sheet.getRange(1, header.length + 1, 1, missing.length).setValues([missing]);
    }
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, sheet.getLastColumn()).setFontWeight('bold');
  });
  const blank = book.getSheetByName('Sheet1') || book.getSheetByName('แผ่น1');
  if (blank && book.getSheets().length > 1) book.deleteSheet(blank);

  const programs = getSheet_(Domain.SHEET_PROGRAMS);
  if (programs.getLastRow() < 2) {
    writePrograms_(Domain.SAMPLE_PROGRAMS);
  } else {
    // ชีตรุ่นแรกยังไม่มีแผนก/จำนวนรับ — เขียนใหม่ตามรูปแบบล่าสุด (ประเภทวิชาเริ่มต้น = ชื่อสาขา แก้ต่อในหน้าเว็บได้)
    writePrograms_(readPrograms_());
  }
  const settings = getSheet_(Domain.SHEET_SETTINGS);
  if (settings.getLastRow() < 2) {
    settings.getRange(2, 1, 3, 3).setValues([
      ['academicYear', String(Domain.DEFAULT_SETTINGS.academicYear), 'ปีการศึกษา (พ.ศ.) ที่เปิดรับ'],
      ['applicationsOpen', 'TRUE', 'TRUE = เปิดรับสมัคร, FALSE = ปิด'],
      ['studentIdPattern', Domain.DEFAULT_SETTINGS.studentIdPattern, '{YY}=ปี 2 หลัก {L}=2 ปวช./3 ปวส. {PP}=รหัสสาขา {NNN}=ลำดับ'],
    ]);
  }

  if (readStaff_().length === 0) createStaff_('admin', 'ผู้ดูแลระบบ', 'admin');
  installBackupTrigger_();
  clearCaches_();
  console.log(`ไฟล์ข้อมูล: ${openBook_().getUrl()}`);
  console.log(`โฟลเดอร์เอกสาร: ${DriveApp.getFolderById(getProp_(PROP_DRIVE_FOLDER_ID)).getUrl()}`);
  console.log('ขั้นต่อไป: Deploy > New deployment > Web app (Execute as: Me, Who has access: Anyone)');
}

function clearCaches_() {
  bookCache_ = null;
  applicantCache_ = null;
}

function randomPassword_() {
  // ตัดตัวที่สับสนง่ายออก (0/O, 1/l/I)
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, Utilities.getUuid());
  return bytes.slice(0, 12).map(function (b) { return chars[(b & 0xff) % chars.length]; }).join('');
}

function createStaff_(username, displayName, role) {
  const name = String(username).trim().toLowerCase();
  if (!/^[a-z0-9._-]{3,32}$/.test(name)) throw new Error('ชื่อผู้ใช้ใช้ได้เฉพาะ a-z 0-9 . _ - ยาว 3–32 ตัว');
  if (readStaff_().some(function (s) { return s.username === name; })) throw new Error(`มีชื่อผู้ใช้ ${name} แล้ว`);
  const password = randomPassword_();
  const credential = newPasswordCredential_(name, password);
  getSheet_(Domain.SHEET_STAFF).appendRow([name, displayName, role === 'admin' ? 'admin' : 'staff', 'active', credential.passwordSalt, credential.passwordHash, '1', '']);
  console.log(`สร้างบัญชี ${name} แล้ว รหัสผ่านชั่วคราว: ${password}  (จดไว้ ระบบไม่เก็บรหัสจริง)`);
}

/** แก้ 3 ค่านี้แล้วกด Run */
function addStaff() {
  createStaff_('staff1', 'เจ้าหน้าที่งานทะเบียน', 'staff');
}

/** แก้ชื่อผู้ใช้แล้วกด Run */
function resetStaffPassword() {
  const username = 'admin';
  const staff = readStaff_().find(function (s) { return s.username === username; });
  if (!staff) throw new Error(`ไม่พบผู้ใช้ ${username}`);
  const password = randomPassword_();
  const credential = newPasswordCredential_(username, password);
  const sheet = getSheet_(Domain.SHEET_STAFF);
  const col = function (name) { return Domain.STAFF_COLUMNS.indexOf(name) + 1; };
  sheet.getRange(staff.rowNumber, col('passwordSalt')).setValue(credential.passwordSalt);
  sheet.getRange(staff.rowNumber, col('passwordHash')).setValue(credential.passwordHash);
  sheet.getRange(staff.rowNumber, col('tokenVersion')).setValue(String((Number(staff.tokenVersion) || 1) + 1));
  CacheService.getScriptCache().remove(`login_fail_${Utilities.base64EncodeWebSafe(username)}`);
  console.log(`รหัสผ่านใหม่ของ ${username}: ${password}`);
}

/** เขียนทับชีต Programs ด้วยรายการตามประกาศ — ถ้ามีผู้สมัครเลือกสาขาที่จะหายไป ระบบไม่ยอมลบและแจ้งชื่อสาขา */
function loadPrograms2570() {
  const programs = withScriptLock_(function () {
    const next = Domain.normalizePrograms(Domain.SAMPLE_PROGRAMS, sheetRepo_().list());
    writePrograms_(next);
    bumpDataVersion_();
    return next;
  });
  audit_('setup', 'loadPrograms2570', '', `${programs.length} สาขา`);
  console.log(`บันทึกแล้ว ${programs.length} สาขา (ปวช. ${programs.filter(function (p) { return p.track === 'pvc'; }).length}, ปวส. ${programs.filter(function (p) { return p.track === 'pvs'; }).length})`);
}

/** ทดสอบส่ง LINE เข้ากลุ่มเจ้าหน้าที่หลังใส่ LINE_CHANNEL_TOKEN และ LINE_TO */
function testLineNotify() {
  pushLine_('ทดสอบการแจ้งเตือนจากระบบรับสมัครเรียน');
}

/* ---------- สำรองข้อมูลอัตโนมัติ ---------- */

const BACKUP_KEEP = 30;

/** ตั้งให้ dailyBackup ทำงานทุกคืนราวตี 2 (รันซ้ำได้ ไม่สร้างซ้อน) */
function installBackupTrigger_() {
  const exists = ScriptApp.getProjectTriggers().some(function (t) { return t.getHandlerFunction() === 'dailyBackup'; });
  if (!exists) ScriptApp.newTrigger('dailyBackup').timeBased().everyDays(1).atHour(2).inTimezone('Asia/Bangkok').create();
}

/**
 * คัดลอกไฟล์ข้อมูลทั้งไฟล์ไปเก็บในโฟลเดอร์สำรอง เก็บไว้ 30 ชุดล่าสุด ชุดที่เก่ากว่าย้ายลงถังขยะ
 * ไฟล์แนบใน Drive ไม่ต้องสำรองซ้ำ เพราะระบบไม่ลบไฟล์เอง (ส่งไฟล์ใหม่ ไฟล์เก่าลงถังขยะ กู้ได้ 30 วัน)
 */
function dailyBackup() {
  const root = DriveApp.getFolderById(requireProp_(PROP_DRIVE_FOLDER_ID));
  const folder = childFolder_(root, Domain.SHEET_BACKUP_FOLDER);
  const stamp = Utilities.formatDate(new Date(), 'Asia/Bangkok', 'yyyy-MM-dd HHmm');
  DriveApp.getFileById(requireProp_(PROP_SPREADSHEET_ID)).makeCopy(`สำรอง ${stamp}`, folder);
  const files = [];
  const iterator = folder.getFiles();
  while (iterator.hasNext()) files.push(iterator.next());
  files.sort(function (a, b) { return b.getDateCreated().getTime() - a.getDateCreated().getTime(); });
  files.slice(BACKUP_KEEP).forEach(function (file) { file.setTrashed(true); });
  console.log(`สำรองข้อมูลแล้ว: สำรอง ${stamp} (เก็บไว้ ${Math.min(files.length, BACKUP_KEEP)} ชุด)`);
}

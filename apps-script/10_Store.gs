/**
 * ชั้นอ่าน/เขียน Google Sheets — ทำแค่ I/O กฎทั้งหมดอยู่ใน Domain (มี unit test ครอบ)
 *
 * cache ระดับไฟล์มีอายุแค่คำขอเดียว (Apps Script รันใหม่ทุกคำขอ) จึงปลอดภัย
 * และช่วยได้มาก เพราะ service เรียก list() หลายครั้งในคำขอเดียว
 */

let bookCache_ = null;
let applicantCache_ = null;

function openBook_() {
  if (bookCache_ !== null) return bookCache_;
  const id = requireProp_(PROP_SPREADSHEET_ID);
  try {
    bookCache_ = SpreadsheetApp.openById(id);
  } catch (error) {
    throw appError_(ERROR_CODES.NOT_CONFIGURED, `เปิดไฟล์ข้อมูลไม่ได้ (รหัส ${id}) — ไฟล์อาจถูกลบหรือย้ายเจ้าของ`);
  }
  return bookCache_;
}

function getSheet_(name) {
  const sheet = openBook_().getSheetByName(name);
  if (sheet === null) throw appError_(ERROR_CODES.NOT_CONFIGURED, `ไม่พบชีต "${name}" — รัน setupSystem() อีกครั้งเพื่อสร้างชีตที่ขาด`);
  return sheet;
}

/** อ่านทุกแถว (ไม่รวมหัวตาราง) */
function readRows_(name) {
  const sheet = getSheet_(name);
  const lastRow = sheet.getLastRow();
  const width = Math.max(sheet.getLastColumn(), 1);
  if (lastRow < 1) return { sheet: sheet, header: [], rows: [] };
  const values = sheet.getRange(1, 1, lastRow, width).getDisplayValues();
  return { sheet: sheet, header: values[0], rows: values.slice(1) };
}

/* ---------- ผู้สมัคร ---------- */

function loadApplicants_() {
  if (applicantCache_ !== null) return applicantCache_;
  const data = readRows_(Domain.SHEET_APPLICANTS);
  const missing = Domain.missingColumns(data.header, Domain.APPLICANT_COLUMNS);
  if (missing.length > 0) {
    throw appError_(ERROR_CODES.NOT_CONFIGURED, `ชีต Applicants ขาดคอลัมน์: ${missing.join(', ')} — รัน setupSystem()`);
  }
  const items = [];
  const rowById = {};
  data.rows.forEach(function (row, index) {
    if (row.join('') === '') return;
    const applicant = Domain.rowToApplicant(data.header, row);
    items.push(applicant);
    rowById[applicant.id] = index + 2;
  });
  applicantCache_ = { sheet: data.sheet, header: data.header, items: items, rowById: rowById };
  return applicantCache_;
}

/** เรียงค่าตามหัวตารางจริงของชีต (เจ้าหน้าที่ย้ายคอลัมน์ในชีตได้โดยไม่ทำให้ระบบพัง) */
function applicantRowForSheet_(header, applicant) {
  const values = Domain.applicantToRow(applicant);
  return header.map(function (column) {
    const index = Domain.APPLICANT_COLUMNS.indexOf(column);
    return index === -1 ? '' : values[index];
  });
}

/** Repo ที่ Domain service ใช้ — ทุกการเขียนต้องอยู่ใน withScriptLock_ */
function sheetRepo_() {
  return {
    list: function () {
      return loadApplicants_().items;
    },
    insert: function (applicant) {
      const store = loadApplicants_();
      const sheet = store.sheet;
      const rowNumber = sheet.getLastRow() + 1;
      sheet.getRange(rowNumber, 1, 1, store.header.length).setValues([applicantRowForSheet_(store.header, applicant)]);
      store.items.push(applicant);
      store.rowById[applicant.id] = rowNumber;
    },
    update: function (applicant) {
      const store = loadApplicants_();
      const rowNumber = store.rowById[applicant.id];
      if (!rowNumber) throw appError_(ERROR_CODES.NOT_FOUND, 'ไม่พบใบสมัครนี้');
      store.sheet.getRange(rowNumber, 1, 1, store.header.length).setValues([applicantRowForSheet_(store.header, applicant)]);
      const index = store.items.findIndex(function (item) { return item.id === applicant.id; });
      store.items[index] = applicant;
    },
  };
}

/* ---------- สาขาวิชาและค่าตั้งค่า ---------- */

function readPrograms_() {
  const data = readRows_(Domain.SHEET_PROGRAMS);
  return Domain.parsePrograms(data.header, data.rows);
}

/** เขียนทับทั้งชีต (ชีตเล็ก ไม่กี่สิบแถว) — หัวตารางเขียนใหม่ด้วย ชีตรุ่นแรกจึงได้คอลัมน์ใหม่ไปในตัว */
function rewriteSheet_(name, header, rows) {
  const sheet = getSheet_(name);
  const last = sheet.getLastRow();
  if (last > 1) sheet.getRange(2, 1, last - 1, Math.max(sheet.getLastColumn(), header.length)).clearContent();
  sheet.getRange(1, 1, 1, header.length).setValues([header]).setFontWeight('bold');
  if (rows.length > 0) sheet.getRange(2, 1, rows.length, header.length).setNumberFormat('@').setValues(rows);
}

function writePrograms_(programs) {
  rewriteSheet_(Domain.SHEET_PROGRAMS, Domain.PROGRAM_COLUMNS.slice(), programs.map(Domain.programToRow));
}

function readAnnouncements_() {
  const data = readRows_(Domain.SHEET_ANNOUNCEMENTS);
  return Domain.parseAnnouncements(data.header, data.rows);
}

function writeAnnouncements_(list) {
  rewriteSheet_(Domain.SHEET_ANNOUNCEMENTS, Domain.ANNOUNCEMENT_COLUMNS.slice(), list.map(Domain.announcementToRow));
}

function readSettings_() {
  const result = Domain.parseSettings(readRows_(Domain.SHEET_SETTINGS).rows);
  if (result.problems.length > 0) console.warn(`ค่าตั้งค่าในชีตมีปัญหา ใช้ค่าเริ่มต้นแทน: ${result.problems.join(' | ')}`);
  return result.settings;
}

function writeSetting_(key, value) {
  const data = readRows_(Domain.SHEET_SETTINGS);
  const index = data.rows.findIndex(function (row) { return String(row[0]).trim() === key; });
  if (index === -1) data.sheet.appendRow([key, String(value), '']);
  else data.sheet.getRange(index + 2, 2).setValue(String(value));
}

/* ---------- บันทึกการทำงาน ---------- */

function audit_(actor, action, target, detail) {
  try {
    getSheet_(Domain.SHEET_AUDIT).appendRow([nowIso_(), actor, action, target, detail || '']);
  } catch (error) {
    // บันทึกไม่ได้ไม่ควรทำให้งานหลักล้ม แต่ต้องขึ้น log ให้ตามได้
    console.error(`บันทึก Audit ไม่สำเร็จ: ${error.message}`);
  }
}

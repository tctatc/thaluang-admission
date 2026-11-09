/**
 * ลบใบสมัคร และจัดเลขที่ใบสมัครใหม่ (เฉพาะผู้ดูแลระบบ)
 *
 * ลบ = ลบแถวในชีต + ย้ายโฟลเดอร์เอกสารใน Drive ลงถังขยะ (กู้คืนจากถังขยะ Drive ได้ 30 วัน)
 * โฟลเดอร์ที่จะทิ้งเปลี่ยนชื่อก่อน เพราะ Drive ยังหาเจอด้วยชื่อแม้อยู่ในถังขยะ
 * ถ้าไม่เปลี่ยน ผู้สมัครที่ได้เลขนั้นทีหลังอาจอัปโหลดไฟล์ไปลงโฟลเดอร์ในถังขยะ
 */

function applicantFolderIfExists_(academicYear, appNo) {
  const root = DriveApp.getFolderById(requireProp_(PROP_DRIVE_FOLDER_ID));
  const years = root.getFoldersByName(`ปีการศึกษา ${academicYear}`);
  while (years.hasNext()) {
    const year = years.next();
    if (year.isTrashed()) continue;
    const found = year.getFoldersByName(appNo);
    while (found.hasNext()) {
      const folder = found.next();
      if (!folder.isTrashed()) return folder;
    }
  }
  return null;
}

function trashApplicantFolder_(applicant) {
  try {
    const folder = applicantFolderIfExists_(applicant.academicYear, applicant.appNo);
    if (!folder) return;
    folder.setName(`ลบแล้ว ${applicant.appNo} ${Utilities.formatDate(new Date(), 'Asia/Bangkok', 'yyyy-MM-dd HHmm')}`);
    folder.setTrashed(true);
  } catch (error) {
    console.warn(`ย้ายโฟลเดอร์ ${applicant.appNo} ลงถังขยะไม่ได้: ${error.message}`);
  }
}

/** ลบแถวของใบสมัคร id นี้ — ต้องเรียกในล็อก */
function deleteApplicantRow_(id) {
  const store = loadApplicants_();
  const rowNumber = store.rowById[id];
  if (!rowNumber) throw appError_(ERROR_CODES.NOT_FOUND, 'ไม่พบใบสมัครนี้ อาจถูกลบไปแล้ว');
  store.sheet.deleteRow(rowNumber);
  applicantCache_ = null; // แถวเลื่อน เลขแถวที่จำไว้ใช้ไม่ได้แล้ว
}

/** เปลี่ยนเลขที่ใบสมัคร: แถวในชีต ชื่อไฟล์เอกสาร และชื่อโฟลเดอร์ใน Drive — ต้องเรียกในล็อก */
function renameApplicantNo_(applicant, newNo) {
  const oldNo = applicant.appNo;
  const folder = applicantFolderIfExists_(applicant.academicYear, oldNo);
  const documents = {};
  Object.keys(applicant.documents).forEach(function (kind) {
    const doc = applicant.documents[kind];
    const name = String(doc.name || '').indexOf(oldNo) === 0 ? newNo + String(doc.name).slice(oldNo.length) : doc.name;
    if (name !== doc.name && doc.fileId) {
      try { DriveApp.getFileById(doc.fileId).setName(name); } catch (error) { console.warn(`เปลี่ยนชื่อไฟล์ ${doc.name} ไม่ได้: ${error.message}`); }
    }
    documents[kind] = Object.assign({}, doc, { name: name });
  });
  if (folder) folder.setName(newNo);
  sheetRepo_().update(Object.assign({}, applicant, { appNo: newNo, documents: documents }));
}

function deleteApplicant_(staff, payload) {
  const id = String(payload.id || '');
  const removed = withScriptLock_(function () {
    const applicant = sheetRepo_().list().find(function (item) { return item.id === id; });
    if (!applicant) throw appError_(ERROR_CODES.NOT_FOUND, 'ไม่พบใบสมัครนี้ อาจถูกลบไปแล้ว');
    // กันกดลบผิดคน: หน้าเว็บต้องส่งเลขที่ใบสมัครที่ผู้ใช้พิมพ์ยืนยันมาตรงกัน
    if (String(payload.confirmAppNo || '').trim().toUpperCase() !== applicant.appNo) {
      throw appError_(ERROR_CODES.VALIDATION, `พิมพ์เลขที่ใบสมัคร ${applicant.appNo} ให้ตรงเพื่อยืนยันการลบ`);
    }
    deleteApplicantRow_(id);
    bumpDataVersion_();
    return applicant;
  });
  trashApplicantFolder_(removed);
  audit_(staff.username, 'deleteApplicant', removed.appNo, `${removed.prefix}${removed.firstName} ${removed.lastName} ${removed.nationalId}`);
  return { deleted: removed.id };
}

/* ---------- งานครั้งเดียว: ลบใบสมัครทดสอบแล้วเลื่อนเลข (รันจาก Apps Script Editor) ---------- */

const CLEANUP_YEAR_ = 2570;
const CLEANUP_REMOVE_ = ['Q70-0001', 'Q70-0002', 'Q70-0003'];

/** ขั้นที่ 1: ดูก่อนว่าจะลบใคร และเลขไหนจะเปลี่ยนเป็นเลขอะไร (ยังไม่แก้อะไรเลย) */
function previewCleanupTestApplicants() {
  const plan = Domain.renumberPlan(sheetRepo_().list(), CLEANUP_YEAR_, CLEANUP_REMOVE_);
  console.log(`จะลบ ${plan.remove.length} ใบ:`);
  plan.remove.forEach(function (a) { console.log(`  ลบ ${a.appNo}  ${a.prefix}${a.firstName} ${a.lastName}`); });
  if (plan.missing.length) console.log(`ไม่พบ (อาจลบไปแล้ว): ${plan.missing.join(', ')}`);
  console.log(`จะเปลี่ยนเลข ${plan.renames.length} ใบ:`);
  const byId = {};
  sheetRepo_().list().forEach(function (a) { byId[a.id] = a; });
  plan.renames.forEach(function (r) { const a = byId[r.id]; console.log(`  ${r.from} → ${r.to}  ${a.prefix}${a.firstName} ${a.lastName}`); });
  console.log('ถ้ารายชื่อถูกต้อง ให้เลือกฟังก์ชัน runCleanupTestApplicants แล้วกด Run');
}

/** ขั้นที่ 2: สำรองไฟล์ชีตก่อน แล้วลบและเลื่อนเลขจริง รันซ้ำได้ (รอบสองจะไม่มีอะไรเปลี่ยน) */
function runCleanupTestApplicants() {
  const root = DriveApp.getFolderById(requireProp_(PROP_DRIVE_FOLDER_ID));
  const stamp = Utilities.formatDate(new Date(), 'Asia/Bangkok', 'yyyy-MM-dd HHmm');
  const backup = DriveApp.getFileById(requireProp_(PROP_SPREADSHEET_ID)).makeCopy(`สำรองก่อนลบใบสมัครทดสอบ ${stamp}`, childFolder_(root, Domain.SHEET_BACKUP_FOLDER));
  console.log(`สำรองไฟล์ชีตไว้แล้ว: ${backup.getName()} (โฟลเดอร์ ${Domain.SHEET_BACKUP_FOLDER})`);

  const result = withScriptLock_(function () {
    const plan = Domain.renumberPlan(sheetRepo_().list(), CLEANUP_YEAR_, CLEANUP_REMOVE_);
    plan.remove.forEach(function (a) { deleteApplicantRow_(a.id); });
    // เปลี่ยนจากเลขน้อยไปมาก เลขใหม่จึงไม่ชนกับเลขเดิมที่ยังไม่ได้เปลี่ยน
    plan.renames.forEach(function (r) {
      const applicant = sheetRepo_().list().find(function (item) { return item.id === r.id; });
      renameApplicantNo_(applicant, r.to);
    });
    bumpDataVersion_();
    return plan;
  });
  result.remove.forEach(trashApplicantFolder_);
  result.remove.forEach(function (a) { audit_('setup', 'deleteApplicant', a.appNo, 'ลบใบสมัครทดสอบ'); });
  result.renames.forEach(function (r) { audit_('setup', 'renumberApplicant', r.from, r.to); });
  console.log(`เสร็จแล้ว: ลบ ${result.remove.length} ใบ เปลี่ยนเลข ${result.renames.length} ใบ`);
  result.renames.forEach(function (r) { console.log(`  ${r.from} → ${r.to}`); });
}

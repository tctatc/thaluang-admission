/**
 * แบบประเมินความพึงพอใจ (ชีต Feedback) — ผู้สมัครตอบผ่านหน้าตรวจสถานะ ต้องยืนยันตัวด้วยเลขบัตร + วันเกิด
 * ชีตสร้างเองตอนมีคนตอบครั้งแรก ระบบที่ติดตั้งไว้ก่อนจึงไม่ต้องรัน setupSystem ใหม่
 */

function feedbackSheet_() {
  const book = openBook_();
  let sheet = book.getSheetByName(Domain.SHEET_FEEDBACK);
  if (sheet === null) {
    sheet = book.insertSheet(Domain.SHEET_FEEDBACK);
    sheet.getRange(1, 1, 1, Domain.FEEDBACK_COLUMNS.length).setValues([Domain.FEEDBACK_COLUMNS.slice()]).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function readFeedback_() {
  feedbackSheet_();
  const data = readRows_(Domain.SHEET_FEEDBACK);
  return Domain.parseFeedback(data.header, data.rows);
}

function submitFeedback_(payload) {
  const applicant = findOwnApplication_(payload);
  const saved = withScriptLock_(function () {
    const result = Domain.upsertFeedback(readFeedback_(), applicant, payload, nowIso_());
    rewriteSheet_(Domain.SHEET_FEEDBACK, Domain.FEEDBACK_COLUMNS.slice(), result.list.map(Domain.feedbackToRow));
    return result.saved;
  });
  return { feedback: saved };
}

function ownFeedback_(applicantId) {
  try {
    return readFeedback_().find(function (item) { return item.applicantId === applicantId; }) || null;
  } catch (error) {
    return null; // อ่านแบบประเมินไม่ได้ไม่ควรทำให้หน้าตรวจสถานะเปิดไม่ขึ้น
  }
}

function feedbackReport_(payload) {
  const list = readFeedback_();
  const year = payload.year === 'all' ? null : Number(payload.year) || readSettings_().academicYear;
  return {
    year: year,
    summary: Domain.summarizeFeedback(list, year),
    rows: year === null ? list : list.filter(function (item) { return item.academicYear === year; }),
    years: list.map(function (item) { return item.academicYear; }).filter(function (y, i, all) { return all.indexOf(y) === i; }).sort(),
  };
}

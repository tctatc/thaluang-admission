/**
 * เก็บเอกสารแนบใน Google Drive
 *
 * ไฟล์เป็นส่วนตัวของบัญชีที่ deploy (ไม่แชร์ลิงก์สาธารณะ) เพราะเป็นสำเนาบัตรและทะเบียนบ้าน
 * เจ้าหน้าที่เปิดดูผ่านระบบหลังเข้าสู่ระบบเท่านั้น (getFile ส่งไฟล์กลับเป็น base64)
 * โครงโฟลเดอร์: <โฟลเดอร์หลัก>/ปีการศึกษา 2570/Q70-0001/
 */

function childFolder_(parent, name) {
  const found = parent.getFoldersByName(name);
  return found.hasNext() ? found.next() : parent.createFolder(name);
}

function applicantFolder_(applicant) {
  const root = DriveApp.getFolderById(requireProp_(PROP_DRIVE_FOLDER_ID));
  return childFolder_(childFolder_(root, `ปีการศึกษา ${applicant.academicYear}`), applicant.appNo);
}

/** แปลง base64 แล้วตรวจชนิด/ขนาดจากไบต์จริง — ทำนอกล็อกได้เพราะยังไม่แตะข้อมูลร่วม */
function decodeUpload_(dataBase64, imageOnly) {
  let bytes;
  try {
    bytes = Utilities.base64Decode(String(dataBase64 || '').replace(/^data:[^,]*,/, ''));
  } catch (error) {
    throw appError_(ERROR_CODES.BAD_REQUEST, 'อ่านไฟล์ไม่ได้ กรุณาเลือกไฟล์ใหม่');
  }
  // Apps Script ให้ byte แบบมีเครื่องหมาย (-128..127) แปลงเป็น 0..255 ก่อนตรวจ
  const head = bytes.slice(0, 8).map(function (b) { return b & 0xff; });
  const check = Domain.checkUpload(head, bytes.length, imageOnly);
  if (check.problem) throw appError_(ERROR_CODES.VALIDATION, check.problem);
  return { bytes: bytes, mime: check.mime };
}

function saveFile_(applicant, kind, upload) {
  const name = `${applicant.appNo}-${kind}.${Domain.extensionFor(upload.mime)}`;
  const file = applicantFolder_(applicant).createFile(Utilities.newBlob(upload.bytes, upload.mime, name));
  return { fileId: file.getId(), name: name, mime: upload.mime, size: upload.bytes.length };
}

function trashFile_(fileId) {
  if (!fileId) return;
  try {
    DriveApp.getFileById(fileId).setTrashed(true);
  } catch (error) {
    console.warn(`ย้ายไฟล์เก่า ${fileId} ลงถังขยะไม่ได้: ${error.message}`);
  }
}

function readFileBase64_(fileId) {
  try {
    const blob = DriveApp.getFileById(fileId).getBlob();
    return { mime: blob.getContentType(), dataBase64: Utilities.base64Encode(blob.getBytes()) };
  } catch (error) {
    throw appError_(ERROR_CODES.NOT_FOUND, 'เปิดไฟล์ใน Drive ไม่ได้ ไฟล์อาจถูกลบหรือย้าย');
  }
}

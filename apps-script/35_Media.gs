/**
 * โปสเตอร์ประกาศและคู่มือการใช้งาน (PDF หรือรูป)
 *
 * ต่างจากเอกสารผู้สมัคร (30_Files) ตรงที่ไฟล์ชุดนี้ตั้งเป็น "ทุกคนที่มีลิงก์ดูได้"
 * เพราะเป็นของเผยแพร่อยู่แล้ว และให้เบราว์เซอร์โหลดตรงจาก Google ได้เร็ว ไม่ต้องผ่าน Apps Script ที่ตอบช้า
 * คู่มือเจ้าหน้าที่ใช้ลิงก์แบบเดียวกัน แต่ส่งลิงก์ให้เฉพาะคนที่เข้าสู่ระบบแล้ว (ลิงก์ไม่ปรากฏบนหน้าเว็บสาธารณะ)
 * โครงโฟลเดอร์: <โฟลเดอร์หลัก>/ประกาศ/ และ <โฟลเดอร์หลัก>/คู่มือ/
 */

function mediaFolder_(name) {
  return childFolder_(DriveApp.getFolderById(requireProp_(PROP_DRIVE_FOLDER_ID)), name);
}

function decodeMedia_(dataBase64, check) {
  let bytes;
  try {
    bytes = Utilities.base64Decode(String(dataBase64 || '').replace(/^data:[^,]*,/, ''));
  } catch (error) {
    throw appError_(ERROR_CODES.BAD_REQUEST, 'อ่านไฟล์ไม่ได้ กรุณาเลือกไฟล์ใหม่');
  }
  const head = bytes.slice(0, 8).map(function (b) { return b & 0xff; });
  const result = check(head, bytes.length);
  if (result.problem) throw appError_(ERROR_CODES.VALIDATION, result.problem);
  return { bytes: bytes, mime: result.mime };
}

function publicFile_(folderName, upload, name) {
  const file = mediaFolder_(folderName).createFile(Utilities.newBlob(upload.bytes, upload.mime, name));
  try {
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  } catch (error) {
    file.setTrashed(true);
    throw appError_(ERROR_CODES.CONFLICT, 'บัญชี Google นี้ไม่อนุญาตให้แชร์ไฟล์แบบมีลิงก์ จึงแสดงบนเว็บไม่ได้ ติดต่อผู้ดูแลบัญชี Google');
  }
  return file.getId();
}

/* ---------- โปสเตอร์ ---------- */

const posterUrl_ = function (fileId) { return `https://drive.google.com/thumbnail?id=${fileId}&sz=w2000`; };

/** payload.image = { dataBase64, width, height } → อัปโหลดใหม่ / payload.removeImage = true → เอาออก / ไม่ส่ง = คงเดิม */
function posterFromPayload_(payload) {
  if (payload.removeImage === true) return Domain.NO_POSTER;
  if (!payload.image || !payload.image.dataBase64) return undefined;
  const upload = decodeMedia_(payload.image.dataBase64, Domain.checkPoster);
  const fileId = publicFile_('ประกาศ', upload, `โปสเตอร์-${Utilities.formatDate(new Date(), 'Asia/Bangkok', 'yyyyMMdd-HHmmss')}.${Domain.extensionFor(upload.mime)}`);
  return { fileId: fileId, url: posterUrl_(fileId), width: Number(payload.image.width) || 0, height: Number(payload.image.height) || 0 };
}

function saveAnnouncementWithPoster_(staff, payload) {
  // อัปโหลดนอกล็อก (Drive ช้า) แล้วค่อยเขียนชีตในล็อก ถ้าเขียนไม่สำเร็จให้ทิ้งไฟล์ใหม่
  const image = posterFromPayload_(payload);
  let oldFileId = '';
  let before;
  let list;
  try {
    list = withScriptLock_(function () {
      const current = readAnnouncements_();
      const existing = current.find(function (item) { return item.id === payload.id; });
      before = existing;
      oldFileId = existing ? existing.imageFileId : '';
      const next = Domain.saveAnnouncement(current, payload, { nowIso: nowIso_(), newId: newId_ }, image);
      writeAnnouncements_(next);
      bumpDataVersion_();
      return next;
    });
  } catch (error) {
    if (image && image.fileId) trashFile_(image.fileId);
    throw error;
  }
  if (image !== undefined && oldFileId && oldFileId !== image.fileId) trashFile_(oldFileId);
  audit_(staff.username, 'saveAnnouncement', String(payload.title || ''), image === undefined ? '' : image.fileId ? 'poster' : 'remove poster');
  // ประกาศใหม่อยู่บนสุดของรายการ ประกาศที่แก้หาจาก id เดิม
  const saved = before ? list.find(function (item) { return item.id === before.id; }) : list[0];
  if (saved && Domain.isNewlyPublished(before, saved)) pushLine_(Domain.announcementLineText(saved, getProp_(PROP_PUBLIC_SITE_URL)));
  return { announcements: list, lineConfigured: Boolean(getProp_(PROP_LINE_TOKEN) && getProp_(PROP_LINE_TO)) };
}

function deleteAnnouncementWithPoster_(staff, payload) {
  let fileId = '';
  const list = withScriptLock_(function () {
    const current = readAnnouncements_();
    const existing = current.find(function (item) { return item.id === payload.id; });
    fileId = existing ? existing.imageFileId : '';
    const next = Domain.deleteAnnouncement(current, payload.id);
    writeAnnouncements_(next);
    bumpDataVersion_();
    return next;
  });
  trashFile_(fileId);
  audit_(staff.username, 'deleteAnnouncement', String(payload.id || ''), '');
  return { announcements: list };
}

/* ---------- คู่มือ ---------- */

function manualInfo_(stored) {
  if (!stored) return null;
  const image = stored.mime !== 'application/pdf';
  return {
    fileId: stored.fileId, name: stored.name, size: stored.size, updatedAt: stored.updatedAt, mime: stored.mime,
    // รูปแสดงตรงด้วย <img> (ขนาดใหญ่พอให้อ่านตัวหนังสือในอินโฟกราฟิกได้) / PDF เปิดผ่านตัวแสดงของ Drive
    viewUrl: image ? `https://drive.google.com/thumbnail?id=${stored.fileId}&sz=w2400` : `https://drive.google.com/file/d/${stored.fileId}/preview`,
    downloadUrl: `https://drive.google.com/uc?export=download&id=${stored.fileId}`,
  };
}

/** settingsRows: ส่งแถวชีต Settings ที่อ่านไว้แล้วมาได้ ไม่ต้องเปิดชีตซ้ำ */
function readManuals_(settingsRows) {
  const rows = settingsRows || readRows_(Domain.SHEET_SETTINGS).rows;
  const get = function (kind) {
    const row = rows.find(function (r) { return String(r[0]).trim() === Domain.manualSettingKey(kind); });
    return manualInfo_(row ? Domain.parseManual(row[1]) : null);
  };
  return { applicant: get('applicant'), staff: get('staff') };
}

function manualKind_(kind) {
  if (Domain.MANUAL_KINDS.indexOf(kind) === -1) throw appError_(ERROR_CODES.BAD_REQUEST, 'ไม่รู้จักคู่มือชนิดนี้');
  return kind;
}

function uploadManual_(staff, payload) {
  const kind = manualKind_(payload.kind);
  const upload = decodeMedia_(payload.dataBase64, Domain.checkManual);
  const name = String(payload.name || `คู่มือ.${Domain.extensionFor(upload.mime)}`).replace(/[\\/:*?"<>|]/g, '').slice(0, 120) || `คู่มือ.${Domain.extensionFor(upload.mime)}`;
  const fileId = publicFile_('คู่มือ', upload, `${Domain.MANUAL_LABEL[kind]}-${name}`);
  let oldFileId = '';
  try {
    withScriptLock_(function () {
      const old = readManuals_()[kind];
      oldFileId = old ? old.fileId : '';
      writeSetting_(Domain.manualSettingKey(kind), JSON.stringify({ fileId: fileId, name: name, size: upload.bytes.length, updatedAt: nowIso_(), mime: upload.mime }));
      bumpDataVersion_();
    });
  } catch (error) {
    trashFile_(fileId);
    throw error;
  }
  trashFile_(oldFileId);
  audit_(staff.username, 'uploadManual', kind, name);
  return { manuals: readManuals_() };
}

function deleteManual_(staff, payload) {
  const kind = manualKind_(payload.kind);
  let oldFileId = '';
  withScriptLock_(function () {
    const old = readManuals_()[kind];
    oldFileId = old ? old.fileId : '';
    writeSetting_(Domain.manualSettingKey(kind), '');
    bumpDataVersion_();
  });
  trashFile_(oldFileId);
  audit_(staff.username, 'deleteManual', kind, '');
  return { manuals: readManuals_() };
}

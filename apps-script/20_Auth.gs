/**
 * การยืนยันตัวตน
 *
 * เจ้าหน้าที่: ชื่อผู้ใช้ + รหัสผ่าน → session token อายุ 12 ชม. (HMAC ลงชื่อด้วย SESSION_SECRET)
 *   ชีต Staff เก็บแค่ HMAC ของรหัสผ่าน ทุกคำขอเช็กสิทธิ์จากชีตใหม่ ไม่เชื่อสิทธิ์ใน token
 *   เพิ่ม tokenVersion ในชีต = เตะทุก session ของคนนั้นออกทันที
 * ผู้สมัคร: ไม่มีบัญชี ใช้เลขบัตร + วันเกิด และจำกัดจำนวนครั้งที่ผิด
 */

function hmacBase64_(message, secret) {
  return Utilities.base64EncodeWebSafe(Utilities.computeHmacSha256Signature(message, secret));
}

/** เทียบสตริงแบบใช้เวลาเท่ากันทุกครั้ง ไม่ให้วัดเวลาตอบเพื่อเดาลายเซ็นทีละตัว */
function constantTimeEqual_(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function passwordHash_(username, salt, password) {
  return hmacBase64_(`${username}\n${salt}\n${password}`, requireProp_(PROP_PASSWORD_PEPPER));
}

function newPasswordCredential_(username, password) {
  const salt = Utilities.getUuid().replace(/-/g, '');
  return { passwordSalt: salt, passwordHash: passwordHash_(username, salt, password) };
}

/* ---------- ตัวนับความล้มเหลว (CacheService) ---------- */

function counter_(key) {
  const cached = CacheService.getScriptCache().get(key);
  return cached === null ? 0 : Number(cached) || 0;
}

/* CacheService ไม่บวกเลขแบบอะตอมมิก ยิงพร้อมกันอาจนับขาดบ้าง ยอมรับได้เพราะหน้าที่คือกันการยิงรัว */
function bump_(key, ttlSeconds) {
  CacheService.getScriptCache().put(key, String(counter_(key) + 1), ttlSeconds);
}

const hourBucket_ = function () { return Math.floor(Date.now() / 3600000); };

/* ---------- เจ้าหน้าที่ ---------- */

function readStaff_() {
  const data = readRows_(Domain.SHEET_STAFF);
  return data.rows.map(function (row, index) {
    const out = { rowNumber: index + 2 };
    data.header.forEach(function (column, c) { out[column] = row[c]; });
    return out;
  }).filter(function (staff) { return staff.username; });
}

function publicStaff_(staff) {
  return { username: staff.username, displayName: staff.displayName, role: staff.role === 'admin' ? 'admin' : 'staff' };
}

function login_(payload) {
  const username = String(payload.username || '').trim().toLowerCase();
  const password = String(payload.password || '');
  const failKey = `login_fail_${Utilities.base64EncodeWebSafe(username)}`;
  if (counter_(failKey) >= LOGIN_MAX_FAILURES) {
    throw appError_(ERROR_CODES.BUSY, `ใส่รหัสผิดหลายครั้ง บัญชีนี้ถูกล็อกชั่วคราว ${LOGIN_LOCK_MINUTES} นาที`);
  }
  const staff = readStaff_().find(function (item) { return String(item.username).toLowerCase() === username; });
  const ok = staff && staff.passwordHash && constantTimeEqual_(passwordHash_(staff.username, staff.passwordSalt, password), staff.passwordHash);
  if (!ok) {
    bump_(failKey, LOGIN_LOCK_MINUTES * 60);
    // ข้อความเดียวกันทั้งชื่อผิดและรหัสผิด ไม่บอกใบ้ว่าชื่อไหนมีอยู่จริง
    throw appError_(ERROR_CODES.UNAUTHENTICATED, 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
  }
  if (staff.status !== 'active') throw appError_(ERROR_CODES.FORBIDDEN, 'บัญชีนี้ถูกปิดการใช้งาน');

  CacheService.getScriptCache().remove(failKey);
  getSheet_(Domain.SHEET_STAFF).getRange(staff.rowNumber, Domain.STAFF_COLUMNS.indexOf('lastLoginAt') + 1).setValue(nowIso_());
  return { token: issueToken_(staff.username, Number(staff.tokenVersion) || 1), staff: publicStaff_(staff) };
}

function issueToken_(username, version) {
  const body = Utilities.base64EncodeWebSafe(JSON.stringify({ u: username, v: version, exp: Date.now() + SESSION_TTL_MS }));
  return `${body}.${hmacBase64_(body, requireProp_(PROP_SESSION_SECRET))}`;
}

/**
 * เจ้าหน้าที่เปลี่ยนรหัสผ่านเอง — ต้องใส่รหัสเดิมถูก (ใส่ผิดนับรวมกับการล็อกอินผิด)
 * เปลี่ยนแล้วเครื่องอื่นที่ล็อกอินค้างไว้หลุดทั้งหมด เครื่องนี้ได้ token ใหม่ใช้ต่อได้เลย
 */
function changePassword_(token, payload) {
  const me = authenticate_(token);
  const current = String(payload.currentPassword || '');
  const next = String(payload.newPassword || '');
  const failKey = `login_fail_${Utilities.base64EncodeWebSafe(me.username.toLowerCase())}`;
  if (counter_(failKey) >= LOGIN_MAX_FAILURES) {
    throw appError_(ERROR_CODES.BUSY, `ใส่รหัสผิดหลายครั้ง บัญชีนี้ถูกล็อกชั่วคราว ${LOGIN_LOCK_MINUTES} นาที`);
  }
  const problem = Domain.checkNewPassword(current, next);
  if (problem) throw appError_(ERROR_CODES.VALIDATION, problem, [{ field: 'newPassword', message: problem }]);

  return withScriptLock_(function () {
    const staff = readStaff_().find(function (item) { return item.username === me.username; });
    if (!constantTimeEqual_(passwordHash_(staff.username, staff.passwordSalt, current), staff.passwordHash)) {
      bump_(failKey, LOGIN_LOCK_MINUTES * 60);
      throw appError_(ERROR_CODES.VALIDATION, 'รหัสผ่านเดิมไม่ถูกต้อง', [{ field: 'currentPassword', message: 'รหัสผ่านเดิมไม่ถูกต้อง' }]);
    }
    const credential = newPasswordCredential_(staff.username, next);
    const version = (Number(staff.tokenVersion) || 1) + 1;
    const sheet = getSheet_(Domain.SHEET_STAFF);
    const col = function (name) { return Domain.STAFF_COLUMNS.indexOf(name) + 1; };
    sheet.getRange(staff.rowNumber, col('passwordSalt')).setValue(credential.passwordSalt);
    sheet.getRange(staff.rowNumber, col('passwordHash')).setValue(credential.passwordHash);
    sheet.getRange(staff.rowNumber, col('tokenVersion')).setValue(String(version));
    CacheService.getScriptCache().remove(failKey);
    return { token: issueToken_(staff.username, version) };
  });
}

/** ตรวจ token แล้วคืนข้อมูลเจ้าหน้าที่จากชีต (ไม่ใช่จาก token) */
function authenticate_(token) {
  const parts = String(token || '').split('.');
  const denied = appError_(ERROR_CODES.UNAUTHENTICATED, 'กรุณาเข้าสู่ระบบใหม่');
  if (parts.length !== 2) throw denied;
  if (!constantTimeEqual_(hmacBase64_(parts[0], requireProp_(PROP_SESSION_SECRET)), parts[1])) throw denied;
  let claims;
  try {
    claims = JSON.parse(Utilities.newBlob(Utilities.base64DecodeWebSafe(parts[0])).getDataAsString());
  } catch (error) {
    throw denied;
  }
  if (!claims || Number(claims.exp) < Date.now()) throw denied;
  const staff = readStaff_().find(function (item) { return item.username === claims.u; });
  if (!staff || staff.status !== 'active' || (Number(staff.tokenVersion) || 1) !== claims.v) throw denied;
  return publicStaff_(staff);
}

function requireAdmin_(token) {
  const staff = authenticate_(token);
  if (staff.role !== 'admin') throw appError_(ERROR_CODES.FORBIDDEN, 'เฉพาะผู้ดูแลระบบ');
  return staff;
}

/* ---------- ผู้สมัคร (เลขบัตร + วันเกิด) ---------- */

/**
 * หาใบสมัครของผู้สมัครเอง — ผิดเกินกำหนดต่อเลขบัตรหรือรวมทั้งระบบ ปิดการตรวจชั่วคราว
 * ข้อความตอนไม่พบเหมือนกันทุกกรณี ไม่บอกว่าเลขบัตรนี้เคยสมัครหรือไม่
 */
function findOwnApplication_(payload) {
  const nationalId = String(payload.nationalId || '').replace(/\D/g, '');
  const failKey = `lookup_fail_${nationalId}`;
  const globalKey = `lookup_fail_all_${hourBucket_()}`;
  if (counter_(globalKey) >= LOOKUP_FAILURE_LIMIT_PER_HOUR) {
    throw appError_(ERROR_CODES.BUSY, 'ระบบตรวจสถานะปิดชั่วคราวเพราะมีการค้นหาผิดจำนวนมาก กรุณาลองใหม่ในอีก 1 ชั่วโมง');
  }
  if (counter_(failKey) >= LOOKUP_MAX_FAILURES) {
    throw appError_(ERROR_CODES.BUSY, `ค้นหาด้วยเลขบัตรนี้ผิดหลายครั้ง กรุณาลองใหม่ในอีก ${LOOKUP_LOCK_MINUTES} นาที`);
  }
  const applicant = Domain.findByCredentials(sheetRepo_(), payload.nationalId, payload.birthDate);
  if (applicant === null) {
    bump_(failKey, LOOKUP_LOCK_MINUTES * 60);
    bump_(globalKey, 3900);
    throw appError_(ERROR_CODES.NOT_FOUND, 'ไม่พบใบสมัคร ตรวจเลขบัตรประชาชนและวันเกิดให้ตรงกับที่กรอกตอนสมัคร');
  }
  return applicant;
}

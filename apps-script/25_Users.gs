/**
 * จัดการบัญชีเจ้าหน้าที่ (เฉพาะผู้ดูแลระบบ) — กฎอยู่ใน Domain (shared/users.ts) ใช้ร่วมกับโหมดสาธิต
 * ทุกคำสั่งทำใน script lock แล้วอ่านชีตใหม่ข้างใน กันสองเครื่องแก้บัญชีเดียวกันพร้อมกัน
 */

function staffAccount_(staff) {
  return {
    username: staff.username,
    displayName: staff.displayName,
    role: staff.role === 'admin' ? 'admin' : 'staff',
    status: staff.status === 'active' ? 'active' : 'disabled',
    lastLoginAt: staff.lastLoginAt instanceof Date ? staff.lastLoginAt.toISOString() : String(staff.lastLoginAt || ''),
  };
}

function listStaffAccounts_() {
  return readStaff_().map(staffAccount_);
}

function staffCell_(staff, column, value) {
  getSheet_(Domain.SHEET_STAFF).getRange(staff.rowNumber, Domain.STAFF_COLUMNS.indexOf(column) + 1).setValue(value);
}

function findStaffOrFail_(username) {
  const staff = readStaff_().find(function (item) { return item.username === username; });
  if (!staff) throw appError_(ERROR_CODES.NOT_FOUND, 'ไม่พบบัญชีนี้');
  return staff;
}

function createStaffAccount_(actor, payload) {
  const input = Domain.normalizeStaffInput(payload);
  const password = String(payload.password || '');
  return withScriptLock_(function () {
    const issues = Domain.validateStaffInput(input, listStaffAccounts_(), true, password);
    if (issues.length) throw appError_(ERROR_CODES.VALIDATION, issues[0].message, issues);
    const credential = newPasswordCredential_(input.username, password);
    const row = { username: input.username, displayName: input.displayName, role: input.role, status: 'active',
      passwordSalt: credential.passwordSalt, passwordHash: credential.passwordHash, tokenVersion: '1', lastLoginAt: '' };
    getSheet_(Domain.SHEET_STAFF).appendRow(Domain.STAFF_COLUMNS.map(function (column) { return row[column]; }));
    audit_(actor.username, 'createStaff', input.username, input.role);
    return { users: listStaffAccounts_() };
  });
}

function updateStaffAccount_(actor, payload) {
  const input = Domain.normalizeStaffInput(payload);
  return withScriptLock_(function () {
    const issues = Domain.validateStaffInput(input, [], false);
    if (issues.length) throw appError_(ERROR_CODES.VALIDATION, issues[0].message, issues);
    const problem = Domain.staffChangeProblem(listStaffAccounts_(), actor.username, input.username, { role: input.role, status: input.status });
    if (problem) throw appError_(ERROR_CODES.CONFLICT, problem);
    const staff = findStaffOrFail_(input.username);
    staffCell_(staff, 'displayName', input.displayName);
    staffCell_(staff, 'role', input.role);
    staffCell_(staff, 'status', input.status);
    // ปิดบัญชีหรือลดสิทธิ์ = เตะทุกเครื่องที่ล็อกอินค้างไว้ออกทันที
    if (input.status !== staff.status || input.role !== staff.role) staffCell_(staff, 'tokenVersion', String((Number(staff.tokenVersion) || 1) + 1));
    audit_(actor.username, 'updateStaff', input.username, `${input.role} ${input.status}`);
    return { users: listStaffAccounts_() };
  });
}

function adminResetPassword_(actor, payload) {
  const username = String(payload.username || '');
  const password = String(payload.password || '');
  const problem = Domain.checkNewPassword('', password);
  if (problem) throw appError_(ERROR_CODES.VALIDATION, problem, [{ field: 'password', message: problem }]);
  return withScriptLock_(function () {
    const staff = findStaffOrFail_(username);
    const credential = newPasswordCredential_(staff.username, password);
    staffCell_(staff, 'passwordSalt', credential.passwordSalt);
    staffCell_(staff, 'passwordHash', credential.passwordHash);
    staffCell_(staff, 'tokenVersion', String((Number(staff.tokenVersion) || 1) + 1));
    CacheService.getScriptCache().remove(`login_fail_${Utilities.base64EncodeWebSafe(staff.username.toLowerCase())}`);
    audit_(actor.username, 'resetStaffPassword', staff.username, '');
    return { users: listStaffAccounts_() };
  });
}

function deleteStaffAccount_(actor, payload) {
  const username = String(payload.username || '');
  return withScriptLock_(function () {
    const problem = Domain.staffChangeProblem(listStaffAccounts_(), actor.username, username, null);
    if (problem) throw appError_(ERROR_CODES.CONFLICT, problem);
    getSheet_(Domain.SHEET_STAFF).deleteRow(findStaffOrFail_(username).rowNumber);
    audit_(actor.username, 'deleteStaff', username, '');
    return { users: listStaffAccounts_() };
  });
}

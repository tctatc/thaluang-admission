/**
 * ค่าคอนฟิกของระบบรับสมัคร — เก็บใน Script Properties ไม่เขียนลงโค้ด
 * รัน setupSystem() ครั้งแรกครั้งเดียว ระบบสร้างค่าที่จำเป็นให้เอง
 * ค่าที่ต้องใส่เองภายหลัง (ถ้าจะใช้แจ้งเตือน): LINE_CHANNEL_TOKEN, LINE_TO, NOTIFY_EMAIL, PUBLIC_SITE_URL
 */

const PROP_SPREADSHEET_ID = 'SPREADSHEET_ID';
const PROP_DRIVE_FOLDER_ID = 'DRIVE_FOLDER_ID';
const PROP_SESSION_SECRET = 'SESSION_SECRET';
/** กุญแจลับที่ผสมตอน hash รหัสผ่าน — ห้ามเปลี่ยน ไม่งั้นรหัสผ่านทุกคนใช้ไม่ได้ */
const PROP_PASSWORD_PEPPER = 'PASSWORD_PEPPER';
const PROP_LINE_TOKEN = 'LINE_CHANNEL_TOKEN';
/** userId หรือ groupId ของกลุ่มเจ้าหน้าที่ที่บอท LINE OA อยู่ */
const PROP_LINE_TO = 'LINE_TO';
/** ตั้งเป็น on เมื่ออยากให้ผู้สมัครใหม่เด้งเข้า LINE ด้วย (ค่าเริ่มต้นปิด แจ้งเฉพาะประกาศใหม่) */
const PROP_LINE_NEW_APPLICANT = 'LINE_NEW_APPLICANT';
const PROP_NOTIFY_EMAIL = 'NOTIFY_EMAIL';
/** ลิงก์หน้าเว็บ (GitHub Pages) ใช้แนบในอีเมลถึงผู้สมัคร */
const PROP_PUBLIC_SITE_URL = 'PUBLIC_SITE_URL';
const PROP_DATA_VERSION = 'DATA_VERSION';

const SESSION_TTL_MS = 12 * 60 * 60 * 1000;
const LOCK_TIMEOUT_MS = 25 * 1000;

/** เข้าสู่ระบบเจ้าหน้าที่ผิดติดกันกี่ครั้งจึงล็อกบัญชีชั่วคราว */
const LOGIN_MAX_FAILURES = 5;
const LOGIN_LOCK_MINUTES = 15;

/**
 * ตรวจสถานะด้วยเลขบัตร + วันเกิด: วันเกิดมีให้เดาแค่ไม่กี่พันค่าต่อเลขบัตร
 * จึงต้องจำกัดครั้งที่ผิดต่อเลขบัตร และเพดานรวมทั้งระบบ (กันไล่เดาหลายเลขพร้อมกัน)
 */
const LOOKUP_MAX_FAILURES = 5;
const LOOKUP_LOCK_MINUTES = 30;
const LOOKUP_FAILURE_LIMIT_PER_HOUR = 300;

const ERROR_CODES = {
  BAD_REQUEST: 'BAD_REQUEST',
  UNAUTHENTICATED: 'UNAUTHENTICATED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  VALIDATION: 'VALIDATION',
  BUSY: 'BUSY',
  NOT_CONFIGURED: 'NOT_CONFIGURED',
  INTERNAL: 'INTERNAL',
};

function scriptProps_() {
  return PropertiesService.getScriptProperties();
}

function getProp_(key) {
  const value = scriptProps_().getProperty(key);
  return value === null ? '' : value;
}

function requireProp_(key) {
  const value = getProp_(key);
  if (value === '') throw appError_(ERROR_CODES.NOT_CONFIGURED, `ยังไม่ได้ตั้งค่า ${key} — รัน setupSystem() ก่อน`);
  return value;
}

function appError_(code, message, details) {
  const error = new Error(message);
  error.appCode = code;
  if (details !== undefined) error.appDetails = details;
  return error;
}

function nowIso_() {
  return new Date().toISOString();
}

function newId_() {
  return `app_${Utilities.getUuid().replace(/-/g, '').substring(0, 16)}`;
}

function withScriptLock_(operation) {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(LOCK_TIMEOUT_MS)) {
    throw appError_(ERROR_CODES.BUSY, 'ขณะนี้มีผู้สมัครส่งข้อมูลพร้อมกันจำนวนมาก กรุณากดส่งอีกครั้งในอีกสักครู่');
  }
  try {
    return operation();
  } finally {
    lock.releaseLock();
  }
}

/** ให้หน้าเว็บเจ้าหน้าที่รู้ว่ามีข้อมูลใหม่ โดยถามแค่เลขนี้ (เบามาก) แทนดึงรายการทั้งหมดทุกครั้ง */
function getDataVersion_() {
  return Number(getProp_(PROP_DATA_VERSION)) || 0;
}

function bumpDataVersion_() {
  scriptProps_().setProperty(PROP_DATA_VERSION, String(getDataVersion_() + 1));
}

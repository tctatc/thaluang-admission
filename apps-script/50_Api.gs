/**
 * ประตูเดียวที่หน้าเว็บคุยกับ server
 *
 * คำขอ (POST, Content-Type: text/plain): { "action": "...", "token": "...", "payload": {...} }
 * คำตอบ: { "ok": true, "data": {...} } หรือ { "ok": false, "error": { "code", "message", "issues" } }
 * Apps Script ตอบ HTTP 200 เสมอ หน้าเว็บต้องดูฟิลด์ ok
 */

function doGet(e) {
  const action = e && e.parameter ? e.parameter.action : '';
  try {
    if (action === 'version') return jsonOutput_({ ok: true, data: { dataVersion: getDataVersion_(), serverTime: nowIso_() } });
    return jsonOutput_({ ok: true, data: { service: 'ระบบรับสมัครเรียนออนไลน์', serverTime: nowIso_() } });
  } catch (error) {
    return jsonOutput_(errorEnvelope_(error));
  }
}

function doPost(e) {
  let request;
  try {
    request = parseRequest_(e);
  } catch (error) {
    return jsonOutput_(errorEnvelope_(error));
  }
  try {
    const handler = apiHandlers_()[request.action];
    if (handler === undefined) throw appError_(ERROR_CODES.BAD_REQUEST, `ไม่รู้จักคำสั่ง "${request.action}"`);
    return jsonOutput_({ ok: true, data: handler(request.payload, request.token) });
  } catch (error) {
    console.error(`คำสั่ง ${request.action} ล้มเหลว: ${error && error.message}`);
    return jsonOutput_(errorEnvelope_(error));
  }
}

function parseRequest_(e) {
  if (!e || !e.postData || !e.postData.contents) throw appError_(ERROR_CODES.BAD_REQUEST, 'ไม่พบข้อมูลคำขอ');
  let body;
  try {
    body = JSON.parse(e.postData.contents);
  } catch (error) {
    throw appError_(ERROR_CODES.BAD_REQUEST, 'รูปแบบข้อมูลคำขอไม่ถูกต้อง');
  }
  const action = typeof body.action === 'string' ? body.action : '';
  if (action === '') throw appError_(ERROR_CODES.BAD_REQUEST, 'ไม่ได้ระบุคำสั่ง');
  return {
    action: action,
    token: typeof body.token === 'string' ? body.token : '',
    payload: body.payload && typeof body.payload === 'object' ? body.payload : {},
  };
}

function ctx_(actor) {
  return { nowIso: nowIso_(), newId: newId_, actor: actor };
}

function photoDataUrl_(applicant) {
  const photo = applicant.documents.photo;
  if (!photo) return '';
  try {
    const file = readFileBase64_(photo.fileId);
    return `data:${file.mime};base64,${file.dataBase64}`;
  } catch (error) {
    return '';
  }
}

/**
 * เก็บผลลัพธ์ไว้ใน CacheService ตามเลขเวอร์ชันข้อมูล — ข้อมูลเปลี่ยน = เวอร์ชันเปลี่ยน = คำนวณใหม่เอง
 * อายุสั้น (5 นาที) เผื่อเจ้าหน้าที่แก้ชีตตรง ๆ ซึ่งไม่ได้เพิ่มเวอร์ชัน
 * Apps Script เปิดไฟล์ชีตครั้งละ ~1 วินาที การไม่ต้องเปิดเลยคือส่วนที่เร็วขึ้นมากที่สุด
 */
function cachedByVersion_(name, compute) {
  const cache = CacheService.getScriptCache();
  const key = `${name}_${getDataVersion_()}`;
  const hit = cache.get(key);
  if (hit !== null) return JSON.parse(hit);
  const value = compute();
  const text = JSON.stringify(value);
  if (text.length < 95000) cache.put(key, text, 300);
  return value;
}

function publicConfig_() {
  const settings = readSettings_();
  return {
    academicYear: settings.academicYear,
    applicationsOpen: settings.applicationsOpen,
    programs: readPrograms_().filter(function (program) { return program.active; }),
    siteText: { heroTitle: settings.heroTitle, heroText: settings.heroText, details: settings.details },
  };
}

function apiHandlers_() {
  return {
    /* ---------- ผู้สมัคร (ไม่ต้องเข้าสู่ระบบ) ---------- */

    config: function () {
      return cachedByVersion_('config', publicConfig_);
    },

    /** ทุกอย่างที่หน้าแรกต้องใช้ในคำขอเดียว (เดิมแยก 4 คำขอ แต่ละคำขอเปิดชีตเอง) */
    home: function () {
      return cachedByVersion_('home', function () {
        const settings = readSettings_();
        const programs = readPrograms_();
        return {
          dataVersion: getDataVersion_(),
          config: publicConfig_(),
          announcements: Domain.publicAnnouncements(readAnnouncements_()),
          stats: Domain.computePublicStats(sheetRepo_().list(), programs, settings.academicYear, nowIso_()),
        };
      });
    },

    announcements: function () {
      return cachedByVersion_('announcements', function () {
        return { announcements: Domain.publicAnnouncements(readAnnouncements_()) };
      });
    },

    submitApplication: function (payload) {
      const programs = readPrograms_();
      const applicant = withScriptLock_(function () {
        const created = Domain.submitApplication(sheetRepo_(), readSettings_(), programs, payload, ctx_('ผู้สมัคร'));
        bumpDataVersion_();
        return created;
      });
      notifyNewApplication_(applicant, programs);
      return { applicant: Domain.publicView(applicant) };
    },

    publicStats: function () {
      return cachedByVersion_('public_stats', function () {
        return Domain.computePublicStats(sheetRepo_().list(), readPrograms_(), readSettings_().academicYear, nowIso_());
      });
    },

    lookup: function (payload) {
      const applicant = findOwnApplication_(payload);
      return { applicant: Domain.publicView(applicant), photo: photoDataUrl_(applicant) };
    },

    uploadDocument: function (payload) {
      const kind = Domain.assertDocKind(payload.kind);
      const upload = decodeUpload_(payload.dataBase64, Domain.DOC_INFO[kind].imageOnly);
      const result = withScriptLock_(function () {
        const applicant = findOwnApplication_(payload);
        Domain.assertCanAttach(applicant, kind);
        const saved = saveFile_(applicant, kind, upload);
        const attached = Domain.attachDocument(sheetRepo_(), applicant, kind, saved, ctx_('ผู้สมัคร'));
        bumpDataVersion_();
        return attached;
      });
      trashFile_(result.replacedFileId);
      return { applicant: Domain.publicView(result.applicant) };
    },

    /* ---------- เจ้าหน้าที่ ---------- */

    login: function (payload) {
      return login_(payload);
    },

    changePassword: function (payload, token) {
      return changePassword_(token, payload);
    },

    /* ---------- ผู้ดูแล: บัญชีเจ้าหน้าที่ ---------- */

    listStaff: function (payload, token) {
      requireAdmin_(token);
      return { users: listStaffAccounts_() };
    },
    createStaff: function (payload, token) {
      return createStaffAccount_(requireAdmin_(token), payload);
    },
    updateStaff: function (payload, token) {
      return updateStaffAccount_(requireAdmin_(token), payload);
    },
    resetStaffPassword: function (payload, token) {
      return adminResetPassword_(requireAdmin_(token), payload);
    },
    deleteStaff: function (payload, token) {
      return deleteStaffAccount_(requireAdmin_(token), payload);
    },

    /** หน้าเจ้าหน้าที่เปิดครั้งแรก: ตรวจสิทธิ์ครั้งเดียว แล้วส่งทุกอย่างกลับในคำขอเดียว */
    staffBootstrap: function (payload, token) {
      const staff = authenticate_(token);
      return {
        staff: staff,
        settings: readSettings_(),
        programs: readPrograms_(),
        applicants: sheetRepo_().list(),
        dataVersion: getDataVersion_(),
      };
    },

    me: function (payload, token) {
      return { staff: authenticate_(token), settings: readSettings_(), programs: readPrograms_(), dataVersion: getDataVersion_() };
    },

    applicants: function (payload, token) {
      authenticate_(token);
      return { applicants: sheetRepo_().list(), dataVersion: getDataVersion_() };
    },

    getFile: function (payload, token) {
      authenticate_(token);
      const applicant = Domain.getApplicant(sheetRepo_(), String(payload.id || ''));
      const doc = applicant.documents[Domain.assertDocKind(payload.kind)];
      if (!doc) throw appError_(ERROR_CODES.NOT_FOUND, 'ผู้สมัครยังไม่ได้แนบเอกสารนี้');
      const file = readFileBase64_(doc.fileId);
      return { name: doc.name, mime: file.mime, dataBase64: file.dataBase64 };
    },

    reviewDocument: function (payload, token) {
      const staff = authenticate_(token);
      const applicant = withScriptLock_(function () {
        const next = Domain.reviewDocument(sheetRepo_(), String(payload.id || ''), payload.kind, payload.state, payload.note, ctx_(staff.username));
        bumpDataVersion_();
        return next;
      });
      audit_(staff.username, 'reviewDocument', applicant.appNo, `${payload.kind}=${payload.state}`);
      if (payload.state === 'fix') notifyApplicantUpdate_(applicant);
      return { applicant: applicant };
    },

    setStatus: function (payload, token) {
      const staff = authenticate_(token);
      const applicant = withScriptLock_(function () {
        const next = Domain.setStatus(sheetRepo_(), String(payload.id || ''), payload.status, payload.note, ctx_(staff.username));
        bumpDataVersion_();
        return next;
      });
      audit_(staff.username, 'setStatus', applicant.appNo, applicant.status);
      notifyApplicantUpdate_(applicant);
      return { applicant: applicant };
    },

    enroll: function (payload, token) {
      const staff = authenticate_(token);
      const applicant = withScriptLock_(function () {
        const next = Domain.enroll(sheetRepo_(), readSettings_(), readPrograms_(), String(payload.id || ''), payload.enrollment, ctx_(staff.username));
        bumpDataVersion_();
        return next;
      });
      audit_(staff.username, 'enroll', applicant.appNo, applicant.studentId);
      return { applicant: applicant };
    },

    updateApplicant: function (payload, token) {
      const staff = authenticate_(token);
      const applicant = withScriptLock_(function () {
        const next = Domain.updateApplicant(sheetRepo_(), readPrograms_(), String(payload.id || ''), payload.applicant, ctx_(staff.username));
        bumpDataVersion_();
        return next;
      });
      audit_(staff.username, 'updateApplicant', applicant.appNo, '');
      return { applicant: applicant };
    },

    /* ---------- เฉพาะผู้ดูแล ---------- */

    saveSettings: function (payload, token) {
      const staff = requireAdmin_(token);
      const settings = Domain.normalizeSettings(payload);
      withScriptLock_(function () {
        writeSetting_('academicYear', settings.academicYear);
        writeSetting_('applicationsOpen', settings.applicationsOpen ? 'TRUE' : 'FALSE');
        writeSetting_('studentIdPattern', settings.studentIdPattern);
        Domain.SETTING_TEXT_FIELDS.forEach(function (field) { writeSetting_(field, settings[field]); });
        bumpDataVersion_();
      });
      audit_(staff.username, 'saveSettings', '', '');
      return { settings: readSettings_() };
    },

    savePrograms: function (payload, token) {
      const staff = requireAdmin_(token);
      const programs = withScriptLock_(function () {
        const next = Domain.normalizePrograms(payload.programs, sheetRepo_().list());
        writePrograms_(next);
        bumpDataVersion_();
        return next;
      });
      audit_(staff.username, 'savePrograms', '', `${programs.length} สาขา`);
      return { programs: programs };
    },

    adminAnnouncements: function (payload, token) {
      authenticate_(token);
      return { announcements: readAnnouncements_() };
    },

    saveAnnouncement: function (payload, token) {
      const staff = requireAdmin_(token);
      const list = withScriptLock_(function () {
        const next = Domain.saveAnnouncement(readAnnouncements_(), payload, { nowIso: nowIso_(), newId: newId_ });
        writeAnnouncements_(next);
        bumpDataVersion_();
        return next;
      });
      audit_(staff.username, 'saveAnnouncement', String(payload.title || ''), '');
      return { announcements: list };
    },

    deleteAnnouncement: function (payload, token) {
      const staff = requireAdmin_(token);
      const list = withScriptLock_(function () {
        const next = Domain.deleteAnnouncement(readAnnouncements_(), payload.id);
        writeAnnouncements_(next);
        bumpDataVersion_();
        return next;
      });
      audit_(staff.username, 'deleteAnnouncement', String(payload.id || ''), '');
      return { announcements: list };
    },
  };
}

function errorEnvelope_(error) {
  const code = (error && error.appCode) || ERROR_CODES.INTERNAL;
  const message = code === ERROR_CODES.INTERNAL
    ? 'ระบบขัดข้อง กรุณาลองอีกครั้ง หากยังเกิดซ้ำให้แจ้งเจ้าหน้าที่'
    : (error && error.message) || 'เกิดข้อผิดพลาด';
  const envelope = { ok: false, error: { code: code, message: message } };
  if (error && error.appDetails !== undefined) envelope.error.issues = error.appDetails;
  if (code === ERROR_CODES.INTERNAL && error) console.error(`ข้อผิดพลาดที่ไม่คาดคิด: ${error.message}\n${error.stack || ''}`);
  return envelope;
}

function jsonOutput_(object) {
  return ContentService.createTextOutput(JSON.stringify(object)).setMimeType(ContentService.MimeType.JSON);
}

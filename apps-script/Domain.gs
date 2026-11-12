var Domain = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // shared/index.ts
  var index_exports = {};
  __export(index_exports, {
    ALLOWED_MIME: () => ALLOWED_MIME,
    ANNOUNCEMENT_COLUMNS: () => ANNOUNCEMENT_COLUMNS,
    APPLICANT_COLUMNS: () => APPLICANT_COLUMNS,
    AUDIT_COLUMNS: () => AUDIT_COLUMNS,
    CHANNELS: () => CHANNELS,
    CURRENT_LEVELS: () => CURRENT_LEVELS,
    DEFAULT_SETTINGS: () => DEFAULT_SETTINGS,
    DOC_INFO: () => DOC_INFO,
    DOC_KINDS: () => DOC_KINDS,
    DOC_STATES: () => DOC_STATES,
    DOC_STATE_LABEL: () => DOC_STATE_LABEL,
    ENROLLMENT_FIELDS: () => ENROLLMENT_FIELDS,
    EXPORT_PRESET_LABEL: () => EXPORT_PRESET_LABEL,
    FEEDBACK_COLUMNS: () => FEEDBACK_COLUMNS,
    FEEDBACK_ITEMS: () => FEEDBACK_ITEMS,
    INPUT_FIELDS: () => INPUT_FIELDS,
    LEVELS: () => LEVELS,
    LEVEL_LABEL: () => LEVEL_LABEL,
    MANUAL_KINDS: () => MANUAL_KINDS,
    MANUAL_LABEL: () => MANUAL_LABEL,
    MAX_FILE_BYTES: () => MAX_FILE_BYTES,
    MAX_MANUAL_BYTES: () => MAX_MANUAL_BYTES,
    MAX_POSTER_BYTES: () => MAX_POSTER_BYTES,
    NO_POSTER: () => NO_POSTER,
    PASSWORD_MIN: () => PASSWORD_MIN,
    PREFIXES: () => PREFIXES,
    PROGRAM_COLUMNS: () => PROGRAM_COLUMNS,
    PROVINCES: () => PROVINCES,
    SAMPLE_PROGRAMS: () => SAMPLE_PROGRAMS,
    SCORE_LABEL: () => SCORE_LABEL,
    SETTINGS_COLUMNS: () => SETTINGS_COLUMNS,
    SETTING_TEXT_FIELDS: () => SETTING_TEXT_FIELDS,
    SHEET_ANNOUNCEMENTS: () => SHEET_ANNOUNCEMENTS,
    SHEET_APPLICANTS: () => SHEET_APPLICANTS,
    SHEET_AUDIT: () => SHEET_AUDIT,
    SHEET_BACKUP_FOLDER: () => SHEET_BACKUP_FOLDER,
    SHEET_FEEDBACK: () => SHEET_FEEDBACK,
    SHEET_PROGRAMS: () => SHEET_PROGRAMS,
    SHEET_SETTINGS: () => SHEET_SETTINGS,
    SHEET_STAFF: () => SHEET_STAFF,
    STAFF_COLUMNS: () => STAFF_COLUMNS,
    STAFF_ROLES: () => STAFF_ROLES,
    STAFF_ROLE_HINT: () => STAFF_ROLE_HINT,
    STAFF_ROLE_LABEL: () => STAFF_ROLE_LABEL,
    STATUSES: () => STATUSES,
    STATUS_LABEL: () => STATUS_LABEL,
    THAI_MONTHS: () => THAI_MONTHS,
    TRACK_LABEL: () => TRACK_LABEL,
    ageOn: () => ageOn,
    announcementLineText: () => announcementLineText,
    announcementToRow: () => announcementToRow,
    applicantToRow: () => applicantToRow,
    assertCanAttach: () => assertCanAttach,
    assertDocKind: () => assertDocKind,
    attachDocument: () => attachDocument,
    bangkokDateKey: () => bangkokDateKey,
    bangkokDateParts: () => bangkokDateParts,
    checkManual: () => checkManual,
    checkNewPassword: () => checkNewPassword,
    checkPoster: () => checkPoster,
    checkStudentIdPattern: () => checkStudentIdPattern,
    checkUpload: () => checkUpload,
    computePublicStats: () => computePublicStats,
    computeStats: () => computeStats,
    countFirstChoice: () => countFirstChoice,
    deleteAnnouncement: () => deleteAnnouncement,
    departmentsOf: () => departmentsOf,
    emptyInput: () => emptyInput,
    enroll: () => enroll,
    exportByProgram: () => exportByProgram,
    exportTable: () => exportTable,
    extensionFor: () => extensionFor,
    fail: () => fail,
    feedbackToRow: () => feedbackToRow,
    findByCredentials: () => findByCredentials,
    firstChoice: () => firstChoice,
    fullName: () => fullName,
    getApplicant: () => getApplicant,
    interpretMean: () => interpretMean,
    isNewlyPublished: () => isNewlyPublished,
    isValidPhone: () => isValidPhone,
    isValidThaiId: () => isValidThaiId,
    isoFromParts: () => isoFromParts,
    manualSettingKey: () => manualSettingKey,
    missingColumns: () => missingColumns,
    nextApplicationNo: () => nextApplicationNo,
    nextStudentId: () => nextStudentId,
    normalizeEnrollment: () => normalizeEnrollment,
    normalizeFeedback: () => normalizeFeedback,
    normalizeInput: () => normalizeInput,
    normalizePrograms: () => normalizePrograms,
    normalizeSettings: () => normalizeSettings,
    normalizeStaffInput: () => normalizeStaffInput,
    parseAnnouncements: () => parseAnnouncements,
    parseFeedback: () => parseFeedback,
    parseIsoDate: () => parseIsoDate,
    parseManual: () => parseManual,
    parsePrograms: () => parsePrograms,
    parseSettings: () => parseSettings,
    programName: () => programName,
    programToRow: () => programToRow,
    publicAnnouncements: () => publicAnnouncements,
    publicView: () => publicView,
    renumberPlan: () => renumberPlan,
    reviewDocument: () => reviewDocument,
    rowToApplicant: () => rowToApplicant,
    saveAnnouncement: () => saveAnnouncement,
    schoolsByProgram: () => schoolsByProgram,
    setStatus: () => setStatus,
    sniffMime: () => sniffMime,
    staffChangeProblem: () => staffChangeProblem,
    submitApplication: () => submitApplication,
    summarizeFeedback: () => summarizeFeedback,
    thaiLongDate: () => thaiLongDate,
    toArabicDigits: () => toArabicDigits,
    toCsv: () => toCsv,
    toThaiDigits: () => toThaiDigits,
    trackOf: () => trackOf,
    trackOfApplicant: () => trackOfApplicant,
    updateApplicant: () => updateApplicant,
    upsertFeedback: () => upsertFeedback,
    validateApplication: () => validateApplication,
    validateEnrollment: () => validateEnrollment,
    validateStaffInput: () => validateStaffInput
  });

  // shared/model.ts
  var LEVELS = ["pvs_direct", "pvs_cross", "pvc"];
  var LEVEL_LABEL = {
    pvs_direct: "\u0E1B\u0E27\u0E2A. (\u0E2A\u0E32\u0E22\u0E15\u0E23\u0E07)",
    pvs_cross: "\u0E1B\u0E27\u0E2A. (\u0E21.6/\u0E1B\u0E27\u0E0A. \u0E15\u0E48\u0E32\u0E07\u0E2A\u0E32\u0E02\u0E32)",
    pvc: "\u0E1B\u0E27\u0E0A."
  };
  var trackOf = (level) => level === "pvc" ? "pvc" : "pvs";
  var TRACK_LABEL = { pvc: "\u0E1B\u0E27\u0E0A.", pvs: "\u0E1B\u0E27\u0E2A." };
  var PREFIXES = ["\u0E19\u0E32\u0E22", "\u0E19\u0E32\u0E07\u0E2A\u0E32\u0E27", "\u0E19\u0E32\u0E07", "\u0E40\u0E14\u0E47\u0E01\u0E0A\u0E32\u0E22", "\u0E40\u0E14\u0E47\u0E01\u0E2B\u0E0D\u0E34\u0E07"];
  var CURRENT_LEVELS = ["\u0E21.3", "\u0E21.6", "\u0E1B\u0E27\u0E0A.3", "\u0E01\u0E28\u0E19. \u0E21.\u0E15\u0E49\u0E19", "\u0E01\u0E28\u0E19. \u0E21.\u0E1B\u0E25\u0E32\u0E22", "\u0E2D\u0E37\u0E48\u0E19 \u0E46"];
  var CHANNELS = [
    "\u0E04\u0E23\u0E39\u0E41\u0E19\u0E30\u0E41\u0E19\u0E27 / \u0E1C\u0E39\u0E49\u0E41\u0E19\u0E30\u0E19\u0E33",
    "\u0E27\u0E34\u0E17\u0E22\u0E32\u0E25\u0E31\u0E22\u0E2D\u0E2D\u0E01\u0E41\u0E19\u0E30\u0E41\u0E19\u0E27\u0E17\u0E35\u0E48\u0E42\u0E23\u0E07\u0E40\u0E23\u0E35\u0E22\u0E19",
    "\u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E19 / \u0E23\u0E38\u0E48\u0E19\u0E1E\u0E35\u0E48",
    "\u0E1C\u0E39\u0E49\u0E1B\u0E01\u0E04\u0E23\u0E2D\u0E07 / \u0E0D\u0E32\u0E15\u0E34",
    "Facebook / TikTok \u0E02\u0E2D\u0E07\u0E27\u0E34\u0E17\u0E22\u0E32\u0E25\u0E31\u0E22",
    "\u0E40\u0E27\u0E47\u0E1A\u0E44\u0E0B\u0E15\u0E4C\u0E27\u0E34\u0E17\u0E22\u0E32\u0E25\u0E31\u0E22",
    "\u0E2D\u0E37\u0E48\u0E19 \u0E46"
  ];
  var INPUT_FIELDS = [
    "level",
    "prefix",
    "firstName",
    "lastName",
    "nationalId",
    "birthDate",
    "phone",
    "email",
    "fatherName",
    "fatherAge",
    "fatherJob",
    "motherName",
    "motherAge",
    "motherJob",
    "houseNo",
    "moo",
    "soi",
    "road",
    "subdistrict",
    "district",
    "province",
    "postcode",
    "currentLevel",
    "schoolName",
    "schoolAddressNo",
    "schoolSubdistrict",
    "schoolDistrict",
    "schoolProvince",
    "gpa",
    "currentMajor",
    "programPvs",
    "programPvc1",
    "programPvc2",
    "channel",
    "referrer",
    "consent"
  ];
  var emptyInput = () => Object.fromEntries(INPUT_FIELDS.map((field) => [field, ""]));
  var STATUSES = ["submitted", "needs_fix", "passed", "not_passed", "enrolled"];
  var STATUS_LABEL = {
    submitted: "\u0E23\u0E2D\u0E15\u0E23\u0E27\u0E08\u0E2A\u0E2D\u0E1A",
    needs_fix: "\u0E40\u0E2D\u0E01\u0E2A\u0E32\u0E23\u0E44\u0E21\u0E48\u0E04\u0E23\u0E1A / \u0E15\u0E49\u0E2D\u0E07\u0E41\u0E01\u0E49\u0E44\u0E02",
    passed: "\u0E1C\u0E48\u0E32\u0E19\u0E01\u0E32\u0E23\u0E04\u0E31\u0E14\u0E40\u0E25\u0E37\u0E2D\u0E01",
    not_passed: "\u0E44\u0E21\u0E48\u0E1C\u0E48\u0E32\u0E19\u0E01\u0E32\u0E23\u0E04\u0E31\u0E14\u0E40\u0E25\u0E37\u0E2D\u0E01",
    enrolled: "\u0E21\u0E2D\u0E1A\u0E15\u0E31\u0E27\u0E41\u0E25\u0E49\u0E27"
  };
  var DOC_KINDS = ["photo", "transcript", "idCard", "houseReg", "certificate"];
  var DOC_INFO = {
    photo: { label: "\u0E23\u0E39\u0E1B\u0E16\u0E48\u0E32\u0E22\u0E2B\u0E19\u0E49\u0E32\u0E15\u0E23\u0E07", hint: "\u0E02\u0E19\u0E32\u0E14 1 \u0E19\u0E34\u0E49\u0E27 \u0E0A\u0E38\u0E14\u0E19\u0E31\u0E01\u0E40\u0E23\u0E35\u0E22\u0E19 \u0E44\u0E21\u0E48\u0E2A\u0E27\u0E21\u0E2B\u0E21\u0E27\u0E01 \u2014 \u0E43\u0E0A\u0E49\u0E15\u0E34\u0E14\u0E1A\u0E19\u0E43\u0E1A\u0E2A\u0E21\u0E31\u0E04\u0E23", required: true, imageOnly: true },
    transcript: { label: "\u0E43\u0E1A\u0E41\u0E2A\u0E14\u0E07\u0E1C\u0E25\u0E01\u0E32\u0E23\u0E40\u0E23\u0E35\u0E22\u0E19 (\u0E23\u0E1A.) \u0E40\u0E09\u0E25\u0E35\u0E48\u0E22\u0E2A\u0E30\u0E2A\u0E21 5 \u0E20\u0E32\u0E04\u0E40\u0E23\u0E35\u0E22\u0E19", hint: "\u0E16\u0E48\u0E32\u0E22\u0E43\u0E2B\u0E49\u0E40\u0E2B\u0E47\u0E19\u0E40\u0E01\u0E23\u0E14\u0E40\u0E09\u0E25\u0E35\u0E48\u0E22\u0E0A\u0E31\u0E14\u0E40\u0E08\u0E19", required: true, imageOnly: false },
    idCard: { label: "\u0E2A\u0E33\u0E40\u0E19\u0E32\u0E1A\u0E31\u0E15\u0E23\u0E1B\u0E23\u0E30\u0E08\u0E33\u0E15\u0E31\u0E27\u0E1B\u0E23\u0E30\u0E0A\u0E32\u0E0A\u0E19", hint: "\u0E14\u0E49\u0E32\u0E19\u0E2B\u0E19\u0E49\u0E32 \u0E40\u0E2B\u0E47\u0E19\u0E40\u0E25\u0E02 13 \u0E2B\u0E25\u0E31\u0E01\u0E0A\u0E31\u0E14\u0E40\u0E08\u0E19", required: true, imageOnly: false },
    houseReg: { label: "\u0E2A\u0E33\u0E40\u0E19\u0E32\u0E17\u0E30\u0E40\u0E1A\u0E35\u0E22\u0E19\u0E1A\u0E49\u0E32\u0E19", hint: "\u0E2B\u0E19\u0E49\u0E32\u0E17\u0E35\u0E48\u0E21\u0E35\u0E0A\u0E37\u0E48\u0E2D\u0E1C\u0E39\u0E49\u0E2A\u0E21\u0E31\u0E04\u0E23", required: true, imageOnly: false },
    certificate: { label: "\u0E40\u0E01\u0E35\u0E22\u0E23\u0E15\u0E34\u0E1A\u0E31\u0E15\u0E23 / \u0E43\u0E1A\u0E23\u0E31\u0E1A\u0E23\u0E2D\u0E07\u0E04\u0E27\u0E32\u0E21\u0E2A\u0E32\u0E21\u0E32\u0E23\u0E16\u0E1E\u0E34\u0E40\u0E28\u0E29", hint: "\u0E16\u0E49\u0E32\u0E21\u0E35 \u2014 \u0E23\u0E27\u0E21\u0E40\u0E1B\u0E47\u0E19\u0E44\u0E1F\u0E25\u0E4C PDF \u0E40\u0E14\u0E35\u0E22\u0E27\u0E44\u0E14\u0E49", required: false, imageOnly: false }
  };
  var DOC_STATES = ["pending", "ok", "fix"];
  var DOC_STATE_LABEL = { pending: "\u0E23\u0E2D\u0E15\u0E23\u0E27\u0E08", ok: "\u0E1C\u0E48\u0E32\u0E19", fix: "\u0E15\u0E49\u0E2D\u0E07\u0E2A\u0E48\u0E07\u0E43\u0E2B\u0E21\u0E48" };
  var MAX_FILE_BYTES = 5 * 1024 * 1024;
  var ALLOWED_MIME = ["image/jpeg", "image/png", "application/pdf"];
  var ENROLLMENT_FIELDS = [
    "admittedProgram",
    "guardianName",
    "guardianRelation",
    "guardianPhone",
    "guardianJob",
    "guardianAddress",
    "witnessName",
    "witnessPosition",
    "enrolledDate",
    "note"
  ];
  var NO_POSTER = { fileId: "", url: "", width: 0, height: 0 };
  var MANUAL_KINDS = ["applicant", "staff"];
  var MANUAL_LABEL = { applicant: "\u0E04\u0E39\u0E48\u0E21\u0E37\u0E2D\u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A\u0E1C\u0E39\u0E49\u0E2A\u0E21\u0E31\u0E04\u0E23", staff: "\u0E04\u0E39\u0E48\u0E21\u0E37\u0E2D\u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A\u0E40\u0E08\u0E49\u0E32\u0E2B\u0E19\u0E49\u0E32\u0E17\u0E35\u0E48" };
  var MAX_POSTER_BYTES = 5 * 1024 * 1024;
  var MAX_MANUAL_BYTES = 15 * 1024 * 1024;
  var DEFAULT_SETTINGS = {
    academicYear: 2570,
    applicationsOpen: true,
    studentIdPattern: "{YY}{L}{PP}{NNN}",
    heroTitle: "\u0E2A\u0E21\u0E31\u0E04\u0E23\u0E40\u0E23\u0E35\u0E22\u0E19 \u0E1B\u0E27\u0E0A. \u0E41\u0E25\u0E30 \u0E1B\u0E27\u0E2A. \u0E17\u0E35\u0E48\u0E27\u0E34\u0E17\u0E22\u0E32\u0E25\u0E31\u0E22\u0E40\u0E17\u0E04\u0E19\u0E34\u0E04\u0E17\u0E48\u0E32\u0E2B\u0E25\u0E27\u0E07\u0E0B\u0E34\u0E40\u0E21\u0E19\u0E15\u0E4C\u0E44\u0E17\u0E22\u0E2D\u0E19\u0E38\u0E2A\u0E23\u0E13\u0E4C",
    heroText: "\u0E01\u0E23\u0E2D\u0E01\u0E43\u0E1A\u0E2A\u0E21\u0E31\u0E04\u0E23\u0E1A\u0E19\u0E40\u0E27\u0E47\u0E1A \u0E23\u0E30\u0E1A\u0E1A\u0E40\u0E15\u0E34\u0E21\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E25\u0E07\u0E43\u0E1A\u0E2A\u0E21\u0E31\u0E04\u0E23\u0E09\u0E1A\u0E31\u0E1A\u0E08\u0E23\u0E34\u0E07\u0E02\u0E2D\u0E07\u0E27\u0E34\u0E17\u0E22\u0E32\u0E25\u0E31\u0E22\u0E43\u0E2B\u0E49\u0E17\u0E31\u0E19\u0E17\u0E35 \u0E1E\u0E34\u0E21\u0E1E\u0E4C \u0E25\u0E07\u0E0A\u0E37\u0E48\u0E2D \u0E41\u0E25\u0E49\u0E27\u0E19\u0E33\u0E21\u0E32\u0E22\u0E37\u0E48\u0E19\u0E44\u0E14\u0E49\u0E40\u0E25\u0E22 \u0E44\u0E21\u0E48\u0E15\u0E49\u0E2D\u0E07\u0E40\u0E02\u0E35\u0E22\u0E19\u0E40\u0E2D\u0E07",
    details: ""
  };
  var SETTING_TEXT_FIELDS = ["heroTitle", "heroText", "details"];
  var SAMPLE_PROGRAMS = [
    { code: "01", track: "pvc", name: "\u0E0A\u0E48\u0E32\u0E07\u0E22\u0E19\u0E15\u0E4C", active: true, department: "\u0E2D\u0E38\u0E15\u0E2A\u0E32\u0E2B\u0E01\u0E23\u0E23\u0E21", quota: 20 },
    { code: "02", track: "pvc", name: "\u0E22\u0E32\u0E19\u0E22\u0E19\u0E15\u0E4C\u0E44\u0E1F\u0E1F\u0E49\u0E32 (\u0E17\u0E27\u0E34\u0E20\u0E32\u0E04\u0E35)", active: true, department: "\u0E2D\u0E38\u0E15\u0E2A\u0E32\u0E2B\u0E01\u0E23\u0E23\u0E21", quota: 10 },
    { code: "03", track: "pvc", name: "\u0E0A\u0E48\u0E32\u0E07\u0E01\u0E25\u0E42\u0E23\u0E07\u0E07\u0E32\u0E19", active: true, department: "\u0E2D\u0E38\u0E15\u0E2A\u0E32\u0E2B\u0E01\u0E23\u0E23\u0E21", quota: 30 },
    { code: "04", track: "pvc", name: "\u0E0A\u0E48\u0E32\u0E07\u0E01\u0E25\u0E42\u0E23\u0E07\u0E07\u0E32\u0E19 (\u0E17\u0E27\u0E34\u0E20\u0E32\u0E04\u0E35)", active: true, department: "\u0E2D\u0E38\u0E15\u0E2A\u0E32\u0E2B\u0E01\u0E23\u0E23\u0E21", quota: 20 },
    { code: "05", track: "pvc", name: "\u0E0A\u0E48\u0E32\u0E07\u0E0B\u0E48\u0E2D\u0E21\u0E1A\u0E33\u0E23\u0E38\u0E07", active: true, department: "\u0E2D\u0E38\u0E15\u0E2A\u0E32\u0E2B\u0E01\u0E23\u0E23\u0E21", quota: 10 },
    { code: "06", track: "pvc", name: "\u0E0A\u0E48\u0E32\u0E07\u0E40\u0E0A\u0E37\u0E48\u0E2D\u0E21\u0E42\u0E25\u0E2B\u0E30 (\u0E17\u0E27\u0E34\u0E20\u0E32\u0E04\u0E35)", active: true, department: "\u0E2D\u0E38\u0E15\u0E2A\u0E32\u0E2B\u0E01\u0E23\u0E23\u0E21", quota: 10 },
    { code: "07", track: "pvc", name: "\u0E0A\u0E48\u0E32\u0E07\u0E44\u0E1F\u0E1F\u0E49\u0E32", active: true, department: "\u0E2D\u0E38\u0E15\u0E2A\u0E32\u0E2B\u0E01\u0E23\u0E23\u0E21", quota: 30 },
    { code: "08", track: "pvc", name: "\u0E2D\u0E34\u0E40\u0E25\u0E47\u0E01\u0E17\u0E23\u0E2D\u0E19\u0E34\u0E01\u0E2A\u0E4C", active: true, department: "\u0E2D\u0E38\u0E15\u0E2A\u0E32\u0E2B\u0E01\u0E23\u0E23\u0E21", quota: 10 },
    { code: "09", track: "pvc", name: "\u0E40\u0E21\u0E04\u0E04\u0E32\u0E17\u0E23\u0E2D\u0E19\u0E34\u0E01\u0E2A\u0E4C\u0E41\u0E25\u0E30\u0E2B\u0E38\u0E48\u0E19\u0E22\u0E19\u0E15\u0E4C (\u0E17\u0E27\u0E34\u0E20\u0E32\u0E04\u0E35)", active: true, department: "\u0E2D\u0E38\u0E15\u0E2A\u0E32\u0E2B\u0E01\u0E23\u0E23\u0E21", quota: 10 },
    { code: "10", track: "pvc", name: "\u0E0A\u0E48\u0E32\u0E07\u0E40\u0E17\u0E04\u0E19\u0E34\u0E04\u0E04\u0E2D\u0E21\u0E1E\u0E34\u0E27\u0E40\u0E15\u0E2D\u0E23\u0E4C", active: true, department: "\u0E2D\u0E38\u0E15\u0E2A\u0E32\u0E2B\u0E01\u0E23\u0E23\u0E21\u0E14\u0E34\u0E08\u0E34\u0E17\u0E31\u0E25\u0E41\u0E25\u0E30\u0E40\u0E17\u0E04\u0E42\u0E19\u0E42\u0E25\u0E22\u0E35\u0E2A\u0E32\u0E23\u0E2A\u0E19\u0E40\u0E17\u0E28", quota: 10 },
    { code: "11", track: "pvc", name: "\u0E40\u0E17\u0E04\u0E42\u0E19\u0E42\u0E25\u0E22\u0E35\u0E18\u0E38\u0E23\u0E01\u0E34\u0E08\u0E14\u0E34\u0E08\u0E34\u0E17\u0E31\u0E25", active: true, department: "\u0E2D\u0E38\u0E15\u0E2A\u0E32\u0E2B\u0E01\u0E23\u0E23\u0E21\u0E14\u0E34\u0E08\u0E34\u0E17\u0E31\u0E25\u0E41\u0E25\u0E30\u0E40\u0E17\u0E04\u0E42\u0E19\u0E42\u0E25\u0E22\u0E35\u0E2A\u0E32\u0E23\u0E2A\u0E19\u0E40\u0E17\u0E28", quota: 20 },
    { code: "12", track: "pvc", name: "\u0E01\u0E32\u0E23\u0E1A\u0E31\u0E0D\u0E0A\u0E35", active: true, department: "\u0E1E\u0E32\u0E13\u0E34\u0E0A\u0E22\u0E01\u0E23\u0E23\u0E21", quota: 15 },
    { code: "13", track: "pvc", name: "\u0E01\u0E32\u0E23\u0E15\u0E25\u0E32\u0E14", active: true, department: "\u0E1E\u0E32\u0E13\u0E34\u0E0A\u0E22\u0E01\u0E23\u0E23\u0E21", quota: 20 },
    { code: "01", track: "pvs", name: "\u0E40\u0E17\u0E04\u0E19\u0E34\u0E04\u0E40\u0E04\u0E23\u0E37\u0E48\u0E2D\u0E07\u0E01\u0E25 (\u0E17\u0E27\u0E34\u0E20\u0E32\u0E04\u0E35)", active: true, department: "\u0E2D\u0E38\u0E15\u0E2A\u0E32\u0E2B\u0E01\u0E23\u0E23\u0E21", quota: 20 },
    { code: "02", track: "pvs", name: "\u0E40\u0E17\u0E04\u0E19\u0E34\u0E04\u0E22\u0E32\u0E19\u0E22\u0E19\u0E15\u0E4C\u0E44\u0E1F\u0E1F\u0E49\u0E32 (\u0E17\u0E27\u0E34\u0E20\u0E32\u0E04\u0E35)", active: true, department: "\u0E2D\u0E38\u0E15\u0E2A\u0E32\u0E2B\u0E01\u0E23\u0E23\u0E21", quota: 20 },
    { code: "03", track: "pvs", name: "\u0E40\u0E17\u0E04\u0E19\u0E34\u0E04\u0E01\u0E32\u0E23\u0E1C\u0E25\u0E34\u0E15", active: true, department: "\u0E2D\u0E38\u0E15\u0E2A\u0E32\u0E2B\u0E01\u0E23\u0E23\u0E21", quota: 50 },
    { code: "04", track: "pvs", name: "\u0E40\u0E17\u0E04\u0E19\u0E34\u0E04\u0E01\u0E32\u0E23\u0E1C\u0E25\u0E34\u0E15 (\u0E17\u0E27\u0E34\u0E20\u0E32\u0E04\u0E35)", active: true, department: "\u0E2D\u0E38\u0E15\u0E2A\u0E32\u0E2B\u0E01\u0E23\u0E23\u0E21", quota: 15 },
    { code: "05", track: "pvs", name: "\u0E40\u0E17\u0E04\u0E19\u0E34\u0E04\u0E42\u0E25\u0E2B\u0E30 (\u0E17\u0E27\u0E34\u0E20\u0E32\u0E04\u0E35)", active: true, department: "\u0E2D\u0E38\u0E15\u0E2A\u0E32\u0E2B\u0E01\u0E23\u0E23\u0E21", quota: 20 },
    { code: "06", track: "pvs", name: "\u0E44\u0E1F\u0E1F\u0E49\u0E32", active: true, department: "\u0E2D\u0E38\u0E15\u0E2A\u0E32\u0E2B\u0E01\u0E23\u0E23\u0E21", quota: 40 },
    { code: "07", track: "pvs", name: "\u0E44\u0E1F\u0E1F\u0E49\u0E32 (\u0E17\u0E27\u0E34\u0E20\u0E32\u0E04\u0E35)", active: true, department: "\u0E2D\u0E38\u0E15\u0E2A\u0E32\u0E2B\u0E01\u0E23\u0E23\u0E21", quota: 10 },
    { code: "08", track: "pvs", name: "\u0E40\u0E17\u0E04\u0E42\u0E19\u0E42\u0E25\u0E22\u0E35\u0E2D\u0E34\u0E40\u0E25\u0E47\u0E01\u0E17\u0E23\u0E2D\u0E19\u0E34\u0E01\u0E2A\u0E4C", active: true, department: "\u0E2D\u0E38\u0E15\u0E2A\u0E32\u0E2B\u0E01\u0E23\u0E23\u0E21", quota: 20 },
    { code: "09", track: "pvs", name: "\u0E40\u0E17\u0E04\u0E19\u0E34\u0E04\u0E2D\u0E38\u0E15\u0E2A\u0E32\u0E2B\u0E01\u0E23\u0E23\u0E21", active: true, department: "\u0E2D\u0E38\u0E15\u0E2A\u0E32\u0E2B\u0E01\u0E23\u0E23\u0E21", quota: 30 },
    { code: "10", track: "pvs", name: "\u0E40\u0E17\u0E04\u0E19\u0E34\u0E04\u0E2D\u0E38\u0E15\u0E2A\u0E32\u0E2B\u0E01\u0E23\u0E23\u0E21 (\u0E17\u0E27\u0E34\u0E20\u0E32\u0E04\u0E35)", active: true, department: "\u0E2D\u0E38\u0E15\u0E2A\u0E32\u0E2B\u0E01\u0E23\u0E23\u0E21", quota: 10 },
    { code: "11", track: "pvs", name: "\u0E40\u0E21\u0E04\u0E04\u0E32\u0E17\u0E23\u0E2D\u0E19\u0E34\u0E01\u0E2A\u0E4C\u0E41\u0E25\u0E30\u0E2B\u0E38\u0E48\u0E19\u0E22\u0E19\u0E15\u0E4C (\u0E17\u0E27\u0E34\u0E20\u0E32\u0E04\u0E35)", active: true, department: "\u0E2D\u0E38\u0E15\u0E2A\u0E32\u0E2B\u0E01\u0E23\u0E23\u0E21", quota: 20 },
    { code: "12", track: "pvs", name: "\u0E40\u0E17\u0E04\u0E42\u0E19\u0E42\u0E25\u0E22\u0E35\u0E04\u0E2D\u0E21\u0E1E\u0E34\u0E27\u0E40\u0E15\u0E2D\u0E23\u0E4C", active: true, department: "\u0E2D\u0E38\u0E15\u0E2A\u0E32\u0E2B\u0E01\u0E23\u0E23\u0E21\u0E14\u0E34\u0E08\u0E34\u0E17\u0E31\u0E25\u0E41\u0E25\u0E30\u0E40\u0E17\u0E04\u0E42\u0E19\u0E42\u0E25\u0E22\u0E35\u0E2A\u0E32\u0E23\u0E2A\u0E19\u0E40\u0E17\u0E28", quota: 20 },
    { code: "13", track: "pvs", name: "\u0E40\u0E17\u0E04\u0E42\u0E19\u0E42\u0E25\u0E22\u0E35\u0E18\u0E38\u0E23\u0E01\u0E34\u0E08\u0E14\u0E34\u0E08\u0E34\u0E17\u0E31\u0E25", active: true, department: "\u0E2D\u0E38\u0E15\u0E2A\u0E32\u0E2B\u0E01\u0E23\u0E23\u0E21\u0E14\u0E34\u0E08\u0E34\u0E17\u0E31\u0E25\u0E41\u0E25\u0E30\u0E40\u0E17\u0E04\u0E42\u0E19\u0E42\u0E25\u0E22\u0E35\u0E2A\u0E32\u0E23\u0E2A\u0E19\u0E40\u0E17\u0E28", quota: 30 },
    { code: "14", track: "pvs", name: "\u0E40\u0E17\u0E04\u0E42\u0E19\u0E42\u0E25\u0E22\u0E35\u0E18\u0E38\u0E23\u0E01\u0E34\u0E08\u0E14\u0E34\u0E08\u0E34\u0E17\u0E31\u0E25 (\u0E17\u0E27\u0E34\u0E20\u0E32\u0E04\u0E35)", active: true, department: "\u0E2D\u0E38\u0E15\u0E2A\u0E32\u0E2B\u0E01\u0E23\u0E23\u0E21\u0E14\u0E34\u0E08\u0E34\u0E17\u0E31\u0E25\u0E41\u0E25\u0E30\u0E40\u0E17\u0E04\u0E42\u0E19\u0E42\u0E25\u0E22\u0E35\u0E2A\u0E32\u0E23\u0E2A\u0E19\u0E40\u0E17\u0E28", quota: 10 },
    { code: "15", track: "pvs", name: "\u0E40\u0E17\u0E04\u0E42\u0E19\u0E42\u0E25\u0E22\u0E35\u0E2A\u0E32\u0E23\u0E2A\u0E19\u0E40\u0E17\u0E28", active: true, department: "\u0E2D\u0E38\u0E15\u0E2A\u0E32\u0E2B\u0E01\u0E23\u0E23\u0E21\u0E14\u0E34\u0E08\u0E34\u0E17\u0E31\u0E25\u0E41\u0E25\u0E30\u0E40\u0E17\u0E04\u0E42\u0E19\u0E42\u0E25\u0E22\u0E35\u0E2A\u0E32\u0E23\u0E2A\u0E19\u0E40\u0E17\u0E28", quota: 20 },
    { code: "16", track: "pvs", name: "\u0E01\u0E32\u0E23\u0E1A\u0E31\u0E0D\u0E0A\u0E35", active: true, department: "\u0E1E\u0E32\u0E13\u0E34\u0E0A\u0E22\u0E01\u0E23\u0E23\u0E21", quota: 25 },
    { code: "17", track: "pvs", name: "\u0E01\u0E32\u0E23\u0E15\u0E25\u0E32\u0E14", active: true, department: "\u0E1E\u0E32\u0E13\u0E34\u0E0A\u0E22\u0E01\u0E23\u0E23\u0E21", quota: 25 }
  ];
  var fullName = (a) => `${a.prefix}${a.firstName} ${a.lastName}`.trim();
  var programName = (programs, code, track) => {
    var _a, _b;
    return code ? (_b = (_a = programs.find((program) => program.track === track && program.code === code)) == null ? void 0 : _a.name) != null ? _b : "" : "";
  };
  var trackOfApplicant = (a) => a.level === "pvc" ? "pvc" : "pvs";
  var firstChoice = (a) => a.level === "pvc" ? a.programPvc1 : a.programPvs;

  // shared/thai.ts
  var THAI_DIGITS = "\u0E50\u0E51\u0E52\u0E53\u0E54\u0E55\u0E56\u0E57\u0E58\u0E59";
  var THAI_MONTHS = [
    "\u0E21\u0E01\u0E23\u0E32\u0E04\u0E21",
    "\u0E01\u0E38\u0E21\u0E20\u0E32\u0E1E\u0E31\u0E19\u0E18\u0E4C",
    "\u0E21\u0E35\u0E19\u0E32\u0E04\u0E21",
    "\u0E40\u0E21\u0E29\u0E32\u0E22\u0E19",
    "\u0E1E\u0E24\u0E29\u0E20\u0E32\u0E04\u0E21",
    "\u0E21\u0E34\u0E16\u0E38\u0E19\u0E32\u0E22\u0E19",
    "\u0E01\u0E23\u0E01\u0E0E\u0E32\u0E04\u0E21",
    "\u0E2A\u0E34\u0E07\u0E2B\u0E32\u0E04\u0E21",
    "\u0E01\u0E31\u0E19\u0E22\u0E32\u0E22\u0E19",
    "\u0E15\u0E38\u0E25\u0E32\u0E04\u0E21",
    "\u0E1E\u0E24\u0E28\u0E08\u0E34\u0E01\u0E32\u0E22\u0E19",
    "\u0E18\u0E31\u0E19\u0E27\u0E32\u0E04\u0E21"
  ];
  function toArabicDigits(value) {
    return value.replace(/[๐-๙]/g, (digit) => String(THAI_DIGITS.indexOf(digit)));
  }
  function toThaiDigits(value) {
    return String(value).replace(/[0-9]/g, (digit) => THAI_DIGITS[Number(digit)]);
  }
  function parseIsoDate(iso) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
    if (!match) return null;
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const probe = new Date(Date.UTC(year, month - 1, day));
    if (probe.getUTCFullYear() !== year || probe.getUTCMonth() !== month - 1 || probe.getUTCDate() !== day) return null;
    return { year, month, day };
  }
  function isoFromParts(parts) {
    return `${parts.year}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}`;
  }
  function bangkokDateParts(isoTimestamp) {
    const shifted = new Date(new Date(isoTimestamp).getTime() + 7 * 36e5);
    return { year: shifted.getUTCFullYear(), month: shifted.getUTCMonth() + 1, day: shifted.getUTCDate() };
  }
  function bangkokDateKey(isoTimestamp) {
    return isoFromParts(bangkokDateParts(isoTimestamp));
  }
  function thaiLongDate(parts) {
    return `${parts.day} ${THAI_MONTHS[parts.month - 1]} ${parts.year + 543}`;
  }
  function ageOn(birth, today) {
    let age = today.year - birth.year;
    if (today.month < birth.month || today.month === birth.month && today.day < birth.day) age -= 1;
    return age;
  }

  // shared/provinces.ts
  var PROVINCES = [
    "\u0E01\u0E23\u0E38\u0E07\u0E40\u0E17\u0E1E\u0E21\u0E2B\u0E32\u0E19\u0E04\u0E23",
    "\u0E01\u0E23\u0E30\u0E1A\u0E35\u0E48",
    "\u0E01\u0E32\u0E0D\u0E08\u0E19\u0E1A\u0E38\u0E23\u0E35",
    "\u0E01\u0E32\u0E2C\u0E2A\u0E34\u0E19\u0E18\u0E38\u0E4C",
    "\u0E01\u0E33\u0E41\u0E1E\u0E07\u0E40\u0E1E\u0E0A\u0E23",
    "\u0E02\u0E2D\u0E19\u0E41\u0E01\u0E48\u0E19",
    "\u0E08\u0E31\u0E19\u0E17\u0E1A\u0E38\u0E23\u0E35",
    "\u0E09\u0E30\u0E40\u0E0A\u0E34\u0E07\u0E40\u0E17\u0E23\u0E32",
    "\u0E0A\u0E25\u0E1A\u0E38\u0E23\u0E35",
    "\u0E0A\u0E31\u0E22\u0E19\u0E32\u0E17",
    "\u0E0A\u0E31\u0E22\u0E20\u0E39\u0E21\u0E34",
    "\u0E0A\u0E38\u0E21\u0E1E\u0E23",
    "\u0E40\u0E0A\u0E35\u0E22\u0E07\u0E23\u0E32\u0E22",
    "\u0E40\u0E0A\u0E35\u0E22\u0E07\u0E43\u0E2B\u0E21\u0E48",
    "\u0E15\u0E23\u0E31\u0E07",
    "\u0E15\u0E23\u0E32\u0E14",
    "\u0E15\u0E32\u0E01",
    "\u0E19\u0E04\u0E23\u0E19\u0E32\u0E22\u0E01",
    "\u0E19\u0E04\u0E23\u0E1B\u0E10\u0E21",
    "\u0E19\u0E04\u0E23\u0E1E\u0E19\u0E21",
    "\u0E19\u0E04\u0E23\u0E23\u0E32\u0E0A\u0E2A\u0E35\u0E21\u0E32",
    "\u0E19\u0E04\u0E23\u0E28\u0E23\u0E35\u0E18\u0E23\u0E23\u0E21\u0E23\u0E32\u0E0A",
    "\u0E19\u0E04\u0E23\u0E2A\u0E27\u0E23\u0E23\u0E04\u0E4C",
    "\u0E19\u0E19\u0E17\u0E1A\u0E38\u0E23\u0E35",
    "\u0E19\u0E23\u0E32\u0E18\u0E34\u0E27\u0E32\u0E2A",
    "\u0E19\u0E48\u0E32\u0E19",
    "\u0E1A\u0E36\u0E07\u0E01\u0E32\u0E2C",
    "\u0E1A\u0E38\u0E23\u0E35\u0E23\u0E31\u0E21\u0E22\u0E4C",
    "\u0E1B\u0E17\u0E38\u0E21\u0E18\u0E32\u0E19\u0E35",
    "\u0E1B\u0E23\u0E30\u0E08\u0E27\u0E1A\u0E04\u0E35\u0E23\u0E35\u0E02\u0E31\u0E19\u0E18\u0E4C",
    "\u0E1B\u0E23\u0E32\u0E08\u0E35\u0E19\u0E1A\u0E38\u0E23\u0E35",
    "\u0E1B\u0E31\u0E15\u0E15\u0E32\u0E19\u0E35",
    "\u0E1E\u0E23\u0E30\u0E19\u0E04\u0E23\u0E28\u0E23\u0E35\u0E2D\u0E22\u0E38\u0E18\u0E22\u0E32",
    "\u0E1E\u0E30\u0E40\u0E22\u0E32",
    "\u0E1E\u0E31\u0E07\u0E07\u0E32",
    "\u0E1E\u0E31\u0E17\u0E25\u0E38\u0E07",
    "\u0E1E\u0E34\u0E08\u0E34\u0E15\u0E23",
    "\u0E1E\u0E34\u0E29\u0E13\u0E38\u0E42\u0E25\u0E01",
    "\u0E40\u0E1E\u0E0A\u0E23\u0E1A\u0E38\u0E23\u0E35",
    "\u0E40\u0E1E\u0E0A\u0E23\u0E1A\u0E39\u0E23\u0E13\u0E4C",
    "\u0E41\u0E1E\u0E23\u0E48",
    "\u0E20\u0E39\u0E40\u0E01\u0E47\u0E15",
    "\u0E21\u0E2B\u0E32\u0E2A\u0E32\u0E23\u0E04\u0E32\u0E21",
    "\u0E21\u0E38\u0E01\u0E14\u0E32\u0E2B\u0E32\u0E23",
    "\u0E41\u0E21\u0E48\u0E2E\u0E48\u0E2D\u0E07\u0E2A\u0E2D\u0E19",
    "\u0E22\u0E42\u0E2A\u0E18\u0E23",
    "\u0E22\u0E30\u0E25\u0E32",
    "\u0E23\u0E49\u0E2D\u0E22\u0E40\u0E2D\u0E47\u0E14",
    "\u0E23\u0E30\u0E19\u0E2D\u0E07",
    "\u0E23\u0E30\u0E22\u0E2D\u0E07",
    "\u0E23\u0E32\u0E0A\u0E1A\u0E38\u0E23\u0E35",
    "\u0E25\u0E1E\u0E1A\u0E38\u0E23\u0E35",
    "\u0E25\u0E33\u0E1B\u0E32\u0E07",
    "\u0E25\u0E33\u0E1E\u0E39\u0E19",
    "\u0E40\u0E25\u0E22",
    "\u0E28\u0E23\u0E35\u0E2A\u0E30\u0E40\u0E01\u0E29",
    "\u0E2A\u0E01\u0E25\u0E19\u0E04\u0E23",
    "\u0E2A\u0E07\u0E02\u0E25\u0E32",
    "\u0E2A\u0E15\u0E39\u0E25",
    "\u0E2A\u0E21\u0E38\u0E17\u0E23\u0E1B\u0E23\u0E32\u0E01\u0E32\u0E23",
    "\u0E2A\u0E21\u0E38\u0E17\u0E23\u0E2A\u0E07\u0E04\u0E23\u0E32\u0E21",
    "\u0E2A\u0E21\u0E38\u0E17\u0E23\u0E2A\u0E32\u0E04\u0E23",
    "\u0E2A\u0E23\u0E30\u0E41\u0E01\u0E49\u0E27",
    "\u0E2A\u0E23\u0E30\u0E1A\u0E38\u0E23\u0E35",
    "\u0E2A\u0E34\u0E07\u0E2B\u0E4C\u0E1A\u0E38\u0E23\u0E35",
    "\u0E2A\u0E38\u0E42\u0E02\u0E17\u0E31\u0E22",
    "\u0E2A\u0E38\u0E1E\u0E23\u0E23\u0E13\u0E1A\u0E38\u0E23\u0E35",
    "\u0E2A\u0E38\u0E23\u0E32\u0E29\u0E0E\u0E23\u0E4C\u0E18\u0E32\u0E19\u0E35",
    "\u0E2A\u0E38\u0E23\u0E34\u0E19\u0E17\u0E23\u0E4C",
    "\u0E2B\u0E19\u0E2D\u0E07\u0E04\u0E32\u0E22",
    "\u0E2B\u0E19\u0E2D\u0E07\u0E1A\u0E31\u0E27\u0E25\u0E33\u0E20\u0E39",
    "\u0E2D\u0E48\u0E32\u0E07\u0E17\u0E2D\u0E07",
    "\u0E2D\u0E33\u0E19\u0E32\u0E08\u0E40\u0E08\u0E23\u0E34\u0E0D",
    "\u0E2D\u0E38\u0E14\u0E23\u0E18\u0E32\u0E19\u0E35",
    "\u0E2D\u0E38\u0E15\u0E23\u0E14\u0E34\u0E15\u0E16\u0E4C",
    "\u0E2D\u0E38\u0E17\u0E31\u0E22\u0E18\u0E32\u0E19\u0E35",
    "\u0E2D\u0E38\u0E1A\u0E25\u0E23\u0E32\u0E0A\u0E18\u0E32\u0E19\u0E35"
  ];

  // shared/validate.ts
  function isValidThaiId(id) {
    if (!/^\d{13}$/.test(id)) return false;
    let sum = 0;
    for (let i = 0; i < 12; i += 1) sum += Number(id[i]) * (13 - i);
    return (11 - sum % 11) % 10 === Number(id[12]);
  }
  var isValidPhone = (phone) => /^0\d{9}$/.test(phone);
  var MAX_TEXT = 120;
  var CONTROL_CHARS = /[\u0000-\u001f\u007f]/g;
  var clean = (value) => typeof value === "string" ? toArabicDigits(value.replace(CONTROL_CHARS, " ").replace(/\s+/g, " ").trim()).slice(0, MAX_TEXT) : "";
  var digitsOnly = (value) => value.replace(/\D/g, "");
  function normalizeInput(raw) {
    const source = raw && typeof raw === "object" ? raw : {};
    const out = {};
    for (const field of INPUT_FIELDS) out[field] = clean(source[field]);
    out.nationalId = digitsOnly(out.nationalId);
    out.phone = digitsOnly(out.phone);
    out.postcode = digitsOnly(out.postcode);
    out.email = out.email.toLowerCase();
    if (out.level === "pvc") out.programPvs = "";
    else {
      out.programPvc1 = "";
      out.programPvc2 = "";
    }
    return out;
  }
  function validateApplication(input, programs, today) {
    const issues = [];
    const need = (field, message) => {
      if (input[field] === "") issues.push({ field, message });
    };
    const oneOf = (field, list, message) => {
      if (input[field] !== "" && !list.includes(input[field])) issues.push({ field, message });
    };
    need("level", "\u0E40\u0E25\u0E37\u0E2D\u0E01\u0E23\u0E30\u0E14\u0E31\u0E1A\u0E17\u0E35\u0E48\u0E15\u0E49\u0E2D\u0E07\u0E01\u0E32\u0E23\u0E2A\u0E21\u0E31\u0E04\u0E23");
    oneOf("level", LEVELS, "\u0E23\u0E30\u0E14\u0E31\u0E1A\u0E17\u0E35\u0E48\u0E2A\u0E21\u0E31\u0E04\u0E23\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07");
    need("prefix", "\u0E40\u0E25\u0E37\u0E2D\u0E01\u0E04\u0E33\u0E19\u0E33\u0E2B\u0E19\u0E49\u0E32\u0E0A\u0E37\u0E48\u0E2D");
    oneOf("prefix", PREFIXES, "\u0E04\u0E33\u0E19\u0E33\u0E2B\u0E19\u0E49\u0E32\u0E0A\u0E37\u0E48\u0E2D\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07");
    need("firstName", "\u0E01\u0E23\u0E2D\u0E01\u0E0A\u0E37\u0E48\u0E2D");
    need("lastName", "\u0E01\u0E23\u0E2D\u0E01\u0E19\u0E32\u0E21\u0E2A\u0E01\u0E38\u0E25");
    if (input.nationalId === "") issues.push({ field: "nationalId", message: "\u0E01\u0E23\u0E2D\u0E01\u0E40\u0E25\u0E02\u0E1A\u0E31\u0E15\u0E23\u0E1B\u0E23\u0E30\u0E0A\u0E32\u0E0A\u0E19 13 \u0E2B\u0E25\u0E31\u0E01" });
    else if (input.nationalId.length !== 13) issues.push({ field: "nationalId", message: `\u0E40\u0E25\u0E02\u0E1A\u0E31\u0E15\u0E23\u0E1B\u0E23\u0E30\u0E0A\u0E32\u0E0A\u0E19\u0E15\u0E49\u0E2D\u0E07\u0E21\u0E35 13 \u0E2B\u0E25\u0E31\u0E01 (\u0E15\u0E2D\u0E19\u0E19\u0E35\u0E49 ${input.nationalId.length} \u0E2B\u0E25\u0E31\u0E01)` });
    else if (!isValidThaiId(input.nationalId)) issues.push({ field: "nationalId", message: "\u0E40\u0E25\u0E02\u0E1A\u0E31\u0E15\u0E23\u0E1B\u0E23\u0E30\u0E0A\u0E32\u0E0A\u0E19\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07 \u0E15\u0E23\u0E27\u0E08\u0E14\u0E39\u0E2D\u0E35\u0E01\u0E04\u0E23\u0E31\u0E49\u0E07\u0E27\u0E48\u0E32\u0E1E\u0E34\u0E21\u0E1E\u0E4C\u0E04\u0E23\u0E1A\u0E41\u0E25\u0E30\u0E44\u0E21\u0E48\u0E2A\u0E25\u0E31\u0E1A\u0E2B\u0E25\u0E31\u0E01" });
    const birth = parseIsoDate(input.birthDate);
    if (!birth) issues.push({ field: "birthDate", message: "\u0E40\u0E25\u0E37\u0E2D\u0E01\u0E27\u0E31\u0E19 \u0E40\u0E14\u0E37\u0E2D\u0E19 \u0E1B\u0E35\u0E40\u0E01\u0E34\u0E14\u0E43\u0E2B\u0E49\u0E04\u0E23\u0E1A" });
    else {
      const age = ageOn(birth, today);
      if (age < 12 || age > 60) issues.push({ field: "birthDate", message: "\u0E1B\u0E35\u0E40\u0E01\u0E34\u0E14\u0E14\u0E39\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07 \u0E15\u0E23\u0E27\u0E08\u0E27\u0E48\u0E32\u0E40\u0E25\u0E37\u0E2D\u0E01\u0E1B\u0E35 \u0E1E.\u0E28. \u0E16\u0E39\u0E01" });
    }
    if (input.phone === "") issues.push({ field: "phone", message: "\u0E01\u0E23\u0E2D\u0E01\u0E40\u0E1A\u0E2D\u0E23\u0E4C\u0E42\u0E17\u0E23\u0E28\u0E31\u0E1E\u0E17\u0E4C" });
    else if (!isValidPhone(input.phone)) issues.push({ field: "phone", message: "\u0E40\u0E1A\u0E2D\u0E23\u0E4C\u0E42\u0E17\u0E23\u0E28\u0E31\u0E1E\u0E17\u0E4C\u0E15\u0E49\u0E2D\u0E07\u0E40\u0E1B\u0E47\u0E19\u0E15\u0E31\u0E27\u0E40\u0E25\u0E02 10 \u0E2B\u0E25\u0E31\u0E01 \u0E02\u0E36\u0E49\u0E19\u0E15\u0E49\u0E19\u0E14\u0E49\u0E27\u0E22 0" });
    if (input.email !== "" && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.email)) {
      issues.push({ field: "email", message: "\u0E23\u0E39\u0E1B\u0E41\u0E1A\u0E1A\u0E2D\u0E35\u0E40\u0E21\u0E25\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07" });
    }
    for (const field of ["fatherAge", "motherAge"]) {
      if (input[field] !== "" && (!/^\d{1,3}$/.test(input[field]) || Number(input[field]) < 15 || Number(input[field]) > 120)) {
        issues.push({ field, message: "\u0E2D\u0E32\u0E22\u0E38\u0E15\u0E49\u0E2D\u0E07\u0E40\u0E1B\u0E47\u0E19\u0E15\u0E31\u0E27\u0E40\u0E25\u0E02\u0E23\u0E30\u0E2B\u0E27\u0E48\u0E32\u0E07 15\u2013120" });
      }
    }
    need("houseNo", "\u0E01\u0E23\u0E2D\u0E01\u0E1A\u0E49\u0E32\u0E19\u0E40\u0E25\u0E02\u0E17\u0E35\u0E48");
    need("subdistrict", "\u0E01\u0E23\u0E2D\u0E01\u0E15\u0E33\u0E1A\u0E25");
    need("district", "\u0E01\u0E23\u0E2D\u0E01\u0E2D\u0E33\u0E40\u0E20\u0E2D");
    need("province", "\u0E40\u0E25\u0E37\u0E2D\u0E01\u0E08\u0E31\u0E07\u0E2B\u0E27\u0E31\u0E14");
    oneOf("province", PROVINCES, "\u0E40\u0E25\u0E37\u0E2D\u0E01\u0E08\u0E31\u0E07\u0E2B\u0E27\u0E31\u0E14\u0E08\u0E32\u0E01\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23");
    if (input.postcode === "") issues.push({ field: "postcode", message: "\u0E01\u0E23\u0E2D\u0E01\u0E23\u0E2B\u0E31\u0E2A\u0E44\u0E1B\u0E23\u0E29\u0E13\u0E35\u0E22\u0E4C" });
    else if (!/^\d{5}$/.test(input.postcode)) issues.push({ field: "postcode", message: "\u0E23\u0E2B\u0E31\u0E2A\u0E44\u0E1B\u0E23\u0E29\u0E13\u0E35\u0E22\u0E4C\u0E15\u0E49\u0E2D\u0E07\u0E21\u0E35 5 \u0E2B\u0E25\u0E31\u0E01" });
    need("currentLevel", "\u0E40\u0E25\u0E37\u0E2D\u0E01\u0E23\u0E30\u0E14\u0E31\u0E1A\u0E0A\u0E31\u0E49\u0E19\u0E17\u0E35\u0E48\u0E01\u0E33\u0E25\u0E31\u0E07\u0E28\u0E36\u0E01\u0E29\u0E32");
    oneOf("currentLevel", CURRENT_LEVELS, "\u0E23\u0E30\u0E14\u0E31\u0E1A\u0E0A\u0E31\u0E49\u0E19\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07");
    need("schoolName", "\u0E01\u0E23\u0E2D\u0E01\u0E0A\u0E37\u0E48\u0E2D\u0E42\u0E23\u0E07\u0E40\u0E23\u0E35\u0E22\u0E19");
    need("schoolProvince", "\u0E40\u0E25\u0E37\u0E2D\u0E01\u0E08\u0E31\u0E07\u0E2B\u0E27\u0E31\u0E14\u0E02\u0E2D\u0E07\u0E42\u0E23\u0E07\u0E40\u0E23\u0E35\u0E22\u0E19");
    oneOf("schoolProvince", PROVINCES, "\u0E40\u0E25\u0E37\u0E2D\u0E01\u0E08\u0E31\u0E07\u0E2B\u0E27\u0E31\u0E14\u0E08\u0E32\u0E01\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23");
    if (input.gpa === "") issues.push({ field: "gpa", message: "\u0E01\u0E23\u0E2D\u0E01\u0E1C\u0E25\u0E01\u0E32\u0E23\u0E40\u0E23\u0E35\u0E22\u0E19\u0E40\u0E09\u0E25\u0E35\u0E48\u0E22\u0E2A\u0E30\u0E2A\u0E21" });
    else if (!/^\d(\.\d{1,2})?$/.test(input.gpa) || Number(input.gpa) > 4) {
      issues.push({ field: "gpa", message: "\u0E1C\u0E25\u0E01\u0E32\u0E23\u0E40\u0E23\u0E35\u0E22\u0E19\u0E40\u0E09\u0E25\u0E35\u0E48\u0E22\u0E15\u0E49\u0E2D\u0E07\u0E2D\u0E22\u0E39\u0E48\u0E23\u0E30\u0E2B\u0E27\u0E48\u0E32\u0E07 0.00\u20134.00 \u0E40\u0E0A\u0E48\u0E19 3.25" });
    }
    if (LEVELS.includes(input.level)) {
      const track = trackOf(input.level);
      const open = programs.filter((program) => program.active && program.track === track).map((program) => program.code);
      if (track === "pvs") {
        if (input.programPvs === "") issues.push({ field: "programPvs", message: "\u0E40\u0E25\u0E37\u0E2D\u0E01\u0E2A\u0E32\u0E02\u0E32\u0E27\u0E34\u0E0A\u0E32\u0E17\u0E35\u0E48\u0E15\u0E49\u0E2D\u0E07\u0E01\u0E32\u0E23\u0E40\u0E23\u0E35\u0E22\u0E19" });
        else if (!open.includes(input.programPvs)) issues.push({ field: "programPvs", message: "\u0E2A\u0E32\u0E02\u0E32\u0E19\u0E35\u0E49\u0E44\u0E21\u0E48\u0E40\u0E1B\u0E34\u0E14\u0E23\u0E31\u0E1A\u0E43\u0E19\u0E23\u0E30\u0E14\u0E31\u0E1A \u0E1B\u0E27\u0E2A." });
      } else {
        if (input.programPvc1 === "") issues.push({ field: "programPvc1", message: "\u0E40\u0E25\u0E37\u0E2D\u0E01\u0E2A\u0E32\u0E02\u0E32\u0E27\u0E34\u0E0A\u0E32\u0E25\u0E33\u0E14\u0E31\u0E1A\u0E17\u0E35\u0E48 1" });
        else if (!open.includes(input.programPvc1)) issues.push({ field: "programPvc1", message: "\u0E2A\u0E32\u0E02\u0E32\u0E19\u0E35\u0E49\u0E44\u0E21\u0E48\u0E40\u0E1B\u0E34\u0E14\u0E23\u0E31\u0E1A\u0E43\u0E19\u0E23\u0E30\u0E14\u0E31\u0E1A \u0E1B\u0E27\u0E0A." });
        if (input.programPvc2 !== "" && !open.includes(input.programPvc2)) issues.push({ field: "programPvc2", message: "\u0E2A\u0E32\u0E02\u0E32\u0E19\u0E35\u0E49\u0E44\u0E21\u0E48\u0E40\u0E1B\u0E34\u0E14\u0E23\u0E31\u0E1A\u0E43\u0E19\u0E23\u0E30\u0E14\u0E31\u0E1A \u0E1B\u0E27\u0E0A." });
        if (input.programPvc2 !== "" && input.programPvc2 === input.programPvc1) issues.push({ field: "programPvc2", message: "\u0E25\u0E33\u0E14\u0E31\u0E1A\u0E17\u0E35\u0E48 2 \u0E15\u0E49\u0E2D\u0E07\u0E40\u0E1B\u0E47\u0E19\u0E04\u0E19\u0E25\u0E30\u0E2A\u0E32\u0E02\u0E32\u0E01\u0E31\u0E1A\u0E25\u0E33\u0E14\u0E31\u0E1A\u0E17\u0E35\u0E48 1" });
      }
    }
    need("channel", "\u0E40\u0E25\u0E37\u0E2D\u0E01\u0E0A\u0E48\u0E2D\u0E07\u0E17\u0E32\u0E07\u0E17\u0E35\u0E48\u0E23\u0E39\u0E49\u0E08\u0E31\u0E01\u0E27\u0E34\u0E17\u0E22\u0E32\u0E25\u0E31\u0E22");
    oneOf("channel", CHANNELS, "\u0E0A\u0E48\u0E2D\u0E07\u0E17\u0E32\u0E07\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07");
    if (input.consent !== "yes") issues.push({ field: "consent", message: "\u0E15\u0E49\u0E2D\u0E07\u0E22\u0E34\u0E19\u0E22\u0E2D\u0E21\u0E43\u0E2B\u0E49\u0E27\u0E34\u0E17\u0E22\u0E32\u0E25\u0E31\u0E22\u0E43\u0E0A\u0E49\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E01\u0E32\u0E23\u0E23\u0E31\u0E1A\u0E2A\u0E21\u0E31\u0E04\u0E23" });
    return issues;
  }
  function normalizeEnrollment(raw) {
    const source = raw && typeof raw === "object" ? raw : {};
    const out = {};
    for (const field of ENROLLMENT_FIELDS) out[field] = clean(source[field]);
    out.guardianPhone = digitsOnly(out.guardianPhone);
    return out;
  }
  function validateEnrollment(e) {
    const issues = [];
    if (e.guardianName === "") issues.push({ field: "guardianName", message: "\u0E01\u0E23\u0E2D\u0E01\u0E0A\u0E37\u0E48\u0E2D\u0E1C\u0E39\u0E49\u0E1B\u0E01\u0E04\u0E23\u0E2D\u0E07" });
    if (e.guardianRelation === "") issues.push({ field: "guardianRelation", message: "\u0E01\u0E23\u0E2D\u0E01\u0E04\u0E27\u0E32\u0E21\u0E40\u0E01\u0E35\u0E48\u0E22\u0E27\u0E02\u0E49\u0E2D\u0E07\u0E01\u0E31\u0E1A\u0E19\u0E31\u0E01\u0E28\u0E36\u0E01\u0E29\u0E32" });
    if (!isValidPhone(e.guardianPhone)) issues.push({ field: "guardianPhone", message: "\u0E40\u0E1A\u0E2D\u0E23\u0E4C\u0E42\u0E17\u0E23\u0E1C\u0E39\u0E49\u0E1B\u0E01\u0E04\u0E23\u0E2D\u0E07\u0E15\u0E49\u0E2D\u0E07\u0E40\u0E1B\u0E47\u0E19\u0E15\u0E31\u0E27\u0E40\u0E25\u0E02 10 \u0E2B\u0E25\u0E31\u0E01" });
    if (!parseIsoDate(e.enrolledDate)) issues.push({ field: "enrolledDate", message: "\u0E40\u0E25\u0E37\u0E2D\u0E01\u0E27\u0E31\u0E19\u0E17\u0E35\u0E48\u0E21\u0E2D\u0E1A\u0E15\u0E31\u0E27" });
    return issues;
  }
  var PASSWORD_MIN = 8;
  function checkNewPassword(current, next) {
    if (next.length < PASSWORD_MIN) return `\u0E23\u0E2B\u0E31\u0E2A\u0E1C\u0E48\u0E32\u0E19\u0E43\u0E2B\u0E21\u0E48\u0E15\u0E49\u0E2D\u0E07\u0E22\u0E32\u0E27\u0E2D\u0E22\u0E48\u0E32\u0E07\u0E19\u0E49\u0E2D\u0E22 ${PASSWORD_MIN} \u0E15\u0E31\u0E27\u0E2D\u0E31\u0E01\u0E29\u0E23`;
    if (next.length > 64) return "\u0E23\u0E2B\u0E31\u0E2A\u0E1C\u0E48\u0E32\u0E19\u0E43\u0E2B\u0E21\u0E48\u0E22\u0E32\u0E27\u0E40\u0E01\u0E34\u0E19 64 \u0E15\u0E31\u0E27\u0E2D\u0E31\u0E01\u0E29\u0E23";
    if (next === current) return "\u0E23\u0E2B\u0E31\u0E2A\u0E1C\u0E48\u0E32\u0E19\u0E43\u0E2B\u0E21\u0E48\u0E15\u0E49\u0E2D\u0E07\u0E44\u0E21\u0E48\u0E0B\u0E49\u0E33\u0E23\u0E2B\u0E31\u0E2A\u0E40\u0E14\u0E34\u0E21";
    if (/^\d+$/.test(next)) return "\u0E23\u0E2B\u0E31\u0E2A\u0E1C\u0E48\u0E32\u0E19\u0E43\u0E2B\u0E21\u0E48\u0E15\u0E49\u0E2D\u0E07\u0E21\u0E35\u0E15\u0E31\u0E27\u0E2D\u0E31\u0E01\u0E29\u0E23\u0E1B\u0E19\u0E14\u0E49\u0E27\u0E22 \u0E44\u0E21\u0E48\u0E43\u0E0A\u0E48\u0E15\u0E31\u0E27\u0E40\u0E25\u0E02\u0E25\u0E49\u0E27\u0E19";
    return "";
  }

  // shared/numbering.ts
  function nextApplicationNo(existing, academicYear) {
    const prefix = `Q${String(academicYear).slice(-2)}-`;
    let max = 0;
    for (const no of existing) {
      if (!no.startsWith(prefix)) continue;
      const seq = Number(no.slice(prefix.length));
      if (Number.isInteger(seq) && seq > max) max = seq;
    }
    return `${prefix}${String(max + 1).padStart(4, "0")}`;
  }
  var SEQ_TOKEN = /\{(N+)\}/g;
  function checkStudentIdPattern(pattern) {
    var _a;
    const seqTokens = (_a = pattern.match(SEQ_TOKEN)) != null ? _a : [];
    if (seqTokens.length !== 1) return "\u0E23\u0E39\u0E1B\u0E41\u0E1A\u0E1A\u0E15\u0E49\u0E2D\u0E07\u0E21\u0E35\u0E0A\u0E48\u0E2D\u0E07\u0E40\u0E25\u0E02\u0E25\u0E33\u0E14\u0E31\u0E1A {NNN} \u0E2B\u0E19\u0E36\u0E48\u0E07\u0E0A\u0E48\u0E2D\u0E07\u0E1E\u0E2D\u0E14\u0E35";
    const leftover = pattern.replace(SEQ_TOKEN, "").replace(/\{(YY|YYYY|L|PP)\}/g, "");
    if (/[{}]/.test(leftover)) return "\u0E21\u0E35\u0E23\u0E2B\u0E31\u0E2A\u0E43\u0E19\u0E27\u0E07\u0E40\u0E25\u0E47\u0E1A\u0E1B\u0E35\u0E01\u0E01\u0E32\u0E17\u0E35\u0E48\u0E23\u0E30\u0E1A\u0E1A\u0E44\u0E21\u0E48\u0E23\u0E39\u0E49\u0E08\u0E31\u0E01 \u0E43\u0E0A\u0E49\u0E44\u0E14\u0E49\u0E40\u0E09\u0E1E\u0E32\u0E30 {YY} {YYYY} {L} {PP} {NNN}";
    if (!/^[A-Za-z0-9-]*$/.test(leftover)) return "\u0E19\u0E2D\u0E01\u0E08\u0E32\u0E01\u0E23\u0E2B\u0E31\u0E2A\u0E43\u0E19\u0E27\u0E07\u0E40\u0E25\u0E47\u0E1A \u0E43\u0E0A\u0E49\u0E44\u0E14\u0E49\u0E40\u0E09\u0E1E\u0E32\u0E30\u0E15\u0E31\u0E27\u0E2D\u0E31\u0E01\u0E29\u0E23\u0E2D\u0E31\u0E07\u0E01\u0E24\u0E29 \u0E15\u0E31\u0E27\u0E40\u0E25\u0E02 \u0E41\u0E25\u0E30\u0E02\u0E35\u0E14";
    return "";
  }
  function nextStudentId(pattern, ctx, existingIds) {
    const problem = checkStudentIdPattern(pattern);
    if (problem) throw new Error(problem);
    const filled = pattern.replace(/\{YYYY\}/g, String(ctx.academicYear)).replace(/\{YY\}/g, String(ctx.academicYear).slice(-2)).replace(/\{L\}/g, ctx.track === "pvc" ? "2" : "3").replace(/\{PP\}/g, ctx.programCode);
    const width = /\{(N+)\}/.exec(filled)[1].length;
    const [before, after] = filled.split(/\{N+\}/);
    let max = 0;
    for (const id of existingIds) {
      if (id.length !== before.length + width + after.length || !id.startsWith(before) || !id.endsWith(after)) continue;
      const seq = id.slice(before.length, before.length + width);
      if (/^\d+$/.test(seq)) max = Math.max(max, Number(seq));
    }
    const next = max + 1;
    if (String(next).length > width) throw new Error(`\u0E40\u0E25\u0E02\u0E25\u0E33\u0E14\u0E31\u0E1A\u0E40\u0E15\u0E47\u0E21\u0E41\u0E25\u0E49\u0E27 (${width} \u0E2B\u0E25\u0E31\u0E01) \u2014 \u0E40\u0E1E\u0E34\u0E48\u0E21\u0E08\u0E33\u0E19\u0E27\u0E19 N \u0E43\u0E19\u0E23\u0E39\u0E1B\u0E41\u0E1A\u0E1A\u0E23\u0E2B\u0E31\u0E2A`);
    return `${before}${String(next).padStart(width, "0")}${after}`;
  }
  function renumberPlan(applicants, academicYear, removeAppNos) {
    const prefix = `Q${String(academicYear).slice(-2)}-`;
    const seq = (no) => Number(no.slice(prefix.length));
    const year = applicants.filter((a) => a.academicYear === academicYear && a.appNo.startsWith(prefix));
    const remove = year.filter((a) => removeAppNos.includes(a.appNo));
    const missing = removeAppNos.filter((no) => !remove.some((a) => a.appNo === no));
    const keep = year.filter((a) => !removeAppNos.includes(a.appNo)).sort((a, b) => seq(a.appNo) - seq(b.appNo));
    const renames = keep.map((a, index) => ({ id: a.id, from: a.appNo, to: `${prefix}${String(index + 1).padStart(4, "0")}` })).filter((r) => r.from !== r.to);
    return { remove, renames, missing };
  }

  // shared/files.ts
  function sniffMime(head) {
    if (head[0] === 255 && head[1] === 216 && head[2] === 255) return "image/jpeg";
    if (head[0] === 137 && head[1] === 80 && head[2] === 78 && head[3] === 71) return "image/png";
    if (head[0] === 37 && head[1] === 80 && head[2] === 68 && head[3] === 70) return "application/pdf";
    return "";
  }
  function checkUpload(head, size, imageOnly) {
    const mime = sniffMime(head);
    if (!ALLOWED_MIME.includes(mime)) return { mime, problem: "\u0E23\u0E31\u0E1A\u0E40\u0E09\u0E1E\u0E32\u0E30\u0E44\u0E1F\u0E25\u0E4C JPG, PNG \u0E2B\u0E23\u0E37\u0E2D PDF" };
    if (imageOnly && mime === "application/pdf") return { mime, problem: "\u0E23\u0E39\u0E1B\u0E16\u0E48\u0E32\u0E22\u0E15\u0E49\u0E2D\u0E07\u0E40\u0E1B\u0E47\u0E19\u0E44\u0E1F\u0E25\u0E4C JPG \u0E2B\u0E23\u0E37\u0E2D PNG" };
    if (size <= 0) return { mime, problem: "\u0E44\u0E1F\u0E25\u0E4C\u0E27\u0E48\u0E32\u0E07\u0E40\u0E1B\u0E25\u0E48\u0E32" };
    if (size > MAX_FILE_BYTES) return { mime, problem: `\u0E44\u0E1F\u0E25\u0E4C\u0E43\u0E2B\u0E0D\u0E48\u0E40\u0E01\u0E34\u0E19 ${MAX_FILE_BYTES / 1024 / 1024} MB` };
    return { mime, problem: "" };
  }
  var extensionFor = (mime) => mime === "application/pdf" ? "pdf" : mime === "image/png" ? "png" : "jpg";
  var mb = (bytes) => `${bytes / 1024 / 1024} MB`;
  function checkPoster(head, size) {
    const mime = sniffMime(head);
    if (mime !== "image/jpeg" && mime !== "image/png") return { mime, problem: "\u0E42\u0E1B\u0E2A\u0E40\u0E15\u0E2D\u0E23\u0E4C\u0E15\u0E49\u0E2D\u0E07\u0E40\u0E1B\u0E47\u0E19\u0E23\u0E39\u0E1B JPG \u0E2B\u0E23\u0E37\u0E2D PNG" };
    if (size <= 0) return { mime, problem: "\u0E44\u0E1F\u0E25\u0E4C\u0E27\u0E48\u0E32\u0E07\u0E40\u0E1B\u0E25\u0E48\u0E32" };
    if (size > MAX_POSTER_BYTES) return { mime, problem: `\u0E23\u0E39\u0E1B\u0E43\u0E2B\u0E0D\u0E48\u0E40\u0E01\u0E34\u0E19 ${mb(MAX_POSTER_BYTES)}` };
    return { mime, problem: "" };
  }
  function checkManual(head, size) {
    const mime = sniffMime(head);
    if (!ALLOWED_MIME.includes(mime)) return { mime, problem: "\u0E04\u0E39\u0E48\u0E21\u0E37\u0E2D\u0E15\u0E49\u0E2D\u0E07\u0E40\u0E1B\u0E47\u0E19\u0E44\u0E1F\u0E25\u0E4C PDF \u0E2B\u0E23\u0E37\u0E2D\u0E23\u0E39\u0E1B JPG / PNG" };
    if (size <= 0) return { mime, problem: "\u0E44\u0E1F\u0E25\u0E4C\u0E27\u0E48\u0E32\u0E07\u0E40\u0E1B\u0E25\u0E48\u0E32" };
    if (size > MAX_MANUAL_BYTES) return { mime, problem: `\u0E44\u0E1F\u0E25\u0E4C\u0E43\u0E2B\u0E0D\u0E48\u0E40\u0E01\u0E34\u0E19 ${mb(MAX_MANUAL_BYTES)} \u0E25\u0E2D\u0E07\u0E1A\u0E35\u0E1A\u0E2D\u0E31\u0E14\u0E44\u0E1F\u0E25\u0E4C\u0E01\u0E48\u0E2D\u0E19` };
    return { mime, problem: "" };
  }

  // shared/service.ts
  function fail(code, message, issues) {
    const error = new Error(message);
    error.appCode = code;
    if (issues) error.appDetails = issues;
    throw error;
  }
  function getApplicant(repo, id) {
    const found = repo.list().find((item) => item.id === id);
    if (!found) fail("NOT_FOUND", "\u0E44\u0E21\u0E48\u0E1E\u0E1A\u0E43\u0E1A\u0E2A\u0E21\u0E31\u0E04\u0E23\u0E19\u0E35\u0E49 \u0E2D\u0E32\u0E08\u0E16\u0E39\u0E01\u0E25\u0E1A\u0E44\u0E1B\u0E41\u0E25\u0E49\u0E27");
    return found;
  }
  function submitApplication(repo, settings, programs, raw, ctx) {
    if (!settings.applicationsOpen) fail("FORBIDDEN", "\u0E02\u0E13\u0E30\u0E19\u0E35\u0E49\u0E1B\u0E34\u0E14\u0E23\u0E31\u0E1A\u0E2A\u0E21\u0E31\u0E04\u0E23\u0E41\u0E25\u0E49\u0E27");
    const input = normalizeInput(raw);
    const issues = validateApplication(input, programs, bangkokDateParts(ctx.nowIso));
    if (issues.length) fail("VALIDATION", "\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E22\u0E31\u0E07\u0E44\u0E21\u0E48\u0E04\u0E23\u0E1A\u0E2B\u0E23\u0E37\u0E2D\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07", issues);
    const all = repo.list();
    const duplicate = all.find((item) => item.academicYear === settings.academicYear && item.nationalId === input.nationalId);
    if (duplicate) {
      fail("CONFLICT", `\u0E40\u0E25\u0E02\u0E1A\u0E31\u0E15\u0E23\u0E1B\u0E23\u0E30\u0E0A\u0E32\u0E0A\u0E19\u0E19\u0E35\u0E49\u0E2A\u0E21\u0E31\u0E04\u0E23\u0E1B\u0E35\u0E01\u0E32\u0E23\u0E28\u0E36\u0E01\u0E29\u0E32 ${settings.academicYear} \u0E44\u0E1B\u0E41\u0E25\u0E49\u0E27 (\u0E40\u0E25\u0E02\u0E17\u0E35\u0E48 ${duplicate.appNo}) \u0E14\u0E39\u0E2A\u0E16\u0E32\u0E19\u0E30\u0E2B\u0E23\u0E37\u0E2D\u0E41\u0E19\u0E1A\u0E40\u0E2D\u0E01\u0E2A\u0E32\u0E23\u0E40\u0E1E\u0E34\u0E48\u0E21\u0E44\u0E14\u0E49\u0E17\u0E35\u0E48\u0E2B\u0E19\u0E49\u0E32\u0E15\u0E23\u0E27\u0E08\u0E2A\u0E16\u0E32\u0E19\u0E30`);
    }
    const applicant = {
      ...input,
      id: ctx.newId(),
      appNo: nextApplicationNo(all.map((item) => item.appNo), settings.academicYear),
      academicYear: settings.academicYear,
      status: "submitted",
      statusNote: "",
      documents: {},
      enrollment: null,
      studentId: "",
      createdAt: ctx.nowIso,
      updatedAt: ctx.nowIso,
      updatedBy: ctx.actor
    };
    repo.insert(applicant);
    return applicant;
  }
  function findByCredentials(repo, nationalIdRaw, birthDateRaw) {
    var _a;
    const nationalId = String(nationalIdRaw != null ? nationalIdRaw : "").replace(/\D/g, "");
    const birthDate = String(birthDateRaw != null ? birthDateRaw : "").trim();
    if (nationalId.length !== 13 || birthDate === "") return null;
    const matches = repo.list().filter((item) => item.nationalId === nationalId && item.birthDate === birthDate);
    return (_a = matches.sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0]) != null ? _a : null;
  }
  function publicView(applicant) {
    const { documents, updatedBy: _hidden, ...rest } = applicant;
    const docs = {};
    for (const kind of DOC_KINDS) {
      const doc = documents[kind];
      if (doc) {
        const { fileId: _fileId, ...visible } = doc;
        docs[kind] = visible;
      }
    }
    return { ...rest, documents: docs };
  }
  function assertDocKind(kind) {
    if (!DOC_KINDS.includes(kind)) fail("BAD_REQUEST", "\u0E1B\u0E23\u0E30\u0E40\u0E20\u0E17\u0E40\u0E2D\u0E01\u0E2A\u0E32\u0E23\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07");
    return kind;
  }
  function assertCanAttach(applicant, kind) {
    var _a;
    if (applicant.status === "enrolled" || applicant.status === "not_passed") {
      fail("FORBIDDEN", "\u0E43\u0E1A\u0E2A\u0E21\u0E31\u0E04\u0E23\u0E19\u0E35\u0E49\u0E1B\u0E34\u0E14\u0E41\u0E25\u0E49\u0E27 \u0E41\u0E01\u0E49\u0E44\u0E02\u0E40\u0E2D\u0E01\u0E2A\u0E32\u0E23\u0E44\u0E21\u0E48\u0E44\u0E14\u0E49 \u0E15\u0E34\u0E14\u0E15\u0E48\u0E2D\u0E40\u0E08\u0E49\u0E32\u0E2B\u0E19\u0E49\u0E32\u0E17\u0E35\u0E48\u0E2B\u0E32\u0E01\u0E08\u0E33\u0E40\u0E1B\u0E47\u0E19");
    }
    if (((_a = applicant.documents[kind]) == null ? void 0 : _a.state) === "ok") fail("CONFLICT", `${DOC_INFO[kind].label} \u0E15\u0E23\u0E27\u0E08\u0E1C\u0E48\u0E32\u0E19\u0E41\u0E25\u0E49\u0E27 \u0E44\u0E21\u0E48\u0E15\u0E49\u0E2D\u0E07\u0E2A\u0E48\u0E07\u0E43\u0E2B\u0E21\u0E48`);
  }
  function attachDocument(repo, applicant, kind, file, ctx) {
    var _a, _b;
    assertCanAttach(applicant, kind);
    const replacedFileId = (_b = (_a = applicant.documents[kind]) == null ? void 0 : _a.fileId) != null ? _b : "";
    const documents = { ...applicant.documents, [kind]: { ...file, uploadedAt: ctx.nowIso, state: "pending", note: "" } };
    const stillToFix = DOC_KINDS.some((key) => {
      var _a2;
      return ((_a2 = documents[key]) == null ? void 0 : _a2.state) === "fix";
    });
    const next = {
      ...applicant,
      documents,
      // ส่งเอกสารที่ถูกขอแก้ครบแล้ว กลับไปรอตรวจอัตโนมัติ เจ้าหน้าที่จะเห็นในคิวอีกครั้ง
      ...applicant.status === "needs_fix" && !stillToFix ? { status: "submitted", statusNote: "" } : {},
      updatedAt: ctx.nowIso,
      updatedBy: ctx.actor
    };
    repo.update(next);
    return { applicant: next, replacedFileId };
  }
  function reviewDocument(repo, id, kindRaw, stateRaw, noteRaw, ctx) {
    const applicant = getApplicant(repo, id);
    const kind = assertDocKind(kindRaw);
    const doc = applicant.documents[kind];
    if (!doc) fail("NOT_FOUND", "\u0E1C\u0E39\u0E49\u0E2A\u0E21\u0E31\u0E04\u0E23\u0E22\u0E31\u0E07\u0E44\u0E21\u0E48\u0E44\u0E14\u0E49\u0E41\u0E19\u0E1A\u0E40\u0E2D\u0E01\u0E2A\u0E32\u0E23\u0E19\u0E35\u0E49");
    if (!DOC_STATES.includes(stateRaw)) fail("BAD_REQUEST", "\u0E2A\u0E16\u0E32\u0E19\u0E30\u0E40\u0E2D\u0E01\u0E2A\u0E32\u0E23\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07");
    const state = stateRaw;
    const note = String(noteRaw != null ? noteRaw : "").trim().slice(0, 300);
    if (state === "fix" && note === "") fail("VALIDATION", "\u0E23\u0E30\u0E1A\u0E38\u0E27\u0E48\u0E32\u0E15\u0E49\u0E2D\u0E07\u0E41\u0E01\u0E49\u0E2D\u0E30\u0E44\u0E23 \u0E1C\u0E39\u0E49\u0E2A\u0E21\u0E31\u0E04\u0E23\u0E08\u0E30\u0E40\u0E2B\u0E47\u0E19\u0E02\u0E49\u0E2D\u0E04\u0E27\u0E32\u0E21\u0E19\u0E35\u0E49", [{ field: "note", message: "\u0E23\u0E30\u0E1A\u0E38\u0E2A\u0E34\u0E48\u0E07\u0E17\u0E35\u0E48\u0E15\u0E49\u0E2D\u0E07\u0E41\u0E01\u0E49" }]);
    const next = {
      ...applicant,
      documents: { ...applicant.documents, [kind]: { ...doc, state, note: state === "fix" ? note : "" } },
      ...state === "fix" && applicant.status === "submitted" ? { status: "needs_fix" } : {},
      updatedAt: ctx.nowIso,
      updatedBy: ctx.actor
    };
    repo.update(next);
    return next;
  }
  function setStatus(repo, id, statusRaw, noteRaw, ctx) {
    const applicant = getApplicant(repo, id);
    if (!STATUSES.includes(statusRaw)) fail("BAD_REQUEST", "\u0E2A\u0E16\u0E32\u0E19\u0E30\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07");
    const status = statusRaw;
    if (status === "enrolled") fail("BAD_REQUEST", "\u0E1A\u0E31\u0E19\u0E17\u0E36\u0E01\u0E01\u0E32\u0E23\u0E21\u0E2D\u0E1A\u0E15\u0E31\u0E27\u0E1C\u0E48\u0E32\u0E19\u0E41\u0E1A\u0E1A\u0E1F\u0E2D\u0E23\u0E4C\u0E21\u0E21\u0E2D\u0E1A\u0E15\u0E31\u0E27 \u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E43\u0E2B\u0E49\u0E23\u0E30\u0E1A\u0E1A\u0E2D\u0E2D\u0E01\u0E23\u0E2B\u0E31\u0E2A\u0E19\u0E31\u0E01\u0E28\u0E36\u0E01\u0E29\u0E32");
    if (applicant.status === "enrolled") fail("CONFLICT", "\u0E1C\u0E39\u0E49\u0E2A\u0E21\u0E31\u0E04\u0E23\u0E21\u0E2D\u0E1A\u0E15\u0E31\u0E27\u0E41\u0E25\u0E30\u0E44\u0E14\u0E49\u0E23\u0E2B\u0E31\u0E2A\u0E19\u0E31\u0E01\u0E28\u0E36\u0E01\u0E29\u0E32\u0E41\u0E25\u0E49\u0E27 \u0E40\u0E1B\u0E25\u0E35\u0E48\u0E22\u0E19\u0E2A\u0E16\u0E32\u0E19\u0E30\u0E44\u0E21\u0E48\u0E44\u0E14\u0E49");
    const note = String(noteRaw != null ? noteRaw : "").trim().slice(0, 300);
    const next = { ...applicant, status, statusNote: note, updatedAt: ctx.nowIso, updatedBy: ctx.actor };
    repo.update(next);
    return next;
  }
  function enroll(repo, settings, programs, id, raw, ctx) {
    const applicant = getApplicant(repo, id);
    if (applicant.status !== "passed" && applicant.status !== "enrolled") {
      fail("CONFLICT", "\u0E21\u0E2D\u0E1A\u0E15\u0E31\u0E27\u0E44\u0E14\u0E49\u0E40\u0E09\u0E1E\u0E32\u0E30\u0E1C\u0E39\u0E49\u0E17\u0E35\u0E48\u0E1C\u0E48\u0E32\u0E19\u0E01\u0E32\u0E23\u0E04\u0E31\u0E14\u0E40\u0E25\u0E37\u0E2D\u0E01");
    }
    const enrollment = normalizeEnrollment(raw);
    if (enrollment.admittedProgram === "") enrollment.admittedProgram = firstChoice(applicant);
    const track = trackOf(applicant.level);
    const issues = validateEnrollment(enrollment);
    const program = programs.find((item) => item.code === enrollment.admittedProgram && item.track === track);
    if (!program) issues.push({ field: "admittedProgram", message: "\u0E40\u0E25\u0E37\u0E2D\u0E01\u0E2A\u0E32\u0E02\u0E32\u0E17\u0E35\u0E48\u0E23\u0E31\u0E1A\u0E40\u0E02\u0E49\u0E32" });
    if (issues.length) fail("VALIDATION", "\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E21\u0E2D\u0E1A\u0E15\u0E31\u0E27\u0E22\u0E31\u0E07\u0E44\u0E21\u0E48\u0E04\u0E23\u0E1A", issues);
    const studentId = applicant.studentId || nextStudentId(
      settings.studentIdPattern,
      { academicYear: applicant.academicYear, track, programCode: program.code },
      repo.list().map((item) => item.studentId).filter(Boolean)
    );
    const next = { ...applicant, enrollment, studentId, status: "enrolled", updatedAt: ctx.nowIso, updatedBy: ctx.actor };
    repo.update(next);
    return next;
  }
  function updateApplicant(repo, programs, id, raw, ctx) {
    const applicant = getApplicant(repo, id);
    const input = normalizeInput({ ...raw && typeof raw === "object" ? raw : {}, consent: "yes" });
    const issues = validateApplication(input, programs.map((p) => ({ ...p, active: true })), bangkokDateParts(ctx.nowIso));
    if (issues.length) fail("VALIDATION", "\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E22\u0E31\u0E07\u0E44\u0E21\u0E48\u0E04\u0E23\u0E1A\u0E2B\u0E23\u0E37\u0E2D\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07", issues);
    const clash = repo.list().find((item) => item.id !== id && item.academicYear === applicant.academicYear && item.nationalId === input.nationalId);
    if (clash) fail("CONFLICT", `\u0E40\u0E25\u0E02\u0E1A\u0E31\u0E15\u0E23\u0E19\u0E35\u0E49\u0E0B\u0E49\u0E33\u0E01\u0E31\u0E1A\u0E43\u0E1A\u0E2A\u0E21\u0E31\u0E04\u0E23 ${clash.appNo}`, [{ field: "nationalId", message: `\u0E0B\u0E49\u0E33\u0E01\u0E31\u0E1A\u0E43\u0E1A\u0E2A\u0E21\u0E31\u0E04\u0E23 ${clash.appNo}` }]);
    const next = { ...applicant, ...input, consent: applicant.consent, updatedAt: ctx.nowIso, updatedBy: ctx.actor };
    repo.update(next);
    return next;
  }

  // shared/stats.ts
  function tally(items, limit = Infinity) {
    var _a;
    const map = /* @__PURE__ */ new Map();
    for (const item of items) if (item) map.set(item, ((_a = map.get(item)) != null ? _a : 0) + 1);
    return [...map.entries()].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value || a.label.localeCompare(b.label, "th")).slice(0, limit);
  }
  function computeStats(all, programs, academicYear, nowIso) {
    var _a, _b, _c, _d;
    const list = all.filter((item) => item.academicYear === academicYear);
    const todayKey = bangkokDateKey(nowIso);
    const dailyMap = /* @__PURE__ */ new Map();
    for (const item of list) {
      const key = bangkokDateKey(item.createdAt);
      dailyMap.set(key, ((_a = dailyMap.get(key)) != null ? _a : 0) + 1);
    }
    const today = parseIsoDate(todayKey);
    const daily = Array.from({ length: 30 }, (_, index) => {
      var _a2;
      const date = new Date(Date.UTC(today.year, today.month - 1, today.day - (29 - index)));
      const key = isoFromParts({ year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate() });
      return { date: key, value: (_a2 = dailyMap.get(key)) != null ? _a2 : 0 };
    });
    return {
      total: list.length,
      today: (_b = dailyMap.get(todayKey)) != null ? _b : 0,
      waitingReview: list.filter((item) => item.status === "submitted").length,
      enrolled: list.filter((item) => item.status === "enrolled").length,
      byStatus: STATUSES.map((status) => ({ label: STATUS_LABEL[status], value: list.filter((item) => item.status === status).length })),
      byLevel: LEVELS.map((level) => ({ label: LEVEL_LABEL[level], value: list.filter((item) => item.level === level).length })),
      byProgram: tally(list.map((item) => {
        const name = programName(programs, firstChoice(item), item.level === "pvc" ? "pvc" : "pvs");
        return name ? `${item.level === "pvc" ? "\u0E1B\u0E27\u0E0A." : "\u0E1B\u0E27\u0E2A."} ${name}` : "";
      })),
      bySchool: tally(list.map((item) => item.schoolName), 10),
      byProvince: tally(list.map((item) => item.province), 10),
      byChannel: tally(list.map((item) => item.channel)),
      byDepartment: tally(list.map((item) => {
        var _a2, _b2;
        const track = item.level === "pvc" ? "pvc" : "pvs";
        return (_b2 = (_a2 = programs.find((p) => p.track === track && p.code === firstChoice(item))) == null ? void 0 : _a2.department) != null ? _b2 : "";
      }).filter(Boolean).map((name) => `\u0E1B\u0E23\u0E30\u0E40\u0E20\u0E17\u0E27\u0E34\u0E0A\u0E32${name}`)),
      quota: (_d = (_c = computePublicStats(all, programs, academicYear, nowIso).years.find((y) => y.year === academicYear)) == null ? void 0 : _c.programs) != null ? _d : [],
      daily
    };
  }
  function computePublicStats(all, programs, currentYear, nowIso) {
    const years = [.../* @__PURE__ */ new Set([currentYear, ...all.map((item) => item.academicYear)])].filter(Boolean).sort((a, b) => b - a);
    return {
      updatedAt: nowIso,
      years: years.map((year) => {
        var _a, _b, _c;
        const list = all.filter((item) => item.academicYear === year);
        const counts = /* @__PURE__ */ new Map();
        for (const program of programs) {
          if (program.active) counts.set(`${program.track}:${program.code}`, { track: program.track, code: program.code, name: program.name, department: program.department, quota: program.quota, value: 0 });
        }
        for (const item of list) {
          const track = item.level === "pvc" ? "pvc" : "pvs";
          const code = firstChoice(item);
          if (!code) continue;
          const key = `${track}:${code}`;
          const known = programs.find((p) => p.track === track && p.code === code);
          const entry = (_c = counts.get(key)) != null ? _c : { track, code, name: (known == null ? void 0 : known.name) || `\u0E2A\u0E32\u0E02\u0E32\u0E23\u0E2B\u0E31\u0E2A ${code}`, department: (_a = known == null ? void 0 : known.department) != null ? _a : "", quota: (_b = known == null ? void 0 : known.quota) != null ? _b : 0, value: 0 };
          entry.value += 1;
          counts.set(key, entry);
        }
        const pvc = list.filter((item) => item.level === "pvc").length;
        return {
          year,
          total: list.length,
          pvc,
          pvs: list.length - pvc,
          programs: [...counts.values()].sort((a, b) => b.value - a.value || a.track.localeCompare(b.track) || a.name.localeCompare(b.name, "th"))
        };
      })
    };
  }
  function schoolsByProgram(all, programs, academicYear) {
    var _a;
    const groups = /* @__PURE__ */ new Map();
    for (const item of all) {
      if (item.academicYear !== academicYear) continue;
      const track = item.level === "pvc" ? "pvc" : "pvs";
      const key = `${track}:${firstChoice(item)}`;
      groups.set(key, [...(_a = groups.get(key)) != null ? _a : [], item.schoolName]);
    }
    return [...groups.entries()].map(([key, schools]) => {
      var _a2, _b;
      const [track, code] = key.split(":");
      const name = (_b = (_a2 = programs.find((p) => p.track === track && p.code === code)) == null ? void 0 : _a2.name) != null ? _b : `\u0E23\u0E2B\u0E31\u0E2A ${code}`;
      return { key, label: `${track === "pvc" ? "\u0E1B\u0E27\u0E0A." : "\u0E1B\u0E27\u0E2A."} ${name}`, total: schools.length, schools: tally(schools) };
    }).sort((a, b) => b.total - a.total || a.label.localeCompare(b.label, "th"));
  }

  // shared/exportData.ts
  var EXPORT_PRESET_LABEL = {
    full: "\u0E23\u0E32\u0E22\u0E0A\u0E37\u0E48\u0E2D\u0E1C\u0E39\u0E49\u0E2A\u0E21\u0E31\u0E04\u0E23\u0E17\u0E31\u0E49\u0E07\u0E2B\u0E21\u0E14 (\u0E17\u0E38\u0E01\u0E0A\u0E48\u0E2D\u0E07)",
    registry: "\u0E19\u0E33\u0E40\u0E02\u0E49\u0E32\u0E07\u0E32\u0E19\u0E17\u0E30\u0E40\u0E1A\u0E35\u0E22\u0E19 (\u0E1C\u0E39\u0E49\u0E21\u0E2D\u0E1A\u0E15\u0E31\u0E27\u0E41\u0E25\u0E49\u0E27)"
  };
  var departmentOf = (a, programs) => {
    var _a, _b;
    const track = a.level === "pvc" ? "pvc" : "pvs";
    return (_b = (_a = programs.find((p) => p.track === track && p.code === firstChoice(a))) == null ? void 0 : _a.department) != null ? _b : "";
  };
  var thaiSlashDate = (iso) => {
    const parts = parseIsoDate(iso);
    return parts ? `${String(parts.day).padStart(2, "0")}/${String(parts.month).padStart(2, "0")}/${parts.year + 543}` : "";
  };
  var address = (a) => [
    a.houseNo && `${a.houseNo}`,
    a.moo && `\u0E2B\u0E21\u0E39\u0E48 ${a.moo}`,
    a.soi && `\u0E0B.${a.soi}`,
    a.road && `\u0E16.${a.road}`,
    a.subdistrict && `\u0E15.${a.subdistrict}`,
    a.district && `\u0E2D.${a.district}`,
    a.province && `\u0E08.${a.province}`,
    a.postcode
  ].filter(Boolean).join(" ");
  var FULL = [
    ["\u0E40\u0E25\u0E02\u0E17\u0E35\u0E48\u0E43\u0E1A\u0E2A\u0E21\u0E31\u0E04\u0E23", (a) => a.appNo],
    ["\u0E1B\u0E35\u0E01\u0E32\u0E23\u0E28\u0E36\u0E01\u0E29\u0E32", (a) => String(a.academicYear)],
    ["\u0E2A\u0E16\u0E32\u0E19\u0E30", (a) => {
      var _a;
      return (_a = STATUS_LABEL[a.status]) != null ? _a : a.status;
    }],
    ["\u0E1B\u0E23\u0E30\u0E40\u0E20\u0E17\u0E01\u0E32\u0E23\u0E2A\u0E21\u0E31\u0E04\u0E23", (a) => {
      var _a;
      return (_a = LEVEL_LABEL[a.level]) != null ? _a : a.level;
    }],
    ["\u0E1B\u0E23\u0E30\u0E40\u0E20\u0E17\u0E27\u0E34\u0E0A\u0E32", (a, p) => departmentOf(a, p)],
    ["\u0E2A\u0E32\u0E02\u0E32 \u0E1B\u0E27\u0E2A.", (a, p) => programName(p, a.programPvs, "pvs")],
    ["\u0E2A\u0E32\u0E02\u0E32 \u0E1B\u0E27\u0E0A. \u0E25\u0E33\u0E14\u0E31\u0E1A 1", (a, p) => programName(p, a.programPvc1, "pvc")],
    ["\u0E2A\u0E32\u0E02\u0E32 \u0E1B\u0E27\u0E0A. \u0E25\u0E33\u0E14\u0E31\u0E1A 2", (a, p) => programName(p, a.programPvc2, "pvc")],
    ["\u0E04\u0E33\u0E19\u0E33\u0E2B\u0E19\u0E49\u0E32", (a) => a.prefix],
    ["\u0E0A\u0E37\u0E48\u0E2D", (a) => a.firstName],
    ["\u0E19\u0E32\u0E21\u0E2A\u0E01\u0E38\u0E25", (a) => a.lastName],
    ["\u0E40\u0E25\u0E02\u0E1A\u0E31\u0E15\u0E23\u0E1B\u0E23\u0E30\u0E0A\u0E32\u0E0A\u0E19", (a) => a.nationalId],
    ["\u0E27\u0E31\u0E19\u0E40\u0E01\u0E34\u0E14", (a) => thaiSlashDate(a.birthDate)],
    ["\u0E42\u0E17\u0E23\u0E28\u0E31\u0E1E\u0E17\u0E4C", (a) => a.phone],
    ["\u0E2D\u0E35\u0E40\u0E21\u0E25", (a) => a.email],
    ["\u0E17\u0E35\u0E48\u0E2D\u0E22\u0E39\u0E48", address],
    ["\u0E08\u0E31\u0E07\u0E2B\u0E27\u0E31\u0E14", (a) => a.province],
    ["\u0E0A\u0E37\u0E48\u0E2D\u0E1A\u0E34\u0E14\u0E32", (a) => a.fatherName],
    ["\u0E2D\u0E32\u0E22\u0E38\u0E1A\u0E34\u0E14\u0E32", (a) => a.fatherAge],
    ["\u0E2D\u0E32\u0E0A\u0E35\u0E1E\u0E1A\u0E34\u0E14\u0E32", (a) => a.fatherJob],
    ["\u0E0A\u0E37\u0E48\u0E2D\u0E21\u0E32\u0E23\u0E14\u0E32", (a) => a.motherName],
    ["\u0E2D\u0E32\u0E22\u0E38\u0E21\u0E32\u0E23\u0E14\u0E32", (a) => a.motherAge],
    ["\u0E2D\u0E32\u0E0A\u0E35\u0E1E\u0E21\u0E32\u0E23\u0E14\u0E32", (a) => a.motherJob],
    ["\u0E23\u0E30\u0E14\u0E31\u0E1A\u0E0A\u0E31\u0E49\u0E19\u0E1B\u0E31\u0E08\u0E08\u0E38\u0E1A\u0E31\u0E19", (a) => a.currentLevel],
    ["\u0E42\u0E23\u0E07\u0E40\u0E23\u0E35\u0E22\u0E19\u0E40\u0E14\u0E34\u0E21", (a) => a.schoolName],
    ["\u0E08\u0E31\u0E07\u0E2B\u0E27\u0E31\u0E14\u0E42\u0E23\u0E07\u0E40\u0E23\u0E35\u0E22\u0E19", (a) => a.schoolProvince],
    ["GPAX", (a) => a.gpa],
    ["\u0E2A\u0E32\u0E02\u0E32\u0E40\u0E14\u0E34\u0E21", (a) => a.currentMajor],
    ["\u0E0A\u0E48\u0E2D\u0E07\u0E17\u0E32\u0E07\u0E17\u0E35\u0E48\u0E23\u0E39\u0E49\u0E08\u0E31\u0E01", (a) => a.channel],
    ["\u0E1C\u0E39\u0E49\u0E41\u0E19\u0E30\u0E19\u0E33", (a) => a.referrer],
    ["\u0E27\u0E31\u0E19\u0E17\u0E35\u0E48\u0E2A\u0E21\u0E31\u0E04\u0E23", (a) => thaiLongDate(bangkokDateParts(a.createdAt))],
    ["\u0E23\u0E2B\u0E31\u0E2A\u0E19\u0E31\u0E01\u0E28\u0E36\u0E01\u0E29\u0E32", (a) => a.studentId]
  ];
  var REGISTRY = [
    ["\u0E23\u0E2B\u0E31\u0E2A\u0E19\u0E31\u0E01\u0E28\u0E36\u0E01\u0E29\u0E32", (a) => a.studentId],
    ["\u0E40\u0E25\u0E02\u0E1B\u0E23\u0E30\u0E08\u0E33\u0E15\u0E31\u0E27\u0E1B\u0E23\u0E30\u0E0A\u0E32\u0E0A\u0E19", (a) => a.nationalId],
    ["\u0E04\u0E33\u0E19\u0E33\u0E2B\u0E19\u0E49\u0E32\u0E0A\u0E37\u0E48\u0E2D", (a) => a.prefix],
    ["\u0E0A\u0E37\u0E48\u0E2D", (a) => a.firstName],
    ["\u0E19\u0E32\u0E21\u0E2A\u0E01\u0E38\u0E25", (a) => a.lastName],
    ["\u0E27\u0E31\u0E19\u0E40\u0E14\u0E37\u0E2D\u0E19\u0E1B\u0E35\u0E40\u0E01\u0E34\u0E14", (a) => thaiSlashDate(a.birthDate)],
    ["\u0E23\u0E30\u0E14\u0E31\u0E1A\u0E01\u0E32\u0E23\u0E28\u0E36\u0E01\u0E29\u0E32", (a) => a.level === "pvc" ? "\u0E1B\u0E27\u0E0A." : "\u0E1B\u0E27\u0E2A."],
    ["\u0E23\u0E2B\u0E31\u0E2A\u0E2A\u0E32\u0E02\u0E32\u0E27\u0E34\u0E0A\u0E32", (a) => {
      var _a, _b;
      return (_b = (_a = a.enrollment) == null ? void 0 : _a.admittedProgram) != null ? _b : "";
    }],
    ["\u0E2A\u0E32\u0E02\u0E32\u0E27\u0E34\u0E0A\u0E32", (a, p) => {
      var _a, _b;
      return programName(p, (_b = (_a = a.enrollment) == null ? void 0 : _a.admittedProgram) != null ? _b : "", trackOfApplicant(a));
    }],
    ["\u0E1B\u0E35\u0E01\u0E32\u0E23\u0E28\u0E36\u0E01\u0E29\u0E32\u0E17\u0E35\u0E48\u0E40\u0E02\u0E49\u0E32", (a) => String(a.academicYear)],
    ["\u0E27\u0E38\u0E12\u0E34\u0E40\u0E14\u0E34\u0E21", (a) => a.currentLevel],
    ["\u0E2A\u0E16\u0E32\u0E19\u0E28\u0E36\u0E01\u0E29\u0E32\u0E40\u0E14\u0E34\u0E21", (a) => a.schoolName],
    ["\u0E08\u0E31\u0E07\u0E2B\u0E27\u0E31\u0E14\u0E2A\u0E16\u0E32\u0E19\u0E28\u0E36\u0E01\u0E29\u0E32\u0E40\u0E14\u0E34\u0E21", (a) => a.schoolProvince],
    ["\u0E40\u0E01\u0E23\u0E14\u0E40\u0E09\u0E25\u0E35\u0E48\u0E22\u0E40\u0E14\u0E34\u0E21", (a) => a.gpa],
    ["\u0E1A\u0E49\u0E32\u0E19\u0E40\u0E25\u0E02\u0E17\u0E35\u0E48", (a) => a.houseNo],
    ["\u0E2B\u0E21\u0E39\u0E48", (a) => a.moo],
    ["\u0E0B\u0E2D\u0E22", (a) => a.soi],
    ["\u0E16\u0E19\u0E19", (a) => a.road],
    ["\u0E15\u0E33\u0E1A\u0E25", (a) => a.subdistrict],
    ["\u0E2D\u0E33\u0E40\u0E20\u0E2D", (a) => a.district],
    ["\u0E08\u0E31\u0E07\u0E2B\u0E27\u0E31\u0E14", (a) => a.province],
    ["\u0E23\u0E2B\u0E31\u0E2A\u0E44\u0E1B\u0E23\u0E29\u0E13\u0E35\u0E22\u0E4C", (a) => a.postcode],
    ["\u0E42\u0E17\u0E23\u0E28\u0E31\u0E1E\u0E17\u0E4C", (a) => a.phone],
    ["\u0E0A\u0E37\u0E48\u0E2D\u0E1A\u0E34\u0E14\u0E32", (a) => a.fatherName],
    ["\u0E2D\u0E32\u0E0A\u0E35\u0E1E\u0E1A\u0E34\u0E14\u0E32", (a) => a.fatherJob],
    ["\u0E0A\u0E37\u0E48\u0E2D\u0E21\u0E32\u0E23\u0E14\u0E32", (a) => a.motherName],
    ["\u0E2D\u0E32\u0E0A\u0E35\u0E1E\u0E21\u0E32\u0E23\u0E14\u0E32", (a) => a.motherJob],
    ["\u0E0A\u0E37\u0E48\u0E2D\u0E1C\u0E39\u0E49\u0E1B\u0E01\u0E04\u0E23\u0E2D\u0E07", (a) => {
      var _a, _b;
      return (_b = (_a = a.enrollment) == null ? void 0 : _a.guardianName) != null ? _b : "";
    }],
    ["\u0E04\u0E27\u0E32\u0E21\u0E40\u0E01\u0E35\u0E48\u0E22\u0E27\u0E02\u0E49\u0E2D\u0E07", (a) => {
      var _a, _b;
      return (_b = (_a = a.enrollment) == null ? void 0 : _a.guardianRelation) != null ? _b : "";
    }],
    ["\u0E42\u0E17\u0E23\u0E28\u0E31\u0E1E\u0E17\u0E4C\u0E1C\u0E39\u0E49\u0E1B\u0E01\u0E04\u0E23\u0E2D\u0E07", (a) => {
      var _a, _b;
      return (_b = (_a = a.enrollment) == null ? void 0 : _a.guardianPhone) != null ? _b : "";
    }],
    ["\u0E27\u0E31\u0E19\u0E17\u0E35\u0E48\u0E21\u0E2D\u0E1A\u0E15\u0E31\u0E27", (a) => {
      var _a, _b;
      return thaiSlashDate((_b = (_a = a.enrollment) == null ? void 0 : _a.enrolledDate) != null ? _b : "");
    }]
  ];
  function exportTable(applicants, programs, preset) {
    const columns = preset === "registry" ? REGISTRY : FULL;
    const list = preset === "registry" ? applicants.filter((item) => item.status === "enrolled").sort((a, b) => a.studentId.localeCompare(b.studentId)) : [...applicants].sort((a, b) => a.appNo.localeCompare(b.appNo));
    return {
      headers: columns.map(([header]) => header),
      rows: list.map((item) => columns.map(([, value]) => value(item, programs)))
    };
  }
  function toCsv(headers, rows) {
    const cell = (raw) => {
      const value = /^[=+\-@\t\r]/.test(raw) ? `'${raw}` : raw;
      return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
    };
    return `\uFEFF${[headers, ...rows].map((row) => row.map(cell).join(",")).join("\r\n")}\r
`;
  }
  function exportByProgram(applicants, programs) {
    var _a;
    const groups = /* @__PURE__ */ new Map();
    for (const a of applicants) {
      const track = a.level === "pvc" ? "pvc" : "pvs";
      const key = `${track}:${firstChoice(a)}`;
      groups.set(key, [...(_a = groups.get(key)) != null ? _a : [], a]);
    }
    const used = /* @__PURE__ */ new Set();
    return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([key, list]) => {
      var _a2, _b;
      const [track, code] = key.split(":");
      const base = `${track === "pvc" ? "\u0E1B\u0E27\u0E0A" : "\u0E1B\u0E27\u0E2A"} ${(_b = (_a2 = programs.find((p) => p.track === track && p.code === code)) == null ? void 0 : _a2.name) != null ? _b : code}`.slice(0, 28);
      let name = base;
      for (let n = 2; used.has(name); n += 1) name = `${base.slice(0, 26)} ${n}`;
      used.add(name);
      const sorted = [...list].sort((x, y) => x.schoolName.localeCompare(y.schoolName, "th") || x.firstName.localeCompare(y.firstName, "th"));
      const table = exportTable(sorted, programs, "full");
      const byNo = new Map(table.rows.map((row) => [row[0], row]));
      return { name, headers: table.headers, rows: sorted.map((a) => byNo.get(a.appNo)) };
    });
  }

  // shared/sheetRow.ts
  var SHEET_APPLICANTS = "Applicants";
  var SHEET_PROGRAMS = "Programs";
  var SHEET_SETTINGS = "Settings";
  var SHEET_STAFF = "Staff";
  var SHEET_AUDIT = "Audit";
  var SHEET_ANNOUNCEMENTS = "Announcements";
  var SHEET_FEEDBACK = "Feedback";
  var SHEET_BACKUP_FOLDER = "\u0E2A\u0E33\u0E23\u0E2D\u0E07\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E2D\u0E31\u0E15\u0E42\u0E19\u0E21\u0E31\u0E15\u0E34";
  var APPLICANT_COLUMNS = [
    "id",
    "appNo",
    "academicYear",
    "status",
    "statusNote",
    "studentId",
    ...INPUT_FIELDS,
    "documentsJson",
    "enrollmentJson",
    "createdAt",
    "updatedAt",
    "updatedBy"
  ];
  var PROGRAM_COLUMNS = ["code", "track", "name", "active", "department", "quota"];
  var ANNOUNCEMENT_COLUMNS = ["id", "title", "body", "pinned", "published", "createdAt", "updatedAt", "imageFileId", "imageUrl", "imageWidth", "imageHeight"];
  var SETTINGS_COLUMNS = ["key", "value", "description"];
  var STAFF_COLUMNS = ["username", "displayName", "role", "status", "passwordSalt", "passwordHash", "tokenVersion", "lastLoginAt"];
  var AUDIT_COLUMNS = ["at", "actor", "action", "target", "detail"];
  function applicantToRow(applicant) {
    const record = applicant;
    return APPLICANT_COLUMNS.map((column) => {
      if (column === "documentsJson") return JSON.stringify(applicant.documents);
      if (column === "enrollmentJson") return applicant.enrollment ? JSON.stringify(applicant.enrollment) : "";
      const value = record[column];
      return value === void 0 || value === null ? "" : String(value);
    });
  }
  function parseJson(text2, fallback) {
    if (!text2) return fallback;
    try {
      return JSON.parse(text2);
    } catch {
      return fallback;
    }
  }
  function rowToApplicant(header, row) {
    const get = (column) => {
      const index = header.indexOf(column);
      const value = index === -1 ? "" : row[index];
      return value === void 0 || value === null ? "" : String(value);
    };
    const out = {};
    for (const column of APPLICANT_COLUMNS) out[column] = get(column);
    out.academicYear = Number(out.academicYear) || 0;
    if (!STATUSES.includes(out.status)) out.status = "submitted";
    out.documents = parseJson(get("documentsJson"), {});
    out.enrollment = parseJson(get("enrollmentJson"), null);
    delete out.documentsJson;
    delete out.enrollmentJson;
    return out;
  }
  function missingColumns(header, required) {
    return required.filter((column) => !header.includes(column));
  }
  var truthy = (value) => value === true || /^(true|1|yes|ใช่|เปิด)$/i.test(String(value).trim());
  function parsePrograms(header, rows) {
    const col = (row, name) => {
      var _a;
      const index = header.indexOf(name);
      return index === -1 ? "" : String((_a = row[index]) != null ? _a : "").trim();
    };
    return rows.map((row) => {
      const name = col(row, "name");
      const quota = Number(col(row, "quota"));
      return {
        code: col(row, "code"),
        track: col(row, "track").toLowerCase(),
        name,
        active: truthy(col(row, "active")),
        department: col(row, "department") || name,
        quota: Number.isInteger(quota) && quota > 0 ? quota : 0
      };
    }).filter((program) => /^[0-9A-Za-z]{1,4}$/.test(program.code) && (program.track === "pvc" || program.track === "pvs") && program.name !== "");
  }
  function programToRow(program) {
    return [program.code, program.track, program.name, program.active ? "TRUE" : "FALSE", program.department, String(program.quota)];
  }
  function parseAnnouncements(header, rows) {
    const col = (row, name) => {
      var _a;
      const index = header.indexOf(name);
      return index === -1 ? "" : String((_a = row[index]) != null ? _a : "");
    };
    return rows.map((row) => ({
      id: col(row, "id"),
      title: col(row, "title"),
      body: col(row, "body"),
      pinned: truthy(col(row, "pinned")),
      published: truthy(col(row, "published")),
      createdAt: col(row, "createdAt"),
      updatedAt: col(row, "updatedAt"),
      // ชีตรุ่นก่อนยังไม่มีคอลัมน์รูป อ่านได้เป็นประกาศไม่มีโปสเตอร์
      imageFileId: col(row, "imageFileId"),
      imageUrl: col(row, "imageUrl"),
      imageWidth: Number(col(row, "imageWidth")) || 0,
      imageHeight: Number(col(row, "imageHeight")) || 0
    })).filter((item) => item.id !== "" && item.title !== "");
  }
  function announcementToRow(item) {
    return [
      item.id,
      item.title,
      item.body,
      item.pinned ? "TRUE" : "FALSE",
      item.published ? "TRUE" : "FALSE",
      item.createdAt,
      item.updatedAt,
      item.imageFileId,
      item.imageUrl,
      item.imageWidth ? String(item.imageWidth) : "",
      item.imageHeight ? String(item.imageHeight) : ""
    ];
  }
  function parseSettings(rows) {
    var _a;
    const map = new Map(rows.map((row) => {
      var _a2;
      return [String((_a2 = row[0]) != null ? _a2 : "").trim(), row[1]];
    }));
    const problems = [];
    const settings = { ...DEFAULT_SETTINGS };
    if (map.has("academicYear")) {
      const year = Number(map.get("academicYear"));
      if (Number.isInteger(year) && year >= 2560 && year <= 2700) settings.academicYear = year;
      else problems.push("academicYear \u0E15\u0E49\u0E2D\u0E07\u0E40\u0E1B\u0E47\u0E19\u0E1B\u0E35 \u0E1E.\u0E28. \u0E40\u0E0A\u0E48\u0E19 2570");
    }
    if (map.has("applicationsOpen")) settings.applicationsOpen = truthy(map.get("applicationsOpen"));
    if (map.has("studentIdPattern")) {
      const pattern = String(map.get("studentIdPattern")).trim();
      const problem = checkStudentIdPattern(pattern);
      if (problem) problems.push(`studentIdPattern: ${problem}`);
      else settings.studentIdPattern = pattern;
    }
    for (const field of SETTING_TEXT_FIELDS) {
      const value = String((_a = map.get(field)) != null ? _a : "").trim();
      if (value) settings[field] = value;
    }
    return { settings, problems };
  }
  var manualSettingKey = (kind) => `manual.${kind}`;
  function parseManual(raw) {
    var _a, _b;
    try {
      const value = JSON.parse(String(raw != null ? raw : ""));
      if (!value || typeof value.fileId !== "string" || value.fileId === "") return null;
      const mime = value.mime === "image/jpeg" || value.mime === "image/png" ? value.mime : "application/pdf";
      return { fileId: value.fileId, name: String((_a = value.name) != null ? _a : "\u0E04\u0E39\u0E48\u0E21\u0E37\u0E2D.pdf"), size: Number(value.size) || 0, updatedAt: String((_b = value.updatedAt) != null ? _b : ""), mime };
    } catch {
      return null;
    }
  }

  // shared/admin.ts
  var text = (value, max) => typeof value === "string" ? value.replace(/[\u0000-\u0009\u000b-\u001f\u007f]/g, "").trim().slice(0, max) : "";
  function normalizePrograms(raw, applicants) {
    if (!Array.isArray(raw)) fail("BAD_REQUEST", "\u0E23\u0E39\u0E1B\u0E41\u0E1A\u0E1A\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23\u0E2A\u0E32\u0E02\u0E32\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07");
    if (raw.length > 200) fail("BAD_REQUEST", "\u0E08\u0E33\u0E19\u0E27\u0E19\u0E2A\u0E32\u0E02\u0E32\u0E21\u0E32\u0E01\u0E40\u0E01\u0E34\u0E19\u0E44\u0E1B");
    const issues = [];
    const seen = /* @__PURE__ */ new Set();
    const programs = raw.map((item, index) => {
      var _a;
      const source = item && typeof item === "object" ? item : {};
      const track = source.track === "pvs" ? "pvs" : "pvc";
      const program = {
        track,
        code: toArabicDigits(text(source.code, 4)),
        name: text(source.name, 80),
        department: text(source.department, 60).replace(/^(แผนกวิชา|ประเภทวิชา)\s*/, ""),
        quota: Number(toArabicDigits(String((_a = source.quota) != null ? _a : "0"))),
        active: source.active !== false
      };
      const at = (field, message) => issues.push({ field: `${index}.${field}`, message });
      if (!/^[0-9]{2}$/.test(program.code)) at("code", "\u0E23\u0E2B\u0E31\u0E2A\u0E2A\u0E32\u0E02\u0E32\u0E15\u0E49\u0E2D\u0E07\u0E40\u0E1B\u0E47\u0E19\u0E15\u0E31\u0E27\u0E40\u0E25\u0E02 2 \u0E2B\u0E25\u0E31\u0E01 \u0E40\u0E0A\u0E48\u0E19 01");
      if (program.name === "") at("name", "\u0E01\u0E23\u0E2D\u0E01\u0E0A\u0E37\u0E48\u0E2D\u0E2A\u0E32\u0E02\u0E32\u0E27\u0E34\u0E0A\u0E32");
      if (program.department === "") at("department", "\u0E01\u0E23\u0E2D\u0E01\u0E1B\u0E23\u0E30\u0E40\u0E20\u0E17\u0E27\u0E34\u0E0A\u0E32");
      if (!Number.isInteger(program.quota) || program.quota < 0 || program.quota > 9999) at("quota", "\u0E08\u0E33\u0E19\u0E27\u0E19\u0E23\u0E31\u0E1A\u0E15\u0E49\u0E2D\u0E07\u0E40\u0E1B\u0E47\u0E19\u0E08\u0E33\u0E19\u0E27\u0E19\u0E40\u0E15\u0E47\u0E21 0\u20139999 (0 = \u0E44\u0E21\u0E48\u0E08\u0E33\u0E01\u0E31\u0E14)");
      const key = `${track}:${program.code}`;
      if (seen.has(key)) at("code", `\u0E23\u0E2B\u0E31\u0E2A ${program.code} \u0E0B\u0E49\u0E33\u0E43\u0E19\u0E23\u0E30\u0E14\u0E31\u0E1A ${track === "pvc" ? "\u0E1B\u0E27\u0E0A." : "\u0E1B\u0E27\u0E2A."}`);
      seen.add(key);
      return program;
    });
    const used = new Set(applicants.flatMap((a) => {
      const track = a.level === "pvc" ? "pvc" : "pvs";
      return [a.programPvs, a.programPvc1, a.programPvc2].filter(Boolean).map((code) => `${track}:${code}`);
    }));
    for (const key of used) {
      if (!seen.has(key)) {
        const [track, code] = key.split(":");
        issues.push({ field: "list", message: `\u0E25\u0E1A\u0E2A\u0E32\u0E02\u0E32\u0E23\u0E2B\u0E31\u0E2A ${code} (${track === "pvc" ? "\u0E1B\u0E27\u0E0A." : "\u0E1B\u0E27\u0E2A."}) \u0E44\u0E21\u0E48\u0E44\u0E14\u0E49 \u0E40\u0E1E\u0E23\u0E32\u0E30\u0E21\u0E35\u0E1C\u0E39\u0E49\u0E2A\u0E21\u0E31\u0E04\u0E23\u0E40\u0E25\u0E37\u0E2D\u0E01\u0E44\u0E27\u0E49\u0E41\u0E25\u0E49\u0E27 \u0E43\u0E2B\u0E49\u0E1B\u0E34\u0E14\u0E23\u0E31\u0E1A\u0E41\u0E17\u0E19` });
      }
    }
    if (issues.length) fail("VALIDATION", issues[0].message, issues);
    return programs.sort((a, b) => a.track.localeCompare(b.track) || a.code.localeCompare(b.code));
  }
  function departmentsOf(programs) {
    return [...new Set(programs.map((p) => p.department).filter(Boolean))].sort((a, b) => a.localeCompare(b, "th"));
  }
  function countFirstChoice(applicants, program, academicYear) {
    return applicants.filter(
      (a) => a.academicYear === academicYear && a.level === "pvc" === (program.track === "pvc") && firstChoice(a) === program.code
    ).length;
  }
  function saveAnnouncement(list, raw, ctx, image) {
    var _a, _b;
    const source = raw && typeof raw === "object" ? raw : {};
    const title = text(source.title, 150);
    const body = text(source.body, 5e3);
    const issues = [];
    if (title === "") issues.push({ field: "title", message: "\u0E01\u0E23\u0E2D\u0E01\u0E2B\u0E31\u0E27\u0E02\u0E49\u0E2D\u0E1B\u0E23\u0E30\u0E01\u0E32\u0E28" });
    if (body === "") issues.push({ field: "body", message: "\u0E01\u0E23\u0E2D\u0E01\u0E40\u0E19\u0E37\u0E49\u0E2D\u0E2B\u0E32\u0E1B\u0E23\u0E30\u0E01\u0E32\u0E28" });
    if (issues.length) fail("VALIDATION", "\u0E1B\u0E23\u0E30\u0E01\u0E32\u0E28\u0E22\u0E31\u0E07\u0E44\u0E21\u0E48\u0E04\u0E23\u0E1A", issues);
    const id = typeof source.id === "string" ? source.id : "";
    const existing = list.find((item) => item.id === id);
    if (id && !existing) fail("NOT_FOUND", "\u0E44\u0E21\u0E48\u0E1E\u0E1A\u0E1B\u0E23\u0E30\u0E01\u0E32\u0E28\u0E19\u0E35\u0E49 \u0E2D\u0E32\u0E08\u0E16\u0E39\u0E01\u0E25\u0E1A\u0E44\u0E1B\u0E41\u0E25\u0E49\u0E27");
    const next = {
      id: (_a = existing == null ? void 0 : existing.id) != null ? _a : ctx.newId(),
      title,
      body,
      pinned: source.pinned === true,
      published: source.published !== false,
      createdAt: (_b = existing == null ? void 0 : existing.createdAt) != null ? _b : ctx.nowIso,
      updatedAt: ctx.nowIso,
      ...posterFields(image != null ? image : existing ? { fileId: existing.imageFileId, url: existing.imageUrl, width: existing.imageWidth, height: existing.imageHeight } : NO_POSTER)
    };
    return existing ? list.map((item) => item.id === next.id ? next : item) : [next, ...list];
  }
  function posterFields(image) {
    const size = (n) => Number.isFinite(n) && n > 0 && n <= 2e4 ? Math.round(n) : 0;
    return { imageFileId: image.fileId, imageUrl: image.url, imageWidth: size(image.width), imageHeight: size(image.height) };
  }
  function deleteAnnouncement(list, id) {
    if (!list.some((item) => item.id === id)) fail("NOT_FOUND", "\u0E44\u0E21\u0E48\u0E1E\u0E1A\u0E1B\u0E23\u0E30\u0E01\u0E32\u0E28\u0E19\u0E35\u0E49");
    return list.filter((item) => item.id !== id);
  }
  function publicAnnouncements(list) {
    return list.filter((item) => item.published).sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.createdAt.localeCompare(a.createdAt));
  }
  function normalizeSettings(raw) {
    var _a;
    const source = raw && typeof raw === "object" ? raw : {};
    const issues = [];
    const year = Number(toArabicDigits(String((_a = source.academicYear) != null ? _a : "")));
    if (!Number.isInteger(year) || year < 2560 || year > 2700) issues.push({ field: "academicYear", message: "\u0E43\u0E2A\u0E48\u0E1B\u0E35 \u0E1E.\u0E28. \u0E40\u0E0A\u0E48\u0E19 2570" });
    const pattern = text(source.studentIdPattern, 40);
    const problem = checkStudentIdPattern(pattern);
    if (problem) issues.push({ field: "studentIdPattern", message: problem });
    const settings = { ...DEFAULT_SETTINGS, academicYear: year, applicationsOpen: source.applicationsOpen === true, studentIdPattern: pattern };
    for (const field of SETTING_TEXT_FIELDS) {
      const value = text(source[field], field === "details" ? 4e3 : 300);
      settings[field] = value || DEFAULT_SETTINGS[field];
    }
    if (issues.length) fail("VALIDATION", issues[0].message, issues);
    return settings;
  }
  function isNewlyPublished(before, after) {
    return after.published && (!before || !before.published);
  }
  function announcementLineText(item, siteUrl) {
    const body = item.body.length > 300 ? `${item.body.slice(0, 300).trimEnd()}\u2026` : item.body;
    const link = siteUrl ? `

${item.imageUrl ? "\u0E14\u0E39\u0E42\u0E1B\u0E2A\u0E40\u0E15\u0E2D\u0E23\u0E4C\u0E41\u0E25\u0E30\u0E2D\u0E48\u0E32\u0E19\u0E15\u0E48\u0E2D" : "\u0E2D\u0E48\u0E32\u0E19\u0E15\u0E48\u0E2D"}: ${siteUrl.replace(/\/?$/, "/")}#/news` : "";
    return `\u0E1B\u0E23\u0E30\u0E01\u0E32\u0E28\u0E43\u0E2B\u0E21\u0E48: ${item.title}

${body}${link}`;
  }

  // shared/users.ts
  var STAFF_ROLES = ["staff", "admin"];
  var STAFF_ROLE_LABEL = { staff: "\u0E40\u0E08\u0E49\u0E32\u0E2B\u0E19\u0E49\u0E32\u0E17\u0E35\u0E48", admin: "\u0E1C\u0E39\u0E49\u0E14\u0E39\u0E41\u0E25\u0E23\u0E30\u0E1A\u0E1A" };
  var STAFF_ROLE_HINT = {
    staff: "\u0E14\u0E39\u0E41\u0E25\u0E30\u0E15\u0E23\u0E27\u0E08\u0E43\u0E1A\u0E2A\u0E21\u0E31\u0E04\u0E23 \u0E40\u0E1B\u0E25\u0E35\u0E48\u0E22\u0E19\u0E2A\u0E16\u0E32\u0E19\u0E30 \u0E23\u0E31\u0E1A\u0E21\u0E2D\u0E1A\u0E15\u0E31\u0E27 \u0E2A\u0E48\u0E07\u0E2D\u0E2D\u0E01 Excel",
    admin: "\u0E17\u0E33\u0E44\u0E14\u0E49\u0E17\u0E38\u0E01\u0E2D\u0E22\u0E48\u0E32\u0E07 \u0E23\u0E27\u0E21\u0E16\u0E36\u0E07\u0E2A\u0E32\u0E02\u0E32 \u0E1B\u0E23\u0E30\u0E01\u0E32\u0E28 \u0E15\u0E31\u0E49\u0E07\u0E04\u0E48\u0E32 \u0E41\u0E25\u0E30\u0E08\u0E31\u0E14\u0E01\u0E32\u0E23\u0E1C\u0E39\u0E49\u0E43\u0E0A\u0E49"
  };
  var USERNAME = /^[a-z0-9._-]{3,32}$/;
  function normalizeStaffInput(raw) {
    var _a, _b;
    const source = raw && typeof raw === "object" ? raw : {};
    return {
      username: String((_a = source.username) != null ? _a : "").trim().toLowerCase(),
      displayName: String((_b = source.displayName) != null ? _b : "").replace(/\s+/g, " ").trim().slice(0, 100),
      role: source.role === "admin" ? "admin" : "staff",
      status: source.status === "disabled" ? "disabled" : "active"
    };
  }
  function validateStaffInput(input, existing, creating, password = "") {
    const issues = [];
    if (creating) {
      if (!USERNAME.test(input.username)) issues.push({ field: "username", message: "\u0E0A\u0E37\u0E48\u0E2D\u0E1C\u0E39\u0E49\u0E43\u0E0A\u0E49 3\u201332 \u0E15\u0E31\u0E27 \u0E43\u0E0A\u0E49 a-z 0-9 . _ - \u0E40\u0E17\u0E48\u0E32\u0E19\u0E31\u0E49\u0E19" });
      else if (existing.some((u) => u.username === input.username)) issues.push({ field: "username", message: `\u0E21\u0E35\u0E0A\u0E37\u0E48\u0E2D\u0E1C\u0E39\u0E49\u0E43\u0E0A\u0E49 ${input.username} \u0E41\u0E25\u0E49\u0E27` });
      const problem = checkNewPassword("", password);
      if (problem) issues.push({ field: "password", message: problem });
    }
    if (!input.displayName) issues.push({ field: "displayName", message: "\u0E01\u0E23\u0E2D\u0E01\u0E0A\u0E37\u0E48\u0E2D-\u0E19\u0E32\u0E21\u0E2A\u0E01\u0E38\u0E25" });
    return issues;
  }
  function staffChangeProblem(list, actor, target, next) {
    const current = list.find((u) => u.username === target);
    if (!current) return "\u0E44\u0E21\u0E48\u0E1E\u0E1A\u0E1A\u0E31\u0E0D\u0E0A\u0E35\u0E19\u0E35\u0E49";
    if (target === actor) {
      if (next === null) return "\u0E25\u0E1A\u0E1A\u0E31\u0E0D\u0E0A\u0E35\u0E02\u0E2D\u0E07\u0E15\u0E31\u0E27\u0E40\u0E2D\u0E07\u0E44\u0E21\u0E48\u0E44\u0E14\u0E49 \u0E43\u0E2B\u0E49\u0E1C\u0E39\u0E49\u0E14\u0E39\u0E41\u0E25\u0E04\u0E19\u0E2D\u0E37\u0E48\u0E19\u0E17\u0E33\u0E41\u0E17\u0E19";
      if (next.role !== current.role || next.status !== current.status) return "\u0E40\u0E1B\u0E25\u0E35\u0E48\u0E22\u0E19\u0E2A\u0E34\u0E17\u0E18\u0E34\u0E4C\u0E2B\u0E23\u0E37\u0E2D\u0E1B\u0E34\u0E14\u0E1A\u0E31\u0E0D\u0E0A\u0E35\u0E02\u0E2D\u0E07\u0E15\u0E31\u0E27\u0E40\u0E2D\u0E07\u0E44\u0E21\u0E48\u0E44\u0E14\u0E49 \u0E43\u0E2B\u0E49\u0E1C\u0E39\u0E49\u0E14\u0E39\u0E41\u0E25\u0E04\u0E19\u0E2D\u0E37\u0E48\u0E19\u0E17\u0E33\u0E41\u0E17\u0E19";
    }
    const after = list.filter((u) => !(next === null && u.username === target)).map((u) => u.username === target && next ? { ...u, ...next } : u);
    if (!after.some((u) => u.role === "admin" && u.status === "active")) return "\u0E15\u0E49\u0E2D\u0E07\u0E21\u0E35\u0E1C\u0E39\u0E49\u0E14\u0E39\u0E41\u0E25\u0E23\u0E30\u0E1A\u0E1A\u0E17\u0E35\u0E48\u0E43\u0E0A\u0E49\u0E07\u0E32\u0E19\u0E44\u0E14\u0E49\u0E2D\u0E22\u0E48\u0E32\u0E07\u0E19\u0E49\u0E2D\u0E22 1 \u0E04\u0E19";
    return "";
  }

  // shared/feedback.ts
  var FEEDBACK_ITEMS = [
    { key: "ease", label: "\u0E23\u0E30\u0E1A\u0E1A\u0E43\u0E0A\u0E49\u0E07\u0E32\u0E19\u0E07\u0E48\u0E32\u0E22 \u0E40\u0E02\u0E49\u0E32\u0E43\u0E08\u0E44\u0E14\u0E49\u0E17\u0E31\u0E19\u0E17\u0E35" },
    { key: "speed", label: "\u0E01\u0E23\u0E2D\u0E01\u0E41\u0E25\u0E30\u0E2A\u0E48\u0E07\u0E43\u0E1A\u0E2A\u0E21\u0E31\u0E04\u0E23\u0E44\u0E14\u0E49\u0E23\u0E27\u0E14\u0E40\u0E23\u0E47\u0E27" },
    { key: "overall", label: "\u0E04\u0E27\u0E32\u0E21\u0E1E\u0E36\u0E07\u0E1E\u0E2D\u0E43\u0E08\u0E42\u0E14\u0E22\u0E23\u0E27\u0E21\u0E15\u0E48\u0E2D\u0E01\u0E32\u0E23\u0E2A\u0E21\u0E31\u0E04\u0E23\u0E2D\u0E2D\u0E19\u0E44\u0E25\u0E19\u0E4C" }
  ];
  var SCORE_LABEL = { 5: "\u0E21\u0E32\u0E01\u0E17\u0E35\u0E48\u0E2A\u0E38\u0E14", 4: "\u0E21\u0E32\u0E01", 3: "\u0E1B\u0E32\u0E19\u0E01\u0E25\u0E32\u0E07", 2: "\u0E19\u0E49\u0E2D\u0E22", 1: "\u0E19\u0E49\u0E2D\u0E22\u0E17\u0E35\u0E48\u0E2A\u0E38\u0E14" };
  var FEEDBACK_COLUMNS = ["applicantId", "appNo", "academicYear", "level", "ease", "speed", "overall", "comment", "createdAt", "updatedAt"];
  var score = (value) => {
    const n = Number(toArabicDigits(String(value != null ? value : "")));
    return Number.isInteger(n) && n >= 1 && n <= 5 ? n : 0;
  };
  function normalizeFeedback(raw) {
    const source = raw && typeof raw === "object" ? raw : {};
    const answers = { ease: score(source.ease), speed: score(source.speed), overall: score(source.overall) };
    const missing = FEEDBACK_ITEMS.filter((item) => answers[item.key] === 0);
    if (missing.length) fail("VALIDATION", "\u0E01\u0E23\u0E38\u0E13\u0E32\u0E43\u0E2B\u0E49\u0E04\u0E30\u0E41\u0E19\u0E19\u0E43\u0E2B\u0E49\u0E04\u0E23\u0E1A\u0E17\u0E38\u0E01\u0E02\u0E49\u0E2D", missing.map((item) => ({ field: item.key, message: "\u0E40\u0E25\u0E37\u0E2D\u0E01\u0E04\u0E30\u0E41\u0E19\u0E19 1\u20135" })));
    const comment = typeof source.comment === "string" ? source.comment.replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, "").trim().slice(0, 500) : "";
    return { ...answers, comment };
  }
  function upsertFeedback(list, applicant, raw, nowIso) {
    var _a;
    const answers = normalizeFeedback(raw);
    const existing = list.find((item) => item.applicantId === applicant.id);
    const saved = {
      applicantId: applicant.id,
      appNo: applicant.appNo,
      academicYear: applicant.academicYear,
      level: applicant.level,
      ...answers,
      createdAt: (_a = existing == null ? void 0 : existing.createdAt) != null ? _a : nowIso,
      updatedAt: nowIso
    };
    return { list: existing ? list.map((item) => item === existing ? saved : item) : [...list, saved], saved };
  }
  function interpretMean(mean) {
    if (mean >= 4.51) return "\u0E21\u0E32\u0E01\u0E17\u0E35\u0E48\u0E2A\u0E38\u0E14";
    if (mean >= 3.51) return "\u0E21\u0E32\u0E01";
    if (mean >= 2.51) return "\u0E1B\u0E32\u0E19\u0E01\u0E25\u0E32\u0E07";
    if (mean >= 1.51) return "\u0E19\u0E49\u0E2D\u0E22";
    return mean > 0 ? "\u0E19\u0E49\u0E2D\u0E22\u0E17\u0E35\u0E48\u0E2A\u0E38\u0E14" : "-";
  }
  var round2 = (n) => Math.round(n * 100) / 100;
  function meanSd(values) {
    if (values.length === 0) return { mean: 0, sd: 0 };
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const sd = values.length > 1 ? Math.sqrt(values.reduce((a, b) => a + (b - mean) ** 2, 0) / (values.length - 1)) : 0;
    return { mean: round2(mean), sd: round2(sd) };
  }
  function summarizeFeedback(list, academicYear) {
    const rows = academicYear === null ? [...list] : list.filter((item) => item.academicYear === academicYear);
    const items = FEEDBACK_ITEMS.map((item) => {
      const values = rows.map((row) => row[item.key]);
      const { mean, sd } = meanSd(values);
      const counts = [5, 4, 3, 2, 1].map((s) => values.filter((v) => v === s).length);
      return { key: item.key, label: item.label, mean, sd, level: interpretMean(mean), counts };
    });
    const all = meanSd(rows.flatMap((row) => FEEDBACK_ITEMS.map((item) => row[item.key])));
    const comments = rows.filter((row) => row.comment).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).map((row) => ({ appNo: row.appNo, overall: row.overall, comment: row.comment, at: row.updatedAt }));
    return { count: rows.length, items, mean: all.mean, sd: all.sd, level: interpretMean(all.mean), comments };
  }
  function parseFeedback(header, rows) {
    const col = (row, name) => {
      var _a;
      const index = header.indexOf(name);
      return index === -1 ? "" : String((_a = row[index]) != null ? _a : "");
    };
    return rows.map((row) => ({
      applicantId: col(row, "applicantId"),
      appNo: col(row, "appNo"),
      academicYear: Number(col(row, "academicYear")) || 0,
      level: col(row, "level"),
      ease: score(col(row, "ease")),
      speed: score(col(row, "speed")),
      overall: score(col(row, "overall")),
      comment: col(row, "comment"),
      createdAt: col(row, "createdAt"),
      updatedAt: col(row, "updatedAt")
    })).filter((item) => item.applicantId !== "" && item.overall > 0);
  }
  var feedbackToRow = (item) => FEEDBACK_COLUMNS.map((column) => {
    var _a;
    return String((_a = item[column]) != null ? _a : "");
  });
  return __toCommonJS(index_exports);
})();

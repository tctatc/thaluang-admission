/**
 * แจ้งเตือน
 *
 * LINE Notify ปิดบริการไปตั้งแต่ 31 มี.ค. 2025 ระบบนี้จึงใช้ LINE Messaging API (บอทของ LINE OA)
 * push เข้ากลุ่มเจ้าหน้าที่ และใช้อีเมล (MailApp) แจ้งผู้สมัครที่กรอกอีเมลไว้
 *
 * การแจ้งเตือนล้มเหลวต้องไม่ทำให้การสมัครล้ม — ทุกฟังก์ชันจับ error แล้วเขียน log เท่านั้น
 * ข้อความ LINE ไม่ใส่เลขบัตร/ที่อยู่ ใส่แค่เลขที่ใบสมัครกับสาขา (ข้อมูลส่วนบุคคลอยู่ในระบบเท่านั้น)
 */

function pushLine_(text) {
  const token = getProp_(PROP_LINE_TOKEN);
  const to = getProp_(PROP_LINE_TO);
  if (!token || !to) return;
  try {
    const response = UrlFetchApp.fetch('https://api.line.me/v2/bot/message/push', {
      method: 'post',
      contentType: 'application/json',
      headers: { Authorization: `Bearer ${token}` },
      payload: JSON.stringify({ to: to, messages: [{ type: 'text', text: text.slice(0, 4900) }] }),
      muteHttpExceptions: true,
    });
    if (response.getResponseCode() >= 300) console.warn(`LINE ตอบ ${response.getResponseCode()}: ${response.getContentText()}`);
  } catch (error) {
    console.warn(`ส่ง LINE ไม่สำเร็จ: ${error.message}`);
  }
}

function sendMail_(to, subject, body) {
  if (!to) return;
  try {
    MailApp.sendEmail({ to: to, subject: subject, body: body, name: 'งานรับสมัคร วท.ท่าหลวงซิเมนต์ไทยอนุสรณ์' });
  } catch (error) {
    console.warn(`ส่งอีเมลไม่สำเร็จ: ${error.message}`);
  }
}

function choiceText_(applicant, programs) {
  const name = Domain.programName(programs, Domain.firstChoice(applicant));
  return `${Domain.LEVEL_LABEL[applicant.level] || ''} ${name}`.trim();
}

function notifyNewApplication_(applicant, programs) {
  const text = `ผู้สมัครใหม่ ${applicant.appNo}\n${choiceText_(applicant, programs)}\nโรงเรียน: ${applicant.schoolName} (${applicant.schoolProvince})`;
  pushLine_(text);
  sendMail_(getProp_(PROP_NOTIFY_EMAIL), `ผู้สมัครใหม่ ${applicant.appNo}`, text);
  sendMail_(applicant.email, `ได้รับใบสมัครแล้ว เลขที่ ${applicant.appNo}`, [
    `เรียน ${Domain.fullName(applicant)}`,
    '',
    `วิทยาลัยได้รับใบสมัครของคุณแล้ว เลขที่ใบสมัคร ${applicant.appNo}`,
    'ตรวจสถานะ แนบเอกสารเพิ่ม และพิมพ์ใบสมัครได้ที่',
    statusPageUrl_(),
    '(ใช้เลขบัตรประชาชนและวันเกิดที่กรอกตอนสมัคร)',
  ].join('\n'));
}

/** แจ้งผู้สมัครเมื่อสถานะเปลี่ยน หรือเจ้าหน้าที่ขอให้ส่งเอกสารใหม่ */
function notifyApplicantUpdate_(applicant) {
  if (!applicant.email) return;
  const fixes = Domain.DOC_KINDS
    .filter(function (kind) { return applicant.documents[kind] && applicant.documents[kind].state === 'fix'; })
    .map(function (kind) { return `- ${Domain.DOC_INFO[kind].label}: ${applicant.documents[kind].note}`; });
  sendMail_(applicant.email, `อัปเดตใบสมัคร ${applicant.appNo}: ${Domain.STATUS_LABEL[applicant.status]}`, [
    `เรียน ${Domain.fullName(applicant)}`,
    '',
    `สถานะใบสมัครเลขที่ ${applicant.appNo}: ${Domain.STATUS_LABEL[applicant.status]}`,
    applicant.statusNote ? `ข้อความจากเจ้าหน้าที่: ${applicant.statusNote}` : '',
    fixes.length ? `เอกสารที่ต้องส่งใหม่:\n${fixes.join('\n')}` : '',
    '',
    `ดูรายละเอียดได้ที่ ${statusPageUrl_()}`,
  ].filter(function (line, i, all) { return line !== '' || all[i - 1] !== ''; }).join('\n'));
}

function statusPageUrl_() {
  const base = getProp_(PROP_PUBLIC_SITE_URL).replace(/\/+$/, '');
  return base ? `${base}/#/status` : '(ลิงก์หน้าตรวจสถานะของวิทยาลัย)';
}

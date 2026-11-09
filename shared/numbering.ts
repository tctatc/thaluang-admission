import type { Track } from './model';

/** เลขที่ใบสมัคร Q70-0001 — เรียงต่อจากเลขสูงสุดของปีนั้น (ไม่ใช้จำนวนแถว เผื่อมีการลบแถว) */
export function nextApplicationNo(existing: readonly string[], academicYear: number): string {
  const prefix = `Q${String(academicYear).slice(-2)}-`;
  let max = 0;
  for (const no of existing) {
    if (!no.startsWith(prefix)) continue;
    const seq = Number(no.slice(prefix.length));
    if (Number.isInteger(seq) && seq > max) max = seq;
  }
  return `${prefix}${String(max + 1).padStart(4, '0')}`;
}

const SEQ_TOKEN = /\{(N+)\}/g;

/** ตรวจรูปแบบรหัสนักศึกษา — คืนข้อความผิดพลาด หรือ '' ถ้าใช้ได้ */
export function checkStudentIdPattern(pattern: string): string {
  const seqTokens = pattern.match(SEQ_TOKEN) ?? [];
  if (seqTokens.length !== 1) return 'รูปแบบต้องมีช่องเลขลำดับ {NNN} หนึ่งช่องพอดี';
  const leftover = pattern.replace(SEQ_TOKEN, '').replace(/\{(YY|YYYY|L|PP)\}/g, '');
  if (/[{}]/.test(leftover)) return 'มีรหัสในวงเล็บปีกกาที่ระบบไม่รู้จัก ใช้ได้เฉพาะ {YY} {YYYY} {L} {PP} {NNN}';
  if (!/^[A-Za-z0-9-]*$/.test(leftover)) return 'นอกจากรหัสในวงเล็บ ใช้ได้เฉพาะตัวอักษรอังกฤษ ตัวเลข และขีด';
  return '';
}

/**
 * ออกรหัสนักศึกษาถัดไปตามรูปแบบที่ตั้งไว้
 * {YY}=ปีการศึกษา 2 หลักท้าย, {L}=2 ปวช./3 ปวส., {PP}=รหัสสาขา, {NNN}=ลำดับ (นับแยกตามส่วนที่เหลือของรหัส)
 * ต้องเรียกภายใต้ล็อกของ server เสมอ ไม่งั้นสองคนกดพร้อมกันได้เลขซ้ำ
 */
export function nextStudentId(
  pattern: string,
  ctx: { academicYear: number; track: Track; programCode: string },
  existingIds: readonly string[],
): string {
  const problem = checkStudentIdPattern(pattern);
  if (problem) throw new Error(problem);
  const filled = pattern
    .replace(/\{YYYY\}/g, String(ctx.academicYear))
    .replace(/\{YY\}/g, String(ctx.academicYear).slice(-2))
    .replace(/\{L\}/g, ctx.track === 'pvc' ? '2' : '3')
    .replace(/\{PP\}/g, ctx.programCode);
  const width = (/\{(N+)\}/.exec(filled)![1]!).length;
  const [before, after] = filled.split(/\{N+\}/) as [string, string];
  let max = 0;
  for (const id of existingIds) {
    if (id.length !== before.length + width + after.length || !id.startsWith(before) || !id.endsWith(after)) continue;
    const seq = id.slice(before.length, before.length + width);
    if (/^\d+$/.test(seq)) max = Math.max(max, Number(seq));
  }
  const next = max + 1;
  if (String(next).length > width) throw new Error(`เลขลำดับเต็มแล้ว (${width} หลัก) — เพิ่มจำนวน N ในรูปแบบรหัส`);
  return `${before}${String(next).padStart(width, '0')}${after}`;
}

/**
 * แผนลบใบสมัครแล้วเลื่อนเลขที่ที่เหลือลงมาให้ต่อเนื่อง (เฉพาะปีการศึกษาที่ระบุ)
 * เรียงตามเลขเดิมจากน้อยไปมาก เลขใหม่จึงน้อยกว่าหรือเท่ากับเลขเดิมเสมอ เปลี่ยนทีละรายการได้โดยไม่ชนกัน
 */
export function renumberPlan<T extends { id: string; appNo: string; academicYear: number }>(
  applicants: readonly T[], academicYear: number, removeAppNos: readonly string[],
): { remove: T[]; renames: { id: string; from: string; to: string }[]; missing: string[] } {
  const prefix = `Q${String(academicYear).slice(-2)}-`;
  const seq = (no: string) => Number(no.slice(prefix.length));
  const year = applicants.filter((a) => a.academicYear === academicYear && a.appNo.startsWith(prefix));
  const remove = year.filter((a) => removeAppNos.includes(a.appNo));
  const missing = removeAppNos.filter((no) => !remove.some((a) => a.appNo === no));
  const keep = year.filter((a) => !removeAppNos.includes(a.appNo)).sort((a, b) => seq(a.appNo) - seq(b.appNo));
  const renames = keep
    .map((a, index) => ({ id: a.id, from: a.appNo, to: `${prefix}${String(index + 1).padStart(4, '0')}` }))
    .filter((r) => r.from !== r.to);
  return { remove, renames, missing };
}

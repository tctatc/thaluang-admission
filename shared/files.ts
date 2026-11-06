import { ALLOWED_MIME, MAX_FILE_BYTES } from './model';

/**
 * ตรวจชนิดไฟล์จากไบต์ต้นไฟล์ (magic number) ไม่เชื่อนามสกุลหรือ MIME ที่เบราว์เซอร์ส่งมา
 * เพราะเปลี่ยนชื่อไฟล์ .exe เป็น .jpg ได้ง่าย ๆ
 */
export function sniffMime(head: readonly number[]): string {
  if (head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff) return 'image/jpeg';
  if (head[0] === 0x89 && head[1] === 0x50 && head[2] === 0x4e && head[3] === 0x47) return 'image/png';
  if (head[0] === 0x25 && head[1] === 0x50 && head[2] === 0x44 && head[3] === 0x46) return 'application/pdf';
  return '';
}

/** คืนข้อความผิดพลาด หรือ '' ถ้าไฟล์ใช้ได้ */
export function checkUpload(head: readonly number[], size: number, imageOnly: boolean): { mime: string; problem: string } {
  const mime = sniffMime(head);
  if (!(ALLOWED_MIME as readonly string[]).includes(mime)) return { mime, problem: 'รับเฉพาะไฟล์ JPG, PNG หรือ PDF' };
  if (imageOnly && mime === 'application/pdf') return { mime, problem: 'รูปถ่ายต้องเป็นไฟล์ JPG หรือ PNG' };
  if (size <= 0) return { mime, problem: 'ไฟล์ว่างเปล่า' };
  if (size > MAX_FILE_BYTES) return { mime, problem: `ไฟล์ใหญ่เกิน ${MAX_FILE_BYTES / 1024 / 1024} MB` };
  return { mime, problem: '' };
}

export const extensionFor = (mime: string): string =>
  mime === 'application/pdf' ? 'pdf' : mime === 'image/png' ? 'png' : 'jpg';

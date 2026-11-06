import { checkUpload } from '@shared/files';
import { DOC_INFO, type DocKind } from '@shared/model';

/**
 * เตรียมไฟล์ก่อนส่ง: ย่อรูปถ่ายจากมือถือ (มัก 3–8 MB) ให้เหลือหลักร้อย KB
 * ส่งเร็วขึ้นมากบนเน็ตมือถือ และไม่ชนเพดานขนาดคำขอของ Apps Script
 * PDF ส่งตามเดิม แต่ตรวจชนิด/ขนาดด้วยกฎเดียวกับ server ก่อน จะได้รู้ผลทันทีไม่ต้องรออัปโหลด
 */

const MAX_EDGE: Record<DocKind, number> = { photo: 900, transcript: 2000, idCard: 1600, houseReg: 2000, certificate: 2000 };

export interface PreparedFile { name: string; dataUrl: string; bytes: number }

function readAsDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('อ่านไฟล์ไม่ได้ ลองเลือกไฟล์ใหม่'));
    reader.readAsDataURL(blob);
  });
}

async function shrinkImage(file: File, maxEdge: number): Promise<Blob> {
  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) throw new Error('เปิดรูปนี้ไม่ได้ ไฟล์อาจเสีย ลองถ่ายใหม่หรือเลือกไฟล์อื่น');
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const context = canvas.getContext('2d')!;
  // พื้นขาวรองไว้ PNG โปร่งใสจะได้ไม่กลายเป็นพื้นดำตอนแปลงเป็น JPEG
  context.fillStyle = '#fff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve, reject) => canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('ย่อรูปไม่สำเร็จ'))), 'image/jpeg', 0.86));
}

export async function prepareFile(file: File, kind: DocKind): Promise<PreparedFile> {
  const head = [...new Uint8Array(await file.slice(0, 8).arrayBuffer())];
  const isPdf = head[0] === 0x25 && head[1] === 0x50;
  // รูปใหญ่ตรวจขนาดหลังย่อ ไม่ใช่ก่อน (รูปจากมือถือ 8 MB ย่อแล้วเหลือไม่ถึง 1 MB)
  const precheck = checkUpload(head, isPdf ? file.size : 1, DOC_INFO[kind].imageOnly);
  if (precheck.problem) throw new Error(precheck.problem);
  const blob = isPdf ? file : await shrinkImage(file, MAX_EDGE[kind]);
  const finalCheck = checkUpload([...new Uint8Array(await blob.slice(0, 8).arrayBuffer())], blob.size, DOC_INFO[kind].imageOnly);
  if (finalCheck.problem) throw new Error(finalCheck.problem);
  return { name: file.name, dataUrl: await readAsDataUrl(blob), bytes: blob.size };
}

export function formatBytes(bytes: number): string {
  return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function base64ToBlob(dataBase64: string, mime: string): Blob {
  const binary = atob(dataBase64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

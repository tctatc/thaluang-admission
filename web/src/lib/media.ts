import { useEffect, useState } from 'react';
import { checkManual, checkPoster } from '@shared/files';
import { fileStore } from './storage';

/**
 * ไฟล์ประกาศและคู่มือฝั่งหน้าเว็บ
 * - โปสเตอร์ย่อในเบราว์เซอร์ก่อนส่ง (ด้านยาวสุด 1600px) ผู้สมัครบนเน็ตมือถือโหลดรูปละไม่กี่ร้อย KB
 * - PDF ส่งตามเดิม แต่ตรวจชนิด/ขนาดด้วยกฎเดียวกับ server ก่อน รู้ผลทันทีไม่ต้องรออัปโหลด
 */

const POSTER_EDGE = 1600;

const headOf = async (blob: Blob) => [...new Uint8Array(await blob.slice(0, 8).arrayBuffer())];

function readAsDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('อ่านไฟล์ไม่ได้ ลองเลือกไฟล์ใหม่'));
    reader.readAsDataURL(blob);
  });
}

export interface PreparedPoster { dataBase64: string; width: number; height: number; previewUrl: string }

export async function preparePoster(file: File): Promise<PreparedPoster> {
  const precheck = checkPoster(await headOf(file), 1);
  if (precheck.problem) throw new Error(precheck.problem);
  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) throw new Error('เปิดรูปนี้ไม่ได้ ไฟล์อาจเสีย ลองเลือกไฟล์อื่น');
  const scale = Math.min(1, POSTER_EDGE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const context = canvas.getContext('2d')!;
  // พื้นขาวรองไว้ PNG โปร่งใสจะได้ไม่กลายเป็นพื้นดำตอนแปลงเป็น JPEG
  context.fillStyle = '#fff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  // คุณภาพสูงกว่ารูปเอกสาร เพราะโปสเตอร์มีตัวหนังสือเล็กที่ต้องอ่านออก
  const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('ย่อรูปไม่สำเร็จ'))), 'image/jpeg', 0.9));
  const check = checkPoster(await headOf(blob), blob.size);
  if (check.problem) throw new Error(check.problem);
  const dataUrl = await readAsDataUrl(blob);
  return { dataBase64: dataUrl, width: canvas.width, height: canvas.height, previewUrl: URL.createObjectURL(blob) };
}

/**
 * คู่มือ: PDF ส่งตามเดิม / รูปอินโฟกราฟิกย่อด้านยาวสุดไม่เกิน 3200px
 * (ใหญ่กว่าโปสเตอร์ เพราะอินโฟกราฟิกยาวและมีตัวหนังสือเล็กเต็มแผ่น)
 */
export async function readManualFile(file: File): Promise<{ dataBase64: string; name: string }> {
  const head = await headOf(file);
  const isPdf = head[0] === 0x25 && head[1] === 0x50;
  const precheck = checkManual(head, isPdf ? file.size : 1);
  if (precheck.problem) throw new Error(precheck.problem);
  if (isPdf) return { dataBase64: await readAsDataUrl(file), name: file.name };
  const blob = await shrinkToJpeg(file, 3200, 0.92);
  const check = checkManual(await headOf(blob), blob.size);
  if (check.problem) throw new Error(check.problem);
  return { dataBase64: await readAsDataUrl(blob), name: file.name.replace(/\.(png|jpe?g)$/i, '') + '.jpg' };
}

async function shrinkToJpeg(file: File, maxEdge: number, quality: number): Promise<Blob> {
  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) throw new Error('เปิดรูปนี้ไม่ได้ ไฟล์อาจเสีย ลองเลือกไฟล์อื่น');
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const context = canvas.getContext('2d')!;
  context.fillStyle = '#fff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('ย่อรูปไม่สำเร็จ'))), 'image/jpeg', quality));
}

/**
 * url ของไฟล์ที่แสดงได้ทันที — ระบบจริงเป็นลิงก์ Google Drive อยู่แล้ว
 * โหมดสาธิตเก็บไฟล์ใน IndexedDB (url ขึ้นต้น idb:) แปลงเป็น blob URL ให้ <img>/<iframe> ใช้ได้
 */
// ลิงก์มาจากชีต ถ้ามีคนแก้ชีตใส่ javascript: หรือ data: ปลอมมา ห้ามส่งเข้า <img>/<iframe> เด็ดขาด
const SAFE_URL = /^(https:\/\/|blob:|idb:)/;

export function useFileUrl(rawUrl: string): string {
  const url = SAFE_URL.test(rawUrl) ? rawUrl : '';
  const [resolved, setResolved] = useState(url.startsWith('idb:') ? '' : url);
  useEffect(() => {
    if (!url.startsWith('idb:')) { setResolved(url); return; }
    let objectUrl = '';
    let cancelled = false;
    void fileStore.get(url.slice(4)).then(async (dataUrl) => {
      if (cancelled || !dataUrl) return;
      objectUrl = URL.createObjectURL(await (await fetch(dataUrl)).blob());
      setResolved(objectUrl);
    });
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [url]);
  return resolved;
}

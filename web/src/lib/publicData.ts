import { useEffect, useState } from 'react';
import { api, type HomeData } from './api';
import { readStore, writeStore } from './storage';

/**
 * ข้อมูลหน้าแรก (ค่าตั้งค่า สาขา ประกาศ ยอดผู้สมัคร) — ที่เดียวทั้งเว็บ
 *
 * Apps Script ตอบคำขอละ 1.5–4 วินาที จึง:
 *  1. แสดงชุดล่าสุดที่เก็บในเครื่องทันที (เปิดครั้งที่ 2 ขึ้นไม่ต้องรอ) — มีแต่ตัวเลขรวม ไม่มีข้อมูลส่วนตัว
 *  2. ดึงชุดใหม่ในคำขอเดียว แล้วอัปเดตหน้าเอง
 *  3. ถามเลขเวอร์ชันทุก 15 วินาที ดึงใหม่เฉพาะเมื่อมีอะไรเปลี่ยน
 */

const KEY = 'tla.home.v1';
const POLL_MS = 15_000;

function readCached(): HomeData | null {
  const raw = readStore('local', KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as HomeData;
    return parsed && parsed.config && parsed.stats ? parsed : null;
  } catch {
    return null;
  }
}

let current: HomeData | null = readCached();
let fresh = false;
let error = '';
let inflight: Promise<void> | null = null;
let timer = 0;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((listener) => listener());

function refresh(): Promise<void> {
  inflight ??= api.home()
    .then((data) => {
      current = data;
      fresh = true;
      error = '';
      writeStore('local', KEY, JSON.stringify(data));
    })
    .catch((cause: Error) => { error = cause.message; })
    .finally(() => { inflight = null; notify(); });
  return inflight;
}

function startPolling() {
  if (timer) return;
  timer = window.setInterval(async () => {
    if (document.hidden || !current) return;
    try {
      const { dataVersion } = await api.version();
      if (dataVersion !== current.dataVersion) await refresh();
    } catch {
      // เน็ตสะดุด รอรอบถัดไป
    }
  }, POLL_MS);
}

/** stale = กำลังแสดงชุดที่เก็บไว้ในเครื่อง ยังรอชุดใหม่จาก server */
export function useHome(): { home: HomeData | null; stale: boolean; error: string } {
  const [, setTick] = useState(0);
  useEffect(() => {
    const listener = () => setTick((n) => n + 1);
    listeners.add(listener);
    if (!fresh) void refresh();
    startPolling();
    return () => { listeners.delete(listener); };
  }, []);
  return { home: current, stale: !fresh, error: current ? '' : error };
}

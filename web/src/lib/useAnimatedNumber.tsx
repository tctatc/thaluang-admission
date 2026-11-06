import { useEffect, useRef, useState } from 'react';

/**
 * เลื่อนตัวเลขจากค่าเดิมไปหาค่าเป้าหมาย ใช้ทำตัวเลขนับขึ้นและกราฟที่โตขึ้นตอนเปิดหน้า
 * เริ่มที่ 0 ทุกครั้ง ค่าเปลี่ยนอีก (มีผู้สมัครเพิ่ม) จะเลื่อนต่อจากค่าที่แสดงอยู่ ไม่กระโดดกลับ 0
 * ผู้ใช้ที่ตั้งเครื่องให้ลดการเคลื่อนไหวจะเห็นค่าสุดท้ายทันที
 */
export function useAnimatedNumber(target: number, { duration = 900, delay = 0 } = {}): number {
  const reduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const [value, setValue] = useState(reduced ? target : 0);
  const current = useRef(value);

  useEffect(() => {
    if (reduced) {
      current.current = target;
      setValue(target);
      return;
    }
    const from = current.current;
    if (from === target) return;
    let frame = 0;
    let start: number | null = null;
    const tick = (now: number) => {
      start ??= now + delay;
      const progress = Math.min(1, Math.max(0, now - start) / duration);
      const next = from + (target - from) * (1 - Math.pow(1 - progress, 3));
      current.current = next;
      setValue(next);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration, delay, reduced]);

  return value;
}

export function CountUp({ value, delay = 0, duration = 900 }: { value: number; delay?: number; duration?: number }) {
  const shown = useAnimatedNumber(value, { delay, duration });
  return <>{Math.round(shown).toLocaleString('th-TH')}</>;
}

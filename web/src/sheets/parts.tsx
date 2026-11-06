import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';

/**
 * ชิ้นส่วนของแบบฟอร์มกระดาษ ทุกหน่วยเป็น mm เพื่อให้พิมพ์ออกมาตรงตำแหน่งต้นฉบับ
 */

/**
 * บรรทัดของแบบฟอร์ม: y = ตำแหน่งเส้นบรรทัดจากขอบบนกระดาษ, x = ระยะจากขอบซ้าย
 * right = ระยะปลายบรรทัดจากขอบขวา (null = ยาวตามข้อความ ไม่มีช่องยืด)
 */
export function Row({ y, x, right = 7, children, style }: { y: number; x: number; right?: number | null; children: ReactNode; style?: CSSProperties }) {
  return (
    <div className="sheet-row" style={{ top: `${y - 5.2}mm`, left: `${x}mm`, ...(right === null ? {} : { right: `${right}mm` }), ...style }}>
      {children}
    </div>
  );
}

/**
 * ช่องเส้นประ — ข้อความยาวเกินช่องจะย่อตัวอักษรลงเอง (ไม่ตัดทิ้ง เอกสารราชการต้องเห็นครบ)
 * ไม่มีข้อมูลก็ยังเห็นเส้นประให้เขียนมือได้
 */
export function Fill({ children, w, grow = false, left = false }: { children?: string | undefined; w?: number; grow?: boolean; left?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [scale, setScale] = useState(1);
  const text = children ?? '';

  useLayoutEffect(() => {
    const box = ref.current;
    const inner = textRef.current;
    if (!box || !inner) return;
    // วัดจริงจากความกว้างที่ได้ (รวมช่องที่ยืดตามบรรทัด) แทนการเดาจากจำนวนตัวอักษร
    const fit = () => {
      inner.style.fontSize = '';
      const available = box.clientWidth - 6;
      const needed = inner.scrollWidth;
      setScale(needed > available && available > 0 ? Math.max(0.55, available / needed) : 1);
    };
    fit();
    void document.fonts?.ready.then(fit);
  }, [text, w, grow]);

  return (
    <span ref={ref} className={`sheet-fill${grow ? ' grow' : ''}${left ? ' left' : ''}`} style={w ? { width: `${w}mm` } : undefined}>
      <span ref={textRef} style={scale < 1 ? { fontSize: `${scale * 100}%` } : undefined}>{text || ' '}</span>
    </span>
  );
}

export function Box({ checked }: { checked: boolean }) {
  return (
    <span className="sheet-box" role="img" aria-label={checked ? 'เลือก' : 'ไม่เลือก'}>
      {checked && (
        <svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2.2 6.6 4.9 9.2 9.8 2.8" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" /></svg>
      )}
    </span>
  );
}

/** ย่อแผ่น A4 ให้พอดีจอ (มือถือ) โดยไม่เปลี่ยนขนาดจริง ตอนพิมพ์ CSS ล้างการย่อทิ้ง */
export function ScaledSheet({ children, className }: { children: ReactNode; className?: string }) {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [height, setHeight] = useState<number | undefined>(undefined);

  useLayoutEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;
    const fit = () => {
      const next = Math.min(1, outer.clientWidth / inner.offsetWidth);
      setScale(next);
      setHeight(inner.offsetHeight * next);
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(outer);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={outerRef} className={`w-full overflow-hidden print:overflow-visible ${className ?? ''}`} style={{ height }}>
      <div ref={innerRef} className="print-scale w-[210mm] origin-top-left" style={{ transform: scale < 1 ? `scale(${scale})` : undefined }}>
        {children}
      </div>
    </div>
  );
}

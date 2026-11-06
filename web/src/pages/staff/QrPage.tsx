import { useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode';
import { Check, Copy, Download, Printer } from 'lucide-react';
import { departmentsOf } from '@shared/admin';
import { useStaff } from '../../app/staff';
import { Button } from '../../components/ui';

/** ลิงก์ฟอร์มสมัคร: เว้น program = QR กลาง, ใส่ "pvc:01" = เลือกสาขาให้แล้ว */
export function applyLink(program?: string): string {
  const base = `${window.location.origin}${window.location.pathname}`;
  return `${base}#/apply${program ? `?p=${encodeURIComponent(program)}` : ''}`;
}

interface Target { key: string; title: string; subtitle: string; url: string }

/**
 * QR Code สำหรับติดบอร์ด แจกตอนออกแนะแนว หรือพิมพ์ลงโปสเตอร์
 * สร้างในเบราว์เซอร์ล้วน (ไม่ส่งลิงก์ไปบริการภายนอก) ความละเอียดสูงพอพิมพ์ A4
 */
export function QrPage() {
  const { programs } = useStaff();
  const [selected, setSelected] = useState<string[]>(['central']);
  const active = programs.filter((p) => p.active);
  const targets: Target[] = useMemo(() => [
    { key: 'central', title: 'สมัครเรียน (ทุกสาขา)', subtitle: 'QR กลาง ผู้สมัครเลือกสาขาเอง', url: applyLink() },
    ...active.map((p) => ({
      key: `${p.track}:${p.code}`,
      title: `${p.track === 'pvc' ? 'ปวช.' : 'ปวส.'} ${p.name}`,
      subtitle: `ประเภทวิชา${p.department}`,
      url: applyLink(`${p.track}:${p.code}`),
    })),
  ], [active]);
  const chosen = targets.filter((t) => selected.includes(t.key));
  const toggle = (key: string) => setSelected((list) => (list.includes(key) ? list.filter((k) => k !== key) : [...list, key]));

  return (
    <div className="space-y-5">
      <div className="no-print flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-brand-deep">QR Code สมัครเรียน</h1>
          <p className="text-sm text-ink-muted">สแกนแล้วเข้าฟอร์มสมัครทันที ไม่ต้องลงแอป · QR รายสาขาเลือกสาขาไว้ให้แล้ว</p>
        </div>
        <Button onClick={() => window.print()} disabled={!chosen.length} icon={<Printer className="size-4" aria-hidden="true" />}>พิมพ์ที่เลือก ({chosen.length})</Button>
      </div>

      <div className="no-print rounded-card bg-surface p-4 shadow-card ring-1 ring-line">
        <p className="mb-2 font-medium">เลือก QR ที่ต้องการ</p>
        <div className="flex flex-wrap gap-2">
          <Chip on={selected.includes('central')} onClick={() => toggle('central')}>QR กลาง</Chip>
          <Chip on={false} onClick={() => setSelected(targets.map((t) => t.key))}>เลือกทั้งหมด</Chip>
          <Chip on={false} onClick={() => setSelected([])}>ล้าง</Chip>
        </div>
        {departmentsOf(active).map((department) => (
          <div key={department} className="mt-3">
            <p className="text-sm text-ink-muted">ประเภทวิชา{department}</p>
            <div className="mt-1 flex flex-wrap gap-2">
              {targets.filter((t) => t.subtitle === `ประเภทวิชา${department}`).map((t) => (
                <Chip key={t.key} on={selected.includes(t.key)} onClick={() => toggle(t.key)}>{t.title}</Chip>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="print-area print-multi grid gap-4 sm:grid-cols-2 xl:grid-cols-3 print:grid-cols-2 print:gap-6 print:bg-white print:p-[12mm]">
        {chosen.map((target) => <QrCard key={target.key} target={target} />)}
      </div>
      {!chosen.length && <p className="no-print py-10 text-center text-ink-muted">เลือก QR ด้านบนอย่างน้อยหนึ่งอัน</p>}
    </div>
  );
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: string }) {
  return (
    <button type="button" aria-pressed={on} onClick={onClick}
      className={`inline-flex min-h-10 items-center gap-1.5 rounded-full px-3.5 text-sm font-medium ring-1 transition-colors ${on ? 'bg-brand text-ink-inverse ring-brand' : 'bg-surface text-ink ring-line-strong hover:bg-sunken'}`}>
      {on && <Check className="size-4" aria-hidden="true" />}{children}
    </button>
  );
}

function QrCard({ target }: { target: Target }) {
  const [src, setSrc] = useState('');
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    // ระดับแก้ผิด M: สแกนติดแม้กระดาษยับหรือพิมพ์ไม่คม แต่ลายไม่แน่นเกินไปสำหรับลิงก์ยาว
    QRCode.toDataURL(target.url, { width: 720, margin: 2, errorCorrectionLevel: 'M', color: { dark: '#2b0d12', light: '#ffffff' } })
      .then(setSrc).catch(() => setSrc(''));
  }, [target.url]);
  const download = () => {
    const link = document.createElement('a');
    link.href = src;
    link.download = `QR-${target.title.replace(/[\\/:*?"<>|.\s]+/g, '-')}.png`;
    link.click();
  };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(target.url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      window.prompt('คัดลอกลิงก์นี้', target.url);
    }
  };
  return (
    <figure className="flex flex-col items-center rounded-card bg-surface p-5 text-center shadow-card ring-1 ring-line print:break-inside-avoid print:shadow-none print:ring-black/30">
      <img src={`${import.meta.env.BASE_URL}college-logo.png`} alt="" className="size-10" />
      <figcaption className="mt-2">
        <p className="text-lg font-semibold text-brand-deep">{target.title}</p>
        <p className="text-sm text-ink-muted">{target.subtitle}</p>
      </figcaption>
      {src ? <img src={src} alt={`QR Code ${target.title}`} className="mt-3 aspect-square w-full max-w-60" /> : <div className="mt-3 aspect-square w-full max-w-60 animate-pulse rounded bg-sunken" />}
      <p className="mt-2 text-sm font-medium">สแกนเพื่อสมัครเรียนออนไลน์</p>
      <p className="mt-1 hidden break-all text-[9pt] text-ink-muted print:block">{target.url}</p>
      <div className="no-print mt-3 flex gap-2">
        <Button variant="secondary" onClick={download} disabled={!src} icon={<Download className="size-4" aria-hidden="true" />}>PNG</Button>
        <Button variant="ghost" onClick={copy} icon={copied ? <Check className="size-4" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}>{copied ? 'คัดลอกแล้ว' : 'คัดลอกลิงก์'}</Button>
      </div>
    </figure>
  );
}

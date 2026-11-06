import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, FileText, Megaphone, Paperclip, Pin, Printer, Search } from 'lucide-react';
import { DEFAULT_SETTINGS, DOC_INFO, DOC_KINDS, type Announcement } from '@shared/model';
import { bangkokDateParts, thaiLongDate } from '@shared/thai';
import { api } from '../lib/api';
import { usePublicConfig } from '../app/App';
import { PublicDashboard } from './PublicDashboard';

export function HomePage() {
  const { config } = usePublicConfig();
  const open = config?.applicationsOpen ?? true;
  const text = config?.siteText ?? DEFAULT_SETTINGS;

  return (
    <>
      <section className="relative overflow-hidden bg-brand-deep text-ink-inverse">
        {/* เส้นทองเฉียงจางๆ มาจากรูปทรงในตราวิทยาลัย */}
        <svg aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 size-[520px] opacity-[0.13]" viewBox="0 0 200 200">
          <path d="M100 6 194 100 100 194 6 100Z" fill="none" stroke="var(--color-gold)" strokeWidth="5" />
          <path d="M100 34 166 100 100 166 34 100Z" fill="none" stroke="var(--color-gold)" strokeWidth="3" />
        </svg>
        <div className="relative mx-auto max-w-6xl px-4 py-12 sm:py-16">
          <p className="enter text-gold">ปีการศึกษา {config ? config.academicYear : '…'} · รอบโควตา</p>
          <h1 className="enter mt-2 max-w-3xl text-3xl font-bold leading-tight sm:text-[2.6rem]">
            {text.heroTitle}
          </h1>
          <p className="enter mt-4 max-w-2xl whitespace-pre-line text-lg text-ink-inverse/85">{text.heroText}</p>
          <div className="enter mt-8 flex flex-wrap gap-3">
            {open ? (
              <Link to="/apply" className="inline-flex min-h-12 items-center gap-2 rounded-control bg-gold px-6 text-lg font-semibold text-brand-deep shadow-[0_3px_0_hsl(36_80%_30%)] transition-transform hover:brightness-105 active:translate-y-0.5 active:shadow-none">
                เริ่มกรอกใบสมัคร <ArrowRight className="size-5" aria-hidden="true" />
              </Link>
            ) : (
              <p className="rounded-control bg-ink-inverse/10 px-5 py-3 text-lg">ขณะนี้ปิดรับสมัครแล้ว</p>
            )}
            <Link to="/status" className="inline-flex min-h-12 items-center gap-2 rounded-control px-5 text-lg font-medium text-ink-inverse ring-1 ring-inset ring-ink-inverse/40 hover:bg-ink-inverse/10">
              <Search className="size-5" aria-hidden="true" />ตรวจสถานะ / พิมพ์ใบสมัคร
            </Link>
          </div>
        </div>
      </section>

      <Announcements />

      <PublicDashboard />

      {text.details && (
        <section aria-labelledby="details" className="mx-auto max-w-6xl px-4 pt-12">
          <div className="rounded-card bg-surface p-6 shadow-card ring-1 ring-line">
            <h2 id="details" className="text-2xl text-brand-deep">รายละเอียดการรับสมัคร</h2>
            <p className="mt-3 max-w-[75ch] whitespace-pre-line text-[17px] leading-relaxed">{text.details}</p>
          </div>
        </section>
      )}

      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 lg:grid-cols-[1.1fr_1fr]">
        <section aria-labelledby="steps">
          <h2 id="steps" className="text-2xl text-brand-deep">ขั้นตอนการสมัคร</h2>
          <ol className="mt-5 space-y-5">
            {[
              { icon: FileText, title: 'กรอกใบสมัคร', text: 'ใช้เวลาราว 10 นาที ระหว่างกรอกดูตัวอย่างใบสมัครที่เติมข้อมูลแล้วได้ตลอด' },
              { icon: Paperclip, title: 'แนบเอกสาร', text: 'ถ่ายรูปเอกสารด้วยมือถือแล้วแนบได้เลย ระบบย่อขนาดไฟล์ให้เอง แนบเพิ่มทีหลังได้ที่หน้าตรวจสถานะ' },
              { icon: Printer, title: 'พิมพ์ใบสมัคร ลงชื่อ แล้วนำมายื่น', text: 'สั่งพิมพ์หรือบันทึกเป็น PDF ได้ทันที เจ้าหน้าที่ตรวจเอกสารแล้วแจ้งผลในหน้าตรวจสถานะ' },
            ].map(({ icon: Icon, title, text }, index) => (
              <li key={title} className="flex gap-4">
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-brand text-lg font-semibold text-ink-inverse" aria-hidden="true">{index + 1}</span>
                <div>
                  <h3 className="flex items-center gap-2 text-lg"><Icon className="size-5 text-brand" aria-hidden="true" />{title}</h3>
                  <p className="text-ink-muted">{text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="prepare" className="rounded-card bg-surface p-6 shadow-card ring-1 ring-line">
          <h2 id="prepare" className="text-xl text-brand-deep">เตรียมก่อนเริ่มกรอก</h2>
          <ul className="mt-4 space-y-3">
            <li className="flex gap-3"><Dot />เลขบัตรประชาชน 13 หลัก (ใช้ตรวจสถานะภายหลัง)</li>
            {DOC_KINDS.map((kind) => (
              <li key={kind} className="flex gap-3">
                <Dot />
                <span>{DOC_INFO[kind].label}{!DOC_INFO[kind].required && <span className="text-ink-muted"> (ถ้ามี)</span>}</span>
              </li>
            ))}
          </ul>
          <p className="mt-5 border-t border-line pt-4 text-sm text-ink-muted">รับไฟล์ JPG, PNG หรือ PDF ขนาดไม่เกิน 5 MB ต่อไฟล์</p>
        </section>
      </div>
    </>
  );
}

const Dot = () => <span className="mt-2.5 size-2 shrink-0 rotate-45 bg-gold" aria-hidden="true" />;

/** ประกาศจากผู้ดูแล — ไม่มีประกาศก็ไม่แสดงส่วนนี้ ยาวเกิน 3 รายการให้กดดูเพิ่ม */
function Announcements() {
  const [list, setList] = useState<Announcement[]>([]);
  const [all, setAll] = useState(false);
  useEffect(() => { api.announcements().then((r) => setList(r.announcements)).catch(() => setList([])); }, []);
  if (list.length === 0) return null;
  const shown = all ? list : list.slice(0, 3);
  return (
    <section aria-labelledby="news" className="mx-auto max-w-6xl px-4 pt-12">
      <h2 id="news" className="flex items-center gap-2 text-2xl text-brand-deep"><Megaphone className="size-6 text-brand" aria-hidden="true" />ประกาศ</h2>
      <ul className="mt-4 grid gap-3 md:grid-cols-2">
        {shown.map((item, index) => (
          <li key={item.id} className={`enter rounded-card bg-surface p-5 shadow-card ring-1 ${item.pinned ? 'ring-gold' : 'ring-line'} ${index === 0 && shown.length % 2 === 1 ? 'md:col-span-2' : ''}`}>
            <p className="flex items-start gap-2 text-lg font-semibold">
              {item.pinned && <Pin className="mt-1 size-4 shrink-0 text-gold-ink" aria-label="ปักหมุด" />}{item.title}
            </p>
            <p className="text-sm text-ink-muted">{thaiLongDate(bangkokDateParts(item.updatedAt))}</p>
            <p className="mt-2 whitespace-pre-line">{item.body}</p>
          </li>
        ))}
      </ul>
      {list.length > 3 && (
        <button type="button" onClick={() => setAll((v) => !v)} className="mt-3 min-h-11 font-medium text-brand underline">
          {all ? 'ย่อ' : `ดูประกาศทั้งหมด (${list.length})`}
        </button>
      )}
    </section>
  );
}

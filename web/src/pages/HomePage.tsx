import { Link } from 'react-router-dom';
import { ArrowRight, FileText, Paperclip, Printer, Search } from 'lucide-react';
import { DOC_INFO, DOC_KINDS } from '@shared/model';
import { usePublicConfig } from '../app/App';

export function HomePage() {
  const { config } = usePublicConfig();
  const open = config?.applicationsOpen ?? true;

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
            สมัครเรียน ปวช. และ ปวส.<br />ที่วิทยาลัยเทคนิคท่าหลวงซิเมนต์ไทยอนุสรณ์
          </h1>
          <p className="enter mt-4 max-w-2xl text-lg text-ink-inverse/85">
            กรอกใบสมัครบนเว็บ ระบบเติมข้อมูลลงใบสมัครฉบับจริงของวิทยาลัยให้ทันที พิมพ์ ลงชื่อ แล้วนำมายื่นได้เลย ไม่ต้องเขียนเอง
          </p>
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

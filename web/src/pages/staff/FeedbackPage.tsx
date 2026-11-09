import { useEffect, useState } from 'react';
import { FileSpreadsheet, Star } from 'lucide-react';
import { FEEDBACK_ITEMS, SCORE_LABEL, type Feedback, type FeedbackSummary } from '@shared/feedback';
import { LEVEL_LABEL, type Level } from '@shared/model';
import { bangkokDateParts, thaiLongDate } from '@shared/thai';
import { buildWorkbook } from '@shared/xlsx';
import { useStaff } from '../../app/staff';
import { Alert, Button, Loading, Panel } from '../../components/ui';
import { api, errorMessage } from '../../lib/api';
import { downloadBlob } from '../../lib/files';

const fixed2 = (n: number) => n.toFixed(2);

/** ผลประเมินความพึงพอใจ — ตารางแบบรายงานสถานศึกษา (จำนวนแต่ละระดับ x̄ S.D. แปลผล) ส่งออก Excel ได้ */
export function FeedbackPage() {
  const { token, settings } = useStaff();
  const [year, setYear] = useState<number | 'all'>(settings?.academicYear ?? 'all');
  const [data, setData] = useState<{ summary: FeedbackSummary; rows: Feedback[]; years: number[] } | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setData(null);
    setError('');
    api.feedbackReport(token, year).then(setData).catch((cause) => setError(errorMessage(cause)));
  }, [token, year]);

  const years = [...new Set([...(data?.years ?? []), ...(settings ? [settings.academicYear] : [])])].sort((a, b) => b - a);

  const download = () => {
    if (!data) return;
    const s = data.summary;
    const head = ['รายการประเมิน', '5 มากที่สุด', '4 มาก', '3 ปานกลาง', '2 น้อย', '1 น้อยที่สุด', 'ค่าเฉลี่ย (x̄)', 'S.D.', 'ระดับความพึงพอใจ'];
    const table = [
      ...s.items.map((item, i) => [`${i + 1}. ${item.label}`, ...item.counts.map(String), fixed2(item.mean), fixed2(item.sd), item.level]),
      ['รวม', '', '', '', '', '', fixed2(s.mean), fixed2(s.sd), s.level],
    ];
    const raw = data.rows.map((r) => [r.appNo, String(r.academicYear), LEVEL_LABEL[r.level as Level] ?? r.level, String(r.ease), String(r.speed), String(r.overall), r.comment, r.updatedAt]);
    const label = year === 'all' ? 'ทุกปี' : String(year);
    const workbook = buildWorkbook([
      { name: 'สรุปผล', headers: head, rows: [...table, [], [`จำนวนผู้ตอบ ${s.count} คน`]] },
      { name: 'คำตอบรายคน', headers: ['เลขที่ใบสมัคร', 'ปีการศึกษา', 'ระดับ', ...FEEDBACK_ITEMS.map((item) => item.label), 'ข้อเสนอแนะ', 'ตอบเมื่อ'], rows: raw },
    ]);
    downloadBlob(new Blob([workbook], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), `ผลประเมินความพึงพอใจ-${label}.xlsx`);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-brand-deep">ผลประเมินความพึงพอใจ</h1>
          <p className="text-sm text-ink-muted">ผู้สมัครตอบที่หน้าตรวจสถานะ 1 ใบสมัครต่อ 1 ชุดคำตอบ</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select aria-label="ปีการศึกษา" value={String(year)} onChange={(e) => setYear(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="min-h-11 rounded-control border border-line-strong bg-surface px-3">
            {years.map((y) => <option key={y} value={y}>ปีการศึกษา {y}</option>)}
            <option value="all">ทุกปีการศึกษา</option>
          </select>
          <Button variant="secondary" onClick={download} disabled={!data?.summary.count} icon={<FileSpreadsheet className="size-4" aria-hidden="true" />}>ส่งออก Excel</Button>
        </div>
      </div>

      {error && <Alert tone="danger">{error}</Alert>}
      {!data && !error && <Loading label="กำลังโหลดผลประเมิน" />}
      {data && data.summary.count === 0 && (
        <p className="rounded-card bg-surface px-4 py-12 text-center text-ink-muted ring-1 ring-line">ยังไม่มีผู้ตอบแบบประเมินในช่วงนี้</p>
      )}

      {data && data.summary.count > 0 && (
        <>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <Tile label="จำนวนผู้ตอบ" value={`${data.summary.count} คน`} />
            <Tile label="ค่าเฉลี่ยรวม (x̄)" value={fixed2(data.summary.mean)} note={`ระดับ${data.summary.level}`} />
            <Tile label="ส่วนเบี่ยงเบนมาตรฐาน (S.D.)" value={fixed2(data.summary.sd)} />
          </div>

          <Panel title="สรุปผลรายข้อ">
            <div className="-mx-4 overflow-x-auto sm:mx-0">
              <table className="w-full min-w-[720px] text-left text-[15px]" data-numeric>
                <thead className="border-b border-line text-sm text-ink-muted">
                  <tr>
                    <th className="px-4 py-2 font-medium sm:px-3">รายการประเมิน</th>
                    {[5, 4, 3, 2, 1].map((s) => <th key={s} className="w-14 px-1 py-2 text-center font-medium">{s}<span className="block text-[11px] font-normal">{SCORE_LABEL[s]}</span></th>)}
                    <th className="w-16 px-2 py-2 text-right font-medium">x̄</th>
                    <th className="w-16 px-2 py-2 text-right font-medium">S.D.</th>
                    <th className="w-24 px-3 py-2 font-medium">ระดับ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {data.summary.items.map((item, i) => (
                    <tr key={item.key}>
                      <td className="px-4 py-2.5 sm:px-3">{i + 1}. {item.label}</td>
                      {item.counts.map((n, k) => <td key={k} className="px-1 py-2.5 text-center">{n}</td>)}
                      <td className="px-2 py-2.5 text-right font-semibold">{fixed2(item.mean)}</td>
                      <td className="px-2 py-2.5 text-right">{fixed2(item.sd)}</td>
                      <td className="px-3 py-2.5">{item.level}</td>
                    </tr>
                  ))}
                  <tr className="bg-sunken font-semibold">
                    <td className="px-4 py-2.5 sm:px-3" colSpan={6}>รวม</td>
                    <td className="px-2 py-2.5 text-right">{fixed2(data.summary.mean)}</td>
                    <td className="px-2 py-2.5 text-right">{fixed2(data.summary.sd)}</td>
                    <td className="px-3 py-2.5">{data.summary.level}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-sm text-ink-muted">เกณฑ์แปลผลค่าเฉลี่ย: 4.51–5.00 มากที่สุด, 3.51–4.50 มาก, 2.51–3.50 ปานกลาง, 1.51–2.50 น้อย, 1.00–1.50 น้อยที่สุด</p>
          </Panel>

          <Panel title={`ข้อเสนอแนะ (${data.summary.comments.length})`}>
            {data.summary.comments.length === 0 ? <p className="text-ink-muted">ยังไม่มีข้อเสนอแนะ</p> : (
              <ul className="divide-y divide-line">
                {data.summary.comments.map((c) => (
                  <li key={`${c.appNo}${c.at}`} className="py-3">
                    <p className="whitespace-pre-line [overflow-wrap:anywhere]">{c.comment}</p>
                    <p className="mt-1 flex flex-wrap items-center gap-x-3 text-sm text-ink-muted">
                      <span className="inline-flex items-center gap-1"><Star className="size-3.5 fill-current text-gold-ink" aria-hidden="true" />โดยรวม {c.overall}/5</span>
                      <span data-numeric>{c.appNo}</span>
                      <span>{thaiLongDate(bangkokDateParts(c.at))}</span>
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </>
      )}
    </div>
  );
}

function Tile({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="min-w-0 rounded-card bg-surface p-3 shadow-card ring-1 ring-line sm:p-4">
      <p className="text-xs leading-snug text-ink-muted sm:text-sm">{label}</p>
      <p className="text-2xl font-bold text-brand-deep sm:text-3xl" data-numeric>{value}</p>
      {note && <p className="text-xs font-medium text-brand sm:text-sm">{note}</p>}
    </div>
  );
}

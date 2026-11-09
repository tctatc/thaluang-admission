import { useState, type FormEvent } from 'react';
import { Pencil, Send, Star } from 'lucide-react';
import { FEEDBACK_ITEMS, SCORE_LABEL, type Feedback, type FeedbackKey } from '@shared/feedback';
import { api, errorMessage, type Credentials } from '../lib/api';
import { Alert, Button, Panel, cn } from './ui';

type Answers = Record<FeedbackKey, number> & { comment: string };

/**
 * แบบประเมินความพึงพอใจท้ายหน้าตรวจสถานะ — ตอบครั้งเดียวต่อใบสมัคร แก้คำตอบได้
 * ปุ่มคะแนนเป็น radio จริง กด Tab/ลูกศรได้ และบอกความหมายของตัวเลขเป็นคำ ไม่ใช้สีอย่างเดียว
 */
export function FeedbackCard({ cred, initial }: { cred: Credentials; initial: Feedback | null }) {
  const [saved, setSaved] = useState<Feedback | null>(initial);
  const [editing, setEditing] = useState(!initial);
  const [answers, setAnswers] = useState<Answers>({
    ease: initial?.ease ?? 0, speed: initial?.speed ?? 0, overall: initial?.overall ?? 0, comment: initial?.comment ?? '',
  });
  const [missing, setMissing] = useState<FeedbackKey[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const empty = FEEDBACK_ITEMS.filter((item) => !answers[item.key]).map((item) => item.key);
    setMissing(empty);
    if (empty.length) { setError('กรุณาให้คะแนนให้ครบทุกข้อ'); return; }
    setBusy(true);
    setError('');
    try {
      setSaved((await api.submitFeedback(cred, answers)).feedback);
      setEditing(false);
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setBusy(false);
    }
  };

  if (saved && !editing) {
    return (
      <Panel>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span aria-hidden="true" className="grid size-11 shrink-0 place-items-center rounded-full bg-gold-soft text-gold-ink"><Star className="size-5 fill-current" /></span>
            <div>
              <p className="font-semibold">ขอบคุณที่ช่วยประเมิน</p>
              <p className="text-sm text-ink-muted">ความพึงพอใจโดยรวม <span data-numeric>{saved.overall}</span>/5 ({SCORE_LABEL[saved.overall]})</p>
            </div>
          </div>
          <Button variant="ghost" onClick={() => setEditing(true)} icon={<Pencil className="size-4" aria-hidden="true" />}>แก้คำตอบ</Button>
        </div>
      </Panel>
    );
  }

  return (
    <Panel title="ช่วยประเมินการสมัครออนไลน์">
      <p className="-mt-2 mb-4 text-sm text-ink-muted">ใช้เวลาไม่ถึง 1 นาที วิทยาลัยนำไปปรับปรุงระบบรับสมัคร ไม่มีผลต่อการคัดเลือก</p>
      <form onSubmit={submit} noValidate className="space-y-5">
        {FEEDBACK_ITEMS.map((item, index) => (
          <fieldset key={item.key} className="min-w-0">
            <legend className={cn('mb-2 font-medium', missing.includes(item.key) && 'text-danger')}>
              <span data-numeric>{index + 1}.</span> {item.label}
            </legend>
            <div className="grid grid-cols-5 gap-1.5">
              {[5, 4, 3, 2, 1].map((value) => {
                const checked = answers[item.key] === value;
                return (
                  <label key={value} className={cn('flex min-h-14 cursor-pointer flex-col items-center justify-center rounded-control px-1 py-1.5 text-center ring-1 transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-gold',
                    checked ? 'bg-brand text-ink-inverse ring-brand' : 'bg-surface ring-line-strong hover:bg-brand-soft')}>
                    <input type="radio" name={item.key} value={value} checked={checked} className="sr-only"
                      onChange={() => { setAnswers((a) => ({ ...a, [item.key]: value })); setMissing((m) => m.filter((k) => k !== item.key)); }} />
                    <span className="text-lg font-semibold leading-none" data-numeric>{value}</span>
                    <span className={cn('mt-1 text-[11px] leading-tight sm:text-xs', checked ? 'text-ink-inverse/90' : 'text-ink-muted')}>{SCORE_LABEL[value]}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        ))}
        <div>
          <label htmlFor="fb-comment" className="mb-1 block font-medium">ข้อเสนอแนะ <span className="font-normal text-ink-muted">(ถ้ามี)</span></label>
          <textarea id="fb-comment" rows={3} maxLength={500} value={answers.comment} onChange={(e) => setAnswers((a) => ({ ...a, comment: e.target.value }))}
            placeholder="เช่น ส่วนไหนกรอกยาก หรืออยากให้เพิ่มอะไร"
            className="w-full rounded-control border border-line-strong bg-surface px-3 py-2 text-base focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20" />
        </div>
        {error && <Alert tone="danger">{error}</Alert>}
        <div className="flex flex-wrap gap-2">
          <Button type="submit" loading={busy} icon={<Send className="size-4" aria-hidden="true" />}>ส่งแบบประเมิน</Button>
          {saved && <Button variant="ghost" onClick={() => setEditing(false)}>ยกเลิก</Button>}
        </div>
      </form>
    </Panel>
  );
}

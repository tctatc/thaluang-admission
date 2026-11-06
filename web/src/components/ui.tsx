import { useId, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from 'react';
import { AlertCircle, CheckCircle2, Info, Loader2, TriangleAlert } from 'lucide-react';
import { STATUS_LABEL, type Status } from '@shared/model';
import { THAI_MONTHS, parseIsoDate, toArabicDigits } from '@shared/thai';

export const cn = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ');

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

const VARIANT: Record<Variant, string> = {
  primary: 'bg-brand text-ink-inverse shadow-[0_2px_0_var(--color-brand-active)] hover:bg-brand-hover active:translate-y-px active:shadow-none',
  secondary: 'bg-surface text-ink ring-1 ring-inset ring-line-strong hover:bg-sunken',
  ghost: 'text-brand hover:bg-brand-soft',
  danger: 'bg-danger text-ink-inverse hover:brightness-95',
};

export function Button({ variant = 'primary', loading = false, icon, children, className, disabled, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant; loading?: boolean; icon?: ReactNode;
}) {
  return (
    <button
      type="button"
      {...rest}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        'inline-flex min-h-11 items-center justify-center gap-2 rounded-control px-4 text-[15px] font-medium transition-[background-color,transform,box-shadow] duration-150 disabled:cursor-not-allowed disabled:opacity-55',
        VARIANT[variant], className,
      )}
    >
      {loading ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : icon}
      {children}
    </button>
  );
}

const control = 'min-h-11 w-full rounded-control border bg-surface px-3 text-base text-ink transition-colors placeholder:text-ink-muted/70 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 disabled:bg-sunken';

/** ช่องกรอกพร้อมป้ายกำกับ คำอธิบาย และข้อความผิดพลาดใต้ช่อง (ผูก aria ให้โปรแกรมอ่านหน้าจออ่านได้) */
export function Field({ label, error, hint, required, children, className }: {
  label: string; error?: string | undefined; hint?: string | undefined; required?: boolean; className?: string | undefined;
  children: (props: { id: string; 'aria-invalid': boolean; 'aria-describedby': string | undefined; className: string }) => ReactNode;
}) {
  const id = useId();
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined;
  return (
    <div className={cn('min-w-0', className)}>
      <label htmlFor={id} className="mb-1 block text-[15px] font-medium text-ink">
        {label}{required && <span className="text-brand" aria-hidden="true"> *</span>}
      </label>
      {children({ id, 'aria-invalid': Boolean(error), 'aria-describedby': describedBy, className: cn(control, error ? 'border-danger' : 'border-line-strong') })}
      {hint && !error && <p id={`${id}-hint`} className="mt-1 text-sm text-ink-muted">{hint}</p>}
      {error && <p id={`${id}-error`} className="mt-1 flex items-start gap-1 text-sm text-danger"><AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />{error}</p>}
    </div>
  );
}

export function TextField({ label, error, hint, required, className, ...input }: InputHTMLAttributes<HTMLInputElement> & {
  label: string; error?: string | undefined; hint?: string;
}) {
  return (
    <Field label={label} error={error} hint={hint} required={required ?? false} className={className ?? ''}>
      {(props) => (
        <input
          {...input}
          {...props}
          required={required}
          // แป้นภาษาไทยพิมพ์ตัวเลขเป็น ๐-๙ — แปลงเป็นอารบิกทันทีที่พิมพ์ ระบบใช้เลขอารบิกทั้งหมด
          onChange={(event) => {
            const arabic = toArabicDigits(event.target.value);
            if (arabic !== event.target.value) {
              const caret = event.target.selectionStart;
              event.target.value = arabic;
              if (caret !== null && event.target.type !== 'email') event.target.setSelectionRange(caret, caret);
            }
            input.onChange?.(event);
          }}
        />
      )}
    </Field>
  );
}

export function SelectField({ label, error, hint, required, className, options, placeholder = 'เลือก', ...select }: SelectHTMLAttributes<HTMLSelectElement> & {
  label: string; error?: string | undefined; hint?: string; options: readonly (string | { value: string; label: string })[]; placeholder?: string;
}) {
  return (
    <Field label={label} error={error} hint={hint} required={required ?? false} className={className ?? ''}>
      {(props) => (
        <select {...select} {...props} required={required}>
          <option value="">{placeholder}</option>
          {options.map((option) => typeof option === 'string'
            ? <option key={option} value={option}>{option}</option>
            : <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      )}
    </Field>
  );
}

/**
 * วันเดือนปีเกิดแบบ 3 ช่อง (วัน / เดือนไทย / ปี พ.ศ.) แทนปฏิทินของเบราว์เซอร์
 * ทุกคนได้รูปแบบเดียวกัน ไม่สับสน ค.ศ./พ.ศ. และเก็บเป็น YYYY-MM-DD (ค.ศ.) ทุกครั้ง
 */
export function ThaiDateField({ label, value, onChange, error, required, minAge = 12, maxAge = 60, futureYears = 0 }: {
  label: string; value: string; onChange: (value: string) => void; error?: string | undefined; required?: boolean;
  minAge?: number; maxAge?: number; futureYears?: number;
}) {
  const id = useId();
  const [y = '', m = '', d = ''] = value.split('-');
  const newest = new Date().getFullYear() - minAge + futureYears;
  const years = Array.from({ length: maxAge - minAge + 1 + futureYears }, (_, i) => newest - i);
  const set = (next: { y?: string; m?: string; d?: string }) => {
    const yy = next.y ?? y;
    const mm = next.m ?? m;
    const dd = next.d ?? d;
    onChange(`${yy}-${mm}-${dd}`);
  };
  const invalidDay = y && m && d && !parseIsoDate(value);
  const selectClass = cn(control, 'px-2', error || invalidDay ? 'border-danger' : 'border-line-strong');
  return (
    <fieldset className="min-w-0" aria-describedby={error ? `${id}-error` : undefined}>
      <legend className="mb-1 block text-[15px] font-medium text-ink">{label}{required && <span className="text-brand" aria-hidden="true"> *</span>}</legend>
      <div className="grid grid-cols-[4.25rem_minmax(7.5rem,1fr)_5.25rem] gap-2">
        <select aria-label="วันที่" className={selectClass} value={d} onChange={(event) => set({ d: event.target.value })}>
          <option value="">วัน</option>
          {Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0')).map((day) => <option key={day} value={day}>{Number(day)}</option>)}
        </select>
        <select aria-label="เดือน" className={selectClass} value={m} onChange={(event) => set({ m: event.target.value })}>
          <option value="">เดือน</option>
          {THAI_MONTHS.map((month, i) => <option key={month} value={String(i + 1).padStart(2, '0')}>{month}</option>)}
        </select>
        <select aria-label="ปี พ.ศ." className={selectClass} value={y} onChange={(event) => set({ y: event.target.value })}>
          <option value="">พ.ศ.</option>
          {years.map((year) => <option key={year} value={String(year)}>{year + 543}</option>)}
        </select>
      </div>
      {(error || invalidDay) && (
        <p id={`${id}-error`} className="mt-1 flex items-start gap-1 text-sm text-danger">
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />{invalidDay ? 'เดือนนี้ไม่มีวันที่นี้' : error}
        </p>
      )}
    </fieldset>
  );
}

type Tone = 'info' | 'ok' | 'warn' | 'danger';
const TONE: Record<Tone, { box: string; icon: ReactNode }> = {
  info: { box: 'bg-info-soft text-info', icon: <Info className="mt-0.5 size-5 shrink-0" aria-hidden="true" /> },
  ok: { box: 'bg-ok-soft text-ok', icon: <CheckCircle2 className="mt-0.5 size-5 shrink-0" aria-hidden="true" /> },
  warn: { box: 'bg-warn-soft text-warn', icon: <TriangleAlert className="mt-0.5 size-5 shrink-0" aria-hidden="true" /> },
  danger: { box: 'bg-danger-soft text-danger', icon: <AlertCircle className="mt-0.5 size-5 shrink-0" aria-hidden="true" /> },
};

export function Alert({ tone = 'info', title, children, className }: { tone?: Tone; title?: string; children?: ReactNode; className?: string }) {
  return (
    <div role={tone === 'danger' ? 'alert' : 'status'} className={cn('flex gap-3 rounded-control px-4 py-3', TONE[tone].box, className)}>
      {TONE[tone].icon}
      <div className="min-w-0 text-[15px]">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className="text-ink">{children}</div>}
      </div>
    </div>
  );
}

const STATUS_TONE: Record<Status, string> = {
  submitted: 'bg-info-soft text-info',
  needs_fix: 'bg-warn-soft text-warn',
  passed: 'bg-ok-soft text-ok',
  not_passed: 'bg-danger-soft text-danger',
  enrolled: 'bg-gold-soft text-gold-ink',
};

export function StatusBadge({ status }: { status: Status }) {
  return <span className={cn('inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-sm font-medium', STATUS_TONE[status])}>{STATUS_LABEL[status]}</span>;
}

export function Panel({ children, className, title, action }: { children: ReactNode; className?: string; title?: string; action?: ReactNode }) {
  return (
    <section className={cn('rounded-card bg-surface p-4 shadow-card ring-1 ring-line sm:p-6', className)}>
      {(title || action) && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          {title && <h2 className="text-lg text-brand-deep">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function Loading({ label = 'กำลังโหลด' }: { label?: string }) {
  return <p className="flex items-center justify-center gap-2 py-16 text-ink-muted" role="status"><Loader2 className="size-5 animate-spin" aria-hidden="true" />{label}</p>;
}

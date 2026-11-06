import { useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Plus, Save, Trash2, Undo2 } from 'lucide-react';
import { countFirstChoice, departmentsOf } from '@shared/admin';
import type { Program } from '@shared/model';
import { useStaff } from '../../app/staff';
import { Alert, Button, cn } from '../../components/ui';
import { api, errorMessage } from '../../lib/api';

const cell = 'min-h-10 w-full rounded-[8px] border border-line-strong bg-surface px-2.5 text-[15px] focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20';

/**
 * จัดการแผนกวิชา สาขา และจำนวนรับ — แก้ในตารางแล้วกดบันทึกครั้งเดียว
 * แผนกวิชาเป็นชื่อกลุ่มของสาขา พิมพ์ชื่อแผนกใหม่ = สร้างแผนกใหม่, ไม่มีสาขาเหลือ = แผนกหายไปเอง
 */
export function ProgramsPage() {
  const { staff, programs, applicants, settings, token, reload } = useStaff();
  const [rows, setRows] = useState<Program[]>(() => programs.map((p) => ({ ...p })));
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ tone: 'ok' | 'danger'; text: string } | null>(null);
  const year = settings?.academicYear ?? 0;
  const dirty = JSON.stringify(rows) !== JSON.stringify(programs);
  const departments = useMemo(() => departmentsOf(rows), [rows]);

  if (staff?.role !== 'admin') return <Navigate to="/staff" replace />;

  const set = (index: number, patch: Partial<Program>) => setRows((list) => list.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  const add = (department = '') => {
    const used = new Set(rows.map((r) => r.code));
    const code = Array.from({ length: 99 }, (_, i) => String(i + 1).padStart(2, '0')).find((c) => !used.has(c)) ?? '';
    setRows((list) => [...list, { code, track: 'pvc', name: '', department, quota: 0, active: true }]);
  };
  const save = async () => {
    setBusy(true);
    setMessage(null);
    try {
      const result = await api.savePrograms(token, rows);
      setRows(result.programs);
      await reload();
      setMessage({ tone: 'ok', text: `บันทึกแล้ว ${result.programs.length} สาขา หน้าเว็บผู้สมัครเปลี่ยนตามทันที` });
    } catch (cause) {
      setMessage({ tone: 'danger', text: errorMessage(cause) });
    } finally {
      setBusy(false);
    }
  };

  const indexed = rows.map((row, index) => ({ row, index }));
  const groups = [
    ...departments.map((department) => ({ department, items: indexed.filter(({ row }) => row.department === department) })),
    ...(indexed.some(({ row }) => !row.department) ? [{ department: '', items: indexed.filter(({ row }) => !row.department) }] : []),
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-brand-deep">แผนกวิชา สาขา และจำนวนรับ</h1>
          <p className="text-sm text-ink-muted">"สมัครแล้ว" นับผู้ที่เลือกเป็นอันดับ 1 ในปีการศึกษา {year} · จำนวนรับ 0 = ไม่จำกัด</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => add()} icon={<Plus className="size-4" aria-hidden="true" />}>เพิ่มสาขา</Button>
          <Button variant="ghost" disabled={!dirty || busy} onClick={() => setRows(programs.map((p) => ({ ...p })))} icon={<Undo2 className="size-4" aria-hidden="true" />}>ยกเลิกที่แก้</Button>
          <Button loading={busy} disabled={!dirty} onClick={save} icon={<Save className="size-4" aria-hidden="true" />}>บันทึก</Button>
        </div>
      </div>
      {message && <Alert tone={message.tone}>{message.text}</Alert>}
      {dirty && !message && <Alert tone="warn">มีการแก้ไขที่ยังไม่บันทึก</Alert>}

      <datalist id="departments">{departments.map((d) => <option key={d} value={d} />)}</datalist>

      {groups.map(({ department, items }) => {
        const quota = items.reduce((sum, { row }) => sum + row.quota, 0);
        const applied = items.reduce((sum, { row }) => sum + countFirstChoice(applicants, row, year), 0);
        return (
          <section key={department || '_'} className="overflow-hidden rounded-card bg-surface shadow-card ring-1 ring-line">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-sunken px-4 py-3">
              <h2 className="text-lg text-brand-deep">{department ? `แผนกวิชา${department}` : 'ยังไม่ได้ระบุแผนก'}</h2>
              <div className="flex items-center gap-3 text-sm text-ink-muted">
                <span data-numeric>สมัครแล้ว {applied}{quota ? ` / รับ ${quota}` : ''} คน</span>
                {department && <Button variant="ghost" className="min-h-9 px-2 text-sm" onClick={() => add(department)} icon={<Plus className="size-4" aria-hidden="true" />}>เพิ่มสาขาในแผนกนี้</Button>}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] text-left text-[15px]">
                <thead className="text-sm text-ink-muted">
                  <tr>
                    <th className="px-3 py-2 font-medium">แผนกวิชา</th>
                    <th className="w-28 px-3 py-2 font-medium">ระดับ</th>
                    <th className="w-20 px-3 py-2 font-medium">รหัส</th>
                    <th className="px-3 py-2 font-medium">ชื่อสาขาวิชา</th>
                    <th className="w-24 px-3 py-2 font-medium">จำนวนรับ</th>
                    <th className="w-32 px-3 py-2 font-medium">สมัครแล้ว</th>
                    <th className="w-24 px-3 py-2 font-medium">เปิดรับ</th>
                    <th className="w-12 px-3 py-2"><span className="sr-only">ลบ</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {items.map(({ row, index }) => {
                    const count = countFirstChoice(applicants, row, year);
                    const full = row.quota > 0 && count >= row.quota;
                    return (
                      <tr key={index} className={cn(!row.active && 'bg-sunken/60 text-ink-muted')}>
                        <td className="px-3 py-2"><input aria-label="แผนกวิชา" list="departments" className={cell} value={row.department} onChange={(e) => set(index, { department: e.target.value })} placeholder="เช่น ช่างยนต์" /></td>
                        <td className="px-3 py-2">
                          <select aria-label="ระดับ" className={cell} value={row.track} onChange={(e) => set(index, { track: e.target.value as Program['track'] })}>
                            <option value="pvc">ปวช.</option><option value="pvs">ปวส.</option>
                          </select>
                        </td>
                        <td className="px-3 py-2"><input aria-label="รหัสสาขา" inputMode="numeric" maxLength={2} className={cell} value={row.code} onChange={(e) => set(index, { code: e.target.value })} /></td>
                        <td className="px-3 py-2"><input aria-label="ชื่อสาขา" className={cell} value={row.name} onChange={(e) => set(index, { name: e.target.value })} /></td>
                        <td className="px-3 py-2"><input aria-label="จำนวนรับ" inputMode="numeric" maxLength={4} className={cell} value={String(row.quota)} onChange={(e) => set(index, { quota: Number(e.target.value.replace(/\D/g, '')) || 0 })} /></td>
                        <td className="px-3 py-2" data-numeric>
                          <span className={cn('font-medium', full ? 'text-danger' : 'text-ink')}>{count}</span>
                          {row.quota > 0 && <span className="text-ink-muted"> / {row.quota}{full ? ' (เต็ม)' : ''}</span>}
                        </td>
                        <td className="px-3 py-2">
                          <label className="inline-flex min-h-10 items-center gap-2">
                            <input type="checkbox" checked={row.active} onChange={(e) => set(index, { active: e.target.checked })} />{row.active ? 'เปิด' : 'ปิด'}
                          </label>
                        </td>
                        <td className="px-3 py-2">
                          <button type="button" aria-label={`ลบสาขา ${row.name}`} title={count ? 'มีผู้สมัครแล้ว ลบไม่ได้ ให้ปิดรับแทน' : 'ลบสาขา'}
                            disabled={count > 0} onClick={() => setRows((list) => list.filter((_, i) => i !== index))}
                            className="grid size-10 place-items-center rounded-[8px] text-danger hover:bg-danger-soft disabled:cursor-not-allowed disabled:opacity-30">
                            <Trash2 className="size-4" aria-hidden="true" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        );
      })}
      {rows.length === 0 && <p className="rounded-card bg-surface py-12 text-center text-ink-muted ring-1 ring-line">ยังไม่มีสาขา กด "เพิ่มสาขา" เพื่อเริ่ม</p>}
    </div>
  );
}

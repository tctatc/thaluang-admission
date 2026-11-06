import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const dir = join(import.meta.dirname, '../../apps-script');

describe('Apps Script', () => {
  it('ทุกไฟล์ .gs รวมกันแล้วไม่มี syntax error และมี entry point ครบ', () => {
    const source = readdirSync(dir).filter((f) => f.endsWith('.gs')).sort().map((f) => readFileSync(join(dir, f), 'utf8')).join('\n;\n');
    // eslint-disable-next-line no-new-func
    const load = new Function(`${source}\nreturn { doGet, doPost, setupSystem, apiHandlers_, Domain };`);
    const api = load() as { Domain: Record<string, unknown>; apiHandlers_: () => Record<string, unknown> };
    expect(typeof api.Domain.submitApplication).toBe('function');
    expect(Object.keys(api.apiHandlers_())).toEqual(expect.arrayContaining(['config', 'submitApplication', 'lookup', 'uploadDocument', 'login', 'applicants', 'enroll']));
  });

  it('ชื่อ Domain.xxx ที่ .gs เรียกใช้มีอยู่จริงใน bundle', () => {
    const domain = readFileSync(join(dir, 'Domain.gs'), 'utf8');
    const used = new Set<string>();
    for (const f of readdirSync(dir).filter((f) => f.endsWith('.gs') && f !== 'Domain.gs')) {
      for (const m of readFileSync(join(dir, f), 'utf8').matchAll(/Domain\.([A-Za-z_]+)/g)) used.add(m[1]!);
    }
    const load = new Function(`${domain}\nreturn Domain;`) as () => Record<string, unknown>;
    const bundle = load();
    expect([...used].filter((name) => !(name in bundle))).toEqual([]);
  });
});

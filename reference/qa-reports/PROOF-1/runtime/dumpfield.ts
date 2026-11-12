// dumps one engine field (exact JSON, functions and pictures left out) at the given steps, standing still: npx tsx dumpfield.ts <repo> <stage> <field> <steps,...> <out>
import { writeFileSync } from 'node:fs';
const [repo, id, field, stepsArg, out] = process.argv.slice(2);
const steps = stepsArg.split(',').map(Number);
const rp = await import(`${repo}/src/game/realPlay.ts`);
function ser(v: any, d = 0): any {
  if (v === null || typeof v !== 'object') return typeof v === 'function' ? undefined : v;
  if (d > 7) return '…';
  if (Array.isArray(v)) return v.map((x) => ser(x, d + 1));
  if (v instanceof Map) return [...v.entries()].map(([k, x]) => [k, ser(x, d + 1)]);
  if (v instanceof Set) return [...v.values()].map((x) => ser(x, d + 1));
  const o: any = {};
  for (const k of Object.keys(v).sort()) { const x = v[k]; if (typeof x === 'function') continue; if (x && typeof x === 'object' && (x.getContext || x.drawImage || x.naturalWidth !== undefined)) continue; o[k] = ser(x, d + 1); }
  return o;
}
const r = new rp.RealPlay(id, 1);
const res: Record<string, any> = {};
const max = Math.max(...steps);
for (let i = 0; i <= max; i++) { r.frame({}); if (steps.includes(i)) res[i] = { t: r.e.gameTime, v: ser(r.e[field]) }; }
writeFileSync(out, JSON.stringify(res));

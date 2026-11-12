// (c) every timer bit-identical vs main: the real engine (realPlay.ts, the same file on both sides bar a test seam), each stage built
// as the game builds it, run 600 fixed steps (20 s) standing still; each step, every engine field that holds the stage's things is
// hashed (exact JSON of the numbers), plus gameTime and vineClock. Run once per repo:  npx tsx clockdiff.ts <repo> <out.json> [frames]
import { createHash } from 'node:crypto';
import { writeFileSync } from 'node:fs';
const repo = process.argv[2];
const outFile = process.argv[3];
const FRAMES = Number(process.argv[4] ?? 600);
const rp = await import(`${repo}/src/game/realPlay.ts`);
const wd = await import(`${repo}/src/game/worldsData.ts`);
const SKIP = new Set(['player', 'camera', 'particles', 'input', 'canvas', 'ctx', 'callbacks', 'floatingTexts', 'said', 'passed', 'perf', 'recorderState', 'stage', 'currentStage', 'level', 'config', 'clock']);
const ids: string[] = wd.generateAllLevels().map((l: any) => l.id);
const only = process.env.STAGES?.split(',');
const res: Record<string, { err?: string; frames?: Record<string, string>[] }> = {};
const seen = new WeakSet();
function ser(v: any, d = 0): any {
  if (v === null || typeof v !== 'object') return typeof v === 'function' ? undefined : v;
  if (d > 5) return '…';
  if (v instanceof HTMLCanvasElementLike()) return undefined;
  if (Array.isArray(v)) return v.map((x) => ser(x, d + 1));
  if (v instanceof Map) return [...v.entries()].map(([k, x]) => [k, ser(x, d + 1)]);
  if (v instanceof Set) return [...v.values()].map((x) => ser(x, d + 1));
  const o: any = {};
  for (const k of Object.keys(v).sort()) { const x = v[k]; if (typeof x === 'function') continue; if (x && typeof x === 'object' && (x.getContext || x.drawImage || x.naturalWidth !== undefined)) continue; o[k] = ser(x, d + 1); }
  return o;
}
function HTMLCanvasElementLike(): any { return (globalThis as any).HTMLCanvasElement ?? class {}; }
const h = (s: string) => createHash('sha1').update(s).digest('hex').slice(0, 16);
for (const id of ids) {
  if (only && !only.includes(id)) continue;
  try {
    const r = new rp.RealPlay(id, 1);
    const e = r.e;
    const keys = Object.keys(e).filter((k) => !SKIP.has(k) && e[k] && typeof e[k] === 'object' && !(e[k].getContext) && !ArrayBuffer.isView(e[k]));
    const frames: Record<string, string>[] = [];
    // (every field hashed on the first 30 steps and the last; in between only the fields that moved in those 30, to keep it fast)
    const hashAll = (ks: string[]) => { const f: Record<string, string> = { t: String(e.gameTime), vc: String(e.vineClock) }; for (const k of ks) { try { const s = JSON.stringify(ser(e[k])); if (s && s !== '[]' && s !== '{}') f[k] = h(s); } catch { /* cyclic or odd: skipped */ } } return f; };
    let moving: string[] = keys;
    for (let i = 0; i < FRAMES; i++) {
      r.frame({});
      const f = hashAll(i < 30 || i === FRAMES - 1 ? keys : moving);
      frames.push(f);
      if (i === 29) moving = keys.filter((k) => frames.some((g) => g[k] !== frames[0][k]));
    }
    res[id] = { frames };
  } catch (err: any) {
    res[id] = { err: String(err?.message ?? err).slice(0, 200) };
  }
}
writeFileSync(outFile, JSON.stringify(res));
console.log('stages', Object.keys(res).length, 'errors', Object.values(res).filter((r) => r.err).length);

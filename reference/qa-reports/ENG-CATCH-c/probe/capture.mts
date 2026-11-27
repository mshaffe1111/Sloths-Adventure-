// ENG-CATCH-c capture: build ROLLS (e.g. "n7,e2") on the instrumented wt-diag tree; for each, the towerCatches call whose catches
// stand in the final stage is written to OUT/<keep>-<roll>.json with the final stage's tower errors.
import { writeFileSync, mkdirSync } from 'node:fs';
const ROOT = process.env.ROOT!;
await import(ROOT + '/src/game/headlessDom.ts');
await import(ROOT + '/tools/engine/draft.ts');
const { W3_DOWN_TOWER } = await import(ROOT + '/src/game/gen2/worlds/w3.ts');
const { buildStage, SETTINGS } = await import(ROOT + '/tools/engine/libstage.ts');
const keep = (process.env.KEEP ?? '').split(',');
const arr = W3_DOWN_TOWER as any[]; const kept = [...arr].filter((q) => keep.includes(q.id)); arr.splice(0, arr.length, ...kept);
const OUT = process.env.OUT!; mkdirSync(OUT, { recursive: true });
const tag = process.env.TAG ?? 'all';
const ALL = Array.from({ length: 40 }, (_, k) => k + 1).flatMap((k) => [`n${k}`, `e${k}`]);
for (const r of process.env.ROLLS === 'ALL' ? ALL : (process.env.ROLLS ?? '').split(',').filter(Boolean)) {
  const d = SETTINGS.find((x: string) => x[0] === r[0]); const s = Number(r.slice(1));
  (globalThis as any).__TC = [];
  const st: any = buildStage('3-1', s, d);
  const calls: any[] = (globalThis as any).__TC;
  const has = (c: any, fx: number) => st.platforms.some((q: any) => Math.abs(q.x - (c.x + fx)) <= 1 && Math.abs(q.y - c.y) <= 1 && Math.abs(q.width - c.w) <= 1);
  let pick = -1;
  for (let k = calls.length - 1; k >= 0; k--) if (calls[k].flow === 'down' && calls[k].out.length && calls[k].out.every((c: any) => has(c, calls[k].fx))) { pick = k; break; }
  const errs = (st.gen2.errors ?? []).map(String).filter((x: string) => x.startsWith('tower:'));
  if (process.env.ROLLS === 'ALL' && !errs.length) continue;
  writeFileSync(`${OUT}/${tag}-${r}.json`, JSON.stringify({ roll: r, calls: calls.length, pick, errs, call: calls[pick] ?? null }));
  console.log(r, 'calls', calls.length, 'pick', pick, 'errs', errs.length);
}

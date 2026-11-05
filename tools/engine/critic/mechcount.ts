// Critic's run: how much each mechanic is used per stage in the shipped game (main), the baseline for ENGINE-SPEC's OPEN ladder amounts
// (L1311-1321: "a touch 1-2, some 3-6, lots 7+"; echo = next 2 stages; "≥1 in 3" later). Counts are tools/validate/mechanics.ts's MECHS
// counts (objects in the built stage, not uses on the route) on Normal, the median over LAYOUTS layouts. Run from a checkout of main:
//   LAYOUTS=16 WORLDS=1-4 npx tsx tools/engine/critic/mechcount.ts > out.json
import '../../../src/game/headlessDom.ts';
import { generateAllLevels } from '../../../src/game/worldsData.ts';
import { MECHS } from '../../validate/mechanics.ts';
import { sim } from '../../validate/play.ts';
const L = Number(process.env.LAYOUTS ?? 16);
const [w0, w1] = (process.env.WORLDS ?? '1-4').split('-').map(Number);
const ids = generateAllLevels().filter((c) => !c.secret).map((c) => c.id).filter((id) => { const w = Number(id.split('-')[0]); return w >= w0 && w <= (w1 ?? w0); });
const out: Record<string, Record<string, number[]>> = {};
for (const id of ids) {
  out[id] = {};
  for (let v = 1; v <= L; v++) {
    let s; try { s = sim(id, v, 'normal'); } catch (e) { process.stderr.write(`${id} ${v}: ${(e as Error).message.slice(0, 60)}\n`); continue; }
    for (const m of MECHS) (out[id][m.id] ??= []).push(m.count(s.stage as any, s.e as any));
  }
  process.stderr.write(id + ' ');
}
console.log(JSON.stringify({ layouts: L, stages: ids, counts: out }));

// A shut fig gate's neighbourhood, measured on built stages (FIX-15b, R-165.212, Matt: "it let me go above the platform"): on every
// gated stage's layouts, both settings, each shut gate's
//   LOW   wood under its span (or within GATE.lidSide of an end) with less room under the gate's line than its drawn sagged wood and his
//         drawn height need (tower.ts sealedRoom): standing there his head is in the thatch;
//   ONTO  wood under its level, not wholly under its lid, from which a jump (tower.ts leaps, generous) reaches its top at its sagged
//         far end (the lowest it is drawn): he would stand ON the shut gate, over the platform.
// Self-contained (its own copy of the two rules, read from GATE and leaps alone) so the same measure runs on a base and a branch: the
// before and after of a lay change. The verdict itself is tower.ts towerGates.
//   npx tsx tools/engine/gatereach.ts 1-4 [--layouts 16] [--from 0] [--list]
import '../../src/game/headlessDom.ts';
import { generateAllLevels } from '../../src/game/worldsData.ts';
import { generateStage, setLayoutVariant } from '../../src/game/stageGenerator.ts';
import { easyStage } from '../../src/game/easyMode.ts';
import { withGoals } from '../../src/game/goals.ts';
import { leaps } from '../../src/game/gen2/tower.ts';
import { GATE } from '../../src/game/vineField.ts';

const id = process.argv[2] ?? '1-4';
const arg = (k: string, d: string) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const N = Number(arg('--layouts', '16')), from = Number(arg('--from', '0')), list = process.argv.includes('--list');
const cfg = generateAllLevels().find((c) => c.id === id);
if (!cfg) { console.error(`gatereach: no stage ${id}`); process.exit(2); }
/** how far under a gate's top a piece still counts as level with it (tower.ts GATE_LEVEL) */
const LEVEL = 30;
/** the room under a gate's line its drawn sagged wood and his drawn height need (tower.ts sealedRoom; its margin GATE_MARGIN) */
const room = (w: number, margin: number) => GATE.sag + GATE.depth * w + GATE.head + margin;
const margin = Number(arg('--margin', '6'));
const R = Math.round;
let gates = 0, low = 0, onto = 0, errors = 0;
const lines: string[] = [];
for (const setting of ['normal', 'easy'] as const) for (let v = from; v < from + N; v++) {
  setLayoutVariant(v);
  let st: ReturnType<typeof generateStage>;
  try { st = setting === 'easy' ? easyStage(withGoals(generateStage({ ...cfg, unlocked: true }, 'easy'))) : withGoals(generateStage({ ...cfg, unlocked: true }, 'normal')); }
  catch (e) { errors++; lines.push(`${setting} L${v} ERROR ${String((e as Error).message).slice(0, 140)}`); continue; }
  finally { setLayoutVariant(null); }
  const errs = (st as { gen2?: { errors?: string[] } }).gen2?.errors ?? [];
  if (errs.length) { errors++; lines.push(`${setting} L${v} REFUSED ${errs[0].slice(0, 140)}`); }
  for (const gt of st.gates ?? []) {
    const g = st.platforms.find((q) => q.id === gt.platform);
    if (!g) continue;
    gates++;
    const under = st.platforms.filter((p) => p !== g && p.type !== 'bouncy' && p.y > g.y + LEVEL);
    const lo = under.find((p) => p.x < g.x + g.width + GATE.lidSide && p.x + p.width > g.x - GATE.lidSide && p.y - g.y < room(g.width, margin));
    const top = { x: g.x, y: g.y + GATE.sag, width: g.width };
    const on = under.find((p) => !(p.x >= g.x - GATE.lidSide && p.x + p.width <= g.x + g.width + GATE.lidSide) && leaps(p, top));
    if (lo) low++;
    if (on) onto++;
    if (lo || on) lines.push(`${setting} L${v} gate ${gt.id} ${R(g.x)}-${R(g.x + g.width)} y ${R(g.y)}${lo ? ` LOW ${R(lo.x)}-${R(lo.x + lo.width)} dy ${R(lo.y - g.y)}` : ''}${on ? ` ONTO from ${R(on.x)}-${R(on.x + on.width)} dy ${R(on.y - g.y)}` : ''}`);
  }
}
if (list) console.log(lines.join('\n'));
console.log(`gatereach ${id}: ${N} layouts from ${from} x 2 settings: ${gates} gates; LOW ${low}; ONTO ${onto}; builds refused or failed ${errors}`);

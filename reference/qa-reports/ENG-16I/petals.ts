// ENG-16I (the lead's 9:00 PM ET order): every petal a bot leaves on 1-6, with the piece under it, the walked span the lay read off that
// piece (gen2/walkedSpan.ts, on the stage as built), where the bot actually stood on that piece, and his closest pass; and the door's
// count against the stage's total. A seed is castBots' (the layout variant: the n-th proven seed).
//   BOT=expert SET=normal SEEDS=5,17 npx tsx reference/qa-reports/ENG-16I/petals.ts
import '../../../src/game/headlessDom.ts';
import { firstTimer, FT_KID, FT_CHILD, FT_MIDDLE, FT_EXPERT, FT_ADULT } from '../../../tools/inspect/firsttimer.ts';
import { GameEngine } from '../../../src/game/engine.ts';
import { walkedSpan } from '../../../src/game/gen2/walkedSpan.ts';
import { laidAsks } from '../../../src/game/gen2/pipeline.ts';

type P = { x: number; y: number; width: number; height: number; tag?: string; type?: string; creak?: unknown };
type C = { id: number; type: string; x: number; y: number; collected: boolean };
const bots: Record<string, unknown> = { kid: FT_KID, child: FT_CHILD, middle: FT_MIDDLE, expert: FT_EXPERT, adult: FT_ADULT };
const bot = process.env.BOT ?? 'expert', set = (process.env.SET ?? 'normal') as 'normal' | 'easy';
let E: any = null;
let path: Array<{ x: number; y: number; g: boolean; sw: boolean }> = [];
const eng: any = (GameEngine as any).prototype;
const up = eng.update;
eng.update = function (dt: number) {
  up.call(this, dt);
  if (E !== this) { E = this; path = []; }
  const p = this.player;
  path.push({ x: p.x, y: p.y, g: !!p.grounded, sw: !!p.isVineSwinging });
};
const R = Math.round;
for (const seed of (process.env.SEEDS ?? '5').split(',').map(Number)) {
  E = null;
  const r: any = firstTimer('1-6', seed, { ...(bots[bot] as object), setting: set } as never, { cap: 1200, dotSetting: true } as never);
  const st = E.currentStage;
  const secs: Array<{ uid: string; template: string }> = st.gen2?.sections ?? st.proto?.gen2?.sections ?? [];
  const name = (tag?: string) => { if (!tag) return '(untagged)'; const [u, k] = tag.split(':'); return `${(secs.find((s) => s.uid === u)?.template ?? u).replace('w1-16-', '')}:${k}`; };
  const plats: P[] = E.platforms;
  let asks = laidAsks(st);
  const flowers: C[] = (E.collectibles as C[]).filter((c) => c.type === 'flower');
  const missed = flowers.filter((c) => !c.collected);
  console.log(`${bot} ${set} seed ${seed}: end ${r.end}, goal ${JSON.stringify(r.goal)}, rescues ${r.rescues}; flowers laid ${flowers.length}, picked ${flowers.length - missed.length}, left ${missed.length}; laidAsks ${asks.length}${asks.length ? '' : ' (none on the engine stage: spans read without asks)'}`);
  const spanStage = { platforms: plats as never, vines: E.vines, asks };
  for (const c of missed) {
    const under = plats.filter((q) => c.x >= q.x - 2 && c.x <= q.x + q.width + 2 && q.y >= c.y && q.y - c.y <= 90).sort((a, b) => a.y - b.y)[0];
    let span = '', stood = 'never stood on it';
    if (under) {
      const ws = walkedSpan(under as never, spanStage as never);
      span = `walked span ${R(ws.lo)}..${R(ws.hi)}${ws.next ? ' (next piece)' : ''}`;
      const on = path.filter((s) => s.g && Math.abs(s.y - under.y) <= 3 && s.x >= under.x - 4 && s.x <= under.x + under.width + 4);
      if (on.length) stood = `stood ${R(Math.min(...on.map((s) => s.x)))}..${R(Math.max(...on.map((s) => s.x)))} (${on.length} frames)`;
    }
    let best = { d: Infinity, s: path[0] };
    for (const s of path) { const d = Math.hypot(s.x - c.x, s.y - 24 - c.y); if (d < best.d) best = { d, s }; }
    const b = best.s;
    console.log(`  petal ${c.id} x ${R(c.x)} y ${R(c.y)} | piece ${under ? `${name(under.tag)} ${under.type ?? ''}${under.creak ? ' CREAK' : ''} ${R(under.x)}..${R(under.x + under.width)} y ${R(under.y)}` : 'none under it'} | ${span} | ${stood} | closest pass ${R(best.d)} px (him x ${R(b.x)} y ${R(b.y)} ${b.sw ? 'swinging' : b.g ? 'grounded' : 'airborne'})`);
  }
}

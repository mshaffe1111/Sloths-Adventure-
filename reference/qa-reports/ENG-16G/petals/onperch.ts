// ENG-16G: where each bot lands on, and leaves, a perch (section:key), as t along it (0 left end, 1 right end): the ground truth for
// placing a petal on the walked path. BOTS=expert SEEDS=1-6 PIECES=first-liana:b1,gorge:b1 npx tsx reference/qa-reports/ENG-16G/petals/onperch.ts
import { firstTimer, FirstTimerRun, FT_CHILD, FT_MIDDLE, FT_EXPERT, FT_KID, FT_ADULT } from '../../../../tools/inspect/firsttimer.ts';
import { GameEngine } from '../../../../src/game/engine.ts';
const bots: Record<string, any> = { child: FT_CHILD, middle: FT_MIDDLE, expert: FT_EXPERT, kid: FT_KID, adult: FT_ADULT };
const want = (process.env.PIECES ?? 'first-liana:b1,gorge:b1').split(',');
const proto: any = (GameEngine as any).prototype; const up = proto.update;
const run: any = FirstTimerRun.prototype; const op = run.play; let last: any = null;
run.play = function () { last = this; return op.call(this); };
let rec: Record<string, { on: number[]; off: number[] }> = {}; let was: string | null = null; let lastT = 0;
proto.update = function (dt: number) {
  up.call(this, dt);
  const p = this.player; const st = this.currentStage; const secs = last?.sim?.stage?.gen2?.sections ?? st?.gen2?.sections ?? [];
  let here: string | null = null; let t = 0;
  if (p?.grounded) {
    const cx = p.x; // (p.x, p.y: his feet; RealPlay at the start of 1-6 stands at y = the bank's top)
    // (the piece he stands on: the highest tagged top at or just under his feet, within its span)
    const q = (this.platforms ?? st.platforms).filter((q: any) => q.tag && cx >= q.x && cx <= q.x + q.width && q.y >= p.y - 6 && q.y <= p.y + 40).sort((a: any, b: any) => a.y - b.y)[0];
    if (q) {
      const [uid, key] = q.tag.split(':');
      const name = `${(secs.find((s: any) => s.uid === uid)?.template ?? uid).replace('w1-16-', '')}:${key}`;
      if (want.includes(name)) { here = name; t = (cx - q.x) / q.width; }
    }
  }
  if (here && here !== was) (rec[here] ??= { on: [], off: [] }).on.push(+t.toFixed(2));
  if (was && here !== was) (rec[was] ??= { on: [], off: [] }).off.push(+lastT.toFixed(2));
  was = here; lastT = t;
};
const seeds = (process.env.SEEDS ?? '1-6').split('-').map(Number);
for (const name of (process.env.BOTS ?? 'expert').split(',')) for (let seed = seeds[0]; seed <= seeds[1]; seed++) {
  rec = {}; was = null;
  const r: any = firstTimer('1-6', seed, { ...bots[name], setting: (process.env.SET ?? 'normal') as any }, { cap: 1200, dotSetting: true } as any);
  console.log(name, seed, r.end, JSON.stringify(r.goal), JSON.stringify(rec));
}

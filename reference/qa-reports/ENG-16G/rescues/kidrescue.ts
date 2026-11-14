// ENG-16G: each rescue of a bot on 1-6, one line: seed, x, time (s) and frame (30 fps), the section:piece under him (or the vine he is
// on), the stuck record's words, and what he did in the 3 s before (swinging, grounded, airborne, hits, lives).
// BOT=kid SET=normal SEEDS=14,20,21,23,25,36 npx tsx reference/qa-reports/ENG-16G/rescues/kidrescue.ts
import { firstTimer, FirstTimerRun, FT_KID, FT_CHILD, FT_MIDDLE, FT_EXPERT, FT_ADULT } from '../../../../tools/inspect/firsttimer.ts';
import { GameEngine } from '../../../../src/game/engine.ts';
const bots: Record<string, any> = { kid: FT_KID, child: FT_CHILD, middle: FT_MIDDLE, expert: FT_EXPERT, adult: FT_ADULT };
const run: any = FirstTimerRun.prototype; const op = run.play; let last: any = null;
run.play = function () { last = this; return op.call(this); };
const resc: any = run.rescue; const hits: string[] = [];
let caught: string[] = []; let wasSw = false; let simRef: any = null;
let hist: Array<{ f: number; x: number; y: number; sw: boolean; g: boolean; hp: number; lv: number }> = []; let frame = 0;
const eng: any = (GameEngine as any).prototype; const up = eng.update;
eng.update = function (dt: number) {
  up.call(this, dt); frame++;
  const p = this.player;
  // (each catch and each let-go, with the vine he caught: the beat's story before a rescue)
  if (!!p.isVineSwinging !== wasSw) {
    const secs = last?.sim?.stage?.gen2?.sections ?? [];
    const v = (this.vines ?? []).filter((v: any) => v.tag).sort((a: any, b: any) => Math.abs(a.x - p.x) - Math.abs(b.x - p.x))[0];
    const [u, k] = (v?.tag ?? '?:?').split(':');
    const nm = `${(secs.find((s: any) => s.uid === u)?.template ?? u).replace('w1-16-', '')}:${k}${v?.snake ? `(${v.snake.route})` : ''}`;
    caught.push(`${p.isVineSwinging ? 'caught' : 'let go of'} ${nm} at f${frame} x ${Math.round(p.x)} y ${Math.round(p.y)}${p.isVineSwinging ? ` hold ${Math.round(p.swingLength ?? 0)}` : ` vx ${Math.round(p.vx)} vy ${Math.round(p.vy)}`}`);
    if (caught.length > 12) caught.shift();
    wasSw = !!p.isVineSwinging;
  } hist.push({ f: frame, x: Math.round(p.x), y: Math.round(p.y), sw: !!p.isVineSwinging, g: !!p.grounded, hp: p.health ?? this.health ?? 0, lv: this.lives ?? 0 });
  if (hist.length > 120) hist.shift();
};
const where = (sim: any, x: number, y: number): string => {
  const secs = sim.stage.gen2?.sections ?? [];
  const name = (tag: string) => { const [u, k] = tag.split(':'); return `${(secs.find((s: any) => s.uid === u)?.template ?? u).replace('w1-16-', '')}:${k}`; };
  if (sim.p.isVineSwinging) { const v = sim.vines.filter((v: any) => v.tag).sort((a: any, b: any) => Math.abs(a.x - x) - Math.abs(b.x - x))[0]; if (v) return `on vine ${name(v.tag)}${v.snake ? ` (snake ${v.snake.route})` : ''}`; }
  const q = sim.platforms.filter((q: any) => q.tag && x >= q.x - 10 && x <= q.x + q.width + 10 && q.y >= y - 8).sort((a: any, b: any) => a.y - b.y)[0];
  return q ? `${name(q.tag)} (${q.y - y > 8 ? `${q.y - y} px above it` : `t ${((x - q.x) / q.width).toFixed(2)}`})` : 'over a pit (no tagged piece under him)';
};
run.rescue = function () {
  const sim = this.sim, p = sim.p;
  const at = `${Math.round(p.x)},${Math.round(p.y)}`; const w = where(sim, p.x, p.y);
  const r = resc.call(this);
  if (r) {
    const h = hist.slice(-90); const sw = h.filter((s) => s.sw).length, g = h.filter((s) => s.g).length;
    const xs = h.map((s) => s.x); const ys = h.map((s) => s.y);
    const open = this.stuck[this.stuck.length - 1];
    hits.push(`  catches before it: ${caught.slice(-8).join(' | ')}`);
    hits.push(`  rescue at t ${this.t.toFixed(1)} s (frame ~${Math.round(this.t * 30)}), x,y ${at}: ${w}; last 3 s: swinging ${sw}/90 frames, grounded ${g}/90, x ${Math.min(...xs)}..${Math.max(...xs)}, y ${Math.min(...ys)}..${Math.max(...ys)}; last stuck note: ${open ? `t ${open.t} ${open.what}` : '(none)'}`);
  }
  return r;
};
for (const seed of (process.env.SEEDS ?? '14').split(',').map(Number)) {
  hits.length = 0; hist = []; frame = 0; caught = []; wasSw = false;
  const r: any = firstTimer('1-6', seed, { ...bots[process.env.BOT ?? 'kid'], setting: (process.env.SET ?? 'normal') as any }, { cap: 1200, dotSetting: true } as any);
  console.log(`${process.env.BOT ?? 'kid'} ${process.env.SET ?? 'normal'} seed ${seed}: ${r.end}, rescues ${r.rescues}, lives lost ${r.lives ?? '?'}, hitBy ${JSON.stringify(r.hitBy ?? {})}, time ${r.time}`);
  for (const h of hits) console.log(h);
}

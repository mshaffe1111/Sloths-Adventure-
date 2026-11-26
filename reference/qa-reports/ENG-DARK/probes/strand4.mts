// what holds the bot still (ENG-DARK-e): after t0, each second, what glowWait / glowJump returned and the dir the plan passed it, the
// glowStop and the pad pressed. GEN2_DRAFT=3-1 npx tsx <this> <bot> <setting> <seed> <t0>
import path from 'node:path';
const root = process.cwd();
const [bot, setting, seedArg, t0Arg] = process.argv.slice(2);
const { readyDraft } = await import(path.join(root, 'tools/engine/draft.ts'));
readyDraft('3-1');
const cb = await import(path.join(root, 'tools/inspect/castBots.ts'));
const ft: any = await import(path.join(root, 'tools/inspect/firsttimer.ts'));
const who = cb.CAST_BOTS[bot][setting];
const t0 = Number(t0Arg);
const P = ft.FirstTimerRun.prototype;
const seen: Record<string, number> = {};
let now = 0;
for (const name of ['glowWait', 'glowJump']) {
  const orig = P[name];
  P[name] = function (this: any, dir: number) {
    (globalThis as any).__ft = this; const out = orig.call(this, dir);
    if (now >= t0 && now <= t0 + 4) {
      const k = `${name} dir ${dir} -> ${out ? JSON.stringify(out) : 'null'} stop ${this.glowStop ? `${this.glowStop.rim.x},${this.glowStop.rim.y} since ${this.glowStop.since.toFixed(1)}` : '-'}`;
      seen[k] = (seen[k] ?? 0) + 1;
    }
    return out;
  };
}
let next = t0; let lastInt = '';
{ const oi = P.intend; P.intend = function (this: any) { const o = oi.call(this); if (now >= t0) lastInt = JSON.stringify(o); return o; }; }
firstTimer();
function firstTimer() {
  const r = ft.firstTimer('3-1', Number(seedArg), who, { cap: 1200, dotSetting: true,
    onFrame: (sim: any) => {
      now = sim.t;
      if (sim.t >= next && sim.t <= t0 + 4) {
        next += 0.5;
        const s = sim.input.state ?? sim.input;
        const v = (sim.e as any).nearTreeVine;
        { const r: any = (sim as any); const tg = (globalThis as any).__ft?.prog?.target?.(sim.p); console.log("t", sim.t.toFixed(1), "x", Math.round(sim.p.x), "vx", Math.round(sim.p.vx), "L", s.left?1:0, "R", s.right?1:0, "J", s.jump?1:0, "D", s.down?1:0, "U", s.up?1:0, "int", lastInt, "tgt", tg ? `${Math.round(tg.x)},${Math.round(tg.y)}` : "-"); }
      }
    },
  });
  console.log('end', r.end, r.time?.toFixed?.(1), 'goal', JSON.stringify(r.goal));
  for (const [k, n] of Object.entries(seen)) console.log(n, k);
}

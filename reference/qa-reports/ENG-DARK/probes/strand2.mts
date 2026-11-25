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
    const out = orig.call(this, dir);
    if (now >= t0) {
      const k = `${name} dir ${dir} -> ${out ? JSON.stringify(out) : 'null'} stop ${this.glowStop ? `${this.glowStop.rim.x},${this.glowStop.rim.y} since ${this.glowStop.since.toFixed(1)}` : '-'}`;
      seen[k] = (seen[k] ?? 0) + 1;
    }
    return out;
  };
}
let next = t0;
firstTimer();
function firstTimer() {
  const r = ft.firstTimer('3-1', Number(seedArg), who, {
    onFrame: (sim: any) => {
      now = sim.t;
      if (sim.t >= next) {
        next += 2;
        const s = sim.input.state ?? sim.input;
        const v = (sim.e as any).nearTreeVine;
        console.log('t', sim.t.toFixed(1), 'x', Math.round(sim.p.x), 'y', Math.round(sim.p.y), 'climb', sim.p.climbing ? 1 : 0, 'down', s.down ? 1 : 0, 'vine', v ? `${v.id} x ${Math.round(v.x)} top ${Math.round(v.topY)} foot ${Math.round(v.bottomY)} ${v.vineType}${v.off ? ' off' : ''}` : '-', 'cool', (sim.e as any).vineCooldownTimer?.toFixed?.(2), 'last', (sim.e as any).lastReleasedVineId, 'swungOff', (sim.e as any).swungOff);
      }
    },
  });
  console.log('end', r.end, r.time?.toFixed?.(1), 'goal', JSON.stringify(r.goal));
  for (const [k, n] of Object.entries(seen)) console.log(n, k);
}

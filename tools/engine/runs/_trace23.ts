// BUILD-23d trace tool (not a gate): castBots miss tracer (rescues + spooks): npx tsx tools/engine/runs/_trace23.ts kid normal 5,9
import '../../../src/game/headlessDom.ts';
import { firstTimer, FirstTimerRun } from '../../inspect/firsttimer.ts';
import { CAST_BOTS } from '../../inspect/castBots.ts';
const [who, setting, seeds] = [process.argv[2], process.argv[3], process.argv[4].split(',').map(Number)];
const W: any = (CAST_BOTS as any)[who][setting];
const P: any = FirstTimerRun.prototype;
const orig = P.rescue;
let log: string[] = [];
P.rescue = function (this: any) {
  const fp = this.e.follow;
  const line = fp ? fp.line.map((f: any) => `${f.state[0]}${Math.round(f.x)}`).join(' ') : '';
  const her = fp ? fp.herons.filter((h: any) => Math.abs(h.z.x0 - this.sim.p.x) < 1500).map((h: any) => `${h.s.phase}`).join('/') : '';
  log.push(`  RESCUE t${this.t.toFixed(1)} x${Math.round(this.sim.p.x)} y${Math.round(this.sim.p.y)} stuck:${JSON.stringify(this.stuckOpen?.what ?? '')} line[${line}] herons ${her} fetching ${this.fetching} hiding ${this.hiding}`);
  return orig.call(this);
};
const origPlay = P.play;
P.play = function (this: any) {
  const fp = this.e.follow;
  if (fp) { const st = fp.step.bind(fp); fp.step = (...a: any[]) => { const ev = st(...a); if (ev.spooked.length) log.push(`  spook t${this.t.toFixed(1)} him x${Math.round(this.sim.p.x)} ${ev.spooked.length} seen`); return ev; }; }
  return origPlay.call(this);
};
for (const seed of seeds) {
  log = [];
  const r: any = firstTimer('2-3', seed, W, { cap: 1200, dotSetting: true });
  console.log(`== ${who} ${setting} seed ${seed}: end ${r.end} rescues ${r.rescues} t ${r.time ?? r.t}`);
  const idx = log.map((l, i) => (l.includes("RESCUE") ? i : -1)).filter((i) => i >= 0);
  for (const i of idx) console.log(log.slice(Math.max(0, i - 3), i + 1).join("\n"));
}

// BUILD-27c scratch: why a bot was rescued on 2-7 (rescue x, its beat, the stuck record, the lives lost before it)
import '../wt-b27c-f1/src/game/headlessDom.ts';
import { firstTimer } from '../wt-b27c-f1/tools/inspect/firsttimer.ts';
import { CAST_BOTS } from '../wt-b27c-f1/tools/inspect/castBots.ts';
const [bot, setting, ...seeds] = process.argv.slice(2);
for (const s of seeds.map(Number)) {
  let st: any = null;
  const r: any = firstTimer('2-7', s, (CAST_BOTS as any)[bot][setting], { cap: 1200, dotSetting: true, onFrame: (sim: any) => { st ??= sim.stage; } });
  const beat = (x: number) => (st?.gen2?.sections ?? []).filter((q: any) => x >= q.x0 && x < q.x1).map((q: any) => String(q.template).replace('w2-27-', '')).join('/');
  const lives = r.harms.filter((h: any) => h.kind === 'life').map((h: any) => `${h.cause}@${Math.round(h.x)},${Math.round(h.y)} t${h.t.toFixed(1)} [${beat(h.x)}]`);
  console.log(`${bot} ${setting} seed ${s}: end ${r.end} t ${r.time} rescues ${r.rescues} at x ${JSON.stringify(r.rescueXs)} beats ${r.rescueXs.map(beat).join(',')}`);
  console.log(`  stuck: ${JSON.stringify(r.stuck.map((q: any) => ({ x: q.x, y: q.y, t: q.t, what: q.what, step: q.step, rescued: q.rescued })))}`);
  console.log(`  lives: ${lives.join('; ')}`);
}

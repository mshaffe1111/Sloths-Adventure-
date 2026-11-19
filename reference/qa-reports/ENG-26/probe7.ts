// ENG-26 probe: a tier bot's wheel crossing, summarized: from first on the jetty to first on the street (s), hops in the sweep, splashes,
// the run's end (relative imports, D83)
import { fixtureSeed, wheelRun, type WheelToy } from '../../../tools/inspect/wheelToys.ts';
import type { RealPlay } from '../../../src/game/realPlay.ts';
import { SKILLS } from '../../../tools/inspect/firsttimer.ts';
if (process.env.OFF) SKILLS.rideWheel = false;
export function crossing(row: WheelToy, tier: 'child' | 'middle' | 'expert', s: 'normal' | 'easy', v: number, seed = fixtureSeed(row)!) {
  let onJetty = -1, onStreet = -1, hops = 0, splash = 0, prev = '', prevY = 0;
  const r = wheelRun(row, tier, s, seed, v, {
    onFrame: (sim: RealPlay) => {
      if (onStreet >= 0) return;
      const w = sim.platforms.find((p) => p.wheel)?.wheel?.w;
      if (!w?.lay) return;
      const on = sim.standingOn;
      const where = on === w.lay.jetty ? 'jetty' : on === w.lay.streetId ? 'street' : sim.platforms.find((p) => p.id === on)?.wheel ? 'bucket' : on >= 0 ? 'other' : 'air';
      if (where === 'jetty' && onJetty < 0) onJetty = sim.t;
      if (onJetty >= 0 && where === 'street') onStreet = sim.t;
      if (onJetty >= 0 && prev === 'bucket' && where === 'air') hops++;
      if (onJetty >= 0 && where === 'jetty' && prev !== 'jetty' && prev !== '' && sim.p.y < prevY - 40) splash++;
      if (where !== 'air') prevY = sim.p.y;
      prev = where;
    },
  });
  return { end: r.end, lives: r.lives, cross: onStreet >= 0 && onJetty >= 0 ? +(onStreet - onJetty).toFixed(1) : null, hops, splash };
}
if (process.argv[1]?.endsWith('probe7.ts')) {
  const rows = (process.argv[2] ?? 'teach,edge,top,great').split(',') as WheelToy[];
  for (const row of rows) for (const tier of (process.argv[3] ?? 'child,middle,expert').split(',') as Array<'child'>) for (const s of ['normal', 'easy'] as const) {
    if (tier === 'expert' && s === 'easy') continue;
    const res = (process.argv[4] ?? '1,2,3').split(',').map(Number).map((v) => crossing(row, tier, s, v));
    console.log(`${row} ${tier} ${s}: ${res.map((x) => `${x.end}/${x.cross}s/h${x.hops}/sp${x.splash}/L${x.lives}`).join('  ')}`);
  }
}

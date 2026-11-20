// ENG-26 probe: tier bots over the wheel toys (relative imports, D83)
import { fixtureSeed, wheelRun, type WheelToy } from '../../../tools/inspect/wheelToys.ts';
const rows = (process.argv[2] ?? 'teach,edge,top').split(',') as WheelToy[];
const tiers = (process.argv[3] ?? 'child,middle,expert').split(',') as Array<'child'>;
for (const row of rows) {
  const seed = fixtureSeed(row)!;
  for (const tier of tiers) for (const s of ['normal', 'easy'] as const) for (const v of (process.argv[4] ?? '1').split(',').map(Number)) {
    const t0 = Date.now();
    const r = wheelRun(row, tier, s, seed, v, process.env.REAL ? { realInput: true } : {});
    console.log(`${row} seed ${seed} ${tier} ${s} v${v}: end ${r.end} t ${r.finishSeconds?.toFixed(1)} lives ${r.lives} putbacks ${r.putbacks} stuck ${JSON.stringify(r.stuck.slice(0, 2))} pieces ${JSON.stringify(r.pieces.map((p) => [p.id, p.lives, p.putbacks, Math.round(p.seconds)]))} (${Date.now() - t0} ms)`);
  }
}

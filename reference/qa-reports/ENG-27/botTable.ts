// ENG-27: the tier bots over the out-and-back toy (homeToys.ts homeRun), a small table: tier x setting x seed
import { homeRun } from '../../../tools/inspect/homeToys.ts';
const tiers = (process.argv[2] ?? 'middle,expert').split(',');
const settings = (process.argv[3] ?? 'normal,easy').split(',');
const seeds = (process.argv[4] ?? '1,2,3').split(',').map(Number);
for (const tier of tiers) for (const setting of settings) for (const seed of seeds) {
  try {
    const r = homeRun(tier as never, setting as never, seed);
    console.log([tier, setting, seed, r.end, r.finishSeconds, 'lives', r.lives, 'putbacks', r.putbacks, 'rescues', r.rescues].join(' '));
  } catch (e) { console.log(tier, setting, seed, 'THROW', String(e).slice(0, 160)); }
}

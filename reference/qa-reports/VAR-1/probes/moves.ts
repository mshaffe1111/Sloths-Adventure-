// VAR-1 probe: each World 1 stage's move strings (goal route, quick route), pairs and flags on a few layouts. Relative imports (D83).
import '../../../../src/game/headlessDom.ts';
import { world, W1 } from '../../../../tools/validate/evaluate.ts';
import { gatedFlags } from '../../../../tools/validate/funcheck.ts';
const layouts = (process.argv[2] ?? '1,2').split(',').map(Number);
const settings = (process.argv[3] ?? 'normal,easy').split(',') as ('normal' | 'easy')[];
const only = (process.argv[4] ?? '1-6,1-7,1-8').split(',');
for (const v of layouts) for (const s of settings) {
  for (const ev of world(v, s, W1)) {
    if (!only.includes(ev.id)) continue;
    console.log(`${ev.id} L${v} ${s} t=${ev.total}s pairs=${ev.pairs.join(',')} six=${ev.six.join(',')}`);
    console.log(`  str  ${ev.str}`);
    console.log(`  sdir ${ev.sdir}`);
    console.log(`  quick ${ev.quick}`);
    for (const f of gatedFlags(ev)) console.log(`  FLAG ${f.rule}: ${f.what}${f.x !== undefined ? ' @' + f.x : ''}`);
  }
}

// Every stage spec through checkSpec: what the engine would refuse to build, in plain words.
import { checkSpec } from '../../src/game/mixer/spec.ts';
import { IDEAS, IDEA_KINDS, PIECES } from '../../src/game/mixer/library.ts';
import { SPECS } from '../../src/game/mixer/stages.ts';
let bad = 0;
for (const s of SPECS) { const e = checkSpec(s, IDEAS, PIECES, IDEA_KINDS); bad += e.length; console.log(`${s.id} ${s.name}: ${e.length ? e.length + ' problem(s)' : 'OK'}`); for (const x of e) console.log('  - ' + x); }
process.exit(bad ? 1 : 0);

import { IDEAS, PIECES, IDEA_KINDS } from '../../../src/game/mixer/library.ts';
const ks = Object.keys(IDEAS);
console.log(`library.ts IDEAS: ${ks.length}`);
for (const k of ks) console.log(`  ${k}: ${JSON.stringify(IDEAS[k as keyof typeof IDEAS])}`);
console.log(`PIECES: ${Object.keys(PIECES).length}: ${Object.keys(PIECES).join(', ')}`);
console.log(`IDEA_KINDS: ${JSON.stringify(IDEA_KINDS)}`);

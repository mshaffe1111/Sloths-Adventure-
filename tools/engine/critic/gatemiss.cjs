// Critic's run (§6 run 12): library-check.ts's stage-id pattern against the mixer core it guards. Run from an engine-mixer checkout:
//   node tools/engine/critic/gatemiss.cjs
const fs = require('fs');
const src = fs.readFileSync('src/game/mixer/w1mix.ts', 'utf8');
const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
console.log('quoted stage ids the gate sees:', [...code.matchAll(/['`"](\d+-\d+)['`"]/g)].length);
for (const l of code.split('\n')) if (/\b\d+-\d+\b/.test(l) && /(throw|Error)/.test(l)) console.log('names a stage, passes the gate:', l.trim().slice(0, 110));
console.log('stage-named identifiers:', [...code.matchAll(/\b(SPEC_1[15]|buildMix1[15])\b/g)].length);

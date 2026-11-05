// The library check: every idea the mixer can lay is described in the library, every idea in a stage's plan is one the library knows,
// and checkSpec's words hold for the shipped plans. Fails on any gap, so the menu, the library and the mixer never drift apart.
import { IDEAS, IDEA_KINDS, PIECES } from '../../src/game/mixer/library.ts';
import { SPECS } from '../../src/game/mixer/stages.ts';
import fs from 'node:fs';
const src = fs.readFileSync(new URL('../../src/game/mixer/w1mix.ts', import.meta.url), 'utf8');
const typed = [...src.slice(src.indexOf('export type Idea ='), src.indexOf(';', src.indexOf('export type Idea ='))).replace(/\/\/.*$/gm, '').matchAll(/'([^']+)'/g)].map((m) => m[1]);
const err: string[] = [];
for (const name of typed) if (!IDEAS[name]) err.push(`the mixer lays "${name}" but the library does not describe it`);
for (const name of Object.keys(IDEAS)) { if (!IDEA_KINDS[name]) err.push(`"${name}" has no piece kinds listed`); for (const k of IDEA_KINDS[name] ?? []) if (!PIECES[k]) err.push(`"${name}" lays "${k}", which has no row in the element table`); }
for (const name of Object.keys(IDEAS)) if (!typed.includes(name)) err.push(`the library describes "${name}" but the mixer cannot lay it`);
for (const { id, nodes } of SPECS) for (const n of nodes) for (const d of Array.isArray(n.deck) ? n.deck : [...n.deck.high, ...n.deck.low]) if (!IDEAS[d]) err.push(`${id} ${n.job}: "${d}" is not in the library`);
// (nothing stage-specific in the mixer: a stage is its spec in stages.ts; a stage id in the mixer's code is a breach)
const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
for (const m of code.matchAll(/['`"](\d+-\d+)['`"]/g)) err.push(`the mixer names stage ${m[1]} in its code: that belongs in the stage's spec (stages.ts)`);
console.log(err.length ? err.join('\n') : `library check: ${typed.length} ideas, every one described; every stage's plan draws only from the library; the mixer names no stage`);
process.exit(err.length ? 1 : 0);

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
// (nothing stage-specific in the engine (the critic, CRITIC-SPEC §9b): a stage is its spec in stages.ts. Every file under
// src/game/mixer/ but the stage data itself is read with its comments taken out, and fails on a stage id in its code, a function named
// for a stage, or a branch on a stage's id; protoStage.ts may not branch on, or route by, the id of any stage that has a spec)
const strip = (t: string) => t.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`])\/\/.*$/gm, '$1');
const STAGE_ID = /\b(10|[1-9])-(10|[1-9]|M|D)\b/;
const dir = new URL('../../src/game/mixer/', import.meta.url);
// (the library's label files (library.ts, catalog.ts) cite the stage a move is taught in as label text: data, read by people; a stage id
// there is no behaviour. Their code is held to the same name and branch rules)
const LABELS = new Set(['library.ts', 'catalog.ts']);
for (const f of fs.readdirSync(dir).filter((n) => n.endsWith('.ts') && !n.endsWith('.test.ts') && n !== 'stages.ts')) {
  const code = strip(fs.readFileSync(new URL(f, dir), 'utf8'));
  code.split('\n').forEach((line, i) => {
    if (!LABELS.has(f)) for (const m of line.matchAll(/(['"`])((?:(?!\1).)*)\1/g)) if (STAGE_ID.test(m[2])) err.push(`mixer/${f}:${i + 1}: names stage ${m[2].match(STAGE_ID)![0]} in its code ("${m[2].slice(0, 60)}"): that belongs in the stage's spec`);
    if (/function\s+\w*?(1[0-9]|\d_\d)\s*\(|\b(const|let)\s+\w*?(1[0-9]|\d_\d)\s*=/.test(line) && !/\b(rng|RNG)\b/.test(line)) err.push(`mixer/${f}:${i + 1}: a name for a stage (${line.trim().slice(0, 70)})`);
    if (/\b(S|spec|stage)\.id\s*[!=]==/.test(line)) err.push(`mixer/${f}:${i + 1}: a branch on the stage's id (${line.trim().slice(0, 70)})`);
  });
}
const proto = strip(fs.readFileSync(new URL('../../src/game/protoStage.ts', import.meta.url), 'utf8'));
for (const { id } of SPECS) proto.split('\n').forEach((line, i) => {
  // (its stage list and registry may name it; a comparison or a case on its id is a branch for one stage)
  const q = `['"]${id}['"]`;
  if (new RegExp(`(===|!==)\\s*${q}|${q}\\s*(===|!==)|case\\s*${q}|\\.(includes|has)\\(\\s*${q}`).test(line)) err.push(`protoStage.ts:${i + 1}: branches on ${id}, a stage built from its spec: route and post-process it only through its spec (${line.trim().slice(0, 70)})`);
});
console.log(err.length ? err.join('\n') : `library check: ${typed.length} ideas, every one described; every stage's plan draws only from the library; no mixer file names a stage, and protoStage routes a spec's stage only by its spec`);
process.exit(err.length ? 1 : 0);

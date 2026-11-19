// R-165.292 gate: no block whose style has a painter draws through code terrain because of its size (tools/engine/paintFall.ts).
// Every stage, both settings: a stage with a proven seed list is built on EVERY listed seed (the seeds Play draws), every other stage on
// layouts 1..--layouts (16, lockall's). The paint state is set as engine.ts sets it for a stage (kit world, ground look, bough joins,
// paint on unless the kit is off), with every art sheet loaded: the game's picture once its sheets are in (a stand-in while a sheet loads
// is not what this gate judges).
//   npx tsx tools/engine/paintcheck.ts                          sweep; exit 1 on any breach
//   npx tsx tools/engine/paintcheck.ts --stages 1-7,5-1 --layouts 4 --unpainted --known   a few stages; list the unpainted and known
//   npx tsx tools/engine/paintcheck.ts --part 0/3                one of three shares (CI)
// Breaches there the day the gate started are on paintcheck.known.json (shrink-only, law 5; R-165.292's owner: the lead).
// Prints every breach: stage, setting, seed, x, style, size, what it draws as and the heights its painter draws.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import '../../src/game/headlessDom.ts';

// (every sheet "arrives" the moment it is asked for: the painters decide as they do once the art is in. Set before the game loads.)
(globalThis as Record<string, unknown>).Image = class {
  onload: null | (() => void) = null;
  onerror: null | (() => void) = null;
  width = 1; height = 1; naturalWidth = 1; naturalHeight = 1; complete = true;
  set src(_u: string) { this.onload?.(); }
  // (decoded at once, not on a later tick: the sweep builds and judges in one synchronous pass)
  decode() { return { then: (ok: () => void) => ok() }; }
};

const { generateAllLevels } = await import('../../src/game/worldsData.ts');
const { generateStage, setLayoutVariant } = await import('../../src/game/stageGenerator.ts');
const { easyStage } = await import('../../src/game/easyMode.ts');
const { withGoals } = await import('../../src/game/goals.ts');
const { loadSeedList, provenSeeds } = await import('../../src/game/gen2/seedList.ts');
const { PROVEN_INDEX } = await import('../../src/game/gen2/provenIndex.ts');
const { stagePaintInput } = await import('./paintStage.ts');
const { paintFalls } = await import('./paintFall.ts');

const arg = (k: string) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : undefined; };
const N = Number(arg('--layouts') ?? 16);
const only = arg('--stages')?.split(',');
const showUnpainted = process.argv.includes('--unpainted');
// (--part i/n: the i-th of n shares of the stages, for CI's parallel steps; a stage is in share (its index mod n))
const [partI, partN] = (arg('--part') ?? '0/1').split('/').map(Number);
const all = generateAllLevels().filter((c) => !c.secret && (!only || only.includes(c.id)));
const levels = all.filter((_, i) => i % partN === partI);
const listed = new Set(Object.keys(PROVEN_INDEX));
// the breaches already there the day the gate started (law 5): shrink-only. One id per stage, style, height and code look; a breach not
// on it fails; on a sweep of a part on the full 16 layouts (no --stages), an id of that part's stages no build shows any more fails too (fixed: take it off)
const KNOWN_FILE = path.join(path.dirname(fileURLToPath(import.meta.url)), 'paintcheck.known.json');
const knownJson = JSON.parse(fs.readFileSync(KNOWN_FILE, 'utf8')) as { known: string[] };
const known = new Set(knownJson.known);
// (a sweep of its part's stages on the full 16 layouts judges the list for those stages: an id no build of them shows any more is stale)
const whole = !only && N === 16;
const mine = new Set(levels.map((c) => c.id));
const idOf = (stage: string, b: { style: string; h: number; drawn: string }) => `${stage}|${b.style}|h${b.h}|${b.drawn}`;

let builds = 0;
const newLines: string[] = [];
const seen = new Map<string, string>();
const byStage = new Map<string, { builds: number; hit: number; ids: Set<string> }>();
const unpaintedSeen = new Map<string, string>();
const cache = new Map<string, Map<string, number[]>>();
for (const c of levels) {
  const hasList = listed.has(c.id) && (await loadSeedList(c.id));
  const seeds = hasList ? provenSeeds(c.id) : [];
  // (a listed stage's Play: layout n draws the list's (n mod length)-th seed, seedList.ts provenSeedFor; so 0..length-1 is every seed)
  const runs = hasList ? seeds.map((s, i) => ({ v: i, seed: s })) : Array.from({ length: N }, (_, i) => ({ v: i + 1, seed: i + 1 }));
  const row = { builds: 0, hit: 0, ids: new Set<string>() };
  byStage.set(c.id, row);
  for (const setting of ['normal', 'easy'] as const) for (const { v, seed: asked } of runs) {
    setLayoutVariant(v);
    let st: ReturnType<typeof generateStage>;
    try { st = setting === 'easy' ? easyStage(withGoals(generateStage({ ...c, unlocked: true }, 'easy'))) : withGoals(generateStage({ ...c, unlocked: true }, 'normal')); }
    catch (e) { newLines.push(`${c.id} ${setting} seed ${asked}: BUILD FAILED ${(e as Error).message.slice(0, 100)}`); setLayoutVariant(null); continue; }
    setLayoutVariant(null);
    // (labelled by what the game BUILT, D62: the gen2 seed the stage carries, else the layout asked for)
    const g2 = st as { gen2?: { seed?: number }; proto?: { gen2?: { seed?: number } } };
    const seed = (g2.gen2 ?? g2.proto?.gen2)?.seed ?? `layout ${asked}`;
    builds++; row.builds++;
    const inp = stagePaintInput(st, c);
    if (!inp) continue;
    const ck = `${c.worldIndex}|${inp.key}`;
    if (!cache.has(ck)) cache.set(ck, new Map());
    const r = paintFalls(st.platforms, inp.f, cache.get(ck)!);
    if (r.breaches.length) row.hit++;
    for (const b of r.breaches) {
      const id = idOf(c.id, b);
      row.ids.add(id);
      const line = `${c.id} ${setting} seed ${seed} x ${b.x}: '${b.style}' ${b.type} ${b.w}x${b.h} draws as code '${b.drawn}'; its painter draws h ${b.painter} (nearest ${b.nearest})`;
      if (!seen.has(id)) seen.set(id, line);
      if (!known.has(id)) newLines.push(line);
    }
    for (const u of r.unpainted) unpaintedSeen.set(`${c.id} '${u.style}' h${u.h} -> ${u.drawn}`, `${setting} seed ${seed} x ${u.x}`);
  }
  process.stderr.write(`${c.id} `);
}
process.stderr.write('\n');
if (process.argv.includes('--write-known')) {
  // (writes this run's ids for its stages, keeping the other stages' ids: a list is seeded once, the day the gate starts, then only shrinks)
  const keep = knownJson.known.filter((k) => !mine.has(k.split('|')[0]));
  fs.writeFileSync(KNOWN_FILE, JSON.stringify({ ...knownJson, known: [...new Set([...keep, ...seen.keys()])].sort() }, null, 1) + '\n');
  console.log(`paintcheck: wrote ${seen.size} known ids`);
  process.exit(0);
}
console.log(`paintcheck: ${builds} builds of ${levels.length} stages${partN > 1 ? ` (part ${partI}/${partN})` : ''} (listed stages on every listed seed, the rest on layouts 1-${N}), both settings`);
for (const [id, r] of byStage) if (r.hit) console.log(`  ${id}: ${r.hit}/${r.builds} builds breach (${[...r.ids].filter((k) => known.has(k)).length} known ids, ${[...r.ids].filter((k) => !known.has(k)).length} new)`);
const stale = whole ? [...known].filter((k) => mine.has(k.split('|')[0]) && !seen.has(k)) : [];
if (showUnpainted) {
  console.log(`\nunpainted (no painter at any height in that stage: not a breach, missing art for Content): ${unpaintedSeen.size}`);
  for (const [k, at] of unpaintedSeen) console.log(`  ${k} (first: ${at})`);
}
if (process.argv.includes('--known')) for (const [id, l] of seen) if (known.has(id)) console.log(`  known: ${l}`);
for (const l of newLines) console.log(`NEW: ${l}`);
for (const k of stale) console.log(`FIXED, still listed (take it off ${path.basename(KNOWN_FILE)}): ${k}`);
const bad = newLines.length + stale.length;
console.log(bad ? `paintcheck: FAIL, ${newLines.length} new breach lines, ${stale.length} fixed ids still listed` : `paintcheck: PASS, no new painted style falls through to code terrain (${[...seen.keys()].filter((k) => known.has(k)).length} known ids seen, R-165.292)`);
process.exit(bad ? 1 : 0);

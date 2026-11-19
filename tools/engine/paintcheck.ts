// R-165.292 gate: no block whose style has a painter draws through code terrain because of its size (tools/engine/paintFall.ts).
// Every stage, both settings: a stage with a proven seed list is built on EVERY listed seed (the seeds Play draws), every other stage on
// layouts 1..--layouts (16, lockall's). The paint state is set as engine.ts sets it for a stage (kit world, ground look, bough joins,
// paint on unless the kit is off), with every art sheet loaded: the game's picture once its sheets are in (a stand-in while a sheet loads
// is not what this gate judges).
//   npx tsx tools/engine/paintcheck.ts                          sweep; exit 1 on any breach
//   npx tsx tools/engine/paintcheck.ts --stages 1-7,5-1 --layouts 4 --unpainted
// Prints every breach: stage, setting, seed, x, style, size, what it draws as and the heights its painter draws.
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
const levels = generateAllLevels().filter((c) => !c.secret && (!only || only.includes(c.id)));
const listed = new Set(Object.keys(PROVEN_INDEX));

let builds = 0;
const breachLines: string[] = [];
const byStage = new Map<string, { builds: number; hit: number; keys: Set<string> }>();
const unpaintedSeen = new Map<string, string>();
const cache = new Map<string, Map<string, number[]>>();
for (const c of levels) {
  const hasList = listed.has(c.id) && (await loadSeedList(c.id));
  const seeds = hasList ? provenSeeds(c.id) : [];
  // (a listed stage's Play: layout n draws the list's (n mod length)-th seed, seedList.ts provenSeedFor; so 0..length-1 is every seed)
  const runs = hasList ? seeds.map((s, i) => ({ v: i, seed: s })) : Array.from({ length: N }, (_, i) => ({ v: i + 1, seed: i + 1 }));
  const row = { builds: 0, hit: 0, keys: new Set<string>() };
  byStage.set(c.id, row);
  for (const setting of ['normal', 'easy'] as const) for (const { v, seed } of runs) {
    setLayoutVariant(v);
    let st: ReturnType<typeof generateStage>;
    try { st = setting === 'easy' ? easyStage(withGoals(generateStage({ ...c, unlocked: true }, 'easy'))) : withGoals(generateStage({ ...c, unlocked: true }, 'normal')); }
    catch (e) { breachLines.push(`${c.id} ${setting} seed ${seed}: BUILD FAILED ${(e as Error).message.slice(0, 100)}`); setLayoutVariant(null); continue; }
    setLayoutVariant(null);
    builds++; row.builds++;
    const inp = stagePaintInput(st, c);
    if (!inp) continue;
    const ck = `${c.worldIndex}|${inp.key}`;
    if (!cache.has(ck)) cache.set(ck, new Map());
    const r = paintFalls(st.platforms, inp.f, cache.get(ck)!);
    if (r.breaches.length) row.hit++;
    for (const b of r.breaches) {
      row.keys.add(`${b.style} h${b.h} -> ${b.drawn}`);
      breachLines.push(`${c.id} ${setting} seed ${seed} x ${b.x}: '${b.style}' ${b.type} ${b.w}x${b.h} draws as code '${b.drawn}'; its painter draws h ${b.painter} (nearest ${b.nearest})`);
    }
    for (const u of r.unpainted) unpaintedSeen.set(`${c.id} '${u.style}' h${u.h} -> ${u.drawn}`, `${setting} seed ${seed} x ${u.x}`);
  }
  process.stderr.write(`${c.id} `);
}
process.stderr.write('\n');
for (const l of breachLines) console.log(l);
console.log(`\npaintcheck: ${builds} builds of ${levels.length} stages (listed stages on every listed seed, the rest on layouts 1-${N}), both settings`);
for (const [id, r] of byStage) if (r.hit) console.log(`  ${id}: ${r.hit}/${r.builds} builds breach: ${[...r.keys].join('; ')}`);
if (showUnpainted) {
  console.log(`\nunpainted (no painter at any height in that stage: not a breach, missing art for Content): ${unpaintedSeen.size}`);
  for (const [k, at] of unpaintedSeen) console.log(`  ${k} (first: ${at})`);
}
const bad = breachLines.length;
console.log(bad ? `paintcheck: FAIL, ${bad} breach lines` : 'paintcheck: PASS, no painted style falls through to code terrain');
process.exit(bad ? 1 : 0);

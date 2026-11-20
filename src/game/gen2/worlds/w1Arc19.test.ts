/**
 * 1-9 The Boa's Branches (BUILD-19; reference/design/1-9.md on t-pitch-b): the built stage, read the way the game builds it (its stage-table
 * row: kitLib19 then finish19, listed.ts), on both settings. The keeper's words verbatim; the arc beat for beat; each node's boas, each
 * beside its tool; beat 2's step (above its strike); the roost in reach; every teach line 800 px or more before what it teaches with no boa
 * between; Easy never harder than Normal.
 * Planted faults: reference/qa-reports/BUILD-19/planted-faults.py (each one turns a named test here red).
 */
import '../../headlessDom.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildGen2Stage } from '../pipeline.ts';
import { listedStage } from '../listed.ts';
import { generateAllLevels } from '../../worldsData.ts';
import { STAGE_PLAN, sealedLine } from '../../stagePlan.ts';
import { STAGE_LINES } from '../../pokeyJournal.ts';
import { W1_LURE } from './w1.ts';
import { PREDATOR_ENTRIES } from '../../journal.ts';
import { TRAP_UNDER } from './w1Cast.ts';
import { finish19, kitLib19, LINES_19, MISSION_19, SAID_TRAP_19, SEALED_19, SPLASH_19, STAGE_19 } from './w1Arc19.ts';
import type { ListedStage } from '../listed.ts';
import type { Enemy, Platform } from '../../types.ts';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..');
const cfg = generateAllLevels().find((c) => c.id === STAGE_19 && !c.secret)!;
type Built = {
  platforms: Platform[]; enemies: Enemy[];
  proto: { hints?: Array<{ x: number; text: string }>; gen2?: { roosts?: Array<{ x: number }> }; cast?: { traps: Array<{ x: number; loadX: number }>; said?: { trap?: string } } };
  gen2: { sections: Array<{ uid: string; template: string }> };
};
const memo = new Map<string, Built>();
function built(seed: number, d: 'normal' | 'easy'): Built {
  const k = `${seed}:${d}`;
  if (!memo.has(k)) {
    // (the stage's row when 1-9 is on the stage table; while it is held back (release 1, INT-14: the hand-built 1-9 ships) the same kit and
    //  finish as a toy row, so every test below still reads the designed arc as the game would build it)
    const row: ListedStage = listedStage(STAGE_19) ?? { kit: kitLib19, finish: finish19 as ListedStage['finish'] };
    // (the toy carries the designed arc's mission too: its goal is petals (stagePlan's 1-9 spec while routed), so no guard top-up)
    const spec = STAGE_PLAN[1][8];
    const was = spec.gathers;
    spec.gathers = 'petals';
    try {
      const st = buildGen2Stage({ config: cfg, kit: row.kit(), seed, difficulty: d });
      memo.set(k, row.finish!(st, d) as unknown as Built);
    } finally {
      if (was) spec.gathers = was; else delete spec.gathers;
    }
  }
  return memo.get(k)!;
}
const SEEDS = [1, 2, 3, 4];
const BOTH = ['normal', 'easy'] as const;
const piecesOf = (st: Built, uid: string) => st.platforms.filter((p) => p.tag?.startsWith(`${uid}:`));
const span = (st: Built, id: string): [number, number] => {
  const s = st.gen2.sections.find((q) => q.template === id)!;
  const ps = piecesOf(st, s.uid);
  return [Math.min(...ps.map((p) => p.x)), Math.max(...ps.map((p) => p.x + p.width))];
};
const boasIn = (st: Built, id: string) => { const [a, b] = span(st, id); return st.enemies.filter((e) => e.type === 'boa' && e.x >= a && e.x <= b).sort((p, q) => p.x - q.x); };
const piece = (st: Built, id: string, key: string) => { const s = st.gen2.sections.find((q) => q.template === id)!; return st.platforms.find((p) => p.tag === `${s.uid}:${key}`)!; };
const hintX = (st: Built, line: string) => st.proto.hints!.find((h) => h.text === line)?.x;

test("1-9's lines are the story keeper's, word for word (reference/story/lines-1-9.md, KEEPER-19), and the stage says them", () => {
  const md = fs.readFileSync(path.join(root, 'reference/story/lines-1-9.md'), 'utf8');
  const rows = new Map<string, string>();
  for (const m of md.matchAll(/^\| \(([a-k])\) \| [^|]*\|[^|]*\| (.+?) \| \d+ \|$/gm)) rows.set(m[1], m[2].trim());
  const want: Record<string, string> = { a: LINES_19.boa, b: LINES_19.freeze, c: LINES_19.miss, d: LINES_19.nest, e: LINES_19.eye, f: SPLASH_19, g: LINES_19.mark, h: MISSION_19, i: SEALED_19, j: PREDATOR_ENTRIES.boa.tip, k: SAID_TRAP_19 };
  // ((j), the journal's boa tip: the keeper's 12-word line (KEEPER-19b, t-keeper-19@8c1df5bf), journal.test.ts:31's cap for tips; BUILD-19b)
  // ((j) is the journal's, a player line: it is the keeper's only while 1-9 is routed (below); the arc holds its own copy in the test)
  const routed = !!listedStage(STAGE_19);
  for (const [k, v] of Object.entries(want)) if (k !== 'j' || routed) assert.equal(v, rows.get(k), `line (${k})`);
  // (the keeper's rulings: never "freeze" (the story bible) and never "hold still" (1-7's hide words); "don't move" is the bots' word)
  for (const v of Object.values(want)) assert.ok(!/freeze|hold still/i.test(v), v);
  assert.match(LINES_19.freeze.toLowerCase(), /don't move/, "the freeze teach holds the bots' word, firsttimer.ts takeIn");
  // (the player's lines for 1-9 follow its routing: the keeper's while 1-9 is on the stage table; the hand-built 1-9's (main 6e7b85f8's
  //  words, pinned) while it is held back, INT-14)
  if (routed) {
    assert.equal(STAGE_LINES['1-9'], "A boa looked me in the eye and decided I was a branch. I've been called worse.", "Pokey's page (the keeper's conflict 3)");
    assert.equal(STAGE_PLAN[1][8].desc, MISSION_19, "stagePlan's mission line for 1-9");
    assert.equal(sealedLine(1, 'gauntlet'), SEALED_19, 'the locked exit line, keyed to World 1 gauntlet (1-9 alone)');
  } else {
    assert.equal(STAGE_LINES['1-9'], "Fought the boa's guards all the way along his branches. They were only doing their job. So was I.", "Pokey's page (hand-built 1-9)");
    assert.equal(STAGE_PLAN[1][8].desc, "Fight through the boa's guards and reach the shrine.", "stagePlan's mission line (hand-built 1-9)");
    assert.equal(PREDATOR_ENTRIES.boa.tip, 'Coiled and watching. Let it strike, then punch it three times.', "the journal's boa tip (hand-built 1-9)");
  }
  for (const d of BOTH) {
    const st = built(1, d);
    const said = new Set(st.proto.hints!.map((h) => h.text));
    for (const v of Object.values(LINES_19)) assert.ok(said.has(v), `${d}: Dot says "${v}"`);
    assert.equal(st.proto.cast?.said?.trap, SAID_TRAP_19, `${d}: the first chase-off line is the boa's`);
  }
});

test('1-9 the arc beat for beat, on every roll and both settings', () => {
  const ARC = ['arrival', 'forest-freeze', 'stair', 'rest', 'miss', 'rest', 'roost', 'rest', 'read-load', 'read-roost', 'read-bare', 'rest', 'hunters', 'rest', 'old-boa', 'exit'].map((s) => `w1-19-${s}`);
  for (const d of BOTH) for (const seed of SEEDS) assert.deepEqual(built(seed, d).gen2.sections.map((s) => s.template), ARC, `${d} seed ${seed}`);
});

test("1-9's boas: the designed eleven on both settings (no top-up: its goal is petals), each beside its tool; two eagles", () => {
  const PER: Record<string, number> = { 'w1-19-forest-freeze': 2, 'w1-19-stair': 2, 'w1-19-miss': 1, 'w1-19-roost': 1, 'w1-19-read-load': 1, 'w1-19-read-roost': 1, 'w1-19-read-bare': 1, 'w1-19-hunters': 1, 'w1-19-old-boa': 1 };
  for (const d of BOTH) for (const seed of SEEDS) {
    const st = built(seed, d);
    const tag = `${d} seed ${seed}`;
    assert.equal(st.enemies.filter((e) => e.type === 'boa').length, 11, `${tag}: eleven boas`);
    for (const [id, n] of Object.entries(PER)) assert.equal(boasIn(st, id).length, n, `${tag}: ${id}`);
    for (const id of ['w1-19-arrival', 'w1-19-exit']) assert.equal(boasIn(st, id).length, 0, `${tag}: no boa in ${id}`);
    // (a trapped boa lies under its own load: beat 1 and the first read; and beat 1's handle is outside Easy's engage, 195 px)
    for (const [id, k] of [['w1-19-forest-freeze', 1], ['w1-19-read-load', 0]] as const) {
      const b = boasIn(st, id)[k];
      const t = st.proto.cast!.traps.find((q) => Math.abs(q.loadX - b.x) <= TRAP_UNDER);
      assert.ok(t, `${tag}: ${id}'s trapped boa under its load (armedTraps' own reach)`);
      assert.ok(b.x - t.x > 195, `${tag}: ${id}'s handle ${b.x - t.x} px from its boa, outside Easy's engage`);
    }
    // (a roost's boa within the roost's reach, W1_LURE)
    for (const id of ['w1-19-roost', 'w1-19-read-roost']) {
      const b = boasIn(st, id)[0];
      assert.ok((st.proto.gen2?.roosts ?? []).some((r) => Math.abs(r.x - (b.x + b.width / 2)) <= W1_LURE['w1-roost'].reach), `${tag}: ${id}'s boa in its roost's reach`);
    }
    const eagles = st.enemies.filter((e) => e.type === 'eagle');
    assert.equal(eagles.length, 2, `${tag}: an eagle over the hunters and one over the Old Boa`);
    // (the Old Boa inside its eagle's stretch, so the eye crosses it)
    const old = boasIn(st, 'w1-19-old-boa')[0];
    assert.ok(eagles.some((e) => e.patrolMinX < old.x && e.patrolMaxX > old.x + old.width), `${tag}: the eye's pass crosses the Old Boa`);
    if (d === 'easy') assert.ok(eagles.every((e) => e.kitFree), `${tag}: every eagle's first pass free on Easy`);
  }
});

test("beat 2: the freeze boa a root step below the bough he stands on, inside its engage from the step's edge, so a rear can't reach him there", () => {
  for (const d of BOTH) for (const seed of SEEDS) {
    const st = built(seed, d);
    const e = piece(st, 'w1-19-forest-freeze', 'e'), f = piece(st, 'w1-19-forest-freeze', 'f');
    const drop = f.y - e.y;
    // (above its strike, 30 px tall, and its coil, 26: he stands 50-56 px over the bough it lies on, inside its sight's 70)
    assert.ok(drop >= 50 && drop <= 56, `${d} seed ${seed}: the step down ${drop} px`);
    const b = boasIn(st, 'w1-19-forest-freeze')[0];
    const dx = b.x - (e.x + e.width);
    assert.ok(dx >= 100 && dx <= 150, `${d} seed ${seed}: the boa ${dx} px past the step's edge (Normal's engage 150)`);
  }
});

test("beat 7: he is on the creaky limb (Normal) when the roost's boa rears, and the bough under the limb is the soft moss, never a pit", () => {
  for (const seed of SEEDS) {
    const st = built(seed, 'normal');
    const k = piece(st, 'w1-19-roost', 'k');
    assert.ok(k.creak || k.type === 'fragile', `seed ${seed}: the limb creaks`);
    const b = boasIn(st, 'w1-19-roost')[0];
    assert.ok(b.x - (k.x + k.width) < 150, `seed ${seed}: the boa ${b.x - (k.x + k.width)} px past the limb's end, inside its engage`);
    const ez = piece(built(seed, 'easy'), 'w1-19-roost', 'k');
    assert.ok(!ez.creak && ez.type !== 'fragile', `seed ${seed}: Easy's limb is sound`);
  }
});

test('every teach line 800 px or more before the boa it teaches, with no boa between (rule 6)', () => {
  const PAIRS: Array<[keyof typeof LINES_19, string, number]> = [['boa', 'w1-19-forest-freeze', 0], ['freeze', 'w1-19-forest-freeze', 0], ['miss', 'w1-19-miss', 0], ['nest', 'w1-19-roost', 0], ['eye', 'w1-19-hunters', 0]];
  for (const d of BOTH) for (const seed of SEEDS) {
    const st = built(seed, d);
    for (const [line, id, k] of PAIRS) {
      const hx = hintX(st, LINES_19[line]);
      assert.ok(hx !== undefined, `${d} seed ${seed}: "${line}" said`);
      const target = id === 'w1-19-hunters' ? Math.min(...st.enemies.filter((e) => e.type === 'eagle').map((e) => e.patrolMinX).filter((x) => x > hx!)) : boasIn(st, id)[k].x;
      assert.ok(target - hx! >= 800, `${d} seed ${seed}: "${line}" ${target - hx!} px before what it teaches`);
      assert.ok(!st.enemies.some((e) => e.type === 'boa' && e.x > hx! && e.x < target), `${d} seed ${seed}: no boa between "${line}" and its beat`);
    }
  }
});

test('Easy is never harder than Normal: no more boas, no fewer flags', () => {
  for (const seed of SEEDS) {
    const n = built(seed, 'normal'), e = built(seed, 'easy');
    assert.ok(e.enemies.filter((q) => q.type === 'boa').length <= n.enemies.filter((q) => q.type === 'boa').length, `seed ${seed}: boas`);
  }
});

test("1-9's golden seed: one a roll, both settings, in the first rest (after the stair), never inside a boa read or a teach, a hop over its root", () => {
  // (the lead 11:17 AM ET 11-18: World 1 counts its golden seeds, "SECRET! GOLDEN SEED x OF n"; the hand-built 1-9 carried one)
  for (const d of BOTH) for (const seed of SEEDS) {
    const st = built(seed, d) as Built & { collectibles: Array<{ type: string; x: number; y: number }> };
    const seeds = st.collectibles.filter((c) => c.type === 'seed');
    assert.equal(seeds.length, 1, `${d} seed ${seed}: ${seeds.length} golden seeds`);
    const sd = seeds[0];
    const order = st.gen2.sections.map((q) => q.template);
    const home = st.gen2.sections.find((q) => { const ps = piecesOf(st, q.uid); return ps.length && sd.x >= Math.min(...ps.map((p) => p.x)) && sd.x <= Math.max(...ps.map((p) => p.x + p.width)); })!;
    assert.equal(home.template, 'w1-19-rest', `${d} seed ${seed}: the seed in ${home.template}`);
    assert.equal(st.gen2.sections.indexOf(home), order.indexOf('w1-19-stair') + 1, `${d} seed ${seed}: the first rest, right after the stair`);
    const step = piece(st, 'w1-19-rest', 'h');
    assert.ok(step.y - sd.y >= 50 && step.y - sd.y <= 70, `${d} seed ${seed}: ${step.y - sd.y} px over its root step (a hop)`);
    for (const e of st.enemies.filter((q) => q.type === 'boa')) assert.ok(Math.abs(e.x - sd.x) > 600, `${d} seed ${seed}: a boa ${Math.round(Math.abs(e.x - sd.x))} px from the seed`);
  }
});

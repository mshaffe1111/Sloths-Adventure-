/**
 * 2-4 Never Touch the Bank (BUILD-24; reference/design/2-4.md on t-design-24@ce813ffc, the lead's rulings in DESIGN-24-25's REPORT and
 * his GO 3:12 PM ET 11-18): the built stage, read the way the game builds it (its stage-table row, kit 'w2-24', then World 2's finish), on
 * both settings. The keeper's words verbatim; the arc beat for beat; the rivers by the beat (splash-back where the design is soft, deep on
 * Normal at beats 6 and 8 only, every Easy river the splash-back kind and never harder than Normal's); the lianas over each river, the
 * log-caught ones out of every bank's reach and past the engine's chain distance (the log is not skipped); each teach line 800+ px
 * before what it teaches with nothing deep between; the first deep river (beat 6) warned in the keeper's words; Pokey's `view` after the
 * great swing, never over it. Each test names the fault that turns it red (reference/qa-reports/BUILD-24/planted-faults.py).
 */
import '../../headlessDom.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildGen2Stage, dropsOf } from '../pipeline.ts';
import { listedStage, worldFinish } from '../listed.ts';
import { riverFaults, riverWidth } from '../riverLay.ts';
import { generateAllLevels } from '../../worldsData.ts';
import { lianaCaught } from '../../levelCheck.ts';
import { CHAIN } from '../../physics.ts';
import { lianasOver, type RiverZone } from '../../river.ts';
import { STAGE_TABLE } from './stageTable.ts';
import { W2_TIPS } from './w2.ts';
import { ARC_24, BRIEF_24, LINES_24, MISSION_24, RIVERS_24, STAGE_24, TEACH_24, kitLib24 } from './w2Arc24.ts';
import type { Platform, Vine } from '../../types.ts';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..');
const cfg = generateAllLevels().find((c) => c.id === STAGE_24 && !c.secret)!;
type Built = {
  platforms: Platform[]; rivers?: RiverZone[]; vines: Vine[]; proto: { hints?: Array<{ x: number; text: string }> };
  gen2: { errors?: string[]; sections: Array<{ template: string; x0: number; x1: number }> };
};
const memo = new Map<string, Built>();
/** the stage as the game builds it: its listed kit, then World 2's finish */
function built(seed: number, d: 'normal' | 'easy'): Built {
  const k = `${seed}:${d}`;
  if (!memo.has(k)) {
    const row = listedStage(STAGE_24)!;
    const st = buildGen2Stage({ config: cfg, kit: row.kit(), seed, difficulty: d });
    memo.set(k, worldFinish(row)(st as never, false, d) as unknown as Built);
  }
  return memo.get(k)!;
}
const SEEDS = [1, 4, 5];
const BOTH = ['normal', 'easy'] as const;
const hintX = (st: Built, line: string) => st.proto.hints?.find((h) => h.text === line)?.x;
/** the log rivers (a current), in order */
const logRivers = (st: Built) => (st.rivers ?? []).filter((r) => r.speed > 0).sort((a, b) => a.x0 - b.x0);
/** the beats' log rivers, in order: beat 1, beat 3 (two), beat 4, beat 6, beat 8 (three: its third leg, the lead's ruling (B) 11-18), beat 9 */
const RIVER_BEAT = [1, 3, 3, 4, 6, 8, 8, 8, 9];

test("2-4's lines are the story keeper's, word for word (reference/story/lines-2-4.md, KEEPER-24 t-keeper-24@fa3b0930), and the stage says them", () => {
  const md = fs.readFileSync(path.join(root, 'reference/story/lines-2-4.md'), 'utf8');
  const rows = new Map<string, string>();
  for (const m of md.matchAll(/^\| \d+ \| `([a-z]+)` \|[^|]*\| (.+?) \| \d+ \|$/gm)) rows.set(m[1], m[2].trim());
  for (const [k, v] of Object.entries(LINES_24)) assert.equal(v, rows.get(k), `line ${k}`);
  assert.equal(MISSION_24, rows.get('mission'), 'the stage card');
  assert.equal(W2_TIPS.water, rows.get('deep'), "World 2's water warning is the keeper's `deep`");
  // (the card the game shows: stagePlan.ts's 2-4 row, held to the keeper's words; the old 2-4 hints are gone, new replaces old)
  assert.ok(fs.readFileSync(path.join(root, 'src/game/stagePlan.ts'), 'utf8').includes(`S('vine_runner', 'Over the Water', '${MISSION_24}')`), 'stagePlan.ts says MISSION_24');
  assert.equal(cfg.objectiveType, 'vine_runner', 'a vine_runner: its exit never locks (the keeper: no sealed line)');
  assert.ok(!/"hint\.2-4\./.test(fs.readFileSync(path.join(root, 'src/game/dotLinesData.ts'), 'utf8')), "the hand-built 2-4's hints are gone");
  // (the keeper's rows 8-9, t-keeper-24@18e452c3: Pokey's journal page and the Stage Cleared clue, both rewritten for a stage with no cast)
  assert.ok(fs.readFileSync(path.join(root, 'src/game/pokeyJournal.ts'), 'utf8').includes(`'2-4': "${rows.get('page')}",`), "pokeyJournal.ts '2-4' is the keeper's page");
  assert.ok(fs.readFileSync(path.join(root, 'src/components/stageClue.ts'), 'utf8').includes(`'2-4': C('Dry Bootprints', '${rows.get('clue')}'),`), "stageClue.ts '2-4' is the keeper's clue");
  for (const d of BOTH) {
    const said = new Set(built(1, d).proto.hints!.map((h) => h.text));
    for (const v of Object.values(LINES_24)) assert.ok(said.has(v), `${d}: "${v}" is said`);
  }
});

test('the row: 2-4 rolls from its own kit (World 2 with 2-4 rows), CLEAN on both settings, the arc beat for beat, only its own bricks', () => {
  assert.equal(STAGE_TABLE[STAGE_24].kit, 'w2-24');
  assert.equal(kitLib24().manifest.world, 2);
  const beats = ['edge', 'first-drop', 'bank', 'drop-ride-drop', 'up-from-log', 'rest', 'root-planks', 'no-land', 'rest', 'kapok', 'long-relay', 'rest', 'great-swing', 'jetty'];
  assert.equal(Object.values(ARC_24)[0].split(' ').length, beats.length);
  for (const seed of SEEDS) for (const d of BOTH) {
    const st = built(seed, d);
    assert.deepEqual(st.gen2.errors ?? [], [], `${seed} ${d}`);
    assert.deepEqual(st.gen2.sections.map((s) => s.template.replace('w2-24-', '')), beats, `${seed} ${d}`);
  }
  assert.equal(BRIEF_24.petals, 'few', "the keeper's 2-1 ruling: Meeca's petals are few in World 2");
});

test('the rivers: every 2-4 row lays fault-free; splash-back where the design is soft, deep on Normal at beats 6 and 8 only; every Easy row splash-back and never harder than Normal', () => {
  const rows = RIVERS_24 as Record<string, { dir: 1 | -1; speed: number; logW: number; logs: number; gap?: number; safe?: boolean }>;
  for (const [name, row] of Object.entries(rows)) assert.ok(riverWidth(row) > 0 && row.speed <= 143, name);
  // (Normal's row -> Easy's: as slow or slower, logs as long or longer, water between as narrow or narrower)
  for (const [n, e] of [['twin24', 'twin24Easy'], ['noLand24', 'noLand24Easy'], ['gap200', 'gap200Easy'], ['gap280', 'gap280Easy']] as const) {
    assert.ok(rows[e].safe, `${e}: Easy's river splashes him back`);
    assert.ok(rows[e].speed <= rows[n].speed && rows[e].logW >= rows[n].logW && (rows[e].gap ?? 72) <= (rows[n].gap ?? 72) && rows[e].dir === rows[n].dir, `${e}: never harder than ${n}`);
  }
  for (const k of ['noLand24', 'gap200', 'gap280'] as const) assert.ok(!rows[k].safe, `${k}: deep on Normal (2-4.md beats 6, 8 #water)`);
  for (const k of ['long24', 'ride24', 'deep24', 'twin24', 'slow24'] as const) assert.ok(rows[k].safe, `${k}: splash-back (2-4.md :#soft; the lead's ruling (b) for beats 4 and 9)`);
  for (const seed of SEEDS) for (const d of BOTH) {
    const st = built(seed, d);
    assert.deepEqual(riverFaults(st as never, d), [], `${seed} ${d}`);
    const rv = logRivers(st);
    assert.equal(rv.length, RIVER_BEAT.length, `${seed} ${d}: ${RIVER_BEAT.length} log rivers`);
    assert.ok(rv.every((r) => r.dir === 1), `${seed} ${d}: every river runs his way`);
    assert.deepEqual(rv.map((r) => !!r.safe), d === 'easy' ? RIVER_BEAT.map(() => true) : RIVER_BEAT.map((b) => b !== 6 && b !== 8), `${seed} ${d}: which splash him back`);
  }
});

test('the lianas: each river under its own (one; two at beat 6 and over each of beat 8\'s rivers), every vine a swinging liana; a log-caught liana out of every bank\'s reach and past the chain distance, so the LOG is the way to it', () => {
  for (const seed of SEEDS) for (const d of BOTH) {
    const st = built(seed, d);
    assert.ok(st.vines.every((v) => v.vineType === 'swing_liana'), `${seed} ${d}: lianas only`);
    const rv = logRivers(st);
    const over = rv.map((r) => lianasOver(st.vines, r).sort((a, b) => a.x - b.x));
    assert.deepEqual(over.map((o) => o.length), RIVER_BEAT.map((b) => (b === 6 || b === 8 ? 2 : 1)), `${seed} ${d}: lianas over each river`);
    for (const [i, o] of over.entries()) {
      const r = rv[i];
      const near = st.platforms.filter((p) => p.type === 'solid' && Math.abs(p.x + p.width - r.x0) <= 2).sort((a, b) => a.y - b.y)[0];
      assert.ok(near, `${seed} ${d}: river ${i} has its near bank`);
      // (the first liana over each river is caught from its bank; at beats 4, 6 and 8 the liana that leads on is not, and hangs past the
      //  chain distance from the liana before it (physics CHAIN.dx): a leap from liana to liana would skip the log)
      const logCaught = RIVER_BEAT[i] === 4 ? o[0] : o.length === 2 ? o[1] : undefined;
      if (RIVER_BEAT[i] !== 4) assert.ok(lianaCaught(near, o[0], 1, r.surfaceY), `${seed} ${d}: river ${i}'s first liana is caught from the bank`);
      if (logCaught) {
        assert.ok(!lianaCaught(near, logCaught, 1, r.surfaceY), `${seed} ${d}: river ${i}'s liana at ${Math.round(logCaught.x)} is caught off a log, not from the bank`);
        if (o.length === 2) assert.ok(o[1].x - o[0].x >= CHAIN.dx, `${seed} ${d}: river ${i}: ${Math.round(o[1].x - o[0].x)} px between its lianas, under the chain distance ${CHAIN.dx}`);
      }
    }
    // (the great swing: the longest liana in the stage, longer than World 2's 410)
    const last = over[over.length - 1][0];
    assert.ok(st.vines.every((v) => v === last || v.bottomY - v.topY < last.bottomY - last.topY) && last.bottomY - last.topY > 410, `${seed} ${d}: the great swing is the longest`);
  }
});

test('the drops tell the truth: every splash-back river is drawn as the shallow backwater, every deep one as deep water', () => {
  for (const d of BOTH) {
    const st = built(1, d);
    const drops = dropsOf(st as never);
    for (const r of logRivers(st)) {
      const inIt = drops.filter((q) => (q.x0 + q.x1) / 2 >= r.x0 && (q.x0 + q.x1) / 2 <= r.x1);
      assert.ok(inIt.length >= 1, `${d}: the river at ${r.x0} has its drop`);
      for (const q of inIt) assert.equal(q.look, r.safe ? 'safe-water-art' : 'water-art', `${d}: the river at ${r.x0}`);
    }
  }
});

test("Dot teaches before the thing, with time to read (level.md rule 6): `drop` 800+ px before beat 1's river, `catch` before beat 4's, nothing deep between; the first deep river (beat 6) warned in the keeper's words; Pokey's `view` after the great swing", () => {
  assert.deepEqual([...TEACH_24], ['drop', 'catch']);
  for (const seed of SEEDS) for (const d of BOTH) {
    const st = built(seed, d);
    const rv = logRivers(st);
    const at = { drop: rv[RIVER_BEAT.indexOf(1)], catch: rv[RIVER_BEAT.indexOf(4)] };
    for (const k of TEACH_24) {
      const x = hintX(st, LINES_24[k]);
      assert.ok(x !== undefined, `${seed} ${d}: "${k}" is said`);
      assert.ok(at[k].x0 - x! >= 800, `${seed} ${d}: "${k}" ${Math.round(at[k].x0 - x!)} px before its river`);
      assert.ok(!rv.some((r) => !r.safe && r.x0 > x! && r.x0 < at[k].x0), `${seed} ${d}: a deep river between "${k}" and its river`);
    }
    const swing = rv[rv.length - 1];
    const v = hintX(st, LINES_24.view);
    assert.ok(v !== undefined && v >= swing.x1 - 2, `${seed} ${d}: "view" at ${v}, after the great swing's river (${Math.round(swing.x1)}), never over it`);
    if (d === 'normal') {
      const deep = rv.find((r) => !r.safe)!;
      assert.equal(rv.indexOf(deep), RIVER_BEAT.indexOf(6), `${seed}: the first deep river is beat 6's`);
      const w = hintX(st, W2_TIPS.water);
      assert.ok(w !== undefined && w < deep.x0 && w > rv[RIVER_BEAT.indexOf(4)].x1, `${seed}: the water warning between beat 4 and beat 6 (at ${w})`);
    }
  }
});

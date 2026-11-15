/**
 * 2-1 Down to the River (BUILD-21; reference/design/2-1.md on t-pitch-b@b85dba7f): the built stage, read the way the game builds it (its
 * stage-table row, kit 'w2-21', then World 2's finish), on both settings. The keeper's words verbatim; the arc beat for beat; the rivers
 * by the beat (Normal deep where the design is deep, every river on Easy the splash-back kind with logs at least as long); each teach line
 * 800+ px before what it teaches with nothing that costs a life between (level.md rule 6); the first deep river warned in the keeper's
 * words; every splash-back river recorded as the safe look and every deep one as deep water. Each test names the fault that turns it red
 * (planted by hand, 11-15: a line edited, a beat out of order, an Easy row left deep, a teach socket moved past its river).
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
import { STAGE_TABLE } from './stageTable.ts';
import { W2_TIPS } from './w2.ts';
import { ARC_21, BRIEF_21, LINES_21, RIVERS_21, STAGE_21, TEACH_21, kitLib21 } from './w2Arc21.ts';
import type { RiverZone } from '../../river.ts';
import type { Platform } from '../../types.ts';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..');
const cfg = generateAllLevels().find((c) => c.id === STAGE_21 && !c.secret)!;
type Built = {
  platforms: Platform[]; rivers?: RiverZone[]; proto: { hints?: Array<{ x: number; text: string }> };
  gen2: { errors?: string[]; sections: Array<{ template: string; x0: number; x1: number }>; falls?: Array<{ x0: number; x1: number; y: number; kind: string }> };
};
const memo = new Map<string, Built>();
/** the stage as the game builds it: its listed kit, then World 2's finish */
function built(seed: number, d: 'normal' | 'easy'): Built {
  const k = `${seed}:${d}`;
  if (!memo.has(k)) {
    const row = listedStage(STAGE_21)!;
    const st = buildGen2Stage({ config: cfg, kit: row.kit(), seed, difficulty: d });
    memo.set(k, worldFinish(row)(st as never, false, d) as unknown as Built);
  }
  return memo.get(k)!;
}
const SEEDS = [1, 2, 3];
const BOTH = ['normal', 'easy'] as const;
const hintX = (st: Built, line: string) => st.proto.hints?.find((h) => h.text === line)?.x;
/** the log rivers (a current), in order */
const logRivers = (st: Built) => (st.rivers ?? []).filter((r) => r.speed > 0).sort((a, b) => a.x0 - b.x0);

test("2-1's lines are the story keeper's, word for word (reference/story/lines-2-1.md, KEEPER-21, t-story@50da9e58), and the stage says them", () => {
  const md = fs.readFileSync(path.join(root, 'reference/story/lines-2-1.md'), 'utf8');
  const rows = new Map<string, string>();
  for (const m of md.matchAll(/^\| \d+ \| `([a-z]+)` \|[^|]*\| (.+?) \| \d+ \|$/gm)) rows.set(m[1], m[2].trim());
  for (const [k, v] of Object.entries(LINES_21)) assert.equal(v, rows.get(k), `line ${k}`);
  assert.equal(W2_TIPS.water, rows.get('deep'), "the deep river's warning is the keeper's `deep`");
  for (const d of BOTH) {
    const said = new Set(built(1, d).proto.hints!.map((h) => h.text));
    for (const v of Object.values(LINES_21)) assert.ok(said.has(v), `${d}: Dot says "${v}"`);
  }
});

test('the row: 2-1 rolls from its own kit (World 2 with 2-1 rows), CLEAN on both settings, the arc beat for beat, only its own bricks', () => {
  assert.equal(STAGE_TABLE[STAGE_21].kit, 'w2-21');
  assert.equal(kitLib21().manifest.world, 2);
  const beats = ['edge', 'down', 'rest', 'first-log', 'bank', 'rest', 'deep', 'rest', 'creek', 'back', 'rest', 'high-bank', 'both-ways', 'jetty', 'rest', 'long-log', 'gate'];
  assert.equal(Object.values(ARC_21)[0].split(' ').length, beats.length);
  for (const seed of SEEDS) for (const d of BOTH) {
    const st = built(seed, d);
    assert.deepEqual(st.gen2.errors ?? [], [], `${seed} ${d}`);
    assert.deepEqual(st.gen2.sections.map((s) => s.template.replace('w2-21-', '')), beats, `${seed} ${d}`);
  }
  assert.equal(BRIEF_21.petals, 'few', "the keeper's ruling 2: Meeca's petals are few in World 2");
});

test('the rivers: every 2-1 row lays fault-free; Normal deep where the design is deep; every Easy row the splash-back kind, its logs as long or longer', () => {
  const rows = RIVERS_21 as Record<string, { dir: 1 | -1; speed: number; logW: number; logs: number; safe?: boolean }>;
  for (const [name, row] of Object.entries(rows)) assert.ok(riverWidth(row) > 0 && row.speed <= 143, name);
  for (const k of ['ride21', 'deep21', 'back21', 'twinWith21', 'twinBack21'] as const) {
    const n = rows[k], e = rows[`${k}Easy`];
    assert.ok(e.safe, `${k}Easy: Easy's river splashes him back`);
    assert.ok(e.logW >= n.logW && e.speed === n.speed && e.dir === n.dir, `${k}Easy: never harder than Normal (logs ${e.logW} vs ${n.logW})`);
  }
  for (const k of ['deep21', 'back21', 'twinWith21', 'twinBack21'] as const) assert.ok(!rows[k].safe, `${k}: deep on Normal`);
  assert.ok(rows.ride21.safe && rows.long21.safe, 'the first log and the long log splash him back (2-1.md :#soft)');
  for (const seed of SEEDS) for (const d of BOTH) {
    const st = built(seed, d);
    assert.deepEqual(riverFaults(st as never), [], `${seed} ${d}`);
    const rv = logRivers(st);
    // (the first log, the deep river, the back river, the twin pair, the long log)
    assert.equal(rv.length, 6, `${seed} ${d}: six log rivers`);
    assert.deepEqual(rv.map((r) => r.dir), [1, 1, -1, 1, -1, 1], `${seed} ${d}: the flows`);
    assert.deepEqual(rv.map((r) => !!r.safe), d === 'easy' ? [true, true, true, true, true, true] : [true, false, false, false, false, true], `${seed} ${d}: which splash him back`);
  }
});

test("the village at the gate (2-1.md beat 11; the keeper's canon: doors dug into the bank, PLEASE BE PATIENT): laid on the gate's bank, before the exit", () => {
  for (const d of BOTH) {
    const row = listedStage(STAGE_21)!;
    const st = row.finish!(built(1, d), d) as Built & { proto: { decor?: Array<{ n?: string; x: number; text?: string[]; cel?: string }> }; exitTotemX?: number };
    const gate = st.gen2.sections.find((q) => q.template === 'w2-21-gate')!;
    const here = (st.proto.decor ?? []).filter((q) => q.x >= gate.x0 && q.x <= gate.x1);
    assert.ok(here.some((q) => q.text?.join(' ') === 'PLEASE BE PATIENT'), `${d}: the sign`);
    assert.equal(here.filter((q) => q.n === 'door').length, 2, `${d}: two round doors in the bank`);
    assert.ok(here.some((q) => q.cel === 'po.carry_stand'), `${d}: the mailman on his round`);
    assert.equal(row.finish!(st, d), st);
    assert.equal((st.proto.decor ?? []).filter((q) => q.x >= gate.x0 && q.x <= gate.x1).length, here.length, `${d}: a second finish lays nothing more`);
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

test("Dot teaches before the thing, with time to read (level.md rule 6): each teach line 800+ px before its river, nothing deep between; the first deep river warned in the keeper's words", () => {
  assert.deepEqual([...TEACH_21], ['logs', 'back']);
  for (const seed of SEEDS) for (const d of BOTH) {
    const st = built(seed, d);
    const rv = logRivers(st);
    const at = { logs: rv[0], back: rv[2] };
    for (const k of TEACH_21) {
      const x = hintX(st, LINES_21[k]);
      assert.ok(x !== undefined, `${seed} ${d}: "${k}" is said`);
      assert.ok(at[k].x0 - x! >= 800, `${seed} ${d}: "${k}" ${Math.round(at[k].x0 - x!)} px before its river`);
      assert.ok(!rv.some((r) => !r.safe && r.x0 > x! && r.x0 < at[k].x0), `${seed} ${d}: a deep river between "${k}" and its river`);
    }
    if (d === 'normal') {
      const deep = rv.find((r) => !r.safe)!;
      const w = hintX(st, W2_TIPS.water);
      assert.ok(w !== undefined && w < deep.x0, `${seed}: the first deep river at ${deep.x0} is warned`);
    }
  }
});

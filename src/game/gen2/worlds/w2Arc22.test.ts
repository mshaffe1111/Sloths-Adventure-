/**
 * 2-2 Petals for the Crown (BUILD-22; reference/design/2-2.md on t-pitch-b@b85dba7f): the built stage, read the way the game builds it (its
 * stage-table row, kit 'w2-22', then World 2's finish), on both settings. The keeper's words verbatim and said; the arc beat for beat;
 * the ponds by the beat (Normal deep where the design is deep, every pond on Easy the splash-back kind but the finale, every Easy count at
 * least Normal's: never harder); each teach line 800+ px before what it teaches with nothing that costs a life between (level.md rule 6);
 * the crown lily laid once, its lines at it; the crown's flowers never her pink (the keeper's fault 1). Each test names the fault that
 * turns it red.
 */
import '../../headlessDom.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildGen2Stage } from '../pipeline.ts';
import { listedStage, worldFinish } from '../listed.ts';
import { padFaults } from '../rideLay.ts';
import { beatOf } from '../../clock.ts';
import type { ClockDef } from '../../stageKit.types.ts';
import { generateAllLevels } from '../../worldsData.ts';
import { STAGE_TABLE } from './stageTable.ts';
import { ARC_22, LINES_22, PADS_22, STAGE_22, TEACH_22 } from './w2Arc22.ts';
import type { RiverZone } from '../../river.ts';
import type { Collectible, Platform } from '../../types.ts';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..');
const cfg = generateAllLevels().find((c) => c.id === STAGE_22 && !c.secret)!;
type Built = {
  platforms: Platform[]; collectibles: Collectible[]; rivers?: RiverZone[]; clocks?: ClockDef[]; proto: { hints?: Array<{ x: number; text: string }> };
  gen2: { errors?: string[]; sections: Array<{ template: string; x0: number; x1: number }>; falls?: Array<{ x0: number; x1: number; y: number; kind: string }> };
};
const memo = new Map<string, Built>();
/** the stage as the game builds it: its listed kit, then World 2's finish */
function built(seed: number, d: 'normal' | 'easy'): Built {
  const k = `${seed}:${d}`;
  if (!memo.has(k)) {
    const row = listedStage(STAGE_22)!;
    const st = buildGen2Stage({ config: cfg, kit: row.kit(), seed, difficulty: d });
    memo.set(k, worldFinish(row)(st as never, false, d) as unknown as Built);
  }
  return memo.get(k)!;
}
const SEEDS = [1, 2, 3];
const BOTH = ['normal', 'easy'] as const;
const hintX = (st: Built, line: string) => st.proto.hints?.find((h) => h.text === line)?.x;
const inPond = (r: RiverZone) => (p: Platform) => p.x >= r.x0 && p.x + p.width <= r.x1;
/** the ponds (still water with pads or the crown lily in it; a missing plank's creek is still water too, and no pond), in order */
const ponds = (st: Built) => (st.rivers ?? []).filter((r) => r.speed === 0 && st.platforms.some((p) => (p.pad || p.art === 'crownLily') && inPond(r)(p))).sort((a, b) => a.x0 - b.x0);

test("2-2's lines are the story keeper's, word for word (reference/story/lines-2-2.md, KEEPER-22, t-story@50da9e58), and the stage says them", () => {
  const md = fs.readFileSync(path.join(root, 'reference/story/lines-2-2.md'), 'utf8');
  const rows = new Map<string, string>();
  for (const m of md.matchAll(/^\| \w+ \| `([a-z]+)` \|[^|]*\| (.+?) \| \d+ \|$/gm)) rows.set(m[1], m[2].trim());
  for (const [k, v] of Object.entries(LINES_22)) assert.equal(v, rows.get(k), `line ${k}`);
  // (`note` is Dot's at Meeca's note: the find, not a socket of this file; named in BUILD-22's REPORT)
  for (const d of BOTH) {
    const said = new Set(built(1, d).proto.hints!.map((h) => h.text));
    for (const k of ['pads', 'stone', 'breathe', 'lily', 'crown', 'king'] as const) assert.ok(said.has(LINES_22[k]), `${d}: "${LINES_22[k]}" is said`);
  }
});

test('the row: 2-2 rolls from its own kit (World 2 with 2-2 rows), CLEAN on both settings, the arc beat for beat, only its own bricks', () => {
  assert.equal(STAGE_TABLE[STAGE_22]?.kit, 'w2-22');
  assert.equal(Object.values(ARC_22)[0], 'A Tw Pw R Pg Xw R Wf R Pg Mf R S R L E');
  for (const seed of SEEDS) for (const d of BOTH) {
    const st = built(seed, d);
    assert.deepEqual(st.gen2.errors ?? [], [], `${seed} ${d}`);
    const beats = st.gen2.sections.map((s) => s.template.replace('w2-22-', ''));
    assert.deepEqual(beats, ['garden', 'first-pad', 'keep-moving', 'rest', 'garden-path', 'there-and-back', 'rest', 'breathes', 'rest', 'planks', 'both-kinds', 'rest', 'crown-lily', 'rest', 'deep', 'bank'], `${seed} ${d}`);
    assert.deepEqual(padFaults(st), [], `${seed} ${d}: every pond fair`);
  }
});

test('the ponds by the beat: deep where 2-2.md is deep on Normal; on Easy splash-back everywhere but the finale; Easy never harder', () => {
  for (const seed of SEEDS) {
    const n = built(seed, 'normal'), e = built(seed, 'easy');
    const pn = ponds(n), pe = ponds(e);
    // (first, hop, the spur (X), the breath's two runs, mix weight, mix beat, crown, deep, deep beat: ten ponds)
    assert.equal(pn.length, 10, `${seed} Normal: ${pn.length} ponds`);
    assert.equal(pe.length, 10, `${seed} Easy: ${pe.length} ponds`);
    assert.deepEqual(pn.map((r) => !!r.safe), [true, true, true, false, false, false, false, true, false, false], `${seed} Normal: safe by the beat`);
    assert.deepEqual(pe.map((r) => !!r.safe), [true, true, true, true, true, true, true, true, false, false], `${seed} Easy: safe but the finale`);
    // (the breath's two runs keep one clock: they breathe in step)
    assert.equal(new Set(n.platforms.filter((p) => p.pad?.clock === 'pads-breath22').map((p) => p.pad!.clock)).size, 1, `${seed}: the breath is one clock`);
    assert.equal(n.platforms.filter((p) => p.pad?.clock === 'pads-breath22').length, 4, `${seed}: four breathing pads`);
    // (every clock a pad reads is at least as long on Easy as on Normal, the shiver too)
    for (const def of e.clocks ?? []) {
      if (!e.platforms.some((p) => p.pad?.clock === def.id)) continue;
      const eb = beatOf(def, true), nb = beatOf(def, false);
      assert.ok(eb.period >= nb.period && (eb.ons[0] ?? eb.period) >= (nb.ons[0] ?? nb.period), `${seed}: ${def.id} on Easy holds ${eb.ons[0]} of ${eb.period} s, Normal ${nb.ons[0]} of ${nb.period}`);
    }
    // (the pads by the beat: the same rows on both settings)
    for (const [i, r] of pn.entries()) assert.equal(n.platforms.filter(inPond(r)).length, e.platforms.filter(inPond(pe[i])).length, `${seed}: pond ${i} lays the same pieces on both settings`);
  }
});

test('each teach line comes 800+ px before what it teaches, with no deep water between (level.md rule 6)', () => {
  for (const seed of SEEDS) for (const d of BOTH) {
    const st = built(seed, d);
    const firstPad = Math.min(...st.platforms.filter((p) => p.pad).map((p) => p.x));
    const firstBeat = Math.min(...st.platforms.filter((p) => p.pad?.by === 'beat').map((p) => p.x));
    for (const [line, at] of [['pads', firstPad], ['breathe', firstBeat]] as const) {
      assert.ok(TEACH_22.includes(line));
      const x = hintX(st, LINES_22[line])!;
      assert.ok(x !== undefined && at - x >= 800, `${seed} ${d}: \`${line}\` at ${x}, ${at - x} px before x=${at}`);
      assert.ok(!(st.rivers ?? []).some((r) => !r.safe && r.x0 > x && r.x1 < at), `${seed} ${d}: deep water between \`${line}\` and what it teaches`);
    }
  }
});

test('the crown lily: laid once, in its pond between two small pads, never a sinking pad; Pokey\'s `lily` as he reaches it, Dot\'s `crown` after', () => {
  for (const seed of SEEDS) for (const d of BOTH) {
    const st = built(seed, d);
    const lily = st.platforms.filter((p) => p.art === 'crownLily');
    assert.equal(lily.length, 1, `${seed} ${d}`);
    const L = lily[0];
    const pond = ponds(st).find((r) => L.x > r.x0 && L.x < r.x1)!;
    assert.ok(pond, `${seed} ${d}: the lily stands in a pond`);
    assert.deepEqual(st.platforms.filter(inPond(pond)).sort((a, b) => a.x - b.x).map((p) => (p.art === 'crownLily' ? 'crown' : p.pad?.look)), ['small', 'crown', 'small'], `${seed} ${d}`);
    const lx = hintX(st, LINES_22.lily)!, cx = hintX(st, LINES_22.crown)!;
    assert.ok(lx < L.x && L.x - lx < 400, `${seed} ${d}: \`lily\` at ${lx}, the lily at ${L.x}`);
    assert.ok(cx > lx, `${seed} ${d}: \`crown\` after \`lily\``);
    // (its white crown flowers ride it: PADS_22.crown22's petals)
    assert.deepEqual(PADS_22.crown22.petals, [1]);
    assert.ok(st.collectibles.some((c) => c.rides?.id === L.id), `${seed} ${d}: a crown flower on the lily`);
  }
});

test("the crown's flowers are the pond's own, never her pink (the keeper's fault 1: the passion flower's lilac and the lotus's white)", () => {
  for (const d of BOTH) {
    const st = built(1, d);
    const fl = st.collectibles.filter((c) => c.type === 'flower');
    assert.ok(fl.length >= 35, `${d}: ${fl.length} flowers for the crown`);
    assert.deepEqual([...new Set(fl.map((c) => c.botanicalVariant))].sort(), ['lotus', 'passion'], d);
  }
});

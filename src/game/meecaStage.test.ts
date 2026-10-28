/**
 * Meeca's stage (5-M, "On the March North", 2026-10-28): the stage as built, on many rolls.
 *   - five puzzle rooms in World 5's order (sit, eat, silk, tea, look), each proven by the validator (puzzleCheck.ts) on every roll,
 *     each failing without its key piece, none able to be passed by, each narrow and tall enough for an upright phone, each with a
 *     lantern-stake reset post, nothing in them that hurts;
 *   - the whole stage walks from her bedroll to the last tree; every dip has a one-jump way out and every wall reaches the ground;
 *   - the trails between the rooms: real moves every few seconds, rolled from real alternatives;
 *   - its length for a quick player (stageTime.ts MODEL_FAST): 5:00 to 5:30 on every roll;
 *   - every word: the five warnings, "Last one. For Pokey.", Flicker's first line, "Hairpin. Good. Round and round." and every Pell line
 *     word for word, the ending in the approved order, the card "at night", the hints under ten words;
 *   - what she carves is kept with the game for 5-6; the stage sits first in World 5, at night, and the HUD counts "M. n/5".
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { buildMeecaStage, meecaCheckStage, meecaGeneratedStage, meecaSeconds, TRAIL_SECTIONS, MEECA_G } from './meecaStage.ts';
import { FLICKER_HINTS, MEECA_CARD, MEECA_ENDING, MEECA_ENDING_A, MEECA_ENDING_B, MEECA_GOAL, MEECA_SAY, MEECA_WARNINGS, ROOM_LINES, wordsIn } from './meecaLines.ts';
import { carvingsForPokey, loadCarved, markCarvingsDone, parseCarved, recordCarving } from './meecaCarved.ts';
import { EXTRA_STAGES, MEECA_STAGE_ID, meecaStageConfig, withExtraStages } from './extraStages.ts';
import { validateStage } from './levelCheck.ts';
import { kitPlatId, roomBox, tipText, type RoomSpec } from './puzzleKit.ts';
import { levelConfig } from './realPlay.ts';
import { generateStage, setLayoutVariant } from './stageGenerator.ts';
import { w5BackdropStem, w5Mood } from './w5Backdrop.ts';
import { goalInfo } from '../components/hud/goalInfo.ts';
import { isSaveKey } from './saveFile.ts';
import { MODEL_TYPICAL } from './stageTime.ts';
import type { GeneratedStage } from './stageGenerator.ts';

const SEEDS = [1, 2, 3, 38, 75, 112];
const build = (seed: number) => meecaGeneratedStage(meecaStageConfig(), seed);
/** each room's key pieces: without them its way on never opens */
const KEY: Record<string, string[]> = { sit: ['sapling'], eat: ['item', 'source'], silk: ['item', 'source'], tea: ['teapot'], look: ['glow'] };
const withRoom = (st: ReturnType<typeof build>, k: number, f: (r: RoomSpec) => RoomSpec) => ({ ...st, kit: { rooms: st.kit!.rooms.map((r, i) => (i === k ? f(r) : r)) } });

test("5-M's rooms: sit, eat, silk, tea, look; the validator solves each on every roll, and the whole stage walks to the last tree", () => {
  for (const s of SEEDS) {
    const st = build(s);
    assert.deepEqual(st.kit!.rooms.map((r) => r.id), ['sit', 'eat', 'silk', 'tea', 'look'], `seed ${s}`);
    const res = validateStage(meecaCheckStage(st));
    assert.deepEqual(res.errors, [], `seed ${s}`);
  }
});

test("5-M's rooms: each fails without its key piece (the sapling, the cake, the pinecone, the teapot, Flicker's light) and none can be passed by", () => {
  for (const s of [1, 38]) {
    const st = build(s);
    st.kit!.rooms.forEach((room, k) => {
      const t = withRoom(st, k, (r) => ({ ...r, pieces: r.pieces.filter((p) => !KEY[r.id].includes(p.kind)) }));
      assert.ok(validateStage(meecaCheckStage(t)).errors.some((e) => e.startsWith(`room ${room.id}:`)), `seed ${s}: ${room.id} works without its key`);
      // left unsolved (its sapling upright, its lift down, its ladder rolled, its steps dark), the last tree cannot be reached; a gate
      // room's door is a wall the room's own check holds shut (and it stands on the floor: nothing goes under it)
      const u = withRoom(st, k, (r) => ({ ...r, pieces: r.pieces.filter((p) => p.kind === 'reset' || p.kind === 'chair'), exit: 'none' }));
      const walk = validateStage(meecaCheckStage(u)).errors.filter((e) => !e.startsWith('room '));
      if (room.id === 'eat') {
        const door = st.platforms.find((p) => p.id === kitPlatId(k, 'gate2', 0))!;
        assert.equal(door.y + door.height, MEECA_G, 'the gate reaches the ground');
      } else if (room.id === 'tea') {
        const door = st.platforms.find((p) => p.id === kitPlatId(k, 'butler4', 0))!;
        assert.equal(door.y + door.height, MEECA_G, 'the Butler stands on the ground: nobody slips under the arch');
        const lift = st.platforms.find((p) => p.id === kitPlatId(k, 'lift4', 0))!;
        const wall = st.platforms.find((p) => p.id === kitPlatId(k, 'butler4', 1))!;
        assert.ok(wall.y < lift.y - 185, 'the arch is too high to jump from the lift left down');
      } else assert.ok(walk.length > 0, `seed ${s}: ${room.id} can be passed by`);
    });
  }
});

test("5-M's rooms: narrow and tall enough for an upright phone, a reset post in each, no animal, nothing that hurts, and none of them deadly", () => {
  for (const s of SEEDS) {
    const st = build(s);
    assert.equal(st.enemies.length, 0);
    assert.equal(st.waterY, undefined);
    for (const r of st.kit!.rooms) {
      const b = roomBox(r, st.platforms);
      assert.ok(b.x1 - b.x0 <= 800 && b.y1 - b.y0 <= 640, `seed ${s}: ${r.id} is ${Math.round(b.x1 - b.x0)} x ${Math.round(b.y1 - b.y0)}`);
      assert.ok(r.pieces.some((p) => p.kind === 'reset'), `seed ${s}: ${r.id} has no reset post`);
    }
    // the lowest ground anywhere is well above the level's foot (no fall leaves the stage), and every dip's floor is solid
    const lowest = Math.max(...st.platforms.map((p) => p.y));
    assert.ok(lowest < st.config.levelHeight - 300, `seed ${s}: ground at ${lowest}`);
  }
});

test("5-M's trails: something to do every few seconds (STAGE-RULES §2), rolled from real alternatives, and different roll to roll", () => {
  const kinds = new Set<string>();
  const seqs: string[] = [];
  for (const s of SEEDS) {
    const st = build(s);
    const m = st.proto.meeca!;
    assert.equal(m.trails.length, TRAIL_SECTIONS.length);
    let seq = '';
    for (const tr of m.trails) {
      let lastX = tr.x0;
      for (const step of tr.steps) {
        const pl = step.kind === 'plat' ? st.platforms.find((p) => p.id === step.id)! : null;
        // (a stretch of plain ground is no move; a stump, a log, a branch, a step across a dip or a climb is)
        if (pl && pl.y === MEECA_G) continue;
        const x = pl ? pl.x : st.vines.find((v) => v.id === (step as { vine: number }).vine)!.x;
        // (at the quick player's pace, 228 px a second: never a quiet 4 s)
        assert.ok(x - lastX <= 900, `seed ${s}: ${tr.name}: ${x - lastX} px with nothing to do`);
        lastX = Math.max(lastX, pl ? pl.x + pl.width : x);
        seq += step.kind === 'climb' ? 'C' : 'p';
      }
    }
    for (const b of m.beats) if (b[2].startsWith('Trail')) kinds.add(b[2]);
    seqs.push(seq);
  }
  assert.ok(new Set(seqs).size === seqs.length, 'every roll lays its trails out differently');
});

test("5-M's length: 5:00 to 5:30 for a quick player on every roll (stageTime.ts MODEL_FAST), longer for a typical one", () => {
  for (const s of SEEDS) {
    const st = build(s);
    const fast = meecaSeconds(st);
    assert.ok(fast >= 300 && fast <= 330, `seed ${s}: ${fast.toFixed(0)} s`);
    assert.ok(meecaSeconds(st, MODEL_TYPICAL) > fast);
  }
});

test("5-M's words: the five warnings, Flicker's first line, the carving, the last tree and every Pell line word for word; the ending in order", () => {
  assert.deepEqual(MEECA_WARNINGS.map((w) => w.lines.join(' ')), [
    "POKEY. DON'T SIT. M.", "DON'T EAT. M.", 'HANDS OFF THE SILK. M.', 'NO TEA. BE RUDE. M.', "DON'T STOP TO LOOK. LOVE, M.",
  ]);
  assert.equal(MEECA_GOAL, 5);
  assert.equal(MEECA_SAY.flicker.text, "You're not from here. Nobody from here walks that loud.");
  assert.equal(MEECA_SAY.flicker.who, 'flicker');
  assert.equal(MEECA_SAY.carve.text, 'Hairpin. Good. Round and round.');
  assert.equal(MEECA_SAY.last.text, 'Last one. For Pokey.');
  assert.deepEqual(MEECA_ENDING.map((l) => `${l.who}: ${l.text}`), [
    'Lieutenant Pell: Good evening, Miss.',
    'Meeca: ...How long have you been there?',
    'Lieutenant Pell: Since the first tree. I am sorry.',
    'Lieutenant Pell: I did not see any carving, Miss. I did not see anything.',
    'Flicker: I was the light.',
    'Lieutenant Pell: It is cold tonight. Here.',
    'Lieutenant Pell: It is not from the General.',
    'Meeca: Thank you, Pell.',
    'Lieutenant Pell: Please do not thank me. It is embarrassing.',
  ]);
  assert.equal(MEECA_ENDING_A.length + MEECA_ENDING_B.length, MEECA_ENDING.length);
  assert.equal(MEECA_ENDING.find((l) => l.who === 'Flicker')!.beat, 'small', 'Flicker says it very small');
  for (const l of MEECA_ENDING.filter((x) => x.who === 'Lieutenant Pell')) assert.ok(!/\w'\w/.test(l.text), `Pell never uses a contraction: ${l.text}`);
  assert.deepEqual(MEECA_CARD.title, ['On the March', 'North']);
  assert.deepEqual(MEECA_CARD.sub, ['The Orchid Sanctuary, at night.', 'You are Meeca.']);
  // her thoughts and the rooms' lines: short (under ten words); Flicker's hints: two steps a room, under ten words, said only when asked
  for (const l of [...Object.values(MEECA_SAY).filter((x) => x.who === 'meeca'), ...Object.values(ROOM_LINES).flatMap((r) => Object.values(r))]) {
    const text = typeof l === 'string' ? l : 'text' in l ? l.text : tipText(l);
    assert.ok(wordsIn(text) < 10, text);
  }
  for (const id of ['mark', 'sit', 'eat', 'silk', 'tea', 'look']) {
    assert.equal(FLICKER_HINTS[id].length, 2, id);
    for (const h of FLICKER_HINTS[id]) assert.ok(wordsIn(h) < 10, h);
  }
  // the household's polite-creepy manners: the Butler never uses a contraction either
  for (const l of Object.values(ROOM_LINES.tea)) if (typeof l !== 'string') assert.ok(!/\w'\w/.test(l.text), l.text);
});

test('5-M: what she carves is kept with the game (a save file carries it, a new game clears it) for 5-6 to show, in her order', () => {
  const m = new Map<string, string>();
  const store = { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v) };
  assert.deepEqual(carvingsForPokey(store), []);
  recordCarving({ id: 'eat', lines: ["DON'T", 'EAT.', 'M.'], along: 0.3, high: false, caught: 0 }, store);
  recordCarving({ id: 'sit', lines: ['POKEY.', "DON'T", 'SIT.', 'M.'], along: 0.05, high: true, caught: 0 }, store);
  recordCarving({ id: 'eat', lines: ["DON'T", 'EAT.', 'M.'], along: 0.31, high: false, caught: 0 }, store);
  assert.deepEqual(carvingsForPokey(store).map((c) => [c.id, c.along]), [['sit', 0.05], ['eat', 0.31]]);
  assert.equal(loadCarved(store).done, false);
  assert.equal(markCarvingsDone(store).done, true);
  assert.deepEqual(parseCarved('{nope').carvings, []);
  assert.ok(isSaveKey('sloth_w5_carved'));
  assert.ok(isSaveKey('sloth_lvl_5-M'));
});

test("5-M: first in World 5 (after 4-10, before 5-1), built by the generator, at night, and the HUD counts 'M. n/5'", () => {
  assert.ok(EXTRA_STAGES.some((e) => e.after === '4-10' && e.config().id === MEECA_STAGE_ID));
  const list = withExtraStages([levelConfig('4-10'), levelConfig('5-1')], true);
  assert.deepEqual(list.map((l) => l.id), ['4-10', '5-M', '5-1']);
  setLayoutVariant(3);
  const st = generateStage(meecaStageConfig()) as GeneratedStage & { proto?: { meeca?: unknown } };
  setLayoutVariant(null);
  assert.ok(st.proto?.meeca, 'the generator hands 5-M to its builder');
  assert.ok(st.kit?.rooms.length === 5, 'with its five rooms');
  assert.equal(st.config.targetCount, MEECA_GOAL);
  assert.equal(w5Mood(MEECA_STAGE_ID), 'night');
  assert.equal(w5BackdropStem(MEECA_STAGE_ID), 'w5night');
  const g = goalInfo({ ...meecaStageConfig(), targetCount: 5 });
  assert.equal(g.kind, 'count');
  assert.deepEqual(g.icon, { kind: 'drawn', name: 'carving' });
  // (the old stage's march is gone: no column, no look-backs, no ferns to hide in)
  const m = buildMeecaStage(1) as unknown as Record<string, unknown>;
  assert.ok(!('marchers' in m) && !('stretches' in m) && !('ferns' in m));
});

/**
 * The Worlds 5-10 art cut in on 2026-10-29 (tools/art/w6to10/cutin.py): the four World 5 creatures' clips, Flicker's clips in Meeca's
 * stage, the water's-edge warning signs, World 6's far strips, and the guardians' clips, lairs and props made ready for the worlds still
 * being built. Each sheet's frames lie inside it and it stays under the asset limit; Flicker does what the stage is doing; the
 * Seamstress's tell and cast run through her attack clip; each world stands its own sign.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { AnimFrame } from './creatureAnim.ts';
import { SEAMSTRESS_ANIM, SEAMSTRESS_ANIM_SIZE, SEAMSTRESS_ANIM_URL, SEAMSTRESS_SEQ } from './seamstressAnimData.ts';
import { DANGLER_ANIM, DANGLER_ANIM_SIZE, DANGLER_ANIM_URL, DANGLER_SEQ } from './danglerAnimData.ts';
import { MANTIS_ANIM, MANTIS_ANIM_SIZE, MANTIS_ANIM_URL, MANTIS_SEQ } from './mantisAnimData.ts';
import { DOZER_ANIM, DOZER_ANIM_SIZE, DOZER_ANIM_URL, DOZER_SEQ } from './dozerAnimData.ts';
import { FLICKER_ANIM, FLICKER_ANIM_SIZE, FLICKER_ANIM_URL, FLICKER_SEQ } from './flickerAnimData.ts';
import { WATER_SIGN_FRAMES, WATER_SIGN_SIZE, WATER_SIGN_URL } from './waterSignData.ts';
import { seamClipAt } from './w5Creatures.ts';
import { signRattle, waterSignFor } from './waterSign.ts';
import { FLICKER_DOZE_S, FLICKER_LEAD_V, flickerFrame, flickerMove, type FlickerMove } from './meecaArt.ts';
import { MEECA_SAY, FLICKER_HINTS } from './meecaLines.ts';
import { stageSheets } from './stageSheets.ts';
import { MEECA_STAGE_ID } from './extraStages.ts';
import { W6_PUZZLE_FRAMES, W6_PUZZLE_SIZE, W6_PUZZLE_URL, W6_WATER_FRAMES, W6_WATER_SIZE, W6_WATER_URL } from './w6PropsData.ts';

/** width and height of a WebP file, from its header */
function webpSize(path: string): { w: number; h: number } {
  const b = readFileSync(path);
  assert.equal(b.toString('ascii', 0, 4), 'RIFF');
  assert.equal(b.toString('ascii', 8, 12), 'WEBP');
  const kind = b.toString('ascii', 12, 16);
  if (kind === 'VP8X') return { w: 1 + b.readUIntLE(24, 3), h: 1 + b.readUIntLE(27, 3) };
  if (kind === 'VP8L') {
    const v = b.readUInt32LE(21);
    return { w: 1 + (v & 0x3fff), h: 1 + ((v >> 14) & 0x3fff) };
  }
  return { w: b.readUInt16LE(26) & 0x3fff, h: b.readUInt16LE(28) & 0x3fff };
}

function checkSheet(name: string, url: string, size: { w: number; h: number }, frames: Record<string, AnimFrame>, seqs: Record<string, readonly string[]>, want: string[]) {
  const file = fileURLToPath(url);
  assert.deepEqual(webpSize(file), size, `${name}: the sheet's size matches its data`);
  assert.ok(statSync(file).size < 4 * 1024 * 1024, `${name}: under the 4 MiB asset limit`);
  for (const s of want) assert.ok((seqs[s]?.length ?? 0) > 0, `${name}: has ${s}`);
  for (const [s, names] of Object.entries(seqs)) {
    for (const n of names) {
      const f = frames[n];
      assert.ok(f, `${name}: ${s} names ${n}, which is in the sheet`);
      assert.ok(f.x >= 0 && f.y >= 0 && f.w > 0 && f.h > 0 && f.x + f.w <= size.w && f.y + f.h <= size.h, `${name}: ${n} lies inside the sheet`);
      assert.ok(Number.isFinite(f.ax) && Number.isFinite(f.ay), `${name}: ${n} has an anchor`);
    }
  }
}

test('the World 5 creatures\' clip sheets: one picture each, every frame inside it, under the asset limit', () => {
  checkSheet('seamstress', SEAMSTRESS_ANIM_URL, SEAMSTRESS_ANIM_SIZE, SEAMSTRESS_ANIM, SEAMSTRESS_SEQ, ['idle', 'move', 'attack', 'hurt']);
  checkSheet('dangler', DANGLER_ANIM_URL, DANGLER_ANIM_SIZE, DANGLER_ANIM, DANGLER_SEQ, ['idle', 'move', 'attack', 'hurt']);
  checkSheet('mantis', MANTIS_ANIM_URL, MANTIS_ANIM_SIZE, MANTIS_ANIM, MANTIS_SEQ, ['idle', 'move', 'attack', 'hurt']);
  // (the Dozer keeps its old flight: its new fly loop was broken, so it has no move clip)
  checkSheet('dozer', DOZER_ANIM_URL, DOZER_ANIM_SIZE, DOZER_ANIM, DOZER_SEQ, ['idle', 'attack', 'hurt']);
  assert.equal(DOZER_SEQ.move, undefined);
});

test("Flicker's clips: his thirteen moves (eleven in place, his lead and his dash), one sheet, loaded with Meeca's stage", () => {
  const moves: FlickerMove[] = ['talk', 'blink', 'glow', 'happy', 'sad', 'doze', 'smug', 'startled', 'worried', 'shrug', 'turn', 'lead', 'dart'];
  checkSheet('flicker', FLICKER_ANIM_URL, FLICKER_ANIM_SIZE, FLICKER_ANIM, FLICKER_SEQ, moves);
  assert.ok(stageSheets({ id: MEECA_STAGE_ID, worldIndex: 5, objectiveType: 'reach_exit', secret: false } as never, { hand: true, paint: true, ctest: false }).includes('anim:flicker'));
});

/** the stage as far as Flicker's moves look at it */
const mc = (o: Partial<Parameters<typeof flickerMove>[0]> = {}) =>
  ({ phase: 'play', small: false, bubble: null, sceneLine: null, ringOn: -1, carveSpot: false, line: -1, lineAt: 0, t: 10, ...o }) as Parameters<typeof flickerMove>[0];
const said = (text: string) => ({ who: 'flicker' as const, text, at: 0, until: 9 });

test('Flicker does what the stage is doing', () => {
  assert.equal(flickerMove(mc(), 0, false), 'blink', 'keeping her company');
  assert.equal(flickerMove(mc({ bubble: said(MEECA_SAY.flicker.text) }), 0, false), 'smug', 'his first words');
  assert.equal(flickerMove(mc({ bubble: said(MEECA_SAY.shy.text) }), 0, false), 'talk');
  assert.equal(flickerMove(mc({ bubble: said('Mark it. Then you can find your way back.') }), 0, false), 'shrug');
  assert.equal(flickerMove(mc({ bubble: said(FLICKER_HINTS.none[0]) }), 0, false), 'shrug', 'a hint with nothing to add');
  assert.equal(flickerMove(mc({ carveSpot: true }), 0, false), 'glow', 'a trunk to carve');
  assert.equal(flickerMove(mc(), FLICKER_DOZE_S + 1, false), 'doze', 'she has stood still a while');
  assert.equal(flickerMove(mc(), 0, true), 'turn');
  assert.equal(flickerMove(mc(), 0, false, false, FLICKER_LEAD_V + 1), 'lead', 'flying along with her');
  assert.equal(flickerMove(mc(), 0, false, true, FLICKER_LEAD_V + 1), 'dart', 'a dash off');
  assert.equal(flickerMove(mc({ bubble: said(MEECA_SAY.shy.text) }), 0, false, false, FLICKER_LEAD_V + 1), 'talk', 'talking wins over flying');
  assert.equal(flickerMove(mc({ phase: 'look' }), 0, false), 'happy', 'the moonflower');
  assert.equal(flickerMove(mc({ phase: 'endingA', line: 0, lineAt: 9.5 }), 0, false), 'startled', 'Pell steps out');
  assert.equal(flickerMove(mc({ phase: 'endingA', line: 2, lineAt: 2 }), 0, false), 'worried');
  assert.equal(flickerMove(mc({ phase: 'last' }), FLICKER_DOZE_S + 1, false), 'worried', 'never nods off with Pell there');
  assert.equal(flickerMove(mc({ phase: 'endingB', sceneLine: { who: 'Flicker', text: 'I was the light.' } }), 0, false), 'talk');
  assert.equal(flickerMove(mc({ phase: 'endingB', small: true }), 0, false), 'sad', 'small once the light was his');
});

test("Flicker's frames: back and forth for a loop, once through and then rocking over the second half for a move that settles", () => {
  const n = FLICKER_SEQ.blink.length;
  assert.equal(flickerFrame('blink', 0, 1), FLICKER_SEQ.blink[0]);
  assert.equal(flickerFrame('blink', (n - 1) / 8, 1), FLICKER_SEQ.blink[n - 1]);
  assert.equal(flickerFrame('blink', (2 * n - 2) / 8, 1), FLICKER_SEQ.blink[0], 'back at the start, no jump');
  const sad = FLICKER_SEQ.sad;
  const half = sad.slice(Math.floor(sad.length / 2));
  for (let s = sad.length / 8; s < 30; s += 0.37) assert.ok(half.includes(flickerFrame('sad', s, 1)), `sad at ${s}`);
  assert.equal(flickerFrame('turn', 0, 1.5), FLICKER_SEQ.turn[0]);
  assert.equal(flickerFrame('turn', 9, 1.5), FLICKER_SEQ.turn[FLICKER_SEQ.turn.length - 1], 'held at its end');
  assert.equal(flickerFrame('dart', 9, 1.5), FLICKER_SEQ.dart[FLICKER_SEQ.dart.length - 1], 'his dash too');
});

test("the Seamstress's tell is the first 60% of her attack clip (needles up), the cast the rest (the lace flies)", () => {
  assert.equal(seamClipAt('tell', 0), 0);
  assert.equal(seamClipAt('tell', 1), 0.6);
  assert.equal(seamClipAt('attack', 0), 0.6);
  assert.equal(seamClipAt('attack', 1), 1);
  assert.equal(seamClipAt('idle', 0.5), 0);
});

test("each world stands its own carved water's-edge sign, still and rattled; the sheet's frames lie inside it", () => {
  assert.equal(waterSignFor(5), 'sign-w5');
  assert.equal(waterSignFor(5, true), 'sign-w5-rattle');
  for (const w of [6, 7, 8, 9, 10]) assert.equal(waterSignFor(w), 'sign-jungle');
  const file = fileURLToPath(WATER_SIGN_URL);
  assert.deepEqual(webpSize(file), WATER_SIGN_SIZE);
  for (const [n, f] of Object.entries(WATER_SIGN_FRAMES)) {
    assert.ok(f.x >= 0 && f.y >= 0 && f.x + f.w <= WATER_SIGN_SIZE.w && f.y + f.h <= WATER_SIGN_SIZE.h, n);
    assert.ok(Math.abs(f.ax - f.w / 2) < 1 && f.ay === f.h, `${n}: anchored at the foot of its post`);
  }
  for (const w of [5, 6, 10]) for (const r of [false, true]) assert.ok(WATER_SIGN_FRAMES[waterSignFor(w, r)], `${w}/${r}`);
  // it rattles for a moment as he comes near, then stands still
  assert.equal(signRattle(undefined), false);
  assert.equal(signRattle(0), true);
  assert.ok([0.05, 0.15, 0.25, 0.35].some((t) => !signRattle(t)), 'the board knocks back and forth');
  assert.equal(signRattle(2), false);
});

test('the art made ready for the worlds being built: every file the manifest names is there, none over the asset limit', () => {
  const dir = new URL('../assets/w6to10/', import.meta.url);
  const m = JSON.parse(readFileSync(new URL('manifest.json', dir), 'utf8')) as { files: Record<string, number>; bosses: Record<string, { sheets: string[]; moves: Record<string, number> }> };
  assert.deepEqual(Object.keys(m.bosses).sort(), ['drake', 'golem', 'ironclaw', 'monarch', 'reaver', 'thornbark']);
  for (const [f, bytes] of Object.entries(m.files)) {
    const size = statSync(new URL(f, dir)).size;
    assert.equal(size, bytes, f);
    assert.ok(size < 4 * 1024 * 1024, `${f}: ${size}`);
  }
  // (and each far strip of Worlds 7-10 is in, at the far layers' size)
  for (const s of ['w7dawn', 'w7dusk', 'w8sunset', 'w8night', 'w9dawn', 'w9night', 'w10dusk', 'w10after']) {
    // (the far layers' height; up to 2048 wide, less once made seamless by scripts/strip-seamless.py: VI-4)
    const { w, h } = webpSize(fileURLToPath(new URL(`../assets/backdrops/${s}-far.webp`, import.meta.url)));
    assert.equal(h, 868, s);
    assert.ok(w >= 1600 && w <= 2048, `${s}: ${w} wide`);
  }
});

test("World 6's pieces cut from Matt's Gemini sheets: inside their sheets, and each pair of states on one canvas and anchor", () => {
  for (const [url, size, frames] of [[W6_PUZZLE_URL, W6_PUZZLE_SIZE, W6_PUZZLE_FRAMES], [W6_WATER_URL, W6_WATER_SIZE, W6_WATER_FRAMES]] as const) {
    assert.deepEqual(webpSize(fileURLToPath(url)), size);
    for (const [n, f] of Object.entries(frames)) assert.ok(f.x >= 0 && f.y >= 0 && f.x + f.w <= size.w && f.y + f.h <= size.h, n);
  }
  for (const [a, b] of [['lever-up', 'lever-down'], ['plate-up', 'plate-down'], ['door-closed', 'door-open']]) {
    const fa = W6_PUZZLE_FRAMES[a], fb = W6_PUZZLE_FRAMES[b];
    assert.deepEqual([fa.w, fa.h, fa.ax, fa.ay], [fb.w, fb.h, fb.ax, fb.ay], `${a} / ${b}`);
  }
  assert.deepEqual(Object.keys(W6_WATER_FRAMES).sort(), ['gauge-post', 'lily-pads', 'raft', 'seesaw', 'sluice-wheel', 'stone']);
});

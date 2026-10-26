/**
 * World 5's creature sheets, made ready before World 5 is built (2026-10-26) and not used by any stage yet: the jumping spider's clips
 * (spider-anim.webp), the Tarantula Queen's boss clips (queen-anim.webp), Meeca carving her warnings (meeca-carve.webp), the pose
 * sheets of the five new creature models, and Meeca's stage: Lieutenant Pell (pell-anim.webp), the General's soldiers
 * (soldier-anim.webp) and the blanket (meeca-blanket.webp). Each sheet's frames lie inside it, it stays under the asset limit, and the clip sheets load
 * through the shared creature loader.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { AnimFrame } from './creatureAnim.ts';
import { makeCreatureAnim } from './creatureAnim.ts';
import { SPIDER_ANIM, SPIDER_ANIM_SIZE, SPIDER_ANIM_UP, SPIDER_ANIM_URL, SPIDER_SEQ } from './spiderAnimData.ts';
import { QUEEN_ANIM, QUEEN_ANIM_SIZE, QUEEN_ANIM_UP, QUEEN_ANIM_URL, QUEEN_LOOPS, QUEEN_MOVES, QUEEN_ONCE, QUEEN_SEQ, queenFps } from './queenAnimData.ts';
import { QUEEN_FRAMES } from './queenAtlasData.ts';
import { MEECA_CARVE_FPS, MEECA_CARVE_FRAMES, MEECA_CARVE_SEQ, MEECA_CARVE_SIZE, MEECA_CARVE_URL } from './meecaCarveData.ts';
import { MEECA_FRAMES, MEECA_STAND_H } from './meecaStandardData.ts';
import { BUTLER_ATLAS_SIZE, BUTLER_ATLAS_URL, BUTLER_FRAMES } from './butlerAtlasData.ts';
import { DANGLER_ATLAS_SIZE, DANGLER_ATLAS_URL, DANGLER_FRAMES } from './danglerAtlasData.ts';
import { SEAMSTRESS_ATLAS_SIZE, SEAMSTRESS_ATLAS_URL, SEAMSTRESS_FRAMES } from './seamstressAtlasData.ts';
import { MANTIS_ATLAS_SIZE, MANTIS_ATLAS_URL, MANTIS_FRAMES } from './mantisAtlasData.ts';
import { DOZER_ATLAS_SIZE, DOZER_ATLAS_URL, DOZER_FRAMES } from './dozerAtlasData.ts';
import { PELL_ANIM, PELL_ANIM_SIZE, PELL_ANIM_UP, PELL_ANIM_URL, PELL_K, PELL_SEQ, PELL_UNITS } from './pellAnimData.ts';
import { BLANKET_UNITS, MEECA_BLANKET_FRAMES, MEECA_BLANKET_SIZE, MEECA_BLANKET_UP, MEECA_BLANKET_URL } from './meecaBlanketData.ts';
import { MEECA_UNITS } from './jennifurSprite.ts';
import { SOLDIER_ANIM, SOLDIER_ANIM_SIZE, SOLDIER_ANIM_UP, SOLDIER_ANIM_URL, SOLDIER_K, SOLDIER_SEQ } from './soldierAnimData.ts';

/** width and height of a WebP file, from its header */
export function webpSize(path: string): { w: number; h: number } {
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

export function checkSheet(name: string, url: string, size: { w: number; h: number }, frames: Record<string, AnimFrame>, seqs: Record<string, readonly string[]>, want: string[]) {
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

test('the jumping spider sheet: walk, idle, crouch and hurt clips, all inside the sheet', () => {
  checkSheet('spider', SPIDER_ANIM_URL, SPIDER_ANIM_SIZE, SPIDER_ANIM, SPIDER_SEQ, ['walk', 'idle', 'crouch', 'hurt']);
  assert.equal(SPIDER_ANIM_UP, 1.6);
});

test('the spider sheet loads through the shared creature loader (no stage uses it yet)', () => {
  const anim = makeCreatureAnim(SPIDER_ANIM_URL, SPIDER_ANIM, SPIDER_SEQ, SPIDER_ANIM_UP);
  assert.equal(anim.ready(), false, 'nothing loads outside a browser');
  assert.ok(anim.has('walk') && anim.has('idle') && anim.has('crouch') && anim.has('hurt'));
  // the walk loops, the crouch holds its last frame
  assert.equal(anim.loop('walk', 0, 16), SPIDER_SEQ.walk[0]);
  assert.equal(anim.loop('walk', SPIDER_SEQ.walk.length / 16, 16), SPIDER_SEQ.walk[0]);
  assert.equal(anim.at('crouch', 1), SPIDER_SEQ.crouch[SPIDER_SEQ.crouch.length - 1]);
  // the frames sit where the old painted frames did: anchors near the old spider's (64, 80) at 1.6 times the size
  for (const n of SPIDER_SEQ.walk) {
    const f = SPIDER_ANIM[n];
    assert.ok(Math.abs(f.ax / SPIDER_ANIM_UP - 64) < 6 && Math.abs(f.ay / SPIDER_ANIM_UP - 80) < 6, `${n} anchored like walk_0`);
  }
});

test('the Tarantula Queen sheet: every move a fair boss fight needs, each attack with a readable tell of at least 0.6 s', () => {
  const want = ['idle', 'skitter', 'hurt', 'stunned', 'defeat', 'sit', 'pour', ...Object.values(QUEEN_MOVES).flatMap((m) => Object.values(m))];
  checkSheet('queen', QUEEN_ANIM_URL, QUEEN_ANIM_SIZE, QUEEN_ANIM, QUEEN_SEQ, want);
  for (const [move, m] of Object.entries(QUEEN_MOVES)) {
    const secs = QUEEN_SEQ[m.tell].length / queenFps(m.tell);
    assert.ok(secs >= 0.6, `${move}: its tell plays ${secs.toFixed(2)} s`);
  }
  for (const s of [...QUEEN_LOOPS, ...QUEEN_ONCE]) assert.ok(QUEEN_SEQ[s].length >= 6, `${s} is a real animation`);
  // drawn at her boss scale like the old painted frames: the clips are QUEEN_ANIM_UP times their size, on the same ground line
  const idle = QUEEN_ANIM[QUEEN_SEQ.idle[0]];
  assert.ok(Math.abs(idle.ay / QUEEN_ANIM_UP - QUEEN_FRAMES.idle.ay) < 8, 'her idle stands where the old idle stood');
  assert.ok(Math.abs(idle.w / QUEEN_ANIM_UP - QUEEN_FRAMES.idle.w) < 30, "and is the old idle's size");
  const anim = makeCreatureAnim(QUEEN_ANIM_URL, QUEEN_ANIM, QUEEN_SEQ, QUEEN_ANIM_UP);
  assert.equal(anim.at('slamTell', 1), QUEEN_SEQ.slamTell[QUEEN_SEQ.slamTell.length - 1], 'a tell holds its last frame');
});

test("Meeca carving on the trunk: a loop at her standard sheet's size", () => {
  checkSheet('meeca-carve', MEECA_CARVE_URL, MEECA_CARVE_SIZE, MEECA_CARVE_FRAMES, { carve: MEECA_CARVE_SEQ }, ['carve']);
  assert.ok(MEECA_CARVE_SEQ.length / MEECA_CARVE_FPS >= 0.5);
  for (const n of MEECA_CARVE_SEQ) {
    const f = MEECA_CARVE_FRAMES[n];
    // standing, so about as tall as her standard idle (MEECA_STAND_H atlas px)
    assert.ok(Math.abs(f.ay - MEECA_STAND_H) < 0.15 * MEECA_STAND_H, `${n} is her standing height (${f.ay})`);
  }
  assert.ok(MEECA_FRAMES.climb_0 && MEECA_FRAMES.run_0 && MEECA_FRAMES.crouch && MEECA_FRAMES.jump_up, 'her run, jump, climb and crouch are already there');
});

test("the new creature models' pose sheets: idle, move, tell, attack, hurt and defeated for each", () => {
  const poses = ['idle', 'move', 'tell', 'attack', 'hurt', 'defeated'];
  const one = (frames: Record<string, AnimFrame>) => Object.fromEntries(Object.keys(frames).map((k) => [k, [k]]));
  checkSheet('butler', BUTLER_ATLAS_URL, BUTLER_ATLAS_SIZE, BUTLER_FRAMES, one(BUTLER_FRAMES), poses);
  checkSheet('dangler', DANGLER_ATLAS_URL, DANGLER_ATLAS_SIZE, DANGLER_FRAMES, one(DANGLER_FRAMES), poses);
  checkSheet('seamstress', SEAMSTRESS_ATLAS_URL, SEAMSTRESS_ATLAS_SIZE, SEAMSTRESS_FRAMES, one(SEAMSTRESS_FRAMES), poses);
  // the orchid mantis also keeps her concept art's orchid disguise (the model drew her revealed in every take)
  checkSheet('mantis', MANTIS_ATLAS_URL, MANTIS_ATLAS_SIZE, MANTIS_FRAMES, one(MANTIS_FRAMES), [...poses, 'disguise']);
  checkSheet('dozer', DOZER_ATLAS_URL, DOZER_ATLAS_SIZE, DOZER_FRAMES, one(DOZER_FRAMES), poses);
});

/** each frame's standing height in world units: feet (the anchor, on the ground line) to the top of the frame */
const heights = (frames: Record<string, AnimFrame>, names: readonly string[], k: number) => names.map((n) => frames[n].ay * k);

/** every frame's anchor sits on the ground line under the figure */
function anchoredOnGround(name: string, frames: Record<string, AnimFrame>, seqs: Record<string, readonly string[]>) {
  for (const names of Object.values(seqs)) {
    for (const n of names) {
      const f = frames[n];
      assert.ok(f.ay >= f.h - 3 && f.ay <= f.h + 3, `${name} ${n}: the anchor is on the ground line`);
      assert.ok(f.ax > 0 && f.ax < f.w, `${name} ${n}: the anchor is under the figure`);
    }
  }
}

test("Lieutenant Pell's sheet (Meeca's stage): march, idle, the turn-and-look-back tell, a gentle catch and the blanket", () => {
  const want = ['march', 'idle', 'turn', 'lookHold', 'turnBack', 'catch', 'offer'];
  checkSheet('pell', PELL_ANIM_URL, PELL_ANIM_SIZE, PELL_ANIM, PELL_SEQ, want);
  for (const s of want) assert.ok(PELL_SEQ[s].length >= 8, `${s} is a real animation (${PELL_SEQ[s].length} frames)`);
  // the guards' tell is readable: the turn plays at least 0.8 s at 12 fps before he is looking back
  assert.ok(PELL_SEQ.turn.length / 12 >= 0.8, 'the turn is a readable warning');
  // he stands about as tall as Meeca, his feet on the ground line
  assert.ok(Math.abs(PELL_UNITS - MEECA_UNITS) <= 10);
  for (const h of heights(PELL_ANIM, PELL_SEQ.idle, PELL_K / PELL_ANIM_UP)) assert.ok(Math.abs(h - PELL_UNITS) < 0.15 * PELL_UNITS, `idle stands ${h.toFixed(1)} tall`);
  anchoredOnGround('pell', PELL_ANIM, PELL_SEQ);
  const anim = makeCreatureAnim(PELL_ANIM_URL, PELL_ANIM, PELL_SEQ, PELL_ANIM_UP);
  assert.equal(anim.at('offer', 1), PELL_SEQ.offer[PELL_SEQ.offer.length - 1], 'the offer holds its last frame');
  assert.equal(anim.loop('march', PELL_SEQ.march.length / 12, 12), PELL_SEQ.march[0], 'the march loops');
});

test('the blanket stills: the folded blanket and Meeca wrapped in it, at her standard scale', () => {
  const frames = MEECA_BLANKET_FRAMES;
  checkSheet('meeca-blanket', MEECA_BLANKET_URL, MEECA_BLANKET_SIZE, frames, { blanket: ['blanket'], meeca: ['meeca_blanket'] }, ['blanket', 'meeca']);
  // Meeca stands her standard height (stored MEECA_BLANKET_UP times larger); the folded blanket is BLANKET_UNITS wide at that scale
  assert.ok(Math.abs(frames.meeca_blanket.ay / MEECA_BLANKET_UP - MEECA_STAND_H) < 0.05 * MEECA_STAND_H);
  const k = MEECA_UNITS / MEECA_STAND_H / MEECA_BLANKET_UP;
  assert.ok(Math.abs(frames.blanket.w * k - BLANKET_UNITS) < 2);
});

test("the General's soldiers (Meeca's stage): two variants, each with a march, an idle and a look back, bigger than Pell", () => {
  const want = ['a', 'b'].flatMap((v) => ['march', 'idle', 'turn', 'hold', 'back'].map((m) => `${m}_${v}`));
  checkSheet('soldier', SOLDIER_ANIM_URL, SOLDIER_ANIM_SIZE, SOLDIER_ANIM, SOLDIER_SEQ, want);
  for (const s of want) assert.ok(SOLDIER_SEQ[s].length >= 6, `${s} is a real animation (${SOLDIER_SEQ[s].length} frames)`);
  for (const v of ['a', 'b']) assert.ok(SOLDIER_SEQ[`turn_${v}`].length / 12 >= 0.6, `soldier ${v}: the turn is a readable warning`);
  anchoredOnGround('soldier', SOLDIER_ANIM, SOLDIER_SEQ);
  // a different build from Pell's at a glance: they stand taller (same scale, the same cel pixels as his)
  const tall = (frames: Record<string, AnimFrame>, names: readonly string[], k: number) => Math.max(...heights(frames, names, k));
  const pell = tall(PELL_ANIM, PELL_SEQ.idle, PELL_K / PELL_ANIM_UP);
  for (const v of ['a', 'b']) assert.ok(tall(SOLDIER_ANIM, SOLDIER_SEQ[`idle_${v}`], SOLDIER_K / SOLDIER_ANIM_UP) > pell, `soldier ${v} stands taller than Pell`);
});

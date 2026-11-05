/**
 * World 1's new painted pieces (w1NewArt.ts), a stage's drawn water (proto.water) and 1-1's one sky (R-164.2).
 *   npx tsx --test src/game/w1NewArt.test.ts
 */
import './headlessDom.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { W1_NEW_FRAMES, hasW1New } from './w1NewArt.ts';
import { paintedPlatforms } from './protoArt.ts';
import { paintedBank } from './w1Pits.ts';
import { stageSheets } from './stageSheets.ts';
import { stageBackdropStem } from './stageBackdrops.ts';
import { RealPlay } from './realPlay.ts';
import type { Platform } from './types.ts';

test("the sheet's cells are the cutter's own (src/assets/w1to4art/w1-new.json), and the squirrels and hollow logs are among them", () => {
  const json = JSON.parse(fs.readFileSync(new URL('../assets/w1to4art/w1-new.json', import.meta.url), 'utf8'));
  assert.deepEqual(W1_NEW_FRAMES, json);
  for (const n of ['squirrel-sit', 'squirrel-wave', 'squirrel-tip', 'squirrel-haul', 'squirrel-run', 'hollowlog-moss', 'hollowlog-plain']) assert.ok(hasW1New(n), n);
  // (the bootprint, 1-1's clue, has no picture yet: a known art gap, drawn as nothing, never a stand-in)
  assert.equal(hasW1New('bootprint'), false);
});

test("1-1's dressing names pieces the sheet has (bar the clue with no art), and 1-1 preloads the sheet", () => {
  const r = new RealPlay('1-1', 1);
  const dress = (r.e as unknown as { proto?: { mixDress?: Array<{ n: string }> } }).proto?.mixDress ?? [];
  const squirrels = dress.filter((d) => d.n.startsWith('squirrel'));
  assert.ok(squirrels.length >= 3, JSON.stringify(dress));
  for (const d of dress) assert.ok(hasW1New(d.n) || d.n === 'bootprint', d.n);
  assert.ok(stageSheets({ id: '1-1', worldIndex: 1, objectiveType: 'reach_end' as never, secret: undefined }, { hand: true, paint: true, ctest: false }).includes('w1-new'));
});

test('a hollow log is painted by the kit (its own picture), never as a bank of earth or the drawn ground', () => {
  const log = { id: 7, x: 0, y: 900, width: 300, height: 90, type: 'solid', style: 'log', hollow: 'moss' } as Platform;
  assert.ok(paintedPlatforms([log]).has(7), 'the kit paints it, so terrain.ts never does');
  assert.equal(paintedBank(log), false, 'no soil runs down under it');
  const plain = { ...log, hollow: undefined } as Platform;
  assert.equal(paintedBank(plain), true, 'a plain 90 px log is still a bank of earth, as before');
});

test('a lily pad over a stage\'s drawn water sits on its surface, wherever its own top is', () => {
  const r = new RealPlay('1-4', 1);
  const e = r.e as unknown as { proto?: { water?: Array<{ x0: number; x1: number; y: number }> }; lilySurface(p: Platform): number };
  const pad = { id: 3, x: 1000, y: 950, width: 100, height: 12, type: 'solid', lily: true } as Platform;
  const own = e.lilySurface(pad);
  assert.equal(own, 958, 'no water: its own top, as World 2\'s pads');
  if (!e.proto) (e as unknown as { proto: object }).proto = {};
  e.proto!.water = [{ x0: 800, x1: 1400, y: 970 }];
  assert.equal(e.lilySurface(pad), 970, 'on the water');
  e.proto!.water = [{ x0: 2000, x1: 2400, y: 970 }];
  assert.equal(e.lilySurface(pad), 958, 'water elsewhere: its own top');
});

test("1-1 keeps one sky all stage: its sunrise set, and no climb turns the backdrop (R-164.2, Matt 11-04: 'I'd rather just have one sky')", () => {
  assert.equal(stageBackdropStem('1-1'), 'w1sunrise');
  for (const s of [1, 2, 3]) {
    const r = new RealPlay('1-1', s);
    const e = r.e as unknown as { proto?: { rise?: unknown; chase?: unknown }; currentStage: { config: { objectiveType: string } } };
    assert.equal(e.proto?.rise, undefined, `layout ${s}: no rise`);
    assert.ok(!e.proto?.chase && e.currentStage.config.objectiveType !== 'ascent', `layout ${s}: nothing else turns the canopy`);
  }
});

/**
 * World 1's new painted pieces (w1NewArt.ts), a stage's drawn water (proto.water) and 1-1's one sky (R-164.2).
 *   npx tsx --test src/game/w1NewArt.test.ts
 */
import './headlessDom.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { HOLLOW_SHELL, W1_NEW_FRAMES, clearOfHollowLogs, hasW1New, hollowLogSize, insideHollow, padsOffWater, piecesUnderWater } from './w1NewArt.ts';
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
  assert.ok(stageSheets({ id: '1-1', worldIndex: 1, objectiveType: 'reach_end' as never, secret: undefined }, { hand: true, paint: true }).includes('w1-new'));
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
  assert.equal(stageBackdropStem('1-1'), 'w1sun2');
  for (const s of [1, 2, 3]) {
    const r = new RealPlay('1-1', s);
    const e = r.e as unknown as { proto?: { rise?: unknown; chase?: unknown }; currentStage: { config: { objectiveType: string } } };
    assert.equal(e.proto?.rise, undefined, `layout ${s}: no rise`);
    assert.ok(!e.proto?.chase && e.currentStage.config.objectiveType !== 'ascent', `layout ${s}: nothing else turns the canopy`);
  }
});

test("a hollow log is two roads: its top over the floor by 120 or more and its inside clear for Pokey (48 tall), from 310 wide (the designer's split rule)", () => {
  for (const kind of ['moss', 'plain'] as const) {
    const s = hollowLogSize(kind, 310);
    assert.ok(s.height >= 120 && s.clearance >= 56, `${kind} 310: ${JSON.stringify(s)}`);
    assert.equal(s.clearance, s.height - HOLLOW_SHELL);
  }
  // (and he walks through it in the real engine: a floor, the log's shell over it, walking right from one end to the other)
  const r = new RealPlay('1-4', 1);
  const floorY = 1000, { height } = hollowLogSize('moss', 300);
  const log = { id: 2, x: 600, y: floorY - height, width: 300, height: HOLLOW_SHELL, type: 'solid', style: 'log', hollow: 'moss' } as Platform;
  r.bare([{ id: 1, x: 0, y: floorY, width: 2000, height: 120, type: 'solid', style: 'moss_stone' } as Platform, log]);
  r.stand(450, floorY);
  let inside = false;
  for (let i = 0; i < 120 && r.p.x < 1000; i++) {
    r.frame({ right: true });
    if (insideHollow(log, r.p)) inside = true;
  }
  assert.ok(r.p.x >= 1000 && Math.abs(r.p.y - floorY) < 2, `walked through at floor level: x ${Math.round(r.p.x)} y ${Math.round(r.p.y)}`);
  assert.ok(inside, 'inside it on the way');
  // (and its top holds him: the high road)
  r.stand(700, log.y);
  r.wait(0.5);
  assert.ok(Math.abs(r.p.y - log.y) < 2 && r.p.grounded, `stands on its top: y ${r.p.y}`);
});

test("every lily pad a built stage lays is on water: a zone the stage draws, or a river (Matt, 11-05: 'lily pads only on water')", () => {
  const off: string[] = [];
  for (const id of ['1-1', '1-2', '1-3', '1-4', '1-5', '1-6', '1-7', '1-8', '1-9', '2-1', '2-2', '2-3', '2-4', '2-6', '2-8', '2-9']) {
    for (const s of [1, 2, 3]) {
      const r = new RealPlay(id, s);
      const e = r.e as unknown as { proto?: { water?: Array<{ x0: number; x1: number; y: number }> }; currentStage: { rivers?: Array<{ x0: number; x1: number; surfaceY: number }> } };
      const n = padsOffWater(r.platforms, e.proto?.water, e.currentStage.rivers).length;
      if (n) off.push(`${id} layout ${s}: ${n}`);
    }
  }
  assert.deepEqual(off, [], 'pads off the water');
  // (the checker itself: a pad over a zone passes, one beside it fails)
  const pad = { id: 1, x: 100, y: 962, width: 80, height: 12, type: 'solid', lily: true } as Platform;
  assert.equal(padsOffWater([pad], [{ x0: 0, x1: 400, y: 970 }]).length, 0);
  assert.equal(padsOffWater([pad], [{ x0: 300, x1: 400, y: 970 }]).length, 1);
});

test('falling into a drawn water zone splashes once, then the fall goes on', () => {
  const r = new RealPlay('1-4', 1);
  const e = r.e as unknown as { proto: { water?: Array<{ x0: number; x1: number; y: number }> } | null; spawnWaterSplash(x: number, y: number): void };
  const own = e.proto;
  r.bare([{ id: 1, x: 0, y: 1000, width: 300, height: 120, type: 'solid', style: 'moss_stone' } as Platform]);
  e.proto = { ...own, water: [{ x0: 300, x1: 900, y: 1040 }] };
  let splashes = 0;
  const orig = e.spawnWaterSplash.bind(e);
  e.spawnWaterSplash = (x: number, y: number) => {
    splashes++;
    assert.equal(y, 1040, 'at the surface');
    orig(x, y);
  };
  r.fly(500, 900, 0, 0);
  for (let i = 0; i < 40; i++) r.frame();
  assert.equal(splashes, 1);
  assert.ok(r.p.y > 1040 + 60, 'he went on down');
});

test('a drawn water zone is a body of water: its fill goes from its surface to below the stage\'s lowest ground, never a strip over a void', () => {
  const r = new RealPlay('1-4', 1);
  const e = r.e as unknown as { proto: { water?: Array<{ x0: number; x1: number; y: number }> } | null; zonePools(): Array<{ x0: number; x1: number; surfaceY: number; bottomY: number }> };
  e.proto = { ...e.proto, water: [{ x0: 300, x1: 900, y: 1040 }] };
  const [w] = e.zonePools();
  const lowest = Math.max(...r.platforms.map((q) => q.y + q.height));
  assert.equal(w.surfaceY, 1040);
  assert.ok(w.bottomY > lowest, `fills to ${w.bottomY}, under the lowest ground ${lowest}`);
});

test("nothing sits sunk under a stage's drawn water (Matt, 11-05: 'Why are logs underwater?'): every built stage, and the checker itself", () => {
  const sunk: string[] = [];
  for (const id of ['1-1', '1-2', '1-3', '1-4', '1-5', '1-6', '1-7', '1-8', '1-9']) {
    for (const s of [1, 2, 3]) {
      const r = new RealPlay(id, s);
      const e = r.e as unknown as { proto?: { water?: Array<{ x0: number; x1: number; y: number }> } };
      const n = piecesUnderWater(r.platforms, e.proto?.water).length;
      if (n) sunk.push(`${id} layout ${s}: ${n}`);
    }
  }
  assert.deepEqual(sunk, []);
  const zone = [{ x0: 0, x1: 1000, y: 1000 }];
  const P = (id: number, y: number, more: Partial<Platform> = {}) => ({ id, x: 400, y, width: 150, height: 24, type: 'solid', style: 'branch', ...more }) as Platform;
  assert.equal(piecesUnderWater([P(1, 1060)], zone).length, 1, 'a catch branch under the surface');
  assert.equal(piecesUnderWater([P(2, 960, { style: 'moss_stone', height: 50 })], zone).length, 0, 'a stone rising out of it');
  assert.equal(piecesUnderWater([P(3, 992, { lily: true, height: 12 })], zone).length, 0, 'a pad on it');
});

test("bank dressing never stands where a hollow log lies (it drew in the log's mouths)", () => {
  const log = { id: 1, x: 1000, y: 870, width: 300, height: HOLLOW_SHELL, type: 'solid', style: 'log', hollow: 'moss' } as Platform;
  const floor = log.y + hollowLogSize('moss', 300).height;
  const kept = clearOfHollowLogs([{ x: 1150, b: floor }, { x: 1600, b: floor }, { x: 1150, b: floor - 300 }], [log]);
  assert.deepEqual(kept.map((d) => d.x + ',' + d.b), [`1600,${floor}`, `1150,${floor - 300}`]);
});

test("a drawn water zone's kind picks its art (the designer, 11-05): deadly and teaching are the world's murky pit water, calm the swim water; deadly by default", async () => {
  const { waterArt } = await import('./protoStage.ts');
  assert.equal(waterArt(undefined), 'pit');
  assert.equal(waterArt('deadly'), 'pit');
  assert.equal(waterArt('teaching'), 'pit');
  assert.equal(waterArt('calm'), 'calm');
});

/**
 * A river of rafts (R-165.288; ENG-24c): a river row's `look: 'raft'` (gen2/riverLay.ts RiverRow) is the same carrier on the same clock,
 * drawn as a raft, never a log (2-4's raft to the jetty was laid as a long log until this landed, BUILD-24):
 *   - layRiver carries the look onto every carrier's DriftInfo; a log row's carriers are exactly as before (no look at all);
 *   - the judge and the bots read a raft row as the log row it is (riverFaults, lianaDrops: the same numbers);
 *   - drawn: on World 2's painted water a raft is World 2's PAINTED raft (puzzle-kit#raft, the art 2-4.md names), placed as the sluice
 *     rooms place it, its deck the carrier's top (art = collider: the walkable top is its floor), and a log is still the painted log;
 *     where no painted sheet draws (the drawn layer, platformPlan.ts) it is the raft painter (spanArt 'raft'), never turned into a barge
 *     or a pad, and logs keep their river looks;
 *   - loaded before play: a gen2 stage whose kit places a raft row asks for the kit's sheet (stageSheets.ts 'kit-pieces', gen2Rafts);
 *     no stage laid today does, so no stage's sheets change;
 *   - laid by gen2 on a rolled row (rule 23): ENG-24's drop toy over the raft row builds clean on both settings, every carrier a raft.
 */
import './headlessDom.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { layRiver, lianaDrops, riverFaults, type RiverRow } from './gen2/riverLay.ts';
import { GEN2_STAGES, gen2Rafts, laysRafts } from './gen2/game.ts';
import { planStage, type ThinLook } from './platformPlan.ts';
import { drawRiverLog, riverArtReady } from './riverArt.ts';
import { kitArtReady } from './puzzleArt.ts';
import { TIMED } from './physics.ts';
import type { Platform, Vine } from './types.ts';
import { fixtureSeed, kitFor, toyStage, TOY_RIVERS } from '../../tools/inspect/lianaRiverToys.ts';

const RAFT: RiverRow = TOY_RIVERS.raft;
const LOG: RiverRow = { ...RAFT, look: undefined };

test('layRiver carries a raft row\'s look onto every carrier; a log row\'s carriers are exactly as before', () => {
  let id = 1;
  const raft = layRiver(RAFT, 1000, 800, () => id++);
  id = 1;
  const log = layRiver(LOG, 1000, 800, () => id++);
  assert.ok(raft.logs.length >= 2);
  for (const p of raft.logs) assert.equal(p.drift?.look, 'raft');
  for (const p of log.logs) assert.ok(!('look' in p.drift!), 'a log row\'s carrier gained a look key');
  // (the same carriers in every other way: place, size, clock)
  assert.deepEqual(raft.logs.map((p) => ({ ...p, drift: { ...p.drift!, look: undefined } })), log.logs.map((p) => ({ ...p, drift: { ...p.drift!, look: undefined } })));
  assert.deepEqual(raft.zone, log.zone);
});

test('the judge reads a raft row as the log row it is (riverFaults, lianaDrops: the same numbers)', () => {
  let id = 1;
  const raft = layRiver(RAFT, 1000, 800, () => id++);
  const log = layRiver(LOG, 1000, 800, () => id++);
  const bank = (x: number, w: number): Platform => ({ id: id++, x, y: 800, width: w, height: 200, type: 'solid' });
  const st = (r: typeof raft) => ({ platforms: [bank(0, 1000), ...r.logs, bank(r.zone.x1, 600)], rivers: [r.zone] });
  assert.deepEqual(riverFaults(st(raft)), riverFaults(st(log)));
  const v = { id: 50, x: 1165, topY: 390, bottomY: 800, vineType: 'swing_liana', isSwingingVine: true, swingAmp: 0.45, swingPeriod: TIMED.period, swingPhase: 0, swaySpeed: 1, swayPhase: 0 } as unknown as Vine;
  assert.deepEqual(lianaDrops(v, raft.logs.map((p) => p.drift!), 'normal'), lianaDrops(v, log.logs.map((p) => p.drift!), 'normal'));
});

/** a drawing surface that keeps every picture drawn: its file, and where (after the translate it was drawn under) */
function recorder() {
  const draws: Array<{ file: string; x: number; y: number; w: number; h: number }> = [];
  let tx = 0, ty = 0;
  const stack: Array<[number, number]> = [];
  const ctx = {
    save: () => stack.push([tx, ty]),
    restore: () => { [tx, ty] = stack.pop() ?? [0, 0]; },
    translate: (x: number, y: number) => { tx += x; ty += y; },
    scale: () => {}, rotate: () => {},
    drawImage: (img: { src: string }, ...a: number[]) => {
      const [x, y, w, h] = a.length === 8 ? a.slice(4) : a;
      draws.push({ file: String(img.src).split('/').pop() ?? '', x: x + tx, y: y + ty, w, h });
    },
    globalAlpha: 1,
  };
  return { ctx: ctx as unknown as CanvasRenderingContext2D, draws };
}

test('drawn on World 2\'s painted water: a raft is the painted raft (puzzle-kit#raft), its deck the carrier\'s top; a log is still the painted log', async () => {
  // (a picture that loads at once, as a browser's does once the sheet arrives: headlessDom has none)
  class Loaded { onload: (() => void) | null = null; onerror: (() => void) | null = null; naturalWidth = 2048; naturalHeight = 2048; private s = '';
    get src() { return this.s; } set src(v: string) { this.s = v; setTimeout(() => this.onload?.(), 0); } }
  (globalThis as Record<string, unknown>).Image = Loaded;
  riverArtReady();
  kitArtReady();
  await new Promise((r) => setTimeout(r, 20));
  assert.ok(riverArtReady() && kitArtReady(), 'the sheets did not load');
  let id = 1;
  const [raft] = layRiver(RAFT, 1000, 800, () => id++).logs;
  const [log] = layRiver(LOG, 1000, 800, () => id++).logs;
  const a = recorder();
  assert.equal(drawRiverLog(a.ctx, raft, 0), true);
  assert.equal(a.draws.length, 1);
  assert.match(a.draws[0].file, /puzzle-kit/, `a raft drew from ${a.draws[0].file}`);
  // (the painting's deck sits 0.28 of its height down it, puzzlePlay.ts's sluice raft; the bob is 1.5 px either way)
  const d = a.draws[0];
  assert.ok(Math.abs(d.y + d.h * 0.28 - raft.y) <= 1.6, `the raft's deck at ${(d.y + d.h * 0.28).toFixed(1)}, its carrier's top ${raft.y}`);
  assert.ok(Math.abs(d.x + d.w / 2 - (raft.x + raft.width / 2)) < 0.01 && d.w > raft.width && d.w < raft.width * 1.2, 'the raft is not drawn over its carrier');
  const b = recorder();
  assert.equal(drawRiverLog(b.ctx, log, 0), true);
  assert.equal(b.draws.length, 1);
  assert.match(b.draws[0].file, /w2-props/, `a log drew from ${b.draws[0].file}`);
});

test('drawn where no painted sheet draws: a raft is the raft painter, never a barge or a pad; logs keep their river looks; a moving raft keeps its family', () => {
  let id = 1;
  const raft = layRiver(RAFT, 1000, 800, () => id++).logs;
  const log = layRiver({ ...LOG, logs: 4 }, 2400, 800, () => id++).logs;
  const moving: Platform[] = [0, 1, 2].map((i) => ({ id: id++, x: 4400 + i * 300, y: 700, width: 120, height: 24, type: 'moving', moveRange: 80, moveSpeed: 1 }));
  for (const world of [1, 2, 6]) {
    const plan = planStage([...raft, ...log, ...moving], world, 7);
    const look = (p: Platform): ThinLook | undefined => plan.thin.get(p)?.look;
    for (const p of raft) assert.equal(look(p), 'raft', `world ${world}: a raft carrier drawn as ${look(p)}`);
    for (const p of log) assert.ok(['drift', 'canoe', 'reeds'].includes(look(p)!), `world ${world}: a log drawn as ${look(p)}`);
    for (const p of moving) assert.ok(['raft', 'barge', 'pad'].includes(look(p)!), `world ${world}: a moving platform drawn as ${look(p)}`);
  }
});

test('loaded before play: a kit that places a raft row asks for the kit\'s sheet; the log toy does not; no stage laid today does', () => {
  assert.equal(laysRafts(() => kitFor('drop', 'raft')), true);
  assert.equal(laysRafts((d) => kitFor('drop', 'long', d === 'easy' ? 'raft' : 'long')), true, 'an Easy-only raft row');
  assert.equal(laysRafts(() => kitFor('drop', 'long')), false);
  for (const id of Object.keys(GEN2_STAGES)) assert.equal(gen2Rafts(id), false, `${id} lays a raft already: its sheets change with this branch`);
});

test('laid by gen2 on a rolled row (rule 23): the drop toy over the raft row builds clean on both settings, every carrier a raft', () => {
  const seed = fixtureSeed('drop', 'raft');
  assert.ok(seed !== null, 'no roll lays the raft toy clean on both settings');
  for (const d of ['normal', 'easy'] as const) {
    const st = toyStage('drop', 'raft', seed!, d);
    assert.deepEqual(st.gen2.errors ?? [], [], `${d}: ${st.gen2.errors?.join('; ')}`);
    const carriers = st.platforms.filter((p) => p.type === 'drift');
    assert.ok(carriers.length >= 2 && carriers.every((p) => p.drift?.look === 'raft'), `${d}: carriers ${carriers.map((p) => p.drift?.look ?? 'log').join(',')}`);
  }
});

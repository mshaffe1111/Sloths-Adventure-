// R-165.292 planted: the fall-through rule (paintFall.ts) on hand-built stages, read through the engine's own painters (protoArt.ts
// paintedPlatforms, terrain.ts footingOf/terrainLook) with the paint state engine.ts sets (paintStage.ts). Red without the rule's cause,
// green where a painter draws the size; and the repo's look-alikes (D88): pieces with their own art, hollow and pushed logs, a chase
// section, a bounce plant, a crumbling limb and a boss lair, none of which a size can push into code terrain.
import '../../src/game/headlessDom.ts';
// (every sheet "in": the painters decide as they do once the art has loaded; set before the game modules load)
(globalThis as Record<string, unknown>).Image = class {
  onload: null | (() => void) = null;
  onerror: null | (() => void) = null;
  width = 1; height = 1; naturalWidth = 1; naturalHeight = 1; complete = true;
  set src(_u: string) { this.onload?.(); }
  decode() { return { then: (ok: () => void) => ok() }; }
};
import test from 'node:test';
import assert from 'node:assert/strict';
import type { Platform } from '../../src/game/types.ts';

const { stagePaintInput } = await import('./paintStage.ts');
const { paintFalls, ranges, CODE_TERRAIN } = await import('./paintFall.ts');
const { footingOf } = await import('../../src/game/terrain.ts');
const { setGroundPaint, setKitWorld, setGroundLook } = await import('../../src/game/protoArt.ts');

let nid = 1;
/** a stage: a long painted bank (moss_stone, 120 tall) with the pieces under test standing on it, as gen2's `on` blocks stand */
function stage(...pieces: Array<Partial<Platform>>): { platforms: Platform[] } {
  const G = 1000;
  const bank: Platform = { id: nid++, x: 0, y: G, width: 4000, height: 120, type: 'solid', style: 'moss_stone' } as Platform;
  let x = 200;
  const ps = pieces.map((o) => {
    const h = o.height ?? 50;
    const p = { id: nid++, x, y: G - h, width: 240, type: 'solid', style: 'moss_stone', ...o, height: h } as Platform;
    x += 600;
    return p;
  });
  return { platforms: [bank, ...ps] };
}
const W1 = { worldIndex: 1, objectiveType: 'collect' };
const W5 = { worldIndex: 5, objectiveType: 'collect' };
function judge(st: { platforms: Platform[] }, c: { worldIndex: number; objectiveType?: string }) {
  const inp = stagePaintInput(st, c);
  assert.ok(inp, 'the painted kit is on for this stage');
  return paintFalls(st.platforms, inp.f);
}

test('RED: 1-7\'s case, a 53 px landing:true log in World 1, draws as code terrain; its painter (the bank) starts at 90', () => {
  const st = stage({ style: 'log', height: 53, landing: true } as Partial<Platform>);
  const r = judge(st, W1);
  assert.equal(r.breaches.length, 1, JSON.stringify(r));
  const b = r.breaches[0];
  assert.equal(b.style, 'log');
  assert.equal(b.h, 53);
  assert.ok(CODE_TERRAIN.has(b.drawn), b.drawn);
  assert.equal(b.painter, `90-420`);
  assert.equal(b.nearest, 90);
});

test('49 px log: GREEN where the world\'s own kit paints thin pieces (World 5, protoArt.ts paintedPlatforms ownKit && thinKit); RED in World 1, whose kit paints only a branch thin', () => {
  // (the packet's premise "a log paints under 50" is protoArt.ts:1165's `ownKit() && thinKit(p)`: true for a world with its own kit,
  // not World 1, whose thin painter is the branch alone; World 1's thin log is terrain's code sprite, platformArt.ts drawThin)
  const w5 = judge(stage({ style: 'log', height: 49 }), W5);
  assert.equal(w5.breaches.length, 0, JSON.stringify(w5));
  const w1 = judge(stage({ style: 'log', height: 49 }), W1);
  assert.equal(w1.breaches.length, 1, JSON.stringify(w1));
  assert.equal(w1.breaches[0].drawn, 'thin');
});

test('the rock\'s edge (isPaintedRock: a moss stone exactly 50): 50 GREEN, 51 and 49 RED with the painter\'s sizes printed', () => {
  const at50 = judge(stage({ height: 50 }), W1);
  assert.equal(at50.breaches.length, 0, JSON.stringify(at50));
  const at51 = judge(stage({ height: 51 }), W1);
  assert.equal(at51.breaches.length, 1, JSON.stringify(at51));
  assert.equal(at51.breaches[0].painter, '50, 90-420');
  assert.equal(at51.breaches[0].nearest, 50);
  const at49 = judge(stage({ height: 49 }), W1);
  assert.equal(at49.breaches.length, 1, JSON.stringify(at49));
  assert.equal(at49.breaches[0].nearest, 50);
  // (a branch under 50 is World 1's painted thin piece; at 53 it falls to the bank's code terrain too)
  assert.equal(judge(stage({ style: 'branch', height: 24 }), W1).breaches.length, 0);
  assert.equal(judge(stage({ style: 'branch', height: 53 }), W1).breaches.length, 1);
});

test('no painter at all is not a breach (listed as unpainted): no size would paint it, so the size is not the cause; it is missing art', () => {
  // (with the painted ground off, World 1 paints a log at no height: neither the bank painter nor a thin one takes it)
  setKitWorld(1);
  setGroundLook(undefined);
  setGroundPaint(false);
  const st = stage({ style: 'log', height: 53 });
  const inp = stagePaintInput(st, W1)!;
  setGroundPaint(false);
  const r = paintFalls(st.platforms, inp.f);
  // (the log: no breach. The moss bank under it does breach here, at 120: with the ground off its only painter is the 50 px rock)
  assert.ok(!r.breaches.some((b) => b.style === 'log'), JSON.stringify(r));
  assert.ok(r.unpainted.some((u) => u.style === 'log' && u.h === 53), JSON.stringify(r.unpainted));
});

test('a stage whose painted kit is off (a boss lair) is not judged: no painter runs there (engine.ts paintKit)', () => {
  const st = stage({ style: 'log', height: 53 });
  assert.equal(stagePaintInput(st, { worldIndex: 1, objectiveType: 'boss_lair' }), null);
});

test('look-alikes (D88): own art, a hollow log, a pushed log, a chase section, a bounce plant, a crumbling limb and a painted bank never breach', () => {
  const st = stage(
    { style: 'moss_stone', height: 60, art: 'rock' } as Partial<Platform>,
    { style: 'log', height: 124, hollow: true } as Partial<Platform>,
    { style: 'log', height: 60, push: true } as Partial<Platform>,
    { style: 'moss_stone', height: 70, chase: true } as Partial<Platform>,
    { style: 'moss_stone', height: 30, type: 'bouncy' },
    { style: 'branch', height: 24, type: 'fragile', creak: 1.2 } as Partial<Platform>,
    { style: 'moss_stone', height: 140 },
  );
  const r = judge(st, W1);
  assert.equal(r.breaches.length, 0, JSON.stringify(r.breaches));
});

test('the rule reads the screen\'s own decision: every breach is a footing terrain draws by code', () => {
  const st = stage({ style: 'log', height: 53 }, { style: 'moss_stone', height: 70 }, { height: 50 });
  const inp = stagePaintInput(st, W1)!;
  const r = paintFalls(st.platforms, inp.f);
  for (const b of r.breaches) assert.ok(CODE_TERRAIN.has(footingOf(st.platforms.find((p) => p.id === b.id)!, inp.f).drawn));
  assert.deepEqual(r.breaches.map((b) => b.h).sort(), [53, 70]);
});

test('ranges prints whole heights as runs', () => {
  assert.equal(ranges([1, 2, 3, 50, 90, 91, 92]), '1-3, 50, 90-92');
  assert.equal(ranges([]), '');
});

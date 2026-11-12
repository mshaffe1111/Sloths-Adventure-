// A find spot (the lead's FX packet, 11-12): the stage's find (finds.ts: Meeca's note in World 1's 2nd stage, a keepsake) was put by
// addFinds on any low ledge by a hash (1-2 seed 1: the lesson's lip, where its card broke into the first chain). A brick may carry a
// 'findSpot' socket: the first one laid holds it (ProtoExtras.findSpot, pipeline fillSockets), and addFinds puts the stage's find there,
// every roll; a stage whose bricks mark none places it as before. No stage id in engine code: the mark is section data.
import test from 'node:test';
import assert from 'node:assert/strict';
import '../headlessDom.ts';
import { buildGen2Stage } from './pipeline.ts';
import { listedStage } from './listed.ts';
import { generateAllLevels } from '../worldsData.ts';
import { addFinds } from '../stageGenerator.ts';
import { findForStage } from '../finds.ts';
import type { GeneratedStage } from '../stageGenerator.ts';
import type { WorldKit } from './types.ts';

const cfg11 = () => generateAllLevels().find((l) => l.id === '1-1')!;

test('a brick\'s findSpot socket: the first one laid holds the stage\'s find spot, and the stage is otherwise the same roll', () => {
  const base = listedStage('1-1')!.kit;
  /** the same kit with a findSpot socket on every brick's first piece, after its own sockets (each socket rolls from its own stream) */
  const marked = (): WorldKit => {
    const k = base();
    return { ...k, manifest: { ...k.manifest, sections: k.manifest.sections.map((t) => ({ ...t, sockets: [...t.sockets, { id: 'fs', role: 'findSpot' as const, on: t.pieces[0].key, t: 0.5 }] })) } };
  };
  for (const difficulty of ['normal', 'easy'] as const) for (const seed of [1, 2]) {
    const plain = buildGen2Stage({ config: cfg11(), kit: base(), seed, difficulty });
    const st = buildGen2Stage({ config: cfg11(), kit: marked(), seed, difficulty });
    assert.equal(plain.proto?.findSpot, undefined, 'no brick marks one today: no spot');
    const fs = st.gen2.fills.filter((f) => f.role === 'findSpot');
    assert.equal(fs.length, 1, `${difficulty} seed ${seed}: one spot a stage (${fs.length})`);
    const spot = st.proto?.findSpot;
    assert.ok(spot, `${difficulty} seed ${seed}: the spot is recorded`);
    assert.equal(spot.x, Math.round(fs[0].x));
    assert.ok(st.platforms.some((p) => p.y === spot.b && p.x <= spot.x && p.x + p.width >= spot.x), 'the spot stands on a laid piece\'s top');
    assert.equal(fs[0].section, st.gen2.sections[0].uid, 'the first brick laid holds it');
    assert.deepEqual(st.platforms, plain.platforms, 'the roll is otherwise the same');
    assert.deepEqual(st.checkpoints, plain.checkpoints);
  }
});

test('addFinds: the stage\'s find stands at its marked spot; with none, the hashed ledge as before (planted, World 1\'s 2nd stage, the note)', () => {
  const config = generateAllLevels().find((l) => l.worldIndex === 1 && l.miniIndex === 2 && !l.secret)!;
  const find = findForStage(1, 2)!;
  assert.ok(find, 'World 1\'s 2nd stage holds a find');
  const make = (findSpot?: { x: number; b: number }) => ({
    config, spawnX: 100, exitTotemX: 5000, checkpoints: [], enemies: [], vines: [], ropes: [],
    platforms: [{ id: 1, x: 0, y: 900, width: 5200, height: 200, type: 'solid' }, { id: 2, x: 2000, y: 760, width: 400, height: 40, type: 'solid' }],
    collectibles: [{ id: 7, type: 'flower', x: 300, y: 860, collected: false, bobPhase: 0 }],
    ...(findSpot ? { proto: { findSpot } } : {}),
  }) as unknown as GeneratedStage;
  const marked = make({ x: 2150, b: 760 });
  addFinds(marked, [1, 2]);
  const f = marked.collectibles.filter((c) => c.type === 'find');
  assert.deepEqual(f.map((c) => [c.x, c.y, c.findId, c.id]), [[2150, 734, find.id, 8]], 'at the spot, 26 px over its top');
  const plain = make();
  addFinds(plain, [1, 2]);
  const g = plain.collectibles.filter((c) => c.type === 'find');
  assert.equal(g.length, 1, 'placed as before');
  const on = plain.platforms.find((p) => p.y - 26 === g[0].y && p.x <= g[0].x && g[0].x <= p.x + p.width)!;
  assert.ok(on && (g[0].x - on.x - 70) % 80 === 0, 'on one of the old rule\'s spots (every 80 px along a reachable ledge)');
});

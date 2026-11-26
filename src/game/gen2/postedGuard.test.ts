/**
 * The posted royal guard (ENG-29-e G2; PICKS-29-32.md, the lead's rulings (1), (4), (5)): World 2's cast row W2_POSTED_GUARD, laid only by an
 * enemy socket that names it, where it stands, on both settings; he holds his post facing the nearest river's water (Enemy.post), and he is
 * no foe of the goal (Enemy.uncounted): the goal's count (goals.ts goalCounts), the engine's count (the sealed exit, the HUD) never read
 * him. Built on the tempo toy (2-4's court pieces, w2TempoToy.ts), a socket on the stones' near bank naming the row (the far bank holds a flag: a guard there is refused, SAFE_APPROACH). Each way: the count
 * with and without the field; the row in a world's list re-deals nothing when no socket names it.
 */
import '../headlessDom.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import { buildGen2Stage, postFacing } from './pipeline.ts';
import { listedStage, withTestStage } from './listed.ts';
import { generateAllLevels } from '../worldsData.ts';
import { TEMPO_ID, tempoCfg, tempoKit, tempoRow } from './worlds/w2TempoToy.ts';
import { W2_POSTED_GUARD } from './worlds/w2Cast.ts';
import { goalCounts } from '../goals.ts';
import { patrolWalk } from '../enemyBrain.ts';
import { RealPlay } from '../realPlay.ts';
import { loadSeedList } from './seedList.ts';
import { setDifficulty } from '../difficulty.ts';
import type { Enemy } from '../types.ts';
import type { CreatureDef, SectionTemplate, Socket, WorldKit } from './types.ts';

/** the toy's kit with the posted row in its creatures; `socket`: the stones' near bank holds a socket naming it */
function kit(socket: boolean): WorldKit {
  const k = tempoKit(), M = k.manifest;
  const sections = M.sections.map((s) => (s.id !== 'toy-court-stones' || !socket ? s : {
    // (its near bank made 900 px long: the toy's 360 px bank lies inside its flag's reach, SAFE_APPROACH)
    ...s, pieces: s.pieces.map((q) => (q.key === 'in' ? { ...q, w: [900, 900] } : q)),
    sockets: [...s.sockets, { id: 'post', role: 'enemy', on: 'in', t: [0.9, 0.9], allow: [W2_POSTED_GUARD.id] }],
  } as SectionTemplate));
  return { ...k, manifest: { ...M, sections, creatures: [...M.creatures, W2_POSTED_GUARD] } } as WorldKit;
}
const build = (k: WorldKit, seed: number, difficulty: 'normal' | 'easy') =>
  withTestStage({ [TEMPO_ID]: { ...tempoRow(), kit: () => k } }, () => buildGen2Stage({ config: tempoCfg(), kit: k, seed, difficulty }));
const posts = (st: { enemies: Enemy[] }) => st.enemies.filter((e) => e.post);

test('the posted guard: laid where its socket stands on both settings, a royal holding his post facing the nearest river, out of the goal count', () => {
  for (const d of ['normal', 'easy'] as const) for (const seed of [1, 2]) {
    const at = `${d} seed ${seed}`;
    const st = build(kit(true), seed, d);
    assert.deepEqual(st.gen2.errors, [], at);
    const [g, ...more] = posts(st);
    assert.ok(g && !more.length, `${at}: one posted guard`);
    assert.ok(g.royal && g.uncounted && g.type === 'turtle' && g.hp === 2, `${at}: the royal guard's body, uncounted`);
    assert.equal(g.patrolMinX, g.x, `${at}: no patrol`);
    assert.equal(g.patrolMaxX, g.x, `${at}: no patrol`);
    assert.equal(g.post, postFacing(st.rivers ?? [], g.x, -1), `${at}: he faces the nearest river's water`);
    assert.equal(g.facing, g.post, at);
    // (the count each way: with the field he is not the goal's; the same stage with it cleared counts him)
    const n = goalCounts(st).animals;
    assert.equal(n, st.enemies.length - 1, `${at}: every foe but the guard`);
    assert.equal(goalCounts({ ...st, enemies: st.enemies.map((e) => (e.post ? { ...e, uncounted: undefined } : e)) }).animals, n + 1, `${at}: without the field he counts`);
  }
});

test('the posted row in a world\'s list moves no foe: on 2-5 (snappers from the bag), with no socket naming it, every foe is laid as before (a guard: 2-5\'s sockets all name their rows, so it stays green with castRows\' exclusion removed too)', () => {
  const row = listedStage('2-5')!, cfg = generateAllLevels().find((c) => c.id === '2-5' && !c.secret)!;
  const withPosted = (): WorldKit => { const k = row.kit(); return { ...k, manifest: { ...k.manifest, creatures: [...k.manifest.creatures, W2_POSTED_GUARD] } } as WorldKit; };
  const sig = (st: { enemies: Enemy[] }) => st.enemies.map((e) => `${e.type}@${e.x},${e.y}`).join(' ');
  for (const d of ['normal', 'easy'] as const) for (const seed of [1, 2]) {
    const plain = buildGen2Stage({ config: cfg, kit: row.kit(), seed, difficulty: d });
    const more = buildGen2Stage({ config: cfg, kit: withPosted(), seed, difficulty: d });
    assert.ok(plain.enemies.length >= 3, `${d} seed ${seed}: 2-5 deals snappers (${plain.enemies.length})`);
    assert.equal(sig(more), sig(plain), `${d} seed ${seed}`);
    assert.equal(posts(more).length, 0);
  }
});

/** the toy's kit with OPEN enemy sockets (naming no row) on the stones' near bank and a bag holding a plain turtle; `posted`: the posted
 *  row in the world's list too (no socket names it) */
function openKit(posted: boolean): WorldKit {
  const k = tempoKit(), M = k.manifest;
  const turtle: CreatureDef = { id: 'toy-turtle', enemy: 'turtle', terrain: 'flat', minGround: 60, w: 48, h: 24, hp: 1, footY: 14, threat: 1 };
  const open = (id: string, t: number): Socket => ({ id, role: 'enemy', on: 'in', t, dn: 0, easy: 'stay', chance: 1, maxThreat: 3 });
  const sections = M.sections.map((s) => (s.id !== 'toy-court-stones' ? s : {
    ...s, pieces: s.pieces.map((q) => (q.key === 'in' ? { ...q, w: [900, 900] } : q)),
    sockets: [...s.sockets, open('o1', 0.15), open('o2', 0.45)],
  } as SectionTemplate));
  return { ...k, manifest: { ...M, sections, creatures: [turtle, ...(posted ? [W2_POSTED_GUARD] : [])] } } as WorldKit;
}

test('the bag never deals the posted row: open enemy sockets (naming no row) over a bag holding the turtle lay the same foes with the posted row in the world\'s list, and never a royal off his post (RED with castRows\' exclusion removed)', () => {
  const sig = (st: { enemies: Enemy[] }) => st.enemies.map((e) => `${e.type}${e.royal ? '-royal' : ''}@${e.x},${e.y}`).join(' ');
  let dealt = 0;
  for (const d of ['normal', 'easy'] as const) for (const seed of [1, 2, 3, 4]) {
    const at = `${d} seed ${seed}`;
    const plain = build(openKit(false), seed, d), more = build(openKit(true), seed, d);
    assert.deepEqual(more.gen2.errors, [], at);
    if (d === 'normal') assert.ok(plain.enemies.length >= 1, `${at}: the open sockets deal a turtle`);
    dealt += plain.enemies.length;
    assert.ok(more.enemies.every((e) => !e.royal && !e.uncounted && !e.post), `${at}: the bag dealt the posted row (${sig(more)})`);
    assert.equal(sig(more), sig(plain), `${at}: one more row in the list re-dealt the open sockets`);
  }
  assert.ok(dealt >= 5, `the open sockets deal turtles (${dealt} over 8 builds)`);
});

test('postFacing: toward the nearest river; inside or with none, the row\'s own way', () => {
  const R = [{ x0: 1000, x1: 1400 }, { x0: 3000, x1: 3300 }];
  assert.equal(postFacing(R, 1500, 1), -1, 'just past the first river: back at it');
  assert.equal(postFacing(R, 2900, -1), 1, 'just before the second: toward it');
  assert.equal(postFacing(R, 1200, 1), 1);
  assert.equal(postFacing([], 500, -1), -1);
});

test('patrolWalk: a posted sentry holds his ground facing his way; the same body unposted walks its patch', () => {
  const body = (): Enemy => ({ id: 1, type: 'turtle', x: 500, y: 0, vx: 0, vy: 0, width: 36, height: 66, hp: 2, maxHp: 2, facing: 1, patrolMinX: 500, patrolMaxX: 500, attackCooldown: 1, telegraphTimer: 0, isAttacking: false, animTimer: 0, hitFlashTimer: 0, defeated: false, koTimer: 0, behaviorTimer: 0 } as Enemy);
  const g = { ...body(), post: -1 as const };
  const faced: number[] = [];
  for (let i = 0; i < 30; i++) { patrolWalk(g, 1 / 30, 40); faced.push(g.facing); }
  assert.equal(g.x, 500);
  assert.equal(g.vx, 0);
  assert.ok(faced.every((f) => f === -1), 'never turns while calm');
  const w = body(), wf: number[] = [];
  for (let i = 0; i < 30; i++) { patrolWalk(w, 1 / 30, 40); wf.push(w.facing); }
  assert.ok(new Set(wf).size === 2 && w.vx !== 0, 'unposted, the same patch of none walks and turns every frame (what Enemy.post is for)');
});

test('the engine: a foe marked uncounted, beaten, moves no count; the same foe without the field counts one (2-5\'s sleeper kicked off)', async () => {
  await loadSeedList('2-5');
  setDifficulty('normal');
  for (const uncounted of [true, false]) {
    const sim = new RealPlay('2-5', 1) as RealPlay & { e: { enemies: Enemy[] } };
    sim.safe = false;
    sim.p.invincibleTimer = 0;
    const e = sim.e.enemies.filter((x) => x.type === 'turtle').sort((a, b) => a.x - b.x)[0];
    assert.ok(e?.asleep, 'the first snapper sleeps');
    if (uncounted) e.uncounted = true;
    sim.stand(e.x - 40, e.y + e.height / 2 + 14);
    sim.p.facing = 1;
    for (let f = 0; f < 10; f++) sim.frame();
    sim.frame({ kick: 1 });
    for (let f = 0; f < 30 * 6 && !(e.kit?.leaving || e.defeated); f++) sim.frame();
    assert.ok(e.kit?.leaving || e.defeated, 'he is beaten');
    assert.equal(sim.p.enemiesDefeated, uncounted ? 0 : 1, uncounted ? 'uncounted: no count' : 'counted: one');
  }
  setDifficulty('normal');
});

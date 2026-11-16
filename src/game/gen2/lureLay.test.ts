/**
 * CAST-WORLDS (ENGINE-NEEDS.md §2 packet 3): the predator registry by world, lure targets as sockets, landing noise by stage data.
 * Each rule with a planted fault (reference/qa-reports/PIECES/planted-faults.py); the lure proven on three worlds' animals (the boa
 * and the eagle's roost, the tayra and the caiman's water, the night harpy and the owl's light) and laid through the real pipeline.
 */
import '../headlessDom.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import { CastPlay, type CastHero } from '../castPlay.ts';
import type { CastData } from '../castPlay.types.ts';
import { LOUD } from '../heroNoise.ts';
import { newPredator } from '../predators/core.ts';
import { LURE, stepLures, type LurePost } from '../predators/lure.ts';
import { BY_WORLD, CASTS_AFTER_1, castDef, castKinds, castRow } from '../predators/registry.ts';
import { CASTS } from '../predators/roster.ts';
import type { PredatorDef } from '../predators/types.ts';
import { SNAKE, WORLD1 } from '../predators/world1.ts';
import { CAIMAN } from '../predators/world2.ts';
import { TAYRA } from '../predators/world6.ts';
import type { Enemy, Platform } from '../types.ts';
import { buildGen2Stage } from './pipeline.ts';
import { cfg, kit as toyKit, manifest as toyManifest } from './toyWorld.ts';
import type { SectionTemplate, WorldKit } from './types.ts';
import { LURE_TAG, lureEmitters, lureFaults, lureProps, lureSocket, lureTag, type LureRow } from './lureLay.ts';

// ───────────────────────────── the registry, by world ─────────────────────────────

test('the registry by world: a stage may name an animal from its own world or one before it, never one still ahead', () => {
  assert.deepEqual(castKinds(1), ['snake', 'boa', 'eagle']);
  assert.equal(castDef('tayra', 2), undefined, 'the tayra is not met until the mangrove');
  assert.equal(castDef('tayra', 6)?.kind, 'tayra');
  assert.equal(castRow('caiman', 6), CAIMAN, "the mangrove's caiman plays from the river's row until the mangrove writes its own");
  assert.equal(castRow('snake', 9), SNAKE);
  assert.equal(castDef('nobody', 9), undefined);
  assert.equal(castDef('snake', 0), undefined);
  assert.equal(CASTS_AFTER_1.length, 10);
  assert.deepEqual(BY_WORLD[0], WORLD1);
});

test("the registry by world: a later world's own row wins from that world on, and only from then", () => {
  const tuned: PredatorDef = { ...TAYRA, engage: 123 };
  const table = [[], [TAYRA], [], [tuned]];
  assert.equal(castRow('tayra', 1, table), undefined);
  assert.equal(castRow('tayra', 2, table), TAYRA);
  assert.equal(castRow('tayra', 3, table), TAYRA);
  assert.equal(castRow('tayra', 4, table), tuned);
  assert.equal(castRow('tayra', 9, table), tuned);
});

test("the registry agrees with the roster: every animal with a row is nameable in each world whose cast lists it, and its row sits in the first of them", () => {
  const rowWorld = new Map<string, number>();
  BY_WORLD.forEach((rows, i) => rows.forEach((d) => rowWorld.has(d.kind) || rowWorld.set(d.kind, i + 1)));
  for (const [kind, at] of rowWorld) {
    const worlds = Object.keys(CASTS).map(Number).filter((w) => (CASTS[w] as readonly string[]).includes(kind));
    assert.ok(worlds.length, `${kind} is in some world's cast`);
    assert.equal(at, Math.min(...worlds), `${kind}'s row is in the world that first casts it`);
    for (const w of worlds) assert.equal(castDef(kind, w)?.kind, kind, `${kind} in world ${w}`);
  }
});

// ───────────────────────────── the lure target at run time ─────────────────────────────

const G = 400;
/** an animal after him (`phase` 'rest': on its own rounds) */
const state = (def: PredatorDef, x: number, y = G, phase: 'hunt' | 'tell' | 'act' | 'rest' = 'hunt') => {
  const s = newPredator(def, { x, y, minX: x - 60, maxX: x + 60, facing: 1 });
  s.phase = phase;
  return { def, s };
};
const post = (x: number, fear: string, reach = 90, y = G): LurePost => ({ x, y, fear, reach });

for (const [world, kind, fear, what] of [[1, 'boa', 'eagle', "the eagle's roost"], [6, 'tayra', 'caiman', "the caiman's water"], [8, 'harpy', 'owl', "the owl's light"]] as const) {
  test(`a lure target in world ${world}: the ${kind} drawn to ${what} while it is after him is chased off; on its own rounds, out of reach, on another level, or before something it does not fear, it is not`, () => {
    const def = castDef(kind, world)!;
    assert.ok(def.beatenBy.lure, `the ${kind} can be lured in world ${world}`);
    const near = state(def, 500);
    assert.equal(stepLures([near], [post(560, fear)], 1), 1);
    assert.equal(near.s.beatenBy, 'lure');
    assert.ok(near.s.leaving || near.s.phase === 'flee', 'it runs');
    assert.equal(stepLures([near], [post(560, fear)], 1.1), 0, 'once');
    assert.equal(stepLures([state(def, 500)], [post(600, fear)], 1), 0, 'out of reach (100 px, the reach is 90)');
    assert.equal(stepLures([state(def, 500, G, 'rest')], [post(560, fear)], 1), 0, 'on its own rounds it takes no notice: he does the luring');
    for (const ph of ['tell', 'act'] as const) assert.equal(stepLures([state(def, 500, G, ph)], [post(560, fear)], 1), 1, `in its ${ph}`);
    assert.equal(stepLures([state(def, 500)], [post(560, fear, 90, G + LURE.tall + 10)], 1), 0, 'a level below');
    assert.equal(stepLures([state(def, 500)], [post(560, 'moth')], 1), 0, 'a thing it does not fear');
    assert.equal(stepLures([state(castDef('snake', world)!, 500)], [post(560, fear)], 1), 0, 'an animal that fears nothing');
  });
}

test('the move ladder holds for a target too: where nothing the tayra fears is about (World 9), the same target does nothing to it', () => {
  const def = castDef('tayra', 9)!;
  assert.equal(def.beatenBy.lure, undefined);
  assert.equal(stepLures([state(def, 500)], [post(560, 'caiman')], 1), 0);
});

const DT = 1 / 30;
const bank = { id: 1, x: 0, y: G, width: 1200, height: 60, type: 'solid' } as Platform;
const beast = (type: string, x: number, over: Partial<Enemy> = {}): Enemy => ({
  id: 500, type, x, y: G - 14, vx: 0, vy: 0, width: 44, height: 28, hp: 1, maxHp: 1, facing: 1, patrolMinX: x - 50, patrolMaxX: x + 50,
  attackCooldown: 0, telegraphTimer: 0, isAttacking: false, animTimer: 0, hitFlashTimer: 0, defeated: false, koTimer: 0, behaviorTimer: 0, ...over,
} as Enemy);
const hero = (over: Partial<CastHero> = {}): CastHero => ({ x: 100, y: G, vx: 0, vy: 0, facing: -1, grounded: true, holding: false, ...over });
function play(c: CastPlay, seconds: number, at: (t: number) => CastHero) {
  const seen = { cleared: 0, hit: 0, woke: 0, landed: 0 };
  for (let i = 0, t = 0; i < Math.round(seconds / DT); i++, t += DT) {
    const h = at(t), r = c.step(h, DT, t, false);
    seen.cleared += r.cleared.length;
    seen.woke += r.woke;
    if (r.landed) seen.landed++;
    if (r.hurts.some((q) => h.x >= q.box.x - 16 && h.x <= q.box.x + q.box.w + 16)) seen.hit++;
  }
  return seen;
}

test('in the engine\'s cast (CastPlay): he stands beyond the caiman\'s water at the end of the tayra\'s line; it charges, comes into the water\'s reach and is chased off; with no target it charges on and comes back for more', () => {
  const run = (lures?: LurePost[]) => {
    const t = beast('tayra', 200);
    const c = new CastPlay({ kinds: ['tayra'], traps: [], ...(lures ? { lures } : {}) }, [t], [bank], 6);
    const seen = play(c, 6, () => hero({ x: 470 }));
    return { ...seen, phase: t.kit!.phase, leaving: t.kit!.leaving };
  };
  // (its patch is 150-250; the water stands 50 px past its end with a 70 px reach: met only at the end of a charge, never from where it starts)
  const lured = run([post(300, 'caiman', 70)]);
  assert.equal(lured.cleared, 1, 'chased off at the water');
  const bare = run();
  assert.equal(bare.cleared, 0, 'the control: with no target it is still there');
  assert.equal(bare.leaving, false);
  // the same target on its rounds only (he is nowhere near): it walks its patch end to end and takes no notice
  const t = beast('tayra', 200);
  const c = new CastPlay({ kinds: ['tayra'], traps: [], lures: [post(300, 'caiman', 70)] }, [t], [bank], 6);
  assert.equal(play(c, 12, () => hero({ x: 1100 })).cleared, 0, 'unprompted, it never runs');
  assert.ok(t.kit!.x !== 200, 'and it did walk its patch');
});

test('landing noise by stage data: a stage that says so hears his hard landings whatever its world; one that says no does not; unsaid, the move ladder decides', () => {
  const fall = (data: Partial<CastData>, world: number) => {
    const z = beast('snake', 600, { asleep: true, width: 38, height: 22 });
    const c = new CastPlay({ kinds: ['snake'], traps: [], ...data }, [z], [bank], world);
    const r = play(c, 1.2, (t) => (t < 0.5 ? hero({ x: 420, y: G - LOUD.landing.soft - 80, grounded: false, vy: 300 }) : hero({ x: 420 })));
    return { landed: r.landed, woke: r.woke, asleep: !!z.kit!.asleep };
  };
  assert.deepEqual(fall({ landing: true }, 1), { landed: 1, woke: 1, asleep: false }, "a World 1 stage that teaches quiet feet (1-7's row)");
  assert.deepEqual(fall({}, 1), { landed: 0, woke: 0, asleep: true }, 'World 1 unsaid: the ladder (quiet feet are World 2\'s)');
  assert.deepEqual(fall({}, 2), { landed: 1, woke: 1, asleep: false }, 'World 2 unsaid: heard');
  assert.deepEqual(fall({ landing: false }, 2), { landed: 0, woke: 0, asleep: true }, 'a stage that turns it off');
});

// ───────────────────────────── laid from data, and held fair ─────────────────────────────

const ROWS: Record<string, LureRow> = { owlLight: { fear: 'owl', reach: 90, looks: ['lanternA', 'lanternB'] }, stillPool: { fear: 'caiman', reach: 70 } };

test("a world's lure table gives its props by tag, and a section's socket asks for any target or for the one that stands for a kind", () => {
  assert.deepEqual(lureProps(ROWS), [
    { id: 'owlLight', tags: ['lure', 'lure-owl'], w: 80, minApart: 600, beat: true, looks: ['lanternA', 'lanternB'] },
    { id: 'stillPool', tags: ['lure', 'lure-caiman'], w: 80, minApart: 600, beat: true },
  ]);
  assert.deepEqual(lureSocket('to', 'bank', 0.7), { id: 'to', role: 'prop', on: 'bank', t: 0.7, allow: [LURE_TAG] });
  assert.deepEqual(lureSocket('to', 'bank', 0.7, 'owl').allow, [lureTag('owl')]);
});

const plats = [bank, { id: 3, x: 0, y: G + 300, width: 2000, height: 60, type: 'solid' } as Platform];
const stage = (enemies: Enemy[], lures: LurePost[], kinds = ['tayra', 'harpy', 'snake']) => ({ enemies, platforms: plats, cast: { kinds, lures } });

test('the fairness check names each planted fault, and passes the same target laid fair', () => {
  const tayra = beast('tayra', 200);
  assert.deepEqual(lureFaults(stage([tayra], [post(300, 'caiman', 70)]), 6), []);
  // planted: nothing in the cast fears it here (no such animal; the wrong fear; a world where the ladder has taken the lure off it)
  assert.deepEqual(lureFaults(stage([beast('snake', 200)], [post(300, 'caiman', 70)]), 6), ['lure target at 300 (caiman): nothing in the cast fears it here']);
  assert.match(lureFaults(stage([tayra], [post(300, 'owl', 70)]), 6)[0], /nothing in the cast fears it here/);
  assert.match(lureFaults(stage([tayra], [post(300, 'caiman', 70)]), 9)[0], /nothing in the cast fears it here/);
  assert.match(lureFaults(stage([tayra], [post(300, 'caiman', 70)], ['snake']), 6)[0], /nothing in the cast fears it here/, 'an animal the brief does not cast is not run by the kit');
  // planted: further along than its patch brings it (it patrols 150-250; the reach is 70), and on another level
  assert.deepEqual(lureFaults(stage([tayra], [post(330, 'caiman', 70)]), 6),
    ['lure target at 330 (caiman): no animal that fears it can be drawn to it', 'tayra at 200: its first way here is the lure, with nothing to lure it to']);
  assert.deepEqual(lureFaults(stage([tayra], [post(320, 'caiman', 70)]), 6), [], 'at the edge of its reach it can');
  assert.match(lureFaults(stage([tayra], [post(300, 'caiman', 70, G + 300)]), 6).join(), /no animal that fears it can be drawn to it/);
  // planted: where the animal starts
  assert.deepEqual(lureFaults(stage([tayra], [post(240, 'caiman', 70)]), 6), ['lure target at 240 (caiman): the tayra starts inside its reach (at 200), and would run the moment it noticed him']);
  // planted: an animal whose first way is the lure, with nothing to lure it to; a caiman in the stage is something to lure it to
  assert.deepEqual(lureFaults(stage([tayra], []), 6), ['tayra at 200: its first way here is the lure, with nothing to lure it to']);
  assert.deepEqual(lureFaults(stage([tayra, beast('caiman', 900)], [], ['tayra', 'caiman']), 6), []);
});

const baited: SectionTemplate = {
  id: 'toy-baited', name: 'the light on the bank', archetypes: 'any', phases: ['start', 'rest', 'ki', 'sho', 'ten', 'ketsu', 'goal'], difficulty: 1,
  pieces: [{ key: 'bank', shape: 'bank', w: [900, 1100], place: { kind: 'start' } }],
  entry: { piece: 'bank', kind: 'ground' }, exit: { piece: 'bank', kind: 'ground' }, exitDy: 0,
  sockets: [lureSocket('to', 'bank', 0.75, 'owl')],
  mirrorable: false, weight: 9,
};
const lureKit = (): WorldKit => ({
  manifest: { ...toyManifest, sections: [...toyManifest.sections, baited], props: [...toyManifest.props, ...lureProps(ROWS)] },
  emit: { ...toyKit.emit, ...lureEmitters(ROWS, (out, at) => void ((out.extras.lights ??= []) as unknown[]).push(at)) },
});

test('laid through the real pipeline (the toy world, 8 seeds, both settings): the socket lays its target into the stage\'s cast on the ground it stands on, and the world is told its look', () => {
  let laid = 0;
  for (const d of ['normal', 'easy'] as const) for (let seed = 1; seed <= 8; seed++) {
    const st = buildGen2Stage({ config: cfg('5-7', 'stealth'), kit: lureKit(), seed, difficulty: d });
    const lures = st.proto.cast?.lures ?? [];
    laid += lures.length;
    for (const p of lures) {
      assert.deepEqual([p.fear, p.reach], ['owl', 90], 'the socket asked for the owl\'s, never the pool');
      assert.ok(st.platforms.some((q) => Math.abs(q.y - p.y) < 1 && p.x >= q.x && p.x <= q.x + q.width), `seed ${seed}: the target at ${p.x} stands on ground`);
    }
    const lights = ((st.proto.gen2 as { lights?: Array<{ x: number; look: string }> } | undefined)?.lights ?? []);
    assert.deepEqual(lights.map((l) => l.x), lures.map((p) => p.x));
    for (const l of lights) assert.match(l.look, /^lantern[AB]$/);
    // (the toy world casts nothing: the check says the target promises a trick nothing can play)
    for (const f of lureFaults({ enemies: st.enemies, platforms: st.platforms, cast: st.proto.cast }, 8)) assert.match(f, /nothing in the cast fears it here/);
  }
  assert.ok(laid >= 8, `targets laid: ${laid}`);
});

/**
 * THE CALL on a REAL World 3 row (ENG-LURE, 3-3.md NEW 1; level.md rules 21, 23): one chime stone, one 6.4/2.6 spore patch and one
 * ocelot, laid by gen2 from World 3's OWN rows (w3.ts W3_SOUNDS 'w3-chime', W3_LURE 'w3-patch', W3_CAST's ocelot) on 3-1's DRAFT row
 * (World 3's own kit, going down, as w3Noise.test.ts lays it), readied as the tools ready it and played in the real engine at 30 fps
 * (realPlay.ts). The toy adds ONE test-only section to the row's pool, here only.
 *   - rung, cleared: the punch rings the stone, the ocelot comes to look under it, and on the patch's cloud it yawns home (its 'lure',
 *     chasedOff), taken only once the cloud has been out over DROWSY_MIN for 0.3 s (plant: the clock gate off -> taken with no cloud: RED);
 *   - the stone silent -> it never comes, and is never taken (RED against the first);
 *   - one ring per call: rung again while its call is out the stone hums and makes no sound; once the animal is back, it rings again.
 */
import '../../headlessDom.ts';
import { readied, readyDraft } from '../../../../tools/engine/draft.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateAllLevels } from '../../worldsData.ts';
import { buildGen2Stage, keptFoes } from '../pipeline.ts';
import { LISTED } from '../listed.ts';
import { packPlan, plantSeedList } from '../seedList.ts';
import { soundSocket } from '../soundLay.ts';
import { lureSocket } from '../lureLay.ts';
import { RealPlay } from '../../realPlay.ts';
import { setDifficulty } from '../../difficulty.ts';
import { castDef } from '../../predators/registry.ts';
import { LURE } from '../../predators/lure.ts';
import { newFall, type FallState } from '../../heroNoise.ts';
import { zoneEffect, type Zone } from '../../zones.ts';
import type { CastPlay } from '../../castPlay.ts';
import type { LurePost } from '../../predators/lure.ts';
import type { SoundPost } from '../../castPlay.types.ts';
import type { CreatureDef, SectionTemplate, WorldKit } from '../types.ts';
import type { Enemy, LevelConfig, Platform } from '../../types.ts';
import { W3_CAST } from './w3.ts';

const DRAFT = '3-1';
if (readied !== DRAFT) readyDraft(DRAFT);
const cfg: LevelConfig = { ...generateAllLevels().find((c) => c.id === DRAFT && !c.secret)!, unlocked: true };
const realKit = LISTED[DRAFT].kit;
const W3_OCELOT = W3_CAST.find((c) => c.enemy === 'ocelot')!;
/** the toy floor (one storey of the draft holds it) and the ocelot's lay cost (w3Noise.test.ts TOY_THREAT: 3-1's budget is under 3) */
const TOY_W = 1000;
const TOY_THREAT = 1;
/** the patch's clock: 3-3.md's teach patch (6.4 s, the cloud out 2.6 s) */
const PATCH = { period: 6.4, warn: 1.0, active: 2.6 } as const;

const section: SectionTemplate = {
  id: 'w3-lure-toy', name: 'a call toy', archetypes: 'any', phases: ['ten', 'ketsu'], difficulty: 2, maxPerStage: 1, mirrorable: false,
  pieces: [{ key: 'floor', shape: 'bank', w: [TOY_W, TOY_W], place: { kind: 'start' }, main: true }],
  sockets: [
    soundSocket('stone', 'floor', [0.22, 0.22]),
    lureSocket('patch', 'floor', [0.3, 0.3], 'spore'),
    { id: 'prowler', role: 'enemy', on: 'floor', t: [0.62, 0.62], maxThreat: TOY_THREAT, chance: 1 },
  ],
  zones: [{ kind: 'spore', on: 'floor', ...PATCH, span: [0.1, 0.4] }],
  entry: { piece: 'floor', kind: 'ground' }, exit: { piece: 'floor', kind: 'ground' }, exitDy: 0,
};
const kitOf = (): WorldKit => {
  const k = realKit();
  const ocelot: CreatureDef = { ...W3_OCELOT, threat: TOY_THREAT };
  return {
    ...k,
    spawn: (e, c, out) => {
      k.spawn?.(e, c, out);
      const cast = (out.proto.cast ??= { kinds: [], traps: [] });
      if (!cast.kinds.includes(e.type)) cast.kinds.push(e.type);
    },
    manifest: { ...k.manifest, creatures: [ocelot, ...k.manifest.creatures.filter((c) => c.enemy !== 'ocelot')], sections: [...k.manifest.sections, section] },
  };
};
const onFloor = (platforms: readonly Platform[], x: number, y: number) => platforms.find((p) => p.x <= x && p.x + p.width >= x && Math.abs(p.y - y) < 3 && p.width >= TOY_W);

let made: { st: ReturnType<typeof buildGen2Stage>; kit: WorldKit; seed: number } | null = null;
/** the first clean roll (seeds 1-40, Normal) that lays the toy: stone, patch and ocelot on one floor, the stone and patch on its round */
function built() {
  if (made) return made;
  const kit = kitOf();
  for (let seed = 1; seed <= 40; seed++) {
    const st = buildGen2Stage({ config: cfg, kit, seed, difficulty: 'normal' });
    if (st.gen2.errors?.length) continue;
    const stone = st.proto?.cast?.sounds?.[0];
    const patch = st.proto?.cast?.lures?.[0];
    const e = st.enemies.find((q) => q.type === 'ocelot' && onFloor(st.platforms, q.x, q.y + (W3_OCELOT.footY ?? 0)));
    if (!stone || !patch || !e) continue;
    const round = (x: number) => x >= e.patrolMinX && x <= e.patrolMaxX;
    if (round(stone.x) && round(patch.x) && onFloor(st.platforms, stone.x, stone.y)) return (made = { st, kit, seed });
  }
  throw new Error(`no roll of ${DRAFT}'s draft lays the call toy`);
}

const teleported = (cast: CastPlay) => { (cast as unknown as { fall: FallState }).fall = newFall(); };
interface Played { sim: RealPlay; e: Enemy; cast: CastPlay; stone: SoundPost; patch: LurePost; zones: readonly Zone[]; floor: Platform }
function inPlay<T>(f: (q: Played) => T, plant?: (c: CastPlay) => void): T {
  const { st, kit, seed } = built();
  const dict: string[] = [];
  const packed = packPlan({ seed: st.gen2.seed, rerolls: st.gen2.rerolls, plan: st.gen2.plan, foes: [...keptFoes(st)] }, dict);
  setDifficulty('normal');
  const was = LISTED[DRAFT];
  LISTED[DRAFT] = { ...was, kit: () => kit };
  const undo = plantSeedList(DRAFT, { dict, seeds: [seed], plans: [packed] });
  try {
    const sim = new RealPlay(DRAFT, seed, cfg);
    const eng = (sim as unknown as { e: { enemies: Enemy[]; platforms: Platform[]; cast: CastPlay; currentStage: { zones?: Zone[] } } }).e;
    const cast = eng.cast;
    const stone = cast.sounds[0];
    const patch = (cast as unknown as { lures: LurePost[] }).lures[0];
    const floor = onFloor(eng.platforms, stone.x, stone.y)!;
    const e = eng.enemies.find((q) => q.type === 'ocelot' && q.kit && q.kit.x >= floor.x && q.kit.x <= floor.x + floor.width)!;
    assert.ok(e?.kit, 'the toy\'s ocelot is run by the cast');
    plant?.(cast);
    return f({ sim, e, cast, stone, patch, zones: eng.currentStage.zones ?? [], floor });
  } finally {
    undo();
    LISTED[DRAFT] = was;
  }
}
const cloud = (q: Played, t: number) => zoneEffect(q.zones, 'spore', q.patch.x, q.patch.y, t).strength;

/** he stands just past the stone and waits until `when(t)` says ring, then punches it; frames until it is taken or `secs` pass */
function call(when: (q: Played, t: number) => boolean, plant?: (c: CastPlay) => void, secs = 16) {
  return inPlay((q) => {
    const { sim, e, cast, stone, floor } = q;
    sim.stand(stone.x - 40, floor.y);
    teleported(cast);
    sim.p.facing = 1;
    for (let f = 0; f < 3; f++) sim.frame();
    // (rung from where it is out of his punch: the blow must reach the stone, not the animal)
    for (let f = 0; f < 30 * 40 && !(when(q, sim.t) && Math.abs(e.kit!.x - sim.p.x) > 200); f++) sim.frame();
    const t0 = sim.t;
    sim.frame({ punch: true });
    let drawn = false, arrived = -1, taken = -1, cloudAt = -1, outFor = 0, outSince = -1;
    for (let f = 0; f < 30 * secs && taken < 0; f++) {
      sim.frame();
      const s = e.kit!;
      drawn ||= s.drawn;
      const c = cloud(q, sim.t);
      if (c > LURE.cloud.floor) { if (outSince < 0) outSince = sim.t; } else outSince = -1;
      if (arrived < 0 && Math.abs(s.x - q.patch.x) <= q.patch.reach) arrived = sim.t - t0;
      if (s.beatenBy === 'lure') (taken = sim.t - t0), (cloudAt = c), (outFor = outSince < 0 ? 0 : sim.t - outSince);
    }
    return { drawn, arrived, taken, cloudAt, outFor, phase: e.kit!.phase, leaving: !!e.kit!.leaving, def: castDef('ocelot', 3) };
  }, plant);
}
/** ring as the cloud has just gone in, so it arrives on a patch with no cloud and must wait there for the next one */
const asCloudGoesIn = (q: Played, t: number) => cloud(q, t) <= LURE.cloud.floor && cloud(q, t - 1 / 30) > LURE.cloud.floor;

test('the toy: World 3\'s own stone and patch rows laid by gen2; the ocelot fears the spore and answers the lure in World 3', () => {
  const { st } = built();
  assert.equal(st.proto?.cast?.sounds?.length, 1, 'one chime stone (w3.ts W3_SOUNDS)');
  assert.equal(st.proto?.cast?.lures?.length, 1, 'one spore patch (w3.ts W3_LURE)');
  assert.equal(st.proto!.cast!.lures![0].fear, 'spore');
  const def = castDef('ocelot', 3)!;
  assert.deepEqual(def.fears, ['spore']);
  assert.deepEqual(def.beatenBy.lure, { ends: 'chasedOff' }, 'ways.ts keeps the lure for a zone fear (no creature in any cast is a spore)');
});

test('in play: rung, cleared: called onto the patch with no cloud, it looks, and on the cloud (out 0.3 s) it yawns home', (t) => {
  const r = call(asCloudGoesIn);
  assert.ok(r.drawn, 'the ring calls it');
  assert.ok(r.arrived >= 0, 'it comes onto the patch');
  assert.ok(r.taken >= 0, 'it is taken');
  assert.ok(r.taken > r.arrived + 0.5, 'not on arrival: the cloud was in when it came');
  assert.ok(r.cloudAt > LURE.cloud.floor, `taken in the cloud (strength ${r.cloudAt.toFixed(2)})`);
  assert.ok(r.outFor >= LURE.cloud.hold - 1e-6, `the cloud out ${r.outFor.toFixed(2)} s first (the gate's 0.3)`);
  t.diagnostic(`call: arrived ${r.arrived.toFixed(2)} s after the ring, taken ${r.taken.toFixed(2)} s (cloud ${r.cloudAt.toFixed(2)}, out ${r.outFor.toFixed(2)} s), then ${r.phase}`);
});

test('planted: the clock gate off -> it is taken the moment it reaches the patch, with no cloud', () => {
  const r = call(asCloudGoesIn, (c) => { (c as unknown as { gates: () => boolean[] }).gates = () => [true]; });
  assert.ok(r.taken >= 0 && r.taken <= r.arrived + 0.1, 'taken on arrival');
  assert.ok(r.cloudAt <= LURE.cloud.floor, 'with no cloud out (this is what the gate stops)');
});

test('planted: the stone silent -> it never comes, and is never taken', () => {
  const r = call(asCloudGoesIn, (c) => { c.ring = () => null; }, 12);
  assert.equal(r.drawn, false, 'never drawn');
  assert.equal(r.taken, -1, 'never taken');
});

test('one ring per call: rung again while its call is out the stone hums and makes no sound; back on its round, it rings again', () => {
  inPlay((q) => {
    const { sim, e, cast, stone, floor } = q;
    sim.stand(stone.x - 40, floor.y);
    teleported(cast);
    for (let f = 0; f < 3; f++) sim.frame();
    assert.equal(cast.hums(0), false, 'quiet before it is rung');
    assert.ok(cast.ring(0, sim.t), 'the first ring sounds');
    sim.frame();
    assert.ok(e.kit!.drawn, 'and calls it');
    assert.equal(cast.hums(0), true, 'the stone hums while its call is out');
    for (let f = 0; f < 30; f++) sim.frame();
    assert.equal(cast.ring(0, sim.t), null, 'a second ring makes no sound');
    let back = false;
    for (let f = 0; f < 30 * 30 && !back; f++) {
      sim.frame();
      back = !cast.hums(0);
    }
    assert.ok(back, 'its call ends (taken home, or back on its round)');
    assert.ok(cast.ring(0, sim.t), 'then it rings again');
  });
});

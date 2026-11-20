/**
 * THE NOISE CHANNEL on real rows (ENG-NOISE; 3-5.md "The engine order" item 1, 3-3.md's chime; level.md rules 21, 23; D75): one channel the
 * cast hears for every noise Pokey or the stage makes, proven on toy World 3 rows LAID BY GEN2 (a sounding thing from its prop socket,
 * soundLay.ts; quiet ground from its piece, SectionPiece.quiet; kit ocelots from their sockets joining the cast) and played in the real
 * engine (RealPlay, 30 fps, his own punch through the pad):
 *   - the struck stone: a punch on it rings it (its bellNoise at its place) and the kit ocelot comes to look, under the stone; the punch
 *     makes ONLY the stone's sound (never his own, which would call it 'alert' to him: 3-3.md). Planted: the stone's emitter off -> it
 *     never comes;
 *   - his punch: a sleeper within LOUD.punch.r (240) wakes, one 300 px off sleeps on. Planted: the punch off the channel -> it sleeps on;
 *   - his landing: a 400 px drop onto moss (quiet) wakes nothing; onto stone it wakes one 300 px off. Planted: the ground's quiet
 *     ignored -> the sleeper by the moss wakes.
 * World-neutral: no stage of the game, a toy kit (toyWorld.ts) with World 3's number.
 */
import '../headlessDom.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildGen2Stage, keptFoes } from './pipeline.ts';
import { cfg as toyCfg, kit as toyKit, meadow } from './toyWorld.ts';
import { withTestStage } from './listed.ts';
import { packPlan, plantSeedList } from './seedList.ts';
import { soundEmitters, soundProps, soundSocket, type SoundRow } from './soundLay.ts';
import { RealPlay, withFixtureConfig } from '../realPlay.ts';
import { setDifficulty } from '../difficulty.ts';
import { LOUD, type Sound } from '../heroNoise.ts';
import type { CastHero, CastPlay, CastStep } from '../castPlay.ts';
import type { SoundPost } from '../castPlay.types.ts';
import type { CreatureDef, SectionTemplate, WorldKit } from './types.ts';
import type { Enemy, LevelConfig, Platform } from '../types.ts';

const ID = '3-96';
const cfg: LevelConfig = { ...toyCfg(ID, 'sprint'), unlocked: true };
/** a chime stone's box (the toy's: Pokey's own size, about his knee to his chest) */
const SOUNDS: Record<string, SoundRow> = { chime: { w: 60, h: 70 } };
const OCELOT_BODY = { enemy: 'ocelot', terrain: 'flat', minGround: 120, w: 52, h: 30, hp: 1, footY: 15 } as const;
const PROWLER: CreatureDef = { id: 'prowler', ...OCELOT_BODY, threat: 2 };
const SLEEPER: CreatureDef = { id: 'sleeper', ...OCELOT_BODY, threat: 1, extra: { asleep: true } };

type Row = 'call' | 'punch' | 'moss' | 'stone';
const sectionOf = (row: Row): SectionTemplate => ({
  id: `toy-noise-${row}`, name: `a ${row} row`, archetypes: 'any', phases: ['ki', 'sho', 'ten', 'ketsu'], difficulty: 2, maxPerStage: 1,
  pieces: [{ key: 'floor', shape: 'bank', w: [1400, 1400], place: { kind: 'start' }, main: true, ...(row === 'moss' ? { quiet: true } : {}) }],
  sockets: row === 'call'
    ? [soundSocket('stone', 'floor', [0.2, 0.2]), { id: 'prowler', role: 'enemy', on: 'floor', t: [0.62, 0.62], maxThreat: 3, chance: 1 }]
    : [{ id: 'sleeper', role: 'enemy', on: 'floor', t: [0.75, 0.75], maxThreat: 3, chance: 1 }],
  entry: { piece: 'floor', kind: 'ground' }, exit: { piece: 'floor', kind: 'ground' }, exitDy: 0, mirrorable: false,
});
const kitOf = (row: Row): WorldKit => ({
  ...toyKit,
  emit: { ...toyKit.emit, ...soundEmitters(SOUNDS) },
  // (every animal laid joins the stage's cast, as a World 3 brief's `cast` would name it: castPlay.ts runs it on the kit)
  spawn: (e, _c, out) => {
    const cast = (out.proto.cast ??= { kinds: [], traps: [] });
    if (!cast.kinds.includes(e.type)) cast.kinds.push(e.type);
  },
  manifest: {
    ...toyKit.manifest, world: 3, creatures: [row === 'call' ? PROWLER : SLEEPER], props: soundProps(SOUNDS), pairs: [], tips: {},
    sections: [{ ...meadow, phases: ['start', 'rest', 'ki', 'sho', 'ten', 'ketsu', 'goal'], mirrorable: false, sockets: meadow.sockets.filter((k) => k.role !== 'prop' && k.role !== 'enemy') }, sectionOf(row)],
  },
});
function built(row: Row) {
  const kit = kitOf(row);
  for (let seed = 1; seed <= 20; seed++) {
    const st = buildGen2Stage({ config: cfg, kit, seed, difficulty: 'normal' });
    if (!st.gen2.errors?.length && st.enemies.some((e) => e.type === 'ocelot') && (row !== 'call' || st.proto?.cast?.sounds?.length)) return { st, kit, seed };
  }
  throw new Error(`no roll lays the ${row} row`);
}

interface Played { sim: RealPlay; e: Enemy; cast: CastPlay; heard: Array<Sound['from']>; floor: Platform; stone?: SoundPost }
/** play the row in the real engine; `plant` may stub the cast before the first step (a planted failure) */
function inPlay<T>(row: Row, f: (q: Played) => T, plant?: (c: CastPlay) => void): T {
  const { st, kit, seed } = built(row);
  const dict: string[] = [];
  const packed = packPlan({ seed: st.gen2.seed, rerolls: st.gen2.rerolls, plan: st.gen2.plan, foes: [...keptFoes(st)] }, dict);
  setDifficulty('normal');
  return withTestStage({ [ID]: { kit: () => kit, world: (s) => s, seeds: [] } }, () => {
    const undo = plantSeedList(ID, { dict, seeds: [seed], plans: [packed] });
    try {
      return withFixtureConfig(cfg, () => {
        const sim = new RealPlay(ID, seed, cfg);
        const eng = (sim as unknown as { e: { enemies: Enemy[]; platforms: Platform[]; cast: CastPlay } }).e;
        const e = eng.enemies.find((q) => q.type === 'ocelot')!;
        assert.ok(e?.kit, 'the ocelot is the creature kit\'s (in the cast)');
        const cast = eng.cast;
        // (every noise the cast heard, step by step: the channel's own record, CastStep.heard)
        const heard: Array<Sound['from']> = [];
        const step = cast.step.bind(cast);
        cast.step = (...a: Parameters<CastPlay['step']>): CastStep => {
          const r = step(...a);
          heard.push(...r.heard.map((n) => n.from));
          return r;
        };
        plant?.(cast);
        const floor = eng.platforms.find((p) => p.x <= e.kit!.x && p.x + p.width >= e.kit!.x && Math.abs(p.y - e.kit!.y) < 2)!;
        assert.ok(floor, 'the ocelot stands on the row\'s floor');
        return f({ sim, e, cast, heard, floor, stone: cast.sounds[0] });
      });
    } finally {
      undo();
    }
  });
}

test('laid by gen2: the call row has a sounding stone in the cast and a kit ocelot on its floor; the moss row\'s floor is quiet, the stone row\'s is not', () => {
  const call = built('call').st;
  assert.equal(call.proto?.cast?.sounds?.length, 1, 'one sounding stone, from its prop socket (soundLay.ts)');
  const s = call.proto!.cast!.sounds![0];
  assert.deepEqual({ w: s.w, h: s.h, sound: s.sound }, { w: 60, h: 70, sound: 'bell' });
  assert.deepEqual(call.proto?.cast?.kinds, ['ocelot']);
  for (const [row, quiet] of [['moss', true], ['stone', false]] as const) {
    const { st } = built(row);
    const e = st.enemies.find((q) => q.type === 'ocelot')!;
    const under = st.platforms.filter((p) => p.x <= e.x && p.x + p.width >= e.x + e.width);
    assert.ok(under.length, `${row}: the sleeper stands on a laid floor`);
    assert.equal(under.some((p) => p.quiet), quiet, `${row}: its floor is ${quiet ? '' : 'not '}quiet (SectionPiece.quiet)`);
    assert.equal(st.platforms.filter((p) => p.quiet).length, quiet ? 1 : 0, `${row}: only the piece that says so is quiet`);
  }
});

/** he stands just short of the stone, facing it, and punches once: when the ocelot was drawn and to where (core.ts hear: s.drawn, goalX),
 *  and when it stood under the stone (an ocelot also patrols on its own at 55 px/s, so being near the stone alone proves nothing) */
function ring(plant?: (c: CastPlay) => void) {
  return inPlay('call', ({ sim, e, heard, stone }) => {
    assert.ok(stone, 'a stone to strike');
    const from = e.kit!.x - stone.x;
    assert.ok(from > 300 && from < LOUD.bell.r, `the ocelot starts ${Math.round(from)} px from the stone: out of its sight of him, in the bell's reach`);
    sim.stand(stone.x - 45, stone.y);
    sim.p.facing = 1;
    for (let f = 0; f < 6; f++) sim.frame();
    sim.frame({ punch: true });
    let near = Infinity, at = -1, drawnAt = -1, goal = NaN;
    const t0 = sim.t;
    for (let f = 0; f < 30 * 9; f++) {
      sim.frame();
      if (drawnAt < 0 && e.kit!.drawn) (drawnAt = sim.t - t0), (goal = e.kit!.goalX);
      const d = Math.abs(e.kit!.x - stone.x);
      if (drawnAt >= 0 && d < near) near = d;
      if (drawnAt >= 0 && at < 0 && d <= 40) at = sim.t - t0;
    }
    return { from, near, at, drawnAt, goal, stoneX: stone.x, heard: [...heard] };
  }, plant);
}

test('in play: a punch on the stone rings it; the kit ocelot comes to look, under the stone; the punch makes ONLY the stone\'s sound', (t) => {
  const r = ring();
  t.diagnostic(`call: from ${Math.round(r.from)} px, drawn at ${r.drawnAt.toFixed(2)} s to x ${r.goal} (stone ${r.stoneX}), under it at ${r.at.toFixed(2)} s, closest ${Math.round(r.near)} px, heard ${r.heard.join(',')}`);
  assert.deepEqual(r.heard, ['bell'], 'the channel heard the stone, once, and never his punch');
  assert.ok(r.drawnAt >= 0 && r.drawnAt < 0.5, `drawn the moment the stone rang (core.ts hear: a rung bell is the lure): ${r.drawnAt.toFixed(2)} s`);
  assert.equal(r.goal, r.stoneX, 'drawn to the stone, not to him');
  assert.ok(r.at > 0 && r.at <= r.from / 95 + 1.5, `under the stone within its walk (${Math.round(r.from)} px at 95 px/s): ${r.at.toFixed(2)} s, closest ${Math.round(r.near)} px`);
});

test('planted: the stone\'s emitter off (a struck stone makes no noise) -> the ocelot never comes', () => {
  const r = ring((c) => { c.ring = () => null; });
  assert.deepEqual(r.heard, [], 'nothing on the channel: the blow rang the stone, and a blow that rings makes no noise of its own');
  assert.equal(r.drawnAt, -1, 'it is never drawn: it never comes to the stone');
});

/** he stands `dx` px from the sleeper, his back to it, and punches the air once: is it awake a second later? */
function punchBy(dx: number, plant?: (c: CastPlay) => void) {
  return inPlay('punch', ({ sim, e, heard, floor }) => {
    assert.ok(e.kit!.asleep, 'it starts asleep');
    sim.stand(e.kit!.x - dx, floor.y);
    sim.p.facing = -1;
    for (let f = 0; f < 15; f++) sim.frame();
    assert.ok(e.kit!.asleep, 'standing there wakes nothing');
    sim.frame({ punch: true });
    for (let f = 0; f < 30; f++) sim.frame();
    return { awake: !e.kit!.asleep, heard: [...heard] };
  }, plant);
}

test('in play: his punch wakes a sleeper within 240 px; one 300 px off sleeps on', (t) => {
  const near = punchBy(200);
  assert.deepEqual(near.heard, ['punch'], 'one blow, one noise on the channel');
  assert.ok(near.awake, 'a punch 200 px off wakes it');
  const far = punchBy(300);
  assert.deepEqual(far.heard, ['punch']);
  assert.ok(!far.awake, 'a punch 300 px off does not (LOUD.punch.r 240)');
  t.diagnostic(`punch: 200 px ${near.awake ? 'woke' : 'slept'} (heard ${near.heard}), 300 px ${far.awake ? 'woke' : 'slept'} (heard ${far.heard})`);
});

test('planted: his punch off the channel -> the sleeper 200 px off sleeps on', () => {
  const r = punchBy(200, (c) => {
    const noise = c.noise.bind(c);
    c.noise = (n) => (n.from === 'punch' ? undefined : noise(n));
  });
  assert.deepEqual(r.heard, []);
  assert.ok(!r.awake);
});

/** he drops 400 px onto the row's floor, 300 px short of the sleeper: is it awake after he lands? */
function dropOnto(row: 'moss' | 'stone', plant?: (c: CastPlay) => void) {
  return inPlay(row, ({ sim, e, heard, floor }) => {
    assert.ok(e.kit!.asleep, 'it starts asleep');
    sim.fly(e.kit!.x - 300, floor.y - 400);
    let landed = false;
    for (let f = 0; f < 30 * 2; f++) {
      sim.frame();
      landed ||= sim.p.grounded;
    }
    assert.ok(landed && Math.abs(sim.p.y - floor.y) < 2, 'he landed on the floor');
    return { awake: !e.kit!.asleep, heard: [...heard] };
  }, plant);
}

test('in play: a 400 px drop onto moss wakes nothing; onto stone it wakes the sleeper 300 px off', (t) => {
  const moss = dropOnto('moss');
  assert.deepEqual(moss.heard, [], 'moss: no noise at all');
  assert.ok(!moss.awake, 'moss: it sleeps on');
  const stone = dropOnto('stone');
  assert.deepEqual(stone.heard, ['landing'], 'stone: the landing is heard');
  assert.ok(stone.awake, 'stone: it wakes (a 400 px fall carries 360 px)');
  t.diagnostic(`drop 400 px: moss ${moss.awake ? 'woke' : 'slept'} (heard [${moss.heard}]), stone ${stone.awake ? 'woke' : 'slept'} (heard [${stone.heard}])`);
});

test('planted: the ground\'s quiet ignored -> the sleeper by the moss wakes', () => {
  const r = dropOnto('moss', (c) => {
    const step = c.step.bind(c);
    c.step = (h: CastHero, ...a) => step({ ...h, quiet: false }, ...a);
  });
  assert.ok(r.awake);
});

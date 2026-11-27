/**
 * THE NOISE CHANNEL on a REAL World 3 row (ENG-NOISE; level.md rule 23): the three toys of 3-5.md 'The engine order' 1, played on 3-1's
 * DRAFT row (stageTable.ts DRAFT_TABLE: World 3's own kit, w3.ts, going down), readied as the tools ready it, built by gen2 and played in
 * the real engine at 30 fps (realPlay.ts). The animal is World 3's own ocelot (W3_CAST's row; its def from the registry, predators/
 * world3.ts OCELOT). World 3's kit has no chime stone, moss or sleeper yet (ENG-LURE, 3-5's moss, ENG-VINE lay them): each toy adds ONE
 * test-only section to that row's pool, here only (W3_DOWN and the draft row are untouched).
 *   - a struck stone draws the kit ocelot to look, under the stone (plant: the stone's emitter off -> it never comes: RED);
 *   - his punch wakes a sleeper within 240 px; one 300 px off sleeps on (plant: the punch off the channel -> it sleeps on: RED);
 *   - a 400 px drop onto moss wakes nothing; onto stone it wakes the sleeper 300 px off (plant: the ground's quiet ignored -> RED).
 * The toy toys of 11-19 (a toy kit) are gen2/noiseRow.test.ts.
 */
import '../../headlessDom.ts';
import { readied, readyDraft } from '../../../../tools/engine/draft.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateAllLevels } from '../../worldsData.ts';
import { buildGen2Stage, dropSeen, keptFoes } from '../pipeline.ts';
import { LISTED } from '../listed.ts';
import { packPlan, plantSeedList } from '../seedList.ts';
import { soundEmitters, soundProps, soundSocket, type SoundRow } from '../soundLay.ts';
import { RealPlay } from '../../realPlay.ts';
import { setDifficulty } from '../../difficulty.ts';
import { castDef } from '../../predators/registry.ts';
import { OCELOT } from '../../predators/world3.ts';
import type { PredatorDef } from '../../predators/types.ts';
import { LOUD, newFall, type FallState, type Sound } from '../../heroNoise.ts';
import type { CastHero, CastPlay, CastStep } from '../../castPlay.ts';
import type { SoundPost } from '../../castPlay.types.ts';
import type { CreatureDef, SectionTemplate, WorldKit } from '../types.ts';
import type { Enemy, LevelConfig, Platform } from '../../types.ts';
import { W3_CAST } from './w3.ts';
import { draftRow } from './stageTable.ts';

const DRAFT = '3-1';
/** the drop toys' row (ENG-DROP, R-165.562): 3-2's DRAFT, World 3's kit laid ALONG (DRAFT_TABLE '3-2'). The toy declares its drop
 *  (SectionTemplate.drop) and the run lay lays it past the corridor; 3-1's way down is a tower, where no drop past TOWER.see is laid */
const ALONG = '3-2';
if (readied !== DRAFT) readyDraft(DRAFT);
readyDraft(ALONG);
const levels = generateAllLevels();
const cfgOf = (id: string): LevelConfig => ({ ...levels.find((c) => c.id === id && !c.secret)!, unlocked: true });
const cfg = cfgOf(DRAFT);
const along = cfgOf(ALONG);
/** the row a toy plays on: the drops on 3-2's run, the call and the punch on 3-1's way down */
const stageOf = (row: Row) => (dropRow(row) ? ALONG : DRAFT);
const configOf = (row: Row) => (dropRow(row) ? along : cfg);
/** a chime stone's box (the toy's: about Pokey's knee to his chest; ENG-LURE gives the chime its own look and size) */
const SOUNDS: Record<string, SoundRow> = { chime: { w: 60, h: 70 } };
/** World 3's own ocelot row (w3.ts W3_CAST) as the kit lays it; the sleeper is the same animal laid asleep */
const W3_OCELOT = W3_CAST.find((c) => c.enemy === 'ocelot')!;

type Row = 'call' | 'punch' | 'moss' | 'stone';
/** the toy floor's width: one storey of the way down holds it (the draft's storeys are 1140 px) */
const TOY_W = 1000;
/**
 * the toy's lay cost for the ocelot: 3-1's sections hold 2.3 x tension (about 0.72) threat, under the W3 row's 3, so no socket on 3-1's
 * budget can lay World 3's ocelot (named in the REPORT for 3-3/3-5's builders); the toy pays 1 (a lay number, not the animal: its body is
 * W3_CAST's and its def the registry's). Its phases keep it past the opening seconds (no animal stands there)
 */
const TOY_THREAT = 1;
/** the drop toys' fall: a 400 px drop (LOUD.landing: carries 180 + 200 x 0.9 = 360 px) */
const DROP = 400;
/** the drops' floor: the top (up to 240 px), its gap (up to 20) and this floor make one storey (1140 px) */
const DROP_W = 800;
/** where the drops' sleeper lies along the floor (t, from the top's side): about 300 px past where a walk-off from the top lands (he
 *  comes down about 140 px in) */
const SLEEP_T = 0.55;
const dropRow = (row: Row) => row === 'moss' || row === 'stone';
/**
 * the ONE test-only section a toy adds to the row's pool: a long stone (or moss) floor, the stone and the animal on it. The drops build their
 * own 400 px fall (a top branch, the floor DROP px under it): 3-1's way down stacks its storeys 110-150 px apart, so no roll has a clear
 * 400 px column over a floor
 */
const sectionOf = (row: Row): SectionTemplate => {
  const head = { id: `w3-noise-toy-${row}`, name: `a ${row} toy`, archetypes: 'any' as const, phases: ['ten', 'ketsu'] as SectionTemplate['phases'],
    difficulty: 2, maxPerStage: 1, mirrorable: false };
  if (row === 'call' || row === 'punch') return {
    ...head,
    pieces: [{ key: 'floor', shape: 'bank', w: [TOY_W, TOY_W], place: { kind: 'start' }, main: true }],
    sockets: row === 'call'
      ? [soundSocket('stone', 'floor', [0.2, 0.2]), { id: 'prowler', role: 'enemy', on: 'floor', t: [0.62, 0.62], maxThreat: TOY_THREAT, chance: 1 }]
      : [{ id: 'sleeper', role: 'enemy', on: 'floor', t: [0.75, 0.75], maxThreat: TOY_THREAT, chance: 1 }],
    entry: { piece: 'floor', kind: 'ground' }, exit: { piece: 'floor', kind: 'ground' }, exitDy: 0,
  };
  return {
    ...head,
    pieces: [
      // (a cliff, a bank, never a perch: on a run a soft pit's floor before a perch is stretched under it to the next earth (R-165.246,
      // joinPitFloors), which is the drop's own landing, and wood would lie across the fall: refused by name, dropSeen)
      { key: 'top', shape: 'bank', w: [200, 240], place: { kind: 'start' }, main: true },
      { key: 'floor', shape: 'bank', w: [DROP_W, DROP_W], place: { kind: 'jump', after: 'top', dy: [DROP, DROP], gapPx: [8, 20] }, landing: true, main: true,
        ...(row === 'moss' ? { quiet: true } : {}) },
    ],
    sockets: [{ id: 'sleeper', role: 'enemy', on: 'floor', t: [SLEEP_T, SLEEP_T], maxThreat: TOY_THREAT, chance: 1 }],
    entry: { piece: 'top', kind: 'ground' }, exit: { piece: 'floor', kind: 'ground' }, exitDy: DROP, drop: DROP,
  };
};
const kitOf = (row: Row): WorldKit => {
  // (World 3's real kit for the row: listed.ts KITS 'w3', through the row's draft)
  const k = LISTED[stageOf(row)].kit();
  const ocelot: CreatureDef = { ...W3_OCELOT, threat: TOY_THREAT, ...(row === 'call' ? {} : { extra: { ...W3_OCELOT.extra, asleep: true } }) };
  return {
    ...k,
    emit: { ...k.emit, ...soundEmitters(SOUNDS) },
    // (every animal laid joins the stage's cast, as a World 3 brief's `cast` names it: castPlay.ts runs it on the kit)
    spawn: (e, c, out) => {
      k.spawn?.(e, c, out);
      const cast = (out.proto.cast ??= { kinds: [], traps: [] });
      if (!cast.kinds.includes(e.type)) cast.kinds.push(e.type);
    },
    manifest: {
      ...k.manifest,
      creatures: [ocelot, ...k.manifest.creatures.filter((c) => c.enemy !== 'ocelot')],
      props: [...k.manifest.props, ...soundProps(SOUNDS)],
      sections: [...k.manifest.sections, sectionOf(row)],
    },
  };
};

/** the toy's floor: the laid piece the toy section's animal stands on (a drop's: with the section's top DROP px over it) */
const toyFloor = (platforms: readonly Platform[], e: { x: number; y: number; width?: number }, footY: number, row: Row) =>
  platforms.find((p) => p.x <= e.x && p.x + p.width >= e.x && Math.abs(p.y - (e.y + footY)) < 3 &&
    (dropRow(row) ? p.width === DROP_W && !!dropTop(platforms, p) : p.width >= TOY_W));

const builds = new Map<Row, { st: ReturnType<typeof buildGen2Stage>; kit: WorldKit; seed: number }>();
/** the first clean roll (seeds 1-40, Normal) that lays the row's toy, built once per row */
/** the harness moves him (stand, fly): a teleport is not a fall, so his fall starts where he is put (as a flag's respawn does: calm) */
const teleported = (cast: CastPlay) => { (cast as unknown as { fall: FallState }).fall = newFall(); };
/** the roll's tempo scales a laid drop (pipeline.ts: dy x T.rise; 3-1's rolls lay this one 392-407 px): the toy takes it within this */
const DROP_TOL = 10;
/**
 * the drops' top: the laid branch the toy floor hangs about DROP px under, 8-20 px across (the section's own gapPx). The tower lays every
 * other storey right to left, so the top may stand on either side of the floor
 */
const dropTop = (platforms: readonly Platform[], floor: Platform): Platform | undefined =>
  platforms.find((p) => {
    if (p === floor || Math.abs(floor.y - p.y - DROP) > DROP_TOL) return false;
    const gap = p.x < floor.x ? floor.x - (p.x + p.width) : p.x - (floor.x + floor.width);
    return gap >= 8 && gap <= 20;
  });
function built(row: Row) {
  const had = builds.get(row);
  if (had) return had;
  const kit = kitOf(row);
  for (let seed = 1; seed <= 40; seed++) {
    const st = buildGen2Stage({ config: configOf(row), kit, seed, difficulty: 'normal' });
    if (st.gen2.errors?.length) continue;
    const e = st.enemies.find((q) => q.type === 'ocelot' && toyFloor(st.platforms, q, W3_OCELOT.footY ?? 0, row));
    const fl = e && toyFloor(st.platforms, e, W3_OCELOT.footY ?? 0, row);
    const stone = st.proto?.cast?.sounds?.[0];
    // (the call: the stone inside the ocelot's own patch, so it can come under it; the drops: toyFloor holds the section's top DROP px over it)
    const fits = !!e && !!fl && (row === 'call' ? !!stone && stone.x >= e.patrolMinX && stone.x <= e.patrolMaxX
      : true);
    if (fits) {
      builds.set(row, { st, kit, seed });
      return builds.get(row)!;
    }
  }
  throw new Error(`no roll of ${stageOf(row)}'s draft lays the ${row} toy`);
}

interface Played { sim: RealPlay; e: Enemy; cast: CastPlay; heard: Array<Sound['from']>; floor: Platform; stone?: SoundPost }
/** play the row in the real engine (the row's kit swapped for the toy's for this run only); `plant` may stub the cast or the noise maker */
function inPlay<T>(row: Row, f: (q: Played) => T, plant?: (c: CastPlay) => void): T {
  const { st, kit, seed } = built(row);
  const dict: string[] = [];
  const packed = packPlan({ seed: st.gen2.seed, rerolls: st.gen2.rerolls, plan: st.gen2.plan, foes: [...keptFoes(st)] }, dict);
  setDifficulty('normal');
  const id = stageOf(row);
  const was = LISTED[id];
  LISTED[id] = { ...was, kit: () => kit };
  const undo = plantSeedList(id, { dict, seeds: [seed], plans: [packed] });
  try {
    {
      // (a real stage: its own config, readied, handed to the real engine; no fixture)
      const sim = new RealPlay(id, seed, configOf(row));
      const eng = (sim as unknown as { e: { enemies: Enemy[]; platforms: Platform[]; cast: CastPlay } }).e;
      const e = eng.enemies.find((q) => q.type === 'ocelot' && q.kit && toyFloor(eng.platforms, q.kit, 0, row))!;
      assert.ok(e?.kit, 'the toy\'s ocelot is the creature kit\'s (in the cast)');
      const member = (eng.cast as unknown as { members: Array<{ e: Enemy; def: PredatorDef }> }).members.find((m) => m.e === e);
      assert.deepEqual(member?.def, castDef('ocelot', 3), 'World 3\'s own ocelot (the registry\'s def, run by the cast)');
      const cast = eng.cast;
      const heard: Array<Sound['from']> = [];
      const step = cast.step.bind(cast);
      cast.step = (...a: Parameters<CastPlay['step']>): CastStep => {
        const r = step(...a);
        heard.push(...r.heard.map((n) => n.from));
        return r;
      };
      plant?.(cast);
      const floor = toyFloor(eng.platforms, e.kit, 0, row)!;
      return f({ sim, e, cast, heard, floor, stone: cast.sounds[0] });
    }
  } finally {
    undo();
    LISTED[id] = was;
  }
}

test('the row: 3-1\'s draft on World 3\'s own kit; the toy section laid by gen2 (stone in the cast, World 3\'s ocelot on its floor; moss quiet)', () => {
  assert.equal(draftRow(DRAFT)?.kit, 'w3');
  assert.equal(cfg.travel, 'down', 'readied: the draft travels down');
  assert.equal(castDef('ocelot', 3)?.hears, OCELOT.hears, 'the registry hands World 3 its own ocelot, which hears');
  const call = built('call').st;
  assert.equal(call.proto?.cast?.sounds?.length, 1, 'one sounding stone, from its prop socket (soundLay.ts)');
  assert.ok(call.proto!.cast!.kinds.includes('ocelot'));
  for (const [row, quiet] of [['moss', true], ['stone', false]] as const) {
    const { st } = built(row);
    const e = st.enemies.find((q) => q.type === 'ocelot' && toyFloor(st.platforms, q, W3_OCELOT.footY ?? 0, row))!;
    assert.equal(!!toyFloor(st.platforms, e, W3_OCELOT.footY ?? 0, row)!.quiet, quiet, `${row}: the toy floor is ${quiet ? '' : 'not '}quiet`);
    assert.equal(st.platforms.filter((p) => p.quiet).length, quiet ? 1 : 0, `${row}: only the piece that says so is quiet`);
  }
});

/** he stands just past the stone and punches it once: when the ocelot was drawn, to where, and how close it came under the stone */
function ring(plant?: (c: CastPlay) => void) {
  return inPlay('call', ({ sim, e, cast, heard, floor, stone }) => {
    assert.ok(stone, 'the stone is in the cast');
    const from = e.kit!.x - stone!.x;
    sim.stand(stone!.x + 40, floor.y);
    teleported(cast);
    sim.p.facing = -1;
    for (let f = 0; f < 3; f++) sim.frame();
    heard.length = 0;
    const t0 = sim.t;
    sim.frame({ punch: true });
    let drawnAt = -1;
    let goal = NaN;
    let closest = Infinity;
    for (let f = 0; f < 30 * 8; f++) {
      sim.frame();
      if (drawnAt < 0 && e.kit!.drawn) (drawnAt = sim.t - t0), (goal = e.kit!.goalX);
      closest = Math.min(closest, Math.abs(e.kit!.x - stone!.x));
    }
    return { from, drawnAt, goal, stoneX: stone!.x, closest, heard: [...heard] };
  }, plant);
}

test('in play: a punch on the stone rings it; World 3\'s ocelot comes to look, under the stone; the punch makes ONLY the stone\'s sound', (t) => {
  const r = ring();
  assert.deepEqual(r.heard, ['bell'], 'one sound on the channel: the stone\'s');
  assert.ok(r.drawnAt >= 0, 'the ocelot is drawn');
  assert.ok(Math.abs(r.goal - r.stoneX) < 2, 'to the stone, not to him');
  assert.ok(r.closest < 40, `it comes under the stone (closest ${r.closest.toFixed(0)} px)`);
  t.diagnostic(`call: drawn ${r.drawnAt.toFixed(2)} s after the press from ${r.from.toFixed(0)} px, goal ${r.goal} (stone ${r.stoneX}), closest ${r.closest.toFixed(0)} px; heard [${r.heard}]`);
});

test('planted: the stone\'s emitter off (a struck stone makes no noise) -> World 3\'s ocelot never comes', () => {
  const r = ring((c) => { c.ring = () => null; });
  assert.equal(r.drawnAt, -1, 'never drawn');
  assert.ok(Number.isNaN(r.goal), 'never sent to the stone (it may patrol past it on its own)');
  assert.deepEqual(r.heard, [], 'nothing on the channel');
});

/** he stands `dx` px short of the sleeper, facing it, and punches once */
function punchBy(dx: number, plant?: (c: CastPlay) => void) {
  return inPlay('punch', ({ sim, e, cast, heard, floor }) => {
    assert.ok(e.kit!.asleep, 'it starts asleep');
    sim.stand(e.kit!.x - dx, floor.y);
    teleported(cast);
    sim.p.facing = 1;
    for (let f = 0; f < 15; f++) sim.frame();
    assert.ok(e.kit!.asleep, 'standing there wakes nothing');
    // (the harness's own move may be heard as a landing before the fall is reset; the precondition is the sleeper still asleep)
    heard.length = 0;
    sim.frame({ punch: true });
    for (let f = 0; f < 30; f++) sim.frame();
    return { awake: !e.kit!.asleep, heard: [...heard] };
  }, plant);
}

test('in play: his punch wakes World 3\'s ocelot asleep within 240 px; one 300 px off sleeps on', (t) => {
  const near = punchBy(200);
  assert.deepEqual(near.heard, ['punch'], 'one blow, one noise on the channel');
  assert.ok(near.awake, 'a punch 200 px off wakes it');
  const far = punchBy(300);
  assert.deepEqual(far.heard, ['punch']);
  assert.ok(!far.awake, `a punch 300 px off does not (LOUD.punch.r ${LOUD.punch.r})`);
  t.diagnostic(`punch: 200 px ${near.awake ? 'woke' : 'slept'}, 300 px ${far.awake ? 'woke' : 'slept'}`);
});

test('planted: his punch off the channel (the seam drops it) -> the sleeper 200 px off sleeps on', () => {
  const r = punchBy(200, (c) => {
    const take = c.take.bind(c);
    c.take = (e) => (e.way === 'noise' && e.from === 'punch' ? undefined : take(e));
  });
  assert.deepEqual(r.heard, []);
  assert.ok(!r.awake);
});

/** he stands at the top's far end and walks off it (right held): a 400 px drop onto the toy floor, about 300 px short of the sleeper */
function dropOnto(row: 'moss' | 'stone', plant?: (c: CastPlay) => void) {
  return inPlay(row, ({ sim, e, cast, heard, floor }) => {
    assert.ok(e.kit!.asleep, 'it starts asleep');
    const top = dropTop((sim as unknown as { e: { platforms: Platform[] } }).e.platforms, floor);
    assert.ok(top, `the section's top, ${DROP} px over the toy floor`);
    // (toward the floor: the top's end over it, facing it)
    const dir = top.x < floor.x ? 1 : -1;
    sim.stand(dir > 0 ? top.x + top.width - 40 : top.x + 40, top.y);
    teleported(cast);
    sim.p.facing = dir;
    for (let f = 0; f < 5; f++) sim.frame();
    assert.ok(e.kit!.asleep && sim.p.grounded && Math.abs(sim.p.y - top.y) < 2, 'he stands on the top; the sleeper sleeps');
    heard.length = 0;
    let off = NaN;
    let landX = NaN;
    let by = NaN;
    for (let f = 0; f < 30 * 3 && Number.isNaN(landX); f++) {
      sim.frame(dir > 0 ? { right: true } : { left: true });
      if (Number.isNaN(off) && !sim.p.grounded) off = sim.p.y;
      if (!Number.isNaN(off) && sim.p.grounded) (landX = sim.p.x + sim.p.width / 2), (by = Math.abs(e.kit!.x - landX));
    }
    assert.ok(!Number.isNaN(landX) && Math.abs(sim.p.y - floor.y) < 2, 'he walked off the top and landed on the toy floor');
    const fell = floor.y - top.y;
    for (let f = 0; f < 15; f++) sim.frame();
    return { awake: !e.kit!.asleep, heard: [...heard], fell, by };
  }, plant);
}

test('in play: a 400 px drop onto moss wakes nothing; onto stone it wakes World 3\'s sleeping ocelot 300 px off', (t) => {
  const moss = dropOnto('moss');
  assert.deepEqual(moss.heard, [], 'moss: no noise at all');
  assert.ok(!moss.awake, 'moss: it sleeps on');
  const stone = dropOnto('stone');
  assert.deepEqual(stone.heard, ['landing'], 'stone: the landing is heard');
  assert.ok(stone.awake, 'stone: it wakes (a 400 px fall carries 360 px)');
  for (const [k, r] of [['moss', moss], ['stone', stone]] as const) {
    assert.ok(Math.abs(r.fell - DROP) <= DROP_TOL, `${k}: the fall is the section's own ${DROP} px as the roll lays it (${r.fell} px)`);
    assert.ok(Math.abs(r.by - 300) <= 30, `${k}: the sleeper lies about 300 px past where he lands (${r.by.toFixed(0)} px)`);
  }
  t.diagnostic(`drop: moss (${moss.fell} px) ${moss.awake ? 'woke' : 'slept'} [${moss.heard}] (sleeper ${moss.by.toFixed(0)} px off), stone (${stone.fell} px) ${stone.awake ? 'woke' : 'slept'} [${stone.heard}] (${stone.by.toFixed(0)} px off)`);
});

test('planted: the ground\'s quiet ignored (the cast hears every landing as on stone) -> the sleeper by the moss wakes', (t) => {
  const r = dropOnto('moss', (c) => {
    const step = c.step.bind(c);
    c.step = (h: CastHero, ...a) => step({ ...h, quiet: false }, ...a);
  });
  assert.ok(r.awake, 'moss ignored: the 400 px drop wakes it');
  assert.deepEqual(r.heard, ['landing']);
  t.diagnostic(`planted: moss ignored -> ${r.awake ? 'woke' : 'slept'} [${r.heard}] (sleeper ${r.by.toFixed(0)} px off)`);
});

/** the moss toy's kit with its declared drop taken off: an ordinary section, which the corridor refuses */
const undeclared = (): WorldKit => {
  const k = kitOf('moss');
  return { ...k, manifest: { ...k.manifest, sections: k.manifest.sections.map((t) => (t.id === sectionOf('moss').id ? { ...t, drop: undefined } : t)) } };
};
/** how many rolls (seeds 1-40, Normal) of `config` on `kit` lay the moss toy, and how many of those are clean */
const laysToy = (config: LevelConfig, kit: WorldKit) => {
  let laid = 0, clean = 0;
  for (let seed = 1; seed <= 40; seed++) {
    const st = buildGen2Stage({ config, kit, seed, difficulty: 'normal' });
    if (st.gen2.sections.some((q) => q.template === sectionOf('moss').id)) (laid++, st.gen2.errors?.length || clean++);
  }
  return { laid, clean };
};

test('ENG-DROP: the drop toy is laid on 3-2\'s run past the corridor, in view (the camera\'s own look finds its landing; nothing across its fall)', (t) => {
  assert.equal(along.travel ?? 'right', 'right', '3-2\'s draft travels along');
  assert.equal(draftRow(ALONG)?.kit, 'w3');
  const { st, seed } = built('moss');
  const e = st.enemies.find((q) => q.type === 'ocelot' && toyFloor(st.platforms, q, W3_OCELOT.footY ?? 0, 'moss'))!;
  const floor = toyFloor(st.platforms, e, W3_OCELOT.footY ?? 0, 'moss')!;
  const top = dropTop(st.platforms, floor)!;
  assert.equal(dropSeen(top, floor, st.platforms), undefined, 'the laid drop is in view');
  assert.ok(!st.gen2.tower, 'a run, not a tower');
  t.diagnostic(`3-2 seed ${seed}: the moss toy's drop ${Math.round(floor.y - top.y)} px, laid clean`);
});

test('PLANTED: the corridor exemption removed (the toy\'s drop undeclared) -> no roll of 3-2 lays the drop toy', (t) => {
  const r = laysToy(along, undeclared());
  assert.equal(r.laid, 0, `undeclared, the 400 px drop leaves the corridor: never laid (${r.laid} of 40)`);
  t.diagnostic(`undeclared: laid ${r.laid} of 40`);
});

test('ENG-DROP: a declared drop is never laid in a tower (3-1\'s way down): no roll lays it', (t) => {
  const r = laysToy(cfg, kitOf('moss'));
  assert.equal(r.laid, 0, `3-1's tower: the declared drop is laid ${r.laid} of 40`);
  t.diagnostic(`tower: laid ${r.laid} of 40`);
});

test('ENG-DROP: a designed drop not in view is refused BY NAME: wood across its fall; a fall past the view (dropSeen)', () => {
  const { st } = built('moss');
  const e = st.enemies.find((q) => q.type === 'ocelot' && toyFloor(st.platforms, q, W3_OCELOT.footY ?? 0, 'moss'))!;
  const floor = toyFloor(st.platforms, e, W3_OCELOT.footY ?? 0, 'moss')!;
  const top = dropTop(st.platforms, floor)!;
  const f = floor.x > top.x ? 1 : -1;
  const lip = f > 0 ? top.x + top.width : top.x;
  const wood = { ...floor, x: f > 0 ? lip + 20 : lip - 120, width: 100, y: top.y + 280, quiet: undefined } as Platform;
  assert.match(dropSeen(top, floor, [...st.platforms, wood]) ?? '', /^has wood across its fall/, 'wood 280 px under the lip: named');
  const deep = { ...floor, y: top.y + 700 } as Platform;
  assert.match(dropSeen(top, deep, st.platforms.map((p) => (p === floor ? deep : p))) ?? '', /^falls 700 px, past what the view shows under him/, 'a 700 px fall: named');
});

/**
 * The glow that agrees with the log (R-165.289; ENG-24c, letGoCue.ts). On a liana over a log river the swing's glow (engine.ts
 * sweetGlow, as drawn) says "let go now" only when a let-go pressed now comes down on a log or past the water on the bank
 * ahead; World 1's glow (the sweet spot) said "now" over the water (BUILD-24: 14-59% of swings on 2-4's rows), against 2-4's "Let go when
 * it's under you". Proven on the real engine, never on the model it reads:
 *   - ENG-24's drop toy (tools/inspect/lianaRiverToys.ts: a liana over a river laid by gen2, the listed row, rolled the game's way), on
 *     the rows 2-4 lays (long, gap280 / Easy's deep, the raft row), both settings, facing back too: over two whole log cycles he hangs
 *     and every frame's DRAWN glow is read (it eases in, and over a river goes out the frame the moment passes); then each frame's let-go is pressed FOR REAL (the same hang to that frame, a flick through the
 *     game's own touch input, InputEngine, as the phone sends it) and where he comes down is read. No frame is lit whose let-go comes down
 *     in the water, and it is lit on at least 80% of the frames whose let-go lands (measured 11-18 at the head: 83% on gap280 Normal,
 *     88-97% on the rest; about a frame shorter at each end);
 *   - PLANTED: World 1's glow alone (the sweet spot) lights over the water on the same frames (measured: long 7 / Easy 11, gap280 24,
 *     the raft row 4 / 4); planted-faults.py (reference/qa-reports/ENG-24c) puts the sweet spot back in the engine and turns the margin
 *     off: both go red;
 *   - 1-6's glow is unchanged: no river under its lianas, the glow is the sweet spot on every frame, and no let-go is flown;
 *   - flown once per hold, never on the play frame: a long hang flies one table; while his grip moves the river says nothing;
 *   - the judge flies the very same flight (gen2/riverLay.ts letGoFall, fallOnLog) and reads exactly as before it was shared.
 * (No leaf: the glide is World 4's skill (skills.ts, 4-1), so a player meeting 2-4 has none, and the judge and the bot fly none. A player
 * who comes back to 2-4 with it and HOLDS the jump glides past where the glow reads: named in the ENG-24c REPORT.)
 */
import './headlessDom.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { withTestStage } from './gen2/listed.ts';
import { buildGen2Stage, keptFoes } from './gen2/pipeline.ts';
import { packPlan, plantSeedList } from './gen2/seedList.ts';
import { layRiver, lianaDrops } from './gen2/riverLay.ts';
import { w2Finish } from './gen2/worlds/w2.ts';
import { RealPlay, withFixtureConfig, DT } from './realPlay.ts';
import { setDifficulty, type Difficulty } from './difficulty.ts';
import { inSweetSpot, setTimedSwing, TIMED, vinePeriod } from './physics.ts';
import { GLOW_SHOWN } from './letGoCue.ts';
import type { Vine } from './types.ts';
import { cfg, fixtureSeed, ID, kitFor, TOY_RIVERS, type ToyRiver } from '../../tools/inspect/lianaRiverToys.ts';

type Eng = { sweetGlow: number; sweetSnap: unknown; swingLeapWait: number; skills: Set<string>; cueTables: Map<string, unknown>; currentStage: { rivers?: Array<{ x0: number; x1: number; speed: number; surfaceY: number }> } };

/** the drop toy over `row` (Easy lays `easyRow`), rolled the game's way, on the real engine through the game's own touch input */
function onToy<T>(row: ToyRiver, easyRow: ToyRiver, setting: Difficulty, fn: (r: RealPlay, e: Eng) => T): T {
  const seed = fixtureSeed('drop', row, ['normal', 'easy'], easyRow);
  assert.ok(seed !== null, `no roll lays the drop toy over ${row} clean`);
  const kit = kitFor('drop', row, easyRow);
  const st = buildGen2Stage({ config: cfg, kit, seed: seed!, difficulty: 'normal' });
  const dict: string[] = [];
  const packed = packPlan({ seed: st.gen2.seed, rerolls: st.gen2.rerolls, plan: st.gen2.plan, foes: [...keptFoes(st)] }, dict);
  return withTestStage({ [ID]: { kit: () => kit, world: (s, _sq, d) => w2Finish(s as never, d) as typeof s, seeds: [] } }, () => {
    const undo = plantSeedList(ID, { dict, seeds: [seed!], plans: [packed] });
    try {
      return withFixtureConfig(cfg, () => {
        setDifficulty(setting);
        const r = new RealPlay(ID, 1);
        r.useRealInput();
        const e = r.e as unknown as Eng;
        e.skills.delete('glide');
        return fn(r, e);
      });
    } finally {
      undo();
      setDifficulty('normal');
    }
  });
}

/** the vines' and the river's clocks as the read starts (any: the read covers two whole log cycles from here) */
const VC0 = 20, GT0 = 11.3;

interface Read { frames: number; lands: number; lit: number; litLands: number; overWater: number[]; sweetOverWater: number }

/** hold liana's `grip` share facing `dir`; every frame of two log cycles: the glow, World 1's sweet spot, and where a real let-go lands */
function readCue(r: RealPlay, e: Eng, dir: 1 | -1, grip = 0.7): Read {
  const v = r.vines.find((q) => q.vineType === 'swing_liana')!;
  const river = (e.currentStage.rivers ?? []).find((q) => q.speed > 0)!;
  const logs = r.platforms.filter((q) => q.type === 'drift' && q.drift && q.drift.x0 === river.x0);
  const d0 = logs[0].drift!;
  const T = vinePeriod(v);
  const F = Math.round(Math.max((d0.x1 - d0.x0 + d0.width) / logs.length / d0.speed, T) / DT) * 2;
  const L = (v.bottomY - v.topY) * grip;
  const pad = dir === 1 ? { right: true } : { left: true };
  const mid = (river.x0 + river.x1) / 2;
  // (on the liana a whole swing before the read, so the engine's memory of the sweet spot, sweetSnap, is a real one)
  const start = () => {
    // (the game clock FIRST: since ENG-285 1c (R-165.295) the vine clock is gameTime + vineShift and RealPlay.swing places the swing
    //  against the game time now; set after, every restart read the glow at one phase and pressed at another. ENG-285b's diagnosis,
    //  2:28 PM ET 11-19; the guard keeps the order)
    r.t = GT0 - T;
    r.swing(v, { angle: 0, omega: 0, len: L, t: VC0 - T });
    assert.ok(Math.abs(r.vineClock - (VC0 - T)) < 1e-9 && Math.abs(r.t - (GT0 - T)) < 1e-9, `set-up: vine clock ${r.vineClock}, game clock ${r.t}`);
    e.sweetSnap = null;
    e.swingLeapWait = 0;
    for (let i = 0; i < Math.round(T / DT); i++) r.frame(pad);
  };
  start();
  const glow: boolean[] = [], sweet: boolean[] = [];
  for (let f = 0; f < F; f++) {
    r.frame(pad);
    // (what the screen draws: engine.ts render draws the glow above GLOW_SHOWN)
    glow.push(e.sweetGlow > GLOW_SHOWN);
    sweet.push(inSweetSpot({ angle: r.p.swingAngle ?? 0, omega: r.p.swingAngularVelocity ?? 0, len: r.p.swingLength ?? L, amp: v.swingAmp }, dir));
  }
  // (each frame's let-go pressed for real: a flick, the touch layer holding it its least, his thumb steering on; a log, or the bank
  //  ahead, is a landing; the water, or the bank behind, is not)
  const lands = (f: number): boolean => {
    start();
    for (let i = 0; i < f; i++) r.frame(pad);
    r.frame({ ...pad, press: true });
    for (let k = 1; k < 150; k++) {
      r.frame(pad);
      if (r.p.isVineSwinging) continue;
      if (r.p.grounded) return r.platforms.find((q) => q.id === r.standingOn)?.type === 'drift' || (dir === 1 ? r.p.x > mid : r.p.x < mid);
      if (r.died || r.p.y > river.surfaceY + 60) return false;
    }
    return false;
  };
  const out: Read = { frames: F, lands: 0, lit: 0, litLands: 0, overWater: [], sweetOverWater: 0 };
  for (let f = 0; f < F; f++) {
    const ok = lands(f);
    if (ok) out.lands++;
    if (glow[f]) out.lit++;
    if (glow[f] && ok) out.litLands++;
    if (glow[f] && !ok) out.overWater.push(f);
    if (sweet[f] && !ok) out.sweetOverWater++;
  }
  return out;
}

const CASES: Array<[ToyRiver, ToyRiver, Difficulty, 1 | -1]> = [
  ['long', 'long', 'normal', 1], ['long', 'long', 'easy', 1], ['gap280', 'deep', 'normal', 1], ['gap280', 'deep', 'easy', 1],
  ['raft', 'raft', 'normal', 1], ['raft', 'raft', 'easy', 1], ['long', 'long', 'easy', -1],
];

test('over a log river the glow lights only when a let-go pressed now comes down on a log (real let-gos, both settings, facing back); PLANTED: World 1\'s glow lights over the water', () => {
  let sweetWet = 0;
  for (const [row, easyRow, setting, dir] of CASES) {
    const at = `${row}${easyRow !== row ? `/${easyRow}` : ''} ${setting}${dir < 0 ? ' facing back' : ''}`;
    const rd = onToy(row, easyRow, setting, (r, e) => readCue(r, e, dir));
    assert.ok(rd.lands >= rd.frames * 0.3, `${at}: only ${rd.lands} of ${rd.frames} let-gos land (the toy is not the row it names)`);
    assert.deepEqual(rd.overWater, [], `${at}: lit on ${rd.overWater.length} frames whose let-go comes down in the water (frames ${rd.overWater.join(',')})`);
    assert.ok(rd.litLands >= rd.lands * 0.8, `${at}: lit on ${rd.litLands} of the ${rd.lands} frames whose let-go lands, under 80%`);
    if (row === 'gap280' && setting === 'normal') sweetWet = rd.sweetOverWater;
  }
  assert.ok(sweetWet >= 10, `PLANTED: World 1's glow alone over gap280 lights over the water on ${sweetWet} frames (measured 24)`);
});

test('1-6\'s glow is unchanged: no river under its lianas, the drawn glow eases to the sweet spot on every frame as before, both ways; no let-go is flown', () => {
  const r = new RealPlay('1-6', 1);
  const e = r.e as unknown as Eng;
  const lianas = r.vines.filter((v) => v.vineType === 'swing_liana');
  assert.ok(lianas.length >= 3, `1-6 has ${lianas.length} lianas`);
  let frames = 0, sweetFrames = 0;
  for (const v of lianas) {
    for (const dir of [1, -1] as const) {
      const pad = dir === 1 ? { right: true } : { left: true };
      r.swing(v, { angle: 0, omega: 0, len: (v.bottomY - v.topY) * 0.7, t: VC0 });
      e.sweetGlow = 0;
      // (World 1's glow, as engine.ts always eased it: toward the sweet spot, 14 a second)
      let g = 0;
      for (let f = 0; f < Math.round(vinePeriod(v) / DT) + 5; f++) {
        r.frame(pad);
        if (!r.p.isVineSwinging) break;
        const sweet = inSweetSpot({ angle: r.p.swingAngle ?? 0, omega: r.p.swingAngularVelocity ?? 0, len: r.p.swingLength ?? 0, amp: v.swingAmp }, dir);
        g += ((sweet ? 1 : 0) - g) * Math.min(1, DT * 14);
        assert.ok(Math.abs(e.sweetGlow - g) < 1e-9, `the liana at x=${v.x}, facing ${dir}, frame ${f}: drawn glow ${e.sweetGlow.toFixed(3)}, World 1's ${g.toFixed(3)}`);
        frames++;
        if (sweet) sweetFrames++;
      }
    }
  }
  assert.ok(frames > 300 && sweetFrames > 50, `read ${frames} frames, ${sweetFrames} in the sweet spot`);
  assert.equal(e.cueTables.size, 0, 'a let-go table was flown on a stage with no river under a liana');
});

test('flown once per hold, never on the play frame: a long hang flies one table; while his grip moves the river says nothing, then it reads again', () => {
  onToy('long', 'long', 'normal', (r, e) => {
    const v = r.vines.find((q) => q.vineType === 'swing_liana')!;
    r.swing(v, { angle: 0, omega: 0, len: (v.bottomY - v.topY) * 0.7, t: VC0 });
    let lit = 0;
    for (let f = 0; f < 3 * Math.round(vinePeriod(v) / DT); f++) { r.frame({ right: true }); if (e.sweetGlow > GLOW_SHOWN) lit++; }
    assert.ok(lit > 0, 'the glow never lit over `long` in three swings');
    assert.equal(e.cueTables.size, 1, `three swings at one hold flew ${e.cueTables.size} tables`);
    for (let f = 0; f < 6; f++) {
      const was = r.p.swingLength;
      r.frame({ right: true, up: true });
      assert.ok(r.p.swingLength !== was, 'the climb did not move his grip');
      assert.equal(e.sweetGlow, 0, `climbing, frame ${f}: the glow drawn while his grip moved`);
    }
    for (let f = 0; f < Math.round(vinePeriod(v) / DT); f++) r.frame({ right: true });
    assert.equal(e.cueTables.size, 2, 'at rest at the new hold, one more table');
  });
});

test('the judge flies the shared flight (riverLay letGoFall, fallOnLog) and reads the final model\'s numbers (t-eng-285 ba6b225b)', () => {
  // (lianaRiver.test.ts's world: a liana over a toy row laid from a bank ending at 2000, its top `top`, `len` long, out `dx`)
  // (RE-PINNED at BUILD-24c's merge of ENG-285's final model, ba6b225b, the lead's ruling 2:23 PM ET 11-19: the press now climbs his hold
  //  before he leaves (physics.ts pressClimb, R-165.294) and the judge flies from there. Moved from origin/t-meter-3 42459a5c's numbers:
  //  long N share 0.857086 -> 0.859273; gap280 N 0.413337 -> 0.412741, wait 2.7333 -> 2.7; deep E 0.888129 -> 0.886825, wait 0.5667
  //  -> 0.6; long E 0.915307 -> 0.917206, wait 0.6667 -> 0.7)
  const want: Array<[ToyRiver, Difficulty, number, number, number, number, number, number, number]> = [
    ['long', 'normal', 165, 390, 410, 0.45, 0, 0.8592725104353012, 0.6],
    ['gap280', 'normal', 300, 450, 320, 0.45, 0.81, 0.4127410057642616, 2.7],
    ['deep', 'easy', 165, 390, 410, 0.45, 0, 0.8868252416639514, 0.6],
    ['long', 'easy', 120, 300, 380, 0.3, 0.37, 0.9172062505395838, 0.7],
  ];
  try {
    for (const [row, d, dx, top, len, amp, ph, share, wait] of want) {
      setDifficulty(d);
      setTimedSwing(d === 'easy');
      let id = 100;
      const { logs } = layRiver(TOY_RIVERS[row], 2000, 800, () => id++);
      const v = { id: 50, x: 2000 + dx, topY: top, bottomY: top + len, vineType: 'swing_liana', isSwingingVine: true, swingAmp: amp, swingPeriod: TIMED.period, swingPhase: ph, swaySpeed: 1, swayPhase: 0 } as unknown as Vine;
      const got = lianaDrops(v, logs.map((p) => p.drift!), d);
      assert.equal(got.share, share, `${row} ${d}: share`);
      assert.equal(got.wait, wait, `${row} ${d}: wait`);
    }
  } finally {
    setDifficulty('normal');
    setTimedSwing(false);
  }
});

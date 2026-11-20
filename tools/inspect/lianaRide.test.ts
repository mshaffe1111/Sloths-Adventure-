// npx tsx --test tools/inspect/lianaRide.test.ts   (CI: gates.yml, the engine tools' tests)
/**
 * The bot toys for a liana over a river (level.md rule 21, ENG-24; reference/design/2-4.md NEW 2), before 2-4 is laid: the toy stages of
 * lianaRiverToys.ts, rolled the game's way, played by the middle tier bot with the engine driven through the game's own InputEngine
 * (RealPlay.useRealInput: the touch layer's calls and its minimum hold, never FakeInput's bare press).
 *   - DROP ON A LOG (firsttimer.ts SKILLS.dropOnLog) on the design's widest relay row, gap280 (41% of let-gos land; Easy's twin `deep`):
 *     with the skill he lets go only when the let-go comes down on a log and crosses with no life lost (measured 11-18: 0 lives on each of
 *     variants 1-5, Normal); PLANTED: without it he lets go at the swing's forward end whatever the logs do (8 lives over the same five).
 *     ENG-285b (11-19, the lead's ruling A): with the bot's hop judged as the engine plays it (firsttimer.ts hopAim, takeOffStep), variant 3
 *     sees a hop from the bank straight onto a drifting log, lands it and rides across (0 lives), never catching the liana: a real shortcut
 *     of the toy's river, asserted here, not hidden. So it is run over variants 1-6: at least 5 catch the liana (as many swinging runs as
 *     before), every one that does lets go onto a log, one that does not crosses on a log with no life lost (measured 11-19: 6 of 7 catch,
 *     each onto a log; v3 rides; planted, without the skill: 24 lives over 1-5).
 *   - A VINE FROM A LOG (SKILLS.vineFromLog) on the catch toy (a liana no bank reaches, 320 px long, over `twin`; Easy's twin `long`): he
 *     rides a log under it and jumps up to it (measured: caught off a log in 4 of 5 variants on each setting); PLANTED: without it he
 *     rides the log to the bank every time (0 of 10).
 *   - A VINE OVER THE TAIL (SKILLS.vineOverTail, ENG-24g, level.md rule 21) on the tail toy (2-4's beat 4 on Normal: `twin` with a 430 px
 *     TAIL, the liana 110 px past where the logs go under, 340 long, DEEP): the judge's own reach holds (riverLay.ts logCatches: a jump off
 *     a log catches it) and the child, middle and expert bots ride a log and jump to it, every run (measured 11-20: 15 of 15 to the shrine
 *     with no rescue, each caught off a log, 12 lives in all); PLANTED: looking for a liana only over the logs' window (the old reach) he
 *     rides into the tail and drowns until the harness rescues him (13 of 15 rescued, 139 lives) - 2-4's castBots FAIL of 11-19.
 */
import '../../src/game/headlessDom.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import { RealPlay, DT } from '../../src/game/realPlay.ts';
import type { Platform, Vine } from '../../src/game/types.ts';
import { groundStep, PHYS, swingSetup, vinePeriod } from '../../src/game/physics.ts';
import { MIN_TOUCH_JUMP_HOLD_MS } from '../../src/game/inputEngine.ts';
import { hopAim, hopCatchAt, hopCatches, pressIn, PRESS_TRACE, SKILLS, touchHeld } from './firsttimer.ts';
import { fixtureSeed, lianaRun, toyStage } from './lianaRiverToys.ts';
import { logCatches } from '../../src/game/gen2/riverLay.ts';
import { lianasOverLogs, onRiver, riverEnd } from '../../src/game/river.ts';

const VARIANTS = [1, 2, 3, 4, 5];
const at = (r: ReturnType<typeof lianaRun>, toy: string) => r.pieces.find((q) => q.id === `toy-liana-${toy}`);

test('the harness drives the engine through the real InputEngine: a Pad tap at a run is the real hop (0.43 s, 2-4.md R-165.284), never FakeInput\'s', () => {
  const air = (real: boolean) => {
    const r = new RealPlay('2-1', 1);
    r.bare([{ id: 1, x: 0, y: 800, width: 8000, height: 200, type: 'solid' } as Platform]);
    r.stand(600, 800);
    if (real) r.useRealInput(80);
    for (let i = 0; i < 40; i++) r.frame({ right: true });
    // (a tap: pressed, and lifted the next frame; InputEngine keeps the press its minimum hold from the take-off, FakeInput drops it)
    r.frame({ press: true, right: true });
    let f = 1;
    while (f < 90) { r.frame({ right: true }); f++; if (r.p.grounded) break; }
    return f * DT;
  };
  assert.ok(Math.abs(air(true) - 0.43) <= 0.04, `the real tap hop: ${air(true).toFixed(2)} s`);
  assert.ok(air(false) <= 0.34, `FakeInput's bare press: ${air(false).toFixed(2)} s (the short hop no thumb makes, 0.30 s)`);
});

test('DROP ON A LOG: on gap280 the middle bot lets go onto a log and loses no life; PLANTED: without the skill he drowns', () => {
  const seed = fixtureSeed('drop', 'gap280', ['normal', 'easy'], 'deep');
  assert.ok(seed !== null, 'no roll lays the gap280 drop toy clean');
  // (ruling A, ENG-285b: variants 1-6, at least 5 of them catching the liana; see the head of this file)
  const DROP_VARIANTS = [1, 2, 3, 4, 5, 6];
  const lives = (on: boolean) => {
    const was = SKILLS.dropOnLog;
    SKILLS.dropOnLog = on;
    try {
      let caughtRuns = 0;
      const out = DROP_VARIANTS.map((v) => {
        // (counted from the engine frame by frame: the catches of the liana, and a frame stood on a drifting log)
        let catches = 0, swinging = false, onLog = false;
        const r = lianaRun('drop', 'gap280', 'middle', 'normal', seed!, v, 'deep', { realInput: true, onFrame: (sim) => {
          if (sim.p.isVineSwinging && !swinging) catches++;
          swinging = !!sim.p.isVineSwinging;
          if (sim.p.grounded && sim.platforms.find((q) => q.id === sim.standingOn)?.type === 'drift') onLog = true;
        } });
        assert.equal(r.end, 'shrine', `v${v} ${on ? 'on' : 'off'}: ended ${r.end}`);
        const lost = at(r, 'drop')?.lives ?? 0;
        if (on && catches > 0) {
          caughtRuns++;
          assert.ok(r.ontoLog >= 1, `v${v}: caught the liana ${catches} times and no let-go came down on a log`);
        }
        // (the shortcut, v3 on 11-19: no liana, a hop from the bank onto a log and a ride to the far bank, no life lost)
        if (on && catches === 0) assert.ok(onLog && lost === 0, `v${v}: never caught the liana and ${onLog ? `lost ${lost} lives` : 'never stood on a log'} crossing`);
        return lost;
      });
      if (on) assert.ok(caughtRuns >= 5, `with the skill: ${caughtRuns} of ${DROP_VARIANTS.length} variants caught the liana (5 or more give the skill's evidence)`);
      return out;
    } finally { SKILLS.dropOnLog = was; }
  };
  const on = lives(true), off = lives(false);
  assert.ok(on.reduce((a, b) => a + b, 0) <= 1, `with the skill: lives at the river ${on.join(',')}`);
  assert.ok(off.reduce((a, b) => a + b, 0) >= 4, `PLANTED, without it: lives ${off.join(',')} (measured 8 over five on 11-18, 24 over 1-5 on 11-19)`);
});

test('A VINE FROM A LOG: on the catch toy the middle bot jumps from the moving log to the liana; PLANTED: without the skill, never', () => {
  const seed = fixtureSeed('catch', 'twin', ['normal', 'easy'], 'long');
  assert.ok(seed !== null, 'no roll lays the catch toy clean');
  for (const setting of ['normal', 'easy'] as const) {
    const caught = (on: boolean) => {
      const was = SKILLS.vineFromLog;
      SKILLS.vineFromLog = on;
      try {
        return VARIANTS.map((v) => {
          const r = lianaRun('catch', 'twin', 'middle', setting, seed!, v, 'long', { realInput: true });
          assert.equal(r.end, 'shrine', `${setting} v${v} ${on ? 'on' : 'off'}: ended ${r.end}`);
          return r.fromLog;
        });
      } finally { SKILLS.vineFromLog = was; }
    };
    const on = caught(true), off = caught(false);
    assert.ok(on.filter((n) => n >= 1).length >= 4, `${setting}, with the skill: catches off a log ${on.join(',')}`);
    assert.deepEqual(off.filter((n) => n >= 1), [], `${setting}, PLANTED, without it: ${off.join(',')}`);
  }
});

test('A VINE OVER THE TAIL (ENG-24g, rule 21): on the tail toy the judge\'s own reach holds and child, middle and expert jump from the moving log to the liana past the logs\' end, every run; PLANTED: looking only over the logs\' window, he rides into the tail until rescued', () => {
  const seed = fixtureSeed('tail', 'tail', ['normal']);
  assert.ok(seed !== null, 'no roll lays the tail toy clean');
  // (the toy is the case: a tailed river, its one liana over the tail (past where the logs go under, before the far bank), no bank reaches
  //  it, and the judge says a jump off a log catches it; Normal only, as 2-4's tail)
  const st = toyStage('tail', 'tail', seed!, 'normal');
  const r = (st.rivers ?? []).find((q) => q.speed > 0)!;
  const d = st.platforms.find((q) => q.type === 'drift' && q.drift && onRiver(q.drift, r))!.drift!;
  const v = st.vines.find((q) => q.vineType === 'swing_liana')!;
  assert.ok((d.tail ?? 0) >= 418, `a tailed river (tail ${d.tail})`);
  assert.ok(v.x > d.x1 && v.x < riverEnd(d), `the liana at ${v.x} hangs over the tail ${d.x1}-${riverEnd(d)}`);
  assert.deepEqual(lianasOverLogs(st.vines, r), [], 'no liana over the logs\' window');
  assert.ok(logCatches(v, d), 'the judge\'s own reach: a jump off a log catches it');
  const runs = (on: boolean) => {
    const was = SKILLS.vineOverTail;
    SKILLS.vineOverTail = on;
    try {
      return (['child', 'middle', 'expert'] as const).flatMap((tier) => VARIANTS.map((n) => ({ tier, n, r: lianaRun('tail', 'tail', tier, 'normal', seed!, n, 'tail', { realInput: true }) })));
    } finally { SKILLS.vineOverTail = was; }
  };
  const say = (xs: ReturnType<typeof runs>) => xs.map(({ tier, n, r: q }) => `${tier} v${n}: ${q.end} from ${q.fromLog} rescues ${q.rescues} lives ${q.lives}`).join('; ');
  const on = runs(true), off = runs(false);
  assert.ok(on.every(({ r: q }) => q.end === 'shrine' && q.rescues === 0 && q.fromLog >= 1), `with the skill: ${say(on)}`);
  assert.ok(off.filter(({ r: q }) => q.rescues >= 1).length >= 12, `PLANTED, without it (measured 13 of 15 rescued): ${say(off)}`);
});

test('the bot aims its presses at the frame they reach the engine (ENG-285, R-165.294: the drop aim read the vine and the logs one frame early): every decided press of the middle bot over the gap280 drop, both settings, lands on the game time it aimed at', () => {
  const seed = fixtureSeed('drop', 'gap280', ['normal', 'easy'], 'deep');
  assert.ok(seed !== null, 'no roll lays the gap280 drop toy clean');
  PRESS_TRACE.on = true;
  PRESS_TRACE.rows.length = 0;
  try {
    for (const setting of ['normal', 'easy'] as const) for (const v of [1, 2, 3]) lianaRun('drop', 'gap280', 'middle', setting, seed!, v, 'deep', { realInput: true });
    const rows = PRESS_TRACE.rows;
    assert.ok(rows.length >= 12, `decided presses traced: ${rows.length}`);
    const off = rows.filter((r) => Math.abs(r.got - r.want) > 1e-6);
    assert.deepEqual(off.map((r) => `aimed ${r.want.toFixed(3)}, reached ${r.got.toFixed(3)}`), [], `${off.length} of ${rows.length} presses reached the engine off the frame aimed`);
  } finally {
    PRESS_TRACE.on = false;
    PRESS_TRACE.rows.length = 0;
  }
});

/**
 * ENG-285b (R-165.297): the bot's hop aims for a liana (lianaWait off a lip, vineFromLog off a log) fly the press as the engine plays it.
 * Both aimed at `clock + lag`: the vine read a frame early (the engine's catch reads his place after a frame against the NEXT frame's
 * clock) and the lag never rounded to the frame the press reaches the engine on (pressIn); and the hop's first frame was flown in the air
 * where the engine steers it on the ground (takeOffStep). Here a press decided now with thumb lag `lag` is played into the REAL engine
 * (the game's own InputEngine) the way the bot plays it: the steer held through the lag (lianaWait's pending press) or nothing held (a
 * stand, vineFromLog's `still`), the press on the frame pressIn names, the jump held as pressHold holds it. The aim (hopAim) must name
 * the engine's take-off (his place on the frame before the press, the vines' clock on the press's), and the bot's own verdict (hopCatches
 * from that aim) must be the engine's catch, on every lag, take-off spot and moment of two lianas' swings.
 */
test('the bot\'s liana hop aims (lianaWait, vineFromLog) name the engine\'s take-off and catch, to the frame: hopAim + hopCatches vs the real engine, every lag, spot and moment (R-165.297)', () => {
  const G = 2000;
  const bank = { id: 1, x: 0, y: G, width: 1200, height: 40, type: 'solid' } as Platform;
  const VINES = [
    { id: 7, x: 1290, topY: G - 560, bottomY: G - 120, swaySpeed: 1, swayPhase: 0, vineType: 'swing_liana', isSwingingVine: true },
    { id: 8, x: 1330, topY: G - 480, bottomY: G - 90, swaySpeed: 1.3, swayPhase: 0.4, vineType: 'swing_liana', isSwingingVine: true },
  ] as Vine[];
  // (each its own swing, as a stage with one liana here sets it up: side by side, two this close would have no room to swing at all)
  for (const v of VINES) swingSetup([v]);
  assert.ok(VINES.every((v) => (v.swingAmp ?? 0) > 0.3), 'set-up: both lianas swing');
  let n = 0, caughtN = 0, missedN = 0, worstX = 0;
  const wrong: string[] = [];
  for (const v of VINES) {
    const P = vinePeriod(v);
    for (const mode of ['run', 'stand'] as const) {
      for (const lag of [0.01, 0.03, 0.05, 0.09, 0.13, 0.2]) {
        for (const x0 of mode === 'run' ? [1010, 1060, 1110] : [1080, 1130, 1170]) {
          for (const own of [0.16, 0.3]) {
            for (let s = 0; s < 12; s++) {
              const r = new RealPlay('2-1', 1);
              r.e.skills.delete('glide');
              r.bare([bank], [{ ...v }]);
              r.useRealInput();
              r.stand(x0, G);
              r.p.vx = mode === 'run' ? PHYS.maxRun : 0;
              r.t = 50;
              r.vineClock = (P * s) / 12;
              // (the bot reads him now; the press it decides on reaches the engine pressIn(lag) on)
              const now = { x: r.p.x, vx: r.p.vx, clock: r.vineClock };
              const aim = hopAim(lag);
              const hold = touchHeld(own, MIN_TOUCH_JUMP_HOLD_MS);
              const k = Math.round(pressIn(lag) / DT);
              const steer = mode === 'run' ? { right: true } : {};
              for (let i = 1; i < k; i++) r.frame(steer);
              const what = `vine ${v.id} ${mode} lag ${lag} from ${x0} hold ${own} moment ${s}/12`;
              // (lianaWait's run-up while the press comes, as the bot flies it; a stand stays put)
              const run = { x: now.x, y: G, vx: now.vx, vy: 0 };
              for (let f = Math.round(aim.off / DT); f > 0; f--) groundStep(run, DT, mode === 'run' ? 1 : 0);
              const dx = Math.max(Math.abs(r.p.x - run.x), Math.abs(r.p.vx - run.vx) * DT);
              worstX = Math.max(worstX, dx);
              assert.ok(dx < 1e-6, `${what}: he takes off from ${r.p.x.toFixed(2)} at ${r.p.vx.toFixed(1)}, the aim says ${run.x.toFixed(2)} at ${run.vx.toFixed(1)}`);
              assert.ok(r.p.grounded, `${what}: still on the bank when the press comes`);
              r.frame({ right: true, press: true, jump: true });
              assert.ok(Math.abs(r.vineClock - (now.clock + aim.clock)) < 1e-6, `${what}: the press's frame is at vine clock ${r.vineClock.toFixed(4)}, the aim says ${(now.clock + aim.clock).toFixed(4)}`);
              // (the frame after the press's on which the engine has him on the liana, -1 for none)
              let at = -1;
              for (let i = 0; i < 60; i++) {
                if (r.p.isVineSwinging) { at = i; break; }
                if ((r.p.grounded && i > 1) || r.p.y > G + 200) break;
                r.frame({ right: true, jump: (i + 2) * DT < hold });
              }
              const judged = hopCatches(v, run.x, G, 1, hold, now.clock + aim.clock, run.vx);
              const judgedAt = hopCatchAt(v, run.x, G, 1, hold, now.clock + aim.clock, run.vx);
              n++;
              if (at > 0) caughtN++;
              else missedN++;
              if (judged !== at > 0 || judgedAt !== at) wrong.push(`${what}: the engine ${at > 0 ? `caught it ${at} frames after the press` : 'missed'}, the bot's aim says ${judgedAt > 0 ? `caught, ${judgedAt} frames after` : 'missed'}`);
            }
          }
        }
      }
    }
  }
  assert.deepEqual(wrong.slice(0, 12), [], `${wrong.length} of ${n} hops: the bot's verdict (or its frame) is not the engine's`);
  // (the sample holds both: hops the engine catches and hops it misses)
  assert.ok(caughtN >= 100 && missedN >= 100, `${caughtN} caught, ${missedN} missed of ${n}`);
  assert.ok(worstX < 1e-6, `the aim's take-off is ${worstX.toExponential(2)} px off at worst`);
});

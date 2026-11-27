/**
 * THE invariant of the bots' plans (ENG-SIM step 2, R-165.470): a press drawn anywhere inside the judged spread, played verbatim by the
 * bot from the moment it was judged, ends exactly as the probe said: the same frame, the same spot, the same death or none. This is the
 * one test that later replaces each judge's own "judged == flown" toy (step 3): the judge's model is the engine, so there is nothing
 * left to drift.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { FirstTimerRun, FT_KID, freshPhone, rng } from '../../tools/inspect/firsttimer.ts';
import { firstWindow, planFlies, pressPlan, type PlanFlight } from './pressPlan.ts';
import type { RealPlay } from './realPlay.ts';

type Eng = Record<string, any>;

/** the goal: back on his feet after the hop (where, and on what); a life lost or the plan's end fails it */
function landing(): { goal: (e: Eng, frame: number) => 'met' | void; where: string } {
  const o = {
    where: '',
    air: false,
    goal(e: Eng, _frame: number): 'met' | void {
      const p = e.player;
      if (!p.grounded) o.air = true;
      else if (o.air) {
        o.where = `x ${p.x.toFixed(4)} y ${p.y.toFixed(4)} vx ${p.vx.toFixed(4)}`;
        return 'met';
      }
    },
  };
  return o;
}

test('a press drawn anywhere inside the judged spread, played by the bot, ends exactly as the probe said', () => {
  const who = { ...FT_KID, setting: 'easy' as const };
  const rows: string[] = [];
  // (the spread: the press on frames 2..7 from the moment judged, two holds; each draw is played in its own run from the same moment)
  for (const hold of [0.12, 0.3]) {
    for (let press = 2; press <= 7; press++) {
      freshPhone(who.setting);
      const mr = Math.random;
      Math.random = rng(11);
      try {
        let said: PlanFlight | null = null;
        let saidWhere = '';
        let k = 0;
        let live: { at: number; where: string } | null = null;
        let lives = 0;
        const flown = landing();
        const run: FirstTimerRun = new FirstTimerRun('1-1', 3, who, {
          cap: 10,
          onFrame: (sim: RealPlay) => {
            const e = sim.e as unknown as Eng;
            if (!said) {
              if (sim.t < 2 || !sim.p.grounded) return;
              const plan = pressPlan({ press, hold, dir: 1, after: 60 });
              const judged = landing();
              said = planFlies(sim, plan, judged.goal);
              saidWhere = judged.where;
              lives = e.lives;
              run.setPlan(plan, plan.pads.length, 1);
              return;
            }
            if (live) return;
            k++;
            if (e.lives !== lives) live = { at: -k, where: '' };
            else if (flown.goal(e, k) === 'met') live = { at: k, where: flown.where };
            else if (k >= press + 60) live = { at: -k, where: '' };
          },
        });
        run.play();
        assert.ok(said, `press ${press}: judged`);
        assert.ok(live, `press ${press}: played`);
        const s = said as PlanFlight;
        const l = live as { at: number; where: string };
        assert.equal(l.at, s.at, `press ${press} hold ${hold}: the frame`);
        assert.equal(l.where, saidWhere, `press ${press} hold ${hold}: the spot`);
        rows.push(`${press}/${hold}:${s.at}`);
      } finally {
        Math.random = mr;
      }
    }
  }
  // (the spread is a real one: the draws do not all land on the same frame)
  assert.ok(new Set(rows.map((r) => r.split(':')[1])).size > 1, rows.join(' '));
});

// ENG-SIM step 3 1a-ii: the run-up's press-frame search (firstWindow) is the plain scan's answer, asked less: on every yes / no pattern
//  of 1 to 12 frames, every window width 1 to 6 and a first frame of 1 or 3, the same first window (or none), never a frame outside
//  [lo, hi], and never more distinct frames asked than the plain scan asks (the caller keeps each frame's flight: runUpPlan's cache)
test('firstWindow finds the plain scan\'s first window of w consecutive yeses on every pattern up to 12 frames, asking no more often', () => {
  for (const lo of [1, 3]) {
    for (let n = 1; n <= 12; n++) {
      const hi = lo + n - 1;
      for (let mask = 0; mask < 1 << n; mask++) {
        const yes = (f: number) => ((mask >> (f - lo)) & 1) === 1;
        for (let w = 1; w <= 6; w++) {
          let plain = -1, plainAsks = 0;
          for (let f = lo, run = 0; f <= hi; f++) {
            plainAsks++;
            run = yes(f) ? run + 1 : 0;
            if (run === w) { plain = f - w + 1; break; }
          }
          const asked = new Set<number>();
          const got = firstWindow(lo, w, hi, (f) => {
            assert.ok(f >= lo && f <= hi, `asked frame ${f} outside [${lo}, ${hi}]`);
            asked.add(f);
            return yes(f);
          });
          const at = `lo ${lo} n ${n} mask ${mask.toString(2)} w ${w}`;
          assert.equal(got, plain, `${at}: the plain scan's first window`);
          assert.ok(asked.size <= plainAsks, `${at}: ${asked.size} frames asked against the plain scan's ${plainAsks}`);
        }
      }
    }
  }
});


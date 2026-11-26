/**
 * THE invariant of the bots' plans (ENG-SIM step 2, R-165.470): a press drawn anywhere inside the judged spread, played verbatim by the
 * bot from the moment it was judged, ends exactly as the probe said: the same frame, the same spot, the same death or none. This is the
 * one test that later replaces each judge's own "judged == flown" toy (step 3): the judge's model is the engine, so there is nothing
 * left to drift.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { FirstTimerRun, FT_KID, freshPhone, rng } from '../../tools/inspect/firsttimer.ts';
import { planFlies, pressPlan, type PlanFlight } from './pressPlan.ts';
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

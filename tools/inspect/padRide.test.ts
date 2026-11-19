// npx tsx --test tools/inspect/padRide.test.ts   (CI: gates.yml, the engine tools' tests)
/**
 * The bot toys for SINKING PADS (level.md rule 21, ENG-22; before 2-2 lays a pad): fixture stages rolled by gen2 the way the game rolls a
 * listed stage (listed.ts withTestStage, a planted one-seed list, the toy kit with a pad table, World 2's finish), each with ONE pond
 * section over deep water (a fall costs a life), crossed by the middle and child bots on both settings to the shrine:
 *   keep    four small weight pads (1.0 s each on Normal): KEEP-HOPPING, he never stands on a weight pad past its count
 *   rise    a beat row with a stone between (big, stone, big): WAIT-FOR-THE-RISE, at an edge he never hops for a pad that is down or
 *           shivering; he waits until it is up and still
 *   breath  two small beat pads in a row, no stone (470 px: 2.0 s of its 2.4 s up at padFaults pace) (2-2.md's breath: up 1.8 s, shiver 0.6 s, under 0.6 s): CROSS-ON-THE-BREATH, he starts
 *           only when the breath left covers the whole run
 *   spur    two small weight pads out to a dead-end stone, the way on the vine up from the near bank and the rope over (FIX-22): OUT-AND-
 *           BACK, he goes out to the stone (its flower), waits there for the pads he sank and comes back before he climbs
 * Each skill is planted: switched off (firsttimer.ts PAD_SKILL), its toy goes red where the same run crossed with it on (the on and off numbers
 * over four variants are pasted in BUILD-22's REPORT).
 */
import '../../src/game/headlessDom.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import { padFaults } from '../../src/game/gen2/rideLay.ts';
import { PAD_SKILL } from './firsttimer.ts';
import { crossed, fixtureSeed, padRun, padStage, told, TOY_PADS, type ToyPad } from './padToys.ts';
import type { Setting, Tier } from './tierBots.ts';

const RUNS: Array<[Tier, Setting]> = [['middle', 'normal'], ['middle', 'easy'], ['child', 'normal'], ['child', 'easy']];
/** bot runs a tier for each plant (variants 1..N: his own presses and timing, the fixture's one roll) */
const PLANT_VARIANTS = 4;
const SKILL_OF: Record<ToyPad, keyof typeof PAD_SKILL> = { keep: 'keepHopping', rise: 'waitRise', breath: 'breath', spur: 'outBack' };

for (const row of Object.keys(TOY_PADS) as ToyPad[]) {
  const seed = fixtureSeed(row);
  test(`the ${row} fixture: one pond of sinking pads (deep water; the spur splash-back, as 2-2's X), rolled clean and fair (padFaults)`, () => {
    const st = padStage(row, seed);
    assert.equal(st.platforms.filter((p) => p.pad).length, TOY_PADS[row].pads.filter((k) => k !== 'stone').length);
    assert.deepEqual(padFaults(st), []);
    const safe = !!(TOY_PADS[row] as { safe?: boolean }).safe;
    assert.ok(st.rivers?.some((r) => r.speed === 0 && !r.safe === !safe), safe ? 'still splash-back water under the pads (the spur, as 2-2\'s X)' : 'still deep water under the pads');
  });
  for (const [tier, setting] of RUNS) {
    test(`${row}: ${tier}, ${setting} crosses the pads and reaches the shrine`, () => {
      const r = padRun(row, tier, setting, seed);
      assert.ok(crossed(r, row), `${tier} ${setting}: ${told(r, row)}`);
    });
  }
  test(`planted: with ${SKILL_OF[row]} off, the ${row} pond takes a bot the skill carries across`, () => {
    // (BUILD-22: over PLANT_VARIANTS runs a tier, the skill-off run fails where the SAME run with the skill on crossed; one run a tier
    // was luck: once the floor-read fault was fixed (padRead), the breath plant went green on variant 1 by arrival timing alone)
    const on = new Map<string, boolean>();
    for (const [tier, setting] of RUNS) for (let v = 1; v <= PLANT_VARIANTS; v++) on.set(`${tier} ${setting} v${v}`, crossed(padRun(row, tier, setting, seed, v), row));
    PAD_SKILL[SKILL_OF[row]] = false;
    const off: string[] = [];
    let failed = 0;
    try {
      for (const [tier, setting] of RUNS) {
        for (let v = 1; v <= PLANT_VARIANTS; v++) {
          const r = padRun(row, tier, setting, seed, v);
          off.push(`${tier} ${setting} v${v}: ${told(r, row)}`);
          if (!crossed(r, row) && on.get(`${tier} ${setting} v${v}`)) failed++;
        }
      }
      assert.ok(failed >= 1, `with ${SKILL_OF[row]} off no run failed that crossed with it on: ${off.join('; ')}`);
    } finally {
      PAD_SKILL[SKILL_OF[row]] = true;
    }
  });
}

test("OUT-AND-BACK's pin: he is followed out to the stone first, and once he has stood there never back out to it from the way back (FIX-22: 2-2 Easy seed 12, a middle bot hopped stone to pad and back for 20 s)", async () => {
  const { Progress } = await import('./firsttimer.ts');
  // (out along y 730 from x 0 to 300, every 24 px, and back from 300 to 0 every 24 px from an offset: the two lines lie side by side)
  const out = Array.from({ length: 13 }, (_, i) => ({ x: i * 25, y: 730 }));
  const back = Array.from({ length: 13 }, (_, i) => ({ x: 312 - i * 25, y: 730 }));
  const pr = new Progress([...out, ...back]);
  pr.pins.push(12);
  pr.relocate({ x: 0, y: 730 });
  // (on the way out, at x 237, the way back's point at x 237 is never taken: he heads for the pin, 63 px on, past PIN_AT)
  for (const x of [50, 100, 150, 200, 237]) pr.step({ x, y: 730 });
  assert.ok(pr.cur <= 12, `followed to ${pr.cur}, past the pin before standing at it`);
  assert.deepEqual(pr.target({ x: 237, y: 730 }), out[12], 'he heads for the stone');
  pr.step({ x: 300, y: 730 });
  // (back on the pad at x 160: the way out's point at x 150 lies nearer than the way back's at 162 - 25k; he stays on the way back)
  for (const x of [280, 250, 220, 190, 160]) pr.step({ x, y: 730 });
  assert.ok(pr.cur > 12, `pulled back out to ${pr.cur} (the pin is 12)`);
  pr.relocate({ x: 100, y: 730 });
  assert.ok(pr.cur > 12, `a respawn put him back on the way out (${pr.cur})`);
});

// FIX-284 (R-165.284; the lead's ruling A, 11-19): A BREATHING ROW NEVER MEETS HIM IN LOCKSTEP. On 2-2's finale a first-timer drowned at a
// beat pair, was put back and ran back in two whole breaths, so every try met the pair at the same bad moment until the rescue
// (reference/qa-reports/FIX-284/phase.ts). The engine now turns every breathing row ahead of him at each put-back (breathAim.ts, in
// respawnAtCheckpoint while the iris is closed): at the soonest moment he can reach it at a run, the first try finds it just risen and each
// later try a golden share of a breath further on. Put back twelve times at moments a few frames apart, on both settings, the row at his
// soonest arrival is exactly there every time, so a player who comes back at the same pace never meets the same moment twice running.
// PLANTED: without the aim the row is wherever the clock happens to be (red on most of the twelve).
test('the breath toy: put back again and again, the breathing row ahead is turned on, never met at the same moment twice running (FIX-284)', async () => {
  const { padPlay } = await import('./padToys.ts');
  const { PHYS } = await import('../../src/game/physics.ts');
  const { DT } = await import('../../src/game/realPlay.ts');
  const { BREATH_AIM } = await import('../../src/game/breathAim.ts');
  const seed = fixtureSeed('breath');
  for (const setting of ['normal', 'easy'] as const) {
    padPlay('breath', seed, (r) => {
      const e = r.e as any;
      const first = (e.platforms as any[]).filter((q) => q.pad?.by === 'beat').sort((a, b) => a.x - b.x)[0];
      assert.ok(first, 'the toy lays a beat row');
      // (his flag on the near bank, 300 px before the first pad: the floor under that point)
      const under = (e.platforms as any[]).filter((q) => !q.pad && q.x <= first.x - 300 && q.x + q.width >= first.x - 300).sort((a, b) => a.y - b.y)[0];
      e.checkpoint = { x: first.x - 300, y: under.y - 1 };
      const bad: string[] = [];
      let prev = NaN;
      for (let k = 0; k < 12; k++) {
        for (let i = 0; i < 7 + k; i++) r.frame();
        e.respawnAtCheckpoint('water');
        const arrive = e.clock.time() + e.inputGrace + (first.x - e.player.x) / PHYS.maxRun;
        while (e.clock.time() < arrive - 1e-9) r.frame();
        const now = e.clock.read(first.pad.clock, first.pad.shift);
        // (where in its breath the row stands, from the rise, as a share of its period: the stage's def, stretched as the engine runs it)
        const def = (e.currentStage.clocks as any[]).find((d) => d.id === first.pad.clock);
        const st = e.easy ? def.easyStretch : 1;
        const lens = def.phases.map((ph: any) => ph.seconds * st);
        const period = lens.reduce((a: number, b: number) => a + b, 0);
        const onEnd = lens.slice(0, def.phases.findIndex((ph: any) => ph.name === 'on') + 1).reduce((a: number, b: number) => a + b, 0);
        const pos = lens.slice(0, now.index).reduce((a: number, b: number) => a + b, 0) + now.into;
        const at = ((((pos - onEnd) / period) % 1) + 1) % 1;
        const want = (k * BREATH_AIM.turn) % 1;
        if (Math.abs(((at - want + 1.5) % 1) - 0.5) > 1.5 * DT / period) bad.push(`try ${k}: ${now.phase} ${now.into.toFixed(2)} s in (${at.toFixed(3)} of the breath, aimed ${want.toFixed(3)})`);
        if (k && Math.abs(((at - prev + 1.5) % 1) - 0.5) < 0.05) bad.push(`try ${k}: met at the same moment as try ${k - 1}`);
        prev = at;
      }
      assert.equal(!!e.easy, setting === 'easy', 'the engine plays the setting');
      assert.deepEqual(bad, [], `${setting}: the row at his soonest arrival after each put-back`);
    }, setting);
  }
});

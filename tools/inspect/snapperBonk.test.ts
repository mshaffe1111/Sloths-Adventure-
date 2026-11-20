// npx tsx --test tools/inspect/snapperBonk.test.ts   (CI: gates.yml, the engine tools' tests)
/**
 * The bot toy for World 2's SNAPPER (ENG-25b; 2-5.md NEW 2 "bot skill bonk-after-the-snap"; level.md rules 21 and 23, before 2-5 lays
 * one): ENG-25's snapper row laid by gen2 on a real stage row (snapToys.ts snapperKit: a snap row, then the snapper on the far bank's
 * socket, on its stones' bar `snap-step`, joined to the cast by World 2's spawn), both rows:
 *   snapper-asleep  the lesson's first (2-5 beat 2): he walks up and kicks it; it paddles off ('chasedOff', counted for the purge)
 *   snapper         awake on the bar (beat 4): he stands just off its bite, counts, goes right after four, bonks it (a stomp: dazed
 *                   1.8 s), steers his bounce back to his own side and kicks it off
 * BONK-AFTER-THE-SNAP (firsttimer.ts SKILLS.bonkAfterSnap) chases it off UNHURT on every variant for the middle bot (both settings), the
 * child on Easy and the expert; planted off, he passes it as any animal and it is never chased off (a purge would stay sealed).
 * Child on Normal is not held (level.md rule 4); its runs are in ENG-25b's REPORT. The flight behind the numbers (the bounce, the
 * window): reference/qa-reports/ENG-25b/bonkFlight.ts.
 */
import '../../src/game/headlessDom.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import { SKILLS } from './firsttimer.ts';
import { atSnapper, snapperRun, snapperSeed, snapperStage, type ToySnapper } from './snapToys.ts';
import type { Setting, Tier } from './tierBots.ts';

const HELD: Array<[Tier, Setting]> = [['middle', 'normal'], ['middle', 'easy'], ['child', 'easy'], ['expert', 'normal']];
const PLANT: Array<[Tier, Setting]> = [['middle', 'normal'], ['child', 'easy']];
const VARIANTS = [1, 2, 3, 4];
const ROWS: ToySnapper[] = ['snapper-asleep', 'snapper'];

for (const which of ROWS) {
  const seed = snapperSeed(which);
  test(`the ${which} fixture: one snapper laid by gen2 on its stones' clock, in the cast, ${which === 'snapper' ? 'awake' : 'asleep'} (both settings)`, () => {
    for (const s of ['normal', 'easy'] as const) {
      const st = snapperStage(which, seed, s);
      assert.deepEqual(st.gen2.errors ?? [], [], `${s}: the roll is clean`);
      const t = st.enemies.filter((e) => e.type === 'turtle');
      assert.equal(t.length, 1, `${s}: one snapper`);
      assert.deepEqual(t[0].kitBeat, { clock: 'snap-step' });
      assert.equal(!!t[0].asleep, which === 'snapper-asleep');
      assert.deepEqual(st.proto?.cast?.kinds, ['turtle']);
    }
  });
  for (const [tier, setting] of HELD) {
    test(`${which}: ${tier}, ${setting} chases it off with a kick, unhurt, and reaches the shrine (variants ${VARIANTS.join(', ')})`, () => {
      const st = snapperStage(which, seed, setting);
      for (const v of VARIANTS) {
        const a = atSnapper(snapperRun(which, tier, setting, seed, v), st);
        const at = `${tier} ${setting} v${v}: ${JSON.stringify(a)}`;
        assert.ok(a.shrine, at);
        assert.deepEqual(a.cleared, { kick: 1 }, at);
        assert.equal(a.hits + a.lives, 0, at);
      }
    });
  }
  test(`planted: with bonkAfterSnap off, the ${which} is never chased off (the runs the skill cleared)`, () => {
    SKILLS.bonkAfterSnap = false;
    const off: string[] = [];
    try {
      const st = snapperStage(which, seed);
      for (const [tier, setting] of PLANT) {
        for (const v of VARIANTS) {
          const a = atSnapper(snapperRun(which, tier, setting, seed, v), st);
          off.push(`${tier} ${setting} v${v}: left ${a.left}, hits ${a.hits}`);
          assert.equal(a.left, 1, `skill off, ${tier} ${setting} v${v} still cleared it: ${JSON.stringify(a)}`);
        }
      }
    } finally {
      SKILLS.bonkAfterSnap = true;
    }
    assert.equal(off.length, PLANT.length * VARIANTS.length, off.join('; '));
  });
}

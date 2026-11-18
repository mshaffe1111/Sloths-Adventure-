// npx tsx --test tools/inspect/snapRide.test.ts   (CI: gates.yml, the engine tools' tests)
/**
 * The bot toys for SNAP STONES (ENG-25; 2-5.md NEW 1; level.md rules 21 and 23, before 2-5 lays a stone): fixture stages rolled by gen2 the
 * way the game rolls a listed stage (snapToys.ts), each ONE pond of snap stones over deep water (a fall costs a life):
 *   step   three in step at count 0.75 (2-5's practice row): the window to leave the bank is the bar's safe spell less the crossing
 *   wave   three, each a count later (Easy's twist, the head of Normal's): he rides behind the snap
 * OFF-BEFORE-FOUR (firsttimer.ts PAD_SKILL.offBefore4) carries the middle bot (both settings) and the child (Easy) across UNBITTEN on every
 * variant; planted off, he walks the stones as plain floors and is bitten where the same run crossed clean. And the stone never bites
 * without its tell: a bar with no creak is refused by the stage's own verdict (rideLay.ts snapFaults, pipeline.ts's wet verdict).
 * Child on Normal is not held unbitten (level.md rule 4: Normal is never softened for the kid bot); its numbers are in ENG-25's REPORT.
 */
import '../../src/game/headlessDom.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import { snapFaults } from '../../src/game/gen2/rideLay.ts';
import { PAD_SKILL } from './firsttimer.ts';
import { atPond, fixtureSeed, noTell, pondOf, snapRun, snapStage, TOY_SNAPS, type ToySnap } from './snapToys.ts';
import type { Setting, Tier } from './tierBots.ts';

const HELD: Array<[Tier, Setting]> = [['middle', 'normal'], ['middle', 'easy'], ['child', 'easy']];
const VARIANTS = [1, 2, 3, 4];

for (const row of Object.keys(TOY_SNAPS) as ToySnap[]) {
  const seed = fixtureSeed(row);
  const pond = pondOf(snapStage(row, seed));
  test(`the ${row} fixture: one pond of snap stones over deep water, rolled clean and fair on both settings (snapFaults)`, () => {
    for (const s of ['normal', 'easy'] as const) {
      const st = snapStage(row, seed, s);
      assert.deepEqual(st.gen2.errors ?? [], [], `${s}: the roll is clean`);
      assert.equal(st.platforms.filter((p) => p.pad?.on === 'bites').length, TOY_SNAPS[row].pads.length, `${s}: every stone laid`);
      assert.deepEqual(snapFaults(st), [], `${s}: fair`);
    }
  });
  test(`planted: the ${row} pond with a bar that bites without its creak is refused by the stage's verdict`, () => {
    const st = snapStage(row, seed);
    const bad = snapFaults({ ...st, clocks: (st.clocks ?? []).map((c) => (c.id.startsWith('snap-') ? noTell(c) : c)) });
    assert.ok(bad.some((e) => /on with no warn/.test(e)), `no-creak bar caught: ${bad.join('; ')}`);
  });
  const on = new Map<string, number>();
  for (const [tier, setting] of HELD) {
    test(`${row}: ${tier}, ${setting} crosses unbitten and reaches the shrine (variants ${VARIANTS.join(', ')})`, () => {
      for (const v of VARIANTS) {
        const a = atPond(snapRun(row, tier, setting, seed, v), pond);
        on.set(`${tier} ${setting} v${v}`, a.bites);
        assert.ok(a.shrine, `${tier} ${setting} v${v}: ended ${a.end}`);
        assert.equal(a.bites, 0, `${tier} ${setting} v${v}: bitten ${a.bites} times at the pond (lives ${a.lives})`);
      }
    });
  }
  test(`planted: with offBefore4 off, the ${row} pond bites a bot the skill carried across unbitten`, () => {
    PAD_SKILL.offBefore4 = false;
    const off: string[] = [];
    let bitten = 0;
    try {
      for (const [tier, setting] of HELD) {
        for (const v of VARIANTS) {
          const a = atPond(snapRun(row, tier, setting, seed, v), pond);
          off.push(`${tier} ${setting} v${v}: ${a.bites} bites, ${a.lives} lives`);
          if (a.bites > 0 && on.get(`${tier} ${setting} v${v}`) === 0) bitten++;
        }
      }
    } finally {
      PAD_SKILL.offBefore4 = true;
    }
    assert.ok(bitten >= 1, `with offBefore4 off no run was bitten that crossed clean with it on: ${off.join('; ')}`);
  });
}

// ENG-HUD27 (2-7 "The Way Home", found by BUILD-27b): (1) the HUD's progress bar on a stage laid as legs is measured ALONG THE ROUTE
// (routeBar.ts), not by his x: on the out-and-back toy (gen2/toyHome.ts, 2-7's shape) the leftward run's bar sat at 0 for the whole way
// out. Proven end to end with the real engine and the middle bot: the bar the engine sends the HUD rises through the out leg, never goes
// back, and reads 1 at the totem; planted RED on today's measure (the travel mode's x). A stage of one leg has no route bar (the mode's
// measure, exactly as before). (2) The post's letters are moments of play ('post:letter', 'post:letter:<n>', post.ts postMoments) a
// wayside line can wait on (StageWay.on); RED with the moment off.
import test from 'node:test';
import assert from 'node:assert/strict';
import '../headlessDom.ts';
import { buildGen2Stage, keptFoes } from './pipeline.ts';
import { withTestStage } from './listed.ts';
import { packPlan, plantSeedList } from './seedList.ts';
import { RealPlay, withFixtureConfig } from '../realPlay.ts';
import { towerCfg } from './toyTower.ts';
import { HOME_CODE, POST_CODE, homeKit } from './toyHome.ts';
import { w2Finish } from './worlds/w2.ts';
import { routeBarOf } from '../routeBar.ts';
import { inReach } from '../post.ts';
import { homeRun, HOME_ID, homeCfg } from '../../../tools/inspect/homeToys.ts';

/** the toy rolled the game's way (the listed row, a planted one-seed list, World 2's finish), and `fn` run on the real engine over it */
function onToy<T>(code: string, seed: number, fn: (sim: RealPlay) => T): T {
  const kit = homeKit(HOME_ID, code);
  const st = buildGen2Stage({ config: homeCfg, kit, seed, difficulty: 'normal' });
  assert.deepEqual(st.gen2.errors, [], `the toy lays on seed ${seed}`);
  const dict: string[] = [];
  const packed = packPlan({ seed: st.gen2.seed, rerolls: st.gen2.rerolls, plan: st.gen2.plan, foes: [...keptFoes(st)] }, dict);
  return withTestStage({ [HOME_ID]: { kit: () => kit, world: (s, _sq, d) => w2Finish(s as never, d) as typeof s, seeds: [] } }, () => {
    const undo = plantSeedList(HOME_ID, { dict, seeds: [seed], plans: [packed] });
    try {
      return withFixtureConfig(homeCfg, () => fn(new RealPlay(HOME_ID, seed, homeCfg)));
    } finally {
      undo();
    }
  });
}

/** the engine's moments of play this run (GuideView.moments: what a wayside line `on` a moment waits for) */
const moments = (sim: RealPlay): string[] => (sim.e as unknown as { moments: string[] }).moments;

/** the bar the engine sends the HUD (onProgressUpdate's distance ratio), read on every frame from here on */
function readBar(sim: RealPlay): { ratio: number } {
  const seen = { ratio: NaN };
  const cb = (sim.e as unknown as { callbacks: { onProgressUpdate: (...a: unknown[]) => void } }).callbacks;
  cb.onProgressUpdate = (...a: unknown[]) => { seen.ratio = a[4] as number; };
  return seen;
}

test('HUD bar along the route: on the out-and-back toy the bar rises through the out leg, never goes back, and reads 1 at the totem (the middle bot, the real engine); RED on today\'s measure', () => {
  const seed = 1;
  const st = buildGen2Stage({ config: homeCfg, kit: homeKit(HOME_ID, HOME_CODE), seed, difficulty: 'normal' });
  const out = st.gen2.tower!.legs![0];
  assert.equal(out.travel, 'right', "the toy's first leg runs right");
  assert.ok(routeBarOf(st), 'a stage laid as legs has a route bar');
  let seen: { ratio: number } | null = null;
  const rows: Array<{ x: number; y: number; r: number; out: boolean }> = [];
  const r = homeRun('middle', 'normal', seed, 1, {
    onFrame: (sim) => {
      if (!seen) { seen = readBar(sim); return; }
      if (Number.isNaN(seen.ratio)) return;
      const p = sim.p;
      // (on the way out: over the out leg's span, at its ground or above, before the column)
      rows.push({ x: p.x, y: p.y, r: seen.ratio, out: p.x >= out.x0 && p.x <= out.x1 && p.y <= out.y1 });
    },
  });
  assert.equal(r.end, 'shrine', 'the middle bot finishes the toy');
  assert.ok(rows.length > 100, 'the bar was read through the run');
  const outRows = rows.filter((q) => q.out);
  assert.ok(outRows.length > 30, 'he walked the out leg');
  const lastOut = outRows[outRows.length - 1].r;
  // (the out leg is about a fifth of the toy's route: the bar must have moved well off 0 by the column, never stuck for the way out)
  assert.ok(lastOut >= 0.1, `the bar rises through the out leg: ${lastOut.toFixed(3)} at its end (today's measure: 0, a stuck bar for the whole way out)`);
  assert.ok(outRows[0].r < 0.05, `and starts near 0 (${outRows[0].r.toFixed(3)})`);
  for (let i = 1; i < rows.length; i++) assert.ok(rows[i].r >= rows[i - 1].r, `the bar never goes back (frame ${i}: ${rows[i - 1].r.toFixed(3)} to ${rows[i].r.toFixed(3)} at x ${Math.round(rows[i].x)})`);
  assert.ok(rows[rows.length - 1].r >= 0.98, `and reads full at the totem (${rows[rows.length - 1].r.toFixed(3)})`);
});

test('HUD bar along the route: a stage of one leg has no route bar (the travel mode\'s own measure, exactly as before)', () => {
  // (a run laid left, one leg: the toy's home leg alone, as `mixed` lays it, has no route bar)
  assert.equal(routeBarOf({ gen2: { tower: { flow: 'legs', legs: [{ travel: 'left' }], route: { legs: [{}] } } } }), null, 'one leg laid left: none');
  assert.equal(routeBarOf({ gen2: { tower: { flow: 'up', legs: [{ travel: 'up' }, { travel: 'up' }], route: { legs: [{}] } } } }), null, 'a tower: none');
  assert.equal(routeBarOf({}), null, 'a run (no tower): none');
});

test("the post's letters are moments of play: 'post:letter' at the first letter posted, 'post:letter:<n>' at the nth (the real engine on the post toy, the engine's moments a wayside line waits on); RED with the moment off", () => {
  onToy(POST_CODE, 1, (sim) => {
    const post = sim.stage.post!;
    assert.ok(post && post.doors.length >= 2, 'the post toy lays two doors or more');
    const slot = (k: number) => sim.collectibles.find((c) => c.id === post.doors[k].letter)!;
    sim.frame();
    assert.ok(!moments(sim).some((m) => m.startsWith('post:')), 'no letter posted at the start: no post moment');
    // (stand him with his middle on the first slot: the engine's own reach takes the letter, and the door opens)
    const a = slot(0);
    sim.fly(a.x, a.y + 20);
    assert.ok(inReach(sim.p.x, sim.p.y, a.x, a.y), 'he is at the first slot');
    sim.frame();
    assert.ok(moments(sim).includes('post:letter'), `the first letter posted is the moment 'post:letter' (moments: ${JSON.stringify(moments(sim))})`);
    assert.ok(moments(sim).includes('post:letter:1'), "and 'post:letter:1'");
    assert.ok(!moments(sim).includes('post:letter:2'), 'one letter, not two');
    const b = slot(1);
    sim.fly(b.x, b.y + 20);
    sim.frame();
    assert.ok(moments(sim).includes('post:letter:2'), "the second letter: 'post:letter:2'");
    assert.equal(moments(sim).filter((m) => m === 'post:letter').length, 1, "'post:letter' is named once");
  });
});

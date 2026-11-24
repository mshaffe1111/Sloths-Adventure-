/**
 * R-165.434's planted check (tools/engine/sideWall.ts, wired into paintcheck.ts): 2-6 as main builds it has no side-on wall painted as
 * bank soil (GREEN); the same stage with one of BUILD-26q's soft-pit faces added (b6a35d7e8: a 24 x 94 moss_stone solid, its sides open)
 * is RED on exactly that block; the same block at 60 px wide (wider than his body, 44) is GREEN, so the limit is the one named.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import '../../src/game/headlessDom.ts';
import type { Platform } from '../../src/game/types.ts';

// (every sheet "arrives" at once, as paintcheck.ts sets it: the painters decide as they do once the art is in)
(globalThis as Record<string, unknown>).Image = class {
  onload: null | (() => void) = null;
  onerror: null | (() => void) = null;
  width = 1; height = 1; naturalWidth = 1; naturalHeight = 1; complete = true;
  set src(_u: string) { this.onload?.(); }
  decode() { return { then: (ok: () => void) => ok() }; }
};

test('a side-on wall painted as bank soil is caught: 2-6 GREEN as built, RED with a 24 x 94 face, GREEN at 60 wide', async () => {
  const { generateAllLevels } = await import('../../src/game/worldsData.ts');
  const { generateStage, setLayoutVariant } = await import('../../src/game/stageGenerator.ts');
  const { withGoals } = await import('../../src/game/goals.ts');
  const { loadSeedList } = await import('../../src/game/gen2/seedList.ts');
  const { stagePaintInput } = await import('./paintStage.ts');
  const { sideWalls } = await import('./sideWall.ts');
  const c = generateAllLevels().find((l) => l.id === '2-6')!;
  await loadSeedList('2-6');
  setLayoutVariant(0);
  const st = withGoals(generateStage({ ...c, unlocked: true }, 'normal'));
  setLayoutVariant(null);
  const inp = stagePaintInput(st, c)!;
  assert.ok(inp, '2-6 paints its ground');
  assert.deepEqual(sideWalls(st.platforms, inp.f), [], 'main 2-6 as built: no side-on wall painted as soil');
  // (in open air above the stage's lowest piece's top: nothing touches its sides)
  const low = st.platforms.reduce((a, b) => (b.y > a.y ? b : a));
  const face = (w: number): Platform => ({ id: 987654, x: low.x + 4, y: low.y - 400, width: w, height: 94, type: 'solid', style: 'moss_stone' } as Platform);
  const red = sideWalls([...st.platforms, face(24)], inp.f);
  assert.ok(red.length >= 1 && red.every((b) => b.id === 987654), `the 24 x 94 face is caught, and only it: ${JSON.stringify(red)}`);
  assert.deepEqual(sideWalls([...st.platforms, face(60)], inp.f), [], 'a block wider than his body (44) is a bank the painter draws');
});

// R-165.440 (SIDEWALL-FIX): the two shipped breaches get the look their collider has, and the check reads that same decision. Planted:
// with the drawer's decision taken away (a decision that draws nothing), both are RED; with the real one (narrowBank.ts), GREEN.
test("1-6's posts and 8-1's sliver: RED without the narrow-bank drawer, GREEN with it; the post's shaft and the joined bank's face meet the collider", async () => {
  const { generateAllLevels } = await import('../../src/game/worldsData.ts');
  const { generateStage, setLayoutVariant } = await import('../../src/game/stageGenerator.ts');
  const { withGoals } = await import('../../src/game/goals.ts');
  const { easyStage } = await import('../../src/game/easyMode.ts');
  const { loadSeedList } = await import('../../src/game/gen2/seedList.ts');
  const { stagePaintInput } = await import('./paintStage.ts');
  const { sideWalls } = await import('./sideWall.ts');
  const { narrowLook, narrowPosts, bankList } = await import('../../src/game/narrowBank.ts');
  const { livePostBox, LIVE_POST_PX } = await import('../../src/game/livePostArt.ts');
  const { paintedBank } = await import('../../src/game/w1Pits.ts');
  const build = async (id: string, v: number, setting: 'normal' | 'easy') => {
    const c = generateAllLevels().find((l) => l.id === id)!;
    await loadSeedList(id);
    setLayoutVariant(v);
    const st = setting === 'easy' ? easyStage(withGoals(generateStage({ ...c, unlocked: true }, 'easy'))) : withGoals(generateStage({ ...c, unlocked: true }, 'normal'));
    setLayoutVariant(null);
    return { st, inp: stagePaintInput(st, c)! };
  };
  // (1-6 Normal, its first listed seed: the 24 x 345 supports under the fragile branches)
  const a = await build('1-6', 0, 'normal');
  const none = () => null;
  const red6 = sideWalls(a.st.platforms, a.inp.f, none);
  assert.ok(red6.length >= 1 && red6.every((w) => w.w < 44), `planted: without the drawer 1-6's posts are caught: ${red6.length}`);
  assert.deepEqual(sideWalls(a.st.platforms, a.inp.f), [], "1-6 with the drawer: every narrow bank has a look");
  const posts = narrowPosts(a.st.platforms);
  assert.equal(posts.length, new Set(red6.map((w) => w.id)).size, 'every caught block is a post');
  for (const { p, floor } of posts) {
    const b = livePostBox(p, floor);
    const sx = b.w / LIVE_POST_PX.w;
    const shaft0 = b.x + (LIVE_POST_PX.mid - LIVE_POST_PX.shaft / 2) * sx, shaft1 = shaft0 + LIVE_POST_PX.shaft * sx;
    assert.ok(shaft0 <= p.x + 0.5 && shaft1 >= p.x + p.width - 0.5 && shaft1 - shaft0 <= p.width + 12, `the post's shaft covers the collider, no fatter than 12 px over: ${shaft0}-${shaft1} vs ${p.x}-${p.x + p.width}`);
    assert.ok(Math.abs(b.y + (LIVE_POST_PX.pad / LIVE_POST_PX.h) * b.h - floor) < 0.5, 'its root pad stands on the floor');
    assert.ok(Math.abs((b.h / LIVE_POST_PX.h) / sx - 1) <= 0.25, "the picture's own shape kept within 25%");
  }
  // (8-1, seed 38747 (layout 16), both settings: the 14 px sliver flush beside the log bank it continues)
  for (const setting of ['normal', 'easy'] as const) {
    const b = await build('8-1', 16, setting);
    const red = sideWalls(b.st.platforms, b.inp.f, none);
    assert.ok(red.length >= 1, `planted: 8-1 ${setting} without the drawer is caught`);
    assert.deepEqual(sideWalls(b.st.platforms, b.inp.f), [], `8-1 ${setting} with the drawer`);
    for (const w of red) {
      const p = b.st.platforms.find((q) => q.id === w.id)!;
      const l = narrowLook(p, b.st.platforms);
      assert.equal(l?.look, 'joined', '8-1: the sliver is its bank\'s own end');
      const banks = bankList(b.st.platforms, b.st.platforms.filter(paintedBank));
      assert.ok(!banks.includes(p), 'the sliver is no bank of its own');
      assert.ok(banks.some((q) => Math.abs(q.x + q.width - (p.x + p.width)) < 0.5 && q.y === p.y), "the bank's face stands at the collider's edge");
    }
  }
});

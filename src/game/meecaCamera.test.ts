/**
 * 5-M upright (QA 2026-10-31): Matt, "the next log is off screen", a blind hop; the blind tester, the ring on the trunk and Flicker half
 * off the left edge. In the real engine on a phone held upright (390 x 844 and 360 x 780): standing anywhere on a step of the trail's
 * way through, the next step is in the view once the camera settles; and at every trunk to cut the ring sits well inside the view.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { RealPlay } from './realPlay.ts';
import { MeecaBot } from './meecaBot.ts';
import { RING_MARGIN, type MeecaPlay } from './meecaPlay.ts';

function upright(seed: number, w: number, h: number) {
  const sim = new RealPlay('5-M', seed);
  Object.assign(sim.e, { viewCssW: w, viewCssH: h, introT: 99 });
  sim.e.applyZoom();
  new MeecaBot(sim).card();
  const mc = (sim.e as { mc: MeecaPlay }).mc;
  mc.flicker.on = true;
  mc.flicker.show = 1;
  return { sim, mc };
}

for (const [w, h] of [[390, 844], [360, 780]] as const) {
  test(`5-M upright ${w} x ${h}: on the trail's way through, the next step is on screen wherever she stands on this one`, () => {
    for (const seed of [1, 38, 75]) {
      const { sim, mc } = upright(seed, w, h);
      mc.marked = mc.st.trunks.length;
      let checked = 0;
      for (let i = 0; i + 1 < mc.route.length; i++) {
        const a = sim.platforms.find((p) => p.id === mc.route[i])!;
        const b = sim.platforms.find((p) => p.id === mc.route[i + 1])!;
        // (the hops up onto the logs and between them: a step to a raised piece ahead, past a gap)
        if (!a || !b || b.x < a.x + a.width + 20 || b.x > a.x + a.width + 400 || b.y > a.y + 40 || b.y > 560) continue;
        for (const u of [0.08, 0.25, 0.5]) {
          sim.stand(a.x + a.width * u, a.y);
          for (let f = 0; f < 24; f++) sim.frame();
          const c = sim.e.camera;
          const at = `seed ${seed}: on ${a.id} (${Math.round(a.x)}..${Math.round(a.x + a.width)} @${a.y}) at ${u}, next ${b.id} at ${Math.round(b.x)} @${b.y}`;
          assert.ok(b.x + 30 <= c.x + c.viewportWidth, `${at}: its near end off the right (view ${Math.round(c.x)}..${Math.round(c.x + c.viewportWidth)})`);
          assert.ok(b.y >= c.y && b.y <= c.y + c.viewportHeight, `${at}: its top off the view's height`);
          assert.ok(sim.p.x >= c.x + 20, `${at}: she is off the left`);
          checked++;
        }
      }
      assert.ok(checked > 6, `seed ${seed}: ${checked} hops checked`);
    }
  });

  test(`5-M upright ${w} x ${h}: at every trunk to cut, the ring and Flicker are well inside the view`, () => {
    for (const seed of [1, 38]) {
      const { sim, mc } = upright(seed, w, h);
      mc.st.trunks.forEach((tr, i) => {
        mc.marked = i;
        if (i === mc.st.trunks.length - 1) mc.phase = 'last';
        // walking in from just behind until the wall stops her (its far side), and at its own spot
        for (const start of [tr.standX - 40, tr.standX]) {
          sim.stand(start, tr.standY);
          for (let f = 0; f < 70; f++) sim.frame(start < tr.standX ? { right: true } : {});
          for (let f = 0; f < 30; f++) sim.frame();
          const c = sim.e.camera;
          assert.ok(mc.carveSpot, `seed ${seed} trunk ${tr.id}: at its carving spot (x ${Math.round(sim.p.x)})`);
          assert.ok(tr.textX - c.x >= RING_MARGIN - 8, `seed ${seed} trunk ${tr.id}: the ring ${Math.round(tr.textX - c.x)} px from the left`);
          assert.ok(sim.p.x <= c.x + c.viewportWidth - 30, `seed ${seed} trunk ${tr.id}: she is on screen`);
        }
      });
    }
  });
}

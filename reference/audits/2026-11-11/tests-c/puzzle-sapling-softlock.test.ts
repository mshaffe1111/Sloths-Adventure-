/**
 * Audit C (puzzle), finding P-01. Asserts the CORRECT behaviour; FAILS today.
 * Run: npx tsx --test reference/audits/2026-11-11/tests-c/puzzle-sapling-softlock.test.ts
 *
 * 5-M room 1 ("DON'T SIT"): the sapling bends once, sets Meeca down 30 px from the left edge of a ledge 240 px up, and its climb is
 * switched off for good (puzzlePlay.ts stepNight: `sp.bent = true; v.off = true`). The room's signpost leaves it bent (resetRoom: "a
 * bent sapling [stays] bent"). The "bridge" is only a picture: nothing joins the floor and the ledge. So one step back to the left
 * drops her to the floor with no way up again, and nothing but leaving the stage gets her out. The validator calls the room sound
 * because it models the bent sapling as a two-way lift between the root and the ledge (puzzleCheck.ts kitSolved) and stops at the
 * first solved state.
 *
 * Correct: after she drops back, the way up can be had again (at the latest after a tap on the room's signpost).
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { RealPlay } from '../../../../src/game/realPlay.ts';
import { MeecaBot } from '../../../../src/game/meecaBot.ts';
import type { KitPlay } from '../../../../src/game/puzzlePlay.ts';

test("P-01: 5-M room 1: after the sapling has bent, Meeca can drop back to the floor and still get up to the ledge again", () => {
  try {
    localStorage.removeItem('sloth_tips_5-M');
  } catch {
    /* no storage */
  }
  const sim = new RealPlay('5-M', 1);
  const e = sim.e;
  Object.assign(e, { viewCssW: 844, viewCssH: 390, introT: 99 });
  e.applyZoom();
  const bot = new MeecaBot(sim);
  bot.card();
  e.mc.marked = 1;
  e.mc.flicker.on = true;
  e.mc.flicker.show = 1;
  const kit = e.kit as KitPlay;
  const room = kit.rooms.find((r) => r.spec.id === 'sit')!;
  const ledge = sim.platforms.find((p) => p.id === room.spec.beyond.on)!;
  const sp = room.saplings[0];
  const post = room.resets[0];
  sim.stand(post.x + 30, post.y);
  sim.frame();
  const climbIt = () => {
    bot.walkTo(sp.x, 4);
    // (straight up the sapling until it has carried her over, as meecaReal.test.ts does)
    const v = sim.vines.find((q) => q.id === sp.spec.vine)!;
    const wasBent = sp.bent;
    for (let i = 0; i < 30 * 8 && (wasBent ? sim.standingOn !== ledge.id && !(v.off && i > 60) : !sp.bent); i++) sim.frame({ up: true });
    sim.frame();
  };
  climbIt();
  assert.ok(sp.bent && sim.standingOn === ledge.id, 'the sapling set her on the ledge');
  assert.ok(sim.p.x - ledge.x < 40, `she is set down ${Math.round(sim.p.x - ledge.x)} px from the ledge's left edge`);

  // a step back to the left: off the ledge, down to the floor
  for (let i = 0; i < 60; i++) sim.frame({ left: true });
  for (let i = 0; i < 30; i++) sim.frame();
  assert.ok(sim.p.y > ledge.y + 200, `she is down on the floor (${Math.round(sim.p.y)})`);
  assert.equal(sim.died, false, 'no life lost: nothing sends her back');

  // the room's signpost, then the same climb that got her up the first time
  sim.stand(post.x - 20, post.y);
  sim.frame({ right: true });
  sim.frame({ punch: true });
  sim.wait(1);
  climbIt();
  assert.equal(sim.standingOn, ledge.id, `stuck below for good: the sapling is bent (${sp.bent}), its climb off (${sim.vines.find((v) => v.id === sp.spec.vine)!.off}), and the signpost left it so`);
});

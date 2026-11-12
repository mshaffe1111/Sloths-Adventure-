/**
 * Audit C (puzzle), findings P-05 and P-06 (brought into the suite by EN-F; each failed on its base).
 *
 * P-05. A room's stuck help (Dot's nudge, then the move: puzzlePlay.ts stepRoom -> told(room, 'nudge' | 'move')) goes out through the
 * engine's once-per-stage tip memory (engine.ts kitHost.tip: `if (tipHeard(id, key)) return; markTipHeard(id, key)`), the memory made
 * for lines "said the first time a stage is played on this phone, and not again on replays or retries" (tipMemory.ts). Its own header
 * says "the lines that answer the moment ... are said whenever they apply". Once the nudge has been SHOWN once (DotGuide confirms it:
 * tipMemory.ts confirmHeard -> kept on the phone for good), a player stuck in the same room on any later run gets no help at all.
 *
 * P-06. "Stuck" is "two failed tries" (STAGE-RULES §3; STUCK.fails = 2). A thing thrown out of the room counts one (lose():
 * room.fails++), and its replacement dropping from the source counts another (stepRoom: `if (landedQuiet) room.fails++`: every quiet
 * landing is a miss, the source's own drop included). One lost throw is "two failed tries".
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { RealPlay } from './realPlay.ts';
import { KitPlay, type KitHost } from './puzzlePlay.ts';
import { buildKitStage, kitStageConfig, KIT_STAGE_ID } from './kitStage.ts';
import { confirmHeard, forgetSent } from './tipMemory.ts';
import type { PlayerState } from './types.ts';

const NUDGE = 'Something heavy for the plate?';

/** back and forth in the first room with nothing changing, until the watch calls it stuck (8 turns) */
function pace(sim: RealPlay) {
  const kit = sim.e.kit as KitPlay;
  const room = kit.rooms[0];
  const post = room.resets[0];
  sim.stand(post.x + 60, post.y);
  for (let k = 0; k < 12; k++) for (let i = 0; i < 12; i++) sim.frame(k % 2 ? { left: true } : { right: true });
  sim.frame();
  assert.equal(kit.inRoom, 0, 'he is in the room');
}

test('P-05: stuck in a room again on a later run of the stage, Dot gives her nudge again', () => {
  try {
    localStorage.removeItem(`sloth_tips_${KIT_STAGE_ID}`);
  } catch {
    /* no storage */
  }
  forgetSent();
  const first = new RealPlay(KIT_STAGE_ID, 1);
  pace(first);
  assert.ok(first.said.some((s) => s.text === NUDGE), `the first run: stuck, she nudges (${first.said.map((s) => s.text).join(' | ')})`);
  // her bubble was up long enough to count as shown (DotGuide.tsx does this in play)
  confirmHeard(NUDGE);
  // the same stage started again (a retry, or another day)
  const retry = new RealPlay(KIT_STAGE_ID, 1);
  pace(retry);
  const kept = localStorage.getItem(`sloth_tips_${KIT_STAGE_ID}`);
  localStorage.removeItem(`sloth_tips_${KIT_STAGE_ID}`);
  assert.ok(retry.said.some((s) => s.text === NUDGE), `the later run: just as stuck, and she said only: ${retry.said.map((s) => s.text).join(' | ') || '(nothing)'} (kept on the phone: ${kept})`);
});

test('P-06: one thrown thing lost is one failed try, not two: no stuck help yet', () => {
  const G = 580;
  const st = buildKitStage(kitStageConfig());
  const kit = new KitPlay(st.kit!, st.platforms);
  const room = kit.rooms[0];
  const acorn = room.items[0];
  const p = { x: acorn.x - 30, y: G, vx: 0, vy: 0, facing: 1, grounded: true, climbing: false, walkCycle: 0 } as unknown as PlayerState;
  const tips: string[] = [];
  const h: KitHost = { t: 0, player: p, standingOn: 1, easy: false, tip: (key) => tips.push(key), float: () => {}, sfx: () => {} };
  const none = { tap: false, up: false, side: false, sideDir: 0 };
  const step = (n: number) => {
    for (let i = 0; i < n; i++) {
      h.t += 1 / 30;
      kit.step(1 / 30, h, st.platforms);
    }
  };
  step(2);
  kit.control({ ...none, tap: true }, h, st.platforms);
  assert.ok(kit.holding, 'the acorn is in his hands');
  // at the room's left edge, thrown out of it
  p.x = room.box.x0 + 30;
  p.facing = -1;
  step(1);
  kit.control({ ...none, side: true, sideDir: -1 }, h, st.platforms);
  step(30 * 4);
  assert.equal(acorn.mode, 'rest', 'lost, and a fresh one has dropped from the oak');
  assert.ok(Math.abs(acorn.x - acorn.home.x) < 2, 'back at its source');
  assert.deepEqual(tips.filter((k) => /:(nudge|move)$/.test(k)), [], 'one miss brought the stuck help');
});

test('P-06 (planted the other way): two thrown things lost are two failed tries: the stuck help comes', () => {
  const G = 580;
  const st = buildKitStage(kitStageConfig());
  const kit = new KitPlay(st.kit!, st.platforms);
  const room = kit.rooms[0];
  const acorn = room.items[0];
  const p = { x: acorn.x - 30, y: G, vx: 0, vy: 0, facing: 1, grounded: true, climbing: false, walkCycle: 0 } as unknown as PlayerState;
  const tips: string[] = [];
  const h: KitHost = { t: 0, player: p, standingOn: 1, easy: false, tip: (key) => tips.push(key), float: () => {}, sfx: () => {} };
  const none = { tap: false, up: false, side: false, sideDir: 0 };
  const step = (n: number) => {
    for (let i = 0; i < n; i++) {
      h.t += 1 / 30;
      kit.step(1 / 30, h, st.platforms);
    }
  };
  for (let throwN = 0; throwN < 2; throwN++) {
    p.x = acorn.x - 30;
    p.facing = 1;
    step(2);
    kit.control({ ...none, tap: true }, h, st.platforms);
    assert.ok(kit.holding, `throw ${throwN + 1}: the acorn is in his hands`);
    p.x = room.box.x0 + 30;
    p.facing = -1;
    step(1);
    kit.control({ ...none, side: true, sideDir: -1 }, h, st.platforms);
    step(30 * 4);
  }
  assert.ok(tips.some((k) => /:nudge$/.test(k)), `two misses bring her nudge: ${tips.join(' | ')}`);
});

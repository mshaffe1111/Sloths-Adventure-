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
import { KitPlay } from './puzzlePlay.ts';
import { KIT_STAGE_ID } from './kitStage.ts';
import { confirmHeard, forgetSent } from './tipMemory.ts';

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

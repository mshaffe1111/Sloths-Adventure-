/**
 * Audit C (things): a find is shown as found at the touch (engine.ts collectFind: it is gone from the stage, "FOUND: <title>", the
 * sound, +300), but it is only handed to the app, which is what keeps it (App.tsx onFind -> saveFinds), at the next moment a card may
 * stop the stage (lessonTick -> safeToStop: standing, not blinking from a hit, no animal near, nothing falling). Only a win hands over
 * what is still waiting ("so it is never lost"). A run that ends any other way while one waits (the last life lost, then Start over or
 * the map; the pause menu's Restart or map; 7-7's thorn gate; the phone closing the app) drops it: found on screen, not in the satchel.
 *
 * Correct: a find the game said was found is handed to the app however the run ends.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { RealPlay } from '../../../../src/game/realPlay.ts';
import { FIND_BY_ID } from '../../../../src/game/finds.ts';

test('a find picked up while he blinks from a hit is kept when that run then ends in a Game Over and a restart', () => {
  const r = new RealPlay('1-2', 1);
  const e = r.e;
  // the real lesson/find hand-over and the real life-lost path (the harness swaps both out)
  delete e.lessonTick;
  delete e.loseLife;
  e.isRunning = true;
  r.safe = false;
  const kept: string[] = [];
  e.callbacks.onFind = (id: string) => kept.push(id);

  const bell = r.collectibles.find((c) => c.type === 'find' && !c.hidden)!;
  assert.ok(bell && FIND_BY_ID[bell.findId!], "1-2 holds Meeca's note, in the open");
  // he has just been hit (the 1.2 s of blinking, engine.ts damagePlayer) and touches the note
  r.stand(bell.x, bell.y + 20);
  r.p.invincibleTimer = 1.2;
  r.frame();
  assert.equal(bell.collected, true, 'the note is picked up: gone from the stage, "FOUND" on screen');

  // still blinking, he loses his last life (a fall); the Game Over card comes up
  e.lives = 1;
  r.p.invincibleTimer = 1.0;
  e.loseLife('pit');
  for (let i = 0; i < 120 && e.down; i++) r.frame();
  assert.equal(e.outOfLives, true, 'Game Over');
  // "Start over" (or the map): the app stops this stage and builds a new one (App.tsx launchEngine / onOpenMap -> engine.stop())
  e.stop();

  assert.deepEqual(kept, [bell.findId], 'the find the game showed as found was handed to the app to keep');
});

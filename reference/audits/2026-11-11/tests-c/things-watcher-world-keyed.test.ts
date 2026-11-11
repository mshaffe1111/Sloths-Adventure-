/**
 * Audit C (things): the watcher's words and cries are picked by world number (engine.ts updateWatch: `grotto = worldIndex === 3`,
 * `cliffs = worldIndex === 4`, everything else is World 1's eagle and its bush). World 8's sleeping-bat run (8-1, WatchZone.setback:
 * "no hiding place on this bough") got its own warning line, but the line said when he is seen was missed: it falls to World 1's
 * "It saw you! Get into a bush before its shadow reaches you", with the eagle's screech, on a bough the stage has just said has
 * nowhere to hide.
 *
 * Correct: on a bat run, nothing Dot says sends him to a bush.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { RealPlay } from '../../../../src/game/realPlay.ts';

test("8-1's bat run: caught in the open, Dot never says to get into a bush", () => {
  const r = new RealPlay('8-1', 1);
  const zones = (r.e.proto?.watch ?? []) as Array<{ x0: number; x1: number; setback?: number }>;
  const bat = zones.find((z) => z.setback !== undefined);
  assert.ok(bat, 'this roll of 8-1 has a bat run');
  const x = (bat.x0 + bat.x1) / 2;
  const ground = r.platforms.filter((p) => x >= p.x && x <= p.x + p.width).sort((a, b) => a.y - b.y)[0];
  assert.ok(ground, 'the bough is there');
  // stand in the open in the middle of the run, the view on him (the harness does not run the camera), for up to a minute of passes
  r.stand(x, ground.y);
  const cam = r.e.camera;
  for (let i = 0; i < 30 * 60 && !r.said.some((s) => /saw you/i.test(s.text)); i++) {
    cam.x = Math.max(0, r.p.x - cam.viewportWidth * 0.4);
    if (Math.abs(r.p.x - x) > 50) r.stand(x, ground.y);
    r.frame();
  }
  const lines = r.said.map((s) => s.text);
  assert.ok(lines.some((t) => /nowhere to hide/i.test(t)), `the run's own lesson was said: ${JSON.stringify(lines)}`);
  const bush = lines.filter((t) => /bush/i.test(t));
  assert.deepEqual(bush, [], 'no line on a bat run sends him to a bush');
});

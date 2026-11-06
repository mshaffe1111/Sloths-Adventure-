import test from 'node:test';
import assert from 'node:assert/strict';
import './headlessDom.ts';
import { botRun } from '../../tools/validate/play.ts';

// The required-move gate's limited agent (tools/engine/stage.ts 5d; NODES.md §1 `test`): it bites where a move is needed and the limit
// holds. 1-6 on main needs both the second jump and the bounce: the full first-timer reaches the shrine, and without either it does not.
test('the limited bot: without the double (no second jump made) or the bounce, it stops short on 1-6, where the full bot finishes', () => {
  const full = botRun('1-6', 1, 'normal');
  assert.equal(full.run.end, 'shrine');
  const noDbl = botRun('1-6', 1, 'normal', { without: { move: 'double', x0: 0, x1: 1e9 } });
  assert.equal(noDbl.doubled.inside, 0, 'the limit holds: no second jump inside the stretch');
  assert.ok((noDbl.run.end !== 'shrine' && noDbl.reachX < full.reachX) || noDbl.run.rescueXs.length > 0, `without the double: ${noDbl.run.end} at ${noDbl.reachX}, ${noDbl.run.rescueXs.length} rescues`);
  const noBounce = botRun('1-6', 1, 'normal', { without: { move: 'bounce', x0: 0, x1: 1e9 } });
  // (the planner, 11-06: a limited run the first-timer's rescue carried to the shrine did not get there on its own (firsttimer.ts rescue()
  // puts him further on after three falls back; with the route walls, a8977c70, the no-bounce bot reached 1-6's shrine on 14 rescues),
  // and a stomp off an animal is not a mushroom's bounce (engine.ts: kind 'stomp' against 'spring'; its one "bounce" was a stomp at x 13413))
  const onItsOwn = (r: typeof noBounce) => r.run.end === 'shrine' && r.run.rescueXs.length === 0 && r.run.softFallXs.length === 0;
  assert.ok(!onItsOwn(noBounce) && noBounce.met.sprung === 0, `without the bounce: ${noBounce.run.end} on ${noBounce.run.rescueXs.length} rescues, ${noBounce.met.sprung} mushroom bounces`);
});

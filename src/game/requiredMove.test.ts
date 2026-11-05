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
  assert.ok(noDbl.run.end !== 'shrine' && noDbl.reachX < full.reachX, `without the double: ${noDbl.run.end} at ${noDbl.reachX}`);
  const noBounce = botRun('1-6', 1, 'normal', { without: { move: 'bounce', x0: 0, x1: 1e9 } });
  assert.ok(noBounce.run.end !== 'shrine' && noBounce.met.bounced === 0, `without the bounce: ${noBounce.run.end}, bounced ${noBounce.met.bounced}`);
});

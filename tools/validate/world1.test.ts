/**
 * The measuring stick, proven on today's World 1 (fun-validator; PLAN-TO-80 A.1: "it must score today's World 1 badly before we trust
 * it"). Each assertion is something Matt felt playing it (STATUS 2026-11-02 "everything feels the same"; 2026-11-04 rating 55, "branches
 * and eagles can be outrun") or the quality supervisor saw in the real-game clips (2026-11-04). Calls the real stage builders through the
 * engine (D19: RealPlay, generateStage). When World 1 is rebuilt this file is expected to fail: it then becomes the before, and the
 * rebuild is judged by the same checks passing the other way.
 *   npx tsx --test tools/validate/world1.test.ts
 */
import '../../src/game/headlessDom.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import { cosine, grams } from './core.ts';
import { world } from './evaluate.ts';
import { branchOutrun, eagleOutrun } from './play.ts';

const w = world(1, 'normal');
const by = Object.fromEntries(w.map((e) => [e.id, e]));
const has = (id: string, rule: string) => by[id].flags.some((f) => f.rule === rule);

test('"everything feels the same": 1-1, 1-2, 1-5 and 1-6 read over 80% alike in their moves', () => {
  for (const [a, b] of [['1-1', '1-2'], ['1-1', '1-5'], ['1-2', '1-5'], ['1-5', '1-6']]) {
    const c = cosine(grams(by[a].str), grams(by[b].str));
    assert.ok(c > 0.8, `${a} vs ${b}: ${c.toFixed(2)}`);
  }
});

test('nothing bites: on 1-1, 1-2 and 1-7 a miss costs nothing on over 80% of the beats after the first 30 s (the old rule, as found)', () => {
  for (const id of ['1-1', '1-2', '1-7']) assert.ok((by[id].oldFlags ?? []).some((f) => f.rule === 'nothing bites'), id);
});

test('nothing bites, the truer rule (a fall of over 200 px bites, the lead 11-04): 1-2 and 1-7 still cost nothing; 1-1\'s high branches bite', () => {
  for (const id of ['1-2', '1-7']) assert.ok(has(id, 'nothing bites'), `${id}: ${by[id].costs.nothing} free of ${by[id].costs.nothing + by[id].costs.setback + by[id].costs.life}`);
  // (1-1's finish runs its double jumps along branches at y 335, about 245 px over the ground: a miss there drops him to it)
  assert.ok(!has('1-1', 'nothing bites') && by['1-1'].costs.setback >= 20, JSON.stringify(by['1-1'].costs.setback));
});

test('padding: 1-1\'s finish is over half the stage, its piece laid again and again (the supervisor\'s clip: about 10 times)', () => {
  assert.ok(by['1-1'].padding && by['1-1'].padding.finishShare >= 0.5, JSON.stringify(by['1-1'].padding));
  assert.ok((by['1-1'].padding?.repeats ?? []).some((r) => r.n >= 5));
});

test('one tempo and flat pacing: no World 1 stage asks both to hurry and to wait; most never get tight', () => {
  assert.ok(w.every((e) => !(e.tempo.hurry && e.tempo.patience)), w.map((e) => `${e.id} ${e.tempo.hurry}/${e.tempo.patience}`).join(' '));
  // (most never got tight on the old rule, a 5 s window over 1.15 moves a second, as found 11-04; the truer rule reads a burst as the
  // research defines it per setting (the lead, 2026-11-05), and the rebuilt stages have one)
  assert.ok(w.filter((e) => (e.oldFlags ?? e.flags).some((f) => /never tight/.test(f.what))).length >= 6);
});

test('branches can be outrun: 1-5\'s breaking branch runs are crossed by just holding right, none giving way under him', () => {
  const v = branchOutrun('1-5', 1, 'normal');
  assert.ok(v.length >= 1 && v.every((r) => r.outrun), JSON.stringify(v.map((r) => [r.run.x0, r.underHim, r.fell])));
});

test('eagles can be outrun: most of 1-7\'s watched stretches are crossed unhurt by just holding right, never hiding', () => {
  const v = eagleOutrun('1-7', 1, 'normal', false)!;
  const out = v.zones.filter((z) => z.outrun).length;
  assert.ok(out * 2 >= v.zones.length, `${out} of ${v.zones.length} stretches outrun`);
});

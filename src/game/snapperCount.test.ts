/**
 * 2-5 River Snappers' goal counts every snapper beaten (QA 2026-10-28: "Punching raised the score but predators stayed 0/17").
 * In the real engine (realPlay.ts): a blow from behind and a stomp knock a snapper out, and so does Dot's own tip, "Kick the shell!":
 * a shell kicked after a head-on blow slides to a stop and is out of the fight. It used to come back out dizzy, then walk again, and the
 * goal stayed where it was. A head-on punch alone only makes it hide.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { RealPlay, type Pad } from './realPlay.ts';
import type { Enemy } from './types.ts';

type Way = 'behind' | 'stomp' | 'kick the shell' | 'head-on punches';

function beat(way: Way, which: number): { counted: number; down: boolean } {
  const sim = new RealPlay('2-5', 1);
  const ts = (sim.e.enemies as Enemy[]).filter((x) => x.type === 'turtle').sort((a, b) => a.x - b.x);
  const t = ts[which];
  const y = t.y + 14;
  const side = way === 'behind' ? -t.facing : t.facing;
  if (way === 'stomp') sim.fly(t.x, y - 150, 0, 0);
  else sim.stand(t.x + side * 40, y);
  for (let i = 0; i < 150 && !t.defeated; i++) {
    const face = (t.x > sim.p.x ? 1 : -1) as 1 | -1;
    sim.p.facing = face;
    const pad: Pad = {};
    if (i % 10 === 0 && way !== 'stomp') {
      if (way === 'kick the shell' && (t.state === 'shell' || t.state === 'peek')) pad.kick = face;
      else pad.punch = true;
    }
    sim.frame(pad);
  }
  return { counted: sim.p.enemiesDefeated, down: !!t.defeated };
}

test('2-5: a snapper beaten from behind, stomped, or kicked away in its shell counts toward the goal; head-on punches only make it hide', () => {
  for (const which of [0, 1, 2]) {
    for (const way of ['behind', 'stomp', 'kick the shell'] as const) {
      const r = beat(way, which);
      assert.ok(r.down && r.counted === 1, `snapper ${which}, ${way}: ${JSON.stringify(r)}`);
    }
    const r = beat('head-on punches', which);
    assert.ok(!r.down && r.counted === 0, `snapper ${which}, head-on: ${JSON.stringify(r)}`);
  }
});

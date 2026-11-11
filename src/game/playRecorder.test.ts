// R-165.58 (packet E1): the recorder counts every use of the double jump and the bounce, not only the first of a stage. The first use in a
// stage stays `move <kind> <x>` (old readers' counts unchanged); every later use is `use <kind> <x>`. Driven in the real engine (RealPlay).
import test from 'node:test';
import assert from 'node:assert/strict';
import './headlessDom.ts';
import { RealPlay } from './realPlay.ts';
import { recorder } from './playRecorder.ts';
import type { Collectible, Platform } from './types.ts';

const P = (id: number, x: number, y: number, width: number, height = 24, type: Platform['type'] = 'solid'): Platform => ({ id, x, y, width, height, type, style: 'moss_stone' });

/** the recorder's events while the test runs (recording "on", nothing sent) */
function listen(): { log: Array<[string, string]>; stop: () => void } {
  const log: Array<[string, string]> = [];
  const r = recorder as unknown as { on: boolean; event: (w: string, d?: string | number) => void };
  const was = { on: r.on, event: r.event };
  r.on = true;
  r.event = (w, d) => log.push([w, d === undefined ? '' : String(d)]);
  return { log, stop: () => Object.assign(r, was) };
}

test('recorder: three double jumps and two bounces in one stage log one move + two use (double), one move + one use (bounce)', () => {
  const r = new RealPlay('1-1', 1);
  const e = (r as unknown as { e: { platforms: Platform[]; enemies: unknown[]; collectibles: Collectible[]; proto: { hints: unknown[] } | null } }).e;
  e.platforms.splice(0, e.platforms.length, P(9001, 0, 700, 4000, 300), P(9002, 2600, 680, 70, 20, 'bouncy'));
  e.enemies.splice(0, e.enemies.length);
  e.collectibles.splice(0, e.collectibles.length);
  if (e.proto) e.proto.hints = [];
  const { log, stop } = listen();
  try {
    recorder.stageStart();
    for (let n = 0; n < 3; n++) {
      r.fly(600 + n * 400, 400, 0, 0, 1); // in the air: a jump press is the double jump
      r.frame({ press: true, jump: true });
      for (let i = 0; i < 40; i++) r.frame({});
    }
    for (let n = 0; n < 2; n++) {
      r.fly(2635, 560, 0, 200, 1); // dropped onto the mushroom
      for (let i = 0; i < 30; i++) r.frame({});
    }
    const rows = (w: string, k: string) => log.filter(([a, d]) => a === w && d.startsWith(k + ' '));
    assert.equal(rows('move', 'double').length, 1, JSON.stringify(log));
    assert.equal(rows('use', 'double').length, 2, JSON.stringify(log));
    assert.equal(rows('move', 'bounce').length, 1, JSON.stringify(log));
    assert.equal(rows('use', 'bounce').length, 1, JSON.stringify(log));
    for (const [, d] of [...rows('move', 'double'), ...rows('use', 'double'), ...rows('move', 'bounce'), ...rows('use', 'bounce')]) assert.match(d, /^(double|bounce) \d+$/);
    // a restart: the first use is a `move` again
    recorder.stageStart();
    r.fly(900, 400, 0, 0, 1);
    r.frame({ press: true, jump: true });
    assert.equal(rows('move', 'double').length, 2);
    assert.equal(rows('use', 'double').length, 2);
  } finally {
    stop();
  }
});

test('recorder: off (the store build, no tester) logs no move and no use', () => {
  const r = recorder as unknown as { on: boolean; event: (w: string, d?: string | number) => void };
  const was = { on: r.on, event: r.event };
  const log: string[] = [];
  r.on = false;
  r.event = (w) => log.push(w);
  try {
    recorder.stageStart();
    recorder.moveOnce('double', 10);
    recorder.moveOnce('double', 20);
    assert.deepEqual(log, []);
  } finally {
    Object.assign(r, was);
  }
});

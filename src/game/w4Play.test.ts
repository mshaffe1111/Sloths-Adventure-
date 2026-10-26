import test from 'node:test';
import assert from 'node:assert/strict';
import { W4Play, type W4Extras, type W4Host } from './w4Play.ts';
import { ROCK } from './rockfall.ts';
import type { Collectible, Platform, PlayerState as Player, Vine } from './types.ts';

const dt = 1 / 30;

const plat = (id: number, x: number, y: number, width: number, extra: Partial<Platform> = {}): Platform => ({ id, x, y, width, height: 30, type: 'solid', ...extra });

function host(over: Partial<W4Host> = {}) {
  const player = { x: 0, y: 700, vx: 0, vy: 0, grounded: true, invincibleTimer: 0 } as unknown as Player;
  const log = { hurt: 0, tips: [] as string[], screech: 0 };
  const h: W4Host = {
    t: 0,
    player,
    platforms: [],
    vines: [],
    collectibles: [],
    zones: [],
    punch: null,
    hidden: false,
    hurt: () => log.hurt++,
    tip: (k) => log.tips.push(k),
    float: () => {},
    screech: () => log.screech++,
    sfx: () => {},
    ...over,
  };
  return { h, player, log };
}

function run(w: W4Play, h: W4Host, seconds: number, each?: () => void) {
  for (let i = 0; i < Math.round(seconds * 30); i++) {
    each?.();
    w.step(dt, h);
    h.t += dt;
  }
}

test('the frond bridge is not there until he waits beside it, then it stays', () => {
  const bridge = plat(5, 400, 700, 160);
  const w4: W4Extras = { patience: [{ kind: 'frond', x0: 300, x1: 400, y: 700, fill: 3, platformId: 5 }] };
  const { h, player } = host({ platforms: [bridge] });
  const w = new W4Play(w4, h.platforms, h.vines);
  assert.equal(bridge.broken, true);
  player.x = 350;
  run(w, h, 4);
  assert.equal(bridge.broken, false);
  player.x = 100;
  player.vx = 200;
  run(w, h, 2);
  assert.equal(bridge.broken, false, 'walking off rolled the bridge back up');
});

test('a falling rock hurts him once if he stands under it, never if he waits to the side', () => {
  const rock = { x: 500, top: 100, land: 700, every: 5, warn: 1.4, offset: 0 };
  const under = host();
  under.player.x = 500;
  run(new W4Play({ rocks: [rock] }, [], []), under.h, rock.every);
  assert.equal(under.log.hurt, 1);
  const aside = host();
  aside.player.x = 500 + ROCK.radius + 60;
  run(new W4Play({ rocks: [rock] }, [], []), aside.h, rock.every * 2);
  assert.equal(aside.log.hurt, 0);
});

test('rolling the boulder into the channel dries the fall, and its pool drains and the log sinks', () => {
  const boulder = plat(7, 100, 300, 60, { height: 60, push: { min: 0, max: 260 } });
  const log = plat(8, 600, 600, 120);
  const w4: W4Extras = {
    falls: [{ id: 1, x: 380, width: 60, top: 300, bottom: 700, plug: { platformId: 7, atX: 200 } }],
    pools: [{ fedBy: 1, platformId: 8, fullY: 600, emptyY: 680 }],
  };
  const { h, player } = host({ platforms: [boulder, log] });
  const w = new W4Play(w4, h.platforms, h.vines);
  player.x = 410;
  player.y = 500;
  player.grounded = false;
  player.vy = 0;
  w.step(dt, h);
  assert.ok(player.vy > 0, 'pouring water did not push him down');
  assert.ok(player.vx < 0 && player.x < 410, 'pouring water did not carry him back out the way he came');
  boulder.x = 200;
  run(w, h, 4);
  player.x = 410;
  player.vy = 0;
  w.step(dt, h);
  assert.equal(player.vy, 0, 'a dry fall still pushed');
  assert.ok(Math.abs(log.y - 680) < 1, `the log should have sunk (y ${log.y})`);
});

test('standing still under a knot sends Dot up, and the vine drops down', () => {
  const vine: Vine = { id: 3, x: 600, topY: 200, bottomY: 650, swaySpeed: 0, swayPhase: 0 };
  const { h, player } = host({ vines: [vine] });
  const w = new W4Play({ knots: [{ x: 600, y: 200, x0: 560, x1: 640, ground: 700, releases: { kind: 'vine', id: 3 } }] }, h.platforms, h.vines);
  assert.ok(vine.bottomY < 300, 'the vine should hang rolled up');
  player.x = 600;
  run(w, h, 4);
  assert.equal(vine.bottomY, 650);
});

test('a thief takes the petal; a punch while it teases gives it back where it fell', () => {
  const petal = { id: 40, type: 'flower', x: 520, y: 680, collected: false, bobPhase: 0 } as Collectible;
  const { h, player } = host({ collectibles: [petal] });
  const w = new W4Play({ monkeys: [{ job: 'thief', x: 500, y: 700, petalId: 40, path: [{ x: 800, y: 700 }, { x: 1100, y: 700 }] }] }, [], []);
  player.x = 400;
  run(w, h, 0.1);
  assert.equal(petal.collected, true);
  run(w, h, 1.5);
  h.punch = { x: 800, y: 680 };
  w.step(dt, h);
  h.punch = null;
  assert.equal(petal.collected, false);
  assert.equal(petal.x, 800);
});

test('a lookout gives him away unless he hides, or a knocked-down fruit keeps it busy', () => {
  const look = { job: 'lookout' as const, x: 1000, y: 700, x0: 700, x1: 1300 };
  const open = host();
  open.player.x = 900;
  run(new W4Play({ monkeys: [look] }, [], []), open.h, 2);
  assert.equal(open.log.screech, 1);
  const hid = host({ hidden: true });
  hid.player.x = 900;
  run(new W4Play({ monkeys: [look] }, [], []), hid.h, 3);
  assert.equal(hid.log.screech, 0);
  const fed = host();
  fed.player.x = 900;
  const w = new W4Play({ monkeys: [look], fruit: [{ x: 1100, y: 500, ground: 700 }] }, [], []);
  fed.h.punch = { x: 1100, y: 510 };
  w.step(dt, fed.h);
  fed.h.punch = null;
  run(w, fed.h, 5);
  assert.equal(fed.log.screech, 0, 'it screeched while eating');
});

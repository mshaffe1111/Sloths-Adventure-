/**
 * DOT-10 (polish report 1, 2026-10-29): Dot's help after a second death at one spot names what got him. The cause comes from what he last
 * stood on and held (dotGuideWatch.ts DeathWatch) and the engine's reason for the lost life (GuideView.lostTo), and each cause has its own
 * approved line (the thirteen help.* lines that were wired nowhere). The push log first: Easy players lost the most lives there.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { DeathWatch, StruggleWatch, STRUGGLE_LINES, type DeathCause } from './dotGuideWatch.ts';
import { emptyGuideView, type GuidePlatform, type GuideView } from './dotGuideView.ts';
import { dotText } from './dotLines.ts';

const G = 600;
const plat = (x: number, width: number, o: Partial<GuidePlatform> = {}): GuidePlatform => ({ x, y: G, width, height: 40, type: 'solid', ...o });

function view(o: Partial<GuideView>): GuideView {
  return { ...emptyGuideView(), live: true, levelH: 1200, hp: 3, maxHp: 3, lives: 3, ...o };
}

/** play frames (each a partial view) through a watch, then lose a life with `lostTo`; returns the cause */
function die(frames: Partial<GuideView>[], lostTo: GuideView['lostTo'], base: 'fall' | 'foe' | 'other', world: Partial<GuideView>): DeathCause {
  const w = new DeathWatch();
  for (const f of frames) w.step(view({ ...world, ...f }), 33);
  return w.cause(view({ ...world, lostTo, px: 100, py: G }), base);
}

const walk = (x: number, n = 10): Partial<GuideView>[] => Array.from({ length: n }, (_, i) => ({ px: x + i * 8, py: G, grounded: true, vx: 240 }));

test('the push log comes first: drowning by the log gets "Slide into the log", then "Push it to the wall"', () => {
  const world = { platforms: [plat(0, 600), plat(400, 120, { push: { min: 400, max: 700 }, y: G - 60 }), plat(1100, 400)] };
  const c = die([...walk(500), { px: 600, py: G + 40, grounded: false, vy: 500 }], 'water', 'fall', world);
  assert.equal(c, 'pushLog');
  const s = new StruggleWatch();
  assert.equal(s.death(620, G, c), null);
  const h = s.death(640, G, c);
  assert.equal(h?.text, dotText('help.pushLog'));
  assert.equal(h?.text, 'Slide into the log and keep holding.');
  // the next death there is quiet; the one after says the second step
  assert.equal(s.death(630, G, c), null);
  assert.equal(s.death(610, G, c)?.text, 'Push it to the wall, then hop up.');
  assert.equal(s.death(615, G, c), null, 'then quiet');
});

test('a river: riding a log into the water, or missing the logs', () => {
  const world = { platforms: [plat(0, 300), plat(400, 90, { type: 'drift' }), plat(1200, 400)] };
  const ride = die([...walk(100, 3), { px: 420, py: G, grounded: true }, { px: 440, py: G, grounded: true }, { px: 470, py: G + 30, grounded: false, vy: 300 }], 'water', 'fall', world);
  assert.equal(ride, 'riverRide');
  assert.equal(STRUGGLE_LINES['death-riverRide'], 'Stay on the log till it reaches the bank.');
  const miss = die([...walk(200), { px: 300, py: G - 40, grounded: false, vy: -300 }, { px: 360, py: G + 30, grounded: false, vy: 400 }], 'water', 'fall', world);
  assert.equal(miss, 'river');
  assert.equal(STRUGGLE_LINES['death-river'], 'Wait for the log, then flick up onto it.');
});

test('still water with something moving to ride, a crumbling branch, a swing, a climb, a missed vine', () => {
  const moving = { platforms: [plat(0, 300), plat(420, 100, { type: 'moving' })] };
  assert.equal(die([...walk(200), { px: 330, py: G - 40, grounded: false, vy: -300 }, { px: 380, py: G + 30, grounded: false, vy: 400 }], 'water', 'fall', moving), 'water');
  assert.equal(STRUGGLE_LINES['death-water'], 'Wait for the log, then flick up.');
  const crumble = { platforms: [plat(0, 300), plat(300, 100, { type: 'fragile' }), plat(900, 300)] };
  assert.equal(die([...walk(310, 3), { px: 340, py: G + 50, grounded: false, vy: 400 }], 'pit', 'fall', crumble), 'crumble');
  assert.equal(STRUGGLE_LINES['death-crumble'], 'Shaky branches drop. Keep moving!');
  const vines = { platforms: [plat(0, 300), plat(900, 300)], vines: [{ x: 500, topY: 200, bottomY: 500, vineType: 'swing_liana' }] };
  assert.equal(die([{ px: 500, py: 480, swinging: true, grounded: false }, { px: 560, py: 500, grounded: false, vy: 200 }], 'pit', 'fall', vines), 'swingLeap');
  assert.equal(STRUGGLE_LINES['death-swingLeap'], 'Flick up at the front of the swing.');
  assert.equal(die([...walk(200), { px: 320, py: G - 60, grounded: false, vy: -400 }, { px: 480, py: G + 30, grounded: false, vy: 400 }], 'pit', 'fall', vines), 'swingGrab');
  assert.equal(STRUGGLE_LINES['death-swingGrab'], 'Flick up into the vine to grab it.');
  const trunk = { platforms: [plat(0, 300)], vines: [{ x: 320, topY: 100, bottomY: 600, vineType: 'tree_climb' }] };
  assert.equal(die([{ px: 320, py: 300, climbing: true, grounded: false }, { px: 340, py: 400, grounded: false, vy: 400 }], 'pit', 'fall', trunk), 'vine');
  assert.equal(STRUGGLE_LINES['death-vine'], 'Slide straight up. It always climbs.');
});

test('a gap: ran off the edge, a row of little stumps, a gap wider than one jump, or a plain miss', () => {
  const wide = { platforms: [plat(0, 300), plat(800, 300)] };
  // walked off at a run, never jumped
  assert.equal(die([...walk(200), { px: 305, py: G + 10, grounded: false, vx: 240, vy: 60 }], 'pit', 'fall', wide), 'runStop');
  assert.equal(STRUGGLE_LINES['death-runStop'], 'Lift your thumb to stop.');
  // jumped at a 500 px gap
  assert.equal(die([...walk(200), { px: 300, py: G - 40, grounded: false, vx: 240, vy: -400 }, { px: 500, py: G + 30, grounded: false, vy: 400 }], 'pit', 'fall', wide), 'gapWide');
  assert.equal(STRUGGLE_LINES['death-gapWide'], 'Flick up again midair for the far side.');
  const stumps = { platforms: [plat(0, 300), plat(400, 80), plat(560, 80), plat(720, 300)] };
  assert.equal(die([{ px: 420, py: G, grounded: true }, { px: 470, py: G - 30, grounded: false, vy: -300 }, { px: 520, py: G + 30, grounded: false, vy: 400 }], 'pit', 'fall', stumps), 'shortHops');
  assert.equal(STRUGGLE_LINES['death-shortHops'], 'Flick up beside each stump to hop.');
  const small = { platforms: [plat(0, 300), plat(420, 300)] };
  assert.equal(die([...walk(200), { px: 300, py: G - 40, grounded: false, vy: -400 }, { px: 340, py: G + 30, grounded: false, vy: 400 }], 'pit', 'fall', small), 'fall');
  assert.equal(STRUGGLE_LINES['death-fall'], 'Flick up a little before the edge.');
});

test('a hit: an animal behind him says to turn back, one in front to punch it first', () => {
  const ground = { platforms: [plat(0, 2000)] };
  const behind = { ...ground, enemies: [{ x: 40, y: G, type: 'snake', defeated: false }] };
  assert.equal(die(walk(100), 'hurt', 'foe', behind), 'turnBack');
  assert.equal(STRUGGLE_LINES['death-turnBack'], 'Slide the other way to turn back.');
  const ahead = { ...ground, enemies: [{ x: 230, y: G, type: 'snake', defeated: false }] };
  assert.equal(die(walk(100), 'hurt', 'foe', ahead), 'foe');
});

test('every help line the brief names is now wired to a cause', () => {
  const wired = new Set(Object.values(STRUGGLE_LINES));
  for (const id of ['help.pushLog', 'help.pushLog2', 'help.riverLogs', 'help.riverRide', 'help.runStop', 'help.shortHops', 'help.swingGrab', 'help.swingLeap', 'help.turnBack', 'help.twice.crumble', 'help.twice.gapWide', 'help.twice.vine', 'help.twice.water'])
    assert.ok(wired.has(dotText(id)), id);
});

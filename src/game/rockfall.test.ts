import test from 'node:test';
import assert from 'node:assert/strict';
import { ROCK, rockAt, rockFits, rockHits, type RockDrop } from './rockfall.ts';

const r: RockDrop = { x: 500, top: 100, land: 720, every: 5, warn: 1.4, offset: 0 };
const fallT = (r.land - r.top) / ROCK.speed;

test('a drop point warns, then the rock falls to its landing, then shatters, every cycle', () => {
  const warnAt = r.every - r.warn - fallT - ROCK.shatter;
  assert.equal(rockAt(r, 0.2).phase, 'idle');
  assert.equal(rockAt(r, warnAt + 0.1).phase, 'warn');
  const mid = rockAt(r, warnAt + r.warn + fallT / 2);
  assert.equal(mid.phase, 'fall');
  assert.ok(mid.y > r.top && mid.y < r.land);
  assert.equal(rockAt(r, warnAt + r.warn + fallT + 0.1).phase, 'shatter');
  assert.equal(rockAt(r, r.every + 0.2).phase, 'idle');
});

test('the warning always comes before the rock, long enough to stop from a walk', () => {
  assert.ok(r.warn >= 1, 'a warning under a second is unfair on a phone');
  assert.equal(rockFits(r), true);
  assert.equal(rockFits({ ...r, every: 2 }), false);
});

test('a falling rock hits him only when it reaches him, and only right under it', () => {
  const warnAt = r.every - r.warn - fallT - ROCK.shatter;
  const atFeet = warnAt + r.warn + (r.land - 20 - r.top) / ROCK.speed;
  assert.equal(rockHits(r, atFeet, 500, r.land, 48), true);
  assert.equal(rockHits(r, atFeet, 600, r.land, 48), false, 'a rock hit him well to the side');
  assert.equal(rockHits(r, warnAt + r.warn + 0.05, 500, r.land, 48), false, 'a rock high above him hit him');
  assert.equal(rockHits(r, 0.2, 500, r.land, 48), false);
});

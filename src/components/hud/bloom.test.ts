import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BLOOM_MS, GLOW_MS, bloomUpdate, bloomView, newBloom, nextBloomEdge, showsSlots, type HudValues } from './bloom.ts';
import { bossRect, centreGeo, centrePlace, counterW, heartsShown, hudGeo, hudMode, hudSafeRect, readMs } from './hudLayout.ts';
import { goalInfo } from './goalInfo.ts';

const start = (o: Partial<HudValues> = {}): HudValues => ({ hp: 5, maxHp: 5, goal: 0, target: 16, lives: 3, score: 0, stage: '1-5', power: null, ...o });

test('at the start of a stage: hearts and goal small, the stage name blooms, lives, score and power hidden', () => {
  const t = newBloom();
  bloomUpdate(t, start(), 0);
  const v = bloomView(t, 10);
  assert.equal(v.hearts, 'small');
  assert.equal(v.goal, 'small');
  assert.equal(v.stage, 'bloom');
  assert.equal(v.lives, 'hidden');
  assert.equal(v.score, 'hidden');
  assert.equal(v.power, 'hidden');
  // and the name goes away by itself
  assert.equal(bloomView(t, BLOOM_MS.stage + 1).stage, 'hidden');
});

test('nothing changes when the same values come again (the game re-renders many times a second)', () => {
  const t = newBloom();
  bloomUpdate(t, start(), 0);
  for (let ms = 100; ms < 5000; ms += 33) bloomUpdate(t, start(), ms);
  const v = bloomView(t, 5000);
  assert.deepEqual([v.hearts, v.goal, v.lives, v.score, v.stage, v.power], ['small', 'small', 'hidden', 'hidden', 'hidden', 'hidden']);
  assert.equal(nextBloomEdge(t, 5000), -1);
});

test('a lost heart blooms the hearts with -1, then they settle small again (always visible)', () => {
  const t = newBloom();
  bloomUpdate(t, start(), 0);
  bloomUpdate(t, start({ hp: 4 }), 1000);
  let v = bloomView(t, 1100);
  assert.equal(v.hearts, 'bloom');
  assert.equal(v.heartDelta, -1);
  v = bloomView(t, 1000 + BLOOM_MS.hearts + 1);
  assert.equal(v.hearts, 'small');
  assert.equal(v.heartDelta, 0);
  // won back
  bloomUpdate(t, start({ hp: 5 }), 4000);
  assert.equal(bloomView(t, 4010).heartDelta, 1);
});

test('two hits close together add up while the bloom is still up', () => {
  const t = newBloom();
  bloomUpdate(t, start(), 0);
  bloomUpdate(t, start({ hp: 4 }), 1000);
  bloomUpdate(t, start({ hp: 3 }), 1400);
  assert.equal(bloomView(t, 1500).heartDelta, -2);
});

test('a pickup blooms the goal counter; lives and score bloom in for a moment and go away', () => {
  const t = newBloom();
  bloomUpdate(t, start(), 0);
  bloomUpdate(t, start({ goal: 1, score: 100 }), 3000);
  let v = bloomView(t, 3050);
  assert.equal(v.goal, 'bloom');
  assert.equal(v.goalDelta, 1);
  assert.equal(v.score, 'bloom');
  assert.equal(v.scoreDelta, 100);
  v = bloomView(t, 3000 + BLOOM_MS.score + 1);
  assert.equal(v.score, 'hidden');
  assert.equal(v.goal, 'small');
  bloomUpdate(t, start({ goal: 1, score: 100, lives: 2 }), 6000);
  v = bloomView(t, 6100);
  assert.equal(v.lives, 'bloom');
  assert.equal(v.livesDelta, -1);
  assert.equal(bloomView(t, 6000 + BLOOM_MS.lives + 1).lives, 'hidden');
  // about 2 s
  assert.ok(BLOOM_MS.lives >= 1800 && BLOOM_MS.lives <= 2400);
});

test('a power-up blooms when it starts, stays small while it lasts, and goes when it ends', () => {
  const t = newBloom();
  bloomUpdate(t, start(), 0);
  bloomUpdate(t, start({ power: 'speed' }), 1000);
  assert.equal(bloomView(t, 1100).power, 'bloom');
  assert.equal(bloomView(t, 1000 + BLOOM_MS.power + 1).power, 'small');
  bloomUpdate(t, start({ power: null }), 9000);
  assert.equal(bloomView(t, 9001).power, 'hidden');
});

test('the goal glows once at half, once at one more, and once when met; met stays gold', () => {
  const t = newBloom();
  bloomUpdate(t, start({ target: 4 }), 0);
  bloomUpdate(t, start({ target: 4, goal: 1 }), 1000);
  assert.equal(bloomView(t, 1010).goalGlow, false);
  bloomUpdate(t, start({ target: 4, goal: 2 }), 2000);
  assert.equal(bloomView(t, 2010).goalGlow, true, 'half');
  assert.equal(bloomView(t, 2000 + GLOW_MS + 1).goalGlow, false);
  bloomUpdate(t, start({ target: 4, goal: 3 }), 5000);
  assert.equal(bloomView(t, 5010).goalGlow, true, 'one more');
  bloomUpdate(t, start({ target: 4, goal: 4 }), 8000);
  let v = bloomView(t, 8010);
  assert.equal(v.goalGlow, true, 'met');
  assert.equal(v.goalMet, true);
  v = bloomView(t, 20000);
  assert.equal(v.goalGlow, false, 'no endless pulse');
  assert.equal(v.goalMet, true);
});

test('a restart in place (count and score back to 0) does not bloom anything', () => {
  const t = newBloom();
  bloomUpdate(t, start(), 0);
  bloomUpdate(t, start({ goal: 5, score: 500 }), 1000);
  bloomUpdate(t, start({ goal: 0, score: 0 }), 5000);
  const v = bloomView(t, 5010);
  assert.equal(v.goal, 'small');
  assert.equal(v.score, 'hidden');
});

test('the quota arriving from the engine (a different number) does not bloom the counter', () => {
  const t = newBloom();
  bloomUpdate(t, start({ target: 33 }), 0);
  bloomUpdate(t, start({ target: 90 }), 30);
  assert.equal(bloomView(t, 40).goal, 'small');
  assert.equal(bloomView(t, 40).goalGlow, false);
});

test('a new stage starts clean', () => {
  const t = newBloom();
  bloomUpdate(t, start(), 0);
  bloomUpdate(t, start({ hp: 2 }), 100);
  bloomUpdate(t, start({ stage: '1-6' }), 200);
  const v = bloomView(t, 210);
  assert.equal(v.hearts, 'small');
  assert.equal(v.stage, 'bloom');
});

test('the next edge is when the earliest bloom ends', () => {
  const t = newBloom();
  bloomUpdate(t, start(), 0);
  bloomUpdate(t, start({ hp: 4 }), 100);
  assert.equal(nextBloomEdge(t, 200), 100 + BLOOM_MS.hearts - 200);
});

test('small quotas (8 or fewer) show as slots, bigger ones as a count', () => {
  assert.equal(showsSlots(4), true);
  assert.equal(showsSlots(8), true);
  assert.equal(showsSlots(9), false);
  assert.equal(showsSlots(0), false);
});

test('layouts: portrait, landscape and short landscape, by size', () => {
  assert.equal(hudMode(390, 844), 'port');
  assert.equal(hudMode(844, 390), 'short');
  assert.equal(hudMode(1024, 600), 'land');
  assert.equal(hudMode(640, 320), 'short');
  // the HUD row's height: about 52 upright, 48 sideways, 40 on the shortest screens
  assert.ok(hudGeo('port').band <= 52);
  assert.ok(hudGeo('land').band <= 48);
  assert.ok(hudGeo('short', 320).band <= 40);
  assert.equal(hudGeo('short', 320).heart, 18);
  // the Menu's touch box is at least 44
  for (const m of ['port', 'land', 'short'] as const) assert.ok(hudGeo(m).menuHit >= 44);
  assert.equal(heartsShown('short', 7), 1);
  assert.equal(heartsShown('land', 6), 6);
});

test("Dot's room is under the HUD (hearts, centre counter, boss bar) and never reaches the bottom corners", () => {
  for (const [w, h] of [[390, 844], [360, 740], [844, 390], [640, 320], [1024, 600], [932, 430]]) {
    for (const boss of [false, true]) {
      const r = hudSafeRect(w, h, { boss });
      assert.ok(r.y >= r.bandBottom, `${w}x${h} under the HUD`);
      assert.ok(r.x >= 0 && r.x + r.w <= w, `${w}x${h} on screen`);
      assert.ok(r.y + r.h < h * 0.5, `${w}x${h} top half only (thumbs below)`);
      if (r.mode !== 'port') assert.ok(r.w <= Math.round(w * 0.46), `${w}x${h} at most 46% wide`);
      if (boss) {
        const b = bossRect(w, h);
        assert.ok(r.y >= b.y + b.h, `${w}x${h} under the boss bar`);
        assert.equal(r.counter, null, 'no counter in a boss fight');
      } else {
        const c = r.counter!;
        assert.ok(r.y >= c.y + c.h, `${w}x${h} under the centre counter`);
        // the counter stays clear of the hearts and the Menu
        if (c.y === 0) {
          assert.ok(c.x >= r.leftEnd, `${w}x${h} counter clear of the hearts`);
          assert.ok(c.x + c.w <= r.rightStart, `${w}x${h} counter clear of the Menu`);
        }
      }
    }
  }
  // with safe areas (a notch on the left, sideways)
  const n = hudSafeRect(844, 390, { insets: { top: 0, right: 47, bottom: 21, left: 47 } });
  assert.ok(n.leftEnd > hudSafeRect(844, 390).leftEnd);
});

test('the centre counter is the biggest thing in the HUD, and sits in the middle', () => {
  for (const [w, h] of [[390, 844], [844, 390], [640, 320], [1024, 600]]) {
    const m = hudMode(w, h);
    const c = centreGeo(m, h);
    const g = hudGeo(m, h);
    assert.ok(c.icon >= g.heart * 1.5, `${w}x${h} icon at least 1.5x a heart`);
    assert.ok(c.num >= g.heart * 1.2, `${w}x${h} number big`);
    const cw = counterW(c, 'count', 33);
    const p = centrePlace(w, h, cw);
    assert.ok(Math.abs(p.cx - w / 2) <= w * 0.12, `${w}x${h} near the middle`);
    if (m !== 'port') assert.equal(p.row, 1, `${w}x${h} one row sideways`);
  }
  // eight slots do not fit beside the hearts on a narrow phone: they take a row of their own, centred
  const c = centreGeo('port');
  const p = centrePlace(390, 844, counterW(c, 'slots', 8));
  assert.equal(p.row, 2);
  assert.equal(p.cx, 195);
  assert.ok(counterW(c, 'slots', 5) < counterW(c, 'slots', 8));
});

test('reading time: 1.5 s plus 0.5 s a word, at least the minimum', () => {
  assert.equal(readMs('This stage: collect 16 petals'), 4000);
  assert.equal(readMs('Go', 3000), 3000);
});

test("the goal card's words fit the stage", () => {
  const cfg = (o: object) => ({ id: '1-5', worldIndex: 1, miniIndex: 5, objectiveType: 'harvest', targetCount: 33, ...o });
  const petals = goalInfo(cfg({}));
  assert.equal(petals.kind, 'count');
  assert.equal(petals.line, 'This stage: collect 33 petals');
  assert.deepEqual(petals.icon, { kind: 'pickup', name: 'petal' });
  assert.equal(goalInfo(cfg({ worldIndex: 3, miniIndex: 6, objectiveType: 'relic_hunt', targetCount: 1 })).line, 'This stage: find 1 keepsake');
  assert.deepEqual(goalInfo(cfg({ worldIndex: 3, miniIndex: 6, objectiveType: 'relic_hunt', targetCount: 4 })).slotIcon(1), { kind: 'pickup', name: 'rattle' });
  assert.equal(goalInfo(cfg({ worldIndex: 2, objectiveType: 'harvest' })).icon.kind, 'flower');
  assert.equal(goalInfo(cfg({ objectiveType: 'sprint' })).line, 'This stage: reach the sanctuary');
  assert.equal(goalInfo(cfg({ objectiveType: 'sprint' })).kind, 'distance');
  assert.equal(goalInfo(cfg({ objectiveType: 'boss_lair' })).kind, 'boss');
  // tips are 8 words or fewer
  for (const t of ['harvest', 'relic_hunt', 'purge', 'gauntlet', 'rescue', 'sprint', 'ascent', 'stealth', 'vine_runner']) {
    const line = goalInfo(cfg({ objectiveType: t })).line;
    assert.ok(line.split(/\s+/).length <= 8, line);
  }
});

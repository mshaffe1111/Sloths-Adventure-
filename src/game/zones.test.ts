import test from 'node:test';
import assert from 'node:assert/strict';
import { generateAllLevels } from './worldsData.ts';
import { generateStage } from './stageGenerator.ts';
import { isGen2Stage } from './gen2/game.ts';
import { validateStage } from './levelCheck.ts';
import {
  zoneState, idleTime, windPush, zoneEffect, columnHit, isDamaging, sporeRecipes, windRecipes, zoneRecipes, pieceWidth, ZONE_RAMP, zoneDrag, tideCrossTime,
  tideRecipes, ruinRecipes, darkRecipes, webRecipes, crumbleTime, isStatic, WEB_SPEED, TIDE_SPEED, CRUMBLE_RUN_MAX, type Zone,
} from './zones.ts';

const levels = generateAllLevels();
const mk = (over: Partial<Zone> = {}): Zone => ({
  kind: 'wind', x0: 1000, x1: 1400, top: 300, bottom: 600, baseY: 560, dir: 1, period: 6, warn: 1, active: 2, offset: 0, force: 120, ...over,
});

test('a zone cycles idle, warn, active, then starts over', () => {
  const z = mk();
  assert.equal(idleTime(z), 3);
  assert.equal(zoneState(z, 0).phase, 'idle');
  assert.equal(zoneState(z, 2.99).phase, 'idle');
  assert.equal(zoneState(z, 3.2).phase, 'warn');
  assert.equal(zoneState(z, 4.5).phase, 'active');
  assert.equal(zoneState(z, 6.01).phase, 'idle');
  assert.equal(zoneState(z, 4.5 + 600).phase, 'active', 'the rhythm never drifts');
});

test('the effect ramps in and out so it never snaps on', () => {
  const z = mk();
  assert.equal(zoneState(z, 3.5).strength, 0, 'no effect during the warning');
  const s0 = zoneState(z, 4.0).strength;
  assert.ok(s0 < 0.05, 'starts at nothing');
  assert.ok(zoneState(z, 4.0 + ZONE_RAMP).strength > 0.99);
  assert.ok(zoneState(z, 4.0 + 2 - 0.01).strength < 0.05, 'fades before it ends');
  assert.equal(zoneState(z, 5.0).strength, 1);
});

test('the offset staggers neighbours', () => {
  const a = mk({ offset: 0 });
  const b = mk({ offset: 2.2 });
  assert.notEqual(zoneState(a, 1).phase, zoneState(b, 1).phase);
});

test('wind pushes by direction and force, less on the ground, and only inside the lane', () => {
  const r = mk({ dir: 1 });
  const l = mk({ dir: -1 });
  const t = 5.0; // fully active
  assert.equal(windPush([r], 1200, 400, t, false), 120);
  assert.equal(windPush([l], 1200, 400, t, false), -120);
  assert.ok(Math.abs(windPush([r], 1200, 400, t, true)) < 120 * 0.5);
  assert.equal(windPush([r], 900, 400, t, false), 0, 'outside the lane');
  assert.equal(windPush([r], 1200, 100, t, false), 0, 'above the lane');
  assert.equal(windPush([r], 1200, 400, 0.5, false), 0, 'idle');
  assert.equal(zoneEffect([r], 'spore', 1200, 400, t).strength, 0, 'wind is not a cloud');
});

test('stages teach in order: first a harmless zone on open ground, then gaps, then more of them', () => {
  for (const world of [3, 4, 9, 10]) {
    const first = zoneRecipes(world, 1);
    assert.equal(first.length, 1);
    assert.equal(first[0].shape, world >= 9 ? 'columns' : 'meadow', 'the first one has nothing to fall into');
    if (world >= 9) assert.equal(first[0].count, 1, 'a single vent or rod to watch first');
    if (world === 4) assert.equal(first[0].dir, 1, 'and the first gust helps');
    assert.ok(zoneRecipes(world, 9).length >= 3);
    for (let m = 1; m <= 9; m++) for (const p of zoneRecipes(world, m)) {
      assert.ok(p.period - p.warn - p.active >= 2, `world ${world} stage ${m}: quiet spell of at least 2s`);
      assert.ok(p.warn >= 0.9);
      assert.ok(pieceWidth(p) > 0);
    }
  }
  assert.ok(sporeRecipes(2).some((p) => p.shape === 'gap'));
  assert.ok(sporeRecipes(5).some((p) => p.shape === 'stones'));
  assert.ok(windRecipes(4).some((p) => p.dir === -1), 'headwinds arrive by stage 4');
});

test('every ordinary World 3 to 10 stage has its zones, and Worlds 1 and 2 have none', () => {
  for (const l of levels) {
    const s = generateStage(l);
    const want = l.worldIndex >= 3 && !['ascent', 'boss_lair'].includes(l.objectiveType) && !l.secret;
    // (a gen2 stage carries its world's own pieces, not the old generator's zones: World 5's proto.w5, as the hand-built 5-1..5-5 do;
    // World 6's proto.gen2.w6, with its tide flats and dark roots among the stage's zones; World 7's proto.gen2.w7, its crumbling tiles'
    // zones only)
    if (want && isGen2Stage(l)) {
      const p = (s as { proto?: { w5?: unknown; gen2?: Record<string, unknown> } }).proto;
      if (l.worldIndex === 5) assert.ok(p?.w5, `${l.id}: World 5's pieces`);
      else assert.ok(p?.gen2?.[`w${l.worldIndex}`], `${l.id}: World ${l.worldIndex}'s pieces`);
      if (l.worldIndex === 7) assert.ok((s.zones ?? []).every((z) => z.kind === 'crumble'), `${l.id}: only crumbling tiles' zones`);
      // (World 8 is dark: every stage holds its dark stretches among its zones)
      if (l.worldIndex === 8) assert.ok((s.zones ?? []).some((z) => z.kind === 'dark'), `${l.id}: the dark`);
      continue;
    }
    if (want) {
      assert.ok((s.zones?.length ?? 0) >= zoneRecipes(l.worldIndex, l.miniIndex).length, `${l.id} is missing its zones`);
      const kind = ({ 3: 'spore', 4: 'wind', 5: 'web', 6: 'tide', 7: 'crumble', 8: 'dark', 9: 'geyser', 10: 'bolt' } as Record<number, string>)[l.worldIndex];
      assert.ok(s.zones!.every((z) => z.kind === kind), `${l.id}: wrong kind of zone for its world`);
    } else {
      assert.equal(s.zones?.length ?? 0, 0, `${l.id} should have no zones`);
    }
  }
});

test('every zone stage passes the validator (waitable, jumpable, nothing hostile inside)', () => {
  for (const l of levels) {
    if (l.worldIndex < 3) continue;
    const s = generateStage(l);
    const r = validateStage(s);
    assert.ok(r.ok, `${l.id}: ${r.errors.slice(0, 3).join('; ')}`);
  }
});

test('the validator rejects a zone that cannot be waited out', () => {
  const l = levels.find((x) => x.id === '4-5')!;
  const s = generateStage(l);
  s.zones![0] = { ...s.zones![0], period: s.zones![0].warn + s.zones![0].active + 1.0 };
  assert.ok(validateStage(s).errors.some((e) => /quiet between bursts/.test(e)));
});

test('a firing column burns what stands in it, and only while it is firing', () => {
  const z = mk({ kind: 'geyser', x0: 1000, x1: 1072, top: 300, bottom: 600, period: 5, warn: 1.2, active: 0.9 });
  assert.ok(isDamaging(z));
  assert.ok(!isDamaging(mk()), 'wind does not burn');
  const idle = idleTime(z);
  assert.equal(columnHit([z], 1020, 520, 28, 64, idle * 0.5), null, 'quiet');
  assert.equal(columnHit([z], 1020, 520, 28, 64, idle + 0.6), null, 'during the warning it is still safe');
  assert.equal(columnHit([z], 1020, 520, 28, 64, idle + z.warn + 0.45), z, 'firing');
  assert.equal(columnHit([z], 1200, 520, 28, 64, idle + z.warn + 0.45), null, 'a step to the side is safe');
  assert.equal(columnHit([z], 1020, 100, 28, 64, idle + z.warn + 0.45), null, 'above the column');
});

test('a bolt is quick but always has a long warning, and every column has a pocket beside it', () => {
  for (const l of levels) {
    if (l.worldIndex !== 9 && l.worldIndex !== 10) continue;
    const s = generateStage(l);
    const cols = (s.zones ?? []).filter(isDamaging).sort((a, b) => a.x0 - b.x0);
    for (const z of cols) {
      assert.ok(z.warn >= 1.1, `${l.id}: warning`);
      assert.ok(idleTime(z) >= 2, `${l.id}: quiet spell`);
    }
    for (let i = 1; i < cols.length; i++) {
      const gap = cols[i].x0 - cols[i - 1].x1;
      assert.ok(gap >= 110 || Math.abs(cols[i].baseY - cols[i - 1].baseY) > 40, `${l.id}: ${gap}px between columns`);
    }
  }
});

test('webs slow you and the mud slows you more once the tide is up', () => {
  const web = mk({ kind: 'web', x0: 1000, x1: 1300, period: 1, warn: 0, active: 1 });
  assert.equal(zoneDrag([web], 1100, 500, 0).speed, WEB_SPEED);
  assert.equal(zoneDrag([web], 900, 500, 0).speed, 1, 'outside the web nothing changes');
  const tide = mk({ kind: 'tide', x0: 1000, x1: 1300, period: 10, warn: 2, active: 2 });
  const low = zoneDrag([tide], 1100, 500, 1).speed;
  const high = zoneDrag([tide], 1100, 500, 9).speed;
  assert.equal(low, TIDE_SPEED.low);
  assert.equal(high, TIDE_SPEED.high);
  assert.ok(high < low);
});

test('the tide stays low long enough to cross, and every mudflat has dry banks', () => {
  for (let m = 1; m <= 9; m++) for (const p of tideRecipes(m)) {
    assert.ok(idleTime(p) >= tideCrossTime(p.len), `stage ${m}: ${idleTime(p)}s low tide for ${p.len}px of mud`);
    assert.ok(p.warn >= 1.5, 'the rise is always seen coming');
  }
});

test('crumbling ruins: short runs with a slab to rest on, and a hold longer than a step takes', () => {
  for (let m = 1; m <= 9; m++) {
    for (const p of ruinRecipes(m)) assert.ok(p.count <= 8 && p.count >= 3);
    assert.ok(crumbleTime(m) >= 0.6, 'every tile holds long enough to run across');
    if (m > 1) assert.ok(crumbleTime(m) <= crumbleTime(m - 1), 'it never gets more generous');
  }
  assert.ok(CRUMBLE_RUN_MAX >= 4);
  for (const l of levels.filter((x) => x.worldIndex === 7)) {
    const s = generateStage(l);
    const tiles = s.platforms.filter((p) => p.crumbleAfter !== undefined);
    if (!(s.zones ?? []).length) continue;
    assert.ok(tiles.length > 0, `${l.id}: ruins zone with no crumbling tiles`);
    assert.ok(tiles.every((p) => p.crumbleAfter === crumbleTime(l.miniIndex)), `${l.id}: hold time`);
  }
});

test('every dark stretch has a firefly swarm on each of its gaps, and the dark never costs a hit', () => {
  for (let m = 1; m <= 9; m++) for (const p of darkRecipes(m)) assert.ok(p.count <= 3);
  for (const l of levels.filter((x) => x.worldIndex === 8)) {
    const s = generateStage(l);
    const gaps = darkRecipes(l.miniIndex).reduce((n, p) => n + p.count, 0);
    const zs = s.zones ?? [];
    for (const z of zs) assert.ok(isStatic(z) && !isDamaging(z));
    // (the old generator's dark recipes; a gen2 stage's dark stretches are its sections', each gap lit by levelCheck's rule)
    if (zs.length && !isGen2Stage(l)) assert.ok(zs.reduce((n, z) => n + (z.lights ?? []).length, 0) >= gaps, `${l.id}: fewer swarms than gaps`);
    if (isGen2Stage(l)) assert.deepEqual(validateStage(s).errors.filter((e) => /no light on it/.test(e)), [], `${l.id}: a gap in the dark with no light`);
  }
});

test('Worlds 5 to 8 teach gently: the first stage is the mildest', () => {
  assert.equal(webRecipes(1)[0].shape, 'patch');
  assert.equal(darkRecipes(1)[0].count, 0, 'the first dark stretch has no gap in it');
  assert.ok(tideRecipes(1).length === 1);
  assert.ok(ruinRecipes(1).length === 1);
  for (const w of [5, 6, 7, 8]) assert.ok(zoneRecipes(w, 9).length >= 3 || w === 5 || w === 7);
});

import { sporeClearTime, SPORE_CLEAR_MIN } from './zones.ts';

test('every spore cloud of every World 3 stage leaves a clear, awake spell long enough to cross', () => {
  for (let mini = 1; mini <= 9; mini++) {
    for (const p of sporeRecipes(mini)) {
      assert.ok(sporeClearTime(p) >= SPORE_CLEAR_MIN - 0.001, `stage ${mini}: ${sporeClearTime(p).toFixed(2)}s clear`);
    }
  }
});

// ───────────── the fog follows the cloud (nothing lingers, nothing faint counts) ─────────────
import { drowsyLevel, drowsySpeed, drowsyJump, DROWSY_LINGER, DROWSY_MIN, DROWSY_JUMP } from './zones.ts';
import { JUMP_RISE, SAFE } from './physics.ts';

test('the spell ends with the cloud: no lingering sleep, and a thin edge of a puff does nothing', () => {
  assert.equal(DROWSY_LINGER, 0);
  assert.equal(drowsyLevel(0), 0);
  assert.equal(drowsyLevel(DROWSY_MIN), 0);
  assert.equal(drowsySpeed(0), 1);
  assert.equal(drowsyJump(0), 1);
});

test('drowsiness grows with the cloud and never more than the full spell', () => {
  let prevSpeed = 1;
  let prevJump = 1;
  for (let s = 0.2; s <= 1.0001; s += 0.1) {
    const l = drowsyLevel(s);
    assert.ok(l > 0 && l <= 1);
    assert.ok(drowsySpeed(l) <= prevSpeed + 1e-9 && drowsyJump(l) <= prevJump + 1e-9, 'a thicker cloud never helps');
    prevSpeed = drowsySpeed(l);
    prevJump = drowsyJump(l);
  }
  assert.ok(Math.abs(drowsyJump(1) - DROWSY_JUMP) < 1e-9);
});

test('a jump made in the thick of a cloud still reaches every platform the generator calls safe', () => {
  const rise = JUMP_RISE * drowsyJump(1) ** 2;
  assert.ok(rise >= SAFE.rise1, `a drowsy jump rises ${rise.toFixed(0)} px; safe platforms are at most ${SAFE.rise1} px up`);
});

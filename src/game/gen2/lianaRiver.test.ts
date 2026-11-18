/**
 * A liana over a river (ENG-24; reference/design/2-4.md "Engine" NEW 1): place `river` AFTER A LIANA lays the river under it (its landing
 * is the river's logs), and gen2/riverLay.ts lianaRiverFaults holds it to the DROP share on both clocks, never the hop rule:
 *   - the judge flies a let-go as the engine does: its shares and waits are the design's real-engine flight (swingLog.ts, the table in
 *     2-4.md), and a coarse real-engine flight (RealPlay, the engine at 30 fps) agrees with it;
 *   - the toy (tools/inspect/lianaRiverToys.ts: a liana over World 2's `long` river, rolled the game's way) builds clean on both settings;
 *   - PLANTED: the same stage with its logs taken out is refused; a row whose logs are too far apart for the drop is refused by the judge
 *     by name (share and wait); the hop rule gives way only under a liana (the design's gap280 passes under one and fails without it);
 *   - a liana no bank reaches is caught from the log (beat 4): on Easy its river runs at most 80 px/s (gap280's 110 is refused).
 */
import '../headlessDom.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { RealPlay, DT } from '../realPlay.ts';
import { setDifficulty } from '../difficulty.ts';
import { setTimedSwing, TIMED } from '../physics.ts';
import { lianaCaught, validateStage } from '../levelCheck.ts';
import type { Platform, Vine } from '../types.ts';
import { layRiver, lianaDrops, logCatches, riverFaults, riverWidth, LIANA_RIVER } from './riverLay.ts';
import { W2_RIVERS } from './worlds/w2.ts';
import { fixtureSeed, toyStage, TOY_RIVERS, TOY_REACH } from '../../../tools/inspect/lianaRiverToys.ts';

/** 2-1's measured liana over a river laid from a bank ending at 2000, its top at 800 (swingLog.ts's world) */
function flown(row: keyof typeof TOY_RIVERS, d: 'normal' | 'easy') {
  setDifficulty(d);
  setTimedSwing(d === 'easy');
  let id = 100;
  const { logs, zone } = layRiver(TOY_RIVERS[row], 2000, 800, () => id++);
  const v = { id: 50, x: 2165, topY: 390, bottomY: 800, vineType: 'swing_liana', isSwingingVine: true, swingAmp: 0.45, swingPeriod: TIMED.period, swingPhase: 0, swaySpeed: 1, swayPhase: 0 } as unknown as Vine;
  return { v, logs, zone, drops: lianaDrops(v, logs.map((p) => p.drift!), d) };
}
const restore = () => { setDifficulty('normal'); setTimedSwing(false); };

test('the drop judge reads the design\'s real-engine flight (2-4.md, swingLog.ts): share to 2 points, wait to 0.1 s', () => {
  // (the design's table: Normal long 86% 0.63 s, twin 80% 0.63 s, gap280 41% 2.70 s; Easy long 92% 0.53 s, deep 89-90% 0.57 s)
  const want: Array<[keyof typeof TOY_RIVERS, 'normal' | 'easy', number, number]> = [
    ['long', 'normal', 0.86, 0.63], ['twin', 'normal', 0.80, 0.63], ['gap280', 'normal', 0.41, 2.70], ['long', 'easy', 0.92, 0.53], ['deep', 'easy', 0.895, 0.57],
  ];
  try {
    for (const [row, d, share, wait] of want) {
      const { drops } = flown(row, d);
      assert.ok(Math.abs(drops.share - share) <= 0.02, `${row} ${d}: share ${drops.share.toFixed(3)} vs the flight's ${share}`);
      assert.ok(Math.abs(drops.wait - wait) <= 0.1, `${row} ${d}: wait ${drops.wait.toFixed(2)} vs the flight's ${wait}`);
    }
  } finally { restore(); }
});

test('the drop judge agrees with the engine itself (RealPlay at 30 fps) press by press on `long`, every 4th frame of both clocks', () => {
  try {
    const { v, logs, drops } = flown('long', 'normal');
    // (swingLog.ts's DROP: the vine at clock k, the river at phase j, a held press with right held; LOG if he stands on a drift platform)
    const r = new RealPlay('2-1', 1);
    const bank: Platform = { id: 1, x: 0, y: 800, width: 2000, height: 200, type: 'solid' } as Platform;
    const far: Platform = { id: 2, x: 2000 + riverWidth(W2_RIVERS.long), y: 800, width: 3000, height: 200, type: 'solid' } as Platform;
    r.bare([bank, far, ...logs], [v]);
    const n = Math.round(TIMED.period / DT), d0 = logs[0].drift!, spacing = (d0.x1 - d0.x0 + d0.width) / logs.length / d0.speed, m = Math.round(spacing / DT);
    let lands = 0, total = 0;
    for (let k = 0; k < n; k += 4) for (let j = 0; j < m; j += 4) {
      r.t = (j * spacing) / m;
      r.swing(r.vines[0], { angle: 0, omega: 0, len: 410 * 0.7, t: k * DT });
      r.frame({ press: true, right: true });
      let out = 'WATER';
      for (let f = 1; f < 120; f++) {
        r.frame({ jump: true, right: true });
        if (r.p.isVineSwinging) continue;
        if (r.p.grounded) { out = r.platforms.find((q) => q.id === r.standingOn)?.type === 'drift' ? 'LOG' : 'BANK'; break; }
        if (r.p.y > 920) break;
      }
      total++;
      if (out === 'LOG') lands++;
    }
    assert.ok(Math.abs(lands / total - drops.share) <= 0.04, `the engine lands ${lands}/${total} (${(lands / total).toFixed(3)}), the judge ${drops.share.toFixed(3)}`);
  } finally { restore(); }
});

test('the toy: a liana over `long` laid by place `river` after the liana builds clean on both settings, the river under the liana', () => {
  const seed = fixtureSeed('drop', 'long');
  assert.ok(seed !== null, 'no roll of 1-60 lays the drop toy clean on both settings');
  for (const d of ['normal', 'easy'] as const) {
    const st = toyStage('drop', 'long', seed!, d);
    const r = st.rivers!.find((q) => q.speed > 0)!;
    const v = st.vines.find((q) => q.vineType === 'swing_liana')!;
    const near = st.platforms.find((p) => p.type === 'solid' && Math.abs(p.x + p.width - r.x0) <= 2)!;
    assert.ok(near && v.x > r.x0 && v.x < r.x1, `${d}: the liana (x ${v.x}) hangs over the water ${r.x0}-${r.x1}`);
    assert.equal(Math.round(v.x - r.x0), TOY_REACH.drop, `${d}: the water starts at the bank the liana is caught from`);
    assert.equal(Math.round(r.x1 - r.x0), riverWidth(W2_RIVERS.long), `${d}: the river is the row's width`);
    assert.ok(lianaCaught(near, v, 1, r.surfaceY), `${d}: the bank reaches the liana`);
    assert.deepEqual(riverFaults(st, d), [], `${d}`);
    assert.deepEqual(st.gen2.errors ?? [], [], `${d}`);
  }
});

test('PLANTED: the toy with its logs taken out is refused (riverFaults and levelCheck)', () => {
  const seed = fixtureSeed('drop', 'long')!;
  for (const d of ['normal', 'easy'] as const) {
    const st = toyStage('drop', 'long', seed, d);
    const bare = { ...st, platforms: st.platforms.filter((p) => p.type !== 'drift') };
    assert.ok(riverFaults(bare, d).some((f) => /0 logs, under 2/.test(f)), `${d}: ${riverFaults(bare, d).join(' | ')}`);
    assert.ok(validateStage(bare as never).errors.some((e) => /fewer than two logs/.test(e)), `${d}: levelCheck`);
  }
});

test('PLANTED: logs too far apart for the drop are refused by the judge by name, on every roll', () => {
  assert.equal(fixtureSeed('drop', 'sparse'), null, 'a roll laid the sparse river under the liana');
  const st = toyStage('drop', 'sparse', 1);
  const errs = (st.gen2.errors ?? []).join(' | ');
  assert.match(errs, /of its let-gos land on a log, under 40%/);
  assert.match(errs, /on it for a let-go that lands on a log, over 2\.85 s/);
});

test('the hop rule gives way only under a liana: gap280 (Normal\'s row; Easy pairs it with `deep`) passes under one, fails both checks without', () => {
  try {
    const { v, logs, zone } = flown('gap280', 'normal');
    const near: Platform = { id: 1, x: 0, y: 800, width: 2000, height: 90, type: 'solid', style: 'log' };
    const far: Platform = { id: 2, x: zone.x1, y: 800, width: 400, height: 90, type: 'solid', style: 'log' };
    const st = { platforms: [near, ...logs, far], rivers: [zone], vines: [v], spawnX: 100, spawnY: 800 };
    assert.deepEqual(riverFaults(st), []);
    const noLiana = { ...st, vines: [] };
    assert.ok(riverFaults(noLiana).some((f) => /past a hop/.test(f)), riverFaults(noLiana).join(' | '));
  } finally { restore(); }
  // (levelCheck's own hop rule, on the built toy with one of its three logs taken out: 384 px between the two left)
  const built = toyStage('drop', 'long', fixtureSeed('drop', 'long')!);
  const one = built.platforms.find((p) => p.type === 'drift')!;
  const wide = { ...built, platforms: built.platforms.filter((p) => p !== one) };
  const far = (x: { platforms: Platform[]; vines: Vine[] }) => validateStage(x as never).errors.filter((e) => /too far to hop/.test(e));
  assert.deepEqual(far(wide), [], 'levelCheck holds a river under a liana to the hop');
  assert.equal(far({ ...wide, vines: wide.vines.filter((v) => v.vineType !== 'swing_liana') }).length, 1, 'levelCheck lets a wide river go with no liana over it');
});

test('a liana no bank reaches is caught from the log (beat 4); on Easy its river runs at most 80 px/s', () => {
  // (Easy's twin row is `long`: the catch toy's 320 px liana over `twin` waits 0.70 s on Easy, over its 0.6, the judge's own refusal)
  const seed = fixtureSeed('catch', 'twin', ['normal', 'easy'], 'long');
  assert.ok(seed !== null, 'no roll lays the catch toy clean on both settings');
  const st = toyStage('catch', 'twin', seed!, 'normal', 'long');
  const r = st.rivers!.find((q) => q.speed > 0)!;
  const v = st.vines.find((q) => q.vineType === 'swing_liana')!;
  const near = st.platforms.find((p) => p.type === 'solid' && Math.abs(p.x + p.width - r.x0) <= 2)!;
  assert.ok(!lianaCaught(near, v, 1, r.surfaceY), 'the bank reaches the catch toy\'s liana');
  assert.ok(st.platforms.some((p) => p.type === 'drift' && p.drift && logCatches(v, p.drift)), 'no jump off a log catches it');
  // (Easy, 110 px/s: refused by name; Normal at 110 is not held to it)
  const easy = toyStage('catch', 'gap280', 1, 'easy');
  assert.match((easy.gen2.errors ?? []).join(' | '), new RegExp(`caught from a log on a river at 110 px/s, over Easy's ${LIANA_RIVER.easyCatch}`));
  const normal = toyStage('catch', 'gap280', 1, 'normal');
  assert.doesNotMatch((normal.gen2.errors ?? []).join(' | '), /over Easy's/);
});

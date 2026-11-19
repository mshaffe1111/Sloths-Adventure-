// The art swap's cut pieces (w1CutArt.ts): drawn with the footing line on the platform's top and a stone's foot on the ground; several
// kinds laid on gen2 1-1; a stone with nothing under its foot gets no cut piece (planted: it would hang in the air, rocks never float)
import test from 'node:test';
import assert from 'node:assert/strict';
import './headlessDom.ts';
import { LAID, MAX_STRETCH, PLANK_MAX, STONE_W_MAX, THICK_LOG_MAX, W1_CUT, cutBox, logPart, logParts, partsOf, pickCut, thickParts } from './w1CutArt.ts';
import { newPlay11, clearPlay11 } from './testlink1_1.ts';
import { w1Finish } from './gen2/worlds/w1.ts';
import { generateAllLevels } from './worldsData.ts';
import { generateStage } from './stageGenerator.ts';
import { setPick11 } from './testlink1_1.ts';
import type { Platform } from './types.ts';

test('a cut stone stands its whole width on the platform (stand span = width), its footing on top, sunk to 3 px into the ground; a plank spans its platform', () => {
  for (const [n, c] of Object.entries(W1_CUT)) {
    if (LAID[n] === 'log') continue; // (the thick planks are drawn as a stone is: their test is below, PAINT-292)
    for (const p of c.kind === 'log' ? [{ x: 1000, y: 500, width: 300, height: 24 }] : [{ x: 1000, y: 600, width: 140, height: 56 }, { x: 1000, y: 600, width: 80, height: 110 }, { x: 1000, y: 600, width: 200, height: 36 }]) {
      const b = cutBox(p, c);
      assert.ok(Math.abs(b.y + c.fy * b.sy - p.y) < 0.01, `${n}: its footing at the top`);
      assert.ok(Math.abs((c.fx1 - c.fx0) * b.sx - p.width) < 0.01, `${n} on ${p.width}: its stand span is the platform's width`);
      assert.ok(Math.abs(b.x + c.fx0 * b.sx - p.x) < 0.01, `${n}: the span starts where the platform does`);
      if (c.kind === 'log') continue;
      assert.ok(b.sx / b.sy <= MAX_STRETCH + 1e-9 && b.sy / b.sx <= MAX_STRETCH + 1e-9, `${n}: stretched ${(b.sx / b.sy).toFixed(2)}`);
      // (drawn down to its foot and no further: what reaches deeper is in the ground)
      assert.ok(b.y + b.h <= p.y + p.height + 3 + 0.01, `${n}: drawn no deeper than its foot`);
      assert.ok(b.srcH <= c.h + 1e-9 && b.srcH > 0, `${n}: shows part of its frame`);
    }
  }
});

test('every gen2 1-1 roll lays at least 6 kinds of cut piece, and the round and grey boulders are laid', () => {
  setPick11('play');
  const cfg = generateAllLevels().find((l) => l.id === '1-1')!;
  const seen = new Set<string>();
  try {
    for (const [i, d] of [[0, 'normal'], [0.4, 'easy'], [0.8, 'normal']] as const) {
      newPlay11(() => i);
      const st = generateStage(cfg, d);
      const kinds = new Set(st.platforms.filter((p) => p.cut).map((p) => p.cut!));
      assert.ok(kinds.size >= 6, `roll ${i} ${d}: ${[...kinds].join(' ')}`);
      for (const k of kinds) seen.add(k);
    }
  } finally {
    clearPlay11();
  }
  for (const b of ['w1-rock-boulder-moss', 'w1-rock-boulder-moss-big', 'w1-boulder-grey-moss', 'w1-boulder-grey-moss-b']) assert.ok(seen.has(b), `${b} is laid`);
});

test("a long plank (the end log, 686 px) is laid as plank pieces end to end, none longer than PLANK_MAX, and it has its piece", () => {
  const p = { id: 7, x: 2000, y: 600, width: 686, height: 24, style: 'log' as const };
  assert.equal(logParts(686), 2);
  assert.equal(logParts(300), 1);
  const parts = Array.from({ length: logParts(p.width) }, (_, i) => logPart(p, i));
  assert.equal(parts[0].x, p.x);
  assert.ok(Math.abs(parts[parts.length - 1].x + parts[parts.length - 1].width - (p.x + p.width)) < 0.01, 'the last piece ends where the log does');
  for (let i = 1; i < parts.length; i++) assert.ok(parts[i].x <= parts[i - 1].x + parts[i - 1].width, 'no gap between pieces');
  for (const q of parts) assert.ok(q.width <= PLANK_MAX + 4, `${q.width}`);
  assert.ok(pickCut(p), 'the end log has a cut piece (no flat code log)');
});

test('gen2 1-1 draws several cut kinds; a stone over air keeps no cut piece (planted)', () => {
  setPick11('play');
  const st = generateStage(generateAllLevels().find((l) => l.id === '1-1')!, 'normal');
  const kinds = new Set(st.platforms.filter((p) => p.cut).map((p) => p.cut));
  assert.ok(kinds.size >= 5, [...kinds].join(' '));
  const P = (id: number, x: number, y: number, width: number, height: number): Platform => ({ id, x, y, width, height, type: 'solid', style: 'moss_stone' });
  assert.ok(pickCut(P(2, 900, 650, 140, 56)), 'a stone has a piece');
  const toy = w1Finish({ platforms: [P(1, 0, 706, 2000, 300), P(2, 900, 650, 140, 56), P(3, 1400, 500, 140, 56)] });
  assert.ok(toy.platforms[1].cut, 'on the ground: cut');
  assert.equal(toy.platforms[2].cut, undefined, 'over air: none');
});

test('PAINT-292: a 50-89 px log is laid as thick painted planks: each piece\'s top on the log\'s top, its body to the foot, one length along the block, no gap, no new stretch (planted: before, no piece under 50 px only)', () => {
  const thick = Object.keys(LAID).filter((n) => LAID[n] === 'log');
  assert.deepEqual(thick.sort(), ['w1-log-plank-a', 'w1-log-plank-b']);
  // (the sizes 1-1 lays: 1-1 seed 791759's 538x50 and 276x55, the tallest 79, a 702 long road and a short one)
  for (const [width, height] of [[538, 50], [276, 55], [702, 52], [229, 79], [226, 73], [252, 78], [130, 60], [586, 50], [324, 55]]) {
    const p = { id: 108, x: 23840, y: 637, width, height, style: 'log' as const };
    const cut = pickCut(p);
    assert.ok(cut && thick.includes(cut), `${width}x${height}: a thick plank (${cut})`);
    const c = W1_CUT[cut!];
    const n = partsOf(p, c);
    assert.equal(n, thickParts(p));
    for (let i = 0; i < n; i++) {
      const q = logPart(p, i, n, 0);
      assert.ok(Math.abs(q.width - width / n) < 0.01, 'every piece the same length');
      assert.ok(Math.abs(q.x - (p.x + (i * width) / n)) < 0.01, 'end to end, no gap and no overlap of stand spans');
      for (const name of thick) {
        const b = cutBox(q, W1_CUT[name]);
        assert.ok(Math.abs(b.y + W1_CUT[name].fy * b.sy - p.y) < 0.01, `${width}x${height} ${name}: its walk line is the log's top`);
        assert.ok(Math.abs(b.x + W1_CUT[name].fx0 * b.sx - q.x) < 0.01 && Math.abs((W1_CUT[name].fx1 - W1_CUT[name].fx0) * b.sx - q.width) < 0.01, 'its stand span is its share');
        const stretch = Math.max(b.sx / b.sy, b.sy / b.sx);
        assert.ok(stretch <= MAX_STRETCH + 1e-9, `${width}x${height} ${name}: stretch ${stretch.toFixed(2)}`);
        // (its body down to the foot, sunk 3 px: no air under it where it stands on the ground; drawn no lower than that)
        assert.ok(b.y + b.h <= p.y + height + 3 + 0.01, 'nothing drawn below the foot + 3');
        assert.ok(b.y + (W1_CUT[name].fb ?? 0) * b.sy >= p.y + height + 3 - 0.01 || stretch > MAX_STRETCH - 1e-6, `${width}x${height} ${name}: its body reaches the foot`);
      }
    }
  }
  // (under 50 a log keeps a thin ledge, as before: the thin planks' choice is unchanged)
  const thin = pickCut({ id: 7, x: 0, y: 0, width: 262, height: 24, style: 'log' });
  assert.ok(thin && LAID[thin] === 'plank', `${thin}`);
  // (from 90 a log is a bank's, the bank painter's)
  assert.equal(pickCut({ id: 7, x: 0, y: 0, width: 300, height: THICK_LOG_MAX + 1, style: 'log' }), undefined);
});

test('PAINT-292: a stone up to STONE_W_MAX wide and under 90 px gets a stone piece within MAX_STRETCH (Easy 1-1 266x55, 1-6 300x56, 1-6 Easy 400x45); 90 and over stays the bank painter\'s', () => {
  for (const [width, height] of [[266, 55], [268, 82], [300, 56], [300, 60], [400, 45], [400, 48]]) {
    const p = { id: 66, x: 15238, y: 913, width, height, style: 'moss_stone' as const };
    const cut = pickCut(p);
    assert.ok(cut, `${width}x${height}: a piece`);
    const b = cutBox(p, W1_CUT[cut!]);
    assert.ok(Math.max(b.sx / b.sy, b.sy / b.sx) <= MAX_STRETCH + 1e-9, `${width}x${height}: no new stretch`);
  }
  assert.equal(pickCut({ id: 1, x: 0, y: 0, width: 300, height: 90, style: 'moss_stone' }), undefined, '300x90: the bank painter, as before');
  assert.equal(pickCut({ id: 1, x: 0, y: 0, width: STONE_W_MAX + 1, height: 55, style: 'moss_stone' }), undefined);
});

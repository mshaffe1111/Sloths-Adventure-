// The art swap's cut pieces (w1CutArt.ts): drawn with the footing line on the platform's top and a stone's foot on the ground; several
// kinds laid on gen2 1-1; a stone with nothing under its foot gets no cut piece (planted: it would hang in the air, rocks never float)
import test from 'node:test';
import assert from 'node:assert/strict';
import './headlessDom.ts';
import { MAX_STRETCH, PLANK_MAX, W1_CUT, cutBox, logPart, logParts, pickCut } from './w1CutArt.ts';
import { newPlay11, clearPlay11 } from './testlink1_1.ts';
import { w1Finish } from './gen2/worlds/w1.ts';
import { generateAllLevels } from './worldsData.ts';
import { generateStage } from './stageGenerator.ts';
import { setPick11 } from './testlink1_1.ts';
import type { Platform } from './types.ts';

test('a cut stone stands its whole width on the platform (stand span = width), its footing on top, sunk to 3 px into the ground; a plank spans its platform', () => {
  for (const [n, c] of Object.entries(W1_CUT)) {
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

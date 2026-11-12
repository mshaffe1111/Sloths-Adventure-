// gen2 World 1's dip pockets drawn as a soil hollow (protoArt.ts isPocket; the lead, 11-06: on Roll B the sunk boxes read as grey
// windows in the soil). Only gen2 World 1's pieces carry ownLook (w1Finish), so no other stage draws a pixel differently: planted here
// by every World 1 to 4 stage the old generator builds having no pocket at all, and Roll B's pockets being found.
import test from 'node:test';
import assert from 'node:assert/strict';
import './headlessDom.ts';
import { isPocket, POCKET_W } from './protoArt.ts';
import { paintedBank } from './w1Pits.ts';
import { generateAllLevels } from './worldsData.ts';
import { builtOnGen2, generateStage } from './stageGenerator.ts';
import { asQaBuildForTest } from './playRecorder.ts';
import { setPick11 } from './testlink1_1.ts';
import type { Platform } from './types.ts';

const pockets = (ps: Platform[]) => {
  const banks = ps.filter(paintedBank);
  return banks.filter((p) => isPocket(p, banks));
};

test("gen2 1-1 Roll B's dip pockets are found, each narrow and closed in by higher banks", () => {
  // (no x positions pinned: Roll B is a QA seed pin that moves when the proven list is rebuilt, 0.9.5's 110867 -> 15458; the pocket
  // rule itself is planted below, with and without ownLook)
  asQaBuildForTest(true);
  setPick11('B');
  try {
    const st = generateStage(generateAllLevels().find((l) => l.id === '1-1' && !l.secret)!, 'normal');
    const found = pockets(st.platforms);
    assert.ok(found.length >= 4, `${found.length} pockets`);
    for (const p of found) assert.ok(p.width < POCKET_W && p.ownLook);
  } finally {
    setPick11('play');
    asQaBuildForTest(false);
  }
});

test('no stage the old generator builds (Worlds 1 to 4) has a pocket: their ground draws exactly as before', () => {
  // (the generator's own answer to "is this stage gen2's": 1-1, and since 2026-11-12 1-3, rolled from World 1's kit)
  const levels = generateAllLevels().filter((l) => !l.secret && l.worldIndex <= 4 && !builtOnGen2(l));
  assert.ok(levels.length >= 30, `${levels.length} stages`);
  for (const l of levels) {
    const st = generateStage(l, 'normal');
    assert.equal(st.platforms.filter((p) => p.ownLook).length, 0, `${l.id}: no ownLook piece`);
    assert.equal(pockets(st.platforms).length, 0, `${l.id}: no pocket`);
  }
  // planted: the same narrow closed-in piece WITHOUT ownLook is not a pocket, with it it is
  const P = (id: number, x: number, y: number, width: number, height: number, own = false): Platform => ({ id, x, y, width, height, type: 'solid', style: 'moss_stone', ...(own ? { ownLook: true } : {}) });
  const L = P(1, 0, 1000, 500, 300), R = P(3, 594, 1000, 500, 300);
  assert.equal(isPocket(P(2, 500, 1070, 94, 120), [L, R]), false);
  assert.equal(isPocket(P(2, 500, 1070, 94, 120, true), [L, R]), true);
});

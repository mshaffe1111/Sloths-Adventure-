// The art swap's cut pieces (w1CutArt.ts): drawn with the footing line on the platform's top and a stone's foot on the ground; several
// kinds laid on gen2 1-1; a stone with nothing under its foot gets no cut piece (planted: it would hang in the air, rocks never float)
import test from 'node:test';
import assert from 'node:assert/strict';
import './headlessDom.ts';
import { W1_CUT, cutBox, pickCut } from './w1CutArt.ts';
import { w1Finish } from './gen2/worlds/w1.ts';
import { generateAllLevels } from './worldsData.ts';
import { generateStage } from './stageGenerator.ts';
import { setPick11 } from './testlink1_1.ts';
import type { Platform } from './types.ts';

test('a cut stone is drawn with its footing on the platform top and its foot 3 px into the ground; a plank spans its platform', () => {
  for (const [n, c] of Object.entries(W1_CUT)) {
    const p = c.kind === 'log' ? { x: 1000, y: 500, width: 300, height: 24 } : { x: 1000, y: 600, width: 140, height: 56 };
    const b = cutBox(p, c);
    const s = b.w / c.w;
    assert.ok(Math.abs(b.y + c.fy * s - p.y) < 0.01, `${n}: its footing at the top`);
    if (c.kind === 'log') assert.ok(Math.abs((c.fx1 - c.fx0) * s - p.width) < 0.01, `${n}: spans the platform`);
    else assert.ok(Math.abs(b.y + b.h - (p.y + p.height + 3)) < 0.01, `${n}: its foot on the ground`);
  }
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

// The secondary half of Matt's floating rule (2026-11-05): no prop or dressing piece over open air. A planted floating prop is caught.
import test from 'node:test';
import assert from 'node:assert/strict';
import '../headlessDom.ts';
import { generateAllLevels } from '../worldsData.ts';
import { generateStage, setLayoutVariant } from '../stageGenerator.ts';
import { easyStage } from '../easyMode.ts';
import { withGoals } from '../goals.ts';
import { propBreaches } from './propSupport.ts';

const build = (id: string, v: number, setting: 'normal' | 'easy') => {
  const c = generateAllLevels().find((l) => l.id === id)!;
  setLayoutVariant(v);
  const st: any = setting === 'easy' ? easyStage(withGoals(generateStage({ ...c, unlocked: true }, 'easy'))) : withGoals(generateStage({ ...c, unlocked: true }, 'normal'));
  setLayoutVariant(null);
  return st;
};

test('a planted floating prop is caught: a fern 200 px over open air, and a rock with nothing under it', () => {
  const st = build('1-1', 1, 'normal');
  const before = propBreaches(st).length;
  const list = st.proto?.mixDress ?? st.proto?.dress ?? (st.proto.dress = []);
  const P = st.platforms as Array<{ x: number; y: number; width: number }>;
  const hi = Math.min(...P.map((p) => p.y)) - 400;
  list.push({ n: 'w1Fern', x: P[0].x + 40, b: hi }, { n: 'w1Rock', x: P[0].x + 80, b: hi });
  const after = propBreaches(st);
  assert.equal(after.length, before + 2, `planted 2, found ${after.length - before}: ${JSON.stringify(after.slice(-2))}`);
});

// (the engine-built stages themselves are judged by tools/engine/stage.ts's gate, 16 layouts x 2: the mixed 1-1 and 1-5 fail it today,
// props hung past a piece's edge, the porter's report of 11-05)

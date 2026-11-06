// 1-1's clue, the bootprint (R-165.31): drawn, and seated flush in the end log's moss on every 1-1 build; nothing on a stage that
// reports no clue place; nothing drawn in its place before the picture has loaded.
import test from 'node:test';
import assert from 'node:assert/strict';
import './headlessDom.ts';
import { generateAllLevels } from './worldsData.ts';
import { generateStage, setLayoutVariant } from './stageGenerator.ts';
import { easyStage } from './easyMode.ts';
import { withGoals } from './goals.ts';
import { CLUE_H, CLUE_NAME, CLUE_W, cluePlace, drawW1Clue } from './w1NewArt.ts';

const build = (id: string, v: number, setting: 'normal' | 'easy') => {
  const c = generateAllLevels().find((l) => l.id === id)!;
  setLayoutVariant(v);
  const st: any = setting === 'easy' ? easyStage(withGoals(generateStage({ ...c, unlocked: true }, 'easy'))) : withGoals(generateStage({ ...c, unlocked: true }, 'normal'));
  setLayoutVariant(null);
  return st;
};

test('the bootprint lies flush on the end log on every 1-1 build: its top on the log\'s top line, all of it on the log', () => {
  for (const setting of ['normal', 'easy'] as const) for (let v = 1; v <= 16; v++) {
    const st = build('1-1', v, setting);
    const clue = (st.proto?.mixDress ?? []).filter((d: any) => d.n === CLUE_NAME);
    assert.equal(clue.length, 1, `1-1 ${setting} ${v}: ${clue.length} clue places`);
    const r = cluePlace(clue[0].x, clue[0].b);
    const log = st.platforms.find((p: any) => !p.broken && Math.abs(p.y - r.y) < 1 && p.x <= r.x && p.x + p.width >= r.x + r.w);
    assert.ok(log, `1-1 ${setting} ${v}: the decal at x ${Math.round(r.x)}-${Math.round(r.x + r.w)}, top ${r.y}, is not on one piece's top`);
    assert.ok(log.width >= 400, `1-1 ${setting} ${v}: it lies on a ${log.width} px piece, not the end log`);
  }
  for (const id of ['1-2', '1-5', '2-1']) assert.ok(!(build(id, 1, 'normal').proto?.mixDress ?? []).some((d: any) => d.n === CLUE_NAME), `${id} lays a clue`);
});

test('drawW1Clue draws the picture once it has loaded (CLUE_W x CLUE_H at its place), and nothing before', async () => {
  const drawn: number[][] = [];
  const ctx = { drawImage: (_i: unknown, x: number, y: number, w: number, h: number) => drawn.push([x, y, w, h]) } as unknown as CanvasRenderingContext2D;
  const G = globalThis as { Image?: unknown };
  const had = G.Image;
  class StubImage { onload: (() => void) | null = null; onerror: (() => void) | null = null; set src(_u: string) { queueMicrotask(() => this.onload?.()); } }
  G.Image = StubImage;
  try {
    assert.equal(drawW1Clue(ctx, 1000, 580), false, 'nothing drawn before the picture loads');
    await new Promise((r) => setTimeout(r, 10));
    assert.equal(drawW1Clue(ctx, 1000, 580), true);
    assert.deepEqual(drawn, [[1000 - CLUE_W / 2, 580, CLUE_W, CLUE_H]]);
  } finally { G.Image = had; }
});

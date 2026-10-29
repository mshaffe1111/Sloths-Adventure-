/**
 * Test helpers for World 8's gen2 stages (w8Game.test.ts, and the raw rolls while authoring): the checks every World 8 roll is held to.
 */
import assert from 'node:assert/strict';
import { validateStage } from '../levelCheck.ts';
import { walkSpeed, MODEL_TYPICAL } from '../stageTime.ts';
import type { GeneratedStage } from '../stageGenerator.ts';
import { FLAG_SPAN } from './pipeline.ts';
import type { Gen2Stage } from './types.ts';
import { W8_LESSON, W8_TIPS } from './worlds/w8.ts';
import { W8_REQUIRED } from './worlds/w8Game.ts';
import { pickRoute } from '../../../tools/inspect/eraRoll.ts';

export type Played = GeneratedStage & { gen2?: Gen2Stage['gen2']; proto?: Gen2Stage['proto'] };

/** where Dot says a line (its first time in the stage), or nothing */
const said = (st: Played, text: string) => (st.proto?.hints ?? []).filter((h) => h.text === text).map((h) => h.x);

/** the checks every World 8 roll is held to (also run on raw rolls while authoring: see the report) */
export function checkW8Roll(st: Played, at: string, id: string): void {
  for (const r of W8_REQUIRED[id] ?? []) assert.equal(st.gen2!.sections.filter((s) => s.template === r.section).length, 1, `${at}: ${r.section} once`);
  assert.deepEqual(validateStage(st).errors, [], at);
  // (the dark: every roll has it; Dot's line before the first dark stretch, in 8-1 where it is taught)
  const darks = (st.zones ?? []).filter((z) => z.kind === 'dark').sort((a, b) => a.x0 - b.x0);
  assert.ok(darks.length, `${at}: no dark`);
  if (id === '8-1') {
    const lit = darks.find((z) => z.lights?.length);
    const tip = said(st, W8_TIPS[W8_LESSON.dark]);
    assert.ok(tip.length === 1 && lit && tip[0] < lit.x0, `${at}: the dark is not taught before ${lit?.x0}`);
  }
  // (no water in World 8; a fall from a lit bough costs a life on Normal, never on Easy, and Dot warns before the first)
  assert.equal(st.waterY, undefined, `${at}: water`);
  const drops = (st.gen2!.falls ?? []).filter((f) => f.kind === 'void').sort((a, b) => a.x0 - b.x0);
  if (st.gen2!.budget.difficulty === 'easy') assert.equal(drops.length, 0, `${at}: a deadly fall on Easy`);
  if (drops.length) {
    const tip = said(st, W8_TIPS[W8_LESSON.drop]);
    assert.ok(tip.length === 1 && tip[0] < drops[0].x0, `${at}: the deadly drop at ${drops[0].x0} is not warned first`);
  }
  // (every fall inside a dark stretch is soft: never a blind jump)
  for (const f of st.gen2!.falls ?? []) if (darks.some((z) => f.x0 >= z.x0 && f.x1 <= z.x1)) assert.equal(f.kind, 'soft', `${at}: a deadly fall in the dark at ${f.x0}`);
  const R = pickRoute(st.config.objectiveType, st as never);
  assert.notEqual(R.used.route.traced, 'failed', at);
  assert.ok(R.quick.time >= 120, `${at}: ${R.quick.time.toFixed(0)} s for the quick player`);
  const swings = R.used.route.segs.filter((s) => s.kind === 'swing');
  for (const v of st.vines.filter((x) => x.vineType === 'swing_liana')) {
    assert.ok(swings.some((s) => Math.min(s.x0, s.x1) <= v.x + 40 && Math.max(s.x0, s.x1) >= v.x - 40), `${at}: the liana at ${v.x} is never swung`);
  }
  const ws = walkSpeed(MODEL_TYPICAL);
  const open = st.spawnX + 5 * ws - 60;
  for (const e of st.enemies) assert.ok(e.patrolMinX > open, `${at}: a ${e.type} ${e.patrolMinX - st.spawnX} px in`);
  assert.ok(!st.platforms.some((p) => p.type === 'fragile'), `${at}: nothing crumbles`);
  // (the night harpy: taught in 8-8 before the first one; 8-9 takes it as known)
  const harpies = st.enemies.filter((e) => e.type === 'harpy').map((e) => e.patrolMinX);
  if (id === '8-8' && harpies.length) {
    const tip = said(st, W8_TIPS[W8_LESSON.harpy]);
    assert.ok(tip.length === 1 && tip[0] < Math.min(...harpies) - 300, `${at}: the harpy is not taught before ${Math.min(...harpies)}`);
  }
  if (!['8-8', '8-9'].includes(id)) assert.equal(harpies.length, 0, `${at}: a harpy outside the Monarch's hunt`);
  // (the shut shrine, the roosts and the glides: Dot's line before the first)
  const gate = { '8-8': W8_LESSON.hunt, '8-9': W8_LESSON.fight } as Record<string, string>;
  if (gate[id]) assert.equal(said(st, W8_TIPS[gate[id]]).length, 1, `${at}: the shut shrine is not explained`);
  if (id === '8-4') {
    const roost = Math.min(...(st.proto?.watch ?? []).map((z) => z.x0));
    const tip = said(st, W8_TIPS[W8_LESSON.roost]);
    assert.ok(tip.length === 1 && tip[0] < roost, `${at}: the roosts are not taught before ${roost}`);
  }
  if (id === '8-6') {
    const glides = st.gen2!.sections.filter((s) => s.template.startsWith('w8-glide-')).map((s) => s.x0);
    const tip = said(st, W8_TIPS[W8_LESSON.glide]);
    assert.ok(tip.length === 1 && tip[0] < Math.min(...glides) + 400, `${at}: the glide is not taught first`);
  }
  for (const v of st.vines.filter((x) => x.vineType !== 'swing_liana')) assert.equal(v.vineType, 'tree_climb', `${at}: a vine at ${v.x} that is neither a liana nor a climb`);
  const xs = [st.spawnX, ...(st.checkpoints ?? []).map((c) => c.x).sort((a, b) => a - b), st.exitTotemX];
  for (let k = 1; k < xs.length; k++) assert.ok(xs[k] - xs[k - 1] <= FLAG_SPAN.max, `${at}: ${xs[k] - xs[k - 1]} px with no flag`);
}


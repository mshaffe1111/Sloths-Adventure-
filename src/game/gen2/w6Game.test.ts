/**
 * World 6 as the game plays it (DESIGN.md B10 piece G, gen2/game.ts, worlds/w6Game.ts): every shipped roll of 6-1 to 6-7 and 6-9,
 * Normal and Easy, built through the game's own entry (generateStage, withGoals, easyStage). Each roll holds its stage's room (6-3, 6-6,
 * 6-7); the inspector's quick route swings every liana; nothing can hurt in the opening seconds; every new animal and every hazard is
 * taught before it (Dot's line); a crumbling piece is never on the way; each vine climbs straight up and down (a climbing vine is a
 * trunk, never a swing); every flag is at most FLAG_SPAN.max px from the last; the stage takes 2:00 or more for the inspector's quick player.
 */
import '../headlessDom.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import { generateStage, setLayoutVariant, type GeneratedStage } from '../stageGenerator.ts';
import { easyStage } from '../easyMode.ts';
import { withGoals } from '../goals.ts';
import { validateStage } from '../levelCheck.ts';
import { walkSpeed, MODEL_TYPICAL } from '../stageTime.ts';
import { generateAllLevels } from '../worldsData.ts';
import type { LevelConfig } from '../types.ts';
import { GEN2_STAGES } from './game.ts';
import { FLAG_SPAN } from './pipeline.ts';
import { GEN2_SEEDS } from './seeds.ts';
import type { Gen2Stage } from './types.ts';
import { W6_TIPS } from './worlds/w6.ts';
import { W6_REQUIRED } from './worlds/w6Game.ts';
import { pickRoute } from '../../../tools/inspect/eraRoll.ts';

const levels = generateAllLevels();
const lv = (id: string): LevelConfig => ({ ...levels.find((l) => l.id === id)!, unlocked: true });
type Played = GeneratedStage & { gen2?: Gen2Stage['gen2']; proto?: Gen2Stage['proto'] };
const STAGES = Object.keys(GEN2_STAGES).filter((id) => id.startsWith('6-'));

function played(id: string, variant: number, easy: boolean): Played {
  setLayoutVariant(variant);
  try {
    const st = withGoals(generateStage(lv(id), easy ? 'easy' : 'normal'));
    return (easy ? easyStage(st) : st) as Played;
  } finally {
    setLayoutVariant(null);
  }
}

const cache = new Map<string, Played>();
const each = (f: (st: Played, at: string, id: string, easy: boolean) => void) => {
  for (const id of STAGES) {
    for (let i = 0; i < (GEN2_SEEDS[id]?.seeds.length ?? 0); i++) {
      for (const easy of [false, true]) {
        const k = `${id}:${i}:${easy}`;
        if (!cache.has(k)) cache.set(k, played(id, i, easy));
        f(cache.get(k)!, `${id} roll ${i} (${easy ? 'Easy' : 'Normal'})`, id, easy);
      }
    }
  }
};

test('World 6 ships 16 rolls of each stage, curated on the kit the game builds with', () => {
  assert.deepEqual(STAGES.sort(), ['6-1', '6-2', '6-3', '6-4', '6-5', '6-6', '6-7', '6-9']);
  for (const id of STAGES) {
    assert.equal(GEN2_SEEDS[id]?.seeds.length, 16, id);
    assert.equal(GEN2_SEEDS[id].kit, GEN2_STAGES[id].kitName, id);
  }
});

test('every shipped roll: its room, every liana swung by the quick route, 2:00 or more, the check clean', () => {
  each((st, at, id) => {
    for (const r of W6_REQUIRED[id] ?? []) assert.equal(st.gen2!.sections.filter((s) => s.template === r.section).length, 1, `${at}: ${r.section} once`);
    assert.deepEqual(validateStage(st).errors, [], at);
    const R = pickRoute(st.config.objectiveType, st as never);
    assert.notEqual(R.used.route.traced, 'failed', at);
    assert.ok(R.quick.time >= 120, `${at}: ${R.quick.time.toFixed(0)} s for the quick player`);
    const swings = R.used.route.segs.filter((s) => s.kind === 'swing');
    for (const v of st.vines.filter((x) => x.vineType === 'swing_liana')) {
      assert.ok(swings.some((s) => Math.min(s.x0, s.x1) <= v.x + 40 && Math.max(s.x0, s.x1) >= v.x - 40), `${at}: the liana at ${v.x} is never swung`);
    }
  });
});

test('every shipped roll: nothing hurts in the first 5 s, every new animal and hazard is taught first, nothing crumbles, flags close enough', () => {
  const ws = walkSpeed(MODEL_TYPICAL);
  each((st, at) => {
    const open = st.spawnX + 5 * ws - 60;
    for (const e of st.enemies) assert.ok(e.patrolMinX > open, `${at}: a ${e.type} ${e.patrolMinX - st.spawnX} px in`);
    for (const z of st.zones ?? []) if (z.kind !== 'dark') assert.ok(z.x0 > st.spawnX + 300, `${at}: a ${z.kind} at the start`);
    assert.ok(!st.platforms.some((p) => p.type === 'fragile'), `${at}: nothing crumbles`);
    // (a new animal: Dot's line before the first of its kind, w6Finish)
    const hints = st.proto?.hints ?? [];
    for (const kind of ['caiman', 'frog', 'tayra', 'harpy']) {
      const xs = st.enemies.filter((e) => e.type === kind).map((e) => e.patrolMinX);
      if (!xs.length) continue;
      const said = hints.filter((h) => h.text === W6_TIPS[kind]).map((h) => h.x);
      assert.ok(said.length === 1 && said[0] < Math.min(...xs) - 300, `${at}: the ${kind} is not taught before ${Math.min(...xs)}`);
    }
    // (water: Dot's water line before the first creek)
    const creek = (st.gen2!.falls ?? []).filter((f) => f.kind === 'water').sort((a, b) => a.x0 - b.x0)[0];
    if (creek) assert.ok(hints.some((h) => h.x < creek.x0 && /water/i.test(h.text)), `${at}: no warning before the creek at ${creek.x0}`);
    // (a climbing vine is the engine's trunk climb: up and down climb, it never swings)
    for (const v of st.vines.filter((x) => x.vineType !== 'swing_liana')) assert.equal(v.vineType, 'tree_climb', `${at}: a vine at ${v.x} that is neither a liana nor a climb`);
    const xs = [st.spawnX, ...(st.checkpoints ?? []).map((c) => c.x).sort((a, b) => a - b), st.exitTotemX];
    for (let k = 1; k < xs.length; k++) assert.ok(xs[k] - xs[k - 1] <= FLAG_SPAN.max, `${at}: ${xs[k] - xs[k - 1]} px with no flag`);
  });
});

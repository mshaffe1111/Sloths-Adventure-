/**
 * World 10 as the game plays it (DESIGN.md B10 piece G, gen2/game.ts, worlds/w10Game.ts): every shipped roll of 10-1, 10-3, 10-6, 10-7
 * and 10-9, Normal and Easy, built through the game's own entry (generateStage, withGoals, easyStage). Each roll holds its stage's
 * must-haves (10-1's lessons, the rooms); the inspector's quick route swings every liana; nothing can hurt in the opening seconds; every
 * hazard and the first soldier are taught first in Pokey's own line; the crumbling ramparts are never on the way; every flag is at most
 * FLAG_SPAN.max px from the last; the stage takes 2:00 or more for the inspector's quick player; Easy's falls are all soft.
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
import { W10_LESSON, W10_TIPS } from './worlds/w10.ts';
import { W10_GAME_STAGES, W10_REQUIRED } from './worlds/w10Game.ts';
import { pickRoute } from '../../../tools/inspect/eraRoll.ts';

const levels = generateAllLevels();
const lv = (id: string): LevelConfig => ({ ...levels.find((l) => l.id === id)!, unlocked: true });
type Played = GeneratedStage & { gen2?: Gen2Stage['gen2']; proto?: Gen2Stage['proto'] };
const STAGES = Object.keys(GEN2_STAGES).filter((id) => id.startsWith('10-'));

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

test('World 10 ships 16 rolls of each gen2 stage, curated on the kit the game builds with', () => {
  assert.deepEqual(STAGES.sort(), [...W10_GAME_STAGES].sort());
  for (const id of STAGES) {
    assert.equal(GEN2_SEEDS[id]?.seeds.length, 16, id);
    assert.equal(GEN2_SEEDS[id].kit, GEN2_STAGES[id].kitName, id);
  }
});

test('every shipped roll: its must-haves, every liana swung by the quick route, 2:00 or more, the check clean', () => {
  each((st, at, id) => {
    for (const r of W10_REQUIRED[id] ?? []) assert.equal(st.gen2!.sections.filter((s) => s.template === r.section).length, 1, `${at}: ${r.section} once`);
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

test('every shipped roll: nothing hurts in the first 5 s, each hazard and the first soldier are taught first, Easy falls soft, flags close enough', () => {
  const ws = walkSpeed(MODEL_TYPICAL);
  each((st, at, _id, easy) => {
    const open = st.spawnX + 5 * ws - 60;
    for (const e of st.enemies) assert.ok(e.patrolMinX > open, `${at}: a ${e.type} ${e.patrolMinX - st.spawnX} px in`);
    for (const z of st.zones ?? []) assert.ok(z.x0 > open, `${at}: a ${z.kind} at the start`);
    const hints = st.proto?.hints ?? [];
    const first = (kind: string) => Math.min(...(st.zones ?? []).filter((z) => z.kind === kind).map((z) => z.x0));
    // (the rods and the spike beds were taught in 10-1: there, the line comes before the first of each)
    if (st.config.id === '10-1') {
      for (const [kind, line] of [['bolt', W10_TIPS[W10_LESSON.bolt]], ['spikes', W10_TIPS[W10_LESSON.spikes]]] as const) {
        const x = first(kind);
        if (Number.isFinite(x)) assert.ok(hints.some((h) => h.text === line && h.x < x), `${at}: the ${kind} line before ${x}`);
      }
    }
    const soldiers = st.enemies.filter((e) => e.look === 'soldier').map((e) => e.patrolMinX);
    if (soldiers.length) assert.ok(hints.some((h) => h.text === W10_TIPS[W10_LESSON.soldier] && h.x < Math.min(...soldiers) - 300), `${at}: the first soldier untaught`);
    // (a crumbling rampart slab is never on the way: the level check passes without them, pipeline checkStage)
    const bare = validateStage({ ...st, platforms: st.platforms.filter((p) => p.type !== 'fragile') });
    assert.deepEqual(bare.errors.filter((e) => !/^(flower|leaf|heart) #/.test(e)), [], `${at}: a rampart slab is needed`);
    if (easy) assert.ok((st.gen2!.falls ?? []).every((f) => f.kind === 'soft'), `${at}: a deadly fall on Easy`);
    for (const v of st.vines.filter((x) => x.vineType !== 'swing_liana')) assert.equal(v.vineType, 'tree_climb', `${at}: a vine at ${v.x} that is neither a liana nor a climb`);
    const xs = [st.spawnX, ...(st.checkpoints ?? []).map((c) => c.x).sort((a, b) => a - b), st.exitTotemX];
    for (let k = 1; k < xs.length; k++) assert.ok(xs[k] - xs[k - 1] <= FLAG_SPAN.max, `${at}: ${xs[k] - xs[k - 1]} px with no flag`);
  });
});

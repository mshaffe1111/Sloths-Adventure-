/**
 * World 9 as the game plays it (DESIGN.md B10 piece G, gen2/game.ts, worlds/w9Game.ts): every shipped roll of 9-1, 9-3 to 9-6, 9-8 and
 * 9-9, Normal and Easy, built through the game's own entry (generateStage, withGoals, easyStage). 9-1 holds its first geyser (the
 * lesson) on every roll; the check is clean and the inspector's quick player takes 2:00 or more; nothing can hurt in the opening
 * seconds; the geysers are taught before the first one (9-1) and the lava named before the first deadly chasm (Normal); a fall is the
 * lava only on Normal (Easy's are all soft) and never at a second-jump, glide or start gap; the cracked basalt is never needed (the
 * pipeline's checkStage) and is drawn as the kit's slabs; a climbing vine stands clear of a ledge's face; flags are close enough.
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
import { W9_LESSON, W9_TIPS } from './worlds/w9.ts';
import { W9_GAME_STAGES, W9_REQUIRED } from './worlds/w9Game.ts';
import { pickRoute } from '../../../tools/inspect/eraRoll.ts';

const levels = generateAllLevels();
const lv = (id: string): LevelConfig => ({ ...levels.find((l) => l.id === id)!, unlocked: true });
type Played = GeneratedStage & { gen2?: Gen2Stage['gen2']; proto?: Gen2Stage['proto'] };
const STAGES = Object.keys(GEN2_STAGES).filter((id) => id.startsWith('9-'));

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

test('World 9 ships 16 rolls of each gen2 stage, curated on the kit the game builds with (9-2 and 9-7, the ascents, are hand-built)', () => {
  assert.deepEqual([...STAGES].sort(), [...W9_GAME_STAGES]);
  for (const id of STAGES) {
    assert.equal(GEN2_SEEDS[id]?.seeds.length, 16, id);
    assert.equal(GEN2_SEEDS[id].kit, GEN2_STAGES[id].kitName, id);
  }
});

test('every shipped roll: its must-haves, the check clean, 2:00 or more for the quick player, every liana swung', () => {
  each((st, at, id) => {
    for (const r of W9_REQUIRED[id] ?? []) assert.equal(st.gen2!.sections.filter((s) => s.template === r.section).length, 1, `${at}: ${r.section} once`);
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

test('every shipped roll: nothing hurts in the first 5 s, the geysers and the lava are named first, the falls follow the world\'s rule', () => {
  const ws = walkSpeed(MODEL_TYPICAL);
  each((st, at, id, easy) => {
    const open = st.spawnX + 5 * ws - 60;
    for (const e of st.enemies) assert.ok(e.patrolMinX > open, `${at}: a ${e.type} ${e.patrolMinX - st.spawnX} px in`);
    for (const z of st.zones ?? []) if (z.kind === 'geyser') assert.ok(z.x0 > open, `${at}: a geyser ${z.x0 - st.spawnX} px in`);
    const hints = st.proto?.hints ?? [];
    // (9-1 teaches the geysers: Dot's line before the first one, and its quiet spell is the lesson's long one)
    const geysers = (st.zones ?? []).filter((z) => z.kind === 'geyser').sort((a, b) => a.x0 - b.x0);
    if (id === '9-1') {
      const [x] = hints.filter((h) => h.text === W9_TIPS[W9_LESSON.geyser]).map((h) => h.x);
      assert.ok(x !== undefined && x < geysers[0].x0, `${at}: the geysers are not named before the first at ${geysers[0]?.x0}`);
      assert.ok(geysers[0].period - geysers[0].warn - geysers[0].active >= 3.9, `${at}: the first geyser's quiet spell is the lesson's`);
    }
    // (the lava: deadly only on Normal, named before the first deadly chasm; never under a second-jump, glide or start gap)
    const falls = st.gen2!.falls ?? [];
    if (easy) assert.ok(falls.every((f) => f.kind === 'soft'), `${at}: Easy's falls are all soft`);
    const lava = falls.filter((f) => f.kind === 'void').sort((a, b) => a.x0 - b.x0);
    if (lava.length) {
      assert.ok(hints.some((h) => h.text === W9_TIPS.water && h.x < lava[0].x0), `${at}: the lava is not named before the first chasm at ${lava[0].x0}`);
      assert.ok(st.waterY !== undefined, `${at}: deadly chasms with no lava line`);
    }
    assert.ok(!(st.proto?.gen2 as { waterWarnings?: unknown[] } | undefined)?.waterWarnings?.length, `${at}: a wave sign at the lava`);
    // (the cracked basalt: the kit's slabs)
    for (const p of st.platforms.filter((q) => q.crumbleAfter !== undefined)) assert.equal(p.art, 'basalt', `${at}: a crumbling tile at ${p.x} not drawn as basalt`);
    // (a climbing vine stands clear of a ledge's face: World 8's lesson)
    for (const v of st.vines.filter((x) => x.vineType === 'tree_climb')) {
      assert.ok(!st.platforms.some((p) => p.type === 'solid' && Math.abs(p.y - v.topY) <= 2 && (Math.abs(p.x - v.x) <= 2 || Math.abs(p.x + p.width - v.x) <= 2)), `${at}: the vine at ${v.x} stands on a face`);
    }
    const xs = [st.spawnX, ...(st.checkpoints ?? []).map((c) => c.x).sort((a, b) => a - b), st.exitTotemX];
    for (let k = 1; k < xs.length; k++) assert.ok(xs[k] - xs[k - 1] <= FLAG_SPAN.max, `${at}: ${xs[k] - xs[k - 1]} px with no flag`);
  });
});

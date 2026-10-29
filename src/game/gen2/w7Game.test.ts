/**
 * World 7 as the game plays it (DESIGN.md B10 piece G, gen2/game.ts, worlds/w7Game.ts): every shipped roll of 7-1, 7-3, 7-5, 7-6, 7-7
 * and 7-9, Normal and Easy, built through the game's own entry (generateStage, withGoals, easyStage). Each roll holds its required
 * sections (7-1's first tiles, 7-3's and 7-7's rooms); the check passes, and passes without the crumbling tiles (never needed); 2:00 or
 * more for the inspector's quick player; nothing hurts in the first 5 s; the tiles are taught (Pokey's line) before the first one in
 * 7-1; every line is Pokey's (no Dot in World 7); every brown vine is climbed and every liana swung by the quick route; flags at most
 * FLAG_SPAN.max apart; no animal by a jump.
 */
import '../headlessDom.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import { generateStage, setLayoutVariant, type GeneratedStage } from '../stageGenerator.ts';
import { easyStage } from '../easyMode.ts';
import { withGoals } from '../goals.ts';
import { validateStage } from '../levelCheck.ts';
import { measureStage } from '../stageMetrics.ts';
import { walkSpeed, MODEL_TYPICAL } from '../stageTime.ts';
import { generateAllLevels } from '../worldsData.ts';
import type { LevelConfig } from '../types.ts';
import { GEN2_STAGES } from './game.ts';
import { FLAG_SPAN } from './pipeline.ts';
import { GEN2_SEEDS } from './seeds.ts';
import type { Gen2Stage } from './types.ts';
import { W7_TIPS } from './worlds/w7.ts';
import { W7_REQUIRED } from './worlds/w7Game.ts';
import { W7R_NEW_LINES } from './worlds/w7Rooms.ts';
import { pickRoute } from '../../../tools/inspect/eraRoll.ts';

const levels = generateAllLevels();
const lv = (id: string): LevelConfig => ({ ...levels.find((l) => l.id === id)!, unlocked: true });
type Played = GeneratedStage & { gen2?: Gen2Stage['gen2']; proto?: Gen2Stage['proto'] };
const STAGES = Object.keys(GEN2_STAGES).filter((id) => id.startsWith('7-'));

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

test('World 7 ships 16 rolls of each gen2 stage, curated on the kit the game builds with', () => {
  assert.deepEqual(STAGES.sort(), ['7-1', '7-3', '7-5', '7-6', '7-7', '7-9']);
  for (const id of STAGES) {
    assert.equal(GEN2_SEEDS[id]?.seeds.length, 16, id);
    assert.equal(GEN2_SEEDS[id].kit, GEN2_STAGES[id].kitName, id);
  }
});

test('every shipped roll: its required sections once, the check clean with and without the tiles, 2:00 or more, no animal by a jump', () => {
  each((st, at, id) => {
    for (const r of W7_REQUIRED[id] ?? []) assert.equal(st.gen2!.sections.filter((s) => s.template === r.section).length, 1, `${at}: ${r.section} once`);
    assert.deepEqual(validateStage(st).errors, [], at);
    const bare = { ...st, platforms: st.platforms.filter((p) => p.type !== 'fragile') };
    assert.deepEqual(validateStage(bare).errors.filter((e) => !/^(flower|leaf|heart) #/.test(e)), [], `${at}: without the tiles`);
    const R = pickRoute(st.config.objectiveType, st as never);
    assert.notEqual(R.used.route.traced, 'failed', at);
    assert.ok(R.quick.time >= 120, `${at}: ${R.quick.time.toFixed(0)} s for the quick player`);
    const q = measureStage(st as never);
    assert.equal(q.takeoffsNearEnemy + q.landingsNearEnemy, 0, `${at}: an animal by a jump`);
  });
});

test("every shipped roll: nothing hurts in the first 5 s, the tiles taught first, every line Pokey's, vines climb, flags close enough", () => {
  const ws = walkSpeed(MODEL_TYPICAL);
  const lines = new Set([...Object.values(W7_TIPS), ...W7R_NEW_LINES]);
  each((st, at, id) => {
    const open = st.spawnX + 5 * ws - 60;
    for (const e of st.enemies) assert.ok(e.patrolMinX > open, `${at}: a ${e.type} ${e.patrolMinX - st.spawnX} px in`);
    for (const z of st.zones ?? []) assert.ok(z.x0 > st.spawnX + 300, `${at}: a ${z.kind} at the start`);
    const hints = st.proto?.hints ?? [];
    // (Dot is gone in World 7: every stage line is Pokey's own, and the room lines too)
    for (const h of hints) assert.ok(lines.has(h.text), `${at}: "${h.text}"`);
    for (const r of st.kit?.rooms ?? []) for (const t of Object.values(r.tips ?? {})) assert.ok(lines.has(t as string), `${at}: room line "${t}"`);
    if (id === '7-1') {
      const first = Math.min(...st.platforms.filter((p) => p.type === 'fragile').map((p) => p.x));
      assert.ok(hints.some((h) => h.text === W7_TIPS.crumble && h.x < first - 150), `${at}: the tiles are not taught before ${first}`);
    }
    const creek = (st.gen2!.falls ?? []).filter((f) => f.kind === 'water').sort((a, b) => a.x0 - b.x0)[0];
    if (creek) assert.ok(hints.some((h) => h.x < creek.x0 && h.text === W7_TIPS.water), `${at}: no warning before the drain at ${creek.x0}`);
    // (a brown vine is the engine's trunk climb, straight up and down; a liana (the halls, w7Swing.ts) swings by itself; each one is
    // needed: the quick route climbs every vine and swings every liana)
    const segs = pickRoute(st.config.objectiveType, st as never).used.route.segs;
    for (const v of st.vines) {
      assert.ok(v.vineType === 'tree_climb' || v.vineType === 'swing_liana', `${at}: a vine at ${v.x} that is neither a climb nor a liana`);
      const kind = v.vineType === 'swing_liana' ? 'swing' : 'climb';
      assert.ok(segs.some((g) => g.kind === kind && Math.min(g.x0, g.x1) <= v.x + 40 && Math.max(g.x0, g.x1) >= v.x - 40), `${at}: the ${kind} at ${v.x} is walked past`);
    }
    const xs = [st.spawnX, ...(st.checkpoints ?? []).map((c) => c.x).sort((a, b) => a - b), st.exitTotemX];
    for (let k = 1; k < xs.length; k++) assert.ok(xs[k] - xs[k - 1] <= FLAG_SPAN.max, `${at}: ${xs[k] - xs[k - 1]} px with no flag`);
  });
});

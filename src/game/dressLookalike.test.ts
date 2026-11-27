/**
 * Decor never looks like a danger (R-165.542, ENG-DECOR; the lead's ruling on BUILD-29-k's stills: 2-9's and 2-5's snappers ARE turtles,
 * and World 2's shared clutter look ['w2ReedBundle', 'w2Turtle', 'w2KingfisherPost'] stood a harmless painted turtle beside them).
 * artDress.ts HAZARD_LOOKALIKE names the foe family each lookalike piece shows; protoStage.ts addDress swaps (or leaves out) every piece
 * whose family is in the stage's own cast. The invariant, on every listed seed of every listed stage and on every other stage's first
 * 16 layouts, both settings, in every world whose dressing sets can roll a lookalike (read from DRESS_SETS, so a new row widens it):
 * no dress piece shares a family with a foe on its stage. A stage without that foe keeps the piece.
 *   npx tsx --test src/game/dressLookalike.test.ts
 */
import './headlessDom.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import { clearLookalikes, DRESS_SETS, HAZARD_LOOKALIKE, type DressWorld } from './artDress.ts';
import { generateStage, setLayoutVariant } from './stageGenerator.ts';
import { loadSeedList, provenSeeds } from './gen2/seedList.ts';
import { PROVEN_INDEX } from './gen2/provenIndex.ts';
import { generateAllLevels } from './worldsData.ts';
import type { AnyDress } from './dressArt.ts';
import type { LevelConfig } from './types.ts';

const levels = generateAllLevels().filter((l) => !l.secret);
/** the worlds whose dressing sets can roll a lookalike piece (read from the data: today World 2's turtle); only their stages can breach */
const LOOKALIKE_WORLDS = new Set(Object.entries(DRESS_SETS).filter(([, j]) => [...j.bank, ...j.hang, ...j.clutter].flat().some((n) => n in HAZARD_LOOKALIKE)).map(([w]) => Number(w) as DressWorld));
/** the test's own copy of the families, so a plant that empties the table cannot blind the judge */
const FAMILY: Record<string, string> = Object.fromEntries(Object.entries(HAZARD_LOOKALIKE).map(([n, v]) => [n, v!.family]));
/** the other stages' layouts (the lock gate's 16) */
const LAYOUTS = 16;

type Built = { enemies: { type: string }[]; dress?: { n: AnyDress; x: number }[]; proto?: { dress?: { n: AnyDress; x: number }[] } };
const build = (cfg: LevelConfig, n: number, d: 'normal' | 'easy'): Built => {
  setLayoutVariant(n);
  try { return generateStage(cfg, d) as unknown as Built; } finally { setLayoutVariant(null); }
};
/** every dress piece on the stage that shows one of its own foes */
const lookalikes = (st: Built): string[] => {
  const foes = new Set(st.enemies.map((e) => e.type));
  return [...(st.proto?.dress ?? []), ...(st.dress ?? [])].filter((d) => FAMILY[d.n] && foes.has(FAMILY[d.n])).map((d) => `${d.n} (a ${FAMILY[d.n]}) at x ${Math.round(d.x)}`);
};
/** every stage and layout number the invariant covers: each listed stage's every listed seed (layout i draws list seed i), the rest 1-16 */
async function plays(): Promise<{ cfg: LevelConfig; n: number; label: string }[]> {
  const out: { cfg: LevelConfig; n: number; label: string }[] = [];
  for (const cfg of levels.filter((l) => LOOKALIKE_WORLDS.has(l.worldIndex as DressWorld))) {
    if (PROVEN_INDEX[cfg.id]) {
      assert.ok(await loadSeedList(cfg.id), `${cfg.id}: its list loads`);
      provenSeeds(cfg.id).forEach((s, i) => out.push({ cfg, n: i, label: `${cfg.id} listed seed ${s}` }));
    } else for (let n = 1; n <= LAYOUTS; n++) out.push({ cfg, n, label: `${cfg.id} layout ${n}` });
  }
  return out;
}

test('clearLookalikes: a lookalike of a foe on the stage is swapped (or left out with no swap); a stage without that foe keeps it', () => {
  const ds = [{ n: 'w2Turtle' as AnyDress, x: 100, b: 500 }, { n: 'w2ReedBundle' as AnyDress, x: 200, b: 500 }];
  assert.deepEqual(clearLookalikes(ds, new Set(['turtle'])).map((d) => [d.n, d.x, d.b]), [['w2Frog', 100, 500], ['w2ReedBundle', 200, 500]]);
  assert.deepEqual(clearLookalikes(ds, new Set(['snake'])), ds, 'no snapper: the turtle stays');
  const saved = HAZARD_LOOKALIKE.w2Frog;
  // (a swap that is itself a lookalike on the stage is not used: the piece is left out)
  HAZARD_LOOKALIKE.w2Frog = { family: 'frog' };
  try {
    assert.deepEqual(clearLookalikes(ds, new Set(['turtle', 'frog'])).map((d) => d.n), ['w2ReedBundle']);
  } finally {
    if (saved) HAZARD_LOOKALIKE.w2Frog = saved; else delete HAZARD_LOOKALIKE.w2Frog;
  }
});

test('PLANT: with the turtle row taken out of HAZARD_LOOKALIKE, 2-5 and 2-9 show a painted turtle beside their snappers (the judge sees it)', async () => {
  const row = HAZARD_LOOKALIKE.w2Turtle;
  delete HAZARD_LOOKALIKE.w2Turtle;
  try {
    for (const id of ['2-5', '2-9']) {
      const cfg = levels.find((l) => l.id === id)!;
      if (PROVEN_INDEX[id]) await loadSeedList(id);
      const hit = Array.from({ length: LAYOUTS }, (_, n) => lookalikes(build(cfg, n, 'normal'))).flat();
      assert.ok(hit.some((h) => h.startsWith('w2Turtle')), `${id}: the plant shows a turtle by the snappers on some layout`);
    }
  } finally {
    HAZARD_LOOKALIKE.w2Turtle = row;
  }
});

test('no dress piece shares a family with a foe on its stage: every listed seed of every listed stage, every other stage 1-16, both settings', { timeout: 15 * 60_000 }, async () => {
  assert.ok(LOOKALIKE_WORLDS.has(2), "World 2's dressing rolls the turtle");
  const bad: string[] = [];
  let kept = 0;
  for (const p of await plays()) {
    for (const d of ['normal', 'easy'] as const) {
      const st = build(p.cfg, p.n, d);
      for (const h of lookalikes(st)) bad.push(`${p.label} (${d}): ${h}`);
      const foes = new Set(st.enemies.map((e) => e.type));
      kept += [...(st.proto?.dress ?? []), ...(st.dress ?? [])].filter((x) => FAMILY[x.n] && !foes.has(FAMILY[x.n])).length;
    }
  }
  assert.deepEqual(bad.slice(0, 20), [], `${bad.length} lookalikes`);
  // (the rule is the stage's own cast, not a ban: a stage without snappers still shows the turtle)
  assert.ok(kept > 0, 'a stage without the foe keeps its lookalike piece');
});

/**
 * A page's root toy (tools/engine/rootshoot.mjs; ENG-ROOT item 2, the stills): loaded before the game's entry, it lists World 3's root row
 * (gen2/toyRoot.ts, the toy rootBots.test.ts plays) under the slot id the page names (globalThis __ROOT_SLOT, set before any script runs),
 * so the game's own build plays it as rootBots.test.ts's play() does: the first roll that lays the row whole, packed (packPlan + keptFoes)
 * and planted as the slot's only seed, the slot's hand-built shadow lifted (draftReady.ts's pattern). The toy's own id has no STAGE_PLAN
 * entry, so the page cannot play it by id; the slot lends it a stage plan entry, and the row's world finish hands the page the toy's own
 * roll (rootBuilt under the toy's config), so the page plays what the bots play. What it laid goes on globalThis __ROOT_TOY for the
 * shooter's D62 check. Nothing in the game imports it; no stage is named in this file: it is handed one.
 */
import { LISTED } from '../../src/game/gen2/listed.ts';
import { packPlan, plantSeedList } from '../../src/game/gen2/seedList.ts';
import { keptFoes } from '../../src/game/gen2/pipeline.ts';
import { rootBuilt, rootKit } from '../../src/game/gen2/toyRoot.ts';
import { HAND_STAGES } from '../../src/game/protoStage.ts';
import { W2_STAGES } from '../../src/game/w2Stages.ts';
import { difficulty } from '../../src/game/difficulty.ts';

const g = globalThis as { __ROOT_SLOT?: string; __ROOT_FROM?: number; __ROOT_TOY?: unknown };
const slot = g.__ROOT_SLOT;
if (slot) {
  if (Object.hasOwn(LISTED, slot)) throw new Error(`rootBoot: ${slot} is a listed stage: lend the toy a slot no shipped row plays`);
  const setting = difficulty();
  const { st, seed } = rootBuilt(setting, rootKit, g.__ROOT_FROM ?? 1);
  const dict: string[] = [];
  const packed = packPlan({ seed: st.gen2.seed, rerolls: st.gen2.rerolls, plan: st.gen2.plan, foes: [...keptFoes(st)] }, dict);
  // (the slot's own roll is a different roll: a replay is laid by the stage's place in its world (miniIndex: a world's first stage lays no
  //  ocelot), so the row's world finish hands the page the toy's roll itself, built fresh each time under the toy's own config)
  LISTED[slot] = { kit: () => rootKit, world: <T,>(_s: T) => rootBuilt(setting, rootKit, g.__ROOT_FROM ?? 1).st as T };
  delete HAND_STAGES[slot];
  delete W2_STAGES[slot];
  plantSeedList(slot, { dict, seeds: [seed], plans: [packed] });
  const root = st.ropes!.find((r) => r.look === 'root')!;
  const oc = st.enemies.find((e) => e.type === 'ocelot')!;
  g.__ROOT_TOY = { setting, seed, root: { x0: root.x0, x1: root.x1, y: root.y, g0: root.g0 }, ocelot: { min: oc.patrolMinX, max: oc.patrolMaxX } };
}

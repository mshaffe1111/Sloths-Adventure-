/**
 * World 1's gen2 kit (WorldKit): W1_KIT's rows (gen2/worlds/w1.ts) as a WorldManifest, with World 1's pool of sections. 1-1 lays no
 * creatures, props or rooms; the dressing comes after the build (protoStage.ts addDress), as on gen2's other stages. The porter's minimal
 * kit for the test link's 1-1 picker (testlink1_1.ts), until the planner's own World 1 hook-up (gen2/game.ts GEN2_STAGES) replaces it.
 */
import type { WorldKit, WorldManifest } from '../types.ts';
import { W1_KIT, W1_SECTIONS } from './w1.ts';

export function w1Kit(): WorldKit {
  const manifest: WorldManifest = {
    world: 1,
    name: 'The Home Forest',
    moves: ['double'],
    ground: W1_KIT.ground,
    pit: W1_KIT.pit,
    pitDepth: W1_KIT.pitDepth,
    floorRoll: W1_KIT.floorRoll,
    rollRanges: W1_KIT.rollRanges,
    graphs: W1_KIT.graphs,
    corridor: W1_KIT.corridor,
    themeShare: W1_KIT.themeShare,
    required: W1_KIT.required,
    creatures: [],
    props: [],
    pairs: [],
    decor: [],
    flowers: ['orchid', 'hibiscus'],
    sections: [...W1_SECTIONS],
    handBuilt: [],
  };
  return { manifest };
}

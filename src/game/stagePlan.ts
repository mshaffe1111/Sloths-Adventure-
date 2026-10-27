/**
 * stagePlan — what each world's ten stages are, from the story (the Sloths Stage Plan doc, approved 2026-10-23).
 *
 * Every world used to run the same nine missions in the same order. Now each world leans on the way of moving its chapter calls for
 * (World 4 climbs up from the broken ledge, World 6 swings over the black water, World 10 is the thousand steps) and its stages carry
 * the chapter's own names. Stage 10 is always the guardian. Stage 5 is followed by the halfway scene (storyWorlds WORLD_MID).
 *
 * Constraints the lineups keep (the generator and the skills rely on them):
 *   - 1-3 is a stage of World 1 that teaches the rope on clearing it (skills.ts), and 1-4 may need the rope;
 *   - no Vine Swing before mission 4 (the swing piece unlocks there, stageGenerator UNLOCK);
 *   - 7-7 is a search (the secret gate stands in it, secret.ts).
 */
import type { ObjectiveType } from './types.ts';

export interface StageSpec {
  type: Exclude<ObjectiveType, 'boss_lair'>;
  /** the stage's story name, shown on the map and the stage card */
  name: string;
  /** the line under it; {n} is the stage's quota. Unset = the mission's usual description */
  desc?: string;
}

const S = (type: StageSpec['type'], name: string, desc?: string): StageSpec => ({ type, name, desc });

/** stages 1-9 of each world (the tenth is the guardian's lair) */
export const STAGE_PLAN: Record<number, StageSpec[]> = {
  // ACT I · THE TRAIL
  1: [
    S('sprint', 'Into the Canopy', 'Run the high branches of the kapok trees and reach the Exit Shrine.'),
    S('harvest', 'The Petal Trail', 'Meeca left a trail of petals. Gather {n} of them.'),
    S('purge', 'Branch Snakes', 'Clear {n} snakes off the branches with your Claw Punches.'),
    S('ascent', 'Up the Kapok', 'Climb the giant kapok to the very top.'),
    S('harvest', 'More Petals', 'The petals go on. Gather {n} more.'),
    S('vine_runner', 'First Lianas', 'Swing on the hanging lianas across the gaps in the canopy.'),
    S('stealth', 'A Very Good Bush', 'Eagles are watching. Duck under the leaves the way Dot hid from the soldiers.'),
    S('sprint', 'The Long Branch', 'Race the long branch to the Exit Shrine.'),
    S('gauntlet', "The Boa's Branches", "Fight through the boa's guards. Defeat {n} and reach the exit."),
  ],
  2: [
    S('sprint', 'Down to the River', 'Hop the drifting logs down to the riverbank village.'),
    S('harvest', 'Petals for the Crown', 'The river king wants admiring. Gather {n} flowers for his crown.'),
    S('rescue', 'Stuck in the Reeds', 'Free {n} little ones caught in the reed cages.'),
    S('vine_runner', 'Over the Water', 'Swing across the river on the hanging vines.'),
    S('purge', 'River Snappers', 'Chase off {n} snappers along the bank.'),
    S('ascent', 'Up the Bank Houses', 'Climb up through the village houses dug into the bank.'),
    S('sprint', "The Mailman's Route", 'Take the long way round the river, past every door marked PLEASE BE PATIENT.'),
    S('rescue', 'Reed Cages', 'Free {n} more little ones before the water rises.'),
    S('gauntlet', "The River King's Court", "Fight through the river king's court. Defeat {n} and reach the exit."),
  ],
  3: [
    S('sprint', 'Into the Grotto', 'Follow the glowworm light down into the grotto.'),
    S('stealth', 'Glowworm Path', 'Something is watching. Keep low and keep moving.'),
    S('purge', 'Footprints in a Circle', 'Drive off {n} prowlers circling in the dark.'),
    S('ascent', 'The Sinkhole', 'Climb the sinkhole wall toward the moonlight.'),
    S('stealth', 'Sleeping Vines', 'The old thorn vines are asleep. Do not wake them.'),
    S('relic_hunt', "Grandma's Things", "Dot hid Grandma's things in the ferns. Find {n} of them."),
    S('relic_hunt', 'Which Fern?', 'All ferns look alike. Find {n} more of Grandma\'s things.'),
    S('vine_runner', 'Thorn Vine Swing', 'Swing past the thorn vines without touching the thorns.'),
    S('gauntlet', "The Prowler's Ring", "Break out of the Prowler's ring. Defeat {n} and reach the exit."),
  ],
  // ACT II · THE COST
  4: [
    S('ascent', 'The Broken Ledge', 'The ledge fell away. Climb back up out of the mist.'),
    S('sprint', 'First Glide', 'Open your leaf and drift across the falls to the Exit Shrine.'),
    S('ascent', 'Waterfall Steps', 'Climb the wet steps beside the waterfall.'),
    S('vine_runner', 'Crosswind', 'Swing across the gaps while the wind pushes you.'),
    S('stealth', "The Sovereign's Dive", 'The Sky Sovereign is hunting. Stay under cover.'),
    S('ascent', 'Above the Mist', 'Climb above the mist to the eagle nests.'),
    S('sprint', 'The Long Drop', 'Glide down the long drops to the Exit Shrine.'),
    S('rescue', 'Nests on the Cliff', 'Free {n} little ones caught on the cliff.'),
    S('gauntlet', 'The Aerie', "Fight through the Sovereign's aerie. Defeat {n} and reach the exit."),
  ],
  5: [
    S('sprint', 'The Loveliest Place', 'Run through the loveliest place on the road. Do not stop.'),
    S('stealth', "Don't Sit", 'POKEY. DON\'T SIT. Stay hidden and keep moving.'),
    S('harvest', 'Closing Orchids', 'The orchids are closing early. Gather {n} before they do.'),
    S('vine_runner', 'Silk Bridges', 'Swing across on the silk, and do not admire it.'),
    S('rescue', 'Caught in Silk', 'Free {n} creatures wrapped in the silk.'),
    S('relic_hunt', 'Where She Ran', 'She got away from them here, for one night. Follow where she ran.'),
    S('stealth', "Don't Touch the Silk", 'Every thread hums. Keep out of sight.'),
    S('ascent', 'Up the Bloom Trees', 'Climb the bloom trees above the webs.'),
    S('gauntlet', "The Queen's Garden", "Fight through the Queen's garden. Defeat {n} and reach the exit."),
  ],
  6: [
    S('vine_runner', 'The Root Maze', 'Swing root to root over the black water.'),
    S('stealth', 'Flat Water', 'Water that flat has something under it. Stay hidden.'),
    S('vine_runner', 'Root to Root', 'Keep swinging. The water is watching.'),
    S('sprint', 'Low Tide', 'Cross the mudflats while the tide is out.'),
    S('purge', 'The Spear', 'Chase off {n} hunters in the mangrove.'),
    S('sprint', 'Lights in the Roots', 'The roots go dark. Let the firefly light the way.'),
    S('vine_runner', 'Through the Roots', 'Raise the water, lower the water, and find what Dot left you.'),
    S('ascent', 'Stilt Climb', 'Climb the stilt roots up out of the swamp.'),
    S('gauntlet', 'Blackwater', 'Fight through the blackwater. Defeat {n} and reach the exit.'),
  ],
  7: [
    S('sprint', 'The Open Door', 'The temple door stands open. Go in.'),
    S('ascent', 'Brown Vines', 'Climb the old walls where the vines have gone brown.'),
    S('relic_hunt', 'Ten Chairs', 'Search the courtyard of the ten stone chairs. Find {n} relics.'),
    S('ascent', 'The Way Up', 'Climb up through the temple. Nobody here will tell you the way.'),
    S('purge', 'Stone Sentries', 'Clear {n} guards out of the halls.'),
    S('sprint', 'Falling Floors', 'Run before the old floors crumble.'),
    S('relic_hunt', 'The Photograph', 'Search the ruins. Something here was left for Meeca\'s family. Find {n} relics.'),
    S('ascent', 'The Upper Temple', 'Climb to the top of the temple.'),
    S('gauntlet', "The Golem's Hall", "Fight through the Golem's hall. Defeat {n} and reach the exit."),
  ],
  // ACT III · THE IRON ROAD
  8: [
    S('sprint', 'As the Light Goes', 'Keep going as the light goes. The fireflies will show the way.'),
    S('harvest', 'Night Blooms', 'Gather {n} pale night blooms by firefly light.'),
    S('vine_runner', 'Long Swings', 'Swing through the dark treetops.'),
    S('stealth', 'Bat Roosts', 'Creep past the roosts without waking them.'),
    S('vine_runner', 'Next Branch', 'Next branch, then the one after.'),
    S('sprint', 'Glide by Moonlight', 'Glide from tree to tree by moonlight.'),
    S('ascent', 'The Tallest Tree', 'Climb the tallest tree to see the way ahead.'),
    S('purge', 'Night Hunters', 'Drive off {n} night hunters.'),
    S('gauntlet', "Monarch's Wood", "Fight through the Monarch's wood. Defeat {n} and reach the exit."),
  ],
  9: [
    S('sprint', 'Pepper Air', 'Run through the hot, peppery air of the volcanic jungle.'),
    S('ascent', 'Rising Heat', 'Climb the warm ledges up the volcano.'),
    S('vine_runner', 'Ember Canopy', 'Swing over the glowing rock.'),
    S('stealth', "The Drake's Doorstep", 'First he says, "Visitor." Then he says, "Intruder." Stay out of sight.'),
    S('sprint', 'Vent Riding', 'Open your leaf over the vents and ride the hot air.'),
    S('purge', 'Ash Fields', 'Clear {n} hunters off the ash fields.'),
    S('ascent', 'Lava Steps', 'Climb the cooled lava steps.'),
    S('relic_hunt', "Pell's Thread", 'The lieutenant keeps dropping bits of his thread. Find {n} of them.'),
    S('gauntlet', "The Drake's Hoard", "Fight through the Drake's hoard. Defeat {n} and reach the exit."),
  ],
  10: [
    S('sprint', 'The Door Made for Him', 'Go through the door in the netting. It is exactly your width.'),
    S('ascent', 'The Thousand Steps', 'Climb the thousand steps toward the fortress.'),
    S('stealth', 'Thunder', 'Hold on through the storm and stay out of sight.'),
    S('ascent', 'Holding On', 'Keep climbing. Hold on when the thunder comes.'),
    S('ascent', 'Halfway Up', 'Climb halfway up the mountain. Listen.'),
    S('vine_runner', 'The Iron Netting', 'Swing along the iron netting.'),
    S('purge', 'The Walls', 'Clear {n} guards off the walls.'),
    S('ascent', 'The Last Steps', 'The last of the thousand steps.'),
    S('gauntlet', 'The Fortress Gate', 'Fight through the fortress gate. Defeat {n} and reach the exit.'),
  ],
};

/** the plan for one stage (1-9), or null for the guardian's lair and anything out of range */
export function stageSpec(world: number, mini: number): StageSpec | null {
  return STAGE_PLAN[world]?.[mini - 1] ?? null;
}

/** World 1's harvests gather Meeca's petals, not flowers */
export const isPetalStage = (world: number, mini: number) => world === 1 && stageSpec(world, mini)?.type === 'harvest';

/** what a search (relic hunt) turns up in a world: one of the painted keepsakes (items/<name>.webp), or the golden idol (null) */
export function relicArt(world: number, k: number): string | null {
  switch (world) {
    case 3: return ['locket', 'rattle', 'teddy', 'bell'][k % 4]; // Grandma's things, hidden in the ferns
    case 5: return 'scroll'; // Meeca's carved messages
    case 9: return 'ribbon'; // the lieutenant's dropped thread
    default: return null;
  }
}

/**
 * Dot's goal lines, said in words that fit the goal and the number (Matt's 2-3 said "Free 3 animals freed to open the sanctuary"):
 *  'start'  "Free 3 animals to open the sanctuary"
 *  'late'   "Still 2 animals to free before the sanctuary opens"
 *  'sealed' "Sealed: free 2 more animals to open it"
 * Empty for a stage with no count to reach.
 */
export function goalLine(kind: 'start' | 'late' | 'sealed', world: number, type: string, n: number): string {
  const g = GOAL_WORDS(world, type);
  if (!g) return '';
  const noun = n === 1 ? g.one : g.many;
  if (kind === 'start') return `${g.verb} ${n} ${noun} to open the sanctuary`;
  if (kind === 'late') return `Still ${n} ${noun} to ${g.verb.toLowerCase()} before the sanctuary opens`;
  return `Sealed: ${g.verb.toLowerCase()} ${n} more ${noun} to open it`;
}
function GOAL_WORDS(world: number, type: string): { verb: string; one: string; many: string } | null {
  if (type === 'harvest') {
    const [one, many] = world === 1 ? ['petal', 'petals'] : world === 8 ? ['night bloom', 'night blooms'] : ['flower', 'flowers'];
    return { verb: 'Collect', one, many };
  }
  if (type === 'relic_hunt') {
    const w = ({ 3: ['keepsake', 'keepsakes'], 5: ['message', 'messages'], 9: ['thread', 'threads'] } as Record<number, string[]>)[world] ?? ['relic', 'relics'];
    return { verb: 'Find', one: w[0], many: w[1] };
  }
  // (4-9 The Aerie counts the capuchin guards, and its counter says "guards": the goal says the same)
  if (type === 'gauntlet' && world === 4) return { verb: 'Defeat', one: 'guard', many: 'guards' };
  if (type === 'purge' || type === 'gauntlet') return { verb: 'Defeat', one: 'predator', many: 'predators' };
  if (type === 'rescue') return { verb: 'Free', one: 'animal', many: 'animals' };
  return null;
}

/** the word the HUD counts in: what this world's harvest gathers and its searches find */
export function countWord(world: number, type: string): string {
  if (type === 'harvest') return world === 1 ? 'petals' : world === 8 ? 'night blooms' : 'flowers';
  if (type === 'relic_hunt') return ({ 3: 'keepsakes', 5: 'messages', 9: 'threads' } as Record<number, string>)[world] ?? 'relics';
  // (4-9 The Aerie: the capuchin guards the wind blows off their ledges)
  if (type === 'gauntlet' && world === 4) return 'guards';
  if (type === 'purge' || type === 'gauntlet') return 'predators';
  if (type === 'rescue') return 'animals freed';
  return '';
}

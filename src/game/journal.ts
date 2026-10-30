/**
 * Words for the Jungle Journal: one card per creature the player can meet, as the game has it today (Matt, 2026-10-28: the cards
 * still showed the first enemies). Tips are 12 words or fewer, in the touch words Dot uses (tap, flick, slide).
 *
 * Three kinds of card:
 *   - predators: the engine's enemies, marked met by their type when one comes on screen (engine statSeen -> store.seen). The ids
 *     are the saved ones (badges.ts PREDATORS) and never change.
 *   - met on the road: the stage pieces that are not the engine's enemies (World 4's monkeys and eaglets, World 5's butler and
 *     seamstress, the river king's guard, Pell and his soldiers). Nothing marks them met, so a card opens once a stage that holds
 *     the creature has been cleared.
 *   - guardians: one per world, opened by beating its 10th stage.
 */
import { GUARDIANS, PREDATORS, type PredatorId } from './badges.ts';
import { cardMet, PREDATOR_ALSO_IN, ROAD_STAGES } from './journalMet.ts';

export interface PredatorEntry {
  id: PredatorId;
  name: string;
  tip: string;
  /** the first world it shows up in */
  first: number;
  /** stages where it is met without being one of the engine's enemies (the eagle that watches 1-7): cleared, it counts as met */
  alsoIn?: readonly string[];
}

export const PREDATOR_ENTRIES: Record<PredatorId, PredatorEntry> = {
  snake: { id: 'snake', name: 'Golden Tree Snake', tip: 'Rears up, sways, then strikes. Tap to punch it after.', first: 1 },
  boa: { id: 'boa', name: 'Boa Constrictor', tip: 'Coiled and watching. Let it strike, then punch it three times.', first: 1 },
  eagle: { id: 'eagle', name: 'Harpy Eagle', tip: 'Circles, then dives. Slide down to duck, or hide in a bush.', first: 1, alsoIn: PREDATOR_ALSO_IN.eagle },
  turtle: { id: 'turtle', name: 'Snapping Turtle', tip: 'Head-on it hides. Flick sideways to kick the shell.', first: 2 },
  ocelot: { id: 'ocelot', name: 'Ocelot', tip: 'Crouches, then pounces. Tap twice, or flick sideways to kick.', first: 3 },
  jaguar: { id: 'jaguar', name: 'Jaguar', tip: 'Flick up when it crouches to leap. Three hits beat it.', first: 3 },
  spider: { id: 'spider', name: 'Jumping Spider', tip: 'Crouches, then rushes. Tap to punch it first.', first: 5 },
  tayra: { id: 'tayra', name: 'Tayra', tip: 'Stands up to sniff, then dashes low. Flick up over it.', first: 5 },
  caiman: { id: 'caiman', name: 'Spectacled Caiman', tip: 'Lunges and snaps. Step back, then punch. Stomps just bounce off.', first: 6 },
  harpy: { id: 'harpy', name: 'Night Harpy', tip: 'Slides low, then stomps. Flick up twice, punch it while dizzy.', first: 6 },
  frog: { id: 'frog', name: 'Poison Dart Frog', tip: 'Poison! Never touch it. Flick up and hop right past.', first: 6 },
};

/** the predator cards in the order the journey meets them (every saved id, once) */
export const PREDATOR_ORDER: readonly PredatorId[] = [...PREDATORS].sort(
  (a, b) => PREDATOR_ENTRIES[a].first - PREDATOR_ENTRIES[b].first || PREDATORS.indexOf(a) - PREDATORS.indexOf(b),
);

export interface RoadEntry {
  /** its card picture (creatureArt.ts) and its key */
  id: string;
  name: string;
  tip: string;
  first: number;
  /** the stages that hold it: any one cleared opens the card */
  stages: readonly string[];
}

export const ROAD_ENTRIES: readonly RoadEntry[] = [
  { id: 'royal_guard', name: "River King's Guard", tip: 'Head-on he blocks. Flick sideways to kick, or hit from behind.', first: 2, stages: ROAD_STAGES.royal_guard },
  { id: 'capuchin', name: 'Capuchin Monkey', tip: 'Never hurts. Catch the thief, hide from lookouts, wait out guards.', first: 4, stages: ROAD_STAGES.capuchin },
  { id: 'eaglet', name: 'Harpy Eaglets', tip: 'Go while they sleep. Lift your thumb and freeze when one peeks.', first: 4, stages: ROAD_STAGES.eaglet },
  { id: 'butler', name: 'The Butler', tip: 'Offers sleepy cake. Tap to punch the tray, or flick up over.', first: 5, stages: ROAD_STAGES.butler },
  { id: 'seamstress', name: 'The Seamstress', tip: "Don't watch her knit. Slide on past before she looks up.", first: 5, stages: ROAD_STAGES.seamstress },
  { id: 'soldier', name: "Iron-Claw's Soldiers", tip: 'They march Meeca north. In camp they sleep: never wake them.', first: 5, stages: ROAD_STAGES.soldier },
  { id: 'pell', name: 'Lieutenant Pell', tip: "Iron-Claw's lieutenant. He found Meeca when she stopped to look.", first: 5, stages: ROAD_STAGES.pell },
];

export interface GuardianEntry {
  world: number;
  name: string;
  /** its full-body painted picture in creatureArt.ts (every guardian has one: the frame its fight draws) */
  art: string;
}

export const GUARDIAN_ENTRIES: GuardianEntry[] = GUARDIANS.map((name, i) => ({
  world: i + 1,
  name,
  art: `guardian_${i + 1}`,
}));

/** the few things the journal reads from a stage record */
interface Cleared {
  id: string;
  completed: boolean;
}

/** has the player met this predator? (seen on screen, or a stage that holds it in another way cleared) */
export const predatorMet = (id: PredatorId, seen: readonly string[], levels: readonly Cleared[]): boolean => cardMet(id, seen, levels);

/** has the player met this one on the road? (a stage that holds it cleared) */
export const roadMet = (e: RoadEntry, levels: readonly Cleared[], seen: readonly string[] = []): boolean => cardMet(e.id, seen, levels);

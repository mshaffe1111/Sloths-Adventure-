/** Words for the Jungle Journal: one entry per creature the player can meet. */
import { GUARDIANS, PREDATORS, type PredatorId } from './badges.ts';

export interface PredatorEntry {
  id: PredatorId;
  name: string;
  tip: string;
  /** the first world it shows up in, when it is the same in every playthrough */
  first?: number;
}

export const PREDATOR_ENTRIES: Record<PredatorId, PredatorEntry> = {
  snake: { id: 'snake', name: 'Tree Snake', tip: 'Slithers along its patch. Stomp it from above.', first: 1 },
  tayra: { id: 'tayra', name: 'Tayra', tip: 'Fast and low. Hop over its dash.', first: 4 },
  ocelot: { id: 'ocelot', name: 'Ocelot', tip: 'Stalks, gathers itself, then springs. Hit it while it gathers.', first: 2 },
  jaguar: { id: 'jaguar', name: 'Jaguar', tip: 'Crouches before it leaps. Dodge the leap, then strike as it lands.', first: 6 },
  boa: { id: 'boa', name: 'Boa Constrictor', tip: 'A coiled ambusher with a long strike. Stay out of range or hit it first.', first: 3 },
  eagle: { id: 'eagle', name: 'Harpy Eagle', tip: 'Dives from above. Strike it while it hovers.', first: 1 },
  spider: { id: 'spider', name: 'Canopy Tarantula', tip: 'Patrols its web. Stomp it from above.' },
  caiman: { id: 'caiman', name: 'Spectacled Caiman', tip: 'Slow and armoured, but it lunges. Heavy hits work best.', first: 2 },
  turtle: { id: 'turtle', name: 'Snapping Turtle', tip: 'Hit it head-on and it hides in its shell. Get behind it, stomp it, or kick the shell and send it sliding.', first: 2 },
  harpy: { id: 'harpy', name: 'Night Harpy', tip: 'Crouches, slides low, then leaps and stomps. Jump the slide, jump the shockwave, then strike while it is dizzy.', first: 6 },
  frog: { id: 'frog', name: 'Poison Dart Frog', tip: 'Tiny and bold. Never touch it. Time your jump past.' },
};

export const PREDATOR_ORDER = PREDATORS;

export interface GuardianEntry {
  world: number;
  name: string;
  /** art key in creatureArt.ts when the guardian has a full-body painted picture there (the round crest in components/icons/crests.ts covers all ten) */
  art?: string;
}

const ART: Record<number, string> = { 1: 'guardian_1', 2: 'guardian_2', 5: 'guardian_5' };

export const GUARDIAN_ENTRIES: GuardianEntry[] = GUARDIANS.map((name, i) => ({
  world: i + 1,
  name,
  art: ART[i + 1],
}));

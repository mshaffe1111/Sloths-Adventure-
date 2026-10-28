/**
 * gen2/worlds/w6Swing — World 6's swing sections, root perches and dark-root stretches (DESIGN.md B9, phase 3), for 6-1 "The Root Maze",
 * 6-3 "Root to Root", 6-6 "Lights in the Roots" and 6-7 "Through the Roots" (stagePlan.ts; reference/STORY-REWRITE.md "World 6").
 *
 * The Deep Mangrove: roots stand up out of flat black water in a maze; the water between them costs a life (manifest pit 'water', on
 * Easy too, with Dot's warning first: pipeline WATER_WARN). So the rules every section here keeps (STAGE-RULES §6, the first-timer lessons):
 *   - a hop over water is a third to a half of a jump, never a lower stone, never a second-jump gap (those go over a soft root floor);
 *   - a root perch is a whole bank down to the ground (a wall reaches the floor); every rise is one plain hop;
 *   - nothing crumbles.
 *
 * This file's first part is the ground the swings join: root islands (start, rests, the shrine's approach), root knees to hop, root
 * perches stepping up and down. The liana sections (a chain of ledge -> liana -> ledge, never liana to liana: levelCheck follows a swing
 * from a ledge to a ledge) and the dark-root stretches lit by the firefly come once the gen2 core's liana piece and dark zone land.
 */
import type { Phase, SectionPiece, SectionTemplate, Socket } from '../types.ts';

// ───────────────────────────── the tags (World 6's manifest, gen2/worlds/w6.ts, names the props and creatures these ask for) ─────────────────────────────

export const W6S_TAG = {
  /** the watcher in the water: a spear rising slowly out of it, looking, sinking again */
  watcher: 'watcher',
  /** a root perch's dressing: oysters on the roots, a heron's nest */
  roots: 'roots',
  /** what keeps a vine stage's bag on its swings (pipeline WANT.vine_runner) */
  swing: 'swing',
  /** a sprint's want (pipeline WANT.sprint) */
  run: 'run',
} as const;

// ───────────────────────────── helpers ─────────────────────────────

type Opt = Partial<Socket>;
const petals = (id: string, on: string, t: Socket['t'], count = 2, span = 120, o: Opt = {}): Socket => ({ id, role: 'pickup', on, t, dn: 34, count, span, ...o });
const foe = (id: string, on: string, t: Socket['t'], o: Opt = {}): Socket => ({ id, role: 'enemy', on, t, maxThreat: 3, easy: 'soften', ...o });
const prop = (id: string, on: string, t: Socket['t'], allow: string[], o: Opt = {}): Socket => ({ id, role: 'prop', on, t, allow, ...o });
const flag = (on: string, t: Socket['t']): Socket => ({ id: 'flag', role: 'flag', on, t });

const LIVE: Phase[] = ['sho', 'ten', 'ketsu'];

const bank = (key: string, w: SectionPiece['w'], place: SectionPiece['place'], o: Partial<SectionPiece> = {}): SectionPiece => ({ key, shape: 'bank', w, place, ...o });
/** a root knee over water: a hop of `share` of a jump (a third to a half over water) */
const knee = (key: string, after: string, w: SectionPiece['w'], share: SectionPiece['w'] = [0.33, 0.45], dy: SectionPiece['w'] = 0): SectionPiece =>
  bank(key, w, { kind: 'jump', after, dy, share }, { landing: true });
/** a root perch a step up (a plain hop), or down */
const upStep = (key: string, after: string, dy: number, w: SectionPiece['w']): SectionPiece => bank(key, w, { kind: 'walk', after, dy: -dy });
const downStep = (key: string, after: string, dy: number, w: SectionPiece['w']): SectionPiece => bank(key, w, { kind: 'walk', after, dy });
/** a stump of root standing on a piece (one hop) */
const rootStump = (key: string, on: string, at: SectionPiece['w'], h: SectionPiece['w'], w: SectionPiece['w'] = [110, 140]): SectionPiece => ({ key, shape: 'block', w, place: { kind: 'on', on, at, h }, style: 'moss_stone' });

// ───────────────────────────── the ground the swings join ─────────────────────────────

/** a root island: the start, a rest (a flag), the shrine's approach */
const rootIsland: SectionTemplate = {
  id: 'w6s-root-island',
  name: 'root island',
  archetypes: ['vine_runner', 'sprint'],
  phases: ['start', 'rest', 'goal'],
  difficulty: 1,
  pieces: [bank('bank', [620, 760], { kind: 'start' }), rootStump('st', 'bank', [0.3, 0.4], [45, 55])],
  entry: { piece: 'bank', kind: 'ground' },
  exit: { piece: 'bank', kind: 'ground' },
  exitDy: 0,
  sockets: [petals('st', 'st', 0.5, 1), petals('row', 'bank', [0.6, 0.66], 2, 100), flag('bank', 0.84), prop('nest', 'bank', [0.12, 0.2], [W6S_TAG.roots], { chance: 0.6 })],
  mirrorable: true,
};

/** root knees: three short hops over the black water, petal arcs over each (half a beat) */
const rootKnees: SectionTemplate = {
  id: 'w6s-root-knees',
  name: 'root knees over the water',
  archetypes: ['vine_runner', 'sprint'],
  phases: ['ki', 'sho', 'ten'],
  difficulty: 3,
  pieces: [bank('a', [220, 280], { kind: 'start' }), knee('b', 'a', [170, 220], [0.33, 0.45], -30), knee('c', 'b', [170, 220], [0.33, 0.45], 30), knee('d', 'c', [300, 380])],
  entry: { piece: 'a', kind: 'ground' },
  exit: { piece: 'd', kind: 'ground' },
  exitDy: 0,
  sockets: [petals('a', 'a', 0.4, 2, 80), petals('b', 'b', 0.5, 1), petals('c', 'c', 0.5, 1), foe('foe', 'd', [0.7, 0.85], { phases: LIVE, chance: 0.6 })],
  mirrorable: true,
};

/** root perches stepping up, one hop each, then down over a hop of water */
const perchSteps: SectionTemplate = {
  id: 'w6s-perch-steps',
  name: 'root perches up and down',
  archetypes: ['vine_runner', 'sprint'],
  phases: ['ki', 'sho', 'ten', 'rest'],
  difficulty: 3,
  pieces: [
    bank('a', [260, 320], { kind: 'start' }),
    upStep('b', 'a', 60, [170, 210]),
    upStep('c', 'b', 60, [200, 240]),
    downStep('d', 'c', 120, [160, 200]),
    knee('e', 'd', [300, 360], [0.3, 0.4]),
  ],
  entry: { piece: 'a', kind: 'ground' },
  exit: { piece: 'e', kind: 'ground' },
  exitDy: 0,
  sockets: [petals('b', 'b', 0.5, 1), petals('c', 'c', 0.5, 2, 90), prop('nest', 'c', 0.85, [W6S_TAG.roots], { chance: 0.4 }), foe('foe', 'e', [0.6, 0.8], { phases: LIVE, chance: 0.5 })],
  mirrorable: true,
};

/** a long root over the water, the watcher rising beside it: keep walking, hop the stumps (a sprint's run) */
const watcherRoot: SectionTemplate = {
  id: 'w6s-watcher-root',
  name: 'the watcher beside the long root (run)',
  archetypes: ['vine_runner', 'sprint'],
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 5,
  pieces: [
    bank('a', [260, 300], { kind: 'start' }),
    knee('b', 'a', [620, 760], [0.33, 0.42]),
    rootStump('s1', 'b', [0.2, 0.28], [45, 60]),
    rootStump('s2', 'b', [0.62, 0.7], [50, 65]),
  ],
  entry: { piece: 'a', kind: 'ground' },
  exit: { piece: 'b', kind: 'ground' },
  exitDy: 0,
  sockets: [
    petals('s1', 's1', 0.5, 1),
    petals('s2', 's2', 0.5, 1),
    prop('watcher', 'b', [0.42, 0.5], [W6S_TAG.watcher], { phases: LIVE }),
    foe('foe', 'b', [0.86, 0.94], { phases: ['ten', 'ketsu'], chance: 0.5 }),
  ],
  mirrorable: true,
};

/** two root humps and a knee: hop, hop, a wider hop, petals in an arc (a sprint's quick ground) */
const humpRun: SectionTemplate = {
  id: 'w6s-hump-run',
  name: 'root humps (run)',
  archetypes: ['vine_runner', 'sprint'],
  phases: ['ki', 'sho', 'ten', 'ketsu'],
  difficulty: 4,
  pieces: [
    bank('a', [520, 620], { kind: 'start' }),
    rootStump('h1', 'a', [0.18, 0.24], [40, 55], [90, 120]),
    rootStump('h2', 'a', [0.6, 0.68], [55, 70], [100, 130]),
    knee('b', 'a', [360, 440], [0.38, 0.48]),
  ],
  entry: { piece: 'a', kind: 'ground' },
  exit: { piece: 'b', kind: 'ground' },
  exitDy: 0,
  sockets: [petals('h1', 'h1', 0.5, 1), petals('h2', 'h2', 0.5, 1), foe('foe', 'b', [0.55, 0.8], { phases: LIVE, chance: 0.6 })],
  mirrorable: true,
};

// ───────────────────────────── the set ─────────────────────────────

/** World 6's swing-stage sections (the ground ones now; the lianas and the dark roots join them) */
export const W6_SWING_SECTIONS: readonly SectionTemplate[] = [rootIsland, rootKnees, perchSteps, watcherRoot, humpRun];

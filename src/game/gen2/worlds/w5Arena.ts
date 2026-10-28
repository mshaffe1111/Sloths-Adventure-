/**
 * gen2/worlds/w5Arena — 5-9 "The Queen's Garden" (gauntlet: "Fight through the Queen's garden. Defeat {n} and reach the exit."), and
 * World 5's two puzzle-room sections, as gen2 building blocks (DESIGN.md B9, piece D). Every prop comes from the story
 * (reference/STORY-REWRITE.md "World 5"): the sanctuary's arches and lanterns, the soft chairs, the tiny cakes, the teapot that is always
 * warm, the humming threads, the Butler; the creature is the jumping spider. The light is the misty violet twilight (5-7 to 5-9).
 *
 * 5-9's shape (the gauntlet's mission graph, pipeline.ts missionGraph, wants 'arena' everywhere but the start and the shrine):
 *   start   the GARDEN GATE: an arch over the lawn, and Dot says why the shrine is shut (STAGE-RULES §1: Dot explains a locked exit)
 *   Ki      one spider on a lawn, then spiders between stumps: the fight shown plainly
 *   Sho     the sunken lawn, the lawn under the high road, threads among the spiders; the cake room (DON'T EAT) may come here
 *   rest    a quiet lawn under the lanterns, a flag
 *   Ten     the Butler's lawn, a lawn past a soft pit, steam and spiders; the tea room over the Butler's arch (DON'T DRINK) may come here
 *   Ketsu   THE QUEEN'S GARDEN: the arena itself, through its arch (once a stage), or the tea lawn
 *   shrine  the last arch and its lanterns before the shrine
 * Every arena section carries the 'arena' tip socket, so whichever comes first says the line (it is said once a stage).
 *
 * The two rooms (puzzle kit, STAGE-RULES §3; anchors on the section's own pieces by key; widths fixed, so nothing slides):
 *   w5a-room-cake  DON'T EAT: a beetle by the door eats a crumb and falls asleep as he comes in (the room shows the idea first); then
 *                  one plate before the gate, and cakes on a stool. He opens the gate standing on the plate, but it shuts as he steps
 *                  off it; a cake set on the plate brings the other beetle, who eats it and sleeps there: the gate stays open.
 *   w5a-room-tea   DON'T DRINK: the Butler stands in his arch (it never opens, and is too high to jump); the lift in the well before
 *                  it is wound by a basket. Tip the teapot from the lift's plank: the tea runs down the trough into the basket and the
 *                  lift rises with him over the arch. Tipped from the floor, the lift goes up alone (the post sets the table again).
 * Neither has an enemy socket or a pit beside it (the pipeline keeps a room's join quiet), neither costs a life, and neither can be
 * walked past unsolved (the gate and the arch stand on the ground and are taller than a double jump).
 *
 * The world's own pieces (prop and creature ids, the emitters into proto.w5) are World 5's manifest's (gen2/worlds/w5.ts, piece A);
 * here the sockets ask for TAGS (W5A_TAGS), and `withArena` adds these sections, the tips and the arena props a kit needs.
 */
import type { Anchor } from '../../puzzleKit.ts';
import type { LocalAnchor, LocalRoomSpec, PropDef, PropEmitter, SectionPiece, SectionTemplate, Socket, WorldKit } from '../types.ts';
import { W5_TAG, w5Kit, w5Of } from './w5.ts';

/** the tags the sockets ask for (World 5's manifest, w5.ts W5_TAG, and this file's two scenery props) */
export const W5A_TAGS = {
  awake: W5_TAG.awake, // the jumping spider, awake: it crouches, then rushes
  doze: W5_TAG.doze, // the same spider asleep until a thread hums
  gate: 'gate', // the sanctuary's arch (W5 art: arch, arch2)
  lamp: 'lamp', // a lantern (lantern, lantern2)
  seat: W5_TAG.seat, // a soft chair (it tugs: DON'T SIT)
  treat: W5_TAG.treat, // a tiny cake (DON'T EAT)
  pot: W5_TAG.pot, // a teapot puffing sleepy steam (DON'T DRINK)
  thread: W5_TAG.thread, // a humming thread (DON'T TOUCH THE SILK)
  host: W5_TAG.host, // the Butler, holding out his tray
} as const;

/** the mechanic key of the arena's tip: Dot explains the shut shrine */
export const ARENA = 'arena';

/**
 * Dot's lines (under 10 words). All new: each needs Matt's approval before it ships (STAGE-RULES §1 "Story").
 *   arena   the shrine is shut until enough spiders are beaten (the locked exit, explained)
 *   cake / tea  each room's way on, explained as he comes in; `hold` and `open` the room's moments
 */
export const W5A_TIPS: Record<string, string> = {
  [ARENA]: "The shrine's shut. Beat the spiders to open it.", // (new, needs Matt's approval)
};
export const W5A_NEW_LINES: readonly string[] = [
  W5A_TIPS[ARENA],
  'The plate opens the gate. One of you.',
  'Cake! Set it down. Gently.',
  'Fast asleep on the plate. Through we go!',
  "He won't move. He's too polite.",
  'Tipped! Somebody should mop that.',
  'Up and over. Rude, but over.',
];

/**
 * The rooms' hints, asked for (Matt: only when asked, in steps, never the answer; under 10 words). New lines: each needs Matt's
 * approval. The kit's on-request hook (puzzlePlay.ts KitHost.stuck) is where they come in.
 */
export const W5A_ROOM_HINTS: Record<string, readonly [string, string]> = {
  cake: ['That beetle only ever thinks about cake.', 'Who else could stand on a plate?'],
  tea: ['Manners won\'t move him. Look up.', 'Where would tea go, if it spilled?'],
};

// ───────────────────────────── helpers ─────────────────────────────

const bank = (key: string, w: SectionPiece['w'], place: SectionPiece['place'], o: Partial<SectionPiece> = {}): SectionPiece => ({ key, shape: 'bank', w, place, ...o });
const foe = (id: string, on: string, t: Socket['t'], o: Partial<Socket> = {}): Socket => ({ id, role: 'enemy', on, t, allow: [W5A_TAGS.awake], maxThreat: 3, easy: 'soften', ...o });
/** a spider asleep (cheap: threat 1.5): it wakes if he walks into it or a thread hums near it */
const sleeper = (id: string, on: string, t: Socket['t'], o: Partial<Socket> = {}): Socket => ({ id, role: 'enemy', on, t, allow: [W5A_TAGS.doze], maxThreat: 1.5, easy: 'soften', ...o });
const petals = (id: string, on: string, t: Socket['t'], count = 3, span = 200, o: Partial<Socket> = {}): Socket => ({ id, role: 'pickup', on, t, dn: 34, count, span, ...o });
const prop = (id: string, on: string, t: Socket['t'], tag: string, o: Partial<Socket> = {}): Socket => ({ id, role: 'prop', on, t, allow: [tag], ...o });
const tip = (on: string, t = 0.12): Socket => ({ id: 'arenaTip', role: 'tip', on, t, allow: [ARENA] });

// ───────────────────────────── 5-9: the gates, the beats, the arena ─────────────────────────────
//
// (every beat is ground the route really crosses: a step up onto a mound and down off it, a hop over a soft pit. A stump standing ON
// a bank is not one: the check walks the bank under it, so the inspector and the bots never count it. Steps are fixed heights, the
// same up as down, so a section ends at the height it began and the route never drifts out of the corridor)

/** a mound: a step up `dy` px onto a piece, then (with `down`) a step back down: two hops the route takes */
const up = (key: string, after: string, dy: number, w: SectionPiece['w']): SectionPiece => bank(key, w, { kind: 'walk', after, dy: -dy });
const down = (key: string, after: string, dy: number, w: SectionPiece['w']): SectionPiece => bank(key, w, { kind: 'walk', after, dy });
/** a soft pit hopped: `share` of the widest gap the difficulty allows (a miss is a climb out, never a life) */
const hop = (key: string, after: string, w: SectionPiece['w'], share: SectionPiece['w'] = [0.35, 0.55], landing = false): SectionPiece =>
  bank(key, w, { kind: 'pit', after, jump: 'jump', share }, landing ? { landing } : {});

/** start: the garden gate. An arch over a mound; Dot says why the shrine is shut, before any spider */
export const gardenGate: SectionTemplate = {
  id: 'w5a-gate-in',
  name: 'the garden gate (arena gate)',
  archetypes: ['gauntlet'],
  phases: ['start'],
  difficulty: 1,
  // (5-9's start, all but always: World 5's own garden starts are 'any', and this one carries the arena's line)
  weight: 30,
  pieces: [bank('lawn', [300, 360], { kind: 'start' }), up('mound', 'lawn', 40, [220, 260]), hop('lawn2', 'mound', [280, 340], [0.3, 0.45])],
  entry: { piece: 'lawn', kind: 'ground' },
  exit: { piece: 'lawn2', kind: 'ground' },
  exitDy: -40,
  sockets: [
    tip('lawn', 0.15),
    prop('lamp', 'lawn', [0.55, 0.7], W5A_TAGS.lamp, { chance: 0.7 }),
    petals('petals', 'mound', 0.5, 3, 160),
    prop('arch', 'lawn2', [0.45, 0.6], W5A_TAGS.gate),
  ],
  mirrorable: false,
};

/** rest: a quiet lawn under the lanterns, one small hop, a flag (the breather between bursts) */
export const lanternLawn: SectionTemplate = {
  id: 'w5a-lantern-rest',
  name: 'the lantern lawn',
  archetypes: ['gauntlet'],
  phases: ['rest'],
  difficulty: 1,
  weight: 2,
  pieces: [bank('lawn', [260, 320], { kind: 'start' }), hop('lawn2', 'lawn', [320, 380], [0.3, 0.45])],
  entry: { piece: 'lawn', kind: 'ground' },
  exit: { piece: 'lawn2', kind: 'ground' },
  exitDy: 0,
  sockets: [prop('lamp', 'lawn', [0.25, 0.4], W5A_TAGS.lamp), petals('petals', 'lawn2', [0.3, 0.4], 2, 70), { id: 'flag', role: 'flag', on: 'lawn2', t: 0.75 }],
  mirrorable: true,
};

/** rest: the orchid steps, a mound to walk over with petals on it, a flag */
export const orchidSteps: SectionTemplate = {
  id: 'w5a-orchid-rest',
  name: 'the orchid steps',
  archetypes: ['gauntlet'],
  phases: ['rest'],
  difficulty: 1,
  weight: 2,
  pieces: [bank('lawn', [220, 280], { kind: 'start' }), up('mound', 'lawn', 36, [200, 240]), down('lawn2', 'mound', 36, [280, 340])],
  entry: { piece: 'lawn', kind: 'ground' },
  exit: { piece: 'lawn2', kind: 'ground' },
  exitDy: 0,
  sockets: [petals('petals', 'mound', 0.5, 3, 150), prop('lamp', 'lawn2', [0.2, 0.3], W5A_TAGS.lamp, { chance: 0.6 }), { id: 'flag', role: 'flag', on: 'lawn2', t: 0.7 }],
  mirrorable: true,
};

/** shrine: the last arch and its lanterns, a step up to it and down, the walk out */
export const shrineGate: SectionTemplate = {
  id: 'w5a-gate-out',
  name: 'the last arch (arena gate)',
  archetypes: ['gauntlet'],
  phases: ['goal'],
  difficulty: 1,
  pieces: [bank('lawn', [220, 260], { kind: 'start' }), up('mound', 'lawn', 40, [260, 300]), down('lawn2', 'mound', 40, [200, 240])],
  entry: { piece: 'lawn', kind: 'ground' },
  exit: { piece: 'lawn2', kind: 'ground' },
  exitDy: 0,
  sockets: [prop('lamp', 'lawn', [0.3, 0.5], W5A_TAGS.lamp), prop('arch', 'mound', [0.45, 0.55], W5A_TAGS.gate), petals('petals', 'lawn2', 0.5, 2, 80)],
  mirrorable: false,
};

/** Ki: a hop in, one spider on the lawn, a mound on the way out (the fight shown plainly) */
export const spiderLawn: SectionTemplate = {
  id: 'w5a-spider-lawn',
  name: 'arena: one spider on the lawn',
  archetypes: ['gauntlet'],
  phases: ['ki', 'sho'],
  difficulty: 3,
  weight: 2,
  pieces: [
    bank('near', [200, 250], { kind: 'start' }),
    hop('lawn', 'near', [440, 520], [0.4, 0.6], true),
    up('mound', 'lawn', 48, [140, 180]),
    down('out', 'mound', 48, [270, 320]),
    hop('out2', 'out', [160, 200], [0.35, 0.5], true),
  ],
  entry: { piece: 'near', kind: 'ground' },
  exit: { piece: 'out2', kind: 'ground' },
  exitDy: 0,
  sockets: [
    tip('near', 0.2),
    sleeper('s1', 'lawn', [0.2, 0.26]),
    petals('pm', 'mound', 0.5, 1),
    foe('f1', 'out', [0.55, 0.65]),
  ],
  mirrorable: true,
};

/** Ki/Sho: the sleepers' steps: up a step, a hop, down onto a lawn where two spiders doze (hop them, or wake them and fight) */
export const sleeperSteps: SectionTemplate = {
  id: 'w5a-sleeper-steps',
  name: 'arena: the sleepers on the steps',
  archetypes: ['gauntlet'],
  phases: ['ki', 'sho'],
  difficulty: 3,
  weight: 2,
  pieces: [
    bank('near', [200, 240], { kind: 'start' }),
    up('step', 'near', 40, [160, 200]),
    hop('step2', 'step', [160, 200], [0.35, 0.5], true),
    down('yard', 'step2', 40, [300, 340]),
    hop('yard2', 'yard', [250, 290], [0.4, 0.55], true),
  ],
  entry: { piece: 'near', kind: 'ground' },
  exit: { piece: 'yard2', kind: 'ground' },
  exitDy: 0,
  sockets: [
    tip('near', 0.2),
    petals('ps', 'step2', 0.5, 1),
    sleeper('s1', 'yard', [0.45, 0.55]),
    petals('py', 'yard2', [0.15, 0.2], 1),
    sleeper('s2', 'yard2', [0.5, 0.6]),
  ],
  mirrorable: true,
};

/** rest: under the arch, a hop over a soft dip, a flag */
export const archRest: SectionTemplate = {
  id: 'w5a-arch-rest',
  name: 'the arch walk',
  archetypes: ['gauntlet'],
  phases: ['rest'],
  difficulty: 1,
  weight: 2,
  pieces: [bank('lawn', [240, 300], { kind: 'start' }), hop('lawn2', 'lawn', [200, 240], [0.3, 0.45]), up('lawn3', 'lawn2', 36, [220, 260]), down('lawn4', 'lawn3', 36, [200, 240])],
  entry: { piece: 'lawn', kind: 'ground' },
  exit: { piece: 'lawn4', kind: 'ground' },
  exitDy: 0,
  sockets: [prop('arch', 'lawn', [0.4, 0.55], W5A_TAGS.gate), petals('petals', 'lawn3', 0.5, 2, 80), { id: 'flag', role: 'flag', on: 'lawn4', t: 0.6 }],
  mirrorable: true,
};

/** Ki/Sho/Ten: over a mound, spiders on the yard, a hop out */
export const stumpPair: SectionTemplate = {
  id: 'w5a-mound-pair',
  name: 'arena: spiders past the mound',
  archetypes: ['gauntlet'],
  phases: ['ki', 'sho', 'ten'],
  difficulty: 4,
  weight: 2,
  pieces: [
    bank('near', [180, 220], { kind: 'start' }),
    up('mound', 'near', 44, [160, 200]),
    down('yard', 'mound', 44, [560, 640]),
    hop('far', 'yard', [220, 280], [0.4, 0.6], true),
  ],
  entry: { piece: 'near', kind: 'ground' },
  exit: { piece: 'far', kind: 'ground' },
  exitDy: 0,
  sockets: [
    tip('near', 0.15),
    petals('pm', 'mound', 0.5, 2, 70),
    sleeper('s1', 'yard', [0.12, 0.18]),
    foe('f1', 'yard', [0.5, 0.56]),
    sleeper('s2', 'far', [0.5, 0.6]),
  ],
  mirrorable: true,
};

/** Sho/Ten: the sunken lawn (over its lip and down into it, a soft pit across it, a hop back up), a spider each side of the pit, a tiny cake */
export const sunkenLawn: SectionTemplate = {
  id: 'w5a-sunken-lawn',
  name: 'arena: the sunken lawn',
  archetypes: ['gauntlet'],
  phases: ['sho', 'ten'],
  difficulty: 6,
  weight: 2,
  pieces: [
    bank('near', [200, 260], { kind: 'start' }),
    up('lip', 'near', 40, [120, 150]),
    down('yardA', 'lip', 92, [420, 480]),
    hop('yardB', 'yardA', [340, 400], [0.45, 0.65], true),
    up('far', 'yardB', 52, [220, 280]),
  ],
  entry: { piece: 'near', kind: 'ground' },
  exit: { piece: 'far', kind: 'ground' },
  exitDy: 0,
  sockets: [
    tip('near', 0.2),
    prop('cake', 'yardA', [0.12, 0.18], W5A_TAGS.treat, { easy: 'drop', chance: 0.7 }),
    sleeper('s1', 'yardA', [0.4, 0.46]),
    foe('f1', 'yardB', [0.3, 0.4]),
    sleeper('s2', 'far', [0.5, 0.6]),
    petals('pf', 'far', [0.15, 0.2], 1),
  ],
  mirrorable: true,
};

/** Sho/Ten: the lawn under the high road (petals up top, the spiders below), a hop in, a mound out */
export const highRoadLawn: SectionTemplate = {
  id: 'w5a-high-road',
  name: 'arena: under the high road',
  archetypes: ['gauntlet'],
  phases: ['sho', 'ten'],
  difficulty: 6,
  weight: 2,
  pieces: [
    bank('near', [260, 320], { kind: 'start' }),
    hop('lawn', 'near', [560, 660], [0.5, 0.7], true),
    { key: 'road', shape: 'branch', w: [240, 300], place: { kind: 'over', on: 'lawn', at: [0.3, 0.38], dy: [-150, -135] }, main: false },
    up('mound', 'lawn', 44, [160, 200]),
    down('out', 'mound', 44, [200, 240]),
  ],
  entry: { piece: 'near', kind: 'ground' },
  exit: { piece: 'out', kind: 'ground' },
  exitDy: 0,
  sockets: [
    tip('near', 0.15),
    petals('road', 'road', 0.5, 3, 180),
    sleeper('s1', 'lawn', [0.12, 0.18]),
    foe('f1', 'lawn', [0.5, 0.58]),
    sleeper('s2', 'out', [0.5, 0.6]),
    petals('pm', 'mound', 0.5, 1),
  ],
  mirrorable: true,
};

/** Sho/Ten: a humming thread on the way in (a touch hums, and the spiders near come), a mound, spiders, a hop out */
export const threadLawn: SectionTemplate = {
  id: 'w5a-thread-lawn',
  name: 'arena: threads among the spiders',
  archetypes: ['gauntlet'],
  phases: ['sho', 'ten'],
  difficulty: 7,
  weight: 2,
  pieces: [
    bank('lawn', [220, 260], { kind: 'start' }),
    up('mound', 'lawn', 40, [160, 200]),
    down('yard', 'mound', 40, [560, 640]),
    hop('far', 'yard', [200, 260], [0.4, 0.6], true),
  ],
  entry: { piece: 'lawn', kind: 'ground' },
  exit: { piece: 'far', kind: 'ground' },
  exitDy: 0,
  sockets: [
    tip('lawn', 0.08),
    prop('thread', 'lawn', [0.5, 0.62], W5A_TAGS.thread),
    petals('pm', 'mound', 0.5, 1),
    sleeper('s1', 'yard', [0.12, 0.18]),
    foe('f1', 'yard', [0.5, 0.56]),
    sleeper('s2', 'far', [0.5, 0.6]),
    foe('f2', 'yard', [0.9, 0.95], { chance: 0.6 }),
  ],
  mirrorable: true,
};

/** Ten: the Butler's lawn (his tray: punch it away or hop him), a hop, then spiders, a mound out */
export const butlerLawn: SectionTemplate = {
  id: 'w5a-butler-lawn',
  name: "arena: the Butler's lawn",
  archetypes: ['gauntlet'],
  phases: ['ten', 'ketsu'],
  difficulty: 7,
  weight: 2,
  pieces: [
    bank('lawn', [300, 360], { kind: 'start' }),
    hop('yard', 'lawn', [560, 640], [0.5, 0.7], true),
    up('mound', 'yard', 48, [150, 190]),
    down('out', 'mound', 48, [280, 320]),
  ],
  entry: { piece: 'lawn', kind: 'ground' },
  exit: { piece: 'out', kind: 'ground' },
  exitDy: 0,
  sockets: [
    tip('lawn', 0.08),
    prop('butler', 'lawn', [0.5, 0.6], W5A_TAGS.host),
    sleeper('s1', 'yard', [0.12, 0.18]),
    foe('f1', 'yard', [0.5, 0.56]),
    petals('pm', 'mound', 0.5, 1),
    sleeper('s2', 'out', [0.4, 0.5]),
    foe('f2', 'out', [0.8, 0.86], { chance: 0.6 }),
  ],
  mirrorable: true,
};

/** Ten/Ketsu: a wide soft pit, a spider on the far lawn, a second hop, another spider */
export const pitLawn: SectionTemplate = {
  id: 'w5a-pit-lawn',
  name: 'arena: across the soft pits',
  archetypes: ['gauntlet'],
  phases: ['ten', 'ketsu'],
  difficulty: 8,
  weight: 2,
  pieces: [
    bank('near', [240, 300], { kind: 'start' }),
    hop('far', 'near', [520, 600], [0.65, 0.85], true),
    hop('far2', 'far', [320, 380], [0.45, 0.65], true),
  ],
  entry: { piece: 'near', kind: 'ground' },
  exit: { piece: 'far2', kind: 'ground' },
  exitDy: 0,
  sockets: [
    tip('near', 0.2),
    sleeper('s1', 'far', [0.2, 0.26]),
    foe('f1', 'far', [0.7, 0.78]),
    sleeper('s2', 'far2', [0.6, 0.7], { chance: 0.85 }),
  ],
  mirrorable: false,
};

/** Ten/Ketsu: the teapot's sleepy steam (go between puffs) by a mound, a hop, then spiders */
export const teapotLawn: SectionTemplate = {
  id: 'w5a-teapot-lawn',
  name: 'arena: steam and spiders',
  archetypes: ['gauntlet'],
  phases: ['ten', 'ketsu'],
  difficulty: 8,
  weight: 2,
  pieces: [
    bank('lawn', [300, 360], { kind: 'start' }),
    up('mound', 'lawn', 48, [200, 240]),
    hop('mound2', 'mound', [160, 200], [0.4, 0.55], true),
    down('yard', 'mound2', 48, [560, 640]),
    hop('out', 'yard', [180, 220], [0.35, 0.5], true),
  ],
  entry: { piece: 'lawn', kind: 'ground' },
  exit: { piece: 'out', kind: 'ground' },
  exitDy: 0,
  sockets: [
    tip('lawn', 0.08),
    prop('pot', 'lawn', [0.5, 0.62], W5A_TAGS.pot, { easy: 'drop' }),
    petals('pm', 'mound2', 0.5, 1),
    sleeper('s1', 'yard', [0.12, 0.18]),
    foe('f1', 'yard', [0.5, 0.56]),
    sleeper('s2', 'yard', [0.88, 0.94]),
  ],
  mirrorable: true,
};

/** Ketsu: THE QUEEN'S GARDEN, the arena itself, through its arch: two yards of spiders, a high road over the first, a mound between
 *  them (once a stage) */
export const queensGarden: SectionTemplate = {
  id: 'w5a-queens-garden',
  name: "arena: the Queen's garden",
  archetypes: ['gauntlet'],
  phases: ['ketsu'],
  difficulty: 10,
  maxPerStage: 1,
  weight: 2,
  pieces: [
    bank('gate', [170, 210], { kind: 'start' }),
    hop('yardA', 'gate', [600, 680], [0.45, 0.65], true),
    { key: 'road', shape: 'branch', w: [220, 280], place: { kind: 'over', on: 'yardA', at: [0.34, 0.42], dy: [-155, -140] }, main: false },
    up('mound', 'yardA', 48, [150, 190]),
    down('yardB', 'mound', 48, [600, 680]),
    hop('out', 'yardB', [200, 240], [0.4, 0.6], true),
  ],
  entry: { piece: 'gate', kind: 'ground' },
  exit: { piece: 'out', kind: 'ground' },
  exitDy: 0,
  sockets: [
    tip('gate', 0.1),
    prop('arch', 'gate', [0.5, 0.6], W5A_TAGS.gate),
    sleeper('s1', 'yardA', [0.1, 0.16]),
    foe('f1', 'yardA', [0.45, 0.52]),
    petals('road', 'road', 0.5, 3, 160),
    sleeper('s2', 'yardA', [0.86, 0.92]),
    petals('pm', 'mound', 0.5, 1),
    foe('f2', 'yardB', [0.3, 0.38]),
    sleeper('s3', 'yardB', [0.62, 0.68]),
    foe('f3', 'yardB', [0.92, 0.96], { chance: 0.8 }),
    prop('lamp', 'out', [0.4, 0.6], W5A_TAGS.lamp),
  ],
  mirrorable: false,
};

/** Ten/Ketsu: the tea lawn: a soft chair by the way (it tugs), a hop, spiders and a tiny cake, a mound out with one more spider */
export const teaLawn: SectionTemplate = {
  id: 'w5a-tea-lawn',
  name: 'arena: the tea lawn',
  archetypes: ['gauntlet'],
  phases: ['ten', 'ketsu'],
  difficulty: 9,
  weight: 2,
  pieces: [
    bank('lawn', [280, 340], { kind: 'start' }),
    hop('yard', 'lawn', [600, 680], [0.5, 0.7], true),
    up('mound', 'yard', 44, [150, 190]),
    down('out', 'mound', 44, [420, 480]),
  ],
  entry: { piece: 'lawn', kind: 'ground' },
  exit: { piece: 'out', kind: 'ground' },
  exitDy: 0,
  sockets: [
    tip('lawn', 0.08),
    prop('chair', 'lawn', [0.45, 0.55], W5A_TAGS.seat),
    sleeper('s1', 'yard', [0.1, 0.16]),
    foe('f1', 'yard', [0.45, 0.52]),
    prop('cake', 'yard', [0.68, 0.72], W5A_TAGS.treat, { easy: 'drop' }),
    sleeper('s2', 'yard', [0.9, 0.95]),
    petals('pm', 'mound', 0.5, 1),
    foe('f2', 'out', [0.6, 0.7], { chance: 0.8 }),
  ],
  mirrorable: true,
};

// ───────────────────────────── the two puzzle rooms ─────────────────────────────

/** the room's piece positions along a fixed-width floor, in px (the anchors are fractions of it: widths are settled first, §6) */
const along = (on: string, w: number) => (px: number, dy?: number) => ({ on, at: px / w, ...(dy === undefined ? {} : { dy }) });

/** DON'T EAT: the cake room. Floor 800 px; the room 700 x 500 (narrow enough for an upright phone at half scale) */
const CAKE_W = 800;
const cf = along('floor', CAKE_W);
export const cakeRoomSpec: LocalRoomSpec = {
  id: 'cake',
  left: cf(0),
  right: cf(700),
  above: 420,
  below: 80,
  pieces: [
    { kind: 'reset', id: 'post', at: cf(20) },
    // (by the door a beetle dozes by a crumb of cake: as he comes in it wakes, eats it and falls asleep where it ate. The room shows
    // what a cake does before he carries one, STAGE-RULES §3)
    { kind: 'item', id: 'crumb', variant: 'cake', at: cf(65) },
    { kind: 'beetle', id: 'dozer', at: cf(120), waitNear: 190 },
    { kind: 'source', id: 'stool', variant: 'cake', at: cf(340), look: 'pile' },
    { kind: 'item', id: 'cake', variant: 'cake', source: 'stool', for: 'plate' },
    { kind: 'plate', id: 'plate', at: cf(455) },
    { kind: 'beetle', id: 'beetle', at: cf(560) },
    // (open only while the plate is down: standing on it himself, it shuts as he steps off)
    { kind: 'gate', id: 'gate', at: cf(635), open: 'plate', look: 'woven' },
  ],
  exit: 'gate',
  beyond: cf(760),
  ground: ['floor'],
  tips: {
    enter: 'The plate opens the gate. One of you.', // (new, needs Matt's approval)
    hold: 'Cake! Set it down. Gently.', // (new, needs Matt's approval)
    open: 'Fast asleep on the plate. Through we go!', // (new, needs Matt's approval)
  },
};

export const cakeRoom: SectionTemplate = {
  id: 'w5a-room-cake',
  name: "puzzle room: don't eat (the cake plate)",
  archetypes: ['gauntlet'],
  phases: ['sho'],
  difficulty: 4,
  teaches: 'lure',
  maxPerStage: 1,
  weight: 2,
  // (fetch the cake, set it on the plate, wait for the beetle: about 14 s for a first-timer)
  extraSeconds: 14,
  pieces: [bank('floor', CAKE_W, { kind: 'start' })],
  entry: { piece: 'floor', kind: 'ground' },
  exit: { piece: 'floor', kind: 'ground' },
  exitDy: 0,
  sockets: [],
  room: cakeRoomSpec,
  mirrorable: false,
};

/**
 * DON'T DRINK: the tea room (Meeca's tea room's numbers, which her real-engine test proves, for Pokey: his double jump is 185 px, the
 * arch is 250). The floor (450), the lift's well a hop down (110), the floor past the Butler (470); the room 640 x 510.
 */
const TEA_A = 450;
const TEA_WELL = 110;
const TEA_B = 470;
const ta = along('floor', TEA_A);
const tb = along('floor2', TEA_B);
export const TEA_DROP = 60;
export const TEA_RISE = 250;
export const teaRoomSpec: LocalRoomSpec = {
  id: 'tea',
  left: ta(40),
  right: tb(120),
  above: 420,
  below: 90,
  pieces: [
    { kind: 'reset', id: 'post', at: ta(60) },
    { kind: 'basket', id: 'basket', at: ta(230), mouth: 110, need: 1, drop: 70 },
    // (the pot on its table by the lift: tipped from the lift's plank, its tea lifts him; tipped from the floor, the lift goes up alone)
    // (its trough's anchors are the section's own, by key, like every `at`: types.ts LocalPieceSpec and pipeline.ts placeRoom do not map
    // a trough or a teapot's `into` yet, reported to the architect; until then this room fails its check in a stage and is swapped out)
    { kind: 'teapot', id: 'pot', at: ta(405, -110), into: 'basket', trough: [ta(320, -122), ta(238, -116)] as LocalAnchor[] as unknown as Anchor[] },
    { kind: 'lift', id: 'lift', at: { on: 'well', at: 0.5, dy: -TEA_DROP }, w: TEA_WELL, rise: TEA_RISE, by: 'basket' },
    // (the Butler in his arch: it never opens, and it stands on the floor: nobody slips under it)
    { kind: 'gate', id: 'butler', at: tb(50), open: { any: [] }, h: TEA_RISE, look: 'butler' },
  ],
  exit: 'lift',
  beyond: tb(160),
  ground: ['floor', 'well'],
  tips: {
    enter: "He won't move. He's too polite.", // (new, needs Matt's approval)
    tipped: 'Tipped! Somebody should mop that.', // (new, needs Matt's approval)
    open: 'Up and over. Rude, but over.', // (new, needs Matt's approval)
  },
};

export const teaRoom: SectionTemplate = {
  id: 'w5a-room-tea',
  name: "puzzle room: don't drink (the Butler's arch)",
  archetypes: ['gauntlet'],
  phases: ['ten'],
  difficulty: 6,
  teaches: 'teapot-lift',
  maxPerStage: 1,
  weight: 2,
  // (onto the lift, tip the pot, ride up, over the arch: about 12 s for a first-timer)
  extraSeconds: 12,
  pieces: [
    bank('floor', TEA_A, { kind: 'start' }),
    bank('well', TEA_WELL, { kind: 'walk', after: 'floor', dy: TEA_DROP }),
    bank('floor2', TEA_B, { kind: 'walk', after: 'well', dy: -TEA_DROP }),
  ],
  entry: { piece: 'floor', kind: 'ground' },
  exit: { piece: 'floor2', kind: 'ground' },
  exitDy: 0,
  sockets: [],
  room: teaRoomSpec,
  mirrorable: false,
};

// ───────────────────────────── the set ─────────────────────────────

/** 5-9's building blocks: the gates, the beats that build to the arena, the arena */
export const W5_ARENA_SECTIONS: readonly SectionTemplate[] = [
  gardenGate, lanternLawn, orchidSteps, archRest, shrineGate, spiderLawn, sleeperSteps, stumpPair, sunkenLawn, highRoadLawn, threadLawn, butlerLawn, pitLawn, teapotLawn, queensGarden, teaLawn,
];
/** World 5's two puzzle-room sections */
export const W5_ROOM_SECTIONS: readonly SectionTemplate[] = [cakeRoom, teaRoom];

/** the arena's scenery props: the sanctuary's arches (the garden's gates) and its lanterns. Scenery, never a beat or a hazard */
export const W5A_PROPS: readonly PropDef[] = [
  { id: 'arch', tags: [W5A_TAGS.gate], w: 200, minApart: 600, looks: ['arch', 'arch2'] },
  { id: 'lantern', tags: [W5A_TAGS.lamp], w: 100, minApart: 300, looks: ['lantern', 'lantern2'] },
];

/** the arches' and lanterns' emitters: painted World 5 pieces standing behind the path (W5Extras.decor; w5PropsData.ts frames) */
export function w5ArenaEmitters(stage: number): Record<string, PropEmitter> {
  const piece = (w: number): PropEmitter => (f, p, out) => {
    const looks = p.looks ?? [p.id];
    // (the same spot always wears the same look: a retry keeps it, a new roll moves it)
    const n = looks[Math.abs(Math.round(f.x / 7)) % looks.length];
    (w5Of(out, stage).decor ??= []).push({ n, x: f.x, b: f.y, w });
  };
  return { arch: piece(190), lantern: piece(70) };
}

/**
 * A World 5 kit with 5-9's sections and the two rooms added, the arena's tip, its two scenery props and their emitters. The world's own
 * manifest (gen2/worlds/w5.ts) stays as it is: this is how the arena joins it until the lead folds the lists together (step G).
 */
export function withArena(kit: WorldKit, stage = 9): WorldKit {
  const M = kit.manifest;
  const have = new Set(M.sections.map((s) => s.id));
  const props = [...M.props, ...W5A_PROPS.filter((p) => !M.props.some((q) => q.id === p.id))];
  return {
    ...kit,
    emit: { ...w5ArenaEmitters(stage), ...(kit.emit ?? {}) },
    manifest: {
      ...M,
      props,
      sections: [...M.sections, ...[...W5_ARENA_SECTIONS, ...W5_ROOM_SECTIONS].filter((s) => !have.has(s.id))],
      tips: { ...W5A_TIPS, ...(M.tips ?? {}) },
    },
  };
}

/** World 5's kit for 5-9: the world's own (w5.ts) with the arena joined */
export const w5ArenaKit = (): WorldKit => withArena(w5Kit(9), 9);

/**
 * gen2/worlds/w5Sections — World 5's building blocks (DESIGN.md B9), the ground and stealth ones 5-7 "Don't Touch the Silk" needs, and
 * that 5-9 shares: garden runs, stumps, soft gaps, high roads over sleeping spiders, humming threads, cakes, the Butler and his cake
 * stand, soft chairs, silk sheets (and the Seamstress's), warm teapots and the tea table, closing orchids.
 *
 * Every section is a few seconds of play with its beats written in (a hop, a jump, a thread, a cake, a chair's tug, an animal) so no
 * stretch is quiet for long: on its own ground the gap between two beats is at most about 450 px (1.6 s for a quick player). Every
 * piece is placed by rule from the one before it (never at a fixed x, y), every rise is one hop, every gap is a share of the jump the
 * difficulty allows, every dip is a soft pit with a step out, and nothing crumbles. The high roads and low branches are `over`
 * pieces off the main route: the way to keep out of sight above the spiders, never the only way.
 *
 * The sockets' creatures: `spider` awake (it crouches, then rushes; threat 3) and `sleeper` (dozing until a thread hums; 1.5). A
 * section's creature sockets are filled from its node's threat budget (2 + 6 x heat, times the node's tension), so a Ki section
 * holds a sleeper at most, a Sho one a spider or two sleepers, a Ketsu one two or three.
 *
 * Teaching: everything here was taught in 5-1 to 5-5 (w5.ts lessons) except the warm teapots, which `w5-tea-table` shows first, on
 * open ground beside the table whose card promises the pot (no animal near): sections that `use` the pot come only after it. Dot's
 * first-time line for each piece is said by w5Play.ts where the piece first comes into view.
 */
import type { Phase, SectionPiece, SectionTemplate, Socket } from '../types.ts';

// ───────────────────────────── socket helpers ─────────────────────────────

type Opt = Partial<Socket>;
const petals = (id: string, on: string, t: Socket['t'], count = 2, span = 160, o: Opt = {}): Socket => ({ id, role: 'pickup', on, t, dn: 34, count, span, ...o });
const awake = (id: string, on: string, t: Socket['t'], o: Opt = {}): Socket => ({ id, role: 'enemy', on, t, allow: ['awake'], maxThreat: 3, easy: 'soften', ...o });
const sleeper = (id: string, on: string, t: Socket['t'], o: Opt = {}): Socket => ({ id, role: 'enemy', on, t, allow: ['doze'], maxThreat: 1.5, easy: 'soften', ...o });
const prop = (id: string, on: string, t: Socket['t'], allow: string[], o: Opt = {}): Socket => ({ id, role: 'prop', on, t, allow, ...o });
const thread = (id: string, on: string, t: Socket['t'], o: Opt = {}) => prop(id, on, t, ['thread', 'cover'], o);
const cake = (id: string, on: string, t: Socket['t'], o: Opt = {}) => prop(id, on, t, ['treat'], { easy: 'drop', ...o });
const chair = (id: string, on: string, t: Socket['t'], o: Opt = {}) => prop(id, on, t, ['seat'], o);
const flag = (on: string, t: Socket['t']): Socket => ({ id: 'flag', role: 'flag', on, t });
/** a petal on a stump's top (a reward for the hop) */
const stumpPetal = (on: string): Socket => petals(`p-${on}`, on, 0.5, 1);

const LIVE: Phase[] = ['sho', 'ten', 'ketsu'];
const HOT: Phase[] = ['ten', 'ketsu'];

/** a bank of garden (the section's start) */
const bank = (key: string, w: SectionPiece['w']): SectionPiece => ({ key, shape: 'bank', w, place: { kind: 'start' } });
/** a mossy stump standing on `on` (one hop, or `tall`: the second jump) */
const stump = (key: string, on: string, at: SectionPiece['w'], h: SectionPiece['w'], w: SectionPiece['w'] = [120, 160]): SectionPiece => ({ key, shape: 'block', w, place: { kind: 'on', on, at, h }, style: 'moss_stone' });
/** a branch over `on` (off the main route): a high road, a low branch over a sleeper */
const over = (key: string, on: string, at: SectionPiece['w'], dy: SectionPiece['w'], w: SectionPiece['w']): SectionPiece => ({ key, shape: 'branch', w, place: { kind: 'over', on, at, dy }, main: false });

// ───────────────────────────── start, rests, the shrine's approach ─────────────────────────────

/** a plain stretch of garden: petals, a flag, sometimes a soft chair to slide past */
const garden: SectionTemplate = {
  id: 'w5-garden',
  name: 'garden walk',
  archetypes: 'any',
  phases: ['start', 'rest', 'goal', 'ki'],
  difficulty: 1,
  pieces: [bank('bank', [640, 800]), stump('st', 'bank', [0.24, 0.32], [45, 55])],
  entry: { piece: 'bank', kind: 'ground' },
  exit: { piece: 'bank', kind: 'ground' },
  exitDy: 0,
  sockets: [
    petals('st', 'st', 0.5, 1),
    petals('petals', 'bank', [0.5, 0.56], 2, 100),
    chair('chair', 'bank', [0.64, 0.7], { phases: ['ki', 'rest', 'goal'] }),
    flag('bank', 0.86),
  ],
  mirrorable: true,
};

/** the lawn where the guests sat (the decor's visitors), a closing orchid to hop for its cup */
const lawn: SectionTemplate = {
  id: 'w5-lawn',
  name: 'guests lawn',
  archetypes: 'any',
  phases: ['start', 'rest', 'ki'],
  difficulty: 2,
  uses: ['orchid'],
  pieces: [bank('bank', [760, 900]), stump('a', 'bank', [0.14, 0.2], [45, 55]), stump('b', 'bank', [0.82, 0.88], [50, 60])],
  entry: { piece: 'bank', kind: 'ground' },
  exit: { piece: 'bank', kind: 'ground' },
  exitDy: 0,
  sockets: [
    petals('a', 'a', 0.5, 1),
    // (the orchid is a bonus: its cup over the grass; the inspector's route stays on the grass, so the stumps and the chair are the beats)
    prop('orchid', 'bank', [0.4, 0.46], ['orchid'], { chance: 0.7, phases: ['rest', 'ki'] }),
    chair('chair', 'bank', [0.58, 0.64], { phases: ['rest', 'ki'] }),
    flag('bank', 0.72),
    petals('b', 'b', 0.5, 1),
  ],
  mirrorable: true,
};

/**
 * The tea table set for two and its card ("Do sit. The pot is warm. It is always warm."), and the warm pot a few steps on: the first
 * teapot of the stage, on open ground with nothing else near, so its rattle and puff are seen before one can catch him anywhere hard
 */
const teaTable: SectionTemplate = {
  id: 'w5-tea-table',
  name: 'the tea table and its pot',
  archetypes: 'any',
  phases: ['ki', 'sho'],
  difficulty: 2,
  teaches: 'pot',
  maxPerStage: 1,
  pieces: [bank('bank', [950, 1100]), stump('st', 'bank', [0.38, 0.42], [45, 55], [100, 120])],
  entry: { piece: 'bank', kind: 'ground' },
  exit: { piece: 'bank', kind: 'ground' },
  exitDy: 0,
  sockets: [
    petals('petals', 'bank', 0.06, 2, 80),
    petals('st', 'st', 0.5, 1),
    { id: 'table', role: 'source', on: 'bank', t: [0.18, 0.22] },
    { id: 'pot', role: 'receptor', on: 'bank', t: [0.58, 0.64], link: 'table', allow: ['teapot'] },
    petals('after', 'bank', 0.8, 2, 100),
    chair('chair', 'bank', [0.9, 0.94]),
  ],
  mirrorable: false,
  extraSeconds: 2,
};

// ───────────────────────────── Ki: each piece shown on its own ─────────────────────────────

/** two stumps to hop, petals on top, a cake between them once it is busier */
const stumps: SectionTemplate = {
  id: 'w5-stumps',
  name: 'stumps',
  archetypes: 'any',
  phases: ['ki', 'sho', 'ten'],
  difficulty: 3,
  pieces: [bank('bank', [820, 1000]), stump('a', 'bank', [0.12, 0.25], [55, 80]), stump('b', 'bank', [0.62, 0.78], [60, 88])],
  entry: { piece: 'bank', kind: 'ground' },
  exit: { piece: 'bank', kind: 'ground' },
  exitDy: 0,
  sockets: [
    petals('pa', 'a', 0.5, 1),
    petals('pb', 'b', 0.5, 1),
    cake('cake', 'bank', [0.44, 0.5], { phases: LIVE, chance: 0.7 }),
    sleeper('foe', 'bank', [0.9, 0.95], { phases: HOT, chance: 0.6 }),
  ],
  mirrorable: true,
};

/** a humming thread low across the way, and the spiders asleep in its reach: hop it, then hop them */
const threadHop: SectionTemplate = {
  id: 'w5-thread-hop',
  name: 'thread and sleepers cover',
  archetypes: 'any',
  phases: ['ki', 'sho', 'ten'],
  difficulty: 3,
  uses: ['thread', 'doze'],
  pieces: [bank('bank', [900, 1100])],
  entry: { piece: 'bank', kind: 'ground' },
  exit: { piece: 'bank', kind: 'ground' },
  exitDy: 0,
  sockets: [
    petals('lead', 'bank', 0.1, 2, 90),
    thread('thread', 'bank', [0.24, 0.3]),
    sleeper('s1', 'bank', [0.52, 0.58]),
    petals('row', 'bank', 0.66, 2, 100),
    sleeper('s2', 'bank', [0.8, 0.86], { phases: LIVE, chance: 0.7 }),
    chair('chair', 'bank', [0.92, 0.96], { phases: ['ki'] }),
  ],
  mirrorable: true,
};

/** tiny cakes floating among the petals: jump them, never take them */
const cakePath: SectionTemplate = {
  id: 'w5-cake-path',
  name: 'cakes on the path',
  archetypes: 'any',
  phases: ['ki', 'sho', 'ten'],
  difficulty: 3,
  uses: ['cake'],
  pieces: [bank('bank', [880, 1000]), stump('st', 'bank', [0.52, 0.58], [50, 70])],
  entry: { piece: 'bank', kind: 'ground' },
  exit: { piece: 'bank', kind: 'ground' },
  exitDy: 0,
  sockets: [
    petals('lead', 'bank', 0.1, 2, 90),
    // (the first stays on Easy: Easy still shows what a cake is; the second is Normal's)
    prop('c1', 'bank', [0.28, 0.32], ['treat'], { easy: 'keep' }),
    petals('st', 'st', 0.5, 1),
    cake('c2', 'bank', [0.8, 0.84], { phases: LIVE }),
    sleeper('foe', 'bank', [0.93, 0.96], { phases: HOT, chance: 0.5 }),
  ],
  mirrorable: true,
};

/** soft chairs along the way, tugging as he passes: slide right on by */
const chairWalk: SectionTemplate = {
  id: 'w5-chair-walk',
  name: 'soft chairs',
  archetypes: 'any',
  phases: ['ki', 'sho', 'ten', 'rest'],
  difficulty: 2,
  uses: ['chair'],
  pieces: [bank('bank', [900, 1100])],
  entry: { piece: 'bank', kind: 'ground' },
  exit: { piece: 'bank', kind: 'ground' },
  exitDy: 0,
  sockets: [
    chair('ch1', 'bank', [0.18, 0.24]),
    petals('row', 'bank', 0.43, 3, 160),
    chair('ch2', 'bank', [0.62, 0.68]),
    cake('cake', 'bank', [0.84, 0.88], { phases: HOT }),
    flag('bank', 0.9),
  ],
  mirrorable: true,
};

/** a closing orchid or two over the grass, petals in their cups: hop up while one is open, a miss is a step back to the grass */
const orchidHop: SectionTemplate = {
  id: 'w5-orchid-hop',
  name: 'closing orchids',
  archetypes: 'any',
  phases: ['ki', 'sho'],
  difficulty: 3,
  uses: ['orchid'],
  pieces: [bank('bank', [850, 1000]), stump('st', 'bank', [0.5, 0.56], [50, 65])],
  entry: { piece: 'bank', kind: 'ground' },
  exit: { piece: 'bank', kind: 'ground' },
  exitDy: 0,
  sockets: [
    petals('lead', 'bank', 0.1, 2, 90),
    stumpPetal('st'),
    prop('o1', 'bank', [0.32, 0.38], ['orchid']),
    prop('o2', 'bank', [0.7, 0.76], ['orchid'], { chance: 0.8 }),
    chair('chair', 'bank', [0.86, 0.9]),
    sleeper('foe', 'bank', [0.95, 0.97], { phases: ['sho'], chance: 0.5 }),
  ],
  mirrorable: true,
};

/** a soft gap (a mossy floor and a step out under it), an awake spider on the far bank once it is busier */
const softGap: SectionTemplate = {
  id: 'w5-soft-gap',
  name: 'soft gap',
  archetypes: 'any',
  phases: ['ki', 'sho', 'ten', 'ketsu'],
  difficulty: 4,
  pieces: [
    bank('near', [320, 420]),
    { key: 'far', shape: 'bank', w: [680, 820], place: { kind: 'pit', after: 'near', jump: 'jump', share: [0.6, 0.9] }, landing: true },
    stump('st', 'far', [0.36, 0.42], [50, 70]),
  ],
  entry: { piece: 'near', kind: 'ground' },
  exit: { piece: 'far', kind: 'ground' },
  exitDy: 0,
  sockets: [
    petals('near', 'near', 0.4, 2, 90),
    stumpPetal('st'),
    awake('foe', 'far', [0.72, 0.84], { phases: LIVE }),
    cake('cake', 'far', [0.8, 0.86], { phases: ['ki'], easy: 'keep' }),
  ],
  mirrorable: false,
};

/** a step up onto a higher garden (one hop), a spider there */
const rise: SectionTemplate = {
  id: 'w5-rise',
  name: 'a step up',
  archetypes: 'any',
  phases: ['ki', 'sho', 'ten'],
  difficulty: 4,
  pieces: [bank('a', [480, 600]), { key: 'b', shape: 'bank', w: [720, 900], place: { kind: 'walk', after: 'a', dy: [-75, -55] } }],
  entry: { piece: 'a', kind: 'ground' },
  exit: { piece: 'b', kind: 'ground' },
  exitDy: -65,
  sockets: [
    petals('a', 'a', 0.35, 2, 100),
    cake('cake', 'a', [0.72, 0.78], { phases: LIVE, chance: 0.6 }),
    petals('b', 'b', 0.16, 1),
    thread('thread', 'b', [0.36, 0.42]),
    awake('foe', 'b', [0.7, 0.82], { phases: LIVE, chance: 0.8 }),
    chair('chair', 'b', [0.78, 0.84], { phases: ['ki'] }),
  ],
  mirrorable: false,
};

/** a step down into the lower garden: a thread at its foot and a sleeper in its reach */
const drop: SectionTemplate = {
  id: 'w5-drop',
  name: 'a step down',
  archetypes: 'any',
  phases: ['ki', 'sho', 'ten'],
  difficulty: 4,
  uses: ['thread', 'doze'],
  pieces: [bank('a', [480, 600]), { key: 'b', shape: 'bank', w: [720, 900], place: { kind: 'walk', after: 'a', dy: [55, 75] } }],
  entry: { piece: 'a', kind: 'ground' },
  exit: { piece: 'b', kind: 'ground' },
  exitDy: 65,
  sockets: [
    petals('a', 'a', 0.4, 2, 100),
    chair('chair', 'a', [0.7, 0.76]),
    thread('thread', 'b', [0.2, 0.26]),
    sleeper('s1', 'b', [0.5, 0.58]),
    petals('b', 'b', 0.72, 2, 80),
    cake('cake', 'b', [0.88, 0.92], { phases: LIVE, chance: 0.6 }),
  ],
  mirrorable: false,
};

// ───────────────────────────── Sho / Ten: the pieces together ─────────────────────────────

/** three stumps, the middle one only the second jump climbs */
const tallStumps: SectionTemplate = {
  id: 'w5-tall-stumps',
  name: 'tall stumps',
  archetypes: 'any',
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 6,
  needs: ['double'],
  uses: ['double'],
  pieces: [
    bank('bank', [950, 1100]),
    stump('a', 'bank', [0.08, 0.14], [60, 80]),
    stump('b', 'bank', [0.44, 0.5], [118, 138], [130, 160]),
    stump('c', 'bank', [0.8, 0.86], [60, 85]),
  ],
  entry: { piece: 'bank', kind: 'ground' },
  exit: { piece: 'bank', kind: 'ground' },
  exitDy: 0,
  sockets: [
    petals('pa', 'a', 0.5, 1),
    petals('pb', 'b', 0.5, 2, 60),
    petals('pc', 'c', 0.5, 1),
    thread('thread', 'bank', [0.3, 0.33], { phases: HOT, chance: 0.6 }),
    sleeper('foe', 'bank', [0.64, 0.68], { phases: HOT, chance: 0.6 }),
  ],
  mirrorable: true,
};

/** a high road of branches over a garden of sleepers and a thread: up out of sight, or down among them (cover) */
const highRoad: SectionTemplate = {
  id: 'w5-high-road',
  name: 'high road cover',
  archetypes: 'any',
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 6,
  uses: ['thread', 'doze'],
  pieces: [
    bank('bank', [1150, 1300]),
    over('step', 'bank', [0.07, 0.09], -92, 150),
    over('road', 'step', [0.72, 0.74], [-90, -78], [460, 560]),
  ],
  entry: { piece: 'bank', kind: 'ground' },
  exit: { piece: 'bank', kind: 'ground' },
  exitDy: 0,
  sockets: [
    // (up on the road: a cake among its petals and a thread at its far end, as 5-2's high roads, so the road is no quiet stroll)
    petals('road', 'road', 0.5, 4, 360),
    cake('rc', 'road', [0.3, 0.34], { phases: LIVE }),
    thread('rt', 'road', [0.7, 0.76]),
    // (down below: the thread and its sleepers, then an awake spider or a soft chair)
    thread('thread', 'bank', [0.28, 0.32]),
    sleeper('s1', 'bank', [0.44, 0.5]),
    sleeper('s2', 'bank', [0.6, 0.64], { phases: HOT, chance: 0.6 }),
    chair('chair', 'bank', [0.74, 0.78], { phases: ['sho'] }),
    awake('foe', 'bank', [0.82, 0.88], { phases: HOT, chance: 0.7 }),
    petals('after', 'bank', 0.94, 1),
  ],
  mirrorable: false,
};

/** the Butler on the path, his cake stand behind him: punch the tray away, or jump right over him */
const butler: SectionTemplate = {
  id: 'w5-butler',
  name: 'the Butler',
  archetypes: 'any',
  phases: ['sho', 'ten'],
  difficulty: 5,
  uses: ['butler'],
  pieces: [bank('bank', [950, 1100])],
  entry: { piece: 'bank', kind: 'ground' },
  exit: { piece: 'bank', kind: 'ground' },
  exitDy: 0,
  sockets: [
    petals('lead', 'bank', 0.08, 2, 90),
    chair('chair', 'bank', [0.18, 0.22]),
    { id: 'stand', role: 'source', on: 'bank', t: [0.36, 0.4] },
    { id: 'butler', role: 'receptor', on: 'bank', t: [0.66, 0.7], link: 'stand', allow: ['butler'] },
    petals('after', 'bank', 0.88, 2, 90),
  ],
  mirrorable: false,
  extraSeconds: 1,
};

/** a shimmering silk sheet by the way: don't stop to look; a thread after it once it is busier */
const sheetWalk: SectionTemplate = {
  id: 'w5-sheet-walk',
  name: 'silk sheet',
  archetypes: 'any',
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 5,
  uses: ['sheet'],
  pieces: [bank('bank', [1000, 1150]), stump('st', 'bank', [0.74, 0.8], [50, 70])],
  entry: { piece: 'bank', kind: 'ground' },
  exit: { piece: 'bank', kind: 'ground' },
  exitDy: 0,
  sockets: [
    petals('lead', 'bank', 0.1, 2, 90),
    prop('sheet', 'bank', [0.36, 0.4], ['sheet']),
    cake('cake', 'bank', [0.62, 0.65], { phases: ['sho'], chance: 0.7 }),
    stumpPetal('st'),
    thread('thread', 'bank', [0.9, 0.94], { phases: HOT }),
  ],
  mirrorable: true,
};

/** a thread at the lip of a soft gap, a spider awake on the far side */
const threadGap: SectionTemplate = {
  id: 'w5-thread-gap',
  name: 'thread at the gap',
  archetypes: 'any',
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 7,
  uses: ['thread'],
  pieces: [
    bank('near', [440, 540]),
    { key: 'far', shape: 'bank', w: [700, 880], place: { kind: 'pit', after: 'near', jump: 'jump', share: [0.7, 0.92] }, landing: true },
  ],
  entry: { piece: 'near', kind: 'ground' },
  exit: { piece: 'far', kind: 'ground' },
  exitDy: 0,
  sockets: [
    petals('near', 'near', 0.15, 1),
    thread('thread', 'near', [0.42, 0.48]),
    petals('far', 'far', 0.2, 2, 90),
    awake('foe', 'far', [0.58, 0.75]),
    sleeper('s2', 'far', [0.9, 0.94], { phases: ['ketsu'], chance: 0.6 }),
    chair('chair', 'far', [0.88, 0.92], { phases: ['sho', 'ten'] }),
  ],
  mirrorable: false,
};

/** a long row of sleepers in a thread's reach, a low branch over the first two to keep out of sight */
const sleeperRow: SectionTemplate = {
  id: 'w5-sleeper-row',
  name: 'sleepers row cover',
  archetypes: 'any',
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 6,
  uses: ['thread', 'doze'],
  pieces: [bank('bank', [1150, 1300]), over('low', 'bank', [0.3, 0.32], -96, [260, 320])],
  entry: { piece: 'bank', kind: 'ground' },
  exit: { piece: 'bank', kind: 'ground' },
  exitDy: 0,
  sockets: [
    thread('thread', 'bank', [0.14, 0.18]),
    sleeper('s1', 'bank', [0.36, 0.4]),
    petals('low', 'low', 0.5, 3, 200),
    cake('lc', 'low', [0.62, 0.68], { phases: LIVE }),
    sleeper('s2', 'bank', [0.54, 0.58]),
    sleeper('s3', 'bank', [0.72, 0.76], { phases: HOT, chance: 0.7 }),
    chair('chair', 'bank', [0.88, 0.92]),
  ],
  mirrorable: true,
};

/** a warm pot near the lip of a soft gap: wait out the puff, then jump */
const potGap: SectionTemplate = {
  id: 'w5-pot-gap',
  name: 'teapot at the gap',
  archetypes: 'any',
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 7,
  uses: ['pot'],
  pieces: [
    bank('near', [520, 620]),
    { key: 'far', shape: 'bank', w: [620, 800], place: { kind: 'pit', after: 'near', jump: 'jump', share: [0.6, 0.85] }, landing: true },
  ],
  entry: { piece: 'near', kind: 'ground' },
  exit: { piece: 'far', kind: 'ground' },
  exitDy: 0,
  sockets: [
    petals('near', 'near', 0.15, 1),
    prop('pot', 'near', [0.5, 0.56], ['pot']),
    petals('far', 'far', 0.25, 2, 90),
    awake('foe', 'far', [0.62, 0.78], { phases: HOT }),
    thread('thread', 'far', [0.6, 0.66], { phases: ['sho'] }),
  ],
  mirrorable: false,
};

/** two warm pots puffing out of step, a cake between them once it is busier */
const potPair: SectionTemplate = {
  id: 'w5-pot-pair',
  name: 'two teapots',
  archetypes: 'any',
  phases: ['sho', 'ten'],
  difficulty: 6,
  uses: ['pot'],
  pieces: [bank('bank', [1000, 1150])],
  entry: { piece: 'bank', kind: 'ground' },
  exit: { piece: 'bank', kind: 'ground' },
  exitDy: 0,
  sockets: [
    petals('lead', 'bank', 0.08, 2, 90),
    prop('p1', 'bank', [0.24, 0.28], ['pot']),
    cake('cake', 'bank', [0.47, 0.5], { phases: HOT }),
    prop('p2', 'bank', [0.7, 0.74], ['pot']),
    petals('after', 'bank', 0.9, 2, 90),
  ],
  mirrorable: true,
};

/** up a step onto a higher garden with a thread on it, and down again to an awake spider */
const steps: SectionTemplate = {
  id: 'w5-steps',
  name: 'up and over',
  archetypes: 'any',
  phases: ['sho', 'ten'],
  difficulty: 5,
  uses: ['thread'],
  pieces: [
    bank('a', [380, 480]),
    { key: 'b', shape: 'bank', w: [460, 560], place: { kind: 'walk', after: 'a', dy: [-70, -50] } },
    { key: 'c', shape: 'bank', w: [460, 560], place: { kind: 'walk', after: 'b', dy: [50, 70] } },
  ],
  entry: { piece: 'a', kind: 'ground' },
  exit: { piece: 'c', kind: 'ground' },
  exitDy: 0,
  sockets: [
    petals('a', 'a', 0.4, 2, 90),
    thread('thread', 'b', [0.45, 0.55]),
    petals('b', 'b', 0.85, 1),
    awake('foe', 'c', [0.5, 0.7], { phases: HOT, chance: 0.8 }),
    cake('cake', 'c', [0.4, 0.5], { phases: ['sho'] }),
  ],
  mirrorable: true,
};

/** a wide soft gap only two jumps cross, a thread just past the landing and a sleeper beyond */
const doubleGap: SectionTemplate = {
  id: 'w5-double-gap',
  name: 'wide gap',
  archetypes: 'any',
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 7,
  needs: ['double'],
  uses: ['double'],
  pieces: [
    bank('near', [320, 420]),
    { key: 'far', shape: 'bank', w: [700, 860], place: { kind: 'pit', after: 'near', jump: 'double', share: [0.65, 0.9] }, landing: true },
  ],
  entry: { piece: 'near', kind: 'ground' },
  exit: { piece: 'far', kind: 'ground' },
  exitDy: 0,
  sockets: [
    petals('near', 'near', 0.4, 1),
    thread('thread', 'far', [0.42, 0.48]),
    sleeper('s1', 'far', [0.66, 0.72]),
    petals('far', 'far', 0.88, 2, 90),
  ],
  mirrorable: false,
};

// ───────────────────────────── Ten / Ketsu: everything at once ─────────────────────────────

/** two silk sheets with a thread and a sleeper between: never stop, never touch */
const sheets: SectionTemplate = {
  id: 'w5-sheets',
  name: 'twilight sheets',
  archetypes: 'any',
  phases: ['ten', 'ketsu'],
  difficulty: 8,
  uses: ['sheet', 'thread', 'doze'],
  pieces: [bank('bank', [1350, 1500])],
  entry: { piece: 'bank', kind: 'ground' },
  exit: { piece: 'bank', kind: 'ground' },
  exitDy: 0,
  sockets: [
    prop('sh1', 'bank', [0.18, 0.22], ['sheet']),
    thread('thread', 'bank', [0.42, 0.46]),
    sleeper('s1', 'bank', [0.54, 0.58]),
    prop('sh2', 'bank', [0.76, 0.8], ['sheet']),
    petals('after', 'bank', 0.95, 1),
  ],
  mirrorable: true,
};

/** the Seamstress knitting her sheet (5-4's): slide on past before she looks up; an awake spider after her */
const seamstress: SectionTemplate = {
  id: 'w5-seamstress',
  name: 'the Seamstress',
  archetypes: 'any',
  phases: ['ten', 'ketsu'],
  difficulty: 7,
  uses: ['seamstress'],
  maxPerStage: 1,
  pieces: [bank('bank', [1100, 1250])],
  entry: { piece: 'bank', kind: 'ground' },
  exit: { piece: 'bank', kind: 'ground' },
  exitDy: 0,
  sockets: [
    petals('lead', 'bank', 0.08, 2, 90),
    prop('seam', 'bank', [0.36, 0.4], ['seamstress']),
    thread('thread', 'bank', [0.68, 0.72]),
    awake('foe', 'bank', [0.86, 0.92], { phases: ['ketsu'], chance: 0.7 }),
  ],
  mirrorable: false,
  extraSeconds: 1,
};

/** the finish: a thread, a sleeper under a low branch, the Butler and his stand, a chair, an awake spider */
const gauntlet: SectionTemplate = {
  id: 'w5-gauntlet',
  name: 'the whole garden cover',
  archetypes: 'any',
  phases: ['ketsu'],
  difficulty: 9,
  uses: ['thread', 'doze', 'butler', 'chair'],
  maxPerStage: 2,
  pieces: [bank('bank', [1400, 1550]), over('low', 'bank', [0.17, 0.19], -96, [260, 300])],
  entry: { piece: 'bank', kind: 'ground' },
  exit: { piece: 'bank', kind: 'ground' },
  exitDy: 0,
  sockets: [
    thread('thread', 'bank', [0.1, 0.13]),
    sleeper('s1', 'bank', [0.24, 0.27]),
    petals('low', 'low', 0.5, 3, 180),
    { id: 'stand', role: 'source', on: 'bank', t: [0.38, 0.4] },
    { id: 'butler', role: 'receptor', on: 'bank', t: [0.56, 0.58], link: 'stand', allow: ['butler'] },
    chair('chair', 'bank', [0.72, 0.75], { chance: 0.7 }),
    awake('foe', 'bank', [0.88, 0.93]),
  ],
  mirrorable: false,
  extraSeconds: 1,
};

/** a soft gap after a step up: the stumps, the gap and a spider in one breath */
const stumpGap: SectionTemplate = {
  id: 'w5-stump-gap',
  name: 'stump and gap',
  archetypes: 'any',
  phases: ['ten', 'ketsu'],
  difficulty: 8,
  pieces: [
    bank('near', [520, 620]),
    stump('st', 'near', [0.3, 0.4], [60, 85]),
    { key: 'far', shape: 'bank', w: [700, 860], place: { kind: 'pit', after: 'near', jump: 'jump', share: [0.75, 0.95] }, landing: true },
  ],
  entry: { piece: 'near', kind: 'ground' },
  exit: { piece: 'far', kind: 'ground' },
  exitDy: 0,
  sockets: [
    petals('st', 'st', 0.5, 1),
    cake('cake', 'near', [0.82, 0.86], { chance: 0.6 }),
    petals('far', 'far', 0.18, 2, 80),
    awake('foe', 'far', [0.48, 0.62]),
    sleeper('s2', 'far', [0.86, 0.92], { chance: 0.6 }),
  ],
  mirrorable: false,
};

// ───────────────────────────── more of the world (toward ~30: 5-7, 5-9 and the later stages share them) ─────────────────────────────

/** creatures wrapped in silk, hanging by the path: punch them open (5-5's), a thread between them */
const cocoonRow: SectionTemplate = {
  id: 'w5-cocoon-row',
  name: 'cocoons by the path',
  archetypes: 'any',
  phases: ['ki', 'sho', 'ten'],
  difficulty: 4,
  uses: ['cocoon'],
  pieces: [bank('bank', [950, 1100])],
  entry: { piece: 'bank', kind: 'ground' },
  exit: { piece: 'bank', kind: 'ground' },
  exitDy: 0,
  sockets: [
    petals('lead', 'bank', 0.08, 2, 80),
    prop('c1', 'bank', [0.24, 0.28], ['cocoon']),
    thread('thread', 'bank', [0.46, 0.5], { phases: LIVE }),
    chair('chair', 'bank', [0.46, 0.5], { phases: ['ki'] }),
    prop('c2', 'bank', [0.68, 0.72], ['cocoon'], { chance: 0.8 }),
    sleeper('foe', 'bank', [0.88, 0.92], { phases: LIVE, chance: 0.6 }),
  ],
  mirrorable: true,
};

/** a warm pot puffing between two stumps: hop up, wait out the puff on top, hop on */
const potStumps: SectionTemplate = {
  id: 'w5-pot-stumps',
  name: 'teapot between stumps',
  archetypes: 'any',
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 6,
  uses: ['pot'],
  pieces: [bank('bank', [950, 1100]), stump('a', 'bank', [0.16, 0.22], [55, 80]), stump('b', 'bank', [0.66, 0.72], [60, 85])],
  entry: { piece: 'bank', kind: 'ground' },
  exit: { piece: 'bank', kind: 'ground' },
  exitDy: 0,
  sockets: [
    stumpPetal('a'),
    prop('pot', 'bank', [0.44, 0.48], ['pot']),
    stumpPetal('b'),
    cake('cake', 'b', 0.5, { phases: HOT, dn: 0 }),
    awake('foe', 'bank', [0.88, 0.93], { phases: HOT, chance: 0.6 }),
  ],
  mirrorable: true,
};

/** a soft chair at the lip of a soft gap (5-1's twist): its tug at the very spot he jumps from */
const chairGap: SectionTemplate = {
  id: 'w5-chair-gap',
  name: 'chair at the lip',
  archetypes: 'any',
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 6,
  uses: ['chair'],
  pieces: [
    bank('near', [480, 580]),
    { key: 'far', shape: 'bank', w: [680, 840], place: { kind: 'pit', after: 'near', jump: 'jump', share: [0.65, 0.9] }, landing: true },
  ],
  entry: { piece: 'near', kind: 'ground' },
  exit: { piece: 'far', kind: 'ground' },
  exitDy: 0,
  sockets: [
    petals('near', 'near', 0.2, 2, 80),
    chair('chair', 'near', [0.66, 0.72]),
    petals('far', 'far', 0.2, 2, 80),
    thread('thread', 'far', [0.44, 0.5]),
    sleeper('s1', 'far', [0.66, 0.72], { phases: LIVE }),
    awake('foe', 'far', [0.86, 0.92], { phases: ['ketsu'], chance: 0.6 }),
  ],
  mirrorable: false,
};

/** the Butler on the far side of a gap, his cake stand on the near side: he holds out the tray as you land */
const butlerGap: SectionTemplate = {
  id: 'w5-butler-gap',
  name: 'the Butler past the gap',
  archetypes: 'any',
  phases: ['ten', 'ketsu'],
  difficulty: 7,
  uses: ['butler'],
  pieces: [
    bank('near', [480, 560]),
    { key: 'far', shape: 'bank', w: [760, 900], place: { kind: 'pit', after: 'near', jump: 'jump', share: [0.6, 0.85] }, landing: true },
  ],
  entry: { piece: 'near', kind: 'ground' },
  exit: { piece: 'far', kind: 'ground' },
  exitDy: 0,
  sockets: [
    petals('near', 'near', 0.15, 1),
    { id: 'stand', role: 'source', on: 'near', t: [0.42, 0.48] },
    { id: 'butler', role: 'receptor', on: 'far', t: [0.36, 0.42], link: 'stand', allow: ['butler'] },
    petals('far', 'far', 0.62, 2, 80),
    thread('thread', 'far', [0.78, 0.82]),
    sleeper('s1', 'far', [0.92, 0.95], { chance: 0.6 }),
  ],
  mirrorable: false,
  extraSeconds: 1,
};

/** stumps climbing like stairs, a thread strung low before each: hop the thread, hop the stump */
const threadStairs: SectionTemplate = {
  id: 'w5-thread-stairs',
  name: 'thread stairs',
  archetypes: 'any',
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 6,
  uses: ['thread', 'doze'],
  pieces: [
    bank('bank', [1050, 1200]),
    stump('a', 'bank', [0.2, 0.24], [50, 60]),
    stump('b', 'bank', [0.5, 0.54], [70, 88]),
    stump('c', 'bank', [0.8, 0.84], [55, 70]),
  ],
  entry: { piece: 'bank', kind: 'ground' },
  exit: { piece: 'bank', kind: 'ground' },
  exitDy: 0,
  sockets: [
    thread('t1', 'bank', [0.1, 0.12]),
    stumpPetal('a'),
    thread('t2', 'bank', [0.38, 0.41]),
    stumpPetal('b'),
    sleeper('s1', 'bank', [0.66, 0.7], { phases: LIVE }),
    stumpPetal('c'),
    thread('t3', 'bank', [0.94, 0.96], { phases: HOT, chance: 0.6 }),
  ],
  mirrorable: true,
};

/** a bower to rest in: the guests who sat (the decor), a mossy stump, a soft chair to slide past, the flag */
const bower: SectionTemplate = {
  id: 'w5-bower',
  name: 'rest bower',
  archetypes: 'any',
  phases: ['rest', 'goal', 'start'],
  difficulty: 1,
  pieces: [bank('bank', [700, 820]), stump('st', 'bank', [0.2, 0.26], [45, 55])],
  entry: { piece: 'bank', kind: 'ground' },
  exit: { piece: 'bank', kind: 'ground' },
  exitDy: 0,
  sockets: [
    stumpPetal('st'),
    chair('chair', 'bank', [0.52, 0.58], { phases: ['rest', 'goal'] }),
    petals('row', 'bank', 0.72, 2, 80),
    flag('bank', 0.84),
  ],
  mirrorable: true,
};

/** World 5's building blocks (5-7's ground and stealth set; 5-9's arena helper adds its gates) */
export const W5_SECTIONS: SectionTemplate[] = [
  garden,
  lawn,
  teaTable,
  stumps,
  threadHop,
  cakePath,
  chairWalk,
  orchidHop,
  softGap,
  rise,
  drop,
  tallStumps,
  highRoad,
  butler,
  sheetWalk,
  threadGap,
  sleeperRow,
  potGap,
  potPair,
  steps,
  doubleGap,
  sheets,
  seamstress,
  gauntlet,
  stumpGap,
  cocoonRow,
  potStumps,
  chairGap,
  butlerGap,
  threadStairs,
  bower,
];

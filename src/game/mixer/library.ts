/**
 * The engine's library: every piece kind and every idea the mixer can lay, with what it is, where it belongs and what it asks of the
 * player (Matt, 11-05: "this engine is very able to understand the pieces, understand how to use the pieces, and then know the rules
 * when it's creating"). The spec check, the element gate and the node planner read this; the mixer lays the ideas named here.
 */
import type { Content, Element, Move } from './spec.ts';

/** a piece kind: what it is drawn as, the element it belongs to, and where it may stand */
export interface PieceKind {
  /** the element it belongs to */
  element: Element;
  /** what it stands on: the ground (its foot on a bank or the floor), a trunk or post (in a tree), the water's surface, or itself */
  stands: 'ground' | 'trunk' | 'water' | 'self';
  /** what it is, in a line (for the menu and the report) */
  what: string;
  /** the worlds (themes) it belongs to: a stage never draws a piece from another world's set (Matt, 11-05: "I don't want to use a lava
   *  pit or lava stones in the forest") */
  worlds: Theme[];
  /** whether it may stand free of its footing where the stage's look allows (Matt, 11-05: "I don't mind having certain floating
   *  objects... too much junk... is harder to understand"): a log or a stone may float; water never leaves the water */
  mayFloat: boolean;
}

/** the worlds' themes, the art sets their pieces come from */
export type Theme = 'forest' | 'river' | 'cavern' | 'canopy-high' | 'swamp' | 'lava' | 'ice' | 'ruins' | 'sky' | 'storm';

// (the designer's element table, 11-05: what each kind is and what it rests on; `mayFloat` is Matt's: some free-standing pieces read
// better than a forest of supports, so a log, a stone, a bough or a ledge may float where the stage's look allows; water never leaves
// the water, and the floor is the floor)
const W1: Theme[] = ['forest', 'river', 'canopy-high', 'swamp'];
export const PIECES: Record<string, PieceKind> = {
  bank: { element: 'ground', stands: 'self', what: 'a bank of earth, the floor', worlds: W1, mayFloat: false },
  stone: { element: 'ground', stands: 'ground', what: 'a mossy boulder, a small rise on a bank\'s end', worlds: W1, mayFloat: false },
  log: { element: 'ground', stands: 'ground', what: 'a fallen log on the floor, or on a stump in a ground fork', worlds: W1, mayFloat: true },
  mushroom: { element: 'ground', stands: 'ground', what: 'a bounce mushroom on its perch', worlds: W1, mayFloat: false },
  // (tagged from its art: World 7's crumble tile, src/assets/w7/crumble.webp, a carved stone slab with roots through it, so ground,
  // per the designer's rule; 1-5 lays it in the air on trunks, a named breach waiting on the designer's ruling)
  crumble: { element: 'ground', stands: 'ground', what: 'a crumbling carved stone ledge', worlds: ['ruins'], mayFloat: false },
  branch: { element: 'tree', stands: 'trunk', what: 'a bough on a kapok', worlds: W1, mayFloat: true },
  creaky: { element: 'tree', stands: 'trunk', what: 'a creaky limb that gives way', worlds: W1, mayFloat: false },
  bridge: { element: 'tree', stands: 'trunk', what: 'a rope bridge between posts', worlds: W1, mayFloat: false },
  lily: { element: 'water', stands: 'water', what: 'a lily pad on the water', worlds: ['forest', 'river', 'swamp'], mayFloat: false },
  reed: { element: 'water', stands: 'water', what: 'a reed isle in the water', worlds: ['forest', 'river', 'swamp'], mayFloat: false },
};

/** an idea: a short run of pieces with one job, the unit a node draws from */
export interface Idea {
  /** what it is made of (the spec's content mix draws ideas by these) */
  content: Content;
  /** the element it lives in */
  element: Element;
  /** the moves a player needs to get through it */
  needs: Move[];
  /** the move it teaches, when it is a teach */
  teaches?: Move;
  /** a floor idea: a canopy may be laid over it (1-5's canopies), a burst after a node's own idea draws one */
  floor?: boolean;
  /** what it is, in a line */
  what: string;
  /** the worlds it belongs to (its pieces' worlds, narrowed where the idea itself is a world's own) */
  worlds?: Theme[];
  /** how a burst idea lays: the mixer reads this, it holds no recipe of its own (an idea without one is a shape the mixer builds) */
  lay?: BurstRecipe;
}

/** a burst idea's recipe: pieces in a row, each a step up or down from the last, across a gap the dial sizes */
export interface BurstRecipe {
  /** the piece kinds, turning every 2 pieces; several lists: one is picked for each burst */
  kinds: string[] | string[][];
  /** on Easy, other kinds (the creaky limbs first: creaky holds 15% of Easy's landings, the designer) */
  easyKinds?: string[];
  /** the steps between landings, px (otherwise the world kit's) */
  steps?: number[];
  /** Easy's steps, where they differ */
  easySteps?: number[];
  /** how many pieces, where the idea fixes it (otherwise the node's burst count) */
  n?: { normal: number; easy: number };
  /** this many fewer than the node's burst count (a stair whose top is its own piece) */
  nLess?: number;
  /** a fixed gap, px (0: touching, a walk) */
  gap?: number;
  /** its logs stand on stumps (a ground fork's raised road) */
  stumps?: boolean;
  /** a second burst laid on from its end (a stair's bridge at the top) */
  then?: BurstRecipe;
}

export const IDEAS: Record<string, Idea> = {
  'floor walk': { content: 'jumps', element: 'ground', needs: ['run'], teaches: 'run', what: 'low banks touching, small steps, no gap', lay: { kinds: ['bank', 'log'], steps: [30, -30], gap: 0 } },
  'bank hops': { content: 'jumps', element: 'ground', needs: ['jump'], teaches: 'jump', floor: true, what: 'hops between banks, stones and logs', lay: { kinds: [['bank', 'stone', 'log'], ['log', 'stone', 'bank'], ['stone', 'bank', 'log']] } },
  'stump hop': { content: 'jumps', element: 'ground', needs: ['jump'], floor: true, what: 'hops over stones, banks and logs, bigger steps', lay: { kinds: ['stone', 'bank', 'log'], steps: [40, -40, -70, 30, -30] } },
  'bank walk': { content: 'jumps', element: 'ground', needs: ['run'], what: 'a rest: a long bank and a short hop' },
  'bounce mound': { content: 'bounces', element: 'ground', needs: ['bounce'], teaches: 'bounce', what: 'a perched mushroom bounces him onto a mound' },
  'stump tops': { content: 'jumps', element: 'ground', needs: ['jump'], what: 'logs on stumps, a ground fork\'s high road', lay: { kinds: ['log', 'log'], steps: [30, -30, 40, -40], stumps: true } },
  'log jam': { content: 'jumps', element: 'ground', needs: ['jump'], floor: true, what: 'logs at two heights on stumps', lay: { kinds: ['log'], steps: [50, -50, 40, -40], stumps: true } },
  'double gap': { content: 'jumps', element: 'ground', needs: ['double'], teaches: 'double', what: 'gaps too wide for a single jump, a catch under each' },
  'lily-pad hop': { content: 'water', element: 'water', needs: ['jump'], floor: true, what: 'lily pads and logs across the creek', lay: { kinds: ['lily', 'log'], steps: [30, -30, 40, -40] } },
  'reed isles': { content: 'water', element: 'water', needs: ['jump'], what: 'reed isles and lily pads', lay: { kinds: ['reed', 'lily'], steps: [30, -30, 40, -40] } },
  'bounce up': { content: 'bounces', element: 'tree', needs: ['bounce'], teaches: 'bounce', what: 'a mushroom up into the boughs' },
  'the climb': { content: 'climbing', element: 'tree', needs: ['climb'], teaches: 'climb', what: 'a climbing vine up to a bough' },
  'bough stair': { content: 'climbing', element: 'tree', needs: ['jump'], what: 'boughs stepping up, a rope bridge at the top', lay: { kinds: ['branch', 'log'], nLess: 1, steps: [50, 60, 70], easySteps: [30, 40], then: { kinds: ['bridge'], n: { normal: 1, easy: 1 }, steps: [30, -30] } } },
  'bough hops': { content: 'jumps', element: 'tree', needs: ['jump'], what: 'hops between boughs and logs in the trees', lay: { kinds: ['branch', 'log'] } },
  'double chain': { content: 'jumps', element: 'tree', needs: ['double'], what: 'rising double jumps bough to bough, catches below' },
  'top branch': { content: 'jumps', element: 'tree', needs: ['run'], what: 'one long high branch' },
  'bridge span': { content: 'jumps', element: 'tree', needs: ['jump', 'creaky'], what: 'rope bridges with creaky limbs between', lay: { kinds: ['bridge', 'creaky'], easyKinds: ['creaky', 'bridge'], steps: [30, -30, 40, -40] } },
  'snap teach': { content: 'breakable', element: 'tree', needs: ['jump'], teaches: 'creaky', what: 'creaky twigs low over a long bank' },
  'snap dash': { content: 'breakable', element: 'tree', needs: ['creaky'], what: 'a run of creaky limbs and branches', lay: { kinds: ['creaky', 'branch'], n: { normal: 6, easy: 5 } } },
  'creaky boughs': { content: 'breakable', element: 'tree', needs: ['creaky'], what: 'branches and creaky limbs', lay: { kinds: ['branch', 'creaky'], easyKinds: ['creaky', 'branch'] } },
  'crumbling ledge': { content: 'breakable', element: 'ground', needs: ['jump'], teaches: 'crumble', what: 'crumbling ledges and branches' },
  'rotten-branch drop': { content: 'breakable', element: 'tree', needs: ['creaky'], what: 'a drop down through a creaky limb to a catch' },
  'push block': { content: 'hazards', element: 'ground', needs: ['run'], what: 'a log to push (out of the mixer for now)' },
};

/** the piece kinds each idea lays (the theme check follows an idea to its pieces; library-check holds it to the mixer) */
export const IDEA_KINDS: Record<string, string[]> = {
  'floor walk': ['bank', 'log'], 'bank hops': ['bank', 'stone', 'log'], 'stump hop': ['stone', 'bank', 'log'], 'bank walk': ['bank', 'log'],
  'bounce mound': ['bank', 'mushroom', 'log'], 'stump tops': ['log'], 'log jam': ['log'], 'double gap': ['bank', 'log'],
  'lily-pad hop': ['lily', 'log'], 'reed isles': ['reed', 'lily'], 'bounce up': ['bank', 'mushroom', 'branch', 'bridge'],
  'the climb': ['bank', 'branch'], 'bough stair': ['branch', 'log', 'bridge'], 'bough hops': ['branch', 'log'],
  'double chain': ['bank', 'branch', 'log', 'bridge'], 'top branch': ['branch'], 'bridge span': ['bridge', 'creaky'],
  'snap teach': ['bank', 'creaky'], 'snap dash': ['creaky', 'branch'], 'creaky boughs': ['branch', 'creaky'], 'crumbling ledge': ['crumble', 'branch'],
  'rotten-branch drop': ['branch', 'creaky'], 'push block': ['log'],
};

/** contents the menu names that the library has no idea for yet: a spec that asks for them is told so, plainly */
export const COMING: Partial<Record<Content, string>> = {
  enemies: 'the mixer lays no animals yet',
  hazards: 'thorns and costly pits are not in the library yet',
};

/** the shape ideas' numbers (the mixer builds each shape's geometry from these; it holds none of its own). Ranges are [min, max] px,
 *  drawn per roll; offsets are from the shape's first bank (dx along, dy up negative) */
export const SHAPES = {
  // (expose, then validate: a creaky twig low over a long bank, then two over safe ground; nothing to fall into; 600 px, the twigs close
  // together: the designer's ruling on the fun gate. Low, higher, low: each a step up or down from the last, never flat)
  'snap teach': { bank: 600, twigs: [[110, -40, 150], [280, -75, 140], [440, -40, 130]] as ReadonlyArray<readonly [number, number, number]> },
  // (the old 1-1's high road: a mushroom on the ground, branches 170-200 px over it, proven there)
  'bounce up': { pad: 300, mushDx: 170, mushW: 70, rise: [170, 200], boughDx: 210, boughW: [220, 280], tail: ['branch', 'bridge'], tailN: [2, 4] },
  // (CP2 cp2-climb.out: a bank, a climbing vine at its end, a bough 170-300 px up out from it, on the bough in 1.2-2.4 s)
  'the climb': { bank: 260, rise: [170, 300], vineDx: 2, vineTop: 30, boughDx: 13, boughW: [240, 300] },
  // (a mushroom on a perch 46 px over the bank near its end lifts him onto a mound 170-200 px up, 30 px past the bank's end: too high for a
  // plain jump, so the bounce is the way; the walk past it never bounces; the mound steps back down to the floor)
  'bounce mound': { pad: 300, perchBack: 125, perchUp: 46, perchW: 80, mushBack: 120, mushW: 70, moundDx: 30, rise: [170, 200], moundW: [240, 300], tail: ['bank', 'log'], tailN: 2, tailSteps: [-40, -50] },
  // (expose then validate: three gaps each too wide for a single jump and inside a double's reach, flat, a catch branch under each)
  'double gap': { bank: [240, 300], count: 3, landW: [220, 300], middle: 'log', catchBack: 30, catchDrop: 60, catchExtra: 80 },
  // (three or four rising doubles, bough to bough, a catch bough under each gap; kinds and sizes turn bough by bough: the gate's
  // "something new")
  'double chain': { bank: [220, 260], count: [3, 4], rise: [90, 120], kinds: ['branch', 'log', 'bridge', 'branch'], widths: [[120, 145], [310, 360], [170, 230], [120, 145]] as ReadonlyArray<readonly [number, number]>, catchBack: 30, catchDrop: 60, catchExtra: 80 },
  // (one long top branch, the backdrop wide open)
  'top branch': { w: [600, 700] },
  // (each slab spans a gap between two banks, both its ends on them, set 25 px down into the bank ends; between two slabs a plain hop with a
  // step up or down, never a long flat run of slab and bank: the designer's ruling (b), 11-05)
  'crumbling ledge': { bank: [220, 280], count: [2, 3], easyCount: 2, hopSteps: [40, -40, 50, -50], gap: [90, 130], back: 30, setIn: 25, overlap: 60, landW: [200, 280] },
  // (a rest: on Normal a long bank and a medium stone, an easy step between; on Easy two pieces of about 2 s each with a short log stump
  // and a petal arc between them, play and not dead time: the designer's third fix for Easy's density)
  'bank walk': { easy: { first: 620, mid: 130, midSteps: [30, -30], midGap: 50, second: 620, petals: 5 }, normal: { bank: [300, 360], stone: [180, 230] } },
  // (CP2: branch, then a creaky limb 40 down after a 60 gap, a catch branch 150 down after 120, a bank 120 down after 80; 421-667 ms; the
  // way's band opens 330 px under the drop for it)
  'rotten-branch drop': { room: 330, drops: [['creaky', -40, 60], ['catch', -150, 120], ['bank', -120, 80]] as ReadonlyArray<readonly [string, number, number]> },
} as const;

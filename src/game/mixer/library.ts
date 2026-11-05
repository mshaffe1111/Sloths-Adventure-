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
  stone: { element: 'ground', stands: 'ground', what: 'a mossy boulder, a small rise on a bank\'s end', worlds: W1, mayFloat: true },
  log: { element: 'ground', stands: 'ground', what: 'a fallen log on the floor, or on a stump in a ground fork', worlds: W1, mayFloat: true },
  mushroom: { element: 'ground', stands: 'ground', what: 'a bounce mushroom on its perch', worlds: W1, mayFloat: false },
  // (tagged from its art: World 7's crumble tile, src/assets/w7/crumble.webp, a carved stone slab with roots through it, so ground,
  // per the designer's rule; 1-5 lays it in the air on trunks, a named breach waiting on the designer's ruling)
  crumble: { element: 'ground', stands: 'ground', what: 'a crumbling carved stone ledge', worlds: ['forest', 'ruins'], mayFloat: true },
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
}

export const IDEAS: Record<string, Idea> = {
  'floor walk': { content: 'jumps', element: 'ground', needs: ['run'], teaches: 'run', what: 'low banks touching, small steps, no gap' },
  'bank hops': { content: 'jumps', element: 'ground', needs: ['jump'], teaches: 'jump', floor: true, what: 'hops between banks, stones and logs' },
  'stump hop': { content: 'jumps', element: 'ground', needs: ['jump'], floor: true, what: 'hops over stones, banks and logs, bigger steps' },
  'bank walk': { content: 'jumps', element: 'ground', needs: ['run'], what: 'a rest: a long bank and a short hop' },
  'bounce mound': { content: 'bounces', element: 'ground', needs: ['bounce'], teaches: 'bounce', what: 'a perched mushroom bounces him onto a mound' },
  'stump tops': { content: 'jumps', element: 'ground', needs: ['jump'], what: 'logs on stumps, a ground fork\'s high road' },
  'log jam': { content: 'jumps', element: 'ground', needs: ['jump'], floor: true, what: 'logs at two heights on stumps' },
  'double gap': { content: 'jumps', element: 'ground', needs: ['double'], teaches: 'double', what: 'gaps too wide for a single jump, a catch under each' },
  'lily-pad hop': { content: 'water', element: 'water', needs: ['jump'], floor: true, what: 'lily pads and logs across the creek' },
  'reed isles': { content: 'water', element: 'water', needs: ['jump'], what: 'reed isles and lily pads' },
  'bounce up': { content: 'bounces', element: 'tree', needs: ['bounce'], teaches: 'bounce', what: 'a mushroom up into the boughs' },
  'the climb': { content: 'climbing', element: 'tree', needs: ['climb'], teaches: 'climb', what: 'a climbing vine up to a bough' },
  'bough stair': { content: 'climbing', element: 'tree', needs: ['jump'], what: 'boughs stepping up, a rope bridge at the top' },
  'bough hops': { content: 'jumps', element: 'tree', needs: ['jump'], what: 'hops between boughs and logs in the trees' },
  'double chain': { content: 'jumps', element: 'tree', needs: ['double'], what: 'rising double jumps bough to bough, catches below' },
  'top branch': { content: 'jumps', element: 'tree', needs: ['run'], what: 'one long high branch' },
  'bridge span': { content: 'jumps', element: 'tree', needs: ['jump', 'creaky'], what: 'rope bridges with creaky limbs between' },
  'snap teach': { content: 'breakable', element: 'tree', needs: ['jump'], teaches: 'creaky', what: 'creaky twigs low over a long bank' },
  'snap dash': { content: 'breakable', element: 'tree', needs: ['creaky'], what: 'a run of creaky limbs and branches' },
  'creaky boughs': { content: 'breakable', element: 'tree', needs: ['creaky'], what: 'branches and creaky limbs' },
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

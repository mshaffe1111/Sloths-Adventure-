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
}

export const PIECES: Record<string, PieceKind> = {
  bank: { element: 'ground', stands: 'self', what: 'a bank of earth, the floor' },
  stone: { element: 'ground', stands: 'ground', what: 'a mossy boulder, a small rise on a bank\'s end' },
  log: { element: 'ground', stands: 'ground', what: 'a fallen log on the floor, or on a stump in a ground fork' },
  mushroom: { element: 'ground', stands: 'ground', what: 'a bounce mushroom on its perch' },
  crumble: { element: 'ground', stands: 'trunk', what: 'a crumbling stone ledge' },
  branch: { element: 'tree', stands: 'trunk', what: 'a bough on a kapok' },
  creaky: { element: 'tree', stands: 'trunk', what: 'a creaky limb that gives way' },
  bridge: { element: 'tree', stands: 'trunk', what: 'a rope bridge between posts' },
  lily: { element: 'water', stands: 'water', what: 'a lily pad on the water' },
  reed: { element: 'water', stands: 'water', what: 'a reed isle in the water' },
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
}

export const IDEAS: Record<string, Idea> = {
  'floor walk': { content: 'jumps', element: 'ground', needs: ['run'], teaches: 'run', what: 'low banks touching, small steps, no gap' },
  'bank hops': { content: 'jumps', element: 'ground', needs: ['jump'], teaches: 'jump', floor: true, what: 'hops between banks, stones and logs' },
  'stump hop': { content: 'jumps', element: 'ground', needs: ['jump'], floor: true, what: 'hops over stones, banks and logs, bigger steps' },
  'bank walk': { content: 'jumps', element: 'ground', needs: ['run'], what: 'a rest: a long bank and a short hop' },
  'bounce mound': { content: 'bounces', element: 'ground', needs: ['bounce'], teaches: 'bounce', what: 'a perched mushroom bounces him onto a mound' },
  'stump tops': { content: 'jumps', element: 'ground', needs: ['jump'], what: 'logs on stumps, a ground fork\'s high road' },
  'log jam': { content: 'jumps', element: 'ground', needs: ['jump'], what: 'logs at two heights on stumps' },
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

/** contents the menu names that the library has no idea for yet: a spec that asks for them is told so, plainly */
export const COMING: Partial<Record<Content, string>> = {
  enemies: 'the mixer lays no animals yet',
  hazards: 'thorns and costly pits are not in the library yet',
};

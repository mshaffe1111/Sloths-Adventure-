/**
 * The stage spec: what a helper writes, from a prompt about how a stage should look and feel, for the engine to lay out
 * (Matt, 11-05: "a helper can put a prompt in of how it wants the stage to look like. And it does it. It lays it out in a way that will
 * follow that rule. And they just need to fix it.").
 *
 * A spec says WHAT the stage is (its story beat, its feel, what it teaches, its node plan). It never says where a piece goes: the mixer
 * lays every piece, and the engine's rules (each piece in its element, nothing untaught, the stage's own pass lines) hold whatever a spec
 * asks. `checkSpec` names every problem in plain words before anything is built, so a helper fixes the spec, not the code.
 */

import { taughtBefore } from '../moveLadder.ts';
import type { Theme } from './library.ts';

/** where a piece belongs (the designer's element gate, 11-05): a piece outside its element fails the build */
export type Element = 'ground' | 'water' | 'tree';

/** a move the player makes; a stage may only ask for a move taught here or in an earlier stage */
export type Move = 'run' | 'jump' | 'double' | 'bounce' | 'climb' | 'creaky' | 'crumble' | 'swim' | 'glide';

/** the feel, in the words the designer and the lead use (each one sets knobs in the mixer and the stage's own pass lines) */
export interface Profile {
  /** the stage's overall line: 1-1 rises from the floor to the canopy, 1-5 comes down */
  trend: 'up' | 'down' | 'level';
  /** how fast it plays: calm (wide landings, longer bursts, more rests), steady, brisk (tighter gaps, fewer rests) */
  tempo: 'calm' | 'steady' | 'brisk';
  /** how much the ground rises and falls between landings */
  hills: 'flat' | 'rolling' | 'hilly';
  /** how often the way splits into two roads: none, light (one fork), moderate (forks and some canopy), heavy (canopy over most floors) */
  branching: 'none' | 'light' | 'moderate' | 'heavy';
  /** whether the stage has water: only then may it lay lily pads and reeds, and only inside the water it declares */
  water: boolean;
  /** petals: a low trail he can clear, scattered pickups, or groups hidden off the line */
  petals: 'trail' | 'scattered' | 'hidden';
  /** the element its pieces lead with (the commonest kind must belong to it) and the art set it draws from */
  look: { lead: Element; art: string };
  /** the quick clock on Normal (s), and Easy's floor; 120 s is every stage's floor whatever a spec says */
  length: { normal: [number, number]; easyMin: number };
  /** what the stage is made of, by how much (Matt's example, 11-05: "an enemy stage with a single branch, lots of jumps, vines and
   *  climbing"). The engine draws its ideas in these shares, and rolls a different stage inside them every time */
  mix: Partial<Record<Content, Amount>>;
  /** the world's theme: only pieces of this theme's set may be drawn (no lava in the forest) */
  theme: Theme;
  /** the core pieces this stage uses most, for continuity (Matt, 11-05: "these are the core objects from this level, use these the most");
   *  others only where they keep the same feel. The commonest landing must be one of these */
  core: string[];
}

/** how much of a thing a stage has */
export type Amount = 'none' | 'some' | 'lots';
/** the things a stage can be made of; every idea in the library belongs to one */
export type Content = 'jumps' | 'climbing' | 'vines' | 'bounces' | 'water' | 'enemies' | 'hazards' | 'breakable';

/** one node of the designer's plan */
export interface NodeSpec {
  /** what the node is for: teach X, practise, rest, the fork, the moment, cool down... (a teach must lay what it teaches) */
  job: string;
  /** the ideas it may draw from (a fork: one deck per road) */
  deck: string[] | { high: string[]; low: string[] };
  /** a move taught here (its first use; nothing later may need it before this node) */
  teaches?: Move;
  /** Dot's line, from the shipped lines (dotLinesData.ts), and whether it plays at the node's start or end */
  line?: { text: string; pad?: string; at?: 'start' | 'end' };
  /** a flag before it, a heart after it (only after real risk) */
  flagBefore?: boolean; heartAfter?: boolean;
  /** misses cost nothing here: a catch under every gap */
  safe?: boolean;
  /** the height band the node keeps to, as a share of the stage's climb (0 the floor, 1 the canopy top) */
  height?: [number, number];
  /** a short name on the map, for a node set between two others (1-5's "7b" between n7 and n8) */
  id?: string;
  /** the engine's knobs for this node, the designer's until the profile sets them (E8) */
  lay?: NodeLay;
}

/** how the mixer lays one node (each one optional; the profile's dials decide the rest) */
export interface NodeLay {
  /** on Easy only (an extra rest) */
  easyOnly?: boolean;
  /** one burst only (a flat walk, no gaps: 1-1's run teach) */
  one?: boolean;
  /** bursts the node lays, over the dial's */
  bursts?: number;
  /** lay every idea of the deck once, in its order, as one run (1-5's test node: the designer 11-06) */
  inOrder?: boolean;
  /** no canopy over its floor idea (a ground node) */
  ground?: boolean;
  /** the y band its way keeps to, top and bottom, in px (until `height` shares replace it) */
  band?: [number, number];
  /** never the idea node `not` rolled (1-based, counting nodes without an id) */
  not?: number;
  /** never an idea one of the last n nodes laid */
  notLast?: number;
  /** a hidden find's seed glint here */
  seed?: boolean;
}

export interface StageSpec {
  id: string;
  name: string;
  /** from the lead's story brief: for the report, and for the helper to check the feel against */
  story: { beat: string; feel: string };
  profile: Profile;
  nodes: NodeSpec[];
  /** what the stage's goal counts: a sprint (the shrine) or Meeca's marks */
  goal: { kind: 'sprint' } | { kind: 'marks'; count: number; normal: number; easy: number };
  /** dressing and the end's clue prop, by the art atlas's frame names (drawn only once that atlas is wired) */
  dress?: { start?: string[]; clue?: string };
  /** the moves taught before this stage (by the stages before it), which any node may use. Left out, they come from the move table
   *  (moveLadder.ts taughtBefore: where main teaches each move); a spec whose moves the table does not cover yet lists them here */
  taughtBefore?: Move[];
  /** what runs on the built stage after the petal pass and the dressing: the dressing kept off the play line (no piece over the shrine,
   *  none in the air he walks or jumps through, none with nothing to grow from); `seed`: the secret golden seed over a mushroom in the node
   *  with that job, off the main line (mixer/post.ts placeSeed) */
  post?: { clearDress?: boolean; seed?: { job: string } };
  /** where the stage starts (the spawn bank's y, px) and its last piece; bursts a node lays when the dial decides (min-max) */
  lay: { startY: number; end: { kind: string; w: number }; burstMin?: number; burstMax?: number };
}

// (a stage's pass lines come from its measured reference row, never from these profile words: passLines.ts, the designer's 12:48
// ruling)

/** every problem with a spec, in plain words, before anything is built (an empty list: the engine can build it) */
export function checkSpec(s: StageSpec, ideas: Record<string, { element: Element; needs: Move[]; teaches?: Move }>, pieces?: Record<string, { worlds: Theme[] }>, ideaKinds?: Record<string, string[]>): string[] {
  const err: string[] = [];
  // (every piece an idea lays belongs to the stage's theme, and every core piece too)
  if (pieces && ideaKinds) {
    for (const k of s.profile.core) if (!pieces[k]) err.push(`core piece "${k}" is not a piece kind the engine knows`); else if (!pieces[k].worlds.includes(s.profile.theme)) err.push(`core piece "${k}" is not of the ${s.profile.theme} theme`);
    const used = new Set(s.nodes.flatMap((n) => (Array.isArray(n.deck) ? n.deck : [...n.deck.high, ...n.deck.low])));
    for (const name of used) for (const k of ideaKinds[name] ?? []) if (pieces[k] && !pieces[k].worlds.includes(s.profile.theme)) err.push(`"${name}" lays ${k}, which is not of the ${s.profile.theme} theme`);
  }
  const known = new Set<Move>(s.taughtBefore ?? taughtBefore(s.id));
  if (!s.nodes.length) err.push('the spec has no nodes');
  if (s.profile.length.normal[0] < 120) err.push(`Normal's length starts at ${s.profile.length.normal[0]} s; every stage takes at least 120 s`);
  s.nodes.forEach((n, i) => {
    const where = `node ${i + 1} (${n.job})`;
    const decks = Array.isArray(n.deck) ? [n.deck] : [n.deck.high, n.deck.low];
    if (!Array.isArray(n.deck) && (!n.deck.high.length || !n.deck.low.length)) err.push(`${where}: a fork needs ideas on both roads`);
    for (const d of decks) for (const name of d) {
      const idea = ideas[name];
      if (!idea) { err.push(`${where}: "${name}" is not an idea the engine knows (${Object.keys(ideas).sort().join(', ')})`); continue; }
      if (idea.element === 'water' && !s.profile.water) err.push(`${where}: "${name}" is a water idea and the profile has no water`);
      for (const m of idea.needs) if (!known.has(m) && m !== n.teaches) err.push(`${where}: "${name}" needs ${m}, which is not taught yet (teach it in an earlier node, or take the idea out)`);
    }
    if (n.teaches) {
      if (!decks.flat().some((name) => ideas[name]?.teaches === n.teaches)) err.push(`${where}: it teaches ${n.teaches} but its deck has no idea that teaches it`);
      known.add(n.teaches);
    }
    if (n.height && (n.height[0] < 0 || n.height[1] > 1 || n.height[0] > n.height[1])) err.push(`${where}: its height band ${JSON.stringify(n.height)} must run from low to high inside 0-1`);
  });
  if (s.goal.kind === 'marks' && (s.goal.normal > s.goal.count || s.goal.easy > s.goal.normal)) err.push(`the goal asks ${s.goal.normal} (Normal) / ${s.goal.easy} (Easy) of ${s.goal.count} marks`);
  return err;
}

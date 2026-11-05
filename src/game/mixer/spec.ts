/**
 * The stage spec: what a helper writes, from a prompt about how a stage should look and feel, for the engine to lay out
 * (Matt, 11-05: "a helper can put a prompt in of how it wants the stage to look like. And it does it. It lays it out in a way that will
 * follow that rule. And they just need to fix it.").
 *
 * A spec says WHAT the stage is (its story beat, its feel, what it teaches, its node plan). It never says where a piece goes: the mixer
 * lays every piece, and the engine's rules (each piece in its element, nothing untaught, the stage's own pass lines) hold whatever a spec
 * asks. `checkSpec` names every problem in plain words before anything is built, so a helper fixes the spec, not the code.
 */

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
}

/** the moves every stage after the tutorial may take as known (taught in World 1's earlier stages), by stage order */
export const TAUGHT_BEFORE: Record<string, Move[]> = {
  '1-1': [],
  '1-2': ['run', 'jump', 'double', 'bounce'],
  '1-3': ['run', 'jump', 'double', 'bounce'],
  '1-4': ['run', 'jump', 'double', 'bounce'],
  '1-5': ['run', 'jump', 'double', 'bounce', 'climb'],
};

/** the pass lines a profile sets for its own stage (the fixed floors every stage shares are kept on top of these) */
export interface StageLines {
  splitsMin: number;
  twoRoadMin: { normal: number; easy: number };
  upDownMin: number;
  densityEasyMax: number;
  longestRunMax: { normal: number; easy: number };
  length: Profile['length'];
}

/** a profile's pass lines (the designer's numbers for 1-5 and 1-1, 11-05; a new profile word gets its numbers from the designer) */
export function linesFor(p: Profile): StageLines {
  const split = { none: 0, light: 4, moderate: 10, heavy: 19 }[p.branching];
  const two = { none: { normal: 0, easy: 0 }, light: { normal: 0.1, easy: 0.08 }, moderate: { normal: 0.25, easy: 0.2 }, heavy: { normal: 0.4, easy: 0.4 } }[p.branching];
  const upDown = { flat: 0.6, rolling: 0.85, hilly: 0.949 }[p.hills];
  const run = { calm: { normal: 25, easy: 18 }, steady: { normal: 29, easy: 20 }, brisk: { normal: 35, easy: 24 } }[p.tempo];
  return { splitsMin: split, twoRoadMin: two, upDownMin: upDown, densityEasyMax: 0.55, longestRunMax: run, length: { normal: p.length.normal, easyMin: Math.max(120, p.length.easyMin) } };
}

/** every problem with a spec, in plain words, before anything is built (an empty list: the engine can build it) */
export function checkSpec(s: StageSpec, ideas: Record<string, { element: Element; needs: Move[]; teaches?: Move }>): string[] {
  const err: string[] = [];
  const known = new Set<Move>(TAUGHT_BEFORE[s.id] ?? []);
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

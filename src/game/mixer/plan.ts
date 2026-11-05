/**
 * generatePlan(brief, seed): the engine rolls a stage's structure from its brief (Matt, 11-05: "the whole point was to have variety, and
 * the engine will work"), inside the world's rulebook (reference/engine/WORLD-RULEBOOK.md §4, the section grammar). No hand-written node
 * plan: which sections, how many practises, where the forks and rests fall, and which ideas each section draws all roll per seed; the
 * mixer (w1mix.ts buildMix) lays the plan as it lays any other.
 *
 * TRIAL (R-165, the lead's 3:57 PM order): the quickest version, measured on 16 rolls before anything is committed.
 */
import type { Move, NodeSpec } from './spec.ts';
import { IDEAS } from './library.ts';
import { rngFor } from './w1mix.ts';
import { ShuffleBag } from '../gen2/variety.ts';

/** a stage's brief: what the designer gives the engine (WORLD-RULEBOOK §5) */
export interface Brief {
  /** the moves this stage teaches, in the world ladder's order */
  teaches: Move[];
  /** the stage's line: up rises from the floor into the trees */
  trend: 'up' | 'down' | 'level';
  /** a quiet walk-on to the end, or a dense finale */
  ends: 'quiet' | 'finale';
  /** what the stage may never lay (rulebook words: creaky, crumbling, water, the kapok climb...) */
  not: string[];
  /** how much the way splits: none, some (1-2 forks), lots (3 or more) */
  branching: 'none' | 'some' | 'lots';
  /** the quick clock's band on Normal (s) */
  length: [number, number];
}

/** what each `not` word rules out, by the library's own tags (an idea's needs, content, element, or its name) */
const NOT: Record<string, (name: string) => boolean> = {
  creaky: (n) => !!IDEAS[n]?.needs?.includes('creaky' as Move) || IDEAS[n]?.teaches === 'creaky' || /creaky|snap|rotten/.test(n),
  crumbling: (n) => IDEAS[n]?.teaches === ('crumble' as Move) || /crumbl/.test(n),
  water: (n) => IDEAS[n]?.element === 'water',
  'the kapok climb': (n) => n === 'the climb',
  ropes: (n) => /rope|bridge span/.test(n),
};
/** ideas with a job of their own, never drawn into a practise deck */
const OWN_JOB = new Set(['floor walk', 'bank walk', 'top branch', 'double chain', 'push block']);

/** a section's deck: ideas whose needs are taught, whose element fits its band, not ruled out by the brief */
function deckFor(taught: Set<string>, band: 'ground' | 'tree', b: Brief): string[] {
  return Object.keys(IDEAS).filter((n) => {
    const i = IDEAS[n];
    if (OWN_JOB.has(n) || i.teaches && !taught.has(i.teaches)) return false;
    if (!(i.needs ?? []).every((m) => taught.has(m))) return false;
    if (i.element !== band) return false;
    return !b.not.some((w) => NOT[w]?.(n));
  });
}

/** the y band of a section (px) by where it falls on the stage's climb: the ground rises from the start, the trees above */
function bandAt(t: number, tree: boolean): [number, number] {
  const top = tree ? 950 - 520 * t : 1320 - 320 * t;
  return [Math.round(top - 220), Math.round(top)];
}

/**
 * The plan. The grammar (rulebook §4 rules 1-11): arrive first (here the run teach, flat safe ground), each move's teach before anything
 * uses it, then 1-3 practises using it (a fork may stand for one; never on a teach); a rest after every test and twist, never two side
 * by side; forks by branching; the climb into the trees once the double is taught (trend up); the moment, the last test, in the last
 * third; the quiet arrival and the end. Sections are added until the stage's length is reached (`extra` adds practises).
 */
export function generatePlan(b: Brief, seed: number, extra = 0): NodeSpec[] {
  const R = rngFor(seed, 'plan');
  const r = () => R.r(0, 1);
  const taught = new Set<string>();
  const out: NodeSpec[] = [];
  const forksWanted = b.branching === 'none' ? 0 : b.branching === 'some' ? 1 + (r() < 0.5 ? 1 : 0) : 3 + (r() < 0.5 ? 1 : 0);
  let forks = 0;
  // (the practise slots, counted first so the forks fall among them at random)
  const counts = b.teaches.map((m) => (m === 'run' ? 0 : 1 + Math.floor(r() * 3)));
  let slots = counts.reduce((a, n) => a + n, 0) + extra;
  const bag = (items: string[]) => new ShuffleBag(r, items);
  let last = '';
  const draw = (deck: string[], n: number) => {
    const sb = bag(deck), got: string[] = [];
    for (let k = 0; k < 12 && got.length < Math.min(n, deck.length); k++) { const d = sb.draw(); if (d !== undefined && !got.includes(d) && d !== last) got.push(d); }
    return got.length ? got : deck.slice(0, n);
  };
  let tree = false;
  const total = () => out.length;
  const practise = (i: number, of: number) => {
    const t = Math.min(1, (total() + 1) / (8 + slots));
    const band = tree ? 'tree' : 'ground';
    const deck = deckFor(taught, band, b);
    const forkHere = forks < forksWanted && r() < (forksWanted - forks) / Math.max(1, slots);
    slots--;
    if (forkHere && deck.length >= 2) {
      forks++;
      const high = draw(deck, 2), low = draw(deck.filter((d) => IDEAS[d].floor || band === 'tree'), 2);
      out.push({ job: tree ? 'canopy fork' : 'the fork', deck: { high, low: low.length ? low : high }, lay: { ...(tree ? {} : { ground: true }), band: bandAt(t, tree) } });
    } else {
      const d = draw(deck, 3);
      last = d[0];
      out.push({ job: of > 1 && i === 0 ? 'practise' : 'practise', deck: d, lay: { ...(tree ? {} : { ground: true }), band: bandAt(t, tree) } });
    }
  };
  for (let mi = 0; mi < b.teaches.length; mi++) {
    const m = b.teaches[mi];
    const t = Math.min(1, total() / (8 + slots));
    if (m === 'run') {
      taught.add('run');
      out.push({ job: 'teach run', teaches: 'run', deck: ['floor walk'], lay: { one: true, ground: true, band: bandAt(0, false) } });
      continue;
    }
    // (the teach: the idea that teaches it, then a floor idea, over safe ground)
    taught.add(m);
    const own = Object.keys(IDEAS).filter((n) => IDEAS[n].teaches === m && IDEAS[n].element === (tree ? 'tree' : 'ground') && !b.not.some((w) => NOT[w]?.(n)));
    const floor = deckFor(taught, 'ground', b).filter((n) => IDEAS[n].floor && IDEAS[n].teaches !== m).slice(0, 2);
    out.push({ job: `teach ${m}`, teaches: m, deck: [...own.slice(0, 1), ...floor], safe: true, lay: { ground: !tree, bursts: 2 + Math.floor(r() * 2), band: bandAt(t, tree) } });
    for (let k = 0; k < counts[mi]; k++) practise(k, counts[mi]);
    // (a rest now and then, never two side by side; the seed's rest after the bounce teach)
    if (m === 'bounce' || r() < 0.35) out.push({ job: 'rest', deck: ['bank walk'], lay: { ground: true, band: bandAt(Math.min(1, total() / (8 + slots)), false) } });
    // (trend up: once the double is taught the way climbs into the trees)
    if (m === 'double' && b.trend === 'up') {
      out.push({ job: 'climb up', deck: deckFor(taught, 'tree', b).filter((n) => /stair|bounce up/.test(n)), lay: { band: [650, 950] } });
      tree = true;
    }
  }
  for (let k = 0; k < extra; k++) practise(k, extra);
  // (the moment: the last test, in the last third; a flag before it, a heart after it; then the rest rule, the arrival and the end)
  const lastMove = b.teaches[b.teaches.length - 1];
  const testDeck = lastMove === 'double' && tree ? ['double chain'] : deckFor(taught, tree ? 'tree' : 'ground', b).slice(0, 2);
  out.push({ job: `test ${lastMove}`, deck: testDeck, flagBefore: true, heartAfter: true, lay: { band: bandAt(0.8, tree) } });
  if (b.ends === 'quiet') out.push({ job: 'cool down', deck: [tree ? 'top branch' : 'bank walk'], lay: { band: bandAt(1, tree) } });
  return out;
}

/** the plan with its last `drop` practises taken out (never a teach, a fork, the climb, the test or the ends): the length rule's lever */
export function trimPlan(plan: NodeSpec[], drop: number): NodeSpec[] {
  const out = [...plan];
  for (let k = out.length - 1; k >= 0 && drop > 0; k--) if (out[k].job === 'practise') { out.splice(k, 1); drop--; }
  // (and never two rests side by side once a practise between them is gone)
  return out.filter((n, i) => !(n.job === 'rest' && out[i - 1]?.job === 'rest'));
}

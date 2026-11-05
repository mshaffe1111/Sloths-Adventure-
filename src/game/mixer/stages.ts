/**
 * The stages as data: each stage's spec (its story, its feel profile and its node plan) in the words of `spec.ts`. The node plans are
 * still the mixer's (PLAN_15, PLAN_11) while the engine moves onto these specs (E2); the profiles here are the designer's, 11-05.
 */
import type { Move, NodeSpec, StageSpec } from './spec.ts';
import { PLAN_11, PLAN_15, type NodePlan } from './w1mix.ts';

const TEACH: Record<string, Move> = { run: 'run', jump: 'jump', bounce: 'bounce', double: 'double', creaky: 'creaky' };
/** a mixer node plan row in the spec's words */
const asSpec = (n: NodePlan): NodeSpec => ({
  job: n.job, deck: n.deck, safe: n.safe, flagBefore: n.flagBefore, heartAfter: n.heartAfter,
  ...(n.job.startsWith('teach ') && TEACH[n.job.slice(6)] ? { teaches: TEACH[n.job.slice(6)] } : {}),
  ...(n.hint ? { line: { text: n.hint, pad: n.padHint, at: n.hintAtEnd ? 'end' as const : 'start' as const } } : {}),
});

export const SPEC_15: StageSpec = {
  id: '1-5', name: 'The Folded Petals',
  story: { beat: 'down from the canopy to the forest floor at dusk, on Meeca\'s trail', feel: 'the chase tightens; creaky limbs give way' },
  profile: { trend: 'down', tempo: 'steady', hills: 'hilly', branching: 'heavy', water: true, petals: 'scattered', look: { lead: 'tree', art: 'w1' },
    length: { normal: [200, 260], easyMin: 120 }, mix: { jumps: 'lots', breakable: 'lots', bounces: 'some', climbing: 'some', water: 'some' }, theme: 'forest', core: ['branch', 'creaky', 'bank'] },
  nodes: PLAN_15.map(asSpec), goal: { kind: 'marks', count: 13, normal: 10, easy: 8 },
};

export const SPEC_11: StageSpec = {
  id: '1-1', name: 'Into the Canopy',
  story: { beat: 'two days after the soldiers took Meeca, Pokey leaves the home forest: slow, and coming anyway', feel: 'a small, determined start that grows: low, safe and a little comic, then higher than he has ever climbed' },
  profile: { trend: 'up', tempo: 'calm', hills: 'hilly', branching: 'moderate', water: false, petals: 'trail', look: { lead: 'ground', art: 'w1' },
    length: { normal: [160, 195], easyMin: 120 }, mix: { jumps: 'lots', bounces: 'some', climbing: 'some', water: 'none' }, theme: 'forest', core: ['bank', 'log', 'stone'] },
  nodes: PLAN_11.map(asSpec), goal: { kind: 'sprint' }, dress: { start: ['squirrel-sit', 'squirrel-wave', 'squirrel-tip'], clue: 'bootprint' },
};

export const SPECS: StageSpec[] = [SPEC_11, SPEC_15];

/**
 * The stages as data: each stage's spec (its story, its feel profile, its node plan and the engine's knobs) in the words of `spec.ts`.
 * The mixer (`w1mix.ts`) reads these and nothing else stage-specific: a new stage is a new spec here, not new mixer code. The profiles
 * and node plans are the designer's (ENGINE-SPEC, 11-05).
 */
import type { StageSpec } from './spec.ts';

/**
 * CP4's 1-1, "Into the Canopy" (ENGINE-SPEC "CP4, stage by stage", the designer's node plan): the arrival, teaching run, jump, the
 * bounce and then the double jump (nothing untaught: no creaky, no crumbling, no animals). It rises from the forest floor to the high
 * kapok branches (1-5 goes down), its moment the first double-jump chain up into the canopy, ending in a calm resolve, not a triumph (the
 * brief, 1-1.md:23: the bigger views belong to later stages; the designer's "1-1 for the builder" page is the design source). A sprint:
 * no marks; the goal is the shrine. Dot's lines are the shipped 1-1's (dotLinesData.ts hint.1-1.*).
 */
export const SPEC_11: StageSpec = {
  id: '1-1', name: 'Into the Canopy',
  story: { beat: 'two days after the soldiers took Meeca, Pokey leaves the home forest: slow, and coming anyway', feel: 'a small, determined start that grows: low, safe and a little comic, then higher than he has ever climbed' },
  profile: { trend: 'up', tempo: 'calm', hills: 'hilly', branching: 'moderate', water: false, petals: 'trail', look: { lead: 'ground', art: 'w1' },
    length: { normal: [160, 195], easyMin: 120 }, mix: { jumps: 'lots', bounces: 'some', climbing: 'some', water: 'none' }, theme: 'forest', core: ['bank', 'log', 'stone'] },
  nodes: [
    // (n1-n7, the forest floor at the home forest's edge, no canopy: the lead's story brief and the designer's ground-stage ruling, 11-05)
    { job: 'teach run', teaches: 'run', deck: ['floor walk'], lay: { one: true, ground: true, band: [1180, 1320] } },
    // (1-1's profile, the designer, 11-05: branching moderate, ground forks early and canopy forks late; hilly ground rising to the
    // canopy; a calm march, quicker only at n9. The ground teaches lay 3 bursts each, for the length a canopy gave 1-5)
    { job: 'teach jump', teaches: 'jump', deck: ['bank hops', 'stump hop', 'log jam'], line: { text: 'Jump the little gaps' }, safe: true, lay: { ground: true, bursts: 3, band: [1150, 1320] } },
    // (the first of the early ground forks: logs on stumps over the stump hops and banks)
    { job: 'practise (fork)', deck: { high: ['stump tops', 'log jam'], low: ['stump hop', 'bank hops'] }, line: { text: 'Up the bank! Step to step' }, lay: { ground: true, band: [1100, 1300] } },
    // (the bounce lifts him onto a mound top, not a bough)
    { job: 'teach bounce', teaches: 'bounce', deck: ['bounce mound', 'stump hop', 'bank hops'], lay: { ground: true, bursts: 3, band: [1000, 1250] } },
    // (a ground fork: the high road on stump tops and a log jam, the low road on the floor; the creek's once the engine draws a water
    // zone: lily pads then, stump hop until then (the designer's element gate, 11-05))
    { job: 'the fork', deck: { high: ['stump tops', 'log jam'], low: ['bank hops', 'stump hop'] }, lay: { ground: true, band: [950, 1150] } },
    { job: 'rest', deck: ['bank walk'], flagBefore: false, lay: { ground: true, band: [950, 1150] } },
    { job: 'teach double', teaches: 'double', deck: ['double gap', 'bank hops', 'stump hop'], line: { text: 'Flick up again in the air to jump twice', pad: 'Press Jump again in the air' }, safe: true, lay: { ground: true, bursts: 3, band: [900, 1100] } },
    // (n8 on, the trees: bough stair or a bounce up into the boughs; the kapok climb is 1-4's)
    { job: 'climb up', deck: ['bough stair', 'bounce up'], lay: { band: [650, 950] } },
    { job: 'test double', deck: ['double chain'], flagBefore: true, line: { text: 'Look how high we are!', at: 'end' }, lay: { band: [380, 750] } },
    { job: 'canopy fork', deck: { high: ['bough hops', 'bough stair'], low: ['bough hops', 'stump hop'] }, lay: { band: [380, 560] } }, // (no "No soft moss up here!": since R-165.86 every fall in 1-1 is soft, R-165.62)
    { job: 'cool down', deck: ['top branch'], lay: { band: [340, 480] } },
  ],
  goal: { kind: 'sprint' },
  dress: { start: ['squirrel-sit', 'squirrel-wave', 'squirrel-tip'], clue: 'bootprint' },
  // (its known moves are the move table's: none are taught before 1-1, moveLadder.ts)
  post: { clearDress: true, seed: { job: 'rest' } },
  // (the shrine stands on a long log at the top branch's end: three long pieces of one kind in a row ran the gate's "nothing new" to 2,106 px)
  lay: { startY: 1260, end: { kind: 'log', w: 640 }, burstMin: 5, burstMax: 6 },
};

// (1-5 left the mixer for gen2, w1Arc15.ts: new replaces old)
export const SPECS: StageSpec[] = [SPEC_11];
/** the stage the engine builds from data, by its id (undefined: a stage the mixer does not build yet) */
export const specFor = (id: string): StageSpec | undefined => SPECS.find((s) => s.id === id);

/**
 * The stages as data: each stage's spec (its story, its feel profile, its node plan and the engine's knobs) in the words of `spec.ts`.
 * The mixer (`w1mix.ts`) reads these and nothing else stage-specific: a new stage is a new spec here, not new mixer code. The profiles
 * and node plans are the designer's (ENGINE-SPEC, 11-05).
 */
import type { StageSpec } from './spec.ts';

/** CP3's 1-5, "The Folded Petals" (ENGINE-SPEC "CP3 design"), after the designer's ruling (b), 11-05 */
export const SPEC_15: StageSpec = {
  id: '1-5', name: 'The Folded Petals',
  story: { beat: 'down from the canopy to the forest floor at dusk, on Meeca\'s trail', feel: 'the chase tightens; creaky limbs give way' },
  profile: { trend: 'down', tempo: 'steady', hills: 'hilly', branching: 'heavy', water: true, petals: 'scattered', look: { lead: 'tree', art: 'w1' },
    length: { normal: [200, 260], easyMin: 120 }, mix: { jumps: 'lots', breakable: 'lots', bounces: 'some', climbing: 'some', water: 'some' }, theme: 'forest', core: ['branch', 'creaky', 'bank'] },
  nodes: [
    // (log jam leaves 1-5 now the creek's water draws: the designer's 11:40 ruling, so 1-1 and 1-5 share no more than half their ideas)
    { job: 'warm-up', deck: ['bank hops', 'stump hop'] },
    { job: 'teach creaky', teaches: 'creaky', deck: ['snap teach'], line: { text: 'Creaky branches! Grab the petals and keep moving' } },
    // (each deck gains a floor idea, the old 1-1's cycle: the designer's ruling (a) on the review, 11-05 ~2:35 AM)
    { job: 'climb up', deck: ['bounce up', 'the climb', 'stump hop'] },
    // (Easy's third rest, the designer's option (c) for Easy's density, 11-05: Easy only)
    { id: '3b', job: 'rest', deck: ['bank walk'], lay: { easyOnly: true } },
    // (the designer's ruling (b), 11-05: the high road's breakables are creaky limbs (a stone slab on a kapok trunk floats, P-2))
    // (the designer's 10:09 ruling: World 7's crumbling slab leaves World 1 (SHIPPED acf6e1e8), and World 1 has no ground rotten-wood
    // art yet, so no low road lays a breakable until it is painted (R-165.30, held to art week))
    // (the low road is the creek again, on the water the engine draws: the designer's 11:40 ruling)
    { job: 'the fork', deck: { high: ['creaky boughs', 'bough hops'], low: ['lily-pad hop', 'reed isles'] } },
    { job: 'rest', deck: ['bank walk'], line: { text: 'These petals are fresher. She came this way not long ago.' }, flagBefore: false },
    { job: 'test creaky', deck: ['snap dash', 'the climb', 'bounce up', 'double gap'], lay: { inOrder: true }, flagBefore: true, heartAfter: true },
    { job: 'twist', deck: ['rotten-branch drop', 'stump hop'] },
    // (the second rest, the designer's ruling on the fun gate, 11-05 ~2:26 AM: a short flat pad and a Dot spot after the drop; its flag
    // only if a hard node follows, which the flag rule decides; Dot's line is the designer's)
    { id: '7b', job: 'rest', deck: ['bank walk'], line: { text: 'Down on the forest floor now. Her marks go on past the creek.' } },
    // (the designer's ruling 6 on the CP3 miss: n8 draws one that the previous two nodes did not lay)
    // (the creek's lily pads and reeds are back on real water, the engine's drawn creek (the designer's 11:40 ruling))
    { job: 'creek', deck: ['reed isles', 'lily-pad hop', 'stump hop'], lay: { notLast: 2 } },
    // (push block leaves n9 for CP3, the designer's ruling: the level check walks a pushed log only inside a puzzle room; back in CP4)
    { job: 'puzzle beat', deck: ['bough stair', 'the climb', 'bank hops'], line: { text: 'Something shiny, far away...', pad: 'Something shiny, far away... too far, for now.' }, lay: { not: 3, seed: true } },
    { job: 'master (fork)', deck: { high: ['creaky boughs', 'bridge span'], low: ['bough stair', 'stump hop'] }, flagBefore: true, heartAfter: true },
    { job: 'cool down', deck: ['bank hops', 'stump hop'] },
  ],
  goal: { kind: 'marks', count: 15, normal: 10, easy: 8 },
  taughtBefore: ['run', 'jump', 'double', 'bounce', 'climb'],
  lay: { startY: 460, end: { kind: 'bank', w: 640 } },
};

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
    { job: 'canopy fork', deck: { high: ['bough hops', 'bough stair'], low: ['bough hops', 'stump hop'] }, line: { text: 'No soft moss up here!' }, lay: { band: [380, 560] } },
    { job: 'cool down', deck: ['top branch'], lay: { band: [340, 480] } },
  ],
  goal: { kind: 'sprint' },
  dress: { start: ['squirrel-sit', 'squirrel-wave', 'squirrel-tip'], clue: 'bootprint' },
  // (its known moves are the move table's: none are taught before 1-1, moveLadder.ts)
  post: { clearDress: true, seed: { job: 'rest' } },
  // (the shrine stands on a long log at the top branch's end: three long pieces of one kind in a row ran the gate's "nothing new" to 2,106 px)
  lay: { startY: 1260, end: { kind: 'log', w: 640 }, burstMin: 5, burstMax: 6 },
};

export const SPECS: StageSpec[] = [SPEC_11, SPEC_15];
/** the stage the engine builds from data, by its id (undefined: a stage the mixer does not build yet) */
export const specFor = (id: string): StageSpec | undefined => SPECS.find((s) => s.id === id);

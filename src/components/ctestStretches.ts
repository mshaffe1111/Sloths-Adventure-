/**
 * The testers' end survey, "What felt hardest?": the stretches of the run just played, in the plain words a tester would use for them.
 *
 * A gen2 stage's stretches come from the engine as `${section id}:${phase}` (pipeline.ts, proto.beats), so World 1's section ids
 * (gen2/worlds/w1.ts) are named here. Several sections that play the same way share one phrase, so the list stays short. A section
 * that only walks (a start, a rest, the arrival) is null: nobody finds it hardest, and it would only make the list longer.
 * ctestStretches.test.ts fails when World 1 gains a section this table does not name, so a new section is named before it ships.
 */

export const STRETCH_WORDS: Readonly<Record<string, string | null>> = {
  // the first jumps: low stumps, small banks, the first logs
  'w1-learn': 'the first jumps',
  'w1-stump-stile': 'the first jumps',
  'w1-knot-bank': 'the first jumps',
  'w1-mound-log': 'the first jumps',
  'w1-log-teach': 'the first jumps',
  'w1-floor-dash': 'the first jumps',
  'w1-last-step-up': null,
  // stones
  'w1-stones': 'the stepping stones',
  'w1-step-stones-teach': 'the stepping stones',
  'w1-cache-stones': 'the stepping stones',
  'w1-stump-stones': 'the stepping stones',
  'w1-stone-dips': 'the stepping stones',
  'w1-stone-zigzag': 'the stepping stones',
  'w1-stone-road': 'the stepping stones',
  // the double jump over gaps
  'w1-double-teach': 'the double-jump gaps',
  'w1-dip-double-teach': 'the double-jump gaps',
  'w1-second-jump': 'the double-jump gaps',
  'w1-leap-stones': 'the double-jump gaps',
  'w1-two-answers': 'the double-jump gaps',
  // the double jump up tall steps
  'w1-bank-double-teach': 'the tall steps (double jump)',
  'w1-stump-towers': 'the tall steps (double jump)',
  'w1-fallen-trunk': 'the tall steps (double jump)',
  // (1-3's copy of the same body, C1 attempt 2: the same words, no new ones; INT-1-1)
  'w1-fallen-trunk-13': 'the tall steps (double jump)',
  'w1-stilt-logs': 'the tall steps (double jump)',
  'w1-stair-fork': 'the tall steps (double jump)',
  'w1-root-stair-fork': 'the tall steps (double jump)',
  'w1-stair-test': 'the tall steps (double jump)',
  'w1-stair-test-back': 'the tall steps (double jump)',
  'w1-log-stair-test': 'the tall steps (double jump)',
  'w1-log-stair-test-back': 'the tall steps (double jump)',
  'w1-bank-stair-test': 'the tall steps (double jump)',
  'w1-bank-stair-test-back': 'the tall steps (double jump)',
  'w1-backstep-twist': 'the tall steps (double jump)',
  'w1-high-step-twist': 'the tall steps (double jump)',
  // stairs and banks taken with single jumps
  'w1-bank-stair-fork': 'the stairs and banks',
  'w1-stair-run': 'the stairs and banks',
  'w1-bank-run': 'the stairs and banks',
  'w1-zigzag-run': 'the stairs and banks',
  'w1-stair-gap-twist': 'the stairs and banks',
  'w1-ledges': 'the stairs and banks',
  // (1-1's closing climb test since POLISH-7: single steps up stones, no double; R-165.228)
  'w1-stone-stair-test': 'the stairs and banks',
  'w1-stone-stair-test-back': 'the stairs and banks',
  // the mushroom
  'w1-mushroom-lift': 'the mushroom bounce',
  'w1-mushroom-bank-teach': 'the mushroom bounce',
  'w1-hop-bounce': 'the mushroom bounce',
  'w1-twin-bounce': 'the mushroom bounce',
  'w1-mushroom-fork': 'the mushroom bounce',
  'w1-twin-mushroom-fork': 'the mushroom bounce',
  'w1-mushroom-fork-dip': 'the mushroom bounce',
  'w1-two-lifts': 'the mushroom bounce',
  'w1-drop-bounce-twist': 'the mushroom bounce',
  'w1-long-bounce-twist': 'the mushroom bounce',
  'w1-dip-bounce-twist': 'the mushroom bounce',
  // the mushroom, then a double jump
  'w1-bounce-double': 'bounce, then double jump',
  'w1-bounce-run': 'bounce, then double jump',
  'w1-bounce-wall': 'bounce, then double jump',
  'w1-bounce-over-dip': 'bounce, then double jump',
  'w1-mushroom-log': 'bounce, then double jump',
  'w1-mushroom-stair': 'bounce, then double jump',
  'w1-bounce-stair-combine': 'bounce, then double jump',
  'w1-bounce-stair-level': 'bounce, then double jump',
  'w1-seed-perch': 'bounce, then double jump',
  // up into the branches
  'w1-bough-stepup': 'the climb into the branches',
  'w1-low-boughs': 'the climb into the branches',
  'w1-high-leaps': 'the climb into the branches',
  'w1-mushroom-chain': 'the climb into the branches',
  'w1-mushroom-chain-back': 'the climb into the branches',
  'w1-bounce-bough-combine': 'the climb into the branches',
  // across the high branches
  'w1-canopy-rungs': 'the high branches',
  'w1-canopy-rungs-level': 'the high branches',
  'w1-canopy-weave': 'the high branches',
  'w1-canopy-weave-rise': 'the high branches',
  'w1-bough-log': 'the high branches',
  'w1-dipping-boughs-twist': 'the high branches',
  // logs
  'w1-log-road': 'the logs',
  'w1-hollow-twoway': 'the logs',
  'w1-log-chain': 'the logs',
  'w1-log-chain-rise': 'the logs',
  // going back down
  'w1-dropdown-stair': 'the drops back down',
  'w1-stump-descent': 'the drops back down',
  'w1-bough-descent': 'the drops back down',
  'w1-log-steps-descent': 'the drops back down',
  'w1-canopy-drop': 'the drops back down',
  // the rope
  'w1-ropes': 'the rope',
  // 1-3 Branch Snakes: the drop traps and the bare branches (w1Arc13.ts)
  // (the story keeper's words, 11-12, verbatim: STORY-LINES.md)
  'w1-13-lesson': 'the first hive',
  'w1-13-again': 'the snake on watch',
  'w1-13-stone-stair': 'the stone on the steps',
  'w1-13-other-way': 'the branches with no vine',
  'w1-13-perch': 'the high branch',
  'w1-13-gallery': 'three traps in a row',
  'w1-13-two-snakes': 'the two snakes on a log',
  'w1-13-finale': 'the last two snakes',
  // 1-2, 1-4 .. 1-9: each stage's own beats (its w1Arc file's SECTIONS), DRAFTED from each beat's design in plain player words for the
  // testers' picker (PICK-W1, R-165.343), for the story keeper's check: before them every one of these stages offered World 1's generic four
  // 1-2 The Petal Trail: mushroom caps over thorns (w1Arc12.ts)
  'w1-12-lesson': 'the first thorns',
  'w1-12-again': 'the mushrooms over thorns',
  'w1-12-up': 'the mushroom stair',
  'w1-12-long': 'the long mushroom chain',
  'w1-12-hollow': 'the hollow by the roots',
  'w1-12-crossing': 'the crossing by the island',
  'w1-12-finale': 'the last mushrooms',
  // 1-4 Up the Kapok: vines, rotten boughs, figs and pods (w1Arc14.ts)
  'w1-14-going-up': 'the first vines up',
  'w1-14-rotting': 'the rotten boughs',
  'w1-14-field': 'the wide field of vines',
  'w1-14-pods': 'the falling pods',
  'w1-14-push': 'pushing up the figs',
  'w1-14-rotten-fork': 'the creaking boughs',
  'w1-14-push-two': 'the two fig bunches',
  'w1-14-under-fire': 'the figs under the pods',
  'w1-14-columns': 'from vine to vine',
  'w1-14-drop-one': 'the figs on the snake',
  'w1-14-hollow': 'the hollow in the tree',
  'w1-14-crown': 'the top of the tree',
  // 1-5 Where She Walked: creaky limbs and sleeping snakes (w1Arc15.ts)
  'w1-15-through-or-over': 'the hollow trunk',
  'w1-15-creak-lesson': 'the first creaky limb',
  'w1-15-her-road': 'past the sleeping snake',
  'w1-15-blocked': 'the snake that woke up',
  'w1-15-big-sign': 'the branch or the creek',
  'w1-15-stone': 'riding the limb down',
  'w1-15-weave': 'the fast creaky limbs',
  // 1-6 First Lianas: the swing, and snakes on the vines (w1Arc16.ts)
  'w1-16-first-liana': 'the first liana',
  'w1-16-hang-low': 'hanging low to swing far',
  'w1-16-chain': 'liana to liana over thorns',
  'w1-16-snakes-met': 'the snakes on the vines',
  'w1-16-snake-on-vine': 'a snake on my vine',
  'w1-16-creaky-landing': 'the creaky landing',
  'w1-16-risers': 'the snakes coming up',
  'w1-16-false-liana': 'the vine with a face',
  'w1-16-gorge': 'the big swing over the gorge',
  // 1-7 A Very Good Bush: hiding from the eagle (w1Arc17.ts)
  'w1-17-bush': 'hiding in the bush',
  'w1-17-red-green': 'run, stop, hide',
  'w1-17-bare-bark': 'the bare bark',
  'w1-17-moss': 'hiding on the moss',
  'w1-17-creak': 'the creaky limb',
  'w1-17-mossy-lianas': 'hiding on a mossy liana',
  'w1-17-eagle-lands': 'when the eagle landed',
  'w1-17-light-gap': 'the sunny gap',
  // 1-8 The Long Branch: the race, the nuts (w1Arc18.ts)
  'w1-18-teach': 'the rolling nuts',
  'w1-18-first-run': 'the first race',
  'w1-18-at-pace': 'the race over the lianas',
  'w1-18-high-bough': 'the high bough',
  'w1-18-rhythm': 'little and big nuts at once',
  'w1-18-still-fork': 'the fork to stop at',
  'w1-18-last': 'the last stretch',
  'w1-18-tip': 'the swing off the tip',
  // 1-9 The Boa's Branches: freeze, bop, the eagle (w1Arc19.ts)
  'w1-19-forest-freeze': 'freezing like a branch',
  'w1-19-stair': 'freezing on the stairs',
  'w1-19-miss': 'bopping a boa',
  'w1-19-roost': 'the creaky limb by the nest',
  'w1-19-read-load': 'the boa under a trap',
  'w1-19-read-roost': "the boa by the eagle's nest",
  'w1-19-read-bare': 'the boa with nothing near',
  'w1-19-hunters': 'the two boas',
  'w1-19-old-boa': 'the Old Boa',
  // walking only: never offered
  'w1-forest-edge': null,
  'w1-morning-path': null,
  'w1-home-banks': null,
  'w1-meadow': null,
  'w1-fern-bank': null,
  'w1-clearing': null,
  'w1-high-walk': null,
  'w1-high-walk-up': null,
  'w1-bough-bench': null,
  'w1-bough-bench-up': null,
  'w1-log-walk': null,
  'w1-sunlit-log': null,
  'w1-quiet-arrival': null,
  'w1-13-low-arrival': null,
  'w1-13-root-arrival': null,
  'w1-13-long-log': null,
  'w1-13-twin-logs': null,
  'w1-13-root-dip': null,
  'w1-13-root-hump': null,
  'w1-12-arrival': null,
  'w1-12-root-steps': null,
  'w1-12-root-hump': null,
  'w1-12-root-dip': null,
  'w1-12-stones': null,
  'w1-12-hollow-log': null,
  'w1-12-exit': null,
  'w1-14-roots': null,
  'w1-14-rest-a': null,
  'w1-14-rest-b': null,
  'w1-14-rest-c': null,
  'w1-14-rest-d': null,
  'w1-14-rest-e': null,
  'w1-14-rest-f': null,
  'w1-14-rest-g': null,
  'w1-14-rest-h': null,
  'w1-14-rest-i': null,
  'w1-14-view-north': null,
  'w1-15-arrival': null,
  'w1-15-rest-roots': null,
  'w1-15-rest-log': null,
  'w1-15-rest-dip': null,
  'w1-15-rest-hump': null,
  'w1-15-rest-stumps': null,
  'w1-15-freshest-mark': null,
  'w1-16-arrival': null,
  'w1-16-rest-roots': null,
  'w1-16-rest-log': null,
  'w1-16-rest-hump': null,
  'w1-16-rest-dip': null,
  'w1-16-rest-steps': null,
  'w1-16-rest-stumps': null,
  'w1-16-far-bank': null,
  'w1-17-arrival': null,
  'w1-17-rest': null,
  'w1-17-rest-hollow': null,
  'w1-17-rest-shelf': null,
  'w1-17-rest-dip': null,
  'w1-17-rest-moss': null,
  'w1-17-exit': null,
  'w1-18-arrival': null,
  'w1-18-rest': null,
  'w1-18-exit': null,
  'w1-19-arrival': null,
  'w1-19-rest': null,
  'w1-19-rest-crook': null,
  'w1-19-rest-stair': null,
  'w1-19-rest-wall': null,
  'w1-19-rest-bounce': null,
  'w1-19-exit': null,
};

/** when the run's stretches are not known (the stage could not say): World 1's main moves */
export const STRETCH_FALLBACK: readonly string[] = ['the first jumps', 'the double-jump gaps', 'the mushroom bounce', 'the high branches'];

/** the old control course's stretches that are not a challenge (protoStage.ts) */
const NOT_HARD = new Set(['Finish', 'Run and stop']);

/**
 * The run's stretches as the survey's choices: in the order they were met, each phrase once. A gen2 label (`w1-stones:ki`) is looked up;
 * the old control course's plain names pass through as they are. A gen2 section the table does not know is left out (never its raw id).
 */
export function stretchChoices(labels: readonly string[]): string[] {
  const out: string[] = [];
  for (const label of labels) {
    const id = label.split(':')[0];
    let words: string | null;
    if (id in STRETCH_WORDS) words = STRETCH_WORDS[id];
    else if (/^w\d-/.test(id)) words = null;
    else words = NOT_HARD.has(label) ? null : label;
    // (a chip starts with a capital, as Running and Nothing beside it do)
    const chip = words ? words[0].toUpperCase() + words.slice(1) : '';
    if (chip && !out.includes(chip)) out.push(chip);
  }
  return out.length ? out : STRETCH_FALLBACK.map((w) => w[0].toUpperCase() + w.slice(1));
}

/**
 * The recorder's 'section' moment for a stretch: a gen2 label becomes `<plain words> | <label>` (`The stepping stones | w1-stones:ki`, or
 * `Walking | w1-meadow:rest` for one that only walks), so a "hardest" answer lines up with where he lost lives; any other label (the old
 * control course's names) is kept as it is.
 */
export function sectionLabel(label: string): string {
  const id = label.split(':')[0];
  if (!(id in STRETCH_WORDS)) return label;
  const w = STRETCH_WORDS[id];
  return `${w ? w[0].toUpperCase() + w.slice(1) : 'Walking'} | ${label}`;
}

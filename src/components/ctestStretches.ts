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
  'w1-bough-log': 'the high branches',
  'w1-dipping-boughs-twist': 'the high branches',
  // logs
  'w1-log-road': 'the logs',
  'w1-hollow-twoway': 'the logs',
  'w1-log-chain': 'the logs',
  // going back down
  'w1-dropdown-stair': 'the drops back down',
  'w1-stump-descent': 'the drops back down',
  'w1-bough-descent': 'the drops back down',
  'w1-log-steps-descent': 'the drops back down',
  'w1-canopy-drop': 'the drops back down',
  // the rope
  'w1-ropes': 'the rope',
  // walking only: never offered
  'w1-forest-edge': null,
  'w1-morning-path': null,
  'w1-home-banks': null,
  'w1-meadow': null,
  'w1-fern-bank': null,
  'w1-clearing': null,
  'w1-high-walk': null,
  'w1-bough-bench': null,
  'w1-log-walk': null,
  'w1-sunlit-log': null,
  'w1-quiet-arrival': null,
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

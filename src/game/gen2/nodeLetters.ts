/**
 * gen2/nodeLetters — the ONE letter grammar (ENGINE-678 W0 HOOKS; NODES.md §8.0): every job letter and content letter, what the code
 * makes of it and what the key says of it, in one file. nodeCode.ts derives JOB_OF, CONTENT_OF and its LATER jobs from JOB_LETTERS and
 * CONTENT_LETTERS; nodeAsks.ts its LATER_CONTENT; tools/engine/nodekey.ts writes NODE-KEY.html's Jobs, Made of and pieces rows from
 * these and the *_WORDS below (nodeLetters.test.ts fails when the key and this file disagree). A new letter is added HERE, once.
 *
 * The *_WORDS (the key's words) are typed over the same letters, so a letter with no words is a type error; nothing in the game reads
 * them, so the build leaves them out of what ships.
 */
import type { NodeJob } from './types.ts';

/** what the key shows: 'now' the rolls lay it (in 1-1's terms where the key says so), 'later' named but not laid yet */
export type KeyStatus = 'now' | 'later';

export interface JobLetter {
  job: NodeJob;
  key: KeyStatus;
  /** V13 (NODES §6): a LATER node, refused unless the stage's rules allow it */
  later?: true;
}

export interface ContentLetter {
  /** its name in the code (CONTENT_OF) */
  name: string;
  key: KeyStatus;
  /** no emitter keyed by this letter in the tree: why, and where it is built (nodeAsks.ts names it when a roll asks for it) */
  unlaid?: string;
  /** the dials a node of this letter will turn, each with its values, and the packet that lays them (named now, LATER) */
  dials?: Readonly<Record<string, string>>;
  dialsBy?: string;
}

export const JOB_LETTERS = {
  A: { job: "arrive", key: "now" },
  T: { job: "teach", key: "now" },
  P: { job: "practise", key: "now" },
  X: { job: "test", key: "now" },
  C: { job: "combine", key: "now" },
  W: { job: "twist", key: "now" },
  R: { job: "rest", key: "now" },
  S: { job: "signature", key: "now" },
  F: { job: "fork", key: "now" },
  U: { job: "climb", key: "now" },
  D: { job: "descent", key: "now" },
  M: { job: "flow", key: "now" },
  E: { job: "exit", key: "now" },
  L: { job: "finale", key: "later" },
  H: { job: "reward", key: "later" },
  K: { job: "pressure", key: "later", later: true },
  Z: { job: "puzzle", key: "later", later: true },
  B: { job: "arena", key: "later", later: true },
  Y: { job: "story", key: "later", later: true },
  V: { job: "preview", key: "later", later: true },
  G: { job: "change", key: "later", later: true },
  "?": { job: "pick", key: "later" },
} as const satisfies Readonly<Record<string, JobLetter>>;

export const CONTENT_LETTERS = {
  g: { name: "ground", key: "now" },
  f: { name: "floating", key: "now" },
  c: { name: "climb", key: "now" },
  b: { name: "bounce", key: "now" },
  r: { name: "rope", key: "later" },
  k: { name: "crumble", key: "later" },
  w: { name: "water", key: "later" },
  h: { name: "hazard", key: "later", dials: { roll: "low|bounce", gap: "s between rolls", teach: "nudge (the first one costs no heart)" }, dialsBy: "ENGINE-678 B2 ROLL" },
  s: { name: "swing", key: "later", unlaid: "the swing vine (liana) as a content block: its emitter keyed by letter is not built", dials: { grip: "low|high", phase: "free|runner", moss: "on (a mossy liana is cover)" }, dialsBy: "ENGINE-678 A1 SWING-W1 (grip), B3 COVER (moss), B6 CHASE-FINISH (phase)" },
  v: { name: "field", key: "later", unlaid: "the vine field (two hands): B14's emitter on t-b14, not merged" },
  p: { name: "beat", key: "later", unlaid: "beat pieces on a clock (pods, snap stones): B14's emitter on t-b14, not merged" },
  t: { name: "gate", key: "later", unlaid: "the gate a find opens (the fig gate): B14's emitter on t-b14, not merged" },
  x: { name: "trap", key: "later", unlaid: "the trap (a limb load over an animal): B15's emitter on t-b15, not merged" },
  m: { name: "cover", key: "now", dials: { kind: "bush|carpet|patch|hanging", apart: "px between covers" }, dialsBy: "ENGINE-678 B3 COVER" },
} as const satisfies Readonly<Record<string, ContentLetter>>;

export type JobLetterId = keyof typeof JOB_LETTERS;
export type ContentLetterId = keyof typeof CONTENT_LETTERS;

/** the key's words for each job: its name, the rule, and how it plays in plain words */
export const JOB_WORDS: Readonly<Record<JobLetterId, readonly [string, string, string]>> = {
  A: ["Arrive", "Flat and safe. No ground ends and nothing hurts in the first 1,300 px.", "You walk in on soft moss floor and look around. Nothing can hurt you yet."],
  T: ["Teach", "One new move, in three steps: shown; then a safe check that blocks the way until you do the move (a miss costs nothing); then one small challenge. Flat or rising, never on a fork. Checked by a test player without the move, who can't get past.", "Something new turns up, like a step too tall to hop. You try the new move where missing is safe, then use it once for real."],
  P: ["Practise", "A taught move again, a little changed each time. May sit on a fork. One exact repeat is allowed before a rest.", "You do the move you just learned a few more times, each one a bit different."],
  X: ["Test", "A taught move under pressure, and required: a test player without it fails here, the full player passes. A rest follows, and it eases off at its end.", "A harder stretch you can only get through by using the move. Then it lets up."],
  C: ["Combine", "Two taught moves on one beat: the stage's pair (in 1-1, bounce then double).", "Two moves back to back, like a mushroom bounce straight into a double jump."],
  W: ["Twist", "A taught move turned around: its rhythm differs from the stretch before. Only after a test. A rest follows.", "A move you know, used a new way, so the rhythm you just got used to breaks."],
  R: ["Rest", "About twice the local beat, with no hard input. Comes after every test, twist and set piece. Holds a Dot spot (she speaks only where one of Matt's approved lines fits).", "A calm patch to breathe. Dot might say something here."],
  S: ["Signature", "One per stage, unique in the game, in the last third. It links to what came before, lets him suddenly do something new, and says itself in one phrase. A rest or the exit follows.", "The one big moment you remember the stage by, like a chain of double jumps across floating logs."],
  F: ["Fork", "Two roads that both finish and rejoin. The high road holds a find. Both roads pass every check. It counts as its low road's type.", "The path splits: a harder high road with a treasure, or an easier low road. Both get you there."],
  U: ["Climb", "A rising stair of landings, taught moves only. A straight-up trunk climb only where a stage owns it (World 1: 1-4).", "You hop up a staircase of logs and ledges toward the treetops."],
  D: ["Descent", "Across and down.", "You drop down ledge by ledge toward the forest floor."],
  M: ["Flow", "A run of quick beats at the roll's tempo, never more than 2.5 s with nothing to do.", "A run where every jump leads straight into the next, without stopping."],
  E: ["Exit", "The end piece where the stage's trend arrives. In 1-1: a long high log with the exit totem, and the clue. After a signature it must be a real breath: a calm walk-on, at least a rest long.", "You walk out along a long high log to the totem, calm, and the stage is done."],
  L: ["Finale", "15-20 s at the exit, everything taught, dense. Not in 1-1 (it ends quiet).", "The last stretch throws everything you've learned at you, fast."],
  H: ["Hidden alcove", "A find off the main route, proven reachable.", "A sneaky spot off the path with something to find, if you look."],
  K: ["Chase", "Moving pressure. Never in a world's first stage. World 1's chase is 1-8's, by story.", "Something is coming. Keep moving and don't stop."],
  Z: ["Puzzle room", "A hand-built room that stays as built.", "A room where you stop and work out how to get through."],
  B: ["Arena", "A fight in a held space, on the combat ladder.", "You hold one spot and deal with the creatures that come."],
  Y: ["Story beat", "A beat the brief names (the note, a clue), with no hard input over it.", "You stop for a moment and something in the story happens."],
  V: ["Boss preview", "The boss's attack in small form, in a world's 9th stage only.", "A small taste of what the boss will throw at you."],
  G: ["Change of pace", "One sense flipped: slow, dark or a puzzle. A world's 6th stage's job.", "The stage suddenly feels different: slower, darker or a head-scratcher."],
  "?": ["Pick", "A walked choice, written ?[a|b]: the roll lays ONE of the two stretches (the card road, NODES.md §8.9). Not laid yet: a graph that writes one fails by name.", "Two stretches could go here; only one is laid."],
};

/** the key's words for each content letter: its name, the rule, and how it plays in plain words */
export const CONTENT_WORDS: Readonly<Record<ContentLetterId, readonly [string, string, string]>> = {
  g: ["Ground jump run", "Pieces on the moss floor road: hops, gap jumps, stone runs, stump stiles, mounds. Landings 3.5-7 body widths. Rocks sit on the ground, never float.", "You jump along the forest floor over stones, stumps and dips. In 1-1 a miss just drops you to the floor."],
  f: ["Floating pieces", "Boughs, floating logs, plank spans. Platforms may float. In 1-1, only in the last third. Moving lifts come later (World 2).", "You hop across branches and logs hanging in the air."],
  c: ["Climb", "A rising stair of landings.", "Each landing is a little higher than the last, so you go up as you go along."],
  b: ["Bounce", "A mushroom seated on a stump or bank, never floating; a twin bounce; a bounce into a double.", "You land on a mushroom and it springs you up high."],
  r: ["Rope and climbing vine", "Shimmy rope (taught 1-3), and a climbing vine whose foot reaches a landing. Straight up or down on a vine always climbs. The swinging liana is s. Not in 1-1.", "You grab a rope or a vine and shimmy across or climb."],
  k: ["Crumble", "A creaky limb that gives way (0.5 s on Normal). A required one is whole again when he respawns. Taught 1-5.", "A branch creaks and drops away soon after you land, so don't wait around."],
  w: ["Water", "Lily pads, stones on the bed, drifting logs.", "You cross water on pads, stones and floating logs."],
  h: ["Hazard", "The world's taught hazards, which come back in later worlds.", "Something on the way hurts, so you go over or around it."],
  s: ["Swing vine (liana)", "A liana hung from a bough or the canopy, with a landing past its swing (taught 1-6).", "You grab a hanging vine, swing, and let go to fly across."],
  v: ["Vine field", "A field of vines he climbs with two hands, hand to hand (vineField.ts).", "You climb across a wall of vines, one hand after the other."],
  p: ["Beat pieces", "Pieces on the stage clock, every one reading the one beat: pods, snap stones, a ride (beat.ts, clock.ts).", "Things move on a beat: watch the rhythm and go when it is safe."],
  t: ["Gate", "A gate a find opens (the fig gate).", "A gate blocks the way until you find what opens it."],
  x: ["Trap", "A trap: a limb's load dropped over an animal.", "You drop something on a creature from above to get past it."],
  m: ["Cover", "Cover he keeps still in while a watcher looks: a bush, a moss carpet, a patch, or moss hanging from a liana (stillness.ts Cover).", "You duck into a bush or under hanging moss and keep still while it looks."],
};

/** the designer's MUST / MAY / NEVER for each content letter that has a piece rule (NODES.md §8.0, rule V18); a letter not laid yet has
 *  none, and its key card shows no Pieces */
export const PIECE_WORDS: Readonly<Partial<Record<ContentLetterId, readonly [string, string, string]>>> = {
  g: ["The moss floor road under it, plus at least one of: a mossy stone, a log on a stump, a stump, a mound or a bank.", "A low log; dressing off to the side; petals low on the ground.", "A rock, stone, mound or bank in the air; water pieces; a rope or vine as the way across."],
  f: ["At least one floating platform: a solid log, a branch, or plank-bridge planks.", "Catch branches under each gap; a trunk in the art.", "A floating rock or stone; a trunk used as something to land on; a moving lift in World 1."],
  c: ["Landings that each sit higher than the last: a log, a branch, or a mossy stone on a bank or its own base.", "A stump as a step.", "A trunk used as something to land on; climbing a vine up a trunk, except in the stage that owns it (World 1: 1-4)."],
  b: ["A bounce mushroom sitting on the floor, a bank, a stump or a log.", "", "A mushroom in the air; a bouncy branch or bouncing stone in World 1; the small decoration mushrooms used as something to land on."],
  r: ["A rope tied at both ends at about the same height; or a climbing vine that reaches a landing at its foot.", "", "Any rope or vine in 1-1; a vine hanging from open sky; a trunk used as something to land on; a swinging liana (that is s)."],
  k: ["A creaky branch on a trunk or bough, in World 1's branch art.", "", "World 7's crumbling stone floor in World 1; a crumbling stone in the air."],
  w: ["Drawn water, with lily pads on its surface, stones sitting on its bed, or drifting logs on a drawn river.", "", "Lily pads, reeds or drifting logs anywhere off water; a stone floating on the water."],
  h: ["The world's own taught hazard (for example World 3's thorn vines hanging or swinging from trunks).", "", "A hazard before its world teaches it; another world's hazard art."],
  s: ["A liana hung from a bough or the canopy, with a landing past its swing.", "", "A liana hanging from open sky."],
};

/**
 * NODE-KEY.html's Jobs, Made of and pieces rows, as tools/engine/nodekey.ts writes them and nodeLetters.test.ts reads them back: each
 * row the table's status with the key's words, and a content letter's named dials after its rule
 */
export function keyBlocks(): { JOBS: string; CONTENT: string; PIECES: string } {
  const q = (s: string) => JSON.stringify(s);
  const k = (l: string) => (/^[A-Za-z]$/.test(l) ? l : q(l));
  const row = (l: string, cells: readonly string[]) => `${k(l)}:[${cells.map(q).join(',')}]`;
  const block = (name: string, rows: string[]) => `const ${name}={\n${rows.join(',\n')}\n}`;
  const dials = (c: ContentLetter) =>
    c.dials ? ` Dials, named for ${c.dialsBy}: ${Object.entries(c.dials).map(([d, v]) => `${d} ${v}`).join('; ')}.` : '';
  const jobs = Object.entries(JOB_WORDS).map(([l, w]) => row(l, [w[0], JOB_LETTERS[l as JobLetterId].key, w[1], w[2]]));
  const content = Object.entries(CONTENT_WORDS).map(([l, w]) => {
    const c: ContentLetter = CONTENT_LETTERS[l as ContentLetterId];
    return row(l, [w[0], c.key, w[1] + dials(c), w[2]]);
  });
  const pieces = Object.entries(PIECE_WORDS).map(([l, w]) => row(l, w!));
  return { JOBS: block('JOBS', jobs), CONTENT: block('CONTENT', content), PIECES: block('PIECES', pieces) };
}

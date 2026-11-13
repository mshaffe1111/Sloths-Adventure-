/**
 * 1-4 Up the Kapok, the level as DESIGNED (reference/design/1-4.md on t-15-design@dee8c8c0; FEEL-LATTICE.md): World 1's rows for it.
 * The idea in one sentence: the kapok is hung with a field of little vines; he climbs vine to vine between its falling pods and frees the
 * figs that weigh down the bough across the way up.
 *
 * ONE graph (the arc below), one brick a beat, laid UP as a tower (gen2 tower.ts, the ascent lay): every roll is the same level in the
 * same order with its own small differences (which side a storey runs, how the turns fall). WORLD DATA: no engine line names this stage;
 * listed.ts gives it its own kit (kitLib14) and its finish (finish14), stageTable.ts lists it.
 *
 * The vine field, the figs, the gates and the pods are laid by the FINISH from each section's FIELD row, by piece key (types.ts
 * Vine.tag / Platform.tag, `uid:key`): which vines are a field, which hold a fig bunch and how high, which bough the figs shut, which
 * columns pods fall down and on which beat. The pieces themselves are general (vineField.ts, podfall.ts, beat.ts, fieldPlay.ts).
 *
 * Stand-ins and cuts, named plainly (the report carries them): the flyer and the ant file (1-4.md piece 8) are not laid yet; the crown's
 * draped liana is a field of three; fig pickups on the vines are not laid (the figs are the gates' bunches); the pods, figs and shut
 * boughs are code-drawn until ART's painted pieces land.
 */
import type { ClockDef } from '../../stageKit.types.ts';
import type { Platform, Vine } from '../../types.ts';
import type { Difficulty } from '../../difficulty.ts';
import type { GraphBrief, SectionPiece, SectionTemplate, Socket, WorldKit } from '../types.ts';
import { w1World } from './w1.ts';
import { FIELD_FEEL, gateFaults, type ClusterGate, type VineCluster } from '../../vineField.ts';
import { podBeat, podFaults, type PodColumn } from '../../podfall.ts';
import type { KitDecor } from '../../puzzleArt.ts';
import { nestDoorAt } from '../../artDress.ts';

/** the stage these rows are for: the tag its sections carry (stagePool) and the key of its brief */
export const STAGE_14 = '1-4';
type R2 = [number, number];

/** 1-4's ONE graph (1-4.md "The arc"): A arrive, T going up (the slide, by shape), T rotting boughs, T the field (two hands), T pods,
 *  P push the figs up, X pushing under fire, W his turn to drop one, S the hollow, C the crown, E the view north; R the rests between */
// (R-165.206, POLISH-1 11-13: a quick player ran it in 81-101 s; two beats more, each with its own job (a practise gate of two, a test
//  across two columns), each after its own rest, each its own job so no roll can reorder the level (U a climb after the practise, M a
//  flow after the test: one section a job, level.md rule 2)
export const ARC_14: Record<string, string> = { 'ascent-14-arc': 'A T T R T T P R U R X R M R W R S R C E' };
/** 1-4's brief, all of it data: an ascent of fields, its cast 1-3's snake */
export const BRIEF_14: GraphBrief = {
  ends: 'quiet', trend: 'up', branching: 'none', teaches: ['slide', 'creak', 'field', 'pods'],
  // (the deal is the arc's own, one type a beat, no type over V11's 40% and no two teaches of one type (V2): ground the going-up (a
  // walk along wide low boughs with two short climbs, sound wood under every one); crumble the rotting boughs and the crown's rotten stair; climb the field, both pushes and the drop;
  // hazard the pods, under fire, the columns and the hollow: 1, 2, 4 and 4 of the eleven content nodes)
  deal: { ground: 9, crumble: 18, climb: 36, hazard: 37 }, dealExact: true,
  cast: ['snake'],
  // (every laid piece carries its section's uid and key, so finish14 finds the fields, figs and gates by key: FA's option, GraphBrief.tags)
  tags: true,
};
/** the story keeper's lines for 1-4, verbatim (the lead, 11-13 10:44 AM ET: final, Matt 10:43 AM; t-story@400b4c13 STORY-KEEPER.md; the pods line the keeper's 7-word trim, under §5b.7's 10 words, via the lead):
 *  the only player words this file holds. Dot, each said once at the first of its thing */
export const LINES_14 = {
  creak: 'Creaky limbs drop you, but just one branch down!',
  field: 'Reach for the next vine! Two hands zoom up!',
  pods: 'Hear it creak? Scoot a vine over!',
  figs: 'Climb under the figs and push them free!',
} as const;
/** Pokey's halfway line (STORY-KEEPER.md:149; 1-4.md beat 6): said by wayside.ts (World 1 stage 4, at half the way), in his voice */
export const HALFWAY_14 = 'Meeca climbs this every Sunday. I waved from below.';
/** the journal line (pokeyJournal.ts:51's 1-4, the keeper's rewrite) */
export const JOURNAL_14 = 'Climbed the kapok between falling pods. From the top you can see where they took her.';

// ───────────────────────────── the numbers (1-4.md "The vine field", "On a phone") ─────────────────────────────
/** vines in a field stand this far apart (px): in reach for two hands (FIELD_FEEL.reach 90), 70-90 by the design */
export const GAP = 80;
/** a field's foot runs this far past its first and last vine (px): room to stand at each end */
const MARGIN = 60;
/** how far a gate field's foot runs out past its sealed bough at each end (px): one vine spacing, so a step off either end of the gate
 *  lands on the field's own foot one storey down (tower.ts towerFalls; FA's sealed piece gets no catch from the lay) */
export const GATE_RUN = GAP;
/** a pod's bottom hangs this far under its bough's top (px): a drawn pod's length (vineFieldArt.ts drawPod) */
const POD_HANG = 110;
/** a fig bunch's height (px) */
const FIG_H = 56;
/** the pods' tell (s, Normal; Easy times the beat's stretch: 1.5 s) and Easy's stretch (1-4.md "Easy ... tells 1.5 s, beats 1.4x") */
const TELL = 1.0, EASY_STRETCH = 1.5;
/** the beats (1-4.md "Steady, then grown": ONE steady beat through beats 4-5, it quickens only from beat 7): the steady teach beat, the
 *  grown beat of beats 7-9 and the crown (the fields' 1.2-2.0 s safe of 3.0-3.6 s) and the quick one of the hollow (0.8-0.9 s safe).
 *  Each beat's 'on' is its own longest column's fall and burst (podOn). No field stands over POD.catchBelow (450 px: a knock from any
 *  point lands him on sound wood, 1-4.md "Pods fair"), so a column (H less POD_HANG) is at most 340 px and its 'on' 1.2 s; and a beat is
 *  its quiet, its 1.0 s tell (tellMin) and its 'on', so its safe window is never under the tell. The hollow's window is the least those
 *  two rules leave, 1.1 s of a 2.3 s beat (the design's 0.8-0.9 s of 2.4 s needs a shorter tell or a taller field: neither is loosened,
 *  the lead's call 11-13). The crown keeps two columns, so it stays on the grown beat: two tells in one 2.3 s beat cannot both be 1.5 s
 *  apart (POD.apart) */
const BEATS = { steady: 3.6, grown: 3.0, quick: 2.3 } as const;

/** a bough: on the way up (`main`: the lay may stand a flag on one 160 px or more wide, FA's rule), a landing unless told */
const branch = (key: string, place: SectionPiece['place'], w: number, o: Partial<SectionPiece> = {}): SectionPiece =>
  ({ key, shape: 'branch', w: [w, w], place, style: 'branch', landing: true, main: true, ...o });
const climbOn = (key: string, on: string, onW: number, x: number, h: number): SectionPiece =>
  ({ key, shape: 'vine', w: [0, 0], place: { kind: 'climb', on, at: [x / onW, x / onW], h: [h, h] } });
const flag = (on: string, t = 0.5): Socket => ({ id: 'flag', role: 'flag', on, t });
const tip = (id: string, on: string, t: number, line: keyof typeof LINES_14): Socket => ({ id, role: 'tip', on, t, allow: [line] });
const petals = (id: string, on: string, t: R2 | number, n = 1, span = 80): Socket => ({ id, role: 'pickup', on, t, dn: 34, count: n, span });

/** a field's row: its vines' keys f1..fn, which hold a fig bunch (its bottom `over` px over the foot), which columns pods fall down
 *  (shift: s into the beat), the beat, and whether its top bough is a gate the figs shut */
interface FieldRow {
  n: number;
  /** the vines' height (px), foot to bough */
  H: number;
  figs: Array<{ vine: number; over: number }>;
  pods: Array<{ vine: number; shift: number }>;
  beat?: keyof typeof BEATS;
  gate: boolean;
  /** Easy's figs (one fewer on a gate of two or more: 1-4.md "gates of one cluster fewer") */
  easyFigs?: Array<{ vine: number; over: number }>;
  /** the piece the vines stand on (default 'foot') */
  foot?: string;
}
/** the finish's rows, by section template id */
export const FIELD_ROWS: Record<string, FieldRow> = {};

/** a field: a foot bough, n vines GAP apart standing on it, H tall, and a bough over them at their tops (the section's exit) */
function field(id: string, name: string, o: { jobs: NonNullable<SectionTemplate['jobs']>; job: SectionTemplate['phases']; teaches?: string; uses?: string[]; difficulty: number; row: FieldRow; tips?: Socket[]; content?: 'climb' | 'hazard' }): SectionTemplate {
  const W = 2 * MARGIN + (o.row.n - 1) * GAP;
  // (a gate's bough is SEALED (FA, SectionPiece.sealed): the lay adds nothing level with it or within a hop, so the fruit is the only
  //  way on, and nothing of the lay's catches a step off its ends: its own foot runs GATE_RUN out under both, one storey down)
  const run = o.row.gate ? GATE_RUN : 0;
  const WF = W + 2 * run;
  // (a field's foot is walked onto, never landed on: no `landing`, so Easy does not widen it and pull its vines out of two hands' reach)
  const pieces: SectionPiece[] = [branch('foot', { kind: 'start' }, WF, { landing: false })];
  for (let i = 0; i < o.row.n; i++) pieces.push(climbOn(`f${i + 1}`, 'foot', WF, run + MARGIN + i * GAP, o.row.H));
  // (its top is climbed onto, never jumped to: no `landing` either, or Easy widens it past its vines and the lay's way up from it with it)
  pieces.push(branch('top', { kind: 'over', on: 'foot', at: [run / WF, run / WF], dy: [-o.row.H, -o.row.H] }, W, { landing: false, ...(o.row.gate ? { sealed: true } : {}) }));
  FIELD_ROWS[id] = o.row;
  return {
    id, name, feel: [STAGE_14], own: true, archetypes: 'any', phases: o.job, jobs: o.jobs, difficulty: o.difficulty, content: o.content ?? 'climb',
    ...(o.teaches ? { teaches: o.teaches } : {}), uses: o.uses ?? [], needs: [],
    pieces, entry: { piece: 'foot', kind: 'ledge' }, exit: { piece: 'top', kind: 'ledge' }, exitDy: -o.row.H,
    sockets: [...(o.tips ?? [])], mirrorable: false,
  } as SectionTemplate;
}

// ───────────────────────────── the beats ─────────────────────────────
/** [A] arrive: the buttress roots on the forest floor in mist; her last petal low on the bark */
const ARRIVE: SectionTemplate = {
  id: 'w1-14-roots', name: 'arrive: the buttress roots', feel: [STAGE_14], own: true, archetypes: 'any', phases: ['start'], jobs: ['arrive'], difficulty: 1,
  pieces: [{ key: 'roots', shape: 'bank', w: [520, 560], place: { kind: 'start' }, style: 'moss_stone', main: true }],
  entry: { piece: 'roots', kind: 'ground' }, exit: { piece: 'roots', kind: 'ground' }, exitDy: 0,
  sockets: [petals('petal', 'roots', 0.7)], mirrorable: false,
} as SectionTemplate;

/** [T] going up: a single vine from the root to a wide, low, sound bough with ground under it; then a taller one. The slide down is
 *  learned by shape (down on one hand is quicker), no words */
const GOING_UP: SectionTemplate = {
  id: 'w1-14-going-up', name: 'going up: a vine, then a taller one', feel: [STAGE_14], own: true, archetypes: 'any', phases: ['ki', 'sho', 'ten', 'ketsu'], jobs: ['teach'],
  difficulty: 2, content: 'ground', teaches: 'slide', uses: [], needs: [],
  pieces: [
    // (a bough: the ascent lay turns up off the floor after the arrival, so this beat starts a storey up, never on the ground)
    branch('foot', { kind: 'start' }, 300),
    climbOn('v1', 'foot', 300, 240, 220),
    branch('b1', { kind: 'over', on: 'v1', at: [0, 0], dy: [0, 0] }, 340),
    climbOn('v2', 'b1', 340, 290, 320),
    branch('b2', { kind: 'over', on: 'v2', at: [0, 0], dy: [0, 0] }, 260),
  ],
  entry: { piece: 'foot', kind: 'ledge' }, exit: { piece: 'b2', kind: 'ledge' }, exitDy: -540,
  sockets: [petals('p', 'b1', 0.4)], mirrorable: false,
} as SectionTemplate;

/** [T] rotting boughs: one rotting bough a short drop over sound wood (it gives at the creak's hold); then two in a row he crosses at a
 *  walk. The sound wood runs under all three (a drop costs nothing) */
const ROT = 110, SOUND_W = 640;
const ROTTING: SectionTemplate = {
  id: 'w1-14-rotting', name: 'rotting boughs over sound wood', feel: [STAGE_14], own: true, archetypes: 'any', phases: ['ki', 'sho', 'ten', 'ketsu'], jobs: ['teach'],
  difficulty: 3, content: 'crumble', teaches: 'creak', uses: [], needs: ['jump'],
  pieces: [
    branch('a', { kind: 'start' }, 220),
    branch('s', { kind: 'walk', after: 'a', dy: [80, 80] }, SOUND_W),
    branch('r1', { kind: 'over', on: 's', at: [30 / SOUND_W, 30 / SOUND_W], dy: [-80, -80] }, ROT, { creak: true }),
    branch('r2', { kind: 'over', on: 's', at: [300 / SOUND_W, 300 / SOUND_W], dy: [-80, -80] }, ROT, { creak: true }),
    branch('r3', { kind: 'over', on: 's', at: [410 / SOUND_W, 410 / SOUND_W], dy: [-80, -80] }, ROT, { creak: true }),
    branch('z', { kind: 'walk', after: 'r3', dy: [0, 0] }, 200),
  ],
  entry: { piece: 'a', kind: 'ledge' }, exit: { piece: 'z', kind: 'ledge' }, exitDy: 0,
  sockets: [tip('tip', 'a', 0.3, 'creak')], mirrorable: false,
} as SectionTemplate;

/** [T] the field: five vines 80 apart over sound wood, nothing falling: he finds two hands, races up, slides down */
const FIELD_TEACH = field('w1-14-field', 'the field: five vines, nothing falling', {
  jobs: ['teach'], job: ['ki', 'sho', 'ten', 'ketsu'], teaches: 'field', difficulty: 3,
  row: { n: 5, H: 400, figs: [], pods: [], gate: false },
  tips: [tip('tip', 'foot', 0.15, 'field')],
});
/** [T] pods: pods down two of five columns on ONE steady beat (3.6 s), half a beat apart; the first watched from the foot, a column he is
 *  not on. Dot's line at the foot */
const PODS = field('w1-14-pods', 'pods down two columns, one steady beat', {
  jobs: ['teach'], job: ['ki', 'sho', 'ten', 'ketsu'], teaches: 'pods', uses: ['field'], difficulty: 4, content: 'hazard',
  row: { n: 5, H: 360, figs: [], pods: [{ vine: 2, shift: 0 }, { vine: 4, shift: BEATS.steady / 2 }], beat: 'steady', gate: false },
  tips: [tip('tip', 'foot', 0.12, 'pods')],
});
/** [P] push the figs up: the way up shut by a sagging bough; ONE fig bunch low on a vine nothing falls on, pods on the steady beat two
 *  columns away */
const PUSH = field('w1-14-push', 'push the figs up: a gate of one', {
  jobs: ['practise'], job: ['ki', 'sho', 'ten', 'ketsu'], uses: ['field', 'pods'], difficulty: 5,
  row: { n: 5, H: 360, figs: [{ vine: 1, over: 150 }], pods: [{ vine: 4, shift: 0 }], beat: 'steady', gate: true },
  tips: [tip('tip', 'foot', 0.12, 'figs')],
});
/** [X] pushing under fire: a gate of two bunches, pods down both push vines (half a beat apart), the vines between free */
const UNDER_FIRE = field('w1-14-under-fire', 'a gate of two, pods down the push vines', {
  jobs: ['test'], job: ['sho', 'ten', 'ketsu'], uses: ['field', 'pods'], difficulty: 6, content: 'hazard',
  row: { n: 5, H: 400, figs: [{ vine: 1, over: 150 }, { vine: 4, over: 250 }], pods: [{ vine: 1, shift: 0 }, { vine: 4, shift: BEATS.grown / 2 }], beat: 'grown', gate: true, easyFigs: [{ vine: 4, over: 250 }] },
});
/** [U] push the figs up, twice (a climb): a gate of two bunches on two vines apart, pods on the steady beat down the free column between them,
 *  so the second push is a step across a column he times (R-165.206: the push practised before it is tested under fire). Easy: one bunch */
const PUSH_TWO = field('w1-14-push-two', 'push the figs up: a gate of two, a column between', {
  jobs: ['climb'], job: ['sho', 'ten', 'ketsu'], uses: ['field', 'pods'], difficulty: 5,
  row: { n: 5, H: 380, figs: [{ vine: 2, over: 150 }, { vine: 5, over: 230 }], pods: [{ vine: 3, shift: 0 }], beat: 'steady', gate: true, easyFigs: [{ vine: 2, over: 150 }] },
});
/** [M] across the columns (a flow): a gate of two at the field's two ends, pods on the grown beat down the two columns between (half a beat
 *  apart), so he crosses both on their beat to reach the far bunch and back (R-165.206; under fire's pods are ON the push vines, here he
 *  crosses them: a test of its own). Easy: the far bunch only */
const COLUMNS = field('w1-14-columns', 'across the columns: a gate at both ends', {
  jobs: ['flow'], job: ['sho', 'ten', 'ketsu'], uses: ['field', 'pods'], difficulty: 6, content: 'hazard',
  row: { n: 6, H: 420, figs: [{ vine: 1, over: 160 }, { vine: 6, over: 240 }], pods: [{ vine: 3, shift: 0 }, { vine: 5, shift: BEATS.grown / 2 }], beat: 'grown', gate: true, easyFigs: [{ vine: 6, over: 240 }] },
});
/** [W] his turn to drop one: a snake dozes on the field's foot past its last vine; the bunch on the last vine, pushed free, thumps down
 *  beside it, and it glides off; the bough over the field lifts with it */
const DROP_ONE = (() => {
  const t = field('w1-14-drop-one', 'his turn to drop one: the figs beside the snake', {
    jobs: ['twist'], job: ['sho', 'ten', 'ketsu'], uses: ['field', 'pods'], difficulty: 6,
    row: { n: 4, H: 360, figs: [{ vine: 4, over: 160 }], pods: [{ vine: 2, shift: 0 }], beat: 'grown', gate: true },
  });
  // (the foot runs on past the last vine to the snake's spot, within TRAP.scare (170) of where the bunch comes down)
  const W = 2 * MARGIN + 3 * GAP + 160;
  t.pieces = t.pieces.map((p) => (p.key === 'foot' ? { ...p, w: [W, W] } : p.shape === 'vine' && p.place.kind === 'climb' ? { ...p, place: { ...p.place, at: [((p.place.at as R2)[0] * (W - 160)) / W, ((p.place.at as R2)[0] * (W - 160)) / W] } } : p.key === 'top' ? { ...p, w: [W - 160, W - 160] } : p));
  t.sockets = [{ id: 'e1', role: 'enemy', on: 'foot', t: (W - 70) / W, dn: 0, allow: ['snake-asleep'], easy: 'keep' }];
  return t;
})();
/** [S] the hollow: the tallest field, a gate of three, pods on the quicker beat down one push vine */
const HOLLOW = field('w1-14-hollow', 'the hollow: a gate of three, the quicker beat', {
  jobs: ['signature'], job: ['sho', 'ten', 'ketsu'], uses: ['field', 'pods'], difficulty: 8, content: 'hazard',
  row: { n: 6, H: 440, figs: [{ vine: 1, over: 140 }, { vine: 3, over: 300 }, { vine: 6, over: 200 }], pods: [{ vine: 3, shift: 0 }], beat: 'quick', gate: true, easyFigs: [{ vine: 1, over: 140 }, { vine: 6, over: 200 }] },
});
/** [C] the crown: a rotten stair (three creaking steps up over the foot: one breath, no stopping) to three long vines under pods on the
 *  steady beat; up and out. Its type is the stair's (crumble); its pods make it the stage's climax */
const STEP = 100, RISE = 60, CROWN_N = 3, CROWN_H = 440;
const CROWN: SectionTemplate = (() => {
  const W = 3 * (STEP + 20) + 2 * MARGIN + (CROWN_N - 1) * GAP + 40;
  const midX = 3 * (STEP + 20) + 40, midW = 2 * MARGIN + (CROWN_N - 1) * GAP;
  const pieces: SectionPiece[] = [branch('foot', { kind: 'start' }, W, { landing: false })];
  for (let i = 0; i < 3; i++) pieces.push(branch(`r${i + 1}`, { kind: 'over', on: 'foot', at: [(20 + i * (STEP + 20)) / W, (20 + i * (STEP + 20)) / W], dy: [-RISE * (i + 1), -RISE * (i + 1)] }, STEP, { creak: true }));
  pieces.push(branch('mid', { kind: 'over', on: 'foot', at: [midX / W, midX / W], dy: [-RISE * 4, -RISE * 4] }, midW, { landing: false }));
  // (the sure way up beside the stair: a sound vine from the foot to the mid. A step gives at the creak's hold and a fall onto the foot is
  //  no set-back (engine.ts crumbledWhole runs on a set-back only), so with the stair alone a climber who stood too long on two steps was
  //  stranded under the mid until the steps grew back off screen (POLISH-1 11-13: kid Normal seed 16; level.md rule 5). The stair stays the
  //  quick way, the vine the steady one: the stage's own "one vine sure")
  pieces.push(climbOn('sure', 'foot', W, midX + 20, RISE * 4));
  for (let i = 0; i < CROWN_N; i++) pieces.push(climbOn(`f${i + 1}`, 'mid', midW, MARGIN + i * GAP, CROWN_H));
  pieces.push(branch('top', { kind: 'over', on: 'mid', at: [0, 0], dy: [-CROWN_H, -CROWN_H] }, midW));
  FIELD_ROWS['w1-14-crown'] = { n: CROWN_N, H: CROWN_H, figs: [], pods: [{ vine: 1, shift: 0 }, { vine: 3, shift: BEATS.grown / 2 }], beat: 'grown', gate: false, foot: 'mid' };
  return {
    id: 'w1-14-crown', name: 'the crown: a rotten stair to three long vines under pods', feel: [STAGE_14], own: true, archetypes: 'any',
    phases: ['sho', 'ten', 'ketsu'], jobs: ['combine'], difficulty: 7, content: 'crumble', uses: ['field', 'pods', 'creak'], needs: ['jump'],
    pieces, entry: { piece: 'foot', kind: 'ledge' }, exit: { piece: 'top', kind: 'ledge' }, exitDy: -RISE * 4 - CROWN_H, sockets: [], mirrorable: false,
  } as SectionTemplate;
})();

/** [R] a rest: a sound bough with a flag, or a bough and a low step up onto a second (each rest its own shape: no two alike) */
const rest = (id: string, w: number, step?: number): SectionTemplate => ({
  id, name: `a rest: a sound bough (${w}${step ? `, a step up to ${step}` : ''})`, feel: [STAGE_14], own: true, archetypes: 'any', phases: ['rest'], jobs: ['rest'], difficulty: 1,
  pieces: [branch('b', { kind: 'start' }, w), ...(step ? [branch('c', { kind: 'walk', after: 'b', dy: [-40, -40] }, step)] : [])],
  entry: { piece: 'b', kind: 'ledge' }, exit: { piece: step ? 'c' : 'b', kind: 'ledge' }, exitDy: step ? -40 : 0,
  sockets: [flag('b', 0.5), petals('p', step ? 'c' : 'b', 0.5)], mirrorable: false,
} as SectionTemplate);
// (wide enough that a flag spot (FLAG_SPAN.pad in from each end) lies 1500-2400 px of way before the next hard beat and 900 or more past
//  the one before, Matt's flag rule along the climb (ROLLED_FLAGS): at 260-320 the spot fell a few px too late before the pods)
const RESTS = [rest('w1-14-rest-a', 400), rest('w1-14-rest-b', 420), rest('w1-14-rest-c', 360, 180), rest('w1-14-rest-d', 440), rest('w1-14-rest-e', 380, 220), rest('w1-14-rest-f', 380, 160),
  rest('w1-14-rest-g', 460), rest('w1-14-rest-h', 400, 240)];
/** [E] the view north: out into open sky on the crown's plain bough */
const VIEW: SectionTemplate = {
  id: 'w1-14-view-north', name: 'the view north', feel: [STAGE_14], own: true, archetypes: 'any', phases: ['goal'], jobs: ['exit'], difficulty: 1,
  pieces: [branch('crown', { kind: 'start' }, 420)], entry: { piece: 'crown', kind: 'ledge' }, exit: { piece: 'crown', kind: 'ledge' }, exitDy: 0,
  sockets: [], mirrorable: false,
} as SectionTemplate;

/** every section that is 1-4's own */
export const SECTIONS_14: SectionTemplate[] = [
  ARRIVE, GOING_UP, ROTTING, FIELD_TEACH, PODS, PUSH, PUSH_TWO, UNDER_FIRE, COLUMNS, DROP_ONE, HOLLOW, CROWN,
  ...RESTS, VIEW,
];

/** 1-4's kit: World 1's, its sections, its graph and brief, its lines (each a teach line, D50) */
export function kitLib14(): WorldKit {
  const k = w1World(), M = k.manifest, G = M.graphs!;
  return { ...k, manifest: { ...M,
    moves: [...M.moves.filter((m) => m !== 'climb'), 'climb'],
    sections: SECTIONS_14,
    required: {},
    tips: { ...M.tips, ...LINES_14 },
    teachTips: [...(M.teachTips ?? []), 'creak', 'field', 'pods', 'figs'],
    graphs: { ...G, list: [...G.list.filter((g) => g.archetype !== 'ascent'), ...Object.entries(ARC_14).map(([id, code]) => ({ id, archetype: 'ascent' as const, code }))], briefs: { ...G.briefs, [STAGE_14]: BRIEF_14 } },
  } } as WorldKit;
}

// ───────────────────────────── the finish: the fields, figs, gates, pods and beats, by piece key ─────────────────────────────
type FinishStage = { platforms: Platform[]; vines: Vine[]; clusters?: VineCluster[]; gates?: ClusterGate[]; pods?: PodColumn[]; clocks?: ClockDef[]; gen2?: { sections?: Array<{ uid: string; template: string }> }; proto?: { kitDecor?: KitDecor[] } };

/** the beats 1-4 runs (beat.ts): each pod names one */
export function beats14(maxLen: number | Partial<Record<keyof typeof BEATS, number>>): ClockDef[] {
  const len = (b: keyof typeof BEATS) => Math.max(1, typeof maxLen === 'number' ? maxLen : (maxLen[b] ?? 1));
  return (Object.keys(BEATS) as Array<keyof typeof BEATS>).map((b) => podBeat(`pods-${b}`, BEATS[b], TELL, len(b), EASY_STRETCH));
}

/**
 * 1-4's finish (listed.ts runs it after World 1's): each laid field section's vines become a vine field (FIELD_FEEL, Matt's rule and
 * speeds), its figs hang on their vines, its top bough is shut by them where its row says so (the lay's own climb up from that bough is
 * off until it opens: the way up is held down by the sagging bough), and its pods fall down their columns on their beat. Normal's pods
 * cost a heart, Easy's only knock (1-4.md "The cost", "Easy"). Thrown when the result breaks a pod or gate rule (podFaults, gateFaults),
 * so a roll that cannot be laid fair is never listed.
 */
export function finish14<T extends FinishStage>(st: T, difficulty: Difficulty): T {
  const easy = difficulty === 'easy';
  const byTag = new Map<string, Vine | Platform>();
  for (const v of st.vines) if (v.tag) byTag.set(v.tag, v);
  for (const p of st.platforms) if (p.tag) byTag.set(p.tag, p);
  const clusters: VineCluster[] = [], gates: ClusterGate[] = [], pods: PodColumn[] = [];
  const maxLen: Partial<Record<keyof typeof BEATS, number>> = {};
  for (const s of st.gen2?.sections ?? []) {
    const row = FIELD_ROWS[s.template];
    if (!row) continue;
    const vine = (i: number) => byTag.get(`${s.uid}:f${i}`) as Vine | undefined;
    const top = byTag.get(`${s.uid}:top`) as Platform | undefined;
    const foot = byTag.get(`${s.uid}:${row.foot ?? 'foot'}`) as Platform | undefined;
    if (!top || !foot) throw new Error(`1-4 finish: section ${s.uid} (${s.template}) has no top or foot`);
    for (let i = 1; i <= row.n; i++) {
      const v = vine(i);
      if (!v) throw new Error(`1-4 finish: section ${s.uid} has no vine f${i}`);
      v.field = true;
    }
    const figs = easy && row.easyFigs ? row.easyFigs : row.figs;
    const ids: number[] = [];
    for (const f of figs) {
      const id = clusters.length + 1;
      clusters.push({ id, vine: vine(f.vine)!.id, y: foot.y - f.over, h: FIG_H });
      ids.push(id);
    }
    if (row.gate && ids.length) {
      // (the lay's plain boughs at its height that touch it (its runs out to the walls): held with it, so a hop off a field vine's top
      //  never lands at the gate's height round it)
      const withIds: number[] = [];
      for (let grow = true; grow; ) {
        grow = false;
        const held = [top, ...st.platforms.filter((q) => withIds.includes(q.id))];
        for (const q of st.platforms) {
          if (withIds.includes(q.id) || q === top || q.tag || q.type !== 'solid' || Math.abs(q.y - top.y) > 2) continue;
          if (held.some((r) => q.x <= r.x + r.width + 130 && q.x + q.width >= r.x - 130)) { withIds.push(q.id); grow = true; }
        }
      }
      // (and the lay's climbs up from any of them are held down with it until it opens: fieldPlay.ts lets them up)
      const spans = [top, ...st.platforms.filter((q) => withIds.includes(q.id))];
      const ways = st.vines.filter((w) => !w.field && w.vineType === 'tree_climb' && spans.some((q) => Math.abs(w.bottomY - q.y) <= 8 && w.x >= q.x - 4 && w.x <= q.x + q.width + 4)).map((w) => w.id);
      gates.push({ id: gates.length + 1, platform: top.id, clusters: ids, far: 1, ...(ways.length ? { ways } : {}), ...(withIds.length ? { with: withIds } : {}) });
      // (its bough is the field's rough bough picture, shut or open, never the ground painter's branch: fieldPlay.ts draws it)
      top.art = 'hidden';
    }
    for (const pd of row.pods) {
      const v = vine(pd.vine)!;
      const podTop = top.y + POD_HANG;
      const b = row.beat ?? 'steady';
      maxLen[b] = Math.max(maxLen[b] ?? 0, foot.y - podTop);
      pods.push({ id: pods.length + 1, vine: v.id, x: v.x, top: podTop, land: foot.y, clock: `pods-${b}`, shift: pd.shift, cost: easy ? 'knock' : 'heart' });
    }
  }
  // (the view north: the squirrels' nest door in the crown bough, shut as he climbs up to it, open as he arrives (KitDecor `near`):
  //  1-4.md beat 14, "the squirrels on their pod pile stare", a cameo, never a beat (STORY-LINES 1-4 story notes). It is the puzzle
  //  sheet's nest door, kept in the game when the hand-built 1-4's squirrel lift went: every piece of art has a place, STAGE-RULES §4)
  for (const s of st.gen2?.sections ?? []) {
    if (s.template !== VIEW.id) continue;
    const crown = byTag.get(`${s.uid}:crown`) as Platform | undefined;
    if (crown && st.proto) (st.proto.kitDecor ??= []).push(nestDoorAt(crown));
  }
  const clocks = beats14(maxLen);
  const bad = [...podFaults(pods, clocks, st.vines, st.platforms, FIELD_FEEL.reach, easy), ...gateFaults(gates, clusters, st.vines, st.platforms)];
  if (bad.length) throw new Error(`1-4 finish: ${bad.slice(0, 4).join('; ')}`);
  return Object.assign(st, { clusters, gates, pods, clocks });
}

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
 * draped liana is a field of three; fig pickups on the vines are not laid (the figs are the gates' bunches); Pokey's halfway line waits
 * for a Pokey-line hook; the pods, figs and shut boughs are code-drawn until ART's painted pieces land.
 */
import type { ClockDef } from '../../stageKit.types.ts';
import type { Platform, Vine } from '../../types.ts';
import type { Difficulty } from '../../difficulty.ts';
import type { GraphBrief, SectionPiece, SectionTemplate, Socket, WorldKit } from '../types.ts';
import { w1World } from './w1.ts';
import { FIELD_FEEL, gateFaults, type ClusterGate, type VineCluster } from '../../vineField.ts';
import { podBeat, podFaults, type PodColumn } from '../../podfall.ts';

/** the stage these rows are for: the tag its sections carry (stagePool) and the key of its brief */
export const STAGE_14 = '1-4';
type R2 = [number, number];

/** 1-4's ONE graph (1-4.md "The arc"): A arrive, T going up (the slide, by shape), T rotting boughs, T the field (two hands), T pods,
 *  P push the figs up, X pushing under fire, W his turn to drop one, S the hollow, C the crown, E the view north; R the rests between */
export const ARC_14: Record<string, string> = { 'ascent-14-arc': 'A T T R T T P R X R W R S R C E' };
/** 1-4's brief, all of it data: an ascent of fields, its cast 1-3's snake */
export const BRIEF_14: GraphBrief = {
  ends: 'quiet', trend: 'up', branching: 'none', teaches: ['slide', 'creak', 'field', 'pods'], deal: { climb: 60, crumble: 20, hazard: 20 }, dealExact: true,
  cast: ['snake'],
};
/** the story keeper's lines for 1-4, verbatim (the lead, 11-13 10:44 AM ET: final, Matt 10:43 AM; t-story@400b4c13 STORY-KEEPER.md):
 *  the only player words this file holds. Dot, each said once at the first of its thing */
export const LINES_14 = {
  creak: 'Creaky limbs drop you, but just one branch down!',
  field: 'Reach for the next vine! Two hands zoom up!',
  pods: 'Hear it creak? Scoot a vine over till it drops!',
  figs: 'Climb under the figs and push them free!',
} as const;
/** Pokey's halfway line (STORY-KEEPER.md:149; 1-4.md beat 6): held for a Pokey-line hook (a tip is Dot's voice; not laid as one) */
export const HALFWAY_14 = 'Meeca climbs this every Sunday. I waved from below.';
/** the journal line (pokeyJournal.ts:51's 1-4, the keeper's rewrite) */
export const JOURNAL_14 = 'Climbed the kapok between falling pods. From the top you can see where they took her.';

// ───────────────────────────── the numbers (1-4.md "The vine field", "On a phone") ─────────────────────────────
/** vines in a field stand this far apart (px): in reach for two hands (FIELD_FEEL.reach 90), 70-90 by the design */
export const GAP = 80;
/** a field's foot runs this far past its first and last vine (px): room to stand at each end */
const MARGIN = 60;
/** a pod's bottom hangs this far under its bough's top (px): a drawn pod's length (vineFieldArt.ts drawPod) */
const POD_HANG = 110;
/** a fig bunch's height (px) */
const FIG_H = 56;
/** the pods' tell (s, Normal; Easy times the beat's stretch: 1.5 s) and Easy's stretch (1-4.md "Easy ... tells 1.5 s, beats 1.4x") */
const TELL = 1.0, EASY_STRETCH = 1.5;
/** the beats: the steady one of beats 4-9, and the quicker one of the hollow and the crown (1-4.md "Steady, then grown") */
const BEATS = { steady: 3.6, quick: 2.4 } as const;

const branch = (key: string, place: SectionPiece['place'], w: number, o: Partial<SectionPiece> = {}): SectionPiece =>
  ({ key, shape: 'branch', w: [w, w], place, style: 'branch', landing: true, ...o });
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
}
/** the finish's rows, by section template id */
export const FIELD_ROWS: Record<string, FieldRow> = {};

/** a field: a foot bough, n vines GAP apart standing on it, H tall, and a bough over them at their tops (the section's exit) */
function field(id: string, name: string, o: { job: SectionTemplate['phases']; teaches?: string; uses?: string[]; difficulty: number; row: FieldRow; tips?: Socket[]; content?: 'climb' | 'hazard' }): SectionTemplate {
  const W = 2 * MARGIN + (o.row.n - 1) * GAP;
  const pieces: SectionPiece[] = [branch('foot', { kind: 'start' }, W)];
  for (let i = 0; i < o.row.n; i++) pieces.push(climbOn(`f${i + 1}`, 'foot', W, MARGIN + i * GAP, o.row.H));
  pieces.push(branch('top', { kind: 'over', on: 'foot', at: [0, 0], dy: [-o.row.H, -o.row.H] }, W));
  FIELD_ROWS[id] = o.row;
  return {
    id, name, feel: [STAGE_14], own: true, archetypes: 'any', phases: o.job, difficulty: o.difficulty, content: o.content ?? 'climb',
    ...(o.teaches ? { teaches: o.teaches } : {}), uses: o.uses ?? [], needs: [],
    pieces, entry: { piece: 'foot', kind: 'ledge' }, exit: { piece: 'top', kind: 'ledge' }, exitDy: -o.row.H,
    sockets: [...(o.tips ?? [])], mirrorable: false,
  } as SectionTemplate;
}

// ───────────────────────────── the beats ─────────────────────────────
/** [A] arrive: the buttress roots on the forest floor in mist; her last petal low on the bark */
const ARRIVE: SectionTemplate = {
  id: 'w1-14-roots', name: 'arrive: the buttress roots', feel: [STAGE_14], own: true, archetypes: 'any', phases: ['start'], difficulty: 1,
  pieces: [{ key: 'roots', shape: 'bank', w: [520, 560], place: { kind: 'start' }, style: 'moss_stone', main: true }],
  entry: { piece: 'roots', kind: 'ground' }, exit: { piece: 'roots', kind: 'ground' }, exitDy: 0,
  sockets: [petals('petal', 'roots', 0.7)], mirrorable: false,
} as SectionTemplate;

/** [T] going up: a single vine from the root to a wide, low, sound bough with ground under it; then a taller one. The slide down is
 *  learned by shape (down on one hand is quicker), no words */
const GOING_UP: SectionTemplate = {
  id: 'w1-14-going-up', name: 'going up: a vine, then a taller one', feel: [STAGE_14], own: true, archetypes: 'any', phases: ['ki', 'sho', 'ten', 'ketsu'],
  difficulty: 2, content: 'climb', teaches: 'slide', uses: [], needs: [],
  pieces: [
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
  id: 'w1-14-rotting', name: 'rotting boughs over sound wood', feel: [STAGE_14], own: true, archetypes: 'any', phases: ['ki', 'sho', 'ten', 'ketsu'],
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
  job: ['ki', 'sho', 'ten', 'ketsu'], teaches: 'field', difficulty: 3,
  row: { n: 5, H: 330, figs: [], pods: [], gate: false },
  tips: [tip('tip', 'foot', 0.15, 'field')],
});
/** [T] pods: pods down two of five columns on ONE steady beat (3.6 s), half a beat apart; the first watched from the foot, a column he is
 *  not on. Dot's line at the foot */
const PODS = field('w1-14-pods', 'pods down two columns, one steady beat', {
  job: ['ki', 'sho', 'ten', 'ketsu'], teaches: 'pods', uses: ['field'], difficulty: 4, content: 'hazard',
  row: { n: 5, H: 360, figs: [], pods: [{ vine: 2, shift: 0 }, { vine: 4, shift: BEATS.steady / 2 }], beat: 'steady', gate: false },
  tips: [tip('tip', 'foot', 0.12, 'pods')],
});
/** [P] push the figs up: the way up shut by a sagging bough; ONE fig bunch low on a vine nothing falls on, pods on the steady beat two
 *  columns away */
const PUSH = field('w1-14-push', 'push the figs up: a gate of one', {
  job: ['ki', 'sho', 'ten', 'ketsu'], uses: ['field', 'pods'], difficulty: 5,
  row: { n: 5, H: 360, figs: [{ vine: 1, over: 150 }], pods: [{ vine: 4, shift: 0 }], beat: 'steady', gate: true },
  tips: [tip('tip', 'foot', 0.12, 'figs')],
});
/** [X] pushing under fire: a gate of two bunches, pods down both push vines (half a beat apart), the vines between free */
const UNDER_FIRE = field('w1-14-under-fire', 'a gate of two, pods down the push vines', {
  job: ['sho', 'ten', 'ketsu'], uses: ['field', 'pods'], difficulty: 6, content: 'hazard',
  row: { n: 5, H: 400, figs: [{ vine: 1, over: 150 }, { vine: 4, over: 250 }], pods: [{ vine: 1, shift: 0 }, { vine: 4, shift: BEATS.steady / 2 }], beat: 'steady', gate: true, easyFigs: [{ vine: 4, over: 250 }] },
});
/** [W] his turn to drop one: a snake dozes on the field's foot past its last vine; the bunch on the last vine, pushed free, thumps down
 *  beside it, and it glides off; the bough over the field lifts with it */
const DROP_ONE = (() => {
  const t = field('w1-14-drop-one', 'his turn to drop one: the figs beside the snake', {
    job: ['sho', 'ten', 'ketsu'], uses: ['field', 'pods', 'traps'], difficulty: 6,
    row: { n: 4, H: 360, figs: [{ vine: 4, over: 160 }], pods: [{ vine: 2, shift: 0 }], beat: 'steady', gate: true },
  });
  // (the foot runs on past the last vine to the snake's spot, within TRAP.scare (170) of where the bunch comes down)
  const W = 2 * MARGIN + 3 * GAP + 160;
  t.pieces = t.pieces.map((p) => (p.key === 'foot' ? { ...p, w: [W, W] } : p.shape === 'vine' && p.place.kind === 'climb' ? { ...p, place: { ...p.place, at: [((p.place.at as R2)[0] * (W - 160)) / W, ((p.place.at as R2)[0] * (W - 160)) / W] } } : p.key === 'top' ? { ...p, w: [W - 160, W - 160] } : p));
  t.sockets = [{ id: 'e1', role: 'enemy', on: 'foot', t: (W - 70) / W, dn: 0, allow: ['snake-asleep'], easy: 'keep' }];
  return t;
})();
/** [S] the hollow: the tallest field, a gate of three, pods on the quicker beat down one push vine */
const HOLLOW = field('w1-14-hollow', 'the hollow: a gate of three, the quicker beat', {
  job: ['sho', 'ten', 'ketsu'], uses: ['field', 'pods'], difficulty: 8, content: 'hazard',
  row: { n: 6, H: 440, figs: [{ vine: 1, over: 140 }, { vine: 3, over: 300 }, { vine: 6, over: 200 }], pods: [{ vine: 3, shift: 0 }], beat: 'quick', gate: true, easyFigs: [{ vine: 1, over: 140 }, { vine: 6, over: 200 }] },
});
/** [C] the crown: a rotten stair up to three long vines, pods down two of them on the steady beat; up and out */
const CROWN = field('w1-14-crown', 'the crown: a rotten stair to three long vines under pods', {
  job: ['sho', 'ten', 'ketsu'], uses: ['field', 'pods', 'creak'], difficulty: 7, content: 'hazard',
  row: { n: 3, H: 440, figs: [], pods: [{ vine: 1, shift: 0 }, { vine: 3, shift: BEATS.steady / 2 }], beat: 'steady', gate: false },
});

/** [R] a rest: a sound bough with a flag (and the halfway one, 1-4.md beat 6, is the first after P) */
const rest = (id: string, w: number): SectionTemplate => ({
  id, name: `a rest: a sound bough (${w})`, feel: [STAGE_14], own: true, archetypes: 'any', phases: ['rest'], difficulty: 1,
  pieces: [branch('b', { kind: 'start' }, w)], entry: { piece: 'b', kind: 'ledge' }, exit: { piece: 'b', kind: 'ledge' }, exitDy: 0,
  sockets: [flag('b', 0.5), petals('p', 'b', 0.25)], mirrorable: false,
} as SectionTemplate);
/** [E] the view north: out into open sky on the crown's plain bough */
const VIEW: SectionTemplate = {
  id: 'w1-14-view-north', name: 'the view north', feel: [STAGE_14], own: true, archetypes: 'any', phases: ['goal'], difficulty: 1,
  pieces: [branch('crown', { kind: 'start' }, 420)], entry: { piece: 'crown', kind: 'ledge' }, exit: { piece: 'crown', kind: 'ledge' }, exitDy: 0,
  sockets: [], mirrorable: false,
} as SectionTemplate;

/** every section that is 1-4's own */
export const SECTIONS_14: SectionTemplate[] = [
  ARRIVE, GOING_UP, ROTTING, FIELD_TEACH, PODS, PUSH, UNDER_FIRE, DROP_ONE, HOLLOW, CROWN,
  rest('w1-14-rest-a', 320), rest('w1-14-rest-b', 360), VIEW,
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
type FinishStage = { platforms: Platform[]; vines: Vine[]; clusters?: VineCluster[]; gates?: ClusterGate[]; pods?: PodColumn[]; clocks?: ClockDef[]; gen2?: { sections?: Array<{ uid: string; template: string }> } };

/** the beats 1-4 runs (beat.ts): each pod names one */
export function beats14(maxLen: number): ClockDef[] {
  return [podBeat('pods-steady', BEATS.steady, TELL, maxLen, EASY_STRETCH), podBeat('pods-quick', BEATS.quick, TELL, maxLen, EASY_STRETCH)];
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
  let maxLen = 0;
  for (const s of st.gen2?.sections ?? []) {
    const row = FIELD_ROWS[s.template];
    if (!row) continue;
    const vine = (i: number) => byTag.get(`${s.uid}:f${i}`) as Vine | undefined;
    const top = byTag.get(`${s.uid}:top`) as Platform | undefined;
    const foot = byTag.get(`${s.uid}:foot`) as Platform | undefined;
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
      // (the lay's climb up from the shut bough, if one stands on it, is held down with it until it opens: fieldPlay.ts lets it up)
      const ways = st.vines.filter((w) => !w.field && w.vineType === 'tree_climb' && Math.abs(w.bottomY - top.y) <= 8 && w.x >= top.x - 4 && w.x <= top.x + top.width + 4).map((w) => w.id);
      gates.push({ id: gates.length + 1, platform: top.id, clusters: ids, far: 1, ...(ways.length ? { ways } : {}) });
    }
    for (const pd of row.pods) {
      const v = vine(pd.vine)!;
      const podTop = top.y + POD_HANG;
      maxLen = Math.max(maxLen, foot.y - podTop);
      pods.push({ id: pods.length + 1, vine: v.id, x: v.x, top: podTop, land: foot.y, clock: row.beat === 'quick' ? 'pods-quick' : 'pods-steady', shift: pd.shift, cost: easy ? 'knock' : 'heart' });
    }
  }
  const clocks = beats14(Math.max(maxLen, 1));
  const bad = [...podFaults(pods, clocks, st.vines, st.platforms, FIELD_FEEL.reach, easy), ...gateFaults(gates, clusters, st.vines, st.platforms)];
  if (bad.length) throw new Error(`1-4 finish: ${bad.slice(0, 4).join('; ')}`);
  return Object.assign(st, { clusters, gates, pods, clocks });
}

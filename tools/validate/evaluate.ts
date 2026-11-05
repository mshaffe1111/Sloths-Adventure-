/**
 * The fun validator's judgement: every check on a built stage, as flags in plain words, each with its rule's source (fun-validator).
 * Structure checks run on any layout (cheap); play checks (play.ts) run on a few layouts and are merged in by world1.ts.
 */
import { build, cosine, deadWalks, grams, moveDirs, moveString, pacing, pacingStrip, paceFlags, repeats, SIMILAR_MAX, type Built, type Setting } from './core.ts';
import { lookAlike, lookOf } from './look.ts';
import { enemyJobs, ENEMY_FREE_TARGET, mechRow, missCost, padding, pairsMet, pairsOf, sixThings, tempoOf, waitAt, type Beat2 } from './mechanics.ts';
import { rhythmOf, shapeAlike, shapeOf, SHAPE_ALIKE_MAX, tempoAlike, templateFlags, unitsOf } from './variety.ts';

export interface Flag { rule: string; what: string; x?: number; source: string }
export interface StageEval {
  id: string; layout: number; setting: Setting;
  str: string; quick: string; total: number; strip: string;
  /** each move's way (moveDirs), for str and quick */
  sdir?: string; qdir?: string;
  costs: { nothing: number; setback: number; life: number; unknown: number; afterTeach: number; beats: Beat2[] };
  padding: ReturnType<typeof padding>;
  tempo: { hurry: number; patience: number };
  enemies: ReturnType<typeof enemyJobs>;
  mech: Record<string, number>;
  six: string[]; pairs: string[];
  flags: Flag[];
  /** every flag by the old rules (judge's truer=false, and the move rules by the goal route's moves alone): what stages not yet rebuilt
   * are gated on (funcheck.ts) */
  oldFlags?: Flag[];
  built: Built;
}

/** the share of a stage's beats that may cost nothing once its mechanic is taught (the quality supervisor: "about 80%") */
export const NO_BITE_MAX = 0.8;
/** the teaching part a stage may keep soft (s): §0b.2 part 1 shows the mechanic safely, 5-10 s groups */
export const TEACH_SECS = 30;
/** a finish this share of the stage or more is padding (the supervisor: 1-1 seed 1's finish runs 72-155 s, over half) */
export const PAD_SHARE = 0.5;
/** neighbours: a stage at least 55% different from the one right before it (the supervisor: Matt feels neighbours most) */
export const NEIGHBOUR_MAX = 0.45;

const SRC = {
  dead: 'research 2026-11-04 §1 (no dead walk over 2.5 s)',
  repeat: 'STAGE-RULES §0.3, research §7 (no beat repeated to fill time)',
  pace: 'research §1 (pacing tags, never T-T or P-P), STAGE-RULES §0b.1-2',
  bite: 'STAGE-RULES §0.2/§0.5, quality supervisor 2026-11-04 (once taught, sloppiness costs something)',
  pad: 'quality supervisor 2026-11-04 (fillTo finishes), STAGE-RULES §0.3',
  tempo: 'STAGE-RULES §0b.3 (hurry and patience)',
  enemy: 'research §6 (none within 150 px of a landing; about 35% enemy-free), R-159',
  similar: 'research §1 (at least 45% different), quality supervisor (0.45 against the stage before)',
  newer: 'STAGE-RULES §0.5, §0b.6 (every stage adds something)',
  template: 'STAGE-RULES §0c.2-3 (no template twice in a row or over twice a stage; a repeat changes something you feel)',
  neighbour: 'the lead 2026-11-04 (not like the stage before on tempo or map shape), research §1',
} as const;

/**
 * every structure check on one built stage. truer (the default): the validator's rules as fixed on 2026-11-04 (the lead): a long fall
 * bites, a pair counts only when both meet in one move, a ride or a moving hop is patience only with a real wait, a dense finale may run
 * 15-20 s, and §0c's template checks. old: the rules as the fun gate was built, which stages not yet rebuilt are gated on (funcheck.ts).
 */
export function judge(b: Built & { quick?: { m: string }[] }, truer = true): StageEval {
  const str = moveString(b.steps);
  const flags: Flag[] = [];
  // dead walking
  for (const d of deadWalks(b.steps, b.total, b.samples)) flags.push({ rule: 'dead walk', what: `${d.secs} s of walking with nothing to do${d.pad ? ' (after the rest pad a burst earns)' : ''}`, x: d.x0, source: SRC.dead });
  // repeats
  for (const r of repeats(str, b.steps, (b.stage as { proto?: { bpm?: number } }).proto?.bpm)) flags.push({ rule: 'repeat', what: r.kind === '4-run' ? `the same four moves "${r.run}" ${r.n} times` : `"${r.run}" ${r.n} times back to back`, x: r.at[0], source: SRC.repeat });
  // pacing
  const pc = pacing(b.steps, b.total);
  for (const f of paceFlags(pc, truer, { steps: b.steps, setting: b.setting })) flags.push({ rule: 'pacing', what: f.what, source: SRC.pace });
  // what a miss costs, past the teaching
  const beats = missCost(b, truer);
  const lateAll = beats.filter((x) => x.step.t > TEACH_SECS);
  const late = lateAll.filter((x) => x.cost !== 'unknown');
  const c = { nothing: late.filter((x) => x.cost === 'nothing').length, setback: late.filter((x) => x.cost === 'setback').length, life: late.filter((x) => x.cost === 'life').length, unknown: lateAll.length - late.length };
  const share = late.length ? c.nothing / late.length : 1;
  if (share > NO_BITE_MAX) flags.push({ rule: 'nothing bites', what: `${Math.round(share * 100)}% of the beats after the first ${TEACH_SECS} s cost nothing when missed (${c.setback} cost a setback, ${c.life} a life)`, source: SRC.bite });
  // padding
  const pad = padding(b);
  if (pad && pad.finishShare >= PAD_SHARE) flags.push({ rule: 'padding', what: `the finish is ${Math.round(pad.finishShare * 100)}% of the stage (from ${pad.finishFrom} s), pieces drawn until the clock says two minutes`, source: SRC.pad });
  for (const r of pad?.repeats ?? []) flags.push({ rule: 'padding', what: `the finish lays the "${r.k}" piece ${r.n} times`, source: SRC.pad });
  // tempo
  const tw = (s: (typeof b.steps)[number]) => tempoOf(s, truer ? waitAt(b, s) : undefined);
  const tempo = { hurry: b.steps.filter((s) => tw(s) === 'hurry').length, patience: b.steps.filter((s) => tw(s) === 'patience').length };
  if (!tempo.hurry || !tempo.patience) flags.push({ rule: 'one tempo', what: !tempo.hurry && !tempo.patience ? 'never asks to hurry or to wait: one even pace all the way' : tempo.hurry ? 'only ever asks to hurry, never to wait' : 'only ever asks to wait, never to hurry', source: SRC.tempo });
  // enemies
  const en = enemyJobs(b);
  for (const j of en.jobs) if (j.nearLanding !== null) flags.push({ rule: 'enemy by a landing', what: `a ${j.type} ${j.nearLanding} px from where a jump lands`, x: j.x, source: SRC.enemy });
  if (en.jobs.length && en.freeShare < ENEMY_FREE_TARGET - 0.1) flags.push({ rule: 'enemies everywhere', what: `only ${Math.round(en.freeShare * 100)}% of the route is free of animals (about 35% wanted)`, source: SRC.enemy });
  // §0c.2-3: the templates the stage is laid from
  if (truer) for (const f of templateFlags(unitsOf(b.stage as never))) flags.push({ rule: 'template repeat', what: f.what, x: f.x, source: SRC.template });
  const six = sixThings(b.stage as never, b.sim.e as never);
  return {
    id: b.id, layout: b.layout, setting: b.setting, str, quick: (b.quick ?? []).map((s) => s.m).filter((m) => m !== 'h').join(''), sdir: moveDirs(b.steps), qdir: moveDirs(b.quick ?? []), total: Math.round(b.total), strip: pacingStrip(pc),
    costs: { ...c, afterTeach: late.length, beats }, padding: pad, tempo, enemies: en, mech: mechRow(b), six, pairs: truer ? pairsMet(b) : pairsOf(six), flags, built: b,
  };
}

/**
 * How alike two stages are in their moves (0-1): the more alike of the goal route's moves (what a player who meets the goal does) and the
 * terrain's own (the quick route to the shrine, which no pickup moves). Matt, STAGE-RULES §0c.5 (the lead, 2026-11-04): "We can't just
 * assume that rearranging petals that you collect is going to make the game feel different." So a stage built on the same pieces with
 * its petals somewhere else reads as alike, while real new terrain reads as new on both routes.
 */
type Moves = { str: string; quick: string; sdir?: string; qdir?: string };
export const strGrams = (a: Moves) => grams(a.str, 3, a.sdir);
export const quickGrams = (a: Moves) => grams(a.quick, 3, a.qdir);
export function movesAlike(a: Moves, b: Moves): number {
  return Math.max(cosine(strGrams(a), strGrams(b)), a.quick && b.quick ? cosine(quickGrams(a), quickGrams(b)) : 0);
}

/** the rules on how a stage's moves compare with the stages before it: like the stage before, like an earlier stage, nothing new */
export const MOVE_RULES = ['like the stage before', 'like an earlier stage', 'nothing new'] as const;

/**
 * Those rules for `ev` against `out` (the stages before it, in order). truer: by movesAlike, and "nothing new" read from the terrain's own
 * moves (the quick route: pickups laid somewhere new add nothing; Matt, §0c.5: "Our pieces and other things need to change"); old: by the
 * goal route's moves alone, as the gate was built.
 */
export function movesFlags(ev: StageEval, out: readonly StageEval[], truer: boolean): Flag[] {
  const flags: Flag[] = [];
  const alike = (a: StageEval, b: StageEval) => (truer ? movesAlike(a, b) : cosine(strGrams(a), strGrams(b)));
  const prev = out[out.length - 1];
  if (prev) {
    const c = alike(ev, prev);
    if (c > NEIGHBOUR_MAX) flags.push({ rule: 'like the stage before', what: `${Math.round(c * 100)}% alike in its moves to ${prev.id} (at most 45% for the stage right before)`, source: SRC.similar });
  }
  let worst: { id: string; c: number } | null = null;
  for (const p of out) {
    const c = alike(ev, p);
    if (!worst || c > worst.c) worst = { id: p.id, c };
  }
  if (worst && worst.c > SIMILAR_MAX && worst.id !== prev?.id) flags.push({ rule: 'like an earlier stage', what: `${Math.round(worst.c * 100)}% alike in its moves to ${worst.id} (at most 55%)`, source: SRC.similar });
  const mine = truer ? ev.quick : ev.str;
  const seenMoves = new Set(out.flatMap((p) => (truer ? [...p.str, ...p.quick] : [...p.str])));
  const seenPairs = new Set(out.flatMap((p) => p.pairs));
  const seenGrams = new Set(out.flatMap((p) => (truer ? [...strGrams(p).keys(), ...quickGrams(p).keys()] : [...strGrams(p).keys()])));
  const newMoves = [...new Set(mine)].filter((m) => !seenMoves.has(m));
  const newPairs = ev.pairs.filter((p) => !seenPairs.has(p));
  const newGrams = [...(truer ? quickGrams(ev) : strGrams(ev)).keys()].filter((k) => !seenGrams.has(k));
  if (truer) (ev as StageEval & { adds?: unknown }).adds = { moves: newMoves, pairs: newPairs, grams: newGrams.length };
  if (out.length && !newMoves.length && !newPairs.length) flags.push({ rule: 'nothing new', what: `no move or pairing an earlier World 1 stage didn't already ask (${newGrams.length} new 3-move runs of old moves)`, source: SRC.newer });
  return flags;
}

export const W1 = ['1-1', '1-2', '1-3', '1-4', '1-5', '1-6', '1-7', '1-8', '1-9'] as const;

/** World 1 on one layout and setting, in order: each stage judged, then against the ones before it (similarity, what is new) */
export function world(layout: number, setting: Setting, ids: readonly string[] = W1): StageEval[] {
  const out: StageEval[] = [], outOld: StageEval[] = [];
  const looks: ReturnType<typeof lookOf>[] = [];
  for (const id of ids) {
    const bt = build(id, layout, setting);
    const ev = judge(bt), old = judge(bt, false);
    const lookFrom = ev.flags.length;
    // (how alike it looks: the builder's pieces and the art, look.ts. Variety reads the more alike of moves and look, so these flags
    // feed it as the move ones do; the quality supervisor, 11-04: 1-7 read 10% alike to 1-1 by moves and 84% by look)
    const lk = lookOf(ev.built.stage);
    const lp = looks[looks.length - 1];
    if (lp) {
      const c = lookAlike(lk, lp);
      if (c > NEIGHBOUR_MAX) ev.flags.push({ rule: 'looks like the stage before', what: `${Math.round(c * 100)}% alike in its pieces and art to ${out[out.length - 1].id} (at most 45% for the stage right before)`, source: SRC.similar });
    }
    let lw: { id: string; c: number } | null = null;
    looks.forEach((q, i) => { const c = lookAlike(lk, q); if (!lw || c > lw.c) lw = { id: out[i].id, c }; });
    const lwv = lw as { id: string; c: number } | null;
    if (lwv && lwv.c > SIMILAR_MAX && lwv.id !== out[out.length - 1]?.id) ev.flags.push({ rule: 'looks like an earlier stage', what: `${Math.round(lwv.c * 100)}% alike in its pieces and art to ${lwv.id} (at most 55%)`, source: SRC.similar });
    looks.push(lk);
    // against the stage right before it and any before it, and what it adds: by the truer rule (movesAlike, the terrain's own moves) into
    // ev.flags, and by the old rule (the goal route's moves alone) into ev.oldFlags. The lead, 2026-11-04: stages rebuilt from today are
    // gated on the truer rule; the ones not yet rebuilt stay gated on the old rule at their listed counts, the truer count printed beside
    // (funcheck.ts, REBUILT)
    const lookFlags = ev.flags.slice(lookFrom);
    ev.flags.push(...movesFlags(ev, out, true));
    // (on tempo and map shape against the stage right before it: the truer rules only)
    const prev = out[out.length - 1];
    if (prev) {
      const ra = rhythmOf(bt.stage), rb = rhythmOf(prev.built.stage);
      if (tempoAlike(ra, rb)) ev.flags.push({ rule: 'tempo like the stage before', what: `${ra!.bpm} BPM against ${prev.id}'s ${rb!.bpm}, with the same beat feel`, source: SRC.neighbour });
      const c = shapeAlike(shapeOf(bt), shapeOf(prev.built));
      if (c > SHAPE_ALIKE_MAX) ev.flags.push({ rule: 'map like the stage before', what: `${Math.round(c * 100)}% alike in the route's climbs and drops to ${prev.id} (at most ${Math.round(SHAPE_ALIKE_MAX * 100)}%)`, source: SRC.neighbour });
    }
    ev.oldFlags = [...old.flags, ...lookFlags, ...movesFlags(old, outOld, false)];
    out.push(ev);
    outOld.push(old);
  }
  return out;
}

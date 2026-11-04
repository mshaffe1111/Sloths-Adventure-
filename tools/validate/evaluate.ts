/**
 * The fun validator's judgement: every check on a built stage, as flags in plain words, each with its rule's source (fun-validator).
 * Structure checks run on any layout (cheap); play checks (play.ts) run on a few layouts and are merged in by world1.ts.
 */
import { build, cosine, deadWalks, grams, moveString, pacing, pacingStrip, paceFlags, repeats, SIMILAR_MAX, type Built, type Setting } from './core.ts';
import { enemyJobs, ENEMY_FREE_TARGET, mechRow, missCost, padding, pairsOf, sixThings, tempoOf, type Beat2 } from './mechanics.ts';

export interface Flag { rule: string; what: string; x?: number; source: string }
export interface StageEval {
  id: string; layout: number; setting: Setting;
  str: string; quick: string; total: number; strip: string;
  costs: { nothing: number; setback: number; life: number; unknown: number; afterTeach: number; beats: Beat2[] };
  padding: ReturnType<typeof padding>;
  tempo: { hurry: number; patience: number };
  enemies: ReturnType<typeof enemyJobs>;
  mech: Record<string, number>;
  six: string[]; pairs: string[];
  flags: Flag[];
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
} as const;

/** every structure check on one built stage */
export function judge(b: Built & { quick?: { m: string }[] }): StageEval {
  const str = moveString(b.steps);
  const flags: Flag[] = [];
  // dead walking
  for (const d of deadWalks(b.steps, b.total, b.samples)) flags.push({ rule: 'dead walk', what: `${d.secs} s of walking with nothing to do${d.pad ? ' (after the rest pad a burst earns)' : ''}`, x: d.x0, source: SRC.dead });
  // repeats
  for (const r of repeats(str, b.steps)) flags.push({ rule: 'repeat', what: r.kind === '4-run' ? `the same four moves "${r.run}" ${r.n} times` : `"${r.run}" ${r.n} times back to back`, x: r.at[0], source: SRC.repeat });
  // pacing
  const pc = pacing(b.steps, b.total);
  for (const f of paceFlags(pc)) flags.push({ rule: 'pacing', what: f.what, source: SRC.pace });
  // what a miss costs, past the teaching
  const beats = missCost(b);
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
  const tempo = { hurry: b.steps.filter((s) => tempoOf(s) === 'hurry').length, patience: b.steps.filter((s) => tempoOf(s) === 'patience').length };
  if (!tempo.hurry || !tempo.patience) flags.push({ rule: 'one tempo', what: !tempo.hurry && !tempo.patience ? 'never asks to hurry or to wait: one even pace all the way' : tempo.hurry ? 'only ever asks to hurry, never to wait' : 'only ever asks to wait, never to hurry', source: SRC.tempo });
  // enemies
  const en = enemyJobs(b);
  for (const j of en.jobs) if (j.nearLanding !== null) flags.push({ rule: 'enemy by a landing', what: `a ${j.type} ${j.nearLanding} px from where a jump lands`, x: j.x, source: SRC.enemy });
  if (en.jobs.length && en.freeShare < ENEMY_FREE_TARGET - 0.1) flags.push({ rule: 'enemies everywhere', what: `only ${Math.round(en.freeShare * 100)}% of the route is free of animals (about 35% wanted)`, source: SRC.enemy });
  const six = sixThings(b.stage as never, b.sim.e as never);
  return {
    id: b.id, layout: b.layout, setting: b.setting, str, quick: (b.quick ?? []).map((s) => s.m).filter((m) => m !== 'h').join(''), total: Math.round(b.total), strip: pacingStrip(pc),
    costs: { ...c, afterTeach: late.length, beats }, padding: pad, tempo, enemies: en, mech: mechRow(b), six, pairs: pairsOf(six), flags, built: b,
  };
}

export const W1 = ['1-1', '1-2', '1-3', '1-4', '1-5', '1-6', '1-7', '1-8', '1-9'] as const;

/** World 1 on one layout and setting, in order: each stage judged, then against the ones before it (similarity, what is new) */
export function world(layout: number, setting: Setting, ids: readonly string[] = W1): StageEval[] {
  const out: StageEval[] = [];
  for (const id of ids) {
    const ev = judge(build(id, layout, setting));
    const g3 = grams(ev.str);
    // against the stage right before it, and any before it
    const prev = out[out.length - 1];
    if (prev) {
      const c = cosine(g3, grams(prev.str));
      if (c > NEIGHBOUR_MAX) ev.flags.push({ rule: 'like the stage before', what: `${Math.round(c * 100)}% alike in its moves to ${prev.id} (at most 45% for the stage right before)`, source: SRC.similar });
    }
    let worst: { id: string; c: number } | null = null;
    for (const p of out) {
      const c = cosine(g3, grams(p.str));
      if (!worst || c > worst.c) worst = { id: p.id, c };
    }
    if (worst && worst.c > SIMILAR_MAX && worst.id !== prev?.id) ev.flags.push({ rule: 'like an earlier stage', what: `${Math.round(worst.c * 100)}% alike in its moves to ${worst.id} (at most 55%)`, source: SRC.similar });
    // what it adds: moves, pairs, 3-grams no earlier stage had
    const seenMoves = new Set(out.flatMap((p) => [...p.str]));
    const seenPairs = new Set(out.flatMap((p) => p.pairs));
    const seenGrams = new Set(out.flatMap((p) => [...grams(p.str).keys()]));
    const newMoves = [...new Set(ev.str)].filter((m) => !seenMoves.has(m));
    const newPairs = ev.pairs.filter((p) => !seenPairs.has(p));
    const newGrams = [...g3.keys()].filter((k) => !seenGrams.has(k));
    (ev as StageEval & { adds?: unknown }).adds = { moves: newMoves, pairs: newPairs, grams: newGrams.length };
    if (out.length && !newMoves.length && !newPairs.length) ev.flags.push({ rule: 'nothing new', what: `no move or pairing an earlier World 1 stage didn't already ask (${newGrams.length} new 3-move runs of old moves)`, source: SRC.newer });
    out.push(ev);
  }
  return out;
}

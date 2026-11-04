/**
 * 1-1 Into the Canopy, rebuilt (w1-rhythm-b, 2026-11-04; reference/W1-REBUILD-PLAN.md row 1-1, reference/notes/w1-rhythm-b-plan.md).
 *
 * A wave that RISES: from the forest floor, up the earth bank (a mushroom over its top step), onto the first kapok's boughs on the
 * second jump, up into the canopy, a high road or a low road, the mushroom boughs, and the high branches over open air to the shrine on
 * the top branch. It goes up and down all the way (dips, drops to a lower bough, rises again) and climbs overall.
 *
 * The moves fall on the music's beat (beatTrace.ts: stageBpm reads it from the music, about 130 BPM; Pokey's real flights put every
 * surface under his feet). 1-1's note value is the half note: steady, a march, never the same gap four times running. The twist turns
 * it into an off-beat catch (the second jump on the off-beat): 1-1's pair, jump and second jump, in one move. Density climbs: low groups
 * at the start (0.4 a second), medium in the middle, a dense finale that ends AT the shrine.
 *
 * Nothing costs a life before the finale: misses land on moss, the bank or a bough below (a retry or a setback). The finale's gaps are
 * open air (fallZones: a life on Normal, Easy's soft fall). The backdrop turns from the forest floor to the canopy as he rises (`rise`).
 * Rests sit between the groups (STAGE-RULES §0b.1): quiet walks with root knots, Dot's line, the golden seed seen ahead.
 */
import type { GeneratedStage } from './stageGenerator.ts';
import type { Collectible, LevelConfig, Platform } from './types.ts';
import { PHYS } from './physics.ts';
import { fixPickups } from './flowerReach.ts';
import { heartsAtFlags, stream, type ProtoExtras, type StageHint } from './protoStage.ts';
import { easyNode, stageBpm, traceNode, type NodeSpec, type Step, type Trace } from './beatTrace.ts';

const RUN = PHYS.maxRun;
const BANK_H = 90;
/** the soft pits' floor under the forest floor (px under it), and the step out of one */
const HOLLOW = 130;
const PIT_STEP = 55;
/** under a gap between boughs, the bough that catches a miss, this far down (one jump back up) */
const CATCH_DOWN = 82;
/** a mushroom's step: higher than the second jump climbs (185 px), within the bounce's (the old 1-1's bounce walls) */
const BOUNCE_UP = 205;
/** a fall this far under the last ground in the finale is a fall (fallZones) */
const FALL_DEPTH = 420;
/** and in the guarded stretches (the bough under a gap is 82 down): a fall this far under the last ground is a fall past it */
const GUARD_DEPTH = 300;
/** the backdrop's turn to the canopy: from this share of the way up to the top branch to this one (Easy's climb is lower) */
const CANOPY_FROM = 0.35;
const CANOPY_FULL = 0.78;

type Under = 'soft' | 'catch' | 'pit';

/** the open gaps joined into stretches of open air: a fall carries him on under the next bough, which is open air too */
function mergeZones(zs: Array<{ x0: number; x1: number; depth: number }>): Array<{ x0: number; x1: number; depth: number }> {
  const out: Array<{ x0: number; x1: number; depth: number }> = [];
  for (const z of [...zs].sort((a, b) => a.x0 - b.x0)) {
    const l = out[out.length - 1];
    if (l && z.x0 - l.x1 < 700) l.x1 = Math.max(l.x1, z.x1);
    else out.push({ ...z });
  }
  for (const z of out) z.x1 += 200;
  return out;
}
const J = (dy: number, surface: Step['surface'] = 'branch'): Step => ({ move: 'jump', dy, surface });
const H = (dy: number, surface: Step['surface'] = 'branch'): Step => ({ move: 'hop', dy, surface });
const D = (dy: number, surface: Step['surface'] = 'branch'): Step => ({ move: 'double', dy, surface });

export function buildIntoCanopy(config: LevelConfig, seed: number, easy = false): GeneratedStage & { proto: ProtoExtras } {
  const R = stream(seed * 7919 + 11);
  const bpm = stageBpm(config);
  const P: Platform[] = [];
  const C: Collectible[] = [];
  const checkpoints: Array<{ x: number; y: number; reached: boolean }> = [];
  const hints: StageHint[] = [];
  const beats: Array<[number, number, string]> = [];
  const pieces: Array<{ k: string; x0: number; x1: number }> = [];
  const fallZones: Array<{ x0: number; x1: number; depth: number }> = [];
  /**
   * the canopy stretches before the high road (the twist, the spike, the low road): a bough catches a plain miss, and a fall past it
   * (off a catch's end, a jump that misses everything) is a heart and back on the ledge he left (World 8's heart falls, engine.ts
   * heartFall; Easy's soft fall), never a life: nothing costs a life before the high road and the finale
   */
  const guarded: Array<{ x0: number; x1: number }> = [];
  const guard = (f: () => void) => {
    const x0 = x;
    f();
    guarded.push({ x0: Math.round(x0 - 100), x1: Math.round(x + 100) });
  };
  let pid = 1, cid = 1;
  let expert = 0;
  /** where the next gap starts, while a node lays what goes under its gaps (catch boughs stop short of it) */
  let nextGap = Infinity;

  // ---- the cursor: he stands at x on a surface at height y (0 is the forest floor, up is negative) that began at `from` and is laid
  // when he leaves it; `kind` is what it is
  let x = 0, y = 0, from = 0;
  let kind: 'bank' | 'earth' | 'branch' = 'bank';
  const flower = (fx: number, fy: number, v: Collectible['botanicalVariant'] = 'orchid') =>
    C.push({ id: cid++, type: 'flower', botanicalVariant: v, x: Math.round(fx), y: Math.round(fy), collected: false, bobPhase: (fx * 0.031) % 6.28 });
  /** a surface: a bank of the forest floor, an earth step standing down into the floor, or a bough */
  const lay = (x0: number, x1: number, top: number, k: typeof kind): Platform => {
    const w = Math.round(x1 - x0);
    const p: Platform = k === 'bank' && top === 0
      ? { id: pid++, x: Math.round(x0), y: top, width: w, height: BANK_H, type: 'solid', style: 'log' }
      : k === 'bank' || k === 'earth'
        ? { id: pid++, x: Math.round(x0), y: top, width: w, height: -top + BANK_H, type: 'solid', style: 'log', soil: true }
        : { id: pid++, x: Math.round(x0), y: top, width: w, height: 24, type: 'solid', style: 'branch' };
    P.push(p);
    return p;
  };
  const leave = () => {
    if (x - from > 1) lay(from, x, y, kind);
  };
  const walk = (len: number) => {
    x += len;
    expert += len / RUN;
  };
  const flag = (at = x - 60) => checkpoints.push({ x: Math.round(at), y, reached: false });
  const hint = (hx: number, text: string, pad = text, keys = text) => hints.push({ x: Math.round(hx), text, pad, keys });
  const beat = (name: string, f: () => void) => {
    const b0 = x;
    f();
    beats.push([b0, x, name]);
  };
  const row = (x0: number, x1: number, fy: number, n: number, v: Collectible['botanicalVariant'] = 'orchid') => {
    for (let i = 0; i < n; i++) flower(x0 + ((x1 - x0) * i) / Math.max(1, n - 1), fy - 34, v);
  };

  /** what goes under one gap: moss on the forest floor or under the bank's steps, a short bough, or open air */
  const under = (x0: number, x1: number, a: number, b: number, u: Under) => {
    if (u === 'soft') {
      if (a === 0 && b === 0) {
        // a soft pit in the forest floor: moss walled down to it, and a step out at the far wall
        const wallTop = BANK_H;
        P.push({ id: pid++, x: x0 - 60, y: wallTop, width: 60, height: HOLLOW - wallTop + 4, type: 'solid', style: 'moss_stone', soil: true });
        P.push({ id: pid++, x: x1, y: wallTop, width: 60, height: HOLLOW - wallTop + 4, type: 'solid', style: 'moss_stone', soil: true });
        P.push({ id: pid++, x: x0 - 60, y: HOLLOW, width: x1 - x0 + 120, height: BANK_H, type: 'solid', style: 'moss_stone' });
        const sw = x1 - x0 < 170 ? x1 - x0 : 70;
        P.push({ id: pid++, x: x1 - sw, y: HOLLOW - PIT_STEP, width: sw, height: PIT_STEP, type: 'solid', style: 'moss_stone', soil: true });
      } else {
        // between the bank's steps: a mossy floor one easy hop under the lower side
        const fl = Math.min(HOLLOW, Math.max(a, b) + 70);
        P.push({ id: pid++, x: x0, y: fl, width: x1 - x0, height: HOLLOW + BANK_H - fl, type: 'solid', style: 'moss_stone', soil: true });
      }
    } else if (u === 'catch') {
      // a bough under the gap, reaching well on under the far ledge (a missed jump up comes down under it), but stopping short of the
      // next gap (`nextGap`): a row of them joined would be a walk under the hops
      const c1 = Math.min(x1 + 150, nextGap - 60);
      lay(x0 - 40, Math.max(c1, x1 + 30), Math.max(a, b) + CATCH_DOWN, 'branch');
    }
    else fallZones.push({ x0: Math.round(x0 - 40), x1: Math.round(x1 + 40), depth: FALL_DEPTH });
  };

  /**
   * A node on the beat (beatTrace.ts): its bars and moves traced from the cursor, every surface laid where his feet come down, `u` saying
   * what goes under each gap (by step). The node's entrance apron gets its flag. The traced surfaces: a ground-level bank or apron is
   * the forest floor's bank; up the bank, earth steps (`earth`); in the trees, boughs.
   */
  const node = (bars: string[], steps: Step[], u: (i: number) => Under, opts: { earth?: boolean; flag?: boolean } = {}): Trace => {
    // what he stands on runs up to the apron (the node's own apron starts where he is)
    leave();
    const was = kind;
    // (Easy: easyNode lowers every rise; the drops come down with them, so Easy's climb keeps its shape, floor to canopy)
    // (Easy: a run of quarter-note hops is played at half the pace: with Easy's wider pads and lower drops, hops a beat apart merged
    // into walk-offs, a dead walk down a slope)
    const easyBars = (bs: string[]) => bs.flatMap((b) => (b === 'x.x.x...' ? ['x...x...', 'x.......'] : b === 'x.x.x.x.' ? ['x...x...', 'x...x...'] : [b]));
    const spec: NodeSpec = { bpm, x, y, bars: easy ? easyBars(bars) : bars, steps: easy ? steps.map((st) => (st.dy < 0 ? { ...st, dy: Math.round(st.dy * 0.65) } : st)) : steps };
    const tr = traceNode(easy ? easyNode(spec) : spec);
    tr.ledges.forEach((l, i) => {
      const last = i === tr.ledges.length - 1;
      const k: typeof kind = l.y === 0 && (l.surface === 'bank' || l.surface === 'apron') ? 'bank'
        : l.surface === 'stump' || l.surface === 'bank' || opts.earth || (l.surface === 'apron' && i === 0 && was !== 'branch') ? 'earth' : 'branch';
      if (last) {
        // the exit apron stays open: the next piece carries on from it
        from = l.x0;
        kind = k;
        return;
      }
      lay(l.x0, l.x1, l.y, k);
    });
    for (const [gi, g] of tr.gaps.entries()) {
      nextGap = tr.gaps[gi + 1]?.x0 ?? Infinity;
      const a = tr.ledges.find((l) => Math.abs(l.x1 - g.x0) < 2)?.y ?? y;
      const b = tr.ledges.find((l) => Math.abs(l.x0 - g.x1) < 2)?.y ?? y;
      under(g.x0, g.x1, a, b, u(g.step));
    }
    nextGap = Infinity;
    if (opts.flag !== false) checkpoints.push({ x: Math.round(tr.checkpoint.x), y: tr.checkpoint.y, reached: false });
    x = tr.x1;
    y = tr.yOut;
    expert += tr.seconds;
    // a petal over each move that rises, where the jump goes
    for (const l of tr.landings) if (l.toY < l.fromY - 20) flower((l.fromX + l.toX) / 2, Math.min(l.fromY, l.toY) - 90, 'hibiscus');
    return tr;
  };

  /** a mushroom at the end of what he is on, throwing him up `rise` onto what comes next (a miss is a bounce again) */
  const bounce = (rise: number, onto: typeof kind, u: Under, gapW = 120) => {
    walk(90);
    leave();
    const edge = x;
    P.push({ id: pid++, x: edge - 75, y: y - 30, width: 70, height: 30, type: 'bouncy' });
    const ny = y - rise;
    // (a missed bounce comes down short of the far ledge or under it: the catch reaches on under it)
    nextGap = edge + gapW + 260;
    under(edge, edge + gapW, y, ny, u);
    nextGap = Infinity;
    from = edge + gapW;
    y = ny;
    kind = onto;
    // (the next node's apron starts just past the landing: a bounce is 1.5-2 s of no input, so a long run-out after it is a dead walk)
    x = from + 30;
    expert += 1.4 + gapW / RUN;
  };

  /** a quiet walk with root knots to step over (small hops: a bump in the walk, not a move) */
  const stroll = (len: number, knots: number) => {
    const x0 = x;
    // (the first knot and the last close to the ends, since the node before ends on its exit apron and the next starts on its entrance
    // apron, and a knot every 330 px or so: a quiet walk is never 2.5 s without one)
    const END = 50;
    const n = Math.max(knots, Math.ceil(len / 330));
    // (the knots' own width is part of the length)
    const gap = (len - 2 * END - n * 90) / Math.max(1, n - 1);
    for (let k = 0; k < n; k++) {
      walk(k === 0 ? END : gap);
      // (the surface breaks round each knot, as the floor's stumps do: on one long piece under it the level check walked through it)
      leave();
      const kw = Math.round(R.r(80, 100));
      if (kind === 'branch') P.push({ id: pid++, x: Math.round(x), y: y - 26, width: kw, height: 50, type: 'solid', style: 'moss_stone' });
      else P.push({ id: pid++, x: Math.round(x), y: y - 40, width: kw, height: 40 - y + BANK_H, type: 'solid', style: 'log', soil: true });
      walk(kw);
      from = x;
    }
    walk(END);
    pieces.push({ k: 'rest', x0, x1: x });
  };

  // ======================================================================================================================== the nodes
  /** the bank's step heights, this roll */
  const steps = R.pick([[50, 60, 40], [60, 40, 50], [40, 60, 60]]);

  // ---- 1. The forest floor (intro, 0.4 moves a second): whole notes, soft moss under every gap. The touch coach teaches the gestures
  // first (touchCoach.ts), so the tip comes at the first gap.
  beat('Intro: the forest floor', () => {
    walk(Math.round(R.r(220, 260)));
    hint(x + 120, 'Jump the little gaps');
    // (a whole note each: a gap, a stump up, a hop down, a gap, a stump; the stumps are bumps in the walk, so the jumps come about one
    // every 2.5-4 s, and the walk is never 2.5 s without something under the thumb)
    node(['h.......', 'h.......', 'h.......', 'h.......', 'h.......', 'h.......'], [J(0, 'bank'), J(40, 'stump'), H(-40, 'bank'), J(0, 'bank'), J(30, 'stump'), H(-30, 'bank')], () => 'soft');
    // (the ramp's entrance apron is this one's exit apron: two in a row were 400 px of flat ground)
    x = Math.max(from + 200, x - 420);
    pieces.push({ k: 'floor', x0: 0, x1: x });
  });

  // ---- 2. Up the bank (ramp, about 0.8 a second): half notes and whole notes, steps up, across and down, over moss; then a step too
  // tall to jump with a mushroom at its foot (the bounce, taught: a miss is a bounce again)
  beat('Ramp: up the bank', () => {
    const x0 = x;
    hint(x + 140, 'Up the bank! Step to step');
    node(['h...h...', 'h.......', 'h...h...'], [J(0, 'bank'), J(steps[0], 'stump'), J(0, 'stump'), H(-30, 'stump'), J(steps[1], 'stump')], () => 'soft', { earth: true });
    hint(x - 40, 'Land on the mushroom to bounce up high');
    bounce(BOUNCE_UP, 'earth', 'soft');
    node(['h...h...', 'h.......', 'h...h...'], [J(0, 'stump'), H(-20, 'stump'), J(40, 'stump'), J(0, 'stump'), H(-30, 'stump')], () => 'soft', { earth: true, flag: false });
    pieces.push({ k: 'bank', x0, x1: x });
  });

  // ---- 4. The bank's last steps (ramp): longer gaps now, down and up, and the second mushroom onto the bank's top
  beat('Ramp: the last steps', () => {
    node(['h.......', 'h...h...', 'h.......', 'h...h...', 'h.......'], [J(0, 'stump'), J(steps[2], 'stump'), H(-40, 'stump'), J(0, 'stump'), J(60, 'stump'), J(0, 'stump'), H(-30, 'stump')], () => 'soft', { earth: true });
    bounce(BOUNCE_UP - 10, 'earth', 'soft');
    // (one ramp up the bank, in two parts with no rest between: one piece, not the same piece twice)
    pieces[pieces.length - 1].x1 = x;
  });

  // ---- 5. The bank top (rest): no move. Dot names the second jump; a shelf over the path only it reaches is there to try it on (a miss
  // lands him back on the path). The first kapok's boughs are in view ahead.
  beat('Rest: the bank top', () => {
    flag(x + 40);
    hint(x + 60, 'Flick up again in the air to jump twice', 'Press Jump again in the air', 'Press Space again in the air');
    stroll(Math.round(R.r(700, 760)), 2);
    lay(x + 40, x + 210, y - 150, 'branch');
    flower(x + 125, y - 150 - 34, 'hibiscus');
    walk(100);
  });

  // ---- 5b. Down the roots (the wave dips): off the bank top down the kapok's roots, earth steps going down and across, half and whole
  // notes, moss under every gap; the boughs the twist climbs are over the dip
  beat('Ramp: down the roots', () => {
    const x0 = x;
    node(['h.......', 'h...h...', 'h.......', 'h...h...', 'h.......'], [H(-40, 'stump'), J(0, 'stump'), H(-30, 'stump'), J(30, 'stump'), H(-50, 'stump'), J(0, 'stump'), H(-40, 'stump')], () => 'soft', { earth: true, flag: false });
    pieces.push({ k: 'roots', x0, x1: x });
  });

  // ---- 6. The off-beat catch (the twist: the half notes turn into a jump on the beat and the second jump on the off-beat, one move):
  // up off the bank onto the first kapok's boughs; a short bough under each gap
  beat('Twist: the off-beat catch', () => guard(() => {
    const x0 = x;
    node(['h....o..', '....h...', 'h.......', 'h....o..', '....h...', 'h...h...'],
      [J(40), D(90), J(-40), J(0), D(100), J(-30), J(30), H(-40), J(0)], () => 'catch');
    pieces.push({ k: 'catch', x0, x1: x });
  }));

  // ---- 8. Up into the canopy (spike, the stage's moment): the second jump up bough after bough, half notes between, a run down a slope
  // of twigs in the middle and up again
  beat('Spike: up into the canopy', () => guard(() => {
    const x0 = x;
    node(['h.......', 'h...h...', 'x.x.x.x.', 'h.......', 'h...h...', 'h.......'],
      // (Easy: one gap in four open air, a soft fall back to the spike's flag; on Easy the guard is no hurt, so all catches cost nothing)
      [D(140), J(0), H(-50), H(-20), H(-35), H(-15), H(-30), D(150), J(20), J(-30), D(150)], (i) => (easy && i % 4 === 3 ? 'pit' : 'catch'));
    pieces.push({ k: 'canopy', x0, x1: x });
  }));

  // ---- 9. The high bough (rest): no move. Dot's line; the golden seed glints on the high road ahead.
  beat('Rest: the high bough', () => {
    flag(x + 40);
    hint(x + 60, 'Look how high we are!');
    stroll(Math.round(R.r(950, 1050)), 2);
  });

  // ---- 10. The high road or the low road (a choice). The low road is the counter-melody, the bounce and the hop: mushrooms up, hops
  // down, a bough under each gap. The high road: up a mushroom by the fork, the second jump over open air, the golden seed at its end,
  // and a drop down to where the roads meet.
  beat('Choice: the high road or the low', () => {
    const x0 = x;
    const y0 = y;
    walk(160);
    const forkX = x;
    // the low road
    const lowFrom = x;
    // (Easy: every third gap open air, Easy's soft fall back to the flag: on Easy the guard under the low road is no hurt, so a catch
    // under every gap made the whole road cost nothing)
    const lowU = (i: number): Under => (easy && i % 3 === 2 ? 'pit' : 'catch');
    node(['h...h...', 'x.x.x...'], [J(0), H(-40), H(-20), H(-35), H(-25)], lowU, { flag: false });
    bounce(BOUNCE_UP - 20, 'branch', 'catch');
    // (a flag on the low road halfway: LV-9, never 4000 px without one)
    flag(x + 60);
    node(['h.......', 'h...h...', 'x.x.x.x.'], [J(0), H(-30), J(20), H(-35), H(-20), H(-30), H(-25)], lowU, { flag: false });
    bounce(BOUNCE_UP - 10, 'branch', 'catch');
    guarded.push({ x0: Math.round(lowFrom - 100), x1: Math.round(x + 100) });
    const sx = x, sy = y, sf = from, sk = kind;
    // the high road
    P.push({ id: pid++, x: Math.round(forkX - 150), y: y0 - 30, width: 70, height: 30, type: 'bouncy' });
    y = y0 - BOUNCE_UP;
    from = forkX - 30;
    kind = 'branch';
    x = forkX - 40;
    node(['h....o..', '....h...', 'h.......', 'h....o..', '....h...'], [J(0), D(40), J(-20), J(0), D(0), J(-30), J(0)], () => 'pit', { flag: false });
    lay(from, x, y, 'branch');
    C.push({ id: cid++, type: 'seed', x: Math.round(x - 80), y: y - 40, collected: false, bobPhase: 1, findId: 'seed-1' });
    x = sx;
    y = sy;
    from = sf;
    kind = sk;
    pieces.push({ k: 'choice', x0, x1: x });
  });

  // ---- 11. The last low bough (rest): Dot's warning before the high branches
  beat('Rest: before the high branches', () => {
    flag(x + 40);
    hint(x + 60, 'No soft moss up here!');
    stroll(Math.round(R.r(950, 1050)), 2);
  });

  // ---- 12. The high branches (the finale, the densest, 15-20 s): half notes and off-beat catches over open air, up and down, a
  // mushroom in the middle, ending AT the shrine on the top branch
  beat('Finale: the high branches', () => {
    const x0 = x;
    // (open air under every other gap, a bough under the rest: it bites, but stage 1's first-timer is not sent back three times a
    // stretch; a flag again after the mushroom)
    // (on Easy every gap is open air: Easy's soft fall puts him back, a setback and never a life, so a catch would only make it nothing)
    node(['h...h...', 'h....o..', '....h...'], [J(0), J(20), J(-30), D(120), J(-20)], (i) => (easy || i % 2 === 0 ? 'pit' : 'catch'));
    bounce(BOUNCE_UP - 15, 'branch', 'pit', 130);
    flag(x + 80);
    node(['h...h...', 'h....o..', '....h...'], [J(0), H(-40), J(20), D(130), J(0)], (i) => (easy || i % 2 ? 'pit' : 'catch'), { flag: false });
    pieces.push({ k: 'finale', x0, x1: x });
  });

  // the top branch: the shrine a few steps on from the last landing, the canopy all round
  const topY = y;
  const crown = lay(from, x + 420, y, 'branch');
  const exitX = Math.round(from + 260);
  row(from + 60, from + 200, y, 2, 'hibiscus');
  C.push({ id: cid++, type: 'exit_totem', x: exitX, y: topY - 30, collected: false, bobPhase: 0 });

  // ---- place it: the top branch 420 under the top of the stage, the floor near its bottom
  const minY = Math.min(...P.map((p) => p.y));
  const shift = 420 - minY;
  for (const p of P) p.y += shift;
  for (const c of C) c.y += shift;
  for (const cp of checkpoints) cp.y += shift;
  for (const h of hints) {
    if (h.belowY !== undefined) h.belowY += shift;
    if (h.aboveY !== undefined) h.aboveY += shift;
  }
  const floorY = shift;
  const H0 = floorY + HOLLOW + BANK_H + 20;
  cid = heartsAtFlags(C, checkpoints, cid);
  const movedPickups = fixPickups({ platforms: P, vines: [] }, C);
  const width = Math.ceil(Math.max(...P.map((p) => p.x + p.width)) + 20);
  const cfg: LevelConfig = { ...config, levelWidth: width, levelHeight: Math.max(config.levelHeight, H0) };
  return {
    config: cfg,
    trees: [],
    platforms: P,
    vines: [],
    ropes: [],
    enemies: [],
    boss: null,
    collectibles: C,
    spawnX: 140,
    spawnY: floorY,
    exitTotemX: exitX,
    exitTotemY: crown.y,
    checkpoints: checkpoints.sort((a, b) => a.x - b.x),
    // (open air: the finale and the high road, a life; the guarded stretches, a heart and back: their zones are heart falls too)
    fallZones: [...mergeZones(fallZones), ...guarded.map((g) => ({ ...g, depth: GUARD_DEPTH }))],
    heartFalls: guarded,
    meta: { attempt: seed, chunks: pieces.map((p) => p.k), width, pieces, timing: { layoutSeconds: expert, decorSeconds: 0, route: width } },
    proto: {
      hints: hints.sort((a, b) => a.x - b.x), covers: [], beats, movedPickups,
      // the forest floor turns to the canopy as he rises (World 1's canopy strips, as on 1-8 and the top of 1-4)
      rise: { y0: Math.round(floorY - (floorY - crown.y) * CANOPY_FROM), y1: Math.round(floorY - (floorY - crown.y) * CANOPY_FULL) },
    },
  };
}

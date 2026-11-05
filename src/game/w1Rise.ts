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
import { badPickups, fixPickups } from './flowerReach.ts';
import { busiestScreen, clumpExtras, offArc, PER_SCREEN, rowExtras, SCREEN } from './petals.ts';
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

  /**
   * a root knot just past a mushroom's landing: the goal route, after the low road's first bounce, turned on the landing bough and
   * dropped back for the high road, 3.5 s of the bounce and a walk with no move (the fun gate's dead walk, the lead's ruling 2026-11-04);
   * a knot there is a hop in it, both ways
   */
  const knotPastLanding = () => {
    walk(60);
    leave();
    const kw = Math.round(R.r(80, 100));
    P.push({ id: pid++, x: Math.round(x), y: y - 26, width: kw, height: 50, type: 'solid', style: 'moss_stone' });
    walk(kw);
    from = x;
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
  /** the traces of each road of the choice (the petals' split is made on their ledges after the petal pass: splitPetals) */
  const roads = { low: { tr: [] as Trace[] }, high: { tr: [] as Trace[] } };
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
      // (one gap in three open air, both settings: inside the guard a miss there is a heart and back on the ledge on Normal, Easy's soft
      // fall on Easy, never a life; with a bough under every gap the canopy's misses cost nothing on Normal, the fun gate's "nothing
      // bites", the lead's ruling 2026-11-04: about one in four was asked; one in four still left 7 layouts flagged)
      [D(140), J(0), H(-50), H(-20), H(-35), H(-15), H(-30), D(150), J(20), J(-30), D(150)], (i) => (i % 3 === 1 ? 'pit' : 'catch'));
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
    // (room past the rest's last root knot: none under the perch, where a hop over one could land him on it)
    walk(240);
    const forkX = x;
    // the low road
    const lowFrom = x;
    // (every third gap open air: on Normal the guard makes a fall there a heart and back at the gap, on Easy a soft fall back; with a catch
    // under every gap the low road cost nothing, and the two roads must both bite, whichever a player takes)
    const lowU = (i: number): Under => (i % 3 === 2 ? 'pit' : 'catch');
    roads.low.tr.push(node(['h...h...', 'x.x.x...'], [J(0), H(-40), H(-20), H(-35), H(-25)], lowU, { flag: false }));
    bounce(BOUNCE_UP - 20, 'branch', 'catch');
    knotPastLanding();
    // (a flag on the low road halfway: LV-9, never 4000 px without one)
    flag(x + 60);
    roads.low.tr.push(node(['h.......', 'h...h...', 'x.x.x.x.'], [J(0), H(-30), J(20), H(-35), H(-20), H(-30), H(-25)], lowU, { flag: false }));
    bounce(BOUNCE_UP - 10, 'branch', 'catch');
    guarded.push({ x0: Math.round(lowFrom - 100), x1: Math.round(x + 100) });
    const sx = x, sy = y, sf = from, sk = kind;
    // the high road: a perch one jump up over the path, a mushroom on it (on the walking line, the mushroom took every player up and the
    // low road was only a drop through a bough, 2026-11-04): jump to the perch for the high road, walk on under it for the low road
    const PERCH = 95;
    lay(forkX - 200, forkX - 40, y0 - PERCH, 'branch');
    P.push({ id: pid++, x: Math.round(forkX - 130), y: y0 - PERCH - 30, width: 70, height: 30, type: 'bouncy' });
    y = y0 - PERCH - BOUNCE_UP;
    from = forkX - 30;
    kind = 'branch';
    x = forkX - 40;
    roads.high.tr.push(node(['h....o..', '....h...', 'h.......', 'h....o..', '....h...'], [J(0), D(40), J(-20), J(0), D(0), J(-30), J(0)], () => 'pit', { flag: false }));
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
  beat('Finale: the high branches', () => (easy ? (f: () => void) => f() : guard)(() => {
    const x0 = x;
    // (open air under every other gap, a bough under the rest: it bites, but stage 1's first-timer is not sent back three times a
    // stretch; a flag again after the mushroom. On Normal a fall here costs a heart and puts him back at the gap (heartFalls), three
    // hearts a life: as real pits the first-timer adult bot lost 7-9 lives here, two game overs a run; as heart falls, 2 lives and none)
    // (on Easy every gap is open air: Easy's soft fall puts him back, a setback and never a life, so a catch would only make it nothing)
    node(['h...h...', 'h....o..', '....h...'], [J(0), J(20), J(-30), D(120), J(-20)], (i) => (easy || i % 2 === 0 ? 'pit' : 'catch'));
    // (a bough under the mushroom on Normal: the first-timer adult bot's third life went there on 2 of 3 runs; Easy's soft fall is a setback)
    bounce(BOUNCE_UP - 15, 'branch', easy ? 'pit' : 'catch', 130);
    flag(x + 80);
    node(['h...h...', 'h....o..', '....h...'], [J(0), H(-40), J(20), D(130), J(0)], (i) => (easy || i % 2 ? 'pit' : 'catch'), { flag: false });
    pieces.push({ k: 'finale', x0, x1: x });
  }));

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
  // (the roads' ledges, for the petals' split after the petal pass: splitPetals)
  const roadLedges = (r: typeof roads.low) => r.tr.flatMap((t) => t.ledges.map((l) => [Math.round(l.x0), Math.round(l.x1), Math.round(l.y + shift)] as [number, number, number]));
  const choice = { low: roadLedges(roads.low), high: roadLedges(roads.high) };

  // ---- the canopy's look (the lead's polish review, 2026-11-04): no bough floats with nothing holding it, the painted bromeliad on a
  // third of them only, and the boughs not all one thickness. Draw only: the walkable tops and the beat are unchanged.
  const boughs = P.filter((p) => p.style === 'branch' && p.type !== 'bouncy' && p.height < 50).sort((a, b) => a.x + a.width - (b.x + b.width));
  const LOOK = stream(seed * 104729 + 7);
  for (const p of boughs) {
    p.bare = LOOK.f() < 0.67;
    p.thick = Math.round((0.82 + LOOK.f() * 0.45) * 100) / 100;
  }
  // (the kapoks the boughs grow from, the lead's second look, 2026-11-04: few and huge, unevenly spaced; a bough grows out of a trunk at
  // ONE end and its other end tucks into a leafy clump; a bough with no trunk at either end tucks into leaves at both)
  const trunks: Array<{ x: number; topY: number; bottomY: number; w: number }> = [];
  const leaves: Array<{ x: number; y: number; w: number; flip?: boolean; kind?: 'bushWide' | 'fernClump' | 'bushTall' }> = [];
  const byX = [...boughs].sort((a, b) => a.x - b.x);
  let every = 2 + Math.floor(LOOK.f() * 3), since = every;
  for (const p of byX) {
    const half = (t: { w: number }) => (84 * t.w) / 2;
    const atL = trunks.find((t) => Math.abs(t.x - p.x) < half(t) * 0.7);
    const atR = trunks.find((t) => Math.abs(t.x - (p.x + p.width)) < half(t) * 0.7);
    let grows = atL ? 'L' : atR ? 'R' : '';
    // (a new kapok every 2-4 boughs, at this bough's left or right end, never crowding the last)
    if (!grows && ++since >= every && !trunks.some((t) => t.w >= 1.6 && Math.abs(t.x - p.x) < 380)) {
      const w = Math.round((1.6 + LOOK.f()) * 100) / 100;
      let left = LOOK.f() < 0.5;
      // (never beside one of the slimmer trees: trunk against trunk)
      const crowd = (x: number) => trunks.some((t) => Math.abs(t.x - x) < 160);
      if (crowd(left ? p.x + 10 : p.x + p.width - 10)) left = !left;
      if (!crowd(left ? p.x + 10 : p.x + p.width - 10)) {
        trunks.push({ x: Math.round(left ? p.x + 10 : p.x + p.width - 10), topY: -1200, bottomY: shift + BANK_H, w });
        grows = left ? 'L' : 'R';
      }
      since = 0;
      every = 2 + Math.floor(LOOK.f() * 3);
    }
    // (a bough no kapok holds grows from a slimmer tree of its own at its end furthest from them, crowned in leaves: the quality
    // supervisor, 11-04, half the boughs read as planks floating in the air; never within 200 px of a trunk, so they don't wall up)
    const reach = (x: number) => Math.min(Infinity, ...trunks.map((t) => Math.abs(t.x - x)));
    if (!grows && !trunks.some((t) => t.x + half(t) * 0.7 >= p.x && t.x - half(t) * 0.7 <= p.x + p.width)) {
      const left = reach(p.x) >= reach(p.x + p.width);
      const at = left ? p.x + 10 : p.x + p.width - 10;
      if (reach(at) >= 200) {
        const w = Math.round((1.0 + LOOK.f() * 0.35) * 100) / 100;
        const topY = p.y - Math.round(120 + LOOK.f() * 60);
        trunks.push({ x: Math.round(at), topY, bottomY: shift + BANK_H, w });
        leaves.push({ x: Math.round(at), y: topY + 30, w: Math.round(150 + LOOK.f() * 40), flip: LOOK.f() < 0.5, kind: 'bushWide' });
        grows = left ? 'L' : 'R';
      }
    }
    // (the free ends: World 1's three foliage pieces, flipped and sized at random; none where a neighbour's end is a hop away, where
    // the clumps stacked)
    const near = (x: number) => byX.some((q) => q !== p && Math.abs(q.y - p.y) < 90 && (Math.abs(q.x - x) < 70 || Math.abs(q.x + q.width - x) < 70));
    const kinds = ['bushWide', 'bushWide', 'fernClump', 'bushTall'] as const;
    const leaf = (x: number, flip: boolean, end: number) => {
      if (near(end)) return;
      const kind = kinds[Math.floor(LOOK.f() * kinds.length)];
      leaves.push({ x: Math.round(x), y: p.y + 8, w: Math.round((kind === 'bushTall' ? 70 : 105) + LOOK.f() * (kind === 'bushTall' ? 30 : 55)), flip: LOOK.f() < 0.5 ? flip : !flip, kind });
    };
    if (grows !== 'L') leaf(p.x - 6, true, p.x);
    if (grows !== 'R') leaf(p.x + p.width + 6, false, p.x + p.width);
  }
  // (the painted ends of two boughs a hop apart overlapped: each is cut at the gap's middle, draw only)
  for (const p of byX) {
    for (const q of byX) {
      if (q === p || Math.abs(q.y - p.y) > 60) continue;
      const gap = q.x - (p.x + p.width);
      if (gap >= 0 && gap < 70) {
        const mid = Math.round(p.x + p.width + gap / 2);
        p.drawX1 = Math.min(p.drawX1 ?? Infinity, mid);
        q.drawX0 = Math.max(q.drawX0 ?? -Infinity, mid);
      }
    }
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
      hints: hints.sort((a, b) => a.x - b.x), covers: [], beats, movedPickups, choice, trunks, leaves,
      // the forest floor turns to the canopy as he rises (World 1's canopy strips, as on 1-8 and the top of 1-4)
      rise: { y0: Math.round(floorY - (floorY - crown.y) * CANOPY_FROM), y1: Math.round(floorY - (floorY - crown.y) * CANOPY_FULL) },
    },
  };
}

/** the shared path's share of the petals, and each road's (Matt, 2026-11-04: 70/30, 15% on each road of the choice) */
export const SPLIT = { shared: 0.7, road: 0.15 } as const;

/**
 * 1-1's petals split 70/15/15 (Matt, 2026-11-04: "keep the core amount on places that the player always have to use"): run after the
 * petal pass, which lays most of them. A petal over the choice belongs to the road whose ledge is nearer; each road is then topped up on
 * its own ledges (middle first, then the thirds) or trimmed from its far end, to 15/70 of the shared path's count. So either road
 * reaches 85%, and 100% takes a replay. Records the roads' petals in proto.roads.
 */
export function splitPetals(st: GeneratedStage & { proto: { choice?: { low: Array<[number, number, number]>; high: Array<[number, number, number]> }; roads?: { low: number[]; high: number[] } } }) {
  const ch = st.proto.choice;
  if (!ch) return;
  const C = st.collectibles;
  const all = [...ch.low, ...ch.high];
  const x0 = Math.min(...all.map((l) => l[0])), x1 = Math.max(...all.map((l) => l[1]));
  const dist = (c: Collectible, ls: Array<[number, number, number]>) =>
    Math.min(...ls.map(([a, b, y]) => Math.hypot(Math.max(0, a - c.x, c.x - b), c.y - (y - 34))));
  const isP = (c: Collectible) => c.type === 'flower';
  const inChoice = (c: Collectible) => c.x >= x0 && c.x <= x1;
  const of = (k: 'low' | 'high') => C.filter((c) => isP(c) && inChoice(c) && (k === 'low' ? dist(c, ch.low) <= dist(c, ch.high) : dist(c, ch.high) < dist(c, ch.low)));
  let cid = Math.max(0, ...C.map((c) => c.id)) + 1;
  const want = () => Math.round((C.filter((c) => isP(c) && !inChoice(c)).length * SPLIT.road) / SPLIT.shared);
  // (a petal may go where the petal rules hold: reachable, not tucked under a bough, not under a jump's arc, no clump or row, at most
  // PER_SCREEN on a screen)
  const fits = (c: Collectible, k: 'low' | 'high') => {
    if (C.some((o) => isP(o) && Math.abs(o.x - c.x) < 45 && Math.abs(o.y - c.y) < 45)) return false;
    // (never under the high road by the fork: a petal there pulls a player off the road he chose, and back up again)
    if (under(c, k)) return false;
    if (badPickups({ platforms: st.platforms, vines: st.vines }, [c]).length) return false;
    const near = C.filter((o) => isP(o) && Math.abs(o.x - c.x) < SCREEN.w * 1.5);
    const with_ = [...near, c];
    // (a new petal can make a neighbour the extra one of a clump or a row: compare with and without it)
    if (busiestScreen(with_).n > PER_SCREEN) return false;
    if (clumpExtras(with_).size > clumpExtras(near).size) return false;
    if (rowExtras(with_).size > rowExtras(near).size) return false;
    return !offArc(st, [c]).size;
  };
  // (the petal pass's petals there go first, for the same reason)
  // (by the fork: a petal under the high road's start drew a player straight back down off it; further on, the high road ends in a drop
  // to the low road anyway)
  const hx0 = Math.min(...ch.high.map((l) => l[0]));
  const under = (c: Collectible, k: 'low' | 'high') => k === 'low' && c.x < hx0 + 700 && ch.high.some(([a, b, y]) => c.x > a - 60 && c.x < b + 60 && y < c.y && c.y - y < 420);
  for (const k of ['low', 'high'] as const) for (const c of of(k)) if (under(c, k)) C.splice(C.indexOf(c), 1);
  for (const k of ['low', 'high'] as const) {
    const on = of(k).sort((a, b) => a.x - b.x);
    const w = want();
    while (on.length > w) C.splice(C.indexOf(on.pop()!), 1);
    // (spread along the road: its ledges' middles, then their thirds, in passes along the road)
    const spots: Array<[number, number]> = [];
    for (const f of [0.5, 0.25, 0.75]) for (const [a, b, y] of [...ch[k]].sort((p, q) => p[0] - q[0])) if (b - a >= 60) spots.push([Math.round(a + (b - a) * f), y - 34]);
    for (const [sx, sy] of spots) {
      if (on.length >= w) break;
      const c: Collectible = { id: cid, type: 'flower', botanicalVariant: 'orchid', x: sx, y: sy, collected: false, bobPhase: (sx * 0.031) % 6.28 };
      if (!fits(c, k)) continue;
      cid++;
      C.push(c);
      on.push(c);
    }
  }
  // (where a road could not hold its share without crowding, the shared path gives up petals instead, from its busiest stretches, so the
  // split stays 70/15/15)
  const road = Math.min(of('low').length, of('high').length);
  for (const k of ['low', 'high'] as const) {
    const on = of(k).sort((a, b) => a.x - b.x);
    while (on.length > road) C.splice(C.indexOf(on.pop()!), 1);
  }
  const sharedWant = Math.round((road * SPLIT.shared) / SPLIT.road);
  let shared = C.filter((c) => isP(c) && !inChoice(c));
  while (shared.length > sharedWant) {
    const b = busiestScreen(shared);
    const inWin = shared.filter((c) => c.x >= b.x && c.x <= b.x + SCREEN.w && Math.abs(c.y - b.y) <= SCREEN.h / 2);
    const drop = inWin[Math.floor(inWin.length / 2)] ?? shared[shared.length - 1];
    C.splice(C.indexOf(drop), 1);
    shared = shared.filter((c) => c !== drop);
  }
  st.proto.roads = { low: of('low').map((c) => c.id), high: of('high').map((c) => c.id) };
}

/**
 * 1-1's dressing kept off the play line (the lead's polish review, 2026-11-04: a white orchid stood on Pokey at the shrine, another hung
 * in the air in the finale): no piece over the shrine, none standing in the air he walks or jumps through over a ledge, and none
 * hanging with nothing under or over it to grow from.
 */
export function clearDress(st: { platforms: Platform[]; collectibles: Collectible[]; proto: { dress?: Array<{ n: string; x: number; b: number }> } }, size: (n: string) => { w: number; h: number }) {
  const ds = st.proto.dress;
  if (!ds?.length) return;
  const shrine = st.collectibles.find((c) => c.type === 'exit_totem');
  const solid = st.platforms.filter((p) => p.type !== 'bouncy');
  st.proto.dress = ds.filter((d) => {
    const { w, h } = size(d.n);
    const x0 = d.x - w / 2, x1 = d.x + w / 2, top = d.b - h;
    if (shrine && x1 > shrine.x - 260 && x0 < shrine.x + 260 && d.b > shrine.y - 300 && top < shrine.y + 120) return false;
    // (in the air over a ledge, where he walks and jumps: 0-170 px over its top)
    if (solid.some((p) => x1 > p.x + 4 && x0 < p.x + p.width - 4 && d.b > p.y - 170 && top < p.y - 4)) {
      // (standing on the ledge's top at its own end is set dressing at the edge; anything else there is in the way)
      if (!solid.some((p) => Math.abs(d.b - p.y) < 8 && (x1 < p.x + 40 || x0 > p.x + p.width - 40))) return false;
    }
    // (grows from something: its foot on a top, or its head under a bough's underside)
    return solid.some((p) => x1 > p.x && x0 < p.x + p.width && (Math.abs(d.b - p.y) < 10 || Math.abs(top - (p.y + p.height)) < 12));
  });
}

/**
 * The help sweep (R-165.62, INT-1-1): what the help ladder would grow at every piece of 1-1, judged by checks of its own (independent of
 * the stair builder it judges). Shared by the sweep test (helpLadderSweep.test.ts), the plain-jump flights (helpLadderPieces.test.ts) and
 * the full sweep tool (tools/inspect/helpSweep.ts). Test and tool code only: nothing in the game imports it.
 *
 * Per seed and setting, per piece:
 *  - breaches: every grown rock stands (never in the air), no face over 60 px, nothing sunk, no two grown boxes overlap;
 *  - canGrow: the ladder's own answer (the engine's canGrowAt, the call HelpLadder's canGrow makes): where it is false Dot never
 *    promises a step, and the sweep names why (nothing needed, a mushroom gives the rise, or no room for a climb or gap it needs);
 *  - after the steps grow (canGrow true), a plain-jump run passes the whole piece.
 */
import { RealPlay } from './realPlay.ts';
import { setDifficulty } from './difficulty.ts';
import { recorder } from './playRecorder.ts';
import { withPlaySeed } from './testlink1_1.ts';
import { maxGap } from './gen2/pipeline.ts';
import { skyline, STEP_LEFT, takeStairsLeftOut, BOUNCE_NEAR, BOUNCE_ALONE } from './helpLadder.ts';
import type { Platform } from './types.ts';

export type Box = { x: number; y: number; width: number; height: number; plank?: boolean; bouncy?: boolean; catch?: boolean };
export type Piece = { k: string; x0: number; x1: number };
export type Eng = {
  currentStage: { meta: { pieces: Piece[] }; gen2?: { budget?: { margin?: number } } };
  stepBoxes(p: Piece): Box[];
  canGrowAt(p: Piece): boolean;
  growSteps(p: Piece): void;
  helpState(): { grown: Platform[] };
  stop(): void;
};

/** every breach at one built stage: "<what>" */
export function breaches(platforms: readonly Platform[], boxes: Box[]): string[] {
  const out: string[] = [];
  // (planks are marked and may float; every other grown box is a rock)
  const rocks = boxes.filter((b) => !b.plank);
  const stand = [...platforms.filter((p) => (p.type === 'solid' || p.type === 'bouncy') && !p.broken), ...rocks];
  for (const r of rocks) {
    const foot = r.y + r.height;
    // (stands: on a top at its foot, or with that part inside a solid piece's body; never over air)
    const under = stand.filter((q) => q !== r && q.x < r.x + r.width && q.x + q.width > r.x && (Math.abs(q.y - foot) <= 2 || (q.y < foot - 2 && q.y + q.height >= foot - 2)));
    let covered = r.x;
    for (const q of [...under].sort((a, b) => a.x - b.x)) if (q.x <= covered + 1) covered = Math.max(covered, q.x + q.width);
    if (covered < r.x + r.width - 1) out.push(`a rock at x ${Math.round(r.x)} top ${Math.round(r.y)} floats (its foot ${Math.round(foot)} stands on ${Math.round(covered - r.x)} of ${r.width} px)`);
    // (its face: from the top just left of it, the nearest one at or below its own top)
    const left = stand.filter((q) => q !== r && q.x < r.x - 0.5 && q.x + q.width >= r.x - 0.5 && q.y >= r.y - 2 && q.y <= foot + 2);
    const from = left.length ? Math.min(...left.map((q) => q.y)) : foot;
    if (from - r.y > 60.5) out.push(`a rock at x ${Math.round(r.x)} has a ${Math.round(from - r.y)} px face`);
  }
  // (and on its right: from its tread up to the next top, within a jump's reach ahead of it, no more than 60)
  for (const r of rocks) {
    const ahead = stand.filter((q) => q !== r && q.x + q.width > r.x + r.width - 0.5 && q.x <= r.x + r.width + 120 && q.y < r.y - 2 && q.y > r.y - 200);
    if (!ahead.length) continue;
    const next = Math.max(...ahead.map((q) => q.y));
    if (r.y - next > 60.5) out.push(`a rock at x ${Math.round(r.x)} top ${Math.round(r.y)}: the next top ahead is ${Math.round(r.y - next)} px up`);
  }
  // (no two grown boxes share any space)
  for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
    const a = boxes[i], c = boxes[j];
    if (a.x < c.x + c.width - 0.5 && c.x < a.x + a.width - 0.5 && a.y < c.y + c.height - 0.5 && c.y < a.y + a.height - 0.5) out.push(`grown boxes at x ${Math.round(a.x)} and ${Math.round(c.x)} overlap`);
  }
  // (no rock sunk under a piece whose top stands above the rock's own top: it would hide its tread)
  for (const r of rocks) for (const q of platforms) {
    if ((q.type !== 'solid' && q.type !== 'bouncy') || q.broken) continue;
    if (!(q.x < r.x + r.width - 0.5 && q.x + q.width > r.x + 0.5)) continue;
    if (q.y < r.y - 2 && q.y + q.height > r.y + 2) out.push(`a rock at x ${Math.round(r.x)} top ${Math.round(r.y)} is sunk ${Math.round(r.y - q.y)} px under a piece at x ${Math.round(q.x)}`);
  }
  // (its foot never sunk in a ledge whose top runs on past it)
  const solid = platforms.filter((q) => (q.type === 'solid' || q.type === 'bouncy') && !q.broken && !(q as { catch?: boolean }).catch);
  const vis = (x: number) => { let t = Infinity; for (const q of solid) if (x > q.x && x < q.x + q.width && q.y < t) t = q.y; return t; };
  for (const r of rocks) {
    const foot = r.y + r.height;
    for (const [inX, outX] of [[r.x + 1, r.x - 1], [r.x + r.width - 1, r.x + r.width + 1]]) {
      const v = vis(inX);
      if (v > r.y + 2 && v < foot - 2 && Math.abs(vis(outX) - v) <= 2) out.push(`a rock at x ${Math.round(r.x)}: its foot is sunk ${Math.round(foot - v)} px into a ledge (top ${Math.round(v)}) that runs on past it`);
    }
  }
  return out;
}

/** the road boxes as the engine's step code reads them (engine.ts roadBoxes) */
function road(platforms: readonly Platform[]): Box[] {
  return platforms
    .filter((q) => (q.type === 'solid' || q.type === 'bouncy') && !q.broken && !q.push && !q.chase)
    .map((q) => ({ x: q.x, y: q.y, width: q.width, height: q.height, bouncy: q.type === 'bouncy', catch: !!(q as { catch?: boolean }).catch }));
}

/**
 * Why nothing grows at a piece (canGrow false), read from its walking surface: 'nothing needed' (every rise within a plain jump's
 * STEP_LEFT and every gap within a plain jump), 'a mushroom gives the rise', or 'no room' (a rise or gap a plain jump can't make, and
 * the stair builder found no room for a whole stair). `wideGap` names the widest gap a plain jump misses (a double gap the stage teaches).
 */
export function whyNothing(piece: Piece, platforms: readonly Platform[], margin: number): string {
  const boxes = road(platforms);
  const segs = skyline(piece, boxes);
  const mush = boxes.filter((m) => m.bouncy);
  const needs: string[] = [];
  for (let i = 0; i + 1 < segs.length; i++) {
    const a = segs[i], b = segs[i + 1];
    if (b.x1 < piece.x0 || a.x0 > piece.x1) continue;
    const gap = b.x0 - a.x1, rise = a.y - b.y;
    // (needed: a gap or a climb a plain single jump can't make, the same test as the ladder's own pieceMoveLaid)
    const plain = maxGap(rise, false, margin);
    if (gap > 1 ? gap <= plain : plain >= 0) continue;
    if (gap > 1 && rise <= STEP_LEFT) needs.push(`gap ${Math.round(gap)}`);
    else if (!a.bouncy) {
      const m = mush.some((q) => q.x + q.width > b.x0 - BOUNCE_NEAR && q.x < b.x0 && q.y + q.height >= a.y - 2 && q.y - b.y <= BOUNCE_ALONE);
      needs.push(m ? 'mushroom' : gap > 1 ? `gap ${Math.round(gap)} up ${Math.round(rise)}` : `rise ${Math.round(rise)}`);
    }
  }
  if (!needs.length) return 'nothing needed (plain jumps pass)';
  if (needs.every((n) => n === 'mushroom')) return 'a mushroom gives the rise';
  return `no room (${needs.filter((n) => n !== 'mushroom').join(', ')})`;
}

/** 1-1 on a seed and a setting, the piece's steps grown (or not), and a plain-jump run through it (held single jumps only) */
export function plainThrough(seed: number, k: string, setting: 'easy' | 'normal', grow: boolean): { ok: boolean; why: string; grown: number } {
  setDifficulty(setting);
  const r = withPlaySeed(seed, () => new RealPlay('1-1', 1));
  const e = r.e as unknown as Eng;
  // (the engine's own loseLife, not RealPlay's stub: a lost life fails the flight below, D37)
  delete (r.e as unknown as { loseLife?: unknown }).loseLife;
  try {
    return plainRun(r, e, k, grow);
  } finally {
    e.stop();
    setDifficulty('normal');
  }
}

/** the plain-jump run on a built 1-1 (hold right; standing, with a face or an edge just ahead, a held single jump; never a press in the air) */
export function plainRun(r: RealPlay, e: Eng, k: string, grow: boolean): { ok: boolean; why: string; grown: number } {
  const events: string[] = [];
  const was = recorder.event;
  recorder.event = function (this: typeof recorder, what: string, detail?: string | number) {
    events.push(what);
    return was.call(this, what, detail);
  } as typeof recorder.event;
  try {
    const piece = e.currentStage.meta.pieces.find((q) => q.k === k);
    if (!piece) return { ok: false, why: `no ${k}`, grown: 0 };
    if (grow) e.growSteps(piece);
    const stands = () => r.platforms.filter((q) => (q.type === 'solid' || q.type === 'bouncy') && !q.broken && !(q as { catch?: boolean }).catch);
    const sx = piece.x0 - 30;
    const at = stands().filter((q) => sx >= q.x && sx <= q.x + q.width).sort((a, b) => a.y - b.y)[0];
    if (!at) return { ok: false, why: 'no road before the piece', grown: e.helpState().grown.length };
    r.stand(sx, at.y);
    const solids = () => r.platforms.filter((q) => q.type === 'solid' && !q.broken);
    for (let i = 0; i < 4; i++) r.frame({});
    let hold = 0, airPress = false;
    for (let i = 0; i < 30 * 60; i++) {
      const p = r.p;
      let press = false;
      if (p.grounded && hold === 0) {
        const ahead = p.x + 34;
        const under = solids().some((q) => ahead >= q.x && ahead <= q.x + q.width && Math.abs(q.y - p.y) < 6);
        const face = solids().some((q) => q.x > p.x && q.x - p.x < 44 && q.y < p.y - 8 && q.y + q.height > p.y - 4);
        if (!under || face) {
          press = true;
          hold = 12;
        }
      } else if (!p.grounded && hold === 0 && r.input.state.jumpPressed) airPress = true;
      r.frame({ right: true, jump: hold > 0, press });
      if (hold > 0) hold--;
      if (r.p.isDoubleJumping && !airPress) return { ok: false, why: `a second jump at x ${Math.round(r.p.x)}`, grown: e.helpState().grown.length };
      if (events.includes('lostLife')) return { ok: false, why: `lost a life at x ${Math.round(r.p.x)}`, grown: e.helpState().grown.length };
      if (events.includes('softFall')) return { ok: false, why: `fell at x ${Math.round(r.p.x)}`, grown: e.helpState().grown.length };
      if (r.p.grounded && r.p.x >= piece.x1 + 20) return { ok: true, why: '', grown: e.helpState().grown.length };
    }
    return { ok: false, why: `stopped at x ${Math.round(r.p.x)} y ${Math.round(r.p.y)}`, grown: e.helpState().grown.length };
  } finally {
    recorder.event = was;
  }
}

export interface SeedSweep {
  rocks: number;
  planks: number;
  breaches: string[];
  /** pieces where something grows */
  grow: string[];
  /** pieces where nothing grows, with why */
  none: Array<{ k: string; why: string }>;
  /** grown count != what canGrow promised (Dot would promise a step that does not grow) */
  promise: string[];
  /** stairs the builder had no room for */
  leftOut: number;
}

/** one listed seed on one setting: every piece's boxes judged, canGrow read, and the grow kept honest */
export function sweepSeed(seed: number, setting: 'easy' | 'normal'): SeedSweep {
  setDifficulty(setting);
  takeStairsLeftOut();
  const r = withPlaySeed(seed, () => new RealPlay('1-1', 1));
  const e = r.e as unknown as Eng;
  const out: SeedSweep = { rocks: 0, planks: 0, breaches: [], grow: [], none: [], promise: [], leftOut: 0 };
  try {
    const margin = e.currentStage.gen2?.budget?.margin ?? (setting === 'easy' ? 0.65 : 0.82);
    for (const pc of e.currentStage.meta.pieces) {
      const boxes = e.stepBoxes(pc);
      out.rocks += boxes.filter((b) => !b.plank).length;
      out.planks += boxes.filter((b) => b.plank).length;
      for (const b of breaches(r.platforms, boxes)) out.breaches.push(`${pc.k}: ${b}`);
      // (the ladder's own answer: something grows and nothing in the piece is left a plain jump can't make)
      if (e.canGrowAt(pc)) out.grow.push(pc.k);
      else out.none.push({ k: pc.k, why: `${boxes.length ? 'a part only, ' : ''}${whyNothing(pc, r.platforms, margin)}` });
    }
    out.leftOut = takeStairsLeftOut();
  } finally {
    e.stop();
    setDifficulty('normal');
  }
  return out;
}

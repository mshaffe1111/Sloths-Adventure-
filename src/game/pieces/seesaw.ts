/**
 * The counterweight seesaw as a route piece (the lead's piece 4: kitStage.ts:12's seesaw, played in 1-6's rooms, protoStage.ts
 * seesawRoom): a bank too high to jump, a seesaw in a dip before it, and a hollow log on the floor. Push the log onto the seesaw's near end
 * and its weight holds that end down, so the far end stays up under him as a step to the bank (the second jump from its top). Walk onto
 * the far end without the log and his own weight tips it down to the floor. Laid on the route, with no puzzle room round it: no camera
 * frame, no reset post, no room tips (a stage's own Dot line teaches it, as any node's does), so the mixer can lay it as a node.
 *
 * Reused, not rewritten (cited): which way it tips and where each end stands are the kit's own rules (puzzleKit.ts seesawTilt,
 * seesawDy, seesawHalves; the weights KIT.pokeyWeight 3 and KIT.logWeight 5, the tip speed KIT.seesawSpeed); the sizes are 1-6's room
 * (protoStage.ts SEE: plank 260, rise 110, log 140 x 60, bank 270), proven there by the kit's tests, but on the floor itself, not in
 * 1-6's dip: there the pivot stood 50 px over the dip's floor on a code-drawn post (puzzlePlay.ts drawSeesaw), here its painted round
 * pivot sits on the ground; the log is the engine's push
 * log (types.ts Platform.push, engine.ts "walking into it pushes it along"); the painted planks are the kit's (puzzleArt.ts
 * seesawLevel / seesawUpL / seesawUpR), drawn by their round pivot as puzzlePlay.ts drawSeesaw draws them (SEESAW_PIVOT).
 */
import type { Platform } from '../types.ts';
import { KIT, seesawDy, seesawHalves, seesawTilt } from '../puzzleKit.ts';

export interface SeesawInfo {
  /** the pivot's x and where a lowered end stands (y) */
  pivotX: number;
  y: number;
  /** how high a raised end stands over a lowered one (px) */
  rise: number;
  /** which way it rests with nothing on it: -1 its left end down */
  rest: -1 | 0 | 1;
  /** this platform is its left (0) or right (1) half; `peer` is the other half's id */
  side: 0 | 1;
  peer: number;
  /** how it tips now, and its look easing toward it (drawn) */
  tilt: -1 | 0 | 1;
  show: number;
  /** how far this half moved this frame (the left half's step sets both) */
  dy: number;
}

/** 1-6's room sizes (protoStage.ts SEE), so the route piece plays as the room does */
export const SEESAW = { w: 260, rise: 110, logW: 140, logH: 60, bank: 270 } as const;

/**
 * The piece over the floor from x (the floor's top at `floorY`): `run` px of floor with the log on it, the seesaw standing on the floor, and the bank
 * too high to jump, `bankW` wide. Returns the platforms in order (the caller gives the ids; `peer` is set by `link`), and where the way
 * on is (the bank's top).
 */
export function seesawCrossing(o: { x: number; floorY: number; run?: number; bankW?: number }): { floor: Omit<Platform, 'id'>; log: Omit<Platform, 'id'>; ends: [Omit<Platform, 'id'>, Omit<Platform, 'id'>]; bank: Omit<Platform, 'id'> } {
  const run = o.run ?? 360;
  const G = o.floorY;
  const edge = o.x + run;
  const pivot = edge + SEESAW.w / 2;
  // (the floor runs on under the seesaw to the bank's face: the painted pivot stands on it)
  const floor: Omit<Platform, 'id'> = { x: o.x, y: G, width: run + SEESAW.w, height: 400, type: 'solid', style: 'moss_stone' };
  const logX = Math.round(o.x + run - SEESAW.logW - 90);
  const log: Omit<Platform, 'id'> = { x: logX, y: G - SEESAW.logH, width: SEESAW.logW, height: SEESAW.logH, type: 'solid', style: 'log', push: { min: o.x + 20, max: pivot - 10 } };
  const [l, r] = seesawHalves(pivot, SEESAW.w);
  const dys = seesawDy(-1, SEESAW.rise);
  const info = (side: 0 | 1): SeesawInfo => ({ pivotX: pivot, y: G, rise: SEESAW.rise, rest: -1, side, peer: -1, tilt: -1, show: -1, dy: 0 });
  const ends: [Omit<Platform, 'id'>, Omit<Platform, 'id'>] = [
    { x: l.x, y: G + dys[0], width: l.width, height: 20, type: 'moving', art: 'seesaw', seesaw: info(0), moveRange: 0 },
    { x: r.x, y: G + dys[1], width: r.width, height: 20, type: 'moving', art: 'seesaw', seesaw: info(1), moveRange: 0 },
  ];
  const bank: Omit<Platform, 'id'> = { x: edge + SEESAW.w, y: G - SEESAW.bank, width: o.bankW ?? 480, height: 400 + SEESAW.bank, type: 'solid', style: 'moss_stone' };
  return { floor, log, ends, bank };
}
/** the two halves told of each other once they have ids */
export function link(a: Platform, b: Platform) {
  a.seesaw!.peer = b.id;
  b.seesaw!.peer = a.id;
}

/** what the frame step needs to know: who stands where, and every platform (the push logs) */
export interface PieceEnv { standingOn: number; grounded: boolean; platforms: readonly Platform[]; dt: number }

const moved = { dx: 0, dy: 0 };
/**
 * The frame step for a seesaw half (as puzzlePlay.ts stepPieces does it for a room's seesaws): the weights on each end (Pokey standing on
 * it, a push log resting on it), which way it tips, each end easing to its height at the kit's speed, a push log on an end riding it. The
 * left half works out both; how far this half moved is returned, to carry him.
 */
export function stepSeesaw(p: Platform, env: PieceEnv): { dx: number; dy: number } {
  const s = p.seesaw!;
  moved.dx = 0;
  moved.dy = 0;
  const peer = env.platforms.find((q) => q.id === s.peer);
  if (!peer) return moved;
  const ends: [Platform, Platform] = s.side === 0 ? [p, peer] : [peer, p];
  if (s.side === 0) {
    const w = [0, 0];
    ends.forEach((e, k) => {
      if (env.grounded && env.standingOn === e.id) w[k] += KIT.pokeyWeight;
      for (const lg of env.platforms) {
        if (!lg.push || lg.broken) continue;
        const cx = lg.x + lg.width / 2;
        if (cx >= e.x && cx <= e.x + e.width && Math.abs(lg.y + lg.height - e.y) <= 8) w[k] += KIT.logWeight;
      }
    });
    const tilt = seesawTilt(w[0], w[1], s.rest);
    const dys = seesawDy(tilt, s.rise);
    ends.forEach((e, k) => {
      const es = e.seesaw!;
      es.tilt = tilt;
      const want = es.y + dys[k];
      const step = KIT.seesawSpeed * env.dt;
      const ny = Math.abs(want - e.y) <= step ? want : e.y + Math.sign(want - e.y) * step;
      const dy = ny - e.y;
      for (const lg of env.platforms) {
        if (!dy || !lg.push || lg.broken) continue;
        const cx = lg.x + lg.width / 2;
        if (cx >= e.x && cx <= e.x + e.width && Math.abs(lg.y + lg.height - e.y) <= 8) lg.y += dy;
      }
      es.dy = dy;
      e.y = ny;
      es.show += (tilt - es.show) * Math.min(1, env.dt * 10);
    });
  }
  moved.dy = s.dy;
  return moved;
}

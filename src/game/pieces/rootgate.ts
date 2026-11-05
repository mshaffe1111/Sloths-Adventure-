/**
 * The root gate (the lead's piece 5: kitStage.ts:6-7's vine gate opened by a plate, with World 1's root art): the way on runs through a
 * doorway at the foot of a root wall that comes down out of the canopy (too tall to jump: it runs up out of the screen), its door grown
 * shut with woven roots. A knot block before it opens it: hop up and stand on it and the roots draw back, and the door stays
 * open (latched: it never shuts in his face). Its first time is taught by the stage's own Dot line ("Dot explains any locked exit",
 * CLAUDE.md), as any node's is.
 *
 * Reused (cited): the root wall is the kit's own painted wall (protoArt.ts drawWallArt, the wall over every World 1 kit gate,
 * puzzlePlay.ts drawGate), the door the root gate painted for World 1 and never drawn (w1-new root-gate-shut / root-gate-open,
 * IN-GAME-UNUSED.md), the switch World 1's painted knot block (w1-new knot-a, never drawn either); the door's height and the plate's width
 * is the kit's (puzzleKit.ts KIT.doorH 118); a latched gate is the kit's `latch` (puzzleKit.ts gate spec). The door is a
 * solid platform (the engine's walls are solid and 50 px or taller: engine.ts "Solid ground blocks") that stands in his way while shut
 * and is `broken` (passed through) once open, as the engine passes any broken platform; only the plate is stepped (a 'moving' piece).
 */
import type { Platform } from '../types.ts';
import { KIT } from '../puzzleKit.ts';

export interface GateInfo {
  /** which part this platform is: the knot block (its painted switch), the plate on its top he steps on, the door that opens, or the
   *  wall over the door */
  role: 'plate' | 'knot' | 'door' | 'wall';
  /** the gate's own number: the plate opens the door of the same number */
  gate: number;
  /** pressed (a plate) or open (a door), and the game time it happened (for the opening's moment) */
  on: boolean;
  at: number;
}

/** the sizes (the kit's door and plate; the wall reaches this far over the door: out of every phone's view and any jump) */
export const GATE = { doorW: 80, doorH: KIT.doorH, wallUp: 900, knotH: 70, knotW: 80, opening: 0.6, gap: 90 } as const;

/**
 * A root gate on the floor at `floorY`, its doorway at `x` (the door's left), its switch `gap` px before the door: World 1's painted knot
 * block (w1-new knot-a, never drawn: a block of knotted wood with a flat mossy top), a hop up (70 px; a plain jump is 108), and close
 * enough that the switch and the gate are on one upright screen together (STAGE-RULES §3: a switch and its gate read as one thing). The
 * platforms in order: the knot block (solid: a wall to walk into), the plate on its top (what he stands on; a 'moving' piece, so it is
 * the floor picked over the block, lift.ts pickFloor), the wall, the door (the caller gives ids; all share `gate`).
 */
export function rootGate(o: { x: number; floorY: number; gate: number; gap?: number }): Array<Omit<Platform, 'id'>> {
  const G = o.floorY;
  const kx = Math.round(o.x - (o.gap ?? GATE.gap) - GATE.knotW);
  const info = (role: GateInfo['role']): GateInfo => ({ role, gate: o.gate, on: false, at: -9 });
  return [
    { x: kx, y: G - GATE.knotH, width: GATE.knotW, height: GATE.knotH, type: 'solid', art: 'rootgate', rootgate: info('knot') },
    { x: kx, y: G - GATE.knotH, width: GATE.knotW, height: 8, type: 'moving', art: 'rootgate', rootgate: info('plate'), moveRange: 0 },
    { x: o.x, y: G - GATE.doorH - GATE.wallUp, width: GATE.doorW, height: GATE.wallUp, type: 'solid', art: 'rootgate', rootgate: info('wall') },
    { x: o.x, y: G - GATE.doorH, width: GATE.doorW, height: GATE.doorH, type: 'solid', art: 'rootgate', rootgate: info('door') },
  ];
}

export interface GateEnv { standingOn: number; grounded: boolean; platforms: readonly Platform[] }
const still = { dx: 0, dy: 0 };
const opened = { dx: 0, dy: 0, opened: true };
/** the frame step: a plate he stands on is pressed (and stays pressed), and opens its door; an open door is passed through. Returns
 *  'opened' the frame a door opens (the engine plays its sound) */
export function stepGate(p: Platform, t: number, env: GateEnv): { dx: number; dy: number; opened?: boolean } {
  const g = p.rootgate!;
  if (g.role === 'plate' && !g.on && env.grounded && env.standingOn === p.id) {
    g.on = true;
    g.at = t;
    for (const q of env.platforms) {
      const d = q.rootgate;
      if (d && d.gate === g.gate && !d.on && (d.role === 'door' || d.role === 'knot')) {
        d.on = true;
        d.at = t;
        if (d.role === 'door') q.broken = true;
      }
    }
    return opened;
  }
  return still;
}

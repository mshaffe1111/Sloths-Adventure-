/**
 * w7SlideScene — where the set pieces and the lights stand along 7-4's flume (w7Slide.ts), and how bright any point is (pure: the
 * drawing uses it, and the tests prove every obstacle is lit before it comes).
 *
 * The flume is three troughs side by side (Matt's Sheet 1 is one trough: one a lane), on trestles over the dark, through a cave under
 * the temple: cave ribs (Sheet 4's two walls and ceiling layer) every few metres, a cave mouth where the cave changes, and Matt's props
 * (Sheets 2 and 3) along the sides at every depth.
 *
 * The lighting rule (the lead's brief, Matt 2026-10-29: "If he's underground, it's not going to be bright"): there is no daylight under
 * the temple. The ambient light is very low and cool (#142430); only torches and lanterns (warm, a slow flicker), glowing fungus and
 * glowworms (green and purple) and, at the very end, the way out (cool daylight) give light. Depth goes into darkness, never haze.
 * Fairness first: every obstacle comes with its own light, so it reads well ahead even in the darkest stretch.
 *
 * The colour script, by the course's sections: the drop, the statues and the barriers are the torch-lit flume; the gaps and the beams
 * are the fungus cavern; the crates and the climax are the narrow dark (the fewest lights, eyes in the rock); then the way out.
 */
import { SLIDE, type SlideCourse } from './w7Slide.ts';

export type LightKind = 'torch' | 'lantern' | 'fungusG' | 'fungusP' | 'day';
export interface Light {
  x: number;
  y: number;
  z: number;
  /** how far it reaches (m) and how strong it is at its middle (1 = full light) */
  r: number;
  i: number;
  kind: LightKind;
}
/** a piece of Matt's sheets (src/game/w7SlideAtlas.ts names), or 'rib' (the two cave walls and the ceiling layer) */
export interface Prop {
  kind: string;
  x: number;
  /** its foot (or its top, for a piece that hangs: HANGS) */
  y: number;
  z: number;
  /** its height (m); the width follows the picture */
  h: number;
  flip?: boolean;
}
export type Beat = 'torch' | 'fungus' | 'dark' | 'end';
export interface Scene {
  lights: Light[];
  props: Prop[];
  beats: Array<{ z0: number; z1: number; beat: Beat }>;
}

/** the pieces that hang from above (their y is their top) */
export const HANGS = new Set(['lantern', 'lanternL', 'lanternR', 'glowworms', 'rootsHang', 'stalactites', 'thornDown', 'rope']);
/** the pieces that give light (drawn bright again on top of the dark) */
export const GLOWS = new Set(['torchPost', 'torchPost2', 'torchWall', 'torchWall2', 'lantern', 'lanternL', 'lanternR', 'lanternBeam', 'fungusG', 'fungusP', 'fungusRock', 'fungusRubble', 'glowworms']);

/** the ambient light (r, g, b, 0..1): #142430, the cave's own dark */
export const AMBIENT: readonly [number, number, number] = [0x14 / 255, 0x24 / 255, 0x30 / 255];
export const LIGHT_RGB: Record<LightKind, readonly [number, number, number]> = {
  torch: [1, 0.66, 0.32],
  lantern: [1, 0.78, 0.45],
  fungusG: [0.45, 1, 0.55],
  fungusP: [0.75, 0.45, 1],
  day: [0.85, 0.93, 1],
};
/** the flume's outer rails stand at ±RAIL_X, this tall; the cave's rock is out at ±CAVE_X, its roof at CAVE_ROOF */
export const RAIL_X = SLIDE.halfW;
export const RAIL_H = 0.3;
export const CAVE_X = 4.4;
export const CAVE_ROOF = 4.2;

const hash = (n: number) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

const BEAT_OF: Record<string, Beat> = { drop: 'torch', statues: 'torch', rubble: 'torch', gaps: 'fungus', doorways: 'fungus', columns: 'dark', climax: 'dark', light: 'end' };

export function buildScene(c: SlideCourse): Scene {
  const lights: Light[] = [];
  const props: Prop[] = [];
  const beats: Scene['beats'] = c.sections.map((s, i) => ({
    z0: i === 0 ? -20 : s.z0,
    z1: i + 1 < c.sections.length ? c.sections[i + 1].z0 : c.length + 40,
    beat: BEAT_OF[s.name] ?? 'torch',
  }));
  const beatAt = (z: number): Beat => beats.find((b) => z >= b.z0 && z < b.z1)?.beat ?? 'dark';
  const add = (kind: string, x: number, y: number, z: number, h: number, flip = false) => props.push({ kind, x, y, z, h, ...(flip ? { flip } : {}) });
  /** a torch on a post beside the flume (its flame lights round it) */
  const torch = (z: number, side: number, i = 0.95) => {
    const x = side * (RAIL_X + 0.4);
    add(hash(z) < 0.5 ? 'torchPost' : 'torchPost2', x, -0.2, z, 2.0);
    lights.push({ x, y: 1.65, z, r: 3.4, i, kind: 'torch' });
  };
  const torchWall = (z: number, side: number, i = 0.8) => {
    const x = side * (CAVE_X - 0.25);
    add(hash(z + 1) < 0.5 ? 'torchWall' : 'torchWall2', x, 1.6, z, 0.9, side > 0);
    lights.push({ x: x - side * 0.2, y: 2.3, z, r: 3.6, i, kind: 'torch' });
  };
  const fungus = (z: number, x: number, y: number, green: boolean, i = 0.6) => {
    const k = green ? (hash(z + 2) < 0.5 ? 'fungusG' : 'fungusRock') : hash(z + 3) < 0.5 ? 'fungusP' : 'fungusRubble';
    add(k, x, y, z, k === 'fungusG' ? 0.9 : k === 'fungusP' ? 0.55 : 0.75, hash(z + 4) < 0.5);
    lights.push({ x, y: y + 0.4, z, r: 2.4, i, kind: green ? 'fungusG' : 'fungusP' });
  };
  const lantern = (z: number, x: number, top: number, i = 0.85) => {
    add(['lantern', 'lanternL', 'lanternR'][Math.floor(hash(z + 5) * 3)], x, top, z, 0.85);
    lights.push({ x, y: top - 0.6, z, r: 3.0, i, kind: 'lantern' });
  };
  const sideX = (z: number, k: number, near = 0.6, far = 1.6) => (hash(z + k) < 0.5 ? -1 : 1) * (RAIL_X + near + hash(z + k + 0.5) * (far - near));

  // signs at the top of the drop: the warnings Matt asked for (a skull, TURN BACK)
  add('signSkull', -(RAIL_X + 0.7), -0.3, 14, 1.4);
  add('signTurnBack', RAIL_X + 0.7, -0.3, 22, 1.4);
  lights.push({ x: -(RAIL_X + 0.7), y: 1.5, z: 13.5, r: 2.4, i: 0.6, kind: 'torch' });
  lights.push({ x: RAIL_X + 0.7, y: 1.5, z: 21.5, r: 2.4, i: 0.6, kind: 'torch' });
  // the set dressing, metre by metre, at irregular spacing (each kind has a chance a metre, from the roll, never a fixed beat: the lead's
  // review, 2026-10-29: evenly spaced pieces read as a tile)
  const chance = (z: number, salt: number, every: number) => hash(z * 1.37 + salt * 7.1) < 1 / every;
  let nextRib = 5;
  for (let k = 4; k < c.length; k += 1) {
    const z = k + (hash(k * 0.73) - 0.5) * 0.8;
    const b = beatAt(z);
    // the cave's ribs (Sheet 4's walls and ceiling), 6-13 m apart, and now and then one wall on its own between them
    if (k >= nextRib) {
      add('rib', (hash(k + 0.2) - 0.5) * 0.6, 0, z, CAVE_ROOF * (0.9 + hash(k + 0.4) * 0.25), hash(k + 0.6) < 0.5);
      nextRib = k + 6 + Math.floor(hash(k + 0.8) * 8);
    } else if (chance(z, 1, 9)) add(hash(z + 0.3) < 0.5 ? 'wallL' : 'wallR', 0, 0, z, CAVE_ROOF * (0.85 + hash(z + 0.5) * 0.35));
    // the flume's own lights by beat
    if (b === 'torch' && chance(z, 2, 6)) torch(z, hash(z + 2.5) < 0.5 ? 1 : -1);
    if (b === 'torch' && chance(z, 3, 10)) torchWall(z, hash(z + 6) < 0.5 ? -1 : 1);
    if (b === 'fungus' && chance(z, 4, 3.5)) fungus(z, sideX(z, 7), -0.3 + hash(z + 8) * 0.4, hash(z + 9) < 0.5);
    if (b === 'fungus' && chance(z, 5, 8)) {
      add('glowworms', (hash(z + 10) - 0.5) * 2 * (CAVE_X - 1), CAVE_ROOF - 0.2, z, 0.4);
      lights.push({ x: 0, y: CAVE_ROOF - 0.8, z, r: 3.2, i: 0.35, kind: 'fungusG' });
    }
    if (b === 'fungus' && chance(z, 6, 18)) torchWall(z, hash(z + 11) < 0.5 ? -1 : 1, 0.7);
    if (b === 'dark' && chance(z, 7, 22)) torch(z, hash(z + 12) < 0.5 ? -1 : 1, 0.75);
    if (b === 'dark' && chance(z, 8, 4.5)) add(['eyesHole', 'eyesRoots', 'eyesThorns'][Math.floor(hash(z + 13) * 3)], (hash(z + 14) < 0.5 ? -1 : 1) * (CAVE_X - 0.6), 0.3 + hash(z + 15) * 1.8, z, 0.7 + hash(z + 15.5) * 0.4, hash(z + 15.7) < 0.5);
    if (b === 'dark' && chance(z, 9, 6)) add(hash(z + 16) < 0.5 ? 'thornUp' : 'thornDown', sideX(z, 17, 0.6, 1.4), hash(z + 16) < 0.5 ? -0.4 : CAVE_ROOF - 0.3, z, 0.9 + hash(z + 16.5) * 0.6, hash(z + 16.7) < 0.5);
    // hanging from the roof: roots, stalactites, now and then a lantern on its rope
    if (chance(z, 10, 4.5)) add(hash(z + 18) < 0.5 ? 'rootsHang' : 'stalactites', (hash(z + 19) - 0.5) * 2 * (CAVE_X - 0.8), CAVE_ROOF + 0.1, z, 0.9 + hash(z + 19.5) * 0.9, hash(z + 20) < 0.5);
    if (b !== 'dark' && chance(z, 11, 12)) lantern(z, sideX(z, 21, 0.2, 0.9), 3.0, 0.7);
    // the cave floor beside the flume: stalagmites, boulders, webs at the walls, scaffolds and the rope bridge overhead, signs
    if (chance(z, 12, 5)) add(['stalagmites', 'boulder', 'stalagmites'][Math.floor(hash(z + 22) * 3)], sideX(z, 23, 1.0, 2.2), -0.6, z, 0.7 + hash(z + 22.5) * 0.7, hash(z + 24) < 0.5);
    if (chance(z, 13, 9)) add(hash(z + 25) < 0.5 ? 'webCorner' : 'webRoots', (hash(z + 26) < 0.5 ? -1 : 1) * (CAVE_X - 0.7), 1.2 + hash(z + 27), z, 1.0 + hash(z + 27.5) * 0.6, hash(z + 26) >= 0.5);
    if (b !== 'dark' && chance(z, 14, 22)) {
      const side = hash(z + 28) < 0.5 ? -1 : 1;
      add(hash(z + 29) < 0.5 ? 'scaffoldTall' : 'scaffoldShort', side * (RAIL_X + 1.9), -0.8, z, hash(z + 29) < 0.5 ? 3.4 : 2.2, side > 0);
      add('rope', side * (RAIL_X + 1.2), CAVE_ROOF, z + 1.5, 2.4);
    }
    if (chance(z, 15, 35)) add('ropeBridge', 0, 3.1, z, 1.2);
    if (b === 'torch' && chance(z, 16, 25)) add(hash(z + 30) < 0.5 ? 'signArrow' : 'signBroken', sideX(z, 31, 0.5, 0.9), -0.3, z, hash(z + 30) < 0.5 ? 0.9 : 1.2, hash(z + 31) < 0.5);
  }
  // a cave mouth where the cave opens into the fungus cavern and closes into the narrow dark
  for (const b of beats) if (b.beat === 'fungus' || b.beat === 'dark') add('mouth', 0, 0, b.z0 + 2, CAVE_ROOF);
  // and the last one, round the way out
  add('mouth', 0, 0, c.length + 2.5, CAVE_ROOF);
  // every obstacle brings its own light (rule 3: no obstacle in the dark): the light beside it, and a warm rim on its face in every lane it
  // fills (the flame beside it caught on its front edge), so even in the narrow dark it reads from far off
  c.obstacles.forEach((o, n) => {
    const side = n % 2 ? 1 : -1;
    const top = o.kind === 'beam' ? 1.0 : o.kind === 'gap' ? 0.2 : 0.8;
    for (const l of o.kind === 'head' || o.kind === 'column' ? o.lanes : [0, 1, 2]) lights.push({ x: (l - 1) * SLIDE.lane, y: top, z: o.z - 0.9, r: 1.9, i: 0.6, kind: 'lantern' });
    if (o.kind === 'rubble') {
      torch(o.z - 0.6, -1, 0.95);
      torch(o.z - 0.6, 1, 0.95);
    } else if (o.kind === 'beam') lantern(o.z - 0.5, 0, 2.4, 1);
    else if (o.kind === 'gap') {
      // fungus deep in the gap lights it from below; a torch shows its far lip
      lights.push({ x: 0, y: -1.4, z: o.z + o.len / 2, r: 3.0, i: 0.9, kind: n % 3 ? 'fungusG' : 'fungusP' });
      torch(o.z + o.len + 0.3, side, 0.9);
    } else {
      for (const l of o.lanes) lights.push({ x: (l - 1) * SLIDE.lane, y: 0.4, z: o.z - 0.3, r: 1.8, i: 0.5, kind: n % 2 ? 'fungusG' : 'fungusP' });
      torch(o.z - 0.8, side, 0.85);
    }
  });
  // the way out: cool daylight from the end
  lights.push({ x: 0, y: 1.6, z: c.length + 2, r: 24, i: 1.2, kind: 'day' });
  lights.sort((a, b) => a.z - b.z);
  props.sort((a, b) => a.z - b.z);
  return { lights, props, beats };
}

/** how much a light gives at a distance d (0..i): a big soft falloff */
export const falloff = (l: Light, d: number) => (d >= l.r ? 0 : l.i * (1 - d / l.r) ** 2);

/** how bright the point (x, y, z) is, as a luminance 0..1+ (the ambient plus every light near it; no flicker) */
export function lightAt(s: Scene, x: number, y: number, z: number): number {
  let v = 0.2126 * AMBIENT[0] + 0.7152 * AMBIENT[1] + 0.0722 * AMBIENT[2];
  for (const l of s.lights) {
    if (Math.abs(l.z - z) > l.r) continue;
    const f = falloff(l, Math.hypot(l.x - x, l.y - y, l.z - z));
    if (f > 0) v += f * (0.2126 * LIGHT_RGB[l.kind][0] + 0.7152 * LIGHT_RGB[l.kind][1] + 0.0722 * LIGHT_RGB[l.kind][2]);
  }
  return v;
}

/** Pokey is never darker than this share of full light (the brief: he never vanishes) */
export const POKEY_MIN = 0.6;

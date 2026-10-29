/**
 * w7SlideScene — where the lights and the set pieces stand along 7-4's flume (w7Slide.ts), and how bright any point is (pure: the
 * drawing uses it, and the tests prove every obstacle is lit before it comes).
 *
 * The lighting rule (the lead's brief, Matt 2026-10-29: "If he's underground, it's not going to be bright"): there is no daylight under
 * the temple. The ambient light is very low and cool (#142430); only torches and lanterns (warm, a slow flicker), glowing fungus (small
 * green and purple pools) and, at the very end, the way out (cool daylight) give light. Depth goes into darkness, never into haze.
 * Fairness first: every obstacle comes with its own light (a torch on a post by a rubble wall, a lantern over a low doorway, fungus
 * deep in a gap and on a statue), so it reads well ahead even in the darkest stretch.
 *
 * The colour script, by the course's sections: the drop, the statues and the rubble walls are the torch-lit flume; the gaps and the
 * doorways are the fungus cavern (green and purple, eerier); the columns and the climax are the narrow dark (the fewest lights, eyes in
 * the rock); then the way out.
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
export type PropKind = 'post' | 'lantern' | 'fungusG' | 'fungusP' | 'eyes' | 'gantry' | 'roots' | 'statue';
export interface Prop {
  x: number;
  y: number;
  z: number;
  kind: PropKind;
}
export type Beat = 'torch' | 'fungus' | 'dark' | 'end';
export interface Scene {
  lights: Light[];
  props: Prop[];
  beats: Array<{ z0: number; z1: number; beat: Beat }>;
}

/** the ambient light (r, g, b, 0..1): #142430, the cave's own dark */
export const AMBIENT: readonly [number, number, number] = [0x14 / 255, 0x24 / 255, 0x30 / 255];
/** each kind's colour (0..1) */
export const LIGHT_RGB: Record<LightKind, readonly [number, number, number]> = {
  torch: [1, 0.66, 0.32],
  lantern: [1, 0.78, 0.45],
  fungusG: [0.45, 1, 0.55],
  fungusP: [0.75, 0.45, 1],
  day: [0.85, 0.93, 1],
};
/** the flume's rails stand at ±RAIL_X, this tall; the cave's rock is out at ±CAVE_X, its roof at CAVE_ROOF */
export const RAIL_X = SLIDE.halfW + 0.05;
export const RAIL_H = 0.4;
export const CAVE_X = 4.4;
export const CAVE_ROOF = 4.2;

const hash = (n: number) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

/** which beat of the colour script a section is */
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
  const torch = (z: number, side: number, i = 0.95) => {
    const x = side * (RAIL_X + 0.45);
    props.push({ x, y: 0, z, kind: 'post' });
    lights.push({ x, y: 1.7, z, r: 3.4, i, kind: 'torch' });
  };
  const fungus = (z: number, x: number, y: number, green: boolean, i = 0.55) => {
    props.push({ x, y, z, kind: green ? 'fungusG' : 'fungusP' });
    lights.push({ x, y: y + 0.3, z, r: 2.4, i, kind: green ? 'fungusG' : 'fungusP' });
  };
  const lantern = (z: number, x: number, y: number, i = 0.85) => {
    props.push({ x, y, z, kind: 'lantern' });
    lights.push({ x, y, z, r: 3.0, i, kind: 'lantern' });
  };
  // the light the beats give on their own, along the flume
  for (let z = 4; z < c.length; z += 1) {
    const b = beatAt(z);
    const k = Math.round(z);
    if (b === 'torch' && k % 7 === 0) torch(z, (k / 7) % 2 ? 1 : -1);
    if (b === 'fungus' && k % 5 === 0) fungus(z, (hash(z) < 0.5 ? -1 : 1) * (RAIL_X + 0.6 + hash(z + 1) * 1.2), -0.2 + hash(z + 2) * 0.6, hash(z + 3) < 0.5);
    if (b === 'fungus' && k % 20 === 10) torch(z, hash(z + 5) < 0.5 ? -1 : 1, 0.8);
    if (b === 'dark' && k % 24 === 12) torch(z, hash(z + 6) < 0.5 ? -1 : 1, 0.75);
    if (b === 'dark' && k % 6 === 3) props.push({ x: (hash(z + 7) < 0.5 ? -1 : 1) * (CAVE_X - 0.3), y: 0.6 + hash(z + 8) * 2.2, z, kind: 'eyes' });
    if (k % 12 === 6) {
      // a timber gantry over the flume; now and then a lantern hangs from it
      props.push({ x: 0, y: 0, z, kind: 'gantry' });
      if (b !== 'dark' && hash(z + 9) < 0.6) lantern(z, (hash(z + 10) - 0.5) * 1.6, 2.5, 0.7);
    }
    if (k % 9 === 4) props.push({ x: (hash(z + 11) < 0.5 ? -1 : 1) * (CAVE_X - 0.8), y: CAVE_ROOF, z, kind: 'roots' });
    if (b !== 'dark' && k % 17 === 8) props.push({ x: (hash(z + 12) < 0.5 ? -1 : 1) * (RAIL_X + 1.3), y: -0.3, z, kind: 'statue' });
  }
  // every obstacle brings its own light (rule 3: no obstacle in the dark): the light beside it, and a warm rim on its face in every lane it
  // fills (the light of the flame beside it caught on its front edge), so even in the narrow dark it reads from far off
  c.obstacles.forEach((o, n) => {
    const side = n % 2 ? 1 : -1;
    const top = o.kind === 'beam' ? SLIDE.roof * 0.35 : o.kind === 'gap' ? 0.2 : 0.8;
    for (const l of o.kind === 'head' || o.kind === 'column' ? o.lanes : [0, 1, 2]) lights.push({ x: (l - 1) * SLIDE.lane, y: top, z: o.z - 0.9, r: 1.9, i: 0.6, kind: 'lantern' });
    if (o.kind === 'rubble') {
      torch(o.z - 0.6, -1, 0.95);
      torch(o.z - 0.6, 1, 0.95);
    }
    else if (o.kind === 'beam') lantern(o.z - 0.5, 0, SLIDE.roof - 0.9, 1);
    else if (o.kind === 'gap') {
      // fungus deep in the gap lights it from below; a torch shows its far lip
      lights.push({ x: 0, y: -1.4, z: o.z + o.len / 2, r: 3.0, i: 0.9, kind: n % 3 ? 'fungusG' : 'fungusP' });
      torch(o.z + o.len + 0.3, side, 0.9);
    } else {
      // a statue, a root curtain, a fallen column: fungus at its foot and a torch beside
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
    const d = Math.hypot(l.x - x, l.y - y, l.z - z);
    const f = falloff(l, d);
    if (f > 0) v += f * (0.2126 * LIGHT_RGB[l.kind][0] + 0.7152 * LIGHT_RGB[l.kind][1] + 0.0722 * LIGHT_RGB[l.kind][2]);
  }
  return v;
}

/** Pokey is never darker than this share of full light (the brief: he never vanishes) */
export const POKEY_MIN = 0.6;

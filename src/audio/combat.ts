/**
 * Small pure helpers that decide *which* battle sound plays: what a punch landed on, which enemy fell, how long the
 * combo is. The engine says what happened, these turn it into the numbers the sound effects understand.
 */

/** what a hit landed on; each one has its own sound */
export const MATERIALS = ['generic', 'fur', 'scale', 'chitin', 'feather', 'armor'] as const;
export type Material = (typeof MATERIALS)[number];

/** the order enemy types are numbered in when they are passed to sound effects */
export const ENEMY_ORDER = ['snake', 'eagle', 'ocelot', 'jaguar', 'boa', 'caiman', 'tayra', 'frog', 'spider', 'ant_hazard', 'boss', 'harpy'] as const;

export function enemyIndex(type: string): number {
  return ENEMY_ORDER.indexOf(type as (typeof ENEMY_ORDER)[number]);
}

/** what an enemy's body is made of, for the hit sound */
export function materialFor(type: string): Material {
  switch (type) {
    case 'snake':
    case 'boa':
    case 'caiman':
      return 'scale';
    case 'eagle':
    case 'harpy':
      return 'feather';
    case 'ocelot':
    case 'jaguar':
    case 'tayra':
      return 'fur';
    case 'spider':
    case 'ant_hazard':
      return 'chitin';
    default:
      return 'generic';
  }
}

/** bosses in the stone and iron worlds ring like metal and rock when hit */
export function bossMaterial(world: number): Material {
  return world === 7 || world === 10 ? 'armor' : 'generic';
}

/** pack "heavy?" and the material into the one number a sound effect receives */
export function hitArg(heavy: boolean, material: Material = 'generic'): number {
  return (heavy ? 1 : 0) + 2 * Math.max(0, MATERIALS.indexOf(material));
}

export function unpackHit(arg: number): { heavy: boolean; material: Material } {
  const a = Math.max(0, Math.floor(arg));
  return { heavy: (a & 1) === 1, material: MATERIALS[Math.min(MATERIALS.length - 1, a >> 1)] };
}

/** boss roar pitch by world: the low ones are big and slow, the high ones are sharp and fast */
const ROAR_PITCH = [1, 1, 1.25, 0.8, 1.1, 1.3, 0.7, 0.6, 0.9, 0.75, 0.65];
export function roarPitch(world: number): number {
  return ROAR_PITCH[Math.max(0, Math.min(10, Math.floor(world)))] ?? 1;
}

/** a streak of hits that each land within this long of the last keeps the combo going */
export const COMBO_WINDOW = 1.1;

/** how many sparkle stages a combo of n hits has earned: 0 (none), 1 (at 3), 2 (at 5), 3 (at 8) */
export function streakStage(n: number): 0 | 1 | 2 | 3 {
  return n >= 8 ? 3 : n >= 5 ? 2 : n >= 3 ? 1 : 0;
}

/** pick 0..count-1 that is not `last` (so the same version never plays twice in a row); `r` is a random number 0..1 */
export function nextVariant(last: number, count: number, r: number): number {
  if (count <= 1) return 0;
  if (last < 0 || last >= count) return Math.min(count - 1, Math.floor(r * count));
  const n = Math.min(count - 2, Math.floor(r * (count - 1)));
  return n >= last ? n + 1 : n;
}

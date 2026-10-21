/**
 * platformPalette — the materials every platform is painted from, per world.
 *
 * One rule runs through it: Pokey is brown (fur #a66b43), so nothing he stands on may be the same brown. Wood bodies are
 * darker (or bleached paler) than the fur, and the lit lip along the top of every standable surface (the top few pixels,
 * where his feet are) is pushed until it sits at least LIP_MIN away from the fur in CIEDE2000.
 */
import { tone, mixToHex, lighten, type Tone } from './artKit.ts';
import { deltaE00, FUR } from './colorMetrics.ts';
import type { Look } from './scenery.ts';

/** the least CIEDE2000 distance a standable top lip may have from Pokey's fur */
export const LIP_MIN = 18;

export interface Palette {
  outline: string;
  /** timber: the body is darker than the fur (or bleached paler), so a brown hero never melts into it */
  bark: Tone;
  /** the cut face of wood, rings and plank faces */
  heart: Tone;
  moss: Tone;
  stone: Tone;
  /** the leaf green that fringes limbs, ledges and bridges */
  leaf: Tone;
  vine: Tone;
  /** the lit lip along the top, per material; every one is >= LIP_MIN from the fur */
  lip: { wood: string; moss: string; stone: string; ruin: string };
  /** glow colour in the dark worlds, else the world's first flower colour */
  accent: string;
  glow: string | null;
  flora: string[];
  kind: Look['ground']['kind'];
}

/** [bark mid, cut-wood heart] for each world: dark chestnut, bleached driftwood, slate, plum, peat-black, ... all away from the fur */
const WOOD: Record<number, [string, string]> = {
  1: ['#5c3a26', '#dcc08c'],
  2: ['#a39880', '#ead9b0'],
  3: ['#2f3f48', '#8fb8b0'],
  4: ['#4a5a58', '#c4d4cc'],
  5: ['#5a2c48', '#e8c4d4'],
  6: ['#2e271c', '#b8a880'],
  7: ['#b9a47e', '#f0e2bc'],
  8: ['#5e5a54', '#d8d0c0'],
  9: ['#241a18', '#e0a068'],
  10: ['#3a3646', '#c4b8d0'],
};

/** push a colour away from the fur (lighter first, then darker) until it is at least `min` away */
export function awayFromFur(color: string, min = LIP_MIN): string {
  if (deltaE00(color, FUR) >= min) return color;
  for (let t = 0.06; t <= 0.9; t += 0.06) {
    const c = mixToHex(color, '#ffffff', t);
    if (deltaE00(c, FUR) >= min) return c;
  }
  for (let t = 0.06; t <= 0.9; t += 0.06) {
    const c = mixToHex(color, '#000000', t);
    if (deltaE00(c, FUR) >= min) return c;
  }
  return color;
}

/** the least distance any step of a wood ramp keeps from the fur (the lips are held to the stricter LIP_MIN) */
export const BARK_MIN = 15;

/** slide `color` toward `anchor` (a step of the same ramp that is already clear of the fur) until it is >= min from the fur */
function clearOfFur(color: string, anchor: string, min = BARK_MIN): string {
  if (deltaE00(color, FUR) >= min) return color;
  for (let t = 0.1; t <= 1; t += 0.1) {
    const c = mixToHex(color, anchor, t);
    if (deltaE00(c, FUR) >= min) return c;
  }
  return anchor;
}

/** a wood ramp none of whose steps sits within BARK_MIN of the fur: highlights ease toward the body, shadows toward the deep tone */
function woodRamp(base: string, shadow: string): Tone {
  const t = tone(base, shadow);
  const mid = awayFromFur(t.mid, BARK_MIN);
  const light = clearOfFur(t.light, mid);
  return {
    hi: clearOfFur(t.hi, light),
    light,
    mid,
    dark: clearOfFur(t.dark, t.deep),
    deep: clearOfFur(t.deep, '#000000'),
  };
}

const cache = new WeakMap<Look, Palette>();

export function paletteFor(look: Look, world: number): Palette {
  const hit = cache.get(look);
  if (hit) return hit;
  const g = look.ground;
  const [barkMid, heartMid] = WOOD[world] ?? WOOD[1];
  const mood = look.grade[1] * 0.5;
  const tint = (c: string) => mixToHex(c, look.grade[0], mood);
  const bark = woodRamp(tint(barkMid), '#150c1c');
  const heart = tone(tint(heartMid), '#2a1a20');
  const moss = tone(g.cap, '#06201a');
  const stoneBase = mixToHex(g.stone, g.dirtDark, 0.3);
  const stone = tone(stoneBase, '#10142a');
  const leaf = tone(look.leaves[0] ?? g.cap, '#06201a');
  const vine = tone(look.vine.main, '#06201a');
  const pal: Palette = {
    outline: g.outline,
    bark,
    heart,
    moss,
    stone,
    leaf,
    vine,
    lip: {
      wood: awayFromFur(lighten(bark.mid, 0.7)),
      moss: awayFromFur(g.capHi),
      stone: awayFromFur(lighten(g.stone, 0.18)),
      ruin: awayFromFur(lighten(g.stone, 0.3)),
    },
    accent: look.glow ?? look.flora[0],
    glow: look.glow ?? null,
    flora: look.flora,
    kind: g.kind,
  };
  cache.set(look, pal);
  return pal;
}

/** every colour the report and the test check: [name, colour] for the lit top lips and the wood body of a world */
export function lipReport(look: Look, world: number): Array<[string, string]> {
  const p = paletteFor(look, world);
  return [
    ['lip.wood (branch, log, bridge, plank tops)', p.lip.wood],
    ['lip.moss (moss and grass tops)', p.lip.moss],
    ['lip.stone (moss_stone tops)', p.lip.stone],
    ['lip.ruin (carved stone tops)', p.lip.ruin],
  ];
}

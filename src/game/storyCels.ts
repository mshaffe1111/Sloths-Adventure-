/**
 * The painted cast of Matt's story sheets: Pokey's and Meeca's extra performances (Matt: the pink headband and #07 vest are MEECA's, the satchel is POKEY's, whatever the sheet
 * file names say), the two of them together, the General (a sloth in every state), Grandma, Lieutenant Pell, the
 * town crier and the mail carrier. Three atlases (src/assets/characters/cels-*.webp, cut by scratchpad story/cut.py + pack.py) hold 278 frames, each stored the way the sheet
 * drew it; `f` says which way the figure looks there, so a frame is mirrored only when its actor has to face the other way.
 *
 * In a cast string (storyDsl.ts) a figure is its CODE and a POSE:  `GR:water@.4`  `PH:hug_a@.5`  `GN:crack@.7<`. A pose is one frame (`code.pose` in CELS) or an ACT,
 * a short timed performance made of several frames (the General's war look melting into the plain sloth). Pure parts here are testable without a canvas.
 */
import { trackAtlas } from './atlasLoader.ts';
import { CELS, CEL_ATLAS_SIZES, CEL_HD, type CelFrame } from './storyCelData.ts';
import type { PoseKey } from './storyShots.ts';

export { CELS, CEL_ATLAS_SIZES, CEL_HD };
export type { CelFrame };

// (under the test runner there is no bundler and so no glob: the call throws and there are no pictures, as paintedBackdrops.ts)
let pageFiles: Record<string, string> = {};
try {
  pageFiles = import.meta.glob('../assets/characters/cels-*.webp', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
} catch {
  pageFiles = {};
}
/** the cel pages, in order (src/assets/characters/cels-<n>.webp) */
export const CEL_ATLAS_URLS: string[] = CEL_ATLAS_SIZES.map((_, i) => pageFiles[`../assets/characters/cels-${i}.webp`]);

/** canvas pixels per pixel of the old sheets for a figure drawn at scale 1: a standing Pokey was 205 sheet pixels, and is 270 canvas pixels (90 world units x 3) tall in the picture (the repainted pages are CEL_HD times that) */
export const CEL_K = 270 / 205;

// ───────────── the cast ─────────────

export interface CelCast {
  /** the frames' key prefix */
  prefix: string;
  /** who it is, for messages */
  name: string;
  /** where the figure stands, and which way it looks, when the cast string says nothing */
  x: number;
  face: 1 | -1;
  /** the pose a bare `GR` shows */
  rest: string;
  /** the story speakers this figure is (the camera closes on it while they talk) */
  who: string[];
  /** a feet position and scale when the cast string gives none (a bust sits low and big) */
  y?: number;
  scale?: number;
  /** a face bust: drawn like a portrait (no ground shadow), bottom edge fading away */
  bust?: boolean;
}

export const CEL_CAST: Record<string, CelCast> = {
  // the pink-headband #07 sloth of sheets 1-4, 13 and 14 is Meeca: her faces, emotion, action, music-box and shut-in-the-tower poses
  MS: { prefix: 'pk', name: 'Meeca (story sheets, pink #07)', x: 0.68, face: -1, rest: 'stand_wait', who: ['Meeca'] },
  /** Meeca's face bust: a close-up like `PF`, chin on the ground line (the painting melts away at the chest) */
  MF: { prefix: 'face', name: 'Meeca, face', x: 0.34, face: 1, rest: 'beam', who: ['Meeca'], y: 1.04, scale: 1.5, bust: true },
  // the satchel sloth of sheets 10-12 is Pokey: plain, with the bow, bandaged with the petal
  PN: { prefix: 'mc', name: 'Pokey (story sheets, satchel)', x: 0.3, face: 1, rest: 'idle', who: ['Pokey'] },
  PV: { prefix: 'mb', name: 'the cub (pink bow, satchel strap)', x: 0.3, face: 1, rest: 'idle', who: ['Pokey'] },
  PX: { prefix: 'mx', name: 'Pokey, wrists wrapped, with the petal', x: 0.3, face: 1, rest: 'stand', who: ['Pokey'] },
  PA: { prefix: 'da', name: 'Pokey and Meeca together (first pass)', x: 0.5, face: 1, rest: 'side_by_side', who: ['Pokey', 'Meeca'] },
  PB: { prefix: 'db', name: 'Pokey and Meeca together (second pass)', x: 0.5, face: 1, rest: 'side_by_side', who: ['Pokey', 'Meeca'] },
  PH: { prefix: 'hug', name: 'Pokey and Meeca hugging', x: 0.5, face: 1, rest: 'stand_close', who: ['Pokey', 'Meeca'] },
  // the General is a sloth in every state (Matt's sloth sheets). GN is his war look: red eyes, the spiked pauldron, the cape, the club. GV is who he is underneath: the plain sloth with the rust scarf and
  // the wrapped wrists. GY is the same sloth when he was young (the grandfather). GB and GP are his faces, war look and plain.
  GN: { prefix: 'gn', name: 'the General, war look (red eyes, pauldron, cape, club)', x: 0.7, face: -1, rest: 'ready_a', who: ['General Iron-Claw'] },
  GV: { prefix: 'gv', name: 'the General, plain sloth (rust scarf, wrapped wrists)', x: 0.7, face: -1, rest: 'stand', who: ['General Iron-Claw'] },
  GY: { prefix: 'gy', name: 'the General, young (the grandfather)', x: 0.7, face: -1, rest: 'stand', who: ['Grandfather', 'General Iron-Claw'] },
  /** the grandfather leading the cub Meeca by the hand (one picture of the two): who the General was before the war look, and who she was when he held her hand */
  GC: { prefix: 'gc', name: 'the grandfather leading the cub Meeca by the hand', x: 0.5, face: 1, rest: 'hand', who: ['Grandfather', 'General Iron-Claw', 'Meeca'] },
  GB: { prefix: 'gb', name: 'the General, face (war look)', x: 0.66, face: -1, rest: 'stare', who: ['General Iron-Claw'], y: 1.04, scale: 1.5, bust: true },
  GP: { prefix: 'gp', name: 'the General, face (plain)', x: 0.66, face: -1, rest: 'calm', who: ['General Iron-Claw', 'Grandfather'], y: 1.04, scale: 1.5, bust: true },
  GR: { prefix: 'gr', name: 'Grandma', x: 0.66, face: -1, rest: 'stand_hands', who: ['Grandma'] },
  LP: { prefix: 'lp', name: 'Lieutenant Pell', x: 0.66, face: -1, rest: 'stand_worry', who: ['Lieutenant Pell'] },
  TC: { prefix: 'tc', name: 'the town crier', x: 0.66, face: -1, rest: 'scroll', who: ['Gruntlewick'] },
  PO: { prefix: 'po', name: 'the mail carrier', x: 0.66, face: -1, rest: 'carry_stand', who: ['Mailman'] },
};

export function isCelCode(code: string): boolean {
  return Object.prototype.hasOwnProperty.call(CEL_CAST, code);
}

/** a performance: several frames in a timed run, or a loop of frames, as pose keys (storyShots.ts) */
type Act = PoseKey[];
const f = (prefix: string, name: string) => `${prefix}.${name}`;
const run = (prefix: string, steps: Array<[string, number]>): Act => {
  let at = 0;
  return steps.map(([name, secs]) => {
    const k: PoseKey = { at, frame: f(prefix, name) };
    at += secs;
    return k;
  });
};
const loop = (prefix: string, names: string[], fps: number): Act => [{ at: 0, frame: names.map((n) => f(prefix, n)), fps }];

/** acts by `CODE:name` */
export const CEL_ACTS: Record<string, Act> = {
  // the war look: a slow stand, and his eyes going out (the red, then the lids) as the song reaches him
  'GN:ready': loop('gn', ['ready_a', 'ready_b', 'ready_c', 'ready_b'], 1.6),
  'GN:soften': run('gn', [['glare', 1.1], ['narrow', 1.3], ['dim', 1.5], ['lids', 1.5], ['shut', 1.6], ['sleep_b', 1]]),
  // the change itself: the war look dissolves (club, cape and spikes first) and the plain sloth comes up through it, about five seconds
  'GN:morph': [{ at: 0, frame: 'gn.sleep_b' }, { at: 1.6, frame: 'gv.stand_m', fade: 3.4 }],
  'GV:sorrow': run('gv', [['sorrow', 2.4], ['sorrow_b', 2.2], ['wipe_eye', 2.4], ['sorrow', 1]]),
  'GV:read': run('gv', [['sorrow', 2.6], ['sorrow_b', 2.6], ['wipe_eye', 1]]),
  'PN:walk': loop('mc', ['walk_a', 'walk_b'], 3),
  'PN:run': loop('mc', ['run_a', 'run_b'], 6),
  'PV:walk': loop('mb', ['walk_a', 'walk_b'], 3),
  'PV:run': loop('mb', ['run_a', 'run_b'], 6),
  'MS:pace': loop('pk', ['pace_a', 'pace_b'], 2.2),
  'MS:write': loop('pk', ['desk_write_a', 'desk_write_b'], 1.4),
  'MS:wait': run('pk', [['chair_wait', 3], ['chair_chin', 3.5], ['chair_window', 3]]),
  'MS:box': run('pk', [['box_sit_smile', 2.4], ['box_sit_wind', 2.4], ['box_sit_dream', 3]]),
  'MS:song': run('pk', [['hum', 2], ['sing_heart', 2.2], ['sing_wide', 2.2], ['sing_joy', 2.2], ['open_calm', 1]]),
  'PH:sway': loop('hug', ['hug_a', 'hug_b', 'hug_c', 'hug_b'], 0.7),
  'LP:lantern': loop('lp', ['lantern_walk', 'lantern_look'], 0.7),
  'LP:salute': loop('lp', ['salute_a', 'salute_nervous'], 0.6),
};

const FRAME_KEYS = Object.keys(CELS);

/** the poses a code can show (single frames and acts), for messages and tests */
export function celPoses(code: string): string[] {
  const c = CEL_CAST[code];
  if (!c) return [];
  const own = FRAME_KEYS.filter((k) => k.startsWith(`${c.prefix}.`)).map((k) => k.slice(c.prefix.length + 1));
  const acts = Object.keys(CEL_ACTS).filter((k) => k.startsWith(`${code}:`)).map((k) => k.slice(code.length + 1));
  return [...acts, ...own];
}

/** the pose keys a cast token plays: an act, or one frame held. Throws on a name that does not exist, so a typo in the script fails the tests. */
export function celTrack(code: string, pose: string | undefined): PoseKey[] {
  const c = CEL_CAST[code];
  if (!c) throw new Error(`"${code}" is not a story-sheet figure`);
  const name = pose ?? c.rest;
  if (name.includes('+')) {
    // a run of single frames, one after the other (face busts changing expression)
    return name.split('+').map((n, i) => {
      const key = f(c.prefix, n);
      if (!CELS[key]) throw new Error(`${code}:${n} is not a pose of ${c.name} (${celPoses(code).join(', ')})`);
      return { at: i * FACE_SECONDS, frame: key };
    });
  }
  const act = CEL_ACTS[`${code}:${name}`];
  if (act) return act.map((k) => ({ ...k }));
  const key = f(c.prefix, name);
  if (!CELS[key]) throw new Error(`${code}:${name} is not a pose of ${c.name} (${celPoses(code).join(', ')})`);
  return [{ at: 0, frame: key }];
}

/** Meeca's face busts ("MF:grin", or "MF:fret+weary" to change expression), the bare names of the frames `face.*` */
export const CEL_FACES: string[] = FRAME_KEYS.filter((k) => k.startsWith('face.')).map((k) => k.slice(5));
/** how long each face of an "MF:a+b+c" cast stays up */
export const FACE_SECONDS = 1.8;

// ───────────── the painted speaker faces next to a name ─────────────

/** a square window over the top of one frame: `x`, `y` and `s` are shares of the frame's width (s is the window's side) */
export interface HeadSpec {
  key: string;
  x: number;
  y: number;
  s: number;
}
export const HEADS: Record<string, HeadSpec> = {
  Grandma: { key: 'gr.laugh', x: 0.05, y: 0.0, s: 0.9 },
  'Lieutenant Pell': { key: 'lp.hopeful', x: 0.1, y: 0.0, s: 0.8 },
  Grandfather: { key: 'gy.smile', x: 0.1, y: 0.0, s: 0.8 },
  Gruntlewick: { key: 'tc.hat_stand', x: 0.3, y: 0.0, s: 0.66 },
};

// ───────────── loading and drawing ─────────────

const atlas: Array<HTMLImageElement | null> = CEL_ATLAS_SIZES.map(() => null);
const ready: boolean[] = CEL_ATLAS_SIZES.map(() => false);
function load(i: number) {
  if (atlas[i] || typeof Image === 'undefined' || !CEL_ATLAS_URLS[i]) return;
  const img = new Image();
  atlas[i] = img;
  trackAtlas(img, CEL_ATLAS_URLS[i], () => { ready[i] = true; }, () => { atlas[i] = null; ready[i] = false; });
}
/** start fetching the pages (cheap to call again); with no argument, all of them */
export function warmCels(which: number[] = CEL_ATLAS_SIZES.map((_, i) => i)) {
  for (const i of which) load(i);
}
export function celReady(i: number): boolean {
  load(i);
  return ready[i] && !!atlas[i];
}
export function celAtlasImage(i: number): HTMLImageElement | null {
  return celReady(i) ? atlas[i] : null;
}
export function hasCel(key: string): boolean {
  return !!CELS[key];
}

const fade = new Map<string, HTMLCanvasElement>();
/** a copy of a cut-off frame with its bottom edge melting away, kept so it is made once */
function faded(key: string, c: CelFrame, img: HTMLImageElement): CanvasImageSource | null {
  if (typeof document === 'undefined') return null;
  let cv = fade.get(key);
  if (!cv) {
    cv = document.createElement('canvas');
    cv.width = c.w;
    cv.height = c.h;
    const g = cv.getContext('2d');
    if (!g) return null;
    g.drawImage(img, c.x, c.y, c.w, c.h, 0, 0, c.w, c.h);
    const band = Math.round(c.h * 0.2);
    const grad = g.createLinearGradient(0, c.h - band, 0, c.h);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(0,0,0,1)');
    g.globalCompositeOperation = 'destination-out';
    g.fillStyle = grad;
    g.fillRect(0, c.h - band, c.w, band);
    fade.set(key, cv);
  }
  return cv;
}

/**
 * Draw one frame with the middle of its bottom edge at (x, y); `k` is canvas pixels per pixel of the old sheets, `face` which way the figure should look (-1 left,
 * 1 right). A frame is mirrored only when it looks one way in the sheet and has to look the other. False when the page is not loaded or the frame does not exist.
 */
export function drawCel(ctx: CanvasRenderingContext2D, key: string, x: number, y: number, k: number, face: -1 | 1, alpha = 1): boolean {
  const c = CELS[key];
  if (!c) return false;
  const img = celAtlasImage(c.a);
  if (!img) return false;
  ctx.save();
  ctx.translate(x, y);
  if (c.f !== 0 && c.f !== face) ctx.scale(-1, 1);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  if (alpha < 1) ctx.globalAlpha *= alpha;
  const kk = k / CEL_HD;
  const dw = c.w * kk;
  const dh = c.h * kk;
  // (the painting is the old rect grown by m all round: its bottom-middle sits m below the feet)
  const oy = -dh + c.m * kk;
  if (c.c === 'raw') {
    const r = Math.min(dw, dh) * 0.05;
    ctx.beginPath();
    ctx.roundRect(-dw / 2, oy, dw, dh, r);
    ctx.clip();
    ctx.drawImage(img, c.x, c.y, c.w, c.h, -dw / 2, oy, dw, dh);
  } else if (c.c === 'b') {
    const src = faded(key, c, img);
    if (src) ctx.drawImage(src, 0, 0, c.w, c.h, -dw / 2, oy, dw, dh);
    else ctx.drawImage(img, c.x, c.y, c.w, c.h, -dw / 2, oy, dw, dh);
  } else {
    ctx.drawImage(img, c.x, c.y, c.w, c.h, -dw / 2, oy, dw, dh);
  }
  ctx.restore();
  return true;
}

/** a story has closed: let the cel pages go (they load again for the next one; a stage that draws cels warms its own) */
export function releaseCels() {
  for (let i = 0; i < atlas.length; i++) {
    atlas[i] = null;
    ready[i] = false;
  }
  fade.clear();
}

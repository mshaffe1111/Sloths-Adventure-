/**
 * The painted cast of Matt's story sheets: Pokey's and Meeca's extra performances, the two of them together, the General in three states, Grandma, Lieutenant Pell, the
 * town crier and the mail carrier. Three atlases (src/assets/characters/cels-*.webp, cut by scratchpad story/cut.py + pack.py) hold 278 frames, each stored the way the sheet
 * drew it; `f` says which way the figure looks there, so a frame is mirrored only when its actor has to face the other way.
 *
 * In a cast string (storyDsl.ts) a figure is its CODE and a POSE:  `GR:water@.4`  `PH:hug_a@.5`  `GN:crack@.7<`. A pose is one frame (`code.pose` in CELS) or an ACT,
 * a short timed performance made of several frames (the General's armor cracking open). Pure parts here are testable without a canvas.
 */
import { trackAtlas } from './atlasLoader.ts';
import { CELS, CEL_ATLAS_SIZES, type CelFrame } from './storyCelData.ts';
import type { PoseKey } from './storyShots.ts';

export { CELS, CEL_ATLAS_SIZES };
export type { CelFrame };

export const CEL_ATLAS_URLS = [
  new URL('../assets/characters/cels-pokey.webp', import.meta.url).href,
  new URL('../assets/characters/cels-pair.webp', import.meta.url).href,
  new URL('../assets/characters/cels-folk.webp', import.meta.url).href,
] as const;

/** canvas pixels per atlas pixel for a figure drawn at scale 1: a standing Pokey is 205 atlas pixels, and 270 canvas pixels (90 world units x 3) tall in the picture */
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
}

export const CEL_CAST: Record<string, CelCast> = {
  PC: { prefix: 'pk', name: 'Pokey (the story sheets)', x: 0.3, face: 1, rest: 'stand_wait', who: ['Pokey'] },
  MC: { prefix: 'mc', name: 'Meeca', x: 0.68, face: -1, rest: 'idle', who: ['Meeca'] },
  MB: { prefix: 'mb', name: 'Meeca with the bow', x: 0.68, face: -1, rest: 'idle', who: ['Meeca'] },
  MX: { prefix: 'mx', name: 'Meeca, bandaged', x: 0.68, face: -1, rest: 'stand', who: ['Meeca'] },
  PA: { prefix: 'da', name: 'Pokey and Meeca together (first pass)', x: 0.5, face: 1, rest: 'side_by_side', who: ['Pokey', 'Meeca'] },
  PB: { prefix: 'db', name: 'Pokey and Meeca together (second pass)', x: 0.5, face: 1, rest: 'side_by_side', who: ['Pokey', 'Meeca'] },
  PH: { prefix: 'hug', name: 'Pokey and Meeca hugging', x: 0.5, face: 1, rest: 'stand_close', who: ['Pokey', 'Meeca'] },
  GN: { prefix: 'gn', name: 'the General, armor to tunic', x: 0.7, face: -1, rest: 'tunic_stand', who: ['General Iron-Claw'] },
  GV: { prefix: 'gv', name: 'the General in a grey tunic', x: 0.7, face: -1, rest: 'stand', who: ['General Iron-Claw'] },
  GY: { prefix: 'gy', name: 'the General, younger (the grandfather)', x: 0.7, face: -1, rest: 'stand', who: ['Grandfather', 'General Iron-Claw'] },
  GR: { prefix: 'gr', name: 'Grandma', x: 0.66, face: -1, rest: 'stand_hands', who: ['Grandma'] },
  LP: { prefix: 'lp', name: 'Lieutenant Pell', x: 0.66, face: -1, rest: 'stand_worry', who: ['Officer'] },
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
  // the General's armor splits open and falls away (about nine seconds), and the old soldier stands up inside it
  'GN:crack': run('gn', [['ready_a', 1.2], ['ready_b', 1.0], ['ready_c', 1.0], ['crack_spark', 1.2], ['crack_b', 1.2], ['crack_c', 1.2], ['armor_off', 1.4], ['bare_sorrow', 1]]),
  'GN:rise': run('gn', [['armor_off', 1.3], ['bare_sorrow', 1.6], ['tunic_club_a', 1]]),
  'GN:ready': loop('gn', ['ready_a', 'ready_b', 'ready_c', 'ready_b'], 1.6),
  'GN:sorrow': run('gn', [['tunic_sad_a', 2.4], ['tunic_sad_b', 2.2], ['tunic_sad_c', 2.4], ['tunic_sad_a', 1]]),
  'GN:club': loop('gn', ['tunic_club_a', 'tunic_club_b', 'tunic_club_c', 'tunic_club_d'], 1.1),
  'GV:read': run('gv', [['sit_read', 2.5], ['kneel_read', 2.5], ['kneel_fold', 1]]),
  'MC:walk': loop('mc', ['walk_a', 'walk_b'], 3),
  'MC:run': loop('mc', ['run_a', 'run_b'], 6),
  'MB:walk': loop('mb', ['walk_a', 'walk_b'], 3),
  'MB:run': loop('mb', ['run_a', 'run_b'], 6),
  'PC:pace': loop('pk', ['pace_a', 'pace_b'], 2.2),
  'PC:write': loop('pk', ['desk_write_a', 'desk_write_b'], 1.4),
  'PC:wait': run('pk', [['chair_wait', 3], ['chair_chin', 3.5], ['chair_window', 3]]),
  'PC:box': run('pk', [['box_sit_smile', 2.4], ['box_sit_wind', 2.4], ['box_sit_dream', 3]]),
  'PC:song': run('pk', [['hum', 2], ['sing_heart', 2.2], ['sing_wide', 2.2], ['sing_joy', 2.2], ['open_calm', 1]]),
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
  const act = CEL_ACTS[`${code}:${name}`];
  if (act) return act.map((k) => ({ ...k }));
  const key = f(c.prefix, name);
  if (!CELS[key]) throw new Error(`${code}:${name} is not a pose of ${c.name} (${celPoses(code).join(', ')})`);
  return [{ at: 0, frame: key }];
}

/** the new Pokey face busts ("PF:grin"); the bare names, so they never clash with the older face_* frames */
export const CEL_FACES: string[] = FRAME_KEYS.filter((k) => k.startsWith('face.')).map((k) => k.slice(5));
export function celFaceKey(name: string): string | null {
  const bare = name.replace(/^face_/, '');
  return CELS[`face.${bare}`] ? `face.${bare}` : null;
}

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
  Officer: { key: 'lp.hopeful', x: 0.1, y: 0.0, s: 0.8 },
  Grandfather: { key: 'gy.smile', x: 0.05, y: 0.0, s: 0.9 },
};

// ───────────── loading and drawing ─────────────

const atlas: Array<HTMLImageElement | null> = [null, null, null];
const ready: boolean[] = [false, false, false];
function load(i: number) {
  if (atlas[i] || typeof Image === 'undefined') return;
  const img = new Image();
  atlas[i] = img;
  trackAtlas(img, CEL_ATLAS_URLS[i], () => { ready[i] = true; }, () => { atlas[i] = null; ready[i] = false; });
}
/** start fetching the atlases (cheap to call again); with no argument, all three */
export function warmCels(which: number[] = [0, 1, 2]) {
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
 * Draw one frame with the middle of its bottom edge at (x, y); `k` is canvas pixels per atlas pixel, `face` which way the figure should look (-1 left, 1 right).
 * A frame is mirrored only when it looks one way in the sheet and has to look the other. False when the atlas is not loaded or the frame does not exist.
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
  const dw = c.w * k;
  const dh = c.h * k;
  if (c.c === 'raw') {
    const r = Math.min(dw, dh) * 0.05;
    ctx.beginPath();
    ctx.roundRect(-dw / 2, -dh, dw, dh, r);
    ctx.clip();
    ctx.drawImage(img, c.x, c.y, c.w, c.h, -dw / 2, -dh, dw, dh);
  } else if (c.c === 'b') {
    const src = faded(key, c, img);
    if (src) ctx.drawImage(src, 0, 0, c.w, c.h, -dw / 2, -dh, dw, dh);
    else ctx.drawImage(img, c.x, c.y, c.w, c.h, -dw / 2, -dh, dw, dh);
  } else {
    ctx.drawImage(img, c.x, c.y, c.w, c.h, -dw / 2, -dh, dw, dh);
  }
  ctx.restore();
  return true;
}

/**
 * Painted Tarantula Queen. Draws the world-5 boss from the pose atlas (Gemini sheets) instead of the code-drawn spider.
 *
 * Same idea as the other painted creatures: a switch, not a replacement. `?queen=sprite` / `?queen=classic` picks one for the
 * session, `localStorage.sloth_queen = 'sprite'` keeps it, and DEFAULT_SPRITE_QUEEN decides when nothing is set. It returns false
 * while the atlas loads (or when switched off) and bossArt.ts then draws the vector spider.
 *
 * Poses follow the boss brain (bossAI.ts): walking (the faster charge scuttle from the second phase on), a warning pose for each
 * wind-up, one pose per attack (web cocoon, brood call, web slam, pounce and bite), the open recovery, stun and death.
 */
import type { BossEntity } from './types.ts';
import type { BossDef } from './bossAI.ts';
import { QUEEN_FRAMES } from './queenAtlasData.ts';

export const DEFAULT_SPRITE_QUEEN = false;
/** world units per atlas pixel (the painted idle is 196 px: drawn about 1.4 times the 132-wide hurt box, like the vector queen was) */
const K = 0.9;
const STRIDE = 60;
const WALK = ['walk_0', 'walk_1', 'walk_2', 'walk_3'];

let enabled: boolean | null = null;
export function queenSpriteEnabled(): boolean {
  if (enabled !== null) return enabled;
  let v = DEFAULT_SPRITE_QUEEN;
  try {
    const q = new URLSearchParams(location.search).get('queen');
    if (q === 'sprite') v = true;
    else if (q === 'classic') v = false;
    else if (localStorage.getItem('sloth_queen') === 'sprite') v = true;
  } catch {
    /* no window or storage: keep the default */
  }
  enabled = v;
  return v;
}

let atlas: HTMLImageElement | null = null;
let ready = false;
function load() {
  if (atlas || typeof Image === 'undefined') return;
  atlas = new Image();
  atlas.onload = () => {
    ready = true;
  };
  atlas.src = new URL('../assets/enemies/queen-atlas.webp', import.meta.url).href;
}

/** true when the painted queen will be drawn (bossArt then tones down its squash-and-lean, the pictures are already posed) */
export function queenSpriteActive(): boolean {
  if (!queenSpriteEnabled()) return false;
  load();
  return ready;
}

const memory = new WeakMap<BossEntity, { x: number; t: number; vx: number; dist: number }>();

export function drawQueenSprite(ctx: CanvasRenderingContext2D, b: BossEntity, def: BossDef, time: number, feetY: number): boolean {
  if (!queenSpriteActive() || !atlas) return false;
  const br = b.ai;
  if (!br) return false;

  let mem = memory.get(b);
  if (!mem) {
    mem = { x: b.x, t: time, vx: 0, dist: 0 };
    memory.set(b, mem);
  }
  const dt = Math.max(0.001, Math.min(0.1, time - mem.t));
  mem.vx += ((b.x - mem.x) / dt - mem.vx) * Math.min(1, dt * 12);
  mem.dist += Math.abs(mem.vx) * dt;
  mem.x = b.x;
  mem.t = time;
  const moving = Math.abs(mem.vx) > 12;

  const m = br.move ? def.moves[br.move] ?? null : null;
  let name: string;
  if (br.state === 'dying') name = br.t < 0.5 ? 'hurt' : 'dead';
  else if (br.state === 'stun') name = 'dizzy';
  else if (br.state === 'roar') name = 'screech';
  else if (br.state === 'tell') name = m?.pose === 'roar' ? 'screech' : m?.pose === 'leap' ? 'block' : 'idle2';
  else if (br.state === 'act') {
    if (m?.pose === 'spit') name = 'cocoon';
    else if (m?.pose === 'roar') name = br.move === 'callBrood' ? 'summon' : 'webslam';
    else if (m?.pose === 'leap') name = br.air > 8 ? 'leap' : 'bite';
    else name = 'bite';
  } else if (br.state === 'rec') name = 'drip';
  else if (moving) {
    if (b.phase >= 2) name = Math.floor((mem.dist / 44) * 2) % 2 === 0 ? 'charge_0' : 'charge_1';
    else name = WALK[Math.floor((mem.dist / STRIDE) * WALK.length) % WALK.length];
  } else name = 'idle';
  if (b.hitFlashTimer > 0.12 && (br.state === 'idle' || br.state === 'rec')) name = 'hurt';
  const f = QUEEN_FRAMES[name];
  if (!f) return false;

  ctx.save();
  ctx.translate(b.x, feetY);
  ctx.scale(b.facing < 0 ? -1 : 1, 1);
  if (b.hitFlashTimer > 0) ctx.filter = 'brightness(2.2)';
  ctx.drawImage(atlas, f.x, f.y, f.w, f.h, -f.ax * K, -f.ay * K, f.w * K, f.h * K);
  ctx.restore();
  return true;
}

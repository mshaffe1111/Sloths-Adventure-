/**
 * soldierSprite — World 10's soldiers, the General's sloths in olive coats with their lanterns. Their march and idle are Meeca's stage's
 * clips (soldierAnimData.ts, src/assets/enemies/soldier-anim.webp); their attack, hurt and fall are the HF fight clips
 * (soldierFightData.ts, src/assets/w6to10/creatures/soldier-anim-0/1.webp). One design, two variants, by the enemy's id: _a dark
 * chocolate fur, _b cinnamon fur with a rolled blanket on his back. A soldier fights as the prowler it stands in for (an `ocelot` enemy:
 * patrol, wind-up, lunge, recover, so its brain, its score and every check stay the ones already proven) and only looks like a soldier
 * (Enemy.look, gen2/worlds/w10.ts).
 *
 * drawSoldierSprite returns false until its sheets have loaded, and the caller draws the prowler.
 */
import { trackAtlas } from './atlasLoader.ts';
import { bodyFor } from './creatureRig.ts';
import type { Enemy } from './types.ts';
import { SOLDIER_ANIM, SOLDIER_ANIM_URL, SOLDIER_SEQ } from './soldierAnimData.ts';
import { FIGHT_FRAMES, FIGHT_SEQ, FIGHT_URLS } from './soldierFightData.ts';

/** every sheet a soldier draws from (the march sheet first) */
export const SOLDIER_URLS: readonly string[] = [SOLDIER_ANIM_URL, ...FIGHT_URLS];
/** the drawn height of a standing soldier (world px): a head taller than Pokey, its collider (w10.ts) a little inside it */
export const SOLDIER_H = 88;
/** world px per clip pixel: both sets stand about 300 px tall in their sheets */
const K = SOLDIER_H / 300;
/** how far a stride carries it (px), one march cycle */
const CYCLE = 120;

const imgs: Array<HTMLImageElement | null> = SOLDIER_URLS.map(() => null);
const ready = SOLDIER_URLS.map(() => false);
function load(i: number) {
  if (imgs[i] || typeof Image === 'undefined') return;
  const im = new Image();
  imgs[i] = im;
  trackAtlas(im, SOLDIER_URLS[i], () => (ready[i] = true), () => (imgs[i] = null), () => ((imgs[i] = null), (ready[i] = false)));
}
/** whether every sheet has loaded (starts the loads) */
export function soldierReady(): boolean {
  SOLDIER_URLS.forEach((_, i) => load(i));
  return ready.every(Boolean);
}

type Pick = { img: number; f: { x: number; y: number; w: number; h: number; ax: number; ay: number } };
/** a march or idle frame (the march sheet) at progress p (0..1) */
function march(seq: string, p: number): Pick | null {
  const s = SOLDIER_SEQ[seq];
  if (!s?.length) return null;
  const f = SOLDIER_ANIM[s[Math.max(0, Math.min(s.length - 1, Math.floor(p * s.length)))]];
  return f ? { img: 0, f } : null;
}
/** a fight frame (attack, hurt, down) at progress p (0..1) */
function fight(seq: string, p: number): Pick | null {
  const s = FIGHT_SEQ[seq];
  if (!s?.length) return null;
  const f = FIGHT_FRAMES[s[Math.max(0, Math.min(s.length - 1, Math.floor(p * s.length)))]];
  return f ? { img: 1 + f.s, f } : null;
}

/** the soldier for an enemy whose look is 'soldier' (its body is an ocelot's: the clip follows its state) */
export function drawSoldierSprite(ctx: CanvasRenderingContext2D, enemy: Enemy, time: number): boolean {
  if (!soldierReady()) return false;
  const v = enemy.id % 2 === 0 ? 'a' : 'b';
  const b = bodyFor('soldier', enemy, time);
  const rig = (b.rig ??= { dist: enemy.id * 7.1 }) as { dist: number };
  const st = enemy.state ?? 'patrol';
  if (b.dt > 0 && st === 'patrol') rig.dist += Math.abs(b.fv) * b.dt;
  const t = enemy.stateT ?? 0;
  let pick: Pick | null;
  if (enemy.defeated) pick = fight(`down_${v}`, Math.min(1, enemy.koTimer / 0.9));
  else if ((enemy.recoil ?? 0) > 0.35) pick = fight(`hurt_${v}`, 1 - (enemy.recoil ?? 0));
  else if (st === 'windup') pick = fight(`attack_${v}`, Math.min(0.45, (t / 0.38) * 0.45));
  else if (st === 'leap') pick = fight(`attack_${v}`, 0.45 + Math.min(0.4, t * 0.8));
  else if (st === 'recover') pick = fight(`attack_${v}`, 0.85 + Math.min(0.15, t * 0.4));
  else if (Math.abs(b.fv) < 4) {
    // (the idle plays there and back, 10 fps)
    const n = SOLDIER_SEQ[`idle_${v}`]?.length ?? 1;
    const k = Math.floor(time * 10 + enemy.id * 3) % (2 * n - 2 || 1);
    pick = march(`idle_${v}`, (k < n ? k : 2 * n - 2 - k) / n);
  } else pick = march(`march_${v}`, (((rig.dist / CYCLE) % 1) + 1) % 1);
  if (!pick) return false;
  const img = imgs[pick.img];
  if (!img) return false;
  const f = pick.f;
  const feet = enemy.y + enemy.height / 2;
  ctx.save();
  ctx.translate(enemy.x, feet);
  ctx.scale(b.fs < 0 ? -Math.max(0.6, -b.fs) : Math.max(0.6, b.fs), 1);
  // (a soft contact shadow under its boots)
  ctx.fillStyle = 'rgba(0,0,0,0.28)';
  ctx.beginPath();
  ctx.ellipse(0, 1, 26, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  if (enemy.hitFlashTimer > 0) ctx.filter = 'brightness(2.2)';
  ctx.drawImage(img, f.x, f.y, f.w, f.h, -f.ax * K, -f.ay * K, f.w * K, f.h * K);
  ctx.filter = 'none';
  ctx.restore();
  return true;
}

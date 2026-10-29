/**
 * batArt — World 8's bat roosts (8-4 Bat Roosts, gen2/worlds/w8.ts 'roost'): the watcher (watcher.ts) of a roost stretch is drawn as
 * fruit bats in place of World 6's eagle, from the fruitbat sheets (fruitbatAnimData.ts):
 *   the roost   3-5 bats hanging under a painted roost branch (props-made/w8roost 'roost-branch') over the start of each watched stretch
 *               (W8Extras.roosts), each on its own clock, some flipped. Calm: hanging still, and a slow "z" drifting up from the roost (a
 *               small code touch: the clip's doze and sleep frames still read as eyes open at game size, the lead's review 2026-10-29,
 *               so the asleep tell is the "z" until Matt's sleeping-bat sheet comes). Waking (the watcher's warning) and sweeping: the
 *               wing flutter (the roost clip's frames 00-04), bat by bat
 *   the sweep   one bat on the flying cycle (fruitbat-fly, drawn at half its size), a faint glow on its eye (a small code touch), flies
 *               the watcher's pass and dives as the eagle did
 *   the hides   the watcher's bushes in World 8's dress: the tree hollow and the leaf curtain (drawW8Hide)
 * Everything draws false while its sheet loads (the eagle stands in for the sweep; the roost is scenery; the bush art for the hides).
 */
import { makeCreatureAnim } from './creatureAnim.ts';
import { FRUITBAT_ANIM, FRUITBAT_ANIM_UP, FRUITBAT_ANIM_URL, FRUITBAT_FLY, FRUITBAT_FLY_SEQ, FRUITBAT_FLY_URL, FRUITBAT_SEQ, W8C, W8C_URL, W8ROOST, W8ROOST_URL } from './fruitbatAnimData.ts';

const ANIM = makeCreatureAnim(FRUITBAT_ANIM_URL, FRUITBAT_ANIM, FRUITBAT_SEQ, FRUITBAT_ANIM_UP);
const FLY = makeCreatureAnim(FRUITBAT_FLY_URL, FRUITBAT_FLY, FRUITBAT_FLY_SEQ, 1);
const BRANCH = makeCreatureAnim(W8ROOST_URL, W8ROOST, {}, 1);
const DRESS = makeCreatureAnim(W8C_URL, W8C, {}, 1);
/** the roost clip's frames: the wings open (flapping in), and hanging still */
const FLAP = ['roost_00', 'roost_01', 'roost_02', 'roost_03', 'roost_04'];
const HANG = (FRUITBAT_SEQ.roost ?? []).slice(5);
/** a hanging bat about 70 px across (the clip frames are ~215 px); the flying one ~150 px wing to wing (its frames ~378 px, drawn 2x) */
const ROOST_K = 0.33;
const FLY_K = 0.4;
/** the roost branch over the stretch's ground, how far apart the bats hang, the branch's width on screen */
export const ROOST = { up: 185, apart: 72, branch: 340 } as const;
/** the flying bat's eye in its frame (px from the anchor, before scaling): where the faint glow sits */
const EYE = { x: 70, y: -22 } as const;

const hash01 = (x: number, salt: number): number => {
  const s = Math.sin(x * 12.9898 + salt * 78.233) * 43758.5453;
  return s - Math.floor(s);
};

/** start loading the sheets (a World 8 stage with roosts, as it starts) */
export const warmBats = (): boolean => [ANIM.ready(), FLY.ready(), BRANCH.ready()].every(Boolean);

/**
 * One roost over (x, ground y): `waking` 0 calm .. 1 sweeping (the watcher's phase). False while the sheets load (nothing drawn: the
 * roost is scenery)
 */
export function drawRoost(ctx: CanvasRenderingContext2D, x: number, groundY: number, waking: number, t: number): boolean {
  if (!ANIM.ready() || !BRANCH.ready()) return false;
  const y = groundY - ROOST.up;
  const n = 3 + Math.floor(hash01(x, 1) * 3);
  const mid = x + 30 + ((n - 1) * ROOST.apart) / 2;
  // (the painted branch, its foot (the anchor) at the bats' grip line, wide enough for the roost)
  ctx.save();
  ctx.translate(mid, y + 6);
  if (hash01(x, 2) < 0.5) ctx.scale(-1, 1);
  BRANCH.draw(ctx, hash01(x, 3) < 0.5 ? 'roost-branch' : 'roost-branch-b', ROOST.branch / 477);
  ctx.restore();
  for (let i = 0; i < n; i++) {
    const bx = x + 30 + i * ROOST.apart + (hash01(x, 10 + i) - 0.5) * 16;
    const clock = t + hash01(x, 20 + i) * 7;
    // (waking: each bat flutters in turn, the first ones first)
    const flutter = waking > i / (n + 1);
    const name = flutter ? FLAP[Math.floor(clock * 10) % FLAP.length] : HANG[Math.floor(clock * 4) % HANG.length];
    ctx.save();
    ctx.translate(bx, y + 4);
    if (hash01(x, 30 + i) < 0.4) ctx.scale(-1, 1);
    ANIM.draw(ctx, name, ROOST_K);
    ctx.restore();
  }
  // (asleep: a slow "z" drifting up from the roost, one at a time, fading out)
  if (waking <= 0) {
    const u = (t * 0.45 + hash01(x, 40)) % 1;
    const zx = mid + 20 + 18 * Math.sin(u * 5);
    const zy = y - 20 - 60 * u;
    ctx.save();
    ctx.globalAlpha = Math.sin(u * Math.PI) * 0.85;
    ctx.fillStyle = '#e9e3ff';
    ctx.strokeStyle = 'rgba(30, 20, 60, 0.9)';
    ctx.lineWidth = 3;
    ctx.font = `bold ${Math.round(16 + 10 * u)}px sans-serif`;
    ctx.strokeText('z', zx, zy);
    ctx.fillText('z', zx, zy);
    ctx.restore();
  }
  return true;
}

/** the flying bat at (x, y), facing `dir`; false while its sheet loads (the eagle stands in) */
export function drawBatSweep(ctx: CanvasRenderingContext2D, x: number, y: number, dir: number, t: number): boolean {
  if (!FLY.ready()) return false;
  const name = FLY.loop('fly', t, 12);
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(dir < 0 ? -1 : 1, 1);
  FLY.draw(ctx, name, FLY_K);
  // (a faint glow on its eye, so it reads in the dark)
  const ex = EYE.x * FLY_K;
  const ey = EYE.y * FLY_K;
  const g = ctx.createRadialGradient(ex, ey, 0, ex, ey, 9);
  g.addColorStop(0, 'rgba(255, 240, 170, 0.75)');
  g.addColorStop(1, 'rgba(255, 240, 170, 0)');
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(ex, ey, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  return true;
}

/**
 * A roost stretch's hiding place in World 8's painted dress (w8c 'tree-hollow', 'leaf-curtain'), standing on the bush's ground, as wide
 * as the bush and a little more; see-through while he is inside, so he stays readable. False while the sheet loads (the bush art stands in)
 */
export function drawW8Hide(ctx: CanvasRenderingContext2D, b: { x: number; w: number; y: number }, look: string, inside: boolean): boolean {
  const f = W8C[look];
  if (!f || !DRESS.ready()) return false;
  ctx.save();
  ctx.globalAlpha = inside ? 0.6 : 1;
  ctx.translate(b.x + b.w / 2, b.y + 6);
  DRESS.draw(ctx, look, (b.w * 1.25) / f.w);
  ctx.restore();
  return true;
}

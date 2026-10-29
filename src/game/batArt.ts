/**
 * batArt — World 8's bat roosts (8-4 Bat Roosts, gen2/worlds/w8.ts 'roost'): the watcher (watcher.ts) of a roost stretch is drawn as
 * fruit bats, from today's fruitbat clip sheet (fruitbatAnimData.ts), in place of World 6's eagle.
 *   the roost   3-5 bats hanging under a bough over the start of each watched stretch (W8Extras.roosts), each on its own clock, some
 *               flipped: hanging still while the roost is calm, the wing flutter (the clip's frames 00-04) while it wakes (the watcher's
 *               warning) and while it sweeps
 *   the sweep   one bat with its wings open (frames 00-03, back and forth) flies the watcher's pass and dives as the eagle did
 * The bough is the World 8 kit's painted branch. Stand-ins until the Hugging Face batch lands (the lead, 2026-10-29, branch hf-batch-w7w8):
 * an asleep hanging bat (eyes shut: the calm roost will use it) and a flying cycle (the sweep).
 * Everything draws false while the sheet loads, so the eagle stands in for the sweep.
 */
import { makeCreatureAnim } from './creatureAnim.ts';
import { drawKitPiece } from './protoArt.ts';
import { FRUITBAT_ANIM, FRUITBAT_ANIM_UP, FRUITBAT_ANIM_URL, FRUITBAT_SEQ } from './fruitbatAnimData.ts';

const ANIM = makeCreatureAnim(FRUITBAT_ANIM_URL, FRUITBAT_ANIM, FRUITBAT_SEQ, FRUITBAT_ANIM_UP);
/** the roost clip's frames: the wings open (flapping in), and hanging still */
const FLAP = ['roost_00', 'roost_01', 'roost_02', 'roost_03', 'roost_04'];
const HANG = (FRUITBAT_SEQ.roost ?? []).slice(5);
/** a hanging bat about 70 px across (the clip frames are ~215 px), the sweeping one a little bigger */
const ROOST_K = 0.33;
const SWEEP_K = 0.45;
/** the bough the roost hangs from, this far over the stretch's ground, and how far apart the bats hang */
export const ROOST = { up: 300, apart: 58, bough: 260 } as const;

const hash01 = (x: number, salt: number): number => {
  const s = Math.sin(x * 12.9898 + salt * 78.233) * 43758.5453;
  return s - Math.floor(s);
};

/** start loading the sheet (a World 8 stage with roosts, as it starts) */
export const warmBats = (): boolean => ANIM.ready();

/**
 * One roost over (x, ground y): `waking` 0 calm .. 1 sweeping (the watcher's phase). False while the sheet loads (nothing drawn: the
 * roost is scenery; the sweep has the eagle as its stand-in)
 */
export function drawRoost(ctx: CanvasRenderingContext2D, x: number, groundY: number, waking: number, t: number): boolean {
  if (!ANIM.ready()) return false;
  const y = groundY - ROOST.up;
  // (the bough: the World 8 kit's painted branch (kits/w8 'branch', 578 x 198), its top a little over the bats' grip; with no kit
  // loaded the bats hang from the dark alone, never from a code-drawn branch)
  const bw = ROOST.bough + 80;
  drawKitPiece(ctx, 'branch', x - 50, y - 22, bw, (bw * 198) / 578);
  const n = 3 + Math.floor(hash01(x, 1) * 3);
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
  return true;
}

/** the sweeping bat at (x, y), facing `dir`; false while the sheet loads (the eagle stands in) */
export function drawBatSweep(ctx: CanvasRenderingContext2D, x: number, y: number, dir: number, t: number): boolean {
  if (!ANIM.ready()) return false;
  const name = FLAP.slice(0, 4)[[0, 1, 2, 3, 2, 1][Math.floor(t * 12) % 6]];
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(dir < 0 ? -SWEEP_K : SWEEP_K, SWEEP_K);
  ANIM.draw(ctx, name, 1);
  ctx.restore();
  return true;
}

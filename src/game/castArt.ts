/**
 * castArt — how a stage's drop traps are drawn (castPlay.ts, dropTrap.ts). STAND-IN art, code-drawn: a trap is a new prop that hangs
 * in plain view all stage long, so its finished look is painted art (STAGE-RULES §4) once its picture list is approved; until then
 * this keeps to few, cheap shapes (PERFORMANCE-RULES §1) in World 1's own greens, browns and honey.
 *
 * What a player must read at a glance: the HANDLE is the thing to hit (it sways and its end glows softly while the trap is set), the
 * cord runs from it up and over to the LOAD, and the load hangs over the animal.
 */
import { TRAP, type TrapState } from './dropTrap.ts';

const VINE = '#3f7d2c';
const VINE_DARK = '#27541c';
const CORD = '#7c5a36';

function hive(ctx: CanvasRenderingContext2D, x: number, y: number, tilt: number): void {
  // its bottom at (x, y): four stacked bands, widest second from the top
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(tilt);
  const bands: Array<[number, number]> = [[-46, 15], [-34, 21], [-22, 19], [-10, 13]];
  for (let i = 0; i < bands.length; i++) {
    ctx.fillStyle = i % 2 ? '#d99a2b' : '#f0b942';
    ctx.beginPath();
    ctx.ellipse(0, bands[i][0], bands[i][1], 8, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#5b3a12';
  ctx.beginPath();
  ctx.ellipse(0, -18, 4.5, 5.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function stone(ctx: CanvasRenderingContext2D, x: number, y: number, tilt: number): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(tilt);
  ctx.fillStyle = '#8d8a80';
  ctx.beginPath();
  ctx.ellipse(0, -18, 24, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#b3b0a4';
  ctx.beginPath();
  ctx.ellipse(-6, -24, 12, 7, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#5f8f3a';
  ctx.beginPath();
  ctx.ellipse(8, -31, 9, 4, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** every trap on screen. `seen`: the engine's on-screen test */
export function drawTraps(ctx: CanvasRenderingContext2D, traps: readonly TrapState[], t: number, seen: (x: number, y: number) => boolean): void {
  for (const tr of traps) {
    const p = tr.post;
    if (!seen(p.x, p.y) && !seen(p.loadX, p.loadY)) continue;
    const set = tr.phase === 'set';
    const loose = tr.phase === 'loose';
    const top = p.loadY - 46 - 26; // the bough line the cord runs along, over the load's crown
    // the load's sway: a slow breath while it hangs, a hard shake once it is let go
    const sway = set ? Math.sin(t * 1.7 + p.id) * 0.05 : loose ? Math.sin(tr.t * 46) * 0.16 : 0;
    const hx = p.x + (set ? Math.sin(t * 2.1 + p.id * 2) * 3 : 0);

    ctx.lineCap = 'round';
    if (tr.phase === 'set' || loose) {
      // the cord: from the handle's top, over, to the load
      ctx.strokeStyle = CORD;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(p.x, top);
      ctx.quadraticCurveTo((p.x + p.loadX) / 2, top + 16, p.loadX, top);
      ctx.lineTo(p.loadX, p.loadY - 44);
      ctx.stroke();
    }
    if (p.kind === 'vine') {
      // a vine hanging to just over his head-height, a leaf tuft at its end
      const end = p.y - TRAP.handle.low - 34;
      ctx.strokeStyle = VINE_DARK;
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(p.x, top);
      ctx.quadraticCurveTo(p.x + (hx - p.x) * 2, (top + end) / 2, hx, end);
      ctx.stroke();
      ctx.strokeStyle = VINE;
      ctx.lineWidth = 3.5;
      ctx.stroke();
      ctx.fillStyle = VINE;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.ellipse(hx + (i - 1) * 9, end + 6 + (i === 1 ? 5 : 0), 9, 5, (i - 1) * 0.6, 0, Math.PI * 2);
        ctx.fill();
      }
      if (set) glow(ctx, hx, end + 6, t, p.id);
    } else {
      // a tendril tied off to a peg at his feet: taut while set, cut and curled once it has gone
      ctx.strokeStyle = VINE_DARK;
      ctx.lineWidth = 6;
      ctx.beginPath();
      if (set || loose) {
        ctx.moveTo(p.x, top);
        ctx.lineTo(hx, p.y - 6);
      } else {
        ctx.moveTo(p.x, p.y - 6);
        ctx.quadraticCurveTo(p.x + 14, p.y - 30, p.x + 4, p.y - 40);
      }
      ctx.stroke();
      ctx.strokeStyle = VINE;
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.fillStyle = CORD;
      ctx.fillRect(p.x - 5, p.y - 12, 10, 12);
      if (set) glow(ctx, hx, p.y - 52, t, p.id);
    }
    // the load: hanging, falling, or lying where it fell (tipped a little)
    const tilt = tr.phase === 'down' ? 0.35 : sway;
    if (p.load === 'hive') hive(ctx, p.loadX, tr.y, tilt);
    else stone(ctx, p.loadX, tr.y, tilt);
    if (tr.phase === 'down' && p.load === 'hive' && tr.t < 4) {
      // the buzz: a few specks circling for a moment (no stings, nothing chases him)
      ctx.fillStyle = '#3f2d0c';
      for (let i = 0; i < 5; i++) {
        const a = tr.t * (5 + i) + i * 1.3;
        ctx.fillRect(p.loadX + Math.cos(a) * (22 + i * 5), tr.y - 30 + Math.sin(a * 1.3) * (12 + i * 3), 2.5, 2.5);
      }
    }
  }
}

/** the soft pulse that says "hit me": one ring, no gradient (cheap) */
function glow(ctx: CanvasRenderingContext2D, x: number, y: number, t: number, id: number): void {
  const u = (Math.sin(t * 3.2 + id) + 1) / 2;
  ctx.save();
  ctx.globalAlpha *= 0.25 + 0.3 * u;
  ctx.strokeStyle = '#fef08a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(x, y, 17 + 4 * u, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

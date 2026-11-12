/**
 * castArt — how a stage's drop traps are drawn (castPlay.ts, dropTrap.ts). STAND-IN art, code-drawn: a trap is a new prop that hangs
 * in plain view all stage long, so its finished look is painted art (STAGE-RULES §4) once its picture list is approved; until then
 * this keeps to few, cheap shapes (PERFORMANCE-RULES §1) in World 1's own greens, browns and honey.
 *
 * What a player must read at a glance: the HANDLE is the thing to hit (it sways and its end glows softly while the trap is set), ONE
 * vine runs from it up and over to the LOAD, and the load hangs over the animal. Nothing runs off the top of the screen.
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

/** a clump of leaves the vine hangs from: what stands in for the bough above, so nothing is tied to thin air and nothing runs off the top of the screen */
function clump(ctx: CanvasRenderingContext2D, x: number, y: number, k: number): void {
  ctx.fillStyle = VINE_DARK;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.ellipse(x + (i - 2) * 11 * k, y - (i % 2 ? 7 : 0) * k, 15 * k, 8 * k, (i - 2) * 0.35, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = VINE;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.ellipse(x + (i - 1) * 13 * k, y + 3 * k, 10 * k, 5 * k, (i - 1) * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** a vine as two strokes (a dark edge, a green heart) along the path already begun */
function vine(ctx: CanvasRenderingContext2D, w: number): void {
  ctx.strokeStyle = VINE_DARK;
  ctx.lineWidth = w;
  ctx.stroke();
  ctx.strokeStyle = VINE;
  ctx.lineWidth = w * 0.5;
  ctx.stroke();
}

/** every trap on screen. `seen`: the engine's on-screen test */
export function drawTraps(ctx: CanvasRenderingContext2D, traps: readonly TrapState[], t: number, seen: (x: number, y: number) => boolean): void {
  for (const tr of traps) {
    const p = tr.post;
    if (!seen(p.x, p.y) && !seen(p.loadX, p.loadY)) continue;
    const set = tr.phase === 'set';
    const loose = tr.phase === 'loose';
    const held = set || loose;
    // ONE vine: from the leaves over the load it sags across to the leaves over the handle, and hangs down to his hand. The load
    // hangs from it on a short cord. Short, in plain view, and the link from the thing he hits to the thing that falls is the vine itself
    const top = p.loadY - 46 - 22;
    // the load's sway: a slow breath while it hangs, a hard shake once it is let go
    const sway = set ? Math.sin(t * 1.7 + p.id) * 0.05 : loose ? Math.sin(tr.t * 46) * 0.16 : 0;
    const hx = p.x + (set ? Math.sin(t * 2.1 + p.id * 2) * 3 : loose ? Math.sin(tr.t * 46) * 4 : 0);
    const mx = (p.x + p.loadX) / 2;
    ctx.lineCap = 'round';

    // the link: taut-ish while it holds the load, slack and swinging free once it has let go
    ctx.beginPath();
    ctx.moveTo(p.loadX, top);
    if (held) ctx.quadraticCurveTo(mx, top + 30, p.x, top);
    else ctx.quadraticCurveTo(p.loadX - (p.loadX - p.x) * 0.2, top + 46, p.loadX - (p.loadX - p.x) * 0.3, top + 70);
    vine(ctx, 6);
    if (held) {
      // the short cord the load hangs by
      ctx.strokeStyle = CORD;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(p.loadX, top);
      ctx.lineTo(p.loadX, p.loadY - 44);
      ctx.stroke();
      // two leaves on the link, so it reads as the same vine
      ctx.fillStyle = VINE;
      for (let i = 1; i <= 2; i++) {
        ctx.beginPath();
        ctx.ellipse(p.x + ((p.loadX - p.x) * i) / 3, top + 22 + (i % 2 ? 6 : -2), 9, 4.5, i % 2 ? 0.5 : -0.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    if (p.kind === 'vine') {
      // the handle: it hangs to just over his head-height, a leaf tuft at its end
      const end = p.y - TRAP.handle.low - 34;
      ctx.beginPath();
      ctx.moveTo(p.x, top);
      ctx.quadraticCurveTo(p.x + (hx - p.x) * 2, (top + end) / 2, hx, end);
      vine(ctx, 7);
      ctx.fillStyle = VINE;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.ellipse(hx + (i - 1) * 9, end + 6 + (i === 1 ? 5 : 0), 9, 5, (i - 1) * 0.6, 0, Math.PI * 2);
        ctx.fill();
      }
      const n = Math.max(1, Math.floor((end - top) / 45));
      for (let i = 0; i < n; i++) {
        const side = i % 2 ? 1 : -1;
        ctx.beginPath();
        ctx.ellipse(p.x + (hx - p.x) * ((i + 1) / (n + 1)) + side * 9, top + ((end - top) * (i + 1)) / (n + 1), 8, 4, side * 0.7, 0, Math.PI * 2);
        ctx.fill();
      }
      if (set) glow(ctx, hx, end + 6, t, p.id);
    } else {
      // a tendril tied off to a peg at his feet: taut while set, cut and curled once it has gone
      ctx.beginPath();
      if (held) {
        ctx.moveTo(p.x, top);
        ctx.lineTo(hx, p.y - 8);
      } else {
        ctx.moveTo(p.x, p.y - 8);
        ctx.quadraticCurveTo(p.x + 16, p.y - 30, p.x + 4, p.y - 44);
      }
      vine(ctx, 6);
      ctx.fillStyle = CORD;
      ctx.fillRect(p.x - 5, p.y - 14, 10, 14);
      if (set) glow(ctx, hx, p.y - 50, t, p.id);
    }
    clump(ctx, p.loadX, top - 4, 1);
    clump(ctx, p.x, top - 4, 0.85);
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

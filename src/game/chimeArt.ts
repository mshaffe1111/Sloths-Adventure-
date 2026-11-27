/**
 * chimeArt — the chime stone's look (3-3.md NEW 1 (a); castPlay.types.ts SoundPost, laid by gen2/soundLay.ts). A CODE-DRAWN STAND-IN
 * until ART-W3's painted stone lands (no catalog row has a World 3 chime stone yet): a squat grotto stone sized by its post's box (about
 * Pokey's knee to his chest), a carved ring on its face, and, while it hums (castPlay.ts hums: rung, its call still out), the ring lit
 * and one soft ring of sound spreading from it on the stone's own clock. Three fills and two strokes a stone; nothing off screen.
 */
import type { SoundPost } from './castPlay.types.ts';

const STONE = '#4b5a5c';
const SHADE = '#36423f';
const GROOVE = '#24302e';
const LIT = '#9ef0d8';
/** the hum's ring: how long one spreads (s) and how far past the stone it goes (px) */
const HUM = { period: 1.1, reach: 46 } as const;

/** draw the stage's chime stones; `hums(i)`: stone i is humming (its call out); `seen`: on screen */
export function drawChimes(ctx: CanvasRenderingContext2D, posts: readonly SoundPost[], hums: (i: number) => boolean, t: number,
  seen: (x: number, y: number) => boolean): void {
  posts.forEach((p, i) => {
    const top = p.y - p.h;
    if (!seen(p.x, top)) return;
    const hw = p.w / 2;
    // the stone: wider at the foot, a rounded crown
    ctx.fillStyle = STONE;
    ctx.beginPath();
    ctx.moveTo(p.x - hw, p.y);
    ctx.lineTo(p.x - hw * 0.78, top + p.h * 0.3);
    ctx.quadraticCurveTo(p.x, top - p.h * 0.08, p.x + hw * 0.78, top + p.h * 0.3);
    ctx.lineTo(p.x + hw, p.y);
    ctx.closePath();
    ctx.fill();
    // its shaded side, away from the grotto's glow
    ctx.fillStyle = SHADE;
    ctx.fillRect(p.x + hw * 0.35, top + p.h * 0.35, hw * 0.5, p.h * 0.65);
    // the carved ring (lit while it hums)
    const on = hums(i);
    const cy = top + p.h * 0.48;
    const r = Math.min(hw * 0.5, p.h * 0.2);
    ctx.lineWidth = 4;
    ctx.strokeStyle = on ? LIT : GROOVE;
    ctx.beginPath();
    ctx.arc(p.x, cy, r, 0, Math.PI * 2);
    ctx.stroke();
    if (!on) return;
    // the hum: one ring of sound spreading and fading
    const k = (t % HUM.period) / HUM.period;
    ctx.globalAlpha = 0.6 * (1 - k);
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(p.x, cy, r + k * HUM.reach, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  });
}

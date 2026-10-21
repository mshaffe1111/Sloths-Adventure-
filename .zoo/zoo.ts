// dev harness (not committed): draws the platform painters on a grid so they can be judged up close.
// ?world=1&looks=branch,log&scale=2&w=170&h=28&hero=1&seed=5
import { lookFor } from '../src/game/scenery.ts';
import { setSceneSeed } from '../src/game/sceneSeed.ts';
import { drawThin } from '../src/game/platformArt.ts';
import { drawBounce } from '../src/game/spanArt.ts';
import '../src/game/shelfArt.ts';
import { VARIANTS, type ThinLook } from '../src/game/platformPlan.ts';
import type { Platform } from '../src/game/types.ts';

const q = new URLSearchParams(location.search);
const world = Number(q.get('world') ?? 1);
const scale = Number(q.get('scale') ?? 2);
const PW = Number(q.get('w') ?? 170);
const PH = Number(q.get('h') ?? 28);
const hero = q.get('hero') !== '0';
setSceneSeed(Number(q.get('seed') ?? 5));
const look = lookFor(world);
const looks = (q.get('looks') ?? 'branch,log,stone,ruin').split(',') as ThinLook[];
const CELLW = PW + 70;
const CELLH = 150;
const maxV = Math.max(...looks.map((l) => VARIANTS[l]));
const cv = document.getElementById('cv') as HTMLCanvasElement;
cv.width = CELLW * maxV * scale;
cv.height = CELLH * looks.length * scale;
const ctx = cv.getContext('2d')!;
ctx.scale(scale, scale);

function sky(x: number, y: number) {
  const g = ctx.createLinearGradient(0, y, 0, y + CELLH);
  g.addColorStop(0, look.sky[1]);
  g.addColorStop(1, look.sky[3]);
  ctx.fillStyle = g;
  ctx.fillRect(x, y, CELLW, CELLH);
  ctx.fillStyle = look.hills[0];
  ctx.globalAlpha = 0.6;
  ctx.beginPath();
  ctx.ellipse(x + CELLW * 0.7, y + CELLH, CELLW * 0.5, 70, 0, Math.PI, 0);
  ctx.fill();
  ctx.globalAlpha = 1;
}

function heroStandIn(x: number, y: number) {
  // Pokey's fur (#a66b43) as a plain body, so contrast against the lip can be judged
  ctx.fillStyle = '#a66b43';
  ctx.strokeStyle = '#3b2314';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(x - 17, y - 46, 34, 46, 14);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#d9b48a';
  ctx.beginPath();
  ctx.ellipse(x + 4, y - 32, 10, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#222';
  ctx.beginPath();
  ctx.arc(x + 6, y - 33, 2, 0, Math.PI * 2);
  ctx.fill();
}

looks.forEach((lk, row) => {
  const n = VARIANTS[lk];
  for (let v = 0; v < n; v++) {
    const cx = v * CELLW;
    const cy = row * CELLH;
    sky(cx, cy);
    const p: Platform = { id: 11 + v * 7 + row * 3, x: cx + 35, y: cy + 70, width: PW, height: PH, type: 'solid' };
    if (lk === 'toadstool' || lk === 'parasol' || lk === 'bloom') drawBounce(ctx, p, look, world, lk, v, 1.3, cy + CELLH);
    else drawThin(ctx, p, look, world, { look: lk, variant: v }, 0);
    // the collision line
    if (q.get('line') === '1') {
      ctx.strokeStyle = 'rgba(255,0,0,0.8)';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(p.x - 10, p.y);
      ctx.lineTo(p.x + PW + 10, p.y);
      ctx.stroke();
    }
    if (hero) heroStandIn(p.x + PW * 0.3, p.y);
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.font = '9px monospace';
    ctx.fillText(`${lk} v${v} w${PW} h${PH}`, cx + 4, cy + 10);
  }
});
(window as unknown as { ZOO_DONE: boolean }).ZOO_DONE = true;

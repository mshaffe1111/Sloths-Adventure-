// dev harness (not committed): runs the real renderWorldObjects over a made-up level so ground treatments, joins, steps and pillars
// can be judged in each world.  ?world=1&seed=5&pages=4&w=1280&h=420&scale=1&mode=ground|steps|pillars|all
import { lookFor } from '../src/game/scenery.ts';
import { setSceneSeed } from '../src/game/sceneSeed.ts';
import { renderWorldObjects } from '../src/game/terrain.ts';
import type { Platform } from '../src/game/types.ts';

const q = new URLSearchParams(location.search);
const world = Number(q.get('world') ?? 1);
const seed = Number(q.get('seed') ?? 5);
const scale = Number(q.get('scale') ?? 1);
const VW = Number(q.get('w') ?? 1280);
const VH = Number(q.get('h') ?? 420);
const mode = q.get('mode') ?? 'all';
setSceneSeed(seed);
const look = lookFor(world);

const plats: Platform[] = [];
let id = 100 + world * 7;
const add = (p: Partial<Platform> & { x: number; y: number; width: number; height: number }) => {
  plats.push({ id: id++, type: 'solid', ...p } as Platform);
};
const GY = Math.round(VH * 0.33);
if (mode === 'ground' || mode === 'all') {
  add({ x: 0, y: GY, width: 2200, height: 90, style: 'log' });
  add({ x: 2400, y: GY, width: 800, height: 90, style: 'log' });
  add({ x: 3400, y: GY, width: 700, height: 90, style: 'log' });
  add({ x: 4300, y: GY, width: 1500, height: 90, style: 'log' });
}
const base = mode === 'ground' ? 6000 : mode === 'all' ? 6000 : 0;
if (mode === 'steps' || mode === 'all') {
  // a stair run of 6 steps, then the goal block
  const x0 = base;
  for (let i = 0; i < 6; i++) add({ x: x0 + i * 82, y: GY + 34 * (5 - i) + 34, width: 82, height: 90, style: 'log' });
  add({ x: x0 + 6 * 82, y: GY + 34, width: 520, height: 90, style: 'log' });
  add({ x: x0 - 400, y: GY + 34 * 6, width: 400, height: 90, style: 'log' });
}
if (mode === 'pillars' || mode === 'all') {
  const x0 = mode === 'pillars' ? 0 : base + 1300;
  for (let i = 0; i < 8; i++) add({ x: x0 + 200 + i * 180, y: GY + 20, width: 66 + (i * 13) % 30, height: 170, style: 'ruin' });
}
const total = Math.max(...plats.map((p) => p.x + p.width)) + 100;
const pages = Number(q.get('pages') ?? Math.ceil(total / VW));
const startPage = Number(q.get('page') ?? 0);
const cv = document.getElementById('cv') as HTMLCanvasElement;
cv.width = VW * scale;
cv.height = VH * pages * scale;
const ctx = cv.getContext('2d')!;

function sky(y: number) {
  const g = ctx.createLinearGradient(0, y, 0, y + VH);
  g.addColorStop(0, look.sky[1]);
  g.addColorStop(1, look.sky[3]);
  ctx.fillStyle = g;
  ctx.fillRect(0, y, VW, VH);
  ctx.fillStyle = look.hills[0];
  ctx.globalAlpha = 0.5;
  ctx.beginPath();
  ctx.ellipse(VW * 0.6, y + VH, VW * 0.6, 150, 0, Math.PI, 0);
  ctx.fill();
  ctx.globalAlpha = 1;
}

function hero(x: number, y: number) {
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
}

for (let k = 0; k < pages; k++) {
  const camX = (startPage + k) * VW;
  ctx.save();
  ctx.scale(scale, scale);
  ctx.translate(0, k * VH);
  ctx.beginPath();
  ctx.rect(0, 0, VW, VH);
  ctx.clip();
  sky(0);
  ctx.save();
  ctx.translate(-camX, 0);
  renderWorldObjects(ctx, world, plats, [], [], { x: camX, y: 0, viewportWidth: VW, viewportHeight: VH }, 1.3);
  ctx.restore();
  if (q.get('hero') !== '0') {
    // the hero on the first ground surface under x
    for (const p of plats) if (p.x <= camX + 200 && p.x + p.width > camX + 200) hero(200, p.y);
  }
  ctx.fillStyle = 'rgba(0,0,0,0.65)';
  ctx.font = '11px monospace';
  ctx.fillText(`world ${world} seed ${seed} x ${camX}`, 6, 12);
  ctx.restore();
}
(window as unknown as { ZOO_DONE: boolean }).ZOO_DONE = true;

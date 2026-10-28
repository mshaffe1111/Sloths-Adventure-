/**
 * meecaArt — the pictures of Meeca's stage (5-M), built to the approved mock-ups (2026-10-26): Meeca herself (meeca-standard's run,
 * jump, climb and crouch, meeca-carve at a trunk, meeca-blanket at the end), the column (Lieutenant Pell and the General's soldiers,
 * pell-anim / soldier-anim, with their lanterns), each watching guard's ring (amber, filling while his back is turned; full and
 * flashing as he turns: the tell), her place in line (a dashed pink outline of her), the trunks with their words cut in the scratch
 * alphabet letter by letter and the pink hold-to-carve meter, the ferns, her thoughts (a pink cloud, never Dot's parchment), the
 * dusk grade, the "On the March North" card and the story box of the ending.
 *
 * World pieces draw in world units; the overlays (`drawScreen*`) in CSS px. Every sheet draws a plain stand-in while it loads.
 */
import { trackAtlas } from './atlasLoader.ts';
import { makeCreatureAnim } from './creatureAnim.ts';
import { PELL_ANIM, PELL_ANIM_UP, PELL_ANIM_URL, PELL_K, PELL_SEQ } from './pellAnimData.ts';
import { SOLDIER_ANIM, SOLDIER_ANIM_UP, SOLDIER_ANIM_URL, SOLDIER_K, SOLDIER_SEQ } from './soldierAnimData.ts';
import { MEECA_CARVE_FPS, MEECA_CARVE_FRAMES, MEECA_CARVE_SEQ, MEECA_CARVE_URL } from './meecaCarveData.ts';
import { MEECA_BLANKET_FRAMES, MEECA_BLANKET_UP, MEECA_BLANKET_URL } from './meecaBlanketData.ts';
import { MEECA_FRAMES, MEECA_STAND_H } from './meecaStandardData.ts';
import { drawMeecaFrame, jennifurFrame, MEECA_UNITS } from './jennifurSprite.ts';
import { drawScratch, drawW5, w5ArtReady } from './w5Art.ts';
import { carvingTrunk, drawCarving, drawFern } from './w5Look.ts';
import { shakyLetters } from './w5Kit.ts';
import { LANE_UP, MEECA_G, TELL, TURN_BACK, type MeecaStage, type MeecaTrunk } from './meecaStage.ts';
import { MEECA_CARD, MEECA_ENDING } from './meecaLines.ts';
import type { Guard, MeecaPlay } from './meecaPlay.ts';
import type { PlayerState as Player } from './types.ts';

const INK = '#3a2414';
type Box = { x0: number; y0: number; x1: number; y1: number };
/** the box (world units) the words of a tree cover */
export function wordsBox(tr: MeecaTrunk): Box {
  const w = Math.max(...tr.lines.map((l) => [...l].reduce((a, ch) => a + cAdv(ch) * tr.size, 0)));
  return { x0: tr.textX - w / 2 - 12, y0: tr.textY - tr.size * 0.75, x1: tr.textX + w / 2 + 12, y1: tr.textY + (tr.lines.length - 1) * tr.size * 1.22 + tr.size * 0.8 };
}
const PINK = '#f58ab4';
const K = MEECA_UNITS / MEECA_STAND_H;

export const PELL_CLIPS = makeCreatureAnim(PELL_ANIM_URL, PELL_ANIM, PELL_SEQ, PELL_ANIM_UP);
export const SOLDIER_CLIPS = makeCreatureAnim(SOLDIER_ANIM_URL, SOLDIER_ANIM, SOLDIER_SEQ, SOLDIER_ANIM_UP);

/** a sheet of Meeca's own (carving, the blanket), loaded the first time it is asked for */
function sheet(url: string) {
  let img: HTMLImageElement | null = null;
  let ready = false;
  return () => {
    if (!img && typeof Image !== 'undefined') {
      const im = new Image();
      img = im;
      trackAtlas(im, url, () => { ready = true; }, () => { img = null; });
    }
    return ready ? img : null;
  };
}
const carveSheet = sheet(MEECA_CARVE_URL);
const blanketSheet = sheet(MEECA_BLANKET_URL);

/** start loading everything the stage draws, as it starts */
export function warmMeecaArt() {
  PELL_CLIPS.ready();
  SOLDIER_CLIPS.ready();
  carveSheet();
  blanketSheet();
}

// ───────────────────────────── Meeca ─────────────────────────────

/** which of her frames she shows (the tests read it) */
export function meecaPose(p: Player, mc: MeecaPlay, t: number): string {
  if (mc.wrapped) return 'blanket';
  if (mc.carvingNow || mc.phase === 'card') return 'carve';
  if (mc.phase === 'caught') return mc.laneK > 0.5 || Math.abs(p.vx) > 5 ? `walk_${Math.floor(t * 8) % 8}` : 'alarm';
  if (p.climbing) return `climb_${Math.floor(Math.abs(p.y) / 9) % 6}`;
  if (!p.grounded) return p.vy < 0 ? 'jump_up' : 'jump_fall';
  if (p.ducking) return 'crouch';
  const v = Math.abs(p.vx);
  if (v > 150) return `run_${Math.floor(p.walkCycle / 1.7) % 7}`;
  if (v > 8) return `walk_${Math.floor(p.walkCycle / 1.05) % 8}`;
  return jennifurFrame('idle', t);
}

/** Meeca, the player, with her feet at (p.x, p.y): a little up on the column's lane while she is in line */
export function drawMeecaHero(ctx: CanvasRenderingContext2D, p: Player, mc: MeecaPlay, t: number) {
  const pose = meecaPose(p, mc, t);
  const lift = LANE_UP * mc.laneK;
  ctx.save();
  ctx.translate(p.x, p.y - lift);
  // her shadow (on the lane, or under her on the path)
  ctx.fillStyle = 'rgba(20, 8, 30, 0.32)';
  ctx.beginPath();
  ctx.ellipse(0, 1, p.ducking ? 26 : 20, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  const flip = p.facing < 0;
  if (flip) ctx.scale(-1, 1);
  let ok = false;
  if (pose === 'carve') {
    const img = carveSheet();
    const f = MEECA_CARVE_FRAMES[MEECA_CARVE_SEQ[Math.floor(t * MEECA_CARVE_FPS) % MEECA_CARVE_SEQ.length]];
    if (img && f) {
      ctx.drawImage(img, f.x, f.y, f.w, f.h, -f.ax * K, -f.ay * K, f.w * K, f.h * K);
      ok = true;
    } else ok = drawMeecaFrame(ctx, 'pickup', 1, 1, flip);
  } else if (pose === 'blanket') {
    const img = blanketSheet();
    const f = MEECA_BLANKET_FRAMES.meeca_blanket;
    const k = K / MEECA_BLANKET_UP;
    if (img && f) {
      ctx.drawImage(img, f.x, f.y, f.w, f.h, -f.ax * k, -f.ay * k, f.w * k, f.h * k);
      ok = true;
    }
  } else if (MEECA_FRAMES[pose]) ok = drawMeecaFrame(ctx, pose, 1, 1, flip);
  if (!ok) {
    // (the sheet is on its way: a plain pink figure)
    ctx.fillStyle = '#e9a0b8';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-16, p.ducking ? -48 : -86, 32, p.ducking ? 48 : 86, 14);
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();
}

// ───────────────────────────── the column ─────────────────────────────

function guardFrame(kind: 'pell' | 'soldier', coat: 'a' | 'b', g: Guard, t: number): string | undefined {
  const A = kind === 'pell' ? PELL_CLIPS : SOLDIER_CLIPS;
  const s = (n: string) => (kind === 'pell' ? n : `${n}_${coat}`);
  switch (g.pose) {
    case 'march':
    case 'walk':
      return A.loop(s('march'), t + (kind === 'pell' ? 0 : g.x * 0.003), 12);
    case 'turn':
      return A.at(s('turn'), g.poseT / TELL);
    case 'look':
      return kind === 'pell' ? A.ping('lookHold', t, 8) : A.ping(s('hold'), t, 8);
    case 'back':
      return A.at(kind === 'pell' ? 'turnBack' : s('back'), g.poseT / TURN_BACK);
    case 'catch':
      return kind === 'pell' ? A.at('catch', g.poseT / 1.0) : A.ping(s('idle'), t, 10);
    case 'offer':
      return kind === 'pell' ? A.at('offer', g.poseT / 1.8) : A.ping(s('idle'), t, 10);
    default:
      return A.ping(s('idle'), t + g.x * 0.002, 10);
  }
}

/** the lantern's light: on the ground and round the lantern (hidden behind him while he looks back) */
function lanternGlow(ctx: CanvasRenderingContext2D, g: Guard, k = 1) {
  const back = g.pose === 'look' || (g.pose === 'turn' && g.poseT > TELL * 0.6) || (g.pose === 'back' && g.poseT < TURN_BACK * 0.5);
  const lx = g.x + g.face * 26, ly = g.y - 40;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const pool = ctx.createRadialGradient(g.x + g.face * 14, g.y + 2, 0, g.x + g.face * 14, g.y + 2, 90 * k);
  pool.addColorStop(0, 'rgba(255, 190, 110, 0.22)');
  pool.addColorStop(1, 'rgba(255, 190, 110, 0)');
  ctx.fillStyle = pool;
  ctx.fillRect(g.x - 110, g.y - 40, 220, 70);
  if (!back) {
    const r = 64 * k;
    const gl = ctx.createRadialGradient(lx, ly, 0, lx, ly, r);
    gl.addColorStop(0, 'rgba(255, 214, 140, 0.5)');
    gl.addColorStop(0.4, 'rgba(255, 180, 90, 0.2)');
    gl.addColorStop(1, 'rgba(255, 170, 80, 0)');
    ctx.fillStyle = gl;
    ctx.fillRect(lx - r, ly - r, r * 2, r * 2);
  }
  ctx.restore();
}

export function drawGuard(ctx: CanvasRenderingContext2D, kind: 'pell' | 'soldier', coat: 'a' | 'b', g: Guard, t: number) {
  ctx.save();
  ctx.translate(g.x, g.y);
  ctx.fillStyle = 'rgba(20, 8, 30, 0.3)';
  ctx.beginPath();
  ctx.ellipse(0, 1, 24, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  if (g.face < 0) ctx.scale(-1, 1);
  const name = guardFrame(kind, coat, g, t);
  const A = kind === 'pell' ? PELL_CLIPS : SOLDIER_CLIPS;
  if (!(name && A.draw(ctx, name, kind === 'pell' ? PELL_K : SOLDIER_K))) {
    ctx.fillStyle = kind === 'pell' ? '#7d7a52' : coat === 'a' ? '#6f7448' : '#76703f';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-20, -90, 40, 90, 16);
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();
}

/** the column, back to front (the soldiers furthest ahead first), each with his lantern's light */
export function drawColumn(ctx: CanvasRenderingContext2D, mc: MeecaPlay, view: { x0: number; x1: number }, t: number) {
  const st = mc.st;
  for (let i = st.marchers.length - 1; i >= 0; i--) {
    const g = mc.guards[i];
    if (g.x < view.x0 - 160 || g.x > view.x1 + 160) continue;
    lanternGlow(ctx, g);
    const m = st.marchers[i];
    drawGuard(ctx, m.kind, m.coat, g, t);
  }
}

/** a watching guard's ring over his head: amber filling while his back is turned, full and flashing as he turns, his eye open as he looks */
export function drawWatchRing(ctx: CanvasRenderingContext2D, x: number, y: number, ph: 'away' | 'turn' | 'look' | 'back', k: number, t: number, s = 1) {
  const r = 14 * s;
  ctx.save();
  ctx.translate(x, y);
  const hot = ph === 'turn' || ph === 'look';
  const pulse = ph === 'turn' ? 1 + 0.12 * Math.sin(t * 22) : 1;
  ctx.scale(pulse, pulse);
  if (hot) {
    const gl = ctx.createRadialGradient(0, 0, r * 0.5, 0, 0, r * 2.4);
    gl.addColorStop(0, ph === 'look' ? 'rgba(255, 110, 80, 0.55)' : 'rgba(255, 180, 70, 0.55)');
    gl.addColorStop(1, 'rgba(255, 150, 60, 0)');
    ctx.fillStyle = gl;
    ctx.beginPath();
    ctx.arc(0, 0, r * 2.4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = 'rgba(30, 14, 40, 0.85)';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2 * s;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.lineCap = 'round';
  ctx.lineWidth = 3.6 * s;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
  ctx.beginPath();
  ctx.arc(0, 0, r - 3.5 * s, 0, Math.PI * 2);
  ctx.stroke();
  const frac = ph === 'away' ? k : ph === 'back' ? 1 - k : 1;
  ctx.strokeStyle = ph === 'look' ? '#ff6b4a' : frac > 0.8 ? '#ffb347' : '#ffcf6e';
  ctx.beginPath();
  ctx.arc(0, 0, r - 3.5 * s, -Math.PI / 2, -Math.PI / 2 + frac * Math.PI * 2);
  ctx.stroke();
  // his eye: shut while his back is turned, opening as he turns, open as he looks
  const open = ph === 'look' ? 1 : ph === 'turn' ? k : 0;
  ctx.strokeStyle = '#fff3d6';
  ctx.fillStyle = '#fff3d6';
  ctx.lineWidth = 1.8 * s;
  const ew = 6 * s;
  if (open < 0.2) {
    ctx.beginPath();
    ctx.arc(0, -3 * s, ew, 0.25 * Math.PI, 0.75 * Math.PI);
    ctx.stroke();
    for (const a of [0.35, 0.5, 0.65]) {
      const px = ew * Math.cos(a * Math.PI), py = -3 * s + ew * Math.sin(a * Math.PI);
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px + 2.2 * s * Math.cos(a * Math.PI), py + 2.2 * s * Math.sin(a * Math.PI));
      ctx.stroke();
    }
  } else {
    ctx.beginPath();
    ctx.ellipse(0, 0, ew, ew * 0.62 * open, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = ph === 'look' ? '#ff6b4a' : '#ffcf6e';
    ctx.beginPath();
    ctx.arc(0, 0, 2.2 * s * open, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

let placeCache: { c: HTMLCanvasElement; ax: number; ay: number } | null = null;
/** a pink, see-through copy of her standing frame (for her place in line), made once the sheet is in */
function placeSilhouette(): { c: HTMLCanvasElement; ax: number; ay: number } | null {
  if (placeCache) return placeCache;
  if (typeof document === 'undefined') return null;
  try {
    const f = MEECA_FRAMES.idle;
    const c = document.createElement('canvas');
    const w = Math.ceil(f.w * K) + 8, h = Math.ceil(f.h * K) + 8;
    c.width = w * 2;
    c.height = h * 2;
    const x = c.getContext('2d');
    if (!x) return null;
    x.scale(2, 2);
    x.translate(4 + f.ax * K, 4 + f.ay * K);
    if (!drawMeecaFrame(x, 'idle', 1, 1, false)) return null;
    x.setTransform(1, 0, 0, 1, 0, 0);
    x.globalCompositeOperation = 'source-in';
    x.fillStyle = 'rgba(255, 175, 215, 0.55)';
    x.fillRect(0, 0, c.width, c.height);
    placeCache = { c, ax: 4 + f.ax * K, ay: 4 + f.ay * K };
    return placeCache;
  } catch {
    return null;
  }
}

/** her place in the line: a dashed pink outline of her, and a dashed ring under it */
export function drawPlace(ctx: CanvasRenderingContext2D, x: number, t: number) {
  const y = MEECA_G - LANE_UP;
  const sil = placeSilhouette();
  ctx.save();
  ctx.globalAlpha = 0.75 + 0.2 * Math.sin(t * 3);
  if (sil) ctx.drawImage(sil.c, x - sil.ax, y - sil.ay, sil.c.width / 2, sil.c.height / 2);
  ctx.setLineDash([5, 5]);
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = 'rgba(255, 190, 222, 0.95)';
  ctx.beginPath();
  ctx.ellipse(x, y - 1, 30, 8, 0, 0, Math.PI * 2);
  ctx.stroke();
  if (!sil) {
    ctx.beginPath();
    ctx.roundRect(x - 15, y - 84, 30, 82, 13);
    ctx.stroke();
  }
  ctx.restore();
}

// ───────────────────────────── the trunks and the words ─────────────────────────────

const cAdv = (ch: string) => (ch === ' ' ? 0.5 : ch === '.' || ch === ',' ? 0.42 : ch === "'" ? 0.34 : ch === '!' ? 0.46 : 0.82);
/** the seed a trunk's words shake by (the first is 5-1's own: w5Play.ts draws its carving i at i * 13 + 5) */
export const trunkSeed = (tr: MeecaTrunk) => tr.index * 13 + 5;

/**
 * A trunk and its words. `cut` characters are cut (a fraction for the one under the pin, revealed left to right); the rest show as a
 * faint dashed guide of what she means to write. Returns the middle of the letter being cut (for the meter), or null.
 */
export function drawTrunk(ctx: CanvasRenderingContext2D, tr: MeecaTrunk, cut: number): { x: number; y: number; k: number; frac: number } | null {
  const size = tr.size;
  // the painted trunk, sized as w5Look sizes a carving's (or its drawn stand-in while the art loads)
  const c = { x: tr.textX, y: tr.textY, lines: [...tr.lines], size, trunk: { ground: tr.ground, w: tr.w, h: tr.h } };
  const tp = carvingTrunk(c);
  if (!(tp && w5ArtReady() && drawW5(ctx, tp.piece, c.x, tr.ground, tp.w, { flip: tp.flip }))) drawCarving(ctx, { ...c, lines: [] }, 0);
  const lead = size * 1.22;
  const seed = trunkSeed(tr);
  let n = 0;
  let at: { x: number; y: number; k: number; frac: number } | null = null;
  tr.lines.forEach((line, li) => {
    const letters = shakyLetters(line, seed + li * 7);
    const total = [...line].reduce((a, ch) => a + cAdv(ch) * size, 0);
    const lx0 = tr.textX + Math.sin(li * 2.3 + seed) * size * 0.14;
    const ly0 = tr.textY + li * lead;
    const rot = 0.035 + Math.sin(li * 1.7 + seed * 0.3) * 0.04;
    ctx.save();
    ctx.translate(lx0, ly0);
    ctx.rotate(rot);
    let lx = -total / 2;
    letters.forEach((l, i) => {
      const adv = cAdv(l.ch) * size;
      if (l.ch !== ' ') {
        const k = size * l.k;
        const off = cAdv(l.ch) < 0.5 ? -(1.4 * k) / 6 : 0;
        const cx = lx + adv / 2 + l.dx + off;
        const cy = l.dy * 0.8 + (i % 2 ? 1 : -1) * size * 0.03;
        const stc = Math.max(0, Math.min(1, cut - n));
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(l.rot * 1.3);
        if (stc <= 0) {
          ctx.setLineDash([size * 0.06, size * 0.12]);
          drawScratch(ctx, l.ch, 0, 0, k, 0.09, 'rgba(255, 236, 214, 0.38)', 0.55);
        } else {
          if (stc < 1) {
            ctx.beginPath();
            ctx.rect(-k * 0.6, -k, k * 1.2 * stc, k * 2);
            ctx.clip();
          }
          drawScratch(ctx, l.ch, k * 0.05, k * 0.07, k, 0.1, 'rgba(38, 20, 10, 0.85)', 1.5);
          drawScratch(ctx, l.ch, 0, 0, k, 0.09, '#f7e6c2', 1.25);
          if ((i * 7 + li * 3 + seed) % 5 === 1) drawScratch(ctx, l.ch, k * 0.07, -k * 0.04, k * 1.02, 0.16, 'rgba(247, 230, 194, 0.55)', 0.7);
        }
        ctx.restore();
        if (stc < 1 && !at) {
          const c = Math.cos(rot), s = Math.sin(rot);
          at = { x: lx0 + cx * c - cy * s, y: ly0 + cx * s + cy * c, k, frac: stc };
        }
        n++;
      }
      lx += adv;
    });
    ctx.restore();
  });
  return at;
}

/** the hold-to-carve meter: a ring in Meeca's pink round the letter being cut, filling as she holds */
export function drawCarveMeter(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, frac: number) {
  ctx.save();
  ctx.lineCap = 'round';
  ctx.strokeStyle = 'rgba(30, 12, 30, 0.6)';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255, 243, 214, 0.3)';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
  const a1 = -Math.PI / 2 + frac * Math.PI * 2;
  const g = ctx.createRadialGradient(x + r * Math.cos(a1), y + r * Math.sin(a1), 0, x + r * Math.cos(a1), y + r * Math.sin(a1), 14);
  g.addColorStop(0, 'rgba(255, 170, 210, 0.9)');
  g.addColorStop(1, 'rgba(255, 170, 210, 0)');
  ctx.fillStyle = g;
  ctx.fillRect(x + r * Math.cos(a1) - 14, y + r * Math.sin(a1) - 14, 28, 28);
  for (const [c, w] of [[INK, 6.5], [PINK, 4], ['#ffd3e6', 1.5]] as const) {
    ctx.strokeStyle = c;
    ctx.lineWidth = w;
    ctx.beginPath();
    ctx.arc(x, y, c === '#ffd3e6' ? r - 1 : r, -Math.PI / 2, a1);
    ctx.stroke();
  }
  ctx.restore();
}

/** wood shavings at the pin while she cuts */
function shavings(ctx: CanvasRenderingContext2D, x: number, y: number, t: number) {
  ctx.save();
  [[-6, -4, 0.5], [5, -7, 1.2], [8, 2, 2.1], [-3, 6, 2.9], [11, -1, 0.2]].forEach(([dx, dy, r], i) => {
    const j = Math.sin(t * 17 + i * 2) * 2;
    ctx.save();
    ctx.translate(x + dx + j, y + dy - j);
    ctx.rotate(r + t * 3);
    ctx.fillStyle = '#f7e6c2';
    ctx.strokeStyle = 'rgba(58,36,20,.8)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.ellipse(0, 0, 2.6, 1.1, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  });
  ctx.restore();
}

/** everything behind her: the trunks and their words, the column, the guards' rings, her place */
export function drawMeecaBack(ctx: CanvasRenderingContext2D, mc: MeecaPlay, view: { x0: number; x1: number }, t: number) {
  const st = mc.st;
  st.trunks.forEach((tr, i) => {
    if (tr.x + tr.w < view.x0 - 100 || tr.x - tr.w > view.x1 + 100) return;
    const cut = mc.cutChars(i);
    const at = drawTrunk(ctx, tr, cut);
    if (at && i === mc.done && (mc.carvingNow || (cut > 0 && cut % 1 > 0.01))) {
      if (mc.carvingNow) shavings(ctx, at.x - at.k * 0.15, at.y + at.k * 0.25, t);
      drawCarveMeter(ctx, at.x, at.y, tr.size * 0.78, at.frac);
    }
  });
  if (mc.phase === 'play' && !mc.inLine) drawPlace(ctx, mc.slotX, t);
  drawColumn(ctx, mc, view, t);
}

/** in front of her: the ferns (she crouches into them) and the rings over the watching guards */
export function drawMeecaFront(ctx: CanvasRenderingContext2D, mc: MeecaPlay, view: { x0: number; x1: number }, t: number) {
  for (const f of mc.st.ferns) if (f.x > view.x0 - 140 && f.x < view.x1 + 140) drawFern(ctx, f.x, f.y + 14, f.w, t);
  if (mc.phase !== 'play') return;
  const s = mc.st.stretches[Math.min(mc.done, mc.st.stretches.length - 1)];
  for (const w of s.watch) {
    const st = mc.watchOf(w.who);
    if (!st) continue;
    const g = mc.guards[w.who];
    drawWatchRing(ctx, g.x + 2, g.y - 118, st.ph, st.k, t, 1.25);
  }
}

// ───────────────────────────── the overlays (CSS px) ─────────────────────────────

/** the stage's special light: the violet sky pressed down, a low warm glow, a soft vignette (the mock-ups' grade, lighter) */
export function drawDuskGrade(ctx: CanvasRenderingContext2D, W: number, H: number) {
  ctx.save();
  ctx.globalCompositeOperation = 'multiply';
  const lg = ctx.createLinearGradient(0, 0, 0, H);
  lg.addColorStop(0, '#d6c2f0');
  lg.addColorStop(0.55, '#efdcec');
  lg.addColorStop(1, '#c8b2d2');
  ctx.fillStyle = lg;
  ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = 'source-over';
  const rg = ctx.createRadialGradient(W / 2, H * 0.45, Math.min(W, H) * 0.3, W / 2, H * 0.5, Math.max(W, H) * 0.75);
  rg.addColorStop(0, 'rgba(20, 8, 30, 0)');
  rg.addColorStop(1, 'rgba(20, 8, 30, 0.38)');
  ctx.fillStyle = rg;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

function wrap(ctx: CanvasRenderingContext2D, text: string, max: number): string[] {
  const out: string[] = [];
  let line = '';
  for (const w of text.split(' ')) {
    const tryL = line ? `${line} ${w}` : w;
    if (ctx.measureText(tryL).width > max && line) {
      out.push(line);
      line = w;
    } else line = tryL;
  }
  if (line) out.push(line);
  return out;
}

/** a cloud's outline, around (cx, cy) */
function cloud(ctx: CanvasRenderingContext2D, cx: number, cy: number, rx: number, ry: number) {
  const n = Math.max(9, Math.round((rx + ry) / 13));
  const pts: Array<[number, number]> = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    pts.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)]);
  }
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 0; i < n; i++) {
    const p = pts[i], q = pts[(i + 1) % n];
    const mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2;
    // each bump bulges out from the middle
    const ox = mx - cx, oy = my - cy;
    const l = Math.hypot(ox, oy) || 1;
    const b = Math.hypot(q[0] - p[0], q[1] - p[1]) * 0.42;
    ctx.quadraticCurveTo(mx + (ox / l) * b, my + (oy / l) * b, q[0], q[1]);
  }
  ctx.closePath();
}

/**
 * Her thought: a soft pink cloud with a trail of puffs down to her head, over her (or beside, when there is no room above). Kept on
 * screen and under the HUD's band (`top`). Returns the box it took, for the tests.
 */
export function drawThought(ctx: CanvasRenderingContext2D, text: string, headX: number, headY: number, W: number, H: number, top: number, a: number, avoid?: Box | null) {
  const fs = W < 360 ? 14 : 15;
  ctx.save();
  ctx.font = `600 ${fs}px Fredoka, sans-serif`;
  const maxW = Math.min(250, W - 70);
  let lines = wrap(ctx, text, maxW - 36);
  // balanced: the narrowest box that keeps the same number of lines (no word left alone on the last)
  for (let mw = maxW - 36; mw > 60; mw -= 6) {
    const l2 = wrap(ctx, text, mw);
    if (l2.length > lines.length) break;
    lines = l2;
  }
  const tw = Math.max(...lines.map((l) => ctx.measureText(l).width));
  const w = Math.max(150, tw + 54);
  const h = lines.length * fs * 1.25 + 34;
  let bx = headX - w * 0.45;
  bx = Math.max(10, Math.min(W - w - 10, bx));
  let by = headY - 46 - h;
  // never over the words she is cutting: above them, or beside them
  if (avoid && bx < avoid.x1 && bx + w > avoid.x0 && by < avoid.y1 && by + h > avoid.y0) {
    if (avoid.y0 - h - 10 >= top) by = avoid.y0 - h - 10;
    else if (avoid.x1 + 10 + w <= W - 8) bx = avoid.x1 + 10;
    else if (avoid.x0 - 10 - w >= 8) bx = avoid.x0 - 10 - w;
  }
  if (by < top) by = Math.min(H - h - 10, Math.max(top, headY + 10));
  ctx.globalAlpha = a;
  const cx = bx + w / 2, cy = by + h / 2;
  // the trail of puffs to her head
  ctx.fillStyle = '#fdeef6';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.2;
  const tailY = headY - 6;
  [0.25, 0.55, 0.82].forEach((k, i) => {
    const px = cx + (headX - cx) * (0.45 + k * 0.5);
    const py = (by + h * (by < headY ? 0.95 : 0.05)) + (tailY - (by + h * (by < headY ? 0.95 : 0.05))) * k;
    ctx.beginPath();
    ctx.arc(px, py, [6.5, 4.8, 3.2][i], 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });
  ctx.save();
  ctx.translate(0, 3);
  cloud(ctx, cx, cy, w / 2 - 6, h / 2 - 6);
  ctx.strokeStyle = 'rgba(30, 10, 30, 0.35)';
  ctx.lineWidth = 6;
  ctx.stroke();
  ctx.restore();
  cloud(ctx, cx, cy, w / 2 - 6, h / 2 - 6);
  const g = ctx.createLinearGradient(0, by, 0, by + h);
  g.addColorStop(0, '#fff6fa');
  g.addColorStop(1, '#f6d9ea');
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.4;
  ctx.lineJoin = 'round';
  ctx.stroke();
  ctx.fillStyle = '#5a2342';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  lines.forEach((l, i) => ctx.fillText(l, cx, cy + (i - (lines.length - 1) / 2) * fs * 1.25 + 1));
  ctx.restore();
  return { x: bx, y: by, w, h };
}

/** Pell's own few words beside him (a catch): a plain grey speech tag, his story colour */
export function drawPellSay(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, W: number, top: number) {
  ctx.save();
  ctx.font = `600 13px Fredoka, sans-serif`;
  const lines = wrap(ctx, text, Math.min(200, W - 40));
  const w = Math.max(...lines.map((l) => ctx.measureText(l).width)) + 22;
  const h = lines.length * 16 + 12;
  const bx = Math.max(8, Math.min(W - w - 8, x - w / 2));
  const by = Math.max(top, y - h);
  ctx.fillStyle = 'rgba(42, 30, 48, 0.9)';
  ctx.strokeStyle = '#9aa3ad';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(bx, by, w, h, 10);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#f3efe6';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  lines.forEach((l, i) => ctx.fillText(l, bx + w / 2, by + 6 + 8 + i * 16));
  ctx.restore();
}

function inked(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, stroke: number, fill: string, ink: string) {
  ctx.lineJoin = 'round';
  ctx.strokeStyle = ink;
  ctx.lineWidth = stroke;
  ctx.strokeText(text, x, y);
  ctx.fillStyle = fill;
  ctx.fillText(text, x, y);
}

/** the "On the March North" card over the opening shot: the game's chapter card in dusk violet (upright on the top half, sideways on the left) */
export function drawTitleCard(ctx: CanvasRenderingContext2D, W: number, H: number, a: number, t: number) {
  if (a <= 0) return;
  const land = W > H;
  ctx.save();
  ctx.globalAlpha = a;
  const sh = land ? ctx.createLinearGradient(0, 0, W, 0) : ctx.createLinearGradient(0, 0, 0, H);
  sh.addColorStop(0, 'rgba(14, 6, 22, 0.9)');
  sh.addColorStop(land ? 0.42 : 0.4, 'rgba(14, 6, 22, 0.72)');
  sh.addColorStop(land ? 0.7 : 0.62, 'rgba(14, 6, 22, 0)');
  ctx.fillStyle = sh;
  ctx.fillRect(0, 0, W, H);
  const cx = land ? W * 0.26 : W / 2;
  const cy = land ? H * 0.5 : H * 0.26;
  const big = Math.min(land ? 56 : 52, (land ? W * 0.5 : W) / 7.2, H / (land ? 6.4 : 14));
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `700 ${Math.round(big * 0.25)}px Fredoka, sans-serif`;
  ctx.fillStyle = '#ffb9d8';
  const kick = MEECA_CARD.kicker.split('').join(' ');
  ctx.fillText(kick, cx, cy - big * 1.55);
  ctx.font = `700 ${Math.round(big)}px Fredoka, sans-serif`;
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur = 24;
  MEECA_CARD.title.forEach((l, i) => inked(ctx, l, cx, cy - big * 0.5 + i * big * 1.05, big * 0.14, '#fff3c4', 'rgba(34, 14, 40, 0.94)'));
  ctx.shadowBlur = 0;
  ctx.font = `500 ${Math.round(Math.max(13, big * 0.3))}px 'Atkinson Read', sans-serif`;
  ctx.fillStyle = '#f1def0';
  MEECA_CARD.sub.forEach((l, i) => ctx.fillText(l, cx, cy + big * 1.3 + i * big * 0.44));
  ctx.font = `700 ${Math.round(Math.max(11, big * 0.23))}px Fredoka, sans-serif`;
  ctx.globalAlpha = a * (0.55 + 0.25 * Math.sin(t * 3));
  ctx.fillStyle = 'rgba(255, 220, 240, 1)';
  ctx.fillText(MEECA_CARD.tap.split('').join(' '), cx, cy + big * 2.55);
  ctx.restore();
}

/** the ending's story box, in dusk violet (StoryPlayer's .sp-box), with the speaker's name pill, the dots and Next */
export function drawSceneBox(ctx: CanvasRenderingContext2D, W: number, H: number, line: number, a: number, t: number) {
  const l = MEECA_ENDING[line];
  if (!l || a <= 0) return;
  const land = W > H;
  const pad = land ? 14 : 12;
  const bw = land ? Math.min(640, W - 2 * pad) : W - 2 * pad;
  const fs = land ? (H < 360 ? 16 : 18) : W < 360 ? 17 : 19;
  ctx.save();
  ctx.globalAlpha = a;
  ctx.font = `500 ${fs}px 'Atkinson Read', sans-serif`;
  const lines = wrap(ctx, l.text, bw - 34);
  const bh = 26 + lines.length * fs * 1.45 + 44;
  const bx = (W - bw) / 2;
  const by = H - bh - (land ? 10 : 28);
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 30;
  const g = ctx.createLinearGradient(0, by, 0, by + bh);
  g.addColorStop(0, 'rgba(48, 28, 62, 0.94)');
  g.addColorStop(1, 'rgba(22, 12, 32, 0.96)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.roundRect(bx, by, bw, bh, 20);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = 'rgba(255, 214, 235, 0.5)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  // the name
  const dot = l.who === 'Meeca' ? PINK : '#9aa3ad';
  ctx.font = `700 14px Fredoka, sans-serif`;
  const nw = ctx.measureText(l.who).width + 40;
  const ng = ctx.createLinearGradient(0, by - 14, 0, by + 14);
  ng.addColorStop(0, '#4a2e5a');
  ng.addColorStop(1, '#2a1834');
  ctx.fillStyle = ng;
  ctx.beginPath();
  ctx.roundRect(bx + 14, by - 14, nw, 28, 14);
  ctx.fill();
  ctx.strokeStyle = dot;
  ctx.stroke();
  ctx.fillStyle = dot;
  ctx.beginPath();
  ctx.arc(bx + 30, by, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff6dc';
  ctx.textBaseline = 'middle';
  ctx.fillText(l.who, bx + 42, by + 1);
  // the words
  ctx.font = `500 ${fs}px 'Atkinson Read', sans-serif`;
  ctx.fillStyle = '#fbf4de';
  ctx.textBaseline = 'alphabetic';
  lines.forEach((s, i) => ctx.fillText(s, bx + 16, by + 26 + fs + i * fs * 1.45));
  // the dots and Next
  const fy = by + bh - 22;
  let dx = bx + 16;
  for (let i = 0; i < MEECA_ENDING.length; i++) {
    const on = i === line;
    ctx.fillStyle = on ? '#ffd23a' : i < line ? 'rgba(255, 190, 220, 0.55)' : 'rgba(255,255,255,0.22)';
    ctx.beginPath();
    ctx.roundRect(dx, fy - 3, on ? 22 : 6, 6, 3);
    ctx.fill();
    dx += (on ? 22 : 6) + 6;
  }
  const label = line === MEECA_ENDING.length - 1 ? 'Done' : 'Next ›';
  ctx.font = `700 15px Fredoka, sans-serif`;
  const lw = ctx.measureText(label).width + 36;
  const nx = bx + bw - lw - 14;
  ctx.fillStyle = '#a85c00';
  ctx.beginPath();
  ctx.roundRect(nx, fy - 14 + 3, lw, 28, 14);
  ctx.fill();
  const bg = ctx.createLinearGradient(0, fy - 14, 0, fy + 14);
  bg.addColorStop(0, '#ffc247');
  bg.addColorStop(1, '#ff9a14');
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.roundRect(nx, fy - 14 + 0.5 * Math.sin(t * 4), lw, 28, 14);
  ctx.fill();
  ctx.fillStyle = '#3b2200';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, nx + lw / 2, fy + 0.5 * Math.sin(t * 4));
  ctx.restore();
}

/** the blanket held out, between Pell's paws, before she has it (a prop: the middle of its bottom edge at x, y) */
export function drawBlanketProp(ctx: CanvasRenderingContext2D, x: number, y: number) {
  const img = blanketSheet();
  const f = MEECA_BLANKET_FRAMES.blanket;
  if (!img || !f) return false;
  const k = K / MEECA_BLANKET_UP;
  ctx.drawImage(img, f.x, f.y, f.w, f.h, x - f.ax * k, y - f.ay * k, f.w * k, f.h * k);
  return true;
}

export type { MeecaStage };

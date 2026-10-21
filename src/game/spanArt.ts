/**
 * spanArt — the platforms that are more than a ledge:
 *   bridge   (canopy_bridge): a rope-and-plank span, in three dressings (plain, lanterns and flowers, vine-lashed)
 *   plank / slices / lashed  (fragile): three faces of "this will give way": boards, rotten log slices, lashed poles
 *   raft / barge / pad       (moving): a log raft, a lantern barge, a leaf or stone pad
 *   drift / canoe / reeds    (river carriers of World 2)
 *   toadstool / parasol / bloom (bouncy): three bounce plants with one cue, the up-arrow above them
 * Static bodies are painted once into sprites (platformSprites); what moves (a shaking plank, a pulsing lantern, a squashing
 * cap) is added live and kept to a few cheap draws.
 */
import type { Platform } from './types.ts';
import type { Look } from './scenery.ts';
import { rgba, mixToHex, lighten, darken, tone } from './artKit.ts';
import {
  type Art, type C, LW, fillStroke, vgrad, hgrad, litLip, leafAt, hangVine, crackLine, glowAt, bracket, underShade,
} from './platformKit.ts';
import { registerPainter } from './platformArt.ts';
import { drawLog } from './thinArt.ts';
import { paletteFor, type Palette } from './platformPalette.ts';
import { RES } from './platformSprites.ts';
import { rng } from './artKit.ts';

const TAU = Math.PI * 2;

// ───────────────────────────── bridge ─────────────────────────────

function sagCurve(c: C, ax: number, ay: number, bx: number, by: number, drop: number, w: number, col: string) {
  c.strokeStyle = col;
  c.lineWidth = w;
  c.lineCap = 'round';
  c.beginPath();
  c.moveTo(ax, ay);
  c.quadraticCurveTo((ax + bx) / 2, (ay + by) / 2 + drop, bx, by);
  c.stroke();
}

/** y of a sagging rope at x (quadratic through (ax,ay) (bx,by) with control drop) */
const sagY = (ax: number, bx: number, ay: number, drop: number, x: number) => {
  const u = (x - ax) / (bx - ax);
  return ay + drop * 2 * u * (1 - u);
};

function drawBridge(a: Art) {
  const { c, w, pal, v, r } = a;
  const ol = pal.outline;
  const bark = pal.bark;
  const rope = pal.heart.mid;
  const x0 = 0;
  const x1 = w;
  const railY = -44;
  const drop = 18;

  // ropes under the planks
  for (const dy of [9, 14]) {
    sagCurve(c, x0, dy, x1, dy, 16, 6, ol);
    sagCurve(c, x0, dy, x1, dy, 16, 3, v === 2 ? pal.vine.mid : rope);
  }
  // hanging tendrils under a vine-lashed bridge
  if (v === 2) for (const u of [0.25, 0.55, 0.8]) hangVine(a, w * u, sagY(0, w, 14, 16, w * u) + 2, 14 + r() * 12);
  // planks
  let i = 0;
  for (let x = 4; x < x1 - 14; x += 23, i++) {
    const pw = 20;
    const yy = 1 + (i % 3 === 1 ? 0.6 : 0);
    c.beginPath();
    c.roundRect(x, yy, pw, 12, 3);
    fillStroke(c, vgrad(c, yy, yy + 12, [[0, i % 2 ? bark.light : mixToHex(bark.light, '#ffffff', 0.12)], [1, i % 2 ? bark.mid : bark.dark]]), ol, 2.2);
    // grain and a knot
    c.strokeStyle = rgba(bark.deep, 0.45);
    c.lineWidth = 0.9;
    for (let k = 0; k < 2; k++) {
      const gy = yy + 4 + k * 3.4 + r() * 0.8;
      c.beginPath();
      c.moveTo(x + 2, gy);
      c.lineTo(x + pw - 2, gy + (r() - 0.5) * 1.4);
      c.stroke();
    }
    litLip(a, x + 2, x + pw - 2, pal.lip.wood, 2.6, yy - 0.3);
    c.fillStyle = rgba(ol, 0.8);
    for (const nx of [x + 3.5, x + pw - 3.5]) {
      c.beginPath();
      c.arc(nx, yy + 7.5, 1.4, 0, TAU);
      c.fill();
    }
    if (v === 2 && i % 3 === 0) {
      // a vine lashing over the plank
      for (const [col, lw] of [[ol, 4.4], [pal.vine.mid, 2.4]] as const) {
        c.strokeStyle = col;
        c.lineWidth = lw;
        c.beginPath();
        c.moveTo(x + 2, yy + 1);
        c.lineTo(x + pw - 2, yy + 11);
        c.stroke();
      }
    }
  }
  // end posts
  for (const ex of [x0 + 2, x1 - 2]) {
    c.beginPath();
    c.roundRect(ex - 7, -50, 14, 64, 5);
    fillStroke(c, hgrad(c, ex - 7, ex + 7, [[0, bark.light], [1, bark.dark]]), ol, 2.6);
    c.strokeStyle = rgba(bark.deep, 0.45);
    c.lineWidth = 1;
    c.beginPath();
    c.moveTo(ex - 2, -44);
    c.lineTo(ex - 2, 6);
    c.moveTo(ex + 3, -40);
    c.lineTo(ex + 3, 4);
    c.stroke();
    if (v === 2) {
      for (const dy of [-34, -14]) {
        for (const [col, lw] of [[ol, 4.4], [pal.vine.mid, 2.4]] as const) {
          c.strokeStyle = col;
          c.lineWidth = lw;
          c.beginPath();
          c.moveTo(ex - 7, dy);
          c.lineTo(ex + 7, dy + 8);
          c.stroke();
        }
      }
      leafAt(c, ex + (ex < w / 2 ? 7 : -7), -30, 12, 4.6, ex < w / 2 ? -0.4 : Math.PI + 0.4, pal.leaf, ol, 1.5);
    }
    c.beginPath();
    c.arc(ex, -52, 8, 0, TAU);
    fillStroke(c, v === 1 ? pal.heart.hi : pal.heart.light, ol, 2.4);
  }
  // handrail
  if (v === 2) {
    sagCurve(c, x0 + 2, railY, x1 - 2, railY, drop, 8, ol);
    sagCurve(c, x0 + 2, railY, x1 - 2, railY, drop, 5.2, pal.vine.dark);
    sagCurve(c, x0 + 2, railY, x1 - 2, railY, drop, 2, pal.vine.light);
    for (let x = x0 + 22; x < x1 - 16; x += 20) {
      const y = sagY(x0 + 2, x1 - 2, railY, drop, x);
      leafAt(c, x, y, 11 + r() * 4, 4.4, (r() > 0.5 ? -1 : 1) * (0.7 + r() * 0.5) + (r() > 0.5 ? 0 : Math.PI), pal.leaf, ol, 1.4);
    }
  } else {
    sagCurve(c, x0 + 2, railY, x1 - 2, railY, drop, 6, ol);
    sagCurve(c, x0 + 2, railY, x1 - 2, railY, drop, 3, pal.heart.light);
  }
  // hangers
  c.strokeStyle = v === 2 ? pal.vine.mid : rope;
  c.lineWidth = 2.2;
  for (let x = x0 + 60; x < x1 - 40; x += 62) {
    c.beginPath();
    c.moveTo(x, sagY(x0 + 2, x1 - 2, railY, drop, x));
    c.lineTo(x, 2);
    c.stroke();
  }
  if (v === 1) {
    // lanterns and hanging flowers
    const lampCol = pal.glow ?? '#ffc866';
    for (const u of [0.3, 0.7]) {
      const lx = w * u;
      const ly = sagY(x0 + 2, x1 - 2, railY, drop, lx);
      c.strokeStyle = ol;
      c.lineWidth = 2;
      c.beginPath();
      c.moveTo(lx, ly);
      c.lineTo(lx, ly + 8);
      c.stroke();
      glowAt(c, lx, ly + 19, 26, lampCol, 0.5);
      c.beginPath();
      c.roundRect(lx - 5, ly + 8, 10, 15, 3);
      fillStroke(c, mixToHex(lampCol, '#ffffff', 0.35), ol, 2);
      c.fillStyle = ol;
      c.fillRect(lx - 6, ly + 6.5, 12, 3);
      c.fillRect(lx - 5, ly + 22, 10, 2.4);
    }
    for (let k = 0; k < 7; k++) {
      const fx = w * (0.12 + 0.76 * (k / 6)) + (r() - 0.5) * 6;
      if (Math.abs(fx - w * 0.3) < 12 || Math.abs(fx - w * 0.7) < 12) continue;
      const fy = sagY(x0 + 2, x1 - 2, railY, drop, fx);
      c.strokeStyle = pal.vine.mid;
      c.lineWidth = 1.5;
      c.beginPath();
      c.moveTo(fx, fy);
      c.lineTo(fx, fy + 8 + r() * 5);
      c.stroke();
      const col = pal.flora[k % pal.flora.length];
      for (let q = 0; q < 5; q++) {
        const ang = (q / 5) * TAU;
        c.beginPath();
        c.ellipse(fx + Math.cos(ang) * 2.6, fy + 12 + Math.sin(ang) * 2.6, 2.2, 1.6, ang, 0, TAU);
        c.fillStyle = col;
        c.fill();
      }
      c.beginPath();
      c.arc(fx, fy + 12, 1.4, 0, TAU);
      c.fillStyle = '#fff3a0';
      c.fill();
    }
  }
}

registerPainter('bridge', { paint: drawBridge, pad: { x: 18, top: 68, bot: 50 } });

// ───────────────────────────── fragile ─────────────────────────────

/** what every fragile platform shares: frayed lashings below and a crack or two, so it reads as "this will give way" */
function fragileCues(a: Art, crackAt: number[], ropeAt: number[]) {
  const { c, w, h, pal, r } = a;
  const ol = pal.outline;
  c.lineCap = 'round';
  for (const rx of ropeAt) {
    for (const [col, lw] of [[ol, 4], [pal.heart.mid, 2]] as const) {
      c.strokeStyle = col;
      c.lineWidth = lw;
      c.beginPath();
      c.moveTo(rx, h - 2);
      c.quadraticCurveTo(rx + 3, h + 9, rx - 2, h + 17);
      c.stroke();
    }
    // the frayed end
    c.strokeStyle = pal.heart.mid;
    c.lineWidth = 1;
    for (let k = -1; k <= 1; k++) {
      c.beginPath();
      c.moveTo(rx - 2, h + 17);
      c.lineTo(rx - 2 + k * 2.4, h + 21);
      c.stroke();
    }
  }
  const crackCol = pal.glow ? rgba(pal.glow, 0.95) : pal.kind === 'ash' ? 'rgba(255,122,26,0.95)' : rgba('#0a0408', 0.65);
  for (const cx of crackAt) {
    c.strokeStyle = crackCol;
    c.lineWidth = 1.7;
    c.beginPath();
    c.moveTo(cx, 3);
    c.lineTo(cx + 3 + r() * 2, h * 0.4);
    c.lineTo(cx - 2, h * 0.7);
    c.lineTo(cx + 2 + r() * 2, h - 1);
    c.stroke();
  }
  void w;
}

function drawPlankBoards(a: Art) {
  const { c, w, h, pal, r, v } = a;
  const ol = pal.outline;
  const n = Math.max(3, Math.round(w / 30));
  // v0: even boards, nailed. v1: boards of unequal width and the last one snapped short: an older, more ragged platform
  const wts = Array.from({ length: n }, (_, i) => (v === 1 ? [1.5, 0.8, 1.2, 0.9, 1.3][i % 5] : 1));
  const tot = wts.reduce((s, q) => s + q, 0);
  let cx = 0;
  const board = (x: number, bw: number, hh: number, snapped: boolean) => {
    c.beginPath();
    if (!snapped) {
      c.roundRect(x, 0, bw, hh, [3, 3, 2, 2]);
      return;
    }
    c.moveTo(x, 3);
    c.quadraticCurveTo(x, 0, x + 3, 0);
    c.lineTo(x + bw - 3, 0);
    c.quadraticCurveTo(x + bw, 0, x + bw, 3);
    c.lineTo(x + bw, hh * 0.78);
    c.lineTo(x + bw * 0.72, hh * 0.56);
    c.lineTo(x + bw * 0.5, hh * 0.94);
    c.lineTo(x + bw * 0.28, hh * 0.6);
    c.lineTo(x, hh * 0.84);
    c.closePath();
  };
  for (let i = 0; i < n; i++) {
    const pw = (w * wts[i]) / tot;
    const x = cx + 1;
    cx += pw;
    const snapped = v === 1 && i === n - 1;
    const hh = h + (i % 2) * 1;
    const bw = pw - 2;
    board(x, bw, hh, snapped);
    fillStroke(c, hgrad(c, x, x + bw, [[0, i % 2 ? pal.bark.light : mixToHex(pal.bark.light, '#ffffff', 0.12)], [1, pal.bark.dark]]), ol, 2.4);
    c.save();
    board(x, bw, hh, snapped);
    c.clip();
    c.strokeStyle = rgba(pal.bark.deep, 0.4);
    c.lineWidth = 1;
    for (let k = 0; k < 3; k++) {
      const gx = x + 3 + r() * Math.max(2, bw - 6);
      c.beginPath();
      c.moveTo(gx, 4);
      c.lineTo(gx + (r() - 0.5) * 2.5, hh);
      c.stroke();
    }
    underShade(a, hh * 0.5, hh, 0.3);
    c.restore();
    litLip(a, x + 2, x + bw - 2, pal.lip.wood, 2.8);
    if (!snapped) {
      c.fillStyle = rgba(ol, 0.8);
      c.beginPath();
      c.arc(x + bw / 2, hh - 4, 1.4, 0, TAU);
      c.fill();
    }
    if (i % 2 === 0 && !snapped) {
      c.fillStyle = rgba(pal.bark.dark, 0.95);
      c.beginPath();
      c.moveTo(x + 2, hh);
      c.lineTo(x + bw * 0.34, hh + 6);
      c.lineTo(x + bw * 0.56, hh);
      c.fill();
    }
  }
  fragileCues(a, [w * 0.3, w * 0.7], [8, w - 8]);
}

function drawPlankSlices(a: Art) {
  const { c, w, h, pal, r, v } = a;
  const ol = pal.outline;
  const n = Math.max(2, Math.round(w / 34));
  const gap = 4;
  const sw = (w - (n - 1) * gap) / n;
  // the lashing the slices hang from
  c.lineCap = 'round';
  for (const [col, lw] of [[ol, 5], [pal.heart.mid, 2.6]] as const) {
    c.strokeStyle = col;
    c.lineWidth = lw;
    c.beginPath();
    c.moveTo(-4, h * 0.55);
    c.lineTo(w + 4, h * 0.55 + 1);
    c.stroke();
  }
  for (let i = 0; i < n; i++) {
    const x = i * (sw + gap);
    const hh = h + 1 + (i % 2) * (v === 1 ? 4 : 2);
    c.beginPath();
    c.roundRect(x, 0, sw, hh, [4, 4, 7, 7]);
    c.fillStyle = vgrad(c, 0, hh, [[0, pal.bark.light], [0.4, pal.bark.mid], [1, pal.bark.deep]]);
    c.fill();
    c.save();
    c.clip();
    c.strokeStyle = rgba(pal.bark.deep, 0.5);
    c.lineWidth = 1.1;
    for (let k = 0; k < 3; k++) {
      const gx = x + 4 + r() * (sw - 8);
      c.beginPath();
      c.moveTo(gx, 7);
      c.lineTo(gx + (r() - 0.5) * 3, hh);
      c.stroke();
    }
    // a rotten hole
    if ((i + a.id) % 2 === 0) {
      c.beginPath();
      c.ellipse(x + sw * (0.3 + r() * 0.4), hh * 0.62, 3.6, 2.6, 0, 0, TAU);
      c.fillStyle = rgba('#0a0408', 0.85);
      c.fill();
      if (pal.glow) glowAt(c, x + sw / 2, hh * 0.62, 10, pal.glow, 0.45);
    }
    c.restore();
    c.strokeStyle = ol;
    c.lineWidth = 2.4;
    c.beginPath();
    c.roundRect(x, 0, sw, hh, [4, 4, 7, 7]);
    c.stroke();
    // the cut top: pale heartwood with a ring
    c.beginPath();
    c.roundRect(x + 0.5, 0, sw - 1, 6, [3.5, 3.5, 1, 1]);
    fillStroke(c, vgrad(c, 0, 6, [[0, pal.heart.hi], [1, pal.heart.mid]]), ol, 2);
    c.strokeStyle = rgba(pal.bark.dark, 0.5);
    c.lineWidth = 0.9;
    c.beginPath();
    c.ellipse(x + sw / 2, 3.2, sw * 0.26, 1.4, 0, 0, TAU);
    c.stroke();
    litLip(a, x + 3, x + sw - 3, pal.lip.wood, 2.6);
    if (i % 2 === 1) bracket(c, x + sw - 1, hh * 0.38, 5, 4, mixToHex(pal.accent, '#ffffff', 0.3), ol, pal.glow);
  }
  fragileCues(a, [w * 0.46], [10, w - 10]);
}

function drawPlankLashed(a: Art) {
  const { c, w, h, pal, r, v } = a;
  const ol = pal.outline;
  const n = Math.max(5, Math.round(w / 15));
  const pw = w / n;
  for (let i = 0; i < n; i++) {
    const x = i * pw;
    const hh = h + ((i * 3 + a.id) % 4) * (v === 1 ? 3 : 2) - 2;
    c.beginPath();
    c.roundRect(x + 0.4, 0, pw - 0.8, hh, [pw * 0.4, pw * 0.4, pw * 0.5, pw * 0.5]);
    fillStroke(c, hgrad(c, x, x + pw, [[0, i % 2 ? pal.bark.light : mixToHex(pal.bark.light, '#ffffff', 0.1)], [0.55, pal.bark.mid], [1, pal.bark.dark]]), ol, 2);
    // a node ring
    c.strokeStyle = rgba(pal.bark.deep, 0.6);
    c.lineWidth = 1.1;
    const ny = h * 0.35 + ((i * 5) % 4);
    c.beginPath();
    c.moveTo(x + 1.5, ny);
    c.lineTo(x + pw - 1.5, ny);
    c.stroke();
  }
  // lashings
  for (const y of [7, h - 5]) {
    for (const [col, lw] of [[ol, 5.2], [pal.heart.mid, 2.8]] as const) {
      c.strokeStyle = col;
      c.lineWidth = lw;
      c.lineCap = 'round';
      c.beginPath();
      c.moveTo(-2, y);
      c.lineTo(w + 2, y);
      c.stroke();
    }
    c.strokeStyle = rgba(pal.bark.deep, 0.55);
    c.lineWidth = 0.9;
    for (let x = 6; x < w - 4; x += 9) {
      c.beginPath();
      c.moveTo(x, y - 1.4);
      c.lineTo(x + 3, y + 1.4);
      c.stroke();
    }
  }
  // the pale cut ends of the poles
  for (let i = 0; i < n; i++) {
    const x = i * pw;
    c.fillStyle = pal.heart.light;
    c.beginPath();
    c.roundRect(x + 1.2, 0.2, pw - 2.4, 3.2, 1.6);
    c.fill();
  }
  litLip(a, 2, w - 2, pal.lip.wood, 2.8);
  fragileCues(a, [w * 0.35, w * 0.72], [6, w - 6]);
  void r;
}

registerPainter('plank', { paint: drawPlankBoards, pad: { x: 10, top: 12, bot: 34 } });
registerPainter('slices', { paint: drawPlankSlices, pad: { x: 10, top: 12, bot: 34 } });
registerPainter('lashed', { paint: drawPlankLashed, pad: { x: 10, top: 12, bot: 34 } });

/**
 * How far a fragile platform is shaken from where it rests: nothing until someone steps on it, then a tremble that grows for
 * the crumbling tiles of World 7 (in step with the cracks zoneArt lays over them) and is a steady jitter for timber.
 */
export function shakeOffset(p: Platform, time: number): [number, number] {
  const t = p.fragileTimer;
  if (t === undefined || t <= 0) return [0, 0];
  if (p.crumbleAfter !== undefined) {
    const prog = Math.max(0, Math.min(1, 1 - t / p.crumbleAfter));
    return [Math.sin(time * 70) * 2.2 * prog, Math.sin(time * 83) * 1.2 * prog];
  }
  return [Math.sin(time * 61 + p.id) * 2.2, Math.sin(time * 77 + p.id * 3) * 1.4];
}

// ───────────────────────────── rafts ─────────────────────────────

function pennant(a: Art, x: number, baseY: number, height: number, dir: 1 | -1) {
  const { c, pal } = a;
  const ol = pal.outline;
  c.beginPath();
  c.roundRect(x - 2.2, baseY - height, 4.4, height + 2, 2);
  fillStroke(c, pal.bark.mid, ol, 2);
  c.beginPath();
  c.moveTo(x + dir * 2, baseY - height + 1);
  c.quadraticCurveTo(x + dir * 12, baseY - height + 1, x + dir * 22, baseY - height + 5);
  c.quadraticCurveTo(x + dir * 12, baseY - height + 8, x + dir * 2, baseY - height + 11);
  c.closePath();
  fillStroke(c, pal.accent, ol, 1.8);
}

function drawRaftLogs(a: Art) {
  const { c, w, h, pal, v } = a;
  const ol = pal.outline;
  const deckH = 9;
  const logTop = deckH - 3;
  const logH = h - logTop + 4;
  if (v === 1) {
    // twin pontoons: two barrels under the deck with sky between them
    for (const bx of [5, w * 0.58]) {
      const bw = w * 0.37;
      c.beginPath();
      c.roundRect(bx, logTop, bw, logH, logH * 0.42);
      fillStroke(c, vgrad(c, logTop, logTop + logH, [[0, pal.bark.mid], [1, pal.bark.deep]]), ol, 2.4);
      for (const hx of [bx + bw * 0.28, bx + bw * 0.72]) {
        c.strokeStyle = rgba(ol, 0.85);
        c.lineWidth = 2.2;
        c.beginPath();
        c.moveTo(hx, logTop + 2);
        c.lineTo(hx, logTop + logH - 2);
        c.stroke();
      }
    }
  } else {
    // one float log under the deck, with a cut end each side
    c.beginPath();
    c.roundRect(2, logTop, w - 4, logH, logH * 0.45);
    fillStroke(c, vgrad(c, logTop, logTop + logH, [[0, pal.bark.mid], [1, pal.bark.deep]]), ol, 2.4);
    c.strokeStyle = rgba(pal.bark.deep, 0.5);
    c.lineWidth = 1.1;
    for (let x = 10; x < w - 12; x += 16) {
      c.beginPath();
      c.moveTo(x, logTop + 5);
      c.lineTo(x + 5, logTop + logH - 4);
      c.stroke();
    }
    for (const ex of [4, w - 4]) {
      c.beginPath();
      c.ellipse(ex, logTop + logH / 2, 4.2, logH / 2 - 1, 0, 0, TAU);
      fillStroke(c, pal.heart.mid, ol, 1.8);
    }
  }
  // the deck: planks across the top
  c.beginPath();
  c.roundRect(-2, 0, w + 4, deckH, 3);
  fillStroke(c, vgrad(c, 0, deckH, [[0, pal.bark.light], [1, pal.bark.mid]]), ol, 2.4);
  c.strokeStyle = rgba(pal.bark.deep, 0.5);
  c.lineWidth = 1;
  for (let x = 11; x < w - 4; x += 14) {
    c.beginPath();
    c.moveTo(x, 2);
    c.lineTo(x, deckH - 1);
    c.stroke();
  }
  litLip(a, 0, w, pal.lip.wood, 3);
  // lashings over deck and float
  for (const x of v === 1 ? [w * 0.5] : [w * 0.2, w * 0.8]) {
    for (const [col, lw] of [[ol, 5], [pal.heart.mid, 2.6]] as const) {
      c.strokeStyle = col;
      c.lineWidth = lw;
      c.lineCap = 'round';
      c.beginPath();
      c.moveTo(x, 1);
      c.lineTo(x + 1, v === 1 ? deckH + 1 : logTop + logH - 3);
      c.stroke();
    }
  }
  // v2 flies a pennant at one end: the same cue as the chevrons, from further away
  if (v === 2) pennant(a, a.side > 0 ? w - 9 : 9, 2, 26, a.side > 0 ? -1 : 1);
}

function drawRaftBarge(a: Art) {
  const { c, w, h, pal, v } = a;
  const ol = pal.outline;
  const hull = h + 6;
  const path = () => {
    c.beginPath();
    c.moveTo(-3, 0);
    c.lineTo(w + 3, 0);
    c.quadraticCurveTo(w + 4, hull * 0.6, w * 0.84, hull);
    c.lineTo(w * 0.16, hull);
    c.quadraticCurveTo(-4, hull * 0.6, -3, 0);
    c.closePath();
  };
  // v2: upturned prows at both ends, drawn behind the hull
  if (v === 2) {
    for (const s of [-1, 1]) {
      const ex = s < 0 ? -3 : w + 3;
      c.beginPath();
      c.moveTo(ex, 3);
      c.quadraticCurveTo(ex + s * 7, -3, ex + s * 5, -15);
      c.quadraticCurveTo(ex - s * 2, -7, ex - s * 8, -1);
      c.lineTo(ex - s * 8, 4);
      c.closePath();
      fillStroke(c, pal.accent, ol, 2);
    }
  }
  path();
  c.fillStyle = vgrad(c, 0, hull, [[0, pal.bark.light], [0.4, pal.bark.mid], [1, pal.bark.deep]]);
  c.fill();
  c.save();
  path();
  c.clip();
  c.strokeStyle = rgba(pal.bark.deep, 0.55);
  c.lineWidth = 1.2;
  for (const y of [hull * 0.34, hull * 0.62]) {
    c.beginPath();
    c.moveTo(0, y);
    c.lineTo(w, y);
    c.stroke();
  }
  c.fillStyle = rgba(ol, 0.8);
  for (let x = 14; x < w - 6; x += 20) {
    c.beginPath();
    c.arc(x, hull * 0.2, 1.4, 0, TAU);
    c.fill();
  }
  // an accent stripe along the hull (v1: a scalloped one)
  c.fillStyle = rgba(pal.accent, 0.85);
  if (v === 1) {
    for (let x = 3; x < w; x += 12) {
      c.beginPath();
      c.arc(x + 5, hull * 0.42, 5.2, 0, Math.PI);
      c.fill();
    }
  } else c.fillRect(0, hull * 0.45, w, 3);
  c.restore();
  path();
  c.strokeStyle = ol;
  c.lineWidth = LW;
  c.lineJoin = 'round';
  c.stroke();
  litLip(a, 0, w, pal.lip.wood, 3.2);
  const px = a.side > 0 ? w - 9 : 9;
  if (v === 0) {
    // a lantern post on the bow
    c.beginPath();
    c.roundRect(px - 2.6, -20, 5.2, 24, 2);
    fillStroke(c, pal.bark.mid, ol, 2);
    const lampCol = pal.glow ?? '#ffc866';
    glowAt(c, px, -24, 22, lampCol, 0.45);
    c.beginPath();
    c.roundRect(px - 5, -32, 10, 12, 3);
    fillStroke(c, mixToHex(lampCol, '#ffffff', 0.35), ol, 2);
  } else if (v === 1) {
    pennant(a, px, 2, 30, a.side > 0 ? -1 : 1);
  }
}

function drawRaftPad(a: Art) {
  const { c, w, h, pal, v } = a;
  const ol = pal.outline;
  const stoneWorld = pal.kind === 'stone' || pal.kind === 'ash' || a.world === 7 || a.world === 10;
  if (stoneWorld) {
    // a floating slab, runes glowing underneath
    const th = h * 0.72 + 6;
    const path = () => {
      c.beginPath();
      c.moveTo(0, 1);
      c.lineTo(4, 0);
      c.lineTo(w - 4, 0);
      c.lineTo(w, 1);
      c.lineTo(w - 6, th);
      c.lineTo(6, th);
      c.closePath();
    };
    glowAt(c, w / 2, th + 4, w * 0.5, pal.glow ?? pal.accent, 0.35);
    path();
    c.fillStyle = vgrad(c, 0, th, [[0, pal.stone.light], [1, pal.stone.deep]]);
    c.fill();
    c.strokeStyle = ol;
    c.lineWidth = LW;
    c.lineJoin = 'round';
    c.stroke();
    c.strokeStyle = rgba(pal.glow ?? pal.accent, 0.95);
    c.lineWidth = 1.4;
    c.beginPath();
    if (v === 0) {
      for (let x = 14; x < w - 12; x += 14) {
        c.moveTo(x, th * 0.8);
        c.lineTo(x + 3, th * 0.4 + 1);
        c.lineTo(x + 7, th * 0.8);
      }
    } else if (v === 1) {
      for (let x = 22; x < w - 18; x += 26) {
        c.moveTo(x + 6, th * 0.58);
        c.arc(x, th * 0.58, 6, 0, TAU);
        c.moveTo(x, th * 0.3);
        c.lineTo(x, th * 0.86);
      }
    } else {
      for (let x = 14; x < w - 10; x += 12) {
        c.moveTo(x, th * 0.32);
        c.lineTo(x, th * 0.84);
        c.moveTo(x + 4, th * 0.46);
        c.lineTo(x + 4, th * 0.84);
      }
    }
    c.stroke();
    litLip(a, 2, w - 2, pal.lip.stone, 3.2);
    return;
  }
  // a big lily-pad disc
  const lift = v === 2 ? 4 : 2.5;
  const path = () => {
    c.beginPath();
    c.moveTo(0, 2);
    c.quadraticCurveTo(-1, -lift - 0.5, 5, -lift);
    c.lineTo(5, 0);
    c.lineTo(w - 5, 0);
    c.lineTo(w - 5, -lift);
    c.quadraticCurveTo(w + 1, -lift - 0.5, w, 2);
    c.quadraticCurveTo(w + 1, h * 0.9, w * 0.5, h * 0.95);
    c.quadraticCurveTo(-1, h * 0.9, 0, 2);
    c.closePath();
  };
  path();
  c.fillStyle = vgrad(c, 0, h, [[0, pal.leaf.light], [0.5, pal.leaf.mid], [1, pal.leaf.dark]]);
  c.fill();
  c.save();
  path();
  c.clip();
  c.strokeStyle = rgba(pal.leaf.deep, 0.55);
  c.lineWidth = 1.1;
  for (let i = 0; i < 9; i++) {
    c.beginPath();
    c.moveTo(w * 0.5, h * 0.2);
    c.lineTo((w * (i + 0.5)) / 9, h);
    c.stroke();
  }
  underShade(a, h * 0.4, h, 0.28);
  c.restore();
  path();
  c.strokeStyle = ol;
  c.lineWidth = LW;
  c.lineJoin = 'round';
  c.stroke();
  litLip(a, 6, w - 6, pal.lip.moss, 3);
  const bx = a.side > 0 ? w * 0.84 : w * 0.16;
  if (v === 1) {
    // a curl of tendril and a closed bud on a stalk
    c.strokeStyle = ol;
    c.lineWidth = 3.6;
    c.beginPath();
    c.moveTo(bx, 1);
    c.quadraticCurveTo(bx + 1, -8, bx - a.side * 4, -13);
    c.stroke();
    c.strokeStyle = pal.leaf.light;
    c.lineWidth = 1.8;
    c.stroke();
    c.beginPath();
    c.ellipse(bx - a.side * 5, -17, 3.4, 5.6, -a.side * 0.5, 0, TAU);
    fillStroke(c, pal.accent, ol, 1.4);
  } else {
    const petals = v === 2 ? 6 : 5;
    for (let q = 0; q < petals; q++) {
      c.beginPath();
      c.ellipse(bx + (q - (petals - 1) / 2) * 2.5, -lift - 3, 2.6, 6, (q - (petals - 1) / 2) * 0.28, 0, TAU);
      fillStroke(c, q % 2 ? mixToHex(pal.accent, '#ffffff', 0.3) : pal.accent, ol, 1.2);
    }
  }
}

registerPainter('raft', { paint: drawRaftLogs, pad: { x: 14, top: 36, bot: 14 } });
registerPainter('barge', { paint: drawRaftBarge, pad: { x: 16, top: 44, bot: 14 } });
registerPainter('pad', { paint: drawRaftPad, pad: { x: 12, top: 28, bot: 36 } });

/** the live part of a moving platform: direction chevrons, drawn over its cached body */
export function drawRaftLive(ctx: CanvasRenderingContext2D, p: Platform, look: Look, world: number, time: number) {
  const pal = paletteFor(look, world);
  const accent = pal.glow ?? pal.accent;
  const pulse = 0.5 + 0.5 * Math.sin(time * 3);
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = 3;
  ctx.strokeStyle = rgba(accent, 0.55 + pulse * 0.4);
  const cx = Math.round(p.x) + p.width / 2;
  const y0 = Math.round(p.y);
  const hh = Math.min(10, p.height * 0.36);
  for (const s of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(cx + s * 11, y0 + 4.4);
    ctx.lineTo(cx + s * 18, y0 + 4.4 + hh * 0.5);
    ctx.lineTo(cx + s * 11, y0 + 4.4 + hh);
    ctx.stroke();
  }
  ctx.restore();
}

// ───────────────────────────── river carriers ─────────────────────────────

function drawDriftLog(a: Art) {
  drawLog({ ...a, v: a.v % 3 }, a.h);
}

function drawCanoe(a: Art) {
  const { c, w, h, pal, r, v } = a;
  const ol = pal.outline;
  const hull = h * 0.95 + 6;
  const rise = 4;
  // v2: a carved, curled prow with a ball finial, behind the hull
  if (v === 2) {
    const ex = a.side > 0 ? w + 6 : -6;
    const s = a.side;
    c.beginPath();
    c.moveTo(ex - s * 8, 4);
    c.quadraticCurveTo(ex + s * 4, -2, ex + s * 3, -13);
    c.quadraticCurveTo(ex - s * 3, -7, ex - s * 12, 0);
    c.closePath();
    fillStroke(c, pal.bark.mid, ol, 2);
    c.beginPath();
    c.arc(ex + s * 3, -15, 3.4, 0, TAU);
    fillStroke(c, pal.accent, ol, 1.6);
  }
  const path = () => {
    c.beginPath();
    c.moveTo(-6, -rise);
    c.quadraticCurveTo(w * 0.04, 1, 10, 0);
    c.lineTo(w - 10, 0);
    c.quadraticCurveTo(w * 0.96, 1, w + 6, -rise);
    c.quadraticCurveTo(w * 0.98, hull * 0.88, w * 0.82, hull);
    c.lineTo(w * 0.18, hull);
    c.quadraticCurveTo(w * 0.02, hull * 0.88, -6, -rise);
    c.closePath();
  };
  path();
  c.fillStyle = vgrad(c, 0, hull, [[0, pal.bark.light], [0.3, pal.bark.mid], [1, pal.bark.deep]]);
  c.fill();
  c.save();
  path();
  c.clip();
  // adze marks and a painted band
  c.strokeStyle = rgba(pal.bark.deep, 0.45);
  c.lineWidth = 1.1;
  for (let x = 8; x < w - 6; x += 9) {
    c.beginPath();
    c.moveTo(x, 6 + r() * 4);
    c.lineTo(x + 4, 12 + r() * 6);
    c.stroke();
  }
  c.fillStyle = rgba(pal.accent, 0.9);
  c.fillRect(0, hull * 0.38, w, 3.4);
  if (v === 1) {
    c.fillStyle = rgba(pal.heart.hi, 0.85);
    for (let x = 14; x < w - 12; x += 16) {
      c.beginPath();
      c.moveTo(x, hull * 0.38 + 3.4);
      c.lineTo(x + 4, hull * 0.38 + 9);
      c.lineTo(x - 4, hull * 0.38 + 9);
      c.fill();
    }
  }
  underShade(a, hull * 0.5, hull, 0.3);
  c.restore();
  path();
  c.strokeStyle = ol;
  c.lineWidth = LW;
  c.lineJoin = 'round';
  c.stroke();
  litLip(a, 8, w - 8, pal.lip.wood, 3.2);
  // the inside of the far gunwale peeking over the near one, and a lashing at the bow
  c.strokeStyle = rgba(pal.bark.deep, 0.8);
  c.lineWidth = 1.2;
  c.beginPath();
  c.moveTo(12, 5);
  c.lineTo(w - 12, 5);
  c.stroke();
  const bow = a.side > 0 ? w - 14 : 14;
  for (const [col, lw] of [[ol, 5], [pal.heart.mid, 2.6]] as const) {
    c.strokeStyle = col;
    c.lineWidth = lw;
    c.beginPath();
    c.moveTo(bow, 1);
    c.lineTo(bow + a.side * 2, hull * 0.7);
    c.stroke();
  }
}

function drawReeds(a: Art) {
  const { c, w, h, pal, r, v } = a;
  const ol = pal.outline;
  const body = h * 0.95 + 4;
  const reed = mixToHex(pal.leaf.light, pal.heart.mid, 0.55);
  const reedDark = mixToHex(pal.leaf.dark, pal.heart.dark, 0.45);
  // v1: two cattails standing at one end, behind the bundle
  if (v === 1) {
    for (const [dx, hgt] of [[18, 24], [27, 18]] as const) {
      const x = a.side > 0 ? w - dx : dx;
      c.strokeStyle = ol;
      c.lineWidth = 4;
      c.lineCap = 'round';
      c.beginPath();
      c.moveTo(x, 4);
      c.lineTo(x + a.side * 1.5, -hgt);
      c.stroke();
      c.strokeStyle = reed;
      c.lineWidth = 1.8;
      c.stroke();
      c.beginPath();
      c.roundRect(x + a.side * 1.5 - 3.2, -hgt - 10, 6.4, 12, 3);
      fillStroke(c, '#7a4a2a', ol, 1.6);
    }
  }
  const path = () => {
    c.beginPath();
    c.moveTo(-8, 4);
    c.quadraticCurveTo(-3, 0, 5, 0);
    c.lineTo(w - 5, 0);
    c.quadraticCurveTo(w + 3, 0, w + 8, 4);
    c.quadraticCurveTo(w * 0.8, body * 1.1, w * 0.5, body);
    c.quadraticCurveTo(w * 0.2, body * 1.1, -8, 4);
    c.closePath();
  };
  path();
  c.fillStyle = vgrad(c, 0, body, [[0, reed], [0.5, mixToHex(reed, reedDark, 0.45)], [1, reedDark]]);
  c.fill();
  c.save();
  path();
  c.clip();
  // the individual reeds, lengthwise
  c.lineCap = 'round';
  for (let k = 1; k <= 5; k++) {
    c.strokeStyle = rgba(reedDark, 0.7);
    c.lineWidth = 1.1;
    c.beginPath();
    c.moveTo(-8, 4 + k * 0.5);
    c.quadraticCurveTo(w * 0.5, body * (0.2 + k * 0.17), w + 8, 4 + k * 0.5);
    c.stroke();
  }
  if (v === 2) {
    // a woven diamond band through the middle
    c.strokeStyle = rgba(pal.heart.light, 0.9);
    c.lineWidth = 1.6;
    c.beginPath();
    for (let x = 8; x < w - 4; x += 10) {
      c.moveTo(x, body * 0.3);
      c.lineTo(x + 5, body * 0.62);
      c.lineTo(x + 10, body * 0.3);
    }
    c.stroke();
  }
  underShade(a, body * 0.5, body, 0.3);
  c.restore();
  path();
  c.strokeStyle = ol;
  c.lineWidth = LW;
  c.lineJoin = 'round';
  c.stroke();
  litLip(a, 3, w - 3, pal.lip.moss, 3);
  // rope bindings
  const nb = v === 0 ? 3 : 4;
  for (let i = 0; i < nb; i++) {
    const x = w * ((i + 0.5) / nb);
    for (const [col, lw] of [[ol, 5], [pal.heart.mid, 2.6]] as const) {
      c.strokeStyle = col;
      c.lineWidth = lw;
      c.beginPath();
      c.moveTo(x - 2, 0.5);
      c.quadraticCurveTo(x + 4, body * 0.5, x - 1, body * 0.9);
      c.stroke();
    }
  }
  // feathered tips
  for (const s of [-1, 1]) {
    const tx = s < 0 ? -6 : w + 6;
    for (let k = 0; k < 3; k++) leafAt(c, tx, 3 + k * 0.6, 11 - k * 1.5, 2.6, s < 0 ? Math.PI + 0.35 + k * 0.28 : -0.35 - k * 0.28, { ...pal.leaf, mid: reed }, ol, 1.1);
  }
  void r;
}

registerPainter('drift', { paint: drawDriftLog, pad: { x: 14, top: 22, bot: 40 } });
registerPainter('canoe', { paint: drawCanoe, pad: { x: 20, top: 26, bot: 30 } });
registerPainter('reeds', { paint: drawReeds, pad: { x: 20, top: 38, bot: 34 } });

// ───────────────────────────── bounce plants ─────────────────────────────

type Species = 'toadstool' | 'parasol' | 'bloom';

function stalkShape(ctx: CanvasRenderingContext2D, cx: number, top: number, bottom: number, sw: number, cols: [string, string, string], ol: string, grain: string | null) {
  const sg = ctx.createLinearGradient(cx - sw, 0, cx + sw, 0);
  sg.addColorStop(0, cols[0]);
  sg.addColorStop(0.6, cols[1]);
  sg.addColorStop(1, cols[2]);
  ctx.beginPath();
  ctx.moveTo(cx - sw * 0.8, top);
  ctx.quadraticCurveTo(cx - sw * 0.7, (top + bottom) * 0.5, cx - sw * 1.7, bottom);
  ctx.lineTo(cx + sw * 1.7, bottom);
  ctx.quadraticCurveTo(cx + sw * 0.7, (top + bottom) * 0.5, cx + sw * 0.8, top);
  ctx.closePath();
  ctx.fillStyle = sg;
  ctx.fill();
  ctx.strokeStyle = ol;
  ctx.lineWidth = LW;
  ctx.lineJoin = 'round';
  ctx.stroke();
  if (grain) {
    ctx.strokeStyle = grain;
    ctx.lineWidth = 1.6;
    for (let gy = top + 26; gy < bottom; gy += 36) {
      ctx.beginPath();
      ctx.moveTo(cx - sw * 0.6, gy);
      ctx.quadraticCurveTo(cx, gy + 6, cx + sw * 0.6, gy);
      ctx.stroke();
    }
  }
}

/**
 * A bouncy plant, painted live (it squashes as it breathes). The top of the cap is exactly the collision line, and the stalk
 * runs down off the bottom of the screen. Three species, three silhouettes, one cue: the up-arrow above them.
 *   toadstool: a domed spotted cap on a tapering stem
 *   parasol:   a wide frilled umbrella on a slender stem
 *   bloom:     a flower: a flat pollen disc ringed by drooping petals, on a green stalk with two leaves
 */
export function drawBounce(ctx: CanvasRenderingContext2D, p: Platform, look: Look, world: number, species: Species, variant: number, time: number, bottomY: number) {
  const pal: Palette = paletteFor(look, world);
  const ol = pal.outline;
  const cxp = Math.round(p.x + p.width / 2);
  const topY = Math.round(p.y);
  const capH = Math.max(15, p.height * 0.62);
  const rimY = topY + capH;
  const rad = p.width * (species === 'parasol' ? 0.56 : 0.5);
  const flo = pal.flora;
  const capCol = flo[(Math.abs(p.id) + variant) % flo.length];
  const altCol = flo[(Math.abs(p.id) + variant + 1) % flo.length];
  const ct = tone(capCol, '#3a0a30');
  const at = tone(altCol, '#3a0a30');
  const sw = p.width * (species === 'parasol' ? 0.13 : species === 'bloom' ? 0.1 : 0.2);
  const stalkTop = species === 'bloom' ? topY + 8 : rimY - 4;
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  // stalk
  if (species === 'bloom') {
    stalkShape(ctx, cxp, stalkTop, bottomY, sw, [pal.leaf.light, pal.leaf.mid, pal.leaf.dark], ol, null);
    for (const [s, dy] of [[-1, 44], [1, 70]] as const) leafAt(ctx, cxp + s * sw * 0.6, topY + dy, 30, 10, s < 0 ? Math.PI + 0.45 : -0.45, pal.leaf, ol, 2.2);
  } else {
    // a second, smaller toadstool beside the first (variant 2)
    if (species === 'toadstool' && variant === 2) {
      const bx = cxp + (p.id % 2 ? 1 : -1) * rad * 0.78;
      const by = rimY + 20;
      stalkShape(ctx, bx, by, bottomY, sw * 0.5, [pal.heart.hi, pal.heart.light, pal.heart.dark], ol, null);
      ctx.beginPath();
      ctx.ellipse(bx, by, rad * 0.34, 7.5, 0, Math.PI, 0);
      ctx.quadraticCurveTo(bx, by + 5, bx - rad * 0.34, by);
      ctx.fillStyle = vgradC(ctx, by - 8, by + 4, ct.light, ct.dark);
      ctx.fill();
      ctx.strokeStyle = ol;
      ctx.lineWidth = 2.4;
      ctx.stroke();
    }
    stalkShape(ctx, cxp, stalkTop, bottomY, sw, [pal.heart.hi, pal.heart.light, pal.heart.dark], ol, rgba(pal.heart.deep, 0.35));
    // the collar
    ctx.beginPath();
    ctx.ellipse(cxp, stalkTop + 6, sw * 1.35, species === 'parasol' ? 4 : 5.4, 0, 0, TAU);
    ctx.fillStyle = species === 'parasol' ? ct.light : pal.heart.hi;
    ctx.fill();
    ctx.stroke();
    if (species === 'toadstool' && variant === 1) {
      // a skirt ring partway down the stem
      ctx.beginPath();
      ctx.ellipse(cxp, stalkTop + 26, sw * 1.55, 5, 0, 0, TAU);
      ctx.fillStyle = pal.heart.hi;
      ctx.fill();
      ctx.stroke();
    }
  }

  if (species === 'bloom') {
    const squash = 1 + Math.sin(time * 3 + p.id) * 0.04;
    const cy = topY + 6.5;
    ctx.translate(cxp, cy);
    ctx.scale(1, squash);
    ctx.translate(-cxp, -cy);
    // petals: outer (steep) ones first so the flatter ones overlap them
    const angs = [76, 52, 29, 7];
    for (let i = 0; i < angs.length; i++) {
      for (const s of [-1, 1]) {
        const col = variant === 1 && i % 2 ? at : ct;
        ctx.save();
        ctx.translate(cxp, cy);
        ctx.scale(s, 1);
        ctx.rotate((angs[i] * Math.PI) / 180);
        const len = rad * (0.98 - i * 0.02);
        ctx.beginPath();
        ctx.ellipse(len / 2 + 5, 0, len / 2, 5.4 - i * 0.2, 0, 0, TAU);
        ctx.fillStyle = vgradC(ctx, -6, 6, col.light, col.mid);
        ctx.fill();
        ctx.strokeStyle = ol;
        ctx.lineWidth = 2.4;
        ctx.stroke();
        ctx.strokeStyle = rgba(col.deep, 0.5);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(8, 0);
        ctx.lineTo(len, 0);
        ctx.stroke();
        ctx.restore();
      }
    }
    // the disc: its top edge is the collision line
    const dx = rad * 0.55;
    ctx.beginPath();
    ctx.ellipse(cxp, cy, dx, 6.5, 0, 0, TAU);
    ctx.fillStyle = vgradC(ctx, topY, topY + 13, mixToHex(capCol, '#fff3a0', 0.75), mixToHex(capCol, '#f0c040', 0.4));
    ctx.fill();
    ctx.strokeStyle = ol;
    ctx.lineWidth = 2.8;
    ctx.stroke();
    ctx.fillStyle = rgba('#8a5a10', 0.55);
    for (let i = 0; i < 7; i++) {
      ctx.beginPath();
      ctx.arc(cxp + (((i * 41 + p.id) % 13) / 13 - 0.5) * dx * 1.5, cy + 1.5 + (i % 3) * 1.2, 1.1, 0, TAU);
      ctx.fill();
    }
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cxp - dx * 0.7, topY + 1.4);
    ctx.lineTo(cxp + dx * 0.7, topY + 1.4);
    ctx.stroke();
    if (variant === 2 || pal.glow) {
      ctx.fillStyle = rgba(pal.glow ?? '#fff6c0', 0.3 + 0.2 * Math.sin(time * 2 + p.id));
      ctx.beginPath();
      ctx.ellipse(cxp, cy, dx * 0.7, 4, 0, 0, TAU);
      ctx.fill();
    }
  } else {
    // the cap, squashing about its rim
    const squash = 1 + Math.sin(time * 3 + p.id) * 0.05;
    ctx.translate(cxp, rimY);
    ctx.scale(1, squash);
    ctx.translate(-cxp, -rimY);
    const apex = topY - rimY; // negative: the cap's height above the rim
    const ctrl = apex * (4 / 3) - 1 / 3; // control height so the apex lands on the collision line
    const flat = species === 'parasol' ? 0.82 : 0.96;
    const capPath = () => {
      ctx.beginPath();
      ctx.moveTo(cxp - rad, rimY + 1);
      ctx.bezierCurveTo(cxp - rad * flat, rimY + ctrl, cxp + rad * flat, rimY + ctrl, cxp + rad, rimY + 1);
      if (species === 'parasol') {
        // a scalloped, frilled rim
        const n = 7;
        for (let i = 0; i < n; i++) {
          const xa = cxp + rad - ((i + 0.5) * 2 * rad) / n;
          const xb = cxp + rad - ((i + 1) * 2 * rad) / n;
          ctx.quadraticCurveTo(xa, rimY + 8, xb, rimY + 1);
        }
      } else {
        ctx.quadraticCurveTo(cxp, rimY + 8, cxp - rad, rimY + 1);
      }
      ctx.closePath();
    };
    capPath();
    const cg = ctx.createLinearGradient(0, topY, 0, rimY + 6);
    cg.addColorStop(0, ct.hi);
    cg.addColorStop(0.3, ct.light);
    cg.addColorStop(0.75, ct.mid);
    cg.addColorStop(1, ct.dark);
    ctx.fillStyle = cg;
    ctx.fill();
    if (species === 'parasol' && variant === 1) {
      // alternating panels in a second colour
      ctx.save();
      capPath();
      ctx.clip();
      ctx.fillStyle = rgba(at.light, 0.95);
      const n = 7;
      for (let i = 0; i < n; i += 2) {
        const xa = cxp - rad + (i * 2 * rad) / n;
        ctx.beginPath();
        ctx.moveTo(cxp, topY);
        ctx.lineTo(xa, rimY + 10);
        ctx.lineTo(xa + (2 * rad) / n, rimY + 10);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }
    capPath();
    ctx.strokeStyle = ol;
    ctx.lineWidth = 3;
    ctx.stroke();
    // a lit lip across the very top
    ctx.strokeStyle = rgba(lighten(capCol, 0.75), 0.9);
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(cxp - rad * 0.5, topY + 1.6);
    ctx.lineTo(cxp + rad * 0.5, topY + 1.6);
    ctx.stroke();
    // markings
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    if (species === 'toadstool') {
      const spots: ReadonlyArray<readonly [number, number, number]> =
        variant === 1
          ? [[-0.5, 0.5, 0.07], [-0.15, 0.55, 0.07], [0.2, 0.5, 0.07], [0.55, 0.52, 0.07], [0.0, 0.3, 0.1]]
          : [[-0.55, 0.42, 0.11], [0.05, 0.3, 0.13], [0.5, 0.45, 0.09], [-0.15, 0.62, 0.07]];
      for (const [dx, dy, dr] of spots) {
        ctx.beginPath();
        ctx.ellipse(cxp + dx * rad, topY + dy * capH, dr * rad, dr * rad * 0.7, 0, 0, TAU);
        ctx.fill();
      }
    } else {
      for (let i = 0; i < 9; i++) {
        const u = (i + 0.5) / 9;
        ctx.beginPath();
        ctx.arc(cxp - rad * 0.86 + u * rad * 1.72, topY + capH * (0.5 + 0.18 * Math.sin(u * Math.PI)), variant === 2 ? 1.3 : 1.9, 0, TAU);
        ctx.fill();
      }
      ctx.strokeStyle = rgba(ct.deep, 0.5);
      ctx.lineWidth = 1.1;
      for (let i = 1; i < 7; i++) {
        ctx.beginPath();
        ctx.moveTo(cxp, topY + 2);
        ctx.lineTo(cxp - rad * 0.95 + (i * rad * 1.9) / 7, rimY);
        ctx.stroke();
      }
    }
    if (pal.glow) {
      ctx.fillStyle = rgba(pal.glow, 0.25 + 0.15 * Math.sin(time * 2 + p.id));
      ctx.beginPath();
      ctx.ellipse(cxp, rimY + 2, rad * 0.9, 3, 0, 0, TAU);
      ctx.fill();
    }
  }
  ctx.restore();
  // up-arrow hint
  ctx.fillStyle = rgba('#ffffff', 0.55 + 0.35 * Math.sin(time * 4));
  ctx.beginPath();
  ctx.moveTo(cxp, topY - 24);
  ctx.lineTo(cxp - 7, topY - 14);
  ctx.lineTo(cxp + 7, topY - 14);
  ctx.closePath();
  ctx.fill();
}

function vgradC(ctx: CanvasRenderingContext2D, y0: number, y1: number, a: string, b: string): CanvasGradient {
  const g = ctx.createLinearGradient(0, y0, 0, y1);
  g.addColorStop(0, a);
  g.addColorStop(1, b);
  return g;
}

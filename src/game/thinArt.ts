/**
 * thinArt — painters for the thin, solid platforms: branch, log, stone (moss_stone) and ruin.
 *
 * Each draws one variant into platform space (see platformKit). The silhouette does the talking (a tapering limb, a
 * round log with a cut end, a stack of stones, a lintel on posts), the material comes from the world's palette, and the top
 * is always the same grammar: flat on y = 0, a lit lip, a darker underside.
 */
import { rgba, mixToHex, lighten } from './artKit.ts';
import {
  type Art, LW, rrPath, fillStroke, vgrad, hgrad, litLip, mossBlanket, leafAt, leafFan, hangVine, crackLine, glowAt, pebble, bracket, underShade, ruinStone,
} from './platformKit.ts';

const TAU = Math.PI * 2;

// ───────────────────────────── branch ─────────────────────────────

/** thickness of a limb at u (0 = thick end, 1 = tip) */
function limbThick(h: number, u: number, T0: number, T1: number) {
  return T1 + (T0 - T1) * Math.pow(1 - u, 1.55) + Math.sin(u * 5.1 + h) * 0.9;
}

export function drawBranch(a: Art) {
  const { c, w, h, pal, r, v } = a;
  const ol = pal.outline;
  const dir = a.side; // 1: thick end on the left
  const T0 = h * (v === 4 ? 1.35 : 1.08) + 2;
  const T1 = Math.max(12, h * 0.46);
  const X = (u: number) => (dir > 0 ? u * w : (1 - u) * w);
  const N = Math.max(10, Math.round(w / 12));

  // things that sit behind the limb: a second small limb, hanging leaves
  if (v === 1) {
    // a forking offshoot curving down from the underside
    const sx = X(0.42);
    const ex = X(0.42 + 0.16) + dir * 14;
    const sy = limbThick(h, 0.42, T0, T1) - 3;
    for (const [col, lw] of [[ol, 9], [pal.bark.mid, 5.4]] as const) {
      c.strokeStyle = col;
      c.lineWidth = lw;
      c.lineCap = 'round';
      c.beginPath();
      c.moveTo(sx, sy);
      c.quadraticCurveTo(sx + dir * 4, sy + 14, ex, sy + 22);
      c.stroke();
    }
    leafFan(a, ex, sy + 22, 5, 17, dir > 0 ? 0.5 : Math.PI - 0.5, 2.1);
  }

  // the body
  const underY = (x: number) => {
    const u = dir > 0 ? x / w : 1 - x / w;
    return limbThick(h, Math.min(1, Math.max(0, u)), T0, T1);
  };
  const bodyPath = () => {
    c.beginPath();
    const xa = dir > 0 ? 0 : w;
    const xb = dir > 0 ? w : 0;
    // top edge: flat on y = 0, tip end rounded
    c.moveTo(xa, 0);
    c.lineTo(xb - dir * 5, 0);
    c.quadraticCurveTo(xb + dir * 2.5, -0.5, xb + dir * 2, T1 * 0.5);
    c.quadraticCurveTo(xb + dir * 1.5, T1 * 0.95, xb - dir * 6, underY(xb - dir * 6));
    // underside back towards the thick end
    for (let i = N - 1; i >= 0; i--) {
      const x = X((i + 0.001) / N * 0.98 + 0.0);
      c.lineTo(x, underY(x));
    }
    // root flare: the limb bells out where it would meet the trunk, then frays to a rounded stub
    c.lineTo(xa, T0);
    c.quadraticCurveTo(xa - dir * 8, T0 + 3, xa - dir * 11, T0 * 0.62);
    c.quadraticCurveTo(xa - dir * 12, T0 * 0.18, xa - dir * 5, -0.5);
    c.closePath();
  };
  bodyPath();
  c.fillStyle = vgrad(c, 0, T0 + 4, [[0, pal.bark.light], [0.28, pal.bark.mid], [0.7, pal.bark.dark], [1, pal.bark.deep]]);
  c.fill();
  c.save();
  c.clip();
  // grain: lines that follow the taper
  const rows = v === 4 ? 6 : 4;
  c.lineCap = 'round';
  for (let k = 1; k <= rows; k++) {
    const f = k / (rows + 1);
    c.strokeStyle = rgba(pal.bark.deep, 0.34 + r() * 0.2);
    c.lineWidth = 0.9 + r() * 0.8;
    c.beginPath();
    for (let i = 0; i <= N; i++) {
      const x = X(i / N);
      const y = underY(x) * f + Math.sin(i * 1.7 + k * 2.1) * 0.8;
      if (i === 0) c.moveTo(x - dir * 10, y);
      else c.lineTo(x, y);
    }
    c.stroke();
  }
  // bark plates: short ticks
  for (let i = 0; i < w / 16; i++) {
    const x = r() * w;
    const y = 4 + r() * (underY(x) - 8);
    c.strokeStyle = rgba(pal.bark.deep, 0.4);
    c.lineWidth = 1.1;
    c.beginPath();
    c.moveTo(x, y);
    c.lineTo(x + (r() - 0.5) * 5, y + 3 + r() * 4);
    c.stroke();
  }
  // a knot
  if (v !== 2) {
    const kx = X(0.22 + r() * 0.5);
    const ky = underY(kx) * (0.45 + r() * 0.15);
    for (let q = 2; q >= 0; q--) {
      c.beginPath();
      c.ellipse(kx, ky, 2.6 + q * 2.3, 1.8 + q * 1.5, 0.1, 0, TAU);
      c.fillStyle = q === 0 ? pal.bark.deep : rgba(pal.bark.dark, 0.5);
      c.fill();
    }
  }
  // the hollow of a burl
  if (v === 4) {
    const hx = X(0.3);
    c.beginPath();
    c.ellipse(hx, T0 * 0.52, 5.5, 8, 0, 0, TAU);
    c.fillStyle = rgba('#0a0610', 0.9);
    c.fill();
    c.strokeStyle = rgba(pal.bark.light, 0.6);
    c.lineWidth = 1.6;
    c.stroke();
    if (pal.glow) glowAt(c, hx, T0 * 0.52, 14, pal.glow, 0.5);
  }
  underShade(a, T1 * 0.7, T0 + 6, 0.3);
  c.restore();
  bodyPath();
  c.strokeStyle = ol;
  c.lineWidth = LW;
  c.lineJoin = 'round';
  c.stroke();

  // the broken stub of an old twig under the thick end
  if (v === 0 || v === 3) {
    const sx = X(0.16);
    c.beginPath();
    c.moveTo(sx - 4, underY(sx) - 3);
    c.lineTo(sx - 3 - dir * 2, underY(sx) + 9);
    c.lineTo(sx + 5 - dir * 2, underY(sx) + 8);
    c.lineTo(sx + 5, underY(sx) - 3);
    c.closePath();
    fillStroke(c, pal.bark.dark, ol, 2);
    c.beginPath();
    c.ellipse(sx + 1 - dir * 2, underY(sx) + 8.4, 4.4, 1.7, 0, 0, TAU);
    fillStroke(c, pal.heart.mid, ol, 1.2);
  }
  // root fibres at the flare
  c.strokeStyle = ol;
  c.lineCap = 'round';
  for (let i = 0; i < 3; i++) {
    const x0 = X(0) - dir * (4 + i * 3);
    const y0 = T0 * (0.55 + i * 0.16);
    c.lineWidth = 2.4 - i * 0.5;
    c.beginPath();
    c.moveTo(x0, y0);
    c.quadraticCurveTo(x0 - dir * 3, y0 + 7, x0 - dir * 1, y0 + 12 + r() * 4);
    c.stroke();
  }

  // the lit top: moss over most of it, a short bare stretch near the tip
  const mx0 = dir > 0 ? -3 : w * 0.16;
  const mx1 = dir > 0 ? w * 0.84 : w + 3;
  mossBlanket(a, mx0, mx1, 4.5, 4);
  litLip(a, dir > 0 ? mx1 : 2, dir > 0 ? w - 3 : mx0, pal.lip.wood, 3);

  // dressing
  const tipX = X(1);
  if (v === 0 || v === 1 || v === 3) leafFan(a, tipX - dir * 3, T1 * 0.5, v === 1 ? 3 : 5, 18, dir > 0 ? -0.15 : Math.PI + 0.15, 2.4);
  if (v === 0) leafFan(a, X(0.08), 1, 3, 13, -Math.PI / 2, 1.4); // a sprig on the flare
  if (v === 2) {
    // vine lashings, a hanging tassel and a flower
    const wraps = 3;
    for (let k = 0; k < wraps; k++) {
      const x = X(0.22 + k * 0.24);
      const th = underY(x);
      for (const [col, lw] of [[ol, 5], [pal.vine.mid, 2.8]] as const) {
        c.strokeStyle = col;
        c.lineWidth = lw;
        c.beginPath();
        c.moveTo(x - 4, 2);
        c.quadraticCurveTo(x + 2, th * 0.6, x + 5, th + 1);
        c.stroke();
      }
    }
    hangVine(a, X(0.5), underY(X(0.5)) - 2, 22 + r() * 8);
    hangVine(a, X(0.78), underY(X(0.78)) - 2, 14 + r() * 8);
    leafFan(a, tipX - dir * 3, T1 * 0.5, 4, 16, dir > 0 ? -0.1 : Math.PI + 0.1, 2.2);
    flowerBud(a, X(0.36), -1, pal.accent);
  }
  if (v === 3) {
    // bracket fungi under the limb
    const fx = X(0.56);
    bracket(c, fx, underY(fx) - 2, 8, 6, mixToHex(pal.accent, '#ffffff', 0.15), ol, pal.glow);
    bracket(c, X(0.7), underY(X(0.7)) - 2, 5.5, 4.4, mixToHex(pal.accent, '#000000', 0.12), ol, pal.glow);
    // an orchid or bloom on the thick end
    flowerBud(a, X(0.12), -1, pal.flora[1 % pal.flora.length]);
  }
  if (v === 4) {
    leafFan(a, tipX - dir * 2, T1 * 0.5, 4, 15, dir > 0 ? -0.1 : Math.PI + 0.1, 2.2);
    // a split in the bark near the tip
    crackLine(c, X(0.7), 3, 9, 1.4, r, rgba(ol, 0.7), 1.4);
  }
}

/** a tiny bloom sitting on the top edge (kept under 9 px so the hero's feet are not hidden) */
function flowerBud(a: Art, x: number, y: number, col: string) {
  const { c, pal } = a;
  c.strokeStyle = pal.moss.deep;
  c.lineWidth = 1.8;
  c.beginPath();
  c.moveTo(x, y + 1);
  c.lineTo(x, y - 5);
  c.stroke();
  for (let i = 0; i < 5; i++) {
    const ang = (i / 5) * TAU - Math.PI / 2;
    c.beginPath();
    c.ellipse(x + Math.cos(ang) * 3.1, y - 7 + Math.sin(ang) * 3.1, 2.4, 1.8, ang, 0, TAU);
    c.fillStyle = col;
    c.fill();
    c.strokeStyle = rgba(pal.outline, 0.7);
    c.lineWidth = 0.9;
    c.stroke();
  }
  c.beginPath();
  c.arc(x, y - 7, 1.7, 0, TAU);
  c.fillStyle = '#fff3a0';
  c.fill();
}

// ───────────────────────────── log ─────────────────────────────

/** the cut end of a log: pale heartwood with growth rings */
function cutFace(a: Art, cx: number, cy: number, rx: number, ry: number, hollow = false) {
  const { c, pal } = a;
  c.beginPath();
  c.ellipse(cx, cy, rx, ry, 0, 0, TAU);
  c.fillStyle = hollow ? '#120a14' : vgrad(c, cy - ry, cy + ry, [[0, pal.heart.hi], [1, pal.heart.mid]]);
  c.fill();
  c.strokeStyle = pal.outline;
  c.lineWidth = 2.2;
  c.stroke();
  c.strokeStyle = rgba(hollow ? pal.heart.light : pal.bark.dark, hollow ? 0.8 : 0.7);
  c.lineWidth = 1.1;
  for (let k = 1; k <= 2; k++) {
    c.beginPath();
    c.ellipse(cx, cy, rx * (hollow ? 0.8 : 1 - k * 0.3), ry * (hollow ? 0.88 : 1 - k * 0.3), 0, 0, TAU);
    c.stroke();
    if (hollow) break;
  }
  if (!hollow) {
    c.beginPath();
    c.arc(cx, cy, 1.1, 0, TAU);
    c.fillStyle = pal.bark.dark;
    c.fill();
  } else if (pal.glow) {
    glowAt(c, cx, cy, ry, pal.glow, 0.45);
  }
}

export function drawLog(a: Art, hOverride?: number) {
  const { c, w, pal, r, v } = a;
  const ol = pal.outline;
  const hh = hOverride ?? a.h + 8;
  const rx = Math.min(9, hh * 0.26);
  const twin = v === 3;
  const thick = twin ? hh * 0.78 : hh;

  const logBody = (x0: number, x1: number, y0: number, th: number, endL: 'cut' | 'hollow' | 'round', endR: 'cut' | 'round' | 'jag') => {
    const rad = th * 0.34;
    c.beginPath();
    if (endR === 'jag') {
      c.moveTo(x0, y0);
      c.lineTo(x1 - 6, y0);
      c.lineTo(x1 + 1, y0 + th * 0.24);
      c.lineTo(x1 - 4, y0 + th * 0.42);
      c.lineTo(x1 + 2, y0 + th * 0.66);
      c.lineTo(x1 - 3, y0 + th);
      c.lineTo(x0 + rad, y0 + th);
      c.quadraticCurveTo(x0, y0 + th, x0, y0 + th - rad);
      c.closePath();
    } else {
      c.roundRect(x0, y0, x1 - x0, th, [Math.min(rad, 5), endR === 'round' ? rad : Math.min(rad, 5), endR === 'round' ? rad : Math.min(rad, 5), rad]);
    }
    c.fillStyle = vgrad(c, y0, y0 + th, [[0, pal.bark.light], [0.22, pal.bark.mid], [0.7, pal.bark.dark], [1, pal.bark.deep]]);
    c.fill();
    c.save();
    c.clip();
    // bark: long fissures and short plates
    c.lineCap = 'round';
    for (let k = 0; k < 3; k++) {
      const yy = y0 + th * (0.3 + k * 0.24) + (r() - 0.5) * 3;
      c.strokeStyle = rgba(pal.bark.deep, 0.42);
      c.lineWidth = 1.2 + r() * 0.8;
      c.beginPath();
      c.moveTo(x0 + 8, yy);
      for (let x = x0 + 8; x < x1 - 8; x += 22) c.quadraticCurveTo(x + 11, yy + (r() - 0.5) * 5, x + 22 + r() * 6, yy + (r() - 0.5) * 2);
      c.stroke();
    }
    for (let i = 0; i < (x1 - x0) / 14; i++) {
      const x = x0 + 8 + r() * (x1 - x0 - 16);
      const y = y0 + 5 + r() * (th - 10);
      c.strokeStyle = rgba(pal.bark.deep, 0.38);
      c.lineWidth = 1.1;
      c.beginPath();
      c.moveTo(x, y);
      c.lineTo(x + 2 + r() * 3, y + (r() - 0.5) * 5);
      c.stroke();
    }
    underShade(a, y0 + th * 0.5, y0 + th, 0.32);
    c.restore();
    c.strokeStyle = ol;
    c.lineWidth = LW;
    c.lineJoin = 'round';
    c.stroke();
    if (endL === 'cut' || endL === 'hollow') cutFace(a, x0 + 1, y0 + th / 2, rx, th / 2 - 0.5, endL === 'hollow');
    if (endR === 'cut') cutFace(a, x1 - 1, y0 + th / 2, rx, th / 2 - 0.5);
  };

  const sw = a.side;
  const endA: 'cut' | 'hollow' = v === 1 ? 'hollow' : 'cut';
  const endB: 'cut' | 'round' | 'jag' = v === 0 ? 'cut' : v === 1 ? 'cut' : v === 2 ? 'round' : 'jag';
  if (twin) {
    // a second, shorter log underneath, lashed on
    const lw2 = w * 0.78;
    const lx2 = sw > 0 ? w - lw2 + 3 : -3;
    logBody(lx2, lx2 + lw2, hh * 0.52, hh * 0.78, 'cut', 'round');
    for (const k of [0.3, 0.72]) {
      const x = w * k;
      for (const [col, lwd] of [[ol, 5], ['#c9a96a', 2.8]] as const) {
        c.strokeStyle = col;
        c.lineWidth = lwd;
        c.beginPath();
        c.moveTo(x, hh * 0.18);
        c.lineTo(x + 3, hh * 0.52 + hh * 0.5);
        c.stroke();
      }
    }
  }
  if (sw > 0) logBody(0, w, 0, thick, endA, endB);
  else {
    // mirrored: the cut end on the right
    c.save();
    c.translate(w, 0);
    c.scale(-1, 1);
    logBody(0, w, 0, thick, endA, endB);
    c.restore();
  }

  // moss on top, over the lit lip
  mossBlanket(a, 4, w - 4, 5, 5);
  // dressing
  if (v === 0) {
    leafFan(a, w * (sw > 0 ? 0.74 : 0.26), 2, 3, 12, -Math.PI / 2, 1.5);
    mossPatch(a, w * 0.35, thick * 0.78, 12);
  }
  if (v === 1) {
    // mushrooms by the hollow, a fern
    const bx = sw > 0 ? 6 : w - 6;
    mush(a, bx + sw * 8, thick + 1, 5.5, pal.flora[0]);
    mush(a, bx + sw * 17, thick + 1, 4, pal.flora[1 % pal.flora.length]);
    leafFan(a, w * (sw > 0 ? 0.7 : 0.3), 2, 4, 13, -Math.PI / 2, 1.8);
  }
  if (v === 2) {
    // shelf fungi on the flank
    bracket(a.c, w * 0.42, thick * 0.52, 8, 6, mixToHex(pal.accent, '#ffffff', 0.25), ol, pal.glow);
    bracket(a.c, w * 0.52, thick * 0.74, 6, 4.6, mixToHex(pal.accent, '#000000', 0.1), ol, pal.glow);
    bracket(a.c, w * 0.62, thick * 0.4, 5, 4, mixToHex(pal.accent, '#ffffff', 0.4), ol, pal.glow);
  }
  if (v === 3) mossPatch(a, w * 0.5, thick * 0.55, 10);
}

function mossPatch(a: Art, x: number, y: number, rw: number) {
  const { c, pal } = a;
  c.fillStyle = rgba(pal.moss.mid, 0.85);
  c.beginPath();
  c.ellipse(x, y, rw, 3.2, 0, 0, TAU);
  c.fill();
  c.fillStyle = rgba(pal.moss.light, 0.7);
  c.beginPath();
  c.ellipse(x - rw * 0.2, y - 1, rw * 0.5, 1.5, 0, 0, TAU);
  c.fill();
}

function mush(a: Art, x: number, y: number, s: number, col: string) {
  const { c, pal } = a;
  c.fillStyle = '#efe2c4';
  c.strokeStyle = pal.outline;
  c.lineWidth = 1.4;
  c.beginPath();
  c.roundRect(x - s * 0.22, y - s * 0.9, s * 0.44, s * 0.9, 1);
  c.fill();
  c.stroke();
  c.beginPath();
  c.moveTo(x - s * 0.7, y - s * 0.8);
  c.quadraticCurveTo(x, y - s * 1.9, x + s * 0.7, y - s * 0.8);
  c.closePath();
  c.fillStyle = col;
  c.fill();
  c.stroke();
  c.fillStyle = 'rgba(255,255,255,0.85)';
  c.beginPath();
  c.arc(x - s * 0.2, y - s * 1.25, s * 0.14, 0, TAU);
  c.fill();
  if (pal.glow) glowAt(c, x, y - s, s * 2.4, pal.glow, 0.25);
}

// ───────────────────────────── stone ─────────────────────────────

/** a chunk of rock with a flat top, chipped corners and an uneven underside */
function slabPath(a: Art, x0: number, x1: number, y0: number, th: number, chipL: number, chipR: number) {
  const { c, r } = a;
  const pts: Array<[number, number]> = [[x0 + chipL, y0], [x1 - chipR, y0]];
  if (chipR > 0) pts.push([x1, y0 + chipR * 0.9]);
  pts.push([x1 + 1, y0 + th * 0.55]);
  const n = Math.max(3, Math.round((x1 - x0) / 22));
  for (let i = 0; i <= n; i++) {
    const u = 1 - i / n;
    pts.push([x0 + (x1 - x0) * u, y0 + th - 2 - (i === 0 || i === n ? 5 : 0) + (r() - 0.5) * 4.5]);
  }
  pts.push([x0 - 1, y0 + th * 0.55]);
  if (chipL > 0) pts.push([x0, y0 + chipL * 0.9]);
  c.beginPath();
  c.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) {
    const [px, py] = pts[i - 1];
    const [qx, qy] = pts[i];
    c.quadraticCurveTo(px, py, (px + qx) / 2, (py + qy) / 2);
  }
  c.closePath();
}

function stoneFill(a: Art, x0: number, x1: number, y0: number, th: number, bevel = true) {
  const { c, pal } = a;
  const s = pal.stone;
  c.fillStyle = vgrad(c, y0, y0 + th, [[0, s.light], [0.3, s.mid], [1, s.dark]]);
  c.fill();
  c.save();
  c.clip();
  // light from the upper left: a lighter left flank and a shaded right flank
  c.fillStyle = hgrad(c, x0, x1, [[0, 'rgba(255,255,255,0.16)'], [0.45, 'rgba(255,255,255,0)'], [1, 'rgba(8,4,24,0.28)']]);
  c.fillRect(x0 - 2, y0, x1 - x0 + 4, th);
  if (bevel) {
    c.fillStyle = rgba(s.hi, 0.55);
    c.fillRect(x0 - 2, y0, x1 - x0 + 4, 4);
  }
  underShade(a, y0 + th * 0.55, y0 + th, 0.34);
  c.restore();
}

export function drawStone(a: Art) {
  const { c, w, h, pal, r, v } = a;
  const ol = pal.outline;
  const s = pal.stone;
  if (v === 0) {
    // a flat slab
    const th = h + 8;
    slabPath(a, 0, w, 0, th, 3 + r() * 6, 3 + r() * 6);
    stoneFill(a, 0, w, 0, th);
    c.save();
    c.clip();
    crackLine(c, w * (0.2 + r() * 0.2), th, th * 0.9, -Math.PI / 2 + (r() - 0.5) * 0.7, r, rgba(s.deep, 0.75), 1.5);
    crackLine(c, w * (0.6 + r() * 0.2), th, th * 0.55, -Math.PI / 2 + (r() - 0.5) * 0.9, r, rgba(s.deep, 0.7), 1.3);
    // a few flecks
    c.fillStyle = rgba(s.hi, 0.45);
    for (let i = 0; i < w / 26; i++) c.fillRect(6 + r() * (w - 12), 7 + r() * (th - 12), 2.4, 1.4);
    c.restore();
    slabPath(a, 0, w, 0, th, 0, 0);
    c.strokeStyle = ol;
    c.lineWidth = LW;
    c.lineJoin = 'round';
    c.stroke();
    mossBlanket(a, 2, w - 2, 4.5, 6);
    pebble(c, w * 0.12, th + 1, 4.5, 3.4, s, ol);
    pebble(c, w * 0.88, th, 3.6, 2.8, s, ol);
    leafFan(a, w * 0.76, 1, 3, 12, -Math.PI / 2, 1.4);
  } else if (v === 1) {
    // balanced rocks: a flat cap stone on a cluster of boulders
    const capH = 15;
    const bw = [w * 0.34, w * 0.4, w * 0.3];
    const bx = [w * 0.17, w * 0.5, w * 0.84];
    const bh = [h * 1.35 + 4, h * 1.7 + 6, h * 1.2 + 3];
    for (let i = 0; i < 3; i++) {
      const cy = capH + bh[i] * 0.42;
      c.beginPath();
      c.ellipse(bx[i], cy, bw[i] / 2, bh[i] / 2, (r() - 0.5) * 0.3, 0, TAU);
      c.fillStyle = vgrad(c, cy - bh[i] / 2, cy + bh[i] / 2, [[0, s.light], [0.55, s.mid], [1, s.deep]]);
      c.fill();
      c.strokeStyle = ol;
      c.lineWidth = 2.2;
      c.stroke();
      c.fillStyle = rgba(s.hi, 0.35);
      c.beginPath();
      c.ellipse(bx[i] - bw[i] * 0.16, cy - bh[i] * 0.18, bw[i] * 0.16, bh[i] * 0.1, -0.4, 0, TAU);
      c.fill();
    }
    slabPath(a, -2, w + 2, 0, capH, 2 + r() * 4, 2 + r() * 5);
    stoneFill(a, 0, w, 0, capH);
    slabPath(a, -2, w + 2, 0, capH, 0, 0);
    c.strokeStyle = ol;
    c.lineWidth = LW;
    c.stroke();
    mossBlanket(a, 0, w, 4, 5);
    for (const x of [w * 0.3, w * 0.7]) hangVine(a, x, capH - 2, 10 + r() * 10);
  } else if (v === 2) {
    // stacked flat stones, each narrower than the one above's neighbour: a cairn ledge
    const layers: Array<[number, number, number]> = [[0, w, 13], [w * 0.09 + r() * w * 0.06, w * 0.82, 12], [w * 0.22 + r() * w * 0.1, w * 0.52, 11]];
    let y = 0;
    for (let i = layers.length - 1; i >= 0; i--) {
      // draw bottom layer first
      const [lx, lw, lh] = layers[i];
      let yy = 0;
      for (let k = 0; k < i; k++) yy += layers[k][2] - 1;
      slabPath(a, lx, lx + lw, yy, lh + 3, 2, 3);
      stoneFill(a, lx, lx + lw, yy, lh + 3, i === 0);
      slabPath(a, lx, lx + lw, yy, lh + 3, 0, 0);
      c.strokeStyle = ol;
      c.lineWidth = i === 0 ? LW : 2.2;
      c.stroke();
      y = yy;
    }
    void y;
    mossBlanket(a, 1, w - 1, 4, 5);
    leafFan(a, w * 0.28, 1, 3, 11, -Math.PI / 2, 1.4);
  } else {
    // a split block with a fern growing from the crack
    const th = h + 10;
    slabPath(a, 0, w, 0, th, 5, 4 + r() * 5);
    stoneFill(a, 0, w, 0, th);
    const cx = w * (0.38 + r() * 0.24);
    c.save();
    c.clip();
    // the split: a dark wedge from the underside up into the block
    c.beginPath();
    c.moveTo(cx - 5, th + 2);
    c.lineTo(cx - 1.5, th * 0.45);
    c.lineTo(cx + 1, th * 0.2);
    c.lineTo(cx + 3, th * 0.5);
    c.lineTo(cx + 7, th + 2);
    c.closePath();
    c.fillStyle = rgba('#080410', 0.88);
    c.fill();
    if (pal.glow) {
      c.strokeStyle = rgba(pal.glow, 0.9);
      c.lineWidth = 1.4;
      c.beginPath();
      c.moveTo(cx - 0.5, th * 0.3);
      c.lineTo(cx + 0.5, th * 0.5);
      c.lineTo(cx - 1.5, th * 0.75);
      c.stroke();
      glowAt(c, cx, th * 0.55, 18, pal.glow, 0.35);
    }
    crackLine(c, w * 0.15, 4, th * 0.7, 1.2, r, rgba(s.deep, 0.65), 1.3);
    c.restore();
    slabPath(a, 0, w, 0, th, 0, 0);
    c.strokeStyle = ol;
    c.lineWidth = LW;
    c.stroke();
    mossBlanket(a, 2, w - 2, 4, 5);
    leafFan(a, cx, th - 1, 4, 14, Math.PI / 2, 2.4);
    pebble(c, w * 0.9, th, 3.6, 2.8, s, ol);
  }
}

// ───────────────────────────── ruin ─────────────────────────────

/** a carved glyph, 12 px across, drawn with the world's rune colour */
function glyph(a: Art, x: number, y: number, kind: number, col: string) {
  const { c } = a;
  c.save();
  c.translate(x, y);
  c.strokeStyle = col;
  c.lineWidth = 1.6;
  c.lineCap = 'round';
  c.lineJoin = 'round';
  c.beginPath();
  switch (kind % 5) {
    case 0: // spiral
      for (let i = 0; i < 24; i++) {
        const ang = i * 0.55;
        const rad = 0.7 + i * 0.22;
        const px = Math.cos(ang) * rad;
        const py = Math.sin(ang) * rad;
        if (i === 0) c.moveTo(px, py);
        else c.lineTo(px, py);
      }
      break;
    case 1: // eye
      c.moveTo(-6, 0);
      c.quadraticCurveTo(0, -6, 6, 0);
      c.quadraticCurveTo(0, 6, -6, 0);
      c.moveTo(1.8, 0);
      c.arc(0, 0, 1.8, 0, TAU);
      break;
    case 2: // key
      c.moveTo(-6, -2);
      c.lineTo(-6, 2);
      c.lineTo(0, 2);
      c.lineTo(0, -2);
      c.lineTo(6, -2);
      c.lineTo(6, 2);
      break;
    case 3: // sun
      c.arc(0, 0, 2.6, 0, TAU);
      for (let i = 0; i < 8; i++) {
        c.moveTo(Math.cos((i * TAU) / 8) * 4.6, Math.sin((i * TAU) / 8) * 4.6);
        c.lineTo(Math.cos((i * TAU) / 8) * 6.6, Math.sin((i * TAU) / 8) * 6.6);
      }
      break;
    default: // zigzag
      c.moveTo(-7, 2);
      c.lineTo(-3.5, -3);
      c.lineTo(0, 2);
      c.lineTo(3.5, -3);
      c.lineTo(7, 2);
  }
  c.stroke();
  c.restore();
}

/** creeping vine along a ruin: stronger in worlds 7-10 */
function creep(a: Art, x0: number, x1: number, y: number, count: number) {
  const { c, pal, r } = a;
  for (let i = 0; i < count; i++) {
    const x = x0 + (x1 - x0) * ((i + 0.3 + r() * 0.4) / count);
    hangVine(a, x, y, 12 + r() * 20, 0.7);
  }
  c.fillStyle = rgba(pal.moss.mid, 0.8);
}

export function drawRuin(a: Art) {
  const { c, w, h, pal, r, v, world } = a;
  const ol = pal.outline;
  const st = ruinStone(a);
  const rune = pal.glow ?? mixToHex(st.dark, pal.accent, 0.55);
  const strong = world >= 7;
  const fill = (x0: number, x1: number, y0: number, th: number, bevel = true) => {
    c.fillStyle = vgrad(c, y0, y0 + th, [[0, st.light], [0.35, st.mid], [1, st.dark]]);
    c.fill();
    c.save();
    c.clip();
    c.fillStyle = hgrad(c, x0, x1, [[0, 'rgba(255,255,255,0.14)'], [0.5, 'rgba(255,255,255,0)'], [1, 'rgba(8,4,24,0.26)']]);
    c.fillRect(x0 - 2, y0, x1 - x0 + 4, th);
    if (bevel) {
      c.fillStyle = rgba(st.hi, 0.6);
      c.fillRect(x0 - 2, y0, x1 - x0 + 4, 3.4);
    }
    underShade(a, y0 + th * 0.5, y0 + th, 0.3);
    c.restore();
  };

  if (v === 0) {
    // two courses of cut blocks under a capping slab
    const capH = 12;
    const th = h + 10;
    const nb = Math.max(2, Math.round(w / 44));
    const bwid = w / nb;
    const courseY = capH;
    // lower course
    c.beginPath();
    c.rect(2, courseY - 1, w - 4, th - courseY + 1);
    fill(2, w - 2, courseY - 1, th - courseY + 1, false);
    c.save();
    c.beginPath();
    c.rect(2, courseY - 1, w - 4, th - courseY + 1);
    c.clip();
    c.strokeStyle = rgba(st.deep, 0.9);
    c.lineWidth = 1.6;
    for (let i = 1; i < nb; i++) {
      c.beginPath();
      c.moveTo(i * bwid + (r() - 0.5) * 3, courseY);
      c.lineTo(i * bwid + (r() - 0.5) * 3, th);
      c.stroke();
    }
    glyph(a, bwid * (0.5 + Math.floor(r() * (nb - 1))), courseY + (th - courseY) / 2 + 1, a.id, rune);
    if (pal.glow) glowAt(c, w * 0.5, th * 0.6, 24, pal.glow, 0.12);
    c.restore();
    c.beginPath();
    c.rect(2, courseY - 1, w - 4, th - courseY + 1);
    c.strokeStyle = ol;
    c.lineWidth = LW;
    c.stroke();
    // chipped corner under the course
    c.fillStyle = rgba('#000', 0.0);
    // the cap slab, a little proud of the blocks
    c.beginPath();
    c.roundRect(-3, 0, w + 6, capH, [3, 3, 2, 2]);
    fill(-3, w + 3, 0, capH);
    c.strokeStyle = ol;
    c.lineWidth = LW;
    c.stroke();
    litLip(a, 0, w, pal.lip.ruin, 3);
    // a chipped notch in the cap, vines and a few weeds
    c.fillStyle = rgba(pal.moss.mid, 0.9);
    creep(a, 6, w - 6, capH - 1, strong ? 3 : 1);
    if (strong) leafFan(a, w * 0.2, 1, 2, 9, -Math.PI / 2, 1);
  } else if (v === 1) {
    // a lintel on two stubby posts: the gap beneath shows the sky
    const beamH = 16;
    const postH = h + 6;
    const pw = Math.min(20, w * 0.16);
    for (const px of [w * 0.07, w - w * 0.07 - pw]) {
      c.beginPath();
      c.rect(px, beamH - 2, pw, postH);
      fill(px, px + pw, beamH - 2, postH, false);
      c.strokeStyle = ol;
      c.lineWidth = 2.4;
      c.stroke();
      c.strokeStyle = rgba(st.deep, 0.8);
      c.lineWidth = 1.3;
      for (const yy of [beamH + 6, beamH + 14]) {
        c.beginPath();
        c.moveTo(px + 2, yy);
        c.lineTo(px + pw - 2, yy);
        c.stroke();
      }
    }
    c.beginPath();
    c.roundRect(-3, 0, w + 6, beamH, 3);
    fill(-3, w + 3, 0, beamH);
    c.strokeStyle = ol;
    c.lineWidth = LW;
    c.stroke();
    // a carved band along the beam
    c.save();
    c.beginPath();
    c.roundRect(-3, 0, w + 6, beamH, 3);
    c.clip();
    c.strokeStyle = rgba(rune, pal.glow ? 0.9 : 0.8);
    c.lineWidth = 1.3;
    c.beginPath();
    for (let x = 8; x < w - 8; x += 8) {
      c.moveTo(x, beamH - 4);
      c.lineTo(x + 4, beamH - 8);
      c.lineTo(x + 8, beamH - 4);
    }
    c.stroke();
    c.restore();
    litLip(a, 0, w, pal.lip.ruin, 3);
    creep(a, w * 0.1, w * 0.9, beamH - 1, strong ? 3 : 2);
  } else if (v === 2) {
    // cornice: a frieze of notches over a row of dentils
    const th = h + 8;
    c.beginPath();
    c.roundRect(-2, 0, w + 4, th, 3);
    fill(-2, w + 2, 0, th);
    c.save();
    c.clip();
    c.strokeStyle = rgba(st.deep, 0.85);
    c.lineWidth = 1.5;
    c.beginPath();
    c.moveTo(-2, 9);
    c.lineTo(w + 2, 9);
    c.stroke();
    c.strokeStyle = rgba(rune, pal.glow ? 0.9 : 0.75);
    c.lineWidth = 1.4;
    c.beginPath();
    for (let x = 6; x < w - 8; x += 12) {
      c.moveTo(x, 18);
      c.lineTo(x, 13);
      c.lineTo(x + 7, 13);
      c.lineTo(x + 7, 17);
      c.lineTo(x + 3, 17);
    }
    c.stroke();
    // dentils
    c.fillStyle = rgba(st.deep, 0.75);
    for (let x = 3; x < w - 6; x += 11) c.fillRect(x, th - 8, 6, 8);
    c.restore();
    c.beginPath();
    c.roundRect(-2, 0, w + 4, th, 3);
    c.strokeStyle = ol;
    c.lineWidth = LW;
    c.stroke();
    litLip(a, 0, w, pal.lip.ruin, 3);
    creep(a, w * 0.1, w * 0.9, 8, strong ? 2 : 1);
  } else {
    // a broken slab: one end stepped away, rubble beneath
    const th = h + 8;
    const cut = w * (0.18 + r() * 0.08);
    const sw = a.side;
    const brokenPath = () => {
      c.beginPath();
      if (sw > 0) {
        c.moveTo(0, 0);
        c.lineTo(w, 0);
        c.lineTo(w, th * 0.3);
        c.lineTo(w - cut * 0.6, th * 0.3);
        c.lineTo(w - cut * 0.6, th * 0.64);
        c.lineTo(w - cut, th * 0.64);
        c.lineTo(w - cut, th);
        c.lineTo(0, th);
      } else {
        c.moveTo(w, 0);
        c.lineTo(0, 0);
        c.lineTo(0, th * 0.3);
        c.lineTo(cut * 0.6, th * 0.3);
        c.lineTo(cut * 0.6, th * 0.64);
        c.lineTo(cut, th * 0.64);
        c.lineTo(cut, th);
        c.lineTo(w, th);
      }
      c.closePath();
    };
    brokenPath();
    fill(0, w, 0, th);
    c.save();
    brokenPath();
    c.clip();
    c.strokeStyle = rgba(st.deep, 0.85);
    c.lineWidth = 1.5;
    c.beginPath();
    c.moveTo(0, th * 0.52);
    c.lineTo(w, th * 0.52);
    c.stroke();
    glyph(a, w * (sw > 0 ? 0.36 : 0.64), th * 0.5 + 1, a.id + 2, rune);
    c.restore();
    brokenPath();
    c.strokeStyle = ol;
    c.lineWidth = LW;
    c.lineJoin = 'round';
    c.stroke();
    litLip(a, 0, w, pal.lip.ruin, 3);
    // rubble on the broken side
    const rx = sw > 0 ? w - cut * 0.5 : cut * 0.5;
    for (let i = 0; i < 3; i++) {
      c.beginPath();
      const bx = rx + (i - 1) * 7 + (r() - 0.5) * 3;
      const by = th + 3 + (i % 2) * 4;
      c.rect(bx - 4, by - 4, 8 - i, 6 - (i % 2));
      fillStroke(c, st.mid, ol, 1.6);
    }
    creep(a, w * 0.15, w * 0.85, 9, strong ? 3 : 1);
  }
}

export { lighten };

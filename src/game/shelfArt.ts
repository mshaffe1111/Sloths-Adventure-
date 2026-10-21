/**
 * shelfArt — the "ledge" look: a platform grown or built from something other than earth, wood or carved stone, one family per
 * world so each place has a ledge of its own.
 *   leaf   (worlds 1, 2, 4, 5, 7): a big folded leaf, a palm frond, a lily pad
 *   fungus (worlds 3, 6, 8): bracket fungus shelves, glowing in the dark worlds
 *   shard  (world 9): faceted basalt with ember cracks
 *   girder (world 10): riveted iron beams and a truss
 * The top is flat on y = 0 with the same lit lip as everything else standable.
 */
import { rgba, mixToHex } from './artKit.ts';
import { type Art, LW, fillStroke, vgrad, hgrad, litLip, leafAt, glowAt, underShade } from './platformKit.ts';
import { registerPainter } from './platformArt.ts';

const TAU = Math.PI * 2;

// ───────────────────────────── leaf ─────────────────────────────

function drawLeafLedge(a: Art) {
  const { c, w, h, pal, r, v } = a;
  const ol = pal.outline;
  const lf = pal.leaf;
  const depth = h * 0.95 + 4;
  if (v === 0) {
    // a broad blade seen edge-on: flat top, a lens belly, pointed tips
    const path = () => {
      c.beginPath();
      c.moveTo(-7, 6);
      c.quadraticCurveTo(-3, 0, 4, 0);
      c.lineTo(w - 4, 0);
      c.quadraticCurveTo(w + 3, 0, w + 7, 6);
      c.quadraticCurveTo(w * 0.78, depth * 1.12, w * 0.5, depth);
      c.quadraticCurveTo(w * 0.22, depth * 1.12, -7, 6);
      c.closePath();
    };
    path();
    c.fillStyle = vgrad(c, 0, depth, [[0, lf.light], [0.35, lf.mid], [1, lf.dark]]);
    c.fill();
    c.save();
    path();
    c.clip();
    // midrib and side veins
    c.strokeStyle = rgba(lf.deep, 0.65);
    c.lineWidth = 1.8;
    c.beginPath();
    c.moveTo(-6, 6);
    c.quadraticCurveTo(w * 0.5, depth * 0.62, w + 6, 6);
    c.stroke();
    c.lineWidth = 1.1;
    for (let x = 14; x < w - 8; x += 15) {
      const u = x / w;
      const ry = 6 + (depth * 0.62 - 6) * 2 * u * (1 - u) * 1.0;
      c.beginPath();
      c.moveTo(x, ry);
      c.lineTo(x + 7, ry - 8);
      c.moveTo(x, ry);
      c.lineTo(x + 7, ry + 8);
      c.stroke();
    }
    // a torn notch
    c.fillStyle = rgba('#000', 0);
    underShade(a, depth * 0.55, depth, 0.28);
    c.restore();
    path();
    c.strokeStyle = ol;
    c.lineWidth = LW;
    c.lineJoin = 'round';
    c.stroke();
    litLip(a, 2, w - 2, pal.lip.moss, 3.2);
    // a curled tip on the lighter end
    leafAt(c, w + 4, 5, 13, 4.2, 0.5, lf, ol, 1.5);
    leafAt(c, -5, 5, 11, 3.8, Math.PI - 0.5, lf, ol, 1.5);
  } else if (v === 1) {
    // a palm frond: a straight rib with leaflets drooping from it
    const n = Math.max(6, Math.round(w / 9));
    for (let i = 0; i < n; i++) {
      const u = (i + 0.5) / n;
      const x = 6 + u * (w - 12);
      const len = (h * 1.05 + 8) * (1 - Math.pow(Math.abs(2 * u - 1), 2.2) * 0.55) + r() * 3;
      const lean = 0.2 + (u - 0.5) * 0.5;
      leafAt(c, x, 3, len, 3.6, Math.PI / 2 + lean, i % 2 ? lf : { ...lf, mid: lf.light }, ol, 1.3);
    }
    // the rib
    c.beginPath();
    c.roundRect(-5, 0, w + 10, 7, 3.4);
    fillStroke(c, vgrad(c, 0, 7, [[0, pal.lip.moss], [0.4, lf.mid], [1, lf.deep]]), ol, 2.2);
    litLip(a, -2, w + 2, pal.lip.moss, 3);
    // a short stalk stub on one end
    c.beginPath();
    c.roundRect(a.side > 0 ? -12 : w + 2, 1, 10, 6, 3);
    fillStroke(c, pal.bark.mid, ol, 2);
  } else {
    // a lily pad: a shallow tray with a rim and radiating veins
    const path = () => {
      c.beginPath();
      c.moveTo(0, 2);
      c.quadraticCurveTo(-1, -3.5, 5, -3);
      c.lineTo(5, 0);
      c.lineTo(w - 5, 0);
      c.lineTo(w - 5, -3);
      c.quadraticCurveTo(w + 1, -3.5, w, 2);
      c.quadraticCurveTo(w + 1, depth * 0.55, w * 0.5, depth * 0.6);
      c.quadraticCurveTo(-1, depth * 0.55, 0, 2);
      c.closePath();
    };
    path();
    c.fillStyle = vgrad(c, 0, depth * 0.6, [[0, lf.light], [0.5, lf.mid], [1, lf.dark]]);
    c.fill();
    c.save();
    path();
    c.clip();
    c.strokeStyle = rgba(lf.deep, 0.55);
    c.lineWidth = 1.1;
    for (let i = 0; i < 9; i++) {
      const x = (w * (i + 0.5)) / 9;
      c.beginPath();
      c.moveTo(w * 0.5, depth * 0.2);
      c.lineTo(x, depth * 0.62);
      c.stroke();
    }
    underShade(a, depth * 0.3, depth * 0.6, 0.3);
    c.restore();
    path();
    c.strokeStyle = ol;
    c.lineWidth = LW;
    c.lineJoin = 'round';
    c.stroke();
    litLip(a, 6, w - 6, pal.lip.moss, 3);
    // a bud on the rim
    const bx = a.side > 0 ? w * 0.15 : w * 0.85;
    c.beginPath();
    c.ellipse(bx, -4, 4, 6, 0, 0, TAU);
    fillStroke(c, mixToHex(pal.accent, '#ffffff', 0.35), ol, 1.6);
  }
}

// ───────────────────────────── fungus ─────────────────────────────

function capColor(a: Art): string {
  const { pal } = a;
  if (pal.glow) return mixToHex(pal.glow, pal.bark.light, 0.45);
  return mixToHex(pal.flora[a.id % pal.flora.length], pal.heart.mid, 0.55);
}

function drawFungusLedge(a: Art) {
  const { c, w, h, pal, r, v } = a;
  const ol = pal.outline;
  const base = capColor(a);
  const tier = (x0: number, x1: number, y0: number, depth: number, spots: boolean) => {
    const path = () => {
      c.beginPath();
      c.moveTo(x0 - 3, y0 + 3);
      c.quadraticCurveTo(x0 - 3, y0, x0 + 4, y0);
      c.lineTo(x1 - 4, y0);
      c.quadraticCurveTo(x1 + 3, y0, x1 + 3, y0 + 3);
      c.quadraticCurveTo(x1 + 1, y0 + depth * 1.05, (x0 + x1) / 2, y0 + depth);
      c.quadraticCurveTo(x0 - 1, y0 + depth * 1.05, x0 - 3, y0 + 3);
      c.closePath();
    };
    if (pal.glow) glowAt(c, (x0 + x1) / 2, y0 + depth * 0.7, (x1 - x0) * 0.62, pal.glow, 0.32);
    path();
    c.fillStyle = vgrad(c, y0, y0 + depth, [[0, mixToHex(base, '#ffffff', 0.45)], [0.45, base], [1, mixToHex(base, pal.bark.deep, 0.6)]]);
    c.fill();
    c.save();
    path();
    c.clip();
    // growth rings: arcs that follow the belly
    c.lineWidth = 1.3;
    for (let k = 1; k <= 3; k++) {
      c.strokeStyle = rgba(pal.bark.deep, 0.3 + k * 0.08);
      c.beginPath();
      c.moveTo(x0 - 3, y0 + 3 + k);
      c.quadraticCurveTo((x0 + x1) / 2, y0 + depth * (0.62 + k * 0.12), x1 + 3, y0 + 3 + k);
      c.stroke();
    }
    if (spots) {
      c.fillStyle = rgba('#ffffff', 0.7);
      for (let i = 0; i < w / 22; i++) {
        c.beginPath();
        c.arc(x0 + 8 + r() * (x1 - x0 - 16), y0 + 6 + r() * (depth * 0.55), 1.6 + r() * 1.6, 0, TAU);
        c.fill();
      }
    }
    underShade(a, y0 + depth * 0.5, y0 + depth, 0.3);
    c.restore();
    path();
    c.strokeStyle = ol;
    c.lineWidth = LW;
    c.lineJoin = 'round';
    c.stroke();
    litLip(a, x0 + 1, x1 - 1, pal.lip.wood, 3.2, y0);
  };
  const d = h * 0.95 + 4;
  if (v === 0) {
    tier(0, w, 0, d, false);
  } else if (v === 1) {
    // two tiers joined by a short stalk
    const lw2 = w * 0.62;
    const lx2 = a.side > 0 ? w * 0.28 : w * 0.1;
    c.beginPath();
    c.roundRect(lx2 + lw2 * 0.4, d * 0.6, lw2 * 0.2, d * 0.9, 3);
    fillStroke(c, '#efe2c4', ol, 2);
    tier(lx2, lx2 + lw2, d * 0.95, d * 0.78, true);
    tier(0, w, 0, d * 0.95, false);
  } else {
    tier(0, w, 0, d, true);
    // gills peeking under the rim
    c.strokeStyle = rgba(pal.bark.deep, 0.5);
    c.lineWidth = 1;
    for (let x = 8; x < w - 8; x += 6) {
      c.beginPath();
      c.moveTo(x, 4);
      c.lineTo(x + (x - w / 2) * 0.05, d * (0.34 + 0.4 * Math.sin((x / w) * Math.PI)));
      c.stroke();
    }
    litLip(a, 2, w - 2, pal.lip.wood, 3.2);
  }
}

// ───────────────────────────── shard ─────────────────────────────

function drawShardLedge(a: Art) {
  const { c, w, h, pal, r, v } = a;
  const ol = pal.outline;
  const st = pal.stone;
  const ember = '#ff7a1a';
  const d = h * 1.1 + 8;
  const shade = (x0: number, x1: number, y0: number, y1: number) => {
    c.fillStyle = vgrad(c, y0, y1, [[0, st.light], [0.4, st.mid], [1, st.deep]]);
    c.fill();
  };
  if (v === 0 || v === 2) {
    // a faceted slab
    const pts: Array<[number, number]> = [[0, 2], [4, 0], [w - 4, 0], [w, 2]];
    const n = Math.max(3, Math.round(w / 30));
    for (let i = 0; i <= n; i++) pts.push([w - (w * i) / n - (i === 0 ? 3 : 0), d * (0.55 + 0.45 * (i % 2 ? r() * 0.5 : 0.7 + r() * 0.3))]);
    const path = () => {
      c.beginPath();
      c.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]);
      c.closePath();
    };
    path();
    shade(0, w, 0, d);
    c.save();
    path();
    c.clip();
    // facets
    c.strokeStyle = rgba(st.deep, 0.7);
    c.lineWidth = 1.3;
    for (let i = 4; i < pts.length - 1; i++) {
      c.beginPath();
      c.moveTo(pts[i][0], pts[i][1]);
      c.lineTo(pts[i][0] + (r() - 0.5) * 18, 3);
      c.stroke();
    }
    c.fillStyle = rgba('#ffffff', 0.08);
    c.fillRect(0, 0, w * 0.4, d);
    // ember crack
    const cx0 = w * (0.2 + r() * 0.2);
    c.strokeStyle = rgba(ember, 0.95);
    c.lineWidth = v === 2 ? 2.6 : 1.6;
    c.beginPath();
    c.moveTo(cx0, 3);
    c.lineTo(cx0 + 6, d * 0.3);
    c.lineTo(cx0 - 3, d * 0.55);
    c.lineTo(cx0 + 8, d);
    c.stroke();
    if (v === 2) {
      glowAt(c, cx0 + 2, d * 0.5, 26, ember, 0.4);
      c.strokeStyle = rgba('#ffd23a', 0.9);
      c.lineWidth = 1;
      c.stroke();
    }
    underShade(a, d * 0.4, d, 0.3);
    c.restore();
    path();
    c.strokeStyle = ol;
    c.lineWidth = LW;
    c.lineJoin = 'round';
    c.stroke();
    litLip(a, 3, w - 3, pal.lip.stone, 3.2);
    if (v === 2) {
      // a molten drip
      c.beginPath();
      c.ellipse(w * 0.3, d + 8, 2, 3.6, 0, 0, TAU);
      c.fillStyle = ember;
      c.fill();
    }
  } else {
    // basalt columns of different lengths
    const n = Math.max(3, Math.round(w / 26));
    const cw = w / n;
    for (let i = 0; i < n; i++) {
      const len = d * (0.55 + 0.45 * ((i * 37 + a.id) % 5) / 4);
      const x = i * cw;
      c.beginPath();
      c.moveTo(x, 0);
      c.lineTo(x + cw, 0);
      c.lineTo(x + cw, len - 3);
      c.lineTo(x + cw * 0.5, len + 3);
      c.lineTo(x, len - 3);
      c.closePath();
      c.fillStyle = hgrad(c, x, x + cw, [[0, st.light], [0.5, st.mid], [1, st.dark]]);
      c.fill();
      c.strokeStyle = ol;
      c.lineWidth = 2;
      c.lineJoin = 'round';
      c.stroke();
    }
    // the cap across the tops
    c.beginPath();
    c.roundRect(-2, 0, w + 4, 6, 2);
    fillStroke(c, vgrad(c, 0, 6, [[0, st.hi], [1, st.mid]]), ol, LW);
    litLip(a, 0, w, pal.lip.stone, 3.2);
    glowAt(c, w * 0.5, d * 0.8, w * 0.4, ember, 0.16);
  }
}

// ───────────────────────────── girder ─────────────────────────────

function drawGirderLedge(a: Art) {
  const { c, w, h, pal, v } = a;
  const ol = pal.outline;
  const st = pal.stone;
  const rivets = (x0: number, x1: number, y: number, step = 12) => {
    c.fillStyle = rgba(st.deep, 0.9);
    for (let x = x0; x < x1; x += step) {
      c.beginPath();
      c.arc(x, y, 1.5, 0, TAU);
      c.fill();
    }
  };
  if (v === 0) {
    // an I-beam: top flange, web with cut-outs, bottom flange
    const web = h * 0.9 + 6;
    c.beginPath();
    c.rect(2, 6, w - 4, web);
    fillStroke(c, hgrad(c, 0, w, [[0, st.mid], [1, st.dark]]), ol, 2.2);
    c.save();
    c.beginPath();
    c.rect(2, 6, w - 4, web);
    c.clip();
    c.fillStyle = rgba('#0a0610', 0.55);
    for (let x = 16; x < w - 10; x += 26) {
      c.beginPath();
      c.ellipse(x, 6 + web / 2, 6, web * 0.28, 0, 0, TAU);
      c.fill();
    }
    c.restore();
    for (const y of [0, 6 + web - 3]) {
      c.beginPath();
      c.roundRect(-3, y, w + 6, 7, 2);
      fillStroke(c, vgrad(c, y, y + 7, [[0, st.light], [1, st.dark]]), ol, 2.2);
    }
    rivets(8, w - 4, 3.4, 14);
    litLip(a, 0, w, pal.lip.stone, 3.2);
  } else if (v === 1) {
    // a grated plate
    const th = h * 0.7 + 8;
    c.beginPath();
    c.roundRect(-2, 0, w + 4, th, 3);
    fillStroke(c, vgrad(c, 0, th, [[0, st.light], [1, st.deep]]), ol, LW);
    c.save();
    c.beginPath();
    c.roundRect(-2, 0, w + 4, th, 3);
    c.clip();
    c.strokeStyle = rgba(st.deep, 0.85);
    c.lineWidth = 1.2;
    for (let x = 4; x < w; x += 7) {
      c.beginPath();
      c.moveTo(x, 7);
      c.lineTo(x, th);
      c.stroke();
    }
    c.beginPath();
    c.moveTo(0, th * 0.62);
    c.lineTo(w, th * 0.62);
    c.stroke();
    c.restore();
    litLip(a, 0, w, pal.lip.stone, 3.2);
    // a hazard stripe along the front edge
    c.save();
    c.beginPath();
    c.rect(0, 4.2, w, 3.2);
    c.clip();
    c.fillStyle = rgba(pal.accent, 0.9);
    for (let x = -8; x < w; x += 12) {
      c.beginPath();
      c.moveTo(x, 8);
      c.lineTo(x + 5, 4);
      c.lineTo(x + 9, 4);
      c.lineTo(x + 4, 8);
      c.fill();
    }
    c.restore();
  } else {
    // a truss: two chords and cross braces
    const th = h + 10;
    c.strokeStyle = ol;
    c.lineWidth = 5.4;
    c.lineCap = 'round';
    for (let x = 4; x < w - 12; x += 22) {
      c.beginPath();
      c.moveTo(x, 6);
      c.lineTo(x + 22, th - 3);
      c.moveTo(x + 22, 6);
      c.lineTo(x, th - 3);
      c.stroke();
    }
    c.strokeStyle = st.mid;
    c.lineWidth = 2.6;
    for (let x = 4; x < w - 12; x += 22) {
      c.beginPath();
      c.moveTo(x, 6);
      c.lineTo(x + 22, th - 3);
      c.moveTo(x + 22, 6);
      c.lineTo(x, th - 3);
      c.stroke();
    }
    for (const y of [0, th - 5]) {
      c.beginPath();
      c.roundRect(-3, y, w + 6, 7, 2);
      fillStroke(c, vgrad(c, y, y + 7, [[0, st.light], [1, st.dark]]), ol, 2.2);
    }
    rivets(8, w - 4, 3.4, 14);
    litLip(a, 0, w, pal.lip.stone, 3.2);
  }
}

function shelfPainter(world: number): (a: Art) => void {
  if (world === 3 || world === 6 || world === 8) return drawFungusLedge;
  if (world === 9) return drawShardLedge;
  if (world === 10) return drawGirderLedge;
  return drawLeafLedge;
}

registerPainter('shelf', { paint: (a) => shelfPainter(a.world)(a), pad: { x: 20, top: 22, bot: 44 } });

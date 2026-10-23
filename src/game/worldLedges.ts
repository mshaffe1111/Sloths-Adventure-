/**
 * worldLedges — the platform material each world is known by, so the place reads under Pokey's feet as well as behind him:
 *   jetty   (world 2)  the riverbank village's plank jetties on posts, and bundled reed floats
 *   slate   (world 4)  wet slate ledges off the cascades, dripping, with spray on the underside
 *   silk    (world 5)  a band of spider silk strung between two anchor threads, beaded with dew
 *   root    (world 6)  a mangrove root: a flat crown with prop roots arching down into the water
 *   basalt  (world 9)  hexagonal basalt column tops, and cooled lava crust with embers in the cracks
 *   steps   (world 10) cut mountain steps of grey stone, each with an iron ring, on the way up to the fortress
 * Same grammar as every other platform: the top is flat on y = 0 with a lit lip, the underside darker.
 */
import { rgba, mixToHex } from './artKit.ts';
import { type Art, LW, fillStroke, vgrad, hgrad, litLip, leafAt, leafFan, glowAt, underShade, crackLine, pebble } from './platformKit.ts';
import { registerPainter } from './platformArt.ts';

const TAU = Math.PI * 2;

// ───────────────────────────── jetty (world 2) ─────────────────────────────

function drawJetty(a: Art) {
  const { c, w, h, pal, r, v } = a;
  const ol = pal.outline;
  const wood = pal.heart;
  const bark = pal.bark;
  if (v === 0) {
    // a plank deck on two posts that run down out of sight, lashed with rope
    const deck = Math.max(12, h * 0.7);
    for (const px of [w * 0.16, w * 0.84]) {
      c.beginPath();
      c.moveTo(px - 6, deck - 2);
      c.lineTo(px + 6, deck - 2);
      c.lineTo(px + 4.5, deck + 52);
      c.lineTo(px - 4.5, deck + 52);
      c.closePath();
      c.save();
      c.fillStyle = vgrad(c, deck, deck + 52, [[0, bark.light], [0.6, bark.mid], [1, rgba(bark.deep, 0)]]);
      c.fill();
      c.restore();
      c.strokeStyle = rgba(ol, 0.8);
      c.lineWidth = 2;
      c.stroke();
      // rope lashing where post meets deck
      c.strokeStyle = '#d8c48a';
      c.lineWidth = 1.6;
      for (let k = 0; k < 3; k++) {
        c.beginPath();
        c.moveTo(px - 7, deck + 1 + k * 3);
        c.lineTo(px + 7, deck + 3 + k * 3);
        c.stroke();
      }
    }
    // planks across the deck
    const n = Math.max(3, Math.round(w / 22));
    const pw = w / n;
    for (let i = 0; i < n; i++) {
      const x0 = i * pw + 0.6;
      const dy = (r() - 0.5) * 1.2;
      c.beginPath();
      c.roundRect(x0, dy, pw - 1.2, deck, 2.5);
      c.fillStyle = vgrad(c, 0, deck, [[0, wood.light], [0.5, wood.mid], [1, wood.dark]]);
      c.fill();
      c.strokeStyle = ol;
      c.lineWidth = 1.8;
      c.stroke();
      // grain and a nail
      c.strokeStyle = rgba(wood.deep, 0.45);
      c.lineWidth = 1;
      c.beginPath();
      c.moveTo(x0 + pw * 0.3, 3);
      c.lineTo(x0 + pw * 0.35, deck - 3);
      c.stroke();
      c.fillStyle = rgba(ol, 0.7);
      c.beginPath();
      c.arc(x0 + pw * 0.5, deck * 0.3, 1.2, 0, TAU);
      c.fill();
    }
    litLip(a, 2, w - 2, pal.lip.wood, 3);
    // a reed tuft at one post
    leafFan(a, w * (r() > 0.5 ? 0.1 : 0.9), deck + 2, 4, 14, -Math.PI / 2, 0.9);
  } else {
    // a float of bundled reeds tied in three places
    const th = Math.max(14, h * 0.85);
    c.beginPath();
    c.moveTo(4, 0);
    c.lineTo(w - 4, 0);
    c.quadraticCurveTo(w + 4, th * 0.5, w - 6, th);
    c.lineTo(6, th);
    c.quadraticCurveTo(-4, th * 0.5, 4, 0);
    c.closePath();
    const reed = mixToHex(pal.leaf.mid, '#d8c48a', 0.55);
    c.fillStyle = vgrad(c, 0, th, [[0, mixToHex(reed, '#ffffff', 0.25)], [0.5, reed], [1, mixToHex(reed, '#000000', 0.35)]]);
    c.fill();
    c.save();
    c.clip();
    c.strokeStyle = rgba(mixToHex(reed, '#000000', 0.45), 0.55);
    c.lineWidth = 1;
    for (let y = 3; y < th; y += 3.2) {
      c.beginPath();
      c.moveTo(0, y + (r() - 0.5));
      c.lineTo(w, y + (r() - 0.5));
      c.stroke();
    }
    c.restore();
    c.strokeStyle = ol;
    c.lineWidth = LW;
    c.stroke();
    for (const tx of [w * 0.18, w * 0.5, w * 0.82]) {
      c.fillStyle = '#c4a46a';
      c.fillRect(tx - 3, -1, 6, th + 2);
      c.strokeStyle = rgba(ol, 0.8);
      c.lineWidth = 1.4;
      c.strokeRect(tx - 3, -1, 6, th + 2);
    }
    // the cut reed ends fan out at both sides
    for (const [x, dir] of [[2, -1], [w - 2, 1]] as const) {
      for (let k = 0; k < 4; k++) {
        c.strokeStyle = rgba(mixToHex(reed, '#000000', 0.3), 0.9);
        c.lineWidth = 1.6;
        c.beginPath();
        c.moveTo(x, 3 + k * (th / 4));
        c.lineTo(x + dir * (5 + r() * 4), 2 + k * (th / 4) + (r() - 0.5) * 3);
        c.stroke();
      }
    }
    litLip(a, 6, w - 6, pal.lip.moss, 3);
  }
}

// ───────────────────────────── slate (world 4) ─────────────────────────────

function drawSlate(a: Art) {
  const { c, w, h, pal, r, v } = a;
  const ol = pal.outline;
  const s = pal.stone;
  const slate = { light: mixToHex(s.light, '#5a7a8a', 0.35), mid: mixToHex(s.mid, '#3a5462', 0.45), dark: mixToHex(s.dark, '#1e2e3a', 0.5) };
  // thin stacked plates, each a little shorter than the one above, ends broken square
  const layers = v === 0 ? 3 : 2;
  let y = 0;
  const shapes: Array<[number, number, number, number]> = [];
  for (let i = 0; i < layers; i++) {
    const inset = i * (6 + r() * 8);
    const th = (v === 0 ? 7 : 10) + r() * 3 + (i === 0 ? h * 0.25 : 0);
    shapes.push([inset - (i === 0 ? 0 : r() * 3), w - inset + (i === 0 ? 0 : r() * 3), y, th]);
    y += th - 1;
  }
  for (let i = shapes.length - 1; i >= 0; i--) {
    const [x0, x1, y0, th] = shapes[i];
    c.beginPath();
    c.moveTo(x0, y0);
    c.lineTo(x1, y0);
    c.lineTo(x1 - 2, y0 + th);
    c.lineTo(x0 + 3, y0 + th);
    c.closePath();
    c.fillStyle = vgrad(c, y0, y0 + th, [[0, slate.light], [0.45, slate.mid], [1, slate.dark]]);
    c.fill();
    c.strokeStyle = ol;
    c.lineWidth = i === 0 ? LW : 2;
    c.lineJoin = 'round';
    c.stroke();
    // the wet sheen: a long thin highlight on each plate
    c.strokeStyle = rgba('#e8fbff', 0.35);
    c.lineWidth = 1.3;
    c.beginPath();
    c.moveTo(x0 + 6, y0 + 2.5);
    c.lineTo(x0 + (x1 - x0) * (0.35 + r() * 0.3), y0 + 2.5);
    c.stroke();
  }
  // drips and a thin trickle off the underside
  const bottom = y;
  for (let i = 0; i < Math.max(2, w / 40); i++) {
    const dx = 10 + r() * (w - 20);
    const len = 4 + r() * 9;
    c.strokeStyle = rgba('#cdf2ff', 0.7);
    c.lineWidth = 1.4;
    c.beginPath();
    c.moveTo(dx, bottom - 1);
    c.lineTo(dx, bottom + len);
    c.stroke();
    c.fillStyle = rgba('#e8fbff', 0.85);
    c.beginPath();
    c.arc(dx, bottom + len + 2.5, 1.7, 0, TAU);
    c.fill();
  }
  if (v === 1) {
    // a curtain of spray on one side
    const sx = r() > 0.5 ? w * 0.15 : w * 0.85;
    c.fillStyle = vgrad(c, bottom, bottom + 30, [[0, rgba('#e8fbff', 0.5)], [1, rgba('#e8fbff', 0)]]);
    c.fillRect(sx - 7, bottom - 1, 14, 30);
  }
  // a fringe of wet moss and one fern
  c.fillStyle = rgba(pal.moss.mid, 0.95);
  for (let x = 4; x < w - 4; x += 7 + r() * 6) {
    c.beginPath();
    c.ellipse(x, 0.5, 3.5 + r() * 2, 2.2, 0, 0, TAU);
    c.fill();
  }
  litLip(a, 2, w - 2, pal.lip.stone, 3);
  leafFan(a, w * (0.2 + r() * 0.6), 0, 3, 12, -Math.PI / 2, 1.2);
}

// ───────────────────────────── silk (world 5) ─────────────────────────────

function drawSilk(a: Art) {
  const { c, w, h, r, v } = a;
  const silk = '#f6eefc';
  const shadow = '#c8b4dc';
  const band = Math.max(9, h * 0.45);
  // the anchor threads: from each end up and out of sight, plus a few guy lines down
  c.lineCap = 'round';
  for (const [x, dir] of [[3, -1], [w - 3, 1]] as const) {
    for (let k = 0; k < 3; k++) {
      c.strokeStyle = rgba(silk, 0.75 - k * 0.18);
      c.lineWidth = 1.5 - k * 0.3;
      c.beginPath();
      c.moveTo(x, band * 0.4);
      c.lineTo(x + dir * (8 + k * 9), -54 + k * 10);
      c.stroke();
    }
    c.strokeStyle = rgba(silk, 0.4);
    c.lineWidth = 1;
    c.beginPath();
    c.moveTo(x, band);
    c.lineTo(x + dir * 14, band + 22);
    c.stroke();
  }
  // the band: many strands laid side by side, sagging very slightly under the top
  const strands = v === 0 ? 7 : 5;
  for (let i = 0; i < strands; i++) {
    const y = (i / (strands - 1)) * band;
    const sag = 1.5 + (i / strands) * 3;
    c.strokeStyle = i % 2 ? rgba(shadow, 0.95) : rgba(silk, 0.95);
    c.lineWidth = 2.1;
    c.beginPath();
    c.moveTo(1, y);
    c.quadraticCurveTo(w / 2, y + sag, w - 1, y);
    c.stroke();
  }
  // cross-wrapping where it was spun round and round
  c.strokeStyle = rgba(silk, 0.8);
  c.lineWidth = 1.1;
  for (let x = 8; x < w - 6; x += 11 + r() * 6) {
    c.beginPath();
    c.moveTo(x, -0.5);
    c.lineTo(x + 6, band + 3);
    c.stroke();
  }
  // dew beads that catch the light
  for (let i = 0; i < Math.max(3, w / 18); i++) {
    const x = 5 + r() * (w - 10);
    const y = band + 3 + r() * 2;
    glowAt(c, x, y, 5, '#ffffff', 0.5);
    c.fillStyle = rgba('#e8f6ff', 0.95);
    c.beginPath();
    c.arc(x, y, 1.6 + r(), 0, TAU);
    c.fill();
  }
  if (v === 1) {
    // a wrapped parcel hanging under it: something the queen has saved for later
    const px = w * (0.3 + r() * 0.4);
    c.strokeStyle = rgba(silk, 0.8);
    c.lineWidth = 1.2;
    c.beginPath();
    c.moveTo(px, band + 2);
    c.lineTo(px, band + 12);
    c.stroke();
    c.beginPath();
    c.ellipse(px, band + 19, 5, 8, 0, 0, TAU);
    c.fillStyle = vgrad(c, band + 11, band + 27, [[0, silk], [1, shadow]]);
    c.fill();
    c.strokeStyle = rgba(a.pal.outline, 0.6);
    c.lineWidth = 1.2;
    c.stroke();
  }
  // a soft lip, white-violet: silk, not wood
  litLip(a, 2, w - 2, '#fff6ff', 3);
}

// ───────────────────────────── root (world 6) ─────────────────────────────

function drawRoot(a: Art) {
  const { c, w, h, pal, r, v } = a;
  const ol = pal.outline;
  const bark = pal.bark;
  const crown = Math.max(13, h * 0.7);
  // prop roots: arches from the crown down into the water below
  const nProps = Math.max(2, Math.round(w / 46)) + (v === 1 ? 1 : 0);
  for (let i = 0; i < nProps; i++) {
    const x0 = w * ((i + 0.5) / nProps) + (r() - 0.5) * 10;
    const spread = 16 + r() * 18;
    const drop = 46 + r() * 22;
    for (const [col, lw] of [[ol, 9.5], [bark.mid, 6.2]] as const) {
      c.strokeStyle = col;
      c.lineWidth = lw;
      c.lineCap = 'round';
      c.beginPath();
      c.moveTo(x0, crown - 3);
      c.bezierCurveTo(x0 - spread * 0.4, crown + drop * 0.25, x0 - spread, crown + drop * 0.6, x0 - spread * 1.1, crown + drop);
      c.stroke();
      c.beginPath();
      c.moveTo(x0 + 2, crown - 3);
      c.bezierCurveTo(x0 + spread * 0.5, crown + drop * 0.3, x0 + spread * 0.9, crown + drop * 0.7, x0 + spread * 1.05, crown + drop + 4);
      c.stroke();
    }
    // a pale band where the tide reaches
    c.strokeStyle = rgba(pal.heart.light, 0.35);
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(x0 - spread * 0.95, crown + drop * 0.78);
    c.lineTo(x0 - spread * 1.05, crown + drop * 0.86);
    c.stroke();
  }
  // the crown: a thick knotted root lying along the top
  c.beginPath();
  c.moveTo(-4, crown * 0.3);
  c.quadraticCurveTo(-6, 0, 6, 0);
  c.lineTo(w - 6, 0);
  c.quadraticCurveTo(w + 6, 0, w + 4, crown * 0.35);
  const n = Math.max(4, Math.round(w / 20));
  for (let i = n; i >= 0; i--) {
    const x = (i / n) * w;
    c.lineTo(x, crown + Math.sin(i * 1.9 + a.id) * 2.5 + (i % 2 ? 2 : 0));
  }
  c.closePath();
  fillStroke(c, vgrad(c, 0, crown + 3, [[0, bark.light], [0.35, bark.mid], [1, bark.deep]]), ol);
  c.save();
  c.clip();
  // twisting grain
  c.strokeStyle = rgba(bark.deep, 0.55);
  c.lineWidth = 1.2;
  for (let k = 0; k < 3; k++) {
    c.beginPath();
    c.moveTo(0, 4 + k * 4);
    for (let x = 0; x <= w; x += 12) c.lineTo(x, 4 + k * 4 + Math.sin(x * 0.08 + k) * 2);
    c.stroke();
  }
  // a knot
  const kx = w * (0.25 + r() * 0.5);
  c.beginPath();
  c.ellipse(kx, crown * 0.55, 5, 3.4, 0, 0, TAU);
  c.fillStyle = bark.deep;
  c.fill();
  underShade(a, crown * 0.4, crown + 4, 0.35);
  c.restore();
  // hanging moss strands and a few pale barnacles
  for (let i = 0; i < Math.max(2, w / 50); i++) {
    const x = 8 + r() * (w - 16);
    c.strokeStyle = rgba(pal.moss.light, 0.75);
    c.lineWidth = 1.4;
    c.beginPath();
    c.moveTo(x, crown);
    c.quadraticCurveTo(x + 3, crown + 8, x - 1, crown + 14 + r() * 8);
    c.stroke();
  }
  for (let i = 0; i < 4; i++) pebble(c, 6 + r() * (w - 12), crown - 1 + r() * 2, 2.2, 1.6, pal.heart, ol);
  litLip(a, 3, w - 3, pal.lip.wood, 3);
}

// ───────────────────────────── basalt (world 9) ─────────────────────────────

function drawBasalt(a: Art) {
  const { c, w, h, pal, r, v } = a;
  const ol = pal.outline;
  const st = pal.stone;
  const ember = '#ff7a1a';
  const rock = { light: mixToHex(st.light, '#3a3434', 0.5), mid: mixToHex(st.mid, '#221e20', 0.6), deep: '#0e0a0c' };
  if (v === 0) {
    // the tops of hexagonal columns standing together, each a slightly different height below the flat top
    const n = Math.max(2, Math.round(w / 26));
    const cw = w / n;
    for (let i = 0; i < n; i++) {
      const x0 = i * cw;
      const len = 26 + h * 0.6 + r() * 26;
      c.beginPath();
      c.moveTo(x0 + 1, 0);
      c.lineTo(x0 + cw - 1, 0);
      c.lineTo(x0 + cw - 1, len);
      c.lineTo(x0 + cw * 0.5, len + 5);
      c.lineTo(x0 + 1, len);
      c.closePath();
      c.fillStyle = hgrad(c, x0, x0 + cw, [[0, rock.light], [0.45, rock.mid], [1, rock.deep]]);
      c.fill();
      c.strokeStyle = ol;
      c.lineWidth = 2;
      c.stroke();
      // the column's central face edge
      c.strokeStyle = rgba('#ffffff', 0.12);
      c.lineWidth = 1;
      c.beginPath();
      c.moveTo(x0 + cw * 0.5, 4);
      c.lineTo(x0 + cw * 0.5, len + 4);
      c.stroke();
      // embers glowing in the joints
      if (i > 0 && r() > 0.45) {
        glowAt(c, x0, len * 0.5, 12, ember, 0.35);
        c.strokeStyle = rgba(ember, 0.9);
        c.lineWidth = 1.4;
        c.beginPath();
        c.moveTo(x0, 6);
        c.lineTo(x0, len * (0.5 + r() * 0.4));
        c.stroke();
      }
    }
    // the hexagonal top faces, seen almost edge-on
    c.fillStyle = rgba(rock.light, 0.9);
    c.fillRect(0, 0, w, 3.5);
    c.strokeStyle = rgba(ol, 0.6);
    c.lineWidth = 1;
    for (let i = 1; i < n; i++) {
      c.beginPath();
      c.moveTo(i * cw, 0);
      c.lineTo(i * cw, 3.5);
      c.stroke();
    }
  } else {
    // a slab of cooled lava crust: ropey folds on top, glowing cracks underneath
    const th = Math.max(16, h * 0.9 + 6);
    c.beginPath();
    c.moveTo(0, 2);
    c.quadraticCurveTo(2, 0, 6, 0);
    c.lineTo(w - 6, 0);
    c.quadraticCurveTo(w - 2, 0, w, 2);
    for (let i = 8; i >= 0; i--) c.lineTo((i / 8) * w, th + (i % 2 ? 4 : -1) + r() * 3);
    c.closePath();
    c.fillStyle = vgrad(c, 0, th + 4, [[0, rock.light], [0.4, rock.mid], [1, rock.deep]]);
    c.fill();
    c.save();
    c.clip();
    // ropey pahoehoe folds
    c.strokeStyle = rgba('#ffffff', 0.1);
    c.lineWidth = 1.2;
    for (let x = 6; x < w; x += 9) {
      c.beginPath();
      c.arc(x, 2, 6, 0.2, Math.PI - 0.2);
      c.stroke();
    }
    for (let k = 0; k < Math.max(2, w / 45); k++) {
      const x = 8 + r() * (w - 16);
      glowAt(c, x, th * 0.7, 16, ember, 0.45);
      crackLine(c, x, th + 2, th * 0.75, -Math.PI / 2 + (r() - 0.5) * 0.8, r, rgba(ember, 0.95), 1.6);
    }
    underShade(a, th * 0.3, th + 4, 0.25);
    c.restore();
    c.strokeStyle = ol;
    c.lineWidth = LW;
    c.lineJoin = 'round';
    c.beginPath();
    c.moveTo(0, 2);
    c.quadraticCurveTo(2, 0, 6, 0);
    c.lineTo(w - 6, 0);
    c.quadraticCurveTo(w - 2, 0, w, 2);
    c.stroke();
  }
  litLip(a, 2, w - 2, pal.lip.stone, 3);
}

// ───────────────────────────── steps (world 10) ─────────────────────────────

function drawSteps(a: Art) {
  const { c, w, h, pal, r, v } = a;
  const ol = pal.outline;
  const st = pal.stone;
  const granite = { light: mixToHex(st.light, '#9a98a8', 0.4), mid: mixToHex(st.mid, '#5e5c6c', 0.45), dark: mixToHex(st.dark, '#2c2a38', 0.5) };
  const th = Math.max(18, h + 10);
  // a cut block: square edges, chisel marks, a worn dip in the middle of the tread
  c.beginPath();
  c.moveTo(0, 0);
  c.lineTo(w, 0);
  c.lineTo(w - 1, th);
  c.lineTo(1, th);
  c.closePath();
  c.fillStyle = vgrad(c, 0, th, [[0, granite.light], [0.3, granite.mid], [1, granite.dark]]);
  c.fill();
  c.save();
  c.clip();
  // courses: the block is laid as two or three dressed stones
  const n = v === 0 ? 2 : 3;
  c.strokeStyle = rgba(granite.dark, 0.9);
  c.lineWidth = 1.5;
  for (let i = 1; i < n; i++) {
    const x = (i / n) * w + (r() - 0.5) * 10;
    c.beginPath();
    c.moveTo(x, 3);
    c.lineTo(x, th);
    c.stroke();
  }
  // chisel marks
  c.strokeStyle = rgba('#ffffff', 0.13);
  c.lineWidth = 1;
  for (let i = 0; i < w / 9; i++) {
    const x = 4 + r() * (w - 8);
    const y = 6 + r() * (th - 10);
    c.beginPath();
    c.moveTo(x, y);
    c.lineTo(x + 4, y + 2.5);
    c.stroke();
  }
  // rain-dark streaks down the face
  c.fillStyle = rgba(granite.dark, 0.35);
  for (let i = 0; i < 3; i++) c.fillRect(6 + r() * (w - 12), 3, 2 + r() * 3, th);
  underShade(a, th * 0.45, th, 0.3);
  c.restore();
  c.strokeStyle = ol;
  c.lineWidth = LW;
  c.lineJoin = 'round';
  c.stroke();
  // an iron ring set in the face, for the chains that once hauled the stones up
  const rx = w * (0.25 + r() * 0.5);
  c.strokeStyle = ol;
  c.lineWidth = 3.4;
  c.beginPath();
  c.arc(rx, th * 0.6, 4.2, 0, TAU);
  c.stroke();
  c.strokeStyle = '#7a7486';
  c.lineWidth = 1.8;
  c.stroke();
  // the tread is worn into a shallow dip where a thousand feet have gone up
  c.fillStyle = rgba(granite.dark, 0.35);
  c.beginPath();
  c.ellipse(w * 0.5, 1.6, w * 0.3, 1.4, 0, 0, TAU);
  c.fill();
  litLip(a, 1, w - 1, pal.lip.ruin, 3);
  if (r() > 0.5) leafAt(c, w * (0.1 + r() * 0.15), 1, 9, 3, -1.2, pal.leaf, ol, 1.3);
}

registerPainter('jetty', { paint: drawJetty, pad: { x: 16, top: 18, bot: 72 } });
registerPainter('slate', { paint: drawSlate, pad: { x: 12, top: 18, bot: 52 } });
registerPainter('silk', { paint: drawSilk, pad: { x: 40, top: 62, bot: 40 } });
registerPainter('root', { paint: drawRoot, pad: { x: 40, top: 14, bot: 86 } });
registerPainter('basalt', { paint: drawBasalt, pad: { x: 12, top: 14, bot: 76 } });
registerPainter('steps', { paint: drawSteps, pad: { x: 12, top: 16, bot: 44 } });

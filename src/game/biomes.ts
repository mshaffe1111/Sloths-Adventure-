/**
 * biomes — what each of the ten worlds is made of.
 *
 * A recipe names the species that grow in three rows (hazy distant trees, a middle row, and the giants nearest the
 * camera), what carpets the forest floor, and what hangs from the top of the frame. The seed decides how many of
 * each, where, how tall, how crowded — so the same recipe never paints the same picture twice.
 */
import { getScratch } from './scratch.ts';
import { tone, mix, rgba, darken, type RNG, type Tone } from './artKit.ts';
import { paintTree, canopyMass, rootCurtain, leafSpray } from './rainforest.ts';
import { palmTree, bambooClump, giantMushroom, mangrove, cloudTree, treeFern, figRuin, charredTree } from './trees.ts';
import { bananaLeaf, fernFrond } from './flora.ts';
import { crag, roost, karst } from './territoryTrees.ts';
import type { Look } from './scenery.ts';

export type Species = 'giant' | 'palm' | 'bamboo' | 'mushroom' | 'mangrove' | 'cloud' | 'fern' | 'fig' | 'charred' | 'storm' | 'bloom' | 'crag' | 'roost' | 'karst';
type Floor = 'fern' | 'reed' | 'glow' | 'rock' | 'ash' | 'ruin';
type Hang = 'liana' | 'root' | 'stalactite' | 'moss' | 'embers' | 'none';

interface Row {
  /** how many trees fit in one tile */
  n: [number, number];
  haze: number;
  baseY: number;
  /** [species, weight] */
  mix: Array<[Species, number]>;
  /** where the top of the trunk sits (negative = runs off the top of the frame) */
  top: [number, number];
  /** trunk half-width */
  w: [number, number];
  crown: boolean;
}

interface Recipe {
  far: Row;
  mid: Row;
  giants: Row;
  floor: Floor;
  hang: Hang;
}

const FAR = (mixes: Row['mix'], extra: Partial<Row> = {}): Row => ({ n: [5, 7], haze: 0.55, baseY: 470, mix: mixes, top: [210, 300], w: [28, 42], crown: true, ...extra });
const MID = (mixes: Row['mix'], extra: Partial<Row> = {}): Row => ({ n: [3, 5], haze: 0.34, baseY: 452, mix: mixes, top: [150, 260], w: [46, 62], crown: true, ...extra });
const BIG = (mixes: Row['mix'], extra: Partial<Row> = {}): Row => ({ n: [2, 3], haze: 0.16, baseY: 440, mix: mixes, top: [-120, -120], w: [74, 100], crown: false, ...extra });

export const RECIPES: Record<number, Recipe> = {
  1: { far: FAR([['giant', 1]]), mid: MID([['giant', 1]]), giants: BIG([['giant', 1]]), floor: 'fern', hang: 'liana' },
  2: {
    far: FAR([['palm', 3], ['bamboo', 1]], { top: [190, 300] }),
    mid: MID([['palm', 3], ['bamboo', 2]], { top: [150, 250], w: [20, 28] }),
    giants: BIG([['palm', 3], ['bamboo', 2]], { n: [3, 4], top: [120, 220], w: [26, 34], crown: true, haze: 0.14 }),
    floor: 'reed',
    hang: 'liana',
  },
  3: {
    far: FAR([['mushroom', 3], ['giant', 1]], { top: [240, 330] }),
    mid: MID([['mushroom', 3], ['giant', 1]], { top: [200, 300] }),
    giants: BIG([['mushroom', 2], ['giant', 2]], { n: [3, 4] }),
    floor: 'glow',
    hang: 'stalactite',
  },
  // the Sky Sovereign is an eagle: this is cliff country, wet slate stacks with waterfalls and aeries on top
  4: {
    far: FAR([['crag', 2], ['cloud', 2]], { top: [90, 200], w: [26, 36], haze: 0.42 }),
    mid: MID([['crag', 2], ['cloud', 3], ['fern', 1]], { top: [70, 190], w: [28, 40], haze: 0.2 }),
    giants: BIG([['cloud', 3], ['fern', 2], ['crag', 1]], { n: [3, 4], top: [-60, 90], w: [34, 46] }),
    floor: 'rock',
    hang: 'moss',
  },
  5: {
    far: FAR([['giant', 1]]),
    mid: MID([['bloom', 1]]),
    giants: BIG([['bloom', 1]]),
    floor: 'fern',
    hang: 'liana',
  },
  6: {
    far: FAR([['mangrove', 1]], { top: [270, 340], baseY: 480 }),
    mid: MID([['mangrove', 1]], { top: [230, 320], baseY: 470 }),
    giants: BIG([['mangrove', 1]], { top: [150, 250], w: [34, 46], crown: true, baseY: 460 }),
    floor: 'reed',
    hang: 'moss',
  },
  7: {
    far: FAR([['fig', 2], ['giant', 1]], { n: [4, 5], top: [240, 320] }),
    mid: MID([['fig', 2], ['giant', 1]], { n: [3, 4], top: [180, 280] }),
    giants: BIG([['fig', 2], ['giant', 2]], { n: [3, 4], top: [-60, 140], w: [60, 84] }),
    floor: 'ruin',
    hang: 'liana',
  },
  // the Night-Wing Monarch is a bat: limestone tower karst with caves, and big figs where the flying foxes roost
  8: {
    far: FAR([['karst', 3], ['roost', 1]], { top: [120, 240], haze: 0.45 }),
    mid: MID([['karst', 2], ['roost', 2]], { top: [100, 220], haze: 0.26 }),
    giants: BIG([['roost', 2], ['karst', 1]], { n: [3, 4], top: [20, 140], w: [40, 56] }),
    floor: 'glow',
    hang: 'moss',
  },
  9: {
    far: FAR([['charred', 3], ['palm', 1]], { top: [230, 320] }),
    mid: MID([['charred', 3]], { top: [180, 290], w: [34, 46] }),
    giants: BIG([['charred', 3]], { n: [3, 4], top: [90, 230], w: [48, 62], crown: true }),
    floor: 'ash',
    hang: 'embers',
  },
  10: {
    far: FAR([['storm', 2], ['charred', 1]], { top: [200, 300] }),
    mid: MID([['storm', 2], ['cloud', 1]], { top: [150, 260] }),
    giants: BIG([['storm', 1], ['giant', 1]], { n: [3, 4] }),
    floor: 'rock',
    hang: 'moss',
  },
};

// ───────────────────────────── painting one stamp ─────────────────────────────

const rand = (r: RNG, [a, b]: [number, number]) => a + r() * (b - a);
const pick = <T,>(r: RNG, items: Array<[T, number]>): T => {
  const total = items.reduce((s, [, w]) => s + w, 0);
  let k = r() * total;
  for (const [it, w] of items) {
    k -= w;
    if (k <= 0) return it;
  }
  return items[0][0];
};

/** paint a species through a haze veil into the layer, wrapping around the tile edge */
function stamp(
  target: CanvasRenderingContext2D, species: Species, x: number, baseY: number, topY: number, w: number, crown: boolean,
  look: Look, r: RNG, haze: number, TW: number, res: number
) {
  if (species === 'giant' || species === 'bloom' || species === 'storm') {
    const wind = species === 'storm' ? (r() > 0.5 ? 1 : -1) : 0;
    paintTree(target, x, baseY, topY, look, r, {
      w, lean: species === 'storm' ? wind * (60 + r() * 50) : (r() - 0.5) * 80, haze, crown, detail: haze > 0.4 ? 0.2 : haze > 0.25 ? 0.6 : 1,
      wind, bloom: species === 'bloom',
    }, TW, res);
    return;
  }
  const size = species === 'palm' ? 150 + r() * 60 : species === 'mushroom' ? 80 + r() * 90 + (haze < 0.2 ? 60 : 0) : species === 'fig' ? 190 : species === 'mangrove' ? 150 + r() * 70 : species === 'fern' ? 150 + r() * 40 : species === 'roost' ? 200 + r() * 40 : species === 'crag' ? 170 : species === 'karst' ? 170 : 130;
  const reach = Math.max(260, size * 1.5 + w * 4);
  const top = Math.min(topY, 0) - 160;
  const pad = 40;
  const cw = Math.round(reach * 2 + pad * 2);
  const chh = Math.round(baseY - top + 220);
  const pw = Math.round(cw * res);
  const ph = Math.round(chh * res);
  const [tmp, c] = getScratch(pw, ph);
  c.scale(res, res);
  c.translate(cw / 2 - x, -top + pad);
  const o = { w, lean: (r() - 0.5) * (species === 'bamboo' ? 20 : 60), size };
  switch (species) {
    case 'palm': palmTree(c, x, baseY, topY, look, r, o); break;
    case 'bamboo': bambooClump(c, x, baseY, topY, look, r, { ...o, w: w * 0.6 }); break;
    case 'mushroom': giantMushroom(c, x, baseY, topY, look, r, { ...o, w: Math.max(14, size * 0.14) }); break;
    case 'mangrove': mangrove(c, x, baseY, topY, look, r, { ...o, w: Math.max(26, w * 0.8) }); break;
    case 'cloud': cloudTree(c, x, baseY, topY, look, r, o); break;
    case 'fern': treeFern(c, x, baseY, topY, look, r, { ...o, w: w * 0.5 }); break;
    case 'fig': figRuin(c, x, baseY, topY, look, r, { ...o, w: w * 0.9 }); break;
    case 'charred': charredTree(c, x, baseY, topY, look, r, o); break;
    case 'crag': crag(c, x, baseY, topY, look, r, { ...o, w: Math.max(26, w * 0.9) }); break;
    case 'roost': roost(c, x, baseY, topY, look, r, { ...o, w: Math.max(18, w * 0.45) }); break;
    case 'karst': karst(c, x, baseY, topY, look, r, { ...o, w: Math.max(30, w * 0.8) }); break;
  }
  if (haze > 0) {
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.globalCompositeOperation = 'source-atop';
    c.fillStyle = rgba(look.haze, haze);
    c.fillRect(0, 0, pw, ph);
  }
  for (const dx of [0, TW, -TW]) {
    const ox = x - cw / 2 + dx;
    if (ox > TW || ox + cw < 0) continue;
    target.drawImage(tmp, 0, 0, pw, ph, ox, top - pad, cw, chh);
  }
}

function paintRow(target: CanvasRenderingContext2D, row: Row, look: Look, r: RNG, TW: number, res: number) {
  const n = Math.round(rand(r, row.n));
  const jitter = TW / n * 0.5;
  for (let i = 0; i < n; i++) {
    const x = ((i + 0.5) / n) * TW + (r() - 0.5) * jitter * 1.4;
    const species = pick(r, row.mix);
    const top = row.top[0] === row.top[1] ? row.top[0] : rand(r, row.top);
    // keep species that need to be seen whole from running off the top
    const topY = species === 'giant' || species === 'storm' || species === 'bloom' || species === 'cloud' || species === 'fern' ? top : Math.max(top, 40);
    stamp(target, species, x, row.baseY + (r() - 0.5) * 16, topY, rand(r, row.w), row.crown && species !== 'cloud', look, r, row.haze, TW, res);
  }
}

// ───────────────────────────── forest floor and hanging things ─────────────────────────────

function reeds(ctx: CanvasRenderingContext2D, x: number, y: number, h: number, t: Tone, r: RNG) {
  const n = 5 + ((r() * 5) | 0);
  for (let i = 0; i < n; i++) {
    const bx = x + (i - n / 2) * 6 + (r() - 0.5) * 4;
    const bh = h * (0.6 + r() * 0.6);
    const lean = (r() - 0.5) * 30;
    ctx.strokeStyle = i % 2 ? t.mid : t.light;
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(bx, y);
    ctx.quadraticCurveTo(bx + lean * 0.3, y - bh * 0.6, bx + lean, y - bh);
    ctx.stroke();
    if (r() > 0.6) {
      // cattail head
      ctx.fillStyle = '#6a4a2a';
      ctx.beginPath();
      ctx.roundRect(bx + lean - 3, y - bh - 18, 6, 20, 3);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,230,180,0.35)';
      ctx.fillRect(bx + lean - 2, y - bh - 16, 1.6, 15);
    }
  }
}

function floor(target: CanvasRenderingContext2D, kind: Floor, look: Look, r: RNG, TW: number) {
  const wrap = (x: number, rad: number, fn: (x: number) => void) => {
    fn(x);
    if (x < rad) fn(x + TW);
    if (x > TW - rad) fn(x - TW);
  };
  const under = look.leaves.map((c) => tone(mix(c, look.haze, 0.25)));
  const glow = look.glow ?? look.rays;
  for (let x = 0; x < TW; x += kind === 'ruin' ? 70 : 46) {
    wrap(x, 130, (xx) => {
      const y = 448 + r() * 70;
      const t = under[(r() * under.length) | 0];
      const roll = r();
      switch (kind) {
        case 'fern':
          if (roll < 0.55) leafSpray(target, xx, y, 58 + r() * 40, t, r, 9, -Math.PI / 2, 2.8);
          else bananaLeaf(target, xx, y + 14, 80 + r() * 50, 30 + r() * 12, -Math.PI / 2 + (r() - 0.5) * 1.2, t, r);
          break;
        case 'reed':
          if (roll < 0.6) reeds(target, xx, y + 20, 90 + r() * 60, t, r);
          else leafSpray(target, xx, y, 50 + r() * 30, t, r, 8, -Math.PI / 2, 2.6);
          break;
        case 'glow': {
          if (roll < 0.35) {
            const s = 20 + r() * 26;
            target.fillStyle = '#e8d6b0';
            target.fillRect(xx - s * 0.1, y - s * 0.7, s * 0.2, s * 0.7);
            const ct = tone(look.crowns[(r() * look.crowns.length) | 0], '#2a0a40');
            const hg = target.createRadialGradient(xx, y - s * 0.8, 0, xx, y - s * 0.8, s * 2.2);
            hg.addColorStop(0, rgba(glow, 0.4));
            hg.addColorStop(1, rgba(glow, 0));
            target.fillStyle = hg;
            target.fillRect(xx - s * 2.2, y - s * 3, s * 4.4, s * 4.4);
            target.fillStyle = ct.mid;
            target.beginPath();
            target.ellipse(xx, y - s * 0.7, s * 0.6, s * 0.38, 0, Math.PI, 0);
            target.fill();
          } else if (roll < 0.7) fernFrond(target, xx, y + 16, 70 + r() * 40, -Math.PI / 2 + (r() - 0.5) * 1.2, t, r, 0.5);
          else leafSpray(target, xx, y, 46 + r() * 30, t, r, 8, -Math.PI / 2, 2.6);
          break;
        }
        case 'rock': {
          if (roll < 0.3) {
            const s = 36 + r() * 46;
            const rt = tone(mix(look.ground.stone, look.haze, 0.3));
            target.fillStyle = rt.mid;
            target.beginPath();
            target.ellipse(xx, y + 10, s, s * 0.5, 0, Math.PI, 0);
            target.fill();
            target.fillStyle = rgba(under[0].mid, 0.7);
            target.beginPath();
            target.ellipse(xx - s * 0.1, y - s * 0.32 + 10, s * 0.7, s * 0.18, 0, Math.PI, 0);
            target.fill();
          } else if (roll < 0.65) fernFrond(target, xx, y + 16, 80 + r() * 40, -Math.PI / 2 + (r() - 0.5) * 1.3, t, r, 0.5);
          else leafSpray(target, xx, y, 52 + r() * 30, t, r, 8, -Math.PI / 2, 2.6);
          break;
        }
        case 'ash': {
          if (roll < 0.45) {
            const s = 30 + r() * 40;
            const rt = tone('#3a2a2a');
            target.fillStyle = rt.mid;
            target.beginPath();
            target.moveTo(xx - s, y + 12);
            target.lineTo(xx - s * 0.5, y - s * 0.5);
            target.lineTo(xx + s * 0.1, y - s * 0.7);
            target.lineTo(xx + s * 0.8, y - s * 0.2);
            target.lineTo(xx + s, y + 12);
            target.fill();
            target.strokeStyle = rgba(glow, 0.55);
            target.lineWidth = 2;
            target.beginPath();
            target.moveTo(xx - s * 0.2, y + 8);
            target.lineTo(xx, y - s * 0.3);
            target.lineTo(xx + s * 0.3, y - s * 0.1);
            target.stroke();
          } else leafSpray(target, xx, y, 44 + r() * 30, tone(mix(look.leaves[1], '#3a1a10', 0.35)), r, 8, -Math.PI / 2, 2.4);
          break;
        }
        case 'ruin': {
          if (roll < 0.4) {
            const s = 34 + r() * 40;
            const st = tone(mix(look.ground.stone, look.haze, 0.3), '#201a10');
            target.save();
            target.translate(xx, y + 8);
            target.rotate((r() - 0.5) * 0.4);
            target.fillStyle = st.mid;
            target.fillRect(-s * 0.5, -s * 0.4, s, s * 0.5);
            target.fillStyle = st.light;
            target.fillRect(-s * 0.5, -s * 0.4, s, 4);
            target.strokeStyle = rgba(st.deep, 0.6);
            target.strokeRect(-s * 0.5, -s * 0.4, s, s * 0.5);
            target.restore();
          } else leafSpray(target, xx, y, 50 + r() * 30, t, r, 8, -Math.PI / 2, 2.6);
          break;
        }
      }
    });
  }
}

function hanging(target: CanvasRenderingContext2D, kind: Hang, look: Look, r: RNG, TW: number) {
  const L = look.crowns.map((c) => tone(c));
  const wrap = (x: number, rad: number, fn: (x: number) => void) => {
    fn(x);
    if (x < rad) fn(x + TW);
    if (x > TW - rad) fn(x - TW);
  };
  // dense foliage across the top edge in every world (cave worlds get it dark and sparse)
  const sparse = kind === 'stalactite';
  for (let x = 0; x < TW; x += sparse ? 280 : 170) {
    if (r() < (sparse ? 0.4 : 0.2)) continue;
    wrap(x, 200, (xx) => canopyMass(target, xx + r() * 90, -10 + r() * 40, 120 + r() * 60, 46 + r() * 20, L, r, 14, 44, true));
  }
  for (let x = 60; x < TW; x += 330) {
    wrap(x, 150, (xx) => {
      const px = xx + r() * 120;
      switch (kind) {
        case 'liana':
        case 'root':
          rootCurtain(target, px, 30 + r() * 20, 110, 120 + r() * 140, look.trunk[1], r, 7);
          break;
        case 'moss': {
          const m = tone(look.leaves[1] ?? look.leaves[0]);
          target.lineCap = 'round';
          for (let i = 0; i < 9; i++) {
            const sx = px + (i - 4) * 10 + (r() - 0.5) * 6;
            const len = 80 + r() * 150;
            target.strokeStyle = rgba(r() > 0.5 ? m.light : m.mid, 0.8);
            target.lineWidth = 2 + r() * 2.4;
            target.beginPath();
            target.moveTo(sx, 20);
            target.bezierCurveTo(sx + (r() - 0.5) * 12, 20 + len * 0.35, sx + (r() - 0.5) * 18, 20 + len * 0.7, sx + (r() - 0.5) * 12, 20 + len);
            target.stroke();
          }
          break;
        }
        case 'stalactite': {
          const st = tone(mix(look.ground.stone, '#102a30', 0.4));
          for (let i = 0; i < 4; i++) {
            const sx = px + (i - 1.5) * 30 + (r() - 0.5) * 14;
            const len = 70 + r() * 150;
            const w = 12 + r() * 16;
            const g = target.createLinearGradient(sx - w, 0, sx + w, 0);
            g.addColorStop(0, st.light);
            g.addColorStop(1, st.dark);
            target.fillStyle = g;
            target.beginPath();
            target.moveTo(sx - w, 0);
            target.lineTo(sx - w * 0.5, len * 0.5);
            target.lineTo(sx, len);
            target.lineTo(sx + w * 0.5, len * 0.5);
            target.lineTo(sx + w, 0);
            target.fill();
            // a glowing drip at the tip
            const glow = look.glow ?? look.rays;
            target.fillStyle = rgba(glow, 0.85);
            target.beginPath();
            target.arc(sx, len + 3, 2.4, 0, Math.PI * 2);
            target.fill();
          }
          break;
        }
        case 'embers':
          // smouldering vines
          rootCurtain(target, px, 30, 110, 130, '#3a1a12', r, 6);
          break;
        default:
          break;
      }
    });
  }
}

/** the whole middle layer of a world: three rows of its trees, the forest floor and things hanging from above */
export function paintBiomeMid(ctx: CanvasRenderingContext2D, world: number, look: Look, r: RNG, TW: number, res: number, hazeBand: (y0: number, y1: number, col: string, a: number) => void) {
  const rec = RECIPES[world] ?? RECIPES[1];
  // distant rows are hazy, so they are painted at a lower resolution and scaled up (much cheaper to bake)
  paintRow(ctx, rec.far, look, r, TW, res * 0.55);
  hazeBand(250, 480, look.haze, 0.3);
  paintRow(ctx, rec.mid, look, r, TW, res * 0.75);
  paintRow(ctx, rec.giants, look, r, TW, res);
  // forest floor: when the hero is up high the ground sits low on screen, so the trunks must land in dense
  // undergrowth rather than float in the haze
  const fl = ctx.createLinearGradient(0, 430, 0, 720);
  fl.addColorStop(0, rgba(darken(look.hills[2], 0.35), 0));
  fl.addColorStop(0.2, rgba(darken(look.hills[2], 0.35), 0.9));
  fl.addColorStop(1, rgba(darken(look.hills[2], 0.6), 1));
  ctx.fillStyle = fl;
  ctx.fillRect(0, 430, TW, 290);
  floor(ctx, rec.floor, look, r, TW);
  hanging(ctx, rec.hang, look, r, TW);
}


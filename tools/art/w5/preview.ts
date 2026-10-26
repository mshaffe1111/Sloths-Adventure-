/**
 * World 5's art in place (dev only, tools/art/w5/preview.html): a stage's painted backdrop for its light (?stage=5-1 ... 5-9, 5-M),
 * the World 5 kit drawn by the game's own painter (protoArt drawProtoScene) and the props laid out on it, framed the way the engine
 * frames a phone screen (upright: about 440 units of world across; sideways: 540 units high). ?x= moves the camera along. ?arena=table
 * or ?arena=webs shows the council's garden instead (w5Art drawW5Arena). Sets window.__ready when everything has loaded.
 */
import { renderScenery } from '../../../src/game/scenery.ts';
import { setBackdropStage, peekPainted, shownStem } from '../../../src/game/paintedBackdrops.ts';
import { drawProtoScene, protoArtReady, setKitWorld } from '../../../src/game/protoArt.ts';
import { drawCarving, drawW5, drawW5Arena, drawW5Box, drawW5Orchid, steamPuff, w5ArenaPicture, w5ArtReady, w5Height, type W5Piece } from '../../../src/game/w5Art.ts';
import { w5Mood } from '../../../src/game/w5Backdrop.ts';
import { STD_FRAMES, STD_STAND_H } from '../../../src/game/heroStandardData.ts';
import { STD_ATLAS_URL } from '../../../src/game/heroStandard.ts';
import type { Platform } from '../../../src/game/types.ts';

const q = new URLSearchParams(location.search);
const stage = q.get('stage') ?? '5-1';
const arena = q.get('arena') as 'table' | 'webs' | null;
const camX0 = Number(q.get('x') ?? 0);
const cv = document.getElementById('c') as HTMLCanvasElement;
const ctx = cv.getContext('2d', { alpha: false })!;
const tag = document.getElementById('tag')!;

setBackdropStage(stage);
setKitWorld(5);

const hero = new Image();
hero.src = STD_ATLAS_URL;

const G = 900;
let id = 1;
const plat = (x: number, y: number, width: number, height: number, style?: Platform['style']): Platform => ({ id: id++, x, y, width, height, type: 'solid', style });
// the ground, a raised bank, a mossy rock and a branch to stand on
const platforms: Platform[] = [
  plat(-400, G, 1500, 320),
  plat(1300, G - 70, 700, 390),
  plat(2140, G, 1400, 320),
  plat(760, G - 50, 120, 50, 'moss_stone'),
  plat(1460, G - 250, 220, 24, 'branch'),
];

/** a piece standing on the ground at x, h tall (or w wide when `w` is given) */
function stand(n: W5Piece, x: number, bottom: number, h: number, flip = false) {
  const f = w5Height(n, 100) / 100;
  drawW5(ctx, n, x, bottom, h / f, { flip });
}

function drawHero(x: number, bottom: number) {
  if (!hero.complete || !hero.naturalWidth) return;
  const f = STD_FRAMES.idle;
  const k = (66 * 1.35) / STD_STAND_H;
  ctx.drawImage(hero, f.x, f.y, f.w, f.h, x - f.ax * k, bottom - f.ay * k, f.w * k, f.h * k);
}

function props(t: number) {
  // 5-1's first tree, with Meeca's warning scratched on (the words are drawn by the game)
  stand('trunkTall', 60, G + 8, 330);
  drawCarving(ctx, 'trunkTall', 60, G + 8, (330 * 100) / w5Height('trunkTall', 100), ['POKEY.', "DON'T", 'SIT.', 'M.']);
  stand('fern', 180, G + 6, 70);
  drawHero(250, G);
  // the table set for two, and its soft chairs
  stand('armchairRose', 360, G + 4, 112);
  stand('teaTable', 470, G + 4, 104);
  stand('armchairLilac', 580, G + 4, 112, true);
  stand('teapot', 680, G + 2, 56);
  steamPuff(ctx, 702, G - 40, 0.6 + 0.4 * Math.sin(t * 2), t, 0.8);
  stand('cakePlate', 640, G + 2, 22);
  // the pickup cake, floating
  stand('cakeIcon', 820, G - 120 + Math.sin(t * 3) * 4, 34);
  // a closing orchid on the rock, half shut
  drawW5Orchid(ctx, 1000, G - 4, 110, 0.5 + 0.5 * Math.sin(t * 0.7));
  stand('wrappedChair', 1120, G + 4, 120);
  // up on the raised bank: a visitor who sat, the hanging cocoon under the branch, the bell flower, the lantern
  stand('wrappedArmchair', 1380, G - 66, 118);
  drawW5Box(ctx, 'doilyLong', 1440, G - 262, 260, 46);
  stand('cocoonHanging', 1570, G - 140, 120);
  stand('cocoonTorn', 1730, G - 66, 60);
  stand('orchidSprout', 1820, G - 66, 70);
  stand('bell', 1900, G - 150, 50);
  stand('silkSheet', 1960, G - 66, 170);
  // the silk bridge over the gap to the far bank
  drawW5Box(ctx, 'silkBridge', 1990, G - 110, 170, 60);
  stand('orchidRow', 2300, G - 160, 120);
  stand('trunkA', 2420, G + 8, 150);
  drawCarving(ctx, 'trunkA', 2420, G + 8, (150 * 100) / w5Height('trunkA', 100), ["DON'T", 'EAT']);
  stand('flag', 2560, G + 4, 120);
  stand('wrappedCup', 2660, G + 2, 34);
  stand('silkLump', 2720, G + 2, 26);
  stand('lantern', 2800, G + 4, 110);
  stand('totem', 2960, G + 6, 290);
  stand('orchidSprout2', 3080, G + 4, 60);
}

function frame(ms: number) {
  const t = ms / 1000;
  const dpr = window.devicePixelRatio || 1;
  const cw = cv.clientWidth, ch = cv.clientHeight;
  if (cv.width !== Math.round(cw * dpr)) { cv.width = Math.round(cw * dpr); cv.height = Math.round(ch * dpr); }
  const portrait = ch > cw;
  // (engine.ts applyZoom: upright fits 440 units across, sideways 540 units high)
  const zoom = Math.max(0.5, Math.min(1.8, portrait ? Math.max(cw / 440, ch / 1000) : ch / 540));
  const vw = cw / zoom, vh = ch / zoom;
  ctx.setTransform(dpr * zoom, 0, 0, dpr * zoom, 0, 0);
  const camX = camX0;
  const camY = G - vh * (portrait ? 0.7 : 0.76);
  if (arena) {
    ctx.fillStyle = '#2a2236';
    ctx.fillRect(0, 0, vw, vh);
    drawW5Arena(ctx, arena, vw, vh, G - camY, camX);
    drawHero(vw * 0.2, G - camY);
    tag.textContent = `arena: ${arena}  ${Math.round(cw)}x${Math.round(ch)}`;
    (window as unknown as { __ready?: boolean }).__ready = !!w5ArenaPicture(arena) && hero.complete;
  } else {
    renderScenery(ctx, 5, camX, camY, vw, vh, t);
    ctx.save();
    ctx.translate(-camX, -camY);
    drawProtoScene(ctx, platforms, [], [], t, { x0: camX, x1: camX + vw, y1: camY + vh }, { brokeAt: new Map(), movedAt: new Map() });
    props(t);
    ctx.restore();
    tag.textContent = `${stage} · ${w5Mood(stage)} · ${shownStem(5)}  ${Math.round(cw)}x${Math.round(ch)}`;
    (window as unknown as { __ready?: boolean }).__ready = !!peekPainted(5) && protoArtReady() && w5ArtReady() && hero.complete;
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

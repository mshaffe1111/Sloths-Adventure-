/**
 * meecaArt — the pictures of Meeca's stage (5-M, "On the March North"), built to the approved mock-ups (2026-10-28): Meeca herself
 * (meeca-standard's walk, run, jump and climb; her new poses from Matt's sheet for the cake, the trap chair, the silk, the teapot,
 * tiptoe, wonder and caught; her pinecone carry; meeca-carve at a trunk; meeca-blanket at the end), Flicker, the night camp, the trunks
 * with their words cut in the scratch alphabet letter by letter and the circle-and-finger guide the first time, the clearing's lantern
 * stakes, Lieutenant Pell and the General's soldiers (pell-anim / soldier-anim), her thoughts (a pink cloud) and the others' bubbles,
 * the night grade with its lights, the "On the March North" card and the story box of the ending.
 *
 * World pieces draw in world units; the overlays in CSS px. Every sheet draws a plain stand-in while it loads.
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
import { carvingTrunk, drawCarving } from './w5Look.ts';
import { shakyLetters } from './w5Kit.ts';
import { LOOK_S, type Guard, type MeecaPlay } from './meecaPlay.ts';
import { FLICKER_HINTS, MEECA_CARD, MEECA_SAY, type MeecaSceneLine, type Speaker } from './meecaLines.ts';
import { FLICKER_ANIM, FLICKER_ANIM_FPS, FLICKER_ANIM_H, FLICKER_ANIM_UP, FLICKER_ANIM_URL, FLICKER_SEQ } from './flickerAnimData.ts';
import type { MeecaStage, MeecaTrunk } from './meecaStage.ts';
import { drawGlow, drawNightPiece, nightArtReady } from './meecaNightArt.ts';
import type { NightArtName } from './meecaNightData.ts';
import type { KitPlay } from './puzzlePlay.ts';
import { CHAIR } from './puzzleKit.ts';
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
  FLICKER_CLIPS.ready();
  SOLDIER_CLIPS.ready();
  carveSheet();
  blanketSheet();
  nightArtReady();
}

// ───────────────────────────── Meeca ─────────────────────────────

/** which picture of hers she shows: a frame of meeca-standard ('std'), of her night sheet ('night'), carving, or in the blanket */
export function meecaPose(p: Player, mc: MeecaPlay, kit: KitPlay | null, t: number): { sheet: 'std' | 'night' | 'carve' | 'blanket'; name: string } {
  const std = (name: string) => ({ sheet: 'std' as const, name });
  const night = (name: NightArtName) => ({ sheet: 'night' as const, name });
  if (mc.wrapped) return { sheet: 'blanket', name: 'meeca_blanket' };
  if (mc.carvingNow) return { sheet: 'carve', name: 'carve' };
  if (mc.phase === 'look') return night(mc.lookT < LOOK_S + 1.2 ? 'mp15' : 'mp16');
  if (mc.phase === 'endingA' || mc.phase === 'endingB' || mc.phase === 'done') return mc.turned && mc.phase === 'endingA' ? night('mp16') : std(jennifurFrame('idle', t));
  const hp = kit?.heldPose();
  if (hp) {
    if (hp.kind === 'chair') return night(hp.t < 0.3 ? 'mp5' : 'mp6');
    if (hp.kind === 'chairHeld') return night(hp.dir > 0 ? 'mp7' : 'mp6');
    if (hp.kind === 'pop') return night('mp8');
    if (hp.kind === 'silk') return night('mp9');
    if (hp.kind === 'shake') return night('mp10');
    if (hp.kind === 'tip') return night(hp.t < 0.45 ? 'mp11' : 'mp12');
    if (hp.kind === 'sip') return std('sleepy');
  }
  const th = kit?.heldThing();
  const walking = Math.abs(p.vx) > 12;
  if (th?.variant === 'cake') {
    if (th.pose === 'pick' || th.pose === 'set') return night('mp1');
    if (th.pose === 'throw') return std('leap');
    return night(walking ? (Math.floor(p.walkCycle / 1.6) % 2 ? 'mp4' : 'mp3') : 'mp2');
  }
  if (th) {
    if (th.pose === 'pick') return night('mc1');
    if (th.pose === 'set') return night('mc13');
    if (th.pose === 'throw') return night(th.u < 0.33 ? 'mc9' : th.u < 0.66 ? 'mc10' : 'mc11');
    return night(walking ? (['mc5', 'mc6', 'mc7', 'mc8'] as const)[Math.floor(p.walkCycle / 1.4) % 4] : 'mc3');
  }
  if (p.climbing) return std(`climb_${Math.floor(Math.abs(p.y) / 9) % 6}`);
  if (!p.grounded) return std(p.vy < 0 ? 'jump_up' : 'jump_fall');
  if (p.ducking) return std('crouch');
  const v = Math.abs(p.vx);
  if (mc.tiptoe) return night(v > 8 ? (Math.floor(p.walkCycle / 1.3) % 2 ? 'mp14' : 'mp13') : 'mp13');
  if (v > 150) return std(`run_${Math.floor(p.walkCycle / 1.7) % 7}`);
  if (v > 8) return std(`walk_${Math.floor(p.walkCycle / 1.05) % 8}`);
  return std(jennifurFrame('idle', t));
}

/** Meeca, the player, with her feet at (p.x, p.y) */
export function drawMeecaHero(ctx: CanvasRenderingContext2D, p: Player, mc: MeecaPlay, kit: KitPlay | null, t: number) {
  const pose = meecaPose(p, mc, kit, t);
  ctx.save();
  ctx.translate(p.x, p.y);
  if (p.grounded && !p.climbing) {
    ctx.fillStyle = 'rgba(10, 8, 30, 0.34)';
    ctx.beginPath();
    ctx.ellipse(0, 1, p.ducking ? 26 : 20, 5, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  const flip = p.facing < 0;
  let ok = false;
  // (sat in the soft chair, her picture is the chair with her in it: drawn on the floor, its seat under her)
  const inChair = pose.name === 'mp5' || pose.name === 'mp6' || pose.name === 'mp7';
  if (pose.sheet === 'night') ok = drawNightPiece(ctx, pose.name as NightArtName, 0, inChair ? CHAIR.seat + 4 : 2, { flip });
  else {
    if (flip) ctx.scale(-1, 1);
    if (pose.sheet === 'carve') {
      const img = carveSheet();
      const f = MEECA_CARVE_FRAMES[MEECA_CARVE_SEQ[Math.floor(t * MEECA_CARVE_FPS) % MEECA_CARVE_SEQ.length]];
      if (img && f) {
        ctx.drawImage(img, f.x, f.y, f.w, f.h, -f.ax * K, -f.ay * K, f.w * K, f.h * K);
        ok = true;
      } else ok = drawMeecaFrame(ctx, 'pickup', 1, 1, flip);
    } else if (pose.sheet === 'blanket') {
      const img = blanketSheet();
      const f = MEECA_BLANKET_FRAMES.meeca_blanket;
      const k = K / MEECA_BLANKET_UP;
      if (img && f) {
        ctx.drawImage(img, f.x, f.y, f.w, f.h, -f.ax * k, -f.ay * k, f.w * k, f.h * k);
        ok = true;
      }
    } else if (MEECA_FRAMES[pose.name]) ok = drawMeecaFrame(ctx, pose.name, 1, 1, flip);
  }
  if (!ok) {
    // (the sheet is on its way: a plain pink figure)
    if (flip && pose.sheet === 'night') ctx.scale(-1, 1);
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

/** what she carries, when her pose has no hands for it (the cake's poses and the pinecone's hold it painted): never, here */
export const MEECA_HOLDS_PAINTED = true;

// ───────────────────────────── Flicker ─────────────────────────────

/**
 * Flicker's clips (flicker-anim.webp, 2026-10-29: his own painted frames made into short clips with the motion model, every one of them
 * him hovering in place): blinking while he keeps her company, talking, smug the first time he speaks, a shrug when he has nothing to
 * add, glowing brighter at a trunk to carve, startled then worried when Pell steps out, happy at the moonflower, sad and small once he
 * says the light was his, dozing off when she stands still a while, a turn when he swaps sides, leading the way (a look ahead) as he
 * flies with her, and a dash when he darts off to a trunk. His frames face right.
 */
const FLICKER_CLIPS = makeCreatureAnim(FLICKER_ANIM_URL, FLICKER_ANIM, FLICKER_SEQ, FLICKER_ANIM_UP);
/** how tall he is drawn, world px (his old frames stood about 38 tall), and how far over his perch his middle sits */
export const FLICKER_DRAW_H = 40;
const FLICKER_MID = -5;
/** seconds she stands still before he nods off; his turn, played at twice the clips' rate, and the least time between two turns */
export const FLICKER_DOZE_S = 8;
const TURN_S = FLICKER_SEQ.turn.length / (FLICKER_ANIM_FPS * 2);
const TURN_GAP = 2.5;

export type FlickerMove = 'talk' | 'blink' | 'glow' | 'happy' | 'sad' | 'doze' | 'smug' | 'startled' | 'worried' | 'shrug' | 'turn' | 'lead' | 'dart';
/** how fast he flies (world px a second) to lead the way with a look ahead, and to dash (his dart, played through once) */
export const FLICKER_LEAD_V = 60;
export const FLICKER_DART_V = 260;
const DART_S = FLICKER_SEQ.dart.length / FLICKER_ANIM_FPS;

/** what he is doing now (pure: the stage's state, how long she has stood still, whether he is in a turn or a dash, how fast he flies) */
export function flickerMove(mc: Pick<MeecaPlay, 'phase' | 'small' | 'bubble' | 'sceneLine' | 'ringOn' | 'carveSpot' | 'line' | 'lineAt' | 't'>, still: number, turning: boolean, darting = false, speed = 0): FlickerMove {
  if (mc.small && (mc.phase === 'endingB' || mc.phase === 'done')) return 'sad';
  if (mc.phase === 'endingA' || mc.phase === 'endingB' || mc.phase === 'done') {
    if (mc.phase === 'endingA' && mc.line === 0 && mc.t - mc.lineAt < 1.6) return 'startled';
    return mc.sceneLine?.who === 'Flicker' ? 'talk' : 'worried';
  }
  if (mc.phase === 'look') return 'happy';
  if (turning) return 'turn';
  if (mc.bubble?.who === 'flicker') {
    const text = mc.bubble.text;
    if (text === MEECA_SAY.flicker.text) return 'smug';
    if (text === REMIND_MARK || FLICKER_HINTS.none.includes(text)) return 'shrug';
    return 'talk';
  }
  if (mc.ringOn >= 0 || mc.carveSpot) return 'glow';
  if (darting) return 'dart';
  if (speed >= FLICKER_LEAD_V) return 'lead';
  // (the last tree, Pell waiting by it: he keeps close and anxious)
  if (mc.phase === 'last') return 'worried';
  if (mc.phase === 'play' && still >= FLICKER_DOZE_S) return 'doze';
  return 'blink';
}
/** his reminder when she walks past a trunk unmarked (meecaPlay.ts 'remindMark') */
const REMIND_MARK = 'Mark it. Then you can find your way back.';

/** what he remembers between frames: which way he faced, when he last turned, where she stood and since when */
const fl = { face: 0, turnAt: -99, px: NaN, stillSince: 0, move: '' as FlickerMove | '', moveAt: 0, x: NaN, y: 0, t: 0, v: 0, vx: 0, dartAt: -99 };
/** the moves that end somewhere else than they start (he sinks down sad, nods off, jumps and shuts his eyes): played through once, then
 * rocking gently over their second half, never back to the start */
const SETTLE: ReadonlySet<FlickerMove> = new Set(['sad', 'doze', 'startled']);
/** the moves played once and held at their end (his dash is only its first half second: the clip stops dead after it) */
const ONCE: ReadonlySet<FlickerMove> = new Set(['dart']);
/** his frame `s` seconds into a move */
export function flickerFrame(move: FlickerMove, s: number, turnS: number): string {
  const seq = FLICKER_SEQ[move];
  const n = seq.length;
  if (move === 'turn') return seq[Math.max(0, Math.min(n - 1, Math.floor((s / turnS) * n)))];
  const i = Math.max(0, Math.floor(s * FLICKER_ANIM_FPS));
  if (ONCE.has(move)) return seq[Math.min(n - 1, i)];
  if (SETTLE.has(move)) {
    if (i < n) return seq[i];
    const h = Math.floor(n / 2);
    const m = (i - n) % (2 * (n - 1 - h));
    return seq[m < n - 1 - h ? n - 1 - m : h + (m - (n - 1 - h))];
  }
  // (the others go back and forth, so the clip's two ends never jump)
  const m = i % (2 * n - 2);
  return seq[m < n ? m : 2 * n - 2 - m];
}

/** Flicker: his clips (his old frames of wings while they load), his glowing tail, a little smaller when he says the light was his */
export function drawFlicker(ctx: CanvasRenderingContext2D, mc: MeecaPlay, p: Player, t: number) {
  const f = mc.flicker;
  if (!f.on || f.show <= 0.01) return;
  const talking = mc.bubble?.who === 'flicker';
  const sad = mc.small && (mc.phase === 'endingB' || mc.phase === 'done');
  const showing = mc.ringOn >= 0;
  // (how fast he flies, smoothed over a few frames, and which way across; a burst past FLICKER_DART_V starts a dash)
  const dt = t - fl.t;
  if (dt > 0 && dt < 0.5 && !Number.isNaN(fl.x)) {
    const k = Math.min(1, dt * 6);
    fl.v += (Math.hypot(f.x - fl.x, f.y - fl.y) / dt - fl.v) * k;
    fl.vx += ((f.x - fl.x) / dt - fl.vx) * k;
  } else if (dt !== 0) fl.v = fl.vx = 0;
  fl.x = f.x;
  fl.y = f.y;
  fl.t = t;
  if (fl.v >= FLICKER_DART_V && t - fl.dartAt > DART_S + 1) fl.dartAt = t;
  // (flying along he faces the way he flies; still, he faces her. A change of side is a turn, at most every TURN_GAP s, else a flip)
  const face = fl.v >= FLICKER_LEAD_V && Math.abs(fl.vx) > FLICKER_LEAD_V / 2 ? Math.sign(fl.vx) : f.x < p.x ? 1 : -1;
  if (fl.face !== face) {
    if (fl.face !== 0 && t - fl.turnAt > TURN_S + TURN_GAP) fl.turnAt = t;
    fl.face = face;
  }
  if (Math.abs(p.x - fl.px) > 0.5 || !p.grounded || Number.isNaN(fl.px)) {
    fl.px = p.x;
    fl.stillSince = t;
  }
  const move = flickerMove(mc, t - fl.stillSince, t - fl.turnAt < TURN_S, t - fl.dartAt < DART_S, fl.v);
  if (move !== fl.move) {
    fl.move = move;
    fl.moveAt = move === 'turn' ? fl.turnAt : move === 'dart' ? fl.dartAt : t;
  }
  const blink = f.show < 1 ? (Math.floor(t * 14) % 2 ? 0.4 : 1) * f.show : 1;
  const glow = move === 'glow' ? 1 : move === 'doze' ? 0.4 : 0.65;
  drawGlow(ctx, f.x + face * 10, f.y - 6, move === 'glow' ? 90 : 70, 'rgba(214, 255, 150, A)', glow * blink);
  ctx.save();
  ctx.globalAlpha *= blink;
  let drew = false;
  if (FLICKER_CLIPS.ready()) {
    const name = flickerFrame(move, t - fl.moveAt, TURN_S);
    ctx.save();
    ctx.translate(f.x, f.y + FLICKER_MID);
    // (his clips face right: mirrored to face left)
    ctx.scale(face, 1);
    drew = FLICKER_CLIPS.draw(ctx, name, (FLICKER_DRAW_H / FLICKER_ANIM_H) * FLICKER_ANIM_UP * (sad ? 0.85 : 1));
    ctx.restore();
  }
  if (!drew) {
    const frame: NightArtName = sad ? 'fl15' : showing ? 'fl16' : talking ? (Math.floor(t * 6) % 2 ? 'fl13' : 'fl1') : (['fl1', 'fl2', 'fl3', 'fl2'] as const)[Math.floor(t * 12) % 4];
    // (his old sheet faces left: mirrored to face right)
    if (!drawNightPiece(ctx, frame, f.x, f.y + 14, { flip: face > 0, scale: sad ? 0.85 : 1 })) {
      ctx.fillStyle = '#6b4320';
      ctx.beginPath();
      ctx.arc(f.x, f.y, 9, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
  drawGlow(ctx, f.x + face * 9, f.y + 2, 16, 'rgba(240, 255, 190, A)', 0.9 * blink);
}

/** the circle-and-finger guide the first time she stands at a trunk: a glowing dashed ring on the bark and a ghost finger tracing it */
export function drawCarveRing(ctx: CanvasRenderingContext2D, tr: MeecaTrunk, t: number) {
  const cx = tr.textX;
  const cy = tr.textY + tr.size * 0.7 * Math.max(0, tr.lines.length - 1) * 0.6;
  const r = 34;
  ctx.save();
  drawGlow(ctx, cx, cy, r + 26, 'rgba(214, 255, 160, A)', 0.45);
  ctx.setLineDash([7, 7]);
  ctx.lineDashOffset = -t * 30;
  ctx.lineWidth = 4;
  ctx.strokeStyle = 'rgba(232, 255, 196, 0.9)';
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  // the arrow on it: round the way the finger goes
  const a0 = -Math.PI / 2 + ((t * Math.PI * 2) / 1.3) % (Math.PI * 2);
  const ax = cx + Math.cos(a0) * r, ay = cy + Math.sin(a0) * r;
  // the ghost finger: a pale fingertip, its nail toward the ring's middle
  ctx.translate(ax, ay);
  ctx.rotate(a0 + Math.PI / 2);
  ctx.globalAlpha = 0.85;
  ctx.fillStyle = 'rgba(255, 236, 222, 0.92)';
  ctx.strokeStyle = 'rgba(120, 80, 70, 0.7)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(-8, -6, 16, 34, 8);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = 'rgba(255, 250, 246, 0.95)';
  ctx.beginPath();
  ctx.ellipse(0, -1, 5, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// ───────────────────────────── the camp, the clearing ─────────────────────────────

const SLEEPERS = new Set(['guard1', 'guard2', 'guard3', 'guard4', 'guard6', 'guard8', 'guardStump']);

/** the night camp behind her: the tents, the packs, the fire and the column asleep round it */
export function drawCamp(ctx: CanvasRenderingContext2D, st: MeecaStage, view: { x0: number; x1: number }, t: number) {
  if (view.x0 > st.campEnd + 300) return;
  for (const c of st.camp) {
    if (c.x < view.x0 - 200 || c.x > view.x1 + 200) continue;
    if (c.n === 'fire') {
      drawGlow(ctx, c.x, c.y - 30, 150, 'rgba(255, 150, 70, A)', 0.55 + 0.08 * Math.sin(t * 9) + 0.05 * Math.sin(t * 23));
    }
    if (c.n === 'stakeLit') drawGlow(ctx, c.x + 14, c.y - 78, 70, 'rgba(255, 214, 140, A)', 0.75);
    drawNightPiece(ctx, c.n as NightArtName, c.x, c.y + 3, { flip: c.flip, scale: c.scale });
    // a sleeper's slow Zzz
    if (SLEEPERS.has(c.n)) {
      const u = (t * 0.35 + c.x * 0.01) % 1;
      ctx.save();
      ctx.globalAlpha = 0.7 * Math.sin(u * Math.PI);
      ctx.fillStyle = '#dcd6ff';
      ctx.font = `700 ${11 + u * 6}px Fredoka, sans-serif`;
      ctx.fillText('z', c.x + 14 + u * 16, c.y - 70 - u * 34);
      ctx.restore();
    }
  }
}

/** the clearing: the four lantern stakes (lit as the guards come), and the guards themselves from the moonflower on */
export function drawClearing(ctx: CanvasRenderingContext2D, mc: MeecaPlay, view: { x0: number; x1: number }, t: number) {
  const c = mc.st.clearing;
  if (c.stakes[0] > view.x1 + 300 || c.stakes[3] < view.x0 - 300) return;
  const lit = mc.phase === 'look' ? Math.max(0, Math.min(1, (mc.lookT - LOOK_S) / 1.2)) : mc.phase === 'play' ? 0 : 1;
  for (const x of c.stakes) {
    if (lit > 0) drawGlow(ctx, x + 14, c.y - 78, 80, 'rgba(255, 214, 140, A)', 0.75 * lit);
    drawNightPiece(ctx, lit > 0.5 ? 'stakeLit' : 'stake', x, c.y + 3);
  }
  if (mc.phase === 'play' || (mc.phase === 'look' && mc.lookT < LOOK_S)) return;
  for (let i = mc.soldiers.length - 1; i >= 0; i--) {
    lanternGlow(ctx, mc.soldiers[i]);
    drawGuard(ctx, 'soldier', mc.soldiers[i].coat, mc.soldiers[i], t);
  }
  lanternGlow(ctx, mc.pell);
  drawGuard(ctx, 'pell', 'a', mc.pell, t);
  if (mc.pell.pose === 'offer' && !mc.wrapped) drawBlanketProp(ctx, mc.pell.x - 46, mc.pell.y - 30);
}

/** everything behind her: the camp, the trunks and their words (the guide ring the first time), the clearing */
export function drawMeecaBack(ctx: CanvasRenderingContext2D, mc: MeecaPlay, view: { x0: number; x1: number }, t: number) {
  const st = mc.st;
  drawCamp(ctx, st, view, t);
  st.trunks.forEach((tr, i) => {
    if (tr.x + tr.w < view.x0 - 100 || tr.x - tr.w > view.x1 + 100) return;
    const cut = mc.cutChars(i);
    // (the faint guide of words still to cut shows only while she can cut them: in the Pell scene's lantern light it read as carved)
    const at = drawTrunk(ctx, tr, cut, mc.phase === 'play' || mc.phase === 'last');
    // (the trail mark: her M, and an arrow back the way she came, cut with the last stroke)
    if (tr.index < 0 && cut >= tr.lines.join('').replace(/ /g, '').length) drawArrowMark(ctx, tr.textX + tr.size * 1.3, tr.textY);
    if (at && i === mc.marked && (mc.carvingNow || (cut > 0 && cut % 1 > 0.01))) {
      if (mc.carvingNow) shavings(ctx, at.x - at.k * 0.15, at.y + at.k * 0.25, t);
      drawCarveMeter(ctx, at.x, at.y, tr.size * 0.78, at.frac);
    }
    if (mc.ringOn === i && !mc.carvingNow) drawCarveRing(ctx, tr, t);
  });
  drawClearing(ctx, mc, view, t);
}

/** in front of her: Flicker */
export function drawMeecaFront(ctx: CanvasRenderingContext2D, mc: MeecaPlay, p: Player, t: number) {
  drawFlicker(ctx, mc, p, t);
}

/** the trail mark's arrow, cut beside her M */
function drawArrowMark(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save();
  ctx.lineCap = 'round';
  for (const [c, w] of [['rgba(38, 20, 10, 0.85)', 5], ['#f7e6c2', 3]] as const) {
    ctx.strokeStyle = c;
    ctx.lineWidth = w;
    ctx.beginPath();
    ctx.moveTo(x + 16, y);
    ctx.lineTo(x - 14, y);
    ctx.moveTo(x - 6, y - 8);
    ctx.lineTo(x - 15, y);
    ctx.lineTo(x - 6, y + 8);
    ctx.stroke();
  }
  ctx.restore();
}

// ───────────────────────────── the overlays (CSS px) ─────────────────────────────

/**
 * The night (CSS px, over the play): the moonlight pressed down over the ground, the props and the people (the strips behind are
 * already in moonlight, tools/art/w5puzzle/night.py), and a soft vignette; then the close lights (Flicker, the fire, the lanterns,
 * the moonflower) bring their colour back. One multiply and a few gradients a frame: cheap at 30 fps. `dark`: the last path's own dark
 * is on (the engine's darkness), so the grade eases off.
 */
export function drawNightGrade(ctx: CanvasRenderingContext2D, W: number, H: number, lights: ReadonlyArray<{ x: number; y: number; r: number; c: string; a: number }>, dark: number) {
  ctx.save();
  ctx.globalAlpha = 1 - 0.7 * dark;
  ctx.globalCompositeOperation = 'multiply';
  const lg = ctx.createLinearGradient(0, 0, 0, H);
  lg.addColorStop(0, '#9aa6dc');
  lg.addColorStop(0.6, '#a8b0e0');
  lg.addColorStop(1, '#8a92c8');
  ctx.fillStyle = lg;
  ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = 'source-over';
  const rg = ctx.createRadialGradient(W / 2, H * 0.45, Math.min(W, H) * 0.3, W / 2, H * 0.5, Math.max(W, H) * 0.75);
  rg.addColorStop(0, 'rgba(8, 10, 30, 0)');
  rg.addColorStop(1, 'rgba(8, 10, 30, 0.42)');
  ctx.fillStyle = rg;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
  for (const l of lights) if (l.x > -l.r && l.x < W + l.r && l.y > -l.r && l.y < H + l.r) drawGlow(ctx, l.x, l.y, l.r, l.c, l.a);
}

// ───────────────────────────── the trunks and the words ─────────────────────────────

const cAdv = (ch: string) => (ch === ' ' ? 0.5 : ch === '.' || ch === ',' ? 0.42 : ch === "'" ? 0.34 : ch === '!' ? 0.46 : 0.82);
/** the seed a trunk's words shake by (the first is 5-1's own: w5Play.ts draws its carving i at i * 13 + 5) */
export const trunkSeed = (tr: MeecaTrunk) => tr.index * 13 + 5;

/**
 * A trunk and its words. `cut` characters are cut (a fraction for the one under the pin, revealed left to right); the rest show as a
 * faint dashed guide of what she means to write. Returns the middle of the letter being cut (for the meter), or null.
 */
export function drawTrunk(ctx: CanvasRenderingContext2D, tr: MeecaTrunk, cut: number, guide = true): { x: number; y: number; k: number; frac: number } | null {
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
          if (!guide) {
            ctx.restore();
            n++;
            lx += adv;
            return;
          }
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

// ───────────────────────────── Pell and the soldiers ─────────────────────────────

function guardFrame(kind: 'pell' | 'soldier', coat: 'a' | 'b', g: Guard, t: number): string | undefined {
  const A = kind === 'pell' ? PELL_CLIPS : SOLDIER_CLIPS;
  const s = (n: string) => (kind === 'pell' ? n : `${n}_${coat}`);
  if (g.pose === 'march' || g.pose === 'walk') return A.loop(s('march'), t + (kind === 'pell' ? 0 : g.x * 0.003), 12);
  if (g.pose === 'offer') return kind === 'pell' ? A.at('offer', Math.min(1, g.poseT / 1.8)) : A.ping(s('idle'), t, 10);
  return A.ping(s('idle'), t + g.x * 0.002, 10);
}

/** the lantern's light: on the ground and round the lantern (hidden behind him while he looks back) */
function lanternGlow(ctx: CanvasRenderingContext2D, g: Guard, k = 1) {
  const back = false;
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


// ───────────────────────────── the words on the screen (CSS px) ─────────────────────────────

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
  if (by < top) {
    // no room over her (the view pulled back, upright): beside her head, the side with more room, never over her
    by = Math.max(top, Math.min(H - h - 10, headY - h / 2));
    bx = headX + 34 + w <= W - 8 ? headX + 34 : Math.max(8, headX - 34 - w);
  }
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


/** someone's words in their own bubble beside them (Flicker's or the Butler's): a dark tag with their name */
export function drawSay(ctx: CanvasRenderingContext2D, who: Speaker, text: string, x: number, y: number, W: number, H: number, top: number, a = 1, avoid?: { x: number; y: number; w: number; h: number } | null) {
  ctx.save();
  ctx.globalAlpha = a;
  ctx.font = `600 13px Fredoka, sans-serif`;
  const lines = wrap(ctx, text, Math.min(210, W - 40));
  const w = Math.max(...lines.map((l) => ctx.measureText(l).width)) + 22;
  const h = lines.length * 16 + 26;
  let bx = Math.max(8, Math.min(W - w - 8, x - w / 2));
  let by = Math.max(top, Math.min(H - h - 8, y - h));
  // (never over her thought: above it, or else beside it)
  if (avoid && bx < avoid.x + avoid.w && bx + w > avoid.x && by < avoid.y + avoid.h && by + h > avoid.y) {
    if (avoid.y - h - 8 >= top) by = avoid.y - h - 8;
    else if (avoid.x + avoid.w + 8 + w <= W - 8) bx = avoid.x + avoid.w + 8;
    else bx = Math.max(8, avoid.x - 8 - w);
  }
  const name = who === 'butler' ? 'THE BUTLER' : who === 'flicker' ? 'FLICKER' : 'LIEUTENANT PELL';
  const edge = who === 'flicker' ? '#d9f99d' : who === 'butler' ? '#c4b5fd' : '#9aa3ad';
  ctx.fillStyle = 'rgba(30, 22, 44, 0.92)';
  ctx.strokeStyle = edge;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(bx, by, w, h, 10);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = edge;
  ctx.font = `700 10px Fredoka, sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(name, bx + 10, by + 10);
  ctx.font = `600 13px Fredoka, sans-serif`;
  ctx.fillStyle = '#f3efe6';
  ctx.textAlign = 'center';
  lines.forEach((l, i) => ctx.fillText(l, bx + w / 2, by + 26 + i * 16));
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

/** the "On the March North" card over the opening shot: the game's chapter card at night (upright on the top half, sideways on the left) */
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

/** the ending's story box, at night (StoryPlayer's .sp-box), with the speaker's name pill, the dots and Next */
export function drawSceneBox(ctx: CanvasRenderingContext2D, W: number, H: number, scene: readonly MeecaSceneLine[], line: number, a: number, t: number) {
  const l = scene[line];
  if (!l || a <= 0) return;
  const land = W > H;
  const pad = land ? 14 : 12;
  const bw = land ? Math.min(640, W - 2 * pad) : W - 2 * pad;
  const fs = land ? (H < 360 ? 16 : 18) : W < 360 ? 17 : 19;
  ctx.save();
  ctx.globalAlpha = a;
  ctx.font = `500 ${fs}px 'Atkinson Read', sans-serif`;
  // (Flicker says his very small)
  if (l.beat === 'small') ctx.font = `italic 500 ${Math.round(fs * 0.82)}px 'Atkinson Read', sans-serif`;
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
  const dot = l.who === 'Meeca' ? PINK : l.who === 'Flicker' ? '#d9f99d' : '#9aa3ad';
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
  ctx.font = l.beat === 'small' ? `italic 500 ${Math.round(fs * 0.82)}px 'Atkinson Read', sans-serif` : `500 ${fs}px 'Atkinson Read', sans-serif`;
  ctx.fillStyle = '#fbf4de';
  ctx.textBaseline = 'alphabetic';
  lines.forEach((s, i) => ctx.fillText(s, bx + 16, by + 26 + fs + i * fs * 1.45));
  // the dots and Next
  const fy = by + bh - 22;
  let dx = bx + 16;
  for (let i = 0; i < scene.length; i++) {
    const on = i === line;
    ctx.fillStyle = on ? '#ffd23a' : i < line ? 'rgba(255, 190, 220, 0.55)' : 'rgba(255,255,255,0.22)';
    ctx.beginPath();
    ctx.roundRect(dx, fy - 3, on ? 22 : 6, 6, 3);
    ctx.fill();
    dx += (on ? 22 : 6) + 6;
  }
  const label = line === scene.length - 1 ? 'Done' : 'Next ›';
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

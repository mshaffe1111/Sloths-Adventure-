/**
 * dotFlightRun — Dot's netting flight inside the game engine. The engine hands over its input, camera and canvas while this stage is
 * played (engine.ts: `dotRun`), and this runs her flight (dotFlight.ts), says her lines, follows her with the camera and draws the
 * stage (dotFlightArt.ts). Hearts, lives, the checkpoint, the result and Dot's banner stay the engine's, through `DotHost`.
 */
import { DotFlight, type FlightInput } from './dotFlight.ts';
import { DOT, DOT_H, type DotStage } from './dotFlightStage.ts';
import { DotFx, drawDotBackdrop, drawDotDepth, drawDotHud, drawDotMoment, drawDotPlayer, drawDotWorld, warmDotFlight } from './dotFlightArt.ts';
import { lessonInputMode } from './lessons.ts';
import { markTipHeard, tipHeard } from './tipMemory.ts';
import { sound } from './audio.ts';
import type { Camera } from './types.ts';

export interface DotHost {
  stageId: string;
  /** Dot says it (the banner), for this many seconds */
  guide(text: string, seconds: number): void;
  float(text: string, x: number, y: number, color: string): void;
  /** a heart gone (a thorn, the mist); the engine takes a life when it was the last, and brings her back (respawn) */
  loseHeart(): void;
  score(n: number): void;
  shake(n: number): void;
  /** through the gap and the moment is over: the stage is cleared */
  win(): void;
}

/** the silk found on this device (by its place in the stage: first, second, third), kept for good */
const SILK_KEY = 'sloth_dot_silk';
function silkSaved(): Set<number> {
  try {
    const v = JSON.parse(localStorage.getItem(SILK_KEY) ?? '[]');
    return new Set(Array.isArray(v) ? v : []);
  } catch {
    return new Set();
  }
}
function saveSilk(i: number) {
  try {
    const s = silkSaved();
    s.add(i);
    localStorage.setItem(SILK_KEY, JSON.stringify([...s]));
  } catch {
    /* no storage: it still counts this run */
  }
}

/** seconds from slipping through the gap to the stage clearing (the light, her cheer, her line) */
const END_SECONDS = 2.6;

export class DotRun {
  readonly fl: DotFlight;
  readonly fx = new DotFx();
  private host: DotHost;
  private shown = new Set<number>();
  private endAt = -1;
  private won = false;
  private clock = 0;
  private flash = 0;
  private bonkCd = 0;
  private buzzCd = 0;
  private lookX = 0.38;

  constructor(stage: DotStage, host: DotHost) {
    this.fl = new DotFlight(stage);
    this.host = host;
    warmDotFlight(stage);
  }

  /** a line Dot says once on this device (a lesson, the first time something happens) */
  private once(id: string, text: string, seconds = 4) {
    if (tipHeard(this.host.stageId, id)) return;
    markTipHeard(this.host.stageId, id);
    this.host.guide(text, seconds);
  }

  /** the end line: how many scratches (the story says nine, whatever happened) */
  private endLine(): string {
    const n = this.fl.scratches;
    if (n === 0) return "Not one scratch. Not one! Nobody's going to believe me. I'll tell them it was nine, it sounds braver.";
    if (n === 9) return "Nine scratches. Exactly nine. It's nothing. It's the netting. I'm fine. The note's fine. That's what matters.";
    if (n === 1) return "One scratch. One! I'll tell Pokey it was nine. It sounds braver, and he'll worry less if he thinks I'm brave.";
    return `${n} scratches. I'm telling Pokey it was nine. It sounds braver, and he worries less when I sound brave.`;
  }

  step(dt: number, input: FlightInput & { kickPressed?: boolean }) {
    const fl = this.fl;
    const st = fl.stage;
    this.clock += dt;
    if (this.bonkCd > 0) this.bonkCd -= dt;
    if (this.buzzCd > 0) this.buzzCd -= dt;
    // the hints, the first time she passes each (and never again on this device)
    for (let i = 0; i < st.hints.length; i++) {
      const h = st.hints[i];
      if (this.shown.has(i) || fl.x < h.x) continue;
      this.shown.add(i);
      const mode = lessonInputMode();
      this.once(`tip:${h.text}`, mode === 'pad' ? h.pad : mode === 'keys' ? h.keys : h.text, 4.2);
    }
    const ev = fl.step(dt, input);
    for (const e of ev) {
      switch (e.k) {
        case 'flap':
          sound.playGlide(1);
          this.fx.add({ x: fl.x - fl.face * 10, y: fl.y + 14, vx: -fl.face * 20, vy: 60, life: 0.4, kind: 'spark', s: 2, hue: 'rgba(255,255,255,0.8)' });
          break;
        case 'flapEmpty':
          this.once('empty-flap', "I can't. I'm empty. Nothing left in the wings. Get me to a flower and I'll flap all you like.", 3.5);
          break;
        case 'buzz':
          if (this.buzzCd <= 0) {
            sound.playGlide(0);
            this.buzzCd = 0.25;
          }
          break;
        case 'sip':
          sound.playFlowerPickup(0);
          sound.playCheckpoint();
          if (e.first) this.once('meter', "That bar's my nectar. Flapping and hovering use it up, and when it's empty I can't flap, I just sink. So: flowers.", 5);
          break;
        case 'full':
          sound.playLeafPickup();
          break;
        case 'droop':
          this.once('droop', 'Drained it. It droops now, but give it a few seconds and it fills right back up. Flowers are very forgiving.', 4);
          break;
        case 'low':
          this.once('low', "I'm running low. A glowing flower, please, before I'm flying on fumes. Not that I'd complain.", 3.5);
          break;
        case 'tired':
          this.once('tired', "That's it, I'm empty. I can't flap. I'm sinking. Gracefully. Steer me to a glowing flower, please!", 4);
          break;
        case 'hurt':
          this.host.loseHeart();
          this.host.shake(0.45);
          sound.playPlayerHurt();
          this.fx.feather(fl.x, fl.y + 6, e.dir);
          this.host.float(fl.scratches === 9 ? 'NINE SCRATCHES' : `SCRATCH ${fl.scratches}`, fl.x, fl.y - 44, '#fda4af');
          if (fl.scratches === 1) this.once('first-scratch', "Ow. That's one. I'm fine. I'm counting, but I'm fine.", 3);
          break;
        case 'mist':
          this.once('mist', "Not the mist! I can't see a thing in there. Back to the last flower. I'll pretend that didn't happen.", 4);
          this.host.loseHeart();
          // (when that was the last heart, the engine has already brought her back at the checkpoint)
          if (fl.y > DOT_H * 0.8) fl.respawn();
          break;
        case 'dew':
          sound.playFlowerPickup(1);
          this.host.score(10);
          this.fx.sparkle(e.x, e.y, 5, '#bae6fd');
          break;
        case 'puff':
          sound.playWhoosh();
          this.host.score(25);
          this.fx.seeds(e.x, e.y);
          break;
        case 'silk': {
          sound.playRelicFound();
          this.host.score(300);
          this.fx.sparkle(e.x, e.y, 12, '#e0f2fe');
          const i = st.silk.findIndex((s) => s.id === e.id);
          saveSilk(i);
          this.host.float(`SPIDER SILK ${fl.silkGot.size}/${st.silk.length}`, e.x, e.y - 30, '#e0f2fe');
          this.once('silk', "Spider silk! Real hummingbirds build their nests with it. For someday. A girl can plan.", 4);
          break;
        }
        case 'bonk':
          if (this.bonkCd <= 0) {
            sound.playLand(0.25);
            this.bonkCd = 0.4;
          }
          break;
        case 'gust':
          sound.playWhoosh();
          break;
        case 'letter':
          this.once('squeeze', 'Hold still. Hold still. Wings in. Note in. Here we go.', 3);
          break;
        case 'through':
          this.endAt = this.clock;
          this.flash = 0.9;
          sound.playShrineUnlocked();
          this.host.score(1000);
          this.fx.sparkle(fl.x, fl.y, 18, '#fff7c2');
          this.host.guide(this.endLine(), END_SECONDS + 2);
          break;
      }
    }
    if (this.flash > 0) this.flash -= dt * 0.8;
    if (this.endAt >= 0 && !this.won && this.clock - this.endAt > END_SECONDS) {
      this.won = true;
      this.host.win();
    }
    this.fx.gusts(st, fl.t, dt * fl.slow, fl.x - 900, fl.x + 900);
    // a petal off a giant flower now and then, wherever she is
    if (Math.random() < dt * 1.2) this.fx.add({ x: fl.x + 300 + Math.random() * 500, y: fl.y - 300 - Math.random() * 100, vx: -30 - Math.random() * 30, vy: 30 + Math.random() * 20, life: 6, kind: 'petal', s: 0.9, hue: Math.random() < 0.5 ? '#f9a8d4' : '#fdba74' });
    this.fx.step(dt * fl.slow);
  }

  /** how far along she is (the HUD's bar) */
  ratio(): number {
    const L = this.fl.stage.letter;
    return Math.max(0, Math.min(1, (this.fl.x - this.fl.stage.spawn.x) / (L.x - this.fl.stage.spawn.x)));
  }

  /** the camera keeps her a little left of middle (more of what is coming ahead), and level with her */
  camera(cam: Camera, dt: number) {
    const fl = this.fl;
    const vw = cam.viewportWidth;
    const vh = cam.viewportHeight;
    const portrait = vh > vw;
    const want = fl.face > 0 ? (portrait ? 0.3 : 0.36) : 0.6;
    this.lookX += (want - this.lookX) * Math.min(1, dt * 1.5);
    cam.targetX = fl.x - vw * this.lookX;
    cam.targetY = fl.y - vh * 0.5;
    const k = Math.min(1, dt * 5);
    cam.x += (cam.targetX - cam.x) * k;
    cam.y += (cam.targetY - cam.y) * k;
    cam.x = Math.max(0, Math.min(fl.stage.width - vw, cam.x));
    cam.y = Math.max(0, Math.min(DOT_H - vh, cam.y));
  }

  /** how slowed the moment is, 0..1 (the engine zooms in a touch with it) */
  moment(): number {
    return Math.max(0, Math.min(1, (1 - this.fl.slow) / 0.58));
  }

  /**
   * Draw the stage. `ctx` is scaled to world units (zoom and device pixels); `shake` is the camera's shake this frame.
   */
  draw(ctx: CanvasRenderingContext2D, cam: Camera, dpr: number, zoom: number, cssW: number, cssH: number, shake: { x: number; y: number }, hudAt: { x: number; y: number }) {
    const fl = this.fl;
    const t = this.clock;
    const vw = cam.viewportWidth;
    const vh = cam.viewportHeight;
    drawDotBackdrop(ctx, fl.stage, cam.x, cam.y, vw, vh, t);
    const snap = dpr * zoom;
    ctx.save();
    ctx.translate(-Math.round(cam.x * snap) / snap + shake.x, -Math.round(cam.y * snap) / snap + shake.y);
    const view = { x0: cam.x, x1: cam.x + vw, y0: cam.y, y1: cam.y + vh };
    drawDotDepth(ctx, fl.stage, cam.x, view);
    // a second, lighter haze between the giant flowers and the play
    ctx.fillStyle = 'rgba(255, 242, 226, 0.22)';
    ctx.fillRect(cam.x - 20, cam.y - 20, vw + 40, vh + 40);
    drawDotWorld(ctx, fl, view, t);
    drawDotPlayer(ctx, fl, t, this.moment());
    this.fx.draw(ctx);
    ctx.restore();
    drawDotMoment(ctx, vw, vh, this.moment(), this.flash);
    // her panel, in css px
    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawDotHud(ctx, fl, cssW, cssH, t, hudAt);
    ctx.restore();
    void DOT;
  }
}

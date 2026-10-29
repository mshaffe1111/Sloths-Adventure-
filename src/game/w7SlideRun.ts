/**
 * w7SlideRun — 7-4's slide inside the game engine (w7Slide.ts is the slide, w7SlideArt.ts draws it). The stage starts as an ordinary
 * side-on stage (the hall); this watches for him reaching the crumble, plays the beat (the floor cracks, the controls are not his for a
 * moment, the floor drops, he falls), then takes over the input, camera and canvas for the slide, the way Dot's flight does
 * (dotFlightRun.ts), and at the chute's end hands him back to the engine, side-on, in the chamber. Hearts, lives and the result stay the
 * engine's, through `SlideHost`.
 */
import { CRUMBLE_X0, CRUMBLE_X1, HALL_G, SlideSim, type SlideStage } from './w7Slide.ts';
import { drawCrumble, drawFall, drawHallLight, drawSlide, prewarmSlide, warmSlide } from './w7SlideArt.ts';
import type { InputState } from './types.ts';
import { sound } from './audio.ts';
import { FONT_UI } from './fonts.ts';

export interface SlideHost {
  easy: boolean;
  loseHeart(): void;
  score(n: number): void;
  shake(n: number): void;
  /** the crumble: these platforms are gone */
  dropFloor(ids: number[]): void;
  /** out of the chute: put him side-on at this spot, moving right */
  comeOut(x: number, y: number): void;
}

/** the beat's timings (s): the floor cracks for this long (he stops; no control), then he falls for this long before the slide */
export const CRACK_S = 1.1;
export const FALL_S = 0.75;
/** where the crumbling floor is (world px: its left, right and top) */
const CRUMBLE_AT = { x0: CRUMBLE_X0, x1: CRUMBLE_X1, top: HALL_G };

export type SlidePhase = 'hall' | 'crack' | 'fall' | 'slide' | 'out';

export class SlideRun {
  readonly st: SlideStage;
  readonly sim: SlideSim;
  /** how many of the eight points down the flume have been drawn offscreen, and the frame count between them */
  private warmed = 0;
  private warmTick = 0;
  phase: SlidePhase = 'hall';
  private host: SlideHost;
  private t = 0;
  /** seconds since the stage began (the hall's light drifts) */
  private clock = 0;
  /** his line on screen and how long it has left */
  say: { text: string; t: number } | null = null;
  /** the hall's own lines, said once */
  private hallSaid = new Set<string>();
  private cracks = 0;
  private scrapeT = 0;

  constructor(st: SlideStage, host: SlideHost) {
    this.st = st;
    this.host = host;
    this.sim = new SlideSim(host.easy ? st.easy : st.normal);
    warmSlide();
  }

  get sliding() {
    return this.phase === 'slide';
  }

  /** a line of his, in the bubble (World 7: his own voice) */
  line(text: string, seconds: number) {
    this.say = { text, t: seconds };
  }

  /**
   * Side-on, every step: watches for the crumble and plays the beat. Returns true while the controls are not his (the engine clears
   * the input before his own step). The beat starts once, at the crumble's line, whatever he is doing (in the air too): the controls
   * stop, and the floor under the whole crumble drops, so he can't be left standing on it or walk on past it.
   */
  side(dt: number, p: { x: number; y: number; vx: number; grounded: boolean }, inp: InputState): boolean {
    if (this.say) this.say.t -= dt;
    this.clock += dt;
    if (this.phase === 'out') return false;
    if (this.phase === 'hall') {
      if (p.x > 700 && !this.hallSaid.has('alone')) {
        this.hallSaid.add('alone');
        this.line('No Dot. Just me, then.', 3);
      }
      if (p.x + 40 >= this.st.crumbleX) {
        this.phase = 'crack';
        this.t = 0;
        this.line('Uh oh. This floor...', 1.6);
        this.host.shake(0.5);
        // the rumble and the crack (SOUNDS in the README: classic effects, for the sound helper to tune)
        sound.playLand(1);
        sound.playHitImpact(true, 'chitin');
        this.cracks = 0;
      }
      return false;
    }
    this.t += dt;
    if (this.phase === 'crack') {
      p.vx *= 0.7;
      // the floor cracking on, twice more as it shakes
      if (this.cracks < 2 && this.t > 0.4 + this.cracks * 0.35) {
        this.cracks++;
        sound.playHitImpact(false, 'chitin');
      }
      if (this.t >= CRACK_S) {
        this.phase = 'fall';
        this.t = 0;
        this.host.dropFloor(this.st.crumbleIds);
        this.host.shake(0.8);
        // the floor goes: a heavy crash, and the whoosh of the drop
        sound.playLand(1);
        sound.playHitImpact(true, 'chitin');
        sound.playWhoosh();
      }
    } else if (this.phase === 'fall' && this.t >= FALL_S) {
      this.phase = 'slide';
      this.t = 0;
      this.say = null;
    }
    clear(inp);
    return true;
  }

  /** the slide, every step (the engine has handed it over) */
  step(dt: number, inp: InputState) {
    if (this.say) this.say.t -= dt;
    const s = this.sim;
    s.step(dt, inp);
    // the wooden scrape of the slide, a soft loop while he is on the boards
    if (s.outT < 0 && s.grounded) {
      this.scrapeT -= dt;
      if (this.scrapeT <= 0) {
        this.scrapeT = 0.42 + Math.random() * 0.08;
        sound.playTreeClimb();
      }
    }
    for (const e of s.events) {
      if (e.k === 'line') this.line(e.text, e.seconds);
      else if (e.k === 'petal') {
        this.host.score(10);
        sound.playFlowerPickup();
      } else if (e.k === 'jump') sound.playJump();
      else if (e.k === 'land') sound.playLand(0.5);
      else if (e.k === 'flag') sound.playCheckpoint();
      else if (e.k === 'hit') {
        this.host.shake(e.taught ? 0.25 : 0.55);
        sound.playHitImpact(!e.taught, 'generic');
        if (!e.taught) sound.playPlayerHurt();
        if (!e.taught) {
          this.host.loseHeart();
          if (s.hits === 1) this.line('Ow. Eyes ahead, Pokey.', 2.2);
        }
      } else if (e.k === 'fall') {
        this.host.shake(0.6);
        sound.playPlayerHurt();
        this.host.loseHeart();
      } else if (e.k === 'out') {
        this.phase = 'out';
        this.host.comeOut(this.st.outAt.x, this.st.outAt.y);
        sound.playLevelStart();
        this.cameOut();
      }
    }
  }

  /** a life lost on the slide: back to the last flag */
  respawn() {
    this.sim.respawn();
  }

  /** the slide's picture (css px; the engine has set the scale) */
  draw(ctx: CanvasRenderingContext2D, W: number, H: number, dpr: number) {
    drawSlide(ctx, this.sim, W, H, dpr, this.say);
  }

  /**
   * Side-on, in the world (the engine's hero step): the floor cracking and breaking (its own picture, in chunks) at the crumbling
   * floor, and while he falls, Matt's falling poses instead of his usual drawing. True when Pokey is drawn here.
   */
  drawHero(ctx: CanvasRenderingContext2D, p: { x: number; y: number; width: number }): boolean {
    if (this.phase === 'crack' || this.phase === 'fall') {
      drawCrumble(ctx, CRUMBLE_AT, this.phase, this.t, CRACK_S, FALL_S);
    }
    if (this.phase !== 'fall') return false;
    drawFall(ctx, p.x + p.width / 2, p.y, this.t);
    return true;
  }

  /**
   * Side-on, over the engine's picture (css px): the hall's light shafts, the fade to dark as he falls, and his bubble over him. `at` turns a world point into css px.
   */
  overlay(ctx: CanvasRenderingContext2D, dpr: number, W: number, H: number, at: (x: number, y: number) => [number, number], head: [number, number]) {
    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // (before the slide: the flume drawn offscreen at eight points down it, one every few frames, so nothing is made on first sight)
    if (this.phase !== 'out' && this.warmed < 8 && ++this.warmTick % 4 === 0) {
      if (prewarmSlide(this.sim, W, H, dpr, this.warmed)) this.warmed++;
    }
    // the temple hall: shafts of gold daylight through the cracked roof (the colour script's first beat)
    if (this.phase === 'hall' || this.phase === 'crack') drawHallLight(ctx, W, H, at, this.clock);
    if (this.phase === 'fall') {
      ctx.fillStyle = `rgba(10, 12, 14, ${Math.min(1, this.t / FALL_S)})`;
      ctx.fillRect(0, 0, W, H);
    }
    if (this.say && this.say.t > 0 && this.phase !== 'fall') {
      ctx.font = `bold 16px ${FONT_UI}`;
      const text = this.say.text;
      const w = ctx.measureText(text).width + 24;
      const bx = Math.max(12, Math.min(W - 12 - w, head[0] - w / 2));
      const by = Math.max(12, head[1] - 46);
      ctx.fillStyle = 'rgba(255, 251, 235, 0.96)';
      ctx.strokeStyle = 'rgba(68, 44, 24, 0.8)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(bx, by, w, 32, 12);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#3f2a17';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, bx + w / 2, by + 17);
    }
    ctx.restore();
  }

  /** out in the chamber: his line, once */
  cameOut() {
    this.line('Out! I did that. Me.', 3);
  }
}

function clear(inp: InputState) {
  inp.left = inp.right = inp.up = inp.down = false;
  inp.jumpPressed = inp.jumpHeld = false;
  inp.punchPressed = inp.kickPressed = inp.megaPunchPressed = false;
}

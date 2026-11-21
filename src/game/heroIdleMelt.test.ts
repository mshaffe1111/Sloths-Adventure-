import test from 'node:test';
import assert from 'node:assert/strict';

/**
 * R-165.353 (INT-15, 2-5 x3268): while Pokey stands still, an idle clip melting in or out over his plain pose must never show him
 * see-through. The melt drew the plain pose at 1-blend and the clip at blend, each over the stage, so where both cover his body only
 * 1-(1-b)*b of it was painted (0.75 at half way): the rock behind showed through him and his head looked doubled.
 *
 * This steps a standing Pokey through the real drawHeroSprite (every idle clip, a ledge's step-back, the exit cheer) with every sheet
 * loaded, records each draw of his body with the alpha and compositing it lands with, and works out how much of his body is painted
 * where both poses cover it. It must be all of it on every frame. It also checks the melt is still a melt (the clip's share rises and
 * falls in small steps) so a fix cannot simply cut from one pose to the other.
 */

// every sheet loads at once
class FakeImage {
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  complete = true;
  naturalWidth = 64;
  naturalHeight = 64;
  width = 64;
  height = 64;
  private _src = '';
  decode() {
    return Promise.resolve();
  }
  set src(v: string) {
    this._src = v;
    queueMicrotask(() => this.onload?.());
  }
  get src() {
    return this._src;
  }
}
(globalThis as unknown as { Image: unknown }).Image = FakeImage;

/** one draw of a hero sheet (the plain sheet or a clip) or of a scratch canvas, and how it landed */
interface Draw {
  what: 'plain' | 'clip' | 'canvas' | 'other';
  canvas?: FakeCanvas;
  alpha: number;
  op: string;
}
const isPlain = (src: string) => /hero-standard/.test(src);
const isClip = (src: string) => /hero\/clips\//.test(src);

/** a 2D context that remembers its alpha and compositing through save/restore, and logs every drawImage */
class FakeCtx {
  globalAlpha = 1;
  globalCompositeOperation = 'source-over';
  imageSmoothingEnabled = true;
  imageSmoothingQuality = 'high';
  fillStyle: unknown = '#000';
  strokeStyle: unknown = '#000';
  lineWidth = 1;
  filter = 'none';
  draws: Draw[] = [];
  private stack: { a: number; op: string; m: number[] }[] = [];
  private m = [1, 0, 0, 1, 0, 0];
  constructor(public canvas: FakeCanvas | { width: number; height: number }) {}
  save() {
    this.stack.push({ a: this.globalAlpha, op: this.globalCompositeOperation, m: [...this.m] });
  }
  restore() {
    const s = this.stack.pop();
    if (s) {
      this.globalAlpha = s.a;
      this.globalCompositeOperation = s.op;
      this.m = s.m;
    }
  }
  getTransform() {
    const [a, b, c, d, e, f] = this.m;
    return { a, b, c, d, e, f, is2D: true, isIdentity: false, transformPoint: (p: { x: number; y: number }) => ({ x: a * p.x + c * p.y + e, y: b * p.x + d * p.y + f }) };
  }
  setTransform(a: number | { a: number; b: number; c: number; d: number; e: number; f: number } = 1, b = 0, c = 0, d = 1, e = 0, f = 0) {
    if (typeof a === 'object') this.m = [a.a, a.b, a.c, a.d, a.e, a.f];
    else this.m = [a, b, c, d, e, f];
  }
  resetTransform() {
    this.m = [1, 0, 0, 1, 0, 0];
  }
  translate(x: number, y: number) {
    const [a, b, c, d, e, f] = this.m;
    this.m = [a, b, c, d, e + a * x + c * y, f + b * x + d * y];
  }
  scale(x: number, y: number) {
    const [a, b, c, d, e, f] = this.m;
    this.m = [a * x, b * x, c * y, d * y, e, f];
  }
  rotate(r: number) {
    const [a, b, c, d, e, f] = this.m;
    const cs = Math.cos(r);
    const sn = Math.sin(r);
    this.m = [a * cs + c * sn, b * cs + d * sn, c * cs - a * sn, d * cs - b * sn, e, f];
  }
  drawImage(im: unknown) {
    const what: Draw['what'] = im instanceof FakeCanvas ? 'canvas' : im instanceof FakeImage ? (isPlain(im.src) ? 'plain' : isClip(im.src) ? 'clip' : 'other') : 'other';
    this.draws.push({ what, canvas: im instanceof FakeCanvas ? im : undefined, alpha: this.globalAlpha, op: this.globalCompositeOperation });
  }
  clearRect() {
    // a scratch canvas cleared for reuse forgets what was drawn on it
    if (this.canvas instanceof FakeCanvas) this.draws.length = 0;
  }
  createLinearGradient() {
    return { addColorStop() {} };
  }
  createRadialGradient() {
    return { addColorStop() {} };
  }
  measureText() {
    return { width: 0 };
  }
  getImageData(_x: number, _y: number, w: number, h: number) {
    return { data: new Uint8ClampedArray(w * h * 4), width: w, height: h };
  }
  putImageData() {}
  beginPath() {}
  closePath() {}
  moveTo() {}
  lineTo() {}
  arc() {}
  ellipse() {}
  rect() {}
  fill() {}
  stroke() {}
  fillRect() {}
  strokeRect() {}
  clip() {}
  quadraticCurveTo() {}
  bezierCurveTo() {}
  fillText() {}
  setLineDash() {}
}
class FakeCanvas {
  width = 0;
  height = 0;
  private ctx: FakeCtx | null = null;
  getContext() {
    return (this.ctx ??= new FakeCtx(this));
  }
  get draws(): Draw[] {
    return this.ctx?.draws ?? [];
  }
}
(globalThis as unknown as { document: unknown }).document = {
  createElement: (t: string) => (t === 'canvas' ? new FakeCanvas() : {}),
};

/**
 * Of a body point that both poses cover, how much is painted (0..1), and how much of that is the clip (0..1): source-over stacks
 * a + (1-a)*under; 'lighter' adds (a cross-dissolve on a scratch canvas); a scratch canvas drawn back carries what was painted on it.
 */
function paint(draws: Draw[]): { cover: number; clip: number; poses: number } {
  let cover = 0;
  let clip = 0;
  let poses = 0;
  for (const d of draws) {
    let a = 0;
    let c = 0;
    if (d.what === 'plain' || d.what === 'clip') {
      a = d.alpha;
      c = d.what === 'clip' ? a : 0;
      poses++;
    } else if (d.what === 'canvas' && d.canvas) {
      const inner = paint(d.canvas.draws);
      a = d.alpha * inner.cover;
      c = d.alpha * inner.clip;
      poses += inner.poses;
    } else continue;
    if (d.op === 'lighter') {
      cover = Math.min(1, cover + a);
      clip = Math.min(1, clip + c);
    } else {
      cover = a + (1 - a) * cover;
      clip = c + (1 - a) * clip;
    }
  }
  return { cover, clip: cover > 0 ? clip / cover : 0, poses };
}

const player = (o: Record<string, unknown> = {}) =>
  ({ x: 400, y: 500, width: 30, height: 60, vx: 0, vy: 0, facing: 1, grounded: true, somersaultAngle: 0, attackType: 'none', walkCycle: 0, squashX: 1, squashY: 1, invincibleTimer: 0, hp: 5, ...o }) as never;

async function setup() {
  const sprite = await import('./heroSprite.ts');
  const clips = await import('./heroClips.ts');
  sprite.warmHeroAtlas();
  clips.warmHeroClips();
  clips.heroClipsLive(true);
  await new Promise((r) => setTimeout(r, 20));
  return { sprite, clips };
}

/** step a still Pokey `secs` seconds at 30 fps from `t0`, returning each frame's paint of his body */
function run(draw: (ctx: CanvasRenderingContext2D, p: never, t: number) => boolean, pl: () => never, t0: number, secs: number) {
  const out: { t: number; cover: number; clip: number; poses: number }[] = [];
  for (let i = 0; i < secs * 30; i++) {
    const t = t0 + i / 30;
    const ctx = new FakeCtx({ width: 915, height: 412 });
    ctx.setTransform(2, 0, 0, 2, -300, -400);
    assert.equal(draw(ctx as unknown as CanvasRenderingContext2D, pl(), t), true, `the hero drew at ${t.toFixed(2)} s`);
    const r = paint(ctx.draws);
    out.push({ t, ...r });
  }
  return out;
}

function checkMelt(label: string, frames: { t: number; cover: number; clip: number; poses: number }[], minMelts: number) {
  let melts = 0;
  for (const f of frames) {
    assert.ok(f.poses >= 1, `${label}: a pose drew at ${f.t.toFixed(2)} s`);
    assert.ok(f.cover > 0.999, `${label}: at ${f.t.toFixed(2)} s only ${(f.cover * 100).toFixed(0)}% of his body is painted where both poses cover it (see-through)`);
    if (f.clip > 0.01 && f.clip < 0.99) melts++;
  }
  // the melt is still a melt: the clip's share moves in small steps (a fifth of a second of fade is six frames at 30 fps)
  for (let i = 1; i < frames.length; i++) {
    const step = Math.abs(frames[i].clip - frames[i - 1].clip);
    if (step > 0.25) {
      // a clip may only start or stop outright where the pose it melts with is the one already there (0 -> small or small -> 0)
      assert.ok(Math.min(frames[i].clip, frames[i - 1].clip) < 0.01 && Math.max(frames[i].clip, frames[i - 1].clip) < 0.25, `${label}: the pose popped at ${frames[i].t.toFixed(2)} s (clip share ${frames[i - 1].clip.toFixed(2)} -> ${frames[i].clip.toFixed(2)})`);
    }
  }
  assert.ok(melts >= minMelts, `${label}: the melt was seen (${melts} part-way frames, want ${minMelts}+)`);
}

test('R-165.353: standing still through every idle clip, he is never see-through while a clip melts in or out', async () => {
  const { sprite, clips } = await setup();
  clips.resetHeroClips();
  // long enough for every idle clip in turn: the first after IDLE_WAIT, each about 3 s, IDLE_REST between
  const secs = clips.IDLE_WAIT + clips.IDLE_CLIPS.length * (3.2 + clips.IDLE_REST) + 1;
  const frames = run(sprite.drawHeroSprite, () => player(), 10, secs);
  // each clip melts in and out over CLIP_FADE: about 5 part-way frames at each end
  checkMelt('idle', frames, clips.IDLE_CLIPS.length * 2 * 4);
});

test('R-165.353: at a ledge end (the step-back melting in) and at the exit (the cheer melting in), never see-through', async () => {
  const { sprite, clips } = await setup();
  clips.resetHeroClips();
  checkMelt('ledge', run(sprite.drawHeroSprite, () => player({ edgeSide: 1 }), 100, 2), 4);
  clips.resetHeroClips();
  checkMelt('cheer', run(sprite.drawHeroSprite, () => player({ cheerAt: 200 }), 200, 1.5), 4);
});

/**
 * Painted Crocus Rex (world 2 boss, the river king), animated: his old painted poses with a crooked petal crown composited on, each
 * one turned into a short clip by Wan 2.2 and cut into the frames in croc-anim.webp (crocAnimData.ts). A switch like the other painted
 * creatures: `?croc=sprite` / `?croc=classic`, `localStorage.sloth_croc = 'sprite'`, DEFAULT_SPRITE_CROC otherwise (classic = the vector croc).
 *
 * The clips follow the boss brain: breathing and tail-swaying while he waits, a swaggering crawl, the roar (on a phase change and as the
 * wind-up for the death roll and the geysers), the tail wound up and then the spin that sweeps it round both sides, the rear and the
 * belly slam, the flinch with the jaws open on recovery (where the weak point is), the dizzy wobble, the death roll and the defeat.
 * The frames are drawn at the old frames' size, so the weak points measured off the old poses still sit on his head.
 */
import { createPaintedBoss } from './paintedBoss.ts';
import { CROC_ANIM_FRAMES, CROC_ANIM_UP, CROC_CLIPS } from './crocAnimData.ts';

export const DEFAULT_SPRITE_CROC = true;
type Seq = keyof typeof CROC_CLIPS;

/** frame at progress p (0..1, held at the ends) through a sequence */
export function crocAt(seq: Seq, p: number): string {
  const f = CROC_CLIPS[seq];
  return f[Math.max(0, Math.min(f.length - 1, Math.floor(p * f.length)))];
}
/** looping frame at this many frames a second */
export function crocLoop(seq: Seq, time: number, fps: number): string {
  const f = CROC_CLIPS[seq];
  return f[Math.floor(time * fps) % f.length];
}
/** back and forth through a sequence (for a clip whose ends do not meet) */
export function crocPing(seq: Seq, time: number, fps: number): string {
  const f = CROC_CLIPS[seq];
  const n = f.length;
  if (n < 2) return f[0];
  const i = Math.floor(time * fps) % (2 * n - 2);
  return f[i < n ? i : 2 * n - 2 - i];
}

/** the story cards ask for 'idle', 'roar' and 'defeated' by name */
const FRAMES = {
  ...CROC_ANIM_FRAMES,
  idle: CROC_ANIM_FRAMES[crocAt('idle', 0)],
  roar: CROC_ANIM_FRAMES[crocAt('roar', 0.6)],
  defeated: CROC_ANIM_FRAMES[crocAt('defeated', 1)], // flat on his back, the crown knocked off (the victory line looks for it)
};

/** the death sequence's length (engine stepBossDeath) */
const DYING_S = 2.0;
/** world units of crawl a full walk cycle covers */
const CRAWL_CYCLE = 300;

export const crocSprite = createPaintedBoss({
  param: 'croc',
  defaultOn: DEFAULT_SPRITE_CROC,
  url: new URL('../assets/enemies/croc-anim.webp', import.meta.url).href,
  frames: FRAMES,
  k: 0.8 / CROC_ANIM_UP,
  // the clips move him already: only a touch of the made-up squash and lean, for weight
  motion: 0.3,
  // the death roll: the curled-up frames turn over and over as he rolls
  spin: ({ br, m, time }) => (br.state === 'act' && m?.pose === 'charge' ? time * 11 : 0),
  pick: ({ b, br, m, moving, dist, time }) => {
    const p = (len: number | undefined) => (len && len > 0 ? br.t / len : 1);
    if (br.state === 'dying') return crocAt('defeated', br.t / DYING_S);
    if (br.state === 'stun') return crocPing('stagger', time, 9);
    if (br.state === 'roar') return crocAt('roar', p(br.hold));
    if (b.hitFlashTimer > 0.12 && (br.state === 'idle' || br.state === 'rec')) return crocAt('hurt', 0.2);
    if (br.state === 'tell') {
      if (m?.pose === 'slam') return crocAt('slamUp', p(m.tell));
      if (m?.pose === 'whip') return crocAt('whipWind', p(m.tell));
      return crocAt('roar', p(m?.tell)); // the death roll and the geysers: he rears back and roars first
    }
    if (br.state === 'act') {
      if (m?.pose === 'charge') return crocLoop('roll', time, 16);
      if (m?.pose === 'whip') return crocAt('whipSpin', p(m.act));
      if (m?.pose === 'slam') return crocAt('slamDown', p(m.act));
      return crocPing('roarHold', time, 10);
    }
    // recovery: the flinch with the jaws held open, where the weak point sits
    if (br.state === 'rec') return crocAt('hurt', p(m?.rec));
    if (moving) {
      const f = CROC_CLIPS.crawl;
      return f[Math.floor((dist / CRAWL_CYCLE) * f.length) % f.length];
    }
    return crocLoop('idle', time, b.phase >= 3 ? 11 : 8);
  },
});

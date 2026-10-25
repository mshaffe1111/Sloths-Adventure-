/**
 * Painted Shadow Prowler (world 3 boss, the black jaguar of the sinkhole cave), animated: his painted poses with an iron collar painted
 * on, each one turned into a short clip by Wan 2.2 and cut into the frames in prowler-anim.webp (prowlerAnimData.ts). A switch like the
 * other painted creatures: `?prowler=sprite` / `?prowler=classic`, `localStorage.sloth_prowler = 'sprite'`, DEFAULT_SPRITE_PROWLER
 * otherwise.
 *
 * The clips follow the boss brain: breathing low while he waits, a prowling walk, the coiled crouch before a pounce, the long leap and
 * the landing, the rear-up roar (on a phase change and before the claw combo), a long claw swipe and snapping jaws in the combo, a
 * flat-out gallop for the dash and for running from phase 2, the flinch, the dazed rearing when stunned and the slow collapse. The
 * shadow step fades the cat out through the boss alpha, so it needs no frame of its own. The frames are drawn at the old frames' size, so the weak points measured off the old
 * poses (bossDefs.ts) still sit where the glow is.
 */
import { createPaintedBoss } from './paintedBoss.ts';
import { PROWLER_ANIM_FRAMES, PROWLER_ANIM_UP, PROWLER_CLIPS } from './prowlerAnimData.ts';

export const DEFAULT_SPRITE_PROWLER = true;
type Seq = keyof typeof PROWLER_CLIPS;

/** frame at progress p (0..1, held at the ends) through a sequence */
function at(seq: Seq, p: number): string {
  const f = PROWLER_CLIPS[seq];
  return f[Math.max(0, Math.min(f.length - 1, Math.floor(p * f.length)))];
}
/** back and forth through a sequence */
function ping(seq: Seq, time: number, fps: number): string {
  const f = PROWLER_CLIPS[seq];
  const n = f.length;
  if (n < 2) return f[0];
  const i = Math.floor(time * fps) % (2 * n - 2);
  return f[i < n ? i : 2 * n - 2 - i];
}
/** looping */
function loop(seq: Seq, time: number, fps: number): string {
  const f = PROWLER_CLIPS[seq];
  return f[Math.floor(time * fps) % f.length];
}

/** the old pose names (story cards, cutscenes and anything else that asks by name) point at the nearest new frame */
const FRAMES = {
  ...PROWLER_ANIM_FRAMES,
  idle: PROWLER_ANIM_FRAMES[at('idle', 0)],
  w_0: PROWLER_ANIM_FRAMES[at('walk', 0)],
  w_1: PROWLER_ANIM_FRAMES[at('walk', 0.25)],
  w_2: PROWLER_ANIM_FRAMES[at('walk', 0.5)],
  w_3: PROWLER_ANIM_FRAMES[at('walk', 0.75)],
  run_0: PROWLER_ANIM_FRAMES[at('dash', 0)],
  run_1: PROWLER_ANIM_FRAMES[at('dash', 0.5)],
  viper: PROWLER_ANIM_FRAMES[at('crouch', 0.5)],
  leap: PROWLER_ANIM_FRAMES[at('air', 0.4)],
  land: PROWLER_ANIM_FRAMES[at('land', 0.5)],
  pound: PROWLER_ANIM_FRAMES[at('land', 0.8)],
  alert: PROWLER_ANIM_FRAMES[at('roar', 0.5)],
  screech: PROWLER_ANIM_FRAMES[at('roar', 0.6)],
  swipe: PROWLER_ANIM_FRAMES[at('claw', 0.5)],
  bite: PROWLER_ANIM_FRAMES[at('bite', 0.5)],
  frenzy: PROWLER_ANIM_FRAMES[at('bite', 1)],
  tailwhip: PROWLER_ANIM_FRAMES[at('bite', 0)],
  hurt: PROWLER_ANIM_FRAMES[at('hurt', 0.6)],
  curl: PROWLER_ANIM_FRAMES[at('defeated', 0.5)],
  dead: PROWLER_ANIM_FRAMES[at('defeated', 1)],
};

/** the death sequence's length (engine stepBossDeath) */
const DYING_S = 2.0;
/** world units of prowling a full walk cycle covers */
const WALK_CYCLE = 300;
/** world units of running a full gallop stride covers */
const RUN_CYCLE = 420;

export const prowlerSprite = createPaintedBoss({
  param: 'prowler',
  defaultOn: DEFAULT_SPRITE_PROWLER,
  url: new URL('../assets/enemies/prowler-anim.webp', import.meta.url).href,
  frames: FRAMES,
  k: 0.78 / PROWLER_ANIM_UP,
  glow: 'rgba(150, 255, 225, 0.7)',
  motion: 0.35,
  pick: ({ b, br, m, moving, dist, time }) => {
    const p = (len: number | undefined) => (len && len > 0 ? br.t / len : 1);
    if (br.state === 'dying') return at('defeated', br.t / DYING_S);
    if (br.state === 'stun') return ping('stagger', time, 8);
    if (br.state === 'roar') return at('roar', p(br.hold) * 1.6);
    if (b.hitFlashTimer > 0.12 && (br.state === 'idle' || br.state === 'rec')) return at('hurt', 0.4);
    if (br.state === 'tell') {
      if (m?.pose === 'bite') return at('roar', p(m.tell)); // rears up and roars before the claw combo
      if (m?.pose === 'fade') return loop('idle', time, 10);
      return at('crouch', p(m?.tell)); // coils before a pounce or the dash
    }
    if (br.state === 'act') {
      if (m?.pose === 'leap') return br.air > 8 ? at('air', p(m.act)) : at('land', 0);
      if (m?.pose === 'fade') return loop('idle', time, 10);
      if (m?.pose === 'bite') {
        // the combo: up on his hind legs swiping, then down snapping, faster in the last phase
        const beat = b.phase >= 3 ? 0.22 : 0.3;
        const k = Math.floor(br.t / beat);
        const u = (br.t % beat) / beat;
        return k % 2 === 0 ? at('claw', u) : at('bite', u);
      }
      return loop('dash', time, 16); // the dash: a flat-out gallop
    }
    if (br.state === 'rec') {
      if (m?.pose === 'leap') return at('land', 0.35 + 0.65 * p(m.rec));
      return loop('idle', time, 10);
    }
    if (moving) {
      if (b.phase >= 2) {
        const f = PROWLER_CLIPS.dash;
        return f[Math.floor((dist / RUN_CYCLE) * f.length) % f.length];
      }
      const f = PROWLER_CLIPS.walk;
      return f[Math.floor((dist / WALK_CYCLE) * f.length) % f.length];
    }
    return ping('idle', time, b.phase >= 3 ? 12 : 9);
  },
});

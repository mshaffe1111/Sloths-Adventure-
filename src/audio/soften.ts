/**
 * A gentle low-pass in front of a destination: takes the edge (the ping) off bright notes without dulling their body. One filter per
 * destination, however many notes play through it. (Kept from the deleted orchestral effect set: the cues and the game effects use it.)
 */
import type { AudioCore } from './core.ts';

const softened = new WeakMap<AudioNode, AudioNode>();

export function soften(core: AudioCore, dst: AudioNode, hz = 2800): AudioNode {
  let f = softened.get(dst);
  if (!f) {
    const lp = core.ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = hz;
    lp.Q.value = 0.55;
    lp.connect(dst);
    softened.set(dst, lp);
    f = lp;
  }
  return f;
}

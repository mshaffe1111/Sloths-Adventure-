/**
 * The volume sliders (R-165.125, Matt 11-11: "too loud, especially the sound effects... the sound bars don't make much difference until
 * it's almost off"). Pure: the conductor sets the gains from it, volumeCurve.test.ts pins it.
 *  - Each slider step is the same number of decibels: a SLIDER_RANGE_DB taper from the top (0 dB) down, and 0 is off. The old bars were
 *    linear gain, so half way was only -6 dB and the whole top half sounded loud.
 *  - The overall level (the louder of the two sliders) is applied AFTER the master compressor and limiter (AudioCore.out), where nothing
 *    undoes it; the other slider sets the balance before them, as a mix does. The old bars acted before the compressor (threshold -18 dB,
 *    ratio 3.5), which squeezed a cut above its threshold to under a third of itself.
 */

/** the bar's range: from the top to one step above off, in dB (a tenth of the bar is 4 dB) */
export const SLIDER_RANGE_DB = 40;

/**
 * a new game's effects slider (the music starts at the top). Measured 11-11 (ffmpeg ebur128 on the shipped files): the recorded effects
 * reach -10.2 LUFS momentary (true peak +2.0 dBTP), the music mixes about -11 LUFS at their loudest, and the effects bus adds +2.1 dB
 * (SFX_BUS), so at the top the effects sat 1-3 dB over the music's loudest moments. 0.8 is -8 dB: about 5 dB under them.
 */
export const DEFAULT_SFX = 0.8;

/** the gain a slider position (0..1) stands for */
export function sliderGain(v: number): number {
  if (!(v > 0)) return 0;
  return Math.pow(10, (-SLIDER_RANGE_DB * (1 - Math.min(1, v))) / 20);
}

/** how the two sliders split into the gain after the dynamics (out) and each bus's gain before them */
export function busLevels(musicVol: number, sfxVol: number): { out: number; music: number; sfx: number } {
  const m = sliderGain(musicVol);
  const s = sliderGain(sfxVol);
  const out = Math.max(m, s);
  if (out === 0) return { out: 0, music: 0, sfx: 0 };
  return { out, music: m / out, sfx: s / out };
}

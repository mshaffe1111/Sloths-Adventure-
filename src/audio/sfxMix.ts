/**
 * The effects' loudness trims (SN-2, polish report 1, 2026-10-29; they replace sfx.ts TRIMS and, for three effects, sfxClassic.ts's).
 * Every effect is first brought to FX_REF LUFS by its own measured loudness (FX_LOUDNESS, CLASSIC_LOUDNESS), then trimmed by FX_MIX: most
 * sit 0.8-1.2, the big moments a little over, the moves a little under, and the two most frequent sounds, the jump and the flower, lowest,
 * so they sit under the music (the footsteps and the climb just above them). Kept out of sfx.ts so its recipes stay as they were.
 */
export const FX_REF = -18;
export const FX_MIX: Readonly<Record<string, number>> = {
  jump: 0.5, flower: 0.5, step: 0.55, climb: 0.6, doubleJump: 0.8, glide: 0.8, land: 0.8, whoosh: 0.8, vine: 0.8, hit: 0.75,
  punch: 0.9, kick: 0.9, megaPunch: 1.05, hurt: 1.1, eagle: 1.1, fruit: 0.85, heart: 0.9, superHeart: 1.05, power: 1.05,
  roar: 1.1, checkpoint: 1.1, relic: 1.15, shrine: 1.2, oneUp: 1.15,
};

/**
 * Each effect's own loudness with no trim (LUFS, short-term over the effect's sound, through the master chain; four versions averaged),
 * measured offline after the recorded effects were normalised, and once more after the first mix for those more than 1 dB off
 * (tools/audio/sfx_loudness.py, rendered by tools/audio/sfx_render.mjs). Re-measure after changing a recipe.
 */
export const FX_LOUDNESS: Readonly<Record<string, number>> = {
  checkpoint: -12.7, climb: -24.8, doubleJump: -15.0, eagle: -22.4, flower: -19.0, fruit: -14.5, glide: -21.5, heart: -16.2, hit: -26.4, hurt: -18.1,
  jump: -27.0, kick: -11.4, land: -16.8, megaPunch: -11.0, oneUp: -9.1, power: -11.9, punch: -12.5, relic: -9.0, roar: -15.0, shrine: -9.4,
  step: -26.1, superHeart: -11.8, vine: -21.8, whoosh: -19.2,
};
/** the classic recipes the game still plays for these (sfx.ts classicFor), measured the same way; the rest keep their old trims */
export const CLASSIC_LOUDNESS: Readonly<Record<string, number>> = { vine: -36.0, checkpoint: -12.6, hit: -28.9 };

/** the gain runFx gives an effect: to FX_REF, then its trim */
export function fxGain(name: string): number {
  const own = FX_LOUDNESS[name];
  return (own === undefined ? 1 : 10 ** ((FX_REF - own) / 20)) * (FX_MIX[name] ?? 1);
}
/** the classic recipes' gain: levelled as fxGain where measured, else their old trim */
export function classicGain(name: string, oldTrim: number): number {
  const own = CLASSIC_LOUDNESS[name];
  return own === undefined ? oldTrim : 10 ** ((FX_REF - own) / 20) * (FX_MIX[name] ?? 1);
}

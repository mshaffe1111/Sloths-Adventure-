/**
 * The effects' mix (SN-2, polish report 1, 2026-10-29). Every effect is first brought to FX_REF LUFS by its own measured loudness
 * (sfx.ts FX_LOUDNESS, sfxClassic.ts CLASSIC_LOUDNESS), then trimmed by FX_MIX: most sit 0.8-1.2, the big moments a little over, the
 * moves a little under, and the two most frequent sounds, the jump and the flower, lowest, so they sit under the music (the footsteps
 * and the climb just above them). Shared by the two recipe sets.
 */
export const FX_REF = -18;
export const FX_MIX: Readonly<Record<string, number>> = {
  jump: 0.5, flower: 0.5, step: 0.55, climb: 0.6, doubleJump: 0.8, glide: 0.8, land: 0.8, whoosh: 0.8, vine: 0.8, hit: 0.75,
  punch: 0.9, kick: 0.9, megaPunch: 1.05, hurt: 1.1, eagle: 1.1, fruit: 0.85, heart: 0.9, superHeart: 1.05, power: 1.05,
  roar: 1.1, checkpoint: 1.1, relic: 1.15, shrine: 1.2, oneUp: 1.15,
};

/**
 * The loudness trims of the synthesized effects that remain (SN-2, polish report 1, 2026-10-29): the boss roars and the predator calls.
 * Every other effect is a recording now (sfxRec.ts), levelled per take by tools/audio/sfxv1/calib.py (sfxRecLevels.ts) to where this plan
 * put the old one. An effect is first brought to FX_REF LUFS by its own measured loudness (FX_LOUDNESS), then trimmed by FX_MIX.
 */
export const FX_REF = -18;
export const FX_MIX: Readonly<Record<string, number>> = { roar: 1.1 };

/** each effect's own loudness with no trim (LUFS, short-term, through the master chain; four versions averaged; tools/audio/sfx_loudness.py) */
export const FX_LOUDNESS: Readonly<Record<string, number>> = { roar: -15.0 };

/** the gain runFx gives an effect: to FX_REF, then its trim */
export function fxGain(name: string): number {
  const own = FX_LOUDNESS[name];
  return (own === undefined ? 1 : 10 ** ((FX_REF - own) / 20)) * (FX_MIX[name] ?? 1);
}

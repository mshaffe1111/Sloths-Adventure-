/**
 * How long each power-up lasts (s): the one table the engine runs them by and the HUD's pod empties by (polish report UI-8: the pod
 * used to say 8 s for Cheetah speed and 10 s for the magnet while they ran 10 s and 12 s).
 */
export const POWER_UP_SECS = { speed: 10, invincible: 8, magnet: 12 } as const;
export type PowerUpKind = keyof typeof POWER_UP_SECS;

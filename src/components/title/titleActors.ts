/**
 * What Pokey and Meeca do on the title while it waits: one shared timeline, so their moments answer each other. Mostly they stand and
 * breathe; now and then a blink, a glance across, Meeca's little bounce and her wave, Pokey's cheer back. Pure, so it is tested.
 */
export interface PoseStep {
  /** seconds */
  d: number;
  pokey: string;
  meeca: string;
  /** Meeca hops during this step (two small bounces) */
  hop?: boolean;
}

export const PAIR_STEPS: PoseStep[] = [
  { d: 2.4, pokey: 'idle', meeca: 'idle' },
  { d: 0.13, pokey: 'blink', meeca: 'idle' },
  { d: 1.3, pokey: 'idle', meeca: 'idle' },
  { d: 0.12, pokey: 'idle', meeca: 'blink' },
  { d: 1.4, pokey: 'idle', meeca: 'tilt' },
  { d: 0.9, pokey: 'idle', meeca: 'glad' },
  { d: 0.7, pokey: 'idle', meeca: 'glad', hop: true },
  { d: 1.2, pokey: 'idle', meeca: 'idle' },
  { d: 0.13, pokey: 'blink', meeca: 'idle' },
  { d: 1.8, pokey: 'idle', meeca: 'look_a' },
  { d: 0.12, pokey: 'idle', meeca: 'blink' },
  { d: 0.6, pokey: 'idle', meeca: 'wave' },
  { d: 0.4, pokey: 'idle', meeca: 'glad' },
  { d: 0.6, pokey: 'cheer_a', meeca: 'wave' },
  { d: 0.5, pokey: 'cheer_b', meeca: 'glad' },
  { d: 0.4, pokey: 'cheer_a', meeca: 'glad' },
  { d: 1.6, pokey: 'idle', meeca: 'idle' },
  { d: 0.13, pokey: 'blink', meeca: 'idle' },
  { d: 2.2, pokey: 'idle', meeca: 'idle' },
];

export const PAIR_LOOP = PAIR_STEPS.reduce((a, s) => a + s.d, 0);

/** the pose at time t (seconds): each one's frame, and how far into a hop Meeca is (0..2 for two bounces, 0 when not hopping) */
export function pairPose(t: number, steps: PoseStep[] = PAIR_STEPS): { pokey: string; meeca: string; meecaHop: number } {
  const loop = steps.reduce((a, s) => a + s.d, 0);
  let u = ((t % loop) + loop) % loop;
  for (const s of steps) {
    if (u < s.d) return { pokey: s.pokey, meeca: s.meeca, meecaHop: s.hop ? (u / s.d) * 2 : 0 };
    u -= s.d;
  }
  return { pokey: 'idle', meeca: 'idle', meecaHop: 0 };
}

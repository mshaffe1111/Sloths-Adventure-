/**
 * sceneSeed — the dice behind every backdrop.
 *
 * Each time a stage loads it rolls a fresh seed, and everything decorative (tree placement, species mix, flowers,
 * stones in the soil, the mood of the light) is generated from it, so no two runs look alike while the gameplay
 * layout stays the same. Add ?seed=123 to the address to replay a particular look.
 */
let seed = 1;
const listeners: Array<() => void> = [];

export const getSceneSeed = () => seed;

export function onSceneSeedChange(fn: () => void) {
  listeners.push(fn);
}

export function setSceneSeed(n: number) {
  const v = (n | 0) || 1;
  if (v === seed) return;
  seed = v;
  for (const fn of listeners) fn();
}

/** a fresh seed: the one in the address if there is one, otherwise random */
export function rollSceneSeed(): number {
  try {
    const q = new URLSearchParams(window.location.search).get('seed');
    if (q && Number.isFinite(Number(q))) return Number(q) | 0 || 1;
  } catch {
    /* no window in some test setups */
  }
  return (Math.floor(Math.random() * 2147483646) + 1) | 0;
}

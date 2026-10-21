/**
 * readable — one colour language for what is on the stage, so nothing you can use hides in the foliage and nothing that can hurt you looks like scenery.
 *
 *   gold  rim  = yours to take or use (flowers, leaves, hearts, power-ups, cages, relics, checkpoints, mushrooms, the sanctuary door)
 *   ember rim  = it can hurt you (every walking, flying and crawling animal)
 *   nothing    = scenery
 *
 * Each rim sits on a soft dark pool, so the same gold or ember reads on a bright backdrop (a pale sky, a sunlit leaf) and on a dark one
 * (the Hollow, the Ember Marsh). The pool deepens with how light the world's backdrop is; the numbers come from the readability audit
 * (tools: render every object with and without itself and measure the gap to what is around it).
 */

/** how light each world's backdrop is behind the action, CIELAB L* (measured over all 90 stages); index 0 is World 1 */
export const BACKDROP_L = [72, 74, 40, 72, 64, 52, 73, 54, 50, 36];

export type AuraKind = 'take' | 'danger';

const RIM: Record<AuraKind, string> = { take: '255,240,170', danger: '255,70,50' };
const POOL: Record<AuraKind, string> = { take: '10,24,16', danger: '34,6,8' };

const pics = new Map<string, HTMLCanvasElement>();

function make(key: string, paint: (g: CanvasRenderingContext2D, n: number) => void): HTMLCanvasElement {
  let cv = pics.get(key);
  if (cv) return cv;
  cv = document.createElement('canvas');
  cv.width = cv.height = 96;
  const g = cv.getContext('2d');
  if (g) paint(g, 96);
  pics.set(key, cv);
  return cv;
}

/** a soft dark pool: dense in the middle, fading to nothing at the edge */
function poolPic(kind: AuraKind): HTMLCanvasElement {
  return make(`pool|${kind}`, (g, n) => {
    const gr = g.createRadialGradient(n / 2, n / 2, 0, n / 2, n / 2, n / 2);
    gr.addColorStop(0, `rgba(${POOL[kind]},1)`);
    gr.addColorStop(0.55, `rgba(${POOL[kind]},0.7)`);
    gr.addColorStop(1, `rgba(${POOL[kind]},0)`);
    g.fillStyle = gr;
    g.fillRect(0, 0, n, n);
  });
}

/** a glowing ring: clear in the middle, brightest about two thirds of the way out, clear again at the edge */
function ringPic(kind: AuraKind): HTMLCanvasElement {
  return make(`ring|${kind}`, (g, n) => {
    const gr = g.createRadialGradient(n / 2, n / 2, n * 0.18, n / 2, n / 2, n / 2);
    gr.addColorStop(0, `rgba(${RIM[kind]},0)`);
    gr.addColorStop(0.5, `rgba(${RIM[kind]},1)`);
    gr.addColorStop(0.76, `rgba(${RIM[kind]},0.55)`);
    gr.addColorStop(1, `rgba(${RIM[kind]},0)`);
    g.fillStyle = gr;
    g.fillRect(0, 0, n, n);
  });
}

/** how deep the dark pool should be on this world: a light backdrop needs more of it, a dark one barely any */
export function poolDepth(world: number): number {
  const L = BACKDROP_L[Math.max(0, Math.min(BACKDROP_L.length - 1, world - 1))];
  const t = Math.max(0, Math.min(1, (L - 34) / 42));
  return 0.2 + 0.34 * t;
}

/**
 * The aura behind something, centred on (0,0) of the current transform. `rx`/`ry` are the object's half-size; the pool reaches about 1.5x that
 * and the rim sits at about 1.15x. `strength` scales both (1 = the standard look).
 */
export function drawAura(
  ctx: CanvasRenderingContext2D,
  kind: AuraKind,
  world: number,
  rx: number,
  ry: number,
  time: number,
  phase = 0,
  strength = 1
) {
  const pulse = 0.5 + 0.5 * Math.sin(time * (kind === 'take' ? 3.1 : 2.2) + phase);
  const prev = ctx.globalAlpha;
  const pool = poolPic(kind);
  const ring = ringPic(kind);
  ctx.globalAlpha = prev * Math.min(1, poolDepth(world) * strength * (kind === 'take' ? 1.35 : 1));
  ctx.drawImage(pool, -rx * 1.65, -ry * 1.65, rx * 3.3, ry * 3.3);
  ctx.globalAlpha = prev * Math.min(1, (kind === 'take' ? 1 : 0.62) * strength * (0.82 + 0.18 * pulse));
  ctx.drawImage(ring, -rx * 1.5, -ry * 1.5, rx * 3, ry * 3);
  ctx.globalAlpha = prev;
}

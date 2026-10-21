/**
 * glow — soft round glows as pictures. An orb, firefly or ember used to build a radial gradient every frame; now each colour's glow is
 * painted once into a small canvas and drawn at a size and an opacity (one drawImage instead of a gradient and a fill).
 */
import { rgba } from './artKit.ts';

const pics = new Map<string, HTMLCanvasElement>();

/**
 * the glow of one colour: `orb` falls off in a straight line, `fly` keeps a hot core and then thins out (a firefly's body and its halo).
 * Draw it centred, as big as the glow should be across, with `globalAlpha` for its brightness.
 */
export function glowPic(col: string, shape: 'orb' | 'fly' = 'orb'): HTMLCanvasElement {
  const key = `${shape}|${col}`;
  let cv = pics.get(key);
  if (cv) return cv;
  cv = document.createElement('canvas');
  cv.width = cv.height = 64;
  const g = cv.getContext('2d');
  if (g) {
    const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, rgba(col, shape === 'fly' ? 0.9 : 1));
    if (shape === 'fly') gr.addColorStop(0.25, rgba(col, 0.35));
    gr.addColorStop(1, rgba(col, 0));
    g.fillStyle = gr;
    g.fillRect(0, 0, 64, 64);
  }
  pics.set(key, cv);
  return cv;
}

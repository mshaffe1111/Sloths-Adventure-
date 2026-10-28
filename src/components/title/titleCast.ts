/**
 * Pokey's and Meeca's clips on the title (clipPlayer.ts has the format). Painted animation by the art helper (2026-10-28,
 * tools/art/w6to10/titlegpu.py, titleup.py, titlepack.py: Wan 2.2 clips from the game's own title frames, upscaled and cleaned), repacked
 * here at 0.7 scale into sheets no wider than 4096 px (src/assets/title/clip-*.webp). 12 frames a second; each moment starts and ends
 * on its idle pose, so it hands straight back. The two of them are at one scale: Pokey stands 448.7 sheet px tall,
 * Meeca 390.6. Meeca's clips face the camera (they are drawn as painted, not turned).
 *
 * The idles are fetched with the title; a moment's sheet is fetched a few seconds before it plays and let go after (TitleScene.tsx).
 * (The pair's laugh together is being redone by the art helper and is not used yet.)
 */
import type { Cast, ClipFrame } from './clipPlayer.ts';

const url = (name: string) => new URL(`../../assets/title/clip-${name}.webp`, import.meta.url).href;

/** the frames of a sheet laid out in a grid, left to right then down: each cell w x h, its feet at (ax, ay) */
function grid(n: number, cols: number, w: number, h: number, ax: number, ay: number): ClipFrame[] {
  return Array.from({ length: n }, (_, i) => ({ x: (i % cols) * w, y: Math.floor(i / cols) * h, w, h, ax, ay }));
}

export const POKEY_CAST: Cast = {
  sheets: { idle: url('pokey-idle'), look: url('pokey-look'), cheer: url('pokey-cheer') },
  clips: {
    idle: { sheet: 'idle', fps: 12, loop: true, frames: grid(28, 14, 276, 453, 148.4, 451.5) },
    look: { sheet: 'look', fps: 12, frames: grid(31, 14, 291, 459, 162.4, 458.5) },
    cheer: { sheet: 'cheer', fps: 12, frames: grid(31, 7, 536, 512, 297.5, 511.0) },
  },
  idle: 'idle',
  moments: ['look', 'cheer'],
  gap: [6, 10],
  height: 448.7,
};

export const MEECA_CAST: Cast = {
  sheets: { idle: url('meeca-idle'), wave: url('meeca-wave') },
  clips: {
    idle: { sheet: 'idle', fps: 12, loop: true, frames: grid(27, 11, 358, 393, 166.6, 392.0) },
    wave: { sheet: 'wave', fps: 12, frames: grid(28, 11, 364, 392, 142.1, 390.6) },
  },
  idle: 'idle',
  moments: ['wave'],
  gap: [7, 11],
  height: 390.6,
};

/** the sheets the title waits for (the idles); the moments' come later */
export const TITLE_IDLE_SHEETS = [POKEY_CAST.sheets.idle as string, MEECA_CAST.sheets.idle as string];

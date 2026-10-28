/**
 * Pokey's and Meeca's clips on the title (clipPlayer.ts has the format). Until the art helper's animation sheets arrive, each has only
 * the painted frames there already are: Pokey's title portrait and its blink (src/assets/hero/title-idle.webp, title-blink.webp), and
 * Meeca's standing frame and her blink from her standard sheet (cut facing Pokey at run time, TitleScene.tsx). To drop real sheets in:
 * add each sheet to `sheets`, each clip to `clips`, and list the moments.
 */
import type { Cast, ClipFrame } from './clipPlayer.ts';

export const POKEY_IDLE_URL = new URL('../../assets/hero/title-idle.webp', import.meta.url).href;
export const POKEY_BLINK_URL = new URL('../../assets/hero/title-blink.webp', import.meta.url).href;

/** the whole picture of Pokey's two title frames (180 x 303), standing on the bottom middle of the picture */
const POKEY_FULL: ClipFrame = { x: 0, y: 0, w: 180, h: 303, ax: 92, ay: 301 };

export const POKEY_CAST: Cast = {
  sheets: { idle: POKEY_IDLE_URL, blink: POKEY_BLINK_URL },
  clips: {
    idle: { sheet: 'idle', frames: [POKEY_FULL], fps: 1, loop: true },
    blink: { sheet: 'blink', frames: [POKEY_FULL], fps: 1 / 0.15 },
  },
  idle: 'idle',
  moments: ['blink'],
  gap: [3.2, 6.5],
  height: 300,
};

/**
 * Meeca's stand-in cast: her two frames, made at run time as one small sheet (both side by side, already facing left, the number on
 * her bib reading the right way). `w`, `h`, `ax`, `ay` are the size and the feet of one frame in that sheet.
 */
export function meecaStandIn(sheet: CanvasImageSource, w: number, h: number, ax: number, ay: number, height: number): Cast {
  const f = (i: number): ClipFrame => ({ x: i * w, y: 0, w, h, ax, ay });
  return {
    sheets: { stand: sheet },
    clips: {
      idle: { sheet: 'stand', frames: [f(0)], fps: 1, loop: true },
      blink: { sheet: 'stand', frames: [f(1)], fps: 1 / 0.14 },
    },
    idle: 'idle',
    moments: ['blink'],
    gap: [2.8, 6],
    height,
  };
}

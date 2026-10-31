// generated from Matt's vine-swing sheets (2026-10-24, by a scratchpad cut) and Qwen-Edit in-betweens (stillfwd, stillback:
// tools/art/pokeyanim/vinepack.py, 2026-10-31): Pokey holding a vine, the drawn vine taken out so he holds the real one.
// psi: which way his body hangs from the grip in the picture (radians from straight down, to the middle of the body)
// gx, gy: where his top hand grips (the point on the vine); phi: the vine's lean in the picture (radians from straight down, positive = its foot to the right)
export const VINE_FRAMES = {
  still: { x: 0, y: 0, w: 195, h: 431, gx: 171.6, gy: 7.6, phi: -0.017, psi: -0.379 },
  stillfwd: { x: 203, y: 0, w: 374, h: 342, gx: 195.5, gy: 29.0, phi: 0.121, psi: -0.231 },
  forward: { x: 585, y: 0, w: 356, h: 333, gx: 204.4, gy: 33.5, phi: 0.26, psi: -0.411 },
  stillback: { x: 949, y: 0, w: 252, h: 366, gx: 201.0, gy: 21.0, phi: 0.092, psi: -0.473 },
  back: { x: 1209, y: 0, w: 245, h: 383, gx: 202.2, gy: 32.4, phi: 0.201, psi: -0.485 },
} as const;
/** the hanging body's height in the still frame, grip to toes, in atlas pixels (sized against the standing hero) */
export const VINE_BODY_PX = 423.3;

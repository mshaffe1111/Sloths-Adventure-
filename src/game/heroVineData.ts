// generated from Matt's vine-swing sheets (2026-10-24) by scratchpad/vine/vinecut.py: Pokey holding a vine, the drawn vine taken out so he holds the real one.
// psi: which way his body hangs from the grip in the picture (radians from straight down, to the middle of the body)
// gx, gy: where his top hand grips (the point on the vine); phi: the vine's lean in the picture (radians from straight down, positive = its foot to the right)
export const VINE_FRAMES = {
  still: { x: 0, y: 0, w: 195, h: 431, gx: 171.6, gy: 7.6, phi: -0.017, psi: -0.379 },
  forward: { x: 203, y: 0, w: 356, h: 333, gx: 204.4, gy: 33.5, phi: 0.26, psi: -0.411 },
  back: { x: 567, y: 0, w: 245, h: 383, gx: 202.2, gy: 32.4, phi: 0.201, psi: -0.485 },
} as const;
/** the hanging body's height in the still frame, grip to toes, in atlas pixels (sized against the standing hero) */
export const VINE_BODY_PX = 423.3;

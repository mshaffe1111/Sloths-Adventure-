// generated from Matt's snapping turtle sheet (2026-10-24, the game-style redraw) by scratchpad/w2b: where each pose sits in turtle-atlas.webp.
// ax: the middle of the shell across the picture (the turtle's position); the feet are the bottom edge. Every pose faces right.
export const TURTLE_FRAMES = {
  walk1: { x: 0, y: 0, w: 280, h: 186, ax: 141.1 },
  walk2: { x: 284, y: 0, w: 285, h: 183, ax: 144.2 },
  walk3: { x: 573, y: 0, w: 283, h: 185, ax: 143.1 },
  tell: { x: 0, y: 190, w: 255, h: 198, ax: 137.8 },
  snap: { x: 259, y: 190, w: 244, h: 205, ax: 133.9 },
  bite: { x: 507, y: 190, w: 265, h: 218, ax: 151.0 },
  after: { x: 0, y: 412, w: 284, h: 185, ax: 152.6 },
  hide: { x: 288, y: 412, w: 234, h: 161, ax: 123.2 },
  peek: { x: 526, y: 412, w: 241, h: 150, ax: 131.3 },
  flip1: { x: 771, y: 412, w: 231, h: 162, ax: 114.8 },
  flip2: { x: 0, y: 601, w: 257, h: 173, ax: 120.1 },
  dizzy: { x: 261, y: 601, w: 260, h: 161, ax: 139.6 },
  scurry: { x: 525, y: 601, w: 308, h: 166, ax: 172.3 },
} as const;
/** the walking turtle's picture width, atlas px (sized against its 48-unit body) */
export const TURTLE_WALK_W = 280;

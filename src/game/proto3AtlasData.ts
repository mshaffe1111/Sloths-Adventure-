// generated from Matt's long-branch sheet (2026-10-24) for 1-8 The Long Branch: where each piece sits in props3-atlas.webp
// `top`: the first row of the log's body (the moss line), so every piece lines up on the same walkable top
export interface ChaseFrame { x: number; y: number; w: number; h: number; top: number }
export const PROTO3_FRAMES = {
  chaseTip: { x: 0, y: 0, w: 375, h: 173, top: 78 },
  chaseDebris: { x: 377, y: 0, w: 411, h: 154, top: 89 },
  chaseBrokenL: { x: 0, y: 175, w: 259, h: 123, top: 23 },
  chaseBrokenR: { x: 261, y: 175, w: 225, h: 123, top: 29 },
  chaseCrack: { x: 488, y: 175, w: 370, h: 119, top: 13 },
  chaseSeg: { x: 0, y: 300, w: 370, h: 100, top: 7 },
} as const satisfies Record<string, ChaseFrame>;

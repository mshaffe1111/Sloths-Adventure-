/** Generated from the Gemini pose sheet (see art notes). Frame rects, and feet anchors, in atlas pixels. */
export interface HeroFrame { x: number; y: number; w: number; h: number; ax: number; ay: number }
export const HERO_ATLAS_SIZE = { w: 2048, h: 489 };
/** height of the standing side-view frame, in atlas pixels (used to scale every frame the same) */
export const HERO_STAND_H = 290.5;
export const HERO_FRAMES: Record<string, HeroFrame> = {
 "idle_front": {
  "w": 179,
  "h": 263,
  "ax": 89.4,
  "ay": 260.0,
  "x": 0,
  "y": 0
 },
 "idle_side": {
  "w": 161,
  "h": 294,
  "ax": 84.3,
  "ay": 290.5,
  "x": 181,
  "y": 0
 },
 "run_contact": {
  "w": 238,
  "h": 259,
  "ax": 104.0,
  "ay": 256.1,
  "x": 344,
  "y": 0
 },
 "run_passing": {
  "w": 202,
  "h": 251,
  "ax": 98.6,
  "ay": 248.0,
  "x": 584,
  "y": 0
 },
 "jump": {
  "w": 158,
  "h": 298,
  "ax": 80.5,
  "ay": 294.6,
  "x": 788,
  "y": 0
 },
 "fall": {
  "w": 258,
  "h": 325,
  "ax": 106.0,
  "ay": 320.6,
  "x": 948,
  "y": 0
 },
 "punch": {
  "w": 286,
  "h": 293,
  "ax": 99.6,
  "ay": 289.0,
  "x": 1208,
  "y": 0
 },
 "kick": {
  "w": 298,
  "h": 292,
  "ax": 124.5,
  "ay": 287.8,
  "x": 1496,
  "y": 0
 },
 "duck": {
  "w": 208,
  "h": 235,
  "ax": 112.1,
  "ay": 230.4,
  "x": 1796,
  "y": 0
 },
 "face_happy": {
  "w": 160,
  "h": 160,
  "ax": 80,
  "ay": 160,
  "x": 0,
  "y": 327
 },
 "face_calm": {
  "w": 160,
  "h": 160,
  "ax": 80,
  "ay": 160,
  "x": 162,
  "y": 327
 },
 "face_determined": {
  "w": 160,
  "h": 160,
  "ax": 80,
  "ay": 160,
  "x": 324,
  "y": 327
 },
 "face_shout": {
  "w": 160,
  "h": 160,
  "ax": 80,
  "ay": 160,
  "x": 486,
  "y": 327
 },
 "face_hurt": {
  "w": 160,
  "h": 160,
  "ax": 80,
  "ay": 160,
  "x": 648,
  "y": 327
 },
 "face_surprised": {
  "w": 160,
  "h": 160,
  "ax": 80,
  "ay": 160,
  "x": 810,
  "y": 327
 }
};

/** Generated from the KlingAI pose sheets. Frame rects, and feet anchors, in atlas pixels. */
export interface HeroFrame { x: number; y: number; w: number; h: number; ax: number; ay: number; /** x of the raised hand, for the climbing frames */ hx?: number }
export const HERO_ATLAS_SIZE = { w: 2048, h: 1243 };
/** height of the standing side-view frame, in atlas pixels (used to scale every frame the same) */
export const HERO_STAND_H = 303.2;
/** the run frames, in the order that makes the smoothest loop */
export const HERO_RUN: string[] = ["run_a", "run_b", "run_c", "run_d", "run_e", "run_f", "run_g", "run_h", "run_i", "run_j"];
/** the climbing frames, in order */
export const HERO_CLIMB: string[] = ["climb_a", "climb_b", "climb_c", "climb_d"];
export const HERO_FRAMES: Record<string, HeroFrame> = {
 "run_a": {
  "w": 224,
  "h": 271,
  "ax": 90.1,
  "ay": 270.6,
  "hx": 123.8,
  "x": 0,
  "y": 0
 },
 "run_b": {
  "w": 216,
  "h": 270,
  "ax": 105.0,
  "ay": 269.5,
  "hx": 153.8,
  "x": 226,
  "y": 0
 },
 "run_c": {
  "w": 220,
  "h": 277,
  "ax": 105.6,
  "ay": 276.7,
  "hx": 158.7,
  "x": 444,
  "y": 0
 },
 "run_d": {
  "w": 229,
  "h": 286,
  "ax": 111.6,
  "ay": 286.2,
  "hx": 163.4,
  "x": 666,
  "y": 0
 },
 "run_e": {
  "w": 216,
  "h": 275,
  "ax": 100.3,
  "ay": 275.1,
  "hx": 146.2,
  "x": 897,
  "y": 0
 },
 "run_f": {
  "w": 244,
  "h": 285,
  "ax": 104.2,
  "ay": 284.9,
  "hx": 148.7,
  "x": 1115,
  "y": 0
 },
 "run_g": {
  "w": 261,
  "h": 283,
  "ax": 113.4,
  "ay": 283.2,
  "hx": 155.2,
  "x": 1361,
  "y": 0
 },
 "run_h": {
  "w": 187,
  "h": 299,
  "ax": 101.1,
  "ay": 298.8,
  "hx": 131.1,
  "x": 1624,
  "y": 0
 },
 "run_i": {
  "w": 188,
  "h": 301,
  "ax": 90.7,
  "ay": 301.5,
  "hx": 114.1,
  "x": 1813,
  "y": 0
 },
 "run_j": {
  "w": 229,
  "h": 292,
  "ax": 85.2,
  "ay": 292.2,
  "hx": 105.0,
  "x": 0,
  "y": 303
 },
 "idle_a": {
  "w": 180,
  "h": 303,
  "ax": 92.3,
  "ay": 303.2,
  "hx": 106.5,
  "x": 231,
  "y": 303
 },
 "mega": {
  "w": 310,
  "h": 259,
  "ax": 122.8,
  "ay": 258.8,
  "hx": 145.0,
  "x": 413,
  "y": 303
 },
 "kick": {
  "w": 300,
  "h": 289,
  "ax": 132.6,
  "ay": 289.1,
  "hx": 135.9,
  "x": 725,
  "y": 303
 },
 "jump_up": {
  "w": 169,
  "h": 321,
  "ax": 87.8,
  "ay": 320.7,
  "hx": 88.2,
  "x": 1027,
  "y": 303
 },
 "fall": {
  "w": 143,
  "h": 268,
  "ax": 72.2,
  "ay": 268.2,
  "hx": 30.6,
  "x": 1198,
  "y": 303
 },
 "hurt": {
  "w": 251,
  "h": 200,
  "ax": 158.0,
  "ay": 200.2,
  "hx": 188.4,
  "x": 1343,
  "y": 303
 },
 "duck": {
  "w": 206,
  "h": 207,
  "ax": 93.0,
  "ay": 206.8,
  "hx": 131.6,
  "x": 1596,
  "y": 303
 },
 "land": {
  "w": 284,
  "h": 224,
  "ax": 140.0,
  "ay": 224.3,
  "hx": 171.6,
  "x": 0,
  "y": 626
 },
 "climb_a": {
  "w": 218,
  "h": 306,
  "ax": 90.2,
  "ay": 305.5,
  "hx": 89.0,
  "x": 286,
  "y": 626
 },
 "climb_b": {
  "w": 209,
  "h": 235,
  "ax": 82.5,
  "ay": 235.3,
  "hx": 77.2,
  "x": 506,
  "y": 626
 },
 "climb_c": {
  "w": 187,
  "h": 277,
  "ax": 74.2,
  "ay": 277.3,
  "hx": 61.1,
  "x": 717,
  "y": 626
 },
 "climb_d": {
  "w": 221,
  "h": 277,
  "ax": 82.7,
  "ay": 277.3,
  "hx": 97.7,
  "x": 906,
  "y": 626
 },
 "punch_rec": {
  "w": 217,
  "h": 273,
  "ax": 93.3,
  "ay": 272.5,
  "hx": 110.7,
  "x": 1129,
  "y": 626
 },
 "punch_2": {
  "w": 228,
  "h": 276,
  "ax": 91.2,
  "ay": 276.1,
  "hx": 119.1,
  "x": 1348,
  "y": 626
 },
 "punch_3": {
  "w": 290,
  "h": 297,
  "ax": 110.9,
  "ay": 296.5,
  "hx": 131.3,
  "x": 1578,
  "y": 626
 },
 "punch_4": {
  "w": 278,
  "h": 307,
  "ax": 104.7,
  "ay": 307.3,
  "hx": 132.7,
  "x": 0,
  "y": 934
 },
 "punch_5": {
  "w": 285,
  "h": 278,
  "ax": 103.0,
  "ay": 277.6,
  "hx": 131.2,
  "x": 280,
  "y": 934
 },
 "idle_blink": {
  "w": 180,
  "h": 303,
  "ax": 92.3,
  "ay": 303.2,
  "hx": 106.5,
  "x": 567,
  "y": 934
 },
 "face_happy": {
  "w": 160,
  "h": 160,
  "ax": 80,
  "ay": 160,
  "x": 749,
  "y": 934
 },
 "face_calm": {
  "w": 160,
  "h": 160,
  "ax": 80,
  "ay": 160,
  "x": 911,
  "y": 934
 },
 "face_wink": {
  "w": 160,
  "h": 160,
  "ax": 80,
  "ay": 160,
  "x": 1073,
  "y": 934
 },
 "face_cheer": {
  "w": 160,
  "h": 160,
  "ax": 80,
  "ay": 160,
  "x": 1235,
  "y": 934
 },
 "face_surprised": {
  "w": 160,
  "h": 160,
  "ax": 80,
  "ay": 160,
  "x": 1397,
  "y": 934
 },
 "face_hurt": {
  "w": 160,
  "h": 160,
  "ax": 80,
  "ay": 160,
  "x": 1559,
  "y": 934
 },
 "face_calm_closed": {
  "w": 160,
  "h": 160,
  "ax": 80,
  "ay": 160,
  "x": 1721,
  "y": 934
 },
 "guard": {
  "w": 180,
  "h": 303,
  "ax": 92.3,
  "ay": 303.2,
  "hx": 106.5,
  "x": 231,
  "y": 303
 }
};

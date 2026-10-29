/**
 * w6StiltArt — 6-8 Stilt Climb's painted look from Matt's World 6 sheets, so no two ledges on one screen look alike (the lead's review,
 * 2026-10-29: "five identical planks on one screen"):
 *   - ledges: besides the World 6 kit's root plank (the engine's own), the second plank (props-made/w6var `branch-b`), the flat-topped
 *     mossy root arch and root den (props-made/w6d), a mossy log (w6d `moss-log`, its log only) and a stump (w6var `stump-b`). Each is
 *     drawn with its walkable top on the ledge's top (`top`, measured from the pictures), so nobody stands in the air or sinks in;
 *   - dressing (pictures only, nothing stood on or hurts): the Gemini hides and arches sheet (gemini/w6-hides-arches: reed hide, moss
 *     hide, hollow log, moss arch, root arch, root mound), and props-made/w6c's cattails, mooring post, glow mushrooms and lantern flower
 *     standing on the shelves, and its moss curtain hanging under them.
 * The stage lays them (w6Stages.ts) and the engine draws them with the ledges (a ledge painted here is art 'stilt': the engine's own
 * platform look leaves it alone). Nothing is drawn until its sheet has loaded.
 */
import { trackAtlas } from './atlasLoader.ts';
import { drawRopeAlong } from './ropeArt.ts';

type Frame = { x: number; y: number; w: number; h: number };
const SHEETS = {
  gem: new URL('../assets/w6to10/gemini/w6-hides-arches.webp', import.meta.url).href,
  var: new URL('../assets/w6to10/props-made/w6var.webp', import.meta.url).href,
  d: new URL('../assets/w6to10/props-made/w6d.webp', import.meta.url).href,
  c: new URL('../assets/w6to10/props-made/w6c.webp', import.meta.url).href,
  balt: new URL('../assets/w6to10/props-made/w6balt.webp', import.meta.url).href,
  set: new URL('../assets/w6/ledges.webp', import.meta.url).href,
} as const;
type Sheet = keyof typeof SHEETS;
export const STILT_ART_URLS: readonly string[] = Object.values(SHEETS);

/** the hides and arches sheet's pieces, anchored at the middle of the foot (as its .json beside it says: w6Stages.test.ts checks) */
export type StiltPiece = 'reed-hide' | 'moss-hide' | 'log-hide' | 'moss-arch' | 'root-arch' | 'root-mound';
export const STILT_FRAMES: Record<StiltPiece, Frame & { ax: number; ay: number }> = {"reed-hide": {x: 0, y: 0, w: 295, h: 228, ax: 147.0, ay: 228}, "moss-hide": {x: 299, y: 0, w: 290, h: 207, ax: 145.0, ay: 207}, "log-hide": {x: 593, y: 0, w: 300, h: 165, ax: 196.5, ay: 165}, "moss-arch": {x: 897, y: 0, w: 303, h: 222, ax: 152.0, ay: 222}, "root-arch": {x: 1204, y: 0, w: 320, h: 201, ax: 161.0, ay: 201}, "root-mound": {x: 1528, y: 0, w: 308, h: 152, ax: 152.5, ay: 152}};
export const STILT_PIECES = Object.keys(STILT_FRAMES) as StiltPiece[];

/** props-made/w6c's dressing (as w6c.json says), stood on its foot (bottom middle) or, the moss curtain, hung by its top */
export type StiltProp = 'cattails' | 'mooring-post' | 'glow-mushrooms' | 'lantern-flower' | 'moss-curtain';
export const STILT_PROP_FRAMES: Record<StiltProp, Frame> = {"moss-curtain": {x: 426, y: 0, w: 425, h: 249}, "cattails": {x: 0, y: 0, w: 422, h: 456}, "mooring-post": {x: 1500, y: 0, w: 286, h: 390}, "glow-mushrooms": {x: 0, y: 460, w: 410, h: 374}, "lantern-flower": {x: 855, y: 0, w: 209, h: 421}};

/**
 * the ledge looks: the sheet, the picture (a log's frame also holds a stump beside it: `cut` keeps the share of its width that is the
 * log), where its walkable top is (share of the picture's height, measured from the pictures' opaque pixels), and the widest ledge one
 * copy covers before it is laid in several side by side
 */
export type LedgeLook = 'branch-b' | 'root-arch' | 'root-den' | 'moss-log' | 'stump' | 'bank' | 'bank-edge';
export const LEDGE_LOOKS: Record<LedgeLook, { sheet: Sheet; f: Frame; top: number; cut?: number; max: number }> = {
  'branch-b': { sheet: 'var', f: { x: 0, y: 0, w: 447, h: 162 }, top: 0.031, max: 460 },
  'root-arch': { sheet: 'd', f: { x: 0, y: 0, w: 469, h: 305 }, top: 0.026, max: 360 },
  'root-den': { sheet: 'd', f: { x: 473, y: 0, w: 469, h: 305 }, top: 0.026, max: 360 },
  'moss-log': { sheet: 'd', f: { x: 0, y: 423, w: 460, h: 132 }, top: 0.083, cut: 0.735, max: 420 },
  stump: { sheet: 'var', f: { x: 910, y: 0, w: 431, h: 189 }, top: 0.026, max: 260 },
  // the start's bank: w6var's soil block, and its bank edge (the mud breaking off into the water, roots hanging from it: its walkable top
  // runs over the left `walk` share of its width)
  bank: { sheet: 'var', f: { x: 1345, y: 0, w: 442, h: 387 }, top: 0.057, max: 400 },
  'bank-edge': { sheet: 'var', f: { x: 0, y: 391, w: 414, h: 421 }, top: 0.03, max: 420 },
};
/**
 * World 6's ledge set (assets/w6/ledges.json, made on Hugging Face for 6-8, 2026-10-29): four kinds, each a ledge (3:1) and a perch
 * (1.3:1), each with its own painted supports: the short one has them cut straight at the frame's foot (where they stand on the ledge
 * under it, or a post carries each on), the tall one has them whole. `ay` is the walkable top (as the .json, w6Stages.test.ts checks)
 */
export type SetKind = 'root-shelf' | 'stilt-deck' | 'boardwalk' | 'wedged-branch';
export const SET_KINDS: readonly SetKind[] = ['root-shelf', 'stilt-deck', 'boardwalk', 'wedged-branch'];
export type SetForm = 'ledge' | 'perch';
export const SET_FRAMES: Record<string, Frame & { ax: number; ay: number; walkTop: number }> = {"root-shelf-ledge":{"x":0,"y":0,"w":600,"h":200,"ax":300.0,"ay":12.2,"walkTop":12.2},"root-shelf-ledge-tall":{"x":604,"y":0,"w":600,"h":377,"ax":300.0,"ay":12.2,"walkTop":12.2},"stilt-deck-ledge":{"x":1208,"y":0,"w":600,"h":200,"ax":300.0,"ay":25.7,"walkTop":25.7},"stilt-deck-ledge-tall":{"x":0,"y":381,"w":600,"h":385,"ax":300.0,"ay":25.7,"walkTop":25.7},"boardwalk-ledge":{"x":604,"y":381,"w":600,"h":200,"ax":300.0,"ay":21.0,"walkTop":21.0},"boardwalk-ledge-tall":{"x":1208,"y":381,"w":600,"h":350,"ax":300.0,"ay":21.0,"walkTop":21.0},"wedged-branch-ledge":{"x":0,"y":770,"w":600,"h":200,"ax":300.0,"ay":51.3,"walkTop":51.3},"wedged-branch-ledge-tall":{"x":604,"y":770,"w":600,"h":272,"ax":300.0,"ay":51.3,"walkTop":51.3},"root-shelf-perch":{"x":1208,"y":770,"w":260,"h":200,"ax":130.0,"ay":18.6,"walkTop":18.6},"root-shelf-perch-tall":{"x":1472,"y":770,"w":260,"h":497,"ax":130.0,"ay":18.6,"walkTop":18.6},"stilt-deck-perch":{"x":1736,"y":770,"w":260,"h":200,"ax":130.0,"ay":24.6,"walkTop":24.6},"stilt-deck-perch-tall":{"x":0,"y":1271,"w":260,"h":464,"ax":130.0,"ay":24.6,"walkTop":24.6},"boardwalk-perch":{"x":264,"y":1271,"w":260,"h":200,"ax":130.0,"ay":28.8,"walkTop":28.8},"boardwalk-perch-tall":{"x":528,"y":1271,"w":260,"h":455,"ax":130.0,"ay":28.8,"walkTop":28.8},"wedged-branch-perch":{"x":792,"y":1271,"w":260,"h":200,"ax":130.0,"ay":31.4,"walkTop":31.4},"wedged-branch-perch-tall":{"x":1056,"y":1271,"w":260,"h":408,"ax":130.0,"ay":31.4,"walkTop":31.4}};
/**
 * where each frame's supports meet its foot: [middle, width], shares of the frame's width (measured from the picture's opaque pixels
 * on its bottom rows; the dangling ropes left out). A short frame's are the cut ends a post carries on
 */
export const SET_FEET: Record<string, Array<[number, number]>> = {
  'root-shelf-ledge': [[0.222, 0.167], [0.488, 0.159], [0.609, 0.067], [0.77, 0.056]],
  'root-shelf-ledge-tall': [[0.517, 0.063]],
  'stilt-deck-ledge': [[0.153, 0.121], [0.784, 0.122]],
  'stilt-deck-ledge-tall': [[0.14, 0.104], [0.777, 0.113]],
  'boardwalk-ledge': [[0.219, 0.088], [0.704, 0.087]],
  'boardwalk-ledge-tall': [[0.254, 0.107], [0.665, 0.104]],
  'wedged-branch-ledge': [[0.099, 0.142], [0.899, 0.138]],
  'wedged-branch-ledge-tall': [[0.081, 0.072], [0.914, 0.088]],
  'root-shelf-perch': [[0.375, 0.05], [0.533, 0.135], [0.7, 0.046]],
  'root-shelf-perch-tall': [[0.514, 0.027]],
  'stilt-deck-perch': [[0.129, 0.242], [0.735, 0.239]],
  'stilt-deck-perch-tall': [[0.129, 0.173], [0.733, 0.173]],
  'boardwalk-perch': [[0.214, 0.189], [0.75, 0.192]],
  'boardwalk-perch-tall': [[0.322, 0.227], [0.602, 0.22]],
  'wedged-branch-perch': [[0.156, 0.173], [0.86, 0.173]],
  'wedged-branch-perch-tall': [[0.075, 0.15], [0.927, 0.138]],
};
/**
 * a tall frame's supports at each depth (frame px under its top, every 20): [middle, width] shares of its width, measured from the
 * picture. A tall piece is cut off at the depth its supports reach the ledge under it (the cut ends stand on that ledge's top, as the
 * short frames' do), so one picture fits any drop up to its whole height
 */
export const SET_ROWS: Record<string, Array<[number, Array<[number, number]>]>> = {"root-shelf-ledge-tall":[[60,[[0.482,0.732]]],[80,[[0.479,0.63]]],[100,[[0.181,0.013],[0.22,0.008],[0.487,0.362],[0.738,0.022]]],[120,[[0.501,0.267],[0.742,0.008]]],[140,[[0.508,0.312]]],[160,[[0.354,0.083],[0.517,0.165],[0.682,0.097]]],[180,[[0.288,0.122],[0.521,0.19],[0.739,0.067]]],[200,[[0.213,0.172],[0.485,0.165],[0.613,0.067],[0.777,0.058]]],[220,[[0.133,0.065],[0.242,0.06],[0.394,0.07],[0.473,0.065],[0.558,0.045],[0.648,0.068],[0.812,0.083]]],[240,[[0.101,0.05],[0.223,0.067],[0.353,0.058],[0.461,0.067],[0.574,0.047],[0.683,0.055],[0.855,0.135]]],[260,[[0.078,0.042],[0.175,0.028],[0.222,0.052],[0.329,0.047],[0.454,0.067],[0.586,0.047],[0.709,0.057],[0.823,0.047],[0.931,0.033]]],[280,[[0.052,0.063],[0.155,0.025],[0.22,0.048],[0.323,0.047],[0.453,0.067],[0.588,0.045],[0.737,0.082],[0.824,0.05],[0.947,0.032]]],[300,[[0.035,0.062],[0.142,0.022],[0.228,0.053],[0.306,0.063],[0.458,0.068],[0.581,0.053],[0.719,0.037],[0.807,0.082],[0.966,0.05]]],[320,[[0.007,0.017],[0.133,0.023],[0.252,0.078],[0.471,0.073],[0.715,0.038],[0.82,0.045],[0.974,0.047]]],[340,[[0.133,0.03],[0.253,0.045],[0.492,0.075],[0.701,0.043],[0.833,0.04]]],[360,[[0.247,0.037],[0.51,0.072]]],[374,[[0.517,0.065]]]],"stilt-deck-ledge-tall":[[80,[[0.484,0.97]]],[100,[[0.082,0.012],[0.151,0.12],[0.774,0.133]]],[120,[[0.144,0.143],[0.775,0.145]]],[140,[[0.144,0.143],[0.775,0.145]]],[160,[[0.143,0.142],[0.774,0.143]]],[180,[[0.15,0.122],[0.782,0.122]]],[200,[[0.152,0.123],[0.784,0.123]]],[220,[[0.155,0.125],[0.786,0.123]]],[240,[[0.142,0.095],[0.207,0.028],[0.772,0.092],[0.838,0.027]]],[260,[[0.141,0.09],[0.212,0.027],[0.772,0.088],[0.843,0.027]]],[280,[[0.142,0.088],[0.22,0.028],[0.771,0.087],[0.849,0.03]]],[300,[[0.142,0.088],[0.228,0.03],[0.772,0.085],[0.856,0.03]]],[320,[[0.142,0.088],[0.233,0.028],[0.772,0.088],[0.863,0.028]]],[340,[[0.142,0.092],[0.242,0.03],[0.771,0.093],[0.871,0.03]]],[360,[[0.141,0.097],[0.253,0.03],[0.772,0.1],[0.882,0.032]]],[380,[[0.14,0.105],[0.263,0.032],[0.777,0.115],[0.892,0.032]]],[382,[[0.14,0.105],[0.265,0.032],[0.777,0.115],[0.893,0.032]]]],"boardwalk-ledge-tall":[[80,[[0.142,0.012],[0.203,0.108],[0.738,0.112]]],[100,[[0.198,0.127],[0.736,0.11]]],[120,[[0.2,0.118],[0.737,0.122]]],[140,[[0.208,0.098],[0.728,0.108]]],[160,[[0.212,0.093],[0.717,0.092]]],[180,[[0.217,0.092],[0.71,0.088]]],[200,[[0.219,0.09],[0.703,0.087]]],[220,[[0.223,0.088],[0.697,0.088]]],[240,[[0.227,0.088],[0.693,0.09]]],[260,[[0.231,0.09],[0.686,0.093]]],[280,[[0.237,0.092],[0.675,0.108]]],[300,[[0.241,0.093],[0.676,0.1]]],[320,[[0.248,0.102],[0.672,0.1]]],[340,[[0.251,0.103],[0.666,0.103]]],[347,[[0.253,0.108],[0.665,0.105]]]],"wedged-branch-ledge-tall":[[100,[[0.496,0.903]]],[120,[[0.178,0.238],[0.823,0.24]]],[140,[[0.13,0.175],[0.868,0.18]]],[160,[[0.112,0.178],[0.889,0.187]]],[180,[[0.113,0.142],[0.885,0.138]]],[200,[[0.098,0.143],[0.901,0.14]]],[220,[[0.085,0.135],[0.912,0.135]]],[240,[[0.073,0.135],[0.923,0.132]]],[260,[[0.066,0.133],[0.932,0.133]]],[269,[[0.081,0.073],[0.914,0.09]]]],"root-shelf-perch-tall":[[60,[[0.508,0.75]]],[80,[[0.515,0.719]]],[100,[[0.506,0.638]]],[120,[[0.225,0.023],[0.519,0.373]]],[140,[[0.515,0.212]]],[160,[[0.51,0.177],[0.627,0.05]]],[180,[[0.41,0.054],[0.531,0.135],[0.677,0.05]]],[200,[[0.367,0.054],[0.535,0.142],[0.706,0.054]]],[220,[[0.323,0.058],[0.535,0.173],[0.731,0.05]]],[240,[[0.279,0.077],[0.535,0.212],[0.756,0.046]]],[260,[[0.212,0.065],[0.275,0.038],[0.429,0.046],[0.498,0.069],[0.581,0.035],[0.644,0.054],[0.785,0.05]]],[280,[[0.163,0.054],[0.252,0.038],[0.406,0.038],[0.492,0.073],[0.592,0.035],[0.667,0.054],[0.819,0.058]]],[300,[[0.133,0.046],[0.238,0.05],[0.387,0.038],[0.487,0.077],[0.6,0.027],[0.687,0.046],[0.856,0.077]]],[320,[[0.104,0.05],[0.217,0.038],[0.256,0.023],[0.367,0.038],[0.481,0.081],[0.608,0.027],[0.71,0.054],[0.904,0.042]]],[340,[[0.079,0.046],[0.198,0.031],[0.258,0.019],[0.354,0.05],[0.479,0.085],[0.612,0.027],[0.7,0.027],[0.746,0.05],[0.931,0.042]]],[360,[[0.06,0.054],[0.183,0.038],[0.26,0.023],[0.34,0.062],[0.45,0.035],[0.506,0.046],[0.613,0.023],[0.702,0.023],[0.775,0.046],[0.952,0.038]]],[380,[[0.038,0.058],[0.177,0.035],[0.263,0.023],[0.313,0.038],[0.45,0.035],[0.512,0.042],[0.613,0.023],[0.702,0.023],[0.796,0.05],[0.969,0.042]]],[400,[[0.031,0.058],[0.175,0.031],[0.285,0.065],[0.452,0.031],[0.515,0.042],[0.698,0.023],[0.815,0.05],[0.979,0.038]]],[420,[[0.025,0.054],[0.283,0.046],[0.521,0.054],[0.696,0.019],[0.831,0.042]]],[440,[[0.273,0.042],[0.525,0.062],[0.698,0.023],[0.835,0.035]]],[460,[[0.269,0.042],[0.523,0.058],[0.704,0.019]]],[480,[[0.519,0.042]]],[494,[[0.513,0.031]]]],"stilt-deck-perch-tall":[[80,[[0.129,0.185],[0.733,0.185]]],[100,[[0.127,0.181],[0.733,0.185]]],[120,[[0.135,0.204],[0.606,0.023],[0.737,0.208]]],[140,[[0.129,0.246],[0.725,0.254]]],[160,[[0.127,0.25],[0.733,0.246]]],[180,[[0.131,0.25],[0.735,0.25]]],[200,[[0.131,0.242],[0.735,0.242]]],[220,[[0.14,0.238],[0.742,0.242]]],[240,[[0.127,0.227],[0.733,0.231]]],[260,[[0.146,0.204],[0.75,0.204]]],[280,[[0.148,0.215],[0.754,0.219]]],[300,[[0.152,0.223],[0.756,0.223]]],[320,[[0.127,0.173],[0.242,0.05],[0.731,0.173],[0.852,0.046]]],[340,[[0.125,0.169],[0.258,0.05],[0.729,0.169],[0.862,0.05]]],[360,[[0.129,0.169],[0.265,0.05],[0.733,0.169],[0.869,0.05]]],[380,[[0.127,0.165],[0.277,0.05],[0.733,0.162],[0.883,0.046]]],[400,[[0.123,0.165],[0.29,0.046],[0.729,0.162],[0.894,0.046]]],[420,[[0.123,0.165],[0.302,0.054],[0.729,0.162],[0.91,0.046]]],[440,[[0.127,0.173],[0.319,0.05],[0.731,0.173],[0.925,0.046]]],[460,[[0.129,0.177],[0.331,0.058],[0.733,0.177],[0.937,0.054]]],[461,[[0.129,0.177],[0.331,0.058],[0.733,0.177],[0.938,0.058]]]],"boardwalk-perch-tall":[[80,[[0.16,0.277],[0.823,0.258]]],[100,[[0.187,0.246],[0.833,0.246]]],[120,[[0.2,0.242],[0.821,0.246]]],[140,[[0.208,0.242],[0.81,0.246]]],[160,[[0.21,0.231],[0.794,0.246]]],[180,[[0.204,0.196],[0.321,0.023],[0.779,0.231]]],[200,[[0.213,0.192],[0.335,0.019],[0.744,0.192],[0.869,0.019]]],[220,[[0.225,0.192],[0.733,0.192]]],[240,[[0.233,0.185],[0.721,0.185]]],[260,[[0.24,0.177],[0.71,0.177]]],[280,[[0.252,0.177],[0.7,0.181]]],[300,[[0.26,0.177],[0.685,0.181]]],[320,[[0.269,0.181],[0.671,0.185]]],[340,[[0.277,0.188],[0.66,0.192]]],[360,[[0.285,0.196],[0.646,0.204]]],[380,[[0.29,0.208],[0.637,0.208]]],[400,[[0.3,0.212],[0.625,0.215]]],[420,[[0.31,0.223],[0.612,0.227]]],[440,[[0.319,0.235],[0.596,0.242]]],[452,[[0.321,0.231],[0.602,0.223]]]],"wedged-branch-perch-tall":[[80,[[0.256,0.338],[0.723,0.388]]],[100,[[0.179,0.192],[0.84,0.2]]],[120,[[0.162,0.212],[0.85,0.204]]],[140,[[0.16,0.215],[0.854,0.204]]],[160,[[0.158,0.212],[0.852,0.2]]],[180,[[0.158,0.196],[0.854,0.188]]],[200,[[0.154,0.181],[0.863,0.177]]],[220,[[0.142,0.165],[0.869,0.165]]],[240,[[0.127,0.158],[0.883,0.162]]],[260,[[0.121,0.154],[0.89,0.154]]],[280,[[0.115,0.15],[0.898,0.154]]],[300,[[0.108,0.142],[0.904,0.15]]],[320,[[0.102,0.131],[0.913,0.146]]],[340,[[0.094,0.131],[0.923,0.142]]],[360,[[0.087,0.138],[0.927,0.142]]],[380,[[0.081,0.15],[0.925,0.146]]],[400,[[0.077,0.15],[0.927,0.142]]],[405,[[0.075,0.154],[0.927,0.142]]]]};
/** the shallowest depth a tall frame may be cut at: where its body ends and only its supports run on (no run wider than a third) */
export const setMinCut = (name: string): number => SET_ROWS[name].find(([, runs]) => runs.length && runs.every(([, w]) => w < 0.34))?.[0] ?? SET_FRAMES[name].h;
/** a tall frame's supports at depth `cut` (the measured row nearest it, at or above it) */
export const setFeetAt = (name: string, cut: number): Array<[number, number]> => {
  const rows = SET_ROWS[name];
  let best = rows[0];
  for (const r of rows) if (r[0] <= cut + 1) best = r;
  return best[1];
};
/** a set piece's frame name */
export const setFrame = (kind: SetKind, form: SetForm, tall: boolean) => `${kind}-${form}${tall ? '-tall' : ''}`;
/** a set piece laid over a ledge `w` wide, `over` times as wide: its scale, top (from the ledge's top), the y of its feet, its supports' x */
export function setPlace(name: string, x: number, y: number, w: number, over: number, flip = false, cut?: number) {
  const f = SET_FRAMES[name];
  const k = (w * over) / f.w;
  const left = x + w / 2 - (f.w * k) / 2;
  const depth = cut ?? f.h;
  const feet = (cut === undefined ? SET_FEET[name] : setFeetAt(name, cut)).map(([c, sw]) => ({ x: left + (flip ? 1 - c : c) * f.w * k, w: sw * f.w * k }));
  return { k, top: y - f.ay * k, foot: y - f.ay * k + depth * k, left, feet, width: f.w * k, depth };
}
/** the range of `over` a set piece may be drawn at (its walkable top still covers the ledge, its ends overhang only a little) */
export const SET_OVER = [0.98, 1.2] as const;

/** the share of the bank edge's width its walkable top runs over (from its left); past it the mud breaks off */
export const BANK_EDGE_WALK = 0.72;
/**
 * the looks that grow out of the ground (the lead's review, 2026-10-29: "a stump or a root den is something that grows out of the
 * ground"; w6var's second plank is a slab on spreading roots too, and reads as one): laid only where their own roots reach down onto the ledge under them (w6Stages.ts sizes them so their feet stand on it)
 */
export const GROUNDED: readonly LedgeLook[] = ['stump', 'root-arch', 'root-den', 'branch-b'];
/** how much wider than its ledge a look is drawn (its painted ends are ragged: the walkable top still covers the ledge) */
export const LEDGE_OVER = 1.1;

/** a ledge the stage paints with one of the looks (its platform is art 'stilt'), laid in `n` copies side by side */
export interface StiltLedge {
  id: number;
  look: LedgeLook | SetKind;
  x: number;
  y: number;
  w: number;
  n: number;
  flip?: boolean;
  over?: number;
  /** drawn this tall (the start's bank: one piece, no seams) */
  h?: number;
  /** a piece of World 6's ledge set: its frame (setFrame), cut off `cut` frame px under its top (a tall one fitted to its drop) */
  set?: string;
  cut?: number;
}
/**
 * dressing: a hides-and-arches piece or a w6c prop on its foot at (x, b), `w` px wide; the moss curtain hangs from b. And what holds
 * a ledge up, from its underside at (x, b): a stilt post (w6balt's gauge post) down to its foot at `foot` (a ledge's top, or under the
 * water); a brace (the same post, slanting) down to `to` on a climbing root's trunk; a lashed rope up to `top` (the ledge over it)
 */
export interface StiltDecor {
  n: StiltPiece | StiltProp | 'post' | 'brace' | 'rope' | 'stilt';
  x: number;
  b: number;
  w: number;
  flip?: boolean;
  foot?: number;
  to?: [number, number];
  top?: number;
  /** a stilt: which of the stilt deck's two posts it is cut from */
  v?: 0 | 1;
}
export const isProp = (n: StiltDecor['n']): n is StiltProp => n in STILT_PROP_FRAMES;
/** the gauge post: its capped top, then its plain shaft, laid again and again down to the foot */
const POST = { x: 769, w: 78, cap: 215, shaft: [215, 405] as const };

/** how many copies a look takes over a ledge `w` wide */
export const ledgeCopies = (look: LedgeLook, w: number): number => Math.max(1, Math.ceil(w / LEDGE_LOOKS[look].max));
/** how tall a look is drawn over a ledge `w` wide, laid in `n` copies (more copies, each narrower, draw it shallower) */
export function ledgeHeight(look: LedgeLook, w: number, n = ledgeCopies(look, w), over = LEDGE_OVER): number {
  const L = LEDGE_LOOKS[look];
  return ((w / n) * over * L.f.h) / (L.f.w * (L.cut ?? 1));
}
/** how much wider than its ledge a grounded look is drawn, so its feet stand `drop` px under its top (one copy) */
export function overFor(look: LedgeLook, w: number, drop: number): number {
  const L = LEDGE_LOOKS[look];
  return (drop / (1 - L.top)) * (L.f.w * (L.cut ?? 1)) / (w * L.f.h);
}
/** the range of `overFor` a grounded look may be drawn at: its walkable top still covers its ledge, and it overhangs only a little */
export const GROUND_OVER = [1.0, 1.18] as const;
/** the narrowest one copy of a look is laid (narrower reads as a smudge) */
export const LEDGE_MIN_COPY = 130;

const imgs = new Map<Sheet, HTMLImageElement>();
const ready = new Set<Sheet>();
function load(s: Sheet) {
  if (imgs.has(s) || typeof Image === 'undefined') return;
  const im = new Image();
  imgs.set(s, im);
  trackAtlas(im, SHEETS[s], () => ready.add(s), () => imgs.delete(s), () => { imgs.delete(s); ready.delete(s); });
}
/** whether every sheet has loaded (starts the loads) */
export function stiltArtReady(): boolean {
  (Object.keys(SHEETS) as Sheet[]).forEach(load);
  return ready.size === Object.keys(SHEETS).length;
}
type View = { x0: number; x1: number; y0: number; y1: number };
function blit(ctx: CanvasRenderingContext2D, s: Sheet, f: Frame, x: number, y: number, w: number, h: number, flip = false, cut = 1) {
  const img = imgs.get(s);
  if (!img || !ready.has(s)) return;
  ctx.save();
  ctx.translate(x + w / 2, y);
  if (flip) ctx.scale(-1, 1);
  ctx.drawImage(img, f.x, f.y, f.w * cut, f.h, -w / 2, 0, w, h);
  ctx.restore();
}
/** a picture drawn with its right `fade` px fading out (the start's bank over its edge piece: no seam), made once per size */
const faded = new Map<string, HTMLCanvasElement>();
function drawFaded(ctx: CanvasRenderingContext2D, s: Sheet, f: Frame, x: number, y: number, w: number, h: number, fade: number) {
  const img = imgs.get(s);
  if (!img || !ready.has(s) || typeof document === 'undefined') return;
  const key = `${s}:${f.x}:${f.y}:${Math.round(w)}:${Math.round(h)}:${fade}`;
  let c = faded.get(key);
  if (!c) {
    c = document.createElement('canvas');
    c.width = Math.ceil(w);
    c.height = Math.ceil(h);
    const g = c.getContext('2d')!;
    g.drawImage(img, f.x, f.y, f.w, f.h, 0, 0, w, h);
    g.globalCompositeOperation = 'destination-out';
    const gr = g.createLinearGradient(w - fade, 0, w, 0);
    gr.addColorStop(0, 'rgba(0,0,0,0)');
    gr.addColorStop(1, 'rgba(0,0,0,1)');
    g.fillStyle = gr;
    g.fillRect(w - fade, 0, fade, h);
    faded.set(key, c);
  }
  ctx.drawImage(c, x, y, w, h);
}
/**
 * a lashed stilt (the lead's review, 2026-10-29: the gauge posts read as grey pipes): the ledge set's own stilt deck post, cut from its
 * tall picture: its rope lashing at the top, then its plain shaft laid again and again down to the foot. `w` is the shaft's width
 */
const LASHED = [
  { lash: { x: 40, y: 381 + 90, w: 90, h: 145 }, shaft: { x: 54, y: 381 + 250, w: 62, h: 120 } },
  { lash: { x: 420, y: 381 + 90, w: 90, h: 145 }, shaft: { x: 434, y: 381 + 250, w: 62, h: 120 } },
] as const;
function drawLashed(ctx: CanvasRenderingContext2D, x: number, b: number, foot: number, w: number, v: 0 | 1, view: View, flip = false) {
  const L = LASHED[v];
  const k = w / L.shaft.w;
  const lashH = Math.min(L.lash.h * k, foot - b);
  blit(ctx, 'set', { ...L.lash, h: lashH / k }, x - (L.lash.w * k) / 2, b, L.lash.w * k, lashH, flip);
  const step = L.shaft.h * k;
  let y = b + lashH;
  if (view.y0 - 40 > y) y += Math.floor((view.y0 - 40 - y) / step) * step;
  for (; y < Math.min(foot, view.y1 + 40) - 0.5; y += step) {
    const h = Math.min(step, foot - y);
    blit(ctx, 'set', { ...L.shaft, h: h / k }, x - w / 2, y, w, h, flip);
  }
}
/** a brace: the post slanting from (x, y) down to (tx, ty), its cap at the top */
function drawBrace(ctx: CanvasRenderingContext2D, x: number, y: number, tx: number, ty: number, w: number, flip = false) {
  const len = Math.hypot(tx - x, ty - y);
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(Math.atan2(ty - y, tx - x) - Math.PI / 2);
  drawPost(ctx, 0, 0, len, w, { x0: -1e9, x1: 1e9, y0: -1e9, y1: 1e9 }, flip);
  ctx.restore();
}
/** a lashed rope from the ledge over it at top down to its ledge at b: the game's painted rope (ropeArt.ts), hung straight */
function drawRope(ctx: CanvasRenderingContext2D, x: number, top: number, b: number) {
  drawRopeAlong(ctx, [[x, top], [x, b]]);
}
/** a stilt post from b down to foot, `w` wide: the cap, then the shaft laid down to the foot (the last one cut short) */
function drawPost(ctx: CanvasRenderingContext2D, x: number, b: number, foot: number, w: number, view: View, flip = false) {
  const k = w / POST.w;
  const left = x - w / 2;
  const capH = Math.min(POST.cap * k, foot - b);
  blit(ctx, 'balt', { x: POST.x, y: 0, w: POST.w, h: capH / k }, left, b, w, capH, flip);
  const [s0, s1] = POST.shaft;
  const step = (s1 - s0) * k;
  // (only the pieces in view: a post down into the water can be thousands of px long)
  let y = b + capH;
  if (view.y0 - 40 > y) y += Math.floor((view.y0 - 40 - y) / step) * step;
  for (; y < Math.min(foot, view.y1 + 40) - 0.5; y += step) {
    const h = Math.min(step, foot - y);
    blit(ctx, 'balt', { x: POST.x, y: s0, w: POST.w, h: h / k }, left, y, w, h, flip);
  }
}

const seen = (x0: number, x1: number, y0: number, y1: number, v: View) => x1 > v.x0 - 40 && x0 < v.x1 + 40 && y1 > v.y0 - 40 && y0 < v.y1 + 40;

/** the dressing behind the ledges (the hanging moss, and what stands on the shelves) */
export function drawStiltDecor(ctx: CanvasRenderingContext2D, items: readonly StiltDecor[], view: View): void {
  stiltArtReady();
  for (const d of items) {
    if (d.n === 'brace' && d.to) {
      if (seen(Math.min(d.x, d.to[0]), Math.max(d.x, d.to[0]), d.b, d.to[1], view)) drawBrace(ctx, d.x, d.b, d.to[0], d.to[1], d.w, d.flip);
      continue;
    }
    if (d.n === 'rope' && d.top !== undefined) {
      if (seen(d.x - 20, d.x + 20, d.top, d.b, view)) drawRope(ctx, d.x, d.top, d.b);
      continue;
    }
    if (d.n === 'stilt') {
      const foot = d.foot ?? d.b;
      if (seen(d.x - d.w * 1.5, d.x + d.w * 1.5, d.b, foot, view)) drawLashed(ctx, d.x, d.b, foot, d.w, d.v ?? 0, view, d.flip);
      continue;
    }
    if (d.n === 'post') {
      const foot = d.foot ?? d.b;
      if (seen(d.x - d.w, d.x + d.w, d.b, foot, view)) drawPost(ctx, d.x, d.b, foot, d.w, view, d.flip);
      continue;
    }
    if (isProp(d.n)) {
      const f = STILT_PROP_FRAMES[d.n];
      const h = (f.h * d.w) / f.w;
      const top = d.n === 'moss-curtain' ? d.b : d.b - h;
      if (seen(d.x - d.w / 2, d.x + d.w / 2, top, top + h, view)) blit(ctx, 'c', f, d.x - d.w / 2, top, d.w, h, d.flip);
      continue;
    }
    const f = STILT_FRAMES[d.n as StiltPiece];
    if (!f) continue;
    const k = d.w / f.w;
    const h = f.h * k;
    if (!seen(d.x - d.w, d.x + d.w, d.b - h, d.b, view)) continue;
    // (anchored at its foot's middle as cut: ax, ay; flipped about that same point)
    const left = d.flip ? d.x - (f.w - f.ax) * k : d.x - f.ax * k;
    blit(ctx, 'gem', f, left, d.b - f.ay * k, d.w, h, d.flip);
  }
}

/** the painted ledges: each look laid over its ledge, its walkable top on the ledge's top */
export function drawStiltLedges(ctx: CanvasRenderingContext2D, ledges: readonly StiltLedge[], view: View): void {
  stiltArtReady();
  for (const l of ledges) {
    if (l.set) {
      const f = SET_FRAMES[l.set];
      const pl = setPlace(l.set, l.x, l.y, l.w, l.over ?? 1, l.flip, l.cut);
      if (seen(pl.left, pl.left + pl.width, pl.top, pl.foot, view)) blit(ctx, 'set', { ...f, h: pl.depth }, pl.left, pl.top, pl.width, pl.depth * pl.k, l.flip);
      continue;
    }
    const L = LEDGE_LOOKS[l.look as LedgeLook];
    const cw = (l.w / l.n) * (l.over ?? LEDGE_OVER);
    const h = l.h ?? ledgeHeight(l.look as LedgeLook, l.w, l.n, l.over);
    const top = l.y - L.top * h;
    if (!seen(l.x - cw, l.x + l.w + cw, top, top + h, view)) continue;
    if (l.look === 'bank') {
      drawFaded(ctx, L.sheet, L.f, l.x + l.w / 2 - cw / 2, top, cw, h, 80);
      continue;
    }
    for (let i = 0; i < l.n; i++) {
      const cx = l.x + (l.w / l.n) * (i + 0.5);
      blit(ctx, L.sheet, L.f, cx - cw / 2, top, cw, h, !!l.flip !== (i % 2 === 1), L.cut ?? 1);
    }
  }
}

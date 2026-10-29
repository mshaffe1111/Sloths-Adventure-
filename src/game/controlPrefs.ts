/**
 * How a touch screen controls the game, chosen in the menu and kept on the device:
 *   screen: no buttons, the whole screen is the controller (slide, flick, tap)
 *   pad:    a floating thumb pad on one side, and Jump / Punch / Kick buttons on the other
 * `padSide` says which side the thumb pad is on; the buttons take the other side (mirrored for left-handers).
 */
export type ControlStyle = 'screen' | 'pad';
export type PadSide = 'right' | 'left';

const STYLE_KEY = 'sloth_ctl_style';
const SIDE_KEY = 'sloth_ctl_side';
const SENS_KEY = 'sloth_ctl_sens';
const HAND_KEY = 'sloth_ctl_hand';

let style: ControlStyle | null = null;
let side: PadSide | null = null;
let sens: number | null = null;
let hand: PadSide | null = null;
const listeners = new Set<() => void>();

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
function write(key: string, v: string) {
  try {
    localStorage.setItem(key, v);
  } catch {
    /* storage blocked: the choice lasts for this visit only */
  }
}

export function controlStyle(): ControlStyle {
  if (style === null) style = read(STYLE_KEY) === 'pad' ? 'pad' : 'screen';
  return style;
}
export function padSide(): PadSide {
  if (side === null) side = read(SIDE_KEY) === 'left' ? 'left' : 'right';
  return side;
}
export function setControlStyle(v: ControlStyle) {
  style = v;
  write(STYLE_KEY, v);
  listeners.forEach((l) => l());
}
export function setPadSide(v: PadSide) {
  side = v;
  write(SIDE_KEY, v);
  listeners.forEach((l) => l());
}
/** Screen mode's touch sensitivity, 0.75 to 1.35 (touchGestures.ts setTouchSensitivity, CT-28) */
export function touchSensitivity(): number {
  if (sens === null) {
    const v = Number(read(SENS_KEY));
    sens = Number.isFinite(v) && v >= 0.75 && v <= 1.35 ? v : 1;
  }
  return sens;
}
export function setTouchSensitivity(v: number) {
  sens = Math.round(Math.max(0.75, Math.min(1.35, v)) * 100) / 100;
  write(SENS_KEY, String(sens));
  listeners.forEach((l) => l());
}
/** which hand steers in Screen mode: a lone first finger on that half steers at once (CT-28; left-handers mirror it) */
export function steerHand(): PadSide {
  if (hand === null) hand = read(HAND_KEY) === 'right' ? 'right' : 'left';
  return hand;
}
export function setSteerHand(v: PadSide) {
  hand = v;
  write(HAND_KEY, v);
  listeners.forEach((l) => l());
}
export function subscribeControls(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

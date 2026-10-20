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

let style: ControlStyle | null = null;
let side: PadSide | null = null;
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
export function subscribeControls(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

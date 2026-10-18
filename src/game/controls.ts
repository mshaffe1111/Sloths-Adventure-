/**
 * Control settings (saved on the device) and the tilt sensor.
 *
 * The game has no on-screen buttons. Two schemes:
 *   gestures : left half of the screen is a floating stick (drag to run, drag down to duck, drag up to jump);
 *              right half is the action pad (tap = punch, flick up = jump, flick sideways = kick,
 *              flick down = duck, hold = mega).
 *   tilt     : lean the phone to run; the whole screen is the action pad.
 */

export type ControlMode = 'gestures' | 'tilt';

const KEY_MODE = 'sloth_control_mode';
const KEY_FLIP = 'sloth_tilt_flip';

type Listener = () => void;
const listeners = new Set<Listener>();

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
    /* private window: the choice just lasts for this session */
  }
}

let mode: ControlMode = read(KEY_MODE) === 'tilt' ? 'tilt' : 'gestures';
let flip = read(KEY_FLIP) === '1';

export const getControlMode = (): ControlMode => mode;
export const getTiltFlip = (): boolean => flip;

export function setControlMode(m: ControlMode) {
  mode = m;
  write(KEY_MODE, m);
  listeners.forEach((l) => l());
}
export function setTiltFlip(v: boolean) {
  flip = v;
  write(KEY_FLIP, v ? '1' : '0');
  listeners.forEach((l) => l());
}
export function subscribeControls(l: Listener): () => void {
  listeners.add(l);
  return () => listeners.delete(l);
}

// ---------------------------------------------------------------- tilt

type OrientationCtor = typeof DeviceOrientationEvent & { requestPermission?: () => Promise<'granted' | 'denied'> };

/** does this device have a motion sensor at all? (desktop browsers expose the event but never fire it) */
export const tiltSupported = (): boolean => typeof window !== 'undefined' && 'DeviceOrientationEvent' in window;

/**
 * iPhone and iPad ask for motion access, and only inside a tap. Everything else just says yes.
 * Call this from the button press that turns tilt on.
 */
export async function requestTiltPermission(): Promise<'granted' | 'denied' | 'unsupported'> {
  if (!tiltSupported()) return 'unsupported';
  const ctor = window.DeviceOrientationEvent as OrientationCtor;
  if (typeof ctor.requestPermission === 'function') {
    try {
      return (await ctor.requestPermission()) === 'granted' ? 'granted' : 'denied';
    } catch {
      return 'denied';
    }
  }
  return 'granted';
}

/** pure maths, so it can be tested: sideways lean in degrees for a given screen rotation (positive = right side down) */
export function leanFromOrientation(beta: number, gamma: number, screenAngle: number): number {
  const a = ((screenAngle % 360) + 360) % 360;
  if (a === 90) return beta;
  if (a === 270) return -beta;
  if (a === 180) return -gamma;
  return gamma;
}

export type TiltDir = 'left' | 'right' | 'none';

/** turn a lean (relative to the held-neutral pose) into a direction, with a dead zone and a little hysteresis */
export function tiltDirection(lean: number, prev: TiltDir, deadZone = 7): TiltDir {
  const enter = deadZone;
  const leave = deadZone * 0.6;
  if (prev === 'right') return lean > leave ? 'right' : lean < -enter ? 'left' : 'none';
  if (prev === 'left') return lean < -leave ? 'left' : lean > enter ? 'right' : 'none';
  return lean > enter ? 'right' : lean < -enter ? 'left' : 'none';
}

export class TiltSensor {
  private neutral: number | null = null;
  private lastAngle = -1;
  private dir: TiltDir = 'none';
  private heard = false;
  private timer: number | null = null;

  constructor(
    private onDir: (d: TiltDir) => void,
    private onMissing?: () => void,
  ) {}

  /** call when the player is holding the phone the way they like (level start, resume) */
  public recenter() {
    this.neutral = null;
  }

  private screenAngle(): number {
    const so = typeof screen !== 'undefined' ? screen.orientation : undefined;
    if (so && typeof so.angle === 'number') return so.angle;
    const wo = (window as unknown as { orientation?: number }).orientation;
    return typeof wo === 'number' ? wo : 0;
  }

  private handle = (e: DeviceOrientationEvent) => {
    if (e.gamma === null || e.beta === null) return;
    this.heard = true;
    const angle = this.screenAngle();
    const lean = leanFromOrientation(e.beta, e.gamma, angle);
    // a new neutral whenever the first reading arrives or the screen is turned
    if (this.neutral === null || angle !== this.lastAngle) {
      this.neutral = lean;
      this.lastAngle = angle;
    }
    let rel = lean - this.neutral;
    // an angle can wrap (for example beta passing 180); keep the difference small
    if (rel > 180) rel -= 360;
    if (rel < -180) rel += 360;
    if (getTiltFlip()) rel = -rel;
    const next = tiltDirection(rel, this.dir);
    if (next !== this.dir) {
      this.dir = next;
      this.onDir(next);
    }
  };

  public start() {
    window.addEventListener('deviceorientation', this.handle);
    // a device with no sensor never fires the event; tell the caller so it can fall back
    this.timer = window.setTimeout(() => {
      if (!this.heard) this.onMissing?.();
    }, 2000);
  }

  public stop() {
    window.removeEventListener('deviceorientation', this.handle);
    if (this.timer !== null) window.clearTimeout(this.timer);
    this.timer = null;
    if (this.dir !== 'none') {
      this.dir = 'none';
      this.onDir('none');
    }
  }
}

// ---------------------------------------------------------------- wide mode

/** go fullscreen (the browser bars go away). Safe to call anywhere; it only works inside a tap. */
export function enterWideMode() {
  try {
    const el = document.documentElement as HTMLElement & { webkitRequestFullscreen?: () => Promise<void> };
    if (document.fullscreenElement) return;
    const req = el.requestFullscreen?.bind(el) ?? el.webkitRequestFullscreen?.bind(el);
    // navigationUI hides the Android gesture bar hint
    const r = req?.({ navigationUI: 'hide' } as FullscreenOptions) as Promise<void> | undefined;
    r?.catch(() => {});
  } catch {
    /* iPhone Safari has no fullscreen for pages; an installed app already is */
  }
}

export function leaveWideMode() {
  try {
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => {});
  } catch {
    /* ignore */
  }
}

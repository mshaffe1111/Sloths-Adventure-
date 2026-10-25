import type { InputState } from './types.ts';
import { parseTouchVector } from './rules.ts';

/** a touch jump is held at least this long: a jump stops rising the moment the press is let go, and the level builder assumes a full jump (about 216 ms of rising), so a flick must give a full one, not the three-quarters a 130 ms press gave */
export const MIN_TOUCH_JUMP_HOLD_MS = 220;

export class InputEngine {
  public state: InputState = {
    left: false,
    right: false,
    up: false,
    down: false,
    jumpPressed: false,
    jumpHeld: false,
    punchPressed: false,
    kickPressed: false,
    kickDir: 0,
    megaPunchPressed: false,
    layerSwitchPressed: false,
    touchJoystickAngle: null,
    touchJoystickMagnitude: 0,
  };

  /**
   * Who is playing: the keyboard, a game pad / the on-screen Pad, or the Screen gestures (whole screen is the controller). The jump help in
   * jumpHelp.ts only touches the last.
   */
  public source: 'keys' | 'pad' | 'gesture' = 'keys';
  /** the engine says, every frame: he is in the air and still has a second jump (the gesture recogniser then takes a shorter slide up as that jump) */
  public airJumpReady = false;
  /** the engine says something is close enough to kick (the refined touch rules only kick then) */
  public kickNear = true;
  /** the engine says he is climbing a trunk or swinging on a vine (the refined touch rules climb there instead of jumping) */
  public onVine = false;
  /** the engine says, every frame: a mega punch can start (it is not cooling down), so a held thumb only announces one that will happen */
  public megaReady = true;
  private jumpBufferTimer = 0;
  private punchBufferTimer = 0;
  private kickBufferTimer = 0;
  private megaBufferTimer = 0;
  private lastUpPressTime = 0;
  private isDestroyed = false;
  /** the touch recogniser registers here so a blur or a hidden page also cancels its fingers */
  public onFocusLost: (() => void) | null = null;
  private padPrev = { left: false, right: false, up: false, down: false, punch: false, kick: false, mega: false };
  private touchUpAt = 0;
  private upReleaseTimer: number | undefined;

  constructor() {
    this.bindKeyboardEvents();
  }

  private bindKeyboardEvents() {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    window.addEventListener('blur', this.handleBlur);
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    const key = e.code;

    // Prevent scrolling for game controls
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(key)) {
      e.preventDefault();
    }
    // holding a key makes the browser repeat it: only the first press counts (or a held jump would double-jump and bunny-hop)
    if (e.repeat) return;
    this.source = 'keys';

    if (key === 'ArrowLeft' || key === 'KeyA') {
      this.state.left = true;
    }
    if (key === 'ArrowRight' || key === 'KeyD') {
      this.state.right = true;
    }

    // Up / Jump (Pressing up triggers jump, pressing up twice triggers double jump!)
    if (key === 'ArrowUp' || key === 'KeyW' || key === 'Space') {
      const now = performance.now();
      const isUpTwice = now - this.lastUpPressTime < 340;
      this.lastUpPressTime = now;

      this.state.up = true;
      if (!this.state.jumpHeld || isUpTwice) {
        this.state.jumpPressed = true;
        this.jumpBufferTimer = 0.16;
      }
      this.state.jumpHeld = true;
    }

    // Press down duck
    if (key === 'ArrowDown' || key === 'KeyS') {
      this.state.down = true;
    }

    // Tap to punch (J, Z). Every press is a punch: mashing the key must never turn into slower kicks (K and X kick)
    if (key === 'KeyJ' || key === 'KeyZ') {
      this.state.punchPressed = true;
      this.punchBufferTimer = 0.12;
    }

    // Dedicated Kick key (KeyK, KeyX)
    if (key === 'KeyK' || key === 'KeyX') {
      this.state.kickPressed = true;
      this.kickBufferTimer = 0.14;
    }

    // Mega punch / dash (KeyL, Shift)
    if (key === 'KeyL' || key === 'ShiftLeft' || key === 'ShiftRight') {
      this.state.megaPunchPressed = true;
      this.megaBufferTimer = 0.14;
      this.state.layerSwitchPressed = true;
    }
  };

  private handleKeyUp = (e: KeyboardEvent) => {
    const key = e.code;
    if (key === 'ArrowLeft' || key === 'KeyA') this.state.left = false;
    if (key === 'ArrowRight' || key === 'KeyD') this.state.right = false;
    if (key === 'ArrowUp' || key === 'KeyW' || key === 'Space') {
      this.state.up = false;
      this.state.jumpHeld = false;
    }
    if (key === 'ArrowDown' || key === 'KeyS') this.state.down = false;
  };

  private handleBlur = () => {
    this.clearAll();
    this.onFocusLost?.();
  };

  private handleVisibilityChange = () => {
    if (document.hidden) {
      this.clearAll();
      this.onFocusLost?.();
    }
  };

  public clearAll() {
    this.state.left = false;
    this.state.right = false;
    this.state.up = false;
    this.state.down = false;
    this.state.jumpPressed = false;
    this.state.jumpHeld = false;
    this.state.punchPressed = false;
    this.state.kickPressed = false;
    this.state.kickDir = 0;
    this.state.megaPunchPressed = false;
    this.state.layerSwitchPressed = false;
    this.state.touchJoystickAngle = null;
    this.state.touchJoystickMagnitude = 0;
    if (this.upReleaseTimer !== undefined) window.clearTimeout(this.upReleaseTimer);
    this.upReleaseTimer = undefined;
    this.jumpBufferTimer = 0;
    this.punchBufferTimer = 0;
    this.kickBufferTimer = 0;
    this.megaBufferTimer = 0;
  }

  /**
   * Touch Gesture Controls:
   * - Slide finger right to move right
   * - Slide finger left to move left
   */
  public triggerTouchMove(direction: 'left' | 'right' | 'none') {
    if (direction === 'left') {
      this.state.left = true;
      this.state.right = false;
    } else if (direction === 'right') {
      this.state.right = true;
      this.state.left = false;
    } else {
      this.state.left = false;
      this.state.right = false;
    }
  }

  /**
   * Touch Gesture:
   * - Jump pressing up
   * - Double jump pressing up twice
   */
  public triggerTouchUp() {
    if (this.upReleaseTimer !== undefined) window.clearTimeout(this.upReleaseTimer);
    this.upReleaseTimer = undefined;
    this.touchUpAt = performance.now();
    this.state.up = true;
    this.state.jumpPressed = true;
    this.state.jumpHeld = true;
    this.jumpBufferTimer = 0.16;
  }

  /** climbing on a vine or trunk by touch: hold up or down with no jump (refined controls) */
  public triggerTouchClimb(dir: -1 | 0 | 1) {
    this.state.up = dir < 0;
    this.state.down = dir > 0;
  }

  public releaseTouchUp() {
    // a quick flick lifts the finger almost at once, and an instant release would cut the jump to a hop:
    // the press counts for at least this long
    const wait = MIN_TOUCH_JUMP_HOLD_MS - (performance.now() - this.touchUpAt);
    if (wait > 4) {
      if (this.upReleaseTimer === undefined) {
        this.upReleaseTimer = window.setTimeout(() => {
          this.upReleaseTimer = undefined;
          this.releaseTouchUp();
        }, wait);
      }
      return;
    }
    this.state.up = false;
    this.state.jumpHeld = false;
  }

  /**
   * Touch Gesture:
   * - Press down duck
   */
  public triggerTouchDuck(ducking: boolean) {
    this.state.down = ducking;
  }

  /**
   * Touch Gesture:
   * - Tap to punch
   */
  public triggerTouchPunch() {
    this.state.punchPressed = true;
    this.punchBufferTimer = 0.12;
  }

  /**
   * Touch Gesture:
   * - Double tap to kick
   */
  public triggerTouchKick(dir: number = 0) {
    this.state.kickDir = dir;
    this.state.kickPressed = true;
    this.kickBufferTimer = 0.14;
  }

  /**
   * Touch Gesture:
   * - Hold to mega punch
   */
  public triggerTouchMega() {
    this.state.megaPunchPressed = true;
    this.megaBufferTimer = 0.14;
  }

  public triggerTouchLayerSwitch() {
    this.state.layerSwitchPressed = true;
  }

  /**
   * Frame tick: decay single-frame / buffered inputs & poll connected gamepads
   */
  public update(dt: number) {
    // Poll connected Gamepads (Xbox, PlayStation, standard controllers)
    try {
      if (typeof navigator !== 'undefined' && typeof navigator.getGamepads === 'function') {
        const gamepads = navigator.getGamepads();
        // what the pads hold right now, all pads together
        const now = { left: false, right: false, up: false, down: false, punch: false, kick: false, mega: false };
        for (let i = 0; i < gamepads.length; i++) {
          const gp = gamepads[i];
          if (!gp) continue;
          const axisX = gp.axes[0] ?? 0;
          const axisY = gp.axes[1] ?? 0;
          // D-Pad buttons (standard mapping: 12=up, 13=down, 14=left, 15=right)
          if (axisX < -0.35 || gp.buttons[14]?.pressed) now.left = true;
          if (axisX > 0.35 || gp.buttons[15]?.pressed) now.right = true;
          // Up / Climb / Jump (D-pad up or A button - index 0)
          if (axisY < -0.4 || gp.buttons[12]?.pressed || gp.buttons[0]?.pressed) now.up = true;
          if (axisY > 0.4 || gp.buttons[13]?.pressed) now.down = true;
          // Punch: X (2) or Y (3). Kick: B (1). Mega: bumpers / triggers (4-7)
          if (gp.buttons[2]?.pressed || gp.buttons[3]?.pressed) now.punch = true;
          if (gp.buttons[1]?.pressed) now.kick = true;
          if (gp.buttons[4]?.pressed || gp.buttons[5]?.pressed || gp.buttons[6]?.pressed || gp.buttons[7]?.pressed) now.mega = true;
        }
        const prev = this.padPrev;
        if (now.left || now.right || now.up || now.down || now.punch || now.kick || now.mega) this.source = 'pad';
        // directions follow the pad both ways: letting go of the stick lets go of the direction
        if (now.left) this.state.left = true;
        else if (prev.left) this.state.left = false;
        if (now.right) this.state.right = true;
        else if (prev.right) this.state.right = false;
        if (now.down) this.state.down = true;
        else if (prev.down) this.state.down = false;
        if (now.up) {
          this.state.up = true;
          if (!prev.up) {
            this.state.jumpPressed = true;
            this.jumpBufferTimer = 0.16;
          }
          this.state.jumpHeld = true;
        } else if (prev.up) {
          this.state.up = false;
          this.state.jumpHeld = false;
        }
        // buttons act once per press, not on every poll while held
        if (now.punch && !prev.punch) {
          this.state.punchPressed = true;
          this.punchBufferTimer = 0.12;
        }
        if (now.kick && !prev.kick) {
          this.state.kickPressed = true;
          this.kickBufferTimer = 0.14;
        }
        if (now.mega && !prev.mega) {
          this.state.megaPunchPressed = true;
          this.megaBufferTimer = 0.14;
          this.state.layerSwitchPressed = true;
        }
        this.padPrev = now;
      }
    } catch {}

    if (this.jumpBufferTimer > 0) {
      this.jumpBufferTimer -= dt;
      if (this.jumpBufferTimer <= 0) {
        this.state.jumpPressed = false;
      }
    } else {
      this.state.jumpPressed = false;
    }

    if (this.punchBufferTimer > 0) {
      this.punchBufferTimer -= dt;
      if (this.punchBufferTimer <= 0) {
        this.state.punchPressed = false;
      }
    } else {
      this.state.punchPressed = false;
    }

    if (this.kickBufferTimer > 0) {
      this.kickBufferTimer -= dt;
      if (this.kickBufferTimer <= 0) {
        this.state.kickPressed = false;
      }
    } else {
      this.state.kickPressed = false;
    }

    // a mega press survives a short buffer so the attack code (which runs after this) can read it
    if (this.megaBufferTimer > 0) {
      this.megaBufferTimer -= dt;
      if (this.megaBufferTimer <= 0) this.state.megaPunchPressed = false;
    } else {
      this.state.megaPunchPressed = false;
    }
    this.state.layerSwitchPressed = false;
  }

  public triggerHaptic(durationMs = 15) {
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(durationMs);
      }
    } catch {}
  }

  public destroy() {
    if (this.isDestroyed) return;
    this.isDestroyed = true;
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('blur', this.handleBlur);
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
  }
}

import type { InputState } from './types.ts';
import { parseTouchVector } from './rules.ts';

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
    megaPunchPressed: false,
    layerSwitchPressed: false,
    touchJoystickAngle: null,
    touchJoystickMagnitude: 0,
  };

  private jumpBufferTimer = 0;
  private punchBufferTimer = 0;
  private kickBufferTimer = 0;
  private lastPunchTapTime = 0;
  private lastUpPressTime = 0;
  private isDestroyed = false;

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

    // Tap to punch (J, Z), double tap or X/K to kick
    if (key === 'KeyJ' || key === 'KeyZ') {
      const now = performance.now();
      const isDoubleTap = now - this.lastPunchTapTime < 300;
      this.lastPunchTapTime = now;

      if (isDoubleTap) {
        // Double tap kicks!
        this.state.kickPressed = true;
        this.kickBufferTimer = 0.14;
      } else {
        // Tap punches!
        this.state.punchPressed = true;
        this.punchBufferTimer = 0.12;
      }
    }

    // Dedicated Kick key (KeyK, KeyX)
    if (key === 'KeyK' || key === 'KeyX') {
      this.state.kickPressed = true;
      this.kickBufferTimer = 0.14;
    }

    // Mega punch / dash (KeyL, Shift)
    if (key === 'KeyL' || key === 'ShiftLeft' || key === 'ShiftRight') {
      this.state.megaPunchPressed = true;
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
  };

  private handleVisibilityChange = () => {
    if (document.hidden) {
      this.clearAll();
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
    this.state.megaPunchPressed = false;
    this.state.layerSwitchPressed = false;
    this.state.touchJoystickAngle = null;
    this.state.touchJoystickMagnitude = 0;
    this.jumpBufferTimer = 0;
    this.punchBufferTimer = 0;
    this.kickBufferTimer = 0;
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
    this.state.up = true;
    this.state.jumpPressed = true;
    this.state.jumpHeld = true;
    this.jumpBufferTimer = 0.16;
  }

  public releaseTouchUp() {
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
  public triggerTouchKick() {
    this.state.kickPressed = true;
    this.kickBufferTimer = 0.14;
  }

  public triggerTouchLayerSwitch() {
    this.state.layerSwitchPressed = true;
  }

  /**
   * Frame tick: decay single-frame / buffered inputs
   */
  public update(dt: number) {
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

    this.state.megaPunchPressed = false;
    this.state.layerSwitchPressed = false;
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

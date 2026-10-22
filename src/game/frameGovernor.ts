/**
 * frameGovernor — decides when the screen cannot keep up and the picture should get lighter.
 *
 * The loop runs at a steady 30 fps (a frame every ~33 ms), so a healthy phone shows gaps of ~33 ms and a struggling one shows more. Every
 * frame's real gap is fed in; over each window the average is judged, and when it is slower than `slowMs` (about 24 fps) it says "step down"
 * (the caller lowers the render resolution one notch). A step is followed by a short settling time before anything is judged again, so the
 * cost of resizing is not mistaken for slowness. A single huge gap (the app was in the background) is clamped so it cannot trigger a step.
 */
export const GOV_WINDOW_MS = 1200;
export const GOV_SLOW_MS = 40;
export const GOV_WARMUP_MS = 1000;
export const GOV_SETTLE_MS = 1500;
export const GOV_MAX_GAP_MS = 120;

export class FrameGovernor {
  private warm: number = GOV_WARMUP_MS;
  private frames = 0;
  private ms = 0;

  /** a new stage: warm up again (caches are being built) */
  reset() {
    this.warm = GOV_WARMUP_MS;
    this.frames = 0;
    this.ms = 0;
  }

  /** one frame's real gap in ms; true when the picture should get lighter now */
  feed(gapMs: number): boolean {
    const gap = Math.min(Math.max(gapMs, 0), GOV_MAX_GAP_MS);
    if (this.warm > 0) {
      this.warm -= gap;
      return false;
    }
    this.frames++;
    this.ms += gap;
    if (this.ms < GOV_WINDOW_MS) return false;
    const avg = this.ms / this.frames;
    this.frames = 0;
    this.ms = 0;
    if (avg > GOV_SLOW_MS) {
      this.warm = GOV_SETTLE_MS;
      return true;
    }
    return false;
  }
}

/**
 * What the screen has settled on, kept across stages so a new stage does not start at full quality and slow down all over again.
 * Re-probed one notch lighter-to-heavier every few minutes, in case the phone has cooled or stopped being busy.
 */
export const learned = { quality: 0, at: 0 };
export const GOV_REPROBE_MS = 180_000;

/** the quality a new stage should start at (and, if it has been a while since the last step down, one notch better) */
export function startQuality(now: number): number {
  if (learned.quality > 0 && now - learned.at > GOV_REPROBE_MS) {
    learned.quality--;
    learned.at = now;
  }
  return learned.quality;
}

export function noteStepDown(quality: number, now: number) {
  learned.quality = quality;
  learned.at = now;
}

/**
 * Which stretch of a hand-built stage Pokey is in, for the control-test recorder's `section` line (playRecorder.ts), with hysteresis.
 *
 * The stretch used to be simply the one his x was in, so swinging on a liana that hangs over the line between two stretches flipped the
 * label back and forth ('Develop' and 'Twist' five times in 2 s in Matt's swing-stage test, 2026-10-26), and every flip was logged as
 * entering a stretch (it also spoiled the "seconds per section" the play-tester profiles are built from). Now a new stretch only counts
 * once he is well inside it (`px` past the line) and has stayed on that side for `sec`, and not while he is still swinging on a liana
 * (where he lets go, or lands, decides it).
 *
 * Nothing in the game itself (hints, Dot's lines, lesson cards) is keyed to entering a stretch: hints fire once at their own x and
 * remember it (engine.ts proto hints, tipMemory.ts), lessons once per device (lessons.ts). This only shapes what the recorder logs.
 */

export const SECTION_HYST = {
  /** how far past the line into the new stretch (px) */
  px: 40,
  /** for how long he must have stayed on the new stretch's side (s) */
  sec: 0.5,
} as const;

/** a stretch: from x, to x, its name (ProtoExtras.beats) */
export type Beat = readonly [number, number, string];

export class SectionTrack {
  private cur = '';
  private cand = '';
  private candSince = 0;

  /** the stretch to report now, given where he is (`x`), the time (s) and whether he is swinging on a liana */
  update(beats: readonly Beat[], x: number, t: number, swinging = false): string {
    const b = beats.find((s) => x >= s[0] && x < s[1]);
    // (between stretches, or past the last: keep the one he was in)
    if (!b) return this.cur;
    const raw = b[2];
    if (!this.cur) {
      this.cur = raw;
      this.cand = '';
      return raw;
    }
    if (raw === this.cur) {
      this.cand = '';
      return raw;
    }
    if (raw !== this.cand) {
      this.cand = raw;
      this.candSince = t;
    }
    const inside = Math.min(x - b[0], b[1] - x) >= Math.min(SECTION_HYST.px, (b[1] - b[0]) / 2);
    if (!swinging && inside && t - this.candSince >= SECTION_HYST.sec) {
      this.cur = raw;
      this.cand = '';
    }
    return this.cur;
  }
}

/** The orchestra's file names (src/assets/orch, made by scripts/prepOrch.py): pure, so tests can read them without the asset glob. */

/** how long a looped steady stretch is when its file does not say, in seconds (prepOrch.py's LOOP_LEN) */
export const LOOP_LEN = 1.8;

/**
 * "cello_50_1300.mp3" -> instrument, MIDI note, loop start in seconds; a sustained note also names its loop's length in samples at 44.1 kHz
 * ("oboe_89_300_80157.mp3"): prepOrch.py chooses each note's loop so it is a whole number of the note's periods long and level at both ends
 * (polish report SN-8), and the length is given exactly so the loop point stays in phase.
 */
export function parseOrchName(path: string): { inst: string; midi: number; loop: number; len: number } | null {
  const m = /\/([A-Za-z]+)_(\d+)_(\d+)(?:_(\d+))?\.mp3$/.exec(path);
  return m ? { inst: m[1], midi: Number(m[2]), loop: Number(m[3]) / 1000, len: m[4] ? Number(m[4]) / 44100 : LOOP_LEN } : null;
}

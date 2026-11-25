/**
 * drum — the court's drum you hear (reference/design/2-9.md NEW 2, R-165.449; ENG-29): the hits of a stage's tempo, on game time. ONE of
 * every bar is a BOOM, every other beat a tok; doubled (the twist) every half beat is a hit, ONE still the BOOM. The conductor schedules
 * them on the AUDIO clock ahead of time (conductor.ts LOOKAHEAD), never on the frame, so every hit lands on its beat whatever the frame
 * rate. Pure: game seconds in, hits out (no audio context, no engine).
 */

/** a stage's beat as the drum reads it: beats a bar and one beat's length on this setting (tempo.ts tempoBeat) */
export interface DrumBeat { beats: number; beat: number }
export type DrumKind = 'boom' | 'tok';
export interface DrumHit { g: number; kind: DrumKind }

/** every hit with game time in [g0, g1), in order (a hit on g0 included, none on g1) */
export function drumHits(b: DrumBeat, g0: number, g1: number, doubled = false): DrumHit[] {
  const step = doubled ? b.beat / 2 : b.beat;
  const per = doubled ? b.beats * 2 : b.beats;
  const out: DrumHit[] = [];
  if (!(g1 > g0) || !(step > 0)) return out;
  // (by index, never by summing: hit k is exactly k * step, so a minute of beats drifts by nothing)
  for (let k = Math.ceil(g0 / step - 1e-9); k * step < g1 - 1e-9; k++) out.push({ g: k * step, kind: ((k % per) + per) % per === 0 ? 'boom' : 'tok' });
  return out;
}

/** how far ahead of game time the drum is scheduled (s): two frames. The engine calls the drum every step, so the lookahead only has to
 *  ride out one late frame; a longer one (the ambience's 0.6 s) would leave hits sounding on wall time through a lost life's down */
export const DRUM_AHEAD = 2 / 30;

/** game time that moves more than this in one step has jumped (s): a seek, never play (one step is 1/30 s) */
export const DRUM_JUMP = 0.25;

/** a hit to start on the audio clock: its beat on game time, its kind, and the audio time it sounds at */
export interface DrumCue extends DrumHit { at: number }

/**
 * The drum's schedule (2-9.md NEW 2; the lead's ruling: GAME TIME). Called every engine step with the game's time and the audio clock's:
 * each hit is put on the audio clock at audioNow + (g - gameNow), re-anchored every step, so it sounds when the game reaches its beat,
 * in step with the logs and the lianas (which run on game time). While game time STANDS (a lost life's 0.75 s down, engine.ts stepDown)
 * nothing new is scheduled and any hit not yet sounded is cut (`cut`: the conductor drops the drum's bus), to be put back on the audio
 * clock when game time runs again: the next hit falls on the clocks' next beat, never a burst of beats, never drifting off them. Game time
 * going BACK (a restart, a resume at a flag) cuts too and starts again from there.
 */
export class DrumSchedule {
  /** hits with game time before this are scheduled (or were cut and are owed again from it) */
  private to = NaN;
  private last = NaN;
  private pending: DrumCue[] = [];

  step(b: DrumBeat, gameNow: number, audioNow: number, doubled = false, ahead = DRUM_AHEAD): { play: DrumCue[]; cut: boolean } {
    if (!Number.isNaN(this.last) && gameNow <= this.last + 1e-9) {
      // (game time stands, or went back: what has not sounded yet is cut and owed again from its beat; back, from where it went)
      const cut = this.hold(gameNow, audioNow);
      if (gameNow < this.last - 1e-9) this.to = gameNow;
      this.last = gameNow;
      return { play: [], cut };
    }
    this.pending = this.pending.filter((h) => h.at > audioNow);
    // (a first step, or game time that JUMPED (a stage started again, a resume at a flag): from now, never a burst of the beats behind it.
    // Otherwise from what is owed: a beat the game passed inside this step (one cut at a hold, met as game time runs again) sounds now,
    // at most a step late, never skipped)
    const from = Number.isNaN(this.to) || gameNow - this.last > DRUM_JUMP ? gameNow : Math.max(this.to, this.last);
    const play = drumHits(b, from, gameNow + ahead, doubled).map((h) => ({ ...h, at: Math.max(audioNow, audioNow + (h.g - gameNow)) }));
    this.pending.push(...play);
    this.to = Math.max(from, gameNow + ahead);
    this.last = gameNow;
    return { play, cut: false };
  }

  /**
   * Game time stops HERE (the engine, the step a life is lost: its down starts on the next): every hit not yet sounded is cut, owed again
   * from its beat. A step only sees game time stand a step late, when a hit due inside that step has already sounded on wall time; the
   * engine knows the moment. Returns whether anything was cut (the conductor then drops the drum's bus).
   */
  hold(gameNow: number, audioNow: number): boolean {
    this.pending = this.pending.filter((h) => h.at > audioNow);
    if (!this.pending.length) return false;
    this.to = Math.min(Number.isNaN(this.to) ? Infinity : this.to, ...this.pending.map((h) => Math.max(h.g, gameNow)));
    this.pending = [];
    return true;
  }
}

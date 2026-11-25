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

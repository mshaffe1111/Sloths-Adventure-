/**
 * World 1's lianas (ENGINE-678 A1 SWING-W1, R-165.198): the self-swinging liana as World 1 data, so a World 1 stage (1-6 First Lianas
 * first) lays it as World 6, 7 and 8 do (w6Swing.ts, w7Swing.ts, w8Swing.ts).
 *
 *  - `withSwing(kit)`: any kit with the 'swing' move added (a section with a liana is never picked without it, pipeline hangsNeed). It
 *    is added by the stage's own kit, as 1-4's kit adds 'climb' (w1Arc14.ts kitLib14): World 1's manifest (w1.ts) keeps ['double'],
 *    so 1-1..1-5 build exactly as before (lockall).
 *  - The three gaps a liana makes (1-6.md "FIRST, measured": a 420 px liana, the ledge 400 px under its anchor), each a grip dial on the
 *    liana and a share of its perch band (pipeline lianaBand, from the release window of the holds the dial names, gripsOf):
 *      SHORT  grip 'high': the top flies it, so every hold does (1-6's first liana, and its risers: "climb high, then let go");
 *      LONG   no dial: the worse of two low holds (pressWindow's own), the far end of their band ("hang low": the top drops short);
 *      FAR    grip 'low': the foot only, past where the two low holds reach ("slide down ahead of the snake").
 *    The band is the pipeline's, so a FAR perch is only as far as the foot's window (Normal 167 ms, Easy 300 ms: LIANA.window) and
 *    today's level check (levelCheck swingLandings) allow; nothing here is a px number of the engine's.
 *  - World 1's pieces for it: boughs (shape 'branch', World 1's style), the liana's anchor 400-420 px over the bough it leaves (1-6.md),
 *    and the soft pit under every liana gap (World 1's falls: moss and a root stair back up to the take-off, pipeline backPit).
 *
 * No stage id, seed or x lives here; a section names the stages it is laid in only through the kit that lists it.
 */
import type { LianaGrip, Range, SectionPiece, SectionTemplate, Socket, WorldKit } from '../types.ts';

/** a kit whose stages may require the swing: its moves plus 'swing' (any world; a kit that has it already is returned as it was) */
export function withSwing(kit: WorldKit): WorldKit {
  const M = kit.manifest;
  if (M.moves.includes('swing')) return kit;
  return { ...kit, manifest: { ...M, moves: [...M.moves, 'swing'] } };
}

/** the three gaps a liana makes: the grip its reach is checked at, and where along its perch band the perch's near end goes */
export type LianaGap = 'short' | 'long' | 'far';
export const W1_LIANA_GAP: Record<LianaGap, { grip?: LianaGrip; share: Range; window?: { normal: number; easy: number } }> = {
  short: { grip: 'high', share: [0, 0.35] },
  long: { share: [0.75, 1] },
  // (R-165.225, Matt 11-14 "shorter swings", the lead's ruling (A): a dialled perch's far end must be in view as he presses
  // (cameraFollow.ts SWING_SEEN), so FAR's perch is narrow (120-140 px, the row below: its width costs no window, ENG-S1 cap.out.txt)
  // and it keeps the foot 300 ms on Normal (460-500 px past the anchor) and 550 ms on Easy (500 or under: cap-seen.out.txt))
  far: { grip: 'low', share: [0.85, 1], window: { normal: 0.3, easy: 0.55 } },
};

/** a bough (World 1's look): a landing unless told, `main` so the lay may stand a flag on a wide one */
const bough = (key: string, place: SectionPiece['place'], w: Range, o: Partial<SectionPiece> = {}): SectionPiece =>
  ({ key, shape: 'branch', w, place, style: 'branch', landing: true, main: true, ...o });
/** a liana past `after`'s end, its anchor 400-420 px over it (1-6.md's measured liana), its reach checked at the gap's grip */
export const w1Liana = (key: string, after: string, gap: LianaGap): SectionPiece =>
  ({ key, shape: 'liana', w: [0, 0], place: { kind: 'swing', after, top: [400, 420], ...(W1_LIANA_GAP[gap].grip ? { grip: W1_LIANA_GAP[gap].grip } : {}) } });
/** the bough a liana throws him onto, level with the one he left, at the gap's share of its band */
export const w1Perch = (key: string, liana: string, gap: LianaGap, w: Range): SectionPiece =>
  bough(key, { kind: 'land', after: liana, dy: [0, 0], share: W1_LIANA_GAP[gap].share, ...(W1_LIANA_GAP[gap].window ? { window: W1_LIANA_GAP[gap].window } : {}) }, w);
const petals = (id: string, on: string, t: Range | number, n = 1, span = 80): Socket => ({ id, role: 'pickup', on, t, dn: 34, count: n, span });

/** one liana over one gap: a bough, the liana, the perch, a bough on (a section a World 1 liana stage builds its beats from) */
const one = (gap: LianaGap, difficulty: number, perchW: Range): SectionTemplate => ({
  id: `w1-liana-${gap}`, name: `a liana over a ${gap.toUpperCase()} gap`, archetypes: ['vine_runner'], phases: ['ki', 'sho', 'ten', 'ketsu'], difficulty,
  pieces: [bough('a', { kind: 'start' }, [260, 300]), w1Liana('l', 'a', gap), w1Perch('b', 'l', gap, perchW)],
  entry: { piece: 'a', kind: 'ledge' }, exit: { piece: 'b', kind: 'ledge' }, exitDy: 0,
  sockets: [petals('pa', 'a', 0.4), petals('pb', 'b', 0.5, 2)], mirrorable: false,
});

/** World 1's liana sections: one of each gap (the stage's own kit lists them, with withSwing) */
export const W1_SWING_SECTIONS: SectionTemplate[] = [one('short', 3, [240, 280]), one('long', 5, [220, 260]), one('far', 7, [120, 140])];

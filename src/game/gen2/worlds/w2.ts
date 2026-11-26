/**
 * gen2/worlds/w2 — World 2, the Sunlit Riverbank, for the new generator (ENG-W2, 11-14): the world's kit every World 2 level is rolled
 * from (stageTable.ts kit 'w2', listed.ts KITS), its look by world data, and its finish. WORLD DATA (generalitycheck EXEMPT): every fact
 * here is World 2's; the code that reads it names no stage.
 *
 * THE WORLD'S RULE (reference/design/2-1.md, river.ts): the river is the road. Water lies between the banks. In World 2's data:
 *   - a gap a section marks `water: true` is a DEEP river: a fall costs a life on both settings (Matt's rule for water, Dot warns first:
 *     the pipeline's WATER_WARN, with the story keeper's line, W2_TIPS.water);
 *   - every other gap (the world's falls are soft, so the stitcher's seams and a section's plain gaps) is a SPLASH-BACK river: he
 *     splashes and is set back on the bank he left, nothing lost (river.ts RiverZone.safe, the teaching river of the hand-built 2-1).
 *   w2Finish turns each of the built stage's falls into its RiverZone (the painted river, riverArt.ts drawRiverWater; the engine's
 *   splash), so the look and the rule come from the same falls the verdicts judged.
 *
 * THE ART (the inventory, src/game/art/inventory.ts, reference/art/CATALOG-MASTER.csv): every piece the kit lays is drawn by World 2's
 * painted kit (w2.webp: the banks' fill, wall and bank end; its boulders) or the river art (w2-props.webp: the water, the reeds), as
 * the engine draws them for world 2 (terrain.ts footingsFor). W2_ART names the inventory rows; w2.test.ts holds every one in the World 2
 * inventory, usable, inside its scale against Pokey (89.1 px, R-165.107), and every rolled piece drawn by World 2's own art.
 *   - a bank: World 2's earth bank, 90 px deep (the hand-built world's BANK_H), its top on the floor line;
 *   - a rock to hop: World 2's boulder, the kit's painted rock (a moss stone exactly 50 px tall), never under 50 (a smaller one is walked
 *     over, no beat);
 *   - a stepping stone in the river: a bank 120-150 px wide standing in the water (the hand-built creek's stones, 124-144 px).
 *
 * THE STAGES' ARCS. 2-1 and 2-2 are built as designed (w2Arc21.ts BUILD-21, w2Arc22.ts BUILD-22), each with its own kit over this one
 * ('w2-21', 'w2-22'); this kit holds World 2's ground, art, rivers, pads, lianas, tips and finish. The river with its drifting logs is a
 * section of its own (gen2/riverLay.ts), and so is a pond of sinking pads (gen2/rideLay.ts layPads).
 */
import type { PacerRow } from '../../pacer.ts';
import type { FloodRow } from '../../flood.ts';
import type { PostArt } from '../../post.ts';
import type { ColumnDressSpec } from '../../columnDress.ts';
import { G } from '../../protoStage.ts';
import { surfaceBelowBank, type RiverZone } from '../../river.ts';
import { WHEEL } from '../../wheel.ts';
import type { W2Decor } from '../../riverArt.ts';
import type { Platform } from '../../types.ts';
import type { Difficulty, GraphBrief, NodeJob, SectionPiece, SectionTemplate, Socket, WorldKit, WorldManifest } from '../types.ts';
import { hash01 } from '../stillLay.ts';
import { stackedUnder } from '../legs.ts';
import { catchUnder, TOWER } from '../tower.ts';
import type { RiverRow } from '../riverLay.ts';
import type { PadRow } from '../rideLay.ts';
import type { FollowRow } from '../../follow.ts';
import type { WheelRow } from '../wheelLay.ts';
import { W1_KIT } from './w1.ts';
import { W1_LIANA_GAP } from './w1Swing.ts';

/** World 2's ground: the floor line, a bank's depth (the hand-built world's BANK_H) and how deep a splash-back river's bed lies */
export const W2_GROUND = { y: G, bankH: 90, pitDepth: 110 } as const;
type R2 = [number, number];

/**
 * World 2's little ones that follow him home (2-3 "Walk Them Home", reference/design/2-3.md "follow.ts: the engine packet's contract":
 * `FOLLOW = { pace: { normal: 190, easy: 230 }, gap: 34, scamper: 300, rejoin: 60 }`, flown in reference/specs/sims/follow23.ts). `home`
 * is the lead's number (ENG-23, ruled 2:10 PM ET 11-18; to be flown on the real 2-3 by its builder): a bunched five stands 170 px behind
 * him (5 x 34), so at the door all five are past the families' jetty 200 px before it. `step`: they follow him down a step up to a
 * bank's depth (the lead's ruling 3:01 PM ET 11-18: a stair, a bank's lip); deeper, they wait at the lip. A stage lays it as proto.follow.
 */
export const W2_FOLLOW: FollowRow = { pace: { normal: 190, easy: 230 }, gap: 34, scamper: 300, rejoin: 60, home: 200, step: W2_GROUND.bankH };

/**
 * The inventory rows World 2's pieces are drawn as (src/game/art/inventory/w2.json; the engine's World 2 kit painter and river art draw
 * them for world 2): by the piece's job. w2.test.ts holds each row in the World 2 file, usable and in scale.
 */
export const W2_ART = {
  /** the earth bank: its fill, its wall, its end at the water (w2.webp kit frames) */
  bank: ['w2#fill', 'w2#wall', 'w2#bankEnd', 'w2#fill0', 'w2#fill1', 'w2#fill2', 'w2#fill3'],
  /** a rock to hop on the bank: the kit's boulder and two rocks painted from it (w2-rocks.webp), each also mirrored, never the same
   *  beside (rockLooks.ts ROCK_FRAMES, R-165.338; the kit's 'stump' cell is the boulder again, so it is not a second rock) */
  rock: ['w2#boulder', 'w2-rocks#rock-a', 'w2-rocks#rock-b'],
  /** the river: the painted water strip and the reeds at a bank's edge (w2-props.webp) */
  water: ['w2-props#water'],
  reeds: ['w2-props#reedTall', 'w2-props#reedShort', 'w2-props#reedLean'],
  /** the sign at a deep river's edge (proto.gen2.waterWarnings) */
  sign: ['water-signs#sign-jungle'],
} as const;

/** the lessons World 2's placeholder arcs teach (a section's `teaches`, a brief's): 2-1 the river, 2-2 the stepping stones */
export const W2_LESSON = { river: 'river', stones: 'stones' } as const;

/**
 * Dot's words in World 2's kit: the story keeper's only (level.md rule 17). `water` is the keeper's World 2 line for deep water
 * (reference/story/lines-2-1.md `deep`; its words replaced world-wide by KEEPER-24, lines-2-4.md conflict 1, 11-18: "Stay on the logs!"
 * was false at 2-4's beat 6, where he must leave the logs for the vines): the pipeline says it before the first deep river (WATER_WARN),
 * as Dot's warning before water in every world. w2.test.ts holds it equal to the keeper's file's words.
 */
export const W2_TIPS: Record<string, string> = {
  water: 'This river\'s deep. Don\'t touch the water!',
};

/**
 * World 2's rivers as rows (gen2/riverLay.ts RiverRow), from river.ts's recipes (riverRecipes: World 2's speeds 70-120 px/s, logs 125-170
 * px) and 2-1.md's beats: the river section lays one of these between two banks. `ride` the first log, slow, with him, a splash puts him
 * back (2-1 beat 2); `deep` log to log for real (beat 4); `back` a river flowing back at him, its logs closer (beat 6, river.ts gapFor's
 * 80 px as the hand-built 2-1's); `twin` the faster pair at 80 px/s (beat 8); `long` the widest, calmest river and its one long log (beat
 * 10, the signature: its log half as long again as a deep river's, at 80 px/s so a log still comes every 3.9 s, RIVER_LAY.beat). Every
 * row lays fault-free (riverLay.test.ts). The designer tunes the numbers; the rows are the data a river section reads.
 */
export const W2_RIVERS = {
  ride: { dir: 1, speed: 70, logW: 170, logs: 3, safe: true },
  deep: { dir: 1, speed: 75, logW: 160, logs: 3 },
  back: { dir: -1, speed: 70, logW: 150, logs: 2, gap: 80 },
  twin: { dir: 1, speed: 80, logW: 150, logs: 3 },
  long: { dir: 1, speed: 80, logW: 240, logs: 2 },
} as const satisfies Record<string, RiverRow>;

/** an inventory id on World 2's next sheet (w2NextArt.ts), its frame named on its own (so tools/art/artuse.mjs sees the piece drawn) */
const next = (frame: string) => `w2-next#${frame}`;

/**
 * World 2's PACER table (pacer.ts PacerRow; 2-7's mail boat, gen2/pacerLay.ts): the designer's flown numbers, as written
 * (reference/design/2-7.md "FLOWN" and "THE MAIL BOAT", reference/specs/sims/river27.ts): a bank at a full run, 272 px/s; each HOME row's
 * crossing (its water and 230 px of bank) at the careful middle's median rate and the ride-only rate; the boat's time is the middle's
 * + 7% (Easy + 10%: the design's +3 s on its 42 s home leg and +5 s on its 47.8 s Easy leg, as shares, the lead's ruling 11-21, so any
 * leg's length keeps the same race), the boat then rowing at RACE_PACE of that speed (the lead's pick, ENG-27w: the race set by a design
 * number, the gap x pace grid, ENG-27/REPORT.md: with honest bots the expert lost 3 of 5 at full pace; at this pace the expert wins every
 * race, the careful middle 6 of 7 with both Easy races, every win by 2 s or more, and the ride-only bot loses every race by `under` (2 s)
 * or more, measured, pacerLay.test). No row was flown with the current but these three: a race leg that lays
 * another is refused by name. Its art: the mail boat's two rowing frames (ART-NEXT-b, the inventory's w2-next rows).
 */
/** the mail boat's pace by setting, a share of the design's +7% / +10% boat (the lead's pick on the gap x pace grid, ENG-27w: Normal 81%;
 *  Easy 90%, where the ride-only bot rides some races fast (home Easy 2 in 112.8 s, post Easy 5 in 124.2 s) and must still lose by 2 s) */
export const RACE_PACE = { normal: 0.81, easy: 0.9 } as const;
export const W2_RACE: PacerRow = {
  bank: 272,
  rivers: { ride: { middle: 103, rideOnly: 87 }, twin: { middle: 115, rideOnly: 97 }, long: { middle: 126, rideOnly: 104 } },
  crossingBank: 230,
  margin: { normal: (1 + 0.07) / RACE_PACE.normal - 1, easy: (1 + 0.1) / RACE_PACE.easy - 1 },
  under: 2,
  art: [next('mailBoat'), next('mailBoatB')],
};

/** World 2's FLOOD table (flood.ts FloodRow; 2-8's flown numbers, reference/design/2-8.md "FLOWN" @ t-design-26): the low road turns deep
 *  26 s after the last cage on both settings (:16, :20), at least 4 s (Normal) / 8 s (Easy) after the line's prompt tail-off (:58), the
 *  flights' leg 2,000 + 1,400 px from the turn to off the low road (:8-9) and the prompt line's tail-off over it 22.0 / 17.9 s (:13) */
/*  Its CLIMB (the fork's wall-step, flood.ts forkFaults; ENG-28 session 7, APPROVED by the lead as Designer stand-in), each value DERIVED:
 *  - land: his centre past the wall-step's near face where the climb-jump sets him down: the engine's physics (physics.ts:16-37 PHYS: jumpV
 *    640, cutV 230, gravUp 1900, gravDown 2500, airAcc 1700, maxRun 285) climbing a 60 px step from a stand 19-22 px short of its face,
 *    forward held, at the tier's mean jump hold (tools/inspect/firsttimer.ts:286 FT_KID hold 0.16 s, kept by the child: 62 px;
 *    firsttimer.ts:291 FT_ADULT 0.2 s, kept by the middle and the expert: 86 px). NOT taken: the adult's traced climb (ENG-28 REPORT, late 19
 *    seed 1: face 880, centre 946), 66 px, nearer because his steer starts a thumb-lag late; the farther landing leaves less room to run
 *    (the stricter side, the lead's pick)
 *  - pause: firsttimer.ts:3083's small-ledge pause (a ledge under 220 px), every tier; it stops him (traced 268 to 41 px/s)
 *  - runUp: each tier's take-off aim before a lip, its edgeAim (the median of its aimQ), the larger of its settings: child 73
 *    (firsttimer.ts:323; Easy 71, :330), middle 61 (Easy, :317; Normal 58, :311), expert 61 (:305), adult 22 (:292)
 *  - width: Pokey's, 44 px (engine.ts:1222)
 *  So W must be at least 86 + 61 = 147 px wide before a gap (the toy and floodLay.test's brick lay W 150 + gap 60)
 *  THE MODEL, NOT A MEASURE (the lead's ruling C, ENG-28 session 8): the bots land farther than the approved 86 (the middle at 136 past
 *  W 150's face: a 0.94 s climb, his landing steered back), yet the verdict and the bots agree on both shapes: on W 60 every tier walks off
 *  W (refused), on W 150 every tier boards P (passed). The verdict refuses 146, so at its edge it errs on the safe side. Calibrating
 *  `land` against the tier bots is a later job (ROADMAP R-165.424)
 *  CORRECTED FROM THE BOTS' FLIGHTS (BUILD-28 session 6, the lead's A4): the child's `land` is its FARTHEST measured climb, 233 px past
 *  W's face (the child-easy's double-press climb, take-off 771 at the face 790, centre down at 1023: session 5's probe; 219 in session 6's),
 *  where the derived 62 stood: the derived model passed W 150 while the child-easy flew over W and the gap onto the porch. The other tiers'
 *  measured landings are inside their derived ones (child Normal 56, middle-easy 84, middle 75, expert 75, adult 56: probe-fork-results-s6),
 *  so they keep them (the stricter side) */
export const W2_FLOOD: FloodRow = {
  close: { normal: 26, easy: 26 },
  spare: { normal: 4, easy: 8 },
  flown: { px: 2000 + 1400, tailOff: { normal: 22.0, easy: 17.9 } },
  climb: { land: { child: 233, middle: 86, expert: 86, adult: 86 }, runUp: { child: 73, middle: 61, expert: 61, adult: 22 }, pause: [0.25, 0.5], width: 44 },
  /** the line's step (W2_FOLLOW.step): off any end of the high road, ground within it (flood.ts strandFaults) */
  step: W2_FOLLOW.step,
};

/**
 * World 2's TWO-ROAD section (2-8's fork "the fork the water decides", reference/design/2-8.md beat 8; R-165.430 (2); the lead's ruled
 * shape, ENG-28 sessions 4-8, BUILD-28 1d): the low road is a MARSH marked 'close' (2-8.md:9: 1,400 px of marsh path with four 100 px dips;
 * the flood turns it deep at the close: gen2/floodLay.ts), the high road stands over it: three carved steps up, 2,200 px of porches, three
 * down (2-8.md:9). In the order he meets them:
 *   - `near`: the bank both roads start from, wide enough for the line bunched behind him (7 x W2_FOLLOW.gap = 238 px) and W on it;
 *   - `wall` W: a WALL-STEP FLOOD_STEP px tall on the near bank, `wall.back` px back from the water's edge (both roads climb it: flood.ts
 *     highRoad's first piece, its face on the bank so he walks into it), `wall.w` wide: at least the widest tier's landing + run-up
 *     (W2_FLOOD.climb: 86 + 61 = 147). Set back, its lip is a step over the BANK, not over the marsh: off W he lands on the bank (60 px),
 *     then off the bank's edge onto the marsh floor (75, W2_FORK_RIVERS), each within the line's step (strandFaults; flush on the water's edge it was one
 *     120 px drop and the line waited at W's lip: BUILD-28 1e);
 *   - the GAP after W, `gap` px (over the bank when `gap` <= `wall.back`): the low road walks off W's lip and drops through it (at least his
 *     44 px width), the high road hops it level onto the porch (at most FLOOD_HOP);
 *   - `porch` P: level with W's top, from `gap` past W's lip, out over the marsh and on over the far bank;
 *   - `rises`: each a block (a wall-step he walks into, never a bare edge hop) standing CENTRED on the piece under it (the porch, then the
 *     rise before), so the high road is W, P and the rises up, then each rise's far tread and the porch's far tread down onto the far bank:
 *     with the porch 2,200 and the rises 1,400 and 600 every tread is 400 px (BUILD-28 session 1's probe: 80 and 220 px treads stranded the
 *     Easy child and the adult; 400 px treads brought every tier home);
 *   - `far`: the far bank both roads end on: the porch overhangs the 1,400 px marsh by 800 px, so it reaches past the porch's end (the
 *     last step down lands on it: strandFaults) with today's 320 px to gather on.
 * forkFaults and strandFaults pass it on every roll (w2TwoRoad.test). Data only: the 2-8 kit lays it with its rivers holding `W2_FORK.row`
 * (W2_FORK_RIVERS).
 */
/** the two-road section's numbers (W2_FORK's shape: a builder or a plant passes its own) */
export interface W2ForkShape { row: string; near: number; far: number; wall: { w: number; h: number; back: number }; gap: number; porch: number; rises: ReadonlyArray<{ w: number; h: number }> }
export const W2_FORK: W2ForkShape = {
  /** the low road's river row (W2_FORK_RIVERS): a marsh, still, safe (a fall splashes him back on the near bank), marked 'close' */
  row: 'low',
  /** 441 = 420 + 21 (BUILD-28 session 7): W stands 21 px farther back (back 81), so 30 px of bank stay before its face */
  near: 441,
  /** the porch's 800 px over the far bank (2,200 - the marsh's 1,400) + 320 to gather on */
  far: 1120,
  /** W 330 (BUILD-28 session 6, the lead's A2): the child's farthest measured climb lands 233 px past W's face (W2_FLOOD.climb.land) and
   *  needs its 73 px run-up before the lip (forkFaults: at least 306), + a 24 px margin; 30 px of the 420 px bank stay before W's face
   *  (the climbs take off 19 px before it), so the fork's place, and the flood's flown leg, are unchanged */
  /** back 81 = the gap (BUILD-28 session 7): the gap stays over the bank, so a walk-off back off the porch's near end lands on the bank
   *  (strandFaults; with back 60 its near end stood 21 px over the marsh, a 135 px drop) */
  wall: { w: 330, h: 60, back: 81 },
  /** 81 (BUILD-28 session 7, the lead's entry principle: the RUN takes the low road, a JUMP the high road): his full-run walk-off carry
   *  off W's lip, 66 px (floodLay FLOOD_WALK_OFF, measured), + the 15 px margin; the porch from the bank's edge as before */
  gap: 81,
  porch: 2200,
  rises: [{ w: 1400, h: 60 }, { w: 600, h: 60 }],
};
/** the low road's row: a MARSH (riverLay.ts RiverRow.marsh; 2-8.md:9: 1,400 px with four 100 px dips), still water, no logs, marked for
 *  the flood as the road that turns deep. Its floor 75 px under the banks (BUILD-28 session 6, the lead's ruling (c)): the porch, a step
 *  over the banks (W2_FORK.wall.h), then stands 135 px over it, out of a single jump's reach plus its margin (floodLay FLOOD_LOW_HOP:
 *  117.8 + 15; at 60 under the banks the porch's 120 px was inside it and his dip hop put him on the high road); within the line's drop
 *  (W2_FOLLOW.step 90) */
export const W2_FORK_RIVERS = { [W2_FORK.row]: { dir: 1, speed: 0, logW: 0, logs: 0, safe: true, flood: 'close' as const, marsh: { width: 1400, floor: 75, dips: 4, dip: 100 } } } satisfies Record<string, RiverRow>;
/** the two-road section `id` for job `job` (its numbers W2_FORK's) */
export function w2TwoRoad(id: string, job: NodeJob, f: W2ForkShape = W2_FORK): SectionTemplate {
  // (a share along the near bank: `d` px past its end; W's place on it: `wall.back` px back from its end)
  const past = (d: number): R2 => [1 + d / f.near, 1 + d / f.near];
  const one = (v: number): R2 => [v, v];
  const back = (f.near - f.wall.w - f.wall.back) / (f.near - f.wall.w);
  return {
    id, name: `${id} (the two roads)`, archetypes: 'any', phases: ['ki', 'sho', 'ten', 'ketsu'], difficulty: 3, jobs: [job], content: 'water',
    pieces: [
      { key: 'near', shape: 'bank', w: one(f.near), place: { kind: 'start' }, style: 'log', main: true },
      { key: 'far', shape: 'bank', w: one(f.far), place: { kind: 'river', after: 'near', row: f.row }, style: 'log', main: true, landing: true },
      { key: 'wall', shape: 'block', w: one(f.wall.w), place: { kind: 'on', on: 'near', at: one(back), h: one(f.wall.h) }, style: 'moss_stone' },
      { key: 'porch', shape: 'branch', w: one(f.porch), place: { kind: 'over', on: 'near', at: past(f.gap - f.wall.back), dy: one(-f.wall.h) }, style: 'log', main: false },
      // (each rise centred on the piece under it: the porch, then the rise before)
      ...f.rises.map((r, i) => ({ key: `rise${i + 1}`, shape: 'block' as const, w: one(r.w), place: { kind: 'on' as const, on: i ? `rise${i}` : 'porch', at: one(0.5), h: one(r.h) }, style: 'moss_stone' as const })),
    ],
    entry: { piece: 'near', kind: 'ground' }, exit: { piece: 'far', kind: 'ground' }, exitDy: 0,
    sockets: [],
    mirrorable: false,
  };
}

/** World 2's POST art (post.ts PostArt; 2-7's doors): the PLEASE BE PATIENT door shut (w2-props) and open, a letter and a reply, two
 *  flutter frames each (ART-NEXT-b, the inventory's w2-next rows) */
export const W2_POST_ART: PostArt = {
  door: 'w2-props#door',
  open: next('doorOpen'),
  letter: [next('letter'), next('letterB')],
  reply: [next('reply'), next('replyB')],
};

/** World 2's COLUMN DRESS (columnDress.ts; 2-7's weir, reference/design/2-7.md Art (4), the D leg's dressing): the weir's stepped stone
 *  face, white water over each lip, at the foot of the column he comes down, behind its catch ledges. Its box is the catalog's
 *  on_screen_px for w2-next#weir (921x346: a tier about one Pokey, 89.1 px drawn); its foam foot sits under the floor's top, which hides it.
 *  The 2-7 builder names it in 2-7's brief (columnDress: W2_WEIR) */
export const W2_WEIR: ColumnDressSpec = { art: next('weir'), w: 921, h: 346, sink: 24 };

/**
 * World 2's pad table (ENG-22; place `pads` names a row; rideLay.ts layPads): 2-2's ponds, by its design (reference/design/2-2.md, the arc).
 * Starting rows for the 2-2 builder, each passing padFaults; the builder tunes them by data. Gaps: well under the shortest hop a player
 * makes (rideLay PAD_HOP.pad, the Pad button's 119 px; a touch flick is a full jump, 175 px) in the teach, up to a held jump's reach
 * (PAD_FAIR.reach) after.
 */
export const W2_PADS = {
  /** beat 1: one big pad over shallow water at the bank: he stands, it shivers and sinks, he splashes back and watches it come up */
  first: { by: 'weight', pads: ['big'], gap: 60, safe: true },
  /** beat 2: three small pads one tap apart, a petal riding each: keep moving */
  hop: { by: 'weight', pads: ['small', 'small', 'small'], gap: 70, safe: true, petals: [0, 1, 2] },
  /** beat 4: small pads out to a far stone and its petal (the far piece), and back over the same pads once they are up again */
  back: { by: 'weight', pads: ['small', 'small'], gap: 80, safe: true },
  /** beat 6, the twist: the pond breathes; every pad on one breath (2-2.md: up 1.8 s, shiver 0.6 s, under 0.6 s), crossed on the up, two
   *  pads at a time with a stone between (a run of pads must be crossed inside one breath: padFaults) */
  breath: { by: 'beat', pads: ['small', 'small', 'stone', 'small', 'small'], gap: 70, beat: { up: 1.8, shiver: 0.6, under: 0.6 } },
  /** beats 9 and 12: deep water, held jumps between the sizes */
  deep: { by: 'weight', pads: ['small', 'big', 'small'], gap: 120, petals: [0, 2] },
} as const satisfies Record<string, PadRow>;

/**
 * World 2's water wheels (ENG-26; place `wheel` names a row; wheelLay.ts layWheel): 2-6's norias by its design (reference/design/2-6.md,
 * "The wheel, FLOWN" and the arc), every row flown on the real engine (wheelFlights.data.ts; wheelFaults holds each to it). Buckets 120 px,
 * the jetty's and the street's lips a log's step (28 px) from the bucket floor (wheel.ts WHEEL). Easy's rim speed is the flown V50-60
 * (2-6.md: "Easy V x 0.85 (V50-60)"), V50 where Easy steps off by a walk at the sweep's edge.
 */
export const W2_WHEELS = {
  /** beat 1, the teach: the street reaches in over the top (the buckets pass behind it: he is set down on it), the pond under it */
  teach: { R: 160, V: 60, easyV: 50, N: 6, street: 'in' },
  /** beat 5: the street at the sweep's edge, a step off as the bucket comes level (a miss rides round). Easy V50 (ENG-26b): Easy's floor
   *  is the WALK-off (wheelLay.ts stepFault), flown 2.63 s a turn at V50 (2.2 s at V60) */
  edge: { R: 180, V: 70, easyV: 50, N: 6, street: 'edge' },
  /** beat 8, the twist: the street 80 px ABOVE the top bucket (Easy 60): only a jump off the top reaches it */
  top: { R: 180, V: 70, easyV: 60, N: 6, street: 'up', up: { normal: 80, easy: 60 } },
  /** beat 12, the great wheel: the last bank, the street in over the top */
  great: { R: 200, V: 70, easyV: 60, N: 6, street: 'in' },
} as const satisfies Record<string, WheelRow>;
/** the stage World 2's wheels are flown on (wheelFlights.ts flyWheel: its RealPlay, the stage's own help in the flight): 2-6, the level of
 *  the norias (reference/design/2-6.md) */
export const W2_WHEEL_STAGE = '2-6';

// ───────────────────────────── World 2's lianas (BUILD-21; as w1Swing.ts is World 1's) ─────────────────────────────
/**
 * World 2's liana row (reference/design/2-1.md beats 1 and 5: down out of the canopy on three lianas, then one over a side creek): the
 * self-swinging liana World 1 taught (1-6), laid by World 2's data. A liana hangs from a riverside tree, its anchor 400-420 px over the bank
 * it leaves (1-6.md's measured liana); each gap is World 1's (W1_LIANA_GAP: the grip dial and the share of the pipeline's perch band, never a
 * px number of the engine's), SHORT and LONG only (FAR's narrow perch is World 1's snake beat). The perch is a World 2 BANK (the earth bank,
 * its own look; never World 1's bough), level, or a step lower for a descent (`dy`: each let-go lands by a plain fall onto a wide bank, D46).
 * The gap under a liana is the world's soft fall, so w2Finish makes it a splash-back creek: a miss costs nothing. A kit that lays these adds
 * the swing move (w1Swing.ts withSwing), as World 1's 1-6 does.
 */
export const W2_LIANA = { top: [400, 420] as R2, gaps: { short: W1_LIANA_GAP.short, long: W1_LIANA_GAP.long } } as const;
export type W2LianaGap = keyof typeof W2_LIANA.gaps;
/** a liana past `after`'s end, hung from a riverside tree 400-420 px over it, its reach checked at the gap's grip */
export const w2Liana = (key: string, after: string, gap: W2LianaGap): SectionPiece => {
  const grip = (W2_LIANA.gaps[gap] as { grip?: 'low' | 'high' }).grip;
  return { key, shape: 'liana', w: [0, 0], place: { kind: 'swing', after, top: W2_LIANA.top, ...(grip ? { grip } : {}) } };
};
/** the bank a liana throws him onto, `w` wide, at the gap's share of its band, `dy` under the bank he left (a descent) or level */
export const w2Perch = (key: string, liana: string, gap: W2LianaGap, w: number, dy: R2 = [0, 0]): SectionPiece =>
  ({ key, shape: 'bank', w: [w, w], place: { kind: 'land', after: liana, dy, share: W2_LIANA.gaps[gap].share }, style: 'log', main: true, landing: true });

// (the placeholder arcs and their bricks are gone: 2-1 and 2-2 are built as designed, w2Arc21.ts and w2Arc22.ts, each with its own kit
//  over this one (BUILD-21, BUILD-22 11-15); new replaces old)

// ───────────────────────────── the manifest and the kit ─────────────────────────────

/**
 * World 2's manifest. The planner's tempo (rollRanges) is World 1's measured one until a World 2 level is flown on its own (the builder's
 * dial); World 1's floor roll, pit painter and catch boughs are its canopy's and are not World 2's. Moves: everything World 1 taught.
 */
export function w2Manifest(): WorldManifest {
  return {
    world: 2, name: 'Sunlit Riverbank',
    moves: ['double', 'climb', 'swing'],
    ground: { y: W2_GROUND.y, bankH: W2_GROUND.bankH, style: 'log' },
    pit: 'soft', pitDepth: W2_GROUND.pitDepth,
    rollRanges: W1_KIT.rollRanges,
    corridor: { top: G - 400, bottom: G + 80, soft: 60 },
    themeShare: [1, 1],
    graphs: {
      list: [],
      briefs: {},
      terrains: ['river-bank'],
      chunkSeconds: 60,
      maxPerStage: 1,
    },
    creatures: [], props: [], pairs: [], decor: [],
    flowers: ['lotus', 'hibiscus'],
    sections: [],
    handBuilt: [],
    // (2-2 rolls after 2-1: the river is 2-1's lesson; World 1's moves were all taught in World 1)
    lessons: { jump: '1-1', double: '1-1', bounce: '1-1', climb: '1-4', creak: '1-5', swing: '1-6', [W2_LESSON.river]: '2-1' },
    tips: W2_TIPS,
    required: {},
  };
}

/** World 2's kit: its manifest, no props or creatures to emit (2-1's cast is none; World 2's animals come with the stages that lay them) */
export function w2World(): WorldKit {
  return { manifest: w2Manifest(), emit: {} };
}

// ───────────────────────────── the finish: the rivers ─────────────────────────────
type FinishStage = {
  platforms: Platform[];
  rivers?: RiverZone[];
  gen2?: { falls?: Array<{ x0: number; x1: number; y: number; kind: string; site?: string }>; seed?: number; tower?: { flow?: string; legs?: ReadonlyArray<{ travel: string; x0: number; x1: number; y0: number; y1: number }> } };
  proto?: { decor?: W2Decor[] };
};

/** reeds this far from a river's edge, either bank (px; the hand-built world's 10-30), on a bank this wide or more (a stone has none) */
const REED_OFF = 20;
/** how far under a fall's height (its higher lip) the other lip may stand and still be its bank (px): a liana perch's highest rise over
 *  the bank it leaves (pipeline place 'land': raised up to 160), and some */
export const LIP_RISE = 170;
const REED_BANK = 200;
/** a piece under this deep is a plank, not a bank (a bank of earth is 90 or more: w1Pits.ts paintedBank) */
const THIN = 90;

/**
 * World 2's finish (listed.ts BASE 'w2', run where World 1's runs w1Finish): every fall of the built stage becomes its river between the
 * two banks (RiverZone, x0 the near bank's end, x1 the far bank's start, the surface `surfaceBelowBank` under the banks' lower top): a
 * deep (water) fall a river that costs a life; a soft fall a SPLASH-BACK river (`safe`: set back on the near bank, 70 px from the edge,
 * as the hand-built 2-1's), its soft pit's bed and steps taken out (the splash sets him back before he reaches them; a bank standing in
 * the water would be drawn over it). Reeds stand behind him at each river's edge on a bank (riverArt.ts reeds; none on a stepping stone). A fall with no bank at each end throws: such
 * a roll is never listed. Calling it twice changes nothing.
 */
export function w2Finish<T extends FinishStage>(st: T, _difficulty?: Difficulty): T {
  const falls = st.gen2?.falls;
  if (!falls) return st;
  const solids = st.platforms.filter((p) => p.type === 'solid');
  // (a fall that already has its river (the log rivers gen2 laid, place `river`; or one this finish made before) is left as it is: so a
  //  stage of log rivers keeps them, and calling it twice changes nothing)
  const had = st.rivers ?? [];
  const rivers: RiverZone[] = [...had];
  const decor = ((st.proto ??= {}).decor ??= []);
  const drop = new Set<number>();
  const kinds = ['reedTall', 'reedShort', 'reedLean'] as const;
  const reeds = (near: Platform, far: Platform, x0: number, x1: number) => {
    for (const [x, b, bank] of [[x0 - REED_OFF, near.y + 6, near], [x1 + REED_OFF, far.y + 6, far]] as const) {
      // (behind him, never in front: a reed in front hid him on the bank's edge, ENG-W2's sideways still; and only on a real bank, never a
      //  stepping stone, whose two edges a reed each crowded; never twice at one edge)
      if (bank.width < REED_BANK || decor.some((d) => d.x === x && (kinds as readonly (string | undefined)[]).includes(d.n))) continue;
      const n = kinds[Math.floor(hash01(x, 41) * kinds.length)];
      decor.push({ n, x, b, w: n === 'reedTall' ? 64 : n === 'reedShort' ? 90 : 70, ...(hash01(x, 43) < 0.5 ? { flip: true } : {}) });
    }
  };
  // (the banks at each end of a fall or a river: a solid ending at x0 and one starting at x1, at its lips, the topmost of each ON THE
  //  FALL'S OWN STOREY: from its height `y` (the higher lip) down to LIP_RISE under it. A liana's perch is laid up to 160 px over the bank
  //  it leaves (pipeline place 'land'), so the gap under a World 2 liana has its take-off bank that far below the perch, BUILD-21's 2-1.
  //  Never a solid over the fall's height: on a tower's stacked legs another leg's ground can end or start at the same x, and taken as
  //  the bank its splash set him on that leg (ENG-27e: the home toy's Easy seed 2 put him back on the out leg, 790 px up, mid-race; and
  //  ENG-GROUND-b, the toy's race leg: an upper leg's piece 600 over the fall had its edge within 2 of a plank's and was taken for its bank))
  const lip = (p: Platform, y: number) => p.y >= y - 2 && p.y <= y + LIP_RISE;
  const banks = (x0: number, x1: number, y: number) => ({
    near: solids.filter((p) => Math.abs(p.x + p.width - x0) <= 2 && lip(p, y)).sort((a, b) => a.y - b.y)[0],
    far: solids.filter((p) => Math.abs(p.x - x1) <= 2 && lip(p, y)).sort((a, b) => a.y - b.y)[0],
  });
  // (is the fall at x0-x1, lip y, on a leg laid LEFT? The run leg whose span holds it and whose heights lie nearest, gen2 tower.legs)
  const runs = st.gen2?.tower?.flow === 'legs' ? (st.gen2.tower.legs ?? []).filter((g) => g.travel === 'left' || g.travel === 'right') : [];
  const leftward = (x0: number, x1: number, y: number): boolean => {
    let on: { travel: string; d: number } | undefined;
    for (const g of runs) {
      if (x0 < g.x0 - 1 || x1 > g.x1 + 1) continue;
      const d = Math.max(0, g.y0 - y, y - g.y1);
      if (!on || d < on.d) on = { travel: g.travel, d };
    }
    return on?.travel === 'left';
  };
  // (a log river's reeds, as a fall's)
  for (const r of had) {
    if (r.speed === 0) continue;
    const { near, far } = banks(r.x0, r.x1, r.surfaceY - surfaceBelowBank);
    if (near && far) reeds(near, far, r.x0, r.x1);
  }
  const sorted = [...falls].sort((a, b) => a.x0 - b.x0);
  // (a floor of a run leg laid under another (gen2 legs.ts stackedUnder), its top in that leg's band, under the whole of x0..x1)
  const lows = stackedUnder(st.gen2?.tower?.legs);
  const overLowFloor = (x0: number, x1: number) => lows.some((l) => solids.some((p) => p.y >= l.y0 - 2 && p.y <= l.y1 + 2 && p.x <= x0 + 1 && p.x + p.width >= x1 - 1));
  // (a fall has its river when one spans it AT ITS HEIGHT, its surface just under the fall's lip: where one leg runs under another, the
  //  upper leg's log river spans the lower leg's falls in x, and they were left with no water at all, ENG-GROUND-b, the toy's race leg)
  // (a fall over a water wheel's sweep (place `wheel`, wheelLay.ts layWheel) has its river already: the wheel's own pond, still water
  //  under the whole sweep, laid with the wheel and held to the flight by wheelFaults. The fall runs from the jetty's lip to the sweep's
  //  far end at the street's height; the street stands over the jetty and reaches in over the top by design, so the fall has no bank at
  //  that end and its pond lies a wheel's height under its lip, not at it (ENG-W2FIN, R-165.431: the rule above threw on every wheel).
  //  The wheel is known by its OWN jetty's lip at the fall's end and its OWN street at the fall's height, and the pond by its surface under
  //  that wheel (wheel.ts WHEEL.pond), so another storey's fall over the pond in x is still held to its own height and its own banks)
  const byId = new Map(st.platforms.map((p) => [p.id, p] as const));
  const wheels = [...new Set(st.platforms.flatMap((p) => (p.wheel ? [p.wheel.w] : [])))];
  const wheelPond = (f: (typeof sorted)[number]) => wheels.some((w) => {
    const jetty = w.lay && byId.get(w.lay.jetty), street = w.lay && byId.get(w.lay.streetId);
    if (!jetty || !street || Math.abs(street.y - f.y) > 2) return false;
    if (w.way > 0 ? Math.abs(jetty.x + jetty.width - f.x0) > 2 : Math.abs(jetty.x - f.x1) > 2) return false;
    return had.some((r) => r.wheelPond && Math.abs(r.surfaceY - (w.cy + w.R + WHEEL.pond)) <= 2 && r.x0 <= f.x0 + 1 && r.x1 >= f.x1 - 1);
  });
  const hasRiver = (f: (typeof sorted)[number]) => wheelPond(f) || had.some((r) => r.x0 < f.x1 - 1 && r.x1 > f.x0 + 1 && r.surfaceY >= f.y - 20 && r.surfaceY <= f.y + surfaceBelowBank + LIP_RISE + 20);
  const water = (f: (typeof sorted)[number]) => (f.kind === 'water' || f.kind === 'soft') && !hasRiver(f);
  const taken = new Set<(typeof sorted)[number]>();
  for (const f of sorted) {
    if (!water(f) || taken.has(f)) continue;
    const { near, far: far0 } = banks(f.x0, f.x1, f.y);
    if (!near || !far0) throw new Error(`World 2 finish: the fall at x=${f.x0}-${f.x1} has no bank at one end`);
    // (a run of falls joined by planks, thin pieces over the water between them, is ONE river under a bridge, bank to bank: laid pocket
    //  by pocket, its water showed in slices between the planks with the backdrop under each plank, and a pocket between two planks
    //  stood 20 higher than its neighbours (its lip the planks'): ENG-GROUND-b, the out-and-back toy's join. Each plank stands at or
    //  over the run's banks' lower top and its foot over the water. The next fall is the one that starts at the plank's end (another
    //  leg's falls lie between them in x). No shipped stage lays one: tools/engine/plankscan.ts)
    let far = far0, x1 = f.x1;
    const run: Platform[] = [], joined: Array<(typeof sorted)[number]> = [];
    while (far.height < THIN) {
      const end = far.x + far.width;
      const g = sorted.find((o) => o !== f && !taken.has(o) && !joined.includes(o) && o.kind === f.kind && water(o) && Math.abs(o.x0 - end) <= 2 && Math.abs(o.y - f.y) <= LIP_RISE);
      const next = g && banks(g.x0, g.x1, g.y).far;
      if (!g || !next) break;
      run.push(far);
      joined.push(g);
      far = next;
      x1 = g.x1;
    }
    let top = Math.max(near.y, far.y);
    if (run.length && (near.height < THIN || far.height < THIN || run.some((p) => p.y > top || p.y + p.height > top + surfaceBelowBank - 8))) {
      // (not a bridge between two banks: the fall alone, as before)
      far = far0;
      x1 = f.x1;
      run.length = 0;
      joined.length = 0;
      top = Math.max(near.y, far.y);
    }
    for (const g of joined) taken.add(g);
    const x0 = f.x0;
    const safe = f.kind === 'soft';
    // (the lead's ruling (B), ENG-GROUND-d: on a stage that lays a run leg under another, a soft gap between two thin pieces over that
    //  leg's floor is left open. Filled, its water stood under the next stair down, out of his reach, and ran its paint to the view's foot
    //  as a column over the floor he walks (2-7's toy, the descent); lidded at its bed it hung as a box of water between the planks. Only
    //  where every drop through it (either lip and its middle) lands on wood within the live fall rule going down (tower.ts towerFalls:
    //  TOWER.see) and in no water; else it keeps its water as before)
    if (safe && near.height < THIN && far.height < THIN && overLowFloor(x0, x1) && [x0 + 8, (x0 + x1) / 2, x1 - 8].every((x) => {
      const land = catchUnder(st.platforms, x, f.y, TOWER.see);
      return land !== undefined && !rivers.some((r) => x >= r.x0 && x <= r.x1 && r.surfaceY > f.y && r.surfaceY < land);
    })) continue;
    // (its bed: the solids under its water. Never a floor of a run leg laid UNDER the fall's own leg (stackedUnder, the band overLowFloor
    //  reads): that is the low leg's ground, not this fall's bed. 2-7's out-leg soft pits lie over its home leg and deleted its banks there,
    //  BUILD-27's trace, ENG-JETTY. A fall ON the low leg (its lip in the band) drops its own bed as before)
    const under = lows.filter((l) => f.y < l.y0 - 2);
    if (safe) for (const p of solids) if (p !== near && p !== far && !run.includes(p) && p.x >= x0 - 1 && p.x + p.width <= x1 + 1 && p.y > top && !under.some((l) => p.y >= l.y0 - 2 && p.y <= l.y1 + 2)) drop.add(p.id);
    // (a splash sets him back on the bank he came from: on a leg laid LEFT (gen2 legs.ts) that is the right one, ENG-27: the toy's home leg
    // set him on the far bank, ahead, and he turned back)
    const back = leftward(x0, x1, f.y);
    rivers.push({ x0, x1, surfaceY: top + surfaceBelowBank, dir: 1, speed: 0, ...(safe ? { safe: back ? { backX: x1 + 70, backY: far.y } : { backX: x0 - 70, backY: near.y } } : {}) });
    reeds(near, far, x0, x1);
  }
  if (drop.size) st.platforms = st.platforms.filter((p) => !drop.has(p.id));
  st.rivers = rivers.sort((a, b) => a.x0 - b.x0);
  return st;
}

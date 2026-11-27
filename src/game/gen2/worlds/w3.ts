/**
 * gen2/worlds/w3 — World 3, the Mossy Grotto, for the new generator (ENG-W3a, 11-23; WORLD-3-PLAN F1): the world's kit every World 3
 * level is rolled from (stageTable.ts kit 'w3', listed.ts KITS), its look by world data, its cast rows and the placeholder way DOWN its
 * first stage is drafted on. WORLD DATA (generalitycheck EXEMPT): every fact here is World 3's; the code that reads it names no stage.
 *
 * THE WORLD'S RULE (WORLD-3-PLAN §1, GAME-MAP §4): the grotto goes DOWN. Its first stage travels down (its draft row's `travel`), laid
 * storey under storey by gen2's one lay (pipeline.ts layStage, tower.ts): every drop's landing in view before he commits (tower.ts
 * towerFalls, TOWER.see; D46: no blind fall), the lay's vine climbed down where a storey turns. Its falls are soft (a miss costs a storey, never
 * a life). The dark, the glowworms that wake below, the spore puffs are World 3's pieces (ENG-DARK, ENG-SPORE); a node code asks them by
 * W3_HAZARDS (below).
 *
 * THE ART (the inventory, src/game/art/inventory/w3.json, reference/art/CATALOG-MASTER.csv): every piece the kit lays is drawn by World
 * 3's painted kit (src/assets/kits/w3.webp: the bank's top strip, fill and end; the branch shelf; the boulder), as the engine draws them
 * for world 3 (terrain.ts footingsFor). W3_ART names the inventory rows; w3.test.ts holds every one in the World 3 inventory, usable,
 * in game and inside its scale against Pokey (89.1 px, R-165.107), and every rolled piece drawn by World 3's own art.
 *   - a ledge: World 3's stone bank (its top strip on the ledge's top, its soil fill under it), 320-420 px: 3.6-4.7 Pokeys to land on;
 *   - a shelf: World 3's branch shelf, 200-300 px (2.2-3.4 Pokeys), the plan's S/M shelves (WORLD-3-PLAN §3 batch 1: 120/200/320) until
 *     the painted stone shelves land (W3-ART-1: w3-new#shelf-long/short are packed, never loaded);
 *   - a drop: 110-150 px, under two of his heights (a fall of 200 px or less makes no noise, heroNoise.ts), the next shelf 8-20 px past
 *     the end: he steps off and lands.
 *
 * THE CAST (predators/world3.ts, the kit's creature rows: castPlay.ts runs a kind a brief names in `cast`): the OCELOT, the prowler,
 * and the JAGUAR, which waits above. Their bodies are the ones Worlds 6-8 lay (w6.ts:114-115). Rows only: the draft's way down casts
 * none (castRows: a brief that names no cast lays from the whole list, so no brick of the way down has an animal socket).
 */
import { G } from '../../protoStage.ts';
import { DARK_EMIT, DARK_GLOW_PROPS, darkEnds } from '../dark.ts';
import type { HazardDef, HazardLay } from '../nodeAsks.ts';
import type { CreatureDef, NodeJob, SectionPiece, SectionTemplate, Socket, WorldKit, WorldManifest } from '../types.ts';
import { W1_KIT } from './w1.ts';

/** World 3's ground: the floor line (the bottom of the way down), a ledge's depth and how deep a soft fall's bed lies */
export const W3_GROUND = { y: G, bankH: 90, pitDepth: 130 } as const;

/**
 * The inventory rows World 3's pieces are drawn as (src/game/art/inventory/w3.json; the engine's World 3 kit painter draws them for
 * world 3): by the piece's job. w3.test.ts holds each row in the World 3 file, usable, in game and in scale.
 */
export const W3_ART = {
  /** a stone ledge: its top strip, its soil fill, its end face (w3.webp kit frames) */
  bank: ['w3#bank', 'w3#fill', 'w3#bankEnd', 'w3#fill0', 'w3#fill1', 'w3#fill2', 'w3#fill3'],
  /** a shelf he drops onto: the kit's branch / plank (w3.webp) */
  shelf: ['w3#branch'],
  /** a rock: the kit's low boulder (w3.webp) */
  rock: ['w3#boulder'],
  /** a bounce: World 3's own cap on its stalk (bounceArt.ts, cap-w3 / stalk-w3) */
  bounce: ['bounce#cap-w3', 'bounce#stalk-w3'],
  /** the grotto's lamps and ferns at a ledge (w3-props.webp) */
  glow: ['w3-props#glowLit', 'w3-props#mushrooms'],
  fern: ['w3-props#fern', 'w3-props#mossCurtain'],
} as const;

/** the lessons World 3's way down teaches (a section's `teaches`): going down a vine */
export const W3_LESSON = { down: 'down' } as const;

/**
 * Dot's words in World 3's kit: the story keeper's only (level.md rule 17). None yet: the keeper writes 3-1's lines with its build; a
 * brick that teaches carries no tip until then (the tip socket is the build's).
 */
export const W3_TIPS: Record<string, string> = {};

/**
 * World 3's cast rows (predators/world3.ts OCELOT and JAGUAR, run by the creature kit when a brief casts them): bodies as Worlds 6-8 lay
 * them (w6.ts:114-115). The first a lesson meets is the build's (level.md rule 7); nothing here is a stage's.
 */
export const W3_CAST: readonly CreatureDef[] = [
  { id: 'ocelot', enemy: 'ocelot', threat: 3, terrain: 'flat', minGround: 220, w: 48, h: 28, hp: 2, footY: 18, tags: ['cast', 'topup'] },
  { id: 'jaguar', enemy: 'jaguar', threat: 5, terrain: 'flat', minGround: 300, w: 64, h: 38, hp: 3, footY: 24, tags: ['cast'] },
];

// ───────────────────────────── the way down (the draft's placeholder bricks) ─────────────────────────────
// (3-1's build designs its arc on its own kit over this one, as 2-1's did over World 2's; until then the draft row rolls these: a ledge,
//  drops, a walk along a shelf; where a storey turns, the lay's own vine takes him down. No socket here lays an animal or a tip)

/** the arrival, a rest, the goal: a stone ledge with a flag (at the bottom of the way down it is the grotto floor) */
export const w3Ledge: SectionTemplate = {
  id: 'w3-ledge',
  name: 'ledge',
  archetypes: 'any',
  phases: ['start', 'rest', 'goal'],
  difficulty: 1,
  pieces: [{ key: 'ledge', shape: 'bank', w: [320, 420], place: { kind: 'start' } }],
  entry: { piece: 'ledge', kind: 'ground' },
  exit: { piece: 'ledge', kind: 'ground' },
  exitDy: 0,
  sockets: [
    { id: 'petals', role: 'pickup', on: 'ledge', t: [0.3, 0.6], dn: 34, count: 3, span: 160, allow: ['pickups'] },
    { id: 'flag', role: 'flag', on: 'ledge', t: 0.75 },
  ],
  mirrorable: false,
};

/** two drops down onto shelves: he steps off the end and lands on the next, 8-20 px across (a walk-off lands; a soft drop, 3-1's idea) */
export const w3Drops: SectionTemplate = {
  id: 'w3-drops',
  name: 'drops down',
  archetypes: 'any',
  phases: ['ki', 'sho', 'ten', 'ketsu'],
  difficulty: 3,
  pieces: [
    { key: 'a', shape: 'branch', w: [200, 260], place: { kind: 'start' } },
    { key: 'b', shape: 'branch', w: [200, 250], place: { kind: 'jump', after: 'a', dy: [110, 150], gapPx: [8, 20] }, landing: true },
    { key: 'c', shape: 'branch', w: [200, 260], place: { kind: 'jump', after: 'b', dy: [110, 150], gapPx: [8, 20] }, landing: true },
  ],
  entry: { piece: 'a', kind: 'ledge' },
  exit: { piece: 'c', kind: 'ledge' },
  exitDy: 260,
  // (in the dark: a glowworm over every landing, asleep until he stops at a rim; gen2/dark.ts, ENG-DARK)
  sockets: [...darkEnds('a', 'c', 'glow'), { id: 'petal', role: 'pickup', on: 'b', t: 0.5, dn: 34 }, { id: 'flag', role: 'flag', on: 'c', t: 0.6 }],
  mirrorable: false,
};

/** a walk along a shelf and a hop to the next, level */
export const w3Walk: SectionTemplate = {
  id: 'w3-walk',
  name: 'shelf walk',
  archetypes: 'any',
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 2,
  pieces: [
    { key: 'near', shape: 'branch', w: [200, 240], place: { kind: 'start' } },
    { key: 'far', shape: 'branch', w: [300, 380], place: { kind: 'jump', after: 'near', dy: 0, share: [0.45, 0.7] }, landing: true },
  ],
  entry: { piece: 'near', kind: 'ledge' },
  exit: { piece: 'far', kind: 'ledge' },
  exitDy: 0,
  sockets: [{ id: 'petals', role: 'pickup', on: 'far', t: 0.4, dn: 34, count: 2, span: 90 }, { id: 'flag', role: 'flag', on: 'far', t: 0.75 }],
  mirrorable: false,
};

/** the way down's bricks, in the order a pool reads them */
export const W3_DOWN: readonly SectionTemplate[] = [w3Ledge, w3Drops, w3Walk];

// ───────────────────────────── the DOWN tower's climb and bounce bricks (KIT-W3a, R-165.504) ─────────────────────────────
// (AUDIT-W3 finding 3: a down tower's storeys are 1140 px (tower.ts TOWER.width less two walls) and no World 1-2 climb or bounce section
//  fits; with only ground and floating bricks a down stage's code cannot meet V11 (3 of a letter at most), so World 3 lays its own. Each
//  is narrower than a storey at its widest roll, so the tower lays it whole; each is World 3's art only: the stone bank and branch shelf
//  (w3.webp), World 3's own bounce cap on its stalk (bounce#cap-w3, bounceArt.ts), the tower's own climbing vine (the one every turn of
//  the way down hangs). No tip, no animal: a level's are its build's. LIT, no dark ends: the trimmed codes ask #dark on every beat but
//  their c and b (AUDIT-W3 codes-trim.txt 3-1, 3-5), the breath between dark beats; and a flag never stands in a dark zone (pipeline
//  flagInZone), so a dark climb beside dark drops left the 3-1 draft 4,803-4,991 px of way unflagged on 3 of 12 rolls)

/** the jobs a down tower's climb serves (a descent's beat, and the arc's middle); a bounce's (the arc's beats that use one) */
const W3_CLIMB_JOBS: NodeJob[] = ['descent', 'practise', 'test', 'twist', 'flow'];
// (a bounce serves a descent too: a letterless D_ takes any content, and the deal may type it a bounce; the lead's ruling, KIT-W3a box 4)
const W3_BOUNCE_JOBS: NodeJob[] = ['descent', 'practise', 'test', 'combine', 'twist', 'flow'];
/** the jobs a down tower's floating brick serves: the arc's middle, and the signature's way down (3-1's trimmed code: 'Sf1_<') */
const W3_FLOAT_JOBS: NodeJob[] = ['practise', 'test', 'twist', 'flow', 'signature'];

/** [c] down the root: a vine climbed down to the shelf under the tip of the one he leaves, 235 px (2.6 of his heights). The foot is laid
 *  by `walk` (its drop is never scaled by the roll's tempo, as a jump's is, so the vine's top stays at the shelf's height), starting at the
 *  tip; the vine stands 31-33 px out on it (past CLIMB_CLEAR, inside the vault's VAULT_GAP: straight up lands him on the shelf). 235, not
 *  more: a tower catch over the next storey stands up to 287 px above its own landing (the 3-1 draft's easy rolls, 260 left 324 px, past
 *  TOWER.see) */
export const w3RootDown: SectionTemplate = {
  id: 'w3-root-down',
  name: 'down the root',
  archetypes: 'any',
  phases: ['ki', 'sho', 'ten', 'ketsu'],
  difficulty: 2,
  content: 'climb',
  jobs: W3_CLIMB_JOBS,
  pieces: [
    { key: 'top', shape: 'branch', w: [240, 300], place: { kind: 'start' } },
    { key: 'foot', shape: 'branch', w: [280, 300], place: { kind: 'walk', after: 'top', dy: [235, 235] }, landing: true },
    { key: 'vine', shape: 'vine', w: 0, place: { kind: 'climb', on: 'foot', at: 0.11, h: 235 } },
  ],
  entry: { piece: 'top', kind: 'ledge' },
  exit: { piece: 'foot', kind: 'ledge' },
  exitDy: 235,
  sockets: [{ id: 'petals', role: 'pickup', on: 'foot', t: 0.6, dn: 34, count: 2, span: 90 }, { id: 'flag', role: 'flag', on: 'foot', t: 0.8 }],
  mirrorable: false,
};

/** [c] two roots down: a vine down to a middle shelf, a walk along it, a second vine down to the foot (each 235 px, laid as w3RootDown's) */
export const w3TwoRoots: SectionTemplate = {
  id: 'w3-two-roots',
  name: 'two roots down',
  archetypes: 'any',
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 3,
  content: 'climb',
  jobs: W3_CLIMB_JOBS,
  pieces: [
    { key: 'top', shape: 'branch', w: [220, 260], place: { kind: 'start' } },
    { key: 'mid', shape: 'branch', w: [280, 300], place: { kind: 'walk', after: 'top', dy: [235, 235] }, landing: true },
    { key: 'v1', shape: 'vine', w: 0, place: { kind: 'climb', on: 'mid', at: 0.11, h: 235 } },
    { key: 'foot', shape: 'branch', w: [280, 300], place: { kind: 'walk', after: 'mid', dy: [235, 235] }, landing: true },
    { key: 'v2', shape: 'vine', w: 0, place: { kind: 'climb', on: 'foot', at: 0.11, h: 235 } },
  ],
  entry: { piece: 'top', kind: 'ledge' },
  exit: { piece: 'foot', kind: 'ledge' },
  exitDy: 470,
  sockets: [{ id: 'petal', role: 'pickup', on: 'mid', t: 0.6, dn: 34 }, { id: 'petals', role: 'pickup', on: 'foot', t: 0.6, dn: 34, count: 2, span: 90 }, { id: 'flag', role: 'flag', on: 'foot', t: 0.8 }],
  mirrorable: false,
};

/** World 3's bounce cap standing on `on` (bounceArt.ts draws World 3's own cap and stalk): 30 px over the bank, the bounce height every
 *  world's bots and players know (2-1's spring, World 1's mushroom) */
const w3Cap = (key: string, on: string, at: number): SectionPiece => ({ key, shape: 'bouncy', w: [70, 70], place: { kind: 'on', on, at: [at, at], h: [30, 30] } });
/** a stone bank 174-180 px over `after`, reached from the cap `from` alone (a plain bounce lands it, past one jump: 2-1's high bank band,
 *  reach.ts 'bounce-teach'; never the bounce + air jump combo no stage teaches, FIX-21) */
const w3BounceLip = (key: string, after: string, from: string, w: [number, number]): SectionPiece => ({ key, shape: 'branch', w, place: { kind: 'walk', after, dy: [-180, -174] }, main: true, landing: true, block: 'bounce', from });

/** [b] down to the cap, up onto the lip: a drop to a stone ledge with World 3's cap at its end, the bounce up a stone lip, a drop on. NOTHING
 *  rises over the shelf he enters on: a down tower hangs the catch for the turn above in the band over a section's entry, and a lip that
 *  rose 180 px over it was laid level with that catch, so the turn's vine stopped on it short of his storey (the 3-1 draft, 9 of 12 rolls:
 *  "a catch passes its storey"). Every drop is a `walk` (never scaled by the roll's tempo): 250 px down, in view (TOWER.see 300). The
 *  ledge is 290-310 px, so the lip (70-76 px under the entry) lies past a double from the entry shelf (a double flick from 70 px
 *  reaches 283-287 px, reach.ts; 240-260 rolled clean but let him double onto the lip and skip the bounce, box 2): the bounce is the way; the last
 *  shelf is wide (260-280), as the root bricks' feet are: a narrow exit before a turn left the tower's catch no fair height */
export const w3CapDown: SectionTemplate = {
  id: 'w3-cap-down',
  name: 'down to the cap, up onto the lip',
  archetypes: 'any',
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 3,
  content: 'bounce',
  jobs: W3_BOUNCE_JOBS,
  pieces: [
    { key: 'a', shape: 'branch', w: [120, 130], place: { kind: 'start' } },
    { key: 'b', shape: 'branch', w: [290, 310], place: { kind: 'walk', after: 'a', dy: [250, 250] }, landing: true },
    w3Cap('m', 'b', 0.74),
    w3BounceLip('w', 'b', 'm', [140, 160]),
    { key: 'c', shape: 'branch', w: [260, 280], place: { kind: 'walk', after: 'w', dy: [150, 150] }, landing: true },
  ],
  entry: { piece: 'a', kind: 'ledge' },
  exit: { piece: 'c', kind: 'ledge' },
  exitDy: 224,
  sockets: [{ id: 'petal', role: 'pickup', on: 'b', t: 0.35, dn: 34 }, { id: 'petals', role: 'pickup', on: 'w', t: 0.5, dn: 34, count: 2, span: 90 }, { id: 'flag', role: 'flag', on: 'c', t: 0.6 }],
  mirrorable: false,
};

/** [b] steps down to the cap, up onto the lip: two short drops to a stone shelf with the cap at its end, the bounce up a shelf 64-72 px
 *  under the entry and 360-400 px out from it (past a double; nothing rises over the entry), a drop on (as w3CapDown's) */
export const w3CapSteps: SectionTemplate = {
  id: 'w3-cap-steps',
  name: 'steps down to the cap, up onto the lip',
  archetypes: 'any',
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 3,
  content: 'bounce',
  jobs: W3_BOUNCE_JOBS,
  pieces: [
    { key: 'a', shape: 'branch', w: [120, 130], place: { kind: 'start' } },
    { key: 's', shape: 'branch', w: [120, 130], place: { kind: 'walk', after: 'a', dy: [120, 120] }, landing: true },
    { key: 'b', shape: 'branch', w: [210, 220], place: { kind: 'walk', after: 's', dy: [126, 130] }, landing: true },
    w3Cap('m', 'b', 0.74),
    w3BounceLip('w', 'b', 'm', [120, 130]),
    { key: 'c', shape: 'branch', w: [210, 224], place: { kind: 'walk', after: 'w', dy: [150, 150] }, landing: true },
  ],
  entry: { piece: 'a', kind: 'ledge' },
  exit: { piece: 'c', kind: 'ledge' },
  exitDy: 220,
  sockets: [{ id: 'petal', role: 'pickup', on: 's', t: 0.5, dn: 34 }, { id: 'petals', role: 'pickup', on: 'w', t: 0.45, dn: 34, count: 2, span: 90 }, { id: 'flag', role: 'flag', on: 'c', t: 0.6 }],
  mirrorable: false,
};

/** [f] hops down the shelves: four of World 3's branch shelves in the air, each a plain jump (80-89 px across, under a single's 128-137
 *  from 70 px, reach.ts) and 60-80 px down from the last; never a double, never a walk-off (each lands past the last's end). 1025 px
 *  declared at its widest Easy roll (W3_TOWER_WIDEST below). The middle shelves 136-140 px (1.5 Pokeys), the last wide (190-200) as every
 *  exit before a turn; none 180 px, a tower catch bough's width */
export const w3ShelfHops: SectionTemplate = {
  id: 'w3-shelf-hops',
  name: 'hops down the shelves',
  archetypes: 'any',
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 3,
  content: 'floating',
  jobs: W3_FLOAT_JOBS,
  pieces: [
    { key: 'a', shape: 'branch', w: [124, 134], place: { kind: 'start' } },
    { key: 'b', shape: 'branch', w: [136, 140], place: { kind: 'jump', after: 'a', dy: [60, 80], gapPx: [80, 89] }, landing: true },
    { key: 'c', shape: 'branch', w: [136, 140], place: { kind: 'jump', after: 'b', dy: [60, 80], gapPx: [80, 89] }, landing: true },
    { key: 'd', shape: 'branch', w: [190, 200], place: { kind: 'jump', after: 'c', dy: [60, 80], gapPx: [80, 89] }, landing: true },
  ],
  entry: { piece: 'a', kind: 'ledge' },
  exit: { piece: 'd', kind: 'ledge' },
  exitDy: 210,
  sockets: [{ id: 'petal', role: 'pickup', on: 'b', t: 0.5, dn: 34 }, { id: 'petal2', role: 'pickup', on: 'c', t: 0.5, dn: 34 }, { id: 'flag', role: 'flag', on: 'd', t: 0.6 }],
  mirrorable: false,
};

/** the down tower's bricks (a pool reads them after the way down's): two climb shapes (root-down, two-roots), two bounce shapes (cap-down,
 *  cap-steps; cap-steps came back from parking when ENG-CATCH, R-165.526, fixed the tower's catch faults) and one floating (shelf-hops) */
export const W3_DOWN_TOWER: readonly SectionTemplate[] = [w3RootDown, w3TwoRoots, w3CapDown, w3CapSteps, w3ShelfHops];
/** the widest a down tower brick may DECLARE (KIT-W3a box 5, the lead's rule): at least 10% under a storey (TOWER.width less two walls,
 *  1140). Declared = its widest widths and gaps plus Easy's landing pad on every landing piece (layLocal: EASY_LANDING, 48 px each; the
 *  "about 11% wide" a brick lays is that pad: cap-steps at 960 px of widths laid 1142 and threw). w3Tower.test refuses a brick past it */
export const W3_TOWER_WIDEST = 0.9;

// ───────────────────────────── the level bricks (KIT-W3b, R-165.505) ─────────────────────────────
// (World 3's LEVEL stages, the ones that go along and not down: the bricks a level code's nodes ask for, each World 3's own. A level stage
//  cannot borrow World 1-2's sections: they ask for the double, carry World 1's tips and leave 6-11 s quiet lines (AUDIT-W3 finding 4))

/** the World 3 stages laid ALONG (not a tower): a level brick is in their pools and no other (its `feel`), so the towers' rolls never move */
export const W3_LEVEL_STAGES = ['3-2', '3-3', '3-6', '3-7', '3-8', '3-9'] as const;

/** the node jobs a level brick with an animal serves: never a teach (the first of a kind is the build's, level.md rule 7) */
const PROWL_JOBS: NodeJob[] = ['practise', 'test', 'combine', 'twist', 'signature'];

/** the ocelot's floor (px): past its minGround (W3_CAST 220) and its sight ahead (240), so it prowls the floor and he stands still on it */
const PROWL_FLOOR: [number, number] = [540, 620];

/** an ocelot socket: World 3's prowler and nothing else (the jaguar waits above, threat 5), softened on Easy */
const ocelotAt = (id: string, on: string, t: [number, number]): Socket => ({ id, role: 'enemy', on, t, dn: 0, allow: ['ocelot'], maxThreat: 3, easy: 'soften' });

/**
 * THE OCELOT'S GROUND (3-2's and 3-3's ocelot beats on a ground node, AUDIT-W3 'ocelot sockets laid 0'): a stone bank, a step down onto
 * the long stone floor the ocelot prowls, a step back up. He walks in, sees it, and stands still until it loses him (OCELOT beatenBy
 * still) or slips past while its back is turned. Plain steps only (56 px, under a single's reach): nothing asks for the double.
 */
export const w3ProwlFloor: SectionTemplate = {
  id: 'w3-prowl-floor',
  name: "the ocelot's floor",
  feel: W3_LEVEL_STAGES, archetypes: 'any',
  phases: ['ki', 'sho', 'ten', 'ketsu'],
  difficulty: 3, needs: ['jump'], jobs: PROWL_JOBS, content: 'ground', maxPerStage: 4,
  pieces: [
    { key: 'in', shape: 'bank', w: [300, 340], place: { kind: 'start' } },
    { key: 'floor', shape: 'bank', w: PROWL_FLOOR, place: { kind: 'walk', after: 'in', dy: [50, 56] } },
    { key: 'out', shape: 'bank', w: [280, 320], place: { kind: 'walk', after: 'floor', dy: [-56, -50] } },
  ],
  entry: { piece: 'in', kind: 'ground' },
  exit: { piece: 'out', kind: 'ground' },
  exitDy: 0,
  sockets: [
    { id: 'petals', role: 'pickup', on: 'in', t: [0.3, 0.5], dn: 34, count: 2, span: 90, allow: ['pickups'] },
    ocelotAt('ocelot', 'floor', [0.4, 0.5]),
    { id: 'petal', role: 'pickup', on: 'out', t: 0.35, dn: 34 },
    // (a flag that falls in the brick stands on its exit bank, never on a floor: a safe spot within SAFE_APPROACH, levelCheck.ts,
    //  takes an ocelot's patch away, pipeline.ts patchFor)
    { id: 'flag', role: 'flag', on: 'out', t: 0.7 },
  ],
  mirrorable: false,
};

/**
 * THE TWO FLOORS (an ocelot beat that asks two or more, 3-2's C and 3-3's C: '&ocelot*2'): two stone floors, a step up between them, an
 * ocelot's socket on each (the node's ask fills them up to its count, nodeAsks.ts 'threat'). The step is the stand-still spot: one floor
 * at a time.
 */
export const w3ProwlPair: SectionTemplate = {
  id: 'w3-prowl-pair',
  name: 'two ocelot floors',
  feel: W3_LEVEL_STAGES, archetypes: 'any',
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 4, needs: ['jump'], jobs: PROWL_JOBS, content: 'ground', maxPerStage: 3,
  pieces: [
    { key: 'in', shape: 'bank', w: [280, 320], place: { kind: 'start' } },
    { key: 'low', shape: 'bank', w: PROWL_FLOOR, place: { kind: 'walk', after: 'in', dy: [50, 56] } },
    { key: 'high', shape: 'bank', w: PROWL_FLOOR, place: { kind: 'walk', after: 'low', dy: [-56, -50] } },
    { key: 'out', shape: 'bank', w: [260, 300], place: { kind: 'walk', after: 'high', dy: [0, 0] } },
  ],
  entry: { piece: 'in', kind: 'ground' },
  exit: { piece: 'out', kind: 'ground' },
  exitDy: 0,
  sockets: [
    { id: 'petals', role: 'pickup', on: 'in', t: [0.3, 0.5], dn: 34, count: 2, span: 90, allow: ['pickups'] },
    ocelotAt('ocelot1', 'low', [0.4, 0.5]),
    ocelotAt('ocelot2', 'high', [0.3, 0.4]),
    { id: 'petal', role: 'pickup', on: 'out', t: 0.35, dn: 34 },
    // (a flag that falls in the brick stands on its exit bank, never on a floor: a safe spot within SAFE_APPROACH, levelCheck.ts,
    //  takes an ocelot's patch away, pipeline.ts patchFor)
    { id: 'flag', role: 'flag', on: 'out', t: 0.7 },
  ],
  mirrorable: false,
};

/** the climb out of the ocelot's floor (px): two Pokeys up the vine (89.1 px each), past a plain jump's rise, so the vine is the way */
const PROWL_CLIMB_H = 180;
/** the plain step down from the climb's entry bank onto the ocelot's floor (px; 0.61 of Pokey): the walk off the shelf lands at the entry's
 *  height, the vine's height less this step, so the brick leaves where it came in */
const PROWL_STEP = 54;

/**
 * THE CLIMB OUT (3-2's climb beats with an ocelot, P(c) 'Pc1&<:&ocelot*1' and X(c) 'Xc1&<:#dark:&ocelot*1'; AUDIT-W3 'ocelot*1: laid
 * 0' x11): the ocelot prowls the stone floor at the vine's foot; he stands still until its back is turned, slips past, climbs the vine
 * (World 3's climb, drawn as the kit's trunk) onto a branch shelf and walks off it down onto the exit bank (a walk, never a jump: only a
 * jump's dy is scaled by the rise, R-165.524). Plain jumps only. `dark`: the dark stretch over the whole brick, a glowworm at its end.
 */
function prowlClimb(dark: boolean, high = false): SectionTemplate {
  const top = high ? 'ledge' : 'shelf';
  return {
    id: `w3-prowl-climb${high ? '-high' : ''}${dark ? '-dark' : ''}`,
    name: `the climb out${high ? ' and up' : ''}${dark ? ', in the dark' : ''}`,
    feel: W3_LEVEL_STAGES, archetypes: 'any',
    phases: ['sho', 'ten', 'ketsu'],
    difficulty: dark ? 4 : 3, needs: ['climb'], jobs: PROWL_JOBS, content: 'climb', maxPerStage: 3,
    pieces: [
      { key: 'in', shape: 'bank', w: [280, 320], place: { kind: 'start' } },
      { key: 'foot', shape: 'bank', w: PROWL_FLOOR, place: { kind: 'walk', after: 'in', dy: PROWL_STEP } },
      { key: 'vine', shape: 'vine', w: 0, place: { kind: 'climb', on: 'foot', at: 1, h: PROWL_CLIMB_H } },
      { key: 'shelf', shape: 'branch', w: [220, 260], place: { kind: 'over', on: 'vine', at: 0, dy: 0 }, main: true },
      // (`high`: a plain step up off the shelf onto a higher branch, and the walk off is from there)
      ...(high ? [{ key: 'ledge', shape: 'branch' as const, w: [200, 240] as [number, number], place: { kind: 'walk' as const, after: 'shelf', dy: -PROWL_STEP } }] : []),
      { key: 'out', shape: 'bank', w: [280, 320], place: { kind: 'walk', after: top, dy: PROWL_CLIMB_H - PROWL_STEP + (high ? PROWL_STEP : 0) } },
    ],
    entry: { piece: 'in', kind: 'ground' },
    exit: { piece: 'out', kind: 'ground' },
    exitDy: 0,
    sockets: [
      ...(dark ? darkEnds('in', 'out', 'glow') : []),
      ocelotAt('ocelot', 'foot', [0.3, 0.45]),
      { id: 'petals', role: 'pickup', on: top, t: [0.4, 0.6], dn: 34, count: 2, span: 90, allow: ['pickups'] },
      { id: 'petal', role: 'pickup', on: 'out', t: 0.35, dn: 34 },
      // (a flag that falls in the brick stands on its exit bank, never at the ocelot's floor: pipeline.ts patchFor, SAFE_APPROACH)
      { id: 'flag', role: 'flag', on: 'out', t: 0.7 },
    ],
    mirrorable: false,
  };
}
export const w3ProwlClimb: SectionTemplate = prowlClimb(false);
export const w3ProwlClimbDark: SectionTemplate = prowlClimb(true);
export const w3ProwlClimbHigh: SectionTemplate = prowlClimb(false, true);
export const w3ProwlClimbHighDark: SectionTemplate = prowlClimb(true, true);
/** the climb bricks (a climb node takes two: two shapes, so its second is World 3's own, not a World 1-2 stand-in) */
export const W3_CLIMBS: readonly SectionTemplate[] = [w3ProwlClimb, w3ProwlClimbDark, w3ProwlClimbHigh, w3ProwlClimbHighDark];

/** a brick in the dark (3-2's '#dark' beats on the ocelot's ground, 'Cg1&>:#dark:&ocelot*2'): the dark stretch from its entry to its exit,
 *  a glowworm at its end (gen2/dark.ts darkEnds); a node that asks #dark draws it (pipeline: a section that lays the node's hazard) */
const inTheDark = (s: SectionTemplate, name: string): SectionTemplate => ({
  ...s, id: `${s.id}-dark`, name, difficulty: s.difficulty + 1, sockets: [...darkEnds(s.entry.piece, s.exit.piece, 'glow'), ...s.sockets],
});
export const w3ProwlFloorDark: SectionTemplate = inTheDark(w3ProwlFloor, "the ocelot's floor, in the dark");
export const w3ProwlPairDark: SectionTemplate = inTheDark(w3ProwlPair, 'two ocelot floors, in the dark');

/** World 3's level bricks, in the order a pool reads them (the ocelot's ground, the climb out; the root rope next, ENG-ROOT) */
export const W3_LEVEL: readonly SectionTemplate[] = [w3ProwlFloor, w3ProwlPair, w3ProwlFloorDark, w3ProwlPairDark, ...W3_CLIMBS];
// ───────────────────────────── the hazards a node code may ask ─────────────────────────────

/** the puff's clock (the spore piece, gen2/spore.ts: a section's SectionZone 'spore' lays its cloud on zones.ts SPORE's beat) */
const PUFF: HazardLay = { zone: 'spore', zones: ['spore'] };

/**
 * WORLD 3's HAZARD REGISTRY (nodeAsks.ts hazardRegistry, ENG-ASKS R-165.501; ENG-ASKS-b): the ids and named clocks a World 3 node code
 * may ask (`:#id`, `:#id@clock`), each by the bricks that lay it. The deal draws a section that lays it, or the roll fails by name.
 *   - #dark: the glowworms' dark (gen2/dark.ts), laid by a section's dark ends (darkEnds: its 'darkFrom' prop), read as a 'dark' zone;
 *   - @puff: the spore puff's clock (#dark@puff: the dark with a puff on its shelf, its light on the puff's beat; #spore@puff);
 *   - #spore: the spore puff itself, by its zone brick;
 *   - #soft@moon: a soft fall on the moon's clock. NO BRICK LAYS THE MOON YET (ENG-MOON builds it): the row is registered so the ask is
 *     refused by name ('no section in the pool lays @moon') until a section with a 'moon' zone is in the pool; ENG-MOON sets the zone.
 * NOT YET: #vine and #thornvine@doze wait for ENG-VINE (until then a code that asks them is refused '... is not a registered hazard').
 */
export const W3_HAZARDS: readonly HazardDef[] = [
  { id: 'dark', zone: 'dark', props: ['darkFrom'], clocks: { puff: PUFF } },
  { id: 'spore', ...PUFF, clocks: { puff: PUFF } },
  { id: 'soft', clocks: { moon: { zone: 'moon', zones: ['moon'] } } },
];

// ───────────────────────────── the manifest and the kit ─────────────────────────────

/**
 * World 3's manifest. The planner's tempo (rollRanges) is World 1's measured one until a World 3 level is flown on its own (the builder's
 * dial). Moves: everything Worlds 1-2 taught. Lessons: World 1's moves where World 1 taught them.
 */
export function w3Manifest(): WorldManifest {
  return {
    world: 3, name: 'Mossy Grotto',
    moves: ['double', 'climb', 'swing'],
    ground: { y: W3_GROUND.y, bankH: W3_GROUND.bankH, style: 'log' },
    pit: 'soft', pitDepth: W3_GROUND.pitDepth,
    rollRanges: W1_KIT.rollRanges,
    corridor: { top: G - 260, bottom: G + 60, soft: 80 },
    themeShare: [1, 1],
    creatures: [...W3_CAST], props: [...DARK_GLOW_PROPS], pairs: [], decor: [],
    flowers: ['orchid', 'hibiscus'],
    sections: [...W3_DOWN, ...W3_DOWN_TOWER, ...W3_LEVEL],
    handBuilt: [],
    lessons: { jump: '1-1', double: '1-1', bounce: '1-1', climb: '1-4', creak: '1-5', swing: '1-6' },
    tips: W3_TIPS,
    required: {},
    hazards: W3_HAZARDS,
  };
}

/** World 3's kit: its manifest, and the dark's emitters (gen2/dark.ts: the glowworms' stretch; the spores come with their own piece) */
export function w3World(): WorldKit {
  return { manifest: w3Manifest(), emit: { ...DARK_EMIT } };
}

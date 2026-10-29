/**
 * gen2/worlds/w7 — World 7 (the Ancient Ruins) for the new generator: its manifest (the toybox the roll draws from), its emitters (the
 * one piece of code per world that turns a filled prop socket into extras the engine plays) and its kit, `w7Kit(stage)`.
 *
 * Everything comes from the story (reference/STORY-REWRITE.md "World 7: Ancient Ruins", the "Alone" chapter): Dot is gone, the vines on
 * the old walls hang brown, a ring of ten stone chairs and a plain eleventh, statues that all face the temple, and a quiet that is not
 * the Grotto's. So Pokey teaches himself (Matt, 2026-10-29, STAGE-RULES §1): every first-use line and every locked exit is his own
 * thought, under 10 words (W7_TIPS); there is no Dot perch and no Dot line in a World 7 stage (wayside.ts dotPresent is false for the
 * world, so the guide draws each line as his thought).
 *   mechanic    CRUMBLING ruin tiles (zones.ts crumble, Platform.crumbleAfter). Never needed (STAGE-RULES §1): a run of tiles is always a
 *               shortcut or a hurry over a sunken hall whose floor walks on underneath (pipeline SectionPiece.crumble; checkStage proves
 *               every stage without its tiles). 7-1 teaches it in a safe spot on every roll (w7Game.ts W7_REQUIRED).
 *   creatures   the cats (ocelot, jaguar: World 3), the boa (coiled in the halls: World 1), the tayra, the harpy and the poison frog
 *               (World 6). All were taught before, so none needs a first line here. The Stone Sentries of 7-5 have no creature yet (the
 *               sentry is on the creature art list): until it comes, the halls' guards are the cats and boas.
 *   props       scenery only (statues, urns, fallen columns, braziers, fig roots, the ring of chairs): Matt's World 7 set dressing
 *               (src/assets/w6to10/props-made w7c, w7c-b), named by their cells. Like World 6's, the gen2 extras carry them for the
 *               drawing (proto.gen2.w7); nothing draws them yet.
 *   falls       the drains are dirty water (Matt's rule from World 6 on: badWaterArt.ts paints it), a third of a jump wide, warned first by
 *               Pokey (W7_TIPS.water), a life on both settings. The chasms between the old floors (the stitcher's pits, the wide and
 *               second-jump gaps, the drops under the lianas) are deep: a life on Normal, soft on Easy (pipeline planBudget: Easy's falls
 *               on land are always soft). With soft chasms World 7 measured BELOW World 6 on the first-timer's band (Normal middle about
 *               25 against 45: §1b calls that a bug); deep, its Normal stages measure 50-51 (lives a minute 6-7, as 6-1's 5.3).
 *               The sunken halls under the crumbling tiles are floors, not pits: walked, never a life.
 *   light       dawn (7-1 to 7-3), day (7-4 to 7-6), dusk (7-7 on): the backdrops w7dawn-far, w7-far, w7dusk-far.
 *
 * Pure data and pure functions (no canvas, no engine), like w6.ts.
 */
import { G } from '../../protoStage.ts';
import type { Enemy } from '../../types.ts';
import type { CreatureDef, FilledSocket, PropDef, PropEmitter, StageSink, WorldKit, WorldManifest } from '../types.ts';
import { W7_GROUND_SECTIONS } from './w7Ground.ts';

/** World 7's ground, its bank's depth, and how deep a soft pit's floor lies under its lips (one wide step out, as World 6's 110) */
export const W7_GROUND = { y: G, bankH: 90, pitDepth: 110 } as const;

// ───────────────────────────── the ids ─────────────────────────────

export const W7_CREATURE = {
  ocelot: 'ocelot',
  jaguar: 'jaguar',
  boa: 'boa',
  tayra: 'tayra',
  harpy: 'harpy',
  frog: 'frog',
} as const;
export type W7CreatureId = (typeof W7_CREATURE)[keyof typeof W7_CREATURE];

export const W7_PROP = {
  statue: 'statue',
  urn: 'urn',
  column: 'column',
  brazier: 'brazier',
  figs: 'figs',
  /** 7-3 Ten Chairs: the ring of ten stone chairs and a plain eleventh (the story's set piece) */
  chairs: 'chairs',
} as const;
export type W7PropId = (typeof W7_PROP)[keyof typeof W7_PROP];

/** the tags sockets ask for (Socket.allow) */
export const W7_TAG = { scenery: 'scenery', ring: 'ring', hunter: 'hunter', big: 'big', still: 'still', coil: 'coil', quick: 'quick' } as const;

/** the mechanics World 7 teaches, as `teaches` / `uses` keys and Pokey's tip keys */
export const W7_LESSON = {
  crumble: 'crumble',
  /** the searches' sealed shrine, the purge's and the gauntlet's (Pokey explains the locked exit, STAGE-RULES §1) */
  relics: 'relics',
  hunt: 'hunt',
  fight: 'fight',
  /** the brown vines up the old walls (climbing was taught long ago: this is the story's line on the first one) */
  brown: 'brown',
  water: 'water',
} as const;

// ───────────────────────────── the creatures ─────────────────────────────

/** the old generator's bodies (stageGenerator.ts ocelot(), jaguar(), boa(), tayra(), harpy(), frog()): size, hp, feet */
export const W7_CREATURES: CreatureDef[] = [
  { id: W7_CREATURE.ocelot, enemy: 'ocelot', threat: 3, terrain: 'flat', minGround: 220, w: 48, h: 28, hp: 2, footY: 18, easyFirst: true, tags: ['ocelot', W7_TAG.hunter, 'topup'] },
  { id: W7_CREATURE.jaguar, enemy: 'jaguar', threat: 5, terrain: 'flat', minGround: 300, w: 64, h: 38, hp: 3, footY: 24, tags: ['jaguar', W7_TAG.hunter, W7_TAG.big] },
  // (coiled in a hall's corner: it strikes when he comes close; it does not move, so it needs little ground)
  { id: W7_CREATURE.boa, enemy: 'boa', threat: 3, terrain: 'flat', minGround: 200, w: 58, h: 26, hp: 3, footY: 16, extra: { speed: 1, attackCooldown: 0.8 }, tags: ['boa', W7_TAG.coil, 'topup'] },
  { id: W7_CREATURE.tayra, enemy: 'tayra', threat: 2.5, terrain: 'flat', minGround: 200, w: 46, h: 24, hp: 1, footY: 15, tags: ['tayra', W7_TAG.hunter, W7_TAG.quick, 'topup'] },
  { id: W7_CREATURE.harpy, enemy: 'harpy', threat: 4, terrain: 'flat', minGround: 260, w: 48, h: 36, hp: 2, footY: 16, tags: ['harpy', W7_TAG.hunter, W7_TAG.big] },
  { id: W7_CREATURE.frog, enemy: 'frog', threat: 1.5, terrain: 'flat', minGround: 120, w: 36, h: 24, hp: 1, footY: 14, tags: ['frog', W7_TAG.still, 'topup'] },
];

// ───────────────────────────── the props ─────────────────────────────

export const W7_PROPS: PropDef[] = [
  { id: W7_PROP.statue, tags: [W7_TAG.scenery], w: 90, minApart: 600, looks: ['slothStatue'] },
  { id: W7_PROP.urn, tags: [W7_TAG.scenery], w: 60, minApart: 300, looks: ['urn'] },
  { id: W7_PROP.column, tags: [W7_TAG.scenery], w: 160, minApart: 500, looks: ['fallenColumn'] },
  { id: W7_PROP.brazier, tags: [W7_TAG.scenery], w: 60, minApart: 400, looks: ['brazier'] },
  { id: W7_PROP.figs, tags: [W7_TAG.scenery], w: 120, minApart: 500, looks: ['figRoots', 'archway'] },
  { id: W7_PROP.chairs, tags: [W7_TAG.ring], w: 400, minApart: 4000 },
];

// ───────────────────────────── the decor ─────────────────────────────

/** Matt's World 7 set dressing (w7c, and its second look w7c-b), rotated by the roll (artRoll.ts rollLook) */
export const W7_DECOR: WorldManifest['decor'] = [
  { id: 'w7-relics', job: 'bank', items: [{ n: 'urn', w: [50, 70] }, { n: 'brazier', w: [50, 70] }, { n: 'fallenColumn', w: [140, 180] }], every: [220, 340] },
  { id: 'w7-figs', job: 'bank', items: [{ n: 'figRoots', w: [100, 140] }, { n: 'slothStatue', w: [80, 100] }, { n: 'urn', w: [50, 70] }], every: [240, 360] },
  { id: 'w7-arches', job: 'hanging', items: [{ n: 'archway', w: [160, 220] }, { n: 'figRoots', w: [100, 140] }], every: [700, 1100] },
  { id: 'w7-statues', job: 'hanging', items: [{ n: 'slothStatue', w: [90, 120] }, { n: 'fallenColumn', w: [140, 180] }], every: [800, 1200] },
];

// ───────────────────────────── Pokey's lines ─────────────────────────────

/**
 * Pokey's own first-time lines (Dot is gone in World 7; under 10 words, in his voice). All new: each needs Matt's approval before it
 * ships (STAGE-RULES §1 "Story"); used meanwhile.
 */
export const W7_TIPS: Record<string, string> = {
  [W7_LESSON.crumble]: "Cracked tiles. Don't stand still.", // (new, needs Matt's approval: his own example)
  [W7_LESSON.relics]: "The shrine's sealed. I'll find the relics first.", // (new, needs Matt's approval)
  [W7_LESSON.hunt]: "Shrine's shut. The guards have to go first.", // (new, needs Matt's approval)
  [W7_LESSON.fight]: "Shut tight. I'll have to fight through.", // (new, needs Matt's approval)
  [W7_LESSON.brown]: 'Brown vines. Still strong enough to climb.', // (new, needs Matt's approval)
  [W7_LESSON.water]: "Dirty water down there. Hop it, don't touch.", // (new, needs Matt's approval)
};
export const W7_NEW_LINES: readonly string[] = Object.values(W7_TIPS);

// ───────────────────────────── the manifest ─────────────────────────────

/** the stages of World 7 gen2 builds (7-2 Brown Vines, 7-4 The Way Up and 7-8 The Upper Temple are ascents: hand-built; 7-10 is the
 *  guardian's lair) */
export const W7_GEN2_STAGES = ['7-1', '7-3', '7-5', '7-6', '7-7', '7-9'] as const;

/** the stages of World 7 that hold a puzzle room (STAGE-RULES §3; w7Rooms.ts, required on every roll: w7Game.ts) */
export const W7_ROOM_STAGES = ['7-3', '7-7'] as const;

export const W7_MANIFEST: WorldManifest = {
  world: 7,
  name: 'Ancient Ruins',
  moves: ['double', 'punch', 'swing', 'climb', 'rope', 'glide'],
  ground: { y: W7_GROUND.y, bankH: W7_GROUND.bankH, style: 'moss_stone' },
  pit: 'void',
  pitDepth: W7_GROUND.pitDepth,
  corridor: { top: G - 160, bottom: G + 80, soft: 60 },
  creatures: W7_CREATURES,
  props: W7_PROPS,
  pairs: [],
  decor: W7_DECOR,
  flowers: ['orchid', 'hibiscus'],
  sections: W7_GROUND_SECTIONS,
  handBuilt: ['7-2', '7-4', '7-8', '7-10'],
  // (the cats were met in World 3, the boa in World 1, the rest in World 6; the tiles are 7-1's)
  lessons: { ocelot: '3-9', jaguar: '3-9', boa: '1-9', tayra: '6-2', harpy: '6-5', frog: '6-2', [W7_LESSON.crumble]: '7-1' },
  tips: W7_TIPS,
};

// ───────────────────────────── the emitters ─────────────────────────────

/** a stage's light, by its number (the backdrops through the day) */
export type W7Mood = 'dawn' | 'day' | 'dusk';
export const w7Mood = (stage: number): W7Mood => (stage <= 3 ? 'dawn' : stage <= 6 ? 'day' : 'dusk');

/** World 7's own extras (in sink.extras.w7, so proto.gen2.w7): what the hook-up hands the drawing */
export interface W7Extras {
  mood: W7Mood;
  scenery?: Array<{ n: string; x: number; b: number; w: number; flip?: boolean }>;
  decor?: Array<{ n: string; x: number; b: number; w: number; flip?: boolean }>;
  /** 7-3's ring of ten stone chairs and a plain eleventh, centred at x on the ground b (art to come: the report's Gemini prompt) */
  chairs?: Array<{ x: number; b: number; w: number }>;
}

const hash01 = (x: number, salt: number): number => {
  const s = Math.sin(x * 12.9898 + salt * 78.233) * 43758.5453;
  return s - Math.floor(s);
};
const R = Math.round;

/** the stage's World 7 extras, made on first use */
export function w7Of(out: StageSink, stage = 1): W7Extras {
  return (out.extras.w7 ??= { mood: w7Mood(stage) }) as W7Extras;
}
const look = (p: PropDef, x: number, salt: number) => (p.looks?.length ? p.looks[Math.floor(hash01(x, salt) * p.looks.length)] : p.id);

/** the emitters, for a stage of World 7 */
export function w7Emitters(stage: number): Record<W7PropId, PropEmitter> {
  const scenery = (salt: number): PropEmitter => (f: FilledSocket, p: PropDef, out: StageSink) =>
    void (w7Of(out, stage).scenery ??= []).push({ n: look(p, f.x, salt), x: f.x, b: f.y, w: R(p.w * (0.9 + 0.2 * hash01(f.x, salt + 1))), ...(hash01(f.x, salt + 2) < 0.5 ? { flip: true } : {}) });
  return {
    statue: scenery(1),
    urn: scenery(4),
    column: scenery(7),
    brazier: scenery(10),
    figs: scenery(13),
    chairs: (f, p, out) => void (w7Of(out, stage).chairs ??= []).push({ x: f.x, b: f.y, w: p.w }),
  };
}

/** the decorator (pass 6): the chosen decor sets into W7Extras.decor */
export function w7Decorate(stage: number): NonNullable<WorldKit['decorate']> {
  return (items, out) => {
    const decor = (w7Of(out, stage).decor ??= []);
    for (const it of items) decor.push({ n: it.n, x: it.x, b: it.y, w: it.w, ...(hash01(it.x, 11) < 0.5 ? { flip: true } : {}) });
  };
}

/** every animal kept on its patch (never off a ledge into a hall or a drain), facing a rolled way */
export function w7Spawn(): NonNullable<WorldKit['spawn']> {
  return (e: Enemy) => {
    e.edgeMinX = e.patrolMinX;
    e.edgeMaxX = e.patrolMaxX;
    e.facing = hash01(e.x, 12) < 0.5 ? -1 : 1;
  };
}

/** World 7's kit for one stage (its number sets the light; the game's kit, w7Game.ts, chooses the sections) */
export function w7Kit(stage = 1): WorldKit {
  return { manifest: W7_MANIFEST, emit: w7Emitters(stage), decorate: w7Decorate(stage), spawn: w7Spawn() };
}

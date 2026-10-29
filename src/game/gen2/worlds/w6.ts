/**
 * gen2/worlds/w6 — World 6 (the Deep Mangrove) for the new generator: its manifest (the toybox the roll draws from), its emitters (the
 * one piece of code per world that turns a filled prop socket into extras the engine plays) and its kit, `w6Kit(stage)`.
 *
 * Everything comes from the story (reference/STORY-REWRITE.md "World 6"): roots standing up out of flat gray water in a maze, the sun
 * only where the roots let it in, and the Reaver's spear rising out of the black water to look at them. "Water that flat has something
 * under it."
 *   creatures   the caiman (lies on the bank, bites; a stomp only bounces off it), the poison frog (sits still: stomp it, never touch
 *               it), the tayra (small and quick), the ocelot and the jaguar (World 3's prowlers), the night harpy (a ground bruiser:
 *               it crouches, slides, then leaps and stomps). The Reaver's runners (the otters with spears, Matt's runners sheet) are
 *               not a creature yet: Matt picks new creature designs from the art gallery later.
 *   props       hiding roots and reeds (the stealth stages' cover: a root den, a reed bed), the watched water (the spear rising out
 *               of it: the watcher's rhythm, watcher.ts, over a stretch of bank), the tide post that marks a mudflat, lily pads and
 *               snags (scenery). The tide itself is the mudflat section's own zone (SectionTemplate.zones, gen2 DESIGN B11).
 *   pairs       none: the tide is laid with its mudflat by the section, and the post with it.
 *   decor       Matt's mangrove sheet (reference/prop-sheets/w6/kit.jpg, water.jpg): knee roots, root arches, the mangrove sprout and
 *               reeds along the banks; Spanish moss, hanging aerial roots, snags and mossy logs behind them; each job rotated by the
 *               roll (artRoll.ts rollLook). The sheets are not packed into an atlas yet: the art keys here name their cells.
 *   light       morning (6-1 to 6-3), late morning (6-4 to 6-6), noon (6-7 on): "the Reaver eats lunch at noon", and at 6-9 the
 *               sun is straight down through the roots.
 *
 * Water: Matt's rule is soft falls on land and a life in water, on Easy too, with Dot's warning first (types.ts WATER_WARN). The world's
 * falls are soft (a mud floor and a step out: the stitcher's gaps between sections, the wide and second-jump gaps), and the creeks
 * between the roots are the sections' own `water` gaps (the core's water gap, DESIGN B11): a third of a jump wide (STAGE-RULES §6: the
 * first-timer drowns at half a jump), with a bank of 360 px or more between two of them (no glide trap: w6Ground `hop`). 6-4 Low Tide
 * (the tide is out) and 6-6 Lights in the Roots (soft moss under gaps in the dark, STAGE-RULES §6) have no water: w6Manifest turns
 * their creeks to mud (W6_SOFT_STAGES).
 *
 * Pure data and pure functions (no canvas, no engine), like w5.ts.
 */
import { G } from '../../protoStage.ts';
import type { StageHint } from '../../protoStage.ts';
import type { Enemy, Platform } from '../../types.ts';
import type { Bush, WatchZone } from '../../watcher.ts';
import type { Zone } from '../../zones.ts';
import type { CreatureDef, FilledSocket, PlaceRule, PropDef, PropEmitter, PropPair, SectionTemplate, StageSink, WorldKit, WorldManifest } from '../types.ts';
import { W6_GROUND_SECTIONS, W6_STAGE_ONLY, W6_STAGE_SKIP } from './w6Ground.ts';

/** World 6's ground, its bank's depth, and how deep a soft pit's floor lies under its lips (one wide step out, as World 5's 110) */
export const W6_GROUND = { y: G, bankH: 90, pitDepth: 110 } as const;

// ───────────────────────────── the ids (the swing sections and the puzzle rooms use these: keep them stable) ─────────────────────────────

export const W6_CREATURE = {
  caiman: 'caiman',
  frog: 'frog',
  tayra: 'tayra',
  ocelot: 'ocelot',
  jaguar: 'jaguar',
  harpy: 'harpy',
} as const;
export type W6CreatureId = (typeof W6_CREATURE)[keyof typeof W6_CREATURE];

export const W6_PROP = {
  /** a root den to hide in (watcher.ts Bush 'wide') */
  rootHide: 'rootHide',
  /** a reed bed to hide in (Bush 'tall') */
  reedHide: 'reedHide',
  /** the watched water: the spear rises and looks along the bank (watcher.ts WatchZone over the piece it stands on) */
  watch: 'watch',
  /** the post with the tide's marks on it (Matt's water sheet): always beside its mudflat */
  tidePost: 'tidePost',
  /** scenery at the water's edge */
  lilies: 'lilies',
  snag: 'snag',
} as const;
export type W6PropId = (typeof W6_PROP)[keyof typeof W6_PROP];

/** the tags sockets ask for (Socket.allow) */
export const W6_TAG = {
  /** the stealth stages' want (pipeline WANT.stealth): somewhere to hide */
  cover: 'cover',
  hide: 'hide',
  watch: 'watch',
  tide: 'tide',
  post: 'post',
  scenery: 'scenery',
  /** creatures: still ones sit (the frog), hunters prowl (tayra, ocelot, jaguar, harpy), the caiman lies on the bank */
  still: 'still',
  hunter: 'hunter',
  quick: 'quick',
  big: 'big',
  bank: 'bank',
} as const;

/**
 * The mechanics World 6 teaches, as `teaches` / `uses` keys and Dot's tip keys. A section that uses one is open only once a section
 * before it (or an earlier stage, W6_MANIFEST.lessons) taught it, and the first section that teaches it says Dot's line.
 */
export const W6_LESSON = {
  watch: 'watch',
  tide: 'tide',
  caiman: 'caiman',
  frog: 'frog',
  tayra: 'tayra',
  harpy: 'harpy',
  /** the purge's and the gauntlet's shut shrine (Dot explains the locked exit, STAGE-RULES §1) */
  hunt: 'hunt',
  fight: 'fight',
} as const;

// ───────────────────────────── the creatures ─────────────────────────────

/** the old generator's World 6 bodies (stageGenerator.ts caiman(), frog(), tayra(), ocelot(), jaguar(), harpy()): size, hp, feet */
export const W6_CREATURES: CreatureDef[] = [
  // lies on the bank and lunges; a stomp only bounces off (it takes a few hits). Slow to turn, so it costs a cat's threat (3: it fits
  // 6-2's hot sections). The world's own animal, so Easy keeps one (softened)
  { id: W6_CREATURE.caiman, enemy: 'caiman', threat: 3, terrain: 'flat', minGround: 260, w: 84, h: 24, hp: 3, footY: 15, easyFirst: true, tags: ['caiman', W6_TAG.bank, 'topup'] },
  // sits still and hurts if touched: a stomp is its answer (cheap: the Ki sections' animal)
  { id: W6_CREATURE.frog, enemy: 'frog', threat: 1.5, terrain: 'flat', minGround: 120, w: 36, h: 24, hp: 1, footY: 14, tags: ['frog', W6_TAG.still, 'topup'] },
  // small and quick: it scurries the patch fast
  { id: W6_CREATURE.tayra, enemy: 'tayra', threat: 2.5, terrain: 'flat', minGround: 200, w: 46, h: 24, hp: 1, footY: 15, tags: ['tayra', W6_TAG.hunter, W6_TAG.quick, 'topup'] },
  // World 3's prowlers
  { id: W6_CREATURE.ocelot, enemy: 'ocelot', threat: 3, terrain: 'flat', minGround: 220, w: 48, h: 28, hp: 2, footY: 18, tags: ['ocelot', W6_TAG.hunter, 'topup'] },
  { id: W6_CREATURE.jaguar, enemy: 'jaguar', threat: 5, terrain: 'flat', minGround: 300, w: 64, h: 38, hp: 3, footY: 24, tags: ['jaguar', W6_TAG.hunter, W6_TAG.big] },
  // the night harpy: crouches, slides, then leaps and stomps; it needs a long run of ground (the old generator's 140 px patrol, plus room)
  { id: W6_CREATURE.harpy, enemy: 'harpy', threat: 4, terrain: 'flat', minGround: 260, w: 48, h: 36, hp: 2, footY: 16, tags: ['harpy', W6_TAG.hunter, W6_TAG.big] },
];

// ───────────────────────────── the props ─────────────────────────────

/** the watcher's bush sizes (protoStage.ts BUSH_W): a root den is drawn like a wide bush, a reed bed like a tall one */
export const W6_HIDE_W = { rootHide: 176, reedHide: 124 } as const;

export const W6_PROPS: PropDef[] = [
  // (`w` the space along the route; `minApart` the least gap to another of its kind, C2)
  { id: W6_PROP.rootHide, tags: [W6_TAG.hide, W6_TAG.cover], w: W6_HIDE_W.rootHide, minApart: 260, looks: ['rootDen', 'rootArch'] },
  { id: W6_PROP.reedHide, tags: [W6_TAG.hide, W6_TAG.cover], w: W6_HIDE_W.reedHide, minApart: 260, looks: ['reeds', 'seagrass'] },
  // (the watcher is the beat: its passes are what he waits out, in the roots)
  { id: W6_PROP.watch, tags: [W6_TAG.watch], w: 120, minApart: 500, hazard: true, beat: true },
  { id: W6_PROP.tidePost, tags: [W6_TAG.post], w: 30, minApart: 400 },
  { id: W6_PROP.lilies, tags: [W6_TAG.scenery], w: 120, minApart: 300, looks: ['lilyPads', 'mudPuddle'] },
  { id: W6_PROP.snag, tags: [W6_TAG.scenery], w: 80, minApart: 400, looks: ['snag', 'snagHook', 'kneeRoot'] },
];

/** none: the tide post stands with its mudflat in the section that lays the tide (SectionTemplate.zones) */
export const W6_PAIRS: PropPair[] = [];

// ───────────────────────────── the decor ─────────────────────────────

export const W6_DECOR: WorldManifest['decor'] = [
  // along the banks (kit.jpg, water.jpg): knee roots and root arches, or reeds, seagrass and the mangrove sprout
  { id: 'w6-knees', job: 'bank', items: [{ n: 'kneeRoot', w: [70, 100] }, { n: 'rootArch', w: [120, 160] }, { n: 'lowStump', w: [80, 110] }], every: [180, 300] },
  { id: 'w6-reeds', job: 'bank', items: [{ n: 'reeds', w: [80, 120] }, { n: 'seagrass', w: [90, 130] }, { n: 'mangroveSprout', w: [70, 100] }], every: [170, 280] },
  // behind them: moss hanging from the roots, or the drowned wood
  { id: 'w6-moss', job: 'hanging', items: [{ n: 'spanishMoss', w: [140, 200] }, { n: 'aerialRoot', w: [40, 60] }], every: [500, 800] },
  { id: 'w6-snags', job: 'hanging', items: [{ n: 'snag', w: [70, 100] }, { n: 'mossLog', w: [140, 180] }, { n: 'hollowStump', w: [90, 120] }], every: [700, 1100] },
];

// ───────────────────────────── the manifest ─────────────────────────────

/** the stages whose gaps are mud, not water: 6-4 Low Tide (the tide is out) and 6-6 Lights in the Roots (soft moss under gaps in the dark) */
export const W6_SOFT_STAGES: readonly number[] = [4, 6];

/** the stages of World 6 gen2 builds (6-8 Stilt Climb stays hand-built; 6-10 is the guardian's lair) */
export const W6_GEN2_STAGES = ['6-1', '6-2', '6-3', '6-4', '6-5', '6-6', '6-7', '6-9'] as const;

/** the stages of World 6 that may hold a puzzle room (2-3 puzzle moments a world, STAGE-RULES §3): 6-3 and 6-7 (raise the water,
 *  lower the water). The rooms are the swing builder's (gen2-w6-swing) */
export const W6_ROOM_STAGES = ['6-3', '6-7'] as const;

/**
 * Dot's first-time lines (under 10 words). All new: each needs Matt's approval before it ships (STAGE-RULES §1 "Story"). The water
 * line is Matt's own (types.ts WATER_LINE, approved 2026-10-28).
 */
export const W6_TIPS: Record<string, string> = {
  [W6_LESSON.watch]: "The water's watching. Duck into the roots!", // (new, needs Matt's approval)
  [W6_LESSON.tide]: 'Mud! Cross while the tide is out.', // (new, needs Matt's approval)
  [W6_LESSON.caiman]: "A caiman! Don't stomp it. Punch, or hop over.", // (new, needs Matt's approval)
  [W6_LESSON.frog]: 'Poison frog. Stomp it, never touch it.', // (new, needs Matt's approval)
  [W6_LESSON.tayra]: 'A tayra! Quick, so punch it early.', // (new, needs Matt's approval)
  [W6_LESSON.harpy]: 'A harpy! It slides, then stomps. Jump clear.', // (new, needs Matt's approval)
  [W6_LESSON.hunt]: "The shrine's shut. Chase the hunters off first!", // (new, needs Matt's approval)
  [W6_LESSON.fight]: "The shrine's shut. Fight through to open it.", // (new, needs Matt's approval)
};
export const W6_NEW_LINES: readonly string[] = Object.values(W6_TIPS);

export const W6_MANIFEST: WorldManifest = {
  world: 6,
  name: 'Deep Mangrove',
  // (World 6 swings over the black water: the swing builder's sections need swing; climb, rope and glide are learned by now)
  moves: ['double', 'punch', 'swing', 'climb', 'rope', 'glide'],
  ground: { y: W6_GROUND.y, bankH: W6_GROUND.bankH, style: 'log' },
  // (falls on land are soft; the creeks are the sections' own water gaps: see the header)
  pit: 'soft',
  pitDepth: W6_GROUND.pitDepth,
  // (the route's ground stays within a root step or two of the water line: high roads are `over` pieces above it)
  corridor: { top: G - 160, bottom: G + 80, soft: 60 },
  creatures: W6_CREATURES,
  props: W6_PROPS,
  pairs: W6_PAIRS,
  decor: W6_DECOR,
  flowers: ['hibiscus', 'orchid'],
  sections: W6_GROUND_SECTIONS,
  handBuilt: ['6-8', '6-10'],
  // (the prowlers were met in World 3's hand-built stages; the watching water is 6-2's, the tide 6-4's; the new animals are taught in
  // every stage where each is first laid: w6Spawn, w6Finish)
  lessons: { ocelot: '3-9', jaguar: '3-9', [W6_LESSON.watch]: '6-2', [W6_LESSON.tide]: '6-4' },
  tips: W6_TIPS,
};

// ───────────────────────────── the emitters ─────────────────────────────

/** a stage's light, by its number (the Reaver eats lunch at noon: the sun climbs through the world) */
export type W6Mood = 'morning' | 'lateMorning' | 'noon';
export const w6Mood = (stage: number): W6Mood => (stage <= 3 ? 'morning' : stage <= 6 ? 'lateMorning' : 'noon');

/** World 6's own extras (in sink.extras.w6, so proto.gen2.w6): what the hook-up hands the drawing and the engine */
export interface W6Extras {
  mood: W6Mood;
  posts?: Array<{ x: number; y: number }>;
  scenery?: Array<{ n: string; x: number; b: number; w: number; flip?: boolean }>;
  decor?: Array<{ n: string; x: number; b: number; w: number; flip?: boolean }>;
  /** where each hiding place stands and what it is drawn as (the watcher's bushes are proto.bushes: these are their looks) */
  hides?: Array<{ x: number; w: number; y: number; look: string }>;
  /** every animal laid that World 6 teaches (caiman, frog, tayra, harpy): w6Finish puts Dot's line before the first of each kind */
  meets?: Array<{ kind: string; x: number }>;
}

/** a number in 0..1 from a spot and a salt: the emitters' small rolls (the same socket in the same place always rolls the same) */
const hash01 = (x: number, salt: number): number => {
  const s = Math.sin(x * 12.9898 + salt * 78.233) * 43758.5453;
  return s - Math.floor(s);
};
const R = Math.round;

/** the stage's World 6 extras, made on first use */
export function w6Of(out: StageSink, stage = 2): W6Extras {
  return (out.extras.w6 ??= { mood: w6Mood(stage) }) as W6Extras;
}
const look = (p: PropDef, x: number, salt: number) => (p.looks?.length ? p.looks[Math.floor(hash01(x, salt) * p.looks.length)] : p.id);

/** the platform a socket's spot stands on (its top at the spot's y, the spot inside it): the piece a tide or a watch covers */
function pieceAt(out: StageSink, x: number, y: number): Platform | undefined {
  return out.platforms.find((p) => Math.abs(p.y - y) < 1 && x >= p.x && x <= p.x + p.width && p.type !== 'fragile');
}

/** the longest a watched stretch runs (px): a section's banks and knees, not the stage */
const WATCH_MAX = 1400;

/**
 * The stretch the watcher looks along: the piece under the spot and the pieces walked on from it onward with no gap between (a knee
 * root up and down: the same bank to the water), up to WATCH_MAX; a gap ends it (the next bank has its own watch). It never reaches
 * back (a watch stands at the start of its stretch), and w6Decorate clips it to the roots laid along it.
 */
function watchedRun(out: StageSink, x: number, y: number): [number, number] | null {
  const p0 = pieceAt(out, x, y);
  if (!p0) return null;
  const banks = out.platforms.filter((p) => p.type !== 'fragile' && Math.abs(p.y - p0.y) <= 60);
  const x0 = p0.x;
  let x1 = p0.x + p0.width;
  for (let grown = true; grown && x1 - x0 < WATCH_MAX; ) {
    grown = false;
    for (const p of banks) if (Math.abs(p.x - x1) <= 2 && p.x + p.width > x1) (x1 = Math.min(p.x + p.width, x0 + WATCH_MAX)), (grown = true);
  }
  return [x0, x1];
}

/** a watched stretch runs this far past the last root along it (px): never into a stretch with nowhere to hide */
const WATCH_PAST = 120;

/**
 * Each watched stretch clipped to the roots laid along it (pass 4 lays the watch before its roots, so this waits for pass 6): from its
 * start to WATCH_PAST past its last root; one with no root in it is no watched stretch at all (being seen with nowhere to go is unfair)
 */
export function clipWatches(out: StageSink): void {
  const zones = out.proto.watch;
  if (!zones?.length) return;
  const bushes = out.proto.bushes ?? [];
  out.proto.watch = zones.flatMap((z) => {
    const inside = bushes.filter((b) => b.x + b.w > z.x0 && b.x < z.x1);
    if (!inside.length) return [];
    const x1 = Math.min(z.x1, Math.max(...inside.map((b) => b.x + b.w)) + WATCH_PAST);
    return [{ ...z, x1: R(x1) }];
  });
}

/**
 * How long the watcher stays away between passes (s): long where it is taught (a socket named `watchLesson`, as 1-7's first bushes'
 * [9, 11]), then shorter through the world (1-7's later rows [6.5, 8]); never under 5 s, so the next root is always reached in a calm.
 */
export function watchCalm(stage: number, lesson: boolean): [number, number] {
  if (lesson) return [9, 11];
  const k = Math.max(0, Math.min(1, (stage - 2) / 7));
  return [Math.round((7 - 1.5 * k) * 10) / 10, Math.round((8.5 - 1.5 * k) * 10) / 10];
}

/** the emitters, for a stage of World 6 (its number sets the tide's beat, the watcher's calm and the light) */
export function w6Emitters(stage: number): Record<W6PropId, PropEmitter> {
  const hide = (kind: Bush['kind']): PropEmitter => (f, p, out) => {
    const w = W6_HIDE_W[p.id as keyof typeof W6_HIDE_W] ?? 150;
    const b: Bush = { x: R(f.x - w / 2), w, y: f.y, kind };
    (out.proto.bushes ??= []).push(b);
    (w6Of(out, stage).hides ??= []).push({ x: b.x, w, y: f.y, look: look(p, f.x, 1) });
  };
  return {
    rootHide: hide('wide'),
    reedHide: hide('tall'),
    // the watched stretch: the bank the watch stands on and the knees joined to it, 40 px in from each end (the section lays the roots
    // along it). Two watches on one stretch make one zone
    watch: (f, _p, out) => {
      const run = watchedRun(out, f.x, f.y) ?? [f.x - 300, f.x + 300];
      const z: WatchZone = { x0: R(run[0] + 40), x1: R(run[1] - 40), calm: watchCalm(stage, f.socket === 'watchLesson') };
      const zones = (out.proto.watch ??= []);
      if (!zones.some((q) => q.x0 < z.x1 && z.x0 < q.x1)) zones.push(z);
    },
    tidePost: (f, _p, out) => void (w6Of(out, stage).posts ??= []).push({ x: f.x, y: f.y }),
    lilies: (f, p, out) => void (w6Of(out, stage).scenery ??= []).push({ n: look(p, f.x, 3), x: f.x, b: f.y, w: R(100 + 40 * hash01(f.x, 4)) }),
    snag: (f, p, out) =>
      void (w6Of(out, stage).scenery ??= []).push({ n: look(p, f.x, 5), x: f.x, b: f.y, w: R(70 + 30 * hash01(f.x, 6)), ...(hash01(f.x, 7) < 0.5 ? { flip: true } : {}) }),
  };
}

/** the decorator (pass 6): the chosen decor sets into W6Extras.decor, and the watched stretches clipped to their roots (clipWatches) */
export function w6Decorate(stage: number): NonNullable<WorldKit['decorate']> {
  return (items, out) => {
    clipWatches(out);
    const decor = (w6Of(out, stage).decor ??= []);
    for (const it of items) decor.push({ n: it.n, x: it.x, b: it.y, w: it.w, ...(hash01(it.x, 11) < 0.5 ? { flip: true } : {}) });
  };
}

/** the animals World 6 teaches (its tips name them): the prowlers were taught in World 3 */
const TAUGHT_HERE = new Set<string>([W6_CREATURE.caiman, W6_CREATURE.frog, W6_CREATURE.tayra, W6_CREATURE.harpy]);

/**
 * Every animal the stage lays (a socket's or a top-up's) kept on its patch (edgeMinX/MaxX: never off a bank into a gap), facing a rolled
 * way; the ones World 6 teaches are noted (W6Extras.meets) for w6Finish's first-time lines
 */
export function w6Spawn(stage = 2): NonNullable<WorldKit['spawn']> {
  return (e: Enemy, c: CreatureDef, out: StageSink) => {
    e.edgeMinX = e.patrolMinX;
    e.edgeMaxX = e.patrolMaxX;
    e.facing = hash01(e.x, 12) < 0.5 ? -1 : 1;
    if (TAUGHT_HERE.has(c.id)) (w6Of(out, stage).meets ??= []).push({ kind: c.id, x: e.patrolMinX });
  };
}

/** Dot's first-time line comes this far before the first animal of its kind (px): she flies in and talks before it can reach him */
export const MEET_LEAD = 520;

/** a section with its water gaps turned to mud (a mud stage's creeks) */
function muddy(s: SectionTemplate): SectionTemplate {
  const dry = (pl: PlaceRule): PlaceRule => ('water' in pl && pl.water ? ({ ...pl, water: false } as PlaceRule) : pl);
  if (!s.pieces.some((p) => 'water' in p.place && p.place.water)) return s;
  return { ...s, pieces: s.pieces.map((p) => ({ ...p, place: dry(p.place) })) };
}

/** World 6's manifest for one stage: the sections it may hold, their creeks water (mud in W6_SOFT_STAGES) */
export function w6Manifest(stage: number, sections: readonly SectionTemplate[] = W6_MANIFEST.sections): WorldManifest {
  // (6-4's tide gates and flats are Low Tide's own, and the themed stages leave the shared fillers out: w6Ground W6_STAGE_ONLY,
  // W6_STAGE_SKIP; a mud stage's creeks are mud)
  const keep = (s: SectionTemplate) => (!W6_STAGE_ONLY[s.id] || W6_STAGE_ONLY[s.id].includes(stage)) && !W6_STAGE_SKIP[s.id]?.includes(stage);
  const kept = sections.filter(keep);
  return { ...W6_MANIFEST, sections: W6_SOFT_STAGES.includes(stage) ? kept.map(muddy) : kept };
}

/** World 6's kit for one stage (its number sets the water, the sections, the light and the watcher's calm) */
export function w6Kit(stage = 2): WorldKit {
  return { manifest: w6Manifest(stage), emit: w6Emitters(stage), decorate: w6Decorate(stage), spawn: w6Spawn(stage) };
}

/**
 * The stage as the engine plays it: Dot's first-time line for each new animal MEET_LEAD px before the first of its kind (fillSockets
 * writes proto.hints after the spawn hook runs, so the lines are added here). The hook-up (DESIGN.md B10 piece G) and the curation tool
 * call this after buildGen2Stage for a World 6 stage. Calling it twice changes nothing.
 */
export function w6Finish<S extends { spawnX?: number; proto?: { hints?: StageHint[]; gen2?: Record<string, unknown> } }>(st: S): S {
  const w6 = st.proto?.gen2?.w6 as W6Extras | undefined;
  if (st.proto && w6?.meets?.length) {
    const hints = (st.proto.hints ??= []);
    const first = new Map<string, number>();
    for (const m of w6.meets) first.set(m.kind, Math.min(first.get(m.kind) ?? Infinity, m.x));
    for (const [kind, x] of first) {
      const text = W6_TIPS[kind];
      if (!text || hints.some((h) => h.text === text)) continue;
      hints.push({ x: R(Math.max((st.spawnX ?? 0) + 40, x - MEET_LEAD)), text, pad: text, keys: text });
    }
    hints.sort((a, b) => a.x - b.x);
  }
  return st;
}

/** the filled sockets of one kind of prop or creature, for tests and the curation tool */
export const fillsOf = (fills: FilledSocket[], what: W6PropId | W6CreatureId) => fills.filter((f) => f.what === what);

/**
 * gen2/worlds/w8 — World 8 (the Twilight Treetops) for the new generator: its manifest (the toybox the roll draws from), its emitters (the
 * one piece of code per world that turns a filled prop socket into extras the engine plays) and its kit, `w8Kit(stage)`.
 *
 * Everything comes from the story (reference/STORY-REWRITE.md "World 8: Twilight Treetops", Act III The Iron Road): the light goes, the
 * fireflies come out, Pokey dreams of the petal on his wrist, and Dot comes back wounded with Meeca's note. She is back from the world's
 * first stage (the act card and "Wake up" play before 8-1: storyWorlds.ts), so she teaches again, in her own voice.
 *   creatures   the treetops' hunters, all met before: the ocelot and the jaguar (World 3), the boa guard (1-9), the tayra (World 6),
 *               and the night harpy (World 6), which is 8-8 Night Hunters' own and taught again there (w8Finish).
 *   props       the bat roosts (8-4: a roost wakes on a rhythm and looks along its bough, watcher.ts, so he creeps between the hiding
 *               places: a tree hollow, a leaf curtain), the dark (World 6's dark props, w6Swing.ts: a lit bough, the dark, a lit bough, the
 *               fireflies over every gap) and the treetop scenery from Matt's World 8 sheets (shelf and bark fungus, a bird's nest, the
 *               firefly leaf).
 *   decor       src/assets/w6to10/props-made/w8b, w8c, w8var and kits/w8 (named by their cells; not packed into an atlas yet).
 *   light       dusk (8-1, 8-2), night (8-3 to 8-6), the deep night of the Monarch's wood (8-8, 8-9): stageBackdrops' w8sunset, w8night.
 *
 * Falls are soft (a lower bough and a step out: a miss costs a climb, never a life), so no water in World 8: a gap in the dark is never a
 * blind jump into something deadly (STAGE-RULES §6), and the dark can hold real jumps, lianas and climbs. Nothing stands in the dark (no
 * animal, no flag: levelCheck), so each dark stretch steps down from a lit bough and up onto another.
 *
 * Pure data and pure functions (no canvas, no engine), like w6.ts.
 */
import { G } from '../../protoStage.ts';
import type { StageHint } from '../../protoStage.ts';
import type { Enemy, Platform } from '../../types.ts';
import type { Bush, WatchZone } from '../../watcher.ts';
import type { CreatureDef, FilledSocket, PropDef, PropEmitter, StageSink, WorldKit, WorldManifest } from '../types.ts';
import { W6S_EMIT, W6S_PROPS } from './w6Swing.ts';
import { watchCalm } from './w6.ts';

/** World 8's boughs: their top, depth, and how deep a soft pit's floor lies under its lips (a lower bough, one wide step out) */
export const W8_GROUND = { y: G, bankH: 90, pitDepth: 120 } as const;

// ───────────────────────────── the ids ─────────────────────────────

export const W8_CREATURE = { ocelot: 'ocelot', jaguar: 'jaguar', boa: 'boa', tayra: 'tayra', harpy: 'harpy' } as const;
export type W8CreatureId = (typeof W8_CREATURE)[keyof typeof W8_CREATURE];

export const W8_PROP = {
  /** a tree hollow to hide in (watcher.ts Bush 'wide'; Matt's w8c 'tree-hollow') */
  hollowHide: 'hollowHide',
  /** a leaf curtain to hide behind (Bush 'tall'; w8c 'leaf-curtain') */
  curtainHide: 'curtainHide',
  /** a bat roost: it wakes on a rhythm and looks along its bough (watcher.ts WatchZone over the boughs it stands at the start of) */
  roost: 'roost',
  /** treetop scenery */
  fungus: 'fungus',
  nest: 'nest',
} as const;
export type W8PropId = (typeof W8_PROP)[keyof typeof W8_PROP];

/** the mechanics World 8 teaches, as `teaches` / `uses` keys and Dot's tip keys */
export const W8_LESSON = {
  /** the dark stretches (taught in 8-1 "As the Light Goes": "the fireflies will show the way") */
  dark: 'w8:dark',
  /** the bat roosts (8-4) */
  roost: 'w8:roost',
  /** the moonlight glides (8-6): a gap only the leaf crosses */
  glide: 'w8:glide',
  /** the purge's and the gauntlet's shut shrine (Dot explains the locked exit) */
  hunt: 'w8:hunt',
  fight: 'w8:fight',
  /** the night harpy, taught where first laid in 8-8 and 8-9 (w8Finish) */
  harpy: 'harpy',
} as const;

// ───────────────────────────── the creatures ─────────────────────────────

/** the old generator's bodies (stageGenerator.ts ocelot(), jaguar(), boa(), tayra(), harpy()): size, hp, feet */
export const W8_CREATURES: CreatureDef[] = [
  { id: W8_CREATURE.ocelot, enemy: 'ocelot', threat: 3, terrain: 'flat', minGround: 220, w: 48, h: 28, hp: 2, footY: 18, tags: ['ocelot', 'hunter', 'small', 'topup'] },
  // (the treetops' big cat: World 8's hardest ground animal, so Easy keeps one, softened)
  { id: W8_CREATURE.jaguar, enemy: 'jaguar', threat: 5, terrain: 'flat', minGround: 300, w: 64, h: 38, hp: 3, footY: 24, easyFirst: true, tags: ['jaguar', 'hunter', 'big', 'topup'] },
  // (the coiled guard: it holds its spot and strikes, 1-9's lesson; never walks)
  { id: W8_CREATURE.boa, enemy: 'boa', threat: 3, terrain: 'flat', minGround: 200, w: 58, h: 26, hp: 3, footY: 16, extra: { speed: 1 }, tags: ['boa', 'still', 'topup'] },
  { id: W8_CREATURE.tayra, enemy: 'tayra', threat: 2.5, terrain: 'flat', minGround: 200, w: 46, h: 24, hp: 1, footY: 15, tags: ['tayra', 'hunter', 'small', 'quick', 'topup'] },
  // (the night harpy: crouches, slides, then leaps and stomps; 8-8 and 8-9 only: w8Manifest)
  { id: W8_CREATURE.harpy, enemy: 'harpy', threat: 4, terrain: 'flat', minGround: 260, w: 48, h: 36, hp: 2, footY: 16, tags: ['harpy', 'hunter', 'big', 'night', 'topup'] },
];

/** the stages the night harpy hunts in (Night Hunters, the Monarch's wood) */
export const W8_HARPY_STAGES: readonly number[] = [8, 9];

// ───────────────────────────── the props ─────────────────────────────

/** the watcher's bush sizes (protoStage.ts BUSH_W): a tree hollow is drawn like a wide bush, a leaf curtain like a tall one */
export const W8_HIDE_W = { hollowHide: 170, curtainHide: 124 } as const;

export const W8_PROPS: PropDef[] = [
  { id: W8_PROP.hollowHide, tags: ['hide', 'cover'], w: W8_HIDE_W.hollowHide, minApart: 260, looks: ['tree-hollow'] },
  { id: W8_PROP.curtainHide, tags: ['hide', 'cover'], w: W8_HIDE_W.curtainHide, minApart: 260, looks: ['leaf-curtain'] },
  // (the roost is the beat: its waking is what he waits out, hidden)
  { id: W8_PROP.roost, tags: ['roost'], w: 120, minApart: 500, hazard: true, beat: true },
  { id: W8_PROP.fungus, tags: ['scenery'], w: 100, minApart: 300, looks: ['shelf-fungus', 'bark-fungus', 'glow-mushrooms'] },
  { id: W8_PROP.nest, tags: ['scenery'], w: 90, minApart: 500, looks: ['bird-nest', 'firefly-leaf'] },
  // (the dark's two ends: World 6's dark props, w6Swing.ts)
  ...W6S_PROPS,
];

// ───────────────────────────── the decor ─────────────────────────────

export const W8_DECOR: WorldManifest['decor'] = [
  // along the boughs (w8b, w8var): knot perches and forks, or fungus and stumps
  { id: 'w8-knots', job: 'bank', items: [{ n: 'knot-perch', w: [70, 100] }, { n: 'branch-fork', w: [120, 160] }, { n: 'stump-b', w: [80, 110] }], every: [180, 300] },
  { id: 'w8-fungus', job: 'bank', items: [{ n: 'shelf-fungus', w: [80, 120] }, { n: 'bark-fungus', w: [90, 130] }, { n: 'night-flowers', w: [60, 90] }], every: [170, 280] },
  // above them: the twisted vine and the mossy bough (kits/w8), or the rope bridge and leaf hammock hung behind (w8b)
  { id: 'w8-vines', job: 'hanging', items: [{ n: 'twist-vine', w: [40, 60] }, { n: 'moss-bough', w: [160, 220] }], every: [500, 800] },
  { id: 'w8-bridges', job: 'hanging', items: [{ n: 'rope-bridge', w: [200, 260] }, { n: 'leaf-hammock', w: [140, 180] }, { n: 'buttress-b', w: [90, 120] }], every: [700, 1100] },
];

// ───────────────────────────── the lines ─────────────────────────────

/**
 * Dot's lines (under 10 words). New ones need Matt's approval (STAGE-RULES §1 "Story"); the glide line is World 4's (dotLinesData
 * hint.4-7.far) and the harpy's World 6's (w6.ts W6_TIPS).
 */
export const W8_TIPS: Record<string, string> = {
  [W8_LESSON.dark]: 'Dark ahead. Stay near the fireflies.', // (new, needs Matt's approval)
  [W8_LESSON.roost]: "Bats! Hide while they're looking. Go when they sleep.", // (new, needs Matt's approval)
  [W8_LESSON.glide]: 'Too far! Flick up and hold to glide.',
  [W8_LESSON.hunt]: "The shrine's shut. Drive the hunters off first!", // (new, needs Matt's approval)
  [W8_LESSON.fight]: "The shrine's shut. Fight through to open it.", // (new for World 8: World 6's line, needs Matt's approval there)
  [W8_LESSON.harpy]: 'A harpy! It slides, then stomps. Jump clear.',
};
/** the lines that are new in World 8 (the report lists them for Matt) */
export const W8_NEW_LINES: readonly string[] = [W8_TIPS[W8_LESSON.dark], W8_TIPS[W8_LESSON.roost], W8_TIPS[W8_LESSON.hunt]];

// ───────────────────────────── the manifest ─────────────────────────────

/** the stages of World 8 gen2 builds (8-7 The Tallest Tree is an ascent, hand-built; 8-10 is the Night-Wing Monarch's lair) */
export const W8_GEN2_STAGES = ['8-1', '8-2', '8-3', '8-4', '8-5', '8-6', '8-8', '8-9'] as const;

export const W8_MANIFEST: WorldManifest = {
  world: 8,
  name: 'Twilight Treetops',
  moves: ['double', 'punch', 'swing', 'climb', 'rope', 'glide'],
  ground: { y: W8_GROUND.y, bankH: W8_GROUND.bankH, style: 'log' },
  pit: 'soft',
  pitDepth: W8_GROUND.pitDepth,
  corridor: { top: G - 180, bottom: G + 80, soft: 60 },
  creatures: W8_CREATURES,
  props: W8_PROPS,
  pairs: [],
  decor: W8_DECOR,
  flowers: ['lotus', 'orchid'],
  sections: [],
  handBuilt: ['8-7', '8-10'],
  // (the dark is 8-1's, the roosts 8-4's, the moonlight glides 8-6's; the shut shrine is said in each fight stage's own gate)
  lessons: { ocelot: '3-9', jaguar: '3-9', boa: '1-9', tayra: '6-2', harpy: '8-8', [W8_LESSON.dark]: '8-1', [W8_LESSON.roost]: '8-4', [W8_LESSON.glide]: '8-6' },
  tips: W8_TIPS,
};

// ───────────────────────────── the emitters ─────────────────────────────

export type W8Mood = 'dusk' | 'night' | 'deepNight';
export const w8Mood = (stage: number): W8Mood => (stage <= 2 ? 'dusk' : stage <= 6 ? 'night' : 'deepNight');

/** World 8's own extras (in sink.extras.w8, so proto.gen2.w8): what the hook-up hands the drawing and the engine */
export interface W8Extras {
  mood: W8Mood;
  scenery?: Array<{ n: string; x: number; b: number; w: number; flip?: boolean }>;
  decor?: Array<{ n: string; x: number; b: number; w: number; flip?: boolean }>;
  /** where each hiding place stands and what it is drawn as (the watcher's bushes are proto.bushes: these are their looks) */
  hides?: Array<{ x: number; w: number; y: number; look: string }>;
  /** the bat roosts (where each watched stretch's roost hangs: over its start) */
  roosts?: Array<{ x: number; y: number }>;
  /** every night harpy laid: w8Finish puts Dot's line before the first */
  meets?: Array<{ kind: string; x: number }>;
}

const hash01 = (x: number, salt: number): number => {
  const s = Math.sin(x * 12.9898 + salt * 78.233) * 43758.5453;
  return s - Math.floor(s);
};
const R = Math.round;

export function w8Of(out: StageSink, stage = 1): W8Extras {
  return (out.extras.w8 ??= { mood: w8Mood(stage) }) as W8Extras;
}
const look = (p: PropDef, x: number, salt: number) => (p.looks?.length ? p.looks[Math.floor(hash01(x, salt) * p.looks.length)] : p.id);

/** the platform a socket's spot stands on */
const pieceAt = (out: StageSink, x: number, y: number) =>
  out.platforms.find((p) => Math.abs(p.y - y) < 1 && x >= p.x && x <= p.x + p.width && p.type !== 'fragile');

/** the longest a roost watches (px) */
const ROOST_MAX = 1400;
/** a watched stretch runs this far past the last hiding place along it */
const ROOST_PAST = 120;

/** the boughs a roost looks along: the piece under it and those walked on from it with no gap between (a knot up and down), to ROOST_MAX */
function roostRun(out: StageSink, x: number, y: number): [number, number] | null {
  const p0 = pieceAt(out, x, y);
  if (!p0) return null;
  const near = out.platforms.filter((p) => p.type !== 'fragile' && Math.abs(p.y - p0.y) <= 60);
  let x1 = p0.x + p0.width;
  for (let grown = true; grown && x1 - p0.x < ROOST_MAX; ) {
    grown = false;
    for (const p of near) if (Math.abs(p.x - x1) <= 2 && p.x + p.width > x1) (x1 = Math.min(p.x + p.width, p0.x + ROOST_MAX)), (grown = true);
  }
  return [p0.x, x1];
}

/** each watched stretch clipped to the hiding places along it (being seen with nowhere to go is unfair): pass 6, after they are laid */
export function clipRoosts(out: StageSink): void {
  const zones = out.proto.watch;
  if (!zones?.length) return;
  const bushes = out.proto.bushes ?? [];
  out.proto.watch = zones.flatMap((z) => {
    const inside = bushes.filter((b) => b.x + b.w > z.x0 && b.x < z.x1);
    if (!inside.length) return [];
    return [{ ...z, x1: R(Math.min(z.x1, Math.max(...inside.map((b) => b.x + b.w)) + ROOST_PAST)) }];
  });
}

/** the emitters, for a stage of World 8 (its number sets the roosts' calm and the light) */
export function w8Emitters(stage: number): Record<string, PropEmitter> {
  const hide = (kind: Bush['kind']): PropEmitter => (f, p, out) => {
    const w = W8_HIDE_W[p.id as keyof typeof W8_HIDE_W] ?? 150;
    const b: Bush = { x: R(f.x - w / 2), w, y: f.y, kind };
    (out.proto.bushes ??= []).push(b);
    (w8Of(out, stage).hides ??= []).push({ x: b.x, w, y: f.y, look: look(p, f.x, 1) });
  };
  // (the roosts wake a little more often than World 6's water watched: World 8 sits above it on the band, `stage + 2`)
  const calm = (lesson: boolean) => watchCalm(Math.min(9, stage + 2), lesson);
  return {
    ...W6S_EMIT,
    hollowHide: hide('wide'),
    curtainHide: hide('tall'),
    roost: (f, _p, out) => {
      const own = f.socket.startsWith('roostHere') ? pieceAt(out, f.x, f.y) : undefined;
      const run = own ? [own.x, own.x + own.width] : roostRun(out, f.x, f.y) ?? [f.x - 300, f.x + 300];
      const z: WatchZone = { x0: R(run[0] + 40), x1: R(run[1] - 40), calm: calm(f.socket === 'roostLesson') };
      const zones = (out.proto.watch ??= []);
      if (!zones.some((q) => q.x0 < z.x1 && z.x0 < q.x1)) {
        zones.push(z);
        (w8Of(out, stage).roosts ??= []).push({ x: R(run[0] + 60), y: f.y });
      }
    },
    fungus: (f, p, out) => void (w8Of(out, stage).scenery ??= []).push({ n: look(p, f.x, 3), x: f.x, b: f.y, w: R(90 + 40 * hash01(f.x, 4)) }),
    nest: (f, p, out) =>
      void (w8Of(out, stage).scenery ??= []).push({ n: look(p, f.x, 5), x: f.x, b: f.y, w: R(80 + 30 * hash01(f.x, 6)), ...(hash01(f.x, 7) < 0.5 ? { flip: true } : {}) }),
  };
}

/** the decorator (pass 6): the chosen decor sets into W8Extras.decor, and the roosts' stretches clipped to their hiding places */
export function w8Decorate(stage: number): NonNullable<WorldKit['decorate']> {
  return (items, out) => {
    clipRoosts(out);
    const decor = (w8Of(out, stage).decor ??= []);
    for (const it of items) decor.push({ n: it.n, x: it.x, b: it.y, w: it.w, ...(hash01(it.x, 11) < 0.5 ? { flip: true } : {}) });
  };
}

/** every animal kept on its patch (never off a bough into a gap), facing a rolled way; each harpy noted for w8Finish */
export function w8Spawn(stage = 1): NonNullable<WorldKit['spawn']> {
  return (e: Enemy, c: CreatureDef, out: StageSink) => {
    e.edgeMinX = e.patrolMinX;
    e.edgeMaxX = e.patrolMaxX;
    e.facing = hash01(e.x, 12) < 0.5 ? -1 : 1;
    if (c.id === W8_CREATURE.harpy) (w8Of(out, stage).meets ??= []).push({ kind: c.id, x: e.patrolMinX });
  };
}

/** Dot's line comes this far before the first harpy (px): she flies in and talks before it can reach him */
export const W8_MEET_LEAD = 520;

/** World 8's base kit for one stage (the sections are added by w8Game.ts) */
export function w8Kit(stage: number): WorldKit {
  const creatures = W8_HARPY_STAGES.includes(stage) ? W8_CREATURES : W8_CREATURES.filter((c) => c.id !== W8_CREATURE.harpy);
  return { manifest: { ...W8_MANIFEST, creatures }, emit: w8Emitters(stage), decorate: w8Decorate(stage), spawn: w8Spawn(stage) };
}

/** the stage that teaches the night harpy (8-8 Night Hunters; 8-9 comes after it, so it is not taught twice) */
export const W8_HARPY_LESSON = 8;

/**
 * The stage as the engine plays it: the pits' blocks drawn as boughs (below); in 8-8, Dot's harpy line W8_MEET_LEAD px before the first night harpy (fillSockets writes
 * proto.hints after the spawn hook runs, so the line is added here). Calling it twice changes nothing.
 */
export function w8Finish<S extends { spawnX?: number; platforms?: Platform[]; config?: { miniIndex: number }; proto?: { hints?: StageHint[]; gen2?: Record<string, unknown> } }>(st: S): S {
  const w8 = st.proto?.gen2?.w8 as W8Extras | undefined;
  // (the soft pits' floors and their steps out are the pipeline's 'moss_stone' blocks, drawn as pale stone pillars in the treetops: they
  // are lower boughs here, in the kit's bark, each reaching down like a bough (its top unchanged, so nothing the check walks moves))
  for (const p of st.platforms ?? []) {
    if (p.type !== 'solid' || p.style !== 'moss_stone') continue;
    p.style = 'log';
    p.height = Math.max(p.height, W8_GROUND.bankH + 70);
  }
  if (st.proto && w8?.meets?.length && st.config?.miniIndex === W8_HARPY_LESSON) {
    const hints = (st.proto.hints ??= []);
    const x = Math.min(...w8.meets.map((m) => m.x));
    const text = W8_TIPS[W8_LESSON.harpy];
    if (!hints.some((h) => h.text === text)) hints.push({ x: R(Math.max((st.spawnX ?? 0) + 40, x - W8_MEET_LEAD)), text, pad: text, keys: text });
    hints.sort((a, b) => a.x - b.x);
  }
  return st;
}

export const fillsOf8 = (fills: FilledSocket[], what: string) => fills.filter((f) => f.what === what);

/**
 * gen2/worlds/w9 — World 9 (the Volcanic Jungle) for the new generator: its manifest (the toybox the roll draws from), its emitters (the
 * one piece of code per world that turns a filled prop socket into extras the engine plays) and its kit, `w9Kit(stage)`.
 *
 * Everything comes from the story (stagePlan.ts World 9, Act III The Iron Road): basalt ledges, thermal vents and glowing ember canopies,
 * the Magma Drake's doorstep ("First he says, 'Visitor.' Then he says, 'Intruder.'"), and Lieutenant Pell's dropped thread. Dot is with
 * Pokey all through it (wayside.ts dotPresent), so she names each new danger, once, the first time (never the move: STAGE-RULES §1).
 *   hazards     LAVA: the chasms between the basalt are lava on Normal (pit 'void': the pipeline's water line, painted as lava, lavaArt.ts),
 *               a life; GEYSERS: vents on open ground that rumble (the warning) and erupt on a beat (zones.ts geyser, a `geyser` prop's
 *               emitter lays the column over its piece); VENTS in the chasms (9-5 Vent Riding): short columns low in a soft pit whose
 *               warm air lifts an open leaf (zones.ts ventLift: a gift, never a must); CRUMBLING basalt (World 7's crumble tiles in the
 *               kit's cracked slabs: never needed, a hurry over a cooled channel that walks on underneath).
 *   creatures   all met before, so none needs a first line: the cats (World 3), the boa guard (1-9), the tayra (6-2), the harpy (6-5).
 *   props       the geysers and vents, the hiding places of 9-4 (an obsidian spire, an ash fern: watcher.ts bushes, the eagle watching
 *               from above as everywhere), and the scenery of Matt's World 9 sheets (src/assets/w6to10/props-made w9c, w9c-b: the young
 *               ohia tree, the smoke crack, the charred log, the obsidian spire, the ash fern), drawn by w9Art.ts.
 *   falls       on Normal a fall into a chasm costs a life (the lava); Dot names it before the first one (W9_TIPS.water, the pipeline's
 *               void warning). The second-jump, glide and start gaps keep a soft crust floor (w9Falls, as World 8's), and Easy's falls are
 *               all soft (the pipeline: Easy's falls on land are soft). Gaps over the lava are plain jumps of a half to four fifths of the
 *               envelope, never blind (each is in view a second ahead, lit by its own lava), never a second jump: World 9 must sit above
 *               World 8 on the band (STAGE-RULES §1b), and with a third-of-a-jump chasm it measured below World 6.
 *   light       dawn (9-1 to 9-3), day under the ash (9-4 to 9-6), the red night of the Drake's hoard (9-8, 9-9): the backdrops
 *               w9dawn-far, w9-far, w9night-far (stageBackdrops.ts).
 *
 * Pure data and pure functions (no canvas, no engine), like w6.ts.
 */
import { G } from '../../protoStage.ts';
import type { StageHint } from '../../protoStage.ts';
import type { Enemy, Platform, Vine } from '../../types.ts';
import type { Bush, WatchZone } from '../../watcher.ts';
import type { Zone } from '../../zones.ts';
import type { CreatureDef, FilledSocket, PlaceRule, PropDef, PropEmitter, SectionTemplate, StageSink, WorldKit, WorldManifest } from '../types.ts';
import { clipWatches, watchCalm } from './w6.ts';

/** World 9's basalt: its top, depth, and how deep a soft pit's crust floor lies under its lips (one wide step out, as World 6's 110) */
export const W9_GROUND = { y: G, bankH: 90, pitDepth: 110 } as const;

// ───────────────────────────── the ids (the swing sections and the puzzle rooms use these: keep them stable) ─────────────────────────────

export const W9_CREATURE = { ocelot: 'ocelot', jaguar: 'jaguar', boa: 'boa', tayra: 'tayra', harpy: 'harpy' } as const;
export type W9CreatureId = (typeof W9_CREATURE)[keyof typeof W9_CREATURE];

export const W9_PROP = {
  /** a vent on open ground: rumbles, then erupts in a column on a beat (zones.ts geyser over its piece) */
  geyser: 'geyser',
  /** a vent low in a chasm (9-5): a short column under the lip whose warm air lifts an open leaf */
  vent: 'vent',
  /** an obsidian spire to hide behind (watcher.ts Bush 'wide') */
  rockHide: 'rockHide',
  /** an ash fern to hide in (Bush 'tall') */
  fernHide: 'fernHide',
  /** the stealth stage's watched stretch (the eagle over the doorstep, watcher.ts) */
  watch: 'watch',
  /** scenery (Matt's World 9 sheets): the young ohia, the charred log, the smoke crack */
  ohia: 'ohia',
  log: 'log',
  smoke: 'smoke',
  /** a flare slab on the route (GRAB-BAG.md N5): its cracks glow, then flare (a low geyser zone, w9HeatArt.ts) */
  flare: 'flare',
  /** a lavafall pouring from above (N9): drips, then the column (a geyser zone from the sky, w9HeatArt.ts) */
  lavafall: 'lavafall',
} as const;
export type W9PropId = (typeof W9_PROP)[keyof typeof W9_PROP];

/** the tags sockets ask for (Socket.allow) */
export const W9_TAG = { flare: 'flare', lavafall: 'lavafall', geyser: 'geyser', vent: 'vent', hide: 'hide', cover: 'cover', watch: 'watch', scenery: 'scenery', hunter: 'hunter', big: 'big', small: 'small', still: 'still', quick: 'quick' } as const;

/** the mechanics World 9 teaches, as `teaches` / `uses` keys and Dot's tip keys */
export const W9_LESSON = {
  /** the geysers (9-1 teaches them: a lone vent on a wide flat with a long quiet spell, before any other) */
  geyser: 'w9:geyser',
  /** the warm air over the vents (9-5 Vent Riding) */
  vent: 'w9:vent',
  /** the crumbling basalt over the cooled channels */
  basalt: 'w9:basalt',
  /** the watched doorstep (9-4) */
  watch: 'w9:watch',
  /** the purge's and the gauntlet's shut shrine, the search's (Dot explains the locked exit, STAGE-RULES §1) */
  hunt: 'w9:hunt',
  fight: 'w9:fight',
  threads: 'w9:threads',
  /** the moving logs: the pumice rafts (9-1 teaches them; the logs of 9-5 and 9-9 ride the same way) and the piston columns (9-8) */
  raft: 'w9:raft',
  piston: 'w9:piston',
  /** the flare slabs (9-5 teaches them; 9-8 again) and the lavafalls (9-6 teaches them; 9-9 again) */
  flare: 'w9:flare',
  lavafall: 'w9:lavafall',
  /** the lava surges down the cooled channels (9-6) */
  surge: 'w9:surge',
  /** the hot ash wind (9-1 teaches it as a headwind; 9-5's carries the glides) */
  gust: 'w9:gust',
  /** the sinking ember slabs (9-3 teaches them; 9-9 again) */
  sink: 'w9:sink',
  /** the ash caps, World 9's bounce plant (bounceArt.ts cap-w9; 9-1 teaches them, 9-6 again) */
  cap: 'w9:cap',
} as const;

// ───────────────────────────── the creatures ─────────────────────────────

/**
 * the old generator's bodies (stageGenerator.ts ocelot(), jaguar(), boa(), tayra(), harpy()): size, hp, feet. Their threat costs are
 * World 9's own, lower than World 6's and 8's (the lead, 2026-10-29: World 9 clears World 8's band with more hunters on the flats, every
 * one already met): a section's budget buys more of them
 */
export const W9_CREATURES: CreatureDef[] = [
  { id: W9_CREATURE.ocelot, enemy: 'ocelot', threat: 2, terrain: 'flat', minGround: 220, w: 48, h: 28, hp: 2, footY: 18, tags: ['ocelot', W9_TAG.hunter, W9_TAG.small, 'topup'] },
  // (the volcano's big cat: World 9's hardest ground animal, so Easy keeps one, softened)
  { id: W9_CREATURE.jaguar, enemy: 'jaguar', threat: 3.5, terrain: 'flat', minGround: 300, w: 64, h: 38, hp: 3, footY: 24, easyFirst: true, tags: ['jaguar', W9_TAG.hunter, W9_TAG.big, 'topup'] },
  // (the coiled guard: it holds its spot and strikes, 1-9's lesson; never walks)
  { id: W9_CREATURE.boa, enemy: 'boa', threat: 2, terrain: 'flat', minGround: 200, w: 58, h: 26, hp: 3, footY: 16, extra: { speed: 1 }, tags: ['boa', W9_TAG.still, 'topup'] },
  { id: W9_CREATURE.tayra, enemy: 'tayra', threat: 1.5, terrain: 'flat', minGround: 200, w: 46, h: 24, hp: 1, footY: 15, tags: ['tayra', W9_TAG.hunter, W9_TAG.small, W9_TAG.quick, 'topup'] },
  { id: W9_CREATURE.harpy, enemy: 'harpy', threat: 3, terrain: 'flat', minGround: 260, w: 48, h: 36, hp: 2, footY: 16, tags: ['harpy', W9_TAG.hunter, W9_TAG.big, 'topup'] },
];

// ───────────────────────────── the props ─────────────────────────────

/** the watcher's bush sizes (protoStage.ts BUSH_W): an obsidian spire is drawn like a wide bush, an ash fern like a tall one */
export const W9_HIDE_W = { rockHide: 170, fernHide: 124 } as const;

export const W9_PROPS: PropDef[] = [
  // (the geyser is the beat: its rumble and burst are what he waits out; `w` keeps animals and other props clear of its column)
  { id: W9_PROP.geyser, tags: [W9_TAG.geyser], w: 150, minApart: 200, hazard: true, beat: true },
  { id: W9_PROP.vent, tags: [W9_TAG.vent], w: 120, minApart: 200, beat: true },
  { id: W9_PROP.rockHide, tags: [W9_TAG.hide, W9_TAG.cover], w: W9_HIDE_W.rockHide, minApart: 260, looks: ['obsidian'] },
  { id: W9_PROP.fernHide, tags: [W9_TAG.hide, W9_TAG.cover], w: W9_HIDE_W.fernHide, minApart: 260, looks: ['ash-fern'] },
  { id: W9_PROP.watch, tags: [W9_TAG.watch], w: 120, minApart: 500, hazard: true, beat: true },
  { id: W9_PROP.ohia, tags: [W9_TAG.scenery], w: 90, minApart: 400, looks: ['young-tree'] },
  { id: W9_PROP.log, tags: [W9_TAG.scenery], w: 140, minApart: 500, looks: ['charred-log'] },
  { id: W9_PROP.smoke, tags: [W9_TAG.scenery], w: 140, minApart: 500, looks: ['smoke-crack'] },
  // (the slab is the flat it lies on, nearly: animals and other props keep off it; two on one flat stand apart, the check's pocket)
  { id: W9_PROP.flare, tags: [W9_TAG.flare], w: 180, minApart: 290, hazard: true, beat: true },
  { id: W9_PROP.lavafall, tags: [W9_TAG.lavafall], w: 150, minApart: 220, hazard: true, beat: true },
];

// ───────────────────────────── the decor ─────────────────────────────

/** the scenery sets along the basalt (w9c / w9c-b cells: w9SceneryArt.ts draws them), rotated by the roll (artRoll.ts rollLook) */
export const W9_DECOR: WorldManifest['decor'] = [
  { id: 'w9-ohia', job: 'bank', items: [{ n: 'young-tree', w: [70, 100] }, { n: 'ash-fern', w: [90, 120] }], every: [260, 420] },
  { id: 'w9-cinder', job: 'bank', items: [{ n: 'obsidian', w: [60, 90] }, { n: 'smoke-crack', w: [120, 160] }], every: [300, 460] },
  // (the W9 props sheet's vent rock, lava dome and scorched bridge: painted, and drawn nowhere until now (Matt: use all the art))
  { id: 'w9-ruin', job: 'bank', items: [{ n: 'vent-rock', w: [100, 130] }, { n: 'scorched-bridge', w: [130, 160] }, { n: 'lava-dome', w: [90, 120] }], every: [320, 480] },
];

// ───────────────────────────── the lines ─────────────────────────────

/**
 * Dot's lines (under 10 words): she names the danger the first time, never the move (STAGE-RULES §1, the lead's bar). All new: the lead
 * approves each before merge. `water` is the pipeline's warning before the first deadly chasm (the lava, on Normal).
 */
export const W9_TIPS: Record<string, string> = {
  water: "That's lava down there!", // (new, needs the lead's approval)
  [W9_LESSON.geyser]: 'The ground is rumbling. Vents!', // (new, needs the lead's approval)
  [W9_LESSON.vent]: 'Feel that? Warm air off the vents.', // (new, needs the lead's approval)
  [W9_LESSON.basalt]: 'That rock is cracked through.', // (new, needs the lead's approval)
  [W9_LESSON.watch]: 'Something big is watching from up there.', // (new, needs the lead's approval)
  [W9_LESSON.hunt]: "The shrine's shut. Drive the hunters off first!", // (World 8's line)
  [W9_LESSON.fight]: "The shrine's shut. Fight through to open it.", // (World 6's line)
  [W9_LESSON.threads]: "The shrine's shut. Find Pell's threads first.", // (new, needs the lead's approval)
  [W9_LESSON.raft]: 'Those rafts rise and sink. Watch them.', // (new, needs Matt's approval: GRAB-BAG.md N1)
  [W9_LESSON.piston]: 'These stone columns rise and fall.', // (new, needs Matt's approval: GRAB-BAG.md N3)
  [W9_LESSON.flare]: 'Those slabs flare up when they glow.', // (new, needs Matt's approval: GRAB-BAG.md N5)
  [W9_LESSON.lavafall]: 'Lava pours from up there. Watch the drips.', // (new, needs Matt's approval: GRAB-BAG.md N9)
  [W9_LESSON.surge]: 'Lava surges down the channel. Listen!', // (new, needs Matt's approval: GRAB-BAG.md N6)
  [W9_LESSON.gust]: "Hot wind! It'll push you back.", // (new, needs Matt's approval: GRAB-BAG.md N7)
  [W9_LESSON.sink]: 'Ember slabs sink when you stand on them.', // (new, needs Matt's approval: GRAB-BAG.md N4)
  [W9_LESSON.cap]: 'Ash caps! Bounce up to the high rock.', // (new, needs Matt's approval: GRAB-BAG.md N10)
};
/** the lines that are new in World 9 (the report lists them for the lead) */
export const W9_NEW_LINES: readonly string[] = ['water', W9_LESSON.geyser, W9_LESSON.vent, W9_LESSON.basalt, W9_LESSON.watch, W9_LESSON.threads, W9_LESSON.raft, W9_LESSON.piston, W9_LESSON.flare, W9_LESSON.lavafall, W9_LESSON.surge, W9_LESSON.gust, W9_LESSON.sink, W9_LESSON.cap].map((k) => W9_TIPS[k]);

// ───────────────────────────── the manifest ─────────────────────────────

/** the stages of World 9 gen2 builds (9-2 Rising Heat and 9-7 Lava Steps are ascents, hand-built; 9-10 is the Magma Drake's lair) */
export const W9_GEN2_STAGES = ['9-1', '9-3', '9-4', '9-5', '9-6', '9-8', '9-9'] as const;

export const W9_MANIFEST: WorldManifest = {
  world: 9,
  name: 'Volcanic Jungle',
  moves: ['double', 'punch', 'swing', 'climb', 'rope', 'glide'],
  ground: { y: W9_GROUND.y, bankH: W9_GROUND.bankH, style: 'log' },
  // (the lava: a life on Normal; Easy's falls are soft, and so are the gaps w9Falls marks)
  pit: 'void',
  pitDepth: W9_GROUND.pitDepth,
  corridor: { top: G - 180, bottom: G + 80, soft: 60 },
  creatures: W9_CREATURES,
  props: W9_PROPS,
  pairs: [],
  decor: W9_DECOR,
  // (the look is the world's own fire-coloured pool: flowerSprites.ts)
  flowers: ['hibiscus', 'orchid'],
  sections: [],
  handBuilt: ['9-2', '9-7', '9-10'],
  // (the geysers are 9-1's, the warm air 9-5's, the doorstep's eye 9-4's; the shut shrine is said in each gate)
  lessons: { ocelot: '3-9', jaguar: '3-9', boa: '1-9', tayra: '6-2', harpy: '6-5', [W9_LESSON.geyser]: '9-1', [W9_LESSON.vent]: '9-5', [W9_LESSON.watch]: '9-4', [W9_LESSON.raft]: '9-1', [W9_LESSON.piston]: '9-5', [W9_LESSON.flare]: '9-5', [W9_LESSON.lavafall]: '9-4', [W9_LESSON.surge]: '9-4', [W9_LESSON.gust]: '9-1', [W9_LESSON.sink]: '9-3', [W9_LESSON.cap]: '9-1' },
  tips: W9_TIPS,
};

// ───────────────────────────── the emitters ─────────────────────────────

export type W9Mood = 'dawn' | 'day' | 'night';
export const w9Mood = (stage: number): W9Mood => (stage <= 3 ? 'dawn' : stage <= 6 ? 'day' : 'night');

/** World 9's own extras (in sink.extras.w9, so proto.gen2.w9): what the hook-up hands the drawing */
export interface W9Extras {
  mood: W9Mood;
  scenery?: Array<{ n: string; x: number; b: number; w: number; flip?: boolean }>;
  decor?: Array<{ n: string; x: number; b: number; w: number; flip?: boolean }>;
  /** where each hiding place stands and what it is drawn as (the watcher's bushes are proto.bushes: these are their looks) */
  hides?: Array<{ x: number; w: number; y: number; look: string }>;
}

const hash01 = (x: number, salt: number): number => {
  const s = Math.sin(x * 12.9898 + salt * 78.233) * 43758.5453;
  return s - Math.floor(s);
};
const R = Math.round;

export function w9Of(out: StageSink, stage = 1): W9Extras {
  return (out.extras.w9 ??= { mood: w9Mood(stage) }) as W9Extras;
}
const look = (p: PropDef, x: number, salt: number) => (p.looks?.length ? p.looks[Math.floor(hash01(x, salt) * p.looks.length)] : p.id);

/** the platform a socket's spot stands on */
const pieceAt = (out: StageSink, x: number, y: number): Platform | undefined =>
  out.platforms.find((p) => Math.abs(p.y - y) < 1 && x >= p.x && x <= p.x + p.width && p.type !== 'fragile');

/**
 * A geyser's column (zones.ts geyser, the old generator's numbers: 72 px wide, 250 tall, 1.3 s of rumble): its quiet spell shrinks
 * through the world (2.2 s at 9-1 to 2.0 s at 9-9: World 9 sits above World 8), never under the level check's 2 s; the lesson's (a socket
 * named `geyserLesson`) is a long 4 s, so the first one is watched before it is crossed. Active 1.1 s, never over the check's 1.2.
 */
export const GEYSER = { w: 72, h: 250, warn: 1.3, lessonIdle: 4.0 } as const;
export function geyserBeat(stage: number, lesson: boolean): { idle: number; active: number } {
  if (lesson) return { idle: GEYSER.lessonIdle, active: 0.9 };
  // (World 9 sits above World 8: 2.2 s at 9-1 down to the check's floor of 2.0 at 9-9)
  const k = Math.max(0, Math.min(1, (stage - 1) / 8));
  return { idle: Math.round((2.2 - 0.2 * k) * 10) / 10, active: 1.1 };
}
/** a vent in a chasm: a short column (its top under the lip, so the eruption never reaches the route) on a slow, lazy beat */
export const VENT = { w: 80, h: 70, warn: 1.3, idle: 3.2, active: 0.9 } as const;
/** a flare slab (N5): a zone as wide as the slab and low (a jump clears it), the geyser's warning, a slower beat (it lies on the route) */
export const FLARE = { w: 160, h: 64, warn: 1.3, idle: 2.6, active: 1.0 } as const;
/** a lavafall (N9): a column from far above the frame to the ground (no jump clears it: wait it out), drips first */
export const LAVAFALL = { w: 74, h: 900, warn: 1.4, idle: 2.4, active: 1.0 } as const;
/** the longer rest Easy gives the flares, lavafalls and surges between bursts (s) */
export const EASY_HEAT_CALM = 1.2;

/** the longest a watched stretch runs (px): a section's run of basalt, not the stage */
const WATCH_MAX = 1400;
/** the basalt the eagle looks along: the piece under the spot and those walked on from it with no gap between (a knob or a step up
 *  and down: the same run), up to WATCH_MAX; a chasm ends it */
function watchedRun(out: StageSink, x: number, y: number): [number, number] | null {
  const p0 = pieceAt(out, x, y);
  if (!p0) return null;
  const near = out.platforms.filter((p) => p.type !== 'fragile' && Math.abs(p.y - p0.y) <= 60);
  let x1 = p0.x + p0.width;
  for (let grown = true; grown && x1 - p0.x < WATCH_MAX; ) {
    grown = false;
    for (const p of near) if (Math.abs(p.x - x1) <= 2 && p.x + p.width > x1) (x1 = Math.min(p.x + p.width, p0.x + WATCH_MAX)), (grown = true);
  }
  return [p0.x, x1];
}

/** a chasm's floor past a lip at (x, lipY): the deepest solid piece starting within a chasm's width past it, under the lip (null: none) */
export function ventFloor(platforms: readonly Platform[], x: number, lipY: number): Platform | null {
  const under = platforms.filter((p) => p.type === 'solid' && p.y > lipY + 60 && p.y < lipY + 260 && p.x >= x - 4 && p.x < x + 200 && p.width >= 140);
  return under.sort((a, b) => b.y - a.y || a.x - b.x)[0] ?? null;
}

/** the emitters, for a stage of World 9 (its number sets the geysers' beat, the watcher's calm and the light) */
export function w9Emitters(stage: number, easy = false): Record<W9PropId, PropEmitter> {
  // (Easy's heat hazards rest longer between bursts: softened, never removed, STAGE-RULES §1b)
  const calmer = easy ? EASY_HEAT_CALM : 0;
  const hide = (kind: Bush['kind']): PropEmitter => (f, p, out) => {
    const w = W9_HIDE_W[p.id as keyof typeof W9_HIDE_W] ?? 150;
    const b: Bush = { x: R(f.x - w / 2), w, y: f.y, kind, look: look(p, f.x, 1) };
    (out.proto.bushes ??= []).push(b);
    (w9Of(out, stage).hides ??= []).push({ x: b.x, w, y: f.y, look: b.look! });
  };
  const scenery = (salt: number, w0: number, dw: number): PropEmitter => (f, p, out) =>
    void (w9Of(out, stage).scenery ??= []).push({ n: look(p, f.x, salt), x: f.x, b: f.y, w: R(w0 + dw * hash01(f.x, salt + 1)), ...(hash01(f.x, salt + 2) < 0.5 ? { flip: true } : {}) });
  // (the watcher wakes a little more often than World 8's roosts: World 9 sits above it on the band, `stage + 3`)
  const calm = (lesson: boolean) => watchCalm(Math.min(9, stage + 3), lesson);
  return {
    geyser: (f, _p, out) => {
      const lesson = f.socket === 'geyserLesson';
      const { idle, active } = geyserBeat(stage, lesson);
      const period = idle + GEYSER.warn + active;
      // (each on its own beat, rolled from its spot: two in a row are never in step, so there is always a pocket that is quiet)
      const z: Zone = {
        kind: 'geyser', x0: R(f.x - GEYSER.w / 2), x1: R(f.x + GEYSER.w / 2), top: f.y - GEYSER.h, bottom: f.y + 14, baseY: f.y, dir: 1,
        period, warn: GEYSER.warn, active, offset: Math.round(hash01(f.x, 21) * period * 10) / 10, force: 0,
      };
      out.zones.push(z);
    },
    vent: (f, _p, out) => {
      // (the socket sits on the take-off's lip, its far end: the vent stands on the chasm's crust floor past it, the floor's middle or
      // 160 px out, whichever is nearer, clear of the steps back up against the near wall)
      const floor = ventFloor(out.platforms, f.x, f.y);
      if (!floor) return;
      const x = Math.min(floor.x + floor.width / 2, Math.max(floor.x + VENT.w, f.x + 160));
      const y = floor.y;
      const period = VENT.idle + VENT.warn + VENT.active;
      out.zones.push({
        kind: 'geyser', look: 'vent', x0: R(x - VENT.w / 2), x1: R(x + VENT.w / 2), top: y - VENT.h, bottom: y + 14, baseY: y, dir: 1,
        period, warn: VENT.warn, active: VENT.active, offset: Math.round(hash01(f.x, 23) * period * 10) / 10, force: 0,
      });
    },
    flare: (f, _p, out) => {
      const lesson = f.socket === 'flareLesson';
      const idle = (lesson ? GEYSER.lessonIdle : FLARE.idle) + calmer;
      const period = idle + FLARE.warn + FLARE.active;
      out.zones.push({
        kind: 'geyser', look: 'flare', x0: R(f.x - FLARE.w / 2), x1: R(f.x + FLARE.w / 2), top: f.y - FLARE.h, bottom: f.y + 14, baseY: f.y, dir: 1,
        period, warn: FLARE.warn, active: FLARE.active, offset: Math.round(hash01(f.x, 25) * period * 10) / 10, force: 0,
      });
    },
    lavafall: (f, _p, out) => {
      const lesson = f.socket === 'lavafallLesson';
      const idle = (lesson ? GEYSER.lessonIdle : LAVAFALL.idle) + calmer;
      const period = idle + LAVAFALL.warn + LAVAFALL.active;
      out.zones.push({
        kind: 'geyser', look: 'lavafall', x0: R(f.x - LAVAFALL.w / 2), x1: R(f.x + LAVAFALL.w / 2), top: f.y - LAVAFALL.h, bottom: f.y + 14, baseY: f.y, dir: 1,
        period, warn: LAVAFALL.warn, active: LAVAFALL.active, offset: Math.round(hash01(f.x, 27) * period * 10) / 10, force: 0,
      });
    },
    rockHide: hide('wide'),
    fernHide: hide('tall'),
    // (one watched stretch a section: the piece it stands on and those walked on from it with no gap between, clipped to the hiding
    // places along it by w9Decorate; a watch per flat stacked the eagle's passes, and the doorstep read as nothing but waiting)
    watch: (f, _p, out) => {
      const run = watchedRun(out, f.x, f.y) ?? [f.x - 300, f.x + 300];
      const z: WatchZone = { x0: R(run[0] + 40), x1: R(run[1] - 40), calm: calm(f.socket === 'watchLesson') };
      const zones = (out.proto.watch ??= []);
      if (!zones.some((q) => q.x0 < z.x1 && z.x0 < q.x1)) zones.push(z);
    },
    ohia: scenery(3, 80, 30),
    log: scenery(5, 130, 40),
    smoke: scenery(7, 130, 40),
  };
}

/** the decorator (pass 6): the chosen decor sets into W9Extras.decor, and the watched stretches clipped to their hiding places */
export function w9Decorate(stage: number): NonNullable<WorldKit['decorate']> {
  return (items, out) => {
    clipWatches(out);
    const decor = (w9Of(out, stage).decor ??= []);
    for (const it of items) decor.push({ n: it.n, x: it.x, b: it.y, w: it.w, ...(hash01(it.x, 11) < 0.5 ? { flip: true } : {}) });
  };
}

/** every animal kept on its patch (never off the basalt into the lava), facing a rolled way */
export function w9Spawn(): NonNullable<WorldKit['spawn']> {
  return (e: Enemy) => {
    e.edgeMinX = e.patrolMinX;
    e.edgeMaxX = e.patrolMaxX;
    e.facing = hash01(e.x, 12) < 0.5 ? -1 : 1;
  };
}

/** the stages the harpy hunts in (the ash fields, the Drake's hoard): the rest keep it out */
export const W9_HARPY_STAGES: readonly number[] = [6, 9];

/**
 * World 9's falls (STAGE-RULES §6, World 8's rule): on Normal a fall into a chasm is the lava (the world's `void`), but these gaps keep a
 * soft crust floor (`soft`): every second-jump and glide gap (the first-timer tries the second jump only where the first failed, so a
 * deadly second-jump gap costs it lives for nothing a player learns), and a start section's gaps. Easy's are all soft anyway.
 */
export function w9Falls(t: SectionTemplate): SectionTemplate {
  const start = t.phases.length === 1 && t.phases[0] === 'start';
  const soften = (pl: PlaceRule): PlaceRule => {
    if (!('after' in pl) || ('water' in pl && pl.water)) return pl;
    if (pl.kind === 'pit' && (pl.jump === 'double' || pl.jump === 'glide')) return { ...pl, soft: true };
    if (pl.kind === 'double') return { ...pl, soft: true };
    if (start && (pl.kind === 'pit' || pl.kind === 'jump' || pl.kind === 'land')) return { ...pl, soft: true };
    return pl;
  };
  return { ...t, pieces: t.pieces.map((p) => ({ ...p, place: soften(p.place) })), subBlocks: t.subBlocks?.map((b) => ({ ...b, versions: b.versions.map((v) => ({ ...v, pieces: v.pieces.map((p) => ({ ...p, place: soften(p.place) })) })) })) };
}

/** World 9's base kit for one stage (the sections are added by w9Game.ts) */
export function w9Kit(stage: number, easy = false): WorldKit {
  // (9-3 Ember Canopy's danger is the chains over the lava: no animals, so no stretch of it plays like 9-6's hunt)
  // (9-6's ash fields are hunted by the cats and the tayra, 9-9's hoard is guarded by the harpies and the boas: the two fight stages never
  // share an animal, so their stretches never read alike on the look-alike measure (13 of 16 raw 9-9 rolls matched a 9-6 roll, 2026-10-31))
  const creatures = stage === 3 ? []
    : stage === 6 ? W9_CREATURES.filter((c) => c.id !== W9_CREATURE.harpy && c.id !== W9_CREATURE.boa)
    : stage === 9 ? W9_CREATURES.filter((c) => c.id === W9_CREATURE.harpy || c.id === W9_CREATURE.boa)
    : W9_HARPY_STAGES.includes(stage) ? W9_CREATURES : W9_CREATURES.filter((c) => c.id !== W9_CREATURE.harpy);
  return { manifest: { ...W9_MANIFEST, creatures }, emit: w9Emitters(stage, easy), decorate: w9Decorate(stage), spawn: w9Spawn() };
}

/** how far a climbing vine stands out in front of the ledge it leads up to (px): Pokey's half-width (21) and a little (World 8's) */
export const CLIMB_CLEAR = 26;

/**
 * The stage as the engine plays it (the hook-up and the curation tool call this after buildGen2Stage; calling it twice changes nothing):
 *  - the crumbling tiles are the kit's cracked basalt (Platform.art 'basalt');
 *  - the soft pits' floors and steps out (the pipeline's 'moss_stone' blocks) are cooled crust, in the world's rock;
 *  - a climbing vine stands CLIMB_CLEAR px in front of the ledge's face (World 8's lesson: snapped to a vine on the face, he hung inside
 *    the ledge and fell out of its body);
 *  - no water sign stands at the lava (its picture is a wave; Dot's line before the first chasm stays).
 */
export function w9Finish<S extends { spawnX?: number; platforms?: Platform[]; vines?: Vine[]; proto?: { hints?: StageHint[]; gen2?: Record<string, unknown> } }>(st: S): S {
  // (the water signs the pipeline stands at a deadly chasm's lip show a wave: the lava shows itself, and Dot names it before the first)
  if (st.proto?.gen2?.waterWarnings) delete st.proto.gen2.waterWarnings;
  for (const p of st.platforms ?? []) {
    // (the crumbling tiles are the kit's cracked basalt slabs: w9Art.ts drawW9Crumble)
    if (p.type === 'fragile' && p.crumbleAfter !== undefined) p.art = 'basalt';
    // (a soft pit's floor and its steps; a channel's solid slab between two runs of tiles (26 px) stays a slab)
    if (p.type !== 'solid' || p.style !== 'moss_stone' || p.height <= 26) continue;
    p.style = 'log';
    p.height = Math.max(p.height, W9_GROUND.bankH + 70);
  }
  for (const v of st.vines ?? []) {
    if (v.vineType !== 'tree_climb') continue;
    const face = (st.platforms ?? []).find((p) => p.type === 'solid' && Math.abs(p.y - v.topY) <= 2 && (Math.abs(p.x - v.x) <= 2 || Math.abs(p.x + p.width - v.x) <= 2));
    // (once moved it is clear of the face, so a second call finds no face to move it from)
    if (face) v.x += Math.abs(face.x - v.x) <= 2 ? -CLIMB_CLEAR : CLIMB_CLEAR;
  }
  return st;
}

export const fillsOf9 = (fills: FilledSocket[], what: string) => fills.filter((f) => f.what === what);

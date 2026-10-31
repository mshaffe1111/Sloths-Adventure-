/**
 * gen2/worlds/w10 — World 10 (the Stormy Highlands Fortress) for the new generator: its manifest (the toybox the roll draws from), its
 * emitters (the one piece of code per world that turns a filled prop socket into extras the engine plays) and its kit, `w10Kit(stage)`.
 *
 * Everything comes from the story (storyWorlds.ts W10, wayside.ts World 10): the Stormy Highlands begin where the trees stop, the rain
 * has nothing to hit but rock, a thousand steps go up to the Highland Fortress, and Dot has gone into the iron netting ahead of him. So
 * Pokey is alone again, and as in World 7 he teaches himself: every first-use line and every locked exit is his own short, dry thought
 * (W10_TIPS, under 10 words, approved by the lead 2026-10-29 7:54 PM ET); there is no Dot line in a World 10 stage (wayside.ts dotPresent).
 *   hazards     LIGHTNING on a beat (zones.ts 'bolt'): a rod charges, then the bolt strikes its column (SectionZone 'bolt'); IRON SPIKES
 *               in the floor of a pit (a gap rule's `spikes`: a heart on Normal, a plain soft pit on Easy); CRUMBLING RAMPARTS (the
 *               battlement slabs crumble under him: SectionPiece.crumble, World 7's tiles, never needed); WIND across the gaps between
 *               the walls (SectionZone 'gust', World 4's gusts); and the General's SOLDIERS.
 *   creatures   the soldier (the General's sloth soldiers, Matt's HF clips: it fights as a prowler, as World 7's sentry, and wears the
 *               soldier's look), and the hunters met before: ocelot and jaguar (World 3), tayra and harpy (World 6).
 *   props       crates and barrels to hide behind (the stealth stage's cover), the storm over a watched stretch of wall (6-2's watcher
 *               rhythm: the lightning finds anyone out in the open), banners, braziers, weapon racks and cages (scenery, Matt's World 10
 *               set dressing, src/assets/w6to10/props-made w10alt, w10c).
 *   falls       off the walls and into the chasms between them: deep (a life on Normal); on Easy every fall is soft (pipeline planBudget).
 *               Any gap where a deadly fall would be blind keeps a soft pit (`soft`).
 *   light       the storm all through: dusk at the gate (10-1 to 10-3), night on the walls (10-4 to 10-7), the last of the night at
 *               the fortress gate (10-8, 10-9).
 *
 * Pure data and pure functions (no canvas, no engine), like w6.ts.
 */
import { G } from '../../protoStage.ts';
import type { StageHint } from '../../protoStage.ts';
import type { Enemy, Platform } from '../../types.ts';
import type { Bush, WatchZone } from '../../watcher.ts';
import type { CreatureDef, FilledSocket, PropDef, PropEmitter, StageSink, WorldKit, WorldManifest } from '../types.ts';
import { W10_GROUND_SECTIONS } from './w10Ground.ts';

/** World 10's ground, its bank's depth, and how deep a soft pit's floor lies under its lips (one wide step out, as World 6's 110) */
export const W10_GROUND = { y: G, bankH: 90, pitDepth: 110 } as const;

// ───────────────────────────── the ids (the swing sections and the puzzle rooms use these: keep them stable) ─────────────────────────────

export const W10_CREATURE = {
  soldier: 'soldier',
  ocelot: 'ocelot',
  jaguar: 'jaguar',
  tayra: 'tayra',
  harpy: 'harpy',
} as const;
export type W10CreatureId = (typeof W10_CREATURE)[keyof typeof W10_CREATURE];

export const W10_PROP = {
  /** a stack of crates to hide behind (watcher.ts Bush 'wide') */
  crates: 'crates',
  /** a barrel and a crate (Bush 'tall') */
  barrels: 'barrels',
  /** the storm watching a stretch of wall: the lightning finds anyone out in the open (watcher.ts WatchZone over the piece) */
  storm: 'storm',
  /** a soldier's lantern on a watchtower sweeping a stretch of wall (GRAB-BAG L: the storm's watch, its own look) */
  lantern: 'lantern',
  /** scenery along the wall walks */
  banner: 'banner',
  brazier: 'brazier',
  rack: 'rack',
  cage: 'cage',
} as const;
export type W10PropId = (typeof W10_PROP)[keyof typeof W10_PROP];

/** the tags sockets ask for (Socket.allow) */
export const W10_TAG = {
  /** the stealth stage's want (pipeline WANT.stealth): somewhere to hide */
  cover: 'cover',
  hide: 'hide',
  storm: 'storm',
  scenery: 'scenery',
  /** creatures */
  guard: 'guard',
  hunter: 'hunter',
  quick: 'quick',
  big: 'big',
} as const;

/** the mechanics World 10 teaches, as `teaches` / `uses` keys and Pokey's tip keys */
export const W10_LESSON = {
  /** lightning rods (10-1 teaches them on every roll: w10Game.ts W10_REQUIRED) */
  bolt: 'bolt',
  /** the iron spike beds (10-1) */
  spikes: 'spikes',
  /** the crumbling ramparts (crumbling tiles were World 7's; the ramparts' first meeting still gets his line) */
  rampart: 'rampart',
  /** the storm's gusts between the walls (World 4 taught wind; the first gust here gets his line) */
  wind: 'wind',
  /** the storm watching the wall (10-3 Thunder) */
  storm: 'storm',
  /** the General's soldiers (new: his line before the first one, w10Finish) */
  soldier: 'soldier',
  /** the purge's and the gauntlet's shut shrine (Pokey explains the locked exit, STAGE-RULES §1) */
  hunt: 'hunt',
  fight: 'fight',
  /** the first deadly drop (Normal: falls off the walls cost a life) */
  drop: 'drop',
  /** the drop gates (GRAB-BAG D: 10-7, its first one gentle) */
  dropgate: 'dropgate',
  /** the trapdoor grates (GRAB-BAG F: 10-9, its first over a soft pit) */
  trap: 'trap',
  /** the gutter spouts (GRAB-BAG E: 10-6) */
  gush: 'gush',
  /** the lantern sweeps (GRAB-BAG L: 10-3) */
  lantern: 'lantern',
  /** the rolling barrels (GRAB-BAG K: 10-7, the first gentle) */
  barrel: 'barrel',
  /** the moving platforms (GRAB-BAG A, B, C): the chain lifts (10-1), the counterweight planks (10-3), the gear lifts (10-9) */
  lift: 'lift',
  cweight: 'cweight',
  gear: 'gear',
} as const;

// ───────────────────────────── the creatures ─────────────────────────────

/** the old generator's bodies (stageGenerator.ts ocelot(), jaguar(), tayra(), harpy()): size, hp, feet */
export const W10_CREATURES: CreatureDef[] = [
  // the General's soldier: a sloth in a green coat with a lantern. It fights as the prowler it stands in for (an ocelot enemy: patrol,
  // wind-up, lunge, recover, so its brain, its score and every check stay the proven ones) and wears the soldier's look
  // (soldierSprite.ts). Its collider is a soldier's size. The world's own animal, so Easy keeps one (softened)
  { id: W10_CREATURE.soldier, enemy: 'ocelot', threat: 3, terrain: 'flat', minGround: 240, w: 52, h: 76, hp: 3, footY: 38, easyFirst: true, extra: { look: 'soldier' }, tags: ['soldier', W10_TAG.guard, 'topup'] },
  { id: W10_CREATURE.ocelot, enemy: 'ocelot', threat: 3, terrain: 'flat', minGround: 220, w: 48, h: 28, hp: 2, footY: 18, tags: ['ocelot', W10_TAG.hunter, 'topup'] },
  { id: W10_CREATURE.jaguar, enemy: 'jaguar', threat: 5, terrain: 'flat', minGround: 300, w: 64, h: 38, hp: 3, footY: 24, tags: ['jaguar', W10_TAG.hunter, W10_TAG.big] },
  { id: W10_CREATURE.tayra, enemy: 'tayra', threat: 2.5, terrain: 'flat', minGround: 200, w: 46, h: 24, hp: 1, footY: 15, tags: ['tayra', W10_TAG.hunter, W10_TAG.quick, 'topup'] },
  { id: W10_CREATURE.harpy, enemy: 'harpy', threat: 4, terrain: 'flat', minGround: 260, w: 48, h: 36, hp: 2, footY: 16, tags: ['harpy', W10_TAG.hunter, W10_TAG.big] },
];

// ───────────────────────────── the props ─────────────────────────────

/** the watcher's bush sizes (protoStage.ts BUSH_W): a crate stack is drawn like a wide bush, a barrel and crate like a tall one */
export const W10_HIDE_W = { crates: 176, barrels: 124 } as const;

export const W10_PROPS: PropDef[] = [
  { id: W10_PROP.crates, tags: [W10_TAG.hide, W10_TAG.cover], w: W10_HIDE_W.crates, minApart: 260, looks: ['crates'] },
  { id: W10_PROP.barrels, tags: [W10_TAG.hide, W10_TAG.cover], w: W10_HIDE_W.barrels, minApart: 260, looks: ['crates'] },
  // (the storm is the beat: its passes are what he waits out, behind the crates)
  { id: W10_PROP.storm, tags: [W10_TAG.storm], w: 120, minApart: 500, hazard: true, beat: true },
  { id: W10_PROP.lantern, tags: ['lantern'], w: 120, minApart: 500, hazard: true, beat: true },
  { id: W10_PROP.banner, tags: [W10_TAG.scenery], w: 60, minApart: 400, looks: ['banner'] },
  { id: W10_PROP.brazier, tags: [W10_TAG.scenery], w: 70, minApart: 450, looks: ['brazier'] },
  { id: W10_PROP.rack, tags: [W10_TAG.scenery], w: 120, minApart: 500, looks: ['rack'] },
  { id: W10_PROP.cage, tags: [W10_TAG.scenery], w: 90, minApart: 700, looks: ['cage'] },
];

// ───────────────────────────── the decor ─────────────────────────────

/** Matt's World 10 set dressing (w10alt, w10c), rotated by the roll (artRoll.ts rollLook): all of it stands on the walls (nothing
 *  hangs in the air: STAGE-RULES §6, nothing floats) */
export const W10_DECOR: WorldManifest['decor'] = [
  { id: 'w10-banners', job: 'bank', items: [{ n: 'banner', w: [50, 66] }, { n: 'brazier', w: [56, 70] }, { n: 'crates', w: [110, 140] }], every: [260, 400] },
  { id: 'w10-armoury', job: 'bank', items: [{ n: 'rack', w: [96, 120] }, { n: 'crates', w: [110, 140] }, { n: 'banner', w: [50, 66] }, { n: 'rubble', w: [96, 124] }], every: [280, 420] },
  { id: 'w10-cages', job: 'bank', items: [{ n: 'cage', w: [76, 92] }, { n: 'brazier', w: [56, 70] }, { n: 'rack', w: [96, 120] }, { n: 'rubble', w: [96, 124] }], every: [300, 440] },
  { id: 'w10-braziers', job: 'bank', items: [{ n: 'brazier', w: [56, 70] }, { n: 'banner', w: [50, 66] }, { n: 'cage', w: [76, 92] }], every: [280, 420] },
];

// ───────────────────────────── Pokey's lines ─────────────────────────────

/**
 * Pokey's own first-time lines (Dot is away in World 10: she went into the netting ahead of him). Under 10 words, short, flat, dry
 * (reference/VOICE.md). In-stage lines are approved by the lead (LEAD-PLAYBOOK, Matt 2026-10-29).
 */
export const W10_TIPS: Record<string, string> = {
  [W10_LESSON.bolt]: "That rod's calling the lightning down.",
  [W10_LESSON.spikes]: "Spikes down there. I'd rather not.",
  [W10_LESSON.rampart]: "Old ramparts. They won't hold me long.",
  [W10_LESSON.wind]: 'Wind across the gap. Strong, too.',
  [W10_LESSON.storm]: 'Every flash lights the wall. And me.',
  [W10_LESSON.soldier]: "A soldier. The General's, by the coat.",
  [W10_LESSON.hunt]: "Gate's shut. The guards have to go.",
  [W10_LESSON.fight]: 'Shut again. More guards, then.',
  [W10_LESSON.drop]: 'No ledge under that one.',
  // (GRAB-BAG lines: new, need Matt's approval; said in Dot's bubble where she is back, 10-6 to 10-9: wayside.ts dotPresent)
  [W10_LESSON.dropgate]: "It drops on a count. Run when it's up!",
  [W10_LESSON.trap]: "Those grates open. Cross when they're shut.",
  [W10_LESSON.gush]: 'The gutters overflow. Wait for the gush to stop.',
  [W10_LESSON.lantern]: 'A lantern sweep. Stay behind something.',
  [W10_LESSON.barrel]: 'Barrels! Jump them, or wait up on the step.',
  [W10_LESSON.lift]: 'That plank rides the chain. Wait for it.',
  [W10_LESSON.cweight]: 'One goes up, the other comes down.',
  [W10_LESSON.gear]: 'The gears lift the stones. Count with them.',
  water: 'No ledge under that one.',
};
export const W10_NEW_LINES: readonly string[] = [...new Set(Object.values(W10_TIPS))];

// ───────────────────────────── the manifest ─────────────────────────────

/** the stages of World 10 gen2 builds (10-2, 10-4, 10-5 and 10-8 are ascents, the thousand steps: not gen2; 10-10 is the General) */
export const W10_GEN2_STAGES = ['10-1', '10-3', '10-6', '10-7', '10-9'] as const;

export const W10_MANIFEST: WorldManifest = {
  world: 10,
  name: 'Stormy Highlands Fortress',
  moves: ['double', 'punch', 'swing', 'climb', 'rope', 'glide'],
  ground: { y: W10_GROUND.y, bankH: W10_GROUND.bankH, style: 'moss_stone' },
  // (falls off the walls are deep on Normal; Easy's are soft: planBudget)
  pit: 'void',
  pitDepth: W10_GROUND.pitDepth,
  corridor: { top: G - 160, bottom: G + 80, soft: 60 },
  creatures: W10_CREATURES,
  props: W10_PROPS,
  pairs: [],
  decor: W10_DECOR,
  flowers: ['orchid', 'hibiscus'],
  sections: W10_GROUND_SECTIONS,
  handBuilt: ['10-2', '10-4', '10-5', '10-8', '10-10'],
  // (the cats were met in World 3, the tayra and the harpy in World 6, the gusts in World 4 and the crumbling floors in World 7; the
  // rods, the spikes, the ramparts and the gusts are 10-1's (his line there on first meeting), the storm's watch 10-3's)
  lessons: { ocelot: '3-9', jaguar: '3-9', tayra: '6-2', harpy: '6-5', [W10_LESSON.bolt]: '10-1', [W10_LESSON.spikes]: '10-1', [W10_LESSON.rampart]: '10-1', [W10_LESSON.wind]: '10-1', [W10_LESSON.storm]: '10-3', [W10_LESSON.dropgate]: '10-7', [W10_LESSON.trap]: '10-9', [W10_LESSON.gush]: '10-6', [W10_LESSON.barrel]: '10-7', [W10_LESSON.lift]: '10-1', [W10_LESSON.cweight]: '10-3', [W10_LESSON.gear]: '10-9' },
  tips: W10_TIPS,
};

// ───────────────────────────── the emitters ─────────────────────────────

/** a stage's light, by its number */
export type W10Mood = 'dusk' | 'night' | 'lastNight';
export const w10Mood = (stage: number): W10Mood => (stage <= 3 ? 'dusk' : stage <= 7 ? 'night' : 'lastNight');

/** World 10's own extras (in sink.extras.w10, so proto.gen2.w10): what the hook-up hands the drawing and the engine */
export interface W10Extras {
  mood: W10Mood;
  scenery?: Array<{ n: string; x: number; b: number; w: number; flip?: boolean }>;
  decor?: Array<{ n: string; x: number; b: number; w: number; flip?: boolean }>;
  /** where each hiding place stands and what it is drawn as (the watcher's bushes are proto.bushes: these are their looks) */
  hides?: Array<{ x: number; w: number; y: number; look: string }>;
  /** every soldier laid: w10Finish puts Pokey's line before the first */
  meets?: Array<{ kind: string; x: number }>;
}

const hash01 = (x: number, salt: number): number => {
  const s = Math.sin(x * 12.9898 + salt * 78.233) * 43758.5453;
  return s - Math.floor(s);
};
const R = Math.round;

/** the stage's World 10 extras, made on first use */
export function w10Of(out: StageSink, stage = 1): W10Extras {
  return (out.extras.w10 ??= { mood: w10Mood(stage) }) as W10Extras;
}
const look = (p: PropDef, x: number, salt: number) => (p.looks?.length ? p.looks[Math.floor(hash01(x, salt) * p.looks.length)] : p.id);

/** the platform a socket's spot stands on */
function pieceAt(out: StageSink, x: number, y: number): Platform | undefined {
  return out.platforms.find((p) => Math.abs(p.y - y) < 1 && x >= p.x && x <= p.x + p.width && p.type !== 'fragile');
}

/** a watched stretch runs this far past the last crate stack along it (px): never into a stretch with nowhere to hide */
const WATCH_PAST = 120;

/** each watched stretch clipped to the cover laid along it (pass 6), as World 6's: one with no cover in it is no watched stretch */
export function clipStorm(out: StageSink): void {
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

/** how long the storm stays quiet between passes (s): long where it is taught, shorter later; never under 5 s */
export function stormCalm(stage: number, lesson: boolean): [number, number] {
  if (lesson) return [9, 11];
  const k = Math.max(0, Math.min(1, (stage - 3) / 6));
  return [Math.round((6.5 - 1.2 * k) * 10) / 10, Math.round((8 - 1.2 * k) * 10) / 10];
}

/** the emitters, for a stage of World 10 */
export function w10Emitters(stage: number): Record<W10PropId, PropEmitter> {
  const hide = (kind: Bush['kind']): PropEmitter => (f, p, out) => {
    const w = W10_HIDE_W[p.id as keyof typeof W10_HIDE_W] ?? 150;
    const b: Bush = { x: R(f.x - w / 2), w, y: f.y, kind };
    (out.proto.bushes ??= []).push(b);
    (w10Of(out, stage).hides ??= []).push({ x: b.x, w, y: f.y, look: p.id === W10_PROP.barrels ? 'barrels' : 'crates' });
  };
  const scen = (salt: number, w0: number, dw: number): PropEmitter => (f, p, out) =>
    void (w10Of(out, stage).scenery ??= []).push({ n: look(p, f.x, salt), x: f.x, b: f.y, w: R(w0 + dw * hash01(f.x, salt + 1)), ...(hash01(f.x, salt + 2) < 0.5 ? { flip: true } : {}) });
  return {
    crates: hide('wide'),
    barrels: hide('tall'),
    // the watched stretch: the piece the storm socket stands on, 40 px in from each end
    storm: (f, _p, out) => {
      const own = pieceAt(out, f.x, f.y);
      const run = own ? [own.x, own.x + own.width] : [f.x - 300, f.x + 300];
      const z: WatchZone = { x0: R(run[0] + 40), x1: R(run[1] - 40), calm: stormCalm(stage, f.socket === 'stormLesson'), ...(f.socket === 'stormLesson' ? { freeFirst: true } : {}) };
      const zones = (out.proto.watch ??= []);
      if (!zones.some((q) => q.x0 < z.x1 && z.x0 < q.x1)) zones.push(z);
    },
    // (the lantern sweep: the storm's watch with its own look; its first pass over each stretch only warns)
    lantern: (f, _p, out) => {
      const own = pieceAt(out, f.x, f.y);
      const run = own ? [own.x, own.x + own.width] : [f.x - 300, f.x + 300];
      const z: WatchZone = { x0: R(run[0] + 40), x1: R(run[1] - 40), calm: stormCalm(stage, false), freeFirst: true, look: 'lantern', y: f.y };
      const zones = (out.proto.watch ??= []);
      if (!zones.some((q) => q.x0 < z.x1 && z.x0 < q.x1)) zones.push(z);
    },
    banner: scen(3, 50, 20),
    brazier: scen(5, 60, 20),
    rack: scen(7, 110, 30),
    cage: scen(9, 80, 20),
  };
}

/** the decorator (pass 6): the chosen decor sets into W10Extras.decor, and the watched stretches clipped to their cover */
export function w10Decorate(stage: number): NonNullable<WorldKit['decorate']> {
  return (items, out) => {
    clipStorm(out);
    const decor = (w10Of(out, stage).decor ??= []);
    // (clear of the hazards and the cover: nothing stands in a rod's column, a gust lane or behind a crate stack, so each reads alone)
    const busy = [...out.zones.map((z) => [z.x0 - 50, z.x1 + 50]), ...(out.proto.bushes ?? []).map((b) => [b.x - 40, b.x + b.w + 40])];
    // (nor on the grab bag's thin pieces: a perch, a balcony, a stair tread, a walkway or a bridge is walked and fought on, not dressed)
    const thin = out.platforms.filter((p) => p.style?.startsWith('w10_'));
    for (const it of items) {
      if (busy.some(([a, c]) => it.x + it.w / 2 > a && it.x - it.w / 2 < c)) continue;
      if (thin.some((p) => Math.abs(p.y - it.y) < 4 && it.x + it.w / 2 > p.x && it.x - it.w / 2 < p.x + p.width)) continue;
      decor.push({ n: it.n, x: it.x, b: it.y, w: it.w, ...(hash01(it.x, 11) < 0.5 ? { flip: true } : {}) });
    }
  };
}

/** every animal kept on its patch (never off a wall into a gap), facing a rolled way; the soldiers are noted for w10Finish's line */
export function w10Spawn(stage = 1): NonNullable<WorldKit['spawn']> {
  return (e: Enemy, c: CreatureDef, out: StageSink) => {
    // (an animal's patch stops short of a drop gate's column: no fight under a portcullis, GRAB-BAG D)
    for (const z of out.zones) {
      if (z.kind !== 'bolt' || z.look !== 'portcullis' || Math.abs(z.baseY - (e.y + e.height / 2)) > 60) continue;
      const lo = z.x0 - 60, hi = z.x1 + 60;
      if (e.patrolMaxX < lo || e.patrolMinX > hi) continue;
      if (e.x < (lo + hi) / 2) e.patrolMaxX = Math.min(e.patrolMaxX, lo);
      else e.patrolMinX = Math.max(e.patrolMinX, hi);
      e.x = Math.max(e.patrolMinX, Math.min(e.patrolMaxX, e.x));
    }
    e.edgeMinX = e.patrolMinX;
    e.edgeMaxX = e.patrolMaxX;
    e.facing = hash01(e.x, 12) < 0.5 ? -1 : 1;
    if (c.id === W10_CREATURE.soldier) (w10Of(out, stage).meets ??= []).push({ kind: c.id, x: e.patrolMinX });
  };
}

/** Pokey's line comes this far before the first soldier (px): he thinks it before it can reach him */
export const MEET_LEAD = 520;

/** World 10's kit for one stage */
export function w10Kit(stage = 1): WorldKit {
  return { manifest: { ...W10_MANIFEST }, emit: w10Emitters(stage), decorate: w10Decorate(stage), spawn: w10Spawn(stage) };
}

/** Pokey's lesson lines, by the thing each teaches (said once per save where the guide supports it) */
export const W10_FIRST_OF: Readonly<Record<string, string>> = Object.fromEntries(
  ([W10_LESSON.bolt, W10_LESSON.spikes, W10_LESSON.rampart, W10_LESSON.wind, W10_LESSON.storm, W10_LESSON.soldier, W10_LESSON.dropgate, W10_LESSON.trap, W10_LESSON.gush, W10_LESSON.barrel, W10_LESSON.lift, W10_LESSON.cweight, W10_LESSON.gear] as string[]).map((k) => [W10_TIPS[k], `w10.${k}`]),
);

/**
 * The stage as the engine plays it: Pokey's line MEET_LEAD px before the first soldier (fillSockets writes proto.hints after the spawn
 * hook runs, so the line is added here). Calling it twice changes nothing.
 */
export function w10Finish<S extends { spawnX?: number; proto?: { hints?: StageHint[]; gen2?: Record<string, unknown> } }>(st: S): S {
  const w10 = st.proto?.gen2?.w10 as W10Extras | undefined;
  if (st.proto && w10?.meets?.length) {
    const hints = (st.proto.hints ??= []);
    const x = Math.min(...w10.meets.map((m) => m.x));
    const text = W10_TIPS[W10_LESSON.soldier];
    if (!hints.some((h) => h.text === text)) hints.push({ x: R(Math.max((st.spawnX ?? 0) + 40, x - MEET_LEAD)), text, pad: text, keys: text });
    hints.sort((a, b) => a.x - b.x);
  }
  return st;
}

/** the filled sockets of one kind of prop or creature, for tests and the curation tool */
export const fillsOf = (fills: FilledSocket[], what: W10PropId | W10CreatureId) => fills.filter((f) => f.what === what);

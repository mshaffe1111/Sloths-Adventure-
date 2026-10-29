/**
 * gen2/worlds/w5 — World 5 (the Orchid Sanctuary) for the new generator: its manifest (the toybox the roll draws from) and its emitters
 * (the one piece of code per world that turns a filled prop socket into the W5Extras the engine already plays: w5Kit.ts, w5Play.ts).
 *
 * Everything comes from the story (reference/STORY-REWRITE.md "World 5"): Dot's five rules are the mechanics, and the sanctuary's lovely
 * things are the traps.
 *   creatures   the jumping spider (awake: it crouches, then rushes) and the sleeper (the same spider dozing until a thread hums or he
 *               walks into it). The Butler is a creature in the story but a prop to the engine (W5Extras.butlers): he is a prop here,
 *               with his threat in W5_PROP_THREAT (types.ts has no prop threat: reported to the architect).
 *   props       soft chairs (don't sit), tiny cakes (don't eat), the Butler's tray, warm teapots (don't drink), humming threads (don't
 *               touch the silk), silk sheets and the Seamstress's sheet (don't admire the silk), the tea table and its card, the cake
 *               stand, closing orchids (a ledge that shuts on its beat, petals in its cup).
 *   pairs       the tea table and its warm pot (the card: "The pot is warm. It is always warm."), the cake stand and the Butler who
 *               serves from it: a source is never laid without its receptor.
 *   decor       the garden's dressing from w5Stages.ts (blossoms and ferns; the sanctuary's sprouts and mossy roots) and the guests who
 *               sat (wrapped chairs, stools, cups, a lump of silk), each job rotated by the roll (artRoll.ts rollLook).
 *   light       golden afternoon (5-1 to 5-3), dusk (5-4 to 5-6), misty violet twilight (5-7 on): never night (World 8 is the night).
 *
 * Pure data and pure functions (no canvas, no engine), like w5Kit.ts.
 */
import { G } from '../../protoStage.ts';
import { newTeapot, orchidTiming, TABLE_CARD, W5_TEACH, type W5Extras } from '../../w5Kit.ts';
import { COCOON_UP, W5_LESSON_ORCHID } from '../../w5Stages.ts';
import type { Enemy } from '../../types.ts';
import type { CreatureDef, FilledSocket, PropDef, PropEmitter, PropPair, StageSink, WorldKit, WorldManifest } from '../types.ts';
import { W5_SECTIONS } from './w5Sections.ts';

/** World 5's ground, its bank's depth, and how deep a soft pit's floor lies under its lips: 110 (w5Stages.ts lays 130), so the stitcher
 *  lays one wide step out of an Easy pit, not two narrow ones the kid bot aims for (33 px steps cost it 15% on a 99 px pit) */
export const W5_GROUND = { y: G, bankH: 90, pitDepth: 110 } as const;

// ───────────────────────────── the ids (5-9's arena builder and the sections use these) ─────────────────────────────

export const W5_CREATURE = { spider: 'spider', sleeper: 'sleeper' } as const;
export type W5CreatureId = (typeof W5_CREATURE)[keyof typeof W5_CREATURE];

export const W5_PROP = {
  chair: 'chair',
  cake: 'cake',
  butler: 'butler',
  teapot: 'teapot',
  thread: 'thread',
  sheet: 'sheet',
  seamSheet: 'seamSheet',
  table: 'table',
  cakeStand: 'cakeStand',
  orchid: 'orchid',
  cocoon: 'cocoon',
} as const;
export type W5PropId = (typeof W5_PROP)[keyof typeof W5_PROP];

/** the tags sockets ask for (Socket.allow) */
export const W5_TAG = {
  seat: 'seat',
  treat: 'treat',
  host: 'host',
  pot: 'pot',
  thread: 'thread',
  sheet: 'sheet',
  table: 'table',
  stand: 'stand',
  orchid: 'orchid',
  cocoon: 'cocoon',
  /** the stealth stages' want (pipeline WANT.stealth): what keeps him out of sight, or what he must slip past unheard */
  cover: 'cover',
  /** creatures: awake ones rush, dozing ones wait for a hum */
  awake: 'awake',
  doze: 'doze',
} as const;

/**
 * The threat each World 5 prop that acts like an animal costs, in the creatures' units (types.ts PropDef has no threat; a section that
 * holds one should hold that much less threat in its enemy sockets: the sections are authored with it in mind). Reported to the architect.
 */
export const W5_PROP_THREAT: Partial<Record<W5PropId, number>> = { butler: 2.5, teapot: 1.5, seamSheet: 1.5 };

// ───────────────────────────── the creatures ─────────────────────────────

/** World 5's jumping spider on the ground (w5Stages.ts spider(): 34 x 22, feet 12 under its middle, legs 60 wide, a stomp beats it) */
const spiderBody = { enemy: 'spider', terrain: 'flat', w: 34, h: 22, hp: 1, footY: 12, extra: { hitW: 60, stompable: true } } as const;

export const W5_CREATURES: CreatureDef[] = [
  // awake: it crouches for SPIDER5.tell (0.7 s) in full view, then rushes; the world's newest animal, so Easy keeps one (softened)
  { id: W5_CREATURE.spider, ...spiderBody, threat: 3, minGround: 220, easyFirst: true, tags: ['spider', W5_TAG.awake] },
  // dozing: asleep until a thread hums within THREAD.alert or he walks right into it (a hop over it never wakes it). `sleeper` marks it
  // for w5Spawn (W5Extras.spiders with `doze`); `topup` makes it the one a gauntlet's or purge's top-up lays (a sleeper on the ground,
  // never the Butler)
  { id: W5_CREATURE.sleeper, ...spiderBody, extra: { ...spiderBody.extra, facing: 1 }, threat: 1.5, minGround: 200, easyFirst: true, tags: ['spider', W5_TAG.doze, 'sleeper', 'topup'] },
];

// ───────────────────────────── the props ─────────────────────────────

export const W5_PROPS: PropDef[] = [
  // (`w` the space along the route; `minApart` the least gap to another of its kind, C2)
  { id: W5_PROP.chair, tags: [W5_TAG.seat], w: 90, minApart: 360, beat: true, looks: ['pink', 'lilac', 'cream'] },
  { id: W5_PROP.cake, tags: [W5_TAG.treat], w: 30, minApart: 300, hazard: true, beat: true, looks: ['cupcake', 'cupcake2'] },
  { id: W5_PROP.butler, tags: [W5_TAG.host], w: 90, minApart: 900, hazard: true, beat: true },
  { id: W5_PROP.teapot, tags: [W5_TAG.pot], w: 70, minApart: 500, hazard: true, beat: true, looks: ['teapot', 'teapot2'] },
  { id: W5_PROP.thread, tags: [W5_TAG.thread, W5_TAG.cover], w: 90, minApart: 320, beat: true },
  { id: W5_PROP.sheet, tags: [W5_TAG.sheet], w: 340, minApart: 700, beat: true },
  { id: W5_PROP.seamSheet, tags: ['seamstress'], w: 400, minApart: 1600, hazard: true, beat: true },
  { id: W5_PROP.table, tags: [W5_TAG.table], w: 200, minApart: 2400 },
  { id: W5_PROP.cakeStand, tags: [W5_TAG.stand], w: 70, minApart: 600 },
  { id: W5_PROP.orchid, tags: [W5_TAG.orchid], w: W5_LESSON_ORCHID.w, minApart: 400, beat: true },
  // a creature wrapped in silk, hanging where a standing punch lands (5-5's): three punches set it free (a rescue's quota counts it)
  { id: W5_PROP.cocoon, tags: [W5_TAG.cocoon], w: 70, minApart: 260, beat: true },
];

export const W5_PAIRS: PropPair[] = [
  // the card on the table says the pot is always warm: the pot is always there, within a few steps
  { id: 'table-pot', source: W5_PROP.table, receptor: W5_PROP.teapot, minApart: 280, maxApart: 900 },
  // the Butler serves from the cake stand behind him
  { id: 'stand-butler', source: W5_PROP.cakeStand, receptor: W5_PROP.butler, minApart: 200, maxApart: 800 },
];

// ───────────────────────────── the decor ─────────────────────────────

export const W5_DECOR: WorldManifest['decor'] = [
  // the garden behind the path (w5Stages.ts garden()): flowering bushes and ferns, or the sanctuary's own sprouts and mossy roots
  { id: 'w5-bushes', job: 'garden', items: [{ n: 'blossom', w: [70, 110] }, { n: 'blossom2', w: [70, 110] }, { n: 'fern', w: [80, 120] }], every: [170, 300] },
  { id: 'w5-sprouts', job: 'garden', items: [{ n: 'orchidSprout', w: [54, 70] }, { n: 'orchidSprout2', w: [54, 70] }, { n: 'mossRoot', w: [90, 120] }, { n: 'mossRoot2', w: [90, 120] }, { n: 'fern', w: [80, 120] }], every: [180, 300] },
  // the guests who sat (5-1's twist, 5-3 and 5-5's scenery): wrapped where they sat, spread thinly
  { id: 'w5-guests', job: 'visitors', items: [{ n: 'wrappedChair', w: [74, 90] }, { n: 'wrappedStool', w: [56, 66] }, { n: 'silkLump', w: [70, 90] }], every: [900, 1400] },
  { id: 'w5-teaset', job: 'visitors', items: [{ n: 'wrappedCup', w: [40, 50] }, { n: 'wrappedCup2', w: [40, 50] }, { n: 'doily', w: [56, 70] }, { n: 'wrappedStool', w: [56, 66] }], every: [900, 1400] },
];

// ───────────────────────────── the manifest ─────────────────────────────

/** the stages of World 5 gen2 builds: 5-7 and 5-9 (5-8 stays hand-built, Matt 2026-10-28; 5-1..5-6 and the guardian are hand-built) */
export const W5_GEN2_STAGES = ['5-7', '5-9'] as const;

/** the stages of World 5 that may hold a puzzle room (2-3 puzzle moments per world, STAGE-RULES §3): 5-9's arena gates */
export const W5_ROOM_STAGES = ['5-9'] as const;

export const W5_MANIFEST: WorldManifest = {
  world: 5,
  name: 'Orchid Sanctuary',
  moves: ['double', 'punch'],
  ground: { y: W5_GROUND.y, bankH: W5_GROUND.bankH, style: 'log' },
  pit: 'soft',
  pitDepth: W5_GROUND.pitDepth,
  // (the route's ground stays within a stump or two of the path: every high road and ledge is an `over` piece above it)
  corridor: { top: G - 160, bottom: G + 80, soft: 60 },
  creatures: W5_CREATURES,
  props: W5_PROPS,
  pairs: W5_PAIRS,
  decor: W5_DECOR,
  flowers: ['orchid', 'hibiscus'],
  sections: W5_SECTIONS,
  handBuilt: ['5-1', '5-2', '5-3', '5-4', '5-5', '5-6', '5-8', '5-10'],
  // (the stage that first teaches each piece: every one before 5-7 except the teapots, which 5-7 teaches itself: w5-pot-lesson)
  lessons: {
    chair: '5-1', still: '5-1', spider: '5-1', double: '5-1',
    cake: '5-2', thread: '5-2', doze: '5-2', butler: '5-2',
    orchid: '5-3',
    sheet: '5-4', silk: '5-4', seamstress: '5-4',
    cocoon: '5-5',
  },
  // Dot's approved first-time lines (w5Kit W5_TEACH: dotLines.ts swaps in the new look's short line). w5Play.ts says each where the piece
  // first comes into view, once per stage, so no section carries a 'tip' socket for them: it would be said twice
  tips: { pot: W5_TEACH.pot, thread: W5_TEACH.thread, spider: W5_TEACH.spider, cake: W5_TEACH.cake, butler: W5_TEACH.butler, sheet: W5_TEACH.sheet, chair: W5_TEACH.chair },
};

// ───────────────────────────── the emitters ─────────────────────────────

/** a stage's light, by its number (STORY-REWRITE World 5: golden afternoon, dusk, misty violet twilight; never night) */
export const w5Mood = (stage: number): NonNullable<W5Extras['mood']> => (stage <= 3 ? 'gold' : stage <= 6 ? 'dusk' : 'twilight');

/** a number in 0..1 from a spot and a salt: the emitters' small rolls (the same socket in the same place always rolls the same) */
const hash01 = (x: number, salt: number): number => {
  const s = Math.sin(x * 12.9898 + salt * 78.233) * 43758.5453;
  return s - Math.floor(s);
};
const R = Math.round;

/** the stage's World 5 extras, made on first use */
export function w5Of(out: StageSink, stage = 7): W5Extras {
  return (out.proto.w5 ??= { mood: w5Mood(stage), petals: stage < 7 });
}
const push = <K extends keyof W5Extras>(out: StageSink, k: K, v: NonNullable<W5Extras[K]> extends Array<infer T> ? T : never, stage: number) => {
  const w5 = w5Of(out, stage) as Record<string, unknown[]>;
  (w5[k as string] ??= []).push(v);
};

/** the emitters, for a stage of World 5 (its number sets the orchids' beat and the light) */
export function w5Emitters(stage: number): Record<W5PropId, PropEmitter> {
  return {
    chair: (f, p, out) => {
      const looks = p.looks ?? ['pink'];
      push(out, 'chairs', { x: f.x, y: f.y, face: hash01(f.x, 1) < 0.5 ? 1 : -1, color: looks[Math.floor(hash01(f.x, 2) * looks.length)] as 'pink' }, stage);
    },
    // (a cake floats like a pickup at walking height: w5Stages.ts cakeRow, G - 34)
    cake: (f, _p, out) => push(out, 'cakes', { x: f.x, y: f.y - 34 }, stage),
    // (facing the way Pokey comes, his tray held out toward him)
    butler: (f, _p, out) => push(out, 'butlers', { x: f.x, y: f.y, dir: -1 }, stage),
    teapot: (f, _p, out) => {
      const pot = newTeapot(f.x, f.y, hash01(f.x, 3) < 0.5 ? 1 : -1);
      pot.offset = Math.round(hash01(f.x, 4) * (pot.idle + pot.warn + pot.puff) * 100) / 100;
      push(out, 'pots', pot, stage);
    },
    // (strung low across the way: jump it. w5Stages.ts threadTrap: 60-90 px wide, 14 px up)
    thread: (f, _p, out) => {
      const w = R(60 + 30 * hash01(f.x, 5));
      push(out, 'threads', { x0: R(f.x - w / 2), x1: R(f.x - w / 2) + w, y: f.y - 14 }, stage);
    },
    // (w5Stage54.ts sheetWalk: 300-380 wide, 240-270 tall)
    sheet: (f, _p, out) => {
      const w = R(300 + 80 * hash01(f.x, 6));
      push(out, 'sheets', { x0: R(f.x - w / 2), x1: R(f.x - w / 2) + w, top: f.y - R(240 + 30 * hash01(f.x, 7)), bottom: f.y }, stage);
    },
    // a sheet with the Seamstress knitting at its far end (5-4's): she casts lace on a player who lingers
    seamSheet: (f, _p, out) => {
      const w = R(300 + 60 * hash01(f.x, 8));
      const x0 = R(f.x - w / 2 - 25);
      push(out, 'sheets', { x0, x1: x0 + w, top: f.y - R(240 + 30 * hash01(f.x, 9)), bottom: f.y }, stage);
      const sheet = w5Of(out, stage).sheets!.length - 1;
      push(out, 'seamstresses', { x: x0 + w + 50, y: f.y, dir: -1, sheet }, stage);
    },
    table: (f, _p, out) => push(out, 'tables', { x: f.x, y: f.y, card: TABLE_CARD }, stage),
    // (a doily on its stool with a cake tier on it: w5Play draws the 'doily' decor so; scenery, never eaten)
    cakeStand: (f, _p, out) => push(out, 'decor', { n: 'doily', x: f.x, b: f.y, w: 64 }, stage),
    cocoon: (f, _p, out) => push(out, 'cocoons', { x: f.x, y: f.y - COCOON_UP }, stage),
    // a closing orchid over the grass, one plain hop up (5-3's lesson orchid), two petals in its cup; a miss is a step back to the grass
    orchid: (f, _p, out) => {
      const L = W5_LESSON_ORCHID;
      const t = orchidTiming(stage, L.period);
      const top = f.y - L.up;
      const id = out.nextPlatformId();
      out.platforms.push({ id, x: R(f.x - L.w / 2), y: R(top), width: L.w, height: 22, type: 'solid', style: 'branch', art: 'orchid' });
      const petalIds: number[] = [];
      for (let k = 0; k < 2; k++) {
        const cid = out.nextCollectibleId();
        out.collectibles.push({ id: cid, type: 'flower', botanicalVariant: 'orchid', x: R(f.x + (k - 0.5) * 40), y: R(top - 34), collected: false, bobPhase: (f.x * 0.031) % 6.28 });
        petalIds.push(cid);
      }
      push(out, 'orchids', { x: f.x, y: R(top), w: L.w, period: t.period, open: t.open, offset: Math.round(hash01(f.x, 10) * t.period * 100) / 100, platformId: id, petalIds, stem: f.y }, stage);
    },
  };
}

/** the decorator (pass 6): the chosen decor sets into W5Extras.decor */
export function w5Decorate(stage: number): NonNullable<WorldKit['decorate']> {
  return (items, out) => {
    const decor = (w5Of(out, stage).decor ??= []);
    for (const it of items) decor.push({ n: it.n, x: it.x, b: it.y, w: it.w, ...(hash01(it.x, 11) < 0.5 ? { flip: true } : {}) });
  };
}

/**
 * Every jumping spider the stage lays (a socket's or a top-up's) listed in W5Extras.spiders (w5Play.ts gates only the spiders it lists:
 * the crouch in full view, the doze), drawn on the ground (noThread) and kept on its patch (edgeMinX/MaxX), as w5Stages.ts spider()
 * makes them. A creature tagged `sleeper` dozes.
 */
export function w5Spawn(stage: number): NonNullable<WorldKit['spawn']> {
  return (e, c, out) => {
    if (e.type !== 'spider') return;
    const w5 = w5Of(out, stage);
    (e as Enemy & { noThread?: boolean }).noThread = true;
    e.edgeMinX = e.patrolMinX;
    e.edgeMaxX = e.patrolMaxX;
    (w5.spiders ??= []).push({ id: e.id, ...(c.tags?.includes('sleeper') ? { doze: true } : {}) });
  };
}

/** World 5's kit for one stage (its number sets the light and the orchids' beat) */
export function w5Kit(stage = 7): WorldKit {
  return { manifest: W5_MANIFEST, emit: w5Emitters(stage), decorate: w5Decorate(stage), spawn: w5Spawn(stage) };
}

/** the filled sockets of one kind of prop, for tests and the curation tool */
export const fillsOf = (fills: FilledSocket[], what: W5PropId | W5CreatureId) => fills.filter((f) => f.what === what);

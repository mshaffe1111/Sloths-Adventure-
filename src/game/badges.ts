/**
 * Medals (the code calls them badges): the Trophy Room's rules. Rebuilt for a longer game (Matt, 2026-10-26).
 *
 *   - Bronze is easy, for new players. Silver is built up over a decent amount of skilled play. Gold is real hours of play.
 *   - Platinum is the one completionist medal: finish the game on Normal, earn 3 stars on every stage and find everything Meeca left.
 *   - Every medal is worth its tier's points (TIER_POINTS), and the whole set adds up to exactly TOTAL_POINTS (5,000). The coats Pokey
 *     wears unlock by points.
 *   - Nothing is about finishing a stage quickly.
 *
 * Everything here is pure (no storage, no screens) so it can be tested. The screens keep a `BadgeStore` in localStorage (badgeStore.ts)
 * and call `recordStage` when a stage ends; `evaluate` then says which medals the player has. Medals that depend on the whole save
 * (stars, cleared stages, finds) are re-derived from the records each time, and a medal once earned stays earned.
 */
import { FINDS, allFound } from './finds.ts';
import { cardMet, ROAD_IDS, roadCardsIn } from './journalMet.ts';

export type Tier = 'bronze' | 'silver' | 'gold' | 'platinum';
export const TIERS: Tier[] = ['platinum', 'gold', 'silver', 'bronze'];
export const TIER_POINTS: Record<Tier, number> = { bronze: 20, silver: 40, gold: 90, platinum: 500 };
export const TOTAL_POINTS = 5000;
export const TIER_NAME: Record<Tier, string> = { bronze: 'Bronze', silver: 'Silver', gold: 'Gold', platinum: 'Platinum' };

/** the predators a player can meet, in journal order */
export const PREDATORS = ['snake', 'tayra', 'ocelot', 'jaguar', 'boa', 'eagle', 'spider', 'caiman', 'turtle', 'frog', 'harpy'] as const;
export type PredatorId = (typeof PREDATORS)[number];
/** the journal's creature cards the Naturalist medal counts: the eleven predators and the seven met on the road (journalMet.ts) */
export const JOURNAL_CARDS: readonly string[] = [...PREDATORS, ...ROAD_IDS];

/** the ten worlds' names, as worldsData.ts has them (kept here so this file stays light; badges.test.ts checks they match) */
export const WORLD_NAMES = [
  'Emerald Canopy',
  'Sunlit Riverbank',
  'Mossy Grotto',
  'Mist Cascades',
  'Orchid Sanctuary',
  'Deep Mangrove',
  'Ancient Ruins',
  'Twilight Treetops',
  'Volcanic Jungle',
  'Stormy Highlands Fortress',
] as const;

/** what the engine reports when a stage ends */
export interface StageStats {
  win: boolean;
  stars: number;
  livesLost: number;
  heartsLost: number;
  /** flowers, leaves and fruit in the stage, and how many were picked up */
  floraTotal: number;
  floraCollected: number;
  /** a gather stage's goal as the HUD counts it (picked so far, of the goal), so a card says what the HUD bar said */
  floraGoal?: { cur: number; target: number };
  timeSec: number;
  timeLimit: number;
  /** longest stomp chain and combo this stage */
  maxStompChain: number;
  maxCombo: number;
  stomps: number;
  /** predators knocked out, by type */
  kills: Record<string, number>;
  /** creature types that came on screen */
  seen: string[];
  /** which stage this was, like "3-10" (a world's tenth stage is its guardian) */
  id?: string;
  /** seconds spent gliding on the leaf and creeping along ropes this stage */
  glideSec?: number;
  shimmySec?: number;
  /** vines grabbed to swing on; punches and kicks that landed */
  swings?: number;
  punches?: number;
  kicks?: number;
  /** cages, nests and cocoons opened (friends freed) */
  freed?: number;
  /** World 5: cakes avoided (trays punched away, and cakes left uneaten on a clear), petals caught in open orchids, silk shaken off */
  cakesAvoided?: number;
  orchidPetals?: number;
  silkShed?: number;
  /** Dot's netting flight (4-D): her scratches; Meeca's stage (5-M): how many hints she asked Flicker for */
  scratches?: number;
  hints?: number;
  /** the difficulty the stage was played on, and whether Dot's help was set to Quiet */
  difficulty?: 'easy' | 'normal';
  quiet?: boolean;
}

export interface BadgeCounters {
  stomps: number;
  bestCombo: number;
  /** lifetime: seconds on the leaf, seconds on ropes, flowers/leaves/fruit picked */
  glide: number;
  shimmy: number;
  flora: number;
  /** stages in a row cleared without losing a life, right now and at best */
  streak: number;
  bestStreak: number;
  // ── counted from 2026-10-26 on (older saves start these at zero) ──
  /** seconds played in stages */
  playSec: number;
  swings: number;
  punches: number;
  kicks: number;
  freed: number;
  cakesAvoided: number;
  orchidPetals: number;
  silkShed: number;
  /** stages cleared without taking a single hit */
  noHitClears: number;
  /** the General beaten (1 = yes), and beaten on Normal */
  finished: number;
  finishedNormal: number;
  // ── counted from 2026-10-30 on ──
  /** lives lost, across every stage ever played: the General counts them (storyNotice.ts) */
  falls: number;
}

export interface BadgeStore {
  v: 1;
  earned: Record<string, number>;
  kills: Record<string, number>;
  seen: string[];
  counters: BadgeCounters;
  /** the stages cleared with Dot's help on Quiet */
  quiet: string[];
}

export const emptyCounters = (): BadgeCounters => ({
  stomps: 0, bestCombo: 0, glide: 0, shimmy: 0, flora: 0, streak: 0, bestStreak: 0,
  playSec: 0, swings: 0, punches: 0, kicks: 0, freed: 0, cakesAvoided: 0, orchidPetals: 0, silkShed: 0, noHitClears: 0, finished: 0, finishedNormal: 0,
  falls: 0,
});
export const emptyStore = (): BadgeStore => ({ v: 1, earned: {}, kills: {}, seen: [], counters: emptyCounters(), quiet: [] });

/** the slice of a stage record the rules need */
export interface LevelRecord {
  id: string;
  worldIndex: number;
  miniIndex: number;
  completed: boolean;
  stars: number;
}

export interface EvalContext {
  store: BadgeStore;
  levels: LevelRecord[];
  gateFound: boolean;
  thornHeart: boolean;
  /** the ids of Meeca's notes, albums and keepsakes found (finds.ts) */
  finds?: string[];
  /** the stage that just ended, when this evaluation follows one */
  stage?: StageStats;
  /** no cake has been eaten in World 5 in this game (w5Kit.ts anyCakeEaten) */
  cakeFree?: boolean;
}

/** which art a medal shows on its tier medallion (src/assets/ui/medals.webp, medalAtlasData.ts) */
export type Emblem =
  | 'paw' | 'fang' | 'boot' | 'flower' | 'star' | 'stars3' | 'leaf' | 'rope' | 'vine' | 'flame' | 'burst' | 'hourglass' | 'crown' | 'locket'
  | 'cage' | 'compass' | 'fist' | 'kick' | 'cake' | 'orchid' | 'web' | 'shield' | 'feather' | 'book' | 'key' | 'thornheart' | 'bird' | 'moon'
  | 'carving' | 'map' | 'flag' | 'trophy' | 'gem';

export interface BadgeDef {
  id: string;
  name: string;
  desc: string;
  tier: Tier;
  /** the painted emblem, and the drawn icon used until the painted sheet has loaded */
  emblem: Emblem;
  icon: string;
  /** a world medal: its number shows on the medal */
  world?: number;
  /** earned right now? */
  test: (c: EvalContext) => boolean;
  /** progress toward it, in the units it is counted in (`unit`: "min" or "h" for time) */
  progress?: (c: EvalContext) => { have: number; need: number };
  unit?: 'min' | 'h';
  /** the platinum medal's three parts */
  parts?: (c: EvalContext) => Array<{ label: string; done: boolean }>;
}

export const GUARDIANS = [
  'Venom Fang',
  'Crocus Rex',
  'Shadow Prowler',
  'Sky Sovereign',
  'Tarantula Queen',
  'Marsh Reaver',
  'Stone Idol Golem',
  'Night-Wing Monarch',
  'Magma Drake',
  'General Iron-Claw',
] as const;

/** the extra stages that are part of the journey (Dot's netting flight, Meeca's stage); the secret Hollow is not */
const EXTRA_IDS = new Set(['4-D', '5-M']);
/** the stages every medal about "every stage" counts: the hundred numbered ones and the extra stages */
export const journeyStages = (l: LevelRecord[]) => l.filter((x) => (x.miniIndex >= 1 && x.miniIndex <= 10) || EXTRA_IDS.has(x.id));
const journeyCount = (l: LevelRecord[]) => Math.max(1, journeyStages(l).length);
const totalKills = (s: BadgeStore) => Object.values(s.kills).reduce((a, b) => a + b, 0);
const totalStars = (l: LevelRecord[]) => journeyStages(l).reduce((a, x) => a + (x.stars || 0), 0);
const cleared = (l: LevelRecord[]) => journeyStages(l).filter((x) => x.completed).length;
const perfectStages = (l: LevelRecord[]) => journeyStages(l).filter((x) => x.stars >= 3).length;
const allPerfect = (l: LevelRecord[]) => journeyStages(l).length > 0 && journeyStages(l).every((x) => x.stars >= 3);
const bossDone = (l: LevelRecord[], w: number) => l.some((x) => x.worldIndex === w && x.miniIndex === 10 && x.completed);
const guardiansBeaten = (l: LevelRecord[]) => GUARDIANS.filter((_, i) => bossDone(l, i + 1)).length;
const worldStages = (l: LevelRecord[], w: number) => journeyStages(l).filter((x) => x.worldIndex === w);
const worldCleared = (l: LevelRecord[], w: number) => worldStages(l, w).length > 0 && worldStages(l, w).every((x) => x.completed);
const foundCount = (f: string[] = []) => FINDS.filter((x) => f.includes(x.id)).length;
const worldFinds = (w: number) => FINDS.filter((x) => x.world === w);
const worldFound = (f: string[] = [], w: number) => worldFinds(w).every((x) => f.includes(x.id));
/** a world whose ten numbered stages were all cleared with Dot's help on Quiet */
const quietWorld = (s: BadgeStore) => WORLD_NAMES.some((_, i) => Array.from({ length: 10 }, (_, m) => `${i + 1}-${m + 1}`).every((id) => s.quiet.includes(id)));
const quietBest = (s: BadgeStore) => Math.max(...WORLD_NAMES.map((_, i) => Array.from({ length: 10 }, (_, m) => `${i + 1}-${m + 1}`).filter((id) => s.quiet.includes(id)).length));
const count = (n: number, need: number) => ({ have: Math.min(Math.floor(n), need), need });
const isGuardianStage = (id?: string) => !!id && /^\d{1,2}-10$/.test(id);
const won = (c: EvalContext) => !!c.stage?.win;
/** the General beaten on Normal: the counter, or the stage that just ended */
const finishedNormal = (c: EvalContext) => c.store.counters.finishedNormal > 0 || (won(c) && c.stage!.id === '10-10' && c.stage!.difficulty !== 'easy');

type Step = [Tier, number, string];
/**
 * a family of three: bronze, silver and gold. `need` is in the counter's own units (seconds for time); `unit` shows time as minutes or
 * hours on the progress bar. A need of 0 means "all of them" (`all` works it out).
 */
function tiered(
  id: string, name: string, emblem: Emblem, icon: string, steps: Step[], have: (c: EvalContext) => number,
  o: { unit?: 'min' | 'h'; all?: (c: EvalContext) => number } = {},
): BadgeDef[] {
  const per = o.unit === 'min' ? 60 : o.unit === 'h' ? 3600 : 1;
  return steps.map(([tier, need, desc]) => {
    const want = (c: EvalContext) => (need > 0 ? need : o.all!(c));
    return {
      id: `${id}_${need > 0 ? need : 'all'}`,
      name: `${name} ${tier === 'bronze' ? 'I' : tier === 'silver' ? 'II' : 'III'}`,
      desc,
      tier,
      emblem,
      icon,
      test: (c: EvalContext) => have(c) >= want(c),
      progress: (c: EvalContext) => count(have(c) / per, want(c) / per),
      ...(o.unit ? { unit: o.unit } : {}),
    };
  });
}

const one = (id: string, name: string, tier: Tier, emblem: Emblem, icon: string, desc: string, test: (c: EvalContext) => boolean, extra: Partial<BadgeDef> = {}): BadgeDef => ({
  id, name, desc, tier, emblem, icon, test, ...extra,
});

/** World 1-3 clears are bronze, 4-8 silver, 9-10 gold */
const worldTier = (w: number): Tier => (w <= 3 ? 'bronze' : w <= 8 ? 'silver' : 'gold');

export const BADGES: BadgeDef[] = [
  // ── platinum: the whole game ──
  one('rainforest_legend', 'Rainforest Legend', 'platinum', 'gem', 'trophy',
    "Finish the game on Normal, earn 3 stars on every stage and find everything Meeca left behind",
    (c) => (!!c.store.earned.jungle_hero || finishedNormal(c)) && allPerfect(c.levels) && allFound(c.finds ?? []),
    {
      parts: (c) => [
        { label: 'Finish on Normal', done: !!c.store.earned.jungle_hero || finishedNormal(c) },
        { label: `3 stars on every stage (${perfectStages(c.levels)}/${journeyCount(c.levels)})`, done: allPerfect(c.levels) },
        { label: `Every find (${foundCount(c.finds)}/${FINDS.length})`, done: allFound(c.finds ?? []) },
      ],
    }),

  // ── the families: bronze, silver, gold ──
  ...tiered('cleared', 'Explorer', 'compass', 'compass', [
    ['bronze', 10, 'Clear 10 stages'],
    ['silver', 50, 'Clear 50 stages'],
    ['gold', 0, 'Clear every stage of the journey'],
  ], (c) => cleared(c.levels), { all: (c) => journeyCount(c.levels) }),
  ...tiered('predators', 'Predator Patrol', 'fang', 'paw', [
    ['bronze', 50, 'Defeat 50 predators'],
    ['silver', 300, 'Defeat 300 predators'],
    ['gold', 1000, 'Defeat 1,000 predators'],
  ], (c) => totalKills(c.store)),
  ...tiered('stomps', 'Stomper', 'boot', 'boot', [
    ['bronze', 25, 'Stomp 25 enemies'],
    ['silver', 200, 'Stomp 200 enemies'],
    ['gold', 1000, 'Stomp 1,000 enemies'],
  ], (c) => c.store.counters.stomps),
  ...tiered('flora', 'Fruit Basket', 'flower', 'harvest', [
    ['bronze', 250, 'Pick 250 flowers, leaves and fruit'],
    ['silver', 2000, 'Pick 2,000 flowers, leaves and fruit'],
    ['gold', 10000, 'Pick 10,000 flowers, leaves and fruit'],
  ], (c) => c.store.counters.flora),
  ...tiered('stars', 'Star Collector', 'star', 'star', [
    ['bronze', 30, 'Collect 30 stars'],
    ['silver', 150, 'Collect 150 stars'],
    ['gold', 300, 'Collect 300 stars'],
  ], (c) => totalStars(c.levels)),
  ...tiered('perfect', 'Perfect Collector', 'stars3', 'sparkle', [
    ['bronze', 5, 'Earn 3 stars on 5 stages'],
    ['silver', 30, 'Earn 3 stars on 30 stages'],
    ['gold', 100, 'Earn 3 stars on 100 stages'],
  ], (c) => perfectStages(c.levels)),
  ...tiered('glide', 'Leaf Surfer', 'leaf', 'leaf', [
    ['bronze', 60, 'Glide on the leaf for 1 minute in all'],
    ['silver', 600, 'Glide on the leaf for 10 minutes in all'],
    ['gold', 2700, 'Glide on the leaf for 45 minutes in all'],
  ], (c) => c.store.counters.glide, { unit: 'min' }),
  ...tiered('shimmy', 'Rope Master', 'rope', 'vine', [
    ['bronze', 60, 'Creep along ropes for 1 minute in all'],
    ['silver', 600, 'Creep along ropes for 10 minutes in all'],
    ['gold', 1800, 'Creep along ropes for 30 minutes in all'],
  ], (c) => c.store.counters.shimmy, { unit: 'min' }),
  ...tiered('streak', 'Hot Streak', 'flame', 'gauntlet', [
    ['bronze', 3, 'Clear 3 stages in a row without losing a life'],
    ['silver', 10, 'Clear 10 stages in a row without losing a life'],
    ['gold', 30, 'Clear 30 stages in a row without losing a life'],
  ], (c) => c.store.counters.bestStreak),
  ...tiered('combo', 'Combo King', 'burst', 'burst', [
    ['bronze', 10, 'Reach a 10-hit combo'],
    ['silver', 25, 'Reach a 25-hit combo'],
    ['gold', 50, 'Reach a 50-hit combo'],
  ], (c) => c.store.counters.bestCombo),
  ...tiered('playtime', 'Long Road', 'hourglass', 'sprint', [
    ['bronze', 1800, 'Play for 30 minutes'],
    ['silver', 18000, 'Play for 5 hours'],
    ['gold', 72000, 'Play for 20 hours'],
  ], (c) => c.store.counters.playSec, { unit: 'h' }),
  ...tiered('guardians', 'Guardian Breaker', 'crown', 'crown', [
    ['bronze', 1, 'Beat a world guardian'],
    ['silver', 5, 'Beat 5 world guardians'],
    ['gold', 10, 'Beat all 10 world guardians'],
  ], (c) => guardiansBeaten(c.levels)),
  ...tiered('finds', 'Keepsake Hunter', 'locket', 'key', [
    ['bronze', 3, "Find 3 of Meeca's notes, albums and keepsakes"],
    ['silver', 15, "Find 15 of Meeca's notes, albums and keepsakes"],
    ['gold', 0, "Find all 30 of Meeca's notes, albums and keepsakes"],
  ], (c) => foundCount(c.finds), { all: () => FINDS.length }),
  ...tiered('freed', 'Friends Freed', 'cage', 'cage', [
    ['bronze', 10, 'Free 10 friends from cages, nests and cocoons'],
    ['silver', 75, 'Free 75 friends from cages, nests and cocoons'],
    ['gold', 300, 'Free 300 friends from cages, nests and cocoons'],
  ], (c) => c.store.counters.freed),
  ...tiered('swings', 'Vine Swinger', 'vine', 'vine', [
    ['bronze', 25, 'Swing on 25 vines'],
    ['silver', 300, 'Swing on 300 vines'],
    ['gold', 1000, 'Swing on 1,000 vines'],
  ], (c) => c.store.counters.swings),
  ...tiered('punches', 'Haymaker', 'fist', 'swords', [
    ['bronze', 50, 'Land 50 punches'],
    ['silver', 400, 'Land 400 punches'],
    ['gold', 1500, 'Land 1,500 punches'],
  ], (c) => c.store.counters.punches),
  ...tiered('kicks', 'High Kick', 'kick', 'bolt', [
    ['bronze', 50, 'Land 50 kicks'],
    ['silver', 400, 'Land 400 kicks'],
    ['gold', 1500, 'Land 1,500 kicks'],
  ], (c) => c.store.counters.kicks),
  ...tiered('cakes', 'Cake Dodger', 'cake', 'shield', [
    ['bronze', 10, "Say no to 10 of the Queen's cakes (walk past them, or punch the tray away)"],
    ['silver', 40, "Say no to 40 of the Queen's cakes"],
    ['gold', 120, "Say no to 120 of the Queen's cakes"],
  ], (c) => c.store.counters.cakesAvoided),
  ...tiered('orchids', 'Orchid Catcher', 'orchid', 'flower', [
    ['bronze', 25, 'Catch 25 petals in the orchids before they close'],
    ['silver', 150, 'Catch 150 petals in the orchids before they close'],
    ['gold', 500, 'Catch 500 petals in the orchids before they close'],
  ], (c) => c.store.counters.orchidPetals),
  ...tiered('silk', 'Silk Shaker', 'web', 'ghost', [
    ['bronze', 5, 'Shake the creeping silk off 5 times'],
    ['silver', 40, 'Shake the creeping silk off 40 times'],
    ['gold', 150, 'Shake the creeping silk off 150 times'],
  ], (c) => c.store.counters.silkShed),

  // ── bronze: first feats ──
  one('first_steps', 'First Steps', 'bronze', 'paw', 'paw', 'Clear your first stage', (c) => cleared(c.levels) >= 1),
  one('flawless', 'Flawless', 'bronze', 'shield', 'shield', 'Clear a stage without losing a life', (c) => won(c) && c.stage!.livesLost === 0),
  one('green_thumb', 'Green Thumb', 'bronze', 'flower', 'flower', 'Pick every flower, leaf and fruit in a stage',
    (c) => won(c) && c.stage!.floraTotal >= 5 && c.stage!.floraCollected >= c.stage!.floraTotal),
  one('stomp_chain', 'Bouncy', 'bronze', 'boot', 'boot', 'Stomp 3 enemies without touching the ground', (c) => (c.stage?.maxStompChain ?? 0) >= 3),
  one('pest_control', 'Pest Control', 'bronze', 'fang', 'purge', 'Defeat 10 predators in a single stage',
    (c) => won(c) && Object.values(c.stage!.kills).reduce((a, b) => a + b, 0) >= 10),

  // ── silver: skill ──
  one('untouchable', 'Untouchable', 'silver', 'feather', 'ghost', 'Clear a stage without taking a single hit', (c) => won(c) && c.stage!.heartsLost === 0),
  one('ghost_walk', 'Ghost Walk', 'silver', 'feather', 'ghost', 'Clear 10 stages without taking a single hit',
    (c) => c.store.counters.noHitClears >= 10, { progress: (c) => count(c.store.counters.noHitClears, 10) }),
  one('sky_stomper', 'Sky Stomper', 'silver', 'boot', 'boot', 'Stomp 6 enemies without touching the ground', (c) => (c.stage?.maxStompChain ?? 0) >= 6),
  one('garden_keeper', 'Garden Keeper', 'silver', 'flower', 'flower', 'Pick every flower, leaf and fruit in a stage without being hit',
    (c) => won(c) && c.stage!.floraTotal >= 5 && c.stage!.floraCollected >= c.stage!.floraTotal && c.stage!.heartsLost === 0),
  // (every card in the journal but the guardians: the predators and the ones met on the road, Matt 2026-10-29. Its id stays, so a
  // medal already won for the 11 predators stays won)
  one('naturalist', 'Naturalist', 'silver', 'book', 'book', `Meet all ${JOURNAL_CARDS.length} creatures in the journal`,
    (c) => JOURNAL_CARDS.every((id) => cardMet(id, c.store.seen, c.levels)),
    { progress: (c) => count(JOURNAL_CARDS.filter((id) => cardMet(id, c.store.seen, c.levels)).length, JOURNAL_CARDS.length) }),
  one('thorn_finder', 'Thorn Finder', 'silver', 'key', 'key', 'Find the secret gate', (c) => c.gateFound),
  one('not_one_scratch', 'Not One Scratch', 'silver', 'bird', 'hummingbird', "Fly Dot through the General's netting (4-D) without a single scratch",
    (c) => won(c) && c.stage!.id === '4-D' && c.stage!.scratches === 0),
  // (the stage was rebuilt as five puzzle rooms, 2026-10-28: nobody catches her until the end, so the medal is for working them out
  // alone; its id stays, so a medal already won stays won)
  one('unseen_carver', 'Her Own Way', 'silver', 'carving', 'stealth', "Carve all five of Meeca's warnings (5-M) without asking Flicker for a hint",
    (c) => won(c) && c.stage!.id === '5-M' && c.stage!.hints === 0),
  one('quiet_wings', 'Quiet Wings', 'silver', 'moon', 'hummingbird', "Clear all ten stages of a world with Dot's help set to Quiet",
    (c) => quietWorld(c.store), { progress: (c) => count(quietBest(c.store), 10) }),
  one('journeys_end', "Journey's End", 'silver', 'flag', 'medal', 'Defeat General Iron-Claw and finish the game (Easy or Normal)',
    (c) => bossDone(c.levels, 10) || c.store.counters.finished > 0),

  // ── gold: the big ones ──
  one('untouched_guardian', 'Untouched Guardian', 'gold', 'shield', 'boss', 'Beat a world guardian without taking a hit',
    (c) => won(c) && isGuardianStage(c.stage!.id) && c.stage!.heartsLost === 0),
  one('thorn_heart', 'Heart of Thorns', 'gold', 'thornheart', 'thornHeart', 'Free Thornbark and earn the Thorn Heart', (c) => c.thornHeart),
  // World 5: "Nobody has ever not eaten the cake." Beat the Tarantula Queen without eating one, in the whole world (w5Kit.ts)
  one('not_one_crumb', 'Not One Crumb', 'gold', 'cake', 'shield', 'Beat the Tarantula Queen without eating a single cake in World 5',
    (c) => won(c) && c.stage!.id === '5-10' && c.cakeFree === true),
  one('jungle_hero', 'Jungle Hero', 'gold', 'trophy', 'trophy', 'Defeat General Iron-Claw and finish the game on Normal', finishedNormal),

  // ── a medal per world: every stage cleared, and everything Meeca hid there ──
  ...WORLD_NAMES.map((name, i): BadgeDef => ({
    id: `world_${i + 1}`,
    name: `${name} Explored`,
    desc: `Clear every stage of World ${i + 1}`,
    tier: worldTier(i + 1),
    emblem: 'map',
    icon: 'map',
    world: i + 1,
    test: (c) => worldCleared(c.levels, i + 1),
    progress: (c) => count(worldStages(c.levels, i + 1).filter((x) => x.completed).length, Math.max(1, worldStages(c.levels, i + 1).length)),
  })),
  ...WORLD_NAMES.map((name, i): BadgeDef => ({
    id: `world_finds_${i + 1}`,
    name: `${name} Keepsakes`,
    desc: `Find Meeca's note, keepsake and album in World ${i + 1}`,
    tier: 'bronze',
    emblem: 'locket',
    icon: 'key',
    world: i + 1,
    test: (c) => worldFound(c.finds, i + 1),
    progress: (c) => count(worldFinds(i + 1).filter((x) => (c.finds ?? []).includes(x.id)).length, worldFinds(i + 1).length),
  })),
];

export const BADGE_BY_ID: Record<string, BadgeDef> = Object.fromEntries(BADGES.map((b) => [b.id, b]));

/** the points a list of medal ids is worth (ids of medals no longer in the set count nothing) */
export const pointsOf = (ids: Iterable<string>): number => {
  let n = 0;
  for (const id of ids) {
    const b = BADGE_BY_ID[id];
    if (b) n += TIER_POINTS[b.tier];
  }
  return n;
};

/** the rewards for Pokey, unlocked by medal points */
export interface RewardDef {
  id: 'berry' | 'sparkle' | 'golden' | 'moonlight';
  name: string;
  need: number;
  kind: 'color' | 'trail';
  blurb: string;
}
export const REWARDS: RewardDef[] = [
  { id: 'berry', name: 'Berry Pokey', need: 250, kind: 'color', blurb: 'A rosy berry coat' },
  { id: 'sparkle', name: 'Sparkle Trail', need: 750, kind: 'trail', blurb: 'Stardust follows every step' },
  { id: 'golden', name: 'Golden Pokey', need: 1500, kind: 'color', blurb: 'Shines like jungle gold' },
  { id: 'moonlight', name: 'Moonlight Pokey', need: 2500, kind: 'color', blurb: 'A silvery night coat' },
];

/** every medal the player has right now (earned before, or satisfied now) */
export function evaluate(c: EvalContext): string[] {
  const out: string[] = [];
  for (const b of BADGES) if (c.store.earned[b.id] || b.test(c)) out.push(b.id);
  return out;
}

/** fold a finished stage into the store (counters, journal) */
export function recordStage(store: BadgeStore, s: StageStats): BadgeStore {
  const kills = { ...store.kills };
  for (const [k, n] of Object.entries(s.kills)) kills[k] = (kills[k] ?? 0) + n;
  // (and the road cards a cleared stage meets: they are stage actors, which the engine does not count as seen, journalMet.ts)
  const seen = Array.from(new Set([...store.seen, ...s.seen, ...(s.win && s.id ? roadCardsIn(s.id) : [])]));
  const c = store.counters;
  // a clean clear (won, no life lost) extends the streak; anything else ends it
  const streak = s.win && s.livesLost === 0 ? c.streak + 1 : 0;
  const end = s.win && s.id === '10-10';
  const quiet = s.win && s.quiet && s.id && !store.quiet.includes(s.id) ? [...store.quiet, s.id] : store.quiet;
  return {
    ...store,
    kills,
    seen,
    quiet,
    counters: {
      stomps: c.stomps + s.stomps,
      bestCombo: Math.max(c.bestCombo, s.maxCombo),
      glide: c.glide + (s.glideSec ?? 0),
      shimmy: c.shimmy + (s.shimmySec ?? 0),
      flora: c.flora + s.floraCollected,
      streak,
      bestStreak: Math.max(c.bestStreak, streak),
      // (a stage left running for hours counts two at most)
      playSec: c.playSec + Math.min(7200, Math.max(0, s.timeSec || 0)),
      swings: c.swings + (s.swings ?? 0),
      punches: c.punches + (s.punches ?? 0),
      kicks: c.kicks + (s.kicks ?? 0),
      freed: c.freed + (s.freed ?? 0),
      cakesAvoided: c.cakesAvoided + (s.cakesAvoided ?? 0),
      orchidPetals: c.orchidPetals + (s.orchidPetals ?? 0),
      silkShed: c.silkShed + (s.silkShed ?? 0),
      noHitClears: c.noHitClears + (s.win && s.heartsLost === 0 && s.livesLost === 0 ? 1 : 0),
      finished: end ? 1 : c.finished,
      finishedNormal: end && s.difficulty !== 'easy' ? 1 : c.finishedNormal,
      falls: c.falls + Math.max(0, s.livesLost || 0),
    },
  };
}

/** add newly satisfied medals to the store; returns the new store and which medals are new */
export function award(store: BadgeStore, c: Omit<EvalContext, 'store'>, now: number): { store: BadgeStore; fresh: BadgeDef[] } {
  const ctx = { ...c, store };
  const earned = { ...store.earned };
  const fresh: BadgeDef[] = [];
  for (const b of BADGES) {
    if (!earned[b.id] && b.test(ctx)) {
      earned[b.id] = now;
      fresh.push(b);
    }
  }
  return { store: { ...store, earned }, fresh };
}

export const rewardsUnlocked = (points: number) => REWARDS.filter((r) => points >= r.need);

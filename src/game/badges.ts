/**
 * Badges: the Trophy Room's rules.
 *
 * Everything here is pure (no storage, no screens) so it can be tested. The screens keep a `BadgeStore` in
 * localStorage (badgeStore.ts) and call `recordStage` when a stage ends; `evaluate` then says which badges the
 * player now has. Badges that depend on the whole save (stars, cleared stages, the secret) are re-derived from
 * the level records each time, so loading a save or starting a new game can never leave them out of step.
 */

export type Tier = 'bronze' | 'silver' | 'gold';

/** the nine predators a player can meet, in journal order */
export const PREDATORS = ['snake', 'tayra', 'ocelot', 'jaguar', 'boa', 'eagle', 'spider', 'caiman', 'frog', 'harpy'] as const;
export type PredatorId = (typeof PREDATORS)[number];

/** what the engine reports when a stage ends */
export interface StageStats {
  win: boolean;
  stars: number;
  livesLost: number;
  heartsLost: number;
  /** flowers, leaves and fruit in the stage, and how many were picked up */
  floraTotal: number;
  floraCollected: number;
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
}

export interface BadgeStore {
  v: 1;
  earned: Record<string, number>;
  kills: Record<string, number>;
  seen: string[];
  counters: {
    stomps: number;
    bestCombo: number;
    /** lifetime: seconds on the leaf, seconds on ropes, flowers/leaves/fruit picked */
    glide: number;
    shimmy: number;
    flora: number;
    /** stages in a row cleared without losing a life, right now and at best */
    streak: number;
    bestStreak: number;
  };
}

export const emptyStore = (): BadgeStore => ({ v: 1, earned: {}, kills: {}, seen: [], counters: { stomps: 0, bestCombo: 0, glide: 0, shimmy: 0, flora: 0, streak: 0, bestStreak: 0 } });

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
  /** the stage that just ended, when this evaluation follows one */
  stage?: StageStats;
}

export interface BadgeDef {
  id: string;
  name: string;
  desc: string;
  tier: Tier;
  icon: string;
  /** earned right now? */
  test: (c: EvalContext) => boolean;
  /** "62/100" style progress for a badge not yet earned */
  progress?: (c: EvalContext) => { have: number; need: number };
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

const totalKills = (s: BadgeStore) => Object.values(s.kills).reduce((a, b) => a + b, 0);
const totalStars = (l: LevelRecord[]) => l.reduce((a, x) => a + (x.stars || 0), 0);
const cleared = (l: LevelRecord[]) => l.filter((x) => x.completed).length;
const worldLevels = (l: LevelRecord[], w: number) => l.filter((x) => x.worldIndex === w && x.miniIndex <= 10);
const bossDone = (l: LevelRecord[], w: number) => l.some((x) => x.worldIndex === w && x.miniIndex === 10 && x.completed);
const count = (n: number, need: number) => ({ have: Math.min(Math.floor(n), need), need });
const perfectStages = (l: LevelRecord[]) => l.filter((x) => x.stars >= 3).length;
const isGuardianStage = (id?: string) => !!id && /^\d{1,2}-10$/.test(id);

function tiered(id: string, name: string, icon: string, tiers: Array<[Tier, number, string]>, have: (c: EvalContext) => number): BadgeDef[] {
  return tiers.map(([tier, need, desc]) => ({
    id: `${id}_${need}`,
    name: `${name} ${tier === 'bronze' ? 'I' : tier === 'silver' ? 'II' : 'III'}`,
    desc,
    tier,
    icon,
    test: (c) => have(c) >= need,
    progress: (c) => count(have(c), need),
  }));
}

export const BADGES: BadgeDef[] = [
  // a single stage, done well
  { id: 'first_steps', name: 'First Steps', desc: 'Clear your first stage', tier: 'bronze', icon: 'paw', test: (c) => cleared(c.levels) >= 1 },
  { id: 'perfect_stage', name: 'Perfect Stage', desc: 'Earn 3 stars on a stage', tier: 'gold', icon: 'star', test: (c) => (!!c.stage?.win && c.stage.stars >= 3) || c.levels.some((l) => l.stars >= 3) },
  { id: 'flawless', name: 'Flawless', desc: 'Clear a stage without losing a life', tier: 'silver', icon: 'shield', test: (c) => !!c.stage?.win && c.stage.livesLost === 0 },
  { id: 'untouchable', name: 'Untouchable', desc: 'Clear a stage without taking a single hit', tier: 'gold', icon: 'ghost', test: (c) => !!c.stage?.win && c.stage.heartsLost === 0 },
  { id: 'green_thumb', name: 'Green Thumb', desc: 'Pick every flower, leaf and fruit in a stage', tier: 'silver', icon: 'flower', test: (c) => !!c.stage?.win && c.stage.floraTotal >= 5 && c.stage.floraCollected >= c.stage.floraTotal },
  { id: 'speedy_sloth', name: 'Speedy Sloth', desc: 'Clear a timed stage in half the time', tier: 'silver', icon: 'bolt', test: (c) => !!c.stage?.win && c.stage.timeLimit > 0 && c.stage.timeSec <= c.stage.timeLimit * 0.5 },
  { id: 'stomp_chain', name: 'Bouncy', desc: 'Stomp 3 enemies without touching the ground', tier: 'silver', icon: 'boot', test: (c) => (c.stage?.maxStompChain ?? 0) >= 3 },
  { id: 'combo_10', name: 'Combo King', desc: 'Reach a 10-hit combo', tier: 'silver', icon: 'burst', test: (c) => c.store.counters.bestCombo >= 10 },

  // the long game
  ...tiered('predators', 'Predator Patrol', 'paw', [
    ['bronze', 25, 'Defeat 25 predators'],
    ['silver', 100, 'Defeat 100 predators'],
    ['gold', 300, 'Defeat 300 predators'],
  ], (c) => totalKills(c.store)),
  ...tiered('stomps', 'Stomper', 'boot', [
    ['bronze', 20, 'Stomp 20 enemies'],
    ['silver', 100, 'Stomp 100 enemies'],
  ], (c) => c.store.counters.stomps),
  ...tiered('stars', 'Star Collector', 'star', [
    ['bronze', 30, 'Collect 30 stars'],
    ['silver', 120, 'Collect 120 stars'],
    ['gold', 270, 'Collect 270 stars'],
  ], (c) => totalStars(c.levels)),
  ...tiered('cleared', 'Explorer', 'compass', [
    ['bronze', 10, 'Clear 10 stages'],
    ['silver', 50, 'Clear 50 stages'],
    ['gold', 100, 'Clear all 100 stages'],
  ], (c) => cleared(c.levels)),

  // harder single-stage feats
  { id: 'untouched_guardian', name: 'Untouched Guardian', desc: 'Beat a world guardian without taking a hit', tier: 'gold', icon: 'boss', test: (c) => !!c.stage?.win && isGuardianStage(c.stage.id) && c.stage.heartsLost === 0 },
  { id: 'pest_control', name: 'Pest Control', desc: 'Defeat 10 predators in a single stage', tier: 'silver', icon: 'purge', test: (c) => !!c.stage?.win && Object.values(c.stage.kills).reduce((a, b) => a + b, 0) >= 10 },
  { id: 'sky_stomper', name: 'Sky Stomper', desc: 'Stomp 6 enemies without touching the ground', tier: 'gold', icon: 'boot', test: (c) => (c.stage?.maxStompChain ?? 0) >= 6 },
  { id: 'lightning_round', name: 'Lightning Round', desc: 'Clear a timed stage in a third of the time', tier: 'gold', icon: 'sprint', test: (c) => !!c.stage?.win && c.stage.timeLimit > 0 && c.stage.timeSec <= c.stage.timeLimit / 3 },
  { id: 'garden_keeper', name: 'Garden Keeper', desc: 'Pick every flower, leaf and fruit in a stage without being hit', tier: 'gold', icon: 'flower', test: (c) => !!c.stage?.win && c.stage.floraTotal >= 5 && c.stage.floraCollected >= c.stage.floraTotal && c.stage.heartsLost === 0 },
  { id: 'combo_20', name: 'Combo Legend', desc: 'Reach a 20-hit combo', tier: 'gold', icon: 'burst', test: (c) => c.store.counters.bestCombo >= 20, progress: (c) => count(c.store.counters.bestCombo, 20) },

  // new skills, new habits
  ...tiered('glide', 'Leaf Surfer', 'leaf', [
    ['bronze', 30, 'Glide on the leaf for 30 seconds in total'],
    ['silver', 120, 'Glide on the leaf for 2 minutes in total'],
    ['gold', 400, 'Glide on the leaf for over 6 minutes in total'],
  ], (c) => c.store.counters.glide),
  ...tiered('shimmy', 'Rope Master', 'vine', [
    ['bronze', 30, 'Shimmy along ropes for 30 seconds in total'],
    ['silver', 120, 'Shimmy along ropes for 2 minutes in total'],
  ], (c) => c.store.counters.shimmy),
  ...tiered('flora', 'Fruit Basket', 'harvest', [
    ['bronze', 200, 'Pick 200 flowers, leaves and fruit'],
    ['silver', 1000, 'Pick 1,000 flowers, leaves and fruit'],
    ['gold', 3000, 'Pick 3,000 flowers, leaves and fruit'],
  ], (c) => c.store.counters.flora),
  ...tiered('perfect', 'Perfect Collector', 'sparkle', [
    ['bronze', 5, 'Earn 3 stars on 5 stages'],
    ['silver', 25, 'Earn 3 stars on 25 stages'],
    ['gold', 60, 'Earn 3 stars on 60 stages'],
  ], (c) => perfectStages(c.levels)),
  ...tiered('streak', 'Hot Streak', 'gauntlet', [
    ['bronze', 3, 'Clear 3 stages in a row without losing a life'],
    ['silver', 10, 'Clear 10 stages in a row without losing a life'],
  ], (c) => c.store.counters.bestStreak),

  // the guardians, one per world
  ...GUARDIANS.map((name, i): BadgeDef => ({
    id: `guardian_${i + 1}`,
    name: `${name} Beaten`,
    desc: `Defeat the World ${i + 1} guardian`,
    tier: i === 9 ? 'gold' : 'bronze',
    icon: 'crown',
    test: (c) => bossDone(c.levels, i + 1),
  })),

  // a whole world, three stars everywhere
  ...Array.from({ length: 10 }, (_, i): BadgeDef => ({
    id: `world_master_${i + 1}`,
    name: `World ${i + 1} Master`,
    desc: `Earn 3 stars on all 10 stages of World ${i + 1}`,
    tier: 'gold',
    icon: 'trophy',
    test: (c) => {
      const w = worldLevels(c.levels, i + 1);
      return w.length >= 10 && w.every((l) => l.stars >= 3);
    },
    progress: (c) => count(worldLevels(c.levels, i + 1).filter((l) => l.stars >= 3).length, 10),
  })),

  // the story and the secrets
  { id: 'naturalist', name: 'Naturalist', desc: 'Meet all 10 predators of the jungle', tier: 'gold', icon: 'book', test: (c) => PREDATORS.every((p) => c.store.seen.includes(p)), progress: (c) => count(PREDATORS.filter((p) => c.store.seen.includes(p)).length, PREDATORS.length) },
  { id: 'thorn_finder', name: 'Thorn Finder', desc: 'Find the secret gate', tier: 'silver', icon: 'key', test: (c) => c.gateFound },
  { id: 'thorn_heart', name: 'Heart of Thorns', desc: 'Free Thornbark and earn the Thorn Heart', tier: 'gold', icon: 'thornHeart', test: (c) => c.thornHeart },
  { id: 'jungle_hero', name: 'Jungle Hero', desc: 'Defeat General Iron-Claw and finish the game', tier: 'gold', icon: 'medal', test: (c) => bossDone(c.levels, 10) },
];

export const BADGE_BY_ID: Record<string, BadgeDef> = Object.fromEntries(BADGES.map((b) => [b.id, b]));

/** the rewards for Pokey, unlocked by how many badges are earned */
export interface RewardDef {
  id: 'berry' | 'sparkle' | 'golden' | 'moonlight';
  name: string;
  need: number;
  kind: 'color' | 'trail';
  blurb: string;
}
export const REWARDS: RewardDef[] = [
  { id: 'berry', name: 'Berry Pokey', need: 5, kind: 'color', blurb: 'A rosy berry coat' },
  { id: 'sparkle', name: 'Sparkle Trail', need: 10, kind: 'trail', blurb: 'Stardust follows every step' },
  { id: 'golden', name: 'Golden Pokey', need: 20, kind: 'color', blurb: 'Shines like jungle gold' },
  { id: 'moonlight', name: 'Moonlight Pokey', need: 30, kind: 'color', blurb: 'A silvery night coat' },
];

/** every badge the player has right now (earned before, or satisfied now) */
export function evaluate(c: EvalContext): string[] {
  const out: string[] = [];
  for (const b of BADGES) if (c.store.earned[b.id] || b.test(c)) out.push(b.id);
  return out;
}

/** fold a finished stage into the store (counters, journal) */
export function recordStage(store: BadgeStore, s: StageStats): BadgeStore {
  const kills = { ...store.kills };
  for (const [k, n] of Object.entries(s.kills)) kills[k] = (kills[k] ?? 0) + n;
  const seen = Array.from(new Set([...store.seen, ...s.seen]));
  const c = store.counters;
  // a clean clear (won, no life lost) extends the streak; anything else ends it
  const streak = s.win && s.livesLost === 0 ? c.streak + 1 : 0;
  return {
    ...store,
    kills,
    seen,
    counters: {
      stomps: c.stomps + s.stomps,
      bestCombo: Math.max(c.bestCombo, s.maxCombo),
      glide: c.glide + (s.glideSec ?? 0),
      shimmy: c.shimmy + (s.shimmySec ?? 0),
      flora: c.flora + s.floraCollected,
      streak,
      bestStreak: Math.max(c.bestStreak, streak),
    },
  };
}

/** add newly satisfied badges to the store; returns the new store and which badges are new */
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

export const rewardsUnlocked = (badgeCount: number) => REWARDS.filter((r) => badgeCount >= r.need);

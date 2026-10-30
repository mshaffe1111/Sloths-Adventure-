import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BADGES, BADGE_BY_ID, REWARDS, TIER_POINTS, TOTAL_POINTS, WORLD_NAMES, award, emptyStore, evaluate, pointsOf, recordStage, rewardsUnlocked,
  type EvalContext, type LevelRecord, type StageStats,
} from './badges.ts';
import { parseBadgeStore } from './badgeStore.ts';
import { FINDS } from './finds.ts';
import { WORLDS_DATA } from './worldsData.ts';
import { EMBLEM_FRAMES, MEDALLION_FRAMES, MEDAL_ATLAS_SIZE } from './medalAtlasData.ts';

const levels = (stars: (w: number, m: number) => number, done = true): LevelRecord[] => {
  const out: LevelRecord[] = [];
  for (let w = 1; w <= 10; w++) for (let m = 1; m <= 10; m++) out.push({ id: `${w}-${m}`, worldIndex: w, miniIndex: m, completed: done, stars: done ? stars(w, m) : 0 });
  return out;
};
const none = levels(() => 0, false);
const stage = (o: Partial<StageStats> = {}): StageStats => ({
  win: true, stars: 1, livesLost: 0, heartsLost: 2, floraTotal: 0, floraCollected: 0, timeSec: 100, timeLimit: 0,
  maxStompChain: 0, maxCombo: 0, stomps: 0, kills: {}, seen: [], ...o,
});
const base = { levels: none, gateFound: false, thornHeart: false };
const allFinds = FINDS.map((f) => f.id);
const earnedNow = (st: Partial<StageStats>, store = emptyStore()) => award(store, { ...base, stage: stage(st) }, 1).fresh.map((b) => b.id);
const has = (c: EvalContext, id: string) => evaluate(c).includes(id);
const withCounters = (o: Partial<ReturnType<typeof emptyStore>['counters']>) => ({ ...emptyStore(), counters: { ...emptyStore().counters, ...o } });

test('about a hundred medals, ids unique, every tier there and one platinum', () => {
  assert.equal(new Set(BADGES.map((b) => b.id)).size, BADGES.length);
  assert.ok(BADGES.length >= 95 && BADGES.length <= 105, `got ${BADGES.length}`);
  assert.equal(BADGES.filter((b) => b.tier === 'platinum').length, 1);
  for (const t of ['bronze', 'silver', 'gold'] as const) assert.ok(BADGES.filter((b) => b.tier === t).length >= 20, t);
});

test('the medals add up to exactly 5,000 points, platinum is 500, and each tier has fixed points', () => {
  assert.equal(TOTAL_POINTS, 5000);
  assert.equal(TIER_POINTS.platinum, 500);
  assert.ok(TIER_POINTS.bronze < TIER_POINTS.silver && TIER_POINTS.silver < TIER_POINTS.gold && TIER_POINTS.gold < TIER_POINTS.platinum);
  const sum = BADGES.reduce((a, b) => a + TIER_POINTS[b.tier], 0);
  assert.equal(sum, TOTAL_POINTS, `the set adds up to ${sum}`);
  assert.equal(pointsOf(BADGES.map((b) => b.id)), TOTAL_POINTS);
  assert.equal(pointsOf(['speedy_sloth', 'world_master_3']), 0, 'retired medals count nothing');
});

test('nothing is about finishing a stage quickly', () => {
  for (const id of ['speedy_sloth', 'lightning_round']) assert.ok(!BADGE_BY_ID[id], id);
  for (const b of BADGES) assert.ok(!/\b(seconds?|quick|fast|half the time|third of the time)\b/i.test(b.desc), `${b.id}: ${b.desc}`);
  // a stage cleared in no time earns nothing a slow clear would not
  const quick = earnedNow({ timeLimit: 120, timeSec: 5 }).sort();
  const slow = earnedNow({ timeLimit: 120, timeSec: 119 }).sort();
  assert.deepEqual(quick, slow);
});

test('the World Masters and the separate guardian medals are gone', () => {
  assert.ok(!BADGES.some((b) => /^world_master_|^guardian_\d/.test(b.id)));
});

test('a fresh game has no medals', () => {
  assert.deepEqual(evaluate({ store: emptyStore(), ...base }), []);
});

test('no silver or gold comes from playing one ordinary stage', () => {
  // the approved single-stage feats (Untouchable, Sky Stomper, Garden Keeper, the guardian, 4-D, 5-M and 5-10 ones) are skill medals;
  // the counters' silvers and golds need much more than one stage
  const big = stage({ kills: { snake: 40 }, stomps: 40, floraCollected: 200, floraTotal: 260, glideSec: 100, shimmySec: 100, swings: 30,
    punches: 60, kicks: 60, freed: 20, cakesAvoided: 20, orchidPetals: 88, silkShed: 10, maxCombo: 20, timeSec: 300 });
  const s = recordStage(emptyStore(), big);
  const tiered = BADGES.filter((b) => b.progress && b.tier !== 'bronze' && !b.world).map((b) => b.id);
  const got = evaluate({ store: s, ...base, finds: [] });
  for (const id of tiered) assert.ok(!got.includes(id), `${id} from one stage`);
});

test('single-stage medals need a win and the right stats', () => {
  const flawless = earnedNow({ livesLost: 0, heartsLost: 0 });
  assert.ok(flawless.includes('flawless') && flawless.includes('untouchable'));
  assert.ok(!earnedNow({ livesLost: 1 }).includes('flawless'));
  assert.ok(!earnedNow({ win: false, livesLost: 0, heartsLost: 0 }).includes('flawless'), 'losing a stage is not flawless');
  assert.equal(BADGE_BY_ID.flawless.tier, 'bronze');
  assert.equal(BADGE_BY_ID.untouchable.tier, 'silver');
  assert.equal(BADGE_BY_ID.sky_stomper.tier, 'silver');
});

test('green thumb needs every flower, and enough of them to mean something', () => {
  assert.ok(earnedNow({ floraTotal: 12, floraCollected: 12 }).includes('green_thumb'));
  assert.ok(!earnedNow({ floraTotal: 12, floraCollected: 11 }).includes('green_thumb'));
  assert.ok(!earnedNow({ floraTotal: 2, floraCollected: 2 }).includes('green_thumb'));
});

test('hard single-stage feats need the right stage and a win', () => {
  assert.ok(earnedNow({ id: '3-10', heartsLost: 0 }).includes('untouched_guardian'));
  assert.ok(!earnedNow({ id: '3-10', heartsLost: 1 }).includes('untouched_guardian'));
  assert.ok(!earnedNow({ id: '3-9', heartsLost: 0 }).includes('untouched_guardian'), 'only a guardian stage counts');
  assert.ok(!earnedNow({ id: '3-10', heartsLost: 0, win: false }).includes('untouched_guardian'));
  assert.ok(earnedNow({ kills: { snake: 6, frog: 4 } }).includes('pest_control'));
  assert.ok(!earnedNow({ kills: { snake: 9 } }).includes('pest_control'));
  assert.ok(earnedNow({ maxStompChain: 6 }).includes('sky_stomper'));
  assert.ok(!earnedNow({ maxStompChain: 5 }).includes('sky_stomper'));
  assert.ok(earnedNow({ floraTotal: 20, floraCollected: 20, heartsLost: 0 }).includes('garden_keeper'));
  assert.ok(!earnedNow({ floraTotal: 20, floraCollected: 20, heartsLost: 1 }).includes('garden_keeper'));
});

test("the story moments: Dot's flight without a scratch, Meeca's warnings without a hint, the Queen's cake", () => {
  assert.ok(earnedNow({ id: '4-D', scratches: 0 }).includes('not_one_scratch'));
  assert.ok(!earnedNow({ id: '4-D', scratches: 1 }).includes('not_one_scratch'));
  assert.ok(!earnedNow({ id: '4-D' }).includes('not_one_scratch'), 'a stage that did not count scratches gives nothing');
  assert.ok(!earnedNow({ id: '4-D', scratches: 0, win: false }).includes('not_one_scratch'));
  assert.ok(earnedNow({ id: '5-M', hints: 0 }).includes('unseen_carver'));
  assert.ok(!earnedNow({ id: '5-M', hints: 2 }).includes('unseen_carver'));
  assert.ok(!earnedNow({ id: '5-M' }).includes('unseen_carver'), 'a stage that did not count hints gives nothing');
  assert.ok(award(emptyStore(), { ...base, stage: stage({ id: '5-10' }), cakeFree: true }, 1).fresh.some((b) => b.id === 'not_one_crumb'));
  assert.ok(!award(emptyStore(), { ...base, stage: stage({ id: '5-10' }), cakeFree: false }, 1).fresh.some((b) => b.id === 'not_one_crumb'));
});

test('counters add up across stages and tiers unlock', () => {
  let s = emptyStore();
  for (let i = 0; i < 10; i++) s = recordStage(s, stage({ kills: { snake: 5 }, stomps: 3, maxCombo: i + 3, seen: ['snake'] }));
  assert.equal(s.kills.snake, 50);
  assert.equal(s.counters.stomps, 30);
  assert.equal(s.counters.bestCombo, 12);
  const got = evaluate({ store: s, ...base });
  assert.ok(got.includes('predators_50') && got.includes('stomps_25') && got.includes('combo_10'));
  assert.ok(!got.includes('predators_300') && !got.includes('combo_25'));
});

test('the new counters (from 2026-10-26) add up: play time, swings, punches, kicks, friends freed, World 5', () => {
  let s = emptyStore();
  const one = stage({ timeSec: 600, swings: 9, punches: 20, kicks: 25, freed: 4, cakesAvoided: 5, orchidPetals: 13, silkShed: 3, heartsLost: 0 });
  for (let i = 0; i < 3; i++) s = recordStage(s, one);
  const c = s.counters;
  assert.deepEqual([c.playSec, c.swings, c.punches, c.kicks, c.freed, c.cakesAvoided, c.orchidPetals, c.silkShed, c.noHitClears], [1800, 27, 60, 75, 12, 15, 39, 9, 3]);
  const got = evaluate({ store: s, ...base });
  for (const id of ['playtime_1800', 'swings_25', 'punches_50', 'kicks_50', 'freed_10', 'cakes_10', 'orchids_25', 'silk_5']) assert.ok(got.includes(id), id);
  assert.ok(!got.includes('playtime_18000') && !got.includes('ghost_walk'));
  // a lost stage still counts its play time and its blows, but not its cakes left on the table (the engine counts those only on a clear)
  s = recordStage(s, stage({ win: false, timeSec: 7200 * 3 }));
  assert.equal(s.counters.playSec, 1800 + 7200, 'a stage left running counts two hours at most');
  assert.deepEqual(BADGE_BY_ID.playtime_18000.progress!({ store: s, ...base }), { have: 2, need: 5 }, 'play time shows in hours');
  assert.deepEqual(BADGE_BY_ID.glide_600.progress!({ store: withCounters({ glide: 250 }), ...base }), { have: 4, need: 10 }, 'glide shows in minutes');
});

test('Ghost Walk: ten clears without a hit, over any number of stages', () => {
  let s = emptyStore();
  for (let i = 0; i < 9; i++) s = recordStage(s, stage({ heartsLost: 0 }));
  s = recordStage(s, stage({ heartsLost: 1 }));
  assert.ok(!has({ store: s, ...base }, 'ghost_walk'));
  s = recordStage(s, stage({ heartsLost: 0 }));
  assert.ok(has({ store: s, ...base }, 'ghost_walk'));
});

test('naturalist needs all 18 journal creatures: the 11 predators and the 7 met on the road', () => {
  const nat = BADGE_BY_ID.naturalist;
  assert.equal(nat.desc, 'Meet all 18 creatures in the journal');
  const predators = ['snake', 'tayra', 'ocelot', 'jaguar', 'boa', 'eagle', 'spider', 'caiman', 'turtle', 'frog', 'harpy'];
  let s = recordStage(emptyStore(), stage({ seen: predators }));
  assert.ok(!has({ store: s, ...base }, 'naturalist'), 'the eleven predators alone are not enough any more');
  assert.deepEqual(nat.progress!({ store: s, ...base }), { have: 11, need: 18 });
  // the road cards are stage actors: a won stage that holds them puts them in the store (one stage at a time)
  for (const id of ['2-9', '4-3', '4-6', '5-2', '5-4']) s = recordStage(s, stage({ id }));
  assert.deepEqual(nat.progress!({ store: s, ...base }), { have: 16, need: 18 });
  assert.ok(!has({ store: s, ...base }, 'naturalist'), 'Pell and the soldiers are still to meet');
  assert.ok(!recordStage(s, stage({ id: '5-M', win: false })).seen.includes('pell'), 'a lost stage meets nobody');
  s = recordStage(s, stage({ id: '5-M' }));
  for (const r of ['royal_guard', 'capuchin', 'eaglet', 'butler', 'seamstress', 'soldier', 'pell']) assert.ok(s.seen.includes(r), r);
  assert.ok(has({ store: s, ...base }, 'naturalist'));
  // a save from before the change: its road stages were cleared, but nothing put the road cards in the store; they count from the clears
  const old = recordStage(emptyStore(), stage({ seen: predators }));
  const cleared: LevelRecord[] = ['2-9', '4-5', '4-6', '5-2', '5-4', '5-M'].map((id) => ({ id, worldIndex: +id[0], miniIndex: 0, completed: true, stars: 1 }));
  assert.ok(has({ store: old, ...base, levels: [...none, ...cleared] }, 'naturalist'));
  // and a medal already won for the eleven predators stays won (its id is the same)
  assert.ok(has({ store: { ...emptyStore(), earned: { naturalist: 1 } }, ...base }, 'naturalist'));
});

test('a perfect save earns every record-based medal; world medals follow their world', () => {
  const all = levels(() => 3);
  const got = evaluate({ store: emptyStore(), levels: all, gateFound: true, thornHeart: true, finds: allFinds });
  const derived = ['first_steps', 'cleared_10', 'cleared_50', 'cleared_all', 'stars_300', 'perfect_100', 'guardians_10', 'finds_all', 'thorn_finder', 'thorn_heart', 'journeys_end',
    ...WORLD_NAMES.flatMap((_, i) => [`world_${i + 1}`, `world_finds_${i + 1}`])];
  for (const id of derived) assert.ok(got.includes(id), `${id} should come from a perfect save`);
  assert.ok(!got.includes('jungle_hero'), 'finishing on Normal is only known once it is played (or was earned before)');
  const w1 = levels((w) => (w === 1 ? 3 : 1)).map((l) => (l.worldIndex === 1 ? l : { ...l, completed: false }));
  const g1 = evaluate({ store: emptyStore(), levels: w1, gateFound: false, thornHeart: false, finds: FINDS.filter((f) => f.world === 1).map((f) => f.id) });
  assert.ok(g1.includes('world_1') && !g1.includes('world_2'));
  assert.ok(g1.includes('world_finds_1') && !g1.includes('world_finds_2'));
  assert.ok(g1.includes('guardians_1') && !g1.includes('guardians_5'));
});

test('the extra stages (4-D, 5-M) are part of "every stage", the secret Hollow is not', () => {
  const lv = [...levels(() => 3), { id: '4-D', worldIndex: 4, miniIndex: 11, completed: true, stars: 3 }, { id: '5-M', worldIndex: 5, miniIndex: 12, completed: false, stars: 0 },
    { id: 'S-1', worldIndex: 7, miniIndex: 11, completed: false, stars: 0 }];
  const c = { store: emptyStore(), levels: lv, gateFound: false, thornHeart: false };
  assert.ok(!has(c, 'cleared_all') && !has(c, 'world_5'), 'Meeca\'s stage is still to clear');
  assert.ok(has(c, 'world_4'));
  assert.deepEqual(BADGE_BY_ID.cleared_all.progress!(c), { have: 101, need: 102 });
  lv[101] = { ...lv[101], completed: true, stars: 3 };
  assert.ok(has(c, 'cleared_all') && has(c, 'world_5'));
});

test('finishing the game: Easy is a silver, Normal a gold (and gives the silver too)', () => {
  const easy = recordStage(emptyStore(), stage({ id: '10-10', difficulty: 'easy' }));
  const ctx = { ...base, store: easy };
  const e = award(easy, { ...base, stage: stage({ id: '10-10', difficulty: 'easy' }) }, 1).fresh.map((b) => b.id);
  assert.ok(e.includes('journeys_end') && !e.includes('jungle_hero'));
  assert.ok(has(ctx, 'journeys_end') && !has(ctx, 'jungle_hero'));
  const normal = recordStage(easy, stage({ id: '10-10', difficulty: 'normal' }));
  assert.ok(has({ ...base, store: normal }, 'jungle_hero') && has({ ...base, store: normal }, 'journeys_end'));
  assert.equal(BADGE_BY_ID.journeys_end.tier, 'silver');
  assert.equal(BADGE_BY_ID.jungle_hero.tier, 'gold');
  // a lost finale gives neither
  assert.equal(recordStage(emptyStore(), stage({ id: '10-10', win: false })).counters.finished, 0);
});

test('Quiet Wings: a whole world cleared with Dot on Quiet', () => {
  let s = emptyStore();
  for (let m = 1; m <= 9; m++) s = recordStage(s, stage({ id: `2-${m}`, quiet: true }));
  s = recordStage(s, stage({ id: '2-10', quiet: false }));
  assert.ok(!has({ store: s, ...base }, 'quiet_wings'));
  assert.deepEqual(BADGE_BY_ID.quiet_wings.progress!({ store: s, ...base }), { have: 9, need: 10 });
  s = recordStage(s, stage({ id: '2-10', quiet: true, win: false }));
  assert.ok(!has({ store: s, ...base }, 'quiet_wings'), 'a lost stage does not count');
  s = recordStage(s, stage({ id: '2-10', quiet: true }));
  s = recordStage(s, stage({ id: '2-10', quiet: true }));
  assert.equal(s.quiet.length, 10, 'a stage is kept once');
  assert.ok(has({ store: s, ...base }, 'quiet_wings'));
});

test('platinum needs all three: Normal finished, 3 stars everywhere, every find', () => {
  const all = levels(() => 3);
  const fin = withCounters({ finished: 1, finishedNormal: 1 });
  assert.ok(has({ store: fin, levels: all, gateFound: false, thornHeart: false, finds: allFinds }, 'rainforest_legend'));
  assert.ok(!has({ store: fin, levels: all, gateFound: false, thornHeart: false, finds: allFinds.slice(1) }, 'rainforest_legend'));
  assert.ok(!has({ store: fin, levels: levels((w, m) => (w === 9 && m === 9 ? 2 : 3)), gateFound: false, thornHeart: false, finds: allFinds }, 'rainforest_legend'));
  assert.ok(!has({ store: withCounters({ finished: 1 }), levels: all, gateFound: false, thornHeart: false, finds: allFinds }, 'rainforest_legend'), 'Easy is not enough');
  // a Jungle Hero earned before this set (any difficulty then) still counts
  const old = { ...emptyStore(), earned: { jungle_hero: 5 } };
  assert.ok(has({ store: old, levels: all, gateFound: false, thornHeart: false, finds: allFinds }, 'rainforest_legend'));
  const parts = BADGE_BY_ID.rainforest_legend.parts!({ store: emptyStore(), levels: all, gateFound: false, thornHeart: false, finds: [] });
  assert.deepEqual(parts.map((p) => p.done), [false, true, false]);
});

test('earned medals stay earned', () => {
  const s = { ...emptyStore(), earned: { flawless: 5, journeys_end: 7 } };
  assert.ok(has({ store: s, ...base }, 'flawless') && has({ store: s, ...base }, 'journeys_end'));
  const r = award(s, base, 9);
  assert.equal(r.store.earned.flawless, 5, 'the original time is kept');
});

test('coats unlock by points: 250, 750, 1,500 and 2,500', () => {
  assert.deepEqual(REWARDS.map((r) => r.need), [250, 750, 1500, 2500]);
  assert.equal(rewardsUnlocked(240).length, 0);
  assert.deepEqual(rewardsUnlocked(750).map((r) => r.id), ['berry', 'sparkle']);
  assert.equal(rewardsUnlocked(TOTAL_POINTS).length, REWARDS.length);
  // the first coat comes from bronzes a new player earns in their first worlds
  assert.ok(TIER_POINTS.bronze * 13 >= 250);
});

test('progress is reported for count-based medals', () => {
  const s = recordStage(emptyStore(), stage({ kills: { snake: 62 } }));
  assert.deepEqual(BADGE_BY_ID.predators_300.progress?.({ store: s, ...base }), { have: 62, need: 300 });
  assert.deepEqual(BADGE_BY_ID.finds_all.progress?.({ store: s, ...base, finds: allFinds.slice(0, 4) }), { have: 4, need: FINDS.length });
});

test('the stored record is validated', () => {
  assert.deepEqual(parseBadgeStore(null), emptyStore());
  assert.deepEqual(parseBadgeStore('not json'), emptyStore());
  assert.deepEqual(parseBadgeStore('{"v":2}'), emptyStore());
  const ok = parseBadgeStore(JSON.stringify({ v: 1, earned: { flawless: 3, 'bad key!': 9 }, kills: { snake: -4 }, seen: ['snake', 5], counters: { stomps: 7, bestCombo: 'x' }, quiet: ['1-1', 'nope', 3, '4-D'] }));
  assert.deepEqual(ok.earned, { flawless: 3 });
  assert.equal(ok.kills.snake, 0);
  assert.deepEqual(ok.seen, ['snake']);
  assert.equal(ok.counters.stomps, 7);
  assert.equal(ok.counters.bestCombo, 0);
  assert.deepEqual(ok.quiet, ['1-1', '4-D']);
});

test('an older saved record (no new counters) loads with zeros and keeps what it had', () => {
  const old = parseBadgeStore(JSON.stringify({ v: 1, earned: { flawless: 3, speedy_sloth: 4 }, kills: { snake: 70 }, seen: [], counters: { stomps: 812, bestCombo: 17, glide: 61 } }));
  assert.equal(old.counters.stomps, 812);
  assert.equal(old.counters.bestCombo, 17);
  assert.deepEqual([old.counters.playSec, old.counters.swings, old.counters.freed, old.counters.finishedNormal, old.counters.streak], [0, 0, 0, 0, 0]);
  assert.deepEqual(old.quiet, []);
  assert.equal(old.earned.flawless, 3);
  // its counters still earn the new medals at once
  const got = evaluate({ store: old, ...base });
  for (const id of ['flawless', 'stomps_25', 'stomps_200', 'predators_50', 'combo_10', 'glide_60']) assert.ok(got.includes(id), id);
  assert.ok(!got.includes('speedy_sloth'), 'a retired medal is not listed');
});

test('the world names match the game', () => {
  assert.deepEqual([...WORLD_NAMES], WORLDS_DATA.slice(0, 10).map((w) => w.name));
});

test('every medal has its painted emblem and tier medallion in the medal sheet', () => {
  for (const b of BADGES) {
    const e = EMBLEM_FRAMES[b.emblem];
    assert.ok(e, `${b.id}: emblem ${b.emblem}`);
    assert.ok(e.x >= 0 && e.y >= 0 && e.x + e.w <= MEDAL_ATLAS_SIZE.w && e.y + e.h <= MEDAL_ATLAS_SIZE.h, `${b.emblem} inside the sheet`);
  }
  for (const t of ['bronze', 'silver', 'gold', 'platinum'] as const) {
    const m = MEDALLION_FRAMES[t];
    assert.ok(m.r > 0.15 && m.r < 0.45 && Math.abs(m.cx - 0.5) < 0.12 && Math.abs(m.cy - 0.5) < 0.12, `${t}: enamel ${JSON.stringify(m)}`);
  }
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { BADGES, BADGE_BY_ID, REWARDS, award, emptyStore, evaluate, recordStage, rewardsUnlocked, type LevelRecord, type StageStats } from './badges.ts';
import { parseBadgeStore } from './badgeStore.ts';

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

test('badge ids are unique and there are about sixty', () => {
  assert.equal(new Set(BADGES.map((b) => b.id)).size, BADGES.length);
  assert.ok(BADGES.length >= 55 && BADGES.length <= 70, `got ${BADGES.length}`);
});

test('a fresh game has no badges', () => {
  assert.deepEqual(evaluate({ store: emptyStore(), levels: none, gateFound: false, thornHeart: false }), []);
});

test('stage badges need a win and the right stats', () => {
  const base = { levels: none, gateFound: false, thornHeart: false };
  const flawless = award(emptyStore(), { ...base, stage: stage({ livesLost: 0, heartsLost: 0 }) }, 1).fresh.map((b) => b.id);
  assert.ok(flawless.includes('flawless') && flawless.includes('untouchable'));
  const lost = award(emptyStore(), { ...base, stage: stage({ livesLost: 1 }) }, 1).fresh.map((b) => b.id);
  assert.ok(!lost.includes('flawless'));
  const loss = award(emptyStore(), { ...base, stage: stage({ win: false, livesLost: 0, heartsLost: 0 }) }, 1).fresh.map((b) => b.id);
  assert.ok(!loss.includes('flawless'), 'losing a stage is not flawless');
});

test('green thumb needs every flower, and enough of them to mean something', () => {
  const base = { levels: none, gateFound: false, thornHeart: false };
  assert.ok(award(emptyStore(), { ...base, stage: stage({ floraTotal: 12, floraCollected: 12 }) }, 1).fresh.some((b) => b.id === 'green_thumb'));
  assert.ok(!award(emptyStore(), { ...base, stage: stage({ floraTotal: 12, floraCollected: 11 }) }, 1).fresh.some((b) => b.id === 'green_thumb'));
  assert.ok(!award(emptyStore(), { ...base, stage: stage({ floraTotal: 2, floraCollected: 2 }) }, 1).fresh.some((b) => b.id === 'green_thumb'));
});

test('speedy sloth only on timed stages', () => {
  const base = { levels: none, gateFound: false, thornHeart: false };
  assert.ok(award(emptyStore(), { ...base, stage: stage({ timeLimit: 120, timeSec: 55 }) }, 1).fresh.some((b) => b.id === 'speedy_sloth'));
  assert.ok(!award(emptyStore(), { ...base, stage: stage({ timeLimit: 120, timeSec: 70 }) }, 1).fresh.some((b) => b.id === 'speedy_sloth'));
  assert.ok(!award(emptyStore(), { ...base, stage: stage({ timeLimit: 0, timeSec: 5 }) }, 1).fresh.some((b) => b.id === 'speedy_sloth'));
});

test('counters add up across stages and tiers unlock', () => {
  let s = emptyStore();
  for (let i = 0; i < 5; i++) s = recordStage(s, stage({ kills: { snake: 5 }, stomps: 4, maxCombo: i + 3, seen: ['snake'] }));
  assert.equal(s.kills.snake, 25);
  assert.equal(s.counters.stomps, 20);
  assert.equal(s.counters.bestCombo, 7);
  const got = evaluate({ store: s, levels: none, gateFound: false, thornHeart: false });
  assert.ok(got.includes('predators_25') && got.includes('stomps_20'));
  assert.ok(!got.includes('predators_100'));
});

test('naturalist needs every predator seen', () => {
  let s = emptyStore();
  s = recordStage(s, stage({ seen: ['snake', 'tayra', 'ocelot', 'jaguar', 'boa', 'eagle', 'spider', 'caiman'] }));
  assert.ok(!evaluate({ store: s, levels: none, gateFound: false, thornHeart: false }).includes('naturalist'));
  s = recordStage(s, stage({ seen: ['frog'] }));
  assert.ok(!evaluate({ store: s, levels: none, gateFound: false, thornHeart: false }).includes('naturalist'), 'the night harpy counts too');
  s = recordStage(s, stage({ seen: ['harpy'] }));
  assert.ok(!evaluate({ store: s, levels: none, gateFound: false, thornHeart: false }).includes('naturalist'), 'the river snapper counts too');
  s = recordStage(s, stage({ seen: ['turtle'] }));
  assert.ok(evaluate({ store: s, levels: none, gateFound: false, thornHeart: false }).includes('naturalist'));
});

test('guardians, world masters and the finale come from the level records', () => {
  const all = levels(() => 3);
  const got = evaluate({ store: emptyStore(), levels: all, gateFound: true, thornHeart: true });
  const derived = BADGES.map((b) => b.id).filter((id) => /^(guardian|world_master|stars|cleared)_/.test(id) || ['first_steps', 'perfect_stage', 'thorn_finder', 'thorn_heart', 'jungle_hero'].includes(id));
  assert.ok(derived.length >= 25);
  for (const id of derived) assert.ok(got.includes(id), `${id} should come from a perfect save`);
  const w1 = levels((w) => (w === 1 ? 3 : 1));
  const g1 = evaluate({ store: emptyStore(), levels: w1, gateFound: false, thornHeart: false });
  assert.ok(g1.includes('world_master_1') && !g1.includes('world_master_2'));
  assert.ok(g1.includes('guardian_1') && g1.includes('jungle_hero'));
});

test('a new game cannot leave stale badges: derived ones follow the levels', () => {
  const fresh = evaluate({ store: emptyStore(), levels: none, gateFound: false, thornHeart: false });
  assert.deepEqual(fresh, []);
});

test('earned badges stay earned', () => {
  const s = { ...emptyStore(), earned: { flawless: 5 } };
  assert.ok(evaluate({ store: s, levels: none, gateFound: false, thornHeart: false }).includes('flawless'));
  const r = award(s, { levels: none, gateFound: false, thornHeart: false }, 9);
  assert.equal(r.store.earned.flawless, 5, 'the original time is kept');
});

test('rewards unlock by count', () => {
  assert.equal(rewardsUnlocked(4).length, 0);
  assert.deepEqual(rewardsUnlocked(10).map((r) => r.id), ['berry', 'sparkle']);
  assert.equal(rewardsUnlocked(99).length, REWARDS.length);
});

test('progress is reported for count-based badges', () => {
  const s = recordStage(emptyStore(), stage({ kills: { snake: 62 } }));
  const b = BADGE_BY_ID['predators_100'];
  assert.deepEqual(b.progress?.({ store: s, levels: none, gateFound: false, thornHeart: false }), { have: 62, need: 100 });
});

test('the stored record is validated', () => {
  assert.deepEqual(parseBadgeStore(null), emptyStore());
  assert.deepEqual(parseBadgeStore('not json'), emptyStore());
  assert.deepEqual(parseBadgeStore('{"v":2}'), emptyStore());
  const ok = parseBadgeStore(JSON.stringify({ v: 1, earned: { flawless: 3, 'bad key!': 9 }, kills: { snake: -4 }, seen: ['snake', 5], counters: { stomps: 7, bestCombo: 'x' } }));
  assert.deepEqual(ok.earned, { flawless: 3 });
  assert.equal(ok.kills.snake, 0);
  assert.deepEqual(ok.seen, ['snake']);
  assert.equal(ok.counters.stomps, 7);
  assert.equal(ok.counters.bestCombo, 0);
});

const base = { levels: none, gateFound: false, thornHeart: false };
const earnedNow = (st: Partial<StageStats>, store = emptyStore()) => award(store, { ...base, stage: stage(st) }, 1).fresh.map((b) => b.id);

test('hard single-stage feats need the right stage and a win', () => {
  assert.ok(earnedNow({ id: '3-10', heartsLost: 0 }).includes('untouched_guardian'));
  assert.ok(!earnedNow({ id: '3-10', heartsLost: 1 }).includes('untouched_guardian'));
  assert.ok(!earnedNow({ id: '3-9', heartsLost: 0 }).includes('untouched_guardian'), 'only a guardian stage counts');
  assert.ok(!earnedNow({ id: '3-10', heartsLost: 0, win: false }).includes('untouched_guardian'));
  assert.ok(earnedNow({ kills: { snake: 6, frog: 4 } }).includes('pest_control'));
  assert.ok(!earnedNow({ kills: { snake: 9 } }).includes('pest_control'));
  assert.ok(earnedNow({ maxStompChain: 6 }).includes('sky_stomper'));
  assert.ok(!earnedNow({ maxStompChain: 5 }).includes('sky_stomper'));
  assert.ok(earnedNow({ timeLimit: 120, timeSec: 40 }).includes('lightning_round'));
  assert.ok(!earnedNow({ timeLimit: 120, timeSec: 41 }).includes('lightning_round'));
  assert.ok(!earnedNow({ timeLimit: 0, timeSec: 1 }).includes('lightning_round'), 'untimed stages have no clock to beat');
  assert.ok(earnedNow({ floraTotal: 20, floraCollected: 20, heartsLost: 0 }).includes('garden_keeper'));
  assert.ok(!earnedNow({ floraTotal: 20, floraCollected: 20, heartsLost: 1 }).includes('garden_keeper'));
  assert.ok(!earnedNow({ floraTotal: 20, floraCollected: 19, heartsLost: 0 }).includes('garden_keeper'));
});

test('glide, rope and fruit totals add up across stages', () => {
  let store = emptyStore();
  store = recordStage(store, stage({ glideSec: 20, shimmySec: 12, floraCollected: 150 }));
  store = recordStage(store, stage({ glideSec: 12.6, shimmySec: 20, floraCollected: 60 }));
  assert.equal(store.counters.glide, 32.6);
  assert.equal(store.counters.shimmy, 32);
  assert.equal(store.counters.flora, 210);
  const got = evaluate({ ...base, store });
  assert.ok(got.includes('glide_30') && !got.includes('glide_120'));
  assert.ok(got.includes('shimmy_30') && !got.includes('shimmy_120'));
  assert.ok(got.includes('flora_200') && !got.includes('flora_1000'));
  assert.deepEqual(BADGE_BY_ID.glide_120.progress!({ ...base, store }), { have: 32, need: 120 }, 'progress shows whole seconds');
});

test('Hot Streak counts clean clears in a row; a lost life, or a lost stage, starts it over', () => {
  let store = emptyStore();
  for (let i = 0; i < 3; i++) store = recordStage(store, stage({ livesLost: 0 }));
  assert.equal(store.counters.streak, 3);
  assert.ok(evaluate({ ...base, store }).includes('streak_3'));
  store = recordStage(store, stage({ livesLost: 1 }));
  assert.equal(store.counters.streak, 0);
  assert.equal(store.counters.bestStreak, 3, 'the best streak is kept');
  store = recordStage(store, stage({ livesLost: 0 }));
  store = recordStage(store, stage({ win: false, livesLost: 0 }));
  assert.equal(store.counters.streak, 0, 'a lost stage ends it too');
  for (let i = 0; i < 10; i++) store = recordStage(store, stage({ livesLost: 0 }));
  assert.ok(evaluate({ ...base, store }).includes('streak_10'));
});

test('Combo Legend and Perfect Collector come from the long record', () => {
  const store = { ...emptyStore(), counters: { ...emptyStore().counters, bestCombo: 20 } };
  assert.ok(evaluate({ ...base, store }).includes('combo_20'));
  const lv = levels((w, m) => (w === 1 && m <= 5 ? 3 : 1));
  const got = evaluate({ store: emptyStore(), levels: lv, gateFound: false, thornHeart: false });
  assert.ok(got.includes('perfect_5') && !got.includes('perfect_25'));
});

test('an older saved record (no new counters) loads with zeros and keeps what it had', () => {
  const old = parseBadgeStore(JSON.stringify({ v: 1, earned: { flawless: 3 }, kills: {}, seen: [], counters: { stomps: 812, bestCombo: 17 } }));
  assert.equal(old.counters.stomps, 812);
  assert.equal(old.counters.bestCombo, 17);
  assert.deepEqual([old.counters.glide, old.counters.shimmy, old.counters.flora, old.counters.streak, old.counters.bestStreak], [0, 0, 0, 0, 0]);
  assert.equal(old.earned.flawless, 3);
});

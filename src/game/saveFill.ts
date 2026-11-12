/**
 * saveFill — a test kit (never imported by the game): fills a storage with the biggest game this version can write, through the
 * game's own writers where they can be called (finds, carvings, play records, the Trophy Room, memories, cosmetics, cakes, the
 * stage asides, the secret) and in the exact shape the rest write (App.tsx stage results via mergeBest, the story flags, the sound
 * settings, the layout roll, the ease-in list). R-165.117: the save file refused the game's own entries once they grew (5-M's
 * carvings, 34 finds); saveRoundTrip.test.ts loads this back, and fails when a save key has no filler here.
 *
 * Writers that use the browser's `localStorage` directly see `mem` (installed as the global for the call).
 */
import { generateAllLevels } from './worldsData.ts';
import { EXTRA_STAGES } from './extraStages.ts';
import { mergeBest } from './stageBest.ts';
import { savePlayRecord, withRun } from './playRecords.ts';
import { layoutKey } from './layoutMemory.ts';
import { markShown } from './wayside.ts';
import { markGateFound, markThornHeart } from './secret.ts';
import { BADGES, emptyCounters } from './badges.ts';
import { TRAITS } from './fight.ts';
import { saveBadgeStore, saveCosmetic } from './badgeStore.ts';
import { ALL_FINDS, saveFinds } from './finds.ts';
import { MEMORY_ORDER, saveMemories } from './storyChapters.ts';
import { DIFFICULTY_KEY, EASE_KEY, EASE_STAGES } from './difficulty.ts';
import { recordCake } from './w5Kit.ts';
import { MEECA_WARNINGS } from './meecaLines.ts';
import { markCarvingsDone, recordCarving } from './meecaCarved.ts';
import { markSeedFound } from './protoStage.ts';
import type { Store } from './saveFile.ts';
import { FIRST_NOTE_KEY, STORY_LETTERS, storyKey, type StoryFlag } from './storyFlags.ts';

const STORY_FLAGS = Object.keys(STORY_LETTERS) as StoryFlag[];

/** a Map-backed storage that is both the saveFile Store and a browser Storage */
export function memStorage(init: Record<string, string> = {}): Store & Storage & { m: Map<string, string> } {
  const m = new Map(Object.entries(init));
  return {
    m,
    getItem: (k: string) => m.get(k) ?? null,
    setItem: (k: string, v: string) => void m.set(k, String(v)),
    removeItem: (k: string) => void m.delete(k),
    keys: () => [...m.keys()],
    key: (i: number) => [...m.keys()][i] ?? null,
    clear: () => m.clear(),
    get length() {
      return m.size;
    },
  };
}

/** run `fn` with `mem` as the browser's localStorage */
export function withLocalStorage<T>(mem: Storage, fn: () => T): T {
  const g = globalThis as { localStorage?: Storage };
  const had = Object.getOwnPropertyDescriptor(g, 'localStorage');
  Object.defineProperty(g, 'localStorage', { value: mem, configurable: true, writable: true });
  try {
    return fn();
  } finally {
    if (had) Object.defineProperty(g, 'localStorage', had);
    else delete g.localStorage;
  }
}

/** every stage id a game can clear: the worlds, the secret and the extra stages (4-D, 5-M) */
export function allStageIds(): string[] {
  return [...new Set([...generateAllLevels().map((l) => l.id), ...EXTRA_STAGES.map((e) => e.config().id)])];
}

/** the first `n` finds collected, written by finds.ts's own saveFinds */
export function fillFinds(mem: Storage, n = ALL_FINDS.length) {
  withLocalStorage(mem, () => saveFinds(ALL_FINDS.slice(0, n).map((f) => f.id)));
}

/** Meeca's stage cleared with all five warnings cut (meecaPlay.ts writes each with recordCarving, then markCarvingsDone) */
export function fillCarvings(mem: Store & Storage) {
  MEECA_WARNINGS.forEach((w, i) =>
    recordCarving({ id: w.id, lines: [...w.lines], along: Math.round(((i + 1) / 6.3) * 1000) / 1000, high: i === 3, caught: 99 }, mem),
  );
  markCarvingsDone(mem);
}

/** the biggest finished game: every stage cleared on both settings, every find, trophy, memory, aside and flag */
export function fillFinishedGame(mem: Store & Storage) {
  const ids = allStageIds();
  // the game's own ids, longest first: every creature (fight.ts TRAITS), every find, every trophy
  const byLength = (a: string[]) => [...a].sort((x, y) => y.length - x.length);
  const creatures = byLength(Object.keys(TRAITS));
  const findIds = byLength(ALL_FINDS.map((f) => f.id));
  const medalIds = byLength(BADGES.map((b) => b.id));
  const kills = Object.fromEntries(creatures.map((c) => [c, 9_999_999]));
  withLocalStorage(mem, () => {
    for (const id of ids) {
      // App.tsx saveLevelProgress: the best kept per setting
      const easy = mergeBest(null, { stars: 3, score: 9_999_999, time: 99_999 }, 'easy');
      mem.setItem(`sloth_lvl_${id}`, JSON.stringify(mergeBest(easy, { stars: 3, score: 9_999_998, time: 99_998 }, 'normal')));
      // playRecords.ts: a first clear at the largest numbers the record keeps, with its 8 finds and 12 medals of the longest ids
      const stats = {
        win: true, timeSec: 9_999_999, stars: 3, livesLost: 99, heartsLost: 999, floraCollected: 9999, floraTotal: 9999, kills,
        maxStompChain: 999, freed: 999, swings: 9999, difficulty: 'easy',
      };
      const rec = withRun(withRun(null, stats as never, { finds: findIds.slice(0, 8), medals: medalIds.slice(0, 12), now: 1e14 }), stats as never, { finds: [], medals: [], now: 1e14 });
      rec.n = 9_999_999;
      rec.w = 9_999_999;
      savePlayRecord(id, rec);
      // layoutMemory.ts: the roll a stage was first played with, or `p<n>` for one kept from the proven list
      mem.setItem(layoutKey(id), String(2 ** 32 - 1));
      const m = /^(\d{1,2})-(\d{1,2})$/.exec(id);
      if (m) for (const f of ['L', 'H', 'F'] as const) markShown(+m[1], +m[2], f, mem);
      if (/^5-\d{1,2}$/.test(id)) recordCake(id, mem);
      // protoStage.ts markSeedFound: a stage's golden seeds, by the find id the stage builders give them (`seed-${seedN}`), or 'seed'
      // where a seed has none (engine.ts: findId ?? 'seed'); writtenKeys.test.ts takes the real ones from built stages
      for (const n of ['seed', 'seed-1', 'seed-2', 'seed-3']) markSeedFound(id, n);
    }
    // App.tsx: every story flag of storyFlags.ts (world intro, halfway scene, the first note, every guardian's card and intro, the gate)
    for (let w = 1; w <= 11; w++) for (const f of STORY_FLAGS) if (f !== 'firstNote') mem.setItem(storyKey(f, w), '1');
    mem.setItem(FIRST_NOTE_KEY, '1');
    markGateFound();
    markThornHeart();
    // the Trophy Room: every trophy, every creature knocked out and seen, every stage cleared on Quiet, every counter at its top
    const counters = Object.fromEntries(Object.keys(emptyCounters()).map((k) => [k, 9_999_999]));
    saveBadgeStore({
      v: 1,
      earned: Object.fromEntries(BADGES.map((b) => [b.id, 1_999_999_999_999])),
      kills,
      seen: creatures.slice(0, 40),
      counters: counters as unknown as ReturnType<typeof emptyCounters>,
      quiet: ids.slice(0, 200),
    });
    saveCosmetic({ coat: 'moonlight', trail: true });
    saveFinds(ALL_FINDS.map((f) => f.id));
    saveMemories([...MEMORY_ORDER]);
    // difficulty.ts: the setting and the ease-in list (at most EASE_STAGES stage ids)
    mem.setItem(DIFFICULTY_KEY, 'normal');
    mem.setItem(EASE_KEY, JSON.stringify(ids.slice(-EASE_STAGES)));
  });
  fillCarvings(mem);
}

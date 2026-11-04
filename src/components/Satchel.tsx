import React, { useMemo, useState } from 'react';
import { PaintedIcon, paint, type AnyIcon } from './icons/PaintedIcon.tsx';
import { FINDS, ALL_FINDS } from '../game/finds.ts';
import { BADGES, type BadgeStore, type EvalContext } from '../game/badges.ts';
import type { CosmeticChoice } from '../game/badgeStore.ts';
import type { MemoryId } from '../game/storyChapters.ts';
import type { LevelConfig } from '../game/types.ts';
import type { SceneEntry } from '../game/sceneList.ts';
import type { PlayRecord } from '../game/playRecords.ts';
import { GUARDIAN_ENTRIES, PREDATOR_ENTRIES, PREDATOR_ORDER, ROAD_ENTRIES, predatorMet, roadMet } from '../game/journal.ts';
import { WORLD_STORIES } from '../game/storyWorlds.ts';
import type { EntryNames } from '../game/pokeyJournal.ts';
import { THORNBARK_LEVEL } from '../game/secret.ts';
import { SceneBackdrop } from './title/TitleScene.tsx';
import { DotPerched, Plaque } from './KitParts.tsx';
import { BackButton, CornerToken } from './nav/Nav.tsx';
import { FindsTab } from './satchel/FindsTab.tsx';
import { TrophiesTab } from './satchel/TrophiesTab.tsx';
import { CreaturesTab } from './satchel/CreaturesTab.tsx';
import { ScenesTab } from './satchel/ScenesTab.tsx';
import { JournalBook } from './satchel/JournalBook.tsx';

/**
 * Pokey's satchel: THE hub for everything kept (Matt, 2026-10-31: "put a satchel on the menu page as a new leaf and have the trophies,
 * the medals, and collectibles in there"). It opens from its own leaf on the start screen, from the pause menu and from the map.
 *   Finds      the notes, albums, keepsakes and Dot's things (FindsTab)
 *   Trophies   the medals (tap one to see it big) and Pokey's rewards: the old Trophy Room, moved in whole (TrophiesTab)
 *   Journal    a book, a page-turn a world: an entry for every stage as it was played, and a review at each world's end (JournalBook)
 *   Scenes     every cutscene in story order, from the prologue, each playable, and "Play all in order" (ScenesTab)
 *   Creatures  the creature cards; tap one for its backstory (CreaturesTab)
 */
export type SatchelTab = 'finds' | 'trophies' | 'journal' | 'scenes' | 'creatures';

const TABS: { id: SatchelTab; name: string; icon: AnyIcon }[] = [
  { id: 'finds', name: 'Finds', icon: 'key' },
  { id: 'trophies', name: 'Trophies', icon: 'trophy' },
  { id: 'journal', name: 'Journal', icon: 'journal' },
  { id: 'scenes', name: 'Scenes', icon: 'scenes' },
  { id: 'creatures', name: 'Creatures', icon: 'paw' },
];

interface Props {
  finds: string[];
  levels: LevelConfig[];
  memories: MemoryId[];
  store: BadgeStore;
  gateFound: boolean;
  thornHeart: boolean;
  choice: CosmeticChoice;
  onChoice: (c: CosmeticChoice) => void;
  records: Record<string, PlayRecord>;
  world?: number;
  initialTab?: SatchelTab;
  onOpenFind: (id: string) => void;
  onPlayScenes: (queue: SceneEntry[]) => void;
  onBack: () => void;
  /** where Back goes, on its tag: "Start Screen", "World Map", "Pause menu" */
  backTo: string;
  /** straight to the start screen (shown when the satchel was opened from somewhere else) */
  onHome?: () => void;
}

export const Satchel: React.FC<Props> = (p) => {
  const { finds, levels, memories, store, gateFound, thornHeart, world = 1, initialTab = 'finds' } = p;
  const [tab, setTab] = useState<SatchelTab>(initialTab);
  const ctx = useMemo<EvalContext>(() => ({ store, levels, gateFound, thornHeart, finds }), [store, levels, gateFound, thornHeart, finds]);
  const progress = useMemo(
    () => ({ cleared: new Set(levels.filter((l) => l.completed).map((l) => l.id)), memories, gateFound, thornHeart }),
    [levels, memories, gateFound, thornHeart],
  );
  const names: EntryNames = useMemo(
    () => ({
      creature: (id, n) => {
        const e = (PREDATOR_ENTRIES as Record<string, { name: string }>)[id];
        const base = e ? e.name.toLowerCase() : id.replace(/_/g, ' ');
        return n === 1 ? base : /s$/.test(base) ? base : `${base}s`;
      },
      find: (id) => ALL_FINDS.find((f) => f.id === id)?.title,
      medal: (id) => BADGES.find((b) => b.id === id)?.name,
    }),
    [],
  );
  // the journal's stages: the game's list, and Thornbark's secret hollow on World 7's page after 7-10 once he is beaten (never a tease)
  const journalStages = useMemo(() => {
    if (!thornHeart) return levels;
    let stars = 3;
    try {
      stars = JSON.parse(localStorage.getItem(`sloth_lvl_${THORNBARK_LEVEL.id}`) || 'null')?.stars || 3;
    } catch {
      /* no storage: three stars, he was beaten */
    }
    return [...levels, { ...THORNBARK_LEVEL, completed: true, stars }];
  }, [levels, thornHeart]);
  const extra = (w: number) => {
    const creatures = [
      ...PREDATOR_ORDER.filter((id) => PREDATOR_ENTRIES[id].first === w && predatorMet(id, store.seen, levels)).map((id) => ({ id, name: PREDATOR_ENTRIES[id].name })),
      ...ROAD_ENTRIES.filter((r) => r.first === w && roadMet(r, levels, store.seen)).map((r) => ({ id: r.id, name: r.name })),
      ...GUARDIAN_ENTRIES.filter((g) => g.world === w && levels.some((l) => l.worldIndex === w && l.miniIndex === 10 && l.completed)).map((g) => ({ id: g.art, name: g.name })),
    ];
    const mine = FINDS.filter((f) => f.world === w);
    const have = mine.filter((f) => finds.includes(f.id));
    return { teaser: WORLD_STORIES[w]?.teaser, creatures, finds: have.length, findTotal: mine.length, found: have.map((f) => f.title) };
  };

  return (
    <div className="tr-screen sh-screen" role="dialog" aria-label="Pokey's satchel">
      <SceneBackdrop world={world} />
      <div className="tr-inner sh-inner">
        <DotPerched size={74} className="tr-dot" />
        <div className="tr-head sh-head">
          <BackButton to={p.backTo} onBack={p.onBack} />
          <div className="tr-titles">
            <Plaque as="h1" className="tr-h1">
              Pokey&apos;s Satchel
            </Plaque>
          </div>
          {/* (one row with Back and the Start Screen token sideways; their own row under the title upright: index.css .sh-head) */}
          <div className="sh-tabs" role="tablist">
            {TABS.map((t) => (
              <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} className={`sh-tab ${tab === t.id ? 'on' : ''}`} onClick={() => setTab(t.id)}>
                <span className="sh-tab-ic">
                  <PaintedIcon name={paint(t.icon)} size="104%" />
                </span>
                {t.name}
              </button>
            ))}
          </div>
          {p.onHome && (
            <span className="sh-home">
              <CornerToken icon="sloth" label="Start Screen" onClick={p.onHome} />
            </span>
          )}
        </div>

        {tab === 'finds' && <FindsTab finds={finds} onOpenFind={p.onOpenFind} />}
        {tab === 'trophies' && <TrophiesTab ctx={ctx} choice={p.choice} onChoice={p.onChoice} />}
        {tab === 'journal' && <JournalBook stages={journalStages} records={p.records} names={names} extra={extra} />}
        {tab === 'scenes' && <ScenesTab progress={progress} onPlay={p.onPlayScenes} />}
        {tab === 'creatures' && <CreaturesTab store={store} levels={levels} />}
      </div>
    </div>
  );
};

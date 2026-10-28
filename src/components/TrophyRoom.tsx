import React, { useMemo, useState } from 'react';
import { BADGES, REWARDS, TIER_NAME, TIER_POINTS, TOTAL_POINTS, evaluate, pointsOf, rewardsUnlocked, type BadgeDef, type BadgeStore, type EvalContext, type LevelRecord } from '../game/badges.ts';
import type { CosmeticChoice } from '../game/badgeStore.ts';
import { GUARDIAN_ENTRIES, PREDATOR_ENTRIES, PREDATOR_ORDER, ROAD_ENTRIES, predatorMet, roadMet } from '../game/journal.ts';
import type { Coat } from '../game/heroTint.ts';
import { BadgeMedal } from './BadgeMedal.tsx';
import { CoatPreview } from './CoatPreview.tsx';
import { CreaturePic } from './CreaturePic.tsx';
import { Icon } from './icons/index.tsx';
import { BONUS_FIND, FINDS, allFound, type FindDef } from '../game/finds.ts';
import { photoUrl } from '../game/photos.ts';
import { itemUrl } from '../game/items.ts';
import { MEMORIES, MEMORY_ORDER, type MemoryId } from '../game/storyChapters.ts';
import { SceneBackdrop } from './title/TitleScene.tsx';
import { DotPerched, Plaque } from './KitParts.tsx';

interface Props {
  store: BadgeStore;
  levels: LevelRecord[];
  gateFound: boolean;
  thornHeart: boolean;
  choice: CosmeticChoice;
  onChoice: (c: CosmeticChoice) => void;
  onBack: () => void;
  /** which tab to open on (default: the badges) */
  initialTab?: 'badges' | 'journal' | 'library';
  /** the ids of the notes, books and keepsakes found so far */
  finds: string[];
  /** open one of them to read it again */
  onOpenFind: (id: string) => void;
  /** the flashbacks seen so far, and a way to watch one again */
  memories?: MemoryId[];
  onReplayMemory?: (id: MemoryId) => void;
  /** the world whose painting lives behind the room (the one last played) */
  world?: number;
}

const fmt = (n: number) => n.toLocaleString('en-US');

/** each card's window shows the far painting of the world the creature lives in (2026-10-28), behind its picture or its shadow */
let FAR: Record<string, string> = {};
try {
  FAR = import.meta.glob('../assets/backdrops/w*-far.webp', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
} catch {
  FAR = {};
}
const cardWorld = (w: number): React.CSSProperties | undefined => {
  const u = FAR[`../assets/backdrops/w${w}-far.webp`];
  return u ? ({ ['--cw' as string]: `url("${u}")` } as React.CSSProperties) : undefined;
};
const unitLabel = (b: BadgeDef, have: number, need: number) =>
  b.unit === 'h' ? `${have} of ${need} h` : b.unit === 'min' ? `${have} of ${need} min` : `${fmt(have)} of ${fmt(need)}`;

/** one medal in the grid: the painted medal, its name, how it is earned, its points and (for a counter) a progress bar */
const MedalCell: React.FC<{ b: BadgeDef; got: boolean; ctx: EvalContext }> = ({ b, got, ctx }) => {
  const p = !got ? b.progress?.(ctx) : undefined;
  return (
    <div className={`tr-badge ${got ? 'got' : ''}`}>
      <BadgeMedal badge={b} earned={got} size={60} />
      <div className="tr-bt">
        <div className="tr-bn">{b.name}</div>
        <div className="tr-bd">{b.desc}</div>
        {p && p.need > 1 && (
          <div className="tr-pg" aria-label={unitLabel(b, p.have, p.need)}>
            <div className="tr-pgbar">
              <i style={{ width: `${Math.min(100, (p.have / p.need) * 100)}%` }} />
            </div>
            <span>{unitLabel(b, p.have, p.need)}</span>
          </div>
        )}
        <div className={`tr-pts tr-pts-${b.tier}`}>
          {got ? <Icon name="check" size={11} /> : null}
          {TIER_POINTS[b.tier]} pts
        </div>
      </div>
    </div>
  );
};

export const TrophyRoom: React.FC<Props> = ({ store, levels, gateFound, thornHeart, choice, onChoice, onBack, initialTab = 'badges', finds, onOpenFind, memories = [], onReplayMemory, world = 1 }) => {
  const [tab, setTab] = useState<'badges' | 'journal' | 'library'>(initialTab);
  const ctx = useMemo<EvalContext>(() => ({ store, levels, gateFound, thornHeart, finds }), [store, levels, gateFound, thornHeart, finds]);
  const earnedIds = useMemo(() => new Set(evaluate(ctx)), [ctx]);
  const earnedCount = earnedIds.size;
  const points = pointsOf(earnedIds);
  const unlocked = rewardsUnlocked(points);
  const unlockedIds = new Set(unlocked.map((r) => r.id));
  const plat = BADGES.find((b) => b.tier === 'platinum')!;
  const platGot = earnedIds.has(plat.id);

  const metCount = PREDATOR_ORDER.filter((p) => predatorMet(p, store.seen, levels)).length;
  const roadCount = ROAD_ENTRIES.filter((r) => roadMet(r, levels)).length;
  const bossDone = (w: number) => levels.some((l) => l.worldIndex === w && l.miniIndex === 10 && l.completed);

  const wear = (coat: Coat) => onChoice({ ...choice, coat: choice.coat === coat ? 'none' : coat });

  return (
    <div className="tr-screen" role="dialog" aria-label="Trophy Room">
      <SceneBackdrop world={world} />
      <div className="tr-inner">
        {/* Dot keeps the cards: perched on the panel's edge */}
        <DotPerched size={74} className="tr-dot" />
        <div className="tr-head">
          <button type="button" className="ui-x" onClick={onBack} aria-label="Back">
            <Icon name="arrow" size={16} rotate={180} />
          </button>
          <div className="tr-titles">
            <Plaque as="h1" className="tr-h1">
              Trophy Room
            </Plaque>
            <div className="tr-sub">
              <b className="tr-points">{fmt(points)}</b> of {fmt(TOTAL_POINTS)} points · {earnedCount} of {BADGES.length} medals
            </div>
          </div>
        </div>
        <div className="tr-bar" role="progressbar" aria-valuemin={0} aria-valuemax={TOTAL_POINTS} aria-valuenow={points} aria-label="Medal points">
          <i style={{ width: `${(points / TOTAL_POINTS) * 100}%` }} />
        </div>

        <div className="tr-tabs" role="tablist">
          <button type="button" role="tab" aria-selected={tab === 'badges'} className={tab === 'badges' ? 'on' : ''} onClick={() => setTab('badges')}>
            Medals
          </button>
          <button type="button" role="tab" aria-selected={tab === 'journal'} className={tab === 'journal' ? 'on' : ''} onClick={() => setTab('journal')}>
            Jungle Journal
          </button>
          <button type="button" role="tab" aria-selected={tab === 'library'} className={tab === 'library' ? 'on' : ''} onClick={() => setTab('library')}>
            Library
          </button>
        </div>

        {tab === 'badges' && (
          <>
            <div className={`tr-plat ${platGot ? 'got' : ''}`}>
              <BadgeMedal badge={plat} earned={platGot} size={96} />
              <div className="tr-plat-t">
                <div className="tr-plat-k">Platinum · {TIER_POINTS.platinum} points</div>
                <div className="tr-plat-n">{plat.name}</div>
                <div className="tr-bd">{plat.desc}</div>
                <ul className="tr-plat-parts">
                  {plat.parts!(ctx).map((q) => (
                    <li key={q.label} className={q.done || platGot ? 'done' : ''}>
                      <Icon name={q.done || platGot ? 'check' : 'lock'} size={12} />
                      {q.label}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="tr-sec">Rewards for Pokey</div>
            <div className="tr-rewards">
              {REWARDS.map((r) => {
                const got = unlockedIds.has(r.id);
                const worn = r.kind === 'color' ? choice.coat === r.id : choice.trail;
                return (
                  <button
                    key={r.id}
                    type="button"
                    disabled={!got}
                    className={`tr-reward ${got ? 'got' : ''} ${worn ? 'worn' : ''}`}
                    onClick={() => (r.kind === 'color' ? wear(r.id as Coat) : onChoice({ ...choice, trail: !choice.trail }))}
                    aria-pressed={worn}
                  >
                    <div className="tr-reward-pic">
                      {r.kind === 'color' ? <CoatPreview coat={r.id as Coat} size={58} /> : <span className="tr-sparkle"><Icon name="sparkle" size={40} /></span>}
                      {!got && <span className="tr-lockmark"><Icon name="lock" size={18} /></span>}
                    </div>
                    <b>{r.name}</b>
                    <small>{got ? (worn ? 'Wearing' : 'Tap to wear') : `${fmt(r.need)} points`}</small>
                  </button>
                );
              })}
            </div>

            {(['gold', 'silver', 'bronze'] as const).map((tier) => {
              const list = BADGES.filter((b) => b.tier === tier);
              const got = list.filter((b) => earnedIds.has(b.id)).length;
              return (
                <React.Fragment key={tier}>
                  <div className={`tr-sec tr-sec-${tier}`}>
                    {TIER_NAME[tier]} <small>· {TIER_POINTS[tier]} points each · {got} of {list.length}</small>
                  </div>
                  <div className="tr-grid">
                    {list.map((b) => (
                      <MedalCell key={b.id} b={b} got={earnedIds.has(b.id)} ctx={ctx} />
                    ))}
                  </div>
                </React.Fragment>
              );
            })}
          </>
        )}

        {tab === 'journal' && (
          <>
            <div className="tr-sub tr-jsub">
              {metCount} of {PREDATOR_ORDER.length} predators met · {roadCount} of {ROAD_ENTRIES.length} others · {GUARDIAN_ENTRIES.filter((g) => bossDone(g.world)).length} of {GUARDIAN_ENTRIES.length} guardians beaten
            </div>
            <div className="tr-sec">Predators</div>
            <div className="tr-grid tr-grid-j">
              {PREDATOR_ORDER.map((id) => {
                const e = PREDATOR_ENTRIES[id];
                const met = predatorMet(id, store.seen, levels);
                const n = store.kills[id] ?? 0;
                return (
                  <div key={id} className={`tr-card ${met ? '' : 'lock'}`}>
                    <div className="tr-cpic" style={cardWorld(e.first)}>
                      <CreaturePic id={id} w={120} h={74} locked={!met} />
                    </div>
                    <div className="tr-cn">{met ? e.name : '???'}</div>
                    <div className="tr-ct">{met ? e.tip : 'Not met yet. Keep exploring.'}</div>
                    <div className="tr-cf">
                      <span>From World {e.first}</span>
                      <b>{met ? `Defeated ×${n}` : <Icon name="lock" size={13} label="Not met yet" />}</b>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="tr-sec">Met on the road</div>
            <div className="tr-grid tr-grid-j">
              {ROAD_ENTRIES.map((r) => {
                const met = roadMet(r, levels);
                return (
                  <div key={r.id} className={`tr-card ${met ? '' : 'lock'}`}>
                    <div className="tr-cpic" style={cardWorld(r.first)}>
                      <CreaturePic id={r.id} w={120} h={74} locked={!met} />
                    </div>
                    <div className="tr-cn">{met ? r.name : '???'}</div>
                    <div className="tr-ct">{met ? r.tip : 'Not met yet. Keep exploring.'}</div>
                    <div className="tr-cf">
                      <span>From World {r.first}</span>
                      <b>{met ? <Icon name="check" size={14} label="Met" /> : <Icon name="lock" size={13} label="Not met yet" />}</b>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="tr-sec">Guardians</div>
            <div className="tr-grid tr-grid-j">
              {GUARDIAN_ENTRIES.map((g) => {
                const done = bossDone(g.world);
                return (
                  <div key={g.world} className={`tr-card ${done ? '' : 'lock'}`}>
                    <div className="tr-cpic" style={cardWorld(g.world)}>
                      <CreaturePic id={g.art} w={120} h={74} locked={!done} />
                    </div>
                    <div className="tr-cn">{done ? g.name : '???'}</div>
                    <div className="tr-ct">{done ? `Guardian of World ${g.world}. Defeated.` : `Guardian of World ${g.world}. Beat the 10th stage to meet it.`}</div>
                    <div className="tr-cf">
                      <span>World {g.world}</span>
                      <b>{done ? <Icon name="check" size={14} label="Defeated" /> : <Icon name="lock" size={13} label="Locked" />}</b>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
        {tab === 'library' && (
          <>
            <div className="tr-sub tr-jsub">
              {FINDS.filter((f) => finds.includes(f.id)).length} of {FINDS.length} found · tap a found one to read it again
            </div>
            {([['note', 'Notes from Meeca'], ['book', 'Photo albums'], ['keepsake', 'Keepsakes']] as const).map(([kind, title]) => (
              <React.Fragment key={kind}>
                <div className="tr-sec">{title}</div>
                <div className="tr-grid tr-grid-j">
                  {FINDS.filter((f) => f.kind === kind).map((f) => {
                    const got = finds.includes(f.id);
                    return (
                      <div
                        key={f.id}
                        className={`tr-card tr-find ${got ? 'open' : 'lock'}`}
                        role={got ? 'button' : undefined}
                        tabIndex={got ? 0 : undefined}
                        onClick={got ? () => onOpenFind(f.id) : undefined}
                        onKeyDown={got ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpenFind(f.id); } } : undefined}
                      >
                        <div className="tr-cpic">{got ? findPic(f) : <Icon name="lock" size={34} />}</div>
                        <div className="tr-cn">{got ? f.title : '???'}</div>
                        <div className="tr-ct">{got ? `World ${f.world}` : f.hint}</div>
                      </div>
                    );
                  })}
                </div>
              </React.Fragment>
            ))}
            {onReplayMemory && (
              <>
                <div className="tr-sec">Story scenes</div>
                <div className="tr-grid tr-grid-j">
                  {MEMORY_ORDER.map((id) => {
                    const got = memories.includes(id);
                    return (
                      <div
                        key={id}
                        className={`tr-card tr-find tr-memory ${got ? 'open' : 'lock'}`}
                        role={got ? 'button' : undefined}
                        tabIndex={got ? 0 : undefined}
                        onClick={got ? () => onReplayMemory(id) : undefined}
                        onKeyDown={got ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onReplayMemory(id); } } : undefined}
                      >
                        <div className="tr-cpic">{got ? <Icon name={MEMORIES[id].kind === 'memory' ? 'heart' : 'scroll'} size={42} /> : <Icon name="lock" size={34} />}</div>
                        <div className="tr-cn">{got ? MEMORIES[id].title : '???'}</div>
                        <div className="tr-ct">{got ? 'Tap to watch again' : MEMORIES[id].hint}</div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
            <div className="tr-sec">Quest bonus</div>
            <div className="tr-grid tr-grid-j">
              {(() => {
                const open = allFound(finds);
                return (
                  <div
                    className={`tr-card tr-find ${open ? 'open' : 'lock'}`}
                    role={open ? 'button' : undefined}
                    tabIndex={open ? 0 : undefined}
                    onClick={open ? () => onOpenFind(BONUS_FIND.id) : undefined}
                    onKeyDown={open ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpenFind(BONUS_FIND.id); } } : undefined}
                  >
                    <div className="tr-cpic">{open ? findPic(BONUS_FIND) : <Icon name="lock" size={34} />}</div>
                    <div className="tr-cn">{open ? BONUS_FIND.title : '???'}</div>
                    <div className="tr-ct">{open ? 'Quest bonus' : BONUS_FIND.hint}</div>
                  </div>
                );
              })()}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

function findPic(f: FindDef): React.ReactNode {
  if (f.kind === 'book') {
    const url = photoUrl(f.pages[0]?.photo);
    return url ? <img className="tr-thumb" src={url} alt="" /> : <Icon name="book" size={42} />;
  }
  const url = itemUrl(f.kind === 'keepsake' ? f.icon ?? 'petal' : 'scroll');
  return url ? <img className="tr-thumb tr-item" src={url} alt="" /> : <Icon name={f.kind === 'keepsake' ? 'key' : 'scroll'} size={42} />;
}

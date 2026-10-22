import React, { useMemo, useState } from 'react';
import { BADGES, REWARDS, evaluate, rewardsUnlocked, type BadgeDef, type BadgeStore, type LevelRecord } from '../game/badges.ts';
import type { CosmeticChoice } from '../game/badgeStore.ts';
import { GUARDIAN_ENTRIES, PREDATOR_ENTRIES, PREDATOR_ORDER } from '../game/journal.ts';
import type { Coat } from '../game/heroTint.ts';
import { BadgeMedal } from './BadgeMedal.tsx';
import { CoatPreview } from './CoatPreview.tsx';
import { CreaturePic } from './CreaturePic.tsx';
import { Icon } from './icons/index.tsx';
import { Crest } from './icons/Crest.tsx';
import { guardianWorld } from './icons/badgeIcons.ts';
import { BONUS_FIND, FINDS, allFound, type FindDef } from '../game/finds.ts';
import { photoUrl } from '../game/photos.ts';
import { itemUrl } from '../game/items.ts';
import { MEMORIES, MEMORY_ORDER, type MemoryId } from '../game/storyChapters.ts';

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
}

const SECTIONS: Array<{ title: string; match: (b: BadgeDef) => boolean }> = [
  { title: 'In a stage', match: (b) => ['first_steps', 'perfect_stage', 'flawless', 'untouchable', 'green_thumb', 'speedy_sloth', 'stomp_chain', 'combo_10'].includes(b.id) },
  { title: 'Hard feats', match: (b) => ['untouched_guardian', 'pest_control', 'sky_stomper', 'lightning_round', 'garden_keeper', 'combo_20'].includes(b.id) },
  { title: 'The long game', match: (b) => /^(predators|stomps|stars|cleared|glide|shimmy|flora|perfect|streak)_/.test(b.id) },
  { title: 'Guardians', match: (b) => b.id.startsWith('guardian_') },
  { title: 'World masters', match: (b) => b.id.startsWith('world_master_') },
  { title: 'Secrets and story', match: (b) => ['naturalist', 'thorn_finder', 'thorn_heart', 'jungle_hero'].includes(b.id) },
];

export const TrophyRoom: React.FC<Props> = ({ store, levels, gateFound, thornHeart, choice, onChoice, onBack, initialTab = 'badges', finds, onOpenFind, memories = [], onReplayMemory }) => {
  const [tab, setTab] = useState<'badges' | 'journal' | 'library'>(initialTab);
  const ctx = useMemo(() => ({ store, levels, gateFound, thornHeart }), [store, levels, gateFound, thornHeart]);
  const earnedIds = useMemo(() => new Set(evaluate(ctx)), [ctx]);
  const earnedCount = earnedIds.size;
  const unlocked = rewardsUnlocked(earnedCount);
  const unlockedIds = new Set(unlocked.map((r) => r.id));

  const metCount = PREDATOR_ORDER.filter((p) => store.seen.includes(p)).length;
  const bossDone = (w: number) => levels.some((l) => l.worldIndex === w && l.miniIndex === 10 && l.completed);

  const wear = (coat: Coat) => onChoice({ ...choice, coat: choice.coat === coat ? 'none' : coat });

  return (
    <div className="tr-screen" role="dialog" aria-label="Trophy Room">
      <div className="tr-inner">
        <div className="tr-head">
          <button type="button" className="ui-x" onClick={onBack} aria-label="Back">
            <Icon name="arrow" size={16} rotate={180} />
          </button>
          <div className="tr-titles">
            <h1 className="tr-h1">Trophy Room</h1>
            <div className="tr-sub">
              {earnedCount} of {BADGES.length} badges earned
            </div>
          </div>
        </div>
        <div className="tr-bar">
          <i style={{ width: `${(earnedCount / BADGES.length) * 100}%` }} />
        </div>

        <div className="tr-tabs" role="tablist">
          <button type="button" role="tab" aria-selected={tab === 'badges'} className={tab === 'badges' ? 'on' : ''} onClick={() => setTab('badges')}>
            Badges
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
                    <small>{got ? (worn ? 'Wearing' : 'Tap to wear') : `${r.need} badges`}</small>
                  </button>
                );
              })}
            </div>

            {SECTIONS.map((sec) => (
              <React.Fragment key={sec.title}>
                <div className="tr-sec">{sec.title}</div>
                <div className="tr-grid">
                  {BADGES.filter(sec.match).map((b) => {
                    const got = earnedIds.has(b.id);
                    const p = !got ? b.progress?.(ctx) : undefined;
                    return (
                      <div key={b.id} className={`tr-badge ${got ? 'got' : ''}`}>
                        <BadgeMedal icon={b.icon} tier={b.tier} earned={got} world={guardianWorld(b.id)} />
                        <div className="tr-bn">{b.name}</div>
                        <div className="tr-bd">{b.desc}</div>
                        {p && p.have > 0 && (
                          <div className="tr-pg">
                            {p.have}/{p.need}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </React.Fragment>
            ))}
          </>
        )}

        {tab === 'journal' && (
          <>
            <div className="tr-sub tr-jsub">
              {metCount} of {PREDATOR_ORDER.length} predators met · {GUARDIAN_ENTRIES.filter((g) => bossDone(g.world)).length} of 10 guardians beaten
            </div>
            <div className="tr-sec">Predators</div>
            <div className="tr-grid tr-grid-j">
              {PREDATOR_ORDER.map((id) => {
                const e = PREDATOR_ENTRIES[id];
                const met = store.seen.includes(id);
                const n = store.kills[id] ?? 0;
                return (
                  <div key={id} className={`tr-card ${met ? '' : 'lock'}`}>
                    <div className="tr-cpic">
                      <CreaturePic id={id} w={120} h={74} locked={!met} />
                    </div>
                    <div className="tr-cn">{met ? e.name : '???'}</div>
                    <div className="tr-ct">{met ? e.tip : 'Not met yet. Keep exploring.'}</div>
                    <div className="tr-cf">
                      <span>{e.first ? `From World ${e.first}` : ''}</span>
                      <b>{met ? `Defeated ×${n}` : <Icon name="lock" size={13} label="Not met yet" />}</b>
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
                    <div className="tr-cpic">
                      <Crest world={g.world} size={72} locked={!done} />
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

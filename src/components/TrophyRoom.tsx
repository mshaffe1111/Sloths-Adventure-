import React, { useMemo, useState } from 'react';
import { BADGES, REWARDS, evaluate, rewardsUnlocked, type BadgeDef, type BadgeStore, type LevelRecord } from '../game/badges.ts';
import type { CosmeticChoice } from '../game/badgeStore.ts';
import { GUARDIAN_ENTRIES, PREDATOR_ENTRIES, PREDATOR_ORDER } from '../game/journal.ts';
import type { Coat } from '../game/heroTint.ts';
import { BadgeMedal } from './BadgeMedal.tsx';
import { CoatPreview } from './CoatPreview.tsx';
import { CreaturePic } from './CreaturePic.tsx';

interface Props {
  store: BadgeStore;
  levels: LevelRecord[];
  gateFound: boolean;
  thornHeart: boolean;
  choice: CosmeticChoice;
  onChoice: (c: CosmeticChoice) => void;
  onBack: () => void;
}

const SECTIONS: Array<{ title: string; match: (b: BadgeDef) => boolean }> = [
  { title: 'In a stage', match: (b) => ['first_steps', 'perfect_stage', 'flawless', 'untouchable', 'green_thumb', 'speedy_sloth', 'stomp_chain', 'combo_10'].includes(b.id) },
  { title: 'The long game', match: (b) => /^(predators|stomps|stars|cleared)_/.test(b.id) },
  { title: 'Guardians', match: (b) => b.id.startsWith('guardian_') },
  { title: 'World masters', match: (b) => b.id.startsWith('world_master_') },
  { title: 'Secrets and story', match: (b) => ['naturalist', 'thorn_finder', 'thorn_heart', 'jungle_hero'].includes(b.id) },
];

export const TrophyRoom: React.FC<Props> = ({ store, levels, gateFound, thornHeart, choice, onChoice, onBack }) => {
  const [tab, setTab] = useState<'badges' | 'journal'>('badges');
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
            ←
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
        </div>

        {tab === 'badges' && (
          <>
            <div className="tr-sec">Rewards for Slomatt</div>
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
                      {r.kind === 'color' ? <CoatPreview coat={r.id as Coat} size={58} /> : <span className="tr-sparkle">✨</span>}
                      {!got && <span className="tr-lockmark">🔒</span>}
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
                        <BadgeMedal icon={b.icon} tier={b.tier} earned={got} />
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
                      <b>{met ? `Defeated ×${n}` : '🔒'}</b>
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
                      {g.art ? <CreaturePic id={g.art} w={120} h={74} locked={!done} /> : <span className={`tr-crest ${done ? '' : 'off'}`}>{g.crest}</span>}
                    </div>
                    <div className="tr-cn">{done ? g.name : '???'}</div>
                    <div className="tr-ct">{done ? `Guardian of World ${g.world}. Defeated.` : `Guardian of World ${g.world}. Beat the 10th stage to meet it.`}</div>
                    <div className="tr-cf">
                      <span>World {g.world}</span>
                      <b>{done ? '✔' : '🔒'}</b>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

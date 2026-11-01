import React, { useMemo, useState } from 'react';
import { BADGES, REWARDS, TIER_NAME, TIER_POINTS, TOTAL_POINTS, evaluate, pointsOf, rewardsUnlocked, type BadgeDef, type EvalContext } from '../../game/badges.ts';
import type { CosmeticChoice } from '../../game/badgeStore.ts';
import type { Coat } from '../../game/heroTint.ts';
import { BadgeMedal } from '../BadgeMedal.tsx';
import { CoatPreview } from '../CoatPreview.tsx';
import { Icon } from '../icons/index.tsx';
import { SatchelPopup } from './SatchelPopup.tsx';

const fmt = (n: number) => n.toLocaleString('en-US');
const unitLabel = (b: BadgeDef, have: number, need: number) =>
  b.unit === 'h' ? `${have} of ${need} h` : b.unit === 'min' ? `${have} of ${need} min` : `${fmt(have)} of ${fmt(need)}`;

/** one medal in the grid: tap it to see it big (Matt, 2026-10-31: "right now, they're so small, they're hard to read") */
const MedalCell: React.FC<{ b: BadgeDef; got: boolean; onOpen: () => void }> = ({ b, got, onOpen }) => (
  <button type="button" className={`tr-badge st-medal ${got ? 'got' : ''}`} onClick={onOpen} aria-label={`${b.name}${got ? '' : ', not earned yet'}`}>
    <BadgeMedal badge={b} earned={got} size={64} />
    <span className="st-mn">{b.name}</span>
  </button>
);

/** the medal close up: its art big, its name, what it is for, its points, and how far along a counter is */
export const MedalCloseup: React.FC<{ b: BadgeDef; got: boolean; ctx: EvalContext; onClose: () => void }> = ({ b, got, ctx, onClose }) => {
  const p = !got ? b.progress?.(ctx) : undefined;
  return (
    <SatchelPopup title="Medal" label={b.name} onClose={onClose} className={`st-close st-${b.tier}`}>
      <div className="st-big">
        <BadgeMedal badge={b} earned={got} size={168} />
      </div>
      <div className={`st-tier st-tier-${b.tier}`}>
        {TIER_NAME[b.tier]} · {TIER_POINTS[b.tier]} points
      </div>
      <h2 className="st-name">{b.name}</h2>
      <p className="st-desc">{b.desc}</p>
      {p && p.need > 1 && (
        <div className="tr-pg st-pg" aria-label={unitLabel(b, p.have, p.need)}>
          <div className="tr-pgbar">
            <i style={{ width: `${Math.min(100, (p.have / p.need) * 100)}%` }} />
          </div>
          <span>{unitLabel(b, p.have, p.need)}</span>
        </div>
      )}
      <div className={`st-state ${got ? 'got' : ''}`}>{got ? <><Icon name="check" size={14} /> Earned</> : <><Icon name="lock" size={13} /> Not earned yet</>}</div>
    </SatchelPopup>
  );
};

export const TrophiesTab: React.FC<{ ctx: EvalContext; choice: CosmeticChoice; onChoice: (c: CosmeticChoice) => void }> = ({ ctx, choice, onChoice }) => {
  const [open, setOpen] = useState<string | null>(null);
  const earnedIds = useMemo(() => new Set(evaluate(ctx)), [ctx]);
  const points = pointsOf(earnedIds);
  const unlockedIds = new Set(rewardsUnlocked(points).map((r) => r.id));
  const plat = BADGES.find((b) => b.tier === 'platinum')!;
  const platGot = earnedIds.has(plat.id);
  const wear = (coat: Coat) => onChoice({ ...choice, coat: choice.coat === coat ? 'none' : coat });
  const openB = open ? BADGES.find((b) => b.id === open) : undefined;

  return (
    <>
      <div className="tr-sub tr-jsub">
        <b className="tr-points">{fmt(points)}</b> of {fmt(TOTAL_POINTS)} points · {earnedIds.size} of {BADGES.length} medals · tap a medal to see it
      </div>
      <div className="tr-bar" role="progressbar" aria-valuemin={0} aria-valuemax={TOTAL_POINTS} aria-valuenow={points} aria-label="Medal points">
        <i style={{ width: `${(points / TOTAL_POINTS) * 100}%` }} />
      </div>
      <button type="button" className={`tr-plat st-platbtn ${platGot ? 'got' : ''}`} onClick={() => setOpen(plat.id)}>
        <BadgeMedal badge={plat} earned={platGot} size={96} />
        <div className="tr-plat-t">
          <div className="tr-plat-k">Platinum · {TIER_POINTS.platinum} points</div>
          <div className="tr-plat-n">{plat.name}</div>
          <ul className="tr-plat-parts">
            {plat.parts!(ctx).map((q) => (
              <li key={q.label} className={q.done || platGot ? 'done' : ''}>
                <Icon name={q.done || platGot ? 'check' : 'lock'} size={12} />
                {q.label}
              </li>
            ))}
          </ul>
        </div>
      </button>

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
            <div className="st-grid">
              {list.map((b) => (
                <MedalCell key={b.id} b={b} got={earnedIds.has(b.id)} onOpen={() => setOpen(b.id)} />
              ))}
            </div>
          </React.Fragment>
        );
      })}
      {openB && <MedalCloseup b={openB} got={earnedIds.has(openB.id)} ctx={ctx} onClose={() => setOpen(null)} />}
    </>
  );
};

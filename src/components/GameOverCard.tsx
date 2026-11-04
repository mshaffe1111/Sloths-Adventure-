import { PaintedIcon } from './icons/PaintedIcon.tsx';
import React from 'react';
import { GhostOnExit } from './fx/exitGhost.ts';
import type { LevelConfig } from '../game/types.ts';
import type { StageStats } from '../game/badges.ts';
import { HeroPose } from './HeroPose.tsx';
import { ClrChips, ClrRibbon, type ChipSpec } from './ClrParts.tsx';
import { floraChip, totalKills, tuckeredLine } from './stageSummary.ts';
import { shouldOfferHelp } from '../game/assist.ts';

/** how long the card takes no taps after it opens (AN-1) */
export const TAP_GUARD_MS = 500;

/** keyboard shortcut hints only make sense when there is a keyboard (not on a touch-only phone) */
const COARSE = typeof window !== 'undefined' && !!window.matchMedia?.('(pointer: coarse)').matches;

const fmtTime = (s: number) => `${Math.floor(Math.round(s) / 60)}:${String(Math.round(s) % 60).padStart(2, '0')}`;

interface GameOverCardProps {
  levelConfig: LevelConfig;
  score: number;
  stats?: StageStats | null;
  /** start the stage over */
  onRetry: () => void;
  /** pick up from the last checkpoint with every life back */
  onContinue: () => void;
  onOpenMap: () => void;
  /** Game Overs on this stage so far this visit */
  fails?: number;
  /** turn on the extra-lives help (offered after a few Game Overs) */
  onTakeHelp?: () => void;
}

/** Out of lives: the same card family as Stage Cleared, in dusk colours, with Pokey having a lie-down and a kind word. */
export const GameOverCard: React.FC<GameOverCardProps> = ({ levelConfig, score, stats, onRetry, onContinue, onOpenMap, fails = 0, onTakeHelp }) => {
  const offerHelp = !!onTakeHelp && shouldOfferHelp(fails);
  // the card ignores taps for its first half second, so a thumb still jabbing at the fight never starts over by accident (AN-1)
  const [ready, setReady] = React.useState(false);
  React.useEffect(() => {
    const id = window.setTimeout(() => setReady(true), TAP_GUARD_MS);
    return () => window.clearTimeout(id);
  }, []);
  const guard = (e: React.SyntheticEvent) => {
    if (ready) return;
    e.preventDefault();
    e.stopPropagation();
  };
  const heroW = typeof window === 'undefined' ? 240 : window.innerHeight <= 520 ? 130 : Math.min(240, window.innerWidth - 120);
  // with the extra-lives offer on the card, Pokey lies down smaller so the card still fits an upright phone (it ran off a 400 x 720 one)
  const heroH = Math.round(Math.max(offerHelp ? 64 : 90, Math.min(170, (typeof window !== 'undefined' ? window.innerHeight : 700) * (offerHelp ? 0.14 : 0.24))));
  // (no "Score 0" when nothing was scored: UI-12)
  const chips: ChipSpec[] = score > 0 ? [{ label: 'Score', value: score.toLocaleString(), colour: '#fde68a' }] : [];
  if (stats && stats.timeSec > 0) chips.push({ label: 'Time', value: fmtTime(stats.timeSec) });
  // (the same chip as the win card's: on a gather stage, of the goal, as the HUD's bar counts it; stageSummary.ts floraChip, UI-10)
  const flora = floraChip(stats);
  if (flora) chips.push({ label: flora.label, value: `${flora.cur}/${flora.of}`, colour: flora.full ? '#f9a8d4' : undefined });
  if (stats && totalKills(stats) > 0) chips.push({ label: 'Foes', value: String(totalKills(stats)) });


  return (
    <div className="clr-scrim lost select-none" onClickCapture={guard} onPointerDownCapture={guard}>
      <GhostOnExit />
      <div className="clr-card lost" role="dialog" aria-label="Out of lives">
        <ClrRibbon title="TUCKERED OUT!" tone="dusk" />

        <div className="clr-hero">
          <HeroPose frame="ko" height={heroH} maxWidth={heroW} className="clr-pose ko" label="Pokey is having a lie-down" />
        </div>

        <div className="clr-main">
          <div className="clr-stage">Stage {levelConfig.id} &middot; {levelConfig.name}</div>

          <div className="clr-praise lost">
            <b>Out of lives</b>
            <span>{tuckeredLine(levelConfig.id)}</span>
          </div>

          {chips.length > 0 && <ClrChips chips={chips} />}

          <p className="clr-safe">Your stars and finished stages are safe.</p>

          {offerHelp && (
            <div className="clr-help" role="note">
              <span>This one is a tough stretch. Want a little help? Pokey gets 2 extra lives on every stage.</span>
              <button type="button" className="clr-btn2" onClick={onTakeHelp}>
                Yes, add 2 lives
              </button>
            </div>
          )}

          <button type="button" className="pm-go clr-go" data-start="true" onClick={onContinue}>
            {/* on a narrow screen the words stack on purpose ("Continue" over "from checkpoint") rather than wrap anyhow beside the flag */}
            <span className="clr-go-t">
              Continue <span className="clr-go-s">from checkpoint</span>
            </span>
            <PaintedIcon name="play" size={26} />
          </button>
          {!COARSE && <p className="clr-note">Space or Enter to continue &middot; everything you collected stays</p>}

          <div className="clr-sec two">
            <button type="button" className="clr-btn2" onClick={onRetry}>
              <PaintedIcon name="restart" size={22} />
              Start over
            </button>
            <button type="button" className="clr-btn2" onClick={onOpenMap}>
              <PaintedIcon name="map" size={24} />
              World map
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

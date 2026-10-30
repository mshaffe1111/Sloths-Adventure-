import React from 'react';
import type { LevelConfig } from '../game/types.ts';
import { PauseMenu } from './PauseMenu.tsx';
import type { SkillId } from '../game/skills.ts';
import { StageCleared } from './StageCleared.tsx';
import { sound } from '../game/audio.ts';
import { GameOverCard } from './GameOverCard.tsx';
import { EndingCard } from './BossCards.tsx';
import type { BadgeDef, StageStats } from '../game/badges.ts';


interface StatusModalsProps {
  screen: 'paused' | 'victory' | 'game_over' | 'story_ending';
  levelConfig: LevelConfig;
  starsEarned: number;
  timeSec: number;
  score: number;
  newBest: boolean;
  bestScore: number;
  /** what happened in the stage that just ended */
  stats?: StageStats | null;
  /** the medals it earned (on the stage-cleared card) */
  medals?: BadgeDef[];
  prevId: string | null;
  nextId: string | null;
  isMuted: boolean;
  trophyCount: number;
  trophyTotal: number;
  skills: Set<SkillId>;
  onToggleMute: () => void;
  onResume: () => void;
  onRestart: () => void;
  /** Game Over: pick up from the last checkpoint */
  onContinue?: () => void;
  /** Game Overs on this stage this visit, and the switch for the extra-lives offer */
  fails?: number;
  onTakeHelp?: () => void;
  onNextStage: () => void;
  onPrevStage: () => void;
  onOpenMap: () => void;
  onOpenTitle: () => void;
  onOpenTrophies: () => void;
  onOpenCards: () => void;
  onOpenSatchel: () => void;
  /** Meeca's stage: ask Flicker for a hint (null when he cannot be asked now) */
  onAskHint?: () => string | null;
  onViewStory?: () => void;
}

export const StatusModals: React.FC<StatusModalsProps> = ({
  screen,
  levelConfig,
  starsEarned,
  timeSec,
  score,
  newBest,
  bestScore,
  stats,
  medals,
  prevId,
  nextId,
  isMuted,
  trophyCount,
  trophyTotal,
  skills,
  onAskHint,
  onToggleMute,
  onResume,
  onRestart,
  onContinue,
  fails,
  onTakeHelp,
  onNextStage,
  onPrevStage,
  onOpenMap,
  onOpenTitle,
  onOpenTrophies,
  onOpenCards,
  onOpenSatchel,
}) => {
  // --- 1. SETTINGS, THE PAUSE CARD (opened by the Settings button) ---
  if (screen === 'paused') {
    return (
      <PauseMenu
        levelConfig={levelConfig}
        isMuted={isMuted}
        onToggleMute={onToggleMute}
        onResume={onResume}
        onRestart={onRestart}
        onOpenTrophies={onOpenTrophies}
        onOpenCards={onOpenCards}
        onOpenSatchel={onOpenSatchel}
        onOpenMap={onOpenMap}
        onOpenTitle={onOpenTitle}
        trophyCount={trophyCount}
        trophyTotal={trophyTotal}
        skills={skills}
        onAskHint={onAskHint}
      />
    );
  }

  // --- 2. STAGE CLEARED ---
  if (screen === 'victory') {
    return (
      <>
      <VictorySting />
      <StageCleared
        levelConfig={levelConfig}
        starsEarned={starsEarned}
        timeSec={timeSec}
        score={score}
        newBest={newBest}
        bestScore={bestScore}
        stats={stats}
        medals={medals}
        prevId={prevId}
        nextId={nextId}
        onNext={onNextStage}
        onPrev={onPrevStage}
        onReplay={onRestart}
        onOpenMap={onOpenMap}
      />
      </>
    );
  }

  // --- 3. GAME OVER ---
  if (screen === 'game_over') {
    return <GameOverCard levelConfig={levelConfig} score={score} stats={stats} onRetry={onRestart} onContinue={onContinue ?? onRestart} onOpenMap={onOpenMap} fails={fails} onTakeHelp={onTakeHelp} />;
  }

  // --- 4. THE END OF THE STORY ---
  if (screen === 'story_ending') return <EndingCard onOpenMap={onOpenMap} onOpenTitle={onOpenTitle} />;

  return null;
};

/** the card's entrance (index.css clr-in) */
export const CARD_LANDS_MS = 420;
/** the full victory sting, when the Stage Cleared card and its ribbon have landed (SN-5: it used to play in the level, at the shrine) */
const VictorySting: React.FC = () => {
  React.useEffect(() => {
    const id = window.setTimeout(() => sound.playVictory(), CARD_LANDS_MS);
    return () => window.clearTimeout(id);
  }, []);
  return null;
};

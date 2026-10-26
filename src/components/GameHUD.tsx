import React from 'react';
import type { LevelConfig } from '../game/types.ts';
import { VineHud } from './hud/VineHud.tsx';

interface GameHUDProps {
  levelConfig: LevelConfig;
  hp: number;
  maxHp: number;
  currentObjectiveCount: number;
  targetObjectiveCount: number;
  distanceRatio?: number;
  score: number;
  /** the Menu button: pauses the game and opens the pause menu */
  onMenu: () => void;
  bossHp?: number;
  bossMaxHp?: number;
  bossName?: string;
  bossPhase?: number;
  /** how many hits the boss takes (one bar segment each), when it says */
  bossHits?: number;
  /** the world colour for the boss bar */
  bossAccent?: string;
  /** the boss is making its entrance: the HUD stays out of the way until it is over */
  bossEntering?: boolean;
  activePowerUp?: 'speed' | 'invincible' | 'magnet' | null;
  powerUpTimer?: number;
  lives?: number;
  /** where Pokey is on the screen (CSS px), for the new HUD's pickup flight */
  heroPoint?: () => { x: number; y: number } | null;
  /** a new number each time the stage (re)starts: the new HUD plays its short goal card again */
  runKey?: number;
}

/** The in-game HUD: the hanging vine (hud/VineHud.tsx; Matt's pick B with D's bloom-on-change, 2026-10-26). */
export const GameHUD: React.FC<GameHUDProps> = (props) => <VineHud {...props} />;

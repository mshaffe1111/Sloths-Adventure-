/**
 * Audit C (worlds): a special stage's type is decided twice. The stage list (worldsData.ts) gives 7-4 the slot's rolled type, 'ascent';
 * its builder (w7Slide.ts buildSlideStage) overrides the built stage's config to 'sprint', which is what the engine plays (flags by x,
 * no climb camera). The HUD's goal card is written from the LISTED config (VineHud.tsx:99 goalInfo({...levelConfig, targetCount})): only
 * the count is taken from the engine, and only Dot's flight and Meeca's stage have their own words (goalInfo.ts). So 7-4, a hall, a
 * slide DOWN a chute and a walk to a shrine, opens with "This stage: climb to the top".
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import '../../../../src/game/headlessDom.ts';
import { levelConfig } from '../../../../src/game/realPlay.ts';
import { generateStage, setLayoutVariant } from '../../../../src/game/stageGenerator.ts';
import { goalInfo } from '../../../../src/components/hud/goalInfo.ts';

test("7-4: the HUD's goal line is the goal of the stage the engine plays", () => {
  const listed = levelConfig('7-4');
  setLayoutVariant(1);
  const built = generateStage(listed, 'normal').config;
  setLayoutVariant(null);
  assert.equal(built.objectiveType, 'sprint', 'the slide stage is played as a run to the shrine');
  // (VineHud.tsx:99: the listed config, with the engine's count)
  const shown = goalInfo({ ...listed, targetCount: built.targetCount || listed.targetCount }).line;
  assert.equal(shown, goalInfo(built).line);
});

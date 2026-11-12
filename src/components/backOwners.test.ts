/**
 * PLAY-STORE-RULES §6.2 "Back does something sensible on the new screen". Back reaches a screen three ways (nav/backStack.ts): a
 * handler the screen's component pushes with useBack (Nav's BackButton does), a branch for the screen in App.tsx's androidBack, or
 * an Escape listener of its own (androidBack's fallback sends Escape). ENGINE-AUDIT-C C-08 (2026-11-11): the guardian's card and
 * The End had none of the three, so Back did nothing on them (reference/audits/2026-11-11/tests-c/boss-card-android-back.test.ts,
 * brought in as the first test).
 *
 * BACK_OWNER is typed over every GameScreen: a new screen does not compile until it names who owns its Back, and the test checks
 * the owner really handles it.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import type { GameScreen } from '../game/types.ts';

const read = (p: string) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const app = read('App.tsx');
const androidBack = app.slice(app.indexOf('androidBack.current = () => {'), app.indexOf('androidAway.current'));

test('the guardian card answers Back', () => {
  const cards = read('components/BossCards.tsx');
  const card = cards.slice(cards.indexOf('export const BossIntroCard'), cards.indexOf('export function expeditionScore'));
  const ownHandler = /useBack\(|addEventListener\('keydown'/.test(card);
  const appBranch = /boss_intro|bossCard/.test(androidBack);
  assert.ok(ownHandler || appBranch, 'BossIntroCard pushes no Back handler and listens to no key, and App.tsx androidBack has no branch for boss_intro: Back does nothing on the card');
});

/** 'app': App.tsx androidBack has the screen's own branch; otherwise every component that can be on that screen, in its file */
type Owner = 'app' | { file: string; component: string };
const story = { file: 'components/StoryPlayer.tsx', component: 'StoryPlayer' };
const BACK_OWNER: Record<GameScreen, Owner[]> = {
  title: ['app'],
  world_map: ['app', { file: 'components/WorldMap.tsx', component: 'WorldMap' }],
  satchel: [{ file: 'components/Satchel.tsx', component: 'Satchel' }],
  story_cutscene: [story],
  playing: ['app'],
  paused: ['app'],
  victory: ['app'],
  game_over: ['app'],
  // the guardian's scene, then (the first time in a save) its card
  boss_intro: [story, { file: 'components/BossCards.tsx', component: 'BossIntroCard' }],
  story_ending: [{ file: 'components/BossCards.tsx', component: 'EndingCard' }],
  world_story: [story],
  world_mid: [story],
  world_gate: [story],
  ending_tag: [story],
  boss_defeat: [story],
  ending_story: [story],
  memory: [story],
};

/** a component's own code: from its export to the next export of the file */
function componentSource(file: string, component: string): string {
  const src = read(file);
  const at = src.search(new RegExp(`export (const|function|default function) ${component}\\b`));
  assert.ok(at >= 0, `${file} exports ${component}`);
  const next = src.indexOf('\nexport ', at + 1);
  return src.slice(at, next < 0 ? undefined : next);
}

test('every screen of the game has a Back owner that handles Back', () => {
  const missing: string[] = [];
  for (const [screen, owners] of Object.entries(BACK_OWNER)) {
    assert.ok(app.includes(`'${screen}'`), `App.tsx shows ${screen}`);
    for (const o of owners) {
      if (o === 'app') {
        if (!androidBack.includes(`'${screen}'`)) missing.push(`${screen}: App.tsx androidBack has no branch for it`);
      } else if (!/useBack\(|<BackButton\b|'Escape'/.test(componentSource(o.file, o.component))) {
        missing.push(`${screen}: ${o.component} (${o.file}) pushes no Back handler and listens for no Escape`);
      }
    }
  }
  assert.deepEqual(missing, []);
});

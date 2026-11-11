/**
 * Audit C (boss slice): PLAY-STORE-RULES.md "Back does something sensible on the new screen". The guardian's card (BossIntroCard, shown
 * on screen 'boss_intro' with bossCard up, in place of the StoryPlayer) must answer Android's Back / Escape. Back reaches a screen three
 * ways (nav/backStack.ts): a handler the screen pushed with useBack, a branch for the screen in App.tsx's androidBack, or a keydown
 * listener of its own for the Escape that androidBack falls back to. The card has none of the three.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (p: string) => readFileSync(new URL(`../../../../src/${p}`, import.meta.url), 'utf8');

test('the guardian card answers Back', () => {
  const cards = read('components/BossCards.tsx');
  const card = cards.slice(cards.indexOf('export const BossIntroCard'), cards.indexOf('export function expeditionScore'));
  const app = read('App.tsx');
  const back = app.slice(app.indexOf('androidBack.current = () => {'), app.indexOf('androidAway.current'));
  const ownHandler = /useBack\(|addEventListener\('keydown'/.test(card);
  const appBranch = /boss_intro|bossCard/.test(back);
  assert.ok(ownHandler || appBranch, 'BossIntroCard pushes no Back handler and listens to no key, and App.tsx androidBack has no branch for boss_intro: Back does nothing on the card');
});

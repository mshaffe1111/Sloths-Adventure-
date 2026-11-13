/**
 * Audit C-12 (ENGINE-AUDIT-C, 11-11): the Android app kept the screen awake (KeepAwakePlugin) whenever the screen was 'playing', but a
 * find's reader and 1-1's help offer both hold the stage with the screen still 'playing': a phone put down on a find's card never slept.
 * PLAY-STORE-RULES §4/§6.5: nothing keeps the phone awake behind a menu or a card.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { keepAwake } from './screenFlow.ts';
import { headlessCanvas } from '../game/headlessDom.ts';
import { GameEngine } from '../game/engine.ts';
import { InputEngine } from '../game/inputEngine.ts';
import { generateAllLevels } from '../game/worldsData.ts';
import type { HelpAct, Piece } from '../game/helpLadder.ts';

test('C-12: the screen is kept awake only while a stage is really played: not behind a find\'s reader or the help offer', () => {
  assert.equal(keepAwake('playing', { reading: false, offer: false }), true);
  assert.equal(keepAwake('playing', { reading: true, offer: false }), false, "a find's reader is up");
  assert.equal(keepAwake('playing', { reading: false, offer: true }), false, 'the help offer is up');
  for (const s of ['paused', 'world_map', 'title', 'victory'] as const) assert.equal(keepAwake(s, { reading: false, offer: false }), false, s);
});

test('C-12: App.tsx keeps the screen on by that rule', () => {
  const app = readFileSync(new URL('../App.tsx', import.meta.url), 'utf8');
  const call = /keepScreenOn\(([^;]*)\);/.exec(app);
  assert.ok(call, 'App.tsx no longer calls keepScreenOn this way (update this test)');
  assert.match(call[1], /^keepAwake\(screen, \{ reading: !!reading, offer: helpOffer \}\)$/, `keepScreenOn(${call[1]})`);
});

type Eng = {
  askHelp(a: HelpAct): void;
  answerHelp(yes: boolean): void;
  currentStage: { meta: { pieces: Piece[] } };
  helpAsk: (o: unknown, answer: (yes: boolean) => void) => void;
  stop(): void;
};

test('C-12: the engine tells the app when the help offer holds the stage, and when it lets go (answered, or the stage stopped)', () => {
  localStorage.clear();
  const lvl = generateAllLevels().find((l) => l.id === '1-1')!;
  const up: boolean[] = [];
  const mk = () => {
    const e = new GameEngine(headlessCanvas(), lvl, new InputEngine(), { onHelpOffer: (on: boolean) => void up.push(on) } as never) as unknown as Eng;
    e.helpAsk = () => {};
    return e;
  };
  const e = mk();
  const at: HelpAct = { rung: 'offer', piece: e.currentStage.meta.pieces[0], count: 12 };
  e.askHelp(at);
  assert.deepEqual(up, [true], 'the offer is up');
  e.answerHelp(false);
  assert.deepEqual(up, [true, false], 'answered: let go');
  e.stop();
  assert.deepEqual(up, [true, false], 'nothing more on a stop with no offer up');
  up.length = 0;
  const e2 = mk();
  e2.askHelp(at);
  e2.stop();
  assert.deepEqual(up, [true, false], 'stopped under the offer: let go');
});

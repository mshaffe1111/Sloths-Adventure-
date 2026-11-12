/**
 * Audit C-10 (ENGINE-AUDIT-C, 11-11): 1-1's help offer could leave the stage frozen, or its card behind.
 *  - askHelp pauses the stage, then loads the card's chunk (`import('../components/HelpOffer.tsx')`) with no catch; while the offer is
 *    up the pause menu's Resume cannot un-pause (engine.resume returns while helpAsking). A chunk that fails to load (a web build after a
 *    deploy, a bad connection) froze the stage with no card: only Restart got out.
 *  - the card mounts on document.body on its own root; engine.stop() forgot the offer but nothing took the card down.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { headlessCanvas } from './headlessDom.ts';
import { GameEngine } from './engine.ts';
import { InputEngine } from './inputEngine.ts';
import { generateAllLevels } from './worldsData.ts';
import { recorder } from './playRecorder.ts';
import type { HelpAct, Piece } from './helpLadder.ts';

type Eng = {
  askHelp(a: HelpAct): void;
  helpState(): { asking: unknown; paused: boolean; on: boolean };
  currentStage: { meta: { pieces: Piece[] } };
  loadHelpOffer: () => Promise<{ showHelpOffer: (o: { reask: boolean; cut?: string }, answer: (yes: boolean) => void) => () => void }>;
  resume(): void;
  stop(): void;
};

function engine11(): Eng {
  localStorage.clear();
  const lvl = generateAllLevels().find((l) => l.id === '1-1')!;
  const e = new GameEngine(headlessCanvas(), lvl, new InputEngine(), {} as never) as unknown as Eng;
  assert.ok(e.helpState().on, "1-1's help ladder is on");
  return e;
}
const offerAt = (e: Eng): HelpAct => ({ rung: 'offer', piece: e.currentStage.meta.pieces[0], count: 12 });
const settle = () => new Promise((r) => setTimeout(r, 20));

test('C-10: the help card\'s chunk fails to load: the offer is answered no and play goes on (never a frozen stage with no card)', async () => {
  const e = engine11();
  const events: string[] = [];
  const was = recorder.event;
  recorder.event = ((what: string, detail?: string | number) => void events.push(`${what} ${detail ?? ''}`.trim())) as typeof recorder.event;
  try {
    e.loadHelpOffer = () => Promise.reject(new Error('Failed to fetch dynamically imported module'));
    e.askHelp(offerAt(e));
    assert.equal(e.helpState().paused, true, 'held while the card loads');
    await settle();
    assert.equal(e.helpState().asking, null, 'the offer is answered');
    assert.equal(e.helpState().paused, false, 'play goes on');
    assert.ok(events.some((v) => v.startsWith('helpOffer no')), `answered no: ${events.join(' | ')}`);
  } finally {
    recorder.event = was;
    e.stop();
  }
});

test('C-10: engine.stop() takes the help card down (a quit, or onFatal, under it)', async () => {
  const e = engine11();
  let up = 0;
  e.loadHelpOffer = () => Promise.resolve({
    showHelpOffer: (_o, _answer) => {
      up++;
      return () => void up--;
    },
  });
  e.askHelp(offerAt(e));
  await settle();
  assert.equal(up, 1, 'the card is up');
  e.stop();
  assert.equal(up, 0, 'stop() took the card down');
});

test('C-10: stop() while the card is still loading: it never goes up afterwards', async () => {
  const e = engine11();
  let up = 0;
  let release!: () => void;
  const loaded = new Promise<void>((r) => (release = r));
  e.loadHelpOffer = async () => {
    await loaded;
    return { showHelpOffer: () => (up++, () => void up--) };
  };
  e.askHelp(offerAt(e));
  e.stop();
  release();
  await settle();
  assert.equal(up, 0, 'a card that finished loading after stop() is not put up over whatever came next');
});

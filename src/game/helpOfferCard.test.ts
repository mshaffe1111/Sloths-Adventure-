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
import { RUNGS, type HelpAct, type HelpLadder, type Piece } from './helpLadder.ts';

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

test('C-10b: the help card\'s chunk fails to load: play goes on, logged as a failed offer, never as an answer he did not give', async () => {
  const e = engine11();
  const events: string[] = [];
  const was = recorder.event;
  recorder.event = ((what: string, detail?: string | number) => void events.push(`${what} ${detail ?? ''}`.trim())) as typeof recorder.event;
  try {
    // (the ladder itself brings the offer: 12 put-backs at the first piece, Normal)
    const help = (e as unknown as { help: HelpLadder }).help;
    // (a piece where a step can grow: only there does she offer one)
    let offer: HelpAct | undefined;
    let x = 0;
    for (const p of e.currentStage.meta.pieces) {
      x = (p.x0 + p.x1) / 2;
      if (help.pieceAt(x)?.k !== p.k) continue;
      for (let n = 1; n <= RUNGS.offer && !offer; n++) offer = help.putBack(x).find((a) => a.rung === 'offer');
      if (offer) break;
    }
    assert.ok(offer, 'the ladder offers at 12 somewhere in 1-1');
    const piece = offer.piece;
    e.loadHelpOffer = () => Promise.reject(new Error('Failed to fetch dynamically imported module'));
    e.askHelp(offer);
    assert.equal(e.helpState().paused, true, 'held while the card loads');
    await settle();
    assert.equal(e.helpState().asking, null, 'the offer is no longer waiting');
    assert.equal(e.helpState().paused, false, 'play goes on');
    assert.ok(events.includes(`helpOffer fail ${piece.k} ${RUNGS.offer}`), `logged as a failed offer: ${events.join(' | ')}`);
    assert.ok(!events.some((v) => /^helpOffer (no|yes)\b/.test(v)), `no answer he never gave: ${events.join(' | ')}`);
    // the ladder counted no answer: the offer he never saw comes again at his next put-back there (no "no", so no re-ask clock)
    const next = help.putBack(x);
    assert.deepEqual(next.map((a) => a.rung), ['offer'], `the offer comes again at the next put-back: ${JSON.stringify(next)}`);
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

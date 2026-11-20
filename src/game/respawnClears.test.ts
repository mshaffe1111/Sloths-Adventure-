/**
 * A put-back is a cut under a shut iris (FIX-284b, the lead's 11-19 polish item from the deepBeat22 sideways clip): nothing the last
 * life left on the screen (the drowning's "SPLASH!" and its spray, a hit's sparks, any word still rising) is there when the iris opens.
 * Before: respawnAtCheckpoint dropped only the words within 160 px of the flag, so a drowning farther on kept its "SPLASH!" and spray,
 * and on 2-2 they sat on the risen pad above the water as the iris opened.
 *
 * Works for any stage: proven on 2-2 (a deep river) and 1-1 (a pit, with a word and sparks planted where he fell).
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { RealPlay } from './realPlay.ts';

/** the screen's words and sprays are back (RealPlay stubs them out as cosmetic: realPlay.ts COSMETIC) */
function onScreen(r: RealPlay) {
  const e = r.e as any;
  const proto = Object.getPrototypeOf(e);
  for (const m of ['addFloatingText', 'spawnWaterSplash', 'spawnSparkBurst']) e[m] = proto[m].bind(e);
  return r;
}

/** run the real life-lost beat to the put-back; returns what is on screen in the first frame the iris opens */
function toPutBack(r: RealPlay) {
  const e = r.e as any;
  for (let i = 0; i < 90 && !e.down; i++) r.frame();
  assert.ok(e.down, 'a life was lost');
  for (let i = 0; i < 90 && e.down; i++) r.frame();
  assert.equal(e.down, null, 'the beat ended at the flag');
  assert.ok(e.irisOpen > 0, 'the iris is opening on him');
  return { texts: e.floatingTexts.map((t: { text: string }) => t.text) as string[], parts: e.particles.length as number };
}

test('a drowning: the SPLASH word and its spray end at the put-back (2-2, a deep river)', () => {
  const r = onScreen(new RealPlay('2-2', 1));
  const e = r.e as any;
  delete e.loseLife; // the real life-lost path (the harness swaps it for a note)
  const cp = e.checkpoint;
  const river = e.currentStage.rivers.find((v: { safe?: unknown; x0: number; x1: number }) => !v.safe && v.x0 > cp.x + 400 && v.x1 - v.x0 > 60);
  assert.ok(river, '2-2 has a deep river ahead of the start flag, more than 160 px on');
  r.fly((river.x0 + river.x1) / 2, river.surfaceY + 20, 0, 200);
  r.safe = false;
  r.frame();
  assert.ok(e.floatingTexts.some((t: { text: string }) => t.text === 'SPLASH!'), 'the drowning said SPLASH!');
  assert.ok(e.particles.length > 0, 'the drowning threw spray');
  const at = toPutBack(r);
  assert.ok(!at.texts.includes('SPLASH!'), `no SPLASH! as the iris opens (on screen: ${at.texts.join(' | ')})`);
  assert.equal(at.parts, 0, 'no spray from the drowning as the iris opens');
  assert.ok(at.texts.some((t) => /lives? left/.test(t)), 'the lives-left note is the one word at the flag');
});

test('a pit: words and sparks from the last life end at the put-back (1-1)', () => {
  const r = onScreen(new RealPlay('1-1', 1));
  const e = r.e as any;
  delete e.loseLife;
  // planted: a word and a burst where he went down, far from the flag (a hit's "!", a kick's sparks)
  e.addFloatingText('OUCH!', e.checkpoint.x + 900, e.checkpoint.y - 60, '#fff', 3);
  e.spawnSparkBurst(e.checkpoint.x + 900, e.checkpoint.y - 40, '#facc15');
  e.loseLife('pit');
  const at = toPutBack(r);
  assert.ok(!at.texts.includes('OUCH!'), `no word from the last life as the iris opens (on screen: ${at.texts.join(' | ')})`);
  assert.equal(at.parts, 0, 'no sparks from the last life as the iris opens');
});

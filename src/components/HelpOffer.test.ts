// Normal's help offer (R-165.62): Dot's words word for word (help-lines.md §3), two picture answers and nothing else to read on them,
// no tick or cross, and Back is a no (PLAY-STORE-RULES §6).
import test from 'node:test';
import assert from 'node:assert/strict';
import '../game/headlessDom.ts';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { HelpOffer, bindBack } from './HelpOffer.tsx';
import { handleBack, backStack } from './nav/backStack.ts';
import { W1_CUT } from '../game/w1CutArt.ts';

const stone = Object.keys(W1_CUT).find((k) => W1_CUT[k].kind === 'stone')!;
const html = (reask: boolean) => renderToStaticMarkup(React.createElement(HelpOffer, { reask, cut: stone, onAnswer: () => {} }));

test('the offer: Dot\'s line, then the re-ask\'s, word for word', () => {
  assert.ok(html(false).includes('Want a little step? I won&#x27;t tell anyone.'), html(false));
  assert.ok(html(true).includes('Still want that step? It&#x27;s yours.'));
});

test('the two answers are pictures: YES the stone that grows with Pokey on it, NO Pokey jumping; no words on them, no tick or cross', () => {
  const h = html(false);
  const btns = h.match(/<button[^>]*>.*?<\/button>/g) ?? [];
  assert.equal(btns.length, 2);
  assert.ok(/ho-yes/.test(btns[0]) && /<canvas/.test(btns[0]), 'YES draws the stone');
  assert.ok(/ho-no/.test(btns[1]), 'NO');
  for (const b of btns) assert.equal(b.replace(/<[^>]+>/g, '').trim(), '', `no text on an answer: ${b.replace(/<[^>]+>/g, '')}`);
  assert.ok(!/[✓✔✗✘×👍👎]/u.test(h), 'no tick, cross or thumb');
});

test('Back is a no: the back stack\'s top handler answers no, once; letting go takes it off', () => {
  const calls: string[] = [];
  const fake = { addEventListener: () => calls.push('add'), removeEventListener: () => calls.push('remove') } as unknown as Window;
  const n0 = backStack.size();
  let no = 0;
  const off = bindBack(() => no++, fake);
  assert.equal(backStack.size(), n0 + 1);
  assert.equal(handleBack(), true);
  assert.equal(no, 1, 'Back: no');
  off();
  assert.equal(backStack.size(), n0, 'off the stack');
  assert.deepEqual(calls, ['add', 'remove'], 'Escape is caught while it is up, and let go after');
});

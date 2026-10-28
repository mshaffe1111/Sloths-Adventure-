import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SLOW_FOR_MS, SlowWatch, slowTipText } from './slowTip.ts';

const FB_ANDROID =
  'Mozilla/5.0 (Linux; Android 14; K; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/129.0.0.0 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/485.0.0.67.80;]';
const IG_IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 345.0.0.31.89';
const CHROME = 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36';

test('slow tip: names the app and the browser to open instead', () => {
  assert.match(slowTipText(FB_ANDROID), /inside Facebook.*in Chrome/);
  assert.match(slowTipText(IG_IPHONE), /inside Instagram.*in Safari/);
  assert.match(slowTipText(CHROME), /struggling.*in Chrome/);
});

test('slow tip: due once, only after 15 s under 10 fps at the lightest picture; a fast spell or a sharper picture starts the count again', () => {
  const w = new SlowWatch();
  const run = (ms: number, avg: number, lightest = true) => {
    let fired = 0;
    for (let t = 0; t < ms; t += 150) if (w.feed(150, avg, lightest)) fired++;
    return fired;
  };
  assert.equal(run(SLOW_FOR_MS - 1000, 150), 0);
  assert.equal(run(2000, 40), 0); // smooth again: the count starts over
  assert.equal(run(SLOW_FOR_MS - 1000, 150, false), 0); // not yet at the lightest picture: the game can still help itself
  assert.equal(run(SLOW_FOR_MS + 1000, 150), 1);
  assert.equal(run(SLOW_FOR_MS * 2, 150), 0); // once only
});

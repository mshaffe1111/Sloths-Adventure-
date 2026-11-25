// The drum's hits (drum.ts; reference/design/2-9.md NEW 2, ENG-29): ONE a BOOM, 2-4 a tok, every hit exactly on its beat over a minute on
// both settings (B 0.7125 s Normal, 0.825 s Easy), doubled in the twist; nothing scheduled twice across windows.
import test from 'node:test';
import assert from 'node:assert/strict';
import { drumHits } from './drum.ts';

const NORMAL = { beats: 4, beat: 0.7125 };
const EASY = { beats: 4, beat: 0.825 };

test('drum: a minute of hits on both settings, each exactly on its beat, ONE a BOOM and 2-4 a tok', () => {
  for (const b of [NORMAL, EASY]) {
    const h = drumHits(b, 0, 60);
    assert.equal(h.length, Math.ceil(60 / b.beat - 1e-9));
    h.forEach((x, k) => {
      assert.ok(Math.abs(x.g - k * b.beat) < 1e-9, `hit ${k} at ${x.g}`);
      assert.equal(x.kind, k % 4 === 0 ? 'boom' : 'tok', `hit ${k}`);
    });
  }
});

test('drum: windows a frame apart schedule every hit once (none twice, none lost), and the twist doubles it', () => {
  const all: number[] = [];
  for (let t = 0; t < 60; t += 1 / 30) all.push(...drumHits(NORMAL, t, t + 1 / 30).map((x) => x.g));
  assert.deepEqual(all, drumHits(NORMAL, 0, 60).map((x) => x.g));
  const d = drumHits(NORMAL, 0, NORMAL.beat * 4, true);
  assert.equal(d.length, 8);
  assert.deepEqual(d.map((x) => x.kind), ['boom', 'tok', 'tok', 'tok', 'tok', 'tok', 'tok', 'tok']);
});

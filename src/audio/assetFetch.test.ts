/**
 * Audit C (audio) #9, 2026-11-11: 44 of the game's 51 effect names live in one pack (sfxrec/takes.mp3). If that one fetch failed, the
 * rejected job was remembered per core and every one of those effects was silent until the app restarted, with nothing said; a world's
 * ambience bed that failed was stored as "none" for good; and a 404 page was handed to the decoder as if it were the sound.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { bytesOf, onceUntilFailed } from './assetFetch.ts';

test('a fetch that fails (404, 500) is a failure, not bytes to decode', async () => {
  const g = globalThis as unknown as { fetch: unknown };
  const was = g.fetch;
  g.fetch = async () => ({ ok: false, status: 404, arrayBuffer: async () => new ArrayBuffer(8) });
  try {
    await assert.rejects(bytesOf('/assets/takes.mp3'), /404/);
  } finally {
    g.fetch = was;
  }
});

test('a load that failed is not remembered: the next ask tries again; one that worked is shared', async () => {
  const memo = new Map<string, Promise<number>>();
  let tries = 0;
  const warned: string[] = [];
  const warnWas = console.warn;
  console.warn = (...a: unknown[]) => void warned.push(String(a[0]));
  try {
    const fail = () => {
      tries++;
      return Promise.reject(new Error('offline'));
    };
    await assert.rejects(onceUntilFailed(memo, 'pack', fail, 'the recorded effects'));
    await assert.rejects(onceUntilFailed(memo, 'pack', fail, 'the recorded effects'));
    assert.equal(tries, 2, 'tried again');
    const ok = () => {
      tries++;
      return Promise.resolve(7);
    };
    assert.equal(await onceUntilFailed(memo, 'pack', ok, 'the recorded effects'), 7);
    assert.equal(await onceUntilFailed(memo, 'pack', ok, 'the recorded effects'), 7);
    assert.equal(tries, 3, 'a load that worked is not run again');
    assert.equal(warned.length, 1, 'a failure is said once (not on every retry)');
    assert.match(warned[0], /the recorded effects/);
  } finally {
    console.warn = warnWas;
  }
});

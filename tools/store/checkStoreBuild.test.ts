// The Play Store build carries no tracking (reference/PLAY-STORE.md). These run the checker on made-up files, and on the store build
// when STORE_DIST names one (the Android workflow builds it, then runs this file with STORE_DIST=dist).
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
// @ts-expect-error a plain .mjs tool with no type file
import { problemsIn, checkDir } from './checkStoreBuild.mjs';

test('the tester collector, its key and its beacon are caught', () => {
  const bad = problemsIn('a.js', 'const c="https://script.google.com/macros/s/X/exec",k="sct-57496e7010785ac1";navigator.sendBeacon(c,b)');
  assert.ok(bad.some((p: string) => p.includes('script.google.com')));
  assert.ok(bad.some((p: string) => p.includes('sct-57496e7010785ac1')));
  assert.ok(bad.some((p: string) => p.includes('sendBeacon')));
});

test('analytics and ad kits are caught', () => {
  for (const t of ['https://www.googletagmanager.com/gtag/js', 'pagead2.googlesyndication.com', 'x.doubleclick.net', 'o1.ingest.sentry.io'])
    assert.ok(problemsIn('a.js', t).length > 0, t);
});

test('React event names and SVG name tags are not mistaken for trackers', () => {
  assert.deepEqual(problemsIn('a.js', 'case`onDoubleClick`:ns="http://www.w3.org/2000/svg"'), []);
});

test('a service worker or web manifest in the folder fails it', () => {
  const d = mkdtempSync(join(tmpdir(), 'store-'));
  writeFileSync(join(d, 'index.html'), '<html></html>');
  assert.deepEqual(checkDir(d), []);
  writeFileSync(join(d, 'sw.js'), '');
  assert.equal(checkDir(d).length, 1);
});

test('the store build is clean', { skip: !process.env.STORE_DIST && 'STORE_DIST not set' }, () => {
  assert.deepEqual(checkDir(process.env.STORE_DIST), []);
});

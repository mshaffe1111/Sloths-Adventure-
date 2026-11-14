// R-165.252 (TOOLS-2 11-14): the test link's build script (tools/testlink/build.py) refuses a build over its file limit BEFORE anything
// can be published, printing the count, and maps what changed against the copy that was last PUBLISHED (dist-published, kept only by
// `build.py --published` after a publish), never against the last local build. Link #3 (11-14): 523 files, refused only at publish;
// and its map came from a pre-build that was never published, so it missed what was live (D72).
// The script's whole flow runs here (main, with a folder of the test's own and a stand-in for the vite build), in python3 as CI has it.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
/** a build: file name -> contents, written into dist by the stand-in for vite */
type Build = Record<string, string>;
/** run build.py's main in `dir` with `argv`; the stand-in build writes `files` into dir/dist */
function run(dir: string, argv: string[], files: Build = {}): { code: number; out: string } {
  const src = `
import json, sys
from pathlib import Path
sys.path.insert(0, ${JSON.stringify(HERE)})
import build
here = Path(${JSON.stringify(dir)})
files = json.loads(${JSON.stringify(JSON.stringify(files))})
def fake():
    for k, v in files.items():
        p = here / 'dist' / k
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(v)
sys.exit(build.main(['build.py'] + json.loads(${JSON.stringify(JSON.stringify(argv))}), here, fake))
`;
  const r = spawnSync('python3', ['-c', src], { encoding: 'utf8' });
  return { code: r.status ?? -1, out: `${r.stdout}${r.stderr}` };
}
const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'testlink-'));
const map = (dir: string) => JSON.parse(fs.readFileSync(path.join(dir, 'filesmap.json'), 'utf8')) as Record<string, string | null>;
/** a build of n files: the page and n-1 assets */
const many = (n: number, tag = 'a'): Build => Object.fromEntries([['index.html', '<html><head></head></html>'], ...Array.from({ length: n - 1 }, (_, i) => [`assets/f${i}-${tag}.js`, `${tag}${i}`])]);

test('R-165.252: a build over 480 files fails before publish, prints its count and leaves no map or page to publish', () => {
  const dir = tmp();
  // (an earlier build's map and page lie there, as after any round)
  fs.writeFileSync(path.join(dir, 'filesmap.json'), '{"assets/old.js": "dist/assets/old.js"}');
  const r = run(dir, ['link #3'], many(523));
  assert.equal(r.code, 1, r.out);
  assert.match(r.out, /FAIL: 523 files, over the 480 limit/);
  assert.equal(fs.existsSync(path.join(dir, 'filesmap.json')), false, 'no map is left to publish');
  assert.equal(fs.existsSync(path.join(dir, 'work-index.html')), false, 'no page is refreshed for it');
});

test('R-165.252: a build of 480 files passes and prints its count', () => {
  const dir = tmp();
  const r = run(dir, ['at the line'], many(480));
  assert.equal(r.code, 0, r.out);
  assert.match(r.out, /test link: 480 files \(limit 480\)/);
  assert.equal(Object.keys(map(dir)).length, 479, 'every asset is new on a fresh machine (no dist-published); the page is not in the map');
});

test('R-165.252: the map is against the last PUBLISHED build, not a pre-build that was never published (D72)', () => {
  const dir = tmp();
  const A: Build = { 'index.html': '<html><head></head></html>', 'assets/game-1.js': 'one', 'assets/art.webp': 'art', 'assets/gone.webp': 'old' };
  const C: Build = { 'index.html': '<html><head></head></html>', 'assets/game-2.js': 'two', 'assets/art.webp': 'art', 'assets/new.webp': 'new' };
  assert.equal(run(dir, ['A, published'], A).code, 0);
  assert.equal(run(dir, ['--published']).code, 0);
  // (the pre-build of link #3: built, never published)
  assert.equal(run(dir, ['pre-build'], C).code, 0);
  // (the final build, identical to the pre-build: against the last LOCAL build its map would be empty and the live page half old)
  const r = run(dir, ['final'], C);
  assert.equal(r.code, 0, r.out);
  assert.deepEqual(map(dir), { 'assets/game-2.js': 'dist/assets/game-2.js', 'assets/new.webp': 'dist/assets/new.webp', 'assets/game-1.js': null, 'assets/gone.webp': null });
  // (once it is published and marked, the next identical build has nothing to send)
  assert.equal(run(dir, ['--published']).code, 0);
  assert.equal(run(dir, ['again'], C).code, 0);
  assert.deepEqual(map(dir), {});
});

test('R-165.252: --published refuses when there is no build to mark', () => {
  const r = run(tmp(), ['--published']);
  assert.equal(r.code, 1);
  assert.match(r.out, /no build in dist/);
});

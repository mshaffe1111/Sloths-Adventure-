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
/** a build: file name -> contents, written into dist by the stand-in for vite ('@size:N' writes N bytes) */
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
        p.write_bytes(b'x' * int(v[6:])) if v.startswith('@size:') else p.write_text(v)
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

test('R-165.252 (LINK-ROOM): a build of 440 files, 40 free under the cap, passes and prints its count and room', () => {
  const dir = tmp();
  const r = run(dir, ['room kept'], many(440));
  assert.equal(r.code, 0, r.out);
  assert.match(r.out, /test link: 440 files \(limit 480, 40 free; largest file 0\.0 MB, limit 13\)/);
  assert.equal(Object.keys(map(dir)).length, 439, 'every asset is new on a fresh machine (no dist-published); the page is not in the map');
});

test('R-165.252 (LINK-ROOM): a build that leaves under 40 files free fails before publish, though the artifact would still take it', () => {
  const dir = tmp();
  // (release 2's head: 479 of 480, one picker still to add six stills)
  const r = run(dir, ['479'], many(479));
  assert.equal(r.code, 1, r.out);
  assert.match(r.out, /FAIL: 479 files leave 1 of room under the 480 limit; at least 40 must stay free/);
  assert.equal(fs.existsSync(path.join(dir, 'filesmap.json')), false, 'no map is left to publish');
  assert.equal(run(tmp(), ['441'], many(441)).code, 1);
});

test('R-165.252 (LINK-ROOM): a file over 13 MB fails before publish (the artifact takes 16 MB a file; index.js stood at 14.6 MB)', () => {
  const dir = tmp();
  const r = run(dir, ['big'], { ...many(10), 'assets/index-x.js': '@size:13100000', 'assets/audio-pack-1.webm': '@size:14900000' });
  assert.equal(r.code, 1, r.out);
  assert.match(r.out, /FAIL: assets\/index-x\.js is 13\.1 MB, over 13 MB/);
  // (an audio pack is held to its own 15 MB, the most pack_audio puts in one; the stand-in's .webm goes through pack_audio as a real one does)
  assert.doesNotMatch(r.out, /audio-pack/);
  assert.match(run(tmp(), ['audio'], { ...many(10), 'assets/audio-pack-1.webm': '@size:15100000' }).out, /audio-pack-[0-9a-f]+\.webm is 15\.1 MB, over 15 MB/);
  assert.equal(fs.existsSync(path.join(dir, 'filesmap.json')), false, 'no map is left to publish');
});

// The real test-link build (vite.testlink.config.ts, the art packs, the audio packs), into a folder of the test's own (the lead's
// tools/testlink/dist, maybe waiting to publish, is not touched): it keeps its room and its file sizes. A round's new art that eats the
// room fails here, in CI, before the lead's build refuses at publish time. (about 15 s)
test('R-165.252 (LINK-ROOM): the real test-link build keeps 40 files free under the cap and every file under 13 MB (audio packs 15)', () => {
  const out = path.join(tmp(), 'dist');
  const repo = path.resolve(HERE, '../..');
  const b = spawnSync('npx', ['vite', 'build', '-c', 'tools/testlink/vite.testlink.config.ts', '--outDir', out, '--emptyOutDir', '--logLevel', 'error'], { cwd: repo, encoding: 'utf8' });
  assert.equal(b.status, 0, `${b.stdout}${b.stderr}`);
  const src = `
import json, sys
from pathlib import Path
sys.path.insert(0, ${JSON.stringify(HERE)})
import build
d = Path(${JSON.stringify(out)})
build.pack_audio(d)
print(json.dumps({'n': build.count_files(d), 'mb': build.largest_mb(d), 'bad': build.room_problems(d)}))
`;
  const r = spawnSync('python3', ['-c', src], { encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr);
  const got = JSON.parse(r.stdout) as { n: number; mb: number; bad: string[] };
  assert.deepEqual(got.bad, [], `${got.n} files, largest ${got.mb.toFixed(1)} MB`);
  // (the pictures went to the packs: index.js carries none of them, so it stays small)
  const idx = fs.readdirSync(path.join(out, 'assets')).filter((f) => /^index-.*\.js$/.test(f));
  assert.equal(idx.length, 1);
  assert.ok(fs.statSync(path.join(out, 'assets', idx[0])).size < 6e6, 'index.js is code, not pictures');
  assert.ok(fs.readdirSync(path.join(out, 'assets')).some((f) => f.startsWith('artpack-')), 'the art packs are built');
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

test('R-165.252 (LINK-ROOM): the test link names each new URL(picture) as a ?url import, so it can go in an art pack; nothing else changes', async () => {
  const { artAsImports } = await import('./vite.testlink.config.ts');
  const id = path.resolve(HERE, '../../src/components/hud/painted.tsx');
  const code = "export const A = new URL('../../assets/hud/hud-atlas.webp', import.meta.url).href;\nconst B = new URL(\"../../assets/characters/dot-perch-atlas.webp\", import.meta.url);\n";
  const out = artAsImports(code, id);
  assert.ok(out);
  assert.match(out, /^import __tlArt0 from "\.\.\/\.\.\/assets\/hud\/hud-atlas\.webp\?url";\nimport __tlArt1 from "\.\.\/\.\.\/assets\/characters\/dot-perch-atlas\.webp\?url";\n/);
  assert.match(out, /export const A = new URL\(__tlArt0, import\.meta\.url\)\.href;/);
  assert.match(out, /const B = new URL\(__tlArt1, import\.meta\.url\);/);
  // (a path that is not there, as in a comment, a template-literal name (the bundler's glob takes those), and a sound are left alone)
  assert.equal(artAsImports("// new URL('../../assets/none.webp', import.meta.url)\nnew URL(`../../assets/hud/${n}.webp`, import.meta.url);\nnew URL('../../assets/x.mp3', import.meta.url);", id), null);
});

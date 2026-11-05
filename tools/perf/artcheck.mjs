/**
 * The art size check (PERFORMANCE-RULES.md §8.2, first rule): a gate step, a few seconds, no browser.
 *
 *   node tools/perf/artcheck.mjs
 *
 * Fails (exit 1) on any image in src/assets over 4096 px on a side (the safe GPU texture size, §2.7), except the sheets already over
 * it when the check was made (limits.json art.knownOver4096, listed each run so they get split). Lists the creature clip sheets
 * (*-anim*.webp) over 2048 wide as notes. §8.2's other two rules (a clip sheet over about 2x its on-screen size, a world's decoded
 * total over its budget) are notes for now and not checked here.
 * Reads the sizes from the file headers itself (WebP, PNG, JPEG), so it needs nothing installed.
 *
 * The key-hue check (2026-11-05: the W6 wetLeaves and stakeLantern frames shipped with a pink smear of the magenta key): every image
 * with alpha must be in tools/perf/keyscan.json at its current sha1 (written by `python3 -I tools/perf/keyscan.py --write`, which
 * counts each frame's leftover key-hue pixels: magenta/pink, key green, flat grey); a frame over the scan's threshold fails unless it
 * is in tools/perf/keyknown.json (today's debt, each with an owner; shrink-only: a listed frame that is clean now fails here, an
 * added one fails knowncheck.mjs). A new or changed picture fails until the scan is re-run, so no picture ships unscanned.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const ASSETS = path.join(root, 'src', 'assets');
const MAX_SIDE = 4096, CLIP_WIDE = 2048;
// the sheets already over the limit when the check was made (2026-10-30): listed as debts, not failures, so only a new one fails
const KNOWN = new Set(JSON.parse(fs.readFileSync(path.join(root, 'tools', 'perf', 'limits.json'), 'utf8')).art.knownOver4096);

function size(file) {
  // (the header is enough: the first 64 KB)
  const fd = fs.openSync(file, 'r');
  const b = Buffer.alloc(65536);
  const got = fs.readSync(fd, b, 0, b.length, 0);
  fs.closeSync(fd);
  if (got < 32) return null;
  if (b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP') {
    const kind = b.toString('ascii', 12, 16);
    if (kind === 'VP8 ') return [b.readUInt16LE(26) & 0x3fff, b.readUInt16LE(28) & 0x3fff];
    if (kind === 'VP8L') { const v = b.readUInt32LE(21); return [(v & 0x3fff) + 1, ((v >> 14) & 0x3fff) + 1]; }
    if (kind === 'VP8X') return [b.readUIntLE(24, 3) + 1, b.readUIntLE(27, 3) + 1];
  }
  if (b.readUInt32BE(0) === 0x89504e47) return [b.readUInt32BE(16), b.readUInt32BE(20)];
  if (b[0] === 0xff && b[1] === 0xd8) {
    for (let i = 2; i < b.length - 9; ) {
      if (b[i] !== 0xff) { i++; continue; }
      const m = b[i + 1], len = b.readUInt16BE(i + 2);
      if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) return [b.readUInt16BE(i + 7), b.readUInt16BE(i + 5)];
      i += 2 + len;
    }
  }
  return null;
}

const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
const images = walk(ASSETS).filter((f) => /\.(webp|png|jpe?g)$/i.test(f));
const over = [], known = [], wideClips = [], unread = [];
for (const f of images) {
  const s = size(f);
  const rel = path.relative(root, f);
  if (!s) { unread.push(rel); continue; }
  const [w, h] = s;
  if (w > MAX_SIDE || h > MAX_SIDE) (KNOWN.has(rel) ? known : over).push(`${rel} ${w}x${h}`);
  if (/-anim[^/]*\.webp$/i.test(f) && w > CLIP_WIDE) wideClips.push(`${rel} ${w}x${h}`);
}
console.log(`art check: ${images.length} images in src/assets`);
if (wideClips.length) console.log(`note: ${wideClips.length} clip sheet(s) over ${CLIP_WIDE} wide:\n  ${wideClips.join('\n  ')}`);
if (known.length) console.log(`note: ${known.length} known sheet(s) over ${MAX_SIDE} (limits.json art.knownOver4096; to be split):\n  ${known.join('\n  ')}`);
if (unread.length) console.log(`note: ${unread.length} image(s) whose size could not be read:\n  ${unread.join('\n  ')}`);
// ---- the key-hue check (keyscan.py writes the counts; this needs no image library: it trusts the scan only at the file's sha1)
import crypto from 'node:crypto';
const SCAN = JSON.parse(fs.readFileSync(path.join(root, 'tools', 'perf', 'keyscan.json'), 'utf8'));
const KEYKNOWN = JSON.parse(fs.readFileSync(path.join(root, 'tools', 'perf', 'keyknown.json'), 'utf8')).known;
const keyId = (sheet, frame) => `${sheet}|${frame}`;
const knownKeys = new Set(KEYKNOWN.map((k) => keyId(k.sheet, k.frame)));
const T = SCAN.threshold;
const unscanned = [], keyNew = [], keyFixed = [], keyKnown = [];
const overNow = new Set();
const skipSky = (rel) => rel.startsWith('src/assets/backdrops/') && rel.includes('-sky');
for (const f of images) {
  const rel = path.relative(root, f).split(path.sep).join('/');
  if (!/\.(webp|png)$/i.test(f) || skipSky(rel)) continue;
  const row = SCAN.images[rel];
  const sha = crypto.createHash('sha1').update(fs.readFileSync(f)).digest('hex');
  if (!row || row.sha1 !== sha) { unscanned.push(rel); continue; }
  for (const fr of row.frames) {
    const worst = Object.keys(T).map((k) => [fr[k] / T[k], k]).sort((a, b) => b[0] - a[0])[0];
    if (worst[0] <= 1) continue;
    const id = keyId(rel, fr.frame);
    overNow.add(id);
    (knownKeys.has(id) ? keyKnown : keyNew).push(`${rel} ${fr.frame}: ${worst[1]} ${fr[worst[1]]} (over ${T[worst[1]]}, box ${fr.box.join(',')})`);
  }
}
for (const k of KEYKNOWN) if (!overNow.has(keyId(k.sheet, k.frame)) && SCAN.images[k.sheet]) keyFixed.push(`${k.sheet} ${k.frame}`);
console.log(`key-hue check: ${Object.keys(SCAN.images).length} images scanned, ${keyKnown.length} known frame(s) over the threshold (keyknown.json)`);
let fail = false;
if (unscanned.length) {
  console.log(`FAIL: ${unscanned.length} image(s) not in tools/perf/keyscan.json at their current content: run python3 -I tools/perf/keyscan.py --write\n  ${unscanned.slice(0, 40).join('\n  ')}`);
  fail = true;
}
if (keyNew.length) {
  console.log(`FAIL: ${keyNew.length} frame(s) with leftover key-hue pixels (python3 -I tools/perf/keyscan.py --contact <out.jpg> shows them):\n  ${keyNew.join('\n  ')}`);
  fail = true;
}
if (keyFixed.length) {
  console.log(`FAIL: ${keyFixed.length} keyknown.json entr(ies) are clean now: take them off the list (it only shrinks)\n  ${keyFixed.join('\n  ')}`);
  fail = true;
}
if (over.length) {
  console.log(`FAIL: ${over.length} image(s) over ${MAX_SIDE} px on a side (PERFORMANCE-RULES §2.7):\n  ${over.join('\n  ')}`);
  fail = true;
}
if (fail) process.exit(1);
console.log('PASS');

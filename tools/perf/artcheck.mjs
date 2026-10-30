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
if (over.length) {
  console.log(`FAIL: ${over.length} image(s) over ${MAX_SIDE} px on a side (PERFORMANCE-RULES §2.7):\n  ${over.join('\n  ')}`);
  process.exit(1);
}
console.log('PASS');

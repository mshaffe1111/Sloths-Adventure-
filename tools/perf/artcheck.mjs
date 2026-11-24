/**
 * The art size check (PERFORMANCE-RULES.md §8.2, first rule): a gate step, a few seconds, no browser.
 *
 *   node tools/perf/artcheck.mjs
 *
 * Fails (exit 1) on any image in src/assets over 4096 px on a side (the safe GPU texture size, §2.7), except the sheets already over
 * it when the check was made (limits.json art.knownOver4096, listed each run so they get split). Lists the creature clip sheets
 * (*-anim*.webp) over 2048 wide as notes. §8.2's other two rules (a clip sheet over about 2x its on-screen size, a world's decoded
 * total over its budget) are notes for now and not checked here.
 * Reads the sizes from the file headers itself (WebP, PNG, JPEG), so that part needs nothing installed.
 *
 * The see-through-row check (R-165.417; DRESS-27's seamcheck.py rule, found on 2-7's weir): every shipped frame (each {x,y,w,h} of a
 * sheet's sibling .json, else the whole image), cut to its painted box, fails on a ROW that is see-through across the piece: of the
 * columns painted both above it (alpha > 128 within 8 rows) and below it (alpha > 16 within 8 rows), at least 20% of the box's width,
 * 60% or more are fully transparent on that row. Such a row draws as a thin line of whatever is behind, across the screen. Decoded in
 * Chromium (playwright: node has no WebP decoder), so in CI this step runs after the browser install. No known list: a sheet that trips
 * it goes to the lead with a still (law 22).
 *   node tools/perf/artcheck.mjs                         the gate (sizes, then rows)
 *   node tools/perf/artcheck.mjs --seam <image>          the row check on one image (its sibling .json's frames, if any)
 * Planted, every run: tools/perf/fixtures/weir-seam-old.png (rows 290-370 of the weir cut before its repair) must trip it and the
 * repaired cut (reference/art/hfnext/cut/weir.png) must pass, or the gate fails: a check that cannot bite guards nothing.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

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

/** The row rule on one RGBA frame (alpha only); returns the see-through rows, in frame coordinates. Runs in the page (serialised). */
function seamRows(a, W, fx, fy, fw, fh) {
  // the painted box
  let x0 = fw, x1 = -1, y0 = fh, y1 = -1;
  for (let y = 0; y < fh; y++) for (let x = 0; x < fw; x++) if (a[((fy + y) * W + fx + x) * 4 + 3] > 0) {
    if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
  }
  if (x1 < 0) return [];
  const w = x1 - x0 + 1, h = y1 - y0 + 1, R = 8;
  const al = (x, y) => a[((fy + y0 + y) * W + fx + x0 + x) * 4 + 3];
  // per-column running counts of strong (> 128) and any (> 16) paint, rows [0, y)
  const hi = new Int32Array((h + 1) * w), lo = new Int32Array((h + 1) * w);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const v = al(x, y);
    hi[(y + 1) * w + x] = hi[y * w + x] + (v > 128 ? 1 : 0);
    lo[(y + 1) * w + x] = lo[y * w + x] + (v > 16 ? 1 : 0);
  }
  const rows = [];
  for (let y = R; y < h - R; y++) {
    let span = 0, clear = 0;
    for (let x = 0; x < w; x++) {
      if (hi[y * w + x] - hi[(y - R) * w + x] > 0 && lo[(y + 1 + R) * w + x] - lo[(y + 1) * w + x] > 0) {
        span++;
        if (al(x, y) === 0) clear++;
      }
    }
    if (span >= 0.2 * w && clear >= 0.6 * span) rows.push(y + y0);
  }
  return rows;
}

/** Decodes each image in Chromium and runs seamRows on its frames: [{ file, frames: [{name,x,y,w,h}] | null }] -> [{ file, name, rows }]. */
export async function seamCheck(items) {
  // (playwright: global in the container, found through NODE_PATH by require(), not by an ESM import; installed --no-save in CI)
  const { chromium } = createRequire(import.meta.url)('playwright');
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    const byUrl = new Map();
    await page.route('http://art.invalid/**', (route) => {
      const f = byUrl.get(route.request().url());
      return f ? route.fulfill({ path: f }) : route.fulfill({ status: 404 });
    });
    await page.goto('http://art.invalid/');
    await page.evaluate(`window.seamRows = ${seamRows.toString()}`);
    const out = [];
    for (const [k, it] of items.entries()) {
      const url = `http://art.invalid/${k}/${path.basename(it.file)}`;
      byUrl.set(url, it.file);
      const res = await page.evaluate(async ({ url, frames }) => {
        const bmp = await createImageBitmap(await (await fetch(url)).blob(), { premultiplyAlpha: 'none', colorSpaceConversion: 'none' });
        const c = new OffscreenCanvas(bmp.width, bmp.height);
        const g = c.getContext('2d');
        g.drawImage(bmp, 0, 0);
        const a = g.getImageData(0, 0, bmp.width, bmp.height).data;
        const fr = frames ?? [{ name: '(whole image)', x: 0, y: 0, w: bmp.width, h: bmp.height }];
        return fr.map((f) => ({ name: f.name, rows: window.seamRows(a, bmp.width, f.x, f.y, Math.min(f.w, bmp.width - f.x), Math.min(f.h, bmp.height - f.y)) }));
      }, { url, frames: it.frames });
      for (const r of res) out.push({ file: it.file, ...r });
    }
    return out;
  } finally { await browser.close(); }
}

/** A sheet's frames from its sibling .json ({ name: {x,y,w,h} }), or null (the whole image is one frame). */
function framesOf(file) {
  const j = file.replace(/\.(webp|png|jpe?g)$/i, '.json');
  if (!fs.existsSync(j)) return null;
  try {
    const o = JSON.parse(fs.readFileSync(j, 'utf8'));
    const fr = Object.entries(o).filter(([, v]) => v && ['x', 'y', 'w', 'h'].every((k) => Number.isFinite(v[k]))).map(([name, v]) => ({ name, x: v.x, y: v.y, w: v.w, h: v.h }));
    return fr.length ? fr : null;
  } catch { return null; }
}
const seamLine = (s) => `${path.relative(root, s.file)} ${s.name}: rows ${s.rows[0]}..${s.rows[s.rows.length - 1]} (${s.rows.length}) see-through across the piece`;

if (process.argv[2] === '--seam') {
  const file = path.resolve(process.argv[3]);
  const bad = (await seamCheck([{ file, frames: framesOf(file) }])).filter((s) => s.rows.length);
  for (const s of bad) console.log(`SEAM ${seamLine(s)}`);
  console.log(bad.length ? 'FAIL' : 'PASS');
  process.exit(bad.length ? 1 : 0);
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
let failed = false;
if (over.length) {
  console.log(`FAIL: ${over.length} image(s) over ${MAX_SIDE} px on a side (PERFORMANCE-RULES §2.7):\n  ${over.join('\n  ')}`);
  failed = true;
}
const t0 = Date.now();
const PLANT_RED = path.join(root, 'tools', 'perf', 'fixtures', 'weir-seam-old.png'), PLANT_GREEN = path.join(root, 'reference', 'art', 'hfnext', 'cut', 'weir.png');
const all = await seamCheck([PLANT_RED, PLANT_GREEN, ...images].map((file) => ({ file, frames: framesOf(file) })));
const [red, green] = all;
if (!red.rows.length || green.rows.length) {
  console.log(`FAIL: the planted row check is broken: the old weir cut ${red.rows.length ? 'tripped' : 'did NOT trip'} (must), the repaired cut ${green.rows.length ? 'tripped' : 'passed'} (must pass)`);
  failed = true;
} else console.log('row check plant: the old weir cut trips it, the repaired cut passes');
const seams = all.slice(2).filter((s) => s.rows.length);
console.log(`row check: ${images.length} images, ${((Date.now() - t0) / 1000).toFixed(0)} s`);
if (seams.length) {
  console.log(`FAIL: ${seams.length} frame(s) with a see-through row across the piece (R-165.417; fix the cut, never a known list):\n  ${seams.map(seamLine).join('\n  ')}`);
  failed = true;
}
if (failed) process.exit(1);
console.log('PASS');

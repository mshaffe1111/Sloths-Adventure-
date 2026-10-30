/**
 * Turns the harness's JSON (tools/perf/run.mjs) into the markdown report.
 *
 *   node tools/perf/report.mjs <dir with v6.json v7.json today.json> <out .md> [summary .json]
 *
 * Per build: per-frame cost (averaged over every counted frame of every scenario and orientation, main canvas), split by layer
 * (the line of Engine.render the call came from) and by call site; then the call sites v7 added or made heavier than v6.
 * Sites are keyed by file:line in the .ts source, so a site whose line moved between builds is matched by file + function + the
 * line's text, not the number.
 */
import fs from 'node:fs';
import path from 'node:path';

const [dir, outMd, outJson] = process.argv.slice(2);
// (PERF_BUILDS picks and orders the columns; PERF_DIFF="a:b,c:d" adds a heavier/lighter section for each pair)
const BUILDS = (process.env.PERF_BUILDS || 'v6,v7,today,ccrground,ccrnow,merged').split(',').filter((b) => fs.existsSync(path.join(dir, `${b}.json`)));
const data = Object.fromEntries(BUILDS.map((b) => [b, JSON.parse(fs.readFileSync(path.join(dir, `${b}.json`), 'utf8'))]));

const MPX = 1e6;
const f1 = (v) => (v >= 100 ? v.toFixed(0) : v >= 10 ? v.toFixed(1) : v.toFixed(2));
const screens = (area, canvas) => area / canvas;
const pct = (a, b) => (b ? `${(100 * a / b).toFixed(0)}%` : '-');

/** a key that survives a line moving: the file, the function, and the line's text */
const siteKey = (s) => `${s.site.replace(/:\d+$/, '')}|${s.fn}|${s.siteText}`;

function summarize(build) {
  const d = data[build];
  const out = { build, perRun: [], sites: new Map(), layers: new Map(), totals: null, timing: [] };
  let frameCount = 0;
  const T = { drawImage: 0, drawImageArea: 0, fills: 0, fillArea: 0, blendArea: 0, clips: 0, complexClips: 0, gradients: 0, patterns: 0, saves: 0, readbacks: 0, shadowSets: 0, filterSets: 0, gcoSets: 0, newCanvas: 0, canvasArea: 0 };
  for (const r of d.results) {
    if (r.error || !r.frames) { out.perRun.push({ run: `${r.scenario} ${r.orient}`, error: r.error }); continue; }
    const nf = r.frames.length;
    if (!nf) continue;
    const canvasPx = (() => { const c = (r.spots[0] && r.spots[0].canvas) || '1x1'; const [w, h] = c.split('x').map(Number); return w * h; })();
    const run = { run: `${r.scenario} ${r.orient}`, frames: nf, canvas: r.spots[0] && r.spots[0].canvas, quality: [...new Set(r.spots.map((s) => s.quality))].join(','), errors: (r.errors || []).length };
    for (const k of Object.keys(T)) if (k !== 'canvasArea') run[k] = r.frames.reduce((a, f) => a + (f[k] || 0), 0) / nf;
    run.overdraw = screens(run.drawImageArea, canvasPx);
    run.fillOverdraw = screens(run.fillArea, canvasPx);
    const tm = (r.times || []).map((t) => t.render).sort((a, b) => a - b);
    const tf = (r.times || []).map((t) => t.render + t.flush).sort((a, b) => a - b);
    run.renderMs = tm.length ? tm[Math.floor(tm.length / 2)] : 0;
    run.renderP90 = tm.length ? tm[Math.floor(tm.length * 0.9)] : 0;
    run.renderFlushMs = tf.length ? tf[Math.floor(tf.length / 2)] : 0;
    run.renderFlushP90 = tf.length ? tf[Math.floor(tf.length * 0.9)] : 0;
    out.perRun.push(run);
    frameCount += nf;
    for (const k of Object.keys(T)) if (k !== 'canvasArea') T[k] += r.frames.reduce((a, f) => a + (f[k] || 0), 0);
    T.canvasArea += canvasPx * nf;
    // sites: totals over the run's frames (divided by all frames later)
    for (const s of r.sites) {
      const key = `${siteKey(s)}|${s.target}`;
      let a = out.sites.get(key);
      if (!a) { a = { key, site: s.site, fn: s.fn, siteText: s.siteText, target: s.target, n: {}, area: {}, clipKinds: {}, gco: {}, special: {}, srcMaxDims: '', srcMax: 0, upMax: 0, layers: new Set(), offSize: s.offSize, runs: new Set() }; out.sites.set(key, a); }
      for (const g of ['n', 'area', 'clipKinds', 'gco', 'special']) for (const [k, v] of Object.entries(s[g] || {})) a[g][k] = (a[g][k] || 0) + v;
      if (s.srcMax > a.srcMax) { a.srcMax = s.srcMax; a.srcMaxDims = s.srcMaxDims; }
      a.upMax = Math.max(a.upMax, s.upMax || 0);
      a.layers.add(`${s.layer}  ${s.layerText || ''}`.trim());
      a.runs.add(`${r.scenario}/${r.orient}`);
      if (s.target === 'main') {
        const lk = s.layer;
        let L = out.layers.get(lk);
        if (!L) { L = { layer: s.layer, text: s.layerText, drawImage: 0, drawImageArea: 0, fills: 0, fillArea: 0, clips: 0, complexClips: 0, gradients: 0, saves: 0, special: 0 }; out.layers.set(lk, L); }
        L.drawImage += s.n.drawImage || 0;
        L.drawImageArea += s.area.drawImage || 0;
        L.fills += (s.n.fill || 0) + (s.n.fillRect || 0);
        L.fillArea += (s.area['fill(bbox)'] || 0) + (s.area.fillRect || 0);
        L.clips += s.n.clip || 0;
        L.complexClips += Object.entries(s.clipKinds || {}).filter(([k]) => k !== 'rect' && k !== 'multi-rect').reduce((x, [, v]) => x + v, 0);
        L.gradients += (s.n.createLinearGradient || 0) + (s.n.createRadialGradient || 0);
        L.saves += s.n.save || 0;
        L.special += Object.values(s.special || {}).reduce((x, v) => x + v, 0);
      }
    }
  }
  out.frameCount = frameCount;
  out.totals = Object.fromEntries(Object.entries(T).map(([k, v]) => [k, v / Math.max(1, frameCount)]));
  out.totals.overdraw = T.drawImageArea / Math.max(1, T.canvasArea);
  out.totals.fillOverdraw = T.fillArea / Math.max(1, T.canvasArea);
  out.avgCanvas = T.canvasArea / Math.max(1, frameCount);
  // per-frame site numbers
  for (const a of out.sites.values()) {
    a.perFrame = {
      drawImage: (a.n.drawImage || 0) / frameCount,
      drawMpx: (a.area.drawImage || 0) / frameCount / MPX,
      fills: ((a.n.fill || 0) + (a.n.fillRect || 0)) / frameCount,
      fillMpx: ((a.area['fill(bbox)'] || 0) + (a.area.fillRect || 0)) / frameCount / MPX,
      clips: (a.n.clip || 0) / frameCount,
      complexClips: Object.entries(a.clipKinds).filter(([k]) => k !== 'rect' && k !== 'multi-rect').reduce((x, [, v]) => x + v, 0) / frameCount,
      clipMpx: (a.area['clip(bbox)'] || 0) / frameCount / MPX,
      clipPts: (a.n['clip:pathPoints'] || 0) / Math.max(1, a.n.clip || 0),
      gradients: ((a.n.createLinearGradient || 0) + (a.n.createRadialGradient || 0) + (a.n.createConicGradient || 0)) / frameCount,
      saves: (a.n.save || 0) / frameCount,
      special: Object.values(a.special).reduce((x, v) => x + v, 0) / frameCount,
      shadow: (a.n['set shadowBlur>0'] || 0) / frameCount,
      filter: (a.n['set filter'] || 0) / frameCount,
      gcoSets: (a.n['set gco'] || 0) / frameCount,
      readbacks: ((a.n.getImageData || 0) + (a.n.putImageData || 0)) / frameCount,
      strokes: (a.n.stroke || 0) / frameCount,
      notReady: (a.n['drawImage(notReady)'] || 0) / frameCount,
    };
    // one number to rank by: device megapixels touched per frame, with clip-masked, blended and filtered work weighted up
    const p = a.perFrame;
    a.weight = p.drawMpx + p.fillMpx + p.complexClips * 0.25 + p.clipMpx * 0.5 + p.special * 0.05 + p.gradients * 0.02 + p.shadow * 0.2 + p.filter * 0.2 + p.readbacks * 0.5;
  }
  return out;
}

const S = Object.fromEntries(BUILDS.map((b) => [b, summarize(b)]));

const lines = [];
const L = (s = '') => lines.push(s);
const fileOf = (s) => s.split(':')[0].replace(/^src\//, '');
const clipStr = (a) => Object.entries(a.clipKinds).sort((x, y) => y[1] - x[1]).map(([k, v]) => `${k} ${f1(v / a.frames)}`).join(', ');
const specialStr = (a, nf) => Object.entries(a.special).sort((x, y) => y[1] - x[1]).slice(0, 3).map(([k, v]) => `${k} ${f1(v / nf)}`).join(', ');
const gcoStr = (a) => Object.keys(a.gco).filter((k) => !k.startsWith('smoothing')).join(' ');

const REVS = { v6: '192cd165', v7: '412f54f', today: '913677f', ccrground: '06cbcf12 (ccr + ground baked)', ccrnow: 'b83de6e6 (ccr at 10:45 ET)', merged: '9a76f161 (the merge, 12:20 ET)' };
const QUAL = data[BUILDS[0]].quality ?? 0;
L(`# Frame cost by build: ${BUILDS.map((b) => `${b} (${REVS[b] || '?'})`).join(', ')}`);
L();
L(`Measured ${new Date().toISOString().slice(0, 10)} by the perf harness (\`tools/perf/\`). Headless Chromium (SwiftShader), deviceScaleFactor 3, picture held at q${QUAL} (canvas at ${['2x', '1.5x', '1x'][QUAL]} CSS). Every number is per frame on the main canvas unless it says otherwise, averaged over every counted frame of every spot.`);
L();
L('**Read the counts, areas and clip types as the evidence.** CPU ms is headless software raster on a 4-core container, a hint of relative weight only, not the phone.');
L();
L('## 1. Per-frame totals');
L();
L('| per frame | ' + BUILDS.join(' | ') + ' |');
L('|---|' + BUILDS.map(() => '---:').join('|') + '|');
const row = (label, fn) => L(`| ${label} | ${BUILDS.map((b) => fn(S[b])).join(' | ')} |`);
row('frames counted', (s) => s.frameCount);
row('drawImage calls', (s) => f1(s.totals.drawImage));
row('drawImage visible area (screens)', (s) => f1(s.totals.overdraw));
row('fill/fillRect calls', (s) => f1(s.totals.fills));
row('fill area, bbox (screens)', (s) => f1(s.totals.fillOverdraw));
row('area drawn with a non-source-over blend (screens)', (s) => f1(s.totals.blendArea / s.avgCanvas));
row('clip() calls', (s) => f1(s.totals.clips));
row('  of them curved/polygon (not a plain rect)', (s) => f1(s.totals.complexClips));
row('gradients created', (s) => f1(s.totals.gradients));
row('patterns created', (s) => f1(s.totals.patterns));
row('save()', (s) => f1(s.totals.saves));
row('shadowBlur>0 sets', (s) => f1(s.totals.shadowSets));
row('filter sets', (s) => f1(s.totals.filterSets));
row('globalCompositeOperation sets (not source-over)', (s) => f1(s.totals.gcoSets));
row('getImageData/putImageData', (s) => f1(s.totals.readbacks));
row('canvases created', (s) => f1(s.totals.newCanvas));
L();

L('## 2. Per run (scenario x orientation)');
L();
L('`img` = drawImage calls / visible screens; `clip` = all / curved-or-polygon; `ms` = render() CPU median (p90), `+flush` = render plus a 1-pixel read that waits for the raster, median.');
L();
const runs = [...new Set(BUILDS.flatMap((b) => S[b].perRun.map((r) => r.run)))];
L('| run | ' + BUILDS.map((b) => `${b} img | ${b} clip | ${b} grad | ${b} ms | ${b} +flush`).join(' | ') + ' |');
L('|---|' + BUILDS.map(() => '---:|---:|---:|---:|---:').join('|') + '|');
for (const run of runs) {
  const cells = BUILDS.map((b) => {
    const r = S[b].perRun.find((x) => x.run === run);
    if (!r) return '-|-|-|-|-';
    if (r.error) return `error|-|-|-|-`;
    return `${f1(r.drawImage)} / ${f1(r.overdraw)} | ${f1(r.clips)} / ${f1(r.complexClips)} | ${f1(r.gradients)} | ${f1(r.renderMs)} (${f1(r.renderP90)}) | ${f1(r.renderFlushMs)}`;
  });
  L(`| ${run} | ${cells.join(' | ')} |`);
}
L();

L('## 3. By layer (the line of Engine.render each call came from)');
for (const b of BUILDS) {
  const s = S[b];
  const nf = s.frameCount;
  L();
  L(`### ${b}`);
  L();
  L('| layer (engine.ts line) | drawImage | img screens | fills | fill screens | clips (curved) | gradients | save | blended/filtered/shadowed draws |');
  L('|---|---:|---:|---:|---:|---:|---:|---:|---:|');
  const ls = [...s.layers.values()].sort((x, y) => (y.drawImageArea + y.fillArea) - (x.drawImageArea + x.fillArea));
  for (const l of ls.slice(0, 22)) {
    L(`| \`${l.layer}\` ${l.text ? '`' + l.text.replace(/\|/g, '\\|').slice(0, 70) + '`' : ''} | ${f1(l.drawImage / nf)} | ${f1(l.drawImageArea / nf / s.avgCanvas)} | ${f1(l.fills / nf)} | ${f1(l.fillArea / nf / s.avgCanvas)} | ${f1(l.clips / nf)} (${f1(l.complexClips / nf)}) | ${f1(l.gradients / nf)} | ${f1(l.saves / nf)} | ${f1(l.special / nf)} |`);
  }
}
L();

L('## 4. By call site, top 25 per build (ranked by device megapixels touched per frame, clip/blend work weighted up)');
for (const b of BUILDS) {
  const s = S[b];
  L();
  L(`### ${b}`);
  L();
  L('| site | target | drawImage | img Mpx | fills | fill Mpx | clips (curved) | grad | other |');
  L('|---|---|---:|---:|---:|---:|---:|---:|---|');
  const top = [...s.sites.values()].sort((x, y) => y.weight - x.weight).slice(0, 25);
  for (const a of top) {
    const p = a.perFrame;
    const other = [p.special ? `special ${f1(p.special)} (${specialStr(a, s.frameCount)})` : '', p.shadow ? `shadow ${f1(p.shadow)}` : '', p.filter ? `filter ${f1(p.filter)}` : '', p.readbacks ? `readback ${f1(p.readbacks)}` : '', a.srcMaxDims ? `src ${a.srcMaxDims}` : '', a.target === 'off' ? `into ${a.offSize}` : ''].filter(Boolean).join('; ');
    L(`| \`${a.site}\` ${a.fn ? '(' + a.fn + ')' : ''} | ${a.target} | ${f1(p.drawImage)} | ${f1(p.drawMpx)} | ${f1(p.fills)} | ${f1(p.fillMpx)} | ${f1(p.clips)} (${f1(p.complexClips)}) | ${f1(p.gradients)} | ${other} |`);
  }
}
L();

// ---- what v7 added or made heavier -----------------------------------------------------------------------------------------
function diffTop(base, next, n = 15) {
  const A = S[base], B = S[next];
  const rows = [];
  for (const b of B.sites.values()) {
    const a = A.sites.get(b.key);
    const pa = a ? a.perFrame : null;
    const d = (k) => b.perFrame[k] - (pa ? pa[k] : 0);
    const delta = b.weight - (a ? a.weight : 0);
    if (delta <= 0.001) continue;
    rows.push({ b, a, delta, d });
  }
  rows.sort((x, y) => y.delta - x.delta);
  return rows.slice(0, n);
}
const fmtDiff = (rows, base, next) => {
  const out = [];
  out.push(`| # | call site (${next}) | ${base}→${next} | drawImage /frame | img Mpx /frame | fills / fill Mpx | clips /frame (curved; pts) | gradients | blend/shadow/filter | notes |`);
  out.push('|---:|---|---|---:|---:|---:|---:|---:|---:|---|');
  rows.forEach(({ b, a, d }, i) => {
    const p = b.perFrame;
    const pa = a ? a.perFrame : null;
    const ch = (k, dig = f1) => (pa ? `${dig(pa[k])}→${dig(p[k])}` : dig(p[k]));
    const notes = [b.siteText ? '`' + b.siteText.replace(/\|/g, '\\|').slice(0, 80) + '`' : '', b.srcMaxDims ? `src up to ${b.srcMaxDims}` : '', b.upMax > 1.5 ? `scaled up to ${b.upMax.toFixed(1)}x` : '', Object.keys(b.clipKinds).length ? `clip: ${Object.entries(b.clipKinds).map(([k, v]) => `${k}`).join('/')}` : '', gcoStr(b) ? `gco ${gcoStr(b)}` : '', b.target === 'off' ? `bakes into ${b.offSize} every frame` : ''].filter(Boolean).join('; ');
    out.push(`| ${i + 1} | \`${b.site}\` ${b.fn ? '(' + b.fn + ')' : ''} | ${a ? 'heavier' : '**new**'} | ${ch('drawImage')} | ${ch('drawMpx')} | ${ch('fills')} / ${ch('fillMpx')} | ${ch('clips')} (${f1(p.complexClips)}; ${f1(p.clipPts)}) | ${ch('gradients')} | ${f1(p.special + p.shadow + p.filter)} | ${notes} |`);
  });
  return out;
};
let top15 = [];
if (S.v6 && S.v7) {
  top15 = diffTop('v6', 'v7');
  L('## 5. TOP 15 call sites v7 added or made heavier than v6');
  L();
  L('Ranked by the growth in device megapixels touched per frame (drawImage + fill area), with curved clips (x0.25 each), clip area (x0.5), blended/filtered/shadowed draws and gradients weighted in. "Mpx" = millions of device pixels; one q0 upright screen is 800x1760 = 1.41 Mpx (q2: 400x880 = 0.35 Mpx).');
  L();
  for (const l of fmtDiff(top15, 'v6', 'v7')) L(l);
  L();
}
if (S.v7 && S.today) {
  L('## 6. What today made heavier than v7 (top 10)');
  L();
  for (const l of fmtDiff(diffTop('v7', 'today', 10), 'v7', 'today')) L(l);
  L();
  L('## 7. What today made lighter than v7 (top 10)');
  L();
  const A = S.today, B = S.v7;
  const rows = [];
  for (const b of B.sites.values()) { const a = A.sites.get(b.key); const delta = b.weight - (a ? a.weight : 0); if (delta > 0.001) rows.push({ b, a, delta }); }
  rows.sort((x, y) => y.delta - x.delta);
  L('| site (v7) | weight v7→today | drawImage v7→today | img Mpx v7→today | clips v7→today |');
  L('|---|---:|---:|---:|---:|');
  for (const { b, a } of rows.slice(0, 10)) L(`| \`${b.site}\` (${b.fn}) | ${f1(b.weight)}→${a ? f1(a.weight) : 'gone'} | ${f1(b.perFrame.drawImage)}→${a ? f1(a.perFrame.drawImage) : 0} | ${f1(b.perFrame.drawMpx)}→${a ? f1(a.perFrame.drawMpx) : 0} | ${f1(b.perFrame.clips)}→${a ? f1(a.perFrame.clips) : 0} |`);
  L();
}
function pairSection(base, next, title) {
  L(`## ${title}`);
  L();
  L(`### Heavier in ${next} than ${base} (top 10)`);
  L();
  for (const l of fmtDiff(diffTop(base, next, 10), base, next)) L(l);
  L();
  L(`### Lighter in ${next} than ${base} (top 12)`);
  L();
  const A = S[next], B = S[base];
  const rows = [];
  for (const b of B.sites.values()) { const a = A.sites.get(b.key); const delta = b.weight - (a ? a.weight : 0); if (delta > 0.001) rows.push({ b, a, delta }); }
  rows.sort((x, y) => y.delta - x.delta);
  L(`| site (${base}) | weight | drawImage | img Mpx | clips | gradients |`);
  L('|---|---:|---:|---:|---:|---:|');
  for (const { b, a } of rows.slice(0, 12)) L(`| \`${b.site}\` (${b.fn}) | ${f1(b.weight)}→${a ? f1(a.weight) : 'gone'} | ${f1(b.perFrame.drawImage)}→${a ? f1(a.perFrame.drawImage) : 0} | ${f1(b.perFrame.drawMpx)}→${a ? f1(a.perFrame.drawMpx) : 0} | ${f1(b.perFrame.clips)}→${a ? f1(a.perFrame.clips) : 0} | ${f1(b.perFrame.gradients)}→${a ? f1(a.perFrame.gradients) : 0} |`);
  L();
}
if (S.today && S.ccrground) pairSection('today', 'ccrground', '8. ccr+ground (the lead\'s "Ground painted once") against today');
for (const pr of (process.env.PERF_DIFF || '').split(',').filter(Boolean)) {
  const [a, b] = pr.split(':');
  if (S[a] && S[b]) pairSection(a, b, `${b} against ${a}`);
}
fs.writeFileSync(outMd, lines.join('\n') + '\n');
if (outJson) {
  const j = {};
  for (const b of BUILDS) j[b] = { totals: S[b].totals, frameCount: S[b].frameCount, perRun: S[b].perRun, topSites: [...S[b].sites.values()].sort((x, y) => y.weight - x.weight).slice(0, 60).map((a) => ({ ...a, layers: [...a.layers], runs: [...a.runs] })), layers: [...S[b].layers.values()] };
  j.top15_v7_vs_v6 = top15.map(({ b, a, delta }) => ({ site: b.site, fn: b.fn, text: b.siteText, target: b.target, deltaWeight: delta, v6: a ? a.perFrame : null, v7: b.perFrame, clipKinds: b.clipKinds, gco: b.gco, srcMaxDims: b.srcMaxDims, layers: [...b.layers] }));
  fs.writeFileSync(outJson, JSON.stringify(j, null, 1));
}
console.log(lines.slice(0, 40).join('\n'));

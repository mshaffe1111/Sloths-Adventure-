/**
 * The draw check (PERFORMANCE-RULES.md §8.1): a gate step that fails when the per-frame drawing path breaks the limits in limits.json.
 *
 *   node tools/perf/drawcheck.mjs            (about 6 minutes; exit 1 on a breach, 2 when a scenario could not be played)
 *   DRAWCHECK_VERBOSE=1 node tools/perf/drawcheck.mjs   (also prints every worst-spot number, to set the limits)
 *   DRAWCHECK_RESULTS=/tmp/drawcheck-xxxx node tools/perf/drawcheck.mjs   (judges a run's saved results again, in seconds)
 *
 * It plays a small fixed set (the control test mix 14 and five stages) at q0, upright and sideways, 4 spots each, through the perf
 * harness (run.mjs: its own vite on a free port in this repo, every Canvas 2D call counted per call site by instrument.js), and judges
 * each scenario by its WORST spot (the average frame at that spot). For each breach it prints the call sites (file:line) behind it.
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '..', '..');
const L = JSON.parse(fs.readFileSync(path.join(here, 'limits.json'), 'utf8'));
const SCENARIOS = L.scenarios;
// (DRAWCHECK_RESULTS=<dir>: judge an earlier run's results again, e.g. after changing limits.json, without playing)
const again = process.env.DRAWCHECK_RESULTS;
const out = again || fs.mkdtempSync(path.join(os.tmpdir(), 'drawcheck-'));

const freePort = () => new Promise((res) => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => res(p)); }); });

// the two orientations run side by side, each with its own dev server
async function play(orient) {
  const port = await freePort();
  return new Promise((res) => {
    const p = spawn(process.execPath, [path.join(here, 'run.mjs'), orient, root, String(port), out, SCENARIOS.join(','), orient], {
      cwd: root, env: { ...process.env, PERF_Q: '0', PERF_TIME_FRAMES: '0', PERF_SPOTS: String(L.spots) }, stdio: ['ignore', 'pipe', 'pipe'],
    });
    p.stdout.on('data', (d) => process.stdout.write(String(d).split('\n').filter((l) => /spots|FAILED|retrying/.test(l)).map((l) => l + '\n').join('')));
    p.stderr.on('data', (d) => process.stderr.write(d));
    p.on('exit', (code) => res(code));
  });
}

const t0 = Date.now();
console.log(`draw check: ${SCENARIOS.join(', ')} at q0, upright and sideways, ${L.spots} spots each`);
if (!again) await Promise.all([play('port'), play('land')]);

// ---- judge ---------------------------------------------------------------------------------------------------------------------
const lim = L.limits;
const OK_BLENDS = new Set(L.blends.allowed);
const allowBlend = (s) => L.blends.allowlist.some((a) => a.site === `${s.site.replace(/:\d+$/, '')}#${s.fn}` || a.site === s.site);
const sum = (o, ks) => ks.reduce((a, k) => a + (o[k] || 0), 0);
// per-frame metric from a frame record, and the matching per-site count (to name the call sites behind a breach)
const METRICS = {
  gradients: { frame: (f) => f.gradients, site: (s) => sum(s.n, ['createLinearGradient', 'createRadialGradient', 'createConicGradient']) },
  shadowOrFilter: { frame: (f) => f.shadowSets + f.filterSets, site: (s) => sum(s.n, ['set shadowBlur>0', 'set filter']) },
  readbacks: { frame: (f) => f.readbacks, site: (s) => sum(s.n, ['getImageData', 'putImageData']) },
  drawImageScreens: { frame: (f, px) => f.drawImageArea / px, site: (s, px) => (s.area.drawImage || 0) / px },
  drawImageCalls: { frame: (f) => f.drawImage, site: (s) => s.n.drawImage || 0 },
  fillStrokeCalls: { frame: (f) => f.fills + f.strokes, site: (s) => sum(s.n, ['fill', 'fillRect', 'strokeRect', 'stroke']) },
  clips: { frame: (f) => f.clips, site: (s) => s.n.clip || 0 },
  shrunkOver2_5x: { frame: (f) => f.shrunk, site: (s) => s.n['shrunk>2.5x'] || 0 },
};

let breaches = 0, broken = 0;
const report = [];
for (const orient of ['port', 'land']) {
  const file = path.join(out, `${orient}.json`);
  if (!fs.existsSync(file)) { console.log(`\n✗ ${orient}: the harness wrote no results`); broken++; continue; }
  const { results } = JSON.parse(fs.readFileSync(file, 'utf8'));
  for (const r of results) {
    const name = `${r.scenario} ${orient}`;
    if (r.error || !r.frames || !r.frames.length) { console.log(`\n✗ ${name}: could not be played (${(r.error || 'no frames').slice(0, 160)})`); broken++; continue; }
    const [cw, ch] = (r.spots[0]?.canvas || '1x1').split('x').map(Number);
    const px = cw * ch;
    const main = r.sites.filter((s) => s.target === 'main');
    const lines = [];
    for (const [key, m] of Object.entries(METRICS)) {
      // the worst spot: each spot's average frame
      const bySpot = new Map();
      for (const f of r.frames) { const a = bySpot.get(f.spot) || [0, 0]; a[0] += m.frame(f, px); a[1]++; bySpot.set(f.spot, a); }
      let worst = 0, at = -1;
      for (const [sp, [v, n]] of bySpot) if (v / n > worst) { worst = v / n; at = sp; }
      const l = lim[key];
      // (DRAWCHECK_VERBOSE=1: every worst-spot number, for setting the limits)
      if (process.env.DRAWCHECK_VERBOSE) lines.push(`    ${key} ${worst.toFixed(2)} (limit ${l.max})`);
      const reportOnly = key === 'shrunkOver2_5x' && worst > 0 && worst <= l.max;
      if (worst > l.max || reportOnly) {
        const nf = r.frames.length;
        const sites = main.map((s) => ({ s, v: m.site(s, px) / nf })).filter((x) => x.v > 0).sort((a, b) => b.v - a.v).slice(0, 5);
        const tag = reportOnly ? 'note' : '✗';
        if (!reportOnly) breaches++;
        lines.push(`  ${tag} ${key} ${worst.toFixed(2)} at spot ${at} (x ${r.spots[at]?.x}) ${reportOnly ? `(reported; fails over ${l.max})` : `> limit ${l.max}`}`);
        for (const { s, v } of sites) lines.push(`      ${s.site} ${s.fn ? '(' + s.fn + ')' : ''} ${v.toFixed(2)}/frame  ${s.siteText ? '| ' + s.siteText.slice(0, 90) : ''}`);
      }
    }
    // advanced blends: any composite mode outside the coefficient ones, unless the site is allowlisted
    for (const s of main) {
      const modes = Object.keys(s.gco || {}).filter((k) => !k.startsWith('filter:') && !k.startsWith('smoothing:') && !OK_BLENDS.has(k));
      if (modes.length && !allowBlend(s)) {
        breaches++;
        lines.push(`  ✗ advanced blend ${modes.join(', ')} at ${s.site} (${s.fn}) ${s.siteText ? '| ' + s.siteText.slice(0, 90) : ''}`);
      }
    }
    if (r.errors?.length) lines.push(`  note: page errors: ${r.errors.slice(0, 2).join(' / ')}`);
    report.push(`${lines.some((x) => x.includes('✗')) ? '✗' : '✓'} ${name}`, ...lines);
  }
}
console.log('\n' + report.join('\n'));
console.log(`\n${breaches ? `FAIL: ${breaches} breach(es)` : broken ? 'FAIL: some scenarios could not be played' : 'PASS'} (${Math.round((Date.now() - t0) / 1000)} s; raw results in ${out})`);
process.exit(breaches ? 1 : broken ? 2 : 0);

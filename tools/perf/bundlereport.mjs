/**
 * The bundle breakdown (EN-S, 2026-11-11): what each JS chunk of the shipped build is made of, module by module, so a split is driven
 * by numbers. Builds as the deploy does (BASE_PATH, LESSONS D45) into a temp folder and prints every chunk with its biggest modules
 * (rendered bytes after minify-less tree-shaking: a module's share of the chunk, close to but not exactly its minified size).
 *   node tools/perf/bundlereport.mjs [--top 40] [--out reference/qa-reports/<id>/bundle.md]
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'vite';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const arg = (n, d) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : d; };
const TOP = Number(arg('--top', 40));
const outFile = arg('--out', '');
process.env.BASE_PATH = process.env.BASE_PATH || '/Sloths-Adventure-/';
const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bundlereport-'));
const chunks = [];
await build({
  root, logLevel: 'error',
  build: { outDir, emptyOutDir: true },
  plugins: [{
    name: 'bundle-report',
    generateBundle(_o, bundle) {
      for (const c of Object.values(bundle)) {
        if (c.type !== 'chunk') continue;
        const mods = Object.entries(c.modules ?? {}).map(([id, m]) => ({ id: path.relative(root, id.split('?')[0]), bytes: m.renderedLength ?? 0 })).sort((a, b) => b.bytes - a.bytes);
        chunks.push({ file: c.fileName, isEntry: c.isEntry, isDynamicEntry: c.isDynamicEntry, mods, rendered: mods.reduce((s, m) => s + m.bytes, 0) });
      }
    },
  }],
});
const n = (x) => x.toLocaleString('en-US');
const lines = [];
for (const c of chunks) c.bytes = fs.existsSync(path.join(outDir, c.file)) ? fs.statSync(path.join(outDir, c.file)).size : 0;
chunks.sort((a, b) => b.bytes - a.bytes);
lines.push(`# Bundle breakdown (BASE_PATH=${process.env.BASE_PATH})`, '', '| chunk | file bytes | loads | modules |', '|---|---:|---|---:|');
for (const c of chunks) lines.push(`| ${c.file} | ${n(c.bytes)} | ${c.isEntry ? 'entry' : c.isDynamicEntry ? 'lazy' : 'static'} | ${c.mods.length} |`);
for (const c of chunks.filter((c) => c.bytes > 100_000)) {
  const scale = c.rendered ? c.bytes / c.rendered : 1;
  lines.push('', `## ${c.file}: ${n(c.bytes)} B on disk, ${c.mods.length} modules (rendered ${n(c.rendered)} B before minify; est = rendered x ${scale.toFixed(3)})`, '', '| module | rendered B | est. minified B | share |', '|---|---:|---:|---:|');
  for (const m of c.mods.slice(0, TOP)) lines.push(`| ${m.id} | ${n(m.bytes)} | ${n(Math.round(m.bytes * scale))} | ${(100 * m.bytes / c.rendered).toFixed(1)}% |`);
  const rest = c.mods.slice(TOP);
  if (rest.length) lines.push(`| (the other ${rest.length}) | ${n(rest.reduce((s, m) => s + m.bytes, 0))} | ${n(Math.round(rest.reduce((s, m) => s + m.bytes, 0) * scale))} | |`);
  const dirs = new Map();
  for (const m of c.mods) { const d = m.id.startsWith('node_modules') ? 'node_modules' : path.dirname(m.id); dirs.set(d, (dirs.get(d) ?? 0) + m.bytes); }
  lines.push('', '| folder | rendered B | est. minified B |', '|---|---:|---:|');
  for (const [d, b] of [...dirs].sort((a, b) => b[1] - a[1]).slice(0, 15)) lines.push(`| ${d} | ${n(b)} | ${n(Math.round(b * scale))} |`);
}
const text = lines.join('\n') + '\n';
if (outFile) { fs.mkdirSync(path.dirname(path.resolve(root, outFile)), { recursive: true }); fs.writeFileSync(path.resolve(root, outFile), text); }
console.log(text);
fs.rmSync(outDir, { recursive: true, force: true });

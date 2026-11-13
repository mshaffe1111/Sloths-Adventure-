// The proven seed lists stay OUT of the game's main script (R-165.112): a list file (gen2/proven/seeds-<stage>.ts) is reached only by
// provenIndex.ts's own `() => import(...)`, which the build makes a chunk of its own (and by Node's on-the-spot read, seedList.ts
// loadNow, which no build sees). One static import of a list file anywhere along the way from the page's entry, src/main.tsx, would put
// a whole list back in the main script, whose size the precache limit holds (tools/perf/chunkcheck.mjs): planted below. The built
// chunks themselves are measured by reference/qa-reports/R-165.112/chunkproof.mjs.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PROVEN_INDEX } from './provenIndex.ts';

const SRC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const ROOT = path.resolve(SRC, '..');
/** the files a file imports for real: static imports, side-effect imports and re-exports (a type-only one is erased, a dynamic one is its
 *  own chunk: neither puts the file in the importer's script), each resolved to a file under the repo */
function staticImports(file: string, text = fs.readFileSync(file, 'utf8')): string[] {
  const out: string[] = [];
  const code = text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  for (const m of code.matchAll(/^\s*(?:import|export)\s+(?!type\b)(?:[^'";]*?\bfrom\s*)?['"]([^'"]+)['"]/gm)) {
    const spec = m[1];
    const base = spec.startsWith('.') ? path.resolve(path.dirname(file), spec) : spec.startsWith('@/') ? path.resolve(ROOT, spec.slice(2)) : null;
    if (!base) continue;
    const hit = [base, `${base}.ts`, `${base}.tsx`, path.join(base, 'index.ts'), path.join(base, 'index.tsx')].find((f) => fs.existsSync(f) && fs.statSync(f).isFile());
    if (hit && /\.tsx?$/.test(hit)) out.push(hit);
  }
  return out;
}
/** every file the game's main script is made from: all that the page's entry reaches by static imports */
function mainScript(entry: string): Set<string> {
  const seen = new Set<string>([entry]);
  for (const f of seen) for (const d of staticImports(f)) seen.add(d);
  return seen;
}
const rel = (f: string) => path.relative(SRC, f).split(path.sep).join('/');
const isList = (f: string) => /^game\/gen2\/proven\//.test(rel(f));

test("the game's main script reaches no list file by a static import; the index loads each list lazily (planted)", () => {
  // planted: what counts as a real import, and what does not
  const at = path.join(SRC, 'game', 'gen2', 'x.ts');
  const R = (t: string) => staticImports(at, t).map(rel);
  assert.deepEqual(R("import { LIST } from './proven/seeds-1-1.ts';"), ['game/gen2/proven/seeds-1-1.ts']);
  assert.deepEqual(R("import './proven/seeds-1-1.ts';"), ['game/gen2/proven/seeds-1-1.ts']);
  assert.deepEqual(R('export * from "./proven/seeds-1-1.ts";'), ['game/gen2/proven/seeds-1-1.ts']);
  assert.deepEqual(R("import {\n  a,\n  b,\n} from './seedList.ts';"), ['game/gen2/seedList.ts']);
  assert.deepEqual(R("import type { PackedList } from './proven/seeds-1-1.ts';"), [], 'a type-only import is erased');
  assert.deepEqual(R("const m = await import('./proven/seeds-1-1.ts');"), [], 'a dynamic import is its own chunk');
  assert.deepEqual(R("// import './proven/seeds-1-1.ts';\n/* import './proven/seeds-1-1.ts'; */"), [], 'a comment is not an import');
  // planted: a main script whose entry reaches a list two files away is caught (written to a scratch folder beside the lists, then removed)
  const tmp = fs.mkdtempSync(path.join(SRC, 'game', 'gen2', 'proven', 'planted-'));
  try {
    fs.writeFileSync(path.join(tmp, 'entry.ts'), "import { a } from './mid.ts';\nexport const e = a;\n");
    fs.writeFileSync(path.join(tmp, 'mid.ts'), "import { LIST } from '../seeds-1-1.ts';\nexport const a = LIST.seeds.length;\n");
    assert.ok([...mainScript(path.join(tmp, 'entry.ts'))].some((f) => rel(f) === 'game/gen2/proven/seeds-1-1.ts'), 'a static import two files from the entry is found');
    fs.writeFileSync(path.join(tmp, 'mid.ts'), "export const a = () => import('../seeds-1-1.ts');\n");
    assert.ok(![...mainScript(path.join(tmp, 'entry.ts'))].some((f) => rel(f) === 'game/gen2/proven/seeds-1-1.ts'), 'a dynamic import is not');
  } finally { fs.rmSync(tmp, { recursive: true, force: true }); }

  const entry = path.join(SRC, 'main.tsx');
  const main = mainScript(entry);
  assert.ok(main.size > 150 && main.has(path.join(SRC, 'game', 'gen2', 'seedList.ts')) && main.has(path.join(SRC, 'game', 'gen2', 'provenIndex.ts')), `${main.size} files from main.tsx, the loader and the index among them`);
  assert.deepEqual([...main].filter(isList).map(rel), [], 'a list would be bundled into the main script');
  // the index: one `load: () => import('./proven/seeds-<id>.ts')` a stage, and nothing imported but a type
  const index = fs.readFileSync(path.join(SRC, 'game', 'gen2', 'provenIndex.ts'), 'utf8');
  for (const id of Object.keys(PROVEN_INDEX)) assert.ok(index.includes(`load: () => import('./proven/seeds-${id}.ts')`), `${id}: loaded lazily`);
  assert.deepEqual(staticImports(path.join(SRC, 'game', 'gen2', 'provenIndex.ts')), []);
});

test("every stage in the index has its list file, and the index's own size does not depend on a list's length", () => {
  for (const id of Object.keys(PROVEN_INDEX)) assert.ok(fs.existsSync(path.join(SRC, 'game', 'gen2', 'proven', `seeds-${id}.ts`)), `proven/seeds-${id}.ts`);
  const bytes = fs.statSync(path.join(SRC, 'game', 'gen2', 'provenIndex.ts')).size;
  assert.ok(bytes < 700 + 120 * Object.keys(PROVEN_INDEX).length, `provenIndex.ts is ${bytes} bytes: a header and one short line a stage`);
});

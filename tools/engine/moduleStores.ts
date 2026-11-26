/**
 * Every module-level store the game's code keeps, readable from a test (ENG-SIM step 1, R-165.470: the probe-equality gate).
 *
 * A module's top-level `let` / `const` (a counter, a Map of tips said, a list of lines on screen) is invisible from outside its file, so
 * a probe (src/game/engineProbe.ts) that flies the engine ahead and puts it back cannot see whether it moved one. This bundles an entry
 * with esbuild into ONE file and appends a getter for every top-level binding of every module under src/, by the module it came from,
 * so a gate can print them all before and after a probe and name each store that changed. Bundling keeps every module's own code; the
 * gate compares the bundle with itself (probed vs not probed), never the bundle with the tsx run.
 *
 * `await buildStoreBundle(entry)` returns the bundle's path (a fresh file per call); `import(path)` it and read `__STORES` from it.
 */
import { build, type Plugin } from 'esbuild';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export interface StoreRef {
  /** the module, as the bundle names it (src/game/tipMemory.ts) */
  mod: string;
  /** the binding's name in the bundle (esbuild may suffix a repeated name: sent2) */
  name: string;
  kind: 'var' | 'let' | 'const';
  get(): unknown;
}

const ROOT = path.resolve(import.meta.dirname, '../..');
const ASSETS = ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg', '.mp3', '.ogg', '.wav', '.m4a', '.css', '.woff', '.woff2', '.ttf'];

/** each module keeps its own import.meta (a seed list is loaded by a require from its module's own folder: gen2/seedList.ts) */
const ownMeta: Plugin = {
  name: 'own-import-meta',
  setup(b) {
    b.onLoad({ filter: /\/src\/.*\.tsx?$/ }, (a) => ({
      loader: a.path.endsWith('x') ? 'tsx' : 'ts',
      contents: readFileSync(a.path, 'utf8')
        .replaceAll('import.meta.url', JSON.stringify(pathToFileURL(a.path).href))
        .replaceAll('import.meta.dirname', JSON.stringify(path.dirname(a.path)))
        .replaceAll('import.meta.filename', JSON.stringify(a.path)),
    }));
  },
};

/** bundle `entry` (a path from the repo root) with a `__STORES` list appended: every top-level binding of every src/ module */
export async function buildStoreBundle(entry: string): Promise<string> {
  const r = await build({
    plugins: [ownMeta],
    entryPoints: [path.join(ROOT, entry)],
    bundle: true,
    write: false,
    platform: 'node',
    format: 'esm',
    target: 'node22',
    packages: 'external',
    logLevel: 'silent',
    absWorkingDir: ROOT,
    loader: Object.fromEntries(ASSETS.map((x) => [x, 'empty' as const])),
  });
  const code = r.outputFiles[0].text;
  const refs: Array<{ mod: string; name: string; kind: string }> = [];
  let mod = '';
  for (const line of code.split('\n')) {
    const m = /^\/\/ (src\/\S+\.tsx?)$/.exec(line);
    if (m) { mod = m[1]; continue; }
    if (/^\/\/ /.test(line) && !/^\/\/ src\//.test(line)) { mod = ''; continue; }
    if (!mod) continue;
    const d = /^(var|let|const) (.*)$/.exec(line);
    if (!d) continue;
    // (`var a, b, c;` is esbuild's hoisting of a lazily started module's bindings; `var a = ...` is one binding)
    const list = /^[A-Za-z_$][\w$]*(?:, [A-Za-z_$][\w$]*)*;$/.test(d[2]) ? d[2].slice(0, -1).split(', ') : [/^([A-Za-z_$][\w$]*)\s*=/.exec(d[2])?.[1]];
    for (const name of list) if (name) refs.push({ mod, name, kind: d[1] });
  }
  const footer = `\nexport const __STORES = [\n${refs.map((x) => `  { mod: ${JSON.stringify(x.mod)}, name: ${JSON.stringify(x.name)}, kind: ${JSON.stringify(x.kind)}, get: () => ${x.name} },`).join('\n')}\n];\n`;
  // (inside the repo, so the bundle's packages resolve from its node_modules)
  const cache = path.join(ROOT, 'node_modules/.cache');
  mkdirSync(cache, { recursive: true });
  const dir = mkdtempSync(path.join(cache, 'stores-'));
  const out = path.join(dir, 'bundle.mjs');
  writeFileSync(out, code + footer);
  return out;
}

/** each store's print (`print` is the probe's graphPrint), by `mod name`; functions and classes are code, never a store */
export function printStores(stores: ReadonlyArray<StoreRef>, print: (v: object) => string): Map<string, string> {
  const out = new Map<string, string>();
  for (const s of stores) {
    let v: unknown;
    try { v = s.get(); } catch { continue; }
    if (typeof v === 'function') continue;
    if (s.kind === 'const' && (v === null || typeof v !== 'object')) continue;
    out.set(`${s.mod} ${s.name}`, v !== null && typeof v === 'object' ? print(v) : String(v));
  }
  return out;
}

/** the stores whose print differs between two printStores */
export const changedStores = (a: Map<string, string>, b: Map<string, string>): string[] =>
  [...new Set([...a.keys(), ...b.keys()])].filter((k) => a.get(k) !== b.get(k));

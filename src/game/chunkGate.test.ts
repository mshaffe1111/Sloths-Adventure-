// The split of the game's script into layered static files (EN-S, 2026-11-11; tools/perf/chunkplan.mjs) and the gate that measures it
// (tools/perf/chunkcheck.mjs). Held here, each with a planted failure:
//  - the plan is layered: every module a layer holds imports only modules of its own layer or a layer under it, never the main script,
//    so the built files cannot be tied in a loop and the game's code runs in the order it always did;
//  - the engine, the app shell and everything that imports them stay in the main script;
//  - the gate measures the build THAT SHIPS (LESSONS D45): gates.yml builds with the deploy's BASE_PATH, and chunkcheck fails a build
//    with any other base, a start file that imports the main script, and a file over the budget.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
// @ts-ignore (a plain .mjs tool: vite.config.ts and the gate share it)
import { buildPlan, chunkOf, staticImports, LAYERS, TOP, ROOT } from '../../tools/perf/chunkplan.mjs';

const order = new Map<string, number>((LAYERS as [string, RegExp][]).map(([name], i) => [name, i]));

/** every import that breaks the layering: a planned module importing the main script or a later layer */
function breaches(plan: Map<string, string>, imports: (f: string) => string[], layerOrder: Map<string, number>): string[] {
  const out: string[] = [];
  for (const [f, chunk] of plan) {
    for (const d of imports(f)) {
      if (d.startsWith('npm:') || !/\.(tsx?|mjs|js)$/.test(d)) continue;
      const to = plan.get(d);
      if (to === undefined) out.push(`${f} (${chunk}) imports ${d} (the main script)`);
      else if (layerOrder.get(to)! > layerOrder.get(chunk)!) out.push(`${f} (${chunk}) imports ${d} (${to}, a later layer)`);
    }
  }
  return out;
}

test('the plan is layered: a made-up graph, with a planted breach (planted)', () => {
  // top -> hub -> part -> data; world -> hub; the top imports everything
  const graph: Record<string, string[]> = {
    'src/main.tsx': ['src/App.tsx'], 'src/App.tsx': ['src/game/engine.ts'], 'src/game/engine.ts': ['src/game/hub.ts', 'src/game/w9Play.ts', 'src/game/bossPlay.ts'],
    'src/game/hub.ts': ['src/game/w9Parts.ts'], 'src/game/w9Parts.ts': ['src/game/xData.ts'], 'src/game/xData.ts': [],
    'src/game/w9Play.ts': ['src/game/hub.ts', 'src/game/w9Parts.ts'], 'src/game/bossPlay.ts': ['src/game/engine.ts'],
  };
  const files = Object.keys(graph);
  const imports = (f: string) => graph[f] ?? [];
  const layers: [string, RegExp, string?][] = [['data', /Data\.ts$/], ['w9-parts', /\/w9[A-Z]/, 'parts'], ['hub', /\/hub\.ts$/], ['w9', /\/w9[A-Z]/], ['boss', /\/boss[A-Z]/]];
  const lo = new Map(layers.map(([n], i) => [n, i]));
  // (the hub of this made-up game)
  const plan = (buildPlan as unknown as (...a: unknown[]) => Map<string, string>)(files, imports, layers, ['src/game/hub.ts']);
  assert.deepEqual(Object.fromEntries(plan), { 'src/game/xData.ts': 'data', 'src/game/w9Parts.ts': 'w9-parts', 'src/game/hub.ts': 'hub', 'src/game/w9Play.ts': 'w9' });
  // the engine, the app, and bossPlay (it imports the engine) are the main script, though bossPlay matches a layer
  for (const f of ['src/main.tsx', 'src/App.tsx', 'src/game/engine.ts', 'src/game/bossPlay.ts']) assert.equal(plan.has(f), false, f);
  assert.deepEqual(breaches(plan, imports, lo), []);
  // planted: a plan made by pattern alone (no closure, no layering) puts the hub's part in a LATER layer than the hub
  const naive = new Map<string, string>([['src/game/hub.ts', 'hub'], ['src/game/w9Parts.ts', 'w9'], ['src/game/w9Play.ts', 'w9']]);
  const found = breaches(naive, imports, lo);
  assert.ok(found.some((b) => b.includes('src/game/hub.ts (hub) imports src/game/w9Parts.ts (w9, a later layer)')), found.join('; '));
  assert.ok(found.some((b) => b.includes('imports src/game/xData.ts (the main script)')), found.join('; '));
});

test("the game's own plan: no layer imports the main script or a later layer; the top of the game stays in the main script", () => {
  const plan: Map<string, string> = buildPlan();
  assert.deepEqual(breaches(plan, staticImports, order), []);
  for (const f of TOP as string[]) assert.equal(plan.has(f), false, `${f} must stay in the main script`);
  // the split is real: the big pieces are out of the main script, each in its named file
  assert.equal(plan.get('src/game/gen2/seeds.ts'), 'rolls');
  assert.equal(plan.get('src/game/dotLinesData.ts'), 'lines');
  assert.equal(plan.get('src/game/protoStage.ts'), 'oldgen');
  assert.equal(plan.get('src/game/stageGenerator.ts'), 'oldgen');
  assert.equal(plan.get('src/game/gen2/worlds/w1.ts'), 'world-1-parts');
  assert.equal(plan.get('src/game/bossArt.ts'), 'bosses');
  assert.equal(plan.get('src/game/storyArt.ts'), 'story');
  assert.equal(plan.get('src/game/dotFlightRun.ts'), 'runs');
  assert.equal(plan.get('src/game/puzzlePlay.ts'), 'puzzle');
  assert.ok(plan.size > 400, `the plan places ${plan.size} modules`);
  // what vite asks: an absolute id, with or without a ?query; React is 'vendor'; a picture is 'art-urls'; the engine is the main script
  assert.equal(chunkOf(path.join(ROOT, 'src/game/gen2/seeds.ts') + '?x=1'), 'rolls');
  assert.equal(chunkOf(path.join(ROOT, 'node_modules/react-dom/index.js')), 'vendor');
  // a picture goes to the bottom file when a start module imports it, and stays with its late file when only a late module does
  const by = (importer: string) => () => ({ importers: [path.join(ROOT, importer)] });
  assert.equal(chunkOf(path.join(ROOT, 'src/assets/icons/about.webp'), by('src/components/icons/PaintedIcon.tsx')), 'art-urls');
  assert.equal(chunkOf(path.join(ROOT, 'src/assets/orch/x.mp3'), by('src/audio/orchLoader.ts')), undefined);
  // the loaders that were late files before the split are not placed: they stay late (planted: the first plan took all of src/audio)
  for (const late of ['src/audio/orchLoader.ts', 'src/audio/musicFiles.ts', 'src/audio/sampleLoader.ts', 'src/audio/sfxRecLoader.ts', 'src/audio/voice.ts', 'src/game/gen2/proven/seeds-1-1.ts', 'src/components/HelpOffer.tsx']) {
    assert.equal(plan.has(late), false, `${late} is loaded late and must not be placed in a start file`);
    assert.equal((plan as unknown as { start: Set<string> }).start.has(late), false, `${late} is not a start module`);
  }
  assert.equal(plan.get('src/audio/composer.ts'), 'audio');
  assert.equal(chunkOf(path.join(ROOT, 'src/game/engine.ts')), undefined);
  assert.equal(chunkOf('\0vite/preload-helper.js'), 'loader');
});

test("the gate's build is the deploy's build: gates.yml builds with deploy.yml's BASE_PATH before chunkcheck (D45; planted)", () => {
  const stepsOf = (file: string) => fs.readFileSync(path.join(ROOT, '.github/workflows', file), 'utf8');
  /** the BASE_PATH of the `vite build` / `npm run build` step that comes last before `marker` */
  const baseBefore = (yml: string, marker: RegExp): string | null => {
    const at = yml.search(marker);
    if (at < 0) return null;
    const upTo = yml.slice(0, at);
    const builds = [...upTo.matchAll(/^\s*- run: (?:npx vite build|npm run build)\s*$/gm)];
    const last = builds[builds.length - 1];
    if (!last) return null;
    const step = upTo.slice(last.index! + last[0].length).split(/^\s*- /m)[0];
    return /^\s*env:\s*\n(?:\s+#.*\n)*\s+BASE_PATH:[ \t]*(.+?)[ \t]*$/m.exec(step)?.[1] ?? '(none)';
  };
  const deploy = baseBefore(stepsOf('deploy.yml'), /Publish dist\/ to the gh-pages branch/);
  const gate = baseBefore(stepsOf('gates.yml'), /- run: node tools\/perf\/chunkcheck\.mjs/);
  assert.ok(deploy && deploy !== '(none)', `deploy.yml's publish build sets BASE_PATH (${deploy})`);
  assert.equal(gate, deploy, "gates.yml's build before chunkcheck uses the deploy's BASE_PATH");
  // planted: the old gates.yml (a plain build) is seen as a mismatch
  const old = '      - run: npx vite build\n      - run: node tools/perf/chunkcheck.mjs\n';
  assert.equal(baseBefore(old, /- run: node tools\/perf\/chunkcheck\.mjs/), '(none)');
});

test('chunkcheck fails a build that is not the one that ships, a start file tied to the main script, and a file over budget (planted)', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'chunkgate-'));
  const make = (name: string, base: string, files: Record<string, string>) => {
    const dir = path.join(tmp, name);
    fs.mkdirSync(path.join(dir, 'assets'), { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), `<html><head><script type="module" crossorigin src="${base}assets/index-AAAA1111.js"></script></head></html>`);
    for (const [f, text] of Object.entries(files)) fs.writeFileSync(path.join(dir, 'assets', f), text);
    return dir;
  };
  const run = (dir: string, env: Record<string, string> = {}) => {
    const r = spawnSync(process.execPath, [path.join(ROOT, 'tools/perf/chunkcheck.mjs')], { env: { ...process.env, CHUNKCHECK_DIR: dir, CHUNKCHECK_BASE: '', ...env }, encoding: 'utf8' });
    return { code: r.status, out: r.stdout + r.stderr };
  };
  const BASE = '/Sloths-Adventure-/';
  const good = { 'index-AAAA1111.js': 'import{a}from"./kit-BBBB2222.js";import"./data-CCCC3333.js";const late=()=>import("./late-DDDD4444.js");console.log(a,late);', 'kit-BBBB2222.js': 'import{d}from"./data-CCCC3333.js";export const a=d;', 'data-CCCC3333.js': 'export const d=1;', 'late-DDDD4444.js': 'import{a}from"./index-AAAA1111.js";export default a;' };
  try {
    // the build that ships, layered: PASS (a LATE file may import the main script: it is not loaded at the start)
    const ok = run(make('ok', BASE, good), { CHUNKCHECK_BASE: BASE });
    assert.equal(ok.code, 0, ok.out);
    assert.match(ok.out, /3 loaded at the start/);
    // planted: the same files built with no base (a plain `vite build`): FAIL, and it says how to build
    const plain = run(make('plain', '/', good), { CHUNKCHECK_BASE: BASE });
    assert.equal(plain.code, 1, plain.out);
    assert.match(plain.out, /not the build that ships[\s\S]*BASE_PATH=\/Sloths-Adventure-\/ npx vite build/);
    // (with no CHUNKCHECK_BASE given at all, the deploy's base is the default)
    const dflt = spawnSync(process.execPath, [path.join(ROOT, 'tools/perf/chunkcheck.mjs')], { env: { ...Object.fromEntries(Object.entries(process.env).filter(([k]) => k !== 'CHUNKCHECK_BASE')), CHUNKCHECK_DIR: path.join(tmp, 'plain') }, encoding: 'utf8' });
    assert.equal(dflt.status, 1, dflt.stdout);
    assert.match(dflt.stdout, /the deploy's is '\/Sloths-Adventure-\/'/);
    // planted: a start file that imports the main script
    const loop = run(make('loop', BASE, { ...good, 'kit-BBBB2222.js': 'import{d}from"./data-CCCC3333.js";import{z}from"./index-AAAA1111.js";export const a=d+z;' }), { CHUNKCHECK_BASE: BASE });
    assert.equal(loop.code, 1, loop.out);
    assert.match(loop.out, /assets\/kit-BBBB2222\.js imports the main script/);
    // planted: two start files in a loop of their own
    const ring = run(make('ring', BASE, { ...good, 'data-CCCC3333.js': 'import{a}from"./kit-BBBB2222.js";export const d=1;export const e=a;' }), { CHUNKCHECK_BASE: BASE });
    assert.equal(ring.code, 1, ring.out);
    assert.match(ring.out, /import loop: .*kit-BBBB2222\.js -> assets\/data-CCCC3333\.js -> assets\/kit-BBBB2222\.js/);
    // planted: a file over the budget
    const fat = run(make('fat', BASE, good), { CHUNKCHECK_BASE: BASE, CHUNKCHECK_BUDGET: '60' });
    assert.equal(fat.code, 1, fat.out);
    assert.match(fat.out, /chunk\(s\) over 60 B/);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('chunkcheck: Pixi is a late file of its own: never in a start file, never named by the page, always in the offline cache (R-3.1; planted)', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'chunkgate-pixi-'));
  const BASE = '/Sloths-Adventure-/';
  const make = (name: string, files: Record<string, string>, opts: { head?: string; sw?: string | null } = {}) => {
    const dir = path.join(tmp, name);
    fs.mkdirSync(path.join(dir, 'assets'), { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), `<html><head><script type="module" crossorigin src="${BASE}assets/index-AAAA1111.js"></script>${opts.head ?? ''}</head></html>`);
    for (const [f, text] of Object.entries(files)) fs.writeFileSync(path.join(dir, 'assets', f), text);
    if (opts.sw !== null) fs.writeFileSync(path.join(dir, 'sw.js'), opts.sw ?? `precacheAndRoute([${Object.keys(files).map((f) => `{url:"assets/${f}",revision:null}`).join(',')}])`);
    return dir;
  };
  const run = (dir: string) => {
    const r = spawnSync(process.execPath, [path.join(ROOT, 'tools/perf/chunkcheck.mjs')], { env: { ...process.env, CHUNKCHECK_DIR: dir, CHUNKCHECK_BASE: BASE }, encoding: 'utf8' });
    return { code: r.status, out: r.stdout + r.stderr };
  };
  // (Pixi's own code is known by the words in its warnings, whatever the file is called)
  const PIXI = 'export class R{warn(){console.warn("PixiJS Warning: ",1)}}';
  const good = {
    'index-AAAA1111.js': 'import{a}from"./kit-BBBB2222.js";const gpu=()=>import("./gpuPixi-CCCC3333.js");console.log(a,gpu);',
    'kit-BBBB2222.js': 'export const a=1;',
    'gpuPixi-CCCC3333.js': `${PIXI};const more=()=>import("./browserAll-DDDD4444.js");`,
    'browserAll-DDDD4444.js': 'import{R}from"./gpuPixi-CCCC3333.js";export const b=R;',
  };
  try {
    // Pixi behind import(), its files in the offline cache: PASS, and the gate says what it found
    const ok = run(make('ok', good));
    assert.equal(ok.code, 0, ok.out);
    assert.match(ok.out, /Pixi: 2 file\(s\), loaded on demand/);
    assert.match(ok.out, /2 loaded at the start/);
    // a build that never loads Pixi has nothing to hold: PASS, and it says so
    const none = run(make('none', { 'index-AAAA1111.js': 'import{a}from"./kit-BBBB2222.js";console.log(a);', 'kit-BBBB2222.js': 'export const a=1;' }));
    assert.equal(none.code, 0, none.out);
    assert.match(none.out, /Pixi: not in this build/);
    // planted: the main script imports the Pixi file plainly
    const eager = run(make('eager', { ...good, 'index-AAAA1111.js': 'import{a}from"./kit-BBBB2222.js";import{R}from"./gpuPixi-CCCC3333.js";console.log(a,R);' }));
    assert.equal(eager.code, 1, eager.out);
    assert.match(eager.out, /Pixi is loaded at the start[\s\S]*gpuPixi-CCCC3333\.js/);
    // planted: a start file two imports down reaches it
    const deep = run(make('deep', { ...good, 'kit-BBBB2222.js': 'import"./gpuPixi-CCCC3333.js";export const a=1;' }));
    assert.equal(deep.code, 1, deep.out);
    assert.match(deep.out, /Pixi is loaded at the start/);
    // planted: the bundler folded Pixi's code into a start file under another name
    const folded = run(make('folded', { 'index-AAAA1111.js': 'import{a}from"./kit-BBBB2222.js";console.log(a);', 'kit-BBBB2222.js': `${PIXI};export const a=1;` }));
    assert.equal(folded.code, 1, folded.out);
    assert.match(folded.out, /Pixi is loaded at the start[\s\S]*kit-BBBB2222\.js/);
    // planted: the page itself asks for the Pixi file (a preload tag)
    const pre = run(make('preload', good, { head: `<link rel="modulepreload" crossorigin href="${BASE}assets/gpuPixi-CCCC3333.js">` }));
    assert.equal(pre.code, 1, pre.out);
    assert.match(pre.out, /index\.html names assets\/gpuPixi-CCCC3333\.js/);
    // planted: a Pixi file left out of the offline cache (the old globIgnores): a stage started offline would have no GPU layer
    const uncached = run(make('uncached', good, { sw: 'precacheAndRoute([{url:"assets/index-AAAA1111.js",revision:null},{url:"assets/kit-BBBB2222.js",revision:null},{url:"assets/gpuPixi-CCCC3333.js",revision:null}])' }));
    assert.equal(uncached.code, 1, uncached.out);
    assert.match(uncached.out, /not in the offline cache[\s\S]*browserAll-DDDD4444\.js/);
    const noSw = run(make('nosw', good, { sw: null }));
    assert.equal(noSw.code, 1, noSw.out);
    assert.match(noSw.out, /no sw\.js/);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

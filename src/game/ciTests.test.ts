/**
 * Every test file in the repo is run by CI (PROOF-1 violation 5: four test files the t-int-engine merge added, tools/engine/library,
 * seedlist, yield and tools/inspect/travelBots, were outside the suite glob and no workflow ran them: a test never run guards nothing,
 * LAWS.md law 5). This reads the real workflow commands (.github/workflows/*.yml, every `tsx --test` line), expands their globs the way
 * the runner's bash does (no globstar: `**` is one folder), and requires each test file to be run by one of them, or to be on
 * NOT_IN_CI (ciTests.known.json) with its reason. It only shrinks: knowncheck fails on an added entry, and an entry that CI now runs, or that is gone, fails here until it is taken off.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

/** test files CI does not run, each with why: ciTests.known.json, shrink-only (knowncheck fails on an added entry; R-165.143) */
const NOT_IN_CI: Record<string, string> = Object.fromEntries(
  (JSON.parse(readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), 'ciTests.known.json'), 'utf8')).known as Array<{ file: string; why: string }>).map((k) => [k.file, k.why]),
);

/** the test-file arguments of every `tsx --test` command in the workflows */
export function ciTestArgs(root = ROOT): string[] {
  const dir = path.join(root, '.github/workflows');
  const out: string[] = [];
  for (const f of readdirSync(dir).filter((n) => /\.ya?ml$/.test(n))) {
    for (const line of readFileSync(path.join(dir, f), 'utf8').split('\n')) {
      const m = /tsx --test\s+(.*)$/.exec(line.replace(/\s+#.*$/, ''));
      if (m) out.push(...m[1].split(/\s+/).filter((a) => a && !a.startsWith('-') && !a.includes('=')));
    }
  }
  return out;
}

/** a bash glob (no globstar, so `**` matches like `*`: one folder name) as a regex */
const globRe = (g: string) => new RegExp(`^${g.split('/').map((part) => part.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*+/g, '[^/]*')).join('/')}$`);

const tracked = () =>
  execFileSync('git', ['ls-files', '*.test.ts', '*.test.tsx', '*.test.mjs'], { cwd: ROOT, encoding: 'utf8' }).split('\n').filter((f) => f && !f.startsWith('reference/'));

test("CI's commands run the four tools tests the t-int-engine merge added", () => {
  const res = ciTestArgs().map(globRe);
  for (const f of ['tools/engine/library.test.ts', 'tools/engine/seedlist.test.ts', 'tools/engine/yield.test.ts', 'tools/inspect/travelBots.test.ts'])
    assert.ok(res.some((r) => r.test(f)), `${f} is run by no workflow`);
});

test('every test file is run by CI, or is on NOT_IN_CI with its reason (which only shrinks)', () => {
  const res = ciTestArgs().map(globRe);
  const files = tracked();
  const run = (f: string) => res.some((r) => r.test(f));
  assert.deepEqual(files.filter((f) => !run(f) && !NOT_IN_CI[f]), [], 'test files no workflow runs: add them to a workflow (gates.yml) or the suite glob');
  assert.deepEqual(Object.keys(NOT_IN_CI).filter((f) => run(f) || !files.includes(f)), [], 'NOT_IN_CI entries now run by CI, or gone: take them off');
});

test('the glob reader matches bash without globstar', () => {
  assert.ok(globRe('src/components/**/*.test.ts').test('src/components/ui/a.test.ts'));
  assert.ok(!globRe('src/components/**/*.test.ts').test('src/components/a/b/c.test.ts'));
  assert.ok(!globRe('src/game/*.test.ts').test('src/game/gen2/x.test.ts'));
  assert.ok(globRe('tools/engine/yield.test.ts').test('tools/engine/yield.test.ts'));
});

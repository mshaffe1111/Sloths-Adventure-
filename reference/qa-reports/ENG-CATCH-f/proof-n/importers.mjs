import fs from 'node:fs'; import path from 'node:path'; import { execSync } from 'node:child_process';
const changed = execSync('git diff --name-only 7a580aefc HEAD -- src tools').toString().trim().split('\n').filter((f) => /\.(ts|mts|mjs|js)$/.test(f)).map((f) => path.resolve(f));
const tests = execSync("git ls-files 'src/**/*.test.ts' 'tools/**/*.test.ts' 'src/*.test.ts'").toString().trim().split('\n');
const out = new Set();
for (const t of tests) {
  if (changed.includes(path.resolve(t))) { out.add(t); continue; }
  const src = fs.readFileSync(t, 'utf8');
  for (const m of src.matchAll(/(?:from|import)\s*\(?\s*['"](\.[^'"]+)['"]/g)) {
    const r = path.resolve(path.dirname(t), m[1]);
    if (changed.includes(r)) { out.add(t); break; }
  }
}
console.log([...out].sort().join('\n'));

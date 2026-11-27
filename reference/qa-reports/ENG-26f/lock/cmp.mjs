// compare two lock files and two drops files as lockall --check does (by stage, the parts that moved); intended stages named
import fs from 'node:fs';
const [lockA, lockB, dropsA, dropsB, intendedArg] = process.argv.slice(2);
const intended = new Set((intendedArg ?? '').split(',').filter(Boolean));
const A = JSON.parse(fs.readFileSync(lockA, 'utf8')), B = JSON.parse(fs.readFileSync(lockB, 'utf8'));
const by = {};
let builds = 0, missing = 0;
for (const [k, parts] of Object.entries(B)) {
  const w = A[k]; if (!w) { missing++; continue; } builds++;
  for (const p of new Set([...Object.keys(parts), ...Object.keys(w)])) if (parts[p] !== w[p]) (by[k.split(' ')[0]] ??= new Set()).add(p);
}
const stages = new Set(Object.keys(B).map((k) => k.split(' ')[0]));
console.log(`lock: ${builds} builds compared (${missing} missing), ${stages.size - Object.keys(by).length}/${stages.size} stages unchanged`);
for (const [s, ps] of Object.entries(by)) console.log(`  ${s}${intended.has(s) ? ' (intended)' : ' SHIPPED'}: ${[...ps].join(', ')}`);
const dA = JSON.parse(fs.readFileSync(dropsA, 'utf8')), dB = JSON.parse(fs.readFileSync(dropsB, 'utf8'));
const dby = {};
let dn = 0;
for (const [k, v] of Object.entries(dB)) { if (!(k in dA)) continue; dn++; if (dA[k] !== v) (dby[k.split(' ')[0]] ??= []).push(k.split(' ').slice(1).join(' ')); }
console.log(`drops (gen2.drops + verdicts fingerprint): ${dn} builds compared, ${Object.keys(dby).length ? 'MOVED: ' + Object.entries(dby).map(([s, ks]) => `${s} (${ks.length}: ${ks.slice(0, 4).join('; ')})`).join(', ') : 'identical on every build'}`);
const bad = Object.keys(by).filter((s) => !intended.has(s)).concat(Object.keys(dby).filter((s) => !intended.has(s)));
process.exit(bad.length ? 1 : 0);

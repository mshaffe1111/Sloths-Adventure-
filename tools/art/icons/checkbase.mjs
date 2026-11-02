// D23 (second time, 2026-11-02): an "after" sheet shot before the last code change showed Crocus still behind the words box. Every
// BASE.txt in a folder whose name starts with "after" (or a BASE-after*.txt) under the given report dir must name a commit with no src/ change since it, and
// no "+wip" (a working tree differing from that commit). "before" folders are old on purpose and are skipped.
//   node tools/art/icons/checkbase.mjs reference/qa-reports/<job>      (exit 1 on a stale "after")
import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';
const root = process.argv[2];
const git = (...a) => execFileSync('git', a, { encoding: 'utf8' }).trim();
const bad = [];
const walk = (d) => {
  for (const n of fs.readdirSync(d)) {
    const p = path.join(d, n);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if ((n === 'BASE.txt' && /^after/.test(path.basename(d))) || /^BASE-after/.test(n)) {
      const line = fs.readFileSync(p, 'utf8').split('\n')[0];
      const m = line.match(/base ([0-9a-f]+)(\+wip)?/);
      if (!m) { bad.push(`${p}: no base line`); continue; }
      if (m[2]) { bad.push(`${p}: shot on a working tree that differed from ${m[1]} (+wip)`); continue; }
      const changed = git('diff', '--name-only', m[1], 'HEAD', '--', 'src', ':(exclude)*.test.ts');
      if (changed) bad.push(`${p}: shot at ${m[1]}, src changed since:\n    ${changed.split('\n').slice(0, 6).join('\n    ')}`);
    }
  }
};
walk(root);
if (bad.length) { console.log('STALE "after" shots (re-shoot on the final commit):\n' + bad.join('\n')); process.exit(1); }
console.log('PASS: every "after" BASE matches the code at HEAD');

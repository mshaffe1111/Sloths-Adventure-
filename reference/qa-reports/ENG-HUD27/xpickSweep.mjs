// ENG-HUD27b: the x-order first/last pick sweep (R-165.414). Run from the repo root: node reference/qa-reports/ENG-HUD27/xpickSweep.mjs .
import fs from 'node:fs'; import path from 'node:path';
const root = process.argv[2];
const files = []; const walk = (d) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else if (p.endsWith('.ts') && !p.endsWith('.test.ts')) files.push(p); } };
walk(path.join(root, 'src/game'));
const SORT = /sort\(\(([a-zA-Z]+), ([a-zA-Z]+)\) => (?:\1|\2)\.(x0|x|x1|start|cx|left)\b ?- ?(?:\1|\2)\.(x0|x|x1|start|cx|left)\b/;
const out = [];
for (const f of files) {
  const L = fs.readFileSync(f, 'utf8').split('\n');
  L.forEach((l, i) => {
    if (l.trim().startsWith('//') || l.trim().startsWith('*')) return;
    const m = SORT.exec(l); if (!m) return;
    const after = l.slice(m.index);
    let use = '';
    if (/^[^;]*\)\s*(\[0\]|\.at\(-1\)|\[[^\]]*length\s*-\s*1\]|\.pop\(\)|\.shift\(\)|\.find\()/.test(after)) use = 'direct';
    else {
      const v = /(?:const|let)\s+(\w+)\s*=/.exec(l)?.[1] ?? /(\w+(?:\.\w+)*)\.sort\(/.exec(l)?.[1];
      if (v) { const tail = L.slice(i, i + 25).join('\n'); const esc = v.replace(/\./g, '\\.'); if (new RegExp(`${esc}(\\[0\\]|\\.at\\(-1\\)|\\[${esc}\\.length - 1\\]|\\.find\\()`).test(tail)) use = `via ${v}`; }
    }
    if (use) out.push(`${path.relative(root, f)}:${i + 1}  [${use}]  ${l.trim().slice(0, 150)}`);
  });
}
console.log(out.join('\n')); console.log('picks', out.length);

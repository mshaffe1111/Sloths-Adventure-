// ENG-26m: castBots rows OLD vs RELISTED, row for row. usage: node rowdiff.mjs old.jsonl rel.jsonl
import fs from 'node:fs';
const read = (f) => new Map(fs.readFileSync(f, 'utf8').split('\n').filter((l) => l.startsWith('{')).map((l) => { const r = JSON.parse(l); return [`${r.bot} ${r.setting} ${r.seed}`, r]; }));
const [A, B] = [read(process.argv[2]), read(process.argv[3])];
const tiers = [...new Set([...A.values()].map((r) => `${r.bot} ${r.setting}`))];
const why = (r) => r.pass ? `PASS ${r.time}s` : r.error ? `error ${r.error.slice(0, 60)}` : `${r.end}${r.goal && r.goal.got < r.goal.need ? ` goal ${r.goal.got}/${r.goal.need}` : ''}${r.rescues ? ` rescued x${r.rescues}` : ''}${r.stuck?.length ? ` stuck@${r.stuck.map((s) => s.x).join(',')}` : ''}`;
for (const t of tiers) {
  const ka = [...A.keys()].filter((k) => k.startsWith(t + ' ')), pa = ka.filter((k) => A.get(k).pass).length, pb = ka.filter((k) => B.get(k)?.pass).length;
  const lost = ka.filter((k) => A.get(k).pass && !B.get(k)?.pass), won = ka.filter((k) => !A.get(k).pass && B.get(k)?.pass);
  console.log(`${t.padEnd(13)} OLD ${pa}/${ka.length}  REL ${pb}/${ka.length}  ${pb < pa ? 'DROP' : 'ok'}  lost [${lost.map((k) => k.split(' ')[2]).join(',')}] won [${won.map((k) => k.split(' ')[2]).join(',')}]`);
}
console.log('\nNEW misses (passed on OLD, not on REL):');
for (const [k, a] of A) { const b = B.get(k); if (a.pass && !b?.pass) console.log(`  ${k}: OLD ${why(a)} -> REL ${b ? why(b) : 'missing'}`); }
console.log('\nmisses on REL that also missed on OLD (same or other cause):');
for (const [k, a] of A) { const b = B.get(k); if (!a.pass && b && !b.pass) console.log(`  ${k}: OLD ${why(a)} | REL ${why(b)}`); }

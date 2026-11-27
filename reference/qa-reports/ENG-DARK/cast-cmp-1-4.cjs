// usage: node cmp.cjs base.jsonl cand.jsonl : rule-28 row compare (moved rows) + per tier/setting summary
const fs = require('fs');
const rd = (f) => fs.readFileSync(f, 'utf8').trim().split('\n').map((l) => JSON.parse(l));
const A = rd(process.argv[2]), B = rd(process.argv[3]);
const k = (r) => `${r.bot} ${r.setting} ${r.seed}`;
const ma = new Map(A.map((r) => [k(r), r]));
const moved = new Set(['normal 1','normal 2','normal 8','normal 10','normal 11','normal 12','normal 13','normal 14','normal 16','easy 5','easy 6']);
const f = (r) => `${r.end}${r.pass ? '' : ' FAIL'} t${r.time} g${r.goal?.got}/${r.goal?.need} res${r.rescues} hit${r.hits} st${(r.stuck || []).length}`;
const sum = {}; let diffs = 0, unmovedDiff = 0;
for (const b of B) {
  const a = ma.get(k(b)); const s = (sum[`${b.bot} ${b.setting}`] ??= { n: 0, pa: 0, pb: 0, sa: 0, sb: 0, ra: 0, rb: 0, ta: 0, tb: 0, under2a: 0, under2b: 0 });
  s.n++; s.pb += b.pass; s.sb += b.end === 'shrine'; s.rb += b.rescues; s.tb = Math.max(s.tb, b.time); s.under2b += b.time < 120;
  if (a) { s.pa += a.pass; s.sa += a.end === 'shrine'; s.ra += a.rescues; s.ta = Math.max(s.ta, a.time); s.under2a += a.time < 120; }
  if (!a || f(a) !== f(b)) { diffs++; const mv = moved.has(`${b.setting} ${b.seed}`); if (!mv) unmovedDiff++;
    console.log(`${mv ? 'MOVED ' : 'UNMOVED'} ${k(b)}: ${a ? f(a) : 'none'} -> ${f(b)}`); }
}
console.log(`rows ${A.length} -> ${B.length}; differing ${diffs} (on unmoved builds: ${unmovedDiff})`);
console.log('tier setting | pass base->cand | shrine | rescues | max time | runs under 2:00');
for (const [t, s] of Object.entries(sum)) console.log(`${t} | ${s.pa}->${s.pb}/${s.n} | ${s.sa}->${s.sb} | ${s.ra}->${s.rb} | ${s.ta}->${s.tb} | ${s.under2a}->${s.under2b}`);

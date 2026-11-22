// BUILD-26o: the in-place fill's order file (the lead's ruling): slot n (1-based, the layout variant) keeps the list's n-th seed when
// castBots --proven kept variant n; each failing slot takes the next NEW seed (sweep order) that passed the list's judge AND castBots
// --proven on the test-side tree. Prints the side-by-side table (slot, old seed, new seed) and writes the order for
// `seedlist.ts <stage> --merge <order> --in-order`.
//   node fillorder.mjs <list file seeds-<stage>.ts> <proven variants json> <new proven seeds json> <order out json>
import fs from 'node:fs';
const [listFile, provenFile, freshFile, out] = process.argv.slice(2);
const t = fs.readFileSync(listFile, 'utf8');
const old = t.match(/seeds"?\s*:\s*\[([^\]]*)\]/)[1].split(',').map(Number);
const kept = new Set(JSON.parse(fs.readFileSync(provenFile, 'utf8')));
const fresh = JSON.parse(fs.readFileSync(freshFile, 'utf8')).filter((s) => !old.includes(s));
const order = []; let k = 0; const moved = [];
old.forEach((s, i) => {
  if (kept.has(i + 1)) { order.push(s); return; }
  if (k >= fresh.length) throw new Error(`slot ${i + 1}: no new seed left (${fresh.length} given)`);
  order.push(fresh[k]); moved.push([i + 1, s, fresh[k]]); k++;
});
fs.writeFileSync(out, JSON.stringify(order));
console.log(`kept ${old.length - moved.length} of ${old.length}; filled ${moved.length} in place; new seeds unused ${fresh.length - k}`);
console.log('slot old new'); for (const [n, a, b] of moved) console.log(`${n} ${a} ${b}`);

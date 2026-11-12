// R-165.112: the main script's size does not depend on a proven list's length. Give it two (or more) builds of the SAME code that
// differ only in the list (npx vite build --outDir <dir>, once with 1-1's 200-seed list and once with its full list):
//   node reference/qa-reports/R-165.112/chunkproof.mjs <dist-a> <dist-b> [...]
// Prints each build's main script, list chunk and seed count; FAILS (exit 1) when the main scripts differ in size, a main script holds
// a packed plan, a list chunk is missing from the service worker's precache, or any chunk is over chunkcheck's budget.
import fs from 'node:fs';
import path from 'node:path';

const BUDGET = 3_994_304; // tools/perf/chunkcheck.mjs
const dirs = process.argv.slice(2);
if (dirs.length < 2) { console.log('chunkproof: give two or more dist folders'); process.exit(2); }
const fails = [];
const rows = dirs.map((d) => {
  const assets = fs.readdirSync(path.join(d, 'assets'));
  const main = assets.find((f) => /^index-.*\.js$/.test(f));
  const list = assets.find((f) => /^seeds-1-1-.*\.js$/.test(f));
  const mainText = fs.readFileSync(path.join(d, 'assets', main), 'utf8');
  const listText = fs.readFileSync(path.join(d, 'assets', list), 'utf8');
  const seeds = (/seeds:\s*\[([\d,\s]+)\]/.exec(listText)?.[1] ?? '').split(',').filter(Boolean).length;
  // a packed plan reads "seed:rerolls|t.j.v.salt;..." (seedList.ts packPlan): none may be in the main script
  const plansInMain = (mainText.match(/\d+:\d+\|\d+\.[wspj]m?\.[\d+]*\.\d*(?:\.\d+)?;/g) ?? []).length;
  const plansInList = (listText.match(/\d+:\d+\|\d+\.[wspj]m?\.[\d+]*\.\d*(?:\.\d+)?;/g) ?? []).length;
  const precached = fs.existsSync(path.join(d, 'sw.js')) && fs.readFileSync(path.join(d, 'sw.js'), 'utf8').includes(`assets/${list}`);
  const row = { dir: d, main, mainBytes: Buffer.byteLength(mainText), list, listBytes: Buffer.byteLength(listText), seeds, plansInMain, plansInList, precached };
  if (plansInMain) fails.push(`${d}: ${plansInMain} packed plans in the main script`);
  if (plansInList !== seeds) fails.push(`${d}: the list chunk holds ${plansInList} packed plans for ${seeds} seeds (the proof's own pattern must find every plan)`);
  if (!precached) fails.push(`${d}: sw.js does not precache assets/${list}`);
  for (const [n, b] of [[main, row.mainBytes], [list, row.listBytes]]) if (b > BUDGET) fails.push(`${d}: ${n} is ${b} B, over ${BUDGET}`);
  return row;
});
for (const r of rows) console.log(`${r.seeds} seeds: main ${r.mainBytes.toLocaleString('en-US')} B (${(BUDGET - r.mainBytes).toLocaleString('en-US')} spare of ${BUDGET.toLocaleString('en-US')}), list chunk ${r.listBytes.toLocaleString('en-US')} B, ${r.plansInMain} plans in main, precached ${r.precached}   [${r.dir}]`);
if (new Set(rows.map((r) => r.mainBytes)).size !== 1) fails.push(`the main scripts differ in size: ${rows.map((r) => r.mainBytes).join(' v ')}`);
if (new Set(rows.map((r) => r.seeds)).size < 2) fails.push('the builds hold the same number of seeds: nothing was compared');
console.log(fails.length ? `chunkproof: FAIL\n  ${fails.join('\n  ')}` : `chunkproof: PASS (the main script is ${rows[0].mainBytes.toLocaleString('en-US')} B with ${rows.map((r) => r.seeds).join(' and with ')} seeds)`);
process.exit(fails.length ? 1 : 0);

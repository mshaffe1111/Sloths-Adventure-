// (b) saves round-trip on the HEAD's save code: each save file -> parseSave -> applySave(fresh phone) -> buildSave -> parseSave again.
// Reports: loads?, every entry kept bit for bit (or what changed, by key), the summary, and that a second trip changes nothing.
import { readFileSync, readdirSync } from 'node:fs';
const sf = await import('../../../../src/game/saveFile.ts');
const fill = await import('../../../../src/game/saveFill.ts');
const dir = new URL('./saves/', import.meta.url).pathname;
let bad = 0;
for (const sub of ['095', '096', 'head']) {
  for (const f of readdirSync(dir + sub).filter((x) => x.endsWith('.json') && !x.endsWith('.storage.json'))) {
    const text = readFileSync(`${dir}${sub}/${f}`, 'utf8');
    const orig = JSON.parse(text);
    const r = sf.parseSave(text);
    if (!r.ok) { console.log(`${sub}/${f}: REFUSED (${r.reason})`); bad++; continue; }
    const phone = fill.memStorage();
    phone.setItem('sloth_unrelated_setting', 'x'); // something a phone holds that no save carries
    sf.applySave(phone, r.save);
    const got: Record<string, string> = {};
    for (const k of phone.keys()) if (sf.isSaveKey(k)) got[k] = phone.getItem(k)!;
    const lost = Object.keys(orig.data).filter((k) => !(k in got));
    const changed = Object.keys(orig.data).filter((k) => k in got && got[k] !== orig.data[k]);
    const added = Object.keys(got).filter((k) => !(k in orig.data));
    const again = sf.buildSave(phone, new Date(orig.savedAt || 0));
    const r2 = sf.parseSave(JSON.stringify(again));
    const same2 = r2.ok && JSON.stringify(r2.save.data) === JSON.stringify(r.save.data) && JSON.stringify(again.data) === JSON.stringify(r.save.data);
    const ok = lost.length === 0 && same2;
    if (!ok) bad++;
    console.log(`${sub}/${f}: v${orig.version} ${Object.keys(orig.data).length} entries -> kept ${Object.keys(got).length}; lost ${lost.length}${lost.length ? ' ' + lost.slice(0, 6).join(',') : ''}; changed ${changed.length}${changed.length ? ' ' + changed.slice(0, 6).join(',') : ''}; added ${added.length}${added.length ? ' ' + added.slice(0, 6).join(',') : ''}; second trip identical ${same2}; summary file ${JSON.stringify(orig.summary)} -> head ${JSON.stringify(again.summary)}; unrelated phone key kept ${phone.getItem('sloth_unrelated_setting') === 'x'}`);
  }
}
console.log(bad ? `FAIL ${bad}` : 'PASS');
process.exit(bad ? 1 : 0);

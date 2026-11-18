// npx tsx tools/engine/nodekey.ts: writes NODE-KEY.html's "What a node can ask" cards from gen2/nodeAsks.ts ELEMENTS (one source; nodeAsks.test.ts fails when they differ)
// and its Jobs, Made of and pieces rows from the one letter table, gen2/nodeLetters.ts (nodeLetters.test.ts fails when they differ)
import { readFileSync, writeFileSync } from 'node:fs';
import { ELEMENTS } from '../../src/game/gen2/nodeAsks.ts';
import { keyBlocks } from '../../src/game/gen2/nodeLetters.ts';
const f = new URL('../../reference/engine/NODE-KEY.html', import.meta.url);
let html = readFileSync(f, 'utf8');
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const label = { laid: 'Laid', checked: 'Checked', later: 'Later' } as const;
const cards = ELEMENTS.map((e) => `    <div class="card${e.status === 'later' ? ' later' : ''}" data-element="${esc(e.element)}" data-status="${e.status}"><div class="card-top"><span class="code">${esc(e.mark)}</span><span class="name">${esc(e.element)}</span><span class="pill ${e.status === 'later' ? 'later' : 'now'}">${label[e.status]}</span></div><p>${esc(e.how)}</p></div>`).join('\n');
// (a long code (":&snake*2", ":#pods@beat") takes its own line above the name rather than running under it)
const section = `<section aria-labelledby="h-asks" id="asks">
  <style>#asks .card-top{flex-wrap:wrap;row-gap:4px}#asks .code{flex:none;font-size:17px;overflow-wrap:anywhere}#asks .name{flex:1 1 120px;min-width:0}</style>
  <h2 id="h-asks">What a node can ask, and what the lay does with it</h2>
  <p class="note">Any element mixes with any other on one node, in any world whose kit has the pieces. Every element a code writes is laid, or the roll fails and names it: nothing a designer writes is dropped. <b>Laid</b>: the lay builds it from the ask, and the built roll is checked. <b>Checked</b>: the lay rolls it as before, and the roll fails by name when it is not there. <b>Later</b>: nothing in the engine lays it yet, so a code that writes it always fails by name.</p>
  <div class="cards">
${cards}
  </div>
</section>
`;
const start = html.indexOf('<section aria-labelledby="h-asks"');
if (start >= 0) html = html.slice(0, start) + section + html.slice(html.indexOf('</section>', start) + '</section>\n'.length);
else html = html.replace('<section aria-labelledby="h-mix">', section + '\n<section aria-labelledby="h-mix">');
// (the letters: each block from its `const NAME={` to its closing `}`, the rest of that line kept)
for (const [name, block] of Object.entries(keyBlocks())) {
  const a = html.indexOf(`const ${name}={`);
  if (a < 0) throw new Error(`NODE-KEY.html has no const ${name}`);
  html = html.slice(0, a) + block + html.slice(html.indexOf('\n}', a) + 2);
}
writeFileSync(f, html);

// writes the direction sheet, reference/story-delivery/DIRECTION.md, from the same code the scene player runs (src/game/storyDirect.ts):
// npx tsx tools/story-delivery/sheet.ts
import { writeFileSync, mkdirSync } from 'fs';
import { allScenes } from './scenes.ts';
import { directScene, OVERRIDES, PAGE_MAX, type Direction } from '../../src/game/storyDirect.ts';
import { NOTES, PREAMBLE } from './notes.ts';

const root = new URL('../../', import.meta.url).pathname;
const scenes = allScenes();
const cell = (s: string) => s.replace(/\|/g, '\\|').replace(/\n/g, ' ');
const short = (s: string, n = 70) => (s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s);
const camText = (d: Direction) => {
  if (d.shot === 'authored') return 'authored move';
  const c = d.camera!;
  const z = (v: number) => v.toFixed(2);
  return `${d.shot} ${z(c.from.zoom)}→${z(c.to.zoom)} ${c.dur.toFixed(1)}s`;
};
const toneText = (d: Direction) => (d.tone.silent ? 'silent (sung)' : d.tone.semis || d.tone.db ? `${d.tone.semis > 0 ? '+' : ''}${d.tone.semis} st, ${d.tone.db > 0 ? '+' : ''}${d.tone.db} dB` : 'own');

let all = 0;
let walls = 0;
let authored = 0;
let silences = 0;
let beats = 0;
const body: string[] = [];
for (const s of scenes) {
  const ds = directScene(s.panels);
  const n = s.panels.length;
  const w = s.panels.filter((p) => p.text.length > PAGE_MAX).length;
  const cam = s.panels.filter((p) => p.scene.camera || p.scene.follow).length;
  const cuts = ds.filter((d) => d.enter === 'cut').length;
  all += n;
  walls += w;
  authored += cam;
  silences += ds.filter((d) => d.music === 'silence').length;
  beats += ds.filter((d) => d.beat >= 600).length;
  body.push(`\n## ${s.title} (\`${s.key}\`, ${n} pictures)\n`);
  const flat: string[] = [];
  flat.push(`Every one of the ${n} pictures dips in from black today; directed, ${cuts} become cuts inside one setup.`);
  flat.push(`${n - cam} of ${n} pictures have only the shared 4% push (${cam} have a camera move of their own).`);
  if (w) flat.push(`${w} line${w > 1 ? 's are' : ' is'} over ${PAGE_MAX} letters, a wall of text on an upright phone: split into pages.`);
  flat.push('No line has a beat before it: the words start the moment the picture lands.');
  body.push(`**What's flat**\n\n${flat.map((f) => `- ${f}`).join('\n')}\n`);
  const notes = NOTES[s.key];
  if (notes) body.push(`**Direction**\n\n${notes.trim()}\n`);
  body.push('| # | Who | Line | In | Beat | Type | Camera | Voice | Music | Why |');
  body.push('|---|---|---|---|---|---|---|---|---|---|');
  ds.forEach((d, i) => {
    const p = s.panels[i];
    body.push(`| ${i} | ${cell(p.speaker)} | ${cell(short(p.text))}${d.pages.length > 1 ? ` (${d.pages.length} pages)` : ''} | ${d.enter} | ${d.beat} ms | ${d.typeMs} ms | ${camText(d)} | ${toneText(d)} | ${d.music} | ${cell(d.why.filter((x) => !x.includes('pages')).join('; '))} |`);
  });
}
const head = `# Story delivery: the direction sheet

Written by \`npx tsx tools/story-delivery/sheet.ts\` from \`src/game/storyDirect.ts\`, the code the scene player runs, so this sheet and the game
cannot disagree. The rules give every line its delivery; the ${OVERRIDES.length} hand-directed lines (OVERRIDES) are the big moments.
Story-delivery helper, 2026-10-30.

${PREAMBLE.trim()}

**Totals:** ${scenes.length} scenes, ${all} pictures. ${authored} had a camera move of their own (${Math.round((authored / all) * 100)}%); every other picture had the
same slow push. ${walls} lines were walls of text. Directed: ${beats} lines get a beat of 0.6 s or more before them, ${silences} get silence under them.

**Reading the tables.** *In*: how the picture arrives (cut, soft = a quick half-dark dip for a new place, dip = the full dip from dark
for a new chapter). *Beat*: silence before the first letter. *Type*: ms a letter. *Camera*: the shot, zoom from→to, over how long
(single = framed on the speaker, push = slow in, slowPush = slower and further on an emotional line, reveal = pull back, drift = a slow
pan on narration, still = held). *Voice*: the speaker's babble, its pitch and level on their own. *Music*: keep, under (half), silence,
swell.
`;
mkdirSync(`${root}reference/story-delivery`, { recursive: true });
writeFileSync(`${root}reference/story-delivery/DIRECTION.md`, head + body.join('\n') + '\n');
console.log(`${scenes.length} scenes, ${all} pictures`);

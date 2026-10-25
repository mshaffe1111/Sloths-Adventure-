import { writeFileSync } from 'node:fs';
import { INTRO_PANELS } from '../../../src/game/storyIntro.ts';
import { WORLD_STORIES, WORLD_MID } from '../../../src/game/storyWorlds.ts';
import { bossPanels, thornbarkPanels, BOSS_STORIES } from '../../../src/game/storyBosses.ts';
import { MEMORIES, AFTER_BOSS } from '../../../src/game/storyChapters.ts';
import { finalePanels } from '../../../src/game/storyFinale.ts';
import { WORLDS_DATA as worldData } from '../../../src/game/worldsData.ts';
type P = { chapter?: string; speaker?: string; text?: string };
const parts: Array<{ part: string; scenes: Array<{ title: string; note?: string; lines: Array<{ who: string; text: string }> }> }> = [];
const scene = (title: string, panels: P[], note?: string) => ({ title, note, lines: panels.filter((p) => p.text).map((p) => ({ who: p.speaker || 'Narrator', text: p.text! })) });
// split a run of panels into scenes by their chapter title
const byChapter = (panels: P[], note?: string) => {
  const out: ReturnType<typeof scene>[] = [];
  let cur: P[] = [], name = '';
  for (const p of panels) {
    if (p.chapter && p.chapter !== name && cur.length) { out.push(scene(name, cur, note)); cur = []; }
    name = p.chapter || name;
    cur.push(p);
  }
  if (cur.length) out.push(scene(name, cur, note));
  return out;
};
parts.push({ part: 'The Beginning', scenes: byChapter(INTRO_PANELS as P[]) });
for (let w = 1; w <= 10; w++) {
  const name = (worldData as any)[w - 1]?.name ?? `World ${w}`;
  const scenes = [
    ...byChapter(WORLD_STORIES[w].panels as P[], 'When Pokey arrives in this world'),
    ...byChapter(WORLD_MID[w] as P[], 'Halfway through the world (after stage 5)'),
    scene(`The Guardian: ${BOSS_STORIES[w] ? (bossPanels(w, 'intro', '')[0] as P)?.speaker ?? '' : ''}, before the fight`, bossPanels(w, 'intro', '') as P[], 'Before the boss fight'),
    scene('After the fight', bossPanels(w, 'defeat', '') as P[], 'When the guardian is beaten'),
    ...(AFTER_BOSS[w] ?? []).flatMap((id) => byChapter(MEMORIES[id].panels as P[], `Plays after the guardian falls: "${MEMORIES[id].title}"`)),
  ];
  parts.push({ part: `World ${w}: ${name}`, scenes });
}
parts.push({ part: 'The Secret Guardian', scenes: [scene('Thornbark, before the fight', thornbarkPanels('intro') as P[]), scene('Thornbark, after the fight', thornbarkPanels('defeat') as P[])] });
const all = Array.from({ length: 10 }, (_, i) => `w${i + 1}_keepsake`);
parts.push({ part: 'The Ending', scenes: byChapter(finalePanels(all) as P[], 'The ending (with every keepsake found: some lines only play when that keepsake was found)') });
writeFileSync((new URL('../', import.meta.url).pathname.replace(/\/$/, '') + '/storydoc/story.json'), JSON.stringify(parts, null, 1));
console.log(parts.map((p) => `${p.part}: ${p.scenes.length} scenes, ${p.scenes.reduce((n, s) => n + s.lines.length, 0)} lines`).join('\n'));

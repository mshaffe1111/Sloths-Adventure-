// every picture the story shows: which plates, which figures and frames, per chapter (for the repaint batches and the face check)
// npx tsx tools/art/storyart/inventory.ts [json]
import { INTRO_PANELS } from '../../../src/game/storyIntro.ts';
import { WORLD_STORIES, WORLD_MID, WORLD_GATE } from '../../../src/game/storyWorlds.ts';
import { MEMORIES, finalePanels, endTagPanels } from '../../../src/game/storyChapters.ts';
import { bossPanels, thornbarkPanels } from '../../../src/game/storyBosses.ts';
import type { StoryPanel } from '../../../src/game/story.ts';

const ALL = ['w2_keepsake', 'w3_keepsake', 'w5_keepsake', 'w6_keepsake', 'w7_keepsake', 'w9_keepsake', 'w1_keepsake', 'w4_keepsake', 'w8_keepsake', 'w10_keepsake'];
const groups: Record<string, StoryPanel[]> = { prologue: INTRO_PANELS };
for (const [w, s] of Object.entries(WORLD_STORIES)) groups[`world${w}`] = s.panels;
for (const [w, p] of Object.entries(WORLD_MID)) groups[`mid${w}`] = p;
for (const [w, p] of Object.entries(WORLD_GATE)) groups[`gate${w}`] = p;
for (const [id, m] of Object.entries(MEMORIES)) groups[`mem-${id}`] = m.panels;
for (let w = 1; w <= 10; w++) {
  groups[`boss${w}-intro`] = bossPanels(w, 'intro', 'Boss');
  groups[`boss${w}-defeat`] = bossPanels(w, 'defeat', 'Boss');
}
groups['thornbark-intro'] = thornbarkPanels('intro');
groups['thornbark-defeat'] = thornbarkPanels('defeat');
groups.finale = finalePanels(ALL);
groups.endtag = endTagPanels(ALL);

const out: Record<string, { plates: string[]; worlds: number[]; figures: Record<string, string[]> }> = {};
const frames = (a: any): string[] => {
  const f: string[] = [];
  for (const k of a.seq ?? []) (Array.isArray(k.frame) ? k.frame : [k.frame]).forEach((x: string) => x && f.push(x));
  if (a.mood) f.push('mood:' + a.mood);
  if (a.pose) f.push('pose:' + a.pose);
  return f;
};
for (const [g, ps] of Object.entries(groups)) {
  const o = (out[g] = { plates: [] as string[], worlds: [] as number[], figures: {} as Record<string, string[]> });
  for (const p of ps) {
    const s = p.scene;
    if (s.plate && !o.plates.includes(s.plate)) o.plates.push(s.plate);
    if (!s.plate && !o.worlds.includes(s.world)) o.worlds.push(s.world);
    for (const a of s.actors as any[]) {
      const who = a.kind === 'cel' ? `cel:${a.cel}` : a.kind === 'boss' ? `boss:${a.world}` : a.kind;
      const l = (o.figures[who] ??= []);
      for (const f of frames(a)) if (!l.includes(f)) l.push(f);
    }
  }
}
if (process.argv[2] === 'json') console.log(JSON.stringify(out, null, 1));
else for (const [g, o] of Object.entries(out)) console.log(g.padEnd(18), 'plates', o.plates.join(',') || '-', '| worlds', o.worlds.join(','), '|', Object.entries(o.figures).map(([k, v]) => `${k}(${v.length})`).join(' '));

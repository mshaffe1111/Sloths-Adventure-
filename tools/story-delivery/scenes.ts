// every story scene in the game, in play order, as data: `npx tsx tools/story-delivery/scenes.ts [--json]`
// (the recorder and the direction sheet read this list)
import { INTRO_PANELS, WORLD_STORIES, WORLD_MID, WORLD_GATE, bossPanels, thornbarkPanels, ENDING_PANELS, type StoryPanel } from '../../src/game/story.ts';
import { MEMORIES, MEMORY_ORDER } from '../../src/game/storyChapters.ts';
import { BOSS_STORIES } from '../../src/game/storyBosses.ts';

export interface SceneEntry { key: string; title: string; open: { screen: string; id: string }; panels: StoryPanel[] }

export function allScenes(): SceneEntry[] {
  const out: SceneEntry[] = [];
  out.push({ key: 'prologue', title: 'Prologue', open: { screen: 'story_cutscene', id: '1-1' }, panels: INTRO_PANELS });
  for (let w = 1; w <= 10; w++) {
    const ws = WORLD_STORIES[w];
    if (ws) out.push({ key: `w${w}-arrival`, title: `World ${w} arrival`, open: { screen: 'world_story', id: `${w}-1` }, panels: (ws as unknown as { panels: StoryPanel[] }).panels ?? (ws as unknown as StoryPanel[]) });
    if (WORLD_MID[w]) out.push({ key: `w${w}-mid`, title: `World ${w} midpoint`, open: { screen: 'world_mid', id: `${w}-5` }, panels: WORLD_MID[w] });
    if (WORLD_GATE[w]) out.push({ key: `w${w}-gate`, title: `World ${w} gate`, open: { screen: 'world_gate', id: `${w}-1` }, panels: WORLD_GATE[w] });
    if (BOSS_STORIES[w]) {
      out.push({ key: `w${w}-boss-intro`, title: `World ${w} guardian intro`, open: { screen: 'boss_intro', id: `${w}-10` }, panels: bossPanels(w, 'intro', 'boss') });
      out.push({ key: `w${w}-boss-defeat`, title: `World ${w} guardian defeat`, open: { screen: 'boss_defeat', id: `${w}-10` }, panels: bossPanels(w, 'defeat', 'boss') });
    }
  }
  out.push({ key: 'thornbark-intro', title: 'Thornbark intro', open: { screen: 'boss_intro', id: 'thornbark' }, panels: thornbarkPanels('intro') });
  out.push({ key: 'thornbark-defeat', title: 'Thornbark defeat', open: { screen: 'boss_defeat', id: 'thornbark' }, panels: thornbarkPanels('defeat') });
  for (const id of MEMORY_ORDER) {
    const m = MEMORIES[id] as unknown as { panels?: StoryPanel[]; title?: string };
    out.push({ key: `memory-${id}`, title: `Memory: ${m.title ?? id}`, open: { screen: 'memory', id }, panels: m.panels ?? [] });
  }
  out.push({ key: 'ending', title: 'Ending (finale)', open: { screen: 'ending_story', id: '10-10' }, panels: ENDING_PANELS });
  return out;
}

if (process.argv[1]?.endsWith('scenes.ts')) {
  const all = allScenes();
  if (process.argv.includes('--json')) console.log(JSON.stringify(all.map((s) => ({ key: s.key, title: s.title, open: s.open, n: s.panels.length }))));
  else for (const s of all) {
    console.log(`\n## ${s.key} (${s.title}) ${s.panels.length} panels`);
    s.panels.forEach((p, i) => {
      const sc = p.scene;
      const cam = [sc.camera ? 'cam:' + JSON.stringify(sc.camera).slice(0, 60) : '', sc.follow ? 'follow' : '', sc.zoom ? 'zoom' + sc.zoom : '', sc.fx?.length ? 'fx:' + sc.fx.map((f) => (f as { kind?: string }).kind ?? '?').join('+') : ''].filter(Boolean).join(' ');
      const moods = sc.actors.map((a) => `${a.kind}${a.cel ? ':' + a.cel : ''}${a.mood ? '/' + a.mood : ''}${a.seq ? '/seq' : ''}${a.move ? '/move' : ''}`).join(',');
      console.log(`${i}. [${p.speaker}] ${p.text}  {cue:${p.cue ?? '-'}${p.intensity !== undefined ? '@' + p.intensity : ''} sting:${p.sting ?? '-'} ${sc.plate ?? 'w' + sc.world}/${sc.mood} ${cam} | ${moods}}`);
    });
  }
}

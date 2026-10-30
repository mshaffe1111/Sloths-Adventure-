// the frames of Pokey, Meeca and Dot a story can show (their moods, gaits, faces): the HD repaint lists. npx tsx tools/art/storyart/framesused.ts
import { POKEY_MOODS, POKEY_GAITS, VISEMES, pokeyResolve } from '../../../src/game/heroStory.ts';
import { MEECA_MOODS, MEECA_GAITS } from '../../../src/game/jennifurSprite.ts';
import { STORY_FRAMES } from '../../../src/game/heroStoryData.ts';
import { DOT_FRAMES } from '../../../src/game/dotAtlasData.ts';
const take = (moods: Record<string, { steps: Array<[string, ...unknown[]]> }>, gaits: Record<string, { frames: Array<{ name: string }> }>) => {
  const s = new Set<string>();
  for (const m of Object.values(moods)) for (const st of m.steps) s.add(st[0]);
  for (const g of Object.values(gaits)) for (const f of g.frames) s.add(f.name);
  return s;
};
const pk = take(POKEY_MOODS as never, POKEY_GAITS as never);
for (const v of VISEMES) pk.add(v);
for (const f of Object.keys(STORY_FRAMES)) pk.add(f);
for (const f of ['face_calm', 'face_calm_closed', 'face_happy', 'face_surprised', 'face_tired', 'face_worried', 'face_gasp', 'face_scowl', 'face_neutral', 'face_oh', 'face_ah']) pk.add(f);
const pokey = [...pk].map((n) => [n, pokeyResolve(n) ?? null]);
const meeca = [...take(MEECA_MOODS as never, MEECA_GAITS as never)];
console.log(JSON.stringify({ pokey, meeca, dot: Object.keys(DOT_FRAMES) }));

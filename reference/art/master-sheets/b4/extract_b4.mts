/**
 * Part B4 of the art master catalog: dump every frame of every B4 image (characters, animals and enemies, UI, icons, story, photos)
 * from the game's own frame tables (src/game/*Data.ts and the few inline grids), plus which creature sheets each stage asks for
 * (stageSheets.ts) and each creature's sheet files (spriteSheets.ts SPRITES, creatureAnim.ts). Read-only; writes JSON to argv[2].
 * Run: npx tsx reference/art/master-sheets/b4/extract_b4.mts <out.json>
 */
import { writeFileSync } from 'node:fs';
const g = globalThis as any;
g.window = g; g.location = { search: '', href: 'http://x/' };
g.Image = class { src = ''; decode() { return Promise.resolve(); } };
g.document = { createElement: () => ({ getContext: () => null, style: {} }) };
const ROOT = '/home/user/Sloths-Adventure-/';
const G = ROOT + 'src/game/';
const rel = (u: string) => u.replace(/^file:\/\//, '').replace(ROOT, '').replace(/^.*?src\/assets\//, '');
type F = { file: string; src: string; key: string; x: number; y: number; w: number; h: number; ax?: number; ay?: number; sc?: number };
const frames: F[] = [];
const push = (file: string, src: string, key: string, r: any) =>
  frames.push({ file, src, key, x: r.x, y: r.y, w: r.w, h: r.h, ax: r.ax, ay: r.ay ?? r.gy, sc: r.sc });
// generic: module export -> one file, every {x,y,w,h} under it is a frame
const GENERIC: Array<[string, string, string]> = [
  ['birdAtlasData', 'BIRD_FRAMES', 'flora/birds-atlas.webp'], ['butterflyAtlasData', 'BUTTERFLY_FRAMES', 'flora/butterflies-atlas.webp'],
  ['boaAnimData', 'BOA_ANIM', 'enemies/boa-anim.webp'], ['boaAtlasData', 'BOA_FRAMES', 'enemies/boa-atlas.webp'],
  ['boss1010Data', 'BOSS1010', 'bosses/boss-1010.webp'], ['boss910Data', 'BOSS910', 'bosses/boss-910.webp'],
  ['bossAtkData', 'BOSS_ATK', 'bosses/boss-atk.webp'], ['bossFxData', 'BOSS_FX', 'bosses/boss-fx.webp'],
  ['butlerAtlasData', 'BUTLER_FRAMES', 'enemies/butler-poses.webp'], ['caimanAtlasData', 'CAIMAN_FRAMES', 'enemies/caiman-atlas.webp'],
  ['crocAnimData', 'CROC_ANIM_FRAMES', 'enemies/croc-anim.webp'], ['crocAtlasData', 'CROC_FRAMES', 'enemies/croc-atlas.webp'],
  ['danglerAnimData', 'DANGLER_ANIM', 'enemies/dangler-anim.webp'], ['danglerAtlasData', 'DANGLER_FRAMES', 'enemies/dangler-poses.webp'],
  ['dotAtlasData', 'DOT_FRAMES', 'characters/dot-atlas.webp'], ['dotPerchAtlasData', 'DOT_PERCH_FRAMES', 'characters/dot-perch-atlas.webp'],
  ['dozerAnimData', 'DOZER_ANIM', 'enemies/dozer-anim.webp'], ['dozerAtlasData', 'DOZER_FRAMES', 'enemies/dozer-poses.webp'],
  ['drakeAtlasData', 'DRAKE_FRAMES', 'enemies/drake-atlas.webp'], ['eagleAnimData', 'EAGLE_ANIM', 'enemies/eagle-anim.webp'],
  ['eagleAtlasData', 'EAGLE_FRAMES', 'enemies/eagle-atlas.webp'], ['flickerAnimData', 'FLICKER_ANIM', 'characters/flicker-anim.webp'],
  ['frogAtlasData', 'FROG_FRAMES', 'enemies/frog-atlas.webp'], ['goldsnakeAnimData', 'GOLDSNAKE_ANIM', 'enemies/goldsnake-anim.webp'],
  ['golemAtlasData', 'GOLEM_FRAMES', 'enemies/golem-atlas.webp'], ['guardAnimData', 'GUARD_ANIM', 'enemies/guard-anim.webp'],
  ['guardAtlasData', 'GUARD_FRAMES', 'enemies/guard-atlas.webp'], ['harpyAtlasData', 'HARPY_FRAMES', 'enemies/harpy-atlas.webp'],
  ['heroAtlasData', 'HERO_FRAMES', 'hero/hero-atlas.webp'], ['heroRopeData', 'ROPE_FRAMES', 'hero/hero-rope.webp'],
  ['heroStandardData', 'STD_FRAMES', 'hero/hero-standard.webp'], ['heroStoryData', 'STORY_FRAMES', 'hero/hero-story.webp'],
  ['heroStudiesData', 'STUDY_FRAMES', 'hero/hero-studies.webp'], ['heroVineData', 'VINE_FRAMES', 'hero/hero-vine.webp'],
  ['hudAtlasData', 'HUD_PIECES', 'hud/hud-atlas.webp'], ['ironclawAtlasData', 'IRONCLAW_FRAMES', 'enemies/ironclaw-atlas.webp'],
  ['jaguarAnimData', 'JAGUAR_ANIM', 'enemies/jaguar-anim.webp'], ['jaguarAtlasData', 'JAGUAR_FRAMES', 'enemies/jaguar-atlas.webp'],
  ['journalCardsData', 'JOURNAL_CARDS', 'enemies/journal-cards.webp'], ['mantisAnimData', 'MANTIS_ANIM', 'enemies/mantis-anim.webp'],
  ['mantisAtlasData', 'MANTIS_FRAMES', 'enemies/mantis-poses.webp'], ['medalAtlasData', 'MEDALLION_FRAMES', 'medals/medals.webp'],
  ['medalAtlasData', 'EMBLEM_FRAMES', 'medals/medals.webp'], ['meecaBlanketData', 'MEECA_BLANKET_FRAMES', 'characters/meeca-blanket.webp'],
  ['meecaCarveData', 'MEECA_CARVE_FRAMES', 'characters/meeca-carve.webp'], ['meecaStandardData', 'MEECA_FRAMES', 'characters/meeca-standard.webp'],
  ['monarchAtlasData', 'MONARCH_FRAMES', 'enemies/monarch-atlas.webp'], ['ocelotAnimData', 'OCELOT_ANIM', 'enemies/ocelot-anim.webp'],
  ['ocelotAtlasData', 'OCELOT_FRAMES', 'enemies/ocelot-atlas.webp'], ['pellAnimData', 'PELL_ANIM', 'enemies/pell-anim.webp'],
  ['prowlerAnimData', 'PROWLER_ANIM_FRAMES', 'enemies/prowler-anim.webp'], ['prowlerAtlasData', 'PROWLER_FRAMES', 'enemies/prowler-atlas.webp'],
  ['queenAnimData', 'QUEEN_ANIM', 'enemies/queen-anim.webp'], ['queenAtlasData', 'QUEEN_FRAMES', 'enemies/queen-atlas.webp'],
  ['reaverAtlasData', 'REAVER_FRAMES', 'enemies/reaver-atlas.webp'], ['seamstressAnimData', 'SEAMSTRESS_ANIM', 'enemies/seamstress-anim.webp'],
  ['seamstressAtlasData', 'SEAMSTRESS_FRAMES', 'enemies/seamstress-poses.webp'], ['snake2AtlasData', 'SNAKE2_FRAMES', 'enemies/snake2-atlas.webp'],
  ['snakeAtlasData', 'SNAKE_FRAMES', 'enemies/snake-atlas.webp'], ['soldierAnimData', 'SOLDIER_ANIM', 'enemies/soldier-anim.webp'],
  ['sovereignAtlasData', 'SOVEREIGN_FRAMES', 'enemies/sovereign-atlas.webp'], ['spiderAnimData', 'SPIDER_ANIM', 'enemies/spider-anim.webp'],
  ['spiderAtlasData', 'SPIDER_FRAMES', 'enemies/spider-atlas.webp'], ['tayraAtlasData', 'TAYRA_FRAMES', 'enemies/tayra-atlas.webp'],
  ['thornbarkAtlasData', 'THORNBARK_FRAMES', 'enemies/thornbark-atlas.webp'], ['trailsData', 'TRAILS', 'ui/trails.webp'],
  ['turtleAnimData', 'TURTLE_ANIM', 'enemies/turtle-anim.webp'], ['turtleAtlasData', 'TURTLE_FRAMES', 'enemies/turtle-atlas.webp'],
  ['uiKitData', 'UI_KIT', 'ui/ui-kit.webp'], ['venom2AtlasData', 'VENOM2_FRAMES', 'enemies/venom2-atlas.webp'],
  ['venomAtlasData', 'VENOM_FRAMES', 'enemies/venom-atlas.webp'], ['w8LanternAtlas', 'POKEY_JAR_FRAMES', 'w8/pokey-jar.webp'],
];
const walk = (v: any, path: string, cb: (p: string, r: any) => void, d = 0) => {
  if (!v || typeof v !== 'object' || d > 5) return;
  if (typeof v.x === 'number' && typeof v.y === 'number' && typeof v.w === 'number' && typeof v.h === 'number') return cb(path, v);
  for (const k of Object.keys(v)) walk(v[k], path ? `${path}.${k}` : k, cb, d + 1);
};
for (const [mod, ex, file] of GENERIC) {
  const m = await import(G + mod + '.ts');
  if (!m[ex]) throw new Error(`${mod}.${ex} missing`);
  walk(m[ex], '', (p, r) => push(file, `src/game/${mod}.ts ${ex}`, p, r));
}
// grids: hero clips (one sheet per clip), live plates, title clips, Pokey's swim moves
const { HERO_CLIPS } = await import(G + 'heroClipsData.ts');
for (const [name, c] of Object.entries<any>(HERO_CLIPS))
  for (let i = 0; i < c.n; i++) push(`hero/clips/${name}.webp`, 'src/game/heroClipsData.ts HERO_CLIPS', `${name}.${i}`, { x: (i % c.cols) * c.w, y: Math.floor(i / c.cols) * c.h, w: c.w, h: c.h, ax: c.ax, ay: c.ay });
const { LIVE_PLATES } = await import(G + 'livePlateData.ts');
for (const [name, c] of Object.entries<any>(LIVE_PLATES))
  for (let i = 0; i < c.n; i++) push(`story/live/${name}.webp`, 'src/game/livePlateData.ts LIVE_PLATES', `${name}.${i}`, { x: (i % c.cols) * c.w, y: Math.floor(i / c.cols) * c.h, w: c.w, h: c.h });
const tc = await import(ROOT + 'src/components/title/titleCast.ts');
for (const cast of [tc.POKEY_CAST, tc.MEECA_CAST]) for (const [name, clip] of Object.entries<any>(cast.clips)) {
  const file = rel(cast.sheets[clip.sheet]);
  clip.frames.forEach((r: any, i: number) => push(file, 'src/components/title/titleCast.ts', `${name}.${i}`, r));
}
tc.PAIR_LAUGH.clip.frames.forEach((r: any, i: number) => push(rel(tc.PAIR_LAUGH.url), 'src/components/title/titleCast.ts PAIR_LAUGH', `pair.${i}`, r));
const { SWIM_MOVES } = await import(G + 'heroSwimData.ts');
for (const [name, m] of Object.entries<any>(SWIM_MOVES)) m.at.forEach(([x, y]: number[], i: number) => push('hero/pokey-swim.webp', 'src/game/heroSwimData.ts SWIM_MOVES', `${name}.${i}`, { x, y, w: m.w, h: m.h, ax: m.ax, ay: m.ay }));
// paged: story cels (page a), story HD figures (page p)
const { CELS } = await import(G + 'storyCelData.ts');
walk(CELS, '', (p, r) => push(`characters/cels-${r.a}.webp`, 'src/game/storyCelData.ts CELS', p, r));
for (const set of ['dot', 'guard', 'meeca', 'pokey', 'pokeyface']) {
  const m = await import(G + `storyHdData_${set}.ts`);
  const ex = `HD_${set.toUpperCase()}_FRAMES`;
  walk(m[ex], '', (p, r) => push(`story/hd/${set}-${r.p}.webp`, `src/game/storyHdData_${set}.ts ${ex}`, p, r));
}
// stages: what each asks for (hand-built and painting on, as everyone plays)
const { generateAllLevels } = await import(G + 'worldsData.ts');
const { stageSheets } = await import(G + 'stageSheets.ts');
const stages: Record<string, string[]> = {};
for (const c of generateAllLevels()) stages[c.id] = stageSheets(c, { hand: true, paint: true, ctest: false });
const { SPRITES } = await import(G + 'spriteSheets.ts');
const { creatureAnimUrl } = await import(G + 'creatureAnim.ts');
const foeSheets: Record<string, string[]> = {};
for (const k of [...Object.keys(SPRITES), 'pell', 'soldier', 'flicker']) {
  const u = [...(SPRITES[k]?.urls() ?? [])];
  try { const a = creatureAnimUrl(k); if (a) u.push(a); } catch { /* none */ }
  foeSheets[k] = u.map(rel);
}
writeFileSync(process.argv[2], JSON.stringify({ frames, stages, foeSheets }, null, 0));
console.log('frames', frames.length, 'files', new Set(frames.map((f) => f.file)).size, 'stages', Object.keys(stages).length);

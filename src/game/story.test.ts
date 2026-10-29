import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import {
  BOSS_STORIES, ENDING_PANELS, INTRO_PANELS, WORLD_GATE, WORLD_MID, WORLD_STORIES, bossPanels, thornbarkPanels,
  type StoryCue, type StoryPanel, type StorySting,
} from './story.ts';
import { AFTER_BOSS, MEMORIES, MEMORY_ORDER, nextAfterBoss, parseMemories, type MemoryId } from './storyChapters.ts';
import { FINALE_KEEPSAKES, KEEPSAKE_LINES, SATCHEL_KEEPSAKES, endTagPanels, finalePanels } from './storyFinale.ts';
import { FINDS } from './finds.ts';
import { PLATES, isPlate } from './plateData.ts';

const CUES: StoryCue[] = ['pokey', 'meeca', 'bloom', 'grandma', 'journey', 'comedy', 'tender', 'sorrow', 'dread', 'war', 'chase', 'reveal', 'resolve', 'triumph', 'mercy', 'finale', 'hush'];
const STINGS: StorySting[] = ['cliffhanger', 'reveal', 'laugh', 'blow', 'bloom', 'darkness', 'door', 'heartbreak', 'triumph'];
const SPEAKERS = [
  'Narrator', 'Pokey', 'Meeca', 'Dot', 'Flicker', 'Grandma', 'Grandfather', 'Lieutenant Pell', 'Gruntlewick', 'Squirrel', 'General Iron-Claw', 'Thornbark',
  'Venom Fang', 'Crocus Rex', 'Shadow Prowler', 'Sky Sovereign', 'Tarantula Queen', 'Marsh Reaver', 'Stone Idol Golem', 'Night-Wing Monarch', 'Magma Drake',
];

const photoOk = (key: string) => existsSync(new URL(`../assets/photos/${key}.webp`, import.meta.url));

/** every piece of the story, labelled by where it plays */
function everything(): { where: string; panels: StoryPanel[] }[] {
  const all: { where: string; panels: StoryPanel[] }[] = [{ where: 'intro', panels: INTRO_PANELS }, { where: 'ending', panels: ENDING_PANELS }];
  for (const [w, s] of Object.entries(WORLD_STORIES)) all.push({ where: `world ${w} arrival`, panels: s.panels });
  for (const [w, p] of Object.entries(WORLD_MID)) all.push({ where: `world ${w} halfway`, panels: p });
  for (const [w, p] of Object.entries(WORLD_GATE)) all.push({ where: `world ${w} gate`, panels: p });
  for (const m of Object.values(MEMORIES)) all.push({ where: `scene ${m.id}`, panels: m.panels });
  for (let w = 1; w <= 10; w++) {
    all.push({ where: `boss ${w} intro`, panels: bossPanels(w, 'intro', BOSS_STORIES[w].intro[0].speaker) });
    all.push({ where: `boss ${w} defeat`, panels: bossPanels(w, 'defeat', BOSS_STORIES[w].intro[0].speaker) });
  }
  all.push({ where: 'thornbark intro', panels: thornbarkPanels('intro') }, { where: 'thornbark defeat', panels: thornbarkPanels('defeat') });
  return all;
}

test('the story is long: hundreds of pictures, ten worlds, a halfway scene in every one', () => {
  const total = everything().reduce((n, e) => n + e.panels.length, 0);
  assert.ok(total >= 450, `only ${total} panels`);
  assert.ok(INTRO_PANELS.length >= 40, 'a proper opening');
  assert.ok(ENDING_PANELS.length >= 50, 'a proper ending');
  for (let w = 1; w <= 10; w++) {
    assert.ok(WORLD_STORIES[w], `world ${w} has an arrival story`);
    assert.ok(WORLD_STORIES[w].teaser.length > 5, `world ${w} has a teaser`);
    assert.ok(WORLD_STORIES[w].panels.length >= 5, `world ${w} arrival is more than a line or two`);
    assert.ok(WORLD_MID[w] && WORLD_MID[w].length >= 3, `world ${w} has a halfway scene`);
    assert.ok(BOSS_STORIES[w], `world ${w} has a guardian`);
    // (the intro replays on every attempt, so it stays short: five lines, six where Dot gets a word in, and the General's nine, the one
    // argument of the game, 2026-10-29 story report)
    assert.ok(BOSS_STORIES[w].intro.length >= 3 && BOSS_STORIES[w].intro.length <= (w === 10 ? 9 : w === 4 ? 6 : 5), `world ${w}: a guardian speaks before the fight`);
    assert.ok(BOSS_STORIES[w].defeat.length >= 2 && BOSS_STORIES[w].defeat.length <= 7, `world ${w}: and after it`);
  }
});

test('every panel is well formed', () => {
  for (const { where, panels } of everything()) {
    panels.forEach((p, i) => {
      const at = `${where} #${i + 1} ("${p.text.slice(0, 32)}")`;
      assert.ok(p.text.trim().length > 0, `${at}: has text`);
      assert.ok(p.text.length <= 300, `${at}: ${p.text.length} characters is too much to read in one box`);
      assert.ok(p.chapter.length > 0, `${at}: has a chapter`);
      assert.ok(SPEAKERS.includes(p.speaker), `${at}: unknown speaker "${p.speaker}"`);
      if (p.cue) assert.ok(CUES.includes(p.cue), `${at}: unknown cue ${p.cue}`);
      if (p.sting) assert.ok(STINGS.includes(p.sting), `${at}: unknown sting ${p.sting}`);
      if (p.intensity !== undefined) assert.ok(p.intensity >= 0 && p.intensity <= 1, `${at}: intensity 0..1`);
      assert.ok(p.scene.world >= 1 && p.scene.world <= 10, `${at}: world 1..10`);
      for (const a of p.scene.actors) {
        assert.ok(Number.isFinite(a.x) && a.x >= -0.2 && a.x <= 1.2, `${at}: actor x ${a.x} is on the stage`);
        if (a.y !== undefined) assert.ok(a.y >= 0 && a.y <= 1.1, `${at}: actor y ${a.y}`);
        if (a.scale !== undefined) assert.ok(a.scale > 0 && a.scale < 4, `${at}: actor scale ${a.scale}`);
        if (a.kind === 'boss') assert.ok(a.world && a.world >= 1 && a.world <= 10, `${at}: a boss names its world`);
      }
      if (p.scene.castle !== undefined) assert.ok(p.scene.castle >= 5 && p.scene.castle <= 7, `${at}: only castles 5-7 are painted`);
      if (p.scene.zoom !== undefined) assert.ok(p.scene.zoom >= 1 && p.scene.zoom <= 3, `${at}: zoom ${p.scene.zoom}`);
      if (p.scene.photo) assert.ok(photoOk(p.scene.photo.key), `${at}: photo ${p.scene.photo.key} exists`);
      if (p.scene.plate !== undefined) {
        assert.ok(isPlate(p.scene.plate), `${at}: plate ${p.scene.plate} is listed`);
        assert.ok(existsSync(new URL(`../assets/story/plates/${p.scene.plate}.webp`, import.meta.url)), `${at}: plate ${p.scene.plate} has its picture`);
      }
    });
  }
});

test('a scene opens with a title card, and a card is only shown when the chapter changes', () => {
  for (const { where, panels } of everything()) {
    assert.ok(panels[0].chapter.length > 0, `${where} starts in a chapter`);
    const chapters = new Set(panels.map((p) => p.chapter));
    assert.ok(chapters.size <= 14, `${where}: ${chapters.size} chapters is a lot of title cards`);
    // a chapter that comes back later would flash its card twice
    const seen: string[] = [];
    for (const p of panels) {
      if (seen[seen.length - 1] !== p.chapter) {
        assert.ok(!seen.includes(p.chapter), `${where}: chapter "${p.chapter}" returns after another one`);
        seen.push(p.chapter);
      }
    }
  }
});

test('the three acts open with their own title cards, in order', () => {
  const first = (panels: StoryPanel[]) => panels[0].chapter;
  assert.equal(first(INTRO_PANELS), 'PROLOGUE · THE SLOWEST MORNING');
  assert.ok(INTRO_PANELS.some((p) => p.chapter === 'ACT I · THE TRAIL'));
  assert.equal(first(WORLD_STORIES[4].panels), 'ACT II · THE COST');
  assert.equal(first(WORLD_STORIES[8].panels), 'ACT III · THE IRON ROAD');
});

test('photographs in the story are real keepsake photos', () => {
  const photos = everything().flatMap((e) => e.panels).filter((p) => p.scene.photo).map((p) => p.scene.photo!.key);
  assert.ok(photos.length >= 5, 'the story shows its photographs'); // 8 before the rewrite: Grandma's letter is now two beats and the prologue's Grandma is a painted figure. The floor goes back up as Acts II and III get their plates.
  for (const k of photos) assert.ok(photoOk(k), `${k} exists`);
});

test('the scenes that follow a guardian are ordered and complete', () => {
  assert.deepEqual([...MEMORY_ORDER].sort(), (Object.keys(MEMORIES) as MemoryId[]).sort(), 'the Library order lists every scene once');
  assert.equal(new Set(MEMORY_ORDER).size, MEMORY_ORDER.length);
  for (const id of MEMORY_ORDER) {
    const m = MEMORIES[id];
    assert.equal(m.id, id);
    assert.ok(m.panels.length >= 6, `${id} is a real scene`);
    assert.ok(m.title.length > 0 && m.hint.length > 0);
    assert.ok(m.kind === 'memory' || m.kind === 'scene');
  }
  // every scene (but the dream, which plays inside World 8's card) follows exactly one guardian
  const after = Object.values(AFTER_BOSS).flat();
  assert.equal(new Set(after).size, after.length, 'no scene plays after two guardians');
  for (const id of MEMORY_ORDER) assert.equal(after.includes(id), id !== 'promise', `${id} is wired to a guardian`);
  for (const [w, ids] of Object.entries(AFTER_BOSS)) assert.ok(Number(w) >= 2 && Number(w) <= 9 && ids!.length >= 1);

  // the chain: a guardian leads to its first unseen scene, and each scene to the next, then the victory screen
  assert.equal(nextAfterBoss(6, []), 'sealed');
  assert.equal(nextAfterBoss(6, [], 'sealed'), 'storm');
  assert.equal(nextAfterBoss(6, ['sealed'], 'sealed'), 'storm');
  assert.equal(nextAfterBoss(6, ['sealed', 'storm'], 'storm'), 'tally', 'the Tower scene comes last in its world');
  assert.equal(nextAfterBoss(6, ['sealed', 'storm', 'tally'], 'tally'), undefined);
  assert.equal(nextAfterBoss(6, ['sealed', 'storm', 'tally']), undefined, 'seen scenes are not shown again');
  assert.equal(nextAfterBoss(3, []), 'horn');
  assert.equal(nextAfterBoss(3, [], 'horn'), 'map');
  assert.equal(nextAfterBoss(1, []), undefined, 'World 1 has no scene after the guardian');
  assert.equal(nextAfterBoss(10, []), undefined, 'the General has the ending instead');
  assert.equal(nextAfterBoss(9, []), 'blessing');
  assert.equal(nextAfterBoss(9, [], 'blessing'), 'gates');
  assert.equal(nextAfterBoss(9, [], 'gates'), 'door');
});

test('the three Tower scenes keep Pokey out of the room', () => {
  for (const id of ['map', 'tally', 'door'] as MemoryId[]) {
    const m = MEMORIES[id];
    assert.ok(m.panels.length >= 6, `${id} is a real scene`);
    for (const p of m.panels) {
      assert.notEqual(p.speaker, 'Pokey', `${id}: Pokey is not in the Tower`);
      assert.ok(!p.scene.actors.some((a) => a.kind === 'milo' || a.kind === 'dot'), `${id}: no Pokey or Dot on stage`);
    }
    const plates = new Set(m.panels.map((p) => p.scene.plate));
    // the door scene opens on a cutaway to the cookhouse, where the soup is made, and then stays in the one room
    assert.equal(plates.size, id === 'door' ? 2 : 1, `${id} is one painted room${id === 'door' ? ' after its opening cutaway' : ''}`);
    if (id === 'door') assert.equal(m.panels[0].scene.plate, 'cookhouse', 'the door scene opens in the cookhouse');
  }
});

test('the saved list of seen scenes survives bad data', () => {
  assert.deepEqual(parseMemories(null), []);
  assert.deepEqual(parseMemories('not json'), []);
  assert.deepEqual(parseMemories(JSON.stringify({ v: 1, seen: ['tea', 'nope', 'horn'] })), ['horn', 'tea'], 'unknown ids go, order follows the Library');
});

test('the ending shows three keepsakes, plants the seeds, and keeps every other keepsake for the satchel', () => {
  const keepsakes = FINDS.filter((f) => f.kind === 'keepsake').map((f) => f.id);
  assert.equal(keepsakes.length, 10);
  const base = finalePanels([]).length;
  // the ribbon, the key and the bell play at the tea table, and the seeds go to the hill: those four, and only those, change the ending
  const grew = keepsakes.filter((id) => finalePanels([id]).length > base).sort();
  assert.deepEqual(grew, [...FINALE_KEEPSAKES, 'w8_keepsake'].sort());
  // nothing found is lost: every keepsake has its lines (the seeds aside, which are planted), the finale's three and the satchel's six
  assert.deepEqual([...FINALE_KEEPSAKES, ...SATCHEL_KEEPSAKES, 'w8_keepsake'].sort(), [...keepsakes].sort());
  for (const id of [...FINALE_KEEPSAKES, ...SATCHEL_KEEPSAKES]) assert.ok(KEEPSAKE_LINES[id] && KEEPSAKE_LINES[id]!.length >= 2, `${id} has its lines`);
  // in this order, the bell always last
  const all = finalePanels(keepsakes);
  const at = (s: string) => all.findIndex((p) => p.text.includes(s));
  assert.ok(at('half a ribbon') >= 0 && at('half a ribbon') < at('a key in a fern') && at('a key in a fern') < at('Somebody is coming home'));
  assert.ok(!all.some((p) => p.text.includes('Is that my rattle') || p.text.includes('I let you.')), 'the satchel keepsakes stay out of the finale');
  // the stopwatch plays after the end, only when it was found
  assert.deepEqual(endTagPanels([]), []);
  assert.ok(endTagPanels(['w9_keepsake']).some((p) => p.text === 'I let you.'));
  const full = finalePanels(FINDS.map((f) => f.id));
  assert.ok(full.length > base + 12, 'finding everything lengthens the ending');
  assert.ok(full.some((p) => p.text.includes('Every last thing of hers')), 'and earns Grandma\'s last word');
  assert.ok(!finalePanels([]).some((p) => p.text.includes('Every last thing of hers')));
  // the bell is rung, not just handed over; the seed packet says where it came from
  assert.ok(finalePanels(['w10_keepsake']).some((p) => p.text.includes('he rang it')), 'the bell rings');
  assert.ok(finalePanels(['w8_keepsake']).some((p) => p.text.includes('found in a fern')));
});

test('the story keeps its promises: the lullaby, the letter, the bell, the seam', () => {
  const text = (ps: StoryPanel[]) => ps.map((p) => p.text).join('\n');
  const every = text(everything().flatMap((e) => e.panels));
  assert.ok(every.includes('Slow the rain, slow the thunder'), 'the lullaby is sung');
  assert.ok(every.includes('Slow is not stopped'), 'the family saying is spoken');
  assert.ok(every.includes('tailor'), 'the Lieutenant sews badly');
  assert.ok(text(WORLD_STORIES[10].panels).includes('sew it badly'), 'the seam is sewn badly');
  assert.ok(text(WORLD_GATE[10]).includes('The cookhouse seam'), 'and Dot goes for it at the gate');
  assert.ok(text(ENDING_PANELS).includes('I fell into the cookhouse'), 'and lands in the cookhouse');
  // the jokes that were planted early get their payoff in the epilogue
  assert.ok(text(ENDING_PANELS).includes('slow mailman finally delivered'), 'the one parcel arrives');
  assert.ok(text(ENDING_PANELS).includes('poured the tea'), 'tea is at four');
  // the nine years: Dot's letter and the General's own count agree
  assert.ok(text(ENDING_PANELS).includes('nine years'));
  assert.ok(!text(WORLD_STORIES[10].panels).includes('six years'));
  // the first meeting happens once: Dot is not introduced a second time on the road
  assert.ok(!text(WORLD_STORIES[1].panels).includes('Courier. Fastest wings'));
});

test('the 2026-10-29 story report: slowness costs once, the motive in three layers, the reunion, the answer, Flicker', () => {
  const text = (ps: StoryPanel[]) => ps.map((p) => p.text).join('\n');
  const lines = (w: number, k: 'intro' | 'defeat') => BOSS_STORIES[w][k].map((l) => l.text).join('\n');
  // the one time slow costs something: the gap was sewn shut the night they stopped for tea, and the General counted
  assert.ok(text(WORLD_MID[6]).includes('We stopped for tea.'));
  assert.ok(lines(10, 'intro').includes('You stopped for tea, boy.') && lines(10, 'intro').includes('It was very good tea, sir.'));
  // the argument he can't win, and the shell slamming shut on it
  assert.ok(lines(10, 'intro').includes('It was a storm.'));
  assert.equal(BOSS_STORIES[10].intro.at(-1)!.text, 'The General does not lose twice.');
  // the motive: the public reason (tea), the excuse (the tower), the truth (the finale)
  assert.ok(text(MEMORIES.tea.panels).includes('his whole Pact started to yawn'));
  assert.ok(text(MEMORIES.tally.panels).includes('For your safety, Miss.'));
  assert.ok(text(ENDING_PANELS).includes('So I put you somewhere nobody would ever be late for you.'));
  // the reunion comes straight after "Mostly.", and Pokey answers Dot to her face
  const end = ENDING_PANELS.map((p) => p.text);
  assert.equal(end[end.indexOf('Mostly.') + 1].startsWith('Meeca turned around.'), true);
  assert.ok(end.includes('You can sit down now.'));
  assert.ok(end.includes('And you came back every time. I was counting.'));
  assert.ok(!end.includes('Okay.'), 'the old answer is gone');
  // who raised him
  assert.ok(text(MEMORIES.garden.panels).includes('You\'re staying for supper, Pokey.'));
  // Flicker: arrives as Dot leaves, meets her in World 8, makes peace the night before the mountain, and is handed the job at the gate
  const fl = (ps: StoryPanel[]) => ps.some((p) => p.speaker === 'Flicker');
  assert.ok(fl(WORLD_MID[6]) && fl(WORLD_STORIES[8].panels) && fl(MEMORIES.gates.panels) && fl(WORLD_MID[10]) && fl(WORLD_GATE[10]) && fl(ENDING_PANELS));
  // his tell: the light stutters on "just passing", and holds steady on "I will"
  const said = (s: string) => [...WORLD_MID[6], ...WORLD_GATE[10]].find((p) => p.text === s)!;
  assert.ok(said('Flicker. Just passing.').scene.actors.some((a) => a.kind === 'flicker' && a.stutter));
  assert.ok(said('I will.').scene.actors.some((a) => a.kind === 'flicker' && !a.stutter));
});

test('boss lines are short enough to read, and Pokey never speaks for a guardian', () => {
  for (let w = 1; w <= 10; w++) {
    for (const kind of ['intro', 'defeat'] as const) {
      const lines = BOSS_STORIES[w][kind];
      assert.ok(lines.some((l) => l.speaker !== 'Pokey' && l.speaker !== 'Dot'), `world ${w} ${kind}: the guardian speaks`);
      for (const l of lines) assert.ok(l.text.length <= 300, `world ${w} ${kind}: "${l.text.slice(0, 30)}" is too long`);
    }
    assert.ok(BOSS_STORIES[w].tip.length > 20, `world ${w}: a tip for the fight`);
  }
});

test('no line of the story is said twice word for word', () => {
  const seen = new Map<string, string>();
  const dup: string[] = [];
  for (const { where, panels } of everything()) {
    for (const p of panels) {
      if (p.text.length < 40) continue; // "Dot?" and "Hello." may repeat
      const first = seen.get(p.text);
      if (first && first !== where) dup.push(`"${p.text.slice(0, 40)}" in ${first} and ${where}`);
      seen.set(p.text, where);
    }
  }
  // the ending replays the lullaby, and the dream in World 8's card can be watched again in the Library: repeats on purpose
  const allowed = dup.filter((d) => !d.includes('Slow the rain') && !d.includes('scene promise'));
  assert.deepEqual(allowed, []);
});

test('the story files carry no stray placeholder text', () => {
  for (const f of ['storyIntro', 'storyWorlds', 'storyMemories', 'storyBosses', 'storyFinale']) {
    const src = readFileSync(new URL(`./${f}.ts`, import.meta.url), 'utf8');
    assert.ok(!/TODO|FIXME|lorem|XXX/i.test(src), `${f} has leftovers`);
  }
});

test('the plates listed are the plates painted, and each has a floor to stand on', () => {
  const files = readdirSync(new URL('../assets/story/plates/', import.meta.url)).filter((f) => f.endsWith('.webp')).map((f) => f.replace(/\.webp$/, ''));
  assert.deepEqual(files.sort(), Object.keys(PLATES).sort(), 'every picture is listed and every listed plate has its picture');
  for (const [k, v] of Object.entries(PLATES)) assert.ok(v.ground > 0.4 && v.ground < 0.95, `${k}: the floor is on the picture`);
});

test('every stage has a real name and line of its own (no generic mission names to fall back on, polish report ST-8)', async () => {
  const { generateAllLevels } = await import('./worldsData.ts');
  for (const l of generateAllLevels()) {
    assert.ok(l.name && !/Sprint|Gauntlet|Idol Hunt|Thicket|Boss Lair|Purge/.test(l.name), `${l.id}: "${l.name}"`);
    assert.ok(l.description && !/Exit Shrine|sanctuary|reach the exit/i.test(l.description), `${l.id}: "${l.description}"`);
  }
});

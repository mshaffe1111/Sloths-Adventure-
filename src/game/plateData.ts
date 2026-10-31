/**
 * The plates: whole backdrops painted for one story scene (src/assets/story/plates/<key>.webp), drawn instead of a world's scenery when a
 * scene names one (`plate` in StoryScene, or `p: { plate: 'cell' }` in a beat). Pure data, so the script and its tests can read it without
 * the browser; storyArt.ts and plates.ts do the loading and drawing.
 *
 * `ground` is where the actors' feet go on this plate, as a share of the picture's height: the floor, the log, the lip of the nest.
 * The painting carries its own floor, so no branch is drawn under the actors on a plate.
 */
export interface PlateInfo {
  /** where the actors stand (share of the height) */
  ground: number;
  /** what the picture is, for the scene notes */
  what: string;
  /** where its light falls from, a direction out of the picture toward it (the figures' rim light, storyArt.ts drawFigures) */
  light?: [number, number];
}

export const PLATES: Record<string, PlateInfo> = {
  hill: { ground: 0.86, what: 'the hill and the oldest tree at golden dusk, the fortress far off on the right' },
  cell: { ground: 0.86, what: "Meeca's tower cell at night: the wall scratched with days, her lamp on the window sill" },
  warroom: { ground: 0.88, what: "the General's war room: the round table, the pin map with three forks in it, the empty chair" },
  door: { ground: 0.86, what: "the corridor outside Meeca's door: lanterns, a stool, a line of lamplight under the wood" },
  courtyard: { ground: 0.86, what: 'the courtyard after the storm turns: her window lit in the tower, thorn vines going slack' },
  'nest-storm': { ground: 0.74, what: "the old nest on the branch in the storm, the sky turning, Pokey's mother and father out on the far branch (the singing-storm memory)" },
  'nest-night': { ground: 0.74, what: 'the same nest in the same storm, nobody on the branch (the singing-storm memory, the cub and Meeca in the nest)' },
  steps: { ground: 0.86, what: "the courtyard after the storm turns, the wet stone steps down from the tower's door (Pokey and Meeca sit on them)" },
  'nest-morning': { ground: 0.86, what: "Matt's sequel card: the misty morning branch, empty, a black thorn grown out of it with the scarf hanging from it (the sequel tag)" },
  'storm-returns': { ground: 0.86, what: "Matt's sequel card: the storm comes back at night, Pokey asleep on his branch with the scarf trailing down (painted in: no actors over it)" },
  raft: { ground: 0.84, what: "World 2's riverbank village building Pokey's raft at village speed: two logs lashed, the rest still a pile (hf-art-bosses, HF row 9)" },
  gorge: { ground: 0.78, what: "World 4's misty gorge: Pokey hanging from the vine's end over the mist, Dot pulling at his claw (no floor: he hangs; hf-art-bosses, HF row 9)" },
  council: { ground: 0.84, what: 'the clearing with the council fire and the seats of the ten' },
  gates: { ground: 0.85, what: 'the fortress from the foot of the thousand steps: the gates standing open, ten green lights along the wall tops, rain and a lightning fork' },
  'grandma-door': { ground: 0.85, what: "Grandma's round door in the hollow of the great tree at dusk: lit window, lantern, a fern in a pot, the long path" },
  'grandma-door-empty': { ground: 0.85, what: "the same door after the storm: standing open, the window dark, an empty chair inside, dry leaves on the step" },
  tea: { ground: 0.85, what: "the Queen's tea table: a long silk table, tiered cakes and cups, webs hung like chandeliers, violet light" },
  cookhouse: { ground: 0.84, what: 'the fortress cookhouse: the black stove steaming, copper pots on the rafters, a pie and a ham on the long table' },
  ruins: { ground: 0.85, what: 'the council ruins: ten mossy stone seats in a ring round a cracked floor with a faint sigil, an eleventh plain chair apart with leaves on it' },
  village: { ground: 0.86, what: "the village the morning after the storm, with Lieutenant Pell's tailor shop and a tea table" },
  'drake-cave': { ground: 0.85, what: "the Magma Drake's cave from inside: lava light through a crack, everything he owns heaped behind a big boulder at the left with his gold, a huge lumpy red knitted tea cosy slumped against it" },
  'w1-day': { ground: 0.8, what: "World 1's story place, day: the emerald canopy (hf-cutscenes, from the world's own story scenery)" },
  'w1-storm': { ground: 0.8, what: "World 1's story place, storm: the emerald canopy (hf-cutscenes, from the world's own story scenery)" },
  'w3-night': { ground: 0.8, what: "World 3's story place, night: the mossy grotto (hf-cutscenes, from the world's own story scenery)" },
  'w5-day': { ground: 0.8, what: "World 5's story place, day: the orchid sanctuary (hf-cutscenes, from the world's own story scenery)" },
  'w1-dusk': { ground: 0.8, what: "World 1's story place, dusk: the emerald canopy (hf-cutscenes, from the world's own story scenery)" },
  'w3-storm': { ground: 0.8, what: "World 3's story place, storm: the mossy grotto (hf-cutscenes, from the world's own story scenery)" },
  'w4-day': { ground: 0.8, what: "World 4's story place, day: the misty cascades (hf-cutscenes, from the world's own story scenery)" },
  'w6-dusk': { ground: 0.8, what: "World 6's story place, dusk: the deep mangrove (hf-cutscenes, from the world's own story scenery)" },
  'w7-day': { ground: 0.8, what: "World 7's story place, day: the ancient ruins (hf-cutscenes, from the world's own story scenery)" },
};

export function isPlate(key: string | undefined): key is string {
  return key !== undefined && Object.prototype.hasOwnProperty.call(PLATES, key);
}

/**
 * The world plates (hf-cutscenes, 2026-10-31): a painted plate for each world and mood the story most often stands in, repainted on Hugging
 * Face from that world's own story scenery (so it is the place the player just played, painted like the other plates). A panel with no plate
 * of its own, no camera following a walker, no castle and no line-up stands in its world's plate (`withWorldPlate`), its cast on the same
 * ground line as before (0.8). Key: `${world}-${mood}`.
 */
export const WORLD_PLATES: Record<string, string> = {
  '1-day': 'w1-day',
  '1-storm': 'w1-storm',
  '3-night': 'w3-night',
  '5-day': 'w5-day',
  '1-dusk': 'w1-dusk',
  '3-storm': 'w3-storm',
  '4-day': 'w4-day',
  '6-dusk': 'w6-dusk',
  '7-day': 'w7-day',
};

/** the scene as drawn: its own plate, or its world's plate for this mood when there is one (the cast keep their ground line) */
export function withWorldPlate<S extends { world: number; mood: string; plate?: string; follow?: unknown; castle?: number; lineup?: boolean; ground?: number }>(scene: S): S {
  if (scene.plate !== undefined || scene.follow || scene.castle !== undefined || scene.lineup) return scene;
  const key = WORLD_PLATES[`${scene.world}-${scene.mood}`];
  if (!key || !isPlate(key)) return scene;
  return { ...scene, plate: key, ground: scene.ground ?? 0.8 };
}

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
  council: { ground: 0.84, what: 'the clearing with the council fire and the seats of the ten' },
  gates: { ground: 0.85, what: 'the fortress from the foot of the thousand steps: the gates standing open, ten green lights along the wall tops, rain and a lightning fork' },
  'grandma-door': { ground: 0.85, what: "Grandma's round door in the hollow of the great tree at dusk: lit window, lantern, a fern in a pot, the long path" },
  'grandma-door-empty': { ground: 0.85, what: "the same door after the storm: standing open, the window dark, an empty chair inside, dry leaves on the step" },
  tea: { ground: 0.85, what: "the Queen's tea table: a long silk table, tiered cakes and cups, webs hung like chandeliers, violet light" },
  cookhouse: { ground: 0.84, what: 'the fortress cookhouse: the black stove steaming, copper pots on the rafters, a pie and a ham on the long table' },
  ruins: { ground: 0.85, what: 'the council ruins: ten mossy stone seats in a ring round a cracked floor with a faint sigil, an eleventh plain chair apart with leaves on it' },
  village: { ground: 0.86, what: "the village the morning after the storm, with Lieutenant Pell's tailor shop and a tea table" },
};

export function isPlate(key: string | undefined): key is string {
  return key !== undefined && Object.prototype.hasOwnProperty.call(PLATES, key);
}

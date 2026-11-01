/**
 * What's New (Settings > About > What's New): every release, newest first.
 *
 * Adding a release: put one entry at the TOP of the list, with `version` set to package.json's new version.
 * whatsNew.test.ts fails if the top entry's version is not package.json's, so no release can forget it.
 *
 * Words are for players (a kid can read them): short lines, no workshop words.
 * Releases from before the game had a version number (Oct 28-31) are one entry per day, with no version.
 */
export interface Release {
  /** "0.9.3"; none for the day releases before version numbers began */
  version?: string;
  /** ISO day, Eastern time: "2026-11-01" */
  date: string;
  /** when in the day, for days with more than one release */
  part?: 'morning' | 'evening' | 'night';
  title: string;
  items: string[];
}

export const WHATS_NEW: Release[] = [
  {
    version: '0.9.3',
    date: '2026-11-01',
    part: 'evening',
    title: 'Fresh paint',
    items: [
      'New painted backgrounds in many stages.',
      'The ropes are back in 8-2, and they are fairer.',
      'Smoother first moments on older phones.',
      'Meeca no longer sinks into the bank in her last room.',
      'This What’s New page!',
    ],
  },
  {
    version: '0.9.2',
    date: '2026-11-01',
    title: 'Meeca’s stage fixed, new menus and the Satchel',
    items: [
      'Meeca no longer goes invisible, and other creatures stop vanishing too.',
      'Meeca glows softly in the moonlight, so she is easy to follow at night.',
      'No more unfair falls in Meeca’s stage, and her hints come sooner.',
      'Every screen has a Back button in the same top-left spot.',
      'Every pop-up closes with the X, a tap outside it, or Back.',
      'The World Map is redone. Tap the leaf arrows to change worlds.',
      'New: the Satchel! Your finds, trophies, Pokey’s journal and every story scene.',
      'A medal pops up the moment you earn it.',
    ],
  },
  {
    version: '0.9.1',
    date: '2026-10-31',
    part: 'night',
    title: 'Faster stages and new skies',
    items: [
      'Stages get ready much faster.',
      'World 2 cages: flick a stone up near a high basket and it drops right in.',
      'New painted pictures in the story scenes, and some scenes now move.',
      'Worlds 7 and 8 get dawn, dusk, sunset and night skies.',
      'Lots of new painted plants and props in Worlds 1 to 7.',
      'A hidden hole in 8-6 is fixed.',
    ],
  },
  {
    version: '0.9.0',
    date: '2026-10-31',
    part: 'evening',
    title: 'World 8 rebuilt',
    items: [
      'World 8 is all new, with a puzzle room and a dozing boa in 8-1.',
      'In World 8, a missed swing or glide costs a heart, not a life.',
      'The start screen shows the game’s version number.',
      'New Check for updates and Refresh game buttons.',
      'A Special thanks row in About.',
    ],
  },
  {
    date: '2026-10-31',
    part: 'morning',
    title: 'Pokey moves better than ever',
    items: [
      'A new game asks “Who’s exploring?” Pick Little explorer or Big explorer.',
      'Pokey has lots of new moves: turning, skidding, landing, ducking and climbing.',
      'Hold down at the top of a tree and Pokey climbs all the way down.',
      'Meeca’s petals now light the way in every world.',
      'Meeca’s stage: no more snapping back, and a finger shows how to carve.',
      'World 5 stages play differently each time.',
      'World 8 starts on safe ground.',
    ],
  },
  {
    date: '2026-10-30',
    title: 'Smoother, with a new look and new sounds',
    items: [
      'Much smoother on phones, with no stalls near the snake and the eagle.',
      'A new app icon with Pokey’s face.',
      'A new Settings card with painted tabs and sliders.',
      '“How to Play” replaces “Pokey’s Journal”.',
      'Jump help works in every mode.',
      'New sound effects, and footsteps that match Pokey’s feet.',
      'More story moments between stages, and better cutscenes.',
    ],
  },
  {
    date: '2026-10-29',
    title: 'World 6, two special stages and boss art',
    items: [
      'World 6 is rebuilt, with swings, creeks and puzzle rooms.',
      'Two new special stages: 6-8 Stilt Climb and 7-4 The Slide.',
      'Painted boss lairs, and a gold ring shows where to hit.',
      'New painted exit gates, checkpoints, hearts and water.',
      'Better touch controls, with a sensitivity slider.',
      'Music on the start screen, the menus and the map.',
      'Easy is gentler.',
    ],
  },
  {
    date: '2026-10-28',
    title: 'Worlds 1 to 4 rebuilt',
    items: [
      'Worlds 1 to 4 are rebuilt, with new puzzles to solve.',
      'Stages play a little differently each time you replay them.',
      'Meeca’s stage, “On the March North”, is all new, with Flicker the firefly.',
      'Jumps are more forgiving, and Easy never needs a full-length jump.',
      'Vines swing on their own, slower and calmer.',
      'Seven new Jungle Cards.',
      'Sound works properly on iPhones.',
      'Pictures load at the start, so nothing pops in mid-stage.',
    ],
  },
];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "Nov 1, 2026" from "2026-11-01" */
export function formatReleaseDay(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}

/** the small line under a release's title: "Version 0.9.3 · Nov 1, 2026, evening" */
export function releaseLine(r: Release): string {
  const day = formatReleaseDay(r.date) + (r.part ? `, ${r.part}` : '');
  return r.version ? `Version ${r.version}  ·  ${day}` : day;
}

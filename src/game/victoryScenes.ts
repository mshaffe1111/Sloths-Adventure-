/**
 * Directed victory scenes: what plays after a boss goes down. Instead of one standing picture for every boss, each victory is a short
 * sequence of beats (the last blow lands, the boss slumps and speaks, Pokey answers, the way ahead opens), each with its own camera,
 * painted poses and effects. A world without a scene here keeps the plain card (story.ts bossPanels).
 */
import type { SceneMood, StoryPanel, StoryScene, SceneActor } from './story.ts';
import { BOSS_STORIES } from './story.ts';

const RUN = ['run_a', 'run_b', 'run_c', 'run_d', 'run_e', 'run_f', 'run_g', 'run_h', 'run_i', 'run_j'];

interface Beat {
  speaker: string;
  text: string;
  scene: Omit<StoryScene, 'world' | 'mood'>;
}

function build(world: number, bossName: string, mood: SceneMood, beats: Beat[]): StoryPanel[] {
  return beats.map((b) => ({
    chapter: `VICTORY · ${bossName.toUpperCase()}`,
    speaker: b.speaker,
    text: b.text,
    scene: { world, mood, ...b.scene },
  }));
}

// the ground line sits a little high so feet and coils stay clear of the text box
const GROUND = 0.75;
const hero = (extra: Partial<SceneActor>): SceneActor => ({ kind: 'milo', x: 0.2, y: GROUND, scale: 1.0, ...extra });
const boss = (world: number, extra: Partial<SceneActor>): SceneActor => ({ kind: 'boss', world, x: 0.62, y: GROUND, scale: 1.0, facing: -1, ...extra });

/** World 1: Venom Fang goes down in his own coils, then slithers aside and Pokey walks on */
function venomFang(bossName: string): StoryPanel[] {
  const w = 1;
  const lines = BOSS_STORIES[1].defeat;
  return build(w, bossName, 'day', [
    {
      speaker: 'Narrator',
      text: 'One last swing, and Venom Fang goes down in a tangle of his own coils.',
      scene: {
        particles: 'sparkles',
        camera: { from: { zoom: 1.08, fx: 0.5, fy: 0.62 }, to: { zoom: 1.4, fx: 0.5, fy: 0.64 }, dur: 2.4 },
        fx: [
          { at: 0.62, kind: 'burst', x: 0.5, y: 0.5, amount: 1.1 },
          { at: 0.62, kind: 'flash', dur: 0.2 },
          { at: 0.62, kind: 'shake', amount: 9, dur: 0.4 },
          { at: 2.05, kind: 'dust', x: 0.67, y: 0.75 },
          { at: 2.05, kind: 'shake', amount: 11, dur: 0.35 },
          { at: 2.35, kind: 'stars', x: 0.59, y: 0.64 },
        ],
        actors: [
          hero({
            seq: [
              { at: 0, frame: 'guard' },
              { at: 0.42, frame: 'punch_2', dx: 0.02, dur: 0.14, ease: 'out' },
              { at: 0.56, frame: 'punch_4', dx: 0.05, dur: 0.08, ease: 'out' },
              { at: 0.7, frame: 'punch_5', dx: 0.07, dur: 0.1 },
              { at: 1.7, frame: 'land', dx: 0.06, dur: 0.4 },
              { at: 3.2, frame: 'idle_blink', dx: 0.06 },
              { at: 3.35, frame: 'idle_a' },
            ],
          }),
          boss(w, {
            seq: [
              { at: 0, frame: 'threat' },
              { at: 0.62, frame: 'hurt', dx: 0.03, dur: 0.16, ease: 'out' },
              { at: 1.1, frame: 'deathroar', dx: 0.05, dur: 0.3 },
              { at: 1.6, frame: 'deathroar', dx: 0.07, dy: -0.04, rot: -0.1, dur: 0.35, ease: 'out' },
              { at: 2.0, frame: 'dead', dx: 0.06, dy: 0, rot: 0, dur: 0.16, ease: 'in' },
            ],
          }),
        ],
      },
    },
    {
      speaker: lines[0].speaker,
      text: lines[0].text,
      scene: {
        particles: 'sparkles',
        camera: { from: { zoom: 1.15, fx: 0.45, fy: 0.62 }, to: { zoom: 1.38, fx: 0.52, fy: 0.64 }, dur: 6 },
        fx: [{ at: 0, kind: 'stars', x: 0.59, y: 0.64 }],
        actors: [
          hero({ seq: [{ at: 0, frame: 'idle_a', dx: 0.06 }, { at: 2.6, frame: 'idle_blink', dx: 0.06 }, { at: 2.75, frame: 'idle_a' }] }),
          boss(w, { seq: [{ at: 0, frame: 'dead', dx: 0.06 }] }),
        ],
      },
    },
    {
      speaker: lines[1].speaker,
      text: lines[1].text,
      scene: {
        particles: 'petals',
        camera: { from: { zoom: 1.0, fx: 0.5, fy: 0.55 }, to: { zoom: 1.1, fx: 0.42, fy: 0.55 }, dur: 5 },
        actors: [
          boss(w, { x: 0.78, scale: 0.7, seq: [{ at: 0, frame: 'dead', dx: 0.02 }] }),
          hero({ x: 0.3, y: 1.04, scale: 1.25, portrait: true, seq: [{ at: 0, frame: 'face_calm' }, { at: 1.5, frame: 'face_wink' }, { at: 3.4, frame: 'face_calm' }] }),
        ],
      },
    },
    {
      speaker: lines[2].speaker,
      text: lines[2].text,
      scene: {
        particles: 'petals',
        camera: { from: { zoom: 1.3, fx: 0.6, fy: 0.62 }, to: { zoom: 1.65, fx: 0.64, fy: 0.58 }, dur: 6 },
        actors: [
          hero({ seq: [{ at: 0, frame: 'idle_a', dx: 0.06 }] }),
          boss(w, { seq: [{ at: 0, frame: 'dead', dx: 0.06 }] }),
        ],
      },
    },
    {
      speaker: 'Narrator',
      text: 'The great serpent unwinds, grumbles, and slithers away. Past the bend, a trail of flattened ferns leads north, toward the Sunlit Riverbank.',
      scene: {
        particles: 'petals',
        camera: { from: { zoom: 1.15, fx: 0.4, fy: 0.64 }, to: { zoom: 1.15, fx: 0.72, fy: 0.64 }, dur: 8 },
        fx: [{ at: 4.5, kind: 'glints', x: 0.8, y: 0.66 }],
        actors: [
          boss(w, {
            seq: [
              { at: 0, frame: 'dead', dx: 0.06 },
              { at: 0.9, frame: ['sl_0', 'sl_1', 'sl_2'], fps: 5, flip: true, dx: 0.7, dur: 4.2, ease: 'out' },
            ],
          }),
          hero({
            seq: [
              { at: 0, frame: 'idle_a', dx: 0.06 },
              { at: 2.4, frame: RUN, fps: 11, dx: 0.55, dur: 6.5, ease: 'linear' },
            ],
          }),
        ],
      },
    },
  ]);
}

const SCENES: Record<number, (bossName: string) => StoryPanel[]> = {
  1: venomFang,
};

/** the directed victory scene for a world's boss, or null when that boss still uses the plain card */
export function victoryPanels(world: number, bossName: string): StoryPanel[] | null {
  const make = SCENES[world];
  return make ? make(bossName) : null;
}

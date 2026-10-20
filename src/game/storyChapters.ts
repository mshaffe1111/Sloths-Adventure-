/**
 * The story chapters that sit between the stages, besides the opening, the world cards and the boss scenes in story.ts:
 *  - five MEMORIES (warm, faded flashbacks) that explain why Pokey keeps going,
 *  - the photograph in the ruins of World 7, where Pokey learns who General Iron-Claw is,
 *  - the FINALE: the song, the ten guardians coming back, the armor cracking, the blessing, the way home.
 * Where the story needs somebody the game has no painted pose for (Grandma, the young General), it shows an old photograph from the
 * albums instead, so the finds and the cutscenes tell one story.
 */
import type { SceneActor, SceneMood, StoryPanel, StoryScene } from './story.ts';
import { allFound } from './finds.ts';

type Beat = { speaker: string; text: string; scene: Partial<StoryScene> };

function chapter(name: string, world: number, mood: SceneMood, beats: Beat[], base: Partial<StoryScene> = {}): StoryPanel[] {
  return beats.map((b) => ({
    chapter: name,
    speaker: b.speaker,
    text: b.text,
    scene: { world, mood, actors: [], particles: 'sparkles', zoom: 1.3, focusX: 0.5, ...base, ...b.scene } as StoryScene,
  }));
}

const hero = (x: number, extra: Partial<SceneActor> = {}): SceneActor => ({ kind: 'milo', x, scale: 1.0, ...extra });
const jen = (x: number, extra: Partial<SceneActor> = {}): SceneActor => ({ kind: 'daisy', x, scale: 1.0, facing: -1, ...extra });
const general = (x: number, extra: Partial<SceneActor> = {}): SceneActor => ({ kind: 'boss', world: 10, x, scale: 1.0, facing: -1, ...extra });

// ───────────── the memories ─────────────

export type MemoryId = 'waiting' | 'garden' | 'storm' | 'promise' | 'blessing' | 'photograph';

export interface MemoryDef {
  id: MemoryId;
  title: string;
  /** shown on the locked card in the Library */
  hint: string;
  panels: StoryPanel[];
}

// a little Pokey and a little Meeca: the same painted pair, drawn smaller
const KID = 0.78;

const WAITING = chapter('MEMORY · THE WAITING', 1, 'day', [
  {
    speaker: 'Narrator',
    text: 'Pokey remembered the day they met. He had been crossing one single vine for two days.',
    scene: { zoom: 1.3, actors: [hero(0.5, { scale: KID, pose: 'idle' })] },
  },
  {
    speaker: 'Meeca',
    text: 'You have been on this vine since Tuesday. Is it a good vine?',
    scene: { zoom: 1.45, focusX: 0.52, actors: [hero(0.36, { scale: KID }), jen(0.66, { scale: KID, mood: 'happy' })] },
  },
  {
    speaker: 'Pokey',
    text: 'It is a very good vine. I am nearly halfway.',
    scene: { zoom: 1.5, focusX: 0.4, actors: [hero(0.36, { scale: KID, pose: 'happy' }), jen(0.66, { scale: KID, mood: 'happy' })] },
  },
  {
    speaker: 'Meeca',
    text: 'Then I will wait. I brought breakfast. The view is better when you go slowly.',
    scene: { zoom: 1.5, focusX: 0.6, particles: 'petals', actors: [hero(0.36, { scale: KID }), jen(0.66, { scale: KID, mood: 'cheer' })] },
  },
  {
    speaker: 'Narrator',
    text: 'It was the first time anyone had ever waited for him. It is why he has never stopped waiting for anyone else.',
    scene: { zoom: 1.2, particles: 'petals', actors: [hero(0.42, { scale: KID }), jen(0.58, { scale: KID, mood: 'happy' })] },
  },
], { memory: true });

const GARDEN = chapter('MEMORY · GRANDMA\'S GARDEN', 5, 'glow', [
  {
    speaker: 'Narrator',
    text: 'The Heartbloom garden, years ago. Grandma was teaching Meeca how to keep it.',
    scene: { zoom: 1.25, actors: [jen(0.62, { scale: KID }), { kind: 'bloom', x: 0.42, y: 0.8, scale: 1.2, stage: 'bud' }] },
  },
  {
    speaker: 'Grandma',
    text: 'It is not magic, my dear. It only grows where somebody takes care of it.',
    scene: { photo: { key: 's3_02', caption: 'Grandma', size: 0.5, tilt: -0.02 } },
  },
  {
    speaker: 'Narrator',
    text: 'Young, clumsy Pokey watered the wrong plant. Somebody else was always close by, quietly setting things right.',
    scene: { photo: { key: 's4_07', caption: 'Somebody was always nearby', size: 0.5, tilt: 0.02 } },
  },
  {
    speaker: 'Grandma',
    text: 'Thank you for watering it anyway, Pokey. And remember, dear: slow is not stopped.',
    scene: { photo: { key: 's3_02', caption: 'Grandma', size: 0.5, tilt: -0.02 } },
  },
  {
    speaker: 'Pokey',
    text: 'Slow is not stopped. I have said it a hundred times since.',
    scene: { zoom: 1.5, focusX: 0.4, actors: [hero(0.34, { scale: KID, pose: 'happy' }), jen(0.62, { scale: KID, mood: 'happy' }), { kind: 'bloom', x: 0.48, y: 0.8, scale: 1.0, stage: 'bloom' }] },
  },
], { memory: true });

const STORM = chapter('MEMORY · THE SINGING STORM', 1, 'storm', [
  {
    speaker: 'Narrator',
    text: 'A thunderstorm in the old nest. Pokey did not like thunder. He had never told anyone.',
    scene: { zoom: 1.25, particles: 'rain', actors: [hero(0.5, { scale: KID, pose: 'duck' })] },
  },
  {
    speaker: 'Pokey',
    text: 'It is only weather. Weather is very loud, but it is only weather.',
    scene: { zoom: 1.5, focusX: 0.38, particles: 'rain', actors: [hero(0.36, { scale: KID, pose: 'duck' }), jen(0.66, { scale: KID, mood: 'happy' })] },
  },
  {
    speaker: 'Meeca',
    text: 'Close your eyes. I will sing it quiet.',
    scene: { zoom: 1.5, focusX: 0.6, particles: 'rain', actors: [hero(0.36, { scale: KID }), jen(0.66, { scale: KID, mood: 'happy' })] },
  },
  {
    speaker: 'Narrator',
    text: 'She sang, and the whole forest went still to listen: the leaves, the rain, even the thunder.',
    scene: { zoom: 1.3, particles: 'petals', mood: 'dusk', actors: [hero(0.4, { scale: KID }), jen(0.6, { scale: KID, mood: 'happy' })] },
  },
  {
    speaker: 'Meeca',
    text: 'See? Everything slows down when it listens.',
    scene: { zoom: 1.55, focusX: 0.62, particles: 'petals', mood: 'dusk', actors: [hero(0.36, { scale: KID, pose: 'happy' }), jen(0.66, { scale: KID, mood: 'cheer' })] },
  },
  {
    speaker: 'Narrator',
    text: 'That was when Pokey understood that her gift was never magic. It was attention.',
    scene: { zoom: 1.2, particles: 'sparkles', mood: 'dusk', actors: [jen(0.52, { scale: KID * 1.1, mood: 'happy' })] },
  },
], { memory: true });

/** the dream in World 8: it also plays inside that world's own story card */
export const PROMISE_PANELS = chapter('MEMORY · THE PROMISE', 8, 'night', [
  {
    speaker: 'Narrator',
    text: 'In the dark of the Treetops Pokey slept, and he dreamed of the stars over the old nest.',
    scene: { zoom: 1.3, actors: [hero(0.36, { scale: KID }), jen(0.64, { scale: KID, mood: 'happy' })] },
  },
  {
    speaker: 'Meeca',
    text: 'Hold out your wrist. I am tying a petal to it, so you will always know the way back.',
    scene: { zoom: 1.55, focusX: 0.5, particles: 'petals', actors: [hero(0.38, { scale: KID }), jen(0.62, { scale: KID, mood: 'happy' })] },
  },
  {
    speaker: 'Pokey',
    text: 'I promise never to let go.',
    scene: { zoom: 1.6, focusX: 0.4, particles: 'petals', actors: [hero(0.38, { scale: KID, pose: 'happy' }), jen(0.62, { scale: KID, mood: 'happy' })] },
  },
  {
    speaker: 'Meeca',
    text: 'Not even if I go somewhere you cannot follow?',
    scene: { zoom: 1.6, focusX: 0.62, particles: 'petals', actors: [hero(0.38, { scale: KID }), jen(0.62, { scale: KID, mood: 'sad' })] },
  },
  {
    speaker: 'Pokey',
    text: 'Especially then.',
    scene: { zoom: 1.7, focusX: 0.4, particles: 'sparkles', actors: [hero(0.38, { scale: KID }), jen(0.62, { scale: KID, mood: 'happy' })] },
  },
  {
    speaker: 'Narrator',
    text: 'In the dream the petal began to glow. The glow became a trail, and the trail led out of the dark.',
    scene: { zoom: 1.25, particles: 'petals', camera: { from: { zoom: 1.2, fx: 0.5, fy: 0.7 }, to: { zoom: 1.2, fx: 0.5, fy: 0.3 }, dur: 8 }, actors: [hero(0.5, { scale: KID, pose: 'happy' })] },
  },
], { memory: true });

const BLESSING = chapter('MEMORY · THE BLESSING', 1, 'dusk', [
  {
    speaker: 'Narrator',
    text: 'Years ago, a few weeks before everything changed, Pokey did the bravest thing of his life. He knocked on a door.',
    scene: { zoom: 1.3, actors: [hero(0.34, { scale: KID }), general(0.72, { silhouette: true, scale: 0.9 })] },
  },
  {
    speaker: 'Pokey',
    text: 'Sir, I would like your blessing. I would like to walk beside Meeca for as long as she will have me.',
    scene: { zoom: 1.5, focusX: 0.34, actors: [hero(0.34, { scale: KID }), general(0.72, { silhouette: true, scale: 0.9 })] },
  },
  {
    speaker: 'Grandfather',
    text: 'You walk very slowly, young man.',
    scene: { zoom: 1.5, focusX: 0.72, actors: [hero(0.34, { scale: KID }), general(0.72, { silhouette: true, scale: 0.9 })] },
  },
  {
    speaker: 'Pokey',
    text: 'Yes, sir. But I have never once left anyone behind.',
    scene: { zoom: 1.55, focusX: 0.34, actors: [hero(0.34, { scale: KID, pose: 'happy' }), general(0.72, { silhouette: true, scale: 0.9 })] },
  },
  {
    speaker: 'Grandfather',
    text: 'Come back when you can protect her.',
    scene: { zoom: 1.5, focusX: 0.72, actors: [hero(0.34, { scale: KID }), general(0.72, { silhouette: true, scale: 0.9 })] },
  },
  {
    speaker: 'Pokey',
    text: 'I will. Slowly.',
    scene: { zoom: 1.55, focusX: 0.34, actors: [hero(0.34, { scale: KID, pose: 'happy' }), general(0.72, { silhouette: true, scale: 0.9 })] },
  },
  {
    speaker: 'Narrator',
    text: 'He thought it was a test. He did not yet know it was a wound.',
    scene: { zoom: 1.25, actors: [hero(0.5, { scale: KID })] },
  },
], { memory: true });

/** World 7: behind the Golem's broken rune, a photograph that changes everything */
const PHOTOGRAPH = chapter('THE REVEAL · THE PHOTOGRAPH', 7, 'dusk', [
  {
    speaker: 'Narrator',
    text: 'Behind the broken rune there was a hollow in the stone. Inside it, wrapped in cloth, lay a single photograph.',
    scene: {
      zoom: 1.4, focusX: 0.55, particles: 'sparkles',
      fx: [{ at: 0.6, kind: 'glints', x: 0.62, y: 0.7 }],
      actors: [hero(0.3, { pose: 'idle' })],
    },
  },
  {
    speaker: 'Pokey',
    text: 'A baby. And the one holding her… I know that face. Not the armor. The eyes.',
    scene: { photo: { key: 's4_01', caption: 'Meeca, three weeks old', size: 0.5 }, actors: [hero(0.2, { pose: 'idle' })] },
  },
  {
    speaker: 'Pokey',
    text: 'It is him. General Iron-Claw is Meeca\'s grandfather.',
    scene: { photo: { key: 's4_04', caption: 'Grandpa has not put her down since', size: 0.5, tilt: 0.02 }, actors: [hero(0.2, { pose: 'idle' })] },
  },
  {
    speaker: 'Pokey',
    text: 'And she cannot know. She would never recognize him under all that iron. And I have no way to tell her.',
    scene: { zoom: 1.5, focusX: 0.3, actors: [hero(0.3, { pose: 'idle' })] },
  },
  {
    speaker: 'Narrator',
    text: 'The petal trail ended at the temple door. After that there was only stone, one very slow sloth, and a secret.',
    scene: { zoom: 1.2, particles: 'petals', camera: { from: { zoom: 1.1, fx: 0.4, fy: 0.64 }, to: { zoom: 1.1, fx: 0.7, fy: 0.64 }, dur: 8 }, actors: [hero(0.34, { pose: 'idle' })] },
  },
]);

export const MEMORIES: Record<MemoryId, MemoryDef> = {
  waiting: { id: 'waiting', title: 'The Waiting', hint: 'Beat the guardian of World 2.', panels: WAITING },
  garden: { id: 'garden', title: "Grandma's Garden", hint: 'Beat the guardian of World 4.', panels: GARDEN },
  storm: { id: 'storm', title: 'The Singing Storm', hint: 'Beat the guardian of World 6.', panels: STORM },
  photograph: { id: 'photograph', title: 'The Photograph', hint: 'Beat the guardian of World 7.', panels: PHOTOGRAPH },
  promise: { id: 'promise', title: 'The Promise', hint: 'Rest a while in World 8.', panels: PROMISE_PANELS },
  blessing: { id: 'blessing', title: 'The Blessing', hint: 'Beat the guardian of World 9.', panels: BLESSING },
};

export const MEMORY_ORDER: MemoryId[] = ['waiting', 'garden', 'storm', 'photograph', 'promise', 'blessing'];

/** which memory plays after each world's guardian goes down (World 8's plays inside its world card) */
export const MEMORY_AFTER_BOSS: Partial<Record<number, MemoryId>> = { 2: 'waiting', 4: 'garden', 6: 'storm', 7: 'photograph', 9: 'blessing' };

// ───────────── which memories have been seen (kept in the browser, and in save files) ─────────────

export const MEMORIES_KEY = 'sloth_memories';

export function parseMemories(raw: string | null): MemoryId[] {
  if (!raw) return [];
  try {
    const o = JSON.parse(raw);
    if (!o || typeof o !== 'object' || o.v !== 1 || !Array.isArray(o.seen)) return [];
    return MEMORY_ORDER.filter((id) => o.seen.includes(id));
  } catch {
    return [];
  }
}

export function loadMemories(): MemoryId[] {
  try {
    return parseMemories(localStorage.getItem(MEMORIES_KEY));
  } catch {
    return [];
  }
}

/** the list with this memory added, in story order (the same list when it was already there) */
export function withMemory(seen: MemoryId[], id: MemoryId): MemoryId[] {
  return seen.includes(id) ? seen : MEMORY_ORDER.filter((m) => m === id || seen.includes(m));
}

export function saveMemories(seen: MemoryId[]) {
  try {
    localStorage.setItem(MEMORIES_KEY, JSON.stringify({ v: 1, seen }));
  } catch {
    /* storage full or blocked: the memory still plays */
  }
}

// ───────────── the finale ─────────────

/** the ten guardians, standing on the fortress walls in full colour, and Thornbark at the back */
function guardianLine(): SceneActor[] {
  const out: SceneActor[] = [];
  for (let w = 1; w <= 10; w++) out.push({ kind: 'boss', world: w, x: 0.07 + (w - 1) * 0.0905, y: 0.74, scale: 0.34, facing: w > 5 ? -1 : 1 });
  out.push({ kind: 'thornbark', x: 0.93, y: 0.74, scale: 0.34, facing: -1 });
  return out;
}

/**
 * The ending, from the moment the General falls. `found` is what the player has picked up in the Library: each keepsake they hold
 * adds a line or a small scene to the finale, and a full set adds Grandma's last word.
 */
export function finalePanels(found: string[] = []): StoryPanel[] {
  const has = (id: string) => found.includes(id);
  const all = allFound(found);

  const song = chapter('THE SONG', 10, 'storm', [
    {
      speaker: 'Narrator',
      text: 'The General lay in the rain. The thorns of the Iron Pact trembled all around the fortress. And from the high tower, somebody began to sing.',
      scene: { zoom: 1.2, particles: 'rain', actors: [hero(0.18, { scale: 0.9 }), general(0.54, { beaten: true, scale: 0.9 }), jen(0.86, { scale: 0.8, mood: 'happy' })] },
    },
    {
      speaker: 'Meeca',
      text: 'Slow the rain, slow the thunder. Slow the thorn that holds you under.',
      scene: { zoom: 1.35, focusX: 0.7, particles: 'rain', actors: [general(0.36, { beaten: true, scale: 0.8 }), jen(0.74, { scale: 0.95, mood: 'happy' })] },
    },
    {
      speaker: 'Narrator',
      text: 'The thorns let go, one by one. And over the walls, one by one, the ten guardians came to listen.',
      scene: {
        mood: 'dusk', zoom: 1.0, particles: 'petals',
        camera: { from: { zoom: 1.1, fx: 0.15, fy: 0.62 }, to: { zoom: 1.1, fx: 0.85, fy: 0.62 }, dur: 9 },
        actors: guardianLine(),
      },
    },
    {
      speaker: 'Shadow Prowler',
      text: 'The Pact is coming apart in our paws. Sing again, keeper. Whatever he asks of us now, we will not.',
      scene: { mood: 'dusk', zoom: 1.4, focusX: 0.42, particles: 'petals', actors: [{ kind: 'boss', world: 3, x: 0.4, scale: 1.0, facing: 1 }, jen(0.74, { scale: 0.9, mood: 'happy' }), general(0.9, { beaten: true, scale: 0.7 })] },
    },
  ]);

  const mercy = chapter('THE MERCY', 10, 'glow', [
    {
      speaker: 'Narrator',
      text: 'The General\'s armor cracked from his shoulders to his knees, and a very old, very tired sloth stood up inside it.',
      scene: {
        zoom: 1.5, focusX: 0.6, particles: 'sparkles',
        camera: { from: { zoom: 1.2, fx: 0.55, fy: 0.62 }, to: { zoom: 1.6, fx: 0.6, fy: 0.62 }, dur: 5 },
        fx: [
          { at: 1.3, kind: 'flash', dur: 0.4 },
          { at: 1.3, kind: 'shake', amount: 9, dur: 0.5 },
          { at: 1.3, kind: 'burst', x: 0.6, y: 0.56, amount: 1.3 },
          { at: 2.2, kind: 'glints', x: 0.6, y: 0.6 },
        ],
        actors: [
          hero(0.22),
          general(0.62, { scale: 0.85, seq: [{ at: 0, frame: 'stunned' }, { at: 1.4, frame: 'crouch', dur: 0.4 }] }),
        ],
      },
    },
    {
      speaker: 'Meeca',
      text: 'I have seen that face. In a photograph in a drawer, holding a baby exactly like that. …Grandpa?',
      scene: { photo: { key: 's4_01', caption: 'Grandpa', size: 0.5 }, particles: 'sparkles', actors: [jen(0.78, { y: 0.74, scale: 0.8, mood: 'sad' })] },
    },
    ...(has('w2_keepsake')
      ? chapter('THE MERCY', 10, 'glow', [
          {
            speaker: 'Meeca',
            text: 'And my locket. I have never known where it came from. You fastened it on me yourself, the day I started school. Didn\'t you?',
            scene: { zoom: 1.5, focusX: 0.66, particles: 'sparkles', actors: [general(0.38, { scale: 0.8, seq: [{ at: 0, frame: 'crouch' }] }), jen(0.68, { scale: 1.0, mood: 'sad' })] },
          },
        ])
      : []),
    ...chapter('THE MERCY', 10, 'glow', [
      {
        speaker: 'General Iron-Claw',
        text: 'I only wanted to be early. Just once. Your grandmother waited for help and it came too late. I swore that nothing I loved would ever have to wait again.',
        scene: { zoom: 1.5, focusX: 0.4, particles: 'sparkles', actors: [general(0.4, { scale: 0.8, seq: [{ at: 0, frame: 'crouch' }] }), jen(0.68, { mood: 'sad' })] },
      },
      {
        speaker: 'Pokey',
        text: 'I was late, sir. I will always be late. But I came, and I did not let go.',
        scene: { zoom: 1.5, focusX: 0.3, particles: 'sparkles', actors: [hero(0.3, { pose: 'happy' }), general(0.62, { scale: 0.8, seq: [{ at: 0, frame: 'crouch' }] })] },
      },
      {
        speaker: 'General Iron-Claw',
        text: 'Look how fast you climbed my mountain. Look what you can do when you actually care. …You were never too slow for her. You were just the only one who stayed.',
        scene: { zoom: 1.55, focusX: 0.55, particles: 'sparkles', actors: [hero(0.3), general(0.6, { scale: 0.8, seq: [{ at: 0, frame: 'crouch' }] }), jen(0.84, { mood: 'happy' })] },
      },
      {
        speaker: 'Narrator',
        text: 'Meeca put a Heartbloom bud into his hands. He held it, and for the first time in years, the General waited.',
        scene: {
          zoom: 1.3, particles: 'petals',
          camera: { from: { zoom: 1.5, fx: 0.55, fy: 0.66 }, to: { zoom: 1.0, fx: 0.5, fy: 0.12 }, dur: 9 },
          actors: [hero(0.28), general(0.56, { scale: 0.8, seq: [{ at: 0, frame: 'crouch' }] }), jen(0.76, { mood: 'happy' })],
        },
      },
    ]),
    ...(has('w10_keepsake')
      ? chapter('THE MERCY', 10, 'glow', [
          {
            speaker: 'Dot',
            text: 'Somebody is coming home. That is what the bell is for. I do not know how I know that. Nobody told me.',
            scene: { zoom: 1.4, focusX: 0.5, particles: 'sparkles', actors: [hero(0.28), { kind: 'dot', x: 0.52, y: 0.4, scale: 1.0 }, jen(0.76, { mood: 'happy' })], fx: [{ at: 0.5, kind: 'glints', x: 0.52, y: 0.42 }] },
          },
        ])
      : []),
    ...(all
      ? chapter('THE MERCY', 10, 'glow', [
          {
            speaker: 'Meeca',
            text: 'Grandma left a note in her pouch. It said, "Be slow with him." So we will, Grandpa. All of us. Won\'t we, Pokey?',
            scene: { zoom: 1.5, focusX: 0.55, particles: 'petals', actors: [hero(0.3, { pose: 'happy' }), general(0.58, { scale: 0.8, seq: [{ at: 0, frame: 'crouch' }] }), jen(0.8, { mood: 'happy' })] },
          },
        ])
      : []),
    ...chapter('THE MERCY', 10, 'glow', [
      {
        speaker: 'General Iron-Claw',
        text: 'You… may… walk… with her. …Sometimes.',
        scene: { zoom: 1.5, focusX: 0.55, particles: 'sparkles', actors: [hero(0.3), general(0.6, { scale: 0.8, seq: [{ at: 0, frame: 'crouch' }] }), jen(0.84, { mood: 'cheer' })] },
      },
      {
        speaker: 'Narrator',
        text: 'It took forty-five seconds. Pokey fell asleep halfway through. Everyone let him.',
        scene: { zoom: 1.2, particles: 'sparkles', actors: [hero(0.5, { y: 1.04, scale: 1.25, portrait: true, seq: [{ at: 0, frame: 'face_calm' }, { at: 2.2, frame: 'face_calm_closed' }] })] },
      },
    ]),
  ]);

  const epilogue = chapter('EPILOGUE', 10, 'glow', [
    {
      speaker: 'Meeca',
      text: 'Pokey! You followed every petal! I knew you would!',
      scene: { castle: 7, zoom: 1.4, actors: [hero(0.3, { scale: 1.1, pose: 'happy' }), jen(0.68, { scale: 1.1, mood: 'cheer', kind: 'daisy_wave' })] },
    },
    {
      speaker: 'Pokey',
      text: 'It took me ten realms, one hundred trials, and a very long nap in the middle. Worth every slow step.',
      scene: { castle: 7, zoom: 1.35, focusX: 0.46, actors: [hero(0.3, { scale: 1.1 }), jen(0.68, { scale: 1.1 })] },
    },
    {
      speaker: 'Narrator',
      text: 'The storm broke and the sun poured over the Highlands. The ten guardians went home, the creatures in the cages cheered, and far away in the Emerald Canopy the Heartbloom began to glow.',
      scene: { world: 1, zoom: 1.0, particles: 'petals', actors: [{ kind: 'bloom', x: 0.5, y: 0.8, scale: 1.5, stage: 'ultimate' }] },
    },
    ...(has('w8_keepsake')
      ? chapter('EPILOGUE', 10, 'glow', [
          {
            speaker: 'Narrator',
            text: 'On the hill, in the first quiet the Highlands had known in years, Meeca planted the packet of seeds. "For the hill," she read from the label. "Plant when it is quiet." It was.',
            scene: { castle: 7, zoom: 1.35, particles: 'petals', actors: [hero(0.34, { pose: 'happy' }), jen(0.62, { mood: 'happy' }), general(0.84, { scale: 0.75, seq: [{ at: 0, frame: 'crouch' }] })] },
          },
        ])
      : []),
    {
      speaker: 'Narrator',
      text: 'Three days later, the village guard arrived at the fortress, sword drawn. "Did anyone hear a loud noise?" he asked. Nobody had the heart to tell him.',
      scene: { castle: 7, zoom: 1.1, particles: 'sparkles', actors: [] },
    },
  ]);

  const end = chapter('THE END', 1, 'dusk', [
    {
      speaker: 'Meeca',
      text: 'Come on, Pokey. Let us go home and watch it bloom. Slowly, of course.',
      scene: { particles: 'petals', zoom: 1.35, actors: [hero(0.36, { scale: 1.2, pose: 'happy' }), { kind: 'bloom', x: 0.52, y: 0.8, scale: 1.0, stage: 'epic' }, jen(0.68, { scale: 1.2 })] },
    },
    {
      speaker: 'Narrator',
      text: 'And far away, the petal tied to Pokey\'s wrist glowed once, and pointed somewhere new.',
      scene: {
        world: 1, mood: 'night', particles: 'sparkles', zoom: 1.2,
        fx: [{ at: 1.2, kind: 'glints', x: 0.55, y: 0.78 }],
        actors: [hero(0.5, { y: 1.04, scale: 1.25, portrait: true, seq: [{ at: 0, frame: 'face_calm' }, { at: 2.0, frame: 'face_wink' }] })],
      },
    },
  ]);

  return [...song, ...mercy, ...epilogue, ...end];
}

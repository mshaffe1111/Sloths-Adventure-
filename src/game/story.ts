/**
 * The full script for Sloths Rainforest Adventures.
 * Every cutscene in the game (intro, world intros, boss showdowns, ending) is data here,
 * rendered by StoryPlayer with scenes drawn from the in-game art.
 */

import type { JennifurMood } from './jennifurSprite.ts';
import type { DotPose } from './dotSprite.ts';
import type { PokeyMood } from './heroStory.ts';
import type { ActorMove, CameraFollow } from './storyActors.ts';
import type { CameraMove, PoseKey, SceneFx } from './storyShots.ts';
import { finalePanels } from './storyChapters.ts';

export type ActorKind =
  | 'milo'
  | 'daisy'
  | 'daisy_wave'
  | 'boss'
  | 'thornbark'
  | 'bloom'
  /** Dot, the hummingbird courier: hovers, scale is its size */
  | 'dot'
  /** Flicker the firefly: hovers, his painted clips (`clip`), his light steady or stuttering */
  | 'flicker'
  /** one of the General's soldiers (the two from the garden): his painted clips (`clip`: idle_a, turn_b...), feet on the ground */
  | 'soldier'
  /** a painted figure from Matt's story sheets (Grandma, Lieutenant Pell, the General's forms, the pairs...): its frames come from `seq`; see storyCels.ts */
  | 'cel';

/** the Heartbloom's life: a closed bud, the open bloom, the epic glowing bloom, and its ultimate state */
export type BloomStage = 'bud' | 'bloom' | 'epic' | 'ultimate';

export interface SceneActor {
  kind: ActorKind;
  /** 0..1 across the scene width */
  x: number;
  /** 0..1 down the scene height (feet position) */
  y?: number;
  scale?: number;
  facing?: 1 | -1;
  /** boss world id 1..10 when kind === 'boss' */
  world?: number;
  /** draw as a dark silhouette */
  silhouette?: boolean;
  /** on a plate: x and y are shares of the plate's own scene (its 1024:572 bottom), so a figure at a window stays at it in any shape of screen */
  pinned?: boolean;
  /** boss only: attack pose */
  angry?: boolean;
  /** boss only: defeated and dizzy */
  beaten?: boolean;
  /** bloom only: which painted stage of the Heartbloom (the open bloom when unset) */
  stage?: BloomStage;
  /** milo (Pokey) or daisy (Meeca): what the actor is doing, a timed loop of painted poses (the moods are listed in storyActors.ts) */
  mood?: JennifurMood | PokeyMood;
  /** milo only: the old pose presets, now the moods of the same names */
  pose?: 'idle' | 'punch' | 'duck' | 'happy';
  /** milo or daisy: walk or run across the picture (a share of the width over some seconds), the legs matched to the ground; see storyActors.ts */
  move?: ActorMove | ActorMove[];
  /**
   * a performance in painted poses (milo and the painted bosses): which frame to show when, and where the actor moves between them.
   * When set it replaces `pose` / `angry` / `beaten`, and the actor falls back to those if the painted art is not loaded.
   */
  seq?: PoseKey[];
  /** dot only: what he is doing (hovering when unset); see DotPose in dotSprite.ts */
  dotPose?: DotPose;
  /** flicker only: which of his clips plays (flickerAnimData.ts FLICKER_SEQ; 'blink' when unset) */
  clip?: string;
  /** flicker only: his light stutters, his tell when he is not telling the whole truth */
  stutter?: boolean;
  /** cel only: the cast code ('GR' is Grandma); the names it answers to when it is the one speaking are in storyCels.ts */
  cel?: string;
  /** milo only: a big face portrait instead of the body ('face_calm', 'face_wink'...; `seq` can change the expression), drawn `scale` times the usual size */
  portrait?: boolean;
}

/** a photograph shown on a card over the picture (a keepsake from the albums: the key is its photo in src/assets/photos) */
export interface ScenePhoto {
  key: string;
  /** printed under the picture */
  caption?: string;
  /** how wide the card is, as a share of the scene width */
  size?: number;
  /** lean in radians */
  tilt?: number;
}

export type SceneMood = 'day' | 'storm' | 'dusk' | 'night' | 'glow';

export interface StoryScene {
  /** world id 1..10 whose backdrop to use */
  world: number;
  mood: SceneMood;
  actors: SceneActor[];
  /** where the light on the figures comes from, a direction (x, y) out of the picture toward it: upper left (-0.7, -0.7) when unset (or the plate's own) */
  light?: [number, number];
  /** falling petals / sparkles */
  particles?: 'petals' | 'sparkles' | 'rain' | 'embers' | 'none';
  /** camera x offset in px to pick a different slice of the backdrop */
  camX?: number;
  /** show the ten guardians as a silhouette line-up */
  lineup?: boolean;
  /** camera zoom (1 = full frame) and focus point (0..1) for close-ups */
  zoom?: number;
  focusX?: number;
  focusY?: number;
  /** which painted castle stands behind a world-10 picture (5-7); the Highland Fortress when unset */
  castle?: number;
  /** a whole painted backdrop (a key of plateData.ts) drawn instead of the world's scenery; `world` is then only the music's and the notes' idea of where we are, and `ground` defaults to the plate's floor */
  plate?: string;
  /** a camera move over the picture (replaces the slow default push-in) */
  camera?: CameraMove;
  /** the camera follows an actor that travels (`move`): it stays put on the screen and the world scrolls by, with parallax; see storyActors.ts */
  follow?: CameraFollow;
  /** where the actors' feet are, as a share of the height (default 0.8, the top of the branch every picture is drawn on): one line for the whole picture */
  ground?: number;
  /** effects at moments of the picture: flash, shake, impact burst, dust, dizzy stars, glints */
  fx?: SceneFx[];
  /** a remembered moment: faded warm colour, soft old-paper edges */
  memory?: boolean;
  /** a photograph held up over the picture */
  photo?: ScenePhoto;
  /** an ending card (endCards.ts) drawn over the whole picture: the cast and the world behind it are not seen */
  card?: string;
}

/**
 * What the score should be doing under a picture. A panel without a cue keeps the old rule (the music follows its chapter title and mood,
 * see audio/scenes.ts sceneForPanel); a panel with one gets the piece written for that feeling. The same cue on the next panel keeps the
 * music going (no restart), so a scene is scored by changing the cue only where the feeling changes.
 *   pokey    Pokey's theme: warm, a gentle plodding walk, a little wry
 *   meeca    Meeca's lullaby ("Slow the rain..."): the song the whole story hangs on
 *   bloom    the Heartbloom: hushed wonder, bells and harp
 *   grandma  Grandma: warm cello and clarinet, "slow is not stopped"
 *   journey  travelling along the petal trail: bright, forward, curious
 *   comedy   light and bouncy: pizzicato, bassoon, a wrong note held for a laugh
 *   tender   a quiet happy memory
 *   sorrow   loss and grief: solo cello and piano, the lullaby in the minor
 *   dread    something is coming: low drone, tremolo, distant timpani
 *   war      General Iron-Claw's march: iron, brass, a drum that does not hurry
 *   chase    urgency: driving strings, no time to breathe
 *   reveal   a secret comes out: suspended chords that hang, then fall
 *   resolve  Pokey decides: the theme rising, steady drums
 *   triumph  a win: the full orchestra, the theme in the major
 *   mercy    the General's war look lets go: the march melting into the lullaby
 *   finale   the guardians come home: everything, at last in the major
 *   hush     almost nothing: a held note, the ambience, then silence
 */
export type StoryCue =
  | 'pokey' | 'meeca' | 'bloom' | 'grandma' | 'journey' | 'comedy' | 'tender' | 'sorrow' | 'dread'
  | 'war' | 'chase' | 'reveal' | 'resolve' | 'triumph' | 'mercy' | 'finale' | 'hush';

/** a short musical punctuation that plays once as the panel appears (a cliffhanger, a laugh, a door) */
export type StorySting = 'cliffhanger' | 'reveal' | 'laugh' | 'blow' | 'bloom' | 'darkness' | 'door' | 'heartbreak' | 'triumph';

export interface StoryPanel {
  chapter: string;
  speaker: string;
  text: string;
  scene: StoryScene;
  /** optional gameplay tip shown under the text (boss intros) */
  tip?: string;
  /** the music under this picture (see StoryCue); unset = the old chapter-and-mood rule */
  cue?: StoryCue;
  /** how full the music is, 0..1 (the cue's own default when unset) */
  intensity?: number;
  /** a one-off sound as the picture appears */
  sting?: StorySting;
  /** a picture the player plays with their thumbs (StoryPlayer, on a touch screen); without touch it reads as a plain picture */
  hold?: StoryHold;
  /** only read where the picture before it could not be played (no touch screen): it narrates what the player's thumbs would have done */
  narratedOnly?: boolean;
  /** shown only when the player has found this (a find's id): the world noticing what you did (storyNotice.ts) */
  ifFound?: string;
  /** said instead of `text` once the player has fallen at least once: {N} is how many times, in words (storyNotice.ts) */
  withFalls?: string;
}

/**
 * The let-go in the tower (2026-10-29 story report): the player holds the wall with both thumbs while it thunders, lifts one to reach
 * out, and keeps it up through the thunder. Putting it back down only grabs the wall again: no fail, no timer, no words.
 */
export interface StoryHold {
  kind: 'letgo';
  /** the prompts (Easy keeps them; Normal lets them fade after the first try) */
  both: string;
  lift: string;
  /** the picture while one thumb is up: his hand off the wall, reaching */
  reach: StoryScene;
}

// the script itself lives in the story*.ts files next to this one (see storyDsl.ts for how a scene is written)
export { INTRO_PANELS } from './storyIntro.ts';
export { WORLD_STORIES, WORLD_MID, WORLD_GATE } from './storyWorlds.ts';
export type { WorldStory } from './storyWorlds.ts';

export { BOSS_STORIES, bossPanels, thornbarkPanels } from './storyBosses.ts';
export type { BossStory, BossLine } from './storyBosses.ts';

/** the ending as it plays when nothing has been found in the Library (the game builds it with the player's finds, see storyChapters.ts) */
export const ENDING_PANELS: StoryPanel[] = finalePanels([]);

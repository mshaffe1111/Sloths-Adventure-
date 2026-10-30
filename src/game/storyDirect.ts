/**
 * The direction of a story scene (story-delivery, Matt 2026-10-30: the cutscenes were "well below what other studios and even independent
 * would put out"). The script says what is said and where; this says how each line is delivered, the way a director would take the same
 * pages:
 *   - how the picture arrives: a cut inside one setup, a soft dip when the place changes, the full dip from dark only for a new chapter
 *     (every picture used to dip from dark, which played a scene as a slideshow);
 *   - a beat of silence before the words: longer before a hard truth, after a long speech, on an answer to a question;
 *   - how fast the line types (each voice its own pace, slower in grief, quicker in a chase), split into pages when it would be a wall
 *     of text on a phone;
 *   - the camera: a single on whoever speaks (cut, then a slow push), a slower push on an emotional line, a pull back on a reveal, a
 *     drift on narration, and stillness where stillness is the point (one shared slow push on every picture made every frame the same);
 *   - the voice's tone (softer and lower in grief, firmer in a fight) and none at all for a sung line;
 *   - the music under it: keep, under (half), silence, or swell.
 * The rules give every line of every scene its delivery; OVERRIDES give the big lines theirs by hand. Pure: the scene player reads it and
 * tools/story-delivery/sheet.ts writes the direction sheet (reference/story-delivery/DIRECTION.md) from the same code.
 */
import type { SceneActor, StoryCue, StoryPanel, StoryScene } from './story.ts';
import type { Cam, CameraMove } from './storyShots.ts';
import { typeMs } from '../audio/voiceLine.ts';
import { CEL_CAST } from './storyCels.ts';

export type Enter = 'dip' | 'soft' | 'cut';
export type Shot = 'authored' | 'single' | 'push' | 'slowPush' | 'reveal' | 'drift' | 'still';
export type MusicMove = 'keep' | 'under' | 'silence' | 'swell';

export interface Direction {
  enter: Enter;
  /** ms of silence after the picture lands before the first letter */
  beat: number;
  /** ms a letter */
  typeMs: number;
  /** the line as the reader gets it: one page, or a few when it would be a wall of text */
  pages: string[];
  shot: Shot;
  /** the camera move for this picture (null: the scene's own, authored move or follow) */
  camera: CameraMove | null;
  /** the voice: pitch (semitones) and level (dB) on the speaker's own, or silent */
  tone: { semis: number; db: number; silent?: boolean };
  music: MusicMove;
  /** why, for the direction sheet */
  why: string[];
}

/** a big line's own delivery, by hand: matched by `speaker|start of the line` */
export interface Override {
  enter?: Enter;
  beat?: number;
  /** on the typing pace the rules give */
  typeScale?: number;
  shot?: Shot;
  music?: MusicMove;
  note: string;
}

/** a page of text is at most this many letters: about four lines of the reading font on an upright phone */
export const PAGE_MAX = 150;

const EMOTIONAL: ReadonlySet<StoryCue> = new Set<StoryCue>(['sorrow', 'hush', 'tender', 'grandma', 'meeca', 'mercy']);
const BIG_STINGS = new Set(['heartbreak', 'reveal', 'cliffhanger', 'door', 'darkness']);
const GUARDIAN_WORLD: Readonly<Record<string, number>> = {
  'Venom Fang': 1, 'Crocus Rex': 2, 'Shadow Prowler': 3, 'Sky Sovereign': 4, 'Tarantula Queen': 5, 'Marsh Reaver': 6, 'Stone Idol Golem': 7,
  'Night-Wing Monarch': 8, 'Magma Drake': 9, 'General Iron-Claw': 10,
};

/** where the one speaking stands in the picture (0..1 across), or null when they are not in it */
export function speakerX(scene: StoryScene, speaker: string): number | null {
  const at = (a: SceneActor, fallback: number) => (a.pinned ? a.x : a.x ?? fallback);
  for (const a of scene.actors) {
    const k = a.kind;
    if (speaker === 'Pokey' && k === 'milo') return at(a, 0.3);
    if (speaker === 'Meeca' && (k === 'daisy' || k === 'daisy_wave')) return at(a, 0.6);
    if (speaker === 'Dot' && k === 'dot') return at(a, 0.5);
    if (speaker === 'Flicker' && k === 'flicker') return at(a, 0.5);
    if (speaker === 'Thornbark' && k === 'thornbark') return at(a, 0.6);
    if (k === 'boss' && GUARDIAN_WORLD[speaker] !== undefined && a.world === GUARDIAN_WORLD[speaker]) return at(a, 0.7);
    if (k === 'cel' && a.cel) {
      const c = CEL_CAST[a.cel];
      const who = c?.who ?? [];
      if (who.includes(speaker) || (speaker === 'Grandfather' && (a.cel === 'GV' || a.cel === 'GN'))) return at(a, c?.x ?? 0.5);
    }
  }
  return null;
}

/** what makes two pictures one setup (a cut between them) rather than a new place (a dip) */
function setup(s: StoryScene): string {
  return [s.plate ?? `w${s.world}`, s.mood, s.memory ? 'm' : '', s.lineup ? 'l' : ''].join('/');
}

/** a line split into pages at the sentence ends nearest its middle, when it is longer than PAGE_MAX (a sung line is never split) */
export function pagesOf(text: string, max = PAGE_MAX): string[] {
  if (text.length <= max || text.includes('♪')) return [text];
  // at a sentence end where there is one, else (one long run-on, Dot's way) at a comma
  const find = (re: RegExp) => {
    const at: number[] = [];
    for (let m = re.exec(text); m; m = re.exec(text)) {
      const c = m.index + m[0].length;
      // (no page of a few words: each side at least 24 letters)
      if (text.slice(0, c).trimEnd().length >= 24 && text.length - c >= 24) at.push(c);
    }
    return at;
  };
  let cuts = find(/[.!?…—]["”]?\s+(?=\S)/g);
  if (!cuts.length) cuts = find(/,\s+(?=\S)/g);
  if (!cuts.length) return [text];
  const mid = text.length / 2;
  let best = cuts[0];
  for (const c of cuts) if (Math.abs(c - mid) < Math.abs(best - mid)) best = c;
  return [...pagesOf(text.slice(0, best).trimEnd(), max), ...pagesOf(text.slice(best), max)];
}

/** how long a line takes to type at `ms` a letter, roughly (the breaths at stops included) */
const typedSeconds = (text: string, ms: number) => (text.length * ms + (text.match(/[.!?…]/g)?.length ?? 0) * 170) / 1000;

const key = (p: StoryPanel) => `${p.speaker}|${p.text}`;

/** the hand-directed lines (see the direction sheet for each one's reasoning) */
export const OVERRIDES: ReadonlyArray<[string, Override]> = [
  // ── the prologue: the kidnapping
  ['Narrator|She was already lifting off the branch when the birds went quiet', { beat: 900, music: 'silence', shot: 'still', note: 'the birds stop and the music stops with them' }],
  ['Narrator|Dot stopped in the air.', { beat: 700, music: 'silence', note: 'still no music: the thunder is the first sound back' }],
  ['Narrator|The Heartbloom closed up, petal over petal', { beat: 600, shot: 'slowPush', note: 'the light going out is a moment: hold on the flower' }],
  ['Narrator|Soldiers came, in two straight lines.', { enter: 'cut', beat: 300, shot: 'reveal', note: 'a hard cut and a pull back to show the lines' }],
  ['General Iron-Claw|The General does not knock.', { beat: 800, shot: 'slowPush', note: 'his first words: a beat of nothing, then slow' }],
  ["Meeca|It's a garden. There's no door.", { beat: 250, note: 'her comeback lands fast' }],
  ['General Iron-Claw|One.', { beat: 1000, music: 'under', shot: 'push', note: 'the count over almost nothing' }],
  ['General Iron-Claw|Two.', { beat: 900, music: 'under', shot: 'push', note: 'the count' }],
  ['General Iron-Claw|Three.', { beat: 900, music: 'under', shot: 'push', note: 'the count' }],
  ['Narrator|Pokey looked over at Meeca, and he moved faster', { enter: 'cut', beat: 120, typeScale: 0.8, note: 'the fastest he has ever moved: so is the cut' }],
  ['Narrator|And she was gone.', { beat: 1300, music: 'silence', shot: 'still', note: 'the big silence: nothing under it' }],
  ['Narrator|Pokey ran.', { enter: 'cut', beat: 100, note: 'the music crashes back in on the cut' }],
  ['Narrator|When he looked up, they were a line along the ridge.', { beat: 700, music: 'under', note: 'the chase music drains away' }],
  ['Grandma|Follow the petals, Pokey.', { beat: 1000, music: 'under', shot: 'slowPush', note: 'a ghost: slow in, quiet' }],
  ['Narrator|He blinked the rain out of his eyes. There was nobody there.', { beat: 800, music: 'under', note: 'let it be empty' }],
  ["Pokey|Hang on, Meeca. I'm coming.", { beat: 700, music: 'swell', note: 'the vow: the theme rises under it' }],
  // ── World 6: the gap closing
  ['Dot|Pokey. I have to tell you something.', { beat: 800, shot: 'slowPush', note: 'she has been rehearsing this: let her breathe first' }],
  ['Pokey|Go on.', { beat: 700, note: 'he already knows' }],
  ['Dot|That was the last note I can get out.', { shot: 'slowPush', note: 'slow in on Dot' }],
  ['Pokey|We stopped for tea.', { beat: 1500, music: 'silence', shot: 'still', note: 'the cost of being slow: total silence' }],
  ['Dot|We stopped for tea.', { beat: 1100, music: 'silence', shot: 'still', note: 'she says it back: still nothing' }],
  ['Dot|She said, "He\'ll know. He\'ll have stopped."', { beat: 900, music: 'under', shot: 'slowPush', note: 'the sealed note: quiet' }],
  ['Narrator|Dot had three tail feathers left.', { beat: 700, note: 'the cost on her body, seen not said' }],
  ['Pokey|We never agreed on a time.', { beat: 700, note: 'his gift to her: a pause, then warmth' }],
  ['Narrator|Dot went up through the roots.', { beat: 800, music: 'under', shot: 'still', note: 'alone: hold on the shivering leaf' }],
  // ── the tower: the let-go
  ['Narrator|The General lay in the rubble', { beat: 900, music: 'silence', note: 'after the fight: only the storm' }],
  ['Narrator|Pokey had hold of the nearest wall with both hands.', { beat: 500, music: 'silence', note: 'his fear of thunder, back' }],
  ['Narrator|He let go with one hand.', { beat: 1300, music: 'silence', shot: 'slowPush', note: 'the peak of the game: slow, silent' }],
  ['Narrator|He held it out across the wet stones.', { beat: 600, music: 'under', note: 'the first note comes back under the held-out hand' }],
  ['Narrator|The General looked at the hand.', { beat: 900, music: 'under', note: 'then the song' }],
  ['Meeca|♪ Slow the rain', { beat: 1200, typeScale: 1.7, music: 'swell', note: 'the lullaby: sung slowly, the music carries it, no babble' }],
  // ── the reunion
  ['Narrator|Meeca came down the steps and stopped ten paces away.', { beat: 700, music: 'silence', shot: 'still', note: 'ten paces of nothing' }],
  ['Meeca|Hello, Grandpa.', { beat: 1300, shot: 'slowPush', note: 'two words, a long time coming' }],
  ['Grandfather|Little bloom.', { beat: 900, note: 'he tries' }],
  ["Meeca|No. You don't get to say that yet.", { enter: 'cut', beat: 250, note: 'she cuts him off' }],
  ['Narrator|The General looked down at his empty hands.', { beat: 900, music: 'under', note: 'hold on the hands' }],
  ['Grandfather|She waited for help, and it came late.', { beat: 700, shot: 'slowPush', note: 'the truth, at last, slow in' }],
  ['Grandfather|I should have knocked.', { beat: 1500, music: 'silence', shot: 'still', note: 'the line the whole story answers: nothing under it' }],
  ["Narrator|Meeca didn't say it was all right.", { beat: 800, music: 'under', note: 'the music finds its way back as she takes his hand' }],
  ['Grandfather|I have lost count.', { beat: 1000, music: 'swell', note: 'the mercy: the march melting into the lullaby' }],
  ["Narrator|Meeca turned around. Pokey was standing where he'd stopped", { beat: 900, music: 'silence', shot: 'reveal', note: 'pull back: him, alone, soaked' }],
  ['Meeca|You came.', { beat: 1300, music: 'under', shot: 'slowPush', note: 'the reunion: two words' }],
  ['Pokey|I was in the neighborhood. Slowly.', { beat: 900, note: 'his joke, after a breath' }],
  ['Narrator|She laughed. Then her back stopped being straight.', { beat: 500, music: 'swell', note: 'the swell: the reunion lands here' }],
  ['Pokey|You can sit down now.', { beat: 800, shot: 'slowPush', note: 'the kindest line in the game' }],
  ['Narrator|They sat on the wet steps.', { music: 'swell', shot: 'drift', note: 'her theme, full' }],
  // ── the ending: tea
  ['Narrator|He sat down in it, put his feet up, and finished the whole cup.', { beat: 900, music: 'swell', note: 'the chair, at last' }],
  ["Dot|It's a trap with cookies. I've had four.", { enter: 'cut', beat: 300, note: 'the laugh, fast' }],
  ['Narrator|Far off in the east, the last of the storm said something.', { beat: 700, music: 'under', note: 'a held breath: does he grab?' }],
  ['Grandfather|Tell him he has retired.', { beat: 700, note: 'the pause before the punchline' }],
  ['Grandfather|Hello, love. I\'m late.', { beat: 1400, music: 'silence', shot: 'slowPush', note: 'at her tree: nothing under it' }],
  ['Narrator|Home was exactly the way they\'d left it', { enter: 'dip', music: 'swell', note: 'home: the theme comes in full' }],
  ["Pokey|He's gonna make it. He trained for it.", { beat: 800, note: 'the callback, after a breath' }],
  ['Narrator|Meeca sat down on the garden path beside the snail.', { beat: 900, music: 'swell', shot: 'drift', note: 'the last picture: slow, full' }],
];

function overrideFor(p: StoryPanel): Override | undefined {
  const k = key(p);
  for (const [start, o] of OVERRIDES) if (k.startsWith(start)) return o;
  return undefined;
}

/** the direction of every picture of a scene, in order (each picture's shot follows from the last) */
export function directScene(panels: StoryPanel[]): Direction[] {
  const out: Direction[] = [];
  let lastEnd: Cam | null = null;
  for (let i = 0; i < panels.length; i++) {
    const p = panels[i];
    const prev = i > 0 ? panels[i - 1] : null;
    const o = overrideFor(p);
    const why: string[] = [];
    const cue = p.cue;
    const emo = !!cue && EMOTIONAL.has(cue);
    const scene = p.scene;
    const sameSetup = !!prev && prev.chapter === p.chapter && setup(prev.scene) === setup(scene);

    // how it arrives
    let enter: Enter = !prev || prev.chapter !== p.chapter ? 'dip' : sameSetup ? 'cut' : 'soft';
    if (p.sting === 'blow' && prev) enter = 'cut';
    if (o?.enter) enter = o.enter;

    // the beat before the words
    let beat = enter === 'cut' ? 180 : enter === 'soft' ? 320 : 450;
    if (p.sting && BIG_STINGS.has(p.sting)) (beat += 650), why.push(`a beat before the ${p.sting}`);
    if (cue === 'hush') (beat += 500), why.push('hush: let it be quiet first');
    const plen = prev?.text.length ?? 0;
    if (prev && p.text.length <= 28 && plen >= 80) (beat += 450), why.push('a short line after a long one: give it room');
    if (prev && prev.speaker !== p.speaker && /\?["”]?$/.test(prev.text.trim()) && p.speaker !== 'Narrator') (beat += 250), why.push('an answer: a thinking beat');
    beat = Math.min(1500, beat);
    if (o?.beat !== undefined) beat = o.beat;

    // the pace
    let ms = typeMs(p.speaker);
    if (emo) ms *= 1.15;
    else if ((cue === 'chase' || cue === 'war') && (p.intensity ?? 0.5) >= 0.5) ms *= 0.85;
    if (o?.typeScale) ms *= o.typeScale;
    ms = Math.round(ms);
    const pages = pagesOf(p.text);
    if (pages.length > 1) why.push(`${pages.length} pages (it was ${p.text.length} letters in one box)`);

    // the camera
    const z0 = scene.zoom ?? 1;
    const f0 = { fx: scene.focusX ?? 0.5, fy: scene.focusY ?? 0.62 };
    const sx = speakerX(scene, p.speaker);
    let shot: Shot;
    if (scene.camera || scene.follow) shot = 'authored';
    else if (o?.shot) shot = o.shot;
    else if (p.sting === 'reveal' || p.sting === 'cliffhanger') shot = 'reveal';
    else if (p.speaker === 'Narrator') shot = 'drift';
    else if (emo && sx !== null) shot = 'slowPush';
    else if (sx !== null && prev && prev.speaker !== p.speaker) shot = 'single';
    else shot = sx !== null ? 'push' : 'drift';
    const secs = Math.max(3, Math.min(9, typedSeconds(p.text, ms) + beat / 1000 + 1.5));
    // a single frames the speaker: the focus moves most of the way to them (clamped by the scene player to the picture's edges)
    const toward = (k: number) => (sx === null || scene.focusX !== undefined ? f0.fx : f0.fx + (sx - f0.fx) * k);
    let camera: CameraMove | null = null;
    const zc = (z: number) => Math.min(2.6, z);
    switch (shot) {
      case 'single':
        camera = { from: { zoom: zc(z0 * 1.12), fx: toward(0.55), fy: f0.fy }, to: { zoom: zc(z0 * 1.17), fx: toward(0.6), fy: f0.fy }, dur: secs, ease: 'out' };
        break;
      case 'push': {
        // the same speaker again in the same setup: carry on from where the last picture's camera ended, no jump
        const from: Cam = sameSetup && lastEnd ? lastEnd : { zoom: z0, fx: f0.fx, fy: f0.fy };
        camera = { from, to: { zoom: zc(Math.min(z0 * 1.22, from.zoom * 1.05)), fx: toward(0.45), fy: f0.fy }, dur: secs, ease: 'inOut' };
        break;
      }
      case 'slowPush':
        camera = { from: { zoom: z0, fx: f0.fx, fy: f0.fy }, to: { zoom: zc(z0 * 1.14), fx: toward(0.5), fy: f0.fy }, dur: Math.max(6, secs + 2), ease: 'inOut' };
        break;
      case 'reveal':
        camera = { from: { zoom: zc(z0 * 1.16), fx: toward(0.6), fy: f0.fy }, to: { zoom: z0 * 0.97, fx: f0.fx, fy: f0.fy }, dur: 2.4, ease: 'out' };
        break;
      case 'drift': {
        const d = i % 2 ? 1 : -1;
        camera = { from: { zoom: z0 * 1.03, fx: f0.fx - 0.025 * d, fy: f0.fy }, to: { zoom: z0 * 1.05, fx: f0.fx + 0.025 * d, fy: f0.fy }, dur: 10, ease: 'linear' };
        break;
      }
      case 'still':
        camera = { from: { zoom: z0, fx: f0.fx, fy: f0.fy }, to: { zoom: z0 * 1.015, fx: f0.fx, fy: f0.fy }, dur: 12, ease: 'linear' };
        break;
      default:
        camera = null;
    }
    lastEnd = camera ? camera.to : null;

    // the voice
    const tone = { semis: 0, db: 0, silent: p.text.includes('♪') || undefined };
    if (cue === 'sorrow' || cue === 'hush') (tone.semis = -1), (tone.db = -3);
    else if (cue === 'tender' || cue === 'grandma' || cue === 'meeca') (tone.semis = -0.5), (tone.db = -1.5);
    else if (cue === 'dread') (tone.semis = -0.5), (tone.db = -1);
    else if (cue === 'war' || cue === 'chase') tone.db = 1;
    else if (cue === 'comedy') tone.semis = 0.5;

    // the music
    let music: MusicMove = cue === 'hush' ? 'under' : 'keep';
    if (o?.music) music = o.music;
    // (a hand-directed line gives its own reason; the rules' reasons are for the lines they direct alone)
    if (o) why.splice(0, why.length, o.note, ...why.filter((w) => w.includes('pages')));
    out.push({ enter, beat, typeMs: ms, pages, shot, camera, tone, music, why });
  }
  return out;
}

/** the overrides that no line of these scenes matches (a line's words changed): the tests hold this empty */
export function strayOverrides(all: StoryPanel[]): string[] {
  const keys = all.map(key);
  return OVERRIDES.map(([k]) => k).filter((k) => !keys.some((x) => x.startsWith(k)));
}

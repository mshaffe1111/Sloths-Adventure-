/**
 * When a story line's voice speaks, and how (story-delivery, Matt 2026-10-30). Pure, so the tests can read it. As a line types, each
 * new letter asks `syllableAt`: a syllable plays at the start of a word and then every few letters of it (the voice's `every`), never
 * closer than its `gap`. The word picks the take (the same word sounds the same every time it is said), and the line's tune picks the
 * pitch: a little up and down through a sentence, a rise into a question, a lift on a shout, a fall at a full stop, softer through a
 * hesitation ("...").
 */
import { SPEAKER_VOICE, VOICES, type VoiceSpec } from './voiceData.ts';

export interface Syllable {
  /** which of the voice's takes */
  take: number;
  /** pitch, semitones from the take as recorded */
  semis: number;
  /** level, dB on the take's own */
  db: number;
}

/** the voice a speaker has, or null (the Narrator, and anyone without one, is read in silence) */
export function voiceOf(speaker: string): { slug: string; spec: VoiceSpec } | null {
  const slug = SPEAKER_VOICE[speaker];
  const spec = slug ? VOICES[slug] : undefined;
  return slug && spec ? { slug, spec } : null;
}

/** how far a voice's pitch wanders inside a sentence (semitones either side): the small ones chatter more, the big ones hardly move */
const RANGE: Readonly<Record<string, number>> = { dot: 3, flicker: 3, squirrel: 3, pell: 2.5, meeca: 2, queen: 2.5, golem: 0.7, thornbark: 1, general: 1.2 };

const isLetter = (c: string | undefined) => !!c && /[A-Za-z0-9\u00C0-\u00FF]/.test(c);

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** the syllable to play as letter `i` of `text` appears, or null; `lastAt` is the index of the letter the last syllable played on (-1) */
export function syllableAt(text: string, i: number, slug: string, spec: VoiceSpec, lastAt: number): Syllable | null {
  const c = text[i];
  if (!isLetter(c)) return null;
  // the word this letter is in, and where in it
  let a = i;
  while (a > 0 && isLetter(text[a - 1])) a--;
  let b = i;
  while (b < text.length - 1 && isLetter(text[b + 1])) b++;
  const into = i - a;
  if (into > 0 && (into % spec.every !== 0 || b - i < 1)) return null;
  if (lastAt >= 0 && i - lastAt < Math.max(1, spec.every - 1) && into > 0) return null;
  const word = text.slice(a, b + 1);
  const hw = hash(word.toLowerCase());
  const take = (hw + Math.floor(into / spec.every) * 3) % spec.takes;
  const range = RANGE[slug] ?? 1.5;
  // the sentence's tune: where the next stop is, and what kind
  let k = b + 1;
  while (k < text.length && !/[.!?…]/.test(text[k]) && !(text[k] === ',' && text[k + 1] === ' ')) k++;
  const stop = text[k];
  const lastWord = !/[A-Za-z]/.test(text.slice(b + 1, k));
  let semis = (((hw >> 5) % 5) - 2) * (range / 2) + (into > 0 ? 0.6 : 0);
  let db = 0;
  if (lastWord && stop === '?') semis += 3 + range / 2;
  else if (lastWord && stop === '.' && text[k + 1] !== '.') semis -= 1.5;
  else if (lastWord && stop === '!') semis += 1;
  if (text.slice(k, k + 3) === '...' || stop === '…') db -= 3;
  if (word.length > 1 && word === word.toUpperCase() && /[A-Z]/.test(word)) db += 3;
  if (/!/.test(text.slice(b + 1, k + 1))) db += 1.5;
  return { take, semis: Math.max(-5, Math.min(6, semis)), db };
}

/**
 * Who says a syllable when, across the letters of the lines as they type: the line's last syllable and when it played (s), so a voice
 * keeps its own gap. The game's conductor and the voice sample page both speak through one of these.
 */
export class Speech {
  private said = { text: '', at: -1, t: -10 };
  /** letter `index` of `text` has appeared at time `now` (s): the syllable to play, or null */
  next(speaker: string, text: string, index: number, now: number): { slug: string; syl: Syllable } | null {
    const v = voiceOf(speaker);
    if (!v) return null;
    if (this.said.text !== text) this.said = { text, at: -1, t: -10 };
    const syl = syllableAt(text, index, v.slug, v.spec, this.said.at);
    if (!syl || now - this.said.t < v.spec.gap / 1000) return null;
    return { slug: v.slug, syl };
  }
  /** the syllable did play */
  played(text: string, index: number, now: number) {
    this.said = { text, at: index, t: now };
  }
}

/** how fast a speaker's lines type (ms a letter): each voice its own pace, the Narrator at a reading pace */
export function typeMs(speaker: string): number {
  return voiceOf(speaker)?.spec.type ?? 30;
}

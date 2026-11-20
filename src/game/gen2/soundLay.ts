/**
 * gen2/soundLay — a SOUNDING thing as a piece any world lays (ENG-NOISE; 3-3.md's chime stone, 3-5.md's dripped stone): a prop socket
 * whose prop is in the world's sound table lays a SoundPost in the stage's cast (proto.cast.sounds). castPlay.ts makes its noise at its
 * place when a blow lands on it (engine.ts strike: only its sound, never his punch's) or when the stage fires it (CastPlay.ring), on the
 * one channel every cast animal hears. A world says what its sounding things ARE in one table of rows (`SoundRow`, by prop id: its box
 * and its noise); the look is the world's own (`note` hands each laid post to the world's extras, as lureLay.ts does).
 *   soundProps     the manifest's prop rows (tag 'sounding'), so a section's sockets ask by tag
 *   soundSocket    the world-neutral socket a section lists
 *   soundEmitters  what a filled socket lays: a SoundPost in the stage's cast
 * Nothing here is a stage's: no ids, no x (generalitycheck).
 */
import type { CastData, SoundPost } from '../castPlay.types.ts';
import type { PropDef, PropEmitter, Socket, StageSink } from './types.ts';
import { lookAt } from './stillLay.ts';

export const SOUND_TAG = 'sounding';

/** a sounding thing: its box over the surface it stands on (px, sized against Pokey by the world's art), and the noise it makes */
export interface SoundRow {
  w: number;
  h: number;
  sound?: SoundPost['sound'];
  minApart?: number;
  looks?: string[];
}

export const SOUND_LAY = { minApart: 600 } as const;

/** the manifest's prop rows for a world's sound table: each a beat (a thing to strike is something to do) */
export function soundProps(rows: Readonly<Record<string, SoundRow>>): PropDef[] {
  return Object.entries(rows).map(([id, r]) =>
    ({ id, tags: [SOUND_TAG], w: r.w, minApart: r.minApart ?? SOUND_LAY.minApart, beat: true, ...(r.looks ? { looks: r.looks } : {}) }));
}

/** a sounding-thing socket on a piece: any of the world's sounding things */
export const soundSocket = (id: string, on: string, t: Socket['t'] = 0.5, more: Partial<Socket> = {}): Socket =>
  ({ id, role: 'prop', on, t, allow: [SOUND_TAG], ...more });

const castOf = (out: StageSink): CastData => (out.proto.cast ??= { kinds: [], traps: [] });

/** the emitters for a world's sound table; `note` is where the world keeps what it draws */
export function soundEmitters(
  rows: Readonly<Record<string, SoundRow>>,
  note?: (out: StageSink, at: SoundPost & { look: string }) => void,
): Record<string, PropEmitter> {
  const emit: Record<string, PropEmitter> = {};
  for (const [id, row] of Object.entries(rows)) {
    emit[id] = (f, p, out) => {
      const post: SoundPost = { x: Math.round(f.x), y: f.y, w: row.w, h: row.h, sound: row.sound ?? 'bell' };
      (castOf(out).sounds ??= []).push(post);
      note?.(out, { ...post, look: lookAt(p, f.x, 23) });
    };
  }
  return emit;
}
